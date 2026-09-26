import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
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
	join(GOC, ".acceptance-runs", "toan-canh-okr", "evidence");
const RONG = 1440;
const HEP = 390;
const CAO = 900;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const MA = `t${Date.now().toString(36).slice(-6)}`;
const LOI_HYDRATE = /hydrat/i;

const CHU = {
	cayCanChinh: "Cây căn chỉnh toàn công ty",
	cayDonVi: "Cây đơn vị",
	cungHien: "cũng hiện ở chỗ góp kia",
	khongKhop: "Không mục tiêu nào khớp bộ lọc",
	boLoc: "Bỏ lọc",
	phuTrach: "Người phụ trách",
	phongBanChinh: "Phòng ban chính",
	suKhoe: "Sức khoẻ chương trình",
	khongQuyen: "Chỉ quản trị xem được sức khoẻ chương trình",
	chuaCongBo: "KR của mục tiêu chưa công bố",
	thieuKhoiDiem: "thiếu khởi điểm",
	chuaCoTruong: "Chưa có trưởng",
	thuLai: "Thử lại",
	tuanDau: "Chưa có số để so",
	vuaCongBo: "Mục tiêu vừa công bố, chưa có kỳ vọng để so",
	danhSach: "Danh sách",
	hopTuan: "Họp tuần",
	conLai: "Còn lại",
	tutCaoThap: "Tụt từ tự tin cao xuống tự tin thấp",
	im16: "Im 16 ngày",
	ghiChuMoi: "Ghi chú mới",
	dich: "Đích",
	thap: "Tự tin thấp",
	hienTai: "hiện tại",
	toanCanhTab: "Toàn cảnh",
	chuKy: "Chu kỳ",
};

mkdirSync(BANG_CHUNG, { recursive: true });

