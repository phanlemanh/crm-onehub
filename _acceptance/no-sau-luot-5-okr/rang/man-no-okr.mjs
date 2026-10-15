import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";
import { db } from "../../../packages/db/src/index.ts";
import {
	isOnboarded,
	markOnboarded,
	WORKSPACE_ID,
} from "../../../packages/db/src/workspace.ts";
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
const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "no-sau-luot-5-okr", "evidence");
const RONG = 1440;
const CAO = 900;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const MA = `n${Date.now().toString(36).slice(-6)}`;
const MOI_EVAL = ["E8", "E9", "E10", "E11"];

const CHU = {
	loiBan: "Không tải được KR của bạn.",
	thuLai: "Thử lại",
	boLoc: "Lọc",
	phuTrach: "Người phụ trách",
	tuTin: "Mức tự tin",
	tuTinCao: "Tự tin cao",
	daRoi: "Người không còn trong tổ chức · 0",
	vang: "Lê Thị Vắng",
};

const CHON = new Set(
	(process.env.EVAL ?? "")
		.split(",")
		.map((s) => s.trim().toUpperCase())
		.filter(Boolean),
);
const laMa = [...CHON].filter((e) => !MOI_EVAL.includes(e));
if (laMa.length > 0)
	await khongDo(
		`KHONG DO DUOC: EVAL=${process.env.EVAL} co ma khong thuoc thuoc nay: ${laMa.join(", ")}.`,
		`    Ma nhan duoc: ${MOI_EVAL.join(", ")}.`,
	);
const chon = (evals) => CHON.size === 0 || evals.some((e) => CHON.has(e));
console.log(
	CHON.size === 0
		? `man-no-okr: chay tron ${MOI_EVAL.length} eval; chay rieng: EVAL=E10 (ma: ${MOI_EVAL.join(", ")})`
		: `man-no-okr: chi chay ${[...CHON].join(", ")}`,
);

