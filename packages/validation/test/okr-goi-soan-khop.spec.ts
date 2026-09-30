import { describe, expect, test } from "bun:test";
import { CAP_CUOC } from "@crm/db/okr-cuoc-soan";
import {
	capDichCua,
	chuKyDichCua,
	type KyTruoc,
	vaiDocDuocSoDoiTac,
} from "@crm/db/okr-goi-soan";
import { capDichCanChinh, chuKyDichCanChinh } from "../src/okr-can-chinh";
import { tomGonKy } from "../src/okr-tom-gon-ky";
import {
	docDuocPhamVi,
	toWorkspaceRole,
	WORKSPACE_ROLES,
} from "../src/vai-workspace";

describe("okr-goi-soan khớp luật của validation", () => {
	test("cấp đích Căn chỉnh của db khớp capDichCanChinh cho mọi cấp của cuộc", () => {
		for (const cap of CAP_CUOC)
			expect(capDichCua(cap), `cap dich lech o ${cap}`).toEqual(
				capDichCanChinh(cap),
			);
	});

	test("chu kỳ đích Căn chỉnh của db khớp chuKyDichCanChinh, có và không có năm cha", () => {
		for (const cha of [null, "nam-2031"])
			expect(chuKyDichCua("q2", cha)).toEqual(
				chuKyDichCanChinh({
					level: "phong-ban",
					cycleId: "q2",
					cycleParentId: cha,
				}),
			);
	});

	test("vai đọc được số đối tác của db khớp docDuocPhamVi(doi-tac) cho mọi vai, kể cả vai lạ", () => {
		for (const vai of [...WORKSPACE_ROLES, "la"])
			expect(vaiDocDuocSoDoiTac(vai), `vai ${vai}`).toBe(
				docDuocPhamVi(toWorkspaceRole(vai), "doi-tac"),
			);
	});

	test("KyTruoc của db đi thẳng vào tomGonKy", () => {
		const ky: KyTruoc = {
			chuKy: { ten: "Quý 1" },
			mucTieu: [
				{
					ten: "Mục tiêu",
					diem: 0.8,
					dieuHocDuoc: "Gọi sớm",
					kr: [
						{
							ten: "KR",
							kieu: "tang-toi",
							donVi: "%",
							khoiDiem: 10,
							dich: 50,
							soChot: 42,
							diem: 0.7,
							lyDo: "Đạt",
							capNhat: [
								{
									tuan: "2031-01-06",
									giaTri: 20,
									tuTin: "cao",
									ghiChu: "Khởi động",
								},
							],
						},
					],
				},
			],
			mangSang: [],
		};
		expect(tomGonKy({ mucTieu: ky.mucTieu })).toContain("KR");
	});
});
