import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	APP,
	CHO_TAI,
	CHROME,
	chiaCookie,
	datTrinhDuyet,
	ket,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = join(HERE, "..", "..", "..");
const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "vai-chi-okr", "evidence");
const KHO = [375, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const MA = `vco${Date.now().toString(36)}`;
const LOI_HYDRATE = /hydrat/i;
const CHO_HYDRATE_MS = 1000;
const PHAM_VI_DOI_TAC = new Set([
	"contacts",
	"companies",
	"deals",
	"campaigns",
	"activities",
	"onboarding",
	"search",
	"dashboard",
	"enrichment",
	"savedViews",
	"fields",
	"google",
	"microsoft",
	"tracking",
	"slack",
	"agents",
	"conversations",
]);
const NHAN = {
	vi: {
		railChinh: "Điều hướng chính",
		thanhBen: "Cài đặt công ty",
		doiTac: [
			"Công ty",
			"Cá nhân",
			"Thoả thuận",
			"Chiến dịch",
			"30 ngày đầu",
			"Hội thoại",
		],
		tongQuan: "Tổng quan",
		caiDat: "Cài đặt",
		ngoaiPhamVi: "Phần này không thuộc vai của bạn",
		veTongQuan: "Về Tổng quan",
		chiOkr: "Chỉ OKR",
		thanhVien: "Thành viên",
		choPhep: "Cho phép một địa chỉ",
	},
	en: {
		railChinh: "Primary",
		thanhBen: "Workspace settings",
		doiTac: [
			"Companies",
			"Contacts",
			"Deals",
			"Campaigns",
			"First 30 days",
			"Chat",
		],
		tongQuan: "Overview",
		caiDat: "Settings",
		ngoaiPhamVi: "This part is not in your role",
		veTongQuan: "Back to Overview",
		chiOkr: "OKR only",
		thanhVien: "Member",
		choPhep: "Allow an address",
	},
};

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

function phienCua(email) {
	return chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);
}

async function datVai(email, vai) {
	const nguoi = await db.user.findUniqueOrThrow({
		where: { email },
		select: { id: true },
	});
	await db.member.upsert({
		where: {
			organizationId_userId: { organizationId: WORKSPACE_ID, userId: nguoi.id },
		},
		create: {
			id: `member-${nguoi.id}`,
			organizationId: WORKSPACE_ID,
			userId: nguoi.id,
			role: vai,
			createdAt: new Date(),
		},
		update: { role: vai },
	});
	await db.session.updateMany({
		where: { userId: nguoi.id },
		data: { activeOrganizationId: WORKSPACE_ID },
	});
	return nguoi.id;
}

const EMAIL_OKR = `okr-${MA}@thu.test`;
const EMAIL_ADMIN = `admin-${MA}@thu.test`;
const EMAIL_THU = `thu-${MA}@thu.test`;

const cookieOkr = phienCua(EMAIL_OKR);
const cookieAdmin = phienCua(EMAIL_ADMIN);
const okrId = await datVai(EMAIL_OKR, "okr");
const adminId = await datVai(EMAIL_ADMIN, "admin");
const bay = new Date();
const thuId = `${MA}-thu`;
await db.user.create({
	data: {
		id: thuId,
		name: `Thu ${MA}`,
		email: EMAIL_THU,
		emailVerified: true,
		createdAt: bay,
		updatedAt: bay,
	},
});
await db.member.create({
	data: {
		id: `member-${thuId}`,
		organizationId: WORKSPACE_ID,
		userId: thuId,
		role: "member",
		createdAt: bay,
	},
});
const slug = await suySlug(cookieAdmin);

async function donDep() {
	const ids = [okrId, adminId, thuId];
	await db.session.deleteMany({ where: { userId: { in: ids } } });
	await db.member.deleteMany({ where: { userId: { in: ids } } });
	await db.user.deleteMany({ where: { id: { in: ids } } });
}

