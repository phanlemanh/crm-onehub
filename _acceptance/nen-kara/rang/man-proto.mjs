import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HO_SO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const GOC = resolve(HO_SO, "../..");
const SLUG = "nen-kara";

const NK = {
	chrome: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
	kho: [
		{ ten: "1440", rong: 1440, cao: 1000 },
		{ ten: "390", rong: 390, cao: 844 },
	],
	nen: ["light", "dark"],
	cho: { manMs: 60_000, nhipMs: 100, lanToiDa: 50, lacMs: 300 },
	designDoc: "docs/superpowers/specs/2026-10-02-nen-kara-design.md",
	trangThaiTien: "ST-nenkara-",
	chuViSao: "Vì sao?",
	tieuDeViSao: "Kara dựa trên gì",
	chuHoanTac: "Hoàn tác",
	soPhanTu: {
		"ST-nenkara-nhan": { inline: 0, the: 0 },
		"ST-nenkara-inline-cho": { inline: 1, the: 0 },
		"ST-nenkara-inline-khoa": { inline: 1, the: 0 },
		"ST-nenkara-inline-loi": { inline: 1, the: 0 },
		"ST-nenkara-inline-sua": { inline: 1, the: 0 },
		"ST-nenkara-bien-nhan": { inline: 2, the: 0 },
		"ST-nenkara-the": { inline: 0, the: 2 },
		"ST-nenkara-phan-hoi": { inline: 0, the: 0 },
	},
	inputsE13: [
		"E10-ST-nenkara-inline-cho-1440-light.png",
		"E10-ST-nenkara-inline-cho-390-light.png",
		"E10-ST-nenkara-the-1440-light.png",
		"E10-ST-nenkara-bien-nhan-1440-light.png",
	],
};

const APP = process.env.APP_URL ?? "http://localhost:3000";
const ANH = join(GOC, process.env.BANG_CHUNG ?? `_acceptance/${SLUG}/evidence`);
const iDo = process.argv.indexOf("--kiem-do-do");
const KIEM_DO = iDo === -1 ? null : (process.argv[iDo + 1] ?? "vien");

const dong = [];
let sai = 0;

function ghi(ok, chu) {
	dong.push(`${ok ? "OK " : "SAI"} ${chu}`);
	if (!ok) sai += 1;
}

function khongDoDuoc(loi) {
	console.log(`KHONG DO DUOC: ${loi}`);
	process.exit(2);
}

function trangThaiTuDesign() {
	const chu = readFileSync(join(GOC, NK.designDoc), "utf8");
	const dau = chu.indexOf("<!-- <<<UX-STATE-TABLE -->");
	const cuoi = chu.indexOf("<!-- UX-STATE-TABLE>>> -->");
	if (dau === -1 || cuoi === -1)
		khongDoDuoc("design doc khong co khoi UX-STATE-TABLE");
	return [...chu.slice(dau, cuoi).matchAll(/^\|\s*(ST-[\w-]+)\s*\|/gm)]
		.map((m) => m[1])
		.filter((id) => id.startsWith(NK.trangThaiTien));
}

function napPuppeteer() {
	const bun = join(GOC, "node_modules/.bun");
	const thuMuc = readdirSync(bun).find((t) => t.startsWith("puppeteer-core@"));
	if (!thuMuc) khongDoDuoc("khong tim thay puppeteer-core");
	const goi = join(bun, thuMuc, "node_modules/puppeteer-core");
	return createRequire(join(goi, "package.json"))(goi);
}

async function cho(trang, ham, ...doiSo) {
	for (let i = 0; i < NK.cho.lanToiDa; i += 1) {
		if (await trang.evaluate(ham, ...doiSo)) return true;
		await new Promise((ok) => setTimeout(ok, NK.cho.nhipMs));
	}
	return false;
}

