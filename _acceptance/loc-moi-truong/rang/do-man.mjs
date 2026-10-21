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
	const dat = process.env.BANG_CHUNG ?? "_acceptance/loc-moi-truong/evidence";
	return isAbsolute(dat) ? dat : join(GOC, dat);
})();
const DO = {
	choHydrateMs: 1500,
	choMenuMs: 600,
	choGhiMs: 900,
	rong: { lon: 1280, hep: 375 },
	cao: { lon: 900, hep: 812 },
};
const TIEN_TO = "lmtman";
const CHU = {
	loc: "Lọc",
	trong: "Trống",
	chua: "Chứa…",
	tu: "Từ",
	loiSo: "Ô này nhận số, ví dụ 1.234,5",
	moc: ["Đã qua", "Trong tháng này", "Tháng sau", "Muộn hơn", "Trống"],
	tich: ["Có", "Không"],
	bangXem: "Bảng xem",
	luuBangXem: "Lưu bảng xem này…",
	luu: "Lưu",
	hienTrongLoc: "Cho chọn làm bộ lọc ở bảng Thoả thuận",
	luuThayDoi: "Lưu thay đổi",
};

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
	TEXT: "Ghi chú lmt",
	LONG_TEXT: "Mô tả lmt",
	NUMBER: "Số căn lmt",
	DATE: "Ngày ký lmt",
	CHECKBOX: "Đã ký lmt",
	SELECT: "Hạng lmt",
	URL: "Trang lmt",
	EMAIL: "Thư lmt",
	PHONE: "Máy lmt",
	USER: "Người lmt",
};

const truong = {};
for (const [type, label] of Object.entries(NHAN)) {
	truong[type] = await tao("fields.create", {
		entity: "DEAL",
		label,
		type,
		options: type === "SELECT" ? [{ label: "Vàng" }, { label: "Bạc" }] : [],
		agentFilled: false,
		showOnSheet: true,
		showOnTable: true,
		showOnFilter: type !== "NUMBER",
	});
}

const nay = new Date();
const ngayThangNay = new Date(nay.getFullYear(), nay.getMonth(), 20)
	.toISOString()
	.slice(0, 10);
const congTy = await tao("companies.create", { name: `${TIEN_TO} Công ty` });
const BAN_GHI = [
	{ ten: "An", chu: "hop dong mau", so: 1500, ngay: ngayThangNay, tich: true },
	{ ten: "Binh", chu: null, so: 900, ngay: null, tich: false },
	{ ten: "Chi", chu: "hop dong lon", so: 2400, ngay: ngayThangNay, tich: true },
	{ ten: "Dung", chu: "khac", so: null, ngay: "2020-01-01", tich: null },
	{ ten: "Em", chu: null, so: 1234.5, ngay: ngayThangNay, tich: false },
	{
		ten: "Giang",
		chu: "hop dong nho",
		so: 3000,
		ngay: "2099-01-01",
		tich: true,
	},
];
for (const b of BAN_GHI) {
	const d = await tao("deals.create", {
		name: `${TIEN_TO} ${b.ten}`,
		companyId: congTy.id,
		ownerId: toi.id,
		amountCents: 5000000,
		currency: "VND",
	});
	const fields = { [truong.URL.key]: "onehub.vn", [truong.USER.key]: toi.id };
	if (b.chu !== null) fields[truong.TEXT.key] = b.chu;
	if (b.so !== null) fields[truong.NUMBER.key] = b.so;
	if (b.ngay !== null) fields[truong.DATE.key] = b.ngay;
	if (b.tich !== null) fields[truong.CHECKBOX.key] = b.tich;
	await tao("deals.update", { id: d.id, data: { fields } });
}
console.log("gieo sau thoa thuan, muoi truong tu tao qua API that");

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

const ngu = (ms) => new Promise((r) => setTimeout(r, ms));

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
	await ngu(DO.choHydrateMs);
}

async function timPhanTu(chu, chon) {
	const tay = await trang.evaluateHandle(
		(chu, chon) =>
			[...document.querySelectorAll(chon)].find((b) => {
				const r = b.getBoundingClientRect();
				return (
					r.width > 0 &&
					r.height > 0 &&
					(b.textContent ?? "").trim().startsWith(chu)
				);
			}) ?? null,
		chu,
		chon,
	);
	const el = tay.asElement();
	if (!el) {
		await tay.dispose();
		return null;
	}
	return el;
}

async function bam(
	chu,
	chon = "button, [role='menuitem'], [role='menuitemcheckbox']",
) {
	const el = await timPhanTu(chu, chon);
	if (!el) return false;
	await el.click();
	await ngu(DO.choMenuMs);
	return true;
}

async function moKhoiGap() {
	const gap = await timPhanTu(
		CHU.loc,
		"button[aria-expanded='false']:not([aria-haspopup])",
	);
	if (!gap) return;
	await gap.click();
	await ngu(DO.choMenuMs);
}

