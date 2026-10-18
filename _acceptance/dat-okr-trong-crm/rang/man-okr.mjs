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
	join(GOC, ".acceptance-runs", "dat-okr-trong-crm", "evidence");
const RONG = 1440;
const HEP = 390;
const CAO = 900;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const MA = `d${Date.now().toString(36).slice(-6)}`;
const LOI_HYDRATE = /hydrat/i;
const DEAL = "seed-deal-wise-1";

const CHU = {
	chuaChuKy: "Quản trị chưa mở chu kỳ",
	chuaTruong: "Gán trưởng ở Cài đặt › Tổ chức",
	rongBody: "Trưởng đơn vị thêm từng mục tiêu",
	cuaToiRong: "Bạn chưa phụ trách mục tiêu hay KR nào",
	cayCanChinh: "Cây căn chỉnh",
	danhSach: "Danh sách",
	quayLai: "Quay lại",
	nhap: "Nháp",
	daCongBo: "Đã công bố",
	congBo: "Công bố",
	sua: "Sửa",
	daKhoa: "Đã khoá khi công bố",
	vet: "Vết",
	thuLai: "Thử lại",
	kieuLa:
		"Cột kiểu chỉ nhận: tăng tới, giảm xuống, giữ trên, giữ dưới, mốc, phần trăm",
	emailLa: "Email này chưa là thành viên OneHub Center",
	daCo: "đã có trong OneHub Center",
	tomTat: "3 dòng hợp lệ · 2 dòng hỏng",
	nutGhi: "Ghi 3 dòng · bỏ 2 dòng hỏng",
	khongGhi: "Không có dòng nào để ghi",
	ketQua: "2 mục tiêu, 3 KR",
	dong: "Đóng",
	chuKy: "Chu kỳ",
	cauHinh: "Cấu hình",
	chuongTrinhOkr: "Chương trình OKR",
	quy: "Quý",
	daLuu: "Đã lưu",
	khongQuyen: "Chỉ quản trị đổi được cấu hình chương trình.",
	donVi: "Đơn vị",
	tenDeal: "Wise — expansion",
};

mkdirSync(BANG_CHUNG, { recursive: true });

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

const chuKySan = await db.okrCycle.count();
if (chuKySan > 0)
	await khongDo(
		`KHONG DO DUOC: tien de thieu — kho da co ${chuKySan} chu ky OKR ngoai fixture.`,
		"    Man-okr can kho khong co chu ky nao de chup ca «chua mo chu ky» va gieo quy dang chay khong chong ngay.",
	);
const phienBanSan =
	(await db.okrProgramConfig.aggregate({ _max: { version: true } }))._max
		.version ?? 0;
const dealSan = await db.deal.findUnique({
	where: { id: DEAL },
	select: { name: true },
});
if (dealSan === null)
	await khongDo(`KHONG DO DUOC: tien de thieu — khong co thoa thuan ${DEAL}.`);

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
	truong: { email: `t${MA}@thu.test`, vai: "member", ten: "Phạm Thu Lan" },
	truong2: { email: `h${MA}@thu.test`, vai: "member", ten: "Vũ Thanh Hà" },
	thuong: { email: `m${MA}@thu.test`, vai: "member", ten: "Đỗ Quang Minh" },
};
const cookie = {};
const id = {};
for (const [k, n] of Object.entries(NGUOI)) {
	cookie[k] = phienCua(n.email);
	id[k] = await datNguoi(n.email, n.vai, n.ten);
}
const slug = await suySlug(cookie.admin);

const TEN = {
	bp: "Khối Kinh doanh",
	pb1: "Phòng Đối tác",
	pb2: "Phòng Vận hành",
	pb3: "Phòng Pháp chế",
	pb4: "Phòng Tuyển dụng",
	o1: "Mở rộng mạng lưới đối tác toàn OneHub",
	o2: "Khối Kinh doanh tăng doanh thu từ đối tác",
	o3: "Phòng Đối tác ký thêm thoả thuận mới",
	o4: "Chuẩn hoá quy trình nhận đối tác mới",
	o5: "Rút ngắn thời gian vận hành cho đối tác",
	o6: "Xây nền quan hệ đối tác cả năm",
	k4: "Viết quy trình nhận đối tác một trang",
	k5: "Thời gian bàn giao đối tác mới",
	krMoi: "Gặp mười đối tác tiềm năng",
	nhapA: "Tăng độ phủ đối tác phía Bắc",
	nhapB: "Nâng chất lượng hồ sơ đối tác",
};

