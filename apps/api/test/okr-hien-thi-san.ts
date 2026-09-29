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
	boi: string,
): Promise<void> {
	await db.okrObjective.update({
		where: { id: objectiveId },
		data: {
			hienThi: "gioi-han",
			nguoiXem: {
				create: nguoiXem.map((userId) => ({ userId, createdById: boi })),
			},
		},
	});
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
	await datGioiHan(phongBanGioiHan, [nguoiXemCoTen.id], t.nguoi);

	const caNhanGioiHan = await mucTieuMoi(
		ky,
		{ level: "ca-nhan", personUserId: nguoiCaNhan.id },
		chu.id,
		nguoiCaNhan.cookie,
		"cn gh",
	);
	await krMoi(caNhanGioiHan, chu.id, nguoiCaNhan.cookie, "cn gh");
	await congBo(caNhanGioiHan, nguoiCaNhan.cookie, "cn gh");
	await datGioiHan(caNhanGioiHan, [], nguoiCaNhan.id);

	const onehubGioiHan = await mucTieuMoi(
		ky,
		{ level: "onehub" },
		chu.id,
		nguoi.quanTri.cookie,
		"oh gh",
	);
	await krMoi(onehubGioiHan, chu.id, nguoi.quanTri.cookie, "oh gh");
	await congBo(onehubGioiHan, nguoi.quanTri.cookie, "oh gh");
	await datGioiHan(onehubGioiHan, [], nguoi.quanTri.id);

	const boPhanGioiHan = await mucTieuMoi(
		ky,
		{ level: "bo-phan", divisionId: b1 },
		chu.id,
		h.cookie,
		"bp gh",
	);
	await krMoi(boPhanGioiHan, chu.id, h.cookie, "bp gh");
	await congBo(boPhanGioiHan, h.cookie, "bp gh");
	await datGioiHan(boPhanGioiHan, [], h.nguoi);

	const nhapGioiHan = await mucTieuMoi(
		ky,
		{ level: "phong-ban", departmentId: p2 },
		chu.id,
		n.cookie,
		"nhap gh",
	);
	await datGioiHan(nhapGioiHan, [nguoiXemCoTen.id], n.nguoi);

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
	ok(
		await goi("org.restoreDepartment", { id: pbDuoiBpLuu }),
		"khoi phuc phong ban duoi bo phan luu tru",
	);
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
