import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import {
	idMau,
	laKhoDo,
	napBoMau,
	phienCookie,
	thuMau,
	tre,
	trpc,
} from "../../tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs";

const TEP = fileURLToPath(import.meta.url);
const GOC = join(dirname(TEP), "..", "..", "..");
const ANH = join(GOC, "_acceptance/gan-tay-va-kara-co-ly-do/evidence");
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL;
const GIAY_MS = 1000;
const MAN = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: {
		1440: { rong: 1440, cao: 1000 },
		390: { rong: 390, cao: 844 },
	},
	cho: { manMs: 120 * GIAY_MS, yenMs: 1500 },
	soAnh: 6,
	rongChen: "4000px",
};
const BAT_KARA = {
	aiOn: true,
	aiDeXuatPhamVi: "toan-cong-ty",
	aiDeXuatDonVi: [],
	aiDeXuatAnPhamVi: "tat",
	aiDeXuatAnDonVi: [],
};
const CA = JSON.parse(readFileSync(join(dirname(TEP), "ca-man.json"), "utf8"));
const m = okrMessages("vi").sheet;

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
	const hop = [...document.querySelectorAll("[role=dialog]")];
	const vuotMep = () =>
		hop.some((h) =>
			[h, ...h.querySelectorAll("*")].some(
				(x) => x.getBoundingClientRect().right > innerWidth + 1,
			),
		);
	const tran = () =>
		(trang.scrollWidth > trang.clientWidth + 1 ? 1 : 0) +
		hop.filter((x) => x.scrollWidth > x.clientWidth + 1).length +
		(vuotMep() ? 1 : 0);
	const truoc = tran();
	const chenVao = (cha) => {
		const rong = document.createElement("div");
		rong.style.width = rongChen;
		rong.style.height = "1px";
		cha.appendChild(rong);
		const bao = tran() > 0;
		rong.remove();
		return bao;
	};
	const doiChung = chenVao(document.body);
	const doiChungHop = hop.length === 0 ? true : chenVao(hop.at(-1));
	return {
		tran: truoc > 0,
		doiChung: doiChung && doiChungHop,
		soHop: hop.length,
	};
}

function docDeXuat() {
	const o = [...document.querySelectorAll("[data-gop-y]")].find((x) =>
		x.querySelector("[data-de-xuat-ly-do]"),
	);
	return o
		? {
				id: o.getAttribute("data-gop-y"),
				nhan: o.querySelector("[data-muc-tin]")?.textContent ?? null,
				lyDo:
					o.querySelector("[data-de-xuat-ly-do] [translate=no]")?.textContent ??
					null,
				canCu:
					o.querySelector("[data-de-xuat-can-cu] [translate=no]")
						?.textContent ?? null,
			}
		: null;
}

function docGopVao(tenDich) {
	const o = [
		...document.querySelectorAll("[data-khu=gop-vao] [data-gop-vao]"),
	].find((x) => x.textContent?.includes(tenDich));
	return o
		? {
				lyDo: o.querySelector("[data-ly-do-cau]")?.textContent ?? null,
				nhan: o.querySelector("[data-muc-tin]")?.textContent ?? null,
				kara: o.querySelectorAll("[data-slot=kara-trace]").length,
			}
		: null;
}

