---
schema_version: 1
slug: datatable-loc-ro
feature: «Bảng rỗng vì đang lọc thì nói rõ, nút bỏ lọc đúng tên, lựa chọn có số 0 vẫn hiện»
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E7
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E7 của «OKR» (`docs/plan/lo-trinh-okr.json`, khảo sát lộ trình 04/10).
Câu giao: «Bảng rỗng vì đang lọc thì nói rõ, nút bỏ lọc đúng tên, lựa chọn có số 0 vẫn hiện».

Soi mã ở `origin/onehub` 0426cc9d0, ba chỗ hở:

- **Bảng rỗng không nói vì sao.** `data-table.tsx:654` hiện một câu cố định do màn truyền vào.
  Thoả thuận và cá nhân dùng «Chưa có … nào khớp bộ lọc này» cho mọi ca rỗng — kể cả khi không
  có tiêu chí nào đang bật (không có bộ lọc nào để «khớp»). Khi có tiêu chí, ô rỗng không có nút
  bỏ lọc: người phải mở lại menu lọc, đoán tiêu chí nào đang chặn.
- **Nút bỏ lọc sai tên.** Trong menu con của một tiêu chí (`data-table.tsx:287`) nút ghi
  «Bỏ hết tiêu chí» nhưng chỉ bỏ lựa chọn của tiêu chí đó.
- **Lựa chọn có số 0 biến mất.** `field-facets.tsx:40` lọc bỏ mọi lựa chọn có đếm 0 của trường
  tuỳ chỉnh. Một lựa chọn đang được chọn mà đếm về 0 thì biến khỏi menu — người không bỏ chọn
  được ở chỗ đã chọn, và không thấy giá trị nào tồn tại nhưng chưa dùng.

**Người gặp:** mọi người dùng danh sách Thoả thuận, Cá nhân, Công ty, Thành viên (và màn OKR
dùng chung `DataTable`) — tức mọi phòng ban lên CRM sau 14/10.

## Ngưỡng chết / ngưỡng UAT

- [đề xuất] Câu hỏi phép đo trả lời: người lần đầu gặp bảng rỗng vì đang lọc có tự nhận ra lý do và đưa bảng về có dữ liệu trong một thao tác không?
- [đề xuất] Kết quả nào là SỐNG: ở lái-thử người-lạ, ≥ 4/5 người gặp bảng rỗng vì lọc tự bỏ lọc trong ≤ 1 thao tác, không hỏi; 0 lần ai bị kẹt một lựa chọn đã chọn mà không thấy trong menu.
- [đề xuất] Kết quả nào là CHẾT: ≥ 2/5 người vẫn đọc bảng rỗng là «chưa có dữ liệu», hoặc vẫn có lựa chọn đang chọn mà không bỏ được từ menu.
- [đề xuất] Timebox: một vòng feature-loop T2 trong đợt sau-14-10; không vượt sang E3.
