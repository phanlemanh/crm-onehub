# Review findings — cron-theo-ban-khai

## Trong hợp đồng — máy đã sửa

- **Neo «sáu đường» sai** — 6 là số đường tôi đã thử bằng `curl`, không phải số đường API khai. Quét bằng AST ra **7**: còn `/internal/listings/ingest`, vốn không nằm trong lịch nên tôi không thử tới. Đã sửa neo và đổi luật AC-4 từ «bằng đúng sáu» sang «mọi path của bản khai phải trỏ tới một route có thật, và bộ quét phải bắt được cả bí danh».
- **Chân E1/E3 để lại rác** — `process.exit()` trong khối `try` **bỏ qua** `finally`, nên bản khai không được khôi phục sau một lượt đỏ. Đã đổi sang gom mã rồi thoát SAU `finally`, và thêm bước kiểm khôi phục.
- **Bước «vắng hẳn file» của E3 không đúng hình dạng** — tôi ghi file rỗng thay vì xoá, nên lượt dựng đỏ vì lỗi phân tích JSON chứ không phải vì thiếu bản khai, và thông điệp không nêu tên file. Đã đổi sang đổi tên file đi rồi trả lại.
- **Lối đo bằng worktree không dựng được** — bản sao thiếu vật sinh ra lúc cài. Đã đổi sang đo trên cây thật có khôi phục và kiểm khôi phục, đúng lối đã chứng ở vòng trước.

## Ngoài hợp đồng — người quyết ở Gate 2

- **Biến môi trường của dự án API chỉ đặt cho production, nên không bản xem trước nào dựng được**
  Người dùng thấy gì: mọi lượt dựng xem trước của `crm-onehub-api` đổ ngay ở bước cài, vì postinstall của `@crm/db` gọi prisma và đòi `DATABASE_URL`. Nghĩa là trước vòng này, không PR nào có bản xem trước để bấm thử.
  Máy đã cắm `DATABASE_URL` và `POSTGRES_URL_NON_POOLING` cho môi trường preview để phép đo AC-8 chạy được trước khi merge. Điều đó khiến **bản xem trước dùng chung cơ sở dữ liệu production** — đúng như `docs/setup.md` của hãng đã khai là tình trạng hiện tại, nhưng vẫn là một rủi ro thật: một bản xem trước có migration mới sẽ áp thẳng lên dữ liệu thật.
  file: `docs/setup.md`
  severity: P1
  Đề xuất: known-limits — hãng đã khai điều này và nói «cho tới khi đổi»; tách cơ sở dữ liệu cho preview là một hồ sơ riêng có ngưỡng của nó

- **Nhịp `*/5 * * * *` cần gói Pro; trên gói Hobby nó âm thầm thành hằng ngày**
  Người dùng thấy gì: `docs/environment.md` nói thẳng điều này. Vòng này làm cho năm việc được đăng ký, nhưng không đo chúng chạy đúng nhịp trên gói hiện tại. Nếu tài khoản đang ở Hobby thì đồng bộ hộp thư chạy mỗi ngày một lần chứ không phải năm phút.
  file: `apps/api/vercel.json`
  severity: P2
  Đề xuất: known-limits — đây là giới hạn của nền tảng, không của mã; đo nó cần một hồ sơ theo dõi lượt chạy thật qua nhiều ngày

- **`/internal/listings/ingest` không có trong lịch nào**
  Người dùng thấy gì: đường này tồn tại và tự canh cửa, nhưng không cron nào gọi nó. Nó là đầu vào cho bộ thu thập tin rao ở `tools/listing-crawl`, tức có thể đúng là được gọi từ ngoài chứ không theo lịch.
  file: `apps/api/src/listings/listings.controller.ts`
  severity: P2
  Đề xuất: known-limits — chưa có bằng chứng nó CẦN một lịch; ghi lại để lần sau ai đọc bản khai không tưởng là sót
