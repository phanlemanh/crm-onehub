import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { mtSoDo } from "../../../apps/api/scripts/okr-mau/ca-so-do.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const ANH = join(GOC, "_acceptance/so-do-quanh-muc-tieu/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		390: { rong: 390, cao: 844 },
	},
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500 },
	soAnh: 4,
	rongChen: "4000px",
};
const CA = JSON.parse(readFileSync(join(dirname(TEP), "ca-man.json"), "utf8"));
const TAM = mtSoDo(CA.tam);
const HAI_CHO = mtSoDo(CA.haiCho);
const KR_CONG_TY = idMau("kr", CA.krCongTy);
const MT_CONG_TY = mtSoDo(CA.mucTieuCongTy);

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

async function doKho(tenKho) {
	const kho = MAN.kho[tenKho];
	const doiSo = (ten) => process.argv[process.argv.indexOf(ten) + 1] ?? "";
	const cookie = JSON.parse(doiSo("--cookie"));
	const slug = doiSo("--slug");
	const host = new URL(APP).hostname;
	const trinhDuyet = await puppeteer.launch({
		executablePath: MAN.chrome,
		headless: true,
	});
	try {
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
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
		const loiConsole = [];
		p.on("console", (msg) => {
			if (msg.type() === "error") loiConsole.push(msg.text());
		});
		const chup = async (ten) => {
			await tre(MAN.cho.yenMs);
			await p.evaluate(() => {
				for (const s of [
					"nextjs-portal",
					".tsqd-parent-container",
					".tsqd-open-btn-container",
				])
					for (const el of document.querySelectorAll(s)) el.remove();
			});
			const tep = join(ANH, `${ten}-${tenKho}.png`);
			await p.screenshot({ path: tep });
			dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
		};
		const trang = (id) => `${APP}/${slug}/okr/quanh-muc-tieu/${id}`;
		if (tenKho === "1440") {
			await p.goto(`${APP}/${slug}/okr/toan-canh?record=objective:${TAM}`, {
				waitUntil: "load",
			});
			const nut = `[data-okr-sheet] a[href$="/okr/quanh-muc-tieu/${TAM}"]`;
			await p.waitForSelector(nut, { visible: true });
			await Promise.all([
				p.waitForNavigation({ waitUntil: "load" }),
				p.click(nut),
			]);
			kiem(
				`ngan 1440: bam nut that sang trang so do (${new URL(p.url()).pathname})`,
				new URL(p.url()).pathname.endsWith(`/okr/quanh-muc-tieu/${TAM}`),
			);
			await p.waitForSelector("[data-flow-map] [data-quanh-the]");
			await p.waitForNetworkIdle({ idleTime: 500 }).catch(() => {});
			await p.evaluate(() => document.fonts.ready);
			const gop = await p.evaluate(() =>
				[...document.querySelectorAll("[data-gop-len-muc]")].map(
					(e) =>
						`${e.getAttribute("data-kr")}|${e.getAttribute("data-muc-tieu")}`,
				),
			);
			kiem(
				`so-do 1440: dong gop len cong ty = {${gop.join(", ")}}`,
				gop.length === 1 && gop[0] === `${KR_CONG_TY}|${MT_CONG_TY}`,
			);
			const nhan = await p.evaluate(
				(id) =>
					document.querySelector(`[data-quanh-the="${id}"] [data-cong-ty]`) !==
					null,
				KR_CONG_TY,
			);
			kiem("so-do 1440: the KR cong ty mang nhan Cong ty", nhan);
			const tongDay = await p.evaluate(
				() => document.querySelectorAll(".react-flow__edge[data-id]").length,
			);
			kiem(
				`so-do 1440: doi chung duong — khung ve co ${tongDay} day`,
				tongDay > 0,
			);
			await chup("ngan-so-do");

			await p.goto(trang(HAI_CHO), { waitUntil: "load" });
			await p.waitForSelector("[data-flow-map] [data-quanh-the]");
			await tre(MAN.cho.yenMs);
			const soThe = await p.evaluate(
				(id) => document.querySelectorAll(`[data-quanh-the="${id}"]`).length,
				MT_CONG_TY,
			);
			kiem(`hai-cho 1440: muc tieu cong ty ${soThe} the`, soThe === 1);
			await chup("gop-hai-cho");

			await p.goto(trang(TAM), { waitUntil: "load" });
			await p.waitForSelector("[data-flow-map] [data-quanh-the]");
			await tre(MAN.cho.yenMs);
			const krTam = await p.evaluate(
				(tam) =>
					[...document.querySelectorAll(".react-flow__edge[data-id]")]
						.map((e) => e.getAttribute("data-id") ?? "")
						.filter((d) => d.startsWith(`${tam}->`))
						.map((d) => d.slice(tam.length + 2)),
				TAM,
			);
			const moTruoc = await p.evaluate(
				() =>
					[...document.querySelectorAll(".react-flow__node")].filter(
						(n) => n.style.opacity === "0.35",
					).length,
			);
			await p.hover(`.react-flow__node[data-id="${krTam[0]}"]`);
			await tre(MAN.cho.yenMs);
			const moSau = await p.evaluate(
				() =>
					[...document.querySelectorAll(".react-flow__node")].filter(
						(n) => n.style.opacity === "0.35",
					).length,
			);
			kiem(
				`ro-chuot 1440: re len ${krTam[0]} thi ${moSau} the mo (truoc ${moTruoc})`,
				krTam.length > 0 && moSau > moTruoc,
			);
			await chup("ro-chuot");
		} else {
			await p.goto(trang(TAM), { waitUntil: "load" });
			await p.waitForSelector("[data-quanh-danh-sach] [data-quanh-the]");
			await p.evaluate(() => document.fonts.ready);
			const khung = await p.evaluate(
				() => document.querySelector("[data-flow-map]") !== null,
			);
			kiem("danh-sach 390: khong dung khung ve", khung === false);
			const t = await p.evaluate(doTran, MAN.rongChen);
			kiem(`danh-sach 390: khong cuon ngang (${t.truoc})`, t.truoc === false);
			kiem(
				"danh-sach 390: doi chung do — chen khoi rong thi bao tran",
				t.doiChung === true,
			);
			await chup("danh-sach");
		}
		kiem(
			`${tenKho}: console khong loi (${loiConsole.length})${loiConsole.length ? ` — ${loiConsole[0]}` : ""}`,
			loiConsole.length === 0,
		);
		await ctx.close();
	} finally {
		await trinhDuyet.close().catch(() => {});
	}
}

