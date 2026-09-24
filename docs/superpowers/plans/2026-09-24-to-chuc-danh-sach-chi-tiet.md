# Tổ chức — danh sách và chi tiết: kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi màn Cài đặt › Tổ chức sang bố cục danh sách – chi tiết. Trưởng chọn tại chỗ, thêm người và gắn nhiều phòng ban một lượt, hai ô số lọc được, nhập theo ba bước. Màn thống nhất với các màn Cài đặt khác.

**Architecture:**
- API thêm hai thủ tục ghi hàng loạt trong module `to-chuc`, mỗi thủ tục chạy trong một giao dịch. Bản xem trước nhập có thêm `newNames` và ba câu lỗi riêng.
- App dựng lại `settings/organization`: cây điều hướng ở `cay-dieu-huong.tsx`, bốn khung chi tiết ở `chi-tiet-*.tsx`, nút đang chọn ghi vào địa chỉ trang bằng `nuqs`, khổ hẹp mở `Sheet`.
- `packages/ui` thêm bốn thành phần dùng chung: mục điều hướng, ô số, hộp chọn nhiều, mục đã lưu trữ. `ConfirmDialog` nhận `tone`.

**Tech Stack:** NestJS + nestjs-trpc, Prisma 7, Next 16 (App Router, `cacheComponents`), TanStack Query, `nuqs`, `@dnd-kit` qua `SortableList`, bun test + happy-dom.

**Spec:** `docs/superpowers/specs/2026-09-24-to-chuc-danh-sach-chi-tiet-design.md` · hợp đồng `_acceptance/to-chuc-danh-sach-chi-tiet/contract.md` · phép đo `_acceptance/to-chuc-danh-sach-chi-tiet/evals.yaml`

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Không `className` trên thành phần `@crm/ui` dưới `settings/organization`. Thẻ HTML trần chỉ được class bố cục (flex, grid, gap, p-, m-, w-, min-w-, truncate).
- Tệp sửa hoặc thêm trong `packages/ui` chỉ gồm: `src/components/nav-item.tsx`, `src/components/stat-tile.tsx`, `src/components/pick-list-dialog.tsx`, `src/components/archived-list.tsx`, cùng tệp chữ `src/lib/messages.ts` nếu thành phần cần chữ mặc định.
- Thành phần dùng chung được sửa (khai cho E21): `packages/ui/src/components/nav-item.tsx`, `packages/ui/src/components/stat-tile.tsx`, `packages/ui/src/components/pick-list-dialog.tsx`, `packages/ui/src/components/archived-list.tsx`, `packages/ui/src/lib/messages.ts`.
- Client component không nhập `@crm/db`, `@crm/auth`.
- Hằng số chỉnh được ở `apps/api/src/to-chuc/to-chuc-config.ts` (`TO_CHUC`, `as const`): trần lô `TO_CHUC.lo.toiDa = 50`.
- Ba câu lỗi nhập nguyên văn: «Thiếu email» · «Thiếu phòng ban» · «Trưởng bộ phận cần cột bộ phận, hoặc phòng ban đã thuộc một bộ phận».
- Câu gợi ý ô trưởng phòng ban trống: «Thêm người vào phòng ban trước, rồi chọn trưởng trong số họ.» Dòng chỉ đọc: «Chỉ quản trị sửa được cây tổ chức.»
- Tên người, tên đơn vị, email mang `translate="no"`.
- Tên bài kiểm của ba hồ sơ đã ký (`cau-truc-to-chuc`, `sua-luu-tru-dieu-phoi`, `noi-bon-nut-dieu-phoi`) giữ nguyên. Số `expect` mỗi bài không giảm.
- Năm lệnh chứng xanh trước mọi commit cuối nhiệm vụ: `bun run test`, `check-types`, `lint`, `lint:slop`, `build`.

## Review Focus

