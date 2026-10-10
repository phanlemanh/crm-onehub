# Review findings: dieu-phoi-va (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC ở vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **tong-quan-du: when the overdue total is 0, the check rejects the correct «sắp hạn» description (false red) (r2)**
  Người dùng thấy gì: Khi người được đo không có việc quá hạn nhưng có bước sắp đến hạn trong vài ngày tới, phép đo màn Tổng quan có thể báo sai dù thẻ hiển thị đúng. Người dùng thật không bị ảnh hưởng; chỉ làm một lượt nghiệm thu có thể đỏ nhầm.
  file: `_acceptance/dieu-phoi-va/rang/man.mjs`
  severity: low
  Đề xuất: known-limits
- **Hình dạng 4 (âm tính đứng một mình): assert mới `xong.sessionId === null` cho mục (10) của E1 không thể đỏ trên đường test đi qua (r2)**
  Người dùng thấy gì: Lời hứa rằng việc mã đối tác lệch được xử lý mà không gọi mô hình AI chỉ được kiểm bằng một dấu hiệu gián tiếp. Nếu sau này có người thêm lệnh gọi mô hình vào đường này, bài kiểm có thể vẫn xanh và không ai hay.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 4 (âm tính đứng một mình): trạng thái tong-quan-du của man.mjs, khi tongDu = 0, chỉ kiểm mô tả KHÔNG chứa « quá hạn» (r2)**
  Người dùng thấy gì: Khi không có việc nào quá hạn, phép đo màn chỉ xác nhận thẻ không ghi «quá hạn», chưa xác nhận thẻ ghi đúng chữ thay thế. Nếu chữ ở thẻ đó bị trống hoặc sai, lượt đo vẫn có thể qua.
  file: `_acceptance/dieu-phoi-va/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 4 (không ghim thông điệp hay danh tính): --tu-thu của khong-xoa-expect chỉ đếm `sai.length === 2`, không kiểm đúng hai câu nào bị bắt (r2)**
  Người dùng thấy gì: Công cụ canh việc ai đó xoá hay sửa các điều kiện kiểm có sẵn tự thử mình khá lỏng, nên về lâu dài có thể bỏ sót một kiểu sửa lén. Rủi ro thấp và không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/dieu-phoi-va/rang/khong-xoa-expect.mjs`
  severity: low
  Đề xuất: wont-fix
- **The platform-code field key now exists in two places, and the API and agent each read their own copy (r1)**
  Người dùng thấy gì: Hôm nay mã đối tác lệch vẫn thành việc cho người cầm trịch đúng như hứa. Nếu sau này ai đổi tên trường mã đối tác ở một nơi mà quên nơi kia, mọi mã, kể cả mã đã khớp, sẽ đều thành việc giao cho người cầm trịch.
  file: `packages/validation/src/onboarding-identify.ts`
  severity: medium
  Đề xuất: known-limits
- **addStep's department check duplicates an existing check and returns a different error for a missing department (r1)**
  Người dùng thấy gì: Chọn một bộ phận không tồn tại thì thêm bước và tạo kế hoạch từ mẫu báo hai kiểu lỗi, hai câu chữ khác nhau. Người dùng vẫn nhận được thông báo đọc được ở cả hai nơi.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: wont-fix
- **If the department list query fails, the add-step form shows an empty department picker and no error (r1)**
  Người dùng thấy gì: Nếu danh sách bộ phận không tải được, form thêm bước hiện ô chọn trống và nút Lưu không bấm được mà không nói lý do; với kế hoạch đã có bước thì nút thêm ở bộ phận khác biến mất như thể không còn bộ phận nào. Người dùng phải tải lại trang mới thử được.
  file: `apps/app/components/crm/record-sheet/plan-steps.tsx`
  severity: low
  Đề xuất: known-limits

- **conSot mixes the server's VN-day overdue count with the browser's local-day count, so it shows an extra-overdue line for steps that are already on screen (r1)**
  Người dùng thấy gì: Người mở Tổng quan từ trình duyệt đặt múi giờ khác Việt Nam, trong vài giờ quanh nửa đêm, có thể thấy dòng «và N việc quá hạn nữa» cho những việc thực ra đã hiện trong danh sách, hoặc thấy thiếu một việc. Người dùng ở Việt Nam không gặp.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận thiếu phần tử): E2 hứa «mỗi hàng AgentTask đều đóng» nhưng chỉ kiểm hàng thứ hai (r1)**
  Người dùng thấy gì: Trong ca gửi lại cùng mã, bài kiểm chỉ xác nhận một trong bốn lượt xử lý được đóng sạch. Nếu một nhánh quên đóng việc thì có thể sót mà không ai thấy ngay.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính không có đối chứng độc lập): claimDue(1) khiến assert âm bị assert dương kéo theo, thông điệp ghim của CHIỀU ĐỎ không bao giờ hiện (r1)**
  Người dùng thấy gì: Nếu một ngày việc mã lệch bị cho vào nhầm làn nghiên cứu, bài kiểm vẫn báo đỏ nhưng nói nguyên nhân sai, nên người sửa mất thời gian hơn để tìm ra.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 3 (kiểm thuộc tính thay cho quan hệ): mạch liền chỉ kiểm hai mã khác nhau, không kiểm bằng mã API đã ghi (r1)**
  Người dùng thấy gì: Bài kiểm chuỗi từ lúc nhận lô tới lúc có việc chỉ xác nhận có hai mã khác nhau, chưa so với đúng mã đã nhận. Một lỗi làm việc mang nhầm mã nhưng vẫn khác nhau sẽ không bị bắt ở bài này.
  file: `apps/agent/test/dieu-phoi-va.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