const chiKho = process.argv.includes("--kho")
	? process.argv[process.argv.indexOf("--kho") + 1]
	: null;
if (chiKho) {
	try {
		await doKho(chiKho);
	} catch (loi) {
		khongDo(`kho ${chiKho}: ${loi?.message ?? loi}`);
	}
	ket(sai === 0 ? 0 : 1);
}

mkdirSync(ANH, { recursive: true });
if (!CA.tam || !CA.haiCho || !CA.krCongTy) khongDo("bo mau thieu ca");
const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const cay = await canhCay();
if (cay.ket !== "dung-cay")
	khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
if (!laKhoDo())
	khongDo(
		"DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.dh5_man",
	);
const nap = napBoMau();
if (nap.ma !== 0)
	khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
dong.push(`GHI NAP okr:mau --moc ${nap.moc}: ${nap.dong}`);
const napSoDo = spawnSync("bun", ["scripts/okr-mau/ca-so-do.ts", "--nap"], {
	cwd: join(GOC, "apps/api"),
	env: process.env,
	encoding: "utf8",
});
if (napSoDo.status !== 0)
	khongDo(
		`nap ca so do thoat ${napSoDo.status}: ${`${napSoDo.stderr}`.trim().split("\n").slice(-2).join(" | ")}`,
	);
dong.push(`GHI NAP ${`${napSoDo.stdout}`.trim()}`);
const cookie = phienCookie(thuMau(CA.nguoiXem));
const slug = await suySlug(cookie);
if (!slug) khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
let soAnh = 0;
for (const tenKho of Object.keys(MAN.kho)) {
	const r = spawnSync(
		"bun",
		[TEP, "--kho", tenKho, "--cookie", JSON.stringify(cookie), "--slug", slug],
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
kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh === MAN.soAnh);
ket(sai === 0 ? 0 : 1);
