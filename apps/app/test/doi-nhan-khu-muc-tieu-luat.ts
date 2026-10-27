import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
	GOC_KHO,
	type MucChu,
	mucKhoChu,
	type NgonNgu,
} from "./kara-mot-ten-luat";

export const MOC_GOC_DNK = "1fce5d49c";

const TEP_KIEM_KE = join(
	GOC_KHO,
	"_acceptance",
	"doi-nhan-khu-muc-tieu",
	"kiem-ke.json",
);

const KHO_KHU =
	/^apps\/app\/lib\/messages\/(okr[a-z-]*|tro-ly-okr|to-chuc)\.ts$/;

const TEP_UI = "packages/ui/src/lib/messages.ts";

export const KHOA_UI: ReadonlySet<string> = new Set([
	`${TEP_UI}#soDo.day`,
	`${TEP_UI}#soDo.moTaDay`,
]);

export const laKhoKhu = (tep: string, khoa?: string): boolean =>
	KHO_KHU.test(tep) || (khoa !== undefined && KHOA_UI.has(`${tep}#${khoa}`));

export const CAM_VI = [
	"căn chỉnh",
	"đường lý do",
	"chưa nối lên",
	"gắn thêm",
	"hỏi ý",
	"toàn công ty",
	"toàn onehub",
] as const;

export const CAM_EN = [
	/\balign/i,
	/\ball of onehub\b/i,
	/\bpath of reasons\b/i,
];

export const CAM_EN_NHAN = ["Whole company"] as const;

export type LoiDnk = { tep: string; khoa: string; nn: NgonNgu; cum: string };

export function cumCamDnk(nn: NgonNgu, giaTri: string): string | null {
	const thuong = giaTri.toLowerCase();
	if (nn === "vi") return CAM_VI.find((c) => thuong.includes(c)) ?? null;
	const re = CAM_EN.find((r) => r.test(giaTri));
	if (re) return re.source;
	return CAM_EN_NHAN.find((c) => giaTri.trim() === c) ?? null;
}

export function soatDnk(muc: readonly MucChu[]): LoiDnk[] {
	return muc.flatMap((m): LoiDnk[] => {
		if (!laKhoKhu(m.tep, m.khoa)) return [];
		const cum = cumCamDnk(m.nn, m.giaTri);
		return cum ? [{ tep: m.tep, khoa: m.khoa, nn: m.nn, cum }] : [];
	});
}

export function mucKhoKhu(): MucChu[] {
	return mucKhoChu().filter((m) => laKhoKhu(m.tep, m.khoa));
}

const khaiNiem = z.enum(["gop-vao", "goc", "lay-y-kien"]);

const mucKiemKe = z.object({
	khai_niem: khaiNiem,
	tep: z.string().refine((t) => KHO_KHU.test(t) || t === TEP_UI),
	khoa: z.string().min(1),
	cu: z.object({ vi: z.string(), en: z.string() }),
	doi: z.array(z.enum(["vi", "en"])),
	vai: z.enum(["du-phong-ten-goc", "ten-cap", "pham-vi"]).optional(),
});

export type MucKiemKeDnk = z.infer<typeof mucKiemKe>;

export function docKiemKeDnk(): MucKiemKeDnk[] {
	return z
		.array(mucKiemKe)
		.parse(JSON.parse(readFileSync(TEP_KIEM_KE, "utf8")));
}

export const NHAN_GHIM: readonly {
	khai_niem: MucKiemKeDnk["khai_niem"];
	tep: string;
	khoa: string;
	vi: string;
	en: string;
}[] = [
	{
		khai_niem: "gop-vao",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "sheet.tabCanChinh",
		vi: "Góp vào",
		en: "Contributes to",
	},
	{
		khai_niem: "gop-vao",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "sheet.khuDuongLyDo",
		vi: "Góp vào đâu",
		en: "Where it contributes",
	},
	{
		khai_niem: "gop-vao",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "hopThoai.ganCanChinh",
		vi: "Thêm chỗ góp vào",
		en: "Add where it contributes",
	},
	{
		khai_niem: "gop-vao",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "chuaCanChinh",
		vi: "Chưa góp vào đâu",
		en: "Not contributing anywhere",
	},
	{
		khai_niem: "gop-vao",
		tep: "packages/ui/src/lib/messages.ts",
		khoa: "soDo.day",
		vi: "Dây góp vào",
		en: "Contribution line",
	},
	{
		khai_niem: "lay-y-kien",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "tab.hoi-y",
		vi: "Lấy ý kiến",
		en: "Call for ideas",
	},
	{
		khai_niem: "goc",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "goc",
		vi: "Công ty",
		en: "Company",
	},
	{
		khai_niem: "goc",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "cap.goc",
		vi: "Công ty",
		en: "Company",
	},
	{
		khai_niem: "goc",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "hopThoai.capMucTieu.onehub",
		vi: "Công ty",
		en: "Company",
	},
	{
		khai_niem: "goc",
		tep: "apps/app/lib/messages/okr-hoi-y.ts",
		khoa: "doPhu.goc",
		vi: "Công ty",
		en: "Company",
	},
	{
		khai_niem: "goc",
		tep: "apps/app/lib/messages/to-chuc.ts",
		khoa: "goc",
		vi: "Công ty",
		en: "Company",
	},
	{
		khai_niem: "goc",
		tep: "apps/app/lib/messages/okr.ts",
		khoa: "khongThay.action",
		vi: "Về cả công ty",
		en: "Back to the whole company",
	},
];
