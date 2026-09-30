import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import {
	BRIDGE_AUDIENCE_OKR,
	BRIDGE_ISSUER_OKR,
	repTuCuaOkr,
} from "../agent/lib/kenh-cua";
import {
	donDep,
	gieoChuKy,
	gieoCuoc,
	gieoDonVi,
	gieoNguoi,
	moXuong,
} from "./support/gieo";
import { BI_MAT_THU, mintOkr, yeuCau, yeuSach } from "./support/the-cua";

const auth = repTuCuaOkr(BI_MAT_THU);
const nguoi: Record<string, string> = {};
let cuocId = "";
let cuocCuaNguoiKhac = "";

beforeAll(async () => {
	await moXuong();
	for (const vai of ["owner", "admin", "member", "okr"] as const)
		nguoi[vai] = (await gieoNguoi(`Người ${vai}`, vai)).id;
	nguoi.ngoai = (await gieoNguoi("Người ngoài", null)).id;
	nguoi.khach = (await gieoNguoi("Người vai lạ", "khach")).id;
	const ky = await gieoChuKy("lap-ke-hoach");
	const dv = await gieoDonVi();
	cuocId = (
		await gieoCuoc({
			cycleId: ky,
			departmentId: dv.departmentId,
			nguoiMoUserId: nguoi.okr ?? "",
		})
	).id;
	cuocCuaNguoiKhac = (
		await gieoCuoc({
			cycleId: ky,
			departmentId: dv.departmentId,
			nguoiMoUserId: nguoi.member ?? "",
		})
	).id;
});

afterAll(donDep);

