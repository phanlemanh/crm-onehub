import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { MUC_CAI_DAT } from "../../../apps/app/lib/cai-dat-dieu-huong.ts";
import { okrMessages } from "../../../apps/app/lib/messages/okr.ts";
import { settingsMessages } from "../../../apps/app/lib/messages/settings.ts";
import { db } from "../../../packages/db/src/index.ts";
import { WORKSPACE_ID } from "../../../packages/db/src/workspace.ts";
import { canhCay } from "../../man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs";
import {
	API,
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
const RUNS = join(GOC, ".acceptance-runs", "okr-soat-anh-luot-3");
const NHAN = process.env.NHAN ?? "sau";
const BANG_CHUNG = process.env.BANG_CHUNG ?? join(RUNS, "evidence", NHAN);
const SO_GIEO = join(RUNS, "so-gieo.json");
const RONG = 1440;
const CAO = 900;
const HEP = 390;
const CAO_HEP = 844;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const LECH = 1;
const MA = `o${Date.now().toString(36).slice(-6)}`;
const EMAIL = `osa-lan-do-${MA}@thu.test`;

const mOkr = okrMessages("vi");
const mCaiDat = settingsMessages("vi");
const COT = Object.values(mOkr.nhap.cot);

const homNay = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
const NAM = Number(homNay.slice(0, 4));
const QUY = Math.ceil(Number(homNay.slice(5, 7)) / 3);
const QUY_KE = QUY === 4 ? 1 : QUY + 1;
const NAM_QUY_KE = QUY === 4 ? NAM + 1 : NAM;
const QUY_KHAC = (QUY % 4) + 1;
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const KY = {
	nam: `Năm ${NAM}`,
	quy: `Quý ${QUY}/${NAM}`,
	luotDo: `Lượt đo ${MA}`,
};

const DAI_MT =
	"Mở rộng mạng lưới đối tác ở các tỉnh phía Bắc để mỗi tỉnh có ít nhất một đối tác vận hành ổn định trước khi hết quý này";
const DAI_KR =
	"Số đối tác mới ở các tỉnh phía Bắc đã ký thoả thuận, đã bàn giao hồ sơ và đã có đơn hàng đầu tiên trong vòng ba mươi ngày";
const MT_B = "Nâng chất lượng hồ sơ đối tác";
const EMAIL_LA = `khong-co-lan-do-${MA}@thu.test`;
const LO = [
	[DAI_MT, DAI_KR, "tăng tới", "0", "12", "đối tác", EMAIL],
	[DAI_MT, "Đối tác mới ở Hải Phòng", "tăng tới", "0", "6", "đối tác", EMAIL],
	[MT_B, "Hồ sơ đủ giấy tờ", "phần trăm", "40", "90", "%", EMAIL],
	[MT_B, "Hồ sơ duyệt trong ngày", "tăng vọt", "0", "10", "hồ sơ", EMAIL],
	[MT_B, "Hồ sơ có người kèm", "tăng tới", "0", "20", "hồ sơ", EMAIL_LA],
];
const chuLo = LO.map((d) => d.join("\t")).join("\n");

const ANH = [
	"nhap-1440.png",
	"nhap-390.png",
	"caidat-okr-1440.png",
	"caidat-okr-390.png",
	"chon-chu-ky-1440.png",
	"chon-chu-ky-390.png",
	"mo-chu-ky-1440.png",
	"mo-chu-ky-390.png",
];

const MA_TRAN = [
	...COT.map((_, i) => `nhap-1440-cot-${i + 1}`),
	"nhap-1440-vo-khong-tran",
	"nhap-1440-email-dong-5",
	"nhap-1440-cot-dai-xuong-dong",
	"nhap-hong-danh-sach",
	...LO.map((_, i) => `nhap-hong-hang-${i + 1}`),
	"nhap-hong-danh-sach-con",
	"nhap-390-hop-trong-man",
	"nhap-390-vo-cuon",
	...MUC_CAI_DAT.map((m) => `caidat-390-${m.khoa}`),
	"caidat-390-bam-the",
	"chuky-o-chon",
	"chuky-muc-nam",
	"chuky-muc-luot-do",
	"goiy-nam",
	"goiy-quy",
	...ANH.map((a) => `anh-${a}`),
	"don-chu-ky",
	"don-nguoi",
	"don-cau-hinh",
];

const ketQua = new Map();
function ghi(ma, dat, cau) {
	if (!MA_TRAN.includes(ma)) throw new Error(`ma ngoai MA_TRAN: ${ma}`);
	ketQua.set(ma, dat && (ketQua.get(ma) ?? true));
	console.log(`${dat ? "DUNG" : "SAI"} ${ma}: ${cau}`);
}

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

function docSoGieo() {
	if (!existsSync(SO_GIEO)) return null;
	return JSON.parse(readFileSync(SO_GIEO, "utf8"));
}

function ghiSoGieo(so) {
	mkdirSync(RUNS, { recursive: true });
	writeFileSync(SO_GIEO, `${JSON.stringify(so, null, 2)}\n`);
}

async function donTheoSo(so) {
	const nguoi = (
		await db.user.findMany({
			where: { email: { in: so.nguoi } },
			select: { id: true },
		})
	).map((n) => n.id);
	const moiMt = (
		await db.okrObjective.findMany({
			where: { cycleId: { in: so.chuKy } },
			select: { id: true },
		})
	).map((o) => o.id);
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: so.chuKy } },
				{ objectiveId: { in: moiMt } },
				{ actorUserId: { in: nguoi } },
			],
		},
	});
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrKeyResult.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: moiMt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: so.chuKy }, kind: "quy" } });
	await db.okrCycle.deleteMany({ where: { id: { in: so.chuKy } } });
	await db.okrProgramConfig.deleteMany({
		where: { version: { gt: so.phienBan } },
	});
	await db.orgPlacement.deleteMany({ where: { userId: { in: nguoi } } });
	await db.session.deleteMany({ where: { userId: { in: nguoi } } });
	await db.member.deleteMany({ where: { userId: { in: nguoi } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
}

const tanDu = docSoGieo();
if (tanDu !== null) {
	console.log(
		`GHI CHU don tan du ${tanDu.chuKy.length} chu ky, ${tanDu.nguoi.length} nguoi cua luot truoc (so gieo ${SO_GIEO})`,
	);
	await donTheoSo(tanDu);
	rmSync(SO_GIEO, { force: true });
}

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR khong phai cua ban do.`,
		"    Do-man can kho khong co chu ky nao de gieo nam/quy hien tai khong chong ngay.",
	);
const phienBanSan =
	(await db.okrProgramConfig.aggregate({ _max: { version: true } }))._max
		.version ?? 0;

const so = { nguoi: [EMAIL], chuKy: [], phienBan: phienBanSan };
ghiSoGieo(so);

let huaDon = null;
function donDep() {
	huaDon ??= donTheoSo(so).then(() => rmSync(SO_GIEO, { force: true }));
	return huaDon;
}

let trinhDuyet = null;
let maTinHieu = null;
for (const [tinHieu, maThoat] of [
	["SIGTERM", 143],
	["SIGINT", 130],
]) {
	process.on(tinHieu, async () => {
		maTinHieu = maThoat;
		console.log(`GHI CHU nhan ${tinHieu} — don roi thoat ${maThoat}`);
		await trinhDuyet?.close().catch(() => {});
		await donDep().catch((e) => console.log(`don dep hong: ${e.message}`));
		process.exit(maThoat);
	});
}

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

const cookie = phienCua(EMAIL);
const nguoi = await db.user.update({
	where: { email: EMAIL },
	data: { name: "Người đo thử" },
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
		role: "admin",
		createdAt: new Date(),
	},
	update: { role: "admin" },
});
await db.session.updateMany({
	where: { userId: nguoi.id },
	data: { activeOrganizationId: WORKSPACE_ID },
});
const slug = await suySlug(cookie);

function mu() {
	return { Cookie: `${cookie.ten}=${cookie.gia}; lang=vi` };
}

async function lam(duong, vao) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		redirect: "manual",
		headers: { ...mu(), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function hoi(duong) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		redirect: "manual",
		headers: mu(),
	});
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function taoChuKy(vao) {
	await lam("okr.createCycle", vao);
	const id = (await hoi("okr.cycles")).cycles.find((x) => x.name === vao.name)
		.id;
	so.chuKy.push(id);
	ghiSoGieo(so);
	return id;
}

const OKR = {};
async function gieo() {
	const chuKy = (kind, name, parentId, q) => ({
		kind,
		name,
		parentId,
		startsOn: q ? ngay(NAM, q * 3 - 2, 1) : ngay(NAM, 1, 1),
		endsOn: q ? ngay(NAM, q * 3, cuoiThang(NAM, q * 3)) : ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	OKR.nam = await taoChuKy(chuKy("nam", KY.nam, null, 0));
	OKR.quy = await taoChuKy(chuKy("quy", KY.quy, OKR.nam, QUY));
	OKR.luotDo = await taoChuKy(chuKy("quy", KY.luotDo, OKR.nam, QUY_KHAC));
	await lam("okr.setCyclePhase", { id: OKR.quy, phase: "dang-chay" });
	if (process.env.OSA_PHA_SAU_GIEO === "1")
		throw new Error("OSA_PHA_SAU_GIEO=1 — pha thu ngay sau gieo");
}

const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function moTrang(rong, cao, duong) {
	const trang = await trinhDuyet.newPage();
	await trang.setViewport({ width: rong, height: cao });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: cookie.ten, value: cookie.gia, domain: host, path: "/" },
		{ name: "lang", value: "vi", domain: host, path: "/" },
	);
	await trang.goto(`${APP}/${slug}${duong}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO })
		.catch(() => null);
	await cho(CHO_HYDRATE_MS);
	return trang;
}

