import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { Locale } from "@crm/ui/lib/locale";
import { z } from "zod";
import { messages as khoChuUi } from "../../../packages/ui/src/lib/messages";

export const GOC_KHO = join(import.meta.dir, "..", "..", "..");

const TEP_KIEM_KE = join(
	GOC_KHO,
	"_acceptance",
	"kara-mot-ten",
	"kiem-ke.json",
);

export const MOC_GOC = "4abc05e07";

export const CAM_VI = [
	"Trợ lý",
	"trợ lý",
	"Máy soạn",
	"máy soạn",
	"Máy góp ý",
	"máy góp ý",
	"Máy tóm tắt",
	"máy tóm tắt",
	"Máy ghi số",
	"Máy chạy ở chế độ ẩn",
	"Máy đang soạn",
	"máy không đọc",
	"Tác nhân nghiên cứu",
] as const;

export const CAM_EN = ["assistant", "composer", "your agent"] as const;

const NGHIA_VI = "tác nhân";
const NGHIA_EN = /\bagents?\b/i;

export const VAT_DOI_DUNG: ReadonlySet<string> = new Set([
	"apps/app/lib/messages/tro-ly-okr.ts#so.nhom.tac-nhan",
	"apps/app/lib/messages/tro-ly-okr.ts#so.doiSoat.khongCoKhoaRieng",
	"apps/app/lib/messages/tro-ly-okr.ts#troLy.sanSang.sanSangNguon.khoa-chung",
	"apps/app/lib/messages/tro-ly-okr.ts#troLy.sanSang.thieuKhoaMoTa",
	"apps/app/lib/messages/tro-ly-okr.ts#troLy.sanSang.lyDo.chua-noi-tac-tu",
	"apps/app/lib/messages/nhac-qua-zalo.ts#ketNoi.canHttpsMoTa",
	"apps/app/lib/messages/nhac-qua-zalo.ts#ketNoi.imMoTa",
	"apps/app/lib/messages/settings-khoa-api.ts#tao.tenGoiY",
]);

const MO_DUN_VAT =
	/^apps\/app\/lib\/messages\/(agent-builder-[a-z-]+|settings-ket-noi)\.ts$/;

export const laMoDunVat = (tep: string): boolean => MO_DUN_VAT.test(tep);

export type NgonNgu = "vi" | "en";

export type MucChu = { tep: string; khoa: string; nn: NgonNgu; giaTri: string };

export type LoiChu = { tep: string; khoa: string; nn: NgonNgu; cum: string };

const mucKiemKe = z.object({
	be_mat: z.enum([
		"ban-ghi",
		"tom-tat",
		"soan",
		"cai-dat",
		"tai-lieu",
		"dung-chung",
		"khac",
	]),
	tep: z.string().min(1),
	khoa: z.string().min(1),
	cu: z.object({ vi: z.string().optional(), en: z.string().optional() }),
	hanh_dong: z.enum(["doi", "giu", "mien"]),
	ly_do: z.string().optional(),
});

export type MucKiemKe = z.infer<typeof mucKiemKe>;

export type BeMat = MucKiemKe["be_mat"];

export function docKiemKe(): MucKiemKe[] {
	return z
		.array(mucKiemKe)
		.parse(JSON.parse(readFileSync(TEP_KIEM_KE, "utf8")));
}

export const khoaVat = (tep: string, khoa: string): string => `${tep}#${khoa}`;

function cumCam(giaTri: string): string | null {
	const vi = CAM_VI.find((c) => giaTri.includes(c));
	if (vi) return vi;
	const thuong = giaTri.toLowerCase();
	return CAM_EN.find((c) => thuong.includes(c)) ?? null;
}

function cumNghia(giaTri: string): string | null {
	if (giaTri.toLowerCase().includes(NGHIA_VI)) return NGHIA_VI;
	return NGHIA_EN.exec(giaTri)?.[0] ?? null;
}