mkdirSync(BANG_CHUNG, { recursive: true });

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR ngoai fixture.`,
		"    Thuoc can kho khong co chu ky nao de ky dang chay la ky cua fixture.",
	);

const homNay = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
const NAM = Number(homNay.slice(0, 4));
const QUY = Math.ceil(Number(homNay.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	chiOkr: { email: `o${MA}@thu.test`, vai: "member", ten: "Lê Hồng Ngọc" },
};
const TEN = {
	B: `Khối Nợ OKR ${MA}`,
	MA1: "Mở rộng mạng lưới đối tác",
	MA2: "Chăm sóc đối tác sau ký",
};

const phienCua = (email) =>
	chiaCookie(
		execFileSync("bun", ["run", "dev:session", email], {
			cwd: join(GOC, "apps", "api"),
			encoding: "utf8",
		})
			.trim()
			.split("\n")
			.pop()
			.trim(),
	);

const khoaThanhVien = (userId) => ({
	organizationId_userId: { organizationId: WORKSPACE_ID, userId },
});

async function datNguoi(email, vai, ten) {
	const nguoi = await db.user.update({
		where: { email },
		data: { name: ten },
		select: { id: true },
	});
	await db.member.upsert({
		where: khoaThanhVien(nguoi.id),
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

const muCookie = (c) => `${c.ten}=${c.gia}; lang=vi`;

async function lam(c, duong, vao) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		redirect: "manual",
		headers: { Cookie: muCookie(c), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

const cookie = {};
const id = {};
const ORG = {};
const OKR = {};
const CAI = { ky: [], bp: [], phu: [] };

async function taoKy(kind, name, parentId, tu, den, pha) {
	const r = await lam(cookie.admin, "okr.createCycle", {
		kind,
		name,
		parentId,
		startsOn: tu,
		endsOn: den,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	CAI.ky.push(r.id);
	if (pha !== "lap-ke-hoach")
		await lam(cookie.admin, "okr.setCyclePhase", { id: r.id, phase: pha });
	return r.id;
}

async function taoMucTieu(title, krs) {
	const mt = await lam(cookie.admin, "okr.createObjective", {
		cycleId: OKR.quy,
		unit: { level: "bo-phan", divisionId: ORG.B },
		title,
		kind: "cam-ket",
		ownerUserId: id.admin,
		participantIds: [],
		whyNow: "",
	});
	const kr = [];
	for (const k of krs)
		kr.push(
			(
				await lam(cookie.admin, "okr.createKeyResult", {
					objectiveId: mt.id,
					kind: "tang-toi",
					startValue: 0,
					targetValue: 100,
					currentValue: 30,
					dueOn: null,
					weight: 1,
					unit: "đối tác",
					...k,
				})
			).id,
		);
	await lam(cookie.admin, "okr.publishObjective", { id: mt.id });
	return { id: mt.id, kr };
}

async function gieo() {
	const bp = await lam(cookie.admin, "org.createDivision", { name: TEN.B });
	ORG.B = bp.id;
	CAI.bp.push(bp.id);
	await lam(cookie.admin, "org.setHead", {
		kind: "division",
		id: ORG.B,
		userId: id.admin,
	});
	const vangId = `u-${MA}-vang`;
	await db.user.create({
		data: { id: vangId, name: CHU.vang, email: `${vangId}@thu.test` },
	});
	await db.member.create({
		data: {
			id: `member-${vangId}`,
			organizationId: WORKSPACE_ID,
			userId: vangId,
			role: "member",
			createdAt: new Date(),
		},
	});
	CAI.phu.push(vangId);
	id.vang = vangId;
	const nam = await taoKy(
		"nam",
		`Năm ${NAM} ${MA}`,
		null,
		ngay(NAM, 1, 1),
		ngay(NAM, 12, 31),
		"lap-ke-hoach",
	);
	OKR.quy = await taoKy(
		"quy",
		`Quý ${QUY}/${NAM} ${MA}`,
		nam,
		ngay(NAM, QUY * 3 - 2, 1),
		ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
		"dang-chay",
	);
	OKR.M1 = await taoMucTieu(TEN.MA1, [
		{ title: "Số đối tác hoạt động", ownerUserId: id.admin },
		{ title: "Đối tác mới mỗi tháng", ownerUserId: id.admin },
	]);
	OKR.M2 = await taoMucTieu(TEN.MA2, [
		{ title: "Đối tác được gọi lại trong 24 giờ", ownerUserId: id.chiOkr },
	]);
	const { sessionId } = await lam(cookie.admin, "okr.moCapNhat", {
		entry: "tab",
	});
	await lam(cookie.admin, "okr.guiCapNhat", {
		sessionId,
		items: [
			{ keyResultId: OKR.M1.kr[0], value: 35, confidence: "thap", note: "" },
		],
	});
	await db.member.update({
		where: khoaThanhVien(id.chiOkr),
		data: { role: "okr" },
	});
}

async function don() {
	const nguoi = [...Object.values(id)];
	const moiMt = (
		await db.okrObjective.findMany({
			where: { cycleId: { in: CAI.ky } },
			select: { id: true },
		})
	).map((o) => o.id);
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: CAI.ky } },
				{ objectiveId: { in: moiMt } },
				{ actorUserId: { in: nguoi } },
			],
		},
	});
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrCheckIn.deleteMany({
		where: { keyResult: { objectiveId: { in: moiMt } } },
	});
	await db.okrCheckInSession.deleteMany({ where: { userId: { in: nguoi } } });
	await db.okrComment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrKeyResult.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: moiMt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: CAI.ky }, kind: "quy" } });
	await db.okrCycle.deleteMany({ where: { id: { in: CAI.ky } } });
	await db.orgPlacement.deleteMany({ where: { userId: { in: nguoi } } });
	await db.division.updateMany({
		where: { id: { in: CAI.bp } },
		data: { headUserId: null },
	});
	await db.division.deleteMany({ where: { id: { in: CAI.bp } } });
	await db.zaloLink.deleteMany({ where: { crmUserId: { in: nguoi } } });
	await db.session.deleteMany({ where: { userId: { in: nguoi } } });
	await db.member.deleteMany({ where: { userId: { in: nguoi } } });
	await db.user.deleteMany({ where: { id: { in: nguoi } } });
}

const trinhDuyet = await puppeteer.launch({
	executablePath: CHROME,
	headless: true,
});
datTrinhDuyet(trinhDuyet);

let khang = 0;
const hong = [];
const anh = [];
const mang = [];
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));
let slug = "";

const thuTucCua = (u) => {
	const url = new URL(u);
	const duoi = url.pathname.split("/api/trpc/")[1];
	if (duoi === undefined) return [];
	return decodeURIComponent(duoi)
		.split(",")
		.map((t) => t.trim());
};

const LOI_CHU_KY = {
	error: {
		json: {
			message: "chan boi thuoc man-no-okr",
			code: -32603,
			data: {
				code: "INTERNAL_SERVER_ERROR",
				httpStatus: 500,
				path: "okr.cycles",
			},
		},
	},
};

async function moTrang(c, duong, chanChuKy = null) {
	const trang = await trinhDuyet.newPage();
	const dem = { goi: {}, chan: 0 };
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${d}`);
	trang.on("pageerror", (e) => ghi(`pageerror ${String(e).slice(0, 2000)}`));
	trang.on("console", (m) => {
		if (m.type() === "error") ghi(`console.error ${m.text().slice(0, 300)}`);
	});
	trang.on("response", (r) => {
		if (r.status() >= 400)
			ghi(`${r.status()} ${r.request().method()} ${r.url()}`);
	});
	if (chanChuKy) {
		await trang.setRequestInterception(true);
		trang.on("request", async (r) => {
			const ten = thuTucCua(r.url());
			for (const t of ten) dem.goi[t] = (dem.goi[t] ?? 0) + 1;
			if (!chanChuKy.dang || !ten.includes("okr.cycles")) {
				await r.continue();
				return;
			}
			dem.chan += 1;
			if (ten.length === 1) {
				await r.respond({
					status: 500,
					contentType: "application/json",
					body: JSON.stringify([LOI_CHU_KY]),
				});
				return;
			}
			const that = await fetch(r.url(), {
				method: r.method(),
				headers: { Cookie: muCookie(c), "content-type": "application/json" },
				body: r.postData(),
			});
			const ds = JSON.parse(await that.text());
			await r.respond({
				status: 207,
				contentType: "application/json",
				body: JSON.stringify(
					ten.map((t, i) => (t === "okr.cycles" ? LOI_CHU_KY : ds[i])),
				),
			});
		});
	} else
		trang.on("request", (r) => {
			for (const t of thuTucCua(r.url())) dem.goi[t] = (dem.goi[t] ?? 0) + 1;
		});
	await trang.evaluateOnNewDocument(() => {
		window.__hien = (e) =>
			e.checkVisibility() ||
			(getComputedStyle(e).display === "contents" &&
				(e.parentElement?.checkVisibility() ?? false));
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
	});
	await trang.setViewport({ width: RONG, height: CAO });
	const host = new URL(APP).hostname;
	await trang.setCookie(
		{ name: c.ten, value: c.gia, domain: host, path: "/" },
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
	return { trang, dem };
}

