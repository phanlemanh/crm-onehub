import {
	afterAll,
	beforeAll,
	describe,
	expect,
	it,
	setSystemTime,
	spyOn,
} from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { db } from "@crm/db";
import type { FieldEntityName } from "@crm/db/fields";
import { FIELD_FILE_COPY } from "@crm/db/fields";
import { savedViewFilters } from "@crm/validation/saved-view";
import {
	TEP_TRUONG,
	type TepTrongO,
	tepTrongO,
} from "@crm/validation/tep-truong";
import { Logger } from "@nestjs/common";
import request from "supertest";
import {
	GOC_KHO_GIA,
	khoTepTruongGia,
} from "../../../packages/db/test/blob-tep-truong-gia";
import {
	type Ai,
	canData,
	donBanGhi,
	dungSan,
	type Json,
	KIEU_MAU,
	MAU_TEP,
	type OTep,
	TIEN_TO,
	type TraLoi,
} from "./truong-tep-san";

const T = TEP_TRUONG.thongDiep;
const CRON = `${TIEN_TO}-cron-bi-mat`;
process.env.CRON_SECRET = CRON;
const kho = khoTepTruongGia();
const daTao = {
	deal: [] as string[],
	company: [] as string[],
	contact: [] as string[],
	field: [] as string[],
};
const san = dungSan({
	kho,
	ten: "chinh",
	don: async () => {
		setSystemTime();
		await donBanGhi(daTao);
	},
});

type TruongTao = { id: string; key: string; type: string };
type HangDemTep = { id: string; soTepTheoTruong: Record<string, number> };
type BangDemTep = { rows?: HangDemTep[]; columns?: { cards: HangDemTep[] }[] };

async function taoTruong(
	entity: FieldEntityName,
	nhan: string,
	them: { type?: string; showOnTable?: boolean; showOnFilter?: boolean } = {},
): Promise<TruongTao> {
	const f = canData<TruongTao>(
		await san.goi("quanTri", "fields.create", {
			entity,
			label: nhan,
			type: them.type ?? "FILE",
			options: [],
			agentFilled: false,
			agentBrief: null,
			required: false,
			showOnSheet: true,
			showOnTable: them.showOnTable ?? true,
			showOnFilter: them.showOnFilter ?? true,
		}),
		`tao truong ${nhan}`,
	);
	daTao.field.push(f.id);
	return f;
}

async function taoCongTy(ten: string): Promise<string> {
	const c = canData<{ id: string }>(
		await san.goi("quanTri", "companies.create", { name: ten }),
		`tao cong ty ${ten}`,
	);
	daTao.company.push(c.id);
	return c.id;
}

async function taoThoaThuan(ten: string, companyId: string): Promise<string> {
	const d = canData<{ id: string }>(
		await san.goi("quanTri", "deals.create", {
			name: ten,
			companyId,
			ownerId: san.phien.quanTri.nguoi,
		}),
		`tao thoa thuan ${ten}`,
	);
	daTao.deal.push(d.id);
	return d.id;
}

async function taoCaNhan(ten: string, companyId: string): Promise<string> {
	const c = canData<{ id: string }>(
		await san.goi("quanTri", "contacts.create", { firstName: ten, companyId }),
		`tao ca nhan ${ten}`,
	);
	daTao.contact.push(c.id);
	return c.id;
}

type Xin = { pathname: string; url: string; hetHan: number; phieu: string };

async function xinCho(
	ai: Ai,
	o: OTep,
	tenTep: string,
	kieu: string,
	kichThuoc: number,
): Promise<TraLoi> {
	return san.goi(ai, "fieldFiles.requestUpload", {
		...o,
		tenTep,
		kieu,
		kichThuoc,
	});
}

async function nhan(
	ai: Ai,
	o: OTep,
	tenTep: string,
	xin: Xin,
	phieu = xin.phieu,
): Promise<TraLoi> {
	return san.goi(ai, "fieldFiles.complete", {
		...o,
		tenTep,
		pathname: xin.pathname,
		phieu,
	});
}

async function ganTep(
	ai: Ai,
	o: OTep,
	tenTep: string,
	kieu: string,
	byte: Uint8Array,
): Promise<{ tl: TraLoi; xin: Xin | null }> {
	const tlXin = await xinCho(ai, o, tenTep, kieu, byte.length);
	if (tlXin.status !== 200) return { tl: tlXin, xin: null };
	const xin = tlXin.data as Xin;
	kho.put(xin.pathname, byte);
	return { tl: await nhan(ai, o, tenTep, xin), xin };
}

async function canGan(
	ai: Ai,
	o: OTep,
	tenTep: string,
	kieu: string,
	byte: Uint8Array,
): Promise<string> {
	const { tl } = await ganTep(ai, o, tenTep, kieu, byte);
	return canData<{ tepId: string }>(tl, `gan ${tenTep}`).tepId;
}

const sha = (byte: Uint8Array) =>
	createHash("sha256").update(byte).digest("hex");

function cotCua(entity: FieldEntityName) {
	return entity === "DEAL"
		? "dealId"
		: entity === "COMPANY"
			? "companyId"
			: "contactId";
}

async function tepTrongDb(o: OTep, fieldId: string) {
	return db.fieldFile.findMany({
		where: { fieldId, [cotCua(o.entity)]: o.recordId },
		orderBy: [{ taiLuc: "asc" }, { id: "asc" }],
	});
}

describe("ttp-tao-truong", () => {
	const tienTo = `${TIEN_TO}tao`;

	it("ttp-tao-truong: tạo trường Tệp cho ba loại bản ghi, khoá đổi kiểu khi đã có tệp", async () => {
		let so = 0;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			const f = await taoTruong(entity, `${tienTo} ${entity}`);
			const ds = canData<TruongTao[]>(
				await san.hoi("quanTri", "fields.list", { entity }),
				"fields.list",
			);
			if (!ds.some((x) => x.id === f.id && x.type === "FILE")) {
				throw new Error(`ttp tao truong: ${entity} khong luu`);
			}
			so += 1;
		}
		if (so !== 3) throw new Error(`ttp tao truong: thieu o ${so}`);

		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const deal = await taoThoaThuan(`${tienTo} T1`, congTy);
		const coTep = await taoTruong("DEAL", `${tienTo} co tep`);
		await canGan(
			"nv1",
			{ entity: "DEAL", recordId: deal, fieldKey: coTep.key },
			"a.pdf",
			"pdf",
			MAU_TEP.pdf(`${tienTo}a`),
		);
		const doi = await san.goi("quanTri", "fields.update", {
			id: coTep.id,
			data: { type: "TEXT" },
		});
		if (doi.ma !== "CONFLICT")
			throw new Error("ttp tao truong: doi kieu co tep");
		const doc = await db.fieldDefinition.findUnique({
			where: { id: coTep.id },
		});
		if (doc?.type !== "FILE") throw new Error("ttp tao truong: kieu da doi");

		const khongTep = await taoTruong("DEAL", `${tienTo} khong tep`);
		const doiChung = await san.goi("quanTri", "fields.update", {
			id: khongTep.id,
			data: { type: "TEXT" },
		});
		if (doiChung.status !== 200) {
			throw new Error("ttp tao truong: doi chung chan oan");
		}

		const member = await san.goi("nv1", "fields.create", {
			entity: "DEAL",
			label: `${tienTo} member`,
			type: "FILE",
		});
		if (member.ma !== "FORBIDDEN") {
			throw new Error("ttp tao truong: member tao duoc");
		}
	});
});

