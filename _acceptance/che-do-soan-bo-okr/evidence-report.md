---
schema_version: 2
feature_slug: che-do-soan-bo-okr
verdict: REJECT
failed_evals: ["E19","E17"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a298d0db43df63594a07f6a513e8ce6f0afc24a7
human_signoff:
---

# Evidence Report: che-do-soan-bo-okr

Round 4. Verdict REJECT: hai eval đỏ là E19 (AC-11, thước không-đổi-hình) và E17 (AC-10, chấm ảnh). Ngoài ra lệnh suite `bun run test -- --filter=app --filter=@crm/ui` đỏ và không gắn eval nào (xem mục Lệnh suite).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-6 | script | PASS |
| E12 | AC-7 | test | PASS |
| E13 | AC-7 | script | PASS |
| E14 | AC-8 | test | PASS |
| E15 | AC-9 | test | PASS |
| E16 | AC-10 | script | PASS |
| E17 | AC-10 | ui-check | FAIL |
| E18 | AC-10 | script | PASS |
| E19 | AC-11 | script | FAIL |
| E20 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-che-do-soan-bo-okr-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_mo
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 7 tests across 1 file. [5.41s]

- eval: E2
  run_id: minted-che-do-soan-bo-okr-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

- eval: E3
  run_id: minted-che-do-soan-bo-okr-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_viet
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 8 tests across 1 file. [6.47s]

- eval: E4
  run_id: minted-che-do-soan-bo-okr-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

- eval: E5
  run_id: minted-che-do-soan-bo-okr-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_sua
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 9 tests across 1 file. [3.95s]

- eval: E6
  run_id: minted-che-do-soan-bo-okr-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_cham_bo
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 6 tests across 1 file. [13.00ms]

- eval: E7
  run_id: minted-che-do-soan-bo-okr-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_chat_luong
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 7 tests across 1 file. [2.84s]

- eval: E8
  run_id: minted-che-do-soan-bo-okr-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_gop_y
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 6 tests across 1 file. [7.55s]

- eval: E9
  run_id: minted-che-do-soan-bo-okr-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

- eval: E10
  run_id: minted-che-do-soan-bo-okr-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_cong_bo
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 7 tests across 1 file. [7.49s]

- eval: E11
  run_id: minted-che-do-soan-bo-okr-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

- eval: E12
  run_id: minted-che-do-soan-bo-okr-E12-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_ngan
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 9 tests across 1 file. [3.17s]

- eval: E13
  run_id: minted-che-do-soan-bo-okr-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

- eval: E14
  run_id: minted-che-do-soan-bo-okr-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_quyen
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 7 tests across 1 file. [4.80s]

- eval: E15
  run_id: minted-che-do-soan-bo-okr-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.vk10_dom_tai
  verified_at: 2026-10-28T07:19:42Z
  output: |
    Ran 5 tests across 1 file. [3.08s]

- eval: E16
  run_id: minted-che-do-soan-bo-okr-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

- eval: E17
  run_id: minted-che-do-soan-bo-okr-E17-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  screenshot: evidence/E17-step1.png
  observed: |
    Frame 1 soan-1280-sang (E17-step1): Che do Soan 1280 sang. Trai: tieu de «Kinh doanh mien Bac · Quy 4 · mau» + «Khong co muc tieu nhap» sat ben phai ten (ban mau dat o goc phai); muc tieu «Giu da tang truong ban le mien Bac» chu dam lon hon dong KR; KR1-3 thut duoi voi o so xam disabled xep gon; chan: cau «...thieu KR o lai Nhap...» + nut Cong bo mo (disabled). Phai: Chat luong «13 tren 16 diem dat», 3 muc canh bao co nut «Den dong»; duoi la nhom «Kara 1 de xuat · Vi sao?» voi the doi ten KR, khong co nhan «KR n» dau the (ban mau co «KR 3»); nut Doi ten KR xanh primary; «Kara doc lai bo» o day. Duong ke doc chia hai cot.
    Frame 2 soan-375-sang: phu toan man, hai the «Bo OKR | Chat luong va Kara», khong tran ngang, tieu de bo cat «Khong co muc tieu...»; muc tieu lon, KR thut, o so xep hai hang; chan co Cong bo. Khop ban mau 375.
    Frame 3 trong-1280-sang: bo trong, con tro nhap nhay o «Go muc tieu — Enter de xuong dong KR» (chu lon hon ban mau, thuoc muc 1), «Them KR Enter», «Them muc tieu» + «Kara Nho Kara soan nhap» + cau goi y; cot phai «Go muc tieu dau tien de may cham» va «Kara · Gop y». Khop y dinh.
    Frame 4 hoi-cong-bo-1280-sang: hop thoai «Cong bo 1 muc tieu?» liet o tich «Kho lanh Bac Ninh san sang mua cao diem», nut «Cong bo 1 muc tieu» (ban mau chi «Cong bo», khong o tich — thuoc muc 4).
    Frame 5 ngan-1280-sang: ngan theo doi co dung mot chip «Kara · 1 gop y» o dau, khong khoi Kara; nhung than la khung muc tieu day du (tab KR/Gop vao/Vet..., o Tien do-Tinh trang-Phu trach, bang KR, nut Xem tren so do, Theo doi), khac ban mau rut gon.
    Toi: soan-1280-toi, soan-375-toi, hoi-cong-bo-1280-toi, ngan-1280-toi doc duoc, chu/vien khong chim; o so cong bo disabled mo nhung giong ban mau. Doi chieu 8 anh design-pass: layout chinh khop, nhung co cac cho lech (a)-(d) ngoai danh sach nam cho nen eval FAIL.
  network_observed: n-a (driver)
  output: |
    E17 FAIL (cham anh, khong phai loi lenh). Lenh eval chay nguyen van: EVAL= bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs".
    Lan 1: tu dat EVAL=E17 sai, script tu choi («EVAL E17 khong thuoc thuoc nay») -> bo, khong tinh.
    Lan 2: «Unable to connect» trong man-soan-do.mjs:258 (e2), loi ket noi tam thoi cua phien do, khong lap lai.
    Lan 3 (tinh): «KET LUAN vk10 man: 9 DUNG, 0 SAI», ANH 10/10, HTML 8/8, KHO 1280 hai o / KHO 375 hai the khong tran, NGAN vung 0 neo 0 chip 1, GOP Y nhan->moi hoan tac->cu, CONG BO 3 KR. Phien do da don.
    Frame luu: E17-step1..5.png (soan-1280-sang, soan-375-sang, trong-1280-sang, hoi-cong-bo-1280-sang, ngan-1280-sang) trong _acceptance/che-do-soan-bo-okr/evidence/.
    Assertion PASS: ten muc tieu lon hon dong KR; cot phai Chat luong tren, Kara duoi, nhan Kara mot lan; bo trong co con tro + loi «Nho Kara soan nhap»; hop hoi cong bo liet ten co o tich; ngan theo doi chi mot chip Kara; 375 hai the khong tran; sang va toi chu va vien khong chim.
    Assertion FAIL «Cho lech ban mau chi gom nam cho»: co them cac cho lech ngoai danh sach dong 5 muc cua Notes:
    (a) Dong tieu de tai lieu: «Khong co muc tieu nhap» nam sat ngay sau ten bo (trai), ban mau dat o goc phai («1 muc tieu nhap · tu luu»); DOM kara-artifact-meta nam trong nhom trai cua kara-artifact-header, khong co phan tu phai.
    (b) The de xuat Kara kieu doi ten: ban mau co dong nhan dau the «KR 3» tren cau gach ngang; ban that khong co nhan nao (DOM proposed-change-body chi co del, ins, ly do) nen nguoi doc khong biet de xuat cho KR nao.
    (c) Cau chan tai lieu doi chu: «...thieu KR ay o lai Nhap» thay vi «...thieu KR hay thieu dich o lai Nhap».
    (d) Ngan theo doi: than ban mau la ban rut gon (dong «Bam chip mo che do Soan...», 3 the KR); ban that la khung muc tieu day du (tab, o Tien do/Tinh trang/Phu trach, bang KR), nut «Xem tren so do» va «Theo doi» canh chip.
    Ghi chu phu (khong tinh FAIL): nut «Doi ten KR» cung to xanh primary canh nut Cong bo, giong ban mau.

- eval: E18
  run_id: minted-che-do-soan-bo-okr-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_san_thiet_ke
  verified_at: 2026-10-28T07:19:42Z
  output: |
    KET LUAN vk10 san thiet ke: 8/8 HTML, 0 P0

- eval: E19
  run_id: minted-che-do-soan-bo-okr-E19-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.vk10_khong_doi_hinh
  verified_at: 2026-10-28T07:19:42Z
  output: |
    HO SO trang-don-vi-mot-bang#E18: cay 0
    HO SO quyet-gop-y-noi-dung-ly-do#E1: cay 0
    HO SO quyet-gop-y-noi-dung-ly-do#E2: cay 0
    HO SO quyet-gop-y-noi-dung-ly-do#E6: cay 0
    THU LAI quyet-gop-y-noi-dung-ly-do#E7: lan dau ma 2
    THU LAI quyet-gop-y-noi-dung-ly-do#E8: lan dau ma 2
    THU LAI quyet-gop-y-noi-dung-ly-do#E7: lan dau ma 2
    DO SAN TREN NEN quyet-gop-y-noi-dung-ly-do#E7: cay 2 · nen 2
    DO SAN TREN NEN quyet-gop-y-noi-dung-ly-do#E8: cay 2 · nen 1
    GIU gop-y-dung-cho ... GIU quyet-gop-y-noi-dung-ly-do (17 hồ sơ có dòng GIU)
    SAI AC-11: okr-to-chuc-va#apps/app/test/okr-to-chuc-va.dom.tsx:608 doi logic — dat("okr.cycles", () => ({
    KET LUAN khong-doi-hinh: 1 SAI

- eval: E20
  run_id: minted-che-do-soan-bo-okr-E20-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vk10_man
  verified_at: 2026-10-28T07:19:42Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_api-r4
  exit_code: 0
  verified_at: 2026-10-28T07:19:42Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_app_filter_crm_ui-r4
  exit_code: 1
  verified_at: 2026-10-28T07:19:42Z

Ghi chú lệnh suite đỏ (không gắn eval nào): gói `@crm/ui` báo 387 pass, 1 fail. Ca đỏ là `dau-hook > dau-hook (i): hai ref`, dòng nguyên văn «this test timed out after 5000ms» (5594.13ms), cả gói chạy 162.66s. Các ca khác của gói và 2 tác vụ turbo còn lại xanh. Chưa rõ ca này đỏ vì chậm theo tải máy hay vì mã.

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_agent_filter_crm_aut-r4
  exit_code: 0
  verified_at: 2026-10-28T07:19:42Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_test_filter_agent_okr_filter_crm-r4
  exit_code: 0
  verified_at: 2026-10-28T07:19:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-che-do-soan-bo-okr-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-28T07:19:42Z

- cmd: bun run lint:slop
  run_id: minted-che-do-soan-bo-okr-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-28T07:19:42Z

- cmd: bunx turbo run build --force
  run_id: minted-che-do-soan-bo-okr-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-28T07:19:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt: none — mọi eval feature đều red trên baseline (có phân biệt). Lưu ý: ở round này baseline không đo được nên mọi field baseline là n-a và câu này không có căn cứ đo.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-mo: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- EVAL=${EVAL:-} bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/che-do-soan-bo-okr/rang/man-soan.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-viet: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-sua: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd packages/validation && bun test test/okr-cham-bo.spec.ts -t vk10-cham: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-chat-luong: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-gop-y: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-cong-bo: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-ngan: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-quyen: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/che-do-soan-bo-okr.dom.tsx -t vk10-tai: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/che-do-soan-bo-okr/rang/san-thiet-ke.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- bun _acceptance/che-do-soan-bo-okr/rang/khong-doi-hinh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

### Judge panels

Round này không có judge panel nào được đề xuất; không có mục judgment chờ người. E17 là eval ui-check đã chấm bằng máy và đỏ.

## Variance

none — mọi eval nhiều lượt đều đồng đều (mọi eval chạy một lượt, xác định).

## Iterations

Round 1 đến 3: lịch sử nằm ở các báo cáo vòng trước, không có trong dữ liệu của round này.
Round 4: E19 và E17 đỏ. E19: thước không-đổi-hình báo «SAI AC-11: okr-to-chuc-va» ở apps/app/test/okr-to-chuc-va.dom.tsx:608 (đổi logic ở ca dựng `okr.cycles`, chính là ca neo-kara mới thêm ở commit a298d0db4). E17: ảnh có bốn chỗ lệch bản mẫu ngoài năm chỗ được phép (a đến d ở trên). Thêm lệnh suite app và @crm/ui đỏ ở một ca hết 5000ms. Trả về cho khâu cài đặt.
