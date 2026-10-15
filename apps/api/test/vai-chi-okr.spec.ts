import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import { auth, KHONG_TRONG_PHAM_VI, NOT_A_MEMBER } from "@crm/auth";
import { db } from "@crm/db";
import { readContextDevKey, writeContextDevKey } from "@crm/db/settings";
import { WORKSPACE_ID } from "@crm/db/workspace";
import {
	danhDauViecInput,
	ganSangKienInput,
	guiGhiNhanInput,
	idInput,
	suaViecInput,
	themBangChungInput,
	themViecInput,
} from "@crm/validation/okr-canh-kr";
import {
	goChuKyInput,
	hienChuKyInput,
	suaChuKyInput,
} from "@crm/validation/okr-chu-ky";
import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import {
	anChuKyInput,
	chamKrInput,
	diemTheoThang,
	dongRaInput,
	ghiDieuHocDuocInput,
	mangSangInput,
	moLaiKyInput,
	moRaInput,
	xuatKyInput,
} from "@crm/validation/okr-khep";
import { taoTuMauInput } from "@crm/validation/okr-mau";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import type { AgentTriggerService } from "../src/agent/agent-trigger.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { ContextLogger } from "../src/logging/context-logger";
import { luuMauVao, mauInput } from "../src/okr/okr.contracts";
import {
	type CanhKrOutput,
	canhKrInput,
} from "../src/okr/okr-canh-kr.contracts";
import { OKR } from "../src/okr/okr-config";
import { bangChamInput } from "../src/okr/okr-khep.contracts";
import { OKR_XEM } from "../src/okr/okr-xem.config";
import { AuthMiddleware } from "../src/trpc/middlewares/auth.middleware";
import { PhamViChungMiddleware } from "../src/trpc/middlewares/pham-vi-du-lieu.middleware";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { WorkspaceService } from "../src/workspace/workspace.service";
import {
	type DauVao,
	type DauVaoHopLe,
	dangNhap,
	datMatKhau,
	gan,
	goiTrpc,
	maTranRest,
	maTranTrpc,
	soThuTuc,
} from "./ma-tran-thu";
import {
	donMucTieuAn,
	G_AN,
	gieoMucTieuAn,
	type SanAn,
} from "./okr-hien-thi-san";
import { THU_TUC_HOI_Y } from "./okr-hoi-y-thu-tuc";
import type { Json } from "./okr-san";
import { gieoThanhVien } from "./phien-thu";

const suffix = process.env.TEST_RUN_ID ?? "vai-chi-okr";
const id = (phan: string) => `${suffix}-${phan}`;
const THU_MUC_APP = join(import.meta.dir, "..", "..", "app");

const ALIAS_CHO_PHEP = [
	"users",
	"settings",
	"currency",
	"zalo",
	"apiKeys",
	"sso",
	"workspace",
	"org",
	"okr",
	"taiLieu",
	"taiLieuNguon",
	"tinHieu",
] as const;
const NGOAI_LE = ["workspace.get", "sso.signInOptions"] as const;
const KHONG_NHAN_PHIEN = [
	"tinHieuLich.keoVe",
	"POST /rest/tin-hieu/lich/keo-ve",
	"loTrinhBanChup.day",
	"POST /rest/lo-trinh/ban-chup",
] as const;
const laKhongNhanPhien = (ten: string) =>
	(KHONG_NHAN_PHIEN as readonly string[]).includes(ten);
const SAN_THU_TUC = 50;
const SAN_DUONG_REST = 30;
const SAN_MUTATION_CHUNG = 15;
const SAN_DUONG_NGOAI = 20;
const SO_MUTATION_KHONG_DAU_VAO = 15;
const CHO_MA_TRAN_MS = 60_000;
const THU_TUC_MAU = [
	{ ten: "contacts.list", input: {} },
	{ ten: "companies.list", input: {} },
	{ ten: "deals.list", input: {} },
	{ ten: "viec.cuaToi", input: { nhom: "giao-cho-toi" } },
	{ ten: "search.quick", input: { q: "a" } },
	{ ten: "campaigns.list", input: undefined },
] as const;

const DAU_VAO_HOP_LE = {
	"apiKeys.create": { name: "thu", expiresInDays: null },
	"apiKeys.revoke": { id: "khong-co" },
	"zalo.taoMa": {},
	"zalo.go": {},
	"zalo.guiThu": {},
	"zalo.luuUuTien": { channel: "ZALO" },
	"zalo.luuDongTroLyOkr": { bat: false },
	"zalo.luuBot": { token: "thu" },
	"tinHieu.gui": { muonLam: "thu", daXayRa: "thu", man: "/" },
	"tinHieu.xoa": { id: "khong-co" },
	"tinHieu.keoVe": {},
	"settings.setAgentModel": { modelId: null },
	"settings.setResearchKey": { apiKey: "ctx_thu_khong_that_du_dai_1234567890" },
	"settings.setArchiveRetention": { days: 30 },
	"currency.setReportingCurrency": { currency: "USD" },
	"currency.setManualRate": { currency: "USD", rate: 1 },
	"currency.removeManualRate": { currency: "USD" },
	"currency.refreshRates": {},
	"sso.register": {
		providerId: "thu",
		issuer: "https://thu.test",
		domain: "thu.test",
		clientId: "a",
		clientSecret: "b",
	},
	"sso.remove": { providerId: "thu" },
	"workspace.update": { name: "CRM", website: "https://thu.test" },
	"workspace.setMemberRole": { memberId: "khong-co", role: "member" },
	"workspace.allowEmail": { email: "moi@thu.test", role: "member" },
	"workspace.issuePasswordLink": { email: "moi@thu.test" },
	"workspace.revokeAllowance": { allowanceId: "khong-co" },
	"workspace.removeMember": { memberId: "khong-co" },
	"workspace.setStaffDomains": { domains: ["thu.test"] },
	"org.createDivision": { name: "Bo phan thu" },
	"org.renameDivision": { id: "khong-co", name: "x" },
	"org.reorderDivisions": { ids: ["khong-co"] },
	"org.archiveDivision": { id: "khong-co" },
	"org.restoreDivision": { id: "khong-co" },
	"org.purgeDivision": { id: "khong-co" },
	"org.archiveDepartment": { id: "khong-co" },
	"org.restoreDepartment": { id: "khong-co" },
	"org.purgeDepartment": { id: "khong-co" },
	"org.createDepartment": { name: "Phong thu", divisionId: null },
	"org.renameDepartment": { id: "khong-co", name: "x" },
	"org.moveDepartment": { id: "khong-co", divisionId: null, index: 0 },
	"org.attachDepartments": {
		divisionId: "khong-co",
		departmentIds: ["khong-co"],
	},
	"org.addPeople": { departmentId: "khong-co", userIds: ["khong-co"] },
	"org.setHead": { kind: "division", id: "khong-co", userId: null },
	"org.setPlacement": {
		userId: "khong-co",
		primaryDepartmentId: null,
		secondaryDepartmentIds: [],
		managerUserId: null,
	},
	"org.previewImport": { text: "" },
	"org.applyImport": { text: "" },
	"okr.datNguonKr": { keyResultId: "khong-co", loai: "api" },
	"okr.ghiSoKr": { id: "khong-co", giaTri: 1 },
	"okr.moRa": {
		cycleId: "khong-co",
		tuNgay: "2026-11-16",
		denNgay: "2026-11-22",
	},
	"okr.dongRa": { id: "khong-co" },
	"okr.bangCham": { cycleId: "khong-co" },
	"okr.chamKr": { keyResultId: "khong-co", diem: 0.5 },
	"okr.ghiDieuHocDuoc": {
		objectiveId: "khong-co",
		noiDung: "Khách mới đến từ giới thiệu",
	},
	"okr.moLaiKy": { id: "khong-co", lyDo: "Chấm nhầm một KR cần sửa" },
	"okr.suaChuKy": {
		id: "khong-co",
		name: "Quý 4 năm 2026",
		startsOn: "2026-10-01",
		endsOn: "2026-12-31",
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	},
	"okr.goChuKy": { id: "khong-co" },
	"okr.xoaMucTieu": { id: "khong-co" },
	"okr.dungLaiMucTieu": { id: "khong-co" },
	"okr.anChuKy": { id: "khong-co", lyDo: "Tạo nhầm ngày của quý này" },
	"okr.hienChuKy": { id: "khong-co" },
	"okr.mangSang": { objectiveId: "khong-co" },
	"okr.xuatKy": { cycleId: "khong-co" },
	"okr.canhKr": { keyResultId: "khong-co" },
	"okr.themViec": {
		keyResultId: "khong-co",
		tieuDe: "Gọi lại đối tác",
		nguoiLamUserId: "khong-co",
		hanNgay: null,
	},
	"okr.suaViec": { id: "khong-co", tieuDe: "Gọi lại đối tác" },
	"okr.danhDauViec": { id: "khong-co", xong: true },
	"okr.goViec": { id: "khong-co" },
	"okr.ganSangKien": {
		keyResultId: "khong-co",
		loai: "chien-dich",
		banGhiId: "khong-co",
	},
	"okr.themBangChung": {
		keyResultId: "khong-co",
		url: "https://drive.google.com/x",
		ghiChu: "",
	},
	"okr.goBangChung": { id: "khong-co" },
	"okr.guiGhiNhan": {
		objectiveId: "khong-co",
		keyResultId: null,
		nguoiNhan: ["khong-co"],
		loiNhan: "Cảm ơn đã chốt kho mới",
	},
	"okr.goGhiNhan": { id: "khong-co" },
	"okr.mau": { cap: "phong-ban", donViId: "khong-co" },
	"okr.luuMau": {
		id: null,
		ten: "Mẫu doanh thu",
		cap: "phong-ban",
		donViIds: [],
		noiDung: {
			cauMucTieu: "Tăng doanh thu phòng",
			loai: "cam-ket",
			krs: [
				{
					title: "Doanh thu mới",
					kind: "tang-toi",
					unit: "",
					startValue: null,
					targetValue: null,
				},
			],
		},
	},
	"okr.soanMo": {
		cycleId: "khong-co",
		level: "onehub",
		divisionId: null,
		departmentId: null,
	},
	"okr.soanTangLuot": { cuocSoanId: "khong-co" },
	"okr.soanQuyet": { deXuatId: "khong-co", quyet: "nhan" },
	"okr.soanDuaVao": { cuocSoanId: "khong-co", kr: [] },
	"okr.luuTruMau": { id: "khong-co" },
	"okr.khoiPhucMau": { id: "khong-co" },
	"okr.taoTuMau": {
		mauId: "khong-co",
		cycleId: "khong-co",
		unit: { level: "phong-ban", departmentId: "khong-co" },
		ownerUserId: "khong-co",
		krs: [{ startValue: 0, targetValue: 10, ownerUserId: "khong-co" }],
	},
	"okr.moHoiY": {
		cycleId: "khong-co",
		cauHoi: "Năm tới OneHub nên dồn sức vào đâu?",
		loiMo: "",
		soLieu: [{ nhan: "Doanh thu", giaTri: "182 tỷ", ghiChu: "" }],
		hanLuc: "2026-12-10T10:00:00.000Z",
		nguoiChonUserId: "khong-co",
	},
	"okr.suaHoiY": { hoiYId: "khong-co", loiMo: "Lời mở mới" },
	"okr.hoiY": { cycleId: "khong-co" },
	"okr.hoiYNhan": { cycleId: "khong-co" },
	"okr.hoiYDoPhu": { hoiYId: "khong-co" },
	"okr.gopY": {
		hoiYId: "khong-co",
		noiDung: "Mở tuyến giao lạnh cho khách dược",
		viSao: "",
		doBangGi: "",
	},
	"okr.suaY": {
		yId: "khong-co",
		noiDung: "Mở tuyến giao lạnh cho khách dược",
		viSao: "Khách dược cần giao lạnh.",
		doBangGi: "",
	},
	"okr.goY": { yId: "khong-co" },
	"okr.dongY": { yId: "khong-co", bat: true },
	"okr.niemPhong": {
		hoiYId: "khong-co",
		cau: [
			"Đưa giao lạnh thành dịch vụ có lãi",
			"Mở thêm hai kho ở miền Trung",
			"Giảm thời gian giao chặng cuối",
		],
	},
	"okr.taoChuDe": { hoiYId: "khong-co", ten: "Giao lạnh" },
	"okr.suaChuDe": { chuDeId: "khong-co", ten: "Giao lạnh cho dược" },
	"okr.goChuDe": { chuDeId: "khong-co" },
	"okr.ganY": { yIds: ["khong-co"], chuDeId: "khong-co" },
	"okr.ketLuanChuDe": {
		chuDeId: "khong-co",
		ketLuan: "chon",
		lyDo: "Đúng hướng năm tới của công ty.",
		cauMucTieu: "Giao lạnh có lãi ở ba tỉnh",
		noiBanTruoc: "cau-1",
	},
	"okr.congBo": { hoiYId: "khong-co" },
	"okr.hieuViSao": { hoiYId: "khong-co" },
} satisfies Record<string, DauVaoHopLe>;
const dauVaoCua = (ten: string): DauVaoHopLe | undefined =>
	ten in DAU_VAO_HOP_LE
		? DAU_VAO_HOP_LE[ten as keyof typeof DAU_VAO_HOP_LE]
		: undefined;
