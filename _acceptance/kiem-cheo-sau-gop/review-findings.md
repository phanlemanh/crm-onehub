# Review findings: kiem-cheo-sau-gop (vòng 3)

## Trong hợp đồng

- **dem.mjs coi mọi eval thoát khác 0 là đỏ, bỏ qua expected_exit đã khai, nên hồi quy thật bị xếp «đỏ sẵn» và báo xanh**
  file: `scripts/kiem-cheo/dem.mjs:317`
  severity: high
  AC: AC-6
  source: bugs
  detail: Dòng 317 lọc `doc.eval.filter((x) => x.ma !== 0)`, và `phanLoai` trong thu-pham.mjs cũng so mỗi lần chạy với 0 (`chay(D) === 0`, `chay(T) !== 0`, `chay(giua) !== 0`). Làn ghim lại thì coi một eval là đạt khi `exit === expected` (repin-lane.mjs dùng `expectedExits` của lib/eval-yaml.cjs), và dòng `[lane] … → exit N` in ra mã thật. Hiện có hai hồ sơ signed-off khai mã khác 0: man-cai-dat-noi-tieng-viet E5 (`expected_exit: 2`) và tro-ly-okr-de-xuat E24 (`expected_exit: 1`). Có ba hậu quả cụ thể. (1) Hồi quy thật: E5 trả 1 ở D nhưng trả 2 ở T. Khi đó `chay(D)=1≠0` nên không phải chập chờn; `coO(T)` đúng và `chay(T)=2≠0` nên trả `do-san`. Ket_qua thành `xanh`, ghiMoc tiến tới D, và hồi quy không bao giờ được báo. (2) Đêm bình thường, eval trả đúng mã đã khai: vẫn bị phân loại, tốn hai lần dựng lại cây (bun install + db:generate), và ghi một mục `do-san` giả vào tệp ngày. (3) Eval hay hồ sơ đó mới ký trong khoảng T..D: `coO(T)` sai, và mọi điểm chia đôi đều trả mã khác 0, nên ra `do-moi` giả. Ket_qua thành `do`, gửi đơn can-nguoi hoặc thông báo cho người dù làn ghim lại đã xanh. Cách sửa: lấy mã kỳ vọng của từng eval bằng `expectedExits` trên evals.yaml ở D, rồi so `ma !== expected` cả ở bộ lọc lẫn trong phanLoai.
  rationale: AC-6 hứa gọi tên lần gộp làm đỏ thêm eval của hồ sơ đã ký; tính đỏ/xanh sai với mã thoát đã khai khiến hồi quy thật bị xếp đỏ-sẵn và báo xanh, phá đúng lời hứa chính của AC-6.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Default worktree build command is a constant inside dem.mjs instead of in the area config cau-hinh.mjs**
  Người dùng thấy gì: Lệnh dựng cây và danh sách công cụ nằm rải ở hai chỗ thay vì một chỗ cấu hình chung, nên người muốn đổi phải đi tìm. Kiểm chéo hằng đêm vẫn chạy đúng, chỉ khó sửa hơn về sau.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: medium
  Đề xuất: wont-fix