function chenLoi(kiemDo) {
	if (kiemDo === "the-khong-vien") {
		const the = document.querySelector(
			'[data-slot="proposed-change"][data-density="card"]',
		);
		if (!the) return false;
		the.style.borderWidth = "0px";
		return true;
	}
	const dau = document.querySelector(
		'[data-slot="proposed-change"][data-density="inline"]',
	);
	if (!dau) return false;
	if (kiemDo === "mat-phan-tu") dau.removeAttribute("data-density");
	if (kiemDo === "vien") dau.style.border = "1px solid rgb(200, 0, 0)";
	if (kiemDo === "hop-con") {
		const hop = document.createElement("div");
		hop.style.border = "1px solid rgb(200, 0, 0)";
		hop.style.background = "rgb(240, 240, 240)";
		hop.textContent = "hop";
		(dau.querySelector('[data-slot="item-content"]') ?? dau).appendChild(hop);
	}
	return true;
}

function doTrongTrang() {
	const alpha = (mau) => {
		if (!mau || mau === "transparent") return 0;
		const cheo = mau.match(/\/\s*([\d.]+%?)\s*\)$/);
		if (cheo)
			return cheo[1].endsWith("%")
				? Number.parseFloat(cheo[1]) / 100
				: Number(cheo[1]);
		const rgba = mau.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/);
		if (rgba) return Number(rgba[1]);
		return 1;
	};
	const CANH = ["Top", "Right", "Bottom", "Left"];
	const vienThay = (el) => {
		const s = getComputedStyle(el);
		return CANH.some(
			(c) =>
				Number.parseFloat(s[`border${c}Width`]) > 0 &&
				s[`border${c}Style`] !== "none" &&
				alpha(s[`border${c}Color`]) > 0,
		);
	};
	const nenThay = (el) => alpha(getComputedStyle(el).backgroundColor) > 0;
	const inline = [
		...document.querySelectorAll(
			'[data-slot="proposed-change"][data-density="inline"]',
		),
	];
	const loiInline = [];
	for (const g of inline) {
		if (vienThay(g) || nenThay(g)) loiInline.push("inline co vien");
		for (const con of g.querySelectorAll("*")) {
			if (con.closest("button, textarea, input, ins, del")) continue;
			if (vienThay(con) || nenThay(con)) {
				loiInline.push("inline co hop con");
				break;
			}
		}
	}
	const the = [
		...document.querySelectorAll(
			'[data-slot="proposed-change"][data-density="card"]',
		),
	];
	const theKhongVien = the.filter((g) => !vienThay(g)).length;
	return {
		soInline: inline.length,
		loiInline: [...new Set(loiInline)],
		soThe: the.length,
		theKhongVien,
		tranNgang: document.documentElement.scrollWidth - window.innerWidth,
	};
}

async function goLopPhu(trang) {
	await trang.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		]) {
			for (const el of document.querySelectorAll(s)) el.remove();
		}
	});
}

async function bamNut(trang, chon, chu) {
	return trang.evaluate(
		(c, t) => {
			const nut = [...document.querySelectorAll(c)].find(
				(b) => b.textContent?.trim() === t,
			);
			if (!nut) return false;
			nut.click();
			return true;
		},
		chon,
		chu,
	);
}

async function tuongTac(trang, id, nhan) {
	if (id === "ST-nenkara-nhan") {
		const bam = await bamNut(
			trang,
			'[data-slot="kara-label"] button',
			NK.chuViSao,
		);
		const mo =
			bam &&
			(await cho(
				trang,
				(t) =>
					document
						.querySelector('[data-slot="popover-content"]')
						?.textContent?.includes(t) ?? false,
				NK.tieuDeViSao,
			));
		ghi(mo, `${nhan}: o Vi sao mo voi «${NK.tieuDeViSao}»`);
		await trang.keyboard.press("Escape");
	}
	if (id === "ST-nenkara-bien-nhan") {
		const bam = await bamNut(
			trang,
			'[data-slot="proposed-change"][data-decided="accepted"] button',
			NK.chuHoanTac,
		);
		const ve =
			bam &&
			(await cho(
				trang,
				() =>
					document.querySelector(
						'[data-slot="proposed-change"]:not([data-decided]) button[data-variant="default"]',
					) !== null,
			));
		ghi(ve, `${nhan}: Hoan tac dua de xuat ve cho`);
	}
}

