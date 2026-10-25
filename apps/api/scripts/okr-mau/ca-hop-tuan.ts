import "reflect-metadata";
import type { Db } from "@crm/db";
import {
	guiCapNhatInput,
	type MucTuTin,
	moCapNhatInput,
} from "@crm/validation/okr-cap-nhat";
import type { INestApplicationContext } from "@nestjs/common";
import {
	createCycleInput,
	createKrInput,
	createObjectiveInput,
} from "../../src/okr/okr.contracts";
import type { OkrService } from "../../src/okr/okr.service";
import type { OkrCapNhatService } from "../../src/okr/okr-cap-nhat.service";
import { orgDepartmentCreateInput } from "../../src/to-chuc/to-chuc.contracts";
import type { ToChucService } from "../../src/to-chuc/to-chuc.service";
import { idMau, LoiBoMau, OKR_MAU } from "./cau-hinh";
import type { BoOkrMau, NguoiMau } from "./khuon";
import { thuMau } from "./nap";

const CA = OKR_MAU.caHopTuan;
const NGAY_MS = OKR_MAU.thoiGian.ngayMs;
const MUC_XEN: readonly MucTuTin[] = ["vua", "thap", "cao"];

export type KetQuaCaHopTuan = {
	truongP: string;
	thanhVienM: string;
	quanTriA: string;
	boP: string;
	boRong: string;
	chuKyCon: string;
	chuKyKeHoach: string;
};

type DichVu = {
	okr: OkrService;
	capNhat: OkrCapNhatService;
	toChuc: ToChucService;
};

type VaiCa = {
	p: NguoiMau;
	m: NguoiMau;
	a: NguoiMau;
	truongRong: NguoiMau;
	chu: NguoiMau[];
	maPhongBanP: string;
};

const ngayIso = (d: Date) => d.toISOString().slice(0, 10);
const congNgay = (d: Date, n: number) => new Date(d.getTime() + n * NGAY_MS);
const tenCa = (ten: string) => `${CA.tienTo} · ${ten}`;

export async function xoaCaHopTuan(db: Db): Promise<number> {
	return db.$transaction(async (tx) => {
		const [chuKy, phongBan] = await Promise.all([
			tx.okrCycle.findMany({
				where: { name: { startsWith: CA.tienTo } },
				select: { id: true, parentId: true },
			}),
			tx.department.findMany({
				where: { name: { startsWith: CA.tienTo } },
				select: { id: true },
			}),
		]);
		const C = chuKy.map((c) => c.id);
		const D = phongBan.map((p) => p.id);
		if (C.length + D.length === 0) return 0;
		const mucTieu = await tx.okrObjective.findMany({
			where: { OR: [{ cycleId: { in: C } }, { departmentId: { in: D } }] },
			select: { id: true },
		});
		const O = mucTieu.map((m) => m.id);
		const kr = await tx.okrKeyResult.findMany({
			where: { objectiveId: { in: O } },
			select: { id: true },
		});
		const K = kr.map((k) => k.id);
		const capNhat = await tx.okrCheckIn.deleteMany({
			where: { keyResultId: { in: K } },
		});
		await tx.okrTrail.deleteMany({
			where: {
				OR: [
					{ cycleId: { in: C } },
					{ objectiveId: { in: O } },
					{ keyResultId: { in: K } },
				],
			},
		});
		await tx.okrSoChup.deleteMany({ where: { keyResultId: { in: K } } });
		await tx.okrDiemKr.deleteMany({
			where: { OR: [{ keyResultId: { in: K } }, { cycleId: { in: C } }] },
		});
		await tx.okrDoiDich.deleteMany({ where: { keyResultId: { in: K } } });
		await tx.okrNguonKr.deleteMany({ where: { keyResultId: { in: K } } });
		await tx.okrComment.deleteMany({ where: { objectiveId: { in: O } } });
		await tx.okrFollow.deleteMany({ where: { objectiveId: { in: O } } });
		await tx.okrNhinLai.deleteMany({ where: { objectiveId: { in: O } } });
		await tx.okrDeXuat.deleteMany({ where: { objectiveId: { in: O } } });
		await tx.okrNguoiXem.deleteMany({ where: { objectiveId: { in: O } } });
		await tx.okrCuaSoRa.deleteMany({ where: { cycleId: { in: C } } });
		await tx.okrKeyResult.deleteMany({ where: { id: { in: K } } });
		await tx.okrObjective.deleteMany({ where: { id: { in: O } } });
		await tx.okrCycle.deleteMany({
			where: { id: { in: C }, parentId: { not: null } },
		});
		await tx.okrCycle.deleteMany({ where: { id: { in: C } } });
		await tx.orgPlacement.updateMany({
			where: { primaryDepartmentId: { in: D } },
			data: { primaryDepartmentId: null },
		});
		await tx.department.deleteMany({ where: { id: { in: D } } });
		return C.length + D.length + O.length + K.length + capNhat.count;
	});
}

