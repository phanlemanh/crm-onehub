import { createRequire } from "node:module";
import { join, resolve } from "node:path";

export const GOC = resolve(import.meta.dir, "..", "..", "..");
const { z } = createRequire(join(GOC, "apps", "agent", "package.json"))(
	"zod",
) as typeof import("zod");

export { z };

const GIO_MS = 60 * 60 * 1000;
const HO_SO = resolve(import.meta.dir, "..");

export const MTV = {
	slug: "model-theo-vai-do-lai",
	hoSo: HO_SO,
	evidence: join(HO_SO, "evidence"),
	rang: import.meta.dir,
	chay: join(GOC, ".acceptance-runs", "model-theo-vai-do-lai"),
	cu: { ma: "glm", nhanSoan: "flash", moc: "49456c140" },
	tran: 180,
	lechKetXuatMs: 7 * GIO_MS,
	urlGateway: "https://ai-gateway.vercel.sh/v1",
	tinhNang: {
		"tro-ly-kho": "tai-lieu.tro-ly",
		"soan-okr": "okr.soan",
	},
	tep: {
		keHoach: "ke-hoach.json",
		keHoachTacNhan: "ke-hoach-tac-nhan.json",
		tacNhan: "tac-nhan.jsonl",
		chiPhi: "chi-phi.json",
		bang: "bang-kien-nghi.json",
		bangTacNhan: "bang-tac-nhan.md",
		kho: "kho",
		khoTom: "tom-tat.json",
		khoBaoCao: "do-bo-mau.md",
		khoTungCau: "cham-tung-cau.jsonl",
		khoTraLoi: "cham-bo-do-mau.md",
		khoKetXuat: "aichiphi.json",
		docs: join(GOC, "docs", "model-theo-vai.md"),
		nguong: join(import.meta.dir, "nguong.json"),
	},
	suaTam: {
		agentBuilder: "apps/agent/agent/subagents/agent_builder/agent.ts",
		taiLieu: "apps/agent/agent/lib/tai-lieu-config.ts",
		agentOkr: "apps/agent-okr/agent/lib/config.ts",
	},
	khaiModelOkr: [
		"apps/agent-okr/agent/lib/config.ts",
		"apps/agent/agent/lib/okr/config.ts",
	],
	moc: {
		tacNhan: "_acceptance/tac-nhan-glm-5-3-cham/evidence/bang.md",
		tacNhanDong: "_acceptance/tac-nhan-glm-5-3-cham/evidence/tac-nhan.jsonl",
		kho: "_acceptance/bo-cau-hoi-mau/evidence/do-bo-mau.md",
		khoTraLoi: "_acceptance/bo-cau-hoi-mau/evidence/cham-bo-do-mau.md",
		soan: "_acceptance/chu-may-sinh-ten-moi/evidence/eval-soan-sau.json",
	},
	ngayMoc: {
		tacNhan: "2026-10-16",
		kho: "2026-10-13",
		soan: "2026-10-20",
	},
	suKienChon: "model.phien-chon",
} as const;

export const laCu = (ma: string) => ma === MTV.cu.ma;
export const laLow = (bienThe: string) => bienThe.endsWith("-low");
const nhanSoan = (ma: string, n: number) =>
	`${laCu(ma) ? MTV.cu.nhanSoan : ma}-${n}`;

export const DUONG = {
	doSuyLuan: (ma: string) =>
		laCu(ma) ? "do-suy-luan.json" : `do-suy-luan-${ma}.json`,
	kho: (ma: string, n: number) =>
		laCu(ma) ? `${MTV.tep.kho}/luot-${n}` : `${MTV.tep.kho}/${ma}/luot-${n}`,
	nhanSoan,
	soan: (ma: string, n: number) => `eval-soan-${nhanSoan(ma, n)}.json`,
	ketXuatSoan: (ma: string, n: number) =>
		`aichiphi-soan-${nhanSoan(ma, n)}.json`,
	aichiphi: (bienThe: string, n: number) => `aichiphi-${bienThe}-${n}.json`,
	suKien: (bienThe: string, n: number) => `su-kien-${bienThe}-${n}.json`,
	nhatKy: (bienThe: string, n: number) => `luot-${bienThe}-${n}.log`,
} as const;

export const VAI_CHI = ["dao", "tac-nhan", "tro-ly-kho", "soan-okr"] as const;
export type VaiChi = (typeof VAI_CHI)[number];

export const khoaChi = (vai: VaiChi, nhan: string, n: number) =>
	vai === "tac-nhan" || !laCu(nhan) ? `${nhan}-${n}` : String(n);

const maUng = z.string().regex(/^[a-z0-9]+$/);
const khuonGia = z.object({
	vao: z.number().nonnegative(),
	ra: z.number().nonnegative(),
	doc_cache: z.number().nonnegative(),
});
export type Gia = z.infer<typeof khuonGia>;

