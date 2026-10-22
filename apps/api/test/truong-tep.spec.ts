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
import { db } from "@crm/db";
import type { FieldEntityName } from "@crm/db/fields";
import { FIELD_FILE_COPY } from "@crm/db/fields";
import { TEP_TRUONG, tepTrongO, type TepTrongO } from "@crm/validation/tep-truong";
import { Logger } from "@nestjs/common";
import {
	GOC_KHO_GIA,
	khoTepTruongGia,
} from "../../../packages/db/test/blob-tep-truong-gia";
import {
	type Ai,
	canData,
	donBanGhi,
	KIEU_MAU,
	MAU_TEP,
	type OTep,
	TIEN_TO,
	type TraLoi,
	dungSan,
} from "./truong-tep-san";

const T = TEP_TRUONG.thongDiep;
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

const sha = (byte: Uint8Array) => createHash("sha256").update(byte).digest("hex");

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
		await canGan("nv1", { entity: "DEAL", recordId: deal, fieldKey: coTep.key }, "a.pdf", "pdf", MAU_TEP.pdf(`${tienTo}a`));
		const doi = await san.goi("quanTri", "fields.update", {
			id: coTep.id,
			data: { type: "TEXT" },
		});
		if (doi.ma !== "CONFLICT") throw new Error("ttp tao truong: doi kieu co tep");
		const doc = await db.fieldDefinition.findUnique({ where: { id: coTep.id } });
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
			o[entity] = { entity, recordId: banGhi[entity], fieldKey: f.key, fieldId: f.id };
			const thuTu: string[] = [];
			for (const kieu of ["pdf", "docx", "png", "jpeg"] as const) {
				const byte = MAU_TEP[kieu](`${tienTo}${entity}${kieu}`);
				const mau = KIEU_MAU[kieu];
				const { tl, xin } = await ganTep("nv1", o[entity], mau.ten, mau.kieu, byte);
				if (!xin) throw new Error(`ttp tai len: ${entity} ${kieu} thieu thu tuc`);
				if (!xin.url.startsWith(GOC_KHO_GIA)) {
					throw new Error(`ttp tai len: url qua api ${xin.url}`);
				}
				const { tepId } = canData<{ tepId: string }>(tl, `${entity} ${kieu}`);
				const dong = await db.fieldFile.findUnique({ where: { id: tepId } });
				if (!dong) throw new Error(`ttp tai len: ${entity} ${kieu} hang`);
				if (dong.kieu !== kieu) throw new Error(`ttp tai len: ${entity} ${kieu} kieu`);
				if (dong.kichThuoc !== byte.length) {
					throw new Error(`ttp tai len: ${entity} ${kieu} kichThuoc`);
				}
				if (dong.sha256 !== sha(byte)) throw new Error(`ttp tai len: ${entity} ${kieu} sha256`);
				if (dong.taiBoiId !== san.phien.nv1.nguoi) {
					throw new Error(`ttp tai len: ${entity} ${kieu} taiBoiId`);
				}
				thuTu.push(mau.ten);
				so += 1;
			}
			const thuTuc =
				entity === "DEAL" ? "deals.byId" : entity === "COMPANY" ? "companies.byId" : "contacts.byId";
			const chiTiet = canData<{ tepTheoTruong: Record<string, TepTrongO[]> }>(
				await san.hoi("quanTri", thuTuc, { id: banGhi[entity] }),
				thuTuc,
			);
			const ds = chiTiet.tepTheoTruong[o[entity].fieldKey] ?? [];
			if (ds.map((t) => t.tenTep).join("|") !== thuTu.join("|")) {
				throw new Error(`ttp tai len: byId ${entity} ${ds.map((t) => t.tenTep).join(",")}`);
			}
			for (const t of ds) {
				if (!tepTrongO.safeParse(t).success) throw new Error(`ttp tai len: khuon ${entity}`);
			}
		}
		if (so !== 12) throw new Error(`ttp tai len: thieu o ${so}`);

		const dem = async (thuTuc: string, vao: object, id: string, khoa: string) => {
			const kq = canData<{ rows?: { id: string; soTepTheoTruong: Record<string, number> }[]; columns?: { cards: { id: string; soTepTheoTruong: Record<string, number> }[] }[] }>(
				await san.hoi("quanTri", thuTuc, vao),
				thuTuc,
			);
			const hang = kq.rows ?? kq.columns?.flatMap((c) => c.cards) ?? [];
			return hang.find((h) => h.id === id)?.soTepTheoTruong[khoa];
		};
		const kiemDem = (thuTuc: string, n: number | undefined, mong: number) => {
			if (n !== mong) throw new Error(`ttp tai len: dem ${thuTuc} ${n}`);
		};
		kiemDem("deals.list", await dem("deals.list", { q: tienTo, pageSize: 50 }, deal, o.DEAL.fieldKey), 4);
		kiemDem("deals.list", await dem("deals.list", { q: tienTo, pageSize: 50 }, dealKhong, o.DEAL.fieldKey), 0);
		kiemDem("deals.board", await dem("deals.board", { q: tienTo }, deal, o.DEAL.fieldKey), 4);
		kiemDem("companies.list", await dem("companies.list", { q: tienTo, pageSize: 50 }, congTy, o.COMPANY.fieldKey), 4);
		kiemDem("contacts.list", await dem("contacts.list", { q: tienTo, pageSize: 50 }, caNhan, o.CONTACT.fieldKey), 4);

		const dealPhu = await taoThoaThuan(`${tienTo} T3`, congTy);
		const oPhu = { entity: "DEAL" as const, recordId: dealPhu, fieldKey: o.DEAL.fieldKey };
		const pdfTenDocx = await canGan("nv1", oPhu, "phu luc.docx", "docx", MAU_TEP.pdf(`${tienTo}doiduoi`));
		const docDoi = await db.fieldFile.findUnique({ where: { id: pdfTenDocx } });
		if (docDoi?.kieu !== "pdf") throw new Error("ttp tai len: kieu theo ten");
		const tenDai = `Hợp đồng hợp tác — bản ký 2026 ${"đối tác ".repeat(30)}`.slice(0, 236) + ".pdf";
		const idDai = await canGan("nv1", oPhu, tenDai, "pdf", MAU_TEP.pdf(`${tienTo}tendai`));
		const docDai = await db.fieldFile.findUnique({ where: { id: idDai } });
		if (docDai?.tenTep !== tenDai.normalize("NFC")) throw new Error("ttp tai len: ten doi");
	});
});

