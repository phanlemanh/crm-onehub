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
import { join, resolve } from "node:path";
import {
	type Bang as BangKho,
	docBaoCao,
	kiemBangChung,
} from "../../bo-cau-hoi-mau/rang/bang-do";
import { banSuaTam as suaKho } from "./do-kho";
import { banSuaTam as suaSoan } from "./do-soan";
import { banLow } from "./do-tac-nhan";
import { giaLap } from "./gia-lap";
import {
	type Bang,
	type ChiPhi,
	chiPhiPhan,
	type DongTacNhan,
	DUONG,
	GOC,
	giaCua,
	type HangBang,
	type HangChiPhi,
	type KeHoach,
	type KhoTom,
	khoaChi,
	khuonBang,
	khuonChiPhi,
	khuonDongTacNhan,
	khuonDoSuyLuan,
	khuonKeHoach,
	khuonKeHoachTacNhan,
	khuonKetXuat,
	khuonKhoTom,
	khuonNguong,
	khuonSoan,
	khuonSoanMh4,
	khuonSuKienChon,
	LOI_KHONG_ZDR,
	laCu,
	laLow,
	MTV,
	MUC_SUY_LUAN,
	modelCua,
	type Nguong,
	type So,
	type SoanMh4,
	type SoCon,
	sha256,
	soCon,
	type TrangThai,
	type UngVienBang,
	ungVienCuaBienThe,
	VAI,
	type VaiChi,
	z,
} from "./khuon";

const DIR_EV = `_acceptance/${MTV.slug}/evidence`;

export const SO = {
	tepDoTacNhan: join(MTV.rang, "do-tac-nhan.ts"),
	chanDocLai: "if (doc.id !== model)",
	goiDat: "datModel(url, model);",
	goiEval: "await chay(",
	boMau: "_acceptance/bo-cau-hoi-mau/bo-mau.json",
	nhomNgoai: "khong-phai-quy-dinh",
	boGhim: [
		"bang-kien-nghi.json",
		"bang-tac-nhan.md",
		"chi-phi.json",
		"ke-hoach.json",
		"ke-hoach-tac-nhan.json",
		"tac-nhan.jsonl",
	],
	sai: 1e-6,
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
		thieuDsl: "thieu do suy luan",
		saiModelDsl: "SAI MODEL DO SUY LUAN",
		gatewayLoi: "DO SUY LUAN GATEWAY LOI",
		thieuMa: "THIEU MA",
		saiModelKho: "SAI MODEL KHO",
		boMau: "BO-MAU LECH",
		kho: "KHO LECH",
		suaTam: "BAM SUA TAM LECH",
		loiDan: "loi dan lech moc",
		saiModelSoan: "SAI MODEL SOAN",
		thieuSoan: "THIEU LUOT SOAN",
		khongNop: "khong nop lech",
		luotHong: "luot soan hong",
		thuoc: "THUOC LECH MOC",
		judge: "JUDGE LECH MOC",
		thieuKetXuat: "thieu ket xuat aichiphi",
		lechSo: "LECH SO",
		traiLuat: "KIEN NGHI TRAI LUAT",
		thieuVai: "THIEU VAI",
		thieuUng: "thieu ung vien",
		thuaUng: "thua ung vien",
		thongSo: "THONG SO CHUA DO",
		docs: "DOCS LECH",
		tepVang: "TEP VANG",
		vuotTran: "VUOT TRAN VAN CHAY",
		tranKienNghi: "THIEU LUOT VAN KIEN NGHI",
		lechUsd: "LECH USD",
		tongTran: "TONG VUOT TRAN",
		trungKhoa: "trung khoa chi phi",
		thieuDongChi: "thieu dong chi phi",
		khoaLa: "khoa chi phi la",
		thuTu: "thu tu lech",
		glmDoi: "bang chung glm doi",
		ngoai: "NGOAI PHAM VI",
		onehub: "LECH ONEHUB",
		cayBan: "SUA TAM CHUA TRA",
		git: "KHONG DO DUOC PHAM VI",
	},
	ketKien: {
		chuaDu: "chưa đủ số",
		loiDanLech: "lời dặn lệch mốc",
		thieuKetXuat: "thiếu kết xuất aiChiPhi",
		dungTran: "dừng vì trần",
	},
	chieu: { ds: "ds", gem: "gem" },
} as const;

const N = SO.nhan;
const doc = (ev: string, t: string) => readFileSync(join(ev, t), "utf8");
const docJson = (ev: string, t: string): unknown => JSON.parse(doc(ev, t));
const trungVi = (xs: number[]) => {
	const s = [...xs].sort((a, b) => a - b);
	if (!s.length) return null;
	const g = Math.floor(s.length / 2);
	return s.length % 2 ? (s[g] ?? null) : ((s[g - 1] ?? 0) + (s[g] ?? 0)) / 2;
};
const tb = (xs: number[]) =>
	xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const tron = (x: number, c = 4) => Number(x.toFixed(c));
const tronN = (x: number | null, c: number) => (x === null ? null : tron(x, c));
const evRel = (t: string) => `${DIR_EV}/${t}`;
const tongCost = (hang: HangChiPhi[]) =>
	tron(
		hang.reduce((s, h) => s + (h.costUsd ?? 0), 0),
		6,
	);
const ngayMax = (xs: string[]) =>
	xs.length ? ([...xs].sort().at(-1)?.slice(0, 10) ?? null) : null;

const boNhoGit = new Map<string, string>();
function chayGit(doiSo: string[]): string {
	const khoa = doiSo.join("\0");
	const co = boNhoGit.get(khoa);
	if (co !== undefined) return co;
	const r = spawnSync("git", ["-C", GOC, ...doiSo], { encoding: "utf8" });
	if (r.status !== 0)
		throw new Error(
			`${N.git}: git ${doiSo.join(" ")} — ${(r.stderr || "").trim()}`,
		);
	boNhoGit.set(khoa, r.stdout);
	return r.stdout;
}
const boNhoMoc = new Map<string, Buffer>();
function tepMoc(f: string): Buffer {
	const co = boNhoMoc.get(f);
	if (co) return co;
	const r = spawnSync("git", [
		"-C",
		GOC,
		"show",
		`${MTV.cu.moc}:${DIR_EV}/${f}`,
	]);
	if (r.status !== 0)
		throw new Error(`${N.git}: git show ${MTV.cu.moc}:${DIR_EV}/${f}`);
	boNhoMoc.set(f, r.stdout);
	return r.stdout;
}
const dsTepMoc = () =>
	chayGit(["ls-tree", "-r", "--name-only", MTV.cu.moc, "--", DIR_EV])
		.split("\n")
		.filter(Boolean)
		.map((f) => f.slice(DIR_EV.length + 1));
const tepHead = (tep: string) => chayGit(["show", `HEAD:${tep}`]);
const blobHead = (tep: string) => chayGit(["rev-parse", `HEAD:${tep}`]).trim();

function docChiPhiEv(ev: string): ChiPhi | null {
	return existsSync(join(ev, MTV.tep.chiPhi))
		? khuonChiPhi.parse(docJson(ev, MTV.tep.chiPhi))
		: null;
}
const docDongTho = (ev: string) =>
	existsSync(join(ev, MTV.tep.tacNhan))
		? doc(ev, MTV.tep.tacNhan).split("\n").filter(Boolean)
		: [];
function luotDungTran(c: ChiPhi | null, vai: VaiChi): Set<string> {
	return new Set(
		(c?.luot ?? [])
			.filter((l) => l.vai === vai && l.trang_thai === "dung-vi-tran")
			.map((l) => l.luot),
	);
}
const loc = (ke: KeHoach, tu: string[]) =>
	ke.thong_so_chua_do.filter((t) => tu.some((x) => t.includes(x)));

class SoLoai {
	private m = new Map<string, string[]>();
	them(ma: string, tin: string) {
		this.m.set(ma, [...(this.m.get(ma) ?? []), tin]);
	}
	cua(ma: string): string[] {
		return this.m.get(ma) ?? [];
	}
}

