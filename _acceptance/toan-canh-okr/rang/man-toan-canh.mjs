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
	join(GOC, ".acceptance-runs", "toan-canh-okr", "evidence");
const CUA_CHAN = process.env.CUA_CHAN_URL ?? "http://localhost:3932";
const RONG = 1440;
const HEP = 390;
const CAO = 900;
const CHO = 30_000;
const CHO_HYDRATE_MS = 800;
const PHUT_MS = 60_000;
const NGAY_MS = 24 * 60 * PHUT_MS;
const MA = `t${Date.now().toString(36).slice(-6)}`;
const LOI_HYDRATE = /hydrat/i;

const MOI_EVAL = [
	"E2",
	"E3",
	"E5",
	"E10",
	"E14",
	"E17",
	"E19",
	"E21",
	"E23",
	"E28",
	"E29",
];

const CHU = {
	cayCanChinh: "Cây căn chỉnh toàn công ty",
	cayDonVi: "Cây đơn vị",
	cungHien: "cũng hiện ở chỗ góp kia",
	khongKhop: "Không mục tiêu nào khớp bộ lọc",
	boLoc: "Bỏ lọc",
	phuTrach: "Người phụ trách",
	phongBanChinh: "Phòng ban chính",
	quanLy: "Quản lý trực tiếp",
	suKhoe: "Sức khoẻ chương trình",
	khongQuyen: "Chỉ quản trị xem được sức khoẻ chương trình",
	chuaCongBo: "KR của mục tiêu chưa công bố",
	thieuKhoiDiem: "thiếu khởi điểm",
	chuaCoTruong: "Chưa có trưởng",
	thuLai: "Thử lại",
	tuanDau: "Chưa có số để so",
	tuanDauMoTa: "Tiến độ hiện ở đây khi các đơn vị công bố mục tiêu của kỳ này.",
	danhSach: "Danh sách",
	hopTuan: "Họp tuần",
	conLai1: "Còn lại 1 KR",
	yenAng: "Tuần này không KR nào đáng bàn",
	tutCaoThap: "Tụt từ tự tin cao xuống tự tin thấp",
	tutVuaThap: "Tụt từ tự tin vừa xuống tự tin thấp",
	tutCaoVua: "Tụt từ tự tin cao xuống tự tin vừa",
	im15: "Im 15 ngày",
	ghiChuMoi: "Ghi chú mới",
	dienBien: "Diễn biến",
	dich85: "Đích 85%",
	thap: "Tự tin thấp",
	henNgay: "tuần bắt đầu Thứ Hai",
	hienTai: "hiện tại",
	daDong: "đã đóng",
	toanCanhTab: "Toàn cảnh",
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
		? `man-toan-canh: chay tron ${MOI_EVAL.length} eval; chay rieng mot eval: EVAL=E19 (ma: ${MOI_EVAL.join(", ")})`
		: `man-toan-canh: chi chay ${[...CHON].join(", ")}`,
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

if (chon(["E10"])) {
	const res = await fetch(`${CUA_CHAN}/__cua-chan/trang-thai`).catch(
		() => null,
	);
	if (!res?.ok)
		await khongDo(
			`KHONG DO DUOC: cua chan khong toi duoc o ${CUA_CHAN}.`,
			"    E10 chan truy van o giua app va api: chay rang/cua-chan.mjs cua cap-nhat-tuan-okr (CUA_CHAN_PORT=3932 CUA_CHAN_NANG=http://localhost:3931) va tro API_URL, NEXT_PUBLIC_API_URL cua app 3930 vao no.",
		);
	await fetch(`${CUA_CHAN}/__cua-chan/bo`, { method: "POST" });
}

const homNay = new Intl.DateTimeFormat("en-CA", {
	timeZone: "Asia/Ho_Chi_Minh",
}).format(new Date());
const NAM = Number(homNay.slice(0, 4));
const QUY = Math.ceil(Number(homNay.slice(5, 7)) / 3);
const QUY_DONG = QUY === 1 ? 4 : QUY - 1;
const NAM_DONG = QUY === 1 ? NAM - 1 : NAM;
const ngay = (y, m, d) =>
	`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const cuoiThang = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const dauTuanMs = (d) => {
	const s = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	}).format(d);
	const ms = Date.parse(`${s}T00:00:00Z`);
	return ms - ((new Date(ms).getUTCDay() + 6) % 7) * NGAY_MS;
};
const tuanNayVN = () =>
	new Date(dauTuanMs(new Date())).toISOString().slice(0, 10);
const nhanNgay = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
const tuanNayLuc = (phut) =>
	new Date(
		Math.max(
			dauTuanMs(new Date()) + phut * PHUT_MS,
			Date.now() - (60 - phut) * PHUT_MS,
		),
	);
const truocNgay = (n) => new Date(Date.now() - n * NGAY_MS);
const TUAN_DIEN_BIEN = 6;

const NGUOI = {
	admin: { email: `a${MA}@thu.test`, vai: "admin", ten: "Nguyễn Minh An" },
	truongB: { email: `b${MA}@thu.test`, vai: "member", ten: "Trần Thu Bình" },
	truongP1: { email: `p${MA}@thu.test`, vai: "member", ten: "Phạm Thu Lan" },
	truongP3: { email: `q${MA}@thu.test`, vai: "member", ten: "Vũ Thanh Hà" },
	k: { email: `k${MA}@thu.test`, vai: "member", ten: "Đỗ Quang Khải" },
	chiOkr: { email: `o${MA}@thu.test`, vai: "okr", ten: "Lê Hồng Ngọc" },
};

const TEN = {
	B: `Khối Kinh doanh ${MA}`,
	P1: `Phòng Đối tác ${MA}`,
	P2: `Phòng Hậu cần ${MA}`,
	C: `Khối Vận hành ${MA}`,
	P3: `Phòng Pháp chế ${MA}`,
	P4: `Phòng Dự án chưa xếp ${MA}`,
	G1: "Mở rộng mạng lưới đối tác toàn OneHub",
	K1: "Số đối tác hoạt động",
	B1: "Khối Kinh doanh tăng doanh thu từ đối tác",
	P1a: "Đối tác mới được đỡ trọn tháng đầu",
	P1b: "Chuẩn hoá quy trình nhận đối tác",
	P2a: "Kho hàng giao trong ngày",
	P3a: "Hợp đồng đối tác duyệt trong ba ngày",
	D: `Khối Họp tuần ${MA}`,
	PH: `Phòng Chăm sóc đối tác ${MA}`,
	PY: `Phòng Yên ắng ${MA}`,
	H: "Chăm sóc đối tác sau ký",
	Ka: "Đối tác được gọi lại trong 24 giờ",
	Kb: "Hợp đồng gia hạn đúng hạn",
	Kc: "Đối tác chấm hài lòng từ 4/5",
	Kd: "Đối tác mới có người kèm",
	Ke: "Buổi đào tạo đối tác mỗi tháng",
	Kf: "Phiếu hỗ trợ đóng trong hai ngày",
	Y: "Giữ nhịp phòng yên ắng",
	Ky: "Báo cáo tuần gửi đúng hạn",
	PD: `Phòng Chất lượng ${MA}`,
	DB: "Nâng mức hài lòng của đối tác",
	Kso: "Tỷ lệ đối tác hài lòng",
	Kmoc: "Ra mắt cổng góp ý cho đối tác",
	Kchua: "Số đối tác giới thiệu thêm",
	PT: `Phòng Khách hàng lớn ${MA}`,
	T: "Giữ chân khách hàng lớn",
	SB: `Khối Sức khoẻ ${MA}`,
	SP1: `Phòng Triển khai ${MA}`,
	SP2: `Phòng Hỗ trợ ${MA}`,
	PK: `Phòng Chu kỳ ${MA}`,
	TQ3: `TCO-Q${QUY_DONG}-${MA}`,
	TQ4: `TCO-Q${QUY}-${MA}`,
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

const cookie = {};
const id = {};
const ORG = {};
const OKR = {};
const CAI = { ky: [], bp: [], pb: [], phu: [], vaiK: false };

async function taoBp(ten) {
	const r = await lam(cookie.admin, "org.createDivision", { name: ten });
	CAI.bp.push(r.id);
	return r.id;
}

async function taoPb(ten, divisionId) {
	const r = await lam(cookie.admin, "org.createDepartment", {
		name: ten,
		divisionId,
	});
	CAI.pb.push(r.id);
	return r.id;
}

const xep = (userId, pb, managerUserId = null, phu = []) =>
	lam(cookie.admin, "org.setPlacement", {
		userId,
		primaryDepartmentId: pb,
		secondaryDepartmentIds: phu,
		managerUserId,
	});

const datTruong = (kind, donId, userId) =>
	lam(cookie.admin, "org.setHead", { kind, id: donId, userId });

async function nguoiPhu(tag, ten) {
	const uid = `u-${MA}-${tag}`;
	await db.user.create({
		data: { id: uid, name: ten, email: `${uid}@thu.test` },
	});
	await db.member.create({
		data: {
			id: `member-${uid}`,
			organizationId: WORKSPACE_ID,
			userId: uid,
			role: "member",
			createdAt: new Date(),
		},
	});
	CAI.phu.push(uid);
	return uid;
}

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

const taoNam = (nam) =>
	taoKy(
		"nam",
		`Năm ${nam} ${MA}`,
		null,
		ngay(nam, 1, 1),
		ngay(nam, 12, 31),
		"lap-ke-hoach",
	);

const taoQuy = (namId, nam, quy, pha) =>
	taoKy(
		"quy",
		`Quý ${quy}/${nam} ${MA}`,
		namId,
		ngay(nam, quy * 3 - 2, 1),
		ngay(nam, quy * 3, cuoiThang(nam, quy * 3)),
		pha,
	);

async function kyDangChay() {
	const nam = await taoNam(NAM);
	return { nam, quy: await taoQuy(nam, NAM, QUY, "dang-chay") };
}

async function kyDangChayTu(batDauMs) {
	const nam = await taoNam(NAM);
	const dauQuy = ngay(NAM, QUY * 3 - 2, 1);
	const tu = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Ho_Chi_Minh",
	}).format(new Date(batDauMs));
	const batDau = tu < dauQuy && tu.startsWith(String(NAM)) ? tu : dauQuy;
	const quy = await taoKy(
		"quy",
		`Quý ${QUY}/${NAM} ${MA}`,
		nam,
		batDau,
		ngay(NAM, QUY * 3, cuoiThang(NAM, QUY * 3)),
		"dang-chay",
	);
	return { nam, quy };
}

async function moi(c, cycleId, unit, title, owner, krs, them = {}) {
	const mt = await lam(c, "okr.createObjective", {
		cycleId,
		unit,
		title,
		kind: "cam-ket",
		ownerUserId: owner,
		participantIds: [],
		whyNow: "",
		...them,
	});
	const kr = [];
	for (const k of krs) kr.push(await taoKr(c, mt.id, k));
	return { id: mt.id, kr };
}

async function taoKr(c, objectiveId, k) {
	const r = await lam(c, "okr.createKeyResult", {
		objectiveId,
		kind: "tang-toi",
		startValue: 0,
		dueOn: null,
		weight: 1,
		unit: "đối tác",
		...k,
	});
	return r.id;
}

const congBo = (c, objectiveId) =>
	lam(c, "okr.publishObjective", { id: objectiveId });

async function lui(objectiveId, luc) {
	await db.okrObjective.update({
		where: { id: objectiveId },
		data: { publishedAt: luc },
	});
	await db.okrKeyResult.updateMany({
		where: { objectiveId },
		data: { startLockedAt: luc },
	});
}

const muc = (keyResultId, value, confidence, note = "") => ({
	keyResultId,
	value,
	confidence,
	note,
});

async function capNhat(c, items, luc = null) {
	const { sessionId } = await lam(c, "okr.moCapNhat", { entry: "tab" });
	await lam(c, "okr.guiCapNhat", { sessionId, items });
	if (luc === null) return;
	await db.okrCheckInSession.update({
		where: { id: sessionId },
		data: { openedAt: luc, submittedAt: luc },
	});
	await db.okrCheckIn.updateMany({
		where: { sessionId },
		data: { weekStart: new Date(dauTuanMs(luc)), createdAt: luc },
	});
}

async function gieoLoc() {
	ORG.B = await taoBp(TEN.B);
	ORG.C = await taoBp(TEN.C);
	ORG.P1 = await taoPb(TEN.P1, ORG.B);
	ORG.P2 = await taoPb(TEN.P2, ORG.B);
	ORG.P3 = await taoPb(TEN.P3, ORG.C);
	ORG.P4 = await taoPb(TEN.P4, null);
	id.p2 = await nguoiPhu("p2", "Hoàng Văn Phúc");
	for (const [userId, pb, quanLy] of [
		[id.truongP1, ORG.P1, null],
		[id.k, ORG.P1, id.truongP1],
		[id.p2, ORG.P2, null],
		[id.truongP3, ORG.P3, null],
		[id.chiOkr, ORG.P2, null],
	])
		await xep(userId, pb, quanLy);
	await datTruong("division", ORG.B, id.truongB);
	await datTruong("department", ORG.P1, id.truongP1);
	await datTruong("department", ORG.P3, id.truongP3);
	const ky = await kyDangChay();
	OKR.nam = ky.nam;
	OKR.quy = ky.quy;
	const q = OKR.quy;
	OKR.G1 = await moi(cookie.admin, q, { level: "onehub" }, TEN.G1, id.admin, [
		{
			title: TEN.K1,
			ownerUserId: id.admin,
			targetValue: 120,
			currentValue: 45,
		},
	]);
	await congBo(cookie.admin, OKR.G1.id);
	OKR.B1 = await moi(
		cookie.truongB,
		q,
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
	await congBo(cookie.truongB, OKR.B1.id);
	OKR.P1a = await moi(
		cookie.truongP1,
		q,
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
	await congBo(cookie.truongP1, OKR.P1a.id);
	OKR.P1b = await moi(
		cookie.truongP1,
		q,
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
	OKR.P2a = await moi(
		cookie.truongB,
		q,
		{ level: "phong-ban", departmentId: ORG.P2 },
		TEN.P2a,
		id.p2,
		[
			{
				title: "Đơn giao trong ngày",
				ownerUserId: id.p2,
				targetValue: 90,
				currentValue: 30,
			},
		],
	);
	await lam(cookie.truongB, "okr.dropObjective", { id: OKR.P2a.id });
	OKR.P3a = await moi(
		cookie.truongP3,
		q,
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
	await congBo(cookie.truongP3, OKR.P3a.id);
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
}

async function gieoHop() {
	ORG.D = await taoBp(TEN.D);
	ORG.PH = await taoPb(TEN.PH, ORG.D);
	ORG.PY = await taoPb(TEN.PY, ORG.D);
	await xep(id.truongP1, ORG.PH, null, [ORG.PY]);
	await datTruong("department", ORG.PH, id.truongP1);
	await datTruong("department", ORG.PY, id.truongP1);
	const ky = await kyDangChay();
	OKR.nam = ky.nam;
	OKR.quy = ky.quy;
	const c = cookie.truongP1;
	OKR.H = await moi(
		c,
		OKR.quy,
		{ level: "phong-ban", departmentId: ORG.PH },
		TEN.H,
		id.truongP1,
		[TEN.Ka, TEN.Kb, TEN.Kc, TEN.Kd, TEN.Ke, TEN.Kf].map((title) => ({
			title,
			ownerUserId: id.truongP1,
			targetValue: 100,
			currentValue: 20,
		})),
	);
	await congBo(c, OKR.H.id);
	await lui(OKR.H.id, truocNgay(30));
	const [Ka, Kb, Kc, Kd, Ke, Kf] = OKR.H.kr;
	const tuanTruoc = new Date(Date.now() - 7 * NGAY_MS);
	await capNhat(c, [muc(Ka, 25, "vua")], tuanTruoc);
	await capNhat(c, [muc(Kb, 25, "cao")], tuanTruoc);
	await capNhat(c, [muc(Kc, 25, "cao")], tuanTruoc);
	await capNhat(c, [muc(Kd, 25, "cao")], truocNgay(15));
	await capNhat(
		c,
		[muc(Ke, 25, "vua", "Chờ đối tác duyệt lịch")],
		truocNgay(3),
	);
	await capNhat(c, [muc(Kb, 26, "thap")], tuanNayLuc(1));
	await capNhat(c, [muc(Ka, 26, "thap")], tuanNayLuc(2));
	await capNhat(c, [muc(Ka, 27, "thap")], tuanNayLuc(6));
	await capNhat(c, [muc(Kc, 27, "vua", "Đối tác lùi lịch ký")], tuanNayLuc(3));
	await capNhat(c, [muc(Kf, 30, "cao")], tuanNayLuc(4));
	OKR.Y = await moi(
		c,
		OKR.quy,
		{ level: "phong-ban", departmentId: ORG.PY },
		TEN.Y,
		id.truongP1,
		[
			{
				title: TEN.Ky,
				ownerUserId: id.truongP1,
				targetValue: 10,
				currentValue: 4,
			},
		],
	);
	await congBo(c, OKR.Y.id);
	await capNhat(c, [muc(OKR.Y.kr[0], 5, "cao")], tuanNayLuc(5));
}

async function gieoDien() {
	ORG.PD = await taoPb(TEN.PD, null);
	await xep(id.truongP1, ORG.PD);
	await datTruong("department", ORG.PD, id.truongP1);
	const ky = await kyDangChayTu(
		dauTuanMs(new Date()) - TUAN_DIEN_BIEN * 7 * NGAY_MS,
	);
	OKR.nam = ky.nam;
	OKR.quy = ky.quy;
	const c = cookie.truongP1;
	OKR.DB = await moi(
		c,
		OKR.quy,
		{ level: "phong-ban", departmentId: ORG.PD },
		TEN.DB,
		id.truongP1,
		[
			{
				title: TEN.Kso,
				ownerUserId: id.truongP1,
				startValue: 60,
				targetValue: 85,
				currentValue: 60,
				unit: "%",
			},
			{
				title: TEN.Kmoc,
				kind: "moc",
				ownerUserId: id.truongP1,
				startValue: 0,
				targetValue: 1,
				currentValue: 0,
				unit: "",
			},
			{
				title: TEN.Kchua,
				ownerUserId: id.truongP1,
				targetValue: 20,
				currentValue: 0,
			},
		],
	);
	await congBo(c, OKR.DB.id);
	const W0 = dauTuanMs(new Date());
	const tuan = (soTuan, gio) =>
		new Date(W0 - soTuan * 7 * NGAY_MS + NGAY_MS + gio * 60 * PHUT_MS);
	await lui(OKR.DB.id, new Date(W0 - 5 * 7 * NGAY_MS + NGAY_MS));
	const [Kso, Kmoc] = OKR.DB.kr;
	await capNhat(c, [muc(Kso, 62, "cao")], tuan(4, 9));
	await capNhat(c, [muc(Kso, 65, "vua")], tuan(3, 9));
	await capNhat(c, [muc(Kso, 66, "vua")], tuan(2, 9));
	await capNhat(c, [muc(Kso, 68, "vua")], tuan(2, 15));
	await capNhat(
		c,
		[muc(Kso, 70, "thap", "Đối tác lùi lịch khảo sát")],
		tuan(1, 9),
	);
	await capNhat(c, [muc(Kmoc, 0, "cao")], tuan(2, 10));
	await capNhat(c, [muc(Kmoc, 0, "vua", "Chờ bên pháp chế")], tuan(1, 10));
}

async function gieoTong() {
	ORG.PT = await taoPb(TEN.PT, null);
	await xep(id.truongP1, ORG.PT);
	await datTruong("department", ORG.PT, id.truongP1);
	await xep(id.k, ORG.PT);
	const ky = await kyDangChay();
	OKR.nam = ky.nam;
	OKR.quy = ky.quy;
	const c = cookie.truongP1;
	OKR.T = await moi(
		c,
		OKR.quy,
		{ level: "phong-ban", departmentId: ORG.PT },
		TEN.T,
		id.truongP1,
		[],
	);
	const kr = (kind, hien, ten) =>
		taoKr(c, OKR.T.id, {
			title: ten,
			kind,
			ownerUserId: id.k,
			startValue: 0,
			targetValue: kind === "moc" ? 1 : 100,
			currentValue: hien,
			unit: kind === "moc" ? "" : "%",
		});
	const cao = await kr("tang-toi", 100, "Khách hàng lớn gia hạn");
	await congBo(c, OKR.T.id);
	await lui(OKR.T.id, truocNgay(60));
	const kv = (await hoi(c, "okr.objective", { id: OKR.T.id })).expected;
	if (!(kv > 0)) throw new Error(`ky vong cua muc tieu phai duong, thay ${kv}`);
	OKR.chua = await kr("tang-toi", 100, "Khách hàng lớn có đầu mối riêng");
	const thap = await kr("tang-toi", 100, "Khách hàng lớn họp quý đủ");
	const moc = await kr("moc", 0, "Chốt khung giá khách hàng lớn");
	const cham = await kr(
		"tang-toi",
		Math.round(kv * 0.7),
		"Khách hàng lớn dùng tính năng mới",
	);
	const truot = await kr("tang-toi", 0, "Khách hàng lớn mới ký");
	await capNhat(cookie.k, [muc(thap, 100, "thap")]);
	await capNhat(cookie.k, [muc(cao, 100, "cao")]);
	OKR.thuTuCuaToi = [truot, cham, moc, thap, cao];
}

async function gieoSuc() {
	ORG.SB = await taoBp(TEN.SB);
	ORG.SP1 = await taoPb(TEN.SP1, ORG.SB);
	ORG.SP2 = await taoPb(TEN.SP2, ORG.SB);
	await datTruong("division", ORG.SB, id.truongB);
	await xep(id.truongP1, ORG.SP1);
	await datTruong("department", ORG.SP1, id.truongP1);
	await db.zaloLink.create({
		data: {
			crmUserId: id.truongP1,
			zaloUserId: `zalo-${id.truongP1}`,
			zaloDisplayName: "Zalo",
		},
	});
	const nguoi = async (tag, ten, pb) => {
		const uid = await nguoiPhu(tag, ten);
		await xep(uid, pb);
		return uid;
	};
	const z1 = await nguoi("z1", "Mai Thị Zin", ORG.SP1);
	const z2 = await nguoi("z2", "Lâm Văn Zũ", ORG.SP1);
	const s1 = await nguoi("s1", "Tô Minh Sơn", ORG.SP1);
	const s0 = await nguoi("s0", "Tạ Thu Sương", ORG.SP1);
	await nguoi("x", "Kiều Văn Xuân", ORG.SP1);
	await nguoi("y1", "Ninh Thị Yến", ORG.SP2);
	await nguoi("y2", "Đàm Văn Yên", ORG.SP2);
	for (const uid of [z1, z2])
		await db.zaloLink.create({
			data: {
				crmUserId: uid,
				zaloUserId: `zalo-${uid}`,
				zaloDisplayName: "Zalo",
			},
		});
	await db.slackMemberMatch.create({
		data: { crmUserId: s1, slackUserId: `slack-${s1}` },
	});
	await db.slackMemberMatch.create({
		data: { crmUserId: s0, slackUserId: null },
	});
	const ky = await kyDangChay();
	OKR.nam = ky.nam;
	OKR.quy = ky.quy;
	const c = cookie.truongP1;
	const krs = (so) =>
		so.map((h, i) => ({
			title: `KR sức khoẻ ${h}.${i}`,
			ownerUserId: id.truongP1,
			targetValue: 100,
			currentValue: h,
		}));
	const cb = await moi(
		c,
		OKR.quy,
		{ level: "phong-ban", departmentId: ORG.SP1 },
		"Triển khai đúng hạn cho đối tác",
		id.truongP1,
		krs([20, 30, 40]),
	);
	await congBo(c, cb.id);
	await moi(
		c,
		OKR.quy,
		{ level: "phong-ban", departmentId: ORG.SP1 },
		"Bộ tài liệu triển khai mới",
		id.truongP1,
		krs([20, 30]),
	);
	const [k1, k2, k3] = cb.kr;
	await capNhat(c, [muc(k1, 30, "cao")], truocNgay(7));
	await capNhat(c, [muc(k2, 30, "vua")], truocNgay(7));
	await capNhat(c, [muc(k3, 30, "vua")], truocNgay(16));
}

async function gieoKy() {
	ORG.PK = await taoPb(TEN.PK, null);
	await xep(id.truongP1, ORG.PK);
	await datTruong("department", ORG.PK, id.truongP1);
	const nam = await taoNam(NAM);
	const namSau = await taoNam(NAM + 1);
	OKR.namSau = namSau;
	OKR.quyA = await taoQuy(
		NAM_DONG === NAM ? nam : await taoNam(NAM_DONG),
		NAM_DONG,
		QUY_DONG,
		"dang-chay",
	);
	OKR.quyB = await taoQuy(nam, NAM, QUY, "dang-chay");
	const c = cookie.truongP1;
	const don = { level: "phong-ban", departmentId: ORG.PK };
	OKR.TQ3 = await moi(c, OKR.quyA, don, TEN.TQ3, id.truongP1, [
		{
			title: "Hồ sơ quý này đóng đủ",
			ownerUserId: id.truongP1,
			targetValue: 10,
			currentValue: 4,
		},
	]);
	await congBo(c, OKR.TQ3.id);
	await capNhat(c, [muc(OKR.TQ3.kr[0], 5, "vua", "Còn hai hồ sơ chờ ký")]);
	OKR.TQ4 = await moi(c, OKR.quyB, don, TEN.TQ4, id.truongP1, [
		{
			title: "Hồ sơ quý sau mở đủ",
			ownerUserId: id.truongP1,
			targetValue: 10,
			currentValue: 2,
		},
		{
			title: "Lịch quý sau chốt xong",
			ownerUserId: id.truongP1,
			targetValue: 5,
			currentValue: 1,
		},
	]);
	await congBo(c, OKR.TQ4.id);
	await capNhat(c, [muc(OKR.TQ4.kr[0], 3, "vua", "Đã mở ba hồ sơ")]);
	await dongKy(OKR.quyA, c);
}

async function dongKy(cycleId, cookieCham) {
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: cycleId,
		phase: "cham-diem",
	});
	const dong = await db.okrDiemKr.findMany({
		where: { cycleId },
		select: { keyResultId: true, diemGoiY: true, thang: true },
	});
	for (const d of dong)
		await lam(cookieCham, "okr.chamKr", {
			keyResultId: d.keyResultId,
			diem:
				d.thang === "0-100"
					? Math.round(Number(d.diemGoiY) * 100)
					: Number(d.diemGoiY),
		});
	await lam(cookie.admin, "okr.setCyclePhase", {
		id: cycleId,
		phase: "da-dong",
	});
}

async function donNhom() {
	const moiKy = [...CAI.ky];
	const nguoi = [...Object.values(id), ...CAI.phu];
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
				{ actorUserId: { in: nguoi } },
			],
		},
	});
	await db.okrAlignment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrCheckIn.deleteMany({
		where: { keyResult: { objectiveId: { in: moiMt } } },
	});
	await db.okrCheckInSession.deleteMany({ where: { userId: { in: nguoi } } });
	await db.okrMention.deleteMany({
		where: { comment: { objectiveId: { in: moiMt } } },
	});
	await db.okrComment.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrFollow.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrDiemKr.deleteMany({ where: { cycleId: { in: moiKy } } });
	await db.okrKeyResult.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrParticipant.deleteMany({ where: { objectiveId: { in: moiMt } } });
	await db.okrObjective.deleteMany({ where: { id: { in: moiMt } } });
	await db.okrCycle.deleteMany({ where: { id: { in: moiKy }, kind: "quy" } });
	await db.okrCycle.deleteMany({ where: { id: { in: moiKy } } });
	await db.orgSecondaryDepartment.deleteMany({
		where: {
			OR: [{ departmentId: { in: CAI.pb } }, { userId: { in: nguoi } }],
		},
	});
	await db.orgPlacement.deleteMany({
		where: {
			OR: [{ userId: { in: nguoi } }, { primaryDepartmentId: { in: CAI.pb } }],
		},
	});
	await db.department.updateMany({
		where: { id: { in: CAI.pb } },
		data: { headUserId: null },
	});
	await db.department.deleteMany({ where: { id: { in: CAI.pb } } });
	await db.division.updateMany({
		where: { id: { in: CAI.bp } },
		data: { headUserId: null },
	});
	await db.division.deleteMany({ where: { id: { in: CAI.bp } } });
	await db.zaloLink.deleteMany({
		where: { crmUserId: { in: [...CAI.phu, ...Object.values(id)] } },
	});
	await db.slackMemberMatch.deleteMany({
		where: { crmUserId: { in: CAI.phu } },
	});
	await db.member.deleteMany({ where: { userId: { in: CAI.phu } } });
	await db.user.deleteMany({ where: { id: { in: CAI.phu } } });
	if (CAI.vaiK && id.k)
		await db.member.update({
			where: khoaThanhVien(id.k),
			data: { role: NGUOI.k.vai },
		});
	delete id.p2;
	CAI.ky = [];
	CAI.bp = [];
	CAI.pb = [];
	CAI.phu = [];
	CAI.vaiK = false;
	for (const k of Object.keys(OKR)) delete OKR[k];
	for (const k of Object.keys(ORG)) delete ORG[k];
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
let slug = "";

async function moTrang(c, rong, duong) {
	const trang = await trinhDuyet.newPage();
	const ghi = (d) => mang.push(`${new Date().toISOString()} ${d}`);
	trang.on("pageerror", (e) => {
		ghi(`pageerror ${String(e).slice(0, 3000)}`);
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
	await trang.evaluateOnNewDocument(() => {
		window.__hien = (e) =>
			e.checkVisibility() ||
			(getComputedStyle(e).display === "contents" &&
				(e.parentElement?.checkVisibility() ?? false));
		window.__tim = (s) =>
			[...document.querySelectorAll(s)].filter((e) => window.__hien(e));
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
	trang.evaluate((s) => window.__tim(s).length > 0, sel);
const demSel = (trang, sel) =>
	trang.evaluate((s) => window.__tim(s).length, sel);
const chuSel = (trang, sel) =>
	trang.evaluate(
		(s) => window.__tim(s)[0]?.textContent?.replace(/\s+/g, " ").trim() ?? "",
		sel,
	);
const thuocTinh = (trang, sel, ten) =>
	trang.evaluate(
		(s, t) => window.__tim(s).map((e) => e.getAttribute(t)),
		sel,
		ten,
	);
const hienSel = (trang, sel, nhan = `hien ${sel}`) =>
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
const coMat = (trang, sel, nhan = `co ${sel}`) =>
	doi(trang, nhan, (s) => window.__tim(s).length > 0, sel);
const thamSo = (trang, khoa) => new URL(trang.url()).searchParams.get(khoa);
const chuTrang = (trang) =>
	trang.evaluate(() => document.body.innerText.replace(/\s+/g, " ").trim());

async function bamChu(trang, sel, chu) {
	await trang.bringToFront();
	const tay = await trang.evaluateHandle(
		(s, c) =>
			window
				.__tim(s)
				.find((x) =>
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

async function taiLai(t) {
	await t.reload({ waitUntil: "load" });
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(CHO_HYDRATE_MS);
}

async function toi(t, duong) {
	await t.goto(`${APP}/${slug}${duong}`, { waitUntil: "load" });
	await t.waitForNetworkIdle({ idleTime: 500, timeout: CHO }).catch(() => null);
	await cho(CHO_HYDRATE_MS);
}

const giongNhau = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const loiGoiOkr = () =>
	trpc.flatMap((u) => {
		const url = new URL(u);
		const ten = decodeURIComponent(
			url.pathname.split("/api/trpc/")[1] ?? "",
		).split(",");
		const vao = JSON.parse(url.searchParams.get("input") ?? "{}");
		return ten.map((t, i) => [t, vao[String(i)]]);
	});

async function chan(thuTuc) {
	await fetch(`${CUA_CHAN}/__cua-chan/chan`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ thuTuc }),
	});
}

const boChan = () => fetch(`${CUA_CHAN}/__cua-chan/bo`, { method: "POST" });

const ky = () => `kyOkr=${OKR.quy}`;
const theoDonVi = (them) => `/okr/theo-don-vi?${ky()}${them ? `&${them}` : ""}`;

async function buocLoc() {
	const t = await moTrang(
		cookie.truongB,
		RONG,
		theoDonVi(`donOkr=bp:${ORG.B}`),
	);
	await hienSel(t, "[data-muc-tieu]");
	const bon = await thuocTinh(t, "[data-muc-tieu]", "data-muc-tieu");
	kiem(
		`E2 buoc 3: bo phan B hien dung 4 muc tieu B1, P1a, P1b, P2a, khong P3a (thay ${bon.length})`,
		giongNhau(
			[...bon].sort(),
			[OKR.B1.id, OKR.P1a.id, OKR.P1b.id, OKR.P2a.id].sort(),
		),
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
		() => window.__tim("[data-muc-tieu]").length === 1,
	);
	kiem(
		"E2 buoc 4: muc tieu con lai la P1a",
		await coSel(t, `[data-muc-tieu='${OKR.P1a.id}']`),
	);
	const danhSach = loiGoiOkr()
		.filter(([ten]) => ten === "okr.danhSach")
		.map(([, v]) => v);
	kiem(
		`E3: sau khi chon nguoi co loi goi okr.danhSach voi loc.phuTrach = [k] (input that: ${JSON.stringify(danhSach.map((v) => v?.loc))})`,
		danhSach.some((v) => giongNhau(v?.loc?.phuTrach, [id.k])),
	);
	const idManHinh = await thuocTinh(t, "[data-muc-tieu]", "data-muc-tieu");
	const tuApi = await hoi(cookie.truongB, "okr.danhSach", {
		cycleId: OKR.quy,
		unit: { loai: "bp", id: ORG.B },
		loc: { phuTrach: [id.k], loai: [], trangThai: [], tuTin: [] },
	});
	kiem(
		`E3: tap muc tieu tren man bang tap API tra (man ${idManHinh}, api ${tuApi.rows.map((r) => r.id)})`,
		giongNhau([...idManHinh].sort(), tuApi.rows.map((r) => r.id).sort()),
	);
	await chup(t, "E2-buoc-loc-2.png");

	await taiLai(t);
	kiem(
		"E2 buoc 4: tai lai trang van 1 muc tieu",
		(await demSel(t, "[data-muc-tieu]")) === 1,
	);

	await toi(
		t,
		theoDonVi(`donOkr=bp:${ORG.B}&phuTrachOkr=${id.k}&loaiOkr=cam-ket`),
	);
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
		() => window.__tim("[data-muc-tieu]").length === 4,
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
		await hienSel(n, "[data-don-vi]", "E2 buoc 6: dau trang mot nguoi");
		const dau = await chuSel(n, "[data-don-vi]");
		kiem(
			`E2 buoc 6: dau trang co ten k, phong ban chinh, quan ly truc tiep (thay: ${dau.slice(0, 160)})`,
			dau.includes(NGUOI.k.ten) &&
				dau.includes(CHU.phongBanChinh) &&
				dau.includes(TEN.P1) &&
				dau.includes(CHU.quanLy),
		);
		const hai = await thuocTinh(n, "[data-muc-tieu]", "data-muc-tieu");
		kiem(
			`E2 buoc 6: trang mot nguoi co dung 2 muc tieu P1a, P3a (thay ${hai.length})`,
			giongNhau([...hai].sort(), [OKR.P1a.id, OKR.P3a.id].sort()),
		);
		await chup(n, ten);
		await n.close();
	}
}

async function focusDau(t, nhan) {
	await t.evaluate((n) => {
		const e = window.__tim(
			`[role='tree'][aria-label='${n}'] [tabindex='0']`,
		)[0];
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
			chu: e?.textContent?.replace(/\s+/g, " ").trim().slice(0, 60) ?? "",
		};
	});

async function buocCay() {
	const t = await moTrang(cookie.truongP1, RONG, theoDonVi("xemOkr=cay"));
	await hienSel(t, `[role='tree'][aria-label='${CHU.cayCanChinh}']`);
	const hang = () =>
		t.evaluate(
			(n) =>
				window
					.__tim(`[role='tree'][aria-label='${n}'] [role='treeitem']`)
					.map((e) => e.getAttribute("data-cay-khoa")),
			CHU.cayCanChinh,
		);
	kiem(
		"E5: cay can chinh co role=tree va treeitem aria-level 1",
		await coSel(
			t,
			`[role='tree'][aria-label='${CHU.cayCanChinh}'] [role='treeitem'][aria-level='1']`,
		),
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
	console.log(
		`  E5 tieu diem tung buoc: ${buoc.map(([k, d]) => `${k}=«${d.chu}»`).join(" → ")}`,
	);
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

	await t.evaluate(
		(n, b1) => {
			const e = window
				.__tim(
					`[role='tree'][aria-label='${n}'] [data-nut-can-chinh='${b1}']`,
				)[1]
				?.closest("[role='treeitem']");
			if (e instanceof HTMLElement) e.focus();
		},
		CHU.cayCanChinh,
		OKR.B1.id,
	);
	await cho(150);
	await chup(t, "E5-buoc-cay-3.png");
	await t.keyboard.press("Enter");
	await doi(
		t,
		"E5: Enter tren B1 mo sheet cua B1",
		(b1) =>
			new URL(location.href).searchParams.get("record") === `objective:${b1}`,
		OKR.B1.id,
	);
	await t.close();

	const p = await moTrang(
		cookie.truongP1,
		RONG,
		theoDonVi(`donOkr=nguoi:${id.k}`),
	);
	const cayDonVi = `[role='tree'][aria-label='${CHU.cayDonVi}']`;
	await hienSel(p, cayDonVi, "E5: trang mot nguoi co cay don vi");
	const tab0 = await demSel(p, `${cayDonVi} [tabindex='0']`);
	kiem(
		`E5 (AC-3): trang mot nguoi, cay don vi co dung mot muc trong thu tu Tab (thay ${tab0})`,
		tab0 === 1,
	);
	let tabNguoi = 0;
	while (tabNguoi < 60) {
		await p.keyboard.press("Tab");
		tabNguoi += 1;
		if (
			await p.evaluate(
				(s) => document.activeElement?.closest(s) !== null,
				cayDonVi,
			)
		)
			break;
	}
	kiem(
		`E5 (AC-3): trang mot nguoi, Tab toi duoc cay don vi (${tabNguoi} lan Tab)`,
		await p.evaluate(
			(s) => document.activeElement?.closest(s) !== null,
			cayDonVi,
		),
	);
	await chup(p, "E5-buoc-cay-5.png");
	await p.close();

	const u = await moTrang(cookie.truongP1, RONG, theoDonVi());
	await hienSel(u, `[role='tree'][aria-label='${CHU.cayDonVi}']`);
	await focusDau(u, CHU.cayDonVi);
	await u.keyboard.press("ArrowDown");
	await cho(200);
	const den = await dangCo(u);
	await u.keyboard.press("Enter");
	await doi(
		u,
		`E5: Enter tren don vi doi URL donOkr sang ${den.khoa}`,
		(k) => new URL(location.href).searchParams.get("donOkr") === k,
		den.khoa,
	);
	await chup(u, "E5-buoc-cay-4.png");
	await u.close();
}

async function buocToanCanh() {
	const api = await hoi(cookie.chiOkr, "okr.toanCanh", { cycleId: OKR.quy });
	const cuaTa = [
		`bp:${ORG.B}`,
		`pb:${ORG.P1}`,
		`pb:${ORG.P2}`,
		`bp:${ORG.C}`,
		`pb:${ORG.P3}`,
		`pb:${ORG.P4}`,
	];
	const tenCuaTa = [TEN.B, TEN.P1, TEN.P2, TEN.C, TEN.P3, TEN.P4];
	const o = await moTrang(cookie.chiOkr, RONG, `/okr/toan-canh?${ky()}`);
	await hienSel(o, "[data-hang-toan-canh]", "E10 buoc 2: bang theo don vi");
	const hang = await o.evaluate(() =>
		window.__tim("[data-hang-toan-canh]").map((e) => ({
			khoa: e.getAttribute("data-hang-toan-canh"),
			ten: e.querySelector("td")?.textContent?.replace(/\s+/g, " ").trim(),
		})),
	);
	kiem(
		`E10 buoc 2: hang dau la goc OneHub (thay ${hang[0]?.khoa})`,
		hang[0]?.khoa === api.hang[0]?.key && !cuaTa.includes(hang[0]?.khoa),
	);
	const cuaTaTrenMan = hang.filter((h) => cuaTa.includes(h.khoa));
	kiem(
		`E10 buoc 2: thu tu hang cua E8 [B, P1, P2, C, P3, P4 chua xep] (thay ${cuaTaTrenMan.map((h) => h.ten).join(" | ")})`,
		giongNhau(
			cuaTaTrenMan.map((h) => h.ten),
			tenCuaTa,
		),
	);
	kiem(
		`E10 buoc 2: bon the so (thay ${await demSel(o, "[data-slot='stat-card']")})`,
		(await demSel(o, "[data-slot='stat-card']")) === 4,
	);
	kiem(
		"E10 buoc 2: thanh tien do trung tinh, khong bg-primary",
		(await demSel(o, "[data-slot='progress'][data-variant='neutral']")) > 0 &&
			(await demSel(o, "[data-hang-toan-canh] .bg-primary")) === 0,
	);
	kiem(
		"E10 buoc 2: vai chi OKR khong thay nut Suc khoe chuong trinh",
		!(await coSel(o, "[data-nut='suc-khoe']")),
	);
	await chup(o, "E10-buoc-toan-canh-1.png");
	await o.close();

	const a = await moTrang(cookie.admin, RONG, `/okr/toan-canh?${ky()}`);
	await hienSel(a, "[data-hang-toan-canh]");
	kiem(
		"E10 buoc 3: quan tri thay nut Suc khoe chuong trinh",
		await coSel(a, "[data-nut='suc-khoe']"),
	);
	await chup(a, "E10-buoc-toan-canh-2.png");
	kiem(
		"E10: heatmap co mot hang moi don vi va cot tuan hien tai",
		(await coSel(a, "[data-khoi='heatmap'] [data-current]")) &&
			(await demSel(a, "[data-khoi='heatmap'] tbody tr")) === api.hang.length,
	);
	await chupKhoi(a, "[data-khoi='heatmap']", "E10-buoc-heatmap.png");
	await a.setViewport({ width: HEP, height: CAO });
	await cho(700);
	await chup(a, "E10-buoc-toan-canh-3.png");
	await a.close();

	try {
		await chan("okr.toanCanh");
		const l = await moTrang(cookie.admin, RONG, `/okr/toan-canh?${ky()}`);
		if (
			await hienSel(
				l,
				"[data-trang-thai='ST-toancanh-loi']",
				"E10 buoc 4: okr.toanCanh tra 500 thi hien Empty loi",
			)
		) {
			kiem(
				"E10 buoc 4: Empty loi co nut Thu lai",
				(await chuSel(l, "[data-trang-thai='ST-toancanh-loi']")).includes(
					CHU.thuLai,
				),
			);
			await chup(l, "E10-buoc-toan-canh-4.png");
			await boChan();
			await bamChu(l, "[data-trang-thai='ST-toancanh-loi'] button", CHU.thuLai);
			await hienSel(
				l,
				"[data-hang-toan-canh]",
				"E10 buoc 4: bam Thu lai sau khi bo chan thi bang hien",
			);
		}
		await l.close();

		await chan("okr.cycles");
		const c = await moTrang(cookie.admin, RONG, "/okr/toan-canh");
		if (
			await hienSel(
				c,
				"[data-trang-thai='ST-toancanh-loi']",
				"E10 (AC-5 chieu do): truy van chu ky loi phai toi nhanh loi co Thu lai, khong quay mai",
			)
		) {
			await chup(c, "E10-buoc-toan-canh-loi-chu-ky.png");
			await boChan();
			await bamChu(c, "[data-trang-thai='ST-toancanh-loi'] button", CHU.thuLai);
			await hienSel(
				c,
				"[data-hang-toan-canh]",
				"E10 (AC-5): bam Thu lai sau khi truy van chu ky het loi thi bang hien",
			);
		} else
			console.log(
				`  E10 (AC-5): trang thai that ${await thuocTinh(c, "[data-trang-thai]", "data-trang-thai")}`,
			);
		await c.close();
	} finally {
		await boChan();
	}

	const d = await moTrang(
		cookie.admin,
		RONG,
		`/okr/toan-canh?kyOkr=${OKR.nam}`,
	);
	await hienSel(
		d,
		"[data-trang-thai='ST-toancanh-tuandau']",
		"E10 buoc 5: ky chua co muc tieu cong bo hien trang thai tuan dau",
	);
	const tuanDau = await chuSel(d, "[data-trang-thai='ST-toancanh-tuandau']");
	kiem(
		`E10 buoc 5: trang thai tuan dau co cau hen (thay: ${tuanDau.slice(0, 160)})`,
		tuanDau.includes(CHU.tuanDau) && tuanDau.includes(CHU.tuanDauMoTa),
	);
	await chup(d, "E10-buoc-toan-canh-5.png");
	await d.close();
}

const vetMoHop = (donVi) =>
	db.okrTrail
		.findMany({
			where: { cycleId: OKR.quy, action: "mo-hop-tuan" },
			select: {
				actorUserId: true,
				objectiveId: true,
				keyResultId: true,
				after: true,
			},
		})
		.then((ds) => ds.filter((d) => d.after?.donVi === donVi));

async function buocHopTuan() {
	const [Ka, Kb, Kc, Kd, Ke, Kf] = OKR.H.kr;
	const tenKr = {
		[Ka]: "Ka",
		[Kb]: "Kb",
		[Kc]: "Kc",
		[Kd]: "Kd",
		[Ke]: "Ke",
		[Kf]: "Kf",
	};
	const donVi = `pb:${ORG.PH}`;
	const hopTuan = theoDonVi(`donOkr=${donVi}&xemOkr=hop-tuan`);
	const t = await moTrang(cookie.truongP1, RONG, hopTuan);
	await hienSel(
		t,
		"[data-trang-thai='ST-hoptuan-codulieu']",
		"E14 buoc 2: bang hop tuan co du lieu",
	);
	const thuTu = await thuocTinh(t, "[data-kr-hop]", "data-kr-hop");
	kiem(
		`E14 buoc 2: thu tu dong [Kb, Ka, Kc, Kd, Ke] (thay [${thuTu.map((k) => tenKr[k] ?? k).join(", ")}])`,
		giongNhau(thuTu, [Kb, Ka, Kc, Kd, Ke]),
	);
	const lyDo = (kr) =>
		t.evaluate(
			(k) =>
				window.__tim(`[data-kr-hop='${k}'] [data-ly-do]`).map((e) => ({
					chu: e.textContent?.replace(/\s+/g, " ").trim() ?? "",
					cham: e.children.length > 0,
				})),
			kr,
		);
	const mong = [
		[Kb, [CHU.tutCaoThap]],
		[Ka, [CHU.tutVuaThap]],
		[Kc, [CHU.tutCaoVua, CHU.ghiChuMoi]],
		[Kd, [CHU.im15]],
		[Ke, [CHU.ghiChuMoi]],
	];
	for (const [kr, chu] of mong) {
		const ld = await lyDo(kr);
		kiem(
			`E14 buoc 2: dong ${tenKr[kr]} co cham kem chu ly do ${chu.join(" + ")} (thay ${ld.map((l) => l.chu).join(" + ")})`,
			giongNhau(
				ld.map((l) => l.chu),
				chu,
			) && ld.every((l) => l.cham),
		);
	}
	kiem(
		"E14 buoc 2: ghi chu moi nhat hien nguyen van",
		(await chuSel(t, `[data-kr-hop='${Kc}']`)).includes("Đối tác lùi lịch ký"),
	);
	const conLai = await chuSel(t, "[data-con-lai]");
	kiem(
		`E14 buoc 2: «Con lai 1 KR» gap (thay: ${conLai.slice(0, 80)})`,
		conLai.includes(CHU.conLai1) && !(await coSel(t, `[data-kr-hop='${Kf}']`)),
	);
	await chup(t, "E14-buoc-hop-tuan-1.png");

	await cho(1000);
	const sau1 = await vetMoHop(donVi);
	kiem(
		`E28: sau lan mo dau co dung 1 dong mo-hop-tuan cho ${donVi} (thay ${sau1.length})`,
		sau1.length === 1,
	);
	const d = sau1[0];
	kiem(
		`E28: dong mo-hop-tuan dung hinh (thay ${JSON.stringify(d)})`,
		d?.actorUserId === id.truongP1 &&
			d?.objectiveId === null &&
			d?.keyResultId === null &&
			d?.after?.donVi === donVi &&
			d?.after?.tuan === tuanNayVN(),
	);

	await bamSel(t, `[data-mo-kr='${Kb}']`);
	await doi(
		t,
		"E14 buoc 3: bam dong Kb mo sheet muc tieu",
		(h) =>
			new URL(location.href).searchParams.get("record") === `objective:${h}`,
		OKR.H.id,
	);
	await cho(600);
	await chup(t, "E14-buoc-hop-tuan-2.png", false);
	await t.keyboard.press("Escape");
	await doi(
		t,
		"E14 buoc 3: dong sheet ve dung bang hop tuan",
		() =>
			new URL(location.href).searchParams.get("record") === null &&
			window.__tim("[data-kr-hop]").length === 5,
	);

	await toi(t, `${hopTuan}&tuTinOkr=thap`);
	await taiLai(t);
	await hienSel(t, "[data-trang-thai^='ST-hoptuan-']");
	await bamChu(t, "[role='radio']", CHU.danhSach);
	await hienSel(t, "[data-muc-tieu]");
	await bamChu(t, "[role='radio']", CHU.hopTuan);
	await hienSel(t, "[data-trang-thai^='ST-hoptuan-']");
	await cho(1500);
	kiem(
		`E28: doi bo loc, tai lai, sang Danh sach roi ve Hop tuan trong cua gop van 1 dong (thay ${(await vetMoHop(donVi)).length})`,
		(await vetMoHop(donVi)).length === 1,
	);
	await t.close();

	const h = await moTrang(cookie.truongP1, HEP, hopTuan);
	await hienSel(h, "[data-trang-thai='ST-hoptuan-codulieu']");
	await chup(h, "E14-buoc-hop-tuan-3.png");
	await h.close();

	const y = await moTrang(
		cookie.truongP1,
		RONG,
		theoDonVi(`donOkr=pb:${ORG.PY}&xemOkr=hop-tuan`),
	);
	await hienSel(
		y,
		"[data-trang-thai='ST-hoptuan-yenang']",
		"E14 buoc 4: phong ban khong co gi dang ban hien trang thai yen ang",
	);
	kiem(
		"E14 buoc 4: cau «Tuan nay khong KR nao dang ban»",
		(await chuSel(y, "[data-trang-thai='ST-hoptuan-yenang']")).includes(
			CHU.yenAng,
		),
	);
	await chup(y, "E14-buoc-hop-tuan-4.png");
	await y.close();
}

async function buocDienBien() {
	const [Kso, Kmoc, Kchua] = OKR.DB.kr;
	const t = await moTrang(
		cookie.truongP1,
		RONG,
		theoDonVi(`donOkr=pb:${ORG.PD}&record=objective:${OKR.DB.id}`),
	);
	await doi(t, "E17: sheet muc tieu mo", () => window.__tim("[role='tab']")[0]);
	const tab = await t.evaluate(() =>
		window
			.__tim("[role='tab']")
			.map((e) => e.textContent?.replace(/\s+/g, " ").trim()),
	);
	if (
		!kiem(
			`E17: khong thay tab Dien bien (tab: ${tab.join(" | ")})`,
			tab.includes(CHU.dienBien),
		)
	) {
		await t.close();
		return;
	}
	await bamChu(t, "[role='tab']", CHU.dienBien);
	await coMat(
		t,
		"[data-trang-thai='ST-dienbien-so']",
		"E17 buoc 2: tab Dien bien ve bieu do cho KR so",
	);
	kiem("E17 buoc 2: URL mo tab dien-bien", thamSo(t, "tab") === "dien-bien");
	const bd = await t.evaluate(() => {
		const goc = window.__tim("[data-trang-thai='ST-dienbien-so']")[0];
		const svg = goc?.querySelector("svg.recharts-surface");
		const khung = svg?.getBoundingClientRect();
		const nhan = [...(goc?.querySelectorAll("text") ?? [])].find((e) =>
			e.textContent?.startsWith("Đích"),
		);
		const r = nhan?.getBoundingClientRect();
		return {
			svg: svg !== null && svg !== undefined,
			duong: goc?.querySelectorAll(".recharts-line").length ?? 0,
			dut: [...(goc?.querySelectorAll(".recharts-line path") ?? [])].some(
				(p) => (p.getAttribute("stroke-dasharray") ?? "") !== "",
			),
			nhan: nhan?.textContent ?? null,
			trongKhung:
				r && khung
					? r.left >= khung.left - 1 &&
						r.right <= khung.right + 1 &&
						r.top >= khung.top - 1
					: false,
		};
	});
	kiem(
		`E17 buoc 2: bieu do co svg, duong gia tri lien va duong le ra dut (thay ${JSON.stringify(bd)})`,
		bd.svg && bd.duong >= 2 && bd.dut,
	);
	kiem(
		`E17 buoc 2: nhan «Dich 85%» doc du chu, nam trong khung svg (thay ${bd.nhan}, trong khung ${bd.trongKhung})`,
		bd.nhan === CHU.dich85 && bd.trongKhung,
	);
	const day = await chuSel(t, "[data-day-tu-tin]");
	kiem(
		`E17 buoc 2: day muc tu tin cham kem chu (thay: ${day.slice(0, 120)})`,
		day.includes(CHU.thap) && (await demSel(t, "[data-day-tu-tin] li")) >= 4,
	);
	await chup(t, "E17-buoc-dien-bien-1.png", false);

	await bamSel(t, "[data-chon-kr]");
	await bamChu(t, "[role='option']", TEN.Kmoc);
	await coMat(
		t,
		"[data-trang-thai='ST-dienbien-moc']",
		"E17 buoc 3: KR moc hien dong thoi gian",
	);
	kiem(
		"E17 buoc 3: KR moc khong ve svg bieu do",
		(await demSel(
			t,
			"[data-trang-thai='ST-dienbien-moc'] svg.recharts-surface",
		)) === 0 && !(await coSel(t, "[data-trang-thai='ST-dienbien-so']")),
	);
	kiem("E17 buoc 3: URL chon KR moc", thamSo(t, "krOkr") === Kmoc);
	await chup(t, "E17-buoc-dien-bien-2.png", false);

	await bamSel(t, "[data-chon-kr]");
	await bamChu(t, "[role='option']", TEN.Kchua);
	await coMat(
		t,
		"[data-trang-thai='ST-dienbien-chuaco']",
		"E17 buoc 3: KR chua cap nhat hien trang thai rieng",
	);
	const hen = `${CHU.henNgay} ${nhanNgay(tuanNayVN())}`;
	const chuHen = await chuSel(t, "[data-trang-thai='ST-dienbien-chuaco']");
	kiem(
		`E17 buoc 3: KR chua cap nhat co cau hen ngay «${hen}» (thay: ${chuHen})`,
		chuHen.includes(hen),
	);
	await chup(t, "E17-buoc-dien-bien-3.png", false);

	await bamSel(t, "[data-chon-kr]");
	await bamChu(t, "[role='option']", TEN.Kso);
	await coMat(t, "[data-trang-thai='ST-dienbien-so']");
	kiem("E17: URL chon lai KR so", thamSo(t, "krOkr") === Kso);
	await t.setViewport({ width: HEP, height: CAO });
	await cho(800);
	await chup(t, "E17-buoc-dien-bien-4.png", false);
	kiem("E17: KR chua cap nhat khong la KR so", Kchua !== Kso);
	await t.close();
}

const MOI_KHOI_THANH_VIEN = [
	"ban-hang",
	"deal-dang-mo",
	"viec-qua-han",
	"viec-okr",
	"okr-cua-toi",
	"hoat-dong",
];
const MOI_KHOI_CHI_OKR = ["viec-okr", "okr-cua-toi"];

async function buocTongQuan() {
	const thuTu = OKR.thuTuCuaToi;
	const dongCua = (t) => thuocTinh(t, "[data-kr-cua-toi]", "data-kr-cua-toi");
	const khoi = (t) => thuocTinh(t, "[data-khoi]", "data-khoi");

	const k = await moTrang(cookie.k, RONG, "");
	await hienSel(
		k,
		"[data-khoi='okr-cua-toi'] [data-kr-cua-toi]",
		"E19 buoc 2: khoi OKR cua ban co dong",
	);
	const dong = await dongCua(k);
	kiem(
		`E19 buoc 2: khoi OKR cua ban dung 5 dong thu tu E18 [truot, cham, moc, thap, cao] (thay ${dong.length} dong)`,
		giongNhau(dong, thuTu),
	);
	const kh = await khoi(k);
	kiem(
		`E19 buoc 2: cac khoi Tong quan con du (data-khoi ${kh.join(", ")})`,
		giongNhau(kh, MOI_KHOI_THANH_VIEN),
	);
	await chup(k, "E19-buoc-tong-quan-1.png");
	await k.setViewport({ width: HEP, height: CAO });
	await cho(700);
	await chup(k, "E19-buoc-tong-quan-4.png");
	await k.close();

	CAI.vaiK = true;
	await db.member.update({
		where: khoaThanhVien(id.k),
		data: { role: "okr" },
	});
	const ko = await moTrang(cookie.k, RONG, "");
	await hienSel(
		ko,
		"[data-khoi='okr-cua-toi'] [data-kr-cua-toi]",
		"E19 buoc 3: k vai okr thay khoi OKR cua ban",
	);
	kiem(
		`E19 buoc 3: k vai okr co cung 5 dong (thay ${(await dongCua(ko)).length})`,
		giongNhau(await dongCua(ko), thuTu),
	);
	const kho = await khoi(ko);
	kiem(
		`E19 buoc 3: trang chu vai okr co the viec va khoi OKR (data-khoi ${kho.join(", ")})`,
		giongNhau(kho, MOI_KHOI_CHI_OKR),
	);
	await chup(ko, "E19-buoc-tong-quan-2.png");
	await ko.close();
	await db.member.update({
		where: khoaThanhVien(id.k),
		data: { role: NGUOI.k.vai },
	});
	CAI.vaiK = false;

	const r = await moTrang(cookie.truongP1, RONG, "");
	await hienSel(
		r,
		"[data-khoi='okr-cua-toi'][data-trang-thai='ST-tongquan-rong']",
		"E19 buoc 3: nguoi khong phu trach KR thay cau rieng",
	);
	kiem(
		"E19 buoc 3: nguoi khong KR khong co dong nao",
		(await demSel(r, "[data-kr-cua-toi]")) === 0,
	);
	await chup(r, "E19-buoc-tong-quan-3.png");
	await r.close();

	const n = await moTrang(
		cookie.truongP1,
		RONG,
		theoDonVi(`donOkr=nguoi:${id.k}`),
	);
	await hienSel(
		n,
		"[data-khoi='okr-cua-toi'][data-trang-thai='ST-nguoi-codulieu']",
		"E19 buoc 4: trang mot nguoi co khoi OKR cua k",
	);
	kiem(
		"E19 buoc 4: nguoi khac mo trang cua k thay cung 5 dong",
		giongNhau(await dongCua(n), thuTu),
	);
	await chup(n, "E19-buoc-tong-quan-5.png");
	await n.close();
}

async function buocSucKhoe() {
	const a = await moTrang(cookie.admin, RONG, `/okr/toan-canh?${ky()}`);
	await hienSel(a, "[data-nut='suc-khoe']");
	await bamChu(a, "[data-nut='suc-khoe']", CHU.suKhoe);
	await hienSel(
		a,
		"[data-trang-thai='ST-suckhoe-codulieu']",
		"E21 buoc 2: trang Suc khoe co du lieu",
	);
	kiem(
		`E21 buoc 2: URL la trang suc khoe (thay ${new URL(a.url()).pathname})`,
		new URL(a.url()).pathname.endsWith("/suc-khoe"),
	);
	const vun = await chuSel(a, "nav[aria-label='breadcrumb']");
	kiem(
		`E21 buoc 2: breadcrumb Toan canh › Suc khoe chuong trinh (thay ${vun})`,
		vun.indexOf(CHU.toanCanhTab) === 0 &&
			vun.indexOf(CHU.suKhoe) > CHU.toanCanhTab.length - 1,
	);
	const soThe = await demSel(a, "[data-slot='stat-card']");
	kiem(`E21 buoc 2: bon the so (thay ${soThe})`, soThe === 4);
	const chu = await chuSel(a, "[data-trang-thai='ST-suckhoe-codulieu']");
	kiem(
		"E21 buoc 2: tieu de cot va the so doc «KR cua muc tieu chua cong bo»",
		chu.includes(CHU.chuaCongBo),
	);
	kiem(
		"E21 buoc 2: trang khong co chu «thieu khoi diem»",
		!chu.includes(CHU.thieuKhoiDiem),
	);
	const oHang = (k) =>
		a.evaluate(
			(khoa) =>
				window
					.__tim(`[data-hang-suc-khoe='${khoa}'] td`)
					.map((td) => td.textContent?.replace(/\s+/g, " ").trim() ?? ""),
			k,
		);
	const mong = [
		[`bp:${ORG.SB}`, "B", ["3", "2", "1", "2", "4"], NGUOI.truongB.ten],
		[`pb:${ORG.SP1}`, "P1", ["3", "2", "1", "2", "2"], NGUOI.truongP1.ten],
		[`pb:${ORG.SP2}`, "P2", ["0", "0", "0", "0", "2"], CHU.chuaCoTruong],
	];
	for (const [khoa, ten, so, truong] of mong) {
		const o = await oHang(khoa);
		kiem(
			`E21 buoc 2: hang ${ten} [tong KR, dung tuan, KR im, chua cong bo, chua noi kenh] = [${so}] (thay [${o.slice(1)}])`,
			giongNhau(o.slice(1), so),
		);
		kiem(
			`E21 buoc 2: hang ${ten} ghi truong «${truong}» (thay ${o.join(" | ")})`,
			o.join(" ").includes(truong),
		);
	}
	await chup(a, "E21-buoc-suc-khoe-1.png");
	await a.setViewport({ width: HEP, height: CAO });
	await cho(700);
	await chup(a, "E21-buoc-suc-khoe-2.png");
	await a.close();

	const k = await moTrang(cookie.k, RONG, `/okr/toan-canh/suc-khoe?${ky()}`);
	await hienSel(
		k,
		"[data-trang-thai='ST-suckhoe-khongquyen']",
		"E21 buoc 3: thanh vien thuong mo thang URL bi chan",
	);
	kiem(
		"E21 buoc 3: thanh vien thuong thay cau chi quan tri, khong thay bang",
		(await chuSel(k, "[data-trang-thai='ST-suckhoe-khongquyen']")).includes(
			CHU.khongQuyen,
		) && (await demSel(k, "[data-hang-suc-khoe]")) === 0,
	);
	await chup(k, "E21-buoc-suc-khoe-3.png");
	await k.close();
}

async function buocChuKy() {
	const tenA = `Quý ${QUY_DONG}/${NAM_DONG} ${MA}`;
	const tenB = `Quý ${QUY}/${NAM} ${MA}`;
	const t = await moTrang(
		cookie.truongP1,
		RONG,
		`/okr/theo-don-vi?donOkr=pb:${ORG.PK}`,
	);
	await hienSel(t, "[data-chon-chu-ky]", "E23 buoc 3: o chon chu ky");
	kiem(
		"E23: mac dinh la ky dang chay (quy sau), danh sach co TQ4",
		await coSel(t, `[data-muc-tieu='${OKR.TQ4.id}']`),
	);
	let tab = 0;
	while (tab < 60) {
		await t.keyboard.press("Tab");
		tab += 1;
		if (
			await t.evaluate(
				() => document.activeElement?.hasAttribute("data-chon-chu-ky") ?? false,
			)
		)
			break;
	}
	kiem(
		`E23 buoc 3: Tab toi o chon chu ky (${tab} lan Tab)`,
		await t.evaluate(
			() => document.activeElement?.hasAttribute("data-chon-chu-ky") ?? false,
		),
	);
	await t.keyboard.press("Enter");
	await doi(
		t,
		"E23 buoc 3: Enter mo danh sach chu ky",
		() => window.__tim("[role='option']")[0],
	);
	const nhom = await t.evaluate(() =>
		window.__tim("[role='group']").map((g) => ({
			nhan:
				g.querySelector("[data-slot='select-label']")?.textContent?.trim() ??
				g.getAttribute("aria-label") ??
				"",
			muc: [...g.querySelectorAll("[role='option']")].map((o) =>
				o.textContent?.replace(/\s+/g, " ").trim(),
			),
		})),
	);
	console.log(`  E23 danh sach chu ky: ${JSON.stringify(nhom)}`);
	const moiMuc = nhom.flatMap((g) => g.muc);
	kiem(
		`E23 buoc 3: nhom theo nam ${NAM} va ${NAM + 1}`,
		nhom.some((g) => g.nhan.includes(String(NAM))) &&
			nhom.some((g) => g.nhan.includes(String(NAM + 1))),
	);
	kiem(
		`E23 buoc 3: ${tenA} mang chu «da dong»`,
		moiMuc.some((m) => m.startsWith(tenA) && m.includes(CHU.daDong)),
	);
	kiem(
		`E23 buoc 3: ${tenB} mang chu «hien tai»`,
		moiMuc.some((m) => m.startsWith(tenB) && m.includes(CHU.hienTai)),
	);
	await chup(t, "E23-buoc-chon-ky-1.png", false);

	trpc.length = 0;
	const sang = async (phim) => {
		for (let i = 0; i < 12; i++) {
			const dang = await t.evaluate(
				() =>
					document
						.querySelector("[role='option'][data-highlighted]")
						?.textContent?.replace(/\s+/g, " ")
						.trim() ?? "",
			);
			if (dang.startsWith(tenA)) return true;
			await t.keyboard.press(phim);
			await cho(120);
		}
		return false;
	};
	const toiA = (await sang("ArrowUp")) || (await sang("ArrowDown"));
	kiem(`E23 buoc 3: phim mui ten toi ${tenA}`, toiA);
	await t.keyboard.press("Enter");
	await doi(
		t,
		"E23 buoc 3: chon quy da dong bang phim thi URL kyOkr doi",
		(k) => new URL(location.href).searchParams.get("kyOkr") === k,
		OKR.quyA,
	);
	await hienSel(t, `[data-muc-tieu='${OKR.TQ3.id}']`);
	const ds = await chuTrang(t);
	kiem(
		`E23 buoc 4: Theo don vi co «${TEN.TQ3}», khong co «${TEN.TQ4}»`,
		ds.includes(TEN.TQ3) && !ds.includes(TEN.TQ4),
	);
	await chup(t, "E23-buoc-chon-ky-2.png");

	await bamChu(t, "[role='radio']", CHU.hopTuan);
	await hienSel(t, "[data-trang-thai^='ST-hoptuan-']");
	await cho(600);
	const ht = await chuTrang(t);
	kiem(
		`E23 buoc 4: Hop tuan giu kyOkr, co «${TEN.TQ3}», khong co «${TEN.TQ4}»`,
		thamSo(t, "kyOkr") === OKR.quyA &&
			ht.includes(TEN.TQ3) &&
			!ht.includes(TEN.TQ4),
	);
	await chup(t, "E23-buoc-chon-ky-3.png");

	await bamChu(t, "a", CHU.toanCanhTab);
	await hienSel(t, "[data-hang-toan-canh]");
	await cho(800);
	const hangPK = await t.evaluate(
		(k) =>
			window
				.__tim(`[data-hang-toan-canh='${k}'] td`)
				.map((td) => td.textContent?.replace(/\s+/g, " ").trim() ?? ""),
		`pb:${ORG.PK}`,
	);
	const tc = await chuTrang(t);
	console.log(
		`  E23 Toan canh khong in ten muc tieu; hang pb:PK doc so KR cua ky dang xem (Q${QUY_DONG}: 1 KR, Q${QUY}: 2 KR), thay [${hangPK}]`,
	);
	kiem(
		`E23 buoc 4: Toan canh giu kyOkr, hang phong ban mang so cua ${tenA} (1 muc tieu, 1 KR), khong «${TEN.TQ4}» (thay [${hangPK.slice(-2)}])`,
		thamSo(t, "kyOkr") === OKR.quyA &&
			giongNhau(hangPK.slice(-2), ["1", "1"]) &&
			!tc.includes(TEN.TQ4),
	);
	await chup(t, "E23-buoc-chon-ky-4.png");

	const goi = loiGoiOkr();
	for (const ten of ["okr.danhSach", "okr.hopTuan", "okr.toanCanh"]) {
		const kyGoi = goi.filter(([t2]) => t2 === ten).map(([, v]) => v?.cycleId);
		kiem(
			`E29: moi loi goi ${ten} sau khi chon ky mang cycleId cua ${tenA} (thay ${kyGoi})`,
			ten === "okr.toanCanh"
				? kyGoi.every((c) => c === OKR.quyA)
				: kyGoi.length > 0 && kyGoi.every((c) => c === OKR.quyA),
		);
	}
	await t.close();
}

const NHOM = [
	{
		ten: "loc",
		nguoi: ["admin", "truongB", "truongP1", "truongP3", "k", "chiOkr"],
		gieo: gieoLoc,
		buoc: [
			["loc", ["E2", "E3"], buocLoc],
			["cay", ["E5"], buocCay],
			["toan-canh", ["E10"], buocToanCanh],
		],
	},
	{
		ten: "hop",
		nguoi: ["admin", "truongP1"],
		gieo: gieoHop,
		buoc: [["hop-tuan", ["E14", "E28"], buocHopTuan]],
	},
	{
		ten: "dien",
		nguoi: ["admin", "truongP1"],
		gieo: gieoDien,
		buoc: [["dien-bien", ["E17"], buocDienBien]],
	},
	{
		ten: "tong",
		nguoi: ["admin", "truongP1", "k"],
		gieo: gieoTong,
		buoc: [["tong-quan", ["E19"], buocTongQuan]],
	},
	{
		ten: "suc",
		nguoi: ["admin", "truongB", "truongP1", "k"],
		gieo: gieoSuc,
		buoc: [["suc-khoe", ["E21"], buocSucKhoe]],
	},
	{
		ten: "ky",
		nguoi: ["admin", "truongP1"],
		gieo: gieoKy,
		buoc: [["chu-ky", ["E23", "E29"], buocChuKy]],
	},
];

const nhomChay = NHOM.map((n) => ({
	...n,
	buoc: n.buoc.filter(([, evals]) => chon(evals)),
})).filter((n) => n.buoc.length > 0);
const canNguoi = [...new Set(nhomChay.flatMap((n) => n.nguoi))];

let metaCu = null;
let doiMeta = false;
let ma = 0;
const bat = Date.now();
try {
	for (const k of canNguoi) {
		const n = NGUOI[k];
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
			"  tien de: workspace cua kho chua danh dau onboard — thuoc tu danh dau, tra lai khi don",
		);
	}
	slug = await suySlug(cookie[canNguoi[0]]);
	for (const nhom of nhomChay) {
		const batNhom = Date.now();
		try {
			await nhom.gieo();
			for (const [ten, , fn] of nhom.buoc) {
				try {
					await fn();
				} catch (e) {
					hong.push(`${ten}: nem ${String(e).slice(0, 300)}`);
				}
			}
		} catch (e) {
			hong.push(`gieo ${nhom.ten}: nem ${String(e).slice(0, 400)}`);
		} finally {
			await donNhom().catch((e) =>
				hong.push(`don nhom ${nhom.ten}: ${String(e).slice(0, 200)}`),
			);
			console.log(
				`  nhom ${nhom.ten} (${nhom.buoc.flatMap(([, e]) => e).join(", ")}): ${Math.round((Date.now() - batNhom) / 1000)} s`,
			);
		}
	}
} catch (e) {
	hong.push(`tien de: nem ${String(e).slice(0, 400)}`);
} finally {
	await donNhom().catch((e) =>
		hong.push(`don dep: ${String(e).slice(0, 200)}`),
	);
	const moiNguoi = Object.values(id);
	await db.session
		.deleteMany({ where: { userId: { in: moiNguoi } } })
		.catch((e) => hong.push(`don phien: ${String(e).slice(0, 200)}`));
	await db.member
		.deleteMany({ where: { userId: { in: moiNguoi } } })
		.catch((e) => hong.push(`don thanh vien: ${String(e).slice(0, 200)}`));
	await db.user
		.deleteMany({ where: { id: { in: moiNguoi } } })
		.catch((e) => hong.push(`don nguoi: ${String(e).slice(0, 200)}`));
	if (doiMeta)
		await db.organization
			.update({ where: { id: WORKSPACE_ID }, data: { metadata: metaCu } })
			.catch((e) => hong.push(`tra onboard: ${String(e).slice(0, 200)}`));
	const conKy = await db.okrCycle.count();
	if (conKy > 0) hong.push(`don dep: con ${conKy} chu ky trong kho`);
	writeFileSync(join(BANG_CHUNG, "man-toan-canh-network.txt"), mang.join("\n"));
	console.log(
		`man-toan-canh: ${khang} khang dinh, ${hong.length} hong, ${anh.length} anh, ${Math.round((Date.now() - bat) / 1000)} s`,
	);
	for (const h of hong) console.log(`  HONG: ${h}`);
	ma = hong.length === 0 ? 0 : 1;
}
await ket(ma);