function chonVai(bo: BoOkrMau): VaiCa {
	const pbP = bo.phongBan[0];
	if (!pbP)
		throw new LoiBoMau(OKR_MAU.ma.sai, "Ca Họp tuần cần một phòng ban mẫu.");
	const dan = new Set([
		...bo.boPhan.map((b) => b.truong),
		...bo.phongBan.map((p) => p.truong),
	]);
	const p = bo.nguoi.find((n) => n.ma === pbP.truong);
	const a = bo.nguoi.find((n) => n.vai === "admin" && !dan.has(n.ma));
	const khongDan = bo.nguoi.filter(
		(n) => n.vai === "member" && !dan.has(n.ma) && n.phongBan !== pbP.ma,
	);
	const [m, truongRong, ...conLai] = khongDan;
	const chu = conLai.slice(0, CA.soDonVi);
	if (!p || !a || !m || !truongRong || chu.length < CA.soDonVi)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Ca Họp tuần cần trưởng ${pbP.ma}, một quản trị không dẫn và ${CA.soDonVi + 2} thành viên không dẫn ngoài ${pbP.ma}; bộ mẫu thiếu.`,
		);
	return { p, m, a, truongRong, chu, maPhongBanP: pbP.ma };
}

async function idNguoi(db: Db, ds: NguoiMau[]): Promise<Map<string, string>> {
	const rows = await db.user.findMany({
		where: { email: { in: ds.map((n) => thuMau(n.ma)) } },
		select: { id: true, email: true },
	});
	const theoThu = new Map(rows.map((r) => [r.email, r.id]));
	return new Map(
		ds.map((n) => {
			const id = theoThu.get(thuMau(n.ma));
			if (!id)
				throw new LoiBoMau(
					OKR_MAU.ma.sai,
					`Ca Họp tuần: không có người mẫu ${n.ma} — nạp bộ mẫu trước.`,
				);
			return [n.ma, id];
		}),
	);
}

async function chuKyMau(db: Db, ma: string) {
	return db.okrCycle.findUniqueOrThrow({
		where: { id: idMau("chu-ky", ma) },
		select: { id: true, startsOn: true, endsOn: true, updateWeekday: true },
	});
}

async function guiLan(
	dv: DichVu,
	nguoi: string,
	muc: { keyResultId: string; value: number; confidence: MucTuTin }[],
) {
	const { sessionId } = await dv.capNhat.moCapNhat(
		nguoi,
		moCapNhatInput.parse({ entry: CA.entry }),
	);
	await dv.capNhat.guiCapNhat(
		nguoi,
		guiCapNhatInput.parse({
			sessionId,
			items: muc.map((m) => ({ ...m, note: "" })),
		}),
	);
}

async function dungChuKy(dv: DichVu, db: Db, quanTri: string) {
	const [quy4, namKe] = await Promise.all([
		chuKyMau(db, "quy4"),
		chuKyMau(db, "nam-ke"),
	]);
	const keHoach = await dv.okr.createCycle(
		quanTri,
		createCycleInput.parse({
			kind: "quy",
			name: tenCa("Quý kế hoạch"),
			parentId: namKe.id,
			startsOn: ngayIso(namKe.startsOn),
			endsOn: ngayIso(congNgay(namKe.startsOn, CA.ngayQuy - 1)),
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: CA.thuCapNhat,
		}),
	);
	const batDau = congNgay(quy4.startsOn, -CA.lechNgayBatDau);
	const nam = await dv.okr.createCycle(
		quanTri,
		createCycleInput.parse({
			kind: "nam",
			name: tenCa("Năm"),
			parentId: null,
			startsOn: ngayIso(batDau),
			endsOn: ngayIso(congNgay(batDau, CA.ngayNam - 1)),
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: CA.thuCapNhat,
		}),
	);
	const con = await dv.okr.createCycle(
		quanTri,
		createCycleInput.parse({
			kind: "quy",
			name: tenCa("Quý con"),
			parentId: nam.id,
			startsOn: ngayIso(batDau),
			endsOn: ngayIso(quy4.endsOn),
			breakStartsOn: null,
			breakEndsOn: null,
			updateWeekday: quy4.updateWeekday,
		}),
	);
	await dv.okr.setCyclePhase(quanTri, con.id, "dang-chay");
	return { quy4: quy4.id, con: con.id, keHoach: keHoach.id };
}

async function dungPhongBan(
	dv: DichVu,
	ten: string,
	truong: string,
): Promise<string> {
	const pb = await dv.toChuc.createDepartment(
		orgDepartmentCreateInput.parse({ name: tenCa(ten), divisionId: null }),
	);
	await dv.toChuc.addPeople({ departmentId: pb.id, userIds: [truong] });
	await dv.toChuc.setHead({ kind: "department", id: pb.id, userId: truong });
	return pb.id;
}

async function dungDonViCoKr(dv: DichVu, chuKy: string, chu: string[]) {
	const [dau] = CA.tenDonVi;
	if (tenCa(dau).length !== CA.tenDaiKyTu)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Ca Họp tuần: tên đơn vị dài phải đúng ${CA.tenDaiKyTu} ký tự, đang ${tenCa(dau).length}.`,
		);
	for (const [i, ten] of CA.tenDonVi.entries()) {
		const nguoi = chu[i];
		if (!nguoi) throw new LoiBoMau(OKR_MAU.ma.sai, "Ca Họp tuần thiếu chủ KR.");
		const pb = await dungPhongBan(dv, ten, nguoi);
		const mt = await dv.okr.createObjective(
			nguoi,
			createObjectiveInput.parse({
				cycleId: chuKy,
				unit: { level: "phong-ban", departmentId: pb },
				title: `Tăng hiệu quả của ${ten}`,
				kind: "cam-ket",
				ownerUserId: nguoi,
				participantIds: [],
				whyNow: "",
			}),
		);
		const krs: string[] = [];
		for (let k = 0; k < CA.soKrMoiDonVi; k += 1) {
			const kr = await dv.okr.createKeyResult(
				nguoi,
				createKrInput.parse({
					objectiveId: mt.id,
					title: `${ten} đạt chỉ tiêu ${k + 1}`,
					kind: "tang-toi",
					ownerUserId: nguoi,
					startValue: 0,
					targetValue: CA.dich,
					currentValue: 0,
					unit: "",
					dueOn: null,
					weight: 1,
				}),
			);
			krs.push(kr.id);
		}
		await dv.okr.publishObjective(nguoi, mt.id);
		const soGui = i % (CA.soKrMoiDonVi + 1);
		if (soGui > 0)
			await guiLan(
				dv,
				nguoi,
				krs.slice(0, soGui).map((keyResultId, j) => ({
					keyResultId,
					value: CA.giaTri,
					confidence: MUC_XEN[(i + j) % MUC_XEN.length] ?? "vua",
				})),
			);
	}
}

