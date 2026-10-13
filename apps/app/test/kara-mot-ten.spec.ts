import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import {
	CAM_EN,
	CAM_VI,
	docKiemKe,
	GOC_KHO,
	khoaVat,
	MOC_GOC,
	type MucChu,
	mucKhoChu,
	SO_KHO_NAP,
	soatChuCung,
	soatMotTen,
	TEN_KHO,
	VAT_DOI_DUNG,
} from "./kara-mot-ten-luat";

const dongLoi = (l: { tep: string; khoa: string; nn: string; cum: string }) =>
	`${l.tep}#${l.khoa} ${l.nn}: ${l.cum}`;

describe("kmt-luat", () => {
	it("kho chu: moi gia tri vi va en goi AI dung mot ten", () => {
		expect(SO_KHO_NAP).toBe(TEN_KHO.length);
		expect(soatMotTen(mucKhoChu(), VAT_DOI_DUNG).map(dongLoi)).toEqual([]);
	});

	it("chu cung: khong dong ma nguon nao con cum cam ngoai muc mien", () => {
		const mien = docKiemKe().filter((m) => m.hanh_dong === "mien");
		const conTep = mien.filter(
			(m) =>
				!execFileSync("git", ["-C", GOC_KHO, "ls-files", m.tep], {
					encoding: "utf8",
				}).trim(),
		);
		expect(conTep.map((m) => `kmt: mien mo coi ${m.tep}#${m.khoa}`)).toEqual(
			[],
		);
		expect(
			soatChuCung(mien).map((l) => `${l.tep}:${l.dong}: ${l.cum}`),
		).toEqual([]);
	});

	it("chieu do viet truoc: moi cum cam va moi chu nghia ra dung mot loi", () => {
		const cam: MucChu[] = [...CAM_VI, ...CAM_EN].map((cum, i) => ({
			tep: "gia.ts",
			khoa: `gia-${i}`,
			nn: i < CAM_VI.length ? "vi" : "en",
			giaTri: `Câu thử ${i < CAM_VI.length ? cum : cum.charAt(0).toUpperCase() + cum.slice(1)} ở đây`,
		}));
		const nghia: MucChu[] = ["tác nhân", "Tác nhân", "Agent"].map((cum, i) => ({
			tep: "gia.ts",
			khoa: `nghia-${i}`,
			nn: "vi",
			giaTri: `Câu thử ${cum} ở đây`,
		}));
		const vatThat = [...VAT_DOI_DUNG][0];
		if (!vatThat) throw new Error("kmt: VAT_DOI_DUNG rong");
		const [tepVat, khoaVatThat] = vatThat.split("#") as [string, string];
		const duocPhep: MucChu[] = ["tác nhân", "Tác nhân", "Agent"].map((cum) => ({
			tep: tepVat,
			khoa: khoaVatThat,
			nn: "en",
			giaTri: `Câu thử ${cum} ở đây`,
		}));
		const loi = soatMotTen([...cam, ...nghia, ...duocPhep], VAT_DOI_DUNG);
		expect(cam.length).toBe(16);
		expect(loi.map((l) => l.khoa)).toEqual(
			[...cam, ...nghia].map((m) => m.khoa),
		);
		expect(loi.length).toBe(19);
	});

	it("VAT_DOI_DUNG trung khit cac muc giu cua kiem ke", () => {
		const giu = docKiemKe()
			.filter((m) => m.hanh_dong === "giu")
			.map((m) => khoaVat(m.tep, m.khoa))
			.sort();
		const lech = [
			...[...VAT_DOI_DUNG].filter((k) => !giu.includes(k)),
			...giu.filter((k) => !VAT_DOI_DUNG.has(k)),
		];
		expect(lech.map((k) => `kmt: vat doi dung lech kiem-ke ${k}`)).toEqual([]);
	});
});

type MucGiu = { tep: string; khoa: string; nn: "vi" | "en"; giaTri: string };

const GIU: readonly MucGiu[] = [
	{
		tep: "apps/app/lib/messages/tro-ly-okr.ts",
		khoa: "so.nhom.tac-nhan",
		nn: "vi",
		giaTri: "Tác nhân",
	},
	{
		tep: "apps/app/lib/messages/settings-ket-noi.ts",
		khoa: "slack.tacNhanTieuDe",
		nn: "vi",
		giaTri: "Tác nhân dùng Slack",
	},
	{
		tep: "apps/app/lib/messages/tro-ly-okr.ts",
		khoa: "so.doiSoat.khongCoKhoaRieng",
		nn: "vi",
		giaTri: "tác tử chưa có khoá AI Gateway riêng để lọc",
	},
	{
		tep: "apps/app/lib/messages/nhac-qua-zalo.ts",
		khoa: "khoiZalo.buocNhanMa",
		nn: "vi",
		giaTri: "Nhắn mã cho bot",
	},
	{
		tep: "apps/app/lib/messages/okr-so.ts",
		khoa: "nguon.crm.moTa",
		nn: "vi",
		giaTri: "Máy đếm từ dữ liệu trong OneHub Center mỗi sáng.",
	},
	{
		tep: "apps/app/lib/messages/tro-ly-okr.ts",
		khoa: "troLy.sanSang.lyDo.chua-noi-tac-tu",
		nn: "vi",
		giaTri: "Chưa nối tác tử",
	},
];

const SO_GIU_KHAI = 6;

describe("kmt-giu", () => {
	const hienTai = new Map(
		mucKhoChu().map((m) => [`${m.tep}#${m.khoa}#${m.nn}`, m.giaTri]),
	);

	it("bang giu du muc va moi muc con nguyen van", () => {
		expect(GIU.length).toBe(SO_GIU_KHAI);
		const doi = GIU.filter(
			(g) => hienTai.get(`${g.tep}#${g.khoa}#${g.nn}`) !== g.giaTri,
		);
		expect(doi.map((g) => `kmt: giu bi doi ${g.tep}#${g.khoa}`)).toEqual([]);
	});

	it("ban ghim cua giu dung voi goc", () => {
		const sai = GIU.filter(
			(g) =>
				!execFileSync("git", ["-C", GOC_KHO, "show", `${MOC_GOC}:${g.tep}`], {
					encoding: "utf8",
				}).includes(g.giaTri),
		);
		expect(sai.map((g) => `kmt: giu ghim sai goc ${g.khoa}`)).toEqual([]);
	});
});
