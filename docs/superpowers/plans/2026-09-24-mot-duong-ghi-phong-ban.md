# Một đường ghi phòng ban — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mọi thao tác ghi phòng ban đi qua `org.*` với một bộ luật; sáu thủ tục ghi `onboarding.*Department` bị gỡ; điều kiện «xoá hẳn được» là một hàm; tám hồ sơ đã ký được sửa bài kiểm và ghim lại bằng một lượt làn máy.

**Architecture:** Thêm `org.archiveDepartment` / `restoreDepartment` / `purgeDepartment` vào `ToChucService` + `ToChucRouter`, cùng một hàm thuần `lyDoKhongXoaPhongBan` trong `apps/api/src/to-chuc/xoa-phong-ban.ts` mà `cay.ts`, `org.purgeDepartment` và `onboarding.listDepartments` cùng gọi. Bài kiểm của tám hồ sơ chuyển sang `org.*` TRƯỚC khi gỡ đường cũ, để mỗi bước giữa chừng vẫn xanh. Màn Tổ chức (bản cây điều hướng + khung chi tiết của vòng `to-chuc-danh-sach-chi-tiet`) đổi bốn chỗ gọi.

**Tech Stack:** NestJS + nestjs-trpc (`bun run trpc:generate` sinh `apps/api/src/generated/server.ts`), trpc-to-openapi (REST dưới `/rest`), Prisma, bun:test + supertest, React DOM test với `setup-dom.ts`.

**Spec:** `docs/superpowers/specs/2026-09-24-mot-duong-ghi-phong-ban-design.md` · hợp đồng `_acceptance/mot-duong-ghi-phong-ban/contract.md` · bộ đo `_acceptance/mot-duong-ghi-phong-ban/evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md), kể cả mã đang sửa.
- Câu cho người sống trong `TO_CHUC.thongDiep` (`apps/api/src/to-chuc/to-chuc-config.ts`), không viết tại chỗ dùng.
- Mọi thủ tục ghi `org.*` gọi `this.toChuc.yeuCauQuanTri(ctx.user.id)` trước (`docs/api.md` «The organization tree»).
- Chỉ đổi đúng bốn chỗ gọi trong `apps/app/app/(app)/[slug]/settings/organization/`; không đổi hình, nhãn, `className`.
- Không chạm `packages/auth`, middleware, `packages/db/prisma` (lượt 2 OKR chạy song song ở đó).
- Bài kiểm của hồ sơ đã ký: chỉ đổi đường gieo, đường gọi, tên gieo (hậu tố riêng), hai câu của AC-3, gỡ giả lập của thủ tục không còn khi không khẳng định nào đọc nó — và MỘT ngoại lệ đã duyệt d-20260924T154916Z-16 (Task 4, `noi-bon-nut.spec.ts`).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture: vật lành → xanh; phá vật thật (sửa tạm mã nguồn rồi `git checkout` trả lại) → đỏ với thông điệp ghim.
- Năm lệnh chứng từ gốc kho: `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`.

## Review Focus

- Lưu trữ một phòng ban đã lưu trữ → 200, vẫn lưu trữ (không lỗi lạ) — Task 1, ca `luu-lai`.
- Mã phòng ban không tồn tại ở ba thủ tục mới → 404 với `TO_CHUC.thongDiep.khongCoPhongBan(id)` — Task 1, ca `khong-co`.
- Phòng ban chưa lưu trữ trong `onboarding.listDepartments({ archived: false })` luôn `purgeable: false` — Task 1, trong E5.
- Khôi phục phòng ban mà bộ phận của nó đã lưu trữ → 200, phòng ban hiện ở «Chưa xếp vào bộ phận» — Task 1, ca `khoi-phuc-bo-phan-da-luu`.
- Phòng ban vừa còn bước kế hoạch vừa nằm trong khuôn → câu «còn bước kế hoạch» (thứ tự kiểm: lưu trữ → bước → người → khuôn) — Task 1, trong E4.

## Bản đồ tệp

| Tệp | Vai | Task |
|---|---|---|
| `apps/api/src/to-chuc/xoa-phong-ban.ts` (mới) | hàm thuần `lyDoKhongXoaPhongBan` | 1 |
| `apps/api/src/to-chuc/to-chuc-config.ts` | thêm câu `phongBanConBuoc`, `phongBanTrongKhuon`, `phongBanConTrongKhuon` | 1 |
| `apps/api/src/to-chuc/to-chuc.service.ts` | ba thủ tục mới, `khuonChua` | 1 |
| `apps/api/src/to-chuc/to-chuc.router.ts` | ba mutation + REST | 1 |
| `apps/api/src/to-chuc/cay.ts` | `purgeable` qua hàm chung | 1 |
| `apps/api/src/onboarding/onboarding.service.ts` | `listDepartments.purgeable` qua hàm chung; gỡ sáu thủ tục ghi | 1, 3 |
| `apps/api/src/onboarding/onboarding.router.ts`, `onboarding.contracts.ts`, `onboarding-config.ts` | gỡ sáu thủ tục, schema và câu chỉ chúng dùng | 3 |
| `apps/api/src/generated/server.ts` | sinh lại | 1, 3 |
| `apps/api/test/mot-duong-ghi-phong-ban.spec.ts` (mới) | E1, E3, E4, E5, E6 | 1, 3 |
| `apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx`, `da-luu-tru-to-chuc.tsx` | đổi bốn chỗ gọi | 5 |
| `apps/app/test/to-chuc.dom.tsx` | E7 + mock theo router | 5 |
| Bài kiểm của tám hồ sơ (bảng Task 4) | đổi sang `org.*` | 4 |
| `_acceptance/<8 slug>/decisions.jsonl` | dòng `revisit` | 2 |
| `_acceptance/mot-duong-ghi-phong-ban/rang/mot-cho-ghi.mjs` (mới) | E2, E8 | 3 |
| `_acceptance/mot-duong-ghi-phong-ban/rang/ho-so-da-ghim.mjs` (mới) | E10 + sinh tệp cho E9 | 6 |
| `docs/api.md` | mục «The organization tree» | 6 |

Thứ tự: 1 → 2 → 4 → 3 → 5 → 6. Không task nào `independent: true` — chúng chung `onboarding.service.ts`, `server.ts` hoặc phụ thuộc thủ tục của task trước; S3 chạy tuần tự trong vòng chính.

---

### Task 1: Ba thủ tục `org.*Department` mới và một luật «xoá được»

`independent: false` · phục vụ E3, E4, E5, E6, E7b · verify: `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/mot-duong-ghi-phong-ban.spec.ts"`

