# Review findings: zalo-tro-ly-kho-chi-dan (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ nạp chỉ dẫn tro_ly_kho dùng catch trần: lỗi cơ sở dữ liệu bị gộp thành «khong tim thay cau hoi» và mất lý do**
  Người dùng thấy gì: Khi cơ sở dữ liệu gặp sự cố, nhật ký vẫn ghi là «không tìm thấy câu hỏi» và không nói lý do thật. Người trực khó phân biệt sự cố hạ tầng với câu hỏi bị thất lạc, và trợ lý có thể không trả lời.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: known-limits

- **so-do.ts ép kiểu JSON.parse bằng `as` và lặng lẽ bỏ dòng thiếu phienId**
  Người dùng thấy gì: Công cụ kiểm tra bộ 50 câu có thể bỏ qua một dòng kết quả bị hỏng mà không báo. Hôm nay số liệu vẫn đầy đủ và đúng, nhưng lần đo sau có thể báo xanh dù thiếu dữ liệu.
  file: `_acceptance/zalo-tro-ly-kho-chi-dan/rang/so-do.ts`
  severity: low
  Đề xuất: known-limits

- **tro_ly_kho resolver now swallows every moHoi error, including DB failures, and drops the error message**
  Người dùng thấy gì: Một sự cố cơ sở dữ liệu giờ được xử lý như «không tìm thấy câu hỏi», rồi câu hỏi bị đóng như lỗi của mô hình. Người dùng nhận không câu trả lời và đội vận hành thấy sai nguyên nhân.
  file: `apps/agent/agent/subagents/tro_ly_kho/instructions.ts`
  severity: medium
  Đề xuất: known-limits

- **The session.started hook only links the first Zalo question of each chat per day; follow-up questions keep the race, and losing it now ends in the stop instruction**
  Người dùng thấy gì: Khi người dùng hỏi thêm câu thứ hai trong cùng cuộc trò chuyện Zalo trong ngày, lỗi cũ có thể tái diễn. Trợ lý kho có thể dừng mà không trả lời.
  file: `apps/agent/agent/hooks/lien-ket-hoi.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (tuyên quét lớp, thiếu ma trận toàn phần): so-do.ts không khẳng định số phiên bằng số dòng ket-qua.jsonl, lại lọc bỏ dòng thiếu phienId**
  Người dùng thấy gì: Công cụ kiểm tra có thể báo «đạt» dù bằng chứng bị cắt bớt dòng hay chép từ lượt khác. Bằng chứng hôm nay đúng, nhưng thước không tự phát hiện nếu sau này nó bị sửa lệch.
  file: `_acceptance/zalo-tro-ly-kho-chi-dan/rang/so-do.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): AC-5 «không gọi công cụ, trả ngay» chỉ được đo bằng việc so chữ của chỉ dẫn dừng**
  Người dùng thấy gì: Chưa có bằng chứng thực tế cho thấy trợ lý thật sự dừng và không gọi công cụ khi nhận chỉ dẫn dừng. Chỉ kiểm được rằng câu chỉ dẫn đúng nội dung.
  file: `apps/agent/test/zkd-chi-dan.integration.spec.ts`
  severity: medium
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