describe("ttp-tai-len", () => {
	const tienTo = `${TIEN_TO}tai`;

	it("ttp-tai-len: bốn kiểu × ba loại bản ghi, byte không qua API, đếm trong bảng", async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const deal = await taoThoaThuan(`${tienTo} T1`, congTy);
		const dealKhong = await taoThoaThuan(`${tienTo} T2`, congTy);
		const caNhan = await taoCaNhan(`${tienTo} L1`, congTy);
		const banGhi = { DEAL: deal, COMPANY: congTy, CONTACT: caNhan } as const;
		let so = 0;
		const o = {} as Record<FieldEntityName, OTep & { fieldId: string }>;

		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			const f = await taoTruong(entity, `${tienTo} ${entity}`);
			o[entity] = {
				entity,
				recordId: banGhi[entity],
				fieldKey: f.key,
				fieldId: f.id,
			};
			const thuTu: string[] = [];
			for (const kieu of ["pdf", "docx", "png", "jpeg"] as const) {
				const byte = MAU_TEP[kieu](`${tienTo}${entity}${kieu}`);
				const mau = KIEU_MAU[kieu];
				const { tl, xin } = await ganTep(
					"nv1",
					o[entity],
					mau.ten,
					mau.kieu,
					byte,
				);
				if (!xin)
					throw new Error(`ttp tai len: ${entity} ${kieu} thieu thu tuc`);
				if (!xin.url.startsWith(GOC_KHO_GIA)) {
					throw new Error(`ttp tai len: url qua api ${xin.url}`);
				}
				const { tepId } = canData<{ tepId: string }>(tl, `${entity} ${kieu}`);
				const dong = await db.fieldFile.findUnique({ where: { id: tepId } });
				if (!dong) throw new Error(`ttp tai len: ${entity} ${kieu} hang`);
				if (dong.kieu !== kieu)
					throw new Error(`ttp tai len: ${entity} ${kieu} kieu`);
				if (dong.kichThuoc !== byte.length) {
					throw new Error(`ttp tai len: ${entity} ${kieu} kichThuoc`);
				}
				if (dong.sha256 !== sha(byte))
					throw new Error(`ttp tai len: ${entity} ${kieu} sha256`);
				if (dong.taiBoiId !== san.phien.nv1.nguoi) {
					throw new Error(`ttp tai len: ${entity} ${kieu} taiBoiId`);
				}
				thuTu.push(mau.ten);
				so += 1;
			}
			const thuTuc =
				entity === "DEAL"
					? "deals.byId"
					: entity === "COMPANY"
						? "companies.byId"
						: "contacts.byId";
			const chiTiet = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
				await san.hoi("quanTri", thuTuc, { id: banGhi[entity] }),
				thuTuc,
			);
			const ds = chiTiet.tepTheoTruong[o[entity].fieldKey] ?? [];
			if (ds.map((t) => t.tenTep).join("|") !== thuTu.join("|")) {
				throw new Error(
					`ttp tai len: byId ${entity} ${ds.map((t) => t.tenTep).join(",")}`,
				);
			}
			for (const t of ds) {
				if (!tepTrongO.safeParse(t).success)
					throw new Error(`ttp tai len: khuon ${entity}`);
			}
		}
		if (so !== 12) throw new Error(`ttp tai len: thieu o ${so}`);

		const dem = async (thuTuc: string, vao: Json, id: string, khoa: string) => {
			const kq = canData<BangDemTep>(
				await san.hoi("quanTri", thuTuc, vao),
				thuTuc,
			);
			const hang = kq.rows ?? kq.columns?.flatMap((c) => c.cards) ?? [];
			return hang.find((h) => h.id === id)?.soTepTheoTruong[khoa];
		};
		const kiemDem = (thuTuc: string, n: number | undefined, mong: number) => {
			if (n !== mong) throw new Error(`ttp tai len: dem ${thuTuc} ${n}`);
		};
		kiemDem(
			"deals.list",
			await dem(
				"deals.list",
				{ q: tienTo, pageSize: 50 },
				deal,
				o.DEAL.fieldKey,
			),
			4,
		);
		kiemDem(
			"deals.list",
			await dem(
				"deals.list",
				{ q: tienTo, pageSize: 50 },
				dealKhong,
				o.DEAL.fieldKey,
			),
			0,
		);
		kiemDem(
			"deals.board",
			await dem("deals.board", { q: tienTo }, deal, o.DEAL.fieldKey),
			4,
		);
		kiemDem(
			"companies.list",
			await dem(
				"companies.list",
				{ q: tienTo, pageSize: 50 },
				congTy,
				o.COMPANY.fieldKey,
			),
			4,
		);
		kiemDem(
			"contacts.list",
			await dem(
				"contacts.list",
				{ q: tienTo, pageSize: 50 },
				caNhan,
				o.CONTACT.fieldKey,
			),
			4,
		);

		const dealPhu = await taoThoaThuan(`${tienTo} T3`, congTy);
		const oPhu = {
			entity: "DEAL" as const,
			recordId: dealPhu,
			fieldKey: o.DEAL.fieldKey,
		};
		const pdfTenDocx = await canGan(
			"nv1",
			oPhu,
			"phu luc.docx",
			"docx",
			MAU_TEP.pdf(`${tienTo}doiduoi`),
		);
		const docDoi = await db.fieldFile.findUnique({ where: { id: pdfTenDocx } });
		if (docDoi?.kieu !== "pdf") throw new Error("ttp tai len: kieu theo ten");
		const tenDai =
			`Hợp đồng hợp tác — bản ký 2026 ${"đối tác ".repeat(30)}`.slice(0, 236) +
			".pdf";
		const idDai = await canGan(
			"nv1",
			oPhu,
			tenDai,
			"pdf",
			MAU_TEP.pdf(`${tienTo}tendai`),
		);
		const docDai = await db.fieldFile.findUnique({ where: { id: idDai } });
		if (docDai?.tenTep !== tenDai.normalize("NFC"))
			throw new Error("ttp tai len: ten doi");
	});
});

type NguCanhTuChoi = {
	f: TruongTao;
	fLuu: TruongTao;
	fCaNhan: TruongTao;
	fChu: TruongTao;
	t1: OTep;
	t2: OTep;
	t3: OTep;
	t4: OTep;
	p0: { xin: Xin; byte: Uint8Array; tepId: string };
};

