import { spawnSync } from "node:child_process";
import {
	cpSync,
	existsSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	type Bang as BangKho,
	docBaoCao,
	kiemBangChung,
} from "../../bo-cau-hoi-mau/rang/bang-do";
import {
	type Bang,
	type ChiPhi,
	type DongTacNhan,
	GOC,
	type HangBang,
	type HangChiPhi,
	type KeHoach,
	type KhoTom,
	khuonBang,
	khuonChiPhi,
	khuonDongTacNhan,
	khuonDoSuyLuan,
	khuonHangChiPhi,
	khuonKeHoach,
	khuonKeHoachTacNhan,
	khuonKhoTom,
	khuonNguong,
	khuonSoan,
	khuonSoanMh4,
	khuonSuKienChon,
	MTV,
	MUC_SUY_LUAN,
	type Nguong,
	type SoanMh4,
	sha256,
	VAI,
	z,
} from "./khuon";

export const SO = {
	tepDoTacNhan: join(MTV.rang, "do-tac-nhan.ts"),
	chanDocLai: "if (doc.id !== model)",
	goiDat: "datModel(url, MTV.model);",
	goiEval: "await chay(",
	moDau: "export default defineAgent({",
	chenLow: 'export default defineAgent({\n\treasoning: "low",',
	dongModelKho: 'maModel: "zai/glm-5.2-fast"',
	moKhoiKho: "\thoi: {",
	dongModelSoan: 'const MO_HINH = "google/gemini-3.8-flash";',
	boMau: "_acceptance/bo-cau-hoi-mau/bo-mau.json",
	nhomNgoai: "khong-phai-quy-dinh",
	choPhep: (f: string) =>
		f.startsWith("_acceptance/model-theo-vai-do-lai/") ||
		f === "docs/model-theo-vai.md" ||
		f === "_acceptance/config.yaml" ||
		f === "PRODUCT-MAP.md" ||
		f === "LO-TRINH.html",
	nhan: {
		thieu: "THIEU CAP",
		thua: "THUA CAP",
		lech: "LECH AICHIPHI",
		chong: "CHONG GIO",
		lien: "LIEN NHAU CUNG BIEN THE",
		biCat: "BI CAT",
		roSuyLuan: "RO SUY LUAN",
		bamGoc: "BAM GOC KHONG KHOP AGENT.TS",
		saiModelTn: "sai model tac-nhan",
		suKien: "LECH SU KIEN",
		docLai: "THIEU DOC LAI MODEL",
		thieuLuot: "thieu luot",
		doSuyLuan: "DO SUY LUAN THIEU",
		saiModelDsl: "SAI MODEL DO SUY LUAN",
		gatewayLoi: "DO SUY LUAN GATEWAY LOI",
		thieuMa: "THIEU MA",
		saiModelKho: "SAI MODEL KHO",
		boMau: "BO-MAU LECH",
		kho: "KHO LECH",
		suaTam: "BAM SUA TAM LECH",
		loiDan: "LOI DAN LECH MOC",
		saiModelSoan: "SAI MODEL SOAN",
		thieuSoan: "THIEU LUOT SOAN",
		khongNop: "khong nop lech",
		luotHong: "luot soan hong",
		thuoc: "THUOC LECH MOC",
		judge: "JUDGE LECH MOC",
		lechSo: "LECH SO",
		traiLuat: "KIEN NGHI TRAI LUAT",
		thieuVai: "THIEU VAI",
		thongSo: "THONG SO CHUA DO",
		docs: "DOCS LECH",
		tepVang: "TEP VANG",
		vuotTran: "VUOT TRAN VAN CHAY",
		tranKienNghi: "THIEU LUOT VAN KIEN NGHI",
		lechUsd: "LECH USD",
		tongTran: "TONG VUOT TRAN",
		ngoai: "NGOAI PHAM VI",
		onehub: "LECH ONEHUB",
		cayBan: "SUA TAM CHUA TRA",
		git: "KHONG DO DUOC PHAM VI",
	},
	ketKien: { chuaDu: "chưa đủ số", loiDanLech: "lời dặn lệch mốc" },
} as const;

const N = SO.nhan;
const doc = (ev: string, t: string) => readFileSync(join(ev, t), "utf8");
const docJson = (ev: string, t: string): unknown => JSON.parse(doc(ev, t));
const gioThat = (at: string) => Date.parse(at) + MTV.lechKetXuatMs;
const trungVi = (xs: number[]) => {
	const s = [...xs].sort((a, b) => a - b);
	if (!s.length) return null;
	const g = Math.floor(s.length / 2);
	return s.length % 2 ? (s[g] ?? null) : ((s[g - 1] ?? 0) + (s[g] ?? 0)) / 2;
};
const tron = (x: number, c = 4) => Number(x.toFixed(c));

function chayGit(doiSo: string[]): string {
	const r = spawnSync("git", ["-C", GOC, ...doiSo], { encoding: "utf8" });
	if (r.status !== 0)
		throw new Error(
			`${N.git}: git ${doiSo.join(" ")} — ${(r.stderr || "").trim()}`,
		);
	return r.stdout;
}
const tepHead = (tep: string) => chayGit(["show", `HEAD:${tep}`]);
const blobHead = (tep: string) => chayGit(["rev-parse", `HEAD:${tep}`]).trim();

type SoCon = {
	so_buoc: number;
	token_vao: number;
	token_ra: number;
	giay: number;
};

function soCon(hang: HangChiPhi[], phien: string): SoCon {
	const con = hang.filter((h) => h.phienCha === phien && h.sessionId !== phien);
	const t = con.map((h) => gioThat(h.at)).sort((a, b) => a - b);
	return {
		so_buoc: con.length,
		token_vao: con.reduce((s, h) => s + (h.inputTokens ?? 0), 0),
		token_ra: con.reduce((s, h) => s + (h.outputTokens ?? 0), 0),
		giay: t.length > 1 ? tron(((t.at(-1) ?? 0) - (t[0] ?? 0)) / 1000, 1) : 0,
	};
}

export type KetTacNhan = {
	hong: string[];
	dong: string[];
	hop: { d: DongTacNhan; c: SoCon; usd: number }[];
	bang: string;
};

function inBangTacNhan(
	ke: KeHoach,
	hop: KetTacNhan["hop"],
	loai: string[],
): string {
	const thuTu: string[] = [...ke.tac_nhan.bien_the];
	const sx = [...hop].sort(
		(a, b) =>
			thuTu.indexOf(a.d.bien_the) - thuTu.indexOf(b.d.bien_the) ||
			a.d.luot - b.d.luot,
	);
	return [
		`# Bảng Tác nhân bộ dựng — ${MTV.model}`,
		"",
		"| biến thể | lượt | kết quả | giây cả lượt | model phiên con | bước phiên con | token vào con | token ra con | giây phiên con | USD | nhật ký |",
		"| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
		...sx.map(
			({ d, c, usd }) =>
				`| ${d.bien_the} | ${d.luot} | ${d.ket_qua}${d.bi_cat ? " (quá trần)" : ""} | ${d.bi_cat ? `≥${MTV.tran}` : d.giay} | ${d.model_phien_con ?? "?"} | ${c.so_buoc} | ${c.token_vao} | ${c.token_ra} | ${c.giay} | ${usd} | ${d.nhat_ky} |`,
		),
		"",
		"## Loại khỏi bảng",
		"",
		...(loai.length ? loai.map((l) => `- ${l}`) : ["- (không có)"]),
		"",
	].join("\n");
}

export function kiemDocLai(maNguon: string): string[] {
	const chan = maNguon.indexOf(SO.chanDocLai);
	const dat = maNguon.indexOf(SO.goiDat);
	const evl = maNguon.indexOf(SO.goiEval, dat);
	if (chan < 0 || !maNguon.slice(chan, chan + 200).includes("throw new Error"))
		return [`${N.docLai}: thieu chan doc lai trong do-tac-nhan.ts`];
	if (dat < 0 || evl < 0)
		return [`${N.docLai}: datModel khong dung truoc eval`];
	return [];
}

function luotDungTran(
	c: ChiPhi | null,
	vai: ChiPhi["luot"][number]["vai"],
): Set<string> {
	return new Set(
		(c?.luot ?? [])
			.filter((l) => l.vai === vai && l.trang_thai === "dung-vi-tran")
			.map((l) => l.luot),
	);
}

