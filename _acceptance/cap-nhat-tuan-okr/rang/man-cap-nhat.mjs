import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
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
const MA = `n${Date.now().toString(36).slice(-6)}`;
const BANG_CHUNG =
	process.env.BANG_CHUNG ??
	join(GOC, ".acceptance-runs", "cap-nhat-tuan-okr", "evidence", MA);
const RONG = 1440;
const HEP = 390;
const CAO = 900;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const NGAY_LUI_CONG_BO = 2;
const LOI_HYDRATE = /hydrat/i;
const CUA_CHAN_URL = process.env.CUA_CHAN_URL ?? "http://localhost:3922";

mkdirSync(BANG_CHUNG, { recursive: true });

const CHU = {
	tabCapNhat: "Cập nhật tuần",
	tuanTruoc: "Tuần trước: vừa",
	loiSo: "Nhập một số",
	cao: "Cao",
	vua: "Vừa",
	thap: "Thấp",
	xong: "Xong",
	chuaXong: "Chưa xong",
	gui2: "Gửi 2 cập nhật",
	guiLai2: "Gửi lại 2 cập nhật",
	chuaGuiDuoc: "Chưa gửi được",
	daGui2: "Đã gửi 2 cập nhật",
	rongTitle: "Tuần này bạn không có KR nào cần cập nhật",
	loiTaiTitle: "Không lấy được danh sách KR của bạn",
	thuLai: "Thử lại",
	gui1: "Gửi 1 cập nhật",
	daGui1: "Đã gửi 1 cập nhật",
	traoDoi: "Trao đổi",
	theoDoi: "Theo dõi",
	dangTheoDoi: "Đang theo dõi",
	capNhatMenu: "Cập nhật",
	suaMenu: "Sửa",
	ghiHo: "Bạn ghi hộ",
	guiCapNhatKr: "Gửi cập nhật",
	chuyenViecMenu: "Chuyển việc 30 ngày…",
	chuyenOkrMenu: "Chuyển OKR…",
	xacNhanChuyen: "Chuyển",
	viecOkrRong: "Hôm nay OKR không cần gì từ bạn",
	capNhatTuanLink: "Cập nhật tuần",
	tasksTitle: "Việc quá hạn",
};

const cay = await canhCay();
if (cay.ket !== "dung-cay") await khongDo(...cay.dong);

{
	const res = await fetch(`${CUA_CHAN_URL}/__cua-chan/trang-thai`).catch(
		(e) => ({ ok: false, loi: e }),
	);
	if (!res || !res.ok)
		await khongDo(
			`KHONG DO DUOC: cua chan khong toi duoc o ${CUA_CHAN_URL}.`,
			"    E6 buoc 7 can rang/cua-chan.mjs dang chay va app tro NEXT_PUBLIC_API_URL vao no.",
		);
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
	admin: { email: `q${MA}@thu.test`, vai: "admin", ten: "Đặng Quản Trị" },
	tp: { email: `tp${MA}@thu.test`, vai: "member", ten: "Trần Phòng Trưởng" },
	tr: { email: `tr${MA}@thu.test`, vai: "member", ten: "Vũ Trưởng Đối" },
	m: { email: `m${MA}@thu.test`, vai: "member", ten: "Mai Ngọc Minh" },
	a: { email: `a${MA}@thu.test`, vai: "member", ten: "An Bình Anh" },
	c: { email: `c${MA}@thu.test`, vai: "okr", ten: "Cao Chỉ Okr" },
	c2: { email: `c2${MA}@thu.test`, vai: "okr", ten: "Chu Hai Okr" },
	h: { email: `h${MA}@thu.test`, vai: "member", ten: "Hồ Được Nhắc" },
	r: { email: `r${MA}@thu.test`, vai: "member", ten: "Đinh Rảnh Rang" },
	u: { email: `u${MA}@thu.test`, vai: "member", ten: "Uông Chưa Nối" },
	nguoiDi: { email: `di${MA}@thu.test`, vai: "member", ten: "Đỗ Người Đi" },
};

const cookie = {};
const id = {};
for (const [k, n] of Object.entries(NGUOI)) {
	cookie[k] = phienCua(n.email);
	id[k] = await datNguoi(n.email, n.vai, n.ten);
}

{
	const org = await db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { metadata: true },
	});
	if (org && !isOnboarded(org.metadata)) {
		await db.organization.update({
			where: { id: WORKSPACE_ID },
			data: { metadata: markOnboarded(org.metadata, new Date()) },
		});
	}
}

const slug = await suySlug(cookie.admin);

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
const KR = {};
const CAC_MUC_TIEU = [
	"cn",
	"ot",
	"a",
	"c",
	"h",
	"u",
	"di",
	"o29a",
	"o29b",
	"o29c",
];
const CAC_CHU_KY = ["namChay", "quyChay", "namKeHoach", "quyKeHoach"];

async function gieoToChuc() {
	ORG.bp = (
		await lam(cookie.admin, "org.createDivision", { name: `Khối đo ${MA}` })
	).id;
	ORG.p = (
		await lam(cookie.admin, "org.createDepartment", {
			name: `Phòng đo lường ${MA}`,
			divisionId: ORG.bp,
		})
	).id;
	ORG.p2 = (
		await lam(cookie.admin, "org.createDepartment", {
			name: `Phòng đối chiếu ${MA}`,
			divisionId: ORG.bp,
		})
	).id;
	for (const k of ["tp", "m", "a", "u", "nguoiDi"])
		await lam(cookie.admin, "org.setPlacement", {
			userId: id[k],
			primaryDepartmentId: ORG.p,
			secondaryDepartmentIds: [],
			managerUserId: null,
		});
	await lam(cookie.admin, "org.setPlacement", {
		userId: id.tr,
		primaryDepartmentId: ORG.p2,
		secondaryDepartmentIds: [],
		managerUserId: null,
	});
	await lam(cookie.admin, "org.setHead", {
		kind: "department",
		id: ORG.p,
		userId: id.tp,
	});
	await lam(cookie.admin, "org.setHead", {
		kind: "department",
		id: ORG.p2,
		userId: id.tr,
	});
	await lam(cookie.admin, "org.setHead", {
		kind: "division",
		id: ORG.bp,
		userId: id.admin,
	});
}

const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const homNayVN = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
const NAM = Number(homNayVN.slice(0, 4));
const QUY = Math.ceil(Number(homNayVN.slice(5, 7)) / 3);
const thuHomNay = (() => {
	const thu = new Date(`${homNayVN}T00:00:00Z`).getUTCDay();
	return ((thu + 6) % 7) + 1;
})();

async function taoChuKy(c, vao) {
	await lam(c, "okr.createCycle", vao);
	const ds = await hoi(c, "okr.cycles");
	return ds.cycles.find((x) => x.name === vao.name).id;
}