const tapDesign = trangThaiTuDesign();
const { PROTO_CATALOG } = await import(
	join(GOC, "apps/app/app/proto/catalog.ts")
);
const muc = PROTO_CATALOG.find((m) => m.slug === SLUG);
if (!muc) khongDoDuoc(`catalog khong co ${SLUG}`);
const tapCatalog = muc.states.map((s) => s.id);
const thieu = tapDesign.filter((id) => !tapCatalog.includes(id));
for (const id of tapDesign.filter((x) => !(x in NK.soPhanTu))) {
	ghi(false, `thieu so phan tu ghi truoc: ${id}`);
}
for (const id of thieu) ghi(false, `thieu trang thai: ${id}`);
if (tapDesign.length === 0) khongDoDuoc("bang trang thai rong");

const puppeteer = napPuppeteer();
mkdirSync(ANH, { recursive: true });
const trinhDuyet = await puppeteer.launch({
	executablePath: NK.chrome,
	headless: true,
});
let soO = 0;
try {
	const trang = await trinhDuyet.newPage();
	await trang.setCookie({ name: "lang", value: "vi", url: APP });
	for (const nen of NK.nen) {
		await trang.emulateMediaFeatures([
			{ name: "prefers-color-scheme", value: nen },
		]);
		for (const kho of NK.kho) {
			await trang.setViewport({ width: kho.rong, height: kho.cao });
			for (const id of tapDesign.filter((x) => tapCatalog.includes(x))) {
				const nhan = `${id} ${kho.ten} ${nen}`;
				const url = `${APP}/proto/${SLUG}?state=${id}`;
				const r = await trang.goto(url, {
					waitUntil: "networkidle0",
					timeout: NK.cho.manMs,
				});
				if (!r?.ok()) khongDoDuoc(`${r?.status()} ${url}`);
				const san = await cho(
					trang,
					(s) => document.querySelector(`main[data-state="${s}"]`) !== null,
					id,
				);
				if (!san) khongDoDuoc(`${nhan}: man khong dung`);
				await goLopPhu(trang);
				await new Promise((ok) => setTimeout(ok, NK.cho.lacMs));
				if (KIEM_DO && (await trang.evaluate(chenLoi, KIEM_DO))) {
					await new Promise((ok) => setTimeout(ok, NK.cho.lacMs));
				}
				const so = await trang.evaluate(doTrongTrang);
				const tep = join(ANH, `E10-${id}-${kho.ten}-${nen}.png`);
				await trang.screenshot({ path: tep, fullPage: true });
				soO += 1;
				for (const l of so.loiInline) ghi(false, `${nhan}: ${l}`);
				const kv = NK.soPhanTu[id];
				ghi(
					so.soInline === kv.inline && so.soThe === kv.the,
					`${nhan}: ${so.soInline === kv.inline && so.soThe === kv.the ? "so phan tu" : "so phan tu sai"} inline ${so.soInline}/${kv.inline}, the ${so.soThe}/${kv.the}`,
				);
				ghi(
					so.theKhongVien === 0,
					`${nhan}: ${so.theKhongVien === 0 ? "the co vien" : "the khong vien"} (${so.soThe - so.theKhongVien}/${so.soThe})`,
				);
				ghi(so.tranNgang <= 0, `${nhan}: tran ngang ${so.tranNgang}px`);
				dong.push(
					`    ${nhan}: inline ${so.soInline}, the ${so.soThe}, anh ${relative(GOC, tep)}`,
				);
				await tuongTac(trang, id, nhan);
			}
		}
	}
} finally {
	await trinhDuyet.close();
}

const can = tapDesign.length * NK.kho.length * NK.nen.length;
ghi(
	soO === can,
	`so o da do ${soO} = ${tapDesign.length} trang thai x ${NK.kho.length} kho x ${NK.nen.length} nen = ${can}`,
);
for (const t of NK.inputsE13)
	ghi(existsSync(join(ANH, t)), `inputs E13 co mat: ${t}`);
for (const d of dong) console.log(d);
console.log(sai === 0 ? "XANH" : `DO: ${sai} dong sai`);
process.exit(sai === 0 ? 0 : 1);
