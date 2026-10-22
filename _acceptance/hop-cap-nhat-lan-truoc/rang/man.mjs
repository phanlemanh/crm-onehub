import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TEP = fileURLToPath(import.meta.url);
const HERE = dirname(TEP);
const GOC = join(HERE, "..", "..", "..");
const ANH = process.env.BANG_CHUNG
	? join(GOC, process.env.BANG_CHUNG)
	: join(GOC, "_acceptance/hop-cap-nhat-lan-truoc/evidence");
const CA_MAN = join(GOC, "_acceptance/ngan-kr-mot-cho/rang/ca-man.json");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		375: { rong: 375, cao: 812 },
	},
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500, kr: 10 * GIAY_MS },
	soAnh: 2,
	rongChen: "4000px",
	ghiChu: { dai: 200, dauLien: 40 },
};
const CONG_CAM = new Set(["3000", "3001"]);

export function congCuaUrl(url) {
	const u = new URL(url);
	return u.port || (u.protocol === "https:" ? "443" : "80");
}

export function ghiChuDai() {
	const dau = "Hopdongkhungvoidoitacphiabacdaduyetxong".padEnd(
		MAN.ghiChu.dauLien,
		"x",
	);
	const than = " chờ pháp chế ký phụ lục, tuần tới gửi bản cuối cho khách";
	return (dau + than.repeat(MAN.ghiChu.dai)).slice(0, MAN.ghiChu.dai);
}

function doTran(rongChen) {
	const trang = document.scrollingElement ?? document.documentElement;
	const tran = () => trang.scrollWidth > trang.clientWidth + 1;
	const truoc = tran();
	const rong = document.createElement("div");
	rong.style.width = rongChen;
	rong.style.height = "1px";
	document.body.appendChild(rong);
	const doiChung = tran();
	rong.remove();
	return { truoc, doiChung };
}

function tuKiem() {
	const loi = [];
	const dat = (nhan, dung) => {
		if (!dung) loi.push(nhan);
	};
	const g = ghiChuDai();
	dat("ghiChuDai du 200", g.length === MAN.ghiChu.dai);
	dat(
		"ghiChuDai 40 ky tu dau lien",
		!g.slice(0, MAN.ghiChu.dauLien).includes(" "),
	);
	dat("congCuaUrl", congCuaUrl("http://localhost:3500") === "3500");
	dat("congCuaUrl mac dinh", congCuaUrl("http://localhost") === "80");
	for (const l of loi) console.log(`SAI tu kiem: ${l}`);
	console.log(loi.length === 0 ? "DUNG tu kiem" : "SAI tu kiem");
	process.exit(loi.length === 0 ? 0 : 1);
}

if (process.argv.includes("--tu-kiem")) tuKiem();

const dong = [];
let sai = 0;

function ket(ma) {
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}
function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	ket(2);
}
function kiem(nhan, dat) {
	dong.push(`${dat ? "DUNG" : "SAI"} ${nhan}`);
	if (!dat) sai += 1;
	return dat;
}

const doiSo = (ten) =>
	process.argv.includes(ten)
		? (process.argv[process.argv.indexOf(ten) + 1] ?? "")
		: "";

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) return null;
	const dau = new URL(dich, APP).pathname
		.replace(/^\/+|\/+$/g, "")
		.split("/")[0];
	return dau &&
		!["onboarding", "sign-in", "het-quyen"].some((x) => dau.startsWith(x))
		? dau
		: null;
}

