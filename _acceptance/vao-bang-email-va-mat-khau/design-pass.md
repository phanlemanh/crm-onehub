---
slug: vao-bang-email-va-mat-khau
at: 2026-09-19T02:54:07Z
route: http://localhost:3400/proto/vao-bang-email-va-mat-khau
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (gói ảnh gửi kèm, người phản ứng bằng lời lúc rảnh)
options:
divergence: skipped — hai mặt màn đi theo khuôn đã có trong kho (khung đăng nhập ngoài cổng, bảng thành viên trong cài đặt); không có hai hướng khả dĩ nào để bày
ds_skill: web-design-guidelines
states: [ST-dangnhap-hailoi, ST-dangnhap-sai, ST-datmk-chiaxau, ST-datmk-mkyeu, ST-datmk-nhap, ST-datmk-xong, ST-hopthoai-colienket, ST-hopthoai-dachep, ST-hopthoai-loi, ST-thanhvien-covet, ST-thanhvien-dangphat, ST-thanhvien-nutat]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 2
---
# design-pass — vao-bang-email-va-mat-khau

Bản mẫu render trong host thật của kho, sau cờ `PROTO_ROUTE`, ghép từ component
thật của `@crm/ui` — không vẽ tay HTML. Máy chủ riêng ở cổng 3400 bằng
`next start`: máy chủ dev của chủ kho đang chạy ở 3000 và KHÔNG bị đụng tới.

## Ma trận capture

| ST-dangnhap-hailoi | desktop-1280 | dark | evidence/design-pass/ST-dangnhap-hailoi--desktop-1280--dark.png |
| ST-dangnhap-hailoi | desktop-1280 | light | evidence/design-pass/ST-dangnhap-hailoi--desktop-1280--light.png |
| ST-dangnhap-hailoi | mobile-375 | dark | evidence/design-pass/ST-dangnhap-hailoi--mobile-375--dark.png |
| ST-dangnhap-hailoi | mobile-375 | light | evidence/design-pass/ST-dangnhap-hailoi--mobile-375--light.png |
| ST-dangnhap-sai | desktop-1280 | dark | evidence/design-pass/ST-dangnhap-sai--desktop-1280--dark.png |
| ST-dangnhap-sai | desktop-1280 | light | evidence/design-pass/ST-dangnhap-sai--desktop-1280--light.png |
| ST-dangnhap-sai | mobile-375 | dark | evidence/design-pass/ST-dangnhap-sai--mobile-375--dark.png |
| ST-dangnhap-sai | mobile-375 | light | evidence/design-pass/ST-dangnhap-sai--mobile-375--light.png |
| ST-datmk-chiaxau | desktop-1280 | dark | evidence/design-pass/ST-datmk-chiaxau--desktop-1280--dark.png |
| ST-datmk-chiaxau | desktop-1280 | light | evidence/design-pass/ST-datmk-chiaxau--desktop-1280--light.png |
| ST-datmk-chiaxau | mobile-375 | dark | evidence/design-pass/ST-datmk-chiaxau--mobile-375--dark.png |
| ST-datmk-chiaxau | mobile-375 | light | evidence/design-pass/ST-datmk-chiaxau--mobile-375--light.png |
| ST-datmk-mkyeu | desktop-1280 | dark | evidence/design-pass/ST-datmk-mkyeu--desktop-1280--dark.png |
| ST-datmk-mkyeu | desktop-1280 | light | evidence/design-pass/ST-datmk-mkyeu--desktop-1280--light.png |
| ST-datmk-mkyeu | mobile-375 | dark | evidence/design-pass/ST-datmk-mkyeu--mobile-375--dark.png |
| ST-datmk-mkyeu | mobile-375 | light | evidence/design-pass/ST-datmk-mkyeu--mobile-375--light.png |
| ST-datmk-nhap | desktop-1280 | dark | evidence/design-pass/ST-datmk-nhap--desktop-1280--dark.png |
| ST-datmk-nhap | desktop-1280 | light | evidence/design-pass/ST-datmk-nhap--desktop-1280--light.png |
| ST-datmk-nhap | mobile-375 | dark | evidence/design-pass/ST-datmk-nhap--mobile-375--dark.png |
| ST-datmk-nhap | mobile-375 | light | evidence/design-pass/ST-datmk-nhap--mobile-375--light.png |
| ST-datmk-xong | desktop-1280 | dark | evidence/design-pass/ST-datmk-xong--desktop-1280--dark.png |
| ST-datmk-xong | desktop-1280 | light | evidence/design-pass/ST-datmk-xong--desktop-1280--light.png |
| ST-datmk-xong | mobile-375 | dark | evidence/design-pass/ST-datmk-xong--mobile-375--dark.png |
| ST-datmk-xong | mobile-375 | light | evidence/design-pass/ST-datmk-xong--mobile-375--light.png |
| ST-hopthoai-colienket | desktop-1280 | dark | evidence/design-pass/ST-hopthoai-colienket--desktop-1280--dark.png |
| ST-hopthoai-colienket | desktop-1280 | light | evidence/design-pass/ST-hopthoai-colienket--desktop-1280--light.png |
| ST-hopthoai-colienket | mobile-375 | dark | evidence/design-pass/ST-hopthoai-colienket--mobile-375--dark.png |
| ST-hopthoai-colienket | mobile-375 | light | evidence/design-pass/ST-hopthoai-colienket--mobile-375--light.png |
| ST-hopthoai-dachep | desktop-1280 | dark | evidence/design-pass/ST-hopthoai-dachep--desktop-1280--dark.png |
| ST-hopthoai-dachep | desktop-1280 | light | evidence/design-pass/ST-hopthoai-dachep--desktop-1280--light.png |
| ST-hopthoai-dachep | mobile-375 | dark | evidence/design-pass/ST-hopthoai-dachep--mobile-375--dark.png |
| ST-hopthoai-dachep | mobile-375 | light | evidence/design-pass/ST-hopthoai-dachep--mobile-375--light.png |
| ST-hopthoai-loi | desktop-1280 | dark | evidence/design-pass/ST-hopthoai-loi--desktop-1280--dark.png |
| ST-hopthoai-loi | desktop-1280 | light | evidence/design-pass/ST-hopthoai-loi--desktop-1280--light.png |
| ST-hopthoai-loi | mobile-375 | dark | evidence/design-pass/ST-hopthoai-loi--mobile-375--dark.png |
| ST-hopthoai-loi | mobile-375 | light | evidence/design-pass/ST-hopthoai-loi--mobile-375--light.png |
| ST-thanhvien-covet | desktop-1280 | dark | evidence/design-pass/ST-thanhvien-covet--desktop-1280--dark.png |
| ST-thanhvien-covet | desktop-1280 | light | evidence/design-pass/ST-thanhvien-covet--desktop-1280--light.png |
| ST-thanhvien-covet | mobile-375 | dark | evidence/design-pass/ST-thanhvien-covet--mobile-375--dark.png |
| ST-thanhvien-covet | mobile-375 | light | evidence/design-pass/ST-thanhvien-covet--mobile-375--light.png |
| ST-thanhvien-dangphat | desktop-1280 | dark | evidence/design-pass/ST-thanhvien-dangphat--desktop-1280--dark.png |
| ST-thanhvien-dangphat | desktop-1280 | light | evidence/design-pass/ST-thanhvien-dangphat--desktop-1280--light.png |
| ST-thanhvien-dangphat | mobile-375 | dark | evidence/design-pass/ST-thanhvien-dangphat--mobile-375--dark.png |
| ST-thanhvien-dangphat | mobile-375 | light | evidence/design-pass/ST-thanhvien-dangphat--mobile-375--light.png |
| ST-thanhvien-nutat | desktop-1280 | dark | evidence/design-pass/ST-thanhvien-nutat--desktop-1280--dark.png |
| ST-thanhvien-nutat | desktop-1280 | light | evidence/design-pass/ST-thanhvien-nutat--desktop-1280--light.png |
| ST-thanhvien-nutat | mobile-375 | dark | evidence/design-pass/ST-thanhvien-nutat--mobile-375--dark.png |
| ST-thanhvien-nutat | mobile-375 | light | evidence/design-pass/ST-thanhvien-nutat--mobile-375--light.png |

