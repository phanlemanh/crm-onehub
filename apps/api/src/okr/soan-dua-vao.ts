import type { Prisma } from "@crm/db";
import type { CuocSoan } from "@crm/db/okr-cuoc-soan";
import type { NguCanhXem } from "@crm/db/okr-hien-thi";
import { daNhanDeXuat } from "@crm/db/okr-tro-ly-danh-muc";
import { PHA_CHU_KY } from "@crm/validation/okr-chu-ky";
import type { SoanDuaVaoInput } from "@crm/validation/okr-cuoc-soan";
import type { DonViMucTieu } from "@crm/validation/okr-muc-tieu";
import type { DongSoan } from "@crm/validation/okr-tro-ly";
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { z } from "zod";
import type { SoanDuaVaoOutput } from "./okr.contracts";
import { donViCua, type OkrService } from "./okr.service";
import { OKR } from "./okr-config";
import {
	chaTuChoi,
	type DongDoc,
	type DongMucTieu,
	docMoiDong,
	laMucTieu,
	tapHien,
} from "./soan-ban-nhap";
import { ghiChuVetSoan } from "./soan-vet";

type Tx = Prisma.TransactionClient;
type TuChoi = Extract<SoanDuaVaoOutput, { ok: false }>;
type Hoac<T> = ({ ok: true } & T) | TuChoi;
type DongKr = DongDoc & { dong: Extract<DongSoan, { loai: "kr-moi" }> };
type DongCanChinh = DongDoc & {
	dong: Extract<DongSoan, { loai: "can-chinh-moi" }>;
};
type SoNguoiGo = SoanDuaVaoInput["kr"][number];
type KrDuaVao = { dong: DongKr; so: { khoiDiem: number; dich: number } };
type MucDuaVao = {
	dong: DongMucTieu;
	kr: KrDuaVao[];
	canChinh: DongCanChinh[];
};

const T = OKR.thongDiep.soan;
const phaChuKy = z.enum(PHA_CHU_KY);
const SO_MOC = {
	khoiDiem: OKR.mau.moc.startValue,
	dich: OKR.mau.moc.targetValue,
};

const daNhan = (d: DongDoc) => daNhanDeXuat(d.hang.trangThai);
const laKr = (d: DongDoc): d is DongKr => d.dong.loai === "kr-moi";
const laCanChinh = (d: DongDoc): d is DongCanChinh =>
	d.dong.loai === "can-chinh-moi";
const tenCua = (d: DongMucTieu | DongKr) => d.hang.giaTriCuoi ?? d.dong.ten;

function chaCua(
	ds: readonly DongDoc[],
	hien: readonly DongDoc[],
	con: DongKr | DongCanChinh,
): Hoac<{ cha: DongMucTieu }> {
	const { chaKhoa } = con.dong;
	const cha = hien
		.filter(laMucTieu)
		.filter((d) => d.dong.khoa === chaKhoa)
		.at(-1);
	if (cha && daNhan(cha)) return { ok: true, cha };
	if (cha?.hang.trangThai === "cho")
		return {
			ok: false,
			lyDo: "cha-chua-nhan",
			chiTiet: T.chaChuaNhan(cha.dong.ten),
		};
	return (
		chaTuChoi(ds, hien, con, chaKhoa) ?? {
			ok: false,
			lyDo: "khong-co-cha",
			chiTiet: T.khongCoCha(chaKhoa),
		}
	);
}

function krCoSo(
	kr: readonly DongKr[],
	vao: readonly SoNguoiGo[],
): Hoac<{ kr: KrDuaVao[] }> {
	const theoId = new Map(kr.map((k) => [k.hang.id, k]));
	const so = new Map<string, SoNguoiGo>();
	for (const s of vao) {
		const k = theoId.get(s.deXuatId);
		if (!k) throw new BadRequestException(T.soKrLa(s.deXuatId));
		if (k.dong.kieu === "moc")
			throw new BadRequestException(T.mocKhongNhanSo(tenCua(k)));
		so.set(s.deXuatId, s);
	}
	const ra: KrDuaVao[] = [];
	for (const k of kr) {
		const s = k.dong.kieu === "moc" ? SO_MOC : so.get(k.hang.id);
		if (!s)
			return {
				ok: false,
				lyDo: "thieu-so-kr",
				chiTiet: T.thieuSoKr(tenCua(k)),
			};
		ra.push({ dong: k, so: { khoiDiem: s.khoiDiem, dich: s.dich } });
	}
	return { ok: true, kr: ra };
}

function keHoachDuaVao(
	ds: readonly DongDoc[],
	cuoc: CuocSoan,
	vao: readonly SoNguoiGo[],
): Hoac<{ mucTieu: MucDuaVao[] }> {
	const hien = tapHien(ds, cuoc);
	const nhan = hien.filter(daNhan);
	const mucTieu = nhan.filter(laMucTieu);
	if (mucTieu.length === 0) throw new BadRequestException(T.khongCoDongNhan);
	const con = nhan.filter(
		(d): d is DongKr | DongCanChinh => laKr(d) || laCanChinh(d),
	);
	const chaTheoCon = new Map<string, DongMucTieu>();
	for (const c of con) {
		const kq = chaCua(ds, hien, c);
		if (!kq.ok) return kq;
		chaTheoCon.set(c.hang.id, kq.cha);
	}
	const so = krCoSo(con.filter(laKr), vao);
	if (!so.ok) return so;
	const cua = (m: DongMucTieu) => (c: DongDoc) =>
		chaTheoCon.get(c.hang.id) === m;
	return {
		ok: true,
		mucTieu: mucTieu.map((m) => ({
			dong: m,
			kr: so.kr.filter((k) => cua(m)(k.dong)),
			canChinh: con.filter(laCanChinh).filter(cua(m)),
		})),
	};
}

