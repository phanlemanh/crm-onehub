#!/usr/bin/env bun
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const DICH = join(GOC, ".acceptance-runs", "hydrat-thanh-bieu-tuong", "evidence");

const { canhCay } = await import(
	"../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs"
);
const { API, APP, CHROME, chiaCookie, datTrinhDuyet, ket, khongDo } =
	await import("../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs");

const DO = {
	luot: Number(process.env.LUOT ?? 8),
	rong: 1440,
	cao: 900,
	choTaiMs: 120_000,
	choSauTaiMs: 1500,
};
const MIEN_MAU = "mau.onehub.test";
const QUY4 = "mau-okr-chu-ky-quy4";
const NGUOI = { quanTri: "le-hai-dang", chiOkr: "doan-thi-thu" };
const LOI_HYDRAT = /Hydration failed|didn't match|hydrated but some attributes/i;
const CUA_THANH = /AppIconRail|aria-busy/;
const NAV_THANH = /<nav\b[^>]*app-rail[^>]*>[\s\S]*?<\/nav>/g;

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const { isMeasureDatabase } = await import(
	"../../../packages/db/src/measure-database.ts"
);
const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho) || process.env.PHIEN_DO !== tenKho)
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do cua chinh phien) — kho "${tenKho}", PHIEN_DO "${process.env.PHIEN_DO ?? ""}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

const { default: puppeteer } = await import("puppeteer-core");
const { db } = await import("../../../packages/db/src/index.ts");
const { MUC_RAIL } = await import("../../../apps/app/lib/khung-dieu-huong.ts");
const { mucRailChoVai } = await import("../../../apps/app/lib/pham-vi-man.ts");

const SO_MUC = {
	quanTri: MUC_RAIL.length,
	chiOkr: mucRailChoVai("okr").length,
};
if (SO_MUC.chiOkr >= SO_MUC.quanTri)
	await khongDo(
		`KHONG DO DUOC: vai okr khong rut gon thanh (${SO_MUC.chiOkr} >= ${SO_MUC.quanTri}) — doi chung duong mat`,
	);

const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);
const mu = (c) => ({ Cookie: `${c.ten}=${c.gia}; lang=vi` });

async function napBoMau() {
	const truoc = await db.okrCycle.count();
	if (truoc === 0) {
		const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
			cwd: join(GOC, "apps", "api"),
			env: process.env,
			encoding: "utf8",
		});
		const dong = `${nap.stdout ?? ""}${nap.stderr ?? ""}`.trim().split("\n").at(-1);
		console.log(`  nap bo OKR mau: ma ${nap.status} — ${dong}`);
		if (nap.status !== 0)
			await khongDo(`KHONG DO DUOC: nap bo OKR mau thoat ${nap.status}: ${dong}`);
	}
	const mt = await db.okrObjective.findFirst({
		where: { cycleId: QUY4 },
		select: { id: true, keyResults: { select: { id: true }, take: 1 } },
		orderBy: { id: "asc" },
	});
	if (!mt?.keyResults[0])
		await khongDo("KHONG DO DUOC: bo mau khong co muc tieu co KR trong quy 4");
	return { mucTieu: mt.id, kr: mt.keyResults[0].id };
}

async function vaiCua(email) {
	const u = await db.user.findUnique({
		where: { email },
		select: { id: true, members: { select: { role: true } } },
	});
	if (!u) await khongDo(`KHONG DO DUOC: bo mau khong co nguoi ${email}`);
	return u.members.map((m) => m.role);
}

