---
schema_version: 1
feature: Màn Deals hydrat khớp máy chủ — ô Giai đoạn hết lệch «QUALIFIED_TO_BUY» ↔ «Qualified to buy», hết lỗi «Hydration failed» chập chờn khi tải /deals
slug: hydrat-giai-doan-deals
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-09-30-hydrat-giai-doan-deals-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-30T10:39:05Z
---

# Acceptance Contract: hydrat-giai-doan-deals

## Context

Phép đo màn `hop-thoai-giu-cho-dang-nhap/rang/man-giu-cho.mjs` (bước 3 mở `/deals`) bắt
được lỗi React «Hydration failed because the server rendered text didn't match the
client» chập chờn. Nhật ký máy chủ của lượt đo cũ cho diff: ô Giai đoạn trong bảng Deals,
máy chủ vẽ `QUALIFIED_TO_BUY` với sắc `neutral`, trình duyệt vẽ «Qualified to buy» với
sắc `info`.

Gốc: ngăn «Thoả thuận mới» ở đầu trang tạo sẵn truy vấn `giaiDoan.list` (và `users.list`,
`users.me`, `currency.settings`) khi đang đóng. `HydrationBoundary` của bảng hoãn nạp dữ
liệu cho truy vấn đã tồn tại sang effect — trên máy chủ effect không chạy nên ô luôn vẽ mã
thô; trên trình duyệt ô vẽ nhãn hay mã tuỳ lượt tải của đầu trang về trước hay sau. Cách
sửa: ngăn đóng không tạo truy vấn nào; truy vấn sinh khi ngăn mở. Chi tiết ở design doc.

Source input: yêu cầu của chủ kho 30/09 — tìm thành phần vẽ chữ khác nhau giữa máy chủ và
trình duyệt trên `/deals`, sửa ở gốc, chứng bằng chính phép đo `man-giu-cho` thoát 0; sửa
xong thì `khung-tao-okr-nhu-deal` bỏ lớp bọc hạn chế E17.

«Cây giai đoạn» dưới đây là cây thu nhỏ đúng thứ tự của `page.tsx`: ngăn tạo deal (đóng)
đứng trước một `HydrationBoundary` mang dữ liệu `giaiDoan.list`, trong đó có ô giai đoạn
(`DealStageIndicator`) của một deal ở giai đoạn `QUALIFIED_TO_BUY`, nhãn «Qualified to
buy», loại `OPEN`.

## Criteria

- AC-1: Given cây giai đoạn và cache phía máy chủ trống, When máy chủ render cây, Then HTML của ô giai đoạn chứa nhãn «Qualified to buy» với `data-tone="info"`; And HTML không có chữ `QUALIFIED_TO_BUY` nào ngoài thuộc tính.
- AC-2: Given HTML máy chủ của cây giai đoạn và cache phía trình duyệt đã có dữ liệu `giaiDoan.list` trước khi vùng bảng hydrat (lượt tải của đầu trang về trước), When trình duyệt hydrat, Then React không báo lỗi hydrat nào (bắt cả `onRecoverableError` lẫn `console.error`); And ô giai đoạn hiện «Qualified to buy».
- AC-3: Given HTML máy chủ của cây giai đoạn và cache phía trình duyệt trống, When trình duyệt hydrat, Then React không báo lỗi hydrat nào; And ô giai đoạn hiện «Qualified to buy» ngay sau lượt hydrat, không qua mã thô.
- AC-4: Given ngăn tạo deal đóng, When render, Then cache TanStack không có truy vấn nào của `giaiDoan.list`, `users.list`, `users.me`, `currency.settings`; And khi ngăn mở thì đủ bốn truy vấn đó và ô Giai đoạn của form chọn sẵn giai đoạn mở đầu tiên.
- AC-5: Given ngăn tạo deal mở và người dùng đã gõ tên «Hợp đồng kho lạnh», When đóng ngăn rồi mở lại, Then ô tên vẫn là «Hợp đồng kho lạnh»; And sau khi tạo thành công thì tên, số tiền, tiền tệ, ngày chốt trở về trống còn công ty giữ nguyên — như trước vòng.
- AC-6: Given ứng dụng thật trên phiên đo riêng và ba deal của lượt đo, mỗi deal ở một giai đoạn thuộc một loại `OPEN`, `WON`, `LOST`, When lấy HTML máy chủ của `/deals` và `/deals?view=board` lọc theo ba deal đó, Then không nút chữ nào là mã giai đoạn thô (mã khác nhãn của nó); And bảng có đúng ba ô giai đoạn, bằng số dòng `deals.list` trả cho cùng phiên, mỗi ô mang đúng nhãn và sắc của loại (`OPEN` → `info`, `WON` → `success`, `LOST` → `error`); And mỗi tiêu đề cột Kanban là nhãn một giai đoạn; And bộ nghe lỗi hydrat bắt được một lỗi cố ý (đối chứng dương); And qua N lượt tải Chrome ở 1440 cả hai màn, không lỗi hydrat nào (bắt cả `pageerror` lẫn `console.error`); And sau tải, chữ các ô giai đoạn trong bảng bằng chữ trong HTML máy chủ; And có ảnh bảng.
- AC-7: Given cây sau vòng, When chạy `man-giu-cho.mjs` của `hop-thoai-giu-cho-dang-nhap` qua `scripts/lan-do/tien-de.mjs` bằng đúng lệnh `kto_man_giu` của E17 sau khi gỡ lớp bọc, Then kịch bản thoát 0, đủ bảy bước «dat» và không in dòng «loi console app».
- AC-8: Given lỗi đã sửa, When đọc hồ sơ `khung-tao-okr-nhu-deal`, Then lệnh `kto_man_giu` của E17 chạy thẳng `man-giu-cho.mjs` trong phiên đo riêng, không qua lớp bọc; And tệp `rang/giu-cho-han-che.mjs` không còn; And `expected` và `paths` của E17 không nhắc lớp bọc hay lỗi hydrat Deals; And hợp đồng hồ sơ đó ghi hạn chế E17 đã gỡ, trỏ về hồ sơ này.
- AC-9: Given cây sau vòng, When chạy bộ kiểm của kho (`test`, `check-types`, `lint`, `lint:slop`, `build`), Then tất cả xanh.

