import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { troLyOkrMessages } from "../../../apps/app/lib/messages/tro-ly-okr.ts";
import { formatMoney } from "../../../packages/ui/src/lib/format.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = join(GOC, ".acceptance-runs/tro-ly-okr-nen");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const QUAN_TRI = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const THANH_VIEN = process.env.THANH_VIEN ?? "marcus@trycomp.ai";
const CHO_MS = 30_000;
const m = troLyOkrMessages("vi");
const XU = 100;

const dong = [];
let sai = 0;
let trinhDuyet = null;

async function ket(ma) {
	if (trinhDuyet) await trinhDuyet.close().catch(() => {});
	for (const d of dong) console.log(d);
	console.log(
		`KET LUAN: ${dong.filter((d) => d.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
	);
	process.exit(ma);
}

async function khongDo(cau) {
	dong.push(`KHONG DO DUOC: ${cau}`);
	await ket(2);
}

function kiem(nhan, dat) {
	if (dat) dong.push(`DUNG ${nhan}`);
	else {
		sai += 1;
		dong.push(`SAI ${nhan}`);
	}
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) return null;
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function doc(cookie, thuTuc) {
	const res = await fetch(`${API}/api/trpc/${thuTuc}`, {
		headers: { cookie: `${cookie.ten}=${cookie.gia}` },
	});
	const body = await res.json().catch(() => null);
	return { ma: res.status, data: body?.result?.data ?? null };
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
	return dau && !dau.startsWith("onboarding") && dau !== "sign-in" ? dau : null;
}

const tien = (usd, lang = "vi") =>
	formatMoney(Math.round(usd * XU), "usd", lang);

async function moTrang(cookie, rong, lang = "vi") {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: lang, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: 1800, deviceScaleFactor: 1 });
	await p.goto(`${APP}/${slug}/settings/okr`, { waitUntil: "load" });
	return { ctx, p };
}

const daTai = () => {
	const hien = (o) => o !== null && o.checkVisibility();
	const tl = document.querySelector('[data-the="tro-ly-okr"]:not([aria-busy])');
	const so = document.querySelector('[data-the="so-chi-phi"]:not([aria-busy])');
	return hien(tl) && hien(so);
};

async function choTai(p) {
	await p.waitForFunction(daTai, { timeout: CHO_MS }).catch(() => null);
	await p.evaluate(() => document.fonts.ready);
}

async function anh(p, ten) {
	const tep = join(RA, `e15-${ten}.png`);
	await p.screenshot({ path: tep, fullPage: true });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
}

async function gieoChi(usdTheoTinhNang) {
	const { db } = await import("../../../packages/db/src/index.ts");
	const { ghiChiPhi } = await import("../../../packages/db/src/ai-chi-phi.ts");
	for (const [i, [tinhNang, usd]] of usdTheoTinhNang.entries()) {
		await ghiChiPhi(db, {
			id: `e15-${Date.now()}-${i}`,
			at: new Date(),
			sessionId: "e15-phien",
			phienCha: null,
			kenh: null,
			tinhNang,
			taskId: null,
			modelId: null,
			inputTokens: 100,
			cacheReadTokens: 0,
			outputTokens: 10,
			costUsd: usd,
		});
	}
}

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);

const quanTri = phien(QUAN_TRI);
const thanhVien = phien(THANH_VIEN);
if (!quanTri || !thanhVien) await khongDo("khong doc duoc cookie phien");
const ctQT = await doc(quanTri, "okr.program");
const ctTV = await doc(thanhVien, "okr.program");
if (ctQT.data?.canManage !== true)
	await khongDo(
		`${QUAN_TRI} khong phai quan tri (canManage ${ctQT.data?.canManage})`,
	);
if (ctTV.data?.canManage !== false)
	await khongDo(`${THANH_VIEN} khong phai thanh vien thuong`);
const slug = await suySlug(quanTri);
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

await gieoChi([
	["crm.nghien-cuu", 1.23],
	["crm.hoi-dap", 0.45],
	["zalo.hoi-crm", 0.31],
	["crm.tac-nhan", 0.27],
	["okr.de-xuat", 0.5],
]);

mkdirSync(RA, { recursive: true });
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });

{
	const { ctx, p } = await moTrang(quanTri, 1440);
	await choTai(p);
	const api = (await doc(quanTri, "okr.aiChiTieu")).data;
	const man = await p.evaluate(() => {
		const hien = (o) => o.checkVisibility();
		const dongBang = [
			...document.querySelectorAll('[data-the="so-chi-phi"] [data-nhom]'),
		].filter(hien);
		return {
			sanSang:
				document.querySelector("[data-san-sang]")?.textContent?.trim() ?? null,
			dong: dongBang.map((d) => ({
				nhom: d.getAttribute("data-nhom"),
				tien: d.querySelector("[data-tien]")?.textContent?.trim() ?? null,
			})),
			tran: document.querySelector("[data-tran]")?.textContent ?? "",
		};
	});
	kiem(
		`quan tri: chi bao "${man.sanSang}"`,
		man.sanSang === m.troLy.sanSang.dangTat,
	);
	const viec = man.dong.filter(
		(d) => d.nhom !== "tong" && d.nhom !== "chua-gan",
	);
	kiem(`quan tri: ${viec.length} dong viec`, viec.length === 5);
	for (const d of man.dong) {
		const ky =
			d.nhom === "tong"
				? tien(api.tongUsd)
				: tien(api.theoNhom.find((n) => n.nhom === d.nhom)?.usd ?? -1);
		kiem(`quan tri: tien ${d.nhom} "${d.tien}" = API "${ky}"`, d.tien === ky);
	}
	kiem(
		`quan tri: thanh tran "${man.tran.trim()}"`,
		man.tran.includes(
			`${tien(api.troLyOkr.chiUsd)} / ${tien(api.troLyOkr.tranUsd)}`,
		),
	);
	await anh(p, "buoc-quan-tri");

	const nhatKy = [];
	p.on("console", (c) => {
		if (c.type() === "error" || c.type() === "warn")
			nhatKy.push(`console ${c.type()}: ${c.text().slice(0, 200)}`);
	});
	p.on("requestfinished", (r) => {
		if (r.url().includes("setProgram"))
			nhatKy.push(
				`mang ${r.method()} ${r.url().slice(-60)} ${r.response()?.status()}`,
			);
	});
	await p.click('[data-cong-tac="tro-ly-okr"]');
	await p.click('[data-pham-vi="de-xuat"]');
	await p.waitForSelector('[role="option"]', { timeout: CHO_MS });
	const luaChon = await p.$$('[role="option"]');
	for (const o of luaChon) {
		const chu = await o.evaluate((x) => x.textContent?.trim());
		if (chu === m.troLy.phamVi["toan-cong-ty"]) {
			await o.click();
			break;
		}
	}
	const moKhoa = await p
		.waitForFunction(
			() => getComputedStyle(document.body).pointerEvents !== "none",
			{
				timeout: CHO_MS,
			},
		)
		.then(() => true)
		.catch(() => false);
	kiem("quan tri: o chon dong xong tra lai con tro cho trang", moKhoa);
	const oTran = await p.$("[data-o-tran-ai]");
	await oTran.click();
	await oTran.evaluate((o) => o.select());
	await oTran.type("7,5");
	await p
		.waitForFunction(
			() =>
				document.querySelector('[data-nut="luu-tro-ly"]')?.disabled === false,
			{ timeout: CHO_MS },
		)
		.catch(() => null);
	nhatKy.push(
		`truoc bam ${JSON.stringify(
			await p.evaluate(() => {
				const b = document.querySelector('[data-nut="luu-tro-ly"]');
				const o = document.querySelector("[data-o-tran-ai]");
				return {
					tat: b?.disabled,
					form: b?.form?.id ?? null,
					coForm: document.getElementById("okr-tro-ly") !== null,
					tran: o?.value,
					congTac: document
						.querySelector('[data-cong-tac="tro-ly-okr"]')
						?.getAttribute("aria-checked"),
					phamVi: document.querySelector('[data-pham-vi="de-xuat"]')
						?.textContent,
					diem: (() => {
						const r = b?.getBoundingClientRect();
						if (!r) return null;
						const e = document.elementFromPoint(
							r.x + r.width / 2,
							r.y + r.height / 2,
						);
						return `${e?.tagName}.${e?.getAttribute("data-slot") ?? ""}.${e?.getAttribute("data-nut") ?? ""} body-pe=${getComputedStyle(document.body).pointerEvents}`;
					})(),
				};
			}),
		)}`,
	);
	await p.click('[data-nut="luu-tro-ly"]');
	const daLuu = await p
		.waitForFunction(
			(cau) => document.body.innerText.includes(cau),
			{ timeout: CHO_MS },
			m.troLy.daLuu,
		)
		.then(() => true)
		.catch(() => false);
	kiem("quan tri: bao da luu", daLuu);
	for (const d of nhatKy) dong.push(`NHAT KY ${d}`);
	const sau = (await doc(quanTri, "okr.program")).data;
	kiem(
		`quan tri: phien ban ${ctQT.data.version} -> ${sau?.version}, aiOn ${sau?.aiOn}, pham vi ${sau?.aiDeXuatPhamVi}, tran ${sau?.aiTranThangUsd}`,
		sau?.version === ctQT.data.version + 1 &&
			sau.aiOn === true &&
			sau.aiDeXuatPhamVi === "toan-cong-ty" &&
			sau.aiTranThangUsd === 7.5,
	);
	await anh(p, "buoc-da-luu");
	await ctx.close();
}

{
	const truoc = (await doc(quanTri, "okr.aiChiTieu")).data;
	const them = Math.round((0.85 * 7.5 - truoc.troLyOkr.chiUsd) * XU) / XU;
	if (them > 0) await gieoChi([["okr.de-xuat", them]]);
	const { ctx, p } = await moTrang(quanTri, 1440);
	await choTai(p);
	const tran = await p.evaluate(
		() => document.querySelector("[data-tran]")?.textContent ?? "",
	);
	kiem(`80%: "${tran.trim()}"`, tran.includes(m.so.muc80));
	await anh(p, "buoc-80");
	await ctx.close();
}

for (const [rong, lang] of [
	[1440, "en"],
	[390, "vi"],
]) {
	const { ctx, p } = await moTrang(quanTri, rong, lang);
	await choTai(p);
	const tran = await p.evaluate(
		() => document.documentElement.scrollWidth - window.innerWidth,
	);
	kiem(`${rong}/${lang}: tran ngang ${tran}px`, tran <= 0);
	await anh(p, `buoc-${rong}-${lang}`);
	await ctx.close();
}

{
	const { ctx, p } = await moTrang(thanhVien, 1440);
	await p
		.waitForFunction(
			() => document.querySelector("[data-the='cau-hinh']")?.checkVisibility(),
			{
				timeout: CHO_MS,
			},
		)
		.catch(() => null);
	const the = await p.evaluate(
		() =>
			[
				...document.querySelectorAll(
					"[data-the='tro-ly-okr'], [data-the='so-chi-phi']",
				),
			].filter((o) => o.checkVisibility()).length,
	);
	kiem(`thanh vien: ${the} khoi AI dang hien`, the === 0);
	await anh(p, "buoc-thanh-vien");
	await ctx.close();
}

await ket(sai === 0 ? 0 : 1);
