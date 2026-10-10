# Review findings: zalo-bom-gio (round 1)

## Trong hợp đồng

- **E2 không chạy chiều đỏ của AC-2: lệnh không gọi --tu-thu, và --tu-thu cũng không kiểm 'đúng hai bài'**
  AC: AC-2
  file:line: `_acceptance/zalo-bom-gio/evals.yaml:16`
  severity: medium
  detail: AC-2 hứa thêm rằng bản trước sửa (91fe8d69), chạy ở mốc 2020, đỏ đúng hai bài «vong tay» và «kenh-route». Lệnh của E2 (config h5_hai_moc, dòng 1490) chỉ chạy `bash hai-moc.sh` không cờ, tức chỉ chiều xanh. Chiều đỏ chỉ được ghi trong expected là «Da do o S3 (log trong decisions)», không có lệnh máy nào đo. Lệ của kho là chạy chiều đỏ trong chính lệnh: gmd_hoi_quy gọi `khong-xoa-expect.mjs --tu-thu` ngay trong cmd. Ngoài ra, ngay cả khi chạy, nhánh --tu-thu của hai-moc.sh chỉ in «phu thuoc gio that» và thoát 1 khi có BẤT KỲ bài nào đỏ hay đếm khác 32. Nó không đối chiếu tên hai bài, cũng không kiểm '30 pass 2 fail'. Ví dụ bản cũ lỗi import, đỏ cả tệp, vẫn được tính là chiều đỏ đạt. Hệ quả: nửa sau của AC-2 không có bằng chứng máy.
  source: conventions

- **E3 bỏ qua toàn bộ _acceptance/ nên không đo lời hứa AC-3 'config.yaml chỉ thêm khoá h5_*'**
  AC: AC-3
  file:line: `_acceptance/zalo-bom-gio/evals.yaml:30`
  severity: medium
  detail: AC-3 hứa rằng ngoài một tệp kiểm, diff chỉ gồm hồ sơ `_acceptance/zalo-bom-gio/`, các khoá mới `h5_*` trong `_acceptance/config.yaml` và tệp bản đồ do máy vẽ. Lệnh h5_chi_tep_kiem lại loại cả tiền tố `^_acceptance/` bằng `grep -v`, nên mọi sửa đổi trong config.yaml, như đổi giá trị một khoá executor của hồ sơ đã ký, hay sửa hồ sơ của slug khác dưới _acceptance/, đều cho E3 xanh. Đây chính là bẫy ghi trong memory «chung_chi_them chỉ thêm khoá». Nên thu hẹp phần loại trừ về `^_acceptance/zalo-bom-gio/`. Với config.yaml thì kiểm riêng rằng diff của nó chỉ có dòng `+` mang khoá `h5_`.
  source: conventions

