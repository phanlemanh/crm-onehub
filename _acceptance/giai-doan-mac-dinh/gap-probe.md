---
slug: giai-doan-mac-dinh
at: 2026-10-08T20:59:30Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Phép quét E3 chỉ khớp ba dạng chuỗi và `INSERT INTO "deal"` có ngoặc; bỏ sót tạo lồng qua quan hệ, `connectOrCreate`, `createManyAndReturn`, bí danh, SQL chữ thường hay `"public"."deal"`; kiểm kê dùng cùng khuôn [soan-okr-khong-lac#F1] | Một service tạo công ty kèm `deals: { create: [{ name }] }` không có `stage`; E3 xanh, vế ngưỡng được ký trên phép quét rỗng ruột, thoả thuận vẫn rơi vào Demo đã cất | Fixture cho từng dạng; kiểm kê bằng bộ kiểm kiểu thay vì chuỗi | fixed: E3 dùng TypeScript compiler API, tìm object literal theo kiểu ngữ cảnh đầu vào tạo `Deal` (gồm lồng, `createMany`, nhánh `create` của `upsert`/`connectOrCreate`); SQL khớp mọi cách viết tên bảng; kiểm kê đối chiếu với đếm chuỗi; `--tu-thu` có một tệp cho mỗi dạng |
| P1 | evals | AC-3 hứa quan hệ «gán `stage` tường minh» mà thước đo chữ `stage` có mặt trong khối | `stage: args.stage` với `stage?` thành `undefined`; `upsert` có `stage` chỉ ở `update`; chữ `stage` nằm trong `stageChangedAt` — E3 vẫn xanh | Đo trên cây cú pháp: khoá `stage` trong đúng nhánh tạo, kiểu không chứa `undefined` | fixed: AC-3 và E3 đòi khoá `stage`/`giaiDoan` trên chính object đầu vào tạo, kiểu giá trị không chứa `undefined`; `--tu-thu` có `upsert` chỉ `update`, `stage` tuỳ chọn |
| P2 | contract | Ngưỡng SỐNG viết «trong mã», hợp đồng thu hẹp thành «trong mã sản phẩm» mà không sửa ngưỡng | Phiên nghiệm thu thấy 9 lời gọi trong tệp kiểm vẫn dựa vào mặc định, đọc chữ thì không đạt SỐNG | Sửa ngưỡng `[đề xuất]` trùng chữ với Đường đo | fixed: `opportunity.md` vế 2 thành «trong mã sản phẩm (`apps/**`, `packages/**` trừ kiểm thử, eval, mã sinh)», trùng ý Đường đo dòng 2; sổ d-20261008T205709Z-4 ghi lý do chọn B |
| P2 | design | `design.md` còn đặt A làm quyết định chính và ranh giới theo A; không eval ghim «không migration» | Người làm theo design chạm `schema.prisma` dưới lối B mà không AC nào đỏ | Viết lại design theo B; E4 ghim diff rỗng ở schema và migration | fixed: `design.md` viết lại — B là quyết định 1, A lối thay; ranh giới theo B; AC-4 và E4 đòi diff rỗng ở `schema.prisma` và `migrations/` |
| P2 | evals | Chốt `khong-xoa-expect` không ghim mốc; chuẩn hoá khoảng trắng nuốt cả sửa trong chuỗi [d-20261008T171206Z-9] | Sau gộp mốc bằng HEAD, E4 xanh trống rỗng; sửa một ký tự trong chuỗi mong đợi không bị bắt | Ghim mốc; đối chứng sửa ký tự trong chuỗi | fixed: E4 và lệnh `gmd_hoi_quy` ghim `--moc c1067c163`; chuẩn hoá khoảng trắng chỉ ngoài chuỗi; `--tu-thu` thêm ca sửa ký tự trong chuỗi |
