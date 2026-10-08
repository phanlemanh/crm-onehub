---
schema_version: 2
feature_slug: danh-sach-keo-chung
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8931c977fd7125f5d6dc676b16e127941f45b48f
human_signoff:
---

# Evidence Report: danh-sach-keo-chung

Round 2. Cả 13 eval máy và 7 lệnh suite đều đạt trên commit đã ghim. Bản sửa S4-r1 (Hoàn tác lưu trữ giai đoạn gắn với từng thông báo, phép đo khứ hồi) đã qua lại toàn bộ bộ đo.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-danh-sach-keo-chung-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_dang_luu
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 2 tests across 1 file. [782.00ms]

- eval: E2
  run_id: minted-danh-sach-keo-chung-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_loi
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 2 tests across 1 file. [839.00ms]

- eval: E3
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_hoan_tac
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 3 tests across 1 file. [951.00ms]

- eval: E4
  run_id: minted-danh-sach-keo-chung-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsk_do_man
  verified_at: 2026-10-08T05:58:50Z
  screenshot: evidence/E4-step1.png
  observed: |
    sap-giai-doan-1440.png: trang Giai doan thoa thuan (admin Ada), nhom "Dang mo" thu tu Qualified to buy, Demo booked, Decision maker in, Contract sent (giai doan thu hai da len dau); tay keo hien tung hang; toast xanh "Đã lưu thứ tự mới" kem nut "Hoàn tác" o goc duoi trai (bi cat mot phan o mep duoi, van doc duoc). hoan-tac-giai-doan-1440.png: cung trang, thu tu Qualified to buy truoc Demo booked (khop thu tu truoc lan keo nay), toast mo dan "Đã trả thứ tự cũ" o mep duoi. sap-to-chuc-1440.png: trang Tổ chức ?don=goc, "Bộ phận · 2": "Đo E3 muz4mn84 bộ phận 1" len truoc "bộ phận 0"; toast "Đã lưu thứ tự mới" + nut "Hoàn tác" (cat mot phan o mep duoi). hoan-tac-to-chuc-1440.png: thu tu bo phan 1 truoc bo phan 0 (= truoc lan keo), toast "Đã trả thứ tự cũ" mo dan. Ba anh con lai: luu-tru-khoi-phuc-1440 co toast "Đã lưu trữ «...»." voi "Hoàn tác" va "Đã khôi phục ...", hoan-tac-luu-tru-1440 giai doan lai o vi tri cuoi nhom Dang mo, da-luu-tru-375 khong tran ngang, nut "Khôi phục" nam trong khung 375. Tat ca khop Expected.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-danh-sach-keo-chung-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_luu_loi
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 7 tests across 2 files. [1.74s]

- eval: E6
  run_id: minted-danh-sach-keo-chung-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsk_mot_thanh_phan
  verified_at: 2026-10-08T05:58:50Z
  output: |
    0 import SortableList truc tiep; SortableSaveList o giai-doan/giai-doan-settings.tsx, organization/danh-sach-keo.tsx

- eval: E7
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_gd_luu_tru_ngay
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 6 tests across 1 file. [1279.00ms]

- eval: E8
  run_id: minted-danh-sach-keo-chung-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_gd_luu_tru_chuyen
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 1 test across 1 file. [784.00ms]

- eval: E9
  run_id: minted-danh-sach-keo-chung-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_gd_da_luu_tru
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 4 tests across 1 file. [1020.00ms]

- eval: E10
  run_id: minted-danh-sach-keo-chung-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_api_khoi_phuc
  verified_at: 2026-10-08T05:58:50Z
  output: |
    test-run: dropped crm_muz4m989e9ur_test

