import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import {
	bam,
	docBaoCao,
	kiemBangChung,
} from "../../bo-cau-hoi-mau/rang/bang-do";
import { phienCuaLog } from "../../model-theo-vai-do-lai/rang/do-tac-nhan";
import { khuonNguong } from "../../model-theo-vai-do-lai/rang/khuon";
import { soKho } from "../../model-theo-vai-do-lai/rang/so-do";
import { docTungCau } from "../../tro-ly-doc-kho/rang/quyet-do";
import { modelGocTu, modelKhoTu } from "./do-kho";
import { docDong, ketQuaLog } from "./do-tac-nhan";
import {
	bamNguon,
	type ChiPhi,
	DUONG,
	docChiPhi,
	docTho,
	GOC,
	type KeHoach,
	khoaChi,
	khuonDongTacNhan,
	khuonKeHoachMh4,
	khuonKetXuat,
	khuonKhoTom,
	khuonSuKienChon,
	MH2,
	tongCost,
	type Vai,
	z,
} from "./khuon";

export type Ket = { hong: string[]; dong: string[] };

export type Nguon = {
	goc: string;
	ev: string;
	settings: string;
	fixture: string;
	docs: string;
	taiLieu: string;
	opportunity: string;
	design: string;
	that: boolean;
};

const tuyet = (rel: string) => join(GOC, rel);

export function tepDanhMuc(): string {
	const test = tuyet(MH2.nguon.testDanhMuc);
	const khoi = docTho(test).match(/const FIXTURE = join\(([\s\S]*?)\);/)?.[1];
	if (!khoi?.includes("dirname(fileURLToPath(import.meta.url))"))
		throw new Error(`khong doc duoc duong fixture tu ${MH2.nguon.testDanhMuc}`);
	const phan = [...khoi.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "");
	return join(dirname(test), ...phan);
}

export const nguonThat = (): Nguon => ({
	goc: GOC,
	ev: MH2.evidence,
	settings: tuyet(MH2.nguon.settings),
	fixture: tepDanhMuc(),
	docs: tuyet(MH2.nguon.docs),
	taiLieu: tuyet(MH2.nguon.taiLieu),
	opportunity: tuyet(MH2.nguon.opportunity),
	design: tuyet(MH2.nguon.design),
	that: true,
});

const boChi = new Map<string, string>();
export function chayGit(doiSo: string[]): string {
	const khoa = doiSo.join("\0");
	const co = boChi.get(khoa);
	if (co !== undefined) return co;
	const r = spawnSync("git", ["-C", GOC, ...doiSo], { encoding: "utf8" });
	if (r.status !== 0)
		throw new Error(
			`git ${doiSo.join(" ")} loi: ${(r.stderr || "").trim().split("\n").at(-1)}`,
		);
	boChi.set(khoa, r.stdout);
	return r.stdout;
}

const khuonMacDinh = z.object({
	DEFAULT_AGENT_MODEL: z.object({
		id: z.string(),
		contextWindowTokens: z.number(),
	}),
});
const khuonDanhMuc = z.object({ data: z.array(z.object({ id: z.string() })) });

export async function macDinhCua(tep: string) {
	return khuonMacDinh.parse(await import(tep)).DEFAULT_AGENT_MODEL;
}