function docChiPhiEv(ev: string): ChiPhi | null {
	return existsSync(join(ev, MTV.tep.chiPhi))
		? khuonChiPhi.parse(docJson(ev, MTV.tep.chiPhi))
		: null;
}

export function kiemTacNhan(
	ev: string,
	ke: KeHoach,
	maNguon: string,
): KetTacNhan {
	const hong: string[] = [];
	const ra: string[] = [];
	const dungTran = luotDungTran(docChiPhiEv(ev), "tac-nhan");
	const kt = khuonKeHoachTacNhan.parse(docJson(ev, MTV.tep.keHoachTacNhan));
	const ds = existsSync(join(ev, MTV.tep.tacNhan))
		? doc(ev, MTV.tep.tacNhan)
				.split("\n")
				.filter(Boolean)
				.map((d) => khuonDongTacNhan.parse(JSON.parse(d)))
		: [];
	const can = ke.tac_nhan.bien_the.flatMap((b) =>
		Array.from({ length: ke.tac_nhan.so_luot }, (_, i) => `${b}-${i + 1}`),
	);
	const co = new Set(ds.map((d) => `${d.bien_the}-${d.luot}`));
	for (const k of can)
		if (!co.has(k) && !dungTran.has(k)) hong.push(`${N.thieu} ${k}`);
	const daThay = new Set<string>();
	for (const d of ds) {
		const k = `${d.bien_the}-${d.luot}`;
		if (!can.includes(k) || daThay.has(k) || dungTran.has(k))
			hong.push(`${N.thua} ${k}`);
		daThay.add(k);
	}
	const gocHead = tepHead(MTV.suaTam.agentBuilder);
	if (kt.bam_agent_goc !== sha256(gocHead)) hong.push(N.bamGoc);
	if (kt.bam_agent_low !== sha256(gocHead.replace(SO.moDau, SO.chenLow)))
		hong.push(`${N.bamGoc} (ban low)`);
	const theoGio = [...ds].sort(
		(a, b) => Date.parse(a.bat_dau) - Date.parse(b.bat_dau),
	);
	for (let i = 1; i < theoGio.length; i++) {
		const a = theoGio[i - 1];
		const b = theoGio[i];
		if (!a || !b) continue;
		if (Date.parse(b.bat_dau) < Date.parse(a.ket_thuc))
			hong.push(`${N.chong}: ${a.bien_the}-${a.luot} ${b.bien_the}-${b.luot}`);
		if (a.bien_the === b.bien_the)
			hong.push(`${N.lien}: ${a.bien_the}-${a.luot} ${b.bien_the}-${b.luot}`);
	}
	const hop: KetTacNhan["hop"] = [];
	const loai: string[] = [];
	for (const d of ds) {
		const k = `${d.bien_the}-${d.luot}`;
		const hang = z.array(khuonHangChiPhi).parse(docJson(ev, d.aichiphi));
		const c = soCon(hang, d.phien_goc);
		if (c.so_buoc < 1) hong.push(`${N.lech} ${k}: so buoc phien con 0`);
		if (
			d.ket_qua === "hong" &&
			(d.ly_do ?? "").includes("qua tran") &&
			!d.bi_cat
		)
			hong.push(`${N.biCat} ${k}`);
		const bamDung =
			d.bien_the === "flash-low" ? kt.bam_agent_low : kt.bam_agent_goc;
		if (d.bam_agent !== bamDung) hong.push(`${N.roSuyLuan} ${k}`);
		const sk = khuonSuKienChon.parse(docJson(ev, d.su_kien));
		const modelSk = [...new Set(sk.map((s) => s.modelId))];
		const modelTinh = modelSk.length === 1 ? (modelSk[0] ?? null) : null;
		if (modelTinh !== d.model_phien_con) hong.push(`${N.suKien} ${k}`);
		if (d.model !== MTV.model || d.model_phien_con !== MTV.model) {
			const tin = `${N.saiModelTn} ${k} (${d.model_phien_con ?? "khong doc duoc"})`;
			ra.push(tin);
			loai.push(tin);
			continue;
		}
		hop.push({
			d,
			c,
			usd: tron(
				hang.reduce((s, h) => s + (h.costUsd ?? 0), 0),
				6,
			),
		});
	}
	for (const b of ke.tac_nhan.bien_the) {
		const n = hop.filter((x) => x.d.bien_the === b).length;
		if (n < ke.tac_nhan.so_luot)
			ra.push(`${N.thieuLuot} ${b} (${n}/${ke.tac_nhan.so_luot})`);
	}
	const bang = inBangTacNhan(ke, hop, loai);
	if (
		!existsSync(join(ev, MTV.tep.bangTacNhan)) ||
		doc(ev, MTV.tep.bangTacNhan) !== bang
	)
		hong.push(`${N.lech} ${MTV.tep.bangTacNhan}`);
	const dl = kiemDocLai(maNguon);
	hong.push(...dl);
	if (!dl.length)
		ra.push("doc lai model: o model cua kho do doc lai truoc moi luot");
	return { hong, dong: ra, hop, bang };
}

export type KetSuyLuan = { hong: string[]; dong: string[]; usd: number };
export type KienNghi = { kien_nghi: string; ly_do: string };
type MocKho = { so: SoKho; bang: BangKho };
type KetChieu = { hong: string[]; dong: string[] };

export function kiemSuyLuan(ev: string): KetSuyLuan {
	if (!existsSync(join(ev, MTV.tep.doSuyLuan)))
		return { hong: [`${N.doSuyLuan}: tep`], dong: [], usd: 0 };
	const d = khuonDoSuyLuan.parse(docJson(ev, MTV.tep.doSuyLuan));
	const hong: string[] = [];
	for (const m of MUC_SUY_LUAN) {
		const x = d.muc[m];
		if (!x) {
			hong.push(`${N.doSuyLuan} ${m}`);
			continue;
		}
		if (x.status !== 200) hong.push(`${N.gatewayLoi} ${m} status ${x.status}`);
		if (x.model !== null && x.model !== MTV.model)
			hong.push(`${N.saiModelDsl} ${m}`);
	}
	if (d.model !== MTV.model) hong.push(`${N.saiModelDsl} tep`);
	const md = d.muc["mac-dinh"]?.token_suy_luan;
	const lo = d.muc.low?.token_suy_luan;
	const hi = d.muc.high?.token_suy_luan;
	const thieu = [md, lo, hi].some((x) => x === null || x === undefined);
	const ket = thieu
		? "chua kiem duoc (Gateway khong tra token suy luan)"
		: (lo ?? 0) < (md ?? 0)
			? "muc low toi nha cung cap"
			: "muc low KHONG lam giam token suy luan";
	return {
		hong,
		dong: [
			`do suy luan ${d.model}: mac-dinh ${md ?? "?"} / low ${lo ?? "?"} / high ${hi ?? "?"} token suy luan — ${ket}`,
		],
		usd: d.usd,
	};
}

export type KetKho = {
	hong: string[];
	dong: string[];
	luot: { tom: KhoTom; bang: BangKho }[];
};

