# Quét độ phủ — loc-don-vi-khong-tu-dong (preset test-matrix)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, khu Mục tiêu › Bộ OKR (trang Theo đơn vị, kiểu xem danh sách) — chân sản phẩm: đào repo
  (`apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`, `packages/ui/src/components/data-table.tsx`) · chân ngành:
  [NGÀNH: TanStack Query — «Paginated / Lagged Queries», `placeholderData: keepPreviousData`] giữ dữ liệu cũ trong lúc
  truy vấn mới chạy; tiền lệ đã ký trong kho `_acceptance/tai-lieu-loc-giu-lich-su` (AC-2, AC-5).

## Trục

- Trục A — thao tác lọc: chọn một giá trị | bỏ chọn một giá trị | «Bỏ lọc» trong một mặt | «Bỏ lọc» toàn bảng (khung
  không khớp) | lọc nhanh (thẻ, lọc tại chỗ không gọi máy) [thước CE: SUY-TỪ-REPO `packages/ui/src/components/data-table.tsx`
  `FacetSubmenu`, `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx`]
- Trục B — nơi điều khiển lọc: 1440 menu thả xuống | 390 khung Lọc thu gọn (nút `aria-expanded`) chứa cùng menu
  [thước CE: SUY-TỪ-REPO `data-table.tsx` `filtersOpen`]
- Trục C — truy vấn mới: còn chờ | về có dòng | về rỗng | lỗi [thước CE: SUY-TỪ-REPO `_acceptance/tai-lieu-loc-giu-lich-su/contract.md`]
- Trục D — đổi thứ không phải lọc (đối chứng): đổi đơn vị | đổi chu kỳ | đổi kiểu xem [thước CE: SUY-TỪ-REPO
  `_acceptance/khung-cho-don-vi-mot-hinh/contract.md` AC-1–AC-3]

## Core

1. A chọn × B 1440 × C còn chờ — menu và menu con không đóng, chọn được giá trị thứ hai (AC-1).
2. A chọn × B 390 × C còn chờ — khung Lọc không thu lại (AC-2).
3. A chọn × C còn chờ → về có dòng — bảng không bị gỡ, mờ và bận rồi hết (AC-3).
4. A chọn / «Bỏ lọc» toàn bảng × C về rỗng — khung không khớp, menu vẫn mở; bỏ lọc không qua khung chờ (AC-4).
5. A chọn × C lỗi — khung lỗi có Thử lại (AC-5).
6. D đổi đơn vị, đổi chu kỳ — vẫn đi khung chờ hình bảng của DH12, không giữ bảng của đơn vị cũ (AC-6).
7. Lớp chung: `DataTable` của `packages/ui` nhận cờ tải lại, trang khác không đổi DOM (AC-7).

## Later

- Bỏ chọn và «Bỏ lọc» trong một mặt × 390: cùng đường mã với «chọn» (một hàm `onChange` của mặt lọc), đo ở 1440 là đủ.
- Lọc theo đường dẫn ghi lịch sử trình duyệt (`history: push`) như Tài liệu — việc khác, không phải lời giao của DH13.

## Never

- Lọc nhanh (thẻ) — lọc tại chỗ trên dòng đã có, không gọi máy nên không bao giờ qua khung chờ.
- Đổi kiểu xem (cây, họp tuần, chấm điểm) — mỗi kiểu có khung riêng, không dùng `danhSach`.

## Cross-cutting áp mọi ô Core

- Tiêu điểm bàn phím ở lại trên mục vừa chọn trong menu (menu không bị gỡ).
- `aria-busy` chỉ trên vùng bảng, không trên hàng công cụ.
