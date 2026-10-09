# Review findings: thuoc-khong-tu-het-han (round 1)

## Trong hợp đồng

- **chi-paths.mjs misses paths changes on any eval whose executor is not script or test**
  AC: AC-2
  file: `_acceptance/thuoc-khong-tu-het-han/rang/chi-paths.mjs:44`
  severity: low
  source: bugs
  detail: `soSanhTep` so từng khối eval sau khi `boPaths()` đã gỡ khối `paths:` khỏi mọi eval, bất kể executor. Tập «eval đổi paths» lấy từ `pathsCua()` (neo.mjs), vốn bỏ qua eval không phải `script`/`test` và eval có status not-run. Nên nếu paths của một eval judgment, ui-check hay not-run đổi trong 1 trong 14 tệp evals.yaml thì thay đổi đó vừa bị gỡ khỏi phép so «trường khác giống hệt», vừa không vào `doiPaths`; script vẫn in XANH dù E2 hứa «tập eval đổi paths ĐÚNG bằng 20 eval; mọi trường khác giống hệt». Diff hiện tại không kích hoạt lỗ này, nhưng chiều đỏ của phép kiểm có một lỗ hổng. Cách sửa: tính `doiPaths` từ văn bản paths thô của mọi khối eval, không qua `pathsCua`.

- **Hình dạng 5 (tuyên quét LỚP, chỉ phủ tập con): chi-paths không thấy paths đổi ở eval ui-check/judgment/not-run**
  AC: AC-2
  file: `_acceptance/thuoc-khong-tu-het-han/rang/chi-paths.mjs:18`
  severity: medium
  source: measurement
  detail: AC-2 hứa «tập eval đổi paths đúng bằng 20 eval của danh sách; mọi trường khác giống hệt» trên cả 14 tệp evals.yaml. `boPaths` (dòng 18-23) gỡ khối `paths:` khỏi MỌI eval trước khi so các trường khác, còn `pathsCua` (neo.mjs dòng 74-77) bỏ qua mọi eval không phải script/test hoặc có status not-run, nên với những eval đó `a` và `b` đều là "null" (dòng 47-49) và không bao giờ vào `doiPaths`. Đo trên chính 14 tệp này: 35 eval mang `paths` rơi vào vùng mù, ví dụ danh-sach-keo-chung/E4 và E11 (ui-check), doi-ten-onehub-center/E7 (judgment), the-gop-y-okr/E3-E10 và E16 (test not-run). Một lần sửa paths lỡ tay ở bất kỳ eval nào trong số đó vẫn cho E2 xanh. Phép quét khai cho cả lớp «mọi eval của 14 tệp» nhưng chỉ phủ phần script/test đang chạy, và không có ma trận nào kê sẵn eval nào được xét.

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ): E10 chỉ ghim SỐ commit thước in ra, không ghim tập sha**
  AC: AC-4
  file: `_acceptance/thuoc-khong-tu-het-han/rang/hai-thuoc.mjs:84`
  severity: medium
  source: measurement
  detail: AC-4 và expected của E4 hứa «bản neo thoát 0 và in đúng tập commit ghim sẵn (số commit và danh sách sha) của a62adb16..52e00cad2^2». Dòng 82 của hai-thuoc.mjs chạy LẠI `git log --no-merges --grep=... a62adb16..${t.neo}^2` ngay trong eval rồi so với `tapCommit`, tức là so phép tính của chính eval với danh sách ghim. Phần duy nhất đo đầu ra của thước neo là dòng 84: `moiThat.ra.includes(`${t.tapCommit.length} commit mang ten`)`, một chuỗi đếm «16 commit mang ten». Quan hệ được hứa là tập commit thước thật sự xét phải bằng tập ghim, nhưng assert chỉ kiểm con số có mặt. Thước neo mà đổi dải (DINH_PR hay MOC) sang một tập khác vẫn có 16 commit thì E4 vẫn xanh. khong-sua-tep-hang.mjs cũng không in danh sách sha, nên vế «danh sách sha» của expected không được đo ở đâu cả.

