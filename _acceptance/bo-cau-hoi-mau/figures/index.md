# Hình tại điểm quyết định — bo-cau-hoi-mau

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Hỏi-1 — thành phần 50 câu (d-…-4) | hai nhánh rẽ | `thanh-phan.html` |
| Hỏi-2 — số đo làm mới khi nào (d-…-10) | bốn bước nối tiếp, hai nhánh rẽ | `lam-moi-so-do.html` |
| d-1 nơi sống của bộ | một lối, dưới ngưỡng: 1 nhánh | — |
| d-2 dùng script chấm sẵn có | một lối, dưới ngưỡng: 1 nhánh | — |
| d-3 nhãn «mau» | một lối, dưới ngưỡng: 1 nhánh | — |
| d-5 không đòi đạt ngưỡng | một lối, dưới ngưỡng: 1 nhánh | — |
| d-6 không có câu thật | một lối, dưới ngưỡng: 1 nhánh | — |
| d-7 không có S4, S5 | một lối, dưới ngưỡng: 1 nhánh | — |
| d-8 bỏ đặc tả UX | một lối, dưới ngưỡng: 1 nhánh | — |
| [GIẢ ĐỊNH] bốn câu ngoài kho | dưới ngưỡng: 1 nhánh | — |

## Đề bài

### thanh-phan

- Loại hình: hai thanh xếp chồng ngang, so hai lối.
- Thanh A (khuyến nghị): S1 15 · S2 5 · S3 8 · S6 8 (4 gần trùng, 4 ngoài hẳn) · S7 10 (5 kiểu × 2) · ngoài kho 4.
- Thanh B (theo tỉ lệ bộ tạm 40 câu, quy ra 50): có trang 25 · không có 8 · không dấu 5 · ngoài kho 12.
- Nhãn: tên tầng bằng chữ thường («một trang», «hai trang», «ngưỡng, ngoại lệ», «phải nói không biết»,
  «gõ kiểu người thật», «không phải hỏi quy định»).
- AC liên quan: AC-2.

### lam-moi-so-do

- Loại hình: luồng trái sang phải, rẽ hai nhánh ở bước cuối.
- Nút: «`--do` đo bằng model thật (~$3)» → «`--ghi` chép vào evidence/» → «commit» → «lượt ghim lại / eval chạy
  lệnh không cờ». Rẽ: nhánh A (khuyến nghị) «kiểm theo băm bộ — không gọi model; sửa trợ lý không làm đỏ; `l5`
  chạy `--do` lại»; nhánh B «kiểm theo băm bộ + mã trợ lý — ai sửa `apps/agent/agent` thì lượt ghim gọi model
  hoặc đỏ».
- AC liên quan: AC-6, AC-7.
