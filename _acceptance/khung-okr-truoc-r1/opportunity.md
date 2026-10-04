---
schema_version: 1
slug: khung-okr-truoc-r1
feature: "«Khung Mục tiêu gọn: bảng KR có lề, tab không trùng tên, điện thoại đọc được, chip Kara cùng cỡ nhãn, thanh Theo đơn vị không nhảy dòng»"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh — chốt lộ trình «lên trước 14/10» ngày 04/10, giao phiên P1 mở R1a
decided_at: 2026-10-04T05:40:00Z
prototype:
  base_commit:
  disposition: archive
lo_trinh_ma: R1a
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng R1a của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Khung Mục tiêu gọn: bảng KR có lề, tab không trùng tên, điện thoại đọc được, chip Kara cùng cỡ nhãn, thanh Theo đơn vị không nhảy dòng»

Khảo sát 04/10 (`de-xuat-lo-trinh.md` mục A1, 62 màn thật, ảnh `anh/r1-*.png`) không thấy
lỗi chặn ở khung Mục tiêu, nhưng thấy chín lỗi trình bày mà mọi phòng ban sẽ gặp ngay
ngày đầu dùng: bảng KR áp mép khung (KH1), thanh «Theo đơn vị» nhảy dòng (KH2), hai tab
cùng tên «History» (KH3), đầu khung trên điện thoại chiếm chỗ và cắt chữ (KH4, R1m-2,
R1m-3), «1 KRs» (KH5), chip Kara lệch cỡ và lệch chỗ so với nhãn (G2, G3), nút soạn ở
dạng chưa cấu hình chiếm cả hàng (R1m-5). Thêm: liên kết chéo trong khung bỏ thay đổi
chưa lưu mà không hỏi.

Người gặp: trưởng phòng và nhân viên mọi phòng ban, từ 14/10, cả trên điện thoại.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người mở khung Mục tiêu ở khổ 390 và 1440 có còn gặp lỗi nào trong chín lỗi đã kê, hay mất thay đổi chưa lưu khi bấm liên kết chéo, không.
- Kết quả nào là SỐNG: đo lại 4 vai × khổ 390/1440 trên bản đã gộp, 0/9 lỗi còn tái hiện, 0 màn mới tràn ngang hay lỗi console; lái thử người lạ không vấp ở khung Mục tiêu.
- Kết quả nào là CHẾT: còn ≥1 lỗi trong chín lỗi tái hiện, hoặc khung sinh hồi quy mới (tràn ngang, mất dữ liệu đang sửa).
- Timebox: gộp trước 08/10/2026; đóng băng giao diện OKR từ 12/10.
