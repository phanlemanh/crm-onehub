import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	DON_VI_CAN_CHU_Y,
	DON_VI_CHUA_NOI,
	LY_DO_SO_DO,
} from "../../../apps/api/scripts/okr-mau/ca-so-do.ts";
import { okrToanCanhMessages } from "../../../apps/app/lib/messages/okr-toan-canh.ts";
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
const ANH = join(GOC, "_acceptance/so-do-can-chinh-don-vi/evidence");
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
const vi = okrToanCanhMessages("vi").soDo;
const KHOA_MO = `pb:${idMau("pb", CA.theMo)}`;

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
		const duong = `${APP}/${slug}/okr/toan-canh?xemToanCanh=so-do`;
		if (tenKho === "1440") {
			await p.goto(duong, { waitUntil: "load" });
			await p.waitForSelector("[data-flow-map] [data-so-do-the]");
			await p.waitForSelector("[data-flow-map] .react-flow__edge[data-id]");
			await p.waitForNetworkIdle({ idleTime: 500 }).catch(() => {});
			await p.evaluate(() => document.fonts.ready);
			const chuaNoi = await p.evaluate(
				(ds) =>
					ds.map((k) => {
						const the = document.querySelector(`[data-so-do-the="${k}"]`);
						const day = [
							...document.querySelectorAll(".react-flow__edge[data-id]"),
						].filter((e) =>
							(e.getAttribute("data-id") ?? "").endsWith(`->${k}`),
						).length;
						return {
							k,
							coThe: the !== null,
							nhan: the?.querySelector("[data-chua-noi]")?.textContent ?? null,
							day,
						};
					}),
				[...DON_VI_CHUA_NOI],
			);
			for (const c of chuaNoi) {
				kiem(
					`so-do 1440 ${c.k}: the co mat, nhan «${c.nhan}»`,
					c.coThe && c.nhan === vi.chuaNoiLen,
				);
				kiem(`so-do 1440 ${c.k}: ${c.day} day di len`, c.day === 0);
			}
			const tongDay = await p.evaluate(
				() => document.querySelectorAll(".react-flow__edge[data-id]").length,
			);
			kiem(
				`so-do 1440: doi chung duong — khung ve co ${tongDay} day`,
				tongDay > 0,
			);
			await chup("so-do");

			await p.click('[data-loc-so-do="chu-y"]');
			await p.waitForFunction(
				() => new URL(location.href).searchParams.get("locSoDo") === "chu-y",
			);
			await tre(MAN.cho.yenMs);
			const ro = await p.evaluate(
				(ds) =>
					ds.map((k) => {
						const the = document.querySelector(`[data-so-do-the="${k}"]`);
						return { k, ro: the !== null && !the.hasAttribute("data-chim") };
					}),
				[...DON_VI_CAN_CHU_Y],
			);
			for (const c of ro) kiem(`chu-y 1440 ${c.k}: ro`, c.ro);
			const moTrongCa = await p.evaluate(() =>
				[...document.querySelectorAll("[data-so-do-the][data-chim]")].map((e) =>
					e.getAttribute("data-so-do-the"),
				),
			);
			kiem(
				`chu-y 1440: doi chung — co the mo (${moTrongCa.length})`,
				moTrongCa.length > 0,
			);
			await chup("chu-y");

			await p.goto(`${duong}&moDonVi=${encodeURIComponent(KHOA_MO)}`, {
				waitUntil: "load",
			});
			await p.waitForSelector(`[data-so-do-the="${KHOA_MO}"][data-dang-mo]`);
			await tre(MAN.cho.yenMs);
			const cau = await p.evaluate(
				(k) =>
					[
						...document.querySelectorAll(
							`[data-so-do-the="${k}"] [data-ly-do-cau]`,
						),
					].map((e) => e.textContent),
				KHOA_MO,
			);
			kiem(
				`the-mo 1440 ${CA.theMo}: cau ly do da gieo hien`,
				cau.includes(LY_DO_SO_DO.coSoLieu) && cau.includes(LY_DO_SO_DO.datCuoc),
			);
			await chup("the-mo");
		} else {
			await p.goto(duong, { waitUntil: "load" });
			await p.waitForSelector("[data-so-do-danh-sach] [data-so-do-the]");
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
if (DON_VI_CHUA_NOI.length === 0 || DON_VI_CAN_CHU_Y.length === 0)
	khongDo("bo mau thieu ca");
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
		"DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.dh4_man",
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
