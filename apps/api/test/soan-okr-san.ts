import { expect } from "bun:test";
import { db, Prisma } from "@crm/db";
import {
	type CuocSoan,
	type DonViCuocSoan,
	moCuoc,
} from "@crm/db/okr-cuoc-soan";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import type { KieuKr } from "@crm/validation/okr-kr";
import {
	type DongSoan,
	dongSoan,
	hangTuDongSoan,
} from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import { goi, goiRest, ok, type TraLoi, type Vao } from "./tro-ly-okr-san";

export const CHU_KY_Q4 = idMau("chu-ky", "quy4");
export const CHU_KY_NAM_KE = idMau("chu-ky", "nam-ke");
export const BP = (ma: string) => idMau("bp", ma);
export const PB = (ma: string) => idMau("pb", ma);

export type DonViSan = Omit<DonViCuocSoan, "cycleId">;

export const DON_VI = {
	onehub: { level: "onehub", divisionId: null, departmentId: null },
	kinhDoanh: {
		level: "bo-phan",
		divisionId: BP("kinh-doanh"),
		departmentId: null,
	},
	hoTro: { level: "bo-phan", divisionId: BP("ho-tro"), departmentId: null },
	kdBac: { level: "phong-ban", divisionId: null, departmentId: PB("kd-bac") },
	kdNam: { level: "phong-ban", divisionId: null, departmentId: PB("kd-nam") },
	taiChinh: {
		level: "phong-ban",
		divisionId: null,
		departmentId: PB("tai-chinh"),
	},
} as const satisfies Record<string, DonViSan>;

export type Duong = "trpc" | "rest";

export function vaoDonVi(dv: DonViSan, duong: Duong, cycleId = CHU_KY_Q4): Vao {
	const rong = duong === "rest" ? undefined : null;
	return {
		cycleId,
		level: dv.level,
		divisionId: dv.divisionId ?? rong,
		departmentId: dv.departmentId ?? rong,
	};
}

export const NAC_SOAN = {
	tat: {
		aiOn: true,
		aiSoanPhamVi: "tat",
		aiSoanDonVi: [],
		aiSoanAnPhamVi: "tat",
		aiSoanAnDonVi: [],
	},
	an: {
		aiOn: true,
		aiSoanPhamVi: "tat",
		aiSoanDonVi: [],
		aiSoanAnPhamVi: "toan-cong-ty",
		aiSoanAnDonVi: [],
	},
	bat: {
		aiOn: true,
		aiSoanPhamVi: "toan-cong-ty",
		aiSoanDonVi: [],
		aiSoanAnPhamVi: "tat",
		aiSoanAnDonVi: [],
	},
} as const satisfies Record<"tat" | "an" | "bat", OkrProgramSua>;

export async function datPhaQuy4(
	pha: "lap-ke-hoach" | "dang-chay",
): Promise<void> {
	await db.okrCycle.update({ where: { id: CHU_KY_Q4 }, data: { phase: pha } });
}

export async function datPhaNamKe(
	pha: "lap-ke-hoach" | "dang-chay",
): Promise<void> {
	await db.okrCycle.update({
		where: { id: CHU_KY_NAM_KE },
		data: { phase: pha },
	});
}

export async function donSoan(): Promise<void> {
	await db.okrDeXuat.deleteMany({ where: { cuocSoanId: { not: null } } });
	await db.okrCuocSoan.deleteMany({});
}

export async function xoaCuoc(id: string): Promise<void> {
	await db.okrDeXuat.deleteMany({ where: { cuocSoanId: id } });
	await db.okrCuocSoan.deleteMany({ where: { id } });
}

let demPhien = 0;
export const phienMoi = (nhan: string) => `phien-${nhan}-${++demPhien}`;

export async function gieoCuoc(v: {
	donVi: DonViSan;
	nguoiMo: string;
	nac?: CuocSoan["nac"];
	cycleId?: string;
	sessionId?: string;
}): Promise<CuocSoan> {
	return moCuoc(db, {
		cycleId: v.cycleId ?? CHU_KY_Q4,
		...v.donVi,
		nguoiMoUserId: idMau("nguoi", v.nguoiMo),
		sessionId: v.sessionId ?? phienMoi(v.nguoiMo),
		nac: v.nac ?? "bat",
	});
}

export type DongNhapGieo =
	| {
			loai: "muc-tieu-moi";
			khoa: string;
			ten: string;
			viSaoLucNay?: string;
			loaiMucTieu?: "cam-ket" | "tham-vong";
			canChinhId?: string | null;
			viSao?: string;
	  }
	| {
			loai: "kr-moi";
			khoa: string;
			chaKhoa: string;
			ten: string;
			kieu?: KieuKr;
			donVi?: string;
			khoiDiemGoiY?: number | null;
			viSao?: string;
	  }
	| {
			loai: "can-chinh-moi";
			khoa: string;
			chaKhoa: string;
			dichId: string;
			loaiDich: "muc-tieu" | "kr";
			viSao?: string;
	  };

