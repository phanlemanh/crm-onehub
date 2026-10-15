import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import {
	chayNhac,
	lenLichNhac,
} from "../../../apps/agent/agent/lib/nhac-ke-hoach.ts";
import { thongBaoMessages } from "../../../apps/app/lib/messages/thong-bao.ts";
import { db } from "../../../packages/db/src/index.ts";
import { mocNhac } from "../../../packages/db/src/onboarding-nhac.ts";
import { taoViec } from "../../../packages/db/src/viec-ghi.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "hop-thong-bao-tren-web", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const NGAY_MS = 24 * 60 * 60 * 1000;
const m = thongBaoMessages("vi");
const MAN = [
	["tong-quan", ""],
	["okr", "/okr"],
	["viec", "/viec"],
];
const MA_TRAN = [
	...MAN.map(([t]) => `chuong-${t}-1280`),
	"mo-1280",
	"bam-1280",
	"doc-het-1280",
	"chuong-375",
	"trang-375",
	"trang-1280",
];
const CHUONG = "[data-slot=chuong-thong-bao]";
const SO = "[data-slot=so-chua-doc]";

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null, member: null, viec: [] };

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma}: ${nhan}`);
	if (!dat) sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien(email) {
	const ra = execFileSync("bun", ["run", "dev:session", email], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${email}`);
	return { ten: cookie.slice(0, dau), gia: cookie.slice(dau + 1) };
}

async function suySlug(cookie) {
	const res = await fetch(`${APP}/`, {
		redirect: "manual",
		headers: { cookie: `${cookie.ten}=${cookie.gia}; lang=vi` },
	});
	const dich = res.headers.get("location");
	if (!dich) khongDo(`${APP}/ tra ${res.status} khong co Location`);
	const dau = new URL(dich, APP).pathname.split("/").filter(Boolean)[0];
	if (!dau || dau === "sign-in" || dau.startsWith("onboarding"))
		khongDo(`${APP}/ chuyen toi ${dich}`);
	return dau;
}

async function nguoiKhongKenh() {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: {
			id: true,
			members: { select: { organizationId: true }, take: 1 },
		},
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `htb-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `htb-${ma}`,
			email,
			name: "Người đo Thông báo",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = nguoi.id;
	await db.member.create({
		data: {
			id: `member-htb-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	tao.member = `member-htb-${ma}`;
	const coKenh =
		(await db.zaloLink.count({ where: { crmUserId: nguoi.id } })) +
		(await db.slackMemberMatch.count({ where: { crmUserId: nguoi.id } }));
	if (coKenh > 0) khongDo("nguoi do co kenh — khong do duoc nguoi khong kenh");
	return { id: nguoi.id, email, giao: qt.id };
}

async function gieoQuaLuotNhac(nguoi) {
	const now = new Date();
	for (const [i, tieuDe] of [
		"Đo màn: gửi báo giá Hoà Phát",
		"Đo màn: chốt lịch ký Vinamilk",
	].entries()) {
		const v = await db.$transaction((tx) =>
			taoViec(tx, {
				nguoiId: nguoi.giao,
				tieuDe,
				hanNgay: new Date(now.getTime() - (i + 2) * NGAY_MS),
				nguoiThucHienId: nguoi.id,
				gan: [],
				nguon: "web",
				now,
			}),
		);
		tao.viec.push({ id: v.id, tieuDe });
	}
	const luc = new Date(
		Math.max(now.getTime(), mocNhac(now).getTime() + 60_000),
	);
	await lenLichNhac(luc);
	const hang = await db.agentTask.findFirst({
		where: {
			kind: "nhac-ke-hoach",
			subject: { startsWith: `user:${nguoi.id}:` },
		},
		select: { id: true },
	});
	if (!hang) khongDo("luot nhac khong tao hang cho nguoi do");
	const ket = await chayNhac(hang, { appUrl: APP });
	const so = await db.thongBao.count({ where: { nguoiNhanId: nguoi.id } });
	if (so < 2) khongDo(`luot nhac ${ket} chi ghi ${so} thong bao`);
	return so;
}

