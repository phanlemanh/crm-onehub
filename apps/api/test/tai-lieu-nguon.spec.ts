import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { dongNguonMoCoi } from "@crm/db/tai-lieu-nguon-mo-coi";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { NGUON } from "@crm/validation/tai-lieu-nguon";
import { bam, docxNho, pdfNho, pngNho, zipLuu } from "./tai-lieu-nguon-mau";
import {
	type Ai,
	dungSan,
	duyet,
	goi,
	type Json,
	ma,
	ok,
	phien,
	type TraLoi,
	taoTrang,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const T = NGUON.thongDiep;
const GOC = join(import.meta.dir, "..", "..", "..");

type Kieu = "docx" | "pdf";

async function xinCho(
	ai: Ai,
	tenTep: string,
	kieu: Kieu,
	kichThuoc: number,
): Promise<TraLoi> {
	return goi("taiLieuNguon.xinCho", { tenTep, kieu, kichThuoc }, ai);
}

async function taiLen(
	ai: Ai,
	byte: Uint8Array,
	tenTep: string,
	kieu: Kieu,
	dich: Json,
	them: Record<string, Json> = {},
	kichThuocKhai = byte.length,
): Promise<{ tra: TraLoi; pathname: string }> {
	const cho = ok<{ pathname: string; phieu: string }>(
		await xinCho(ai, tenTep, kieu, kichThuocKhai),
		`xin cho ${tenTep}`,
	);
	gia.daPut.set(cho.pathname, byte);
	const tra = await goi(
		"taiLieuNguon.nhan",
		{ pathname: cho.pathname, tenTep, dich, phieu: cho.phieu, ...them },
		ai,
	);
	return { tra, pathname: cho.pathname };
}

function dichMoi(ten: string): Json {
	return {
		loai: "moi",
		ten,
		loaiTrang: "quy-dinh",
		chuTrangId: phien.chu.nguoi,
	};
}

async function trangDangDung(): Promise<string> {
	const { slug, deXuatId } = await taoTrang(
		ma("Dang dung"),
		"## Mot\n\nBan dau.",
	);
	await duyet(deXuatId, "chu");
	return slug;
}

async function demNguon() {
	const [nguon, viec, trang] = await Promise.all([
		db.taiLieuNguon.count(),
		db.agentTask.count({ where: { kind: "soan-tu-nguon" } }),
		db.taiLieuTrang.count(),
	]);
	return { nguon, viec, trang };
}

async function viecCua(nguonId: string): Promise<number> {
	return db.agentTask.count({
		where: {
			kind: "soan-tu-nguon",
			payload: { path: ["nguonId"], equals: nguonId },
		},
	});
}

function coUrl(hang: {
	tenTep: string;
	blobPathname: string;
	sha256: string;
	lyDo: string | null;
	chu: string | null;
}): string[] {
	const cot = {
		tenTep: hang.tenTep,
		blobPathname: hang.blobPathname,
		sha256: hang.sha256,
		lyDo: hang.lyDo ?? "",
		chu: hang.chu ?? "",
	};
	return Object.entries(cot)
		.filter(([, v]) => /https?:/.test(v))
		.map(([k]) => k);
}

describe("nguon-nhan", () => {
	const CA = [
		["docx", "moi", "tao"],
		["docx", "cap-nhat", "okr"],
		["pdf", "moi", "okr"],
		["pdf", "cap-nhat", "tao"],
	] as const;

	for (const [kieu, loaiDich, ai] of CA) {
		test(`nguon-nhan: ${kieu} x ${loaiDich} boi ${ai}`, async () => {
			const byte = kieu === "docx" ? docxNho(ma("chu")) : pdfNho(ma("chu"));
			const dich =
				loaiDich === "moi"
					? dichMoi(ma("Moi"))
					: { loai: "cap-nhat", slug: await trangDangDung() };
			const truoc = await demNguon();
			const { tra } = await taiLen(ai, byte, `nguon.${kieu}`, kieu, dich, {
				sha256: "0".repeat(64),
			});
			const { nguonId, trung } = ok<{ nguonId: string; trung: boolean }>(
				tra,
				`nhan ${kieu} ${loaiDich}`,
			);
			expect(trung).toBe(false);
			const sau = await demNguon();
			expect(sau.nguon - truoc.nguon).toBe(1);
			expect(sau.viec - truoc.viec).toBe(1);
			expect(await viecCua(nguonId)).toBe(1);
			const hang = await db.taiLieuNguon.findUniqueOrThrow({
				where: { id: nguonId },
				include: { trang: { select: { banDangDungId: true } } },
			});
			expect(
				hang.sha256 === bam(byte) ? "khop" : "sha256 khong khop byte da luu",
			).toBe("khop");
			expect(hang.sha256).not.toBe("0".repeat(64));
			expect(hang.taiBoiId).toBe(phien[ai].nguoi);
			expect(hang.kieu).toBe(kieu);
			expect(hang.kichThuoc).toBe(byte.length);
			expect(coUrl(hang)).toEqual([]);
			if (loaiDich === "moi") {
				expect(hang.trang.banDangDungId).toBeNull();
				expect(sau.trang - truoc.trang).toBe(1);
			} else {
				expect(sau.trang - truoc.trang).toBe(0);
			}
		});
	}

	test("nguon-nhan: cong Blob that luon ghi private, khong public", () => {
		const nguonKho = readFileSync(
			join(GOC, "packages", "db", "src", "blob-nguon.ts"),
			"utf8",
		);
		const loi = (ma: string) => [
			...(ma.match(/access:\s*"private"/g)?.length === 3
				? []
				: ["thieu access private"]),
			...(/access:\s*"public"/.test(ma) ? ["co access public"] : []),
		];
		expect(
			loi(nguonKho.replace('access: "private"', 'access: "public"')),
		).toEqual(["thieu access private", "co access public"]);
		expect(loi(nguonKho)).toEqual([]);
	});
});

describe("nguon-tu-choi", () => {
	test("nguon-tu-choi: ma tran sau ca, khong ghi gi va don blob", async () => {
		const chuaDuyet = await taoTrang(ma("Chua duyet"), "## Mot\n\nBan dau.");
		const truoc = await demNguon();
		const nhanLoi = async (
			ca: string,
			byte: Uint8Array,
			tenTep: string,
			kieu: Kieu,
			dich: Json,
			thongDiep: string,
		) => {
			const khai = Math.min(byte.length, NGUON.toiDaByte);
			const { tra, pathname } = await taiLen(
				"tao",
				byte,
				tenTep,
				kieu,
				dich,
				{},
				Math.max(khai, 1),
			);
			expect(
				tra.status === 400 ? `${ca}: ${tra.loi}` : `nhan tep sai loai: ${ca}`,
			).toBe(`${ca}: ${thongDiep}`);
			expect(gia.daXoa).toContain(pathname);
		};
		await nhanLoi(
			"png-doi-duoi",
			pngNho(),
			"anh.pdf",
			"pdf",
			dichMoi(ma("A")),
			T.saiLoai,
		);
		await nhanLoi(
			"zip-khong-word",
			zipLuu([["a.txt", "x"]]),
			"gia.docx",
			"docx",
			dichMoi(ma("B")),
			T.saiLoai,
		);
		const doc = await xinCho("tao", "cu.doc", "docx", 10);
		expect(`${doc.status} ${doc.loi}`).toBe(`400 ${T.saiLoai}`);
		const rong = await xinCho("tao", "rong.pdf", "pdf", 0);
		expect(`${rong.status} ${rong.loi}`).toBe(`400 ${T.rong}`);
		const to = await xinCho("tao", "to.pdf", "pdf", NGUON.toiDaByte + 1);
		expect(`${to.status} ${to.loi}`).toBe(`400 ${T.saiLoai}`);
		const lon = new Uint8Array(NGUON.toiDaByte + 1);
		lon.set(pdfNho("lon"));
		await nhanLoi("qua-co", lon, "lon.pdf", "pdf", dichMoi(ma("C")), T.saiLoai);
		await nhanLoi(
			"dich-chua-dung",
			docxNho(ma("chu")),
			"dich.docx",
			"docx",
			{ loai: "cap-nhat", slug: chuaDuyet.slug },
			T.dichChuaDung,
		);
		expect(await demNguon()).toEqual(truoc);
	});

	test("nguon-tu-choi: doi chung, tep dung 20 MB duoc nhan", async () => {
		const vua = new Uint8Array(NGUON.toiDaByte);
		vua.set(pdfNho(ma("vua")));
		const { tra } = await taiLen(
			"tao",
			vua,
			"vua.pdf",
			"pdf",
			dichMoi(ma("D")),
		);
		ok(tra, "nhan 20 MB");
	});
});

describe("nguon-trung", () => {
	test("nguon-trung: cung byte tra nguon cu, khac mot byte la nguon moi", async () => {
		const slug = await trangDangDung();
		const a = docxNho(ma("A"));
		const dich = { loai: "cap-nhat", slug };
		const n1 = ok<{ nguonId: string; trung: boolean }>(
			(await taiLen("tao", a, "a.docx", "docx", dich)).tra,
			"lan 1",
		);
		const truoc = await demNguon();
		const lan2 = await taiLen("khac", a, "ten-khac.docx", "docx", dich);
		const n2 = ok<{ nguonId: string; trung: boolean }>(lan2.tra, "lan 2");
		expect(
			n2.trung && n2.nguonId === n1.nguonId
				? "tra nguon cu"
				: "nguon trung sinh hang moi",
		).toBe("tra nguon cu");
		expect(await demNguon()).toEqual(truoc);
		expect(gia.daXoa).toContain(lan2.pathname);
		const b = new Uint8Array([...a, 0]);
		const n3 = ok<{ nguonId: string; trung: boolean }>(
			(await taiLen("tao", b, "a.docx", "docx", dich)).tra,
			"lan 3",
		);
		expect(n3.trung).toBe(false);
		expect(n3.nguonId).not.toBe(n1.nguonId);
		expect((await demNguon()).viec - truoc.viec).toBe(1);
	});

	test("nguon-trung: khong thu tuc nao sua ten tep, bam, blob, nguoi tai", () => {
		const dichVu = readFileSync(
			join(GOC, "apps", "api", "src", "tai-lieu", "tai-lieu-nguon.service.ts"),
			"utf8",
		);
		const suaDuoc = (ma: string) => {
			const loi: string[] = [];
			if (/taiLieuNguon\s*\.\s*(delete|deleteMany|upsert)\s*\(/.test(ma)) {
				loi.push("xoa duoc nguon");
			}
			for (const m of ma.matchAll(
				/taiLieuNguon\s*\.\s*update(?:Many)?\s*\(\s*\{[\s\S]*?data:\s*\{([^}]*)\}/g,
			)) {
				for (const cot of ["tenTep", "sha256", "blobPathname", "taiBoiId"]) {
					if (new RegExp(`\\b${cot}\\b`).test(m[1] ?? "")) {
						loi.push(`sua duoc nguon: ${cot}`);
					}
				}
			}
			return loi;
		};
		const pha = dichVu.replace(
			'data: { trangThai: "CHO_DOC", lyDo: null }',
			'data: { trangThai: "CHO_DOC", lyDo: null, tenTep: "x" }',
		);
		expect(suaDuoc(pha)).toEqual(["sua duoc nguon: tenTep"]);
		expect(suaDuoc(dichVu)).toEqual([]);
	});
});

describe("soan-lai", () => {
	test("soan-lai: nguoi tai va nguoi duyet soan lai duoc, nguoi khac khong", async () => {
		const slug = await trangDangDung();
		const { nguonId } = ok<{ nguonId: string }>(
			(
				await taiLen("tao", docxNho(ma("L")), "l.docx", "docx", {
					loai: "cap-nhat",
					slug,
				})
			).tra,
			"nhan",
		);
		const datLoi = async () => {
			await db.agentTask.updateMany({
				where: { kind: "soan-tu-nguon", finishedAt: null },
				data: { finishedAt: new Date(), outcome: "thu" },
			});
			await db.taiLieuNguon.update({
				where: { id: nguonId },
				data: { trangThai: "LOI", lyDo: "Model báo lỗi." },
			});
		};
		for (const ai of ["tao", "chu", "owner", "admin"] as const) {
			await datLoi();
			const truoc = await viecCua(nguonId);
			ok(
				await goi("taiLieuNguon.soanLai", { id: nguonId }, ai),
				`soan lai ${ai}`,
			);
			expect(await viecCua(nguonId)).toBe(truoc + 1);
			const h = await db.taiLieuNguon.findUniqueOrThrow({
				where: { id: nguonId },
			});
			expect(h.trangThai).toBe("CHO_DOC");
		}
		for (const ai of ["khac", "okr"] as const) {
			await datLoi();
			const truoc = await viecCua(nguonId);
			const tra = await goi("taiLieuNguon.soanLai", { id: nguonId }, ai);
			expect(`${ai} ${tra.status} ${tra.loi}`).toBe(`${ai} 404 ${T.khongCo}`);
			expect(await viecCua(nguonId)).toBe(truoc);
		}
		await db.taiLieuNguon.update({
			where: { id: nguonId },
			data: { trangThai: "DANG_SOAN" },
		});
		const truoc = await viecCua(nguonId);
		const dang = await goi("taiLieuNguon.soanLai", { id: nguonId }, "tao");
		expect(`${dang.status} ${dang.loi}`).toBe(`409 ${T.dangSoan}`);
		expect(await viecCua(nguonId)).toBe(truoc);
	});
});

const CAU_MO_COI = "Máy soạn dừng giữa chừng — bấm Soạn lại để thử lần nữa.";
const CAU_DOC_LOI = "Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.";

describe("kn-soan-lai", () => {
	test("kn-soan-lai: nguon ve LOI do luoi mo coi va do doc tep loi deu soan lai duoc", async () => {
		const slug = await trangDangDung();
		const sai: string[] = [];
		for (const o of ["mo-coi", "doc-loi"] as const) {
			const { nguonId } = ok<{ nguonId: string }>(
				(
					await taiLen("tao", docxNho(ma(`K-${o}`)), `${o}.docx`, "docx", {
						loai: "cap-nhat",
						slug,
					})
				).tra,
				`nhan ${o}`,
			);
			await db.agentTask.updateMany({
				where: {
					kind: "soan-tu-nguon",
					finishedAt: null,
					payload: { path: ["nguonId"], equals: nguonId },
				},
				data: { finishedAt: new Date(), outcome: "thu" },
			});
			if (o === "mo-coi") {
				expect(await dongNguonMoCoi(db, CAU_MO_COI)).toBeGreaterThanOrEqual(1);
			} else {
				await db.taiLieuNguon.update({
					where: { id: nguonId },
					data: { trangThai: "LOI", lyDo: CAU_DOC_LOI },
				});
			}
			const loi = await db.taiLieuNguon.findUniqueOrThrow({
				where: { id: nguonId },
			});
			expect(`${o} ${loi.trangThai} ${loi.lyDo}`).toBe(
				`${o} LOI ${o === "mo-coi" ? CAU_MO_COI : CAU_DOC_LOI}`,
			);
			const tra = await goi("taiLieuNguon.soanLai", { id: nguonId }, "tao");
			if (tra.status !== 200) {
				sai.push(
					`kn-soan-lai: nguon LOI khong soan lai duoc (${o}: ${tra.status} ${tra.loi})`,
				);
				continue;
			}
			const sau = await db.taiLieuNguon.findUniqueOrThrow({
				where: { id: nguonId },
			});
			const mo = await db.agentTask.count({
				where: {
					kind: "soan-tu-nguon",
					finishedAt: null,
					payload: { path: ["nguonId"], equals: nguonId },
				},
			});
			if (`${sau.trangThai} ${sau.lyDo} ${mo}` !== "CHO_DOC null 1") {
				sai.push(`${o}: sau soan lai ${sau.trangThai} ${sau.lyDo} ${mo}`);
			}
		}
		expect(sai).toEqual([]);
	});
});
