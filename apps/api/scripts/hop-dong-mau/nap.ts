import type { Db } from "@crm/db";
import { fieldKeyFromLabel } from "@crm/db/fields-shape";
import { WORKSPACE_ID } from "@crm/db/workspace";
import type { TepHopDongMau } from "@crm/validation/hop-dong-mau";
import { KIEU_TEP } from "@crm/validation/kieu-tep";
import type { INestApplicationContext } from "@nestjs/common";
import { CompaniesService } from "../../src/companies/companies.service";
import { DealsService } from "../../src/deals/deals.service";
import { FieldFilesService } from "../../src/fields/field-files.service";
import type { NguoiGoiTep } from "../../src/fields/field-files-quyen";
import { FieldsService } from "../../src/fields/fields.service";
import { HOP_DONG_MAU, LoiHopDongMau } from "./cau-hinh";

const T = HOP_DONG_MAU.thongDiep;
const ENTITY = HOP_DONG_MAU.truong.entity;

export const KHOA_TRUONG_HOP_DONG = fieldKeyFromLabel(HOP_DONG_MAU.truong.nhan);

export type DongBaoCao = {
	ma: string;
	thoaThuan: string;
	trangThai: (typeof HOP_DONG_MAU.trangThai)[keyof typeof HOP_DONG_MAU.trangThai];
};

export type KhoNap = Pick<
	Db,
	"organization" | "fieldDefinition" | "user" | "company" | "deal"
>;

type DichVu = {
	db: KhoNap;
	congTy: CompaniesService;
	thoaThuan: DealsService;
	truong: FieldsService;
	tep: FieldFilesService;
};

export function layDichVu(app: INestApplicationContext, db: KhoNap): DichVu {
	return {
		db,
		congTy: app.get(CompaniesService, { strict: false }),
		thoaThuan: app.get(DealsService, { strict: false }),
		truong: app.get(FieldsService, { strict: false }),
		tep: app.get(FieldFilesService, { strict: false }),
	};
}

async function kiemTienDe(dv: DichVu): Promise<"moi" | "co"> {
	const workspace = await dv.db.organization.findUnique({
		where: { id: WORKSPACE_ID },
		select: { id: true },
	});
	if (!workspace)
		throw new LoiHopDongMau(HOP_DONG_MAU.ma.sai, T.thieuWorkspace);
	if (!dv.tep.status().bat) {
		throw new LoiHopDongMau(HOP_DONG_MAU.ma.khoTat, T.khoTat);
	}
	const truong = await dv.db.fieldDefinition.findUnique({
		where: { entity_key: { entity: ENTITY, key: KHOA_TRUONG_HOP_DONG } },
		select: { type: true, archivedAt: true },
	});
	if (!truong) return "moi";
	if (truong.type !== "FILE") {
		throw new LoiHopDongMau(
			HOP_DONG_MAU.ma.sai,
			T.truongLechKieu(
				HOP_DONG_MAU.truong.nhan,
				KHOA_TRUONG_HOP_DONG,
				truong.type,
			),
		);
	}
	if (truong.archivedAt !== null) {
		throw new LoiHopDongMau(
			HOP_DONG_MAU.ma.sai,
			T.truongLuuTru(HOP_DONG_MAU.truong.nhan, KHOA_TRUONG_HOP_DONG),
		);
	}
	return "co";
}

async function nguoiMau(db: KhoNap): Promise<NguoiGoiTep> {
	const n = HOP_DONG_MAU.nguoi;
	const co = await db.user.findUnique({
		where: { id: n.id },
		select: { id: true },
	});
	if (!co) {
		await db.user.create({
			data: {
				id: n.id,
				name: n.ten,
				email: n.thu,
				emailVerified: true,
				members: {
					create: {
						id: n.memberId,
						organizationId: WORKSPACE_ID,
						role: n.vai,
						createdAt: new Date(),
					},
				},
			},
		});
	}
	return { id: n.id, role: n.vai };
}