async function doKho(tenKho, ca) {
	const { default: puppeteer } = await import("puppeteer-core");
	const { tre } = await import(
		"../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs"
	);
	const kho = MAN.kho[tenKho];
	const host = new URL(APP).hostname;
	const trinhDuyet = await puppeteer.launch({
		executablePath: MAN.chrome,
		headless: true,
	});
	try {
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: ca.cookie.ten, value: ca.cookie.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		const p = await ctx.newPage();
		await p.setViewport({
			width: kho.rong,
			height: kho.cao,
			deviceScaleFactor: 1,
		});
		p.setDefaultNavigationTimeout(MAN.cho.manMs);
		p.setDefaultTimeout(MAN.cho.manMs);
		const trang = `${APP}/${ca.slug}/okr/theo-don-vi?kyOkr=${ca.ky}&donOkr=pb:${ca.pb}&expand=${ca.m}`;
		await p.goto(trang, { waitUntil: "load" });
		await p.evaluate(() => document.fonts.ready);
		const moNgan = await p
			.waitForSelector(`[data-kr="${ca.k}"]`, {
				visible: true,
				timeout: MAN.cho.kr,
			})
			.then((el) => el?.click().then(() => true))
			.catch(() => false);
		if (!moNgan)
			await p.goto(`${trang}&record=kr:${ca.k}`, { waitUntil: "load" });
		const nutCapNhat = `[data-kr-sheet="${ca.k}"] [data-nut="cap-nhat-ngan-kr"]`;
		await p.waitForSelector(nutCapNhat, { visible: true });
		await p.click(nutCapNhat);
		const hop = `[data-hop-cap-nhat-kr="${ca.k}"]`;
		await p.waitForSelector(`${hop} [data-lan-truoc]`, { visible: true });
		const coGhiChu = await p
			.waitForSelector(`${hop} [data-ghi-chu-truoc]`, { visible: true })
			.then(() => true)
			.catch(() => false);
		kiem(`${tenKho}: khoi lan truoc co ghi chu`, coGhiChu);
		const doc = await p.evaluate((h) => {
			const hopEl = document.querySelector(h);
			const khoi = hopEl?.querySelector("[data-lan-truoc]");
			const gc = khoi?.querySelector("[data-ghi-chu-truoc]");
			const tran = (el) => (el ? el.scrollWidth > el.clientWidth + 1 : true);
			return {
				ghiChu: gc?.textContent ?? null,
				khongDich: gc?.closest('[translate="no"]') !== null,
				hopTran: tran(hopEl),
				khoiTran: tran(khoi),
				gcTran: tran(gc),
				goiY: hopEl?.querySelectorAll("[data-cau-goi-y]").length ?? 0,
			};
		}, hop);
		kiem(
			`${tenKho}: ghi chu 200 ky tu nguyen van (${doc.ghiChu?.length ?? 0})`,
			doc.ghiChu === ca.ghiChu,
		);
		kiem(`${tenKho}: ghi chu khong bi dich`, doc.khongDich);
		kiem(`${tenKho}: hop khong tran ngang`, doc.hopTran === false);
		kiem(
			`${tenKho}: khoi va ghi chu khong tran ngang`,
			doc.khoiTran === false && doc.gcTran === false,
		);
		kiem(`${tenKho}: ba cau goi y (${doc.goiY})`, doc.goiY === 3);
		const t = await p.evaluate(doTran, MAN.rongChen);
		kiem(`${tenKho}: trang khong cuon ngang (${t.truoc})`, t.truoc === false);
		kiem(
			`${tenKho}: doi chung do — chen khoi rong thi bao tran`,
			t.doiChung === true,
		);
		const nutGui = await p.evaluate((h) => {
			const b = document.querySelector(`${h} [data-nut="gui-cap-nhat-kr"]`);
			b?.scrollIntoView({ block: "nearest" });
			const r = b?.getBoundingClientRect();
			return r
				? r.top >= 0 &&
						r.bottom <= window.innerHeight &&
						r.left >= 0 &&
						r.right <= window.innerWidth
				: false;
		}, hop);
		kiem(`${tenKho}: nut gui nam trong khung nhin`, nutGui);
		await p.evaluate((h) => {
			for (const s of [
				"nextjs-portal",
				".tsqd-parent-container",
				".tsqd-open-btn-container",
			])
				for (const el of document.querySelectorAll(s)) el.remove();
			document.querySelector(`${h} [data-lan-truoc]`)?.scrollIntoView({
				block: "start",
			});
		}, hop);
		await tre(MAN.cho.yenMs);
		const tep = join(ANH, `hct-${tenKho}.png`);
		await p.screenshot({ path: tep });
		dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		await ctx.close();
	} finally {
		await trinhDuyet.close().catch(() => {});
	}
}

