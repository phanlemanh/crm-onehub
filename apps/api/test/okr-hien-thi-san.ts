import { db } from "@crm/db";
import { MUC_HIEN_THI, type MucTieuDeXem } from "@crm/validation/okr-hien-thi";
import { CAP_MUC_TIEU } from "@crm/validation/okr-muc-tieu";
import { z } from "zod";
import { roiKhoi, vaoLai } from "./okr-canh-kr-san";
import { gieoKyQuy } from "./okr-khep-san";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	goi,
	type Json,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	type TraLoi,
	truongMoi,
} from "./okr-san";

export const KY_HIEN_THI = { tu: "2026-10-01", den: "2026-12-31" } as const;

export const VAI_XEM = [
	"quanTri",
	"chu",
	"nguoiCaNhan",
	"thamGia",
	"phuTrachKr",
	"nguoiLamViec",
	"nguoiXemCoTen",
	"truongPhongBan",
	"truongBoPhan",
	"truongCuaNguoiCaNhan",
	"nguoiNgoai",
] as const;
export type VaiXem = (typeof VAI_XEM)[number];

export const MUC_TIEU_SAN = [
	"phongBanCongKhai",
	"phongBanGioiHan",
	"caNhanGioiHan",
	"onehubGioiHan",
	"boPhanGioiHan",
	"nhapGioiHan",
] as const;
export type MucTieuSan = (typeof MUC_TIEU_SAN)[number];

export type NguoiSan = { id: string; cookie: string };

export type SanHienThi = {
	ky: string;
	b1: string;
	p1: string;
	p2: string;
	nguoi: Record<VaiXem, NguoiSan>;
	mucTieu: Record<MucTieuSan, string>;
};

async function nguoiCo(
	ten: string,
	vai: "member" | "admin" = "member",
): Promise<NguoiSan> {
	const id = await nguoiMoi(ten, vai);
	return { id, cookie: await phienCua(id) };
}

const idTra = (tra: Parameters<typeof ok>[0], nhan: string) =>
	ok<{ id: string }>(tra, nhan).id;

async function mucTieuMoi(
	ky: string,
	unit: Json,
	chu: string,
	ai: AiHoacCookie,
	nhan: string,
	thamGia: string[] = [],
): Promise<string> {
	return idTra(
		await goi(
			"okr.createObjective",
			{
				cycleId: ky,
				unit,
				title: ma(`ht ${nhan}`),
				kind: "cam-ket",
				ownerUserId: chu,
				participantIds: thamGia,
				whyNow: "",
			},
			ai,
		),
		`tao ${nhan}`,
	);
}

async function krMoi(
	objectiveId: string,
	chu: string,
	ai: AiHoacCookie,
	nhan: string,
): Promise<string> {
	return idTra(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma(`ht kr ${nhan}`),
				kind: "tang-toi",
				ownerUserId: chu,
				startValue: 0,
				targetValue: 100,
				currentValue: 0,
				unit: "",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		`tao kr ${nhan}`,
	);
}

async function congBo(id: string, ai: AiHoacCookie, nhan: string) {
	ok(await goi("okr.publishObjective", { id }, ai), `cong bo ${nhan}`);
}

export async function datGioiHan(
	objectiveId: string,
	nguoiXem: string[],
	ai: AiHoacCookie,
): Promise<void> {
	ok(
		await goi(
			"okr.datHienThi",
			{ objectiveId, hienThi: "gioi-han", nguoiXem },
			ai,
		),
		`dat gioi han ${objectiveId}`,
	);
}

