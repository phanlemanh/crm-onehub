Review Findings: do-man-tren-kho-rieng (round 2)

## Trong hợp đồng

- **Hình dạng 2 (fixture viết tay, không round-trip qua writer): ca kho-mau tiêm dấu `${fingerprint}x` thay vì đổi nguồn thật nên không đo sourceFingerprint()**
  file: `packages/db/test/measure-database.spec.ts:277`
  severity: medium
  source: measurement
  AC: AC-3
  detail: AC-3 định nghĩa dấu của kho mẫu là tên migration + schema.prisma + seed.ts, và đường CLI (`--tao`) lấy dấu từ sourceFingerprint() (packages/db/scripts/measure-db.ts:85-99). Ca "kho-mau" chỉ chứng hai điều: cùng một chuỗi dấu thì không dựng lại, và một chuỗi viết tay `fingerprint: `${fingerprint}x`` (dòng 280) thì dựng lại. Chuỗi khác không bao giờ được sinh ra bằng hàm tạo dấu thật từ một nguồn đã đổi. Không ca nào khẳng định sourceFingerprint() đổi khi một migration, schema.prisma hay seed.ts đổi. Nếu hàm bỏ không băm seed.ts hay schema.prisma, E3 vẫn xanh trong khi `--tao` tiếp tục dùng kho mẫu cũ sau khi seed đổi, tức vế "Given dấu không khớp, Then kho mẫu được dựng lại" của AC-3 hỏng ở đúng đường người dùng. Chính evals.yaml E3 cũng ghi "tham so fingerprint tiem vao ham".
  rationale: Finding chỉ đích danh AC-3 và cho thấy vế 'Given dấu không khớp, Then kho mẫu được dựng lại' của AC-3 không có ca nào chứng minh bằng một thay đổi nguồn thật đi qua đúng hàm tính dấu.

- **Hình dạng 4 (khẳng định âm không có đối chứng dương): ca 4 của E7 soi phiên kế bằng danh sách pgid của phiên đã bị SIGKILL**
  file: `_acceptance/do-man-tren-kho-rieng/rang/phien.mjs:259`
  severity: low
  source: measurement
  AC: AC-7
  detail: `await sauPhien(j2, measureDatabaseName(cay), nhom, "ca 4")` truyền `nhom`, tức nhóm máy chủ của phiên đã bị giết (lấy ở dòng 225-226). Hai khẳng định trước đó (dòng 247-252) đã chứng những nhóm này chết rồi. Vì vậy câu "khong con tien trinh may chu nao cua phien" cho phiên kế luôn đúng và không nói gì về máy chủ của chính phiên kế: phiên.json của phiên kế không bao giờ được đọc, không có đối chứng dương rằng nó từng có hai nhóm. Câu cổng trống cũng rỗng nghĩa khi `j2` là null: congCua(undefined) trả -1, lsof không in gì nên khẳng định qua. evals.yaml E7 hứa mỗi ca có 4 khẳng định, trong đó "khong con pid may chu nao ghi trong phien.json". Với ca 4 đây là phiên.json sai.
  rationale: Finding chỉ đích danh AC-7 và cho thấy khẳng định 'các tiến trình máy chủ của phiên bị giết không còn trước khi phiên kế chạy lệnh' của AC-7 luôn đúng một cách vô nghĩa vì không đối chứng với chính phiên kế.

- **Hình dạng 3 (chỉ kiểm chuỗi có mặt, trong khi lời hứa là quan hệ giữa các giá trị): tai-lieu.mjs chỉ tìm token "maxAgeMs" và "PHIEN_DO", không so giá trị trong tài liệu với hằng số trong code**
  file: `_acceptance/do-man-tren-kho-rieng/rang/tai-lieu.mjs:21`
  severity: low
  source: measurement
  AC: AC-12
  detail: docs/setup.md nhắc lại các giá trị cụ thể của code: "(twelve hours)" cho MEASURE_DATABASE.maxAgeMs và "4100–4899" cho PHIEN_DO.cong. MOC_SETUP chỉ đòi chuỗi "maxAgeMs" và "template" có mặt, nên maxAgeMs đổi sang 6 giờ hay dải cổng đổi thì E12 vẫn xanh dù tài liệu đã sai. Khẳng định .env.example `/^#.*PHIEN_DO\b/m` (dòng 59) khớp ngay dòng giữ chỗ `# PHIEN_DO=""`, nên câu mà AC-12 hứa ("biến phiên đo tự đặt, không đặt tay") có bị xoá thì khẳng định vẫn qua, và không có đối chứng cho nó. MOC_CLAUDE chỉ kiểm cụm "kho chung" có mặt, không kiểm được ý "không ghi kho chung" mà AC-12 hứa.
  rationale: Finding chỉ đích danh nội dung AC-12 (mô tả docs/setup.md, .env.example) và cho thấy phép kiểm chỉ tìm chuỗi có mặt chứ không xác nhận đúng nội dung AC-12 hứa.

