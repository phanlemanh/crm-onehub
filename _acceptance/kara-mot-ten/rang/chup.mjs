import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { karaBanGhiMessages } from "../../../apps/app/lib/messages/kara-ban-ghi.ts";
import { okrSoanMessages } from "../../../apps/app/lib/messages/okr-soan.ts";
import { taiLieuMessages } from "../../../apps/app/lib/messages/tai-lieu.ts";
import { troLyOkrMessages } from "../../../apps/app/lib/messages/tro-ly-okr.ts";
import { ghiChiPhi } from "../../../packages/db/src/ai-chi-phi.ts";
import { db } from "../../../packages/db/src/index.ts";
import { moCuoc } from "../../../packages/db/src/okr-cuoc-soan.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "../../..");
const RA = join(HERE, "..", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const EMAIL = process.env.QUAN_TRI ?? "ada@trycomp.ai";
const KHO = [
	[1440, 1000],
	[390, 844],
];
const CHO_MS = 30_000;
const CAM_VI = [
	"Trợ lý",
	"trợ lý",
	"Máy soạn",
	"máy soạn",
	"Máy góp ý",
	"máy góp ý",
	"Máy tóm tắt",
	"máy tóm tắt",
	"Máy ghi số",
	"Máy chạy ở chế độ ẩn",
	"Máy đang soạn",
	"máy không đọc",
	"Tác nhân nghiên cứu",
];
const KY_MAU = "mau-okr-chu-ky-quy4";
const PB_MAU = "mau-okr-pb-kd-bac";
const t = troLyOkrMessages("vi");
const ts = okrSoanMessages("vi");
const tk = karaBanGhiMessages("vi");
const tl = taiLieuMessages("vi");

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

async function mo(ctx, duong, rong, cao) {
	const p = await ctx.newPage();
	await p.setViewport({ width: rong, height: cao, deviceScaleFactor: 1 });
	await p.goto(`${APP}${duong}`, { waitUntil: "load" });
	return p;
}

const chuan = (x) => x.replace(/[\u00a0\u202f]/g, " ").normalize("NFC");
const chuChinh = (p) =>
	p.evaluate(() =>
		document.body.innerText.replace(/[\u00a0\u202f]/g, " ").normalize("NFC"),
	);
const cuonToi = (p, chu) =>
	p.evaluate((c) => {
		const el = [
			...document.querySelectorAll(
				"h1,h2,h3,h4,[data-slot=card-title],button,p,span",
			),
			...[...document.querySelectorAll("body *")].filter(
				(e) => e.children.length === 0,
			),
		].find((e) => e.textContent?.trim().startsWith(c));
		el?.scrollIntoView({ block: "start" });
		return Boolean(el);
	}, chu);
const camTrong = (chu) => CAM_VI.filter((c) => chu.includes(c));
const tran = (p) =>
	p.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);
const choChu = (p, chu) =>
	p
		.waitForFunction(
			(c) =>
				document.body.innerText
					.replace(/[\u00a0\u202f]/g, " ")
					.normalize("NFC")
					.includes(c),
			{ timeout: CHO_MS },
			chu,
		)
		.catch(() => null);

const cay = await canhCay();
if (cay.ket !== "dung-cay")
	await khongDo(
		`${APP} khong phuc vu cay dang xet (${cay.ket}) — ${cay.dong.join(" · ")}`,
	);

const congTy = await db.company.findFirst({
	select: { id: true },
	orderBy: { createdAt: "asc" },
});
const cookie = phien(EMAIL);
if (!cookie) await khongDo(`khong doc duoc cookie phien cua ${EMAIL}`);
const slug =
	(await suySlug(cookie)) ??
	(await db.organization.findFirst({ select: { slug: true } }))?.slug ??
	null;
if (!slug) await khongDo(`${APP}/ khong chuyen toi trang chinh cua workspace`);

mkdirSync(RA, { recursive: true });
const host = new URL(APP).hostname;
trinhDuyet = await puppeteer.launch({ executablePath: CHROME, headless: true });

const ada = await db.user.findUnique({
	where: { email: EMAIL },
	select: { id: true },
});
if (!ada) await khongDo(`kho do khong co ${EMAIL}`);
const mau = spawnSync("bun", ["run", "okr:mau"], {
	cwd: GOC,
	encoding: "utf8",
	env: process.env,
});
if (mau.status !== 0)
	await khongDo(
		`okr:mau thoat ${mau.status}: ${(mau.stderr ?? "").slice(-400)}`,
	);
const cuoc = await moCuoc(db, {
	cycleId: KY_MAU,
	level: "phong-ban",
	divisionId: null,
	departmentId: PB_MAU,
	nguoiMoUserId: ada.id,
	sessionId: `kmt-chup-${Date.now()}`,
	nac: "bat",
});

