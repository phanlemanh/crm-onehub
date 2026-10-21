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
const ANH = join(GOC, ".acceptance-runs/so-do-toan-vung/man");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		390: { rong: 390, cao: 844 },
	},
	rongLon: { rong: 1920, cao: 1080 },
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500 },
	soAnh: 6,
	lePx: { rong: 48, day: 24, thanhBen: 2 },
	rongChen: "4000px",
};
const CA = JSON.parse(
	readFileSync(
		join(GOC, "_acceptance/so-do-quanh-muc-tieu/rang/ca-man.json"),
		"utf8",
	),
);
const TAM = mtSoDo(CA.tam);
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

function doKhung() {
	const hop = (chon) => document.querySelector(chon)?.getBoundingClientRect();
	const vung = hop("main[data-slot=page-shell-scroll]");
	const khung = hop("[data-flow-map]");
	const thanhBen = hop("aside[data-slot=area-sidebar]");
	const trang = document.scrollingElement ?? document.documentElement;
	return {
		vung: vung ? { rong: vung.width } : null,
		khung: khung ? { rong: khung.width, day: khung.bottom } : null,
		thanhBen: thanhBen ? thanhBen.width : null,
		cao: innerHeight,
		rong: innerWidth,
		cuonDoc: trang.scrollHeight,
		cuonNgang: trang.scrollWidth,
	};
}

