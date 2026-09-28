import { db } from "@crm/db";
import { gieoKyQuy, gieoMucTieuCongBo } from "./okr-khep-san";
import {
	datViTri,
	goi,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	TIEN_TO,
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

export async function keHoachMoi(
	companyId: string,
	ownerId: string,
): Promise<string> {
	const r = await db.onboardingPlan.create({
		data: { companyId, startedAt: new Date(), targetDays: 30, ownerId },
		select: { id: true },
	});
	return r.id;
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
	const P = await keHoachMoi(x.congTy, phuTrach);
	return { C, P, congTyX: x.congTy, tenX: x.ten, tenPhuTrachC };
}

export type BangDem = "okrViecKr" | "okrTrail" | "okrBangChung" | "okrGhiNhan";

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
	}
}

export async function donSanCanhKr(): Promise<void> {
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
}
