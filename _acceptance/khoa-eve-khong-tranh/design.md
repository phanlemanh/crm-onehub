# khoa-eve-khong-tranh — thiết kế

Nguồn: Ngoài-6, Ngoài-7 của `ca-chap-chon-cach-ly` (F11, #310). Tệp duy nhất của sản phẩm-đo: `apps/agent-okr/test/support/khoi-dong.ts`. Bài thử mới: `apps/agent-okr/test/khoa-eve-khong-tranh.spec.ts`.

## Hiện trạng

Khoá là một thư mục `node_modules/.cache/crm-eve-khoa/<băm gốc>/` tạo bằng `mkdirSync` (nguyên tử: chỉ một lượt tạo được), bên trong `chu.json = {pid, tep, con[]}`.

- `giuMot`: `mkdirSync` được → ghi `chu.json` → giữ. Không được → `khoaCu` (pid chủ chết, hoặc `chu.json` không đọc được và thư mục cũ hơn `nhipMs`) → `await dungMoCoi(khoa)` (SIGTERM rồi SIGKILL các eve đã ghi, chờ tới `dungMs` = 5 s) → `rmSync(khoa)` → thử lại.
- `ghiConVaoKhoa`: đọc `chu.json`, thêm `{pid, batDau}`, `writeFileSync` đè tại chỗ.
- `traKhoa` và bộ dọn lúc `exit`: `rmSync(khoa)` không hỏi khoá còn là của mình không.

## Hai khe

1. **Ghi đè tại chỗ (Ngoài-6).** `writeFileSync` mở O_TRUNC rồi ghi. Lượt chờ đọc giữa hai bước thấy tệp rỗng → `chuKhoa` = null → so mtime thư mục — thư mục không đổi mtime khi ghi đè một tệp đã có, nên nó đã «cũ» → `khoaCu` = true → lượt chờ dừng eve của chủ đang sống và gỡ khoá.
2. **Khe giữa xét-cũ và gỡ (Ngoài-7).** B và C cùng thấy khoá cũ. B dọn xong, gỡ, tạo khoá mới. C vẫn ở trong `dungMoCoi` (tới 5 s), rồi `rmSync` — gỡ khoá B vừa lấy, và trước đó `dungMoCoi` của C đọc `chu.json` hiện thời (của B) nên có thể dừng luôn eve của B.

## Cách sửa

**Ghi trọn một lần.** Một hàm `ghiChu(khoa, chu)` duy nhất: ghi `chu.json.tam-<uuid>` trong chính thư mục khoá rồi `renameSync` sang `chu.json`. `rename` trên cùng hệ tệp là nguyên tử — người đọc thấy bản cũ hoặc bản mới, không bao giờ thấy nửa chừng. Cả ghi lần đầu (`giuMot`) và `ghiConVaoKhoa` đi qua nó.

**Mỗi khoá có mã riêng.** `chu.json` thêm `ma` (uuid sinh lúc lấy khoá). Lượt đang giữ nhớ `{khoa, ma}`.

**Giành khoá cũ bằng đổi tên, rồi mới dọn.** Khi `khoaCu` trả về dấu của khoá nó vừa xét — `{ino, mtimeMs}` của thư mục và `ma` trong `chu.json` (vắng = `null`) — lượt chờ `renameSync(khoa, <khoa>.cu-<uuid>)`:
- đổi tên lỗi (ENOENT: lượt khác đã giành trước) → quay lại vòng chờ;
- đổi tên được → so dấu của thư mục vừa giành với dấu đã xét bằng `cungDau` (xuất ra): bằng khi cả ba phần bằng, `null` chỉ bằng `null`. `mtimeMs` có mặt vì ext4 cấp lại `ino` ngay sau khi xoá: khoá tạo lại trùng `ino` vẫn có `mtime` mới. Khác (khoá đã được thay bằng khoá mới giữa lúc xét và lúc giành) → trả lại tên cũ (`renameSync` ngược), quay lại vòng chờ, KHÔNG dừng eve nào. Khớp → `dungMoCoi(<khoa>.cu-…)` rồi `rmSync` thư mục đó.

Khe còn lại chỉ là vài lời gọi đồng bộ giữa `khoaCu` và `renameSync` (không còn `await`), và mọi lượt giành nhầm đều tự nhận ra nhờ dấu.

**Chủ khoá kiểm còn là chủ.** `ghiConVaoKhoa` đọc `ma` hiện thời: khác `ma` của mình → ném «khoa cua <goc> da doi chu». `traKhoa` và bộ dọn lúc `exit` (cùng một hàm `goNeuCuaMinh`) chỉ gỡ khi `ma` khớp; khác thì để yên khoá của người khác.

**Hằng.** `KHOI_DONG.khoa` thêm `duoiTam: ".tam-"`, `duoiCu: ".cu-"`.

**Chốt thử nghiệm.** `giuKhoaEve(cacGoc, tuyChon?)` nhận `{choMs?, sauKhiXetCu?, giuaGhi?}`; `ghiConVaoKhoa(goc, pid, tuyChon?)` nhận `{giuaGhi?}` truyền xuống `ghiChu`. Mặc định vắng — lời gọi hiện có không đổi. Xuất thêm `duongKhoaEve(goc)` và `xetKhoaCu(khoa)` cho bài thử.

## Bài thử ép thứ tự (không chờ may rủi)

- **Giữa lúc ghi:** `ghiConVaoKhoa(..., {giuaGhi})` — `giuaGhi` chạy sau khi tệp tạm đã ghi, trước `rename`. Trong đó bài đọc `chu.json` và gọi `xetKhoaCu`: phải đọc được bản cũ, và khoá không cũ. Trên bản sao ghi đè tại chỗ (mở O_TRUNC, gọi `giuaGhi`, rồi ghi) → đọc ra rỗng → đỏ.
- **Hai lượt chờ:** khoá cũ có eve mồ côi E0. Bài (lượt C) gọi `giuKhoaEve` với `sauKhiXetCu` chạy một lần: sinh tiến trình con B gọi `giuKhoaEve` thật, giành khoá cũ, dừng E0, lấy khoá, sinh eve giả E1 và ghi vào khoá, in «SAN SANG», sống tiếp. C đi tiếp → giành nhầm khoá của B → so dấu khác → trả lại → chờ tới `choMs` (nhỏ) → ném lỗi gọi tên pid B. Khẳng định: `chu.json` vẫn mang pid và `ma` của B, E1 còn sống, không còn thư mục `.cu-*`. Trên bản sao dùng lối cũ (`await dungMoCoi(khoa)` rồi `rmSync(khoa)`) → E1 bị dừng / khoá đổi chủ → đỏ.

## Đã cân và bỏ

- Một khoá phụ `<khoa>.don` làm mutex cho việc dọn: chính khoá phụ cũng cần luật cũ/mới, khe chỉ dời xuống một tầng.
- `proper-lockfile` (npm): khoá thư mục + làm tươi mtime + `onCompromised`. Đúng hình dạng nhưng thêm phụ thuộc và nhịp làm tươi cho một tệp test; lấy ý `onCompromised` thành phép kiểm `ma` ở `ghiConVaoKhoa`/`traKhoa`.

## Đặc tả UX

Không chạm UI.
