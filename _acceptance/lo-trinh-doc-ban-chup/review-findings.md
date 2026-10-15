# Review findings: lo-trinh-doc-ban-chup (vòng 2)

## Trong hợp đồng

- **Bộ test dom của app vẫn đỏ: ngan-ho-so-vai.dom.tsx không còn tìm thấy lời gọi choVaiXem trong page.tsx**
  file: `apps/app/test/ngan-ho-so-vai.dom.tsx:163`
  severity: high
  AC: AC-8
  source: bugs
  detail: Lỗi do thay đổi của nhánh này gây ra. page.tsx của Lộ trình (apps/app/app/(app)/[slug]/lo-trinh/page.tsx) đã bỏ `choVaiXem(await docDauVao(), vai)` và chuyển sang `docDauVaoChoVai(vai, {...})`; hàm docDauVao cũng đổi tên thành docBanDung. Ca «chieu do: ban sao trang truyen khoi nguyen kem vai, ban sao bo buoc loc» của ngan-ho-so-vai.dom.tsx vẫn tìm đúng chuỗi cũ bằng regex `/choVaiXem\(\s*(await docDauVao\(\))\s*,\s*vai\s*\)/`, không thấy nên ném lỗi «khong thay cho goi choVaiXem(await docDauVao(), vai) trong page.tsx». Đã chạy lại để xác nhận: `TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ho-so-vai.dom.tsx` cho 3 pass, 1 fail. Vòng 1 không thấy lỗi này vì chay-tung-tep-dom.ts chạy các tệp theo thứ tự chữ cái và dừng ở tệp đỏ đầu tiên. Lúc đó lo-trinh-ban-chup.dom.tsx (đứng trước) đỏ vì múi giờ, nên ngan-ho-so-vai.dom.tsx chưa bao giờ được chạy. Vòng này đã sửa lỗi múi giờ, nên lệnh suite `bun run test -- --filter=app` (và hook pre-push) sẽ dừng ở ngan-ho-so-vai.dom.tsx với mã 1. Cách sửa: cập nhật phép phá-thử của tệp đó theo cách page.tsx gọi bây giờ (docDauVaoChoVai). Phép này phải còn chứng minh được rằng bước lọc vai nằm ngoài vùng cache và áp dụng cho cả hai nguồn. Đã chạy các tệp dom/spec khác liên quan tới lộ trình và khoá API (khoa-api-loai, lo-trinh, lo-trinh-khung, ngan-ho-so, khung-trang-cai-dat*, tin-hieu-tat-ca, toàn bộ *.spec.ts của app, scripts/ban-chup-lo-trinh): tất cả xanh.
  lý do vào hợp đồng: Ca phá-thử này là chứng cứ giữ cho việc lọc theo vai nằm ngoài vùng cache và áp dụng cho cả bản chụp lẫn tệp đóng gói, chính là điều AC-8 đòi; nay nó đỏ nên AC-8 không còn được chứng minh và bộ test cùng hook đẩy bị chặn.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New gh response reader trusts a type annotation instead of parsing with a schema**
  Người dùng thấy gì: Lệnh đo độ trễ có thể báo lỗi khó hiểu nếu GitHub trả dữ liệu sai dạng. Chỉ chủ kho gặp, chỉ khi chạy lệnh đo, và người dùng trang Lộ trình không bị ảnh hưởng.
  file: `scripts/ban-chup-lo-trinh/do-tre.ts`
  severity: low
  Đề xuất: wont-fix
- **The do-man measurement script hard-codes the Vietnam UTC offset and an inline time window**
  Người dùng thấy gì: Phép đo giờ hiển thị trên màn dùng một con số múi giờ viết cứng thay vì tính từ cùng nguồn với phần còn lại. Trang cho người dùng không đổi, chỉ khó bảo trì phép đo hơn.
  file: `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 3 (đo chuỗi/nhất quán thay cho quan hệ với nguồn): ô neo bản dựng tự so với chính nó, giờ hiện không bị đối chiếu với dungLuc**
  Người dùng thấy gì: Khi trang rơi về bản dựng, phép đo chưa chứng minh giờ hiện ra đúng là giờ của bản dựng; nếu trang hiện nhầm một giờ khác trong vòng sáu giờ gần nhất thì phép đo vẫn xanh. Người dùng có thể thấy một giờ cập nhật sai mà không bị phát hiện.
  file: `_acceptance/lo-trinh-doc-ban-chup/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ghi chú «ban-chup-lo-trinh» trong luotMau được dựng tay, không rút từ dòng lệnh mà day.ts ghi ra**
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

- **Phản hồi JSON của GitHub được ép kiểu thẳng, không phân tích ở biên (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi GitHub hoặc lớp bảo vệ trả về nội dung bất thường, công cụ đẩy lộ trình và công cụ đo độ trễ có thể dừng với thông báo lỗi khó hiểu thay vì câu giải thích rõ ràng, khiến chủ kho khó biết vì sao lượt đẩy hay phép đo không có kết quả.
  file: `scripts/ban-chup-lo-trinh/do-tre.ts`
  severity: low
  Đề xuất: known-limits

- **Running the workflow by hand from any branch pushes that branch's roadmap to production, and later pushes from onehub are then dropped while the run still shows green (r1)**
  Người dùng thấy gì: Nếu chủ kho bấm chạy tay từ một nhánh chưa gộp, trang Lộ trình có thể hiện lộ trình chưa được duyệt và bỏ qua các lần cập nhật đúng sau đó cho tới khi nhánh chính có commit mới hơn, trong khi lượt chạy vẫn báo xanh.
  file: `.github/workflows/ban-chup-lo-trinh.yml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