async function capNhatBoP(
	dv: DichVu,
	db: Db,
	truong: string,
	chuKy: string,
	maPhongBan: string,
) {
	const kr = await db.okrKeyResult.findFirst({
		where: {
			source: "tay",
			objective: {
				cycleId: chuKy,
				departmentId: idMau("pb", maPhongBan),
				level: "phong-ban",
				status: "cong-bo",
			},
		},
		orderBy: [{ objective: { position: "asc" } }, { position: "asc" }],
		select: { id: true, currentValue: true },
	});
	if (!kr)
		throw new LoiBoMau(
			OKR_MAU.ma.sai,
			`Ca Họp tuần: ${maPhongBan} không có KR nhập tay đã công bố trong quý 4 mẫu.`,
		);
	await guiLan(dv, truong, [
		{
			keyResultId: kr.id,
			value: Number(kr.currentValue),
			confidence: "vua",
		},
	]);
}

async function dungUngDung(): Promise<INestApplicationContext> {
	const { NestFactory } = await import("@nestjs/core");
	const { AppModule } = await import("../../src/app.module");
	return NestFactory.createApplicationContext(AppModule, {
		logger: ["error", "warn"],
	});
}

async function layDichVu(app: INestApplicationContext): Promise<DichVu> {
	const [{ OkrService }, { OkrCapNhatService }, { ToChucService }] =
		await Promise.all([
			import("../../src/okr/okr.service"),
			import("../../src/okr/okr-cap-nhat.service"),
			import("../../src/to-chuc/to-chuc.service"),
		]);
	return {
		okr: app.get(OkrService, { strict: false }),
		capNhat: app.get(OkrCapNhatService, { strict: false }),
		toChuc: app.get(ToChucService, { strict: false }),
	};
}

export async function napCaHopTuan(
	db: Db,
	bo: BoOkrMau,
): Promise<KetQuaCaHopTuan> {
	const vai = chonVai(bo);
	const id = await idNguoi(db, [
		vai.p,
		vai.m,
		vai.a,
		vai.truongRong,
		...vai.chu,
	]);
	const ma = (n: NguoiMau) => id.get(n.ma) ?? "";
	const app = await dungUngDung();
	try {
		const dv = await layDichVu(app);
		const quanTri = ma(vai.a);
		const ky = await dungChuKy(dv, db, quanTri);
		await dungDonViCoKr(dv, ky.con, vai.chu.map(ma));
		const boRong = await dungPhongBan(dv, CA.tenRong, ma(vai.truongRong));
		await capNhatBoP(dv, db, ma(vai.p), ky.quy4, vai.maPhongBanP);
		return {
			truongP: thuMau(vai.p.ma),
			thanhVienM: thuMau(vai.m.ma),
			quanTriA: thuMau(vai.a.ma),
			boP: `pb:${idMau("pb", vai.maPhongBanP)}`,
			boRong: `pb:${boRong}`,
			chuKyCon: ky.con,
			chuKyKeHoach: ky.keHoach,
		};
	} finally {
		await app.close();
	}
}