export function macDinhTrongDocs(md: string): string | null {
	const mo = "\n## Model\n";
	const i = md.indexOf(mo);
	if (i < 0) return null;
	const sau = md.slice(i + mo.length);
	const het = sau.indexOf("\n## ");
	const muc = het < 0 ? sau : sau.slice(0, het);
	const dong = muc.split("\n").find((d) => d.startsWith("Default "));
	return dong?.match(/`([^`]+)`/)?.[1] ?? null;
}

export async function kiemE1(n: Nguon, ke: KeHoach): Promise<Ket> {
	const hong: string[] = [];
	const m = await macDinhCua(n.settings);
	if (m.id !== ke.tac_nhan.model)
		hong.push(
			`mac dinh tac nhan lech: DEFAULT_AGENT_MODEL ${m.id}, ke-hoach ${ke.tac_nhan.model}`,
		);
	if (m.contextWindowTokens !== MH2.cuaSo)
		hong.push(
			`cua so ngu canh lech: ${m.contextWindowTokens}, phai ${MH2.cuaSo}`,
		);
	const ids = new Set(
		khuonDanhMuc.parse(JSON.parse(docTho(n.fixture))).data.map((x) => x.id),
	);
	if (!ids.has(m.id))
		hong.push(
			`thieu trong danh muc: ${m.id} khong co trong ${relative(GOC, n.fixture)}`,
		);
	const docs = macDinhTrongDocs(docTho(n.docs));
	if (docs !== m.id)
		hong.push(
			`docs agent lech: dong Default muc Model ghi ${docs ?? "(khong co)"}, phai ${m.id}`,
		);
	return {
		hong,
		dong: [
			`mac dinh tac nhan ${m.id}, cua so ${m.contextWindowTokens}, co trong danh muc ${relative(GOC, n.fixture)} (${ids.size} model), docs ghi ${docs ?? "?"}`,
		],
	};
}

const khuonTaiLieu = z.object({
	TAI_LIEU_AGENT: z.object({
		hoi: z.object({
			maModel: z.string(),
			gateway: z.object({ zeroDataRetention: z.boolean() }),
		}),
		soan: z.object({ maModel: z.string() }),
		bangGia: z.record(
			z.string(),
			z.object({ vaoMoiTrieu: z.number(), raMoiTrieu: z.number() }),
		),
	}),
});

export async function taiLieuCua(tep: string) {
	return khuonTaiLieu.parse(await import(tep)).TAI_LIEU_AGENT;
}

const lech = (a: number, b: number) => Math.abs(a - b) > MH2.sai.gia;

export async function kiemE3(n: Nguon, ke: KeHoach): Promise<Ket> {
	const hong: string[] = [];
	const dong: string[] = [];
	const t = await taiLieuCua(n.taiLieu);
	const mh4 = khuonKeHoachMh4.parse(
		JSON.parse(docTho(tuyet(MH2.nguon.keHoachMh4))),
	);
	if (t.hoi.maModel !== ke.tro_ly_kho.model)
		hong.push(
			`kho lech ke hoach: hoi.maModel ${t.hoi.maModel}, ke-hoach ${ke.tro_ly_kho.model}`,
		);
	if (!t.hoi.gateway.zeroDataRetention)
		hong.push("mat zdr kho: hoi.gateway.zeroDataRetention khong phai true");
	if (t.soan.maModel !== ke.may_soan_kho.model)
		hong.push(
			`soan lech ke hoach: soan.maModel ${t.soan.maModel}, ke-hoach ${ke.may_soan_kho.model}`,
		);
	for (const m of [...new Set([t.hoi.maModel, t.soan.maModel])]) {
		const g = t.bangGia[m];
		const vao = ke.gia_kho.vao_moi_trieu[m];
		const ra = ke.gia_kho.ra_moi_trieu[m];
		if (!g) {
			hong.push(`thieu gia ${m} trong bangGia`);
			continue;
		}
		if (vao === undefined || ra === undefined) {
			hong.push(`thieu gia ${m} trong ke-hoach.json gia_kho`);
			continue;
		}
		if (lech(g.vaoMoiTrieu, vao) || lech(g.raMoiTrieu, ra))
			hong.push(
				`gia lech ${m}: bangGia ${g.vaoMoiTrieu}/${g.raMoiTrieu}, ke-hoach ${vao}/${ra} USD moi trieu token`,
			);
		const chup = Object.values(mh4.ung_vien).find((u) => u.model === m);
		const heSo =
			ke.gia_kho.cach === "gateway-tinh-that" ? (ke.gia_kho.he_so[m] ?? 1) : 1;
		if (
			chup &&
			(lech(chup.gia.vao * MH2.trieu * heSo, vao) ||
				lech(chup.gia.ra * MH2.trieu * heSo, ra))
		)
			hong.push(
				`gia lech ${m}: ke-hoach ${vao}/${ra} khac gia chup MH4 × he so ${heSo}`,
			);
		dong.push(
			`gia ${m}: ${g.vaoMoiTrieu}/${g.raMoiTrieu} USD moi trieu token (${ke.gia_kho.cach}${chup ? `, gia chup MH4 × ${heSo}` : ""})`,
		);
	}
	const { chiPhiUsd } = await import(
		"../../../apps/agent/agent/lib/tai-lieu-nop.ts"
	);
	const m = ke.tro_ly_kho.model;
	const ra = chiPhiUsd(m, MH2.thuChiPhi.vao, MH2.thuChiPhi.ra);
	const mong =
		(MH2.thuChiPhi.vao * (ke.gia_kho.vao_moi_trieu[m] ?? 0) +
			MH2.thuChiPhi.ra * (ke.gia_kho.ra_moi_trieu[m] ?? 0)) /
		MH2.trieu;
	if (ra === null || ra <= 0 || lech(ra, mong))
		hong.push(
			`chi phi kho sai: chiPhiUsd(${m}, ${MH2.thuChiPhi.vao}, ${MH2.thuChiPhi.ra}) = ${ra}, cong thuc gia ${mong}`,
		);
	dong.push(
		`kho ${t.hoi.maModel} zdr ${t.hoi.gateway.zeroDataRetention}, soan ${t.soan.maModel}, chiPhiUsd ${ra}`,
	);
	return { hong, dong };
}

function dungTran(c: ChiPhi | null, vai: Vai): Set<number> {
	return new Set(
		(c?.luot ?? [])
			.filter((l) => l.vai === vai && l.trang_thai === "dung-vi-tran")
			.map((l) => Number(l.luot)),
	);
}

const giaLapThat = (n: Nguon, nhan: string | undefined, ten: string) =>
	n.that && nhan !== undefined
		? [`bang chung gia lap trong evidence that: ${ten}`]
		: [];

export function kiemE4(n: Nguon, ke: KeHoach): Ket {
	const hong: string[] = [];
	const dong: string[] = [];
	const ng = khuonNguong.parse(
		JSON.parse(docTho(MH2.nguon.nguongMh4)),
	).tac_nhan;
	const tn = ke.tac_nhan;
	if (
		tn.tran_giay !== ng.tran_giay ||
		tn.luot_qua_toi_thieu !== ng.luot_qua_toi_thieu ||
		tn.so_luot !== ng.tren_so_luot
	)
		hong.push("ke hoach lech nguong MH4 tac_nhan");
	const dt = dungTran(docChiPhi(n.ev), "tac-nhan");
	const tho = docDong(n.ev);
	if (!tho.length && !dt.size)
		return {
			hong: [...hong, `thieu bang chung ${MH2.tep.tacNhan}`],
			dong,
		};
	const bamNg = bamNguon();
	const thay = new Set<number>();
	let qua = 0;
	for (const t of tho) {
		const d = khuonDongTacNhan.parse(JSON.parse(t));
		const l = d.luot;
		if (l > tn.so_luot || thay.has(l) || dt.has(l)) {
			hong.push(`thua luot tac-nhan ${l}`);
			continue;
		}
		thay.add(l);
		hong.push(...giaLapThat(n, d.nhan, `tac-nhan ${l}`));
		const vang = [d.aichiphi, d.su_kien, d.nhat_ky].filter(
			(f) => !existsSync(join(n.ev, f)),
		);
		if (vang.length) {
			hong.push(...vang.map((f) => `thieu ket xuat ${f}`));
			continue;
		}
		const hang = khuonKetXuat.parse(JSON.parse(docTho(join(n.ev, d.aichiphi))));
		if (
			!hang.some(
				(h) => h.phienCha === d.phien_goc && h.sessionId !== d.phien_goc,
			)
		)
			hong.push(`thieu phien con tac-nhan ${l}`);
		const sk = [
			...new Set(
				khuonSuKienChon
					.parse(JSON.parse(docTho(join(n.ev, d.su_kien))))
					.map((s) => s.modelId),
			),
		];
		if ((sk.length === 1 ? sk[0] : null) !== d.model_gateway)
			hong.push(`lech su kien ${l}`);
		const log = docTho(join(n.ev, d.nhat_ky));
		if (ketQuaLog(log) !== d.ket_qua || phienCuaLog(log) !== d.phien_goc)
			hong.push(`lech nhat ky ${l}`);
		if (d.bi_cat && d.ket_qua === "qua") hong.push(`bi cat lech ${l}`);
		if (d.bam_nguon !== bamNg) hong.push(`nguon doi sau luot tac-nhan ${l}`);
		let hopLe = true;
		if (d.model_gateway !== tn.model) {
			hong.push(
				`sai model tac-nhan ${l} (${d.model_gateway ?? "khong doc duoc"})`,
			);
			hopLe = false;
		}
		if (d.o_cai_dat !== null) {
			hong.push(`o cai dat khong trong ${l} (${d.o_cai_dat})`);
			hopLe = false;
		}
		const duoiTran = d.ket_qua === "qua" && !d.bi_cat && d.giay < tn.tran_giay;
		if (hopLe && duoiTran) qua++;
		dong.push(
			`tac-nhan luot ${l}: ${d.ket_qua} ${d.giay}s bi_cat ${d.bi_cat} model gateway ${d.model_gateway ?? "?"} o cai dat ${d.o_cai_dat ?? "null"} usd ${tongCost(hang)}`,
		);
	}
	for (let l = 1; l <= tn.so_luot; l++)
		if (!thay.has(l) && !dt.has(l)) hong.push(`thieu luot tac-nhan ${l}`);
	if (dt.size) {
		dong.push(`tac-nhan: ${dt.size} luot dung vi tran, ket luan o E6`);
		return { hong, dong };
	}
	if (qua >= ng.luot_qua_toi_thieu)
		dong.push(`tac nhan dat ${qua}/${tn.so_luot}`);
	else
		hong.push(
			`tac nhan khong dat: ${qua}/${tn.so_luot} luot qua duoi ${tn.tran_giay} giay, nguong ${ng.luot_qua_toi_thieu}`,
		);
	return { hong, dong };
}

const khuonBo = z.object({
	cau: z.array(z.object({ id: z.string(), nhom: z.string() })),
});

function mocKhoSo(ke: KeHoach) {
	const bc = docBaoCao(docTho(tuyet(ke.tro_ly_kho.moc)));
	if (!bc) throw new Error(`khong doc duoc khoi bang moc ${ke.tro_ly_kho.moc}`);
	return soKho(bc.bang);
}

function soMa(ten: string, can: string[], co: string[]): string[] {
	const tap = new Set(co);
	const canTap = new Set(can);
	return [
		...can.filter((m) => !tap.has(m)).map((m) => `thieu ma ${m} ${ten}`),
		...[...tap].filter((m) => !canTap.has(m)).map((m) => `thua ma ${m} ${ten}`),
	];
}

export function kiemE5(n: Nguon, ke: KeHoach): Ket {
	const hong: string[] = [];
	const dong: string[] = [];
	const kh = ke.tro_ly_kho;
	const boTho = docTho(tuyet(MH2.nguon.boMau));
	const bo = khuonBo.parse(JSON.parse(boTho));
	const dt = dungTran(docChiPhi(n.ev), "tro-ly-kho");
	const moc = mocKhoSo(ke);
	for (let l = 1; l <= kh.so_luot; l++) {
		if (dt.has(l)) {
			dong.push(`kho luot ${l}: dung vi tran, ket luan o E6`);
			continue;
		}
		const rel = DUONG.kho(l);
		const thu = join(n.ev, rel);
		if (!existsSync(join(thu, MH2.tep.khoTom))) {
			hong.push(`thieu bang chung ${rel}/${MH2.tep.khoTom}`);
			continue;
		}
		const tom = khuonKhoTom.parse(
			JSON.parse(docTho(join(thu, MH2.tep.khoTom))),
		);
		hong.push(...giaLapThat(n, tom.nhan, rel));
		const tep = [MH2.tep.khoBaoCao, MH2.tep.khoTungCau, MH2.tep.khoTraLoi];
		const vang = tep.filter((f) => !existsSync(join(thu, f)));
		if (vang.length) {
			hong.push(...vang.map((f) => `thieu ${rel}/${f}`));
			continue;
		}
		const md = docTho(join(thu, MH2.tep.khoBaoCao));
		const jsonl = docTho(join(thu, MH2.tep.khoTungCau));
		const traLoi = docTho(join(thu, MH2.tep.khoTraLoi));
		if (tom.o_cai_dat !== null)
			hong.push(`o cai dat khong trong kho luot ${l} (${tom.o_cai_dat})`);
		const mk = modelKhoTu(traLoi);
		const mg = modelGocTu(traLoi);
		if (tom.model_kho !== mk || tom.model_goc !== mg)
			hong.push(`tom tat lech ${MH2.tep.khoTraLoi} kho luot ${l}`);
		if (mk !== kh.model) hong.push(`sai model kho (${mk ?? "khong doc duoc"})`);
		if (mg !== ke.tac_nhan.model)
			hong.push(`sai model goc zalo (${mg ?? "khong doc duoc"})`);
		if (tom.bam_bo_mau !== bam(boTho))
			hong.push(`bo-mau doi sau luot kho ${l}`);
		if (tom.bam_nguon !== bamNguon()) hong.push(`nguon doi sau luot kho ${l}`);
		for (const [f, tn] of [
			[tom.aichiphi, MH2.tinhNang.kho],
			[tom.aichiphi_goc, MH2.tinhNang.gocZalo],
		] as const) {
			if (!existsSync(join(n.ev, f))) {
				hong.push(`thieu ket xuat ${f}`);
				continue;
			}
			const hang = khuonKetXuat.parse(JSON.parse(docTho(join(n.ev, f))));
			if (hang.some((h) => h.tinhNang !== tn))
				hong.push(`ket xuat sai tinh nang ${f}`);
		}
		let dongCau: { luot: number; id: string }[] = [];
		try {
			dongCau = docTungCau(jsonl);
		} catch (loi) {
			hong.push(
				`${MH2.tep.khoTungCau} sai khuon: ${loi instanceof Error ? loi.message : String(loi)}`,
			);
		}
		hong.push(
			...soMa(
				"vong mot",
				bo.cau.filter((c) => c.nhom !== MH2.nhomNgoai).map((c) => c.id),
				dongCau.filter((d) => d.luot === 1).map((d) => d.id),
			),
			...soMa(
				"vong hai",
				bo.cau.map((c) => c.id),
				dongCau.filter((d) => d.luot === 2).map((d) => d.id),
			),
		);
		if (!md.includes("## Tổng"))
			hong.push(`thieu dong Tổng ${rel}/${MH2.tep.khoBaoCao}`);
		const k = kiemBangChung(boTho, md, jsonl);
		if (!k.ok) {
			hong.push(`kho bang lech: ${k.loi}`);
			continue;
		}
		const so = soKho(k.bang);
		for (const [t, o] of Object.entries(k.bang.tang))
			dong.push(`kho luot ${l} mot.${t}: ${o.k}/${o.n} loi ${o.loi}`);
		for (const [t, o] of Object.entries(k.bang.zalo))
			dong.push(`kho luot ${l} hai.${t}: ${o.k}/${o.n} loi ${o.loi}`);
		dong.push(
			`kho luot ${l}: model kho ${mk} · goc ${mg} · o cai dat null · ma cham ${k.maCham} · khong dat [${k.bang.khongDat.join("; ")}]`,
		);
		const lyDo: string[] = [];
		for (const [t, m] of Object.entries(moc.tang)) {
			const x = so.tang[t] ?? 0;
			if (x < m - kh.kem_moc_toi_da_moi_tang)
				lyDo.push(`tang ${t} dung ${x}, moc ${m}`);
		}
		if (so.loi > kh.cau_loi_toi_da)
			lyDo.push(`${so.loi} cau loi, tran ${kh.cau_loi_toi_da}`);
		if (lyDo.length) hong.push(`kho khong dat: ${lyDo.join("; ")}`);
		else
			dong.push(
				`kho dat: moi tang khong kem moc 13/10 qua ${kh.kem_moc_toi_da_moi_tang} cau, ${so.loi} cau loi ≤ ${kh.cau_loi_toi_da}`,
			);
	}
	return { hong, dong };
}

type Tinh = { usd: number; vai: number; tep: string };

function tinhLai(n: Nguon, ke: KeHoach): Map<string, Tinh> {
	const ra = new Map<string, Tinh>();
	for (const t of docDong(n.ev)) {
		const d = khuonDongTacNhan.parse(JSON.parse(t));
		if (!existsSync(join(n.ev, d.aichiphi))) continue;
		const u = tongCost(
			khuonKetXuat.parse(JSON.parse(docTho(join(n.ev, d.aichiphi)))),
		);
		ra.set(khoaChi("tac-nhan", d.luot), { usd: u, vai: u, tep: d.aichiphi });
	}
	for (let l = 1; l <= ke.tro_ly_kho.so_luot; l++) {
		const tep = `${DUONG.kho(l)}/${MH2.tep.khoTom}`;
		if (!existsSync(join(n.ev, tep))) continue;
		const tom = khuonKhoTom.parse(JSON.parse(docTho(join(n.ev, tep))));
		const tong = (f: string) =>
			existsSync(join(n.ev, f))
				? tongCost(khuonKetXuat.parse(JSON.parse(docTho(join(n.ev, f)))))
				: 0;
		const vai = tong(tom.aichiphi);
		ra.set(khoaChi("tro-ly-kho", l), {
			usd: Number((vai + tong(tom.aichiphi_goc)).toFixed(6)),
			vai,
			tep,
		});
	}
	return ra;
}

const lechUsd = (a: number, b: number | null) =>
	b === null || Math.abs(a - b) > MH2.sai.usd;

export function kiemE6(n: Nguon, ke: KeHoach): Ket {
	const hong: string[] = [];
	const c = docChiPhi(n.ev);
	if (!c) return { hong: [`thieu bang chung ${MH2.tep.chiPhi}`], dong: [] };
	if (c.tran_usd !== ke.tran_usd)
		hong.push(`tran chi phi lech ke-hoach: ${c.tran_usd}, ${ke.tran_usd}`);
	const soLuot = {
		"tac-nhan": ke.tac_nhan.so_luot,
		"tro-ly-kho": ke.tro_ly_kho.so_luot,
	};
	const thay = new Set<string>();
	for (const l of c.luot) {
		const k = khoaChi(l.vai, l.luot);
		if (thay.has(k)) hong.push(`trung khoa chi phi ${k}`);
		thay.add(k);
		const so = Number(l.luot);
		if (so < 1 || so > soLuot[l.vai]) hong.push(`khoa chi phi la ${k}`);
		hong.push(...giaLapThat(n, l.nhan, `chi-phi ${k}`));
	}
	const tinh = tinhLai(n, ke);
	for (const k of tinh.keys())
		if (!thay.has(k)) hong.push(`thieu dong chi phi ${k}`);
	let cong = 0;
	const thieu = new Set<Vai>();
	for (const l of [...c.luot].sort((a, b) => a.luc.localeCompare(b.luc))) {
		const k = khoaChi(l.vai, l.luot);
		const t = tinh.get(k);
		if (l.trang_thai === "dung-vi-tran") {
			if (l.tep !== null || l.usd !== null || t)
				hong.push(`dung vi tran ma co tep ${k}`);
			thieu.add(l.vai);
			continue;
		}
		if (cong >= ke.tran_usd) hong.push(`vuot tran van chay ${k}`);
		if (!t) hong.push(`dong chi phi khong co bang chung ${k}`);
		else {
			if (lechUsd(t.usd, l.usd) || lechUsd(t.vai, l.usd_vai))
				hong.push(
					`lech usd ${k}: chi-phi ${l.usd}/${l.usd_vai}, ket xuat ${t.usd}/${t.vai}`,
				);
			if (l.tep !== t.tep) hong.push(`tep chi phi lech ${k}`);
		}
		cong += l.usd ?? 0;
	}
	if (cong > ke.tran_usd + MH2.sai.gia)
		hong.push(`tong vuot tran: ${cong.toFixed(6)} > ${ke.tran_usd}`);
	for (const v of thieu) hong.push(`chua du so ${v}: co luot dung vi tran`);
	return {
		hong,
		dong: [
			`tong chi Gateway that ${cong.toFixed(6)} / tran ${ke.tran_usd} USD`,
		],
	};
}

const TRUONG_O = ["stage", "decision", "decided_by", "decided_at"] as const;
const truongCua = (md: string, f: string) =>
	md.match(new RegExp(`^${f}:[ \\t]*(\\S*)`, "m"))?.[1] ?? null;

export type BanGoc = { ten: string; tho: string };

export function banGocCoHoi(): BanGoc {
	const rel = MH2.nguon.opportunity;
	const r = spawnSync(
		"git",
		["-C", GOC, "show", `${MH2.phamVi.nhanh}:${rel}`],
		{ encoding: "utf8" },
	);
	if (r.status === 0) return { ten: MH2.phamVi.nhanh, tho: r.stdout };
	const dau = chayGit(["log", "--diff-filter=A", "--format=%H", "--", rel])
		.split("\n")
		.filter(Boolean)
		.at(-1);
	if (!dau) throw new Error(`khong tim duoc ban goc cua ${rel}`);
	return { ten: dau.slice(0, 9), tho: chayGit(["show", `${dau}:${rel}`]) };
}

export function kiemCoHoi(md: string, goc: string, ke: KeHoach): string[] {
	const hong: string[] = [];
	for (const f of TRUONG_O)
		if (truongCua(md, f) !== truongCua(goc, f))
			hong.push(
				`o co hoi bi sua: ${f} ${truongCua(md, f) ?? "-"}, ban goc ${truongCua(goc, f) ?? "-"}`,
			);
	const i = md.indexOf("## Ngưỡng chết / ngưỡng UAT");
	const muc = i < 0 ? "" : md.slice(i);
	const song =
		muc.match(/^- Kết quả nào là SỐNG:[ \t]*(.*)$/m)?.[1]?.trim() ?? "";
	const chet =
		muc.match(/^- Kết quả nào là CHẾT:[ \t]*(.*)$/m)?.[1]?.trim() ?? "";
	const han = muc.match(/^- Timebox:[ \t]*(.*)$/m)?.[1] ?? "";
	if (!song.includes(`${ke.nguong_gia_tri.re_hon_toi_thieu_phan_tram}%`))
		hong.push("thieu nguong song trong opportunity.md");
	if (!chet) hong.push("thieu nguong chet trong opportunity.md");
	if (!han.includes(ke.nguong_gia_tri.ngay_doc))
		hong.push(
			`thieu ngay doc ${ke.nguong_gia_tri.ngay_doc} trong opportunity.md`,
		);
	return hong;
}

const tb = (xs: number[]) =>
	xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;

function mocTacNhan(ke: KeHoach): number | null {
	const tep = [
		...new Bun.Glob(ke.moc_chi_phi["tac-nhan"].tep).scanSync({ cwd: GOC }),
	];
	return tb(
		tep.map((f) => tongCost(khuonKetXuat.parse(JSON.parse(docTho(tuyet(f)))))),
	);
}

function mocKho(n: Nguon, ke: KeHoach): number | null {
	const g = ke.moc_chi_phi["tro-ly-kho"];
	const luot: number[] = [];
	for (let l = 1; l <= ke.tro_ly_kho.so_luot; l++) {
		const tep = join(n.ev, DUONG.kho(l), MH2.tep.khoTom);
		if (!existsSync(tep)) continue;
		const tom = khuonKhoTom.parse(JSON.parse(docTho(tep)));
		if (!existsSync(join(n.ev, tom.aichiphi))) continue;
		const hang = khuonKetXuat.parse(
			JSON.parse(docTho(join(n.ev, tom.aichiphi))),
		);
		luot.push(
			hang.reduce(
				(s, h) =>
					s +
					((h.inputTokens ?? 0) * g.vao_moi_trieu +
						(h.outputTokens ?? 0) * g.ra_moi_trieu) /
						MH2.trieu,
				0,
			),
		);
	}
	return tb(luot);
}

export async function kiemE8(n: Nguon, ke: KeHoach): Promise<Ket> {
	const goc = banGocCoHoi();
	const hong = kiemCoHoi(docTho(n.opportunity), goc.tho, ke);
	const dong: string[] = [
		`o co hoi: bon truong so voi ban ${goc.ten}, nguong song/chet va ngay doc ${ke.nguong_gia_tri.ngay_doc}`,
	];
	const t = await taiLieuCua(n.taiLieu);
	const gk = ke.moc_chi_phi["tro-ly-kho"];
	const gc = t.bangGia[gk.model];
	if (
		!gc ||
		lech(gc.vaoMoiTrieu, gk.vao_moi_trieu) ||
		lech(gc.raMoiTrieu, gk.ra_moi_trieu)
	)
		hong.push(`moc kho lech bangGia ${gk.model}`);
	const c = docChiPhi(n.ev);
	if (!c)
		return { hong: [...hong, `thieu bang chung ${MH2.tep.chiPhi}`], dong };
	for (const vai of ke.vai_doi) {
		const moc = vai === "tac-nhan" ? mocTacNhan(ke) : mocKho(n, ke);
		const thuc = tb(
			c.luot
				.filter((l) => l.vai === vai && l.trang_thai === "da-chay")
				.map((l) => l.usd_vai ?? 0),
		);
		if (thuc === null) {
			hong.push(`thieu luot ${vai} trong ${MH2.tep.chiPhi}`);
			continue;
		}
		if (moc === null || moc <= 0) {
			hong.push(`thieu moc ${vai}`);
			continue;
		}
		const so = `thuc ${thuc.toFixed(6)}, moc ${moc.toFixed(6)} USD moi luot`;
		dong.push(
			thuc < moc
				? `re hon ${vai} ${(((moc - thuc) / moc) * 100).toFixed(1)}% (${so})`
				: `khong re hon ${vai} (${so})`,
		);
	}
	return { hong, dong };
}

function duyet(goc: string, thu: string, ra: string[]) {
	for (const m of readdirSync(join(goc, thu), { withFileTypes: true })) {
		const rel = join(thu, m.name);
		if (m.isDirectory()) {
			if (!(MH2.quet.boThuMuc as readonly string[]).includes(m.name))
				duyet(goc, rel, ra);
			continue;
		}
		if (
			m.isFile() &&
			m.name.endsWith(MH2.quet.duoi) &&
			!MH2.quet.boDuoi.some((d) => m.name.endsWith(d))
		)
			ra.push(rel);
	}
}

export function tepNguon(goc: string): string[] {
	const ra: string[] = [];
	for (const g of MH2.quet.goc) if (existsSync(join(goc, g))) duyet(goc, g, ra);
	return ra.sort();
}

export function quetTieuThu(goc: string): string[] {
	return tepNguon(goc).filter((f) => MH2.quet.mau.test(docTho(join(goc, f))));
}

export function khoiMarker(
	md: string,
	[mo, dong]: readonly [string, string],
): string[] | null {
	const i = md.indexOf(mo);
	const j = md.indexOf(dong);
	if (i < 0 || j < i) return null;
	return md
		.slice(i + mo.length, j)
		.split("\n")
		.map((d) => d.trim())
		.filter(Boolean);
}

export function purposeLui(
	modelTs: string,
	purposeTs: string,
): string[] | null {
	const ds = purposeTs.match(/SESSION_PURPOSES = \[([\s\S]*?)\] as const/)?.[1];
	const mo = modelTs.indexOf("export function modelChoPhienGoc(");
	const het = modelTs.indexOf("return modelTheoVai(vaiCuaPhien(ctx));", mo);
	if (!ds || mo < 0 || het < 0) return null;
	const loai = new Set(
		[...modelTs.slice(mo, het).matchAll(/purposeOf\(ctx\) === "([^"]+)"/g)].map(
			(m) => m[1],
		),
	);
	return [...ds.matchAll(/"([^"]+)"/g)]
		.map((m) => m[1] ?? "")
		.filter((p) => !loai.has(p));
}

export function purposeCay(goc: string): string[] | null {
	return purposeLui(
		docTho(join(goc, MH2.nguon.modelTs)),
		docTho(join(goc, MH2.nguon.purpose)),
	);
}

const hieu = (a: string[], b: string[]) => a.filter((x) => !b.includes(x));

export function kiemE9(n: Nguon): Ket {
	const hong: string[] = [];
	const md = docTho(n.design);
	const ke = khoiMarker(md, MH2.marker.tieuThu);
	const kp = khoiMarker(md, MH2.marker.purpose);
	if (!ke || !kp)
		return {
			hong: ["thieu marker MH2-TIEU-THU hay MH2-PURPOSE trong design.md"],
			dong: [],
		};
	const thuc = quetTieuThu(n.goc);
	hong.push(
		...hieu(thuc, ke).map((f) => `tieu thu chua ke ${f}`),
		...hieu(ke, thuc).map((f) => `tieu thu ke thua ${f}`),
	);
	const p = purposeCay(n.goc);
	if (!p)
		return {
			hong: [...hong, `khong doc duoc purpose tu ${MH2.nguon.modelTs}`],
			dong: [],
		};
	hong.push(
		...hieu(p, kp).map((x) => `purpose chua ke ${x}`),
		...hieu(kp, p).map((x) => `purpose ke thua ${x}`),
	);
	return {
		hong,
		dong: [
			`tieu thu ${thuc.length} tep: ${thuc.join(", ")}`,
			`purpose lui ve vai tro-ly/tac-nhan: ${p.join(", ")}`,
		],
	};
}

export type GiaTriOkr = {
	judgeAgent: string;
	judgeOkr: string;
	troLyOkr: string;
	soanOkr: string;
};

export type VaoPhamVi = {
	tep: string[];
	hienTai: GiaTriOkr;
	onehub: GiaTriOkr;
	khoDo: string;
	macDinh: string;
	specDoi: boolean;
};

export function phamVi(v: VaoPhamVi): string[] {
	const ra = v.tep
		.filter((f) => MH2.phamVi.cam.some((p) => f.startsWith(p)))
		.map((f) => `ngoai pham vi ${f}`);
	const so = [
		["judgeAgent", `judge doi ${MH2.nguon.okrAgent}`],
		["judgeOkr", `judge doi ${MH2.nguon.okrSoan}`],
		["soanOkr", "soan okr doi"],
		["troLyOkr", "tro ly okr doi"],
	] as const;
	for (const [k, tin] of so)
		if (v.hienTai[k] !== v.onehub[k])
			ra.push(`${tin}: ${v.onehub[k]} → ${v.hienTai[k]}`);
	if (v.specDoi) ra.push(`spec kho do doi ${MH2.nguon.measureSpec}`);
	if (v.khoDo === v.macDinh) ra.push(`kho do trung mac dinh ${v.khoDo}`);
	return ra;
}

const hang = (tho: string, ten: string) => {
	const m = tho.match(new RegExp(`^const ${ten} = "([^"]+)";$`, "m"))?.[1];
	if (!m) throw new Error(`khong doc duoc ${ten} o ${MH2.phamVi.nhanh}`);
	return m;
};

