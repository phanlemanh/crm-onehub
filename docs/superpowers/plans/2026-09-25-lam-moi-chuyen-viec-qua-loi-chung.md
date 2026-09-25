# Làm mới sau «Chuyển việc 30 ngày» qua lối chung — kế hoạch

> **For agentic workers:** thực thi tuần tự trong vòng chính (feature-loop S3, mặc định kit).
> Bốn task phụ thuộc nhau theo thứ tự đo: thước «giữ nguyên» phải xanh trên mã CŨ trước khi mã đổi.

**Goal:** `chuyen-viec-dialog.tsx` làm mới qua `useCrmCache().workTransferred()`; hành vi không đổi.

**Architecture:** thêm mục `workTransferred` vào `CrmCache` (`run([3 khoá], [], options)`), dialog
gọi nó trong `onSuccess`. Đo bằng test DOM với `cache.ts` thật trên proxy tRPC thật, soi cú pháp,
và quét không-hồi-quy các eval đã ký.

**Tech Stack:** Next.js app router client component, TanStack Query 5, tRPC 11.18
(`@trpc/tanstack-react-query` `createTRPCOptionsProxy`), bun test + jsdom (`*.dom.tsx`), TypeScript
compiler API cho soi mã.

**Spec:** `docs/superpowers/specs/2026-09-25-lam-moi-chuyen-viec-qua-loi-chung-design.md` ·
hợp đồng `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/contract.md` · evals cùng thư mục.

## Global Constraints

- Không viết chú thích trong mã (AGENTS.md).
- Mục mới trong `cache.ts` tên `workTransferred`, chữ ký `workTransferred(options?: Options): Promise<void>`.
- Ba khoá, đúng thứ tự: `trpc.onboarding.manDanhMuc.queryKey()`, `trpc.onboarding.bangCot.queryKey()`,
  `trpc.onboarding.transferPreview.queryKey()`; nhóm `rest` rỗng.
- Không sửa `apps/app/test/moi-phia-ke-hoach.dom.tsx`.
- Thước `rang/*.mjs` suy gốc kho từ `import.meta.url`.
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture, thông điệp ghim (MEASURE-BIRTH-CLAUSE).
- Phá-thử tại chỗ chỉ sau khi commit; hoàn nguyên bằng `git checkout -- <tệp>`.

## Review Focus

- Mutation lỗi rồi thành công ở lần bấm sau — lần sau vẫn phải làm mới đủ ba khoá (E3 ca hai lần bấm).
- Hộp bị đóng khi đang chờ làm mới (Esc/nút Huỷ) — `onOpenChange` chặn khi `chuyen.isPending`; không đổi, E2 giữ.
- Tải lại xem trước treo — hộp phải chờ, không đóng sớm (E2).
- Mock Proxy `useCrmCache` của `moi-phia-ke-hoach.dom.tsx` trả hàm async cho mọi tên — E5 chạy `kh2_chuyen_giao_man`.
- `messages-guard.spec.ts` không liên quan (không thêm chuỗi) — suite toàn kho ở S4 xác nhận.

---

### Task 1: Test DOM «giữ nguyên» (E1, E2, E3) — xanh trên mã cũ

**Files:** Create `apps/app/test/lam-moi-chuyen-viec.dom.tsx`; Modify `_acceptance/config.yaml` (đã có ba khoá `lmcv_*` từ S1).

**Interfaces:** Consumes `ChuyenViecDialog({ nguoi, onDong })` từ `@/app/(app)/[slug]/settings/members/chuyen-viec-dialog`; `useCrmCache` thật.