const cayKiem = await canhCay();
if (cayKiem.ket !== "dung-cay") await khongDo(...cayKiem.dong);

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR ngoai fixture.`,
		"    Thuoc can kho khong co chu ky nao de ky dang chay la ky cua fixture.",
	);

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

async function datNguoi(email, vai, ten) {
	const nguoi = await db.user.update({
		where: { email },
		data: { name: ten },
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

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	truongB: { email: `b${MA}@thu.test`, vai: "member", ten: "Trần Thu Bình" },
	truongP1: { email: `p${MA}@thu.test`, vai: "member", ten: "Phạm Thu Lan" },
	truongP3: { email: `q${MA}@thu.test`, vai: "member", ten: "Vũ Thanh Hà" },
	k: { email: `k${MA}@thu.test`, vai: "member", ten: "Đỗ Quang Khải" },
	chiOkr: { email: `o${MA}@thu.test`, vai: "okr", ten: "Lê Hồng Ngọc" },
};
const cookie = {};
const id = {};
for (const [k, n] of Object.entries(NGUOI)) {
	cookie[k] = phienCua(n.email);
	id[k] = await datNguoi(n.email, n.vai, n.ten);
}
const slug = await suySlug(cookie.admin);

const TEN = {
	B: `Khối Kinh doanh ${MA}`,
	P1: `Phòng Đối tác ${MA}`,
	P2: `Phòng Hậu cần ${MA}`,
	C: `Khối Vận hành ${MA}`,
	P3: `Phòng Pháp chế ${MA}`,
	G1: "Mở rộng mạng lưới đối tác toàn OneHub",
	B1: "Khối Kinh doanh tăng doanh thu từ đối tác",
	P1a: "Đối tác mới được đỡ trọn tháng đầu",
	P1b: "Chuẩn hoá quy trình nhận đối tác",
	P3a: "Hợp đồng đối tác duyệt trong ba ngày",
	H: "Họp tuần thử của Phòng Đối tác",
	Ka: "KR tụt mức tự tin",
	Kb: "KR im lâu",
	Kc: "KR có ghi chú mới",
	Kd: "KR không có gì mới",
	Q2: `TCO-Q-${MA} Mục tiêu của kỳ khác`,
};

const homNay = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
const NAM = Number(homNay.slice(0, 4));
const QUY = Math.ceil(Number(homNay.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const QUY_KHAC = QUY === 1 ? 2 : QUY - 1;
const TEN_KY_KHAC = `Quý ${QUY_KHAC}/${NAM} ${MA}`;
const NGAY_MS = 24 * 60 * 60 * 1000;
const tuanNayVN = () => {
	const d = Date.parse(`${homNay}T00:00:00Z`);
	const lui = (new Date(d).getUTCDay() + 6) % 7;
	return new Date(d - lui * NGAY_MS).toISOString().slice(0, 10);
};

function mu(c) {
	return { Cookie: `${c.ten}=${c.gia}; lang=vi` };
}

async function hoi(c, duong, vao) {
	const url = `${API}/api/trpc/${duong}${vao === undefined ? "" : `?input=${encodeURIComponent(JSON.stringify(vao))}`}`;
	const res = await fetch(url, { redirect: "manual", headers: mu(c) });
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

async function lam(c, duong, vao) {
	const res = await fetch(`${API}/api/trpc/${duong}`, {
		method: "POST",
		redirect: "manual",
		headers: { ...mu(c), "content-type": "application/json" },
		body: JSON.stringify(vao),
	});
	const chu = await res.text();
	if (!res.ok)
		throw new Error(`${duong} tra ${res.status}: ${chu.slice(0, 300)}`);
	return JSON.parse(chu).result.data;
}

const ORG = {};
const OKR = {};

async function gieo() {
	ORG.B = (await lam(cookie.admin, "org.createDivision", { name: TEN.B })).id;
	ORG.C = (await lam(cookie.admin, "org.createDivision", { name: TEN.C })).id;
	for (const [k, bp] of [
		["P1", ORG.B],
		["P2", ORG.B],
		["P3", ORG.C],
	])
		ORG[k] = (
			await lam(cookie.admin, "org.createDepartment", {
				name: TEN[k],
				divisionId: bp,
			})
		).id;
	for (const [userId, pb] of [
		[id.truongP1, ORG.P1],
		[id.k, ORG.P1],
		[id.truongP3, ORG.P3],
		[id.chiOkr, ORG.P2],
	])
		await lam(cookie.admin, "org.setPlacement", {
			userId,
			primaryDepartmentId: pb,
			secondaryDepartmentIds: [],
			managerUserId: null,
		});
	for (const [kind, donId, userId] of [
		["division", ORG.B, id.truongB],
		["department", ORG.P1, id.truongP1],
		["department", ORG.P3, id.truongP3],
	])
		await lam(cookie.admin, "org.setHead", { kind, id: donId, userId });

	await lam(cookie.admin, "okr.createCycle", {
		kind: "nam",
		name: `Năm ${NAM} ${MA}`,
		parentId: null,
		startsOn: ngay(NAM, 1, 1),
		endsOn: ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const ds1 = await hoi(cookie.admin, "okr.cycles");
	OKR.nam = ds1.cycles.find((x) => x.name === `Năm ${NAM} ${MA}`).id;
	await lam(cookie.admin, "okr.createCycle", {
		kind: "quy",
		name: `Quý ${QUY}/${NAM} ${MA}`,
		parentId: OKR.nam,
		startsOn: ngay(NAM, QUY * 3 - 2, 1),
		endsOn: ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const ds2 = await hoi(cookie.admin, "okr.cycles");
	OKR.quy = ds2.cycles.find((x) => x.name === `Quý ${QUY}/${NAM} ${MA}`).id;
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: OKR.quy,
		phase: "dang-chay",
	});

	const moi = async (c, unit, title, owner, krs, them = {}) => {
		const mt = await lam(c, "okr.createObjective", {
			cycleId: OKR.quy,
			unit,
			title,
			kind: "cam-ket",
			ownerUserId: owner,
			participantIds: [],
			whyNow: "",
			...them,
		});
		const kr = [];
		for (const k of krs)
			kr.push(
				(
					await lam(c, "okr.createKeyResult", {
						objectiveId: mt.id,
						kind: "tang-toi",
						startValue: 0,
						dueOn: null,
						weight: 1,
						unit: "đối tác",
						...k,
					})
				).id,
			);
		return { id: mt.id, kr };
	};
	OKR.G1 = await moi(cookie.admin, { level: "onehub" }, TEN.G1, id.admin, [
		{
			title: "Số đối tác hoạt động",
			ownerUserId: id.admin,
			targetValue: 120,
			currentValue: 45,
		},
	]);
	await lam(cookie.admin, "okr.publishObjective", { id: OKR.G1.id });
	OKR.B1 = await moi(
		cookie.truongB,
		{ level: "bo-phan", divisionId: ORG.B },
		TEN.B1,
		id.truongB,
		[
			{
				title: "Doanh thu từ đối tác mới",
				ownerUserId: id.truongB,
				targetValue: 800,
				currentValue: 260,
			},
		],
	);
	await lam(cookie.truongB, "okr.publishObjective", { id: OKR.B1.id });
	OKR.P1a = await moi(
		cookie.truongP1,
		{ level: "phong-ban", departmentId: ORG.P1 },
		TEN.P1a,
		id.truongP1,
		[
			{
				title: "Đối tác chấm hài lòng từ 4/5",
				ownerUserId: id.k,
				targetValue: 85,
				currentValue: 60,
			},
		],
		{ kind: "tham-vong" },
	);
	await lam(cookie.truongP1, "okr.publishObjective", { id: OKR.P1a.id });
	OKR.P1b = await moi(
		cookie.truongP1,
		{ level: "phong-ban", departmentId: ORG.P1 },
		TEN.P1b,
		id.truongP1,
		[
			{
				title: "Quy trình một trang",
				ownerUserId: id.truongP1,
				targetValue: 1,
				currentValue: 0,
			},
			{
				title: "Thời gian bàn giao",
				ownerUserId: id.truongP1,
				targetValue: 10,
				currentValue: 2,
			},
		],
	);
	OKR.P3a = await moi(
		cookie.truongP3,
		{ level: "phong-ban", departmentId: ORG.P3 },
		TEN.P3a,
		id.truongP3,
		[
			{
				title: "Hợp đồng duyệt đúng hạn",
				ownerUserId: id.k,
				targetValue: 30,
				currentValue: 12,
			},
		],
	);
	await lam(cookie.truongP3, "okr.publishObjective", { id: OKR.P3a.id });
	for (const [c, objectiveId, targetObjectiveId, targetKeyResultId] of [
		[cookie.truongB, OKR.B1.id, OKR.G1.id, null],
		[cookie.truongB, OKR.B1.id, null, OKR.G1.kr[0]],
		[cookie.truongP1, OKR.P1a.id, OKR.B1.id, null],
	])
		await lam(c, "okr.addAlignment", {
			objectiveId,
			targetObjectiveId,
			targetKeyResultId,
		});

	OKR.H = await moi(
		cookie.truongP1,
		{ level: "phong-ban", departmentId: ORG.P1 },
		TEN.H,
		id.truongP1,
		[TEN.Ka, TEN.Kb, TEN.Kc, TEN.Kd].map((title) => ({
			title,
			ownerUserId: id.truongP1,
			targetValue: 100,
			currentValue: 40,
		})),
	);
	await lam(cookie.truongP1, "okr.publishObjective", { id: OKR.H.id });
	const [Ka, Kb, Kc, Kd] = OKR.H.kr;
	const capNhat = async (c, items) => {
		const { sessionId } = await lam(c, "okr.moCapNhat", { entry: "tab" });
		await lam(c, "okr.guiCapNhat", { sessionId, items });
	};
	const muc = (keyResultId, value, confidence, note = "") => ({
		keyResultId,
		value,
		confidence,
		note,
	});
	await capNhat(cookie.truongP1, [muc(Ka, 45, "cao"), muc(Kd, 50, "cao")]);
	await capNhat(cookie.truongP1, [
		muc(Ka, 46, "thap"),
		muc(Kc, 55, "vua", "Đối tác lùi lịch ký"),
	]);
	await db.okrKeyResult.update({
		where: { id: Kb },
		data: { startLockedAt: new Date(Date.now() - 16 * NGAY_MS) },
	});
	await capNhat(cookie.k, [muc(OKR.P1a.kr[0], 62, "thap")]);

	await lam(cookie.admin, "okr.createCycle", {
		kind: "quy",
		name: TEN_KY_KHAC,
		parentId: OKR.nam,
		startsOn: ngay(NAM, QUY_KHAC * 3 - 2, 1),
		endsOn: ngay(NAM, QUY_KHAC * 3, cuoiThang(NAM, QUY_KHAC * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const ds3 = await hoi(cookie.admin, "okr.cycles");
	OKR.quy2 = ds3.cycles.find((x) => x.name === TEN_KY_KHAC).id;
	OKR.Q2 = (
		await lam(cookie.truongP1, "okr.createObjective", {
			cycleId: OKR.quy2,
			unit: { level: "phong-ban", departmentId: ORG.P1 },
			title: TEN.Q2,
			kind: "cam-ket",
			ownerUserId: id.truongP1,
			participantIds: [],
			whyNow: "",
		})
	).id;
}

async function donDep() {
	const moiNguoi = Object.values(id);
	const moiKy = [OKR.quy, OKR.quy2, OKR.nam].filter(Boolean);
	const moiMt = (
		await db.okrObjective.findMany({
			where: { cycleId: { in: moiKy } },
			select: { id: true },
		})
	).map((o) => o.id);
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: moiKy } },
				{ objectiveId: { in: moiMt } },
				{ actorUserId: { in: moiNguoi } },
			],
		},
	});
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrCheckIn.deleteMany({
		where: { keyResult: { objectiveId: { in: moiMt } } },
	});
	await db.okrCheckInSession.deleteMany({
		where: { userId: { in: moiNguoi } },
	});
	await db.okrMention.deleteMany({
		where: { comment: { objectiveId: { in: moiMt } } },
	});
	await db.okrComment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrKeyResult.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: moiMt } } });
	if (OKR.quy) await db.okrCycle.deleteMany({ where: { id: OKR.quy } });
	if (OKR.quy2) await db.okrCycle.deleteMany({ where: { id: OKR.quy2 } });
	if (OKR.nam) await db.okrCycle.deleteMany({ where: { id: OKR.nam } });
	const moiPb = ["P1", "P2", "P3"].map((k) => ORG[k]).filter(Boolean);
	await db.orgSecondaryDepartment.deleteMany({
		where: {
			OR: [{ departmentId: { in: moiPb } }, { userId: { in: moiNguoi } }],
		},
	});
	await db.orgPlacement.deleteMany({
		where: {
			OR: [
				{ userId: { in: moiNguoi } },
				{ primaryDepartmentId: { in: moiPb } },
			],
		},
	});
	await db.department.updateMany({
		where: { id: { in: moiPb } },
		data: { headUserId: null },
	});
	await db.department.deleteMany({ where: { id: { in: moiPb } } });
	await db.division.updateMany({
		where: { id: { in: [ORG.B, ORG.C].filter(Boolean) } },
		data: { headUserId: null },
	});
	await db.division.deleteMany({
		where: { id: { in: [ORG.B, ORG.C].filter(Boolean) } },
	});
	await db.session.deleteMany({ where: { userId: { in: moiNguoi } } });
	await db.member.deleteMany({ where: { userId: { in: moiNguoi } } });
	await db.user.deleteMany({ where: { id: { in: moiNguoi } } });
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
const trpc = [];
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function moTrang(c, rong, duong) {
	const trang = await trinhDuyet.newPage();
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${d}`);
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 300)}`);
		if (LOI_HYDRATE.test(String(e)))
			hong.push(`${duong}: loi hydrat ${String(e).slice(0, 200)}`);
	});
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		ghi(`console.error ${m.text().slice(0, 300)}`);
		if (LOI_HYDRATE.test(m.text()))
			hong.push(`${duong}: loi hydrat ${m.text().slice(0, 200)}`);
	});
	trang.on("requestfailed", (r) =>
		ghi(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`),
	);
	trang.on("request", (r) => {
		const u = r.url();
		if (u.includes("/api/trpc/okr.")) trpc.push(u);
	});
	trang.on("response", (r) => {
		if (r.status() >= 400)
			ghi(`${r.status()} ${r.request().method()} ${r.url()}`);
	});
	await trang.setViewport({ width: rong, height: CAO });
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
	return trang;
}

