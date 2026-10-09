# Ca chập chờn còn lại (F17) — thiết kế

Ba ca CI đỏ rồi chạy lại xanh, tách khỏi `ca-chap-chon-cach-ly` (yêu cầu P5-5) và thêm một ca đêm 08/10.

## Hiện trạng đã đo

### Hai ca «the fixture bites» của `apps/agent/test/tasks.integration.spec.ts`

Khối «a limited lock subquery when the planner re-runs it per row» dựng thống kê cũ (`ANALYZE` khi bảng có
một hàng, rồi chèn thêm hai) để planner chạy lại subquery `LIMIT … FOR UPDATE SKIP LOCKED` mỗi hàng; hai ca
đối chứng dương đòi câu xấu trả đủ 3 hàng.

- CI 37624939982 lượt 1 (07/10): «the fixture bites for due work too» (:337) — 3 hàng thành 2.
- CI 37824401395 lượt 1, 18:39:39Z 08/10, PR #321: «the fixture bites: a subquery joined in FROM hands out every
  row» (:332) — `Expected length: 3 / Received length: 2` ở `tasks.integration.spec.ts:332:25`. Chạy lại xanh.
- Tại chỗ: 30/30 xanh chạy riêng, 30/30 xanh kèm tệp đứng trước (`tai-lieu-nguon-mo-coi`) — không phải việc nền
  sót của tệp trước.
- Tái hiện: một `ANALYZE "agentTask"` chen giữa bước gieo và `probe` cho đúng 2 hàng. `EXPLAIN` hai phía: vẫn
  Nested Loop, nhưng thứ tự nối đảo — thống kê cũ thì `Seq Scan on agentTask t` ở ngoài, subquery ở trong (chạy
  lại mỗi hàng, 3 hàng); thống kê mới thì subquery ra ngoài (chạy một lần, 2 hàng). Ghim phương pháp nối
  (`SET LOCAL enable_hashjoin/mergejoin = off`) không đổi gì — đo cả bốn tổ hợp.
- Nguồn đảo kế hoạch trên CI: CHƯA có dòng log nào chứng. Hai giả thuyết:
  - autovacuum chạy auto-analyze — `staleStatistics` gọi `deleteMany({})`, xoá mọi hàng các tệp trước để lại, đủ
    vượt ngưỡng; worker chạy theo `autovacuum_naptime`, nên đôi khi rơi vào vài chục mili-giây của khối. Phân biệt
    bằng `last_autoanalyze` đổi.
  - planner nội suy số hàng theo số trang hiện tại (`reltuples/relpages` × số trang): hai hàng chèn thêm làm bảng
    nở trang (dead tuple của `deleteMany`) thì ước lượng đổi mà không có ANALYZE nào. Phân biệt bằng `relpages`
    khác số trang hiện tại, hai mốc analyze đứng yên.
  Bản sửa chặn giả thuyết thứ nhất và in đủ trường để phân biệt hai giả thuyết nếu còn đỏ.

### Ca `goiKiemTu` của `apps/agent-okr/test/goi-soan.integration.spec.ts:376`

CI 37171465448, 37184155892 lượt 1: «so cap nhat tuan khong in lot». Bộ gieo đặt giá trị cập nhật tuần 22, 26, 30;
bài đòi 26 không có trong `soTrongGoi`.

- Tái hiện chắc chắn: `setSystemTime(1791498237630)` (base36 `mv03sn26`) trước khi gieo → đỏ đúng thông điệp.
- In dòng của gói chứa «26»: `"ten": "sokr-mv03sn26x43"` — tên thành viên dựng bằng `ma()` của
  `apps/agent-okr/test/support/gieo.ts` = `${TIEN_TO}${Date.now().toString(36)}x${++dem}`. `trichSo` bắt cả «26»
  (giờ) và «43» (bộ đếm).
- Đổi `khoa` của chính bài sang chuỗi không chữ số: vẫn đỏ — nguồn lọt là tên trong bộ gieo, không phải bài.

## Cách sửa

