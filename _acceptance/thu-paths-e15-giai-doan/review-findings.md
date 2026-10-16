## Trong hợp đồng

- **--kiem-bo-qua-lop only checks evals that are still in the bo-qua class at HEAD, so adding paths to a khong-co-inputs or input-vang eval goes unnoticed**
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs:328`
  severity: medium
  AC: AC-6
  source: conventions
  detail: kiemBoQuaLop loops over lapKeHoach().filter(x => x.loai === "bo-qua"), and that list is computed at HEAD. In lapKeHoach, `if (paths)` runs before the `!inputs.length` and input-vang checks. So once an eval in the khong-co-inputs or input-vang class gets paths, it becomes "da-co" or "lech" and leaves the loop. The DOI_PATHS comparison never runs for it. Only the khoa and khai-not-run classes still hit DOI_PATHS, because they are classified before the paths check. The positive control (empty class → exit 2) catches the input-vang case only because that class has a single eval. khong-co-inputs has 2 evals: adding paths to one of them gives exit 0. AC-6 promises "eval đó không bị thêm paths". E6 expected says it checks that "paths của nó ở HEAD bằng đúng paths ở cây mốc trước vòng". Neither holds for these two classes. Commit 071e571e7 changed the red mutation them-paths-input-vang from expecting `DOI_PATHS okr-loai-hoc-tap#E14: input-vang` to expecting `KHONG DO DUOC: lop bo qua rong: input-vang`, which shows the DOI_PATHS branch cannot fire for this class. Fix: build the bo-qua class from the baseline tree (lapKeHoach(tepTai(moc), docTai(moc))) and compare each eval's paths against HEAD. Add a mutation that adds paths to one of the two khong-co-inputs evals.