**Files:**
- Create: `apps/api/src/to-chuc/xoa-phong-ban.ts`
- Modify: `apps/api/src/to-chuc/to-chuc-config.ts`, `to-chuc.service.ts`, `to-chuc.router.ts`, `cay.ts`
- Modify: `apps/api/src/onboarding/onboarding.service.ts` (chỉ `CHON_BO_PHAN`, `HangBoPhan`, `boPhanRa`)
- Regenerate: `apps/api/src/generated/server.ts`
- Create: `apps/api/test/mot-duong-ghi-phong-ban.spec.ts`

**Interfaces:**
- Produces: `lyDoKhongXoaPhongBan(pb: PhongBanDeXoa): string | null`; `PhongBanDeXoa = { archived: boolean; stepCount: number; primaryCount: number; khuon: readonly string[] }`; `ToChucService.archiveDepartment / restoreDepartment / purgeDepartment({ id }) → { id }`; tRPC `org.archiveDepartment`, `org.restoreDepartment`, `org.purgeDepartment`; REST `POST /rest/org/departments/{id}/archive`, `POST /rest/org/departments/{id}/restore`, `DELETE /rest/org/departments/{id}`.

- [ ] **Step 1: Dựng khung bài kiểm với ứng dụng thật (`createApp`, để có cả tRPC lẫn REST)**

```ts
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import type { NestExpressApplication } from "@nestjs/platform-express";
import request from "supertest";
import { createApp } from "../src/create-app";
import type { TreeOutput } from "../src/to-chuc/to-chuc.contracts";
import { TO_CHUC } from "../src/to-chuc/to-chuc-config";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const T = TO_CHUC.thongDiep;
const TIEN_TO = `mdg${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}`;
let dem = 0;
const ma = (phan: string) => `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${++dem}`;
type Ai = "quan" | "thuong" | "chu";
type TraLoi = { status: number; data: unknown; loi: string };
const phien: Record<Ai, { nguoi: string; cookie: string }> = {
	quan: { nguoi: "", cookie: "" },
	thuong: { nguoi: "", cookie: "" },
	chu: { nguoi: "", cookie: "" },
};
let app: NestExpressApplication;

async function trpc(thuTuc: string, vao: object, ai: Ai = "quan"): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", phien[ai].cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(vao));
	return { status: res.status, data: res.body?.result?.data, loi: String(res.body?.error?.message ?? "") };
}

async function rest(
	verb: "get" | "post" | "patch" | "delete",
	duong: string,
	vao: object | undefined,
	ai: Ai = "quan",
): Promise<TraLoi> {
	let req = request(app.getHttpServer())[verb](`${REST_BRIDGE_PATH}${duong}`).set("cookie", phien[ai].cookie);
	if (vao !== undefined) req = req.set("content-type", "application/json").send(JSON.stringify(vao));
	const res = await req;
	return { status: res.status, data: res.body, loi: String(res.body?.message ?? "") };
}
```

Kèm `docTrpc<T>(thuTuc, vao?, ai?)` (GET có `?input=`), `ok<T>(tra, nhan)` giống `to-chuc-san.ts`, `pbMoi(ten, divisionId = null)` qua `org.createDepartment`, `bpMoi(ten)` qua `org.createDivision`, `nguoiMoi(ten, vai)` + `datChinh(userId, pbId | null, phu: string[] = [])` qua `org.setPlacement`, `khuonMoi(pbIds)` qua `onboarding.createTemplate`, `keHoachCoBuoc(pbId)` (công ty `ma("cty")` + `onboarding.createFromTemplate`), `cay()` = `docTrpc<TreeOutput>("org.tree")`. `beforeAll`: `app = await createApp(); await app.init()` rồi gieo ba phiên (`admin`, `member`, `owner`) bằng `gieoThanhVien` + `mintPhien`. `afterAll`: dọn theo `TIEN_TO` đúng thứ tự của `to-chuc-san.ts` (secondary → placement → plan → company → template → department (bỏ `divisionId`, `headUserId` trước) → division → session → member → user), rồi `app.close()`.

- [ ] **Step 2: Viết E3 `mdg-luat-luu-tru` — ma trận bảy ca viết trước**

```ts
describe("mdg-luat-luu-tru", () => {
	test("mdg-luat-luu-tru: bay ca luu tru, hai ca tu choi qua ca hai lop, khoi phuc ve cho cu", async () => {
		const gieo = {
			khuonSong: async () => { const id = await pbMoi("ls-khuon"); const k = await khuonMoi([id]); return { id, khuon: k.name }; },
			khuonLuu: async () => { const id = await pbMoi("ls-khuon-luu"); const k = await khuonMoi([id]); ok(await trpc("onboarding.archiveTemplate", { id: k.id }), "luu khuon"); return { id, khuon: k.name }; },
			haiNguoi: async () => { const id = await pbMoi("ls-nguoi"); for (const n of ["a", "b"]) ok(await datChinh(await nguoiMoi(`ls-${n}`), id), n); return { id, khuon: "" }; },
			chiPhu: async () => { const id = await pbMoi("ls-phu"); ok(await datChinh(await nguoiMoi("ls-phu-n"), null, [id]), "phu"); return { id, khuon: "" }; },
			nguoiRoi: async () => { const id = await pbMoi("ls-roi"); const n = await nguoiMoi("ls-roi-n"); ok(await datChinh(n, id), "roi"); await roiWorkspace(n); return { id, khuon: "" }; },
			coBuoc: async () => { const id = await pbMoi("ls-buoc"); await keHoachCoBuoc(id); return { id, khuon: "" }; },
			trong: async () => ({ id: await pbMoi("ls-trong"), khuon: "" }),
		};
		const CA = [
			{ ten: "1 trong khuon chua luu tru", gieo: gieo.khuonSong, lop: "trpc", ma: 400, cau: (k: string) => T.phongBanTrongKhuon([k]), luu: false },
			{ ten: "2 chi trong khuon da luu tru", gieo: gieo.khuonLuu, lop: "trpc", ma: 200, cau: () => "", luu: true },
			{ ten: "3 hai nguoi nhan lam chinh", gieo: gieo.haiNguoi, lop: "trpc", ma: 400, cau: () => T.phongBanConNguoi(2), luu: false },
			{ ten: "4 chi nguoi phu", gieo: gieo.chiPhu, lop: "trpc", ma: 200, cau: () => "", luu: true },
			{ ten: "5 chi nguoi da roi", gieo: gieo.nguoiRoi, lop: "rest", ma: 200, cau: () => "", luu: true },
			{ ten: "6 co buoc ke hoach", gieo: gieo.coBuoc, lop: "rest", ma: 200, cau: () => "", luu: true },
			{ ten: "7 trong", gieo: gieo.trong, lop: "rest", ma: 200, cau: () => "", luu: true },
			{ ten: "1 REST trong khuon chua luu tru", gieo: gieo.khuonSong, lop: "rest", ma: 400, cau: (k: string) => T.phongBanTrongKhuon([k]), luu: false },
			{ ten: "3 REST hai nguoi nhan lam chinh", gieo: gieo.haiNguoi, lop: "rest", ma: 400, cau: () => T.phongBanConNguoi(2), luu: false },
		] as const;
		let soKhangDinh = 0;
		for (const ca of CA) {
			const { id, khuon } = await ca.gieo();
			const tra = ca.lop === "trpc"
				? await trpc("org.archiveDepartment", { id })
				: await rest("post", `/org/departments/${id}/archive`, {});
			expect(`${ca.ten}: HTTP ${tra.status}`).toBe(`${ca.ten}: HTTP ${ca.ma}`);
			expect(`${ca.ten}: ${tra.loi}`).toBe(`${ca.ten}: ${ca.cau(khuon)}`);
			const dong = await db.department.findUniqueOrThrow({ where: { id } });
			expect(`${ca.ten}: luu tru ${dong.archivedAt !== null}`).toBe(`${ca.ten}: luu tru ${ca.luu}`);
			soKhangDinh += 3;
		}
		expect(soKhangDinh).toBe(27);
	});
});
```

