import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import { isMeasureDatabase } from "../../../packages/db/src/measure-database.ts";
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
const GOC = join(HERE, "..", "..", "..");
const BANG_CHUNG = (() => {
	const dat = process.env.BANG_CHUNG ?? "_acceptance/sort-moi-truong/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	choMenuMs: 600,
	rong: { lon: 1280, vua: 768, hep: 375 },
	cao: { lon: 900, hep: 812 },
};
const TIEN_TO = "smtman";

const tenKho = (() => {
	try {
		return new URL(process.env.DATABASE_URL ?? "").pathname.replace(/^\//, "");
	} catch {
		return "";
	}
})();
if (!isMeasureDatabase(tenKho))
	await khongDo(
		`KHONG DO DUOC: can mot phien do (kho _do) — kho "${tenKho}". Chay qua scripts/lan-do/tien-de.mjs`,
	);

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

async function tao(duong, vao) {
	const kq = await goiApiTao(cookie, duong, vao);
	if (kq.loi) await khongDo(`KHONG DO DUOC: ${kq.loi}`);
	return kq.gia;
}

const nguoiRes = await fetch(`${API}/api/trpc/users.list`, {
	headers: mu(cookie),
});
if (!nguoiRes.ok)
	await khongDo(`KHONG DO DUOC: users.list tra ${nguoiRes.status}`);
const toi = (await nguoiRes.json()).result.data[0];
if (!toi) await khongDo("KHONG DO DUOC: khong co nguoi dung nao trong kho do");

const NHAN = {
	NUMBER: "Số smt",
	DATE: "Ngày smt",
	TEXT: "Chữ smt",
	LONG_TEXT: "Ghi chú smt",
	CHECKBOX: "Ô tích smt",
	SELECT: "Chọn smt",
	URL: "Liên kết smt",
	EMAIL: "Email smt",
	PHONE: "Điện thoại smt",
	USER: "Người smt",
};
const HIEN_O_768 = new Set(["NUMBER", "USER", "URL", "EMAIL", "PHONE"]);

async function gieoTruong(entity) {
	const truong = {};
	for (const [type, label] of Object.entries(NHAN)) {
		truong[type] = await tao("fields.create", {
			entity,
			label,
			type,
			options: type === "SELECT" ? [{ label: "Vàng" }, { label: "Bạc" }] : [],
			agentFilled: false,
			showOnSheet: true,
			showOnTable: true,
		});
	}
	return truong;
}

const truongDeal = await gieoTruong("DEAL");
await gieoTruong("COMPANY");

const giaiDoan = await db.dealStage.findMany({
	where: { archivedAt: null, kind: "OPEN" },
	orderBy: { position: "asc" },
	select: { id: true },
	take: 2,
});
if (giaiDoan.length < 2)
	await khongDo("KHONG DO DUOC: kho do thieu hai giai doan mo");

const congTy = await tao("companies.create", { name: `${TIEN_TO} Công ty` });
const BAN_GHI = [
	{ ten: `${TIEN_TO} Alpha`, so: 1234.5, ngay: "2026-12-01", giaiDoan: 0 },
	{ ten: `${TIEN_TO} Beta`, so: null, ngay: null, giaiDoan: 0 },
	{ ten: `${TIEN_TO} Gamma`, so: 5, ngay: "2026-11-05", giaiDoan: 1 },
];
for (const b of BAN_GHI) {
	const d = await tao("deals.create", {
		name: b.ten,
		companyId: congTy.id,
		ownerId: toi.id,
		stage: giaiDoan[b.giaiDoan].id,
		amountCents: 5000000,
		currency: "VND",
		expectedCloseDate: "2026-12-20",
	});
	const fields = {
		[truongDeal.TEXT.key]: `Ghi ${b.ten}`,
		[truongDeal.URL.key]: "onehub.vn",
		[truongDeal.USER.key]: toi.id,
	};
	if (b.so !== null) fields[truongDeal.NUMBER.key] = b.so;
	if (b.ngay !== null) fields[truongDeal.DATE.key] = b.ngay;
	await tao("deals.update", { id: d.id, data: { fields } });
}
console.log("gieo ba thoa thuan, hai muoi truong tu tao qua API that");

function dapAn(theo, dir) {
	const co = BAN_GHI.filter((b) => b[theo] !== null).sort((a, b) => {
		const x = theo === "so" ? a.so - b.so : a.ngay.localeCompare(b.ngay);
		return dir === "asc" ? x : -x;
	});
	const trong = BAN_GHI.filter((b) => b[theo] === null).sort((a, b) =>
		a.ten.localeCompare(b.ten),
	);
	return [...co, ...trong].map((b) => b.ten);
}

mkdirSync(BANG_CHUNG, { recursive: true });
const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);
const host = new URL(APP).hostname;
const trang = await trinhDuyet.newPage();
await trang.setCookie(
	{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
	{ name: "lang", value: "vi", domain: host, path: "/" },
);

const sai = [];
let dung = 0;
function bao(dat, dongDung, dongSai) {
	if (dat) {
		dung += 1;
		console.log(dongDung);
	} else {
		sai.push(dongSai);
		console.log(dongSai);
	}
}

async function mo(duong, cho, rong, cao) {
	await trang.setViewport({ width: rong, height: cao });
	await trang.goto(`${APP}${duong}`, {
		waitUntil: "domcontentloaded",
		timeout: CHO_TAI,
	});
	const dich = new URL(trang.url()).pathname;
	if (dich.startsWith("/sign-in") || dich.includes("/onboarding"))
		await khongDo(`KHONG DO DUOC: ${duong} bi day ve ${dich}`);
	await trang
		.waitForFunction(
			(chu) => document.body.innerText.includes(chu),
			{ timeout: CHO_TAI },
			cho,
		)
		.catch(() => {});
	await new Promise((r) => setTimeout(r, DO.choHydrateMs));
}

function tenHang() {
	return trang.evaluate(
		(tienTo) =>
			[...document.querySelectorAll("tbody tr")]
				.map(
					(tr) =>
						(tr.textContent ?? "").match(
							new RegExp(`${tienTo} (Alpha|Beta|Gamma)`),
						)?.[0],
				)
				.filter(Boolean),
		TIEN_TO,
	);
}

const khoaSo = truongDeal.NUMBER.key;
await mo(
	`/${slug}/deals?q=${TIEN_TO}&sort=field:${khoaSo}&dir=asc`,
	`${TIEN_TO} Alpha`,
	DO.rong.lon,
	DO.cao.lon,
);
const ariaSort = await trang.evaluate(
	(n) =>
		document.querySelector(`th[title="${n}"]`)?.getAttribute("aria-sort") ??
		null,
	NHAN.NUMBER,
);
const thuTu = await tenHang();
await trang.screenshot({
	path: join(BANG_CHUNG, "smt-bang-thoa-thuan-sap-1280.png"),
});
bao(
	ariaSort === "ascending",
	"DUNG AC-9 1280: aria-sort ascending",
	`smt man: aria-sort ${ariaSort}`,
);
bao(
	thuTu.join(",") === dapAn("so", "asc").join(","),
	`DUNG AC-9 1280: thu tu ${thuTu.join(",")}`,
	`smt man: thu tu ${thuTu.join(",")}`,
);

for (const [ten, duong] of [
	["thoa-thuan", `/${slug}/deals?q=${TIEN_TO}`],
	["cong-ty", `/${slug}/companies?q=${TIEN_TO}`],
]) {
	await mo(duong, TIEN_TO, DO.rong.vua, DO.cao.lon);
	const hien = await trang.evaluate(
		(N) =>
			Object.fromEntries(
				Object.entries(N).map(([kieu, nhan]) => {
					const th = document.querySelector(`th[title="${nhan}"]`);
					return [kieu, th ? getComputedStyle(th).display : "vang"];
				}),
			),
		NHAN,
	);
	await trang.screenshot({ path: join(BANG_CHUNG, `smt-bang-${ten}-768.png`) });
	for (const [kieu, display] of Object.entries(hien)) {
		const mong = HIEN_O_768.has(kieu);
		bao(
			display !== "vang" && (display !== "none") === mong,
			`DUNG AC-9 768 ${ten} ${kieu}: ${display}`,
			`smt man: 768 ${kieu} ${display}`,
		);
	}
}

await mo(
	`/${slug}/deals?q=${TIEN_TO}`,
	`${TIEN_TO} Alpha`,
	DO.rong.hep,
	DO.cao.hep,
);
const daMoMenu = await trang.evaluate((chu) => {
	const nut = [...document.querySelectorAll("button")].find(
		(b) => (b.textContent ?? "").trim() === chu,
	);
	if (!nut) return false;
	for (const loai of ["pointerdown", "mousedown", "pointerup", "click"])
		nut.dispatchEvent(
			new PointerEvent(loai, {
				bubbles: true,
				cancelable: true,
				button: 0,
				pointerType: "mouse",
			}),
		);
	return true;
}, "Sắp xếp");
await new Promise((r) => setTimeout(r, DO.choMenuMs));
const mucMenu = await trang.evaluate(() =>
	[...document.querySelectorAll('[role="menuitemradio"]')].map((m) =>
		(m.textContent ?? "").trim(),
	),
);
await trang.screenshot({
	path: join(BANG_CHUNG, "smt-bang-thoa-thuan-375-menu.png"),
});
bao(daMoMenu, "DUNG AC-9 375: mo menu sap", "smt man: 375 khong thay nut sap");
for (const [kieu, nhan] of Object.entries(NHAN)) {
	if (kieu === "CHECKBOX") {
		bao(
			!mucMenu.includes(nhan),
			"DUNG AC-9 375: menu khong co o tich",
			"smt man: 375 menu thua o tich",
		);
	} else {
		bao(
			mucMenu.includes(nhan),
			`DUNG AC-9 375: menu co ${kieu}`,
			`smt man: 375 menu thieu ${kieu}`,
		);
	}
}
await trang.evaluate((nhan) => {
	const muc = [...document.querySelectorAll('[role="menuitemradio"]')].find(
		(m) => (m.textContent ?? "").trim() === nhan,
	);
	muc?.click();
}, NHAN.DATE);
await new Promise((r) => setTimeout(r, DO.choHydrateMs));
await trang.keyboard.press("Escape");
const urlSau = new URL(trang.url());
const dirSau = urlSau.searchParams.get("dir") ?? "desc";
bao(
	urlSau.searchParams.get("sort") === `field:${truongDeal.DATE.key}`,
	`DUNG AC-9 375: url ${urlSau.search}`,
	`smt man: 375 url ${urlSau.search}`,
);
const thuTu375 = await tenHang();
bao(
	thuTu375.join(",") === dapAn("ngay", dirSau).join(","),
	`DUNG AC-9 375: thu tu ${thuTu375.join(",")}`,
	`smt man: 375 thu tu ${thuTu375.join(",")}`,
);

for (const [rong, cao, anh] of [
	[DO.rong.lon, DO.cao.lon, "smt-kanban-1280.png"],
	[DO.rong.hep, DO.cao.hep, "smt-kanban-375.png"],
]) {
	await mo(
		`/${slug}/deals?q=${TIEN_TO}&view=board`,
		`${TIEN_TO} Alpha`,
		rong,
		cao,
	);
	const the = await trang.evaluate((tienTo) => {
		const doc_ = (ten) =>
			[...document.querySelectorAll("[data-open-deal]")].find((b) =>
				(b.textContent ?? "").includes(ten),
			)?.parentElement?.textContent ?? "";
		const d = document.documentElement;
		return {
			alpha: doc_(`${tienTo} Alpha`),
			beta: doc_(`${tienTo} Beta`),
			tran: d.scrollWidth - d.clientWidth,
		};
	}, TIEN_TO);
	await trang.screenshot({ path: join(BANG_CHUNG, anh) });
	if (rong === DO.rong.lon) {
		bao(
			the.alpha.includes(NHAN.NUMBER) &&
				the.alpha.includes("1.234,5") &&
				the.alpha.includes(NHAN.DATE),
			"DUNG AC-9 kanban: the Alpha co hai dong truong",
			`smt man: kanban alpha ${the.alpha}`,
		);
		bao(
			!the.beta.includes(NHAN.NUMBER),
			"DUNG AC-9 kanban: the Beta khong co dong So trong",
			`smt man: kanban beta ${the.beta}`,
		);
	} else {
		bao(
			the.tran <= 0,
			"DUNG AC-9 kanban 375: tran ngang 0",
			"smt man: 375 cuon ngang",
		);
	}
}

console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN AC-9: ${dung} DUNG, ${sai.length} SAI`);
console.log(sai.length === 0 ? "smt man: dat" : sai[0]);
await ket(sai.length === 0 ? 0 : 1);