- **KIEM_CHEO_TRAN_PHUT is read without validation at the boundary, and the time-limit message reports the config value instead of the limit actually used**
  Người dùng thấy gì: Nếu ai đó đặt sai giá trị giới hạn thời gian khi chạy tay, lượt đêm sẽ dừng ngay và báo không chạy được mà không nói rõ do giá trị sai. Báo cáo cũng có thể ghi nhầm con số giới hạn. Lượt chạy bình thường hằng đêm không bị ảnh hưởng.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **Làn thoát 1 mà không đọc được suite hay eval đỏ nào thì vẫn báo xanh và tiến mốc**
  Người dùng thấy gì: Nếu bộ chạy kiểm chéo tự sập giữa chừng hoặc tự báo đỏ mà không chỉ ra eval nào, báo cáo đêm vẫn có thể ghi xanh và bỏ qua khoảng đó ở lần sau. Người dùng có thể tưởng mọi thứ ổn trong khi có phần chưa được kiểm.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 2: hand-written fixture shaped like the reader. The launchd check runs a stub kiem-cheo:chay, not the real script**
  Người dùng thấy gì: Bài kiểm tra việc cài lịch chạy hằng đêm chỉ thử với một lệnh giả, chưa thử lệnh thật của kho. Nếu lệnh thật hỏng khi máy khởi động theo lịch, bài kiểm tra vẫn xanh và lượt đêm có thể không chạy.
  file: `scripts/kiem-cheo/test/cai.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4: negative-only assertions. "khong khoa, khong cay" are checked after the process has exited, and the code always cleans both up**
  Người dùng thấy gì: Bài kiểm tra rằng lượt không có gì để đo thì không xin khoá và không dựng cây chỉ nhìn sau khi mọi thứ đã dọn xong, nên nếu sau này lượt đó lỡ xin khoá thì bài kiểm tra vẫn không báo đỏ.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5: claims a class ("one --slug for every hồ sơ, no other slug") but the fixture has only one point**
  Người dùng thấy gì: Phép thử kiểm tra tập hồ sơ được đo chỉ dùng đúng một hồ sơ, nên chưa chứng minh được rằng mọi hồ sơ liên quan đều được đo và hồ sơ không liên quan thì không. Hành vi thật chưa thấy sai.
  file: `_acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5: the moc error matrix (vang / hong / off first-parent) is checked end to end for only one case**
  Người dùng thấy gì: Khi mốc kiểm lần trước bị mất, bị hỏng hoặc không còn hợp lệ, chỉ trường hợp mất được thử trọn vẹn; hai trường hợp còn lại chưa được thử đầu-cuối nên khó chắc chắn người dùng nhận đúng thông báo.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Shape 1: checks for a string in config/source instead of dem.mjs actually resolving the lane**
  Người dùng thấy gì: Phép kiểm xác nhận kiểm chéo dùng đúng bộ chạy chung chỉ tìm một từ khoá trong tệp, nên về sau có người đổi lối gọi mà giữ từ khoá thì phép kiểm vẫn xanh. Hiện chưa có dấu hiệu gọi sai.
  file: `_acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Đơn xin khoá dựng tay, không qua kiemDon của module sở hữu hình dạng; đơn hỏng bị nuốt thành 'khoá bận' sau 6 giờ (r2)**
  Người dùng thấy gì: Nếu đơn xin lượt của lần kiểm đêm bị bộ phát lịch từ chối, lần kiểm đó chờ 6 giờ rồi chỉ ghi 'khoá bận' và không ai được báo. Người dùng sẽ thấy đêm đó không kiểm mà không biết lý do thật là đơn hỏng.
  file: `scripts/kiem-cheo/khoa.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative-only assertion): pha-thu (k) never shows the time cap fired during the bisect, and its 'no classification' check cannot fail (r2)**
  Người dùng thấy gì: Bài thử chứng minh 'quá giờ giữa lúc truy tìm lần gộp gây đỏ thì dừng và không kết luận' có thể xanh dù giờ chưa hết đúng lúc đó. Hệ quả: ta chưa chắc kiểm chéo dừng đúng ở chỗ này, dù sản phẩm có thể vẫn đúng.
  file: `_acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs`
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

- **Shape 3 (presence instead of the relation): the flow-style paths test only checks length > 0, not that the parsed globs match the declared ones (r2)**
  Người dùng thấy gì: Bài thử đọc danh sách đường dẫn của hồ sơ chỉ kiểm có kết quả, không kiểm đủ từng mục. Rủi ro nhỏ: một lỗi bỏ sót mục thứ hai có thể lọt qua bài thử.
  file: `scripts/kiem-cheo/test/tap-cham.test.mjs`
  severity: low
  Đề xuất: wont-fix

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
