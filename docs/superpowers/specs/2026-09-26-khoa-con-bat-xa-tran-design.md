# khoa-con-bat-xa-tran — đưa ca `khoa-con-bat` ra xa trần 5 giây

Ngày: 2026-09-26 · Hạng: T2 · Hồ sơ: `_acceptance/khoa-con-bat-xa-tran/`

## Vấn đề

`apps/api/test/go-la-cat-quyen.spec.ts` > `khoa-con-bat` hết giờ ở CI: 5144ms so với
trần mặc định 5000ms của `bun test` (run 36191005876, attempt 1, PR #146 — nhánh không
chạm `apps/api`). Attempt 2 của cùng run xanh ở 3731ms. Ca này chạy sát trần ngay cả khi
máy CI khoẻ, nên chỉ cần một máy CI chậm hơn ~35% là đỏ.

## Đo trước khi làm (26/09, Mac mini, Bun 1.3.12, env như `ci.yml`)

Chạy cả tệp 5 lượt `--randomize`, reporter junit:

| Ca | Trung bình | Lớn nhất |
|---|---|---|
| `khoa-con-bat` | 2.52s | 4.10s |
| ca kế tiếp (`doi-chung-thanh-vien`) | 0.82s | 0.96s |

Cấy tạm bộ đếm giờ vào từng pha của ca (5 lượt):

| Pha | Trung bình | Lớn nhất |
|---|---|---|
| tạo khoá | 1ms | 4ms |
| đối chứng tRPC + REST khi còn là thành viên | 29ms | 54ms |
| xoá dòng member | 1ms | 1ms |
| ma trận tRPC (~230 thủ tục, tuần tự) | 829ms | 1016ms |
| ma trận REST (~230 đường, tuần tự) | 949ms | 1286ms |

`beforeEach` chỉ thêm ~70ms. Gần trọn thân ca là hai ma trận: ~460 lượt gọi tuần tự,
~4ms mỗi lượt. Cùng ma trận tRPC nhưng bằng cookie (`ma-tran-dang-nhap-lai`) chỉ ~1.5ms
mỗi lượt. Phần chênh nằm ở đường đi của khoá API.

Giả thuyết ban đầu: `@better-auth/api-key` 1.6.25, nhánh `rateLimit: { enabled: false }`,
vẫn ghi `UPDATE apikey SET lastRequest` vào cùng một hàng ở MỖI lượt (`consumeRateLimit`
→ `decision.type === "skip"`), nên thời gian ca bám theo độ trễ commit của Postgres. Một
phiên khác («Xem việc api-key ghi CSDL ở mỗi yêu cầu», 26/09) đo riêng trên CSDL riêng,
300 lượt tuần tự và 15×20 song song, hai vòng: mỗi yêu cầu dùng khoá có đúng 2 câu
`UPDATE apikey`, nhưng chỉ tốn ~0.3–0.5ms/lượt tại chỗ. Giả thuyết vì thế **chưa được
chứng**: câu ghi giải thích được một phần nhỏ, phần chênh còn lại (~2ms/lượt) chưa quy
được. Cách sửa của vòng này không dựa vào nguyên nhân đó — nó được đo bằng thời gian.

Hai thử nghiệm trên bản sao tạm của tệp (đã hoàn lại):

| Thử | `khoa-con-bat` trung bình / lớn nhất |
|---|---|
| A — cho app nghe cổng một lần ở `beforeAll` (supertest thôi `listen(0)` mỗi lượt) | 1.95s / 2.33s — không đổi |
| B — hai ma trận chạy song song, tối đa 8 lượt cùng lúc | 0.68s / 0.75s |

A không đổi nên chi phí nằm phía máy chủ, không phải ở supertest. B nhanh ~2.7 lần và
thu hẹp độ dao động: phần lớn thời gian mỗi lượt là chờ (I/O), không phải CPU của tiến
trình kiểm — chờ gì cụ thể thì chưa quy được (xem giả thuyết ở trên).

## Cách làm