(`rest` trả `loi` = `res.body.message`; ca 200 của REST có `loi` rỗng vì thân là `{ id }`.) Thêm hai test cùng `describe`:

- `mdg-luat-luu-tru: khoi phuc ve dung bo phan va vi tri` — `bp = bpMoi`, ba phòng ban trong `bp`, lưu trữ cái thứ hai (`index` 1), đọc `divisionId`, `position` trước, `org.restoreDepartment`, khẳng định `divisionId`, `position` bằng trước (2), và `cay().divisions.find(bp).departments` chứa nó (1).
- Review Focus: `luu-lai` (lưu trữ hai lần → 200, vẫn lưu trữ), `khong-co` (ba thủ tục với mã `ma("khong-co")` → 404 `T.khongCoPhongBan(id)`), `khoi-phuc-bo-phan-da-luu` (phòng ban đã lưu trữ, rồi lưu trữ bộ phận của nó, khôi phục phòng ban → 200 và nằm trong `cay().chuaXep`).

- [ ] **Step 3: Viết E4 `mdg-luat-xoa-han` — bảy ca + hai ca REST + đối chứng câu bộ phận**

Cùng khuôn bảng với Step 2, gọi `org.purgeDepartment` (ca 1–6 tRPC, ca 7 REST `DELETE /org/departments/{id}`), mỗi ca `[HTTP, câu, hàng còn]`:
1 chưa lưu trữ → 400 `T.chuaLuuTru`, còn · 2 lưu trữ + bước kế hoạch (gieo `keHoachCoBuoc` rồi `org.archiveDepartment`) VÀ nằm trong một khuôn đã lưu trữ → 400 `T.phongBanConBuoc`, còn · 3 lưu trữ, người hiệu lực nhận làm chính (đặt vị trí SAU khi lưu trữ bằng `db.orgPlacement.upsert`, vì `setPlacement` từ chối phòng ban đã lưu trữ) → 400 `T.phongBanConNguoiXoa`, còn · 4 như 3 nhưng người đã rời → cùng câu, còn · 5 lưu trữ, nằm trong khuôn đã lưu trữ → 400 `T.phongBanConTrongKhuon([k.name])`, còn · 6 lưu trữ, chỉ người phụ → 200, mất, `orgSecondaryDepartment.count({ departmentId })` = 0 · 7 lưu trữ, trống, REST → 200, mất. Thêm ca 1 và 2 chạy lại qua REST `DELETE` (400, câu, còn). Đối chứng câu: `org.purgeDivision` trên bộ phận chưa lưu trữ trả `loi` === `loi` của ca 1 (1). Hằng `KY_VONG = 7 * 3 + 1 + 2 * 3 + 1` (= 29) và `expect(soKhangDinh).toBe(KY_VONG)`.

- [ ] **Step 4: Viết E5 `mdg-xoa-duoc-mot-noi` — cùng ma trận qua ba nơi**

```ts
const CA = [
	{ ten: "con buoc ke hoach", mong: false },
	{ ten: "nguoi hieu luc nhan lam chinh", mong: false },
	{ ten: "nguoi da roi nhan lam chinh", mong: false },
	{ ten: "chi nguoi phu", mong: true },
	{ ten: "trong khuon chua luu tru", mong: false },
	{ ten: "trong khuon da luu tru", mong: false },
	{ ten: "trong", mong: true },
] as const;
```

Gieo mỗi ca một phòng ban rồi LƯU TRỮ qua `org.archiveDepartment`; vế người gieo sau khi lưu trữ bằng `db.orgPlacement.upsert`; vế «trong khuôn chưa lưu trữ» gieo bằng `db.onboardingTemplate.create({ data: { name: ma("k"), steps: [{ label: "B", departmentId: id, position: 0, offsetDays: 0 }] } })` SAU khi lưu trữ (trạng thái API không tạo được). Với từng ca: `A = cay().archived.departments.find(id).purgeable`, `B = docTrpc("onboarding.listDepartments", { archived: true }).find(id).purgeable`, rồi `C = (await trpc("org.purgeDepartment", { id })).status === 200`. Khẳng định `${ten}: org.tree ${A}, listDepartments ${B}` === `${ten}: org.tree ${A}, listDepartments ${A}` và `${ten}: org.tree ${A}, xoa ${C}` === `${ten}: org.tree ${A}, xoa ${A}` (14), cộng `${ten}: ${A}` === `${ten}: ${mong}` (7). Review Focus: một phòng ban chưa lưu trữ đọc qua `listDepartments({ archived: false })` có `purgeable` false (1).

- [ ] **Step 5: Viết E6 `mdg-quyen-ba-thu-tuc` — 3 thủ tục × 2 lớp × 3 vai**

Mỗi ô gieo input riêng (`archive` → phòng ban trống mới; `restore`, `purge` → phòng ban đã lưu trữ mới). Thường → 403 và `db.department.findUnique` cho `archivedAt` (hoặc sự tồn tại) như trước (2 khẳng định/ô, 6 ô = 12); quản trị và chủ → 200 (12). REST: `POST /org/departments/{id}/archive`, `POST .../restore`, `DELETE /org/departments/{id}`. `expect(soKhangDinh).toBe(24)`.

- [ ] **Step 6: Chạy — phải đỏ vì thủ tục chưa có**