export function kiemKho(ev: string, ke: KeHoach): KetKho {
	const hong: string[] = [];
	const ra: string[] = [];
	const dungTran = luotDungTran(docChiPhiEv(ev), "tro-ly-kho");
	const boTho = readFileSync(join(GOC, SO.boMau), "utf8");
	const bo = z
		.object({ cau: z.array(z.object({ id: z.string(), nhom: z.string() })) })
		.parse(JSON.parse(boTho));
	const motCan = bo.cau
		.filter((c) => c.nhom !== SO.nhomNgoai)
		.map((c) => c.id)
		.sort();
	const haiCan = bo.cau.map((c) => c.id).sort();
	const suaDung = sha256(
		(() => {
			const g = tepHead(MTV.suaTam.taiLieu);
			const i = g.indexOf(SO.moKhoiKho);
			const j = g.indexOf(SO.dongModelKho, i);
			return `${g.slice(0, j)}maModel: ${JSON.stringify(MTV.model)}${g.slice(j + SO.dongModelKho.length)}`;
		})(),
	);
	const blob = blobHead(MTV.suaTam.taiLieu);
	const luot: KetKho["luot"] = [];
	for (let n = 1; n <= ke.tro_ly_kho.so_luot; n++) {
		const thu = join(ev, MTV.tep.kho, `luot-${n}`);
		if (!existsSync(join(thu, MTV.tep.khoTom))) {
			if (!dungTran.has(String(n))) hong.push(`${N.kho}: thieu luot ${n}`);
			continue;
		}
		const tom = khuonKhoTom.parse(
			JSON.parse(readFileSync(join(thu, MTV.tep.khoTom), "utf8")),
		);
		const jsonl = existsSync(join(thu, MTV.tep.khoTungCau))
			? readFileSync(join(thu, MTV.tep.khoTungCau), "utf8")
			: "";
		const dong = jsonl
			.split("\n")
			.filter(Boolean)
			.map((d) =>
				z.object({ luot: z.number(), id: z.string() }).parse(JSON.parse(d)),
			);
		const mot = new Set(dong.filter((d) => d.luot === 1).map((d) => d.id));
		const hai = new Set(dong.filter((d) => d.luot === 2).map((d) => d.id));
		for (const m of motCan)
			if (!mot.has(m)) hong.push(`${N.thieuMa} ${m} vong mot luot ${n}`);
		for (const m of haiCan)
			if (!hai.has(m)) hong.push(`${N.thieuMa} ${m} vong hai luot ${n}`);
		if (tom.model_kho !== MTV.model)
			hong.push(`${N.saiModelKho} luot ${n} (${tom.model_kho ?? "?"})`);
		if (tom.bam_bo_mau !== sha256(boTho)) hong.push(`${N.boMau} luot ${n}`);
		if (tom.bam_sua_tam !== suaDung || tom.bam_commit !== blob)
			hong.push(`${N.suaTam} kho luot ${n}`);
		const md = existsSync(join(thu, MTV.tep.khoBaoCao))
			? readFileSync(join(thu, MTV.tep.khoBaoCao), "utf8")
			: null;
		const k = kiemBangChung(boTho, md, jsonl || null);
		if (!k.ok) {
			hong.push(`${N.kho} luot ${n}: ${k.loi}`);
			continue;
		}
		luot.push({ tom, bang: k.bang });
		ra.push(
			`kho luot ${n}: model kho ${tom.model_kho} · goc ${tom.model_goc ?? "?"} · ma cham ${k.maCham}`,
		);
	}
	return { hong, dong: ra, luot };
}

export type KetSoan = {
	hong: string[];
	dong: string[];
	hop: SoanMh4[];
	lechLoiDan: number[];
};

export function kiemSoan(ev: string, ke: KeHoach): KetSoan {
	const hong: string[] = [];
	const ra: string[] = [];
	const dungTran = luotDungTran(docChiPhiEv(ev), "soan-okr");
	const moc = khuonSoan.parse(
		JSON.parse(readFileSync(join(GOC, MTV.moc.soan), "utf8")),
	);
	const g = tepHead(MTV.suaTam.agentOkr);
	const suaDung = sha256(
		g.replace(
			SO.dongModelSoan,
			`const MO_HINH = ${JSON.stringify(MTV.model)};`,
		),
	);
	const blob = blobHead(MTV.suaTam.agentOkr);
	const hop: SoanMh4[] = [];
	const lechLoiDan: number[] = [];
	const coTep = readdirSync(ev).filter((f) =>
		/^eval-soan-flash-\d+\.json$/.test(f),
	);
	for (const f of coTep) {
		const n = Number(f.match(/(\d+)\.json$/)?.[1]);
		if (n > ke.soan_okr.so_luot) hong.push(`${N.thieuSoan}: thua ${f}`);
	}
	for (let n = 1; n <= ke.soan_okr.so_luot; n++) {
		const f = MTV.tep.soan(n);
		if (!existsSync(join(ev, f))) {
			if (!dungTran.has(String(n))) hong.push(`${N.thieuSoan} ${n}`);
			continue;
		}
		const s = khuonSoanMh4.parse(docJson(ev, f));
		let ok = true;
		if (s.moHinh !== MTV.model || s.modelGateway !== MTV.model) {
			hong.push(
				`${N.saiModelSoan} ${n} (${s.moHinh} / ${s.modelGateway ?? "?"})`,
			);
			ok = false;
		}
		if (s.judge !== moc.judge) {
			hong.push(`${N.judge} ${n}`);
			ok = false;
		}
		if (s.bam.thuoc !== moc.bam.thuoc) {
			hong.push(`${N.thuoc} ${n}`);
			ok = false;
		}
		if (s.bamSuaTam !== suaDung || s.bamCommit !== blob)
			hong.push(`${N.suaTam} soan ${n}`);
		if (s.bam.loiDan !== moc.bam.loiDan) {
			ra.push(`${N.loiDan} ${n}`.toLowerCase());
			lechLoiDan.push(n);
			ok = false;
		}
		const khongNop = s.khongNopDeXuat ?? s.soDeXuat === 0;
		if (khongNop !== (s.soDeXuat === 0)) hong.push(`${N.khongNop} ${n}`);
		if (khongNop) ra.push(`${N.luotHong} ${n}: khong nop de xuat`);
		if (ok) hop.push(s);
		ra.push(
			`soan luot ${n}: dat ${s.dat}/${s.tong} hong ${s.hong} judge hong ${s.judgeHong} usd ${s.usd}`,
		);
	}
	return { hong, dong: ra, hop, lechLoiDan };
}

export type ThongKeBienThe = {
	ten: string;
	qua: number;
	so: number;
	trungViGiay: number | null;
};

export function kienNghiTacNhan(
	tk: ThongKeBienThe[],
	soLuot: number,
	ng: Nguong["tac_nhan"],
): KienNghi {
	if (tk.some((t) => t.so < soLuot))
		return {
			kien_nghi: SO.ketKien.chuaDu,
			ly_do: "có biến thể thiếu lượt hợp lệ",
		};
	const dat = tk.filter((t) => t.qua >= ng.luot_qua_toi_thieu);
	if (!dat.length)
		return {
			kien_nghi: `giữ ${ng.giu}`,
			ly_do: `không biến thể nào qua ≥ ${ng.luot_qua_toi_thieu}/${ng.tren_so_luot} lượt dưới ${ng.tran_giay} giây`,
		};
	const chon = [...dat].sort(
		(a, b) =>
			b.qua - a.qua ||
			(a.trungViGiay ?? Number.POSITIVE_INFINITY) -
				(b.trungViGiay ?? Number.POSITIVE_INFINITY),
	)[0];
	return {
		kien_nghi: `${MTV.model} (${chon?.ten})`,
		ly_do: `${chon?.ten} qua ${chon?.qua}/${chon?.so} lượt; ngưỡng ${ng.luot_qua_toi_thieu}/${ng.tren_so_luot}`,
	};
}

export type SoKho = { tang: Record<string, number>; loi: number };

export function soKho(b: BangKho): SoKho {
	const tang: Record<string, number> = {};
	for (const [k, o] of Object.entries(b.tang)) tang[`mot.${k}`] = o.k;
	for (const [k, o] of Object.entries(b.zalo)) tang[`hai.${k}`] = o.k;
	const loi =
		Object.values(b.tang).reduce((s, o) => s + o.loi, 0) +
		Object.values(b.zalo).reduce((s, o) => s + o.loi, 0);
	return { tang, loi };
}

export function kienNghiKho(
	ung: SoKho[],
	moc: SoKho,
	soLuot: number,
	ng: Nguong["tro_ly_kho"],
): KienNghi {
	if (ung.length < soLuot)
		return { kien_nghi: SO.ketKien.chuaDu, ly_do: "thiếu lượt hợp lệ" };
	for (const u of ung) {
		for (const [k, m] of Object.entries(moc.tang)) {
			const x = u.tang[k] ?? 0;
			if (x < m - ng.kem_moc_toi_da_moi_tang)
				return {
					kien_nghi: `giữ ${ng.giu}`,
					ly_do: `tầng ${k} đúng ${x}, mốc ${m}`,
				};
		}
		if (u.loi > ng.cau_loi_toi_da)
			return {
				kien_nghi: `giữ ${ng.giu}`,
				ly_do: `${u.loi} câu lỗi, trần ${ng.cau_loi_toi_da}`,
			};
	}
	return {
		kien_nghi: MTV.model,
		ly_do: `mỗi tầng không kém mốc quá ${ng.kem_moc_toi_da_moi_tang} câu, câu lỗi ≤ ${ng.cau_loi_toi_da}`,
	};
}