const homNay = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
const NAM = Number(homNay.slice(0, 4));
const QUY = Math.ceil(Number(homNay.slice(5, 7)) / 3);
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const KY = {
	nam: `Năm ${NAM}`,
	quy: `Quý ${QUY}/${NAM}`,
	namSau: `Năm ${NAM + 1}`,
	quySau: `Quý 1/${NAM + 1}`,
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

async function gieoToChuc() {
	ORG.bp = (await lam(cookie.admin, "org.createDivision", { name: TEN.bp })).id;
	for (const k of ["pb1", "pb2", "pb3", "pb4"]) {
		ORG[k] = (
			await lam(cookie.admin, "org.createDepartment", {
				name: TEN[k],
				divisionId: ORG.bp,
			})
		).id;
	}
	const choNgoi = [
		[id.truong, ORG.pb1, []],
		[id.thuong, ORG.pb1, []],
		[id.truong2, ORG.pb2, [ORG.pb4]],
	];
	for (const [userId, pb, phu] of choNgoi)
		await lam(cookie.admin, "org.setPlacement", {
			userId,
			primaryDepartmentId: pb,
			secondaryDepartmentIds: phu,
			managerUserId: null,
		});
	const truong = [
		["division", ORG.bp, id.admin],
		["department", ORG.pb1, id.truong],
		["department", ORG.pb2, id.truong2],
		["department", ORG.pb4, id.truong2],
	];
	for (const [kind, donId, userId] of truong)
		await lam(cookie.admin, "org.setHead", { kind, id: donId, userId });
}

async function taoChuKy(c, vao) {
	await lam(c, "okr.createCycle", vao);
	const ds = await hoi(c, "okr.cycles");
	return ds.cycles.find((x) => x.name === vao.name).id;
}

async function taoMucTieu(c, vao, krs) {
	const mt = await lam(c, "okr.createObjective", {
		participantIds: [],
		whyNow: "",
		kind: "cam-ket",
		...vao,
	});
	const kr = [];
	for (const k of krs) {
		kr.push(
			(
				await lam(c, "okr.createKeyResult", {
					objectiveId: mt.id,
					kind: "tang-toi",
					startValue: 0,
					currentValue: 0,
					dueOn: null,
					weight: 1,
					...k,
				})
			).id,
		);
	}
	return { id: mt.id, kr };
}

async function gieoOkr() {
	OKR.nam = await taoChuKy(cookie.admin, {
		kind: "nam",
		name: KY.nam,
		parentId: null,
		startsOn: ngay(NAM, 1, 1),
		endsOn: ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	OKR.quy = await taoChuKy(cookie.admin, {
		kind: "quy",
		name: KY.quy,
		parentId: OKR.nam,
		startsOn: ngay(NAM, QUY * 3 - 2, 1),
		endsOn: ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: OKR.quy,
		phase: "dang-chay",
	});

	const o1 = await taoMucTieu(
		cookie.admin,
		{
			cycleId: OKR.quy,
			unit: { level: "onehub" },
			title: TEN.o1,
			ownerUserId: id.admin,
		},
		[
			{
				title: "Số đối tác đang hoạt động",
				ownerUserId: id.admin,
				targetValue: 120,
				currentValue: 45,
				unit: "đối tác",
			},
		],
	);
	await lam(cookie.admin, "okr.publishObjective", { id: o1.id });
	const o2 = await taoMucTieu(
		cookie.admin,
		{
			cycleId: OKR.quy,
			unit: { level: "bo-phan", divisionId: ORG.bp },
			title: TEN.o2,
			ownerUserId: id.admin,
		},
		[
			{
				title: "Doanh thu từ đối tác mới",
				ownerUserId: id.admin,
				targetValue: 800,
				currentValue: 260,
				unit: "triệu đồng",
			},
		],
	);
	await lam(cookie.admin, "okr.publishObjective", { id: o2.id });
	await lam(cookie.admin, "okr.addAlignment", {
		objectiveId: o2.id,
		targetObjectiveId: o1.id,
		targetKeyResultId: null,
	});
	const o3 = await taoMucTieu(
		cookie.truong,
		{
			cycleId: OKR.quy,
			unit: { level: "phong-ban", departmentId: ORG.pb1 },
			title: TEN.o3,
			ownerUserId: id.truong,
		},
		[
			{
				title: "Thoả thuận mới được ký",
				ownerUserId: id.truong,
				targetValue: 40,
				currentValue: 14,
				unit: "thoả thuận",
			},
			{
				title: "Tỉ lệ đối tác trả lời trong 48 giờ",
				kind: "phan-tram",
				ownerUserId: id.truong,
				targetValue: 90,
				currentValue: 62,
				unit: "%",
			},
		],
	);
	await lam(cookie.truong, "okr.publishObjective", { id: o3.id });
	await lam(cookie.truong, "okr.addAlignment", {
		objectiveId: o3.id,
		targetObjectiveId: null,
		targetKeyResultId: o2.kr[0],
	});
	const o4 = await taoMucTieu(
		cookie.truong,
		{
			cycleId: OKR.quy,
			unit: { level: "phong-ban", departmentId: ORG.pb1 },
			title: TEN.o4,
			ownerUserId: id.truong,
		},
		[
			{
				title: TEN.k4,
				kind: "moc",
				ownerUserId: id.truong,
				startValue: 0,
				targetValue: 1,
				unit: "",
			},
		],
	);
	const o5 = await taoMucTieu(
		cookie.truong2,
		{
			cycleId: OKR.quy,
			unit: { level: "phong-ban", departmentId: ORG.pb2 },
			title: TEN.o5,
			ownerUserId: id.truong2,
			participantIds: [id.truong],
		},
		[
			{
				title: TEN.k5,
				kind: "giam-xuong",
				ownerUserId: id.truong,
				startValue: 10,
				currentValue: 7,
				targetValue: 3,
				unit: "ngày",
			},
			{
				title: "Hồ sơ đối tác đủ giấy tờ ngay lần đầu",
				kind: "phan-tram",
				ownerUserId: id.truong2,
				targetValue: 95,
				currentValue: 70,
				unit: "%",
			},
		],
	);
	await lam(cookie.truong2, "okr.publishObjective", { id: o5.id });
	await lam(cookie.truong2, "okr.addAlignment", {
		objectiveId: o5.id,
		targetObjectiveId: o2.id,
		targetKeyResultId: null,
	});
	const o6 = await taoMucTieu(
		cookie.truong,
		{
			cycleId: OKR.nam,
			unit: { level: "phong-ban", departmentId: ORG.pb1 },
			title: TEN.o6,
			ownerUserId: id.truong,
		},
		[
			{
				title: "Đối tác chiến lược ký cả năm",
				ownerUserId: id.truong,
				targetValue: 12,
				unit: "đối tác",
			},
		],
	);
	Object.assign(OKR, { o1, o2, o3, o4, o5, o6 });
}

async function donDep() {
	const moiNguoi = Object.values(id);
	const moiKy = (await db.okrCycle.findMany({ select: { id: true } })).map(
		(c) => c.id,
	);
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
	await db.okrKeyResult.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: moiMt } } });
	await db.okrCycle.deleteMany({
		where: { id: { in: moiKy }, kind: "quy" },
	});
	await db.okrCycle.deleteMany({ where: { id: { in: moiKy } } });
	await db.okrProgramConfig.deleteMany({
		where: { version: { gt: phienBanSan } },
	});
	const moiPb = ["pb1", "pb2", "pb3", "pb4"].map((k) => ORG[k]).filter(Boolean);
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
	await db.department.deleteMany({ where: { id: { in: moiPb } } });
	if (ORG.bp) await db.division.deleteMany({ where: { id: ORG.bp } });
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
const mang = { E11: [], E12: [], E15: [], E20: [] };
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function moTrang(c, rong, duong, nhom) {
	const trang = await trinhDuyet.newPage();
	const ghi = (d) => mang[nhom].push(`${new Date().toISOString()} ${d}`);
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 300)}`);
		if (LOI_HYDRATE.test(String(e)))
			hong.push(`${nhom} ${duong}: loi hydrat ${String(e).slice(0, 200)}`);
	});
	trang.on("console", (m) => {
		if (m.type() !== "error") return;
		ghi(`console.error ${m.text().slice(0, 300)}`);
		if (LOI_HYDRATE.test(m.text()))
			hong.push(`${nhom} ${duong}: loi hydrat ${m.text().slice(0, 200)}`);
	});
	trang.on("requestfailed", (r) =>
		ghi(`requestfailed ${r.url()} ${r.failure()?.errorText ?? ""}`),
	);
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

// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
const MUC_NHAP = "[role='menuitem'][data-nut='nhap-bang-tinh']";

async function moMenuThem(trang) {
	await trang.bringToFront();
	const coNut = await trang
		.waitForSelector("[data-nut='them-cach']", { timeout: CHO })
		.then(() => true)
		.catch(() => false);
	if (!coNut) return false;
	await trang.$eval("[data-nut='them-cach']", (e) =>
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
	return trang
		.waitForSelector(MUC_NHAP, { timeout: CHO })
		.then(() => true)
		.catch(() => false);
}

async function dongMenuThem(trang) {
	await trang.keyboard.press("Escape");
	await cho(200);
}

const mucNhapMo = (trang) =>
	trang.evaluate((s) => {
		const e = document.querySelector(s);
		return e !== null && !e.hasAttribute("data-disabled");
	}, MUC_NHAP);

async function moNhap(trang, nhan) {
	const mo = kiem(
		`${nhan}: nut «…» khong mo duoc muc Nhap tu bang tinh`,
		await moMenuThem(trang),
	);
	if (!mo) return false;
	await trang.$eval(MUC_NHAP, (e) => e.click());
	return true;
}

async function bamSel(trang, sel) {
	await trang.bringToFront();
	let loi = null;
	for (let lan = 0; lan < 3; lan += 1) {
		const e = await trang.$(sel);
		if (!e) {
			await cho(500);
			continue;
		}
		try {
			await e.click();
			return true;
		} catch (err) {
			loi = err;
			await cho(500);
		}
	}
	return kiem(`khong bam duoc ${sel}${loi ? `: ${loi.message}` : ""}`, false);
}

async function chonTuySelect(trang, triggerSel, chu) {
	if (!(await bamSel(trang, triggerSel))) return false;
	await doi(trang, `menu cua ${triggerSel}`, () =>
		document.querySelector("[role='option']"),
	);
	const tay = await trang.evaluateHandle(
		(c) =>
			[...document.querySelectorAll("[role='option']")].find((o) =>
				o.textContent?.replace(/\s+/g, " ").trim().startsWith(c),
			) ?? null,
		chu,
	);
	const el = tay.asElement();
	if (!el) {
		await trang.keyboard.press("Escape");
		return kiem(`khong co lua chon «${chu}» trong ${triggerSel}`, false);
	}
	await el.click();
	await cho(300);
	return true;
}

const trenCung = async (trang, sel) => {
	await trang
		.waitForFunction(
			(s) =>
				document
					.querySelector(s)
					?.getAnimations({ subtree: true })
					.every((a) => a.playState !== "running") ?? true,
			{ timeout: CHO, polling: 100 },
			sel,
		)
		.catch(() => null);
	return trang.evaluate((s) => {
		const e = document.querySelector(s);
		if (!e) return false;
		const r = e.getBoundingClientRect();
		const o = document.elementFromPoint(r.left + r.width / 2, r.top + 24);
		return o !== null && e.contains(o);
	}, sel);
};

const khongTran = (trang) =>
	trang.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);

async function chup(trang, ten, toanTrang = false) {
	kiem(`${ten}: tran ngang`, await khongTran(trang));
	await cho(250);
	await trang.screenshot({ path: join(BANG_CHUNG, ten), fullPage: toanTrang });
	anh.push(ten);
}

async function doiRong(trang, rong) {
	await trang.setViewport({ width: rong, height: CAO });
	await cho(700);
}

const theoDonVi = (don, them = "") =>
	`/okr/theo-don-vi${don ? `?donOkr=${don}${them}` : them ? `?${them.slice(1)}` : ""}`;

async function byUnit(c, don) {
	return hoi(c, "okr.byUnit", { cycleId: OKR.quy, unit: don });
}

/* trang-don-vi-mot-bang (AC-14): ô chọn đơn vị có tìm kiếm thay cây — mở ô
   chọn rồi bấm lựa chọn theo tên đơn vị. */
const LUA_CHON = "[cmdk-item]";
async function chonDon(trang, ten) {
	await bamSel(trang, "[data-chon-don-vi]");
	await hienSel(trang, LUA_CHON);
	return bamChu(trang, LUA_CHON, ten);
}

async function buocE11ChuaChuKy() {
	const a = await moTrang(cookie.admin, RONG, theoDonVi(), "E11");
	if (await hienSel(a, "[data-trang-thai='ST-donvi-chuakychay']")) {
		const chu = await chuSel(a, "[data-trang-thai='ST-donvi-chuakychay']");
		kiem(
			`E11 buoc 9 quan tri: thieu cau «${CHU.chuaChuKy}»`,
			chu.includes(CHU.chuaChuKy),
		);
		kiem(
			"E11 buoc 9 quan tri: thieu lien ket toi Cai dat OKR",
			await a.evaluate(
				(s) =>
					[
						...document.querySelectorAll(
							"[data-trang-thai='ST-donvi-chuakychay'] a",
						),
					].some((x) => x.getAttribute("href") === `/${s}/settings/okr`),
				slug,
			),
		);
	}
	await chup(a, "E11-step9.png", true);
	await a.close();
	const m = await moTrang(cookie.thuong, RONG, theoDonVi(), "E11");
	if (await hienSel(m, "[data-trang-thai='ST-donvi-chuakychay']")) {
		const chu = await chuSel(m, "[data-trang-thai='ST-donvi-chuakychay']");
		kiem(
			`E11 buoc 9 thanh vien: thieu cau «${CHU.chuaChuKy}»`,
			chu.includes(CHU.chuaChuKy),
		);
		kiem(
			"E11 buoc 9 thanh vien: khong duoc co lien ket",
			(await demSel(m, "[data-trang-thai='ST-donvi-chuakychay'] a")) === 0,
		);
	}
	await chup(m, "E11-step9-thanh-vien.png", true);
	await m.close();
}

async function buocE11() {
	const pb = (k) => `pb:${ORG[k]}`;
	const t = await moTrang(cookie.truong, RONG, theoDonVi(), "E11");
	await hienSel(t, "[data-chon-don-vi]");
	await bamSel(t, "[data-chon-don-vi]");
	await hienSel(t, LUA_CHON);
	const nut = await t.evaluate(() =>
		[...document.querySelectorAll("[cmdk-item]")].map((e) =>
			(([ten, goiY]) =>
				goiY?.textContent?.startsWith("cả công ty")
					? "goc"
					: (ten?.textContent?.trim() ?? ""))(
				e.querySelectorAll(":scope > span"),
			),
		),
	);
	// Ô chọn không mang khoá đơn vị trên DOM: đổi tên lựa chọn ra khoá như nút cây cũ.
	const khoaTheoTen = new Map([
		[TEN.bp, `bp:${ORG.bp}`],
		...["pb1", "pb2", "pb3", "pb4"].map((k) => [TEN[k], pb(k)]),
	]);
	for (const [i, ten] of nut.entries()) nut[i] = khoaTheoTen.get(ten) ?? ten;
	const canCo = [
		"goc",
		`bp:${ORG.bp}`,
		pb("pb1"),
		pb("pb2"),
		pb("pb3"),
		pb("pb4"),
	];
	kiem(
		`E11 buoc 1: cay thieu nut ${canCo.filter((k) => !nut.includes(k)).join(",")} (co ${nut.length})`,
		canCo.every((k) => nut.includes(k)),
	);
	const dem = await hoi(cookie.truong, "okr.countByUnit", { cycleId: OKR.quy });
	const demPb1 = dem[pb("pb1")] ?? 0;
	const chuPb1 = await t.evaluate(
		(ten) =>
			[...document.querySelectorAll("[cmdk-item]")]
				.find(
					(e) => e.querySelector(":scope > span")?.textContent?.trim() === ten,
				)
				?.textContent?.replace(/\s+/g, " ")
				.trim() ?? "",
		TEN.pb1,
	);
	kiem(
		`E11 buoc 1: so dem canh ${TEN.pb1} phai «${demPb1} mục tiêu», thay «${chuPb1}»`,
		demPb1 > 0 && chuPb1.endsWith(`${demPb1} mục tiêu`),
	);
	await chup(t, "E11-step1.png", true);

	await bamChu(t, LUA_CHON, TEN.pb1);
	await hienSel(t, `[data-muc-tieu='${OKR.o3.id}']`);
	kiem(
		`E11 buoc 2: URL phai co donOkr=${pb("pb1")}, thay ${thamSo(t, "donOkr")}`,
		thamSo(t, "donOkr") === pb("pb1"),
	);
	await bamSel(t, `[data-mo-dong='${OKR.o3.id}']`);
	await hienSel(t, `[data-kr='${OKR.o3.kr[0]}']`);
	// AC-14 loi-hua-moi: trang-don-vi-mot-bang AC-3 — KR la dong con cung 4 cot cua bang don vi, khong con bang KR rieng trong the.
	const cot = await t.evaluate(
		(id) =>
			[
				...(document
					.querySelector(`[data-muc-tieu='${id}']`)
					?.closest("table")
					?.querySelectorAll("thead th") ?? []),
			].filter((th) => !th.querySelector(".sr-only")).length,
		OKR.o3.id,
	);
	kiem(`E11 buoc 2: thead bang KR phai 4 cot, thay ${cot}`, cot === 4);
	await chup(t, "E11-step2.png", true);

	await bamChu(t, "[role='radio']", CHU.cayCanChinh);
	if (await hienSel(t, "[data-trang-thai='ST-donvi-caycanchinh']")) {
		const dong = await t.evaluate(() =>
			[...document.querySelectorAll("[data-nut-can-chinh]")].map((r) => ({
				cap:
					Number(
						r.closest("[role='treeitem']")?.getAttribute("aria-level") ?? 0,
					) - 1,
				chu: r.textContent ?? "",
				le: r.getBoundingClientRect().left,
			})),
		);
		const goc = dong.find((d) => d.cap === 0 && d.chu.includes(TEN.o1));
		const thut = dong.find((d) => d.cap >= 1 && d.chu.includes(TEN.o2));
		kiem("E11 buoc 3: cay khong co dong muc tieu OneHub o cap 0", Boolean(goc));
		kiem(
			"E11 buoc 3: cay khong co dong thut le cho muc tieu bo phan",
			Boolean(goc && thut && thut.le > goc.le),
		);
		kiem(
			`E11 buoc 3: URL phai co xemOkr=cay, thay ${thamSo(t, "xemOkr")}`,
			thamSo(t, "xemOkr") === "cay",
		);
	}
	await chup(t, "E11-step3.png", true);
	await bamChu(t, "[role='radio']", CHU.danhSach);
	await hienSel(t, `[data-muc-tieu='${OKR.o3.id}']`);

	await chonTuySelect(t, "[data-chon-chu-ky]", KY.nam);
	await hienSel(t, `[data-muc-tieu='${OKR.o6.id}']`);
	kiem(
		"E11 buoc 4: doi sang chu ky nam ma van con the muc tieu cua quy",
		!(await coSel(t, `[data-muc-tieu='${OKR.o3.id}']`)),
	);
	await chup(t, "E11-step4.png", true);
	await chonTuySelect(t, "[data-chon-chu-ky]", KY.quy);
	await hienSel(t, `[data-muc-tieu='${OKR.o3.id}']`);

	kiem(
		"E11 buoc 5: truong phong ban thieu nut Them muc tieu",
		await coSel(t, "[data-nut='them-muc-tieu']"),
	);
	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	kiem(
		"E11 buoc 5: truong phong ban thieu nut Nhap tu bang tinh",
		(await moMenuThem(t)) && (await mucNhapMo(t)),
	);
	await dongMenuThem(t);
	const m = await moTrang(cookie.thuong, RONG, theoDonVi(pb("pb1")), "E11");
	await hienSel(m, `[data-muc-tieu='${OKR.o3.id}']`);
	kiem(
		"E11 buoc 5: thanh vien thuong khong thay dong ly do khoa",
		await hienSel(m, "[data-ly-do-khu]"),
	);
	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	const nutLo = await m.evaluate(() =>
		[...document.querySelectorAll("[data-nut='them-muc-tieu']")]
			.filter((b) => !b.disabled)
			.map((b) => b.textContent?.trim()),
	);
	if (await moMenuThem(m)) {
		if (await mucNhapMo(m)) nutLo.push("Nhap tu bang tinh");
		await dongMenuThem(m);
	}
	kiem(
		`E11 buoc 5: thanh vien thuong thay nut ${nutLo.join(", ")}`,
		nutLo.length === 0,
	);
	await chup(m, "E11-step5.png", true);
	await m.close();
	await t.bringToFront();

	await chonDon(t, TEN.pb4);
	if (await hienSel(t, "[data-trang-thai='ST-donvi-rong']")) {
		const chu = await chuSel(t, "[data-trang-thai='ST-donvi-rong']");
		kiem(
			`E11 buoc 6: Empty phong ban co truong phai noi «${CHU.rongBody}», thay «${chu}»`,
			chu.includes(TEN.pb4) && chu.includes(CHU.rongBody),
		);
	}
	await chup(t, "E11-step6.png", true);

	await chonDon(t, TEN.pb3);
	await doi(
		t,
		"E11 buoc 7: Empty phong ban chua truong",
		(ten) =>
			document
				.querySelector("[data-trang-thai='ST-donvi-rong']")
				?.textContent?.includes(ten),
		TEN.pb3,
	);
	const chu7 = await chuSel(t, "[data-trang-thai='ST-donvi-rong']");
	kiem(
		`E11 buoc 7: thieu cau «${CHU.chuaTruong}», thay «${chu7}»`,
		chu7.includes(CHU.chuaTruong),
	);
	await chup(t, "E11-step7.png", true);

	let chan = true;
	await t.setRequestInterception(true);
	const chanByUnit = (r) => {
		if (r.isInterceptResolutionHandled()) return;
		if (chan && r.url().includes("okr.danhSach"))
			void r.respond({
				status: 500,
				contentType: "text/plain",
				body: "chan boi man-okr",
			});
		else void r.continue();
	};
	t.on("request", chanByUnit);
	await chonDon(t, TEN.pb2);
	if (await hienSel(t, "[data-trang-thai='ST-donvi-loi']")) {
		kiem(
			"E11 buoc 8: Empty loi thieu nut Thu lai",
			(await chuSel(t, "[data-trang-thai='ST-donvi-loi'] button")).includes(
				CHU.thuLai,
			),
		);
	}
	await chup(t, "E11-step8-loi.png", true);
	chan = false;
	await bamChu(t, "[data-trang-thai='ST-donvi-loi'] button", CHU.thuLai);
	await hienSel(t, `[data-muc-tieu='${OKR.o5.id}']`);
	t.off("request", chanByUnit);
	await t.setRequestInterception(false);
	await chup(t, "E11-step8.png", true);
	await t.close();

	const c = await moTrang(cookie.truong, RONG, "/okr", "E11");
	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	const P3 = "[data-trang-thai='ST-cuatoi-codulieu']";
	if (await hienSel(c, P3)) {
		for (const o of ["o3", "o4", "o5"])
			kiem(
				`E11 buoc 10: Cua toi thieu KR cua muc tieu ${TEN[o]}`,
				await coSel(c, `${P3} [data-mo-muc-tieu='${OKR[o].id}']`),
			);
		kiem(
			"E11 buoc 10: KR cua truong o phong ban khac khong co trong KR ban phu trach",
			await coSel(
				c,
				`${P3} [data-kr='${OKR.o5.kr[0]}'] [data-mo-muc-tieu='${OKR.o5.id}']`,
			),
		);
		// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
		kiem(
			"E11 buoc 10: KR cua truong2 lot vao KR ban phu trach",
			!(await coSel(c, `${P3} [data-kr='${OKR.o5.kr[1]}']`)),
		);
	}
	await chup(c, "E11-step10.png", true);
	await c.close();

	const r = await moTrang(cookie.thuong, RONG, "/okr", "E11");
	if (await hienSel(r, "[data-trang-thai='ST-cuatoi-rong']")) {
		kiem(
			`E11 buoc 11: thieu cau «${CHU.cuaToiRong}»`,
			(await chuSel(r, "[data-trang-thai='ST-cuatoi-rong']")).includes(
				CHU.cuaToiRong,
			),
		);
		kiem(
			"E11 buoc 11: thieu lien ket sang Theo don vi",
			await r.evaluate(
				(s) =>
					[
						...document.querySelectorAll(
							"[data-trang-thai='ST-cuatoi-rong'] a",
						),
					].some((a) =>
						a.getAttribute("href")?.startsWith(`/${s}/okr/theo-don-vi`),
					),
				slug,
			),
		);
	}
	await chup(r, "E11-step11.png", true);
	await r.close();

	const tc = await moTrang(cookie.truong, RONG, "/okr/toan-canh", "E11");
	await hienSel(tc, "[data-trang-thai^='ST-toancanh-']");
	kiem(
		"E11 buoc 12: Toan canh phai la man that cua luot 5, khong con o giu cho",
		!(await coSel(tc, "[data-trang-thai='ST-toancanh']")),
	);
	await chup(tc, "E11-step12.png", true);
	await tc.close();

	const h = await moTrang(cookie.truong, HEP, theoDonVi(pb("pb1")), "E11");
	await hienSel(h, `[data-muc-tieu='${OKR.o3.id}']`);
	kiem(
		"E11 buoc 13: o 390 cay van la nav",
		!(await coSel(h, `nav[aria-label='${CHU.donVi}']`)),
	);
	kiem(
		"E11 buoc 13: o 390 thieu Select don vi",
		await coSel(h, `button[role='combobox'][aria-label='${CHU.donVi}']`),
	);
	await chup(h, "E11-step13.png", true);
	await h.close();
}

async function kiemKhongDich(trang, nhan, sel, chu) {
	const co = await trang.evaluate(
		(s, c) =>
			[
				...document.querySelectorAll(
					`${s} [translate='no'], ${s}[translate='no']`,
				),
			].some((e) => e.textContent?.includes(c)),
		sel,
		chu,
	);
	kiem(`${nhan}: «${chu}» khong nam trong translate=no`, co);
}

async function nutQuayLai(trang) {
	return trang.evaluateHandle(
		(chu) =>
			[...document.querySelectorAll("[data-slot='sheet-content'] button")].find(
				(b) => b.querySelector(".sr-only")?.textContent === chu,
			) ?? null,
		CHU.quayLai,
	);
}

async function buocE12() {
	const o4 = OKR.o4.id;
	const t = await moTrang(
		cookie.truong,
		RONG,
		`/deals?record=deal:${DEAL}`,
		"E12",
	);
	await doi(
		t,
		"E12 buoc 1: sheet Thoa thuan seed",
		(ten) =>
			document
				.querySelector("[data-slot='sheet-title'],[data-slot='drawer-title']")
				?.textContent?.includes(ten),
		dealSan.name,
	);
	await t.goto(`${APP}/${slug}/deals?record=deal:${DEAL},objective:${o4}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	const sheet = `[data-okr-sheet='${o4}']`;
	await doi(
		t,
		"E12 buoc 1: sheet muc tieu chong len",
		(s) => document.querySelector(`${s} [data-slot='sheet-title']`),
		sheet,
	);
	await cho(CHO_HYDRATE_MS);
	kiem(
		`E12 buoc 1: stack URL phai deal roi objective, thay ${thamSo(t, "record")}`,
		thamSo(t, "record") === `deal:${DEAL},objective:${o4}`,
	);
	kiem(
		"E12 buoc 1: thieu nut Quay lai",
		(await nutQuayLai(t)).asElement() !== null,
	);
	kiem(
		"E12 buoc 1: tieu de sheet khong phai ten muc tieu",
		(await chuSel(t, `${sheet} [data-slot='sheet-title']`)) === TEN.o4,
	);
	const moTa = await chuSel(t, `${sheet} [data-slot='sheet-description']`);
	kiem(
		`E12 buoc 1: dong duoi tieu de phai «${TEN.pb1} · ${KY.quy}», thay «${moTa}»`,
		moTa === `${TEN.pb1} · ${KY.quy}`,
	);
	kiem(
		"E12 buoc 1: thieu huy hieu Nhap",
		(await chuSel(t, `${sheet} [data-slot='sheet-header']`)).includes(CHU.nhap),
	);
	const tab = await t.evaluate(
		(s) =>
			[...document.querySelectorAll(`${s} [role='tab']`)].map((e) =>
				e.textContent?.trim(),
			),
		sheet,
	);
	kiem(
		`E12 buoc 1: ba tab dau phai KR/Can chinh/Vet (tab thu tu neu co la Trao doi, tab thu nam neu co la Dien bien), thay ${JSON.stringify(tab)}`,
		tab.length >= 3 &&
			tab.length <= 5 &&
			tab[0].startsWith("KR") &&
			tab[1].startsWith("Căn chỉnh") &&
			tab[2].startsWith(CHU.vet) &&
			(tab.length < 4 || tab[3].startsWith("Trao đổi")) &&
			(tab.length < 5 || tab[4].startsWith("Diễn biến")),
	);
	await chup(t, "E12-step1.png");
	await doiRong(t, HEP);
	await chup(t, "E12-step2.png");
	await doiRong(t, RONG);

	const truocKr = (await hoi(cookie.truong, "okr.objective", { id: o4 }))
		.keyResults.length;
	await bamSel(t, `${sheet} [data-nut='them-kr']`);
	const hop = "[data-hop-thoai-kr='moi']";
	if (await hienSel(t, hop)) {
		await t.type(`${hop} input[maxlength='200']`, TEN.krMoi);
		await t.click(`${hop} [data-o-dich]`);
		await t.type(`${hop} [data-o-dich]`, "10");
		await t.type(`${hop} input[maxlength='24']`, "đối tác");
		kiem(
			"E12 buoc 3: o khoi diem phai mac dinh 0",
			(await t.$eval(`${hop} [data-o-khoi-diem]`, (e) => e.value)) === "0",
		);
		await doi(
			t,
			"E12 buoc 3: nut them KR bat",
			(s) =>
				document.querySelector(`${s} [data-nut='gui-kr']`)?.disabled === false,
			hop,
		);
		await bamSel(t, `${hop} [data-nut='gui-kr']`);
		await doi(
			t,
			"E12 buoc 3: bang KR them dong",
			(s, n) =>
				!document.querySelector("[data-hop-thoai-kr='moi']") &&
				document.querySelectorAll(`${s} [data-kr-hang]`).length === n,
			sheet,
			truocKr + 1,
		);
	}
	const sau3 = await hoi(cookie.truong, "okr.objective", { id: o4 });
	kiem(
		`E13: so KR tu API phai ${truocKr + 1}, thay ${sau3.keyResults.length}`,
		sau3.keyResults.length === truocKr + 1,
	);
	kiem(
		`E13: API khong co KR «${TEN.krMoi}»`,
		sau3.keyResults.some((k) => k.title === TEN.krMoi && k.targetValue === 10),
	);
	await kiemKhongDich(
		t,
		"E12 translate",
		`${sheet} [data-slot='sheet-title']`,
		TEN.o4,
	);
	await kiemKhongDich(t, "E12 translate", `${sheet} [data-kr-hang]`, TEN.krMoi);
	await kiemKhongDich(
		t,
		"E12 translate",
		`${sheet} [data-kr-hang]`,
		NGUOI.truong.ten,
	);
	await kiemKhongDich(t, "E12 translate", `${sheet} [data-kr-hang]`, "đối tác");
	await chup(t, "E12-step3.png");

	await bamSel(t, `${sheet} [data-nut='cong-bo']`);
	if (await hienSel(t, "[role='alertdialog']")) {
		await bamChu(t, "[role='alertdialog'] button", CHU.congBo);
		await doi(
			t,
			"E12 buoc 4: sheet sang Da cong bo",
			(s) =>
				document.querySelector(`${s}`)?.getAttribute("data-trang-thai") ===
					"ST-sheet-congbo" && !document.querySelector("[role='alertdialog']"),
			sheet,
		);
	}
	kiem(
		"E12 buoc 4: thieu huy hieu Da cong bo",
		(await chuSel(t, `${sheet} [data-slot='sheet-header']`)).includes(
			CHU.daCongBo,
		),
	);
	const sau4 = await hoi(cookie.truong, "okr.objective", { id: o4 });
	kiem(
		`E13: status tu API phai cong-bo, thay ${sau4.status}`,
		sau4.status === "cong-bo",
	);
	await chup(t, "E12-step4.png");

	await bamSel(t, `button[aria-label='Thao tác với ${TEN.k4}']`);
	await doi(t, "E12 buoc 5: menu KR", () =>
		document.querySelector("[role='menuitem']"),
	);
	await bamChu(t, "[role='menuitem']", CHU.sua);
	const hopSua = `[data-hop-thoai-kr='${OKR.o4.kr[0]}']`;
	if (await hienSel(t, hopSua)) {
		const khoi = await t.$eval(`${hopSua} [data-o-khoi-diem]`, (e) => ({
			tat: e.disabled,
			moTa:
				document.getElementById(e.getAttribute("aria-describedby") ?? "")
					?.textContent ?? "",
		}));
		kiem("E12 buoc 5: o khoi diem sau cong bo phai disabled", khoi.tat);
		kiem(
			`E12 buoc 5: chu thich o khoi diem phai «${CHU.daKhoa}», thay «${khoi.moTa}»`,
			khoi.moTa === CHU.daKhoa,
		);
	}
	await chup(t, "E12-step5.png");
	await t.keyboard.press("Escape");
	await doi(
		t,
		"E12 buoc 5: dong hop KR",
		(s) => !document.querySelector(s),
		hopSua,
	);

	await bamChu(t, `${sheet} [role='tab']`, CHU.vet);
	await doi(
		t,
		"E12 buoc 6: tab Vet co >= 3 dong",
		(s) => document.querySelectorAll(`${s} [data-vet-hang]`).length >= 3,
		sheet,
	);
	await chup(t, "E12-step6.png");

	const lui = (await nutQuayLai(t)).asElement();
	if (kiem("E12 buoc 7: thieu nut Quay lai", lui !== null)) await lui.click();
	await doi(
		t,
		"E12 buoc 7: ve sheet Thoa thuan",
		(ten) =>
			!document.querySelector("[data-okr-sheet]") &&
			document
				.querySelector("[data-slot='sheet-title'],[data-slot='drawer-title']")
				?.textContent?.includes(ten),
		dealSan.name,
	);
	kiem(
		`E12 buoc 7: URL phai record=deal:${DEAL}, thay ${thamSo(t, "record")}`,
		thamSo(t, "record") === `deal:${DEAL}`,
	);
	await chup(t, "E12-step7.png");
	await t.close();

	for (const [rong, ten] of [
		[RONG, "E12-step8.png"],
		[HEP, "E12-step9.png"],
	]) {
		const d = await moTrang(
			cookie.truong,
			rong,
			theoDonVi(`pb:${ORG.pb1}`, `&record=deal:${DEAL}`),
			"E12",
		);
		await doi(
			d,
			`E12 ${ten}: sheet Thoa thuan tren Theo don vi`,
			(tenDeal) =>
				document
					.querySelector("[data-slot='sheet-title'],[data-slot='drawer-title']")
					?.textContent?.includes(tenDeal) &&
				document.querySelector("[data-nut='them-muc-tieu']"),
			dealSan.name,
		);
		await d.evaluate(() =>
			document.querySelector("[data-nut='them-muc-tieu']")?.click(),
		);
		if (await hienSel(d, "[data-hop-thoai-muc-tieu='moi']")) {
			kiem(
				`E12 ${ten}: sheet Thoa thuan dong mat khi mo hop muc tieu`,
				thamSo(d, "record") === `deal:${DEAL}`,
			);
			kiem(
				`E12 ${ten}: hop muc tieu khong nam tren cung`,
				await trenCung(d, "[data-hop-thoai-muc-tieu='moi']"),
			);
		}
		await chup(d, ten);
		await d.close();
	}

	for (const [rong, ten] of [
		[RONG, "E12-step10.png"],
		[HEP, "E12-step11.png"],
	]) {
		const k = await moTrang(
			cookie.truong,
			rong,
			`/deals?record=deal:${DEAL},objective:${OKR.o3.id}`,
			"E12",
		);
		const sheet3 = `[data-okr-sheet='${OKR.o3.id}']`;
		await hienSel(k, `${sheet3} [data-nut='them-kr']`);
		await bamSel(k, `${sheet3} [data-nut='them-kr']`);
		if (await hienSel(k, "[data-hop-thoai-kr='moi']"))
			kiem(
				`E12 ${ten}: hop KR khong nam tren cung`,
				await trenCung(k, "[data-hop-thoai-kr='moi']"),
			);
		await chup(k, ten);
		await k.close();
	}
}