- eval: E11
  run_id: minted-danh-sach-keo-chung-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsk_do_man
  verified_at: 2026-10-08T05:58:50Z
  screenshot: evidence/E11-step1.png
  observed: |
    luu-tru-khoi-phuc-1440.png (E11-step1): khung 1440x900, trang Cai dat > Giai doan thoa thuan, the "Đang mo" co 5 hang: Qualified to buy (8), Demo booked (5), Decision maker in (2), Contract sent (5), va hang cuoi "Đo E3 muz4n3i6 khôi phục" (0 thoa thuan) — dung la giai doan vua khoi phuc, o cuoi the. Khong co hop hoi nao tren man. Goc duoi trai co hai toast chong: "Đã lưu trữ «Đo E3 muz4n3i6 khôi phục»." kem nut "Hoàn tác" va "Đã khôi phục «…»" phia sau. Khop Expected (hang cuoi the Dang mo la giai doan vua khoi phuc). hoan-tac-luu-tru-1440.png (E11-step2): cung bo cuc 1440, the "Đang mo" chi 5 hang (Qualified, Demo booked, Decision maker in, Contract sent, "Đo E3 muz4n3i6 khôi phục"), KHONG thay hang "Đo E3 muz4n3i6 hoàn tác" o vi tri 2; chi con vet toast "Đã khôi phục «…»" rat mo o day trang — day la khung chup luc toast vua hien, truoc khi tai lai; Expected vi tri thu 2 chi duoc xac nhan bang dong log sau tai lai (truoc == sau, hang rieng o vi tri 2), khong thay trong anh. da-luu-tru-375.png (E11-step3): khung 375x812, trang cuon xuong cuoi; phan "Đã lưu trữ (1)" dang mo (mui ten xuong), hang "E3 muz4n3i6 375 / ... mo" nam gon trong 375 khong tran ngang, nut ben phai doc la "Khôi ph..." nam sat mep phai trong khung; hai nut noi goc duoi (chỉ báo "N" ben trai, tron cay co ben phai) che mot phan chu cua nut nhung khong lam tran trang. Khop Expected ve khong tran ngang va hop gap trong khung; do hinh hoc left 272 / right 346 xac nhan nut nam tron trong 375.
  network_observed: n-a (driver)

- eval: E12
  run_id: ""
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dsk_hoi_quy
  verified_at: 2026-10-08T05:58:50Z
  output: |
    Ran 43 tests across 4 files. [4.43s]

- eval: E13
  run_id: minted-danh-sach-keo-chung-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dsk_san_thiet_ke
  verified_at: 2026-10-08T05:58:50Z
  output: |
    KET LUAN: khong P0

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

- cmd: bunx turbo run lint --force
  run_id: minted-danh-sach-keo-chung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

- cmd: bun run lint:slop
  run_id: minted-danh-sach-keo-chung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

- cmd: bunx turbo run build --force
  run_id: minted-danh-sach-keo-chung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-08T05:58:50Z

## Known limits

## Ngoài hợp đồng

## Analyst

Carried từ round 1 — baseline không đo lại round này (evals.yaml không đổi từ lần đo baseline cuối); trường baseline của từng khối eval ghi n-a.

Eval không phân biệt (đạt trên cả HEAD lẫn baseline, theo kết quả round 1): E12 — hồi quy bốn tệp kiểm cũ, là regression-guard có chủ ý (đòi không sửa kỳ vọng của bốn tệp, nên đạt trên cả code cũ là đúng thiết kế). Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval máy nào đỏ; vòng bị REJECT vì review có 1 phát hiện mức high trong hợp đồng (AC-7): nút Hoàn tác của toast lưu trữ giai đoạn chỉ dùng được một lần, kèm 6 phát hiện thước đo mức medium/low trong hợp đồng (E5, E7, E9, E10). Returned to implementation.
Round 2: 13 eval máy và 7 lệnh suite đạt trên commit 8931c977; bản sửa S4-r1 làm Hoàn tác lưu trữ gắn với từng thông báo và thêm phép đo khứ hồi; review không còn phát hiện trong hợp đồng. Bản đồ run_id của E3, E7, E12 ghi chuỗi rỗng, chép nguyên văn từ bản đồ.
