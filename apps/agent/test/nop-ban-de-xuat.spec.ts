import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { BanNop } from "../agent/lib/tai-lieu-nop";
import { ctxMaySoan, nop } from "./support/may-soan-gia";
import {
	datBanDangDung,
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	ma,
} from "./support/tai-lieu-gieo";

const CAU_MOT =
	"Kể từ ngày 01/10/2026, công ty đối tác tầng hai hưởng 1,5% giá trị giao dịch.";
const NGUON = [
	CAU_MOT,
	"Mức thưởng tối đa là 12% hoặc 11,5 triệu đồng mỗi quý.",
	"Nhân viên phải hoà giải trước khi báo cáo.",
	"Quy trình này gọi là “một cửa”.",
].join("\n");

type Ca = {
	ca: string;
	noiDung: string;
	trich: string[];
	chu?: string;
	banGoc?: string;
	bac?: string;
};

const CA: Ca[] = [
	{
		ca: "dat",
		noiDung: "Từ 01/10/2026, tầng hai hưởng 1,5%.",
		trich: [CAU_MOT],
	},
	{
		ca: "so-moi",
		noiDung: "Tầng hai hưởng 2,0%.",
		trich: [CAU_MOT],
		bac: "2,0%",
	},
	{
		ca: "trich-khong-co",
		noiDung: "Tầng hai hưởng 1,5%.",
		trich: [CAU_MOT, "tầng 4 là 2%"],
		bac: "tầng 4 là 2%",
	},
	{
		ca: "dau-thanh",
		noiDung: "Nhân viên phải hòa giải trước.",
		trich: ["Nhân viên phải hòa giải trước khi báo cáo."],
	},
	{
		ca: "nbsp",
		noiDung: "Tầng hai hưởng 1,5%.",
		trich: ["tầng hai hưởng 1,5% giá trị giao dịch"],
		chu: "Công ty đối tác tầng hai hưởng 1,5% giá trị giao dịch.",
	},
	{
		ca: "nhay",
		noiDung: 'Quy trình gọi là "một cửa".',
		trich: ['Quy trình này gọi là "một cửa".'],
	},
	{
		ca: "ngay-va-phan-tram",
		noiDung: "Áp dụng từ 01/10/2026 với mức 1,5%.",
		trich: [CAU_MOT],
	},
	{
		ca: "so-trong-ban-goc",
		noiDung: "## Thời hạn\n\nThời hạn xử lý 48 giờ.",
		trich: [],
		banGoc: "## Thời hạn\n\nThời hạn xử lý 48 giờ.",
	},
	{
		ca: "danh-sach",
		noiDung: "1. Bước một\n2. Bước hai\n3. Bước ba",
		trich: [],
	},
	{
		ca: "bien-20",
		noiDung: "Mức giảm 20%.",
		trich: ["Kể từ ngày 01/10/2026"],
		bac: "20%",
	},
	{
		ca: "bien-2",
		noiDung: "Mức thưởng 2%.",
		trich: ["Mức thưởng tối đa là 12%"],
		bac: "2%",
	},
	{
		ca: "bien-1-5",
		noiDung: "Khoản hỗ trợ 1,5 triệu đồng.",
		trich: ["11,5 triệu đồng"],
		bac: "1,5",
	},
];

let nguoiId = "";
let trangId = "";

beforeAll(async () => {
	nguoiId = await gieoNguoi();
	trangId = await gieoTrang(nguoiId);
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

async function banGocCho(noiDung: string): Promise<string> {
	const t = await gieoTrang(nguoiId);
	await datBanDangDung(t, nguoiId, noiDung);
	const { banDangDungId } = await db.taiLieuTrang.findUniqueOrThrow({
		where: { id: t },
		select: { banDangDungId: true },
	});
	if (!banDangDungId) throw new Error("khong dat duoc ban goc");
	return banDangDungId;
}

async function chayCa(c: Ca): Promise<string | null> {
	const banGocId = c.banGoc ? await banGocCho(c.banGoc) : null;
	const nguon = await gieoNguon({
		tep: "quyet-dinh.docx",
		trangId,
		taiBoiId: nguoiId,
		bamKhai: ma("sha"),
		trangThai: "DANG_SOAN",
		chu: c.chu ?? NGUON,
		banGocId,
	});
	const ban: BanNop = {
		ten: `Trang ${c.ca}`,
		noiDung: c.noiDung,
		trichDoan: c.trich.map((t, i) => ({
			menhDe: `Mệnh đề ${i + 1}`,
			trich: t,
		})),
	};
	const truoc = await db.taiLieuDeXuat.count();
	const loi = await nop(ban, ctxMaySoan(nguon.id, ma("phien")));
	const sau = await db.taiLieuDeXuat.count();
	if (loi !== null && sau !== truoc) return `bac ma van ghi: ${c.ca}`;
	if (loi === null && sau !== truoc + 1) return `dat ma khong ghi: ${c.ca}`;
	if (c.bac === undefined) return loi === null ? null : `bac oan: ${c.ca}`;
	if (loi === null) {
		return c.ca === "trich-khong-co"
			? `trich lot: ${c.bac}`
			: `so khop mot phan: ${c.bac}`;
	}
	return loi.includes(c.bac) ? null : `thong diep thieu ${c.bac}: ${loi}`;
}

describe("nop-ban-de-xuat", () => {
	test("kiem-so qua execute cua tool: ma tran 12 ca viet truoc", async () => {
		expect(CA.length).toBe(12);
		const loi: string[] = [];
		for (const c of CA) {
			const r = await chayCa(c);
			console.log(`${c.ca}: ${r ?? "dat"}`);
			if (r) loi.push(r);
		}
		expect(loi).toEqual([]);
	});
});
