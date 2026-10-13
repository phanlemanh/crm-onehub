import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	cpSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import {
	docBoCaGopY,
	THU_MUC_CA_QUY_4,
} from "../../../apps/agent/evals/okr/ca-gop-y.ts";
import {
	COT_DONG_TONG_KET,
	dongTongKet,
} from "../../../apps/agent/evals/okr/tong-ket-gop-y.ts";
import { TRO_LY_OKR_TRAN } from "../../../packages/db/src/okr-tro-ly-danh-muc.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import {
	AGENT,
	cauThieuKhoa,
	coKhoaMoHinh,
	duongPath,
	GOC,
	napBoMau,
	phienCookie,
	taoKho,
	truyVan,
	xoaKho,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { CHAM, chamCa, docBanGhi, phuBoiLuat7 } from "./cham-ca.mjs";

const PHUT_MS = 60_000;

const DO = {
	kho: "bcq4-do",
	timeoutMs: 120 * PHUT_MS,
	eval: ["okr/gop-y", "okr/ng"],
	boViet: "viet-lai",
	nhanJudge: "judge.autoevals.closedQA [",
	caMau9b: { ma: "30/30", judge: 0.95 },
	co: { tuKiem: "--tu-kiem", thuMuc: "--thu-muc", tranUsd: "--tran-usd" },
	ra: join(GOC, ".acceptance-runs/bo-ca-mau-quy-4/do"),
	bangChung: join(
		GOC,
		"_acceptance/bo-ca-mau-quy-4/evidence/do-gop-y-quy-4.md",
	),
	soMoiLot: join(GOC, "_acceptance/tro-ly-okr-de-xuat/rang/so-moi-lot.mjs"),
	eve: join(AGENT, "node_modules/.bin/eve"),
	caDoiChung: {
		id: "doi-chung-goi-50-cuoc",
		bo: "viet-lai",
		ngonNgu: "vi",
		donVi: { cap: "phong-ban", ten: "Kinh doanh miền Bắc" },
		mucTieu: {
			title: "Gọi 50 cuộc",
			whyNow: "Đội cần gọi nhiều hơn mỗi ngày.",
			kind: "cam-ket",
		},
		krs: [
			{
				title: "Số cuộc gọi mỗi ngày",
				kind: "tang-toi",
				startValue: 20,
				targetValue: 50,
				unit: "cuộc",
			},
		],
		kyVong: {
			vanDe: [],
			vietLai: [],
			khongGopY: true,
			khongDuoc: [],
			soSai: false,
		},
		ghiChu:
			"Ca đối chứng: Mục tiêu nói việc làm, kỳ vọng khongGopY cố ý sai — phép đo phải bắt được.",
	},
	thongDiep: { doiChung: "ca doi chung khong bat duoc" },
	env: TRO_LY_OKR.danhGia.env,
};

const TUY_CHON_CHAM = {
	maCamNg: TRO_LY_OKR.danhGia.maCamNg,
	tuCam: TRO_LY_OKR_TRAN.tuCam,
};

function giaTriCo(co) {
	const i = process.argv.indexOf(co);
	return i < 0 ? undefined : process.argv[i + 1];
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	return 2;
}

const CA_GIA = {
	id: "tu-kiem",
	bo: "viet-lai",
	ngonNgu: "vi",
	donVi: { cap: "phong-ban", ten: "Kho vận" },
	mucTieu: {
		title: "Kho sẵn sàng cho mùa Tết",
		whyNow: "Tết năm ngoái kho quá tải.",
		kind: "cam-ket",
	},
	krs: [
		{
			title: "Thời gian xuất kho giảm từ 36 xuống 25 phút",
			kind: "giam-xuong",
			startValue: 36,
			targetValue: 25,
			unit: "phút",
		},
	],
	kyVong: {
		vanDe: [],
		vietLai: [],
		khongGopY: false,
		khongDuoc: [],
		soSai: false,
	},
	ghiChu: "tu kiem",
};

