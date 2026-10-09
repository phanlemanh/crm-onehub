---
schema_version: 1
slug: dien-thoai-o-deal-cong-ty
feature: «Số điện thoại hiện ở thoả thuận và ở tab Cá nhân của công ty»
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:
decided_by:
decided_at:
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: phần tách khỏi DT1 `dien-thoai-ca-nhan` (anh báo 09/10: «khi thêm một người ở trong Deal thì thiếu số điện thoại»); giám sát xếp hàng DT2 sau DT1, K4b, V2, E4 (luật 46). Anh chọn cách hiện A (cột «Điện thoại» sau «Tên», giữ Email) ngày 2026-10-10.

## Vấn đề & ai gặp

DT1 cho nhập và tìm số, nhưng ở thoả thuận — nơi sale làm việc hằng ngày — bảng người chỉ có Tên, Vai trò, Chức danh, Email; ô chọn người để gắn vào thoả thuận chỉ hiện «tên · chức danh»; bảng Cá nhân trong ngăn công ty cũng không có số. Sale phải mở từng người mới thấy số để gọi.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sale có gọi được người trong thoả thuận mà không phải mở hồ sơ từng người không.
- Kết quả nào là SỐNG: [đề xuất] trong phiên nghiệm thu, 3/3 sale tìm và đọc được số của người phụ trách thoả thuận ngay trong ngăn thoả thuận, không mở ngăn cá nhân.
- Kết quả nào là CHẾT: [đề xuất] có sale phải mở ngăn cá nhân mới thấy số.
- Timebox: [đề xuất] nửa ngày công; đọc cùng phiên nghiệm thu DT1 ngày 23/10.

## Out of scope từ khám phá

- Tạo người mới ngay trong thoả thuận (ô chọn chỉ gắn người có sẵn).
- Số ở các danh sách khác (bảng thoả thuận, Kanban).
