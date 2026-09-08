# Thiết kế — nâng trần trang danh bạ

Hồ sơ cơ hội: `_acceptance/nang-tran-trang-danh-ba/opportunity.md`
Hồ sơ nghiệm thu: `_acceptance/nang-tran-trang-danh-ba/`
Hạng: T2 · mặt: `cli`

## Đề bài

Vòng `gieo-rai-deu-danh-ba` (ký 08/09) đã dạy bộ gieo rải mẫu đều qua các trang
danh bạ. Nhưng ở `directory_max_pages = 8` đang ship, cả danh bạ đọc được chỉ ra
88 người, tất cả đều ở đầu bảng — nên bộ rải không có gì để rải. Mức «Thấp» và
«Ngủ» của trục Sản lượng vẫn rỗng.

Chủ sản phẩm chốt ở Cổng Đáng: đội tiếp thị cần môi giới sản lượng thấp **cho cả
hai việc** — gọi tuyển họ, và để thước phân khúc chia đủ bốn mức. Vế «gọi tuyển»
kéo theo số điện thoại, mà `reveal_phones` hiện chỉ lộ số cho mức «cao».

## Đã đo được (không phải ước lượng)

Bốn lượt dò danh bạ thật, dùng đúng bộ nạp và nhịp của bộ cào:

| Số đo | Giá trị | Lượt dò |
| --- | --- | --- |
| Thẻ mỗi trang | 11, đều qua cả 74 trang đọc được | 1–5 |
| Tin hiện có, trang 1 | 83 đến 458 | 1 |
| Trang đầu tiên cả trang dưới 20 tin | 16 | 1 |
| Tin hiện có, trang 93 | 1 | 4 |
| Trang sâu nhất còn người | **93, vẫn đầy 11 thẻ** | 4 |
| **Đáy danh bạ** | **CHƯA ĐO ĐƯỢC** — lượt dò dừng vì chuỗi trang không tải được, không vì hết người | 4 |
| Trang hỏng, vùng 1–40 | 3 trên 40 — 7,5% | 1 |
| Trang hỏng, vùng 45–93 | 12 trên 49 — **24%** | 4 |

Ba điều lượt dò lật ngửa mà không ai đoán trước:

**Danh bạ có LỖ ở giữa.** Trang 44 trả về 0 thẻ, hai lần đo đều vậy, không mang
dấu hiệu chặn nào. Trang 45 lại có đủ 11 thẻ. Nghĩa là **một trang rỗng KHÔNG
phải dấu hiệu hết danh bạ** — đây đúng là ca mà vòng trước vừa sửa (`if not
fresh: break` thành `continue`), và nay nó có bằng chứng từ danh bạ thật chứ
không chỉ từ bộ dựng sẵn.

**Trang hỏng cũng «không ra người mới».** Ở vùng trang sâu cứ bốn trang có một
trang không tải được. Nếu phép đếm để dừng đọc gộp trang-hỏng với
trang-đọc-được-mà-rỗng, thì một chuỗi ba trang bị chặn sẽ dừng lượt cào ở giữa
danh bạ, cờ «đã chạm trần» KHÔNG bật vì chưa chạm trần, và bản tổng kết in ra
một lượt trông khoẻ. Đó đúng là lớp lỗi vòng này sinh ra để chữa, chỉ im lặng
hơn. Làn phản biện context sạch bắt được điều này, không phải tôi.

**Trần trang là chính sách sai chỗ.** Số đúng cho hôm nay là số sai cho tháng
sau: danh bạ mọc thêm người thì trần cứng lại cắt đúng phần đuôi. Trần nên là
lan can an toàn, còn chính sách phải là «đọc tới khi hết».

## Năm thứ vòng này đổi

**1. Bộ gieo đọc tới khi danh bạ cạn, trần thành lan can.**
Vòng đọc dừng khi gặp `directory_stop_after_empty` trang LIÊN TIẾP không ra
người mới (mặc định 3 — trang 44 chứng minh 1 là quá ít), hoặc khi chạm
`directory_max_pages`. Trần nâng từ 8 lên **120**, chọn theo CHI PHÍ chứ không
theo đáy: đáy chưa ai chạm, còn 120 trang là khoảng 11 phút đọc.

