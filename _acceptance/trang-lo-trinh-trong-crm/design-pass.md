---
slug: trang-lo-trinh-trong-crm
at: 2026-10-08T17:25:46Z
route: http://localhost:3300/proto/trang-lo-trinh-trong-crm
material: real-components
context: standalone
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong; chủ kho phản hồi 09/10 hai lượt: nhất quán với hệ, IA thứ tự khối)
options:
divergence: opened
ds_skill: web-design-guidelines
states: [ST-lotrinh-day-du, ST-lotrinh-theo-moc, ST-lotrinh-toan-canh, ST-lotrinh-loc, ST-lotrinh-tre, ST-lotrinh-bang-cot, ST-lotrinh-chi-tiet, ST-lotrinh-dang-tai, ST-lotrinh-chua-co-khoi, ST-lotrinh-khoi-hong, ST-lotrinh-tep-vang, ST-lotrinh-lo-loi, ST-lotrinh-khuon-moi]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 14
deferred: 3
---
# design-pass — trang-lo-trinh-trong-crm

Dữ liệu của bản mẫu là khối `lo-trinh-du-lieu` do chính bộ vẽ của kit (nhánh `vong/xuat-du-lieu-lo-trinh`,
d86a2f5e) sinh trên kho này cộng hàng LT1/LT2 của #313 — 87 việc, 22 mốc, ba lộ trình. Bộ vẽ chạy ngoài kho,
không cài vào crm. Các trạng thái lỗi dùng đúng câu của hàm `docDuLieu`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-lotrinh-day-du | mobile-375 | light | evidence/design-pass/ST-lotrinh-day-du--mobile-375.png |
| ST-lotrinh-day-du | desktop-1280 | light | evidence/design-pass/ST-lotrinh-day-du--desktop-1280.png |
| ST-lotrinh-theo-moc | mobile-375 | light | evidence/design-pass/ST-lotrinh-theo-moc--mobile-375.png |
| ST-lotrinh-theo-moc | desktop-1280 | light | evidence/design-pass/ST-lotrinh-theo-moc--desktop-1280.png |
| ST-lotrinh-toan-canh | mobile-375 | light | evidence/design-pass/ST-lotrinh-toan-canh--mobile-375.png |
| ST-lotrinh-toan-canh | desktop-1280 | light | evidence/design-pass/ST-lotrinh-toan-canh--desktop-1280.png |
| ST-lotrinh-loc | mobile-375 | light | evidence/design-pass/ST-lotrinh-loc--mobile-375.png |
| ST-lotrinh-loc | desktop-1280 | light | evidence/design-pass/ST-lotrinh-loc--desktop-1280.png |
| ST-lotrinh-tre | mobile-375 | light | evidence/design-pass/ST-lotrinh-tre--mobile-375.png |
| ST-lotrinh-tre | desktop-1280 | light | evidence/design-pass/ST-lotrinh-tre--desktop-1280.png |
| ST-lotrinh-bang-cot | mobile-375 | light | evidence/design-pass/ST-lotrinh-bang-cot--mobile-375.png |
| ST-lotrinh-bang-cot | desktop-1280 | light | evidence/design-pass/ST-lotrinh-bang-cot--desktop-1280.png |
| ST-lotrinh-chi-tiet | mobile-375 | light | evidence/design-pass/ST-lotrinh-chi-tiet--mobile-375.png |
| ST-lotrinh-chi-tiet | desktop-1280 | light | evidence/design-pass/ST-lotrinh-chi-tiet--desktop-1280.png |
| ST-lotrinh-dang-tai | mobile-375 | light | evidence/design-pass/ST-lotrinh-dang-tai--mobile-375.png |
| ST-lotrinh-dang-tai | desktop-1280 | light | evidence/design-pass/ST-lotrinh-dang-tai--desktop-1280.png |
| ST-lotrinh-chua-co-khoi | mobile-375 | light | evidence/design-pass/ST-lotrinh-chua-co-khoi--mobile-375.png |
| ST-lotrinh-chua-co-khoi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-chua-co-khoi--desktop-1280.png |
| ST-lotrinh-khoi-hong | mobile-375 | light | evidence/design-pass/ST-lotrinh-khoi-hong--mobile-375.png |
| ST-lotrinh-khoi-hong | desktop-1280 | light | evidence/design-pass/ST-lotrinh-khoi-hong--desktop-1280.png |
| ST-lotrinh-tep-vang | mobile-375 | light | evidence/design-pass/ST-lotrinh-tep-vang--mobile-375.png |
| ST-lotrinh-tep-vang | desktop-1280 | light | evidence/design-pass/ST-lotrinh-tep-vang--desktop-1280.png |
| ST-lotrinh-lo-loi | mobile-375 | light | evidence/design-pass/ST-lotrinh-lo-loi--mobile-375.png |
| ST-lotrinh-lo-loi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-lo-loi--desktop-1280.png |
| ST-lotrinh-khuon-moi | mobile-375 | light | evidence/design-pass/ST-lotrinh-khuon-moi--mobile-375.png |
| ST-lotrinh-khuon-moi | desktop-1280 | light | evidence/design-pass/ST-lotrinh-khuon-moi--desktop-1280.png |

