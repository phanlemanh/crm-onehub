---
schema_version: 1
feature: "Bài kiểm tao-ke-hoach không chọn trùng ngày hôm nay"
slug: ngay-lich-test-tao-ke-hoach
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: draft
design_doc: docs/superpowers/specs/2026-10-15-ngay-lich-test-tao-ke-hoach-design.md
---

# Acceptance Contract: ngay-lich-test-tao-ke-hoach

## Context

Bài kiểm DOM `tao-ke-hoach` của `apps/app/test/noi-bon-nut.dom.tsx` chọn cứng ngày 15 của tháng hiện tại, nên đỏ trọn
ngày 15 mỗi tháng (giờ VN) và chặn CI của mọi PR chạy suite app. Giám sát r2 giao 14/10 (viec-phu P0-4), gộp trước
00:00Z ngày 15/10.

Source input: dòng đỏ ở `_acceptance/thu-haiku-tro-ly-okr/duong-nen.md` · design doc · memory «bom giờ trong bài kiểm».

## Criteria

- AC-1: Given đồng hồ ghim ở 12:00 giờ VN các ngày 14, 15, 16 tháng 10/2026, và ở hai mép giờ của ngày 15 giờ VN (00:30 = 17:30Z ngày 14; 23:30 = 16:30Z ngày 15), When chạy bài `tao-ke-hoach` của bản sửa với `TZ=Asia/Ho_Chi_Minh`, Then cả năm lượt xanh, mỗi lượt đúng một bài chạy và qua.
- AC-2: Given cùng đồng hồ ghim, When chạy bài `tao-ke-hoach` của bản trước vòng (c1864a3a2), Then lượt 12:00 và lượt 00:30 ngày 15 giờ VN đỏ với thông điệp «khong toi trang thai nut ngay hien 2026-10-15», lượt 12:00 ngày 14 xanh, và sau lượt đo cây không còn tệp tạm.
- AC-3: Given diff của vòng tính từ merge-base với onehub, When bỏ các tệp hồ sơ và tài liệu, Then chỉ còn đúng `apps/app/test/noi-bon-nut.dom.tsx`; mã sản phẩm không đổi; và một danh sách thêm một tệp ngoài thì thước đánh không đạt.

## Coverage

Quét tay hai trục: ngày trong tháng (14, 15, 16) và giờ trong ngày ở chỗ ngày UTC lệch ngày VN (00:30 và 23:30 ngày 15 giờ VN) → AC-1, AC-2. Thước là chính năm ô này `[CE chưa kiểm chứng]`.

## Out of scope

- Các bài kiểm khác có thể phụ thuộc ngày lịch — quét riêng nếu giám sát giao.
- Ghi chú phụ thuộc giờ trong hồ sơ va-lo-ro-vai-chi-okr — không đổi hồ sơ đã ký đó.

## Notes

- Hồ sơ đã ký `noi-bon-nut-dieu-phoi` khai tệp này trong `paths`; ghim lại nó trong cùng PR (cham-tep P0-5).
- Đường nền: dùng lại lượt của `thu-haiku-tro-ly-okr` chạy trên đúng sha c1864a3a2 lúc 17:15Z 14/10.
