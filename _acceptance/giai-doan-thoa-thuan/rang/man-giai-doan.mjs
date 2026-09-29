import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	API,
	APP,
	CHO_TAI,
	CHROME,
	datTrinhDuyet,
	goiApiTao,
	ket,
	khongDo,
	mu,
	NGUOI,
	phien,
	suySlug,
} from "../../man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const BANG_CHUNG = join(HERE, "..", "evidence");
const KHO = [320, 375, 768, 1024, 1440];
const TIENG = ["vi", "en"];
const CAO = 900;
const KY_MONG = 35;
const MA = `gdtt${Date.now().toString(36)}`;
const LOI_HYDRATE = /hydrat/i;
const CHO_HYDRATE_MS = 1000;

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const cookie = phien();
const quanTri = await db.user.findUniqueOrThrow({
	where: { email: NGUOI },
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
const slug = await suySlug(cookie);

async function doc(duong, vao) {
	const q =
		vao === undefined
			? ""
			: `?input=${encodeURIComponent(JSON.stringify(vao))}`;
	const res = await fetch(`${API}/api/trpc/${duong}${q}`, {
		headers: mu(cookie),
	});
	const chu = await res.text();
	if (!res.ok)
		return { loi: `${duong} tra ${res.status}: ${chu.slice(0, 160)}` };
	return { gia: JSON.parse(chu).result.data };
}

const toiDoc = await doc("users.me");
if (toiDoc.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${toiDoc.loi}`);
const toi = toiDoc.gia;

const tamNhan = `Tạm ${MA}`;
const moiNhan = `Mới ${MA}`;
const giaiDoanTam = await goiApiTao(cookie, "giaiDoan.create", {
	label: tamNhan,
	kind: "OPEN",
});
if (giaiDoanTam.loi) {
	await khongDo(`KHONG DO DUOC: tien de thieu — ${giaiDoanTam.loi}`);
}
const congTy = await goiApiTao(cookie, "companies.create", {
	name: `Cong ty do ${MA}`,
});
if (congTy.loi) await khongDo(`KHONG DO DUOC: tien de thieu — ${congTy.loi}`);

const daGieo = [];
const giaiDoanDaTao = [giaiDoanTam.gia.id];

async function donDep() {
	if (daGieo.length > 0) {
		await goiApiTao(cookie, "deals.bulkArchive", { ids: daGieo });
		await goiApiTao(cookie, "deals.bulkPurge", { ids: daGieo });
	}
	await goiApiTao(cookie, "companies.bulkArchive", { ids: [congTy.gia.id] });
	await goiApiTao(cookie, "companies.bulkPurge", { ids: [congTy.gia.id] });
	for (const id of giaiDoanDaTao) {
		await goiApiTao(cookie, "giaiDoan.archive", { id });
	}
}

async function dung(...dong) {
	await donDep();
	await khongDo(...dong);
}

for (let i = 0; i < 3; i += 1) {
	const tao = await goiApiTao(cookie, "deals.create", {
		name: `${MA} ${i}`,
		companyId: congTy.gia.id,
		ownerId: toi.id,
		stage: giaiDoanTam.gia.id,
	});
	if (tao.loi) await dung(`KHONG DO DUOC: tien de thieu — ${tao.loi}`);
	daGieo.push(tao.gia.id);
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

async function moTrang(duong, tieng, rong, choChon) {
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
	await trang.goto(`${APP}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	const hien = await trang
		.waitForSelector(choChon, { timeout: CHO_TAI, visible: true })
		.catch(() => null);
	if (!hien) {
		await trang
			.screenshot({ path: join(BANG_CHUNG, "E15-khong-hien.png") })
			.catch(() => null);
		const url = trang.url();
		const chu = await trang
			.evaluate(() => document.body?.innerText?.slice(0, 400) ?? "")
			.catch(() => "");
		console.log(`url=${url}`);
		console.log(`chu=${chu.replace(/\s+/g, " ")}`);
		await dung(
			`KHONG DO DUOC: ${rong}/${tieng} ${duong} khong hien ${choChon} trong ${CHO_TAI}ms`,
		);
	}
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO_TAI })
		.catch(() => null);
	await new Promise((r) => setTimeout(r, CHO_HYDRATE_MS));
	return { trang, loi };
}