async function doi(trang, nhan, fn, ...doiSo) {
	const ra = await trang
		.waitForFunction(fn, { timeout: CHO, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
	return kiem(`${nhan}: het ${CHO}ms van chua thay`, ra);
}

const demSel = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s).length, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.innerText?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const thuocTinh = (trang, sel, ten) =>
	trang.evaluate(
		(s, t) => window.__tim(s).map((e) => e.getAttribute(t)),
		sel,
		ten,
	);
const hienSel = (trang, sel, nhan) =>
	doi(
		trang,
		nhan,
		(s) => {
			const e = window.__tim(s)[0];
			if (!e) return false;
			const r = e.getBoundingClientRect();
			return r.width > 0 && r.height > 0;
		},
		sel,
	);
const chuTrang = (trang) =>
	trang.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

async function bamChu(trang, sel, chu, nhan) {
	await trang.bringToFront();
	const tay = await trang.evaluateHandle(
		(s, c) =>
			window
				.__tim(s)
				.find((x) => x.innerText?.replace(/\s+/g, " ").trim().startsWith(c)) ??
			null,
		sel,
		chu,
	);
	const el = tay.asElement();
	if (!el)
		return kiem(`${nhan}: khong thay «${chu}» trong ${sel} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	await cho(400);
	return true;
}

async function chup(trang, ten) {
	await cho(250);
	await trang.screenshot({ path: join(BANG_CHUNG, ten), fullPage: true });
	anh.push(ten);
}

async function choMangRanh(trang) {
	await trang
		.waitForNetworkIdle({ idleTime: 500, timeout: CHO })
		.catch(() => null);
	await cho(CHO_HYDRATE_MS);
}

async function buocTongQuan(ai, soHang, tenAnh) {
	const chan = { dang: true };
	const { trang, dem } = await moTrang(cookie[ai], "", chan);
	const LOI = "[data-khoi='okr-cua-toi'] [data-trang-thai='ST-tongquan-loi']";
	const coLoi = await hienSel(
		trang,
		LOI,
		`E8 (${ai}): khoi OKR cua ban bien mat khi chu ky loi (chan ${dem.chan} lan, data-khoi tren man: ${(await thuocTinh(trang, "[data-khoi]", "data-khoi")).join(", ")})`,
	);
	kiem(
		`E8 (${ai}): lo co okr.cycles phai bi chan it nhat mot lan (thay ${dem.chan})`,
		dem.chan >= 1,
	);
	if (coLoi) {
		const chu = await chuSel(trang, LOI);
		kiem(
			`E8 (${ai}): khoi loi noi «${CHU.loiBan}» va co nut «${CHU.thuLai}» (thay «${chu}»)`,
			chu.includes(CHU.loiBan) && chu.includes(CHU.thuLai),
		);
		kiem(
			`E8 (${ai}): khoi loi khong co bang KR`,
			(await demSel(trang, "[data-kr-cua-toi]")) === 0,
		);
		await chup(trang, `${tenAnh}-loi.png`);
	}
	if (chon(["E9"]) && coLoi) {
		chan.dang = false;
		const truoc = dem.goi["okr.cycles"] ?? 0;
		await bamChu(trang, `${LOI} button`, CHU.thuLai, `E9 (${ai})`);
		const coHang = await hienSel(
			trang,
			"[data-khoi='okr-cua-toi'] [data-kr-cua-toi]",
			`E9 (${ai}): bam Thu lai sau khi bo chan thi bang KR hien`,
		);
		kiem(
			`E9 (${ai}): bam Thu lai goi lai okr.cycles (truoc ${truoc}, sau ${dem.goi["okr.cycles"] ?? 0})`,
			(dem.goi["okr.cycles"] ?? 0) > truoc,
		);
		if (coHang) {
			const n = await demSel(
				trang,
				"[data-khoi='okr-cua-toi'] [data-kr-cua-toi]",
			);
			kiem(`E9 (${ai}): bang KR co ${soHang} hang (thay ${n})`, n === soHang);
			await chup(trang, `${tenAnh}-sau-thu-lai.png`);
		}
	}
	await trang.close();
}

const donB = () => `donOkr=${encodeURIComponent(`bp:${ORG.B}`)}`;

async function buocTaiTruoc() {
	const ca = [
		["khong-loc", donB()],
		["chi-tu-tin", `${donB()}&tuTinOkr=thap`],
		[
			"du-bon-mat",
			`${donB()}&phuTrachOkr=${id.admin}&loaiOkr=cam-ket&trangThaiOkr=cong-bo&tuTinOkr=thap,cao,vua`,
		],
	];
	let doiChungDaDem = false;
	for (const [ten, q] of ca) {
		const { trang, dem } = await moTrang(cookie.admin, `/okr/theo-don-vi?${q}`);
		await hienSel(
			trang,
			"[data-muc-tieu]",
			`E10 ${ten}: danh sach muc tieu hien`,
		);
		const n = dem.goi["okr.danhSach"] ?? 0;
		kiem(
			`E10 ${ten}: trinh duyet goi lai okr.danhSach ${n} lan khi vua mo (URL ?${q})`,
			n === 0,
		);
		await chup(trang, `E10-theo-don-vi-${ten}.png`);
		if (ten === "khong-loc") {
			const truocMt = (
				await thuocTinh(trang, "[data-muc-tieu]", "data-muc-tieu")
			).sort();
			await bamChu(trang, "button", CHU.boLoc, "E10 doi chung");
			await bamChu(trang, "[role='menuitem']", CHU.tuTin, "E10 doi chung");
			await bamChu(
				trang,
				"[role='menuitemcheckbox']",
				CHU.tuTinCao,
				"E10 doi chung",
			);
			await trang.keyboard.press("Escape");
			await choMangRanh(trang);
			const sau = dem.goi["okr.danhSach"] ?? 0;
			doiChungDaDem = sau >= 1;
			const sauMt = (
				await thuocTinh(trang, "[data-muc-tieu]", "data-muc-tieu")
			).sort();
			kiem(
				`E10 doi chung: doi bo loc tren man thi danh sach doi (truoc [${truocMt}], sau [${sauMt}])`,
				JSON.stringify(truocMt) !== JSON.stringify(sauMt),
			);
		}
		await trang.close();
	}
	kiem(
		"E10: bo dem khong thay okr.danhSach — doi chung doi bo loc khong dem duoc lan goi nao",
		doiChungDaDem,
	);
}

async function buocNhanPhuTrach() {
	const roi = `u-da-roi-${MA}`;
	const { trang } = await moTrang(
		cookie.admin,
		`/okr/theo-don-vi?${donB()}&phuTrachOkr=${id.vang},${roi}`,
	);
	// AC-14 cach-toi: nam mat loc nay o nut «Loc» (menu mat loc) cua hang cong cu DataTable tren trang don vi (trang-don-vi-mot-bang AC-5), khong con thanh [data-loc-okr].
	await doi(
		trang,
		"E11: thanh bo loc hien",
		(c) =>
			window
				.__tim("button[aria-haspopup='menu']")
				.some((b) => b.innerText.replace(/\s+/g, " ").trim().startsWith(c)),
		CHU.boLoc,
	);
	const dong = await chuTrang(trang);
	kiem(
		`E11: nhan phu trach lo ma khi menu dong (${[id.vang, roi].filter((x) => dong.includes(x))})`,
		!dong.includes(id.vang) && !dong.includes(roi),
	);
	await bamChu(trang, "button", CHU.boLoc, "E11");
	await bamChu(trang, "[role='menuitem']", CHU.phuTrach, "E11");
	await doi(
		trang,
		"E11: menu con nguoi phu trach mo",
		() => window.__tim("[role='menuitemcheckbox']").length >= 2,
	);
	const nhan = await trang.evaluate(() =>
		window
			.__tim("[role='menuitemcheckbox']")
			.map((e) => e.innerText.replace(/\s+/g, " ").trim()),
	);
	kiem(
		`E11: menu con co «${CHU.vang} · 0» va «${CHU.daRoi}» (thay ${JSON.stringify(nhan)})`,
		nhan.includes(`${CHU.vang} · 0`) && nhan.includes(CHU.daRoi),
	);
	const mo = await chuTrang(trang);
	kiem(
		`E11: nhan phu trach lo ma khi menu mo (${[id.vang, roi].filter((x) => mo.includes(x))})`,
		!mo.includes(id.vang) && !mo.includes(roi),
	);
	await chup(trang, "E11-loc-phu-trach.png");
	await trang.close();
}

let metaCu = null;
let doiMeta = false;
let ma = 0;
const bat = Date.now();
try {
	for (const [k, n] of Object.entries(NGUOI)) {
		cookie[k] = phienCua(n.email);
		id[k] = await datNguoi(n.email, n.vai, n.ten);
	}
	const org = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { metadata: true },
	});
	if (!org) throw new Error("kho chua co hang workspace sau dev:session");
	if (!isOnboarded(org.metadata)) {
		metaCu = org.metadata;
		doiMeta = true;
		await db.organization.update({
			where: { id: WORKSPACE_ID },
			data: { metadata: markOnboarded(org.metadata, new Date()) },
		});
		console.log(
			"  tien de: workspace chua danh dau onboard — thuoc tu danh dau, tra lai khi don",
		);
	}
	slug = await suySlug(cookie.admin);
	await gieo();
	const buoc = [
		[
			"tong-quan-quan-tri",
			["E8", "E9"],
			() => buocTongQuan("admin", 2, "E8-tongquan"),
		],
		[
			"tong-quan-chi-okr",
			["E8", "E9"],
			() => buocTongQuan("chiOkr", 1, "E8-chiokr"),
		],
		["tai-truoc", ["E10"], buocTaiTruoc],
		["nhan-phu-trach", ["E11"], buocNhanPhuTrach],
	];
	for (const [ten, evals, fn] of buoc) {
		if (!chon(evals)) continue;
		const batBuoc = Date.now();
		try {
			await fn();
		} catch (e) {
			hong.push(`${ten}: nem ${String(e).slice(0, 300)}`);
		}
		console.log(
			`  buoc ${ten}: ${Math.round((Date.now() - batBuoc) / 1000)} s`,
		);
	}
} catch (e) {
	hong.push(`tien de: nem ${String(e).slice(0, 400)}`);
} finally {
	await don().catch((e) => hong.push(`don dep: ${String(e).slice(0, 200)}`));
	if (doiMeta)
		await db.organization
			.update({ where: { id: WORKSPACE_ID }, data: { metadata: metaCu } })
			.catch((e) => hong.push(`tra onboard: ${String(e).slice(0, 200)}`));
	const conKy = await db.okrCycle.count();
	if (conKy > 0) hong.push(`don dep: con ${conKy} chu ky trong kho`);
	writeFileSync(join(BANG_CHUNG, "man-no-okr-network.txt"), mang.join("\n"));
	console.log(
		`man-no-okr: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh, ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
}
await ket(ma);
