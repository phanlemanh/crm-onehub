---
slug: logo-onehub
at: 2026-09-25T08:52:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E1, E2, E4 raster một hàm dựng SVG song song, không raster chính `Logo` và `LogoLockup`; hai file component không có trong `paths` | `logo-lockup.tsx` thiếu phép dời toạ độ mark hoặc `logo.tsx` sai `viewBox` — E2, E4 vẫn xanh, chỉ còn mắt người ở cỡ 20px | lấy SVG bằng `renderToStaticMarkup` của chính component rồi raster; chiều đỏ chỉ sửa file component | fixed: E1, E2, E4 raster `renderToStaticMarkup` của chính component, thêm component vào `paths`, chiều đỏ sửa riêng `logo.tsx` (ghim «lech tam x») và `logo-lockup.tsx` (ghim «IoU mark ban ngang»); bỏ `logo-dung.ts`, script icon cũng render chính `Logo` |
| P1 | evals | E10 so merge-base..HEAD: bỏ sót phần chưa commit và file mới; sau khi merge thì diff rỗng mà vẫn mã 0; tập file gọi `Logo` grep trên HEAD; chiều đỏ không thử vế «chỉ auth-shell đổi» | bỏ import `Logo` ở `app-header.tsx` thì grep HEAD không thấy file đó, E10 mã 0 | so tới cây làm việc + file chưa theo dõi; diff rỗng mã 2; grep tại sha của mốc; chiều đỏ bỏ import ở `app-header.tsx` | fixed: E10 so tới cây làm việc cộng `git ls-files --others`, diff rỗng mã 2, grep tại sha mốc, neo merge-base(M^1,M^2)..M^2 khi đã lên onehub, thêm chiều đỏ (b) |
| P2 | evals | Mốc DOM của E11 khớp cả logo không nhìn thấy (ô giữ chỗ vô hình, nửa trái ẩn ở 390); không có ngưỡng máy cho cỡ chữ | lockup đầu form sót ở 390, script vẫn thấy svg ẩn nên mã 0 | đếm svg nhìn thấy theo từng ảnh; chiều cao lockup ≥ 20px trọn trong khung cha; chiều đỏ bỏ lockup đầu form | fixed: E11 đếm svg `checkVisibility()` theo từng ảnh (1440 ≥ 2, 390 ≥ 1, thanh trên ≥ 1, Agent ≥ 1), lockup ≥ 20px trọn khung cha, chiều đỏ ghim «dau form thieu logo» |
| P2 | contract, evals | Không eval nào rút tập link icon thật trang trả về; E6, E7 kiểm danh sách viết tay [mot-duong-ghi-phong-ban#F1] | còn `app/icon.*` hay mục metadata trỏ icon Comp, Chrome ưu tiên nó, tab vẫn mang logo Comp mà E6, E7, E11 xanh | E11 đọc mọi `link rel` icon trên trang và icon trong manifest, tập href bằng đúng bảng thiết kế, byte máy chủ trả = file trong kho | fixed: thêm vào E11 (tập href rút bằng máy, so đúng bằng, so byte), chiều đỏ thêm `app/icon.png` ghim «icon ngoai bang»; `paths` thêm `layout.tsx` và `public/**` |
| P2 | evals | E7 đòi RGBA trùng khít giữa kho và bản sinh lại; `sharp` có thể lệch khử răng cưa giữa arm64 và x64 | sinh trên Mac arm64, CI linux x64 lệch 1 đơn vị ở mép, E7 đỏ dù không ai sửa tay | dung sai mỗi kênh ≤ 2 và ≤ 0,5% điểm ảnh; chiều đỏ là đột biến chắc vượt ngưỡng | fixed: E7 dung sai mỗi kênh ≤ 2 và ≤ 0,5% điểm ảnh, in số điểm lệch; chiều đỏ đổi thành dời tâm MARK 4 đơn vị; design ghi lý do |