1. **`?don=` trỏ tới đơn vị vừa bị lưu trữ trong lúc màn đang mở.** Khung chi tiết phải rơi về gốc, không trắng trang — test ở Task 4.
2. **Hộp «Thêm người» khi phòng ban đã có mọi thành viên.** Danh sách trống phải có câu trống và nút xác nhận mờ, không phải hộp rỗng câm — test ở Task 5.
3. **Lô gắn phòng ban có id trùng lặp.** Máy chủ bỏ trùng, không nhân đôi vị trí — test ở Task 1.
4. **Kéo thả khi đang lọc «chưa có trưởng».** Danh sách con bị lọc thì tay kéo phải mờ, để không ghi một thứ tự thiếu phần tử — test ở Task 5.
5. **Tìm kiếm khớp một người nằm trong phòng ban đang gập.** Cây mở nhánh chứa người đó — test ở Task 4.

---

### Task 1: API — gắn nhiều phòng ban và thêm nhiều người

**Files:**
- Modify: `apps/api/src/to-chuc/to-chuc-config.ts`, `to-chuc.contracts.ts`, `to-chuc.service.ts`, `to-chuc.router.ts`
- Regenerate: `apps/api/src/generated/server.ts` (`cd apps/api && bun run trpc:generate`)
- Test: `apps/api/test/to-chuc-chi-tiet.spec.ts` (mới; dùng `dungSan()` từ `to-chuc-san.ts`)

**Interfaces:**
- Produces:
  - `org.attachDepartments({ divisionId: string; departmentIds: string[] }) → { id: string }`, id là `divisionId`.
  - `org.addPeople({ departmentId: string; userIds: string[] }) → { id: string }`, id là `departmentId`.
  - Kiểu `AttachInput`, `AddPeopleInput` export từ contracts.

- [ ] **Step 1: Write the failing test.** `apps/api/test/to-chuc-chi-tiet.spec.ts`, bốn khối:
  - `describe("gan-phong-ban")` — E4.
    - Bộ phận B có pb1. Gửi `[pbChuaXep, pbTuA, pb1, pbChuaXep]` (có trùng). Thứ tự trong B phải là `[pb1, pbChuaXep, pbTuA]`, và A không còn pbTuA.
    - Ba lô bị từ chối: có pb đã lưu trữ, có id rác, B đã lưu trữ. Mỗi lô: HTTP 400 với câu ghim, và `JSON.stringify(await cay())` trước = sau.
    - Gọi lại cùng lô thì thứ tự không đổi.
  - `describe("them-nguoi")` — E6.
    - Bốn người a, b, c, d như E6: ghi xong thì cả bốn có phòng ban chính là P. c không còn P trong danh sách phụ. d giữ `managerOverrideId`. Q mất b.
    - Lô có người đã rời (xoá `member`) hoặc có id rác: HTTP 400, và `orgPlacement.findMany({ where: { userId: { in } } })` trước = sau.
  - `describe("quyen-moi")` — E15.
    - Phiên `thuong` gọi hai thủ tục mới: FORBIDDEN. Phiên `quan`: 200.
    - `generated/server.ts` có `attachDepartments` và `addPeople` trong `orgRouter`.
  - `describe("o-so")` — E10: đếm M, X, K bằng Prisma độc lập, so với `coverage`, với `chuaCoPhongBan` và với các phòng ban không có trưởng.

- [ ] **Step 2: Run to verify it fails.**
  `bun run test -- "cd apps/api && bun test test/to-chuc-chi-tiet.spec.ts"` → FAIL (`org.attachDepartments` 404).

- [ ] **Step 3: Implement.**

`to-chuc-config.ts` thêm:

```ts
	lo: { toiDa: 50 },
```

và trong `thongDiep`:

```ts
		loTrung: "Lô có mục trùng nhau.",
		loRong: "Chọn ít nhất một mục.",
```

`to-chuc.contracts.ts`:

```ts
export const orgAttachInput = z.object({
	divisionId: ma,
	departmentIds: z.array(ma).min(1).max(TO_CHUC.lo.toiDa),
});
export const orgAddPeopleInput = z.object({
	departmentId: ma,
	userIds: z.array(ma).min(1).max(TO_CHUC.lo.toiDa),
});
export type AttachInput = z.infer<typeof orgAttachInput>;
export type AddPeopleInput = z.infer<typeof orgAddPeopleInput>;
```

`to-chuc.service.ts`:

```ts
	async attachDepartments(input: AttachInput) {
		const bp = await this.boPhanSong(input.divisionId);
		if (bp.archivedAt !== null) throw new BadRequestException(T.boPhanDaLuuTru);
		const ids = [...new Set(input.departmentIds)];
		const pbs = await this.db.department.findMany({
			where: { id: { in: ids } },
			select: { id: true, archivedAt: true, divisionId: true },
		});
		for (const id of ids) {
			const pb = pbs.find((p) => p.id === id);
			if (!pb) throw new NotFoundException(T.khongCoPhongBan(id));
			if (pb.archivedAt !== null) throw new BadRequestException(T.phongBanDaLuuTru);
		}
		const cu = await this.db.department.findMany({
			where: { divisionId: input.divisionId, archivedAt: null },
			orderBy: [{ position: "asc" }, { name: "asc" }],
			select: { id: true },
		});
		const thuTu = [
			...cu.map((d) => d.id),
			...ids.filter((id) => !cu.some((d) => d.id === id)),
		];
		await this.db.$transaction(
			thuTu.map((id, viTri) =>
				this.db.department.update({
					where: { id },
					data: { divisionId: input.divisionId, position: viTri },
				}),
			),
		);
		return { id: input.divisionId };
	}

	async addPeople(input: AddPeopleInput) {
		const pb = await this.phongBanCo(input.departmentId);
		if (pb.archivedAt !== null) throw new BadRequestException(T.phongBanDaLuuTru);
		const ids = [...new Set(input.userIds)];
		const members = await this.db.member.findMany({
			where: { organizationId: WORKSPACE_ID, userId: { in: ids } },
			select: { userId: true },
		});
		for (const id of ids)
			if (!members.some((m) => m.userId === id))
				throw new BadRequestException(T.khongPhaiThanhVien(id));
		await this.db.$transaction([
			...ids.map((userId) =>
				this.db.orgPlacement.upsert({
					where: { userId },
					create: { userId, primaryDepartmentId: input.departmentId },
					update: { primaryDepartmentId: input.departmentId },
				}),
			),
			this.db.orgSecondaryDepartment.deleteMany({
				where: { userId: { in: ids }, departmentId: input.departmentId },
			}),
		]);
		return { id: input.departmentId };
	}
```

`to-chuc.router.ts`: thêm hai `@Mutation` theo khuôn `moveDepartment`. Mỗi thủ tục gọi `await this.toChuc.yeuCauQuanTri(ctx.user.id)` trước, output là `orgOkOutput`, meta `restMeta("POST", "/org/departments/attach", TAG)` và `restMeta("POST", "/org/departments/{departmentId}/people", TAG)`.

- [ ] **Step 4: Run to verify it passes.**
  `cd apps/api && bun run trpc:generate`, rồi chạy lại lệnh ở Step 2 → PASS. Chạy thêm `test/to-chuc.spec.ts` để thấy bài `quyen` của lượt 1 vẫn xanh (nó đọc `server.ts` nên tự thấy hai tên mới).

- [ ] **Step 5: Phá thử (chiều đỏ).**
  - E4: trong một bản sao tạm, đổi `$transaction` của `attachDepartments` sang ghi từng dòng trước khi kiểm → bài phải đỏ với «cây đổi sau lô bị từ chối».
  - E6: làm tương tự cho `addPeople`.
  - E15: bỏ `yeuCauQuanTri` ở `addPeople` → bài đỏ với «addPeople thành viên thường trả 200».

  Khôi phục cả ba sau khi thấy đỏ.

- [ ] **Step 6: Commit** `feat(to-chuc): gắn nhiều phòng ban và thêm nhiều người trong một giao dịch`

### Task 2: API — tên đơn vị mới trong bản xem trước, ba câu lỗi nhập

**Files:**
- Modify: `apps/api/src/to-chuc/nhap.ts`, `to-chuc-config.ts`, `to-chuc.contracts.ts`, `to-chuc.service.ts` (`previewImport`)
- Modify (bài đã ký, `cau-truc-to-chuc`): `apps/api/test/to-chuc-nhap.spec.ts` — thay `N.thieuCot` ở dòng 107 và 233 bằng hằng số mới đúng cột; giữ tên bài
- Test: `apps/api/test/to-chuc-chi-tiet.spec.ts`, khối `describe("nhap-moi")` (E12, E14)

