# Review Findings: gioi-han-tep-dom (round 1)

Lượt chấm tuần tự bằng một tác tử tươi chỉ đọc (không qua Workflow fan-out), vì câu yêu cầu gốc có chữ «sửa» và tên tệp — ghi nhớ kho: tác tử chấm của Workflow đã tự sửa cây trong ca đó.

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tệp quá giờ chỉ bị giết đúng tiến trình của nó, không giết tiến trình con nó sinh ra**
  Người dùng thấy gì: Nếu sau này một tệp test DOM tự sinh tiến trình con rồi treo, trình chạy vẫn báo tên tệp và thoát, nhưng tiến trình con có thể giữ job CI đứng tới trần. Hôm nay không tệp DOM nào sinh tiến trình con.
  file: `packages/ui/test/chay-tung-tep-dom.ts:49`
  severity: low
  Đề xuất: known-limits

- **Tệp chết vì tín hiệu khác quá giờ được báo là «đỏ (mã 1)»**
  Người dùng thấy gì: Khi một tệp test sập hoặc bị hệ điều hành giết vì hết bộ nhớ, log chỉ ghi «đỏ (mã 1)», không phân biệt được với một test sai. Hành vi có từ trước vòng này.
  file: `packages/ui/test/chay-tung-tep-dom.ts:61`
  severity: low
  Đề xuất: known-limits

- **Bộ đo gửi tín hiệu tới nhóm tiến trình 0 nếu không sinh được `bun -e`**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Chỉ khi máy không chạy được `bun`, bộ đo của chính trình chạy có thể giết cả lượt test đang chạy thay vì báo lỗi gọn.
  file: `packages/ui/test/chay-tung-tep-dom.spec.ts:89`
  severity: low
  Đề xuất: known-limits