Run: `bun run test -- "cd apps/api && CRM_TELEMETRY_DISABLED=1 bun test --preload ./test/setup.ts test/mot-duong-ghi-phong-ban.spec.ts -t mdg-luat"`
Expected: FAIL — `1 trong khuon chua luu tru: HTTP 404` khác `HTTP 400`; `T.phongBanTrongKhuon` chưa có (lỗi kiểu ở `check-types`).

- [ ] **Step 7: Câu và hàm luật**

`to-chuc-config.ts`, thêm vào `thongDiep` (giữ nguyên văn câu cũ của hai câu khuôn — chúng chuyển từ `ONBOARDING`):

```ts
		phongBanConBuoc: "Phòng ban còn bước kế hoạch trỏ tới nên không xoá hẳn được.",
		phongBanTrongKhuon: (khuon: readonly string[]) =>
			`Phòng ban này còn nằm trong khuôn ${khuon.join(", ")} — sửa khuôn trước.`,
		phongBanConTrongKhuon: (khuon: readonly string[]) =>
			`Phòng ban này còn nằm trong khuôn ${khuon.join(", ")} — xoá vĩnh viễn khuôn đó hoặc bỏ phòng ban khỏi khuôn trước.`,
```

`xoa-phong-ban.ts`:

```ts
import { TO_CHUC } from "./to-chuc-config";

const T = TO_CHUC.thongDiep;

export type PhongBanDeXoa = {
	archived: boolean;
	stepCount: number;
	primaryCount: number;
	khuon: readonly string[];
};

export function lyDoKhongXoaPhongBan(pb: PhongBanDeXoa): string | null {
	if (!pb.archived) return T.chuaLuuTru;
	if (pb.stepCount > 0) return T.phongBanConBuoc;
	if (pb.primaryCount > 0) return T.phongBanConNguoiXoa;
	if (pb.khuon.length > 0) return T.phongBanConTrongKhuon(pb.khuon);
	return null;
}
```

- [ ] **Step 8: Ba thủ tục trong `ToChucService`**

```ts
	private async khuonChua(id: string) {
		const khuon = await this.db.onboardingTemplate.findMany({
			orderBy: { createdAt: "asc" },
			select: { name: true, steps: true, archivedAt: true },
		});
		return khuon
			.filter((k) => parseOnboardingTemplateSteps(k.steps).some((b) => b.departmentId === id))
			.map((k) => ({ name: k.name, archived: k.archivedAt !== null }));
	}

	async archiveDepartment(input: { id: string }) {
		await this.phongBanCo(input.id);
		const song = (await this.khuonChua(input.id)).filter((k) => !k.archived).map((k) => k.name);
		if (song.length > 0) throw new BadRequestException(T.phongBanTrongKhuon(song));
		const conNguoi = await this.db.orgPlacement.count({
			where: {
				primaryDepartmentId: input.id,
				user: { members: { some: { organizationId: WORKSPACE_ID } } },
			},
		});
		if (conNguoi > 0) throw new BadRequestException(T.phongBanConNguoi(conNguoi));
		return this.db.department.update({
			where: { id: input.id },
			data: { archivedAt: new Date() },
			select: { id: true },
		});
	}

	async restoreDepartment(input: { id: string }) {
		await this.phongBanCo(input.id);
		return this.db.department.update({
			where: { id: input.id },
			data: { archivedAt: null },
			select: { id: true },
		});
	}

	async purgeDepartment(input: { id: string }) {
		const pb = await this.phongBanCo(input.id);
		const [stepCount, primaryCount, khuon] = await Promise.all([
			this.db.onboardingStep.count({ where: { departmentId: input.id } }),
			this.db.orgPlacement.count({ where: { primaryDepartmentId: input.id } }),
			this.khuonChua(input.id),
		]);
		const lyDo = lyDoKhongXoaPhongBan({
			archived: pb.archivedAt !== null,
			stepCount,
			primaryCount,
			khuon: khuon.map((k) => k.name),
		});
		if (lyDo !== null) throw new BadRequestException(lyDo);
		return this.db.department.delete({ where: { id: input.id }, select: { id: true } });
	}
```

- [ ] **Step 9: Ba mutation trong `ToChucRouter`** (cùng khuôn `archiveDivision`):

```ts
	@Mutation({ input: orgIdInput, output: orgOkOutput, meta: restMeta("POST", "/org/departments/{id}/archive", TAG) })
	async archiveDepartment(@Ctx() ctx: AuthedTrpcContext, @Input() input: z.infer<typeof orgIdInput>) {
		await this.toChuc.yeuCauQuanTri(ctx.user.id);
		return this.toChuc.archiveDepartment(input);
	}
```

`restoreDepartment` → `restMeta("POST", "/org/departments/{id}/restore", TAG)`; `purgeDepartment` → `restMeta("DELETE", "/org/departments/{id}", TAG)`. Rồi `cd apps/api && bun run trpc:generate`.

- [ ] **Step 10: `cay.ts` đọc cùng luật**

`CayTho.departmentsInTemplates: ReadonlySet<string>` đổi thành `khuonCuaPhongBan: ReadonlyMap<string, readonly string[]>`; `anhCay()` dựng map từ `khuon` (thêm `name` vào `select`): mỗi khuôn, mỗi `departmentId` duy nhất trong bước → thêm `name`. Trong `dungCay`, thay `primaryRefs` bằng đếm:

```ts
	const soChinh = new Map<string, number>();
	for (const p of tho.placements)
		if (p.primaryDepartmentId !== null)
			soChinh.set(p.primaryDepartmentId, (soChinh.get(p.primaryDepartmentId) ?? 0) + 1);
```

và `purgeable: lyDoKhongXoaPhongBan({ archived: true, stepCount: d.stepCount, primaryCount: soChinh.get(d.id) ?? 0, khuon: tho.khuonCuaPhongBan.get(d.id) ?? [] }) === null`.

- [ ] **Step 11: `onboarding.listDepartments` đọc cùng luật**

`CHON_BO_PHAN._count.select` thêm `primaryOf: true`; `HangBoPhan._count` thêm `primaryOf: number`; `boPhanRa`:

```ts
		purgeable:
			row.archivedAt !== null &&
			lyDoKhongXoaPhongBan({
				archived: true,
				stepCount: row._count.steps,
				primaryCount: row._count.primaryOf,
				khuon: khuon.map((k) => k.name),
			}) === null,
```

- [ ] **Step 12: Chạy — xanh**, rồi `bun run check-types` và `bun run lint`.

- [ ] **Step 13: Phá-thử hai chiều (cùng fixture)**