async function moMenuCon(nhan) {
	await trang.keyboard.press("Escape");
	await ngu(200);
	await moKhoiGap();
	if (!(await bam(CHU.loc, "button[aria-haspopup='menu']"))) return false;
	const muc = await timPhanTu(nhan, "[role='menuitem']");
	if (!muc) return false;
	await muc.hover();
	await ngu(DO.choMenuMs);
	const daMo = await trang.evaluate(
		(el) => el.getAttribute("data-state") === "open",
		muc,
	);
	if (!daMo) {
		await muc.focus();
		await trang.keyboard.press("ArrowRight");
		await ngu(DO.choMenuMs);
	}
	return true;
}

function soHang() {
	return trang.evaluate(
		(tienTo) =>
			[...document.querySelectorAll("tbody tr")].filter((tr) =>
				(tr.textContent ?? "").includes(tienTo),
			).length,
		TIEN_TO,
	);
}

async function goVao(nhanO, chu) {
	const o = await trang.$(`input[aria-label="${nhanO}"]`);
	if (!o) return false;
	await o.focus();
	await o.evaluate((el) => el.select());
	await trang.keyboard.type(chu, { delay: 20 });
	await ngu(DO.choGhiMs);
	return true;
}

function mucMenuCon() {
	return trang.evaluate(() =>
		[
			...document.querySelectorAll("[role='menu'] [role='menuitemcheckbox']"),
		].map((m) => ({
			chu: (m.textContent ?? "").trim(),
			dem: m.querySelector("[data-slot='facet-count']")?.textContent ?? null,
		})),
	);
}

const tong = (dk) => BAN_GHI.filter(dk).length;
const goc = `/${slug}/deals?q=${TIEN_TO}`;

await mo(
	`/${slug}/settings/fields?thucThe=deal&truong=${truong.NUMBER.key}`,
	NHAN.NUMBER,
	DO.rong.lon,
	DO.cao.lon,
);
const daBat = await trang.evaluate((nhan) => {
	const label = [...document.querySelectorAll("label")].find((l) =>
		(l.textContent ?? "").includes(nhan),
	);
	const o = label?.querySelector("[role='checkbox']");
	if (!o) return false;
	o.click();
	return true;
}, CHU.hienTrongLoc);
if (!daBat) {
	sai.push("lmt man: cai dat thieu o");
	console.log("lmt man: cai dat thieu o");
} else {
	await ngu(300);
	await bam(CHU.luuThayDoi, "button");
	await ngu(DO.choHydrateMs);
	const sau = await db.fieldDefinition.findUnique({
		where: { id: truong.NUMBER.id },
		select: { showOnFilter: true },
	});
	bao(
		sau?.showOnFilter === true,
		"DUNG AC-10: bat Hien trong bo loc cho truong So qua man Cai dat",
		"lmt man: cai dat khong luu",
	);
}

await mo(goc, `${TIEN_TO} An`, DO.rong.lon, DO.cao.lon);
await moMenuCon(NHAN.TEXT);
const mucChu = await mucMenuCon();
await trang.screenshot({ path: join(BANG_CHUNG, "lmt-menu-chu-1280.png") });
const trongChu = mucChu.find((m) => m.chu.startsWith(CHU.trong));
bao(
	trongChu?.dem === String(tong((b) => b.chu === null)),
	`DUNG AC-10 0: Trong co so dem ${trongChu?.dem}`,
	`lmt man: chu trong ${JSON.stringify(trongChu)}`,
);
const goChu = await goVao(`${NHAN.TEXT} chứa`, "hop dong");
const urlChu = new URL(trang.url());
bao(
	goChu &&
		urlChu.searchParams.get(`field:${truong.TEXT.key}`) === "has:hop dong",
	`DUNG AC-10 0: url ${urlChu.search}`,
	`lmt man: chu url ${urlChu.search}`,
);
await ngu(DO.choHydrateMs);
const hangChu = await soHang();
bao(
	hangChu === tong((b) => (b.chu ?? "").includes("hop dong")),
	`DUNG AC-10 0: ${hangChu} hang`,
	`lmt man: chu hang ${hangChu}`,
);

await mo(goc, `${TIEN_TO} An`, DO.rong.lon, DO.cao.lon);
await moMenuCon(NHAN.NUMBER);
const goSo = await goVao(`${CHU.tu} ${NHAN.NUMBER}`, "1.234,5");
await trang.screenshot({ path: join(BANG_CHUNG, "lmt-menu-khoang-1280.png") });
const urlSo = new URL(trang.url());
bao(
	goSo && urlSo.searchParams.get(`field:${truong.NUMBER.key}`) === "gte:1234.5",
	`DUNG AC-10 1: url ${urlSo.search}`,
	`lmt man: khoang url ${urlSo.search}`,
);

