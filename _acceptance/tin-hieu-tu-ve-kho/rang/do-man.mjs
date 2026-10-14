import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { khoaApiMessages } from "../../../apps/app/lib/messages/settings-khoa-api.ts";
import { KHOA_KEO_TIN_HIEU } from "../../../packages/auth/src/api-keys.ts";
import { db } from "../../../packages/db/src/index.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "tin-hieu-tu-ve-kho", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const TUONG_PHAN_TOI_THIEU = 4.5;
const t = khoaApiMessages("vi");
const TEN_KHOA = `tvk-do-${Date.now().toString(36)}`;
const MA_TRAN = [
	"quan-tri-1280",
	"quan-tri-375",
	"tao-khoa-keo",
	"danh-sach-nhan",
	"thanh-vien-1280",
	"nen-toi-1280",
];

const dong = [];
const daPhat = new Set();
let sai = 0;
let trinhDuyet = null;
const tao = { user: null, member: null };

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

async function thanhVien() {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `tvk-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: {
			id: `tvk-${ma}`,
			email,
			name: "Người đo Khoá",
			emailVerified: true,
		},
		select: { id: true },
	});
	tao.user = nguoi.id;
	await db.member.create({
		data: {
			id: `member-tvk-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	tao.member = `member-tvk-${ma}`;
	const c = phien(email);
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: to },
	});
	return c;
}

async function trang(cookie, kho, toi = false) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.emulateMediaFeatures([
		{ name: "prefers-color-scheme", value: toi ? "dark" : "light" },
	]);
	await p.setViewport({
		width: kho,
		height: kho === 375 ? 812 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function moTo(p, slug) {
	await p.goto(`${APP}/${slug}/settings/api-keys?new=true`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_MS,
	});
	await p.waitForSelector("form#create-api-key input[required]", {
		timeout: CHO_MS,
	});
	await p
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_MS })
		.catch(() => {});
}

const anh = (p, ten) => p.screenshot({ path: join(RA, `${ten}.png`) });
const cuon = (p) => p.evaluate(() => document.documentElement.scrollWidth);

async function nhomLoai(p) {
	return p.evaluate(() => {
		const n = document.querySelector("[data-slot=loai-khoa]");
		if (!n || n.getBoundingClientRect().width === 0) return null;
		const r = [...n.querySelectorAll("[role=radio]")];
		return {
			chu: n.textContent ?? "",
			so: r.length,
			dau: r[0]?.getAttribute("value") ?? "",
			chon: r[0]?.getAttribute("aria-checked") ?? "",
		};
	});
}

async function tuongPhan(p) {
	return p.evaluate(() => {
		const doi = (mau) => {
			const c = document.createElement("canvas");
			c.width = 1;
			c.height = 1;
			const x = c.getContext("2d");
			x.fillStyle = mau;
			x.fillRect(0, 0, 1, 1);
			const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
			const k = (v) => {
				const s = v / 255;
				return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
			};
			return 0.2126 * k(r) + 0.7152 * k(g) + 0.0722 * k(b);
		};
		const nen = (e) => {
			let x = e;
			while (x) {
				const m = getComputedStyle(x).backgroundColor;
				if (m && m !== "rgba(0, 0, 0, 0)" && m !== "transparent") return m;
				x = x.parentElement;
			}
			return "rgb(255, 255, 255)";
		};
		const ti = (e) => {
			const a = doi(getComputedStyle(e).color);
			const b = doi(nen(e));
			return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
		};
		const n = document.querySelector("[data-slot=loai-khoa]");
		const chu = [
			...(n?.querySelectorAll(
				"[data-slot=field-label], [data-slot=field-description]",
			) ?? []),
		];
		return chu.length === 0 ? 0 : Math.min(...chu.map(ti));
	});
}

async function bamTheoChu(p, sel, chu) {
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

async function doQuanTri(qt, slug) {
	{
		const { ctx, p } = await trang(qt, 1280);
		try {
			await moTo(p, slug);
			const n = await nhomLoai(p);
			kiem(
				"quan-tri-1280",
				`to tao co nhom «${t.tao.loai}» hai muc, muc dau toan quyen duoc chon (${JSON.stringify(n)})`,
				n !== null &&
					n.so === 2 &&
					n.dau === "toan-quyen" &&
					n.chon === "true" &&
					n.chu.includes(t.tao.loai),
			);
			await anh(p, "quan-tri-1280");
			await p.type("form#create-api-key input[required]", TEN_KHOA);
			await p.click("[data-slot=loai-khoa] [role=radio][value=keo-tin-hieu]");
			await bamTheoChu(p, "button[type=submit]", t.tao.taoKhoa);
			const dan = await p
				.waitForFunction(
					(c) => (document.body.textContent ?? "").includes(c),
					{ timeout: CHO_MS },
					t.daTao.keoTinHieu,
				)
				.then(() => true)
				.catch(() => false);
			await anh(p, "tao-khoa-keo");
			kiem(
				"tao-khoa-keo",
				"hop khoa vua tao dan khoa chi keo va dat bi mat",
				dan,
			);
			await bamTheoChu(p, "button", t.daTao.xong);
			const nhan = await p
				.waitForFunction(
					(ten) =>
						[...document.querySelectorAll("[data-slot=nhan-loai-khoa]")].some(
							(b) => b.closest("tr")?.textContent?.includes(ten),
						),
					{ timeout: CHO_MS },
					TEN_KHOA,
				)
				.then(() => true)
				.catch(() => false);
			const hang = await db.apikey.findFirst({
				where: { name: TEN_KHOA },
				select: { configId: true },
			});
			kiem(
				"danh-sach-nhan",
				`dong khoa moi mang nhan «${t.bang.loaiKeoTinHieu}», hang luu configId ${hang?.configId}`,
				nhan && hang?.configId === KHOA_KEO_TIN_HIEU.configId,
			);
			await anh(p, "danh-sach-nhan");
		} finally {
			await ctx.close();
		}
	}
	{
		const { ctx, p } = await trang(qt, 375);
		try {
			await moTo(p, slug);
			const n = await nhomLoai(p);
			const rong = await cuon(p);
			kiem(
				"quan-tri-375",
				`to tao mot cot, nhom loai hien, rong trang ${rong}`,
				n !== null && n.so === 2 && rong <= 375,
			);
			await anh(p, "quan-tri-375");
		} finally {
			await ctx.close();
		}
	}
	{
		const { ctx, p } = await trang(qt, 1280, true);
		try {
			await moTo(p, slug);
			const ti = await tuongPhan(p);
			kiem(
				"nen-toi-1280",
				`nen toi: tuong phan thap nhat cua nhan va mo ta ${ti.toFixed(2)}`,
				ti >= TUONG_PHAN_TOI_THIEU,
			);
			await anh(p, "nen-toi-1280");
		} finally {
			await ctx.close();
		}
	}
}

async function doThanhVien(tv, slug) {
	const { ctx, p } = await trang(tv, 1280);
	try {
		await moTo(p, slug);
		kiem(
			"thanh-vien-1280",
			"thanh vien thuong: to tao khong co nhom loai khoa",
			(await nhomLoai(p)) === null &&
				(await p.$("[data-slot=loai-khoa]")) === null,
		);
		await anh(p, "thanh-vien-1280");
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
	const tv = await thanhVien();
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doQuanTri(qt, slug);
	await doThanhVien(tv, slug);
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
	await db.apikey.deleteMany({ where: { name: TEN_KHOA } }).catch(() => {});
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
