import { afterAll, describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	bocPhanHoiKeoVe,
	type KeoVeOutput,
	TIN_HIEU,
	tepTuBanGhi,
} from "../../../packages/validation/src/tin-hieu.ts";
import { chayKeoVe } from "../keo-ve.ts";

const MAU = path.join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"apps",
	"app",
	"test",
	"fixtures",
	"tin-hieu",
	"LO-TRINH.mau.html",
);
const tam: string[] = [];
afterAll(() => {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
});

function khoTam(coBanVe = false): string {
	const r = mkdtempSync(path.join(tmpdir(), "gth-keo-ve-"));
	tam.push(r);
	if (coBanVe) copyFileSync(MAU, path.join(r, "LO-TRINH.html"));
	return r;
}

type Mau = { so: number; luc: string; phongBan: string | null };

function danhSach(ds: Mau[]): KeoVeOutput["tep"] {
	return ds.map((x) => ({
		id: `crm-${x.so}`,
		tep: tepTuBanGhi({
			tieuDe: `gap ${x.so}`,
			muonLam: `muon ${x.so}`,
			daXayRa: `gap ${x.so}`,
			man: "/okr",
			guiLuc: new Date(x.luc),
		}),
		phongBan: x.phongBan,
	}));
}

function mayChu(ds: KeoVeOutput["tep"]) {
	const sv = Bun.serve({
		port: 0,
		fetch: (req) =>
			req.headers.get("x-api-key") === "khoa-thu"
				? Response.json(bocPhanHoiKeoVe(ds))
				: new Response("{}", { status: 401 }),
	});
	return { url: `http://localhost:${sv.port}`, dung: () => sv.stop(true) };
}

function anh(r: string): Record<string, string> {
	const d = path.join(r, TIN_HIEU.thuMucNguon);
	if (!existsSync(d)) return {};
	return Object.fromEntries(
		readdirSync(d).map((f) => [
			f,
			createHash("sha256")
				.update(readFileSync(path.join(d, f)))
				.digest("hex"),
		]),
	);
}

const BA = danhSach([
	{ so: 1, luc: "2026-10-14T03:00:00Z", phongBan: "Kinh doanh" },
	{ so: 2, luc: "2026-10-15T03:00:00Z", phongBan: null },
	{ so: 3, luc: "2026-10-16T03:00:00Z", phongBan: "Nhân sự" },
]);
const NOW = new Date("2026-10-20T00:00:00Z");

describe("gth-lenh-keo-ve", () => {
	test("lan 1 ghi N tep, lan 2 khong tep moi va cung byte", async () => {
		const r = khoTam();
		const sv = mayChu(BA);
		const a = await chayKeoVe({
			root: r,
			url: sv.url,
			key: "khoa-thu",
			now: NOW,
		});
		expect(a.ma).toBe(0);
		expect(a.moi).toBe(3);
		const truoc = anh(r);
		expect(Object.keys(truoc).sort()).toEqual([
			"crm-1.json",
			"crm-2.json",
			"crm-3.json",
		]);
		const b = await chayKeoVe({
			root: r,
			url: sv.url,
			key: "khoa-thu",
			now: NOW,
		});
		sv.dung();
		expect([b.ma, b.moi, b.daCo]).toEqual([0, 0, 3]);
		expect(anh(r)).toEqual(truoc);
	});

	test("tin hieu bi xoa truoc khi keo khong thanh tep", async () => {
		const r = khoTam();
		const sv = mayChu(BA.filter((t) => t.id !== "crm-2"));
		await chayKeoVe({ root: r, url: sv.url, key: "khoa-thu", now: NOW });
		sv.dung();
		expect(Object.keys(anh(r))).not.toContain("crm-2.json");
	});

	test("thieu dia chi hoac khoa thi ma 2, goi ten bien, khong ghi gi", async () => {
		const r = khoTam();
		const a = await chayKeoVe({
			root: r,
			url: undefined,
			key: "khoa-thu",
			now: NOW,
		});
		expect(a.ma).toBe(2);
		expect(a.loi).toContain("CRM_API_URL");
		const b = await chayKeoVe({
			root: r,
			url: "http://x",
			key: undefined,
			now: NOW,
		});
		expect(b.ma).toBe(2);
		expect(b.loi).toContain("CRM_API_KEY");
		expect(anh(r)).toEqual({});
	});

	test("tep da co khac byte thi ma 1, goi ten tep, khong ghi de", async () => {
		const r = khoTam();
		const sv = mayChu(BA);
		await chayKeoVe({ root: r, url: sv.url, key: "khoa-thu", now: NOW });
		const tep = path.join(r, TIN_HIEU.thuMucNguon, "crm-2.json");
		writeFileSync(tep, '{"sua":"tay"}\n');
		mkdirSync(path.dirname(tep), { recursive: true });
		const c = await chayKeoVe({
			root: r,
			url: sv.url,
			key: "khoa-thu",
			now: NOW,
		});
		sv.dung();
		expect(c.ma).toBe(1);
		expect(c.loi).toContain("crm-2.json");
		expect(readFileSync(tep, "utf8"), "lenh keo ve ghi de tep da co").toBe(
			'{"sua":"tay"}\n',
		);
	});
});

describe("tong-ket", () => {
	test("dong tong ket dem 30 ngay theo phong ban va qua 7 ngay chua co cho", async () => {
		const now = new Date("2026-11-10T00:00:00Z");
		const mau: Mau[] = [
			{ so: 1, luc: "2026-10-20T00:00:00Z", phongBan: "Kinh doanh" },
			{ so: 4, luc: "2026-10-25T00:00:00Z", phongBan: "Kinh doanh" },
			{ so: 99, luc: "2026-10-30T00:00:00Z", phongBan: "Nhân sự" },
			{ so: 100, luc: "2026-11-08T00:00:00Z", phongBan: null },
			{ so: 101, luc: "2026-11-09T00:00:00Z", phongBan: "Nhân sự" },
			{ so: 102, luc: "2026-09-01T00:00:00Z", phongBan: "Kế toán" },
		];
		const ngay = (luc: string) =>
			(now.getTime() - Date.parse(luc)) / 86_400_000;
		const trong30 = mau.filter((x) => ngay(x.luc) <= TIN_HIEU.ngayDem);
		const qua7 = mau.filter((x) => ngay(x.luc) > TIN_HIEU.ngayCoCho);
		const coCho = new Set(["crm-4"]);
		const chuaCoCho = qua7.filter((x) => !coCho.has(`crm-${x.so}`));
		const r = khoTam(true);
		const sv = mayChu(danhSach(mau));
		const kq = await chayKeoVe({ root: r, url: sv.url, key: "khoa-thu", now });
		sv.dung();
		const chu = kq.tongKet.join("\n");
		const phongBan = new Set(trong30.map((x) => x.phongBan).filter(Boolean));
		expect(chu, "dem tran khoang 30 ngay").toContain(
			`trong ${TIN_HIEU.ngayDem} ngày: ${trong30.length} tín hiệu từ ${phongBan.size} phòng ban`,
		);
		expect(chu).toContain("Kinh doanh: 2");
		expect(chu).toContain("Nhân sự: 2");
		expect(chu).toContain("chưa có phòng ban: 1");
		expect(chu).not.toContain("Kế toán");
		expect(chu, "tin hieu chua keo ve lot khoi mau so").toContain(
			`gửi quá ${TIN_HIEU.ngayCoCho} ngày: ${qua7.length} · chưa có chỗ sau gom: ${chuaCoCho.length}`,
		);
	});
});
