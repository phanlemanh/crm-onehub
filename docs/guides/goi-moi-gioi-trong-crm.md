# Gọi môi giới trong CRM — hướng dẫn cho đội tiếp thị

Bản 07/09/2026. Viết cho bản đang chạy hôm nay, kể cả những chỗ chưa làm được.
Bản trình bày có hình: <https://claude.ai/code/artifact/0a1e3c2c-f571-466c-a516-df2218af3faa>

Lọc ra nhóm môi giới đáng gọi nhất, gọi, ghi kết quả bằng một cú bấm, rồi đọc
xem nhóm mình chọn có trả lời khá hơn phần còn lại không — tất cả trong CRM,
không xuất bảng tính.

## Dữ liệu môi giới ở đâu ra

Bạn không tự lấy. Một bộ cào chạy riêng đọc chuyên trang môi giới của **nhatot**
và nạp thẳng vào CRM. Mỗi môi giới thành một **cá nhân** trong danh bạ, mang
chín trường lấy từ sàn.

| Trường trên màn | Nó nói gì |
|---|---|
| Sản lượng | Mức Cao · Vừa · Thấp · Ngủ, xếp theo số tin đang đăng |
| Tin đang đăng | Số tin người đó đang có trên sàn |
| Tin mới 30 ngày | Xem mục *Chỗ chưa làm được* — hiện bằng đúng cột bên trái |
| Địa bàn | Các quận người đó đang bán |
| Hình thái | Công ty hay cá nhân |
| Chứng chỉ | Có huy hiệu chứng chỉ hành nghề trên sàn hay không |
| Tên chuyên trang | Tên gian hàng của người đó trên sàn |
| Trang nhatot | Địa chỉ hồ sơ — bấm để xem trang gốc |
| Sàn cập nhật lúc | Lần cuối sàn đổi thông tin đó |

**Mức sản lượng tính thế nào.** Cao là từ 60 tin trở lên, Vừa từ 20, Thấp từ 1.
Ba con số này nằm trong tệp cấu hình của bộ cào, không chỉnh được trên màn.

**Cần thêm môi giới thì nhờ người kỹ thuật chạy một lượt cào mới.** Nói rõ ba
điều: lấy bao nhiêu hồ sơ, khu vực nào, và có cần lộ số điện thoại không — sàn
giấu số sau nút, bộ cào phải bấm ra, mỗi lượt tối đa 200 số. Một lượt 50 hồ sơ
mất khoảng ba phút vì bộ cào chờ 1,5 giây giữa hai lần gọi.

## Năm bước, từ danh bạ tới con số

1. **Lọc ra nhóm đáng gọi.** Mở **Cá nhân** ở thanh bên. Bấm **Lọc** → **Sản
   lượng** → chọn **Cao**. Lọc thêm theo **Địa bàn** hay **Chứng chỉ** nếu muốn
   hẹp hơn.
2. **Giữ nhóm đó lại.** Bấm **Bảng xem** → **Lưu bảng xem này…**, đặt tên, và
   **bật «Chia sẻ với cả đội»**. Lần sau khỏi lọc lại, và cả đội dùng chung một
   định nghĩa nhóm.
3. **Mở đợt gọi.** Sang **Chiến dịch** → **Chiến dịch mới**. Đặt tên, chọn
   **Phân khúc** là bảng xem vừa lưu, viết **Lời chào** nếu muốn. Bấm **Tạo
   chiến dịch**, rồi **Bắt đầu**. — «Bảng xem», «góc nhìn» và «phân khúc» trên
   các màn khác nhau đang là cùng một thứ.
4. **Gọi và ghi kết quả.** Bấm số để gọi. Gọi xong bấm đúng một nút ở cột **Ghi
   kết quả**: Không nghe · Trả lời · Hẹn gặp (cũng tính là đã trả lời) · Từ chối
   · Sai số. Bật **Chưa gọi** để ẩn người đã gọi. Cuộc gọi cũng hiện trên dòng
   thời gian của người đó.
5. **Đọc con số.** Dải trên là chiến dịch này, dải dưới là **mọi chiến dịch
   khác** — đó là đối chứng. Nhóm bạn chọn có đáng không, đọc ở chênh lệch giữa
   hai dải. Gọi xong cả đợt thì bấm **Kết thúc**.

> **Cẩn thận:** **Kết thúc** ăn ngay, không hỏi lại, và **không mở lại được**.
> Người chưa gọi trong đợt đó mất đường gọi tiếp.

## Chỗ chưa làm được — đọc trước khi tin một con số

- **Một nửa danh bạ chưa gọi được.** Kho có 98 môi giới nhưng chỉ **49 người**
  mang số thật; 49 người còn lại là dữ liệu thử, số hiện là `09xxxxxxxx`. Thấy
  chuỗi đó thì bỏ qua, và nhớ trừ họ khi tính tỷ lệ trả lời.
- **Mức Thấp và Ngủ đang rỗng.** Bộ cào lấy từ đầu danh bạ, nơi sàn xếp người
  sản lượng cao trước.
- **«Tin mới 30 ngày» bằng đúng «Tin đang đăng».** Sàn chỉ công bố một con số
  cho cả hai. Đừng đọc cột đó như thước đo độ tươi.
- **Chiến dịch đầu tiên không có đối chứng.** Cần ít nhất hai đợt để so.
- **Ô tìm trong danh sách thành viên tìm cả người ngoài nhóm.** Đang có việc sửa
  riêng.
- **Bảng xem đang được một chiến dịch dùng thì không xoá được.** Menu ghi «Đang
  là phân khúc của…». Muốn bỏ, vào trang chiến dịch đổi phân khúc trước.
- **Thông báo lỗi của máy chủ còn tiếng Anh.**

## Phụ lục — cho người chạy lượt nạp

```bash
# thử trước, không ra mạng
cd tools/listing-crawl
./.venv/bin/python -m listing_crawl --fixtures --dry-run --out /tmp/thu.json

# cào thật rồi nạp
./.venv/bin/python -m listing_crawl --limit 200 --log /tmp/crawl.log
```

**Ba điều bắt buộc giữ.** Cờ `--redact` chỉ dùng cho tệp đưa vào hồ sơ nghiệm
thu, không dùng cho lượt nạp thật — dữ liệu che thì đội không gọi được ai. Lô
thật **không được commit**: tên và số điện thoại là dữ liệu cá nhân của người
ngoài đời. Giữ nguyên `respect_robots` và nhịp chờ 1,5 giây trong `config.toml`.

Lô luôn ghi ra đĩa trước khi gửi, chia theo `batch_size`. Lô gửi hỏng không kéo
lô khác xuống; gửi lại chỉ cần tệp đó, không cào lại. Ngưỡng mức sản lượng nằm
ở khối `[tiers]` cùng tệp. Chi tiết đầy đủ: `tools/listing-crawl/README.md`.

## Ba câu hỏi thường gặp

- **Số điện thoại là `09xxxxxxxx`** — bản ghi thử, không gọi được. Nhờ người kỹ
  thuật dọn hoặc nạp thêm dữ liệu thật.
- **Tỷ lệ trả lời trông quá cao** — kiểm xem trong nhóm có bản ghi thử không.
  «Hẹn gặp» cũng tính vào «đã trả lời».
- **Dải dưới ghi «Chưa có đối chứng»** — đây là chiến dịch duy nhất trong hệ.
