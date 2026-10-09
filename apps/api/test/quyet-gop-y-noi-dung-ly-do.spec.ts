import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db, Prisma } from "@crm/db";
import {
	LY_DO_KHONG_QUYET,
	type LyDoKhongQuyet,
} from "@crm/validation/okr-tro-ly";
import { BadRequestException } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OKR } from "../src/okr/okr-config";
import { lyDoKhongQuyetCua } from "../src/okr/tro-ly.service";
import {
	batDauMau,
	CHO_DB,
	CHO_MA_TRAN,
	doiDauVao,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const T = OKR.thongDiep;
const MT = mt("q4-kd-bac-1");
const K2 = kr("q4-kd-bac-1-k2");
const K3 = kr("q4-kd-bac-1-k3");
const DICH = mt("n2");
const MT_KHAC_KY = mt("q3-kd-bac");
const TRUONG = "nguyen-thi-lan";
const NGUOI_XEM = "bui-quang-huy";

type LoaiDong = "ten" | "kr" | "can";
type TraLai = () => Promise<void>;
type Ca = {
	ma: LyDoKhongQuyet;
	dong: LoaiDong;
	cookie: () => string;
	dat: (deXuatId: string) => Promise<TraLai>;
};

let app: NestExpressApplication;
let cookieTruong = "";
let cookieXem = "";
const hang: Record<LoaiDong, string> = { ten: "", kr: "", can: "" };

const khongDoi: TraLai = async () => {};

async function doiMucTieu(
	id: string,
	data: Pick<
		Prisma.OkrObjectiveUncheckedUpdateInput,
		"status" | "hienThi" | "level" | "cycleId"
	>,
): Promise<TraLai> {
	const cu = await db.okrObjective.findUniqueOrThrow({
		where: { id },
		select: { status: true, hienThi: true, level: true, cycleId: true },
	});
	await db.okrObjective.update({ where: { id }, data });
	return async () => {
		await db.okrObjective.update({ where: { id }, data: cu });
	};
}

async function doiChuKy(
	data: Pick<Prisma.OkrCycleUncheckedUpdateInput, "phase" | "anLuc">,
): Promise<TraLai> {
	const { cycleId } = await db.okrObjective.findUniqueOrThrow({
		where: { id: MT },
		select: { cycleId: true },
	});
	const cu = await db.okrCycle.findUniqueOrThrow({
		where: { id: cycleId },
		select: { phase: true, anLuc: true },
	});
	await db.okrCycle.update({ where: { id: cycleId }, data });
	return async () => {
		await db.okrCycle.update({ where: { id: cycleId }, data: cu });
	};
}

async function doiKr(
	data: Pick<
		Prisma.OkrKeyResultUncheckedUpdateInput,
		"kind" | "startValue" | "targetValue"
	>,
): Promise<TraLai> {
	const cu = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: K2 },
		select: { kind: true, startValue: true, targetValue: true },
	});
	await db.okrKeyResult.update({ where: { id: K2 }, data });
	return async () => {
		await db.okrKeyResult.update({ where: { id: K2 }, data: cu });
	};
}

async function doiDich(
	id: string,
	dich: { targetObjectiveId: string; targetKeyResultId: null },
): Promise<TraLai> {
	const cu = await db.okrDeXuat.findUniqueOrThrow({
		where: { id },
		select: { dich: true },
	});
	await db.okrDeXuat.update({ where: { id }, data: { dich } });
	return async () => {
		await db.okrDeXuat.update({
			where: { id },
			data: { dich: cu.dich ?? Prisma.DbNull },
		});
	};
}

const MA_TRAN: readonly Ca[] = [
	{
		ma: "muc-tieu-da-bo",
		dong: "ten",
		cookie: () => cookieTruong,
		dat: () => doiMucTieu(MT, { status: "da-bo" }),
	},
	{
		ma: "dang-cho-duyet",
		dong: "ten",
		cookie: () => cookieTruong,
		dat: () => doiMucTieu(MT, { status: "cho-duyet" }),
	},
	{
		ma: "so-sai-kieu",
		dong: "kr",
		cookie: () => cookieTruong,
		dat: () => doiKr({ kind: "tang-toi", startValue: 100, targetValue: 10 }),
	},
	{
		ma: "can-chinh-gioi-han",
		dong: "can",
		cookie: () => cookieTruong,
		dat: () => doiMucTieu(MT, { hienThi: "gioi-han" }),
	},
	{
		ma: "can-chinh-chinh-no",
		dong: "can",
		cookie: () => cookieTruong,
		dat: (id) =>
			doiDich(id, { targetObjectiveId: MT, targetKeyResultId: null }),
	},
	{
		ma: "can-chinh-cung-cap",
		dong: "can",
		cookie: () => cookieTruong,
		dat: async () => {
			const { level } = await db.okrObjective.findUniqueOrThrow({
				where: { id: MT },
				select: { level: true },
			});
			return doiMucTieu(DICH, { level });
		},
	},
	{
		ma: "can-chinh-chua-cong-bo",
		dong: "can",
		cookie: () => cookieTruong,
		dat: () => doiMucTieu(DICH, { status: "nhap" }),
	},
	{
		ma: "can-chinh-khac-chu-ky",
		dong: "can",
		cookie: () => cookieTruong,
		dat: async () => {
			const { cycleId } = await db.okrObjective.findUniqueOrThrow({
				where: { id: MT_KHAC_KY },
				select: { cycleId: true },
			});
			return doiMucTieu(DICH, { cycleId });
		},
	},
	{
		ma: "can-chinh-da-gan",
		dong: "can",
		cookie: () => cookieTruong,
		dat: async () => {
			const lk = await db.okrAlignment.create({
				data: { objectiveId: MT, targetObjectiveId: DICH },
			});
			return async () => {
				await db.okrAlignment.delete({ where: { id: lk.id } });
			};
		},
	},
];

