import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { OKR } from "../src/okr/okr-config";
import { gieoKyQuy } from "./okr-khep-san";
import {
	bpMoi,
	CHUONG_TRINH_RONG,
	datViTri,
	doc,
	dungSan,
	goi,
	type Json,
	ma,
	nguoiMoi,
	ok,
	pbMoi,
	phienCua,
	truongMoi,
} from "./okr-san";

dungSan();

const CHO_MS = 120_000;

type San = {
	ky: string;
	bp: string;
	pb: string;
	p: string;
	thanhVien: { id: string; cookie: string };
};

describe("quyen-tao", () => {
	let san: San;
	beforeAll(async () => {
		ok(
			await goi("okr.setProgram", {
				...CHUONG_TRINH_RONG,
				personalOn: true,
			} as { [k: string]: Json }),
			"bat ca nhan",
		);
		const bp = await bpMoi("r1d-bp");
		const pb = await pbMoi("r1d-pb", bp);
		await truongMoi("division", bp, "r1d-truong-bp");
		await truongMoi("department", pb, "r1d-truong-pb");
		const p = await nguoiMoi("r1d-p");
		ok(await datViTri(p, pb), "xep p");
		const tv = await nguoiMoi("r1d-thanh-vien");
		ok(await datViTri(tv, pb), "xep thanh vien");
		const ky = await gieoKyQuy({
			tu: "2027-04-01",
			den: "2027-06-30",
			pha: "lap-ke-hoach",
		});
		san = {
			ky,
			bp,
			pb,
			p,
			thanhVien: { id: tv, cookie: await phienCua(tv) },
		};
	}, CHO_MS);

	const CAP = [
		{ ten: "bo-phan", unit: () => ({ level: "bo-phan", divisionId: san.bp }) },
		{
			ten: "phong-ban",
			unit: () => ({ level: "phong-ban", departmentId: san.pb }),
		},
		{
			ten: "ca-nhan",
			unit: () => ({ level: "ca-nhan", personUserId: san.p }),
		},
	] as const;

	const taoMucTieu = (unit: Json, ai: string) =>
		goi(
			"okr.createObjective",
			{
				cycleId: san.ky,
				unit,
				title: ma("muc tieu le r1d"),
				kind: "cam-ket",
				ownerUserId: san.p,
				participantIds: [],
				whyNow: "",
				hienThi: "cong-khai",
			},
			ai,
		);

	test(
		"quyen-tao: quan tri khong la truong tao duoc muc tieu va KR o ba cap; thanh vien 403; luat sua khong mo",
		async () => {
			let o = 0;
			let mtPhongBan = "";
			for (const cap of CAP) {
				const tra = await taoMucTieu(cap.unit(), "quan");
				expect(
					`${tra.status} ${tra.loi}`,
					`quan tri khong tao duoc: ${cap.ten}`,
				).toBe("200 ");
				const id = (tra.data as { id: string }).id;
				const hang = await db.okrObjective.findUniqueOrThrow({
					where: { id },
					select: { level: true },
				});
				expect(hang.level, `sai don vi: ${cap.ten}`).toBe(cap.ten);
				if (cap.ten === "phong-ban") mtPhongBan = id;
				o += 1;
				const cam = await taoMucTieu(cap.unit(), san.thanhVien.cookie);
				expect(
					`${cam.status} ${cam.loi}`,
					`thanh vien tao duoc: ${cap.ten}`,
				).toBe(`403 ${OKR.thongDiep.khongSuaDuocDonVi}`);
				o += 1;
			}
			const kr = await goi("okr.createKeyResult", {
				objectiveId: mtPhongBan,
				title: ma("kr le r1d"),
				kind: "tang-toi",
				ownerUserId: san.p,
				startValue: 0,
				targetValue: 10,
				currentValue: 0,
				unit: "",
				dueOn: null,
				weight: 1,
			});
			expect(
				`${kr.status} ${kr.loi}`,
				"quan tri khong them duoc KR: phong-ban",
			).toBe("200 ");
			o += 1;
			const sua = await goi("okr.updateObjective", {
				id: mtPhongBan,
				title: ma("sua muc tieu r1d"),
			});
			expect(sua.status, "luat sua bi mo cho quan tri").toBe(403);
			const xemQuan = await doc<{ canCreate: boolean; canEdit: boolean }>(
				"okr.byUnit",
				"quan",
				{ cycleId: san.ky, unit: { loai: "pb", id: san.pb } },
			);
			const xemTv = await doc<{ canCreate: boolean; canEdit: boolean }>(
				"okr.byUnit",
				san.thanhVien.cookie,
				{ cycleId: san.ky, unit: { loai: "pb", id: san.pb } },
			);
			expect({ quan: xemQuan, tv: xemTv.canCreate }, "canCreate sai").toEqual({
				quan: { ...xemQuan, canCreate: true, canEdit: false },
				tv: false,
			});
			console.log(`so o: ${o}`);
		},
		CHO_MS,
	);
});
