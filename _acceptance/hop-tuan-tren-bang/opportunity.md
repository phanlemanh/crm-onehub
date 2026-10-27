---
schema_version: 1
slug: hop-tuan-tren-bang
feature: "Trưởng đơn vị đi họp ngay trên bảng Họp tuần: mỗi KR hiện ghi chú mới nhất và mức đổi so với lần trước ở mọi khổ màn, cập nhật được ngay từ dòng, và ngăn KR mở từ bảng đi ‹ › theo thứ tự đáng bàn"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-27T12:59:07Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: HT2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng HT2 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: chưa có trang: trang nền, trang đợt okr-hop-tuan-2210, mã H3, mã H5
Mốc: Hạn: Quý 4 trên CRM, mọi phòng ban cập nhật và họp tuần hằng tuần — Họp tuần phải mở đúng bộ và họp được trên bảng — 26/10/2026.

Trưởng đơn vị đi họp ngay trên bảng Họp tuần: mỗi KR hiện ghi chú mới nhất và mức đổi so với lần trước ở mọi khổ màn, cập nhật được ngay từ dòng, và ngăn KR mở từ bảng đi ‹ › theo thứ tự đáng bàn

Vì sao: Dưới 1024px cột «Ghi chú mới nhất» biến mất (hop-tuan.tsx:137, :162); phần «Còn lại» không có ghi chú; dòng bảng chỉ mở ngăn KR, và ‹ › của ngăn đi trong một mục tiêu (kr-sheet.tsx:400-401). Tability: trình chiếu hiện câu phân tích mới nhất cho mọi KR kèm mức đổi, ngăn KR đi ‹ › qua mọi KR của plan, nút Create check-in ở ngăn và ở từng trang trình chiếu.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Ở 375, 768 và 1440 mọi dòng Họp tuần có ghi chú mới nhất; cập nhật một KR từ bảng không phải rời bảng; ‹ › trong ngăn mở từ bảng đi đúng thứ tự của bảng» chưa?
- Kết quả nào là SỐNG: Ở 375, 768 và 1440 mọi dòng Họp tuần có ghi chú mới nhất; cập nhật một KR từ bảng không phải rời bảng; ‹ › trong ngăn mở từ bảng đi đúng thứ tự của bảng
- Kết quả nào là CHẾT: chưa đạt «Ở 375, 768 và 1440 mọi dòng Họp tuần có ghi chú mới nhất; cập nhật một KR từ bảng không phải rời bảng; ‹ › trong ngăn mở từ bảng đi đúng thứ tự của bảng» khi hết timebox
- Timebox: 2026-10-31 — mốc gốc 26/10 đã qua; dự báo máy (`du-bao.json`) cho mốc «Hạn 26/10» hoàn tất 30/10, cộng một ngày cho lượt khoá s4 của dãy V2 xếp sau V4 (#568)
- Đọc giá trị: buổi Họp tuần đầu tiên trên dữ liệu thật sau khi gộp — phiên nghiệm thu với một trưởng đơn vị họp hết bảng ở điện thoại và máy tính: đọc ghi chú mới nhất của mọi KR, cập nhật ít nhất một KR mà không rời bảng, đi ‹ › trong ngăn theo đúng thứ tự bảng. Chết nếu người họp phải mở trang khác để đọc ghi chú hay để cập nhật

## Ghi chú cho người quyết

- Cùng đợt okr-hop-tuan-2210 (PR #543, chủ kho duyệt 22/10): HT1, HT3, HT4 ghi Cổng Đáng theo lần duyệt đợt đó. HT2 chưa có dòng quyết — chủ kho quyết ở đây.
- «Mức đổi so với lần trước» cần một trường mới ở API `okr-xem` (giá trị lần cập nhật trước của từng KR); bản mẫu `/proto/hop-tuan-tren-bang` (nhánh `feat/hop-tuan-tren-bang`) đã vẽ năm trạng thái trên dữ liệu mẫu.
- Thứ tự ‹ › theo bảng chỉ áp khi ngăn KR mở từ Họp tuần; đổi AC-2 đã ký của VK7 ở đường đó — xét thước `ngan-kr-mot-cho` theo luật tạm «không tự sửa thước hồ sơ đã ký».

Cổng Đáng: chủ kho trả lời trực tiếp ở phiên HT2 lúc 2026-10-27T12:59:07Z, nguyên văn «build, giữ ngưỡng đề xuất».
