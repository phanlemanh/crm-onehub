import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { WorkspaceRole } from "@crm/auth";
import { db } from "@crm/db";
import { z } from "zod";
import { TaiLieuService } from "../../../api/src/tai-lieu/tai-lieu.service";
import { gieoThanhVien } from "../../../api/test/phien-thu";

export const TIEN_TO = `tlk${(process.env.TEST_RUN_ID ?? "").slice(0, 6)}-`;
let dem = 0;
export const ma = (p: string) =>
	`${TIEN_TO}${p}-${Date.now().toString(36)}-${++dem}`;

export type Nguoi = { id: string; role: WorkspaceRole };

export async function gieoNguoi(role: WorkspaceRole = "owner"): Promise<Nguoi> {
	const id = ma("u");
	await gieoThanhVien(id, role);
	return { id, role };
}

export const taiLieu = () => new TaiLieuService(db);

export async function duyetDeXuat(
	quanTri: Nguoi,
	deXuatId: string,
): Promise<number> {
	const s = taiLieu();
	const p = await s.proposal(quanTri, deXuatId);
	return (await s.approve(quanTri, { id: deXuatId, diffHash: p.diffHash })).so;
}

export async function trangDaDuyet(
	quanTri: Nguoi,
	ten: string,
	noiDung: string,
	chuTrang: Nguoi = quanTri,
): Promise<{ slug: string; trangId: string }> {
	const { slug } = await taiLieu().create(quanTri, {
		ten,
		loai: "quy-dinh",
		chuTrangId: chuTrang.id,
		noiDung,
	});
	const trang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { id: true, deXuat: { select: { id: true } } },
	});
	await duyetDeXuat(quanTri, trang.deXuat[0]?.id ?? "");
	return { slug, trangId: trang.id };
}

export async function trangChuaDuyet(
	quanTri: Nguoi,
	ten: string,
	noiDung: string,
): Promise<{ slug: string; trangId: string }> {
	const { slug } = await taiLieu().create(quanTri, {
		ten,
		loai: "quy-dinh",
		chuTrangId: quanTri.id,
		noiDung,
	});
	const trang = await db.taiLieuTrang.findUniqueOrThrow({
		where: { slug },
		select: { id: true },
	});
	return { slug, trangId: trang.id };
}

export async function deXuatMoi(
	nguoi: Nguoi,
	slug: string,
	noiDung: string,
): Promise<string> {
	return (await taiLieu().propose(nguoi, { slug, noiDung })).deXuatId;
}

export type CtxCon = {
	session: {
		id: string;
		parent: { sessionId: string; rootSessionId: string };
		auth: {
			current: { attributes: Record<string, string> };
			initiator: { attributes: Record<string, string> };
		};
	};
};

let demPhien = 0;
export function ctxConCua(phienGoc: string): CtxCon {
	demPhien += 1;
	return {
		session: {
			id: `ses-con-${phienGoc}-${demPhien}`,
			parent: { sessionId: phienGoc, rootSessionId: phienGoc },
			auth: { current: { attributes: {} }, initiator: { attributes: {} } },
		},
	};
}

const khuonCtxEve = z.object({
	ten: z.string(),
	ctx: z.object({
		session: z.object({
			id: z.string(),
			auth: z.object({
				current: z.object({ attributes: z.record(z.string(), z.string()) }),
				initiator: z.object({ attributes: z.record(z.string(), z.string()) }),
			}),
		}),
		channel: z.object({ kind: z.string(), continuationToken: z.string() }),
	}),
});

export type CtxBatDauEve = z.infer<typeof khuonCtxEve>["ctx"];

const TEP_CTX_EVE = join(
	import.meta.dir,
	"..",
	"fixtures",
	"so-chi-phi-that.json",
);

export function ctxBatDauThat(phienGoc: string): CtxBatDauEve {
	const ghi = z
		.array(khuonCtxEve)
		.parse(JSON.parse(readFileSync(TEP_CTX_EVE, "utf8")));
	const goc = ghi.find((g) => g.ten === "goc")?.ctx.session.id;
	const con = ghi.find((g) => g.ten === "con_tro_ly")?.ctx;
	if (!goc || !con)
		throw new Error("fixture eve thieu phien goc hay con_tro_ly");
	demPhien += 1;
	return {
		session: { ...con.session, id: `ses-con-${phienGoc}-${demPhien}` },
		channel: {
			...con.channel,
			continuationToken: con.channel.continuationToken.replace(goc, phienGoc),
		},
	};
}

