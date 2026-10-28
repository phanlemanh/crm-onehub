---
schema_version: 2
feature_slug: hop-tuan-tren-bang
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d2f57b85255f7c5e114a136631f617bed40386d7
human_signoff:
---

# Evidence Report: hop-tuan-tren-bang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hop-tuan-tren-bang-E1-r1
  exit_code: 0
  carried_from_round: 1
  baseline: n-a
  verifier: config:executors.test.httb_api
  verified_at: 2026-10-28T09:03:54Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-hop-tuan-tren-bang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_ghi_chu
  verified_at: 2026-10-28T09:39:27Z
  output: |
    Ran 1 test across 1 file. [2.01s]

- eval: E3
  run_id: minted-hop-tuan-tren-bang-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_muc_doi_chu
  verified_at: 2026-10-28T09:39:27Z
  output: |
    Ran 1 test across 1 file. [1.93s]

- eval: E4
  run_id: minted-hop-tuan-tren-bang-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_cap_nhat
  verified_at: 2026-10-28T09:39:27Z
  output: |
    Ran 2 tests across 1 file. [2.76s]

- eval: E5
  run_id: minted-hop-tuan-tren-bang-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_sang
  verified_at: 2026-10-28T09:39:27Z
  output: |
    Ran 1 test across 1 file. [3.43s]

- eval: E6
  run_id: minted-hop-tuan-tren-bang-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_nguon
  verified_at: 2026-10-28T09:39:27Z
  output: |
    DUNG

- eval: E7
  run_id: minted-hop-tuan-tren-bang-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_sau_gui
  verified_at: 2026-10-28T09:39:27Z
  output: |
    Ran 1 test across 1 file. [1.76s]

- eval: E8
  run_id: E8-htb-20261028-1640
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_man
  verified_at: 2026-10-28T09:39:27Z
  output: |
    KET LUAN htb anh: 55 DUNG, 0 SAI (moi khoang 1440/768/375 x sang/toi co 9 dong DUNG + DUNG DU ANH 12/12)
  screenshot: evidence/E8-step1.png
  observed: |
    Da mo bang Read ca 12 anh moi.
    1440 sang (htb-bang): header Muc tieu, the con Hop tuan gach chan, hang so 4/5 · 2 · 1 · 54 o dau. Dang ban 2 dong va Con lai 3 dong, du 5 cot: KR va vi sao, Tien do, Ghi chu moi nhat (hoac «Chua co ghi chu», dong hai co ghi chu dai kem 28/10, dong Con lai «Thieu mot nguoi truc ca toi» 05/10), Muc doi hai dong (vd «+0,3 diem / 4,7 → 5 · so voi 19/10», «−0,9% / 25,4 → 24,5 · so voi 19/10», «Chua doi»), nut «Cap nhat» doc tron, nam trong khung, khong bi day ra ngoai.
    1440 sang (htb-ngan): dau ngan «Giu diem hai long tren 4,5», «2/5 · theo thu tu bang», hai nut ‹ ›, nut «Cap nhat» xanh, nut dong; the Hien tai 5 diem, Tien do 100%, bieu do lich su.
    1440 toi: bang va ngan cung bo cuc; nen den, ten KR, ghi chu, muc doi, vien the/bang van doc ro, khong chim vao nen; nut Cap nhat doc ro.
    768 sang/toi (htb-bang): khong con cot ghi chu/muc doi ben phai, ghi chu «Ghi chu moi nhat» va «Muc doi» nam duoi ten KR trong cung o, moi dong nut «Cap nhat» o goc phai trong khung, khong tran ngang; 5 dong du, chu doc tron. htb-ngan: «2/5 · theo thu tu bang», ‹ ›, Cap nhat, ten KR xuong 2 dong nhung khong cat; sang va toi deu doc ro (ghi chu lich su trong ngan co cat bang dau … la phan lich su, khong thuoc kiem).
    375 sang/toi (htb-bang): danh sach the mot cot, moi the co ten KR, tien do, nhan, ghi chu moi nhat (hoac Chua co ghi chu) + ngay, Muc doi hai dong, nut «Cap nhat» o cuoi the, khong tran ngang; 5 the du; dark mode van doc ro, vien the nhin thay. htb-ngan: ngan dang drawer duoi len, «2/5 · theo thu tu bang» xuong dong cung nut ‹ ›, nut Cap nhat o hang duoi, tieu de KR doc tron; sang va toi deu doc ro.
    Khong anh nao mau thuan Expected; du 12/12 anh.
  network_observed: n-a (driver)

- eval: E9
  run_id: minted-hop-tuan-tren-bang-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.httb_chu
  verified_at: 2026-10-28T09:39:27Z
  output: |
    Ran 182 tests across 1 file. [1273.00ms]

- eval: E10
  run_id: minted-hop-tuan-tren-bang-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_khong_doi_hinh
  verified_at: 2026-10-28T09:39:27Z
  output: |
    KET LUAN khong-doi-hinh: dat

- eval: E11
  run_id: minted-hop-tuan-tren-bang-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.httb_man_gui
  verified_at: 2026-10-28T09:39:27Z
  output: |
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-hop-tuan-tren-bang-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

- cmd: bun run lint:slop
  run_id: minted-hop-tuan-tren-bang-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

- cmd: bunx turbo run build --force
  run_id: minted-hop-tuan-tren-bang-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-28T09:39:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»

Eval khong-phan-biet: none — baseline khong do duoc o round nay (xem tren), nen khong co eval nao duoc liet ke la khong-phan-biet; moi field baseline ghi n-a.

Baseline khong do:
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-ghi-chu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-muc-doi-chu: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-cap-nhat: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sang: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-nguon && cd ../.. && bun _acceptance/ngan-kr-mot-cho/rang/quet-loi.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-sau-gui: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 20000 --preload ../../packages/ui/test/setup-dom.ts ./test/hop-tuan-tren-bang.dom.tsx -t htb-chu && bun test ./test/messages-guard.spec.ts: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- node _acceptance/hop-tuan-tren-bang/rang/khong-doi-hinh.mjs: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/hop-tuan-tren-bang/rang/man.mjs --phan gui": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong eval nao co pass_rate)

## Iterations

Round 1: ban chay dau E10 do (thuoc quet lop) va nhieu phat hien trong hop dong ve do (AC-3, AC-4, AC-6, AC-7, AC-9); tra ve cho vong sua. Chay lai (r1b) PASS, con mot phat hien AC-4 (dong KR vua gui mat khi Con lai gap va mat focus), da sua o f5bcf73dd.
Round 2: moi eval chay lai tren d2f57b85 deu PASS; E1 carry-forward tu round 1 vi delta khong cham paths cua eval.
