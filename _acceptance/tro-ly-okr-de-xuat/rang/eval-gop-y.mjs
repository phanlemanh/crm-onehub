import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { TRO_LY_OKR } from "../../../apps/agent/agent/lib/okr/config.ts";
import {
	docBoCaGopY,
	THU_MUC_CA_MAU,
} from "../../../apps/agent/evals/okr/ca-gop-y.ts";
import { TRO_LY_OKR_TRAN } from "../../../packages/db/src/okr-tro-ly-danh-muc.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import { ghiHieuChinh } from "./hieu-chinh.mjs";
import {
	AGENT,
	cauThieuKhoa,
	coKhoaMoHinh,
	duongPath,
	GOC,
	napBoMau,
	phienCookie,
	RA,
	taoKho,
	truyVan,
	xoaKho,
} from "./phien-tro-ly.mjs";

const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);

const PHUT_MS = 60_000;

const E22 = {
	kho: "tdx-e22",
	timeoutMs: 120 * PHUT_MS,
	boViet: "viet-lai",
	boNg: "ng",
	truongCuaVanDe: {
		"kr-la-viec": ["kr.title"],
		"khong-do-duoc": ["kr.title"],
		"thieu-doi-trong": ["kr.title"],
		"trung-y": ["kr.title"],
		"muc-tieu-la-so": ["title"],
	},
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
			"Ca đối chứng: Mục tiêu nói việc làm, kỳ vọng khongGopY cố ý sai — bài phải bắt được.",
	},
	eval: ["okr/gop-y", "okr/ng"],
	evalCuaBo: { "viet-lai": "okr/gop-y", ng: "okr/ng" },
	thamSoCa: "--ca",
	tuKiem: [
		{ van: "Nâng chất lượng dịch vụ", cum: "lương", khop: false },
		{ van: "Nâng chất lượng dịch vụ", cum: "chat", khop: false },
		{ van: "Không bàn chuyện tăng lương", cum: "lương", khop: true },
		{ van: "Tăng lương, thưởng quý", cum: "thưởng", khop: true },
		{ van: "Xếp loại nhân viên cuối năm", cum: "xếp loại", khop: true },
	],
	tuKiemTen: [
		{ van: "Anh Nguyễn Văn An phụ trách", ten: "Nguyễn Văn An", khop: true },
		{ van: "Tăng doanh thu an toàn", ten: "Văn An", khop: false },
		{ van: "Phạm Thị Hoa", ten: "Thị Hoa", khop: true },
		{ van: "Phạm Thị Hoan", ten: "Thị Hoa", khop: false },
	],
	nhanJudge: "judge.autoevals.closedQA [",
	thongDiep: {
		doiChung: "ca doi chung khong bat duoc",
		doiChungKhongGhi: "ca doi chung khong co ban ghi",
	},
	env: TRO_LY_OKR.danhGia.env,
};

const dongGhi = z.object({
	id: z.string(),
	loai: z.string(),
	keyResultId: z.string().nullable(),
	truong: z.string().nullable(),
	truoc: z.string().nullable(),
	sau: z.string().nullable(),
	maVanDe: z.string().nullable(),
	lyDo: z.string(),
	trangThai: z.string(),
	maLoai: z.string().nullable(),
});

const banGhiCa = z.object({
	ca: z.string(),
	bo: z.string(),
	objectiveId: z.string(),
	capTrenKr: z.array(z.string()),
	taskId: z.string(),
	outcome: z.string().nullable(),
	dong: z.array(dongGhi),
});

const tomTatEve = z.object({
	evals: z.array(
		z.object({
			assertions: z.array(
				z.object({ name: z.string(), score: z.number().nullable().optional() }),
			),
		}),
	),
});

const MA_CAM_NG = TRO_LY_OKR.danhGia.maCamNg;
if (MA_CAM_NG.length === 0) {
	console.log("KHONG DO DUOC: ma cam NG rong sau khi loc theo MA_LOAI_DE_XUAT");
	process.exit(2);
}

const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");
const THU_MUC = join(RA, "e22");
const HIEU_CHINH = join(
	GOC,
	"_acceptance/tro-ly-okr-de-xuat/evidence/hieu-chinh-judge.md",
);
const SO_MOI_LOT = join(
	GOC,
	"_acceptance/tro-ly-okr-de-xuat/rang/so-moi-lot.mjs",
);
const EVE = join(AGENT, "node_modules/.bin/eve");

