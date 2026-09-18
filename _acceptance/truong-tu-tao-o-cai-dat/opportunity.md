---
schema_version: 1
slug: truong-tu-tao-o-cai-dat
feature: Người quản trị tìm thấy trường tự tạo ở Cài đặt và được gợi ý bộ trường của môi giới Việt
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-18T00:00:00Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Owner mở buổi khai thác 2026-09-18 với đề bài «CRM hiện đại nào cũng có
custom field, hãy research và bắt đầu». Kho **đã có** tính năng đó từ
2026-08-06 (đường di trú `dynamic_fields`): ba bảng dữ liệu, mười kiểu trường,
mười một điểm cuối API kể cả gieo lại giá trị và đếm độ phủ, một màn quản trị
đã Việt hoá. Chính chủ kho không biết nó có. Đó là bằng chứng thực địa rõ nhất
của vấn đề: tính năng tồn tại nhưng **không ai tìm thấy**.

Thuật ngữ ngành, để khỏi tìm lại: HubSpot gọi là *custom properties*,
Salesforce, Zoho và Pipedrive gọi là *custom fields*. Trên màn hình kho đang
gọi là **trường tự tạo** (chuỗi `emptyTitle` trong bản tiếng Việt). Hồ sơ này
dùng chữ đó.

Người gặp: **người quản trị CRM** — chưa có mục trong từ điển sản phẩm. Ở giai
đoạn này là chủ kho, hoặc một nhân viên quan hệ đối tác được giao dựng cấu trúc
dữ liệu cho cả đội. Ai là người này là giả định 1.

Hai chỗ hở, cả hai đều nhìn thấy trên màn hình:

- **Không có đường vào từ Cài đặt.** Màn quản trị trường chỉ mở được từ trong
  thẻ hồ sơ, qua tham số trên địa chỉ (`record-fields.tsx` gọi `useFieldsSheet`).
  Trang Cài đặt có mười hai mục, từ tiền tệ tới khoá API, không mục nào cho
  trường. Mọi CRM ngoài kia đặt nó ở Cài đặt, nên người quản trị đi tìm ở đó và
  không thấy.
- **Gợi ý là của một CRM Mỹ.** Màn Công ty gợi ý bảy trường bằng tiếng Anh
  (`FIELD_TEMPLATES`): vùng bán hàng AMER / EMEA / APAC, phân khúc Enterprise /
  Mid-Market / SMB, giai đoạn Lead / MQL / SQL. OneHub làm tài chính và bất động
  sản ở Việt Nam. Màn Cá nhân và Thoả thuận: danh sách gợi ý rỗng.

Hai chỗ hở khác tìm được cùng buổi, **để ngoài** ô này (xem Out of scope):
mọi thành viên sửa được trường của cả đội vì điểm cuối không kiểm vai trò; và
thiếu kiểu tiền tệ, kiểu nhiều lựa chọn.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người quản trị đi tìm tính năng ở trang Cài đặt trước, không phải trong thẻ hồ sơ | Đường vào hiện có đã đủ; mục Cài đặt là cửa thừa | Hỏi một nhân viên quan hệ đối tác: «muốn thêm một trường vào Cá nhân, anh bấm vào đâu?» — xem họ đi đâu đầu tiên, không chỉ dẫn | Chưa thử — rẻ nhất, không cần dựng |
| 2 | Chưa ai ở OneHub tạo trường tự tạo nào (suy từ việc owner không biết tính năng có) | Đã có trường thật; thay bộ gợi ý có thể trùng khoá trường đang dùng, và ngưỡng SỐNG phải đo khác | Một câu đếm trên bảng `fieldDefinition` của cơ sở dữ liệu thật | Chưa thử |
| 3 | Có một bộ trường mà môi giới tài chính và bất động sản Việt cần thật, đủ chung để làm gợi ý cho cả ba màn | Gợi ý mới cũng bị bỏ qua như gợi ý cũ; chỉ còn giá trị ở đường vào | Hỏi người đang giữ năm đối tác gần nhất: «anh đang ghi gì về họ ở ngoài CRM — Excel, Zalo, sổ tay?» Những cột đó là bộ gợi ý | Chưa thử |
| 4 | Trang mới ở Cài đặt và bộ gợi ý mới không chạm đường T3 | Vòng thành T3, thêm một cổng duyệt kế hoạch | Liệt kê file sẽ chạm, đối chiếu `t3_paths` trong `_acceptance/config.yaml` | **Đúng** 2026-09-18 — vòng chạm `apps/app` và `packages/validation`; đường T3 chỉ gồm xác thực, lược đồ dữ liệu và bảy module của API. Vòng này là T2 |

Giả định 1 và 2 rẻ nhất và nên đi trước: cả hai không cần dựng gì, và giả
định 2 quyết định cách đo ngưỡng.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Một người chưa từng thấy màn này, xuất phát từ trang Cài đặt, có tự tạo được một trường tự tạo trên Cá nhân mà không hỏi ai không?
- Kết quả nào là SỐNG: Trong phiên nghiệm thu, người đó tạo xong một trường trên Cá nhân trong vòng ba phút, không cần chỉ dẫn, và chọn được ít nhất một gợi ý bằng tiếng Việt thay vì gõ từ đầu. Bốn tuần sau khi bật, có ít nhất ba trường tự tạo do người quản trị tạo (không phải đội phát triển gieo) đang mang giá trị trên hồ sơ thật.
- Kết quả nào là CHẾT: Người nghiệm thu không tìm ra đường vào từ Cài đặt trong hai phút; hoặc bốn tuần sau khi bật vẫn không có trường tự tạo nào do người quản trị tạo.
- Timebox: Hai ngày công. Mục Cài đặt là một trang mới trỏ vào thành phần đã có; bộ gợi ý là dữ liệu. Quá hai ngày nghĩa là đang xây lại màn quản trị đã chạy.