async function congTyMau(dv: DichVu, nguoi: NguoiGoiTep): Promise<string> {
	const co = await dv.db.company.findFirst({
		where: { name: HOP_DONG_MAU.congTy },
		select: { id: true, archivedAt: true },
		orderBy: { createdAt: "asc" },
	});
	if (co?.archivedAt) {
		throw new LoiHopDongMau(
			HOP_DONG_MAU.ma.sai,
			T.banGhiLuuTru(HOP_DONG_MAU.congTy),
		);
	}
	if (co) return co.id;
	const tao = await dv.congTy.create({
		name: HOP_DONG_MAU.congTy,
		ownerId: nguoi.id,
	});
	return tao.id;
}

async function thoaThuanMau(
	dv: DichVu,
	nguoi: NguoiGoiTep,
	congTyId: string,
	ten: string,
): Promise<string> {
	const co = await dv.db.deal.findFirst({
		where: { name: ten, companyId: congTyId },
		select: { id: true, archivedAt: true },
		orderBy: { createdAt: "asc" },
	});
	if (co?.archivedAt)
		throw new LoiHopDongMau(HOP_DONG_MAU.ma.sai, T.banGhiLuuTru(ten));
	if (co) return co.id;
	const tao = await dv.thoaThuan.create({
		name: ten,
		companyId: congTyId,
		ownerId: nguoi.id,
	});
	return tao.id;
}

async function ganTep(
	dv: DichVu,
	nguoi: NguoiGoiTep,
	recordId: string,
	tep: TepHopDongMau,
): Promise<boolean> {
	const o = {
		entity: ENTITY,
		recordId,
		fieldKey: KHOA_TRUONG_HOP_DONG,
		tenTep: tep.tenTep,
	};
	const cho = await dv.tep.requestUpload(nguoi, {
		...o,
		kieu: tep.kieu,
		kichThuoc: tep.byte.length,
	});
	const tra = await fetch(cho.url, {
		method: "PUT",
		body: tep.byte,
		headers: { "content-type": KIEU_TEP[tep.kieu].mime },
	});
	if (!tra.ok) throw new Error(T.putHong(tep.tenTep, tra.status));
	const kq = await dv.tep.complete(nguoi, {
		...o,
		pathname: cho.pathname,
		phieu: cho.phieu,
	});
	return kq.trung;
}

export async function napHopDongMau(
	dv: DichVu,
	tep: TepHopDongMau[],
	inRa: (dong: string) => void,
): Promise<DongBaoCao[]> {
	const truong = await kiemTienDe(dv);
	const nguoi = await nguoiMau(dv.db);
	const congTyId = await congTyMau(dv, nguoi);
	const thoaThuan = new Map<string, string>();
	for (const ten of [
		...tep.map((t) => t.thoaThuan),
		HOP_DONG_MAU.thoaThuanKhongTep,
	]) {
		thoaThuan.set(ten, await thoaThuanMau(dv, nguoi, congTyId, ten));
	}
	if (truong === "moi") {
		await dv.truong.create(nguoi.id, {
			entity: ENTITY,
			label: HOP_DONG_MAU.truong.nhan,
			type: "FILE",
			options: [],
			agentFilled: false,
			agentBrief: null,
			required: false,
			showOnSheet: true,
			showOnTable: true,
			showOnFilter: true,
		});
	}
	const bao: DongBaoCao[] = [];
	for (const t of tep) {
		const recordId = thoaThuan.get(t.thoaThuan);
		if (!recordId) throw new Error(`không có thoả thuận mẫu cho ${t.ma}`);
		const trung = await ganTep(dv, nguoi, recordId, t);
		const dong: DongBaoCao = {
			ma: t.ma,
			thoaThuan: t.thoaThuan,
			trangThai: trung
				? HOP_DONG_MAU.trangThai.daCo
				: HOP_DONG_MAU.trangThai.daGan,
		};
		inRa(`${dong.ma} · ${dong.thoaThuan} · ${dong.trangThai}`);
		bao.push(dong);
	}
	return bao;
}
