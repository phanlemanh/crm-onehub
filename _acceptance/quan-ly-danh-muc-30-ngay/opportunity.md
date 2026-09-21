---
schema_version: 1
slug: quan-ly-danh-muc-30-ngay
feature: Người điều phối lọc, sắp, tìm và xem theo bảng cột trên danh mục 30 ngày đầu — và bộ lọc ra không kết quả không còn đẩy họ vào ngõ cụt
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-21T10:17:16Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Gộp hai nguồn theo lời chủ kho ngày 2026-09-21 («kết hợp quản lý như filter,
board…»):

1. **Hạt giống Ngoài-13** của hồ sơ `dieu-phoi-30-ngay-dau`, định đoạt «mở hợp
   đồng mới» tại Cổng Bằng chứng: chọn một bộ lọc không khớp kế hoạch nào thì
   màn danh mục hiện nhầm «chưa có khuôn nào», thanh lọc biến mất, và người
   dùng không còn lối bỏ lọc.
2. **Công cụ quản lý** mà danh mục chưa có: bộ lọc đầy đủ, sắp xếp, tìm, và
   một cách xem theo bảng cột.

Đọc mã ngày 2026-09-21:

- Màn danh mục tự dựng bảng bằng `Table` và các nút lọc `Badge`, KHÔNG dùng
  `DataTable` dùng chung của `packages/ui`. Vì thế nó không hưởng những thứ các
  màn Công ty, Cá nhân, Thoả thuận đã có: tab, bộ lọc theo nhóm, chọn dòng,
  góc nhìn lưu sẵn.
- Ba hạn chế đã biết của hồ sơ trước rơi đúng vào màn này và sẽ tự hết nếu màn
  chuyển sang khung chung: tìm và sắp nhận tham số nhưng bỏ qua (Ngoài-6), nút
  lọc không dùng được bằng bàn phím (Ngoài-10), mở đường dẫn đã lọc thì chớp
  một nhịp (Ngoài-11). Danh mục còn cắt ở 25 hàng mà không phân trang.
- **Kho chưa có bảng cột (kanban) ở bất kỳ màn nào**, kể cả Thoả thuận. Bảng
  cột là một thành phần MỚI, và theo luật kho nó phải sống ở `packages/ui`,
  không dựng tại chỗ.

**Người gặp:** nhân viên quan hệ đối tác và trưởng các bộ phận chạy 30 ngày —
người phải trả lời «đối tác nào đang tắc, tắc ở đâu, ai cầm».

## Câu hỏi chỉ chủ kho trả lời được

Bảng cột chia cột theo cái gì quyết cả cỡ lẫn giá trị của ô này:

| Lựa chọn | Mỗi cột là | Mỗi thẻ là | Trả lời câu hỏi nào |
|---|---|---|---|
| (a) Theo bước đang tắc | một bước của khuôn | một kế hoạch | đối tác nào tắc ở bước nào |
| (b) Theo bộ phận | một bộ phận | một kế hoạch, hoặc một bước đang chờ bộ phận đó | bộ phận nào đang ôm việc |
| (c) Theo bậc phễu môi giới | một trong bốn bậc | một môi giới | mỗi sàn có bao nhiêu người ở mỗi bậc |
| (d) Theo trạng thái kế hoạch | đang chạy / đã đóng | một kế hoạch | ít giá trị — đã có bộ lọc làm việc này |

Máy nghiêng về (a): nó đánh đúng cơn đau «không ai biết đối tác đang ở đâu» mà
hồ sơ cơ hội gốc ghi, và thước (d) của Cổng Giá trị («đối tác X đang tắc ở bậc
nào trả lời được từ một màn»). Và cần biết: kéo thẻ giữa các cột có nghĩa là
**đổi trạng thái thật** (đánh dấu bước xong), hay chỉ để xem?

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người điều phối cần nhìn theo cột, không chỉ lọc bảng dòng | Bảng cột là công sức dựng một thành phần mới mà không ai mở | Trong phiên nghiệm thu của `dieu-phoi-30-ngay-dau`, hỏi mỗi bộ phận: họ hỏi «ai đang tắc» bằng cách nào trên Sheet hôm nay | Chưa thử |
| 2 | Số kế hoạch đồng thời đủ nhiều để lọc, sắp, phân trang đáng công | Với năm đối tác một lúc thì một bảng dòng là đủ, và ô này chỉ nên vá Ngoài-13 | Đếm số đối tác ký mới mỗi tháng | Chưa thử |
| 3 | Kéo thẻ để đổi trạng thái là đường người dùng muốn | Kéo nhầm đổi dữ liệu thật mà không hỏi — một thao tác khó đảo đặt ngay dưới tay | Hỏi chủ kho trước khi thiết kế (xem câu hỏi ở trên) | Chưa thử |

