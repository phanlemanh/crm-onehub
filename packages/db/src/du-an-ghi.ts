import { coLichSuDuAn, DU_AN } from "./du-an";
import { timVong } from "./lich-viec";
import { ngayHan, VIEC, vaiCua } from "./viec";
import {
	docDuAnMo,
	ghiVetDuAn,
	ghiVetViec,
	LoiViec,
	lanDoi,
	type ViecNgan,
} from "./viec-ghi";
import type { DbGhi } from "./zalo-lien-ket";

type DauDuAn = { nguoiId: string; now: Date };

function tenSach(ten: string): string {
	const t = ten.trim();
	if (t.length === 0)
		throw new LoiViec("khong-hop-le", DU_AN.thongDiep.tenTrong);
	if (t.length > DU_AN.tenToiDa) {
		throw new LoiViec(
			"khong-hop-le",
			`Tên dài tối đa ${DU_AN.tenToiDa} ký tự.`,
		);
	}
	return t;
}

async function khoaMot(tx: DbGhi, duAnId: string): Promise<void> {
	await tx.$queryRaw`SELECT id FROM "duAn" WHERE id = ${duAnId} FOR UPDATE`;
	await tx.$queryRaw`SELECT id FROM viec WHERE "duAnId" = ${duAnId} ORDER BY id FOR UPDATE`;
}

async function docDuAn(tx: DbGhi, duAnId: string) {
	const da = await tx.duAn.findUnique({
		where: { id: duAnId },
		select: { id: true, ten: true, moTa: true, taoBoiId: true, dongLuc: true },
	});
	if (da === null) {
		throw new LoiViec("khong-thay", DU_AN.thongDiep.khongCoDuAn(duAnId));
	}
	return da;
}

export async function taoDuAn(
	tx: DbGhi,
	input: DauDuAn & { ten: string; moTa?: string | null },
): Promise<{ id: string }> {
	const ten = tenSach(input.ten);
	const moTa = input.moTa?.trim() || null;
	const da = await tx.duAn.create({
		data: { ten, moTa, taoBoiId: input.nguoiId, taoLuc: input.now },
		select: { id: true },
	});
	await ghiVetDuAn(tx, da.id, input.nguoiId, input.now, {
		loai: "tao",
		sau: { ten, moTa },
	});
	return da;
}

export async function suaDuAn(
	tx: DbGhi,
	input: DauDuAn & { duAnId: string; ten?: string; moTa?: string | null },
): Promise<void> {
	await khoaMot(tx, input.duAnId);
	const da = await docDuAn(tx, input.duAnId);
	if (da.dongLuc) throw new LoiViec("khong-hop-le", DU_AN.thongDiep.daDong);
	const ten = input.ten === undefined ? da.ten : tenSach(input.ten);
	const moTa = input.moTa === undefined ? da.moTa : input.moTa?.trim() || null;
	if (ten === da.ten && moTa === da.moTa) return;
	await tx.duAn.update({ where: { id: da.id }, data: { ten, moTa } });
	await ghiVetDuAn(tx, da.id, input.nguoiId, input.now, {
		loai: "doi-noi-dung",
		truoc: { ten: da.ten, moTa: da.moTa },
		sau: { ten, moTa },
	});
}

function kiemNguoiDong(
	da: { taoBoiId: string },
	input: { nguoiId: string; laQuanTri: boolean },
): void {
	if (da.taoBoiId !== input.nguoiId && !input.laQuanTri) {
		throw new LoiViec("khong-quyen", DU_AN.thongDiep.chiNguoiTaoDong);
	}
}

export async function dongDuAn(
	tx: DbGhi,
	input: DauDuAn & { duAnId: string; laQuanTri: boolean },
): Promise<void> {
	await khoaMot(tx, input.duAnId);
	const da = await docDuAn(tx, input.duAnId);
	kiemNguoiDong(da, input);
	if (da.dongLuc) return;
	await tx.duAn.update({
		where: { id: da.id },
		data: { dongLuc: input.now, dongBoiId: input.nguoiId },
	});
	await ghiVetDuAn(tx, da.id, input.nguoiId, input.now, { loai: "dong" });
}