async function dung(...dong) {
	await donDep();
	await khongDo(...dong);
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

function aliasCua(url) {
	const m = url.match(/\/api\/trpc\/([^?]+)/);
	if (!m) return [];
	return m[1].split(",").map((p) => decodeURIComponent(p).split(".")[0]);
}

async function moTrang(cookie, tieng, rong, duong, choSelector) {
	const trang = await trinhDuyet.newPage();
	const loi = [];
	const goiDoiTac = [];
	const bi403 = [];
	trang.on("pageerror", (e) => loi.push(String(e)));
	trang.on("console", (m) => {
		if (m.type() === "error" && LOI_HYDRATE.test(m.text())) loi.push(m.text());
	});
	trang.on("request", (r) => {
		for (const a of aliasCua(r.url()))
			if (PHAM_VI_DOI_TAC.has(a)) goiDoiTac.push(a);
	});
	trang.on("response", (r) => {
		if (r.status() === 403) bi403.push(r.url());
	});
	await trang.setViewport({ width: rong, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	await trang.goto(`${APP}${duong}`, { waitUntil: "load", timeout: CHO_TAI });
	if (choSelector) {
		const hien = await trang
			.waitForSelector(choSelector, { timeout: CHO_TAI, visible: true })
			.catch(() => null);
		if (!hien)
			await dung(
				`KHONG DO DUOC: ${rong}/${tieng} ${duong} khong hien ${choSelector}`,
			);
	}
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_TAI })
		.catch(() => null);
	await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
	return { trang, loi, goiDoiTac, bi403 };
}

const khongTran = (trang) =>
	trang.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);

const demLink = (trang, nhanNav) =>
	trang.evaluate(
		(n) =>
			[...document.querySelectorAll(`nav[aria-label="${n}"]`)].map(
				(nav) => nav.querySelectorAll("a").length,
			),
		nhanNav,
	);

const chuTrang = (trang) => trang.evaluate(() => document.body.innerText);

const coLink = (trang, duoi) =>
	trang.evaluate(
		(d) =>
			[...document.querySelectorAll("a")].some((a) =>
				a.getAttribute("href")?.endsWith(d),
			),
		duoi,
	);

let khang = 0;
const hong = [];
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
};

