import { createHash } from "node:crypto";
import { db, type Prisma } from "@crm/db";
import { PRIORITY } from "@crm/db/agent-tasks";
import { lockIdempotencyKey } from "@crm/db/idempotency";
import { KY_CON_HIEN } from "@crm/db/okr-chu-ky-hien";
import { dungGoiTomTat, trangThaiTuan } from "@crm/db/okr-tom-tat";
import {
	cauHinhAiLuc,
	LY_DO_VIEC_OKR,
	troLyOkrSanSang,
} from "@crm/db/okr-tro-ly";
import {
	type CauHinhAi,
	type DonViMucTieu,
	GIO_MS,
	MINUTE_MS,
	NGAY_MS,
	nacCuaDonVi,
	nacCuaViec,
	OKR_TOM_TAT,
} from "@crm/db/okr-tro-ly-danh-muc";
import {
	dauNgayVN,
	dauTuanVN,
	ngayVN,
	thuTrongTuan,
} from "@crm/db/onboarding-nhac";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { LUAT_TOM_TAT } from "@crm/validation/okr-kiem-tom-tat";
import type { LeasedTask } from "../tasks";

const LOAI_XEP = "okr-tom-tat-xep" as const;
const LOAI_TOM_TAT = "okr-tom-tat-tuan" as const;
const PHA_CHAY = "dang-chay" satisfies PhaChuKy;

type Tx = Prisma.TransactionClient;

function gioXepCua(luc: Date): Date {
	return new Date(
		dauNgayVN(luc).getTime() +
			OKR_TOM_TAT.gioXep.gio * GIO_MS +
			OKR_TOM_TAT.gioXep.phut * MINUTE_MS,
	);
}

function ngayKe(luc: Date): Date {
	return dauNgayVN(new Date(dauNgayVN(luc).getTime() + NGAY_MS));
}

function homQuaCua(luc: Date): Date {
	return new Date(dauNgayVN(luc).getTime() - 1);
}

const tenViecXep = (dueAt: Date) => `${LOAI_XEP}:${ngayVN(dueAt)}`;

function lichTomTatBat(ct: CauHinhAi): boolean {
	const nac = nacCuaViec(ct, "tom-tat-tuan");
	return nac === "bat" || nac === "an";
}

async function ghiViecXep(tx: Tx, dueAt: Date, now: Date): Promise<boolean> {
	const subject = tenViecXep(dueAt);
	await lockIdempotencyKey(tx, subject);
	if ((await tx.agentTask.count({ where: { kind: LOAI_XEP, subject } })) > 0)
		return false;
	await tx.agentTask.create({
		data: {
			kind: LOAI_XEP,
			reason: LY_DO_VIEC_OKR[LOAI_XEP],
			priority: PRIORITY.okrNen,
			budget: 0,
			subject,
			dueAt,
			createdAt: now,
		},
	});
	return true;
}

async function daCoBan(
	tx: Tx,
	v: { cycleId: string; departmentId: string; tuan: string },
): Promise<boolean> {
	return (
		(await tx.okrTomTat.count({
			where: {
				cycleId: v.cycleId,
				departmentId: v.departmentId,
				tuan: new Date(`${v.tuan}T00:00:00.000Z`),
			},
		})) > 0
	);
}

function bamDauVao(
	v: { cycleId: string; departmentId: string; tuan: string },
	lanDan: readonly string[],
): string {
	return createHash("sha256")
		.update(
			[v.cycleId, v.departmentId, v.tuan, ...[...lanDan].sort()].join("|"),
		)
		.digest("hex");
}

async function xepTrongNgay(
	tx: Tx,
	task: Pick<LeasedTask, "id" | "dueAt">,
	now: Date,
): Promise<string> {
	await lockIdempotencyKey(tx, tenViecXep(task.dueAt));
	const ct = await cauHinhAiLuc(tx, now);
	const dong = async (outcome: string) => {
		await tx.agentTask.updateMany({
			where: { id: task.id, finishedAt: null },
			data: { finishedAt: now, outcome },
		});
		return outcome;
	};
	if (!lichTomTatBat(ct))
		return dong(`khong-chay:${nacCuaViec(ct, "tom-tat-tuan")}:0`);
	const homQua = homQuaCua(task.dueAt);
	const tuan = dauTuanVN(homQua);
	const chuKy = await tx.okrCycle.findMany({
		where: {
			phase: PHA_CHAY,
			updateWeekday: thuTrongTuan(homQua),
			...KY_CON_HIEN,
		},
		select: { id: true },
		orderBy: { id: "asc" },
	});
	const phong = await tx.department.findMany({
		where: { archivedAt: null },
		select: { id: true, divisionId: true },
		orderBy: [{ position: "asc" }, { id: "asc" }],
	});
	let daXep = 0;
	for (const ky of chuKy) {
		for (const p of phong) {
			const donVi: DonViMucTieu = {
				onehub: false,
				boPhanId: p.divisionId,
				phongBanId: p.id,
			};
			const nac = nacCuaDonVi(ct, "tom-tat-tuan", donVi);
			if (nac !== "bat" && nac !== "an") continue;
			const khoa = { cycleId: ky.id, departmentId: p.id, tuan };
			if (await daCoBan(tx, khoa)) continue;
			const tuanNay = await trangThaiTuan(
				tx,
				{ cycleId: ky.id, departmentId: p.id, now },
				LUAT_TOM_TAT,
			);
			if (tuanNay.dangSoan || tuanNay.chuaCapNhat) continue;
			const san = await troLyOkrSanSang(tx, {
				viec: "tom-tat-tuan",
				donVi,
				nacViec: nac,
				now,
			});
			if (!san.bat) return dong(`khong-chay:${san.lyDo}:${daXep}`);
			const goi = await dungGoiTomTat(tx, { ...khoa, moc: now }, LUAT_TOM_TAT);
			if (!goi) continue;
			await tx.agentTask.create({
				data: {
					kind: LOAI_TOM_TAT,
					reason: LY_DO_VIEC_OKR[LOAI_TOM_TAT],
					priority: PRIORITY.okrNen,
					budget: 0,
					dueAt: now,
					createdAt: now,
					payload: {
						viec: "tom-tat-tuan",
						departmentId: p.id,
						cycleId: ky.id,
						tuan,
						inputHash: bamDauVao(
							khoa,
							goi.nguon.map((n) => n.id),
						),
						nac,
					},
				},
			});
			daXep += 1;
		}
	}
	return dong(`da-xep:${daXep}`);
}

export async function chayXepTomTat(
	task: Pick<LeasedTask, "id" | "dueAt">,
	now: Date = new Date(),
): Promise<string> {
	const ct = await cauHinhAiLuc(db, now);
	if (lichTomTatBat(ct)) {
		await db.$transaction((tx) =>
			ghiViecXep(tx, gioXepCua(ngayKe(task.dueAt)), now),
		);
	}
	return db.$transaction((tx) => xepTrongNgay(tx, task, now), {
		timeout: OKR_TOM_TAT.giaoDichXepMs,
	});
}

export async function damBaoLichTomTat(
	now: Date = new Date(),
): Promise<boolean> {
	if (!lichTomTatBat(await cauHinhAiLuc(db, now))) return false;
	const homNay = gioXepCua(now);
	const dueAt = now < homNay ? homNay : gioXepCua(ngayKe(now));
	return db.$transaction(async (tx) => {
		await lockIdempotencyKey(tx, LOAI_XEP);
		const mo = await tx.agentTask.count({
			where: { kind: LOAI_XEP, finishedAt: null },
		});
		if (mo > 0) return false;
		return ghiViecXep(tx, dueAt, now);
	});
}
