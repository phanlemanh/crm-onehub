import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import * as deXuatChung from "@crm/db/tai-lieu-de-xuat";
import { khoNguonGia } from "@crm/db/test/blob-nguon-gia";
import { chuanHoa } from "@crm/validation/tai-lieu-markdown";
import { parseTrichDoan } from "@crm/validation/tai-lieu-trich-doan";
import { TAI_LIEU_AGENT } from "../agent/lib/tai-lieu-config";
import * as docChuMoDun from "../agent/lib/tai-lieu-doc-chu";
import type { BanNop } from "../agent/lib/tai-lieu-nop";
import {
	dongKhiPhienHong,
	dongKhiPhienXong,
	dongMaySoanQuaHan,
	guiMaySoan,
	tokenMaySoan,
} from "../agent/lib/tai-lieu-phien";
import { chaySoanTuNguon } from "../agent/lib/tai-lieu-soan";
import {
	type CtxMaySoan,
	ctxCon,
	ketQua,
	loiDanNhan,
	nop,
	sendGia,
} from "./support/may-soan-gia";
import {
	DOAN_QUYET_DINH,
	datBanDangDung,
	datQuyTacViet,
	docMau,
	docxTu,
	donTaiLieu,
	gieoNguoi,
	gieoNguon,
	gieoTrang,
	gieoViec,
	xoaQuyTacViet,
} from "./support/tai-lieu-gieo";

const LY_DO = TAI_LIEU_AGENT.lyDo;
const SOAN = TAI_LIEU_AGENT.soan;
const MOC_QUY_TAC = "MOC-QUY-TAC-7Q";
const QUY_TAC = `## Quy tắc viết\n\nViết ngắn, mỗi con số kèm trích đoạn. ${MOC_QUY_TAC}`;
const TRICH_DAT =
	"Kể từ ngày 01/10/2026, mức hoa hồng áp dụng cho công ty đối tác tầng hai là 1,5% và tầng ba là 1,8% giá trị giao dịch đã xác nhận.";

const BAN_DAT: BanNop = {
	ten: "Hoa hồng công ty đối tác",
	noiDung:
		"## Mức hoa hồng\n\nKể từ ngày 01/10/2026, công ty đối tác tầng hai hưởng 1,5% và tầng ba hưởng 1,8% giá trị giao dịch đã xác nhận.\n\n## Đối tượng\n\nCác công ty đối tác đã ký hợp đồng khung.",
	trichDoan: [{ menhDe: "Mức và ngày áp dụng", trich: TRICH_DAT }],
};

const gia = khoNguonGia();
const model = sendGia();
let nguoiId = "";

type Phien = {
	nguonId: string;
	trangId: string;
	taskId: string;
	ctx: CtxMaySoan | null;
	con: CtxMaySoan | null;
};

async function moPhien(input: {
	trangId?: string;
	byte?: Uint8Array;
}): Promise<Phien> {
	const trangId = input.trangId ?? (await gieoTrang(nguoiId));
	const nguon = await gieoNguon({
		tep: "quyet-dinh.docx",
		trangId,
		taiBoiId: nguoiId,
		byte: input.byte ?? docxTu(DOAN_QUYET_DINH),
	});
	gia.daPut.set(nguon.pathname, nguon.byte);
	const task = await gieoViec(nguon.id);
	await chaySoanTuNguon(task, gia);
	const truoc = model.goi.length;
	const hang = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguon.id },
		select: { trangThai: true },
	});
	if (hang.trangThai === "CHO_SOAN") await guiMaySoan(nguon.id, model.send);
	const moi = model.goi.length > truoc ? model.goi.at(-1) : undefined;
	return {
		nguonId: nguon.id,
		trangId,
		taskId: task.id,
		ctx: moi?.ctx ?? null,
		con: moi?.con ?? null,
	};
}

async function canCtx(p: Phien): Promise<CtxMaySoan> {
	if (!p.ctx) throw new Error("phien may soan khong mo");
	return p.ctx;
}

async function canCon(p: Phien): Promise<CtxMaySoan> {
	if (!p.con) throw new Error("phien may soan khong mo");
	return p.con;
}

async function demDeXuat(trangId: string): Promise<number> {
	return db.taiLieuDeXuat.count({ where: { trangId, nguonId: { not: null } } });
}

beforeAll(async () => {
	nguoiId = await gieoNguoi();
	await datQuyTacViet(nguoiId, QUY_TAC);
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donTaiLieu([nguoiId]);
});

