import { afterAll, describe, expect, test } from "bun:test";
import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	bocPhanHoiKeoVe,
	type KeoVeOutput,
	keoVeOutput,
	TIN_HIEU,
	tepTuBanGhi,
} from "../../../packages/validation/src/tin-hieu.ts";
import { chayKeoVe, DUONG_KEO_VE } from "../keo-ve.ts";

const KHOA_LICH = "crm_khoaLichBiMatKhongDuocIn0123456789";
const KHOA_TAY = "crm_khoaTayBiMatKhongDuocIn9876543210";
const MS_GIO = 3_600_000;
const tam: string[] = [];
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

function khoTam(): string {
	const r = mkdtempSync(path.join(tmpdir(), "tvk-lenh-"));
	tam.push(r);
	return r;
}

function mot(
	so: number,
	luc: Date,
	keoVeLuc: string,
): KeoVeOutput["tep"][number] {
	return {
		id: `crm-${so}`,
		tep: tepTuBanGhi({
			tieuDe: `gap ${so}`,
			muonLam: `muon ${so}`,
			daXayRa: `gap ${so}`,
			man: "/okr",
			guiLuc: luc,
		}),
		phongBan: null,
		keoVeLuc,
	};
}

function mayChu(phanHoi: KeoVeOutput) {
	const nhan: { duong: string; khoa: string | null }[] = [];
	const than = keoVeOutput.parse(JSON.parse(JSON.stringify(phanHoi)));
	const sv = Bun.serve({
		port: 0,
		fetch: (req) => {
			nhan.push({
				duong: new URL(req.url).pathname,
				khoa: req.headers.get("x-api-key"),
			});
			return Response.json(than);
		},
	});
	return {
		url: `http://localhost:${sv.port}`,
		nhan,
		dung: () => sv.stop(true),
	};
}

const DAU = new Date("2026-10-14T21:00:00.000Z");
const PHAN_HOI = bocPhanHoiKeoVe(
	[
		mot(1, new Date(DAU.getTime() - 100 * MS_GIO), "2026-10-10T21:00:00.000Z"),
		mot(2, new Date(DAU.getTime() - 30 * MS_GIO), DAU.toISOString()),
		mot(3, new Date(DAU.getTime() - 2 * MS_GIO), DAU.toISOString()),
	],
	DAU.toISOString(),
);

function khongLoKhoa(chu: string) {
	expect(chu.includes(KHOA_LICH), "dau ra mang chuoi khoa").toBe(false);
	expect(chu.includes(KHOA_TAY), "dau ra mang chuoi khoa").toBe(false);
}

describe("tvk-lenh", () => {
	const O = [
		{
			ten: "chi lich",
			khoaLich: KHOA_LICH,
			key: undefined,
			duong: DUONG_KEO_VE.lich,
			khoa: KHOA_LICH,
		},
		{
			ten: "chi tay",
			khoaLich: undefined,
			key: KHOA_TAY,
			duong: DUONG_KEO_VE.tay,
			khoa: KHOA_TAY,
		},
		{
			ten: "ca hai",
			khoaLich: KHOA_LICH,
			key: KHOA_TAY,
			duong: DUONG_KEO_VE.lich,
			khoa: KHOA_LICH,
		},
		{
			ten: "lich co xuong dong cuoi",
			khoaLich: `${KHOA_LICH}\n`,
			key: undefined,
			duong: DUONG_KEO_VE.lich,
			khoa: KHOA_LICH,
		},
	] as const;

	for (const o of O) {
		test(`tvk-lenh: ${o.ten} goi dung duong voi dung khoa`, async () => {
			const sv = mayChu(PHAN_HOI);
			const kq = await chayKeoVe({
				root: khoTam(),
				url: sv.url,
				key: o.key,
				khoaLich: o.khoaLich,
				now: DAU,
			});
			sv.dung();
			expect(kq.ma).toBe(0);
			expect(sv.nhan).toEqual([{ duong: o.duong, khoa: o.khoa }]);
			khongLoKhoa(JSON.stringify(kq));
		});
	}

	test("tvk-lenh: thieu ca hai khoa thi ma 2 goi ten hai bien, khong ghi tep", async () => {
		const r = khoTam();
		const kq = await chayKeoVe({
			root: r,
			url: "http://localhost:9",
			key: undefined,
			khoaLich: "   ",
			now: DAU,
		});
		expect(kq.ma).toBe(2);
		expect(kq.loi).toContain("CRM_KHOA_KEO_TIN_HIEU");
		expect(kq.loi).toContain("CRM_API_KEY");
		expect(existsSync(path.join(r, TIN_HIEU.thuMucNguon))).toBe(false);
	});

	test("tvk-lenh: CRM tra loi thi loi khong mang khoa", async () => {
		const sv = Bun.serve({
			port: 0,
			fetch: () => new Response("{}", { status: 500 }),
		});
		const kq = await chayKeoVe({
			root: khoTam(),
			url: `http://localhost:${sv.port}`,
			key: KHOA_TAY,
			khoaLich: KHOA_LICH,
			now: DAU,
		});
		sv.stop(true);
		expect(kq.ma).toBe(2);
		expect(kq.loi).toContain("500");
		khongLoKhoa(JSON.stringify(kq));
	});

	test("tvk-lenh: tong ket dem tin hieu vua dong dau va cho lau nhat tu luc gui", async () => {
		const r = khoTam();
		const sv = mayChu(PHAN_HOI);
		const kq = await chayKeoVe({
			root: r,
			url: sv.url,
			key: undefined,
			khoaLich: KHOA_LICH,
			now: DAU,
		});
		sv.dung();
		expect(readdirSync(path.join(r, TIN_HIEU.thuMucNguon)).length).toBe(3);
		expect(kq.tongKet, "cho lau nhat tinh ca tin hieu da dau truoc").toContain(
			"đóng dấu lượt này: 2 · chờ lâu nhất: 30 giờ",
		);
	});

	test("tvk-lenh: khong dong dau gi thi tong ket noi 0", async () => {
		const sv = mayChu(bocPhanHoiKeoVe(PHAN_HOI.tep, null));
		const kq = await chayKeoVe({
			root: khoTam(),
			url: sv.url,
			key: undefined,
			khoaLich: KHOA_LICH,
			now: DAU,
		});
		sv.dung();
		expect(kq.tongKet).toContain("đóng dấu lượt này: 0");
	});
});
