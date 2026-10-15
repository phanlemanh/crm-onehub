---
schema_version: 1
feature: Khi Kara đang soạn hoặc người dùng gõ dở trong khung, bấm một liên kết trong khung thì được hỏi trước khi rời, chữ đang gõ không mất
slug: khung-soan-chan-lien-ket
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-10-15T10:48:36Z
design_doc: docs/superpowers/specs/2026-10-15-khung-soan-chan-lien-ket-design.md
---

# Acceptance Contract: khung-soan-chan-lien-ket

## Context

Từ K2e cuộc soạn OKR mở trong khung bản ghi bên phải. Khung đã hỏi khi đóng bằng nút, Esc hay bấm ra ngoài, nhưng mất
phần chặn liên kết mà trang soạn cũ có: bấm «Tới Kho tài liệu» hay «Xem theo đơn vị» trong khung là đi luôn, khung
đóng, chữ gõ dở mất. Vòng này trả lại phần chặn đó cho khung soạn.

Source input: `_acceptance/khung-soan-chan-lien-ket/opportunity.md` (Cổng Đáng `build`, 2026-10-12T23:58:15Z; hàng K2f
của `docs/plan/lo-trinh-okr.json`; Ngoài-9 ở Cổng Bằng chứng của K2e `soan-okr-trong-khung`).

## Criteria

- AC-1: Given khung soạn đang mở và Kara đang soạn một lượt, When người bấm một liên kết nội bộ trong khung, Then trang không rời: địa chỉ không đổi, không lệnh chuyển trang nào được gọi, và hộp hỏi hiện đúng lời hỏi khi đóng khung lúc Kara soạn (tiêu đề, thân, nút rời, nút ở lại của `trang.hoiDong`).
- AC-2: Given Kara không soạn và người đã gõ dở trong khung — chữ trong ô soạn chưa gửi, hoặc số trong bản nháp chưa lưu — When bấm một liên kết nội bộ trong khung, Then hộp hỏi «bỏ những gì vừa nhập» chung của bộ giữ thay đổi hiện; When người chọn ở lại (nút ở lại hoặc Esc), Then hộp đóng, khung còn mở, địa chỉ không đổi, chữ hay số đã gõ còn nguyên từng ký tự.
- AC-3: (cross-layer) Given hộp hỏi đang hiện sau khi bấm một liên kết (Kara soạn hoặc gõ dở), When người chọn rời, Then trang chuyển tới đúng địa chỉ của liên kết đó, đúng một lần, dạng thêm vào lịch sử; hộp không hiện lại; lượt Kara đang chạy không bị gọi dừng và chạy tới hết (bản nháp của lượt được nộp ở máy chủ); và trên trang mới khung soạn đã đóng.
- AC-4: Given khung soạn không có gì dở (Kara rảnh, ô soạn trống, không số gõ dở), When người bấm một liên kết trong khung — «Tới Kho tài liệu» hoặc «Xem theo đơn vị» — Then trang chuyển ngay tới địa chỉ đó, không hộp hỏi nào hiện.
- AC-5: Given khung có thứ dở, When người bấm liên kết theo cách trình duyệt tự mở chỗ khác — giữ Cmd, Ctrl, Shift hay Alt; chuột giữa; liên kết mở thẻ mới; liên kết sang miền khác; liên kết tải xuống — hoặc liên kết trỏ đúng địa chỉ đang đứng, Then không hộp hỏi nào hiện và trình duyệt được để xử như thường (bấm không bị chặn).
- AC-6: Given một hộp hay khung khác dùng bộ giữ thay đổi mà không bật chặn liên kết (mọi `Dialog`, `Sheet`, `Drawer` khác, khung Mục tiêu đang gõ trao đổi), When người bấm liên kết hay đóng hộp như trước, Then hành vi y như trước vòng này: bộ kiểm hiện có của bộ giữ thay đổi và của khung soạn chạy không sửa một dòng và đều xanh; và một `Sheet` có khai thay đổi mà không gọi phần chặn thì bấm liên kết không hỏi.
- AC-7: Given máy chủ thật của cây với mô hình giả, ở khổ 1280 và 375, When người (a) gửi một lượt chậm rồi bấm «Tới Kho tài liệu» lúc Kara đang soạn, chọn ở lại, bấm lại và chọn rời; (b) gõ dở trong ô soạn lúc Kara rảnh, bấm liên kết, chọn ở lại; (c) focus liên kết bằng bàn phím và nhấn Enter lúc Kara soạn, Then (a) hộp hỏi soạn hiện, ở lại giữ khung và địa chỉ, rời tới Kho tài liệu và địa chỉ không còn `record`; (b) hộp «bỏ những gì vừa nhập» hiện, ở lại thì ô soạn còn đúng chữ đã gõ; (c) hộp hỏi soạn hiện như bấm chuột.