const THU_TUC_KHEP = {
	"okr.moRa": moRaInput,
	"okr.dongRa": dongRaInput,
	"okr.bangCham": bangChamInput,
	"okr.chamKr": chamKrInput,
	"okr.ghiDieuHocDuoc": ghiDieuHocDuocInput,
	"okr.moLaiKy": moLaiKyInput,
	"okr.mangSang": mangSangInput,
	"okr.xuatKy": xuatKyInput,
} as const;
const THU_TUC_CANH_KR = {
	"okr.canhKr": canhKrInput,
	"okr.themViec": themViecInput,
	"okr.suaViec": suaViecInput,
	"okr.danhDauViec": danhDauViecInput,
	"okr.goViec": idInput,
	"okr.ganSangKien": ganSangKienInput,
	"okr.themBangChung": themBangChungInput,
	"okr.goBangChung": idInput,
	"okr.guiGhiNhan": guiGhiNhanInput,
	"okr.goGhiNhan": idInput,
	"okr.mau": mauInput,
	"okr.luuMau": luuMauVao,
	"okr.luuTruMau": idInput,
	"okr.khoiPhucMau": idInput,
	"okr.taoTuMau": taoTuMauInput,
} as const;
const THU_TUC_OKR_TRUOC_LUOT = [
	"access",
	"addAlignment",
	"addComment",
	"aiChiTieu",
	"alignmentTargets",
	"alignmentTree",
	"applyImport",
	"banGhiChiSo",
	"bangCham",
	"byUnit",
	"capNhatTuan",
	"cayCanChinh",
	"chamKr",
	"chiSo",
	"comments",
	"countByUnit",
	"createCycle",
	"createKeyResult",
	"createObjective",
	"cycles",
	"danhSach",
	"datNguonKr",
	"dienBien",
	"dongRa",
	"dropObjective",
	"follow",
	"ghiDieuHocDuoc",
	"ghiSoKr",
	"guiCapNhat",
	"hopTuan",
	"khoiCuaToi",
	"lichSuSo",
	"mangSang",
	"mine",
	"moCapNhat",
	"moHopTuan",
	"moLaiKy",
	"moRa",
	"objective",
	"previewImport",
	"program",
	"publishObjective",
	"removeAlignment",
	"removeKeyResult",
	"setCyclePhase",
	"setProgram",
	"suaLyDoCanChinh",
	"sucKhoe",
	"thanhVien",
	"toanCanh",
	"transferPreview",
	"transferWork",
	"updateKeyResult",
	"updateObjective",
	"viecCuaToi",
	"xemTruocChiSo",
	"xuatKy",
].map((t) => `okr.${t}`);
const THU_TUC_OKR_LUOT_CANH_KR = Object.keys(THU_TUC_CANH_KR);
const THU_TUC_OKR_LUOT_GIOI_HAN = [
	"datHienThi",
	"guiDuyet",
	"duyetMucTieu",
	"traLaiMucTieu",
	"rutDuyet",
	"chuyenDonVi",
	"moCoi",
].map((t) => `okr.${t}`);
const THU_TUC_OKR_LUOT_TRO_LY = [
	"troLySanSang",
	"troLyDeXuat",
	"troLyDanhSach",
	"troLyQuyet",
	"troLyAn",
	"troLySoDo",
	"xuHuongKr",
].map((t) => `okr.${t}`);
const THU_TUC_OKR_LUOT_SOAN = [
	"soanSanSang",
	"soanMo",
	"soanDanhSachCuoc",
	"soanTangLuot",
	"soanDanhSach",
	"soanQuyet",
	"soanDuaVao",
	"soanAn",
	"soanSoDo",
].map((t) => `okr.${t}`);
const THU_TUC_OKR_LUOT_TOM_TAT = [
	"troLyTomTat",
	"troLyTomTatPhanHoi",
	"troLyTomTatQuanTri",
].map((t) => `okr.${t}`);
const THU_TUC_OKR_LUOT_UX_8D = ["chuyenDonViXemTruoc"].map((t) => `okr.${t}`);
const THU_TUC_OKR_LUOT_HOI_Y = Object.keys(THU_TUC_HOI_Y);
const THU_TUC_SUA_AN_CHU_KY = {
	"okr.suaChuKy": suaChuKyInput,
	"okr.goChuKy": goChuKyInput,
	"okr.anChuKy": anChuKyInput,
	"okr.hienChuKy": hienChuKyInput,
} as const;
const THU_TUC_DON_OKR = {
	"okr.xoaMucTieu": idInput,
	"okr.dungLaiMucTieu": idInput,
} as const;
const SO_THU_TUC_HOI_Y = 17;
const KHOA_DOI_TAC = ["contactId", "companyId", "dealId"] as const;

const giaTriJson = z.json();
const doiTuongJson = z.record(z.string(), giaTriJson);
type GiaTriJson = z.infer<typeof giaTriJson>;

function khoaCua(v: GiaTriJson, duong: string): string[] {
	if (Array.isArray(v))
		return v.flatMap((x, i) => khoaCua(x, `${duong}[${i}]`));
	const doc = doiTuongJson.safeParse(v);
	if (!doc.success) return [];
	return Object.entries(doc.data).flatMap(([k, x]) => [
		`${duong}.${k}`,
		...khoaCua(x, `${duong}.${k}`),
	]);
}

const dongNhatKy = z.object({
	path: z.string(),
	outcome: z.string(),
	role: z.string().nullable(),
	phamVi: z.string().nullable(),
});
type DongNhatKy = z.infer<typeof dongNhatKy>;

const TU_PHUC_VU = [
	"apiKeys.create",
	"apiKeys.revoke",
	"zalo.taoMa",
	"zalo.go",
	"zalo.luuUuTien",
	"zalo.luuDongTroLyOkr",
	"zalo.guiThu",
	"tinHieu.gui",
	"tinHieu.xoa",
];
const KHAI_2XX = [
	"GET /",
	"GET /-yaml",
	"GET //LICENSE",
	"GET //index.html",
	"GET /swagger-ui-init.js",
	"GET /openapi.json",
	"GET /health",
	"GET /auth/me",
	"GET /auth/session",
	"GET /api/t/config/:siteId",
	"POST /api/t/e",
	"GET /api/auth/ok",
	"GET /api/auth/error",
	"GET /api/auth/get-session",
	"GET /api/auth/list-sessions",
	"GET /api/auth/list-accounts",
	"POST /api/auth/sign-out",
	"GET /api/auth/api-key/list",
	"GET /api/auth/sso/providers",
	"GET /api/auth/organization/list",
	"GET /api/auth/organization/get-full-organization",
	"GET /api/auth/organization/get-active-member",
	"GET /api/auth/organization/get-active-member-role",
	"GET /api/auth/organization/list-members",
	"GET /api/auth/organization/list-invitations",
	"GET /api/auth/organization/list-user-invitations",
];

type Vai = "owner" | "admin" | "member" | "okr";
type Dau = Record<string, string>;

let app: NestExpressApplication;
let workspace: WorkspaceService;

function choPhep(): string[] {
	return soThuTuc(app)
		.filter(
			(t) =>
				(ALIAS_CHO_PHEP as readonly string[]).includes(
					t.ten.split(".")[0] ?? "",
				) || (NGOAI_LE as readonly string[]).includes(t.ten),
		)
		.map((t) => t.ten)
		.sort();
}

function choPhepRest(): string[] {
	const ten = new Set(choPhep());
	return soThuTuc(app)
		.flatMap((t) => (ten.has(t.ten) && t.restKey ? [t.restKey] : []))
		.sort();
}

const khongGanCau = (h: { status: number; message: string }) =>
	h.status === 404 && h.message === "Not found";

const biChanPhamVi = (h: { status: number; message: string }) =>
	h.status === 403 && h.message === KHONG_TRONG_PHAM_VI;

async function gieoNguoi(phan: string, vai: Vai) {
	const userId = id(phan);
	await gieoThanhVien(userId, vai);
	return { userId, email: await datMatKhau(userId) };
}

async function memberId(userId: string): Promise<string> {
	const row = await db.member.findFirstOrThrow({
		where: { organizationId: WORKSPACE_ID, userId },
		select: { id: true },
	});
	return row.id;
}

async function vaiCua(userId: string): Promise<string> {
	const row = await db.member.findFirstOrThrow({
		where: { organizationId: WORKSPACE_ID, userId },
		select: { role: true },
	});
	return row.role;
}

async function vaiVanLa(dau: Dau, vai: Vai) {
	const res = await goiTrpc(app, "workspace.get", "query", undefined, dau);
	expect(res.status, "workspace.get sau ma tran").toBe(200);
	expect(res.body.result.data.viewerRole, "tu cach doi giua ma tran").toBe(vai);
}

async function don() {
	const users = { startsWith: `${suffix}-` };
	await db.apikey.deleteMany({ where: { referenceId: users } });
	await db.session.deleteMany({ where: { userId: users } });
	await db.account.deleteMany({ where: { userId: users } });
	await db.member.deleteMany({ where: { userId: users } });
	await db.invitation.deleteMany({ where: { email: { contains: suffix } } });
	await db.user.deleteMany({ where: { id: users } });
}

