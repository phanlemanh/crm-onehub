---
slug: trang-don-vi-mot-bang
at: 2026-10-15T04:32:00Z
route: http://localhost:3420/proto/trang-don-vi-mot-bang
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong-pham-vi)
options: http://localhost:3420/proto/trang-don-vi-mot-bang?state=ST-dvb-danh-sach · http://localhost:3420/proto/trang-don-vi-mot-bang?state=ST-dvb-hoi-2-nut-chi-tiet
divergence: opened
ds_skill: web-design-guidelines
states: [ST-dvb-danh-sach, ST-dvb-mo-kr, ST-dvb-chon-don-vi, ST-dvb-can-ban, ST-dvb-khong-khop, ST-dvb-rong, ST-dvb-chua-truong, ST-dvb-cong-ty, ST-dvb-nguoi, ST-dvb-hop-tuan, ST-dvb-cham-diem, ST-dvb-cay, ST-dvb-dang-tai, ST-dvb-loi, ST-dvb-hoi-2-nut-chi-tiet]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 7
deferred: 6
---
# design-pass — trang-don-vi-mot-bang

Bản mẫu dựng từ component thật của kho (`DataTable`, `Combobox`, `ViewSwitch`, `Item`, `PersonAvatar`) trong khung
ứng dụng tĩnh của DH1 (thanh bên, đầu trang khu «Mục tiêu», thanh thẻ — import `TrangMucTieu`, không sửa tệp DH1),
dữ liệu mẫu `ban-mau-okr`. Dev server chỉ app ở cổng 3420 (`PROTO_ROUTE=1`), đã tắt sau khi chụp. Mọi ảnh: không tràn
ngang (scrollWidth − innerWidth = 0) ở cả hai khổ, đo cả trong `[data-proto-body]`. Trình duyệt chụp ở giao diện tối.
Đo DOM: ô chọn đơn vị và cách xem đứng cùng toạ độ ở Danh sách, Họp tuần, Chấm điểm, Cây, Đang tải, Lỗi (lệch 0 px)
ở cả 1280 và 375.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-dvb-danh-sach | desktop-1280 | dark | evidence/design-pass/ST-dvb-danh-sach--desktop-1280.png |
| ST-dvb-danh-sach | mobile-375 | dark | evidence/design-pass/ST-dvb-danh-sach--mobile-375.png |
| ST-dvb-mo-kr | desktop-1280 | dark | evidence/design-pass/ST-dvb-mo-kr--desktop-1280.png |
| ST-dvb-mo-kr | mobile-375 | dark | evidence/design-pass/ST-dvb-mo-kr--mobile-375.png |
| ST-dvb-chon-don-vi | desktop-1280 | dark | evidence/design-pass/ST-dvb-chon-don-vi--desktop-1280.png |
| ST-dvb-chon-don-vi | mobile-375 | dark | evidence/design-pass/ST-dvb-chon-don-vi--mobile-375.png |
| ST-dvb-can-ban | desktop-1280 | dark | evidence/design-pass/ST-dvb-can-ban--desktop-1280.png |
| ST-dvb-can-ban | mobile-375 | dark | evidence/design-pass/ST-dvb-can-ban--mobile-375.png |
| ST-dvb-khong-khop | desktop-1280 | dark | evidence/design-pass/ST-dvb-khong-khop--desktop-1280.png |
| ST-dvb-khong-khop | mobile-375 | dark | evidence/design-pass/ST-dvb-khong-khop--mobile-375.png |
| ST-dvb-rong | desktop-1280 | dark | evidence/design-pass/ST-dvb-rong--desktop-1280.png |
| ST-dvb-rong | mobile-375 | dark | evidence/design-pass/ST-dvb-rong--mobile-375.png |
| ST-dvb-chua-truong | desktop-1280 | dark | evidence/design-pass/ST-dvb-chua-truong--desktop-1280.png |
| ST-dvb-chua-truong | mobile-375 | dark | evidence/design-pass/ST-dvb-chua-truong--mobile-375.png |
| ST-dvb-cong-ty | desktop-1280 | dark | evidence/design-pass/ST-dvb-cong-ty--desktop-1280.png |
| ST-dvb-cong-ty | mobile-375 | dark | evidence/design-pass/ST-dvb-cong-ty--mobile-375.png |
| ST-dvb-nguoi | desktop-1280 | dark | evidence/design-pass/ST-dvb-nguoi--desktop-1280.png |
| ST-dvb-nguoi | mobile-375 | dark | evidence/design-pass/ST-dvb-nguoi--mobile-375.png |
| ST-dvb-hop-tuan | desktop-1280 | dark | evidence/design-pass/ST-dvb-hop-tuan--desktop-1280.png |
| ST-dvb-hop-tuan | mobile-375 | dark | evidence/design-pass/ST-dvb-hop-tuan--mobile-375.png |
| ST-dvb-cham-diem | desktop-1280 | dark | evidence/design-pass/ST-dvb-cham-diem--desktop-1280.png |
| ST-dvb-cham-diem | mobile-375 | dark | evidence/design-pass/ST-dvb-cham-diem--mobile-375.png |
| ST-dvb-cay | desktop-1280 | dark | evidence/design-pass/ST-dvb-cay--desktop-1280.png |
| ST-dvb-cay | mobile-375 | dark | evidence/design-pass/ST-dvb-cay--mobile-375.png |
| ST-dvb-dang-tai | desktop-1280 | dark | evidence/design-pass/ST-dvb-dang-tai--desktop-1280.png |
| ST-dvb-dang-tai | mobile-375 | dark | evidence/design-pass/ST-dvb-dang-tai--mobile-375.png |
| ST-dvb-loi | desktop-1280 | dark | evidence/design-pass/ST-dvb-loi--desktop-1280.png |
| ST-dvb-loi | mobile-375 | dark | evidence/design-pass/ST-dvb-loi--mobile-375.png |
| ST-dvb-hoi-2-nut-chi-tiet | desktop-1280 | dark | evidence/design-pass/ST-dvb-hoi-2-nut-chi-tiet--desktop-1280.png |
| ST-dvb-hoi-2-nut-chi-tiet | mobile-375 | dark | evidence/design-pass/ST-dvb-hoi-2-nut-chi-tiet--mobile-375.png |