describe("ttp-tu-choi", () => {
	const tienTo = `${TIEN_TO}tuc`;
	const ctx = {} as NguCanhTuChoi;

	beforeAll(async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		ctx.f = await taoTruong("DEAL", `${tienTo} hd`);
		ctx.fLuu = await taoTruong("DEAL", `${tienTo} luu`);
		ctx.fCaNhan = await taoTruong("CONTACT", `${tienTo} ca nhan`);
		ctx.fChu = await taoTruong("DEAL", `${tienTo} chu`, { type: "TEXT" });
		const t = async (ten: string): Promise<OTep> => ({
			entity: "DEAL",
			recordId: await taoThoaThuan(`${tienTo} ${ten}`, congTy),
			fieldKey: ctx.f.key,
		});
		ctx.t1 = await t("T1");
		ctx.t2 = await t("T2");
		ctx.t3 = await t("T3");
		ctx.t4 = await t("T4");
		const byte = MAU_TEP.pdf(`${tienTo}p0`);
		const g = await ganTep("nv1", ctx.t1, "p0.pdf", "pdf", byte);
		ctx.p0 = {
			xin: g.xin as Xin,
			byte,
			tepId: canData<{ tepId: string }>(g.tl, "p0").tepId,
		};
		canData(
			await san.goi("quanTri", "fields.archive", { id: ctx.fLuu.id }),
			"archive truong",
		);
		canData(
			await san.goi("quanTri", "deals.archive", { id: ctx.t3.recordId }),
			"archive T3",
		);
		for (let i = 0; i < TEP_TRUONG.toiDaTepMoiO; i += 1) {
			await canGan(
				"nv1",
				ctx.t4,
				`day${i}.pdf`,
				"pdf",
				MAU_TEP.pdf(`${tienTo}day${i}`),
			);
		}
	});

	it("ttp-tu-choi: 17 ô từ chối viết trước, ca trùng, ca đua, đối chứng dương", async () => {
		const MB = 1024 * 1024;
		type O = {
			o: string;
			chay: () => Promise<{ tl: TraLoi; pathname: string | null; ve: OTep }>;
			chu: string;
		};
		const quaPut = async (
			ve: OTep,
			ten: string,
			kieu: string,
			byte: Uint8Array,
			khai = byte.length,
		) => {
			const tlXin = await xinCho("nv1", ve, ten, kieu, khai);
			if (tlXin.status !== 200) return { tl: tlXin, pathname: null, ve };
			const xin = tlXin.data as Xin;
			kho.put(xin.pathname, byte);
			return {
				tl: await nhan("nv1", ve, ten, xin),
				pathname: xin.pathname,
				ve,
			};
		};
		const chiXin = async (
			ve: OTep,
			ten: string,
			kieu: string,
			khai: number,
		) => ({
			tl: await xinCho("nv1", ve, ten, kieu, khai),
			pathname: null,
			ve,
		});
		const phieuLech = async (doi: (xin: Xin) => string) => {
			const tlXin = await xinCho("nv1", ctx.t1, "x.pdf", "pdf", 10);
			const xin = tlXin.data as Xin;
			kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}${Math.random()}`));
			return {
				tl: await nhan("nv1", ctx.t1, "x.pdf", xin, doi(xin)),
				pathname: xin.pathname,
				ve: ctx.t1,
			};
		};
		const BANG: O[] = [
			{
				o: "rac duoi pdf",
				chu: T.saiKieu,
				chay: () =>
					quaPut(
						ctx.t1,
						"rac.pdf",
						"pdf",
						new TextEncoder().encode("khong phai pdf"),
					),
			},
			{
				o: "xlsx",
				chu: T.saiKieu,
				chay: () => chiXin(ctx.t1, "bang.xlsx", "pdf", 100),
			},
			{
				o: "qua co",
				chu: T.quaCo,
				chay: () => chiXin(ctx.t1, "lon.pdf", "pdf", 20 * MB + 1),
			},
			{
				o: "rong",
				chu: T.rong,
				chay: () => chiXin(ctx.t1, "rong.pdf", "pdf", 0),
			},
			{
				o: "khai nho put lon",
				chu: T.quaCo,
				chay: () =>
					quaPut(
						ctx.t1,
						"lon2.pdf",
						"pdf",
						new Uint8Array(20 * MB + 1)
							.fill(0x25, 0, 1)
							.fill(0x50, 1, 2)
							.fill(0x44, 2, 3)
							.fill(0x46, 3, 4)
							.fill(0x2d, 4, 5),
						MB,
					),
			},
			{
				o: "docx macro",
				chu: T.macro,
				chay: () =>
					quaPut(ctx.t1, "macro.docx", "docx", MAU_TEP.docxMacro(tienTo)),
			},
			{
				o: "o day",
				chu: T.day,
				chay: () => chiXin(ctx.t4, "them.pdf", "pdf", 10),
			},
			{
				o: "phieu gia",
				chu: T.phieuSai,
				chay: () =>
					phieuLech(
						(x) =>
							`${x.phieu.slice(0, -1)}${x.phieu.endsWith("A") ? "B" : "A"}`,
					),
			},
			{
				o: "phieu cua T2",
				chu: T.phieuSai,
				chay: async () => {
					const xin = (await xinCho("nv1", ctx.t2, "x.pdf", "pdf", 10))
						.data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}t2`));
					return {
						tl: await nhan("nv1", ctx.t1, "x.pdf", xin),
						pathname: xin.pathname,
						ve: ctx.t1,
					};
				},
			},
			{
				o: "phieu het han",
				chu: T.phieuSai,
				chay: async () => {
					const xin = (await xinCho("nv1", ctx.t1, "x.pdf", "pdf", 10))
						.data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}han`));
					setSystemTime(new Date(Date.now() + 61 * 60_000));
					try {
						return {
							tl: await nhan("nv1", ctx.t1, "x.pdf", xin),
							pathname: xin.pathname,
							ve: ctx.t1,
						};
					} finally {
						setSystemTime();
					}
				},
			},
			{
				o: "pathname P0",
				chu: T.phieuSai,
				chay: async () => ({
					tl: await nhan("nv1", ctx.t1, "p0.pdf", ctx.p0.xin),
					pathname: null,
					ve: ctx.t1,
				}),
			},
			{
				o: "T3 luu tru",
				chu: T.luuTru,
				chay: () => chiXin(ctx.t3, "a.pdf", "pdf", 10),
			},
			{
				o: "truong luu tru",
				chu: T.khongNhanTep,
				chay: () =>
					chiXin({ ...ctx.t1, fieldKey: ctx.fLuu.key }, "a.pdf", "pdf", 10),
			},
			{
				o: "truong ca nhan",
				chu: T.khongNhanTep,
				chay: () =>
					chiXin({ ...ctx.t1, fieldKey: ctx.fCaNhan.key }, "a.pdf", "pdf", 10),
			},
			{
				o: "truong chu",
				chu: T.khongNhanTep,
				chay: () =>
					chiXin({ ...ctx.t1, fieldKey: ctx.fChu.key }, "a.pdf", "pdf", 10),
			},
			{
				o: "ban ghi khong co",
				chu: T.khongCoBanGhi,
				chay: () =>
					chiXin(
						{ ...ctx.t1, recordId: `${tienTo}khongco` },
						"a.pdf",
						"pdf",
						10,
					),
			},
			{
				o: "luu tru giua chung",
				chu: T.luuTru,
				chay: async () => {
					const xin = (await xinCho("nv1", ctx.t2, "g.pdf", "pdf", 10))
						.data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}giua`));
					canData(
						await san.goi("quanTri", "deals.archive", { id: ctx.t2.recordId }),
						"archive T2",
					);
					try {
						return {
							tl: await nhan("nv1", ctx.t2, "g.pdf", xin),
							pathname: xin.pathname,
							ve: ctx.t2,
						};
					} finally {
						canData(
							await san.goi("quanTri", "deals.restore", {
								id: ctx.t2.recordId,
							}),
							"restore T2",
						);
					}
				},
			},
		];
		let so = 0;
		for (const o of BANG) {
			const { tl, pathname, ve } = await o.chay();
			if (tl.status === 200) throw new Error(`ttp tu choi: ${o.o} nhan`);
			if (!tl.loi.includes(o.chu))
				throw new Error(`ttp tu choi: ${o.o} loi ${tl.loi}`);
			const t1 = await tepTrongDb(ctx.t1, ctx.f.id);
			if (t1.map((x) => x.id).join() !== ctx.p0.tepId)
				throw new Error(`ttp tu choi: ${o.o} ghi hang`);
			if (ve === ctx.t2 && (await tepTrongDb(ctx.t2, ctx.f.id)).length > 0) {
				throw new Error(`ttp tu choi: ${o.o} ghi hang`);
			}
			if (pathname && kho.daPut.has(pathname))
				throw new Error(`ttp tu choi: ${o.o} blob con`);
			if (!kho.daPut.has(ctx.p0.xin.pathname))
				throw new Error("ttp tu choi: xoa nham P0");
			so += 1;
		}
		if (so !== 17) throw new Error(`ttp tu choi: thieu o ${so}`);
		if (
			(await tepTrongDb(ctx.t4, ctx.f.id)).length !== TEP_TRUONG.toiDaTepMoiO
		) {
			throw new Error("ttp tu choi: o day ghi hang");
		}

		const trung = await ganTep("nv1", ctx.t1, "p0 lai.pdf", "pdf", ctx.p0.byte);
		const kqTrung = canData<{ tepId: string; trung: boolean }>(
			trung.tl,
			"trung",
		);
		if (!kqTrung.trung || kqTrung.tepId !== ctx.p0.tepId)
			throw new Error("ttp tu choi: trung tra");
		if (trung.xin && kho.daPut.has(trung.xin.pathname))
			throw new Error("ttp tu choi: trung blob");
		if ((await tepTrongDb(ctx.t1, ctx.f.id)).length !== 1)
			throw new Error("ttp tu choi: trung hang");

		const sangT2 = await ganTep("nv1", ctx.t2, "p0.pdf", "pdf", ctx.p0.byte);
		const kqT2 = canData<{ trung: boolean }>(sangT2.tl, "trung T2");
		if (kqT2.trung || (await tepTrongDb(ctx.t2, ctx.f.id)).length !== 1) {
			throw new Error("ttp tu choi: trung khac ban ghi");
		}

		const congTy = daTao.company.at(-1) as string;
		const t5: OTep = {
			entity: "DEAL",
			recordId: await taoThoaThuan(`${tienTo} T5`, congTy),
			fieldKey: ctx.f.key,
		};
		const byteDua = MAU_TEP.pdf(`${tienTo}dua`);
		const [x1, x2] = [
			(await xinCho("nv1", t5, "d1.pdf", "pdf", byteDua.length)).data as Xin,
			(await xinCho("nv1", t5, "d2.pdf", "pdf", byteDua.length)).data as Xin,
		];
		kho.put(x1.pathname, byteDua);
		kho.put(x2.pathname, byteDua);
		await Promise.all([
			nhan("nv1", t5, "d1.pdf", x1),
			nhan("nv1", t5, "d2.pdf", x2),
		]);
		const soDua = (await tepTrongDb(t5, ctx.f.id)).length;
		if (soDua !== 1) throw new Error(`ttp tu choi: dua ${soDua}`);

		const doiChung = await ganTep(
			"nv1",
			ctx.t1,
			"moi.pdf",
			"pdf",
			MAU_TEP.pdf(`${tienTo}moi`),
		);
		if (doiChung.tl.status !== 200) throw new Error("ttp tu choi: doi chung");
		expect(so).toBe(17);
	});
});

