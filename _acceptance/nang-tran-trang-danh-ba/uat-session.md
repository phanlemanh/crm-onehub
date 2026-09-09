---
schema_version: 1
slug: nang-tran-trang-danh-ba
feature: Bộ gieo đọc danh bạ tới khi cạn thay vì tới một trần đoán, và lộ số điện thoại theo danh sách tầng khai trong cấu hình
owner: omre.cnsp4@onemount.com
stage: held
verdict: release
decided_by: Mạnh
decided_at: 2026-09-09T00:00:00Z
---

# Phiên nghiệm thu — nang-tran-trang-danh-ba

## Ngưỡng đã khai tại Cổng Đáng (CHÉP NGUYÊN VĂN — cấm sửa sau khi thấy số)

Chốt bởi Mạnh, 09/09/2026. Đo bằng ĐÚNG MỘT lượt nạp thật `--limit 200` với cấu
hình đang ship, đọc từ dòng `lượt chạy:` mà lệnh in ra.

| Thước | Đọc ở đâu | Sống | Chết |
| --- | --- | --- | --- |
| Mức Thấp có người thật | `phan_bo_tang.thap` | ≥ 50 trên 200 hồ sơ | < 20 |
| Gọi được người mức thấp | số hồ sơ mức `thap` có trường `phone` | ≥ 30 | < 10 |
| Chi phí một lượt còn chịu được | đồng hồ, và `trang_danh_ba_hong` chia tổng số trang đã đụng | dưới 75 phút VÀ trang hỏng dưới 35% | quá 120 phút HOẶC trang hỏng từ 50% |

## Người dự

**KHÔNG MỜI AI.** Người ký quyết định trên số đo, không qua phòng.

Đây là chỗ phiên này lệch khỏi nghi thức, ghi ra để chữ ký không bị đọc thành
thứ nó không dựa vào: không có người dùng đại diện nào chấm, nên không có điểm
nào của người ngoài đội trong hồ sơ này.

## Chấm kín (thu TRƯỚC mọi thảo luận chung)

**KHÔNG THU.** Không có người dự thì không có gì để chấm kín, và câu ràng buộc
«anh/chị sẽ gọi cho môi giới nào, khi nào?» không ai trả lời.

Hệ quả cần biết khi đọc verdict: phiên này đứng trên MỘT chân — số đo của một
lượt cào — chứ không phải hai chân số-đo cộng phản ứng người dùng. Cũng không có
nhật-ký lái-thử người-lạ cho vòng này.

## Thảo luận sau khi đã chấm

Không họp.

## Số đo thật đặt cạnh ngưỡng

Lượt đo: 09/09/2026, `--limit 200 --dry-run`, cấu hình đang ship (trần 120,
ngưỡng dừng 3, lộ số đủ bốn mức). Bắt đầu 22:18:29Z, xong 22:53:46Z.

| Thước | Ngưỡng | Số đo được | SỐNG/CHẾT |
| --- | --- | --- | --- |
| Mức Thấp có người thật | ≥ 50 | **128** trên 154 hồ sơ | **SỐNG** |
| Gọi được người mức thấp | ≥ 30 | **128** hồ sơ Thấp có số điện thoại | **SỐNG** |
| Chi phí một lượt | < 75 phút, hỏng < 35% | **35 phút**, trang hỏng **0%** | **SỐNG** |

Bản tổng kết nguyên văn của lượt đo:

```
gieo 200 · lay_duoc 154 · bi_chan 46
trang_danh_ba_doc 113 · trang_danh_ba_rong 4 · trang_danh_ba_hong 0
bi_tran_cat False
phan_bo_tang {'cao': 4, 'vua': 22, 'thap': 128, 'ngu': 0}
tin_moi_30_ngay {'min': 1, 'q1': 3, 'trung_vi': 8, 'q3': 14, 'max': 458}
co_so_dien_thoai 154 · lan_thu_lo_so 0
```

### Ba điều số đo nói ra mà ngưỡng không hỏi

**Mức «Ngủ» rỗng, và rỗng vì NGUỒN chứ không vì bộ cào.** Hợp đồng đã cảnh báo
điều này trước khi ký. Nay có bằng chứng: cả 154 hồ sơ đều có tin-hiện-có bằng
tin-mới-30-ngày (`tong_bang_tin_moi` 154 trên 154) — sàn chỉ công bố MỘT con số.
Không ai có thể vừa còn tin đăng vừa có tin-mới bằng 0, nên ngăn «Ngủ» không với
tới được từ nguồn này. **Thước phân khúc chia được BA mức, không phải bốn.**

**Bước lộ số điện thoại chưa từng chạy** (`lan_thu_lo_so` bằng 0). Cả 154 hồ sơ
đã mang sẵn số điện thoại từ chính trang hồ sơ, nên bộ lọc «chưa có số» loại hết.
Nghĩa là phần việc AC-5 và AC-6 của vòng này — lộ số theo danh sách tầng, và rải
khắp lô khi vượt trần — **không được dùng tới ở cấu hình hôm nay**. Nó đúng theo
bài kiểm, nhưng hôm nay là mã ngủ. Thước thứ hai SỐNG nhờ sàn, không nhờ vòng này.

**46 trên 200 địa chỉ gieo không lấy được hồ sơ** (23%). Không ngưỡng nào hỏi con
số này. Mẫu cuối còn 154 người thay vì 200, và không ai biết 46 người mất đi
nghiêng về mức nào.

## Quyết định Cổng Giá trị

**release** — Mạnh, 09/09/2026.

Ba câu hỏi đều đạt, và đạt rộng: 128 người ít đăng tin trên mức phải đạt là 50;
cả 128 đều có số điện thoại trên mức phải đạt là 30; lượt chạy 35 phút trên trần
75 và không mất trang nào.

Ba điều hồ sơ này khai thẳng, và người ký biết khi ký:

1. Nhóm «Ngủ» trống vì nguồn — nhatot chỉ công bố một con số nên ngăn đó không
   thể có ai. CRM chia được ba nhóm, không phải bốn như hồ sơ cơ hội mong.
2. Phần mã lấy số điện thoại của vòng này chạy 0 lần. Câu hỏi thứ hai đạt nhờ
   nhatot hiện sẵn số, không nhờ vòng này.
3. 23% địa chỉ thử lấy không mở được hồ sơ, và không ai biết họ nghiêng về nhóm
   nào.

Phiên không mời người dự và không thu chấm kín, nên verdict đứng trên số đo chứ
không trên phản ứng người dùng.
