import { db } from "@crm/db";
import { dieuKienXemMucTieu, nguCanhXemOkr } from "@crm/db/okr-hien-thi";
import {
	dungGoiTomTat,
	type GoiTomTat,
	ghiTomTat,
	type NguonGoi,
} from "@crm/db/okr-tom-tat";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import { dauTuanVN, ngayVN } from "@crm/db/onboarding-nhac";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import type { CauTomTat } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { idMau } from "../scripts/okr-mau/nap";
import { congTy } from "./okr-mau-san";
import {
	goi,
	goiRest,
	MOC_MAU,
	nguoi,
	ok,
	phienMau,
	TIEN_TO_TLO,
	type TraLoi,
	type Vao,
} from "./tro-ly-okr-san";

export const KY = idMau("chu-ky", "quy4");
export const KY_KHAC = idMau("chu-ky", "quy3");
export const LUC = new Date(MOC_MAU.getTime() + 60 * MINUTE_MS);
export const TUAN = dauTuanVN(MOC_MAU);
export const SAU = (ms: number) => new Date(LUC.getTime() + ms);
export const pb = (ma: string) => idMau("pb", ma);

export const PHONG_UNG_VIEN = [
	"kd-bac",
	"kd-nam",
	"cham-soc",
	"marketing",
	"kho-van",
	"dieu-phoi",
] as const;

export const THU_TUC = {
	doc: {
		trpc: "okr.troLyTomTat",
		loai: "query",
		method: "GET",
		rest: "/okr/weekly-summary",
	},
	phanHoi: {
		trpc: "okr.troLyTomTatPhanHoi",
		loai: "mutation",
		method: "POST",
		rest: "/okr/weekly-summary/{tomTatId}/feedback",
	},
	quanTri: {
		trpc: "okr.troLyTomTatQuanTri",
		loai: "query",
		method: "GET",
		rest: "/okr/weekly-summary/admin",
	},
} as const;

export type Duong = "trpc" | "rest";
export const HAI_DUONG: readonly Duong[] = ["trpc", "rest"];

export function goiQua(
	app: NestExpressApplication,
	thuTuc: keyof typeof THU_TUC,
	duong: Duong,
	vao: Vao,
	cookie: string,
): Promise<TraLoi> {
	const t = THU_TUC[thuTuc];
	return duong === "trpc"
		? goi(app, t.trpc, t.loai, vao, cookie)
		: goiRest(app, t.method, t.rest, vao, cookie);
}

export type NguonTra = {
	id: string;
	keyResultId: string;
	ngay: string;
	giaTri: number;
	tuTin: string;
	ghiChu: string;
};
export type BanTra = {
	id: string;
	tuan: string;
	soLanCapNhat: number;
	cau: { vanBan: string; nguon: NguonTra[] }[];
	phanHoiCuaToi: boolean | null;
};
export type DocTra = {
	ban: BanTra | null;
	dangSoan: boolean;
	chuaCapNhat: boolean;
};

export async function docTomTat(
	app: NestExpressApplication,
	duong: Duong,
	cookie: string,
	vao: { cycleId: string; departmentId: string },
	nhan: string,
): Promise<DocTra> {
	return ok<DocTra>(await goiQua(app, "doc", duong, vao, cookie), nhan);
}

const bo = congTy();

const cookieDaCo = new Map<string, string>();

const TRUONG_DON_VI = new Set([
	...bo.boPhan.map((b) => b.truong),
	...bo.phongBan.map((p) => p.truong),
]);

export const QUAN_TRI =
	bo.nguoi.find((n) => n.vai === "admin")?.ma ?? "khong-co-quan-tri";

export function truongCua(maPhong: string): string {
	const truong = bo.phongBan.find((p) => p.ma === maPhong)?.truong;
	if (!truong) throw new Error(`phong ${maPhong} khong co truong`);
	return truong;
}

export function thanhVienCua(maPhong: string): string[] {
	return bo.nguoi
		.filter(
			(n) =>
				n.phongBan === maPhong &&
				n.vai === "member" &&
				!TRUONG_DON_VI.has(n.ma),
		)
		.map((n) => n.ma);
}

export function nguoiNgoai(
	loaiTru: readonly string[],
	vai: "member" | "okr",
): string {
	const n = bo.nguoi.find(
		(x) =>
			x.vai === vai &&
			!loaiTru.includes(x.phongBan) &&
			!TRUONG_DON_VI.has(x.ma),
	);
	if (!n) throw new Error(`khong co nguoi ${vai} ngoai ${loaiTru.join(",")}`);
	return n.ma;
}