export async function gieoHienThi(): Promise<SanHienThi> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const b1 = await bpMoi("ht-b1");
	const p1 = await pbMoi("ht-p1", b1);
	const p2 = await pbMoi("ht-p2");
	const h = await truongMoi("division", b1, "ht-H");
	const t = await truongMoi("department", p1, "ht-T");
	const n = await truongMoi("department", p2, "ht-N");
	const nguoi = {
		quanTri: await nguoiCo("ht-Q", "admin"),
		chu: await nguoiCo("ht-C"),
		nguoiCaNhan: await nguoiCo("ht-K"),
		thamGia: await nguoiCo("ht-G"),
		phuTrachKr: await nguoiCo("ht-R"),
		nguoiLamViec: await nguoiCo("ht-L"),
		nguoiXemCoTen: await nguoiCo("ht-X"),
		truongPhongBan: { id: t.nguoi, cookie: t.cookie },
		truongBoPhan: { id: h.nguoi, cookie: h.cookie },
		truongCuaNguoiCaNhan: { id: n.nguoi, cookie: n.cookie },
		nguoiNgoai: await nguoiCo("ht-O"),
	} satisfies Record<VaiXem, NguoiSan>;
	const { chu, nguoiCaNhan, thamGia, phuTrachKr, nguoiLamViec, nguoiXemCoTen } =
		nguoi;
	ok(await datViTri(nguoiCaNhan.id, p2), "xep K vao P2");
	const ky = await gieoKyQuy(KY_HIEN_THI);
	const pb1 = { level: "phong-ban", departmentId: p1 };

	const phongBanCongKhai = await mucTieuMoi(ky, pb1, chu.id, t.cookie, "pb ck");
	await krMoi(phongBanCongKhai, chu.id, t.cookie, "pb ck");
	await congBo(phongBanCongKhai, t.cookie, "pb ck");

	const phongBanGioiHan = await mucTieuMoi(ky, pb1, chu.id, t.cookie, "pb gh", [
		thamGia.id,
	]);
	const krGh = await krMoi(phongBanGioiHan, phuTrachKr.id, t.cookie, "pb gh");
	idTra(
		await goi(
			"okr.themViec",
			{
				keyResultId: krGh,
				tieuDe: "Việc dưới KR giới hạn",
				nguoiLamUserId: nguoiLamViec.id,
				hanNgay: null,
			},
			phuTrachKr.cookie,
		),
		"them viec pb gh",
	);
	await congBo(phongBanGioiHan, t.cookie, "pb gh");
	await datGioiHan(phongBanGioiHan, [nguoiXemCoTen.id], t.cookie);

	const caNhanGioiHan = await mucTieuMoi(
		ky,
		{ level: "ca-nhan", personUserId: nguoiCaNhan.id },
		chu.id,
		nguoiCaNhan.cookie,
		"cn gh",
	);
	await krMoi(caNhanGioiHan, chu.id, nguoiCaNhan.cookie, "cn gh");
	await congBo(caNhanGioiHan, nguoiCaNhan.cookie, "cn gh");
	await datGioiHan(caNhanGioiHan, [], nguoiCaNhan.cookie);

	const onehubGioiHan = await mucTieuMoi(
		ky,
		{ level: "onehub" },
		chu.id,
		nguoi.quanTri.cookie,
		"oh gh",
	);
	await krMoi(onehubGioiHan, chu.id, nguoi.quanTri.cookie, "oh gh");
	await congBo(onehubGioiHan, nguoi.quanTri.cookie, "oh gh");
	await datGioiHan(onehubGioiHan, [], nguoi.quanTri.cookie);

	const boPhanGioiHan = await mucTieuMoi(
		ky,
		{ level: "bo-phan", divisionId: b1 },
		chu.id,
		h.cookie,
		"bp gh",
	);
	await krMoi(boPhanGioiHan, chu.id, h.cookie, "bp gh");
	await congBo(boPhanGioiHan, h.cookie, "bp gh");
	await datGioiHan(boPhanGioiHan, [], h.cookie);

	const nhapGioiHan = await mucTieuMoi(
		ky,
		{ level: "phong-ban", departmentId: p2 },
		chu.id,
		n.cookie,
		"nhap gh",
	);
	await datGioiHan(nhapGioiHan, [nguoiXemCoTen.id], n.cookie);

	return {
		ky,
		b1,
		p1,
		p2,
		nguoi,
		mucTieu: {
			phongBanCongKhai,
			phongBanGioiHan,
			caNhanGioiHan,
			onehubGioiHan,
			boPhanGioiHan,
			nhapGioiHan,
		},
	};
}

export type SanTruongBiLoai = {
	donVi: {
		pbRoi: string;
		pbPhu: string;
		bpRa: string;
		pbRa: string;
		pbLuu: string;
		bpLuu: string;
		bpLuuCoCon: string;
		pbDuoiBpLuu: string;
	};
	nguoi: {
		daChuyenDi: string;
		truongQuaPhu: string;
		daRoiWorkspace: string;
		truongPbLuu: string;
		truongBpLuu: string;
		truongPbDuoiBpLuu: string;
		truongBpLuuCoCon: string;
		nguoiPbDuoiBpLuu: string;
	};
};