async function doKho(tenKho) {
	const kho = MAN.kho[tenKho];
	const cookie = JSON.parse(process.env.L4_COOKIE);
	const slug = process.env.L4_SLUG;
	const host = new URL(APP).hostname;
	const id = idMau("mt", CA.mucTieu);
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
		const kiemTran = async (buoc) => {
			const t = await p.evaluate(doTran, MAN.rongChen);
			kiem(
				`${buoc} ${tenKho}: khong cuon ngang (trang + ${t.soHop} hop thoai)`,
				t.tran === false,
			);
			kiem(
				`${buoc} ${tenKho}: doi chung do — chen khoi rong thi bao tran`,
				t.doiChung === true,
			);
		};
		const moSheet = async (tab) => {
			await p.goto(
				`${APP}/${slug}/okr/theo-don-vi?record=objective:${id}${tab ? `&tab=${tab}` : ""}`,
				{ waitUntil: "load" },
			);
			await p.waitForSelector(`[data-okr-sheet="${id}"] [role=tab]`);
			await p.evaluate(() => document.fonts.ready);
			await p.waitForFunction(() => {
				const h = document.querySelector("[role=dialog]");
				return (
					h !== null &&
					h
						.getAnimations({ subtree: true })
						.every((a) => a.playState !== "running") &&
					h.getBoundingClientRect().right <= innerWidth + 1
				);
			});
		};

		await moSheet(null);
		await p.waitForSelector("[data-gop-y] [data-de-xuat-ly-do]");
		const d = await p.evaluate(docDeXuat);
		kiem(
			`de-xuat ${tenKho}: nhan «${d?.nhan}» === «${m.mucTin["co-so-lieu"]}»`,
			d?.nhan === m.mucTin["co-so-lieu"],
		);
		kiem(`de-xuat ${tenKho}: ly do === mau`, d?.lyDo === CA.lyDo);
		kiem(`de-xuat ${tenKho}: can cu === mau`, d?.canCu === CA.canCu);
		await p.evaluate(
			(x) =>
				document
					.querySelector(`[data-gop-y="${x}"]`)
					?.scrollIntoView({ block: "center" }),
			d?.id,
		);
		await kiemTran("de-xuat");
		await chup("de-xuat");

		await p.click(`[data-gop-y="${d?.id}"] [data-hanh-dong=can-chinh]`);
		await p.waitForFunction(
			(ten, ly) =>
				[
					...document.querySelectorAll("[data-khu=gop-vao] [data-gop-vao]"),
				].some(
					(x) =>
						x.textContent?.includes(ten) &&
						x.querySelector("[data-ly-do-cau]")?.textContent === ly,
				),
			{},
			CA.tenDich,
			CA.lyDo,
		);
		const g1 = await p.evaluate(docGopVao, CA.tenDich);
		kiem(
			`da-nhan ${tenKho}: duong ly do hien ly do Kara`,
			g1?.lyDo === CA.lyDo,
		);
		kiem(`da-nhan ${tenKho}: dau Kara 1 (${g1?.kara})`, g1?.kara === 1);
		kiem(
			`da-nhan ${tenKho}: nhan «${g1?.nhan}» === Co so lieu`,
			g1?.nhan === m.mucTin["co-so-lieu"],
		);
		await p.evaluate(() =>
			document
				.querySelector("[data-khu=gop-vao]")
				?.scrollIntoView({ block: "center" }),
		);
		await chup("da-nhan");

		await moSheet("can-chinh");
		await p.waitForSelector("[data-nut=sua-ly-do]");
		await kiemTran("tab-can-chinh");
		const nutSua = await p.evaluateHandle((ten) => {
			const hien = (x) => x.getClientRects().length > 0;
			const nut = [...document.querySelectorAll("[data-noi-gop]")]
				.filter((x) => x.textContent?.includes(ten))
				.map((x) => x.querySelector("[data-nut=sua-ly-do]"))
				.find((x) => x && hien(x));
			nut?.scrollIntoView({ block: "center" });
			return nut ?? null;
		}, CA.tenDich);
		if (!nutSua.asElement())
			throw new Error("khong thay nut Sua ly do tren dong");
		try {
			await nutSua.asElement().click();
		} catch (loi) {
			await p.screenshot({
				path: join(GOC, ".acceptance-runs", `l4-man-hong-${tenKho}.png`),
			});
			throw new Error(`bam Sua ly do: ${loi?.message ?? loi}`);
		}
		await p.waitForSelector(
			"[data-hop-thoai-can-chinh][data-che-do=sua] [data-o=can-cu]",
		);
		await p.evaluate(() => {
			const o = document.querySelector(
				"[data-hop-thoai-can-chinh] [data-o=can-cu]",
			);
			const dat = Object.getOwnPropertyDescriptor(
				HTMLTextAreaElement.prototype,
				"value",
			)?.set;
			dat?.call(o, "");
			o?.dispatchEvent(new Event("input", { bubbles: true }));
		});
		await tre(MAN.cho.yenMs);
		const nhanHop = await p.evaluate(
			() =>
				document.querySelector("[data-hop-thoai-can-chinh] [data-muc-tin]")
					?.textContent ?? null,
		);
		kiem(
			`hop-thoai-sua ${tenKho}: muc tin doi thanh «${nhanHop}» === Dat cuoc`,
			nhanHop === m.mucTin["dat-cuoc"],
		);
		await kiemTran("hop-thoai-sua");
		try {
			await p.click("[data-hop-thoai-can-chinh] [data-nut=gui-can-chinh]");
		} catch (loi) {
			await p.screenshot({
				path: join(GOC, ".acceptance-runs", `l4-man-hong-${tenKho}.png`),
			});
			throw new Error(`bam Luu: ${loi?.message ?? loi}`);
		}
		await p.waitForFunction(
			() => document.querySelector("[data-hop-thoai-can-chinh]") === null,
		);

		await moSheet(null);
		await p.waitForFunction(
			(ten, nhan) =>
				[
					...document.querySelectorAll("[data-khu=gop-vao] [data-gop-vao]"),
				].some(
					(x) =>
						x.textContent?.includes(ten) &&
						x.querySelector("[data-muc-tin]")?.textContent === nhan,
				),
			{},
			CA.tenDich,
			m.mucTin["dat-cuoc"],
		);
		const g2 = await p.evaluate(docGopVao, CA.tenDich);
		kiem(
			`da-sua ${tenKho}: nhan «${g2?.nhan}» === Dat cuoc`,
			g2?.nhan === m.mucTin["dat-cuoc"],
		);
		kiem(`da-sua ${tenKho}: dau Kara 0 (${g2?.kara})`, g2?.kara === 0);
		await p.evaluate(() =>
			document
				.querySelector("[data-khu=gop-vao]")
				?.scrollIntoView({ block: "center" }),
		);
		await kiemTran("da-sua");
		await chup("da-sua");
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
		"DATABASE_URL khong phai kho do rieng — chay qua config:executors.script.l4_man",
	);
