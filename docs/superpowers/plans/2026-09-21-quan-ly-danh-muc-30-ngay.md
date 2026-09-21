# Kế hoạch: quản lý danh mục 30 ngày đầu

Hợp đồng: `_acceptance/quan-ly-danh-muc-30-ngay/contract.md` (T2, 14 AC).
Thiết kế: `docs/superpowers/specs/2026-09-21-quan-ly-danh-muc-30-ngay-design.md`.

## T1 — API (AC-1…AC-5, AC-7…AC-10, AC-12, AC-14)

- `onboarding.contracts.ts`: `planListInput` bỏ `departmentId`, thêm `boPhan[]`
  (bộ phận của bước đang tắc), `nguoiCam[]`, trạng thái `tat-ca`; `pageSize` mặc
  định lấy từ `ONBOARDING.danhMuc.pageSize`. Thêm `ST-danhmuc-khongkhop`,
  `bangCotInput/Output`.
- `onboarding-danh-muc.ts` (mới, thuần): dựng hàng, lọc, đếm bộ lọc, sắp toàn tập
  với thứ tự phụ theo id, cắt trang, chia cột bốn cách, cắt thẻ theo
  `ONBOARDING.bangCot.tranThe`.
- `onboarding.service.ts`: `listPlans` tải tập đã tìm một lần rồi lọc/đếm/sắp/cắt
  trong bộ nhớ; `manDanhMuc` suy trạng thái từ `total` và cờ đang lọc; thủ tục mới
  `bangCot` (không phân trang).
- Bài kiểm: `apps/api/test/quan-ly-danh-muc.spec.ts`, mười một ca theo tên trong
  `evals.yaml`; chiều đỏ chạy bằng đột biến từng ca.
- Bài kiểm cũ của `dieu-phoi-30-ngay-dau` (`dieu-phoi.spec.ts`) đổi `departmentId`
  sang `boPhan: [id]`; ca `chua-co-khuon` nay đo trên DB rỗng thật như E9 cũ viết.

## T2 — `@crm/ui` (AC-11, AC-12, AC-13)

- `packages/ui/src/components/board.tsx`: bảng cột chỉ để xem — cột có tiêu đề và
  số đếm, thẻ là liên kết, «còn N thẻ», «Trống», cuộn ngang trong khung riêng.
- `data-table.tsx`: tách menu bộ lọc thành `DataTableFacetMenu` xuất ra, để dạng
  bảng cột dùng lại đúng thanh lọc của bảng.

## T3 — màn danh mục (AC-1, AC-6, AC-11, AC-12, AC-13)

- `onboarding-search-params.ts`: `danhMucSearchParams = createListSearchParams`
  với bộ lọc `boPhan`, `nguoiCam`; `onboardingParsers` giữ `trangThai`, thêm
  `cachXem`, `cachChia`. `SEARCH_PARAM.onboarding` bỏ `boPhan` (nay do khung chung
  sở hữu).
- `danh-muc-table.tsx`: `DataTable` + `ListSearch` + nút trạng thái + nút đổi cách
  xem; dạng bảng cột dùng `Board`. «Không kế hoạch nào khớp» + «Bỏ lọc» ở cả hai
  dạng. Hàng và thẻ mở hồ sơ kế hoạch.
- `page.tsx`: nạp tham số bằng loader, prefetch đúng đầu vào.
- Bài kiểm: `apps/app/test/danh-muc-quan-ly.dom.tsx` (-t khong-khop, duong-dan,
  the-chi-de-xem, tran-cot); cập nhật `dieu-phoi-trang-thai.spec.ts`
  (bo-loc-duong-dan) theo bộ phân tích mới.

## Khi ship

Ghim lại `dieu-phoi-30-ngay-dau` bằng làn eval (bài kiểm của nó đã đổi) cùng lượt
với hồ sơ này.
