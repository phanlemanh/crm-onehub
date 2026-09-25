Review Findings: do-man-tren-kho-rieng (round 1)

## Trong hợp đồng

- **A tree whose slug ends in _mau gets a measure DB name identical to another tree's template, and tien-de then loops**
  file: `packages/db/src/measure-database.ts:76`
  severity: low
  source: bugs
  AC: AC-1
  detail: measureDatabaseName('x-mau') is fit('x_mau', '_do') = 'crm_x_mau_do', exactly templateDatabaseName('x'). isTemplateDatabase() looks only at the suffix, so isMeasureDatabase('crm_x_mau_do') is false. Inside a phien-do session for tree 'x-mau', DATABASE_URL names crm_x_mau_do. The inner tien-de treats it as not throwaway and spawns phien-do again. That phien-do short-circuits, because PHIEN_DO equals the DB name, and runs the same tien-de command, which spawns phien-do again, forever. The two trees also share one database name, so a session for 'x-mau' drops or overwrites the template of tree 'x'. It triggers through a worktree or PHIEN_DO_TEN_CAY that ends in '-mau' or '_mau'. treeSlug should reject or escape a trailing _mau.
  rationale: AC-1 hứa hai cây tên khác nhau cho hai tên kho khác nhau, nhưng cây 'x-mau' và cây 'x' tạo ra cùng một tên kho (kho đo của cây này trùng kho mẫu của cây kia).

- **Hình dạng 5 — lớp «hai cây khác tên → hai kho khác tên» chỉ được đo bằng một cặp điểm, và lớp đó sai với chính các giá trị trong bảng**
  file: `packages/db/test/measure-database.spec.ts:157`
  severity: high
  source: measurement
  AC: AC-1
  detail: AC-1 và E1 hứa cho CẢ LỚP: «hai cây tên khác nhau cho hai tên kho khác nhau». Dòng 157-159 chỉ kiểm một cặp điểm, measureDatabaseName("cay-a") khác measureDatabaseName("cay-b"). Hai tên này khác nhau ở một chữ cái, nên phép đổi tên cây thành tên kho giữ nguyên chỗ khác. Cặp thứ hai ở dòng 132 cũng chỉ khác nhau ở một chữ. Không có ma trận viết trước nào ghép những tên chỉ khác nhau ở ký tự bị thay thành `_` hoặc ở chữ hoa/thường. Đã chạy thử trên mã thật: "a-b", "a.b", "A_B" và "a--b" đều cho crm_a_b_do; "Toan-Canh.OKR" và "toan_canh_okr" cùng cho crm_toan_canh_okr_do. Chính bảng ở dòng 97-105 có "a--b" → crm_a_b_do, trùng với tên của cây "a-b". Hệ quả: lời hứa của lớp là sai với mã hiện tại mà thước vẫn xanh. Hai cây như vậy sẽ dùng chung một kho đo và một khoá, đúng thứ mà AC-8 muốn tách riêng.
  rationale: AC-1 hứa hai cây tên khác nhau cho hai tên kho đo khác nhau cho toàn lớp, nhưng nhiều cặp tên thực tế (a-b/a.b/A_B/a--b, hay hai biến thể của cùng một tên) cho cùng một tên kho, đúng như chính bảng phá-thử ghi lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **docs/setup.md still says nothing else may drop a database, but this change adds several paths that do**
  Người dùng thấy gì: Tài liệu hướng dẫn vẫn ghi rằng không thao tác nào khác được phép xoá cơ sở dữ liệu, dù thay đổi này thêm nhiều chỗ mới có quyền xoá — người đọc sau có thể tin nhầm luật an toàn cũ.
  file: `docs/setup.md`
  severity: medium
  Đề xuất: known-limits

- **`db:do --tao` drops the measure and template databases without checking the COMMENT mark that `--xoa` requires**
  Người dùng thấy gì: Lệnh tạo phiên đo có thể âm thầm xoá một cơ sở dữ liệu đã có sẵn nếu trùng tên, mà không kiểm tra xem nó có phải do chính công cụ đo tạo ra hay không.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **Magic unit numbers and a duplicated local-host safety list in measure-db.ts**
  Người dùng thấy gì: Một số con số thời gian và danh sách máy chủ an toàn được viết lặp lại ở nhiều chỗ trong mã nguồn thay vì dùng chung một nơi, nên sau này sửa một chỗ dễ quên sửa chỗ còn lại.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **scripts/lan-do re-declares the exit-code map and the URL-to-database-name helper instead of using the area config and kho-nhap.mjs**
  Người dùng thấy gì: Một số hằng số cấu hình và một đoạn xử lý tên cơ sở dữ liệu bị viết lặp lại ở nhiều tệp thay vì dùng chung, tạo nguy cơ lệch nhau khi sửa sau này.
  file: `scripts/lan-do/phien-do.mjs`
  severity: low
  Đề xuất: known-limits

- **The file that records a killed session is read with an unchecked JSON.parse, and a parse failure silently forgets the servers it lists**
  Người dùng thấy gì: Nếu một phiên đo bị dừng đột ngột đúng lúc tệp ghi nhớ trạng thái đang được cập nhật, thông tin về các máy chủ cần dọn có thể bị mất, khiến chúng tiếp tục chạy ngầm và giữ cổng.
  file: `scripts/lan-do/phien-do.mjs`
  severity: low
  Đề xuất: known-limits

