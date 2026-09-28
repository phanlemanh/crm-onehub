import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { OkrService } from "../src/okr/okr.service";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	goi,
	goiRest,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	nguoi,
	nopThat,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const MT = mt("q4-kd-bac-1");
const PHUT_MS = 60_000;
const NGUOI = {
	"quan-tri": "le-hai-dang",
	"truong-phong-ban": "nguyen-thi-lan",
	"truong-bo-phan": "tran-quoc-bao",
	"phu-trach-kr": "do-minh-khoa",
	"thanh-vien": "bui-quang-huy",
	"vai-okr": "giang-hai-yen",
} as const;
type Nguoi = keyof typeof NGUOI;

let app: NestExpressApplication;
const cookie = {} as Record<Nguoi, string>;
let dem = 0;
let viecAnDau = "";
let dongAn: string[] = [];

const luotAn = (objectiveId: string) =>
	db.agentTask.findMany({
		where: {
			kind: "okr-de-xuat",
			AND: [
				{ payload: { path: ["objectiveId"], equals: objectiveId } },
				{ payload: { path: ["nac"], equals: "an" } },
			],
		},
		orderBy: { createdAt: "asc" },
		select: { id: true, payload: true },
	});

const tongAnHomNay = () =>
	db.agentTask.count({
		where: { kind: "okr-de-xuat", payload: { path: ["nac"], equals: "an" } },
	});

