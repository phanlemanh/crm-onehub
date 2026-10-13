import { type Db, Prisma } from "@crm/db";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { kiemGiaTriTheoKieu } from "@crm/validation/okr-cap-nhat";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgram,
	THANG_CHAM,
} from "@crm/validation/okr-chuong-trinh";
import { goiYDiem } from "@crm/validation/okr-khep";
import { z } from "zod";
import { idMau, LoiBoMau, ngayDb, OKR_MAU } from "./cau-hinh";
import { dienBien, type LanMau, lanQuy3, lichMau } from "./dien-bien";
import type { BoOkrMau, KrMau, MucTieuMau } from "./khuon";
import { type DemCanhKr, napCanhKr, xoaCanhKr } from "./nap-canh-kr";
import { type DemHoiY, napHoiYMau, xoaHoiY } from "./nap-hoi-y";
import { napTaiLieuMau } from "./nap-tai-lieu";

export { idMau };

type Tx = Prisma.TransactionClient;

export type DemBoMau = {
	nguoi: number;
	boPhan: number;
	phongBan: number;
	chuKy: number;
	mucTieu: number;
	kr: number;
	capNhat: number;
	phien: number;
	soChup: number;
	diem: number;
	taiLieu: number;
	nguoiXem: number;
	vet: number;
} & DemCanhKr &
	DemHoiY;

type Quy = "quy3" | "quy4";

export const thuMau = (ma: string) => `${ma}@${OKR_MAU.mienThu}`;

const CHU_KY = {
	nam: idMau("chu-ky", "nam"),
	namKe: idMau("chu-ky", "nam-ke"),
	quy3: idMau("chu-ky", "quy3"),
	quy4: idMau("chu-ky", "quy4"),
};

const PHIEN_GIAY = 90;

export async function kiemWorkspace(tx: Tx | Db): Promise<void> {
	const co = await tx.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { id: true },
	});
	if (!co)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			"Kho chưa có workspace — `bun run db:seed` không tạo nó; workspace sinh ở lần đăng nhập đầu. Đăng nhập một lần (hoặc `cd apps/api && bun run dev:session <thư của anh>`) rồi nạp lại bộ OKR mẫu.",
		);
}

export async function kiemOkrThat(tx: Tx | Db): Promise<void> {
	const ngoai = { NOT: { id: { startsWith: OKR_MAU.tienTo } } };
	const [chuKy, mucTieu, kr] = await Promise.all([
		tx.okrCycle.count({ where: ngoai }),
		tx.okrObjective.count({ where: ngoai }),
		tx.okrKeyResult.count({ where: ngoai }),
	]);
	if (chuKy + mucTieu + kr > 0)
		throw new LoiBoMau(
			OKR_MAU.ma.okrThat,
			`Từ chối: workspace đã có OKR thật — ${chuKy} chu kỳ, ${mucTieu} mục tiêu, ${kr} KR không thuộc bộ mẫu. Bộ mẫu chỉ nạp vào kho chưa có OKR thật; dùng một kho đo riêng (\`bun run db:do --tao\`).`,
		);
}

type KhoaDonVi = {
	[K in keyof OkrProgram]: OkrProgram[K] extends string[] ? K : never;
}[keyof OkrProgram];

const laKhoaDonVi = (k: string): k is KhoaDonVi =>
	Array.isArray(OKR_PROGRAM_MAC_DINH[k as keyof OkrProgram]);

const MANG_DON_VI = Object.keys(OKR_PROGRAM_MAC_DINH).filter(laKhoaDonVi);

const laMaMau = (ma: string) => ma.startsWith(OKR_MAU.tienTo);

