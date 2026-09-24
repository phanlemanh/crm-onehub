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
	goiApiTao,
	ket,
	khongDo,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG_CHUNG = join(HERE, "..", "evidence");
const KHO = [320, 375, 768, 1024, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const KHO_HAI_COT = 1024;
const O_MONG = 10;
const KY_MONG = 36;
const MA = `tcds${Date.now().toString(36).slice(-6)}`;
const LOI_HYDRATE = /hydrat/i;
const CHO_HYDRATE_MS = 1000;
const CHO_YEN = 10000;
const NHAN = {
	themNguoi: "Thêm người",
	ganCoSan: "Gắn phòng ban có sẵn",
	gan: (n) => `Gắn ${n} phòng ban`,
	them: (n) => `Thêm ${n} người`,
	phu: "phụ",
};

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const QUAN_TRI = `${MA}-quan-tri@thu.test`;
const cookie = chiaCookie(
	execFileSync("bun", ["run", "dev:session", QUAN_TRI], {
		cwd: join(HERE, "..", "..", "..", "apps", "api"),
		encoding: "utf8",
	})
		.trim()
		.split("\n")
		.pop()
		.trim(),
);
const quanTri = await db.user.findUniqueOrThrow({
	where: { email: QUAN_TRI },
	select: { id: true },
});
await db.member.upsert({
	where: {
		organizationId_userId: { organizationId: WORKSPACE_ID, userId: quanTri.id },
	},
	create: {
		id: `member-${quanTri.id}`,
		organizationId: WORKSPACE_ID,
		userId: quanTri.id,
		role: "admin",
		createdAt: new Date(),
	},
	update: { role: "admin" },
});
await db.session.updateMany({
	where: { userId: quanTri.id },
	data: { activeOrganizationId: WORKSPACE_ID },
});
const slug = await suySlug(cookie);

async function goi(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) throw new Error(kq.loi);
	return kq.gia;
}

async function donDep() {
	const nguoi = { startsWith: MA };
	await db.orgSecondaryDepartment.deleteMany({ where: { userId: nguoi } });
	await db.orgPlacement.deleteMany({ where: { userId: nguoi } });
	await db.department.updateMany({
		where: { name: nguoi },
		data: { headUserId: null, divisionId: null },
	});
	await db.division.updateMany({
		where: { name: nguoi },
		data: { headUserId: null },
	});
	await db.department.deleteMany({ where: { name: nguoi } });
	await db.division.deleteMany({ where: { name: nguoi } });
	await db.member.deleteMany({ where: { userId: nguoi } });
	await db.user.deleteMany({ where: { id: nguoi } });
	await db.session.deleteMany({ where: { user: { email: QUAN_TRI } } });
	await db.member.deleteMany({ where: { user: { email: QUAN_TRI } } });
	await db.user.deleteMany({ where: { email: QUAN_TRI } });
}

async function dung(...dong) {
	await donDep();
	await khongDo(...dong);
}

