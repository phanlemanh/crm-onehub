import { buocCuaViec, chieuLenBuoc } from "./buoc-viec-chieu";
import { Prisma } from "./generated/prisma/client";
import { ActivityType, TrangThaiViec } from "./generated/prisma/enums";
import { docDuocDoiTac } from "./vai-doi-tac";
import {
	type BanGhiGan,
	type BanGhiVet,
	banGhiCua,
	CHON_GAN,
	cotGan,
	DO_THI,
	dieuKienViecMoCua,
	dieuKienXemViec,
	hanhDong,
	hanTheoNgayVN,
	laMoLai,
	type NguoiVet,
	type NguonViec,
	ngayHan,
	parseViecCanLamMeta,
	quyenDoi,
	roiChuaLamMoi,
	TRANG_THAI_KHEP,
	TRANG_THAI_MO,
	tenKeHoach,
	type VetViec,
	VIEC,
	vaiCua,
} from "./viec";
import { khoaGiua, khoaLienTiep } from "./viec-thu-tu";
import { WORKSPACE_ID } from "./workspace";
import type { DbGhi } from "./zalo-lien-ket";

export type MaLoiViec =
	| "khong-thay"
	| "khong-hop-le"
	| "khong-quyen"
	| "nguoi-nhan"
	| "co-lich-su"
	| "ban-ghi";

export class LoiViec extends Error {
	constructor(
		readonly ma: MaLoiViec,
		message: string,
	) {
		super(message);
		this.name = "LoiViec";
	}
}

export type DauGhi = {
	viecId: string;
	nguoiId: string;
	nguon: NguonViec;
	now: Date;
};

export type TaoViecInput = {
	nguoiId: string;
	tieuDe: string;
	moTa?: string | null;
	hanNgay?: Date | null;
	nguoiThucHienId?: string;
	nguoiTheoDoiIds?: string[];
	gan: BanGhiGan[];
	nguon: NguonViec;
	khoaNguon?: string | null;
	now: Date;
};

export type DoiTrangThaiInput = DauGhi & { den: TrangThaiViec };

export type SuaViecInput = DauGhi & {
	tieuDe?: string;
	moTa?: string | null;
	hanNgay?: Date | null;
};

export type DoiNguoiInput = DauGhi & { nguoiThucHienId: string };

export type GhiBanGhiInput = DauGhi & { banGhi: BanGhiGan };

export type TheoDoiInput = DauGhi & { userId: string };

const CHON_GHI = {
	id: true,
	tieuDe: true,
	moTa: true,
	trangThai: true,
	hanNgay: true,
	nguoiGiaoId: true,
	nguoiThucHienId: true,
	roiChuaLamLuc: true,
	nguoiGiao: { select: { id: true, name: true } },
	nguoiThucHien: { select: { id: true, name: true } },
	theoDoi: { select: { userId: true } },
	_count: { select: { gan: true } },
} as const satisfies Prisma.ViecSelect;

type ViecGhi = Prisma.ViecGetPayload<{ select: typeof CHON_GHI }>;

function nguoiCua(n: { id: string; name: string }): NguoiVet {
	return { id: n.id, ten: n.name };
}

export async function ghiVetViec(
	tx: DbGhi,
	dau: { viecId: string; nguoiId: string | null; nguon: NguonViec; luc: Date },
	vet: VetViec,
): Promise<void> {
	await tx.viecVet.create({
		data: {
			viecId: dau.viecId,
			nguoiId: dau.nguoiId,
			nguon: dau.nguon,
			luc: dau.luc,
			loai: vet.loai,
			truoc: vet.truoc ?? Prisma.DbNull,
			sau: vet.sau ?? Prisma.DbNull,
		},
	});
}

function dauVet(input: DauGhi) {
	return {
		viecId: input.viecId,
		nguoiId: input.nguoiId,
		nguon: input.nguon,
		luc: input.now,
	};
}

async function docViecGhi(
	tx: DbGhi,
	viecId: string,
	nguoiId: string,
): Promise<ViecGhi> {
	await tx.$queryRaw`SELECT id FROM viec WHERE id = ${viecId} FOR UPDATE`;
	const viec = await tx.viec.findFirst({
		where: { AND: [{ id: viecId }, dieuKienXemViec(nguoiId)] },
		select: CHON_GHI,
	});
	if (viec === null) {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(viecId));
	}
	return viec;
}

