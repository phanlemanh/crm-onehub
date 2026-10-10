import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { docChamVaTran } from "@crm/db/okr-goi-soan";
import { cauHinhAiLuc } from "@crm/db/okr-tro-ly";
import {
	OKR_PROGRAM_MAC_DINH,
	type OkrProgramSua,
} from "@crm/validation/okr-chuong-trinh";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { xoaBoOkrMau } from "../scripts/okr-mau/nap";
import { OkrService } from "../src/okr/okr.service";
import { chayLenh, nguoiMau, tapIdMau, vanTayKho } from "./okr-mau-san";
import { PB } from "./soan-okr-san";
import {
	batDauMau,
	dungUngDung,
	ghiCauHinh,
	ketThucMau,
	phienMau,
} from "./tro-ly-okr-san";

const CHO = 300_000;
const QUAN_TRI = "le-hai-dang";
const NGUOI_NGOAI = "ngoai-mau-nguoi-omc";
const PB_NGOAI = "ngoai-mau-pb-omc";
const NGUOI_DA_NGHI = `${OKR_MAU.tienTo}nguoi-da-nghi-omc`;
const MOC = { id: "ngoai-mau-cau-hinh-omc-moc", version: -900 };
const MANG_GHIM = [
	"aiDeXuatAnDonVi",
	"aiDeXuatDonVi",
	"aiSoanAnDonVi",
	"aiSoanDonVi",
	"aiTomTatAnDonVi",
	"aiTomTatDonVi",
];

let app: NestExpressApplication;
let anhDau: string[] = [];

function hong(dieuKien: boolean, thongDiep: string): void {
	if (dieuKien) throw new Error(thongDiep);
}

async function chupBang(): Promise<string[]> {
	const rows = await db.$queryRaw<{ dong: string }[]>`
		SELECT to_jsonb(t)::text AS dong FROM "okrProgramConfig" t ORDER BY id`;
	return rows.map((r) => r.dong);
}

async function chupHang(id: string): Promise<string | null> {
	const rows = await db.$queryRaw<{ dong: string }[]>`
		SELECT to_jsonb(t)::text AS dong FROM "okrProgramConfig" t WHERE id = ${id}`;
	return rows[0]?.dong ?? null;
}

async function chenLai(dong: string[]): Promise<void> {
	for (const d of dong)
		await db.$executeRaw`
			INSERT INTO "okrProgramConfig"
			SELECT * FROM jsonb_populate_record(NULL::"okrProgramConfig", ${d}::jsonb)`;
}

async function traLai(): Promise<void> {
	await db.okrProgramConfig.deleteMany({});
	await chenLai(anhDau);
}

async function cotMang(): Promise<string[]> {
	const rows = await db.$queryRaw<{ cot: string }[]>`
		SELECT column_name AS cot FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'okrProgramConfig'
		AND data_type = 'ARRAY' ORDER BY column_name`;
	return rows.map((r) => r.cot);
}

async function tamMang(ma: string[]): Promise<OkrProgramSua> {
	const cot = await cotMang();
	for (const c of cot) hong(!MANG_GHIM.includes(c), `omc: cot mang khac ${c}`);
	for (const c of MANG_GHIM) hong(!cot.includes(c), `omc: cot mang khac ${c}`);
	return Object.fromEntries(
		cot.flatMap((c) => [
			[c, ma],
			[c.replace(/DonVi$/, "PhamVi"), "danh-sach"],
		]),
	);
}

async function banMau(sua: OkrProgramSua) {
	const quanTri = await phienMau(QUAN_TRI);
	await ghiCauHinh(app, quanTri, sua);
	return db.okrProgramConfig.findFirstOrThrow({
		orderBy: { version: "desc" },
	});
}

async function doiTacGia(id: string, nguoi: string): Promise<void> {
	await db.okrProgramConfig.update({
		where: { id },
		data: { createdById: nguoi },
	});
}

async function moCa(): Promise<void> {
	await batDauMau();
	await db.okrProgramConfig.deleteMany({});
}

async function banTruoc() {
	const ban = await banMau({ krCap: 7, aiSoanDonVi: [PB_NGOAI] });
	await doiTacGia(ban.id, NGUOI_NGOAI);
	return ban;
}

async function conMaMau(): Promise<string[]> {
	const rows = await db.okrProgramConfig.findMany();
	return rows.flatMap((r) =>
		MANG_GHIM.flatMap((c) =>
			(r[c as keyof typeof r] as string[])
				.filter((ma) => ma.startsWith(OKR_MAU.tienTo))
				.map((ma) => `${r.id}.${c}:${ma}`),
		),
	);
}

const thayMang = (dong: string, ma: string[]): string => {
	const o: Record<string, unknown> = JSON.parse(dong);
	for (const c of MANG_GHIM) o[c] = ma;
	return JSON.stringify(o);
};