async function tapMau(tx: Tx) {
	const tien = { startsWith: OKR_MAU.tienTo };
	const [nguoi, boPhan, phongBan, chuKy, mucTieu, kr, taiLieu] =
		await Promise.all([
			tx.user.findMany({
				where: {
					OR: [{ id: tien }, { email: { endsWith: `@${OKR_MAU.mienThu}` } }],
				},
				select: { id: true },
			}),
			tx.division.findMany({ where: { id: tien }, select: { id: true } }),
			tx.department.findMany({ where: { id: tien }, select: { id: true } }),
			tx.okrCycle.findMany({ where: { id: tien }, select: { id: true } }),
			tx.okrObjective.findMany({ where: { id: tien }, select: { id: true } }),
			tx.okrKeyResult.findMany({ where: { id: tien }, select: { id: true } }),
			tx.taiLieuTrang.count({ where: { chuTrangId: tien } }),
		]);
	const ids = (ds: { id: string }[]) => ds.map((x) => x.id);
	const cuocSoan = await tx.okrCuocSoan.findMany({
		where: {
			OR: [
				{ cycleId: tien },
				{ divisionId: tien },
				{ departmentId: tien },
				{ nguoiMoUserId: { in: ids(nguoi) } },
			],
		},
		select: { id: true },
	});
	const cauHinh = await tx.okrProgramConfig.findMany({
		where: {
			OR: [{ createdById: { in: ids(nguoi) } }, { createdById: tien }],
		},
		select: { id: true },
	});
	const conLai = await tx.okrProgramConfig.findMany({
		where: { id: { notIn: ids(cauHinh) } },
	});
	const cauHinhGat = conLai.filter((row) =>
		MANG_DON_VI.some((k) => row[k].some(laMaMau)),
	);
	return {
		nguoi: ids(nguoi),
		cuocSoan: ids(cuocSoan),
		cauHinh: ids(cauHinh),
		cauHinhGat,
		boPhan: ids(boPhan),
		phongBan: ids(phongBan),
		chuKy: ids(chuKy),
		mucTieu: ids(mucTieu),
		kr: ids(kr),
		taiLieu,
	};
}

const metaKhoaNgoai = z.object({
	modelName: z.string().optional(),
	constraint: z.string().optional(),
	field_name: z.string().optional(),
});

function bangGiu(loi: Prisma.PrismaClientKnownRequestError): string {
	const meta = metaKhoaNgoai.safeParse(loi.meta ?? {});
	const ten = meta.success
		? [meta.data.modelName, meta.data.constraint, meta.data.field_name]
				.filter(Boolean)
				.join(" · ")
		: "";
	return ten || loi.message.split("\n").at(-1) || "khoá ngoại";
}

export type DemCuocSoan = { cuocSoan: number; deXuatSoan: number };

export type DemCauHinh = { cauHinh: number; cauHinhGat: number };

