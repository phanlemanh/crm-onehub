# Review findings: kiem-cheo-sau-gop (round 1)

## Trong hợp đồng

- **duongCua only reads block-style `paths:`, so it silently drops flow-style `paths: [a, b]` used by 57 signed profiles**
  file: `scripts/kiem-cheo/tap-cham.mjs:28`
  severity: high
  AC: AC-1
  source: conventions
  detail: duongCua treats evals.yaml as text. It only starts collecting after a line that matches /^(\s*)paths:\s*$/ and then reads `- x` items. The flow form `paths: [apps/api/..., ...]` never matches. That form is used in 59 evals.yaml files. I checked the real tree: 57 signed-off or machine-cleared profiles lose some or all of their paths. About 40 of them have no block-style paths at all, so tapCham can never put them in the set to measure. Examples are bo-xuong-kara, dieu-phoi-hai-tang, tro-ly-okr-de-xuat, soan-okr-cung-tro-ly and muc-tieu-va-kr. AC-1 ('the set is drawn from _acceptance/*/, not listed by hand') breaks without any error. A merge that turns those profiles red ends as `xanh` with 0 profiles, and the mark still moves forward to D. This goes against AGENTS.md 'Parse at the boundary': untrusted text gets a hand-written regex parser whose failure becomes an empty list, when it should be parsed properly or fail loudly. The unit-test fixtures only use block style, so they cannot catch this. Repro: `duongCua(readFileSync('_acceptance/bo-xuong-kara/evals.yaml'))` returns [].

- **The lock request's `worktree` points to the private worktree before it exists, so phat-lich rejects it and every night with a live round ends `bo-luot-khoa-ban` after 6 hours**
  file: `scripts/kiem-cheo/khoa.mjs:59`
  severity: high
  AC: AC-4
  source: conventions
  detail: quaBoPhatLich writes `worktree: cay` (`.acceptance-runs/kiem-cheo/cay`) into xin/kiem-cheo-s4.json. dem.mjs calls layKhoa (line 259) BEFORE dungCay creates that worktree (line 282). The previous run's `finally` also runs `git worktree remove --force cay`, so in normal use the directory is missing. phat-lich reads xin/ through kiemDon (scripts/dieu-phoi/hinh-dang.mjs), which throws `worktree ... không phải thư mục tồn tại` and moves the request to xin/hong/ as `don-hong`. capPhat also calls fs.realpathSync(don.worktree). khoa.mjs keeps polling khoa/s4/chu.json for choToiDaMs (6 hours), never gets the lock, and records `bo-luot-khoa-ban` without moving the mark. So the AC-4/AC-5 path never runs when a round is live. The unit tests use the fake path `/tam/cay-rieng` and a fake grant, so they never go through the existing kiemDon check at that boundary. Fix: create the worktree, or at least the directory, before writing the request, or use a worktree path that already exists.

- **When the scheduler is running, every lock request is rejected, so the nightly check never runs and nobody is told**
  file: `scripts/kiem-cheo/khoa.mjs:59`
  severity: high
  AC: AC-4
  source: bugs
  detail: quaBoPhatLich writes xin/kiem-cheo-s4.json with worktree = cay (.acceptance-runs/kiem-cheo/cay). That tree is only created later, by dungCay inside voiKhoa (dem.mjs:282), after the lock is granted. The finally block at dem.mjs:339 also removes it at the end of every run, so the directory never exists when the request is written. The scheduler reads xin/ through kiemDon (scripts/dieu-phoi/hinh-dang.mjs:24-30), which throws 'worktree ... không phải thư mục tồn tại' and moves the request to xin/hong/. I confirmed this by calling kiemDon on this exact request shape: it throws. layKhoa then keeps polling khoa/s4/chu.json for the full choToiDaMs (6 hours) and returns {ban:true}, so the run records 'bo-luot-khoa-ban'. That result is not in KIEM_CHEO.baoNguoi, so no notification is sent and the moc does not advance. Effect: on every night the scheduler is running, the check silently does nothing. khoa.test.mjs and pha-thu.mjs never call the real kiemDon (the test writes chu.json by hand, and pha-thu has no batch directory), which is why this was not caught. Fix: create the tree (or use an existing directory) before sending the request, or point worktree at goc.

- **duongCua ignores flow-style `paths: [...]`, so about 42 signed-off hồ sơ are never checked**
  file: `scripts/kiem-cheo/tap-cham.mjs:28`
  severity: high
  AC: AC-1
  source: bugs
  detail: duongCua only recognises `paths:` with nothing after it on the line, followed by block items `- x`. In the repo, 59 of 183 evals.yaml files use flow style (`paths: ["apps/agent/evals/okr/**", apps/agent/test/...]`). In 42 hồ sơ with status signed-off or machine-cleared, flow style is the only form used, for example tro-ly-okr-de-xuat, soan-okr-cung-tro-ly, gop-y-dung-cho and khung-tao-okr-nhu-deal. I checked this directly: duongCua returns [] for those files, and tapCham({tepDoi:['apps/agent/test/tro-ly-okr-cach-ly.spec.ts', ...]}) does not include tro-ly-okr-de-xuat. A merge that breaks these hồ sơ is reported as 'xanh' or left out of the measured set, and the moc still advances past it. This breaks AC-1's promise that the set is every signed hồ sơ whose glob matches a changed file.

