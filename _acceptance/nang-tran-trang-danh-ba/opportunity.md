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

## Ngưỡng chết / ngưỡng UAT

Đo bằng ĐÚNG MỘT lượt nạp thật `--limit 200` với cấu hình đang ship, đọc từ dòng
`lượt chạy:` mà lệnh in ra. Ba thước, mỗi thước một trường có sẵn.

| Thước | Đọc ở đâu | Sống | Chết |
| --- | --- | --- | --- |
| [đề xuất] Mức Thấp có người thật | `phan_bo_tang.thap` | ≥ 50 trên 200 hồ sơ | < 20 |
| [đề xuất] Gọi được người mức thấp | số hồ sơ mức `thap` có trường `phone` | ≥ 30 | < 10 |
| [đề xuất] Chi phí một lượt còn chịu được | đồng hồ, và `trang_danh_ba_hong` chia `trang_danh_ba_doc` cộng `rong` cộng `hong` | dưới 75 phút VÀ trang hỏng dưới 35% | quá 120 phút HOẶC trang hỏng từ 50% |

Căn cứ của từng con số, để người chốt biết cái nào có nền và cái nào không:

- **Thước 1 có nền đo.** Lượt dò 08/09 đọc 407 người qua 37 trang: 262 người
  (64%) có tin hiện có dưới 20, tức chặn trên của họ nằm dưới ngưỡng «Vừa» nên
  không thể là Cao hay Vừa. Ở trần 120 trang danh bạ ra hơn 1000 người, nên mẫu
  rải đều 200 người phải chạm nhóm đó rất nhiều. Ngưỡng 50 là mức thấp có chủ ý:
  nó vẫn đỏ nếu bộ rải hỏng, mà không đỏ oan vì một lượt cào bị chặn vài trang.
- **Thước 2 KHÔNG có nền đo — đây là thước yếu nhất trong ba.** Chưa ai đo tỉ lệ
  lộ số thành công cho hồ sơ mức thấp; sàn có thể ẩn số của tài khoản ít hoạt
  động. Con số 30 là mức đủ để đội tiếp thị chạy một tuần gọi, không phải suy ra
  từ dữ liệu. Nếu thước này đỏ thì đó chính là điều đáng biết nhất của cả vòng.
- **Thước 3 có nền đo một nửa.** Mỗi trang tốn khoảng 5,5 giây (`request_delay_seconds`
  1,5 cộng `render_wait_seconds` 4,0), nên 120 trang là khoảng 11 phút đọc danh bạ,
  cộng 200 lượt tải hồ sơ và tới 200 lượt lộ số — ước khoảng 45 phút. Ngưỡng 75
  phút cho biên an toàn. Phần trang hỏng đo được: 3 trên 40 ở vùng trang đầu,
  12 trên 49 ở vùng trang sâu; ngưỡng 35% đặt trên mức đã thấy để không đỏ oan,
  ngưỡng chết 50% là mức mà mẫu coi như thủng.

Ba dòng trên còn mang dấu `[đề xuất]`, tức CHƯA phải ngưỡng của người. Bỏ dấu đó
đi là chốt; sửa số rồi bỏ dấu cũng là chốt.

## Ngả làm (chưa quyết)

1. Chỉ nâng `directory_max_pages` và đo lại phân bố mức. Rẻ nhất, trả lời được câu
   «rải mẫu có ăn thua không».
2. Nâng trần cộng nới `reveal_phones` sang mức «vừa». Đắt hơn, nhưng là thứ đội
   tiếp thị thật sự dùng được.
3. Đo trước, quyết sau: chạy một lượt `--dry-run` với trần cao để biết danh bạ có
   bao nhiêu trang và phân bố thật ra sao, rồi mới chọn số.