**Interfaces:**
- Produces:
  - `orgImportPreviewOutput` thêm `newNames: { departments: string[]; divisions: string[] }`, ở cấp trên cùng, không nằm trong `summary`.
  - `TO_CHUC.thongDiep.nhap.thieuEmail = "Thiếu email"`, `thieuPhongBan = "Thiếu phòng ban"`, `thieuBoPhanTruong = "Trưởng bộ phận cần cột bộ phận, hoặc phòng ban đã thuộc một bộ phận"`. Bỏ `thieuCot`.

- [ ] **Step 1: Test.** `nhap-moi` gồm:
  - (a) Lô tạo 2 phòng ban mới và 1 bộ phận mới, trong đó có một dòng ghi «kinh doanh» chữ thường trùng một bộ phận cũ. `newNames` phải bằng đúng tập tên mới. Sau `applyImport`, tập tên đơn vị có trong `org.tree` mà không có trong ảnh chụp trước bằng đúng `newNames`.
  - (b) Lô 3 dòng hỏng. So từng dòng với chuỗi nguyên văn viết ngay trong bài, không import hằng số.
- [ ] **Step 2: Run** → FAIL: `newNames` là `undefined`, câu lỗi cũ.
- [ ] **Step 3: Implement.**
  - Trong `phanTichLo`, tách nhánh `thieuCot`:
    - `r.email === ""` → `N.thieuEmail`;
    - `r.department === ""` → `N.thieuPhongBan`;
    - nhánh trưởng bộ phận trong vòng lặp điểm cố định → `N.thieuBoPhanTruong`.
  - `KetQuaNhap` thêm `newNames`, tính từ `hopLe`: phòng ban có `departmentId === null`, bộ phận có `divisionName !== null` mà không có trong `bpTheoTen`. Bỏ trùng theo `khoa()`, giữ cách viết của dòng đầu tiên.
  - `previewImport` trả `newNames`.
- [ ] **Step 4: Run** `to-chuc-chi-tiet.spec.ts` và `to-chuc-nhap.spec.ts` → PASS.
- [ ] **Step 5: Phá thử.** Tráo `thieuEmail` với `thieuPhongBan` → (b) đỏ với «dòng thiếu email mang câu thiếu phòng ban».
- [ ] **Step 6: Commit** `feat(to-chuc): bản xem trước nêu tên đơn vị mới, câu lỗi nhập theo cột`

### Task 3: packages/ui — bốn thành phần dùng chung, ConfirmDialog có tone

**Files:**
- Create: `packages/ui/src/components/nav-item.tsx` — `NavItem({ active, level: 0|1|2, children, ...button })`. `Button` ghost/secondary canh trái, thụt theo `level`, `aria-current="page"` khi `active`.
- Create: `packages/ui/src/components/stat-tile.tsx` — `StatTile({ label, value, action, pressed, onClick })`. Nút đầy chiều ngang; khi `pressed` thì có `aria-pressed` và nền khác thấy được.
- Create: `packages/ui/src/components/pick-list-dialog.tsx` — `PickListDialog({ open, title, description, items: {id,label,hint?}[], selected, onSelectedChange, confirmLabel: (n) => string, empty, onConfirm, pending, error })`. Có ô tìm, danh sách ô tích, `FieldError` ngay dưới danh sách. Chưa chọn gì hoặc đang ghi thì nút xác nhận mờ.
- Create: `packages/ui/src/components/archived-list.tsx` — `ArchivedList({ label, items: {id,name,kind?,purgeable}[], disabled, onRestore, onPurge, restoreLabel, purgeLabel })`. `Collapsible` có chevron, nhãn «<label> (n)», các dòng `divide-y`, nút `size="xs"`, `data-slot="archived-list"`.
- Modify: `apps/app/app/(app)/[slug]/settings/members/confirm-dialog.tsx` — thêm `tone?: "destructive" | "default"`, mặc định `"destructive"`; nút xác nhận dùng `variant={tone}`.
- Test: `packages/ui/test/to-chuc-thanh-phan.dom.tsx` (mới) — mỗi thành phần một bài: `NavItem` có `aria-current`; `StatTile` phát `onClick` và có `aria-pressed`; `PickListDialog` lọc theo từ tìm, chưa chọn thì mờ, nhãn nút mang số, `FieldError` hiện khi có `error`; `ArchivedList` nhãn «(n)», bấm Khôi phục gọi `onRestore(id)`, không `purgeable` thì không có nút xoá.