const LO = [
	[
		TEN.nhapA,
		"Đối tác mới ở Hà Nội",
		"tăng tới",
		"0",
		"12",
		"đối tác",
		NGUOI.truong.email,
	],
	[
		TEN.nhapA,
		"Đối tác mới ở Hải Phòng",
		"tăng tới",
		"0",
		"6",
		"đối tác",
		NGUOI.truong2.email,
	],
	[
		TEN.nhapB,
		"Hồ sơ đủ giấy tờ",
		"phần trăm",
		"40",
		"90",
		"%",
		NGUOI.truong.email,
	],
	[
		TEN.nhapB,
		"Hồ sơ duyệt trong ngày",
		"tăng vọt",
		"0",
		"10",
		"hồ sơ",
		NGUOI.truong.email,
	],
	[
		TEN.nhapB,
		"Hồ sơ có người kèm",
		"tăng tới",
		"0",
		"20",
		"hồ sơ",
		`khong-co-${MA}@thu.test`,
	],
];
const chuLo = (dong) => dong.map((d) => d.join("\t")).join("\n");

async function danLo(trang, dong) {
	const o = "[data-hop-thoai-nhap-okr] textarea";
	await trang.$eval(o, (e) => {
		e.focus();
		e.select();
	});
	if ((await trang.$eval(o, (e) => e.value)) !== "")
		await trang.keyboard.press("Backspace");
	await trang.keyboard.sendCharacter(chuLo(dong));
	await cho(200);
	const giu = await trang.$eval(o, (e) => e.value);
	kiem(
		"E20: textarea khong giu ky tu tab that sau khi go",
		giu === chuLo(dong) && giu.includes("\t"),
	);
	await bamSel(trang, "[data-nut='xem-truoc']");
	return hienSel(trang, "[data-buoc-nhap='2']");
}

