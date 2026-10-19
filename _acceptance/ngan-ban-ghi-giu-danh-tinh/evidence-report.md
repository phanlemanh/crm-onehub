---
schema_version: 2
feature_slug: ngan-ban-ghi-giu-danh-tinh
verdict: BLOCKED
failed_evals: ["E5"]
reason: |
  Lệnh `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs"` (phủ E6, E7, E8) chạy xong với mã 2, không bị công cụ giết. Script tiền đề báo "KHONG DO DUOC: tien de thieu": http://localhost:4703/ trả 200 nhưng không có Location, nên không suy ra được slug. Phép đo màn (rang/man.mjs) chưa được chạy. Cần một app dev đúng cây đang xét ở cổng 4703 với phiên đăng nhập hợp lệ, rồi chạy lại.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6030de3ee7cdd3912b0338ccf5eb64cecc178636
human_signoff:
---

# Evidence Report: ngan-ban-ghi-giu-danh-tinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-6 | test | PASS |
| E4 | AC-7 | test | PASS |
| E5 | AC-1 | script | FAIL |
| E6 | AC-3 | script | BLOCKED |
| E7 | AC-4 | script | BLOCKED |
| E8 | AC-5 | script | BLOCKED |
| E9 | AC-3 | ui-check | PASS |
| E10 | AC-4 | ui-check | PASS |
| E11 | AC-5 | ui-check | PASS |
| E12 | AC-3 | script | PASS |
| E13 | AC-8 | test | PASS |
| E14 | AC-8 | script | PASS |
| E15 | AC-8 | script | PASS |

Lệnh fail không gắn eval nào: `node _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs` (gắn E5, mã thoát 1) và `bun run test -- --filter=api` (không gắn eval, mã thoát 1; ba bài hết 5000 ms: bang-cham, khep-chan, khep-bien).

## Evidence

- eval: E1
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_danh_tinh
  verified_at: 2026-10-19T15:42:35Z
  output: |
    Ran 1 test across 1 file. [1450.00ms]

- eval: E2
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_tai_xong
  verified_at: 2026-10-19T15:42:35Z
  output: |
    Ran 2 tests across 1 file. [1.62s]

- eval: E3
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_nap_vai
  verified_at: 2026-10-19T15:42:35Z
  output: |
    Ran 2 tests across 1 file. [1.90s]

- eval: E4
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gdt_khong_de
  verified_at: 2026-10-19T15:42:35Z
  output: |
    Ran 2 tests across 1 file. [1.74s]

- eval: E5
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E5-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.gdt_chieu_do
  verified_at: 2026-10-19T15:42:35Z
  output: |
    OK tu kiem cay
    CHIEU DO DAT: ban-cu, luon-do, do-cuong-buc, chi-khoa-thieu, doi-chung (ban sao khong dot bien xanh)
    CHIEU DO GHI CAY _acceptance/ngan-ban-ghi-giu-danh-tinh/evidence/gdt-dong-1440.png
    CHIEU DO GHI CAY _acceptance/ngan-ban-ghi-giu-danh-tinh/evidence/gdt-dong-390.png
    CHIEU DO GHI CAY _acceptance/ngan-ban-ghi-giu-danh-tinh/evidence/gdt-mo-1440.png
    CHIEU DO GHI CAY _acceptance/ngan-ban-ghi-giu-danh-tinh/evidence/gdt-mo-390.png
    CHIEU DO GHI CAY _acceptance/ngan-ban-ghi-giu-danh-tinh/evidence/gdt-mo-lai-1440.png
    gdt chieu do: dat 5/5

- eval: E6
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E6-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T15:42:35Z
  output: |
    BLOCKED (cannotRun, không bị công cụ giết): phien-do dựng kho crm_modest_wiles_c7d384_do, app http://localhost:4703, api http://localhost:4314.
    KHONG DO DUOC: tien de thieu — http://localhost:4703/ tra 200 ma khong co Location, khong suy duoc slug.
    phien-do: xong — mã 2 (rang/man.mjs chưa được chạy)

- eval: E7
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E7-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T15:42:35Z
  output: |
    BLOCKED (cannotRun): cùng lệnh với E6; tiền đề báo KHONG DO DUOC: tien de thieu, rang/man.mjs chưa được chạy.

- eval: E8
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E8-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T15:42:35Z
  output: |
    BLOCKED (cannotRun): cùng lệnh với E6; tiền đề báo KHONG DO DUOC: tien de thieu, rang/man.mjs chưa được chạy.