- [ ] Viết tệp: `mock.module("@/lib/trpc/client", () => ({ useTRPC: () => proxy }))` với
  `proxy = createTRPCOptionsProxy<AppRouter>({ client: createTRPCClient<AppRouter>({ links: [linkGia] }), queryClient })`;
  `linkGia` trả `observable` theo `op.path` từ bảng `traLoi: Map<string, (input) => unknown | Promise<unknown>>`,
  đếm lượt gọi theo đường. `QueryClient` riêng mỗi ca, `invalidateQueries` bọc để ghi `queryKey`.
  Gieo chín query bằng `queryClient.setQueryData(proxy.<đường>.queryKey(input), …)`.
  Ba `describe`: `ba-khoa`, `dong-sau-lam-moi`, `loi-khong-lam-moi` — assert đúng như `expected` E1–E3.
- [ ] Chạy: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/lam-moi-chuyen-viec.dom.tsx`
  → 3 pass trên mã CŨ (phép đo giữ nguyên).
- [ ] Commit.

Phục vụ E1, E2, E3 · independent: false (T3 phá-thử dựa vào nó).

### Task 2: Thước soi mã (E4) — đỏ trên mã cũ

**Files:** Create `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/soi-ma.mjs`.

- [ ] Viết theo khuôn `_acceptance/thanh-vien-hai-khoi-cung-khuon/rang/lam-moi.mjs` (TS compiler API), ma trận 6 dòng + đối chứng âm trong lệnh (3 vi phạm).
- [ ] Chạy `bun _acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/soi-ma.mjs` → mã 1, các dòng SAI như chiều đỏ E4.
- [ ] Commit.

Phục vụ E4 · independent: false.

### Task 3: Dời làm mới vào `cache.ts`

**Files:** Modify `apps/app/lib/trpc/cache.ts` (kiểu `CrmCache` + đối tượng trả về), `apps/app/app/(app)/[slug]/settings/members/chuyen-viec-dialog.tsx:15,47,77-83`.

```ts
workTransferred(options?: Options): Promise<void>;
```
```ts
workTransferred: (options) =>
	run(
		[
			trpc.onboarding.manDanhMuc.queryKey(),
			trpc.onboarding.bangCot.queryKey(),
			trpc.onboarding.transferPreview.queryKey(),
		],
		[],
		options,
	),
```
```tsx
const cache = useCrmCache();
…
await cache.workTransferred();
dong();
```
Bỏ `useQueryClient` khỏi import; thêm `import { useCrmCache } from "@/lib/trpc/cache";`.

- [ ] Sửa; chạy Task 1 (3 pass) + Task 2 (`6 DUNG, 0 SAI`, và lần nữa từ `/tmp`) + `bun run check-types` ở `apps/app`.
- [ ] Commit, rồi phá-thử (tại chỗ, hoàn nguyên bằng `git checkout`): bỏ `transferPreview` khỏi mục → E1 đỏ «Expected dung ba khoa lam moi»; thêm `planById` → E1 đỏ «onboarding.planById khong bi danh dau cu»; `run([], [3 khoá], { settle: "record" })` → E2 đỏ «hop dong truoc khi lam moi xong»; bỏ `await` → E2 đỏ cùng thông điệp; làm mới trong `onSettled` → E3 đỏ «khong lam moi khi loi».

Phục vụ E1–E4 · independent: false.

### Task 4: Quét không-hồi-quy (E5)

**Files:** Create `_acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs`.

- [ ] Viết theo năm bước của `expected` E5 (khuôn `ho-so-cham.mjs` của nhánh `feat/tra-loi-tin-nhac`, rút theo `paths` của từng eval).
- [ ] Chạy nền `bun _acceptance/lam-moi-chuyen-viec-qua-loi-chung/rang/khong-hoi-quy.mjs > <nháp>/khq.log` → «khong lenh nao do them», mã 0.
- [ ] Commit, rồi phá-thử: xoá `chuyen.mutate(...)` → mã 1 ghi `kh2_chuyen_giao_man` (`moi-phia-deu-thay-ke-hoach:E3`); bản sao script với đối chứng rút trên tập rỗng → mã 1 «bo rut tap hong».

Phục vụ E5 · independent: false.