export async function moLaiDuAn(
	tx: DbGhi,
	input: DauDuAn & { duAnId: string; laQuanTri: boolean },
): Promise<void> {
	await khoaMot(tx, input.duAnId);
	const da = await docDuAn(tx, input.duAnId);
	kiemNguoiDong(da, input);
	if (!da.dongLuc) return;
	await tx.duAn.update({
		where: { id: da.id },
		data: { dongLuc: null, dongBoiId: null },
	});
	await ghiVetDuAn(tx, da.id, input.nguoiId, input.now, { loai: "mo-lai" });
}

export async function xoaDuAn(
	tx: DbGhi,
	input: DauDuAn & { duAnId: string; laQuanTri: boolean },
): Promise<void> {
	await khoaMot(tx, input.duAnId);
	const da = await docDuAn(tx, input.duAnId);
	kiemNguoiDong(da, input);
	if (await coLichSuDuAn(tx, da.id)) {
		throw new LoiViec("co-lich-su", DU_AN.thongDiep.coLichSu);
	}
	await tx.duAn.delete({ where: { id: da.id } });
}

async function viecCuaDuAn(
	tx: DbGhi,
	duAnId: string,
	ids: string[],
): Promise<void> {
	const n = await tx.viec.count({ where: { id: { in: ids }, duAnId } });
	if (n !== new Set(ids).size) {
		throw new LoiViec("khong-hop-le", DU_AN.thongDiep.khacDuAn);
	}
}

export async function taoMoc(
	tx: DbGhi,
	input: DauDuAn & { duAnId: string; ten: string; ngay: Date; cho: string[] },
): Promise<{ id: string }> {
	await khoaMot(tx, input.duAnId);
	await docDuAnMo(tx, input.duAnId);
	const ten = tenSach(input.ten);
	const dem = await tx.duAnMoc.count({ where: { duAnId: input.duAnId } });
	if (dem >= DU_AN.mocToiDa) {
		throw new LoiViec(
			"khong-hop-le",
			`Một dự án có tối đa ${DU_AN.mocToiDa} mốc.`,
		);
	}
	await viecCuaDuAn(tx, input.duAnId, input.cho);
	const moc = await tx.duAnMoc.create({
		data: {
			duAnId: input.duAnId,
			ten,
			ngay: input.ngay,
			taoBoiId: input.nguoiId,
			taoLuc: input.now,
			cho: { create: [...new Set(input.cho)].map((viecId) => ({ viecId })) },
		},
		select: { id: true },
	});
	await ghiVetDuAn(tx, input.duAnId, input.nguoiId, input.now, {
		loai: "them-moc",
		sau: { id: moc.id, ten, ngay: ngayHan(input.ngay) },
	});
	return moc;
}

async function docMoc(tx: DbGhi, mocId: string) {
	const moc = await tx.duAnMoc.findUnique({
		where: { id: mocId },
		select: { id: true, duAnId: true, ten: true, ngay: true },
	});
	if (moc === null) {
		throw new LoiViec("khong-thay", `Không có mốc nào mang mã ${mocId}.`);
	}
	return moc;
}

export async function suaMoc(
	tx: DbGhi,
	input: DauDuAn & { mocId: string; ten?: string; ngay?: Date; cho?: string[] },
): Promise<void> {
	const moc = await docMoc(tx, input.mocId);
	await khoaMot(tx, moc.duAnId);
	await docDuAnMo(tx, moc.duAnId);
	const ten = input.ten === undefined ? moc.ten : tenSach(input.ten);
	const ngay = input.ngay ?? moc.ngay;
	if (input.cho) {
		await viecCuaDuAn(tx, moc.duAnId, input.cho);
		await tx.duAnMocCho.deleteMany({ where: { mocId: moc.id } });
		await tx.duAnMocCho.createMany({
			data: [...new Set(input.cho)].map((viecId) => ({
				mocId: moc.id,
				viecId,
			})),
		});
	}
	await tx.duAnMoc.update({ where: { id: moc.id }, data: { ten, ngay } });
	await ghiVetDuAn(tx, moc.duAnId, input.nguoiId, input.now, {
		loai: "sua-moc",
		truoc: { id: moc.id, ten: moc.ten, ngay: ngayHan(moc.ngay) },
		sau: { id: moc.id, ten, ngay: ngayHan(ngay) },
	});
}