export async function xoaTrong(
	tx: Tx,
): Promise<(DemBoMau & DemCuocSoan & DemCauHinh) | null> {
	const t = await tapMau(tx);
	const { taiLieu: soTaiLieu, cauHinhGat, ...danhSach } = t;
	const tong =
		soTaiLieu +
		cauHinhGat.length +
		Object.values(danhSach).reduce((s, ds) => s + ds.length, 0);
	if (tong === 0) return null;
	const U = { in: t.nguoi };
	const C = { in: t.chuKy };
	const O = { in: t.mucTieu };
	const K = { in: t.kr };
	const CS = { in: t.cuocSoan };
	const deXuatSoan = await tx.okrDeXuat.deleteMany({
		where: { cuocSoanId: CS },
	});
	const cuocSoan = await tx.okrCuocSoan.deleteMany({ where: { id: CS } });
	const cauHinh = await tx.okrProgramConfig.deleteMany({
		where: { id: { in: t.cauHinh } },
	});
	for (const row of cauHinhGat)
		await tx.okrProgramConfig.update({
			where: { id: row.id },
			data: Object.fromEntries(
				MANG_DON_VI.map((k) => [k, row[k].filter((ma) => !laMaMau(ma))]),
			),
		});
	const canhKr = await xoaCanhKr(tx, t);
	const hoiY = await xoaHoiY(tx, t);
	const phien = await tx.okrCheckInSession.findMany({
		where: { userId: U },
		select: { id: true },
	});
	const P = { in: phien.map((p) => p.id) };
	const capNhat = await tx.okrCheckIn.deleteMany({
		where: { OR: [{ keyResultId: K }, { sessionId: P }] },
	});
	const vet = await tx.okrTrail.deleteMany({
		where: {
			OR: [
				{ cycleId: C },
				{ objectiveId: O },
				{ keyResultId: K },
				{ actorUserId: U },
			],
		},
	});
	const phienXoa = await tx.okrCheckInSession.deleteMany({ where: { id: P } });
	const soChup = await tx.okrSoChup.deleteMany({ where: { keyResultId: K } });
	const diem = await tx.okrDiemKr.deleteMany({
		where: { OR: [{ keyResultId: K }, { cycleId: C }] },
	});
	await tx.okrDoiDich.deleteMany({ where: { keyResultId: K } });
	await tx.okrNguonKr.deleteMany({ where: { keyResultId: K } });
	await tx.okrComment.deleteMany({
		where: { OR: [{ objectiveId: O }, { authorUserId: U }] },
	});
	await tx.okrMention.deleteMany({ where: { userId: U } });
	await tx.okrFollow.deleteMany({
		where: { OR: [{ objectiveId: O }, { userId: U }] },
	});
	await tx.okrNhinLai.deleteMany({ where: { objectiveId: O } });
	await tx.okrMangSang.deleteMany({
		where: {
			OR: [{ tuObjectiveId: O }, { sangObjectiveId: O }, { sangCycleId: C }],
		},
	});
	await tx.okrCuaSoRa.deleteMany({ where: { cycleId: C } });
	await tx.okrDeXuat.deleteMany({ where: { objectiveId: O } });
	const nguoiXem = await tx.okrNguoiXem.deleteMany({
		where: { objectiveId: O },
	});
	await tx.okrTomTat.deleteMany({ where: { cycleId: C } });
	const kr = await tx.okrKeyResult.deleteMany({ where: { id: K } });
	const mucTieu = await tx.okrObjective.deleteMany({ where: { id: O } });
	await tx.okrCycle.deleteMany({ where: { id: C, parentId: { not: null } } });
	await tx.okrCycle.deleteMany({ where: { id: C } });
	const trangMau = await tx.taiLieuTrang.findMany({
		where: { OR: [{ chuTrangId: U }, { taoBoiId: U }] },
		select: { id: true },
	});
	const TL = { in: trangMau.map((x) => x.id) };
	await tx.taiLieuLienKet.deleteMany({ where: { tuTrangId: TL } });
	await tx.taiLieuSuKien.deleteMany({ where: { trangId: TL } });
	await tx.taiLieuTrang.updateMany({
		where: { id: TL },
		data: { banDangDungId: null },
	});
	await tx.taiLieuDeXuat.updateMany({
		where: { trangId: TL },
		data: { banGocId: null },
	});
	await tx.taiLieuPhienBan.deleteMany({ where: { trangId: TL } });
	await tx.taiLieuDeXuat.deleteMany({ where: { trangId: TL } });
	await tx.taiLieuNguon.deleteMany({ where: { trangId: TL } });
	const taiLieu = await tx.taiLieuTrang.deleteMany({ where: { id: TL } });
	await tx.orgPlacement.deleteMany({ where: { userId: U } });
	const phongBan = await tx.department.deleteMany({
		where: { id: { in: t.phongBan } },
	});
	const boPhan = await tx.division.deleteMany({
		where: { id: { in: t.boPhan } },
	});
	const nguoi = await tx.user.deleteMany({ where: { id: U } });
	return {
		nguoi: nguoi.count,
		boPhan: boPhan.count,
		phongBan: phongBan.count,
		chuKy: t.chuKy.length,
		mucTieu: mucTieu.count,
		kr: kr.count,
		capNhat: capNhat.count,
		phien: phienXoa.count,
		soChup: soChup.count,
		diem: diem.count,
		taiLieu: taiLieu.count,
		nguoiXem: nguoiXem.count,
		vet: vet.count,
		cuocSoan: cuocSoan.count,
		deXuatSoan: deXuatSoan.count,
		cauHinh: cauHinh.count,
		cauHinhGat: cauHinhGat.length,
		...canhKr,
		...hoiY,
	};
}