const KR_CAP_TREN = "Doanh thu hợp đồng mới đạt 48 tỷ đồng";
const TEN_GIA = "Nguyễn Văn An";

function dongGia(ten, i, mau) {
	const rong = Object.fromEntries(
		Object.keys(COT_DONG_TONG_KET).map((k) => [k, null]),
	);
	return {
		...rong,
		id: `tk-${ten}-${i}`,
		lyDo: `tu kiem ${ten}`,
		trangThai: CHAM.trangThaiCho,
		...mau,
	};
}

const MA_TRAN = [
	{
		ten: "viec-dong-sai",
		outcome: "tu-choi",
		dong: [],
		phai: CHAM.luat.viecDong,
	},
	{
		ten: "so-moi",
		dong: [
			{ loai: "viet-lai", truong: "kr.title", sau: "Xuất kho trong 20 phút" },
		],
		lot: true,
		phai: CHAM.luat.soMoi,
	},
	{
		ten: "khong-gop-y",
		kyVong: { khongGopY: true },
		dong: [{ loai: "viet-lai", truong: "title", sau: "Kho không để đơn chờ" }],
		phai: CHAM.luat.khongGopY,
	},
	{
		ten: "van-de",
		kyVong: { vanDe: ["kr-la-viec"] },
		dong: [],
		phai: `${CHAM.luat.vanDe} kr-la-viec`,
	},
	{
		ten: "chep-cap-tren",
		bo: "ng",
		capTren: [KR_CAP_TREN],
		dong: [{ loai: "viet-lai", truong: "title", sau: KR_CAP_TREN }],
		phai: CHAM.luat.chepCapTren,
	},
	{
		ten: "noi-ve-nguoi",
		bo: "ng",
		dong: [{ loai: "hoi", lyDo: `Anh ${TEN_GIA} phụ trách KR này` }],
		ten_: [TEN_GIA],
		phai: CHAM.luat.noiVeNguoi,
	},
	{ ten: "khong-ban-ghi", khongGhi: true, phai: CHAM.luat.khongBanGhi },
	{
		ten: "hop-le",
		kyVong: { vanDe: ["kr-la-viec"] },
		dong: [
			{
				loai: "viet-lai",
				truong: "kr.title",
				maVanDe: "kr-la-viec",
				sau: "Đơn xuất kho trong ngày",
			},
		],
		phai: null,
	},
	{
		ten: "phu-boi-luat-7",
		krs: [
			{
				title: "Gọi 50 cuộc mỗi tuần",
				kind: "tang-toi",
				startValue: 0,
				targetValue: 50,
				unit: "cuộc",
			},
		],
		kyVong: { vanDe: ["kr-la-viec"] },
		dong: [],
		phai: null,
		phu: "kr-la-viec",
	},
];

function tuKiem() {
	const sai = [];
	for (const tk of MA_TRAN) {
		const ca = {
			...CA_GIA,
			id: `tu-kiem-${tk.ten}`,
			bo: tk.bo ?? CA_GIA.bo,
			krs: tk.krs ?? CA_GIA.krs,
			kyVong: { ...CA_GIA.kyVong, ...tk.kyVong },
		};
		const ghi = tk.khongGhi
			? undefined
			: docBanGhi(
					dongTongKet({
						ca,
						objectiveId: ca.id,
						krs: [],
						capTrenKr: tk.capTren ?? [],
						taskId: ca.id,
						outcome: tk.outcome ?? "da-nop",
						dong: (tk.dong ?? []).map((m, i) => dongGia(tk.ten, i, m)),
					}),
				);
		const lot = new Set(tk.lot ? (ghi?.dong ?? []).map((d) => d.id) : []);
		const loi = chamCa(ca, ghi, {
			...TUY_CHON_CHAM,
			lotSoMoi: lot,
			ten: tk.ten_ ?? [],
		});
		const dung =
			tk.phai === null
				? loi.length === 0 && (!tk.phu || phuBoiLuat7(ca).includes(tk.phu))
				: loi.some((l) => l.startsWith(tk.phai));
		if (!dung) sai.push(`${tk.ten} — chamCa tra [${loi.join(" · ")}]`);
	}
	console.log(`tu kiem cham: ${MA_TRAN.length - sai.length}/${MA_TRAN.length}`);
	for (const s of sai) console.log(`LECH ${s}`);
	return sai.length === 0;
}