- **Hình dạng 5 (ma trận không viết trước): bộ mẫu mốc trôi rút từ readdirSync, mỗi mẫu chỉ kiểm «có bị đếm», không kiểm đếm đúng dạng nào**
  AC: AC-5
  file: `_acceptance/thuoc-khong-tu-het-han/rang/kiem-ke.mjs:118`
  severity: low
  source: measurement
  detail: AC-5 kê 8 dạng mốc trôi phải đếm được: origin/onehub, onehub trần, merge-base, ..HEAD, HEAD~N, @{u}, ls-files không ref, diff không ref. Ở dòng 118-124, ma trận lại là `readdirSync(MAU)`, và assert của mỗi mẫu trôi chỉ là `dang.length === 0` thì lỗi. Không có danh sách viết sẵn nối tên tệp mẫu với tên dạng trong DANG_TROI, nên có hai lỗ. (a) Xoá một tệp mẫu, chẳng hạn 06-upstream.mjs, thì số assert tụt theo mà E5 vẫn xanh, vì «số assert = số tệp mẫu» được rút từ chính thư mục bị xoá. (b) Một mẫu bị đếm nhầm dạng vẫn qua, vì không assert `dang.includes(<dạng tên tệp nói>)`. Cũng không có vế nào kiểm mỗi mục của DANG_TROI có ít nhất một mẫu, nên thêm dạng thứ 9 mà quên viết mẫu thì không ai thấy. Đây đúng là mẫu thiếu: số assert phải bằng số phần tử của một ma trận viết trước.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **the-gop-y-okr/E2: paths chết được thay bằng gop-y-kara.ts, nhưng bài test không nhập tệp đó; tệp nó thật sự đo là the-gop-y-props.ts**
  Người dùng thấy gì: Một kiểm tra về thẻ góp ý OKR đang được gắn vào sai tệp. Khi ai đó sửa phần logic thật của thẻ này, hệ thống có thể không biết kiểm tra cần chạy lại, nên một kết quả xanh cũ có thể bị giữ nguyên dù thẻ đã đổi.
  file: `_acceptance/the-gop-y-okr/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **soan-okr-song-lai/E12: paths đã đổi sang khung-soan.tsx, lệnh vẫn quét man-soan.tsx, tệp không còn**
  Người dùng thấy gì: Kiểm tra thiết kế của màn Soạn OKR vẫn trỏ vào một tệp đã bị xoá. Lần kế tiếp màn này được sửa và kiểm tra chạy lại, nó sẽ báo đỏ vì thiếu tệp chứ không vì lỗi thiết kế thật, gây một lượt ghim lại không đáng có.
  file: `_acceptance/soan-okr-song-lai/evals.yaml`
  severity: low
  Đề xuất: new-contract

- **the-gop-y-okr E2 now points at gop-y-kara.ts, but the test actually exercises the-gop-y-props.ts**
  Người dùng thấy gì: Một kiểm tra về thẻ góp ý OKR đang được gắn vào sai tệp. Khi ai đó sửa phần logic thật của thẻ này, hệ thống có thể không biết kiểm tra cần chạy lại, nên một kết quả xanh cũ có thể bị giữ nguyên dù thẻ đã đổi.
  file: `_acceptance/the-gop-y-okr/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **soan-okr-song-lai E12 paths now point at khung-soan.tsx, but its command still scans the deleted man-soan.tsx and crashes**
  Người dùng thấy gì: Kiểm tra thiết kế của màn Soạn OKR vẫn trỏ vào một tệp đã bị xoá. Lần kế tiếp màn này được sửa và kiểm tra chạy lại, nó sẽ báo đỏ vì thiếu tệp chứ không vì lỗi thiết kế thật, gây một lượt ghim lại không đáng có.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 4/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/the-gop-y-okr/evals.yaml, _acceptance/soan-okr-song-lai/evals.yaml, _acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
