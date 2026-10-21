---
schema_version: 1
feature: Chọn một mục trong Lọc ở trang Theo đơn vị thì menu Lọc vẫn mở, khung Lọc trên điện thoại không tự thu lại
slug: loc-don-vi-khong-tu-dong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-21T09:16:32Z
design_doc: docs/superpowers/specs/2026-10-21-loc-don-vi-khong-tu-dong-design.md
---

# Acceptance Contract: loc-don-vi-khong-tu-dong

## Context

Ở trang Theo đơn vị (kiểu xem danh sách), chọn một giá trị trong «Lọc» làm menu đóng lại và khung Lọc trên điện thoại
thu lại. Nguyên nhân: đổi lọc đổi khoá truy vấn `okr.danhSach`, và trang thay cả bảng bằng khung chờ trong lúc truy vấn
mới chạy, nên `DataTable` — nơi giữ trạng thái menu và khung Lọc — bị gỡ. Lượt này giữ bảng cũ (mờ, bận) khi chỉ lọc
đổi, và vẫn đi khung chờ khi đổi đơn vị hay chu kỳ. Chỉ giao diện: thủ tục API, dữ liệu, quyền giữ nguyên.

Source input: hàng DH13 `docs/plan/lo-trinh-okr.json`; Ngoài-3 của hồ sơ đã ký `_acceptance/trang-don-vi-mot-bang`
(`d-20261017T223322Z-57`); ô cơ hội `_acceptance/loc-don-vi-khong-tu-dong/opportunity.md` (Cổng Đáng 19/10).

## Criteria

- AC-1: Given trang Theo đơn vị ở 1440 px đã có bảng mục tiêu, When mở «Lọc», vào một mặt lọc, tích một giá trị và
  danh sách mới còn đang nạp, Then menu Lọc và menu con của mặt đó không lần nào đóng từ lúc tích tới khi dòng mới hiện,
  giá trị vừa tích hiện đã tích, và tích được giá trị thứ hai ngay mà không mở lại menu.
- AC-2: Given trang Theo đơn vị ở 390 px đã có bảng, khung Lọc đang mở, When tích một giá trị trong menu Lọc và danh
  sách mới còn đang nạp, Then khung Lọc không lần nào thu lại (nút mở khung giữ `aria-expanded="true"` và khung còn hiện)
  tới khi dòng mới hiện.
- AC-3: Given trang Theo đơn vị đã có bảng, When đổi lọc và danh sách mới còn đang nạp, Then bảng không bị gỡ lần nào:
  dòng cũ còn hiện, không có khung chờ nào, vùng bảng mang `aria-busy="true"` và mờ đi (`data-dang-tai`), còn hàng công
  cụ và nút Lọc không nằm trong vùng mờ; When danh sách mới về, Then dòng mới thay dòng cũ, `aria-busy` bỏ và vùng bảng
  hết mờ.
- AC-4: Given trang Theo đơn vị đã có bảng, When chọn một lọc không khớp mục tiêu nào, Then sau khi danh sách về, khung
  «không khớp» có nút bỏ lọc hiện trong vùng bảng và menu Lọc vẫn mở; When bấm bỏ lọc, Then bảng không lần nào bị thay
  bằng khung chờ.
- AC-5: Given trang Theo đơn vị đã có bảng, When đổi lọc và danh sách mới trả lỗi, Then hiện khung lỗi có nút «Thử lại»
  (không treo dòng cũ, không khung chờ), không phần tử nào còn `aria-busy="true"`, và bấm Thử lại gọi danh sách lần nữa.
- AC-6: Given trang Theo đơn vị đã có bảng của một đơn vị, When chọn đơn vị khác hay chu kỳ khác và danh sách còn đang
  nạp, Then thân bảng là khung chờ hình `bang-hai-dong` như hồ sơ đã ký `khung-cho-don-vi-mot-hinh`, không giữ dòng của
  đơn vị hay chu kỳ cũ.
- AC-7: Given `DataTable` của `packages/ui`, When dựng với `refreshing` là `true`, `false` hay không truyền, Then với
  `true` vùng bảng nằm trong một `VungDangTai` mang `aria-busy="true"` và `data-dang-tai` còn hàng công cụ, khối lọc và
  phân trang nằm ngoài nó; với `false` có `VungDangTai` mà không `aria-busy`, không `data-dang-tai`; và không truyền thì
  không có `VungDangTai` nào (DOM như hôm nay).

## Coverage

Quét bằng skill morphological-scan, preset test-matrix — bản đầy đủ ở `_acceptance/loc-don-vi-khong-tu-dong/coverage-scan.md`.

- Trục A — thao tác lọc: chọn | bỏ chọn | bỏ lọc trong mặt | bỏ lọc toàn bảng | lọc nhanh [thước CE: SUY-TỪ-REPO `packages/ui/src/components/data-table.tsx`]
- Trục B — nơi điều khiển: 1440 menu | 390 khung Lọc [thước CE: SUY-TỪ-REPO `data-table.tsx` `filtersOpen`]
- Trục C — truy vấn mới: còn chờ | có dòng | rỗng | lỗi [thước CE: SUY-TỪ-REPO `_acceptance/tai-lieu-loc-giu-lich-su/contract.md`]
- Trục D — đối chứng không phải lọc: đổi đơn vị | đổi chu kỳ | đổi kiểu xem [thước CE: SUY-TỪ-REPO `_acceptance/khung-cho-don-vi-mot-hinh/contract.md`]
- Chân ngành: [NGÀNH: TanStack Query — «Paginated / Lagged Queries»] giữ dữ liệu cũ trong lúc truy vấn mới chạy.
- Bỏ chọn và bỏ lọc trong mặt ở cả 1440 và 390 → Later (cùng hàm `onChange` và cùng lời chặn `onSelect` với «chọn», entry d-20261021T091517Z-9); lọc nhanh và đổi kiểu xem → Never (không gọi máy / khung riêng).

## Đường đo

- bỏ đường-đo — vòng dựng không mang thước Cổng Giá trị; ô cơ hội để trống ngưỡng (entry d-20261021T091517Z-7)

## Out of scope

- Lọc nhanh (thẻ) — lọc tại chỗ trên dòng đã có, không gọi máy.
- Ghi lịch sử trình duyệt cho mỗi lần đổi lọc (`history: push`) như Tài liệu.
- Các trang `DataTable` khác (Liên hệ, Thoả thuận, Công ty, Chiến dịch, Cài đặt) — không truyền cờ, không đổi.
- Khung chờ của kiểu xem cây, họp tuần, chấm điểm.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Chạm `apps/app/app/(app)/[slug]/okr/theo-don-vi/**` và `packages/ui/src/components/data-table.tsx`: các hồ sơ đã ký
  canh hai chỗ này được giữ tươi ở bước ghim lại trước khi gộp.