async function doiTen(
	objectiveId = MT,
	ai: Nguoi = "truong-phong-ban",
): Promise<void> {
	dem += 1;
	ok(
		await goi(
			app,
			"okr.updateObjective",
			"mutation",
			{
				id: objectiveId,
				title: `Giữ đà bán lẻ miền Bắc bản ${"z".repeat(dem)}`,
			},
			cookie[ai],
		),
		"doi ten",
	);
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const [k, ma] of Object.entries(NGUOI) as [Nguoi, string][])
		cookie[k] = await phienMau(ma);
	datDongHo(new Date("2026-11-13T00:05:00+07:00"));
	await ghiCauHinh(app, cookie["quan-tri"], NAC_CAU_HINH.an);
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("che-do-an", () => {
	test(
		"đổi tên ở đơn vị chế độ ẩn → đúng một hàng okr-de-xuat nấc an",
		async () => {
			tienDongHo();
			await doiTen();
			const ds = await luotAn(MT);
			expect(ds).toHaveLength(1);
			expect(ds[0]?.payload).toMatchObject({
				objectiveId: MT,
				keyResultId: null,
				nac: "an",
				nguoiYeuCau: nguoi("nguyen-thi-lan"),
			});
			viecAnDau = ds[0]?.id ?? "";
		},
		CHO_DB,
	);

	test(
		"lưu lại trong nhịp chế độ ẩn → không thêm",
		async () => {
			tienDongHo(TRO_LY_OKR_TRAN.nhipAnMucTieuMs - PHUT_MS);
			await doiTen();
			expect(await luotAn(MT)).toHaveLength(1);
		},
		CHO_DB,
	);

	test(
		"lưu chỉ đổi người tham gia → không thêm",
		async () => {
			tienDongHo(TRO_LY_OKR_TRAN.nhipAnMucTieuMs + PHUT_MS);
			ok(
				await goi(
					app,
					"okr.updateObjective",
					"mutation",
					{ id: MT, participantIds: [nguoi("do-minh-khoa")] },
					cookie["truong-phong-ban"],
				),
				"doi tham gia",
			);
			expect(await luotAn(MT)).toHaveLength(1);
		},
		CHO_DB,
	);

	test(
		"kich-an: tạo KR và đổi tên KR thì kích; chỉ đổi trọng số hay hàm …Trong thì không",
		async () => {
			const quanTri = cookie["quan-tri"];
			tienDongHo();
			const krMoi = ok<{ id: string }>(
				await goi(
					app,
					"okr.createKeyResult",
					"mutation",
					{
						objectiveId: mt("n2"),
						title: "Tỷ lệ đơn giao trong ngày",
						kind: "tang-toi",
						ownerUserId: nguoi("le-hai-dang"),
						startValue: 10,
						targetValue: 50,
						currentValue: 20,
						unit: "%",
						dueOn: null,
						weight: 1,
					},
					quanTri,
				),
				"tao kr",
			).id;
			const sauTao = await luotAn(mt("n2"));
			expect(sauTao).toHaveLength(1);
			expect(sauTao[0]?.payload).toMatchObject({
				keyResultId: krMoi,
				nac: "an",
			});

			tienDongHo();
			ok(
				await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{ id: kr("n3-k1"), title: "Tuyển đủ 25 người trước mùa cao điểm" },
					quanTri,
				),
				"doi ten kr",
			);
			const sauDoiKr = await luotAn(mt("n3"));
			expect(sauDoiKr).toHaveLength(1);
			expect(sauDoiKr[0]?.payload).toMatchObject({ keyResultId: kr("n3-k1") });

			tienDongHo();
			ok(
				await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{ id: kr("n1-k1"), weight: 2 },
					quanTri,
				),
				"doi trong so",
			);
			expect(await luotAn(mt("n1"))).toHaveLength(0);

			tienDongHo();
			const okr = app.get(OkrService);
			const kq = await db.$transaction((tx) =>
				okr.updateObjectiveTrong(
					tx,
					nguoi("le-hai-dang"),
					{
						id: mt("n1"),
						title: "Đối tác logistics được chọn đầu tiên ở hai miền",
					},
					{ note: "tro-ly-okr:thu" },
				),
			);
			expect(kq.luotAn.doiChu).toBe(true);
			const vet = await db.okrTrail.findFirstOrThrow({
				where: { objectiveId: mt("n1"), action: "sua" },
				orderBy: { at: "desc" },
				select: { note: true },
			});
			expect(vet.note).toBe("tro-ly-okr:thu");
			expect(await luotAn(mt("n1"))).toHaveLength(0);
		},
		CHO_DB,
	);

	test(
		"đủ trần lượt ẩn ngày → lưu thêm không thêm hàng",
		async () => {
			while ((await tongAnHomNay()) < TRO_LY_OKR_TRAN.luotAnMoiNgay) {
				tienDongHo(TRO_LY_OKR_TRAN.nhipAnMucTieuMs + PHUT_MS);
				const truoc = await tongAnHomNay();
				await doiTen();
				if ((await tongAnHomNay()) !== truoc + 1)
					throw new Error(`luot an thu ${truoc + 1} khong duoc xep`);
			}
			const homNay = new Date(Date.now()).toISOString();
			expect(homNay < "2026-11-13T17:00:00.000Z").toBe(true);
			tienDongHo(TRO_LY_OKR_TRAN.nhipAnMucTieuMs + PHUT_MS);
			const truoc = await tongAnHomNay();
			await doiTen();
			expect(await tongAnHomNay()).toBe(truoc);
		},
		CHO_DB,
	);

	test(
		"nop_de_xuat thật cho hàng ẩn ghi dòng nấc an, kể cả dòng bị loại",
		async () => {
			const ten = (
				await db.okrObjective.findUniqueOrThrow({
					where: { id: MT },
					select: { title: true },
				})
			).title;
			await nopThat(viecAnDau, [
				dongMau({
					loai: "viet-lai",
					objectiveId: MT,
					truong: "title",
					truoc: ten,
					sau: `${ten}, rõ từng tuần`,
				}),
				dongMau({
					loai: "viet-lai",
					objectiveId: MT,
					truong: "title",
					truoc: ten,
					sau: `${ten}, đạt 99 hợp đồng`,
				}),
			]);
			const hang = await db.okrDeXuat.findMany({
				where: { taskId: viecAnDau },
				orderBy: [{ createdAt: "asc" }, { id: "asc" }],
			});
			expect(
				hang.map((h) => ({
					nac: h.nac,
					trangThai: h.trangThai,
					maLoai: h.maLoai,
				})),
			).toEqual([
				{ nac: "an", trangThai: "cho", maLoai: null },
				{ nac: "an", trangThai: "bi-loai", maLoai: "so-moi" },
			]);
			dongAn = hang.map((h) => h.id);
		},
		CHO_DB,
	);

	test(
		"mọi người dùng gọi troLyDanhSach qua tRPC và REST không thấy dòng ẩn",
		async () => {
			for (const ai of Object.keys(NGUOI) as Nguoi[]) {
				const vao = { objectiveId: MT };
				for (const tra of [
					await goi(app, "okr.troLyDanhSach", "query", vao, cookie[ai]),
					await goiRest(
						app,
						"GET",
						"/okr/objectives/{objectiveId}/assistant/suggestions",
						vao,
						cookie[ai],
					),
				]) {
					expect([200, 403]).toContain(tra.status);
					const ids =
						tra.status === 200
							? (tra.data as { dong: { id: string }[] }).dong.map((d) => d.id)
							: [];
					expect(
						ids.filter((id) => dongAn.includes(id)),
						"an lo ra nguoi dung",
					).toEqual([]);
				}
			}
		},
		CHO_DB,
	);

	test(
		"quản trị okr.troLyAn thấy lượt và dòng của nó; thành viên và vai okr → 403",
		async () => {
			for (const tra of [
				await goi(app, "okr.troLyAn", "query", {}, cookie["quan-tri"]),
				await goiRest(
					app,
					"GET",
					"/okr/assistant/runs",
					{},
					cookie["quan-tri"],
				),
			]) {
				const an = ok<{
					luot: {
						taskId: string;
						nac: string;
						dong: { id: string; trangThai: string; maLoai: string | null }[];
					}[];
				}>(tra, "tro ly an");
				const luot = an.luot.find((l) => l.taskId === viecAnDau);
				expect(luot?.nac).toBe("an");
				expect(luot?.dong.map((d) => [d.id, d.trangThai, d.maLoai])).toEqual([
					[dongAn[0] ?? "", "cho", null],
					[dongAn[1] ?? "", "bi-loai", "so-moi"],
				]);
				expect(an.luot.every((l) => l.nac === "an")).toBe(true);
			}
			for (const ai of ["thanh-vien", "vai-okr", "truong-phong-ban"] as const) {
				expect(
					(await goi(app, "okr.troLyAn", "query", {}, cookie[ai])).status,
				).toBe(403);
				expect(
					(await goiRest(app, "GET", "/okr/assistant/runs", {}, cookie[ai]))
						.status,
				).toBe(403);
			}
		},
		CHO_DB,
	);

	test(
		"an-sang-bat: đơn vị đổi sang bật khi còn lượt ẩn cùng đầu vào → lượt bật mới, không thấy dòng ẩn",
		async () => {
			await ghiCauHinh(app, cookie["quan-tri"], NAC_CAU_HINH.bat);
			const cacLuotAn = (await luotAn(MT)).map((l) => l.id);
			const bam = ok<{ bat: boolean; taskId: string; dungLai: boolean }>(
				await goi(
					app,
					"okr.troLyDeXuat",
					"mutation",
					{ objectiveId: MT },
					cookie["truong-phong-ban"],
				),
				"bam o nac bat",
			);
			expect(bam.bat).toBe(true);
			expect(bam.dungLai).toBe(false);
			expect(cacLuotAn).not.toContain(bam.taskId);
			const hang = await db.agentTask.findUniqueOrThrow({
				where: { id: bam.taskId },
				select: { payload: true },
			});
			expect(hang.payload).toMatchObject({ nac: "bat" });
			for (const ai of [
				"truong-phong-ban",
				"truong-bo-phan",
				"phu-trach-kr",
			] as const) {
				const ds = ok<{ dong: { id: string }[]; lyDo: string | null }>(
					await goi(
						app,
						"okr.troLyDanhSach",
						"query",
						{ objectiveId: MT },
						cookie[ai],
					),
					`danh sach ${ai}`,
				);
				expect(ds.lyDo).toBeNull();
				expect(
					ds.dong.map((d) => d.id).filter((id) => dongAn.includes(id)),
					"an lo ra nguoi dung",
				).toEqual([]);
			}
		},
		CHO_DB,
	);

	test(
		"chi phí phiên con của lượt ẩn tính vào trần tháng của troLySanSang",
		async () => {
			const ct = ok<{ aiTranThangUsd: number }>(
				await goi(app, "okr.program", "query", undefined, cookie["quan-tri"]),
				"program",
			);
			const truoc = ok<{ bat: boolean }>(
				await goi(
					app,
					"okr.troLySanSang",
					"query",
					{ objectiveId: MT },
					cookie["truong-phong-ban"],
				),
				"san sang truoc",
			);
			expect(truoc.bat).toBe(true);
			await gieoChiPhi({
				id: "phien-con-an",
				taskId: viecAnDau,
				usd: String(ct.aiTranThangUsd),
			});
			tienDongHo();
			const sau = await goi(
				app,
				"okr.troLySanSang",
				"query",
				{ objectiveId: MT },
				cookie["truong-phong-ban"],
			);
			expect(ok<{ bat: boolean; lyDo?: string }>(sau, "san sang sau")).toEqual({
				bat: false,
				lyDo: "het-tran-thang",
			});
		},
		CHO_DB,
	);
});
