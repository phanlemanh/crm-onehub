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
  base_commit: 875413c096a896fcd8bb89674d0a675388bed7b1
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

## Kết quả prototype

Dựng 2026-09-24 trên nhánh `proto/cau-truc-to-chuc`, bản mẫu `/proto/cau-truc-to-chuc`
(bật bằng `PROTO_ROUTE=1`, xem `docs/proto.md`). Dữ liệu giả, không đường ghi. Bản mẫu
chỉ hội tụ ý định, không đo ngưỡng — ngưỡng chưa khai.

Bảy trạng thái, mỗi trạng thái đặt một câu hỏi mở lên màn:

| Trạng thái | Cho thấy | Câu hỏi mở nó phục vụ |
|---|---|---|
| Hôm nay — danh sách phẳng | Sáu hàng ngang nhau như trên prod | (mốc so sánh) |
| Cây hai cấp | Bộ phận chứa phòng ban; phòng ban cũ giữ bước đã giao; phòng ban chưa xếp nằm riêng | Hướng giữ `Department`, thêm `Division` ở trên |
| Cây — đang tìm | Gõ «vùng»: chỉ nhánh khớp còn lại và tự mở | Người điều phối lọc theo bộ phận |
| Cây — có thành viên và trưởng | Thành viên, trưởng phòng, trưởng bộ phận | Thành viên có thuộc phòng ban không; có trưởng không |
| Sơ đồ tổ chức | Cùng dữ liệu vẽ từ trên xuống: công ty → bộ phận → phòng ban, mỗi ô có người đứng đầu và số người, số bước | Cần sơ đồ nhìn cả công ty, hay cây gập mở là đủ |
| Giao bước kế hoạch | Ô chọn nhóm phòng ban theo bộ phận | Bước giao cho phòng ban hay cho người |
| Chưa có bộ phận nào | Ngày đầu sau khi bật: mọi phòng ban ở «chưa xếp», không mất bước nào | Dữ liệu cũ không phải chuyển |

Ảnh chụp ở `evidence/proto/` (7 trạng thái × khổ 1280 và 375), không trạng thái nào tràn
ngang. Khi dựng đã sửa một lỗi khổ điện thoại: dòng trưởng bộ phận đẩy mất tên bộ phận,
nay nằm ở dòng riêng.

Điều bản mẫu lộ ra cho vòng làm thật: hàng bộ phận đang ghép tạm từ nút `ghost` của thư
viện — kho chưa có thành phần cây; nếu làm thật thì cần một thành phần cây trong
`packages/ui` (ứng viên: `@reui/tree`, kéo theo `@headless-tree`), quyết ở Cổng Phạm vi.

Sơ đồ tổ chức trong bản mẫu là bản tĩnh, dựng bằng đường kẻ và ô có sẵn, không thêm thư viện.
Trên khổ 1280 nó vừa khung với 3 bộ phận và 5 phòng ban; trên điện thoại nó rộng khoảng 900
điểm, phải kéo ngang, và ô gốc nằm ngoài khung lúc mở. Nếu chọn sơ đồ có kéo, phóng to, di
chuyển, bản làm thật cần React Flow (`@xyflow/react`) và thư viện dàn trang (`@dagrejs/dagre`) —
hai phụ thuộc mà kho chưa có, cùng là phụ thuộc của block `flow-2`; quyết ở Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khuôn cây hai cấp có ô tìm tự mở nhánh khớp (nhóm là thư mục gập được, mục con là lá) | block Pro ReUI `form-9` (`role-tree.tsx`) | ngôn-ngữ-thiết-kế/hình-thái | đề xuất: có — chỉ khuôn tương tác, dựng lại bằng thành phần sẵn có của kho; không chép mã block | chờ ký ở Cổng Đáng |
| Hình sơ đồ cây từ trên xuống (ô có tiêu đề, dòng phụ, chân ô; đường kẻ nối cha con, tự dàn trang) | block Pro ReUI `flow-2` | ngôn-ngữ-thiết-kế/hình-thái | đề xuất: có — chỉ hình, dựng tĩnh trong bản mẫu; không chép mã block, không thêm thư viện | chờ ký ở Cổng Đáng |

## Out of scope từ khám phá

- Đổi tên, lưu trữ, sắp thứ tự danh sách hiện có — làm ở vòng
  `sua-luu-tru-dieu-phoi`, dùng lại được khi thêm cấp bộ phận ở trên.
