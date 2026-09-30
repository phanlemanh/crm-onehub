---
schema_version: 2
feature_slug: sua-an-chu-ky-okr
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ba2e1e0216db4aa24182255fd41f3f9501cbb135
human_signoff:
---

# Evidence Report: sua-an-chu-ky-okr

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
| E9 | AC-8 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | ui-check | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-12 | judgment | UNCERTAIN |
| E18 | AC-13 | script | PASS |
| E19 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-sua-an-chu-ky-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_viec
  verified_at: 2026-09-30T10:49:00Z
  output: |
    cd packages/validation && bun test test/okr-chu-ky-viec.spec.ts
    Ran 52 tests across 1 file. [30.00ms]

- eval: E2
  run_id: minted-sua-an-chu-ky-okr-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_cycles
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t cycles-viec
    test-run: dropped crm_munzgyuqsnon_test

- eval: E3
  run_id: minted-sua-an-chu-ky-okr-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_sua_moi_o
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t sua-moi-o
    test-run: dropped crm_munzgylu3a1m_test

- eval: E4
  run_id: minted-sua-an-chu-ky-okr-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_sua_ten
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t sua-ten
    test-run: dropped crm_munzgyvkxp1t_test

- eval: E5
  run_id: minted-sua-an-chu-ky-okr-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_go
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t go-chu-ky
    test-run: dropped crm_munzgz0i6sd2_test

- eval: E6
  run_id: minted-sua-an-chu-ky-okr-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_an_hien
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t an-hien
    test-run: dropped crm_munzgywf9ny5_test

- eval: E7
  run_id: minted-sua-an-chu-ky-okr-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_pham_vi
  verified_at: 2026-09-30T10:49:00Z
  output: |
    vai-chi-okr.spec.ts -t ma-tran va okr-sua-an-chu-ky.spec.ts -t quyen
    test-run: dropped crm_munzgyz8wer7_test

- eval: E8
  run_id: minted-sua-an-chu-ky-okr-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_ky_mac_dinh
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t ky-mac-dinh
    test-run: dropped crm_munzgyl59wlt_test

- eval: E9
  run_id: minted-sua-an-chu-ky-okr-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_an_vang_api
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t an-vang
    test-run: dropped crm_munzgy74nxaz_test

- eval: E10
  run_id: minted-sua-an-chu-ky-okr-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_an_vang_nen
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-nhac, okr-chup, okr-dich-can-chinh integration -t ky-an
    test-run: dropped crm_munzgysijcmn_test

- eval: E11
  run_id: minted-sua-an-chu-ky-okr-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sac_soi_ky_con_hien
  verified_at: 2026-09-30T10:49:00Z
  output: |
    soi-ma.mjs --ca ky-con-hien
    vi pham: 0

- eval: E12
  run_id: minted-sua-an-chu-ky-okr-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_giai_ky
  verified_at: 2026-09-30T10:49:00Z
  output: |
    cd apps/app && bun test test/okr-giai-ky-an.spec.ts
    Ran 3 tests across 1 file. [30.00ms]

- eval: E13
  run_id: minted-sua-an-chu-ky-okr-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_bang_dom
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.dom.tsx
    Ran 12 tests across 1 file. [2.24s]