const sapKhoa = (dong: string | null): string =>
	dong === null
		? "null"
		: JSON.stringify(
				Object.fromEntries(Object.entries(JSON.parse(dong)).sort()),
			);

beforeAll(async () => {
	app = await dungUngDung();
	await db.okrProgramConfig.create({
		data: { ...OKR_PROGRAM_MAC_DINH, ...MOC, createdById: NGUOI_NGOAI },
	});
	anhDau = await chupBang();
}, CHO);

afterAll(async () => {
	await ketThucMau(app);
	await traLai();
	await db.okrProgramConfig.delete({ where: { id: MOC.id } });
}, CHO);

describe("omc-lui", () => {
	test(
		"về bản trước: bản người mẫu đi, bản trước nguyên, bộ đọc lùi",
		async () => {
			await moCa();
			const truoc = await banTruoc();
			const mau = await banMau(await tamMang([PB("kd-bac")]));
			const anhTruoc = await chupHang(truoc.id);
			expect((await cauHinhAiLuc(db)).version).toBe(mau.version);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			hong((await chupHang(mau.id)) !== null, "omc: cau hinh mau con");
			hong(
				(await chupHang(truoc.id)) !== anhTruoc,
				"omc: cau hinh truoc mau bi doi",
			);
			const v = (await cauHinhAiLuc(db)).version;
			hong(
				v !== truoc.version,
				`omc: cau hinh hien hanh khong lui (${v} != ${truoc.version})`,
			);
		},
		CHO,
	);

	test(
		"về mặc định: chỉ có bản người mẫu thì bảng trống",
		async () => {
			await moCa();
			await banMau(await tamMang([PB("kd-bac")]));
			expect(await db.okrProgramConfig.count()).toBe(1);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			const n = await db.okrProgramConfig.count();
			hong(n > 0, `omc: con cau hinh sau xoa (${n})`);
			const v = (await cauHinhAiLuc(db)).version;
			hong(v !== 0, `omc: khong ve mac dinh (${v})`);
		},
		CHO,
	);
});

describe("omc-gat", () => {
	test(
		"bản người ngoài sau phiên mẫu: chỉ mã mẫu bị gỡ, cột khác nguyên",
		async () => {
			await moCa();
			const truoc = await banTruoc();
			const mau = await banMau(await tamMang([PB("kd-bac")]));
			const sau = await banMau({
				...(await tamMang([PB("kd-bac"), PB_NGOAI])),
				krCap: 9,
			});
			await doiTacGia(sau.id, NGUOI_NGOAI);
			const anhTruoc = await chupHang(truoc.id);
			const anhSau = await chupHang(sau.id);
			if (anhSau === null) throw new Error("omc: khong chup duoc ban sau");
			expect(await conMaMau()).not.toEqual([]);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			const con = await conMaMau();
			hong(con.length > 0, `omc: con ma don vi mau ${JSON.stringify(con)}`);
			const thay = sapKhoa(await chupHang(sau.id));
			const mong = sapKhoa(thayMang(anhSau, [PB_NGOAI]));
			hong(thay !== mong, `omc: cau hinh sau mau sai ${thay}`);
			hong(
				(await chupHang(truoc.id)) !== anhTruoc,
				"omc: cau hinh truoc mau bi doi",
			);
			hong((await chupHang(mau.id)) !== null, "omc: cau hinh mau con");
			const v = (await cauHinhAiLuc(db)).version;
			hong(v !== sau.version, `omc: cau hinh hien hanh sai (${v})`);
			hong(
				!r.ra.startsWith("Đã xoá bộ OKR mẫu:") ||
					!r.ra.includes(
						"1 phiên bản cấu hình chương trình OKR do người mẫu tạo",
					) ||
					!r.ra.includes("gỡ mã đơn vị mẫu khỏi 1 phiên bản khác"),
				`omc: dong in thieu dem cau hinh: ${r.ra}`,
			);
		},
		CHO,
	);

	test(
		"gạt thành rỗng: bản người ngoài chỉ có mã mẫu vẫn đọc được",
		async () => {
			await moCa();
			const sau = await banMau(await tamMang([PB("kd-bac")]));
			await doiTacGia(sau.id, NGUOI_NGOAI);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			const hang = await db.okrProgramConfig.findUniqueOrThrow({
				where: { id: sau.id },
			});
			for (const c of MANG_GHIM)
				hong(
					(hang[c as keyof typeof hang] as string[]).length > 0,
					`omc: con ma don vi mau ${c}`,
				);
			const docs: [string, () => Promise<unknown>][] = [
				["OkrService.program", () => app.get(OkrService).program()],
				["docChamVaTran", () => docChamVaTran(db)],
				["cauHinhAiLuc", () => cauHinhAiLuc(db)],
			];
			for (const [ten, doc] of docs)
				await doc().catch((loi: unknown) => {
					throw new Error(
						`omc: cau hinh sau gat khong doc duoc ${ten}: ${loi instanceof Error ? loi.message : String(loi)}`,
					);
				});
			const ct = await app.get(OkrService).program();
			hong(
				ct.version !== sau.version,
				`omc: cau hinh hien hanh sai (${ct.version})`,
			);
		},
		CHO,
	);
});

