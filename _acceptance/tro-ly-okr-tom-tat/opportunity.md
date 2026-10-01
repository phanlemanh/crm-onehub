---
schema_version: 1
slug: tro-ly-okr-tom-tat
feature: Tóm tắt tuần — sáng hôm sau ngày cập nhật, Trợ lý OKR tóm tắt các lần Cập nhật tuần của một phòng ban; khối tóm tắt đứng đầu bảng họp tuần, câu nào cũng bấm ra lần cập nhật gốc, máy kiểm lại mọi con số; Trưởng phòng ban nhận một dòng trong nhắc buổi sáng và tắt được dòng đó; quản trị bật theo ba nấc tắt · chế độ ẩn · bật
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-30T14:18:50Z
prototype:
  base_commit: fcff16b6
  disposition: archive
---

## Vấn đề & ai gặp

Bảng họp tuần (lượt 5) đã xếp KR «đáng bàn» theo luật — tụt mức tự tin, im quá 14 ngày,
có ghi chú mới — nhưng người đọc vẫn phải tự mở từng dòng để hiểu tuần này phòng mình đi
thế nào. Trưởng phòng ban mở bảng trước giờ họp và chỉ có một danh sách KR; không có một
đoạn nói «tuần này có gì đáng để ý», và muốn biết một con số đến từ đâu thì phải lần vào
diễn biến từng KR.

Ai gặp: Trưởng phòng ban và thành viên dự họp tuần, mỗi tuần một lần, sáng hôm sau ngày cập
nhật của chu kỳ (mặc định thứ Hai, nên sáng thứ Ba). Lộ trình Trợ lý OKR mục 5 «9c» (AI-04).