const chiDungKho = process.argv.includes("--kho");
const chiCa = (() => {
	const i = process.argv.indexOf(E22.thamSoCa);
	if (i < 0) return null;
	const id = `${process.argv[i + 1] ?? ""}`.trim();
	if (!/^[a-z0-9-]+$/.test(id)) {
		console.log(`KHONG DO DUOC: ${E22.thamSoCa} can ma ca, vi du gy-06`);
		process.exit(2);
	}
	return id;
})();
const THU_MUC_LUOT = chiCa ? join(RA, `e22-ca-${chiCa}`) : THU_MUC;
const tranUsd = (() => {
	const i = process.argv.indexOf("--tran-usd");
	if (i < 0) return TRO_LY_OKR.danhGia.tranUsdMacDinh;
	const so = Number(process.argv[i + 1]);
	if (!Number.isFinite(so) || so <= 0) {
		console.log(
			`KHONG DO DUOC: --tran-usd can mot so duong, nhan «${process.argv[i + 1] ?? ""}»`,
		);
		process.exit(2);
	}
	return so;
})();

function caDon() {
	if (chiCa === E22.caDoiChung.id) return E22.caDoiChung;
	return docBoCaGopY(THU_MUC_CA_MAU).find((c) => c.id === chiCa) ?? null;
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	return 2;
}

const TONG_KET = join(THU_MUC_LUOT, "tong-ket.jsonl");
const CA_THEM = join(THU_MUC_LUOT, "ca-them");

const boDau = (chu) =>
	`${chu ?? ""}`
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.replace(/\s+/g, " ")
		.trim();

const chuanTu = (chu) =>
	`${chu ?? ""}`
		.normalize("NFC")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join(" ");

const coNguyenTu = (van, cum) => cum !== "" && ` ${van} `.includes(` ${cum} `);

const coTuCam = (van, tu) => coNguyenTu(chuanTu(van), chuanTu(tu));

const coTen = (van, ten) =>
	coNguyenTu(chuanTu(boDau(van)), chuanTu(boDau(ten)));

function tuKiemSo() {
	const sai = [
		...E22.tuKiem
			.filter((c) => coTuCam(c.van, c.cum) !== c.khop)
			.map((c) => `tu-cam «${c.cum}» trong «${c.van}» phai ${c.khop}`),
		...E22.tuKiemTen
			.filter((c) => coTen(c.van, c.ten) !== c.khop)
			.map((c) => `noi-ve-nguoi «${c.ten}» trong «${c.van}» phai ${c.khop}`),
	];
	return sai;
}

