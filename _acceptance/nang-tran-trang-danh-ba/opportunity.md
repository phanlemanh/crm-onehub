---
schema_version: 1
slug: nang-tran-trang-danh-ba
feature: Nâng trần trang danh bạ để bộ gieo rải mẫu thật sự chạm được môi giới sản lượng thấp
owner: omre.cnsp4@onemount.com
stage: discovery
decision:
decided_by:
decided_at:
---

## Vấn đề & ai gặp

Vòng `gieo-rai-deu-danh-ba` (ký 08/09) đã sửa bộ gieo: đường gieo từ trang danh bạ
nay đọc hết trần trang rồi rải mẫu đều theo bước cố định, thay vì dừng khi đủ trần
và lấy trọn phần đầu bảng. Bộ kiểm chứng điều đó, và bốn khuôn giả đều bị bắt.

**Nhưng ở cấu hình đang ship, vòng sửa đó chưa đổi một địa chỉ nào.**
`directory_max_pages = 8` cho ra khoảng 98 hồ sơ trong cả danh bạ. Lệnh chạy thật
ghi ở README là `--limit 200`, tức xin nhiều hơn số có, nên bộ gieo lấy hết và
không rải gì. Lượt chấm vòng 3 đo lại và xác nhận:

| trần | khuôn cũ | khuôn mới |
| --- | --- | --- |
| 200 | 98 hồ sơ | 98 hồ sơ, giống hệt từng địa chỉ |
| 98 | 98 hồ sơ | giống hệt |
| 50 | 50 «cao» · 0 «vừa» · 0 «thấp» | 37 · 10 · 3 |

**Người trả giá:** đội tiếp thị. Hai mức «Thấp» và «Ngủ» của trục Sản lượng vẫn
rỗng, nên thước «phân khúc này so phần còn lại» chỉ chia được Cao với Vừa. Ai đọc
hồ sơ nghiệm thu vòng trước rồi chạy lại bộ cào sẽ tưởng vấn đề đã chữa mà số trên
màn hình không nhúc nhích.

Nguồn: `_acceptance/gieo-rai-deu-danh-ba/review-findings.md` mục Ngoài-1 · sổ quyết
định `d-gieo-ngoai-1`, người chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/09.

## Cái giá phải cân

Nâng trần trang không miễn phí, và đó là lý do nó tách thành vòng riêng:

- Mỗi trang thêm tốn khoảng **5,5 giây** — `request_delay_seconds = 1.5` cộng
  `render_wait_seconds = 4.0`. Nâng 8 lên 30 là thêm 22 trang, khoảng hai phút mỗi
  lượt cào.
- Mỗi trang thêm là một lượt **phơi trước Cloudflare**. Kho này đã đo được ca bị
  chặn giữa lượt, và khi bị chặn thì mẫu tụt về đầu bảng mà bản tổng kết không báo
  (hạn chế đã ký, Ngoài-2 của vòng trước).
- Mẫu rải đều mang về nhiều môi giới mức thấp, mà `reveal_phones` chỉ lộ số cho mức
  «cao». Số điện thoại trong lô sẽ giảm mạnh — đo được: `--limit 50` cho 50 lượt lộ
  số ở khuôn cắt-đầu, 16 ở khuôn rải đều. Đội tiếp thị nhận nhiều tên hơn nhưng gọi
  được ít hơn.

## Câu chưa trả lời được ở đây

- Danh bạ nhatot thật sự có bao nhiêu trang? Trần 30 là con số đoán, chưa ai đo.
- Đội tiếp thị cần môi giới mức thấp để làm gì — gọi, hay chỉ để thước phân khúc
  chia được bốn mức? Hai câu trả lời dẫn tới hai phạm vi khác nhau.
- Có nên lộ số cho cả mức «vừa» và «thấp» không? Đó là trần chi phí riêng
  (`phone_reveal_cap = 200`) và là một quyết định về dữ liệu cá nhân, không phải
  một con số cấu hình.

## Ngả làm (chưa quyết)

1. Chỉ nâng `directory_max_pages` và đo lại phân bố mức. Rẻ nhất, trả lời được câu
   «rải mẫu có ăn thua không».
2. Nâng trần cộng nới `reveal_phones` sang mức «vừa». Đắt hơn, nhưng là thứ đội
   tiếp thị thật sự dùng được.
3. Đo trước, quyết sau: chạy một lượt `--dry-run` với trần cao để biết danh bạ có
   bao nhiêu trang và phân bố thật ra sao, rồi mới chọn số.