- **E3 skips all of `_acceptance/`, so it passes changes that AC-3 forbids**
  AC: AC-3
  file:line: `_acceptance/config.yaml:1491`
  severity: medium
  detail: AC-3 allows only three things besides the one test file: the `_acceptance/zalo-bom-gio/` dossier, new `h5_*` keys in `_acceptance/config.yaml`, and the machine-drawn map files. The eval does `grep -v -e "^_acceptance/"`, which drops the whole tree. So E3 still exits 0 if this round edits an existing executor command in config.yaml (which can weaken another signed dossier's eval) or changes a file in another dossier. The eval looks narrower than it is and does not check the 'only new h5_* keys' part of AC-3. The `expected` text in evals.yaml says nothing about this.
  source: bugs

- **Hình dạng 4 (âm tính một mình, không đối chứng, không ghim thông điệp): chiều đỏ của E2 không chạy trong lệnh khai, và khi chạy tay thì không ghim đúng hai bài**
  AC: AC-2
  file:line: `_acceptance/zalo-bom-gio/rang/hai-moc.sh:24`
  severity: medium
  detail: (a) Lệnh khai `h5_hai_moc: 'bun run test -- "bash _acceptance/zalo-bom-gio/rang/hai-moc.sh"'` (config.yaml:1490) chỉ chạy chiều xanh. Chiều đỏ `--tu-thu` mà evals.yaml:27 gọi là «cung lenh» thì không có trong cmd, và cũng không khoá nào khác chạy nó. Các khoá khác trong kho chạy `rang/x --tu-thu && rang/x` trong cùng một lệnh (dva_hoi_quy, dsk_*, gmd_duong_tao, atk_app_dung_goi). Ở đây không ghép được như vậy: hai-moc.sh --tu-thu báo đỏ bằng `exit 1`, không đảo mã thoát. Vì vậy khi E2 chạy ở S4, nó chỉ thấy «32/32 ở cả hai mốc» mà không có đối chứng nào. Bước sed ở dòng 15 cũng không được kiểm: script không xác nhận $BAN có chứa mốc mới. Nếu thay thế không ăn, bản chạy chính là tệp gốc, vẫn ra 32/32 và in «DUNG». Chiều đỏ hiện chỉ có một dòng kể lại trong decisions.jsonl (d-…-4). (b) Ngay khi chạy `--tu-thu`, phán quyết đỏ ở dòng 24 là `[ "$ma" -eq 0 ] && [ "${fail:-1}" = "0" ] && [ "${pass:-0}" = "32" ] || sai=1`. Kết quả nào khác (ma 0, 32 pass, 0 fail) cũng ra cùng dòng «hai-moc: phu thuoc gio that», mã 1: CSDL không lên, lỗi biên dịch, bun test sập với pass/fail rỗng. Trong khi đó AC-2 hứa một quan hệ: bản trước sửa «đỏ đúng hai bài» «vong tay» và «kenh-route», tức 30 pass 2 fail. Script chỉ in các dòng (fail) ra, không so tên bài hỏng, cũng không so 30/2. Đây là một assert âm tính đứng một mình, không ghim thông điệp.
  source: measurement

- **Hình dạng 5 (tuyên quét cả lớp nhưng ma trận thiếu): E3 bỏ qua toàn bộ _acceptance/ trong khi AC-3 và expected hứa «bất kỳ tệp nào khác»**
  AC: AC-3
  file:line: `_acceptance/config.yaml:1491`
  severity: medium
  detail: Lời hứa của AC-3 phủ cả diff: ngoài tệp kiểm, chỉ được có hồ sơ `_acceptance/zalo-bom-gio/`, các khoá mới `h5_*` trong `_acceptance/config.yaml` và tệp bản đồ do máy vẽ. Expected của E3 ghi «Them bat ky tep nao khac -> in ten tep, ma 1». Nhưng lệnh `git diff --name-only 91fe8d69f HEAD | grep -v -e "^_acceptance/" ...` loại cả thư mục `_acceptance/`. Ba phần tử của lớp đã tuyên vì thế không có ô đo nào: (1) sửa hồ sơ của slug khác dưới `_acceptance/<slug-khác>/`; (2) sửa hay xoá một khoá không phải `h5_*` trong config.yaml, tức đổi lệnh đo của vòng khác; (3) tệp lạ đặt trong `_acceptance/` mà không thuộc zalo-bom-gio. Cả ba đều qua E3 với mã 0. Lệnh chỉ đo một điểm: danh sách tên tệp nằm ngoài `_acceptance/`. Không có ma trận viết trước cho các loại tệp mà AC-3 liệt kê, nên không thể gán mỗi loại một assert.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **h5_chi_tep_kiem đo diff hai chấm từ sha cố định 91fe8d69f thay vì merge-base, nên đỏ ngay khi nhánh gộp onehub**
  Người dùng thấy gì: Nếu nhánh này kéo thêm thay đổi mới của nhánh chính về trước khi ký, phép kiểm 'chỉ đổi một tệp kiểm' có thể báo đỏ oan vì tính cả thay đổi của người khác. Kết quả sai là báo lỗi thừa, không phải lọt lỗi thật.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **hai-moc.sh ghi bản spec tạm vào apps/agent/test, nên một lượt bun test chạy cùng lúc trong gói agent sẽ nhặt phải**
  Người dùng thấy gì: Khi phép đo hai mốc giờ chạy đúng lúc một lượt kiểm khác đang chạy trên cùng máy, lượt kia có thể đỏ oan hoặc chạy trùng một bài. Chỉ xảy ra khi hai việc chạy chồng nhau, chạy lại là hết.
  file: `_acceptance/zalo-bom-gio/rang/hai-moc.sh`
  severity: low
  Đề xuất: known-limits

- **E3 (h5_chi_tep_kiem) diffs against a fixed sha, so it goes red as soon as the branch takes newer onehub**
  Người dùng thấy gì: Sau khi nhánh kéo bản mới của nhánh chính về, phép kiểm phạm vi thay đổi có thể báo đỏ oan vì đếm cả thay đổi không phải của vòng này. Người duyệt cần biết đây là báo thừa chứ không phải lỗi thật.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 6/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/zalo-bom-gio/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
