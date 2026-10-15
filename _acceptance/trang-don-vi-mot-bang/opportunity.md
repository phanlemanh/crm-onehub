---
schema_version: 1
slug: trang-don-vi-mot-bang
feature: Tôi chọn đơn vị bằng ô tìm kiếm và đọc mục tiêu của nó trong một bảng như Thoả thuận, mở từng mục tiêu ra KR
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DH2
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH2 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Tôi chọn đơn vị bằng ô tìm kiếm và đọc mục tiêu của nó trong một bảng như Thoả thuận, mở từng mục tiêu ra KR

Vì sao: Trang «Theo đơn vị» hôm nay chồng sáu lớp điều khiển, có cột cây đơn vị rộng 288px không màn nào khác có, cách xem và chip lọc nằm hai hàng khác nhau, bộ nút đổi theo cách xem. Trên điện thoại cây hiện nguyên 20 dòng lúc tải rồi mới thu thành ô chọn. «Đặt cược» và «Chưa có lý do» không tự giải thích.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Người đang dùng OKR, lần đầu gặp trang đơn vị mới, có tự tìm được mục tiêu và KR của
  một đơn vị bất kỳ mà không ai chỉ, nhanh như một bảng quen thuộc (Thoả thuận) không — trên máy tính lẫn điện thoại?
- Kết quả nào là SỐNG: Năm người dùng thử (vai đang dùng OKR, chưa xem bản mới) được người điều phối đọc tên một
  đơn vị cấp phòng ban bất kỳ; từ thẻ «Theo đơn vị», mỗi người tới được bảng mục tiêu của đơn vị đó và mở ra KR của
  một mục tiêu — cả năm người dưới 10 giây, không hỏi, ở cả khổ máy tính (1440) và điện thoại (390).
- Kết quả nào là CHẾT: Một người trở lên cần quá 10 giây hoặc phải hỏi, ở một trong hai khổ, khi hết timebox.
- Timebox: phiên nghiệm thu trong 7 ngày kể từ ngày DH2 gộp vào `onehub`; DH2 nằm trong mốc m-1020dh «OKR · Khu
  Mục tiêu dễ đi» (hoàn tất dự kiến 20/10/2026).

Bản ở hàng DH2 của lộ trình (để đối chiếu): «Năm người dùng thử tìm OKR của một đơn vị bất kỳ dưới 10 giây và ít
lần bấm hơn trên màn hôm nay». Máy giữ vế 10 giây và năm người, khai rõ ai thử, việc đo từ đâu tới đâu và vế chết;
máy **bỏ vế «ít lần bấm hơn»** vì nó chết theo cấu tạo của chính câu giao: hôm nay ở 1440 cây đơn vị mở sẵn cả 20
dòng nên tới một đơn vị là **1** lần bấm và KR hiện sẵn (mục tiêu mở mặc định, `bang-muc-tieu.tsx`); bản mới chọn
đơn vị bằng ô tìm kiếm (mở ô + chọn = **2**) và mục tiêu là dòng mở ra KR (+**1**). Ở 390 hôm nay là ô chọn: 2 lần
chạm, bằng bản mới. Số lần bấm vẫn được đếm trong phiên như một số đọc, không phải vế sống/chết. Cái trang mới
thắng là ít thứ phải quét (sáu lớp điều khiển → một hàng công cụ, bỏ cột cây 288px) và điện thoại hết nhảy bố cục
lúc tải — nên thời gian ở cả hai khổ là thước đúng.

Số đo nền (production 14/10, khổ 1440 và 390 — `docs/plan/pham-vi-okr-dieu-huong-1410.md`): trang chồng sáu lớp
điều khiển; cột cây đơn vị rộng 288px không màn nào khác có; cách xem và chip lọc nằm hai hàng; bộ nút đổi theo cách
xem; trên điện thoại cây hiện nguyên 20 dòng lúc tải rồi mới thu thành ô chọn.
