import { API_KEY_HEADER, auth, type WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { OKR_HOI_Y, type SoLieuHoiY } from "@crm/validation/okr-hoi-y";
import request from "supertest";
import { DONG_HO_HOI_Y, type DongHo } from "../src/okr/dong-ho";
import { OKR } from "../src/okr/okr-config";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import {
	dungSan,
	goi,
	type Json,
	nguoiMoi,
	ok,
	phienCua,
	type TraLoi,
	taoNam,
	ungDung,
} from "./okr-san";

const GIO_MS = OKR.thoiGian.gioMs;

let gio: Date | null = null;

export function datDongHo(d: Date): void {
	gio = d;
}

export const dongHo: DongHo = () => new Date((gio ?? new Date()).getTime());

export function sauGio(tu: Date, soGio: number): Date {
	return new Date(tu.getTime() + soGio * GIO_MS);
}

export function dungSanHoiY(): void {
	dungSan((b) => b.overrideProvider(DONG_HO_HOI_Y).useValue(dongHo), {
		rest: true,
	});
}

export type Nguoi = { id: string; cookie: string };
export type NguoiHoiY = {
	Q: Nguoi;
	P: Nguoi;
	T: Nguoi;
	O: Nguoi;
	A: Nguoi;
	B: Nguoi;
	R: Nguoi;
};

export async function nguoiCo(ten: string, vai: WorkspaceRole): Promise<Nguoi> {
	const id = await nguoiMoi(ten, vai);
	return { id, cookie: await phienCua(id) };
}

export const CAU_HOI_MAC_DINH =
	"Năm tới OneHub nên dồn sức vào điều gì để khách hàng quay lại nhiều hơn?";
export const LOI_MO_MAC_DINH =
	"Năm nay mình giữ được khách cũ nhưng khách mới chậm. Mỗi người góp tối đa ba ý.";
export const SO_LIEU_MAC_DINH: SoLieuHoiY = [
	{ nhan: "Doanh thu năm", giaTri: "182 tỷ", ghiChu: "tăng 12% so với 2025" },
	{ nhan: "Khách quay lại", giaTri: "64%", ghiChu: "" },
	{ nhan: "Khách mới", giaTri: "41", ghiChu: "thấp nhất ba năm" },
];
export const BAN_TRUOC_MAC_DINH = [
	"Đưa giao lạnh thành dịch vụ có lãi",
	"Mở thêm hai kho ở miền Trung",
	"Giảm thời gian giao chặng cuối",
	"Giữ tỉ lệ khách quay lại trên bảy mươi phần trăm",
];

export type GieoHoiY = {
	hanGio?: number;
	niemPhong?: boolean;
	yCua?: ("T" | "O" | "A" | "B" | "R")[];
};

export async function gieoHoiY(opts: GieoHoiY = {}): Promise<{
	ky: string;
	h: string;
	nguoi: NguoiHoiY;
}> {
	const nguoi: NguoiHoiY = {
		Q: await nguoiCo("hoi-y-Q", "admin"),
		P: await nguoiCo("hoi-y-P", "admin"),
		T: await nguoiCo("hoi-y-T", "member"),
		O: await nguoiCo("hoi-y-O", "okr"),
		A: await nguoiCo("hoi-y-A", "member"),
		B: await nguoiCo("hoi-y-B", "member"),
		R: await nguoiCo("hoi-y-R", "member"),
	};
	const ky = await taoNam("hoi-y", dongHo().getUTCFullYear() + 1);
	const h = ok<{ id: string }>(
		await goi(
			"okr.moHoiY",
			{
				cycleId: ky,
				cauHoi: CAU_HOI_MAC_DINH,
				loiMo: LOI_MO_MAC_DINH,
				soLieu: SO_LIEU_MAC_DINH,
				hanLuc: sauGio(
					dongHo(),
					opts.hanGio ?? OKR_HOI_Y.hanGio.min * 2,
				).toISOString(),
				nguoiChonUserId: nguoi.P.id,
			},
			nguoi.Q.cookie,
		),
		"gieo hoi y",
	).id;
	for (const ai of opts.yCua ?? []) await gieoY(h, nguoi[ai].id);
	if (opts.niemPhong) await gieoBanTruoc(h, nguoi.P.id);
	return { ky, h, nguoi };
}

export const Y_MAC_DINH = "Mở tuyến giao lạnh cho khách dược";

export async function gieoY(
	hoiYId: string,
	tacGiaUserId: string,
	noiDung: string = Y_MAC_DINH,
) {
	const { id } = ok<{ id: string }>(
		await goi(
			"okr.gopY",
			{ hoiYId, noiDung, viSao: "", doBangGi: "" },
			await phienCua(tacGiaUserId),
		),
		"gieo y",
	);
	return db.okrY.findUniqueOrThrow({ where: { id } });
}

export async function khoaApiCua(userId: string): Promise<string> {
	return (
		await auth.api.createApiKey({ body: { name: `hoi-y-${userId}`, userId } })
	).key;
}

export async function goiRest(
	duong: string,
	dau: { cookie: string } | { khoa: string },
): Promise<TraLoi> {
	const req = request(ungDung().getHttpServer()).get(
		`${REST_BRIDGE_PATH}${duong}`,
	);
	const res = await ("cookie" in dau
		? req.set("cookie", dau.cookie)
		: req.set(API_KEY_HEADER, dau.khoa));
	const body: Json = res.body ?? null;
	return {
		status: res.status,
		data: res.status === 200 ? body : null,
		loi: String(res.body?.message ?? ""),
	};
}

export async function gieoBanTruoc(hoiYId: string, vietBoiUserId: string) {
	ok(
		await goi(
			"okr.niemPhong",
			{ hoiYId, cau: BAN_TRUOC_MAC_DINH },
			await phienCua(vietBoiUserId),
		),
		"gieo ban truoc",
	);
	return db.okrHoiYBanTruoc.findUniqueOrThrow({ where: { hoiYId } });
}

export async function gieoCongBo(hoiYId: string) {
	return db.okrHoiY.update({
		where: { id: hoiYId },
		data: { congBoLuc: dongHo() },
	});
}

async function memberCua(userId: string): Promise<string> {
	return (
		await db.member.findFirstOrThrow({
			where: { userId, organizationId: WORKSPACE_ID },
			select: { id: true },
		})
	).id;
}

export async function doiVai(userId: string, role: WorkspaceRole) {
	ok(
		await goi("workspace.setMemberRole", {
			memberId: await memberCua(userId),
			role,
		}),
		`doi vai ${role}`,
	);
}

export async function roiDi(userId: string) {
	ok(
		await goi("workspace.removeMember", { memberId: await memberCua(userId) }),
		"roi di",
	);
}

export type Bang =
	| "okrHoiY"
	| "okrHoiYBanTruoc"
	| "okrY"
	| "okrYDongY"
	| "okrChuDe"
	| "okrHoiYHieu"
	| "okrTrail"
	| "okrObjective";

const DEM = {
	okrHoiY: () => db.okrHoiY.count(),
	okrHoiYBanTruoc: () => db.okrHoiYBanTruoc.count(),
	okrY: () => db.okrY.count(),
	okrYDongY: () => db.okrYDongY.count(),
	okrChuDe: () => db.okrChuDe.count(),
	okrHoiYHieu: () => db.okrHoiYHieu.count(),
	okrTrail: () => db.okrTrail.count(),
	okrObjective: () => db.okrObjective.count(),
} satisfies { [B in Bang]: () => Promise<number> };

export function dem(bang: Bang): Promise<number> {
	return DEM[bang]();
}