export function kienNghiSoan(
	hop: {
		dat: number;
		hong: number;
		tong: number;
		soDeXuat: number;
	}[],
	soLuot: number,
	lechLoiDan: boolean,
	ng: Nguong["soan_okr"],
): KienNghi {
	if (lechLoiDan || hop.length < soLuot)
		return {
			kien_nghi: SO.ketKien.chuaDu,
			ly_do: lechLoiDan ? SO.ketKien.loiDanLech : "thiếu lượt hợp lệ",
		};
	const khongNop = hop.find((h) => h.soDeXuat === 0);
	if (khongNop)
		return {
			kien_nghi: `giữ ${ng.giu}`,
			ly_do: `một lượt không nộp được đề xuất nào (đạt ${khongNop.dat}/${khongNop.tong}) — lượt hỏng`,
		};
	const xau = hop.find(
		(h) => h.dat < ng.dat_toi_thieu || h.hong > ng.hong_toi_da,
	);
	if (xau)
		return {
			kien_nghi: `giữ ${ng.giu}`,
			ly_do: `một lượt đạt ${xau.dat}/${xau.tong}, hỏng ${xau.hong}; ngưỡng ≥ ${ng.dat_toi_thieu}/${ng.tren_tong}, hỏng ≤ ${ng.hong_toi_da}`,
		};
	return {
		kien_nghi: MTV.model,
		ly_do: `mọi lượt đạt ≥ ${ng.dat_toi_thieu}/${ng.tren_tong}, hỏng ≤ ${ng.hong_toi_da}`,
	};
}

const evRel = (t: string) => `_acceptance/${MTV.slug}/evidence/${t}`;

function mocTacNhan() {
	const ds = readFileSync(join(GOC, MTV.moc.tacNhanDong), "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d) =>
			z
				.object({
					bien_the: z.string(),
					ket_qua: z.string(),
					bi_cat: z.boolean(),
				})
				.parse(JSON.parse(d)),
		)
		.filter((d) => d.bien_the === "moc");
	return {
		qua: ds.filter((d) => d.ket_qua === "qua" && !d.bi_cat).length,
		so: ds.length,
	};
}

function mocKho(): MocKho {
	const bc = docBaoCao(readFileSync(join(GOC, MTV.moc.kho), "utf8"));
	if (!bc)
		throw new Error(`${N.tepVang} ${MTV.moc.kho}: khong doc duoc khoi bang`);
	return { so: soKho(bc.bang), bang: bc.bang };
}

const loc = (ke: KeHoach, tu: string[]) =>
	ke.thong_so_chua_do.filter((t) => tu.some((x) => t.includes(x)));

export function dungBang(
	ke: KeHoach,
	ng: Nguong,
	tn: KetTacNhan,
	kho: KetKho,
	soan: KetSoan,
	chi: ChiPhi | null,
): Bang {
	const tb = (vai: string) => {
		const ds = (chi?.luot ?? []).filter((l) => l.vai === vai && l.usd !== null);
		return ds.length
			? tron(ds.reduce((s, l) => s + (l.usd ?? 0), 0) / ds.length)
			: null;
	};
	const ngay = (xs: string[]) =>
		xs.length ? ([...xs].sort().at(-1)?.slice(0, 10) ?? null) : null;
	const tk: ThongKeBienThe[] = ke.tac_nhan.bien_the.map((b) => {
		const r = tn.hop.filter((x) => x.d.bien_the === b);
		return {
			ten: b,
			qua: r.filter((x) => x.d.ket_qua === "qua" && !x.d.bi_cat).length,
			so: r.length,
			trungViGiay: trungVi(r.map((x) => x.c.giay)),
		};
	});
	const mtn = mocTacNhan();
	const dungTranTn = luotDungTran(chi, "tac-nhan").size > 0;
	const kTn = dungTranTn
		? { kien_nghi: SO.ketKien.chuaDu, ly_do: "có lượt dừng vì trần chi" }
		: kienNghiTacNhan(tk, ke.tac_nhan.so_luot, ng.tac_nhan);
	const hTn: HangBang = {
		vai: "tac-nhan",
		ten: "Tác nhân",
		model_dang_chay: "zai/glm-5.2-fast",
		ung_vien: MTV.model,
		so_ung_vien: tk.flatMap((t) => [
			{
				ten: `${t.ten}: lượt qua dưới ${MTV.tran} giây`,
				gia_tri: `${t.qua}/${t.so}`,
				tep: evRel(MTV.tep.tacNhan),
			},
			{
				ten: `${t.ten}: trung vị giây phiên con`,
				gia_tri: t.trungViGiay ?? "—",
				tep: evRel(MTV.tep.bangTacNhan),
			},
		]),
		so_moc: [
			{
				ten: "moc zai/glm-5.2-fast: lượt qua",
				gia_tri: `${mtn.qua}/${mtn.so}`,
				tep: MTV.moc.tacNhanDong,
			},
		],
		usd_moi_luot: tb("tac-nhan"),
		kien_nghi: kTn.kien_nghi,
		ly_do: kTn.ly_do,
		ngay_do: ngay(tn.hop.map((x) => x.d.ket_thuc)),
		ngay_moc: MTV.ngayMoc.tacNhan,
		thong_so_chua_do: loc(ke, ["trần bước", "trần thời gian"]),
		ghi_chu: tn.dong.filter(
			(d) => d.startsWith(N.saiModelTn) || d.startsWith(N.thieuLuot),
		),
	};
	const mk = mocKho();
	const soUng = kho.luot.map((l) => soKho(l.bang));
	const dungTranKho = luotDungTran(chi, "tro-ly-kho").size > 0;
	const kKho = dungTranKho
		? { kien_nghi: SO.ketKien.chuaDu, ly_do: "có lượt dừng vì trần chi" }
		: kienNghiKho(soUng, mk.so, ke.tro_ly_kho.so_luot, ng.tro_ly_kho);
	const hKho: HangBang = {
		vai: "tro-ly-kho",
		ten: "Trợ lý kho",
		model_dang_chay: "zai/glm-5.2-fast",
		ung_vien: MTV.model,
		so_ung_vien: kho.luot.flatMap((l, i) => [
			...Object.entries(soKho(l.bang).tang).map(([k, v]) => ({
				ten: `lượt ${i + 1} ${k} đúng`,
				gia_tri: v,
				tep: evRel(`${MTV.tep.kho}/luot-${l.tom.luot}/${MTV.tep.khoBaoCao}`),
			})),
			{
				ten: `lượt ${i + 1} câu lỗi`,
				gia_tri: soKho(l.bang).loi,
				tep: evRel(`${MTV.tep.kho}/luot-${l.tom.luot}/${MTV.tep.khoBaoCao}`),
			},
		]),
		so_moc: [
			...Object.entries(mk.so.tang).map(([k, v]) => ({
				ten: `mốc ${k} đúng`,
				gia_tri: v,
				tep: MTV.moc.kho,
			})),
			{ ten: "mốc câu lỗi", gia_tri: mk.so.loi, tep: MTV.moc.kho },
		],
		usd_moi_luot: tb("tro-ly-kho"),
		kien_nghi: kKho.kien_nghi,
		ly_do: kKho.ly_do,
		ngay_do: ngay(kho.luot.map((l) => l.tom.luc)),
		ngay_moc: MTV.ngayMoc.kho,
		thong_so_chua_do: loc(ke, ["Trợ lý kho"]),
		ghi_chu: [
			"vòng hai qua Zalo: agent gốc chạy model mặc định zai/glm-5.2-fast, chỉ trợ lý kho đổi model",
			"USD ước theo số dư Gateway trước và sau lượt: gồm cả agent gốc của vòng Zalo và lời gọi khác cùng nhóm khoá trong khoảng đó, nên là ước cao",
		],
	};
	const moc = khuonSoan.parse(
		JSON.parse(readFileSync(join(GOC, MTV.moc.soan), "utf8")),
	);
	const dungTranSoan = luotDungTran(chi, "soan-okr").size > 0;
	const kSoan = dungTranSoan
		? { kien_nghi: SO.ketKien.chuaDu, ly_do: "có lượt dừng vì trần chi" }
		: kienNghiSoan(
				soan.hop,
				ke.soan_okr.so_luot,
				soan.lechLoiDan.length > 0,
				ng.soan_okr,
			);
	const hSoan: HangBang = {
		vai: "soan-okr",
		ten: "Soạn OKR",
		model_dang_chay: moc.moHinh,
		ung_vien: MTV.model,
		so_ung_vien: soan.hop.flatMap((s, i) => [
			{
				ten: `lượt ${i + 1} đạt`,
				gia_tri: `${s.dat}/${s.tong}`,
				tep: evRel(`eval-soan-${s.nhan}.json`),
			},
			{
				ten: `lượt ${i + 1} hỏng`,
				gia_tri: s.hong,
				tep: evRel(`eval-soan-${s.nhan}.json`),
			},
			{
				ten: `lượt ${i + 1} p90 ms`,
				gia_tri: s.p90 === null ? "—" : Math.round(s.p90),
				tep: evRel(`eval-soan-${s.nhan}.json`),
			},
		]),
		so_moc: [
			{ ten: "mốc đạt", gia_tri: `${moc.dat}/${moc.tong}`, tep: MTV.moc.soan },
			{ ten: "mốc hỏng", gia_tri: moc.hong, tep: MTV.moc.soan },
			{
				ten: "mốc p90 ms",
				gia_tri: moc.p90 === null ? "—" : Math.round(moc.p90),
				tep: MTV.moc.soan,
			},
		],
		usd_moi_luot: tb("soan-okr"),
		kien_nghi: kSoan.kien_nghi,
		ly_do: kSoan.ly_do,
		ngay_do: ngay(soan.hop.map((s) => s.luc)),
		ngay_moc: MTV.ngayMoc.soan,
		thong_so_chua_do: loc(ke, ["Soạn OKR"]),
		ghi_chu: [
			...(soan.lechLoiDan.length ? [SO.ketKien.loiDanLech] : []),
			"USD của eval soạn chưa gồm judge",
		],
	};
	const hJudge: HangBang = {
		vai: "judge-okr",
		ten: "Judge OKR",
		model_dang_chay: moc.judge,
		ung_vien: null,
		so_ung_vien: soan.hop.flatMap((s, i) => [
			{
				ten: `lượt ${i + 1} judge hỏng`,
				gia_tri: s.judgeHong,
				tep: evRel(`eval-soan-${s.nhan}.json`),
			},
			{
				ten: `lượt ${i + 1} judge dưới ngưỡng`,
				gia_tri: s.judgeDuoiNguong,
				tep: evRel(`eval-soan-${s.nhan}.json`),
			},
		]),
		so_moc: [
			{ ten: "mốc judge hỏng", gia_tri: moc.judgeHong, tep: MTV.moc.soan },
			{
				ten: "mốc judge dưới ngưỡng",
				gia_tri: moc.judgeDuoiNguong,
				tep: MTV.moc.soan,
			},
		],
		usd_moi_luot: null,
		kien_nghi: `giữ ${ng.judge_okr.giu}`,
		ly_do:
			"Hỏi-3: không đổi judge ở vòng này, mọi số soạn OKR chấm bằng judge hiện tại",
		ngay_do: ngay(soan.hop.map((s) => s.luc)),
		ngay_moc: MTV.ngayMoc.soan,
		thong_so_chua_do: [`${MTV.model} làm judge`],
		ghi_chu: [],
	};
	const hMay: HangBang = {
		vai: "may-soan-kho",
		ten: "Máy soạn kho",
		model_dang_chay: ng.may_soan_kho.giu,
		ung_vien: null,
		so_ung_vien: [],
		so_moc: [],
		usd_moi_luot: null,
		kien_nghi: `giữ ${ng.may_soan_kho.giu}`,
		ly_do: `Hỏi-4: ${ng.may_soan_kho.ghi_chu}`,
		ngay_do: null,
		ngay_moc: null,
		thong_so_chua_do: ["mọi thông số — chưa có thước"],
		ghi_chu: [ng.may_soan_kho.ghi_chu],
	};
	return {
		nguong: `_acceptance/${MTV.slug}/rang/nguong.json`,
		ke_hoach: evRel(MTV.tep.keHoach),
		hang: [hTn, hKho, hSoan, hJudge, hMay],
	};
}

