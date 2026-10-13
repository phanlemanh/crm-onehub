import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { crmMessages } from "../../../apps/app/lib/messages/crm.ts";
import { onboardingMessages } from "../../../apps/app/lib/messages/onboarding.ts";
import { ActivityType, db } from "../../../packages/db/src/index.ts";
import { dauNgayVN } from "../../../packages/db/src/onboarding-nhac.ts";
import { homNayVN } from "../../../packages/validation/src/ngay-vn.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const RA =
	process.env.BANG_CHUNG ??
	join(GOC, "_acceptance", "them-buoc-bao-dung", "evidence");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const APP = process.env.APP_URL ?? "http://localhost:3000";
const NGUOI = process.env.NGUOI ?? "ada@trycomp.ai";
const CHO_MS = 90_000;
const DAY_MS = 86_400_000;
const GIO_MS = 3_600_000;
const KHO = [1440, 390];
const GIO_LUI_TOI = 18;
const GIO_TIEN_TU = 17;
const LUI = "Pacific/Pago_Pago";
const TIEN = "Pacific/Kiritimati";
const THU_TUC = "onboarding.listDepartments";
const MA = Date.now().toString(36);
const MA_TRAN = KHO.flatMap((k) => [
	`them-buoc-loi-phong-ban-${k}`,
	`them-buoc-khac-loi-phong-ban-${k}`,
	`them-buoc-thu-lai-xong-${k}`,
	`qua-han-con-sot-${k}`,
]);

const s = onboardingMessages("vi").sheet;
const loiMoTa = crmMessages("vi").vungCon.loiMoTa;

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

