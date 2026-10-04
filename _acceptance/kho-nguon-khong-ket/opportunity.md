---
schema_version: 1
slug: kho-nguon-khong-ket
feature: «Nguồn không kẹt mãi ở «đang đọc» khi máy soạn lỗi; «Soạn lại» chạy được; hộp chèn liên kết báo lỗi thay vì «không trang nào khớp»»
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: l4a
lo_trinh_tep: docs/plan/lo-trinh-kho-tai-lieu.json
---

## Vấn đề & ai gặp

Mở từ hàng l4a của «Kho tài liệu» (`docs/plan/lo-trinh-kho-tai-lieu.json`), gom ba mục nợ của
khảo sát lộ trình 04/10 (#22, #20, #21). Từ 26/10 mọi phòng ban nạp 10–20 tệp mỗi nơi; ba lỗi này
nằm đúng trên đường nạp tệp và viết trang.

- **#22 — nguồn kẹt mãi ở «đang đọc» (Ngoài-11/19 của `may-soan-de-xuat`).** Máy soạn đặt nguồn về
  `CHO_DOC` rồi mới đọc tệp (`apps/agent/agent/lib/tai-lieu-soan.ts:49-75`). Nếu đọc tệp hay bóc chữ
  ném lỗi thoáng qua (lưu trữ chậm, tệp hỏng), không nhánh nào đưa nguồn về `LOI`: nguồn đứng mãi ở
  «đang đọc». «Soạn lại» lại từ chối chính nguồn đó vì coi nó đang soạn
  (`apps/api/src/tai-lieu/tai-lieu-nguon.service.ts:343`). Người nạp không có lối ra nào trừ nhờ kỹ thuật.
- **#20 — hộp chèn liên kết nói dối khi tìm lỗi.** Lượt tìm trang lỗi rơi vào cùng nhánh với «không
  có kết quả» (`packages/ui/src/components/trinh-soan-lien-ket-trang.tsx:74-77`, chữ ở dòng 115-119),
  nên người viết trang thấy «không trang nào khớp» và tưởng trang chưa có.
- **#21 — bài kiểm liên kết chưa đo tiền tố `/<ws>/`.** Bài kiểm chèn liên kết
  (`packages/ui/test/trinh-soan-lien-ket.dom.tsx`) chưa chặn được một liên kết sai không gian làm việc.

**Người gặp:** người nạp tài liệu của phòng ban (nguồn kẹt, không tự gỡ được) · người viết trang
(liên kết bị bỏ sót vì tưởng trang chưa có) · chủ kho (phải gỡ tay từng nguồn kẹt).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: trong đợt chạy thật, có nguồn nào kẹt ở «đang đọc» hay «đang soạn» mà người nạp không tự gỡ được không?
- [đề xuất] Kết quả nào là SỐNG: 0 nguồn ở `CHO_DOC`/`CHO_SOAN`/`DANG_SOAN` quá 30 phút trên production trong timebox, và mọi nguồn `LOI` soạn lại được bằng nút «Soạn lại».
- [đề xuất] Kết quả nào là CHẾT: ≥ 1 nguồn kẹt quá 30 phút phải gỡ tay bằng cơ sở dữ liệu, hoặc ≥ 1 lần người viết báo «không tìm thấy trang» khi trang có thật.
- [đề xuất] Timebox: đo cùng chạy thật mọi phòng ban 2026-10-26 → 2026-11-09, đọc số 2026-11-10 (đếm hàng `taiLieuNguon` theo `trangThai` và giờ cập nhật).
