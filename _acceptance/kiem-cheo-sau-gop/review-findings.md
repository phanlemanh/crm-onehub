# Review findings: kiem-cheo-sau-gop (round 2)

## Trong hợp đồng

- **hoSoTai: git archive _acceptance vượt maxBuffer 1 MiB của execFileSync → mọi lượt đêm có gộp đều ra 'loi' (ENOBUFS) trên kho thật**
  AC: AC-1
  file: `scripts/kiem-cheo/dem.mjs:89`
  severity: high
  source: bugs
  detail: hoSoTai gọi `execFileSync("git", ["-C", goc, "archive", sha, "_acceptance"])` mà không truyền `maxBuffer`. Mặc định của execFileSync là 1 MiB, còn tar của `_acceptance` ở kho này nặng khoảng 315 MB (`git archive HEAD _acceptance | wc -c` = 315351040), vì có rất nhiều ảnh bằng chứng PNG. Đã tái hiện bằng đúng lời gọi đó: node ném `spawnSync git ENOBUFS`, bun cũng vậy. LaunchAgent chạy `bun run kiem-cheo:chay`, lệnh này gọi tiếp `node scripts/kiem-cheo/dem.mjs`. Vì thế đêm nào có ít nhất một lần gộp (gop.length > 0) thì luotTho cũng ném lỗi ở dòng 243, trước tapCham và trước khi lấy khoá. luot() bắt lỗi đó rồi ghi `ket_qua: loi` với lý do 'loi bat ngo: spawnSync git ENOBUFS'. Kết quả là kiểm chéo không bao giờ chạy và mốc không bao giờ tiến, nên đêm nào cũng báo cùng một lỗi. pha-thu.mjs và các bài node --test (54/54 xanh) không bắt được lỗi này, vì kho git giả chỉ có vài tệp nên tar nhỏ hơn 1 MiB. Cách sửa: truyền `maxBuffer` đủ lớn, hoặc tốt hơn là pipe `git archive` thẳng vào `tar -x` (spawn hoặc `bash -c 'git archive … | tar -x -C …'`), hoặc chỉ lấy contract.md và evals.yaml (ví dụ `git archive sha -- '_acceptance/*/contract.md' '_acceptance/*/evals.yaml'`), vì tapCham chỉ đọc hai tệp đó.
  rationale: Đọc hồ sơ ở mốc trước để rút tập hồ sơ cần đo là phần của AC-1; trên kho thật bước này luôn lỗi nên tập hồ sơ không bao giờ được tính khi có lần gộp, và kiểm chéo không chạy được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đơn xin khoá dựng tay, không qua kiemDon của module sở hữu hình dạng; đơn hỏng bị nuốt thành 'khoá bận' sau 6 giờ**
  Người dùng thấy gì: Nếu đơn xin lượt của lần kiểm đêm bị bộ phát lịch từ chối, lần kiểm đó chờ 6 giờ rồi chỉ ghi 'khoá bận' và không ai được báo. Người dùng sẽ thấy đêm đó không kiểm mà không biết lý do thật là đơn hỏng.
  file: `scripts/kiem-cheo/khoa.mjs`
  severity: medium
  Đề xuất: known-limits
- **Shape 4 (negative-only assertion): pha-thu (k) never shows the time cap fired during the bisect, and its 'no classification' check cannot fail**
  Người dùng thấy gì: Bài thử chứng minh 'quá giờ giữa lúc truy tìm lần gộp gây đỏ thì dừng và không kết luận' có thể xanh dù giờ chưa hết đúng lúc đó. Hệ quả: ta chưa chắc kiểm chéo dừng đúng ở chỗ này, dù sản phẩm có thể vẫn đúng.
  file: `_acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits
- **Shape 2 (hand-written fixture): the new bao test '(h) dau vao thieu khoa' still hand-writes the input instead of reading the file the real dem.mjs writes**
  Người dùng thấy gì: Bài thử xác nhận báo cáo hằng ngày luôn đủ trường đang dùng dữ liệu tự dựng chứ không dùng tệp thật do lần kiểm đêm ghi ra. Nếu sau này tệp thật thiếu trường, bài thử sẽ không bắt được.
  file: `scripts/kiem-cheo/test/bao.test.mjs`
  severity: medium
  Đề xuất: known-limits
- **Shape 2 (hand-written fixture / measured at the wrong moment): kiemDon is called after layKhoa returns, not when the scheduler reads the request**
  Người dùng thấy gì: Bài thử chưa chứng minh đơn xin lượt hợp lệ ngay tại lúc bộ phát lịch đọc nó. Nếu thứ tự thao tác đổi, đơn có thể bị từ chối mà bài thử vẫn xanh.
  file: `scripts/kiem-cheo/test/khoa.test.mjs`
  severity: medium
  Đề xuất: known-limits
- **Shape 3 (presence instead of the relation): the flow-style paths test only checks length > 0, not that the parsed globs match the declared ones**
  Người dùng thấy gì: Bài thử đọc danh sách đường dẫn của hồ sơ chỉ kiểm có kết quả, không kiểm đủ từng mục. Rủi ro nhỏ: một lỗi bỏ sót mục thứ hai có thể lọt qua bài thử.
  file: `scripts/kiem-cheo/test/tap-cham.test.mjs`
  severity: low
  Đề xuất: wont-fix
- **Shape 2 (hand-written fixture): the env -i test runs a stub kiem-cheo:chay script, never the real dem.mjs with --tu on the fake repo** (r1)
  Người dùng thấy gì: Bài kiểm xác nhận lịch chạy 1 giờ sáng hoạt động trong môi trường trống lại chạy một lệnh giả, không phải lệnh thật. Nên nếu lệnh thật không chạy được từ lịch tự động thì bài kiểm vẫn báo đạt.
  file: `scripts/kiem-cheo/test/cai.test.mjs`
  severity: high
  Đề xuất: new-contract
- **Shape 3 (presence instead of a relation): canMoc at 21 hours compares against ngay(M1), but M1, M2 and M3 all have the same date** (r1)
  Người dùng thấy gì: Bài kiểm chọn ngày ưu tiên cho lượt đêm dùng ba lần gộp cùng ngày, nên nó vẫn đạt dù hệ thống chọn nhầm lần gộp mới nhất thay vì cũ nhất. Lỗi chọn sai ngày có thể lọt qua mà không ai thấy.
  file: `scripts/kiem-cheo/test/moc.test.mjs`
  severity: high
  Đề xuất: new-contract
- **Shape 5 (class claim, single-point case): E1(c) promises 3 moc failure reasons, each giving code 2, the --tu message and one report, but dem.test runs only 'moc vang' end to end** (r1)
  Người dùng thấy gì: Khi mốc kiểm tra bị mất, chỉ một trong ba tình huống được thử đầy đủ từ đầu đến cuối. Hai tình huống kia (mốc hỏng, mốc không còn trên nhánh) chưa được chứng minh là báo đúng lỗi và báo đúng một lần.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: medium
  Đề xuất: new-contract
- **Shape 1 (checks the instruction, not the output): ranh-gioi (b) greps for the identifier 'giaiBang' in doc-lan.mjs and the path string in cau-hinh.mjs, and never reads dem.mjs** (r1)
  Người dùng thấy gì: Phép kiểm xác nhận lượt đêm gọi làn kiểm qua đường chính thức chỉ tìm một từ khoá trong mã. Nếu sau này ai đó chuyển sang đường tắt khác mà vẫn để lại từ khoá thì phép kiểm vẫn báo đạt.
  file: `_acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
