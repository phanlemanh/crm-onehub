import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import {
	CAM_EN,
	CAM_VI,
	docKiemKeDnk,
	MOC_GOC_DNK,
	type MucKiemKeDnk,
	mucKhoKhu,
	NHAN_GHIM,
	soatDnk,
} from "./doi-nhan-khu-muc-tieu-luat";
import { GOC_KHO, type MucChu, type NgonNgu } from "./kara-mot-ten-luat";

const SO_GOP_VAO_VI = 51;
const SO_GOP_VAO_EN = 55;
const SO_LAY_Y_KIEN = 21;

const CU_GOP_VAO_VI = [
	"căn chỉnh",
	"đường lý do",
	"gắn căn chỉnh",
	"gắn thêm",
	"chưa nối lên",
];
const CU_GOP_VAO_EN = [/\balign/i, /path of reasons/i, /not connected/i];

const HIEN_TAI = new Map(
	mucKhoKhu().map((m) => [`${m.tep}#${m.khoa}#${m.nn}`, m.giaTri]),
);

function giaTri(tep: string, khoa: string, nn: NgonNgu): string {
	const v = HIEN_TAI.get(`${tep}#${khoa}#${nn}`);
	if (v === undefined)
		throw new Error(`dnk: khong doc duoc ${tep}#${khoa} ${nn}`);
	return v;
}

const muc = (khaiNiem: MucKiemKeDnk["khai_niem"], nn: NgonNgu) =>
	docKiemKeDnk().filter((m) => m.khai_niem === khaiNiem && m.doi.includes(nn));

const nguonGoc = (tep: string): string =>
	execFileSync("git", ["-C", GOC_KHO, "show", `${MOC_GOC_DNK}:${tep}`], {
		encoding: "utf8",
	});

const loiNhan = (khaiNiem: MucKiemKeDnk["khai_niem"], nn: NgonNgu) =>
	NHAN_GHIM.filter((n) => n.khai_niem === khaiNiem).flatMap((n) => {
		const v = giaTri(n.tep, n.khoa, nn);
		return v === n[nn] ? [] : [`dnk: nhan ${n.khoa} ${nn} ${v}`];
	});

describe("dnk-gop-vao", () => {
	it("dnk-gop-vao-vi: moi khoa gop-vao doi xong va nhan ghim dung chu", () => {
		const ds = muc("gop-vao", "vi");
		expect(`dnk: kiem-ke gop-vao vi ${ds.length} khac ${SO_GOP_VAO_VI}`).toBe(
			`dnk: kiem-ke gop-vao vi ${SO_GOP_VAO_VI} khac ${SO_GOP_VAO_VI}`,
		);
		const loi = ds.flatMap((m) => {
			const v = giaTri(m.tep, m.khoa, "vi");
			const con = CU_GOP_VAO_VI.find((c) => v.toLowerCase().includes(c));
			if (con) return [`dnk: ${m.tep}#${m.khoa} vi con ${con}`];
			return v === m.cu.vi ? [`dnk: ${m.tep}#${m.khoa} vi chua doi`] : [];
		});
		expect(loi).toEqual([]);
		expect(loiNhan("gop-vao", "vi")).toEqual([]);
		expect(giaTri("apps/app/lib/messages/okr.ts", "gopVao", "vi")).toContain(
			"góp vào",
		);
	});

	it("dnk-gop-vao-en: moi khoa gop-vao doi xong va nhan ghim dung chu", () => {
		const ds = muc("gop-vao", "en");
		expect(`dnk: kiem-ke gop-vao en ${ds.length} khac ${SO_GOP_VAO_EN}`).toBe(
			`dnk: kiem-ke gop-vao en ${SO_GOP_VAO_EN} khac ${SO_GOP_VAO_EN}`,
		);
		const loi = ds.flatMap((m) => {
			const v = giaTri(m.tep, m.khoa, "en");
			const con = CU_GOP_VAO_EN.find((r) => r.test(v));
			if (con) return [`dnk: ${m.tep}#${m.khoa} en con ${con.source}`];
			return v === m.cu.en ? [`dnk: ${m.tep}#${m.khoa} en chua doi`] : [];
		});
		expect(loi).toEqual([]);
		expect(loiNhan("gop-vao", "en")).toEqual([]);
	});
});

