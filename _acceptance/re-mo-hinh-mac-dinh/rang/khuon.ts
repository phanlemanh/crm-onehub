import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { TinhNang } from "../../../packages/db/src/ai-chi-phi-danh-muc.ts";
import {
	GOC,
	type HangChiPhi,
	khuonKetXuat,
	khuonSuKienChon,
	MTV,
	sha256,
	z,
} from "../../model-theo-vai-do-lai/rang/khuon";

export { GOC, type HangChiPhi, khuonKetXuat, khuonSuKienChon, sha256, z };

const HO_SO = resolve(import.meta.dir, "..");
const SLUG = "re-mo-hinh-mac-dinh";

export const MH2 = {
	slug: SLUG,
	hoSo: HO_SO,
	evidence: join(HO_SO, "evidence"),
	rang: import.meta.dir,
	chay: join(GOC, ".acceptance-runs", SLUG),
	tep: {
		keHoach: "ke-hoach.json",
		tacNhan: "tac-nhan.jsonl",
		chiPhi: "chi-phi.json",
		kho: "kho",
		khoTom: "tom-tat.json",
		khoKetXuat: "aichiphi.json",
		khoKetXuatGoc: "aichiphi-goc.json",
		khoBaoCao: "do-bo-mau.md",
		khoTungCau: "cham-tung-cau.jsonl",
		khoTraLoi: "cham-bo-do-mau.md",
		khoSuKien: "su-kien.json",
	},
	nguon: {
		settings: "packages/db/src/settings.ts",
		testDanhMuc: "apps/agent/test/model-lui-mac-dinh.integration.spec.ts",
		docs: "docs/agent.md",
		taiLieu: "apps/agent/agent/lib/tai-lieu-config.ts",
		taiLieuNop: "apps/agent/agent/lib/tai-lieu-nop.ts",
		keHoachMh4: "_acceptance/model-theo-vai-do-lai/evidence/ke-hoach.json",
		nguongMh4: MTV.tep.nguong,
		boMau: "_acceptance/bo-cau-hoi-mau/bo-mau.json",
		opportunity: `_acceptance/${SLUG}/opportunity.md`,
		design: `_acceptance/${SLUG}/design.md`,
		modelTs: "apps/agent/agent/lib/model.ts",
		purpose: "packages/validation/src/phien-tac-tu.ts",
		okrAgent: "apps/agent/agent/lib/okr/config.ts",
		okrSoan: "apps/agent-okr/agent/lib/config.ts",
		measureDb: "packages/db/src/measure-database.ts",
		measureSpec: "packages/db/test/measure-db-model.spec.ts",
		agentBuilder: "apps/agent/agent/subagents/agent_builder/agent.ts",
		giaLapKho: "_acceptance/model-theo-vai-do-lai/evidence/kho/ds/luot-1",
		doBoMau: "_acceptance/bo-cau-hoi-mau/rang/do-bo-mau.ts",
	},
	bamNguon: [
		"packages/db/src/settings.ts",
		"apps/agent/agent/lib/model.ts",
		"apps/agent/agent/lib/tai-lieu-config.ts",
		"apps/agent/agent/subagents/agent_builder/agent.ts",
	],
	tinhNang: {
		kho: "tai-lieu.tro-ly",
		gocZalo: "zalo.hoi-crm",
	} satisfies Record<string, TinhNang>,
	cuaSo: 1_000_000,
	trieu: 1_000_000,
	thuChiPhi: { vao: 1_000, ra: 100 },
	sai: { gia: 1e-9, usd: 1e-6 },
	nhomNgoai: "khong-phai-quy-dinh",
	nhanGiaLap: "GIA LAP — khong phai luot that, chi de chay bo so truoc luot do",
	marker: {
		tieuThu: ["<!-- <<<MH2-TIEU-THU -->", "<!-- MH2-TIEU-THU>>> -->"],
		purpose: ["<!-- <<<MH2-PURPOSE -->", "<!-- MH2-PURPOSE>>> -->"],
	},
	quet: {
		goc: ["apps", "packages"],
		boThuMuc: [
			"node_modules",
			".output",
			"generated",
			"test",
			"tests",
			"__tests__",
			"_acceptance",
			".eve",
			".next",
			".turbo",
			"dist",
			".scratch",
		],
		duoi: ".ts",
		boDuoi: [".spec.ts", ".test.ts", ".d.ts"],
		mau: /DEFAULT_AGENT_MODEL|modelTheoVai\(/,
	},
	phamVi: {
		nhanh: "origin/onehub",
		cam: [
			"apps/agent-okr/",
			"apps/agent/agent/lib/okr/",
			"apps/app/components/crm/record-sheet/",
		],
	},
	doi: {
		modelCu: "zai/glm-5.2-fast",
		oCaiDatLa: "google/gemini-3.8-flash",
		tepTieuThuLa: "apps/api/src/settings/mh2-gia-lap.ts",
	},
} as const;

export const VAI = ["tac-nhan", "tro-ly-kho"] as const;
export type Vai = (typeof VAI)[number];

const model = z.string().min(1);
const giaTheoModel = z.record(z.string(), z.number().nonnegative());

export const khuonKeHoach = z.object({
	nguon: z.string().min(1),
	tac_nhan: z.object({
		model,
		so_luot: z.number().int().positive(),
		tran_giay: z.number().positive(),
		luot_qua_toi_thieu: z.number().int().positive(),
	}),
	tro_ly_kho: z.object({
		model,
		so_luot: z.number().int().positive(),
		cau_loi_toi_da: z.number().int().nonnegative(),
		kem_moc_toi_da_moi_tang: z.number().int().nonnegative(),
		moc: z.string().min(1),
	}),
	may_soan_kho: z.object({ model }),
	gia_kho: z.object({
		cach: z.enum(["gateway-tinh-that", "niem-yet"]),
		nguon: z.string().min(1),
		he_so: z.record(z.string(), z.number().positive()),
		vao_moi_trieu: giaTheoModel,
		ra_moi_trieu: giaTheoModel,
	}),
	tran_usd: z.number().positive(),
	vai_doi: z.array(z.enum(VAI)).min(1),
	moc_chi_phi: z.object({
		"tac-nhan": z.object({
			cach: z.literal("aichiphi-that"),
			tep: z.string().min(1),
			model,
		}),
		"tro-ly-kho": z.object({
			cach: z.literal("token-luot-xac-nhan-nhan-gia-model-cu"),
			model,
			vao_moi_trieu: z.number().nonnegative(),
			ra_moi_trieu: z.number().nonnegative(),
		}),
	}),
	nguong_gia_tri: z.object({
		re_hon_toi_thieu_phan_tram: z.number().positive(),
		ngay_doc: z.string().min(1),
	}),
	o_cai_dat_production: z.string().min(1),
});
export type KeHoach = z.infer<typeof khuonKeHoach>;

export const khuonKeHoachMh4 = z.object({
	ung_vien: z.record(
		z.string(),
		z.object({
			model,
			gia: z.object({ vao: z.number(), ra: z.number() }),
		}),
	),
});

export const khuonDongTacNhan = z.object({
	luot: z.number().int().positive(),
	nhan: z.string().optional(),
	bat_dau: z.string(),
	ket_thuc: z.string(),
	giay: z.number().nonnegative(),
	ket_qua: z.enum(["qua", "hong"]),
	ly_do: z.string().nullable(),
	bi_cat: z.boolean(),
	phien_goc: z.string(),
	model_gateway: z.string().nullable(),
	o_cai_dat: z.string().nullable(),
	bam_nguon: z.string().length(64),
	nhat_ky: z.string().min(1),
	aichiphi: z.string().min(1),
	su_kien: z.string().min(1),
});
export type DongTacNhan = z.infer<typeof khuonDongTacNhan>;

export const khuonKhoTom = z.object({
	luot: z.number().int().positive(),
	nhan: z.string().optional(),
	luc: z.string(),
	thu_muc: z.string(),
	ma_do: z.number().int(),
	ma_ghi: z.number().int().nullable(),
	ma_cham: z.number().int().nullable(),
	model_kho: z.string().nullable(),
	model_goc: z.string().nullable(),
	o_cai_dat: z.string().nullable(),
	bam_bo_mau: z.string().length(64),
	bam_nguon: z.string().length(64),
	usd: z.number().nonnegative(),
	usd_vai: z.number().nonnegative(),
	aichiphi: z.string().min(1),
	aichiphi_goc: z.string().min(1),
	su_kien: z.string().min(1).optional(),
	so_phien: z
		.object({
			kho: z.number().int().nonnegative(),
			goc: z.number().int().nonnegative(),
			kho_co_su_kien: z.number().int().nonnegative(),
			goc_co_su_kien: z.number().int().nonnegative(),
		})
		.optional(),
});
export type KhoTom = z.infer<typeof khuonKhoTom>;

export const khuonChiPhi = z.object({
	tran_usd: z.number().positive(),
	luot: z.array(
		z.object({
			vai: z.enum(VAI),
			luot: z.string().regex(/^\d+$/),
			luc: z.string().min(1),
			trang_thai: z.enum(["da-chay", "dung-vi-tran"]),
			usd: z.number().nonnegative().nullable(),
			usd_vai: z.number().nonnegative().nullable(),
			tep: z.string().nullable(),
			nhan: z.string().optional(),
		}),
	),
});
export type ChiPhi = z.infer<typeof khuonChiPhi>;
export type DongChi = ChiPhi["luot"][number];

export const DUONG = {
	nhatKy: (n: number) => `luot-tac-nhan-${n}.log`,
	aichiphi: (n: number) => `aichiphi-tac-nhan-${n}.json`,
	suKien: (n: number) => `su-kien-tac-nhan-${n}.json`,
	kho: (n: number) => `${MH2.tep.kho}/luot-${n}`,
} as const;

export const khoaChi = (vai: Vai, luot: number | string) => `${vai}:${luot}`;

export const tongCost = (hang: readonly HangChiPhi[]) =>
	Number(hang.reduce((s, h) => s + (h.costUsd ?? 0), 0).toFixed(6));

export const docTho = (tep: string) => readFileSync(tep, "utf8");

export function docKeHoach(ev: string = MH2.evidence): KeHoach {
	return khuonKeHoach.parse(JSON.parse(docTho(join(ev, MH2.tep.keHoach))));
}

export function docChiPhi(ev: string = MH2.evidence): ChiPhi | null {
	const tep = join(ev, MH2.tep.chiPhi);
	return existsSync(tep) ? khuonChiPhi.parse(JSON.parse(docTho(tep))) : null;
}

export const tongChi = (c: ChiPhi | null) =>
	(c?.luot ?? []).reduce((s, l) => s + (l.usd ?? 0), 0);

export function conTran(ev: string = MH2.evidence): boolean {
	return tongChi(docChiPhi(ev)) < docKeHoach(ev).tran_usd;
}

export function ghiChi(ev: string, muc: DongChi) {
	const c = docChiPhi(ev) ?? { tran_usd: docKeHoach(ev).tran_usd, luot: [] };
	c.tran_usd = docKeHoach(ev).tran_usd;
	const i = c.luot.findIndex((l) => l.vai === muc.vai && l.luot === muc.luot);
	if (i >= 0) c.luot[i] = muc;
	else c.luot.push(muc);
	c.luot.sort((a, b) => a.luc.localeCompare(b.luc));
	writeFileSync(join(ev, MH2.tep.chiPhi), `${JSON.stringify(c, null, 2)}\n`);
}

export const TINH_NANG_KHO = [MH2.tinhNang.kho, MH2.tinhNang.gocZalo] as const;

export const khuonSuKienKho = z.array(
	z.object({
		sessionId: z.string().min(1),
		modelId: z.string().min(1),
		tinhNang: z.enum(TINH_NANG_KHO),
	}),
);
export type SuKienKho = z.infer<typeof khuonSuKienKho>;

export function boDongChi(ev: string, vai: Vai, luot: number) {
	const c = docChiPhi(ev);
	if (!c) return;
	c.luot = c.luot.filter((l) => !(l.vai === vai && l.luot === String(luot)));
	writeFileSync(join(ev, MH2.tep.chiPhi), `${JSON.stringify(c, null, 2)}\n`);
}

export function ghiDungTran(ev: string, vai: Vai, luot: number) {
	ghiChi(ev, {
		vai,
		luot: String(luot),
		luc: new Date().toISOString(),
		trang_thai: "dung-vi-tran",
		usd: null,
		usd_vai: null,
		tep: null,
	});
}

export function bamNguon(goc: string = GOC): string {
	return sha256(
		MH2.bamNguon.map((t) => `${t}\n${sha256(docTho(join(goc, t)))}`).join("\n"),
	);
}

const khuonDocLai = z.object({ o: z.string().nullable() });

export function datOCaiDatTrong(url: string): string | null {
	const r = spawnSync(
		"bun",
		[
			"-e",
			`import { db } from ${JSON.stringify(join(GOC, "packages/db/src/client.ts"))};
import { SETTINGS_ID, writeAgentModel } from ${JSON.stringify(join(GOC, MH2.nguon.settings))};
try {
	await writeAgentModel(db, null);
	const r = await db.appSetting.findUnique({ where: { id: SETTINGS_ID }, select: { agentModelId: true } });
	console.log(JSON.stringify({ o: r?.agentModelId ?? null }));
} finally {
	await db.$disconnect();
}`,
		],
		{ cwd: GOC, encoding: "utf8", env: { ...process.env, DATABASE_URL: url } },
	);
	if (r.status !== 0)
		throw new Error(
			`khong dat duoc o cai dat model: ${(r.stderr || r.stdout).trim().split("\n").at(-1)}`,
		);
	return khuonDocLai.parse(
		JSON.parse(r.stdout.trim().split("\n").at(-1) ?? "{}"),
	).o;
}
