import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { dien } from "../../../apps/app/components/crm/record-sheet/plan-copy.tsx";
import { tinHieuMessages } from "../../../apps/app/lib/messages/tin-hieu.ts";
import { tenMan } from "../../../apps/app/lib/tin-hieu/ten-man.ts";
import { db } from "../../../packages/db/src/index.ts";
import { TIN_HIEU } from "../../../packages/validation/src/tin-hieu.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "sua-giao-dien-tin-hieu", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:3001";
const QUAN_TRI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const CHAM_TOI_THIEU = 36;
const KHO_BANG = [768, 900, 1100, 1280];
const KHO_TRANG = [375, 768, 1280];
const KHO_HOP_HEP = [375, 768];
const NGON_NGU = ["vi", "en"];
const MAN_GUI = ["/okr", "/tai-lieu", "/settings/members"];
const MA_TRAN = [
	...KHO_BANG.map((w) => `bang-${w}`),
	...KHO_TRANG.flatMap((w) => NGON_NGU.map((l) => `trang-${w}-${l}`)),
	...NGON_NGU.map((l) => `hop-${l}`),
	...KHO_HOP_HEP.flatMap((w) => NGON_NGU.map((l) => `hop-${w}-${l}`)),
	"qua-tran-that-en",
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

async function nguoiThanhVien() {
	const qt = await db.user.findUnique({
		where: { email: QUAN_TRI },
		select: { members: { select: { organizationId: true }, take: 1 } },
	});
	const to = qt?.members[0]?.organizationId;
	if (!to) khongDo(`${QUAN_TRI} khong thuoc workspace nao`);
	const ma = Date.now().toString(36);
	const email = `sgt-${ma}@thu.test`;
	const nguoi = await db.user.create({
		data: { id: `sgt-${ma}`, email, name: "Người đo TH6", emailVerified: true },
		select: { id: true },
	});
	tao.user = nguoi.id;
	await db.member.create({
		data: {
			id: `member-sgt-${ma}`,
			organizationId: to,
			userId: nguoi.id,
			role: "member",
			createdAt: new Date(),
		},
	});
	tao.member = `member-sgt-${ma}`;
	const c = phien(email);
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: to },
	});
	return c;
}

async function guiThat(cookie, man) {
	const res = await fetch(`${API}/rest/tin-hieu`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			cookie: `${cookie.ten}=${cookie.gia}`,
		},
		body: JSON.stringify({
			muonLam: `Đo TH6 từ ${man}`,
			daXayRa: `Đo TH6: điều gặp ở ${man}`,
			man,
		}),
	});
	return res.status;
}

async function trang(cookie, kho, lang) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: lang, domain: host, path: "/" },
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
}

const anh = (p, ten) => p.screenshot({ path: join(RA, `${ten}.png`) });
const NUT = "[data-slot=nut-gui-tin-hieu]";
const HOP = "[data-hop-tin-hieu]";

function cuonNgang(p) {
	return p.evaluate(
		() =>
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth,
	);
}

function catChu(p, goc) {
	return p.evaluate((g) => {
		const vung = g ? document.querySelector(g) : document.body;
		const chon =
			"button, th, label, [data-slot=status-indicator], [data-slot=field-description], [role=alert], [data-ten-man], [data-gio-gui]";
		return [...(vung?.querySelectorAll(chon) ?? [])]
			.filter((e) => e.offsetParent !== null)
			.filter((e) => e.scrollWidth > e.clientWidth + 1)
			.map((e) => (e.textContent ?? "").trim().slice(0, 40));
	}, goc);
}

async function bamTheoChu(p, sel, chu) {
	const h = await p.evaluateHandle(
		(s, c) =>
			[...document.querySelectorAll(s)].find(
				(e) => (e.textContent ?? "").trim() === c && e.offsetParent !== null,
			) ?? null,
		sel,
		chu,
	);
	const el = h.asElement();
	if (!el) return false;
	await el.click();
	return true;
}

async function doBang(cookie, slug) {
	for (const w of KHO_BANG) {
		const { ctx, p } = await trang(cookie, w, "vi");
		try {
			await mo(p, `${APP}/${slug}/tin-hieu`, "tr[data-tin-hieu]");
			const cot = await p.evaluate(() =>
				[...document.querySelectorAll("table thead th")].map((th) =>
					Math.round(th.getBoundingClientRect().width),
				),
			);
			const ngang = await cuonNgang(p);
			kiem(
				`bang-${w}`,
				`be rong cot [${cot.join(", ")}], cuon ngang ${ngang}`,
				cot.length === 4 && cot[0] === Math.max(...cot) && !ngang,
			);
			await anh(p, `bang-${w}`);
		} finally {
			await ctx.close();
		}
	}
}

async function doTrang(cookie, slug) {
	for (const w of KHO_TRANG)
		for (const l of NGON_NGU) {
			const { ctx, p } = await trang(cookie, w, l);
			try {
				await mo(p, `${APP}/${slug}/tin-hieu`, "[data-tin-hieu]");
				const ngang = await cuonNgang(p);
				const cat = await catChu(p, "main");
				const cham =
					w < 768
						? await p.evaluate(() =>
								[...document.querySelectorAll("[data-thao-tac-tin-hieu]")]
									.filter((e) => e.offsetParent !== null)
									.map((e) => {
										const r = e.getBoundingClientRect();
										return Math.min(r.width, r.height);
									}),
							)
						: [];
				const datCham =
					w >= 768 || (cham.length > 0 && Math.min(...cham) >= CHAM_TOI_THIEU);
				kiem(
					`trang-${w}-${l}`,
					`cuon ngang ${ngang}, cat chu ${JSON.stringify(cat)}${w < 768 ? `, nut thao tac ${JSON.stringify(cham)}` : ""}`,
					!ngang && cat.length === 0 && datCham,
				);
				await anh(p, `trang-${w}-${l}`);
			} finally {
				await ctx.close();
			}
		}
}

