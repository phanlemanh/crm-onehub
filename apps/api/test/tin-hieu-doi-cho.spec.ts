import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import { API_KEY_HEADER } from "@crm/auth";
import { db } from "@crm/db";
import {
	BAN_CHUP_LO_TRINH,
	type BanChupVao,
} from "@crm/validation/ban-chup-lo-trinh";
import { noiDungThongBao } from "@crm/validation/thong-bao";
import { idTep } from "@crm/validation/tin-hieu";
import { choTinHieu, type KhoaChoTinHieu } from "@crm/validation/tin-hieu-cho";
import { Logger } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { z } from "zod";
import {
	type DauVaoKit,
	dungKhoiMau,
} from "../../app/test/support/khoi-tin-hieu-mau";
import { createApp } from "../src/create-app";
import { LoTrinhBanChupService } from "../src/lo-trinh/lo-trinh-ban-chup.service";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = `ttts${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
const NGUON = BAN_CHUP_LO_TRINH.nguonCrm;
const CHO_MS = 180_000;
const PHUT = 60_000;
const T0 = Date.parse("2026-10-22T01:00:00Z");
const iso = (ms: number) => new Date(ms).toISOString();
const sha = (c: string) => c.repeat(40);
const LOAI = "tin-hieu-doi-cho";

const khoaTao = z.object({ id: z.string(), key: z.string() });
const ketQuaRa = z.object({ ketQua: z.enum(BAN_CHUP_LO_TRINH.ketQua) });

let app: NestExpressApplication;
let khoaDay = "";
let khoaChu = "";
let chuKho = "";
let soNguoi = 0;
const cookie = new Map<string, string>();

type Gieo = { id: string; so: number; ma: string; nguoi: string };

async function trpc(
	nguoi: string,
	thuTuc: string,
	vao: Readonly<Record<string, string | number | null | undefined>>,
) {
	const r = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie.get(nguoi) ?? "")
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return { status: r.status, data: r.body?.result?.data };
}

async function nguoiMoi(vai: "owner" | "member" = "member"): Promise<string> {
	soNguoi += 1;
	const id = `${TIEN_TO}-${soNguoi}`;
	await gieoThanhVien(id, vai);
	cookie.set(id, (await mintPhien(id)).cookie);
	return id;
}

async function gui(chu: string): Promise<Gieo> {
	const nguoi = await nguoiMoi();
	const r = await trpc(nguoi, "tinHieu.gui", {
		muonLam: `muốn ${chu}`,
		daXayRa: `${TIEN_TO} ${chu}`,
		man: "/tin-hieu",
	});
	expect(`${chu}: ${r.status}`).toBe(`${chu}: 200`);
	const id = z.object({ id: z.string() }).parse(r.data).id;
	const so = (await db.tinHieu.findUniqueOrThrow({ where: { id } })).so;
	return { id, so, ma: idTep(so), nguoi };
}

async function keoVe(): Promise<void> {
	const r = await request(app.getHttpServer())
		.post(`${REST_BRIDGE_PATH}/tin-hieu/keo-ve`)
		.set(API_KEY_HEADER, khoaChu)
		.set("content-type", "application/json")
		.send("{}");
	expect(r.status).toBe(200);
}

const day = (duLieu: Record<string, unknown>, s: string, luc: number) =>
	request(app.getHttpServer())
		.post(`${REST_BRIDGE_PATH}/lo-trinh/ban-chup`)
		.set(API_KEY_HEADER, khoaDay)
		.set("content-type", "application/json")
		.send(
			JSON.stringify({
				nguon: NGUON,
				sha: s,
				commitLuc: iso(luc),
				duLieu,
				canhBao: [],
			}),
		);

async function dayNhan(
	duLieu: Record<string, unknown>,
	s: string,
	luc: number,
) {
	const r = await day(duLieu, s, luc);
	expect(r.status, JSON.stringify(r.body)).toBe(200);
	return ketQuaRa.parse(r.body).ketQua;
}

const thongBaoCua = async (nguoi: string) =>
	(
		await db.thongBao.findMany({
			where: { nguoiNhanId: nguoi, khoa: { startsWith: `${LOAI}:` } },
		})
	).map((t) => ({ ...t, nd: noiDungThongBao.parse(t.noiDung) }));

const demCua = async (nguoi: string) => (await thongBaoCua(nguoi)).length;

const don = () => db.banChupLoTrinh.deleteMany({ where: { nguon: NGUON } });

function kit(
	tinHieu: Gieo[],
	vao: Omit<DauVaoKit, "tinHieu">,
): Record<string, unknown> {
	return dungKhoiMau({ tinHieu: tinHieu.map((t) => ({ ma: t.ma })), ...vao });
}

beforeAll(async () => {
	app = await createApp();
	await app.listen(0, "127.0.0.1");
	const chu = await nguoiMoi("owner");
	chuKho = chu;
	const day_ = await trpc(chu, "apiKeys.create", {
		name: `${TIEN_TO}-day`,
		expiresInDays: null,
		loai: "day-lo-trinh",
	});
	khoaDay = khoaTao.parse(day_.data).key;
	const thuong = await trpc(chu, "apiKeys.create", {
		name: `${TIEN_TO}-thuong`,
		expiresInDays: null,
	});
	khoaChu = khoaTao.parse(thuong.data).key;
	await don();
}, CHO_MS);

afterAll(async () => {
	await don();
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await db.tinHieu.deleteMany({
		where: { daXayRa: { startsWith: TIEN_TO } },
	});
	await db.apikey.deleteMany({
		where: { referenceId: { startsWith: TIEN_TO } },
	});
	await db.session.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.member.deleteMany({ where: { userId: { startsWith: TIEN_TO } } });
	await db.user.deleteMany({ where: { id: { startsWith: TIEN_TO } } });
	await app.close();
});

const O_BAO = [
	"cho-gom->nhom-chua-cat",
	"cho-gom->le",
	"cho-gom->da-phu",
	"cho-gom->chan-troi",
	"nhom X->nhom Y",
	"nhom-chua-cat->chua-bat-dau",
	"chua-bat-dau->dang-lam",
	"dang-lam->da-giao",
	"hang A->hang B",
] as const;
const O_KHONG_BAO = ["vang->cho-gom", "khong doi"] as const;

describe("ttts-bao", () => {
	test(
		"ttts-bao: ma tran 11 o chuyen cho, moi o bao dung mot thong bao cho dung nguoi gui",
		async () => {
			await don();
			const o = new Map<string, Gieo>();
			for (const ten of [...O_BAO, ...O_KHONG_BAO]) o.set(ten, await gui(ten));
			await keoVe();
			const g = (ten: string) => {
				const t = o.get(ten);
				if (!t) throw new Error(`thieu o ${ten}`);
				return t;
			};
			const tatCa = [...o.values()];
			const cu = kit(
				tatCa.filter((t) => t !== g("vang->cho-gom")),
				{
					nhom: [
						{ ma: "g5", ten: "Nhóm X", tinHieu: [g("nhom X->nhom Y").ma] },
						{
							ma: "g6",
							ten: "Nhóm sáu",
							tinHieu: [g("nhom-chua-cat->chua-bat-dau").ma],
						},
						{
							ma: "g7",
							ten: "Nhóm bảy",
							tinHieu: [g("chua-bat-dau->dang-lam").ma],
						},
						{ ma: "g8", ten: "Nhóm tám", tinHieu: [g("dang-lam->da-giao").ma] },
						{ ma: "g9", ten: "Nhóm chín", tinHieu: [g("hang A->hang B").ma] },
						{ ma: "g10", ten: "Nhóm mười", tinHieu: [g("khong doi").ma] },
					],
					hang: [
						{
							ma: "R7",
							cauGiao: "«Việc bảy»",
							phu: ["g7"],
							trangThai: "chua-bat-dau",
						},
						{
							ma: "R8",
							cauGiao: "«Việc tám»",
							phu: ["g8"],
							trangThai: "dang-lam",
						},
						{
							ma: "R9A",
							cauGiao: "«Việc A»",
							phu: ["g9"],
							trangThai: "chua-bat-dau",
						},
						{
							ma: "R9B",
							cauGiao: "«Việc B»",
							phu: [],
							trangThai: "chua-bat-dau",
						},
					],
				},
			);
			const moi = kit(tatCa, {
				nhom: [
					{
						ma: "g1",
						ten: "Nhóm một",
						tinHieu: [g("cho-gom->nhom-chua-cat").ma],
					},
					{ ma: "g4", ten: "Nhóm bốn", tinHieu: [g("cho-gom->chan-troi").ma] },
					{ ma: "g5b", ten: "Nhóm Y", tinHieu: [g("nhom X->nhom Y").ma] },
					{
						ma: "g6",
						ten: "Nhóm sáu",
						tinHieu: [g("nhom-chua-cat->chua-bat-dau").ma],
					},
					{
						ma: "g7",
						ten: "Nhóm bảy",
						tinHieu: [g("chua-bat-dau->dang-lam").ma],
					},
					{ ma: "g8", ten: "Nhóm tám", tinHieu: [g("dang-lam->da-giao").ma] },
					{ ma: "g9", ten: "Nhóm chín", tinHieu: [g("hang A->hang B").ma] },
					{ ma: "g10", ten: "Nhóm mười", tinHieu: [g("khong doi").ma] },
				],
				le: [{ ma: g("cho-gom->le").ma, lyDo: "trùng" }],
				daPhu: [
					{ ma: g("cho-gom->da-phu").ma, hoSo: "gui-tin-hieu-trong-crm" },
				],
				hang: [
					{
						ma: "R6",
						cauGiao: "«Việc sáu»",
						phu: ["g6"],
						trangThai: "chua-bat-dau",
					},
					{
						ma: "R7",
						cauGiao: "«Việc bảy»",
						phu: ["g7"],
						trangThai: "dang-lam",
					},
					{
						ma: "R8",
						cauGiao: "«Việc tám»",
						phu: ["g8"],
						trangThai: "da-giao",
					},
					{
						ma: "R9A",
						cauGiao: "«Việc A»",
						phu: [],
						trangThai: "chua-bat-dau",
					},
					{
						ma: "R9B",
						cauGiao: "«Việc B»",
						phu: ["g9"],
						trangThai: "chua-bat-dau",
					},
				],
				chanTroi: [{ ma: "C4", lyDo: "chờ quý sau", phu: ["g4"] }],
			});
			const KY_VONG: Record<(typeof O_BAO)[number], KhoaChoTinHieu> = {
				"cho-gom->nhom-chua-cat": "nhom-chua-cat",
				"cho-gom->le": "le",
				"cho-gom->da-phu": "da-phu",
				"cho-gom->chan-troi": "chan-troi",
				"nhom X->nhom Y": "nhom-chua-cat",
				"nhom-chua-cat->chua-bat-dau": "chua-bat-dau",
				"chua-bat-dau->dang-lam": "dang-lam",
				"dang-lam->da-giao": "da-giao",
				"hang A->hang B": "chua-bat-dau",
			};
			const choMoi = choTinHieu(moi);
			if (choMoi.kieu !== "co") throw new Error("khoi moi khong doc duoc");
			for (const ten of O_BAO)
				expect(choMoi.theoMa.get(g(ten).ma)?.khoa, `kit ve sai o ${ten}`).toBe(
					KY_VONG[ten],
				);

			const s1 = sha("1");
			const s2 = sha("2");
			expect(await dayNhan(cu, s1, T0)).toBe("nhan");
			expect(await dayNhan(moi, s2, T0 + PHUT)).toBe("nhan");

			const sai: string[] = [];
			for (const ten of O_BAO) {
				const t = g(ten);
				const ds = await thongBaoCua(t.nguoi);
				if (ds.length !== 1) {
					sai.push(`${ten}: ${ds.length} thong bao`);
					continue;
				}
				const [tb] = ds;
				if (!tb || tb.nd.loai !== LOAI) {
					sai.push(`${ten}: sai loai`);
					continue;
				}
				if (tb.nd.ma !== t.ma) sai.push(`${ten}: ma ${tb.nd.ma}`);
				if (tb.nd.khoa !== choMoi.theoMa.get(t.ma)?.khoa)
					sai.push(`${ten}: khoa ${tb.nd.khoa}`);
				if (tb.nd.sha !== s2) sai.push(`${ten}: sha ${tb.nd.sha}`);
				if (tb.duongDan !== "/tin-hieu")
					sai.push(`${ten}: duong ${tb.duongDan}`);
				if (tb.nguon !== "tin-hieu") sai.push(`${ten}: nguon ${tb.nguon}`);
			}
			for (const ten of O_KHONG_BAO) {
				const n = await demCua(g(ten).nguoi);
				if (n !== 0) sai.push(`${ten}: ${n} thong bao, ky vong 0`);
			}
			if (
				sai.some(
					(s) => s.startsWith("dang-lam->da-giao") || s.startsWith("hang A"),
				)
			)
				sai.unshift("doi trang thai viec khong bao nguoi gui");
			if (sai.some((s) => s.startsWith("vang->cho-gom")))
				sai.unshift("bao nham lan dau vao ban chup");
			expect(sai).toEqual([]);
			const tong = await db.thongBao.count({
				where: {
					nguoiNhanId: { startsWith: TIEN_TO },
					khoa: { startsWith: `${LOAI}:` },
				},
			});
			expect(tong, "co nguoi nhan thong bao cua ma nguoi khac").toBe(
				O_BAO.length,
			);
		},
		CHO_MS,
	);
});

async function caDoi(chu: string) {
	const t = await gui(chu);
	return {
		t,
		cu: (them: Gieo[] = []) => kit([t, ...them], {}),
		moi: (them: Gieo[] = []) =>
			kit([t, ...them], {
				nhom: [
					{
						ma: "gx",
						ten: "Nhóm mới",
						tinHieu: [t.ma, ...them.map((x) => x.ma)],
					},
				],
			}),
	};
}

describe("ttts-khong-bao", () => {
	test(
		"ttts-khong-bao: 12 ca khong co nguoi nhan hop le hay luot khong moi, khong thong bao nao",
		async () => {
			const sai: string[] = [];
			const warn = spyOn(Logger.prototype, "warn");
			let luc = T0 + 10 * PHUT;
			const buoc = () => {
				luc += PHUT;
				return luc;
			};

			await don();
			const doiChung = await caDoi("doi-chung");
			const luuTru = await caDoi("luu-tru");
			const khongNguoi = await caDoi("khong-nguoi-gui");
			const roi = await caDoi("roi-khong-gian");
			expect(
				(await trpc(chuKho, "tinHieu.luuTru", { id: luuTru.t.id })).status,
			).toBe(200);
			await keoVe();
			await db.user.delete({ where: { id: khongNguoi.t.nguoi } });
			await db.member.deleteMany({ where: { userId: roi.t.nguoi } });
			const maLa = { ...doiChung.t, ma: idTep(2_000_000_000) };
			const nhom4 = [luuTru.t, khongNguoi.t, roi.t, maLa];
			await dayNhan(doiChung.cu(nhom4), sha("3"), buoc());
			await dayNhan(doiChung.moi(nhom4), sha("4"), buoc());
			if ((await demCua(doiChung.t.nguoi)) !== 1)
				sai.push("doi chung: duong bao chet");
			if ((await demCua(luuTru.t.nguoi)) !== 0)
				sai.push("bao cho tin hieu da luu tru");
			const conLai = await db.thongBao.count({
				where: { khoa: { contains: `:${khongNguoi.t.ma}:` } },
			});
			if (conLai !== 0) sai.push("khong-nguoi-gui: co thong bao");
			if ((await demCua(roi.t.nguoi)) !== 0)
				sai.push("roi-khong-gian: co thong bao");
			if (
				(await db.thongBao.count({
					where: { khoa: { contains: `:${maLa.ma}:` } },
				})) !== 0
			)
				sai.push("ma-la: co thong bao");

			const luot = async (
				ten: string,
				lam: (c: Awaited<ReturnType<typeof caDoi>>) => Promise<void>,
			) => {
				await don();
				const c = await caDoi(ten);
				await keoVe();
				await lam(c);
				const n = await demCua(c.t.nguoi);
				if (n !== 0) sai.push(`${ten}: ${n} thong bao`);
			};

			await luot("cung-sha", async (c) => {
				await dayNhan(c.cu(), sha("5"), buoc());
				const l = buoc();
				expect(await dayNhan(c.cu(), sha("6"), l)).toBe("nhan");
				expect(await dayNhan(c.moi(), sha("6"), l)).toBe("trung");
			});
			await luot("cu-hon", async (c) => {
				const l = buoc();
				await dayNhan(c.cu(), sha("7"), buoc());
				expect(await dayNhan(c.moi(), sha("8"), l)).toBe("cu-hon");
			});
			await luot("dau-tien", async (c) => {
				expect(await dayNhan(c.moi(), sha("9"), buoc())).toBe("nhan");
			});

			for (const [ten, sua, ban] of [
				[
					"cu-vang",
					(d: Record<string, unknown>) => ({ ...d, tin_hieu: undefined }),
					"cu",
				],
				[
					"cu-hong",
					(d: Record<string, unknown>) => ({ ...d, tin_hieu: [{ id: 1 }] }),
					"cu",
				],
				[
					"moi-vang",
					(d: Record<string, unknown>) => ({ ...d, tin_hieu: undefined }),
					"moi",
				],
				[
					"moi-hong",
					(d: Record<string, unknown>) => ({ ...d, tin_hieu: [{ id: 1 }] }),
					"moi",
				],
			] as const) {
				await luot(ten, async (c) => {
					warn.mockClear();
					const cu = ban === "cu" ? sua(c.cu()) : c.cu();
					const moi = ban === "moi" ? sua(c.moi()) : c.moi();
					await dayNhan(cu, sha("a"), buoc());
					const s = sha("b");
					const r = await day(moi, s, buoc());
					const kq =
						r.status === 200
							? ketQuaRa.parse(r.body).ketQua
							: `loi ${r.status}`;
					if (kq !== "nhan")
						sai.push(
							ban === "moi"
								? "danh sach tin hieu hong chan ban chup"
								: `${ten}: ${kq}`,
						);
					const hang = await db.banChupLoTrinh.findUnique({
						where: { nguon: NGUON },
					});
					if (hang?.sha !== s)
						sai.push(`${ten}: ban chup khong doi sang ban moi`);
					const canh = warn.mock.calls.filter(
						([o]) =>
							typeof o === "object" &&
							o !== null &&
							"message" in o &&
							o.message === "lo-trinh.ban-chup.tin-hieu-khong-doc-duoc" &&
							"sha" in o &&
							o.sha === s &&
							"nguon" in o &&
							o.nguon === NGUON,
					);
					if (canh.length !== 1)
						sai.push(`${ten}: ${canh.length} dong canh bao`);
				});
				if (ten === "cu-hong" && sai.some((x) => x.startsWith("cu-hong: ")))
					sai.unshift("bao hang loat khi ban truoc khong doc duoc");
			}

			await don();
			const dua = await caDoi("chay-dua");
			await keoVe();
			await dayNhan(dua.cu(), sha("c"), buoc());
			const l = buoc();
			const [a, b] = await Promise.all([
				day(dua.moi(), sha("d"), l),
				day(dua.moi(), sha("d"), l),
			]);
			const kqDua = [a, b].map((r) =>
				r.status === 200 ? ketQuaRa.parse(r.body).ketQua : `loi ${r.status}`,
			);
			if ([...kqDua].sort().join(",") !== "nhan,trung")
				sai.push(`hai luot chay dua bao trung: ${kqDua.join(",")}`);
			if ((await demCua(dua.t.nguoi)) !== 1)
				sai.push("hai luot chay dua bao trung");

			warn.mockRestore();
			expect(sai).toEqual([]);
		},
		CHO_MS,
	);
});

describe("ttts-giao-dich", () => {
	test(
		"ttts-giao-dich: ghi thong bao hong thi ban chup khong doi va khong thong bao nao",
		async () => {
			await don();
			const c = await caDoi("giao-dich");
			await keoVe();
			const s1 = sha("e");
			const s2 = sha("f");
			await dayNhan(c.cu(), s1, T0 + 100 * PHUT);
			const banChup = app.get(LoTrinhBanChupService);
			const vao = {
				nguon: NGUON,
				sha: s2,
				commitLuc: iso(T0 + 101 * PHUT),
				duLieu: c.moi() as BanChupVao["duLieu"],
				canhBao: [],
			};
			let loi: unknown = null;
			try {
				await banChup.ghi(vao, {
					ghiThongBao: async () => {
						throw new Error("TTTS-LOI");
					},
				});
			} catch (e) {
				loi = e;
			}
			expect(
				loi instanceof Error && loi.message === "TTTS-LOI",
				"loi ghi thong bao bi nuot, luot Actions xanh",
			).toBe(true);
			const hang = await db.banChupLoTrinh.findUnique({
				where: { nguon: NGUON },
			});
			expect(hang?.sha, "ban chup doi ma thong bao mat").toBe(s1);
			expect(hang?.duLieu as unknown).toEqual(c.cu());
			expect(await demCua(c.t.nguoi)).toBe(0);
			const lai = await banChup.ghi(vao);
			expect(lai.ketQua).toBe("nhan");
			expect(
				(await db.banChupLoTrinh.findUnique({ where: { nguon: NGUON } }))?.sha,
			).toBe(s2);
			expect(await demCua(c.t.nguoi)).toBe(1);
		},
		CHO_MS,
	);
});