export async function viecGieo(v: {
	ma: string;
	departmentId: string;
	cycleId?: string;
	trangThai: "cho" | "chay" | "xong";
	nac?: "an" | "bat";
	outcome?: string;
}): Promise<string> {
	const hang = await db.agentTask.create({
		data: {
			kind: "okr-tom-tat-tuan",
			reason: "okr-tom-tat-tuan",
			subject: `${TIEN_TO_TLO}tts-${v.ma}`,
			budget: 0,
			dueAt: LUC,
			createdAt: LUC,
			attempts: v.trangThai === "cho" ? 0 : 1,
			startedAt: v.trangThai === "cho" ? null : LUC,
			leasedUntil: v.trangThai === "chay" ? SAU(30 * MINUTE_MS) : null,
			finishedAt: v.trangThai === "xong" ? LUC : null,
			outcome: v.trangThai === "xong" ? (v.outcome ?? "da-nop") : null,
			payload: {
				viec: "tom-tat-tuan",
				departmentId: v.departmentId,
				cycleId: v.cycleId ?? KY,
				tuan: TUAN,
				inputHash: `hash-${v.ma}`,
				nac: v.nac ?? "bat",
			},
		},
		select: { id: true },
	});
	return hang.id;
}

export async function ghiBan(v: {
	ma: string;
	departmentId: string;
	nac: "an" | "bat";
	cau: CauTomTat[];
}) {
	const taskId = await viecGieo({
		ma: v.ma,
		departmentId: v.departmentId,
		trangThai: "xong",
		nac: v.nac,
	});
	return ghiTomTat(
		db,
		{
			taskId,
			cycleId: KY,
			departmentId: v.departmentId,
			tuan: TUAN,
			moc: LUC,
			inputHash: `hash-${v.ma}`,
			nac: v.nac,
			cau: v.cau,
		},
		LUAT_TOM_TAT,
	);
}

export const goiCua = (departmentId: string, moc = LUC) =>
	dungGoiTomTat(
		db,
		{ cycleId: KY, departmentId, tuan: TUAN, moc },
		LUAT_TOM_TAT,
	);

export function motNguonMoiKr(goi: GoiTomTat): NguonGoi[] {
	const thay = new Set<string>();
	return goi.nguon.filter((n) => {
		if (thay.has(n.keyResultId)) return false;
		thay.add(n.keyResultId);
		return true;
	});
}

export function mucTieuCuaNguon(goi: GoiTomTat, n: NguonGoi): string {
	return goi.krs.find((k) => k.id === n.keyResultId)?.mucTieuId ?? "";
}

export function soThamChieu(goi: GoiTomTat, n: NguonGoi): number[] {
	const kr = goi.krs.find((k) => k.id === n.keyResultId);
	return [
		n.truoc,
		n.chenhLech === null ? null : Math.abs(n.chenhLech),
		n.tienDo,
		kr?.khoiDiem,
		kr?.dich,
	].flatMap((x) => (x === null || x === undefined ? [] : [x]));
}

export const vietSo = (n: number) => String(n).replace(".", ",");

export const CAU_LANH = [
	"Phòng giữ nhịp cập nhật đều đặn.",
	"Có ghi chú mới trong tuần.",
	"Phòng có thêm cập nhật trong tuần.",
	"Nhóm mục tiêu này có diễn biến mới.",
	"Tuần này phòng ghi nhận đủ các lần cập nhật.",
] as const;

export function cauLanh(i: number, nguonId: string): CauTomTat {
	const vanBan = CAU_LANH[i % CAU_LANH.length] ?? CAU_LANH[0];
	return { vanBan, nguon: [nguonId] };
}

export async function phongCoNguon(
	toiThieu: number,
	loaiTru: readonly string[] = [],
): Promise<{ ma: string; goi: GoiTomTat }[]> {
	const ra: { ma: string; goi: GoiTomTat }[] = [];
	for (const ma of PHONG_UNG_VIEN) {
		if (loaiTru.includes(ma)) continue;
		const g = await goiCua(pb(ma));
		if (g && motNguonMoiKr(g).length >= toiThieu) ra.push({ ma, goi: g });
	}
	return ra;
}

export type LanKho = {
	keyResultId: string;
	ngay: string;
	giaTri: number;
	tuTin: string;
	ghiChu: string;
};

export async function lanTrongKho(
	ids: readonly string[],
): Promise<Map<string, LanKho>> {
	const hang = await db.okrCheckIn.findMany({
		where: { id: { in: [...ids] } },
		select: {
			id: true,
			keyResultId: true,
			value: true,
			confidence: true,
			note: true,
			createdAt: true,
			session: { select: { submittedAt: true } },
		},
	});
	return new Map(
		hang.map((h) => [
			h.id,
			{
				keyResultId: h.keyResultId,
				ngay: ngayVN(h.session.submittedAt ?? h.createdAt),
				giaTri: h.value.toNumber(),
				tuTin: h.confidence,
				ghiChu: h.note,
			},
		]),
	);
}

