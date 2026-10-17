---
schema_version: 2
feature_slug: lo-trinh-hien-ngay-du-kien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 10374629c9f36a709e157750964855b18048a56f
human_signoff:
---

# Evidence Report: lo-trinh-hien-ngay-du-kien

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-5 | judgment | PASS |
| E12 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lo-trinh-hien-ngay-du-kien-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_ban_chep
  verified_at: 2026-10-17T15:55:01Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-lo-trinh-hien-ngay-du-kien-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_khuon
  verified_at: 2026-10-17T16:37:03Z
  output: |
    cd packages/validation && bun test test/lo-trinh-du-lieu.spec.ts -t gio-may
    Ran 6 tests across 1 file. [216.00ms]

- eval: E3
  run_id: minted-lo-trinh-hien-ngay-du-kien-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_co_ngay
  verified_at: 2026-10-17T16:37:03Z
  output: |
    cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t co-ngay
    Ran 2 tests across 1 file. [4.26s]

- eval: E4
  run_id: minted-lo-trinh-hien-ngay-du-kien-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_so_do
  verified_at: 2026-10-17T16:37:03Z
  output: |
    lo-trinh-du-kien.spec.ts -t so-do roi lo-trinh-du-kien.dom.tsx -t so-do
    Ran 2 tests across 1 file. [4.72s]

- eval: E5
  run_id: minted-lo-trinh-hien-ngay-du-kien-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_qua_tai
  verified_at: 2026-10-17T16:37:03Z
  output: |
    lo-trinh-du-kien.spec.ts -t qua-tai roi lo-trinh-du-kien.dom.tsx -t qua-tai
    Ran 2 tests across 1 file. [4.85s]

- eval: E6
  run_id: minted-lo-trinh-hien-ngay-du-kien-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_chua_co
  verified_at: 2026-10-17T16:37:03Z
  output: |
    lo-trinh-du-kien.spec.ts -t chua-co roi lo-trinh-du-kien.dom.tsx -t chua-co
    Ran 2 tests across 1 file. [4.75s]

- eval: E7
  run_id: minted-lo-trinh-hien-ngay-du-kien-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_viec
  verified_at: 2026-10-17T16:37:03Z
  output: |
    lo-trinh-du-kien.dom.tsx -t viec
    Ran 8 tests across 1 file. [8.63s]

- eval: E8
  run_id: minted-lo-trinh-hien-ngay-du-kien-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_ban_cu
  verified_at: 2026-10-17T16:37:03Z
  output: |
    ban-chup-lo-trinh.spec.ts -t gio-may, lo-trinh-du-kien.spec.ts -t ban-cu, lo-trinh-du-kien.dom.tsx -t ban-cu
    Ran 4 tests across 1 file. [5.62s]