// Ba thao tác làm bước mồ côi hay kẹt «Bước x/y» (Huỷ, xoá, gỡ khỏi kế hoạch) bị chặn trên Việc
// của một bước; đường đúng là gỡ bước ở kế hoạch (design 2026-10-14 mục 5).
async function chanViecCuaBuoc(tx: DbGhi, viecId: string): Promise<void> {
	if ((await buocCuaViec(tx, viecId)) !== null) {
		throw new LoiViec("khong-hop-le", VIEC.thongDiep.goBuocOKeHoach);
	}
}

export async function kiemNguoiNhanViec(
	tx: DbGhi,
	userId: string,
): Promise<NguoiVet> {
	const nguoi = await tx.user.findFirst({
		where: { id: userId, members: { some: { organizationId: WORKSPACE_ID } } },
		select: {
			id: true,
			name: true,
			members: {
				where: { organizationId: WORKSPACE_ID },
				select: { role: true },
			},
		},
	});
	if (nguoi === null) {
		throw new LoiViec("nguoi-nhan", VIEC.thongDiep.khongPhaiThanhVien(userId));
	}
	if (!nguoi.members.some((m) => docDuocDoiTac(m.role))) {
		throw new LoiViec("nguoi-nhan", VIEC.thongDiep.vaiChiOkr(nguoi.name));
	}
	return { id: nguoi.id, ten: nguoi.name };
}

async function docBanGhi(tx: DbGhi, b: BanGhiGan): Promise<BanGhiVet> {
	const loi = () =>
		new LoiViec("ban-ghi", VIEC.thongDiep.khongCoBanGhi(b.loai, b.id));
	switch (b.loai) {
		case "company": {
			const r = await tx.company.findUnique({
				where: { id: b.id },
				select: { name: true },
			});
			if (!r) throw loi();
			return { ...b, ten: r.name };
		}
		case "contact": {
			const r = await tx.contact.findUnique({
				where: { id: b.id },
				select: { firstName: true, lastName: true },
			});
			if (!r) throw loi();
			return {
				...b,
				ten: [r.firstName, r.lastName].filter(Boolean).join(" "),
			};
		}
		case "deal": {
			const r = await tx.deal.findUnique({
				where: { id: b.id },
				select: { name: true },
			});
			if (!r) throw loi();
			return { ...b, ten: r.name };
		}
		case "plan": {
			const r = await tx.onboardingPlan.findUnique({
				where: { id: b.id },
				select: { company: { select: { name: true } } },
			});
			if (!r) throw loi();
			return { ...b, ten: tenKeHoach(r.company.name) };
		}
	}
}

export async function taoViec(
	tx: DbGhi,
	input: TaoViecInput,
): Promise<{ id: string }> {
	const nguoiThucHien = await kiemNguoiNhanViec(
		tx,
		input.nguoiThucHienId ?? input.nguoiId,
	);
	const nguoiTheoDoi: NguoiVet[] = [];
	for (const id of new Set(input.nguoiTheoDoiIds ?? [])) {
		nguoiTheoDoi.push(await kiemNguoiNhanViec(tx, id));
	}
	const ganDung: BanGhiVet[] = [];
	for (const b of input.gan) ganDung.push(await docBanGhi(tx, b));
	const viec = await tx.viec.create({
		data: {
			tieuDe: input.tieuDe,
			moTa: input.moTa ?? null,
			hanNgay: input.hanNgay ?? null,
			nguoiGiaoId: input.nguoiId,
			nguoiThucHienId: nguoiThucHien.id,
			taoBoiId: input.nguoiId,
			taoLuc: input.now,
			khoaNguon: input.khoaNguon ?? null,
		},
		select: { id: true },
	});
	for (const b of ganDung) {
		await tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(b) } });
	}
	for (const n of nguoiTheoDoi) {
		await tx.viecTheoDoi.create({ data: { viecId: viec.id, userId: n.id } });
	}
	await ghiVetViec(
		tx,
		{
			viecId: viec.id,
			nguoiId: input.nguoiId,
			nguon: input.nguon,
			luc: input.now,
		},
		{
			loai: "tao",
			truoc: null,
			sau: {
				tieuDe: input.tieuDe,
				nguoiThucHien,
				hanNgay: input.hanNgay ? ngayHan(input.hanNgay) : null,
				banGhi: ganDung,
				nguoiTheoDoi,
			},
		},
	);
	return viec;
}

