import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { viecOkrCanNhac } from "@crm/db/okr-nhac";
import type { MauKr, MauNoiDung } from "@crm/validation/okr-mau";
import { parseOkrVet } from "@crm/validation/okr-vet";
import {
	donSanCanhKr,
	gieoTuMau,
	mauMoi,
	type SanTuMau,
} from "./okr-canh-kr-san";
import { CHUONG_TRINH_RONG, dungSan, goi, type Json, ma, ok } from "./okr-san";

dungSan();

const CHO_MS = 120_000;

const krMau = (title: string): MauKr => ({
	title,
	kind: "tang-toi",
	unit: "khách",
	startValue: null,
	targetValue: null,
});

const NOI_DUNG: MauNoiDung = {
	cauMucTieu: "Mở rộng khách miền Bắc",
	loai: "cam-ket",
	krs: [krMau("Khách mới"), krMau("Khách quay lại"), krMau("Khách giới thiệu")],
};

describe("mau-vet", () => {
	let san: SanTuMau;
	let mauId: string;
	beforeAll(async () => {
		san = await gieoTuMau();
		ok(
			await goi("okr.setProgram", { ...CHUONG_TRINH_RONG } as {
				[k: string]: Json;
			}),
			"dat chuong trinh",
		);
		mauId = await mauMoi({
			ten: "mau r1d",
			cap: "phong-ban",
			donViIds: [san.p1],
			noiDung: NOI_DUNG as Json,
		});
	}, CHO_MS);
	afterAll(async () => {
		await donSanCanhKr();
	}, CHO_MS);

	test(
		"mau-vet: moi KR tao tu mau co mot dong vet tao-kr cung hinh KR tay; nguoi duoc giao (khac nguoi tao) nhan okr-duoc-giao",
		async () => {
			const batDau = new Date();
			const giao = [san.A.id, san.T1.id, san.O.id];
			const tra = ok<{ id: string }>(
				await goi(
					"okr.taoTuMau",
					{
						mauId,
						cycleId: san.ky,
						unit: { level: "phong-ban", departmentId: san.p1 },
						ownerUserId: san.T1.id,
						krs: giao.map((ownerUserId) => ({
							ownerUserId,
							startValue: 0,
							targetValue: 40,
						})),
					},
					san.T1.cookie,
				),
				"tao tu mau",
			);
			const tay = ok<{ id: string }>(
				await goi(
					"okr.createKeyResult",
					{
						objectiveId: tra.id,
						title: ma("kr tay"),
						kind: "tang-toi",
						ownerUserId: san.A.id,
						startValue: 0,
						targetValue: 40,
						currentValue: 0,
						unit: "khách",
						dueOn: null,
						weight: 1,
					},
					san.T1.cookie,
				),
				"tao kr tay",
			);
			const krs = await db.okrKeyResult.findMany({
				where: { objectiveId: tra.id, id: { not: tay.id } },
				orderBy: { position: "asc" },
				select: { id: true, ownerUserId: true },
			});
			const vetCua = async (keyResultId: string) =>
				db.okrTrail.findMany({
					where: { keyResultId, action: "tao-kr" },
					select: {
						objectiveId: true,
						keyResultId: true,
						actorUserId: true,
						after: true,
					},
				});
			const [vetTay] = await vetCua(tay.id);
			if (!vetTay) throw new Error("kr tay khong co vet tao-kr");
			const khoaTay = Object.keys(parseOkrVet(vetTay.after) ?? {}).sort();
			expect(krs.length, "so kr tu mau").toBe(3);
			for (const [i, k] of krs.entries()) {
				const vet = await vetCua(k.id);
				expect(vet.length, `thieu vet tao-kr: KR${i + 1}`).toBe(1);
				const [v] = vet;
				expect(
					{
						objectiveId: v?.objectiveId,
						actorUserId: v?.actorUserId,
						khoa: Object.keys(parseOkrVet(v?.after) ?? {}).sort(),
					},
					`vet tao-kr khac hinh KR tay: KR${i + 1}`,
				).toEqual({
					objectiveId: tra.id,
					actorUserId: san.T1.id,
					khoa: khoaTay,
				});
			}
			const now = new Date(Math.max(Date.now(), batDau.getTime()) + 1000);
			const nhacCua = async (userId: string) =>
				(
					(await viecOkrCanNhac(db, { now, userId, cuaSo: "truc-tiep" })).get(
						userId,
					) ?? []
				).flatMap((v) =>
					v.loai === "okr-duoc-giao" && "keyResultId" in v && v.keyResultId
						? [v.keyResultId]
						: [],
				);
			const [kr1, kr2, kr3] = krs;
			expect(await nhacCua(san.A.id), "A khong duoc nhac KR1").toContain(
				kr1?.id ?? "",
			);
			expect(await nhacCua(san.O.id), "O khong duoc nhac KR3").toContain(
				kr3?.id ?? "",
			);
			expect(await nhacCua(san.T1.id), "nguoi tao tu nhac KR2").not.toContain(
				kr2?.id ?? "",
			);
			console.log(`so kr: ${krs.length}`);
		},
		CHO_MS,
	);
});
