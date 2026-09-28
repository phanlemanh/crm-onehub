import { db } from "@crm/db";
import { gieoKyQuy, gieoMucTieuCongBo } from "./okr-khep-san";
import {
	datViTri,
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
}