export async function doiTrangThai(
	tx: DbGhi,
	input: DoiTrangThaiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (input.den === TrangThaiViec.HUY) await chanViecCuaBuoc(tx, viec.id);
	const vai = vaiCua(viec, input.nguoiId);
	const ket = quyenDoi(viec.trangThai, input.den, vai);
	if (ket === "khong-hop-le") {
		throw new LoiViec(
			"khong-hop-le",
			VIEC.thongDiep.khongChuyenDuoc(viec.trangThai, input.den),
		);
	}
	if (ket === "khong-quyen") {
		const lam = hanhDong(viec.trangThai, input.den);
		const chiG = DO_THI[viec.trangThai][input.den] === "G";
		throw new LoiViec(
			"khong-quyen",
			chiG
				? VIEC.thongDiep.chiNguoiGiao(lam)
				: VIEC.thongDiep.chiGiaoVaThucHien(lam),
		);
	}
	if (laMoLai(viec.trangThai, input.den)) {
		await kiemNguoiNhanViec(tx, viec.nguoiThucHienId);
	}
	const roiChuaLam = roiChuaLamMoi(viec, input.nguoiId, input.den);
	await tx.viec.update({
		where: { id: viec.id },
		data: {
			trangThai: input.den,
			khepLuc: TRANG_THAI_KHEP.includes(input.den) ? input.now : null,
			roiChuaLamLuc: roiChuaLam ? input.now : undefined,
		},
	});
	await ghiVetViec(tx, dauVet(input), {
		loai: "doi-trang-thai",
		truoc: { trangThai: viec.trangThai },
		sau: { trangThai: input.den },
	});
	await chieuLenBuoc(tx, viec.id);
}

export async function suaViec(tx: DbGhi, input: SuaViecInput): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	const vai = vaiCua(viec, input.nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec(
			"khong-quyen",
			VIEC.thongDiep.chiGiaoVaThucHien(VIEC.lam.sua),
		);
	}
	if (input.hanNgay === null && (await buocCuaViec(tx, viec.id)) !== null) {
		throw new LoiViec("khong-hop-le", VIEC.thongDiep.buocLuonCoHan);
	}
	const tieuDe = input.tieuDe ?? viec.tieuDe;
	const moTa = input.moTa === undefined ? viec.moTa : input.moTa;
	const hanCu = viec.hanNgay ? ngayHan(viec.hanNgay) : null;
	const hanMoi =
		input.hanNgay === undefined
			? hanCu
			: input.hanNgay
				? ngayHan(input.hanNgay)
				: null;
	const doiNoiDung = tieuDe !== viec.tieuDe || moTa !== viec.moTa;
	if (!doiNoiDung && hanMoi === hanCu) return;
	await tx.viec.update({
		where: { id: viec.id },
		data: { tieuDe, moTa, hanNgay: input.hanNgay },
	});
	if (doiNoiDung) {
		await ghiVetViec(tx, dauVet(input), {
			loai: "doi-noi-dung",
			truoc: { tieuDe: viec.tieuDe, moTa: viec.moTa },
			sau: { tieuDe, moTa },
		});
	}
	if (hanMoi !== hanCu) {
		await ghiVetViec(tx, dauVet(input), {
			loai: "doi-han",
			truoc: { hanNgay: hanCu },
			sau: { hanNgay: hanMoi },
		});
	}
	await chieuLenBuoc(tx, viec.id);
}

export async function doiNguoiThucHien(
	tx: DbGhi,
	input: DoiNguoiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (!vaiCua(viec, input.nguoiId).giao) {
		throw new LoiViec(
			"khong-quyen",
			VIEC.thongDiep.chiNguoiGiao(VIEC.lam.doiNguoi),
		);
	}
	if (viec.nguoiThucHienId === input.nguoiThucHienId) return;
	const moi = await kiemNguoiNhanViec(tx, input.nguoiThucHienId);
	await tx.viec.update({
		where: { id: viec.id },
		data: { nguoiThucHienId: moi.id },
	});
	await ghiVetViec(tx, dauVet(input), {
		loai: "doi-nguoi-thuc-hien",
		truoc: nguoiCua(viec.nguoiThucHien),
		sau: moi,
	});
	await chieuLenBuoc(tx, viec.id);
}

