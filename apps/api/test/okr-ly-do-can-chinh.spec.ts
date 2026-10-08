import { afterAll, beforeAll, describe, expect, test } from "bun:test";
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
import {
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
	expect(ra.ok).toBe(true);
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