- eval: E9
  run_id: minted-lo-trinh-hien-ngay-du-kien-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldk_do_man
  verified_at: 2026-10-17T16:37:03Z
  screenshot: evidence/E9-step1.png
  observed: |
    Da mo 12 frame bang Read. Step1 (1280 vi, dong goi): moc «Lo trinh buoc 2» co dong «Du kien xong 17 thg 10, 2026» canh chip «uoc so bo», doan giai thich cach tinh; 3 viec ben duoi, khong chong chu.
    Step2 (375 en, dong goi): «Expected by Oct 17, 2026» + «rough estimate» + cau «Estimated by the system when the milestone started...», xuong dong gon trong the, khong tran.
    Step3 (375 vi sang): tieu de moc, «Du kien xong 15 thg 10, 2026», chip «uoc so bo», hai co «sau ngay muc tieu» va «da qua ngay du kien» (xuong dong gon), cau cach tinh; nen sang, khong cat chu.
    Step4 (375 vi toi): cung noi dung tren nen toi, doc ro, cac cham co cam de nhin.
    Step5 va step6 (375 en sang/toi): «Expected by Oct 15, 2026», «rough estimate», «after target date», «past expected date», cau cach tinh; doc duoc ca hai nen.
    Step7-8 (1280 vi sang/toi): mot hang «Du kien xong 15 thg 10, 2026» + «uoc so bo» + hai co cam tren cung hang, cau cach tinh duoi, khong chong len nhau, nen toi van doc ro.
    Step9-10 (1280 en sang/toi): tuong tu bang tieng Anh, «Expected by Oct 15, 2026» canh «rough estimate».
    Step11 (375 vi, ngan ho so): «Du kien xong 15 thg 10, 2026», chip «uoc so bo», hai co, cau cach tinh, khong tran ngang; dong «Uoc luong cong» o duoi mep anh chup nen khong thay trong khung nhung assertion DOM xac nhan «4–6,5 gio may uoc so bo».
    Step12 (1280 en, ngan): «Expected by Oct 15, 2026» + «rough estimate» + hai co + cau cach tinh, «Effort estimate 4–6.5 machine hours» + «rough estimate», khong chong chu.
    Moi frame khop Expected: ngay du kien canh chu «du kien»/«Expected», co nhin duoc o nen toi, khong chu chong nhau.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-lo-trinh-hien-ngay-du-kien-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_khoi_that
  verified_at: 2026-10-17T15:55:01Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Hoi dong ba judge (domain-correctness, operational-feasibility, spec-alignment) deu cham PASS, moi y co cau trich. De xuat panel, human_override de trong cho nguoi quyet o Cong 2.
  votes:
    - domain-correctness: PASS — (1) Hai chuoi hien ngay deu mang chu du kien: vi «Dự kiến xong ${ngay}», «dự kiến ${ngay}»; en «Expected by ${ngay}», «expected ${ngay}». cachTinh noi ro uoc tinh va gia dinh chay mot minh, dung muc «Lời ước, không phải cam kết»: vi «coi như chỉ mình mốc này đang chạy. Đây là ước tính, không phải cam kết.»; en «as if it were the only milestone running. Not a commitment.». (2) Ba lyDo khong chua tu noi bo (kit, khoi, du-bao, gio_may) va noi duoc chuyen dang xay ra, vi du «Bản lộ trình này chưa mang ngày dự kiến.» va «Ngày dự kiến trong dữ liệu lộ trình không đọc được.». Chu «Máy» trong «Máy đặt ngày khi việc đầu tiên của mốc được mở» hoi mo ho nhung khong thuoc danh sach cam. (3) vi va en cung nghia o moi cap: «giờ máy» / «machine hours», «ước sơ bộ» / «rough estimate», «sau ngày mục tiêu» / «after target date», «ước theo luật chung» / «rule-of-thumb guess».
    - operational-feasibility: PASS — (1) Cac chuoi mang ngay deu co chu «dự kiến»/«Expected»: «Dự kiến xong ${ngay}» / «Expected by ${ngay}», «dự kiến ${ngay}» / «expected ${ngay}». cachTinh noi ro gia dinh va viec khong phai cam ket. Hai nhan co «ước sơ bộ» va «sau ngày mục tiêu» khong chua chu «dự kiến»; judge coi chung la co di kem dong ngay, khong phai chuoi mang ngay. (2) Ba lyDo khong dung tu noi bo trong danh sach cam. Cau chua-mo-viec «Máy đặt ngày khi việc đầu tiên của mốc được mở; mốc này chưa có việc nào mở từ lúc máy bắt đầu tính ngày.» co chu «Máy» hoi mo ho nhung khong thuoc danh sach cam. (3) vi va en tuong ung nghia o moi cap chuoi, gom cachTinh, chuaDuSoDoMoTa va ba lyDo; cho khac duy nhat la «Máy» va «The system», cung chi mot chu the.
    - spec-alignment: PASS — (1) Dat. Moi chuoi ngay deu mang chu du kien: vi «Dự kiến xong ${ngay}», «dự kiến ${ngay}», «Ngày dự kiến», «Chưa có ngày dự kiến»; en «Expected by ${ngay}», «expected ${ngay}», «Expected date», «No expected date yet». cachTinh noi dung gia dinh cua muc «Lời ước, không phải cam kết». Hai co canh ngay («ước sơ bộ», «sau ngày mục tiêu») khong co chu du kien, nhung tep thiet ke chi doi chu nay tren chuoi ngay nen khong coi la loi. (2) Dat. Ba cau lyDo khong chua kit, khoi, du-bao hay gio_may; cau thu hai hoi mo ho ve «máy» va «mở việc» nhung chua toi muc dung tu noi bo. (3) Dat. Hai ngon ngu cung nghia o moi cap: ngay, ngayGon, chuaDuSoDo, quaTai, daQua, cachTinh, cachTinhKhongNgay, chuaDuSoDoMoTa, chuaCo, ba lyDo, nhan, uocLuong, gio. Lech nho nhat la «mở việc» o ban vi va «starts» o ban en, khong doi nghia.
  human_override:  # chi nguoi ghi

- eval: E12
  run_id: minted-lo-trinh-hien-ngay-du-kien-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_day
  verified_at: 2026-10-17T16:37:03Z
  output: |
    bun run test -- "cd apps/api && bun test test/ban-chup-lo-trinh.spec.ts -t ldk-gio-may"
    test-run: dropped crm_mvcmdl2teyxr_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-17T16:37:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval khong-phan-biet (pass tren ca HEAD lan baseline): khong co. Lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: ket qua REJECT — E9 (do man) va hai lenh suite (test app + @crm/ui, lint) do; nhat sua sau do va ban hai bai canh nhan, dinh dang du lieu mau, sau phep do yeu, anh do man. Returned to implementation.
Round 2: E2-E9 va E12 chay lai, E1 va E10 carry-forward tu round 1, E11 do hoi dong judge; moi eval va moi lenh suite xanh, ket qua PASS.