Nền đã có: 9a (#182) dựng sẵn bảng tóm tắt, bảng phản hồi «hữu ích / không», hai loại việc
`okr-tom-tat-xep` và `okr-tom-tat-tuan`, cột tắt dòng báo trong tuỳ chọn thông báo; 9b
(#207, #212) dựng công tắc ba nấc và hai cột chế độ ẩn cho tóm tắt. Chưa gì chạy: không việc
nào được xếp, không màn nào hiện tóm tắt.

Theo chốt 28/09 (PR #183, «dựng hết bằng dữ liệu mẫu»): lượt này dựng và đo trên bộ OKR mẫu
(`bun run okr:mau`); ba tuần Cập nhật tuần thật ở chế độ ẩn là điều kiện BẬT, không phải
điều kiện dựng. Công tắc tắt khi gộp.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một đoạn tóm tắt ngắn ở đầu bảng giúp buổi họp tuần vào việc nhanh hơn danh sách KR đáng bàn một mình | Không ai đọc; khối tóm tắt thành nhiễu trên bảng | Tỷ lệ Trưởng phòng ban mở bảng họp tuần trong ngày nhận dòng nhắc, và tỷ lệ «hữu ích» | Chưa thử |
| 2 | Chỉ từ số, mức tự tin và ghi chú của các lần cập nhật, model viết được câu đúng mà không bịa số | Câu bị bộ kiểm bỏ hàng loạt, tóm tắt bị giữ lại gần hết các tuần | Ba tuần chế độ ẩn trên Cập nhật tuần thật, đọc tỷ lệ câu bị bỏ | Chưa thử |
| 3 | Dòng báo trong nhắc buổi sáng không làm người ta chán nhắc | Người tắt dòng báo, hoặc bỏ đọc cả tin nhắc | Tỷ lệ tắt dòng báo trước và sau khi bật | Chưa thử |
| 4 | Ca mẫu của bộ OKR mẫu đủ giống Cập nhật tuần thật để ngưỡng chỉnh trên mẫu còn đúng | Đạt trên mẫu, trượt trên thật | Chế độ ẩn ba tuần trên dữ liệu thật trước khi bật | Chưa thử |
| 5 | Chi phí tóm tắt cả tháng nằm gọn trong trần $9 của khu OKR cùng với góp ý | Tóm tắt ăn phần trần của góp ý trong mùa đặt OKR | Sổ chi phí trong ba tuần chế độ ẩn × số phòng ban | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Tóm tắt tuần có đúng số và có được Trưởng phòng ban dùng trước buổi họp tuần không, mà không làm họ tắt nhắc buổi sáng?
- Kết quả nào là SỐNG: Ba tuần chế độ ẩn trên Cập nhật tuần thật: câu bị bộ kiểm bỏ ≤ 10% và 0 số lệch lọt qua (điều kiện bật). Bốn tuần sau khi bật: ≥ 50% lượt Trưởng phòng ban nhận dòng báo có mở bảng họp tuần trong ngày; ≥ 60% phản hồi là «hữu ích»; tỷ lệ tắt dòng báo ≤ 10% Trưởng phòng ban nhận và không tăng tuần qua tuần; chi phí tóm tắt ≤ 1 US$ mỗi tháng.
- Kết quả nào là CHẾT: Có một số lệch lọt qua tới người đọc; hoặc câu bị bỏ > 30% hai tuần liền; hoặc sau ≥ 20 phản hồi, «hữu ích» < 30%; hoặc > 30% Trưởng phòng ban nhận dòng báo đã tắt nó.
- Timebox: Dựng xong trên bộ mẫu trước mùa OKR năm của cấp OneHub; chạy chế độ ẩn từ tuần đầu có Cập nhật tuần thật; phiên nghiệm thu sau bốn tuần bật.

## Kết quả prototype

Không dựng prototype riêng ở Cổng Đáng. Bản mẫu bấm được của khối tóm tắt, trích dẫn và dòng
tắt nhắc dựng ở S1-D (`/proto/tro-ly-okr-tom-tat`) trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Nghiên cứu Tability, WorkBoard và đối thủ OKR (tóm tắt theo nhịp họp, kiểm số) | `docs/reports/2026-09-26-tro-ly-okr/01–05`, `12-kien-truc-va-lo-trinh.md` §2.2, §4.6, §4.11 | triết-lý/logic | có | |
| Kiến trúc và lộ trình Trợ lý OKR (AI-04, trình tự tóm tắt, bộ kiểm lúc chạy) | `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md`, `docs/plan/lo-trinh-tro-ly-okr.md` | triết-lý/logic | có | |
| Thành phần trích dẫn nội dòng của AI Elements | `.agents/skills/ai-elements/references/inline-citation.md` (sổ `docs/chat-ui.md` ghi «Adopted») | ngôn-ngữ-thiết-kế/hình-thái | có — đã có trong sổ của kho, cài vào `packages/ui` bằng CLI | |
| Giao diện tóm tắt của Tability/WorkBoard | như dòng đầu | ngôn-ngữ-thiết-kế/hình-thái | không — dựng bằng `packages/ui` | |

## Cổng 0

- **decision = build.** Căn cứ: lộ trình Trợ lý OKR mục 5 «9c», quyết định 28/09 «dựng hết bằng dữ liệu mẫu» (PR #183); 9a (#182), bộ OKR mẫu (#186) và 9b (#207, #212) đã lên `onehub`; làn A trống. Quyết 2026-09-30 bởi Manh Phan trong phiên lượt 9c, bằng `/acceptance-gate:start tro-ly-okr-tom-tat`; câu gõ nguyên văn: «quyết: build; ngưỡng: gỡ nhãn đề xuất».
- **disposition = archive.** Căn cứ: không có code prototype; nền là mã 9a, 9b đã gộp.
- **Ngưỡng UAT chốt cùng lúc ký:** gỡ nhãn đề xuất cho câu hỏi phép đo, SỐNG, CHẾT và timebox như section Ngưỡng.

## Thước đo thành công → ứng viên criterion

- Câu bị bộ kiểm bỏ trên tổng số câu → AC bộ kiểm ghi câu bị bỏ kèm mã, và câu SQL đếm được theo nấc.
- 0 số lệch lọt qua → AC bộ kiểm số chạy trước khi ghi và chạy lại lúc hiện, và một bộ trích số độc lập đếm số lệch trên mọi câu từng hiện.
- Mở bảng họp tuần trong ngày nhận dòng báo → AC dòng báo ghi vào `daGui` của tin nhắc, đối chiếu với vết mở bảng họp tuần.
- «Hữu ích / không» → AC nút phản hồi ghi một hàng mỗi người mỗi tóm tắt.
- Tắt dòng báo → AC công tắc tắt dòng ở trang Nhắc buổi sáng, và câu SQL đếm tỷ lệ tắt.
- Chi phí tóm tắt → AC sổ chi phí ghi đúng nhóm «tóm tắt» cho phiên con.

## Out of scope từ khám phá

- Tóm tắt cấp bộ phận (T `tom-tat-cap-bo-phan`) — lượt sau, gộp từ các bản đã kiểm của phòng ban.
- Tóm tắt cho Mục tiêu cấp OneHub và Mục tiêu cá nhân — tóm tắt gom theo phòng ban, đúng câu giao.
- Người dùng tự soạn lời nhắc hay đặt lịch tóm tắt riêng — bác: chạy nền với lời nhắc tự do là lối rò (thiết kế §2.3).
- Gửi tóm tắt vào kênh Slack của đơn vị — bác ở lượt này: một bản cho nhiều người là lối rò khi chạy nền (thiết kế §4.12).
- Chữ model trong tin Zalo hay Slack — bác: dòng báo do luật viết, chỉ mang số đếm.
- Cảnh báo KR trượt (AI-06) — lượt 10.