if (!API) khongDo("thieu API_URL cua phien do");
let soAnh = 0;
for (const tenKho of Object.keys(MAN.kho)) {
	const nap = napBoMau();
	if (nap.ma !== 0)
		khongDo(`okr:mau --moc ${nap.moc} thoat ${nap.ma}: ${nap.dong}`);
	dong.push(`GHI NAP ${tenKho} okr:mau --moc ${nap.moc}: ${nap.dong}`);
	const quanTri = phienCookie(thuMau(CA.quanTri));
	await trpc(API, quanTri).lam("okr.setProgram", BAT_KARA);
	const { napDeXuatKaraMau } = await import(
		"../../../apps/api/scripts/okr-mau/nap-de-xuat-kara.ts"
	);
	const taskId = await napDeXuatKaraMau();
	dong.push(`GHI DE XUAT MAU ${tenKho}: viec ${taskId}`);
	const cookie = phienCookie(thuMau(CA.nguoiXem));
	const slug = await suySlug(cookie);
	if (!slug) khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);
	const r = spawnSync("bun", [TEP, "--kho", tenKho], {
		cwd: GOC,
		env: { ...process.env, L4_COOKIE: JSON.stringify(cookie), L4_SLUG: slug },
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});
	for (const d of `${r.stdout}`
		.split("\n")
		.filter((x) => /^(DUNG|SAI|ANH|KHONG DO DUOC)/.test(x))) {
		dong.push(d);
		if (d.startsWith("SAI")) sai += 1;
		if (d.startsWith("ANH")) soAnh += 1;
	}
	if (r.status === 2)
		khongDo(
			`tien trinh kho ${tenKho} khong do duoc: ${`${r.stderr}`.trim().split("\n").slice(-2).join(" | ")} ${dong.at(-1)}`,
		);
	if (r.status !== 0 && r.status !== 1)
		khongDo(`tien trinh kho ${tenKho} thoat ${r.status}`);
}
kiem(`du ${MAN.soAnh} anh (${soAnh})`, soAnh === MAN.soAnh);
ket(sai === 0 ? 0 : 1);