const TEN = ["An", "Bình", "Chi", "Dũng", "Giang", "Hà", "Khánh", "Linh"];
const u = [];
const bp = {};
const pb = {};
try {
	for (const [i, ten] of TEN.entries()) {
		const id = `${MA}-u${i}`;
		const bay = new Date();
		await db.user.create({
			data: {
				id,
				name: `${ten} ${MA}`,
				email: `${id}@thu.test`,
				emailVerified: true,
				createdAt: bay,
				updatedAt: bay,
			},
		});
		await db.member.create({
			data: {
				id: `member-${id}`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role: "member",
				createdAt: bay,
			},
		});
		u.push(id);
	}
	for (const [k, ten] of [
		["kd", "Kinh doanh"],
		["vh", "Vận hành"],
		["tc", "Tài chính"],
	]) {
		bp[k] = (await goi("org.createDivision", { name: `${MA} ${ten}` })).id;
	}
	for (const [k, divisionId, ten] of [
		["v1", bp.kd, "Vùng 1"],
		["v2", bp.kd, "Vùng 2"],
		["kho", bp.vh, "Kho vận"],
		["pc", null, "Pháp chế"],
	]) {
		pb[k] = (
			await goi("org.createDepartment", { name: `${MA} ${ten}`, divisionId })
		).id;
	}
	const xep = [
		[u[0], pb.v1, []],
		[u[1], pb.v1, []],
		[u[2], pb.v2, []],
		[u[3], pb.kho, []],
		[u[4], pb.kho, []],
		[u[5], pb.v2, [pb.kho]],
	];
	for (const [userId, chinh, phu] of xep) {
		await goi("org.setPlacement", {
			userId,
			primaryDepartmentId: chinh,
			secondaryDepartmentIds: phu,
			managerUserId: null,
		});
	}
	await goi("org.setHead", { kind: "department", id: pb.v1, userId: u[0] });
} catch (e) {
	await dung(`KHONG DO DUOC: tien de thieu — ${e.message}`);
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(tieng, rong, don) {
	const trang = await trinhDuyet.newPage();
	const loi = [];
	trang.on("pageerror", (e) => {
		if (LOI_HYDRATE.test(String(e))) loi.push(String(e));
	});
	trang.on("console", (m) => {
		if (m.type() === "error" && LOI_HYDRATE.test(m.text())) loi.push(m.text());
	});
	await trang.setViewport({ width: rong, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: tieng, domain: host, path: "/" },
	);
	await moLai(trang, don);
	return { trang, loi };
}

async function moLai(trang, don) {
	const hoi = don ? `?don=${encodeURIComponent(don)}` : "";
	await trang.goto(`${APP}/${slug}/settings/organization${hoi}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	const hien = await trang
		.waitForSelector("nav [data-nut-cay='goc']", {
			timeout: CHO_TAI,
			visible: true,
		})
		.catch(() => null);
	if (!hien)
		await dung(`KHONG DO DUOC: man To chuc khong hien cay dieu huong (${hoi})`);
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_YEN })
		.catch(() => null);
	await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
}

const khongTran = (trang) =>
	trang.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);

const thay = (trang, chon) =>
	trang.evaluate((c) => {
		const e = document.querySelector(c);
		if (!e) return false;
		const r = e.getBoundingClientRect();
		return r.width > 0 && r.height > 0;
	}, chon);

const tenKhongDich = (trang, ten) =>
	trang.evaluate((dsTen) => {
		const coTen = [...document.querySelectorAll("[data-ten]")];
		const deuKhongDich = coTen.every(
			(e) => e.getAttribute("translate") === "no",
		);
		const du = dsTen.every((t) =>
			coTen.some(
				(e) =>
					e.textContent?.trim() === t && e.getAttribute("translate") === "no",
			),
		);
		return coTen.length > 0 && deuKhongDich && du;
	}, ten);

const khongDeChu = (trang) =>
	trang.evaluate(() => {
		const dong = [...document.querySelectorAll("[data-dong-nguoi]")];
		if (dong.length === 0) return false;
		const giao = (a, b) =>
			Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
			Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1;
		return dong.every((li) => {
			const nut = [...li.querySelectorAll("button")].map((b) =>
				b.getBoundingClientRect(),
			);
			const chu = [...li.querySelectorAll("span")]
				.filter((e) => e.children.length === 0 && e.textContent?.trim())
				.flatMap((e) => {
					const r = document.createRange();
					r.selectNodeContents(e);
					const khung = e.getBoundingClientRect();
					return [...r.getClientRects()].map((c) => ({
						left: Math.max(c.left, khung.left),
						right: Math.min(c.right, khung.right),
						top: Math.max(c.top, khung.top),
						bottom: Math.min(c.bottom, khung.bottom),
						width:
							Math.min(c.right, khung.right) - Math.max(c.left, khung.left),
					}));
				})
				.filter((r) => r.width > 0);
			return nut.every((n) => chu.every((c) => !giao(n, c)));
		});
	});

const khungTruotPhai = (trang) =>
	trang.evaluate(() => {
		const k = document.querySelector(
			"[data-slot='sheet-content'][data-side='right']",
		);
		if (!k?.querySelector("[data-chi-tiet='phong-ban']")) return false;
		const r = k.getBoundingClientRect();
		return r.width > 0 && Math.abs(r.right - window.innerWidth) <= 1;
	});

const haiCot = (trang) =>
	trang.evaluate(() => {
		const nav = document.querySelector("nav [data-nut-cay='goc']");
		const ct = document.querySelector("[data-chi-tiet='phong-ban']");
		if (!nav || !ct) return false;
		const a = nav.getBoundingClientRect();
		const b = ct.getBoundingClientRect();
		return (
			a.width > 0 &&
			b.width > 0 &&
			b.left >= a.right &&
			!document.querySelector("[data-slot='sheet-content']")
		);
	});

async function bamChu(trang, chu, vung = "body") {
	const ok = await trang.evaluate(
		(c, v) => {
			const b = [...document.querySelectorAll(`${v} button`)].find(
				(x) => x.textContent?.trim() === c,
			);
			if (!b) return false;
			b.click();
			return true;
		},
		chu,
		vung,
	);
	if (!ok) throw new Error(`khong thay nut ${chu}`);
}

async function tich(trang, id) {
	await trang.click(
		`[role='dialog'] [data-slot='pick-list-item'][data-id='${id}'] [role='checkbox']`,
	);
}

async function choDong(trang) {
	await trang.waitForFunction(
		() => !document.querySelector("[role='dialog']"),
		{
			timeout: CHO_TAI,
		},
	);
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_YEN })
		.catch(() => null);
}

let khang = 0;
let o = 0;
const hong = [];
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
};

const tenCanThay = [`${MA} Vùng 1`, `${TEN[0]} ${MA}`, `${TEN[1]} ${MA}`];

for (const rong of KHO) {
	for (const tieng of TIENG) {
		const rongHaiCot = rong >= KHO_HAI_COT;
		const { trang, loi } = await moTrang(
			tieng,
			rong,
			rongHaiCot ? `pb:${pb.v1}` : undefined,
		);
		o += 1;
		const n = `${rong}/${tieng}`;
		console.log(`o ${n}`);
		if (rongHaiCot) {
			kiem(
				`${n}: khong hien hai cot hoac nut de len chu trong dong nguoi`,
				(await haiCot(trang)) && (await khongDeChu(trang)),
			);
		} else {
			const chiCay = !(await thay(trang, "[data-chi-tiet]"));
			await trang.click(`nav [data-nut-cay='pb:${pb.v1}']`);
			await trang
				.waitForSelector("[data-slot='sheet-content'] [data-chi-tiet]", {
					visible: true,
					timeout: CHO_TAI,
				})
				.catch(() => null);
			await new Promise((r) => setTimeout(r, 400));
			kiem(
				`${n}: cay khong chiem ca be ngang, khung truot khong mo ben phai, hoac nut de len chu trong dong nguoi`,
				chiCay && (await khungTruotPhai(trang)) && (await khongDeChu(trang)),
			);
		}
		kiem(`${n}: tran ngang`, await khongTran(trang));
		kiem(
			`${n}: ten nguoi hoac don vi thieu translate=no`,
			await tenKhongDich(trang, tenCanThay),
		);
		await trang.screenshot({
			path: join(BANG_CHUNG, `chi-tiet-${rong}-${tieng}.png`),
		});
		for (const l of loi) hong.push(`${n}: loi hydrate ${l.slice(0, 4000)}`);
		await trang.close();
	}
}

console.log("ban phim");
const { trang, loi } = await moTrang("vi", 1440);
let toiNut = false;
for (let i = 0; i < 80 && !toiNut; i += 1) {
	await trang.keyboard.press("Tab");
	toiNut = await trang.evaluate(
		(id) => document.activeElement?.getAttribute("data-nut-cay") === `pb:${id}`,
		pb.kho,
	);
}
await trang.keyboard.press("Enter");
const chonDuoc = await trang
	.waitForFunction(
		(id) =>
			document
				.querySelector(`nav [data-nut-cay='pb:${id}']`)
				?.getAttribute("aria-current") === "page" &&
			document.querySelector("[data-chi-tiet='phong-ban']") !== null,
		{ timeout: 5000 },
		pb.kho,
	)
	.then(() => true)
	.catch(() => false);
kiem("ban phim: Tab va Enter khong chon duoc phong ban", toiNut && chonDuoc);
let toiThem = false;
for (let i = 0; i < 80 && !toiThem; i += 1) {
	await trang.keyboard.press("Tab");
	toiThem = await trang.evaluate(
		(c) => document.activeElement?.textContent?.trim() === c,
		NHAN.themNguoi,
	);
}
await trang.keyboard.press("Enter");
const moHop = await trang
	.waitForSelector("[role='dialog'] [data-slot='pick-list-item']", {
		visible: true,
		timeout: 5000,
	})
	.then(() => true)
	.catch(() => false);
kiem("ban phim: Enter khong mo hop Them nguoi", toiThem && moHop);
await trang.screenshot({ path: join(BANG_CHUNG, "ban-phim.png") });
await trang.keyboard.press("Escape");
await choDong(trang);

console.log("ghi: keo bo phan");
await moLai(trang, "goc");
const tay = await trang.$$("[data-chi-tiet='goc'] [data-muc-keo]");
const idThuBa = await tay[2]?.evaluate((e) => e.getAttribute("data-muc-keo"));
const hopTay = async (i) =>
	(await trang.$$("[data-chi-tiet='goc'] [data-muc-keo]"))[i]?.evaluate((e) => {
		const r = e.parentElement?.querySelector("button")?.getBoundingClientRect();
		return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
	});
const tu = await hopTay(2);
const den = await hopTay(0);
if (tu && den && idThuBa) {
	await trang.mouse.move(tu.x, tu.y);
	await trang.mouse.down();
	await trang.mouse.move(tu.x, tu.y - 8, { steps: 4 });
	await trang.mouse.move(den.x, den.y - 6, { steps: 20 });
	await new Promise((r) => setTimeout(r, 200));
	await trang.mouse.up();
	await trang
		.waitForNetworkIdle({ idleTime: 800, timeout: CHO_YEN })
		.catch(() => null);
}
await moLai(trang, "goc");
const dauSau = await trang.evaluate(
	() =>
		document
			.querySelector("[data-chi-tiet='goc'] [data-muc-keo]")
			?.getAttribute("data-muc-keo") ?? null,
);
kiem(
	"ghi: keo bo phan thu 3 len dau khong giu sau tai lai",
	idThuBa !== undefined && dauSau === idThuBa,
);

console.log("ghi: truong");
await moLai(trang, `pb:${pb.kho}`);
await trang.click(
	"[data-o-truong='department'] [data-slot='combobox-trigger']",
);
await trang.waitForSelector("[cmdk-item]", { visible: true, timeout: CHO_TAI });
await trang.evaluate((t) => {
	const muc = [...document.querySelectorAll("[cmdk-item]")].find((x) =>
		x.textContent?.includes(t),
	);
	muc?.click();
}, `${TEN[3]} ${MA}`);
await trang
	.waitForNetworkIdle({ idleTime: 800, timeout: CHO_YEN })
	.catch(() => null);
await moLai(trang, `pb:${pb.kho}`);
const truong = await trang.evaluate(
	() =>
		document.querySelector(
			"[data-o-truong='department'] [data-slot='combobox-trigger']",
		)?.textContent ?? "",
);
kiem(
	"ghi: truong phong ban khong giu sau tai lai",
	truong.includes(`${TEN[3]} ${MA}`),
);

console.log("ghi: gan");
await moLai(trang, `bp:${bp.tc}`);
await bamChu(trang, NHAN.ganCoSan);
await trang.waitForSelector("[role='dialog'] [data-slot='pick-list-item']", {
	visible: true,
	timeout: CHO_TAI,
});
await tich(trang, pb.pc);
await tich(trang, pb.v2);
await bamChu(trang, NHAN.gan(2), "[role='dialog']");
await choDong(trang);
await moLai(trang, `bp:${bp.tc}`);
const trongTc = await trang.evaluate(() =>
	[
		...document.querySelectorAll("[data-chi-tiet='bo-phan'] [data-muc-keo]"),
	].map((e) => e.getAttribute("data-muc-keo")),
);
kiem(
	"ghi: gan 2 phong ban khong giu sau tai lai",
	trongTc.join(",") === [pb.pc, pb.v2].join(","),
);

console.log("ghi: them nguoi");
await moLai(trang, `pb:${pb.kho}`);
await bamChu(trang, NHAN.themNguoi);
await trang.waitForSelector("[role='dialog'] [data-slot='pick-list-item']", {
	visible: true,
	timeout: CHO_TAI,
});
await tich(trang, u[5]);
await bamChu(trang, NHAN.them(1), "[role='dialog']");
await choDong(trang);
await moLai(trang, `pb:${pb.kho}`);
const dongU5 = await trang.evaluate(
	(id) =>
		document.querySelector(
			`[data-chi-tiet='phong-ban'] [data-dong-nguoi='${id}']`,
		)?.textContent ?? null,
	u[5],
);
kiem(
	"ghi: them nguoi giu phong ban phu khong thanh phong ban chinh sau tai lai",
	dongU5 !== null && !dongU5.includes(NHAN.phu),
);
await trang.screenshot({ path: join(BANG_CHUNG, "ghi-that.png") });
for (const l of loi) hong.push(`1440/vi ghi: loi hydrate ${l.slice(0, 4000)}`);
await trang.close();

await donDep();
console.log(`o=${o}/${O_MONG} khang-dinh=${khang}/${KY_MONG}`);
if (o !== O_MONG || khang !== KY_MONG) {
	await khongDo(
		`KHONG DO DUOC: ma tran lech ban khai — o=${o} khang-dinh=${khang}`,
	);
}
for (const h of hong) console.log(`HONG ${h}`);
await ket(hong.length === 0 ? 0 : 1);