async function doHop(cookie, slug) {
	for (const l of NGON_NGU) {
		const m = tinHieuMessages(l);
		const { ctx, p } = await trang(cookie, 1280, l);
		try {
			await mo(p, `${APP}/${slug}/okr`, NUT);
			await p.click(NUT);
			await p.waitForSelector(HOP, { timeout: CHO_MS });
			const manHop = await p.evaluate(
				() => document.querySelector("[data-gui-tu-man]")?.textContent ?? "",
			);
			await p.type("textarea[name=muon-lam]", `Đo TH6 hộp ${l}`);
			await p.type("textarea[name=da-xay-ra]", `Đo TH6 hộp ${l}: biên nhận`);
			await anh(p, `hop-${l}`);
			await bamTheoChu(p, `${HOP} button`, m.hop.gui);
			const bienNhan = await p
				.waitForSelector(`${HOP}[data-hop-tin-hieu=da-gui]`, {
					timeout: CHO_MS,
				})
				.then(() => true)
				.catch(() => false);
			await bamTheoChu(p, `${HOP} button`, m.hop.dong);
			await new Promise((r) => setTimeout(r, 600));
			const conHop = await p.evaluate(
				(h) => document.querySelector(h) !== null,
				HOP,
			);
			const hoiLai = await p.evaluate(
				() => document.querySelector("[role=alertdialog]") !== null,
			);
			await anh(p, `hop-${l}-sau-dong`);
			kiem(
				`hop-${l}`,
				`dong gui tu man «${manHop}», bien nhan ${bienNhan}, con hop ${conHop}, hoi lai ${hoiLai}`,
				manHop.includes(tenMan("/okr", l)) &&
					!manHop.includes("/") &&
					bienNhan &&
					!conHop &&
					!hoiLai,
			);
		} finally {
			await ctx.close();
		}
	}
	for (const w of KHO_HOP_HEP)
		for (const l of NGON_NGU) {
			const { ctx, p } = await trang(cookie, w, l);
			try {
				await mo(p, `${APP}/${slug}/settings/members`, NUT);
				await p.click(NUT);
				await p.waitForSelector(HOP, { timeout: CHO_MS });
				await new Promise((r) => setTimeout(r, 400));
				const ngang = await cuonNgang(p);
				const cat = await catChu(p, HOP);
				const lyDo = await p.evaluate(
					() => document.querySelector("[data-ly-do-khoa]") !== null,
				);
				kiem(
					`hop-${w}-${l}`,
					`cuon ngang ${ngang}, cat chu ${JSON.stringify(cat)}, dong ly do khoa ${lyDo}`,
					!ngang && cat.length === 0 && lyDo,
				);
				await anh(p, `hop-${w}-${l}`);
			} finally {
				await ctx.close();
			}
		}
}

async function doQuaTran(cookie, slug) {
	const m = tinHieuMessages("en");
	let ma = 200;
	for (let i = 0; i < TIN_HIEU.tranMoiNgay + 1 && ma !== 429; i += 1)
		ma = await guiThat(cookie, "/okr");
	if (ma !== 429)
		khongDo(`gui ${TIN_HIEU.tranMoiNgay + 1} lan khong cham tran (ma ${ma})`);
	const { ctx, p } = await trang(cookie, 1280, "en");
	try {
		await mo(p, `${APP}/${slug}/okr`, NUT);
		await p.click(NUT);
		await p.waitForSelector(HOP, { timeout: CHO_MS });
		await p.type("textarea[name=muon-lam]", "TH6 quota");
		await p.type("textarea[name=da-xay-ra]", "TH6 quota: over the limit");
		await bamTheoChu(p, `${HOP} button`, m.hop.gui);
		await p
			.waitForSelector(`${HOP} [role=alert]`, { timeout: CHO_MS })
			.catch(() => {});
		const ket = await p.evaluate(
			(h, gui) => {
				const hop = document.querySelector(h);
				const nut = [...(hop?.querySelectorAll("button") ?? [])].find(
					(b) => (b.textContent ?? "").trim() === gui,
				);
				return {
					alert: (hop?.querySelector("[role=alert]")?.textContent ?? "").trim(),
					khoa: nut?.disabled ?? false,
					chu: hop?.querySelector("textarea[name=da-xay-ra]")?.value ?? "",
				};
			},
			HOP,
			m.hop.gui,
		);
		await anh(p, "qua-tran-that-en");
		const mong = dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) });
		kiem(
			"qua-tran-that-en",
			`vung loi «${ket.alert}», nut Send khoa ${ket.khoa}, chu con «${ket.chu}»`,
			ket.alert === mong && ket.khoa && ket.chu === "TH6 quota: over the limit",
		);
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
	const nguoi = await nguoiThanhVien();
	for (const man of MAN_GUI) {
		const ma = await guiThat(nguoi, man);
		if (ma >= 300) khongDo(`gui tin hieu mau tu ${man} tra ma ${ma}`);
	}
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	await doBang(nguoi, slug);
	await doTrang(nguoi, slug);
	await doHop(nguoi, slug);
	await doQuaTran(nguoi, slug);
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
	if (tao.user)
		await db.tinHieu.deleteMany({ where: { nguoiGuiId: tao.user } });
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