type BoQuyen = { o: OTep; deal: string; f1: string; tienTo: string };

async function goiQuyen(thuTuc: string, ai: Ai, bo: BoQuyen): Promise<TraLoi> {
	const { o, deal, f1, tienTo } = bo;
	if (thuTuc === "deals.byId") return await san.hoi(ai, thuTuc, { id: deal });
	else if (thuTuc === "fieldFiles.status") return await san.hoi(ai, thuTuc);
	else if (thuTuc === "fieldFiles.requestUpload")
		return await xinCho(ai, o, "x.pdf", "pdf", 10);
	else if (thuTuc === "fieldFiles.complete") {
		const nguoi = ai === "okr" ? "nv1" : ai;
		const xin = (await xinCho(nguoi, o, `c${ai}.pdf`, "pdf", 10)).data as Xin;
		kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}c${ai}`));
		return await nhan(ai, o, `c${ai}.pdf`, xin);
	} else if (thuTuc === "fieldFiles.downloadUrl") {
		const tl = await san.goi(ai, thuTuc, { tepId: f1 });
		if (ai === "nv1" && tl.status === 200) {
			throw new Error("ttp quyen: member downloadUrl url");
		}
		if (ai === "nv1" && JSON.stringify(tl.data ?? "").includes("http")) {
			throw new Error("ttp quyen: lo url");
		}
		if (ai === "quanTri") {
			const han = Number(
				new URL((tl.data as { url: string }).url).searchParams.get("han"),
			);
			const giay = (han - Date.now()) / 1000;
			if (!(giay > 0 && giay <= TEP_TRUONG.taiVeGiay))
				throw new Error(`ttp quyen: han ${giay}`);
		}
		return tl;
	} else {
		const tepXoa = await canGan(
			"quanTri",
			o,
			`xoa${ai}.pdf`,
			"pdf",
			MAU_TEP.pdf(`${tienTo}x${ai}`),
		);
		return await san.goi(ai, thuTuc, { tepId: tepXoa });
	}
}

describe("ttp-quyen", () => {
	const tienTo = `${TIEN_TO}qy`;

	it("ttp-quyen: 3 vai × 6 thủ tục, hạn URL, cờ mở và xoá trong byId", async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const f = await taoTruong("DEAL", `${tienTo} hd`);
		const deal = await taoThoaThuan(`${tienTo} T1`, congTy);
		const o: OTep = { entity: "DEAL", recordId: deal, fieldKey: f.key };
		const f1 = await canGan(
			"nv1",
			o,
			"f1.pdf",
			"pdf",
			MAU_TEP.pdf(`${tienTo}f1`),
		);
		const f2 = await canGan(
			"quanTri",
			o,
			"f2.pdf",
			"pdf",
			MAU_TEP.pdf(`${tienTo}f2`),
		);
		const VAI = ["quanTri", "nv1", "okr"] as const;
		const DAP_AN = {
			"deals.byId": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.status": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.requestUpload": {
				quanTri: "ok",
				nv1: "ok",
				okr: "FORBIDDEN",
			},
			"fieldFiles.complete": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.downloadUrl": {
				quanTri: "ok",
				nv1: "FORBIDDEN",
				okr: "FORBIDDEN",
			},
			"fieldFiles.remove": {
				quanTri: "ok",
				nv1: "FORBIDDEN",
				okr: "FORBIDDEN",
			},
		} as const;
		let so = 0;
		for (const [thuTuc, theoVai] of Object.entries(DAP_AN)) {
			for (const ai of VAI) {
				const tl = await goiQuyen(thuTuc, ai, { o, deal, f1, tienTo });
				const ket = tl.status === 200 ? "ok" : tl.ma;
				if (ket !== theoVai[ai])
					throw new Error(`ttp quyen: ${ai} ${thuTuc} ${ket}`);
				if (
					thuTuc === "deals.byId" &&
					ai === "okr" &&
					!tl.loi.includes("KHONG_TRONG_PHAM_VI") &&
					tl.ma !== "FORBIDDEN"
				) {
					throw new Error("ttp quyen: okr doc duoc");
				}
				so += 1;
			}
		}
		if (so !== 18) throw new Error(`ttp quyen: thieu o ${so}`);

		const coCua = async (ai: "quanTri" | "nv1") => {
			const ct = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
				await san.hoi(ai, "deals.byId", { id: deal }),
				"byId",
			);
			return new Map((ct.tepTheoTruong[f.key] ?? []).map((t) => [t.id, t]));
		};
		const DAP_AN_CO = [
			{ ai: "quanTri", tep: f1, mo: true, xoa: true },
			{ ai: "quanTri", tep: f2, mo: true, xoa: true },
			{ ai: "nv1", tep: f1, mo: false, xoa: true },
			{ ai: "nv1", tep: f2, mo: false, xoa: false },
		] as const;
		let soCo = 0;
		for (const c of DAP_AN_CO) {
			const t = (await coCua(c.ai)).get(c.tep);
			if (t?.coTheMo !== c.mo)
				throw new Error(`ttp quyen: co ${c.ai} ${c.tep} coTheMo`);
			if (t?.coTheXoa !== c.xoa)
				throw new Error(`ttp quyen: co ${c.ai} ${c.tep} coTheXoa`);
			soCo += 1;
		}
		if (soCo !== 4) throw new Error(`ttp quyen: thieu co ${soCo}`);
		if ((await coCua("quanTri")).size < 2)
			throw new Error("ttp quyen: doi chung");
	});
});

describe("ttp-ghi-chu", () => {
	const tienTo = `${TIEN_TO}gc`;

	it("ttp-ghi-chu: mọi lối ghi chữ vào ô Tệp bị từ chối, sort bỏ qua ô Tệp", async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const deal = await taoThoaThuan(`${tienTo} T1`, congTy);
		const caNhan = await taoCaNhan(`${tienTo} L1`, congTy);
		const banGhi = { DEAL: deal, COMPANY: congTy, CONTACT: caNhan } as const;
		const truong = {} as Record<FieldEntityName, TruongTao>;
		const tepGoc = {} as Record<FieldEntityName, string>;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			truong[entity] = await taoTruong(entity, `${tienTo} gc ${entity}`);
			tepGoc[entity] = await canGan(
				"nv1",
				{ entity, recordId: banGhi[entity], fieldKey: truong[entity].key },
				"goc.pdf",
				"pdf",
				MAU_TEP.pdf(`${tienTo}${entity}`),
			);
		}
		const chuDeal = await taoTruong("DEAL", `${tienTo} chu`, { type: "TEXT" });
		const LOI = {
			DEAL: "deals.update",
			COMPANY: "companies.update",
			CONTACT: "contacts.update",
		} as const;
		let so = 0;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			for (const gia of ["abc", 5, null]) {
				const tl = await san.goi("quanTri", LOI[entity], {
					id: banGhi[entity],
					data: { fields: { [truong[entity].key]: gia } },
				});
				if (tl.status === 200 || !tl.loi.includes(FIELD_FILE_COPY.chiNhanTep)) {
					throw new Error(`ttp ghi chu: ${LOI[entity]} ${gia} nhan`);
				}
				const fv = await db.fieldValue.count({
					where: { fieldId: truong[entity].id },
				});
				if (fv > 0)
					throw new Error(`ttp ghi chu: ${LOI[entity]} ${gia} fieldValue`);
				const tep = await db.fieldFile.findMany({
					where: { fieldId: truong[entity].id },
				});
				if (tep.map((t) => t.id).join() !== tepGoc[entity]) {
					throw new Error(`ttp ghi chu: ${LOI[entity]} ${gia} tep doi`);
				}
				so += 1;
			}
		}
		if (so !== 9) throw new Error(`ttp ghi chu: thieu o ${so}`);

		const khongSort = canData<{ rows: { id: string }[] }>(
			await san.hoi("quanTri", "deals.list", { q: tienTo, pageSize: 50 }),
			"list",
		);
		const coSort = await san.hoi("quanTri", "deals.list", {
			q: tienTo,
			pageSize: 50,
			sort: `field:${truong.DEAL.key}`,
		});
		if (coSort.status !== 200) throw new Error("ttp ghi chu: sort nem");
		const rows = (coSort.data as { rows: { id: string }[] }).rows;
		if (
			rows.map((r) => r.id).join() !== khongSort.rows.map((r) => r.id).join()
		) {
			throw new Error("ttp ghi chu: sort doi");
		}
		const doiChung = await san.goi("quanTri", "deals.update", {
			id: deal,
			data: { fields: { [chuDeal.key]: "duoc" } },
		});
		if (doiChung.status !== 200) throw new Error("ttp ghi chu: doi chung");
	});
});

async function donLich(): Promise<void> {
	const res = await request(san.app().getHttpServer())
		.get("/internal/archive/prune")
		.set("authorization", `Bearer ${CRON}`);
	if (res.status !== 200) throw new Error(`ttp don: ${res.status}`);
}

describe("ttp-xoa", () => {
	const tienTo = `${TIEN_TO}xoa`;

	it("ttp-xoa: ai xoá được tệp nào, vết xoá, bản ghi lưu trữ, Blob hỏng rồi lượt dọn", async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const f = await taoTruong("DEAL", `${tienTo} hd`);
		const dungO = async (ten: string) => {
			const deal = await taoThoaThuan(`${tienTo} ${ten}`, congTy);
			const o: OTep = { entity: "DEAL", recordId: deal, fieldKey: f.key };
			const f1 = await canGan(
				"nv1",
				o,
				"f1.pdf",
				"pdf",
				MAU_TEP.pdf(`${tienTo}${ten}f1`),
			);
			const f2 = await canGan(
				"nv2",
				o,
				"f2.pdf",
				"pdf",
				MAU_TEP.pdf(`${tienTo}${ten}f2`),
			);
			return { deal, o, f1, f2 };
		};
		const DAP_AN = [
			{ ai: "quanTri", tep: "f1", dung: true },
			{ ai: "quanTri", tep: "f2", dung: true },
			{ ai: "nv1", tep: "f1", dung: true },
			{ ai: "nv1", tep: "f2", dung: false },
			{ ai: "nv2", tep: "f1", dung: false },
			{ ai: "nv2", tep: "f2", dung: true },
		] as const;
		const ghiLog = spyOn(Logger.prototype, "log");
		let so = 0;
		try {
			for (const c of DAP_AN) {
				const o = await dungO(`${c.ai}${c.tep}`);
				const tepId = o[c.tep];
				const kia = c.tep === "f1" ? o.f2 : o.f1;
				const pathname = (
					await db.fieldFile.findUnique({ where: { id: tepId } })
				)?.blobPathname as string;
				ghiLog.mockClear();
				const tl = await san.goi(c.ai, "fieldFiles.remove", { tepId });
				if (c.dung) {
					if (tl.status !== 200)
						throw new Error(`ttp xoa: ${c.ai} ${c.tep} ${tl.ma}`);
					if (await db.fieldFile.findUnique({ where: { id: tepId } }))
						throw new Error("ttp xoa: hang con");
					if (kho.daPut.has(pathname)) throw new Error("ttp xoa: blob con");
					if (!(await db.fieldFile.findUnique({ where: { id: kia } })))
						throw new Error("ttp xoa: xoa nham");
					const vet = ghiLog.mock.calls.filter((goi) => {
						const m = goi[0] as {
							message?: string;
							fieldId?: string;
							recordId?: string;
							tepId?: string;
							userId?: string;
						};
						return (
							m?.message === "Field file removed" &&
							m.fieldId === f.id &&
							m.recordId === o.deal &&
							m.tepId === tepId &&
							m.userId === san.phien[c.ai].nguoi
						);
					});
					if (vet.length !== 1) throw new Error("ttp xoa: thieu vet");
				} else {
					if (tl.ma !== "FORBIDDEN")
						throw new Error(`ttp xoa: ${c.ai} khong bi chan`);
					if (!(await db.fieldFile.findUnique({ where: { id: tepId } })))
						throw new Error("ttp xoa: chan ma mat");
				}
				so += 1;
			}
		} finally {
			ghiLog.mockRestore();
		}
		if (so !== 6) throw new Error(`ttp xoa: thieu o ${so}`);

		const luu = await dungO("luu");
		canData(
			await san.goi("quanTri", "deals.archive", { id: luu.deal }),
			"archive",
		);
		const tlLuu = await san.goi("quanTri", "fieldFiles.remove", {
			tepId: luu.f1,
		});
		if (tlLuu.status === 200) throw new Error("ttp xoa: luu tru xoa duoc");

		const hong = await dungO("hong");
		const pathHong = (await db.fieldFile.findUnique({ where: { id: hong.f1 } }))
			?.blobPathname as string;
		kho.xoaHong.add(pathHong);
		try {
			const tlHong = await san.goi("quanTri", "fieldFiles.remove", {
				tepId: hong.f1,
			});
			if (tlHong.status !== 200) throw new Error("ttp xoa: blob hong nem");
			if (await db.fieldFile.findUnique({ where: { id: hong.f1 } }))
				throw new Error("ttp xoa: blob hong hang con");
			if (
				!(await db.blobChoXoa.findUnique({ where: { pathname: pathHong } }))
			) {
				throw new Error("ttp xoa: blob hong khong cho");
			}
		} finally {
			kho.xoaHong.delete(pathHong);
		}
		await donLich();
		if (await db.blobChoXoa.findUnique({ where: { pathname: pathHong } }))
			throw new Error("ttp xoa: don khong xoa");

		const pathF2 = (await db.fieldFile.findUnique({ where: { id: hong.f2 } }))
			?.blobPathname as string;
		canData(
			await san.goi("quanTri", "fieldFiles.remove", { tepId: hong.f2 }),
			"doi chung",
		);
		if (await db.blobChoXoa.findUnique({ where: { pathname: pathF2 } }))
			throw new Error("ttp xoa: doi chung");
	});
});

describe("ttp-vong-doi", () => {
	const tienTo = `${TIEN_TO}vd`;

	it("ttp-vong-doi: 7 đường, lùi giao dịch, Blob hỏng, trường lưu trữ, tải dở", async () => {
		const dung = async (ten: string) => {
			const congTy = await taoCongTy(`${tienTo} ${ten} cong ty`);
			const fDeal = await taoTruong("DEAL", `${tienTo} ${ten} d`);
			const fCty = await taoTruong("COMPANY", `${tienTo} ${ten} c`);
			const fLh = await taoTruong("CONTACT", `${tienTo} ${ten} l`);
			const deal = await taoThoaThuan(`${tienTo} ${ten} T1`, congTy);
			const deal2 = await taoThoaThuan(`${tienTo} ${ten} T2`, congTy);
			const lh = await taoCaNhan(`${tienTo} ${ten} L1`, congTy);
			const ganHai = async (o: OTep, nhan: string) => [
				await canGan(
					"nv1",
					o,
					`${nhan}a.pdf`,
					"pdf",
					MAU_TEP.pdf(`${tienTo}${ten}${nhan}a`),
				),
				await canGan(
					"nv1",
					o,
					`${nhan}b.pdf`,
					"pdf",
					MAU_TEP.pdf(`${tienTo}${ten}${nhan}b`),
				),
			];
			const tep = {
				deal: await ganHai(
					{ entity: "DEAL", recordId: deal, fieldKey: fDeal.key },
					"d",
				),
				deal2: await ganHai(
					{ entity: "DEAL", recordId: deal2, fieldKey: fDeal.key },
					"e",
				),
				cty: await ganHai(
					{ entity: "COMPANY", recordId: congTy, fieldKey: fCty.key },
					"c",
				),
				lh: await ganHai(
					{ entity: "CONTACT", recordId: lh, fieldKey: fLh.key },
					"l",
				),
			};
			const doiChungCty = await taoCongTy(`${tienTo} ${ten} doi chung`);
			const dealDoiChung = await taoThoaThuan(
				`${tienTo} ${ten} DC`,
				doiChungCty,
			);
			const tepDoiChung = await canGan(
				"nv1",
				{ entity: "DEAL", recordId: dealDoiChung, fieldKey: fDeal.key },
				"dc.pdf",
				"pdf",
				MAU_TEP.pdf(`${tienTo}${ten}dc`),
			);
			return { congTy, deal, deal2, lh, fDeal, fCty, fLh, tep, tepDoiChung };
		};
		const path = async (ids: string[]) =>
			(
				await db.fieldFile.findMany({
					where: { id: { in: ids } },
					select: { blobPathname: true },
				})
			)
				.map((t) => t.blobPathname)
				.sort();
		const DUONG = [
			{
				ten: "deals.purge",
				chay: async (x: Awaited<ReturnType<typeof dung>>) => {
					canData(
						await san.goi("quanTri", "deals.archive", { id: x.deal }),
						"a",
					);
					canData(await san.goi("quanTri", "deals.purge", { id: x.deal }), "p");
				},
				tep: (x: Awaited<ReturnType<typeof dung>>) => x.tep.deal,
			},
			{
				ten: "contacts.purge",
				chay: async (x: Awaited<ReturnType<typeof dung>>) => {
					canData(
						await san.goi("quanTri", "contacts.archive", { id: x.lh }),
						"a",
					);
					canData(
						await san.goi("quanTri", "contacts.purge", { id: x.lh }),
						"p",
					);
				},
				tep: (x: Awaited<ReturnType<typeof dung>>) => x.tep.lh,
			},
			{
				ten: "companies.purge",
				chay: async (x: Awaited<ReturnType<typeof dung>>) => {
					canData(
						await san.goi("quanTri", "companies.archive", { id: x.congTy }),
						"a",
					);
					canData(
						await san.goi("quanTri", "companies.purge", { id: x.congTy }),
						"p",
					);
				},
				tep: (x: Awaited<ReturnType<typeof dung>>) => [
					...x.tep.cty,
					...x.tep.deal,
					...x.tep.deal2,
				],
			},
			{
				ten: "deals.bulkPurge",
				chay: async (x: Awaited<ReturnType<typeof dung>>) => {
					canData(
						await san.goi("quanTri", "deals.bulkArchive", {
							ids: [x.deal, x.deal2],
						}),
						"a",
					);
					canData(
						await san.goi("quanTri", "deals.bulkPurge", {
							ids: [x.deal, x.deal2],
						}),
						"p",
					);
				},
				tep: (x: Awaited<ReturnType<typeof dung>>) => [
					...x.tep.deal,
					...x.tep.deal2,
				],
			},
			{
				ten: "purgeExpired",
				chay: async (x: Awaited<ReturnType<typeof dung>>) => {
					canData(
						await san.goi("quanTri", "deals.archive", { id: x.deal }),
						"a",
					);
					await db.deal.update({
						where: { id: x.deal },
						data: { archivedAt: new Date(Date.now() - 400 * 86_400_000) },
					});
					await donLich();
				},
				tep: (x: Awaited<ReturnType<typeof dung>>) => x.tep.deal,
			},
			{
				ten: "fields.delete",
				chay: async (x: Awaited<ReturnType<typeof dung>>) => {
					canData(
						await san.goi("quanTri", "fields.delete", { id: x.fCty.id }),
						"xoa truong",
					);
				},
				tep: (x: Awaited<ReturnType<typeof dung>>) => x.tep.cty,
			},
		] as const;

		const luu = await dung("luu");
		const truocLuu = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
			await san.hoi("quanTri", "deals.byId", { id: luu.deal }),
			"byId",
		);
		const xoaTruoc = kho.daXoa.length;
		canData(await san.goi("quanTri", "deals.archive", { id: luu.deal }), "a");
		canData(await san.goi("quanTri", "deals.restore", { id: luu.deal }), "r");
		const sauLuu = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
			await san.hoi("quanTri", "deals.byId", { id: luu.deal }),
			"byId",
		);
		if (
			kho.daXoa.length !== xoaTruoc ||
			JSON.stringify(sauLuu.tepTheoTruong) !==
				JSON.stringify(truocLuu.tepTheoTruong)
		) {
			throw new Error("ttp vong doi: luu tru doi tep");
		}
		let so = 1;

		for (const d of DUONG) {
			const x = await dung(d.ten.replace(/\W/g, ""));
			const mong = await path(d.tep(x));
			const pathDC = await path([x.tepDoiChung]);
			const truoc = kho.daXoa.length;
			if (!mong.every((p) => kho.daPut.has(p)))
				throw new Error("ttp vong doi: doi chung");
			await d.chay(x);
			if ((await db.fieldFile.count({ where: { id: { in: d.tep(x) } } })) > 0) {
				throw new Error(`ttp vong doi: ${d.ten} hang con`);
			}
			const daXoa = kho.daXoa
				.slice(truoc)
				.filter((p) => p.startsWith("truong-tep/"))
				.sort();
			const cuaDuong = daXoa.filter(
				(p) => mong.includes(p) || pathDC.includes(p),
			);
			if (
				JSON.stringify(cuaDuong.filter((p) => mong.includes(p))) !==
				JSON.stringify(mong)
			) {
				throw new Error(
					`ttp vong doi: ${d.ten} xoa ${JSON.stringify(cuaDuong)}`,
				);
			}
			if (cuaDuong.some((p) => pathDC.includes(p)))
				throw new Error(`ttp vong doi: ${d.ten} xoa nham`);
			so += 1;
		}
		if (so !== 7) throw new Error(`ttp vong doi: thieu o ${so}`);

		const lui = await dung("lui");
		const pathLui = await path(lui.tep.deal);
		canData(await san.goi("quanTri", "deals.archive", { id: lui.deal }), "a");
		const ham = `ttp_lui_${TIEN_TO}`;
		await db.$executeRawUnsafe(
			`CREATE OR REPLACE FUNCTION ${ham}() RETURNS trigger AS $$ BEGIN RAISE EXCEPTION 'ttp lui'; END $$ LANGUAGE plpgsql`,
		);
		await db.$executeRawUnsafe(
			`CREATE TRIGGER ${ham} BEFORE DELETE ON deal FOR EACH ROW WHEN (OLD.id = '${lui.deal}') EXECUTE FUNCTION ${ham}()`,
		);
		const xoaTruocLui = kho.daXoa.length;
		try {
			await san.goi("quanTri", "deals.purge", { id: lui.deal });
		} finally {
			await db.$executeRawUnsafe(`DROP TRIGGER IF EXISTS ${ham} ON deal`);
			await db.$executeRawUnsafe(`DROP FUNCTION IF EXISTS ${ham}()`);
		}
		const choLui = await db.blobChoXoa.count({
			where: { pathname: { in: pathLui } },
		});
		if (kho.daXoa.length !== xoaTruocLui || choLui > 0)
			throw new Error("ttp vong doi: lui van xoa");

		const hong = await dung("hong");
		const pathHong = await path(hong.tep.deal);
		for (const p of pathHong) kho.xoaHong.add(p);
		try {
			canData(
				await san.goi("quanTri", "deals.archive", { id: hong.deal }),
				"a",
			);
			const tl = await san.goi("quanTri", "deals.purge", { id: hong.deal });
			if (tl.status !== 200) throw new Error("ttp vong doi: blob hong nem");
			const cho1 = await db.blobChoXoa.findMany({
				where: { pathname: { in: pathHong } },
			});
			if (cho1.length !== pathHong.length)
				throw new Error("ttp vong doi: blob hong cho thieu");
			await donLich();
			const cho2 = await db.blobChoXoa.findMany({
				where: { pathname: { in: pathHong } },
			});
			const tang = cho2.every(
				(h) =>
					h.lanThu > (cho1.find((c) => c.pathname === h.pathname)?.lanThu ?? 0),
			);
			if (cho2.length !== pathHong.length || !tang)
				throw new Error("ttp vong doi: blob hong cho lanThu");
		} finally {
			for (const p of pathHong) kho.xoaHong.delete(p);
		}
		await donLich();
		if (
			(await db.blobChoXoa.count({ where: { pathname: { in: pathHong } } })) > 0
		) {
			throw new Error("ttp vong doi: don lai");
		}

		const truong = await dung("truong");
		const truocTruong = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
			await san.hoi("quanTri", "deals.byId", { id: truong.deal }),
			"byId",
		);
		canData(
			await san.goi("quanTri", "fields.archive", { id: truong.fDeal.id }),
			"archive truong",
		);
		canData(
			await san.goi("quanTri", "fields.restore", { id: truong.fDeal.id }),
			"restore truong",
		);
		const sauTruong = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
			await san.hoi("quanTri", "deals.byId", { id: truong.deal }),
			"byId",
		);
		if (
			JSON.stringify(sauTruong.tepTheoTruong) !==
			JSON.stringify(truocTruong.tepTheoTruong)
		) {
			throw new Error("ttp vong doi: truong luu tru");
		}

		const o: OTep = {
			entity: "DEAL",
			recordId: truong.deal,
			fieldKey: truong.fDeal.key,
		};
		const xin = (await xinCho("nv1", o, "do.pdf", "pdf", 10)).data as Xin;
		kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}do`));
		await donLich();
		if (!kho.daPut.has(xin.pathname))
			throw new Error("ttp vong doi: tai do xoa som");
		setSystemTime(new Date(Date.now() + 61 * 60_000));
		try {
			await donLich();
		} finally {
			setSystemTime();
		}
		if (
			kho.daPut.has(xin.pathname) ||
			(await db.blobChoXoa.findUnique({ where: { pathname: xin.pathname } }))
		) {
			throw new Error("ttp vong doi: tai do khong don");
		}
		const daNhan = await db.fieldFile.findUnique({
			where: { id: truong.tep.deal[0] },
		});
		if (
			daNhan &&
			(await db.blobChoXoa.findUnique({
				where: { pathname: daNhan.blobPathname },
			}))
		) {
			throw new Error("ttp vong doi: complete con cho");
		}
	});
});

