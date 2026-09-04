## Trong hợp đồng

Không có phát hiện nào ánh xạ được vào một AC cụ thể trong vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Phạm vi diff được giao là rỗng — đã review vòng chưa đẩy trên onehub thay thế**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Đây chỉ là ghi chú kỹ thuật về việc chọn phạm vi so sánh khi review, không phải một lỗi của sản phẩm.
  file: `N/A — review scope`
  severity: low
  Đề xuất: wont-fix

- **tiengCuaNguoiDoc() nhân bản y hệt getLocale() đã có, và sống nhầm chỗ**
  Người dùng thấy gì: Người dùng không thấy khác biệt ngay bây giờ. Nhưng nếu sau này ai sửa cách nhận diện ngôn ngữ ở nơi khác, ba màn đăng nhập và khai báo có thể không được cập nhật theo, dẫn tới lệch ngôn ngữ giữa các trang.
  file: `apps/app/components/auth-shell.tsx`
  severity: high
  Đề xuất: known-limits

- **Hai form client nhận chuỗi qua prop thay vì đọc useLocale() như mọi client component khác**
  Người dùng thấy gì: Người dùng không thấy khác biệt ngay bây giờ. Nhưng nếu sau này có người thêm chữ mới mà quên chép đủ sang trang gọi form, người dùng có thể thấy thiếu chữ mà không ai được cảnh báo.
  file: `apps/app/app/(landing)/onboarding/onboarding-form.tsx`
  severity: medium
  Đề xuất: known-limits

- **Màn grant-access vẫn nguyên tiếng Anh bên trong khung đã chuyển sang tiếng Việt**
  Người dùng thấy gì: Màn "thêm một bước nữa" trong luồng vào ứng dụng vẫn hiện toàn bộ tiếng Anh, dù các màn ngay trước và khung xung quanh nó đã chuyển sang tiếng Việt, khiến người dùng gặp một màn hình lẫn hai thứ tiếng.
  file: `apps/app/app/(landing)/grant-access/page.tsx`
  severity: medium
  Đề xuất: new-contract

- **Bài kiểm resolveLocale mất hai nhánh hành vi, đổi lấy một khẳng định vô nghĩa**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay bây giờ. Nhưng nếu sau này ai sửa nhầm cách chọn ngôn ngữ tự động, lỗi đó có thể không bị phát hiện, khiến người dùng nhận sai ngôn ngữ mà không ai biết.
  file: `apps/app/test/locale-resolve.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **dot-bien.mjs crashes on load: SAO and APP_SAO are never declared**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Đây là lỗi của công cụ đo tự động thuộc một vòng nghiệm thu khác, không phải lỗi của màn hình người dùng nhìn thấy.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs`
  severity: high
  Đề xuất: known-limits

- **cua-vao.mjs dang-gui branch calls undefined hienRa()**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhưng hiện tại chưa có bằng chứng tự động nào xác nhận nút gửi hiện đúng chữ tiếng Việt lúc đang xử lý, vì công cụ kiểm tra tự động bị lỗi trước khi chạy tới bước đó.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: known-limits

- **SSO sign-in swallows a thrown signIn.sso: no toast, button spins forever**
  Người dùng thấy gì: Nếu đăng nhập bằng SSO gặp sự cố mạng, nút có thể xoay mãi không dừng mà không hiện thông báo lỗi nào, khiến người dùng không biết phải làm gì tiếp theo.
  file: `apps/app/app/(landing)/sign-in/sso-sign-in.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 — đếm chuỗi trên MÃ NGUỒN trang thay vì trên chữ người đọc thấy**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Cách đo tự động hiện tại có thể báo đạt dù một dòng chữ đã biến mất khỏi màn hình thật, nên kết quả đo chưa đáng tin cho tiêu chí này.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — khẳng định 'có chuỗi' không phân biệt nổi trạng thái đang tải với trang đã xong**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhưng hiện chưa có bằng chứng tự động thật sự xác nhận màn hình lúc đang tải hiện đúng tiếng Việt, vì công cụ đo chưa từng mở được đúng thời điểm đó.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: known-limits

- **Phép đo không chạy được — `hienRa` chưa định nghĩa, chặng dang-gui (E5) ném ReferenceError**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Công cụ kiểm tra tự động bị dừng giữa chừng nên chưa xác nhận được nút gửi hiện đúng chữ tiếng Việt lúc đang xử lý.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 — E12 tuyên quét LỚP, bài kiểm được gọi chỉ có năm điểm-case**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay. Nhưng phạm vi kiểm tra tự động cho toàn bộ kho chữ hiện hẹp hơn những gì được công bố, nên một số chữ thiếu hoặc sai có thể lọt qua mà không bị bắt.
  file: `apps/app/test/auth-messages.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture tRPC viết tay đúng khuôn bên đọc, không bao giờ đi qua bên ghi thật**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhánh "chưa có cách nào để vào" vẫn chưa được xác nhận bằng một phép đo chạy được thật sự, nên chưa có bằng chứng đáng tin cho trường hợp này.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — chặng chân trang chỉ có khẳng định âm tính, không đối chứng dương, không ghim đúng chuỗi đã khai**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhưng phép đo hiện tại có thể báo đạt ngay cả khi màn hình bị lỗi trắng trang, nên kết quả đo cho tiêu chí gỡ dòng chân chưa đáng tin cậy hoàn toàn.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — sổ khai sinh chỉ chạy chiều lành, tự ghi 'chua chung' cho cả 15 mục**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Nhưng chưa có bằng chứng nào cho thấy các phép đo tự động thật sự có khả năng báo lỗi khi sản phẩm bị hỏng, nên độ tin cậy của toàn bộ báo cáo đo tự động còn thấp.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/khai-sinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 — cổng mặc định 3300/3301 trỏ ra ngoài cây đang kiểm, và executor khai sinh là cái duy nhất không ghi đè**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Nhưng một phép đo tổng hợp quan trọng hiện đang đo nhầm máy chủ, nên kết quả của nó chưa xanh được lần nào và chưa nói lên điều gì về sản phẩm thật.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/may-chu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — dấu translate="no" kiểm bằng 'có phần tử nào đó' thay vì đúng ô đã ghim**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhưng phép đo hiện tại có thể báo đạt dù một trong các mục không nên dịch bị bỏ sót, nên bằng chứng cho tiêu chí này chưa chặt như đã hứa.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — nhãn nút SSO đo bằng regex 'có mặt tên', động từ đã dịch không hề được đo**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhưng phần quan trọng nhất của lời hứa — động từ trên nút đăng nhập SSO phải được dịch — hiện chưa có bằng chứng tự động nào xác nhận.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đầu vào hội đồng lấy từ kho chuỗi trên đĩa, không lấy từ đầu ra đã dựng**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Nhưng bằng chứng dùng để chấm ba nhãn trường của màn khai báo hiện lấy từ kho chữ có sẵn thay vì từ màn hình thật đã dựng, nên chưa chứng minh được điều đã hứa.
  file: `_acceptance/cua-vao-noi-tieng-viet/rang/cua-vao.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/19 lỗi rơi vào file không bộ đo nào phủ (N/A — review scope, _acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