- **The lane's exit code is ignored, so an early stop (its own 80-minute cap or a signal) is reported as xanh and the moc advances**
  file: `scripts/kiem-cheo/dem.mjs:288`
  severity: high
  AC: AC-8
  source: bugs
  detail: After the lane runs, dem only checks that docLan found suite lines, then classifies whatever eval lines are present. lan.ma is never checked. repin-lane has its own cap: feature_loop.repin_budget_min is 80 in config.yaml, and kiem-cheo does not pass --tran-phut. When the cap is hit, ketThucSom kills the running commands and exits with code 4 (128+n on SIGTERM/SIGHUP from a source other than dem), after all suites and only some evals have printed. dem's own cap is longer (KIEM_CHEO.luot.tranPhut = 90), so lan.vuot is false. Evals that never ran are treated as passing, ket_qua becomes 'xanh', and ghiMoc moves the moc to D. Those merges are never re-checked. AC-8 says exceeding the cap must give 'khong-chay-duoc' with the moc unchanged. Fix: treat any lane exit other than 0 or 1 as khongChayDuoc, or check that every planned eval label appears in the output.

- **If the run's time cap fires during the last command of a bisect, the run reports a wrong red-eval classification**
  file: `scripts/kiem-cheo/dem.mjs:315`
  severity: low
  AC: AC-8
  source: bugs
  detail: Inside phanLoai, chay returns (await may.chay(e.lenh, cay)).ma. When the taoChay timer fires, it kills the process group, and close gives ma = null → 1, which phanLoai reads as a real failure. Normally the next datCay/chay throws VuotTran. But if the kill hits the last chay of the last failing eval, phanLoai finishes with hi pointing at the wrong merge, or returns doSan. The loop then calls ket({ket_qua: do/xanh}) and ghiMoc without checking may.vuot(), so a cap overrun is reported as a classified result. In the same catch block, ly_do also prints KIEM_CHEO.luot.tranPhut instead of the effective KIEM_CHEO_TRAN_PHUT. Fix: check may.vuot() after the classification loop, before ket and ghiMoc.