const truocSai = new URL(trang.url()).search;
await goVao(`${CHU.tu} ${NHAN.NUMBER}`, "abc");
const coLoi = await trang.evaluate(
	(chu) => document.body.innerText.includes(chu),
	CHU.loiSo,
);
await trang.screenshot({ path: join(BANG_CHUNG, "lmt-so-sai-1280.png") });
bao(coLoi, "DUNG AC-10 2: co dong loi so", "lmt man: so sai thieu loi");
bao(
	new URL(trang.url()).search === truocSai,
	"DUNG AC-10 2: duong dan khong doi",
	"lmt man: so sai doi url",
);

await mo(goc, `${TIEN_TO} An`, DO.rong.hep, DO.cao.hep);
await moMenuCon(NHAN.DATE);
const mucMoc = (await mucMenuCon()).map((m) => m.chu);
await trang.screenshot({ path: join(BANG_CHUNG, "lmt-menu-moc-375.png") });
for (const nhan of CHU.moc) {
	bao(
		mucMoc.some((m) => m.startsWith(nhan)),
		`DUNG AC-10 3: moc ${nhan}`,
		`lmt man: moc thieu ${nhan}`,
	);
}
await moMenuCon(NHAN.CHECKBOX);
const mucTich = (await mucMenuCon()).map((m) => m.chu);
for (const nhan of CHU.tich) {
	bao(
		mucTich.some((m) => m.startsWith(nhan)),
		`DUNG AC-10 3: o tich ${nhan}`,
		`lmt man: moc thieu ${nhan}`,
	);
}
const tran = await trang.evaluate(
	() => document.documentElement.scrollWidth - window.innerWidth,
);
bao(tran <= 0, "DUNG AC-10 3: 375 khong cuon ngang", "lmt man: 375 cuon ngang");

const bonBoLoc = [
	`field:${truong.TEXT.key}=has:hop dong`,
	`field:${truong.NUMBER.key}=gte:1000`,
	`field:${truong.DATE.key}=this-month`,
	`field:${truong.CHECKBOX.key}=yes`,
]
	.map((x) => x.replace(" ", "%20"))
	.join("&");
await mo(`${goc}&${bonBoLoc}`, TIEN_TO, DO.rong.lon, DO.cao.lon);
await trang.keyboard.press("Escape");
const nutLoc = await trang.evaluate(
	(chu) =>
		[...document.querySelectorAll("button")]
			.map((b) => (b.textContent ?? "").trim())
			.find((t) => t.startsWith(chu)) ?? "",
	CHU.loc,
);
const hangBon = await soHang();
await trang.screenshot({ path: join(BANG_CHUNG, "lmt-dang-bat-1280.png") });
const mongBon = tong(
	(b) =>
		(b.chu ?? "").includes("hop dong") &&
		(b.so ?? -1) >= 1000 &&
		b.ngay === ngayThangNay &&
		b.tich === true,
);
bao(
	nutLoc.includes("(4)"),
	`DUNG AC-10 4: nut ${nutLoc}`,
	`lmt man: dang bat nut ${nutLoc}`,
);
bao(
	hangBon === mongBon,
	`DUNG AC-10 4: ${hangBon} hang`,
	`lmt man: dang bat hang ${hangBon}`,
);

await trang.setViewport({ width: DO.rong.hep, height: DO.cao.hep });
await ngu(DO.choMenuMs);
const urlLuu = new URL(trang.url());
await moKhoiGap();
await bam(CHU.bangXem, "button[aria-haspopup='menu']");
await bam(CHU.luuBangXem, "[role='menuitem']");
const oTen = await trang.$("#saved-view-name");
if (oTen) {
	await oTen.type("Lmt thử", { delay: 20 });
	await bam(CHU.luu, "[role='dialog'] button");
	await ngu(DO.choHydrateMs);
}
await mo(goc, `${TIEN_TO} An`, DO.rong.hep, DO.cao.hep);
await moKhoiGap();
await bam(CHU.bangXem, "button[aria-haspopup='menu']");
await bam("Lmt thử", "[role='menuitem']");
await ngu(DO.choHydrateMs);
await trang.screenshot({ path: join(BANG_CHUNG, "lmt-luu-375.png") });
const urlAp = new URL(trang.url());
const khoaLoc = (u) =>
	[...u.searchParams.entries()]
		.filter(([k]) => k.startsWith("field:"))
		.map(([k, v]) => `${k}=${v}`)
		.sort()
		.join("&");
bao(
	!!oTen && khoaLoc(urlAp) === khoaLoc(urlLuu),
	`DUNG AC-10 5: ap lai ${urlAp.search}`,
	`lmt man: ap lai ${urlAp.search}`,
);

console.log(`anh: ${BANG_CHUNG}`);
console.log(`KET LUAN AC-10: ${dung} DUNG, ${sai.length} SAI`);
console.log(sai.length === 0 ? "lmt man: dat" : sai[0]);
await ket(sai.length === 0 ? 0 : 1);
