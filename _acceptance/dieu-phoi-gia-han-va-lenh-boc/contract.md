---
schema_version: 1
feature: Bộ điều phối không đứng nhịp vì một tệp trả lời gia hạn hỏng, và lệnh bọc giữ nhịp chạy được lệnh có biến môi trường đứng trước
slug: dieu-phoi-gia-han-va-lenh-boc
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [cli]
status: verified
design_doc: docs/superpowers/specs/2026-10-07-dieu-phoi-gia-han-va-lenh-boc-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-07
---

# Acceptance Contract: dieu-phoi-gia-han-va-lenh-boc

## Context

Cổng 2 của `dieu-phoi-va-bien` (07/10) để lại hai lỗi owner chọn «mở hợp đồng mới» (sổ quyết định của hồ sơ đó,
dòng revisit gate2). (1) Bộ phát lịch đọc `tra-loi/<id>.json` của yêu cầu `gia-han` bằng `docJson`; tệp JSON hỏng
làm nhịp ném lỗi trước bước thu hồi khoá, cấp lượt và ghi bảng — đợt đứng tới khi có người sửa tay. (2) Hook chặn
S4 gợi ý lệnh bọc `node giu-nhip.mjs -- <lệnh>`; lệnh có biến môi trường đứng trước (`TZ=… bun test`) bị đưa
thẳng vào `spawn` như tên chương trình nên thoát 127. Phải xong trước khi mở đợt sau-14-10.

Source input: prompt + `_acceptance/dieu-phoi-va-bien/review-findings.md` (hai mục «new-contract» lượt 1).

Thuật ngữ:
- **nhịp** = một lần `motNhip(thư mục đợt, io)`.
- **tệp trả lời hỏng** = `tra-loi/<id>.json` không đọc được thành JSON, hoặc đọc được nhưng không phải object.
- **lệnh có tiền tố biến** = lệnh mà một hay nhiều từ đầu có dạng `TÊN=giá trị` (tên khớp `[A-Za-z_][A-Za-z0-9_]*`).

## Criteria

- AC-1: Given một đợt có khoá `s4` của P1 đã hết hạn với nhịp cũ, một đơn `merge` lành của P2, và yêu cầu `gia-han` của P1 mà `tra-loi/<id>.json` là JSON hỏng, When chạy một nhịp, Then khoá `s4` của P1 bị thu hồi, P2 được cấp `merge`, `trang-thai.json` và `bang.html` được ghi trong chính nhịp đó, không có sự kiện `loi-nhip`; tệp hỏng được dời sang `tra-loi/hong/<id>.json` và có đúng một sự kiện `tra-loi-hong` mang `can_phan: true`, nêu tên tệp và lý do.
- AC-2: Given tệp trả lời hỏng đã được dời ở nhịp trước, When chạy thêm nhịp, Then không có sự kiện `tra-loi-hong` thứ hai cho cùng tệp; yêu cầu đó trở lại đường xét như chưa có trả lời — trong trần thì bộ phát lịch tự duyệt lại và hạn thuê được kéo dài đúng một lần, vượt trần thì chờ giám sát và không sinh `can_phan` lặp.
- AC-3: Given `tra-loi/<id>.json` là JSON hợp lệ nhưng không phải object (mảng, chuỗi, số, `null`), When chạy một nhịp, Then xử lý như tệp trả lời hỏng ở AC-1 (dời, một `can_phan` nêu «không phải object»), nhịp chạy trọn.
- AC-4: Given tệp trả lời lành duyệt `gia-han` (đối chứng), When chạy một nhịp, Then hạn thuê mới bằng đúng giá trị hàm tính hạn hiện có cho cùng hạn cũ, giờ nhịp và số phút, có sự kiện `gia-han`, không có `tra-loi-hong`.
- AC-5: Given lệnh có tiền tố biến (`TZ=Asia/Ho_Chi_Minh A= node -e …`), When chạy qua `giu-nhip.mjs -- <lệnh>`, Then tiến trình con nhận đúng các biến (A là chuỗi rỗng), các biến khác của môi trường vẫn còn, `giu-nhip` thoát đúng mã của lệnh con và vẫn chạm nhịp; lệnh không tiền tố chạy như cũ; từ dạng `K=V` đứng sau tên lệnh được giữ nguyên làm đối số, và từ đầu có `=` mà phần trước không phải tên biến hợp lệ (như `1X=y`) không bị coi là gán biến; dòng chỉ có gán biến mà không có lệnh thì thoát 2 với dòng `dùng: giu-nhip.mjs -- <lệnh> [đối số…]`.
- AC-6: Given phiên giữ khoá `s4` trong đợt chạy một lệnh Bash nền có tiền tố biến, When hook chặn S4 trả dòng gợi ý, Then dòng gợi ý trỏ đúng `giu-nhip.mjs` nằm cạnh mã đang chạy, chạy nguyên văn dòng gợi ý đó bằng `sh -c` thoát 0 và biến tới được lệnh con (không còn 127; cùng lệnh không tiền tố thì lệnh con báo thiếu biến); và chính dòng gợi ý ấy, gửi lại qua hook cũng trong nền, được cho qua (mã 0).
- AC-7: Given cây `scripts/dieu-phoi/`, When quét mã và chạy bộ test, Then không có chú thích, không hằng thời gian viết tay ngoài `cau-hinh.mjs`, không ghi cứng gì riêng của kho này (tên nhánh, đường dẫn, lệnh), và `bun run test:dieu-phoi` xanh trọn.

## Coverage

Không dùng skill morphological-scan: phạm vi là đúng hai lỗi owner đã chọn ở Cổng 2, mỗi lỗi một trục nhỏ đã liệt tay
(entry `descope` trong `decisions.jsonl`).

- Trục tệp trả lời: JSON hỏng (AC-1) | hợp lệ mà không phải object (AC-3) | lành (AC-4, đối chứng) | sau khi dời — trong trần và vượt trần (AC-2)
- Trục phần nhịp bị chặn: thu hồi khoá, cấp lượt, ghi trạng thái và bảng (AC-1)
- Trục lệnh bọc: một biến, nhiều biến, biến rỗng, không tiền tố, chỉ có gán biến, `K=V` sau tên lệnh, tên biến không hợp lệ (AC-5) | đường thật hook → dòng gợi ý → chạy (AC-6)

## Out of scope

- Yêu cầu `gia-han` viết trước `cap_luc` của lượt hiện tại bị bỏ qua không báo (Ngoài-3 của `dieu-phoi-va-bien`, đã ghi hạn chế đã biết).
- Kiểm hình dạng đầy đủ của tệp trả lời (trường `ket_qua`, `uoc_phut`…): chỉ chặn tệp không đọc được hay không phải object; phần còn lại giữ cách xét hiện có.
- Tệp hỏng trong các thư mục khác (`xin/`, `yeu-cau/`, `cho-nguoi/`) — đã có đường `hong/` từ trước.
- Cú pháp shell khác ngoài gán biến đứng đầu (ống `|`, `&&`, dấu ngoặc) — lệnh bọc vẫn dùng `bash -c` như cũ cho ký tự không an toàn.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Mã chỉ sửa `scripts/dieu-phoi/phat-lich.mjs` và `scripts/dieu-phoi/giu-nhip.mjs`; test mới ở `scripts/dieu-phoi/test/gia-han-va-lenh-boc.test.mjs`.