export const khuonKeHoach = z
	.object({
		nguon: z.string().min(1),
		ung_vien: z.record(
			maUng,
			z.object({ model: z.string().min(1), gia: khuonGia }),
		),
		gia_chup: z.object({
			nguon: z.string().min(1),
			ngay: z.string().min(1),
			ghi_chu: z.string(),
		}),
		tac_nhan: z.object({
			so_luot: z.number().int().positive(),
			ung_vien: z
				.array(
					z.object({
						ma: maUng,
						bien_the: z.array(z.string().regex(/^[a-z0-9]+(-low)?$/)).min(1),
					}),
				)
				.min(1),
		}),
		do_suy_luan: z.object({ ung_vien: z.array(maUng).min(1) }),
		tro_ly_kho: z.object({
			so_luot: z.number().int().positive(),
			ung_vien: z.array(maUng).min(1),
		}),
		soan_okr: z.object({
			so_luot: z.number().int().positive(),
			ung_vien: z.array(maUng).min(1),
			moc: z.string().min(1),
		}),
		thu_tu: z.array(
			z.string().regex(/^(dao|tac-nhan|tro-ly-kho|soan-okr):[a-z0-9]+$/),
		),
		tran_usd: z.number().positive(),
		thong_so_chua_do: z.array(z.string().min(1)),
	})
	.superRefine((k, ctx) => {
		const ma = new Set(Object.keys(k.ung_vien));
		const dung = [
			...k.tac_nhan.ung_vien.map((u) => u.ma),
			...k.do_suy_luan.ung_vien,
			...k.tro_ly_kho.ung_vien,
			...k.soan_okr.ung_vien,
			...k.thu_tu.map((t) => t.split(":")[1] ?? ""),
		];
		for (const m of dung)
			if (!ma.has(m))
				ctx.addIssue({ code: "custom", message: `ung vien la ${m}` });
		const bt = k.tac_nhan.ung_vien.flatMap((u) => u.bien_the);
		if (new Set(bt).size !== bt.length)
			ctx.addIssue({ code: "custom", message: "bien the trung giua ung vien" });
	});
export type KeHoach = z.infer<typeof khuonKeHoach>;

export const modelCua = (ke: KeHoach, ma: string) => {
	const u = ke.ung_vien[ma];
	if (!u) throw new Error(`ke-hoach.json khong co ung vien ${ma}`);
	return u.model;
};
export const giaCua = (ke: KeHoach, ma: string) => {
	const u = ke.ung_vien[ma];
	if (!u) throw new Error(`ke-hoach.json khong co ung vien ${ma}`);
	return u.gia;
};
export const ungVienCuaBienThe = (ke: KeHoach, bienThe: string) =>
	ke.tac_nhan.ung_vien.find((u) => u.bien_the.includes(bienThe))?.ma ?? null;

export const khuonNguong = z.object({
	nguon: z.string().min(1),
	tac_nhan: z.object({
		luot_qua_toi_thieu: z.number().int().positive(),
		tren_so_luot: z.number().int().positive(),
		tran_giay: z.number().positive(),
		hoa: z.literal("trung-vi-giay-thap-hon"),
		giu: z.string().min(1),
	}),
	tro_ly_kho: z.object({
		kem_moc_toi_da_moi_tang: z.number().int().nonnegative(),
		cau_loi_toi_da: z.number().int().nonnegative(),
		giu: z.string().min(1),
	}),
	soan_okr: z.object({
		dat_toi_thieu: z.number().int().positive(),
		tren_tong: z.number().int().positive(),
		hong_toi_da: z.number().int().nonnegative(),
		moi_luot: z.literal(true),
		giu: z.string().min(1),
	}),
	judge_okr: z.object({ kien_nghi: z.literal("giu"), giu: z.string().min(1) }),
	may_soan_kho: z.object({
		kien_nghi: z.literal("giu"),
		ghi_chu: z.string().min(1),
		giu: z.string().min(1),
	}),
	chon: z.object({
		ap_cho: z.array(maUng).min(1),
		luot_bi_loai: z.literal("chua-du-so"),
		luat: z.literal("re-nhat-chi-phi-phan-ung-vien"),
		chi_phi: z.literal("token-vao-nhan-gia-vao-cong-token-ra-nhan-gia-ra"),
		hoa: z.tuple([
			z.literal("diem-cao-hon"),
			z.literal("trung-vi-giay-thap-hon"),
		]),
		diem: z.object({
			"tac-nhan": z.literal("so-luot-qua"),
			"tro-ly-kho": z.literal("tong-dung-tru-cau-loi"),
			"soan-okr": z.literal("tong-dat-moi-luot"),
		}),
	}),
});
export type Nguong = z.infer<typeof khuonNguong>;