export async function xemDuocMucTieu(
	userId: string,
	objectiveId: string,
): Promise<boolean> {
	const nc = (await nguCanhXemOkr(db, [userId])).get(userId);
	if (!nc) return false;
	return (
		(await db.okrObjective.count({
			where: { AND: [{ id: objectiveId }, dieuKienXemMucTieu(nc)] },
		})) > 0
	);
}

export async function donTomTat(): Promise<void> {
	cookieDaCo.clear();
	const ban = await db.okrTomTat.findMany({ select: { id: true } });
	await db.okrTomTatPhanHoi.deleteMany({
		where: {
			OR: [
				{ tomTatId: { in: ban.map((b) => b.id) } },
				{ userId: { startsWith: OKR_MAU.tienTo } },
			],
		},
	});
	await db.agentTask.deleteMany({
		where: { kind: { in: ["okr-tom-tat-tuan", "okr-tom-tat-xep"] } },
	});
	await db.notificationPreference.deleteMany({
		where: { userId: { startsWith: OKR_MAU.tienTo } },
	});
}

const maTheoId = new Map(bo.nguoi.map((n) => [nguoi(n.ma), n.ma]));

export function maCua(userId: string): string {
	const ma = maTheoId.get(userId);
	if (!ma) throw new Error(`khong phai nguoi mau: ${userId}`);
	return ma;
}

export async function cookieCua(ma: string): Promise<string> {
	const co = cookieDaCo.get(ma);
	if (co) return co;
	const moi = await phienMau(ma);
	cookieDaCo.set(ma, moi);
	return moi;
}

async function nguoiSuaNguon(dv: {
	level: string;
	personUserId: string | null;
	departmentId: string | null;
	divisionId: string | null;
}): Promise<string> {
	if (dv.level === "onehub") return QUAN_TRI;
	if (dv.level === "ca-nhan" && dv.personUserId) return maCua(dv.personUserId);
	const truong =
		dv.level === "phong-ban" && dv.departmentId
			? await db.department.findUnique({
					where: { id: dv.departmentId },
					select: { headUserId: true },
				})
			: dv.level === "bo-phan" && dv.divisionId
				? await db.division.findUnique({
						where: { id: dv.divisionId },
						select: { headUserId: true },
					})
				: null;
	if (!truong?.headUserId)
		throw new Error(`khong co nguoi sua don vi ${JSON.stringify(dv)}`);
	return maCua(truong.headUserId);
}

export async function datGioiHan(
	app: NestExpressApplication,
	objectiveId: string,
	truongMa: string,
): Promise<void> {
	const canChinh = await db.okrAlignment.findMany({
		where: {
			OR: [
				{ objectiveId },
				{ targetObjectiveId: objectiveId },
				{ targetKeyResult: { objectiveId } },
			],
		},
		select: {
			id: true,
			objective: {
				select: {
					level: true,
					personUserId: true,
					departmentId: true,
					divisionId: true,
				},
			},
		},
	});
	for (const a of canChinh) {
		const ma = await nguoiSuaNguon(a.objective);
		ok(
			await goi(
				app,
				"okr.removeAlignment",
				"mutation",
				{ id: a.id },
				await cookieCua(ma),
			),
			`go can chinh ${a.id}`,
		);
	}
	ok(
		await goi(
			app,
			"okr.datHienThi",
			"mutation",
			{ objectiveId, hienThi: "gioi-han", nguoiXem: [] },
			await cookieCua(truongMa),
		),
		"dat gioi han",
	);
}

export async function nguoiThayMucTieu(
	objectiveId: string,
): Promise<Set<string>> {
	const mt = await db.okrObjective.findUniqueOrThrow({
		where: { id: objectiveId },
		select: {
			ownerUserId: true,
			personUserId: true,
			participants: { select: { userId: true } },
			nguoiXem: { select: { userId: true } },
			keyResults: {
				select: {
					ownerUserId: true,
					viecKr: { select: { nguoiLamUserId: true } },
				},
			},
		},
	});
	return new Set(
		[
			mt.ownerUserId,
			mt.personUserId,
			...mt.participants.map((p) => p.userId),
			...mt.nguoiXem.map((p) => p.userId),
			...mt.keyResults.flatMap((k) => [
				k.ownerUserId,
				...k.viecKr.map((v) => v.nguoiLamUserId),
			]),
		].flatMap((x) => (x ? [x] : [])),
	);
}