async function kiemDat(p: Phien, banGocMongDoi: string | null) {
	const ctx = await canCtx(p);
	const con = await canCon(p);
	const trangTruoc = await db.taiLieuTrang.findUniqueOrThrow({
		where: { id: p.trangId },
		select: { banDangDungId: true },
	});
	const loiDan = await loiDanNhan(con);
	expect(loiDan, "loi dan thieu quy tac viet").toContain(MOC_QUY_TAC);
	expect(await nop(BAN_DAT, con)).toBeNull();
	await ketQua(ctx, false);
	await dongKhiPhienXong(tokenMaySoan(p.nguonId));
	const deXuat = await db.taiLieuDeXuat.findMany({
		where: { nguonId: p.nguonId },
	});
	expect(deXuat.length).toBe(1);
	const dx = deXuat[0];
	if (!dx) throw new Error("khong co de xuat");
	expect(dx.trangThai).toBe("CHO_DUYET");
	expect(dx.taoBoiId).toBe(nguoiId);
	expect(dx.banGocId).toBe(banGocMongDoi);
	expect(() => parseTrichDoan(dx.trichDoan)).not.toThrow();
	expect(dx.noiDung).toBe(dx.noiDung.normalize("NFC"));
	expect(dx.noiDung).toBe(chuanHoa(BAN_DAT.noiDung));
	const suKien = await db.taiLieuSuKien.findMany({
		where: { trangId: p.trangId, loai: "DE_XUAT" },
		select: { chiTiet: true },
	});
	expect(
		suKien.some((s) => (s.chiTiet as { deXuatId?: string }).deXuatId === dx.id),
	).toBe(true);
	const trangSau = await db.taiLieuTrang.findUniqueOrThrow({
		where: { id: p.trangId },
		select: { banDangDungId: true },
	});
	expect(trangSau.banDangDungId).toBe(trangTruoc.banDangDungId);
	const nguon = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: p.nguonId },
		select: { trangThai: true },
	});
	expect(nguon.trangThai).toBe("DA_SOAN");
	return dx;
}

const NOP = join(import.meta.dir, "..", "agent", "lib", "tai-lieu-nop.ts");
const DICH_VU_API = join(
	import.meta.dir,
	"..",
	"..",
	"api",
	"src",
	"tai-lieu",
	"tai-lieu.service.ts",
);
const MO_DUN_CHUNG = '"@crm/db/tai-lieu-de-xuat"';