- [ ] **Step 1: Write the failing tests.**
- [ ] **Step 2: Run** `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/to-chuc-thanh-phan.dom.tsx` → FAIL.
- [ ] **Step 3: Implement.** Dùng `Button`, `Collapsible`, `Checkbox`, `Dialog`, `InputGroup`, `Field`, `Icon` sẵn có. Mọi class nằm trong tệp thành phần.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Commit** `feat(ui): mục điều hướng, ô số, hộp chọn nhiều, mục đã lưu trữ dùng chung`

### Task 4: App — vỏ trang, trạng thái địa chỉ, cây điều hướng, khung gốc và khung phòng ban

**Files:**
- Create: `apps/app/app/(app)/[slug]/settings/organization/to-chuc-search-params.ts`:

```ts
import { createParser, parseAsStringLiteral } from "nuqs";

export type DonChon =
	| { loai: "goc" }
	| { loai: "bp"; id: string }
	| { loai: "pb"; id: string }
	| { loai: "chua-co" };

export const parseAsDon = createParser<DonChon>({
	parse: (v) => {
		if (v === "goc") return { loai: "goc" };
		if (v === "chua-co") return { loai: "chua-co" };
		const [loai, id] = v.split(":");
		if ((loai === "bp" || loai === "pb") && id) return { loai, id };
		return null;
	},
	serialize: (d) => (d.loai === "goc" || d.loai === "chua-co" ? d.loai : `${d.loai}:${d.id}`),
	eq: (a, b) => JSON.stringify(a) === JSON.stringify(b),
}).withDefault({ loai: "goc" });

export const toChucParsers = {
	don: parseAsDon,
	loc: parseAsStringLiteral(["chua-truong"] as const),
};
```

- Create: `cay-dieu-huong.tsx` (cây, dùng `NavItem`, `ListSearch`), `chi-tiet.tsx` (chọn khung theo `DonChon`; đơn vị không có trong cây thì rơi về gốc), `chi-tiet-goc.tsx`, `chi-tiet-phong-ban.tsx`, `chi-tiet-chua-co.tsx`, `o-so.tsx` (hai `StatTile`)
- Modify: `page.tsx` (mô tả, `PageShellActions` với hai nút, nền quyền truyền xuống); `to-chuc.tsx` (bố cục hai cột; dưới 1024 thì `Sheet` qua `useIsMobile`-kiểu `matchMedia("(min-width: 1024px)")`; trạng thái tải dùng `PageShellLoading`, lỗi và trống dùng `Empty` có media)
- Delete: `cay-to-chuc.tsx` (thay bằng các tệp trên)
- Modify: `apps/app/lib/messages/to-chuc.ts` (chữ mới vi và en; xoá khoá chết `lenTren`, `xuongDuoi`)
- Test: `apps/app/test/to-chuc-chi-tiet.dom.tsx` (mới), gồm các khối:
  - `chon-nut` — E1: 24 khẳng định, cộng Review Focus #1 và #5.
  - `truong-tai-cho` — E2.
  - `o-so-man` — E11.
  - `chi-doc` — E16, chạy trên ma trận sáu vùng.
  - `trang-thai` — E18, phần tải, lỗi và trống.

- [ ] **Step 1: Test** theo `expected` của E1, E2, E11, E16, E18 trong `evals.yaml`, mock tRPC như `apps/app/test/to-chuc.dom.tsx` (bọc `NuqsTestingAdapter` với `searchParams` khởi tạo).
- [ ] **Step 2: Run** `cd apps/app && bun test --preload ../../packages/ui/test/setup-dom.ts ./test/to-chuc-chi-tiet.dom.tsx` → FAIL.
- [ ] **Step 3: Implement** theo đặc tả và bản mẫu `apps/app/app/proto/_modules/to-chuc-danh-sach-chi-tiet/index.tsx`, thay mọi chỗ bản mẫu tự chỉnh `className` bằng `NavItem` và `StatTile`. Ô chọn trưởng phòng ban: `Combobox` với `options = pb.people`, rồi `org.setHead` qua `mutate(vars, { onSuccess: toast.success + lamMoi, onError: toast.error })`.
- [ ] **Step 4: Run** → PASS.
- [ ] **Step 5: Phá thử.**
  - E1: giữ `don` trong `useState` → đỏ «?don=bp:<id> mở ra gốc».
  - E16: bỏ `disabled` ở «Xếp phòng ban» → đỏ.
