import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { NOT_A_MEMBER } from "@crm/auth";
import { db } from "@crm/db";
import type { CuocSoan } from "@crm/db/okr-cuoc-soan";
import { dongSoan, noiDungSoan } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { lyDoTuSoan } from "../src/okr/can-chinh";
import {
	mineOutput,
	type SoanDuaVaoOutput,
	type SoanQuyetOutput,
} from "../src/okr/okr.contracts";
import { OKR } from "../src/okr/okr-config";
import { mintPhien } from "./phien-thu";
import {
	CHU_KY_Q4,
	DON_VI,
	type DonViSan,
	type Duong,
	datPhaQuy4,
	donSoan,
	gieoCuoc,
	gieoDongNhap,
	goiSoan,
	NAC_SOAN,
} from "./soan-okr-san";
import {
	batDauMau,
	CHO_DB,
	dungUngDung,
	ghiCauHinh,
	goi,
	goiRest,
	ketThucMau,
	mt,
	nguoi,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const QUAN_TRI = "le-hai-dang";
const TRUONG_KD_BAC = "nguyen-thi-lan";
const LY_DO_KARA = "Tăng tỷ lệ chốt thêm khoảng 9 tỷ";
const DICH = mt("q4-kd");

let app: NestExpressApplication;
let cQuanTri = "";
let cTruong = "";

type MucGieo = { mucTieu: string; kr: string; canChinh: string };

async function gieoMuc(
	cuoc: CuocSoan,
	khoa: string,
	ten: string,
	viSao: string,
): Promise<MucGieo> {
	const [mucTieu] = (await gieoDongNhap(cuoc, [
		{ loai: "muc-tieu-moi", khoa, ten },
	])) as [string];
	const [kr] = (await gieoDongNhap(cuoc, [
		{
			loai: "kr-moi",
			khoa: `${khoa}1`,
			chaKhoa: khoa,
			ten: `Hợp đồng ký mới ${ten}`,
			kieu: "tang-toi",
			donVi: "hợp đồng",
		},
	])) as [string];
	const [canChinh] = (await gieoDongNhap(cuoc, [
		{
			loai: "can-chinh-moi",
			khoa: `cc-${khoa}`,
			chaKhoa: khoa,
			dichId: DICH,
			loaiDich: "muc-tieu",
			viSao,
		},
	])) as [string];
	return { mucTieu, kr, canChinh };
}

async function nhanVaDuaVao(
	cuoc: CuocSoan,
	muc: MucGieo[],
	duong: Duong,
): Promise<void> {
	for (const m of muc)
		for (const id of [m.mucTieu, m.kr, m.canChinh]) {
			tienDongHo();
			ok<SoanQuyetOutput>(
				await goiSoan(
					app,
					"soanQuyet",
					duong,
					{ deXuatId: id, quyet: "nhan" },
					cQuanTri,
				),
				`nhan ${id} ${duong}`,
			);
		}
	tienDongHo();
	const ra = ok<SoanDuaVaoOutput>(
		await goiSoan(
			app,
			"soanDuaVao",
			duong,
			{
				cuocSoanId: cuoc.id,
				kr: muc.map((m) => ({ deXuatId: m.kr, khoiDiem: 0, dich: 10 })),
			} as never,
			cQuanTri,
		),
		`dua vao ${duong}`,
	);
	if (!ra.ok)
		throw new Error(`dua vao ${duong} bi tu choi: ${ra.lyDo} ${ra.chiTiet}`);
}

async function canChinhTaoRa(deXuatId: string) {
	const d = await db.okrDeXuat.findUniqueOrThrow({
		where: { id: deXuatId },
		select: { taoRaId: true },
	});
	if (!d.taoRaId) throw new Error("dong can chinh khong co taoRaId");
	return db.okrAlignment.findUniqueOrThrow({ where: { id: d.taoRaId } });
}

async function datViSao(deXuatId: string, viSao: string): Promise<void> {
	const d = await db.okrDeXuat.findUniqueOrThrow({
		where: { id: deXuatId },
		select: { noiDung: true },
	});
	const noiDung = noiDungSoan.parse({
		...noiDungSoan.parse(d.noiDung),
		viSao,
	});
	await db.okrDeXuat.update({
		where: { id: deXuatId },
		data: { noiDung },
	});
}

const DON_VI_THEO_DUONG: Record<Duong, DonViSan> = {
	trpc: DON_VI.kdBac,
	rest: DON_VI.kdNam,
};

beforeAll(async () => {
	await batDauMau();
	await donSoan();
	await datPhaQuy4("lap-ke-hoach");
	app = await dungUngDung();
	cQuanTri = await phienMau(QUAN_TRI);
	cTruong = await phienMau(TRUONG_KD_BAC);
	await ghiCauHinh(app, cQuanTri, NAC_SOAN.bat);
}, CHO_DB);

afterAll(async () => {
	await donSoan();
	await ketThucMau(app);
}, CHO_DB);

describe("dua-vao", () => {
	test(
		"đưa vào chép lý do Kara đã cắt sang căn chỉnh, có dấu Kara — trpc và rest",
		async () => {
			for (const duong of ["trpc", "rest"] as const) {
				const cuoc = await gieoCuoc({
					donVi: DON_VI_THEO_DUONG[duong],
					nguoiMo: QUAN_TRI,
				});
				const muc = await gieoMuc(
					cuoc,
					"a",
					`Bán lẻ ký đều ${duong}`,
					LY_DO_KARA,
				);
				await datViSao(muc.canChinh, `  ${LY_DO_KARA} \n`);
				await nhanVaDuaVao(cuoc, [muc], duong);
				const g = await canChinhTaoRa(muc.canChinh);
				if (g.lyDo !== LY_DO_KARA)
					throw new Error(`dua vao lam roi ly do (${duong}): ${g.lyDo}`);
				if (g.lyDoTuKara !== true) throw new Error(`mat dau Kara (${duong})`);
				expect(g.canCu).toBeNull();
			}
		},
		CHO_DB,
	);
});

describe("visao-rong", () => {
	test("viSao rỗng hay chỉ khoảng trắng thì không có lý do, không mang dấu Kara; bộ ghi không sinh ra nó", () => {
		const RONG = ["", "   ", " \n\t"] as const;
		let chay = 0;
		for (const viSao of RONG) {
			const ra = lyDoTuSoan(viSao);
			if (ra.lyDo !== null)
				throw new Error(`ly do rong thanh chuoi rong: «${ra.lyDo}»`);
			expect([ra.canCu, ra.lyDoTuKara]).toEqual([null, false]);
			const ghi = dongSoan.safeParse({
				loai: "can-chinh-moi",
				khoa: "cc-x",
				chaKhoa: "x",
				cuocSoanId: "cuoc-x",
				dich: null,
				targetObjectiveId: DICH,
				targetKeyResultId: null,
				viSao,
			});
			if (ghi.success)
				throw new Error(`bo ghi nhan viSao rong: «${JSON.stringify(viSao)}»`);
			chay++;
		}
		expect(chay).toBe(3);
	});
});

describe("gan-tay", () => {
	test(
		"gắn căn chỉnh bằng tay với đầu vào cũ vẫn được, ba cột ở mặc định",
		async () => {
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kdBac,
				nguoiMo: QUAN_TRI,
			});
			const muc = await gieoMuc(cuoc, "h", "Hỗ trợ trả lời nhanh", LY_DO_KARA);
			await nhanVaDuaVao(cuoc, [muc], "trpc");
			const cu = await canChinhTaoRa(muc.canChinh);
			ok(
				await goi(
					app,
					"okr.removeAlignment",
					"mutation",
					{ id: cu.id },
					cTruong,
				),
				"go can chinh",
			);
			const gan = await goi(
				app,
				"okr.addAlignment",
				"mutation",
				{
					objectiveId: cu.objectiveId,
					targetObjectiveId: DICH,
					targetKeyResultId: null,
				},
				cTruong,
			);
			if (gan.status !== 200)
				throw new Error(`gan tay bi chan vi thieu ly do: ${gan.loi}`);
			const g = await db.okrAlignment.findFirstOrThrow({
				where: { objectiveId: cu.objectiveId, targetObjectiveId: DICH },
			});
			expect([g.lyDo, g.canCu, g.lyDoTuKara]).toEqual([null, null, false]);
		},
		CHO_DB,
	);
});