export function inDocs(b: Bang): string {
	const o = (v: string | number) => String(v).replace(/\|/g, "/");
	return [
		"# Model theo vai",
		"",
		`Bảng kiến nghị model cho từng vai AI của CRM, dựng bởi \`_acceptance/${MTV.slug}/rang/so-do.ts --ghi\` từ các lượt đo của hàng MH4. Không sửa tay: sửa bằng chứng rồi dựng lại. Ngưỡng: \`${b.nguong}\`. Cỡ mẫu: \`${b.ke_hoach}\`. Model chạy thật chưa đổi — đổi mặc định là hàng MH2.`,
		"",
		"| Vai | Đang chạy | Ứng viên | Kiến nghị | Vì sao | USD mỗi lượt | Ngày đo | Ngày mốc |",
		"| --- | --- | --- | --- | --- | --- | --- | --- |",
		...b.hang.map(
			(h) =>
				`| ${h.ten} | \`${h.model_dang_chay}\` | ${h.ung_vien ? `\`${h.ung_vien}\`` : "—"} | ${o(h.kien_nghi)} | ${o(h.ly_do)} | ${h.usd_moi_luot ?? "—"} | ${h.ngay_do ?? "—"} | ${h.ngay_moc ?? "—"} |`,
		),
		"",
		...b.hang.flatMap((h) => [
			`## ${h.ten}`,
			"",
			...(h.so_ung_vien.length || h.so_moc.length
				? [
						"| Số | Giá trị | Tệp |",
						"| --- | --- | --- |",
						...[...h.so_ung_vien, ...h.so_moc].map(
							(s) => `| ${o(s.ten)} | ${o(s.gia_tri)} | \`${s.tep}\` |`,
						),
						"",
					]
				: []),
			`Thông số chưa dò: ${h.thong_so_chua_do.join("; ") || "không"}.`,
			"",
			...h.ghi_chu.map((g) => `- ${g}`),
			...(h.ghi_chu.length ? [""] : []),
		]),
	].join("\n");
}

export function kiemBang(
	ev: string,
	ky: Bang,
	docsTho: string | null,
): string[] {
	const hong: string[] = [];
	if (!existsSync(join(ev, MTV.tep.bang)))
		return [`${N.tepVang} ${MTV.tep.bang}`];
	const co = khuonBang.parse(docJson(ev, MTV.tep.bang));
	for (const v of VAI)
		if (!co.hang.some((h) => h.vai === v)) hong.push(`${N.thieuVai} ${v}`);
	for (const h of co.hang) {
		const k = ky.hang.find((x) => x.vai === h.vai);
		if (!k) continue;
		const { kien_nghi: a, ...ra } = h;
		const { kien_nghi: b, ...rb } = k;
		if (JSON.stringify(ra) !== JSON.stringify(rb))
			hong.push(`${N.lechSo} ${h.vai}`);
		if (a !== b) hong.push(`${N.traiLuat} ${h.vai}`);
		if (h.kien_nghi.startsWith("giữ") && !h.thong_so_chua_do.length)
			hong.push(`${N.thongSo} ${h.vai}`);
		for (const s of [...h.so_ung_vien, ...h.so_moc])
			if (!existsSync(join(GOC, s.tep))) hong.push(`${N.tepVang} ${s.tep}`);
	}
	if (docsTho === null || docsTho !== inDocs(co)) hong.push(N.docs);
	return hong;
}