async function chuongTrinh(tx: Tx) {
	const row = await tx.okrProgramConfig.findFirst({
		orderBy: { version: "desc" },
	});
	if (!row)
		return {
			thang: OKR_PROGRAM_MAC_DINH.scoreScale,
			trongSo: OKR_PROGRAM_MAC_DINH.weightsOn,
			version: 0,
		};
	return {
		thang: z.enum(THANG_CHAM).parse(row.scoreScale),
		trongSo: row.weightsOn,
		version: row.version,
	};
}

function donViDb(m: MucTieuMau) {
	if (m.cap === "phong-ban")
		return { divisionId: null, departmentId: idMau("pb", m.donVi ?? "") };
	if (m.cap === "bo-phan")
		return { divisionId: idMau("bp", m.donVi ?? ""), departmentId: null };
	return { divisionId: null, departmentId: null };
}

const daCongBo = (m: MucTieuMau) =>
	m.trangThai === "cong-bo" || m.trangThai === "da-bo";

function vetDuyet(
	bo: BoOkrMau,
	lich: ReturnType<typeof lichMau>,
): Prisma.OkrTrailCreateManyInput[] {
	return bo.mucTieu.flatMap((m) => {
		if (!m.duyet) return [];
		const tuan =
			m.trangThai === "cho-duyet"
				? OKR_MAU.duyet.tuanGui.choDuyet
				: OKR_MAU.duyet.tuanGui.nhap;
		const gui = lich.lucCapNhat("quy4", tuan);
		const objectiveId = idMau("mt", m.ma);
		const dong: Prisma.OkrTrailCreateManyInput[] = [
			{
				id: idMau("vet", `${m.ma}-gui-duyet`),
				at: gui,
				actorUserId: idMau("nguoi", m.chu),
				objectiveId,
				action: "gui-duyet",
				before: { status: "nhap" },
				after: { status: "cho-duyet" },
			},
		];
		if (m.duyet.traLai)
			dong.push({
				id: idMau("vet", `${m.ma}-tra-lai`),
				at: new Date(
					gui.getTime() + OKR_MAU.duyet.gioTraLai * OKR_MAU.thoiGian.gioMs,
				),
				actorUserId: idMau("nguoi", m.duyet.traLai.nguoi),
				objectiveId,
				action: "tra-lai",
				before: { status: "cho-duyet" },
				after: { status: "nhap" },
				note: m.duyet.traLai.lyDo,
			});
		return dong;
	});
}

function phamViDb(k: KrMau): Prisma.InputJsonValue {
	const pv = k.nguon?.phamVi;
	if (!pv || pv.kieu === "toan-cong-ty") return { kieu: "toan-cong-ty" };
	const loai =
		pv.kieu === "phong-ban" ? "pb" : pv.kieu === "bo-phan" ? "bp" : "nguoi";
	return { kieu: pv.kieu, id: idMau(loai, pv.ma) };
}