async function datTruong(
	kind: "division" | "department",
	id: string,
	userId: string,
	nhan: string,
): Promise<void> {
	ok(await goi("org.setHead", { kind, id, userId }), `truong ${nhan}`);
}

async function luuTru(
	thuTuc: "org.archiveDepartment" | "org.archiveDivision",
	id: string,
	nhan: string,
): Promise<void> {
	ok(await goi(thuTuc, { id }), `luu tru ${nhan}`);
}

export async function gieoTruongBiLoai(): Promise<SanTruongBiLoai> {
	const pbLe = await pbMoi("ht-le");

	const pbRoi = await pbMoi("ht-pb-roi");
	const daChuyenDi = (await truongMoi("department", pbRoi, "ht-chuyen-di"))
		.nguoi;
	ok(await datViTri(daChuyenDi, pbLe), "chuyen truong ra khoi phong ban");

	const pbPhu = await pbMoi("ht-pb-phu");
	const truongQuaPhu = await nguoiMoi("ht-truong-phu");
	ok(await datViTri(truongQuaPhu, pbLe, [pbPhu]), "xep truong qua phu");
	await datTruong("department", pbPhu, truongQuaPhu, "qua phong ban phu");

	const bpRa = await bpMoi("ht-bp-ra");
	const pbRa = await pbMoi("ht-pb-ra");
	const daRoiWorkspace = (await truongMoi("department", pbRa, "ht-roi-ws"))
		.nguoi;
	await datTruong("division", bpRa, daRoiWorkspace, "bo phan nguoi roi");
	await roiKhoi(daRoiWorkspace);

	const pbLuu = await pbMoi("ht-pb-luu");
	const truongPbLuu = (await truongMoi("department", pbLuu, "ht-truong-luu"))
		.nguoi;
	await roiKhoi(truongPbLuu);
	await luuTru("org.archiveDepartment", pbLuu, "phong ban co truong");
	await vaoLai(truongPbLuu);

	const bpLuu = await bpMoi("ht-bp-luu");
	const truongBpLuu = (await truongMoi("division", bpLuu, "ht-truong-bp-luu"))
		.nguoi;
	await luuTru("org.archiveDivision", bpLuu, "bo phan co truong");

	const bpLuuCoCon = await bpMoi("ht-bp-luu-con");
	const truongBpLuuCoCon = (
		await truongMoi("division", bpLuuCoCon, "ht-truong-bp-con")
	).nguoi;
	const pbDuoiBpLuu = await pbMoi("ht-pb-duoi-luu", bpLuuCoCon);
	await luuTru("org.archiveDepartment", pbDuoiBpLuu, "phong ban con");
	await luuTru("org.archiveDivision", bpLuuCoCon, "bo phan co con");
	await db.department.update({
		where: { id: pbDuoiBpLuu },
		data: { archivedAt: null },
	});
	const truongPbDuoiBpLuu = (
		await truongMoi("department", pbDuoiBpLuu, "ht-truong-pb-duoi")
	).nguoi;
	const nguoiPbDuoiBpLuu = await nguoiMoi("ht-nguoi-pb-duoi");
	ok(await datViTri(nguoiPbDuoiBpLuu, pbDuoiBpLuu), "xep nguoi pb duoi");

	return {
		donVi: {
			pbRoi,
			pbPhu,
			bpRa,
			pbRa,
			pbLuu,
			bpLuu,
			bpLuuCoCon,
			pbDuoiBpLuu,
		},
		nguoi: {
			daChuyenDi,
			truongQuaPhu,
			daRoiWorkspace,
			truongPbLuu,
			truongBpLuu,
			truongPbDuoiBpLuu,
			truongBpLuuCoCon,
			nguoiPbDuoiBpLuu,
		},
	};
}

export const G_AN = {
	tieuDe: "Tái cơ cấu hợp đồng mẫu",
	tieuDeKr: "Rà 40 hợp đồng",
	soChup: 37.5,
	binhLuan: "Bản nháp điều khoản phạt chưa chốt",
	loiNhan: "Cảm ơn đã rà xong lô đầu",
	tieuDeC1: "Mục tiêu cá nhân công khai C1",
	tieuDeKrC1: "Gọi 10 khách cũ",
} as const;

export type GoiThuTuc = (
	thuTuc: string,
	vao: Json,
	cookie: string,
) => Promise<TraLoi>;