- [ ] **Step 6: Commit** `feat(to-chuc): bố cục danh sách – chi tiết, địa chỉ trang giữ nút đang chọn`

### Task 5: App — khung bộ phận, gắn phòng ban, thêm người, sắp thứ tự, lưu trữ

**Files:**
- Create: `chi-tiet-bo-phan.tsx` (ô trưởng mọi thành viên, `SortableList` phòng ban, nút «Gắn phòng ban có sẵn», «Phòng ban mới»); `hop-gan-phong-ban.tsx` và `hop-them-nguoi.tsx` (bọc `PickListDialog`, gọi `org.attachDepartments` và `org.addPeople`)
- Modify: `chi-tiet-goc.tsx` (sắp bộ phận bằng `SortableList` → `org.reorderDivisions`); `da-luu-tru-to-chuc.tsx` (dùng `ArchivedList`); chỗ gọi `ConfirmDialog` lưu trữ thêm `tone="default"`
- Modify: `apps/app/app/(app)/[slug]/settings/onboarding/da-luu-tru.tsx` (dùng `ArchivedList`); `danh-sach-khuon.tsx` (xác nhận lưu trữ khuôn thêm `tone="default"`)
- Test: `to-chuc-chi-tiet.dom.tsx`, các khối:
  - `gan-man` — E5.
  - `them-nguoi-man` — E7, có người phụ, và Review Focus #2.
  - `sap` — E8, và Review Focus #4.
  - `trang-thai` — E18, phần 13 thủ tục ghi báo `toast.success`, và 5 hộp thoại báo lỗi dưới ô rồi chuyển con trỏ tới đó.
  - `luu-tru-chung` — E19, đo trên cả Tổ chức lẫn Điều phối.

- [ ] **Step 1–4:** như Task 4, lệnh chạy như Task 4.
- [ ] **Step 5: Phá thử.**
  - E7: lọc theo mọi phòng ban của người (cả chính lẫn phụ) → đỏ «người phụ vắng mặt trong hộp».
  - E19: đổi nút lưu trữ sang `tone="destructive"` → đỏ.
- [ ] **Step 6: Commit** `feat(to-chuc): gắn nhiều phòng ban, thêm nhiều người, sắp bằng kéo thả, mục đã lưu trữ dùng chung`

### Task 6: App — hộp nhập ba bước

**Files:**
- Modify: `hop-thoai-nhap.tsx` (thêm `StepList` với bước 1 dán hoặc chọn tệp, bước 2 xem trước, bước 3 kết quả; bước 2 nêu `newNames`; bước 3 có nút «Xem cây» đưa về `?don=goc`); `hop-thoai-don-vi.tsx` và `hop-thoai-vi-tri.tsx` (lỗi dùng `FieldError` ngay dưới ô, con trỏ nhảy tới ô lỗi)
- Test: `to-chuc-chi-tiet.dom.tsx`, khối `nhap-ba-buoc` — E13, 9 khẳng định.

- [ ] **Step 1–6:** vòng TDD như các task trên. Phá thử: bỏ tên đơn vị mới ở tóm tắt → đỏ. Commit `feat(to-chuc): nhập bảng tính theo ba bước`

### Task 7: Dời bài kiểm đã ký sang bố cục mới

**Files:**
- Modify: `apps/app/test/to-chuc.dom.tsx`, `sua-luu-tru.dom.tsx`, `noi-bon-nut.dom.tsx`. Các hàm trợ giúp `moToChuc()`, `timMenu()` và `thuTuBoPhan()` nhận thêm tham số `don?: string` để dựng màn với `?don=`. Bài nào làm việc với phòng ban trong một bộ phận thì mở `?don=bp:<id>`. Giữ nguyên tên bài và mọi `expect`.
- Test: chính ba tệp trên.