function thuTucCua(url) {
	const duong = new URL(url).pathname.replace(/^\/api\/trpc\//, "");
	return decodeURIComponent(duong).split(",");
}

async function lamLoiDanhSach(req, cookie) {
	const res = await fetch(req.url(), {
		method: req.method(),
		headers: {
			...req.headers(),
			cookie: `${cookie.ten}=${cookie.gia}; lang=vi`,
		},
		body: req.postData(),
	});
	const lo = await res.json();
	const ten = thuTucCua(req.url());
	const ra = ten.map((t, i) =>
		t === THU_TUC
			? {
					error: {
						message: "Đo: chặn danh sách phòng ban",
						code: -32603,
						data: {
							code: "INTERNAL_SERVER_ERROR",
							httpStatus: 500,
							path: THU_TUC,
						},
					},
				}
			: lo[i],
	);
	await req.respond({
		status: 207,
		contentType: "application/json",
		body: JSON.stringify(ra),
	});
}

async function trang(kho, cookie, chan) {
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
	if (chan) {
		await p.setRequestInterception(true);
		p.on("request", (req) => {
			if (req.isInterceptResolutionHandled()) return;
			const laLo = req.url().includes("/api/trpc/");
			if (chan.bat && laLo && thuTucCua(req.url()).includes(THU_TUC)) {
				chan.dem += 1;
				lamLoiDanhSach(req, cookie).catch((e) =>
					req.abort().finally(() => {
						chan.loi = String(e);
					}),
				);
				return;
			}
			req.continue();
		});
	}
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

async function docVungLoi(p) {
	return p.evaluate(() => {
		const vung = document.querySelector("[data-them-buoc] [data-vung-tai-loi]");
		const nut = vung?.querySelector('[data-slot="kara-retry"]');
		vung?.scrollIntoView({ block: "center" });
		const r = nut?.getBoundingClientRect();
		const goc = document.scrollingElement ?? document.documentElement;
		return {
			co: vung !== null,
			tieuDe:
				vung?.querySelector('[data-slot="empty-title"]')?.textContent?.trim() ??
				null,
			chu: vung?.textContent ?? "",
			nutTrongKhung:
				r !== undefined &&
				r.width > 0 &&
				r.left >= 0 &&
				r.top >= 0 &&
				r.right <= window.innerWidth &&
				r.bottom <= window.innerHeight,
			tranNgang: goc.scrollWidth > goc.clientWidth,
			oChon:
				document.querySelector("[data-them-buoc] [role=combobox]") !== null,
		};
	});
}

function vungLoiDat(v) {
	return (
		v.co &&
		v.tieuDe === s.loiPhongBan &&
		v.chu.includes(loiMoTa) &&
		v.nutTrongKhung &&
		!v.tranNgang &&
		!v.oChon
	);
}

async function gieoKeHoach(ownerId, departmentId, buoc = {}) {
	const congTy = await db.company.create({
		data: { name: `Đo E6b ${MA} ${daTao.congTy.length}` },
	});
	daTao.congTy.push(congTy.id);
	const keHoach = await db.onboardingPlan.create({
		data: {
			companyId: congTy.id,
			ownerId,
			startedAt: new Date(),
			targetDays: 30,
		},
	});
	daTao.keHoach.push(keHoach.id);
	if (departmentId) {
		await db.onboardingStep.create({
			data: {
				planId: keHoach.id,
				label: buoc.label ?? `Bước có sẵn ${MA}`,
				departmentId,
				dueAt: buoc.dueAt ?? new Date(Date.now() + 5 * DAY_MS),
				assigneeId: buoc.assigneeId ?? null,
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

async function choVungLoi(p) {
	await p
		.waitForSelector("[data-them-buoc] [data-vung-tai-loi]", {
			timeout: CHO_MS,
		})
		.catch(() => {});
}

async function doThemBuoc(cookie, slug, toi, boPhan) {
	for (const kho of KHO) {
		const chan = { bat: true, dem: 0, loi: null };
		const { ctx, p } = await trang(kho, cookie, chan);
		try {
			const rong = await gieoKeHoach(toi.id, null);
			await moKeHoach(p, slug, rong.id);
			await choChu(p, s.noSteps.title, "khung trong");
			await bamNut(p, s.addStep);
			await choVungLoi(p);
			const v1 = await docVungLoi(p);
			await chup(p, `them-buoc-loi-phong-ban-${kho}`);
			kiem(
				`them-buoc-loi-phong-ban-${kho}`,
				`da chan ${chan.dem} lo; vung loi ${JSON.stringify(v1)}`,
				chan.dem > 0 && chan.loi === null && vungLoiDat(v1),
			);

			chan.bat = false;
			const truoc = chan.dem;
			const coNutThuLai =
				(await p.$("[data-them-buoc] [data-slot='kara-retry']")) !== null;
			if (coNutThuLai) {
				await p.click("[data-them-buoc] [data-slot='kara-retry']");
				await p
					.waitForSelector("[data-them-buoc] [role=combobox]", {
						timeout: CHO_MS,
					})
					.catch(() => {});
			}
			const v2 = await docVungLoi(p);
			let luaChon = [];
			if (coNutThuLai && v2.oChon) {
				await p.click("[data-them-buoc] [role=combobox]");
				await p.waitForSelector("[role=option]", { timeout: CHO_MS });
				luaChon = await p.$$eval("[role=option]", (els) =>
					els.map((e) => e.textContent?.trim() ?? ""),
				);
			}
			await chup(p, `them-buoc-thu-lai-xong-${kho}`);
			await p.keyboard.press("Escape");
			kiem(
				`them-buoc-thu-lai-xong-${kho}`,
				`nut thu lai: ${coNutThuLai}; vung loi con: ${v2.co}; o chon: ${v2.oChon}; co ${boPhan[1].name}: ${luaChon.includes(boPhan[1].name)}; khong chan them: ${chan.dem === truoc}`,
				coNutThuLai && !v2.co && v2.oChon && luaChon.includes(boPhan[1].name),
			);

			chan.bat = true;
			const coBuoc = await gieoKeHoach(toi.id, boPhan[0].id);
			await moKeHoach(p, slug, coBuoc.id);
			await choChu(p, `Bước có sẵn ${MA}`, "buoc co san");
			await p
				.waitForFunction(
					(c) =>
						[...document.querySelectorAll("button")].some(
							(b) => b.textContent?.trim() === c,
						),
					{ timeout: CHO_MS },
					s.addStepOtherDepartment,
				)
				.catch(() => {});
			const coKhac = await coNut(p, s.addStepOtherDepartment);
			let v3 = null;
			if (coKhac) {
				await bamNut(p, s.addStepOtherDepartment);
				await choVungLoi(p);
				v3 = await docVungLoi(p);
			}
			await chup(p, `them-buoc-khac-loi-phong-ban-${kho}`);
			kiem(
				`them-buoc-khac-loi-phong-ban-${kho}`,
				`nut «${s.addStepOtherDepartment}»: ${coKhac}; vung loi ${JSON.stringify(v3)}`,
				coKhac && v3 !== null && vungLoiDat(v3),
			);
		} finally {
			await ctx.close();
		}
	}
}

async function conSotMong(toiId, idViec, idBuoc) {
	const dau = dauNgayVN(new Date());
	const [viec, buoc, buocHienQuaHan] = await Promise.all([
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
		db.onboardingStep.count({
			where: { id: { in: idBuoc }, dueAt: { lt: dau } },
		}),
	]);
	return {
		tong: viec + buoc,
		mong: Math.max(0, viec + buoc - idViec.length - buocHienQuaHan),
	};
}

function chonMuiGio(now) {
	const gio = Number(
		new Intl.DateTimeFormat("en-GB", {
			timeZone: "Asia/Ho_Chi_Minh",
			hour: "2-digit",
			hourCycle: "h23",
		}).format(now),
	);
	return gio < GIO_LUI_TOI
		? { tz: LUI, lechNgay: -1, quaHan: true }
		: gio >= GIO_TIEN_TU
			? { tz: TIEN, lechNgay: 0, quaHan: false }
			: khongDo(`gio VN ${gio} khong thuoc cua so nao`);
}

async function doQuaHan(cookie, slug, toi, boPhan) {
	const now = new Date();
	const chon = chonMuiGio(now);
	const han = new Date(
		dauNgayVN(now).getTime() + chon.lechNgay * DAY_MS + GIO_MS,
	);
	const nhan = `Bước đo ngày VN ${MA}`;
	await gieoKeHoach(toi.id, boPhan[0].id, {
		label: nhan,
		dueAt: han,
		assigneeId: toi.id,
	});
	const v = await db.activity.create({
		data: {
			type: ActivityType.TASK,
			subject: `Việc đo E6b ${MA}`,
			dueAt: new Date(dauNgayVN(now).getTime() - 2 * DAY_MS),
			createdById: toi.id,
		},
	});
	daTao.viec.push(v.id);
	const homNay = homNayVN(now);
	for (const kho of KHO) {
		const { ctx, p } = await trang(kho, cookie, null);
		try {
			await p.emulateTimezone(chon.tz);
			await p.goto(`${APP}/${slug}`, {
				waitUntil: "networkidle0",
				timeout: CHO_MS,
			});
			await p
				.waitForSelector('[data-khoi="viec-qua-han"]', { timeout: CHO_MS })
				.catch(() => khongDo("khong thay the viec qua han"));
			const doc = await p.$eval(
				'[data-khoi="viec-qua-han"]',
				(e, nhan) => {
					e.scrollIntoView({ block: "start" });
					const hang = [...e.querySelectorAll("[data-buoc]")].find((r) =>
						r.textContent?.includes(nhan),
					);
					const chan = e.querySelector("[data-con-sot]");
					return {
						coHang: hang !== undefined,
						tone:
							hang
								?.querySelector('[data-slot="status-indicator"]')
								?.getAttribute("data-tone") ?? null,
						conSot: chan?.getAttribute("data-con-sot") ?? null,
						idViec: [...e.querySelectorAll("[data-viec]")].map((r) =>
							r.getAttribute("data-viec"),
						),
						idBuoc: [...e.querySelectorAll("[data-buoc]")].map((r) =>
							r.getAttribute("data-buoc"),
						),
						tzTrang: Intl.DateTimeFormat().resolvedOptions().timeZone,
					};
				},
				nhan,
			);
			if (doc.tzTrang !== chon.tz)
				khongDo(`trang khong o mui gio ${chon.tz}: ${doc.tzTrang}`);
			if (!doc.coHang)
				khongDo(
					`buoc gieo khong nam trong «Bước của tôi» (tran danh sach) — ${NGUOI} co qua nhieu buoc som hon`,
				);
			await chup(p, `qua-han-con-sot-${kho}`);
			const mong = chon.quaHan ? "error" : "neutral";
			const sot = await conSotMong(toi.id, doc.idViec, doc.idBuoc);
			const conSot = Number(doc.conSot ?? 0);
			kiem(
				`qua-han-con-sot-${kho}`,
				`mui gio ${chon.tz}, hom nay VN ${homNay}, han buoc ${han.toISOString()}; dau cua dong ${doc.tone} (mong ${mong}); data-con-sot ${conSot} (mong ${sot.mong} = tong ${sot.tong} - ${doc.idViec.length} dong viec - dong buoc qua han theo ngay VN)`,
				doc.tone === mong && conSot === sot.mong,
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
			"khong phai kho do rieng — chay qua tbd_man (mot-luot.sh, tien-de.mjs)",
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
	for (const ten of [`Phòng ban đo A ${MA}`, `Phòng ban đo B ${MA}`]) {
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
		await doThemBuoc(cookie, slug, toi, boPhan);
		await doQuaHan(cookie, slug, toi, boPhan);
	} finally {
		await db.activity.deleteMany({ where: { id: { in: daTao.viec } } });
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