async function dungCa() {
	const { idMau } = await import(
		"../../../apps/api/scripts/okr-mau/cau-hinh.ts"
	);
	const caMan = JSON.parse(readFileSync(CA_MAN, "utf8"));
	return {
		caMan,
		m: idMau("mt", caMan.mucTieu),
		k: idMau("kr", caMan.kr),
		ky: idMau("chu-ky", caMan.chuKy),
		pb: idMau("pb", caMan.phongBan),
	};
}

if (process.argv.includes("--kho")) {
	const tenKho = doiSo("--kho");
	try {
		await doKho(tenKho, JSON.parse(doiSo("--ca")));
	} catch (loi) {
		khongDo(`kho ${tenKho}: ${loi?.message ?? loi}`);
	}
	ket(sai === 0 ? 0 : 1);
}

for (const [ten, url] of [
	["APP_URL", APP],
	["API_URL", API],
])
	if (CONG_CAM.has(congCuaUrl(url)))
		khongDo(
			`${ten} ${url} la cong cua nguoi — chay qua config:executors.script.hct_man`,
		);
mkdirSync(ANH, { recursive: true });
const phien = await import("../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs");
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const cay = await canhCay();
if (cay.ket !== "dung-cay")
	khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
if (!phien.laKhoDo())
	khongDo(
		"DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.hct_man",
	);
const nap = phien.napBoMau();
if (nap.ma !== 0)
	khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
dong.push(`GHI NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
const ca = await dungCa();
const cookie = phien.phienCookie(phien.thuMau(ca.caMan.nguoiXem));
const goi = phien.trpc(API, cookie);
const ghiChu = ghiChuDai();
try {
	const mt = await goi.hoi("okr.objective", { id: ca.m });
	const k = mt.keyResults.find((x) => x.id === ca.k);
	if (!k) khongDo(`okr.objective ${ca.m} khong co ${ca.k}`);
	const { sessionId } = await goi.lam("okr.moCapNhat", { entry: "sheet" });
	await goi.lam("okr.guiCapNhat", {
		sessionId,
		items: [
			{
				keyResultId: ca.k,
				value: k.currentValue,
				confidence: "vua",
				note: ghiChu,
			},
		],
	});
} catch (loi) {
	khongDo(`ghi lan cap nhat qua okr.guiCapNhat: ${loi?.message ?? loi}`);
}
dong.push(`GHI CA M=${ca.m} K=${ca.k} ghi chu ${ghiChu.length} ky tu`);
const slug = await suySlug(cookie);
if (!slug) khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
const caKho = {
	m: ca.m,
	k: ca.k,
	ky: ca.ky,
	pb: ca.pb,
	ghiChu,
	cookie,
	slug,
};
let soAnh = 0;
for (const tenKho of Object.keys(MAN.kho).sort(
	(a, b) => Number(b) - Number(a),
)) {
	const r = spawnSync(
		"bun",
		[TEP, "--kho", tenKho, "--ca", JSON.stringify(caKho)],
		{
			cwd: GOC,
			env: process.env,
			encoding: "utf8",
			maxBuffer: 64 << 20,
		},
	);
	for (const d of `${r.stdout}`
		.split("\n")
		.filter((x) => /^(DUNG|SAI|ANH|KHONG DO DUOC)/.test(x))) {
		dong.push(d);
		if (d.startsWith("SAI")) sai += 1;
		if (d.startsWith("ANH")) soAnh += 1;
	}
	if (r.status === 2)
		khongDo(
			`tien trinh kho ${tenKho} khong do duoc: ${`${r.stderr}`.trim().split("\n").slice(-2).join(" | ")}`,
		);
	if (r.status !== 0 && r.status !== 1)
		khongDo(`tien trinh kho ${tenKho} thoat ${r.status}`);
}
kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh >= MAN.soAnh);
ket(sai === 0 ? 0 : 1);
