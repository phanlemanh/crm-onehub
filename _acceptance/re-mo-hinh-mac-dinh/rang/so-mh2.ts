import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { tinhBang } from "../../bo-cau-hoi-mau/rang/bang-do";
import { khuonBoMau } from "../../bo-cau-hoi-mau/rang/khuon";
import { soKho } from "../../model-theo-vai-do-lai/rang/so-do";
import {
	type DongTungCau,
	docTungCau,
} from "../../tro-ly-doc-kho/rang/quyet-do";
import { doKho } from "./do-kho";
import { doTacNhan } from "./do-tac-nhan";
import { giaLap, vietBaoCao } from "./gia-lap";
import {
	boDongChi,
	DUONG,
	docKeHoach,
	docTho,
	GOC,
	khoaChi,
	khuonChiPhi,
	khuonDongTacNhan,
	khuonKeHoach,
	khuonKetXuat,
	khuonKhoTom,
	khuonSuKienKho,
	MH2,
	type SuKienKho,
	tongCost,
	z,
} from "./khuon";
import {
	docPhamVi,
	type Ket,
	kiemE1,
	kiemE3,
	kiemE4,
	kiemE5,
	kiemE6,
	kiemE8,
	kiemE9,
	type Nguon,
	nguonThat,
	phamVi,
	purposeCay,
	quetTieuThu,
	tepNguon,
	type VaoPhamVi,
} from "./kiem";

const EVAL = ["E1", "E3", "E4", "E5", "E6", "E8", "E9"] as const;
type MaEval = (typeof EVAL)[number];

async function kiemMot(ma: MaEval, n: Nguon): Promise<Ket> {
	const ke = docKeHoach(n.ev);
	if (ma === "E1") return kiemE1(n, ke);
	if (ma === "E3") return kiemE3(n, ke);
	if (ma === "E4") return kiemE4(n, ke);
	if (ma === "E5") return kiemE5(n, ke);
	if (ma === "E6") return kiemE6(n, ke);
	if (ma === "E8") return kiemE8(n, ke);
	return kiemE9(n);
}

async function kiemNhieu(ds: readonly MaEval[], n: Nguon): Promise<Ket> {
	const ra: Ket = { hong: [], dong: [] };
	for (const ma of ds) {
		const k = await kiemMot(ma, n);
		ra.hong.push(...k.hong.map((h) => `${ma} ${h}`));
		ra.dong.push(...k.dong.map((d) => `${ma} ${d}`));
	}
	return ra;
}

const tam: string[] = [];
let daBu: string[] = [];

function sua(tep: string, doi: (s: string) => string) {
	const truoc = readFileSync(tep, "utf8");
	const sau = doi(truoc);
	if (sau === truoc) throw new Error(`ban sao khong doi duoc: ${tep}`);
	writeFileSync(tep, sau);
}

function suaJson<T>(tep: string, khuon: z.ZodType<T>, doi: (x: T) => void) {
	const x = khuon.parse(JSON.parse(readFileSync(tep, "utf8")));
	doi(x);
	writeFileSync(tep, `${JSON.stringify(x, null, 2)}\n`);
}

function moTam(): string {
	const t = mkdtempSync(join(tmpdir(), "mh2-so-"));
	tam.push(t);
	return t;
}

function boKhoCuKhuon(ev: string) {
	for (let l = 1; l <= docKeHoach(ev).tro_ly_kho.so_luot; l++) {
		const thu = join(ev, DUONG.kho(l));
		if (
			existsSync(join(thu, MH2.tep.khoTom)) &&
			!existsSync(join(thu, MH2.tep.khoSuKien))
		) {
			rmSync(thu, { recursive: true, force: true });
			boDongChi(ev, "tro-ly-kho", l);
		}
	}
}

function banSao(): Nguon {
	const t = moTam();
	const that = nguonThat();
	const ev = join(t, "evidence");
	cpSync(MH2.evidence, ev, { recursive: true });
	boKhoCuKhuon(ev);
	daBu = giaLap(ev);
	const chep = (nguon: string, ten: string) => {
		const dich = join(t, ten);
		cpSync(nguon, dich);
		return dich;
	};
	const settings = join(t, "settings.ts");
	writeFileSync(
		settings,
		docTho(that.settings).replace(
			/from "\.\/([^"]+)"/g,
			(_, p: string) =>
				`from ${JSON.stringify(join(GOC, dirname(MH2.nguon.settings), p))}`,
		),
	);
	return {
		goc: GOC,
		ev,
		settings,
		fixture: chep(that.fixture, "gateway-models.json"),
		docs: chep(that.docs, "agent.md"),
		taiLieu: chep(that.taiLieu, "tai-lieu-config.ts"),
		opportunity: chep(that.opportunity, "opportunity.md"),
		design: chep(that.design, "design.md"),
		that: false,
	};
}