function donViMucTieu(cuoc: CuocSoan): DonViMucTieu {
	if (cuoc.level === "onehub") return { level: "onehub" };
	if (cuoc.level === "bo-phan")
		return { level: "bo-phan", divisionId: cuoc.divisionId ?? "" };
	return { level: "phong-ban", departmentId: cuoc.departmentId ?? "" };
}

async function phaCuaKy(tx: Tx, cycleId: string) {
	await tx.$queryRaw`SELECT id FROM "okrCycle" WHERE id = ${cycleId} FOR SHARE`;
	const ky = await tx.okrCycle.findUnique({
		where: { id: cycleId },
		select: { phase: true },
	});
	if (!ky) throw new NotFoundException(OKR.thongDiep.khongCoChuKy(cycleId));
	return phaChuKy.parse(ky.phase);
}

export async function duaVaoTrong(
	tx: Tx,
	okr: OkrService,
	v: {
		cuoc: CuocSoan;
		userId: string;
		nc: NguCanhXem;
		kr: readonly SoNguoiGo[];
		now: Date;
	},
): Promise<SoanDuaVaoOutput> {
	const { cuoc, userId } = v;
	if (cuoc.trangThai !== "dang")
		return {
			ok: false,
			lyDo: "cuoc-khong-dang",
			chiTiet:
				cuoc.trangThai === "da-dua-vao" ? T.duaVaoHaiLan : T.cuocKhongDang,
		};
	if ((await phaCuaKy(tx, cuoc.cycleId)) !== "lap-ke-hoach")
		return {
			ok: false,
			lyDo: "chu-ky-khong-lap-ke-hoach",
			chiTiet: T.kyKhongLapKeHoach,
		};
	const keHoach = keHoachDuaVao(await docMoiDong(tx, cuoc.id), cuoc, v.kr);
	if (!keHoach.ok) return keHoach;
	const unit = donViMucTieu(cuoc);
	const vuot = await okr.kiemTranMucTieu(
		tx,
		cuoc.cycleId,
		donViCua(unit),
		keHoach.mucTieu.length,
		"canh-bao",
	);
	if (vuot !== null)
		return {
			ok: false,
			lyDo: "vuot-tran-muc-tieu",
			chiTiet: T.vuotTranMucTieu((await okr.program(tx)).objectiveCap),
		};
	const note = (d: DongDoc) => ghiChuVetSoan(cuoc.id, d.hang.id);
	const nguoiGo = new Map(v.kr.map((s) => [s.deXuatId, s]));
	const soNguoiGo = (d: DongDoc) => {
		const go = nguoiGo.get(d.hang.id);
		return {
			soNguoiGoKhoiDiem: go?.khoiDiem ?? null,
			soNguoiGoDich: go?.dich ?? null,
		};
	};
	const ghiTaoRa = (d: DongDoc, taoRaId: string) =>
		tx.okrDeXuat.update({ where: { id: d.hang.id }, data: { taoRaId } });
	const mucTieuIds: string[] = [];
	let soKr = 0;
	for (const m of keHoach.mucTieu) {
		const { id } = await okr.taoMucTieuTrongTx(
			tx,
			userId,
			{
				cycleId: cuoc.cycleId,
				unit,
				title: tenCua(m.dong),
				kind: m.dong.dong.loaiMucTieu,
				ownerUserId: userId,
				participantIds: [],
				whyNow: m.dong.dong.viSaoLucNay,
				hienThi: "cong-khai",
			},
			{},
			{ note: note(m.dong) },
		);
		await ghiTaoRa(m.dong, id);
		mucTieuIds.push(id);
		const mt = { id, cycleId: cuoc.cycleId };
		for (const k of m.kr) {
			const kr = await okr.createKeyResult(
				userId,
				{
					objectiveId: id,
					title: tenCua(k.dong),
					kind: k.dong.dong.kieu,
					ownerUserId: userId,
					startValue: k.so.khoiDiem,
					targetValue: k.so.dich,
					currentValue: k.so.khoiDiem,
					unit: k.dong.dong.donVi,
					dueOn: null,
					weight: OKR.mau.trongSoKr,
				},
				{ tx, mt, note: note(k.dong), sauThem: soNguoiGo(k.dong) },
			);
			await ghiTaoRa(k.dong, kr.id);
			soKr += 1;
		}
		for (const c of m.canChinh) {
			const g = await okr.addAlignmentTrong(
				tx,
				userId,
				{
					objectiveId: id,
					targetObjectiveId: c.dong.targetObjectiveId,
					targetKeyResultId: c.dong.targetKeyResultId,
				},
				{
					note: note(c),
					daQuaCong: { nguon: { ...mt, level: cuoc.level }, nc: v.nc },
				},
			);
			await ghiTaoRa(c, g.id);
		}
	}
	const { count } = await tx.okrCuocSoan.updateMany({
		where: { id: cuoc.id, trangThai: "dang" },
		data: { trangThai: "da-dua-vao", duaVaoLuc: v.now },
	});
	if (count === 0) throw new ConflictException(T.duaVaoHaiLan);
	return {
		ok: true,
		mucTieuIds,
		soMucTieu: mucTieuIds.length,
		soKr,
	};
}
