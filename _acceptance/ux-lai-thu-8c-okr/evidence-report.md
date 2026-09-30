---
schema_version: 2
feature_slug: ux-lai-thu-8c-okr
verdict: REJECT
failed_evals: ["E4","E15"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8af70847137401e0091d86b2b722b3fa07c4a768
human_signoff:
---

# Evidence Report: ux-lai-thu-8c-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | FAIL |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-8 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | ui-check | FAIL |

## Evidence

- eval: E1
  run_id: minted-ux-lai-thu-8c-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.u8d_danh_sach
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t danh-sach"
    chay 1 lan, dat 1/1

- eval: E2
  run_id: minted-ux-lai-thu-8c-okr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bon bai dom (okr-theo-don-vi, okr-tai-co-cau, chuyen-okr, okr-gioi-han-duyet) chay lien tiep bang bun test
    Ran 20 tests across 1 file. [1.89s]

- eval: E3
  run_id: minted-ux-lai-thu-8c-okr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cung lenh voi E2 (bon bai dom), chay 1 lan, dat 1/1
    Ran 20 tests across 1 file. [1.89s]

- eval: E4
  run_id: minted-ux-lai-thu-8c-okr-E4-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.u8d_go_nguoi
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t go-nguoi"
    error: regex "go-nguoi" matched 0 tests. Searched 1 file (skipping 7 tests) [2.32s]
    test-run: dropped crm_munmhslaunjx_test
    Cau loc -t go-nguoi khong khop ca nao trong okr-ux-8d.spec.ts, nen khong ca nao chay; ca dem transferPreview cua AC-3 chua duoc do.

- eval: E5
  run_id: minted-ux-lai-thu-8c-okr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cung lenh voi E2 (bon bai dom), chay 1 lan, dat 1/1
    Ran 20 tests across 1 file. [1.89s]

- eval: E6
  run_id: minted-ux-lai-thu-8c-okr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cung lenh voi E2 (bon bai dom), chay 1 lan, dat 1/1
    Ran 20 tests across 1 file. [1.89s]

- eval: E7
  run_id: minted-ux-lai-thu-8c-okr-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.u8d_luu_tru
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t luu-tru"
    Ran 1 test across 1 file. [3.79s]
    test-run: dropped crm_munmhsvp2rtg_test

- eval: E8
  run_id: minted-ux-lai-thu-8c-okr-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.u8d_chuyen_xem_truoc
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t chuyen-xem-truoc"
    test-run: dropped crm_munmhsq8k3bw_test

- eval: E9
  run_id: minted-ux-lai-thu-8c-okr-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cung lenh voi E2 (bon bai dom), chay 1 lan, dat 1/1
    Ran 20 tests across 1 file. [1.89s]

- eval: E10
  run_id: minted-ux-lai-thu-8c-okr-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.u8d_dem_don_vi
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t dem-don-vi"
    chay 1 lan, dat 1/1

- eval: E11
  run_id: minted-ux-lai-thu-8c-okr-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.u8d_nguoi_duyet
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t nguoi-duyet"
    test-run: dropped crm_munmhs7hkq4e_test

- eval: E12
  run_id: minted-ux-lai-thu-8c-okr-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.u8d_tra_lai_truoc
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cmd: bun run test -- "cd apps/api && bun test test/okr-ux-8d.spec.ts -t tra-lai-truoc"
    chay 1 lan, dat 1/1

- eval: E13
  run_id: minted-ux-lai-thu-8c-okr-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cung lenh voi E2 (bon bai dom), chay 1 lan, dat 1/1
    Ran 20 tests across 1 file. [1.89s]

- eval: E14
  run_id: minted-ux-lai-thu-8c-okr-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.u8d_dom
  verified_at: 2026-09-30T04:45:46Z
  output: |
    cung lenh voi E2 (bon bai dom), chay 1 lan, dat 1/1
    Ran 20 tests across 1 file. [1.89s]

- eval: E15
  run_id: minted-ux-lai-thu-8c-okr-E15-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.u8d_man_chrome
  verified_at: 2026-09-30T04:45:46Z
  screenshot: evidence/E15-danh-sach-gioi-han-1440.png
  observed: |
    1440 danh-sach-gioi-han: tree trai co "Phap che 3 muc tieu" duoc chon, the «Xu ly dut diem cac tranh chap hop dong dang mo» co chip «Cam ket», «Da cong bo», «Gioi han» (o khoa). 390 danh-sach-gioi-han: dropdown "Phap che", the o tren; KHONG thay chip «Gioi han» hay cay ghi 3 trong khung. theo-don-vi-dang-tai 1440/390: tieu de «Kho van», dong «Dang tai OKR...» va 3 khung xuong, cay/dropdown khong ghi «chua dat» trong vung noi dung dang tai (cay ben trai van co «chua dat» cho don vi khac o 1440, khong thuoc vung tai). gui-duyet-khoa 1440/390: sheet muc tieu nhap «Khach ban le mien Bac quay lai mua gnmir2d», dong «Them it nhat mot KR truoc khi gui duyet.», nut Gui duyet mo, bang KR trong. gui-duyet-hoi 1440/390: hop «Gui muc tieu nay di duyet?» ... «Tran Quoc Bao se duyet.» voi nut Huy/Gui di duyet, khong tran. cong-bo-phu: nut «Cong bo» dang vien (khong fill), dai canh bao cam «Tran Quoc Bao tra lai · 30/09» + ly do «Them KR do doanh thu tu khach quay lai gnmir2d». tra-lai-truoc: dai «Nguyen Thi Lan gui duyet · 30/09», «Lan truoc ban tra lai · 30/09: Them KR do doanh thu...», nut Duyet va cong bo / Tra lai…. vet-tra-lai: tab Vet 5 dong, dong «Tra lai» cua Tran Quoc Bao kem ly do, «Trang thai: Cho duyet → Nhap». luu-tru-hai-dieu-kien 1440: hop «Luu tru «Kinh doanh mien Bac»?», «Chua luu tru duoc», «Con 5 nguoi co phong ban chinh o day», «Phong ban con 3 muc tieu OKR o chu ky chua dong», nut Chuyen OKR…, Luu tru mo nhat. luu-tru-390 = chuyen-vuot-tran-390 (giong het): chi sheet phong ban, khong co hop. chuyen-vuot-tran 1440: hop «Chuyen OKR» chon Kinh doanh mien Nam, canh bao cam «se co 6 muc tieu trong mot chu ky — vuot tran 4 cua chuong trinh», 3 muc tieu duoc tick. go-nguoi-co-okr 1440/390: hop «Go nguoi nay?», canh bao «Nguoi nay dang phu trach 2 KR va 0 muc tieu o ky dang mo — chuyen OKR truoc...», nut Thoi/Chuyen OKR…/Go (khong bam).
  network_observed: n-a (driver)
  output: |
    cmd: EVAL=E15 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs"
    Script tu kiem: man-ux-8d: 101 khang dinh, 0 hong, 20 anh (75 s), phien do rieng, da tat sach.
    Doi chieu anh voi expected (viec cua nguoi chay, khong tin ket qua thoat cua script), 3 diem lech:
    1) E15-luu-tru-hai-dieu-kien-390.png va E15-chuyen-vuot-tran-390.png giong het byte; ca hai chi hien ngan phong ban, khong co hop nen thieu «con 3 muc tieu», «con 5 nguoi» va canh bao tran o kho 390.
    2) E15-chuyen-vuot-tran-1440.png: canh bao ghi «vuot tran 4», expected khai tran 5 va cau «o Quy 4»; script dat tran = soNam+1 = 4 va chi dat lai 5 sau khi chup.
    3) E15-danh-sach-gioi-han-390.png: khung 390 khong co nhan «Gioi han» tren the va cay Phap che khong hien.
    Dat: danh-sach-gioi-han-1440, theo-don-vi-dang-tai (1440, 390), gui-duyet-khoa, gui-duyet-hoi, cong-bo-phu, tra-lai-truoc, vet-tra-lai (moi cai 1440 va 390), luu-tru-hai-dieu-kien-1440, go-nguoi-co-okr (1440, 390).
    scrollWidth <= clientWidth o 390 do script khang dinh, khong do lai doc lap. Network: evidence/E15-network.txt (khong request that bai).

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-ux-lai-thu-8c-okr-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-30T04:45:46Z

- cmd: bunx turbo run lint --force
  run_id: minted-ux-lai-thu-8c-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-30T04:45:46Z

- cmd: bun run lint:slop
  run_id: minted-ux-lai-thu-8c-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-30T04:45:46Z

- cmd: bunx turbo run build --force
  run_id: minted-ux-lai-thu-8c-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-30T04:45:46Z

Lệnh fail không gắn eval: không có. Hai lệnh đỏ đều gắn eval: lệnh của E4 (câu lọc `-t go-nguoi` không khớp ca nào trong `apps/api/test/okr-ux-8d.spec.ts`) và bước ui-check của E15.

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4, E15 failed — E4: câu lọc `-t go-nguoi` không khớp ca nào trong okr-ux-8d.spec.ts (bài đếm transferPreview chưa chạy); E15: ba lệch giữa ảnh và expected (hai ảnh 390 giống hệt byte không có hộp; cảnh báo trần ghi 4 thay vì 5; ảnh 390 danh-sach-gioi-han thiếu nhãn Giới hạn). Returned to implementation.
