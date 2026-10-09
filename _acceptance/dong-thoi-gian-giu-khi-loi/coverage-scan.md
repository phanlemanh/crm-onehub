# Coverage scan — dong-thoi-gian-giu-khi-loi

## Ngữ cảnh
- Sản phẩm: CRM nội bộ OneHub, tab Hoạt động của ngăn bản ghi — chân sản phẩm: đào repo (`apps/app/components/crm/timeline/timeline.tsx`, `apps/api/src/activities/activities.service.ts` phân trang theo `cursor`, 30 mục/trang) · chân ngành: TanStack Query «Infinite Queries» (cờ `isFetchNextPageError`/`isRefetchError`), Nielsen Norman Group «Error-Message Guidelines».
- Preset: `test-matrix` — bài toán là liệt kê đủ trạng thái × lối tải của một truy vấn vô hạn.

## Trục
- Trục A — lối tải: trang đầu | trang kế («Xem cũ hơn») | làm mới nền   [thước CE: ba cờ lỗi của TanStack Query v5 — SUY-TỪ-REPO: `apps/app/package.json` (`@tanstack/react-query`); NGÀNH: TanStack Query «Infinite Queries»]
- Trục B — kết cục: thành công | lỗi | thử lại thành công | thử lại lỗi lần nữa   [thước CE: bảng trạng thái design doc mục 3; NGÀNH: NN/g Error-Message Guidelines — lỗi phải thấy được và giữ việc người dùng đang làm]
- Trục C — khổ × ngôn ngữ: 1440 vi | 390 vi | en   [thước CE: khổ đo của kho (`_acceptance/config.yaml` các răng màn) — SUY-TỪ-REPO]

## Không gian (A × B, 12 ô)

| | thành công | lỗi | thử lại thành công | thử lại lỗi lần nữa |
| --- | --- | --- | --- | --- |
| trang đầu | giữ (K6b) | giữ (K6b AC-1) → AC-4 | giữ (K6b) | Later — đã đúng ở K6b, không đổi |
| trang kế | có sẵn | **Core** AC-1 | **Core** AC-2 | **Core** AC-2 |
| làm mới nền | có sẵn | **Core** AC-3 | **Core** AC-3 | Later — cùng nhánh mã với AC-3 |

Trục C cắt qua các ô Core: 1440/390 ở AC-6 (ô trang kế · lỗi), en ở AC-5 (hai thông báo).

## Core
1. trang kế · lỗi — chính lỗi Ngoài-1/Ngoài-5 của K6b: danh sách biến mất.
2. trang kế · thử lại — «Thử lại» phải tải đúng trang thiếu, không tải lại trang đầu.
3. làm mới nền · lỗi — cùng nhánh `isError` sai, thay danh sách đang đọc.

## Later
- làm mới nền · thử lại lỗi lần nữa — cùng nhánh mã với AC-3; bài kiểm phủ lối thành công.
- truy vấn «Việc cần làm» (`pinned`) lỗi — lớp «lỗi hiện như rỗng» còn lại; tách hàng nếu anh muốn.

## Never
- Tự tải khi cuộn tới cuối — đổi tương tác, không phải lỗi.

## Cross-cutting áp mọi ô Core
- Không in lỗi thô; thông báo `role="alert"`; nút «Thử lại» là `KaraRetry` và tắt khi đang tải.
