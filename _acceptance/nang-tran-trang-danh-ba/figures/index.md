# Điểm quyết định — Cổng 1

Ngưỡng N5: cần hình khi điểm quyết định đi từ ba bước nối tiếp trở lên, hoặc từ
hai nhánh rẽ trở lên.

| Điểm | Đếm | Hình |
| --- | --- | --- |
| `d-ntt-trang-hong-khong-tinh-dung` — vòng đọc danh bạ dừng khi nào | 4 nhánh (trang ra người mới · trang đọc được mà rỗng · trang không tải được · chạm trần) | `vong-doc-danh-ba` |
| `d-ntt-lo-so-rai-khap-lo` — chọn ai được lộ số | 3 bước nối tiếp (lọc theo mức → so với trần → rải hoặc lấy hết) | `chon-ai-lo-so` |
| `d-ntt-tran-120-theo-chi-phi` — trần chốt ở 120 | dưới ngưỡng: 1 lựa chọn giá trị | — |
| `d-ntt-ngu-co-the-rong` — không hứa mức Ngủ có người | dưới ngưỡng: 1 lời khai | — |
| `d-ntt-keo-ngoai-2-vao` — kéo Ngoài-2 vòng trước vào phạm vi | dưới ngưỡng: 1 lựa chọn phạm vi | — |

## Đề bài hình 1 — `vong-doc-danh-ba`

Sơ đồ luồng. Một vòng lặp đọc trang danh bạ, mỗi vòng rẽ bốn đường. Nút bắt
buộc: «tải trang thứ N» · «tải được?» · «có người mới?» · «đủ 3 trang liên tiếp
rỗng?» · «chạm trần 120?» · ba lối ra «dừng: danh bạ cạn (cờ TẮT)», «dừng: chạm
trần (cờ BẬT)», «đọc tiếp». Nhấn bằng màu rằng nhánh «tải được? KHÔNG» quay
thẳng về «đọc tiếp» và KHÔNG cộng vào biến đếm rỗng — đó là chỗ vòng này sửa.
Nhãn bằng chữ thường, không dùng tên hàm. Ghi AC-1, AC-2, AC-3, AC-4 cạnh nhánh
tương ứng.

## Đề bài hình 2 — `chon-ai-lo-so`

Sơ đồ luồng ngang, ba chặng. Lô hồ sơ (xếp theo trang danh bạ, sản lượng giảm
dần) → lọc theo `phone_reveal_tiers` → so số còn lại với trần 200 → hai lối:
«ít hơn trần: lộ hết» và «nhiều hơn trần: RẢI KHẮP lô rồi lộ 200». Vẽ kèm một
dải nhỏ minh hoạ khác biệt giữa «lấy 200 đầu» (dồn một phía) và «rải khắp»
(trải đều) trên cùng một lô. Ghi AC-5, AC-6.