describe("ttp-loc", () => {
	const tienTo = `${TIEN_TO}loc`;

	it("ttp-loc: Có tệp / Chưa có tệp ở ba danh sách, bảng cột, số đếm, bộ lọc đã lưu, chiến dịch", async () => {
		const congTy = await taoCongTy(`${TIEN_TO}nenloc cong ty`);
		const LIST = {
			DEAL: "deals.list",
			COMPANY: "companies.list",
			CONTACT: "contacts.list",
		} as const;
		const truong = {} as Record<FieldEntityName, TruongTao>;
		const ten = {} as Record<FieldEntityName, Map<string, string>>;
		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			truong[entity] = await taoTruong(entity, `${tienTo} loc ${entity}`, {
				showOnFilter: true,
			});
			ten[entity] = new Map();
			for (const nhan of ["A", "B", "C"] as const) {
				const id =
					entity === "DEAL"
						? await taoThoaThuan(`${tienTo} ${nhan}`, congTy)
						: entity === "COMPANY"
							? await taoCongTy(`${tienTo} ${nhan}`)
							: await taoCaNhan(`${tienTo} ${nhan}`, congTy);
				ten[entity].set(id, nhan);
				const o: OTep = { entity, recordId: id, fieldKey: truong[entity].key };
				if (nhan === "A") {
					await canGan(
						"nv1",
						o,
						"a1.pdf",
						"pdf",
						MAU_TEP.pdf(`${tienTo}${entity}a1`),
					);
					await canGan(
						"nv1",
						o,
						"a2.pdf",
						"pdf",
						MAU_TEP.pdf(`${tienTo}${entity}a2`),
					);
				}
				if (nhan === "C") {
					const c = await canGan(
						"nv1",
						o,
						"c.pdf",
						"pdf",
						MAU_TEP.pdf(`${tienTo}${entity}c`),
					);
					canData(
						await san.goi("quanTri", "fieldFiles.remove", { tepId: c }),
						"remove C",
					);
				}
			}
		}
		const DAP_AN = { some: "A", none: "B,C", "some,none": "A,B,C" } as const;
		const loc = async (
			thuTuc: string,
			entity: FieldEntityName,
			gia: string[],
		) => {
			const vao = {
				q: tienTo,
				pageSize: 50,
				fields: { [truong[entity].key]: gia },
			};
			const tl = await san.hoi(
				"quanTri",
				thuTuc,
				thuTuc === "deals.board" ? { q: tienTo, fields: vao.fields } : vao,
			);
			const kq = canData<{
				rows?: { id: string }[];
				total?: number;
				facetCounts?: Record<string, Record<string, number>>;
				columns?: { count: number; cards: { id: string }[] }[];
			}>(tl, thuTuc);
			const ids =
				kq.rows?.map((r) => r.id) ??
				kq.columns?.flatMap((c) => c.cards.map((x) => x.id)) ??
				[];
			const tong =
				kq.total ?? kq.columns?.reduce((t, c) => t + c.count, 0) ?? -1;
			return { ids, tong, kq };
		};
		let so = 0;
		for (const [thuTuc, entity] of [
			["deals.list", "DEAL"],
			["companies.list", "COMPANY"],
			["contacts.list", "CONTACT"],
			["deals.board", "DEAL"],
		] as const) {
			for (const [boLoc, mong] of Object.entries(DAP_AN)) {
				const { ids, tong } = await loc(thuTuc, entity, boLoc.split(","));
				const ra = ids
					.map((id) => ten[entity].get(id))
					.filter(Boolean)
					.sort()
					.join(",");
				if (ra !== mong)
					throw new Error(`ttp loc: ${thuTuc} ${boLoc} ra ${ra}`);
				if (tong !== mong.split(",").length)
					throw new Error(`ttp loc: total ${thuTuc} ${boLoc} ${tong}`);
				so += 1;
			}
		}
		if (so !== 12) throw new Error(`ttp loc: thieu o ${so}`);

		const khoa = truong.DEAL.key;
		const goc = await san.hoi("quanTri", "deals.list", {
			q: tienTo,
			pageSize: 50,
		});
		const dem =
			canData<{ facetCounts: Record<string, Record<string, number>> }>(
				goc,
				"dem",
			).facetCounts[`field:${khoa}`] ?? {};
		for (const gia of ["some", "none"]) {
			if (dem[gia] === undefined) throw new Error(`ttp loc: thieu dem ${gia}`);
			const { tong } = await loc("deals.list", "DEAL", [gia]);
			if (dem[gia] !== tong)
				throw new Error(`ttp loc: dem ${gia} ${dem[gia]} ${tong}`);
		}

		const khoaLh = truong.CONTACT.key;
		const view = canData<{ id: string; filters: unknown }>(
			await san.goi("quanTri", "savedViews.create", {
				entity: "CONTACT",
				name: `${tienTo} chua co hop dong`,
				filters: { q: tienTo, filters: { [`field:${khoaLh}`]: ["none"] } },
			}),
			"savedViews.create",
		);
		const ds = canData<{ id: string; filters: unknown }[]>(
			await san.hoi("quanTri", "savedViews.list", { entity: "CONTACT" }),
			"savedViews.list",
		);
		const docLai = ds.find((v) => v.id === view.id);
		if (!docLai || !savedViewFilters.safeParse(docLai.filters).success)
			throw new Error("ttp loc: khuon luu");
		const camp = canData<{ id: string }>(
			await san.goi("quanTri", "campaigns.create", {
				name: `${tienTo} chien dich`,
				savedViewId: view.id,
			}),
			"campaigns.create",
		);
		const chiTiet = canData<{ stats: { members: number } }>(
			await san.hoi("quanTri", "campaigns.byId", { id: camp.id }),
			"campaigns.byId",
		);
		const { tong: tongLh } = await loc("contacts.list", "CONTACT", ["none"]);
		if (chiTiet.stats.members !== tongLh)
			throw new Error(`ttp loc: chien dich ${chiTiet.stats.members} ${tongLh}`);
		await db.campaign.deleteMany({ where: { id: camp.id } });
		await db.savedView.deleteMany({ where: { id: view.id } });

		for (const gia of ["yes", "has:x"]) {
			const tl = await san.hoi("quanTri", "deals.list", {
				q: tienTo,
				fields: { [khoa]: [gia] },
			});
			if (
				tl.ma !== "BAD_REQUEST" ||
				!(tl.loi.includes(khoa) || tl.loi.includes(`${tienTo} loc DEAL`))
			) {
				throw new Error(`ttp loc: hong ${gia}`);
			}
		}
		const { ids: tatCa } = await loc("deals.list", "DEAL", []);
		if (
			tatCa
				.map((id) => ten.DEAL.get(id))
				.filter(Boolean)
				.sort()
				.join(",") !== "A,B,C"
		) {
			throw new Error("ttp loc: doi chung");
		}
	});
});

