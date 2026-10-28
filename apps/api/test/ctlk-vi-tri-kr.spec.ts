import { describe, expect, test } from "bun:test";
import type {
	CapNhatTuanOutput,
	ViTriKrOutput,
} from "../src/okr/okr.contracts";
import { sangPha } from "./okr-khep-san";
import {
	type AiHoacCookie,
	bpMoi,
	CHUONG_TRINH_RONG,
	dangChay,
	datViTri,
	dungSan,
	goi,
	goiQuery,
	type Json,
	kyDangChay,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phien,
	phienCua,
	taoNam,
	taoQuy,
	truongMoi,
} from "./okr-san";

dungSan();

const CHO_MS = 60_000;

function kiem(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

async function mucTieu(
	cycleId: string,
	unit: Json,
	ownerUserId: string,
	ai: AiHoacCookie = "quan",
): Promise<string> {
	return ok<{ id: string }>(
		await goi(
			"okr.createObjective",
			{
				cycleId,
				unit,
				title: ma("ctlk mt"),
				kind: "cam-ket",
				ownerUserId,
				participantIds: [],
				whyNow: "",
			},
			ai,
		),
		"tao muc tieu",
	).id;
}

async function taoKr(
	objectiveId: string,
	ownerUserId: string,
	ai: AiHoacCookie = "quan",
): Promise<string> {
	return ok<{ id: string }>(
		await goi(
			"okr.createKeyResult",
			{
				objectiveId,
				title: ma("ctlk kr"),
				kind: "tang-toi",
				ownerUserId,
				startValue: 0,
				targetValue: 10,
				currentValue: 0,
				unit: "khách",
				dueOn: null,
				weight: 1,
			},
			ai,
		),
		"tao kr",
	).id;
}

const congBo = async (id: string, ai: AiHoacCookie = "quan") =>
	ok(await goi("okr.publishObjective", { id }, ai), "cong bo");

type ChuDon = { nguoi: string; cookie: AiHoacCookie };

async function mucTieuCoKr(
	cycleId: string,
	unit: Json,
	chu: ChuDon,
	krOwner: string,
): Promise<string> {
	const mt = await mucTieu(cycleId, unit, chu.nguoi, chu.cookie);
	const kr = await taoKr(mt, krOwner, chu.cookie);
	await congBo(mt, chu.cookie);
	return kr;
}

const viTri = async (keyResultId: string, ai: AiHoacCookie) =>
	ok<ViTriKrOutput>(
		await goiQuery("okr.viTriKr", ai, { keyResultId }),
		"vi tri kr",
	);

describe("ctlk-vi-tri-kr", () => {
	test(
		"ctlk-vi-tri-kr: bon don vi trong K, KR cua K0, KR luu tru, khong xem duoc, khong co; capNhatTuan mang dung vi tri",
		async () => {
			ok(await goi("okr.setProgram", { ...CHUONG_TRINH_RONG }), "cau hinh");
			const k = await kyDangChay("ctlk-k");
			const bp = await bpMoi("ctlk-bp");
			const pb = await pbMoi("ctlk-pb", bp);
			const a = await nguoiMoi("ctlk-a");
			ok(await datViTri(a, pb), "xep a");
			const b = await nguoiMoi("ctlk-b");
			const cookieA = await phienCua(a);
			const quan: ChuDon = { nguoi: phien.quan.nguoi, cookie: "quan" };
			const truongBp = await truongMoi("division", bp, "ctlk-tbp");
			const truongPb = await truongMoi("department", pb, "ctlk-tpb");
			const chuA: ChuDon = { nguoi: a, cookie: cookieA };

			const krGoc = await mucTieuCoKr(k, { level: "onehub" }, quan, a);
			const krKhoi = await mucTieuCoKr(
				k,
				{ level: "bo-phan", divisionId: bp },
				truongBp,
				a,
			);
			const krPb = await mucTieuCoKr(
				k,
				{ level: "phong-ban", departmentId: pb },
				truongPb,
				a,
			);
			const krNguoi = await mucTieuCoKr(
				k,
				{ level: "ca-nhan", personUserId: a },
				chuA,
				a,
			);

			const nam0 = await taoNam("ctlk-k0-nam", 2026);
			const k0 = await taoQuy("ctlk-k0", nam0, "2026-04-01", "2026-06-30");
			await dangChay(k0);
			const krK0 = await mucTieuCoKr(k0, { level: "onehub" }, quan, a);
			ok(await sangPha(k0, "cham-diem"), "k0 cham diem");

			const namAn = await taoNam("ctlk-an-nam", 2026);
			const kAn = await taoQuy("ctlk-an", namAn, "2026-01-01", "2026-03-31");
			await dangChay(kAn);
			const krLuuTru = await mucTieuCoKr(kAn, { level: "onehub" }, quan, a);
			ok(
				await goi("okr.anChuKy", {
					id: kAn,
					lyDo: "Chu kỳ thử của ctlk, ẩn để đo KR lưu trữ.",
				}),
				"an chu ky",
			);

			const cookieB = await phienCua(b);
			const mtKin = await mucTieu(
				k,
				{ level: "ca-nhan", personUserId: b },
				b,
				cookieB,
			);
			ok(
				await goi(
					"okr.datHienThi",
					{
						objectiveId: mtKin,
						hienThi: "gioi-han",
						nguoiXem: [],
					},
					cookieB,
				),
				"dat gioi han",
			);
			const krKin = await taoKr(mtKin, b, cookieB);
			await congBo(mtKin, cookieB);

			const mong = [
				[krGoc, "goc"],
				[krKhoi, `bp:${bp}`],
				[krPb, `pb:${pb}`],
				[krNguoi, `nguoi:${a}`],
			] as const;
			for (const [kr, donOkr] of mong) {
				const v = await viTri(kr, cookieA);
				kiem(v !== null, `ctlk-vi-tri-kr: KR ${donOkr} tra null`);
				expect(v).toEqual({ donOkr, cycleId: k });
			}
			expect((await viTri(krPb, cookieA))?.donOkr).toBe(`pb:${pb}`);

			const v0 = await viTri(krK0, cookieA);
			kiem(
				v0?.cycleId === k0,
				"ctlk-vi-tri-kr: kyOkr la chu ky dang chay, mong chu ky cua muc tieu",
			);

			kiem(
				(await viTri(krKin, cookieA)) === null,
				"ctlk-vi-tri-kr: KR khong duoc xem tra vi tri, mong null",
			);
			kiem(
				(await viTri(krLuuTru, cookieA)) === null,
				"ctlk-vi-tri-kr: KR luu tru tra vi tri, mong null",
			);
			kiem(
				(await viTri(ma("khong-co"), cookieA)) === null,
				"ctlk-vi-tri-kr: KR khong co tra vi tri, mong null",
			);
			const kin = await goiQuery("okr.viTriKr", cookieA, {
				keyResultId: krKin,
			});
			expect(JSON.stringify(kin.data)).not.toContain("ctlk mt");

			const tuan = ok<CapNhatTuanOutput>(
				await goiQuery("okr.capNhatTuan", cookieA),
				"cap nhat tuan",
			);
			const theoKr = new Map(tuan.items.map((i) => [i.keyResultId, i]));
			for (const [kr] of mong) {
				const muc = theoKr.get(kr);
				kiem(muc !== undefined, `ctlk-vi-tri-kr: capNhatTuan thieu ${kr}`);
				expect({ donOkr: muc?.donOkr, cycleId: muc?.cycleId }).toEqual(
					await viTri(kr, cookieA),
				);
			}
		},
		CHO_MS,
	);
});
