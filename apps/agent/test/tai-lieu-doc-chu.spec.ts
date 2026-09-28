import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import {
	chaySoanTuNguon,
	type PhienMaySoanVao,
} from "../agent/lib/tai-lieu-soan";
import type { LeasedTask } from "../agent/lib/tasks";

const MAU = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"may-soan-de-xuat",
	"mau",
);
const TIEN_TO = `msd6${(process.env.TEST_RUN_ID ?? "").slice(0, 6)}-`;
const LY_DO = TAI_LIEU_AGENT.lyDo;
let dem = 0;
const ma = (p: string) => `${TIEN_TO}${p}-${Date.now().toString(36)}-${++dem}`;

const gia = khoNguonGia();
const goiPhien: { vao: PhienMaySoanVao; trangThaiLucGoi: string }[] = [];
let nguoiId = "";
let trangId = "";

async function moPhien(vao: PhienMaySoanVao) {
	const n = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: vao.nguonId },
		select: { trangThai: true },
	});
	goiPhien.push({ vao, trangThaiLucGoi: n.trangThai });
	return { ok: true as const };
}

async function chay(tep: string, bamKhai?: string) {
	const byte = new Uint8Array(readFileSync(join(MAU, tep)));
	const kieu = tep.endsWith(".pdf") ? "pdf" : "docx";
	const pathname = ma("blob");
	const nguon = await db.taiLieuNguon.create({
		data: {
			sha256: bamKhai ?? createHash("sha256").update(byte).digest("hex"),
			tenTep: tep,
			kieu,
			kichThuoc: byte.length,
			blobPathname: pathname,
			taiBoiId: nguoiId,
			trangId,
		},
		select: { id: true },
	});
	gia.daPut.set(pathname, byte);
	const viec = await db.agentTask.create({
		data: {
			kind: "soan-tu-nguon",
			reason: "thu",
			priority: 300,
			budget: 0,
			dueAt: new Date(),
			payload: { nguonId: nguon.id },
		},
	});
	const truoc = goiPhien.length;
	const task: LeasedTask = {
		id: viec.id,
		contactId: null,
		companyId: null,
		dealId: null,
		kind: viec.kind,
		reason: viec.reason,
		payload: { nguonId: nguon.id },
		budget: 0,
		attempts: 1,
		priority: 300,
		dueAt: viec.dueAt,
	};
	await chaySoanTuNguon(task, { kho: gia, moPhien });
	const hang = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguon.id },
	});
	const xong = await db.agentTask.findUniqueOrThrow({ where: { id: viec.id } });
	return {
		hang,
		goiModel: goiPhien.length - truoc,
		lucGoi: goiPhien.at(-1)?.trangThaiLucGoi,
		xong: xong.finishedAt !== null,
	};
}

beforeAll(async () => {
	nguoiId = ma("u");
	await db.user.create({
		data: { id: nguoiId, name: "Người tải", email: `${nguoiId}@thu.test` },
	});
	const trang = await db.taiLieuTrang.create({
		data: {
			slug: ma("trang"),
			ten: "Trang thử",
			loai: "quy-dinh",
			chuTrangId: nguoiId,
			taoBoiId: nguoiId,
		},
	});
	trangId = trang.id;
});

afterAll(async () => {
	await db.agentTask.deleteMany({
		where: { kind: "soan-tu-nguon", reason: "thu" },
	});
	await db.taiLieuNguon.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.deleteMany({ where: { id: trangId } });
	await db.user.deleteMany({ where: { id: nguoiId } });
});

describe("doc-chu", () => {
	test("doc-chu: ma tran 9 ca viet truoc", async () => {
		const dong: string[] = [];
		const ghi = (ca: string, dat: boolean) => {
			dong.push(`${ca}: ${dat ? "dat" : "SAI"}`);
			expect(`${ca}: ${dat}`).toBe(`${ca}: true`);
		};
		for (const [tep, moc] of [
			["quyet-dinh.docx", ["1,5%", "01/10/2026", "Tầng hai", "1,8%"]],
			["quy-trinh.pdf", ["48 giờ", "01/10/2026", "Ngoại lệ"]],
		] as const) {
			const r = await chay(tep);
			const chu = r.hang.chu ?? "";
			ghi(
				tep,
				moc.every((m) => chu.includes(m)) &&
					chu === chu.normalize("NFC") &&
					r.goiModel === 1 &&
					r.lucGoi === "DANG_SOAN" &&
					r.xong,
			);
		}
		const theoDoi = await chay("theo-doi.docx");
		ghi(
			"theo-doi.docx",
			(theoDoi.hang.chu ?? "").includes("1,8%") &&
				!(theoDoi.hang.chu ?? "").includes("1,6%"),
		);
		for (const tep of ["ban-quet.pdf", "cid.pdf", "fffd.pdf"]) {
			const r = await chay(tep);
			const lot =
				tep === "cid.pdf" && r.goiModel > 0
					? " ban loi ma lot qua: cid.pdf"
					: "";
			ghi(
				`${tep}${lot}`,
				r.hang.trangThai === "CAN_GO_TAY" && r.goiModel === 0 && r.xong,
			);
		}
		for (const [tep, lyDo] of [
			["hong.docx", LY_DO.tepHong],
			["mat-khau.pdf", LY_DO.matKhau],
		] as const) {
			const r = await chay(tep);
			ghi(
				tep,
				r.hang.trangThai === "LOI" && r.hang.lyDo === lyDo && r.goiModel === 0,
			);
		}
		const lech = await chay("quyet-dinh.docx", "0".repeat(64));
		ghi(
			"bam-lech",
			lech.hang.trangThai === "LOI" &&
				lech.hang.lyDo === LY_DO.bamLech &&
				lech.goiModel === 0,
		);
		for (const d of dong) console.log(d);
		expect(dong.length).toBe(9);
	});
});
