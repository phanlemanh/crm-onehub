# Review findings: kiem-cheo-sau-gop (round 4)

## Trong hợp đồng

- **So expected_exit bằng phép bằng tuyệt đối: lệch luật của làn thật (AC-10, không phạt một cải thiện), nên báo đỏ giả**
  AC: AC-6
  file: `scripts/kiem-cheo/dem.mjs:334`
  severity: high
  source: conventions
  detail: Làn thật (feature-loop 2.24.0 scripts/repin-lane.mjs, dòng 592, 620-622 và 678) coi một eval là lệch khi `e.exit !== e.expected && !(e.expected !== 0 && e.exit === 0)`. Nghĩa là eval khai expected_exit khác 0 mà nay trả 0 vẫn đạt (hetGioiHan, chú thích 'AC-10: không phạt một cải thiện'). Bản sửa ở dem.mjs lại so `x.ma !== kyVong(D, x.slug, x.id)` (dòng 334), và trong `chay` trả `r.ma === kyVong(sha, …) ? 0 : 1` (dòng 349). Ví dụ: hồ sơ khai `expected_exit: 2`, rồi một lần gộp sửa xong giới hạn đó nên eval trả 0 ở D. Làn thoát 0 và báo xanh. kiem-cheo thì lọc eval này vào danh sách đỏ; phanLoai thấy D 'hỏng' (0≠2 → 1) còn các sha cũ 'đạt' (2 → 0), xếp nó thành do-moi ở chính lần gộp đã sửa, và ket_qua thành 'do'. Thế là báo hồi quy giả cho một cải thiện, ngược với lần chạy làn ngay trước đó trong cùng lượt. Tệp `_acceptance/kiem-cheo-sau-gop/rang/lan-gia.mjs:75` (`if (ma !== e.kyVong) doBatKy = true`) chép lại cùng phép so lệch này, nên làn giả cũng không còn giống làn thật. Pha-thử (l)/(m) không phủ trường hợp 'khai 2, nay trả 0'. Phép so nên dùng đúng vị từ `lech` của làn, ở cả bộ lọc, ở `chay` và ở lan-gia.

- **dem.mjs counts an eval as red when it declares a nonzero expected_exit and now exits 0, but the real lane counts that as green (AC-10), so the nightly run reports a false do-moi**
  AC: AC-6
  file: `scripts/kiem-cheo/dem.mjs:334`
  severity: high
  source: bugs
  detail: The red filter at dem.mjs:333-335 is `x.ma !== kyVong(D, x.slug, x.id)`. The bisection probe at line 349 is `r.ma === kyVong(sha, e.slug, e.id) ? 0 : 1`. Both use strict equality against the declared expected_exit. The kit lane the run reads (feature-loop 2.24.0 scripts/repin-lane.mjs:592 and 620-625) uses a different rule. Its mismatch test is `!(x === e.expected) && !(e.expected !== 0 && x === 0)`, and `hetHan = e.expected !== 0 && e.exit === 0` is passed with the comment "AC-10: không phạt một cải thiện". So an eval that declares a known limitation and then exits 0 is green in the lane: the lane exits 0 and writes no red line. The repo already has evals like this: _acceptance/man-cai-dat-noi-tieng-viet/evals.yaml:122 (expected_exit: 2) and _acceptance/tro-ly-okr-de-xuat/evals.yaml:225 (expected_exit: 1). Failure scenario: a merge fixes one of those limitations, so the eval now exits 0 at D. The lane exits 0 and is green. In dem.mjs, 0 !== 2, so the eval enters `do_`. In phanLoai, chay(D) returns 1, so it is not chap-chon. The run then either reports do-san (when the eval is signed off at T, because the 0 !== 2 rule also counts T as red, though it really exited 2 as declared) or bisects and names the fixing merge as `do-moi`. The day result becomes `do` and the person is notified, while the lane itself is green. The new guard at line 360 (`lan.ma !== 0 && do_.length === 0`) does not catch this, because the lane exit is 0. The fake lane _acceptance/kiem-cheo-sau-gop/rang/lan-gia.mjs:75 (`ma !== e.kyVong`) copies the same strict rule. Cases (l)/(m) in pha-thu.mjs never cover the expected!=0 && exit==0 case, so the gap slips past the tests too. Fix: use the kit's rule in both places, i.e. red only when `ma !== kv && !(kv !== 0 && ma === 0)`.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **taoKyVong nuốt lỗi đọc/parse evals.yaml và bỏ errs của expectedExits, lệch pattern 'khai sai thì không tha gì' của kho**
  Người dùng thấy gì: Nếu một hồ sơ nghiệm thu bị hỏng hay khai sai phần mã thoát mong đợi, kiểm tra ban đêm có thể lặng lẽ bỏ qua chỗ hỏng đó và vẫn báo kết quả như bình thường. Người đọc báo cáo sẽ không biết là hồ sơ đó đã không được đọc đúng.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fake writer shaped like the reader) + shape 5 (incomplete matrix): lan-gia.mjs decides red with dem.mjs's own rule `ma !== kyVong`, not the real lane's `lech`, and no cell covers expected_exit≠0 with exit 0**
  Người dùng thấy gì: Bộ thử dùng một bản làn giả không giống hẳn làn thật ở trường hợp «đã khai có giới hạn nhưng nay chạy xanh». Vì vậy bài thử vẫn báo đạt dù kiểm tra ban đêm có thể báo nhầm ở đúng trường hợp này.
  file: `_acceptance/kiem-cheo-sau-gop/rang/lan-gia.mjs`
  severity: high
  Đề xuất: known-limits

- **Shape 3 (presence of one string instead of the relation): kho-that only asserts ket_qua === "xanh", and on the real repo after this round's dem.mjs change it passes while dem records two false red entries**
  Người dùng thấy gì: Phép thử trên kho thật chỉ nhìn kết quả cuối là «xanh», nên không thấy hai hồ sơ đã bị ghi nhầm là đỏ sẵn trong báo cáo ngày. Người xem kết quả thử có thể tin là mọi thứ sạch trong khi báo cáo còn dòng sai.
  file: `_acceptance/kiem-cheo-sau-gop/rang/kho-that.mjs`
  severity: medium
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

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