describe("omc-mo-coi", () => {
	test(
		"kho không còn bộ mẫu: bản mồ côi của người mẫu vẫn bị gỡ và đếm",
		async () => {
			await moCa();
			const ban = await banMau({
				aiOn: true,
				aiSoanPhamVi: "danh-sach",
				aiSoanDonVi: [PB("kd-bac")],
			});
			const anh = await chupHang(ban.id);
			if (anh === null) throw new Error("omc: khong chup duoc ban mo coi");
			await xoaBoOkrMau(db);
			await db.okrProgramConfig.deleteMany({ where: { id: ban.id } });
			await chenLai([anh]);
			expect(await tapIdMau()).toEqual([]);
			expect(
				(await db.okrProgramConfig.findUniqueOrThrow({ where: { id: ban.id } }))
					.createdById,
			).toBe(nguoiMau(QUAN_TRI));

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			hong(r.ra.includes("không có bộ mẫu"), "omc: mo coi bao khong co bo mau");
			hong((await chupHang(ban.id)) !== null, "omc: cau hinh mo coi con");
			expect(r.ra).toContain(
				"1 phiên bản cấu hình chương trình OKR do người mẫu tạo",
			);
		},
		CHO,
	);

	test(
		"bộ mẫu đang có: bản của người mẫu không còn trong bộ vẫn bị gỡ",
		async () => {
			await moCa();
			const ban = await banMau({ krCap: 4 });
			await doiTacGia(ban.id, NGUOI_DA_NGHI);
			expect(await tapIdMau()).not.toContain(NGUOI_DA_NGHI);

			const r = chayLenh([OKR_MAU.co.xoa]);
			expect(r.ma, r.loi).toBe(0);
			hong(
				(await chupHang(ban.id)) !== null,
				"omc: cau hinh mo coi con (co bo mau)",
			);
		},
		CHO,
	);
});

describe("omc-nap-lai", () => {
	test(
		"nạp lại gỡ phiên bản người mẫu đã ghi",
		async () => {
			await moCa();
			await banMau({ krCap: 6 });
			const conMau = () =>
				db.okrProgramConfig.count({
					where: { createdById: { startsWith: OKR_MAU.tienTo } },
				});
			expect(await conMau()).toBe(1);

			const r = chayLenh([]);
			expect(r.ma, r.loi).toBe(0);
			const n = await conMau();
			hong(n > 0, `omc: nap lai con cau hinh mau (${n})`);
		},
		CHO,
	);
});

describe("omc-dang-giu", () => {
	test(
		"dữ liệu ngoài giữ người mẫu: mã 5, okrProgramConfig nguyên nội dung",
		async () => {
			await moCa();
			await banMau(await tamMang([PB("kd-bac")]));
			const sau = await banMau(await tamMang([PB("kd-bac"), PB_NGOAI]));
			await doiTacGia(sau.id, NGUOI_NGOAI);
			await db.company.create({
				data: { id: "ngoai-mau-cty-omc", name: "Công ty ngoài mẫu omc" },
			});
			await db.deal.create({
				data: {
					id: "ngoai-mau-deal-omc",
					name: "Thoả thuận ngoài mẫu omc",
					companyId: "ngoai-mau-cty-omc",
					ownerId: nguoiMau("do-minh-khoa"),
				},
			});
			try {
				const truoc = await vanTayKho();
				expect(Object.keys(truoc)).toContain("okrProgramConfig");
				expect(await db.okrProgramConfig.count()).toBe(2);
				const r = chayLenh([OKR_MAU.co.xoa]);
				hong(r.ma !== OKR_MAU.ma.dangGiu, `omc: ma 5 khong ra (${r.ma})`);
				const sauXoa = await vanTayKho();
				const lech = Object.keys(truoc).filter((b) => truoc[b] !== sauXoa[b]);
				hong(lech.length > 0, `omc: ma 5 doi kho ${lech.join(",")}`);
			} finally {
				await db.deal.delete({ where: { id: "ngoai-mau-deal-omc" } });
				await db.company.delete({ where: { id: "ngoai-mau-cty-omc" } });
			}
		},
		CHO,
	);
});

describe("omc-tra-lai", () => {
	test(
		"spec trả bảng cấu hình về đúng ảnh chụp lúc đầu",
		async () => {
			hong(
				JSON.stringify(await chupBang()) === JSON.stringify(anhDau),
				"omc: tra lai khong co gi de do",
			);
			await traLai();
			const cuoi = await chupBang();
			hong(
				JSON.stringify(cuoi) !== JSON.stringify(anhDau),
				`omc: spec de lai cau hinh ${JSON.stringify(cuoi)}`,
			);
		},
		CHO,
	);
});
