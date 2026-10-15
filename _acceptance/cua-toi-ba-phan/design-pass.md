---
slug: cua-toi-ba-phan
at: 2026-10-15T04:13:35Z
route: http://localhost:3433/proto/cua-toi-ba-phan
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong-pham-vi)
options: http://localhost:3433/proto/cua-toi-ba-phan?state=ST-ctbp-can-cap-nhat · http://localhost:3433/proto/cua-toi-ba-phan?state=ST-ctbp-hoi-1-viec-tren · http://localhost:3433/proto/cua-toi-ba-phan?state=ST-ctbp-hoi-2-bang-muc-tieu
divergence: opened
ds_skill: repo-tokens
states: [ST-ctbp-can-cap-nhat, ST-ctbp-dang-cap-nhat, ST-ctbp-da-gui, ST-ctbp-da-du, ST-ctbp-khong-kr, ST-ctbp-dan-mot, ST-ctbp-dan-hai, ST-ctbp-don-vi-rong, ST-ctbp-khong-dan, ST-ctbp-dang-cap-nhat-390, ST-ctbp-hoi-1-viec-tren, ST-ctbp-hoi-2-bang-muc-tieu]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 3
deferred: 1
---
# design-pass — cua-toi-ba-phan

Bản mẫu ghép từ component thật của kho (`SectionHeading`, `Card`, `SimpleTable`, `StatusIndicator`, `Item`,
`Collapsible`) trong khung ứng dụng tĩnh chép từ bản mẫu DH1, thanh thẻ còn bốn thẻ. Bảng cập nhật mở tại chỗ là
bảng mẫu `ban-mau-okr/cap-nhat-tuan.tsx` (cùng khuôn với `BangCapNhat` thật). Mọi ảnh: không tràn ngang
(scrollWidth − innerWidth = 0) ở cả hai khổ; app dựng ở giao diện tối của máy chụp. Chụp bằng ego-browser, khổ
375 và 1280.

Số đo lúc chụp — đáy nút «Cập nhật 3 KR» so với chiều cao màn đầu: 1280 px 421/900 (khuyên) · 768/900 (Hỏi-1, khối
việc trên cùng); 375 px 689/812 (khuyên) · 1016/812 (Hỏi-1 — nút rơi xuống dưới màn đầu).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-ctbp-can-cap-nhat | desktop-1280 | dark | evidence/design-pass/ST-ctbp-can-cap-nhat--desktop-1280.png |
| ST-ctbp-can-cap-nhat | mobile-375 | dark | evidence/design-pass/ST-ctbp-can-cap-nhat--mobile-375.png |
| ST-ctbp-dang-cap-nhat | desktop-1280 | dark | evidence/design-pass/ST-ctbp-dang-cap-nhat--desktop-1280.png |
| ST-ctbp-dang-cap-nhat | mobile-375 | dark | evidence/design-pass/ST-ctbp-dang-cap-nhat--mobile-375.png |
| ST-ctbp-da-gui | desktop-1280 | dark | evidence/design-pass/ST-ctbp-da-gui--desktop-1280.png |
| ST-ctbp-da-gui | mobile-375 | dark | evidence/design-pass/ST-ctbp-da-gui--mobile-375.png |
| ST-ctbp-da-du | desktop-1280 | dark | evidence/design-pass/ST-ctbp-da-du--desktop-1280.png |
| ST-ctbp-da-du | mobile-375 | dark | evidence/design-pass/ST-ctbp-da-du--mobile-375.png |
| ST-ctbp-khong-kr | desktop-1280 | dark | evidence/design-pass/ST-ctbp-khong-kr--desktop-1280.png |
| ST-ctbp-khong-kr | mobile-375 | dark | evidence/design-pass/ST-ctbp-khong-kr--mobile-375.png |
| ST-ctbp-dan-mot | desktop-1280 | dark | evidence/design-pass/ST-ctbp-dan-mot--desktop-1280.png |
| ST-ctbp-dan-mot | mobile-375 | dark | evidence/design-pass/ST-ctbp-dan-mot--mobile-375.png |
| ST-ctbp-dan-hai | desktop-1280 | dark | evidence/design-pass/ST-ctbp-dan-hai--desktop-1280.png |
| ST-ctbp-dan-hai | mobile-375 | dark | evidence/design-pass/ST-ctbp-dan-hai--mobile-375.png |
| ST-ctbp-don-vi-rong | desktop-1280 | dark | evidence/design-pass/ST-ctbp-don-vi-rong--desktop-1280.png |
| ST-ctbp-don-vi-rong | mobile-375 | dark | evidence/design-pass/ST-ctbp-don-vi-rong--mobile-375.png |
| ST-ctbp-khong-dan | desktop-1280 | dark | evidence/design-pass/ST-ctbp-khong-dan--desktop-1280.png |
| ST-ctbp-khong-dan | mobile-375 | dark | evidence/design-pass/ST-ctbp-khong-dan--mobile-375.png |
| ST-ctbp-dang-cap-nhat-390 | mobile-375 | dark | evidence/design-pass/ST-ctbp-dang-cap-nhat-390--mobile-375.png |
| ST-ctbp-hoi-1-viec-tren | desktop-1280 | dark | evidence/design-pass/ST-ctbp-hoi-1-viec-tren--desktop-1280.png |
| ST-ctbp-hoi-1-viec-tren | mobile-375 | dark | evidence/design-pass/ST-ctbp-hoi-1-viec-tren--mobile-375.png |
| ST-ctbp-hoi-2-bang-muc-tieu | desktop-1280 | dark | evidence/design-pass/ST-ctbp-hoi-2-bang-muc-tieu--desktop-1280.png |
| ST-ctbp-hoi-2-bang-muc-tieu | mobile-375 | dark | evidence/design-pass/ST-ctbp-hoi-2-bang-muc-tieu--mobile-375.png |

