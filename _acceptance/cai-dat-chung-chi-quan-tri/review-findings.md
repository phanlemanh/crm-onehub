## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **chup.mjs: hỏng hạ tầng thoát mã 1 (hiểu là «có dòng SAI») thay vì mã 2 «không đo được»**
  Người dùng thấy gì: Khi máy chủ đo hoặc trình duyệt gặp trục trặc hạ tầng lúc chụp bằng chứng, báo cáo nghiệm thu có thể hiện tính năng bị lỗi dù tính năng thật vẫn hoạt động bình thường.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **chup.mjs nuốt lỗi hết thời gian chờ hydrate rồi vẫn chấm, nên trang chưa tải xong bị tính là SAI của sản phẩm**
  Người dùng thấy gì: Nếu màn hình chưa kịp tải xong lúc máy chụp ảnh, báo cáo có thể ghi nhầm thành lỗi của tính năng dù người dùng thật không gặp lỗi đó.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/chup.mjs`
  severity: low
  Đề xuất: known-limits

- **chup.mjs: infrastructure failures exit with code 1 (the "SAI" code) and print no KET LUAN line**
  Người dùng thấy gì: Khi máy chủ đo hoặc trình duyệt gặp trục trặc hạ tầng lúc chụp bằng chứng, báo cáo nghiệm thu có thể hiện tính năng bị lỗi dù tính năng thật vẫn hoạt động bình thường.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **khang-dinh-cu-nguyen-ven only guards it/test blocks, so describe.skip on an old describe passes both halves of E8**
  Người dùng thấy gì: Bộ kiểm tra hồi quy hiện có một lỗ hổng: nếu sau này ai đó tắt cả một nhóm bài kiểm cũ, báo cáo nghiệm thu vẫn có thể báo đạt dù các bài kiểm đó không còn chạy.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/khang-dinh-cu-nguyen-ven.mjs`
  severity: medium
  Đề xuất: known-limits

- **The evidence/ folder still holds the round-1 E9 failure files, which contradict a new passing run**
  Người dùng thấy gì: Thư mục bằng chứng còn giữ lại ảnh và log của lần đo thất bại trước đó, có thể khiến người xem báo cáo hiểu nhầm là tính năng vẫn đang lỗi.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/evidence/E9-tien-de-that-bai.html`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): đối chứng của nút lưu không cùng trạng thái với ca thành viên**
  Người dùng thấy gì: Bài kiểm so sánh nút mờ giữa thành viên và quản trị hiện chưa chứng minh chắc chắn rằng nút mờ là do phân quyền; nếu sau này phân quyền bị gỡ nhầm, bài kiểm có thể vẫn báo đạt.
  file: `apps/app/test/cai-dat-chung-khoa.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định «chuỗi có mặt» trong khi lời hứa là một quan hệ): khối it() cũ còn nguyên văn không có nghĩa là khẳng định cũ vẫn chạy và vẫn đạt**
  Người dùng thấy gì: Bộ kiểm tra hồi quy chỉ tìm chữ có mặt trong tệp chứ chưa chắc các bài kiểm cũ thật sự đã chạy và đạt; nếu sau này một nhóm bài kiểm bị tắt qua describe, báo cáo vẫn có thể báo đạt.
  file: `_acceptance/cai-dat-chung-chi-quan-tri/rang/khang-dinh-cu-nguyen-ven.mjs`
  severity: medium
  Đề xuất: known-limits

- **Gate union declared twice: CongNghienCuu in validation duplicates Gate in onboarding.ts (r1)**
  Người dùng thấy gì: Không ảnh hưởng ai ngay bây giờ, nhưng nếu sau này có người thêm một trạng thái mới vào một nơi mà quên nơi kia, cổng kiểm khoá nghiên cứu và cổng chặn quyền có thể lệch nhau mà không ai nhận ra.
  file: `packages/validation/src/cong-nghien-cuu.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không phân biệt được): ca nonMember của E2 không bao giờ tới requireManager, nên chiều đỏ "requireManager bỏ qua role null" không đỏ được (r1)**
  Người dùng thấy gì: Người không thuộc workspace vẫn bị từ chối đúng như đã hứa; đây chỉ là một cách kiểm nội bộ chưa phân biệt được lý do chặn, không phải lỗi thật khiến ai đó lọt qua được cửa chặn.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn/mã nguồn thay vì đầu ra): E10 chứng minh "onboarding.ts gọi chính hàm này" bằng cách tìm chuỗi import trong tệp nguồn (r1)**
  Người dùng thấy gì: Việc có đẩy vào màn cắm khoá hay không vẫn được đo bằng dữ liệu thật; chỉ riêng lời hứa phụ 'dùng đúng một hàm chung' được kiểm bằng cách tìm chữ trong mã nguồn, nên nếu sau này có người viết lại logic tương tự mà quên gọi đúng hàm, bài kiểm có thể không phát hiện ra.
  file: `apps/api/test/cai-dat-chung-chi-quan-tri.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).