async function gieoChuKy() {
	OKR.namChay = await taoChuKy(cookie.admin, {
		kind: "nam",
		name: `Năm chạy ${MA}`,
		parentId: null,
		startsOn: ngay(NAM, 1, 1),
		endsOn: ngay(NAM, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	OKR.quyChay = await taoChuKy(cookie.admin, {
		kind: "quy",
		name: `Quý chạy ${MA}`,
		parentId: OKR.namChay,
		startsOn: ngay(NAM, QUY * 3 - 2, 1),
		endsOn: ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: thuHomNay,
	});
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: OKR.quyChay,
		phase: "dang-chay",
	});
	OKR.namKeHoach = await taoChuKy(cookie.admin, {
		kind: "nam",
		name: `Năm kế hoạch ${MA}`,
		parentId: null,
		startsOn: ngay(NAM + 1, 1, 1),
		endsOn: ngay(NAM + 1, 12, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	OKR.quyKeHoach = await taoChuKy(cookie.admin, {
		kind: "quy",
		name: `Quý kế hoạch ${MA}`,
		parentId: OKR.namKeHoach,
		startsOn: ngay(NAM + 1, 1, 1),
		endsOn: ngay(NAM + 1, 3, 31),
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
}

async function taoMucTieu(c, vao, krs) {
	const mt = await lam(c, "okr.createObjective", {
		participantIds: [],
		whyNow: "",
		kind: "cam-ket",
		unit: { level: "phong-ban", departmentId: ORG.p },
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

async function gieoMucTieu() {
	const cn = await taoMucTieu(
		cookie.tp,
		{ cycleId: OKR.quyChay, title: `Cập nhật tuần ${MA}`, ownerUserId: id.tp },
		[
			{
				title: `Mở rộng đối tác ${MA}`,
				kind: "tang-toi",
				ownerUserId: id.m,
				startValue: 0,
				targetValue: 20,
				currentValue: 0,
				unit: "đối tác",
			},
			{
				title: `Viết sổ tay vận hành ${MA}`,
				kind: "moc",
				ownerUserId: id.m,
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
				unit: "",
			},
			{
				title: `Tỉ lệ hồ sơ đủ giấy ${MA}`,
				kind: "phan-tram",
				ownerUserId: id.m,
				startValue: 0,
				targetValue: 100,
				currentValue: 20,
				unit: "%",
			},
		],
	);
	OKR.cn = cn.id;
	KR.tt = cn.kr[0];
	KR.moc = cn.kr[1];
	KR.pt = cn.kr[2];
	await lam(cookie.tp, "okr.publishObjective", { id: cn.id });

	const ot = await taoMucTieu(
		cookie.tp,
		{
			cycleId: OKR.quyChay,
			title: `Trao đổi mục tiêu ${MA}`,
			ownerUserId: id.tp,
		},
		[
			{
				title: `KR trao đổi ${MA}`,
				ownerUserId: id.m,
				startValue: 0,
				targetValue: 30,
				currentValue: 8,
				unit: "hồ sơ",
			},
		],
	);
	OKR.ot = ot.id;
	KR.ot1 = ot.kr[0];
	await lam(cookie.tp, "okr.publishObjective", { id: ot.id });

	const objA = await taoMucTieu(
		cookie.admin,
		{ cycleId: OKR.quyChay, title: `Mục tiêu của A ${MA}`, ownerUserId: id.a },
		[
			{
				title: `KR của A ${MA}`,
				ownerUserId: id.a,
				startValue: 0,
				targetValue: 10,
				currentValue: 2,
				unit: "việc",
			},
		],
	);
	OKR.a = objA.id;
	await lam(cookie.admin, "okr.publishObjective", { id: objA.id });

	const objC = await taoMucTieu(
		cookie.admin,
		{ cycleId: OKR.quyChay, title: `Mục tiêu của C ${MA}`, ownerUserId: id.c },
		[
			{
				title: `KR của C ${MA}`,
				ownerUserId: id.c,
				startValue: 0,
				targetValue: 10,
				currentValue: 2,
				unit: "việc",
			},
		],
	);
	OKR.c = objC.id;
	await lam(cookie.admin, "okr.publishObjective", { id: objC.id });

	const objH = await taoMucTieu(
		cookie.tp,
		{
			cycleId: OKR.quyChay,
			title: `Mục tiêu nhắc H ${MA}`,
			ownerUserId: id.tp,
		},
		[],
	);
	OKR.h = objH.id;

	const objU = await taoMucTieu(
		cookie.admin,
		{ cycleId: OKR.quyChay, title: `Mục tiêu của U ${MA}`, ownerUserId: id.u },
		[
			{
				title: `KR của U ${MA}`,
				ownerUserId: id.u,
				startValue: 0,
				targetValue: 10,
				currentValue: 3,
				unit: "việc",
			},
		],
	);
	OKR.u = objU.id;
	await lam(cookie.admin, "okr.publishObjective", { id: objU.id });

	const objDi = await taoMucTieu(
		cookie.admin,
		{
			cycleId: OKR.quyChay,
			title: `Mục tiêu người đi ${MA}`,
			ownerUserId: id.nguoiDi,
		},
		[
			{
				title: `KR người đi 1 ${MA}`,
				ownerUserId: id.nguoiDi,
				startValue: 0,
				targetValue: 10,
				currentValue: 1,
				unit: "việc",
			},
			{
				title: `KR người đi 2 ${MA}`,
				ownerUserId: id.nguoiDi,
				startValue: 0,
				targetValue: 10,
				currentValue: 1,
				unit: "việc",
			},
		],
	);
	OKR.di = objDi.id;
	KR.di1 = objDi.kr[0];
	KR.di2 = objDi.kr[1];
	await lam(cookie.admin, "okr.publishObjective", { id: objDi.id });

	const o29a = await taoMucTieu(
		cookie.tp,
		{
			cycleId: OKR.quyChay,
			title: `E29 công bố chạy ${MA}`,
			ownerUserId: id.tp,
		},
		[
			{
				title: `KR29a ${MA}`,
				ownerUserId: id.tp,
				startValue: 0,
				targetValue: 50,
				currentValue: 10,
				unit: "việc",
			},
		],
	);
	OKR.o29a = o29a.id;
	KR.k29a = o29a.kr[0];
	await lam(cookie.tp, "okr.publishObjective", { id: o29a.id });

	const o29b = await taoMucTieu(
		cookie.tp,
		{ cycleId: OKR.quyChay, title: `E29 nháp ${MA}`, ownerUserId: id.tp },
		[
			{
				title: `KR29b ${MA}`,
				ownerUserId: id.tp,
				startValue: 0,
				targetValue: 50,
				currentValue: 10,
				unit: "việc",
			},
		],
	);
	OKR.o29b = o29b.id;
	KR.k29b = o29b.kr[0];

	const o29c = await taoMucTieu(
		cookie.tp,
		{
			cycleId: OKR.quyKeHoach,
			title: `E29 công bố lập kế hoạch ${MA}`,
			ownerUserId: id.tp,
		},
		[
			{
				title: `KR29c ${MA}`,
				ownerUserId: id.tp,
				startValue: 0,
				targetValue: 50,
				currentValue: 10,
				unit: "việc",
			},
		],
	);
	OKR.o29c = o29c.id;
	KR.k29c = o29c.kr[0];
	await lam(cookie.tp, "okr.publishObjective", { id: o29c.id });

	const luiVe = new Date(Date.now() - NGAY_LUI_CONG_BO * 24 * 3600 * 1000);
	const moiCongBo = [
		OKR.cn,
		OKR.ot,
		OKR.a,
		OKR.c,
		OKR.u,
		OKR.di,
		OKR.o29a,
		OKR.o29c,
	];
	await db.okrObjective.updateMany({
		where: { id: { in: moiCongBo } },
		data: { publishedAt: luiVe },
	});
	await db.okrKeyResult.updateMany({
		where: { objectiveId: { in: moiCongBo }, startLockedAt: { not: null } },
		data: { startLockedAt: luiVe },
	});
}

async function gieoBinhLuanVaNhac() {
	await lam(cookie.m, "okr.addComment", {
		objectiveId: OKR.ot,
		keyResultId: KR.ot1,
		body: `Bình luận một ${MA}`,
		mentionUserIds: [],
	});
	await lam(cookie.m, "okr.addComment", {
		objectiveId: OKR.ot,
		keyResultId: undefined,
		body: `Bình luận hai ${MA}`,
		mentionUserIds: [id.tp],
	});
	await lam(cookie.m, "okr.addComment", {
		objectiveId: OKR.h,
		keyResultId: undefined,
		body: `Nhờ H xem giúp ${MA}`,
		mentionUserIds: [id.h],
	});
}

async function gieoLichSuTuanTruoc() {
	const moPhien = await lam(cookie.m, "okr.moCapNhat", { entry: "tab" });
	await lam(cookie.m, "okr.guiCapNhat", {
		sessionId: moPhien.sessionId,
		items: [{ keyResultId: KR.tt, value: 5, confidence: "vua", note: "" }],
	});
	const hangThat = await db.okrCheckIn.findFirst({
		where: { sessionId: moPhien.sessionId },
	});
	const phienThat = await db.okrCheckInSession.findUnique({
		where: { id: moPhien.sessionId },
	});
	if (!hangThat || !phienThat)
		throw new Error("khong doc lai duoc hang calibration vua ghi qua service");

	const luc = new Date(Date.now() - 8 * 24 * 3600 * 1000);
	const tuanTruocChuoi = new Date(
		Date.parse(`${homNayVN}T00:00:00Z`) - 7 * 24 * 3600 * 1000,
	);
	const thuLuc = tuanTruocChuoi.getUTCDay();
	const luiVeThuHai = (thuLuc + 6) % 7;
	const tuanTruoc = new Date(
		tuanTruocChuoi.getTime() - luiVeThuHai * 24 * 3600 * 1000,
	)
		.toISOString()
		.slice(0, 10);

	const phienCu = await db.okrCheckInSession.create({
		data: {
			userId: hangThat.authorUserId,
			entry: phienThat.entry,
			openedAt: luc,
			submittedAt: new Date(luc.getTime() + 30_000),
			seconds: 30,
		},
	});
	await db.okrCheckIn.create({
		data: {
			keyResultId: hangThat.keyResultId,
			sessionId: phienCu.id,
			weekStart: new Date(`${tuanTruoc}T00:00:00Z`),
			value: hangThat.value,
			confidence: "vua",
			note: "",
			authorUserId: hangThat.authorUserId,
			ownerUserId: hangThat.ownerUserId,
			onBehalf: hangThat.onBehalf,
			channel: hangThat.channel,
			createdAt: luc,
		},
	});
	await db.okrCheckIn.delete({ where: { id: hangThat.id } });
	await db.okrCheckInSession.delete({ where: { id: phienThat.id } });
}

let loiGieo = null;
try {
	await gieoToChuc();
	await gieoChuKy();
	await gieoMucTieu();
	await gieoBinhLuanVaNhac();
	await gieoLichSuTuanTruoc();
} catch (e) {
	loiGieo = e;
}
if (loiGieo !== null) {
	console.log(
		`KHONG DO DUOC: gieo qua API that hong — ${loiGieo.stack ?? loiGieo.message}`,
	);
	await donDepRoiThoat(2);
}

async function donDepRoiThoat(ma) {
	await donDep().catch(() => {});
	process.exit(ma);
}

async function donDep() {
	const moiNguoi = Object.values(id);
	const moLac = await db.okrObjective.findMany({
		where: { title: { contains: MA } },
		select: { id: true },
	});
	const moiMt = [
		...new Set([
			...CAC_MUC_TIEU.map((k) => OKR[k]).filter(Boolean),
			...moLac.map((o) => o.id),
		]),
	];
	const moiKy = CAC_CHU_KY.map((k) => OKR[k]).filter(Boolean);
	await db.okrMention.deleteMany({
		where: { comment: { objectiveId: { in: moiMt } } },
	});
	await db.okrComment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrFollow.deleteMany({ where: { userId: { in: moiNguoi } } });
	await db.okrTrail.deleteMany({
		where: {
			OR: [{ actorUserId: { in: moiNguoi } }, { objectiveId: { in: moiMt } }],
		},
	});
	await db.okrCheckIn.deleteMany({ where: { authorUserId: { in: moiNguoi } } });
	await db.okrCheckInSession.deleteMany({
		where: { userId: { in: moiNguoi } },
	});
	await db.okrKeyResult.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: moiMt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: moiKy }, kind: "quy" } });
	await db.okrCycle.deleteMany({ where: { id: { in: moiKy } } });
	const cacPhongBan = [ORG.p, ORG.p2].filter(Boolean);
	await db.orgSecondaryDepartment.deleteMany({
		where: {
			OR: [{ userId: { in: moiNguoi } }, { departmentId: { in: cacPhongBan } }],
		},
	});
	await db.orgPlacement.deleteMany({
		where: {
			OR: [
				{ userId: { in: moiNguoi } },
				{ primaryDepartmentId: { in: cacPhongBan } },
			],
		},
	});
	await db.department.deleteMany({ where: { id: { in: cacPhongBan } } });
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
const mangMang = { E6: [] };
const kiem = (nhan, dat) => {
	khang += 1;
	if (!dat) hong.push(nhan);
	return dat;
};
const cho = (ms) => new Promise((r) => setTimeout(r, ms));

async function moTrang(c, rong, duong, nhom = "E6") {
	const trang = await trinhDuyet.newPage();
	if (!mangMang[nhom]) mangMang[nhom] = [];
	const ghi = (d) => mangMang[nhom].push(`${new Date().toISOString()} ${d}`);
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
	trang.trpc = [];
	trang.on("response", (r) => {
		const khop = new URL(r.url()).pathname.match(/\/trpc\/(.+)$/);
		if (!khop) return;
		const ten = decodeURIComponent(khop[1]).split(",");
		trang.trpc.push(
			r
				.json()
				.then((than) =>
					ten.map((t, k) => {
						const du = (Array.isArray(than) ? than[k] : than)?.result?.data;
						return { thuTuc: t, du: du?.json ?? du };
					}),
				)
				.catch(() => ten.map((t) => ({ thuTuc: t, du: undefined }))),
		);
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
const coChu = (trang, sel, chu) =>
	trang.evaluate(
		(s, c) =>
			[...document.querySelectorAll(s)].some((e) =>
				e.textContent?.replace(/\s+/g, " ").trim().includes(c),
			),
		sel,
		chu,
	);
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
const khongTran = (trang) =>
	trang.evaluate(
		() => document.documentElement.scrollWidth <= window.innerWidth,
	);

async function docTrpc(trang, thuTuc) {
	const han = Date.now() + CHO;
	for (;;) {
		const ds = (await Promise.all(trang.trpc))
			.flat()
			.filter((x) => x.thuTuc === thuTuc);
		if (ds.length > 0 || Date.now() > han) return ds.map((x) => x.du);
		await cho(200);
	}
}

function trongKhungNhin(s, c, sauCung) {
	const moi = [...document.querySelectorAll(s)].filter(
		(e) => c === null || e.textContent?.replace(/\s+/g, " ").includes(c),
	);
	const e = sauCung ? moi.at(-1) : moi[0];
	if (!e) return false;
	e.scrollIntoView({ block: "nearest", inline: "nearest" });
	const r = e.getBoundingClientRect();
	if (r.width <= 0 || r.height <= 0) return false;
	if (r.left < -1 || r.right > innerWidth + 1) return false;
	if (r.top >= innerHeight || r.bottom <= 0) return false;
	let mo = 1;
	for (let x = e; x; x = x.parentElement)
		mo *= Number(getComputedStyle(x).opacity);
	if (mo < 0.99) return false;
	if (!e.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }))
		return false;
	const tren = document.elementFromPoint(
		(Math.max(r.left, 0) + Math.min(r.right, innerWidth)) / 2,
		(Math.max(r.top, 0) + Math.min(r.bottom, innerHeight)) / 2,
	);
	return tren !== null && e.contains(tren);
}

async function chup(trang, ten, { sel, chu = null, cuoi = false }) {
	kiem(`${ten}: tran ngang`, await khongTran(trang));
	const vao = await trang
		.waitForFunction(
			trongKhungNhin,
			{ timeout: CHO, polling: 200 },
			sel,
			chu,
			cuoi,
		)
		.then(() => true)
		.catch(() => false);
	await trang
		.waitForFunction(
			() =>
				document
					.getAnimations()
					.filter(
						(a) =>
							a.effect?.getComputedTiming().iterations !==
							Number.POSITIVE_INFINITY,
					)
					.every((a) => a.playState !== "running"),
			{ timeout: CHO, polling: 100 },
		)
		.catch(() => null);
	await cho(250);
	const van = vao && (await trang.evaluate(trongKhungNhin, sel, chu, cuoi));
	kiem(
		`${ten}: ${sel}${chu ? ` «${chu}»` : ""} phai hien, khong bi che, nam trong khung nhin luc chup`,
		van === true,
	);
	await trang.screenshot({ path: join(BANG_CHUNG, ten), fullPage: false });
	anh.push(ten);
}

async function doiRong(trang, rong) {
	await trang.setViewport({ width: rong, height: CAO });
	await cho(700);
}

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
	await el.evaluate((e) =>
		e.scrollIntoView({ block: "center", inline: "center" }),
	);
	await cho(100);
	try {
		await el.click();
	} catch {
		await el.evaluate((e) => e.click());
	}
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
			await e.evaluate((el) =>
				el.scrollIntoView({ block: "center", inline: "center" }),
			);
			await cho(100);
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

async function ganGiaTri(trang, sel, gia) {
	await trang.$eval(sel, (e) => {
		e.focus();
		e.select();
	});
	await trang.keyboard.press("Backspace");
	await trang.type(sel, gia);
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

async function buocE6E7() {
	const nong = await moTrang(cookie.r, RONG, "/okr/cap-nhat-tuan", "E6");
	await hienSel(nong, "[data-trang-thai]");
	await nong.close();
	const truocCheckIn = await db.okrCheckIn.count({
		where: { authorUserId: id.m },
	});
	const truocPhien = await db.okrCheckInSession.count({
		where: { userId: id.m },
	});

	const t = await moTrang(cookie.m, RONG, "/okr/cap-nhat-tuan", "E6");
	await hienSel(t, "[data-kr]");
	const t0Linh = await db.$queryRaw`SELECT now() as agora`;
	const T0 = t0Linh[0].agora;
	await cho(5300);

	kiem(
		"E6 buoc 1: thanh tab co 5 tab",
		(await demSel(t, "[role='tab']")) === 5,
	);
	kiem(
		"E6 buoc 1: tab Cap nhat tuan aria-current",
		(await chuSel(t, "[role='tab'][aria-current='page']")).includes(
			CHU.tabCapNhat,
		),
	);
	kiem(
		"E6 buoc 1: co 4 dong KR (3 cua muc tieu cn + KR trao doi ot cung chu M)",
		(await demSel(t, "[data-kr]")) === 4,
	);
	kiem(
		"E6 buoc 1: KR tang-toi dien san 5",
		(await t.$eval(`[data-kr='${KR.tt}'] input`, (e) => e.value)) === "5",
	);
	kiem(
		`E6 buoc 1: dong «${CHU.tuanTruoc}» cho KR co lan truoc`,
		(await chuSel(t, `[data-kr='${KR.tt}'] [data-o='tu-tin']`)).includes(
			CHU.tuanTruoc,
		),
	);
	kiem(
		"E6 buoc 1: KR moc co 2 nut ToggleGroup",
		(await demSel(
			t,
			`[data-kr='${KR.moc}'] [data-o='gia-tri'] [data-slot='toggle-group-item']`,
		)) === 2,
	);
	await chup(t, "E6-step1.png", { sel: `[data-kr='${KR.tt}']` });

	await ganGiaTri(t, `[data-kr='${KR.pt}'] input`, "ba");
	await cho(200);
	kiem(
		`E6 buoc 2: loi so khi go chu khong phai so «${CHU.loiSo}»`,
		(await chuSel(t, `[data-kr='${KR.pt}'] [data-o='gia-tri']`)).includes(
			CHU.loiSo,
		),
	);
	kiem(
		"E6 buoc 2: nut gui disabled khi co so hong",
		(await t.$eval("[data-nut='gui']", (e) => e.disabled)) === true,
	);
	await chup(t, "E6-step2.png", { sel: `[data-kr='${KR.pt}']` });

	await ganGiaTri(t, `[data-kr='${KR.pt}'] input`, "40");
	await cho(200);
	await bamChu(
		t,
		`[data-kr='${KR.tt}'] [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU.cao,
	);
	await cho(200);
	await bamChu(
		t,
		`[data-kr='${KR.pt}'] [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU.vua,
	);
	await cho(200);
	await doi(
		t,
		"E6 buoc 3: nut Gui 2 cap nhat",
		(chu) =>
			document.querySelector("[data-nut='gui']")?.textContent?.includes(chu),
		CHU.gui2,
	);
	await chup(t, "E6-step3.png", { sel: "[data-nut='gui']" });

	await doiRong(t, HEP);
	kiem("E6 buoc 8: o 390 khong tran ngang", await khongTran(t));
	const doRongCot = await t.evaluate((krId) => {
		const kr = document.querySelector(`[data-kr='${krId}'] [data-o='tu-tin']`);
		if (!kr) return null;
		const rongToggle =
			kr.querySelector("[data-slot='toggle-group']")?.getBoundingClientRect()
				.width ?? 0;
		return { cot: kr.getBoundingClientRect().width, toggle: rongToggle };
	}, KR.tt);
	kiem(
		"E6 buoc 8: ToggleGroup muc tu tin rong bang cot (sai so 2px)",
		doRongCot !== null && Math.abs(doRongCot.cot - doRongCot.toggle) <= 2,
	);
	await chup(t, "E6-step8.png", { sel: `[data-kr='${KR.tt}']` });

	await doiRong(t, RONG);
	await t.evaluate(() => document.documentElement.classList.add("dark"));
	await cho(300);
	await chup(t, "E6-step9.png", { sel: `[data-kr='${KR.tt}']` });
	await t.evaluate(() => document.documentElement.classList.remove("dark"));

	let chanGui = true;
	await t.setRequestInterception(true);
	const chanGuiCapNhat = (r) => {
		if (r.isInterceptResolutionHandled()) return;
		if (chanGui && r.url().includes("okr.guiCapNhat"))
			void r.respond({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({ error: { message: "chan boi man-cap-nhat" } }),
			});
		else void r.continue();
	};
	t.on("request", chanGuiCapNhat);

	await bamSel(t, "[data-nut='gui']");
	await doi(
		t,
		"E6 buoc 4: Alert Chua gui duoc",
		(chu) =>
			document
				.querySelector("[data-trang-thai='ST-capnhat-loigui']")
				?.textContent?.includes(chu),
		CHU.chuaGuiDuoc,
	);
	kiem(
		"E6 buoc 4: gia tri phan-tram con nguyen 40",
		(await t.$eval(`[data-kr='${KR.pt}'] input`, (e) => e.value)) === "40",
	);
	kiem(
		`E6 buoc 4: nut phai «${CHU.guiLai2}»`,
		(await chuSel(t, "[data-nut='gui']")).includes(CHU.guiLai2),
	);
	await chup(t, "E6-step4.png", {
		sel: "[data-trang-thai='ST-capnhat-loigui']",
	});
	const soCheckInSauChan = await db.okrCheckIn.count({
		where: { authorUserId: id.m },
	});
	kiem(
		`E7: sau lan gui bi chan okrCheckIn +0, thay ${soCheckInSauChan - truocCheckIn}`,
		soCheckInSauChan === truocCheckIn,
	);

	chanGui = false;
	await bamSel(t, "[data-nut='gui']");
	await doi(
		t,
		"E6 buoc 5: Alert Da gui",
		(chu) =>
			document
				.querySelector("[data-trang-thai='ST-capnhat-dagui']")
				?.textContent?.includes(chu),
		CHU.daGui2,
	);
	t.off("request", chanGuiCapNhat);
	await t.setRequestInterception(false);
	await chup(t, "E6-step5.png", {
		sel: "[data-trang-thai='ST-capnhat-dagui']",
	});

	const sauCheckIn = await db.okrCheckIn.count({
		where: { authorUserId: id.m },
	});
	kiem(
		`E7: sau «Da gui» okrCheckIn +2, thay ${sauCheckIn - truocCheckIn}`,
		sauCheckIn === truocCheckIn + 2,
	);
	const hangMoi = await db.okrCheckIn.findMany({
		where: {
			authorUserId: id.m,
			keyResultId: { in: [KR.tt, KR.pt] },
			createdAt: { gte: new Date(T0) },
		},
		orderBy: { createdAt: "desc" },
		take: 2,
	});
	kiem(
		"E7: hai dong moi co confidence dung lua chon",
		hangMoi.some((h) => h.keyResultId === KR.tt && h.confidence === "cao") &&
			hangMoi.some((h) => h.keyResultId === KR.pt && h.confidence === "vua"),
	);
	const hangPt = hangMoi.find((h) => h.keyResultId === KR.pt);
	kiem(
		`E7: value KR phan-tram phai 40, thay ${hangPt ? Number(hangPt.value) : "khong thay"}`,
		hangPt !== undefined && Number(hangPt.value) === 40,
	);
	const sauPhien = await db.okrCheckInSession.count({
		where: { userId: id.m },
	});
	kiem(
		`E7: okrCheckInSession cua M +1 dung mot phien, thay ${sauPhien - truocPhien}`,
		sauPhien === truocPhien + 1,
	);
	const phienMoi = await db.okrCheckInSession.findFirst({
		where: { userId: id.m },
		orderBy: { openedAt: "desc" },
	});
	kiem(
		`E7: entry phai tab, thay ${phienMoi?.entry}`,
		phienMoi?.entry === "tab",
	);
	kiem(
		"E7: openedAt <= T0 + 1s",
		phienMoi !== null &&
			phienMoi.openedAt.getTime() <= new Date(T0).getTime() + 1000,
	);
	kiem(
		`E7: seconds >= 5, thay ${phienMoi?.seconds}`,
		Number.isFinite(phienMoi?.seconds) && phienMoi.seconds >= 5,
	);

	const r = await moTrang(cookie.r, RONG, "/okr/cap-nhat-tuan", "E6");
	if (await hienSel(r, "[data-trang-thai='ST-capnhat-rong']")) {
		kiem(
			`E6 buoc 6: Empty rong phai noi «${CHU.rongTitle}»`,
			(await chuSel(r, "[data-trang-thai='ST-capnhat-rong']")).includes(
				CHU.rongTitle,
			),
		);
	}
	await chup(r, "E6-step6.png", { sel: "[data-trang-thai='ST-capnhat-rong']" });
	await r.close();

	await fetch(`${CUA_CHAN_URL}/__cua-chan/chan`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ thuTuc: "okr.capNhatTuan" }),
	});
	const m2 = await moTrang(cookie.m, RONG, "/okr/cap-nhat-tuan", "E6");
	kiem(
		"E6 buoc 7: Empty loi khi may chu chan",
		await hienSel(m2, "[data-trang-thai='ST-capnhat-loi']"),
	);
	kiem(
		`E6 buoc 7: Empty loi phai noi «${CHU.loiTaiTitle}»`,
		(await chuSel(m2, "[data-trang-thai='ST-capnhat-loi']")).includes(
			CHU.loiTaiTitle,
		),
	);
	await fetch(`${CUA_CHAN_URL}/__cua-chan/bo`, { method: "POST" });
	await bamChu(m2, "[data-trang-thai='ST-capnhat-loi'] button", CHU.thuLai);
	await doi(
		m2,
		"E6 buoc 7: danh sach hien sau thu lai",
		() => document.querySelector("[data-kr]") !== null,
	);
	await chup(m2, "E6-step7.png", { sel: "[data-kr]" });
	await m2.close();

	await kiemKhongDich(
		t,
		"E6 translate",
		`[data-kr='${KR.tt}']`,
		`Mở rộng đối tác ${MA}`,
	);
	await kiemKhongDich(
		t,
		"E6 translate",
		`[data-kr='${KR.tt}']`,
		`Cập nhật tuần ${MA}`,
	);
	await kiemKhongDich(t, "E6 translate", `[data-kr='${KR.tt}']`, "đối tác");

	const daLoiKhac = mangMang.E6.filter(
		(d) =>
			!d.includes("okr.guiCapNhat") &&
			!d.includes("okr.capNhatTuan") &&
			/^\d{4}-\S+ (4|5)\d\d /.test(d),
	);
	const { writeFileSync } = await import("node:fs");
	writeFileSync(
		join(BANG_CHUNG, "E6-network.txt"),
		daLoiKhac.length === 0
			? "khong co request that bai ngoai cho chan\n"
			: `${daLoiKhac.join("\n")}\n`,
	);
	await t.close();
}

async function buocE13E14() {
	const a = await moTrang(cookie.a, RONG, "", "E13");
	await hienSel(a, "[data-the-viec-okr='tong-quan']");
	kiem(
		"E13 buoc 1: the viec OKR co dong 1 KR cho cap nhat",
		(await chuSel(a, "[data-the-viec-okr='tong-quan']")).includes(
			"1 KR chờ cập nhật tuần này",
		),
	);
	kiem(
		`E13 buoc 1: the viec ke hoach «${CHU.tasksTitle}» van hien`,
		await coChu(a, `[data-slot='card-title']`, CHU.tasksTitle),
	);
	await chup(a, "E13-step1.png", { sel: "[data-the-viec-okr='tong-quan']" });
	await doiRong(a, HEP);
	await chup(a, "E13-step2.png", { sel: "[data-the-viec-okr='tong-quan']" });
	await a.close();

	const c = await moTrang(cookie.c, RONG, "", "E13");
	await hienSel(c, "[data-the-viec-okr='tong-quan']");
	kiem(
		"E13 buoc 3: vai okr thay the viec OKR o Tong quan rut gon",
		(await chuSel(c, "[data-the-viec-okr='tong-quan']")).includes(
			"1 KR chờ cập nhật tuần này",
		),
	);
	await chup(c, "E13-step3.png", { sel: "[data-the-viec-okr='tong-quan']" });
	await bamChu(c, "[data-the-viec-okr='tong-quan'] a", "Cập nhật tuần");
	await doi(
		c,
		"E13 buoc 4: URL sang cap-nhat-tuan",
		(s) => new URL(location.href).pathname.endsWith(s),
		"/okr/cap-nhat-tuan",
	);
	kiem(
		`E13 buoc 4: tham so tu=viec-cua-toi, thay ${thamSo(c, "tu")}`,
		thamSo(c, "tu") === "viec-cua-toi",
	);
	await chup(c, "E13-step4.png", { sel: "[data-kr]" });
	await c.close();

	const h = await moTrang(cookie.h, RONG, "/okr", "E13");
	await hienSel(h, "[data-the-viec-okr='cua-toi']");
	kiem(
		"E13 buoc 5: khoi Viec cua toi co dong nhac ten",
		await coSel(h, "[data-viec-okr='okr-nhac-ten']"),
	);
	await bamSel(h, "[data-viec-okr='okr-nhac-ten'] [data-mo-muc-tieu]");
	await doi(
		h,
		"E13 buoc 5: sheet muc tieu mo",
		(id) => document.querySelector(`[data-okr-sheet='${id}']`) !== null,
		OKR.h,
	);
	kiem(
		`E13 buoc 5: URL record=objective:${OKR.h}, thay ${thamSo(h, "record")}`,
		thamSo(h, "record") === `objective:${OKR.h}`,
	);
	await chup(h, "E13-step5.png", {
		sel: `[data-okr-sheet='${OKR.h}'] [role='tab']`,
	});
	await h.close();

	const c2 = await moTrang(cookie.c2, RONG, "", "E13");
	await hienSel(c2, "[data-the-viec-okr='tong-quan']");
	kiem(
		`E13 buoc 6: the viec OKR rong phai noi «${CHU.viecOkrRong}»`,
		(await chuSel(c2, "[data-the-viec-okr='tong-quan']")).includes(
			CHU.viecOkrRong,
		),
	);
	await chup(c2, "E13-step6.png", { sel: "[data-the-viec-okr='tong-quan']" });
	await c2.close();

	const r = await moTrang(cookie.r, RONG, "", "E13");
	const phanR = await docTrpc(r, "okr.viecCuaToi");
	kiem(
		`E13 buoc 7: phien R nhan phan hoi okr.viecCuaToi, thay ${phanR.length}`,
		phanR.length > 0,
	);
	kiem(
		`E13 buoc 7: may chu tra lienQuanOkr=false cho R, thay ${JSON.stringify(phanR.map((d) => d?.lienQuanOkr))}`,
		phanR.length > 0 && phanR.every((d) => d?.lienQuanOkr === false),
	);
	await cho(500);
	kiem(
		"E13 buoc 7: R khong co the viec OKR",
		!(await coSel(r, "[data-the-viec-okr='tong-quan']")),
	);
	kiem(
		`E13 buoc 7: the ke hoach van hien cho R`,
		await coChu(r, "[data-slot='card-title']", CHU.tasksTitle),
	);
	await chup(r, "E13-step7.png", {
		sel: "[data-slot='card-title']",
		chu: CHU.tasksTitle,
	});
	await r.close();

	const tr = await moTrang(cookie.tr, RONG, "", "E13");
	await hienSel(tr, "[data-the-viec-okr='tong-quan']");
	const phanTr = await docTrpc(tr, "okr.viecCuaToi");
	kiem(
		`E13 buoc 8: may chu tra lienQuanOkr=true cho TR, thay ${JSON.stringify(phanTr.map((d) => d?.lienQuanOkr))}`,
		phanTr.length > 0 && phanTr.every((d) => d?.lienQuanOkr === true),
	);
	kiem(
		`E13 buoc 8: TR (truong phong ban, khong viec) van thay the rong «${CHU.viecOkrRong}»`,
		(await chuSel(tr, "[data-the-viec-okr='tong-quan']")).includes(
			CHU.viecOkrRong,
		),
	);
	await chup(tr, "E13-step8.png", { sel: "[data-the-viec-okr='tong-quan']" });
	await tr.close();

	const phienC = await db.okrCheckInSession.findFirst({
		where: { userId: id.c },
		orderBy: { openedAt: "desc" },
	});
	kiem(
		`E14: entry cua phien C phai viec-cua-toi, thay ${phienC?.entry}`,
		phienC?.entry === "viec-cua-toi",
	);
}

async function buocE16() {
	const truoc = await db.okrCheckIn.count({ where: { authorUserId: id.u } });
	const u = await moTrang(cookie.u, RONG, "", "E16");
	await hienSel(u, "[data-the-viec-okr='tong-quan']");
	kiem(
		"E16 buoc 1: the viec OKR co dong cap nhat cho U khong noi kenh",
		(await chuSel(u, "[data-the-viec-okr='tong-quan']")).includes(
			"chờ cập nhật tuần này",
		),
	);
	await chup(u, "E16-step1.png", { sel: "[data-the-viec-okr='tong-quan']" });
	await bamChu(u, "[data-the-viec-okr='tong-quan'] a", "Cập nhật tuần");
	await doi(
		u,
		"E16 buoc 2: man cap nhat hien",
		() => document.querySelector("[data-kr]") !== null,
	);
	const krU = await u.evaluate(() =>
		document.querySelector("[data-kr]")?.getAttribute("data-kr"),
	);
	await bamChu(
		u,
		`[data-kr='${krU}'] [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU.cao,
	);
	await doi(
		u,
		"E16 buoc 2: nut Gui 1 cap nhat",
		(chu) =>
			document.querySelector("[data-nut='gui']")?.textContent?.includes(chu),
		CHU.gui1,
	);
	await bamSel(u, "[data-nut='gui']");
	await doi(
		u,
		"E16 buoc 2: da gui",
		(chu) =>
			document
				.querySelector("[data-trang-thai='ST-capnhat-dagui']")
				?.textContent?.includes(chu),
		CHU.daGui1,
	);
	await chup(u, "E16-step2.png", {
		sel: "[data-trang-thai='ST-capnhat-dagui']",
	});
	await u.close();
	const sau = await db.okrCheckIn.count({ where: { authorUserId: id.u } });
	kiem(`E16: okrCheckIn cua U +1, thay ${sau - truoc}`, sau === truoc + 1);
}

async function buocE18E19() {
	const deal = await db.deal.findFirst({ select: { id: true } });
	if (deal === null)
		return kiem(
			"E18: khong co thoa thuan nao trong kho de xep chong sheet",
			false,
		);

	const r = await moTrang(
		cookie.r,
		RONG,
		`/deals?record=deal:${deal.id}`,
		"E18",
	);
	await r.goto(
		`${APP}/${slug}/deals?record=deal:${deal.id},objective:${OKR.ot}`,
		{
			waitUntil: "load",
			timeout: CHO_TAI,
		},
	);
	await doi(
		r,
		"E18 buoc 1: sheet muc tieu OT hien",
		(id) => document.querySelector(`[data-okr-sheet='${id}']`) !== null,
		OKR.ot,
	);
	await cho(CHO_HYDRATE_MS);
	await bamChu(r, `[data-okr-sheet='${OKR.ot}'] [role='tab']`, CHU.traoDoi);
	await doi(
		r,
		"E18 buoc 1: hai binh luan hien",
		() => document.querySelectorAll("[data-binh-luan]").length === 2,
	);
	const binhLuan = await r.evaluate(() =>
		[...document.querySelectorAll("[data-binh-luan]")].map((e) => ({
			than: e.querySelector("[data-noi-dung]")?.textContent ?? "",
			chip: e.querySelector("[data-chip-kr]")?.textContent ?? null,
			nhac: e.querySelector("[data-nhac-ten]")?.textContent ?? null,
		})),
	);
	kiem(
		"E18 buoc 1: binh luan dau co chip KR1",
		binhLuan[0]?.than.includes("Bình luận một") && binhLuan[0]?.chip !== null,
	);
	kiem(
		"E18 buoc 1: binh luan hai co ten TP duoc nhac",
		binhLuan[1]?.than.includes("Bình luận hai") &&
			(binhLuan[1]?.nhac ?? "").includes(NGUOI.tp.ten),
	);
	await chup(r, "E18-step1.png", { sel: "[data-binh-luan]" });
	await doiRong(r, HEP);
	await chup(r, "E18-step2.png", { sel: "[data-binh-luan]" });
	await doiRong(r, RONG);

	await r.type("[data-khung-soan] textarea", "Tuần này cần thêm người");
	await chonTuySelect(r, "[data-o-kr]", `KR trao đổi ${MA}`);
	await chonTuySelect(r, "[data-o-nhac-ten]", NGUOI.m.ten);
	await bamSel(r, "[data-nut='gui-binh-luan']");
	await doi(
		r,
		"E18 buoc 3: ba binh luan hien",
		() => document.querySelectorAll("[data-binh-luan]").length === 3,
	);
	await chup(r, "E18-step3.png", { sel: "[data-binh-luan]", cuoi: true });

	kiem(
		"E18 buoc 4: R thay nut Theo doi",
		await coSel(r, "[data-nut='theo-doi']"),
	);
	const dangTruoc = await r.$eval("[data-nut='theo-doi']", (e) =>
		e.getAttribute("aria-pressed"),
	);
	kiem(
		`E18 buoc 4: aria-pressed truoc la false, thay ${dangTruoc}`,
		dangTruoc === "false",
	);
	await bamSel(r, "[data-nut='theo-doi']");
	await doi(
		r,
		"E18 buoc 4: da theo doi",
		() =>
			document
				.querySelector("[data-nut='theo-doi']")
				?.getAttribute("aria-pressed") === "true",
	);
	kiem(
		`E18 buoc 4: nut phai noi «${CHU.dangTheoDoi}»`,
		(await chuSel(r, "[data-nut='theo-doi']")).includes(CHU.dangTheoDoi),
	);
	await chup(r, "E18-step4.png", { sel: "[data-nut='theo-doi']" });

	kiem(
		"E18 buoc 5: R khong co menu thao tac tren KR1 (khong the lam gi)",
		!(await coSel(r, `button[aria-label='Thao tác với KR trao đổi ${MA}']`)),
	);
	await r.close();

	const tp = await moTrang(
		cookie.tp,
		RONG,
		`/deals?record=deal:${deal.id}`,
		"E18",
	);
	await tp.goto(
		`${APP}/${slug}/deals?record=deal:${deal.id},objective:${OKR.ot}`,
		{
			waitUntil: "load",
			timeout: CHO_TAI,
		},
	);
	await doi(
		tp,
		"E18 TP: sheet muc tieu OT hien",
		(id) => document.querySelector(`[data-okr-sheet='${id}']`) !== null,
		OKR.ot,
	);
	await cho(CHO_HYDRATE_MS);
	kiem(
		"E18 buoc 5: TP co menu thao tac tren KR1",
		await coSel(tp, `button[aria-label='Thao tác với KR trao đổi ${MA}']`),
	);

	async function moHopCapNhatKr() {
		await bamSel(tp, `button[aria-label='Thao tác với KR trao đổi ${MA}']`);
		await doi(
			tp,
			"E18 buoc 5: menu KR mo",
			() => document.querySelector("[role='menuitem']") !== null,
		);
		await bamChu(tp, "[data-muc='cap-nhat-kr']", CHU.capNhatMenu);
		await doi(
			tp,
			"E18 buoc 5: hop cap nhat KR mo",
			(id) => document.querySelector(`[data-hop-cap-nhat-kr='${id}']`) !== null,
			KR.ot1,
		);
	}

	await moHopCapNhatKr();
	kiem(
		`E18 buoc 5: hop ghi ho phai noi «${CHU.ghiHo}» va ten M`,
		(await chuSel(tp, "[data-ghi-ho]")).includes(CHU.ghiHo) &&
			(await chuSel(tp, "[data-ghi-ho]")).includes(NGUOI.m.ten),
	);
	await chup(tp, "E18-step5.png", { sel: "[data-ghi-ho]" });
	await doiRong(tp, HEP);
	await moHopCapNhatKr();
	await chup(tp, "E18-step6.png", { sel: "[data-ghi-ho]" });
	await doiRong(tp, RONG);
	await moHopCapNhatKr();

	await bamChu(
		tp,
		`[data-hop-cap-nhat-kr='${KR.ot1}'] [data-o='tu-tin'] [data-slot='toggle-group-item']`,
		CHU.cao,
	);
	await doi(
		tp,
		"E18 buoc 5: nut gui cap nhat KR bat",
		() =>
			document.querySelector("[data-nut='gui-cap-nhat-kr']")?.disabled ===
			false,
	);
	await bamSel(tp, "[data-nut='gui-cap-nhat-kr']");
	await doi(
		tp,
		"E18 buoc 5: hop dong sau khi gui",
		() => document.querySelector("[data-hop-cap-nhat-kr]") === null,
	);

	await bamChu(tp, `[data-okr-sheet='${OKR.ot}'] [role='tab']`, CHU.traoDoi);
	await doi(
		tp,
		"E18 translate: tab Trao doi hien binh luan",
		() => document.querySelector("[data-binh-luan]") !== null,
	);
	await kiemKhongDich(
		tp,
		"E18 translate",
		"[data-binh-luan]",
		"Tuần này cần thêm người",
	);
	await kiemKhongDich(
		tp,
		"E18 translate",
		`[data-okr-sheet='${OKR.ot}']`,
		NGUOI.tp.ten,
	);
	await kiemKhongDich(
		tp,
		"E18 translate",
		`[data-okr-sheet='${OKR.ot}']`,
		`KR trao đổi ${MA}`,
	);
	await tp.close();

	const comment3 = await db.okrComment.findFirst({
		where: { objectiveId: OKR.ot, authorUserId: id.r },
		include: { mentions: true },
	});
	kiem(
		"E19: binh luan moi cua R co keyResultId KR1",
		comment3 !== null && comment3.keyResultId === KR.ot1,
	);
	kiem(
		"E19: binh luan moi co mention M",
		comment3 !== null && comment3.mentions.some((m) => m.userId === id.m),
	);
	const follow = await db.okrFollow.findUnique({
		where: { objectiveId_userId: { objectiveId: OKR.ot, userId: id.r } },
	});
	kiem("E19: okrFollow (OT, R) ton tai", follow !== null);
	const checkInMoi = await db.okrCheckIn.findFirst({
		where: { keyResultId: KR.ot1, authorUserId: id.tp },
		orderBy: { createdAt: "desc" },
		include: { session: true },
	});
	kiem(
		"E19: checkIn moi cua KR1 co authorUserId TP, onBehalf true, entry sheet",
		checkInMoi !== null &&
			checkInMoi.onBehalf === true &&
			checkInMoi.session.entry === "sheet",
	);
}

async function buocE23() {
	const q = await moTrang(cookie.admin, RONG, "/settings/members", "E23");
	await hienSel(q, "input[placeholder]");
	await q.type("input[placeholder]", NGUOI.nguoiDi.email);
	await cho(600);
	await q.waitForNetworkIdle({ idleTime: 400, timeout: CHO }).catch(() => null);
	const trigger = `button:has(span)`;
	const tay = await q.evaluateHandle((ten) => {
		const chu = `Đổi vai trò của ${ten}`;
		return (
			[...document.querySelectorAll("button")].find((b) =>
				b.textContent?.includes(chu),
			) ?? null
		);
	}, NGUOI.nguoiDi.ten);
	const el = tay.asElement();
	kiem("E23 buoc 1: thay nut menu hang nguoi di", el !== null);
	if (el) await el.click();
	await doi(
		q,
		"E23 buoc 1: menu mo",
		() => document.querySelector("[role='menuitem']") !== null,
	);
	const mucMenu = await q.evaluate(() =>
		[...document.querySelectorAll("[role='menuitem']")].map((e) =>
			e.textContent?.trim(),
		),
	);
	kiem(
		`E23 buoc 1: menu co «${CHU.chuyenViecMenu}» va «${CHU.chuyenOkrMenu}»`,
		mucMenu.some((m) => m === CHU.chuyenViecMenu) &&
			mucMenu.some((m) => m === CHU.chuyenOkrMenu),
	);
	await chup(q, "E23-step1.png", { sel: "[role='menuitem']" });

	await bamChu(q, "[role='menuitem']", CHU.chuyenOkrMenu);
	await doi(
		q,
		"E23 buoc 2: hop chuyen OKR mo",
		(ten) => document.body.textContent?.includes(ten),
		NGUOI.nguoiDi.ten,
	);
	await doi(q, "E23 buoc 2: cau co viec hien", () => {
		const chu = document.querySelector("[role='dialog']")?.textContent ?? "";
		return chu.includes("2 KR") && chu.includes("1 mục tiêu");
	});
	await chonTuySelect(q, "[role='dialog'] [role='combobox']", NGUOI.r.ten);
	await bamChu(q, "[role='dialog'] button", CHU.xacNhanChuyen);
	await doi(q, "E23 buoc 2: toast xac nhan", () =>
		[...document.querySelectorAll("[data-sonner-toast]")].some((e) =>
			e.textContent?.includes("Đã chuyển"),
		),
	);
	await chup(q, "E23-step2.png", { sel: "[data-sonner-toast]" });
	await doiRong(q, HEP);
	await chup(q, "E23-step3.png", { sel: "[data-sonner-toast]" });
	await doiRong(q, RONG);

	const tay2 = await q.evaluateHandle((ten) => {
		const chu = `Đổi vai trò của ${ten}`;
		return (
			[...document.querySelectorAll("button")].find((b) =>
				b.textContent?.includes(chu),
			) ?? null
		);
	}, NGUOI.nguoiDi.ten);
	const el2 = tay2.asElement();
	if (el2) await el2.click();
	await doi(
		q,
		"E23: menu mo lan hai",
		() => document.querySelector("[role='menuitem']") !== null,
	);
	await bamChu(q, "[role='menuitem']", CHU.chuyenOkrMenu);
	await doi(
		q,
		"E23 buoc 4: hop chuyen OKR mo lan hai",
		(ten) => document.body.textContent?.includes(ten),
		NGUOI.nguoiDi.ten,
	);
	await doi(
		q,
		"E23 buoc 4: cau khong phu trach hien",
		() =>
			document
				.querySelector("[role='dialog']")
				?.textContent?.includes("không phụ trách KR hay mục tiêu nào") ?? false,
	);
	const dangDisabled = await q.evaluate(() => {
		const nut = [...document.querySelectorAll("[role='dialog'] button")].find(
			(b) => b.textContent?.trim() === "Chuyển",
		);
		return nut?.disabled === true;
	});
	kiem("E23 buoc 4: nut xac nhan disabled", dangDisabled);
	await chup(q, "E23-step4.png", { sel: "[role='dialog']" });
	await q.close();

	const krDi1 = await db.okrKeyResult.findUnique({
		where: { id: KR.di1 },
		select: { ownerUserId: true },
	});
	const krDi2 = await db.okrKeyResult.findUnique({
		where: { id: KR.di2 },
		select: { ownerUserId: true },
	});
	const objDi = await db.okrObjective.findUnique({
		where: { id: OKR.di },
		select: { ownerUserId: true },
	});
	kiem(
		`E23: hai KR cua nguoi di phai co chu moi la R, thay ${krDi1?.ownerUserId}/${krDi2?.ownerUserId}`,
		krDi1?.ownerUserId === id.r && krDi2?.ownerUserId === id.r,
	);
	kiem(
		`E23: muc tieu cua nguoi di phai co chu moi la R, thay ${objDi?.ownerUserId}`,
		objDi?.ownerUserId === id.r,
	);
}

async function suaKrTrongSheet(trang, objectiveId, krTitle) {
	await trang.goto(`${APP}/${slug}/deals?record=objective:${objectiveId}`, {
		waitUntil: "load",
		timeout: CHO_TAI,
	});
	await doi(
		trang,
		"E29: sheet muc tieu hien",
		(id) => document.querySelector(`[data-okr-sheet='${id}']`) !== null,
		objectiveId,
	);
	await cho(CHO_HYDRATE_MS);
	await bamSel(trang, `button[aria-label='Thao tác với ${krTitle}']`);
	await doi(
		trang,
		"E29: menu KR mo",
		() => document.querySelector("[role='menuitem']") !== null,
	);
	await bamChu(trang, "[role='menuitem']", CHU.suaMenu);
	await hienSel(trang, "[data-hop-thoai-kr]");
}

const coHopSuaKr = (trang) =>
	trang.evaluate(
		() =>
			document
				.querySelector("[data-hop-thoai-kr]")
				?.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) ===
			true,
	);

async function moLaiHopSuaKr(trang, krTitle) {
	if (await coHopSuaKr(trang)) return;
	await bamSel(trang, `button[aria-label='Thao tác với ${krTitle}']`);
	await doi(
		trang,
		"E29: menu KR mo lai",
		() => document.querySelector("[role='menuitem']") !== null,
	);
	await bamChu(trang, "[role='menuitem']", CHU.suaMenu);
	await hienSel(trang, "[data-hop-thoai-kr]");
}

async function buocE29() {
	const tp = await moTrang(cookie.tp, RONG, "", "E29");
	await suaKrTrongSheet(tp, OKR.o29a, `KR29a ${MA}`);
	const oHienA = await tp.evaluate(() => {
		const e = document.querySelector("[data-o-hien-tai]");
		return e ? { readOnly: e.readOnly, disabled: e.disabled } : null;
	});
	kiem(
		"E29 buoc 2: KR a o hien tai readonly (khong disabled)",
		oHienA !== null && oHienA.readOnly === true && oHienA.disabled === false,
	);
	const hrefLink = await tp.evaluate(
		() =>
			document.querySelector("[data-hop-thoai-kr] a")?.getAttribute("href") ??
			null,
	);
	kiem(
		`E29 buoc 2: lien ket Cap nhat tuan phai tro ${`/${slug}/okr/cap-nhat-tuan`}, thay ${hrefLink}`,
		hrefLink === `/${slug}/okr/cap-nhat-tuan`,
	);
	await chup(tp, "E29-step1.png", { sel: "[data-hop-thoai-kr]" });
	await doiRong(tp, HEP);
	await moLaiHopSuaKr(tp, `KR29a ${MA}`);
	await chup(tp, "E29-step2.png", { sel: "[data-hop-thoai-kr]" });
	await doiRong(tp, RONG);
	await moLaiHopSuaKr(tp, `KR29a ${MA}`);

	await ganGiaTri(tp, "[data-o-dich]", "60");
	await doi(
		tp,
		"E29: nut Luu bat",
		() => document.querySelector("[data-nut='gui-kr']")?.disabled === false,
	);
	await bamSel(tp, "[data-nut='gui-kr']");
	await doi(
		tp,
		"E29: hop dong sau Luu",
		() => document.querySelector("[data-hop-thoai-kr]") === null,
	);

	const krASau = await db.okrKeyResult.findUnique({ where: { id: KR.k29a } });
	kiem(
		`E29: targetValue KR a phai 60, thay ${krASau ? Number(krASau.targetValue) : "?"}`,
		krASau !== null && Number(krASau.targetValue) === 60,
	);
	kiem(
		`E29: currentValue KR a khong doi (10), thay ${krASau ? Number(krASau.currentValue) : "?"}`,
		krASau !== null && Number(krASau.currentValue) === 10,
	);

	await bamSel(tp, `button[aria-label='Thao tác với KR29a ${MA}']`);
	await doi(
		tp,
		"E29: menu KR mo lai",
		() => document.querySelector("[role='menuitem']") !== null,
	);
	await bamChu(tp, "[role='menuitem']", CHU.suaMenu);
	await hienSel(tp, "[data-hop-thoai-kr]");
	await bamChu(tp, "[data-hop-thoai-kr] a", CHU.capNhatTuanLink);
	await doi(
		tp,
		"E29 buoc 3: URL sang cap-nhat-tuan",
		(s) => new URL(location.href).pathname.endsWith(s),
		"/okr/cap-nhat-tuan",
	);
	await chup(tp, "E29-step3.png", { sel: "[data-kr]" });

	await suaKrTrongSheet(tp, OKR.o29b, `KR29b ${MA}`);
	const oHienB = await tp.evaluate(() => {
		const e = document.querySelector("[data-o-hien-tai]");
		return e
			? {
					readOnly: e.readOnly,
					lienKet: document.querySelector("[data-hop-thoai-kr] a") !== null,
				}
			: null;
	});
	kiem(
		"E29 buoc 4: KR b o hien tai sua duoc",
		oHienB !== null && oHienB.readOnly === false,
	);
	kiem(
		"E29 buoc 4: KR b khong co dong dan cap nhat tuan",
		oHienB !== null && oHienB.lienKet === false,
	);
	await ganGiaTri(tp, "[data-o-hien-tai]", "5");
	await doi(
		tp,
		"E29: nut Luu bat cho KR b",
		() => document.querySelector("[data-nut='gui-kr']")?.disabled === false,
	);
	await bamSel(tp, "[data-nut='gui-kr']");
	await doi(
		tp,
		"E29: hop dong sau Luu KR b",
		() => document.querySelector("[data-hop-thoai-kr]") === null,
	);
	await chup(tp, "E29-step4.png", {
		sel: `[data-okr-sheet='${OKR.o29b}'] [role='tab']`,
	});
	const krBSau = await db.okrKeyResult.findUnique({ where: { id: KR.k29b } });
	kiem(
		`E29: currentValue KR b phai 5, thay ${krBSau ? Number(krBSau.currentValue) : "?"}`,
		krBSau !== null && Number(krBSau.currentValue) === 5,
	);

	await suaKrTrongSheet(tp, OKR.o29c, `KR29c ${MA}`);
	const oHienC = await tp.evaluate(() => {
		const e = document.querySelector("[data-o-hien-tai]");
		return e
			? {
					readOnly: e.readOnly,
					lienKet: document.querySelector("[data-hop-thoai-kr] a") !== null,
				}
			: null;
	});
	kiem(
		"E29 buoc 5: KR c (cong bo, chu ky lap-ke-hoach) o hien tai sua duoc",
		oHienC !== null && oHienC.readOnly === false,
	);
	kiem(
		"E29 buoc 5: KR c khong co dong dan cap nhat tuan",
		oHienC !== null && oHienC.lienKet === false,
	);
	await ganGiaTri(tp, "[data-o-hien-tai]", "6");
	await doi(
		tp,
		"E29: nut Luu bat cho KR c",
		() => document.querySelector("[data-nut='gui-kr']")?.disabled === false,
	);
	await bamSel(tp, "[data-nut='gui-kr']");
	await doi(
		tp,
		"E29: hop dong sau Luu KR c",
		() => document.querySelector("[data-hop-thoai-kr]") === null,
	);
	await chup(tp, "E29-step5.png", {
		sel: `[data-okr-sheet='${OKR.o29c}'] [role='tab']`,
	});
	const krCSau = await db.okrKeyResult.findUnique({ where: { id: KR.k29c } });
	kiem(
		`E29: currentValue KR c phai 6, thay ${krCSau ? Number(krCSau.currentValue) : "?"}`,
		krCSau !== null && Number(krCSau.currentValue) === 6,
	);

	await tp.close();
}

const CHI = process.env.CHI
	? new Set(process.env.CHI.split(",").map((s) => s.trim()))
	: null;
const chay = (khoi) => CHI === null || khoi.some((k) => CHI.has(k));

try {
	if (chay(["E6", "E7"])) await buocE6E7();
	if (chay(["E13", "E14"])) await buocE13E14();
	if (chay(["E16"])) await buocE16();
	if (chay(["E18", "E19"])) await buocE18E19();
	if (chay(["E23"])) await buocE23();
	if (chay(["E29"])) await buocE29();
} catch (e) {
	hong.push(`ngoai le: ${e.stack ?? e.message}`);
} finally {
	const { writeFileSync } = await import("node:fs");
	for (const [nhom, dong] of Object.entries(mangMang)) {
		if (nhom === "E6") continue;
		writeFileSync(
			join(BANG_CHUNG, `${nhom}-network.txt`),
			dong.length === 0
				? "khong co request that bai hay loi console\n"
				: `${dong.join("\n")}\n`,
		);
	}
	await trinhDuyet.close().catch(() => {});
	await donDep().catch((e) => hong.push(`don dep hong: ${e.message}`));
}

console.log(`man-cap-nhat: ${anh.length} anh o ${BANG_CHUNG}`);
for (const a of anh) console.log(`  anh ${a}`);
console.log(`man-cap-nhat: ${khang} khang dinh, ${hong.length} hong`);
for (const h of hong) console.log(`  HONG: ${h}`);
await ket(hong.length ? 1 : 0);