async function trang(cookie, kho) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function mo(p, url, sel) {
	await p.goto(url, { waitUntil: "domcontentloaded", timeout: CHO_MS });
	const thay = await p
		.waitForSelector(sel, { timeout: CHO_MS })
		.then(() => true)
		.catch(() => false);
	if (!thay) {
		await p.screenshot({ path: join(RA, "khong-thay.png") }).catch(() => {});
		khongDo(`${url}: khong thay ${sel}`);
	}
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
	await p.evaluate(() => {
		for (const s of [
			"nextjs-portal",
			".tsqd-parent-container",
			".tsqd-open-btn-container",
		])
			for (const el of document.querySelectorAll(s)) el.remove();
	});
}

const anh = (p, ten) => p.screenshot({ path: join(RA, `${ten}.png`) });
const cuon = (p) => p.evaluate(() => document.documentElement.scrollWidth);
const soTren = (p) =>
	p.evaluate((s) => document.querySelector(s)?.textContent ?? "", SO);

async function soApi(p) {
	return p.evaluate(async () => {
		const r = await fetch("/api/trpc/thongBao.chuong", {
			credentials: "include",
		});
		const j = await r.json();
		return (
			j?.result?.data?.json?.soChuaDoc ?? j?.result?.data?.soChuaDoc ?? null
		);
	});
}

async function trongKhung(p, sel) {
	return p.evaluate((s) => {
		const b = document.querySelector(s);
		if (!b || b.offsetParent === null) return false;
		const r = b.getBoundingClientRect();
		return (
			r.top >= 0 &&
			r.left >= 0 &&
			r.right <= window.innerWidth &&
			r.bottom <= window.innerHeight
		);
	}, sel);
}

async function bamChu(p, sel, chu) {
	const h = await p.evaluateHandle(
		(s, c) =>
			[...document.querySelectorAll(s)].find(
				(e) => (e.textContent ?? "").trim() === c,
			) ?? null,
		sel,
		chu,
	);
	const el = h.asElement();
	if (!el) return false;
	await el.click();
	return true;
}

async function moChuong(p) {
	await p.click(CHUONG);
	await p.waitForSelector("[data-slot=popover-content]", { timeout: CHO_MS });
	await p
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_MS })
		.catch(() => {});
}

async function do1280(c, slug) {
	const { ctx, p } = await trang(c, 1280);
	try {
		for (const [ten, duong] of MAN) {
			await mo(p, `${APP}/${slug}${duong}`, CHUONG);
			const api = await soApi(p);
			const tren = await soTren(p);
			kiem(
				`chuong-${ten}-1280`,
				`chuong trong khung o /${slug}${duong}, so «${tren}» == so may chu ${api}`,
				(await trongKhung(p, CHUONG)) && api !== null && tren === String(api),
			);
			await anh(p, `chuong-${ten}-1280`);
		}
		await mo(p, `${APP}/${slug}/viec`, CHUONG);
		await moChuong(p);
		const ds = await p.evaluate(() => {
			const o = document.querySelector("[data-slot=popover-content]");
			return {
				nhom: [...(o?.querySelectorAll("section") ?? [])].map((s) =>
					s.getAttribute("aria-label"),
				),
				chu: o?.textContent ?? "",
			};
		});
		const viec = tao.viec[0];
		kiem(
			"mo-1280",
			`o bat ra co nhom «${m.chuong.homNay}», co dong viec «${viec.tieuDe}»`,
			ds.nhom.includes(m.chuong.homNay) && ds.chu.includes(viec.tieuDe),
		);
		await anh(p, "mo-1280");
		const truoc = Number(await soTren(p));
		const dongViec = await p.evaluateHandle(
			(t) =>
				[
					...document.querySelectorAll(
						"[data-slot=popover-content] a[data-chua-doc]",
					),
				].find((a) => (a.textContent ?? "").includes(t)) ?? null,
			viec.tieuDe,
		);
		const el = dongViec.asElement();
		if (!el) khongDo("khong thay dong chua doc cua viec do");
		await el.click();
		const toi = await p
			.waitForFunction(
				(id) => location.search.includes(`record=viec:${id}`),
				{ timeout: CHO_MS },
				viec.id,
			)
			.then(() => true)
			.catch(() => false);
		await anh(p, "bam-1280");
		await mo(p, `${APP}/${slug}/viec`, CHUONG);
		const sau = Number((await soTren(p)) || "0");
		kiem(
			"bam-1280",
			`bam dong viec toi record=viec:${viec.id}, so ${truoc} → ${sau}`,
			toi && sau === truoc - 1,
		);
		await moChuong(p);
		await bamChu(p, "[data-slot=popover-content] button", m.chuong.docHet);
		await p
			.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
			.catch(() => {});
		await p.reload({ waitUntil: "domcontentloaded" });
		await p.waitForSelector(CHUONG, { timeout: CHO_MS });
		await p
			.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
			.catch(() => {});
		const conSo = await p.evaluate(
			(s) => document.querySelector(s) !== null,
			SO,
		);
		kiem(
			"doc-het-1280",
			"danh dau tat ca da doc, tai lai khong con so",
			!conSo,
		);
		await anh(p, "doc-het-1280");
		await mo(p, `${APP}/${slug}/thong-bao`, "[data-slot=danh-sach-thong-bao]");
		const nhom = await p.evaluate(() =>
			[
				...document.querySelectorAll("[data-slot=danh-sach-thong-bao] section"),
			].map((s) => s.getAttribute("aria-label")),
		);
		kiem(
			"trang-1280",
			`trang Thong bao nhom theo ngay: ${JSON.stringify(nhom)}`,
			nhom[0] === m.chuong.homNay,
		);
		await anh(p, "trang-1280");
	} finally {
		await ctx.close();
	}
}