describe("muc-tin", () => {
	test(
		"mỗi căn chỉnh trên mucTieuOutput có lý do, căn cứ, dấu Kara và mức tin đúng",
		async () => {
			const cuoc = await gieoCuoc({ donVi: DON_VI.kdBac, nguoiMo: QUAN_TRI });
			const muc = await gieoMuc(cuoc, "m", "Ký đều có mức tin", LY_DO_KARA);
			await nhanVaDuaVao(cuoc, [muc], "trpc");
			const goc = await canChinhTaoRa(muc.canChinh);
			const nguon = await db.okrObjective.findUniqueOrThrow({
				where: { id: goc.objectiveId },
				select: { cycleId: true, ownerUserId: true },
			});
			const krDich = await db.okrKeyResult.findMany({
				where: { objectiveId: DICH },
				select: { id: true },
				orderBy: { position: "asc" },
				take: 2,
			});
			expect(krDich).toHaveLength(2);
			for (const k of krDich)
				ok(
					await goi(
						app,
						"okr.addAlignment",
						"mutation",
						{
							objectiveId: goc.objectiveId,
							targetObjectiveId: null,
							targetKeyResultId: k.id,
						},
						cTruong,
					),
					`gan ${k.id}`,
				);
			const theoDich = new Map(
				(
					await db.okrAlignment.findMany({
						where: { objectiveId: goc.objectiveId },
						select: {
							id: true,
							targetObjectiveId: true,
							targetKeyResultId: true,
						},
					})
				).map((g) => [g.targetKeyResultId ?? g.targetObjectiveId ?? "", g.id]),
			);
			const DONG = [
				["chua-co-ly-do", krDich[0]?.id ?? "", null, null],
				["dat-cuoc", krDich[1]?.id ?? "", "Lý do", null],
				["co-so-lieu", DICH, "Lý do", "Căn cứ"],
			] as const;
			for (const [, dich, lyDo, canCu] of DONG)
				await db.okrAlignment.update({
					where: { id: theoDich.get(dich) ?? "" },
					data: { lyDo, canCu, lyDoTuKara: false },
				});
			const cChu = nguon.ownerUserId === nguoi(QUAN_TRI) ? cQuanTri : cTruong;
			const mine = mineOutput.parse(
				ok(
					await goi(app, "okr.mine", "query", { cycleId: nguon.cycleId }, cChu),
					"mine",
				),
			);
			const mucTieu = mine.objectives.find((o) => o.id === goc.objectiveId);
			if (!mucTieu) throw new Error("mine khong co muc tieu cua chu");
			let chay = 0;
			for (const [mong, dich, lyDo, canCu] of DONG) {
				const a = mucTieu.alignments.find(
					(x) => x.alignmentId === theoDich.get(dich),
				);
				if (!a) throw new Error(`${mong}: khong thay can chinh`);
				for (const khoa of ["lyDo", "canCu", "lyDoTuKara", "mucTin"])
					if (!(khoa in a)) throw new Error(`thieu khoa ${khoa}`);
				expect([a.lyDo, a.canCu, a.lyDoTuKara]).toEqual([lyDo, canCu, false]);
				if (a.mucTin !== mong)
					throw new Error(`${mong}: muc tin ${a.mucTin} khac ${mong}`);
				chay++;
			}
			expect(chay).toBe(3);
		},
		CHO_DB,
	);
});

