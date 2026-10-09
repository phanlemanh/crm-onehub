# Coverage scan — dong-thoi-gian-loi-dung-luot

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, tab Hoạt động của ngăn bản ghi — chân sản phẩm: đào repo (`apps/app/components/crm/timeline/timeline.tsx` sau K6c, `@tanstack/query-core` 5.101 `infiniteQueryObserver.js`) · chân ngành: TanStack Query «Infinite Queries» (cờ `isFetchNextPageError`/`isRefetchError` suy từ `fetchMeta` của lượt hiện tại).
- Preset: `test-matrix`.

## Trục
- Trục A — lỗi đang hiện trước: không | xem cũ | làm mới   [thước CE: hai thông báo của K6c — SUY-TỪ-REPO: timeline.tsx]
- Trục B — lượt kế tiếp: xem cũ | làm mới   [thước CE: hai lối tải của useInfiniteQuery — NGÀNH: TanStack Query «Infinite Queries»]
- Trục C — thời điểm quan sát: đang chạy | xong thành công | xong lỗi   [thước CE: bảng trạng thái design doc mục 3]

## Không gian (A × B × C, 18 ô)

| Lỗi trước \ lượt kế | xem cũ: đang chạy / được / lỗi | làm mới: đang chạy / được / lỗi |
| --- | --- | --- |
| không | K6c / K6c / K6c | K6c / K6c / K6c |
| xem cũ | K6c (thử lại) | **Core** AC-2 ×3 |
| làm mới | **Core** AC-1 ×3 | **Core** AC-3 (thử lại) |

## Core
1. làm mới → xem cũ (3 thời điểm) — AC-1: lỗi sai lượt lúc đang chạy, cảnh báo làm mới tắt sai.
2. xem cũ → làm mới (3 thời điểm) — AC-2.
3. làm mới → làm mới (thử lại) — AC-3: chỉ lượt làm mới thành công mới tắt cảnh báo.
4. Đổi khoá (tab) — AC-4: trạng thái nhớ lỗi không được theo sang truy vấn khác.

## Later
- «Việc cần làm» (`pinned`) lỗi — ngoài dòng lịch sử.

## Never
- Hiện cả lỗi «đang chạy» bằng chỉ báo riêng — nút «Xem cũ hơn» đã có chỉ báo đang tải.

## Cross-cutting áp mọi ô Core
- Thông báo chỉ đổi khi `!isFetching`; chữ, vị trí, thành phần giữ như K6c (AC-5 canh).