for (const [i, tinhNang] of [
	"crm.nghien-cuu",
	"okr.de-xuat",
	"crm.tac-nhan",
].entries())
	await ghiChiPhi(db, {
		id: `kmt-chup-${Date.now()}-${i}`,
		at: new Date(),
		sessionId: "kmt-chup",
		phienCha: null,
		kenh: null,
		tinhNang,
		taskId: null,
		modelId: null,
		inputTokens: 100,
		cacheReadTokens: 0,
		outputTokens: 10,
		costUsd: 0.05,
	});

async function chupCuon(p, chu, ten, rong) {
	const thay = await cuonToi(p, chu);
	await new Promise((r) => setTimeout(r, 400));
	const tep = join(RA, `${ten}-${rong}.png`);
	await p.screenshot({ path: tep });
	dong.push(`ANH ${tep.slice(GOC.length + 1)}`);
	return thay;
}

for (const [rong, cao] of KHO) {
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	const p = await mo(ctx, `/${slug}/settings/okr`, rong, cao);
	await choChu(p, t.troLy.bat);
	await p.evaluate(() => document.fonts.ready);
	const chu = await chuChinh(p);
	kiem(
		`E14 ${rong}: cai dat OKR co tieu de «${t.troLy.tieuDe}»`,
		chu.includes(t.troLy.tieuDe),
	);
	kiem(`E14 ${rong}: nut «${t.troLy.bat}»`, chu.includes(t.troLy.bat));
	kiem(
		`E14 ${rong}: cai dat OKR khong cum cam [${camTrong(chu).join(", ")}]`,
		camTrong(chu).length === 0,
	);
	kiem(`E14 ${rong}: tran ngang ${await tran(p)}px`, (await tran(p)) <= 0);
	kiem(
		`E14 ${rong}: cuon toi the «${t.troLy.tieuDe}»`,
		await chupCuon(p, t.troLy.tieuDe, "E14-cai-dat-okr", rong),
	);
	const coSo = await choChu(p, t.so.nhom["tro-ly-ai"]);
	const chuSo = await chuChinh(p);
	kiem(
		`E14 ${rong}: so chi phi co nhom «${t.so.nhom["tro-ly-okr"]}», «${t.so.nhom["tro-ly-ai"]}», «${t.so.nhom["tac-nhan"]}»`,
		Boolean(coSo) &&
			chuSo.includes(t.so.nhom["tro-ly-ai"]) &&
			chuSo.includes(t.so.nhom["tac-nhan"]),
	);
	await chupCuon(p, t.so.nhom["tro-ly-ai"], "E14-so-chi-phi", rong);

	if (rong === 1440) {
		const man = [
			[
				"soan-okr",
				`/${slug}/okr/soan/${encodeURIComponent(cuoc.id)}`,
				ts.trang.chuaCauHinh,
			],
			["tai-lieu", `/${slug}/tai-lieu?tabTaiLieu=hoi`, tl.hoi.gioiThieu],
			...(congTy
				? [
						[
							"tab-kara",
							`/${slug}/companies?record=company:${congTy.id}&tab=agent`,
							tk.tab.theoLoai.company.tieuDe,
						],
					]
				: []),
		];
		if (!congTy)
			dong.push("KHONG DO DUOC: kho do khong co cong ty nao de mo tab Kara");
		for (const [ten, duong, dau] of man) {
			const q = await mo(ctx, duong, rong, cao);
			const thay =
				(await choChu(q, chuan(dau))) ??
				(await new Promise((r) => setTimeout(r, 1500)).then(() =>
					choChu(q, chuan(dau)),
				));
			await new Promise((r) => setTimeout(r, 800));
			const c = await chuChinh(q);
			if (!c.includes(chuan(dau)))
				dong.push(`CHU ${ten}: ${c.slice(0, 500).replaceAll("\n", " | ")}`);
			kiem(
				`E14 ${ten}: man da mo, thay «${dau}»`,
				Boolean(thay) && c.includes(chuan(dau)),
			);
			kiem(`E14 ${ten}: co chu Kara`, c.includes("Kara"));
			kiem(
				`E14 ${ten}: khong cum cam [${camTrong(c).join(", ")}]`,
				camTrong(c).length === 0,
			);
			const anh = join(RA, `E14-${ten}-1440.png`);
			await q.screenshot({ path: anh });
			dong.push(`ANH ${anh.slice(GOC.length + 1)}`);
		}
	}
	await ctx.close();
}

await ket(sai === 0 ? 0 : 1);