function nguoiTrongViec(viec: ViecGhi): string[] {
	return [viec.nguoiThucHienId, ...viec.theoDoi.map((t) => t.userId)];
}

function canGiaoHayLam(viec: ViecGhi, nguoiId: string, lam: string): void {
	const vai = vaiCua(viec, nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec("khong-quyen", VIEC.thongDiep.chiGiaoVaThucHien(lam));
	}
}

export async function ganBanGhi(
	tx: DbGhi,
	input: GhiBanGhiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	canGiaoHayLam(viec, input.nguoiId, VIEC.lam.gan);
	const ban = await docBanGhi(tx, input.banGhi);
	const co = await tx.viecGan.findFirst({
		where: { viecId: viec.id, ...cotGan(input.banGhi) },
	});
	if (co) return;
	for (const ma of nguoiTrongViec(viec)) {
		await kiemNguoiNhanViec(tx, ma);
	}
	await tx.viecGan.create({
		data: { viecId: viec.id, ...cotGan(input.banGhi) },
	});
	await ghiVetViec(tx, dauVet(input), { loai: "gan", truoc: null, sau: ban });
}

export async function goBanGhi(
	tx: DbGhi,
	input: GhiBanGhiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	canGiaoHayLam(viec, input.nguoiId, VIEC.lam.gan);
	if (input.banGhi.loai === "plan") await chanViecCuaBuoc(tx, viec.id);
	const co = await tx.viecGan.findFirst({
		where: { viecId: viec.id, ...cotGan(input.banGhi) },
		select: CHON_GAN,
	});
	if (!co) return;
	await tx.viecGan.delete({ where: { id: co.id } });
	await ghiVetViec(tx, dauVet(input), {
		loai: "go",
		truoc: banGhiCua(co),
		sau: null,
	});
}

export async function themTheoDoi(
	tx: DbGhi,
	input: TheoDoiInput,
): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (input.userId !== input.nguoiId) {
		canGiaoHayLam(viec, input.nguoiId, VIEC.lam.theoDoiKhac);
	}
	if (viec.theoDoi.some((t) => t.userId === input.userId)) return;
	const nguoi = await kiemNguoiNhanViec(tx, input.userId);
	await tx.viecTheoDoi.create({ data: { viecId: viec.id, userId: nguoi.id } });
	await ghiVetViec(tx, dauVet(input), {
		loai: "theo-doi",
		truoc: null,
		sau: nguoi,
	});
}

export async function boTheoDoi(tx: DbGhi, input: TheoDoiInput): Promise<void> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (input.userId !== input.nguoiId) {
		canGiaoHayLam(viec, input.nguoiId, VIEC.lam.theoDoiKhac);
	}
	const hang = await tx.viecTheoDoi.findFirst({
		where: { viecId: viec.id, userId: input.userId },
		select: { id: true, user: { select: { id: true, name: true } } },
	});
	if (!hang) return;
	await tx.viecTheoDoi.delete({ where: { id: hang.id } });
	await ghiVetViec(tx, dauVet(input), {
		loai: "bo-theo-doi",
		truoc: nguoiCua(hang.user),
		sau: null,
	});
}

export async function coLichSu(tx: DbGhi, viecId: string): Promise<boolean> {
	const so = await tx.viecVet.count({
		where: { viecId, loai: { not: "tao" } },
	});
	return so > 0;
}

export async function xoaViec(
	tx: DbGhi,
	input: { viecId: string; nguoiId: string },
): Promise<{ id: string }> {
	const viec = await docViecGhi(tx, input.viecId, input.nguoiId);
	if (!vaiCua(viec, input.nguoiId).giao) {
		throw new LoiViec("khong-quyen", VIEC.thongDiep.chiNguoiGiao(VIEC.lam.xoa));
	}
	await chanViecCuaBuoc(tx, viec.id);
	if (await coLichSu(tx, viec.id)) {
		throw new LoiViec("co-lich-su", VIEC.thongDiep.coLichSu);
	}
	await tx.viec.delete({ where: { id: viec.id } });
	return { id: viec.id };
}

