# Review findings: sua-sau-chay-that (round 2)

## Trong hợp đồng

Không có finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): chiều đỏ lượt 2 của E13 chỉ ghim mã câu ở bất kỳ dòng nào, không ghim lượt**
  Người dùng thấy gì: Bước đo lại bộ câu hỏi mẫu vẫn chặn được câu đạt bị đổi thành không đạt ở lượt hai, nhưng phép tự kiểm của nó chưa chứng minh được là báo đúng ở lượt hai chứ không phải lượt một. Nếu bộ so sau này nhầm lượt, kết quả đo vẫn có thể vẫn trông đúng. Nên ghi lại như một hạn chế đã biết về độ chặt của phép đo.
  file: `_acceptance/sua-sau-chay-that/rang/so-bo-mau.ts`
  severity: low
  Đề xuất: known-limits

- **Bảng MIME loại tệp nguồn giờ có hai bản: validation mới và BLOB_NGUON phía máy chủ (r1)**
  Người dùng thấy gì: Hiện chưa có lỗi nào thấy được khi tải nguồn Word hay PDF. Nhưng nếu sau này ai đó sửa loại tệp ở một nơi mà quên nơi kia thì việc tải nguồn có thể bị từ chối mà không rõ vì sao.
  file: `packages/validation/src/tai-lieu-nguon.ts`
  severity: medium
  Đề xuất: known-limits

- **Luật liên kết an toàn chỉ nằm trong packages/ui; API và agent không có nó ở biên (r1)**
  Người dùng thấy gì: Liên kết http do trợ lý soạn hoặc gửi thẳng qua API vẫn lưu được, rồi lúc đọc thì liên kết biến mất mà không có thông báo. Người gõ tay trong trình soạn thì đã được báo.
  file: `packages/ui/src/lib/lien-ket-an-toan.ts`
  severity: medium
  Đề xuất: known-limits

- **Link popover rejects a bare host:port (e.g. a.vn:8080) as a non-https link instead of adding https:// (r1)**
  Người dùng thấy gì: Khi dán một địa chỉ trần có số cổng như a.vn:8080 vào ô liên kết, trình soạn báo nhầm là chỉ nhận https dù địa chỉ đó hợp lệ. Người viết phải gõ thêm https:// thì mới lưu được.
  file: `packages/ui/src/components/trinh-soan-thanh-cong-cu.tsx`
  severity: low
  Đề xuất: known-limits

- **«Soạn lại» is still offered for a source whose target page is archived, so every retry calls the model and fails again (r1)**
  Người dùng thấy gì: Với nguồn mà trang đích đã lưu trữ, nút Soạn lại vẫn bấm được. Mỗi lần bấm tốn một lượt gọi trợ lý rồi lại báo lỗi như cũ.
  file: `apps/api/src/tai-lieu/tai-lieu-nguon.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E1b gieo nguồn DANG_SOAN và trang bằng db.create trực tiếp, không qua đường ghi thật (r1)**
  Người dùng thấy gì: Bài kiểm khẳng định trợ lý không tạo đề xuất cho trang đã lưu trữ dùng dữ liệu gieo tay. Nếu cách hệ thống tạo nguồn thật đổi đi thì bài kiểm vẫn xanh, và lỗi có thể lọt tới người dùng.
  file: `apps/agent/test/ssct-nop-luu-tru.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E14 bước 2 gieo markdown đã thoát &amp;/&lt; viết tay thay vì để trình soạn sinh ra (r1)**
  Người dùng thấy gì: Phép đo màn mục lục dùng nội dung viết tay chứ không lấy từ trình soạn. Nếu trình soạn đổi cách lưu ký tự đặc biệt, mục lục có thể hiện sai chữ mà phép đo vẫn báo đạt.
  file: `_acceptance/sua-sau-chay-that/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có mục.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
