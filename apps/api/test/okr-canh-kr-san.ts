import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { gieoKyQuy, gieoMucTieuCongBo } from "./okr-khep-san";
import {
	type AiHoacCookie,
	datViTri,
	goi,
	type Json,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	TIEN_TO,
	type TraLoi,
	truongMoi,
} from "./okr-san";

export const KY_CANH = { tu: "2026-10-01", den: "2026-12-31" } as const;

export type NguoiCanh = { id: string; cookie: string };
export type TenNguoiCanh = "A" | "T" | "B" | "M" | "O";

export type SanCanhKr = {
	ky: string;
	mt: string;
	kr: string;
	krMoc: string;
	p1: string;
	nguoi: Record<TenNguoiCanh, NguoiCanh>;
};

async function nguoiCo(
	ten: string,
	vai: "member" | "okr" = "member",
): Promise<NguoiCanh> {
	const id = await nguoiMoi(ten, vai);
	return { id, cookie: await phienCua(id) };
}

export async function gieoCanhKr(): Promise<SanCanhKr> {
	const p1 = await pbMoi("canh-p1");
	const p2 = await pbMoi("canh-p2");
	const truong = await truongMoi("department", p1, "canh-T");
	const T = { id: truong.nguoi, cookie: truong.cookie };
	const A = await nguoiCo("canh-A");
	const B = await nguoiCo("canh-B");
	const M = await nguoiCo("canh-M");
	const O = await nguoiCo("canh-O", "okr");
	ok(await datViTri(M.id, p2), "xep M vao P2");
	const ky = await gieoKyQuy(KY_CANH);
	const { objectiveId, krIds } = await gieoMucTieuCongBo(
		ky,
		[
			{ ownerUserId: A.id },
			{ kind: "moc", startValue: 0, targetValue: 1, ownerUserId: A.id },
		],
		{
			unit: { level: "phong-ban", departmentId: p1 },
			ownerUserId: T.id,
			ai: T.cookie,
		},
	);
	const [kr, krMoc] = krIds;
	if (kr === undefined || krMoc === undefined)
		throw new Error("gieoCanhKr: thieu KR");
	return {
		ky,
		mt: objectiveId,
		kr,
		krMoc,
		p1,
		nguoi: { A, T, B, M, O },
	};
}

export async function nguoiDaRoi(ten: string): Promise<string> {
	const id = await nguoiMoi(ten);
	const thanhVien = await db.member.findFirstOrThrow({
		where: { userId: id },
		select: { id: true },
	});
	ok(
		await goi("workspace.removeMember", { memberId: thanhVien.id }),
		`go thanh vien ${ten}`,
	);
	return id;
}

export async function mucTieuNhap(
	san: SanCanhKr,
): Promise<{ mt: string; kr: string }> {
	const { T } = san.nguoi;
	const mt = idTra(
		await goi(
			"okr.createObjective",
			{
				cycleId: san.ky,
				unit: { level: "phong-ban", departmentId: san.p1 },
				title: ma("canh muc tieu nhap"),
				kind: "cam-ket",
				ownerUserId: T.id,
				participantIds: [],
				whyNow: "",
			},
			T.cookie,
		),
		"tao muc tieu nhap",
	);
	const kr = idTra(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId: mt,
				title: ma("canh kr nhap"),
				kind: "tang-toi",
				ownerUserId: T.id,
				startValue: 0,
				targetValue: 100,
				currentValue: 0,
				unit: "",
				dueOn: null,
				weight: 1,
			},
			T.cookie,
		),
		"tao kr nhap",
	);
	return { mt, kr };
}

export const TEN_C = "Gọi lại quý 4";
export const TEN_C_MOI = "Gọi lại Q4";

export type SanSangKien = {
	C: string;
	P: string;
	congTyX: string;
	tenX: string;
	tenPhuTrachC: string;
};

const idTra = (tra: Parameters<typeof ok>[0], nhan: string) =>
	ok<{ id: string }>(tra, nhan).id;

export async function chienDichMoi(
	ten: string,
	ai: NguoiCanh,
	ownerId: string | null = null,
): Promise<string> {
	const view = idTra(
		await goi(
			"savedViews.create",
			{
				entity: "CONTACT",
				name: ma("canh-goc-nhin"),
				shared: false,
				filters: { q: "", sort: "", dir: "asc", archived: false, filters: {} },
			},
			ai.cookie,
		),
		"tao goc nhin",
	);
	return idTra(
		await goi(
			"campaigns.create",
			{ name: ten, savedViewId: view, ownerId },
			ai.cookie,
		),
		`tao chien dich ${ten}`,
	);
}

export async function congTyMoi(
	ten: string,
	ai: NguoiCanh,
): Promise<{ congTy: string; ten: string }> {
	const tenDu = ma(ten);
	const congTy = idTra(
		await goi("companies.create", { name: tenDu }, ai.cookie),
		`tao cong ty ${ten}`,
	);
	return { congTy, ten: tenDu };
}

const khuonCua = new Map<string, string>();

async function khuonKeHoach(san: SanCanhKr): Promise<string> {
	const co = khuonCua.get(san.p1);
	if (co !== undefined) return co;
	const id = idTra(
		await goi("onboarding.createTemplate", {
			name: ma("canh-khuon"),
			partnerType: null,
			steps: [
				{ label: "Gọi chào", departmentId: san.p1, position: 0, offsetDays: 0 },
			],
		}),
		"tao khuon ke hoach",
	);
	khuonCua.set(san.p1, id);
	return id;
}

