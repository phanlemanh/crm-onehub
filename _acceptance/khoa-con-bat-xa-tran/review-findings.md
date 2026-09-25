## Trong hợp đồng

- **The pool guard in the spec compares two hard-coded numbers, so it can never fail**
  file: `apps/api/test/go-la-cat-quyen.spec.ts:38`
  severity: low
  AC: AC-5
  `POOL_PG = 10` is a literal. It is not read from the real pool: packages/db/src/client.ts builds `new PrismaPg({ connectionString })` with the pg default and no `max` setting. The theo-lo test then checks `expect(LO_SONG_SONG, "LO_SONG_SONG lan vao pool pg").toBeLessThanOrEqual(POOL_PG - 2)`, which is literal 8 against literal 10 minus a magic 2, so it always passes. It does not protect the promise in AC-5 ("8, under the 10-connection pool"): if the pool is set smaller in packages/db (a `max` option, or `connection_limit` in the URL), this check stays green while 8 parallel calls use up the pool. This goes against the repo rules (AGENTS.md: 'No magic numbers inline', derive tunable values from one source). Fix: read the pool size from where it is actually set (or from the connection URL), or remove this check and name the pool limit as a stated assumption. Do not keep a check that only compares two constants in the same file.
  rationale: AC-5's Then clause literally embeds the relation 'LO_SONG_SONG (8, dưới pool 10 kết nối)'; the assertion cited compares two hard-coded constants instead of the real pool size, so that exact promised relation is never actually measured.

- **The 'LO_SONG_SONG lan vao pool pg' check compares two literals and never reads the real pool size**
  file: `apps/api/test/go-la-cat-quyen.spec.ts:412`
  severity: low
  AC: AC-5
  `expect(LO_SONG_SONG).toBeLessThanOrEqual(POOL_PG - 2)` uses POOL_PG = 10, which is hard-coded in the spec. The real pool is created in packages/db/src/client.ts (`new PrismaPg({ connectionString })`, pg default max) and is never read. The check is always true at runtime: if the pool size changes (adapter `max`, a different default), it does not fail, even though its message says it guards pool exhaustion. AC-5 wording ('8, duoi pool 10 ket noi') is therefore not measured against the actual pool.
  rationale: Same as t1: the finding explicitly quotes AC-5's wording ('8, dưới pool 10 kết nối') and shows the check never reads the actual pool configuration, so that promised relation is unverified.

- **Hình dạng 2/3: quan hệ 'LO_SONG_SONG dưới pool pg' đo bằng một hằng viết tay, không đọc cỡ pool thật**
  file: `apps/api/test/go-la-cat-quyen.spec.ts:413`
  severity: medium
  AC: AC-5
  AC-5 và E5-(1) hứa rằng LO_SONG_SONG (8) nằm dưới pool 10 kết nối. Khẳng định `expect(LO_SONG_SONG, "LO_SONG_SONG lan vao pool pg").toBeLessThanOrEqual(POOL_PG - 2)` lại so hai hằng khai cùng tệp: `const POOL_PG = 10` (dòng 38) là bản chép tay giá trị mặc định của pg Pool. Pool thật được dựng ở packages/db/src/client.ts:96 bằng `new PrismaPg({ connectionString })`, và phép đo không đọc từ đó. Nếu cỡ pool thật đổi (ví dụ thêm connection_limit hay max vào connectionString, hoặc cấu hình adapter), khẳng định này vẫn xanh. Nó luôn đúng theo cách viết, không đo quan hệ giữa độ song song và pool thật.
  rationale: Finding trích thẳng chữ của AC-5 và E5-(1) ('LO_SONG_SONG (8) nằm dưới pool 10 kết nối') và chỉ ra khẳng định không đọc pool thật, nên đúng phần hứa đó của AC-5 chưa được đo.