function duongGhiRieng(ma: string): string[] {
	const loi: string[] = [];
	if (/taiLieuDeXuat\s*\.\s*create(Many)?\s*\(/.test(ma)) {
		loi.push("may soan khong di duong ghi chung");
	}
	if (!ma.includes(MO_DUN_CHUNG) || !/taoDeXuatTaiLieu\s*\(/.test(ma)) {
		loi.push("may soan khong di duong ghi chung");
	}
	return [...new Set(loi)];
}

describe("soan-dat", () => {
	test("soan-dat: trang moi, mot de xuat cho duyet qua nop_ban_de_xuat that", async () => {
		const p = await moPhien({});
		expect(model.goi.at(-1)?.trangThaiLucGoi).toBe("DANG_SOAN");
		await kiemDat(p, null);
	});

	test("soan-dat: trang dang dung, banGocId la ban dang dung luc soan", async () => {
		const trangId = await gieoTrang(nguoiId);
		await datBanDangDung(trangId, nguoiId, "## Hoa hồng\n\nMức cũ.");
		const { banDangDungId } = await db.taiLieuTrang.findUniqueOrThrow({
			where: { id: trangId },
			select: { banDangDungId: true },
		});
		const p = await moPhien({ trangId });
		await kiemDat(p, banDangDungId);
	});

	test("soan-dat: ban goc doi giua luc soan, ban may giu B1 va hien cu", async () => {
		const trangId = await gieoTrang(nguoiId);
		await datBanDangDung(trangId, nguoiId, "## Hoa hồng\n\nMức B1.");
		const b1 = (
			await db.taiLieuTrang.findUniqueOrThrow({
				where: { id: trangId },
				select: { banDangDungId: true },
			})
		).banDangDungId;
		const p = await moPhien({ trangId });
		const con = await canCon(p);
		await datBanDangDung(trangId, nguoiId, "## Hoa hồng\n\nMức B2.");
		const b2 = (
			await db.taiLieuTrang.findUniqueOrThrow({
				where: { id: trangId },
				select: { banDangDungId: true },
			})
		).banDangDungId;
		expect(b2).not.toBe(b1);
		const loiDan = await loiDanNhan(con);
		expect(loiDan).toContain("Mức B1.");
		expect(loiDan).not.toContain("Mức B2.");
		expect(await nop(BAN_DAT, con)).toBeNull();
		const dx = await db.taiLieuDeXuat.findFirstOrThrow({
			where: { nguonId: p.nguonId },
		});
		expect(dx.banGocId, "ban may bi de len B2").toBe(b1);
		expect(dx.trangThai === "CHO_DUYET" && dx.banGocId !== b2).toBe(true);
	});

	test("soan-dat: phien con tim nguon qua phien goc, phien la bi tu choi", async () => {
		const p = await moPhien({});
		const hang = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: p.nguonId },
			select: { phienId: true },
		});
		expect(hang.phienId).toBe((await canCtx(p)).session.id);
		const la = ctxCon("phien-khong-co-nguon");
		expect(await nop(BAN_DAT, la)).toBe(
			"This session is not a drafting session.",
		);
		expect(await nop(BAN_DAT, await canCon(p))).toBeNull();
	});

	test("soan-dat: may soan chi ghi qua ham ghi chung voi API", async () => {
		const spy = spyOn(deXuatChung, "taoDeXuatTaiLieu");
		try {
			const truoc = spy.mock.calls.length;
			const p = await moPhien({});
			expect(await nop(BAN_DAT, await canCon(p))).toBeNull();
			expect(
				spy.mock.calls.length - truoc,
				"may soan khong di duong ghi chung",
			).toBe(1);
		} finally {
			spy.mockRestore();
		}
		const that = readFileSync(NOP, "utf8");
		expect(duongGhiRieng(that)).toEqual([]);
		expect(readFileSync(DICH_VU_API, "utf8")).toContain(MO_DUN_CHUNG);
		const pha = `${that}\nawait db.taiLieuDeXuat.create({ data: {} as never });\n`;
		expect(duongGhiRieng(pha)).toEqual(["may soan khong di duong ghi chung"]);
	});
});

type Ca = { ca: string; lyDo: string; chay: () => Promise<Phien> };

async function nopRoiXong(p: Phien, ban: BanNop): Promise<Phien> {
	const ctx = await canCtx(p);
	await nop(ban, await canCon(p));
	await ketQua(ctx, false);
	await dongKhiPhienXong(tokenMaySoan(p.nguonId));
	return p;
}

const BAN_BI_BAC: BanNop = {
	...BAN_DAT,
	noiDung: `${BAN_DAT.noiDung}\n\nTầng bốn hưởng 2,0%.`,
};

const CA_HONG: Ca[] = [
	{
		ca: "loi-500",
		lyDo: LY_DO.loiModel("500 Internal Server Error"),
		chay: async () => {
			const p = await moPhien({});
			await ketQua(await canCtx(p), true, "500 Internal Server Error");
			return p;
		},
	},
	{
		ca: "het-gio",
		lyDo: LY_DO.hetGio,
		chay: async () => {
			const p = await moPhien({});
			setSystemTime(new Date(Date.now() + SOAN.thoiGianMs + 60_000));
			await dongMaySoanQuaHan();
			setSystemTime();
			return p;
		},
	},
	{
		ca: "tra-rong",
		lyDo: LY_DO.saiKhuon("nội dung rỗng"),
		chay: async () =>
			nopRoiXong(await moPhien({}), {
				ten: "Hoa hồng",
				noiDung: "  ",
				trichDoan: [],
			}),
	},
	{
		ca: "sai-khuon",
		lyDo: LY_DO.saiKhuon("tên dài 0 ký tự"),
		chay: async () => nopRoiXong(await moPhien({}), { ...BAN_DAT, ten: "" }),
	},
	{
		ca: "bi-bac-het-tran",
		lyDo: LY_DO.biBac("số «2,0%» không có trong trích đoạn nào"),
		chay: async () => {
			const p = await moPhien({});
			const ctx = await canCtx(p);
			const con = await canCon(p);
			for (let i = 0; i < SOAN.tranBuoc; i += 1) await nop(BAN_BI_BAC, con);
			await ketQua(ctx, false);
			return p;
		},
	},
	{
		ca: "qua-dai",
		lyDo: LY_DO.quaDai,
		chay: async () =>
			moPhien({
				byte: docxTu([
					"Quy định rất dài.",
					"x".repeat(TAI_LIEU_AGENT.docChu.toiDaKyTu + 10),
				]),
			}),
	},
	{
		ca: "thieu-quy-tac",
		lyDo: LY_DO.thieuQuyTac,
		chay: async () => {
			await xoaQuyTacViet();
			try {
				return await moPhien({});
			} finally {
				await datQuyTacViet(nguoiId, QUY_TAC);
			}
		},
	},
];