Lần lượt, mỗi lần một chỗ, chạy lại đúng `-t` rồi `git checkout -- <tệp>`:
- bỏ khối kiểm khuôn trong `archiveDepartment` → đỏ `1 trong khuon chua luu tru: HTTP 200` khác `HTTP 400`;
- bỏ `if (pb.stepCount > 0) …` trong `xoa-phong-ban.ts` → đỏ `2 con buoc: HTTP 200` … (E4) và `con buoc ke hoach: org.tree true` (E5);
- trong `boPhanRa` đặt `primaryCount: 0` → đỏ `nguoi hieu luc nhan lam chinh: org.tree false, listDepartments true`;
- bỏ `yeuCauQuanTri` ở `archiveDepartment` của router → đỏ `org.archiveDepartment trpc thuong: HTTP 200` khác `HTTP 403`;
- ném `new Error("x")` thay `BadRequestException` ở chỗ kiểm khuôn → đỏ `1 REST trong khuon chua luu tru: HTTP 500`.

- [ ] **Step 14: Commit** — `feat(api): lưu trữ, khôi phục, xoá hẳn phòng ban qua org.* với một luật xoá được`.

---

### Task 2: Dòng `revisit` ở tám hồ sơ đã ký

`independent: false` · phục vụ E9 · verify: `for s in <8 slug>; do tail -1 _acceptance/$s/decisions.jsonl | python3 -m json.tool >/dev/null && echo $s; done`

**Files:** `_acceptance/{dieu-phoi-30-ngay-dau,test-api-khong-de-viec-vo-chu,quan-ly-danh-muc-30-ngay,noi-bon-nut-dieu-phoi,khuon-mat-bo-phan,sua-luu-tru-dieu-phoi,cau-truc-to-chuc,to-chuc-danh-sach-chi-tiet}/decisions.jsonl`

- [ ] **Step 1:** Với mỗi hồ sơ, append ĐÚNG khối lệnh `DEC-ID-RECIPE` của feature-loop (mỗi dòng một lần chạy), `"type":"revisit","stage":"gate2"`, `decision` nêu tên tệp kiểm đổi và câu «vòng mot-duong-ghi-phong-ban gỡ đường ghi onboarding.*Department; bài kiểm chuyển sang org.*, không bỏ hay nới khẳng định nào», `impact` «hồ sơ ghim lại bằng làn máy trong cùng PR». Riêng `cau-truc-to-chuc`: thêm «hai câu từ chối xoá phòng ban đổi theo d-…-3 của mot-duong-ghi-phong-ban; E1b nay gieo qua org.createDepartment». Riêng `test-api-khong-de-viec-vo-chu`: «không đổi tệp của hồ sơ; dieu-phoi.spec.ts nó chạy lại đã đổi đường gieo».
- [ ] **Step 2: Commit** — `acceptance: dòng revisit cho tám hồ sơ có bài kiểm đi qua đường ghi phòng ban cũ`.

---

### Task 4 (chạy trước Task 3): Chuyển bài kiểm của tám hồ sơ sang `org.*`

`independent: false` · phục vụ E9, E10 · verify: từng lệnh eval của hồ sơ đó trong `_acceptance/config.yaml` (bảng dưới), rồi `bun run test`.

Luật chung: mỗi khẳng định giữ nguyên chữ; chỉ đổi dòng gieo và dòng gọi. Lời gọi trả `{ id }` thay vì bản ghi đầy đủ → helper dựng lại `{ id, name, purgeable: false }` từ input.