- **--kiem-bo-qua-lop (E6) only scans evals that are still bo-qua at HEAD, so adding paths to a khong-co-inputs or input-vang eval passes silently**
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs:322`
  severity: medium
  AC: AC-6
  source: bugs
  detail: kiemBoQuaLop loops over `lapKeHoach().filter(x => x.loai === "bo-qua")`, which is the HEAD plan. In lapKeHoach, the `if (paths)` branch (line 92) runs before the `khong-co-inputs` and `input-vang` checks. An eval in either of those classes that gets paths therefore becomes `da-co` or `lech` and drops out of the scan. For these two classes the DOI_PATHS comparison can only ever catch removed paths, never added ones. The empty-class guard catches this only when the class has exactly one member: input-vang has 1 today, so the 'them-paths-input-vang' mutation works. khong-co-inputs has 2. I simulated it: lapKeHoach was given a doc() that adds `paths: [apps/app/lib/messages/settings.ts]` to chu-mac-dinh-thu-vien-ngoai#E10. E10 came back as `loai: 'da-co'`, the bo-qua list had 9 evals, and all four classes were still non-empty. E6 would print 'doi 0' and exit 0. That contradicts the claim of scanning 'TRỌN lớp' and the AC-6 guarantee (a skipped eval does not get paths). E4 catches this today only because these profiles are outside danh-sach. Fix: iterate over the bo-qua evals of the pre-round plan (lapKeHoach(tepTai(moc), docTai(moc))), then compare their paths at HEAD.

- **Hình dạng 5 (tuyên quét trọn lớp, nhưng lớp được tính SAU khi đổi): E6 --kiem-bo-qua-lop không bắt được paths thêm vào eval thuộc lớp khong-co-inputs hay input-vang**
  file: `_acceptance/thu-paths-e15-giai-doan/rang/them-paths.mjs:327`
  severity: medium
  AC: AC-6
  source: measurement
  detail: E6 (evals.yaml dòng 120-133) hứa quét TRỌN lớp eval bị xếp «bo-qua» và kiểm từng eval có paths ở HEAD bằng đúng paths ở cây mốc trước vòng, «paths đổi → DOI_PATHS, mã 1». kiemBoQuaLop (dòng 327) lại lấy lớp từ lapKeHoach() ở HEAD. Trong lapKeHoach, nhánh `if (paths)` ở dòng 92-102 đứng TRƯỚC hai nhánh `!inputs.length` (dòng 103) và input-vang (dòng 107-116). Vì vậy, một eval thuộc lớp khong-co-inputs hay input-vang mà bị thêm paths sẽ thành «da-co» hoặc «lech» và rời khỏi tập đang quét. Phép so pCu/pNay ở dòng 342-347 không bao giờ chạy cho đúng eval vi phạm. Đã thử trong bộ nhớ, không ghi tệp: chèn paths [README.md] vào chu-mac-dinh-thu-vien-ngoai#E10 (khong-co-inputs) thì lapKeHoach trả về da-co, số eval bo-qua giảm từ 10 xuống 9. Lớp khong-co-inputs còn 1 eval (cua-so-tro-chuyen-noi-tieng-viet#E20), nên không lớp nào rỗng: lệnh in «doi 0» và thoát mã 0. Lệnh chỉ đỏ khi lớp còn đúng một phần tử. Đột biến them-paths-input-vang (dot-bien.mjs dòng 259-271) mong mã 2 «lop bo qua rong» chính vì okr-loai-hoc-tap#E14 là eval duy nhất của lớp, nên đột biến này không chứng minh được DOI_PATHS cho hai lớp đó. Expected ghi «hôm nay 10 eval: 3 · 4 · 2 · 1» nhưng mã không ghim con số nào. Không có ma trận viết trước lấy lớp ở cây mốc (lapKeHoach(tepTai(moc), docTai(moc))) với số khẳng định bằng số phần tử. Chỉ hai lớp khoa-thuoc và khai-not-run (xét trước nhánh paths) thật sự được đo vế «paths không đổi».

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **mocTruoc() matches the branch's own sync merges and can return a commit from the middle of the round as the baseline**
  Người dùng thấy gì: Nếu chạy lại bước kiểm tra từ nhánh này sau khi đã gộp, công cụ có thể lấy nhầm mốc so sánh và báo sai. Lúc ký và gộp thì kết quả vẫn đúng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **mocTruoc only uses the 'merged branch' fallback when HEAD is an ancestor of origin/onehub; on any later branch it silently returns a post-round commit**
  Người dùng thấy gì: Sau khi vòng này được gộp, chạy lại phép kiểm trên một nhánh mới có thể báo lỗi giả cho tám hồ sơ. Việc gộp hôm nay không bị ảnh hưởng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **KHONG_CO_TEP_DOI accepts a listed profile on the inference that 'the gate printed no line', but the code only checks for two kinds of NOTE**
  Người dùng thấy gì: Công cụ có thể coi nhầm một hồ sơ là chưa có tệp nào đổi trong vài tình huống hiếm. Với tám hồ sơ hiện tại thì kết quả vẫn đúng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E8 nhận hồ sơ là KHONG_CO_TEP_DOI chỉ vì không khớp hai regex, không đo «không tệp nào đổi từ lúc ghim»**
  Người dùng thấy gì: Phép kiểm có thể bỏ qua nhầm một hồ sơ mà lưới nghiệm thu thật ra đã bỏ dở, nên chưa đo được chắc chắn. Với dữ liệu hiện tại thì chưa gây sai kết quả.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: medium
  Đề xuất: known-limits

- **globT1 only reads 3 of the ~22 t1_skip_globs, so the stale-file set does not match pre-merge-check's stale_files (r1 · tệp đã đổi)**
  Người dùng thấy gì: Công cụ kiểm tra nội bộ chỉ đọc một phần danh sách tệp được miễn, nên sau này có thể báo đỏ nhầm hoặc xanh nhầm cho một hồ sơ. Hôm nay kết quả vẫn đúng, người dùng chưa bị ảnh hưởng.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/hoa-cu-theo-paths.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien.mjs keeps its own copy of the eval commands; E3's real command and its declared red direction are never mutation-tested (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử kiểm tra chính bộ kiểm tra chưa chạy đúng lệnh mà chủ kho đã ký cho hai hồ sơ được gọi tên. Bộ kiểm tra có thể sai mà bài thử vẫn báo là bắt được.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **pmc-truoc-sau: khongDo() gọi process.exit(2) bên trong try nên finally không chạy, worktree tạm bị bỏ lại (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi công cụ kiểm tra gặp lỗi giữa chừng, nó để lại một bản sao kho tạm trên máy. Chỉ tốn chỗ và gây rối nhẹ, không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/pmc-truoc-sau.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien: nhánh CHO_F23 bỏ qua cặp đột biến E2 mà không tính vào lot hay lech, nên thước vẫn trả 0 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử có thể báo xanh dù hai phép thử chưa chạy, nếu sau này một hồ sơ khác thay đổi. Hiện tại chưa xảy ra.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (không đối chiếu số cặp với danh sách khai): E7 hứa chạy «mỗi đột biến khai ở CHIỀU ĐỎ», nhưng CAP gõ tay, lệnh E3 khác lệnh khai, và cặp CHO_F23 đi qua mà không đo (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử kiểm tra chính bộ kiểm tra không phủ hết mọi trường hợp đã hứa và chạy một lệnh khác với lệnh đã ký. Bộ kiểm tra có thể bỏ sót lỗi mà vẫn báo là bắt được hết.
  file: `_acceptance/thu-paths-e15-giai-doan/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
