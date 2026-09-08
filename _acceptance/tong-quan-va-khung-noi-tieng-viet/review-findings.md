## Trong hợp đồng

(không có finding nào khớp AC nào trong vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **monthIso đọc trường UTC của Date dựng theo giờ địa phương — nhãn tháng của biểu đồ lệch một tháng**
  Người dùng thấy gì: Biểu đồ xu hướng trên màn Tổng quan có thể hiển thị nhãn tháng lùi một tháng so với thực tế (ví dụ số liệu của tháng 9 lại được ghi nhãn là tháng 8), khiến người xem dễ đọc nhầm doanh số theo đúng tháng.
  file: `apps/api/src/dashboard/dashboard.service.ts:23`
  severity: high
  Đề xuất: new-contract

- **Tên công ty / cá nhân người nhập trong hàng đợi làm giàu chưa mang translate="no"**
  Người dùng thấy gì: Tên công ty và tên người trong hàng đợi làm giàu có thể bị trình duyệt tự ý dịch sang ngôn ngữ khác, khiến thông tin khách hàng hiển thị sai lệch trên màn hình.
  file: `apps/app/components/enrichment-queue.tsx:221`
  severity: medium
  Đề xuất: known-limits

- **Trend month labels shift back one month in any UTC+ timezone (monthIso reads UTC parts from a local-midnight Date)**
  Người dùng thấy gì: Biểu đồ xu hướng doanh số có thể gắn nhãn sai tháng (lùi một tháng) ở mọi múi giờ phía đông giờ UTC bao gồm giờ Việt Nam, làm người dùng hiểu nhầm số liệu thuộc về tháng nào.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: high
  Đề xuất: new-contract

- **Eval swallows the account-menu click error, turning a can't-measure into a false product failure**
  Người dùng thấy gì: Đây là lỗi trong công cụ kiểm tra tự động, không ảnh hưởng trực tiếp người dùng cuối; nhưng nó có thể khiến người duyệt kết quả tin nhầm sản phẩm đang thiếu sót trong khi email và tên viết tắt thực ra vẫn hiển thị đúng.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs:482`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — E13 khai vết cắm vào khoá thẻ số "Đang mở", script lại cắm vào open.cols.deal / activity.cols.deal**
  Người dùng thấy gì: Tài liệu mô tả bài kiểm tra ghi nhầm vị trí đã thử, khiến người đọc hồ sơ có thể hiểu sai phần nào của màn hình được kiểm chứng, dù kết quả kiểm tra thực tế vẫn đúng và hợp lệ.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml:232`
  severity: high
  Đề xuất: known-limits

- **Tuyên quét LỚP nhưng thiếu ma trận toàn phần — chanBeRongTienDe kết luận "mọi nhãn của lát" trên một tập nhãn bỏ sót cả nhóm lồng lẫn hàm**
  Người dùng thấy gì: Công cụ tự kiểm tra bề rộng nhãn có thể bỏ sót một số nhãn khi kết luận 'không nhãn nào bị tràn', nên vẫn còn khả năng nhỏ một vài nhãn tiếng Việt bị tràn hoặc cắt trên màn hình nhỏ mà không được phát hiện qua kiểm tra tự động.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs:647`
  severity: high
  Đề xuất: known-limits

- **Assert "chuỗi có mặt" thay cho QUAN HỆ — chặn mức mã của E7 dùng regex kề-nhau trên văn bản nguồn**
  Người dùng thấy gì: Cách kiểm tra tự động hiện tại có thể bỏ lọt trường hợp một mã tiền tệ bị viết cứng thay vì lấy từ dữ liệu thật, nghĩa là có nguy cơ nhỏ người dùng thấy sai mã tiền tệ mà việc kiểm tra tự động không kịp phát hiện.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/man-that.mjs:386`
  severity: medium
  Đề xuất: known-limits

- **Đo CHỈ DẪN thay vì ĐẦU RA — E16 khai một ca kiểm mới (formatCount(..., "en")) mà messages-guard.spec.ts không có**
  Người dùng thấy gì: Chưa có bài kiểm tự động xác nhận rằng số đếm hiển thị luôn theo đúng ngôn ngữ người dùng chọn, nên nếu sau này có ai vô tình viết cứng tiếng Anh vào chỗ đó, lỗi có thể lọt qua mà không bị phát hiện ngay.
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml:283`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/8 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/dashboard/dashboard.service.ts, _acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.