describe("ttp-tu-choi", () => {
	const tienTo = `${TIEN_TO}tuc`;
	const ctx = {} as {
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
		ctx.p0 = { xin: g.xin as Xin, byte, tepId: canData<{ tepId: string }>(g.tl, "p0").tepId };
		canData(await san.goi("quanTri", "fields.archive", { id: ctx.fLuu.id }), "archive truong");
		canData(await san.goi("quanTri", "deals.archive", { id: ctx.t3.recordId }), "archive T3");
		for (let i = 0; i < TEP_TRUONG.toiDaTepMoiO; i += 1) {
			await canGan("nv1", ctx.t4, `day${i}.pdf`, "pdf", MAU_TEP.pdf(`${tienTo}day${i}`));
		}
	});

	it("ttp-tu-choi: 17 ô từ chối viết trước, ca trùng, ca đua, đối chứng dương", async () => {
		const MB = 1024 * 1024;
		type O = {
			o: string;
			chay: () => Promise<{ tl: TraLoi; pathname: string | null; ve: OTep }>;
			chu: string;
		};
		const quaPut = async (ve: OTep, ten: string, kieu: string, byte: Uint8Array, khai = byte.length) => {
			const tlXin = await xinCho("nv1", ve, ten, kieu, khai);
			if (tlXin.status !== 200) return { tl: tlXin, pathname: null, ve };
			const xin = tlXin.data as Xin;
			kho.put(xin.pathname, byte);
			return { tl: await nhan("nv1", ve, ten, xin), pathname: xin.pathname, ve };
		};
		const chiXin = async (ve: OTep, ten: string, kieu: string, khai: number) => ({
			tl: await xinCho("nv1", ve, ten, kieu, khai),
			pathname: null,
			ve,
		});
		const phieuLech = async (doi: (xin: Xin) => string) => {
			const tlXin = await xinCho("nv1", ctx.t1, "x.pdf", "pdf", 10);
			const xin = tlXin.data as Xin;
			kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}${Math.random()}`));
			return { tl: await nhan("nv1", ctx.t1, "x.pdf", xin, doi(xin)), pathname: xin.pathname, ve: ctx.t1 };
		};
		const BANG: O[] = [
			{ o: "rac duoi pdf", chu: T.saiKieu, chay: () => quaPut(ctx.t1, "rac.pdf", "pdf", new TextEncoder().encode("khong phai pdf")) },
			{ o: "xlsx", chu: T.saiKieu, chay: () => chiXin(ctx.t1, "bang.xlsx", "pdf", 100) },
			{ o: "qua co", chu: T.quaCo, chay: () => chiXin(ctx.t1, "lon.pdf", "pdf", 20 * MB + 1) },
			{ o: "rong", chu: T.rong, chay: () => chiXin(ctx.t1, "rong.pdf", "pdf", 0) },
			{ o: "khai nho put lon", chu: T.quaCo, chay: () => quaPut(ctx.t1, "lon2.pdf", "pdf", new Uint8Array(20 * MB + 1).fill(0x25, 0, 1).fill(0x50, 1, 2).fill(0x44, 2, 3).fill(0x46, 3, 4).fill(0x2d, 4, 5), MB) },
			{ o: "docx macro", chu: T.macro, chay: () => quaPut(ctx.t1, "macro.docx", "docx", MAU_TEP.docxMacro(tienTo)) },
			{ o: "o day", chu: T.day, chay: () => chiXin(ctx.t4, "them.pdf", "pdf", 10) },
			{ o: "phieu gia", chu: T.phieuSai, chay: () => phieuLech((x) => `${x.phieu.slice(0, -1)}${x.phieu.endsWith("A") ? "B" : "A"}`) },
			{
				o: "phieu cua T2",
				chu: T.phieuSai,
				chay: async () => {
					const xin = (await xinCho("nv1", ctx.t2, "x.pdf", "pdf", 10)).data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}t2`));
					return { tl: await nhan("nv1", ctx.t1, "x.pdf", xin), pathname: xin.pathname, ve: ctx.t1 };
				},
			},
			{
				o: "phieu het han",
				chu: T.phieuSai,
				chay: async () => {
					const xin = (await xinCho("nv1", ctx.t1, "x.pdf", "pdf", 10)).data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}han`));
					setSystemTime(new Date(Date.now() + 61 * 60_000));
					try {
						return { tl: await nhan("nv1", ctx.t1, "x.pdf", xin), pathname: xin.pathname, ve: ctx.t1 };
					} finally {
						setSystemTime();
					}
				},
			},
			{
				o: "pathname P0",
				chu: T.phieuSai,
				chay: async () => ({ tl: await nhan("nv1", ctx.t1, "p0.pdf", ctx.p0.xin), pathname: null, ve: ctx.t1 }),
			},
			{ o: "T3 luu tru", chu: T.luuTru, chay: () => chiXin(ctx.t3, "a.pdf", "pdf", 10) },
			{ o: "truong luu tru", chu: T.khongNhanTep, chay: () => chiXin({ ...ctx.t1, fieldKey: ctx.fLuu.key }, "a.pdf", "pdf", 10) },
			{ o: "truong ca nhan", chu: T.khongNhanTep, chay: () => chiXin({ ...ctx.t1, fieldKey: ctx.fCaNhan.key }, "a.pdf", "pdf", 10) },
			{ o: "truong chu", chu: T.khongNhanTep, chay: () => chiXin({ ...ctx.t1, fieldKey: ctx.fChu.key }, "a.pdf", "pdf", 10) },
			{ o: "ban ghi khong co", chu: T.khongCoBanGhi, chay: () => chiXin({ ...ctx.t1, recordId: `${tienTo}khongco` }, "a.pdf", "pdf", 10) },
			{
				o: "luu tru giua chung",
				chu: T.luuTru,
				chay: async () => {
					const xin = (await xinCho("nv1", ctx.t2, "g.pdf", "pdf", 10)).data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}giua`));
					canData(await san.goi("quanTri", "deals.archive", { id: ctx.t2.recordId }), "archive T2");
					try {
						return { tl: await nhan("nv1", ctx.t2, "g.pdf", xin), pathname: xin.pathname, ve: ctx.t2 };
					} finally {
						canData(await san.goi("quanTri", "deals.restore", { id: ctx.t2.recordId }), "restore T2");
					}
				},
			},
		];
		let so = 0;
		for (const o of BANG) {
			const { tl, pathname, ve } = await o.chay();
			if (tl.status === 200) throw new Error(`ttp tu choi: ${o.o} nhan`);
			if (!tl.loi.includes(o.chu)) throw new Error(`ttp tu choi: ${o.o} loi ${tl.loi}`);
			const t1 = await tepTrongDb(ctx.t1, ctx.f.id);
			if (t1.map((x) => x.id).join() !== ctx.p0.tepId) throw new Error(`ttp tu choi: ${o.o} ghi hang`);
			if (ve === ctx.t2 && (await tepTrongDb(ctx.t2, ctx.f.id)).length > 0) {
				throw new Error(`ttp tu choi: ${o.o} ghi hang`);
			}
			if (pathname && kho.daPut.has(pathname)) throw new Error(`ttp tu choi: ${o.o} blob con`);
			if (!kho.daPut.has(ctx.p0.xin.pathname)) throw new Error("ttp tu choi: xoa nham P0");
			so += 1;
		}
		if (so !== 17) throw new Error(`ttp tu choi: thieu o ${so}`);
		if ((await tepTrongDb(ctx.t4, ctx.f.id)).length !== TEP_TRUONG.toiDaTepMoiO) {
			throw new Error("ttp tu choi: o day ghi hang");
		}

		const trung = await ganTep("nv1", ctx.t1, "p0 lai.pdf", "pdf", ctx.p0.byte);
		const kqTrung = canData<{ tepId: string; trung: boolean }>(trung.tl, "trung");
		if (!kqTrung.trung || kqTrung.tepId !== ctx.p0.tepId) throw new Error("ttp tu choi: trung tra");
		if (trung.xin && kho.daPut.has(trung.xin.pathname)) throw new Error("ttp tu choi: trung blob");
		if ((await tepTrongDb(ctx.t1, ctx.f.id)).length !== 1) throw new Error("ttp tu choi: trung hang");

		const sangT2 = await ganTep("nv1", ctx.t2, "p0.pdf", "pdf", ctx.p0.byte);
		const kqT2 = canData<{ trung: boolean }>(sangT2.tl, "trung T2");
		if (kqT2.trung || (await tepTrongDb(ctx.t2, ctx.f.id)).length !== 1) {
			throw new Error("ttp tu choi: trung khac ban ghi");
		}

		const congTy = daTao.company.at(-1) as string;
		const t5: OTep = { entity: "DEAL", recordId: await taoThoaThuan(`${tienTo} T5`, congTy), fieldKey: ctx.f.key };
		const byteDua = MAU_TEP.pdf(`${tienTo}dua`);
		const [x1, x2] = [
			(await xinCho("nv1", t5, "d1.pdf", "pdf", byteDua.length)).data as Xin,
			(await xinCho("nv1", t5, "d2.pdf", "pdf", byteDua.length)).data as Xin,
		];
		kho.put(x1.pathname, byteDua);
		kho.put(x2.pathname, byteDua);
		await Promise.all([nhan("nv1", t5, "d1.pdf", x1), nhan("nv1", t5, "d2.pdf", x2)]);
		const soDua = (await tepTrongDb(t5, ctx.f.id)).length;
		if (soDua !== 1) throw new Error(`ttp tu choi: dua ${soDua}`);

		const doiChung = await ganTep("nv1", ctx.t1, "moi.pdf", "pdf", MAU_TEP.pdf(`${tienTo}moi`));
		if (doiChung.tl.status !== 200) throw new Error("ttp tu choi: doi chung");
		expect(so).toBe(17);
	});
});