export async function keHoachMoi(
	san: SanCanhKr,
	companyId: string,
	ownerId: string,
): Promise<string> {
	return idTra(
		await goi(
			"onboarding.createFromTemplate",
			{
				companyId,
				templateId: await khuonKeHoach(san),
				startedAt: ngayVN(new Date()),
				ownerId,
			},
			san.nguoi.A.cookie,
		),
		"tao ke hoach",
	);
}

export async function gieoSangKien(san: SanCanhKr): Promise<SanSangKien> {
	const { A } = san.nguoi;
	const phuTrach = await nguoiMoi("canh-phu-trach-C");
	const tenPhuTrachC = `Phụ trách ${phuTrach}`;
	await db.user.update({
		where: { id: phuTrach },
		data: { name: tenPhuTrachC },
	});
	const C = await chienDichMoi(TEN_C, A, phuTrach);
	ok(await goi("campaigns.start", { id: C }, A.cookie), "chay chien dich C");
	const x = await congTyMoi("cong-ty-X", A);
	const P = await keHoachMoi(san, x.congTy, phuTrach);
	return { C, P, congTyX: x.congTy, tenX: x.ten, tenPhuTrachC };
}

export type BangDem =
	| "okrViecKr"
	| "okrTrail"
	| "okrBangChung"
	| "okrGhiNhan"
	| "okrGhiNhanNhan"
	| "okrObjective"
	| "okrKeyResult"
	| "okrMucTieuTuMau"
	| "okrMau";

const cuaSan = { cycle: { name: { startsWith: TIEN_TO } } };

export async function dem(bang: BangDem): Promise<number> {
	switch (bang) {
		case "okrViecKr":
			return db.okrViecKr.count({
				where: { keyResult: { objective: cuaSan } },
			});
		case "okrTrail":
			return db.okrTrail.count({
				where: { actorUserId: { startsWith: TIEN_TO } },
			});
		case "okrBangChung":
			return db.okrBangChung.count({
				where: { keyResult: { objective: cuaSan } },
			});
		case "okrGhiNhan":
			return db.okrGhiNhan.count({ where: { objective: cuaSan } });
		case "okrGhiNhanNhan":
			return db.okrGhiNhanNhan.count({
				where: { ghiNhan: { objective: cuaSan } },
			});
		case "okrObjective":
			return db.okrObjective.count({ where: cuaSan });
		case "okrKeyResult":
			return db.okrKeyResult.count({ where: { objective: cuaSan } });
		case "okrMucTieuTuMau":
			return db.okrMucTieuTuMau.count({ where: { objective: cuaSan } });
		case "okrMau":
			return db.okrMau.count({
				where: { taoBoiUserId: { startsWith: TIEN_TO } },
			});
	}
}

export type SanTuMau = {
	ky: string;
	p1: string;
	p2: string;
	T1: NguoiCanh;
	T2: NguoiCanh;
	A: NguoiCanh;
	O: NguoiCanh;
};

export async function gieoTuMau(): Promise<SanTuMau> {
	const p1 = await pbMoi("mau-p1");
	const p2 = await pbMoi("mau-p2");
	const t1 = await truongMoi("department", p1, "mau-T1");
	const t2 = await truongMoi("department", p2, "mau-T2");
	const A = await nguoiCo("mau-A");
	const O = await nguoiCo("mau-O", "okr");
	const ky = await gieoKyQuy(KY_CANH);
	return {
		ky,
		p1,
		p2,
		T1: { id: t1.nguoi, cookie: t1.cookie },
		T2: { id: t2.nguoi, cookie: t2.cookie },
		A,
		O,
	};
}

export const luuMau = (vao: Json, ai: AiHoacCookie = "quan"): Promise<TraLoi> =>
	goi("okr.luuMau", vao, ai);

export async function mauMoi(vao: {
	ten: string;
	cap: string;
	donViIds: string[];
	noiDung: Json;
}): Promise<string> {
	return idTra(
		await luuMau({ id: null, ...vao, ten: ma(vao.ten) }),
		`luu mau ${vao.ten}`,
	);
}

export async function donSanCanhKr(): Promise<void> {
	await db.okrMucTieuTuMau.deleteMany({
		where: {
			OR: [
				{ objective: cuaSan },
				{ mau: { taoBoiUserId: { startsWith: TIEN_TO } } },
			],
		},
	});
	await db.okrMau.deleteMany({
		where: { taoBoiUserId: { startsWith: TIEN_TO } },
	});
	await db.okrGhiNhanNhan.deleteMany({
		where: { ghiNhan: { objective: cuaSan } },
	});
	await db.okrGhiNhan.deleteMany({ where: { objective: cuaSan } });
	await db.okrBangChung.deleteMany({
		where: { keyResult: { objective: cuaSan } },
	});
	await db.okrViecKr.deleteMany({
		where: { keyResult: { objective: cuaSan } },
	});
	await db.campaign.deleteMany({
		where: { createdById: { startsWith: TIEN_TO } },
	});
	await db.savedView.deleteMany({
		where: { ownerId: { startsWith: TIEN_TO } },
	});
	await db.onboardingPlan.deleteMany({
		where: { template: { name: { startsWith: TIEN_TO } } },
	});
	await db.onboardingTemplate.deleteMany({
		where: { name: { startsWith: TIEN_TO } },
	});
}
