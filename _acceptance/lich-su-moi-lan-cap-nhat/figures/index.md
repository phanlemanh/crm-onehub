# Điểm quyết định tại Cổng Phạm vi — lich-su-moi-lan-cap-nhat

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — lật Known limits Ngoài-1 của VK7 | 2 nhánh rẽ (lật · không lật) | `hoi-1-lat-vk7.html` |
| Nguồn của Lịch sử — `okr.lichSuKr` mới, `okr.dienBien` giữ cho bốn nơi đọc theo tuần | 2 nhánh rẽ (một thủ tục chia hai luồng đọc) | `nguon-lich-su.html` |
| Nhãn ngày giờ của dòng | dưới ngưỡng: 1 bước, không rẽ | — |
| Bỏ SV-C1 | dưới ngưỡng: 1 bước, không rẽ | — |

## Đề bài hình

### hoi-1-lat-vk7

- Loại: cây quyết định hai nhánh.
- Nút gốc: «Lật Ngoài-1 của VK7 (lịch sử gom theo tuần)?».
- Nhánh «Lật» → «Đổi hai phép đo VK7 qua cham-tep: ca vk7-than-ngan, bước gom theo tuần ở man.mjs» → «Dòng sổ decided_by ở ngan-kr-mot-cho» → «SV7 làm được: Lịch sử mỗi lần một dòng».
- Nhánh «Không lật» → «Lịch sử vẫn gom tuần» → «SV7 không đạt ngưỡng sống — đóng hàng».
- AC liên quan: AC-10.

### nguon-lich-su

- Loại: luồng dữ liệu.
- Nút: bảng `OkrCheckIn` → `lanCuaKr` → hai thủ tục: `okr.lichSuKr` (mọi lần, chuỗi mỗi lần một điểm) → «Lịch sử của chi tiết KR»; `okr.dienBien` (mỗi tuần một điểm, giữ nguyên) → «hộp cập nhật · khối lần trước · dải tự tin · mức đổi Họp tuần».
- Nhãn trên cạnh: «mọi lần» và «lần cuối mỗi tuần».
- AC liên quan: AC-1, AC-2, AC-4, AC-5, AC-9.