async function doi(trang, nhan, fn, ...doiSo) {
	const ra = await trang
		.waitForFunction(fn, { timeout: CHO, polling: 200 }, ...doiSo)
		.then(() => true)
		.catch(() => false);
	return kiem(`${nhan}: het ${CHO}ms van chua thay`, ra);
}

const coSel = (trang, sel) =>
	trang.evaluate((s) => document.querySelector(s) !== null, sel);
const demSel = (trang, sel) =>
	trang.evaluate((s) => document.querySelectorAll(s).length, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) =>
			document.querySelector(s)?.textContent?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const hienSel = (trang, sel) =>
	doi(
		trang,
		`hien ${sel}`,
		(s) => {
			const e = document.querySelector(s);
			if (!e) return false;
			const r = e.getBoundingClientRect();
			return r.width > 0 && r.height > 0;
		},
		sel,
	);
const thamSo = (trang, khoa) => new URL(trang.url()).searchParams.get(khoa);

async function bamChu(trang, sel, chu) {
	await trang.bringToFront();
	const tay = await trang.evaluateHandle(
		(s, c) =>
			[...document.querySelectorAll(s)].find((x) =>
				x.textContent?.replace(/\s+/g, " ").trim().startsWith(c),
			) ?? null,
		sel,
		chu,
	);
	const el = tay.asElement();
	if (!el) return kiem(`khong thay «${chu}» trong ${sel} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

const khongTran = (trang) =>
	trang.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);

async function chup(trang, ten, toanTrang = true) {
	kiem(`${ten}: tran ngang`, await khongTran(trang));
	await cho(250);
	await trang.screenshot({ path: join(BANG_CHUNG, ten), fullPage: toanTrang });
	anh.push(ten);
}

async function chupKhoi(trang, sel, ten) {
	const el = await trang.$(sel);
	if (!el) return kiem(`${ten}: khong thay ${sel} de chup`, false);
	await el.evaluate((e) => e.scrollIntoView({ block: "start" }));
	await cho(400);
	await el.screenshot({ path: join(BANG_CHUNG, ten) });
	anh.push(ten);
	return true;
}

const ky = () => `kyOkr=${OKR.quy}`;
const theoDonVi = (them) => `/okr/theo-don-vi?${ky()}${them ? `&${them}` : ""}`;

async function buocLoc() {
	const t = await moTrang(
		cookie.truongB,
		RONG,
		theoDonVi(`donOkr=bp:${ORG.B}`),
	);
	await hienSel(t, "[data-muc-tieu]");
	kiem(
		"E2 buoc 3: bo phan B phai hien 4 muc tieu (B1, P1a, P1b, H), khong P3a",
		(await demSel(t, "[data-muc-tieu]")) === 4 &&
			!(await coSel(t, `[data-muc-tieu='${OKR.P3a.id}']`)),
	);
	await chup(t, "E2-buoc-loc-1.png");

	trpc.length = 0;
	await bamChu(t, "[data-loc-okr] button", "");
	await cho(400);
	await bamChu(t, "[role='menuitem']", CHU.phuTrach);
	await cho(400);
	await bamChu(t, "[role='menuitemcheckbox']", NGUOI.k.ten);
	await doi(
		t,
		"E2 buoc 4: URL mang phuTrachOkr",
		(k) => new URL(location.href).searchParams.get("phuTrachOkr") === k,
		id.k,
	);
	await t.keyboard.press("Escape");
	await doi(
		t,
		"E2 buoc 4: con 1 muc tieu",
		() => document.querySelectorAll("[data-muc-tieu]").length === 1,
	);
	kiem(
		"E2 buoc 4: muc tieu con lai la P1a",
		await coSel(t, `[data-muc-tieu='${OKR.P1a.id}']`),
	);
	const loiGoi = trpc.flatMap((u) => {
		const url = new URL(u);
		const ten = decodeURIComponent(
			url.pathname.split("/api/trpc/")[1] ?? "",
		).split(",");
		const vao = JSON.parse(url.searchParams.get("input") ?? "{}");
		return ten.flatMap((t, i) =>
			t === "okr.danhSach" ? [vao[String(i)]] : [],
		);
	});
	kiem(
		`E3: sau khi chon nguoi phai co loi goi okr.danhSach voi loc.phuTrach = [k] (thay: ${JSON.stringify(loiGoi.map((v) => v?.loc))})`,
		loiGoi.some(
			(v) => JSON.stringify(v?.loc?.phuTrach) === JSON.stringify([id.k]),
		),
	);
	const idManHinh = await t.evaluate(() =>
		[...document.querySelectorAll("[data-muc-tieu]")].map((e) =>
			e.getAttribute("data-muc-tieu"),
		),
	);
	const tuApi = await hoi(cookie.truongB, "okr.danhSach", {
		cycleId: OKR.quy,
		unit: { loai: "bp", id: ORG.B },
		loc: { phuTrach: [id.k], loai: [], trangThai: [] },
	});
	kiem(
		`E3: tap muc tieu tren man bang tap API tra (man ${idManHinh}, api ${tuApi.rows.map((r) => r.id)})`,
		JSON.stringify([...idManHinh].sort()) ===
			JSON.stringify(tuApi.rows.map((r) => r.id).sort()),
	);
	await chup(t, "E2-buoc-loc-2.png");

	await t.reload({ waitUntil: "load" });
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(CHO_HYDRATE_MS);
	kiem(
		"E2 buoc 4: tai lai trang van 1 muc tieu",
		(await demSel(t, "[data-muc-tieu]")) === 1,
	);

	await t.goto(
		`${APP}/${slug}${theoDonVi(`donOkr=bp:${ORG.B}&phuTrachOkr=${id.k}&loaiOkr=cam-ket`)}`,
		{ waitUntil: "load" },
	);
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(CHO_HYDRATE_MS);
	kiem(
		"E2 buoc 5: loc khong khop hien cau rong",
		(await chuSel(t, "[data-trang-thai='ST-donvi-loc-khongkhop']")).includes(
			CHU.khongKhop,
		),
	);
	await chup(t, "E2-buoc-loc-3.png");
	await bamChu(
		t,
		"[data-trang-thai='ST-donvi-loc-khongkhop'] button",
		CHU.boLoc,
	);
	await doi(
		t,
		"E2 buoc 5: bo loc tra lai 4 muc tieu",
		() => document.querySelectorAll("[data-muc-tieu]").length === 4,
	);
	kiem(
		"E2 buoc 5: URL khong con tham so loc",
		thamSo(t, "phuTrachOkr") === null && thamSo(t, "loaiOkr") === null,
	);
	await t.close();

	for (const [rong, ten] of [
		[RONG, "E2-buoc-nguoi-1.png"],
		[HEP, "E2-buoc-nguoi-2.png"],
	]) {
		const n = await moTrang(
			cookie.admin,
			rong,
			theoDonVi(`donOkr=nguoi:${id.k}`),
		);
		await hienSel(n, "[data-don-vi]");
		if (rong === RONG) {
			await hienSel(n, "[data-don-vi] [data-slot='card-description']");
			const moTa = await chuSel(
				n,
				"[data-don-vi] [data-slot='card-description']",
			);
			kiem(
				`E2 buoc 6: dau trang mot nguoi co phong ban chinh (${moTa})`,
				moTa.includes(CHU.phongBanChinh) && moTa.includes(TEN.P1),
			);
		}
		kiem(
			"E2 buoc 6: trang mot nguoi co 2 muc tieu (P1a, P3a)",
			(await demSel(n, "[data-muc-tieu]")) === 2,
		);
		await chup(n, ten);
		await n.close();
	}
}

async function focusDau(t, nhan) {
	await t.evaluate((n) => {
		const e = document.querySelector(
			`[role='tree'][aria-label='${n}'] [tabindex='0']`,
		);
		if (e instanceof HTMLElement) e.focus();
	}, nhan);
	await cho(150);
}

const dangCo = (t) =>
	t.evaluate(() => {
		const e = document.activeElement;
		return {
			khoa:
				e?.getAttribute("data-cay-khoa") ??
				e?.getAttribute("data-nut-cay") ??
				null,
			level: e?.getAttribute("aria-level") ?? null,
		};
	});

async function buocCay() {
	const t = await moTrang(cookie.truongP1, RONG, theoDonVi("xemOkr=cay"));
	await hienSel(t, `[role='tree'][aria-label='${CHU.cayCanChinh}']`);
	const hang = () =>
		t.evaluate(
			(n) =>
				[
					...document.querySelectorAll(
						`[role='tree'][aria-label='${n}'] [role='treeitem']`,
					),
				].map((e) => e.getAttribute("data-cay-khoa")),
			CHU.cayCanChinh,
		);
	kiem(
		"E5: dung mot phan tu tabindex=0 trong cay can chinh",
		(await demSel(
			t,
			`[role='tree'][aria-label='${CHU.cayCanChinh}'] [tabindex='0']`,
		)) === 1,
	);
	const b1 = await demSel(t, `[data-nut-can-chinh='${OKR.B1.id}']`);
	kiem(`E5: B1 gop hai cho phai hien hai lan (thay ${b1})`, b1 === 2);
	kiem(
		"E5: lan hien thu hai ghi cung hien o cho gop kia",
		(
			await chuSel(t, `[role='tree'][aria-label='${CHU.cayCanChinh}']`)
		).includes(CHU.cungHien),
	);
	await chup(t, "E5-buoc-cay-1.png");

	await focusDau(t, CHU.cayCanChinh);
	const ds = await hang();
	const buoc = [["tab", await dangCo(t)]];
	for (const k of [
		"ArrowDown",
		"ArrowDown",
		"ArrowLeft",
		"ArrowRight",
		"Home",
		"End",
	]) {
		await t.keyboard.press(k);
		await cho(200);
		buoc.push([k, await dangCo(t)]);
	}
	const sauHang = await hang();
	kiem(
		`E5: ArrowDown di tung dong (hang ${ds.slice(0, 3)}, buoc ${JSON.stringify(buoc.slice(0, 3))})`,
		buoc[0][1].khoa === ds[0] &&
			buoc[1][1].khoa === ds[1] &&
			buoc[2][1].khoa === ds[2],
	);
	kiem(
		`E5: ArrowLeft gap hoac ve cha, ArrowRight mo lai (${JSON.stringify(buoc.slice(3, 5))})`,
		buoc[3][1].khoa !== null && buoc[4][1].khoa !== null,
	);
	kiem(
		`E5: Home ve dong dau, End ve dong cuoi nhin thay (${JSON.stringify(buoc.slice(5))}, hang ${sauHang.length})`,
		buoc[5][1].khoa === sauHang[0] &&
			buoc[6][1].khoa === sauHang[sauHang.length - 1],
	);
	await chup(t, "E5-buoc-cay-2.png");

	await focusDau(t, CHU.cayCanChinh);
	await t.keyboard.press("Enter");
	await doi(t, "E5: Enter tren muc tieu mo sheet", () =>
		new URL(location.href).searchParams.get("record")?.startsWith("objective:"),
	);
	await chup(t, "E5-buoc-cay-3.png", false);
	await t.close();

	const u = await moTrang(cookie.truongP1, RONG, theoDonVi());
	await hienSel(u, `[role='tree'][aria-label='${CHU.cayDonVi}']`);
	await focusDau(u, CHU.cayDonVi);
	await u.keyboard.press("ArrowDown");
	await cho(200);
	const toi = await dangCo(u);
	await u.keyboard.press("Enter");
	await doi(
		u,
		`E5: Enter tren don vi doi URL donOkr sang ${toi.khoa}`,
		(k) => new URL(location.href).searchParams.get("donOkr") === k,
		toi.khoa,
	);
	await chup(u, "E5-buoc-cay-4.png");
	await u.close();
}

async function buocToanCanh() {
	const api = await hoi(cookie.chiOkr, "okr.toanCanh", { cycleId: OKR.quy });
	const o = await moTrang(cookie.chiOkr, RONG, `/okr/toan-canh?${ky()}`);
	await hienSel(o, "[data-hang-toan-canh]");
	const thuTu = await o.evaluate(() =>
		[...document.querySelectorAll("[data-hang-toan-canh]")].map((e) =>
			e.getAttribute("data-hang-toan-canh"),
		),
	);
	kiem(
		"E10: thu tu hang tren man bang thu tu API",
		JSON.stringify(thuTu) === JSON.stringify(api.hang.map((h) => h.key)),
	);
	kiem("E10: co the so", (await demSel(o, "[data-slot='stat-card']")) >= 2);
	const theSo = await chuSel(o, "[data-slot='stat-card']");
	kiem(
		`E10: muc tieu vua cong bo khong in «le ra da toi 0%» ma noi chua co ky vong (thay: ${theSo})`,
		api.tongQuan.kyVong !== 0 ||
			(theSo.includes(CHU.vuaCongBo) && !theSo.includes("0%")),
	);
	kiem(
		"E10: ky vong 0 thi thanh khong ve vach",
		api.hang.some((h) => h.kyVong !== null && h.kyVong > 0) ||
			(await demSel(o, "[data-hang-toan-canh] [data-expected]")) === 0,
	);
	kiem(
		"E10: thanh tien do trung tinh, khong bg-primary",
		(await demSel(o, "[data-slot='progress'][data-variant='neutral']")) > 0 &&
			(await demSel(o, "[data-hang-toan-canh] .bg-primary")) === 0,
	);
	kiem(
		"E10: vai chi OKR khong thay nut suc khoe",
		!(await coSel(o, "[data-nut='suc-khoe']")),
	);
	await chup(o, "E10-buoc-toan-canh-1.png");
	await o.close();

	const a = await moTrang(cookie.admin, RONG, `/okr/toan-canh?${ky()}`);
	await hienSel(a, "[data-hang-toan-canh]");
	kiem(
		"E10: quan tri thay nut suc khoe",
		await coSel(a, "[data-nut='suc-khoe']"),
	);
	await chup(a, "E10-buoc-toan-canh-2.png");
	kiem(
		"E10: heatmap co mot hang moi don vi va cot tuan hien tai",
		(await coSel(a, "[data-khoi='heatmap'] [data-current]")) &&
			(await demSel(a, "[data-khoi='heatmap'] tbody tr")) === api.hang.length,
	);
	await chupKhoi(a, "[data-khoi='heatmap']", "E10-buoc-heatmap.png");

	await a.setRequestInterception(true);
	let chan = true;
	const chanTc = (r) => {
		if (r.isInterceptResolutionHandled()) return;
		if (chan && r.url().includes("okr.toanCanh"))
			void r.respond({
				status: 500,
				contentType: "text/plain",
				body: "chan boi man-toan-canh",
			});
		else void r.continue();
	};
	a.on("request", chanTc);
	await bamChu(a, "button[aria-label='Chu kỳ'], [aria-label='Chu kỳ']", "");
	await cho(400);
	await bamChu(a, "[role='option']", `Năm ${NAM}`);
	if (await hienSel(a, "[data-trang-thai='ST-toancanh-loi']")) {
		await chup(a, "E10-buoc-toan-canh-4.png");
		chan = false;
		await bamChu(a, "[data-trang-thai='ST-toancanh-loi'] button", CHU.thuLai);
		await hienSel(a, "[data-trang-thai='ST-toancanh-tuandau']");
		kiem(
			"E10: ky nam chua co muc tieu cong bo hien trang thai tuan dau",
			(await chuSel(a, "[data-trang-thai='ST-toancanh-tuandau']")).includes(
				CHU.tuanDau,
			),
		);
		await chup(a, "E10-buoc-toan-canh-5.png");
	}
	a.off("request", chanTc);
	await a.setRequestInterception(false);
	await a.close();

	const h = await moTrang(cookie.admin, HEP, `/okr/toan-canh?${ky()}`);
	await hienSel(h, "[data-hang-toan-canh]");
	await chup(h, "E10-buoc-toan-canh-3.png");
	await h.close();
}

async function buocSucKhoe() {
	const api = await hoi(cookie.admin, "okr.sucKhoe", { cycleId: OKR.quy });
	const a = await moTrang(cookie.admin, RONG, `/okr/toan-canh?${ky()}`);
	await hienSel(a, "[data-nut='suc-khoe']");
	await bamChu(a, "[data-nut='suc-khoe']", CHU.suKhoe);
	await hienSel(a, "[data-trang-thai='ST-suckhoe-codulieu']");
	const chu = await chuSel(a, "[data-trang-thai='ST-suckhoe-codulieu']");
	kiem(
		"E21: co cot KR cua muc tieu chua cong bo",
		chu.includes(CHU.chuaCongBo),
	);
	kiem(
		"E21: khong dung chu thieu khoi diem tran",
		!chu.includes(CHU.thieuKhoiDiem),
	);
	const hangP1 = api.hang.find((h) => h.key === `pb:${ORG.P1}`);
	const soP1 = [
		hangP1?.tongKr,
		hangP1?.dungTuan,
		hangP1?.krIm,
		hangP1?.chuaKhoiDiem,
		hangP1?.chuaNoiKenh,
	];
	const oP1 = await a.evaluate(
		(k) =>
			[...document.querySelectorAll(`[data-hang-suc-khoe='${k}'] td`)].map(
				(td) => td.textContent?.trim(),
			),
		`pb:${ORG.P1}`,
	);
	kiem(
		`E21: hang P1 tren man khop API (man ${oP1.slice(1)}, api ${soP1})`,
		JSON.stringify(oP1.slice(1)) === JSON.stringify(soP1.map(String)),
	);
	kiem(
		"E21: phong ban khong truong ghi Chua co truong",
		(await chuSel(a, `[data-hang-suc-khoe='pb:${ORG.P2}']`)).includes(
			CHU.chuaCoTruong,
		),
	);
	kiem(
		"E21: breadcrumb ve Toan canh",
		(await chuSel(a, "nav[aria-label='breadcrumb']")).includes(CHU.toanCanhTab),
	);
	await chup(a, "E21-buoc-suc-khoe-1.png");
	await a.setViewport({ width: HEP, height: CAO });
	await cho(700);
	await chup(a, "E21-buoc-suc-khoe-2.png");
	await a.close();

	const k = await moTrang(cookie.k, RONG, `/okr/toan-canh/suc-khoe?${ky()}`);
	await hienSel(k, "[data-trang-thai='ST-suckhoe-khongquyen']");
	kiem(
		"E21: thanh vien thuong thay cau chi quan tri",
		(await chuSel(k, "[data-trang-thai='ST-suckhoe-khongquyen']")).includes(
			CHU.khongQuyen,
		),
	);
	await chup(k, "E21-buoc-suc-khoe-3.png");
	await k.close();
}

async function bamSel(trang, sel) {
	await trang.bringToFront();
	const el = await trang.$(sel);
	if (!el) return kiem(`khong thay ${sel} de bam`, false);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
	return true;
}

const vetMoHop = () =>
	db.okrTrail.findMany({
		where: { cycleId: OKR.quy, action: "mo-hop-tuan" },
		select: {
			actorUserId: true,
			objectiveId: true,
			keyResultId: true,
			after: true,
		},
	});

async function taiLai(t) {
	await t.reload({ waitUntil: "load" });
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(CHO_HYDRATE_MS);
}

async function buocHopTuan() {
	const [Ka, Kb, Kc] = OKR.H.kr;
	const api = await hoi(cookie.truongP1, "okr.hopTuan", {
		cycleId: OKR.quy,
		unit: { loai: "pb", id: ORG.P1 },
	});
	kiem(
		`E14: API xep dang ban Ka, Kb, Kc (thay ${api.dangBan.map((d) => d.tieuDe)})`,
		JSON.stringify(api.dangBan.map((d) => d.keyResultId)) ===
			JSON.stringify([Ka, Kb, Kc]),
	);
	const dem0 = (await vetMoHop()).length;
	const t = await moTrang(
		cookie.truongP1,
		RONG,
		theoDonVi(`donOkr=pb:${ORG.P1}&xemOkr=hop-tuan`),
	);
	await hienSel(t, "[data-trang-thai='ST-hoptuan-codulieu']");
	const thuTu = await t.evaluate(() =>
		[...document.querySelectorAll("[data-kr-hop]")].map((e) =>
			e.getAttribute("data-kr-hop"),
		),
	);
	kiem(
		`E14: thu tu dong tren man bang thu tu API (man ${thuTu.length} dong)`,
		JSON.stringify(thuTu) ===
			JSON.stringify(api.dangBan.map((d) => d.keyResultId)),
	);
	const lyDo = (kr) => chuSel(t, `[data-kr-hop='${kr}'] [data-ly-do]`);
	kiem(
		"E14: Ka ghi Tu tin tut: Cao → Thap",
		(await lyDo(Ka)).includes(CHU.tutCaoThap),
	);
	kiem("E14: Kb ghi Im 16 ngay", (await lyDo(Kb)).includes(CHU.im16));
	kiem("E14: Kc ghi Ghi chu moi", (await lyDo(Kc)).includes(CHU.ghiChuMoi));
	kiem(
		"E14: ghi chu moi nhat hien nguyen van",
		(await chuSel(t, `[data-kr-hop='${Kc}']`)).includes("Đối tác lùi lịch ký"),
	);
	await chup(t, "E14-buoc-hop-1.png");

	await cho(1000);
	const sau1 = await vetMoHop();
	kiem(
		`E28: sau lan mo dau co dung 1 dong moi (thay ${sau1.length - dem0})`,
		sau1.length - dem0 === 1,
	);
	const d = sau1.at(-1);
	kiem(
		`E28: dong mo-hop-tuan dung hinh (thay ${JSON.stringify(d)})`,
		d?.actorUserId === id.truongP1 &&
			d?.objectiveId === null &&
			d?.keyResultId === null &&
			d?.after?.donVi === `pb:${ORG.P1}` &&
			d?.after?.tuan === tuanNayVN(),
	);
	await taiLai(t);
	await hienSel(t, "[data-trang-thai='ST-hoptuan-codulieu']");
	await bamChu(t, "[role='radio']", CHU.danhSach);
	await hienSel(t, "[data-muc-tieu]");
	await bamChu(t, "[role='radio']", CHU.hopTuan);
	await hienSel(t, "[data-trang-thai='ST-hoptuan-codulieu']");
	await cho(1500);
	kiem(
		"E28: tai lai va doi cach xem trong cua gop khong sinh them dong",
		(await vetMoHop()).length - dem0 === 1,
	);

	await bamChu(t, "[data-con-lai] button", CHU.conLai);
	await doi(
		t,
		"E14: mo Con lai hien them dong",
		(n) => document.querySelectorAll("[data-kr-hop]").length > n,
		thuTu.length,
	);
	await chup(t, "E14-buoc-hop-2.png");

	await bamSel(t, `[data-mo-kr='${Ka}']`);
	await doi(t, "E17: tab Dien bien ve bieu do", () =>
		document.querySelector("[data-trang-thai='ST-dienbien-so']"),
	);
	kiem(
		"E17: URL mo tab dien-bien cua Ka",
		thamSo(t, "tab") === "dien-bien" && thamSo(t, "krOkr") === Ka,
	);
	await doi(
		t,
		"E17: bieu do co duong gia tri va duong le ra dut",
		() =>
			document.querySelectorAll(
				"[data-trang-thai='ST-dienbien-so'] .recharts-line",
			).length >= 2,
	);
	kiem(
		"E17: vach dich co nhan",
		(await chuSel(t, "[data-trang-thai='ST-dienbien-so']")).includes(CHU.dich),
	);
	kiem(
		"E17: day muc tu tin co muc Thap",
		(await chuSel(t, "[data-day-tu-tin]")).includes(CHU.thap),
	);
	await chup(t, "E17-buoc-dien-bien-1.png", false);
	await bamSel(t, "[data-chon-kr]");
	await bamChu(t, "[role='option']", TEN.Kb);
	await doi(t, "E17: KR chua cap nhat hien cau rieng", () =>
		document.querySelector("[data-trang-thai='ST-dienbien-chuaco']"),
	);
	await chup(t, "E17-buoc-dien-bien-2.png", false);
	await t.close();

	const h = await moTrang(
		cookie.truongP1,
		HEP,
		theoDonVi(`donOkr=pb:${ORG.P1}&xemOkr=hop-tuan`),
	);
	await hienSel(h, "[data-trang-thai='ST-hoptuan-codulieu']");
	await chup(h, "E14-buoc-hop-3.png");
	await h.close();
}

async function buocTongQuan() {
	const api = await hoi(cookie.k, "okr.khoiCuaToi", {
		cycleId: OKR.quy,
		userId: null,
	});
	const k = await moTrang(cookie.k, RONG, "");
	await hienSel(k, "[data-khoi='okr-cua-toi'] [data-kr-cua-toi]");
	const dong = await k.evaluate(() =>
		[...document.querySelectorAll("[data-kr-cua-toi]")].map((e) =>
			e.getAttribute("data-kr-cua-toi"),
		),
	);
	kiem(
		`E19: khoi OKR cua ban dung thu tu API (man ${dong.length}, api ${api.kr.length})`,
		JSON.stringify(dong) === JSON.stringify(api.kr.map((d) => d.keyResultId)),
	);
	kiem(
		"E19: the viec cua luot 4 van con tren Tong quan",
		await coSel(k, "[data-viec-okr], [data-viec-okr-rong]"),
	);
	kiem(
		"E19: khoi co nut Mo OKR",
		await coSel(k, "[data-khoi='okr-cua-toi'] [data-nut='mo-okr']"),
	);
	await chup(k, "E19-buoc-tong-quan-1.png");
	await chupKhoi(k, "[data-khoi='okr-cua-toi']", "E19-buoc-khoi-okr.png");
	await k.setViewport({ width: HEP, height: CAO });
	await cho(700);
	await chup(k, "E19-buoc-tong-quan-2.png");
	await k.close();

	const o = await moTrang(cookie.chiOkr, RONG, "");
	await hienSel(o, "[data-khoi='okr-cua-toi']");
	kiem(
		"E19: vai chi OKR chua phu trach KR thay cau rieng",
		await coSel(
			o,
			"[data-khoi='okr-cua-toi'][data-trang-thai='ST-tongquan-rong']",
		),
	);
	kiem(
		"E19: vai chi OKR van co the viec cua luot 4",
		await coSel(o, "[data-viec-okr], [data-viec-okr-rong]"),
	);
	await chup(o, "E19-buoc-tong-quan-3.png");
	await o.close();

	const n = await moTrang(
		cookie.admin,
		RONG,
		theoDonVi(`donOkr=nguoi:${id.k}`),
	);
	await hienSel(
		n,
		"[data-khoi='okr-cua-toi'][data-trang-thai='ST-nguoi-codulieu']",
	);
	await chup(n, "E19-buoc-nguoi-1.png");
	await n.close();
}

async function buocChuKy() {
	const t = await moTrang(
		cookie.truongP1,
		RONG,
		`/okr/theo-don-vi?donOkr=pb:${ORG.P1}`,
	);
	await hienSel(t, "[data-chon-chu-ky]");
	await bamSel(t, "[data-chon-chu-ky]");
	await doi(t, "E23: menu chu ky mo", () =>
		document.querySelector("[role='option']"),
	);
	const muc = await t.evaluate(() =>
		[...document.querySelectorAll("[role='option']")].map((o) =>
			o.textContent?.replace(/\s+/g, " ").trim(),
		),
	);
	kiem(
		`E23: ky dang chay mang chu hien tai (thay ${muc})`,
		muc.some(
			(x) => x.startsWith(`Quý ${QUY}/${NAM} ${MA}`) && x.includes(CHU.hienTai),
		),
	);
	kiem("E23: nhom theo nam co nhan nam", await coSel(t, "[role='group']"));
	await chup(t, "E23-buoc-chu-ky-1.png", false);
	trpc.length = 0;
	await bamChu(t, "[role='option']", TEN_KY_KHAC);
	await doi(
		t,
		"E23: URL doi sang ky khac",
		(k) => new URL(location.href).searchParams.get("kyOkr") === k,
		OKR.quy2,
	);
	await hienSel(t, `[data-muc-tieu='${OKR.Q2}']`);
	kiem(
		"E23: danh sach khong con muc tieu cua ky dang chay",
		!(await coSel(t, `[data-muc-tieu='${OKR.P1a.id}']`)),
	);
	await chup(t, "E23-buoc-chu-ky-2.png");
	await bamChu(t, "[role='radio']", CHU.hopTuan);
	await hienSel(t, "[data-trang-thai^='ST-hoptuan-']");
	await bamChu(t, "a", CHU.toanCanhTab);
	await hienSel(t, "[data-trang-thai^='ST-toancanh-']");
	await cho(800);
	kiem("E23: tab Toan canh giu ky da chon", thamSo(t, "kyOkr") === OKR.quy2);
	await chup(t, "E23-buoc-chu-ky-3.png");
	const loiGoi = trpc.flatMap((u) => {
		const url = new URL(u);
		const ten = decodeURIComponent(
			url.pathname.split("/api/trpc/")[1] ?? "",
		).split(",");
		const vao = JSON.parse(url.searchParams.get("input") ?? "{}");
		return ten.map((t2, i) => [t2, vao[String(i)]]);
	});
	const theoThuTuc = (ten) =>
		loiGoi.filter(([t2]) => t2 === ten).map(([, v]) => v?.cycleId);
	for (const ten of ["okr.danhSach", "okr.hopTuan"]) {
		const ky = theoThuTuc(ten);
		kiem(
			`E29: moi loi goi ${ten} mang cycleId ky da chon (thay ${ky})`,
			ky.length > 0 && ky.every((c) => c === OKR.quy2),
		);
	}
	const kyToanCanh = theoThuTuc("okr.toanCanh");
	kiem(
		`E29: okr.toanCanh khong goi voi ky dang chay (thay ${kyToanCanh})`,
		kyToanCanh.every((c) => c === OKR.quy2),
	);
	await t.close();
}

let ma = 0;
try {
	await gieo();
	for (const [ten, fn] of [
		["loc", buocLoc],
		["cay", buocCay],
		["toan-canh", buocToanCanh],
		["suc-khoe", buocSucKhoe],
		["hop-tuan", buocHopTuan],
		["tong-quan", buocTongQuan],
		["chu-ky", buocChuKy],
	]) {
		try {
			await fn();
		} catch (e) {
			hong.push(`${ten}: nem ${String(e).slice(0, 300)}`);
		}
	}
} catch (e) {
	hong.push(`gieo: nem ${String(e).slice(0, 400)}`);
} finally {
	await donDep().catch((e) => hong.push(`don dep: ${String(e).slice(0, 200)}`));
	const conKy = await db.okrCycle.count();
	if (conKy > 0) hong.push(`don dep: con ${conKy} chu ky trong kho`);
	writeFileSync(join(BANG_CHUNG, "man-toan-canh-network.txt"), mang.join("\n"));
	console.log(
		`man-toan-canh: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh`,
	);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
}
await ket(ma);
