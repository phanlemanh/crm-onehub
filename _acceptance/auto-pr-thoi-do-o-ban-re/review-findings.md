## Trong hợp đồng

### Danh sách cho phép của chân `mot-tep` không có PRODUCT-MAP.md — hai cổng loại trừ nhau
- file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs:13`
- severity: high
- source: conventions
- AC: AC-4
- detail: `CHO_PHEP` ghim đúng 5 đường: auto-pr.yml, _acceptance/config.yaml, _acceptance/<slug>/, design doc và plan. PRODUCT-MAP.md không nằm trong đó, và chân `mot-tep` (AC-4/E4) đỏ khi có bất kỳ tệp nào ngoài danh sách. Nhưng cổng CI của kho (product-map --check) đòi đúng tệp đó phải có trong diff. Hai điều kiện không cùng đúng được: thêm PRODUCT-MAP.md thì E4 đỏ, không thêm thì workflow Acceptance đỏ. Sửa allowlist là một dòng, nhưng phải sửa trước khi chấm S4, nếu không bằng chứng E4 sẽ mô tả một cây không bao giờ merge được.

### Nhánh dự phòng khi máy không có remote `upstream` là mã chết — chân trả «không đo được» thay vì xanh
- file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs:121`
- severity: high
- source: conventions
- AC: AC-3
- detail: `chanLechMotDong` bọc `dongThem("upstream/HEAD")` trong try/catch để, khi không giải được ref, ghi chú «chỉ đo trên origin/release» rồi vẫn trả xanh. Nhưng `dongThem` bắt lỗi của chính nó và gọi `do1(2, …)`, tức `process.exit(2)` — `process.exit` kết thúc tiến trình, không ném lỗi, nên `catch` ở dòng 126 không bao giờ chạy. Đã kiểm chứng bằng snippet Node: nhánh fallback không được thực thi, tiến trình thoát mã 2. Hệ quả: trên bất kỳ clone nào không có remote `upstream` — trong đó có `actions/checkout` của GitHub Actions, đúng ví dụ mà contract nêu tên — chân trả «KHONG DO DUOC: khong giai duoc ref upstream/HEAD», ngược hẳn với lời hứa viết trong contract mục Notes và trong AC-3. Ở kho hiện tại `upstream/HEAD` giải được nên chân xanh — bằng chứng đã thu được không phát hiện lỗ này.

### Fallback khi thiếu remote `upstream` là code chết — chặn trả mã 2 thay vì xanh
- file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs:126`
- severity: high
- source: bugs
- AC: AC-3
- detail: `dongThem()` tự gọi `do1(2, ...)` → `process.exit(2)` khi ref không giải được (dòng 97-99). `process.exit` không ném lỗi, nên `catch` bọc `dongThem("upstream/HEAD")` ở dòng 126-128 KHÔNG BAO GIỜ chạy. Nhánh giảm cấp `veHang = " (upstream/HEAD khong giai duoc o day — chi do tren ...)"` là code chết. Hệ quả: trên bất kỳ bản clone nào không có remote `upstream` (runner CI, máy dev khác, worktree mới), chặn `lech-mot-dong` thoát mã 2 = KHÔNG ĐO ĐƯỢC, mất trắng độ phủ AC-3 — trong khi evals.yaml E3 hứa đúng ngược lại. Đã kiểm chứng: chép script, thay `upstream/HEAD` bằng ref không tồn tại, chạy → in `KHONG DO DUOC: khong giai duoc ref ...`, EXIT=2 (thay vì EXIT=0 kèm ghi chú). Sửa: cho `dongThem` nhận cờ `mem` (hoặc trả `null`) để bên gọi tự quyết, thay vì exit ngay bên trong.

### Chặn `mot-tep` mù với tệp chưa commit — tệp lạc lọt qua cổng
- file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs:138`
- severity: medium
- source: bugs
- AC: AC-4
- detail: `chanMotTep` đo `git diff --name-only ${nen}...HEAD` — ba chấm, chỉ nhìn commit. Trong khi `chanLechMotDong` (dòng 96) đo `git diff -U0 nen -- <tep>`, hai chấm, tức là ĐO CÂY LÀM VIỆC. Hai chặn cùng hồ sơ đo hai đối tượng khác nhau, và E3 chiều đỏ 2 dựa hẳn vào việc đo cây làm việc. Hệ quả: tệp đã sửa nhưng chưa commit, và tệp untracked, hoàn toàn vô hình với AC-4 — đúng thứ AC-4 hứa chặn. Đã kiểm chứng trên worktree: tạo `packages/db/STRAY-PROBE.txt` (untracked) và sửa `.env.example` (modified), chạy `mot-tep` → «XANH ... 9 tep ... tat ca nam trong danh sach cho phep», EXIT=0. Cây đã khôi phục sau khi đo. Sửa: cộng `git status --porcelain` (hoặc `git diff --name-only` + `--others --exclude-standard`) vào tập tệp trước khi lọc danh sách cho phép.

