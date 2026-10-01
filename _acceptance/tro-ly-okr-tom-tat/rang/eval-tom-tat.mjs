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
import { TRO_LY_OKR_TRAN } from "../../../packages/db/src/okr-tro-ly-danh-muc.ts";
import { PHIEN_DO } from "../../../scripts/lan-do/cau-hinh.mjs";
import {
	AGENT,
	cauThieuKhoa,
	coKhoaMoHinh,
	duongPath,
	GOC,
	napBoMau,
	ngayVN,
	phienCookie,
	taoKho,
	truyVan,
	xoaKho,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";
import { soLechTrongKho } from "./so-lech-lot.mjs";

const { z } = createRequire(join(GOC, "packages/validation/package.json"))(
	"zod",
);

const PHUT_MS = 60_000;
const NGAY_MS = 24 * 60 * PHUT_MS;

const E17 = {
	kho: "tts-e17",
	eval: "okr/tom-tat",
	timeoutMs: 60 * PHUT_MS,
	soMoc: 2,
	cachMocNgay: 14,
	ngayCapNhat: 1,
	tyLeBoToiDa: 0.1,
	nhanJudge: "judge.autoevals.closedQA [tom-tat ",
	co: {
		tranUsd: "--tran-usd",
		moc: "--moc",
		kho: "--kho",
		chamLai: "--cham-lai",
	},
	thongDiep: {
		khongBan: "khong ban nao",
		chamTran: "cham tran chay",
		judgeNgoaiSo:
			"chua gom tien judge: judge goi Gateway truc tiep, khong ghi vao AiChiPhi",
	},
	env: TRO_LY_OKR.danhGia.env,
};

const RA = join(GOC, ".acceptance-runs/tro-ly-okr-tom-tat/e17");
const EVE = join(AGENT, "node_modules/.bin/eve");

const cauGiu = z.object({ vanBan: z.string(), nguon: z.array(z.string()) });

const banGhi = z.object({
	moc: z.string(),
	taskId: z.string(),
	departmentId: z.string(),
	phong: z.string(),
	nac: z.enum(["bat", "an"]),
	outcome: z.string().nullable(),
	tomTatId: z.string().nullable(),
	trangThai: z.string().nullable(),
	cau: z.array(cauGiu),
	bo: z.array(cauGiu.extend({ maBo: z.string() })),
	krTut: z.array(z.string()),
	krCuaNguon: z.record(z.string(), z.string()),
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

function giaTriCo(ten) {
	const i = process.argv.indexOf(ten);
	return i < 0 ? null : (process.argv[i + 1] ?? "");
}

function khongDo(cau) {
	console.log(`KHONG DO DUOC: ${cau}`);
	return 2;
}

function tranUsd() {
	const tho = giaTriCo(E17.co.tranUsd);
	if (tho === null) return TRO_LY_OKR.danhGia.tranUsdMacDinh;
	const so = Number(tho);
	return Number.isFinite(so) && so > 0 ? so : null;
}

function thuCua(ngay) {
	const thu = new Date(`${ngay}T00:00:00Z`).getUTCDay();
	return ((thu + 6) % 7) + 1;
}

function congNgay(ngay, so) {
	return new Date(Date.parse(`${ngay}T00:00:00Z`) + so * NGAY_MS)
		.toISOString()
		.slice(0, 10);
}

function mocMacDinh() {
	const sauCapNhat = (E17.ngayCapNhat % 7) + 1;
	let ngay = congNgay(ngayVN(), -1);
	while (thuCua(ngay) !== sauCapNhat) ngay = congNgay(ngay, -1);
	return Array.from({ length: E17.soMoc }, (_, i) =>
		congNgay(ngay, -i * E17.cachMocNgay),
	);
}

function cacMoc() {
	const tho = giaTriCo(E17.co.moc);
	if (tho === null) return mocMacDinh();
	const ds = tho.split(",").filter(Boolean);
	return ds.length === E17.soMoc &&
		ds.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
		? ds
		: null;
}

const boDau = (chu) =>
	`${chu ?? ""}`
		.normalize("NFD")
		.replace(/\p{M}/gu, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase();

const chuanTu = (chu) =>
	`${chu ?? ""}`
		.normalize("NFC")
		.toLowerCase()
		.split(/[^\p{L}\p{N}]+/u)
		.filter(Boolean)
		.join(" ");

const coTen = (van, ten) => {
	const cum = chuanTu(boDau(ten));
	return cum !== "" && ` ${chuanTu(boDau(van))} `.includes(` ${cum} `);
};

function docTongKet(tep) {
	if (!existsSync(tep)) return [];
	return readFileSync(tep, "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d, i) => {
			const r = banGhi.safeParse(JSON.parse(d));
			if (!r.success)
				throw new Error(`${tep} dong ${i + 1} sai khuon: ${r.error.message}`);
			return r.data;
		});
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
			.filter((a) => a.name.startsWith(E17.nhanJudge))
			.map((a) => [a.name.slice(E17.nhanJudge.length, -1), a.score ?? null]),
	);
}

function goiEve(url, tongKet, tran) {
	rmSync(tongKet, { force: true });
	const batDau = Date.now();
	const r = spawnSync(EVE, ["eval", E17.eval, "--verbose"], {
		cwd: AGENT,
		encoding: "utf8",
		env: {
			...process.env,
			PATH: duongPath(),
			DATABASE_URL: url,
			AGENT_BRIDGE_SECRET: randomBytes(24).toString("hex"),
			[E17.env.tongKet]: tongKet,
			[E17.env.tranUsd]: String(tran),
			ZALO_BOT_TOKEN: "",
			CRM_TELEMETRY_DISABLED: "1",
		},
		timeout: E17.timeoutMs,
	});
	return { ma: r.status, batDau, log: `${r.stdout}\n${r.stderr}` };
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

async function chiDaTieu(url) {
	const [chi] = await truyVan(
		url,
		`SELECT coalesce(sum("costUsd"), 0)::float8 AS usd FROM "aiChiPhi"`,
	);
	return Number(chi.usd);
}

function chamBan(ban, { lech, ten, judge }) {
	const loi = [];
	if (!`${ban.outcome ?? ""}`.startsWith("da-nop"))
		loi.push(`viec dong bang ${ban.outcome ?? "(chua dong)"}`);
	const soLech = lech.filter((l) => l.ban === ban.tomTatId);
	if (soLech.length > 0)
		loi.push(
			`so lech: ${soLech.map((l) => `cau ${l.cau} «${l.so}»`).join(", ")}`,
		);
	const krDan = new Set(
		ban.cau.flatMap((c) => c.nguon.map((id) => ban.krCuaNguon[id])),
	);
	const tutSot = ban.krTut.filter((kr) => !krDan.has(kr));
	if (tutSot.length > 0) loi.push(`kr tut khong co cau: ${tutSot.join(", ")}`);
	const coTenNguoi = ban.cau.filter((c) => ten.some((t) => coTen(c.vanBan, t)));
	if (coTenNguoi.length > 0)
		loi.push(
			`cau neu ho ten: ${coTenNguoi.map((c) => `«${c.vanBan}»`).join(", ")}`,
		);
	const diem = judge.get(ban.departmentId);
	return {
		loi,
		dong: `${loi.length === 0 ? "DUNG" : "SAI"} ban ${ban.moc.slice(0, 10)} ${ban.phong} nac=${ban.nac} trang-thai=${ban.trangThai ?? "-"} cau=${ban.cau.length} bo=${ban.bo.length} lech=${soLech.length} tut=${ban.krTut.length - tutSot.length}/${ban.krTut.length} judge=${diem === undefined || diem === null ? "—" : diem.toFixed(2)}${loi.length > 0 ? ` — ${loi.join(" · ")}` : ""}`,
	};
}

function chamTatCa(theoMoc) {
	const dong = [];
	let sai = 0;
	let tongCau = 0;
	let tongBo = 0;
	for (const m of theoMoc) {
		const coBan = m.ban.filter((b) => b.tomTatId !== null);
		if (coBan.length === 0) {
			dong.push(
				`${E17.thongDiep.khongBan}: moc ${m.moc} (${m.ban.length} viec)`,
			);
			return { ma: 3, dong };
		}
		for (const b of m.ban) {
			const kq = chamBan(b, m);
			dong.push(kq.dong);
			if (kq.loi.length > 0) sai += 1;
			tongCau += b.cau.length + b.bo.length;
			tongBo += b.bo.length;
		}
	}
	const tyLe = tongCau === 0 ? 0 : tongBo / tongCau;
	const quaBo = tyLe <= E17.tyLeBoToiDa;
	dong.push(
		`${quaBo ? "DUNG" : "SAI"} cau bi bo ${tongBo}/${tongCau} = ${(tyLe * 100).toFixed(1)}% (nguong ${E17.tyLeBoToiDa * 100}%)`,
	);
	return { ma: sai === 0 && quaBo ? 0 : 1, dong };
}

function chamLai(dsTep) {
	console.log(
		`${E17.co.chamLai}: ${dsTep.length} tep tong-ket — khong goi model, khong dung kho; so-lech-lot va ho ten can kho nen bo qua`,
	);
	const theoMoc = dsTep.map((tep) => ({
		moc: tep,
		ban: docTongKet(tep),
		lech: [],
		ten: [],
		judge: new Map(),
	}));
	const kq = chamTatCa(theoMoc);
	for (const d of kq.dong) console.log(d);
	return kq.ma;
}

async function motMoc(moc, i, tran) {
	const ten = `${E17.kho}-${i + 1}`;
	const url = taoKho(ten);
	try {
		const env = { ...process.env, DATABASE_URL: url };
		phienCookie(process.env.NGUOI ?? PHIEN_DO.nguoi, env);
		const nap = napBoMau(env, moc);
		if (nap.ma !== 0)
			throw new Error(`okr:mau --moc ${moc} thoat ${nap.ma}: ${nap.dong}`);
		console.log(`kho ${ten} · okr:mau --moc ${moc}: ${nap.dong}`);
		if (process.argv.includes(E17.co.kho)) {
			const [dem] = await truyVan(
				url,
				`SELECT (SELECT count(*)::int FROM department WHERE id LIKE 'mau-okr-%') AS phong,
					(SELECT count(*)::int FROM "okrCheckIn") AS lan`,
			);
			console.log(
				`${E17.co.kho}: ${dem.phong} phong ban, ${dem.lan} lan cap nhat — khong goi model`,
			);
			return { moc, ban: [], lech: [], ten: [], judge: new Map(), chi: 0 };
		}
		const tongKet = join(RA, `tong-ket-${moc}.jsonl`);
		const eve = goiEve(url, tongKet, tran);
		const tepLog = join(RA, `eve-${moc}.log`);
		writeFileSync(tepLog, eve.log);
		console.log(
			`eve eval ${E17.eval} (moc ${moc}) thoat ${eve.ma} — log ${tepLog.slice(GOC.length + 1)}`,
		);
		if (eve.ma === null || eve.ma === 2)
			return {
				hong: `eve eval ${eve.ma === null ? "sap hay het gio" : "bao loi cau hinh (ma 2)"} o moc ${moc}`,
			};
		if (!existsSync(tongKet))
			return {
				hong: `eve eval thoat ${eve.ma} ma khong ghi tong ket o moc ${moc} — eval bi bo qua (kho, khoa hay tran) hoac hong truoc khi chay`,
			};
		const ban = docTongKet(tongKet);
		const ids = ban.map((b) => b.tomTatId).filter(Boolean);
		const lech =
			ids.length === 0 ? [] : (await soLechTrongKho(url, { ban: ids })).lech;
		const chi = await chiDaTieu(url);
		return {
			moc,
			ban,
			lech,
			ten: await tenThanhVien(url),
			judge: docJudge(eve.batDau),
			chi,
		};
	} finally {
		if (!xoaKho(ten)) console.log(`DON HONG: khong xoa duoc kho ${ten}`);
	}
}

async function main() {
	const tepChamLai = giaTriCo(E17.co.chamLai);
	if (tepChamLai !== null)
		return chamLai(tepChamLai.split(",").filter(Boolean));
	const tran = tranUsd();
	if (tran === null)
		return khongDo(
			`${E17.co.tranUsd} can mot so duong, nhan «${giaTriCo(E17.co.tranUsd)}»`,
		);
	const moc = cacMoc();
	if (moc === null)
		return khongDo(
			`${E17.co.moc} can ${E17.soMoc} ngay YYYY-MM-DD cach nhau bang dau phay`,
		);
	const chiDungKho = process.argv.includes(E17.co.kho);
	if (!chiDungKho && !coKhoaMoHinh()) return khongDo(cauThieuKhoa());
	mkdirSync(RA, { recursive: true });
	console.log(`moc: ${moc.join(", ")} · tran ${tran} USD`);
	const theoMoc = [];
	for (const [i, m] of moc.entries()) {
		let kq;
		try {
			kq = await motMoc(m, i, tran);
		} catch (loi) {
			return khongDo(loi?.message ?? String(loi));
		}
		if (kq.hong) return khongDo(kq.hong);
		theoMoc.push(kq);
		if (chiDungKho) continue;
		console.log(
			`chi moc ${m}: ${kq.chi.toFixed(6)} USD theo AiChiPhi / tran ${tran} USD moi moc — ${E17.thongDiep.judgeNgoaiSo}`,
		);
		if (kq.chi >= tran)
			return khongDo(
				`${E17.thongDiep.chamTran} ${tran} USD o moc ${m} — dung, khong chay moc ke`,
			);
	}
	if (chiDungKho) return 0;
	const kq = chamTatCa(theoMoc);
	for (const d of kq.dong) console.log(d);
	return kq.ma;
}

process.exit(await main());