## Coverage

- Trục A — Thứ đang dở trong khung: Kara soạn | chữ gõ dở | số gõ dở | không gì dở [thước CE: ba lời khai giữ của khung — `GiuKhiSoan`, `khaiChu`, `khaiSo`] → AC-1, AC-2, AC-4
- Trục B — Cách bấm: chuột trái | Enter | Cmd/Ctrl/Shift/Alt | chuột giữa | thẻ mới | miền khác | tải xuống | cùng địa chỉ [thước CE: nhánh của `hrefNoiBo`; NGÀNH: Web Interface Guidelines của Vercel — Cmd/Ctrl+click, middle-click] → AC-1, AC-5, AC-7
- Trục C — Liên kết nằm đâu: «Tới Kho tài liệu» | «Xem theo đơn vị» | liên kết trong chữ Kara [thước CE: hai `Link` trong `okr/soan/*.tsx`; chữ Kara qua `MessageResponse` mở thẻ mới — Later] → AC-1, AC-2, AC-4
- Trục D — Chọn ở hộp hỏi: ở lại bằng nút | ở lại bằng Esc | rời [thước CE: hai nút và Esc của `ConfirmDialog`] → AC-2, AC-3
- Cắt ngang: khổ 1280 và 375; các hộp khác không đổi; lượt Kara không bị dừng → AC-3, AC-6, AC-7
- Quét đầy đủ (Core / Later / Never): `_acceptance/khung-soan-chan-lien-ket/coverage-scan.md`

## Out of scope

- Hỏi khi đóng thẻ hay tải lại trình duyệt lúc chỉ có chữ gõ dở (ca Kara đang soạn đã có `beforeunload` từ K2e).
- Chặn liên kết ở các khung bản ghi khác có khai thay đổi (trao đổi trên khung Mục tiêu, thêm nhanh) — cơ chế ở
  `packages/ui` dùng được, bật là việc riêng.
- Giữ chữ gõ dở qua lần rời trang; chặn nút Quay lại của trình duyệt.
- Liên kết trong chữ trả lời của Kara: `Streamdown` mở chúng ở thẻ mới, rơi vào nhánh «thẻ mới» của AC-5.

## Notes

- Hạng T2: `packages/ui` và `apps/app`, không chạm đường T3.
- Hỏi-1 (chữ của hộp hỏi khi rời lúc Kara soạn): máy khuyên dùng lại nguyên lời hỏi khi đóng khung («Kara đang soạn.
  Đóng khung?» · «Đóng» / «Ở lại») vì rời trang cũng đóng khung và lượt vẫn chạy; lối khác là thêm lời riêng «rời
  khung» — thêm hai dòng chữ mỗi thứ tiếng và một lời khai mới. Câu trả lời khác khuyến nghị thì máy sửa AC-1 rồi
  trình lại.
- Hỏi-2 (nút Quay lại sau khi rời): máy khuyên chuyển thẳng tới liên kết, nên Quay lại mở lại trang có khung soạn —
  như trang soạn cũ trước K2e; lối khác là chờ đóng khung xong rồi mới đi, Quay lại về trang không có khung (thêm một
  mục lịch sử, sửa AC-3).