- **Hình dạng 4: soát bunfig và workflow chỉ có chiều âm, không đối chứng dương; khối `run: |` nhiều dòng lọt qua**
  file: `_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs:58`
  severity: medium
  AC: AC-4
  Trong soiTran, nhánh workflow chỉ xét những dòng có cả `run:` lẫn `bun (run )?test` trên CÙNG một dòng (dòng 59). Một lệnh viết trong khối `run: |` (dòng `bun test --timeout 15000` nằm dưới `run: |`) bị bỏ qua mà không báo gì. Nếu không dòng nào khớp, `dat`/`loi` không nhận mục nào và kết quả vẫn xanh. Nhánh bunfig (dòng 39-44) coi tệp vắng là đạt, và chỉ bắt được `timeout =` ở đầu dòng. E4 chỉ tự kiểm hai chiều cho spec (`, 15_000`) và package.json (`--timeout 15000`). Không có lần tự kiểm nào chèn `--timeout` vào một workflow hay `timeout` vào bunfig để chứng minh ba nhánh này cắn được. Vì vậy các khẳng định «không có --timeout» ở ci.yml, acceptance.yml và «không có khoá timeout» ở bunfig là âm tính một mình, không có mẫu dương làm đối chứng.
  rationale: AC-4 hứa đọc chính các lệnh chạy test trong ci.yml và acceptance.yml để bảo đảm không lệnh nào mang cờ --timeout; finding chỉ ra bộ quét bỏ sót khối nhiều dòng của đúng hai tệp đó, nên lời hứa của AC-4 chưa được đo đủ cho các tệp đã nêu trong Given.

- **Hình dạng 5: AC-2 hứa cả lớp (hụt/thừa/trùng/đảo × tRPC/REST), E2 chỉ đo 3 điểm**
  file: `_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs:18`
  severity: low
  AC: AC-2
  AC-2 ghi: «hụt, thừa, trùng hay đảo hàng thì ca đỏ với thông điệp gọi tên ma trận lệch (tRPC hoặc REST)». Tức là 4 kiểu lệch × 2 ma trận = 8 ô. Nhóm `lech-hang` chỉ có ba đột biến: bo-lo-cuoi (tRPC hụt), dao-thu-tu (tRPC đảo), rest-bo-dau (REST hụt). Không đột biến nào tạo hàng thừa hay hàng trùng. Chiều đảo của REST cũng chưa từng được đo riêng: dao-thu-tu sửa theoLo mà hai ma trận dùng chung, nên ca đỏ ngay ở khẳng định tRPC. Khẳng định `rest.map((h) => h.ten) ... toEqual(duongRest().map(tenDuong))` với hàng bị đảo vì thế không bao giờ chạy tới. Số khẳng định (3) ít hơn số phần tử của lớp đã hứa (8).
  rationale: AC-2 hứa ca đỏ đúng thông điệp cho cả bốn kiểu lệch (hụt, thừa, trùng, đảo) trên cả hai ma trận; finding chỉ ra chỉ 3 trong 8 tổ hợp có đột biến kiểm chứng thật, còn lại chưa từng chạy tới.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **pha-thu.mjs checks the pinned message with ra.includes(), which also matches bun's source code frame, so a neighbouring assertion's failure passes as the intended one**
  Người dùng thấy gì: Công cụ tự kiểm chứng minh thông báo lỗi đúng tên có thể báo 'đạt' ngay cả khi phần bảo vệ liên quan đã ngừng bắt lỗi đúng chỗ, vì nó chỉ tìm xem chữ có xuất hiện đâu đó trong log, không phải đúng dòng báo lỗi. Người xem kết quả kiểm tra có thể tin nhầm rằng tính năng chặn truy cập trái phép vẫn đang được canh giữ, dù thực ra chưa chắc.
  file: `_acceptance/khoa-con-bat-xa-tran/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **giuKhoa: stale-lock cleanup is a TOCTOU race, so two runs can hold the lock together; reading pid in the catch block can crash with ENOENT**
  Người dùng thấy gì: Nếu một lượt chạy kiểm tra trước đó bị dừng đột ngột, hai lượt chạy kế tiếp có thể vô tình chạy song song với nhau thay vì lần lượt, hoặc bị treo với một lỗi khó hiểu, khiến người vận hành phải tự tay dọn dẹp trước khi chạy lại được.
  file: `_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: AC-4 nói «không nhờ trần cao lên» nhưng setDefaultTimeout chỉ được quét trong tệp spec, bỏ qua preload setup.ts**
  Người dùng thấy gì: Nếu ai đó nâng trần thời gian chờ ở tệp thiết lập dùng chung cho mọi bài kiểm, thay vì trong chính bài kiểm này, việc soát trần hiện tại sẽ không phát hiện ra. Tính năng khi đó có thể trông như đã chạy nhanh hơn thật, trong khi thực chất vẫn đang được che bằng một trần thời gian cao hơn ở nơi khác.
  file: `_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