try {
	for (const rong of KHO) {
		for (const tieng of TIENG) {
			const n = `okr ${rong}/${tieng}`;
			const t = NHAN[tieng];
			const { trang, loi, goiDoiTac, bi403 } = await moTrang(
				cookieOkr,
				tieng,
				rong,
				`/${slug}`,
				"main",
			);
			kiem(`${n}: tran ngang`, await khongTran(trang));
			const dem = await demLink(trang, t.railChinh);
			kiem(
				`${n}: rail phai co dung 2 link, thay ${JSON.stringify(dem)}`,
				dem.length === 1 && dem[0] === 2,
			);
			const chu = await chuTrang(trang);
			const lo = t.doiTac.filter((nhan) => chu.includes(nhan));
			kiem(`${n}: lo nhan doi tac ${lo.join(", ")}`, lo.length === 0);
			kiem(
				`${n}: thieu lien ket toi Thong bao cua ban`,
				await coLink(trang, "/settings/notifications"),
			);
			kiem(
				`${n}: goi router doi tac ${goiDoiTac.join(",")}`,
				goiDoiTac.length === 0,
			);
			kiem(`${n}: co phan hoi 403 ${bi403.join(",")}`, bi403.length === 0);
			for (const l of loi) hong.push(`${n}: loi trang ${l.slice(0, 300)}`);
			await trang.screenshot({
				path: join(BANG_CHUNG, `tong-quan-okr-${rong}-${tieng}.png`),
				fullPage: true,
			});
			await trang.close();

			if (tieng === "vi" || rong === 1440) {
				const m = await moTrang(
					cookieOkr,
					tieng,
					rong,
					`/${slug}/settings/notifications`,
					"main",
				);
				const demBen = await m.trang.evaluate(
					(nh) =>
						[...document.querySelectorAll(`nav[aria-label="${nh}"]`)].map(
							(nav) => nav.querySelectorAll("a").length,
						),
					t.thanhBen,
				);
				kiem(
					`${n}: thanh ben Cai dat phai 2 muc moi nav, thay ${JSON.stringify(demBen)}`,
					demBen.length >= 1 && demBen.every((x) => x === 2),
				);
				kiem(
					`${n}: cai dat goi router doi tac ${m.goiDoiTac.join(",")}`,
					m.goiDoiTac.length === 0,
				);
				kiem(`${n}: cai dat co 403`, m.bi403.length === 0);
				await m.trang.screenshot({
					path: join(BANG_CHUNG, `cai-dat-okr-${rong}-${tieng}.png`),
					fullPage: true,
				});
				await m.trang.close();
			}

			const ng = await moTrang(
				cookieOkr,
				tieng,
				rong,
				`/${slug}/contacts`,
				"main",
			);
			const url = new URL(ng.trang.url()).pathname;
			kiem(
				`${n}: go /contacts phai ve ngoai-pham-vi, thay ${url}`,
				url.endsWith("/ngoai-pham-vi"),
			);
			const h1 = await ng.trang.evaluate(
				() => document.querySelector("h1")?.textContent?.trim() ?? "",
			);
			kiem(`${n}: h1 ngoai pham vi, thay «${h1}»`, h1 === t.ngoaiPhamVi);
			kiem(
				`${n}: thieu lien ket ve Tong quan`,
				await coLink(ng.trang, `/${slug}`),
			);
			kiem(
				`${n}: ngoai pham vi goi router doi tac ${ng.goiDoiTac.join(",")}`,
				ng.goiDoiTac.length === 0,
			);
			kiem(`${n}: ngoai pham vi co 403`, ng.bi403.length === 0);
			await ng.trang.screenshot({
				path: join(BANG_CHUNG, `ngoai-pham-vi-${rong}-${tieng}.png`),
				fullPage: true,
			});
			if (rong === 1440 && tieng === "vi") {
				await ng.trang.evaluate((s) => {
					const a = [...document.querySelectorAll("a")].find(
						(x) => x.getAttribute("href") === `/${s}`,
					);
					a?.click();
				}, slug);
				await ng.trang
					.waitForNavigation({ waitUntil: "load", timeout: CHO_TAI })
					.catch(() => null);
				kiem(
					`${n}: bam Ve Tong quan phai ve /${slug}, thay ${new URL(ng.trang.url()).pathname}`,
					new URL(ng.trang.url()).pathname === `/${slug}`,
				);
			}
			await ng.trang.close();
		}
	}

	{
		const s = await moTrang(
			cookieOkr,
			"vi",
			1440,
			`/${slug}?sheet=contact:khong-co`,
			"main",
		);
		const loiKhongBat = s.loi.filter((l) => !/403|FORBIDDEN/i.test(l));
		kiem(
			`okr ?sheet: loi khong bat ${loiKhongBat.join(" | ").slice(0, 300)}`,
			loiKhongBat.length === 0,
		);
		await s.trang.close();
	}

	{
		const t = NHAN.vi;
		const a = await moTrang(cookieAdmin, "vi", 1440, `/${slug}`, "main");
		const dem = await demLink(a.trang, t.railChinh);
		kiem(
			`admin: rail phai 8 link, thay ${JSON.stringify(dem)}`,
			dem.length === 1 && dem[0] === 8,
		);
		await a.trang.screenshot({
			path: join(BANG_CHUNG, "rail-admin.png"),
			fullPage: false,
		});
		await a.trang.close();

		const m = await moTrang(
			cookieAdmin,
			"vi",
			1440,
			`/${slug}/settings/members`,
			"table",
		);
		const trang = m.trang;
		const hangThu = await trang.$$("tr");
		let nutMenu = null;
		for (const hang of hangThu) {
			const chu = await hang.evaluate((r) => r.textContent ?? "");
			if (chu.includes(`Thu ${MA}`)) {
				nutMenu = await hang.$("button[aria-haspopup='menu']");
				break;
			}
		}
		kiem("admin: mo duoc menu vai cua nguoi thu", nutMenu !== null);
		if (nutMenu) await nutMenu.click();
		await trang
			.waitForSelector("[role='menuitem']", { visible: true, timeout: CHO_TAI })
			.catch(() => null);
		const muc = await trang.evaluate(() =>
			[...document.querySelectorAll("[role='menuitem']")].map((e) =>
				e.textContent?.trim(),
			),
		);
		kiem(
			`admin: menu vai phai co «${t.chiOkr}», thay ${JSON.stringify(muc)}`,
			muc.includes(t.chiOkr),
		);
		await trang.screenshot({
			path: join(BANG_CHUNG, "menu-vai.png"),
			fullPage: false,
		});
		for (const item of await trang.$$("[role='menuitem']")) {
			const chu = await item.evaluate((e) => e.textContent?.trim() ?? "");
			if (chu === t.chiOkr) {
				await item.click();
				break;
			}
		}
		await trang
			.waitForNetworkIdle({ idleTime: 500, timeout: CHO_TAI })
			.catch(() => null);
		let vaiTrenMan = "";
		for (let i = 0; i < 20; i += 1) {
			vaiTrenMan = await trang.evaluate((ten) => {
				const hang = [...document.querySelectorAll("tr")].find((r) =>
					r.textContent?.includes(ten),
				);
				return hang?.textContent ?? "";
			}, `Thu ${MA}`);
			if (vaiTrenMan.includes(t.chiOkr)) break;
			await new Promise((r) => setTimeout(r, 250));
		}
		kiem(
			"admin: o vai doi thanh Chi OKR tren man",
			vaiTrenMan.includes(t.chiOkr),
		);
		await trang.screenshot({
			path: join(BANG_CHUNG, "da-doi-vai.png"),
			fullPage: false,
		});
		const dong = await db.member.findFirstOrThrow({
			where: { userId: thuId },
			select: { role: true },
		});
		kiem(
			`admin: cot role trong DB phai la okr, thay ${dong.role}`,
			dong.role === "okr",
		);

		const moChoPhep = await trang.evaluate((nhan) => {
			const b = [...document.querySelectorAll("button")].find(
				(x) => x.textContent?.trim() === nhan,
			);
			if (!b) return false;
			b.click();
			return true;
		}, t.choPhep);
		kiem("admin: mo duoc hop thoai cho phep", moChoPhep);
		await trang
			.waitForSelector("[role='dialog']", { visible: true, timeout: CHO_TAI })
			.catch(() => null);
		await trang.evaluate(() => {
			const trig = document.querySelector(
				"[role='dialog'] button[role='combobox']",
			);
			trig?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
			trig?.click();
		});
		await new Promise((r) => setTimeout(r, 400));
		const lua = await trang.evaluate(() =>
			[...document.querySelectorAll("[role='option']")].map((e) =>
				e.textContent?.trim(),
			),
		);
		kiem(
			`admin: o vai cua hop thoai cho phep co «${t.chiOkr}», thay ${JSON.stringify(lua)}`,
			lua.includes(t.chiOkr),
		);
		await trang.screenshot({
			path: join(BANG_CHUNG, "cho-phep-vai.png"),
			fullPage: false,
		});
		await trang.close();
	}
} catch (e) {
	hong.push(`ngoai le: ${e.stack ?? e.message}`);
}

await trinhDuyet.close();
await donDep();

console.log(`man-chi-okr: ${khang} khang dinh, ${hong.length} hong`);
for (const h of hong) console.log(`  HONG: ${h}`);
await ket(hong.length ? 1 : 0);
