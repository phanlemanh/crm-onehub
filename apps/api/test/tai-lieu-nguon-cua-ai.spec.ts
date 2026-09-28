import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";
import { db } from "@crm/db";
import { PATHNAME_NGUON } from "@crm/db/blob-nguon";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { bam, docxNho } from "./tai-lieu-nguon-mau";
import {
	type Ai,
	dungSan,
	goi,
	type Json,
	ma,
	ok,
	phien,
	type TraLoi,
} from "./tai-lieu-san";

const gia = khoNguonGia();
dungSan(gia);

const GHIM = "xoa tep nguon cua nguoi khac";

type Cho = { pathname: string; phieu?: string };

async function xinCho(ai: Ai, tenTep: string, byte: Uint8Array): Promise<Cho> {
	const cho = ok<Cho>(
		await goi(
			"taiLieuNguon.xinCho",
			{ tenTep, kieu: "docx", kichThuoc: byte.length },
			ai,
		),
		`xin cho ${tenTep}`,
	);
	gia.daPut.set(cho.pathname, byte);
	return cho;
}

const nhan = (ai: Ai, cho: Cho, dich: Json): Promise<TraLoi> =>
	goi(
		"taiLieuNguon.nhan",
		{
			pathname: cho.pathname,
			tenTep: "hoa-hong.docx",
			dich,
			...(cho.phieu ? { phieu: cho.phieu } : {}),
		},
		ai,
	);

const dichMoi = (): Json => ({
	loai: "moi",
	ten: ma("Trang moi"),
	loaiTrang: "quy-dinh",
	chuTrangId: phien.chu.nguoi,
});
const DICH_SAI: Json = { loai: "cap-nhat", slug: "khong-co-trang-nay" };

async function dem() {
	const [nguon, viec] = await Promise.all([
		db.taiLieuNguon.count(),
		db.agentTask.count({ where: { kind: "soan-tu-nguon" } }),
	]);
	return { nguon, viec, xoa: gia.daXoa.length };
}

type Ca = {
	ca: string;
	chay: (p1: Cho) => Promise<{ tra: TraLoi; duocXoa: string | null }>;
};

describe("nguon-cua-ai", () => {
	test("nguon-cua-ai: chi duong luu vua cap cho chinh nguoi goi moi duoc nhan hay xoa", async () => {
		const byteN1 = docxNho(`Quy định ${randomUUID()} tầng hai 1,5%.`);
		const choN1 = await xinCho("tao", "n1.docx", byteN1);
		const n1 = ok<{ nguonId: string; trung: boolean }>(
			await nhan("tao", choN1, dichMoi()),
			"nhan n1",
		);
		expect(n1.trung).toBe(false);
		const hangN1 = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: n1.nguonId },
			select: { blobPathname: true, sha256: true },
		});
		const p1: Cho = { pathname: hangN1.blobPathname };

		const CA: Ca[] = [
			{
				ca: "khac-p1-dich-sai",
				chay: async (p) => ({
					tra: await nhan("khac", p, DICH_SAI),
					duocXoa: null,
				}),
			},
			{
				ca: "khac-p1-trung-byte",
				chay: async (p) => ({
					tra: await nhan("khac", p, dichMoi()),
					duocXoa: null,
				}),
			},
			{
				ca: "okr-p1",
				chay: async (p) => ({
					tra: await nhan("okr", p, dichMoi()),
					duocXoa: null,
				}),
			},
			{
				ca: "khac-chua-cap",
				chay: async () => {
					const la = { pathname: PATHNAME_NGUON(randomUUID()) };
					gia.daPut.set(la.pathname, docxNho(`Lạ ${randomUUID()}`));
					return { tra: await nhan("khac", la, DICH_SAI), duocXoa: null };
				},
			},
			{
				ca: "khac-phieu-cua-tao",
				chay: async () => {
					const choTao = await xinCho(
						"tao",
						"cua-tao.docx",
						docxNho(`Của người tải ${randomUUID()}`),
					);
					return { tra: await nhan("khac", choTao, DICH_SAI), duocXoa: null };
				},
			},
			{
				ca: "doi-chung-khac-tu-xin",
				chay: async () => {
					const choKhac = await xinCho(
						"khac",
						"cua-khac.docx",
						docxNho(`Của người khác ${randomUUID()}`),
					);
					return {
						tra: await nhan("khac", choKhac, DICH_SAI),
						duocXoa: choKhac.pathname,
					};
				},
			},
		];

		const loi: string[] = [];
		for (const c of CA) {
			const truoc = await dem();
			const xoaTruoc = gia.daXoa.length;
			const { tra, duocXoa } = await c.chay(p1);
			const sau = await dem();
			const daXoa = gia.daXoa.slice(xoaTruoc);
			if (tra.status < 400) loi.push(`${c.ca}: duoc nhan (${tra.status})`);
			if (daXoa.includes(p1.pathname)) loi.push(`${GHIM}: ${c.ca}`);
			const khac = daXoa.filter((x) => x !== duocXoa);
			if (khac.length > 0) loi.push(`${c.ca}: xoa la ${khac.join(", ")}`);
			if (duocXoa && !daXoa.includes(duocXoa))
				loi.push(`${c.ca}: khong xoa tep vua tai cua chinh minh`);
			if (sau.nguon !== truoc.nguon || sau.viec !== truoc.viec)
				loi.push(`${c.ca}: ghi hang moi`);
		}
		expect(loi).toEqual([]);

		const ve = ok<{ url: string }>(
			await goi("taiLieuNguon.taiVe", { id: n1.nguonId }, "tao"),
			"tai ve n1",
		);
		expect(ve.url.length).toBeGreaterThan(0);
		const conLai = await gia.doc(hangN1.blobPathname);
		expect(conLai, "tep cua n1 da mat").not.toBeNull();
		expect(bam(conLai ?? new Uint8Array())).toBe(hangN1.sha256);
		expect(bam(byteN1)).toBe(hangN1.sha256);
	});
});
