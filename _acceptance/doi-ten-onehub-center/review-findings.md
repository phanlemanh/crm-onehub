## Trong hợp đồng

(Không có phát hiện nào ánh xạ được vào một AC ở vòng này — sáu phát hiện mới và tám phát hiện mang theo từ round trước đều rơi ngoài phạm vi hợp đồng, xem mục dưới.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A chuoi-that row is checked against its declared cu/moi, not against the line pair it covers**
  Người dùng thấy gì: Bảng kiểm dòng thước loại 'thế tên' hiện chỉ đối chiếu hai chuỗi khai tay, không buộc chúng phải đúng là cặp chữ thật sự đổi trên dòng đó — một dòng thước quan trọng có thể bị sửa sai lặng lẽ mà máy vẫn báo đúng.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: new-contract

- **Deleting a signed ruler file outside _acceptance/ passes silently; the 'bi xoa' branch is unreachable for it**
  Người dùng thấy gì: Nếu một tệp bài kiểm đã ký (nằm ngoài hồ sơ nghiệm thu) bị xoá ở một vòng sau, máy kiểm có thể không báo lỗi — người dùng có thể lặng lẽ mất một bài kiểm tra đã ký mà không ai biết.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **hunk() drops changed lines whose content starts with '--' or '++'**
  Người dùng thấy gì: Một số dòng mã bắt đầu bằng hai dấu gạch ngang hoặc hai dấu cộng có thể bị máy kiểm bỏ sót khi so sánh, khiến vài thay đổi nhỏ trong tương lai không được đối chiếu đúng.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: low
  Đề xuất: known-limits

- **DA_KY leaves out the 'da-cham-boi-thuc-te' status, so 7 signed profiles are not protected**
  Người dùng thấy gì: Bảy hồ sơ đã chấm ở một trạng thái khác chưa được máy kiểm coi là 'đã ký', nên bài kiểm của bảy hồ sơ đó tạm thời không được bảo vệ khỏi bị sửa lặng lẽ ở các vòng sau.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt thay vì quan hệ): loại «chuoi-that» của E13 không buộc cặp khai vào dòng diff**
  Người dùng thấy gì: Loại thước 'thế tên' hiện chỉ cần khai đúng nhãn là được chấp nhận, không bắt buộc đúng là phép đổi tên thật trên dòng đó — một dòng kiểm tra quan trọng có thể bị đổi hẳn ý nghĩa ở vòng sau mà máy vẫn báo đạt.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 4 (đối chứng âm-tính-một-mình, không ghim thông điệp): đối chứng «nhất nhỏ số toBe(2)->toBe(3) bị loại» qua bằng lý do khác**
  Người dùng thấy gì: Một bài tự-kiểm của máy chấm (để chứng minh nó bắt được lỗi sửa số) hiện báo đạt vì một lý do khác với lý do nó tuyên bố, nên độ tin cậy thật của máy kiểm thấp hơn vẻ ngoài.
  file: `_acceptance/doi-ten-onehub-center/rang/thuoc-da-ky.mjs`
  severity: medium
  Đề xuất: known-limits

- **Product name and old default workspace name are defined a second time in workspace-label.ts (r1)**
  Người dùng thấy gì: Nếu sau này ai đó đổi tên sản phẩm hoặc tên không gian mặc định mà chỉ sửa một chỗ, tiêu đề trên đầu trang có thể hiện khác với tên không gian được tạo, gây nhầm lẫn cho người dùng.
  file: `apps/app/lib/workspace-label.ts`
  severity: medium
  Đề xuất: known-limits

- **KhoiHuongDan drops the Card and hand-sizes a display headline on a <p> in apps/app (r1)**
  Người dùng thấy gì: Khối giới thiệu ở cột trái có thể không đồng bộ cách chỉnh cỡ chữ với các khối khác trong sản phẩm về sau, nhưng người dùng hôm nay vẫn thấy đúng như mô tả — không có khung, chữ lớn.
  file: `apps/app/components/cua-vao/khoi-huong-dan.tsx`
  severity: low
  Đề xuất: known-limits

- **The proto keeps a hand-drawn copy of LuoiCham after it moved to packages/ui (r1)**
  Người dùng thấy gì: Trang mẫu nội bộ (không phải trang khách hàng thấy) có thể trông khác dần so với trang đăng nhập thật theo thời gian, nhưng đây không phải màn hình người dùng thực sự nhìn thấy.
  file: `apps/app/app/proto/_modules/doi-ten-onehub-center/index.tsx`
  severity: low
  Đề xuất: known-limits

- **cua-vao-noi-tieng-viet o-ghim.json still pins the onboarding placeholder "CRM"/"crm"; DEFAULT_WORKSPACE_NAME change breaks cua_vao_khong_dich (r1)**
  Người dùng thấy gì: Trang đăng ký/dùng thử lần đầu có thể vẫn gợi ý tên công ty mẫu là tên cũ ở một chỗ nhỏ, và một phép đo không liên quan tới vòng này có thể báo lỗi không ăn nhập.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/o-ghim.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): onehub-center-tieu-de.dom.tsx ghim dòng giới thiệu và mô tả khối hướng dẫn bằng kho messages, không đọc DOM đã vẽ (r1)**
  Người dùng thấy gì: Bài kiểm tra dòng giới thiệu trên trang đăng nhập có thể báo đạt dù trang thật hiện sai hoặc thiếu nội dung đó, vì nó không thực sự nhìn vào những gì hiện lên màn hình.
  file: `apps/app/test/onehub-center-tieu-de.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): ma trận 10 ca {vi,en} × 5 trang của onehub-center-tieu-de thực chất chỉ có 2 cây DOM khác nhau cho mỗi ngôn ngữ (r1)**
  Người dùng thấy gì: Bộ kiểm tra tuyên bố phủ cả năm trang đăng nhập/khôi phục nhưng thực chất chỉ kiểm một kiểu màn hình lặp lại, nên lỗi riêng của bốn trang còn lại có thể không bị phát hiện.
  file: `apps/app/test/onehub-center-tieu-de.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 + 5: vạch (b) «không chú thích mới» của soi-ma.mjs không có đối chứng dương trong script, và regex chỉ bắt chú thích đứng đầu dòng (r1)**
  Người dùng thấy gì: Công cụ kiểm tra 'không thêm chú thích mới trong mã' có thể bỏ sót một số kiểu chú thích, nên chú thích mới lọt qua ở dạng đó sẽ không bị phát hiện.
  file: `_acceptance/doi-ten-onehub-center/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo CHỈ DẪN thay vì ĐẦU RA): onehub-center-thu.spec.ts ghim tiêu đề thư đặt lại bằng hằng số và `appName` bằng grep mã nguồn (r1)**
  Người dùng thấy gì: Bài kiểm tra tiêu đề thư đặt lại mật khẩu có thể báo đạt dù thư thật được gửi ra mang tiêu đề khác, vì nó so với một giá trị định sẵn thay vì thư thực tế được dùng.
  file: `packages/auth/test/onehub-center-thu.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có — mọi phát hiện trên đều đã qua vòng review với refuter còn sống)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).