async function suySlug(c) {
	const res = await fetch(`${APP}/`, { redirect: "manual", headers: mu(c) });
	const dich = res.headers.get("location") ?? "";
	const dau = new URL(dich || "/", APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
	if (!dau || ["sign-in", "onboarding", "het-quyen"].includes(dau))
		await khongDo(`KHONG DO DUOC: ${APP}/ tro ve "${dich}" — khong suy duoc slug`);
	return dau;
}

function thanhTrongHtml(html) {
	const nav = html.match(NAV_THANH) ?? [];
	const cuoi = nav.at(-1) ?? "";
	return {
		soNav: nav.length,
		ban: /aria-busy="true"/.test(cuoi.slice(0, cuoi.indexOf(">") + 1)),
		lienKet: (cuoi.match(/<a\b/g) ?? []).length,
	};
}

const hong = [];
let soKiem = 0;
const kiem = (nhan, dat) => {
	soKiem += 1;
	if (!dat) hong.push(nhan);
	return dat;
};

let trinhDuyet = null;
let ma = 0;
try {
	const id = await napBoMau();
	const cookie = {};
	for (const [k, ten] of Object.entries(NGUOI)) {
		const email = `${ten}@${MIEN_MAU}`;
		const vai = await vaiCua(email);
		const can = k === "chiOkr" ? "okr" : "admin";
		if (!vai.includes(can))
			await khongDo(`KHONG DO DUOC: ${email} co vai [${vai.join(",")}], can ${can}`);
		cookie[k] = phienCua(email);
	}
	const slug = await suySlug(cookie.quanTri);
	const MAN = [
		"/okr",
		`/okr?record=objective:${id.mucTieu}`,
		`/okr?record=kr:${id.kr}`,
		"",
	];
	console.log(
		`man-thanh: slug ${slug} · muc tieu ${id.mucTieu} · kr ${id.kr} · so muc quanTri=${SO_MUC.quanTri} chiOkr=${SO_MUC.chiOkr} · luot=${DO.luot}`,
	);

	for (const [k, c] of Object.entries(cookie)) {
		for (const m of MAN) {
			const res = await fetch(`${APP}/${slug}${m}`, { headers: mu(c) });
			const t = thanhTrongHtml(await res.text());
			const nhan = `html may chu ${k} /${slug}${m}`;
			kiem(`${nhan}: tra ${res.status}`, res.status === 200);
			kiem(`${nhan}: khong thay nav cua thanh`, t.soNav > 0);
			kiem(`${nhan}: thanh may chu van ban cho (aria-busy)`, !t.ban);
			kiem(
				`${nhan}: ${t.lienKet} lien ket thay ${SO_MUC[k]}`,
				t.lienKet === SO_MUC[k],
			);
			console.log(`  ${nhan}: ${t.soNav} nav · ban=${t.ban} · ${t.lienKet} lien ket`);
		}
	}

	trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
	datTrinhDuyet(trinhDuyet);
	const host = new URL(APP).hostname;
	const loiThanh = [];
	const loiKhac = [];
	let soLuot = 0;
	mkdirSync(DICH, { recursive: true });
	for (const [k, c] of Object.entries(cookie)) {
		const ctx = await trinhDuyet.createBrowserContext();
		await ctx.setCookie(
			{ name: c.ten, value: c.gia, domain: host, path: "/" },
			{ name: "lang", value: "vi", domain: host, path: "/" },
		);
		for (let l = 0; l < DO.luot; l++) {
			for (const m of MAN) {
				const trang = await ctx.newPage();
				await trang.setViewport({ width: DO.rong, height: DO.cao });
				const loi = [];
				trang.on("pageerror", (e) => loi.push(String(e)));
				trang.on("console", (x) => {
					if (x.type() === "error") loi.push(x.text());
				});
				await trang.goto(`${APP}/${slug}${m}`, {
					waitUntil: "networkidle0",
					timeout: DO.choTaiMs,
				});
				await new Promise((x) => setTimeout(x, DO.choSauTaiMs));
				soLuot += 1;
				for (const t of loi.filter((t) => LOI_HYDRAT.test(t))) {
					const dong = `${k} luot ${l} /${slug}${m}: ${t.replace(/\s+/g, " ").slice(0, 400)}`;
					(CUA_THANH.test(t) ? loiThanh : loiKhac).push(dong);
				}
				if (l === 0) {
					const sauTai = await trang.$eval("nav[class*='app-rail']", (n) => ({
						ban: n.getAttribute("aria-busy") === "true",
						lienKet: n.querySelectorAll("a[href]").length,
					}));
					const nhan = `sau tai ${k} /${slug}${m}`;
					kiem(`${nhan}: thanh con ban`, !sauTai.ban);
					kiem(
						`${nhan}: ${sauTai.lienKet} lien ket thay ${SO_MUC[k]}`,
						sauTai.lienKet === SO_MUC[k],
					);
					if (m === "/okr") {
						const anh = join(DICH, `htbt-thanh-${k}-${DO.rong}.png`);
						const nav = await trang.$("nav[class*='app-rail']");
						await nav.screenshot({ path: anh });
						console.log(`  anh: ${relative(GOC, anh)}`);
					}
				}
				await trang.close();
			}
		}
		await ctx.close();
	}
	console.log(`  tai trinh duyet: ${soLuot} luot`);
	console.log(`  loi hydrat cua thanh: ${loiThanh.length}`);
	for (const d of loiThanh.slice(0, 5)) console.log(`    ${d}`);
	console.log(`  loi hydrat khac (ngoai vong, khong tinh hong): ${loiKhac.length}`);
	for (const d of loiKhac.slice(0, 5)) console.log(`    ${d}`);
	kiem(`loi hydrat cua thanh: ${loiThanh.length}/${soLuot} luot`, loiThanh.length === 0);
} catch (e) {
	hong.push(`nem: ${String(e?.stack ?? e).slice(0, 600)}`);
} finally {
	console.log(`man-thanh: ${soKiem} kiem, ${hong.length} hong`);
	for (const h of hong) console.log(`  HONG ${h}`);
	ma = hong.length === 0 ? 0 : 1;
	await db.$disconnect().catch(() => {});
}
await ket(ma);
