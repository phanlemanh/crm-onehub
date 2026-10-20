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
	model: "zai/glm-5.3-flash",
	tran: 180,
	lechKetXuatMs: 7 * GIO_MS,
	urlGateway: "https://ai-gateway.vercel.sh/v1",
	tep: {
		keHoach: "ke-hoach.json",
		keHoachTacNhan: "ke-hoach-tac-nhan.json",
		tacNhan: "tac-nhan.jsonl",
		doSuyLuan: "do-suy-luan.json",
		chiPhi: "chi-phi.json",
		bang: "bang-kien-nghi.json",
		bangTacNhan: "bang-tac-nhan.md",
		kho: "kho",
		khoTom: "tom-tat.json",
		khoBaoCao: "do-bo-mau.md",
		khoTungCau: "cham-tung-cau.jsonl",
		khoTraLoi: "cham-bo-do-mau.md",
		soan: (n: number) => `eval-soan-flash-${n}.json`,
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

export const khuonKeHoach = z.object({
	nguon: z.string().min(1),
	model: z.string().min(1),
	tac_nhan: z.object({
		bien_the: z.array(z.enum(["flash", "flash-low"])).min(1),
		so_luot: z.number().int().positive(),
	}),
	tro_ly_kho: z.object({ so_luot: z.number().int().positive() }),
	soan_okr: z.object({
		so_luot: z.number().int().positive(),
		moc: z.string().min(1),
	}),
	tran_usd: z.number().positive(),
	thong_so_chua_do: z.array(z.string().min(1)),
});
export type KeHoach = z.infer<typeof khuonKeHoach>;

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
});
export type Nguong = z.infer<typeof khuonNguong>;

export const khuonKeHoachTacNhan = z.object({
	bam_agent_goc: z.string().length(64),
	bam_agent_low: z.string().length(64),
});

export const khuonDongTacNhan = z.object({
	bien_the: z.enum(["flash", "flash-low"]),
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
});
export type DongTacNhan = z.infer<typeof khuonDongTacNhan>;

export const khuonHangChiPhi = z.object({
	id: z.string(),
	at: z.string(),
	sessionId: z.string(),
	phienCha: z.string().nullable(),
	modelId: z.string().nullable(),
	inputTokens: z.number().nullable(),
	outputTokens: z.number().nullable(),
	costUsd: z.number().nullable(),
});
export type HangChiPhi = z.infer<typeof khuonHangChiPhi>;

export const khuonSuKienChon = z.array(
	z.object({ sessionId: z.string(), modelId: z.string().min(1) }),
);

const khuonMucSuyLuan = z.object({
	status: z.number(),
	model: z.string().nullable(),
	token_ra: z.number().nullable(),
	token_suy_luan: z.number().nullable(),
	khong_tra_suy_luan: z.boolean(),
});
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
});

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
	usd_nguon: z.literal("so-du-gateway"),
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
	modelGateway: z.string().nullable(),
	bamSuaTam: z.string().length(64),
	bamCommit: z.string().length(40),
});
export type SoanMh4 = z.infer<typeof khuonSoanMh4>;

export const VAI_CHI = ["dao", "tac-nhan", "tro-ly-kho", "soan-okr"] as const;
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

export const VAI = [
	"tac-nhan",
	"tro-ly-kho",
	"soan-okr",
	"judge-okr",
	"may-soan-kho",
] as const;
export const khuonSo = z.object({
	ten: z.string().min(1),
	gia_tri: z.union([z.number(), z.string()]),
	tep: z.string().min(1),
});
export const khuonHangBang = z.object({
	vai: z.enum(VAI),
	ten: z.string().min(1),
	model_dang_chay: z.string().min(1),
	ung_vien: z.string().nullable(),
	so_ung_vien: z.array(khuonSo),
	so_moc: z.array(khuonSo),
	usd_moi_luot: z.number().nullable(),
	kien_nghi: z.string().min(1),
	ly_do: z.string().min(1),
	ngay_do: z.string().nullable(),
	ngay_moc: z.string().nullable(),
	thong_so_chua_do: z.array(z.string().min(1)),
	ghi_chu: z.array(z.string()),
});
export const khuonBang = z.object({
	nguong: z.string().min(1),
	ke_hoach: z.string().min(1),
	hang: z.array(khuonHangBang),
});
export type Bang = z.infer<typeof khuonBang>;
export type HangBang = z.infer<typeof khuonHangBang>;

export const sha256 = (chu: string | Buffer) =>
	new Bun.CryptoHasher("sha256").update(chu).digest("hex");
