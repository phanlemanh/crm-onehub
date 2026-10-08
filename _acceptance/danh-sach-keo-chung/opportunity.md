---
schema_version: 1
slug: danh-sach-keo-chung
feature: «Kéo để sắp xếp ở Tổ chức và Giai đoạn chạy giống nhau»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E3 của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Kéo để sắp xếp ở Tổ chức và Giai đoạn chạy giống nhau»

Người gặp: quản trị viên không gian làm việc, ở hai trang Cài đặt có danh sách kéo để
sắp xếp — Tổ chức (bộ phận, phòng ban) và Giai đoạn thoả thuận.

- Hai danh sách là hai bản chép (`organization/danh-sach-keo.tsx` và
  `giai-doan/giai-doan-settings.tsx`), đã lệch nhau: Tổ chức trả thứ tự cũ khi lưu
  lỗi, Giai đoạn giữ thứ tự vừa kéo tới khi tải lại trang (Ngoài-8 của
  `giai-doan-thoa-thuan`); Giai đoạn có «Hoàn tác» sau khi sắp, Tổ chức không;
  Tổ chức có dòng hướng dẫn kéo, Giai đoạn không.
- Giai đoạn ghi «Xoá» nhưng máy chủ chỉ cất (`archivedAt`), và không có chỗ nào
  thấy lại hay khôi phục giai đoạn đã cất — lệch `docs/vong-doi.md` (lượt 2 của
  mục «Đợt»).

Nguồn: Ngoài-2 của `giai-doan-thoa-thuan` (Cổng Bằng chứng 29/09, «mở hợp đồng
mới»), khảo sát lộ trình 04/10, bảng vòng đời của đợt sau-14-10.

Cổng Đáng: build — chủ kho ký cho E3, E1, E4, E5, E6 lúc 2026-10-07T13:13:50Z
(luật 16 của đợt sau-14-10).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: quản trị viên có sắp xếp và cất / lấy lại giai
  đoạn, đơn vị tổ chức mà không phải hỏi ai, và danh sách luôn hiện đúng thứ tự đã
  lưu không?
- Kết quả nào là SỐNG: ở phiên nghiệm thu, người thử làm xong cả ba việc —
  sắp lại một bộ phận, sắp lại một giai đoạn rồi Hoàn tác, lưu trữ rồi khôi phục một
  giai đoạn — không cần hỏi, và 0 lần thấy danh sách hiện thứ tự khác thứ tự đã lưu.
- Kết quả nào là CHẾT: người thử không tìm được giai đoạn vừa lưu trữ, hoặc
  còn thấy chữ «Xoá» cho một thao tác thật ra chỉ cất, hoặc một trong hai danh sách
  vẫn giữ thứ tự sai sau khi lưu lỗi.
- Timebox: phiên nghiệm thu đầu tiên sau khi lên production, chậm nhất
  2026-10-21.