function tranUsd() {
	const tho = giaTriCo(DO.co.tranUsd);
	if (tho === undefined) return TRO_LY_OKR.danhGia.tranUsdMacDinh;
	const so = Number(tho);
	return Number.isFinite(so) && so > 0 ? so : null;
}

function thuMucNguon() {
	const tho = giaTriCo(DO.co.thuMuc);
	if (tho === undefined) return THU_MUC_CA_QUY_4;
	const d = resolve(tho);
	return existsSync(d) && statSync(d).isDirectory() ? d : null;
}

function chepCa(nguon, ra) {
	rmSync(ra, { recursive: true, force: true });
	mkdirSync(ra, { recursive: true });
	for (const t of readdirSync(nguon).filter((x) => x.endsWith(".json")))
		cpSync(join(nguon, t), join(ra, t));
	writeFileSync(
		join(ra, `${DO.caDoiChung.id}.json`),
		`${JSON.stringify(DO.caDoiChung, null, "\t")}\n`,
	);
}

function napVaoKho(url) {
	const env = { ...process.env, DATABASE_URL: url };
	phienCookie(process.env.NGUOI ?? PHIEN_DO.nguoi, env);
	const nap = napBoMau(env);
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	return nap;
}

function chayEve(url, thuMucCa, tongKet, tran) {
	rmSync(tongKet, { force: true });
	const batDau = Date.now();
	const r = spawnSync(DO.eve, ["eval", ...DO.eval, "--verbose"], {
		cwd: AGENT,
		encoding: "utf8",
		env: {
			...process.env,
			PATH: duongPath(),
			DATABASE_URL: url,
			AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
			[DO.env.tongKet]: tongKet,
			[DO.env.tranUsd]: String(tran),
			[DO.env.thuMucCa]: thuMucCa,
			[DO.env.thuMucThem]: "",
			ZALO_BOT_TOKEN: "",
			CRM_TELEMETRY_DISABLED: "1",
		},
		timeout: DO.timeoutMs,
	});
	writeFileSync(join(DO.ra, "eve.log"), `${r.stdout}\n${r.stderr}`);
	return { ma: r.status, batDau };
}

function docTongKet(tep) {
	if (!existsSync(tep)) return new Map();
	return new Map(
		readFileSync(tep, "utf8")
			.split("\n")
			.filter(Boolean)
			.map((d, i) => docBanGhi(d, i))
			.map((g) => [g.ca, g]),
	);
}

function docJudge(batDau) {
	const goc = join(AGENT, ".eve/evals");
	if (!existsSync(goc)) return new Map();
	const moi = readdirSync(goc)
		.map((d) => join(goc, d))
		.filter((d) => existsSync(join(d, "summary.json")))
		.filter((d) => statSync(d).mtimeMs >= batDau)
		.sort()
		.at(-1);
	if (!moi) return new Map();
	const tom = JSON.parse(readFileSync(join(moi, "summary.json"), "utf8"));
	return new Map(
		(tom.evals ?? [])
			.flatMap((e) => e.assertions ?? [])
			.filter((a) => `${a.name}`.startsWith(DO.nhanJudge))
			.map((a) => [a.name.slice(DO.nhanJudge.length, -1), a.score ?? null]),
	);
}

