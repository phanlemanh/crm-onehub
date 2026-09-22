## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **distDir đọc env bị loadRootEnv() lách qua turbo — outputs của turbo vẫn khai .next/**, cổng build có thể xanh giả**
  Người dùng thấy gì: Máy đo tự động có thể báo "đã dựng xong" dù bản dựng mới nhất chưa thực sự được tạo lại, khiến một lỗi thật có thể lọt qua mà không ai biết.
  file: `apps/app/next.config.ts`
  severity: high
  Đề xuất: known-limits

- **searchParams khai sai hình dạng ở biên — proxy đọc giá trị đầu, trang nhận mảng, lọt đúng lỗ 200 mà docs/proto.md nói proxy sinh ra để bịt**
  Người dùng thấy gì: Nếu ai đó mở một liên kết có hai giá trị trạng thái trùng nhau, trang có thể hiển thị lỗi trong khi hệ thống vẫn báo là tải thành công.
  file: `apps/app/app/proto/[slug]/page.tsx`
  severity: high
  Đề xuất: known-limits

- **may-chu.mjs bảo người chạy `pkill -f "next dev"` — đúng lệnh mà evals.yaml của chính vòng này cấm tuyệt đối**
  Người dùng thấy gì: Hướng dẫn xử lý sự cố trong công cụ nội bộ có thể khiến người vận hành vô tình tắt mất công việc của người khác đang chạy cùng lúc.
  file: `_acceptance/duong-proto-cho-design-pass/rang/may-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **duong-proto.mjs dựng next dev vào .next mặc định, không dùng PROTO_DIST_DIR — đúng cái knob dựng ra để tránh tranh khoá**
  Người dùng thấy gì: Công cụ đo nội bộ có thể bị kẹt và báo lỗi giả khi chạy cùng lúc với một công cụ đo khác, dù bản thân sản phẩm không có gì sai.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **CardContent bị className đè flex-col thành flex-row — docs/design.md cấm đè style component tại call site**
  Người dùng thấy gì: Một khối giao diện trên trang mục lục bị chỉnh tay lệch khỏi kiểu chuẩn của hệ thống thiết kế, có thể trông không đồng nhất với phần còn lại của sản phẩm.
  file: `apps/app/app/proto/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **ban-dung.mjs không bọc try/finally quanh hai máy chủ — máy chủ rò lại chính là nguyên nhân BLOCKED đã ghi**
  Người dùng thấy gì: Nếu công cụ đo nội bộ gặp sự cố giữa chừng, nó có thể để sót một tiến trình chạy ngầm, khiến lần đo tiếp theo báo lỗi giả không liên quan tới sản phẩm.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: medium
  Đề xuất: known-limits

- **mucMoCoi() trong registry.ts là mã chết — phép đo mồ côi thật nằm ở so-dang-ky.mjs, viết lại lần hai**
  Người dùng thấy gì: Có một đoạn mã được viết ra nhưng không ai thật sự dùng đến, làm kho mã khó bảo trì hơn dù không ảnh hưởng đến người dùng cuối.
  file: `apps/app/app/proto/registry.ts`
  severity: low
  Đề xuất: known-limits

- **`tat-ca` nuốt mã thoát 2 của các chân, biến "không đo được" thành "sản phẩm fail"**
  Người dùng thấy gì: Khi công cụ đo tự động gặp sự cố hạ tầng chứ không phải lỗi sản phẩm, nó vẫn có thể báo ra như thể sản phẩm bị lỗi, khiến người đọc báo cáo hiểu nhầm.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: high
  Đề xuất: known-limits

- **`dong()` bắn SIGTERM rồi `process.exit` ngay — bỏ lại máy chủ Next mồ côi giữ khoá thư mục**
  Người dùng thấy gì: Công cụ đo nội bộ có thể để sót một máy chủ chạy ngầm sau khi đo xong, làm các lần đo tiếp theo báo lỗi giả không liên quan tới sản phẩm.
  file: `_acceptance/duong-proto-cho-design-pass/rang/may-chu.mjs`
  severity: high
  Đề xuất: known-limits

