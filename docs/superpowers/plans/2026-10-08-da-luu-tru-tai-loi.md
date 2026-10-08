# «Đã lưu trữ» báo lỗi tải — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Khối «Đã lưu trữ» ở Cài đặt › Giai đoạn hiện lỗi tải kèm «Thử lại» và khung xương lúc đang tải.

**Architecture:** Chỉ sửa `DaLuuTruGiaiDoan` trong `giai-doan-settings.tsx`; trạng thái suy từ `useQuery` của `giaiDoan.archived` (`data`, `errorUpdateCount`, `isFetching`). Thành phần bậc 1: `Empty`, `Skeleton`, `Button`.

**Tech Stack:** React 19, TanStack Query 5, bun test + jsdom, puppeteer-core.

**Spec:** `docs/superpowers/specs/2026-10-08-da-luu-tru-tai-loi-design.md` · hợp đồng `_acceptance/da-luu-tru-tai-loi/contract.md` (duyệt 2026-10-08T09:07:14Z).

## Global Constraints

- Không chú thích trong mã. Chỉ ghi trong ranh giới E3b; `settings.ts` và `config.yaml` chỉ thêm (P3-29).
- Chữ mới: `giaiDoan.loiTaiDaLuuTru` — vi «Không tải được danh sách giai đoạn đã lưu trữ», en «Couldn't load archived stages»; dùng lại `loiTaiMoTa`, `thuLai`.
- Phép đo mới có cặp hai chiều trên cùng fixture, thông điệp ghim.

## Review Focus

1. Tải lại khi chưa có dữ liệu: khung lỗi phải còn (không nháy khung xương) — E3 dòng 1.
2. Tải lại thành công sau lỗi rồi lỗi ở lần làm mới sau (đã có dữ liệu): giữ mục gập với dữ liệu cũ, không hiện khung lỗi — ca kiểm thêm trong Task 1.
3. Bấm «Thử lại» liên tục: nút khoá theo `isFetching`, không phát nhiều yêu cầu song song.

---

### Task 1: Trạng thái lỗi và đang tải của «Đã lưu trữ»

independent: false · phục vụ E1–E5, E7

**Files:** Modify `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`, `apps/app/lib/messages/settings.ts`; Create `apps/app/test/da-luu-tru-tai-loi.dom.tsx`.

- [ ] Bài kiểm đỏ: dựng `GiaiDoanSettings` với `QueryClient` thật (retry false) và trpc giả theo khuôn `giai-doan-cai-dat.dom.tsx`, `archived` có queryFn điều khiển được (lỗi / treo / trả). Năm describe theo `evals.yaml` (`loi`, `thu-lai`, `van-loi`, `dang-tai`, `khong-quan-tri`) + ca Review Focus 2.
- [ ] Chạy đỏ: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/da-luu-tru-tai-loi.dom.tsx`.
- [ ] Cài:
  ```tsx
  const chuaCo = daCat.data === undefined;
  if (chuaCo && daCat.errorUpdateCount > 0) return <Empty border="solid" data-da-luu-tru-loi>…<Button variant="outline" disabled={daCat.isFetching} onClick={() => void daCat.refetch()}>{t.thuLai}</Button></Empty>;
  if (chuaCo) return <Skeleton className="h-8 w-40" data-da-luu-tru-dang-tai />;
  ```
  rồi `ArchivedList` như cũ.
- [ ] Chạy xanh + `giai-doan-cai-dat.dom.tsx` (không sửa kỳ vọng) + `messages-guard.spec.ts`.
- [ ] Phá-thử: bản tại chỗ (đã commit trước) chia theo `isError`/`isPending` → E3 dòng 1 đỏ «khung loi nhay sang khung xuong khi thu lai»; bỏ khung lỗi → E1 đỏ «loi tai da luu tru bi giau»; trả rỗng lúc đang tải → E4 đỏ «dang tai tra rong».
- [ ] Commit.

### Task 2: Thước và khoá executor

independent: false · phục vụ E6, E7 và mọi khoá

**Files:** Modify `_acceptance/config.yaml` (khoá `dlt_`); Create `_acceptance/da-luu-tru-tai-loi/rang/do-man.mjs`.

- [ ] Khoá test `dlt_loi|dlt_thu_lai|dlt_van_loi|dlt_dang_tai|dlt_khong_quan_tri` (`-t <describe>`), `dlt_hoi_quy` (git diff --quiet so `cf003458` trên `giai-doan-cai-dat.dom.tsx` + chạy tệp + `design-gate --mode static` cho `giai-doan-settings.tsx`); script `dlt_do_man` theo khuôn `dsk_do_man`.
- [ ] `do-man.mjs`: khuôn `danh-sach-keo-chung/rang/do-man.mjs`; `page.setRequestInterception(true)`, đọc tên thủ tục từ đường `/api/trpc/<a,b>`; chỉ chặn/giữ yêu cầu mang đúng `giaiDoan.archived`, đi chung lô → mã 2; bốn ô `loi-1440`, `loi-375`, `dang-thu-lai-1440`, `thu-lai-1440`; tạo một giai đoạn đã lưu trữ qua db, dọn sau.
- [ ] Chạy một lượt thật qua `mot-luot.sh`; ghi chiều đỏ (đỉnh E3) nếu đo được.
- [ ] Commit; contract `implemented`; vào S4.