export function kiemChiPhi(
	ev: string,
	tn: KetTacNhan,
	kho: KetKho,
	soan: KetSoan,
	sl: number,
	bangCo: Bang | null,
): string[] {
	const hong: string[] = [];
	const c = docChiPhiEv(ev);
	if (!c) return [`${N.tepVang} ${MTV.tep.chiPhi}`];
	const ke = khuonKeHoach.parse(docJson(ev, MTV.tep.keHoach));
	if (c.tran_usd !== ke.tran_usd) hong.push(`${N.lechUsd} tran`);
	const tinh = new Map<string, number>();
	for (const x of tn.hop)
		tinh.set(`tac-nhan:${x.d.bien_the}-${x.d.luot}`, x.usd);
	for (const x of kho.luot) tinh.set(`tro-ly-kho:${x.tom.luot}`, x.tom.usd);
	for (const x of soan.hop)
		tinh.set(`soan-okr:${x.nhan.replace("flash-", "")}`, tron(x.usd, 6));
	tinh.set("dao:1", sl);
	let cong = 0;
	for (const l of [...c.luot].sort((a, b) => a.luc.localeCompare(b.luc))) {
		if (l.trang_thai === "da-chay") {
			if (cong >= c.tran_usd) hong.push(`${N.vuotTran}: ${l.vai} ${l.luot}`);
			const t = tinh.get(`${l.vai}:${l.luot}`);
			if (t !== undefined && l.usd !== null && Math.abs(t - l.usd) > 1e-6)
				hong.push(`${N.lechUsd} ${l.vai} ${l.luot}`);
			cong += l.usd ?? 0;
		} else {
			if (l.tep !== null)
				hong.push(`${N.lechUsd} ${l.vai} ${l.luot}: dung vi tran ma co tep`);
			const h = bangCo?.hang.find((x) => x.vai === l.vai);
			if (h && h.kien_nghi !== SO.ketKien.chuaDu)
				hong.push(`${N.tranKienNghi} ${l.vai}`);
		}
	}
	if (cong > c.tran_usd + 1e-9)
		hong.push(`${N.tongTran}: ${tron(cong)} > ${c.tran_usd}`);
	return hong;
}

export function phamVi(
	ds: string[],
	diffConfig: string,
	diffOnehub: string,
	cayBan: string[],
): string[] {
	const ra = ds.filter((f) => !SO.choPhep(f)).map((f) => `${N.ngoai}: ${f}`);
	if (
		diffConfig
			.split("\n")
			.some((d) => d.startsWith("-") && !d.startsWith("---"))
	)
		ra.push(`${N.ngoai}: config.yaml co dong xoa`);
	for (const f of MTV.khaiModelOkr)
		if (diffOnehub.split("\n").some((d) => d.startsWith(`diff --git a/${f} `)))
			ra.push(`${N.onehub} ${f}`);
	for (const f of cayBan) ra.push(`${N.cayBan}: ${f}`);
	return ra;
}

function lenhPhamVi(): string[] {
	const mb = chayGit(["merge-base", "HEAD", "origin/onehub"]).trim();
	if (!mb) throw new Error(`${N.git}: merge-base rong`);
	const ds = chayGit(["diff", "--name-only", mb, "HEAD"])
		.split("\n")
		.filter(Boolean);
	const cfg = chayGit(["diff", mb, "HEAD", "--", "_acceptance/config.yaml"]);
	const onehub = chayGit([
		"diff",
		"origin/onehub",
		"HEAD",
		"--",
		...MTV.khaiModelOkr,
	]);
	const ban = chayGit([
		"diff",
		"--name-only",
		"HEAD",
		"--",
		...Object.values(MTV.suaTam),
	])
		.split("\n")
		.filter(Boolean);
	return phamVi(ds, cfg, onehub, ban);
}

type KetTong = {
	hong: string[];
	dong: string[];
	bang: Bang;
	bangTacNhan: string;
};

export function kiem(
	ev: string,
	maNguon: string,
	docsTho: string | null,
): KetTong {
	const ke = khuonKeHoach.parse(docJson(ev, MTV.tep.keHoach));
	const ng = khuonNguong.parse(
		JSON.parse(readFileSync(MTV.tep.nguong, "utf8")),
	);
	const tn = kiemTacNhan(ev, ke, maNguon);
	const sl = kiemSuyLuan(ev);
	const kho = kiemKho(ev, ke);
	const soan = kiemSoan(ev, ke);
	const chi = docChiPhiEv(ev);
	const bang = dungBang(ke, ng, tn, kho, soan, chi);
	const bangCo = existsSync(join(ev, MTV.tep.bang))
		? khuonBang.parse(docJson(ev, MTV.tep.bang))
		: null;
	const hong = [
		...tn.hong,
		...sl.hong,
		...kho.hong,
		...soan.hong,
		...kiemBang(ev, bang, docsTho),
		...kiemChiPhi(ev, tn, kho, soan, sl.usd, bangCo),
	];
	return {
		hong,
		dong: [
			...tn.dong,
			...sl.dong,
			...kho.dong,
			...soan.dong,
			...bang.hang.map((h) => `${h.vai}: ${h.kien_nghi} — ${h.ly_do}`),
		],
		bang,
		bangTacNhan: tn.bang,
	};
}

const tam: string[] = [];
function banSao(): string {
	const t = mkdtempSync(join(tmpdir(), "mtv-so-"));
	tam.push(t);
	cpSync(MTV.evidence, t, { recursive: true });
	return t;
}
const maGoc = () => readFileSync(SO.tepDoTacNhan, "utf8");
const docsGoc = () =>
	existsSync(MTV.tep.docs) ? readFileSync(MTV.tep.docs, "utf8") : null;

function ghiLai(ev: string, k: KetTong) {
	writeFileSync(join(ev, MTV.tep.bang), `${JSON.stringify(k.bang, null, 2)}\n`);
	writeFileSync(join(ev, MTV.tep.bangTacNhan), k.bangTacNhan);
	return inDocs(k.bang);
}
function capLai(ev: string): string {
	return ghiLai(ev, kiem(ev, maGoc(), null));
}
function suaJson<T>(
	ev: string,
	tep: string,
	khuon: z.ZodType<T>,
	doi: (x: T) => void,
) {
	const x = khuon.parse(JSON.parse(readFileSync(join(ev, tep), "utf8")));
	doi(x);
	writeFileSync(join(ev, tep), `${JSON.stringify(x, null, 2)}\n`);
}
function suaDong(ev: string, doi: (ds: DongTacNhan[]) => DongTacNhan[]) {
	const ds = doc(ev, MTV.tep.tacNhan)
		.split("\n")
		.filter(Boolean)
		.map((d) => khuonDongTacNhan.parse(JSON.parse(d)));
	writeFileSync(
		join(ev, MTV.tep.tacNhan),
		`${doi(ds)
			.map((d) => JSON.stringify(d))
			.join("\n")}\n`,
	);
}
const dong0 = (ev: string) =>
	khuonDongTacNhan.parse(
		JSON.parse(doc(ev, MTV.tep.tacNhan).split("\n")[0] ?? "{}"),
	);

type ChieuDo = {
	eval: string;
	ten: string;
	chay: () => { hong: string[]; dong: string[] };
	phaiCo: string[];
	mong: "do" | "xanh";
};

const tuDocs = (ev: string, docs: string) => kiem(ev, maGoc(), docs);

