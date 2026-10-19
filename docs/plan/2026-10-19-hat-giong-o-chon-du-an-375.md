# Hạt giống — Ô chọn «Dự án» của khung việc bị cắt ở khổ 375

Gốc: `_acceptance/viec-rieng-chi-nguoi-trong-cuoc/` (DA11, S4 lượt 1, eval E11, ảnh `evidence/E11-step4.png`).

Ở khổ 375, khung việc của một việc trong dự án có tên dài: ô chọn «Dự án» (`ODuAnViec` → `Combobox` của
`packages/ui`) tràn mép phải, mũi tên chỉ còn nửa, mất viền phải. Trang không cuộn ngang; chữ «Gắn với» của
DA11 xuống dòng bình thường.

Nguyên nhân đọc từ mã: `selectTriggerVariants` dùng `w-fit whitespace-nowrap`, ô không bị giới hạn theo bề
rộng cột. Có từ DA4, không do DA11.

Vì sao tách: chính sách đợt «đỏ sẵn trên nền → tách vòng vệ sinh»; sửa ở `packages/ui` đổi mọi màn dùng
Combobox và có thể làm lệch ảnh chụp đã ký của hồ sơ khác.

Hướng: cho trigger `max-w-full` và phần chữ co (`min-w-0`) trong biến thể của `packages/ui`, rồi soát các hồ
sơ có ảnh chụp Combobox. Làn M5 (chủ `du-an`, `record-sheet`), có thể gộp vào DA12.