const GIU_HTTP: readonly {
	ten: string;
	dong: LoaiDong;
	cookie: () => string;
	dat: () => Promise<TraLai>;
	status: number;
	cau: string;
}[] = [
	{
		ten: "ky-da-an",
		dong: "ten",
		cookie: () => cookieTruong,
		dat: () => doiChuKy({ anLuc: new Date() }),
		status: 400,
		cau: T.chuKy.kyDaAn,
	},
	{
		ten: "ky-da-khoa",
		dong: "ten",
		cookie: () => cookieTruong,
		dat: () => doiChuKy({ phase: "cham-diem" }),
		status: 400,
		cau: T.kyDaKhoa,
	},
	{
		ten: "khong-sua-duoc-kr",
		dong: "kr",
		cookie: () => cookieXem,
		dat: async () => khongDoi,
		status: 403,
		cau: T.khongSuaDuocKr,
	},
	{
		ten: "khong-sua-duoc-don-vi",
		dong: "ten",
		cookie: () => cookieXem,
		dat: async () => khongDoi,
		status: 403,
		cau: T.khongSuaDuocDonVi,
	},
];

async function okrCua() {
	const [m, k, lk] = await Promise.all([
		db.okrObjective.findUniqueOrThrow({
			where: { id: MT },
			select: { title: true, whyNow: true },
		}),
		db.okrKeyResult.findUniqueOrThrow({
			where: { id: K2 },
			select: { title: true },
		}),
		db.okrAlignment.count({ where: { objectiveId: MT } }),
	]);
	return JSON.stringify([m.title, m.whyNow, k.title, lk]);
}

function quyet(
	deXuatId: string,
	cach: "nhan" | "sua",
	cookie: string,
	giaTri?: string,
) {
	tienDongHo();
	return goi(
		app,
		"okr.troLyQuyet",
		"mutation",
		{ deXuatId, cach, giaTri },
		cookie,
	);
}

const trangThaiCua = async (id: string) =>
	(
		await db.okrDeXuat.findUniqueOrThrow({
			where: { id },
			select: { trangThai: true },
		})
	).trangThai;

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	cookieTruong = await phienMau(TRUONG);
	cookieXem = await phienMau(NGUOI_XEM);
	await ghiCauHinh(app, await phienMau("le-hai-dang"), NAC_CAU_HINH.bat);
	const k2 = await db.okrKeyResult.findUniqueOrThrow({
		where: { id: K2 },
		select: { title: true },
	});
	const { title } = await db.okrObjective.findUniqueOrThrow({
		where: { id: MT },
		select: { title: true },
	});
	const ids = await gieoDong(MT, null, [
		dongMau({
			loai: "viet-lai",
			objectiveId: MT,
			truong: "title",
			truoc: title,
			sau: "Bán lẻ miền Bắc lớn đều qua từng tháng",
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: MT,
			keyResultId: K2,
			truong: "kr.title",
			truoc: k2.title,
			sau: `${k2.title}, rõ từng tuần`,
		}),
		dongMau({
			loai: "can-chinh",
			objectiveId: MT,
			targetObjectiveId: DICH,
			lyDo: "Mục tiêu này góp vào giao đúng hẹn.",
		}),
	]);
	[hang.ten, hang.kr, hang.can] = ids as [string, string, string];
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("k3c-ma-tran", () => {
	test(
		"k3c-ma-tran nguoi-xem-dung: NGUOI_XEM xem duoc muc tieu",
		async () => {
			const tra = await goi(
				app,
				"okr.objective",
				"query",
				{ id: MT },
				cookieXem,
			);
			expect(tra.status, `nguoi xem: status ${tra.status}`).toBe(200);
		},
		CHO_DB,
	);

	test(
		"k3c-ma-tran moi ly do co dinh tra { ok: false, lyDo }, gop y van cho, okr khong doi",
		async () => {
			expect(MA_TRAN.map((c) => c.ma)).toEqual([...LY_DO_KHONG_QUYET]);
			expect(MA_TRAN.length).toBe(9);
			const lech: string[] = [];
			for (const ca of MA_TRAN) {
				const id = hang[ca.dong];
				const traLai = await ca.dat(id);
				try {
					const truoc = await okrCua();
					const tra = await quyet(id, "nhan", ca.cookie());
					const sau = await okrCua();
					const trangThai = await trangThaiCua(id);
					const dung =
						tra.status === 200 &&
						JSON.stringify(tra.data) ===
							JSON.stringify({ ok: false, lyDo: ca.ma });
					if (!dung)
						lech.push(
							`${ca.ma}: ok=${tra.status} lyDo=${JSON.stringify(tra.data ?? tra.loi)}`,
						);
					if (trangThai !== "cho")
						lech.push(`${ca.ma}: gop y khong con cho (trangThai=${trangThai})`);
					if (sau !== truoc) lech.push(`${ca.ma}: okr da doi`);
				} finally {
					await traLai();
				}
			}
			expect(lech, lech.join("\n")).toEqual([]);
		},
		CHO_MA_TRAN,
	);
});