function chaySoMoiLot(url, mucTieu) {
	if (mucTieu.length === 0) return new Set();
	const r = spawnSync("bun", [DO.soMoiLot, "--muc-tieu", mucTieu.join(",")], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, DATABASE_URL: url },
	});
	if (r.status !== 0)
		throw new Error(`so-moi-lot thoat ${r.status}: ${`${r.stderr}`.trim()}`);
	return new Set(
		`${r.stdout}`
			.trim()
			.split("\n")
			.map((d) => /^so-moi-lot: id (\S+) /.exec(d)?.[1])
			.filter(Boolean),
	);
}

async function tenThanhVien(url) {
	const ds = await truyVan(
		url,
		`SELECT u.name FROM member m JOIN "user" u ON u.id = m."userId"`,
	);
	return ds
		.map((d) => d.name)
		.filter(
			(t) =>
				`${t ?? ""}`.trim().split(/\s+/).length >=
				TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
		);
}

async function chiDaTieu(url) {
	const [chi] = await truyVan(
		url,
		`SELECT coalesce(sum("costUsd"), 0)::float8 AS usd FROM "aiChiPhi"`,
	);
	return Number(chi.usd);
}

function diemJudge(ca, ghi, diem) {
	const boViet = new Set(ca.filter((c) => c.bo === DO.boViet).map((c) => c.id));
	const so = [...ghi.values()]
		.filter((g) => boViet.has(g.ca))
		.flatMap((g) =>
			g.dong
				.filter(
					(d) => d.loai === "viet-lai" && d.trangThai === CHAM.trangThaiCho,
				)
				.map((d) => diem.get(`${g.ca} ${d.id}`) ?? null),
		)
		.filter((d) => d !== null);
	return {
		cap: so.length,
		tb: so.length === 0 ? null : so.reduce((s, d) => s + d, 0) / so.length,
	};
}

function ghiBangChung({ ketQua, dat, judge, chi, tran, nguon, runId }) {
	const dong = ketQua.map(
		({ ca, loi, phu }) =>
			`| ${ca.id} | ${ca.bo} | ${ca.donVi.ten} | ${loi.length === 0 ? "đạt" : "không đạt"} | ${loi.length === 0 ? (phu.length ? `phủ bởi luật lớp 7: ${phu.join(", ")}` : "—") : loi.join("; ").replaceAll("|", "/")} |`,
	);
	const judgeChu = judge.tb === null ? "—" : judge.tb.toFixed(2);
	writeFileSync(
		DO.bangChung,
		[
			"# Đo Kara góp ý trên bộ ca quý 4",
			"",
			`- Lượt: ${runId}`,
			`- Bộ ca: ${nguon.slice(GOC.length + 1)} (${ketQua.length} ca)`,
			`- Mô hình: ${TRO_LY_OKR.model} · judge ${TRO_LY_OKR.judge.model} (ZDR)`,
			`- Chốt mã: ${dat}/${ketQua.length} · judge: ${judgeChu} (${judge.cap} cặp, ngưỡng ${TRO_LY_OKR.judge.nguong})`,
			`- Ngưỡng ca mẫu 9b: ${DO.caMau9b.ma} · ${DO.caMau9b.judge}`,
			`- Tiền: ${chi.toFixed(6)} USD / trần ${tran} USD`,
			"",
			"| Ca | Bộ | Đơn vị | Kết quả | Lý do |",
			"|---|---|---|---|---|",
			...dong,
			"",
		].join("\n"),
	);
}