## Bước phân kỳ — câu Hỏi-1

Trục: chỗ đứng của khối việc OKR khác (được giao, nhắc tên, chờ duyệt) so với phần «Cần cập nhật tuần này».

- **Phần 1 đứng đầu** (máy khuyên, state ST-ctbp-can-cap-nhat) — động cơ: câu giao của hàng là «thấy ngay KR cần
  cập nhật tuần này», nút cập nhật nằm trong màn đầu ở cả hai khổ; đánh đổi: các việc khác xuống dưới một phần.
- **Khối việc trên cùng** (state ST-ctbp-hoi-1-viec-tren, như app hôm nay) — động cơ: việc mới tới (được giao, chờ
  duyệt) thấy trước, giữ chỗ quen; đánh đổi: ở 375 px nút «Cập nhật 3 KR» rơi xuống dưới màn đầu (đáy 1016 px so
  với màn 812 px) khi có hai việc.

## Bước phân kỳ — câu Hỏi-2 (mở sau phản biện context sạch, finding P0)

Trục: phần 3 chỉ có bảng KR hay giữ thêm bảng mục tiêu.

- **Nhóm thu gọn** (máy khuyên, state ST-ctbp-can-cap-nhat) — động cơ: trang ngắn, trưởng đơn vị không thấy mục tiêu
  đơn vị hai lần (phần 2 và bảng); đánh đổi: thành viên quen dùng Của tôi làm bảng mục tiêu phải mở nhóm «Mục tiêu bạn
  tham gia» với mục tiêu không có KR của mình.
- **Giữ bảng mục tiêu dưới bảng KR** (state ST-ctbp-hoi-2-bang-muc-tieu) — động cơ: không ai mất chỗ quen, mọi mục
  tiêu của mình hiện một bảng; đánh đổi: trang dài thêm một bảng (1280 px: 1865 px so với 1683 px), mục tiêu có KR
  của mình hiện hai lần (dòng KR và dòng mục tiêu).

## Cảnh ngữ-cảnh

- Không cần: nấc `static-frame` — khung ứng dụng (thanh bên, đầu ứng dụng, đầu trang khu của DH1) bọc vật trong mọi ảnh.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dữ liệu mẫu cho cả 4 KR đều thiếu số, phần 1 lặp y phần 3 — đổi thành 3/4 KR thiếu để thấy hai phần khác nhau.
- Trưởng dẫn hai đơn vị đã cập nhật đủ lại hiện «0 KR chưa có số…» — nay vào đúng trạng thái «Bạn đã cập nhật đủ».
- Ở 375 px bảng KR cắt mất cột tiến độ và tình trạng — hai cột ẩn ở khổ hẹp, số và tình trạng xuống dòng dưới tên KR
  (`sm:hidden`), cột tự tin ẩn như `KhoiKrCuaToi`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Repo chưa có skill chuẩn DS chạy được trong phiên (`design_pass.ds_skill: web-design-guidelines` không nạp ở phiên
  này) — phiên chạy trên từ vựng token của kho (`repo-tokens`), như design-pass của DH1.
