# Bản phạm vi — dọn dẹp trước lộ trình chính (31/10)

Mục (C) «Việc dài — thành hàng lộ trình» của `docs/plan/don-dep-3110.md` (#598). Chủ kho duyệt cả danh sách A1–A3,
B1–B14 kèm khuyến nghị ở phiên giám sát Mac Studio ngày 31/10, nguyên văn «Đồng ý theo khuyên». Các quyết định áp vào
lượt cắt này:

- **B11**: F37 chạy trước BK1 và BK3.
- **B12**: cho máy sửa `evals.yaml` của chín hồ sơ đã ký trong một hàng (F38).
- **B13**: hai khoảng hở BK5, BK6 có mục trong trang tri thức `wiki/chu-de/ban-do-khuon.md`.
- **B14**: BK5 và BK6 chạy song song SV9, SV10.

Ba nguồn mã, không mã nào trùng: kiểm kê (dãy vệ sinh F, nối sau F36), nghiên cứu nâng bậc sàn thiết kế
(`docs/findings/2026-10-31-design-floor-crm/README.md` mục 5, mã SN; SN3 gộp vào BK5) và khoảng hở của bản đồ khuôn (mã
BK, nối sau BK4). Thêm một tiêu chí cho BK2 (cấm `Sheet` và `Dialog` dựng thô trong ngăn), không thành mã riêng.

<!-- <<<PHAM-VI-MA -->
```
dot: don-dep-3110
dang: chuoi
nguon: crm-onehub-nguon:wiki/dot/don-dep-3110.md#fc6df9ace5753f6430fb7a75143137c82f826a08, crm-onehub-nguon:wiki/chu-de/ban-do-khuon.md#b8885d939c4f080f612f3143b38f5370c660db29

- `F37` — một PR chỉ đổi tài liệu ra `test (api)` và `test (app-ui)` xanh trên `onehub`: bốn ca đỏ cố định từ 28/10
- `SN1` — hồ sơ mới không khai `design-gate --mode static` trên `.tsx`; các khoá `*_san_thiet_ke` được gọi tên là thước rỗng
- `SN2` — trang giới thiệu không còn mã màu hex nào ngoài tệp token
- `F38` — chín hồ sơ đã ký thôi bị đòi ghim lại chỉ vì một mục `paths` trỏ vào tệp đã đổi tên
- `BK5` — một dấu hiệu vẽ tay của `docs/design.md` trong tệp mới của `apps/app` làm `lint:slop` đỏ và gọi đúng tên tệp; nợ cũ nằm trong danh sách của chính luật
- `BK6` — một màn đặt lọc ngoài hàng công cụ duy nhất làm bài kiểm đỏ và gọi tên tệp
- `F39` — mỗi hồ sơ có mặt giao diện chờ Cổng Giá trị có ngưỡng điền xong, để phiên nghiệm thu mở được
- `SN4` — bật bậc M1 của sàn thiết kế cho `.tsx`
- `SN5` — sinh registry thành phần và token từ `packages/ui`
- `BK7` — khuôn «trang danh sách» trong bản đồ khuôn
```
<!-- PHAM-VI-MA>>> -->