const GOC_KHO = resolve(import.meta.dir, "..", "..", "..");
const THU_MUC_MIGRATION = join(
	GOC_KHO,
	"packages",
	"db",
	"prisma",
	"migrations",
);

function cauDienLai(): string {
	const tim = readdirSync(THU_MUC_MIGRATION).filter((t) =>
		t.endsWith("_ly_do_can_chinh"),
	);
	if (tim.length !== 1) throw new Error("khong thay migration ly do");
	const cau = readFileSync(
		join(THU_MUC_MIGRATION, tim[0] ?? "", "migration.sql"),
		"utf8",
	)
		.split(";")
		.map((c) => c.trim())
		.filter((c) => c.startsWith("UPDATE"));
	if (cau.length !== 1) throw new Error("khong thay migration ly do");
	return cau[0] ?? "";
}

async function nguonTrong(soLuong: number): Promise<string[]> {
	const ds = await db.okrObjective.findMany({
		where: {
			cycleId: CHU_KY_Q4,
			id: { not: DICH },
			alignments: { none: { targetObjectiveId: DICH } },
		},
		select: { id: true },
		orderBy: { id: "asc" },
		take: soLuong,
	});
	if (ds.length !== soLuong) throw new Error("khong du muc tieu nguon");
	return ds.map((d) => d.id);
}