export type VaiAn = "quanTri" | "truong" | "k" | "thamGia" | "x";

export type SanAn = {
	nam: string;
	ky: string;
	pb: string;
	g: string;
	krG: string;
	c1: string;
	krC1: string;
};

export async function gieoMucTieuAn(
	goiThuTuc: GoiThuTuc,
	nguoi: Record<VaiAn, NguoiSan>,
	ten: (phan: string) => string,
	ky: { tu: string; den: string },
): Promise<SanAn> {
	const { quanTri, truong, k, thamGia, x } = nguoi;
	const lam = async <T>(
		thuTuc: string,
		vao: Json,
		ai: NguoiSan,
		nhan: string,
	): Promise<T> => ok<T>(await goiThuTuc(thuTuc, vao, ai.cookie), nhan);
	const idCua = async (
		thuTuc: string,
		vao: Json,
		ai: NguoiSan,
		nhan: string,
	): Promise<string> => (await lam<{ id: string }>(thuTuc, vao, ai, nhan)).id;

	await lam("okr.setProgram", { ...CHUONG_TRINH_RONG }, quanTri, "cau hinh");
	const pb = await idCua(
		"org.createDepartment",
		{ name: ten("pb-an"), divisionId: null },
		quanTri,
		"tao phong ban",
	);
	await lam(
		"org.setPlacement",
		{
			userId: truong.id,
			primaryDepartmentId: pb,
			secondaryDepartmentIds: [],
			managerUserId: null,
		},
		quanTri,
		"xep truong",
	);
	await lam(
		"org.setHead",
		{ kind: "department", id: pb, userId: truong.id },
		quanTri,
		"dat truong",
	);
	const chuKy = (kind: "nam" | "quy", parentId: string | null) => ({
		kind,
		name: ten(`ky-an-${kind}`),
		parentId,
		startsOn: kind === "nam" ? `${ky.tu.slice(0, 4)}-01-01` : ky.tu,
		endsOn: kind === "nam" ? `${ky.tu.slice(0, 4)}-12-31` : ky.den,
		breakStartsOn: null,
		breakEndsOn: null,
		updateWeekday: 1,
	});
	const nam = await idCua(
		"okr.createCycle",
		chuKy("nam", null),
		quanTri,
		"tao nam",
	);
	const kyId = await idCua(
		"okr.createCycle",
		chuKy("quy", nam),
		quanTri,
		"tao quy",
	);
	await lam(
		"okr.setCyclePhase",
		{ id: kyId, phase: "dang-chay" },
		quanTri,
		"dang chay",
	);

	const g = await idCua(
		"okr.createObjective",
		{
			cycleId: kyId,
			unit: { level: "phong-ban", departmentId: pb },
			title: G_AN.tieuDe,
			kind: "cam-ket",
			ownerUserId: truong.id,
			participantIds: [thamGia.id],
			whyNow: "",
		},
		truong,
		"tao G",
	);
	const krMoi = (objectiveId: string, title: string) => ({
		objectiveId,
		title,
		kind: "tang-toi",
		ownerUserId: k.id,
		startValue: 0,
		targetValue: 100,
		currentValue: 0,
		unit: "",
		dueOn: null,
		weight: 1,
	});
	const krG = await idCua(
		"okr.createKeyResult",
		krMoi(g, G_AN.tieuDeKr),
		truong,
		"tao KR cua G",
	);
	await lam(
		"okr.datNguonKr",
		{ keyResultId: krG, loai: "api" },
		truong,
		"nguon api",
	);
	await lam("okr.publishObjective", { id: g }, truong, "cong bo G");

	const c1 = await idCua(
		"okr.createObjective",
		{
			cycleId: kyId,
			unit: { level: "ca-nhan", personUserId: k.id },
			title: G_AN.tieuDeC1,
			kind: "cam-ket",
			ownerUserId: k.id,
			participantIds: [],
			whyNow: "",
		},
		k,
		"tao C1",
	);
	const krC1 = await idCua(
		"okr.createKeyResult",
		krMoi(c1, G_AN.tieuDeKrC1),
		k,
		"tao KR cua C1",
	);
	await lam("okr.publishObjective", { id: c1 }, k, "cong bo C1");
	const noi = await idCua(
		"okr.addAlignment",
		{ objectiveId: c1, targetObjectiveId: g, targetKeyResultId: null },
		k,
		"can chinh C1 vao G",
	);
	await lam("okr.removeAlignment", { id: noi }, k, "go can chinh C1");

	await idCua(
		"okr.themViec",
		{
			keyResultId: krG,
			tieuDe: "Rà lô hợp đồng đầu",
			nguoiLamUserId: k.id,
			hanNgay: null,
		},
		k,
		"them viec",
	);
	await lam(
		"okr.addComment",
		{ objectiveId: g, body: G_AN.binhLuan, mentionUserIds: [] },
		truong,
		"binh luan G",
	);
	await idCua(
		"okr.guiGhiNhan",
		{
			objectiveId: g,
			keyResultId: krG,
			nguoiNhan: [k.id],
			loiNhan: G_AN.loiNhan,
		},
		truong,
		"ghi nhan K",
	);
	await lam("okr.ghiSoKr", { id: krG, giaTri: G_AN.soChup }, k, "ghi so api");
	for (const lan of ["mot", "hai"]) {
		const { sessionId } = await lam<{ sessionId: string }>(
			"okr.moCapNhat",
			{ entry: "tab" },
			k,
			`mo cap nhat ${lan}`,
		);
		await lam(
			"okr.guiCapNhat",
			{
				sessionId,
				items: [{ keyResultId: krG, value: 0, confidence: "vua", note: "" }],
			},
			k,
			`gui cap nhat ${lan}`,
		);
	}
	await lam("okr.follow", { objectiveId: g, on: true }, x, "theo doi G");
	await lam(
		"okr.datHienThi",
		{ objectiveId: g, hienThi: "gioi-han", nguoiXem: [x.id] },
		truong,
		"dat gioi han G",
	);
	return { nam, ky: kyId, pb, g, krG, c1, krC1 };
}