export async function chuyenViecTrongGiaoDich(
	tx: DbGhi,
	input: { tuId: string; den: NguoiVet; nguoiId: string; now: Date },
): Promise<number> {
	const ds = await tx.viec.findMany({
		where: dieuKienViecMoCua(input.tuId),
		orderBy: { id: "asc" },
		select: {
			id: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			nguoiGiao: { select: { id: true, name: true } },
			nguoiThucHien: { select: { id: true, name: true } },
		},
	});
	for (const v of ds) {
		const nguoiThucHienMoi =
			v.nguoiThucHienId === input.tuId ? input.den.id : v.nguoiThucHienId;
		const nguoiGiaoMoi =
			v.nguoiGiaoId === input.tuId ? input.den.id : v.nguoiGiaoId;
		await tx.viec.update({
			where: { id: v.id },
			data: { nguoiThucHienId: nguoiThucHienMoi, nguoiGiaoId: nguoiGiaoMoi },
		});
		const truoc = {
			nguoiGiao: nguoiCua(v.nguoiGiao),
			nguoiThucHien: nguoiCua(v.nguoiThucHien),
		};
		await ghiVetViec(
			tx,
			{
				viecId: v.id,
				nguoiId: input.nguoiId,
				nguon: "chuyen-viec",
				luc: input.now,
			},
			{
				loai: "chuyen-viec",
				truoc,
				sau: {
					nguoiGiao:
						nguoiGiaoMoi === input.den.id ? input.den : truoc.nguoiGiao,
					nguoiThucHien:
						nguoiThucHienMoi === input.den.id ? input.den : truoc.nguoiThucHien,
				},
			},
		);
		await chieuLenBuoc(tx, v.id);
	}
	return ds.length;
}

export async function goTheoDoiCuaNguoi(
	tx: DbGhi,
	userId: string,
	now: Date,
): Promise<number> {
	const hang = await tx.viecTheoDoi.findMany({
		where: { userId },
		select: {
			id: true,
			viecId: true,
			user: { select: { id: true, name: true } },
		},
	});
	for (const h of hang) {
		await tx.viecTheoDoi.delete({ where: { id: h.id } });
		await ghiVetViec(
			tx,
			{ viecId: h.viecId, nguoiId: null, nguon: "api", luc: now },
			{ loai: "bo-theo-doi", truoc: nguoiCua(h.user), sau: null },
		);
	}
	return hang.length;
}

export async function ghiGoDoXoa(
	tx: DbGhi,
	where: Prisma.ViecGanWhereInput,
	now: Date,
): Promise<number> {
	const hang = await tx.viecGan.findMany({ where, select: CHON_GAN });
	for (const g of hang) {
		const ban = banGhiCua(g);
		await ghiVetViec(
			tx,
			{ viecId: g.viecId, nguoiId: null, nguon: "api", luc: now },
			{ loai: "go-do-ban-ghi-xoa", truoc: ban, sau: { ten: ban.ten } },
		);
	}
	return hang.length;
}

const CHON_VIEC_CAN_LAM = {
	id: true,
	type: true,
	subject: true,
	body: true,
	dueAt: true,
	completedAt: true,
	createdAt: true,
	companyId: true,
	contactId: true,
	dealId: true,
	planId: true,
	meta: true,
	createdBy: { select: { id: true, name: true } },
	viecChep: { select: { id: true } },
} as const satisfies Prisma.ActivitySelect;

function tieuDeCu(subject: string | null, body: string | null): string {
	const tuSubject = subject?.trim();
	if (tuSubject) return tuSubject.slice(0, VIEC.tieuDeToiDa);
	const dong = body
		?.split("\n")
		.map((d) => d.trim())
		.find((d) => d.length > 0);
	return dong ? dong.slice(0, VIEC.tieuDeToiDa) : VIEC.tieuDeViecCanLam;
}

function moTaCu(subject: string | null, body: string | null): string | null {
	if (!subject?.trim()) return null;
	const moTa = body?.trim();
	return moTa ? moTa.slice(0, VIEC.moTaToiDa) : null;
}

function ganCu(goc: {
	companyId: string | null;
	contactId: string | null;
	dealId: string | null;
	planId: string | null;
}): BanGhiGan[] {
	const gan: BanGhiGan[] = [];
	if (goc.dealId) gan.push({ loai: "deal", id: goc.dealId });
	if (goc.planId) gan.push({ loai: "plan", id: goc.planId });
	if (goc.contactId) gan.push({ loai: "contact", id: goc.contactId });
	if (goc.companyId) gan.push({ loai: "company", id: goc.companyId });
	return gan;
}