export function soatMotTen(
	muc: readonly MucChu[],
	vatDoiDung: ReadonlySet<string>,
): LoiChu[] {
	return muc.flatMap((m): LoiChu[] => {
		if (laMoDunVat(m.tep)) return [];
		const cam = cumCam(m.giaTri);
		if (cam) return [{ tep: m.tep, khoa: m.khoa, nn: m.nn, cum: cam }];
		const nghia = cumNghia(m.giaTri);
		if (nghia && !vatDoiDung.has(khoaVat(m.tep, m.khoa)))
			return [{ tep: m.tep, khoa: m.khoa, nn: m.nn, cum: nghia }];
		return [];
	});
}

type GiaTri = string | ((...doiSo: string[]) => string);
type Nhanh = { readonly [khoa: string]: GiaTri | Nhanh };

const DOI_SO_MAU = ["X", "Y", "Z", "W"];

function phang(o: Nhanh, tien = ""): [string, string][] {
	return Object.entries(o).flatMap(([k, v]): [string, string][] =>
		v instanceof Function
			? [[`${tien}${k}`, String(v(...DOI_SO_MAU))]]
			: v instanceof Map
				? phang(Object.fromEntries(v) as Nhanh, `${tien}${k}.`)
				: v instanceof Object
					? phang(v, `${tien}${k}.`)
					: [[`${tien}${k}`, String(v)]],
	);
}

const THU_MUC_KHO = join(import.meta.dir, "..", "lib", "messages");

export const TEN_KHO: readonly string[] = readdirSync(THU_MUC_KHO)
	.filter((t) => t.endsWith(".ts"))
	.sort();

const KHO: readonly (readonly [string, (locale: Locale) => Nhanh])[] =
	await Promise.all(
		TEN_KHO.map(async (tep) => {
			const ns: object = await import(
				`@/lib/messages/${tep.replace(/\.ts$/, "")}`
			);
			const lay = Object.values(ns).find(
				(v): v is (locale: Locale) => Nhanh => v instanceof Function,
			);
			if (!lay) throw new Error(`kmt: kho chu ${tep} khong xuat ham lay`);
			return [`apps/app/lib/messages/${tep}`, lay] as const;
		}),
	);

export const SO_KHO_NAP = KHO.length;

export function mucKhoChu(): MucChu[] {
	const ui: [string, (locale: Locale) => Nhanh] = [
		"packages/ui/src/lib/messages.ts",
		(l) => khoChuUi(l) as Nhanh,
	];
	return [...KHO, ui].flatMap(([tep, lay]) =>
		(["vi", "en"] as const).flatMap((nn) =>
			phang(lay(nn)).map(([khoa, giaTri]) => ({ tep, khoa, nn, giaTri })),
		),
	);
}

export const THU_MUC_NGUON = [
	"apps/app/app",
	"apps/app/components",
	"apps/api/src",
	"apps/agent/agent",
	"packages/validation/src",
] as const;

const BO_QUA = new Set(["node_modules", ".next", "proto", "dist", ".turbo"]);

function tepNguon(thuMuc: string): string[] {
	return readdirSync(thuMuc).flatMap((ten) => {
		if (BO_QUA.has(ten)) return [];
		const duong = join(thuMuc, ten);
		if (statSync(duong).isDirectory()) return tepNguon(duong);
		return /\.tsx?$/.test(ten) ? [duong] : [];
	});
}

export type LoiDong = { tep: string; dong: number; cum: string };

export function soatChuCung(mien: readonly MucKiemKe[]): LoiDong[] {
	return THU_MUC_NGUON.flatMap((goc) => tepNguon(join(GOC_KHO, goc))).flatMap(
		(duong) => {
			const tep = relative(GOC_KHO, duong);
			const cuMien = mien
				.filter((m) => m.tep === tep)
				.flatMap((m) =>
					[m.cu.vi, m.cu.en].filter((c): c is string => Boolean(c)),
				);
			return readFileSync(duong, "utf8")
				.split("\n")
				.flatMap((dong, i): LoiDong[] => {
					const cum = CAM_VI.find((c) => dong.includes(c));
					if (!cum || cuMien.some((c) => dong.includes(c))) return [];
					return [{ tep, dong: i + 1, cum }];
				});
		},
	);
}