export async function donMucTieuAn(san: SanAn, userIds: string[]) {
	const cuaKy = { cycleId: { in: [san.ky, san.nam] } };
	const mucTieu = { objective: cuaKy };
	const kr = { keyResult: mucTieu };
	await db.okrGhiNhanNhan.deleteMany({ where: { ghiNhan: mucTieu } });
	await db.okrGhiNhan.deleteMany({ where: mucTieu });
	await db.okrMention.deleteMany({ where: { comment: mucTieu } });
	await db.okrComment.deleteMany({ where: mucTieu });
	await db.okrFollow.deleteMany({ where: mucTieu });
	await db.okrCheckIn.deleteMany({ where: kr });
	await db.okrCheckInSession.deleteMany({
		where: { userId: { in: userIds } },
	});
	await db.okrAlignment.deleteMany({
		where: { OR: [mucTieu, { targetObjective: cuaKy }] },
	});
	await db.okrSoChup.deleteMany({ where: kr });
	await db.okrNguonKr.deleteMany({ where: kr });
	await db.okrDiemKr.deleteMany({ where: cuaKy });
	await db.okrDoiDich.deleteMany({ where: kr });
	await db.okrBangChung.deleteMany({ where: kr });
	await db.okrViecKr.deleteMany({ where: kr });
	await db.okrKeyResult.deleteMany({ where: mucTieu });
	await db.okrParticipant.deleteMany({ where: mucTieu });
	await db.okrNhinLai.deleteMany({ where: mucTieu });
	await db.okrObjective.deleteMany({ where: cuaKy });
	await db.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: { in: [san.ky, san.nam] } },
				{ objectiveId: { in: [san.g, san.c1] } },
				{ actorUserId: { in: userIds } },
			],
		},
	});
	await db.okrCycle.deleteMany({ where: { id: san.ky } });
	await db.okrCycle.deleteMany({ where: { id: san.nam } });
	await db.okrProgramConfig.deleteMany({
		where: { createdById: { in: userIds } },
	});
	await db.orgPlacement.deleteMany({ where: { userId: { in: userIds } } });
	await db.department.updateMany({
		where: { id: san.pb },
		data: { headUserId: null },
	});
	await db.department.deleteMany({ where: { id: san.pb } });
}

export type SanSoGop = {
	ky: string;
	b1: string;
	p1: string;
	t: NguoiSan;
	h: NguoiSan;
	m: NguoiSan;
	mucTieu: { g: string; c1: string; c2: string; bp: string; cn: string };
	kr: { g: string; c1: string; c2: string };
	tieuDe: { g: string; c1: string; c2: string };
};