Giả định 1 và 2 nên đo TRONG phiên nghiệm thu của hồ sơ trước, không cần phép
thử riêng.

## Ngưỡng chết / ngưỡng UAT

Bốn dòng dưới **đã chốt tại Cổng Đáng ngày 2026-09-21** — máy đề xuất, chủ kho ký «build».

- Câu hỏi phép đo trả lời: Người điều phối có trả lời được «đối tác nào đang tắc, ở bước nào, bộ phận nào đang cầm» mà không mở từng hồ sơ không?
- Kết quả nào là SỐNG: Đủ bốn điều — (a) bộ lọc ra không kết quả hiện đúng trạng thái «không khớp» kèm lối bỏ lọc, không bao giờ hiện «chưa có khuôn»; (b) danh mục dùng khung bảng chung: tìm, sắp, phân trang, bộ lọc theo nhóm, và cả bộ lọc lẫn góc nhìn nằm trong đường dẫn; (c) bảng cột ở cả bốn cách chia hiện đủ mọi kế hoạch đang chạy, không cột nào tràn khung ở khổ 768; (d) trong phiên nghiệm thu, câu hỏi ở trên trả lời được trong một phút bấm đồng hồ.
- Kết quả nào là CHẾT: Bảng cột có mà trong phiên nghiệm thu không bộ phận nào mở nó thay bảng dòng; hoặc kéo thẻ đổi dữ liệu mà không có bước xác nhận hay đường hoàn tác.
- Timebox: Vá Ngoài-13 và chuyển sang khung bảng chung trước — một ngày công. Bảng cột là nửa sau.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khung bảng chung: tab, bộ lọc nhóm, chọn dòng | `packages/ui/src/components/data-table.tsx` | ngôn-ngữ-thiết-kế/hình-thái | có — bắt buộc theo luật kho | — |
| Góc nhìn lưu sẵn | màn Công ty, Cá nhân (`saved-view`) | triết-lý/logic | có | — |
| Danh sách kéo thả sẵn có | `packages/ui/src/components/sortable-list.tsx` | ngôn-ngữ-thiết-kế/hình-thái | có thể — làm nền cho bảng cột | — |
| Bảng cột của công cụ quản dự án | Trello · Linear · monday (trang sản phẩm công khai) | triết-lý/logic | có về ý — hình thái theo chuẩn kho | — |

## Cổng 0

- **decision = build** — chủ kho, 2026-09-21: «build cả hai, bảng cột theo đủ các
  loại trên». Bảng cột có ĐỦ bốn cách chia (a) bước đang tắc · (b) bộ phận ·
  (c) bậc phễu môi giới · (d) trạng thái kế hoạch, người chọn cách chia ngay
  trên màn. Chủ kho cho làm bảng cột ngay, không đợi giả định 1 qua.
- **Kéo thẻ — chưa được trả lời.** Máy ghi giả định an toàn: bảng cột CHỈ ĐỂ
  XEM, không kéo đổi dữ liệu. Hợp đồng mang dòng này; chủ kho sửa tại Cổng Phạm
  vi nếu muốn kéo để đổi trạng thái thật.
- **Ngưỡng UAT chốt cùng lúc ký:** nguyên văn bốn dòng ở mục ngưỡng phía trên.

## Out of scope từ khám phá

- Bảng cột cho Thoả thuận hay các màn khác — thành phần sẽ dùng lại được, nhưng áp vào màn khác là ô riêng.
- Cổng cho chính đối tác xem tiến độ — ứng viên vòng hai của hồ sơ gốc.