export async function docPhamVi(): Promise<VaoPhamVi> {
	const mb = chayGit(["merge-base", "HEAD", MH2.phamVi.nhanh]).trim();
	if (!mb) throw new Error("merge-base rong");
	const tep = [
		...chayGit(["diff", "--name-only", mb]).split("\n"),
		...chayGit(["ls-files", "--others", "--exclude-standard"]).split("\n"),
	].filter(Boolean);
	const { TRO_LY_OKR } = await import(
		"../../../apps/agent/agent/lib/okr/config.ts"
	);
	const { TRO_LY_OKR_SOAN } = await import(
		"../../../apps/agent-okr/agent/lib/config.ts"
	);
	const { MEASURE_DATABASE } = await import(
		"../../../packages/db/src/measure-database.ts"
	);
	const a = chayGit(["show", `${MH2.phamVi.nhanh}:${MH2.nguon.okrAgent}`]);
	const o = chayGit(["show", `${MH2.phamVi.nhanh}:${MH2.nguon.okrSoan}`]);
	return {
		tep,
		hienTai: {
			judgeAgent: TRO_LY_OKR.judge.model,
			judgeOkr: TRO_LY_OKR_SOAN.judge.model,
			troLyOkr: TRO_LY_OKR.model,
			soanOkr: TRO_LY_OKR_SOAN.model,
		},
		onehub: {
			judgeAgent: hang(a, "MO_HINH_JUDGE"),
			judgeOkr: hang(o, "MO_HINH_JUDGE"),
			troLyOkr: hang(a, "MO_HINH"),
			soanOkr: hang(o, "MO_HINH"),
		},
		khoDo: MEASURE_DATABASE.agentModel.id,
		macDinh: (await macDinhCua(tuyet(MH2.nguon.settings))).id,
		specDoi:
			chayGit([
				"diff",
				"--name-only",
				mb,
				"--",
				MH2.nguon.measureSpec,
			]).trim() !== "",
	};
}
