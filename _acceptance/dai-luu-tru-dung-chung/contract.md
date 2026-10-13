---
schema_version: 1
feature: Dải báo «Đã lưu trữ» và vùng khoá chỉ đọc là một mảnh dùng chung trong packages/ui
slug: dai-luu-tru-dung-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-13T17:04:31Z
design_doc: docs/superpowers/specs/2026-10-13-dai-luu-tru-dung-chung-design.md
---

# Acceptance Contract: dai-luu-tru-dung-chung

## Context

Hàng V2e của `docs/plan/lo-trinh-okr.json`, dãy P3 đợt r2; Cổng Đáng `build` (chủ kho, 2026-10-12T23:58:15Z). Mở từ
Ngoài-7 ở Cổng Bằng chứng của V2 `vong-doi-mot-cach-cat`. `docs/vong-doi.md` dặn mảnh chưa có thì thêm vào
`packages/ui` rồi mới dùng; bảng «Mảnh dùng chung» của nó còn ghi «Dải báo bản ghi đã lưu trữ» là «chưa». Hôm nay
dải báo `DaiLuuTru` và vùng khoá `KhoaLuuTru` nằm trong `apps/app/components/crm/record-sheet/record-actions.tsx`.

## Criteria

- AC-1: Given mảnh `DaiLuuTru` của `packages/ui` nhận tiêu đề «Đã lưu trữ ngày 15/09/2026» và nhãn nút «Khôi phục», When nó hiện rồi người bấm nút, Then có đúng một dải mang `data-dai-luu-tru` và `data-slot="dai-luu-tru"` với tiêu đề đó, `onKhoiPhuc` được gọi đúng một lần; khi `dangKhoiPhuc` bật thì nút tắt và bấm không gọi gì.
- AC-2: Given mảnh `KhoaLuuTru` của `packages/ui` bọc một ô nhập, một nút, một phần tử `role=combobox` và một phần tử `contenteditable`, When `khoa` bật, Then ô nhập và nút ở trạng thái `:disabled`, và trên `role=combobox` lẫn `contenteditable` không trình xử lý nào của bốn sự kiện `pointerdown`, `mousedown`, `click`, `keydown` (Enter) chạy; When `khoa` tắt, Then cả bốn sự kiện tới được hai chỗ đó và ô nhập, nút không tắt.
- AC-3: Given ngăn Công ty, Cá nhân và Thoả thuận mở một bản ghi đã lưu trữ, When ngăn hiện, Then dải báo, nút «Khôi phục» và vùng chỉ đọc hành xử đúng như bài đo đã ký của V2 `vong-doi-mot-cach-cat` (dải báo, chỉ đọc, chữ) — các bài đó, phép đo màn và ảnh nền của V2 chạy lại và không bị sửa, thêm `.skip` hay `.only` trong vòng này; và khi lệnh khôi phục đang chờ, nút «Khôi phục» trên ngăn tắt, bấm hai lần chỉ gửi một lần khôi phục.
- AC-4: Given mã nguồn `apps/app` (trừ thư mục kiểm), When tìm nơi định nghĩa dải báo và vùng khoá, Then không còn tệp nào trong `apps/app` tự dựng `fieldset` khoá bản đã cất hay gắn `data-dai-luu-tru`/`data-khoa-luu-tru`, cả ba ngăn nhập `KhoaLuuTru` từ `@crm/ui/components/dai-luu-tru`, và `record-actions.tsx` dựng dải báo bằng `DaiLuuTru` nhập từ cùng chỗ đó.
- AC-5: Given `docs/vong-doi.md`, When đọc bảng «Mảnh dùng chung», Then dòng «Dải báo bản ghi đã lưu trữ» ghi đã có và gọi tên `DaiLuuTru`, `KhoaLuuTru` ở `packages/ui`, không còn chữ «chưa» ở dòng đó.
- AC-6: Given bản chạy thật của cây này với một thoả thuận đã lưu trữ, When mở ngăn của nó ở khổ 1440 và 390 rồi bấm «Khôi phục», Then dải báo và nút hiện, ô tên chỉ đọc, máy chủ không ghi gì khi bấm vào ô; sau «Khôi phục» dải mất và máy chủ báo thoả thuận không còn mốc lưu trữ. (cross-layer)
- AC-7: Given ảnh ngăn thoả thuận đã cất của vòng này và ảnh đã ký của V2 cùng khổ, When một người không làm lượt này so hai ảnh, Then dải báo, nút «Khôi phục» và vùng chỉ đọc trông như nhau — không lệch chữ, màu, khoảng cách hay vị trí. (judgment)

## Coverage

- Bỏ quét bằng `morphological-scan`, xem sổ quyết định (bỏ coverage-scan). Trục kê tay:
- Trục A — mảnh: dải báo (AC-1) | vùng khoá (AC-2)
- Trục B — nơi dùng: ba ngăn CRM (AC-3, AC-6, AC-7) | mã nguồn `apps/app` (AC-4) | luật `docs/vong-doi.md` (AC-5) [thước CE: mọi chỗ gọi `DaiLuuTru`/`KhoaLuuTru` — SUY-TỪ-REPO: grep 13/10 ra đúng ba ngăn `company-sheet.tsx`, `contact-sheet.tsx`, `deal-sheet.tsx`]
- Trục C — trạng thái: đã cất (AC-1…AC-3, AC-6) | đang dùng (AC-2, AC-3) | đang khôi phục (AC-1)
- Trục D — khổ: 1440 | 390 — AC-6, AC-7.

## Out of scope

- Lắp dải báo vào ngăn của loại bản ghi khác (khuôn kế hoạch, đơn vị, trang tài liệu) — việc của lượt mang loại đó.
- Nút «Đã lưu trữ» trên thanh công cụ bảng thành mảnh chung — dòng riêng của bảng «Mảnh dùng chung».
- Đổi chữ, khoá chữ, hình hay máy chủ của dải báo.

## Notes

- Vòng đời (luật 14): (1) Dọn thế nào — không đổi: Công ty, Cá nhân, Thoả thuận vẫn Lưu trữ → Khôi phục → Xoá vĩnh viễn. (2) «Lịch sử» — không đổi. (3) Danh sách mặc định — không đổi; vòng này chỉ dời chỗ đặt mã của dải báo và vùng khoá.
- Ranh giới: `packages/ui/src/components/dai-luu-tru.tsx` (mới), `packages/ui/test/dai-luu-tru.dom.tsx` (mới), `apps/app/test/dai-luu-tru-dung-chung.dom.tsx` (mới), `apps/app/components/crm/record-sheet/{record-actions,company-sheet,contact-sheet,deal-sheet}.tsx`, `docs/vong-doi.md` (một dòng bảng), `_acceptance/dai-luu-tru-dung-chung/**`, thêm khoá vào `_acceptance/config.yaml`. Không chạm tệp chữ dùng chung.