async function doi(trang, fn, ...doiSo) {
	return trang
		.waitForFunction(fn, { timeout: CHO, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
}

const hien = (trang, sel) =>
	doi(
		trang,
		(s) => {
			const e = document.querySelector(s);
			if (!e) return false;
			const r = e.getBoundingClientRect();
			return r.width > 0 && r.height > 0;
		},
		sel,
	);

async function chup(trang, ten) {
	await trang.mouse.move(0, 0);
	await trang.evaluate(() => {
		for (const e of document.querySelectorAll(
			"nextjs-portal, .tsqd-parent-container, .tsqd-open-btn-container",
		))
			e.remove();
	});
	await cho(250);
	await trang.screenshot({ path: join(BANG_CHUNG, ten) });
	ghi(`anh-${ten}`, existsSync(join(BANG_CHUNG, ten)), join(BANG_CHUNG, ten));
}

async function danLo(trang) {
	const o = "[data-hop-thoai-nhap-okr] textarea";
	await trang.$eval(o, (e) => {
		e.focus();
		e.select();
	});
	await trang.keyboard.sendCharacter(chuLo);
	await cho(200);
	await trang.click("[data-nut='xem-truoc']");
	return hien(trang, "[data-buoc-nhap='2']");
}

async function buocNhap() {
	const t = await moTrang(
		RONG,
		CAO,
		`/okr/theo-don-vi?donOkr=goc&kyOkr=${OKR.quy}`,
	);
	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	const MUC_NHAP = "[role='menuitem'][data-nut='nhap-bang-tinh']";
	let coNut = await hien(t, "[data-nut='them-cach']");
	if (coNut) {
		await t.$eval("[data-nut='them-cach']", (e) =>
			e.dispatchEvent(
				new PointerEvent("pointerdown", {
					bubbles: true,
					cancelable: true,
					button: 0,
					isPrimary: true,
					pointerType: "mouse",
				}),
			),
		);
		coNut =
			(await hien(t, MUC_NHAP)) &&
			(await t.$eval(MUC_NHAP, (e) => !e.hasAttribute("data-disabled")));
	}
	if (!coNut) {
		for (const ma of MA_TRAN.filter((m) => m.startsWith("nhap-")))
			ghi(ma, false, "khong thay nut «Nhập từ bảng tính» o don vi OneHub");
		await t.close();
		return;
	}
	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	await t.$eval(MUC_NHAP, (e) => e.click());
	await hien(t, "[data-buoc-nhap='1']");
	if (!(await danLo(t))) {
		for (const ma of MA_TRAN.filter((m) => m.startsWith("nhap-")))
			ghi(ma, false, "khong toi buoc Xem truoc");
		await t.close();
		return;
	}
	await t.mouse.move(0, 0);
	await cho(300);

	const do1440 = await t.evaluate(
		(cot, emailLa) => {
			const hop = document.querySelector("[data-hop-thoai-nhap-okr]");
			const vo = hop?.querySelector("[data-slot='table-container']");
			if (!vo) return null;
			vo.scrollLeft = 0;
			const v = vo.getBoundingClientRect();
			const th = [...vo.querySelectorAll("thead th")].map((e) => {
				const r = e.getBoundingClientRect();
				return {
					chu: e.textContent.trim(),
					l: Math.round(r.left),
					r: Math.round(r.right),
					cat: e.scrollWidth > e.clientWidth,
				};
			});
			const hang = [...vo.querySelectorAll("tbody tr")];
			const dong = (n) =>
				hang.find((h) => h.querySelector("td")?.textContent.trim() === String(n));
			const o5 = dong(5)?.querySelectorAll("td")[7];
			const r5 = o5?.getBoundingClientRect();
			const o1 = dong(1)?.querySelectorAll("td")[1];
			const s1 = o1 ? getComputedStyle(o1) : null;
			const lh = s1
				? s1.lineHeight === "normal"
					? parseFloat(s1.fontSize) * 1.2
					: parseFloat(s1.lineHeight)
				: 0;
			return {
				vl: Math.round(v.left),
				vr: Math.round(v.right),
				tran: vo.scrollWidth - vo.clientWidth,
				th,
				cot,
				email: o5
					? {
							chu: o5.textContent.trim(),
							trong: r5.left >= v.left - 1 && r5.right <= v.right + 1,
							cat:
								o5.scrollWidth > o5.clientWidth ||
								getComputedStyle(o5).textOverflow === "ellipsis" ||
								[...o5.querySelectorAll("*")].some(
									(c) =>
										getComputedStyle(c).textOverflow === "ellipsis" &&
										c.scrollWidth > c.clientWidth,
								),
							canCo: emailLa,
						}
					: null,
				dai: o1
					? {
							cao:
								o1.getBoundingClientRect().height -
								parseFloat(s1.paddingTop) -
								parseFloat(s1.paddingBottom),
							lh,
						}
					: null,
			};
		},
		COT,
		EMAIL_LA,
	);
	if (do1440 === null) {
		for (const ma of MA_TRAN.filter((m) => m.startsWith("nhap-")))
			ghi(ma, false, "khong thay vo bang trong hop nhap");
		await t.close();
		return;
	}
	COT.forEach((chu, i) => {
		const th = do1440.th[i];
		const dat =
			th !== undefined &&
			th.chu === chu &&
			th.l >= do1440.vl - LECH &&
			th.r <= do1440.vr + LECH &&
			!th.cat;
		ghi(
			`nhap-1440-cot-${i + 1}`,
			dat,
			th
				? `«${th.chu}» (can «${chu}») trai ${th.l} >= ${do1440.vl}, phai ${th.r} <= ${do1440.vr}, chu ${th.cat ? "bi cat" : "khong cat"}`
				: `thieu tieu de «${chu}»`,
		);
	});
	ghi(
		"nhap-1440-vo-khong-tran",
		do1440.tran <= LECH,
		`vo bang tran ngang ${do1440.tran}px`,
	);
	ghi(
		"nhap-1440-email-dong-5",
		do1440.email !== null &&
			do1440.email.trong &&
			!do1440.email.cat &&
			do1440.email.chu === EMAIL_LA,
		do1440.email
			? `«${do1440.email.chu}» trong vo ${do1440.email.trong}, cat chu ${do1440.email.cat}`
			: "khong thay o email cua dong 5",
	);
	ghi(
		"nhap-1440-cot-dai-xuong-dong",
		do1440.dai !== null &&
			do1440.dai.cao > 1.5 * do1440.dai.lh &&
			do1440.tran <= LECH,
		do1440.dai
			? `o Muc tieu dong 1 cao ${Math.round(do1440.dai.cao)}px, line-height ${Math.round(do1440.dai.lh)}px, vo tran ${do1440.tran}px`
			: "khong thay o Muc tieu dong 1",
	);

	const hong = await t.evaluate(
		(chuHong, chuHopLe) => {
			const hop = document.querySelector("[data-hop-thoai-nhap-okr]");
			const ds = [...hop.querySelectorAll("[data-dong-hong]")].map((e) =>
				Number(e.textContent.match(/Dòng\s+(\d+)/)?.[1]),
			);
			const vo = hop.querySelector("[data-slot='table-container']");
			const v = vo.getBoundingClientRect();
			const mau = document.createElement("div");
			mau.className = "bg-destructive";
			document.body.append(mau);
			const phaHuy = getComputedStyle(mau).backgroundColor;
			mau.remove();
			const hang = [...vo.querySelectorAll("tbody tr")].map((h) => {
				const n = Number(h.querySelector("td")?.textContent.trim());
				const vach = getComputedStyle(h.querySelector("td"), "::before");
				const cham = (tone) =>
					[
						...h.querySelectorAll(
							`[data-slot='status-indicator'][data-tone='${tone}']`,
						),
					].map((e) => {
						const r = e.getBoundingClientRect();
						return {
							chu: e.textContent.trim(),
							trong: r.left >= v.left - 1 && r.right <= v.right + 1,
						};
					});
				return {
					n,
					vachMau: vach.backgroundColor,
					vachRong: parseFloat(vach.width) || 0,
					vachMo: vach.opacity,
					loi: cham("error"),
					tot: cham("success"),
				};
			});
			return { ds, phaHuy, hang, chuHong, chuHopLe };
		},
		mOkr.nhap.hong,
		mOkr.nhap.hopLe,
	);
	const dsHong = hong.ds.filter((n) => Number.isFinite(n));
	ghi(
		"nhap-hong-danh-sach",
		JSON.stringify(dsHong) === "[4,5]",
		`dong trong danh sach cau loi ${JSON.stringify(dsHong)}`,
	);
	LO.forEach((_, i) => {
		const n = i + 1;
		const h = hong.hang.find((x) => x.n === n);
		const laHong = dsHong.includes(n);
		let dat = false;
		let cau = `khong thay hang dong ${n}`;
		if (h) {
			const vachDo =
				h.vachMau === hong.phaHuy && h.vachRong >= 2 && h.vachMo === "1";
			if (laHong) {
				dat =
					vachDo &&
					h.loi.some((c) => c.trong && c.chu.includes(hong.chuHong)) &&
					h.tot.length === 0;
			} else {
				dat =
					h.vachMau !== hong.phaHuy &&
					h.loi.length === 0 &&
					h.tot.some((c) => c.chu.includes(hong.chuHopLe));
			}
			cau = `${laHong ? "hong" : "hop le"}: vach ${h.vachMau} rong ${h.vachRong} mo ${h.vachMo} (pha huy ${hong.phaHuy}), cham loi ${JSON.stringify(h.loi)}, cham tot ${JSON.stringify(h.tot)}`;
		}
		ghi(`nhap-hong-hang-${n}`, dat, cau);
	});
	ghi(
		"nhap-hong-danh-sach-con",
		hong.ds.length === 2,
		`danh sach cau loi con ${hong.ds.length} cau`,
	);
	await chup(t, "nhap-1440.png");

	await t.setViewport({ width: HEP, height: CAO_HEP });
	await cho(700);
	const do390 = await t.evaluate(() => {
		const hop = document.querySelector("[data-slot='dialog-content']");
		const vo = hop?.querySelector("[data-slot='table-container']");
		const r = hop?.getBoundingClientRect();
		return {
			hop: r
				? {
						l: Math.round(r.left),
						r: Math.round(r.right),
					}
				: null,
			rong: window.innerWidth,
			trang: document.documentElement.scrollWidth,
			vo: vo ? { sw: vo.scrollWidth, cw: vo.clientWidth } : null,
		};
	});
	ghi(
		"nhap-390-hop-trong-man",
		do390.hop !== null &&
			do390.hop.l >= 0 &&
			do390.hop.r <= do390.rong &&
			do390.trang <= do390.rong,
		`hop ${JSON.stringify(do390.hop)} trong 0..${do390.rong}, trang rong ${do390.trang}`,
	);
	ghi(
		"nhap-390-vo-cuon",
		do390.vo !== null && do390.vo.sw > do390.vo.cw,
		`vo bang scrollWidth ${do390.vo?.sw} > clientWidth ${do390.vo?.cw}`,
	);
	await chup(t, "nhap-390.png");
	await t.close();
}

async function doThe(trang) {
	return trang.evaluate(() => {
		const nav = [...document.querySelectorAll("nav")].find(
			(n) => !n.closest("aside") && n.offsetParent !== null && n.querySelector("[aria-current='page']"),
		);
		const the = nav?.querySelector("[aria-current='page']");
		if (!nav || !the) return null;
		const k = nav.getBoundingClientRect();
		const r = the.getBoundingClientRect();
		return {
			chu: the.textContent.trim(),
			l: Math.round(r.left),
			r: Math.round(r.right),
			nl: Math.round(k.left),
			nr: Math.round(k.right),
			y: window.scrollY,
			tran: document.documentElement.scrollWidth - window.innerWidth,
			cuon: nav.scrollLeft,
		};
	});
}

function ghiThe(ma, nhan, d) {
	ghi(
		ma,
		d !== null &&
			d.chu === nhan &&
			d.l >= d.nl - LECH &&
			d.r <= d.nr + LECH &&
			d.y === 0 &&
			d.tran <= 0,
		d
			? `the «${d.chu}» (can «${nhan}») trai ${d.l} >= ${d.nl}, phai ${d.r} <= ${d.nr}, scrollY ${d.y}, tran ${d.tran}px`
			: `khong thay the dang mo cua «${nhan}» trong hang the ngang`,
	);
}

async function buocCaiDat() {
	for (const muc of MUC_CAI_DAT) {
		const nhan = mCaiDat.thanhBen[muc.khoa];
		const t = await moTrang(HEP, CAO_HEP, muc.href);
		await doi(t, () =>
			[...document.querySelectorAll("nav")].some(
				(n) => !n.closest("aside") && n.querySelector("[aria-current='page']"),
			),
		);
		await cho(300);
		ghiThe(`caidat-390-${muc.khoa}`, nhan, await doThe(t));
		if (muc.khoa === "chuongTrinhOkr") await chup(t, "caidat-okr-390.png");
		await t.close();
	}

	const okr = MUC_CAI_DAT.find((m) => m.khoa === "chuongTrinhOkr");
	const t = await moTrang(HEP, CAO_HEP, "/settings");
	const bam = await t.evaluate((duoi) => {
		const nav = [...document.querySelectorAll("nav")].find(
			(n) => !n.closest("aside") && n.offsetParent !== null,
		);
		const a = [...(nav?.querySelectorAll("a") ?? [])].find((x) =>
			x.getAttribute("href")?.endsWith(duoi),
		);
		if (!a) return false;
		a.click();
		return true;
	}, okr.href);
	if (!bam) {
		ghi("caidat-390-bam-the", false, "khong thay the «Chương trình OKR» tren hang the");
	} else {
		await doi(t, (duoi) => location.pathname.endsWith(duoi), okr.href);
		await doi(t, () =>
			[...document.querySelectorAll("nav")].some(
				(n) =>
					!n.closest("aside") &&
					n.querySelector("[aria-current='page']")?.getAttribute("href")?.endsWith("/settings/okr"),
			),
		);
		let truoc = -1;
		for (let lan = 0; lan < 20; lan += 1) {
			await cho(100);
			const d = await doThe(t);
			if (d && d.cuon === truoc) break;
			truoc = d?.cuon ?? -1;
		}
		ghiThe("caidat-390-bam-the", mCaiDat.thanhBen.chuongTrinhOkr, await doThe(t));
	}
	await t.close();

	const r = await moTrang(RONG, CAO, okr.href);
	await chup(r, "caidat-okr-1440.png");
	await r.close();
}

async function buocChuKy() {
	for (const [rong, cao, ten] of [
		[RONG, CAO, "chon-chu-ky-1440.png"],
		[HEP, CAO_HEP, "chon-chu-ky-390.png"],
	]) {
		const t = await moTrang(rong, cao, `/okr/theo-don-vi?kyOkr=${OKR.quy}`);
		const coO = await hien(t, "[data-chon-chu-ky]");
		if (rong === RONG) {
			const chu = coO
				? await t.$eval("[data-chon-chu-ky]", (e) =>
						e.textContent.replace(/\s+/g, " ").trim(),
					)
				: "";
			ghi("chuky-o-chon", chu === KY.quy, `o chon «${chu}» (can «${KY.quy}»)`);
		}
		if (coO) {
			await t.click("[data-chon-chu-ky]");
			await doi(t, () => document.querySelectorAll("[role='option']").length > 0);
			await cho(300);
		}
		if (rong === RONG) {
			const muc = await t.evaluate(() =>
				[...document.querySelectorAll("[role='option']")].map((o) =>
					o.textContent.replace(/\s+/g, " ").trim(),
				),
			);
			const nam = muc.find((x) => x.startsWith(KY.nam)) ?? "";
			ghi(
				"chuky-muc-nam",
				nam !== "" && (nam.match(/năm/gi) ?? []).length === 1,
				`muc nam «${nam}»`,
			);
			const luot = muc.find((x) => x.startsWith(KY.luotDo)) ?? "";
			ghi(
				"chuky-muc-luot-do",
				luot.includes(mOkr.loaiChuKy.quy),
				`muc «${luot}» (can kem «${mOkr.loaiChuKy.quy}»)`,
			);
		}
		await chup(t, ten);
		await t.close();
	}
}

async function buocGoiY() {
	const t = await moTrang(RONG, CAO, "/settings/okr?moChuKy=true");
	const coO = await hien(t, "[data-sheet-mo-chu-ky] [data-o-ten]");
	const goiY = () =>
		t.$eval("[data-sheet-mo-chu-ky] [data-o-ten]", (e) => e.placeholder);
	const canNam = `Năm ${NAM}`;
	const chuNam = coO ? await goiY() : "";
	ghi("goiy-nam", chuNam === canNam, `placeholder «${chuNam}» (can «${canNam}»)`);
	await chup(t, "mo-chu-ky-1440.png");
	const canQuy = `Quý ${QUY_KE}/${NAM_QUY_KE}`;
	let chuQuy = "";
	if (coO) {
		await t.click("[data-sheet-mo-chu-ky] [role='combobox']");
		await doi(t, () => document.querySelectorAll("[role='option']").length > 0);
		const chon = await t.evaluateHandle(
			(c) =>
				[...document.querySelectorAll("[role='option']")].find(
					(o) => o.textContent.trim() === c,
				) ?? null,
			mOkr.loaiChuKy.quy,
		);
		if (chon.asElement()) {
			await chon.asElement().click();
			await cho(300);
			chuQuy = await goiY();
		}
	}
	ghi("goiy-quy", chuQuy === canQuy, `placeholder «${chuQuy}» (can «${canQuy}»)`);
	await t.close();
	const h = await moTrang(HEP, CAO_HEP, "/settings/okr?moChuKy=true");
	await hien(h, "[data-sheet-mo-chu-ky] [data-o-ten]");
	await chup(h, "mo-chu-ky-390.png");
	await h.close();
}

let loiGieo = null;
try {
	try {
		await gieo();
	} catch (e) {
		loiGieo = e;
	}
	if (loiGieo === null) {
		trinhDuyet = await puppeteer.launch({
			executablePath: CHROME,
			headless: true,
		});
		datTrinhDuyet(trinhDuyet);
		await buocNhap();
		await buocCaiDat();
		await buocChuKy();
		await buocGoiY();
	}
} catch (e) {
	console.log(`SAI ngoai-le: ${e.stack ?? e.message}`);
	ketQua.set("ngoai-le", false);
} finally {
	await trinhDuyet?.close().catch(() => {});
	await donDep().catch((e) => console.log(`don dep hong: ${e.message}`));
}

if (maTinHieu !== null) process.exit(maTinHieu);

const conChuKy = await db.okrCycle.count();
ghi("don-chu-ky", conChuKy === 0, `${conChuKy} chu ky OKR`);
const conNguoi = await db.user.count({
	where: { email: { startsWith: "osa-lan-do-" } },
});
ghi("don-nguoi", conNguoi === 0, `${conNguoi} nguoi tien to osa-lan-do-`);
const phienBanSau =
	(await db.okrProgramConfig.aggregate({ _max: { version: true } }))._max
		.version ?? 0;
ghi(
	"don-cau-hinh",
	phienBanSau <= phienBanSan,
	`phien ban cau hinh ${phienBanSau} <= ${phienBanSan}`,
);

if (loiGieo !== null)
	await khongDo(`KHONG DO DUOC: gieo qua API that hong — ${loiGieo.message}`);

for (const ma of MA_TRAN)
	if (!ketQua.has(ma)) {
		ketQua.set(ma, false);
		console.log(`SAI thieu ${ma}`);
	}
const dung = [...ketQua.values()].filter(Boolean).length;
const sai = ketQua.size - dung;
console.log(`anh o ${BANG_CHUNG}`);
console.log(`KET LUAN ${dung} DUNG, ${sai} SAI — ma thoat ${sai ? 1 : 0}`);
await ket(sai ? 1 : 0);
