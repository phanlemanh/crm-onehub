---
slug: truong-tu-tao-o-cai-dat
at: 2026-09-18T07:40:00Z
route: http://localhost:3000/crm/settings/fields
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (gui goi anh, owner phan ung luc ranh)
options:
divergence: skipped — be mat di theo khuon trang Cai dat da co (vo trang chuan, ba the, danh sach va o sua deu la component san co), khong con huong nao may khong tu chac
ds_skill: web-design-guidelines
states: [co-du-lieu, rong]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 1
deferred: 3
---
# design-pass — truong-tu-tao-o-cai-dat

Phiên chạy SAU Cổng Phạm vi, theo quyết định của owner: owner veto dòng bỏ
nghi thức này (`d-20260918T012859Z-7`) và yêu cầu chạy trước Cổng Bằng chứng.
Vì vòng đã code xong, vật bấm được là **sản phẩm thật** trong host thật, không
phải một bản mẫu; đường của nó truyền qua tham số chứ không lấy từ
`design_pass.proto_route` — kho chưa khai khoá đó.

Nấc phản ứng: **nac-1**, không đồng bộ. Máy dựng, tự đo, tự chụp, gửi gói rồi
đi làm việc khác. Không mời owner ngồi cùng.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| co-du-lieu | mobile-375 | dark | evidence/design-pass/co-du-lieu--mobile-375.png |
| co-du-lieu | desktop-1280 | dark | evidence/design-pass/co-du-lieu--desktop-1280.png |
| rong | mobile-375 | dark | evidence/design-pass/rong--mobile-375.png |
| rong | desktop-1280 | dark | evidence/design-pass/rong--desktop-1280.png |
| ban-phim | desktop-1280 | dark | evidence/design-pass/ban-phim--desktop-1280.png |

Trạng thái **lỗi** không chụp ở phiên này: nó đã có ảnh riêng từ thước E12
(`evidence/trang-thai-loi.png`), và dựng lại nó đòi chờ dữ liệu hết hạn ba
mươi giây nên không đáng lặp trong phiên thẩm mỹ.

## Cảnh ngữ-cảnh

Không cần: `context: host-embedded`, vật render trong host thật sau khi đăng
nhập, nên người duyệt thấy luôn đường vào và chỗ nó sống.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- **Esc không đóng ô sửa**, dù đặc tả UX mục 4 khai rằng có. Đây là lỗi thật mà
  chỉ phiên này tìm ra: hai mươi mốt thước trước đó không đo bàn phím, và khay
  trượt thì đóng bằng Esc nhờ hộp thoại nên không ai nghi trang thiếu. Đã vá
  bằng một bộ xử lý bàn phím trên vùng chứa ô sửa, không chạm component nền,
  không thêm màu. Giờ có phép đo canh nó.

### Nhóm 2 — đòi-đổi-DS/component (chờ người duyệt)

- **Hàng ba thẻ không cuộn ngang được.** Đo ở khổ 375: hàng thẻ rộng 201 điểm
  nên vừa khung, không tràn. Nhưng `overflow-x` của nó là `visible`, tức ngày
  nhãn dài hơn hoặc thêm thực thể thứ tư thì thẻ cuối rơi ra ngoài mà không có
  đường cuộn. Đặc tả UX mục 4 khai «ba thẻ cuộn ngang ở khổ hẹp» — hiện nó đúng
  nhờ may, không nhờ thiết kế. Sửa đúng chỗ là ở thành phần thẻ của
  `packages/ui`, không phải ở trang này.
- **Repo khai skill chuẩn giao diện là `web-design-guidelines`, mà skill đó là
  bộ soi lấy luật từ nguồn trên mạng lúc chạy**, không phải một từ vựng token
  của kho. Phiên này vì thế chạy trên token thật của kho đọc từ mã, không trên
  một bản luật đã khai. Người duyệt quyết: nhận nấc đó làm chuẩn, hay đầu tư
  một bản khai token riêng.
- **Trang chỉ có một chủ đề màu để soi.** Kho có hai chủ đề, nhưng phiên này
  chụp ở chủ đề tối vì đó là chủ đề máy chủ dev đang phục vụ. Bản sáng chưa ai
  nhìn ở trang này.