Căn cứ: ngưỡng SỐNG đo bằng một trường có tên do người thật tạo, không đo bằng
số lần mở trang, vì màn quản trị mà không ai tạo gì thì mở bao nhiêu lần cũng
là treo tường. Ba phút vì thao tác là ba bước: vào Cài đặt, chọn mục, bấm tạo.
Bốn tuần vì nhu cầu thêm trường nảy ra khi gặp đối tác mới, không nảy ra mỗi
ngày.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Vị trí của trường tự tạo trong cây cài đặt của CRM lớn: HubSpot đặt dưới Settings › Properties, Salesforce dưới Setup › Object Manager | tài liệu công khai của hai hãng | triết-lý/logic | có — chỉ kế thừa «nằm ở Cài đặt», không kế thừa cách trình bày | — |
| Cơ chế gợi ý trường có sẵn: lọc bỏ khoá đã tồn tại, bấm là tạo | `packages/validation/src/field-templates.ts` · `fields-list.tsx` (kho gốc trycompai) | triết-lý/logic | có — giữ cơ chế, thay nội dung | — |
| Nội dung bảy gợi ý tiếng Anh vùng Mỹ | cùng file trên | triết-lý/logic | **không** — sai ngành, sai vùng, sai tiếng | — |
| Cách các trang Cài đặt hiện có dựng: tiền tệ, thành viên, khoá API | `apps/app/app/(app)/[slug]/settings/*` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |

## Cổng 0

Ký 2026-09-18 bởi Phan Le Manh (tên lấy từ git của kho; danh sách người ký
trong cấu hình cổng ghi «Manh Phan», lệch chuỗi, đã nêu tại cổng).

- **decision = build** Căn cứ: owner quyết một chữ sau khi đọc bản đồ hở. Tính năng đã có gần trọn từ 2026-08-06 nên vòng này không xây lại gì, chỉ mở đường vào và thay nội dung gợi ý. Hai ngày công, không chạm đường T3.
- **disposition = archive** Căn cứ: vòng này không dựng prototype nào, nên không có code proto để giữ. Máy điền ô này vì nó không còn lựa chọn thật; owner sửa một câu nếu nghĩ khác.
- **Ngưỡng UAT chốt cùng lúc ký:** đúng bốn dòng ở mục Ngưỡng bên trên, chốt nguyên văn bản đề xuất, owner không sửa số nào. Phép đo tại phiên nghiệm thu: một người chưa từng thấy màn này, xuất phát từ trang Cài đặt, tạo xong một trường trên Cá nhân trong ba phút, không cần chỉ dẫn, và dùng ít nhất một gợi ý tiếng Việt. Đo sau bốn tuần: ít nhất ba trường tự tạo do người quản trị tạo đang mang giá trị trên hồ sơ thật.

## Thước đo thành công → ứng viên criterion

- Từ trang Cài đặt tới màn trường tự tạo: một lần bấm, và mục có tên bằng tiếng
  Việt theo luật nhãn của từ điển.
- Cả ba màn Công ty, Cá nhân, Thoả thuận đều có gợi ý bằng tiếng Việt, đúng
  ngành tài chính và bất động sản; không còn gợi ý nào của bộ cũ hiện ra.
- Chọn một gợi ý là tạo xong trường, kiểu và lựa chọn đã điền sẵn, người chỉ
  cần xác nhận.
- Đo sau khi bật: số trường tự tạo do người quản trị tạo sau bốn tuần — cần
  phân biệt được với trường đội phát triển gieo; **chưa có dấu phân biệt** trên
  bảng, là việc S1 phải quyết.

## Out of scope từ khám phá

- Chặn quyền sửa trường theo vai trò, chỉ chủ sở hữu và quản trị được sửa — ô
  riêng, chạm `packages/auth` nên là T3; rủi ro hằng ngày thấp vì giao diện chỉ
  cho lưu trữ mềm, không cho xoá.
- Kiểu tiền tệ, kiểu nhiều lựa chọn, trường tính toán — ô riêng, chờ có người
  đòi; kho đã có hệ tiền tệ riêng nên kiểu tiền tệ không phải việc nhỏ.
- Sửa lại màn quản trị dạng khay trượt — bác: đã Việt hoá, đã chạy; vòng này
  chỉ thêm đường vào và thay gợi ý.
- Trường tự tạo cho thực thể ngoài Công ty, Cá nhân, Thoả thuận — bác: mô hình
  dữ liệu chỉ có ba thực thể, mở rộng là việc khác hẳn.
- Dịch nhãn của trường người đã tạo — bác: dữ liệu người nhập không dịch, theo
  luật kho.
- Nhập trường tự tạo từ HubSpot hay Excel — bác: chưa ai đòi, và giả định 2 nói
  chưa có gì để nhập.