describe("soan-hong", () => {
	test("soan-hong: ma tran 7 ca viet truoc, khong ghi de xuat nao", async () => {
		expect(new Set(CA_HONG.map((c) => c.lyDo)).size).toBe(7);
		const loi: string[] = [];
		const dong: string[] = [];
		for (const c of CA_HONG) {
			const trangTruoc = await db.taiLieuDeXuat.count({
				where: { nguonId: { not: null } },
			});
			const p = await c.chay();
			const sau = await db.taiLieuDeXuat.count({
				where: { nguonId: { not: null } },
			});
			const hang = await db.taiLieuNguon.findUniqueOrThrow({
				where: { id: p.nguonId },
				select: { trangThai: true, lyDo: true },
			});
			const viec = await db.agentTask.findUniqueOrThrow({
				where: { id: p.taskId },
				select: { finishedAt: true },
			});
			if (sau !== trangTruoc) {
				loi.push(
					c.ca === "tra-rong"
						? "ban rong duoc ghi: tra-rong"
						: `de xuat duoc ghi: ${c.ca}`,
				);
			}
			if (hang.trangThai !== "LOI") loi.push(`${c.ca}: ${hang.trangThai}`);
			if (hang.lyDo !== c.lyDo) loi.push(`${c.ca}: lyDo ${hang.lyDo}`);
			if (!viec.finishedAt) loi.push(`${c.ca}: viec chua dong`);
			dong.push(`${c.ca}: ${hang.trangThai} — ${hang.lyDo}`);
		}
		for (const d of dong) console.log(d);
		expect(loi).toEqual([]);
	});

	test("soan-hong: phien xong ma khong nop thi nguon ve LOI khong nop", async () => {
		const p = await moPhien({});
		await ketQua(await canCtx(p), false);
		const hang = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: p.nguonId },
			select: { trangThai: true, lyDo: true },
		});
		expect(hang).toEqual({ trangThai: "LOI", lyDo: LY_DO.khongNop });
		expect(await demDeXuat(p.trangId)).toBe(0);
	});

	test("soan-hong: phien hong bao qua token kenh crm co tien to thi nguon mang ly do that", async () => {
		const p = await moPhien({});
		expect(
			await dongKhiPhienHong(
				`crm:${tokenMaySoan(p.nguonId)}`,
				"500 Internal Server Error",
			),
		).toBe(true);
		const hang = await db.taiLieuNguon.findUniqueOrThrow({
			where: { id: p.nguonId },
			select: { trangThai: true, lyDo: true },
		});
		expect(hang).toEqual({
			trangThai: "LOI",
			lyDo: LY_DO.loiModel("500 Internal Server Error"),
		});
	});

	test("soan-hong: doi chung duong, ca dat trong cung tep ghi 1 de xuat", async () => {
		const p = await moPhien({});
		await nopRoiXong(p, BAN_DAT);
		expect(await demDeXuat(p.trangId)).toBe(1);
	});
});

const CAU_DOC_LOI = "Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.";
const BI_MAT = "BIMAT";

type OBatLoi = {
	ten: string;
	tep?: string;
	byte?: () => Uint8Array;
	bamKhai?: string;
	khongPut?: boolean;
	khoNem?: boolean;
	docChuNem?: boolean;
	xoaQuyTac?: boolean;
	muc: "LOI" | "CHO_SOAN" | "CAN_GO_TAY";
	lyDo: string | null | "can-go-tay";
};

const O_BAT_LOI: readonly OBatLoi[] = [
	{ ten: "a-kho-nem", khoNem: true, muc: "LOI", lyDo: CAU_DOC_LOI },
	{ ten: "b-docchu-nem", docChuNem: true, muc: "LOI", lyDo: CAU_DOC_LOI },
	{ ten: "c-lanh", muc: "CHO_SOAN", lyDo: null },
	{ ten: "d-khong-tai", khongPut: true, muc: "LOI", lyDo: LY_DO.khongTai },
	{ ten: "e-bam-lech", bamKhai: "0".repeat(64), muc: "LOI", lyDo: LY_DO.bamLech },
	{
		ten: "f-can-go-tay",
		tep: "ban-quet.pdf",
		byte: () => docMau("ban-quet.pdf"),
		muc: "CAN_GO_TAY",
		lyDo: "can-go-tay",
	},
	{ ten: "g-thieu-quy-tac", xoaQuyTac: true, muc: "LOI", lyDo: LY_DO.thieuQuyTac },
];

