import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = resolve(
	GOC,
	process.env.BANG_CHUNG ?? join(".acceptance-runs", "quen-mat-khau", "evidence"),
);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const VI_TRI_CA = process.argv.indexOf("--ca");
const CA = VI_TRI_CA > -1 ? process.argv[VI_TRI_CA + 1] : "bat";
const CAO = 900;
const HEP = 390;
const RONG = 1440;
const SO_LAN_QUA_LUOT = 4;
const DUONG_QUEN = "/quen-mat-khau";
const DUONG_VAO = "/sign-in";
const CHU_DA_GUI = "Kiểm tra hộp thư";
const CHU_QUA_LUOT = "Bạn đã xin quá nhiều lần";
const DUONG_BO_DEM = "request-password-reset";

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	await db.$disconnect().catch(() => {});
	for (const d of dong) console.log(d);
	const dung = dong.filter((d) => d.startsWith("DUNG")).length;
	console.log(`KET LUAN: ${dung} DUNG, ${sai} SAI — ma thoat ${ma}`);
	process.exit(ma);
}

function kiem(nhan, dat) {
	if (dat) {
		dong.push(`DUNG ${nhan}`);
		return;
	}
	sai += 1;
	dong.push(`SAI ${nhan}`);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

async function trang(rong, duong) {
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie({
		name: "lang",
		value: "vi",
		domain: new URL(APP).hostname,
		path: "/",
	});
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: CAO, deviceScaleFactor: 2 });
	await p.goto(`${APP}${duong}`, { waitUntil: "networkidle0" });
	return p;
}

function duongCuoi(p) {
	return new URL(p.url()).pathname;
}

async function khongTranNgang(p) {
	return p.evaluate(
		() =>
			document.documentElement.scrollWidth <=
			document.documentElement.clientWidth,
	);
}

async function guiForm(p, email) {
	await p.$eval("input[type=email]", (o) => {
		o.value = "";
	});
	await p.type("input[type=email]", email);
	await p.click("button[type=submit]");
	await p.waitForNetworkIdle();
}

async function donBoDem() {
	const canh = spawnSync(
		"bun",
		["packages/db/scripts/require-local-db.ts", "chup quen-mat-khau"],
		{ cwd: GOC, encoding: "utf8" },
	);
	if (canh.status !== 0) {
		await khongDo(
			"co so du lieu khong phai may cuc bo, khong xoa bo dem qua luot",
		);
	}
	await db.rateLimit.deleteMany({
		where: { key: { contains: DUONG_BO_DEM } },
	});
}

function diaChiThu(nhan) {
	return `chup-${nhan}-${Date.now()}@example.test`;
}

async function caBat() {
	await donBoDem();
	for (const rong of [RONG, HEP]) {
		const p = await trang(rong, DUONG_VAO);
		const lienKet = await p.$$(`a[href="${DUONG_QUEN}"]`);
		kiem(
			`${DUONG_VAO} ${rong}: dung mot lien ket toi ${DUONG_QUEN}`,
			lienKet.length === 1,
		);
		kiem(`${DUONG_VAO} ${rong}: khong tran ngang`, await khongTranNgang(p));
		await p.screenshot({ path: join(RA, `E18-dang-nhap-${rong}.png`) });
		if (rong === RONG && lienKet[0]) {
			await Promise.all([
				p.waitForNavigation({ waitUntil: "networkidle0" }),
				lienKet[0].click(),
			]);
			kiem(
				`bam lien ket thi URL la ${DUONG_QUEN}`,
				duongCuoi(p) === DUONG_QUEN,
			);
		}
	}
	for (const rong of [RONG, HEP]) {
		const p = await trang(rong, DUONG_QUEN);
		kiem(
			`${DUONG_QUEN} ${rong}: khong bi day ve ${DUONG_VAO}`,
			duongCuoi(p) === DUONG_QUEN,
		);
		kiem(`${DUONG_QUEN} ${rong}: khong tran ngang`, await khongTranNgang(p));
		await p.screenshot({ path: join(RA, `E18-quen-trong-${rong}.png`) });
	}

	const daGui = await trang(RONG, DUONG_QUEN);
	await guiForm(daGui, diaChiThu("da-gui"));
	kiem(
		`gui xong hien ${CHU_DA_GUI}`,
		(await daGui.content()).includes(CHU_DA_GUI),
	);
	await daGui.screenshot({ path: join(RA, "E18-da-gui-1440.png") });

	const loi = await trang(RONG, DUONG_QUEN);
	await loi.setRequestInterception(true);
	loi.on("request", (yeuCau) => {
		if (yeuCau.url().includes(DUONG_BO_DEM)) yeuCau.abort();
		else yeuCau.continue();
	});
	const diaChiLoi = diaChiThu("loi");
	await guiForm(loi, diaChiLoi);
	kiem(
		"chan mang thi hien Alert loi",
		(await loi.$('[data-slot="alert"]')) !== null,
	);
	kiem(
		"chan mang thi o email con chu",
		(await loi.$eval("input[type=email]", (o) => o.value)) === diaChiLoi,
	);
	await loi.screenshot({ path: join(RA, "E18-loi-1440.png") });

	const quaLuot = await trang(RONG, DUONG_QUEN);
	for (let i = 2; i < SO_LAN_QUA_LUOT; i += 1) {
		await guiForm(quaLuot, diaChiThu(`luot-${i}`));
		await quaLuot.goto(`${APP}${DUONG_QUEN}`, { waitUntil: "networkidle0" });
	}
	await guiForm(quaLuot, diaChiThu("luot-cuoi"));
	const noiDung = await quaLuot.content();
	kiem("lan thu tu hien cau qua luot", noiDung.includes(CHU_QUA_LUOT));
	kiem(
		`lan thu tu khong hien ${CHU_DA_GUI}`,
		!noiDung.includes(CHU_DA_GUI),
	);
	await quaLuot.screenshot({ path: join(RA, "E18-qua-luot-1440.png") });
}

async function caTat() {
	const p = await trang(RONG, DUONG_VAO);
	kiem(
		`cau hinh thu tat: ${DUONG_VAO} khong co lien ket quen mat khau`,
		(await p.$$(`a[href="${DUONG_QUEN}"]`)).length === 0,
	);
	await p.screenshot({ path: join(RA, "E21-dang-nhap-tat-1440.png") });
	const p2 = await trang(RONG, DUONG_QUEN);
	kiem(
		`cau hinh thu tat: mo thang ${DUONG_QUEN} thi ve ${DUONG_VAO}`,
		duongCuoi(p2) === DUONG_VAO,
	);
}

const cay = await canhCay();
if (cay.ket !== "dung-cay") {
	for (const d of cay.dong) dong.push(`KHONG DO DUOC: ${d}`);
	await ket(2);
}
mkdirSync(RA, { recursive: true });
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
try {
	if (CA === "tat") await caTat();
	else await caBat();
} catch (loiChay) {
	await khongDo(String(loiChay?.message ?? loiChay));
}
await ket(sai > 0 ? 1 : 0);