describe("dnk-goc", () => {
	it("ten cap, du phong va pham vi cua goc dung chu", () => {
		const M = "apps/app/lib/messages/";
		const ghim: [string, string, string, string][] = [
			[`${M}okr-so.ts`, "phamVi.toan-cong-ty", "Công ty", "Company"],
			[`${M}tro-ly-okr.ts`, "troLy.phamVi.toan-cong-ty", "Công ty", "Company"],
		];
		const loi = [
			...NHAN_GHIM.filter((n) => n.khai_niem === "goc").map(
				(n) => [n.tep, n.khoa, n.vi, n.en] as [string, string, string, string],
			),
			...ghim,
		].flatMap(([tep, khoa, vi, en]) =>
			(["vi", "en"] as const).flatMap((nn) => {
				const v = giaTri(tep, khoa, nn);
				return v === (nn === "vi" ? vi : en)
					? []
					: [`dnk: goc ${tep}#${khoa} ${nn} ${v}`];
			}),
		);
		expect(loi).toEqual([]);
	});

	it("doi chung: cau van ca cong ty chi pham vi giu nguyen nhu goc", () => {
		const M = "apps/app/lib/messages/";
		const giu: [string, string][] = [
			[`${M}okr.ts`, "donViBang.caCongTy"],
			[`${M}okr.ts`, "moTa.toan-canh"],
			[`${M}okr-hoi-y.ts`, "trong.quanTriMoTa"],
		];
		const loi = giu.flatMap(([tep, khoa]) => {
			const v = giaTri(tep, khoa, "vi");
			return nguonGoc(tep).includes(v) ? [] : [`dnk: pham vi bi doi ${khoa}`];
		});
		expect(loi).toEqual([]);
	});
});

describe("dnk-lay-y-kien", () => {
	it("vi doi sang Lay y kien, en giu nguyen nhu goc", () => {
		const ds = docKiemKeDnk().filter((m) => m.khai_niem === "lay-y-kien");
		expect(`dnk: kiem-ke lay-y-kien ${ds.length} khac ${SO_LAY_Y_KIEN}`).toBe(
			`dnk: kiem-ke lay-y-kien ${SO_LAY_Y_KIEN} khac ${SO_LAY_Y_KIEN}`,
		);
		const loi = ds.flatMap((m) => {
			const vi = giaTri(m.tep, m.khoa, "vi").toLowerCase();
			const en = giaTri(m.tep, m.khoa, "en");
			return [
				...(vi.includes("hỏi ý")
					? [`dnk: ${m.tep}#${m.khoa} vi con hoi y`]
					: []),
				...(vi.includes("lấy ý kiến")
					? []
					: [`dnk: ${m.tep}#${m.khoa} vi thieu lay y kien`]),
				...(en === m.cu.en ? [] : [`dnk: ${m.tep}#${m.khoa} en bi doi`]),
			];
		});
		expect(loi).toEqual([]);
		expect(giaTri("apps/app/lib/messages/okr.ts", "tab.hoi-y", "vi")).toBe(
			"Lấy ý kiến",
		);
	});
});

const dongLoi = (l: { tep: string; khoa: string; nn: string; cum: string }) =>
	`${l.tep}#${l.khoa} ${l.nn}: ${l.cum}`;

describe("dnk-luat", () => {
	it("moi tep chu cua khu sach ten cu", () => {
		const thuMuc = join(GOC_KHO, "apps", "app", "lib", "messages");
		const tep = readdirSync(thuMuc)
			.filter((t) => /^(okr[a-z-]*|tro-ly-okr|to-chuc)\.ts$/.test(t))
			.map((t) => `apps/app/lib/messages/${t}`);
		const nap = new Set(mucKhoKhu().map((m) => m.tep));
		expect(
			tep.filter((t) => !nap.has(t)).map((t) => `dnk: luat bo sot tep ${t}`),
		).toEqual([]);
		expect(nap.has("packages/ui/src/lib/messages.ts")).toBe(true);
		expect(soatDnk(mucKhoKhu()).map(dongLoi)).toEqual([]);
	});

	it("chieu do viet truoc: moi cum cam ra dung mot loi, chu giu ra khong loi", () => {
		const tep = "apps/app/lib/messages/okr.ts";
		const hoaDau = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
		const cam: MucChu[] = [
			...CAM_VI.map(
				(c, i): MucChu => ({
					tep,
					khoa: `gia-vi-${i}`,
					nn: "vi",
					giaTri: `${hoaDau(c)} ở đây`,
				}),
			),
			...["Alignment tab", "All of OneHub", "Path of reasons"].map(
				(c, i): MucChu => ({ tep, khoa: `gia-en-${i}`, nn: "en", giaTri: c }),
			),
			{ tep, khoa: "gia-en-nhan", nn: "en", giaTri: "Whole company" },
		];
		expect(cam).toHaveLength(CAM_VI.length + CAM_EN.length + 1);
		const giu: MucChu[] = [
			{ tep, khoa: "giu-1", nn: "vi", giaTri: "Cả công ty trong một màn." },
			{ tep, khoa: "giu-2", nn: "en", giaTri: "the whole company answers" },
			{ tep, khoa: "giu-3", nn: "vi", giaTri: "Lấy ý kiến" },
			{
				tep: "apps/app/lib/messages/deals.ts",
				khoa: "ngoai",
				nn: "vi",
				giaTri: "căn chỉnh",
			},
		];
		const loi = soatDnk([...cam, ...giu]);
		const trung = cam.filter(
			(m) => loi.filter((l) => l.khoa === m.khoa).length !== 1,
		);
		expect(trung.map((m) => `dnk: luat khong bat ${m.khoa}`)).toEqual([]);
		expect(
			loi
				.filter((l) => !l.khoa.startsWith("gia-"))
				.map((l) => `dnk: luat khong bat ${l.khoa}`),
		).toEqual([]);
	});
});