async function buocE20() {
	const don = { loai: "pb", id: ORG.pb1 };
	const truoc = await byUnit(cookie.truong, don);
	const t = await moTrang(
		cookie.truong,
		RONG,
		theoDonVi(`pb:${ORG.pb1}`),
		"E20",
	);
	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	await hienSel(t, "[data-muc-tieu]");
	await hienSel(t, "[data-nut='them-cach']");
	const demTheTruoc = await demSel(t, "[data-muc-tieu]");
	await moNhap(t, "E20");
	if (await hienSel(t, "[data-buoc-nhap='1']")) {
		const dien = await t.evaluate(() =>
			[
				...document.querySelectorAll("[data-buoc-nhap='1'] input[disabled]"),
			].map((e) => e.value),
		);
		kiem(
			`E20 buoc 1: chu ky va don vi phai dien san «${KY.quy}», «${TEN.pb1}», thay ${JSON.stringify(dien)}`,
			dien[0] === KY.quy && dien[1] === TEN.pb1,
		);
	}
	await chup(t, "E20-step1.png");

	if (await danLo(t, LO)) {
		const tom = await chuSel(t, "[data-tom-tat]");
		kiem(
			`E20 buoc 2: tom tat phai «${CHU.tomTat}», thay «${tom}»`,
			tom.includes(CHU.tomTat),
		);
		const dongHong = await t.evaluate(() =>
			[...document.querySelectorAll("[data-dong-hong]")].map((e) =>
				e.textContent?.trim(),
			),
		);
		const canCo = [`Dòng 4: ${CHU.kieuLa}`, `Dòng 5: ${CHU.emailLa}`];
		kiem(
			`E20 buoc 2: dong hong phai ${JSON.stringify(canCo)}, thay ${JSON.stringify(dongHong)}`,
			JSON.stringify(dongHong) === JSON.stringify(canCo),
		);
		kiem(
			"E20 buoc 2: bang phai 2 dong data-hong=co va 3 dong khong",
			(await demSel(t, "[data-hong='co']")) === 2 &&
				(await demSel(t, "[data-hong='khong']")) === 3,
		);
		kiem(
			"E20 buoc 2: thieu o Cong bo ngay",
			await coSel(t, "[data-cong-bo-ngay]"),
		);
		const nhan = await chuSel(t, "[data-nut='ghi-lo']");
		kiem(
			`E20 buoc 2: nut ghi phai «${CHU.nutGhi}», thay «${nhan}»`,
			nhan === CHU.nutGhi,
		);
	}
	await chup(t, "E20-step2.png");

	await bamSel(t, "[data-nut='ghi-lo']");
	if (await hienSel(t, "[data-buoc-nhap='3']"))
		kiem(
			`E20 buoc 3: ket qua phai noi «${CHU.ketQua}»`,
			(await chuSel(t, "[data-buoc-nhap='3']")).includes(CHU.ketQua),
		);
	await chup(t, "E20-step3.png");

	const sau = await byUnit(cookie.truong, don);
	const soKr = (ds) =>
		ds.objectives.reduce((n, o) => n + o.keyResults.length, 0);
	kiem(
		`E21: so muc tieu tu API phai tang 2 (${truoc.objectives.length} -> ${sau.objectives.length})`,
		sau.objectives.length === truoc.objectives.length + 2,
	);
	const moi = sau.objectives.filter(
		(o) => !truoc.objectives.some((x) => x.id === o.id),
	);
	kiem(
		`E21: hai muc tieu moi phai mang ten vua dan, thay ${JSON.stringify(moi.map((o) => o.title))}`,
		[TEN.nhapA, TEN.nhapB].every((ten) => moi.some((o) => o.title === ten)),
	);
	kiem(
		`E21: tong KR phai tang 3 (${soKr(truoc)} -> ${soKr(sau)})`,
		soKr(sau) === soKr(truoc) + 3,
	);
	const mtMoi = moi.find((o) => o.title === TEN.nhapA);
	if (mtMoi) {
		const chiTiet = await hoi(cookie.truong, "okr.objective", { id: mtMoi.id });
		kiem(
			"E21: vet cua muc tieu vua nhap thieu dong tao",
			chiTiet.trail.some((v) => v.action === "tao"),
		);
	}
	const vetLo = await db.okrTrail.findFirst({
		where: { cycleId: OKR.quy, action: "nhap-bang-tinh" },
		orderBy: { at: "desc" },
	});
	kiem(
		`E21: bang vet thieu dong nhap-bang-tinh voi after.objectives 2, thay ${JSON.stringify(vetLo?.after ?? null)}`,
		vetLo?.after?.objectives === 2 && vetLo?.after?.keyResults === 3,
	);

	await bamChu(t, "[data-hop-thoai-nhap-okr] button", CHU.dong);
	await doi(
		t,
		"E20 buoc 3: danh sach them 2 the",
		(n) => document.querySelectorAll("[data-muc-tieu]").length === n,
		demTheTruoc + 2,
	);

	// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
	await moNhap(t, "E20 lan 2");
	await hienSel(t, "[data-buoc-nhap='1']");
	if (await danLo(t, LO.slice(3))) {
		const nut = await t.$eval("[data-nut='ghi-lo']", (e) => ({
			tat: e.disabled,
			chu: e.textContent?.trim(),
		}));
		kiem("E20 buoc 4: nut ghi phai disabled khi 0 dong hop le", nut.tat);
		kiem(
			`E20 buoc 4: nhan nut ghi phai «${CHU.khongGhi}», thay «${nut.chu}»`,
			nut.chu === CHU.khongGhi,
		);
	}
	await chup(t, "E20-step4.png");

	await bamChu(t, "[data-hop-thoai-nhap-okr] button", CHU.quayLai);
	await hienSel(t, "[data-buoc-nhap='1']");
	if (await danLo(t, LO.slice(0, 3))) {
		const dong = await t.evaluate(() =>
			[...document.querySelectorAll("[data-dong-hong]")].map((e) =>
				e.textContent?.trim(),
			),
		);
		kiem(
			`E20 buoc 5: moi dong phai «${CHU.daCo}», thay ${JSON.stringify(dong)}`,
			dong.length === 3 && dong.every((d) => d.includes(CHU.daCo)),
		);
	}
	await chup(t, "E20-step5.png");
	await t.close();

	for (const [rong, ten] of [
		[RONG, "E20-step6.png"],
		[HEP, "E20-step7.png"],
	]) {
		const d = await moTrang(
			cookie.truong,
			rong,
			theoDonVi(`pb:${ORG.pb1}`, `&record=deal:${DEAL}`),
			"E20",
		);
		// ve-sinh-do-san-onehub cach-toi: thuoc DH1 ca99a6162 (Nhap tu bang tinh la muc menu «…» — AC-4/AC-5 DH1; Cua toi theo AC-6 DH3), gom vao vong ve-sinh theo Dieu phoi M5.
		await doi(
			d,
			`E20 ${ten}: sheet Thoa thuan tren Theo don vi`,
			(tenDeal) =>
				document
					.querySelector("[data-slot='sheet-title'],[data-slot='drawer-title']")
					?.textContent?.includes(tenDeal) &&
				document.querySelector("[data-hang-hanh-dong]"),
			dealSan.name,
		);
		await d.evaluate(() => {
			const u = new URL(window.location.href);
			u.searchParams.set("nhapOkr", "true");
			window.history.pushState(null, "", u);
		});
		if (await hienSel(d, "[data-buoc-nhap='1']")) await danLo(d, LO);
		kiem(
			`E20 ${ten}: sheet Thoa thuan dong mat khi mo hop nhap`,
			thamSo(d, "record") === `deal:${DEAL}`,
		);
		kiem(
			`E20 ${ten}: hop nhap khong nam tren cung`,
			await trenCung(d, "[data-hop-thoai-nhap-okr]"),
		);
		await chup(d, ten);
		await d.close();
	}
}