function napVaoKho(url) {
	const env = { ...process.env, DATABASE_URL: url };
	phienCookie(process.env.NGUOI ?? PHIEN_DO.nguoi, env);
	const nap = napBoMau(env);
	if (nap.ma !== 0)
		throw new Error(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	return nap;
}

async function demBoMau(url) {
	const [dem] = await truyVan(
		url,
		`SELECT
			(SELECT count(*)::int FROM "user" WHERE email LIKE '%@mau.onehub.test') AS nguoi,
			(SELECT count(*)::int FROM department WHERE id LIKE 'mau-okr-%') AS phong,
			(SELECT count(*)::int FROM "okrObjective" WHERE id LIKE 'mau-okr-%') AS muc_tieu`,
	);
	return dem;
}

function chayEve(url) {
	rmSync(TONG_KET, { force: true });
	rmSync(CA_THEM, { recursive: true, force: true });
	mkdirSync(CA_THEM, { recursive: true });
	writeFileSync(
		join(CA_THEM, `${E22.caDoiChung.id}.json`),
		`${JSON.stringify(E22.caDoiChung, null, "\t")}\n`,
	);
	const batDau = Date.now();
	const lenh = chiCa
		? ["eval", E22.evalCuaBo[caDon().bo], "--tag", chiCa, "--verbose"]
		: ["eval", ...E22.eval, "--verbose"];
	const r = spawnSync(EVE, lenh, {
		cwd: AGENT,
		encoding: "utf8",
		env: {
			...process.env,
			PATH: duongPath(),
			DATABASE_URL: url,
			AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
			[E22.env.tongKet]: TONG_KET,
			[E22.env.tranUsd]: String(tranUsd),
			[E22.env.thuMucThem]: CA_THEM,
			ZALO_BOT_TOKEN: "",
			CRM_TELEMETRY_DISABLED: "1",
		},
		timeout: E22.timeoutMs,
	});
	writeFileSync(join(THU_MUC_LUOT, "eve.log"), `${r.stdout}\n${r.stderr}`);
	return { ma: r.status, batDau, lenh: lenh.join(" ") };
}

function docTongKet() {
	if (!existsSync(TONG_KET)) return new Map();
	return new Map(
		readFileSync(TONG_KET, "utf8")
			.split("\n")
			.filter(Boolean)
			.map((d, i) => {
				const r = banGhiCa.safeParse(JSON.parse(d));
				if (!r.success)
					throw new Error(
						`tong-ket dong ${i + 1} sai khuon: ${r.error.message}`,
					);
				return r.data;
			})
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
	const doc = tomTatEve.safeParse(
		JSON.parse(readFileSync(join(moi, "summary.json"), "utf8")),
	);
	if (!doc.success)
		throw new Error(`summary.json cua eve sai khuon: ${doc.error.message}`);
	return new Map(
		doc.data.evals
			.flatMap((e) => e.assertions)
			.filter((a) => a.name.startsWith(E22.nhanJudge))
			.map((a) => [a.name.slice(E22.nhanJudge.length, -1), a.score ?? null]),
	);
}

function chaySoMoiLot(url, mucTieu) {
	if (mucTieu.length === 0) return new Set();
	const r = spawnSync("bun", [SO_MOI_LOT, "--muc-tieu", mucTieu.join(",")], {
		cwd: GOC,
		encoding: "utf8",
		env: { ...process.env, DATABASE_URL: url },
	});
	if (r.status !== 0)
		throw new Error(`so-moi-lot thoat ${r.status}: ${`${r.stderr}`.trim()}`);
	const dong = `${r.stdout}`.trim().split("\n");
	console.log(dong[0]);
	return new Set(
		dong.map((d) => /^so-moi-lot: id (\S+) /.exec(d)?.[1]).filter(Boolean),
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
				chuanTu(boDau(t)).split(" ").length >=
				TRO_LY_OKR_TRAN.soChuHoTenToiThieu,
		);
}

const chuCua = (d) => `${d.sau ?? ""} ${d.lyDo ?? ""}`;

function kiemNg(ca, ghi, cho, ten) {
	const loi = [];
	const cam = cho.filter((d) => MA_CAM_NG.includes(d.maLoai));
	if (cam.length > 0)
		loi.push(`ng co dong ${cam.map((d) => `${d.maLoai}:${d.id}`).join(", ")}`);
	const capTren = (ghi.capTrenKr ?? []).map(boDau);
	const chep = cho.filter(
		(d) =>
			d.loai === "viet-lai" &&
			d.truong === "title" &&
			capTren.includes(boDau(d.sau)),
	);
	if (chep.length > 0)
		loi.push(`ng chep-cap-tren: ${chep.map((d) => d.id).join(", ")}`);
	const nguoi = cho.filter((d) => ten.some((t) => coTen(chuCua(d), t)));
	if (nguoi.length > 0)
		loi.push(`ng noi-ve-nguoi: ${nguoi.map((d) => d.id).join(", ")}`);
	const dauVao = [
		ca.mucTieu.title,
		ca.mucTieu.whyNow,
		...ca.krs.map((k) => k.title),
	].join(" ");
	const cum = TRO_LY_OKR_TRAN.tuCam.filter((c) => !coTuCam(dauVao, c));
	const tuCam = cho.filter((d) => cum.some((c) => coTuCam(chuCua(d), c)));
	if (tuCam.length > 0)
		loi.push(`ng tu-cam: ${tuCam.map((d) => d.id).join(", ")}`);
	return loi;
}

function kiemCa(ca, ghi, lotSoMoi, ten) {
	if (!ghi)
		return ["khong co ban ghi — eval khong chay toi cuoi (xem eve.log)"];
	const loi = [];
	if (!`${ghi.outcome ?? ""}`.startsWith("da-nop"))
		loi.push(`viec dong bang ${ghi.outcome ?? "(chua dong)"}`);
	const cho = ghi.dong.filter((d) => d.trangThai === "cho");
	const lot = ghi.dong.filter((d) => lotSoMoi.has(d.id)).map((d) => d.id);
	if (lot.length > 0) loi.push(`so moi con lai: ${lot.join(", ")}`);
	const vietLai = cho.filter((d) => d.loai === "viet-lai");
	if (ca.kyVong.khongGopY && vietLai.length > 0)
		loi.push(`khongGopY nhung co ${vietLai.length} dong viet lai`);
	for (const vd of ca.kyVong.vanDe) {
		const truong = E22.truongCuaVanDe[vd] ?? [];
		const trung = cho.some(
			(d) =>
				d.maVanDe === vd ||
				(d.loai === "viet-lai" && truong.includes(d.truong)),
		);
		if (!trung)
			loi.push(`van de ${vd}: khong dong nao dung truong hay dung maVanDe`);
	}
	if (ca.bo === E22.boNg) loi.push(...kiemNg(ca, ghi, cho, ten));
	return loi;
}

async function tongKetMotCa(url, eve) {
	const c = caDon();
	const ghi = docTongKet();
	const diem = docJudge(eve.batDau);
	const ten = await tenThanhVien(url);
	const g = ghi.get(c.id);
	const lotSoMoi = chaySoMoiLot(url, g ? [g.objectiveId] : []);
	const loi = kiemCa(c, g, lotSoMoi, ten);
	console.log(
		loi.length === 0 ? `DUNG ${c.id}` : `SAI ${c.id}: ${loi.join(" · ")}`,
	);
	for (const d of g?.dong ?? []) {
		const nhan = `${c.id} ${d.id}`;
		console.log(
			`dong ${d.id} ${d.loai} ${d.truong ?? "-"} ${d.trangThai}${d.maLoai ? ` ${d.maLoai}` : ""}: «${d.truoc ?? ""}» → «${d.sau ?? ""}»${diem.has(nhan) ? ` · judge ${diem.get(nhan)}` : ""}`,
		);
	}
	const [chi] = await truyVan(
		url,
		`SELECT coalesce(sum("costUsd"), 0)::float8 AS usd FROM "aiChiPhi"`,
	);
	console.log(
		`chi: ${Number(chi.usd).toFixed(6)} USD / tran ${tranUsd} USD · judge: ${diem.size} cap co diem`,
	);
	console.log(
		`${E22.thamSoCa} ${c.id}: khong ghi ${HIEU_CHINH.slice(GOC.length + 1)}, khong chay ca doi chung — log o ${THU_MUC_LUOT.slice(GOC.length + 1)}/eve.log`,
	);
	if (eve.ma === null || eve.ma === 2)
		return khongDo(
			`eve eval ${eve.ma === null ? "sap hay het gio" : "bao loi cau hinh (ma 2)"} — xem ${THU_MUC_LUOT.slice(GOC.length + 1)}/eve.log`,
		);
	return loi.length === 0 ? 0 : 1;
}

async function tongKet(url, eve) {
	if (chiCa) return tongKetMotCa(url, eve);
	const ca = docBoCaGopY(THU_MUC_CA_MAU);
	const ghi = docTongKet();
	const diem = docJudge(eve.batDau);
	const ten = await tenThanhVien(url);
	const mucTieu = [...ghi.values()].map((g) => g.objectiveId);
	const lotSoMoi = chaySoMoiLot(url, mucTieu);

	const ketQua = ca.map((c) => ({
		ca: c,
		loi: kiemCa(c, ghi.get(c.id), lotSoMoi, ten),
	}));
	for (const { ca: c, loi } of ketQua) {
		console.log(
			loi.length === 0 ? `DUNG ${c.id}` : `SAI ${c.id}: ${loi.join(" · ")}`,
		);
	}

	const doiChung = kiemCa(
		E22.caDoiChung,
		ghi.get(E22.caDoiChung.id),
		lotSoMoi,
		ten,
	);
	const batDuoc = doiChung.some((l) => l.startsWith("khongGopY"));
	console.log(
		`DOI CHUNG ${E22.caDoiChung.id}: ${doiChung.length === 0 ? "khong loi nao" : doiChung.join(" · ")}`,
	);

	const boViet = new Set(
		ca.filter((c) => c.bo === E22.boViet).map((c) => c.id),
	);
	const cap = [...ghi.values()]
		.filter((g) => boViet.has(g.ca))
		.sort((a, b) => a.ca.localeCompare(b.ca))
		.flatMap((g) =>
			g.dong
				.filter((d) => d.loai === "viet-lai" && d.trangThai === "cho")
				.map((d) => ({
					ca: g.ca,
					truong: d.truong,
					truoc: d.truoc,
					sau: d.sau,
					diem: diem.get(`${g.ca} ${d.id}`) ?? null,
				})),
		);
	const coDiem = cap.map((c) => c.diem).filter((d) => d !== null);
	const judge =
		coDiem.length === 0
			? null
			: coDiem.reduce((s, d) => s + d, 0) / coDiem.length;
	const hc = ghiHieuChinh({
		tep: HIEU_CHINH,
		cap,
		judge,
		soCa: boViet.size,
		moHinh: TRO_LY_OKR.judge.model,
		runId: RUN_ID,
	});

	const [chi] = await truyVan(
		url,
		`SELECT coalesce(sum("costUsd"), 0)::float8 AS usd FROM "aiChiPhi"`,
	);
	const dat = ketQua.filter((k) => k.loi.length === 0).length;
	console.log(
		`chi: ${Number(chi.usd).toFixed(6)} USD / tran ${tranUsd} USD${Number(chi.usd) >= tranUsd ? " — da cham tran, ca con lai bi bo qua" : ""}`,
	);
	console.log(
		hc.giu
			? `hieu chinh da cham (${hc.daCham} o) — giu nguyen ${HIEU_CHINH.slice(GOC.length + 1)}, ban moi ${hc.soCap} cap → ${hc.tep.slice(GOC.length + 1)}`
			: `hieu chinh: ${hc.soCap} cap → ${hc.tep.slice(GOC.length + 1)}`,
	);
	console.log(
		`ma: ${dat}/${ca.length} · judge: ${judge === null ? "—" : judge.toFixed(2)} (${coDiem.length} cap, nguong ${TRO_LY_OKR.judge.nguong})`,
	);

	if (eve.ma === null || eve.ma === 2)
		return khongDo(
			`eve eval ${eve.ma === null ? "sap hay het gio" : "bao loi cau hinh (ma 2)"} — xem .acceptance-runs/tro-ly-okr-de-xuat/e22/eve.log`,
		);
	if (!ghi.has(E22.caDoiChung.id))
		return khongDo(E22.thongDiep.doiChungKhongGhi);
	if (!batDuoc) {
		console.log(E22.thongDiep.doiChung);
		return 3;
	}
	return dat === ca.length ? 0 : 1;
}

async function trongKho(url) {
	const nap = napVaoKho(url);
	const dem = await demBoMau(url);
	console.log(
		`kho ${E22.kho} · okr:mau --moc ${nap.moc}: ${dem.nguoi} nguoi mau, ${dem.phong} phong ban, ${dem.muc_tieu} muc tieu`,
	);
	if (dem.nguoi === 0 || dem.muc_tieu === 0)
		return khongDo("kho khong co bo OKR mau sau khi nap");
	if (chiDungKho) {
		console.log("--kho: chi dung kho va nap bo mau, khong goi mo hinh");
		return 0;
	}
	const eve = chayEve(url);
	console.log(`eve ${eve.lenh} thoat ${eve.ma}`);
	return tongKet(url, eve);
}

async function main() {
	const saiTuKiem = tuKiemSo();
	if (saiTuKiem.length > 0)
		return khongDo(`tu kiem thuoc so sai: ${saiTuKiem.join(" · ")}`);
	console.log(
		`tu kiem thuoc so: ${E22.tuKiem.length + E22.tuKiemTen.length} ca dung (nguyen tu, giu dau)`,
	);
	if (chiCa && !caDon())
		return khongDo(`${E22.thamSoCa} ${chiCa}: khong co ca nay trong bo mau`);
	if (!chiDungKho && !coKhoaMoHinh()) return khongDo(cauThieuKhoa());
	mkdirSync(THU_MUC_LUOT, { recursive: true });
	let url;
	try {
		url = taoKho(E22.kho);
	} catch (loi) {
		return khongDo(loi?.message ?? String(loi));
	}
	let ma;
	try {
		ma = await trongKho(url);
	} catch (loi) {
		ma = khongDo(loi?.message ?? String(loi));
	}
	if (!xoaKho(E22.kho)) {
		console.log(`DON HONG: khong xoa duoc kho ${E22.kho}`);
		if (ma === 0) ma = 2;
	}
	return ma;
}

process.exit(await main());
