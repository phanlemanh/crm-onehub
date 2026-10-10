import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { onboardingMessages } from "../../../apps/app/lib/messages/onboarding.ts";
import { tongQuanMessages } from "../../../apps/app/lib/messages/tong-quan.ts";
import { ActivityType, db } from "../../../packages/db/src/index.ts";
import { dauNgayVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { formatCount } from "../../../packages/ui/src/lib/format.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, "_acceptance", "dieu-phoi-va", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const DAY_MS = 86_400_000;
const KHO = [1440, 390];
const TRAN_DONG = 10;
const MA = Date.now().toString(36);
const MA_TRAN = [
	"ke-hoach-rong-1440",
	"ke-hoach-rong-390",
	"ke-hoach-them-bo-phan-1440",
	"ke-hoach-them-bo-phan-390",
	"ke-hoach-bo-phan-khac-1440",
	"ke-hoach-bo-phan-khac-390",
	"ke-hoach-dong-1440",
	"ke-hoach-dong-390",
	"tong-quan-con-sot-1440",
	"tong-quan-con-sot-390",
	"tong-quan-du-1440",
	"tong-quan-du-390",
];

const s = onboardingMessages("vi").sheet;
const t = tongQuanMessages("vi").tasks;

function quaHanChu(n) {
	return t.pastDue(formatCount(n, t.taskNoun, "vi"));
}

const dong = [];
const daPhat = new Set();
const daTao = { keHoach: [], congTy: [], boPhan: [], viec: [] };
let sai = 0;
let trinhDuyet = null;

function kiem(ma, nhan, dat) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ${ma} khong co trong MA_TRAN`);
	daPhat.add(ma);
	dong.push(`${dat ? "DUNG" : "SAI"} ${ma} — ${nhan}`);
	if (dat) console.log(`dat ${ma}`);
	else sai += 1;
}

class KhongDo extends Error {}
function khongDo(cau) {
	throw new KhongDo(cau);
}

function phien() {
	const ra = execFileSync("bun", ["run", "dev:session", NGUOI], {
		cwd: join(GOC, "apps/api"),
		encoding: "utf8",
	});
	const cookie = ra.trim().split("\n").pop().trim();
	const dau = cookie.indexOf("=");
	if (dau < 1) khongDo(`khong doc duoc cookie phien cua ${NGUOI}`);
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

async function trang(kho, cookie) {
	const host = new URL(APP).hostname;
	const ctx = await trinhDuyet.createBrowserContext();
	await ctx.setCookie(
		{ name: "lang", value: "vi", domain: host, path: "/" },
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	);
	const p = await ctx.newPage();
	await p.setViewport({
		width: kho,
		height: kho === 390 ? 844 : 900,
		deviceScaleFactor: 1,
	});
	return { ctx, p };
}

async function choChu(p, chu, moTa) {
	const thay = await p
		.waitForFunction(
			(c) => (document.body.textContent ?? "").includes(c),
			{ timeout: CHO_MS },
			chu,
		)
		.then(() => true)
		.catch(() => false);
	if (thay) return;
	const ten = `loi-${moTa.replace(/[^a-z0-9]+/gi, "-")}`;
	await p.screenshot({ path: join(RA, `${ten}.png`) }).catch(() => {});
	const chuTrang = await p
		.evaluate(() => (document.body.innerText ?? "").slice(0, 300))
		.catch(() => "");
	khongDo(
		`${moTa}: khong thay «${chu}» — url ${p.url()} — anh ${ten}.png — chu: ${chuTrang.replace(/\s+/g, " ")}`,
	);
}

async function coNut(p, chu) {
	return p.evaluate(
		(c) =>
			[...document.querySelectorAll("button")].some(
				(b) => b.textContent?.trim() === c,
			),
		chu,
	);
}

async function bamNut(p, chu) {
	const ok = await p.evaluate((c) => {
		const b = [...document.querySelectorAll("button")].find(
			(x) => x.textContent?.trim() === c,
		);
		if (!b) return false;
		b.scrollIntoView({ block: "center" });
		b.click();
		return true;
	}, chu);
	if (!ok) khongDo(`khong thay nut «${chu}»`);
}

async function chup(p, ten) {
	await p.screenshot({ path: join(RA, `${ten}.png`) });
}

async function gieoKeHoach(ownerId, tenBoPhanCoBuoc, dong = false) {
	const congTy = await db.company.create({
		data: { name: `Đo E6 ${MA} ${daTao.congTy.length}` },
	});
	daTao.congTy.push(congTy.id);
	const keHoach = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId,
			startedAt: new Date(),
			targetDays: 30,
			closedAt: dong ? new Date() : null,
		},
	});
	daTao.keHoach.push(keHoach.id);
	if (tenBoPhanCoBuoc) {
		await db.onboardingStep.create({
			data: {
				planId: keHoach.id,
				label: `Bước có sẵn ${MA}`,
				departmentId: tenBoPhanCoBuoc,
				dueAt: new Date(Date.now() + 5 * DAY_MS),
				position: 0,
			},
		});
	}
	return keHoach;
}

async function moKeHoach(p, slug, id) {
	await p.goto(`${APP}/${slug}/onboarding?record=plan:${id}`, {
		waitUntil: "networkidle0",
		timeout: CHO_MS,
	});
	await choChu(p, s.details, "mo ban ghi ke hoach");
}

async function doKeHoach(cookie, slug, toi, boPhan) {
	for (const kho of KHO) {
		const { ctx, p } = await trang(kho, cookie);
		try {
			const rong = await gieoKeHoach(toi.id, null);
			await moKeHoach(p, slug, rong.id);
			await choChu(p, s.noSteps.title, "khung trong");
			const coThem = await coNut(p, s.addStep);
			await chup(p, `ke-hoach-rong-${kho}`);
			kiem(
				`ke-hoach-rong-${kho}`,
				`khung trong co nut «${s.addStep}»: ${coThem}`,
				coThem,
			);

			await bamNut(p, s.addStep);
			await p
				.waitForSelector("[data-them-buoc] [role=combobox]", {
					timeout: CHO_MS,
				})
				.catch(() => khongDo("form khong co o chon bo phan"));
			const ten = `Bước đo ${MA} ${kho}`;
			await p.click("[data-them-buoc] [role=combobox]");
			await p.waitForSelector("[role=option]", { timeout: CHO_MS });
			const chonDuoc = await p.evaluate((ten) => {
				const o = [...document.querySelectorAll("[role=option]")].find(
					(x) => x.textContent?.trim() === ten,
				);
				if (!o) return false;
				o.click();
				return true;
			}, boPhan[1].name);
			if (!chonDuoc) khongDo(`khong co bo phan ${boPhan[1].name} trong o chon`);
			await p.type(
				`[data-them-buoc] input[aria-label="${s.newStepLabel}"]`,
				ten,
			);
			await chup(p, `ke-hoach-them-bo-phan-${kho}`);
			await p.click('[data-them-buoc] button[type="submit"]');
			await choChu(p, ten, "buoc vua them hien");
			const ghi = await db.onboardingStep.findFirst({
				where: { planId: rong.id, label: ten },
				select: { departmentId: true },
			});
			kiem(
				`ke-hoach-them-bo-phan-${kho}`,
				`buoc doc lai qua co so du lieu: ${JSON.stringify(ghi)}`,
				ghi?.departmentId === boPhan[1].id,
			);

			const coBuoc = await gieoKeHoach(toi.id, boPhan[0].id);
			await moKeHoach(p, slug, coBuoc.id);
			await choChu(p, `Bước có sẵn ${MA}`, "buoc co san");
			const coKhac = await coNut(p, s.addStepOtherDepartment);
			let khongLietA = false;
			if (coKhac) {
				await bamNut(p, s.addStepOtherDepartment);
				await p.waitForSelector("[data-them-buoc] [role=combobox]", {
					timeout: CHO_MS,
				});
				await p.click("[data-them-buoc] [role=combobox]");
				await p.waitForSelector("[role=option]", { timeout: CHO_MS });
				const luaChon = await p.$$eval("[role=option]", (els) =>
					els.map((e) => e.textContent?.trim() ?? ""),
				);
				khongLietA =
					!luaChon.includes(boPhan[0].name) && luaChon.includes(boPhan[1].name);
				await chup(p, `ke-hoach-bo-phan-khac-${kho}`);
				await p.keyboard.press("Escape");
			}
			kiem(
				`ke-hoach-bo-phan-khac-${kho}`,
				`nut «${s.addStepOtherDepartment}»: ${coKhac}; o chon bo bo phan da co buoc: ${khongLietA}`,
				coKhac && khongLietA,
			);

			const daDong = await gieoKeHoach(toi.id, boPhan[0].id, true);
			await moKeHoach(p, slug, daDong.id);
			await choChu(p, `Bước có sẵn ${MA}`, "buoc ke hoach dong");
			const conNut =
				(await coNut(p, s.addStep)) ||
				(await coNut(p, s.addStepOtherDepartment));
			await chup(p, `ke-hoach-dong-${kho}`);
			kiem(
				`ke-hoach-dong-${kho}`,
				`ke hoach da dong con nut them: ${conNut}`,
				!conNut,
			);
		} finally {
			await ctx.close();
		}
	}
}

async function demQuaHan(toiId) {
	const dau = dauNgayVN(new Date());
	const [viec, buoc] = await Promise.all([
		db.activity.count({
			where: {
				type: ActivityType.TASK,
				completedAt: null,
				dueAt: { lt: dau },
				createdById: toiId,
			},
		}),
		db.onboardingStep.count({
			where: {
				assigneeId: toiId,
				completedAt: null,
				plan: { closedAt: null },
				dueAt: { lt: dau },
			},
		}),
	]);
	return { viec, buoc };
}

async function docThe(p, slug) {
	await p.goto(`${APP}/${slug}`, {
		waitUntil: "networkidle0",
		timeout: CHO_MS,
	});
	await p
		.waitForSelector('[data-khoi="viec-qua-han"]', { timeout: CHO_MS })
		.catch(() => khongDo("khong thay the viec qua han"));
	await p.$eval('[data-khoi="viec-qua-han"]', (e) =>
		e.scrollIntoView({ block: "start" }),
	);
	return p.$eval('[data-khoi="viec-qua-han"]', (e) => {
		const chan = e.querySelector("[data-con-sot]");
		return {
			moTa:
				e
					.querySelector('[data-slot="card-description"]')
					?.textContent?.trim() ?? "",
			chan: chan ? (chan.textContent?.trim() ?? "") : null,
			chanHien: chan ? chan.getBoundingClientRect().height > 0 : false,
			conSot: chan?.getAttribute("data-con-sot") ?? null,
		};
	});
}

async function doTongQuan(cookie, slug, toi, boPhan) {
	const dau = dauNgayVN(new Date());
	const truocHan = new Date(dau.getTime() - 2 * DAY_MS);
	const san = await demQuaHan(toi.id);
	for (const kho of KHO) {
		const { ctx, p } = await trang(kho, cookie);
		try {
			const sanCo = await demQuaHan(toi.id);
			const tongDu = sanCo.viec + sanCo.buoc;
			const hienDu =
				Math.min(sanCo.viec, TRAN_DONG) + Math.min(sanCo.buoc, TRAN_DONG);
			const the = await docThe(p, slug);
			await chup(p, `tong-quan-du-${kho}`);
			const coChan = the.chan !== null;
			const moTaDung =
				tongDu > 0
					? the.moTa === quaHanChu(tongDu)
					: !the.moTa.includes(t.pastDue(""));
			kiem(
				`tong-quan-du-${kho}`,
				`tong ${tongDu}, hien toi da ${hienDu}; mo ta «${the.moTa}»; chan thẻ: ${JSON.stringify(the.chan)}`,
				coChan === tongDu > hienDu && moTaDung,
			);
		} finally {
			await ctx.close();
		}
	}
	const keHoach = await gieoKeHoach(toi.id, null);
	for (let i = 0; i < 25; i += 1) {
		const v = await db.activity.create({
			data: {
				type: ActivityType.TASK,
				subject: `Việc đo ${MA} ${i}`,
				dueAt: truocHan,
				createdById: toi.id,
			},
		});
		daTao.viec.push(v.id);
	}
	for (let i = 0; i < 15; i += 1) {
		await db.onboardingStep.create({
			data: {
				planId: keHoach.id,
				label: `Bước đo quá hạn ${MA} ${i}`,
				departmentId: boPhan[0].id,
				dueAt: truocHan,
				assigneeId: toi.id,
				position: i,
			},
		});
	}
	const tong = san.viec + san.buoc + 40;
	for (const kho of KHO) {
		const { ctx, p } = await trang(kho, cookie);
		try {
			const the = await docThe(p, slug);
			await chup(p, `tong-quan-con-sot-${kho}`);
			const conSot = Number(the.conSot ?? "-1");
			const hien = TRAN_DONG + TRAN_DONG;
			const chanMong = t.conSot.replace("{n}", String(tong - hien));
			const moTaMong = quaHanChu(tong);
			kiem(
				`tong-quan-con-sot-${kho}`,
				`tong ${tong}; mo ta «${the.moTa}» (mong «${moTaMong}»${kho < 640 ? ", an duoi 640 px" : ""}); chan the «${the.chan}» (mong «${chanMong}», nhin thay: ${the.chanHien}); data-con-sot ${conSot}`,
				the.moTa === moTaMong &&
					the.chan === chanMong &&
					the.chanHien &&
					conSot === tong - hien,
			);
		} finally {
			await ctx.close();
		}
	}
}

async function chay() {
	if (
		!/_do$/.test(new URL(process.env.DATABASE_URL ?? "postgres://x/x").pathname)
	)
		khongDo(
			"khong phai kho do rieng — chay qua dpv_man (mot-luot.sh, tien-de.mjs)",
		);
	const cay = await canhCay();
	if (cay.ket !== "dung-cay") khongDo(`canh cay: ${cay.dong.join(" | ")}`);
	mkdirSync(RA, { recursive: true });
	const cookie = phien();
	const slug = await suySlug(cookie);
	const toi = await db.user.findUnique({
		where: { email: NGUOI },
		select: { id: true },
	});
	if (!toi) khongDo(`khong co nguoi ${NGUOI} trong co so du lieu do`);
	const boPhan = [];
	for (const ten of [`Bộ phận đo A ${MA}`, `Bộ phận đo B ${MA}`]) {
		const bp = await db.department.create({
			data: { name: ten, position: 900 + boPhan.length },
		});
		daTao.boPhan.push(bp.id);
		boPhan.push(bp);
	}
	trinhDuyet = await puppeteer.launch({
		executablePath: CHROME,
		headless: true,
	});
	try {
		await doKeHoach(cookie, slug, toi, boPhan);
		await doTongQuan(cookie, slug, toi, boPhan);
	} finally {
		await db.activity.deleteMany({
			where: {
				OR: [{ id: { in: daTao.viec } }, { planId: { in: daTao.keHoach } }],
			},
		});
		await db.onboardingPlan.deleteMany({
			where: { id: { in: daTao.keHoach } },
		});
		await db.company.deleteMany({ where: { id: { in: daTao.congTy } } });
		await db.department.deleteMany({ where: { id: { in: daTao.boPhan } } });
	}
}

let ma = 0;
try {
	await chay();
	const thieu = MA_TRAN.filter((m) => !daPhat.has(m));
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
	await db.$disconnect();
}
for (const x of dong) console.log(x);
console.log(`ANH ${RA}`);
console.log(
	`KET LUAN: ${dong.filter((x) => x.startsWith("DUNG")).length} DUNG, ${sai} SAI — ma thoat ${ma}`,
);
process.exit(ma);