function luatBien(): KetChieu {
	const ng = khuonNguong.parse(
		JSON.parse(readFileSync(MTV.tep.nguong, "utf8")),
	);
	const hong: string[] = [];
	const ca = (ten: string, a: string, b: string) => {
		if (a !== b) hong.push(`${N.traiLuat} ${ten}: ${a} ≠ ${b}`);
	};
	const t = (qua: number, gia: number | null, ten = "flash") => ({
		ten,
		qua,
		so: 5,
		trungViGiay: gia,
	});
	ca(
		"tac-nhan 4/5",
		kienNghiTacNhan([t(4, 50)], 5, ng.tac_nhan).kien_nghi,
		`${MTV.model} (flash)`,
	);
	ca(
		"tac-nhan 3/5",
		kienNghiTacNhan([t(3, 50)], 5, ng.tac_nhan).kien_nghi,
		`giữ ${ng.tac_nhan.giu}`,
	);
	ca(
		"tac-nhan hoa",
		kienNghiTacNhan([t(4, 80), t(4, 40, "flash-low")], 5, ng.tac_nhan)
			.kien_nghi,
		`${MTV.model} (flash-low)`,
	);
	const moc: SoKho = { tang: { "mot.S1": 14, "hai.S1": 15 }, loi: 2 };
	ca(
		"kho 2 loi",
		kienNghiKho(
			[{ tang: { "mot.S1": 14, "hai.S1": 15 }, loi: 2 }],
			moc,
			1,
			ng.tro_ly_kho,
		).kien_nghi,
		MTV.model,
	);
	ca(
		"kho 3 loi",
		kienNghiKho(
			[{ tang: { "mot.S1": 14, "hai.S1": 15 }, loi: 3 }],
			moc,
			1,
			ng.tro_ly_kho,
		).kien_nghi,
		`giữ ${ng.tro_ly_kho.giu}`,
	);
	ca(
		"kho kem 2",
		kienNghiKho(
			[{ tang: { "mot.S1": 12, "hai.S1": 15 }, loi: 0 }],
			moc,
			1,
			ng.tro_ly_kho,
		).kien_nghi,
		`giữ ${ng.tro_ly_kho.giu}`,
	);
	const s = (dat: number, hong: number, soDeXuat = 10) => ({
		dat,
		hong,
		tong: 18,
		soDeXuat,
	});
	ca(
		"soan 13 hong 3",
		kienNghiSoan([s(13, 3), s(14, 2)], 2, false, ng.soan_okr).kien_nghi,
		MTV.model,
	);
	ca(
		"soan 12",
		kienNghiSoan([s(12, 3), s(14, 2)], 2, false, ng.soan_okr).kien_nghi,
		`giữ ${ng.soan_okr.giu}`,
	);
	ca(
		"soan hong 4",
		kienNghiSoan([s(13, 4), s(14, 2)], 2, false, ng.soan_okr).kien_nghi,
		`giữ ${ng.soan_okr.giu}`,
	);
	ca(
		"soan loi dan lech",
		kienNghiSoan([s(14, 0), s(14, 0)], 2, true, ng.soan_okr).kien_nghi,
		SO.ketKien.chuaDu,
	);
	ca(
		"soan khong nop",
		kienNghiSoan([s(18, 0, 0), s(14, 0)], 2, false, ng.soan_okr).kien_nghi,
		`giữ ${ng.soan_okr.giu}`,
	);
	return {
		hong,
		dong: hong.length ? [] : ["ma tran bien: 11 o dung kien nghi"],
	};
}