describe("k3c-ngoai", () => {
	test(
		"k3c-ngoai muoi mot ca loi ngoai tap giu duong cu",
		async () => {
			const lech: string[] = [];
			const ca = (ten: string, dung: boolean, thatTe: string) => {
				if (!dung) lech.push(`k3c-ngoai ${ten}: ${thatTe}`);
			};
			let so = 0;
			const ketQuaGoi: Awaited<ReturnType<typeof quyet>>[] = [];

			await doiDauVao(app, cookieTruong, K3);
			const { whyNow } = await db.okrObjective.findUniqueOrThrow({
				where: { id: MT },
				select: { whyNow: true },
			});
			const [daQuyet, hoi] = await gieoDong(MT, null, [
				dongMau({
					loai: "viet-lai",
					objectiveId: MT,
					truong: "whyNow",
					truoc: whyNow,
					sau: `${whyNow} Đây là mùa đối tác cần kho nhất.`,
				}),
				dongMau({
					loai: "hoi",
					objectiveId: MT,
					maVanDe: "khong-do-duoc",
					lyDo: "Câu hỏi giúp làm rõ cách đo.",
				}),
			]);
			if (!daQuyet || !hoi) throw new Error("gieo k3c-ngoai khong du hai dong");

			const khong = await quyet("clx0000khongco", "nhan", cookieTruong);
			ca(
				"khong-co",
				khong.status === 404,
				`${khong.status} ${JSON.stringify(khong.data)}`,
			);
			so++;

			await db.okrDeXuat.update({
				where: { id: daQuyet },
				data: { trangThai: "bo-qua" },
			});
			const xung = await quyet(daQuyet, "nhan", cookieTruong);
			ca(
				"da-quyet",
				xung.status === 409,
				`${xung.status} ${JSON.stringify(xung.data)}`,
			);
			so++;

			const cach = await quyet(hoi, "sua", cookieTruong, "x");
			ca(
				"cach-khong-hop",
				cach.status === 400 && cach.loi.includes(T.troLy.cachKhongHop),
				`${cach.status} ${cach.loi}`,
			);
			so++;

			await db.okrDeXuat.update({
				where: { id: hoi },
				data: { loai: "loai-khong-co" },
			});
			const loi500 = await quyet(hoi, "nhan", cookieTruong);
			const trangThai = await trangThaiCua(hoi);
			ca(
				"hang-hong",
				loi500.status === 500 && trangThai === "cho",
				`${loi500.status} ${trangThai}`,
			);
			so++;

			for (const giu of GIU_HTTP) {
				const traLai = await giu.dat();
				try {
					const tra = await quyet(hang[giu.dong], "nhan", giu.cookie());
					const trangThai = await trangThaiCua(hang[giu.dong]);
					ca(
						`giu-http ${giu.ten}`,
						tra.status === giu.status &&
							tra.loi.includes(giu.cau) &&
							trangThai === "cho",
						`${tra.status} ${tra.loi} ${trangThai}`,
					);
					so++;
					ketQuaGoi.push(tra);
				} finally {
					await traLai();
				}
			}
			ca(
				"cau-la",
				lyDoKhongQuyetCua(new BadRequestException("cau la")) === null,
				"khong null",
			);
			so++;
			ca(
				"error-cung-cau",
				lyDoKhongQuyetCua(new Error(T.canChinh.chuaCongBo)) === null,
				"khong null",
			);
			so++;
			ca(
				"prisma",
				lyDoKhongQuyetCua(
					new Prisma.PrismaClientKnownRequestError(T.canChinh.daGan, {
						code: "P2002",
						clientVersion: "test",
					}),
				) === null,
				"khong null",
			);
			so++;

			for (const t of [khong, xung, cach, loi500, ...ketQuaGoi])
				if (JSON.stringify(t.data ?? null).includes('"ok":false'))
					lech.push(`k3c-ngoai tra ok:false: ${JSON.stringify(t.data)}`);
			expect(so).toBe(11);
			expect(lech, lech.join("\n")).toEqual([]);
		},
		CHO_DB,
	);
});