- eval: E9
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T15:42:35Z
  screenshot: evidence/E9-step1.png
  observed: |
    gdt-dong-1440.png (E9-step1): danh sach Thoa thuan o 1440, o tim «Wise — expansion», mot hang «Wise — expansion» ro rang phia sau. Ngan chi tiet «Wise — expansion» / Wise chi hien mot phan o mep phai (bat dau khoang x≈1216 tren 1440), noi dung bi cat o mep phai man hinh (Tong quan, Chi tiet, «Wise — expans...») = lech sang phai theo huong truot, chua ve vi tri cuoi; tieu de «Wise» doc duoc; danh sach phia sau thay ro (khong bi che). gdt-dong-390.png (E9-step2): o 390 danh sach Thoa thuan voi hang Wise ro; ngan o day man hinh, chi hien phan tren (thanh keo, logo Wise, tieu de «Wise —», nut dong) bat dau y≈790 tren 844 = lech xuong duoi theo huong truot, chu «Wise» doc duoc; danh sach phia sau thay ro. Ca hai khop Expected va khop log (o 1440 dong, o 390 dong la dat).
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T15:42:35Z
  screenshot: evidence/E10-step1.png
  observed: |
    gdt-mo-1440.png (E10-step1): nen /deals tieu de "Thoa thuan", o tim kiem "Wise — expansion", bang con 1 dong, bi lam toi (overlay) nhung van thay ro phia sau. Ngan ban ghi "Wise — expansion" dang truot vao tu mep phai: canh trai ngan o x≈680; noi dung ngan bi cat o mep phai (cot "Ngay du kien chot" cat, nut trang thai o goc phai chi hien mot phan, cot thu tu "Ô giai doan" va "Phu trach" khong hien du) tuc la ngan chua toi vi tri cuoi, lech theo huong truot tu phai. Cung luot, gdt-mo-lai-1440.png cho thay ngan o x≈890 (lech xa hon) nen vi tri cuoi khong phai khung nay. gdt-mo-390.png (E10-step2): man hinh dien thoai, danh sach "Thoa thuan" mo toi phia tren, ngan dang truot len tu day: canh tren ngan o y≈220, co thanh keo (handle) o dau, phan duoi bi cat o day man hinh (dang "Phu trach" cat ngang), tuc la ngan lech xuong duoi theo huong truot vao, chua len het. Hai anh khop Expected: ngan dang vao, lech khoi vi tri cuoi theo huong truot, danh sach van thay phia sau. gdt-man.log dung 6 dong "dat" gom "o 1440 mo" va "o 390 mo".
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man
  verified_at: 2026-10-19T15:42:35Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (= gdt-mo-lai-1440.png, 1440x900, giao diện tối): màn Thoả thuận có ô tìm "Wise — expansion" và bảng chỉ còn một dòng Wise. Ngăn bản ghi «Wise — expansion» (logo Wise, nhãn "Wise") nằm bên phải, mép trái ở khoảng x=882 trên tổng 1440. Phần nội dung của ngăn bị cắt ở mép phải khung hình: "Ngày dự kiến chốt", "Ở giai đo...", "Giá trị", "Quy đổi U...", "Công ty". Vậy ngăn chưa vào hẳn vị trí cuối mà đang giữa đường trượt, không phải vị trí đầu của một lần mở mới từ mép phải (lúc đó ngăn sẽ nằm sát hoặc ngoài mép 1440). Nội dung «Wise» đọc được rõ: tiêu đề "Wise — expansion", Giá trị 8.861,42 £, các thẻ Tổng quan, Cá nhân 2, Hoạt động, Kara, giai đoạn "Qualified to buy", mục Chi tiết (Tên Wise — expansion, Tiền tệ GBP, Ngày chốt 23 thg 11, 2026, Phụ trách Ada Okafor), Mô tả, Người tham gia Elias Gupta và Rosa Rossi. Phần còn lại của màn bị phủ tối. Khớp expected.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gdt_man_chieu_do
  verified_at: 2026-10-19T15:42:35Z
  output: |
    chieu do: DO DUNG GHIM: ma 1, in man: ngan bien mat khi dong · man: ngan mo tre · man: ngan mo lai la phan tu moi

- eval: E13
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.vs_nap_san_dom
  verified_at: 2026-10-19T15:42:35Z
  output: |
    Ran 6 tests across 1 file. [1.69s]

- eval: E14
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.vs_chieu_do_nap_san
  verified_at: 2026-10-19T15:42:35Z
  output: |
    CHIEU DO DAT: nap-san

- eval: E15
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vs_hydrat_record
  verified_at: 2026-10-19T15:42:35Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-19T15:42:35Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-19T15:42:35Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-19T15:42:35Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-19T15:42:35Z

- cmd: bunx turbo run lint --force
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-19T15:42:35Z

- cmd: bun run lint:slop
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-19T15:42:35Z

- cmd: bunx turbo run build --force
  run_id: minted-ngan-ban-ghi-giu-danh-tinh-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-19T15:42:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline): E13 (`cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-nap-san.dom.tsx`). Đây là bài của #469 chạy lại không sửa, nên xanh cả hai phía là regression-guard có chủ ý theo lời khai AC-8, chứ không chứng minh tính năng mới.

Baseline không đo:

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu-danh-tinh.dom.tsx -t gdt-danh-tinh: bo qua baseline: tep apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu-danh-tinh.dom.tsx -t gdt-tai-xong: bo qua baseline: tep apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu-danh-tinh.dom.tsx -t gdt-nap-vai: bo qua baseline: tep apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/ngan-ban-ghi-giu-danh-tinh.dom.tsx -t gdt-khong-de: bo qua baseline: tep apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs: bo qua baseline: tep _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs --chieu-do: bo qua baseline: tep _acceptance/ngan-ban-ghi-giu-danh-tinh/rang/man.mjs co o cay dang kiem nhung chua co o merge-base d893f37eeb7f986195a64423c0dcbb49c74d8f40 — eval moi, chay tren code cu khong phan biet gi
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/ve-sinh-do-san-onehub/rang/hydrat-record.mjs": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E5 đỏ (chiếu đỏ đạt 5/5 nhưng ảnh chụp cây lệch vì có tệp chưa track trong evidence/, nên script thoát mã 1); E6, E7, E8 BLOCKED (tiền đề làn đo không suy ra được slug từ http://localhost:4703/, rang/man.mjs chưa chạy); lệnh suite `bun run test -- --filter=api` đỏ với ba bài hết 5000 ms (bang-cham, khep-chan, khep-bien), không gắn eval nào. Cần chạy lại phép đo màn với app dev đúng cây, rồi kiểm lại E5.