function kiemTron(nhan, d) {
	kiem(
		`${nhan}: khung ve ${d.khung?.rong}px ≥ vung noi dung ${d.vung?.rong}px − ${MAN.lePx.rong}`,
		d.khung !== null &&
			d.vung !== null &&
			d.khung.rong >= d.vung.rong - MAN.lePx.rong,
	);
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
		const khung = async (k) =>
			p.setViewport({ width: k.rong, height: k.cao, deviceScaleFactor: 1 });
		await khung(kho);
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
		const duong = (d) => `${APP}/${slug}${d}`;
		const choKhung = async () => {
			await p.waitForSelector("[data-flow-map] .react-flow__node");
			await p.waitForNetworkIdle({ idleTime: 500 }).catch(() => {});
			await p.evaluate(() => document.fonts.ready);
			await tre(MAN.cho.yenMs);
		};
		const thanhBenCo = () =>
			p.evaluate(
				() => document.querySelector("[data-slot=area-sidebar]") !== null,
			);
		const nutBat = () =>
			p.evaluate(
				() =>
					document
						.querySelector("[data-nut=toan-man-hinh]")
						?.getAttribute("aria-pressed") === "true",
			);

		if (tenKho === "1440") {
			await p.goto(duong("/okr"), { waitUntil: "load" });
			const muc = `aside[data-slot=area-sidebar] a[href*="/okr/so-do"]`;
			await p.waitForSelector(muc, { visible: true });
			await p.click(muc);
			await p.waitForFunction(() => location.pathname.endsWith("/okr/so-do"));
			await choKhung();
			const thuong = await p.evaluate(doKhung);
			kiemTron("thuong 1440", thuong);
			kiem(
				`thuong 1440: day khung ve ${thuong.khung?.day} ≥ ${thuong.cao} − ${MAN.lePx.day}`,
				(thuong.khung?.day ?? 0) >= thuong.cao - MAN.lePx.day,
			);
			kiem(
				`thuong 1440: tai lieu khong cuon (${thuong.cuonDoc}×${thuong.cuonNgang})`,
				thuong.cuonDoc === thuong.cao && thuong.cuonNgang === thuong.rong,
			);
			await chup("thuong");

			await p.click("[data-nut=toan-man-hinh]");
			await p.waitForFunction(
				() => document.querySelector("[data-slot=area-sidebar]") === null,
			);
			await tre(MAN.cho.yenMs);
			const toan = await p.evaluate(doKhung);
			kiem(
				`toan-man 1440: khung ve rong them ${(toan.khung?.rong ?? 0) - (thuong.khung?.rong ?? 0)}px ≥ thanh ben ${thuong.thanhBen}px − ${MAN.lePx.thanhBen}`,
				(toan.khung?.rong ?? 0) - (thuong.khung?.rong ?? 0) >=
					(thuong.thanhBen ?? Number.POSITIVE_INFINITY) - MAN.lePx.thanhBen,
			);
			kiemTron("toan-man 1440", toan);
			await chup("toan-man");

			await p.keyboard.press("Escape");
			await p.waitForSelector("[data-slot=area-sidebar]");
			kiem("esc 1440: thanh ben tro lai", await thanhBenCo());
			await chup("sau-esc");

			await khung(MAN.rongLon);
			await p.reload({ waitUntil: "load" });
			await choKhung();
			kiemTron("thuong 1920", await p.evaluate(doKhung));
			await khung(kho);

			await p.goto(duong(`/okr/so-do/muc-tieu/${TAM}`), { waitUntil: "load" });
			await choKhung();
			await p.evaluate(() => {
				window.__vk6Dau = 1;
			});
			await p.click("[data-nut=toan-man-hinh]");
			await p.waitForFunction(
				() => document.querySelector("[data-slot=area-sidebar]") === null,
			);
			await p.click("[data-flow-map] [data-quanh-the]:not([data-active=true])");
			const nutNgan = '[data-okr-sheet] a[href*="/okr/so-do/muc-tieu/"]';
			await p.waitForSelector(nutNgan, { visible: true });
			const dichNgan = await p.$eval(nutNgan, (a) => a.getAttribute("href"));
			await p.click(nutNgan);
			await p.waitForFunction(
				(d) => location.pathname === d,
				{},
				new URL(dichNgan ?? "", APP).pathname,
			);
			await choKhung();
			const giuQuaNgan =
				!(await thanhBenCo()) &&
				(await nutBat()) &&
				(await p.evaluate(() => window.__vk6Dau === 1));
			kiem(
				giuQuaNgan
					? `dieu-huong-giu-toan-man: qua ngan toi ${new URL(p.url()).pathname}`
					: "dieu-huong-giu-toan-man: tai-lai",
				giuQuaNgan,
			);
			await p.click("[data-nut=ve-ca-cong-ty]");
			await p.waitForFunction(() => location.pathname.endsWith("/okr/so-do"));
			await choKhung();
			kiem(
				"dieu-huong-giu-toan-man: ve ca cong ty",
				!(await thanhBenCo()) &&
					(await nutBat()) &&
					(await p.evaluate(() => window.__vk6Dau === 1)),
			);
			await p.keyboard.press("Escape");

			await p.goto(duong(`/okr/so-do?record=objective:${TAM}`), {
				waitUntil: "load",
			});
			const nutTam = `[data-okr-sheet] a[href$="/okr/so-do/muc-tieu/${TAM}"]`;
			await p.waitForSelector(nutTam, { visible: true });
			await p.$eval(nutTam, (a) => a.scrollIntoView({ block: "center" }));
			await tre(MAN.cho.yenMs);
			await p.$eval(nutTam, (a) => a.click());
			await p.waitForFunction(
				(id) => location.pathname.endsWith(`/okr/so-do/muc-tieu/${id}`),
				{},
				TAM,
			);
			await choKhung();
			const gop = await p.evaluate(() =>
				[...document.querySelectorAll("[data-gop-len-muc]")].map(
					(e) =>
						`${e.getAttribute("data-kr")}|${e.getAttribute("data-muc-tieu")}`,
				),
			);
			kiem(
				`quanh 1440: dong gop len cong ty = {${gop.join(", ")}}`,
				gop.length === 1 && gop[0] === `${KR_CONG_TY}|${MT_CONG_TY}`,
			);
			await chup("quanh");
		} else {
			for (const [ten, d, chon] of [
				["hep-ca-cong-ty", "/okr/so-do", "[data-so-do-danh-sach]"],
				["hep-quanh", `/okr/so-do/muc-tieu/${TAM}`, "[data-quanh-danh-sach]"],
			]) {
				await p.goto(duong(d), { waitUntil: "load" });
				await p.waitForSelector(chon);
				await p.evaluate(() => document.fonts.ready);
				const coKhung = await p.evaluate(
					() =>
						document.querySelector("[data-flow-map]") !== null ||
						document.querySelector("[data-nut=toan-man-hinh]") !== null,
				);
				kiem(`${ten} 390: khong khung ve, khong nut toan man hinh`, !coKhung);
				const t = await p.evaluate(doTran, MAN.rongChen);
				kiem(`${ten} 390: khong cuon ngang (${t.truoc})`, t.truoc === false);
				kiem(
					`${ten} 390: doi chung do — chen khoi rong thi bao tran`,
					t.doiChung === true,
				);
				await chup(ten);
			}
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
		"DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.vk6_man",
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