async function tongKet(url, eve, nguon, tran, tep) {
	const ca = docBoCaGopY(nguon);
	const ghi = docTongKet(tep);
	const diem = docJudge(eve.batDau);
	const ten = await tenThanhVien(url);
	const lotSoMoi = chaySoMoiLot(
		url,
		[...ghi.values()].map((g) => g.objectiveId),
	);
	const tuyChon = { ...TUY_CHON_CHAM, lotSoMoi, ten };
	const ketQua = ca.map((c) => ({
		ca: c,
		loi: chamCa(c, ghi.get(c.id), tuyChon),
		phu: phuBoiLuat7(c),
	}));
	for (const { ca: c, loi, phu } of ketQua)
		console.log(
			`${loi.length === 0 ? `DUNG ${c.id}` : `SAI ${c.id}: ${loi.join(" · ")}`}${phu.length ? ` · phu boi luat luot 7: ${phu.join(", ")}` : ""}`,
		);
	const dat = ketQua.filter((k) => k.loi.length === 0).length;
	const judge = diemJudge(ca, ghi, diem);
	const chi = await chiDaTieu(url);
	const runId = new Date().toISOString();
	console.log(
		`ma: ${dat}/${ca.length} · judge: ${judge.tb === null ? "—" : judge.tb.toFixed(2)} (${judge.cap} cap, nguong ${TRO_LY_OKR.judge.nguong}) · ca mau 9b: ${DO.caMau9b.ma} · ${DO.caMau9b.judge}`,
	);
	console.log(`chi: ${chi.toFixed(6)} USD / tran ${tran} USD`);
	if (eve.ma === null || eve.ma === 2)
		return khongDo(
			`eve eval ${eve.ma === null ? "sap hay het gio" : "bao loi cau hinh (ma 2)"} — xem ${join(DO.ra, "eve.log").slice(GOC.length + 1)}`,
		);
	const thieu = ca.filter((c) => !ghi.has(c.id)).map((c) => c.id);
	if (thieu.length > 0)
		return khongDo(
			`ca thieu ban ghi tong ket: ${thieu.join(", ")}${chi >= tran ? " — da cham tran tien" : ""}`,
		);
	ghiBangChung({ ketQua, dat, judge, chi, tran, nguon, runId });
	const doiChung = chamCa(DO.caDoiChung, ghi.get(DO.caDoiChung.id), tuyChon);
	if (doiChung.length === 0) {
		console.log(DO.thongDiep.doiChung);
		return 3;
	}
	console.log(`DOI CHUNG ${DO.caDoiChung.id}: bat duoc — ${doiChung[0]}`);
	return 0;
}

async function trongKho(url, nguon, tran) {
	const nap = napVaoKho(url);
	console.log(`kho ${DO.kho} · okr:mau --moc ${nap.moc}`);
	const thuMucCa = join(DO.ra, "ca");
	chepCa(nguon, thuMucCa);
	const tep = join(DO.ra, "tong-ket.jsonl");
	const eve = chayEve(url, thuMucCa, tep, tran);
	console.log(`eve eval ${DO.eval.join(" ")} thoat ${eve.ma}`);
	return tongKet(url, eve, nguon, tran, tep);
}

async function main() {
	if (!tuKiem()) return 1;
	if (process.argv.includes(DO.co.tuKiem)) return 0;
	const tran = tranUsd();
	if (tran === null)
		return khongDo(
			`${DO.co.tranUsd} can mot so duong, nhan «${giaTriCo(DO.co.tranUsd) ?? ""}»`,
		);
	const nguon = thuMucNguon();
	if (nguon === null)
		return khongDo(
			`${DO.co.thuMuc} can mot thu muc co that, nhan «${giaTriCo(DO.co.thuMuc) ?? ""}»`,
		);
	if (!coKhoaMoHinh()) return khongDo(cauThieuKhoa());
	mkdirSync(DO.ra, { recursive: true });
	let url;
	try {
		url = taoKho(DO.kho);
	} catch (loi) {
		return khongDo(loi?.message ?? String(loi));
	}
	let ma;
	try {
		ma = await trongKho(url, nguon, tran);
	} catch (loi) {
		ma = khongDo(loi?.message ?? String(loi));
	}
	if (!xoaKho(DO.kho)) {
		console.log(`DON HONG: khong xoa duoc kho ${DO.kho}`);
		if (ma === 0) ma = 2;
	}
	return ma;
}

process.exit(await main());