function banSaoKhopCay(n: Nguon): Nguon {
	const p = purposeCay(GOC) ?? [];
	const tt = quetTieuThu(GOC);
	const [mo, dong] = MH2.marker.tieuThu;
	const [moP, dongP] = MH2.marker.purpose;
	const md = docTho(n.design);
	const thay = (s: string, a: string, b: string, ds: string[]) =>
		`${s.slice(0, s.indexOf(a) + a.length)}\n${ds.join("\n")}\n${s.slice(s.indexOf(b))}`;
	writeFileSync(n.design, thay(thay(md, mo, dong, tt), moP, dongP, p));
	return n;
}

function banSaoCay(): string {
	const t = moTam();
	for (const f of tepNguon(GOC)) {
		mkdirSync(dirname(join(t, f)), { recursive: true });
		cpSync(join(GOC, f), join(t, f));
	}
	return t;
}

const ke = (n: Nguon) => docKeHoach(n.ev);
const tepEv = (n: Nguon, f: string) => join(n.ev, f);

function suaDongTn(
	n: Nguon,
	luot: number,
	doi: (
		d: z.infer<typeof khuonDongTacNhan>,
	) => z.infer<typeof khuonDongTacNhan> | null,
) {
	const tep = tepEv(n, MH2.tep.tacNhan);
	const ds = docTho(tep)
		.split("\n")
		.filter(Boolean)
		.flatMap((t) => {
			const d = khuonDongTacNhan.parse(JSON.parse(t));
			if (d.luot !== luot) return [t];
			const moi = doi(d);
			return moi ? [JSON.stringify(moi)] : [];
		});
	writeFileSync(tep, `${ds.join("\n")}\n`);
}

function congCost(n: Nguon, luot: number, them: number) {
	const tep = tepEv(n, DUONG.aichiphi(luot));
	let u = 0;
	suaJson(tep, khuonKetXuat, (hang) => {
		const h = hang[0];
		if (h) h.costUsd = Number(((h.costUsd ?? 0) + them).toFixed(6));
		u = tongCost(hang);
	});
	suaJson(tepEv(n, MH2.tep.chiPhi), khuonChiPhi, (c) => {
		const l = c.luot.find(
			(x) => x.vai === "tac-nhan" && x.luot === String(luot),
		);
		if (l) {
			l.usd = u;
			l.usd_vai = u;
		}
	});
}

const khoThu = (n: Nguon) => tepEv(n, DUONG.kho(1));

function suaSuKien(
	n: Nguon,
	tinhNang: SuKienKho[number]["tinhNang"],
	doi: (e: SuKienKho[number]) => SuKienKho[number] | null,
) {
	const tep = join(khoThu(n), MH2.tep.khoSuKien);
	const ds = khuonSuKienKho.parse(JSON.parse(docTho(tep)));
	const i = ds.findIndex((e) => e.tinhNang === tinhNang);
	const e = ds[i];
	if (!e) throw new Error(`ban sao khong co su kien ${tinhNang}`);
	const moi = doi(e);
	const sau = moi
		? ds.map((x, j) => (j === i ? moi : x))
		: ds.filter((_, j) => j !== i);
	writeFileSync(tep, `${JSON.stringify(sau, null, 2)}\n`);
}

function dauBaoCao(md: string) {
	const tongMo = md.indexOf("## Tổng của script chấm");
	const tongHet = md.indexOf("\n## ", tongMo + 1);
	return {
		bamTroLy: md.match(/^bam tro-ly: (\S+)$/m)?.[1] ?? "",
		maCham: Number(md.match(/^ma thoat cham-bo-do: (\d+)$/m)?.[1] ?? 0),
		luot: md.match(/^thu muc luot cham-bo-do: (.+)$/m)?.[1] ?? "",
		tong: md
			.slice(tongMo, tongHet)
			.split("\n")
			.filter((d) => d.startsWith("- "))
			.map((d) => d.slice(2)),
	};
}