async function ganTho(objectiveId: string, lyDo: string | null = null) {
	return db.okrAlignment.create({
		data: {
			objectiveId,
			targetObjectiveId: DICH,
			targetKeyResultId: null,
			lyDo,
			canCu: null,
			lyDoTuKara: false,
		},
	});
}

async function gieoDeXuatCho(
	cuoc: CuocSoan,
	khoa: string,
	taoRaId: string,
	viSao: string,
): Promise<string> {
	const [id] = (await gieoDongNhap(
		cuoc,
		[
			{
				loai: "can-chinh-moi",
				khoa,
				chaKhoa: "x",
				dichId: DICH,
				loaiDich: "muc-tieu",
			},
		],
		"nhan",
	)) as [string];
	await db.okrDeXuat.update({ where: { id }, data: { taoRaId } });
	await datViSao(id, viSao);
	return id;
}

describe("dien-lai", () => {
	test(
		"câu điền lại của migration chép viSao sang căn chỉnh cũ chưa có lý do, đúng năm ca",
		async () => {
			const cuoc = await gieoCuoc({
				donVi: DON_VI.kinhDoanh,
				nguoiMo: QUAN_TRI,
			});
			const [nA, nB, nC, nD, nE] = (await nguonTrong(5)) as [
				string,
				string,
				string,
				string,
				string,
			];
			const A = await ganTho(nA);
			await gieoDeXuatCho(cuoc, "dl-a", A.id, "Lý do cũ A");
			const B = await ganTho(nB);
			const C = await ganTho(nC, "Người viết");
			await gieoDeXuatCho(cuoc, "dl-c", C.id, "Lý do cũ C");
			const D = await ganTho(nD);
			await gieoDeXuatCho(cuoc, "dl-d", D.id, "   ");
			const eCu = await ganTho(nE);
			await gieoDeXuatCho(cuoc, "dl-e", eCu.id, "Lý do E\n");
			await db.okrAlignment.delete({ where: { id: eCu.id } });
			const E = await ganTho(nE);
			await db.$executeRawUnsafe(cauDienLai());
			const doc = async (id: string) =>
				db.okrAlignment.findUniqueOrThrow({
					where: { id },
					select: { lyDo: true, lyDoTuKara: true },
				});
			const MONG = [
				["A", A.id, { lyDo: "Lý do cũ A", lyDoTuKara: true }],
				["B", B.id, { lyDo: null, lyDoTuKara: false }],
				["C", C.id, { lyDo: "Người viết", lyDoTuKara: false }],
				["D", D.id, { lyDo: null, lyDoTuKara: false }],
				["E", E.id, { lyDo: null, lyDoTuKara: false }],
			] as const;
			let chay = 0;
			for (const [ca, id, mong] of MONG) {
				const thuc = await doc(id);
				if (thuc.lyDo !== mong.lyDo || thuc.lyDoTuKara !== mong.lyDoTuKara)
					throw new Error(`${ca}: dien lai sai (${JSON.stringify(thuc)})`);
				chay++;
			}
			expect(chay).toBe(5);
		},
		CHO_DB,
	);
});

describe("do-nguong", () => {
	test(
		"câu đo ngưỡng đếm 0 căn chỉnh thiếu lý do mà dòng nháp có; bắt được một ca thiếu",
		async () => {
			const cauDo = readFileSync(
				join(
					import.meta.dir,
					"..",
					"..",
					"..",
					"_acceptance",
					"ly-do-can-chinh-tu-soan",
					"rang",
					"do-nguong.sql",
				),
				"utf8",
			);
			const dem = async () =>
				((await db.$queryRawUnsafe(cauDo)) as { thieu: number }[])[0]?.thieu;
			const truoc = await dem();
			if (truoc !== 0) throw new Error(`do nguong dem ${truoc}, mong 0`);
			const cuoc = await gieoCuoc({ donVi: DON_VI.hoTro, nguoiMo: QUAN_TRI });
			const [n] = (await nguonTrong(1)) as [string];
			const thieu = await ganTho(n);
			await gieoDeXuatCho(cuoc, "dn-x", thieu.id, "Lý do");
			try {
				if ((await dem()) !== 1)
					throw new Error("do nguong khong bat duoc ca thieu");
			} finally {
				await db.okrAlignment.delete({ where: { id: thieu.id } });
			}
		},
		CHO_DB,
	);
});