async function chonNgay(trang, nutSel, ngayChon) {
	await bamSel(trang, nutSel);
	await doi(trang, `lich cua ${nutSel}`, () =>
		document.querySelector("[data-slot='popover-content'] select"),
	);
	const [y, m] = ngayChon.split("-").map(Number);
	const chon = await trang.evaluate(() =>
		[...document.querySelectorAll("[data-slot='popover-content'] select")].map(
			(s) => [...s.options].map((o) => o.value),
		),
	);
	const iNam = chon.findIndex((ds) => ds.includes(String(y)));
	const iThang = chon.findIndex((ds, i) => i !== iNam && ds.length === 12);
	const sel = (i) => `[data-slot='popover-content'] select[data-thu-tu='${i}']`;
	await trang.evaluate(() =>
		[
			...document.querySelectorAll("[data-slot='popover-content'] select"),
		].forEach((s, i) => {
			s.setAttribute("data-thu-tu", String(i));
		}),
	);
	await trang.select(sel(iNam), String(y));
	await cho(200);
	await trang.evaluate(() =>
		[
			...document.querySelectorAll("[data-slot='popover-content'] select"),
		].forEach((s, i) => {
			s.setAttribute("data-thu-tu", String(i));
		}),
	);
	await trang.select(sel(iThang), String(m - 1));
	await cho(200);
	await bamSel(
		trang,
		`[data-slot='popover-content'] [data-day='${ngayChon}'] button, [data-slot='popover-content'] button[data-day='${ngayChon}']`,
	);
	await doi(
		trang,
		`dong lich ${nutSel}`,
		() => !document.querySelector("[data-slot='popover-content'] select"),
	);
}