async function mucTieuCoKr(
	ky: string,
	unit: Json,
	chu: string,
	ai: AiHoacCookie,
	nhan: string,
	hienTai: number,
	congBoLuon = true,
): Promise<{ id: string; kr: string; tieuDe: string }> {
	const tieuDe = ma(`ht ${nhan}`);
	const id = idTra(
		await goi(
			"okr.createObjective",
			{
				cycleId: ky,
				unit,
				title: tieuDe,
				kind: "cam-ket",
				ownerUserId: chu,
				participantIds: [],
				whyNow: "",
			},
			ai,
		),
		`tao ${nhan}`,
	);
	const kr = idTra(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId: id,
				title: ma(`ht kr ${nhan}`),
				kind: "tang-toi",
				ownerUserId: chu,
				startValue: 0,
				targetValue: 100,
				currentValue: hienTai,
				unit: "",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		`tao kr ${nhan}`,
	);
	if (congBoLuon) await congBo(id, ai, nhan);
	return { id, kr, tieuDe };
}

export async function gieoSoGop(): Promise<SanSoGop> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const b1 = await bpMoi("sg-b1");
	const p1 = await pbMoi("sg-p1", b1);
	const hTruong = await truongMoi("division", b1, "sg-H");
	const tTruong = await truongMoi("department", p1, "sg-T");
	const t = { id: tTruong.nguoi, cookie: tTruong.cookie };
	const h = { id: hTruong.nguoi, cookie: hTruong.cookie };
	const m = await nguoiCo("sg-M");
	const ky = await gieoKyQuy(KY_HIEN_THI);
	const pb1 = { level: "phong-ban", departmentId: p1 };
	const g = await mucTieuCoKr(ky, pb1, t.id, t.cookie, "sg G", 90);
	const c1 = await mucTieuCoKr(ky, pb1, t.id, t.cookie, "sg C1", 20);
	const c2 = await mucTieuCoKr(ky, pb1, t.id, t.cookie, "sg C2", 40);
	const bp = await mucTieuCoKr(
		ky,
		{ level: "bo-phan", divisionId: b1 },
		h.id,
		h.cookie,
		"sg BP",
		0,
	);
	const cn = await mucTieuCoKr(
		ky,
		{ level: "ca-nhan", personUserId: t.id },
		t.id,
		t.cookie,
		"sg CN",
		0,
		false,
	);
	for (const mt of [g, c1, c2])
		ok(
			await goi("okr.follow", { objectiveId: mt.id, on: true }, m.cookie),
			"M theo doi",
		);
	await datGioiHan(g.id, [], t.cookie);
	return {
		ky,
		b1,
		p1,
		t,
		h,
		m,
		mucTieu: { g: g.id, c1: c1.id, c2: c2.id, bp: bp.id, cn: cn.id },
		kr: { g: g.kr, c1: c1.kr, c2: c2.kr },
		tieuDe: { g: g.tieuDe, c1: c1.tieuDe, c2: c2.tieuDe },
	};
}

const hangDeXem = z.object({
	id: z.string(),
	hienThi: z.enum(MUC_HIEN_THI),
	level: z.enum(CAP_MUC_TIEU),
	divisionId: z.string().nullable(),
	departmentId: z.string().nullable(),
	personUserId: z.string().nullable(),
	ownerUserId: z.string(),
	participants: z.array(z.object({ userId: z.string() })),
	keyResults: z.array(
		z.object({
			ownerUserId: z.string(),
			viecKr: z.array(z.object({ nguoiLamUserId: z.string().nullable() })),
		}),
	),
	nguoiXem: z.array(z.object({ userId: z.string() })),
});

export async function mucTieuDeXemCua(
	ids: string[],
): Promise<Map<string, MucTieuDeXem>> {
	const rows = await db.okrObjective.findMany({
		where: { id: { in: ids } },
		select: {
			id: true,
			hienThi: true,
			level: true,
			divisionId: true,
			departmentId: true,
			personUserId: true,
			ownerUserId: true,
			participants: { select: { userId: true } },
			keyResults: {
				select: {
					ownerUserId: true,
					viecKr: { select: { nguoiLamUserId: true } },
				},
			},
			nguoiXem: { select: { userId: true } },
		},
	});
	return new Map(
		rows.map((tho) => {
			const r = hangDeXem.parse(tho);
			return [
				r.id,
				{
					hienThi: r.hienThi,
					level: r.level,
					divisionId: r.divisionId,
					departmentId: r.departmentId,
					personUserId: r.personUserId,
					ownerUserId: r.ownerUserId,
					thamGia: r.participants.map((p) => p.userId),
					phuTrachKr: r.keyResults.map((k) => k.ownerUserId),
					nguoiLamViec: r.keyResults.flatMap((k) =>
						k.viecKr.flatMap((v) =>
							v.nguoiLamUserId === null ? [] : [v.nguoiLamUserId],
						),
					),
					nguoiXem: r.nguoiXem.map((x) => x.userId),
				},
			];
		}),
	);
}