describe("kenh-okr", () => {
	test("hằng của kênh đúng hợp đồng", () => {
		expect(BRIDGE_ISSUER_OKR).toBe("crm-app");
		expect(BRIDGE_AUDIENCE_OKR).toBe("crm-okr-agent");
	});

	test.each(["owner", "admin", "member", "okr"] as const)(
		"vai %s vào được khi purpose okr-soan và cuộc là của mình",
		async (vai) => {
			const id = nguoi[vai] ?? "";
			const cuoc =
				vai === "okr"
					? cuocId
					: (
							await gieoCuoc({
								cycleId: (
									await db.okrCuocSoan.findUniqueOrThrow({
										where: { id: cuocId },
									})
								).cycleId,
								nguoiMoUserId: id,
							})
						).id;
			const kq = await auth(
				yeuCau(await mintOkr(yeuSach({ sub: id, cuocSoanId: cuoc }))),
			);
			expect(kq).toMatchObject({
				authenticator: "crm-okr-cua",
				principalId: id,
				principalType: "user",
				attributes: { purpose: "okr-soan", cuocSoanId: cuoc, vai },
			});
			expect(JSON.stringify(kq)).not.toMatch(/dealId|contactId|companyId/);
		},
	);

	test("bỏ qua: không token, sai bí mật, sai audience, purpose khác, người không phải thành viên", async () => {
		expect(await auth(yeuCau(null))).toBeNull();
		expect(
			await auth(
				yeuCau(
					await mintOkr(
						yeuSach({ sub: nguoi.okr, cuocSoanId: cuocId }),
						"bi-mat-khac-hoan-toan-cung-du-dai-000",
					),
				),
			),
		).toBeNull();
		expect(
			await auth(
				yeuCau(
					await mintOkr(
						yeuSach({
							sub: nguoi.okr,
							cuocSoanId: cuocId,
							aud: "crm-agent",
						}),
					),
				),
			),
		).toBeNull();
		expect(
			await auth(
				yeuCau(
					await mintOkr(
						yeuSach({
							sub: nguoi.okr,
							cuocSoanId: cuocId,
							purpose: "okr",
						}),
					),
				),
			),
		).toBeNull();
		expect(
			await auth(
				yeuCau(
					await mintOkr(yeuSach({ sub: nguoi.ngoai, cuocSoanId: cuocId })),
				),
			),
		).toBeNull();
	});

	test("vai lạ trong bảng thành viên không được nâng thành member: bỏ qua", async () => {
		expect(
			await auth(
				yeuCau(
					await mintOkr(yeuSach({ sub: nguoi.khach, cuocSoanId: cuocId })),
				),
			),
		).toBeNull();
	});

	test("thẻ thiếu exp hoặc đã hết hạn bị bỏ qua", async () => {
		expect(
			await auth(
				yeuCau(
					await mintOkr(
						yeuSach({ sub: nguoi.okr, cuocSoanId: cuocId, exp: undefined }),
					),
				),
			),
		).toBeNull();
		const qua = Math.floor(Date.now() / 1000) - 3600;
		expect(
			await auth(
				yeuCau(
					await mintOkr(
						yeuSach({
							sub: nguoi.okr,
							cuocSoanId: cuocId,
							iat: qua - 120,
							nbf: qua - 120,
							exp: qua,
						}),
					),
				),
			),
		).toBeNull();
	});

	test("cuộc của người khác hay không còn dang → 403 (ForbiddenError), không phải bỏ qua", async () => {
		await expect(
			auth(
				yeuCau(
					await mintOkr(
						yeuSach({ sub: nguoi.okr, cuocSoanId: cuocCuaNguoiKhac }),
					),
				),
			),
		).rejects.toMatchObject({ response: { status: 403 } });
		await db.okrCuocSoan.update({
			where: { id: cuocId },
			data: { trangThai: "bo" },
		});
		try {
			await expect(
				auth(
					yeuCau(
						await mintOkr(yeuSach({ sub: nguoi.okr, cuocSoanId: cuocId })),
					),
				),
			).rejects.toMatchObject({ response: { status: 403 } });
		} finally {
			await db.okrCuocSoan.update({
				where: { id: cuocId },
				data: { trangThai: "dang" },
			});
		}
	});

	test("tệp kênh không có localDev, không có vercelOidc; thiếu bí mật thì đóng (auth: [])", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "..", "agent", "channels", "eve.ts"),
			"utf8",
		);
		expect(nguon).not.toContain("localDev");
		expect(nguon).not.toContain("vercelOidc");
		expect(nguon).toContain("auth: secret ? [repTuCuaOkr(secret)] : []");
	});

	describe("kênh thật đọc bí mật từ môi trường", () => {
		const bienBiMat = TRO_LY_OKR_SOAN.env.biMat;
		const cu = process.env[bienBiMat];

		afterAll(() => {
			if (cu === undefined) delete process.env[bienBiMat];
			else process.env[bienBiMat] = cu;
		});

		async function goiInfo(
			biMat: string | undefined,
			kyBang = BI_MAT_THU,
		): Promise<number> {
			if (biMat === undefined) delete process.env[bienBiMat];
			else process.env[bienBiMat] = biMat;
			const kenh = (await import(
				`../agent/channels/eve.ts?biMat=${biMat ?? "chua-dat"}`
			)) as typeof import("../agent/channels/eve");
			const tuyen = kenh.default.routes.find((r) => r.path === "/eve/v1/info");
			if (tuyen?.transport !== "http") throw new Error("thiếu tuyến /info");
			const res = await tuyen.handler(
				yeuCau(
					await mintOkr(
						yeuSach({ sub: nguoi.okr, cuocSoanId: cuocId }),
						kyBang,
					),
					"/eve/v1/info",
				),
				{} as never,
			);
			return res.status;
		}

		test("có bí mật khớp: thẻ hợp lệ qua cửa xác thực; chưa đặt hay rỗng: 401 dù thẻ hợp lệ", async () => {
			expect(await goiInfo(BI_MAT_THU)).not.toBe(401);
			expect(await goiInfo(undefined)).toBe(401);
			expect(await goiInfo("")).toBe(401);
			expect(await goiInfo("   ", "   ")).toBe(401);
		});
	});
});
