# Máy chủ tạm trong test nghe 127.0.0.1 — thiết kế

Việc phụ F-127 của đợt `viec-du-an-kho-tai-lieu`, dãy V2, do Điều phối M5 giao 22/10 để gỡ tận gốc lỗi
`Malformed_HTTP_Response` (đã làm đỏ pre-push và CI ở DA12, DA13). Không có ô Cổng Đáng, không mã lộ trình.

## Lỗi

Colima (`limactl`) giữ một cổng ở `127.0.0.1` nằm trong dải cổng tạm (đo được 49333, rồi 51536). Máy chủ tạm của test
mở ở cổng 0 mà không chỉ hostname thì nghe trên `0.0.0.0`/`::`. macOS vẫn cấp cho nó đúng cổng `limactl` đang giữ ở
`127.0.0.1`, vì hai địa chỉ khác nhau. Bài test rồi fetch tới `127.0.0.1:<cổng>`: kết nối rơi vào `limactl`, nhận chữ
không phải HTTP, Bun báo `Malformed_HTTP_Response`.

Đã tái tạo trong scratchpad 22/10, không cần Colima: một socket giữ `127.0.0.1:P` và trả `SSH-2.0-…`; máy chủ Bun hay
Node nghe cổng P không hostname thì nghe được, và fetch `127.0.0.1:P` nhận `Malformed_HTTP_Response`. Máy chủ nghe
`127.0.0.1` thì bị từ chối cổng P ngay («Is port … in use?»), nên với cổng 0 hệ điều hành không bao giờ cấp cho nó cổng
đang bị giữ.

## Ba đường mở máy chủ tạm trong test

1. `Bun.serve({ port: 0 })` không `hostname` — 15 chỗ (trên tổng 17; hai chỗ ở `apps/agent-okr/test` đã có hostname) ở `apps/api/test`, `apps/agent/test/support`, `packages/db/test`,
   `scripts/ban-chup-lo-trinh/test`, `scripts/tin-hieu/test`. Thêm `hostname: "127.0.0.1"`. Chỗ nào gọi máy chủ qua
   `http://localhost:<cổng>` thì đổi sang `http://127.0.0.1:<cổng>`: máy chủ chỉ nghe IPv4 nên `localhost` phân giải
   ra `::1` sẽ bị từ chối.
2. `app.listen(0)` của Nest không hostname — `ban-chup-lo-trinh.spec.ts`, `tin-hieu-luu-tru.spec.ts`.
3. `supertest` — đường lớn nhất, ngoài danh sách M5 đo được. `request(app.getHttpServer())` với máy chủ chưa nghe thì
   `supertest` 7.2.2 tự gọi `server.listen(0)` không hostname rồi fetch `http://127.0.0.1:<cổng>` (`lib/test.js`,
   `serverAddress`). Đây đúng là đường của lỗi DA13 gặp: `Malformed_HTTP_Response fetching
   "http://127.0.0.1:49333/api/trpc/okr.setProgram"`. Máy chủ đã nghe thì `supertest` dùng cổng sẵn có.

Sửa đường 2 và 3 ở chỗ dựng app, để mọi app Nest trong `apps/api/test` đã nghe `127.0.0.1` trước khi `supertest`
hay `fetch` chạm tới:

- 21 chỗ `moduleFixture.createNestApplication(...)` rồi `await app.init()`: thay `await app.init()` bằng
  `await app.listen(0, "127.0.0.1")` — `listen` của Nest tự `init` khi chưa init.
- 28 chỗ `await createApp()` (đã tự `init`; `quet-khi-dang-nhap` có ba, `thanh-vien-vao-dung` có hai): thêm `await app.listen(0, "127.0.0.1")` ngay sau. Hai tệp đã tự `app.listen(0)` trong bài
  (`ban-chup-lo-trinh`, `tin-hieu-luu-tru`) và ba tệp tự `app.listen(0, "127.0.0.1")` trong bài (`cai-dat-chung-chi-quan-tri`,
  `go-la-cat-quyen`, `vai-chi-okr`) — ở cả năm, `supertest` đã gọi trước dòng đó: dòng nghe trong bài thành
  `app.getHttpServer()` hoặc bỏ đi, vì nghe hai lần là lỗi `ERR_SERVER_ALREADY_LISTEN`.

`app.getUrl()` sau đó trả `http://127.0.0.1:<cổng>`. Không thêm helper: một dòng tại chỗ đọc rõ hơn một lời gọi hàm
bọc đúng một dòng.

Không vá ngầm `net.Server.prototype.listen` trong `apps/api/test/setup.ts`: tệp nạp sẵn đó chỉ chạy qua script `test`
của gói, còn các eval của kho chạy `bun test <tệp>` trực tiếp, nên bản vá ngầm để sót đúng các lượt đo. Sửa tường
minh tại chỗ thì máy quét tĩnh kiểm được.

## Không đổi khẳng định nào

Mỗi tệp test chỉ đổi: thêm dòng `hostname`, thêm hostname vào `listen`, đổi `localhost` sang `127.0.0.1` trong URL
máy chủ tạm, thêm hay thay một dòng `listen(0, "127.0.0.1")` ở chỗ dựng app. Không đổi `expect`, không đổi lời ném, không đổi dữ liệu.
Một máy quét diff kiểm điều này.

## Đo

- `rang/quet.mjs` — máy quét tĩnh trên tệp git theo dõi ở `apps/*/test/**`, `packages/*/test/**`,
  `scripts/**/test/**`: mỗi `Bun.serve({` có `hostname: "127.0.0.1"`; mỗi `.listen(` mở cổng có `"127.0.0.1"`; ở
  `apps/api/test` mỗi tệp có số chỗ dựng app (`createApp(` · `createNestApplication(`) không lớn hơn số
  `listen(0, "127.0.0.1")`; không URL `http://localhost:${…port}` nào trỏ máy chủ tạm. Ma
  trận chỗ viết sẵn (đếm từng loại), lệch số thì ném. Chiều đỏ: chạy cùng máy quét trên mốc gốc (`--ref`) phải liệt đủ
  các chỗ cũ với lời ghim.
- `rang/co-che.ts` — tái tạo cơ chế như trên: không hostname → `Malformed_HTTP_Response`; hostname `127.0.0.1` → bị từ
  chối cổng bị giữ.
- `rang/khong-doi-khang-dinh.mjs` — diff `origin/onehub...HEAD` của mọi tệp test chỉ chứa các dòng thuộc bốn dạng sửa
  ở trên.
- Các tệp đã sửa chạy xanh; năm lệnh kiểm của kho xanh (suite của S4).

## Không làm

- Răng đo của các hồ sơ đã ký dưới `_acceptance/*/rang/` (vài chỗ `Bun.serve` không hostname): thước đã ký, máy
  không tự sửa; ghi việc riêng.
- Luật lint vĩnh viễn chặn máy chủ tạm không hostname trong test (anti-slop): việc riêng, đề xuất sau vòng.
- Đổi cấu hình Colima hay dải cổng tạm của máy.
