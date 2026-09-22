# Kế hoạch: nối bốn nút tạo dữ liệu của «30 ngày đầu»

Hợp đồng: `_acceptance/noi-bon-nut-dieu-phoi/contract.md` (T2, 10 AC, 14 eval).

## T1 — API (independent: false) · phục vụ E2, E4, E7, E10, E13
- `onboarding.contracts.ts`: `startedAt` của đầu vào tạo kế hoạch → `z.coerce.date()`.
- `apps/api/test/noi-bon-nut.spec.ts`: bốn nhóm ca, E7/E13 gửi HTTP thật qua AppModule kèm phiên.

## T2 — màn (independent: false) · phục vụ E1, E3, E5, E6, E8, E9, E11, E14
- `apps/app/components/onboarding/khung-tao.tsx`: khung Sheet dùng chung, khoá gửi lần hai, dòng lỗi.
- Bốn hộp thoại: `them-bo-phan.tsx`, `soan-khuon.tsx` (Cài đặt), `tao-ke-hoach.tsx` (danh mục, trạng thái trống và thanh công cụ), `[planId]/them-moi-gioi.tsx` (luôn có nút).
- `apps/app/test/noi-bon-nut.dom.tsx`: 10 ca, chạy dưới `TZ=Asia/Ho_Chi_Minh` cho ca ngày.

Verify: hai tệp kiểm + đột biến chiều đỏ từng eval; `check-types`, `lint`, `lint:slop`, `test`.
