---
schema_version: 1
feature: Khung chờ đầu trang OKR cao bằng đầu trang thật, vùng nội dung Toàn cảnh không tụt khi tải xong
slug: dau-trang-okr-cho-nut-hoi-kara
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-16-dau-trang-okr-cho-nut-hoi-kara-design.md
---

# Acceptance Contract: dau-trang-okr-cho-nut-hoi-kara

## Context

Lần 1 của vòng này cho khung chờ đầu trang OKR dựng nút «Hỏi Kara». DH1 (#437, M5) viết lại đầu trang khu Mục tiêu,
chuyển nút vào hàng hành động và mang theo bản vá bấm hai lần của lần 1. Hàng tiêu đề không còn nhảy, nhưng ở khổ 375
khung chờ mới của DH1 dựng hàng hành động một dòng 28 px trong khi hàng thật hai dòng 68 px, nên vùng nội dung Toàn
cảnh tụt 40 px khi dữ liệu tới (E12m bước 1 của `khung-man-chung` đỏ). Vòng này (lần 2, M5 chọn lối b ở #375) cho khung
chờ ấy cao bằng hàng thật, và gỡ phần mồ côi của lần 1.

Source input: `_acceptance/dau-trang-okr-cho-nut-hoi-kara/opportunity.md` (Cổng Đáng `build`, 15/10); dòng sổ revisit
mở lại Cổng Phạm vi 16/10.

## Criteria

- AC-1: Given màn OKR › Toàn cảnh trên máy chủ thật của cây với tài khoản quản trị của phiên đo, ở khổ 375 và 1280, When
  truy vấn chính của màn bị giữ (đang tải) rồi được thả (xong), Then hàng tiêu đề lệch không quá 4 px và vùng nội dung
  của trang lệch không quá 8 px giữa lúc chờ và lúc xong (bước 1 của E12m `khung-man-chung` không in «lech» cho
  Toàn cảnh).
- AC-2: Given các màn khác trong phép đo khung chờ chung (Chiến dịch, Onboarding, Tài liệu, Liên hệ ở biên 767/768),
  When chạy lại E12m của `khung-man-chung`, Then các bước 2–5 vẫn «dat»; và bộ kiểm DOM của DH1 về đầu trang khu và nút
  «Hỏi Kara» (`apps/app/test/okr-dau-trang-khu.dom.tsx`, `apps/app/test/nut-hoi-kara-thay-khung.dom.tsx`) chạy không sửa
  một dòng và xanh.
- AC-3: Given nhánh của vòng so với `onehub`, When soát tệp, Then không còn `dau-trang-okr-cho.tsx`, không còn bài kiểm
  `dau-trang-okr-cho.dom.tsx`, không còn khoá `dto_*` trong `_acceptance/config.yaml`, không tệp nào trong `apps/app` nhập
  tới thành phần cũ; và tệp mã duy nhất vòng này đổi trong `apps/app` là `app/(app)/[slug]/okr/dau-trang-okr.tsx`.
- AC-4: Given máy chủ thật của cây, ở khổ 375 và 1280, When chụp Toàn cảnh lúc đang tải và lúc xong, Then hai ảnh cho
  thấy cùng hàng tiêu đề, hàng hành động lúc chờ chiếm cùng số dòng như lúc xong, và khối số tổng quan bắt đầu ở cùng độ
  cao.

## Coverage

- Trục A — Khổ: 375 | 1280 [thước CE: hai khổ của E12m] → AC-1, AC-4.
- Trục B — Trạng thái: đang tải | xong [thước CE: giữ/thả truy vấn của chup-man.mjs] → AC-1, AC-4.
- Trục C — Vai: quản trị (đo được) | vai ít nút [GIẢ ĐỊNH: hàng có thể một dòng ở 375] → AC-1 (quản trị); vai ít nút là
  Hỏi-1.
- Cắt ngang: các màn khác của khung chờ chung không đổi; bộ kiểm của DH1 không sửa → AC-2; gỡ phần mồ côi → AC-3.

## Out of scope

- Đổi bố cục hàng hành động hay đầu trang của DH1 (`HanhDongKhu`, `LuoiDauTrangOkr`) — trừ khi chủ kho chọn Hỏi-1 (b).
- Khung chờ lồng của `HanhDongKhu` lúc quyền đang tải (`q.kieu === "cho"`) — phần của DH1, đã có bài kiểm.
- Các màn OKR khác ngoài Toàn cảnh có cùng khung chờ (Của tôi, Theo đơn vị…) — không nằm trong phép đo E12m; cùng sửa
  nhờ dùng chung `DauTrangOkrCho`, nhưng không có thước riêng.

## Notes

- Hạng T2: chỉ `apps/app` và dòng của chính NM5 trong `_acceptance/config.yaml`.
- `dau-trang-okr.tsx` là vùng DH1 (M5): gửi `cham-tep` trước commit chạm nó (M5 không phản đối, #375 12:10Z).
- Hồ sơ đã ký `khung-man-chung` không bị chạm; E12m của nó là thước của vòng này.
