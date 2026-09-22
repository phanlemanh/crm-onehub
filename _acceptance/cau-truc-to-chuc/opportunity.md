---
schema_version: 1
slug: cau-truc-to-chuc
feature: Tổ chức có hai cấp — bộ phận chứa phòng ban — thay cho một danh sách phẳng mà Điều phối 30 ngày đang gọi là «bộ phận»
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Ngày 2026-09-22 chủ kho yêu cầu «bổ sung phòng ban thuộc bộ phận (Divisions ->
Department)» khi mở vòng sửa và lưu trữ của Điều phối 30 ngày. Ý đó được tách
khỏi vòng `sua-luu-tru-dieu-phoi` thành ô này, vì làm cho đúng thì nó chạm tới
thành viên và workspace, không chỉ màn điều phối.

Hôm nay CRM chỉ có một danh sách phẳng — bảng `Department`, trên màn gọi là
«Bộ phận» — và mỗi bước của kế hoạch 30 ngày giao cho một hàng trong đó. Trên
prod đang có «Kinh doanh vùng 1» và «Kinh doanh vùng 2»: hai hàng trông như
phòng ban của cùng một bộ phận «Kinh doanh» nhưng CRM không có chỗ nói điều đó.

**Người gặp:** người điều phối (xếp và lọc việc theo bộ phận lớn thay vì từng
phòng) và người quản lý (xem khối lượng việc theo bộ phận).

## Giả định chốt sinh tử

- Hướng đã nghiêng về khi hỏi 2026-09-22 (chưa chốt): giữ bảng hiện có làm
  **Phòng ban** (`Department`) và thêm cấp **Bộ phận** (`Division`) ở trên —
  bước kế hoạch vẫn giao cho phòng ban, dữ liệu cũ không phải chuyển.
- Cấu trúc hai cấp có ích ngoài Điều phối 30 ngày — chưa kiểm chứng.

## Câu hỏi mở cho Cổng Đáng

- Thành viên có thuộc phòng ban không? Có trưởng phòng / trưởng bộ phận không?
- Bước kế hoạch giao cho phòng ban, hay giao cho người trong phòng ban?
- Báo cáo, lọc, quyền xem có đi theo bộ phận không?
- Chỉ Điều phối 30 ngày dùng, hay các khu khác (công ty, thoả thuận, chiến
  dịch) cũng cần?

## Ngưỡng chết / ngưỡng UAT

Chưa khai — đợi Cổng Đáng.

## Out of scope từ khám phá

- Đổi tên, lưu trữ, sắp thứ tự danh sách hiện có — làm ở vòng
  `sua-luu-tru-dieu-phoi`, dùng lại được khi thêm cấp bộ phận ở trên.