| Tệp | Đổi | Lệnh verify |
|---|---|---|
| `apps/api/test/dieu-phoi.spec.ts` | thêm `const toChuc = new ToChucService(db)` và `const taoPb = (ten: string) => toChuc.createDepartment({ name: \`${ten} ${Date.now().toString(36)}-${++dem}\`, divisionId: null }).then(async ({ id }) => db.department.findUniqueOrThrow({ where: { id } }))`; mọi `service.createDepartment({ name: X })` → `taoPb(X)`; `service.updateDepartment({ id, name: "Ky thuat va Du lieu" })` → `toChuc.renameDepartment({ id, name: tenMoi })` với `tenMoi` có hậu tố, và khẳng định `department.name === tenMoi` (cùng khẳng định, tên là biến); `service.archiveDepartment` → `toChuc.archiveDepartment`; `gieoKeHoachCoBuoc` gọi `taoPb`. Không tên nào bắt đầu bằng «Bo phan-». | `dp30_*` (8 khoá) + `vvc_dieu_phoi_don_sach` |
| `apps/api/test/quan-ly-danh-muc.spec.ts:534` | `service.updateDepartment(…)` → `new ToChucService(db).renameDepartment({ id: a.id, name: \`Ten moi ${t}\` })` | `qldm_bang_cot_bo_phan` |
| `apps/api/test/noi-bon-nut.spec.ts` | `gieoBoPhan` → `toChuc.createDepartment({ name: ma("Bo phan"), divisionId: null })`; test `ghi-bo-phan`: `orgDepartmentCreateInput.parse(quaJson({ name: ten, divisionId: null }))` → `toChuc.createDepartment` → khẳng định một hàng mang tên đó (giữ nguyên). **Chiều đỏ (NGOẠI LỆ chờ Gate 1.5):** bộ kiểm dữ liệu vào `departmentCreateInput` bị gỡ, `orgDepartmentCreateInput` không chặn tên trống — luật tên trống nay nằm ở dịch vụ của cây. Khẳng định `loi` chứa `"name"` thay bằng: `loi === TO_CHUC.thongDiep.tenTrong` VÀ số hàng mang tên `"  ".trim()` không đổi (chặt hơn: thêm vế «không ghi gì»). | `nbn_ghi_bo_phan` |
| `apps/api/test/khuon-mat-bo-phan.spec.ts` | thêm `goiOrg(thuTuc, vao)` post `/api/trpc/org.${thuTuc}`; `taoBoPhan` → `goiOrg("createDepartment", { name, divisionId: null })` và trả `{ id, name, purgeable: false }`; mọi `goi("archiveDepartment"|"restoreDepartment"|"purgeDepartment", …)` → `goiOrg(…)`. `coTheXoa` vẫn đọc `onboarding.listDepartments`. | `kmbp_*` (4 khoá) |
| `apps/api/test/sua-luu-tru.spec.ts` | `goi` nhận tên đầy đủ khi có dấu chấm: `` `/api/trpc/${thuTuc.includes(".") ? thuTuc : `onboarding.${thuTuc}`}` ``; mọi `create/update/archive/restore/purgeDepartment` → `org.createDepartment` (thêm `divisionId`), `org.renameDepartment`, `org.archiveDepartment`, `org.restoreDepartment`, `org.purgeDepartment`; `taoBoPhan(divisionId = null)` trả `{ id, name, position, purgeable: false }` (đọc `position` từ DB). `api-bo-phan` «sắp xếp»: gieo `a,b,c` trong `bp = org.createDivision(ma("Khoi"))`, rồi `org.moveDepartment({ id: c, divisionId: bp, index: 0 })` — giữ nguyên CẢ khẳng định thứ tự `c,a,b` lẫn vị trí `c:0, a:1, b:2`. `api-quyen`: bảng `CAU_HINH` giữ 11 dòng — `org.createDepartment`, `org.renameDepartment`, `org.moveDepartment` (thay `reorderDepartments`, `{ id: dX.id, divisionId: null, index: 0 }`), `org.archiveDepartment`, `org.restoreDepartment`, `org.purgeDepartment` + năm dòng khuôn; `soAssert` vẫn 11; «chủ tạo bộ phận» → `org.createDepartment`. | `slt_api_*` (9 khoá) |
| `apps/api/test/to-chuc.spec.ts` | `du-lieu-cu`: `tao("onboarding.createDepartment", { name })` → `pbMoi`-dạng `tao("org.createDepartment", { name, divisionId: null })`; mọi `onboarding.archiveDepartment` / `restoreDepartment` / `purgeDepartment` → `org.*`; ca 6 câu → `"Phòng ban còn bước kế hoạch trỏ tới nên không xoá hẳn được."`, ca 10 câu → `"Chỉ xoá hẳn được đơn vị đã lưu trữ."` (hai câu của AC-3); `dungDauVaoHopLe`: bỏ sáu khoá `onboarding.*`, thêm `"org.archiveDepartment": { id: pbTrong() }`, `"org.restoreDepartment"`, `"org.purgeDepartment"` (`{ id: pbLuu() }`), `pbLuu` gọi `org.archiveDepartment`. Bộ lọc `thuTucGhi` GIỮ vế `/^onboarding\.\w*Department/`. | `ttc_du_lieu_cu`, `ttc_vong_doi_don_vi`, `ttc_luu_tru`, `ttc_quyen` |
| `apps/api/test/to-chuc-nhap.spec.ts` | mọi `onboarding.archiveDepartment` / `restoreDepartment` → `org.*` (tìm bằng `grep -n onboarding\.`) | `ttc_nhap_xem_truoc`, `ttc_nhap_ghi` |
| `apps/api/test/to-chuc-chi-tiet.spec.ts:61` | `onboarding.archiveDepartment` → `org.archiveDepartment` | `tcds_*` API (các khoá chạy `to-chuc-chi-tiet.spec.ts`) |
| `apps/app/test/to-chuc-chi-tiet.dom.tsx:238-240` | chuyển ba mock `archiveDepartment`, `restoreDepartment`, `purgeDepartment` (cùng khoá, cùng thân) từ khối `onboarding` sang khối `org` | `tcds_*` DOM (các khoá chạy `to-chuc-chi-tiet.dom.tsx`) |
| `apps/app/test/sua-luu-tru.dom.tsx` | chuyển các mock `archiveDepartment`, `restoreDepartment`, `purgeDepartment` (cùng khoá, cùng thân `ghi`) từ khối `onboarding` sang `orgMock()`; `orgMock().createDepartment` đổi từ `khong("orgCreateDepartment")` sang `thuTuc("createDepartment", khongDoc, ghi("createDepartment", () => {}))` để khẳng định «đổi tên không tạo mới» vẫn đo `createDepartment` thật; gỡ mock `onboarding.createDepartment`, `updateDepartment`, `reorderDepartments`; `ONBOARDING.thongDiep.boPhanTrongKhuon([...])` → `TO_CHUC.thongDiep.phongBanTrongKhuon([...])` (cùng chuỗi). | `slt_*` DOM (14 khoá) |
| `apps/app/test/noi-bon-nut.dom.tsx` | gỡ mock `onboarding.createDepartment` (dùng `departmentCreateInput` sắp bị gỡ), `updateDepartment`, `archiveDepartment`, `restoreDepartment`, `purgeDepartment`, `reorderDepartments` và import `departmentCreateInput`; thêm `archiveDepartment`, `restoreDepartment`, `purgeDepartment` vào `orgMock()` dạng `khong(…)`. Trước khi gỡ: `grep -n 'soGoi("\(update\|archive\|restore\|purge\|reorder\)Department")\|dauVaoCuoi("\(update\|archive\|restore\|purge\|reorder\)Department")'` phải rỗng. | `nbn_*` DOM (8 khoá) |
| `apps/app/test/dieu-phoi-xoa-ghi-danh.dom.tsx:119-122` | gỡ bốn dòng mock `createDepartment`, `updateDepartment`, `archiveDepartment`, `reorderDepartments` sau khi `grep` như trên rỗng | `dp30_xoa_co_xac_nhan` |

- [ ] **Step 1:** Sửa từng tệp theo bảng, chạy lệnh verify của tệp đó ngay sau khi sửa (xanh trên cây còn đường cũ).
- [ ] **Step 2:** `bun run test` xanh; `bun run check-types`, `bun run lint`.
- [ ] **Step 3: Commit** — `test: bài kiểm của tám hồ sơ đi qua org.* thay đường ghi phòng ban cũ`.

---

### Task 3: Gỡ sáu thủ tục ghi cũ + thước quét mã

`independent: false` · phục vụ E1, E2, E6b · verify: `bun run test -- "…mot-duong-ghi-phong-ban.spec.ts -t mdg-go-duong-cu"`, `bun run test -- "cd apps/api && bun test test/to-chuc.spec.ts -t quyen"`, `bun _acceptance/mot-duong-ghi-phong-ban/rang/mot-cho-ghi.mjs api`

**Files:** `apps/api/src/onboarding/onboarding.router.ts`, `onboarding.service.ts`, `onboarding.contracts.ts`, `onboarding-config.ts`, `apps/api/src/generated/server.ts`, `apps/api/test/mot-duong-ghi-phong-ban.spec.ts`, Create `_acceptance/mot-duong-ghi-phong-ban/rang/mot-cho-ghi.mjs`