- eval: E14
  run_id: minted-sua-an-chu-ky-okr-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.sac_man_chrome
  verified_at: 2026-09-30T10:49:00Z
  screenshot: evidence/E14-step1.png
  observed: |
    Da mo bang Read tung frame E14-step1..17 (1440x900 dark, tru 7 va 11 la 390):
    1 menu Nam 2027 (Y): Sua chu ky; An chu ky (mo, xam) kem «Con 2 quy dang hien — an hoac go quy truoc»; Chuyen sang Dang chay. Bang co 6 hang, hang cuoi Quy 3/2025 «Da an» kem dong «An 30 thg 9, 2026 luc pha Lap ke hoach · Mo trung voi quy da co».
    2 menu Quy 2/2027 (T, lap ke hoach): Sua chu ky, Go chu ky, Chuyen sang Dang chay — dung tap.
    3 menu Quy 1/2027 (D, dang chay): Sua chu ky, An chu ky, Mo ra giua ky, Sang cham diem — dung.
    4 menu Nam 2025 (N): Sua chu ky, An chu ky bi tat kem «Con 1 quy dang hien — an hoac go quy truoc», Chuyen sang Dang chay — dung.
    5 menu Quy 4/2025 (DD, Da dong): Go chu ky, Mo lai ky — dung.
    6 menu Quy 3/2025 (A, Da an, hang cuoi): chi «Hien lai» — dung.
    7 (390) menu D mo trong bang cuon ngang noi bo; trang khong tran (script scrollWidth ok); menu day du 4 muc.
    8 sheet «Sua Quy 2/2027 doi lich ...»: mo ta «chua co du lieu — sua duoc moi o tru loai va nam», Loai/Thuoc nam mo xam, Ten «Quy 2/2027 doi lich ...», Ngay cuoi 15 thg 6, 2027, Ngay cap nhat tuan Thu Tu, nut Luu bat.
    9 sau Luu: toast xanh «Da sua Quy 2/2027 doi lich snzi8ly.», bang hien ten moi va Den 15 thg 6, 2027.
    10 sheet sua D: mo ta «da co du lieu — chi sua duoc ten. Ngay, khoang nghi va ngay cap nhat tuan giu nguyen...»; chi o Ten sang (dang focus, chu boi xanh), Ngay dau/cuoi, Nghi tu/den, Ngay cap nhat tuan (Thu Hai) deu mo xam; dong giai thich «Khoa vi chu ky da co du lieu. Sai ngay thi an chu ky nay roi mo chu ky dung.»; Luu tat (chua doi) — khong co dau hieu «o ngay con bat».
    11 (390) cung sheet, xep doc, o ngay xam, Luu/Huy o duoi, khong tran ngang.
    12 hop «Go Quy 2/2027 doi lich ...?» noi «chua co muc tieu, lan hoi y hay quy nao. Go xong chu ky bien khoi bang; vet tao va go van con trong so vet.», nut Huy va nut «Go chu ky» mau do (tong huy).
    13 hop «An Quy 1/2027 doi tac ...?», o «Ly do an» trong, «Tu 10 den 500 ky tu», nut «An chu ky» mo/tat khi trong.
    14 sau xac nhan: toast «Da an Quy 1/2027 doi tac ...», bang con 5 hang (T da go); D nam trong nhom «Da an» o cuoi (dong «An 30 thg 9, 2026 luc pha Dang chay · Mo nham quy doi tac.»), dung truoc A — ca hai hang da an o cuoi bang.
    15 khu OKR > Theo don vi, o chon ky mo: Nam 2025, Quy 4/2025 (hien tai · da dong, dang chon), Nam 2027 — khong co Quy 1/2027 doi tac (D) va khong co Quy 3/2025 (A).
    16 sau Hien lai: toast «Da hien lai Quy 1/2027 doi tac ...», D len dong 2 (Dang chay), roi nhom cuoi; cuoi bang chi con A (Da an).
    17 dang nhap Le Van Thuong (LV): tat ca nut «…» va nut «Mo chu ky» mo xam (disabled), Cau hinh khong sua duoc; dong giai thich «Chi quan tri doi duoc cau hinh chuong trinh.» ngay duoi tieu de. Chu tren man khop tep chu (script doi chieu okrMessages vi). Toan bo khop Expected; luu y nho: buoc 7 D nam o nhom «Da an» cuoi bang (truoc A) chu khong dung chot cuoi cung — coi la khop vi ca hai hang da an xep cuoi.
  network_observed: n-a (driver)
  output: |
    Frames da luu (copy tu .acceptance-runs/sua-an-chu-ky-okr/evidence/): E14-step1..17.png = buoc-menu-y, menu-t, menu-d, menu-n, menu-dd, menu-a, menu-390, sua-moi-o-dien, sua-moi-o, sua-chi-ten, sua-chi-ten-390, go, an-ly-do, an-xong, o-chon, hien-lai, thanh-vien.
    Thu muc: _acceptance/sua-an-chu-ky-okr/evidence/ (ban goc cung o .acceptance-runs/sua-an-chu-ky-okr/evidence/).
    Network: driver puppeteer tu ghi man-sua-an-network.txt (chep thanh E14-network.txt), file rong; khong doc duoc traffic app-scope tu tool nay nen khai n-a (driver). Khong lam eval fail.
    Ghi chu: chieu do (--chieu-do) khong duoc yeu cau chay trong lan nay; khong sua code.

- eval: E15
  run_id: minted-sua-an-chu-ky-okr-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sac_man_chrome
  verified_at: 2026-09-30T10:49:00Z
  output: |
    tien-de.mjs --chay "bun _acceptance/sua-an-chu-ky-okr/rang/man-sua-an.mjs"
    phien-do: xong — mã 0

- eval: E16
  run_id: minted-sua-an-chu-ky-okr-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sac_san_thiet_ke
  verified_at: 2026-09-30T10:49:00Z
  output: |
    soi-ma.mjs --ca thiet-ke
    vi pham: 0

