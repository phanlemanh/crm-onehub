## Trong hợp đồng

[]

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The same permission now has two sources: workspace.get.canManageSettings has no reader**
  Người dùng thấy gì: Xoá gọn có thể khiến quyền 'ai được đổi Cài đặt chung' bị đọc từ hai nơi khác nhau; nếu sau này có màn mới lỡ dùng nguồn cũ, người dùng có thể thấy sai ai đang được phép sửa cài đặt.
  file: `apps/api/src/workspace/workspace.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **The research gate schema in packages/validation copies the API's researchKeyOutput instead of being the single shape**
  Người dùng thấy gì: Có hai nơi tự khai cùng một hình dạng dữ liệu cho khoá nghiên cứu; nếu sửa một chỗ mà quên chỗ kia, người dùng có thể thấy trạng thái khoá nghiên cứu hiển thị sai mà không có cảnh báo.
  file: `packages/validation/src/cong-nghien-cuu.ts`
  severity: low
  Đề xuất: known-limits

- **chup.mjs swallows the hydrate-wait timeout, so a measurement failure is reported as a product failure (exit 1 instead of 2)**
  Người dùng thấy gì: Nếu máy đo bị chậm khi tải trang cài đặt, công cụ đo có thể báo nhầm đây là lỗi thật của sản phẩm, trong khi thực ra chỉ là môi trường đo bị treo.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **afterAll restores the agent model with contextWindowTokens 0 instead of its original value**
  Người dùng thấy gì: Nếu bộ thử nghiệm chạy trên một cơ sở dữ liệu thử đã có sẵn cấu hình model tuỳ chỉnh, việc chạy thử tính năng này có thể vô tình xoá mất cấu hình model trợ lý đã lưu trước đó.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): E8 dựa vào khối it() cũ còn nguyên văn, không chứng minh khẳng định cũ vẫn chạy**
  Người dùng thấy gì: Bộ kiểm tra tự động của vòng nghiệm thu có thể báo 'các kiểm tra cũ vẫn chạy đủ' ngay cả khi một số kiểm tra cũ đã bị tắt ngầm, khiến người đọc báo cáo tin nhầm là mọi thứ vẫn được kiểm đủ.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/khang-dinh-cu-nguyen-ven.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E10 chứng «onboarding.ts gọi hàm chung» bằng cách grep chuỗi import**
  Người dùng thấy gì: Một phần bằng chứng cho 'màn cổng gọi đúng hàm dùng chung' chỉ dựa vào việc có dòng khai báo trong mã nguồn, không chứng minh hàm đó thực sự chạy đúng — phần hành vi thật vẫn được đo riêng ở chỗ khác.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận toàn phần không viết trước): số khối 30 của E8 không được ghim, hai vế đếm cùng một regex**
  Người dùng thấy gì: Con số dùng để chứng minh 'đã bắt đủ mọi đoạn kiểm tra cũ' được tính bằng chính công cụ đang bị kiểm tra, nên nếu sau này đổi cách viết bài test, con số này có thể không còn đáng tin mà không ai nhận ra.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/khang-dinh-cu-nguyen-ven.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).