function lamLoi(d: DongTungCau): DongTungCau {
	if (d.luot === 1) return { ...d, ketCuc: "LOI" };
	return {
		...d,
		ketCuc: "loi",
		zalo: d.zalo ? { ...d.zalo, loi: "gia lap" } : undefined,
	};
}

function datSoLoi(n: Nguon, soLoi: number) {
	const k = ke(n);
	const thu = khoThu(n);
	const boTho = docTho(join(GOC, MH2.nguon.boMau));
	const bo = khuonBoMau.parse(JSON.parse(boTho));
	const md = docTho(join(thu, MH2.tep.khoBaoCao));
	const mocTang = soKho(
		tinhBang(bo, docTungCau(docTho(join(thu, MH2.tep.khoTungCau)))),
	);
	let dong = docTungCau(docTho(join(thu, MH2.tep.khoTungCau)));
	const giu = (ds: DongTungCau[]) => {
		const so = soKho(tinhBang(bo, ds));
		return Object.entries(mocTang.tang).every(
			([t, m]) => (so.tang[t] ?? 0) >= m - k.tro_ly_kho.kem_moc_toi_da_moi_tang,
		);
	};
	for (
		let i = 0;
		i < dong.length && soKho(tinhBang(bo, dong)).loi < soLoi;
		i++
	) {
		const thu2 = dong.map((d, j) => (j === i ? lamLoi(d) : d));
		if (
			soKho(tinhBang(bo, thu2)).loi > soKho(tinhBang(bo, dong)).loi &&
			giu(thu2)
		)
			dong = thu2;
	}
	if (soKho(tinhBang(bo, dong)).loi !== soLoi)
		throw new Error(`khong dat duoc ${soLoi} cau loi tren ban sao`);
	writeFileSync(
		join(thu, MH2.tep.khoTungCau),
		`${dong.map((d) => JSON.stringify(d)).join("\n")}\n`,
	);
	writeFileSync(
		join(thu, MH2.tep.khoBaoCao),
		vietBaoCao(boTho, dong, dauBaoCao(md)),
	);
}

const datNguongLoi = (n: Nguon, so: number) =>
	suaJson(tepEv(n, MH2.tep.keHoach), khuonKeHoach, (x) => {
		x.tro_ly_kho.cau_loi_toi_da = so;
	});

type ChieuDo = {
	eval: string;
	ten: string;
	mong: "do" | "xanh";
	phaiCo: string[];
	khongCo?: string[];
	chay: () => Promise<Ket>;
};

const BON: readonly MaEval[] = ["E1", "E3", "E4", "E5", "E6", "E8"];

