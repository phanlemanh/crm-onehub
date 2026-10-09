import { db } from "@crm/db";
import { WORKSPACE_ID, workspaceSlug } from "@crm/db/workspace";

export const TIEN_TO = "sokr-";
export const BAN_CHUONG_TRINH = 8_100_001;
let dem = 0;
const chuCai = (n: number): string => {
	let ra = "";
	let con = n;
	do {
		ra = String.fromCharCode(97 + (con % 26)) + ra;
		con = Math.floor(con / 26);
	} while (con > 0);
	return ra;
};
export const ma = () => `${TIEN_TO}${chuCai(Date.now())}x${chuCai(++dem)}`;

export async function moXuong(): Promise<void> {
	await db.organization.upsert({
		where: { id: WORKSPACE_ID },
		update: {},
		create: {
			id: WORKSPACE_ID,
			name: "CRM",
			slug: workspaceSlug("CRM"),
			createdAt: new Date(),
		},
	});
}

export async function gieoNguoi(
	ten: string,
	role: "owner" | "admin" | "member" | "okr" | "khach" | null = "member",
) {
	const id = ma();
	const u = await db.user.create({
		data: { id, name: ten, email: `${id}@thu.test` },
	});
	if (role)
		await db.member.create({
			data: {
				id: `${TIEN_TO}mem-${id}`,
				organizationId: WORKSPACE_ID,
				userId: id,
				role,
				createdAt: new Date(),
			},
		});
	return u;
}

export async function gieoChuKy(
	phase: "lap-ke-hoach" | "dang-chay" | "cham-diem" | "da-dong",
	ky = { tu: "2027-01-01", den: "2027-03-31" },
	parentId: string | null = null,
): Promise<string> {
	return (
		await db.okrCycle.create({
			data: {
				kind: "quy",
				name: ma(),
				startsOn: new Date(`${ky.tu}T00:00:00Z`),
				endsOn: new Date(`${ky.den}T00:00:00Z`),
				phase,
				updateWeekday: 1,
				parentId,
			},
		})
	).id;
}

export async function gieoDonVi(
	v: {
		moTaBoPhan?: string;
		moTaPhong?: string;
		truongPhong?: string;
		truongBoPhan?: string;
	} = {},
) {
	const bp = await db.division.create({
		data: {
			name: ma(),
			position: 0,
			moTa: v.moTaBoPhan ?? "",
			headUserId: v.truongBoPhan ?? null,
		},
	});
	const pb = await db.department.create({
		data: {
			name: ma(),
			position: 0,
			divisionId: bp.id,
			moTa: v.moTaPhong ?? "",
			headUserId: v.truongPhong ?? null,
		},
	});
	return { divisionId: bp.id, departmentId: pb.id };
}

export async function gieoCuoc(v: {
	cycleId: string;
	departmentId?: string | null;
	divisionId?: string | null;
	level?: "onehub" | "bo-phan" | "phong-ban";
	nguoiMoUserId: string;
	sessionId?: string;
	nac?: "bat" | "an";
	trangThai?: "dang" | "da-dua-vao" | "bo";
}) {
	return db.okrCuocSoan.create({
		data: {
			cycleId: v.cycleId,
			level: v.level ?? "phong-ban",
			departmentId: v.departmentId ?? null,
			divisionId: v.divisionId ?? null,
			nguoiMoUserId: v.nguoiMoUserId,
			sessionId: v.sessionId ?? ma(),
			nac: v.nac ?? "bat",
			trangThai: v.trangThai ?? "dang",
		},
	});
}

export async function donDep(): Promise<void> {
	await db.aiChiPhi.deleteMany({
		where: { sessionId: { startsWith: TIEN_TO } },
	});
	await db.agentEvent.deleteMany({
		where: { sessionId: { startsWith: TIEN_TO } },
	});
	await db.okrDeXuat.deleteMany({
		where: { nguoiYeuCau: { startsWith: TIEN_TO } },
	});
	await db.okrCuocSoan.deleteMany({
		where: { nguoiMoUserId: { startsWith: TIEN_TO } },
	});
	const cuaThu = { ownerUserId: { startsWith: TIEN_TO } };
	await db.okrCheckIn.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.okrCheckInSession.deleteMany({
		where: { id: { startsWith: TIEN_TO } },
	});
	await db.okrDiemKr.deleteMany({ where: { keyResult: cuaThu } });
	await db.okrNhinLai.deleteMany({ where: { objective: cuaThu } });
	await db.okrMangSang.deleteMany({ where: { tuObjective: cuaThu } });
	await db.okrObjective.deleteMany({ where: cuaThu });
	await db.okrCycle.deleteMany({
		where: { name: { startsWith: TIEN_TO }, parentId: { not: null } },
	});
	await db.okrCycle.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.okrProgramConfig.deleteMany({
		where: { version: BAN_CHUONG_TRINH },
	});
	const trangThu = { trangId: { startsWith: TIEN_TO } };
	await db.taiLieuTrang.updateMany({
		where: { id: { startsWith: TIEN_TO } },
		data: { banDangDungId: null },
	});
	await db.taiLieuPhienBan.deleteMany({ where: trangThu });
	await db.taiLieuDeXuat.deleteMany({ where: trangThu });
	await db.taiLieuTrang.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await db.orgPlacement.deleteMany({
		where: { userId: { startsWith: TIEN_TO } },
	});
	await db.department.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.division.deleteMany({ where: { name: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
}