const BI_MAT = "bi-mat-l1";
const NGUOI_NGOAI = "ldcc-nguoi-ngoai-kho";

describe("quyen-xem", () => {
	test(
		"mục tiêu có căn chỉnh mang lý do không chuyển được sang giới hạn; người ngoài workspace bị 403 không thấy lý do",
		async () => {
			const nguon = await db.okrObjective.findFirst({
				where: {
					cycleId: CHU_KY_Q4,
					departmentId: DON_VI.kdBac.departmentId,
					status: "cong-bo",
					hienThi: "cong-khai",
				},
				select: { id: true },
				orderBy: { id: "asc" },
			});
			if (!nguon) throw new Error("khong co muc tieu cong khai cua kd-bac");
			await db.okrAlignment.deleteMany({
				where: {
					OR: [
						{ objectiveId: nguon.id },
						{ targetObjectiveId: nguon.id },
						{ targetKeyResult: { objectiveId: nguon.id } },
					],
				},
			});
			const cu = { objectiveId: nguon.id };
			ok(
				await goi(
					app,
					"okr.addAlignment",
					"mutation",
					{
						objectiveId: cu.objectiveId,
						targetObjectiveId: DICH,
						targetKeyResultId: null,
					},
					cTruong,
				),
				"gan that",
			);
			const g = await db.okrAlignment.findFirstOrThrow({
				where: { objectiveId: cu.objectiveId, targetObjectiveId: DICH },
			});
			await db.okrAlignment.update({
				where: { id: g.id },
				data: { lyDo: BI_MAT },
			});
			const doi = await goi(
				app,
				"okr.datHienThi",
				"mutation",
				{ objectiveId: cu.objectiveId, hienThi: "gioi-han", nguoiXem: [] },
				cTruong,
			);
			const sau = await db.okrObjective.findUniqueOrThrow({
				where: { id: cu.objectiveId },
				select: { hienThi: true, ownerUserId: true, cycleId: true },
			});
			const conLyDo = await db.okrAlignment.findUnique({
				where: { id: g.id },
				select: { lyDo: true },
			});
			if (
				doi.status !== 400 ||
				doi.loi !== OKR.thongDiep.hienThi.conCanChinh(1) ||
				sau.hienThi !== "cong-khai" ||
				conLyDo?.lyDo !== BI_MAT
			)
				throw new Error(
					`doi gioi han khi co ly do bi lot: ${doi.status} ${doi.loi}`,
				);

			await db.user.upsert({
				where: { id: NGUOI_NGOAI },
				create: {
					id: NGUOI_NGOAI,
					name: "Người ngoài kho",
					email: `${NGUOI_NGOAI}@ngoai.test`,
				},
				update: {},
			});
			try {
				const { cookie } = await mintPhien(NGUOI_NGOAI);
				const vao = { cycleId: sau.cycleId };
				const traLoi = [
					await goi(app, "okr.mine", "query", vao, cookie),
					await goiRest(app, "GET", "/okr/mine", vao, cookie),
				];
				for (const t of traLoi) {
					expect([t.status, t.loi]).toEqual([403, NOT_A_MEMBER]);
					if (JSON.stringify(t).includes(BI_MAT))
						throw new Error("lo ly do cho nguoi ngoai");
				}
			} finally {
				await db.session.deleteMany({ where: { userId: NGUOI_NGOAI } });
				await db.user.delete({ where: { id: NGUOI_NGOAI } });
			}

			const cChu = (await mintPhien(sau.ownerUserId)).cookie;
			const cuaChu = await goi(
				app,
				"okr.mine",
				"query",
				{ cycleId: sau.cycleId },
				cChu,
			);
			if (!JSON.stringify(cuaChu.data).includes(BI_MAT))
				throw new Error("doi chung: chu muc tieu khong thay ly do");
		},
		CHO_DB,
	);
});