## Cảnh ngữ-cảnh

- bỏ cảnh ngữ-cảnh — mục Lộ trình chỉ thêm một dòng vào thanh điều hướng có sẵn; đường vào đo trên màn thật ở E10 (sổ quyết định, dòng descope cuối)

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Khổ 375 tràn ngang: trạng thái ở cột phải bóp câu giao, bộ lọc chung hàng tiêu đề — trạng thái vào dòng phụ, bộ lọc xuống hàng riêng; 19/19 ảnh không tràn.
- Chữ «đã qua» gắn cả việc đã giao làm người đọc tưởng trễ — chỉ đánh «Trễ» cho việc trong danh sách việc trễ của luật ngày.
- Đối chiếu bảy màn đang chạy (09/10), sửa theo nếp chung:
  - Tiêu đề trang tự đặt cỡ chữ → PageShell + PageShellTitle + PageShellDescription (tiêu đề lớn, một câu mô tả).
  - Thẻ lộ trình kiểu nền → kiểu gạch chân kèm số việc, như Toàn cảnh OKR và Tài liệu.
  - Bốn con số vẽ tại chỗ → StatGroup + StatCard của Toàn cảnh OKR (bỏ finding «thiếu ô số chỉ đọc»: kho đã có).
  - Danh sách thẻ ở mọi khổ → bảng ở máy tính, thẻ dọc ở điện thoại, như Tài liệu.
  - Tiêu đề mục bằng SectionHeading → Card + CardTitle, như mọi trang hiện có.
  - Mốc dạng danh sách → Timeline của ReUI (đã cài), theo block `timeline-5`.
  - Khung trống viền liền → Empty không viền + EmptyContent, chữ theo nếp «Chưa có …» / «Không tải được …».
  - «Khác» tô vàng → neutral (vàng của kho dành cho chờ/rủi ro, «xếp lại sau» không phải rủi ro).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Nhóm hiện bằng mã trần của tệp kế hoạch (`okr`, `tro-ly`, `crm-chung`, `ve-sinh`) — «crm-chung», «ve-sinh» khó hiểu với trưởng phòng ban; khối dữ liệu không chở tên hiển thị của nhóm. Đề xuất đã mở sang kho kit; tới lúc đó trang hiện mã trần.
- Rà mở rộng 09/10 — chế độ bảng cột (dùng `Board` chỉ đọc của Thoả thuận) và ngăn chi tiết một việc dựng được bằng thành phần sẵn có; CHƯA nằm trong hợp đồng (AC-9 hiện chỉ cho chọn thẻ, lọc, mở mục gập) — chờ chủ kho quyết mở rộng phạm vi.
- Chữ trong tệp kế hoạch viết cho đội sản phẩm lộ ra trước trưởng phòng ban: chữ trạng thái «Sắp mở vòng», «Đã giao — chờ phiên nghiệm thu»; «bật khi» mang «(ngưỡng đề xuất — chốt ở Cổng Đáng)». Bản mẫu đặt nhãn nhóm trạng thái dễ hiểu làm chữ chính, chữ của khối làm dòng phụ; gốc phải sửa ở cách viết kế hoạch hoặc kit thêm một câu cho người xem.

### Lượt IA (09/10, sau phản hồi «IA chưa ổn, thứ tự khối, chưa nhất quán»)

- Thứ tự khối cũ theo cấu trúc dữ liệu (thẻ lộ trình → bốn ô số → việc kế tiếp → 64 dòng → mốc ở đáy → chỗ cần sửa) — đổi sang khuôn khu OKR: thẻ con là cách xem (Theo nhóm / Theo mốc / Toàn cảnh), bộ chọn lộ trình bên phải hàng thẻ như bộ chọn «Quý».
- «Theo nhóm» dùng khuôn danh sách-chi-tiết của «OKR theo đơn vị» (cột nhóm 18rem + nội dung; khổ hẹp đổi ô chọn); việc chia Trễ mốc → Sắp tới → Đã giao (thu gọn) — danh sách đầu trang còn 20 dòng thay vì 64.
- «Việc kế tiếp» và «Chỗ cần sửa» (chỉ đội sản phẩm cần) rời khỏi đầu trang, vào mục gập «Dành cho đội sản phẩm» ở Toàn cảnh.
- Mốc thôi bị đẩy xuống đáy sau danh sách dài: thành một cách xem riêng; «Trễ mốc» thành khối đầu của Theo nhóm và ô số ở Toàn cảnh.
- Còn mở: «Theo mốc» dài vì liệt cả mốc đã qua toàn việc đã giao — có thể thu gọn mốc đã qua; cột «Mốc» phần lớn là «—» vì dữ liệu (22/64 việc có mốc), không vì bố cục.