describe("ttp-quyen", () => {
	const tienTo = `${TIEN_TO}qy`;

	it("ttp-quyen: 3 vai × 6 thủ tục, hạn URL, cờ mở và xoá trong byId", async () => {
		const congTy = await taoCongTy(`${tienTo} cong ty`);
		const f = await taoTruong("DEAL", `${tienTo} hd`);
		const deal = await taoThoaThuan(`${tienTo} T1`, congTy);
		const o: OTep = { entity: "DEAL", recordId: deal, fieldKey: f.key };
		const f1 = await canGan("nv1", o, "f1.pdf", "pdf", MAU_TEP.pdf(`${tienTo}f1`));
		const f2 = await canGan("quanTri", o, "f2.pdf", "pdf", MAU_TEP.pdf(`${tienTo}f2`));
		const VAI = ["quanTri", "nv1", "okr"] as const;
		const DAP_AN = {
			"deals.byId": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.status": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.requestUpload": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.complete": { quanTri: "ok", nv1: "ok", okr: "FORBIDDEN" },
			"fieldFiles.downloadUrl": { quanTri: "ok", nv1: "FORBIDDEN", okr: "FORBIDDEN" },
			"fieldFiles.remove": { quanTri: "ok", nv1: "FORBIDDEN", okr: "FORBIDDEN" },
		} as const;
		let so = 0;
		for (const [thuTuc, theoVai] of Object.entries(DAP_AN)) {
			for (const ai of VAI) {
				let tl: TraLoi;
				if (thuTuc === "deals.byId") tl = await san.hoi(ai, thuTuc, { id: deal });
				else if (thuTuc === "fieldFiles.status") tl = await san.hoi(ai, thuTuc);
				else if (thuTuc === "fieldFiles.requestUpload") tl = await xinCho(ai, o, "x.pdf", "pdf", 10);
				else if (thuTuc === "fieldFiles.complete") {
					const nguoi = ai === "okr" ? "nv1" : ai;
					const xin = (await xinCho(nguoi, o, `c${ai}.pdf`, "pdf", 10)).data as Xin;
					kho.put(xin.pathname, MAU_TEP.pdf(`${tienTo}c${ai}`));
					tl = await nhan(ai, o, `c${ai}.pdf`, xin);
				} else if (thuTuc === "fieldFiles.downloadUrl") {
					tl = await san.goi(ai, thuTuc, { tepId: f1 });
					if (ai === "nv1" && tl.status === 200) {
						throw new Error("ttp quyen: member downloadUrl url");
					}
					if (ai === "nv1" && JSON.stringify(tl.data ?? "").includes("http")) {
						throw new Error("ttp quyen: lo url");
					}
					if (ai === "quanTri") {
						const han = Number(new URL((tl.data as { url: string }).url).searchParams.get("han"));
						const giay = (han - Date.now()) / 1000;
						if (!(giay > 0 && giay <= TEP_TRUONG.taiVeGiay)) throw new Error(`ttp quyen: han ${giay}`);
					}
				} else {
					const tepXoa = await canGan("quanTri", o, `xoa${ai}.pdf`, "pdf", MAU_TEP.pdf(`${tienTo}x${ai}`));
					tl = await san.goi(ai, thuTuc, { tepId: tepXoa });
				}
				const ket = tl.status === 200 ? "ok" : tl.ma;
				if (ket !== theoVai[ai]) throw new Error(`ttp quyen: ${ai} ${thuTuc} ${ket}`);
				if (thuTuc === "deals.byId" && ai === "okr" && !tl.loi.includes("KHONG_TRONG_PHAM_VI") && tl.ma !== "FORBIDDEN") {
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
			if (t?.coTheMo !== c.mo) throw new Error(`ttp quyen: co ${c.ai} ${c.tep} coTheMo`);
			if (t?.coTheXoa !== c.xoa) throw new Error(`ttp quyen: co ${c.ai} ${c.tep} coTheXoa`);
			soCo += 1;
		}
		if (soCo !== 4) throw new Error(`ttp quyen: thieu co ${soCo}`);
		if ((await coCua("quanTri")).size < 2) throw new Error("ttp quyen: doi chung");
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
			tepGoc[entity] = await canGan("nv1", { entity, recordId: banGhi[entity], fieldKey: truong[entity].key }, "goc.pdf", "pdf", MAU_TEP.pdf(`${tienTo}${entity}`));
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
				const fv = await db.fieldValue.count({ where: { fieldId: truong[entity].id } });
				if (fv > 0) throw new Error(`ttp ghi chu: ${LOI[entity]} ${gia} fieldValue`);
				const tep = await db.fieldFile.findMany({ where: { fieldId: truong[entity].id } });
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
		if (rows.map((r) => r.id).join() !== khongSort.rows.map((r) => r.id).join()) {
			throw new Error("ttp ghi chu: sort doi");
		}
		const doiChung = await san.goi("quanTri", "deals.update", {
			id: deal,
			data: { fields: { [chuDeal.key]: "duoc" } },
		});
		if (doiChung.status !== 200) throw new Error("ttp ghi chu: doi chung");
	});
});