export const khuonKeHoachTacNhan = z.object({
	bam_agent_goc: z.string().length(64),
	bam_agent_low: z.string().length(64),
});

const khuonSoCon = z.object({
	so_buoc: z.number().int().nonnegative(),
	token_vao: z.number().nonnegative(),
	token_ra: z.number().nonnegative(),
	giay: z.number().nonnegative(),
});
export type SoCon = z.infer<typeof khuonSoCon>;

export const khuonDongTacNhan = z.object({
	bien_the: z.string().min(1),
	luot: z.number().int().positive(),
	model: z.string(),
	model_phien_con: z.string().nullable(),
	bat_dau: z.string(),
	ket_thuc: z.string(),
	giay: z.number(),
	ket_qua: z.enum(["qua", "hong"]),
	ly_do: z.string().nullable(),
	bi_cat: z.boolean(),
	phien_goc: z.string().min(1),
	bam_agent: z.string().length(64),
	nhat_ky: z.string(),
	aichiphi: z.string(),
	su_kien: z.string(),
	ung_vien: maUng.optional(),
	phien_con: khuonSoCon.optional(),
});
export type DongTacNhan = z.infer<typeof khuonDongTacNhan>;

export const khuonHangChiPhi = z.object({
	id: z.string(),
	at: z.string(),
	sessionId: z.string(),
	phienCha: z.string().nullable(),
	tinhNang: z.string().nullable().optional(),
	modelId: z.string().nullable(),
	inputTokens: z.number().nullable(),
	cacheReadTokens: z.number().nullable().optional(),
	outputTokens: z.number().nullable(),
	costUsd: z.number().nullable(),
});
export type HangChiPhi = z.infer<typeof khuonHangChiPhi>;
export const khuonKetXuat = z.array(khuonHangChiPhi);

export const khuonSuKienChon = z.array(
	z.object({ sessionId: z.string(), modelId: z.string().min(1) }),
);
export type SuKienChon = z.infer<typeof khuonSuKienChon>;

const tronSo = (x: number, c: number) => Number(x.toFixed(c));
export const gioThat = (at: string) => Date.parse(at) + MTV.lechKetXuatMs;

export function soCon(hang: HangChiPhi[], phien: string): SoCon {
	const con = hang.filter((h) => h.phienCha === phien && h.sessionId !== phien);
	const t = con.map((h) => gioThat(h.at)).sort((a, b) => a - b);
	return {
		so_buoc: con.length,
		token_vao: con.reduce((s, h) => s + (h.inputTokens ?? 0), 0),
		token_ra: con.reduce((s, h) => s + (h.outputTokens ?? 0), 0),
		giay: t.length > 1 ? tronSo(((t.at(-1) ?? 0) - (t[0] ?? 0)) / 1000, 1) : 0,
	};
}

export function chiPhiPhan(
	hang: HangChiPhi[],
	gia: Gia,
	tinhNang: string | null,
): number {
	return tronSo(
		hang
			.filter((h) => tinhNang === null || h.tinhNang === tinhNang)
			.reduce(
				(s, h) =>
					s + (h.inputTokens ?? 0) * gia.vao + (h.outputTokens ?? 0) * gia.ra,
				0,
			),
		9,
	);
}

const khuonMucSuyLuan = z.object({
	status: z.number(),
	model: z.string().nullable(),
	token_ra: z.number().nullable(),
	token_suy_luan: z.number().nullable(),
	khong_tra_suy_luan: z.boolean(),
});
export type MucSuyLuan = z.infer<typeof khuonMucSuyLuan>;
export const MUC_SUY_LUAN = ["mac-dinh", "low", "high"] as const;
export const khuonDoSuyLuan = z.object({
	luc: z.string(),
	model: z.string(),
	cau: z.string(),
	muc: z.object({
		"mac-dinh": khuonMucSuyLuan.optional(),
		low: khuonMucSuyLuan.optional(),
		high: khuonMucSuyLuan.optional(),
	}),
	usd: z.number().nonnegative(),
	ung_vien: maUng.optional(),
});
export type DoSuyLuan = z.infer<typeof khuonDoSuyLuan>;

const khuonSoDu = z.object({ usd: z.number().nullable(), luc: z.string() });
export type SoDu = z.infer<typeof khuonSoDu>;
export const LOI_KHONG_ZDR = "không có ZDR";