export async function napTrong(
	tx: Tx,
	bo: BoOkrMau,
	moc: Date,
): Promise<Omit<DemBoMau, keyof DemHoiY>> {
	const lich = lichMau(moc);
	const ct = await chuongTrinh(tx);
	const bayGio = new Date(moc.getTime());
	const nguoiId = (ma: string) => idMau("nguoi", ma);
	const viTriCuoi = async (bang: "division" | "department") => {
		const r =
			bang === "division"
				? await tx.division.aggregate({ _max: { position: true } })
				: await tx.department.aggregate({ _max: { position: true } });
		return (r._max.position ?? -1) + 1;
	};

	await tx.user.createMany({
		data: bo.nguoi.map((n) => ({
			id: nguoiId(n.ma),
			name: n.ten,
			email: thuMau(n.ma),
			emailVerified: true,
			createdAt: bayGio,
			updatedAt: bayGio,
		})),
	});
	await tx.member.createMany({
		data: bo.nguoi.map((n) => ({
			id: idMau("member", n.ma),
			organizationId: WORKSPACE_ID,
			userId: nguoiId(n.ma),
			role: n.vai,
			createdAt: bayGio,
		})),
	});
	const dauBp = await viTriCuoi("division");
	await tx.division.createMany({
		data: bo.boPhan.map((b, i) => ({
			id: idMau("bp", b.ma),
			createdAt: bayGio,
			name: b.ten,
			position: dauBp + i,
			moTa: b.moTa,
			headUserId: nguoiId(b.truong),
		})),
	});
	const dauPb = await viTriCuoi("department");
	await tx.department.createMany({
		data: bo.phongBan.map((p, i) => ({
			id: idMau("pb", p.ma),
			createdAt: bayGio,
			name: p.ten,
			position: dauPb + i,
			divisionId: idMau("bp", p.boPhan),
			moTa: p.moTa,
			headUserId: nguoiId(p.truong),
		})),
	});
	await tx.department.createMany({
		data: bo.phongBanLuuTru.map((p, i) => ({
			id: idMau("pb", p.ma),
			createdAt: bayGio,
			name: p.ten,
			position: dauPb + bo.phongBan.length + i,
			divisionId: idMau("bp", p.boPhan),
			headUserId: null,
			archivedAt: bayGio,
		})),
	});
	await tx.orgPlacement.createMany({
		data: bo.nguoi.map((n) => ({
			userId: nguoiId(n.ma),
			primaryDepartmentId: idMau("pb", n.phongBan),
			chucDanh: n.chucDanh,
			managerUserId: nguoiId(n.quanLy),
		})),
	});

	await tx.okrCycle.create({
		data: {
			id: CHU_KY.nam,
			kind: "nam",
			name: bo.chuKy.nam.ten,
			startsOn: ngayDb(lich.nam.tu),
			endsOn: ngayDb(lich.nam.den),
			phase: "dang-chay",
			createdAt: bayGio,
		},
	});
	await tx.okrCycle.createMany({
		data: [
			{
				id: CHU_KY.namKe,
				kind: "nam",
				name: bo.chuKy.namKe.ten,
				startsOn: ngayDb(lich.namKe.tu),
				endsOn: ngayDb(lich.namKe.den),
				phase: "lap-ke-hoach",
				createdAt: bayGio,
			},
			{
				id: CHU_KY.quy3,
				kind: "quy",
				name: bo.chuKy.quy3.ten,
				parentId: CHU_KY.nam,
				startsOn: ngayDb(lich.quy3.tu),
				endsOn: ngayDb(lich.quy3.den),
				phase: "da-dong",
				createdAt: bayGio,
			},
			{
				id: CHU_KY.quy4,
				kind: "quy",
				name: bo.chuKy.quy4.ten,
				parentId: CHU_KY.nam,
				startsOn: ngayDb(lich.quy4.tu),
				endsOn: ngayDb(lich.quy4.den),
				phase: "dang-chay",
				createdAt: bayGio,
			},
		],
	});

	const dauChuKy = (m: MucTieuMau) =>
		m.chuKy === "quy3"
			? lich.lucCapNhat("quy3", 1)
			: lich.lucCapNhat("quy4", 1);
	const viTri = new Map<string, number>();
	await tx.okrObjective.createMany({
		data: bo.mucTieu.map((m) => {
			const khoa = `${m.chuKy}:${m.cap}:${m.donVi ?? ""}`;
			const pos = viTri.get(khoa) ?? 0;
			viTri.set(khoa, pos + 1);
			const congBo = daCongBo(m);
			return {
				id: idMau("mt", m.ma),
				createdAt: bayGio,
				cycleId: CHU_KY[m.chuKy],
				level: m.cap,
				...donViDb(m),
				ownerUserId: nguoiId(m.chu),
				kind: m.kieu,
				status: m.trangThai,
				hienThi: m.hienThi,
				title: m.ten,
				whyNow: m.viSao,
				publishedAt: congBo ? dauChuKy(m) : null,
				droppedAt: m.trangThai === "da-bo" ? lich.lucCapNhat("quy4", 2) : null,
				position: pos,
			};
		}),
	});
	const thamGia = bo.mucTieu.flatMap((m) =>
		m.thamGia.map((t) => ({
			objectiveId: idMau("mt", m.ma),
			userId: nguoiId(t),
			createdAt: bayGio,
		})),
	);
	if (thamGia.length) await tx.okrParticipant.createMany({ data: thamGia });
	const nguoiXem = bo.mucTieu.flatMap((m) =>
		m.nguoiXem.map((u) => ({
			objectiveId: idMau("mt", m.ma),
			userId: nguoiId(u),
			createdById: nguoiId(m.chu),
			createdAt: bayGio,
		})),
	);
	if (nguoiXem.length) await tx.okrNguoiXem.createMany({ data: nguoiXem });
	const vet = vetDuyet(bo, lich);
	if (vet.length) await tx.okrTrail.createMany({ data: vet });

	const lanCua = new Map<string, { quy: Quy; lan: LanMau[] }>();
	for (const m of bo.mucTieu) {
		if (m.trangThai !== "cong-bo") continue;
		for (const k of m.krs) {
			if (m.chuKy === "quy3") {
				lanCua.set(k.ma, {
					quy: "quy3",
					lan: lanQuy3({
						kieu: k.kieu,
						khoi: k.khoi,
						dich: k.dich,
						chot: k.chot ?? k.khoi,
						kichBanQuy3: k.kichBanQuy3,
						ghiChu: k.ghiChu,
					}),
				});
			} else if (k.kichBan) {
				lanCua.set(k.ma, {
					quy: "quy4",
					lan: dienBien({ ...k, kichBan: k.kichBan }),
				});
			}
		}
	}

	const krDong = bo.mucTieu.flatMap((m) =>
		m.krs.map((k, i) => {
			const lan = lanCua.get(k.ma)?.lan ?? [];
			for (const l of lan) {
				const sai = k.nguon ? null : kiemGiaTriTheoKieu(k.kieu, l.giaTri);
				if (sai)
					throw new LoiBoMau(
						OKR_MAU.ma.sai,
						`KR ${k.ma} tuần ${l.tuan}: ${sai}`,
					);
			}
			const hien =
				m.chuKy === "quy3"
					? (k.chot ?? k.khoi)
					: (lan.at(-1)?.giaTri ?? k.khoi);
			return {
				id: idMau("kr", k.ma),
				createdAt: bayGio,
				objectiveId: idMau("mt", m.ma),
				title: k.ten,
				kind: k.kieu,
				ownerUserId: nguoiId(k.chu),
				startValue: k.khoi,
				targetValue: k.dich,
				currentValue: hien,
				unit: k.donVi,
				weight: 1,
				source: k.nguon ? "crm" : "tay",
				startLockedAt: daCongBo(m) ? dauChuKy(m) : null,
				position: i,
			};
		}),
	);
	await tx.okrKeyResult.createMany({ data: krDong });

	await tx.okrAlignment.createMany({
		data: bo.mucTieu
			.filter((m) => m.canChinh)
			.map((m) => ({
				id: idMau("cc", m.ma),
				createdAt: bayGio,
				objectiveId: idMau("mt", m.ma),
				targetObjectiveId: m.canChinh?.mucTieu
					? idMau("mt", m.canChinh.mucTieu)
					: null,
				targetKeyResultId: m.canChinh?.kr ? idMau("kr", m.canChinh.kr) : null,
				lyDo: m.canChinh?.lyDo ?? null,
				canCu: m.canChinh?.canCu ?? null,
				lyDoTuKara: m.canChinh?.lyDoTuKara ?? false,
			})),
	});

	const krCrm = bo.mucTieu.flatMap((m) =>
		m.krs.filter((k) => k.nguon).map((k) => ({ m, k })),
	);
	const chup = krCrm.flatMap(({ k }) =>
		(lanCua.get(k.ma)?.lan ?? []).map((l) => ({
			id: idMau("chup", `${k.ma}-${l.tuan}`),
			keyResultId: idMau("kr", k.ma),
			ngay: ngayDb(lich.ngay("quy4", l.tuan)),
			giaTri: l.giaTri,
			nguon: "crm",
			chiSo: k.nguon?.chiSo ?? null,
			phamVi: phamViDb(k),
			chupLuc: lich.lucCapNhat("quy4", l.tuan),
		})),
	);
	await tx.okrNguonKr.createMany({
		data: krCrm.map(({ k }) => {
			const cuoi = lanCua.get(k.ma)?.lan.at(-1);
			return {
				id: idMau("nguon", k.ma),
				createdAt: bayGio,
				keyResultId: idMau("kr", k.ma),
				loai: "crm",
				chiSo: k.nguon?.chiSo ?? null,
				phamVi: phamViDb(k),
				docLuc: cuoi ? lich.lucCapNhat("quy4", cuoi.tuan) : null,
				docGiaTri: cuoi?.giaTri ?? null,
				taoBoiUserId: nguoiId(k.chu),
			};
		}),
	});
	if (chup.length) await tx.okrSoChup.createMany({ data: chup });

	const phien = new Map<string, { id: string; userId: string; luc: Date }>();
	const capNhat: Prisma.OkrCheckInCreateManyInput[] = [];
	for (const m of bo.mucTieu) {
		for (const k of m.krs) {
			const muc = lanCua.get(k.ma);
			if (!muc) continue;
			for (const l of muc.lan) {
				const khoa = `${k.chu}-${muc.quy}-${l.tuan}`;
				const luc = lich.lucCapNhat(muc.quy, l.tuan);
				if (!phien.has(khoa))
					phien.set(khoa, {
						id: idMau("phien", khoa),
						userId: nguoiId(k.chu),
						luc,
					});
				capNhat.push({
					id: idMau("cn", `${k.ma}-${muc.quy}-${l.tuan}`),
					keyResultId: idMau("kr", k.ma),
					sessionId: idMau("phien", khoa),
					weekStart: ngayDb(lich.ngay(muc.quy, l.tuan)),
					value: l.giaTri,
					confidence: l.tuTin,
					note: l.ghiChu,
					authorUserId: nguoiId(k.chu),
					ownerUserId: nguoiId(k.chu),
					createdAt: luc,
				});
			}
		}
	}
	await tx.okrCheckInSession.createMany({
		data: [...phien.values()].map((p) => ({
			id: p.id,
			userId: p.userId,
			entry: "nhac",
			openedAt: new Date(p.luc.getTime() - PHIEN_GIAY * 1000),
			submittedAt: p.luc,
			seconds: PHIEN_GIAY,
		})),
	});
	await tx.okrCheckIn.createMany({ data: capNhat });

	const quy3 = bo.mucTieu.filter(
		(m) => m.chuKy === "quy3" && m.trangThai === "cong-bo",
	);
	const chamLuc = new Date(
		Date.parse(`${lich.quy4.tu}T03:00:00Z`) + 2 * OKR_MAU.thoiGian.ngayMs,
	);
	const diem = quy3.flatMap((m) =>
		m.krs.map((k) => {
			const chot = k.chot ?? k.khoi;
			return {
				id: idMau("diem", k.ma),
				createdAt: bayGio,
				keyResultId: idMau("kr", k.ma),
				cycleId: CHU_KY.quy3,
				soChot: chot,
				diemGoiY: goiYDiem(k.kieu, k.khoi, k.dich, chot),
				diem: k.diem ?? goiYDiem(k.kieu, k.khoi, k.dich, chot),
				lyDo: k.lyDo ?? null,
				thang: ct.thang,
				trongSoBat: ct.trongSo,
				phienBanChuongTrinh: ct.version,
				chamBoiUserId: nguoiId(m.chu),
				chamLuc,
			};
		}),
	);
	await tx.okrDiemKr.createMany({ data: diem });
	await tx.okrNhinLai.createMany({
		data: quy3
			.filter((m) => m.dieuHocDuoc)
			.map((m) => ({
				id: idMau("nl", m.ma),
				objectiveId: idMau("mt", m.ma),
				dieuHocDuoc: m.dieuHocDuoc ?? "",
				suaBoiUserId: nguoiId(m.chu),
			})),
	});
	await tx.okrMangSang.createMany({
		data: bo.mucTieu
			.filter((m) => m.mangSangTu)
			.map((m) => ({
				id: idMau("ms", m.ma),
				tuObjectiveId: idMau("mt", m.mangSangTu ?? ""),
				sangObjectiveId: idMau("mt", m.ma),
				sangCycleId: CHU_KY.quy4,
				boiUserId: nguoiId(m.chu),
				luc: chamLuc,
			})),
	});

	const canhKr = await napCanhKr(tx, bo, { lich, lanCua, bayGio });

	return {
		nguoi: bo.nguoi.length,
		boPhan: bo.boPhan.length,
		phongBan: bo.phongBan.length + bo.phongBanLuuTru.length,
		chuKy: 4,
		mucTieu: bo.mucTieu.length,
		kr: krDong.length,
		capNhat: capNhat.length,
		phien: phien.size,
		soChup: chup.length,
		diem: diem.length,
		taiLieu: 0,
		nguoiXem: nguoiXem.length,
		vet: vet.length,
		...canhKr,
	};
}