export type AnhHienThi = { hienThi: string; nguoiXem: string[]; vet: number };

export async function anhHienThi(objectiveId: string): Promise<AnhHienThi> {
	const [mt, vet] = await Promise.all([
		db.okrObjective.findUniqueOrThrow({
			where: { id: objectiveId },
			select: {
				hienThi: true,
				nguoiXem: { select: { userId: true }, orderBy: { userId: "asc" } },
			},
		}),
		db.okrTrail.count({ where: { objectiveId } }),
	]);
	return {
		hienThi: mt.hienThi,
		nguoiXem: mt.nguoiXem.map((x) => x.userId),
		vet,
	};
}

export async function datMuc(
	objectiveId: string,
	hienThi: string,
	nguoiXem: string[],
	ai: AiHoacCookie,
): Promise<TraLoi> {
	return goi("okr.datHienThi", { objectiveId, hienThi, nguoiXem }, ai);
}

export async function mucTieuPhongBan(
	ky: string,
	departmentId: string,
	chu: NguoiSan,
	nhan: string,
	kr: { chu: string; congBo: boolean } | null,
): Promise<{ id: string; kr: string | null }> {
	const id = await mucTieuMoi(
		ky,
		{ level: "phong-ban", departmentId },
		chu.id,
		chu.cookie,
		nhan,
	);
	if (!kr) return { id, kr: null };
	const krId = await krMoi(id, kr.chu, chu.cookie, nhan);
	if (kr.congBo) await congBo(id, chu.cookie, nhan);
	return { id, kr: krId };
}

export type SanHienThiGhi = {
	ky: string;
	b1: string;
	p1: string;
	t: NguoiSan;
	h: NguoiSan;
	k: NguoiSan;
	m: NguoiSan;
	x: NguoiSan;
	y: NguoiSan;
	z: NguoiSan;
	ngoai: string;
	g: string;
	g2: string;
	gc: { id: string; kr: string };
	bp: string;
	cn1: string;
	cn2: string;
};

export async function gieoHienThiGhi(): Promise<SanHienThiGhi> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const b1 = await bpMoi("hg-b1");
	const p1 = await pbMoi("hg-p1", b1);
	const hTruong = await truongMoi("division", b1, "hg-H");
	const tTruong = await truongMoi("department", p1, "hg-T");
	const t = { id: tTruong.nguoi, cookie: tTruong.cookie };
	const h = { id: hTruong.nguoi, cookie: hTruong.cookie };
	const k = await nguoiCo("hg-K");
	ok(await datViTri(k.id, p1), "xep K vao P1");
	const m = await nguoiCo("hg-M");
	const x = await nguoiCo("hg-X");
	const y = await nguoiCo("hg-Y");
	const z = await nguoiCo("hg-Z");
	const ngoai = await nguoiMoi("hg-ngoai");
	await roiKhoi(ngoai);
	const ky = await gieoKyQuy(KY_HIEN_THI);
	const g = (await mucTieuPhongBan(ky, p1, t, "hg G", null)).id;
	const g2 = (
		await mucTieuPhongBan(ky, p1, t, "hg G2", { chu: t.id, congBo: true })
	).id;
	ok(await datMuc(g2, "gioi-han", [x.id, y.id], t.cookie), "G2 gioi han");
	const gc = await mucTieuPhongBan(ky, p1, t, "hg Gc", {
		chu: t.id,
		congBo: true,
	});
	const bp = await mucTieuMoi(
		ky,
		{ level: "bo-phan", divisionId: b1 },
		h.id,
		h.cookie,
		"hg BP",
	);
	await krMoi(bp, h.id, h.cookie, "hg BP");
	await congBo(bp, h.cookie, "hg BP");
	const caNhan = async (nhan: string) => {
		const id = await mucTieuMoi(
			ky,
			{ level: "ca-nhan", personUserId: k.id },
			k.id,
			k.cookie,
			nhan,
		);
		await krMoi(id, k.id, k.cookie, nhan);
		await congBo(id, k.cookie, nhan);
		return id;
	};
	return {
		ky,
		b1,
		p1,
		t,
		h,
		k,
		m,
		x,
		y,
		z,
		ngoai,
		g,
		g2,
		gc: { id: gc.id, kr: gc.kr ?? "" },
		bp,
		cn1: await caNhan("hg CN1"),
		cn2: await caNhan("hg CN2"),
	};
}