- **Shape 2 (hand-written fixture in the reader's shape): fake evals.yaml only uses block-style `paths:`, which hides that duongCua returns [] for the flow-style `paths: [...]` used by 59 real dossiers**
  file: `scripts/kiem-cheo/test/kho-gia.mjs:67`
  severity: high
  AC: AC-1
  source: measurement
  detail: kho-gia.hoSo hand-writes evals.yaml in the one format duongCua can read: `    paths:\n      - "p"`. tap-cham.test.mjs (b) only ever uses this fake. Its duongCua case is also a hand-written block-style string. Nothing reads a real `_acceptance/*/evals.yaml`. The real repo is different: 59 evals.yaml files use the inline form `paths: ["a", "b"]`, for example _acceptance/bo-xuong-kara/evals.yaml:9. The regex `/^(\s*)paths:\s*$/` in tap-cham.mjs does not match that form. I checked this directly. `duongCua(readFileSync('_acceptance/bo-xuong-kara/evals.yaml'))` returns []. `tapCham({goc:'.', tepDoi:['packages/ui/src/components/kara/transcript.tsx']})` returns 26 dossiers but leaves out bo-xuong-kara, even though it is signed-off and names that exact file. So the AC-1 set silently drops every signed-off dossier written in the inline style, and E1(b) passes because the fixture copies the reader's format instead of the format real dossiers are written in.

- **Shape 2 (hand-written fixture): bao.test checks that the daily file has all keys, but the input DO already contains all of them, while the error paths in dem.mjs write files missing tu/lan_gop/ho_so/do**
  file: `scripts/kiem-cheo/test/bao.test.mjs:76`
  severity: high
  AC: AC-9
  source: measurement
  detail: E1(h) promises that every daily file has the keys ket_qua, tu, den, lan_gop, ho_so and do. The test passes bao() a hand-written DO object that already contains all six keys. bao only runs JSON.stringify(ketQua), so the loop `for (const k of ["ket_qua","tu","den","lan_gop","ho_so","do"]) assert.ok(k in ngay)` reads back what the test itself wrote in. The real writer is dem.mjs, and it writes files that lack these keys. The moc-vang branch writes `ket({ ket_qua: KQ.loi, den: D, ly_do })`. The git-fetch-error branch and the catch in luot() write only `{ket_qua, ly_do}`. dem.test (c) does read those files, but it only checks ket_qua and ly_do. The promise is false on every `loi` path, and the test cannot see it because the data never round-trips from dem through bao.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Copies of helpers that scripts/dieu-phoi already exports (glob, docJson, atomic write, contract status)**
  Người dùng thấy gì: Hai chỗ trong kho cùng quyết định một tệp có khớp mẫu hay không bằng hai đoạn mã riêng. Hiện chưa sai kết quả đêm nay, nhưng sau này sửa một nơi mà quên nơi kia thì kiểm đêm có thể lệch với bộ phát lịch.
  file: `scripts/kiem-cheo/tap-cham.mjs`
  severity: medium
  Đề xuất: known-limits

- **Constants kept outside the area's config file (cau-hinh.mjs) and a hard-coded session name in lich.mjs**
  Người dùng thấy gì: Một vài con số và tên phiên chỉnh được đang nằm rải rác. Ai đổi tên phiên kiểm đêm ở một nơi mà không đổi nơi kia thì ưu tiên xếp lịch của lượt đêm âm thầm ngừng hoạt động.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: low
  Đề xuất: known-limits

- **expected_exit is ignored when deciding which evals failed, which hides regressions or reports false ones**
  Người dùng thấy gì: Một số bài kiểm tra được khai là phải kết thúc với mã lỗi nhất định. Kiểm đêm coi chúng là hỏng nên có thể báo động giả, và ngược lại có thể che mất một lần hỏng thật ở chính những hồ sơ đó.
  file: `scripts/kiem-cheo/dem.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 2 (hand-written fixture): the env -i test runs a stub kiem-cheo:chay script, never the real dem.mjs with --tu on the fake repo**
  Người dùng thấy gì: Bài kiểm xác nhận lịch chạy 1 giờ sáng hoạt động trong môi trường trống lại chạy một lệnh giả, không phải lệnh thật. Nên nếu lệnh thật không chạy được từ lịch tự động thì bài kiểm vẫn báo đạt.
  file: `scripts/kiem-cheo/test/cai.test.mjs`
  severity: high
  Đề xuất: new-contract

- **Shape 3 (presence instead of a relation): canMoc at 21 hours compares against ngay(M1), but M1, M2 and M3 all have the same date**
  Người dùng thấy gì: Bài kiểm chọn ngày ưu tiên cho lượt đêm dùng ba lần gộp cùng ngày, nên nó vẫn đạt dù hệ thống chọn nhầm lần gộp mới nhất thay vì cũ nhất. Lỗi chọn sai ngày có thể lọt qua mà không ai thấy.
  file: `scripts/kiem-cheo/test/moc.test.mjs`
  severity: high
  Đề xuất: new-contract

- **Shape 4 (negative-only assertion): '(h) no other slug' cannot fail because the fake repo has only one dossier, 'ky'**
  Người dùng thấy gì: Bài phá thử chỉ có một hồ sơ nên không chứng minh được lượt đêm sẽ không đo thêm hồ sơ không liên quan. Nếu có lỗi đo thừa hồ sơ thì bài này không phát hiện.
  file: `_acceptance/kiem-cheo-sau-gop/rang/pha-thu.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (class claim, single-point case): E1(c) promises 3 moc failure reasons, each giving code 2, the --tu message and one report, but dem.test runs only 'moc vang' end to end**
  Người dùng thấy gì: Khi mốc kiểm tra bị mất, chỉ một trong ba tình huống được thử đầy đủ từ đầu đến cuối. Hai tình huống kia (mốc hỏng, mốc không còn trên nhánh) chưa được chứng minh là báo đúng lỗi và báo đúng một lần.
  file: `scripts/kiem-cheo/test/dem.test.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 1 (checks the instruction, not the output): ranh-gioi (b) greps for the identifier 'giaiBang' in doc-lan.mjs and the path string in cau-hinh.mjs, and never reads dem.mjs**
  Người dùng thấy gì: Phép kiểm xác nhận lượt đêm gọi làn kiểm qua đường chính thức chỉ tìm một từ khoá trong mã. Nếu sau này ai đó chuyển sang đường tắt khác mà vẫn để lại từ khoá thì phép kiểm vẫn báo đạt.
  file: `_acceptance/kiem-cheo-sau-gop/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 4 (negative-only assertion): 'the request is written through a temp file' rests on a spy that only catches writeFileSync, with no control showing it catches a direct write**
  Người dùng thấy gì: Bài kiểm xác nhận đơn xin khoá được ghi an toàn có thể bỏ sót một số cách ghi trực tiếp. Rủi ro thực tế thấp và chi phí tăng độ nhạy lớn hơn lợi ích.
  file: `scripts/kiem-cheo/test/khoa.test.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