const GIAO_DICH = { timeout: 120_000, maxWait: 10_000 } as const;

async function trongGiaoDich<T>(
	db: Db,
	viec: (tx: Tx) => Promise<T>,
): Promise<T> {
	try {
		return await db.$transaction(viec, GIAO_DICH);
	} catch (loi) {
		if (
			loi instanceof Prisma.PrismaClientKnownRequestError &&
			loi.code === "P2003"
		)
			throw new LoiBoMau(
				OKR_MAU.ma.dangGiu,
				`Không xoá được bộ mẫu: dữ liệu ngoài bộ mẫu đang trỏ vào người hoặc đơn vị mẫu (${bangGiu(loi)}). Gỡ liên kết đó rồi chạy lại; không hàng nào đã đổi.`,
			);
		throw loi;
	}
}

export async function napBoOkrMau(
	db: Db,
	bo: BoOkrMau,
	{ moc }: { moc: Date },
): Promise<DemBoMau> {
	const dem = await trongGiaoDich(db, async (tx) => {
		await kiemWorkspace(tx);
		await kiemOkrThat(tx);
		await xoaTrong(tx);
		return napTrong(tx, bo, moc);
	});
	try {
		const hoiY = await napHoiYMau(db, bo, { moc, chuKyId: CHU_KY.namKe });
		const taiLieu = await napTaiLieuMau(db, bo);
		return { ...dem, ...hoiY, taiLieu };
	} catch (loi) {
		await xoaBoOkrMau(db).catch((loiDon) => {
			console.error(
				`Nạp lần hỏi ý hoặc trang tài liệu mẫu hỏng, và dọn bộ mẫu vừa nạp cũng hỏng — kho còn bộ mẫu dở, chạy lại với ${OKR_MAU.co.xoa}: ${loiDon instanceof Error ? loiDon.message : String(loiDon)}`,
			);
		});
		throw loi;
	}
}

export async function xoaBoOkrMau(
	db: Db,
): Promise<(DemBoMau & DemCuocSoan & DemCauHinh) | null> {
	return trongGiaoDich(db, async (tx) => {
		await kiemOkrThat(tx);
		return xoaTrong(tx);
	});
}
