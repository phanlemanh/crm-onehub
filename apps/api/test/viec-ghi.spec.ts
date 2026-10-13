import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { ngayVN } from "@crm/db/onboarding-nhac";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { viecCuaBanGhiOutput } from "../src/viec/viec.contracts";
import { donDep, moXuong } from "./support/ke-hoach-gieo";
import {
	batApp,
	demVet,
	donViec,
	goi,
	keHoachCua,
	nguoi,
	thoaThuan,
} from "./support/viec-gieo";

const NGAY_MS = 24 * 60 * 60 * 1000;
const MA_TEST_MS = 120_000;

let app: NestExpressApplication;

beforeAll(async () => {
	await moXuong();
	app = await batApp();
});

afterAll(async () => {
	await app.close();
	await donViec();
	await donDep();
});

function ngayMaiVN(): string {
	return ngayVN(new Date(Date.now() + NGAY_MS));
}

async function khoi(
	userId: string,
	banGhi: Record<string, string>,
): Promise<string[]> {
	const r = await goi(app, "viec.cuaBanGhi", "query", banGhi, userId);
	const ra = viecCuaBanGhiOutput.parse(r.data);
	return ra.mo.map((v) => v.id);
}

describe("vc-tao", () => {
	test(
		"vc-tao: A giao cho B, hạn mai, W theo dõi, gắn D — một hàng, một vết tạo web, khối D và C có việc",
		async () => {
			const a = await nguoi("vc-a", "member");
			const b = await nguoi("vc-b", "member");
			const w = await nguoi("vc-w", "member");
			const { congTyId, dealId } = await thoaThuan(app, a.id);
			const khac = await thoaThuan(app, a.id, "VC Cty khac");
			const tieuDe = `vc-tao ${Date.now()}`;
			const r = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe,
					dealId,
					nguoiThucHienId: b.id,
					hanNgay: ngayMaiVN(),
					nguoiTheoDoiIds: [w.id],
				},
				a.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const hang = await db.viec.findMany({ where: { tieuDe } });
			if (hang.length !== 1) {
				throw new Error(`vc: tao viec khong ra dung mot hang ${hang.length}`);
			}
			const v = hang[0];
			if (!v) throw new Error("vc: tao viec khong ra dung mot hang 0");
			if (v.trangThai !== "CHUA_LAM") {
				throw new Error("vc: tao viec sai truong trangThai");
			}
			if (v.nguoiGiaoId !== a.id) {
				throw new Error("vc: tao viec sai truong nguoiGiaoId");
			}
			if (v.nguoiThucHienId !== b.id) {
				throw new Error("vc: tao viec sai truong nguoiThucHienId");
			}
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: v.id } });
			if (!theo.some((t) => t.userId === w.id)) {
				throw new Error("vc: thieu nguoi theo doi");
			}
			const gan = await db.viecGan.findMany({ where: { viecId: v.id } });
			if (gan.length !== 1 || gan[0]?.dealId !== dealId) {
				throw new Error("vc: gan sai");
			}
			const vet = await db.viecVet.findMany({ where: { viecId: v.id } });
			if (
				vet.length !== 1 ||
				vet[0]?.loai !== "tao" ||
				vet[0]?.nguoiId !== a.id ||
				vet[0]?.nguon !== "web"
			) {
				throw new Error("vc: vet tao sai");
			}
			for (const [ten, banGhi] of [
				["deal", { dealId }],
				["company", { companyId: congTyId }],
			] as const) {
				if (!(await khoi(a.id, banGhi)).includes(v.id)) {
					throw new Error(`vc: khoi viec ${ten} thieu viec`);
				}
			}
			if ((await khoi(a.id, { dealId: khac.dealId })).includes(v.id)) {
				throw new Error("vc: viec lot sang ban ghi khac");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-tao: không chọn người thực hiện thì người thực hiện là người giao",
		async () => {
			const a = await nguoi("vc-a2", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tieuDe = `vc-tao-mac-dinh ${Date.now()}`;
			await goi(app, "viec.create", "mutation", { tieuDe, dealId }, a.id);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			if (v.nguoiThucHienId !== a.id) {
				throw new Error("vc: nguoi thuc hien mac dinh sai");
			}
		},
		MA_TEST_MS,
	);

	test(
		"vc-tao: theo doi trung — nguoiTheoDoiIds lặp và chứa người thực hiện chỉ ra mỗi người một hàng",
		async () => {
			const a = await nguoi("vc-a3", "member");
			const b = await nguoi("vc-b3", "member");
			const { dealId } = await thoaThuan(app, a.id);
			const tieuDe = `vc-tao-trung ${Date.now()}`;
			const r = await goi(
				app,
				"viec.create",
				"mutation",
				{
					tieuDe,
					dealId,
					nguoiThucHienId: b.id,
					nguoiTheoDoiIds: [b.id, a.id, a.id],
				},
				a.id,
			);
			expect(r.status, JSON.stringify(r)).toBe(200);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			const theo = await db.viecTheoDoi.findMany({ where: { viecId: v.id } });
			expect(theo.map((t) => t.userId).sort()).toEqual([a.id, b.id].sort());
		},
		MA_TEST_MS,
	);
});

describe("vc-gan", () => {
	test(
		"vc-gan: gắn thêm kế hoạch cùng công ty — vẫn một việc, công ty hiện một lần; gỡ D thì công ty vẫn còn qua kế hoạch",
		async () => {
			const a = await nguoi("vc-gan-a", "member");
			const b = await nguoi("vc-gan-b", "member");
			const { congTyId, dealId } = await thoaThuan(app, a.id);
			const plan = await keHoachCua(congTyId, a.id);
			const tieuDe = `vc-gan ${Date.now()}`;
			await goi(
				app,
				"viec.create",
				"mutation",
				{ tieuDe, dealId, nguoiThucHienId: b.id },
				a.id,
			);
			const v = await db.viec.findFirstOrThrow({ where: { tieuDe } });
			const g = await goi(
				app,
				"viec.gan",
				"mutation",
				{ id: v.id, planId: plan.id },
				a.id,
			);
			expect(g.status, JSON.stringify(g)).toBe(200);
			const so = await db.viec.count({ where: { tieuDe } });
			if (so !== 1) throw new Error(`vc: gan them nhan ban viec ${so}`);
			if (!(await khoi(a.id, { planId: plan.id })).includes(v.id)) {
				throw new Error("vc: ke hoach khong thay viec");
			}
			const lan = (await khoi(a.id, { companyId: congTyId })).filter(
				(id) => id === v.id,
			).length;
			if (lan !== 1) throw new Error(`vc: cong ty hien viec ${lan} lan`);
			if ((await demVet(v.id, "gan")) !== 1) {
				throw new Error("vc: thieu vet gan");
			}
			await goi(app, "viec.go", "mutation", { id: v.id, dealId }, a.id);
			if ((await khoi(a.id, { dealId })).includes(v.id)) {
				throw new Error("vc: go xong van hien");
			}
			if (!(await khoi(a.id, { companyId: congTyId })).includes(v.id)) {
				throw new Error("vc: cong ty mat viec khi con gan ke hoach");
			}
			if ((await demVet(v.id, "go")) !== 1) {
				throw new Error("vc: thieu vet go");
			}
		},
		MA_TEST_MS,
	);
});