const CHIEU_DO: readonly ChieuDo[] = [
	{
		eval: "E1-E6",
		ten: "ban sao nguyen (doi chung duong)",
		mong: "xanh",
		phaiCo: [],
		chay: () => tuDocs(banSao(), docsGoc() ?? ""),
	},
	{
		eval: "E1",
		ten: "xoa mot dong tac-nhan",
		mong: "do",
		phaiCo: [N.thieu],
		chay: () => {
			const ev = banSao();
			suaDong(ev, (ds) => ds.slice(1));
			return tuDocs(ev, capLai(ev));
		},
	},
	{
		eval: "E1",
		ten: "bot mot hang aichiphi phien con",
		mong: "do",
		phaiCo: [`${N.lech} ${MTV.tep.bangTacNhan}`],
		chay: () => {
			const ev = banSao();
			const d = dong0(ev);
			const hang = z.array(khuonHangChiPhi).parse(docJson(ev, d.aichiphi));
			const i = hang.findIndex(
				(h) => h.phienCha === d.phien_goc && h.sessionId !== d.phien_goc,
			);
			writeFileSync(
				join(ev, d.aichiphi),
				`${JSON.stringify(
					hang.filter((_, j) => j !== i),
					null,
					2,
				)}\n`,
			);
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E1",
		ten: "hai luot chong gio",
		mong: "do",
		phaiCo: [N.chong],
		chay: () => {
			const ev = banSao();
			suaDong(ev, (ds) => {
				const a = ds[0];
				const b = ds[1];
				if (a && b)
					b.bat_dau = new Date(Date.parse(a.ket_thuc) - 1000).toISOString();
				return ds;
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E1",
		ten: "luot flash mang bam ban low",
		mong: "do",
		phaiCo: [`${N.roSuyLuan} flash-`],
		chay: () => {
			const ev = banSao();
			const kt = khuonKeHoachTacNhan.parse(docJson(ev, MTV.tep.keHoachTacNhan));
			suaDong(ev, (ds) => {
				const f = ds.find((d) => d.bien_the === "flash");
				if (f) f.bam_agent = kt.bam_agent_low;
				return ds;
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E1",
		ten: "bo chan doc lai trong ban sao ma",
		mong: "do",
		phaiCo: [N.docLai],
		chay: () =>
			kiem(banSao(), maGoc().replace(SO.chanDocLai, "if (false)"), docsGoc()),
	},
	{
		eval: "E1",
		ten: "model phien con lui ve glm-5.2-fast",
		mong: "xanh",
		phaiCo: [N.saiModelTn],
		chay: () => {
			const ev = banSao();
			const d = dong0(ev);
			writeFileSync(
				join(ev, d.su_kien),
				`${JSON.stringify([{ sessionId: "x", modelId: "zai/glm-5.2-fast" }], null, 2)}\n`,
			);
			suaDong(ev, (ds) => {
				const x = ds[0];
				if (x) x.model_phien_con = "zai/glm-5.2-fast";
				return ds;
			});
			const docs = capLai(ev);
			const k = tuDocs(ev, docs);
			const b = khuonBang.parse(docJson(ev, MTV.tep.bang));
			const h = b.hang.find((x) => x.vai === "tac-nhan");
			return {
				hong: [
					...k.hong,
					...(h?.ghi_chu.some((g) => g.startsWith(N.saiModelTn))
						? []
						: ["bang khong ghi luot sai model"]),
				],
				dong: k.dong,
			};
		},
	},
	{
		eval: "E2",
		ten: "xoa muc low",
		mong: "do",
		phaiCo: [`${N.doSuyLuan} low`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.doSuyLuan, khuonDoSuyLuan, (x) => {
				x.muc = { "mac-dinh": x.muc["mac-dinh"], high: x.muc.high };
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E2",
		ten: "doi model mot muc",
		mong: "do",
		phaiCo: [`${N.saiModelDsl} high`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.doSuyLuan, khuonDoSuyLuan, (x) => {
				if (x.muc.high) x.muc.high.model = "zai/glm-5.2-fast";
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E3",
		ten: "xoa mot ma vong hai",
		mong: "do",
		phaiCo: [`${N.thieuMa} m05 vong hai`],
		chay: () => {
			const ev = banSao();
			const t = join(ev, MTV.tep.kho, "luot-1", MTV.tep.khoTungCau);
			writeFileSync(
				t,
				`${readFileSync(t, "utf8")
					.split("\n")
					.filter(
						(d) => d && !(d.includes('"luot":2') && d.includes('"id":"m05"')),
					)
					.join("\n")}\n`,
			);
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E3",
		ten: "model kho la glm-5.2-fast",
		mong: "do",
		phaiCo: [N.saiModelKho],
		chay: () => {
			const ev = banSao();
			suaJson(
				ev,
				join(MTV.tep.kho, "luot-1", MTV.tep.khoTom),
				khuonKhoTom,
				(x) => {
					x.model_kho = "zai/glm-5.2-fast";
				},
			);
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E3",
		ten: "doi bam bo-mau",
		mong: "do",
		phaiCo: [N.boMau],
		chay: () => {
			const ev = banSao();
			suaJson(
				ev,
				join(MTV.tep.kho, "luot-1", MTV.tep.khoTom),
				khuonKhoTom,
				(x) => {
					x.bam_bo_mau = "0".repeat(64);
				},
			);
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E4",
		ten: "loi dan luot 1 lech moc",
		mong: "do",
		phaiCo: [N.loiDan.toLowerCase(), `${N.traiLuat} soan-okr`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.soan(1), khuonSoanMh4, (x) => {
				x.bam.loiDan = "0".repeat(64);
			});
			const k = tuDocs(ev, docsGoc() ?? "");
			const ky = k.bang.hang.find((h) => h.vai === "soan-okr");
			return {
				hong: [
					...k.hong,
					...(ky?.ghi_chu.includes(SO.ketKien.loiDanLech) &&
					ky.kien_nghi === SO.ketKien.chuaDu
						? []
						: ["bang in lai khong ghi loi dan lech moc"]),
				],
				dong: k.dong,
			};
		},
	},
	{
		eval: "E4",
		ten: "doi moHinh luot 2",
		mong: "do",
		phaiCo: [`${N.saiModelSoan} 2`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.soan(2), khuonSoanMh4, (x) => {
				x.moHinh = "google/gemini-3.8-flash";
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E4",
		ten: "xoa tep luot soan 2",
		mong: "do",
		phaiCo: [`${N.thieuSoan} 2`],
		chay: () => {
			const ev = banSao();
			rmSync(join(ev, MTV.tep.soan(2)));
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E4",
		ten: "luot 1 khong nop de xuat, luot 2 dat (doi chung: luot 1 nop thi kien nghi doi)",
		mong: "xanh",
		phaiCo: [`${N.luotHong} 1: khong nop de xuat`],
		chay: () => {
			const dung = (khongNop: boolean) => {
				const ev = banSao();
				suaJson(ev, MTV.tep.soan(2), khuonSoanMh4, (x) => {
					x.soDeXuat = 10;
					x.khongNopDeXuat = false;
					x.dat = 18;
					x.hong = 0;
				});
				suaJson(ev, MTV.tep.soan(1), khuonSoanMh4, (x) => {
					x.soDeXuat = khongNop ? 0 : 10;
					x.khongNopDeXuat = khongNop;
					x.dat = 18;
					x.hong = 0;
				});
				const docs = capLai(ev);
				return tuDocs(ev, docs);
			};
			const co = dung(true);
			const khong = dung(false);
			const kn = (k: KetTong) =>
				k.bang.hang.find((h) => h.vai === "soan-okr")?.kien_nghi;
			return {
				hong: [
					...co.hong,
					...khong.hong,
					...(kn(co) === "giữ google/gemini-3.8-flash"
						? []
						: [`luot khong nop ma kien nghi ${kn(co)}`]),
					...(kn(khong) === MTV.model
						? []
						: [`doi chung luot nop ma kien nghi ${kn(khong)}`]),
				],
				dong: co.dong,
			};
		},
	},
	{
		eval: "E5",
		ten: "ma tran bien nguong",
		mong: "xanh",
		phaiCo: [],
		chay: luatBien,
	},
	{
		eval: "E5",
		ten: "sua mot o so",
		mong: "do",
		phaiCo: [`${N.lechSo} soan-okr`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "soan-okr");
				if (h)
					h.so_moc = h.so_moc.map((s, i) =>
						i === 0 ? { ...s, gia_tri: "18/18" } : s,
					);
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E5",
		ten: "kien nghi tac-nhan trai luat",
		mong: "do",
		phaiCo: [`${N.traiLuat} tac-nhan`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "tac-nhan");
				if (h)
					h.kien_nghi = h.kien_nghi.startsWith("giữ")
						? `${MTV.model} (flash)`
						: "giữ zai/glm-5.2-fast";
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E5",
		ten: "xoa hang may-soan-kho",
		mong: "do",
		phaiCo: [`${N.thieuVai} may-soan-kho`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.bang, khuonBang, (x) => {
				x.hang = x.hang.filter((y) => y.vai !== "may-soan-kho");
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E5",
		ten: "sua mot byte docs",
		mong: "do",
		phaiCo: [N.docs],
		chay: () => tuDocs(banSao(), `${docsGoc() ?? ""}x`),
	},
	{
		eval: "E5",
		ten: "tro so vao tep khong ton tai",
		mong: "do",
		phaiCo: [`${N.tepVang} _acceptance/khong-co.json`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "judge-okr");
				if (h?.so_moc[0]) h.so_moc[0].tep = "_acceptance/khong-co.json";
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E5",
		ten: "xoa thong so chua do cua hang giu",
		mong: "do",
		phaiCo: [`${N.thongSo} judge-okr`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "judge-okr");
				if (h) h.thong_so_chua_do = [];
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E6",
		ten: "vuot tran van chay luot sau",
		mong: "do",
		phaiCo: [N.vuotTran],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.chiPhi, khuonChiPhi, (x) => {
				if (x.luot[0]) x.luot[0].usd = 100;
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
	{
		eval: "E6",
		ten: "luot tac-nhan dung vi tran ma van kien nghi",
		mong: "do",
		phaiCo: [`${N.tranKienNghi} tac-nhan`],
		chay: () => {
			const ev = banSao();
			suaJson(ev, MTV.tep.chiPhi, khuonChiPhi, (x) => {
				x.luot.push({
					vai: "tac-nhan",
					luot: "flash-99",
					luc: new Date().toISOString(),
					trang_thai: "dung-vi-tran",
					usd: null,
					tep: null,
				});
			});
			suaJson(ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "tac-nhan");
				if (h) h.kien_nghi = `${MTV.model} (flash)`;
			});
			return tuDocs(ev, docsGoc() ?? "");
		},
	},
];

const CHIEU_DO_PHAM_VI: readonly {
	ten: string;
	chay: () => string[];
	phaiCo: string;
}[] = [
	{
		ten: "them tep agent-okr",
		chay: () => phamVi(["apps/agent-okr/agent/lib/config.ts"], "", "", []),
		phaiCo: `${N.ngoai}: apps/agent-okr/agent/lib/config.ts`,
	},
	{
		ten: "config.yaml co dong xoa",
		chay: () => phamVi([], "-    cu: 1", "", []),
		phaiCo: "config.yaml",
	},
	{
		ten: "lech onehub agent-okr",
		chay: () =>
			phamVi(
				[],
				"",
				"diff --git a/apps/agent-okr/agent/lib/config.ts b/apps/agent-okr/agent/lib/config.ts\n",
				[],
			),
		phaiCo: `${N.onehub} apps/agent-okr/agent/lib/config.ts`,
	},
	{
		ten: "sua tam chua tra",
		chay: () => phamVi([], "", "", [MTV.suaTam.taiLieu]),
		phaiCo: N.cayBan,
	},
];

function chayChieuDo(): boolean {
	let ok = true;
	for (const c of CHIEU_DO) {
		let r: KetChieu;
		try {
			r = c.chay();
		} catch (loi) {
			r = {
				hong: [`nem loi: ${loi instanceof Error ? loi.message : String(loi)}`],
				dong: [],
			};
		}
		const thieu = c.phaiCo.filter(
			(p) =>
				!r.hong.some((h) => h.includes(p)) &&
				!r.dong.some((d) => d.includes(p)),
		);
		const dung =
			c.mong === "xanh"
				? r.hong.length === 0 && thieu.length === 0
				: r.hong.length > 0 && thieu.length === 0;
		if (!dung) ok = false;
		console.log(
			`chieu do ${c.eval} «${c.ten}»: ${dung ? "dung" : "SAI"}${dung ? "" : ` — hong [${r.hong.slice(0, 4).join("; ")}] thieu [${thieu.join("; ")}]`}`,
		);
	}
	for (const t of tam) rmSync(t, { recursive: true, force: true });
	return ok;
}

const doiSo = process.argv.slice(2);
if (import.meta.main) {
	try {
		if (doiSo.includes("--pham-vi")) {
			const ra = lenhPhamVi();
			let ok = ra.length === 0;
			for (const c of CHIEU_DO_PHAM_VI) {
				const r = c.chay();
				const dung = r.some((x) => x.includes(c.phaiCo));
				if (!dung) ok = false;
				console.log(`chieu do E7 «${c.ten}»: ${dung ? "dung" : "SAI"}`);
			}
			console.log(
				ra.length
					? ra.join("\n")
					: "pham vi: chi ho so, docs/model-theo-vai.md va dong them config.yaml; sua tam da tra; hai tep khai model OKR khong lech origin/onehub",
			);
			process.exit(ok ? 0 : 1);
		}
		if (doiSo.includes("--ghi")) {
			const k = kiem(MTV.evidence, maGoc(), null);
			writeFileSync(MTV.tep.docs, ghiLai(MTV.evidence, k));
			console.log(
				`da ghi ${MTV.tep.bang}, ${MTV.tep.bangTacNhan}, docs/model-theo-vai.md`,
			);
		}
		const k = kiem(MTV.evidence, maGoc(), docsGoc());
		for (const d of k.dong) console.log(d);
		for (const h of k.hong) console.log(h);
		const cd = chayChieuDo();
		const ok = k.hong.length === 0 && cd;
		console.log(
			ok
				? "dat: bang kien nghi tinh lai khop bang chung, moi chieu do ghim dung"
				: "KHONG DAT",
		);
		process.exit(ok ? 0 : 1);
	} catch (loi) {
		console.log(
			`KHONG DO DUOC: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exit(2);
	}
}