function docTrang() {
	return {
		tran: (() => {
			const vung = document.querySelector("main");
			if (!vung) return true;
			return (
				vung.scrollWidth > vung.clientWidth + 1 ||
				[...vung.querySelectorAll("*")].some(
					(e) => e.getBoundingClientRect().right > innerWidth + 1,
				)
			);
		})(),
		trangToan: document.documentElement.scrollWidth > innerWidth + 1,
		vuot: [...document.querySelectorAll("main *")]
			.filter((e) => e.getBoundingClientRect().right > innerWidth + 1)
			.filter(
				(e) =>
					![...e.children].some(
						(c) => c.getBoundingClientRect().right > innerWidth + 1,
					),
			)
			.slice(0, 3)
			.map(
				(e) =>
					`${e.tagName.toLowerCase()}.${String(e.className).slice(0, 60)} «${(e.textContent ?? "").trim().slice(0, 30)}» r=${Math.round(e.getBoundingClientRect().right)}`,
			),
		the: [...document.querySelectorAll("[data-the-giai-doan]")].map((e) =>
			e.getAttribute("data-the-giai-doan"),
		),
		nhan: [...document.querySelectorAll("[data-nhan-giai-doan]")].map((e) => ({
			chu: e.textContent?.trim() ?? "",
			dich: e.getAttribute("translate"),
		})),
	};
}

async function bamTheoChu(trang, chon, chu) {
	const nut = await trang.evaluateHandle(
		(c, t) =>
			[...document.querySelectorAll(c)].find(
				(e) => e.textContent?.trim() === t,
			) ?? null,
		chon,
		chu,
	);
	const el = nut.asElement();
	if (!el) return false;
	await new Promise((r) => setTimeout(r, 300));
	await el.evaluate((e) => e.click());
	return true;
}

let khang = 0;
let o = 0;
const hong = [];

for (const tieng of TIENG) {
	for (const rong of KHO) {
		const { trang, loi } = await moTrang(
			"/settings/giai-doan",
			tieng,
			rong,
			"[data-the-giai-doan]",
		);
		const d = await trang.evaluate(docTrang);
		o += 1;
		khang += 1;
		if (d.tran) hong.push(`tran trang ${rong}/${tieng}: ${d.vuot.join(" | ")}`);
		khang += 1;
		if (d.the.join(",") !== "OPEN,WON,LOST") {
			hong.push(`ba the sai ${rong}/${tieng}: ${d.the.join(",")}`);
		}
		khang += 1;
		if (d.nhan.length === 0 || d.nhan.some((n) => n.dich !== "no")) {
			hong.push(`nhan khong mang translate=no ${rong}/${tieng}`);
		}
		if (loi.length > 0) hong.push(`loi hydrate ${rong}/${tieng}`);
		if (d.trangToan && !d.tran) {
			console.log(
				`GHI CHU ngoai vung trang: document tran o ${rong}/${tieng} (header chung)`,
			);
		}
		await trang.screenshot({
			path: join(BANG_CHUNG, `E15-cai-dat-${rong}-${tieng}.png`),
			fullPage: true,
		});
		await trang.close();
	}
}

