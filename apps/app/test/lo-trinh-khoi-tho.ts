import { z } from "zod";

const KHOI =
	/<script type="application\/json" id="lo-trinh-du-lieu">([\s\S]*?)<\/script>/;

export const NHOM_THO = [
	"chua-bat-dau",
	"dang-lam",
	"da-giao",
	"khac",
] as const;

const moiNguoiTho = z.object({
	da_giao: z.string().nullable(),
	vi_sao: z.string().nullable(),
	trang_thai: z.string().nullable(),
	ngay: z.string().nullable(),
	production: z.string().nullable(),
	do_gi: z.string().nullable(),
	ket_qua: z.string().nullable(),
	chua_lam: z.string().nullable(),
	ai_quyet: z.string().nullable(),
});

const chuKhoTho = z.object({
	tieu_chi: z.number().nullable(),
	phep_do: z.number().nullable(),
	luot_cham: z.number().nullable(),
	token: z.number().nullable(),
	quyet_dinh_may: z.number().nullable(),
	quyet_dinh_nguoi: z.number().nullable(),
	ma: z.string().nullable(),
});

const tomTatTho = z.object({ moi_nguoi: moiNguoiTho, chu_kho: chuKhoTho });

const hangTho = z.looseObject({
	ma: z.string(),
	trang_thai: z.string(),
	nhom_trang_thai: z.enum(NHOM_THO),
	tom_tat: tomTatTho.nullable().default(null),
});

const khoiTho = z.looseObject({
	phien_ban: z.number(),
	lo_trinh: z.array(z.looseObject({ tep: z.string(), hang: z.array(hangTho) })),
});

export type KhoiTho = z.infer<typeof khoiTho>;
export type TomTatTho = z.infer<typeof tomTatTho>;
export type HangTho = z.infer<typeof hangTho> & { khoa: string };

export function khoiThoCua(html: string): KhoiTho {
	const goc = KHOI.exec(html)?.[1];
	if (!goc) throw new Error("tep mau khong co khoi");
	return khoiTho.parse(JSON.parse(goc));
}

export function hangThoCua(html: string): HangTho[] {
	return khoiThoCua(html).lo_trinh.flatMap((lo) =>
		lo.hang.map((h) => ({ ...h, khoa: `${lo.tep}#${h.ma}` })),
	);
}

export function doiKhoi(html: string, sua: (o: KhoiTho) => void): string {
	const o = khoiThoCua(html);
	sua(o);
	const moi = JSON.stringify(o).replace(/</g, "\\u003c");
	return html.replace(
		KHOI,
		`<script type="application/json" id="lo-trinh-du-lieu">${moi}</script>`,
	);
}

const khoiChoXem = z.looseObject({
	lo_trinh: z.array(
		z.looseObject({
			tep: z.string(),
			hang: z.array(
				z.looseObject({
					ma: z.string(),
					tom_tat: z
						.object({
							moi_nguoi: moiNguoiTho,
							chu_kho: chuKhoTho.nullable(),
						})
						.nullable(),
				}),
			),
		}),
	),
});

export const propsNoiDung = z.strictObject({
	dauVao: z.looseObject({
		kieu: z.string(),
		duLieu: khoiChoXem.optional(),
	}),
});