export type SanGhiKe = {
	ky: string;
	p1: string;
	t: NguoiSan;
	a: NguoiSan;
	b: NguoiSan;
	m: NguoiSan;
	g: string;
	krG: string;
	tieuDeG: string;
};

export async function gieoGhiKe(): Promise<SanGhiKe> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const p1 = await pbMoi("gk-p1");
	const tTruong = await truongMoi("department", p1, "gk-T");
	const t = { id: tTruong.nguoi, cookie: tTruong.cookie };
	const a = await nguoiCo("gk-A");
	const b = await nguoiCo("gk-B");
	const m = await nguoiCo("gk-M");
	const ky = await gieoKyQuy(KY_HIEN_THI);
	const tieuDeG = ma("gk G");
	const g = idTra(
		await goi(
			"okr.createObjective",
			{
				cycleId: ky,
				unit: { level: "phong-ban", departmentId: p1 },
				title: tieuDeG,
				kind: "cam-ket",
				ownerUserId: t.id,
				participantIds: [],
				whyNow: "",
			},
			t.cookie,
		),
		"tao G",
	);
	const krG = await krMoi(g, a.id, t.cookie, "gk G");
	ok(
		await goi("okr.datNguonKr", { keyResultId: krG, loai: "api" }, t.cookie),
		"nguon api",
	);
	await congBo(g, t.cookie, "gk G");
	await datGioiHan(g, [b.id], t.cookie);
	return { ky, p1, t, a, b, m, g, krG, tieuDeG };
}

export type SanDuyet = {
	ky: string;
	b1: string;
	b2: string;
	p1: string;
	p2: string;
	p3: string;
	t: NguoiSan;
	h: NguoiSan;
	k: NguoiSan;
	m: NguoiSan;
	q: NguoiSan;
	o: NguoiSan;
};

export async function gieoDuyet(nhan: string): Promise<SanDuyet> {
	ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
	const b1 = await bpMoi(`${nhan}-b1`);
	const b2 = await bpMoi(`${nhan}-b2`);
	const p1 = await pbMoi(`${nhan}-p1`, b1);
	const p2 = await pbMoi(`${nhan}-p2`);
	const p3 = await pbMoi(`${nhan}-p3`, b2);
	const hTruong = await truongMoi("division", b1, `${nhan}-H`);
	const tTruong = await truongMoi("department", p1, `${nhan}-T`);
	const k = await nguoiCo(`${nhan}-K`);
	ok(await datViTri(k.id, p1), "xep K vao P1");
	const q = await nguoiCo(`${nhan}-Q`, "admin");
	const oId = await nguoiMoi(`${nhan}-O`, "okr");
	return {
		ky: await gieoKyQuy(KY_HIEN_THI),
		b1,
		b2,
		p1,
		p2,
		p3,
		t: { id: tTruong.nguoi, cookie: tTruong.cookie },
		h: { id: hTruong.nguoi, cookie: hTruong.cookie },
		k,
		m: await nguoiCo(`${nhan}-M`),
		q,
		o: { id: oId, cookie: await phienCua(oId) },
	};
}

export async function datDuyetCongBo(bat: boolean): Promise<void> {
	ok(await goi("okr.setProgram", { duyetCongBo: bat }), `duyet cong bo ${bat}`);
}

export async function mucTieuCoHaiKr(
	s: SanDuyet,
	unit: Json,
	ai: NguoiSan,
	nhan: string,
): Promise<{ id: string; kr: string[] }> {
	const id = await mucTieuMoi(s.ky, unit, ai.id, ai.cookie, nhan);
	return {
		id,
		kr: [
			await krMoi(id, ai.id, ai.cookie, `${nhan} 1`),
			await krMoi(id, ai.id, ai.cookie, `${nhan} 2`),
		],
	};
}