- **New CLAUDE.md paragraph uses «kho» for the database, a file where «kho» means the repository everywhere else**
  Người dùng thấy gì: Tài liệu cấu hình dùng cùng một từ để chỉ hai khái niệm khác nhau (kho mã nguồn và cơ sở dữ liệu), có thể gây hiểu nhầm khi đọc lại sau này.
  file: `CLAUDE.md`
  severity: low
  Đề xuất: known-limits

- **Cleanup deletes phien.json even when this run never held the lock or failed to kill orphans, so the record of live servers is lost**
  Người dùng thấy gì: Trong một số tình huống chờ hoặc dọn thất bại, phiên đo có thể xoá nhầm sổ theo dõi máy chủ của một phiên khác đang chạy hoặc của chính các máy chủ chưa dọn xong, khiến các máy chủ đó không bao giờ được dọn nữa.
  file: `scripts/lan-do/phien-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **SIGINT/SIGTERM/SIGHUP are swallowed while waiting for the tree lock, so the session hangs for up to 60 minutes**
  Người dùng thấy gì: Nếu người dùng bấm dừng (Ctrl-C) trong lúc phiên đo đang phải chờ đến lượt, phiên có thể bị treo tới một tiếng thay vì dừng ngay.
  file: `packages/db/scripts/measure-db.ts`
  severity: medium
  Đề xuất: known-limits

- **Lock connection errors are swallowed, so a dropped connection silently releases the per-tree lock**
  Người dùng thấy gì: Nếu kết nối cơ sở dữ liệu giữ chỗ bị rớt bất ngờ, hai phiên đo có thể vô tình cùng dùng chung một cơ sở dữ liệu đo cùng lúc mà không có cảnh báo nào.
  file: `packages/db/scripts/measure-db.ts`
  severity: low
  Đề xuất: known-limits

- **Missing dok_man_chrome line exits 1 (reads as a failed check) instead of 2 (could not measure)**
  Người dùng thấy gì: Khi tệp cấu hình đổi định dạng, công cụ kiểm tra có thể báo nhầm là dữ liệu dùng chung đã bị thay đổi thay vì báo đúng là không đo được, khiến người xem lo sai vấn đề.
  file: `_acceptance/do-man-tren-kho-rieng/rang/kho-chung-khong-doi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — E1 tuyên ma trận 6 tên × 2 hàm = 12 khẳng định toEqual, nhưng mã chỉ có 8 và ma trận không trọn**
  Người dùng thấy gì: Bộ kiểm tra tự động cho việc đặt tên cơ sở dữ liệu đo bỏ sót một số trường hợp tên đặc biệt (rất dài, hoặc chỉ gồm ký tự đặc biệt), nên lỗi đặt tên ở những trường hợp đó có thể lọt qua mà không ai biết.
  file: `packages/db/test/measure-database.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — ở ca 4 của E7, câu «không còn máy chủ của phiên» đo nhóm tiến trình đã chết của phiên bị giết, không phải máy chủ của phiên kế**
  Người dùng thấy gì: Một phép kiểm cho rằng phiên kế tiếp không còn máy chủ cũ thực ra đo nhầm máy chủ của phiên đã bị dừng trước đó, nên chưa chắc chắn máy chủ của phiên kế tiếp cũng được dọn đúng.
  file: `_acceptance/do-man-tren-kho-rieng/rang/phien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — ở ca 1-3 của E7, hai câu «cổng trống» và «không còn tiến trình» có thể xanh trên tập rỗng**
  Người dùng thấy gì: Một vài phép kiểm về việc đã dọn sạch cổng và máy chủ có thể báo đạt ngay cả khi thực ra chẳng có máy chủ hay cổng nào được tạo ra để kiểm, nên phép kiểm chưa chắc bắt được lỗi dọn dẹp thật.
  file: `_acceptance/do-man-tren-kho-rieng/rang/phien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — «dấu vân tay kho chung không đổi» chỉ được khẳng định theo chiều âm, không có đối chứng dương rằng dấu bắt được một lần ghi**
  Người dùng thấy gì: Phép kiểm an toàn quan trọng nhất — bảo đảm dữ liệu dùng chung không bị đổi — chưa từng được thử với một thay đổi thật, nên nếu công cụ so sánh có đọc sai hoặc bỏ sót dữ liệu, phép kiểm vẫn báo an toàn dù dữ liệu người dùng đã bị ảnh hưởng.
  file: `_acceptance/do-man-tren-kho-rieng/rang/kho-gia.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 — E3 tiêm một dấu viết tay `${fingerprint}x`, không cho sourceFingerprint đọc một nguồn đã đổi**
  Người dùng thấy gì: Phép kiểm phát hiện kho mẫu cũ đã lỗi thời dùng dữ liệu giả tự dựng thay vì thử đổi tệp nguồn thật, nên nếu việc phát hiện thật sự bị hỏng, phép kiểm này sẽ không phát hiện ra.
  file: `packages/db/test/measure-database.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 + 4 — bộ đếm của truoc-gop.mjs chỉ được đối chứng trên hai dòng mẫu viết tay; pre-merge thoát 1 mà không bóc được dòng nào vẫn xanh**
  Người dùng thấy gì: Phép kiểm không còn vi phạm của hồ sơ khác trước khi gộp dùng dữ liệu mẫu viết sẵn thay vì đầu ra thật của công cụ kiểm tra, nên nếu công cụ đó đổi định dạng thông báo lỗi, phép kiểm có thể báo đạt dù có vi phạm thật bị bỏ sót.
  file: `_acceptance/do-man-tren-kho-rieng/rang/truoc-gop.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).