- [ ] **Step 1:** Chạy ba tệp trên nhánh hiện tại → ghi lại bài nào đỏ.
- [ ] **Step 2:** Sửa phần trợ giúp và chỗ mở màn cho từng bài đỏ. Không đổi câu khẳng định, trừ câu gộp cũ của lượt 1 mà AC-8 đổi.
- [ ] **Step 3:** Chạy lại → PASS. So số `expect` mỗi bài trước và sau bằng `node _acceptance/to-chuc-danh-sach-chi-tiet/rang/khong-hoi-quy.mjs --chi-dem`.
- [ ] **Step 4: Commit** `test(to-chuc): dời bài kiểm đã ký sang bố cục danh sách – chi tiết`

### Task 8: Phép đo của hồ sơ — Chrome, không hồi quy, sàn thiết kế; cấu hình

**Files:**
- Create: `_acceptance/to-chuc-danh-sach-chi-tiet/rang/man-chi-tiet.mjs`. Chép khuôn từ `_acceptance/cau-truc-to-chuc/rang/man-to-chuc.mjs`, kể cả tự đăng nhập quản trị, cổng mặc định 3710/3711 và `canhCay`. Hằng `KY_MONG = 36`, `O_MONG = 10`.
- Create: `rang/khong-hoi-quy.mjs`. Với ba hồ sơ đã ký, rút tên bài từ `evals.yaml` của chúng (tệp và `-t`), rồi so tên bài, số `expect` và tập chuỗi ghim giữa `git merge-base HEAD origin/onehub` và HEAD. Sau đó kiểm `run-log.jsonl` của ba hồ sơ có dòng `repin` mới với `evals_exit` đủ. Cờ `--chi-dem` chỉ in số đếm.
- Create: `rang/san-thiet-ke.mjs`. Chép khuôn của `cau-truc-to-chuc`. Quét `className` trên mọi phần tử JSX có tên viết hoa dưới `settings/organization`. Danh sách tệp `packages/ui` được phép rút từ dòng «Thành phần dùng chung được sửa» của kế hoạch này.
- Modify: `_acceptance/config.yaml` — thêm `executors.test.tdc_*` (mỗi eval một khoá, lệnh chạy `bun test … -t <khối>`) và `executors.script.tdc_man_chrome` (bọc bằng `scripts/lan-do/tien-de.mjs`, mặc định cổng 3710/3711), `tdc_khong_hoi_quy`, `tdc_san_thiet_ke`.
- Modify: `docs/api.md`, mục «The organization tree» — thêm hai thủ tục ghi hàng loạt.

- [ ] **Step 1:** Viết ba script.
- [ ] **Step 2: Chiều đỏ của từng script.**
  - `san-thiet-ke`: dùng tệp tạm có `<Button className="justify-start">` → exit 1 «className trên Button».
  - `khong-hoi-quy`: xoá một `expect` trong bản gương → «bài <tên> mất khẳng định».
  - `man-chi-tiet`: bỏ `translate="no"` ở tên người trong bản gương → đỏ.
- [ ] **Step 3:** Chạy cả ba trên cây lành → exit 0. Script Chrome chạy với máy chủ của cây ở 3710/3711.
- [ ] **Step 4: Commit** `test(to-chuc-danh-sach-chi-tiet): phép đo Chrome, không hồi quy, sàn thiết kế`

### Task 9: Ghim lại ba hồ sơ đã ký, năm lệnh chứng, chuyển sang S4

- [ ] **Step 1:** Chạy đủ năm lệnh chứng, tất cả xanh.
- [ ] **Step 2:** Chạy làn ghim lại cho ba hồ sơ: `repin-lane.mjs --slug cau-truc-to-chuc --slug sua-luu-tru-dieu-phoi --slug noi-bon-nut-dieu-phoi --write` → làn xanh. Commit `repin(...)`.
- [ ] **Step 3:** Chạy `khong-hoi-quy.mjs` đầy đủ → exit 0. Chạy `bash scripts/pre-merge-check.sh . --base origin/onehub` cho toàn kho → sạch.
- [ ] **Step 4:** Đặt hợp đồng sang `status: implemented`, rồi chuyển S4.
