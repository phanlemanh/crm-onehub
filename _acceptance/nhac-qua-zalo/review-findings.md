## Trong hợp đồng

(rỗng — không finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ZALO_BOT_TOKEN is missing from turbo.json, the third place a new variable must be declared**
  Người dùng thấy gì: Khi chạy ứng dụng ở chế độ phát triển thông thường (không phải cách chạy từng phần được ghi trong tài liệu), tính năng nhắc qua Zalo có thể báo 'chưa bật' dù đã cấu hình đúng.
  file: `turbo.json`
  severity: high
  Đề xuất: known-limits

- **UI copy uses words that are not in CONTEXT.md ('xưởng', 'tác tử') and clash with the app's existing wording**
  Người dùng thấy gì: Một vài dòng chữ trên trang cài đặt Zalo dùng từ khác với cách gọi quen thuộc ở những trang khác trong ứng dụng, có thể khiến người dùng đọc thấy hơi lạ hoặc khó hiểu.
  file: `apps/app/lib/messages/nhac-qua-zalo.ts`
  severity: medium
  Đề xuất: known-limits

- **Zalo's 'no message' status code 408 is written in two places**
  Người dùng thấy gì: Nếu về sau có người chỉnh một trong hai chỗ liên quan đến việc Zalo báo 'không có tin mới' mà quên chỗ còn lại, nhắc việc qua Zalo có thể lặng lẽ báo lỗi sai hoặc bỏ sót lỗi thật; hiện tại chưa xảy ra.
  file: `packages/validation/src/zalo-update.ts`
  severity: low
  Đề xuất: known-limits

- **StatusIndicator's font size is overridden with className instead of its size prop**
  Người dùng thấy gì: Dòng chữ 'Đã nối · <tên Zalo>' trên trang cài đặt có thể hiển thị cỡ chữ hơi khác so với các dòng trạng thái tương tự khác trong ứng dụng.
  file: `apps/app/app/(app)/[slug]/settings/notifications/khoi-zalo.tsx`
  severity: low
  Đề xuất: known-limits

- **A failing getUpdates call ends the Zalo poll, but the connections page still shows the bot as healthy**
  Người dùng thấy gì: Nếu Zalo tạm thời không nhận được tin nhắn dù bot vẫn còn sống, trang kết nối Zalo có thể vẫn báo bot đang hoạt động bình thường, trong khi người nhắn mã liên kết không được trả lời và không ai biết để xử lý.
  file: `apps/agent/agent/lib/zalo-poll.ts`
  severity: medium
  Đề xuất: known-limits

- **A new link code that matches another user's stored code hash hits the unique index with no retry**
  Người dùng thấy gì: Trong một số rất ít trường hợp hiếm gặp, bấm 'Tạo mã' có thể báo lỗi chung chung thay vì tạo mã mới; bấm lại lần nữa sẽ thường thành công.
  file: `packages/db/src/zalo-lien-ket.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình, không ghim thông điệp): E5 zalo-loi chỉ kiểm 'có ném', bỏ thông điệp lỗi**
  Người dùng thấy gì: Chưa có gì đảm bảo rằng khi Zalo từ chối gửi tin nhắc việc, người quản trị sẽ thấy đúng thông điệp lỗi rõ ràng thay vì một lỗi chung chung khó hiểu — điều này chưa được kiểm chứng chắc chắn.
  file: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): khong-token ca 1 kiểm zaloBotName null trong khi beforeEach đã đặt sẵn null**
  Người dùng thấy gì: Trường hợp chưa cấu hình Zalo bot chưa được kiểm chứng chắc chắn bằng phép đo tự động — một lỗi ẩn ở đúng trường hợp này có thể không bị phát hiện.
  file: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E4 'trang <-> máy gửi' gọi kenhSeDungCua bằng tham số của máy gửi, không phải của trang**
  Người dùng thấy gì: Chưa có gì đảm bảo chắc chắn rằng kênh (Zalo hay Slack) hiển thị trên trang cài đặt của một người luôn đúng với kênh thực sự dùng để gửi nhắc việc cho người đó — sai lệch nếu có sẽ khó bị phát hiện.
  file: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): E18 sàn thiết kế chỉ quét 2 page.tsx, bỏ các tệp mang giao diện**
  Người dùng thấy gì: Phần lớn giao diện Zalo mới (khối kết nối, khối trạng thái) chưa được kiểm tra tự động về độ tương phản màu chữ — lỗi hiển thị ở những phần đó có thể lọt qua mà không bị phát hiện.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (quan hệ thứ tự không có đối chứng dương): indexOf = -1 làm assert thứ tự tiêu đề xanh khi thiếu 'Quá hạn'**
  Người dùng thấy gì: Nếu tin nhắc Zalo lỡ thiếu mất mục 'Quá hạn', hiện chưa có gì tự động phát hiện ra thiếu sót đó — người nhận có thể mất thông tin quan trọng mà không ai để ý.
  file: `apps/agent/test/nhac-qua-zalo.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận khai N dòng, số assert ít hơn): E23 dòng 1 'sau hai chu kỳ làm mới vẫn hiện mã' không có assert**
  Người dùng thấy gì: Việc màn hình tự cập nhật đúng trạng thái mã liên kết qua nhiều lần làm mới liên tiếp chưa được kiểm chứng đầy đủ — một lỗi hiển thị ở bước này có thể không bị phát hiện.
  file: `apps/app/test/nhac-qua-zalo.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đếm thay vì quan hệ): E15 kiểm 'đúng 3 dòng đã nối' bằng số lượng, không kiểm là 3 người nào**
  Người dùng thấy gì: Nếu hệ thống ghép nhầm ai đã nối Zalo với ai trên trang kết nối, con số tổng vẫn có thể đúng — người quản trị có thể tin nhầm người đã nối Zalo mà không bị phát hiện.
  file: `apps/api/test/nhac-qua-zalo.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E16 trang kết nối render bằng props viết tay, không rút từ output tRPC qua page**
  Người dùng thấy gì: Trang kết nối Zalo chưa được kiểm chứng bằng đúng dữ liệu định dạng như máy chủ thật trả về — một sai khác nhỏ giữa dữ liệu thật và những gì người dùng thấy có thể chưa bị phát hiện.
  file: `apps/app/test/nhac-qua-zalo.dom.tsx`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/14 lỗi rơi vào file không bộ đo nào phủ (turbo.json, apps/app/lib/messages/nhac-qua-zalo.ts, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.