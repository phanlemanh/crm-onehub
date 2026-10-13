---
slug: duong-ly-do-muc-tieu
at: 2026-10-13T00:45:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-7/E7 chỉ chạy vài bài lọc -t của hai hồ sơ trong khi lời hứa là «không hồ sơ đã ký nào đỏ»; AC-7 và E7 gọi tên hai tệp khác nhau | Bộ mẫu thêm ca làm một eval đã ký ghim tập mã bộ mẫu đỏ khi recheck strict chạy lại [okr-mau-xoa-cuoc-soan#F1]; E1–E12 xanh mà Acceptance đỏ [d-20261012T122502Z-26] | Tập eval đã ký có paths khớp diff tính bằng máy, chạy từng lệnh, đòi số lệnh = số phần tử; tệp vắng thoát 1 | fixed: AC-7 viết lại thành mọi eval test/script đã ký có paths khớp diff đều đạt mã kỳ vọng, tập tính bằng máy; E7 chạy tập đó, đối chứng hai chiều của bộ lọc, ba tệp bài khai cùng tên ở AC-7 và E7, tệp vắng thoát 1 |
| P1 | contract | AC-8 không nói bộ mẫu ghi ba trường qua đường nào; CLAUDE.md đòi dữ liệu mẫu đi qua đường ghi thật | nap.ts ghi thẳng bảng mà E8 vẫn xanh, hoặc thêm tham số vào OkrService làm E12 đỏ | Gọi tên hàm service nap.ts dùng; quét nap.ts không ghi Prisma thẳng | rejected: bộ mẫu đã ghi căn chỉnh bằng createMany từ trước (khối okrAlignment của apps/api/scripts/okr-mau/nap.ts) — ba trường đi cùng hàng đó, không thêm đường ghi thứ hai; căn cứ chưa có đường ghi service nào (L4 dựng); ghi rõ vào Notes của hợp đồng |
| P1 | evals | E10 chỉ đo vùng cuộn sheet, không bắt câu lý do bị line-clamp hay truncate trong phần tử con | Câu lý do dùng kiểu chữ ItemDescription có line-clamp-2, bị cắt ở 390 px mà E10 vẫn in dat | Đo scroll/clamp/ellipsis trên từng phần tử lý do; ca-man có câu dài; đối chứng đỏ line-clamp-1 | fixed: AC-9 hứa không cắt, không kẹp dòng, câu dài xuống ≥ 2 dòng ở 390; E10 đo từng [data-ly-do-cau] và [data-ly-do-can-cu] (scroll, textOverflow, webkitLineClamp) và có đối chứng đỏ trong trang |
| P2 | contract | Ô C0 (không căn chỉnh) không có AC | Bọc KhuGopVao trong khung luôn vẽ → khối Góp vào rỗng mà không eval nào đỏ | E3 thêm ca alignments rỗng, đối chứng dương ca E1; vết đỏ ở E11 | fixed: AC-3 thêm vế C0; E3 thêm ca thứ ba và đòi số ca === 3; E11 thêm vết (g) 'khung gop vao rong' |
| P2 | evals | Ranh giới AC-10/E12 thiếu docs/plan/lo-trinh-okr.json | Vòng ghi trạng thái hàng L2 lúc khép → E12 đỏ 'ngoai ranh gioi' dù mã đúng | Chốt tệp được đổi khi khép | fixed: ranh giới AC-10 và E12 mở thành docs/** (đều là T1) |
