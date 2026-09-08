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

| Số đo | Giá trị |
| --- | --- |
| Thẻ mỗi trang | 11, đều tăm tắp qua mọi trang đọc được |
| Tin hiện có, trang 1 | 83 đến 458 |
| Tin hiện có, trang 43 | 8 |
| Trang đầu tiên cả trang dưới 20 tin | 16 |
| Trang bị chặn trong lượt dò 40 trang | 3 (các trang 10, 27, 34) |

Hai điều lượt dò lật ngửa mà không ai đoán trước:

**Danh bạ có LỖ ở giữa.** Trang 44 trả về 0 thẻ, hai lần đo đều vậy, không mang
dấu hiệu chặn nào. Trang 45 lại có đủ 11 thẻ. Nghĩa là **một trang rỗng KHÔNG
phải dấu hiệu hết danh bạ** — đây đúng là ca mà vòng trước vừa sửa (`if not
fresh: break` thành `continue`), và nay nó có bằng chứng từ danh bạ thật chứ
không chỉ từ bộ dựng sẵn.

**Trần trang là chính sách sai chỗ.** Số đúng cho hôm nay là số sai cho tháng
sau: danh bạ mọc thêm người thì trần cứng lại cắt đúng phần đuôi. Trần nên là
lan can an toàn, còn chính sách phải là «đọc tới khi hết».

## Ba thứ vòng này đổi

**1. Bộ gieo đọc tới khi danh bạ cạn, trần thành lan can.**
Vòng đọc dừng khi gặp `directory_stop_after_empty` trang LIÊN TIẾP không ra
người mới (mặc định 3 — trang 44 chứng minh 1 là quá ít), hoặc khi chạm
`directory_max_pages`. Trần nâng từ 8 lên một số cao hơn đáy đo được, đủ để
không cắt nhầm mà vẫn chặn được chi phí nếu sàn đổi cách phân trang.

**2. `reveal_phones` lộ số theo danh sách tầng khai trong cấu hình.**
Thay `item["tier"] == "cao"` cứng bằng `phone_reveal_tiers` trong `config.toml`.
Đội tiếp thị cần gọi người mức thấp thì danh sách gồm cả bốn mức. Trần
`phone_reveal_cap = 200` giữ nguyên — nó vẫn là chỗ chặn chi phí, và nay là chỗ
chặn DUY NHẤT nên nó phải thật sự chặn.

**3. Bản tổng kết khai sức khoẻ của mẫu.**
Đây là mục Ngoài-2 vòng trước ký nhận làm hạn chế đã biết: danh bạ bị chặn giữa
chừng thì mẫu tụt về đầu bảng mà bản tổng kết vẫn in `gieo` đủ trần như một lượt
khoẻ. Ở trần 8 trang một trang chặn mất 11 người. Ở trần 45 trang với mẫu rải
đều, một trang chặn lấy mất một lát của cả dải — im lặng thì người đọc số không
có cách nào biết. Bản tổng kết nay thêm ba số: số trang danh bạ đã đọc, số trang
hỏng, và cờ «đã chạm trần» (nghĩa là danh bạ có thể còn nữa).

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
3. **điều kiện dừng × danh bạ cạn trước trần** — cạn thật thì phải dừng, không
   đọc nốt lan can cho tốn.
4. **danh sách tầng lộ số × Thấp/Ngủ** — gọi được hay không nằm ở đây.
5. **trần lộ số × mọi tầng** — nới tầng thì trần thành chỗ chặn chi phí duy nhất.
6. **trang bị chặn × mọi tầng** — mẫu lệch phải hiện trên bản tổng kết.
7. **chạm trần khi danh bạ còn × mọi tầng** — cùng lý do: im lặng là nói dối.

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

Lượt cào dài ra đáng kể. Ước từ số đo: mỗi trang danh bạ tốn khoảng 5,5 giây
(`request_delay_seconds` 1,5 cộng `render_wait_seconds` 4,0). Trần 45 trang là
khoảng 4 phút đọc danh bạ, so với 44 giây ở trần 8. Cộng thêm phần lộ số nay
chạm tới 200 người thay vì chỉ số ít người mức cao — mỗi lượt lộ số là một lượt
tải trang nữa.

Đây là việc chạy theo đợt, không phải việc chạy liên tục, nên đắt về thời gian
chấp nhận được. Cái KHÔNG chấp nhận được là đắt mà im: vì vậy mục 3 nằm trong
Core chứ không phải Later.
