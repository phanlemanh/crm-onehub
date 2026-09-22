# Hình tại điểm quyết định — may-nhac-truoc-nguoi

| Điểm | Đếm | Hình |
|---|---|---|
| Sổ d-1 — một tin tổng hợp mỗi sáng 08:30 | 4 bước nối tiếp (nhịp dispatch → quét → ghi hàng → gửi) + 4 nhánh kết cục | luong-nhac |
| Sổ d-2 — thẻ Tasks là bản trong app của cùng danh sách | 2 nhánh (Slack · thẻ Tasks) từ một hàm | luong-nhac |
| Sổ d-5 — `viecCanNhac` dùng chung ở `packages/db` | 2 nhánh gọi (tác tử · API) | luong-nhac |
| Sổ d-7 — chỉ mục duy nhất chống hai lượt quét chồng nhau | 2 nhánh (lượt quét A · B) gặp một khoá | luong-nhac |
| Sổ d-3 — theo dõi do người tự bấm | dưới ngưỡng: 1 bước | — |
| Sổ d-4 — bảng `OnboardingWatch` (T3) | dưới ngưỡng: 1 lựa chọn dữ liệu | — |
| Sổ d-6 — những gì không làm | dưới ngưỡng: danh sách | — |
| Sổ d-8 — design-pass trên bản mẫu | dưới ngưỡng: 1 bước | — |
| Coverage `[GIẢ ĐỊNH]` × 2 | dưới ngưỡng: câu có/không | — |
| design-pass Nhóm 2 × 2 | dưới ngưỡng: câu có/không | — |

## Đề bài `luong-nhac`

- Loại: sơ đồ luồng (flowchart), trái sang phải.
- Nút: «Nhịp dispatch mỗi phút» → «Trước 08:30 giờ VN? — không làm gì» / «Từ 08:30: `viecCanNhac` (packages/db)» → «Mỗi người có việc: một hàng `nhac-ke-hoach` `user:<id>:<ngày>` — chỉ mục duy nhất chặn hàng thứ hai» → «Làn trực tiếp: tính lại danh sách» → bốn kết cục `khong-viec` · `khong-slack` · `khong-khop` · `da-gui` (một tin Slack riêng, ≤10 dòng, `payload.daGui`); nhánh song song: «API `dashboard.summary` gọi cùng `viecCanNhac`» → «Thẻ Tasks: kế hoạch im · mốc ngày»; «Người theo dõi (`OnboardingWatch`)» chảy vào `viecCanNhac`.
- Nhãn bằng chữ tiếng Việt có dấu; tên kỹ thuật giữ nguyên.
- AC liên quan: AC-1, AC-4, AC-5, AC-6, AC-8.