## Coverage

Bỏ quét `morphological-scan` — xem entry `descope` «bỏ coverage-scan» trong
`decisions.jsonl`. Không gian nhỏ, liệt tay đủ:

- Trục A — cache máy chủ trước khi vùng bảng render: truy vấn chưa có | truy vấn rỗng (đang chờ) | có dữ liệu [thước CE: ba nhánh của `HydrationBoundary` TanStack 5 — mới / đã tồn tại / đã tồn tại mà mới hơn]
- Trục B — cache trình duyệt lúc vùng bảng hydrat: trống | truy vấn rỗng | có dữ liệu [thước CE: như trên]
- Trục C — ngăn tạo deal: đóng | mở
- Trục D — màn: bảng | Kanban (`?view=board`)
- Trục E — lớp đo: DOM (cache dựng có chủ đích) | ứng dụng thật (máy chủ Next, Chrome)
- Core: A-chưa có (sau sửa, vì ngăn đóng không tạo truy vấn) × máy chủ render (AC-1); × B-có dữ liệu (AC-2); × B-trống (AC-3); C đóng/mở (AC-4, AC-5); ứng dụng thật × bảng/Kanban (AC-6, AC-7).
- Later: A-rỗng do một thành phần khác ngoài vùng bảng tạo `giaiDoan.list` — hiện không còn thành phần nào như vậy trên `/deals` sau vòng; AC-4 chỉ khoá ngăn tạo deal.

## Out of scope

- Ba ngăn tạo cùng khuôn (`create-company-sheet`, `create-contact-sheet`, `create-campaign-sheet`) tạo `users.list` khi đóng — chưa thấy chữ lệch trên màn của chúng; việc riêng.
- Lỗi hydrat khác đã thấy trong nhật ký đo cũ (ô chọn «Chu kỳ» trên màn OKR).
- Đổi `HydrateClient` hay ngữ nghĩa hydrat của TanStack cho toàn ứng dụng.
- Đổi giao diện ngăn tạo deal hay bảng Deals.

## Notes

- Tái hiện 30/09: `man-giu-cho` trên bản `9cda3569` thoát 1 với đúng lỗi này; trên `6e431a01` thoát 0 một lượt. Đầu dò tải `/deals` hai lượt không bắt được lỗi ở cả hai bản — lỗi phụ thuộc tải máy, nên chiều đỏ tất định của vòng nằm ở HTML máy chủ (AC-1, AC-6), không ở số lỗi console.
- S3 (30/09): test DOM chạy trên mã trước sửa đỏ đúng dự đoán — e2 in lại nguyên diff của lượt E17 thật (`data-tone` info/neutral, «Qualified to buy»/`QUALIFIED_TO_BUY`); e1, e3, e4 đỏ; e5 xanh (nháp giữ như cũ). Sau sửa bảy ca xanh. Chiều đỏ tự động E1d: «DO DUNG GHIM: e1 e2 e3 e4».
- S3: `man-deals.mjs` 14 kiểm 0 hỏng, 0/12 lượt lỗi hydrat, đối chứng bộ nghe bắt 1 lỗi cố ý; bản sao với ngăn trước vòng lộ 3 mã thô ở bảng và 10 ở Kanban (cả bảy tiêu đề cột) trong HTML máy chủ — chiều đỏ tất định.
- S3: `man-giu-cho` thoát 0 hai lần sau sửa (một lần bằng lệnh `kto_man_giu` mới, chạy song song với một phiên đo khác).