async function buocE15() {
	const namSau = await taoChuKy(cookie.admin, {
		kind: "nam",
		name: KY.namSau,
		parentId: null,
		startsOn: ngay(NAM + 1, 1, 1),
		endsOn: ngay(NAM + 1, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const ctTruoc = await hoi(cookie.admin, "okr.program");
	const a = await moTrang(cookie.admin, RONG, "/settings/okr", "E15");
	await hienSel(a, "[data-the='chu-ky'] [data-chu-ky]");
	kiem(
		`E15 buoc 1: thanh ben thieu muc «${CHU.chuongTrinhOkr}»`,
		await a.evaluate(
			(s, c) =>
				[...document.querySelectorAll("a")].some(
					(x) =>
						x.getAttribute("href") === `/${s}/settings/okr` &&
						x.textContent?.trim() === c,
				),
			slug,
			CHU.chuongTrinhOkr,
		),
	);
	const tieuDe = async (tr) =>
		tr.evaluate(() =>
			[...document.querySelectorAll("main [data-slot='card-title']")].map((e) =>
				e.textContent?.trim(),
			),
		);
	const td = await tieuDe(a);
	kiem(
		`E15 buoc 1: hai CardTitle dau phai la Chu ky, Cau hinh, thay ${JSON.stringify(td)}`,
		td.length >= 2 && td[0] === CHU.chuKy && td[1] === CHU.cauHinh,
	);
	const dongTruoc = await demSel(a, "[data-chu-ky]");
	kiem(
		`E15 buoc 1: bang chu ky phai co dong, thay ${dongTruoc}`,
		dongTruoc >= 3,
	);
	kiem(
		"E15 buoc 1: nut Luu phai disabled luc dau",
		await a.$eval("[data-nut='luu-cau-hinh']", (e) => e.disabled),
	);
	await chup(a, "E15-step1.png", true);

	await bamSel(a, "[data-nut='mo-chu-ky']");
	if (await hienSel(a, "[data-sheet-mo-chu-ky]")) {
		kiem(
			`E15 buoc 2: URL phai co moChuKy=true, thay ${thamSo(a, "moChuKy")}`,
			thamSo(a, "moChuKy") === "true",
		);
		kiem(
			"E15 buoc 2: nut gui phai disabled khi chua hop le",
			await a.$eval("[data-nut='gui-chu-ky']", (e) => e.disabled),
		);
	}
	await chup(a, "E15-step2.png");

	const sheet = "[data-sheet-mo-chu-ky]";
	const hop = await a.evaluate(
		(s) =>
			[...document.querySelectorAll(`${s} button[role='combobox']`)].map(
				(b) => b.id,
			),
		sheet,
	);
	await chonTuySelect(a, `[id='${hop[0]}']`, CHU.quy);
	await a.type(`${sheet} [data-o-ten]`, KY.quySau);
	const hopNam = await a.evaluate(
		(s) =>
			[...document.querySelectorAll(`${s} button[role='combobox']`)].map(
				(b) => b.id,
			),
		sheet,
	);
	await chonTuySelect(a, `[id='${hopNam[1]}']`, KY.namSau);
	const lich = await a.evaluate(
		(s) =>
			[
				...document.querySelectorAll(`${s} [data-slot='date-picker-trigger']`),
			].map((b) => b.id),
		sheet,
	);
	await chonNgay(a, `[id='${lich[0]}']`, ngay(NAM + 1, 1, 1));
	await chonNgay(a, `[id='${lich[1]}']`, ngay(NAM + 1, 3, 31));
	await doi(
		a,
		"E15 buoc 3: nut gui bat sau khi dien du",
		() => document.querySelector("[data-nut='gui-chu-ky']")?.disabled === false,
	);
	await bamSel(a, "[data-nut='gui-chu-ky']");
	await doi(
		a,
		"E15 buoc 3: bang chu ky them dong",
		(n) =>
			!document.querySelector("[data-sheet-mo-chu-ky]") &&
			document.querySelectorAll("[data-chu-ky]").length === n,
		dongTruoc + 1,
	);
	const ky = await hoi(cookie.admin, "okr.cycles");
	const quyMoi = ky.cycles.find((c) => c.name === KY.quySau);
	kiem(
		`E16: okr.cycles phai co ${KY.quySau} cha la ${KY.namSau}, thay ${JSON.stringify(quyMoi ?? null)}`,
		quyMoi?.kind === "quy" &&
			quyMoi.parentId === namSau &&
			quyMoi.startsOn === ngay(NAM + 1, 1, 1) &&
			quyMoi.endsOn === ngay(NAM + 1, 3, 31),
	);
	await chup(a, "E15-step3.png", true);

	const tranMoi = String(ctTruoc.objectiveCap + 2);
	await a.$eval("[data-o-tran-muc-tieu]", (e) => {
		e.focus();
		e.select();
	});
	await a.keyboard.press("Backspace");
	await a.type("[data-o-tran-muc-tieu]", tranMoi);
	await doi(
		a,
		"E15 buoc 4: nut Luu bat sau khi sua tran",
		() =>
			document.querySelector("[data-nut='luu-cau-hinh']")?.disabled === false,
	);
	await bamSel(a, "[data-nut='luu-cau-hinh']");
	await doi(
		a,
		`E15 buoc 4: toast «${CHU.daLuu}»`,
		(c) =>
			[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
				e.textContent?.includes(c),
			),
		CHU.daLuu,
	);
	const ctSau = await hoi(cookie.admin, "okr.program");
	kiem(
		`E16: okr.program phai tran ${tranMoi} va version ${ctTruoc.version + 1}, thay ${ctSau.objectiveCap} v${ctSau.version}`,
		String(ctSau.objectiveCap) === tranMoi &&
			ctSau.version === ctTruoc.version + 1,
	);
	await chup(a, "E15-step4.png");
	await a.close();

	const m = await moTrang(cookie.thuong, RONG, "/settings/okr", "E15");
	await hienSel(m, "[data-ly-do-khong-quyen]");
	const tdM = await tieuDe(m);
	kiem(
		`E15 buoc 5: thanh vien van phai thay hai CardTitle dau Chu ky, Cau hinh, thay ${JSON.stringify(tdM)}`,
		tdM.length >= 2 && tdM[0] === CHU.chuKy && tdM[1] === CHU.cauHinh,
	);
	const khoa = await m.evaluate(() =>
		[
			"[data-nut='mo-chu-ky']",
			"[data-nut='luu-cau-hinh']",
			"[data-o-tran-muc-tieu]",
		].map((s) => document.querySelector(s)?.disabled === true),
	);
	kiem(
		`E15 buoc 5: dieu khien phai disabled ${JSON.stringify(khoa)}`,
		khoa.every(Boolean),
	);
	kiem(
		`E15 buoc 5: dong duoi tieu de phai «${CHU.khongQuyen}»`,
		(await chuSel(m, "[data-ly-do-khong-quyen]")) === CHU.khongQuyen,
	);
	await chup(m, "E15-step5.png", true);
	await m.close();

	const d = await moTrang(
		cookie.admin,
		RONG,
		`/settings/okr?record=deal:${DEAL}`,
		"E15",
	);
	await doi(
		d,
		"E15 buoc 6: sheet Thoa thuan tren Cai dat OKR",
		(ten) =>
			document
				.querySelector("[data-slot='sheet-title'],[data-slot='drawer-title']")
				?.textContent?.includes(ten),
		dealSan.name,
	);
	await chup(d, "E15-step6.png");
	await doiRong(d, HEP);
	await chup(d, "E15-step7.png");
	await d.close();

	const s = await moTrang(
		cookie.admin,
		HEP,
		"/settings/okr?moChuKy=true",
		"E15",
	);
	await hienSel(s, "[data-sheet-mo-chu-ky]");
	await chup(s, "E15-step8.png");
	await s.close();
}

let loiGieo = null;
try {
	await buocE11ChuaChuKy();
	try {
		await gieoToChuc();
		await gieoOkr();
	} catch (e) {
		loiGieo = e;
	}
	if (loiGieo === null) {
		await buocE11();
		await buocE12();
		await buocE20();
		await buocE15();
	}
} catch (e) {
	hong.push(`ngoai le: ${e.stack ?? e.message}`);
} finally {
	for (const [nhom, dong] of Object.entries(mang))
		writeFileSync(
			join(BANG_CHUNG, `${nhom}-network.txt`),
			dong.length === 0
				? "khong co request that bai hay loi console\n"
				: `${dong.join("\n")}\n`,
		);
	await trinhDuyet.close().catch(() => {});
	await donDep().catch((e) => hong.push(`don dep hong: ${e.message}`));
}

if (loiGieo !== null)
	await khongDo(`KHONG DO DUOC: gieo qua API that hong — ${loiGieo.message}`);

console.log(`man-okr: ${anh.length} anh o ${BANG_CHUNG}`);
for (const a of anh) console.log(`  anh ${a}`);
console.log(`man-okr: ${khang} khang dinh, ${hong.length} hong`);
for (const h of hong) console.log(`  HONG: ${h}`);
await ket(hong.length ? 1 : 0);