const VI_SAO_MAU = "Dựa trên số kỳ trước và mục tiêu cấp trên.";

function dongTuGieo(cuoc: CuocSoan, d: DongNhapGieo): DongSoan {
	const goc = {
		khoa: d.khoa,
		viSao: d.viSao ?? VI_SAO_MAU,
		cuocSoanId: cuoc.id,
		dich: null,
	};
	if (d.loai === "muc-tieu-moi")
		return dongSoan.parse({
			...goc,
			loai: d.loai,
			ten: d.ten,
			viSaoLucNay: d.viSaoLucNay ?? "Kỳ trước còn trượt phần này.",
			loaiMucTieu: d.loaiMucTieu ?? "cam-ket",
			canChinhId: d.canChinhId ?? null,
		});
	if (d.loai === "kr-moi")
		return dongSoan.parse({
			...goc,
			loai: d.loai,
			chaKhoa: d.chaKhoa,
			ten: d.ten,
			kieu: d.kieu ?? "tang-toi",
			donVi: d.donVi ?? "hợp đồng",
			khoiDiemGoiY: d.khoiDiemGoiY ?? null,
		});
	return dongSoan.parse({
		...goc,
		loai: d.loai,
		chaKhoa: d.chaKhoa,
		targetObjectiveId: d.loaiDich === "muc-tieu" ? d.dichId : null,
		targetKeyResultId: d.loaiDich === "kr" ? d.dichId : null,
	});
}

export async function gieoDongNhap(
	cuoc: CuocSoan,
	dong: DongNhapGieo[],
	trangThai: "cho" | "nhan" | "sua" | "bac" | "bi-loai" = "cho",
	them: { maLoai?: string; giaTriCuoi?: string; inputHash?: string } = {},
): Promise<string[]> {
	const daQuyet = trangThai !== "cho" && trangThai !== "bi-loai";
	const ids: string[] = [];
	for (const d of dong) {
		const h = await db.okrDeXuat.create({
			data: {
				...hangTuDongSoan(dongTuGieo(cuoc, d), cuoc.sessionId),
				dich: Prisma.DbNull,
				inputHash: them.inputHash ?? `gieo:${cuoc.id}`,
				nguoiYeuCau: cuoc.nguoiMoUserId,
				nac: cuoc.nac,
				trangThai,
				maLoai: them.maLoai ?? null,
				giaTriCuoi: them.giaTriCuoi ?? null,
				nguoiQuyet: daQuyet ? cuoc.nguoiMoUserId : null,
				quyetLuc: daQuyet ? new Date() : null,
				hienLuc: null,
			},
			select: { id: true },
		});
		ids.push(h.id);
	}
	return ids;
}

export const REST_SOAN = {
	soanSanSang: ["GET", "/okr/soan/ready"],
	soanMo: ["POST", "/okr/soan/sessions"],
	soanDanhSachCuoc: ["GET", "/okr/soan/sessions"],
	soanDanhSach: ["GET", "/okr/soan/sessions/{cuocSoanId}/draft"],
	soanQuyet: ["POST", "/okr/soan/lines/{deXuatId}/decision"],
	soanDuaVao: ["POST", "/okr/soan/sessions/{cuocSoanId}/apply"],
	soanTangLuot: ["POST", "/okr/soan/sessions/{cuocSoanId}/turn"],
	soanAn: ["GET", "/okr/soan/sessions/{cuocSoanId}/admin"],
	soanSoDo: ["GET", "/okr/soan/metrics"],
} as const;

export async function goiSoan(
	app: NestExpressApplication,
	ten: keyof typeof REST_SOAN,
	duong: Duong,
	vao: Vao,
	cookie: string,
): Promise<TraLoi> {
	const [method, path] = REST_SOAN[ten];
	if (duong === "rest") return goiRest(app, method, path, vao, cookie);
	return goi(
		app,
		`okr.${ten}`,
		method === "GET" ? "query" : "mutation",
		vao,
		cookie,
	);
}

export async function trangThaiDongNhap(id: string): Promise<string> {
	return (
		await db.okrDeXuat.findUniqueOrThrow({
			where: { id },
			select: { trangThai: true },
		})
	).trangThai;
}

export function moDuoc<T extends { bat?: boolean; ok?: boolean }>(
	tra: TraLoi,
	nhan: string,
): T {
	const d = ok<T>(tra, nhan);
	expect(d.bat ?? d.ok, `${nhan}: ${JSON.stringify(d)}`).toBe(true);
	return d;
}