{
	const { trang } = await moTrang(
		"/settings/giai-doan",
		"vi",
		1440,
		"[data-the-giai-doan]",
	);
	const bam = await trang.evaluate(() => {
		const the = document.querySelector('[data-the-giai-doan="OPEN"]');
		const nut = [...(the?.querySelectorAll("button") ?? [])].find(
			(b) => b.textContent?.trim() === "Thêm giai đoạn",
		);
		nut?.click();
		return Boolean(nut);
	});
	if (!bam) await dung("KHONG DO DUOC: khong thay nut Them o the Dang mo");
	await trang.waitForSelector('[role="dialog"] input', { timeout: CHO_TAI });
	await trang.type('[role="dialog"] input', moiNhan);
	await bamTheoChu(trang, '[role="dialog"] button', "Lưu");
	await trang
		.waitForFunction(
			(nhan) =>
				[...document.querySelectorAll("[data-nhan-giai-doan]")].some(
					(e) => e.textContent?.trim() === nhan,
				),
			{ timeout: CHO_TAI },
			moiNhan,
		)
		.catch(() => null);
	const sauThem = await trang.evaluate(docTrang);
	khang += 1;
	if (!sauThem.nhan.some((n) => n.chu === moiNhan)) {
		hong.push("them: giai doan moi khong hien trong the Dang mo");
	}
	const ds = await doc("giaiDoan.list");
	const moi = ds.gia?.stages.find((g) => g.label === moiNhan);
	if (moi) giaiDoanDaTao.push(moi.id);
	await trang.close();

	const bang = await moTrang(
		"/deals?view=board",
		"vi",
		1440,
		"[data-board-column]",
	);
	const coCot = await bang.trang.evaluate(
		(id) => Boolean(document.querySelector(`[data-board-column="${id}"]`)),
		moi?.id ?? "",
	);
	khang += 1;
	if (!coCot) hong.push("them: giai doan moi khong thanh cot cua bang cot");
	await bang.trang.screenshot({
		path: join(BANG_CHUNG, "E15-them-thay-o-bang-cot.png"),
	});
	await bang.trang.close();
}

{
	const { trang } = await moTrang(
		"/settings/giai-doan",
		"vi",
		1440,
		"[data-the-giai-doan]",
	);
	const menu = await trang.$(
		`[data-hang-giai-doan="${giaiDoanTam.gia.id}"] [data-menu-giai-doan]`,
	);
	if (!menu) await dung("KHONG DO DUOC: khong thay menu cua giai doan tam");
	await menu.click();
	await trang.waitForSelector('[role="menuitem"]', { timeout: CHO_TAI });
	await bamTheoChu(trang, '[role="menuitem"]', "Xoá");
	await trang.waitForSelector('[role="dialog"]', { timeout: CHO_TAI });
	const moTa = await trang.evaluate(
		() => document.querySelector('[role="dialog"]')?.textContent ?? "",
	);
	khang += 1;
	if (!moTa.includes("Còn 3 thoả thuận")) {
		hong.push("xoa-chuyen: hop thoai khong bao con 3 thoa thuan");
	}
	await trang.click('[role="dialog"] [role="combobox"]');
	await trang.waitForSelector('[role="option"]', { timeout: CHO_TAI });
	const dichNhan = await trang.evaluate(() => {
		const opt = document.querySelector('[role="option"]');
		return opt?.textContent?.trim() ?? "";
	});
	await bamTheoChu(trang, '[role="option"]', dichNhan);
	await bamTheoChu(trang, '[role="dialog"] button', "Chuyển và xoá");
	await trang
		.waitForFunction(() => !document.querySelector('[role="dialog"]'), {
			timeout: CHO_TAI,
		})
		.catch(() => null);
	await trang.screenshot({ path: join(BANG_CHUNG, "E15-xoa-chuyen.png") });
	const ds = await doc("giaiDoan.list");
	const dich = ds.gia?.stages.find((g) => g.label === dichNhan);
	const stage = [];
	for (const id of daGieo) {
		const r = await doc("deals.byId", { id });
		stage.push(r.gia?.stage);
	}
	khang += 1;
	if (!dich || stage.some((s) => s !== dich.id)) {
		hong.push(`xoa-chuyen: thoa thuan chua o dich (${stage.join(",")})`);
	}
	khang += 1;
	if (ds.gia?.stages.some((g) => g.id === giaiDoanTam.gia.id)) {
		hong.push("xoa-chuyen: giai doan nguon van con trong danh sach");
	}
	await trang.close();
}

await donDep();
for (const h of hong) console.log(`HONG ${h}`);
console.log(
	`o=${o}/${KHO.length * TIENG.length} khang-dinh=${khang - hong.length}/${KY_MONG}`,
);
if (khang !== KY_MONG) {
	console.log(`KHONG DO DUOC: dem ${khang} != ${KY_MONG}`);
	await ket(2);
}
await ket(hong.length === 0 ? 0 : 1);