## Cảnh ngữ-cảnh

Không áp dụng — nấc `host-embedded`, vật đã render trong host thật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Màn đăng nhập và trang đặt mật khẩu ban đầu bọc trong khuôn thẻ. Màn thật KHÔNG dùng thẻ: `auth-shell.tsx` là khung hai cột, cột nội dung `max-w-sm` xếp dọc. Đã dựng lại theo khung thật để bản mẫu giống chỗ nó sẽ sống.
- Cột nút «Phát liên kết» mang tiêu đề cột «Mật khẩu» — một cột toàn nút mà gọi tên là «Mật khẩu» thì đọc ra nghĩa khác. Đã bỏ nhãn nhìn thấy, giữ nhãn cho trình đọc màn hình.
- Hộp thoại chép liên kết không có trạng thái xác nhận đã chép: quản trị bấm xong không biết đã chép hay chưa, rồi chép lại lần nữa. Đã thêm trạng thái `ST-hopthoai-dachep`.
- Lớp `dark` đặt trên vỏ bản mẫu không có tác dụng (lý do ở Nhóm 2). Đã gỡ, thay bằng viền để vẫn thấy ranh giới màn — giữ lớp vô tác dụng là để lại một lời nói dối trong mã.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Khung đăng nhập không tối được ở tông sáng — lỗi có sẵn của kho, không do vòng này.** `:root` khai `--background: var(--ds-background-200)`, nên giá trị được thay MỘT LẦN ở gốc rồi di truyền xuống như một màu chết; khối `.dark` của `geist.css` chỉ đổi biến nguyên thuỷ `--ds-*`, còn khối `.dark` của `globals.css` chỉ đổi sáu token ngữ nghĩa lẻ. Hệ quả: `className="dark … bg-background"` trong `auth-shell.tsx` không đổi được nền. Đo trên chính `/sign-in` ở tông sáng: nền trả về `lab(98.1%)`, tức gần trắng. Ý đồ «màn đăng nhập luôn tối» hiện không thành hiện thực. Người duyệt quyết: khai lại token ngữ nghĩa trong khối `.dark`, hay bỏ hẳn ý đồ luôn-tối ở khung đăng nhập. Vòng này KHÔNG tự sửa — đó là tầng nền, sửa ở vòng của nó.
- Chuẩn giao diện của kho khai là `web-design-guidelines`, nhưng skill đó không chứa luật: nó đi lấy luật từ một địa chỉ ngoài mạng lúc chạy. Phiên này không lấy về, nên nấc chuẩn thực tế đã dùng là **từ vựng token của kho**. Người duyệt biết mình đang duyệt trên nấc nào.