export async function xoaMoc(
	tx: DbGhi,
	input: DauDuAn & { mocId: string },
): Promise<void> {
	const moc = await docMoc(tx, input.mocId);
	await khoaMot(tx, moc.duAnId);
	await docDuAnMo(tx, moc.duAnId);
	await tx.duAnMoc.delete({ where: { id: moc.id } });
	await ghiVetDuAn(tx, moc.duAnId, input.nguoiId, input.now, {
		loai: "xoa-moc",
		truoc: { id: moc.id, ten: moc.ten, ngay: ngayHan(moc.ngay) },
	});
}

export type MocTre = { tre: boolean; treBoi: string[] };

export function mocTre(
	ngay: string,
	cho: { tieuDe: string; han: string | null }[],
): MocTre {
	const treBoi = cho
		.filter((v) => v.han !== null && v.han > ngay)
		.map((v) => v.tieuDe);
	return { tre: treBoi.length > 0, treBoi };
}

const CHON_HAI = {
	id: true,
	tieuDe: true,
	duAnId: true,
	batDauNgay: true,
	hanNgay: true,
	nguoiGiaoId: true,
	nguoiThucHienId: true,
} as const;

async function haiViec(tx: DbGhi, truocId: string, sauId: string) {
	const ds = await tx.viec.findMany({
		where: { id: { in: [truocId, sauId] } },
		select: CHON_HAI,
	});
	const truoc = ds.find((v) => v.id === truocId);
	const sau = ds.find((v) => v.id === sauId);
	if (!truoc)
		throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(truocId));
	if (!sau) throw new LoiViec("khong-thay", VIEC.thongDiep.khongCoViec(sauId));
	return { truoc, sau };
}

function kiemNguoiPhaiCho(
	sau: { tieuDe: string; nguoiGiaoId: string; nguoiThucHienId: string },
	nguoiId: string,
): void {
	const vai = vaiCua({ ...sau, theoDoi: [] }, nguoiId);
	if (!vai.giao && !vai.thucHien) {
		throw new LoiViec(
			"khong-quyen",
			DU_AN.thongDiep.chiGiaoThucHienPhaiCho(sau.tieuDe),
		);
	}
}