async function locationQuaProxy(
	cookie: string,
	apiUrl: string,
	duong: string,
): Promise<string | null> {
	const kichBan = [
		`const { NextRequest } = await import("next/server");`,
		`const { proxy } = await import(${JSON.stringify(join(THU_MUC_APP, "proxy.ts"))});`,
		`const res = await proxy(new NextRequest("http://localhost:3000" + process.env.DUONG_THU, { headers: { cookie: process.env.COOKIE_THU } }));`,
		`console.log(JSON.stringify({ location: res.headers.get("location") }));`,
	].join("\n");
	const con = Bun.spawn(["bun", "-e", kichBan], {
		cwd: THU_MUC_APP,
		env: {
			...process.env,
			NEXT_PUBLIC_API_URL: apiUrl,
			COOKIE_THU: cookie,
			DUONG_THU: duong,
		},
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, loi, ma] = await Promise.all([
		new Response(con.stdout).text(),
		new Response(con.stderr).text(),
		con.exited,
	]);
	expect(ma, `tien trinh proxy loi: ${loi}`).toBe(0);
	const dong = ra.trim().split("\n").at(-1) ?? "{}";
	return (JSON.parse(dong) as { location: string | null }).location;
}

const duongCua = (location: string | null) =>
	location === null ? null : new URL(location).pathname;

beforeAll(async () => {
	app = await createApp();
	spyOn(app.get(BackfillService), "auto").mockResolvedValue({ started: false });
	workspace = new WorkspaceService(db, {
		workspaceChanged: async () => undefined,
	} as unknown as AgentTriggerService);
});

afterAll(async () => {
	await don();
	await app.close();
});

describe("vai-chi-okr", () => {
	beforeEach(don);

	test(
		"ma-tran-trpc: okr goi duoc dung tap khai, moi thu tuc doi tac bi tu choi ve pham vi",
		async () => {
			const { email } = await gieoNguoi("okr", "okr");
			const cookie = await dangNhap(email);
			const tatCa = soThuTuc(app);
			expect(tatCa.length, "so router rong hoac qua it").toBeGreaterThanOrEqual(
				SAN_THU_TUC,
			);
			const khongDauVao = tatCa
				.filter((t) => t.loai === "mutation" && !t.coDauVao)
				.map((t) => t.ten);
			expect(
				khongDauVao,
				`mutation khong dau vao: ${khongDauVao.join(", ")}`,
			).toHaveLength(SO_MUTATION_KHONG_DAU_VAO);
			const hang = await maTranTrpc(app, { cookie });
			expect(hang.length).toBe(tatCa.length);
			const khongChan = hang
				.filter((h) => !biChanPhamVi(h) && !laKhongNhanPhien(h.ten))
				.map((h) => h.ten)
				.sort();
			expect(khongChan, "tap cho phep lech tap khai").toEqual(choPhep());
			for (const h of hang.filter((x) => laKhongNhanPhien(x.ten)))
				expect(h.status, "duong lich nhan phien dang nhap").toBe(401);
			for (const h of hang.filter((x) =>
				/^(contacts|companies|deals|campaigns|onboarding)\./.test(x.ten),
			)) {
				expect(biChanPhamVi(h), `${h.ten} ${h.status} ${h.message}`).toBe(true);
			}
			expect(
				hang.some((h) => h.message === NOT_A_MEMBER),
				"okr bi coi la nguoi ngoai",
			).toBe(false);
			await vaiVanLa({ cookie }, "okr");
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ma-tran-khoa-rest: khoa API cua okr va cau REST di dung ranh nhu phien",
		async () => {
			const { email } = await gieoNguoi("okr", "okr");
			const cookie = await dangNhap(email);
			const tao = await goiTrpc(
				app,
				"apiKeys.create",
				"mutation",
				{ name: "thu", expiresInDays: null },
				{ cookie },
			);
			expect(tao.status, JSON.stringify(tao.body)).toBe(200);
			const key = tao.body.result.data.key as string;
			expect(key.length).toBeGreaterThan(10);
			const dau = { "x-api-key": key };
			const hang = await maTranTrpc(app, dau);
			expect(
				hang
					.filter((h) => !biChanPhamVi(h) && !laKhongNhanPhien(h.ten))
					.map((h) => h.ten)
					.sort(),
				"tap cho phep qua khoa lech tap khai",
			).toEqual(choPhep());
			for (const h of hang.filter((x) => laKhongNhanPhien(x.ten)))
				expect(h.status, "duong lich nhan phien dang nhap").toBe(401);
			const rest = await maTranRest(app, dau);
			expect(rest.length).toBeGreaterThanOrEqual(SAN_DUONG_REST);
			expect(
				rest.filter(khongGanCau).map((h) => h.ten),
				"duong khai ma cau khong gan",
			).toEqual([]);
			expect(
				rest
					.filter((h) => !biChanPhamVi(h) && !laKhongNhanPhien(h.ten))
					.map((h) => h.ten)
					.sort(),
				"tap cho phep qua REST lech tap khai",
			).toEqual(choPhepRest());
			for (const h of rest.filter((x) => laKhongNhanPhien(x.ten)))
				expect(h.status, "duong lich nhan phien dang nhap").toBe(401);
			await vaiVanLa(dau, "okr");
		},
		CHO_MA_TRAN_MS,
	);

	test("ma-tran-sua-an-chu-ky: bon thu tuc sua, go, an, hien chu ky co trong tap do duoc, cho vai chi OKR goi toi, va co dau vao hop le", () => {
		const bon = Object.keys(THU_TUC_SUA_AN_CHU_KY).sort();
		const doDuoc = soThuTuc(app)
			.filter((t) => t.loai === "mutation")
			.map((t) => t.ten);
		expect(
			bon.filter((t) => !doDuoc.includes(t)),
			"thu tuc sua an chu ky khong do duoc",
		).toEqual([]);
		expect(
			choPhep().filter((t) => t in THU_TUC_SUA_AN_CHU_KY),
			"thu tuc sua an chu ky lech tap cho phep",
		).toEqual(bon);
		const hong = Object.entries(THU_TUC_SUA_AN_CHU_KY).flatMap(([t, khuon]) => {
			const vao = dauVaoCua(t);
			if (vao === undefined) return [`${t}: thieu dau vao`];
			const doc = khuon.safeParse(vao);
			return doc.success ? [] : [`${t}: ${doc.error.message}`];
		});
		expect(hong, "dau vao hop le cho bon thu tuc sua an chu ky").toEqual([]);
	});

	test("ma-tran-don-okr: hai thu tuc xoa va dung lai muc tieu co trong tap do duoc, cho vai chi OKR goi toi, va co dau vao hop le", () => {
		const bon = Object.keys(THU_TUC_DON_OKR).sort();
		const doDuoc = soThuTuc(app)
			.filter((t) => t.loai === "mutation")
			.map((t) => t.ten);
		expect(
			bon.filter((t) => !doDuoc.includes(t)),
			"thu tuc don okr khong do duoc",
		).toEqual([]);
		expect(
			choPhep().filter((t) => t in THU_TUC_DON_OKR),
			"thu tuc don okr lech tap cho phep",
		).toEqual(bon);
		const hong = Object.entries(THU_TUC_DON_OKR).flatMap(([t, khuon]) => {
			const vao = dauVaoCua(t);
			if (vao === undefined) return [`${t}: thieu dau vao`];
			const doc = khuon.safeParse(vao);
			return doc.success ? [] : [`${t}: ${doc.error.message}`];
		});
		expect(hong, "dau vao hop le cho bon thu tuc don okr").toEqual([]);
	});

	test(
		"doi-chung: member va admin khong bao gio nhan thong diep pham vi",
		async () => {
			for (const vai of ["member", "admin"] as const) {
				const { email } = await gieoNguoi(vai, vai);
				const cookie = await dangNhap(email);
				for (const { ten, input } of THU_TUC_MAU) {
					const res = await goiTrpc(app, ten, "query", input, { cookie });
					expect(res.status, `${vai} ${ten} phai tra 200`).toBe(200);
				}
				const hang = await maTranTrpc(app, { cookie });
				expect(
					hang.filter(biChanPhamVi).map((h) => h.ten),
					`${vai} bi chan oan ve pham vi`,
				).toEqual([]);
				await vaiVanLa({ cookie }, vai);
			}
		},
		CHO_MA_TRAN_MS,
	);

	test("khong-khai-nhom: lop nen tran chan okr, cho member qua; lop chung cho okr qua", async () => {
		const okr = await gieoNguoi("okr", "okr");
		const member = await gieoNguoi("member", "member");
		const goi = async (lop: AuthMiddleware, userId: string) => {
			let next = 0;
			const user = { id: userId, email: `${userId}@thu.test`, name: userId };
			try {
				await lop.use({
					ctx: { session: { user } },
					path: "router-moi.list",
					type: "query",
					input: undefined,
					getRawInput: async () => undefined,
					meta: undefined,
					signal: undefined,
					next: async () => {
						next += 1;
						return { ok: true, data: null, marker: "middlewareMarker" };
					},
				} as never);
				return { next, loi: null as string | null };
			} catch (e) {
				return { next, loi: (e as Error).message };
			}
		};
		expect(await goi(app.get(AuthMiddleware), okr.userId)).toEqual({
			next: 0,
			loi: KHONG_TRONG_PHAM_VI,
		});
		expect(await goi(app.get(AuthMiddleware), member.userId)).toEqual({
			next: 1,
			loi: null,
		});
		expect(await goi(app.get(PhamViChungMiddleware), okr.userId)).toEqual({
			next: 1,
			loi: null,
		});
	});

	test("doi-vai-hieu-luc-ngay: cookie cu cua member bi chan ngay sau khi doi sang okr", async () => {
		const { userId, email } = await gieoNguoi("doi", "member");
		const cookie = await dangNhap(email);
		const truoc = await goiTrpc(app, "contacts.list", "query", {}, { cookie });
		expect(truoc.status).toBe(200);
		await db.member.updateMany({ where: { userId }, data: { role: "okr" } });
		const sau = await goiTrpc(app, "contacts.list", "query", {}, { cookie });
		expect({ status: sau.status, message: sau.body?.error?.message }).toEqual({
			status: 403,
			message: KHONG_TRONG_PHAM_VI,
		});
	});

	test(
		"nhat-ky: dong tRPC mang vai va pham vi, ke ca khi bi tu choi",
		async () => {
			const okr = await gieoNguoi("okr", "okr");
			const member = await gieoNguoi("member", "member");
			const cookieOkr = await dangNhap(okr.email);
			const cookieMember = await dangNhap(member.email);
			const dong: DongNhatKy[] = [];
			const spy = spyOn(ContextLogger.prototype, "log").mockImplementation(
				(message) => {
					const doc = dongNhatKy.safeParse(message);
					if (doc.success) dong.push(doc.data);
				},
			);
			try {
				await goiTrpc(app, "contacts.list", "query", {}, { cookie: cookieOkr });
				await goiTrpc(app, "users.me", "query", undefined, {
					cookie: cookieMember,
				});
			} finally {
				spy.mockRestore();
			}
			const cua = (path: string) => dong.find((d) => d.path === path);
			expect(cua("contacts.list"), JSON.stringify(dong)).toMatchObject({
				outcome: "err",
				role: "okr",
				phamVi: "doi-tac",
			});
			expect(cua("users.me"), JSON.stringify(dong)).toMatchObject({
				outcome: "ok",
				role: "member",
				phamVi: "chung",
			});
			expect(
				dong.filter(
					(d) =>
						d.role === "okr" && d.phamVi === "doi-tac" && d.outcome === "ok",
				),
				"okr doc duoc doi tac ma nhat ky ghi ok",
			).toEqual([]);
			const loDong: DongNhatKy[] = [];
			const spyLo = spyOn(ContextLogger.prototype, "log").mockImplementation(
				(message) => {
					const doc = dongNhatKy.safeParse(message);
					if (doc.success) loDong.push(doc.data);
				},
			);
			try {
				const lo = await gan(
					request(app.getHttpServer()).get(
						`/api/trpc/workspace.get,zalo.cuaToi,contacts.list?batch=1&input=${encodeURIComponent(JSON.stringify({ 2: {} }))}`,
					),
					{ cookie: cookieOkr },
				);
				expect([200, 207], JSON.stringify(lo.body).slice(0, 300)).toContain(
					lo.status,
				);
			} finally {
				spyLo.mockRestore();
			}
			const cuaLo = (path: string) => loDong.find((d) => d.path === path);
			expect(cuaLo("contacts.list"), JSON.stringify(loDong)).toMatchObject({
				outcome: "err",
				role: "okr",
				phamVi: "doi-tac",
			});
			expect(cuaLo("zalo.cuaToi"), JSON.stringify(loDong)).toMatchObject({
				outcome: "ok",
				role: "okr",
				phamVi: "chung",
			});
			expect(cuaLo("workspace.get"), JSON.stringify(loDong)).toMatchObject({
				outcome: "ok",
				role: "okr",
				phamVi: "chung",
			});
			expect(
				loDong.filter(
					(d) =>
						d.role === "okr" && d.phamVi === "doi-tac" && d.outcome === "ok",
				),
				"trong mot lo, dong cua thu tuc chung bi nhiem pham vi doi tac",
			).toEqual([]);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"ghi-chung: okr chi ghi duoc thu cua minh; cau hinh he thong doi quan tri",
		async () => {
			const okr = await gieoNguoi("okr", "okr");
			const member = await gieoNguoi("member", "member");
			const admin = await gieoNguoi("admin", "admin");
			const cookieOkr = await dangNhap(okr.email);
			const mutation = soThuTuc(app).filter(
				(t) =>
					t.loai === "mutation" &&
					[
						"users",
						"settings",
						"currency",
						"zalo",
						"apiKeys",
						"sso",
						"workspace",
						"org",
						"tinHieu",
					].includes(t.ten.split(".")[0] ?? ""),
			);
			expect(mutation.length).toBeGreaterThanOrEqual(SAN_MUTATION_CHUNG);
			const thieu = mutation
				.filter((t) => dauVaoCua(t.ten) === undefined)
				.map((t) => t.ten);
			expect(thieu, `thieu dau vao hop le cho: ${thieu.join(", ")}`).toEqual(
				[],
			);
			const khongBiChan: string[] = [];
			const saiThongDiep: string[] = [];
			for (const { ten } of mutation) {
				const res = await goiTrpc(app, ten, "mutation", dauVaoCua(ten), {
					cookie: cookieOkr,
				});
				const message = String(res.body?.error?.message ?? "");
				if (res.status !== 403) {
					khongBiChan.push(`${ten} ${res.status} ${message}`);
					continue;
				}
				if (message === KHONG_TRONG_PHAM_VI || message === NOT_A_MEMBER) {
					saiThongDiep.push(`${ten} ${message}`);
				}
			}
			expect(
				khongBiChan.map((h) => h.split(" ")[0]).sort(),
				`tap khong bi chan: ${khongBiChan.join(" | ")}`,
			).toEqual([...TU_PHUC_VU].sort());
			expect(saiThongDiep, "403 nham loai").toEqual([]);
			const cookieMember = await dangNhap(member.email);
			for (const ten of [
				"settings.setAgentModel",
				"settings.setResearchKey",
				"settings.setArchiveRetention",
			]) {
				const res = await goiTrpc(app, ten, "mutation", dauVaoCua(ten), {
					cookie: cookieMember,
				});
				expect(res.status, `${ten} cho member`).toBe(403);
			}
			const cookieAdmin = await dangNhap(admin.email);
			const res = await goiTrpc(
				app,
				"settings.setArchiveRetention",
				"mutation",
				{ days: 30 },
				{ cookie: cookieAdmin },
			);
			expect(res.status, JSON.stringify(res.body)).toBe(200);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"duong-ngoai-router: tap duong HTTP ngoai tRPC/REST tra 2xx cho okr bang dung tap khai",
		async () => {
			const { email } = await gieoNguoi("okr", "okr");
			const cookie = await dangNhap(email);
			const express = app.getHttpAdapter().getInstance() as {
				router: {
					stack: Array<{
						route?: { path: string; methods: Record<string, boolean> };
					}>;
				};
			};
			const cuaNest = express.router.stack.flatMap((l) =>
				l.route
					? Object.keys(l.route.methods).map((m) => ({
							method: m.toUpperCase(),
							path: l.route?.path ?? "",
						}))
					: [],
			);
			const cuaAuth = Object.values(
				auth.api as unknown as Record<
					string,
					{ path?: string; options?: { method?: string | string[] } }
				>,
			).flatMap((e) =>
				e.path && e.options?.method
					? [e.options.method]
							.flat()
							.map((m) => ({ method: m, path: `/api/auth${e.path}` }))
					: [],
			);
			const duong = [...cuaNest, ...cuaAuth].filter(
				(d) =>
					d.path.length > 0 &&
					!d.path.startsWith("/api/trpc") &&
					!d.path.startsWith("/rest") &&
					["GET", "POST", "PATCH", "PUT", "DELETE"].includes(d.method),
			);
			expect(
				duong.length,
				`danh sach duong qua ngan: ${duong.map((d) => `${d.method} ${d.path}`).join(", ")}`,
			).toBeGreaterThanOrEqual(SAN_DUONG_NGOAI);
			const hai: string[] = [];
			for (const d of duong) {
				const url = d.path
					.replace(/:[a-zA-Z]+\??/g, "khong-co")
					.replace(/\*.*$/, "");
				const verb = d.method.toLowerCase() as
					| "get"
					| "post"
					| "patch"
					| "put"
					| "delete";
				const res = await gan(
					request(app.getHttpServer())
						[verb](url)
						.set("content-type", "application/json"),
					{ cookie },
				);
				if (res.status < 300) hai.push(`${d.method} ${d.path}`);
			}
			expect(
				[...new Set(hai)].sort(),
				`duong tra 2xx: ${[...new Set(hai)].sort().join(" | ")}`,
			).toEqual([...KHAI_2XX].sort());
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"gan-vai: admin gan okr qua doi vai va loi moi; member khong gan duoc; chu so huu cuoi khong bi ha",
		async () => {
			const chu = await gieoNguoi("chu", "owner");
			const admin = await gieoNguoi("admin", "admin");
			const nguoi = await gieoNguoi("nguoi", "member");
			await workspace.setMemberRole(admin.userId, {
				memberId: await memberId(nguoi.userId),
				role: "okr",
			});
			expect(await vaiCua(nguoi.userId)).toBe("okr");
			const emailMoi = `${id("moi")}@thu.test`;
			await workspace.allowEmail(admin.userId, {
				email: emailMoi,
				role: "okr",
			});
			const loiMoi = await db.invitation.findFirstOrThrow({
				where: { email: emailMoi },
				select: { role: true },
			});
			expect(loiMoi.role).toBe("okr");
			const now = new Date();
			await db.user.create({
				data: {
					id: id("moi"),
					name: "moi",
					email: emailMoi,
					emailVerified: true,
					createdAt: now,
					updatedAt: now,
				},
			});
			await datMatKhau(id("moi"));
			await dangNhap(emailMoi);
			expect(await vaiCua(id("moi")), "loi moi okr bi ha ve member").toBe(
				"okr",
			);
			await expect(
				workspace.setMemberRole(nguoi.userId, {
					memberId: await memberId(admin.userId),
					role: "okr",
				}),
			).rejects.toThrow(/owner or an admin/);
			await expect(
				workspace.setMemberRole(chu.userId, {
					memberId: await memberId(chu.userId),
					role: "okr",
				}),
			).rejects.toThrow(/needs an owner/);
			expect(await vaiCua(chu.userId)).toBe("owner");
			await workspace.setMemberRole(admin.userId, {
				memberId: await memberId(admin.userId),
				role: "okr",
			});
			const cookieAdmin = await dangNhap(admin.email);
			const danhSach = await goiTrpc(
				app,
				"workspace.members",
				"query",
				{},
				{
					cookie: cookieAdmin,
				},
			);
			expect(danhSach.status).toBe(200);
			await expect(
				workspace.setMemberRole(admin.userId, {
					memberId: await memberId(nguoi.userId),
					role: "member",
				}),
			).rejects.toThrow(/owner or an admin/);
		},
		CHO_MA_TRAN_MS,
	);

	test(
		"proxy-ngoai-pham-vi: okr bi dua ve trang ngoai pham vi, member khong; proxy van doc tu cach",
		async () => {
			const okr = await gieoNguoi("okr", "okr");
			const member = await gieoNguoi("member", "member");
			const cookieOkr = await dangNhap(okr.email);
			const cookieMember = await dangNhap(member.email);
			const khoaTruoc = await readContextDevKey(db);
			await writeContextDevKey(db, "lan-do-khong-phai-khoa-that");
			const server = await app.listen(0, "127.0.0.1");
			const { port } = server.address() as AddressInfo;
			const apiUrl = `http://127.0.0.1:${port}`;
			for (const p of [
				"/contacts",
				"/deals",
				"/onboarding",
				"/chat",
				"/settings/members",
			]) {
				expect(
					duongCua(await locationQuaProxy(cookieOkr, apiUrl, p)),
					p,
				).toMatch(/\/ngoai-pham-vi$/);
			}
			for (const p of ["/", "/settings/notifications"]) {
				expect(
					duongCua(await locationQuaProxy(cookieOkr, apiUrl, p)) ?? "",
					p,
				).not.toContain("ngoai-pham-vi");
			}
			expect(
				duongCua(await locationQuaProxy(cookieOkr, apiUrl, "/settings")),
			).toMatch(/\/settings\/api-keys$/);
			expect(
				duongCua(await locationQuaProxy(cookieMember, apiUrl, "/contacts")) ??
					"",
			).not.toContain("ngoai-pham-vi");
			const res = await goiTrpc(app, "workspace.get", "query", undefined, {
				cookie: cookieOkr,
			});
			expect(res.status).toBe(200);
			expect(res.body.result.data.viewerRole).toBe("okr");
			await writeContextDevKey(db, khoaTruoc ?? "");
		},
		CHO_MA_TRAN_MS,
	);

	describe("pham-vi-so", () => {
		test(
			"bon vai goi nam thu tuc so tren KR cua minh; rieng banGhiChiSo chan vai okr dung cau ghim",
			async () => {
				const VAI_SO = ["owner", "admin", "member", "okr"] as const;
				const nguoi = {} as Record<
					(typeof VAI_SO)[number],
					{ userId: string; cookie: string }
				>;
				for (const vai of VAI_SO) {
					const { userId, email } = await gieoNguoi(`so-${vai}`, vai);
					nguoi[vai] = { userId, cookie: await dangNhap(email) };
				}
				const cycle = await db.okrCycle.create({
					data: {
						kind: "quy",
						name: id("ky-pham-vi-so"),
						startsOn: new Date("2000-01-01T00:00:00Z"),
						endsOn: new Date("2100-01-01T00:00:00Z"),
						phase: "dang-chay",
					},
				});
				const mucTieuId: string[] = [];
				const krCua = {} as Record<(typeof VAI_SO)[number], string>;
				try {
					for (const vai of VAI_SO) {
						const { userId } = nguoi[vai];
						const mt = await db.okrObjective.create({
							data: {
								cycleId: cycle.id,
								level: "ca-nhan",
								personUserId: userId,
								ownerUserId: userId,
								kind: "cam-ket",
								status: "nhap",
								title: id(`mt-so-${vai}`),
							},
						});
						mucTieuId.push(mt.id);
						const kr = await db.okrKeyResult.create({
							data: {
								objectiveId: mt.id,
								title: id(`kr-so-${vai}`),
								kind: "tang-toi",
								ownerUserId: userId,
								startValue: 0,
								targetValue: 100,
								currentValue: 0,
								source: "tay",
							},
						});
						krCua[vai] = kr.id;
					}
					for (const vai of VAI_SO) {
						const { cookie } = nguoi[vai];
						const keyResultId = krCua[vai];
						const chiSo = await goiTrpc(app, "okr.chiSo", "query", undefined, {
							cookie,
						});
						expect(chiSo.status, `${vai} okr.chiSo`).toBe(200);

						const xemTruocVao = encodeURIComponent(
							JSON.stringify({
								chiSo: "thoa-thuan-chot-duoc",
								phamVi: { kieu: "toan-cong-ty" },
								cycleId: cycle.id,
							}),
						);
						const xemTruoc = await gan(
							request(app.getHttpServer()).get(
								`/api/trpc/okr.xemTruocChiSo?input=${xemTruocVao}`,
							),
							{ cookie },
						);
						expect(xemTruoc.status, `${vai} okr.xemTruocChiSo`).toBe(200);

						const datNguon = await goiTrpc(
							app,
							"okr.datNguonKr",
							"mutation",
							{ keyResultId, loai: "api" },
							{ cookie },
						);
						expect(
							datNguon.status,
							`${vai} okr.datNguonKr ${JSON.stringify(datNguon.body)}`,
						).toBe(200);

						const lichSu = await goiTrpc(
							app,
							"okr.lichSuSo",
							"query",
							{ keyResultId },
							{ cookie },
						);
						expect(lichSu.status, `${vai} okr.lichSuSo`).toBe(200);

						const ghi = await goiTrpc(
							app,
							"okr.ghiSoKr",
							"mutation",
							{ id: keyResultId, giaTri: 5 },
							{ cookie },
						);
						expect(
							ghi.status,
							`${vai} okr.ghiSoKr ${JSON.stringify(ghi.body)}`,
						).toBe(200);

						const banGhi = await goiTrpc(
							app,
							"okr.banGhiChiSo",
							"query",
							{ keyResultId, trang: 1 },
							{ cookie },
						);
						if (vai === "okr") {
							expect(banGhi.status, `${vai} okr.banGhiChiSo`).toBe(403);
							expect(
								banGhi.body?.error?.message,
								`${vai} okr.banGhiChiSo message`,
							).toBe(OKR.thongDiep.so.danhSachDoiTac);
						} else {
							expect(
								banGhi.status,
								`${vai} okr.banGhiChiSo ${JSON.stringify(banGhi.body)}`,
							).toBe(200);
						}
					}
				} finally {
					const krIds = Object.values(krCua);
					await db.okrSoChup.deleteMany({
						where: { keyResultId: { in: krIds } },
					});
					await db.okrNguonKr.deleteMany({
						where: { keyResultId: { in: krIds } },
					});
					await db.okrKeyResult.deleteMany({ where: { id: { in: krIds } } });
					await db.okrObjective.deleteMany({
						where: { id: { in: mucTieuId } },
					});
					await db.okrCycle.deleteMany({ where: { id: cycle.id } });
				}
			},
			CHO_MA_TRAN_MS,
		);
	});
});

describe("pham-vi-khep", () => {
	beforeEach(don);

	test("tam thu tuc khep ky co trong so thu tuc va co dau vao hop le", () => {
		const ten = new Set(soThuTuc(app).map((t) => t.ten));
		expect(
			Object.keys(THU_TUC_KHEP).filter((t) => !ten.has(t)),
			"thu tuc khep ky khong do thay",
		).toEqual([]);
		const hong = Object.entries(THU_TUC_KHEP).flatMap(([t, khuon]) => {
			const vao = dauVaoCua(t);
			if (vao === undefined) return [`${t}: thieu dau vao`];
			const doc = khuon.safeParse(vao);
			return doc.success ? [] : [`${t}: ${doc.error.message}`];
		});
		expect(hong, "dau vao hop le cho thu tuc khep ky").toEqual([]);
	});

	test(
		"vai okr: bangCham, xuatKy doc duoc; chamKr, ghiDieuHocDuoc, mangSang theo quyen ban ghi; moRa, dongRa, moLaiKy 403; khong dau ra nao co khoa doi tac",
		async () => {
			const minh = await gieoNguoi("khep-okr", "okr");
			const khac = await gieoNguoi("khep-khac", "member");
			const cookie = await dangNhap(minh.email);
			const dau = { cookie };
			const ra: { ten: string; body: GiaTriJson }[] = [];
			const goi = async (
				ten: keyof typeof THU_TUC_KHEP,
				loai: "query" | "mutation",
				vao: DauVaoHopLe,
			) => {
				const res = await goiTrpc(app, ten, loai, vao, dau);
				ra.push({ ten, body: giaTriJson.parse(res.body) });
				return {
					status: res.status,
					message: String(res.body?.error?.message ?? ""),
					data: res.body?.result?.data,
				};
			};
			const cu = await db.okrProgramConfig.findFirst({
				orderBy: { version: "desc" },
			});
			const chuongTrinh = await db.okrProgramConfig.create({
				data: {
					version: (cu?.version ?? 0) + 1,
					objectiveCap: 50,
					krCap: 50,
					capMode: "canh-bao",
					scoreScale: "0-1",
					weightsOn: false,
					personalOn: true,
					createdById: minh.userId,
				},
			});
			const ky = await db.okrCycle.create({
				data: {
					kind: "quy",
					name: id("ky-khep"),
					startsOn: new Date("2000-01-01T00:00:00Z"),
					endsOn: new Date("2000-03-31T00:00:00Z"),
					phase: "cham-diem",
				},
			});
			const kyKe = await db.okrCycle.create({
				data: {
					kind: "quy",
					name: id("ky-khep-ke"),
					startsOn: new Date("2000-04-01T00:00:00Z"),
					endsOn: new Date("2000-06-30T00:00:00Z"),
					phase: "lap-ke-hoach",
				},
			});
			const gieo = async (userId: string, phan: string) => {
				const mt = await db.okrObjective.create({
					data: {
						cycleId: ky.id,
						level: "ca-nhan",
						personUserId: userId,
						ownerUserId: userId,
						kind: "cam-ket",
						status: "cong-bo",
						publishedAt: new Date("2000-01-02T00:00:00Z"),
						title: id(`mt-khep-${phan}`),
					},
				});
				const kr = await db.okrKeyResult.create({
					data: {
						objectiveId: mt.id,
						title: id(`kr-khep-${phan}`),
						kind: "tang-toi",
						ownerUserId: userId,
						startValue: 0,
						targetValue: 100,
						currentValue: 50,
						source: "tay",
					},
				});
				await db.okrDiemKr.create({
					data: {
						keyResultId: kr.id,
						cycleId: ky.id,
						soChot: 50,
						diemGoiY: 0.5,
						thang: "0-1",
						trongSoBat: false,
						phienBanChuongTrinh: chuongTrinh.version,
					},
				});
				return { mt: mt.id, kr: kr.id };
			};
			try {
				const cuaMinh = await gieo(minh.userId, "minh");
				const cuaKhac = await gieo(khac.userId, "khac");

				const bang = await goi("okr.bangCham", "query", { cycleId: ky.id });
				expect(bang.status, `bangCham ${bang.message}`).toBe(200);
				expect(
					bang.data.mucTieu.map((m: { id: string }) => m.id).sort(),
				).toEqual([cuaMinh.mt, cuaKhac.mt].sort());

				const ket = {
					chamMinh: await goi("okr.chamKr", "mutation", {
						keyResultId: cuaMinh.kr,
						diem: 0.5,
					}),
					chamKhac: await goi("okr.chamKr", "mutation", {
						keyResultId: cuaKhac.kr,
						diem: 0.5,
					}),
					hocMinh: await goi("okr.ghiDieuHocDuoc", "mutation", {
						objectiveId: cuaMinh.mt,
						noiDung: "Khách mới đến từ giới thiệu",
					}),
					hocKhac: await goi("okr.ghiDieuHocDuoc", "mutation", {
						objectiveId: cuaKhac.mt,
						noiDung: "Khách mới đến từ giới thiệu",
					}),
					mangMinh: await goi("okr.mangSang", "mutation", {
						objectiveId: cuaMinh.mt,
					}),
					mangKhac: await goi("okr.mangSang", "mutation", {
						objectiveId: cuaKhac.mt,
					}),
					moRa: await goi("okr.moRa", "mutation", {
						cycleId: ky.id,
						tuNgay: "2000-02-01",
						denNgay: "2000-02-07",
					}),
					dongRa: await goi("okr.dongRa", "mutation", {
						...DAU_VAO_HOP_LE["okr.dongRa"],
					}),
					moLaiKy: await goi("okr.moLaiKy", "mutation", {
						...DAU_VAO_HOP_LE["okr.moLaiKy"],
						id: ky.id,
					}),
				};
				expect(
					Object.fromEntries(
						Object.entries(ket).map(([k, v]) => [
							k,
							`${v.status} ${v.status === 200 ? "" : v.message}`.trim(),
						]),
					),
				).toEqual({
					chamMinh: "200",
					chamKhac: `403 ${OKR.thongDiep.khongSuaDuocKr}`,
					hocMinh: "200",
					hocKhac: `403 ${OKR.thongDiep.khongSuaDuocDonVi}`,
					mangMinh: "200",
					mangKhac: `403 ${OKR.thongDiep.khongSuaDuocDonVi}`,
					moRa: `403 ${OKR.thongDiep.canQuyenQuanTri}`,
					dongRa: `403 ${OKR.thongDiep.canQuyenQuanTri}`,
					moLaiKy: `403 ${OKR.thongDiep.canQuyenQuanTri}`,
				});
				expect(ket.mangMinh.data.cycleId).toBe(kyKe.id);

				await db.okrCycle.update({
					where: { id: ky.id },
					data: { phase: "da-dong" },
				});
				const bangDong = await goi("okr.bangCham", "query", {
					cycleId: ky.id,
				});
				const xuat = await goi("okr.xuatKy", "query", { cycleId: ky.id });
				expect({
					bangDong: bangDong.status,
					xuat: xuat.status,
					coMucTieu: String(xuat.data?.noiDung ?? "").includes(
						id("mt-khep-minh"),
					),
				}).toEqual({ bangDong: 200, xuat: 200, coMucTieu: true });

				const lo = ra.flatMap(({ ten, body }) =>
					khoaCua(body, ten).filter((k) =>
						KHOA_DOI_TAC.some((d) => k.endsWith(`.${d}`)),
					),
				);
				expect(lo, `khoa doi tac trong dau ra: ${lo.join(", ")}`).toEqual([]);
			} finally {
				const kyIds = [ky.id, kyKe.id];
				const mts = { cycleId: { in: kyIds } };
				await db.okrMangSang.deleteMany({ where: { sangCycleId: kyKe.id } });
				await db.okrNhinLai.deleteMany({ where: { objective: mts } });
				await db.okrDiemKr.deleteMany({ where: { cycleId: ky.id } });
				await db.okrKeyResult.deleteMany({ where: { objective: mts } });
				await db.okrParticipant.deleteMany({ where: { objective: mts } });
				await db.okrObjective.deleteMany({ where: mts });
				await db.okrTrail.deleteMany({ where: { cycleId: { in: kyIds } } });
				await db.okrCycle.deleteMany({ where: { id: { in: kyIds } } });
				await db.okrProgramConfig.deleteMany({
					where: { id: chuongTrinh.id },
				});
			}
		},
		CHO_MA_TRAN_MS,
	);
});

describe("sang-kien-an", () => {
	beforeEach(don);

	test("thu tuc okr vai chi OKR voi toi duoc: danh sach viet truoc cong dung thu tuc cua luot; thu tuc canh KR va hoi y co dau vao hop le", () => {
		expect(THU_TUC_OKR_LUOT_HOI_Y.length, "so thu tuc moi cua luot hoi y").toBe(
			SO_THU_TUC_HOI_Y,
		);
		expect(
			choPhep().filter((t) => t.startsWith("okr.")),
			"thu tuc okr cua vai chi OKR lech danh sach viet truoc",
		).toEqual(
			[
				...THU_TUC_OKR_TRUOC_LUOT,
				...THU_TUC_OKR_LUOT_CANH_KR,
				...THU_TUC_OKR_LUOT_GIOI_HAN,
				...THU_TUC_OKR_LUOT_TRO_LY,
				...THU_TUC_OKR_LUOT_SOAN,
				...THU_TUC_OKR_LUOT_TOM_TAT,
				...THU_TUC_OKR_LUOT_UX_8D,
				...THU_TUC_OKR_LUOT_HOI_Y,
				...Object.keys(THU_TUC_SUA_AN_CHU_KY),
				...Object.keys(THU_TUC_DON_OKR),
			].sort(),
		);
		const hong = Object.entries({
			...THU_TUC_CANH_KR,
			...THU_TUC_HOI_Y,
			...THU_TUC_SUA_AN_CHU_KY,
			...THU_TUC_DON_OKR,
		}).flatMap(([t, khuon]) => {
			const vao = dauVaoCua(t);
			if (vao === undefined) return [`${t}: thieu dau vao`];
			const doc = khuon.safeParse(vao);
			return doc.success ? [] : [`${t}: ${doc.error.message}`];
		});
		expect(hong, "dau vao hop le cho thu tuc canh KR va hoi y").toEqual([]);
	});

	test(
		"bon duong x hai vai: vai okr khong nhan id, ten, trang thai, nguoi phu trach cua chien dich va ke hoach; member thay ten",
		async () => {
			const okr = await gieoNguoi("sk-okr", "okr");
			const member = await gieoNguoi("sk-member", "member");
			const phuTrach = await gieoNguoi("sk-phu-trach", "member");
			const tenC = "Gọi lại quý 4";
			const tenCongTyX = `Công ty X ${suffix}`;
			const tenPhuTrachC = `Phụ trách C ${suffix}`;
			await db.user.update({
				where: { id: phuTrach.userId },
				data: { name: tenPhuTrachC },
			});
			const dauCua = {
				okr: { cookie: await dangNhap(okr.email) },
				member: { cookie: await dangNhap(member.email) },
			};
			const khoaCuaVai = {} as Record<"okr" | "member", Dau>;
			for (const vai of ["okr", "member"] as const) {
				const tao = await goiTrpc(
					app,
					"apiKeys.create",
					"mutation",
					{ name: "sang-kien", expiresInDays: null },
					dauCua[vai],
				);
				expect(tao.status, JSON.stringify(tao.body)).toBe(200);
				khoaCuaVai[vai] = { "x-api-key": tao.body.result.data.key as string };
			}
			const cycle = await db.okrCycle.create({
				data: {
					kind: "quy",
					name: id("ky-sang-kien"),
					startsOn: new Date("2000-01-01T00:00:00Z"),
					endsOn: new Date("2100-01-01T00:00:00Z"),
					phase: "dang-chay",
				},
			});
			const mt = await db.okrObjective.create({
				data: {
					cycleId: cycle.id,
					level: "ca-nhan",
					personUserId: member.userId,
					ownerUserId: member.userId,
					kind: "cam-ket",
					status: "cong-bo",
					publishedAt: new Date("2000-01-02T00:00:00Z"),
					title: id("mt-sang-kien"),
				},
			});
			const kr = await db.okrKeyResult.create({
				data: {
					objectiveId: mt.id,
					title: id("kr-sang-kien"),
					kind: "tang-toi",
					ownerUserId: member.userId,
					startValue: 0,
					targetValue: 100,
					currentValue: 0,
					source: "tay",
				},
			});
			const ghi = async (ten: string, vao: DauVaoHopLe) => {
				const res = await goiTrpc(app, ten, "mutation", vao, dauCua.member);
				expect(res.status, `${ten} ${JSON.stringify(res.body)}`).toBe(200);
				return res.body.result.data.id as string;
			};
			let idC = "";
			let congTyX = "";
			try {
				const view = (
					await db.savedView.create({
						data: {
							entity: "CONTACT",
							name: id("goc-nhin-sang-kien"),
							shared: false,
							filters: {
								q: "",
								sort: "",
								dir: "asc",
								archived: false,
								filters: {},
							},
							ownerId: member.userId,
						},
						select: { id: true },
					})
				).id;
				idC = await ghi("campaigns.create", {
					name: tenC,
					savedViewId: view,
					ownerId: phuTrach.userId,
				});
				await ghi("campaigns.start", { id: idC });
				congTyX = await ghi("companies.create", { name: tenCongTyX });
				const idP = (
					await db.onboardingPlan.create({
						data: {
							companyId: congTyX,
							startedAt: new Date(),
							targetDays: 30,
							ownerId: phuTrach.userId,
						},
						select: { id: true },
					})
				).id;
				const ganSk = (loai: "chien-dich" | "ke-hoach", banGhiId: string) =>
					ghi("okr.ganSangKien", { keyResultId: kr.id, loai, banGhiId });
				await ganSk("chien-dich", idC);
				await ghi("okr.goViec", { id: await ganSk("ke-hoach", idP) });
				await ganSk("ke-hoach", idP);

				const CHUOI = {
					idC,
					idP,
					tenC,
					tenCongTyX,
					tenPhuTrachC,
					RUNNING: "RUNNING",
				} as const;
				type TenChuoi = keyof typeof CHUOI;
				const DUONG = [
					"trpc canhKr",
					"rest canhKr",
					"khoa-api rest canhKr",
					"trpc vet",
					"rest vet",
					"khoa-api rest vet",
				] as const;
				type Duong = (typeof DUONG)[number];
				const server = app.getHttpServer();
				const restCanh = `${REST_BRIDGE_PATH}/okr/key-results/${kr.id}/canh`;
				const restVet = `${REST_BRIDGE_PATH}/okr/objectives/${mt.id}`;
				const goiDuong = async (duong: Duong, vai: "okr" | "member") => {
					switch (duong) {
						case "trpc canhKr":
							return goiTrpc(
								app,
								"okr.canhKr",
								"query",
								{ keyResultId: kr.id },
								dauCua[vai],
							);
						case "rest canhKr":
							return gan(request(server).get(restCanh), dauCua[vai]);
						case "khoa-api rest canhKr":
							return gan(request(server).get(restCanh), khoaCuaVai[vai]);
						case "trpc vet":
							return goiTrpc(
								app,
								"okr.objective",
								"query",
								{ id: mt.id },
								dauCua[vai],
							);
						case "rest vet":
							return gan(request(server).get(restVet), dauCua[vai]);
						case "khoa-api rest vet":
							return gan(request(server).get(restVet), khoaCuaVai[vai]);
					}
				};
				const bang = {} as Record<
					"okr" | "member",
					Record<Duong, Record<TenChuoi, number>>
				>;
				const lienKetOkr: string[] = [];
				const vetOkr: string[] = [];
				for (const vai of ["okr", "member"] as const) {
					bang[vai] = {} as Record<Duong, Record<TenChuoi, number>>;
					for (const duong of DUONG) {
						const res = await goiDuong(duong, vai);
						expect(
							res.status,
							`${vai} ${duong} ${JSON.stringify(res.body).slice(0, 300)}`,
						).toBe(200);
						const chu = JSON.stringify(res.body);
						bang[vai][duong] = Object.fromEntries(
							Object.entries(CHUOI).map(([ten, c]) => [
								ten,
								chu.split(c).length - 1,
							]),
						) as Record<TenChuoi, number>;
						if (vai !== "okr") continue;
						const data = duong.startsWith("trpc")
							? res.body.result.data
							: res.body;
						if (duong.endsWith("canhKr"))
							lienKetOkr.push(
								JSON.stringify(
									(data as CanhKrOutput).dong.flatMap((d) =>
										d.loai === "viec" ? [] : [d.lienKet],
									),
								),
							);
						else
							vetOkr.push(
								JSON.stringify(
									(
										data as {
											trail: {
												action: string;
												before: unknown;
												after: unknown;
											}[];
										}
									).trail.flatMap((v) =>
										v.action === "gan-sang-kien"
											? [v.after]
											: v.action === "go-viec"
												? [v.before]
												: [],
									),
								),
							);
					}
				}
				const inBang = (vai: "okr" | "member") =>
					[
						`vai ${vai} | ${Object.keys(CHUOI).join(" | ")}`,
						...DUONG.map(
							(d) => `${d} | ${Object.values(bang[vai][d]).join(" | ")}`,
						),
					].join("\n");
				console.log(`${inBang("okr")}\n\n${inBang("member")}`);

				const khong = Object.fromEntries(Object.keys(CHUOI).map((k) => [k, 0]));
				const lo = DUONG.flatMap((d) =>
					Object.entries(bang.okr[d])
						.filter(([, n]) => n > 0)
						.map(([c, n]) => `okr ${d} lo ${c} x${n}`),
				);
				expect(lo, "vai okr doc duoc du lieu doi tac").toEqual([]);
				expect(bang.okr).toEqual(
					Object.fromEntries(DUONG.map((d) => [d, khong])) as Record<
						Duong,
						Record<TenChuoi, number>
					>,
				);
				const anDu = JSON.stringify([
					{ loai: "chien-dich", coQuyen: false },
					{ loai: "ke-hoach", coQuyen: false },
				]);
				expect(lienKetOkr).toEqual([anDu, anDu, anDu]);
				const vetAn = JSON.stringify([
					{ loai: "chien-dich", coQuyen: false },
					{ loai: "ke-hoach", coQuyen: false },
					{ loai: "ke-hoach", coQuyen: false },
					{ loai: "ke-hoach", coQuyen: false },
				]);
				expect(vetOkr).toEqual([vetAn, vetAn, vetAn]);

				const thieu = [
					...(
						["trpc canhKr", "rest canhKr", "khoa-api rest canhKr"] as const
					).flatMap((d) =>
						(["tenC", "tenCongTyX", "idC", "idP"] as const).map(
							(c) => [d, c] as const,
						),
					),
					...(["trpc vet", "rest vet", "khoa-api rest vet"] as const).flatMap(
						(d) => (["idC", "idP"] as const).map((c) => [d, c] as const),
					),
				]
					.filter(([d, c]) => bang.member[d][c] === 0)
					.map(([d, c]) => `member ${d} thieu ${c}`);
				expect(thieu, "doi chung duong: member phai thay").toEqual([]);
			} finally {
				await db.okrViecKr.deleteMany({ where: { keyResultId: kr.id } });
				await db.okrTrail.deleteMany({ where: { objectiveId: mt.id } });
				await db.okrKeyResult.deleteMany({ where: { id: kr.id } });
				await db.okrObjective.deleteMany({ where: { id: mt.id } });
				await db.okrCycle.deleteMany({ where: { id: cycle.id } });
				if (idC) await db.campaign.deleteMany({ where: { id: idC } });
				await db.savedView.deleteMany({ where: { ownerId: member.userId } });
				if (congTyX) {
					await db.onboardingPlan.deleteMany({
						where: { companyId: congTyX },
					});
					await db.agentTask.deleteMany({ where: { companyId: congTyX } });
					await db.company.deleteMany({ where: { id: congTyX } });
				}
			}
		},
		CHO_MA_TRAN_MS,
	);
});

const DUONG_DOC_NGOAI = join(
	import.meta.dir,
	"..",
	"..",
	"..",
	"_acceptance",
	"gioi-han-duyet-cay-okr",
	"rang",
	"duong-doc-okr.json",
);
const duongDocNgoai = z.array(
	z.object({
		tep: z.string(),
		thuTuc: z.array(z.string()),
		lyDo: z.string(),
	}),
);
const CHO_AN_MS = 240_000;
const THANG_CHAM_AN = z.enum(THANG_CHAM);

type CotK = "chua-G" | "vang";
type NguoiDoc = "K" | "M" | "O";
type DuongDoc = "trpc" | "rest" | "khoa-api rest";
type ChuoiAn =
	| "idG"
	| "tieuDeG"
	| "tieuDeKr"
	| "idKrG"
	| "soChup"
	| "binhLuan"
	| "loiNhan";
type SanDoc = SanAn & {
	nguoiK: string;
	chuG: string;
	hoiY: string;
	cuocSoan: string;
};
type DongDoc = {
	vao: (s: SanDoc, k: string) => DauVaoHopLe | undefined;
	K: CotK;
	dau?: ChuoiAn;
	khac: 200 | 404;
	ma?: "id" | "objectiveId" | "keyResultId" | "cuocSoanId";
	pha?: "da-dong";
	chiQuanTri?: string;
	chiQuanTriTheoMa?: true;
};

const cuaKy = (s: SanDoc) => ({ cycleId: s.ky });
const THU_TU_DOC_OKR = {
	"okr.access": { vao: () => undefined, K: "vang", khac: 200 },
	"okr.aiChiTieu": {
		vao: () => undefined,
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.canQuyenQuanTri,
	},
	"okr.alignmentTargets": {
		vao: (s) => ({ objectiveId: s.c1 }),
		K: "vang",
		khac: 200,
	},
	"okr.alignmentTree": { vao: cuaKy, K: "vang", khac: 200 },
	"okr.banGhiChiSo": {
		vao: (s) => ({ keyResultId: s.krG, trang: 1 }),
		K: "chua-G",
		dau: "tieuDeKr",
		khac: 404,
		ma: "keyResultId",
	},
	"okr.bangCham": {
		vao: cuaKy,
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
		pha: "da-dong",
	},
	"okr.byUnit": {
		vao: (s) => ({ cycleId: s.ky, unit: { loai: "pb", id: s.pb } }),
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
	},
	"okr.canhKr": {
		vao: (s) => ({ keyResultId: s.krG }),
		K: "chua-G",
		dau: "tieuDeKr",
		khac: 404,
		ma: "keyResultId",
	},
	"okr.capNhatTuan": {
		vao: () => undefined,
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
	},
	"okr.cayCanChinh": { vao: cuaKy, K: "vang", khac: 200 },
	"okr.chiSo": { vao: () => undefined, K: "vang", khac: 200 },
	"okr.comments": {
		vao: (s) => ({ objectiveId: s.g }),
		K: "chua-G",
		dau: "binhLuan",
		khac: 404,
		ma: "objectiveId",
	},
	"okr.countByUnit": { vao: cuaKy, K: "vang", khac: 200 },
	"okr.cycles": { vao: () => undefined, K: "vang", khac: 200 },
	"okr.danhSach": {
		vao: (s) => ({
			cycleId: s.ky,
			unit: { loai: "pb", id: s.pb },
			loc: { phuTrach: [], loai: [], trangThai: [], tuTin: [] },
		}),
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
	},
	"okr.chuyenDonViXemTruoc": {
		vao: (s) => ({
			objectiveIds: [s.g],
			denDonVi: { level: "phong-ban", id: s.pb },
		}),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.taiCoCau.canQuanTri,
	},
	"okr.dienBien": {
		vao: (s) => ({ keyResultId: s.krG }),
		K: "chua-G",
		dau: "tieuDeKr",
		khac: 404,
		ma: "keyResultId",
	},
	"okr.hoiY": { vao: cuaKy, K: "vang", khac: 200 },
	"okr.hoiYDoPhu": {
		vao: (s) => ({ hoiYId: s.hoiY }),
		K: "vang",
		khac: 200,
	},
	"okr.hoiYNhan": { vao: cuaKy, K: "vang", khac: 200 },
	"okr.hopTuan": {
		vao: (s) => ({ cycleId: s.ky, unit: { loai: "pb", id: s.pb } }),
		K: "vang",
		khac: 200,
	},
	"okr.khoiCuaToi": {
		vao: (s, k) => ({ cycleId: s.ky, userId: k }),
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
	},
	"okr.lichSuSo": {
		vao: (s) => ({ keyResultId: s.krG }),
		K: "chua-G",
		dau: "soChup",
		khac: 404,
		ma: "keyResultId",
	},
	"okr.mau": {
		vao: (s) => ({ cap: "phong-ban", donViId: s.pb }),
		K: "vang",
		khac: 200,
	},
	"okr.mine": { vao: cuaKy, K: "chua-G", dau: "tieuDeG", khac: 200 },
	"okr.moCoi": {
		vao: cuaKy,
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.taiCoCau.canQuanTri,
	},
	"okr.objective": {
		vao: (s) => ({ id: s.g }),
		K: "chua-G",
		dau: "tieuDeG",
		khac: 404,
		ma: "id",
	},
	"okr.program": { vao: () => undefined, K: "vang", khac: 200 },
	"okr.soanAn": {
		vao: (s) => ({ cuocSoanId: s.cuocSoan }),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.canQuyenQuanTri,
	},
	"okr.soanDanhSach": {
		vao: (s) => ({ cuocSoanId: s.cuocSoan }),
		K: "vang",
		khac: 404,
		ma: "cuocSoanId",
		chiQuanTriTheoMa: true,
	},
	"okr.soanDanhSachCuoc": {
		vao: (s) => ({ cycleId: s.ky, level: "phong-ban", departmentId: s.pb }),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.khongSuaDuocDonVi,
	},
	"okr.soanSanSang": {
		vao: (s) => ({ cycleId: s.ky, level: "phong-ban", departmentId: s.pb }),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.khongSuaDuocDonVi,
	},
	"okr.soanSoDo": {
		vao: cuaKy,
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.canQuyenQuanTri,
	},
	"okr.sucKhoe": {
		vao: cuaKy,
		K: "vang",
		khac: 200,
		chiQuanTri: OKR_XEM.thongDiep.chiQuanTri,
	},
	"okr.thanhVien": { vao: () => undefined, K: "vang", khac: 200 },
	"okr.toanCanh": { vao: cuaKy, K: "vang", khac: 200 },
	"okr.transferPreview": {
		vao: (_s, k) => ({ fromUserId: k }),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.chuyen.canQuanTri,
	},
	"okr.troLyAn": {
		vao: () => ({}),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.canQuyenQuanTri,
	},
	"okr.troLyDanhSach": {
		vao: (s) => ({ objectiveId: s.g, keyResultId: s.krG }),
		K: "vang",
		khac: 200,
	},
	"okr.troLySanSang": {
		vao: (s) => ({ objectiveId: s.g, keyResultId: s.krG }),
		K: "vang",
		khac: 404,
		ma: "objectiveId",
	},
	"okr.troLySoDo": {
		vao: () => ({}),
		K: "vang",
		khac: 200,
		chiQuanTri: OKR.thongDiep.canQuyenQuanTri,
	},
	"okr.troLyTomTat": {
		vao: (s) => ({ cycleId: s.ky, departmentId: s.pb }),
		K: "vang",
		khac: 200,
	},
	"okr.troLyTomTatQuanTri": {
		vao: cuaKy,
		K: "vang",
		khac: 200,
		chiQuanTri: OKR_XEM.thongDiep.chiQuanTri,
	},
	"okr.viecCuaToi": {
		vao: () => undefined,
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
	},
	"okr.xemTruocChiSo": {
		vao: (s) => ({
			chiSo: "thoa-thuan-chot-duoc",
			phamVi: { kieu: "toan-cong-ty" },
			cycleId: s.ky,
		}),
		K: "vang",
		khac: 200,
	},
	"okr.xuHuongKr": {
		vao: (s) => ({ keyResultId: s.krG }),
		K: "vang",
		khac: 404,
		ma: "keyResultId",
	},
	"okr.xuatKy": {
		vao: cuaKy,
		K: "chua-G",
		dau: "tieuDeG",
		khac: 200,
		pha: "da-dong",
	},
} satisfies Record<string, DongDoc>;
const dongDoc = (ten: string): DongDoc | undefined =>
	ten in THU_TU_DOC_OKR
		? THU_TU_DOC_OKR[ten as keyof typeof THU_TU_DOC_OKR]
		: undefined;

function thuTucDocOkr(): string[] {
	const ngoai = duongDocNgoai
		.parse(JSON.parse(readFileSync(DUONG_DOC_NGOAI, "utf8")))
		.flatMap((d) => d.thuTuc);
	return [
		...new Set([
			...soThuTuc(app)
				.filter((t) => t.loai === "query" && t.ten.startsWith("okr."))
				.map((t) => t.ten),
			...ngoai,
		]),
	].sort();
}

function namVN() {
	const nam = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCFullYear();
	return { tu: `${nam}-01-01`, den: `${nam}-12-31` };
}

const DUONG_DOC: DuongDoc[] = ["trpc", "rest", "khoa-api rest"];
const NGUOI_DOC: NguoiDoc[] = ["K", "M", "O"];

type BoiCanhAn = {
	san: SanDoc;
	cookie: Record<NguoiDoc | "Q", string>;
	khoa: Record<NguoiDoc | "Q", Dau>;
	chuoi: Record<ChuoiAn, string>;
	restCua: Map<string, string>;
};

type KetQuaAn = {
	trangThai: Record<string, number>;
	cho: Record<string, number>;
	lo: string[];
	thieu: string[];
	cauKhac: string[];
	bang: string[];
	soDong: number;
};

const giaTriTruyVan = z
	.union([z.string(), z.number(), z.boolean()])
	.transform(String);

type TraDoc = {
	status: number;
	message: string;
	data: GiaTriJson;
	chu: string;
};

function goiRestAn(
	bc: BoiCanhAn,
	ten: string,
	vao: DauVao,
	dau: Dau,
): request.Test {
	const restKey = bc.restCua.get(ten);
	if (!restKey) throw new Error(`${ten} khong co duong REST`);
	const [method, duong] = restKey.split(" ") as [string, string];
	const con = new Map(Object.entries(vao ?? {}));
	const url = duong.replace(/\{(\w+)\}/g, (_m, k: string) => {
		const v = con.get(k);
		con.delete(k);
		return encodeURIComponent(String(v));
	});
	const server = app.getHttpServer();
	if (method === "GET") {
		const truyVan = Object.fromEntries(
			[...con].map(([k, v]) => [k, giaTriTruyVan.parse(v)]),
		);
		return gan(request(server).get(url).query(truyVan), dau);
	}
	return gan(
		request(server)
			.post(url)
			.set("content-type", "application/json")
			.send(JSON.stringify(Object.fromEntries(con))),
		dau,
	);
}

async function goiDocAn(
	bc: BoiCanhAn,
	ten: string,
	vao: DauVao,
	duong: DuongDoc,
	ai: NguoiDoc | "Q",
): Promise<TraDoc> {
	const cookie = { cookie: bc.cookie[ai] };
	const res =
		duong === "trpc"
			? await goiTrpc(app, ten, "query", vao, cookie)
			: await goiRestAn(bc, ten, vao, duong === "rest" ? cookie : bc.khoa[ai]);
	const laTrpc = duong === "trpc";
	return {
		status: res.status,
		message: String(
			(laTrpc ? res.body?.error?.message : res.body?.message) ?? "",
		),
		data: giaTriJson.parse(
			(laTrpc ? res.body?.result?.data : res.body) ?? null,
		),
		chu: JSON.stringify(res.body),
	};
}

function demChuoi(bc: BoiCanhAn, chu: string): Record<ChuoiAn, number> {
	return Object.fromEntries(
		Object.entries(bc.chuoi).map(([k, c]) => [k, chu.split(c).length - 1]),
	) as Record<ChuoiAn, number>;
}

function ghiLo(kq: KetQuaAn, o: string, so: Record<ChuoiAn, number>) {
	for (const [c, n] of Object.entries(so))
		if (n > 0) kq.lo.push(`${o} | lo ${c} x${n}`);
}

async function oDocAn(
	bc: BoiCanhAn,
	kq: KetQuaAn,
	ten: string,
	d: DongDoc,
	duong: DuongDoc,
	ai: NguoiDoc,
) {
	const vao = d.vao(bc.san, bc.san.nguoiK);
	const o = `${ten} | ${duong} | ${ai}`;
	const r = await goiDocAn(bc, ten, vao, duong, ai);
	kq.trangThai[o] = r.status;
	kq.cho[o] = d.chiQuanTri
		? 403
		: ai === "K" && !d.chiQuanTriTheoMa
			? 200
			: d.khac;
	if (d.chiQuanTri && r.message !== d.chiQuanTri)
		kq.cauKhac.push(`${o}: 403 sai cau «${r.message}»`);
	const so = demChuoi(bc, r.chu);
	kq.bang.push(`${o} | ${r.status} | ${Object.values(so).join(" ")}`);
	if (ai !== "K" || d.K === "vang") ghiLo(kq, o, so);
	const dau = d.dau ?? "tieuDeG";
	if (ai === "K" && d.K === "chua-G" && !d.chiQuanTri && so[dau] < 1)
		kq.thieu.push(`${o} | thieu ${dau}`);
	if ((ai === "K" && !d.chiQuanTriTheoMa) || !d.ma || !vao) return;
	const r0 = await goiDocAn(
		bc,
		ten,
		{ ...vao, [d.ma]: `khong-co-${suffix}` },
		duong,
		ai,
	);
	if (r0.status !== 404 || r0.message !== r.message)
		kq.cauKhac.push(
			`${o}: G ${r.status} «${r.message}» / ma khong co ${r0.status} «${r0.message}»`,
		);
}

async function dongDocAn(bc: BoiCanhAn, kq: KetQuaAn, ten: string) {
	const d = dongDoc(ten);
	if (!d) throw new Error(`${ten} khong co dong khai`);
	kq.soDong += 1;
	for (const duong of DUONG_DOC) {
		for (const ai of NGUOI_DOC) await oDocAn(bc, kq, ten, d, duong, ai);
		if (!d.chiQuanTri && !d.chiQuanTriTheoMa) continue;
		const o = `${ten} | ${duong} | Q`;
		const r = await goiDocAn(bc, ten, d.vao(bc.san, bc.san.nguoiK), duong, "Q");
		kq.trangThai[o] = r.status;
		kq.cho[o] = 200;
		const so = demChuoi(bc, r.chu);
		kq.bang.push(`${o} | ${r.status} | ${Object.values(so).join(" ")}`);
		ghiLo(kq, o, so);
	}
}

const vetDoc = z.object({
	trail: z.array(
		z.object({
			action: z.string(),
			before: z.json().nullable(),
			after: z.json().nullable(),
		}),
	),
});

async function vetC1An(bc: BoiCanhAn, kq: KetQuaAn): Promise<string[]> {
	const lech: string[] = [];
	const { san } = bc;
	const dichCua = (x: GiaTriJson | undefined) => {
		const r = z.object({ targetObjectiveId: z.string() }).safeParse(x);
		return r.success ? r.data.targetObjectiveId : null;
	};
	for (const duong of DUONG_DOC)
		for (const ai of NGUOI_DOC) {
			const o = `vet C1 | ${duong} | ${ai}`;
			const r = await goiDocAn(bc, "okr.objective", { id: san.c1 }, duong, ai);
			const dien = await goiDocAn(
				bc,
				"okr.dienBien",
				{ keyResultId: san.krC1 },
				duong,
				ai,
			);
			if (r.status !== 200 || dien.status !== 200) {
				lech.push(`${o}: ${r.status} / dienBien ${dien.status}`);
				continue;
			}
			const vet = vetDoc.parse(r.data).trail;
			const thay = {
				gan: vet.find((v) => v.action === "gan-can-chinh")?.after,
				go: vet.find((v) => v.action === "go-can-chinh")?.before,
			};
			const ra =
				ai === "K" ? { gan: dichCua(thay.gan), go: dichCua(thay.go) } : thay;
			const cho =
				ai === "K"
					? { gan: san.g, go: san.g }
					: { gan: { gioiHan: true }, go: { gioiHan: true } };
			if (JSON.stringify(ra) !== JSON.stringify(cho))
				lech.push(`${o}: ${JSON.stringify(thay)}`);
			const soG = demChuoi(bc, r.chu + dien.chu).idG;
			kq.bang.push(`${o} | idG ${soG}`);
			if (ai !== "K" && soG > 0) kq.lo.push(`${o} | lo idG x${soG}`);
			if (ai === "K" && soG < 1) kq.thieu.push(`${o} | thieu idG`);
		}
	return lech;
}

const CHUA_CHAM_VIET_TRUOC = {
	K: { conLai: 2, coDonViG: true },
	M: { conLai: 1, coDonViG: false },
	O: { conLai: 1, coDonViG: false },
} as const satisfies Record<NguoiDoc, { conLai: number; coDonViG: boolean }>;

const bangChuaCham = z.object({
	conLai: z.number(),
	chuaCham: z.array(z.object({ khoa: z.string(), conLai: z.number() })),
});

async function chuaChamAn(bc: BoiCanhAn, kq: KetQuaAn): Promise<string[]> {
	const { san } = bc;
	const lech: string[] = [];
	const chuoiG = {
		idG: san.g,
		tieuDeG: G_AN.tieuDe,
		tieuDeKr: G_AN.tieuDeKr,
		donViG: id("pb-an"),
		chuG: `${san.chuG}"`,
	};
	for (const duong of DUONG_DOC)
		for (const ai of NGUOI_DOC) {
			const o = `bangCham chua cham | ${duong} | ${ai}`;
			const r = await goiDocAn(
				bc,
				"okr.bangCham",
				{ cycleId: san.ky },
				duong,
				ai,
			);
			if (r.status !== 200) {
				lech.push(`${o}: ${r.status} «${r.message}»`);
				continue;
			}
			const bang = bangChuaCham.parse(r.data);
			const thay = {
				conLai: bang.conLai,
				coDonViG: bang.chuaCham.some((d) => d.khoa === `pb:${san.pb}`),
			};
			if (JSON.stringify(thay) !== JSON.stringify(CHUA_CHAM_VIET_TRUOC[ai]))
				lech.push(`${o}: ${JSON.stringify(thay)}`);
			const so = Object.entries(chuoiG).map(
				([k, c]) => [k, r.chu.split(c).length - 1] as const,
			);
			kq.bang.push(
				`${o} | ${JSON.stringify(thay)} | ${so.map(([k, n]) => `${k} ${n}`).join(" ")}`,
			);
			if (ai !== "K")
				for (const [k, n] of so) if (n > 0) kq.lo.push(`${o} | lo ${k} x${n}`);
		}
	return lech;
}

async function sangDaDongAn(bc: BoiCanhAn, kq: KetQuaAn): Promise<string[]> {
	const { san } = bc;
	await db.session.updateMany({
		where: { userId: { startsWith: `${suffix}-` } },
		data: { expiresAt: new Date("2099-01-01T00:00:00Z") },
	});
	const namSau = Number(namVN().den.slice(0, 4)) + 1;
	setSystemTime(new Date(`${namSau}-01-02T03:00:00Z`));
	try {
		const cham = await goiTrpc(
			app,
			"okr.setCyclePhase",
			"mutation",
			{ id: san.ky, phase: "cham-diem" },
			{ cookie: bc.cookie.Q },
		);
		expect(cham.status, JSON.stringify(cham.body)).toBe(200);
	} finally {
		setSystemTime();
	}
	const lech = await chuaChamAn(bc, kq);
	const chua = await db.okrDiemKr.findMany({
		where: { cycleId: san.ky, diem: null },
		select: { keyResultId: true, diemGoiY: true, thang: true },
	});
	for (const d of chua) {
		const res = await goiTrpc(
			app,
			"okr.chamKr",
			"mutation",
			{
				keyResultId: d.keyResultId,
				diem: diemTheoThang(Number(d.diemGoiY), THANG_CHAM_AN.parse(d.thang)),
			},
			{ cookie: bc.cookie.K },
		);
		expect(res.status, JSON.stringify(res.body)).toBe(200);
	}
	const dong = await goiTrpc(
		app,
		"okr.setCyclePhase",
		"mutation",
		{ id: san.ky, phase: "da-dong" },
		{ cookie: bc.cookie.Q },
	);
	expect(dong.status, JSON.stringify(dong.body)).toBe(200);
	return lech;
}

async function taoNguoiAn(phan: string, vai: Vai) {
	const n = await gieoNguoi(phan, vai);
	return { id: n.userId, cookie: await dangNhap(n.email) };
}

async function khoaApiCua(cookie: string): Promise<Dau> {
	const res = await goiTrpc(
		app,
		"apiKeys.create",
		"mutation",
		{ name: "an", expiresInDays: null },
		{ cookie },
	);
	expect(res.status, JSON.stringify(res.body)).toBe(200);
	return { "x-api-key": res.body.result.data.key as string };
}

async function goiGieoAn(thuTuc: string, vao: Json, cookie: string) {
	const res = await goiTrpc(app, thuTuc, "mutation", vao as DauVaoHopLe, {
		cookie,
	});
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

describe("hien-thi-an", () => {
	beforeEach(don);

	test("THU_TU_DOC_OKR khop dung tap thu tuc doc: query cua router okr cong duong-doc-okr.json", () => {
		const thuTuc = thuTucDocOkr();
		const khai = Object.keys(THU_TU_DOC_OKR).sort();
		console.log(
			`hien-thi-an: ${thuTuc.length} thu tuc doc, ${khai.length} dong khai`,
		);
		expect(
			thuTuc.filter((t) => !khai.includes(t)),
			"thu tuc doc moi chua co dong trong THU_TU_DOC_OKR",
		).toEqual([]);
		expect(khai).toEqual(thuTuc);
	});

	test(
		"ba duong x ba nguoi: M, O khong nhan id, tieu de G, tieu de KR; theo ma 404 cung cau voi ma khong co; vet C1 che dich",
		async () => {
			const nguoi = {
				quanTri: await taoNguoiAn("an-q", "admin"),
				truong: await taoNguoiAn("an-t", "member"),
				k: await taoNguoiAn("an-k", "member"),
				thamGia: await taoNguoiAn("an-tg", "member"),
				x: await taoNguoiAn("an-x", "member"),
			};
			const m = await taoNguoiAn("an-m", "member");
			const o = await taoNguoiAn("an-o", "okr");
			const cookie = {
				K: nguoi.k.cookie,
				M: m.cookie,
				O: o.cookie,
				Q: nguoi.quanTri.cookie,
			};
			const khoa = {
				K: await khoaApiCua(cookie.K),
				M: await khoaApiCua(cookie.M),
				O: await khoaApiCua(cookie.O),
				Q: await khoaApiCua(cookie.Q),
			};
			const gieo = await gieoMucTieuAn(goiGieoAn, nguoi, id, namVN());
			const luc = new Date();
			const hoiY = await db.okrHoiY.create({
				data: {
					cycleId: gieo.ky,
					cauHoi: "Năm tới công ty nên dồn sức vào điều gì?",
					soLieu: [{ nhan: "Doanh thu năm", giaTri: "186 tỷ", ghiChu: "" }],
					hanLuc: luc,
					nguoiChonUserId: nguoi.quanTri.id,
					taoBoiUserId: nguoi.quanTri.id,
					congBoLuc: luc,
					createdAt: luc,
				},
			});
			const cuocSoan = await db.okrCuocSoan.create({
				data: {
					cycleId: gieo.ky,
					level: "phong-ban",
					departmentId: gieo.pb,
					nguoiMoUserId: nguoi.truong.id,
					sessionId: `an-soan-${suffix}`,
					nac: "bat",
				},
			});
			const san = {
				...gieo,
				nguoiK: nguoi.k.id,
				chuG: nguoi.truong.id,
				hoiY: hoiY.id,
				cuocSoan: cuocSoan.id,
			};
			const tatCaNguoi = [...Object.values(nguoi).map((n) => n.id), m.id, o.id];
			try {
				const bc: BoiCanhAn = {
					san,
					cookie,
					khoa,
					chuoi: {
						idG: san.g,
						tieuDeG: G_AN.tieuDe,
						tieuDeKr: G_AN.tieuDeKr,
						idKrG: san.krG,
						soChup: `"giaTri":${G_AN.soChup}`,
						binhLuan: G_AN.binhLuan,
						loiNhan: G_AN.loiNhan,
					},
					restCua: new Map(
						soThuTuc(app).flatMap((t) =>
							t.restKey ? [[t.ten, t.restKey] as const] : [],
						),
					),
				};
				const kq: KetQuaAn = {
					trangThai: {},
					cho: {},
					lo: [],
					thieu: [],
					cauKhac: [],
					bang: [],
					soDong: 0,
				};
				const thuTuc = thuTucDocOkr();
				const phaHai = thuTuc.filter((t) => dongDoc(t)?.pha === "da-dong");
				for (const ten of thuTuc.filter((t) => !phaHai.includes(t)))
					await dongDocAn(bc, kq, ten);
				const vetLech = await vetC1An(bc, kq);
				const chuaChamLech = await sangDaDongAn(bc, kq);
				for (const ten of phaHai) await dongDocAn(bc, kq, ten);
				console.log(
					[
						`hien-thi-an: ${kq.soDong} dong assert / ${thuTuc.length} thu tuc`,
						`thu tuc | duong | nguoi | status | ${Object.keys(bc.chuoi).join(" ")}`,
						...kq.bang,
					].join("\n"),
				);
				expect(kq.soDong).toBe(thuTuc.length);
				expect(kq.trangThai).toEqual(kq.cho);
				expect(
					kq.lo,
					"M, O nhan chuoi cua G; K nhan chuoi cua G o dong K vang",
				).toEqual([]);
				expect(kq.thieu, "K khong thay G o dong chua G").toEqual([]);
				expect(kq.cauKhac, "404 khac cau ma khong co / 403 sai cau").toEqual(
					[],
				);
				expect(vetLech, "vet C1").toEqual([]);
				expect(
					chuaChamLech,
					"bangCham o pha cham diem: so KR chua cham cua nguoi khong xem duoc tinh ca G",
				).toEqual([]);
			} finally {
				setSystemTime();
				await db.okrHoiY.deleteMany({ where: { id: san.hoiY } });
				await db.okrCuocSoan.deleteMany({ where: { id: san.cuocSoan } });
				await donMucTieuAn(san, tatCaNguoi);
			}
		},
		CHO_AN_MS,
	);
});