**2. Phép đếm để dừng CHỈ tính trang đọc được.**
Trang không tải được không cộng vào biến đếm dừng. Nó cộng vào số trang hỏng
của bản tổng kết. Đây là mục nặng nhất làn phản biện bắt được, và số đo 24%
trang hỏng ở vùng sâu làm nó thành chuyện thường chứ không phải ca hiếm.

**3. `reveal_phones` lộ số theo danh sách tầng khai trong cấu hình, và rải khắp lô.**
Thay `item["tier"] == "cao"` cứng bằng `phone_reveal_tiers` trong `config.toml`.
Đội tiếp thị cần gọi người mức thấp thì danh sách gồm cả bốn mức. Trần
`phone_reveal_cap = 200` giữ nguyên — nó vẫn là chỗ chặn chi phí, và nay là chỗ
chặn DUY NHẤT nên nó phải thật sự chặn.

**4. Khi lô lớn hơn trần lộ số, chọn ai lộ bằng cách RẢI KHẮP lô.**
Lô xếp theo trang danh bạ, mà tin hiện có giảm đơn điệu theo trang. Lấy 200
người đầu lô là lộ số cho đúng nhóm đội tiếp thị đã có — lời hứa của cả vòng
chết trong khi mọi phép đo vẫn xanh. Dùng lại bộ rải của vòng trước.

**5. Bản tổng kết khai sức khoẻ của mẫu.**
Đây là mục Ngoài-2 vòng trước ký nhận làm hạn chế đã biết: danh bạ bị chặn giữa
chừng thì mẫu tụt về đầu bảng mà bản tổng kết vẫn in `gieo` đủ trần như một lượt
khoẻ. Ở trần 8 trang một trang chặn mất 11 người. Ở trần 45 trang với mẫu rải
đều, một trang chặn lấy mất một lát của cả dải — im lặng thì người đọc số không
có cách nào biết. Bản tổng kết nay thêm bốn thứ: số trang danh bạ đã đọc, số trang
hỏng, cờ «đã chạm trần» (nghĩa là danh bạ có thể còn nữa), và bảng đếm hồ sơ
theo bốn mức Sản lượng — bảng đó là thứ phiên nghiệm thu sẽ đọc để trả lời câu
«rải mẫu có ăn thua không».

## Quét không gian tiêu chí

Chân sản phẩm: `CONTEXT.md` mục **Sản lượng** khai đúng bốn mức `Cao · Vừa ·
Thấp · Ngủ` [SUY-TỪ-REPO: CONTEXT.md:149] · `tools/listing-crawl/config.toml`
khai ba khoá điều khiển đường từ danh bạ tới lô gửi [SUY-TỪ-REPO].
Chân ngành: sàn dữ liệu người-mua-tiềm-năng tách «tìm được người» khỏi «lộ số điện
thoại» và đặt hạn mức riêng cho vế sau — Apollo.io và ZoomInfo đều làm vậy
[NGÀNH: Apollo.io, ZoomInfo]. Bài học áp vào đây: trần lộ số là núm riêng, không
được suy ra từ trần người.

### Trục

- **Trục A — núm đổi**: trần trang · điều kiện dừng đọc · danh sách tầng lộ số ·
  trần lộ số
  [thước CE: bốn khoá điều khiển đường đi trong `config.toml`, đếm được từ mã]
- **Trục B — tầng sản lượng đích**: Cao · Vừa · Thấp · Ngủ
  [thước CE: `CONTEXT.md` khai đóng đúng bốn mức]
- **Trục C — cách hỏng**: trang bị chặn · trang rỗng giữa danh bạ · danh bạ cạn
  trước trần · chạm trần khi danh bạ còn · lộ số thất bại
  [thước CE: bốn cái đầu đo được từ bốn lượt dò thật; cái cuối đã có nhánh
  `continue` trong `reveal_phones`]

### Core