export async function moHoiCrm(
	nguoi: Nguoi,
	cauHoi = "Câu hỏi thử?",
): Promise<{ hoiId: string; ctx: CtxCon }> {
	const phienGoc = ma("ses-goc");
	const hang = await db.taiLieuHoi.create({
		data: { nguoiHoiId: nguoi.id, kenh: "CRM", cauHoi, phienId: phienGoc },
	});
	return { hoiId: hang.id, ctx: ctxConCua(phienGoc) };
}

type GiaTri =
	| string
	| number
	| boolean
	| null
	| GiaTri[]
	| { [k: string]: GiaTri };
export type VaoCongCu = { [k: string]: GiaTri };

export type NguCanhGoi = {
	session: {
		id: string;
		parent?: { sessionId: string; rootSessionId: string };
		auth: {
			current: { attributes: Record<string, string> };
			initiator: { attributes: Record<string, string> };
		};
	};
};

type CongCu = { execute: unknown };
type Execute<T> = (vao: VaoCongCu, ctx: NguCanhGoi) => Promise<T>;

export async function goiCongCu<T>(
	congCu: CongCu,
	vao: VaoCongCu,
	ctx: NguCanhGoi,
): Promise<{ ok: true; ra: T } | { ok: false; loi: string }> {
	try {
		const ra = await (congCu.execute as Execute<T>)(vao, ctx);
		return { ok: true, ra };
	} catch (loi) {
		return { ok: false, loi: loi instanceof Error ? loi.message : String(loi) };
	}
}

export async function donTroLyKho(): Promise<void> {
	const cuaNguoiThu = { startsWith: TIEN_TO };
	const trang = await db.taiLieuTrang.findMany({
		where: { OR: [{ taoBoiId: cuaNguoiThu }, { chuTrangId: cuaNguoiThu }] },
		select: { id: true },
	});
	const trangId = { in: trang.map((t) => t.id) };
	await db.taiLieuBaoSai.deleteMany({
		where: { OR: [{ trangId }, { nguoiBaoId: cuaNguoiThu }] },
	});
	await db.taiLieuHoi.deleteMany({ where: { nguoiHoiId: cuaNguoiThu } });
	await db.aiChiPhi.deleteMany({
		where: { sessionId: { startsWith: "ses-con-" } },
	});
	await db.taiLieuLienKet.deleteMany({ where: { tuTrangId: trangId } });
	await db.taiLieuSuKien.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.updateMany({
		where: { id: trangId },
		data: { banDangDungId: null },
	});
	await db.taiLieuDeXuat.updateMany({
		where: { trangId },
		data: { banGocId: null },
	});
	await db.taiLieuPhienBan.deleteMany({ where: { trangId } });
	await db.taiLieuDeXuat.deleteMany({ where: { trangId } });
	await db.taiLieuTrang.deleteMany({ where: { id: trangId } });
	await db.zaloHoi.deleteMany({ where: { crmUserId: cuaNguoiThu } });
	await db.member.deleteMany({ where: { userId: cuaNguoiThu } });
	await db.user.deleteMany({ where: { id: cuaNguoiThu } });
}

export type KetQuaConEve = {
	callId: string;
	kind: string;
	subagentName: string;
	isError?: boolean;
	output: { hoiId: string; ketQua: string } | { code: string; message: string };
};

type TrangThaiCon = {
	"eve.channel": {
		kind: string;
		state: { callId: string; subagentName: string };
	};
};

const goiEve = dirname(
	createRequire(import.meta.url).resolve("eve/package.json"),
);
const eveKetQua = (await import(
	join(goiEve, "dist/src/execution/delegated-parent-result.js")
)) as {
	createDelegatedSubagentSuccessResult: (
		trangThai: TrangThaiCon,
		ra: { hoiId: string; ketQua: string },
	) => KetQuaConEve;
	createDelegatedSubagentErrorResult: (
		trangThai: TrangThaiCon,
		loi: Error,
	) => KetQuaConEve;
};
const { SUBAGENT_ADAPTER_KIND } = (await import(
	join(goiEve, "dist/src/execution/subagent-adapter-state.js")
)) as { SUBAGENT_ADAPTER_KIND: string };

const TRANG_THAI_CON: TrangThaiCon = {
	"eve.channel": {
		kind: SUBAGENT_ADAPTER_KIND,
		state: { callId: "goi-tlk", subagentName: "tro_ly_kho" },
	},
};

export function ketQuaConEve(hoiId: string, loi?: string): KetQuaConEve {
	return loi
		? eveKetQua.createDelegatedSubagentErrorResult(
				TRANG_THAI_CON,
				new Error(loi),
			)
		: eveKetQua.createDelegatedSubagentSuccessResult(TRANG_THAI_CON, {
				hoiId,
				ketQua: "TRA_LOI",
			});
}