- [ ] **Step 1: Viết E1 `mdg-go-duong-cu`** — `const DUONG_CU = [...6 tRPC, ...6 REST] as const` với input hợp lệ trên một phòng ban gieo qua `org.createDepartment`; mỗi đường khẳng định `${duong}: HTTP ${status}` === `${duong}: HTTP 404`; chụp `db.department.findMany({ orderBy: { id: "asc" }, select: { id, name, position, archivedAt, divisionId } })` trước = sau. Quan hệ từ router đang chạy (`app.get(AppRouterHost).appRouter._def.procedures`, khuôn `go-la-cat-quyen.spec.ts`): `thu tuc ghi phong ban ngoai org: ${tenNgoai.join(", ")}` === `thu tuc ghi phong ban ngoai org: `; đường REST ghi chứa `/departments` ngoài `/org/` rỗng; tập tên `org.*Department` mutation === sáu tên; tập REST của sáu thủ tục đó === sáu đường viết trước. Đối chứng: `GET /api/trpc/onboarding.listDepartments` 200 chứa phòng ban vừa gieo; `GET /rest/onboarding/departments` 200 chứa nó. `expect(soKhangDinh).toBe(19)`.
- [ ] **Step 2:** Chạy → đỏ `onboarding.createDepartment: HTTP 200` khác `HTTP 404`.
- [ ] **Step 3: Gỡ.** Router: xoá sáu method và import `departmentCreateInput`, `departmentIdInput`, `departmentReorderInput`, `departmentUpdateInput`. Service: xoá `createDepartment`, `updateDepartment`, `archiveDepartment`, `restoreDepartment`, `purgeDepartment`, `reorderDepartments`, `khuonDungBoPhan`, `motBoPhanRa`, `doiChieuBoPhan` (nếu không còn ai gọi — `grep` trước khi xoá) và import các kiểu tương ứng. Contracts: xoá bốn schema và bốn kiểu. Config: xoá `boPhanTrongKhuon`, `boPhanConTrongKhuon`, `phongBanConNguoi`, `phongBanConNguoiXoa` khỏi `ONBOARDING.thongDiep` sau khi `grep -rn` xác nhận không còn nơi dùng (`chuaLuuTru`, `daDung` giữ — khuôn dùng). `cd apps/api && bun run trpc:generate`.
- [ ] **Step 4:** E1 xanh; `-t quyen` của `to-chuc.spec.ts` xanh và in danh sách có ba thủ tục mới, không `onboarding.*`.
- [ ] **Step 5: Thước `mot-cho-ghi.mjs`** — gốc kho = `path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")`. Chế độ `api`: duyệt `apps/*/{src,app,lib,components}` và `packages/*/src` (bỏ `node_modules`, `generated`, `.next`, `test`, `*.spec.*`, `*.dom.*`), regex `/\.department\.(create|createMany|update|updateMany|upsert|delete|deleteMany)\(/` và `/(INSERT INTO|UPDATE|DELETE FROM)\s+"department"/i`; in `quet: <số tệp> tep, <số lệnh> lenh ghi`; tệp ngoài `apps/api/src/to-chuc/` → in `lenh ghi phong ban ngoai to-chuc: <đường>:<dòng>`, exit 1; số tệp hoặc số lệnh = 0 → exit 2 `thuoc rong`. Chế độ `app`: duyệt `apps/app` (bỏ `node_modules`, `.next`, `test`), regex `/onboarding\.(createDepartment|updateDepartment|reorderDepartments|archiveDepartment|restoreDepartment|purgeDepartment)\b/`, vi phạm → `man web goi duong ghi cu: <đường>:<dòng>`. Chiều đỏ cùng lượt: chép các tệp đã quét sang `fs.mkdtempSync(os.tmpdir())`, chèn dòng vi phạm (api: vào `apps/api/src/onboarding/onboarding.service.ts`; app: `trpc.onboarding.purgeDepartment` vào `.../organization/da-luu-tru-to-chuc.tsx`), quét bản gương — phải bắt đúng một vi phạm với thông điệp ghim, không bắt → exit 2 `thuoc mu`; xoá thư mục tạm ở `finally`.
- [ ] **Step 6:** `bun …/mot-cho-ghi.mjs api` exit 0 (in số); chế độ `app` exit 1 lúc này (màn còn gọi đường cũ — Task 5 làm xanh).
- [ ] **Step 7:** `bun run test`, `check-types`, `lint`, `lint:slop` xanh. **Commit** — `feat(api): gỡ sáu thủ tục ghi phòng ban của onboarding`.

---

### Task 5: Màn Tổ chức chỉ gọi `org.*`

`independent: false` · phục vụ E7, E8 · verify: `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc.dom.tsx`, `bun _acceptance/mot-duong-ghi-phong-ban/rang/mot-cho-ghi.mjs app`

**Files:** `apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx:27-33`, `da-luu-tru-to-chuc.tsx:29-33`, `apps/app/test/to-chuc.dom.tsx`

- [ ] **Step 1: Mock theo router.** Trong `to-chuc.dom.tsx`: thêm `let duongGoi: string[] = []`; `thuTuc(ten, doc, router = "org")` ghi thêm `duongGoi.push(\`${router}.${ten}\`)` trong `viet`; khối `org` thêm `archiveDepartment`, `restoreDepartment`, `purgeDepartment` (cùng khoá `daGoi` như cũ); khối `onboarding` bỏ ba mock đó và bọc bằng `new Proxy(...)` trả `thuTuc(key, khongDoc, "onboarding")` cho mọi khoá kết thúc bằng `Department` để một lời gọi lạc được GHI thay vì làm sập màn. Reset `duongGoi` cùng chỗ reset `daGoi`. Khẳng định cũ (`cheDo` khoá `archiveDepartment`, `daGoi`) giữ nguyên.
- [ ] **Step 2: Viết E7 `mdg-man-goi-org`** — mở `?don=bp:bp-kd` như `-t luu-tru-man`; bốn thao tác (lưu trữ `pb-1` từ menu dòng trong khung chi tiết bộ phận → hộp xác nhận → hoàn tác trên toast → khôi phục `pb-cu` trong «Đã lưu trữ» → xoá hẳn `pb-cu` qua hộp xác nhận); mỗi thao tác: `duongGoi.filter(x => x === "org.<thủ tục>").length` === 1 và `dauVaoCuoi` === `{"id":"<id>"}` (8); `duongGoi.filter(x => x.startsWith("onboarding.") && x.endsWith("Department"))` === `[]` (1). Ba ca từ chối, câu lấy từ `TO_CHUC.thongDiep` import từ `../../api/src/to-chuc/to-chuc-config` (như `TO_CHUC.thongDiep.nhap` đã được import ở tệp này): `archiveDepartment` → `phongBanConNguoi(2)`, toast nguyên văn + `pb-1` còn trong cây; `purgeDepartment` → `phongBanConBuoc`, toast + hàng `pb-cu` còn trong danh sách; `restoreDepartment` → `phongBanTrongKhuon(["Khuôn A"])`, toast + hàng còn (6). `expect(soKhangDinh).toBe(15)`.
- [ ] **Step 3:** Chạy → đỏ `luu tru: org.archiveDepartment 0 loi goi` (màn còn gọi `onboarding`).
- [ ] **Step 4:** `xac-nhan-luu-tru.tsx`: `trpc.onboarding.archiveDepartment` → `trpc.org.archiveDepartment`, `trpc.onboarding.restoreDepartment` → `trpc.org.restoreDepartment`; `da-luu-tru-to-chuc.tsx`: `trpc.onboarding.restoreDepartment` → `trpc.org.restoreDepartment`, `trpc.onboarding.purgeDepartment` → `trpc.org.purgeDepartment`.
- [ ] **Step 5:** E7 xanh, `-t luu-tru-man` và `-t cay-man` xanh; `mot-cho-ghi.mjs app` exit 0.
- [ ] **Step 6: Phá-thử** — trả `xac-nhan-luu-tru.tsx` về `onboarding.archiveDepartment` → đỏ `luu tru: org.archiveDepartment 0 loi goi`; trả `da-luu-tru-to-chuc.tsx` về `onboarding.purgeDepartment` → đỏ `xoa han: org.purgeDepartment 0 loi goi` và `mot-cho-ghi.mjs app` exit 1 gọi tên tệp; thay `toast.error(e.message)` bằng `toast.error("x")` → đỏ `xoa han tu choi: toast khac cau may chu`; `git checkout` trả lại.
- [ ] **Step 7: Commit** — `feat(app): màn Tổ chức lưu trữ, khôi phục, xoá hẳn phòng ban qua org.*`.