1. **trần × Thấp/Ngủ** — nâng trần thì mới có người mức thấp để rải vào mẫu.
2. **điều kiện dừng × trang rỗng giữa danh bạ** — trang 44 rỗng mà 45 có người;
   dừng ở trang rỗng đầu tiên là cắt mất phần đuôi.
3. **điều kiện dừng × trang bị chặn** — trang hỏng cũng «không ra người mới»;
   gộp nó vào phép đếm dừng là dựng lại đúng lỗi cũ, im hơn.
4. **điều kiện dừng × danh bạ cạn trước trần** — cạn thật thì phải dừng, không
   đọc nốt lan can cho tốn.
5. **danh sách tầng lộ số × Thấp/Ngủ** — gọi được hay không nằm ở đây.
6. **trần lộ số × Thấp/Ngủ** — nới tầng rồi lấy phần đầu lô là lộ số cho đúng
   nhóm đã có; trần phải cắt mà không cắt mất mức thấp.
7. **trang bị chặn × mọi tầng** — mẫu lệch phải hiện trên bản tổng kết.
8. **chạm trần khi danh bạ còn × mọi tầng** — cùng lý do: im lặng là nói dối.

### Later

- Đổi ngưỡng tầng 60/20/1 — số đó thuộc định nghĩa Sản lượng, không thuộc vòng này.
- Rải mẫu có trọng số theo tầng (lấy nhiều người mức thấp hơn mức cao).
- Đọc danh bạ tỉnh khác — hiện chỉ khai đúng một đường dẫn TP Hồ Chí Minh.
- Thử lại trang bị chặn — vòng này chỉ KHAI ra, chưa chữa.

### Never

- Bỏ trần lộ số. Nới tầng mà bỏ trần là mở một đường chi phí không đáy, và số
  điện thoại là dữ liệu cá nhân của người thật.
- Lộ số cho người không nằm trong lô gửi đi. Lộ số là đụng vào dữ liệu cá nhân;
  làm việc đó cho người rồi vứt đi là không có lý do nào biện hộ được.

### Cross-cutting áp mọi ô Core

- `respect_robots` và `request_delay_seconds` giữ nguyên. Vòng này làm lượt cào
  dài ra nhiều lần, nên nhịp là thứ duy nhất giữ cho nó vẫn lịch sự.
- Không bao giờ commit số điện thoại thật. Bằng chứng dùng `--redact`.

## Đường đo

Hồ sơ cơ hội khai ba câu chưa trả lời được. Vòng này trả lời hai, và đóng câu
thứ ba bằng quyết định của người:

| Ngưỡng ở Cổng Đáng | Số từ đâu | AC nào bảo đảm |
| --- | --- | --- |
| Danh bạ thật có bao nhiêu trang | Đo được ở S1, và AC-2 giữ cho bộ gieo không phụ thuộc con số đó | AC-2 |
| Đội cần người mức thấp để làm gì | Người trả lời ở S1: gọi tuyển VÀ thước bốn mức | AC-4 |
| Có nên lộ số cho mức Vừa/Thấp không | Suy ra từ câu trên: có | AC-4, AC-5 |

## Đổi lấy

Lượt cào dài ra đáng kể. Mỗi trang danh bạ tốn khoảng 5,5 giây (`request_delay_seconds`
1,5 cộng `render_wait_seconds` 4,0):

| Phần | Trước | Sau |
| --- | --- | --- |
| Đọc danh bạ | 8 trang, 44 giây | tới 120 trang, khoảng 11 phút |
| Tải hồ sơ ở `--limit 200` | 200 lượt, khoảng 18 phút | không đổi |
| Lộ số điện thoại | số ít người mức cao | tới 200 lượt, khoảng 18 phút |
| **Một lượt nạp trọn** | **khoảng 20 phút** | **khoảng 45 phút** |

Đây là việc chạy theo đợt, không phải việc chạy liên tục, nên đắt về thời gian
chấp nhận được. Cái KHÔNG chấp nhận được là đắt mà im: vì vậy mục 3 nằm trong
Core chứ không phải Later.