export async function chepViecCanLam(
	tx: DbGhi,
	input: { activityId: string; nguoiChay: NguoiVet; now: Date },
): Promise<{ id: string } | null> {
	await tx.$queryRaw`SELECT id FROM activity WHERE id = ${input.activityId} FOR UPDATE`;
	const goc = await tx.activity.findUnique({
		where: { id: input.activityId },
		select: CHON_VIEC_CAN_LAM,
	});
	if (goc === null || goc.type !== ActivityType.TASK) {
		throw new LoiViec(
			"khong-thay",
			VIEC.thongDiep.khongCoViec(input.activityId),
		);
	}
	if (goc.viecChep !== null) return null;
	const tacGia = nguoiCua(goc.createdBy);
	const xong = goc.completedAt !== null;
	let nguoi = tacGia;
	let nguoiTaoGoc: NguoiVet | null = null;
	if (!xong) {
		try {
			await kiemNguoiNhanViec(tx, tacGia.id);
		} catch (loi) {
			if (!(loi instanceof LoiViec) || loi.ma !== "nguoi-nhan") throw loi;
			nguoi = input.nguoiChay;
			nguoiTaoGoc = tacGia;
		}
	}
	const ganDung: BanGhiVet[] = [];
	for (const b of ganCu(goc)) ganDung.push(await docBanGhi(tx, b));
	const { platformBrokerId } = parseViecCanLamMeta(goc.meta);
	const tieuDe = tieuDeCu(goc.subject, goc.body);
	const trangThai = xong ? TrangThaiViec.XONG : TrangThaiViec.CHUA_LAM;
	const hanNgay = goc.dueAt ? hanTheoNgayVN(goc.dueAt) : null;
	const viec = await tx.viec.create({
		data: {
			tieuDe,
			moTa: moTaCu(goc.subject, goc.body),
			hanNgay,
			trangThai,
			khepLuc: goc.completedAt,
			nguoiGiaoId: nguoi.id,
			nguoiThucHienId: nguoi.id,
			taoBoiId: tacGia.id,
			taoLuc: goc.createdAt,
			activityGocId: goc.id,
			khoaNguon: platformBrokerId ? VIEC.khoaMaLech(platformBrokerId) : null,
		},
		select: { id: true },
	});
	for (const b of ganDung) {
		await tx.viecGan.create({ data: { viecId: viec.id, ...cotGan(b) } });
	}
	await ghiVetViec(
		tx,
		{
			viecId: viec.id,
			nguoiId: tacGia.id,
			nguon: "chep-cu",
			luc: goc.createdAt,
		},
		{
			loai: "tao",
			truoc: null,
			sau: {
				tieuDe,
				nguoiThucHien: nguoi,
				hanNgay: hanNgay ? ngayHan(hanNgay) : null,
				banGhi: ganDung,
				nguoiTheoDoi: [],
				chep: { activityGocId: goc.id, trangThai, nguoiTaoGoc },
			},
		},
	);
	return viec;
}

export async function xoaBanChep(tx: DbGhi, viecId: string): Promise<void> {
	const tao = await tx.viecVet.findFirst({
		where: { viecId, loai: "tao" },
		select: { nguon: true },
	});
	if (tao === null || tao.nguon !== "chep-cu") {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongPhaiBanChep(viecId));
	}
	await tx.viec.delete({ where: { id: viecId } });
}

export type KeoViecInput = DauGhi & { den: TrangThaiViec; thuTu: string[] };