### Hình dạng 5 — tuyên ma trận toàn phần trục B nhưng chỉ có ĐÚNG MỘT lượt chạy được đăng ký
- file: `_acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml:32`
- severity: high
- source: measurement
- AC: AC-2
- detail: E2 (evals.yaml:29-32) khai «MA TRAN TOAN PHAN truc B — BON hinh dang khoa, BON luot chay, khong luot nao suy ra tu luot khac» cộng một lượt remote, tức 5 phần tử. Nhưng E2 chỉ có MỘT `cmd: config:executors.script.apr_khoa`, và `_acceptance/config.yaml:212` định nghĩa key đó là `node .../khoa-auto-pr.mjs khoa` — chạy trần, không cờ. Bốn lượt đỏ mà `expected` mô tả đều cần cờ; không cờ nào có key trong `config.yaml` (grep `apr_` chỉ ra 4 key, toàn chiều xanh), và các bản sao workflow đó KHÔNG được commit (diff chỉ có 9 tệp, không có fixture, không có evidence log). Cùng bệnh ở E1 (2 lượt khai / 1 đăng ký), E3 (3/1), E4 (3/1). Hệ quả: `recheck: strict` chỉ phát lại chân xanh; số assert chạy được = 1 trong khi Coverage của contract khai «bốn giá trị, bốn lượt». Đây đúng là lỗ P0 mà gap-probe.md đã bắt, và bản «fixed» chỉ sửa văn xuôi `expected` chứ không sinh thêm lượt đo tái lập được.

### Nhánh đo không bao giờ chạy được — fallback `upstream/HEAD` của E3 là mã chết, máy thiếu remote sẽ trả mã 2 chứ không phải xanh
- file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs:126`
- severity: medium
- source: measurement
- AC: AC-3
- detail: Contract AC-3 hứa «Máy nào không có remote `upstream` thì chân nói rõ nó chỉ đo trên nền `origin/release`, chứ không im lặng bỏ qua», và Notes nói thẳng «Trong CI của GitHub Actions remote đó không tồn tại». Mã không làm được điều đó: `chanLechMotDong` gọi `dongThem("upstream/HEAD")` trong try (dòng 121), nhưng `dongThem` tự bắt lỗi git ở dòng 97-98 và gọi `do1(2, ...)` → `process.exit(2)`. `process.exit` kết thúc tiến trình nên `catch` ở dòng 126-127 không bao giờ chạy. Đã kiểm chứng bằng repro tối giản: `function f(){try{throw new Error()}catch{process.exit(2)}}; try{f()}catch{...}` thoát mã 2, dòng sau không tới. Hệ quả: trên máy/CI không có remote `upstream`, E3 trả mã 2 «KHONG DO DUOC: khong giai duoc ref `upstream/HEAD`» và chặn cổng, thay vì xanh-có-ghi-chú như contract khai. Ở worktree hiện tại remote `upstream` có mặt nên lượt chạy thử xanh — lỗi bị che.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **PRODUCT-MAP.md không được vẽ lại — CI `Acceptance` đỏ ngay ở bước đầu**
  Người dùng thấy gì: Mở pull request với bản vá này có thể bị chặn ngay từ bước kiểm tra đầu tiên vì bản đồ sản phẩm chưa được vẽ lại khớp với thay đổi.
  file: `PRODUCT-MAP.md`
  severity: high
  Đề xuất: known-limits

- **`chan-chay-that` không kiểm giá trị rút từ URL remote trước khi ghép vào đường gọi `gh api`**
  Người dùng thấy gì: Nếu remote của kho không phải địa chỉ GitHub thông thường, thông báo lỗi hiện ra sẽ đổ oan cho việc đăng nhập hoặc đẩy commit, khiến người đọc đi sửa sai chỗ.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bảng «Đo thế nào» trong design doc mô tả chân `mot-tep` đã lỗi thời so với bản cài đặt**
  Người dùng thấy gì: Tài liệu thiết kế còn mô tả sai phạm vi kiểm tra hiện tại, có thể khiến người đọc sau này tin nhầm một thay đổi ở nơi khác vẫn được bỏ qua an toàn.
  file: `docs/superpowers/specs/2026-09-07-auto-pr-thoi-do-o-ban-re-design.md`
  severity: low
  Đề xuất: known-limits

- **Lỗi git ngoài try thoát mã 1 — sự cố môi trường bị đọc thành DO (gate fail)**
  Người dùng thấy gì: Một sự cố môi trường bình thường, như thiếu remote, có thể bị báo cáo nhầm thành lỗi của bản vá, khiến người xem cổng hiểu sai nguyên nhân bị chặn.
  file: `_acceptance/auto-pr-thoi-do-o-ban-re/rang/khoa-auto-pr.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/10 lỗi rơi vào file không bộ đo nào phủ (PRODUCT-MAP.md, docs/superpowers/specs/2026-09-07-auto-pr-thoi-do-o-ban-re-design.md, _acceptance/auto-pr-thoi-do-o-ban-re/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
