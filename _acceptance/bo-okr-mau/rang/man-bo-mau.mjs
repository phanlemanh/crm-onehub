import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA =
	process.env.BANG_CHUNG ?? join(GOC, ".acceptance-runs/bo-okr-mau/evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const RONG = 1440;
const CHO_MS = 60_000;
const CHIEU_DO = process.argv.includes("--chieu-do");
const TIEN_TO = "mau-okr-";
const TRUONG = "nguyen-thi-lan";
const PHONG = "kd-bac";

const bo = JSON.parse(
	readFileSync(join(GOC, "apps/api/scripts/okr-mau/cong-ty.json"), "utf8"),
);
const idMau = (loai, ma) => `${TIEN_TO}${loai}-${ma}`;
const quy4 = idMau("chu-ky", "quy4");
const tenPhongMau = bo.phongBan.map((p) => p.ten);
const krDangBan = new Set(
	bo.mucTieu
		.filter(
			(m) => m.chuKy === "quy4" && (m.trangThai ?? "cong-bo") === "cong-bo",
		)
		.flatMap((m) =>
			m.krs
				.filter((k) => k.kichBan === "tut" || k.kichBan === "bo")
				.map((k) => idMau("kr", k.ma)),
		),
);

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

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);
if (
	!/_do$/.test(
		new URL(process.env.DATABASE_URL ?? "postgresql://x/khong").pathname,
	)
)
	await khongDo(
		"DATABASE_URL khong phai kho do rieng — chay qua scripts/lan-do/tien-de.mjs",
	);

if (!CHIEU_DO) {
	const nap = spawnSync("bun", ["scripts/okr-mau.ts"], {
		cwd: join(GOC, "apps/api"),
		env: process.env,
		encoding: "utf8",
	});
	kiem(
		`nap bo mau thoat ${nap.status}: ${(nap.stdout || nap.stderr).trim().split("\n").at(-1)}`,
		nap.status === 0,
	);
	if (nap.status !== 0) await ket(1);
}

const raPhien = execFileSync(
	"bun",
	["run", "dev:session", `${TRUONG}@mau.onehub.test`],
	{ cwd: join(GOC, "apps/api"), encoding: "utf8" },
);
const dongCookie = raPhien.trim().split("\n").pop().trim();
const dau = dongCookie.indexOf("=");
if (dau < 1) await khongDo("khong doc duoc cookie phien cua truong phong mau");
const cookie = {
	ten: dongCookie.slice(0, dau),
	gia: dongCookie.slice(dau + 1),
};

const res = await fetch(`${APP}/`, {
	redirect: "manual",
	headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
});
const dich = res.headers.get("location") ?? "";
const slug =
	new URL(dich || "/", APP).pathname.replace(/^\/+|\/+$/g, "").split("/")[0] ??
	"";
kiem(
	`sau dang nhap di toi "${dich}" — khong phai onboarding`,
	slug !== "" && !slug.startsWith("onboarding") && slug !== "sign-in",
);
if (!slug || slug.startsWith("onboarding") || slug === "sign-in") await ket(1);

mkdirSync(RA, { recursive: true });
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });
const host = new URL(APP).hostname;
const ctx = await trinhDuyet.createBrowserContext();
await ctx.setCookie(
	{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	{ name: "lang", value: "vi", domain: host, path: "/" },
);
const p = await ctx.newPage();
await p.setViewport({ width: RONG, height: 1600, deviceScaleFactor: 1 });

await p.goto(`${APP}/${slug}/okr/toan-canh?kyOkr=${quy4}`, {
	waitUntil: "load",
});
await p
	.waitForFunction(
		() => document.querySelectorAll("[data-hang-toan-canh]").length > 0,
		{ timeout: CHO_MS },
	)
	.catch(() => null);
await p.evaluate(() => document.fonts.ready);
const hang = await p.evaluate(() =>
	[...document.querySelectorAll("[data-hang-toan-canh]")]
		.filter((h) => h.checkVisibility())
		.map((h) => ({
			key: h.getAttribute("data-hang-toan-canh"),
			chu: h.textContent ?? "",
		})),
);
const hangMau = hang.filter((h) => h.key?.startsWith(`pb:${TIEN_TO}`));
const thieu = tenPhongMau.filter(
	(ten) => !hangMau.some((h) => h.chu.includes(ten)),
);
kiem(
	`toan canh hien ${hangMau.length}/10 phong ban mau${thieu.length ? ` — thieu phong ban mau: ${thieu.join(", ")}` : ""}`,
	hangMau.length === 10 && thieu.length === 0,
);
await p.screenshot({ path: join(RA, "E14-toan-canh.png"), fullPage: true });
dong.push(`ANH ${join(RA, "E14-toan-canh.png").slice(GOC.length + 1)}`);

await p.goto(
	`${APP}/${slug}/okr/theo-don-vi?kyOkr=${quy4}&donOkr=pb:${idMau("pb", PHONG)}&xemOkr=hop-tuan`,
	{ waitUntil: "load" },
);
await p
	.waitForFunction(
		() => document.querySelector('[data-trang-thai^="ST-hoptuan"]') !== null,
		{ timeout: CHO_MS },
	)
	.catch(() => null);
await p.evaluate(() => document.fonts.ready);
const hop = await p.evaluate(() => ({
	trangThai:
		document
			.querySelector('[data-trang-thai^="ST-hoptuan"]')
			?.getAttribute("data-trang-thai") ?? null,
	dong: [...document.querySelectorAll("[data-kr-hop]")]
		.filter((d) => d.checkVisibility())
		.map((d) => ({
			kr: d.getAttribute("data-kr-hop"),
			lyDo: [...d.querySelectorAll("[data-ly-do]")].map((x) =>
				x.getAttribute("data-ly-do"),
			),
		})),
}));
const banMau = hop.dong.filter(
	(d) => krDangBan.has(d.kr) && d.lyDo.some((l) => l === "tut" || l === "im"),
);
kiem(
	`hop tuan ${PHONG}: trang thai ${hop.trangThai}, ${banMau.length} KR dang ban thuoc tap tut/bo`,
	hop.trangThai === "ST-hoptuan-codulieu" && banMau.length >= 1,
);
await p.screenshot({ path: join(RA, "E14-hop-tuan.png"), fullPage: true });
dong.push(`ANH ${join(RA, "E14-hop-tuan.png").slice(GOC.length + 1)}`);

await ket(sai === 0 ? 0 : 1);