export function kiemGlm(ev: string): string[] {
	const hong: string[] = [];
	for (const f of dsTepMoc()) {
		if ((SO.boGhim as readonly string[]).includes(f)) continue;
		const p = join(ev, f);
		if (!existsSync(p) || !readFileSync(p).equals(tepMoc(f)))
			hong.push(`${N.glmDoi} ${f}`);
	}
	const nay = new Set(docDongTho(ev));
	for (const d of tepMoc(MTV.tep.tacNhan).toString("utf8").split("\n"))
		if (d && !nay.has(d)) {
			const x = khuonDongTacNhan.parse(JSON.parse(d));
			hong.push(`${N.glmDoi} ${MTV.tep.tacNhan} ${x.bien_the}-${x.luot}`);
		}
	const cu = khuonChiPhi.parse(JSON.parse(tepMoc(MTV.tep.chiPhi).toString()));
	const c = docChiPhiEv(ev);
	for (const l of cu.luot) {
		const x = c?.luot.find((y) => y.vai === l.vai && y.luot === l.luot);
		if (!x || JSON.stringify(x) !== JSON.stringify(l))
			hong.push(`${N.glmDoi} ${MTV.tep.chiPhi} ${l.vai} ${l.luot}`);
	}
	return hong;
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

type LuotTn = {
	d: DongTacNhan;
	ma: string;
	c: SoCon;
	usd: number;
	phan: number;
};
export type KetTacNhan = {
	hong: string[];
	dong: string[];
	hop: LuotTn[];
	usd: Map<string, number>;
	loai: SoLoai;
	bang: string;
};

function inBangTacNhan(ke: KeHoach, hop: LuotTn[], loai: string[]): string {
	const thuTu = ke.tac_nhan.ung_vien.flatMap((u) => u.bien_the);
	const sx = [...hop].sort(
		(a, b) =>
			thuTu.indexOf(a.d.bien_the) - thuTu.indexOf(b.d.bien_the) ||
			a.d.luot - b.d.luot,
	);
	return [
		"# Bảng Tác nhân bộ dựng",
		"",
		"| ứng viên | model | biến thể | lượt | kết quả | giây cả lượt | model phiên con | bước phiên con | token vào con | token ra con | giây phiên con | USD | chi phí phần ứng viên (USD) | nhật ký |",
		"| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
		...sx.map(
			({ d, c, usd, ma, phan }) =>
				`| ${ma} | ${d.model} | ${d.bien_the} | ${d.luot} | ${d.ket_qua}${d.bi_cat ? " (quá trần)" : ""} | ${d.bi_cat ? `≥${MTV.tran}` : d.giay} | ${d.model_phien_con ?? "?"} | ${c.so_buoc} | ${c.token_vao} | ${c.token_ra} | ${c.giay} | ${usd} | ${phan} | ${d.nhat_ky} |`,
		),
		"",
		"## Loại khỏi bảng",
		"",
		...(loai.length ? loai.map((l) => `- ${l}`) : ["- (không có)"]),
		"",
	].join("\n");
}

function kiemGio(ke: KeHoach, ds: DongTacNhan[]): string[] {
	const hong: string[] = [];
	const k = (d: DongTacNhan) => khoaChi("tac-nhan", d.bien_the, d.luot);
	const theoGio = [...ds].sort(
		(a, b) => Date.parse(a.bat_dau) - Date.parse(b.bat_dau),
	);
	for (let i = 1; i < theoGio.length; i++) {
		const a = theoGio[i - 1];
		const b = theoGio[i];
		if (a && b && Date.parse(b.bat_dau) < Date.parse(a.ket_thuc))
			hong.push(`${N.chong}: ${k(a)} ${k(b)}`);
	}
	for (const u of ke.tac_nhan.ung_vien) {
		const cua = theoGio.filter((d) => u.bien_the.includes(d.bien_the));
		for (let i = 1; i < cua.length; i++) {
			const a = cua[i - 1];
			const b = cua[i];
			if (a && b && a.bien_the === b.bien_the)
				hong.push(`${N.lien}: ${k(a)} ${k(b)}`);
		}
	}
	return hong;
}

export function kiemTacNhan(
	ev: string,
	ke: KeHoach,
	maNguon: string,
): KetTacNhan {
	const hong: string[] = [];
	const ra: string[] = [];
	const loaiDs: string[] = [];
	const loai = new SoLoai();
	const usd = new Map<string, number>();
	const dungTran = luotDungTran(docChiPhiEv(ev), "tac-nhan");
	const kt = khuonKeHoachTacNhan.parse(docJson(ev, MTV.tep.keHoachTacNhan));
	const ds = docDongTho(ev).map((d) => khuonDongTacNhan.parse(JSON.parse(d)));
	const k = (d: DongTacNhan) => khoaChi("tac-nhan", d.bien_the, d.luot);
	const can = ke.tac_nhan.ung_vien.flatMap((u) =>
		u.bien_the.flatMap((b) =>
			Array.from({ length: ke.tac_nhan.so_luot }, (_, i) =>
				khoaChi("tac-nhan", b, i + 1),
			),
		),
	);
	const co = new Set(ds.map(k));
	for (const x of can)
		if (!co.has(x) && !dungTran.has(x)) hong.push(`${N.thieu} ${x}`);
	for (const x of dungTran) {
		const b = x.replace(/-\d+$/, "");
		const ma = ungVienCuaBienThe(ke, b);
		if (ma) loai.them(ma, `${SO.ketKien.dungTran} ${x}`);
		loaiDs.push(`${SO.ketKien.dungTran} ${x}`);
	}
	const daThay = new Set<string>();
	for (const d of ds) {
		if (!can.includes(k(d)) || daThay.has(k(d)) || dungTran.has(k(d)))
			hong.push(`${N.thua} ${k(d)}`);
		daThay.add(k(d));
	}
	const gocHead = tepHead(MTV.suaTam.agentBuilder);
	if (kt.bam_agent_goc !== sha256(gocHead)) hong.push(N.bamGoc);
	if (kt.bam_agent_low !== sha256(banLow(gocHead)))
		hong.push(`${N.bamGoc} (ban low)`);
	hong.push(...kiemGio(ke, ds));
	const hop: LuotTn[] = [];
	for (const d of ds) {
		const ma = ungVienCuaBienThe(ke, d.bien_the);
		if (!ma) continue;
		if (d.ung_vien !== undefined && d.ung_vien !== ma)
			hong.push(`${N.thua} ${k(d)}: ung vien ${d.ung_vien}`);
		if (!existsSync(join(ev, d.aichiphi)) || !existsSync(join(ev, d.su_kien))) {
			hong.push(`${N.tepVang} ${d.aichiphi} / ${d.su_kien}`);
			continue;
		}
		const hang = khuonKetXuat.parse(docJson(ev, d.aichiphi));
		const c = soCon(hang, d.phien_goc);
		usd.set(k(d), tongCost(hang));
		if (c.so_buoc < 1) hong.push(`${N.lech} ${k(d)}: so buoc phien con 0`);
		if (d.phien_con && JSON.stringify(d.phien_con) !== JSON.stringify(c))
			hong.push(`${N.lech} ${k(d)}: phien con`);
		if (
			d.ket_qua === "hong" &&
			(d.ly_do ?? "").includes("qua tran") &&
			!d.bi_cat
		)
			hong.push(`${N.biCat} ${k(d)}`);
		const bamDung = laLow(d.bien_the) ? kt.bam_agent_low : kt.bam_agent_goc;
		if (d.bam_agent !== bamDung) hong.push(`${N.roSuyLuan} ${k(d)}`);
		const sk = khuonSuKienChon.parse(docJson(ev, d.su_kien));
		const modelSk = [...new Set(sk.map((s) => s.modelId))];
		const modelTinh = modelSk.length === 1 ? (modelSk[0] ?? null) : null;
		if (modelTinh !== d.model_phien_con) hong.push(`${N.suKien} ${k(d)}`);
		const model = modelCua(ke, ma);
		if (d.model !== model || d.model_phien_con !== model) {
			const tin = `${N.saiModelTn} ${k(d)} (${d.model_phien_con ?? "khong doc duoc"})`;
			ra.push(tin);
			loaiDs.push(tin);
			loai.them(ma, tin);
			continue;
		}
		hop.push({
			d,
			ma,
			c,
			usd: tongCost(hang),
			phan: chiPhiPhan(hang, giaCua(ke, ma), null),
		});
	}
	for (const u of ke.tac_nhan.ung_vien)
		for (const b of u.bien_the) {
			const n = hop.filter((x) => x.d.bien_the === b).length;
			if (n < ke.tac_nhan.so_luot)
				ra.push(`${N.thieuLuot} ${b} (${n}/${ke.tac_nhan.so_luot})`);
		}
	const bang = inBangTacNhan(ke, hop, loaiDs);
	if (
		!existsSync(join(ev, MTV.tep.bangTacNhan)) ||
		doc(ev, MTV.tep.bangTacNhan) !== bang
	)
		hong.push(`${N.lech} ${MTV.tep.bangTacNhan}`);
	const dl = kiemDocLai(maNguon);
	hong.push(...dl);
	if (!dl.length)
		ra.push("doc lai model: o model cua kho do doc lai truoc moi luot");
	return { hong, dong: ra, hop, usd, loai, bang };
}

export type KetSuyLuan = {
	hong: string[];
	dong: string[];
	usd: Map<string, number>;
};

export function kiemSuyLuan(ev: string, ke: KeHoach): KetSuyLuan {
	const hong: string[] = [];
	const ra: string[] = [];
	const usd = new Map<string, number>();
	const dungTran = luotDungTran(docChiPhiEv(ev), "dao");
	for (const ma of ke.do_suy_luan.ung_vien) {
		const f = DUONG.doSuyLuan(ma);
		const khoa = khoaChi("dao", ma, 1);
		if (!existsSync(join(ev, f))) {
			if (dungTran.has(khoa))
				ra.push(`do suy luan ${ma}: ${SO.ketKien.dungTran}`);
			else hong.push(`${N.thieuDsl} ${ma}`);
			continue;
		}
		if (dungTran.has(khoa))
			hong.push(`${N.thua} dao ${khoa}: dung vi tran ma co tep`);
		const d = khuonDoSuyLuan.parse(docJson(ev, f));
		const model = modelCua(ke, ma);
		usd.set(khoa, d.usd);
		for (const m of MUC_SUY_LUAN) {
			const x = d.muc[m];
			if (!x) {
				hong.push(`${N.doSuyLuan} ${m} ${ma}`);
				continue;
			}
			if (x.status !== 200)
				hong.push(`${N.gatewayLoi} ${ma} ${m} status ${x.status}`);
			if (x.model !== null && x.model !== model)
				hong.push(`${N.saiModelDsl} ${ma} ${m}`);
		}
		if (d.model !== model) hong.push(`${N.saiModelDsl} ${ma} tep`);
		if (d.ung_vien !== undefined && d.ung_vien !== ma)
			hong.push(`${N.saiModelDsl} ${ma} ung vien ${d.ung_vien}`);
		const md = d.muc["mac-dinh"]?.token_suy_luan;
		const lo = d.muc.low?.token_suy_luan;
		const hi = d.muc.high?.token_suy_luan;
		const thieu = [md, lo, hi].some((x) => x === null || x === undefined);
		const ket = thieu
			? `chua kiem duoc ${ma} (Gateway khong tra token suy luan)`
			: (lo ?? 0) < (md ?? 0)
				? `muc low toi nha cung cap ${ma}`
				: `muc low KHONG lam giam token suy luan ${ma}`;
		ra.push(
			`do suy luan ${ma} ${d.model}: mac-dinh ${md ?? "?"} / low ${lo ?? "?"} / high ${hi ?? "?"} token suy luan — ${ket}`,
		);
	}
	return { hong, dong: ra, usd };
}

type LuotKho = {
	ma: string;
	n: number;
	tom: KhoTom;
	bang: BangKho | null;
	hang: HangChiPhi[] | null;
	rel: string;
};
export type KetKho = {
	hong: string[];
	dong: string[];
	luot: LuotKho[];
	usd: Map<string, number>;
	loai: SoLoai;
};

function docKetXuat(
	ev: string,
	tep: string | undefined,
	hong: string[],
): HangChiPhi[] | null {
	if (tep === undefined) return null;
	if (!existsSync(join(ev, tep))) {
		hong.push(`${N.tepVang} ${tep}`);
		return null;
	}
	return khuonKetXuat.parse(docJson(ev, tep));
}

function kiemMotKho(
	ev: string,
	ke: KeHoach,
	ma: string,
	n: number,
	ra: KetKho,
): void {
	const boTho = readFileSync(join(GOC, SO.boMau), "utf8");
	const bo = z
		.object({ cau: z.array(z.object({ id: z.string(), nhom: z.string() })) })
		.parse(JSON.parse(boTho));
	const model = modelCua(ke, ma);
	const rel = DUONG.kho(ma, n);
	const thu = join(ev, rel);
	const tom = khuonKhoTom.parse(docJson(thu, MTV.tep.khoTom));
	const ten = `${ma} luot ${n}`;
	ra.usd.set(khoaChi("tro-ly-kho", ma, n), tom.usd);
	if (!laCu(ma)) {
		if (tom.ung_vien !== ma)
			ra.hong.push(`${N.kho} ${ten}: ung vien ${tom.ung_vien ?? "?"}`);
		if (!tom.aichiphi) ra.hong.push(`${N.thieuKetXuat} kho ${ten}`);
		if (!tom.so_du_truoc || !tom.so_du_sau)
			ra.hong.push(`${N.kho} ${ten}: thieu so du gateway truoc sau`);
	}
	const hang = docKetXuat(ev, tom.aichiphi, ra.hong);
	if (
		hang &&
		tom.usd_nguon === "aichiphi" &&
		Math.abs(tongCost(hang) - tom.usd) > SO.sai
	)
		ra.hong.push(
			`${N.lechUsd} kho ${ten}: aichiphi ${tongCost(hang)} khac ${tom.usd}`,
		);
	if (tom.usd_nguon === "aichiphi" && !hang)
		ra.hong.push(
			`${N.lechUsd} kho ${ten}: usd_nguon aichiphi ma khong co ket xuat`,
		);
	if (tom.model_kho !== model) {
		ra.hong.push(`${N.saiModelKho} ${ten} (${tom.model_kho ?? "?"})`);
		ra.loai.them(ma, `sai model kho ${ma}-${n}`);
		return;
	}
	if (tom.bam_bo_mau !== sha256(boTho)) ra.hong.push(`${N.boMau} ${ten}`);
	const suaDung = sha256(suaKho(tepHead(MTV.suaTam.taiLieu), model));
	if (
		tom.bam_sua_tam !== suaDung ||
		tom.bam_commit !== blobHead(MTV.suaTam.taiLieu)
	)
		ra.hong.push(`${N.suaTam} kho ${ten}`);
	const jsonl = existsSync(join(thu, MTV.tep.khoTungCau))
		? readFileSync(join(thu, MTV.tep.khoTungCau), "utf8")
		: "";
	const md = existsSync(join(thu, MTV.tep.khoBaoCao))
		? readFileSync(join(thu, MTV.tep.khoBaoCao), "utf8")
		: null;
	const k = kiemBangChung(boTho, md, jsonl || null);
	if (tom.loi === LOI_KHONG_ZDR) {
		ra.luot.push({ ma, n, tom, bang: k.ok ? k.bang : null, hang, rel });
		ra.dong.push(`kho ${ten}: ${LOI_KHONG_ZDR} — luot hong`);
		return;
	}
	const dong = jsonl
		.split("\n")
		.filter(Boolean)
		.map((d) =>
			z.object({ luot: z.number(), id: z.string() }).parse(JSON.parse(d)),
		);
	const mot = new Set(dong.filter((d) => d.luot === 1).map((d) => d.id));
	const hai = new Set(dong.filter((d) => d.luot === 2).map((d) => d.id));
	for (const c of bo.cau) {
		if (c.nhom !== SO.nhomNgoai && !mot.has(c.id))
			ra.hong.push(`${N.thieuMa} ${c.id} vong mot ${ten}`);
		if (!hai.has(c.id)) ra.hong.push(`${N.thieuMa} ${c.id} vong hai ${ten}`);
	}
	if (!k.ok) {
		ra.hong.push(`${N.kho} ${ten}: ${k.loi}`);
		return;
	}
	ra.luot.push({ ma, n, tom, bang: k.bang, hang, rel });
	ra.dong.push(
		`kho ${ten}: model kho ${tom.model_kho} · goc ${tom.model_goc ?? "?"} · ma cham ${k.maCham} · usd ${tom.usd} (${tom.usd_nguon})`,
	);
}

export function kiemKho(ev: string, ke: KeHoach): KetKho {
	const ra: KetKho = {
		hong: [],
		dong: [],
		luot: [],
		usd: new Map(),
		loai: new SoLoai(),
	};
	const dungTran = luotDungTran(docChiPhiEv(ev), "tro-ly-kho");
	for (const ma of ke.tro_ly_kho.ung_vien)
		for (let n = 1; n <= ke.tro_ly_kho.so_luot; n++) {
			const khoa = khoaChi("tro-ly-kho", ma, n);
			const coTom = existsSync(join(ev, DUONG.kho(ma, n), MTV.tep.khoTom));
			if (dungTran.has(khoa)) {
				ra.loai.them(ma, `${SO.ketKien.dungTran} ${khoa}`);
				if (coTom) ra.hong.push(`${N.kho}: thua luot ${ma} ${n} dung vi tran`);
				continue;
			}
			if (!coTom) {
				ra.hong.push(`${N.kho}: thieu luot ${ma} ${n}`);
				continue;
			}
			kiemMotKho(ev, ke, ma, n, ra);
		}
	return ra;
}

type LuotSoan = {
	ma: string;
	n: number;
	s: SoanMh4;
	hang: HangChiPhi[] | null;
	tep: string;
};
export type KetSoan = {
	hong: string[];
	dong: string[];
	hop: LuotSoan[];
	usd: Map<string, number>;
	loai: SoLoai;
};

export function kiemSoan(ev: string, ke: KeHoach): KetSoan {
	const ra: KetSoan = {
		hong: [],
		dong: [],
		hop: [],
		usd: new Map(),
		loai: new SoLoai(),
	};
	const dungTran = luotDungTran(docChiPhiEv(ev), "soan-okr");
	const moc = khuonSoan.parse(
		JSON.parse(readFileSync(join(GOC, ke.soan_okr.moc), "utf8")),
	);
	const g = tepHead(MTV.suaTam.agentOkr);
	const blob = blobHead(MTV.suaTam.agentOkr);
	const tepCo = readdirSync(ev);
	for (const ma of ke.soan_okr.ung_vien) {
		const model = modelCua(ke, ma);
		const suaDung = sha256(suaSoan(g, model));
		const goc = DUONG.nhanSoan(ma, 0).replace(/-0$/, "");
		for (const f of tepCo) {
			const m = f.match(/^eval-soan-([a-z0-9]+)-(\d+)\.json$/);
			if (m?.[1] === goc && Number(m[2]) > ke.soan_okr.so_luot)
				ra.hong.push(`${N.thieuSoan}: thua ${f}`);
		}
		for (let n = 1; n <= ke.soan_okr.so_luot; n++) {
			const f = DUONG.soan(ma, n);
			const nhan = DUONG.nhanSoan(ma, n);
			const khoa = khoaChi("soan-okr", ma, n);
			const coTep = existsSync(join(ev, f));
			if (dungTran.has(khoa)) {
				ra.loai.them(ma, `${SO.ketKien.dungTran} ${nhan}`);
				if (coTep) ra.hong.push(`${N.thieuSoan}: thua ${f} dung vi tran`);
				continue;
			}
			if (!coTep) {
				ra.hong.push(`${N.thieuSoan} ${nhan}`);
				continue;
			}
			const s = khuonSoanMh4.parse(docJson(ev, f));
			ra.usd.set(khoa, tron(s.usd, 6));
			let ok = true;
			if (s.moHinh !== model || s.modelGateway !== model) {
				ra.hong.push(
					`${N.saiModelSoan} ${nhan} (${s.moHinh} / ${s.modelGateway ?? "?"})`,
				);
				ra.loai.them(ma, `sai model soan ${nhan}`);
				ok = false;
			}
			if (s.judge !== moc.judge) {
				ra.hong.push(`${N.judge} ${nhan}`);
				ra.loai.them(ma, `judge lech moc ${nhan}`);
				ok = false;
			}
			if (s.bam.thuoc !== moc.bam.thuoc) {
				ra.hong.push(`${N.thuoc} ${nhan}`);
				ra.loai.them(ma, `thuoc lech moc ${nhan}`);
				ok = false;
			}
			if (s.bamSuaTam !== suaDung || s.bamCommit !== blob)
				ra.hong.push(`${N.suaTam} soan ${nhan}`);
			if (!laCu(ma)) {
				if (s.ung_vien !== ma)
					ra.hong.push(`${N.thieuSoan} ${nhan}: ung vien ${s.ung_vien ?? "?"}`);
				if (!s.aichiphi) ra.hong.push(`${N.thieuKetXuat} soan ${nhan}`);
			}
			const hang = docKetXuat(ev, s.aichiphi, ra.hong);
			if (s.bam.loiDan !== moc.bam.loiDan) {
				ra.dong.push(`${N.loiDan} ${nhan}`);
				ra.loai.them(ma, SO.ketKien.loiDanLech);
				ok = false;
			}
			const khongNop = s.khongNopDeXuat ?? s.soDeXuat === 0;
			if (khongNop !== (s.soDeXuat === 0))
				ra.hong.push(`${N.khongNop} ${nhan}`);
			if (khongNop) ra.dong.push(`${N.luotHong} ${nhan}: khong nop de xuat`);
			if (ok) ra.hop.push({ ma, n, s, hang, tep: f });
			ra.dong.push(
				`soan ${nhan}: dat ${s.dat}/${s.tong} hong ${s.hong} judge hong ${s.judgeHong} usd ${s.usd}`,
			);
		}
	}
	return ra;
}

export type ThongKeBienThe = {
	ten: string;
	qua: number;
	so: number;
	trungViGiay: number | null;
};
export type DanhGia = {
	trang_thai: TrangThai;
	ly_do: string;
	diem: number | null;
	giay: number | null;
	bien_the: string | null;
};
const chuaDu = (ly_do: string, bien_the: string | null = null): DanhGia => ({
	trang_thai: "chưa đủ số",
	ly_do,
	diem: null,
	giay: null,
	bien_the,
});
const cmpNull = (a: number | null, b: number | null) =>
	a === null && b === null ? 0 : a === null ? 1 : b === null ? -1 : a - b;

export function daiDien(tk: ThongKeBienThe[]): ThongKeBienThe | null {
	return (
		[...tk].sort(
			(a, b) => b.qua - a.qua || cmpNull(a.trungViGiay, b.trungViGiay),
		)[0] ?? null
	);
}

export function danhGiaTacNhan(
	tk: ThongKeBienThe[],
	soLuot: number,
	loai: string[],
	ng: Nguong["tac_nhan"],
): DanhGia {
	const dd = daiDien(tk);
	if (loai.length)
		return chuaDu(`lượt bị loại: ${loai.join("; ")}`, dd?.ten ?? null);
	if (!dd || tk.some((t) => t.so < soLuot))
		return chuaDu("có biến thể thiếu lượt hợp lệ", dd?.ten ?? null);
	const dat = dd.qua >= ng.luot_qua_toi_thieu;
	return {
		trang_thai: dat ? "đạt" : "không đạt",
		ly_do: dat
			? `${dd.ten} qua ${dd.qua}/${dd.so} lượt dưới ${ng.tran_giay} giây; ngưỡng ${ng.luot_qua_toi_thieu}/${ng.tren_so_luot}`
			: `không biến thể nào qua ≥ ${ng.luot_qua_toi_thieu}/${ng.tren_so_luot} lượt dưới ${ng.tran_giay} giây`,
		diem: dd.qua,
		giay: dd.trungViGiay,
		bien_the: dd.ten,
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

export type LuotKhoDanh = { so: SoKho | null; zdr: boolean };

export function danhGiaKho(
	luot: LuotKhoDanh[],
	moc: SoKho,
	soLuot: number,
	loai: string[],
	ng: Nguong["tro_ly_kho"],
): DanhGia {
	if (loai.length) return chuaDu(`lượt bị loại: ${loai.join("; ")}`);
	if (luot.length < soLuot) return chuaDu("thiếu lượt hợp lệ");
	const khong = (ly_do: string): DanhGia => ({
		trang_thai: "không đạt",
		ly_do,
		diem: null,
		giay: null,
		bien_the: null,
	});
	if (luot.some((l) => l.zdr)) return khong(`lượt hỏng: ${LOI_KHONG_ZDR}`);
	let diem = 0;
	for (const l of luot) {
		if (!l.so) return chuaDu("thiếu bảng của lượt");
		for (const [k, m] of Object.entries(moc.tang)) {
			const x = l.so.tang[k] ?? 0;
			if (x < m - ng.kem_moc_toi_da_moi_tang)
				return khong(`tầng ${k} đúng ${x}, mốc ${m}`);
		}
		if (l.so.loi > ng.cau_loi_toi_da)
			return khong(`${l.so.loi} câu lỗi, trần ${ng.cau_loi_toi_da}`);
		diem += Object.values(l.so.tang).reduce((a, b) => a + b, 0) - l.so.loi;
	}
	return {
		trang_thai: "đạt",
		ly_do: `mỗi tầng không kém mốc quá ${ng.kem_moc_toi_da_moi_tang} câu, câu lỗi ≤ ${ng.cau_loi_toi_da}`,
		diem,
		giay: null,
		bien_the: null,
	};
}

export type LuotSoanDanh = {
	dat: number;
	hong: number;
	tong: number;
	khongNop: boolean;
	p50: number | null;
};

export function danhGiaSoan(
	luot: LuotSoanDanh[],
	soLuot: number,
	loai: string[],
	ng: Nguong["soan_okr"],
): DanhGia {
	if (loai.length) return chuaDu(`lượt bị loại: ${loai.join("; ")}`);
	if (luot.length < soLuot) return chuaDu("thiếu lượt hợp lệ");
	const khong = (ly_do: string): DanhGia => ({
		trang_thai: "không đạt",
		ly_do,
		diem: null,
		giay: null,
		bien_the: null,
	});
	const khongNop = luot.find((h) => h.khongNop);
	if (khongNop)
		return khong(
			`một lượt không nộp được đề xuất nào (đạt ${khongNop.dat}/${khongNop.tong}) — lượt hỏng`,
		);
	const xau = luot.find(
		(h) => h.dat < ng.dat_toi_thieu || h.hong > ng.hong_toi_da,
	);
	if (xau)
		return khong(
			`một lượt đạt ${xau.dat}/${xau.tong}, hỏng ${xau.hong}; ngưỡng ≥ ${ng.dat_toi_thieu}/${ng.tren_tong}, hỏng ≤ ${ng.hong_toi_da}`,
		);
	return {
		trang_thai: "đạt",
		ly_do: `mọi lượt đạt ≥ ${ng.dat_toi_thieu}/${ng.tren_tong}, hỏng ≤ ${ng.hong_toi_da}`,
		diem: luot.reduce((a, h) => a + h.dat, 0),
		giay: trungVi(luot.flatMap((h) => (h.p50 === null ? [] : [h.p50]))),
		bien_the: null,
	};
}

export type TrangThaiCuoi = { trang_thai: TrangThai; ghi_chu: string[] };

export function trangThaiCuoi(dg: DanhGia, phan: number | null): TrangThaiCuoi {
	if (dg.trang_thai === "đạt" && phan === null)
		return { trang_thai: "chưa đủ số", ghi_chu: [SO.ketKien.thieuKetXuat] };
	return { trang_thai: dg.trang_thai, ghi_chu: [] };
}

export type UngChon = {
	ma: string;
	trang_thai: TrangThai;
	phan: number | null;
	diem: number | null;
	giay: number | null;
};
const SO_SANH = {
	"diem-cao-hon": (a: UngChon, b: UngChon) =>
		a.diem === b.diem
			? 0
			: a.diem === null
				? 1
				: b.diem === null
					? -1
					: b.diem - a.diem,
	"trung-vi-giay-thap-hon": (a: UngChon, b: UngChon) => cmpNull(a.giay, b.giay),
} as const;

export function chonUngVien(ds: UngChon[], ng: Nguong["chon"]): string | null {
	const vao = ds
		.map((u, i) => ({ u, i }))
		.filter(
			({ u }) =>
				u.trang_thai === "đạt" && u.phan !== null && ng.ap_cho.includes(u.ma),
		);
	vao.sort((a, b) => {
		const p = (a.u.phan ?? 0) - (b.u.phan ?? 0);
		if (Math.abs(p) > 1e-12) return p;
		for (const h of ng.hoa) {
			const r = SO_SANH[h](a.u, b.u);
			if (r) return r;
		}
		return a.i - b.i;
	});
	return vao[0]?.u.ma ?? null;
}

type DuUng = { bang: UngVienBang; chon: UngChon; dg: DanhGia };

function duUng(
	ke: KeHoach,
	ma: string,
	dg: DanhGia,
	phan: number | null,
	that: number | null,
	so: So[],
	tepPhan: string[],
	ngay: string | null,
	ghi: string[],
): DuUng {
	const cuoi = trangThaiCuoi(dg, phan);
	return {
		dg,
		chon: {
			ma,
			trang_thai: cuoi.trang_thai,
			phan,
			diem: dg.diem,
			giay: dg.giay,
		},
		bang: {
			ma,
			model: modelCua(ke, ma),
			bien_the: dg.bien_the,
			so,
			chi_phi_phan_ung_vien: phan,
			tep_chi_phi_phan: tepPhan,
			chi_phi_that: that,
			tep_chi_phi_that: evRel(MTV.tep.chiPhi),
			trang_thai: cuoi.trang_thai,
			ly_do: dg.ly_do,
			ngay_do: ngay,
			ghi_chu: [...ghi, ...cuoi.ghi_chu],
		},
	};
}

type ChiThat = Map<string, number>;
const thatCua = (chi: ChiThat, vai: VaiChi, khoa: string[]) =>
	tronN(
		tb(
			khoa.flatMap((k) => {
				const v = chi.get(`${vai}:${k}`);
				return v === undefined ? [] : [v];
			}),
		),
		6,
	);

export function ungVienTacNhan(
	ke: KeHoach,
	ng: Nguong,
	ma: string,
	hop: LuotTn[],
	loai: string[],
	chi: ChiThat,
): DuUng {
	const u = ke.tac_nhan.ung_vien.find((x) => x.ma === ma);
	const cua = hop.filter((x) => x.ma === ma);
	const tk: ThongKeBienThe[] = (u?.bien_the ?? []).map((b) => {
		const r = cua.filter((x) => x.d.bien_the === b);
		return {
			ten: b,
			qua: r.filter((x) => x.d.ket_qua === "qua" && !x.d.bi_cat).length,
			so: r.length,
			trungViGiay: trungVi(r.map((x) => x.c.giay)),
		};
	});
	const dg = danhGiaTacNhan(tk, ke.tac_nhan.so_luot, loai, ng.tac_nhan);
	const dd = cua.filter((x) => x.d.bien_the === dg.bien_the);
	const so = tk.flatMap((t) => [
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
	]);
	return duUng(
		ke,
		ma,
		dg,
		dd.length ? tronN(tb(dd.map((x) => x.phan)), 9) : null,
		thatCua(
			chi,
			"tac-nhan",
			dd.map((x) => khoaChi("tac-nhan", x.d.bien_the, x.d.luot)),
		),
		so,
		dd.map((x) => evRel(x.d.aichiphi)),
		ngayMax(cua.map((x) => x.d.ket_thuc)),
		loai,
	);
}

export function ungVienKho(
	ke: KeHoach,
	ng: Nguong,
	ma: string,
	luot: LuotKho[],
	loai: string[],
	moc: SoKho,
	chi: ChiThat,
): DuUng {
	const cua = luot.filter((l) => l.ma === ma);
	const dg = danhGiaKho(
		cua.map((l) => ({
			so: l.bang ? soKho(l.bang) : null,
			zdr: l.tom.loi === LOI_KHONG_ZDR,
		})),
		moc,
		ke.tro_ly_kho.so_luot,
		loai,
		ng.tro_ly_kho,
	);
	const gia = giaCua(ke, ma);
	const phanLuot = cua.map((l) =>
		l.hang ? chiPhiPhan(l.hang, gia, MTV.tinhNang["tro-ly-kho"]) : null,
	);
	const phan =
		cua.length && phanLuot.every((x) => x !== null)
			? tronN(tb(phanLuot.flatMap((x) => (x === null ? [] : [x]))), 9)
			: null;
	const so = cua.flatMap((l): So[] => {
		const tep = evRel(`${l.rel}/${MTV.tep.khoBaoCao}`);
		if (l.tom.loi === LOI_KHONG_ZDR || !l.bang)
			return [
				{
					ten: `lượt ${l.n} lỗi`,
					gia_tri: l.tom.loi ?? "không có bảng",
					tep: evRel(`${l.rel}/${MTV.tep.khoTom}`),
				},
			];
		const s = soKho(l.bang);
		return [
			...Object.entries(s.tang).map(([k, v]) => ({
				ten: `lượt ${l.n} ${k} đúng`,
				gia_tri: v,
				tep,
			})),
			{ ten: `lượt ${l.n} câu lỗi`, gia_tri: s.loi, tep },
		];
	});
	return duUng(
		ke,
		ma,
		dg,
		phan,
		thatCua(
			chi,
			"tro-ly-kho",
			cua.map((l) => khoaChi("tro-ly-kho", ma, l.n)),
		),
		so,
		cua.flatMap((l) => (l.tom.aichiphi ? [evRel(l.tom.aichiphi)] : [])),
		ngayMax(cua.map((l) => l.tom.luc)),
		[...loai, ...cua.flatMap((l) => (l.tom.loi ? [l.tom.loi] : []))],
	);
}

export function ungVienSoan(
	ke: KeHoach,
	ng: Nguong,
	ma: string,
	hop: LuotSoan[],
	loai: string[],
	chi: ChiThat,
): DuUng {
	const cua = hop.filter((l) => l.ma === ma);
	const dg = danhGiaSoan(
		cua.map((l) => ({
			dat: l.s.dat,
			hong: l.s.hong,
			tong: l.s.tong,
			khongNop: l.s.khongNopDeXuat ?? l.s.soDeXuat === 0,
			p50: l.s.p50,
		})),
		ke.soan_okr.so_luot,
		loai,
		ng.soan_okr,
	);
	const gia = giaCua(ke, ma);
	const phanLuot = cua.map((l) =>
		l.hang ? chiPhiPhan(l.hang, gia, MTV.tinhNang["soan-okr"]) : null,
	);
	const phan =
		cua.length && phanLuot.every((x) => x !== null)
			? tronN(tb(phanLuot.flatMap((x) => (x === null ? [] : [x]))), 9)
			: null;
	const so = cua.flatMap((l): So[] => {
		const tep = evRel(l.tep);
		return [
			{ ten: `lượt ${l.n} đạt`, gia_tri: `${l.s.dat}/${l.s.tong}`, tep },
			{ ten: `lượt ${l.n} hỏng`, gia_tri: l.s.hong, tep },
			{
				ten: `lượt ${l.n} p90 ms`,
				gia_tri: l.s.p90 === null ? "—" : Math.round(l.s.p90),
				tep,
			},
		];
	});
	return duUng(
		ke,
		ma,
		dg,
		phan,
		thatCua(
			chi,
			"soan-okr",
			cua.map((l) => khoaChi("soan-okr", ma, l.n)),
		),
		so,
		cua.flatMap((l) => (l.s.aichiphi ? [evRel(l.s.aichiphi)] : [])),
		ngayMax(cua.map((l) => l.s.luc)),
		loai,
	);
}

export type KetKienNghi = Pick<HangBang, "kien_nghi" | "ly_do">;

export function kienNghi(
	vai: "tac-nhan" | "tro-ly-kho" | "soan-okr",
	ds: DuUng[],
	ng: Nguong,
	giu: string,
): KetKienNghi {
	const ma = chonUngVien(
		ds.map((d) => d.chon),
		ng.chon,
	);
	const u = ds.find((d) => d.chon.ma === ma);
	if (!u)
		return {
			kien_nghi: `giữ ${giu}`,
			ly_do: `không ứng viên nào đạt và đủ số — ${ds.map((d) => `${d.chon.ma} ${d.bang.trang_thai}: ${d.bang.ly_do}`).join("; ")}`,
		};
	const dat = ds.filter((d) => d.bang.trang_thai === "đạt").length;
	return {
		kien_nghi:
			vai === "tac-nhan"
				? `${u.bang.model} (${u.bang.bien_the})`
				: u.bang.model,
		ly_do: `${u.chon.ma} có chi phí phần ứng viên thấp nhất (${u.chon.phan} USD mỗi lượt) trong ${dat} ứng viên đạt; ${u.dg.ly_do}`,
	};
}

type MocKho = { so: SoKho; bang: BangKho };

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

function chiThatCua(chi: ChiPhi | null): ChiThat {
	return new Map(
		(chi?.luot ?? []).flatMap((l) =>
			l.trang_thai === "da-chay" && l.usd !== null
				? [[`${l.vai}:${l.luot}`, l.usd] as const]
				: [],
		),
	);
}

export function dungBang(
	ke: KeHoach,
	ng: Nguong,
	tn: KetTacNhan,
	kho: KetKho,
	soan: KetSoan,
	chi: ChiPhi | null,
): Bang {
	const that = chiThatCua(chi);
	const uTn = ke.tac_nhan.ung_vien.map((u) =>
		ungVienTacNhan(ke, ng, u.ma, tn.hop, tn.loai.cua(u.ma), that),
	);
	const kTn = kienNghi("tac-nhan", uTn, ng, ng.tac_nhan.giu);
	const mtn = mocTacNhan();
	const hTn: HangBang = {
		vai: "tac-nhan",
		ten: "Tác nhân",
		model_dang_chay: ng.tac_nhan.giu,
		so_moc: [
			{
				ten: `mốc ${ng.tac_nhan.giu}: lượt qua`,
				gia_tri: `${mtn.qua}/${mtn.so}`,
				tep: MTV.moc.tacNhanDong,
			},
		],
		ngay_moc: MTV.ngayMoc.tacNhan,
		so_do: [],
		ung_vien: uTn.map((u) => u.bang),
		...kTn,
		thong_so_chua_do: loc(ke, ["trần bước", "trần thời gian", "Tác nhân"]),
		ghi_chu: [
			"mỗi ứng viên đại diện bằng biến thể qua nhiều lượt nhất, bằng nhau thì trung vị giây phiên con thấp hơn; chi phí của ứng viên là của biến thể đại diện",
		],
	};
	const mk = mocKho();
	const uKho = ke.tro_ly_kho.ung_vien.map((ma) =>
		ungVienKho(ke, ng, ma, kho.luot, kho.loai.cua(ma), mk.so, that),
	);
	const kKho = kienNghi("tro-ly-kho", uKho, ng, ng.tro_ly_kho.giu);
	const hKho: HangBang = {
		vai: "tro-ly-kho",
		ten: "Trợ lý kho",
		model_dang_chay: ng.tro_ly_kho.giu,
		so_moc: [
			...Object.entries(mk.so.tang).map(([k, v]) => ({
				ten: `mốc ${k} đúng`,
				gia_tri: v,
				tep: MTV.moc.kho,
			})),
			{ ten: "mốc câu lỗi", gia_tri: mk.so.loi, tep: MTV.moc.kho },
		],
		ngay_moc: MTV.ngayMoc.kho,
		so_do: [],
		ung_vien: uKho.map((u) => u.bang),
		...kKho,
		thong_so_chua_do: loc(ke, ["Trợ lý kho"]),
		ghi_chu: [
			"vòng hai qua Zalo: agent gốc chạy model mặc định zai/glm-5.2-fast, chỉ trợ lý kho đổi model",
			"chi phí thật của lượt kho: tổng costUsd của kết xuất aiChiPhi khi mọi bước có costUsd; chênh số dư Gateway chỉ để đối chiếu; lượt glm 20/10 chỉ có chênh số dư",
		],
	};
	const moc = khuonSoan.parse(
		JSON.parse(readFileSync(join(GOC, ke.soan_okr.moc), "utf8")),
	);
	const uSoan = ke.soan_okr.ung_vien.map((ma) =>
		ungVienSoan(ke, ng, ma, soan.hop, soan.loai.cua(ma), that),
	);
	const kSoan = kienNghi("soan-okr", uSoan, ng, ng.soan_okr.giu);
	const hSoan: HangBang = {
		vai: "soan-okr",
		ten: "Soạn OKR",
		model_dang_chay: moc.moHinh,
		so_moc: [
			{ ten: "mốc đạt", gia_tri: `${moc.dat}/${moc.tong}`, tep: MTV.moc.soan },
			{ ten: "mốc hỏng", gia_tri: moc.hong, tep: MTV.moc.soan },
			{
				ten: "mốc p90 ms",
				gia_tri: moc.p90 === null ? "—" : Math.round(moc.p90),
				tep: MTV.moc.soan,
			},
		],
		ngay_moc: MTV.ngayMoc.soan,
		so_do: [],
		ung_vien: uSoan.map((u) => u.bang),
		...kSoan,
		thong_so_chua_do: loc(ke, ["Soạn OKR"]),
		ghi_chu: ["USD của eval soạn chưa gồm judge"],
	};
	const hJudge: HangBang = {
		vai: "judge-okr",
		ten: "Judge OKR",
		model_dang_chay: moc.judge,
		so_moc: [
			{ ten: "mốc judge hỏng", gia_tri: moc.judgeHong, tep: MTV.moc.soan },
			{
				ten: "mốc judge dưới ngưỡng",
				gia_tri: moc.judgeDuoiNguong,
				tep: MTV.moc.soan,
			},
		],
		ngay_moc: MTV.ngayMoc.soan,
		so_do: soan.hop.flatMap((l) => {
			const nhan = DUONG.nhanSoan(l.ma, l.n);
			return [
				{
					ten: `${nhan} judge hỏng`,
					gia_tri: l.s.judgeHong,
					tep: evRel(l.tep),
				},
				{
					ten: `${nhan} judge dưới ngưỡng`,
					gia_tri: l.s.judgeDuoiNguong,
					tep: evRel(l.tep),
				},
			];
		}),
		ung_vien: [],
		kien_nghi: `giữ ${ng.judge_okr.giu}`,
		ly_do:
			"Hỏi-3: không đổi judge ở vòng này, mọi số soạn OKR chấm bằng judge hiện tại",
		thong_so_chua_do: [
			`${modelCua(ke, MTV.cu.ma)} làm judge`,
			...loc(ke, ["Judge OKR"]),
		],
		ghi_chu: [],
	};
	const hMay: HangBang = {
		vai: "may-soan-kho",
		ten: "Máy soạn kho",
		model_dang_chay: ng.may_soan_kho.giu,
		so_moc: [],
		ngay_moc: null,
		so_do: [],
		ung_vien: [],
		kien_nghi: `giữ ${ng.may_soan_kho.giu}`,
		ly_do: `Hỏi-4: ${ng.may_soan_kho.ghi_chu}`,
		thong_so_chua_do: [
			"mọi thông số — chưa có thước",
			...loc(ke, ["Máy soạn kho"]),
		],
		ghi_chu: [ng.may_soan_kho.ghi_chu],
	};
	return {
		nguong: `_acceptance/${MTV.slug}/rang/nguong.json`,
		ke_hoach: evRel(MTV.tep.keHoach),
		hang: [hTn, hKho, hSoan, hJudge, hMay],
	};
}

const o = (v: string | number | null) =>
	v === null ? "—" : String(v).replace(/\|/g, "/");

function inHang(h: HangBang): string[] {
	const so = [
		...h.ung_vien.flatMap((u) =>
			u.so.map((s) => ({ ...s, ten: `${u.ma} · ${s.ten}` })),
		),
		...h.so_do,
		...h.so_moc,
	];
	return [
		`## ${h.ten}`,
		"",
		`Kiến nghị: ${h.kien_nghi}. ${h.ly_do}.`,
		"",
		...(h.ung_vien.length
			? [
					"| Ứng viên | Model | Trạng thái | Chi phí phần ứng viên mỗi lượt (USD) | Chi phí thật mỗi lượt (USD) | Ngày đo | Vì sao |",
					"| --- | --- | --- | --- | --- | --- | --- |",
					...h.ung_vien.map(
						(u) =>
							`| ${u.ma}${u.bien_the ? ` (${u.bien_the})` : ""} | \`${u.model}\` | ${u.trang_thai} | ${o(u.chi_phi_phan_ung_vien)} | ${o(u.chi_phi_that)} | ${o(u.ngay_do)} | ${o(u.ly_do)} |`,
					),
					"",
				]
			: []),
		...(so.length
			? [
					"| Số | Giá trị | Tệp |",
					"| --- | --- | --- |",
					...so.map((s) => `| ${o(s.ten)} | ${o(s.gia_tri)} | \`${s.tep}\` |`),
					"",
				]
			: []),
		...h.ung_vien.flatMap((u) =>
			u.tep_chi_phi_phan.length
				? [
						`Kết xuất aiChiPhi của ${u.ma}: ${u.tep_chi_phi_phan.map((t) => `\`${t}\``).join(", ")}.`,
						"",
					]
				: [],
		),
		`Thông số chưa dò: ${h.thong_so_chua_do.join("; ") || "không"}.`,
		"",
		...h.ghi_chu.map((g) => `- ${g}`),
		...h.ung_vien.flatMap((u) => u.ghi_chu.map((g) => `- ${u.ma}: ${g}`)),
		...(h.ghi_chu.length || h.ung_vien.some((u) => u.ghi_chu.length)
			? [""]
			: []),
	];
}

export function inDocs(b: Bang): string {
	return [
		"# Model theo vai",
		"",
		`Bảng kiến nghị model cho từng vai AI của CRM, dựng bởi \`_acceptance/${MTV.slug}/rang/so-do.ts --ghi\` từ các lượt đo của hàng MH4. Không sửa tay: sửa bằng chứng rồi dựng lại. Ngưỡng và luật chọn: \`${b.nguong}\`. Ứng viên, giá, cỡ mẫu, trần: \`${b.ke_hoach}\`. Model chạy thật chưa đổi — đổi mặc định là hàng MH2.`,
		"",
		"Mỗi ứng viên đạt hay không theo ngưỡng của vai; ứng viên có lượt bị loại (sai model, lời dặn lệch mốc, dừng vì trần) hay thiếu kết xuất aiChiPhi là «chưa đủ số» và không vào luật chọn. Trong các ứng viên đạt, kiến nghị ứng viên có chi phí phần ứng viên mỗi lượt thấp nhất, bằng nhau thì điểm cao hơn rồi trung vị giây thấp hơn. Chi phí phần ứng viên = token vào không qua cache × giá vào + token đọc cache × giá đọc cache + token ra × giá ra trên các bước của vai trong kết xuất aiChiPhi của lượt, giá niêm yết ghim trong kế hoạch; kết xuất vòng đầu của glm không có cột đọc cache nên tính như không đọc cache.",
		"",
		"| Vai | Đang chạy | Ứng viên | Kiến nghị | Vì sao |",
		"| --- | --- | --- | --- | --- |",
		...b.hang.map(
			(h) =>
				`| ${h.ten} | \`${h.model_dang_chay}\` | ${h.ung_vien.map((u) => `${u.ma} ${u.trang_thai}`).join(", ") || "—"} | ${o(h.kien_nghi)} | ${o(h.ly_do)} |`,
		),
		"",
		...b.hang.flatMap(inHang),
	].join("\n");
}

function tepCuaHang(h: HangBang): string[] {
	return [
		...h.so_moc.map((s) => s.tep),
		...h.so_do.map((s) => s.tep),
		...h.ung_vien.flatMap((u) => [
			...u.so.map((s) => s.tep),
			...u.tep_chi_phi_phan,
			u.tep_chi_phi_that,
		]),
	];
}

export function kiemBang(
	ev: string,
	ky: Bang,
	docsTho: string | null,
): string[] {
	const hong: string[] = [];
	if (!existsSync(join(ev, MTV.tep.bang)))
		return [`${N.tepVang} ${MTV.tep.bang}`];
	const p = khuonBang.safeParse(docJson(ev, MTV.tep.bang));
	if (!p.success) return [`${N.lechSo} ${MTV.tep.bang}: sai khuon`];
	const co = p.data;
	for (const v of VAI)
		if (!co.hang.some((h) => h.vai === v)) hong.push(`${N.thieuVai} ${v}`);
	for (const h of co.hang) {
		const k = ky.hang.find((x) => x.vai === h.vai);
		if (!k) continue;
		const { kien_nghi: a, ung_vien: ua, ...ra } = h;
		const { kien_nghi: b, ung_vien: ub, ...rb } = k;
		if (JSON.stringify(ra) !== JSON.stringify(rb))
			hong.push(`${N.lechSo} ${h.vai}`);
		for (const u of ub) {
			const x = ua.find((y) => y.ma === u.ma);
			if (!x) hong.push(`${N.thieuUng} ${h.vai} ${u.ma}`);
			else if (JSON.stringify(x) !== JSON.stringify(u))
				hong.push(`${N.lechSo} ${h.vai} ${u.ma}`);
		}
		for (const x of ua)
			if (!ub.some((y) => y.ma === x.ma))
				hong.push(`${N.thuaUng} ${h.vai} ${x.ma}`);
		if (a !== b) hong.push(`${N.traiLuat} ${h.vai}`);
		if (h.kien_nghi.startsWith("giữ") && !h.thong_so_chua_do.length)
			hong.push(`${N.thongSo} ${h.vai}`);
		for (const t of tepCuaHang(h))
			if (
				!existsSync(join(GOC, t)) &&
				!(
					t.startsWith(`${DIR_EV}/`) &&
					existsSync(join(ev, t.slice(DIR_EV.length + 1)))
				)
			)
				hong.push(`${N.tepVang} ${t}`);
	}
	if (docsTho === null || docsTho !== inDocs(co)) hong.push(N.docs);
	return hong;
}

function giaiKhoa(
	ke: KeHoach,
	vai: VaiChi,
	luot: string,
): { ma: string; nhan: string } | null {
	if (vai === "tac-nhan") {
		const b = luot.replace(/-\d+$/, "");
		const ma = ungVienCuaBienThe(ke, b);
		return ma ? { ma, nhan: b } : null;
	}
	if (/^\d+$/.test(luot)) return { ma: MTV.cu.ma, nhan: MTV.cu.ma };
	const m = luot.match(/^([a-z0-9]+)-\d+$/);
	return m?.[1] && ke.ung_vien[m[1]] ? { ma: m[1], nhan: m[1] } : null;
}

export function kiemChiPhi(
	ev: string,
	ke: KeHoach,
	tinh: Map<string, number>,
	bangCo: Bang | null,
): string[] {
	const hong: string[] = [];
	const c = docChiPhiEv(ev);
	if (!c) return [`${N.tepVang} ${MTV.tep.chiPhi}`];
	const thay = new Set<string>();
	for (const l of c.luot) {
		const khoa = `${l.vai}:${l.luot}`;
		if (thay.has(khoa)) hong.push(`${N.trungKhoa} ${l.vai} ${l.luot}`);
		thay.add(khoa);
	}
	for (const k of tinh.keys())
		if (!thay.has(k)) hong.push(`${N.thieuDongChi} ${k.replace(":", " ")}`);
	let cong = 0;
	let thuTu = -1;
	for (const l of [...c.luot].sort((a, b) => a.luc.localeCompare(b.luc))) {
		const g = giaiKhoa(ke, l.vai, l.luot);
		if (!g) hong.push(`${N.khoaLa} ${l.vai} ${l.luot}`);
		if (g && !laCu(g.ma)) {
			const i = ke.thu_tu.indexOf(`${l.vai}:${g.ma}`);
			if (i < thuTu) hong.push(`${N.thuTu} ${l.vai}:${g.ma}`);
			thuTu = Math.max(thuTu, i);
		}
		if (l.trang_thai === "da-chay") {
			if (cong >= ke.tran_usd) hong.push(`${N.vuotTran}: ${l.vai} ${l.luot}`);
			const t = tinh.get(`${l.vai}:${l.luot}`);
			if (t !== undefined && l.usd !== null && Math.abs(t - l.usd) > SO.sai)
				hong.push(`${N.lechUsd} ${l.vai} ${l.luot}`);
			cong += l.usd ?? 0;
			continue;
		}
		if (l.tep !== null)
			hong.push(`${N.lechUsd} ${l.vai} ${l.luot}: dung vi tran ma co tep`);
		const h = bangCo?.hang.find((x) => x.vai === l.vai);
		const u = h?.ung_vien.find((x) => x.ma === g?.ma);
		if (
			h &&
			g &&
			((u && u.trang_thai !== SO.ketKien.chuaDu) ||
				h.kien_nghi.startsWith(modelCua(ke, g.ma)))
		)
			hong.push(`${N.tranKienNghi} ${l.vai}`);
	}
	if (cong > ke.tran_usd + 1e-9)
		hong.push(`${N.tongTran}: ${tron(cong)} > ${ke.tran_usd}`);
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
	const sl = kiemSuyLuan(ev, ke);
	const kho = kiemKho(ev, ke);
	const soan = kiemSoan(ev, ke);
	const chi = docChiPhiEv(ev);
	const bang = dungBang(ke, ng, tn, kho, soan, chi);
	const p = existsSync(join(ev, MTV.tep.bang))
		? khuonBang.safeParse(docJson(ev, MTV.tep.bang))
		: null;
	const tinh = new Map<string, number>();
	for (const [k, v] of tn.usd) tinh.set(`tac-nhan:${k}`, v);
	for (const [k, v] of sl.usd) tinh.set(`dao:${k}`, v);
	for (const [k, v] of kho.usd) tinh.set(`tro-ly-kho:${k}`, v);
	for (const [k, v] of soan.usd) tinh.set(`soan-okr:${k}`, v);
	const hong = [
		...tn.hong,
		...sl.hong,
		...kho.hong,
		...soan.hong,
		...kiemBang(ev, bang, docsTho),
		...kiemChiPhi(ev, ke, tinh, p?.success ? p.data : null),
		...kiemGlm(ev),
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

const MOI = {
	ev: MTV.evidence,
	docs: MTV.tep.docs,
};
const tam: string[] = [];
let daBu: string[] = [];
const maGoc = () => readFileSync(SO.tepDoTacNhan, "utf8");
const docsGoc = () =>
	existsSync(MOI.docs) ? readFileSync(MOI.docs, "utf8") : null;

function ghiLai(ev: string, k: KetTong) {
	writeFileSync(join(ev, MTV.tep.bang), `${JSON.stringify(k.bang, null, 2)}\n`);
	writeFileSync(join(ev, MTV.tep.bangTacNhan), k.bangTacNhan);
	return inDocs(k.bang);
}
function capLai(ev: string): string {
	return ghiLai(ev, kiem(ev, maGoc(), null));
}
type BanSao = { ev: string; docs: string };
function banSao(): BanSao {
	const t = mkdtempSync(join(tmpdir(), "mtv-so-"));
	tam.push(t);
	const ev = join(t, "evidence");
	cpSync(MOI.ev, ev, { recursive: true });
	daBu = giaLap(ev);
	return { ev, docs: capLai(ev) };
}
const tuDocs = (b: BanSao) => kiem(b.ev, maGoc(), b.docs);

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
	const tho = docDongTho(ev);
	const truoc = new Map(
		tho.map((d) => [JSON.stringify(khuonDongTacNhan.parse(JSON.parse(d))), d]),
	);
	const ds = doi(tho.map((d) => khuonDongTacNhan.parse(JSON.parse(d))));
	writeFileSync(
		join(ev, MTV.tep.tacNhan),
		`${ds.map((d) => truoc.get(JSON.stringify(d)) ?? JSON.stringify(d)).join("\n")}\n`,
	);
}
const laDs = (d: DongTacNhan) =>
	ungVienCuaBienThe(
		khuonKeHoach.parse(
			JSON.parse(readFileSync(join(MOI.ev, MTV.tep.keHoach), "utf8")),
		),
		d.bien_the,
	) === SO.chieu.ds;
const dongDs = (ev: string, low: boolean) => {
	const d = docDongTho(ev)
		.map((x) => khuonDongTacNhan.parse(JSON.parse(x)))
		.find((x) => laDs(x) && laLow(x.bien_the) === low);
	if (!d) throw new Error("ban sao khong co dong ds");
	return d;
};
const hangCua = (k: KetTong, vai: string) =>
	k.bang.hang.find((h) => h.vai === vai);
const ungCua = (k: KetTong, vai: string, ma: string) =>
	hangCua(k, vai)?.ung_vien.find((u) => u.ma === ma);

type KetChieu = { hong: string[]; dong: string[] };
type ChieuDo = {
	eval: string;
	ten: string;
	chay: () => KetChieu;
	phaiCo: string[];
	mong: "do" | "xanh";
};
const them = (k: KetChieu, loi: string[]): KetChieu => ({
	hong: [...k.hong, ...loi],
	dong: k.dong,
});
const neu = (dk: boolean, loi: string) => (dk ? [] : [loi]);

function luatBien(): KetChieu {
	const ng = khuonNguong.parse(
		JSON.parse(readFileSync(MTV.tep.nguong, "utf8")),
	);
	const ke = khuonKeHoach.parse(
		JSON.parse(readFileSync(join(MOI.ev, MTV.tep.keHoach), "utf8")),
	);
	const hong: string[] = [];
	let so = 0;
	const ca = (ten: string, a: string | null, b: string | null) => {
		so++;
		if (a !== b) hong.push(`${N.traiLuat} ${ten}: ${a} ≠ ${b}`);
	};
	const t = (qua: number, gia: number | null, ten = "ds", soLuot = 5) => ({
		ten,
		qua,
		so: soLuot,
		trungViGiay: gia,
	});
	const tn = (tk: ThongKeBienThe[], loai: string[] = []) =>
		danhGiaTacNhan(tk, 5, loai, ng.tac_nhan);
	ca("tac-nhan 4/5", tn([t(4, 50)]).trang_thai, "đạt");
	ca("tac-nhan 3/5", tn([t(3, 50)]).trang_thai, "không đạt");
	ca(
		"tac-nhan hai bien the 4/5",
		tn([t(4, 80), t(4, 40, "ds-low")]).bien_the,
		"ds-low",
	);
	ca(
		"tac-nhan 4 qua 1 sai model",
		tn([t(4, 50, "ds", 4), t(5, 50, "ds-low")], ["sai model tac-nhan ds-5"])
			.trang_thai,
		"chưa đủ số",
	);
	const moc: SoKho = { tang: { "mot.S1": 14, "hai.S1": 15 }, loi: 2 };
	const kh = (tang: Record<string, number>, loi: number, zdr = false) =>
		danhGiaKho([{ so: { tang, loi }, zdr }], moc, 1, [], ng.tro_ly_kho)
			.trang_thai;
	ca("kho 2 loi", kh({ "mot.S1": 14, "hai.S1": 15 }, 2), "đạt");
	ca("kho 3 loi", kh({ "mot.S1": 14, "hai.S1": 15 }, 3), "không đạt");
	ca("kho kem moc 2", kh({ "mot.S1": 12, "hai.S1": 15 }, 0), "không đạt");
	ca(
		"kho khong co zdr",
		kh({ "mot.S1": 14, "hai.S1": 15 }, 0, true),
		"không đạt",
	);
	const s = (dat: number, hong: number, khongNop = false) => ({
		dat,
		hong,
		tong: 18,
		khongNop,
		p50: 10_000,
	});
	const so2 = (l: LuotSoanDanh[], loai: string[] = []) =>
		danhGiaSoan(l, 2, loai, ng.soan_okr).trang_thai;
	ca("soan moi luot 13 hong 3", so2([s(13, 3), s(13, 3)]), "đạt");
	ca("soan mot luot 12", so2([s(12, 3), s(14, 2)]), "không đạt");
	ca("soan mot luot hong 4", so2([s(13, 4), s(14, 2)]), "không đạt");
	ca("soan 18/18 khong nop", so2([s(18, 0, true), s(14, 0)]), "không đạt");
	ca(
		"soan loi dan lech",
		so2([s(14, 0), s(14, 0)], [SO.ketKien.loiDanLech]),
		"chưa đủ số",
	);
	const u = (
		ma: string,
		trang_thai: TrangThai,
		phan: number | null,
		diem: number | null = 10,
		giay: number | null = 30,
	): UngChon => ({ ma, trang_thai, phan, diem, giay });
	ca(
		"chon khong ai dat",
		chonUngVien(
			[u("glm", "không đạt", 1), u("ds", "chưa đủ số", 0.1)],
			ng.chon,
		),
		null,
	);
	ca(
		"chon mot dat",
		chonUngVien([u("glm", "không đạt", 0.1), u("ds", "đạt", 1)], ng.chon),
		"ds",
	);
	ca(
		"chon hai dat chi phi khac",
		chonUngVien([u("glm", "đạt", 0.2), u("ds", "đạt", 0.1)], ng.chon),
		"ds",
	);
	ca(
		"chon hai dat cung chi phi, diem",
		chonUngVien([u("glm", "đạt", 0.1, 12), u("ds", "đạt", 0.1, 11)], ng.chon),
		"glm",
	);
	ca(
		"chon hai dat cung chi phi cung diem, giay",
		chonUngVien(
			[u("glm", "đạt", 0.1, 12, 40), u("ds", "đạt", 0.1, 12, 20)],
			ng.chon,
		),
		"ds",
	);
	ca(
		"chon chua du so khong vao luat",
		chonUngVien([u("glm", "đạt", 0.5), u("ds", "chưa đủ số", 0.01)], ng.chon),
		"glm",
	);
	ca(
		"dat ma thieu ket xuat thanh chua du so",
		trangThaiCuoi(tn([t(5, 20)]), null).trang_thai,
		"chưa đủ số",
	);
	const moc2 = khuonSoan.parse(
		JSON.parse(readFileSync(join(GOC, ke.soan_okr.moc), "utf8")),
	);
	const luotSoan = (
		ma: string,
		n: number,
		ra: number,
		usd: number,
	): LuotSoan => ({
		ma,
		n,
		s: khuonSoanMh4.parse({
			...moc2,
			dat: 14,
			hong: 2,
			soDeXuat: 10,
			khongNopDeXuat: false,
			usd,
			moHinh: modelCua(ke, ma),
			modelGateway: modelCua(ke, ma),
			bamSuaTam: "0".repeat(64),
			bamCommit: "0".repeat(40),
		}),
		hang: [
			{
				id: `${ma}-${n}`,
				at: moc2.luc,
				sessionId: "x",
				phienCha: null,
				tinhNang: MTV.tinhNang["soan-okr"],
				modelId: null,
				inputTokens: 10_000,
				outputTokens: ra,
				costUsd: null,
			},
		],
		tep: DUONG.soan(ma, n),
	});
	const knSoan = (dsRa: number, dsUsd: number) => {
		const hop = [1, 2].flatMap((n) => [
			luotSoan("glm", n, 1_000, 0.1),
			luotSoan("ds", n, dsRa, dsUsd),
		]);
		return kienNghi(
			"soan-okr",
			["glm", "ds"].map((ma) => ungVienSoan(ke, ng, ma, hop, [], new Map())),
			ng,
			ng.soan_okr.giu,
		).kien_nghi;
	};
	const dsModel = modelCua(ke, SO.chieu.ds);
	ca("soan goc: ds re hon", knSoan(1_000, 0.1), dsModel);
	ca("soan nhan doi usd judge cua ds", knSoan(1_000, 0.2), dsModel);
	ca(
		"soan doi chung: token ra ds vuot glm",
		knSoan(10_000, 0.1),
		modelCua(ke, "glm"),
	);
	return {
		hong,
		dong: hong.length ? [] : [`ma tran bien: ${so} o dung kien nghi`],
	};
}

const ke5 = (ev: string) =>
	khuonKeHoach.parse(docJson(ev, MTV.tep.keHoach)).tac_nhan.so_luot;

const CHIEU_DO: readonly ChieuDo[] = [
	{
		eval: "E1-E6",
		ten: "ban sao nguyen (doi chung duong)",
		mong: "xanh",
		phaiCo: [],
		chay: () => tuDocs(banSao()),
	},
	{
		eval: "E1",
		ten: "xoa mot dong ds",
		mong: "do",
		phaiCo: ["thieu cap ds-1"],
		chay: () => {
			const b = banSao();
			const d = dongDs(b.ev, false);
			suaDong(b.ev, (ds) =>
				ds.filter((x) => !(x.bien_the === d.bien_the && x.luot === d.luot)),
			);
			return kiem(b.ev, maGoc(), capLai(b.ev));
		},
	},
	{
		eval: "E1",
		ten: "sua so buoc phien con cua dong ds",
		mong: "do",
		phaiCo: ["lech aichiphi ds-1"],
		chay: () => {
			const b = banSao();
			suaDong(b.ev, (ds) =>
				ds.map((x) =>
					laDs(x) && x.luot === 1 && !laLow(x.bien_the) && x.phien_con
						? {
								...x,
								phien_con: { ...x.phien_con, so_buoc: x.phien_con.so_buoc + 1 },
							}
						: x,
				),
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E1",
		ten: "bot mot hang aichiphi phien con ds",
		mong: "do",
		phaiCo: ["lech aichiphi"],
		chay: () => {
			const b = banSao();
			const d = dongDs(b.ev, false);
			const hang = khuonKetXuat.parse(docJson(b.ev, d.aichiphi));
			const i = hang.findIndex((h) => h.phienCha === d.phien_goc);
			writeFileSync(
				join(b.ev, d.aichiphi),
				`${JSON.stringify(
					hang.filter((_, j) => j !== i),
					null,
					2,
				)}\n`,
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E1",
		ten: "hai luot ds chong gio",
		mong: "do",
		phaiCo: ["chong gio"],
		chay: () => {
			const b = banSao();
			suaDong(b.ev, (ds) => {
				const cua = ds.filter(laDs);
				const a = cua[0];
				const c = cua[1];
				return ds.map((x) =>
					a && c && x === c
						? {
								...x,
								bat_dau: new Date(Date.parse(a.ket_thuc) - 1000).toISOString(),
							}
						: x,
				);
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E1",
		ten: "luot ds mang bam ban sua tam",
		mong: "do",
		phaiCo: ["ro suy luan ds"],
		chay: () => {
			const b = banSao();
			const kt = khuonKeHoachTacNhan.parse(
				docJson(b.ev, MTV.tep.keHoachTacNhan),
			);
			const d = dongDs(b.ev, false);
			suaDong(b.ev, (ds) =>
				ds.map((x) =>
					x.bien_the === d.bien_the && x.luot === d.luot
						? { ...x, bam_agent: kt.bam_agent_low }
						: x,
				),
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E1",
		ten: "bo chan doc lai trong ban sao ma",
		mong: "do",
		phaiCo: ["thieu doc lai model"],
		chay: () => {
			const b = banSao();
			return kiem(b.ev, maGoc().replace(SO.chanDocLai, "if (false)"), b.docs);
		},
	},
	{
		eval: "E1",
		ten: "model phien con ds lui ve glm-5.2-fast",
		mong: "xanh",
		phaiCo: ["sai model tac-nhan ds-1"],
		chay: () => {
			const b = banSao();
			const d = dongDs(b.ev, false);
			writeFileSync(
				join(b.ev, d.su_kien),
				`${JSON.stringify([{ sessionId: "x", modelId: "zai/glm-5.2-fast" }], null, 2)}\n`,
			);
			suaDong(b.ev, (ds) =>
				ds.map((x) =>
					x.bien_the === d.bien_the && x.luot === d.luot
						? { ...x, model_phien_con: "zai/glm-5.2-fast" }
						: x,
				),
			);
			const k = kiem(b.ev, maGoc(), capLai(b.ev));
			const u = ungCua(k, "tac-nhan", SO.chieu.ds);
			const qua = u?.so.find((s) => s.ten.startsWith(`${d.bien_the}:`));
			return them(k, [
				...neu(
					u?.trang_thai === SO.ketKien.chuaDu,
					`ds khong chua du so: ${u?.trang_thai}`,
				),
				...neu(
					Boolean(u?.ghi_chu.some((g) => g.startsWith(`${N.saiModelTn} ds-1`))),
					"bang khong ghi luot sai model",
				),
				...neu(
					String(qua?.gia_tri).endsWith(`/${ke5(b.ev) - 1}`),
					`bang van dem luot sai model: ${qua?.gia_tri}`,
				),
			]);
		},
	},
	{
		eval: "E1",
		ten: "sua mot byte dong flash",
		mong: "do",
		phaiCo: ["bang chung glm doi tac-nhan.jsonl flash-1"],
		chay: () => {
			const b = banSao();
			const tho = docDongTho(b.ev);
			writeFileSync(
				join(b.ev, MTV.tep.tacNhan),
				`${tho.map((d, i) => (i === 0 ? d.replace('"luot":1,', '"luot":1 ,') : d)).join("\n")}\n`,
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E2",
		ten: "xoa muc low cua ds",
		mong: "do",
		phaiCo: ["do suy luan thieu low ds"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, DUONG.doSuyLuan(SO.chieu.ds), khuonDoSuyLuan, (x) => {
				x.muc = { "mac-dinh": x.muc["mac-dinh"], high: x.muc.high };
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E2",
		ten: "doi model mot muc ds",
		mong: "do",
		phaiCo: ["sai model do suy luan ds"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, DUONG.doSuyLuan(SO.chieu.ds), khuonDoSuyLuan, (x) => {
				if (x.muc.high) x.muc.high.model = "zai/glm-5.2-fast";
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E2",
		ten: "xoa tep do cua ds",
		mong: "do",
		phaiCo: ["thieu do suy luan ds"],
		chay: () => {
			const b = banSao();
			rmSync(join(b.ev, DUONG.doSuyLuan(SO.chieu.ds)));
			return tuDocs(b);
		},
	},
	{
		eval: "E3",
		ten: "xoa ma m05 khoi vong hai cua ds",
		mong: "do",
		phaiCo: ["thieu ma m05 vong hai ds"],
		chay: () => {
			const b = banSao();
			const t = join(b.ev, DUONG.kho(SO.chieu.ds, 1), MTV.tep.khoTungCau);
			writeFileSync(
				t,
				`${readFileSync(t, "utf8")
					.split("\n")
					.filter(
						(d) => d && !(d.includes('"luot":2') && d.includes('"id":"m05"')),
					)
					.join("\n")}\n`,
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E3",
		ten: "model kho cua gem la glm-5.2-fast",
		mong: "do",
		phaiCo: ["sai model kho gem"],
		chay: () => {
			const b = banSao();
			suaJson(
				b.ev,
				`${DUONG.kho(SO.chieu.gem, 1)}/${MTV.tep.khoTom}`,
				khuonKhoTom,
				(x) => {
					x.model_kho = "zai/glm-5.2-fast";
				},
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E3",
		ten: "doi bam bo-mau cua ds",
		mong: "do",
		phaiCo: ["bo-mau lech ds"],
		chay: () => {
			const b = banSao();
			suaJson(
				b.ev,
				`${DUONG.kho(SO.chieu.ds, 1)}/${MTV.tep.khoTom}`,
				khuonKhoTom,
				(x) => {
					x.bam_bo_mau = "0".repeat(64);
				},
			);
			return tuDocs(b);
		},
	},
	{
		eval: "E3",
		ten: "luot kho ds khong co ZDR thi ds khong dat",
		mong: "xanh",
		phaiCo: [`kho ds luot 1: ${LOI_KHONG_ZDR}`],
		chay: () => {
			const b = banSao();
			suaJson(
				b.ev,
				`${DUONG.kho(SO.chieu.ds, 1)}/${MTV.tep.khoTom}`,
				khuonKhoTom,
				(x) => {
					x.loi = LOI_KHONG_ZDR;
				},
			);
			const k = kiem(b.ev, maGoc(), capLai(b.ev));
			const u = ungCua(k, "tro-ly-kho", SO.chieu.ds);
			return them(
				k,
				neu(u?.trang_thai === "không đạt", `ds kho ${u?.trang_thai}`),
			);
		},
	},
	{
		eval: "E3",
		ten: "sua mot byte tep duoi kho/luot-1",
		mong: "do",
		phaiCo: ["bang chung glm doi kho/luot-1/cham-bo-do-mau.md"],
		chay: () => {
			const b = banSao();
			const t = join(b.ev, DUONG.kho(MTV.cu.ma, 1), MTV.tep.khoTraLoi);
			writeFileSync(t, `${readFileSync(t, "utf8")}x`);
			return tuDocs(b);
		},
	},
	{
		eval: "E4",
		ten: "loi dan ds-1 lech moc",
		mong: "do",
		phaiCo: ["loi dan lech moc ds-1"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, DUONG.soan(SO.chieu.ds, 1), khuonSoanMh4, (x) => {
				x.bam.loiDan = "0".repeat(64);
			});
			const k = tuDocs(b);
			const u = ungCua(k, "soan-okr", SO.chieu.ds);
			return them(k, [
				...neu(u?.trang_thai === SO.ketKien.chuaDu, `ds soan ${u?.trang_thai}`),
				...neu(
					Boolean(u?.ghi_chu.includes(SO.ketKien.loiDanLech)),
					"bang in lai khong ghi loi dan lech moc",
				),
			]);
		},
	},
	{
		eval: "E4",
		ten: "doi moHinh luot ds-2",
		mong: "do",
		phaiCo: ["sai model soan ds-2"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, DUONG.soan(SO.chieu.ds, 2), khuonSoanMh4, (x) => {
				x.moHinh = "google/gemini-3.8-flash";
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E4",
		ten: "xoa tep luot soan ds-2",
		mong: "do",
		phaiCo: ["thieu luot soan ds-2"],
		chay: () => {
			const b = banSao();
			rmSync(join(b.ev, DUONG.soan(SO.chieu.ds, 2)));
			return tuDocs(b);
		},
	},
	{
		eval: "E4",
		ten: "ds-1 khong nop de xuat dat 18 hong 0 (doi chung: nop thi ds dat)",
		mong: "xanh",
		phaiCo: ["luot soan hong ds-1: khong nop de xuat"],
		chay: () => {
			const dung = (khongNop: boolean) => {
				const b = banSao();
				for (const n of [1, 2])
					suaJson(b.ev, DUONG.soan(SO.chieu.ds, n), khuonSoanMh4, (x) => {
						x.soDeXuat = n === 1 && khongNop ? 0 : 10;
						x.khongNopDeXuat = n === 1 && khongNop;
						x.dat = 18;
						x.hong = 0;
					});
				return kiem(b.ev, maGoc(), capLai(b.ev));
			};
			const co = dung(true);
			const khong = dung(false);
			const tt = (k: KetTong) => ungCua(k, "soan-okr", SO.chieu.ds)?.trang_thai;
			return {
				hong: [
					...co.hong,
					...khong.hong,
					...neu(tt(co) === "không đạt", `luot khong nop ma ds ${tt(co)}`),
					...neu(tt(khong) === "đạt", `doi chung luot nop ma ds ${tt(khong)}`),
				],
				dong: co.dong,
			};
		},
	},
	{
		eval: "E4",
		ten: "khongNopDeXuat true ma soDeXuat khac 0",
		mong: "do",
		phaiCo: ["khong nop lech ds-1"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, DUONG.soan(SO.chieu.ds, 1), khuonSoanMh4, (x) => {
				x.khongNopDeXuat = true;
				x.soDeXuat = 5;
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E4",
		ten: "sua mot byte eval-soan-flash-1.json",
		mong: "do",
		phaiCo: ["bang chung glm doi eval-soan-flash-1.json"],
		chay: () => {
			const b = banSao();
			const t = join(b.ev, DUONG.soan(MTV.cu.ma, 1));
			writeFileSync(t, `${readFileSync(t, "utf8")}\n`);
			return tuDocs(b);
		},
	},
	{
		eval: "E5",
		ten: "ma tran bien nguong va luat chon",
		mong: "xanh",
		phaiCo: ["ma tran bien"],
		chay: luatBien,
	},
	{
		eval: "E5",
		ten: "sua mot o so cua ds",
		mong: "do",
		phaiCo: ["lech so soan-okr ds"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				const u = x.hang
					.find((h) => h.vai === "soan-okr")
					?.ung_vien.find((y) => y.ma === SO.chieu.ds);
				if (u?.so[0]) u.so[0].gia_tri = "0/18";
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E5",
		ten: "kien nghi tac-nhan trai luat",
		mong: "do",
		phaiCo: ["kien nghi trai luat tac-nhan"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "tac-nhan");
				if (h)
					h.kien_nghi = h.kien_nghi.startsWith("giữ")
						? "zai/glm-5.3-flash (flash)"
						: "giữ zai/glm-5.2-fast";
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E5",
		ten: "xoa thong so chua do cua hang giu",
		mong: "do",
		phaiCo: ["thong so chua do judge-okr"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "judge-okr");
				if (h) h.thong_so_chua_do = [];
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E5",
		ten: "xoa hang may-soan-kho",
		mong: "do",
		phaiCo: ["thieu vai may-soan-kho"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				x.hang = x.hang.filter((y) => y.vai !== "may-soan-kho");
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E5",
		ten: "xoa ung vien gem khoi hang tro-ly-kho",
		mong: "do",
		phaiCo: ["thieu ung vien tro-ly-kho gem"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "tro-ly-kho");
				if (h) h.ung_vien = h.ung_vien.filter((u) => u.ma !== SO.chieu.gem);
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E5",
		ten: "sua mot byte docs",
		mong: "do",
		phaiCo: ["docs lech"],
		chay: () => {
			const b = banSao();
			return tuDocs({ ...b, docs: `${b.docs}x` });
		},
	},
	{
		eval: "E5",
		ten: "tro so vao tep khong ton tai",
		mong: "do",
		phaiCo: ["tep vang _acceptance/khong-co.json"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "judge-okr");
				if (h?.so_moc[0]) h.so_moc[0].tep = "_acceptance/khong-co.json";
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E6",
		ten: "vuot tran van chay luot sau",
		mong: "do",
		phaiCo: ["vuot tran van chay"],
		chay: () => {
			const b = banSao();
			const ke = khuonKeHoach.parse(docJson(b.ev, MTV.tep.keHoach));
			suaJson(b.ev, MTV.tep.chiPhi, khuonChiPhi, (x) => {
				const l = x.luot.find(
					(y) => !laCu(giaiKhoa(ke, y.vai, y.luot)?.ma ?? MTV.cu.ma),
				);
				if (l) l.usd = 100;
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E6",
		ten: "luot ds tac-nhan dung vi tran ma van kien nghi ds",
		mong: "do",
		phaiCo: ["thieu luot van kien nghi tac-nhan"],
		chay: () => {
			const b = banSao();
			const ke = khuonKeHoach.parse(docJson(b.ev, MTV.tep.keHoach));
			const d = dongDs(b.ev, false);
			suaJson(b.ev, MTV.tep.chiPhi, khuonChiPhi, (x) => {
				const l = x.luot.find(
					(y) =>
						y.vai === "tac-nhan" &&
						y.luot === khoaChi("tac-nhan", d.bien_the, ke.tac_nhan.so_luot),
				);
				if (l) {
					l.trang_thai = "dung-vi-tran";
					l.usd = null;
					l.tep = null;
				}
			});
			suaJson(b.ev, MTV.tep.bang, khuonBang, (x) => {
				const h = x.hang.find((y) => y.vai === "tac-nhan");
				if (h) h.kien_nghi = `${modelCua(ke, SO.chieu.ds)} (${d.bien_the})`;
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E6",
		ten: "hai dong chi phi cung khoa",
		mong: "do",
		phaiCo: ["trung khoa chi phi"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.chiPhi, khuonChiPhi, (x) => {
				const l = x.luot.at(-1);
				if (l) x.luot.push({ ...l });
			});
			return tuDocs(b);
		},
	},
	{
		eval: "E6",
		ten: "sua usd dong glm kho",
		mong: "do",
		phaiCo: ["bang chung glm doi chi-phi.json tro-ly-kho 1"],
		chay: () => {
			const b = banSao();
			suaJson(b.ev, MTV.tep.chiPhi, khuonChiPhi, (x) => {
				const l = x.luot.find((y) => y.vai === "tro-ly-kho" && y.luot === "1");
				if (l) l.usd = (l.usd ?? 0) + 0.01;
			});
			return tuDocs(b);
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
	let bu: string[] = [];
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
		if (daBu.length) bu = daBu;
		const thieu = c.phaiCo.filter(
			(p) =>
				![...r.hong, ...r.dong].some((h) =>
					h.toLowerCase().includes(p.toLowerCase()),
				),
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
	if (bu.length)
		console.log(
			`chieu do chay tren ban sao bu ${bu.length} luot gia lap (chua co bang chung that): ${[...new Set(bu.map((x) => x.replace(/-\d+$/, "")))].join(", ")}`,
		);
	for (const t of tam) rmSync(t, { recursive: true, force: true });
	return ok;
}

function giaTri(ten: string): string | null {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? null);
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
		const evMoi = giaTri("--evidence");
		const docsMoi = giaTri("--docs");
		if ((evMoi === null) !== (docsMoi === null))
			throw new Error("--evidence va --docs phai di cung nhau");
		if (evMoi && docsMoi) {
			MOI.ev = resolve(evMoi);
			MOI.docs = resolve(docsMoi);
		}
		if (doiSo.includes("--ghi")) {
			const k = kiem(MOI.ev, maGoc(), null);
			writeFileSync(MOI.docs, ghiLai(MOI.ev, k));
			console.log(
				`da ghi ${MTV.tep.bang}, ${MTV.tep.bangTacNhan}, ${MOI.docs}`,
			);
		}
		const k = kiem(MOI.ev, maGoc(), docsGoc());
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