- eval: E18
  run_id: minted-sua-an-chu-ky-okr-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.sac_migration_chi_them
  verified_at: 2026-09-30T10:49:00Z
  output: |
    kho tam crm_akc_mig_98801: 123 bang cu (35 bang okr), gieo okrCycle=3 okrObjective=1 okrKeyResult=1 okrCheckInSession=1 okrCheckIn=1; sau migration: okrCycle=3 dong, anLuc khac NULL=0; bang moi: (khong co)

- eval: E19
  run_id: minted-sua-an-chu-ky-okr-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.sac_dong_thoi
  verified_at: 2026-09-30T10:49:00Z
  output: |
    okr-sua-an-chu-ky.spec.ts -t dong-thoi
    test-run: dropped crm_munzh9nkpetg_test

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-sua-an-chu-ky-okr-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-30T10:49:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-sua-an-chu-ky-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-30T10:49:00Z

- cmd: bun run lint:slop
  run_id: minted-sua-an-chu-ky-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-30T10:49:00Z

- cmd: bunx turbo run build --force
  run_id: minted-sua-an-chu-ky-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-30T10:49:00Z

### Hội đồng judgment (đề xuất — chờ người chốt)

Panel đề xuất cho E17: ba góc nhìn domain-correctness, operational-feasibility, spec-alignment. Cả ba đều chưa có mã hay diff thật trong danh sách input (chỉ design doc, hợp đồng, design-pass), nên đề xuất tổng hợp là UNCERTAIN; người quyết ở Cổng 2 sau khi đối chiếu diff thật.

- domain-correctness: UNCERTAIN — Ba tệp được phép đọc chỉ nêu luật và ý định (một hàm viecChuKy, hằng KY_CON_HIEN, dựng bằng ConfirmDialog/Sheet/DropdownMenu, chữ hệ quả ở mục «Màn»). Không tệp nào chứa mã hay bản dựng thật, nên không đủ căn cứ nói mã có đúng luật hay không.
- operational-feasibility: UNCERTAIN — Ba tệp chỉ mô tả ý định; không có diff hay mã thật trong danh sách input nên không xác nhận được việc thực thi đúng ý định. Design-pass còn ghi một finding chờ Gate 1 về DatePicker thiếu disabled.
- spec-alignment: UNCERTAIN — Không thấy viecChuKy có được màn và bốn thủ tục gọi chung không, đầu vào có parse bằng Zod không, KY_CON_HIEN có mặt ở mọi nơi tìm chu kỳ không, menu/sheet/hộp ẩn có dựng bằng packages/ui không, chữ trên màn có nói đúng hệ quả ẩn/gỡ không. Đoán từ đặc tả là suy diễn.

- eval: E17
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Cả ba góc nhìn chỉ có đặc tả, không có diff hay mã thật của lượt này, nên không xác nhận được năm vế của AC-12 (một định nghĩa viecChuKy dùng chung, parse Zod ở biên, KY_CON_HIEN mọi nơi tìm chu kỳ, dựng bằng packages/ui, chữ hệ quả đúng).
  required_evidence:
    - Mã viecChuKy ở packages/validation/src/okr-chu-ky.ts và các chỗ gọi (okr.cycles, suaChuKy, goChuKy, anChuKy, hienChuKy trong apps/api/src/okr/okr.service.ts) cùng bảng cờ viec ở apps/app; lệnh git diff origin/onehub -- packages/validation apps/api/src/okr apps/app; cần đúng một định nghĩa và không có phép tính cờ nào khác.
    - Đầu ra soi-ma.mjs --ca ky-con-hien (mã thoát 0) cùng _acceptance/sua-an-chu-ky-okr/rang/noi-doc-chu-ky.json, chứng minh mọi chỗ nhóm «lọc» có KY_CON_HIEN và hằng này chỉ định nghĩa một chỗ ở packages/db.
    - Các khuôn Zod đầu vào mới (suaChuKyInput, đầu vào goChuKy/anChuKy/hienChuKy) và chỗ router parse chúng (grep -n suaChuKyInput apps/api/src); xác nhận không có Record<string, unknown> trên các tệp đổi.
    - Tệp màn thật (bang-chu-ky.tsx, sheet sửa, hộp ẩn) hoặc ảnh chụp từ phép đo tien-de.mjs ở _acceptance/sua-an-chu-ky-okr/evidence/, cho thấy ConfirmDialog, Sheet, DropdownMenu, DialogClose từ @crm/ui và chữ hộp «Ẩn»/«Gỡ» đúng mục «Màn» của design doc; kết quả cổng thiết kế tĩnh và lint:slop sạch.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đạt (E1-E16, E18, E19); E17 (judgment) UNCERTAIN chờ người chốt ở Cổng 2. Không lệnh fail nào ngoài eval; không finder chết.