- **Hình dạng 5 (tuyên bố cho cả lớp, nhưng thuộc tính chỉ đo ở từng ca lẻ): ma trận 34 tên của AC-1 không kiểm ≤ 63 ký tự và đuôi _do / __mau_do**
  file: `packages/db/test/measure-database.spec.ts:176`
  severity: low
  source: measurement
  AC: AC-1
  detail: AC-1 hứa MỌI tên kho đều ≤ 63 ký tự và kết thúc bằng `_do` (kho mẫu `__mau_do`). Vòng lặp trên 34 tên (dòng 176-185) chỉ kiểm tên không trùng, khớp regex `[a-z0-9_]`, không phải crm/crm_test và không kết thúc `_test`. Độ dài và đuôi chỉ được kiểm cho một tên dài, `long` (dòng 131-138). Hai tên dài khác trong ma trận là `cay-…y` và `Cay-…`, trong đó `Cay-…` là nhánh không-sạch: băm trước rồi mới cắt. Hai tên này chỉ được kiểm là không trùng, không bao giờ kiểm độ dài hay đuôi. Vậy số khẳng định cho hai thuộc tính này không bằng số phần tử của lớp (mẫu P105).
  rationale: Finding chỉ đích danh AC-1 và cho thấy thuộc tính 'mọi tên ≤ 63 ký tự, kết thúc _do' mà AC-1 hứa cho MỌI tên chỉ được kiểm ở một phần tử của ma trận, không phải toàn lớp.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **--tao drops an existing measure database or template without checking the measure-session mark**
  Người dùng thấy gì: Lệnh dựng phiên đo có thể vô tình xoá mất một cơ sở dữ liệu đã có sẵn trùng tên, kể cả khi cơ sở dữ liệu đó không phải do công cụ đo tạo ra.
  file: `packages/db/scripts/measure-db.ts`
  severity: medium
  Đề xuất: new-contract

- **docs/setup.md still says nothing else may drop a database, right above a new section that does**
  Người dùng thấy gì: Tài liệu hướng dẫn vẫn khẳng định chỉ một luồng được phép xoá cơ sở dữ liệu, dù ngay sau đó tài liệu lại mô tả thêm những luồng khác cũng làm việc đó — dễ khiến người đọc hiểu nhầm mức độ an toàn.
  file: `docs/setup.md`
  severity: low
  Đề xuất: known-limits

- **The same constant and helper are defined twice across scripts/lan-do instead of living in cau-hinh.mjs**
  Người dùng thấy gì: Một hằng số và một đoạn xử lý được viết lặp lại ở hai nơi thay vì dùng chung một chỗ, có thể khiến hành vi lệch nhau nếu sau này chỉ một nơi được cập nhật.
  file: `scripts/lan-do/phien-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Inline unit conversions and hash-length magic numbers in measure-db.ts**
  Người dùng thấy gì: Một số con số cấu hình được viết thẳng ở nhiều chỗ thay vì lấy từ một nguồn chung, khiến sau này sửa một giá trị dễ bị sót nơi khác.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **phien.json is JSON.parse'd without a schema, then used to SIGTERM/SIGKILL process groups**
  Người dùng thấy gì: Dữ liệu trạng thái phiên đo được đọc và tin tưởng ngay để quyết định dừng tiến trình, mà không kiểm tra hình dạng dữ liệu trước — trong một số tình huống hiếm, việc dọn dẹp có thể dừng nhầm một tiến trình không thuộc phiên đo.
  file: `scripts/lan-do/phien-do.mjs`
  severity: low
  Đề xuất: new-contract

- **The new CLAUDE.md paragraph uses 'kho' for database although the same file uses 'kho' for repository, and coins terms that are not in CONTEXT.md**
  Người dùng thấy gì: Một từ trong tài liệu cấu hình vừa mang nghĩa kho mã nguồn vừa mang nghĩa cơ sở dữ liệu ở cùng một chỗ, và một vài cụm từ mới chưa có trong từ điển thuật ngữ chung — dễ gây hiểu nhầm khi đọc lại sau này.
  file: `CLAUDE.md`
  severity: low
  Đề xuất: known-limits

- **Ctrl-C or SIGTERM is ignored while a session waits for the lock, for up to 60 minutes**
  Người dùng thấy gì: Trong lúc một phiên đo đang xếp hàng chờ đến lượt vì có phiên khác chạy trước, nhấn tổ hợp dừng có thể không có tác dụng, khiến người dùng phải chờ tới khi phiên trước xong hoặc tối đa một giờ mới thoát được.
  file: `scripts/lan-do/phien-do.mjs`
  severity: medium
  Đề xuất: new-contract

- **The template fingerprint misses migration.sql contents and the modules seed.ts imports, so a template can stay stale with no warning**
  Người dùng thấy gì: Khi có thay đổi nhỏ bên trong một tệp thiết lập dữ liệu đã tồn tại mà không đổi tên hay thêm tệp mới, công cụ đo có thể không nhận ra và tiếp tục dùng dữ liệu mẫu cũ, khiến phép đo chạy trên nền dữ liệu đã lỗi thời mà không có cảnh báo.
  file: `packages/db/scripts/measure-db.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).