async function ghiThuTu(
	tx: DbGhi,
	userId: string,
	viecId: string,
	thuTu: string[],
): Promise<void> {
	const thay = await tx.viec.findMany({
		where: { AND: [{ id: { in: thuTu } }, dieuKienXemViec(userId)] },
		select: { id: true },
	});
	const duocThay = new Set(thay.map((v) => v.id));
	const ds = thuTu.filter((id) => duocThay.has(id));
	const viTri = ds.indexOf(viecId);
	if (viTri === -1) return;
	const cu = await tx.viecThuTu.findMany({
		where: { userId, viecId: { in: ds } },
		select: { viecId: true, khoa: true },
	});
	const khoaCu = new Map(cu.map((k) => [k.viecId, k.khoa]));
	const ben = ds.filter((id) => id !== viecId);
	const khoaBen = ben.map((id) => khoaCu.get(id));
	const tangDan = khoaBen.every((k, i) => {
		if (k === undefined) return false;
		const truoc = i === 0 ? null : khoaBen[i - 1];
		return truoc === null || (truoc !== undefined && truoc < k);
	});
	const khoaMoi = new Map<string, string>();
	if (tangDan) {
		const truoc =
			viTri === 0 ? null : (khoaCu.get(ds[viTri - 1] ?? "") ?? null);
		const sau =
			viTri === ds.length - 1
				? null
				: (khoaCu.get(ds[viTri + 1] ?? "") ?? null);
		khoaMoi.set(viecId, khoaGiua(truoc, sau));
	} else {
		const moi = khoaLienTiep(ds.length);
		ds.forEach((id, i) => {
			khoaMoi.set(id, moi[i] ?? "");
		});
	}
	for (const [ma, khoa] of khoaMoi) {
		await tx.viecThuTu.upsert({
			where: { userId_viecId: { userId, viecId: ma } },
			create: { userId, viecId: ma, khoa },
			update: { khoa },
		});
	}
}

export async function keoViec(tx: DbGhi, input: KeoViecInput): Promise<void> {
	const hienTai = await tx.viec.findFirst({
		where: { AND: [{ id: input.viecId }, dieuKienXemViec(input.nguoiId)] },
		select: { trangThai: true },
	});
	if (hienTai === null) {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(input.viecId));
	}
	if (hienTai.trangThai !== input.den) {
		await doiTrangThai(tx, input);
	}
	await ghiThuTu(tx, input.nguoiId, input.viecId, input.thuTu);
}

export type TaoViecConInput = {
	chaId: string;
	nguoiId: string;
	tieuDe: string;
	nguoiThucHienId?: string;
	hanNgay?: Date | null;
	now: Date;
};

export async function taoViecCon(
	tx: DbGhi,
	input: TaoViecConInput,
): Promise<{ id: string }> {
	await tx.$queryRaw`SELECT id FROM viec WHERE id = ${input.chaId} FOR UPDATE`;
	const cha = await tx.viec.findFirst({
		where: { AND: [{ id: input.chaId }, dieuKienXemViec(input.nguoiId)] },
		select: {
			id: true,
			chaId: true,
			trangThai: true,
			nguoiGiaoId: true,
			nguoiThucHienId: true,
			theoDoi: { select: { userId: true } },
			gan: { select: CHON_GAN, orderBy: { taoLuc: "asc" } },
		},
	});
	if (cha === null) {
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(input.chaId));
	}
	const vai = vaiCua(cha, input.nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec(
			"khong-quyen",
			VIEC.thongDiep.chiGiaoVaThucHien(VIEC.lam.themCon),
		);
	}
	if (cha.chaId !== null) {
		throw new LoiViec("khong-hop-le", VIEC.thongDiep.conKhongCoCon);
	}
	if (!TRANG_THAI_MO.includes(cha.trangThai)) {
		throw new LoiViec("khong-hop-le", VIEC.thongDiep.chiThemConKhiMo);
	}
	const nguoiThucHienId = input.nguoiThucHienId ?? input.nguoiId;
	const theoDoi = [cha.nguoiGiaoId, cha.nguoiThucHienId].filter(
		(id) => id !== input.nguoiId && id !== nguoiThucHienId,
	);
	const con = await taoViec(tx, {
		nguoiId: input.nguoiId,
		tieuDe: input.tieuDe,
		hanNgay: input.hanNgay ?? null,
		nguoiThucHienId,
		nguoiTheoDoiIds: [...new Set(theoDoi)],
		gan: cha.gan.map((g) => {
			const b = banGhiCua(g);
			return { loai: b.loai, id: b.id };
		}),
		nguon: "web",
		now: input.now,
	});
	await tx.viec.update({ where: { id: con.id }, data: { chaId: cha.id } });
	await ghiVetViec(
		tx,
		{ viecId: cha.id, nguoiId: input.nguoiId, nguon: "web", luc: input.now },
		{
			loai: "them-viec-con",
			truoc: null,
			sau: { conId: con.id, tieuDe: input.tieuDe },
		},
	);
	return con;
}