async function do375(c, slug) {
	const { ctx, p } = await trang(c, 375);
	try {
		await mo(p, `${APP}/${slug}/okr`, CHUONG);
		await moChuong(p);
		const vua = await p.evaluate(() => {
			const r = document
				.querySelector("[data-slot=popover-content]")
				?.getBoundingClientRect();
			return r ? r.left >= 0 && r.right <= window.innerWidth : false;
		});
		const rong = await cuon(p);
		kiem(
			"chuong-375",
			`o bat ra nam tron khung 375, rong trang ${rong}`,
			vua && rong <= 375,
		);
		await anh(p, "chuong-375");
		await mo(p, `${APP}/${slug}/thong-bao`, "[data-slot=danh-sach-thong-bao]");
		await bamChu(p, "button", m.trang.loc.chuaDoc);
		const len = await p
			.waitForFunction(() => location.search.includes("locThongBao=chua-doc"), {
				timeout: CHO_MS,
			})
			.then(() => true)
			.catch(() => false);
		kiem(
			"trang-375",
			`loc Chua doc ghi tren URL, rong trang ${await cuon(p)}`,
			len && (await cuon(p)) <= 375,
		);
		await anh(p, "trang-375");
	} finally {
		await ctx.close();
	}
}

async function chay() {
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const qt = phien(QUAN_TRI);
	const slug = await suySlug(qt);
	const nguoi = await nguoiKhongKenh();
	await gieoQuaLuotNhac(nguoi);
	const c = phien(nguoi.email);
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await do1280(c, slug);
	await do375(c, slug);
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((x) => !daPhat.has(x));
	if (thieu.length > 0) {
		dong.push(`SAI ma tran thieu dong: ${thieu.join(", ")}`);
		sai += 1;
	}
	ma = sai > 0 ? 1 : 0;
} catch (e) {
	dong.push(
		`KHONG DO DUOC: ${e instanceof KhongDo ? e.message : (e?.stack ?? e)}`,
	);
	ma = 2;
} finally {
	await trinhDuyet?.close().catch(() => {});
	if (tao.user) {
		await db.thongBao.deleteMany({ where: { nguoiNhanId: tao.user } });
		await db.agentTask.deleteMany({
			where: { subject: { startsWith: `user:${tao.user}:` } },
		});
	}
	for (const v of tao.viec)
		await db.viec.deleteMany({ where: { id: v.id } }).catch(() => {});
	if (tao.member) await db.member.deleteMany({ where: { id: tao.member } });
	if (tao.user) {
		await db.session.deleteMany({ where: { userId: tao.user } });
		await db.user.deleteMany({ where: { id: tao.user } });
	}
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
