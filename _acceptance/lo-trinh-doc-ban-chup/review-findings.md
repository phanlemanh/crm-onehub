# Review findings: lo-trinh-doc-ban-chup (vòng 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bằng chứng E3 trộn hai lượt đo: nhật ký ghi giờ 11:32, còn ba ảnh ô bản dựng của E3 hiện 11:33**
  Người dùng thấy gì: Ảnh chụp minh hoạ dòng «Cập nhật lúc» trong hồ sơ nghiệm thu đến từ hai lần chạy đo khác nhau nên giờ trên ảnh lệch một phút so với nhật ký đi kèm. Trang Lộ trình mà người dùng thấy không bị ảnh hưởng, chỉ là bằng chứng lưu lại kém sạch.
  file: `_acceptance/lo-trinh-doc-ban-chup/evidence/E3-log.txt`
  severity: medium
  Đề xuất: known-limits

- **E3b đạt mà không có nhật ký của chính lượt chụp ra ảnh E3b**
  Người dùng thấy gì: Hồ sơ nghiệm thu chỉ giữ nhật ký của một trong hai lần chạy đo, nên không thể kiểm lại bằng chữ kết quả của lần còn lại. Người dùng không thấy khác biệt nào trên trang, nhưng nếu lần đó có lỗi thì hồ sơ không cho thấy.
  file: `_acceptance/lo-trinh-doc-ban-chup/evidence/E3-log.txt`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không ghim nguyên nhân): bản sao «kem-vai» bị bắt vì có prop lạ, không vì lộ chu_kho**
  Người dùng thấy gì: Một bài kiểm bảo vệ số liệu chỉ dành cho chủ kho báo đỏ vì lý do phụ, không phải vì thật sự lộ số liệu, nên nó chứng minh yếu hơn vẻ ngoài. Người dùng không bị lộ dữ liệu vì điều này, chỉ là lưới bảo vệ chưa chắc bắt được đúng ca đó.
  file: `apps/app/test/ngan-ho-so-vai.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **New gh response reader trusts a type annotation instead of parsing with a schema (r2)**
  Người dùng thấy gì: Lệnh đo độ trễ có thể báo lỗi khó hiểu nếu GitHub trả dữ liệu sai dạng. Chỉ chủ kho gặp, chỉ khi chạy lệnh đo, và người dùng trang Lộ trình không bị ảnh hưởng.
  file: `scripts/ban-chup-lo-trinh/do-tre.ts`
  severity: low
  Đề xuất: wont-fix

- **The do-man measurement script hard-codes the Vietnam UTC offset and an inline time window (r2)**
  Người dùng thấy gì: Phép đo giờ hiển thị trên màn dùng một con số múi giờ viết cứng thay vì tính từ cùng nguồn với phần còn lại. Trang cho người dùng không đổi, chỉ khó bảo trì phép đo hơn.
  file: `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (đo chuỗi/nhất quán thay cho quan hệ với nguồn): ô neo bản dựng tự so với chính nó, giờ hiện không bị đối chiếu với dungLuc (r2)**
  Người dùng thấy gì: Khi trang rơi về bản dựng, phép đo chưa chứng minh giờ hiện ra đúng là giờ của bản dựng; nếu trang hiện nhầm một giờ khác trong vòng sáu giờ gần nhất thì phép đo vẫn xanh. Người dùng có thể thấy một giờ cập nhật sai mà không bị phát hiện.
  file: `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ghi chú «ban-chup-lo-trinh» trong luotMau được dựng tay, không rút từ dòng lệnh mà day.ts ghi ra (r2)**
  Người dùng thấy gì: Lệnh đo độ trễ chưa được thử với ghi chú thật mà GitHub trả về sau khi đẩy. Nếu GitHub ghi khác dự kiến, lệnh có thể không nhận ra những lượt đã đẩy và báo kết luận sai cho chủ kho.
  file: `scripts/ban-chup-lo-trinh/test/do-tre.test.ts`
  severity: low
  Đề xuất: known-limits

- **Trần thân 2 MB áp cho toàn bộ cầu REST, không riêng đường đẩy bản chụp (r1)**
  Người dùng thấy gì: Máy chủ nay nhận yêu cầu lớn tới 2 MB ở mọi đường REST, kể cả từ người chưa đăng nhập, thay vì 100 KB như trước. Kẻ xấu có thể gửi nhiều yêu cầu nặng để làm máy chủ chậm hơn.
  file: `apps/api/src/create-app.ts`
  severity: medium
  Đề xuất: known-limits

- **Mã nguồn «crm» khai hai nơi: bên ghi và bên đọc lấy từ hai hằng khác nhau (r1)**
  Người dùng thấy gì: Nếu sau này ai đổi tên nguồn ở một nơi mà quên nơi kia, trang Lộ trình sẽ lặng lẽ hiện bản dựng cũ thay vì bản mới nhất, và không có cảnh báo nào báo cho người quản lý biết.
  file: `apps/app/lib/lo-trinh/cau-hinh.ts`
  severity: low
  Đề xuất: wont-fix

- **Phản hồi JSON của GitHub được ép kiểu thẳng, không phân tích ở biên (r1)**
  Người dùng thấy gì: Khi GitHub hoặc lớp bảo vệ trả về nội dung bất thường, công cụ đẩy lộ trình và công cụ đo độ trễ có thể dừng với thông báo lỗi khó hiểu thay vì câu giải thích rõ ràng, khiến chủ kho khó biết vì sao lượt đẩy hay phép đo không có kết quả.
  file: `scripts/ban-chup-lo-trinh/do-tre.ts`
  severity: low
  Đề xuất: known-limits

- **Running the workflow by hand from any branch pushes that branch's roadmap to production, and later pushes from onehub are then dropped while the run still shows green (r1)**
  Người dùng thấy gì: Nếu chủ kho bấm chạy tay từ một nhánh chưa gộp, trang Lộ trình có thể hiện lộ trình chưa được duyệt và bỏ qua các lần cập nhật đúng sau đó cho tới khi nhánh chính có commit mới hơn, trong khi lượt chạy vẫn báo xanh.
  file: `.github/workflows/ban-chup-lo-trinh.yml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/lo-trinh-doc-ban-chup/evidence/E3-log.txt, apps/app/test/ngan-ho-so-vai.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