1. **Khối tasks: giữ thống kê đứng yên, và gọi tên khi nó vẫn trôi.**
   - Đầu khối (`beforeAll`): đọc `pg_class.reloptions` của `agentTask`, lưu lại, rồi
     `ALTER TABLE "agentTask" SET (autovacuum_enabled = false)`; cuối khối (`afterAll`): đặt lại ĐÚNG giá trị đã lưu
     (`RESET` chỉ khi trước khối không có khoá đó). Autovacuum thôi analyze bảng trong lúc khối chạy.
   - Sau `probe` của hai ca đối chứng: số hàng khác `rows` → không để `toHaveLength` nói «3 thành 2» mà ném
     «ke hoach doi» kèm `EXPLAIN` của câu, `reltuples`, `relpages`, số trang hiện tại
     (`pg_relation_size / current_setting('block_size')`), `n_dead_tup`, `last_analyze`, `last_autoanalyze` — đọc
     SAU probe, nên một analyze rơi vào bất kỳ khe nào trước đó cũng hiện ra. Đúng `rows` thì phép kiểm như hôm nay.
   - Ca thật (`retireExhausted`, `claimDue`) dùng CTE `MATERIALIZED`, không phụ thuộc kế hoạch — không đổi.
2. **`ma()` không sinh chữ số.** Mã hoá phần giờ và bộ đếm bằng cơ số 26 trên chữ `a`–`z`; giữ `TIEN_TO` (bộ dọn
   lọc theo tiền tố). 17 chỗ dùng trong 6 tệp chỉ cần chuỗi duy nhất. Cần duyệt chạm tệp (P5-49).
3. **(Đề xuất, chờ Cổng 1 — phản biện P0) Gói gỡ mọi id trước khi trích số.** `idCuaGoi`
   (`apps/agent-okr/agent/lib/goi-soan.ts`) chỉ gỡ id của `lop2a.capTren` (mục tiêu, KR) và `lop2a.ungVienCanChinh`;
   JSON của lớp 1 và phần còn lại của lớp 2a vẫn mang id cuid (đo 08/10: `"id": "cmv03sn26000797ty277z9acc"`), và
   `trichSo` bắt dãy số trong đó. Phần ngẫu nhiên của cuid có thể chứa «26» đứng riêng — `goiKiemTu` còn chập chờn
   sau khi `ma()` đã sạch, và ở production phép soát «số mới» có thể nhận một số model bịa trùng dãy số trong id.
   Sửa: gỡ MỌI giá trị của khoá `id` (và khoá kết thúc bằng `Id`) xuất hiện trong JSON các lớp trước khi trích số.
   Đây là mã sản phẩm — kéo vào hay để hàng riêng là quyết định của Cổng 1.

## Đã cân và bỏ

- Ghim phương pháp nối bằng `SET LOCAL` — đo không đổi thứ tự nối.
- Nới đối chứng (chấp nhận 2 hoặc 3 hàng) — xoá đúng thứ khối này chứng: câu xấu thật sự trao mọi hàng.
- Chọn số dò động cho `goiKiemTu` (như `soVangKhoiGoi`) — số cập nhật tuần do bộ gieo đặt cố định, và gốc lỗi là
  tên thử mang chữ số, lọt vào mọi phép so số trong gói, không riêng 26.
- Kiểm hình dạng kế hoạch bằng `EXPLAIN` TRƯỚC probe — khe giữa EXPLAIN và probe vẫn để lọt một analyze, và
  `Materialize` trên subquery phía trong làm phép kiểm chuỗi hằng-đúng (phản biện P1); đọc sau probe thì không có khe.

## Rủi ro đã biết

- `ALTER TABLE` trên kho thử: bài bị giết giữa chừng thì `crm_test` dùng chung giữ autovacuum tắt cho bảng đó —
  vô hại với test, `bun run db:test --reset` trả lại.
- Một `ANALYZE` thủ công từ bài khác chạy song song vẫn đảo được kế hoạch; bộ chạy `--concurrency=1` và các tệp
  một gói chạy tuần tự, nên chỉ còn autovacuum — và nếu xảy ra, lỗi nay gọi đúng tên.

## Đặc tả UX

Không chạm màn — xem sổ quyết định.