const CHIEU_DO: readonly ChieuDo[] = [
	{
		eval: "E1 E3 E4 E5 E6 E8",
		ten: "ban sao nguyen co bang chung GIA LAP (doi chung)",
		mong: "xanh",
		phaiCo: [
			"E4 tac nhan dat",
			"E5 kho dat",
			"re hon tac-nhan",
			"re hon tro-ly-kho",
		],
		chay: () => kiemNhieu(BON, banSao()),
	},
	{
		eval: "E1",
		ten: "ban sao settings.ts doi id ve model cu",
		mong: "do",
		phaiCo: ["mac dinh tac nhan lech"],
		chay: () => {
			const n = banSao();
			sua(n.settings, (s) =>
				s.replace(
					/(DEFAULT_AGENT_MODEL = \{\s*id: )"[^"]+"/,
					`$1"${MH2.doi.modelCu}"`,
				),
			);
			return kiemNhieu(["E1"], n);
		},
	},
	{
		eval: "E1",
		ten: "ban sao fixture xoa id mac dinh",
		mong: "do",
		phaiCo: ["thieu trong danh muc"],
		chay: () => {
			const n = banSao();
			const m = ke(n).tac_nhan.model;
			suaJson(
				n.fixture,
				z.object({ data: z.array(z.looseObject({ id: z.string() })) }).loose(),
				(x) => {
					x.data = x.data.filter((d) => d.id !== m);
				},
			);
			return kiemNhieu(["E1"], n);
		},
	},
	{
		eval: "E1",
		ten: "ban sao docs/agent.md con model cu o dong Default",
		mong: "do",
		phaiCo: ["docs agent lech"],
		chay: () => {
			const n = banSao();
			sua(n.docs, (s) =>
				s.replace(/^Default `[^`]+`/m, `Default \`${MH2.doi.modelCu}\``),
			);
			return kiemNhieu(["E1"], n);
		},
	},
	{
		eval: "E3",
		ten: "ban sao tai-lieu-config.ts xoa dong gia model kho moi",
		mong: "do",
		phaiCo: ["thieu gia {kho}"],
		chay: () => {
			const n = banSao();
			const m = ke(n).tro_ly_kho.model;
			sua(n.taiLieu, (s) =>
				s
					.split("\n")
					.filter((d) => !d.includes(`${JSON.stringify(m)}: { vaoMoiTrieu`))
					.join("\n"),
			);
			return kiemNhieu(["E3"], n);
		},
	},
	{
		eval: "E3",
		ten: "ban sao tai-lieu-config.ts tat zeroDataRetention cua hoi",
		mong: "do",
		phaiCo: ["mat zdr kho"],
		chay: () => {
			const n = banSao();
			sua(n.taiLieu, (s) => {
				const i = s.indexOf("\thoi: {");
				const cu = "gateway: { zeroDataRetention: true }";
				const j = s.indexOf(cu, i);
				return i < 0 || j < 0
					? s
					: `${s.slice(0, j)}gateway: { zeroDataRetention: false }${s.slice(j + cu.length)}`;
			});
			return kiemNhieu(["E3"], n);
		},
	},
	{
		eval: "E3",
		ten: "ban sao tai-lieu-config.ts gia vao lech gia chup",
		mong: "do",
		phaiCo: ["gia lech {kho}"],
		chay: () => {
			const n = banSao();
			const m = ke(n).tro_ly_kho.model;
			sua(n.taiLieu, (s) =>
				s.replace(
					new RegExp(
						`(${JSON.stringify(m).replace(/[.]/g, "\\.")}: \\{ vaoMoiTrieu: )[0-9.]+`,
					),
					"$10.075",
				),
			);
			return kiemNhieu(["E3"], n);
		},
	},
	{
		eval: "E4",
		ten: "doi model Gateway tra luot 2 thanh model cu",
		mong: "do",
		phaiCo: ["sai model tac-nhan 2"],
		chay: () => {
			const n = banSao();
			suaDongTn(n, 2, (d) => ({ ...d, model_gateway: MH2.doi.modelCu }));
			sua(tepEv(n, DUONG.suKien(2)), (s) =>
				s.replaceAll(ke(n).tac_nhan.model, MH2.doi.modelCu),
			);
			return kiemNhieu(["E4"], n);
		},
	},
	{
		eval: "E4",
		ten: "dat o_cai_dat luot 3 thanh mot model",
		mong: "do",
		phaiCo: ["o cai dat khong trong 3"],
		chay: () => {
			const n = banSao();
			suaDongTn(n, 3, (d) => ({ ...d, o_cai_dat: MH2.doi.oCaiDatLa }));
			return kiemNhieu(["E4"], n);
		},
	},
	{
		eval: "E4",
		ten: "xoa dong luot 4",
		mong: "do",
		phaiCo: ["thieu luot tac-nhan 4"],
		chay: () => {
			const n = banSao();
			suaDongTn(n, 4, () => null);
			return kiemNhieu(["E4"], n);
		},
	},
	{
		eval: "E4",
		ten: "hai luot hong",
		mong: "do",
		phaiCo: ["tac nhan khong dat"],
		chay: () => {
			const n = banSao();
			for (const l of [1, 2]) {
				suaDongTn(n, l, (d) => ({
					...d,
					ket_qua: "hong",
					ly_do: "✗ agent-builder (gia lap)",
				}));
				sua(tepEv(n, DUONG.nhatKy(l)), (s) =>
					s.replace(/✓(\s+)agent-builder/u, "✗$1agent-builder"),
				);
			}
			return kiemNhieu(["E4"], n);
		},
	},
	{
		eval: "E5",
		ten: "ban sao su-kien.json doi model mot phien goc Zalo",
		mong: "do",
		phaiCo: ["sai model goc zalo"],
		khongCo: ["sai model kho"],
		chay: () => {
			const n = banSao();
			suaSuKien(n, MH2.tinhNang.gocZalo, (e) => ({
				...e,
				modelId: MH2.doi.oCaiDatLa,
			}));
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E5",
		ten: "ban sao su-kien.json doi model mot phien kho",
		mong: "do",
		phaiCo: ["sai model kho"],
		khongCo: ["sai model goc zalo"],
		chay: () => {
			const n = banSao();
			suaSuKien(n, MH2.tinhNang.kho, (e) => ({
				...e,
				modelId: MH2.doi.modelCu,
			}));
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E5",
		ten: "ban sao su-kien.json xoa su kien mot phien kho",
		mong: "do",
		phaiCo: ["thieu su kien model"],
		chay: () => {
			const n = banSao();
			suaSuKien(n, MH2.tinhNang.kho, () => null);
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E5",
		ten: "xoa ma m05 vong hai",
		mong: "do",
		phaiCo: ["thieu ma m05 vong hai"],
		chay: () => {
			const n = banSao();
			sua(join(khoThu(n), MH2.tep.khoTungCau), (s) =>
				s
					.split("\n")
					.filter((d) => !(d.includes('"luot":2') && d.includes('"id":"m05"')))
					.join("\n"),
			);
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E5",
		ten: "ke-hoach ghim 2 cau loi, ban sao 3 cau loi",
		mong: "do",
		phaiCo: ["kho khong dat"],
		chay: () => {
			const n = banSao();
			datSoLoi(n, 3);
			datNguongLoi(n, 2);
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E5",
		ten: "ke-hoach ghim 3 cau loi, ban sao 3 cau loi (doi chung)",
		mong: "xanh",
		phaiCo: ["kho dat"],
		chay: () => {
			const n = banSao();
			datSoLoi(n, 3);
			datNguongLoi(n, 3);
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E5",
		ten: "dat o_cai_dat cua luot kho thanh mot model",
		mong: "do",
		phaiCo: ["o cai dat khong trong kho"],
		chay: () => {
			const n = banSao();
			suaJson(join(khoThu(n), MH2.tep.khoTom), khuonKhoTom, (t) => {
				t.o_cai_dat = MH2.doi.oCaiDatLa;
			});
			return kiemNhieu(["E5"], n);
		},
	},
	{
		eval: "E6",
		ten: "nang usd luot tac-nhan 1 vuot tran ma con luot sau",
		mong: "do",
		phaiCo: ["vuot tran van chay tac-nhan:2"],
		chay: () => {
			const n = banSao();
			congCost(n, 1, ke(n).tran_usd);
			return kiemNhieu(["E6"], n);
		},
	},
	{
		eval: "E6",
		ten: "sua usd dong tac-nhan:2 lech ket xuat",
		mong: "do",
		phaiCo: ["lech usd tac-nhan:2"],
		chay: () => {
			const n = banSao();
			suaJson(tepEv(n, MH2.tep.chiPhi), khuonChiPhi, (c) => {
				const l = c.luot.find((x) => khoaChi(x.vai, x.luot) === "tac-nhan:2");
				if (l) l.usd = (l.usd ?? 0) + 0.01;
			});
			return kiemNhieu(["E6"], n);
		},
	},
	{
		eval: "E6",
		ten: "hai dong cung khoa",
		mong: "do",
		phaiCo: ["trung khoa chi phi"],
		chay: () => {
			const n = banSao();
			suaJson(tepEv(n, MH2.tep.chiPhi), khuonChiPhi, (c) => {
				const l = c.luot.find((x) => khoaChi(x.vai, x.luot) === "tac-nhan:3");
				if (l) c.luot.push({ ...l });
			});
			return kiemNhieu(["E6"], n);
		},
	},
	{
		eval: "E6",
		ten: "luot kho dung vi tran, khong co tep",
		mong: "do",
		phaiCo: ["chua du so tro-ly-kho"],
		khongCo: ["dung vi tran ma co tep"],
		chay: () => {
			const n = banSao();
			rmSync(khoThu(n), { recursive: true, force: true });
			suaJson(tepEv(n, MH2.tep.chiPhi), khuonChiPhi, (c) => {
				const l = c.luot.find((x) => khoaChi(x.vai, x.luot) === "tro-ly-kho:1");
				if (l) {
					l.trang_thai = "dung-vi-tran";
					l.usd = null;
					l.usd_vai = null;
					l.tep = null;
				}
			});
			return kiemNhieu(["E5", "E6"], n);
		},
	},
	{
		eval: "E8",
		ten: "nang costUsd luot tac-nhan 1 vuot moc",
		mong: "xanh",
		phaiCo: ["khong re hon tac-nhan"],
		chay: () => {
			const n = banSao();
			congCost(n, 1, 1);
			return kiemNhieu(["E6", "E8"], n);
		},
	},
	{
		eval: "E8",
		ten: "giu nguyen (doi chung)",
		mong: "xanh",
		phaiCo: ["E8 re hon tac-nhan"],
		khongCo: ["khong re hon tac-nhan"],
		chay: () => kiemNhieu(["E8"], banSao()),
	},
	{
		eval: "E8",
		ten: "ban sao opportunity.md doi decided_by",
		mong: "do",
		phaiCo: ["o co hoi bi sua: decided_by"],
		chay: () => {
			const n = banSao();
			sua(n.opportunity, (s) =>
				s.replace(/^decided_by: \S+/m, "decided_by: may"),
			);
			return kiemNhieu(["E8"], n);
		},
	},
	{
		eval: "E8",
		ten: "ban sao opportunity.md xoa dong nguong song",
		mong: "do",
		phaiCo: ["thieu nguong song"],
		chay: () => {
			const n = banSao();
			sua(n.opportunity, (s) =>
				s
					.split("\n")
					.filter((d) => !d.startsWith("- Kết quả nào là SỐNG:"))
					.join("\n"),
			);
			return kiemNhieu(["E8"], n);
		},
	},
	{
		eval: "E9",
		ten: "cay sao, danh sach design khop cay (doi chung)",
		mong: "xanh",
		phaiCo: ["E9 tieu thu"],
		chay: () => {
			const n = banSaoKhopCay(banSao());
			return kiemNhieu(["E9"], { ...n, goc: banSaoCay() });
		},
	},
	{
		eval: "E9",
		ten: "cay sao them mot tep tham chieu DEFAULT_AGENT_MODEL",
		mong: "do",
		phaiCo: [`tieu thu chua ke ${MH2.doi.tepTieuThuLa}`],
		chay: () => {
			const n = banSaoKhopCay(banSao());
			const goc = banSaoCay();
			mkdirSync(dirname(join(goc, MH2.doi.tepTieuThuLa)), { recursive: true });
			writeFileSync(
				join(goc, MH2.doi.tepTieuThuLa),
				'import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";\n\nexport const MO_HINH = DEFAULT_AGENT_MODEL.id;\n',
			);
			return kiemNhieu(["E9"], { ...n, goc });
		},
	},
	{
		eval: "E9",
		ten: "bo mot tep khoi danh sach design",
		mong: "do",
		phaiCo: ["tieu thu chua ke apps/api/src/settings/settings.service.ts"],
		chay: () => {
			const n = banSaoKhopCay(banSao());
			sua(n.design, (s) =>
				s.replace("apps/api/src/settings/settings.service.ts\n", ""),
			);
			return kiemNhieu(["E9"], n);
		},
	},
	{
		eval: "E9",
		ten: "bo purpose research khoi danh sach design",
		mong: "do",
		phaiCo: ["purpose chua ke research"],
		chay: () => {
			const n = banSaoKhopCay(banSao());
			sua(n.design, (s) => {
				const [mo] = MH2.marker.purpose;
				const i = s.indexOf(mo);
				return `${s.slice(0, i)}${s.slice(i).replace("\nresearch\n", "\n")}`;
			});
			return kiemNhieu(["E9"], n);
		},
	},
];

const coChu = (r: Ket, p: string) => {
	const mau = p
		.replaceAll("{kho}", docKeHoach().tro_ly_kho.model)
		.toLowerCase();
	return [...r.hong, ...r.dong].some((h) => h.toLowerCase().includes(mau));
};

async function chayChieu(ds: readonly ChieuDo[]): Promise<boolean> {
	let ok = true;
	let bu: string[] = [];
	for (const c of ds) {
		let r: Ket;
		try {
			r = await c.chay();
		} catch (loi) {
			r = {
				hong: [`nem loi: ${loi instanceof Error ? loi.message : String(loi)}`],
				dong: [],
			};
		}
		if (daBu.length) bu = daBu;
		const thieu = c.phaiCo.filter((p) => !coChu(r, p));
		const thua = (c.khongCo ?? []).filter((p) => coChu(r, p));
		const dung =
			thieu.length === 0 &&
			thua.length === 0 &&
			(c.mong === "xanh" ? r.hong.length === 0 : r.hong.length > 0);
		if (!dung) ok = false;
		console.log(
			`chieu do ${c.eval} «${c.ten}»: ${dung ? "dung" : "SAI"}${dung ? "" : ` — do [${r.hong.slice(0, 5).join("; ")}] thieu [${thieu.join("; ")}] thua [${thua.join("; ")}]`}`,
		);
	}
	if (bu.length)
		console.log(
			`chieu do chay tren ban sao co bang chung ${MH2.nhanGiaLap.split(" — ")[0]}: bu ${bu.join(", ")}`,
		);
	for (const t of tam) rmSync(t, { recursive: true, force: true });
	tam.length = 0;
	return ok;
}

const CHIEU_PHAM_VI: readonly {
	ten: string;
	vao: (g: VaoPhamVi) => VaoPhamVi;
	phaiCo: string | null;
}[] = [
	{ ten: "doi chung gia tri that", vao: (g) => g, phaiCo: null },
	{
		ten: "them apps/agent/agent/lib/okr/config.ts",
		vao: (g) => ({ ...g, tep: [...g.tep, MH2.nguon.okrAgent] }),
		phaiCo: `ngoai pham vi ${MH2.nguon.okrAgent}`,
	},
	{
		ten: "gia tri judge khac onehub",
		vao: (g) => ({
			...g,
			hienTai: { ...g.hienTai, judgeAgent: MH2.doi.oCaiDatLa },
		}),
		phaiCo: "judge doi",
	},
	{
		ten: "MEASURE_DATABASE.agentModel bang mac dinh",
		vao: (g) => ({ ...g, khoDo: g.macDinh }),
		phaiCo: "kho do trung mac dinh",
	},
];

async function chayPhamVi(): Promise<boolean> {
	const that = await docPhamVi();
	const ra = phamVi(that);
	let ok = ra.length === 0;
	for (const c of CHIEU_PHAM_VI) {
		const r = phamVi(c.vao(that));
		const dung =
			c.phaiCo === null
				? r.length === 0
				: r.some((x) => x.includes(c.phaiCo ?? ""));
		if (!dung) ok = false;
		console.log(`chieu do E7 «${c.ten}»: ${dung ? "dung" : "SAI"}`);
	}
	console.log(
		`E7 tep doi tren nhanh: ${that.tep.length}; judge ${that.hienTai.judgeAgent}/${that.hienTai.judgeOkr}, soan okr ${that.hienTai.soanOkr}, tro ly okr ${that.hienTai.troLyOkr}; kho do ${that.khoDo} khac mac dinh ${that.macDinh}`,
	);
	for (const h of ra) console.log(`E7 ${h}`);
	console.log(ok ? "dat: E7 pham vi sach, moi chieu do dung" : "KHONG DAT");
	return ok;
}

async function chayMacDinh(): Promise<boolean> {
	const n = nguonThat();
	khuonKeHoach.parse(JSON.parse(docTho(join(n.ev, MH2.tep.keHoach))));
	const k = await kiemNhieu(EVAL, n);
	for (const d of k.dong) console.log(d);
	for (const h of k.hong) console.log(`DO ${h}`);
	const cd = await chayChieu(CHIEU_DO);
	const ok = k.hong.length === 0 && cd;
	console.log(
		ok
			? "dat: E1 E3 E4 E5 E6 E8 E9 khop bang chung, moi chieu do ghim dung"
			: `KHONG DAT: ${k.hong.length} dong do tren cay that${cd ? "" : ", co chieu do SAI"}`,
	);
	return ok;
}

const doiSo = process.argv.slice(2);
if (import.meta.main) {
	try {
		if (doiSo.includes("--do-tac-nhan")) {
			await doTacNhan();
			process.exit(0);
		}
		if (doiSo.includes("--do-kho")) {
			await doKho(doiSo.includes("--do-lai"));
			process.exit(0);
		}
		const ok = doiSo.includes("--pham-vi")
			? await chayPhamVi()
			: await chayMacDinh();
		process.exit(ok ? 0 : 1);
	} catch (loi) {
		console.log(
			`KHONG DO DUOC: ${loi instanceof Error ? loi.message : String(loi)}`,
		);
		process.exit(2);
	}
}