---

### Task 6: Tài liệu, thước hồ sơ, năm lệnh chứng, ghim lại tám hồ sơ

`independent: false` · phục vụ E9, E10 · verify: `bun _acceptance/mot-duong-ghi-phong-ban/rang/ho-so-da-ghim.mjs`

**Files:** `docs/api.md`, Create `_acceptance/mot-duong-ghi-phong-ban/rang/ho-so-da-ghim.mjs`, sinh `_acceptance/mot-duong-ghi-phong-ban/bai-kiem-da-ky.diff`, `bai-kiem-dem.md`, `PRODUCT-MAP.md`

- [ ] **Step 1: `docs/api.md` «The organization tree»** — gạch đầu dòng «Archive, then purge»: thêm «`org.archiveDepartment` / `restoreDepartment` / `purgeDepartment` are the only way; `onboarding` has no department writes and keeps `listDepartments` for reading»; và «purgeability is one function, `lyDoKhongXoaPhongBan` (`xoa-phong-ban.ts`) — `org.tree`, `org.purgeDepartment` and `onboarding.listDepartments` all call it».
- [ ] **Step 2: Thước `ho-so-da-ghim.mjs`** đúng `expected` của E10: (a) rút tập bị chạm từ `evals.yaml` của mọi hồ sơ trạng thái `signed-off|machine-cleared|da-cham-boi-thuc-te|verified` trừ chính hồ sơ này — eval `test`/`script` có `cmd: config:executors.<nhóm>.<khoá>`, giải khoá trong `_acceptance/config.yaml`, lệnh nhắc tên một tệp trong `git diff --name-only <base> HEAD` dưới `apps/*/test/` — so với hằng `TAM` (tám slug); (b) mỗi slug: dòng `"kind":"repin"` cuối, `evals_exit` khác rỗng và toàn 0, `suites_exit` toàn 0, `sha` === `verified_commit` (frontmatter `evidence-report.md`), `git diff --name-only <sha> HEAD` chỉ gồm `_acceptance/**` hoặc khớp `risk_tiers.t1_skip_globs` (đọc từ config, so bằng `Bun.Glob`); tám slug chung một `run_id`; (c) `bash scripts/pre-merge-check.sh . --base origin/onehub` — mọi dòng `VIOLATION` chỉ được chứa `[mot-duong-ghi-phong-ban]`. Sinh `bai-kiem-da-ky.diff` = `git diff <base> HEAD -- <các tệp kiểm của tập>` và `bai-kiem-dem.md` = bảng `| tệp | expect/ok trước | expect/ok sau |` (đếm `/\bexpect\(|\bok\(/g` trên `git show <base>:<tệp>` và bản HEAD). Chiều đỏ trong bộ nhớ như `expected`. `base` = `git merge-base HEAD origin/onehub`.
- [ ] **Step 3: Năm lệnh chứng** — `bun run test`, `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build` đều exit 0; commit mọi thứ còn lại (cây sạch ngoài `_acceptance/`).
- [ ] **Step 4: Ghim lại tám hồ sơ bằng một lượt làn**

```bash
node "$(node scripts/resolve-plugin.mjs --plugin feature-loop --require scripts/repin-lane.mjs)/scripts/repin-lane.mjs" --root . --ag-root . \
  --slug dieu-phoi-30-ngay-dau --slug test-api-khong-de-viec-vo-chu --slug quan-ly-danh-muc-30-ngay \
  --slug noi-bon-nut-dieu-phoi --slug khuon-mat-bo-phan --slug sua-luu-tru-dieu-phoi --slug cau-truc-to-chuc --slug to-chuc-danh-sach-chi-tiet \
  --reason "mot-duong-ghi-phong-ban: bài kiểm chuyển sang org.*, đường ghi phòng ban cũ gỡ" --write
```

(Bỏ `--ag-root .` nếu kho không tự host kit.) Làn đỏ → DỪNG, sửa nguyên nhân, chạy lượt mới — không ghi tay. Xanh → commit tám hồ sơ `repin(<8 slug>): ghim lại sau khi gỡ đường ghi phòng ban cũ`.
- [ ] **Step 5:** `bun …/ho-so-da-ghim.mjs` exit 0 (in 35 khẳng định), rồi phá-thử trong bộ nhớ đã nằm trong thước; `node <acceptance-gate>/scripts/product-map.mjs --root .`; commit `bai-kiem-da-ky.diff`, `bai-kiem-dem.md`, `PRODUCT-MAP.md`. Hợp đồng sang `status: implemented`.

---

## Self-review

- Phủ spec: mục 1 → Task 1; mục 2 → Task 3; mục 3–4 → Task 1; mục 5 → Task 1 (câu) + Task 4 (hai câu ghim của `to-chuc.spec.ts`); mục 6 → Task 5 (màn mới của `to-chuc-danh-sach-chi-tiet`); «Hồ sơ đã ký bị chạm» → Task 2, 4, 6; `docs/api.md` → Task 6.
- Tên dùng xuyên task: `lyDoKhongXoaPhongBan`, `PhongBanDeXoa`, `T.phongBanConBuoc`, `T.phongBanTrongKhuon`, `T.phongBanConTrongKhuon`, `khuonCuaPhongBan` — cùng một chính tả ở mọi task.
- Ngoại lệ chiều đỏ của `nbn_ghi_bo_phan` (Task 4) đã duyệt và nay nằm trong AC-7.
- Rút lại tập hồ sơ sau khi gộp `onehub` `472e8880`: tám (thêm `to-chuc-danh-sach-chi-tiet`).