- Thêm một hàm chạy danh sách theo lô cố định: cắt danh sách thành từng lát `lo` phần tử,
  `Promise.all` từng lát, nối kết quả theo thứ tự lát. Thứ tự kết quả giữ tự nhiên, mảng
  không có lỗ. `maTranTrpc` và `maTranRest` nhận thêm tham số số lượt, mặc định 1 — với 1
  thì mỗi lát một phần tử, tức tuần tự như cũ. (Bản thử B dùng hàng đợi thợ; lô cố định
  chậm hơn một chút vì mỗi lát chờ lượt chậm nhất — đo lại ở S3.)
- Thêm ca `theo-lo`: chạy bộ chia lô trên 40 phần tử giả, đếm số lượt đang chạy cùng lúc
  lớn nhất — mặc định phải bằng 1, `LO_SONG_SONG` phải bằng đúng nó và không quá 8. Đây là
  thước hành vi cho «các ca khác vẫn tuần tự», không chỉ đọc chữ ở chỗ gọi.
- Chỉ `khoa-con-bat` gọi hai ma trận với 8 lượt. Mọi ca khác giữ tuần tự: ca
  `doi-chung-thanh-vien` chạy ma trận bằng tư cách thành viên, nên một số thủ tục ghi có
  thể thực thi thật — đổi thứ tự của chúng là đổi phép đo, không nằm trong vòng này.
- 8 vì pool `pg` của `PrismaPg({ connectionString })` mặc định 10 kết nối: 8 lượt cùng lúc
  không bao giờ phải xếp hàng chờ pool, còn chỗ cho truy vấn của chính bài kiểm.
- Hằng số lượt đặt ở đầu tệp cạnh `SAN_THU_TUC`, `SAN_DUONG_REST` — đúng lối của tệp.
- Ca thêm hai khẳng định: danh sách tên hàng của ma trận tRPC bằng đúng danh sách thủ tục
  của sổ router theo thứ tự, và danh sách tên hàng của ma trận REST bằng đúng danh sách
  đường. Chạy song song thì một lỗi của bộ chia lô (rơi, trùng, đảo hàng) phải đỏ với
  thông điệp gọi tên ma trận lệch, không được làm ma trận ngắn lại mà vẫn xanh.
- Không đổi trần thời gian. Ca không chậm bản chất: 460 lượt gọi độc lập chạy tuần tự
  là lựa chọn của phép đo, không phải của hành vi được đo.

## Phương án đã loại

- **Nới trần** (`test(…, 15_000)`): che đúng thứ đang hỏng — mọi lượt ghi vẫn nối đuôi,
  và lần kế tiếp máy CI chậm hơn thì trần mới lại sát. Không có lý do nói được thành lời.
- **Tách ca thành `-trpc` và `-rest`**: mỗi nửa ~1.85s ở CI khoẻ, ~2.6s ở CI chậm — vẫn
  quá nửa trần, và đổi tên ca.
- **Rút ma trận thành mẫu**: làm yếu lời hứa «mọi thủ tục» của AC-5 hồ sơ
  `go-la-cat-quyen-that`.
- **Bật `deferUpdates` cho plugin khoá**: đổi hành vi sản phẩm (`packages/auth`, T3) để
  làm nhanh một bài kiểm — sai chiều.
- **App nghe cổng một lần**: đo rồi, không đổi (thử A).

## Kiểm chứng

- Chạy cả tệp 10 lượt `--randomize` với env CI: mọi ca xanh, `khoa-con-bat` ≤ 1250ms mỗi
  lượt (một phần tư trần). Chiều đỏ: cùng thước trên bản trước vá của tệp (đo được
  1.6–4.1s).
- Bản sao đột biến của tệp: khoá của người còn là thành viên (bỏ dòng xoá member) → ca đỏ
  với thông điệp ghim; bộ chia lô bỏ lô cuối, đảo thứ tự trong lô, hay ma trận REST bỏ
  đường đầu → ca đỏ với thông điệp ghim; bản sao không đột biến → xanh.
- Tệp, bunfig, script `test` của gói và lệnh test của CI không có trần nới nào.
- Ca `theo-lo` xanh; bản sao bộ chia lô bỏ qua tham số thì đỏ.
- Sau khi mở PR: đọc thời gian thật của ca trong log CI, ghi vào mô tả PR.
- Năm lệnh chứng của kho.

## Đặc tả UX

Không áp dụng — việc chỉ chạm một tệp test, không có màn hình (sổ quyết định: «bỏ
đặc-tả-UX»).
