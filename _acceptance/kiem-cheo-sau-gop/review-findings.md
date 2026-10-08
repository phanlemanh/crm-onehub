# Review findings: kiem-cheo-sau-gop (round 5)

## Trong hợp đồng

- **The night run decodes the lane's stdout chunk by chunk, so a non-ASCII eval command can be corrupted before the bisect re-runs it**
  file: `scripts/kiem-cheo/dem.mjs:71`
  severity: low
  AC: AC-6
  source: bugs
  detail: In taoChay, `dau += b` (and `ra += b`) turns each stdout Buffer chunk into a string on its own. When a chunk boundary falls inside a multi-byte UTF-8 character, that character becomes U+FFFD. JSON.parse does not fail on this. docKetLan then returns a `lech[].cmd` string that differs from the command the lane actually ran, and luotTho runs that altered string unchanged at D, T and each merge during the bisect. A real command with non-ASCII text exists in the config: r1c_hoi_y_dom has `-t 'thanh công bố'`. The corrupted filter matches no tests, so the eval fails at every sha. The run then files do-san, or blames a do-moi on the first merge where the hồ sơ appears, with no error. The fault only shows when the lane's JSON is larger than one pipe read (several slugs in the tap), but the cause is certain. The kit's own chay-lenh.mjs collects the Buffers and runs Buffer.concat(...).toString('utf8') once at the end; `con.stdout.setEncoding('utf8')` also fixes it.
  rationale: AC-6 requires re-running exactly the same command at D, T and each merge; a command corrupted by chunked decoding is no longer the command the lane ran, so the classification can be wrong.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The lane's `cham_ho_so_da_thong` result is never read: it is dropped, or reported under the wrong reason**
  Người dùng thấy gì: If a check run wrongly writes into a dossier that was already signed off, the night report may say it could not read the result, or may even say all is green. The real cause is not named, so the person reading it may chase the wrong thing or miss a failure.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **E5 runs rang/lan-gia.mjs, whose JSON output changed this round, but E5's `paths` do not list it**
  Người dùng thấy gì: If the stand-in lane used by one check is changed later, that check may keep showing an old pass instead of being re-run. A breakage could then go unnoticed until someone re-runs it by hand.
  file: `_acceptance/kiem-cheo-sau-gop/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Shape 2: hand-written fixture shaped like the reader. The launchd check runs a stub kiem-cheo:chay, not the real script (r3)**
  Người dùng thấy gì: Bài kiểm tra việc cài lịch chạy hằng đêm chỉ thử với một lệnh giả, chưa thử lệnh thật của kho. Nếu lệnh thật hỏng khi máy khởi động theo lịch, bài kiểm tra vẫn xanh và lượt đêm có thể không chạy.
  file: `scripts/kiem-cheo/test/cai.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4: negative-only assertions. "khong khoa, khong cay" are checked after the process has exited, and the code always cleans both up (r3)**
  Người dùng thấy gì: Bài kiểm tra rằng lượt không có gì để đo thì không xin khoá và không dựng cây chỉ nhìn sau khi mọi thứ đã dọn xong, nên nếu sau này lượt đó lỡ xin khoá thì bài kiểm tra vẫn không báo đỏ.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5: the moc error matrix (vang / hong / off first-parent) is checked end to end for only one case (r3)**
  Người dùng thấy gì: Khi mốc kiểm lần trước bị mất, bị hỏng hoặc không còn hợp lệ, chỉ trường hợp mất được thử trọn vẹn; hai trường hợp còn lại chưa được thử đầu-cuối nên khó chắc chắn người dùng nhận đúng thông báo.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 1: checks for a string in config/source instead of dem.mjs actually resolving the lane (r3)**
  Người dùng thấy gì: Phép kiểm xác nhận kiểm chéo dùng đúng bộ chạy chung chỉ tìm một từ khoá trong tệp, nên về sau có người đổi lối gọi mà giữ từ khoá thì phép kiểm vẫn xanh. Hiện chưa có dấu hiệu gọi sai.
  file: `_acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Đơn xin khoá dựng tay, không qua kiemDon của module sở hữu hình dạng; đơn hỏng bị nuốt thành 'khoá bận' sau 6 giờ (r2)**
  Người dùng thấy gì: Nếu đơn xin lượt của lần kiểm đêm bị bộ phát lịch từ chối, lần kiểm đó chờ 6 giờ rồi chỉ ghi 'khoá bận' và không ai được báo. Người dùng sẽ thấy đêm đó không kiểm mà không biết lý do thật là đơn hỏng.
  file: `scripts/kiem-cheo/khoa.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture): the new bao test '(h) dau vao thieu khoa' still hand-writes the input instead of reading the file the real dem.mjs writes (r2)**
  Người dùng thấy gì: Bài thử xác nhận báo cáo hằng ngày luôn đủ trường đang dùng dữ liệu tự dựng chứ không dùng tệp thật do lần kiểm đêm ghi ra. Nếu sau này tệp thật thiếu trường, bài thử sẽ không bắt được.
  file: `scripts/kiem-cheo/test/bao.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture / measured at the wrong moment): kiemDon is called after layKhoa returns, not when the scheduler reads the request (r2)**
  Người dùng thấy gì: Bài thử chưa chứng minh đơn xin lượt hợp lệ ngay tại lúc bộ phát lịch đọc nó. Nếu thứ tự thao tác đổi, đơn có thể bị từ chối mà bài thử vẫn xanh.
  file: `scripts/kiem-cheo/test/khoa.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture): the env -i test runs a stub kiem-cheo:chay script, never the real dem.mjs with --tu on the fake repo (r1)**
  Người dùng thấy gì: Bài kiểm xác nhận lịch chạy 1 giờ sáng hoạt động trong môi trường trống lại chạy một lệnh giả, không phải lệnh thật. Nên nếu lệnh thật không chạy được từ lịch tự động thì bài kiểm vẫn báo đạt.
  file: `scripts/kiem-cheo/test/cai.test.mjs`
  severity: high
  Đề xuất: new-contract

- **Shape 3 (presence instead of a relation): canMoc at 21 hours compares against ngay(M1), but M1, M2 and M3 all have the same date (r1)**
  Người dùng thấy gì: Bài kiểm chọn ngày ưu tiên cho lượt đêm dùng ba lần gộp cùng ngày, nên nó vẫn đạt dù hệ thống chọn nhầm lần gộp mới nhất thay vì cũ nhất. Lỗi chọn sai ngày có thể lọt qua mà không ai thấy.
  file: `scripts/kiem-cheo/test/moc.test.mjs`
  severity: high
  Đề xuất: new-contract

- **Shape 1 (checks the instruction, not the output): ranh-gioi (b) greps for the identifier 'giaiBang' in doc-lan.mjs and the path string in cau-hinh.mjs, and never reads dem.mjs (r1)**
  Người dùng thấy gì: Phép kiểm xác nhận lượt đêm gọi làn kiểm qua đường chính thức chỉ tìm một từ khoá trong mã. Nếu sau này ai đó chuyển sang đường tắt khác mà vẫn để lại từ khoá thì phép kiểm vẫn báo đạt.
  file: `_acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