export async function taoPhuThuoc(
	tx: DbGhi,
	input: DauDuAn & { truocId: string; sauId: string },
): Promise<{ daDoi: ViecNgan[] }> {
	if (input.truocId === input.sauId) {
		throw new LoiViec("khong-hop-le", DU_AN.thongDiep.tuCho);
	}
	const dau = await haiViec(tx, input.truocId, input.sauId);
	if (!dau.truoc.duAnId || dau.truoc.duAnId !== dau.sau.duAnId) {
		throw new LoiViec("khong-hop-le", DU_AN.thongDiep.khacDuAn);
	}
	const duAnId = dau.truoc.duAnId;
	await khoaMot(tx, duAnId);
	await docDuAnMo(tx, duAnId);
	const { truoc, sau } = await haiViec(tx, input.truocId, input.sauId);
	const canh = await tx.viecPhuThuoc.findMany({
		where: { truoc: { duAnId }, sau: { duAnId } },
		select: { truocId: true, sauId: true },
	});
	if (canh.some((c) => c.truocId === truoc.id && c.sauId === sau.id)) {
		throw new LoiViec("khong-hop-le", DU_AN.thongDiep.daCoPhuThuoc);
	}
	if (!truoc.batDauNgay || !truoc.hanNgay || !sau.batDauNgay || !sau.hanNgay) {
		throw new LoiViec("khong-hop-le", DU_AN.thongDiep.thieuNgay);
	}
	const vong = timVong(canh, { truocId: truoc.id, sauId: sau.id });
	if (vong) {
		const ten = new Map<string, string>([
			[truoc.id, truoc.tieuDe],
			[sau.id, sau.tieuDe],
		]);
		const thieu = vong.filter((id) => !ten.has(id));
		if (thieu.length > 0) {
			const ds = await tx.viec.findMany({
				where: { id: { in: thieu } },
				select: { id: true, tieuDe: true },
			});
			for (const v of ds) ten.set(v.id, v.tieuDe);
		}
		throw new LoiViec(
			"khong-hop-le",
			DU_AN.thongDiep.vong(vong.map((id) => ten.get(id) ?? id)),
		);
	}
	if (canh.length >= DU_AN.phuThuocToiDa) {
		throw new LoiViec(
			"khong-hop-le",
			`Một dự án có tối đa ${DU_AN.phuThuocToiDa} phụ thuộc.`,
		);
	}
	kiemNguoiPhaiCho(sau, input.nguoiId);
	await tx.viecPhuThuoc.create({
		data: {
			truocId: truoc.id,
			sauId: sau.id,
			taoBoiId: input.nguoiId,
			taoLuc: input.now,
		},
	});
	await ghiVetViec(
		tx,
		{ viecId: sau.id, nguoiId: input.nguoiId, nguon: "web", luc: input.now },
		{
			loai: "them-phu-thuoc",
			truoc: null,
			sau: { viec: { id: truoc.id, tieuDe: truoc.tieuDe } },
		},
	);
	const daDoi = await lanDoi(
		tx,
		duAnId,
		truoc.id,
		{ batDau: ngayHan(truoc.batDauNgay), han: ngayHan(truoc.hanNgay) },
		input,
	);
	return { daDoi };
}

export async function xoaPhuThuoc(
	tx: DbGhi,
	input: DauDuAn & { truocId: string; sauId: string },
): Promise<void> {
	const { truoc, sau } = await haiViec(tx, input.truocId, input.sauId);
	if (sau.duAnId) {
		await khoaMot(tx, sau.duAnId);
		await docDuAnMo(tx, sau.duAnId);
	}
	const canh = await tx.viecPhuThuoc.findUnique({
		where: { truocId_sauId: { truocId: truoc.id, sauId: sau.id } },
		select: { id: true },
	});
	if (canh === null) return;
	kiemNguoiPhaiCho(sau, input.nguoiId);
	await tx.viecPhuThuoc.delete({ where: { id: canh.id } });
	await ghiVetViec(
		tx,
		{ viecId: sau.id, nguoiId: input.nguoiId, nguon: "web", luc: input.now },
		{
			loai: "go-phu-thuoc",
			truoc: { viec: { id: truoc.id, tieuDe: truoc.tieuDe } },
			sau: null,
		},
	);
}

export async function themNgayLe(
	tx: DbGhi,
	input: { nguoiId: string; ngay: Date; ten: string },
): Promise<{ id: string }> {
	const ten = tenSach(input.ten);
	const [trung, dem] = await Promise.all([
		tx.ngayNghi.findUnique({
			where: { ngay: input.ngay },
			select: { id: true },
		}),
		tx.ngayNghi.count(),
	]);
	if (trung) throw new LoiViec("khong-hop-le", DU_AN.thongDiep.ngayLeTrung);
	if (dem >= DU_AN.ngayLeToiDa) {
		throw new LoiViec("khong-hop-le", `Tối đa ${DU_AN.ngayLeToiDa} ngày lễ.`);
	}
	return tx.ngayNghi.create({
		data: { ngay: input.ngay, ten, taoBoiId: input.nguoiId },
		select: { id: true },
	});
}