export const khuonKhoTom = z.object({
	luot: z.number().int().positive(),
	luc: z.string(),
	thu_muc: z.string(),
	ma_do_bo_mau: z.number().int(),
	model_kho: z.string().nullable(),
	model_goc: z.string().nullable(),
	bam_bo_mau: z.string().length(64),
	bam_sua_tam: z.string().length(64),
	bam_commit: z.string().length(40),
	usd: z.number().nonnegative(),
	usd_nguon: z.enum(["so-du-gateway", "aichiphi"]),
	ung_vien: maUng.optional(),
	aichiphi: z.string().optional(),
	so_du_truoc: khuonSoDu.optional(),
	so_du_sau: khuonSoDu.optional(),
	usd_so_du: z.number().nullable().optional(),
	loi: z.literal(LOI_KHONG_ZDR).nullable().optional(),
});
export type KhoTom = z.infer<typeof khuonKhoTom>;

export const khuonSoan = z.object({
	nhan: z.string(),
	luc: z.string(),
	sha: z.string(),
	bam: z.object({
		loiDan: z.string().length(64),
		thuoc: z.string().length(64),
	}),
	moHinh: z.string(),
	judge: z.string(),
	lanChay: z.string(),
	maEve: z.number().nullable(),
	tong: z.number().int(),
	dat: z.number().int(),
	hong: z.number().int(),
	duoiNguong: z.number().int(),
	boQua: z.number().int(),
	chotMaHong: z.number().int(),
	judgeHong: z.number().int(),
	judgeDuoiNguong: z.number().int(),
	tieuChiTrungBinh: z.array(z.number().nullable()),
	p50: z.number().nullable(),
	p90: z.number().nullable(),
	usd: z.number(),
	soDeXuat: z.number().int(),
	chuCu: z.array(z.unknown()),
	ketLuanThuocGoc: z.object({ ma: z.number(), cau: z.string().nullable() }),
});
export type Soan = z.infer<typeof khuonSoan>;

export const khuonSoanMh4 = khuonSoan.extend({
	khongNopDeXuat: z.boolean().optional(),
	modelGateway: z.string().nullable(),
	bamSuaTam: z.string().length(64),
	bamCommit: z.string().length(40),
	ung_vien: maUng.optional(),
	aichiphi: z.string().optional(),
});
export type SoanMh4 = z.infer<typeof khuonSoanMh4>;
export const khuonSoanTho = khuonSoanMh4.omit({
	modelGateway: true,
	bamSuaTam: true,
	bamCommit: true,
});
export type SoanTho = z.infer<typeof khuonSoanTho>;

export const khuonChiPhi = z.object({
	tran_usd: z.number().positive(),
	luot: z.array(
		z.object({
			vai: z.enum(VAI_CHI),
			luot: z.string().min(1),
			luc: z.string().min(1),
			trang_thai: z.enum(["da-chay", "dung-vi-tran"]),
			usd: z.number().nonnegative().nullable(),
			tep: z.string().nullable(),
		}),
	),
});
export type ChiPhi = z.infer<typeof khuonChiPhi>;
export type DongChi = ChiPhi["luot"][number];

export const VAI = [
	"tac-nhan",
	"tro-ly-kho",
	"soan-okr",
	"judge-okr",
	"may-soan-kho",
] as const;
export const TRANG_THAI = ["đạt", "không đạt", "chưa đủ số"] as const;
export type TrangThai = (typeof TRANG_THAI)[number];

export const khuonSo = z.object({
	ten: z.string().min(1),
	gia_tri: z.union([z.number(), z.string()]),
	tep: z.string().min(1),
});
export type So = z.infer<typeof khuonSo>;
export const khuonUngVienBang = z.object({
	ma: maUng,
	model: z.string().min(1),
	bien_the: z.string().nullable(),
	so: z.array(khuonSo),
	chi_phi_phan_ung_vien: z.number().nullable(),
	tep_chi_phi_phan: z.array(z.string().min(1)),
	chi_phi_that: z.number().nullable(),
	tep_chi_phi_that: z.string().min(1),
	trang_thai: z.enum(TRANG_THAI),
	ly_do: z.string().min(1),
	ngay_do: z.string().nullable(),
	ghi_chu: z.array(z.string()),
});
export type UngVienBang = z.infer<typeof khuonUngVienBang>;
export const khuonHangBang = z.object({
	vai: z.enum(VAI),
	ten: z.string().min(1),
	model_dang_chay: z.string().min(1),
	so_moc: z.array(khuonSo),
	ngay_moc: z.string().nullable(),
	so_do: z.array(khuonSo),
	ung_vien: z.array(khuonUngVienBang),
	kien_nghi: z.string().min(1),
	ly_do: z.string().min(1),
	thong_so_chua_do: z.array(z.string().min(1)),
	ghi_chu: z.array(z.string()),
});
export type HangBang = z.infer<typeof khuonHangBang>;
export const khuonBang = z.object({
	nguong: z.string().min(1),
	ke_hoach: z.string().min(1),
	hang: z.array(khuonHangBang),
});
export type Bang = z.infer<typeof khuonBang>;

export const sha256 = (chu: string | Buffer) =>
	new Bun.CryptoHasher("sha256").update(chu).digest("hex");