describe("ttp-tat", () => {
	const tienTo = `${TIEN_TO}tat`;
	const sanTat = dungSan({ ten: "tat" });
	const GIU = [
		"TEP_BAN_GHI_BLOB_TOKEN",
		"KHO_TAI_LIEU_BLOB_TOKEN",
		"BLOB_READ_WRITE_TOKEN",
	] as const;
	const truoc: Record<string, string | undefined> = {};

	beforeAll(() => {
		for (const ten of GIU) truoc[ten] = process.env[ten];
		process.env.TEP_BAN_GHI_BLOB_TOKEN = "";
		process.env.KHO_TAI_LIEU_BLOB_TOKEN = "vercel_blob_rw_kho_gia";
		process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_logo_gia";
	});

	afterAll(() => {
		for (const ten of GIU) {
			if (truoc[ten] === undefined) delete process.env[ten];
			else process.env[ten] = truoc[ten];
		}
	});

	it("ttp-tat: thiếu khoá tệp thì mất khả năng, tên tệp vẫn đọc, remove để Blob trong hàng chờ", async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const f = await taoTruong("DEAL", `${tienTo} hd`);
		const deal = await taoThoaThuan(`${tienTo} T1`, congTy);
		const o: OTep = { entity: "DEAL", recordId: deal, fieldKey: f.key };
		const tepId = await canGan(
			"nv1",
			o,
			"con.pdf",
			"pdf",
			MAU_TEP.pdf(`${tienTo}con`),
		);
		const tepHai = await canGan(
			"nv1",
			o,
			"hai.pdf",
			"pdf",
			MAU_TEP.pdf(`${tienTo}hai`),
		);

		const trangThai = canData<{ bat: boolean }>(
			await sanTat.hoi("nv1", "fieldFiles.status"),
			"status",
		);
		if (trangThai.bat) throw new Error("ttp tat: status");
		const THU_TUC = [
			[
				"fieldFiles.requestUpload",
				{ ...o, tenTep: "a.pdf", kieu: "pdf", kichThuoc: 10 },
			],
			[
				"fieldFiles.complete",
				{ ...o, tenTep: "a.pdf", pathname: "truong-tep/x", phieu: "1.x" },
			],
			["fieldFiles.downloadUrl", { tepId }],
		] as const;
		for (const [thuTuc, vao] of THU_TUC) {
			const ai = thuTuc === "fieldFiles.downloadUrl" ? "quanTri" : "nv1";
			const tl = await sanTat.goi(ai, thuTuc, vao);
			if (tl.ma !== "PRECONDITION_FAILED" || !tl.loi.includes(T.tat)) {
				throw new Error(`ttp tat: ${thuTuc}`);
			}
		}
		const ct = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
			await sanTat.hoi("quanTri", "deals.byId", { id: deal }),
			"byId",
		);
		if (
			(ct.tepTheoTruong[f.key] ?? []).map((t) => t.tenTep).join() !==
			"con.pdf,hai.pdf"
		) {
			throw new Error("ttp tat: ten mat");
		}
		const pathHai = (await db.fieldFile.findUnique({ where: { id: tepHai } }))
			?.blobPathname as string;
		const xoa = await sanTat.goi("quanTri", "fieldFiles.remove", {
			tepId: tepHai,
		});
		if (
			xoa.status !== 200 ||
			(await db.fieldFile.findUnique({ where: { id: tepHai } })) ||
			!(await db.blobChoXoa.findUnique({ where: { pathname: pathHai } }))
		) {
			throw new Error("ttp tat: remove");
		}
		const coTep = canData<{ bat: boolean }>(
			await san.hoi("nv1", "fieldFiles.status"),
			"status chinh",
		);
		if (!coTep.bat) throw new Error("ttp tat: doi chung");
	});

	it("ttp-tat: biến khoá có ở .env.example, env.validation.ts, turbo.json của API", () => {
		const goc = `${import.meta.dir}/../../..`;
		const doc = (tep: string) => readFileSync(`${goc}/${tep}`, "utf8");
		const vd = doc(".env.example").split("\n");
		const i = vd.findIndex((d) => d.startsWith("# TEP_BAN_GHI_BLOB_TOKEN="));
		if (i < 1 || !vd[i - 1]?.startsWith("#"))
			throw new Error("ttp khoa: khai .env.example");
		if (
			!doc("apps/api/src/config/env.validation.ts").includes(
				"TEP_BAN_GHI_BLOB_TOKEN?: string;",
			)
		) {
			throw new Error("ttp khoa: khai apps/api/src/config/env.validation.ts");
		}
		if (!doc("apps/api/turbo.json").includes('"TEP_BAN_GHI_BLOB_TOKEN"')) {
			throw new Error("ttp khoa: khai apps/api/turbo.json");
		}
	});
});