async function chayOBatLoi(o: OBatLoi) {
	const trangId = await gieoTrang(nguoiId);
	const tep = o.tep ?? "quyet-dinh.docx";
	const nguon = await gieoNguon({
		tep,
		trangId,
		taiBoiId: nguoiId,
		byte: o.byte ? o.byte() : docxTu(DOAN_QUYET_DINH),
		bamKhai: o.bamKhai,
	});
	const kho = khoNguonGia();
	if (!o.khongPut) kho.daPut.set(nguon.pathname, nguon.byte);
	if (o.khoNem) {
		kho.doc = async () => {
			throw new Error(`blob https://x/y?token=${BI_MAT}`);
		};
	}
	const gian = o.docChuNem
		? spyOn(docChuMoDun, "docChu").mockImplementation(async () => {
				throw new Error(`docx hong https://x/z?token=${BI_MAT}`);
			})
		: null;
	if (o.xoaQuyTac) await xoaQuyTacViet();
	const task = await gieoViec(nguon.id);
	let nem: unknown = null;
	try {
		await chaySoanTuNguon(task, kho);
	} catch (loi) {
		nem = loi;
	} finally {
		gian?.mockRestore();
		if (o.xoaQuyTac) await datQuyTacViet(nguoiId, QUY_TAC);
	}
	const hang = await db.taiLieuNguon.findUniqueOrThrow({
		where: { id: nguon.id },
		select: { trangThai: true, lyDo: true },
	});
	const viec = await db.agentTask.findUniqueOrThrow({
		where: { id: task.id },
		select: { finishedAt: true, outcome: true },
	});
	return { hang, viec, nem };
}

describe("kn-bat-loi", () => {
	test("kn-bat-loi: ma tran 7 o viet truoc, loi bi nem dua nguon ve LOI, ca loi da co giu ly do cu", async () => {
		expect(O_BAT_LOI.length).toBe(7);
		const sai: string[] = [];
		for (const o of O_BAT_LOI) {
			const { hang, viec, nem } = await chayOBatLoi(o);
			if (nem) sai.push(`${o.ten}: chaySoanTuNguon nem ra ngoai`);
			if (hang.trangThai !== o.muc) {
				sai.push(
					hang.trangThai === "CHO_DOC"
						? `kn-bat-loi: nguon van CHO_DOC sau khi doc tep nem (${o.ten})`
						: `${o.ten}: muc ${hang.trangThai}, mong ${o.muc}`,
				);
			}
			const lyDo = hang.lyDo ?? "";
			if (o.lyDo === CAU_DOC_LOI) {
				if (lyDo.includes(BI_MAT) || lyDo.includes("https://")) {
					sai.push(`kn-bat-loi: lyDo lo thong diep loi goc (${o.ten})`);
				} else if (lyDo !== CAU_DOC_LOI) {
					sai.push(`kn-bat-loi: lyDo lech cau da hua (${o.ten}): ${lyDo}`);
				}
				if (!viec.finishedAt) sai.push(`${o.ten}: viec chua dong`);
				if (viec.outcome !== hang.lyDo) sai.push(`${o.ten}: outcome khac lyDo`);
			} else if (o.lyDo === "can-go-tay") {
				if (!lyDo.startsWith("Cần gõ tay")) {
					sai.push(`${o.ten}: lyDo ${lyDo}`);
				}
			} else if (o.lyDo !== null && lyDo !== o.lyDo) {
				sai.push(
					lyDo === CAU_DOC_LOI
						? `kn-bat-loi: nuot nhanh thieuQuyTac (${o.ten})`
						: `${o.ten}: lyDo ${lyDo}, mong ${o.lyDo}`,
				);
			}
			if (o.lyDo !== CAU_DOC_LOI && lyDo === CAU_DOC_LOI) {
				sai.push(`kn-bat-loi: nuot nhanh thieuQuyTac (${o.ten})`);
			}
		}
		expect(sai).toEqual([]);
	});
});