- **Vòng chờ máy chủ `catch {}` nuốt mọi lỗi và không nghe sự kiện `exit` của tiến trình con**
  Người dùng thấy gì: Nếu có lỗi cấu hình thật khi khởi động, công cụ đo có thể mất tới 90 giây rồi báo nhầm đó là sự cố hạ tầng thay vì lỗi của sản phẩm.
  file: `_acceptance/duong-proto-cho-design-pass/rang/may-chu.mjs`
  severity: high
  Đề xuất: known-limits

- **`ban-dung.mjs` không có try/finally — một ngoại lệ là bỏ lại `next start` chiếm `.next-proto-do`**
  Người dùng thấy gì: Công cụ đo nội bộ có thể bỏ sót việc dọn dẹp nếu gặp lỗi giữa chừng, để lại một tiến trình chạy ngầm ảnh hưởng đến lần đo sau.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: medium
  Đề xuất: known-limits

- **`PROTO_DIST_DIR=.next-proto-ui` mà E13 bắt dùng không nằm trong .gitignore**
  Người dùng thấy gì: Một thư mục tạm sinh ra khi đo có thể vô tình bị đưa vào kho lưu trữ nếu ai đó thêm file bằng lệnh gộp-tất-cả.
  file: `apps/app/.gitignore`
  severity: medium
  Đề xuất: known-limits

- **Lệch sổ đăng ký ↔ registry không cổng nào bắt; `mucMoCoi()` là mã chết và docs/proto.md hứa sai**
  Người dùng thấy gì: Nếu ai đó thêm một mục mới mà quên khai đủ thông tin, có nguy cơ không phải mọi công cụ kiểm tra chuẩn đều bắt được, và người dùng bấm vào có thể gặp trang lỗi.
  file: `apps/app/app/proto/registry.ts`
  severity: medium
  Đề xuất: known-limits

- **`delete env.PROTO_ROUTE` bị `loadRootEnv()` dựng lại từ `.env` gốc — chân "cờ tắt" không cô lập được**
  Người dùng thấy gì: Nếu máy phát triển đã bật sẵn cờ trong file cấu hình cá nhân, công cụ đo "khi cờ tắt" có thể vô tình đo nhầm vào trạng thái cờ vẫn đang bật.
  file: `_acceptance/duong-proto-cho-design-pass/rang/may-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert "chuỗi có mặt" thay cho QUAN HỆ: aria-current không buộc vào state được yêu cầu**
  Người dùng thấy gì: Phép đo tự động cho trạng thái đang chọn chỉ xác nhận có một dấu hiệu nào đó xuất hiện trên trang, chứ chưa chắc chắn dấu hiệu đó gắn đúng vào đúng mục đang được chọn.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP ("với từng id đã nạp") nhưng vế aria-current chỉ có một điểm-case**
  Người dùng thấy gì: Phép đo tự động chỉ kiểm tra dấu hiệu "đang chọn" cho một trạng thái duy nhất thay vì cả năm trạng thái, nên có thể bỏ sót lỗi ở các trạng thái còn lại.
  file: `_acceptance/duong-proto-cho-design-pass/rang/duong-proto.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert "chuỗi có mặt" thay cho lời hứa docs nói ra LUẬT, và chuỗi đó sống ở mục khác**
  Người dùng thấy gì: Phép đo tự động chỉ kiểm tra một cụm từ có xuất hiện trong tài liệu hay không, nên nếu phần nội dung quan trọng bị xoá mà cụm từ đó còn sót ở chỗ khác, phép đo vẫn báo qua.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình trên log build: không đối chứng dương, thông điệp không ghim gì**
  Người dùng thấy gì: Phép đo lỗi khi dựng bản chạy thật chỉ tìm chữ "error" chung chung trong toàn bộ log, không chắc chắn lỗi đó có thật sự liên quan đến tính năng đang xét hay không.
  file: `_acceptance/duong-proto-cho-design-pass/rang/ban-dung.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — vế "dev_cmd chạy qua turbo" không đo quan hệ nào: lặp lại y nguyên assert đã có ở trên**
  Người dùng thấy gì: Một phần của phép đo tự động lặp lại đúng một kiểm tra đã có, khiến báo cáo trông như đã kiểm tra hai việc trong khi chỉ thật sự kiểm tra một.
  file: `_acceptance/duong-proto-cho-design-pass/rang/khai-bao.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).