## Bước phân kỳ — câu Hỏi-2

Trục: chỗ bấm mở ngăn chi tiết của mục tiêu trên dòng có thể mở ra KR.

- **Tên mục tiêu là nút mở ngăn** (máy khuyên, state ST-dvb-danh-sach — lời khuyên ghim ngay dưới vật) — động cơ:
  giữ nếp hôm nay và chữ B3, dòng gọn một cột chữ; đánh đổi: người bấm vào tên để mở KR sẽ gặp ngăn chi tiết.
- **Nút «Chi tiết» riêng cuối dòng** (state ST-dvb-hoi-2-nut-chi-tiet, gỡ ở S3 sau khi người chọn) — động cơ: bấm
  đâu trên tên cũng chỉ mở KR, một nghĩa cho cả dòng; đánh đổi: thêm một cột, dòng chật hơn ở 375.

## Cảnh ngữ-cảnh

- Không cần: nấc `static-frame` — khung ứng dụng và đầu trang khu của DH1 bọc vật trong mọi ảnh.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Tên mục tiêu, tên KR, chữ Họp tuần bị cắt cứng ở 375 vì ô bảng không xuống dòng — thêm `whitespace-normal` ở phần tử của bản mẫu.
- Họp tuần thừa 12 px giữa hàng công cụ và bảng — bỏ khoảng ở khung ngoài, đỉnh bảng trùng Danh sách.
- Gợi ý trong ô chọn dài làm tên đơn vị cắt còn «Ki…» — gợi ý bỏ tên công ty ở đầu («Thuộc Kinh doanh · 1 mục tiêu»); chân bảng giữ đủ «Thuộc A › B».
- Chấm điểm tràn ngang 139 px ở 375 — ẩn cột «Số cuối kỳ», «Gợi ý» dưới md như `cham-diem.tsx` thật.
- Khung xương ô chọn cao 32 px, ô thật 28 px làm cách xem nhảy 4 px — chỉnh cỡ khớp, thêm chỗ cho ô lọc nhanh, «Lọc», «Sắp xếp», «Cột».
- Chữ cách xem Cây to hơn bảng — `text-sm`.
- Câu trống của ô lọc không khớp làm nút «Bỏ lọc» sát đáy ở 375 — rút còn một dòng.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `DataTable`: dòng mở rộng không có nút, không `aria-expanded`, không bàn phím — thành câu Hỏi-4 (sửa ô mũi tên trong `packages/ui`).
- `DataTable` luôn vẽ khung hàng công cụ (kèm khoảng) cả khi không có điều khiển — `HopTuan` thật phải bù khoảng; ghi Known limits, không sửa ở lượt này.
- `Combobox` giữ nguyên bề rộng gợi ý và cắt tên trước — đề xuất cắt gợi ý trước; lượt này rút gọn chữ gợi ý thay vì sửa component.
- `KhungXuong hinh="bang"` không khớp hàng công cụ có ô chọn + cách xem — trang ghép `Skeleton` riêng cho khung đang tải (AC-8).
- Tên mục tiêu bấm được là `<button>` thô như `khoi-muc-tieu.tsx` hôm nay (`Button variant="link"` tô màu primary) — giữ như hôm nay, thiếu một primitive «chữ bấm được» trong `packages/ui`.
- Ô lọc nhanh của `DataTable` là ô thả xuống («Tất cả ▾»), không phải dải chip — «Cần bàn» khuất sau một lần bấm; đúng khuôn Thoả thuận (Mở/Đóng), ghi để người duyệt thấy.
