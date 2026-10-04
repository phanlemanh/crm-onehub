---
schema_version: 2
feature_slug: thanh-vien-vao-dung
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0db7a0d75b00d007a3cbb59466a85d695931a0ac
human_signoff:
---

# Evidence Report: thanh-vien-vao-dung

Vòng 1. Cả 26 eval của tính năng đều xanh, nhưng lệnh suite hồi quy `bun run test -- --filter=api` đỏ ở một ca không gắn eval nào (`vai-chi-okr > ghi-chung`). Nên tổng thể là REJECT, `failed_evals` để rỗng vì không eval nào đỏ.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-8 | test | PASS |
| E13 | AC-9 | test | PASS |
| E14 | AC-10 | test | PASS |
| E15 | AC-11 | test | PASS |
| E16 | AC-11 | script | PASS |
| E17 | AC-12 | ui-check | PASS |
| E18 | AC-12 | script | PASS |
| E19 | AC-13 | script | PASS |
| E20 | AC-13 | script | PASS |
| E21 | AC-13 | test | PASS |
| E22 | AC-14 | script | PASS |
| E23 | AC-14 | test | PASS |
| E24 | AC-9 | test | PASS |
| E25 | AC-1 | test | PASS |
| E26 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-thanh-vien-vao-dung-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlznjvm3jt_test

- eval: E2
  run_id: minted-thanh-vien-vao-dung-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlznjvm3jt_test

- eval: E3
  run_id: minted-thanh-vien-vao-dung-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlznjvm3jt_test

- eval: E4
  run_id: minted-thanh-vien-vao-dung-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

- eval: E5
  run_id: minted-thanh-vien-vao-dung-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlznjvm3jt_test

- eval: E6
  run_id: minted-thanh-vien-vao-dung-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

- eval: E7
  run_id: minted-thanh-vien-vao-dung-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_ten_mien_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlznjvm3jt_test

- eval: E8
  run_id: minted-thanh-vien-vao-dung-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

- eval: E9
  run_id: minted-thanh-vien-vao-dung-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    (lệnh chạy xong, đuôi đầu ra không có dòng tóm tắt)

- eval: E10
  run_id: minted-thanh-vien-vao-dung-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

- eval: E11
  run_id: minted-thanh-vien-vao-dung-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    (lệnh chạy xong, đuôi đầu ra không có dòng tóm tắt)

- eval: E12
  run_id: minted-thanh-vien-vao-dung-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    (lệnh chạy xong, đuôi đầu ra không có dòng tóm tắt)

- eval: E13
  run_id: minted-thanh-vien-vao-dung-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

- eval: E14
  run_id: minted-thanh-vien-vao-dung-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dung_lai_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlzn24mrql_test

- eval: E15
  run_id: minted-thanh-vien-vao-dung-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_soi_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlzmj5poi8_test

- eval: E16
  run_id: minted-thanh-vien-vao-dung-E16-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.r1b_soi_vat
  verified_at: 2026-10-04T09:18:27Z
  output: |
    KET LUAN: 7 DUNG, 0 SAI

- eval: E17
  run_id: minted-thanh-vien-vao-dung-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1b_do_man
  verified_at: 2026-10-04T09:18:27Z
  screenshot: evidence/the-quan-tri-1440.png   # frames: the-quan-tri-1440, the-quan-tri-375, the-loi-1440, the-thanh-vien-1440, the-thanh-vien-375, hop-da-la-thanh-vien-1440 (copies E17-step1..6.png in the same folder)
  observed: |
    the-quan-tri-1440.png: trang Thanh vien (vai quan tri). Cuoi trang co the «Tên miền nội bộ» voi mo ta, «Lưu» o goc phai tren cua the, o «Tên miền» xep doc duoi nhan chua «onehub.center, onehub.vn», chu huong dan «Ngăn bằng dấu phẩy. Không nhận tên miền thư công cộng như gmail.com.»; toast «Đã lưu tên miền nội bộ» o goc duoi trai. Khop Expected.
    the-quan-tri-375.png: man 375, the co tieu de, «Lưu» o goc phai, nhan «Tên miền» + o xep doc, chu huong dan; khong co thanh cuon ngang. Mo mo ta the khong hien o 375 (CardDescription dung chung an duoi sm, thiet ke chung).
    the-loi-1440.png: o «Tên miền» vien do, nhan do, gia tri «onehub.center, gmail.com», dong loi do ngay DUOI o «gmail.com is a public mail domain, not one of ours. Remove it and save again.», «Lưu» dang bat. Khop Expected.
    the-thanh-vien-1440.png: vai thanh vien: o xam bi khoa chua onehub.center, onehub.vn, «Lưu» khoa, dong ly do «Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ.» doc duoc. the-thanh-vien-375.png: cung trang thai, khong tran ngang. Khop Expected.
    hop-da-la-thanh-vien-1440.png: hop «Cho phép một địa chỉ» van mo, o email «MARCUS@TRYCOMP.AI» vien do, dong loi do duoi o «That person is already a member. Change their role in the members table.», nut «Thôi» va «Cho phép» van o do. Khop Expected.
  network_observed: n-a (driver)
  output: |
    KET LUAN: 17 DUNG, 0 SAI
    DUNG 1440 luu -> DB staffEmailDomains = onehub.center,onehub.vn (go chuoi AC-1 roi bam Luu)
    DUNG 375 quan tri tran ngang 0px; DUNG 375 thanh vien tran ngang 0px
    DUNG 1440 loi duoi o gmail.com, cot van onehub.center,onehub.vn
    DUNG 1440 hop giu mo, thong diep «That person is already a member...»
    DUNG don: cot staffEmailDomains tra ve null (truoc null)

- eval: E18
  run_id: minted-thanh-vien-vao-dung-E18-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.r1b_san_thiet_ke
  verified_at: 2026-10-04T09:18:27Z
  output: |
    design-gate static chạy xong trên cả ba tệp (page.tsx, cho-phep-dia-chi.tsx, ten-mien-noi-bo.tsx); đuôi đầu ra chỉ còn dấu đóng khối báo cáo.

- eval: E19
  run_id: minted-thanh-vien-vao-dung-E19-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tvhk_do_khoi
  verified_at: 2026-10-04T09:18:27Z
  output: |
    phien-do: xong

- eval: E20
  run_id: minted-thanh-vien-vao-dung-E20-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tvhk_ttv_do_bang
  verified_at: 2026-10-04T09:18:27Z
  output: |
    phien-do: xong

- eval: E21
  run_id: minted-thanh-vien-vao-dung-E21-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1b_khong_hoi_quy_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    test-run: dropped crm_mutlznyydxpg_test

- eval: E22
  run_id: minted-thanh-vien-vao-dung-E22-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.r1b_tu_dien
  verified_at: 2026-10-04T09:18:27Z
  output: |
    KET LUAN: 9 DUNG, 0 SAI

- eval: E23
  run_id: minted-thanh-vien-vao-dung-E23-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.r1b_messages_guard
  verified_at: 2026-10-04T09:18:27Z
  output: |
    (lệnh chạy xong, đuôi đầu ra không có dòng tóm tắt)

- eval: E24
  run_id: minted-thanh-vien-vao-dung-E24-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_cho_phep_api
  verified_at: 2026-10-04T09:18:27Z
  output: |
    (lệnh chạy xong, đuôi đầu ra không có dòng tóm tắt)

- eval: E25
  run_id: minted-thanh-vien-vao-dung-E25-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

- eval: E26
  run_id: minted-thanh-vien-vao-dung-E26-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.r1b_dom
  verified_at: 2026-10-04T09:18:27Z
  output: |
    Ran 15 tests across 1 file. [3.36s]

### Lệnh suite (hồi quy)

Lệnh đỏ không gắn eval nào: `bun run test -- --filter=api`. Đuôi đầu ra ghi một ca đỏ, `vai-chi-okr > ghi-chung: okr chi ghi duoc thu cua minh; cau hinh he thong doi quan tri`, với 1553 ca xanh, 3 ca bỏ qua, 1 ca đỏ trên 162 tệp. Không eval nào của tính năng phủ ca này, nên `failed_evals` rỗng; người quyết xem nguyên nhân ở `review-findings.md`.

- cmd: bun run test -- --filter=api
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  verified_at: 2026-10-04T09:18:27Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-04T09:18:27Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-04T09:18:27Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-04T09:18:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-thanh-vien-vao-dung-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-04T09:18:27Z

- cmd: bun run lint:slop
  run_id: minted-thanh-vien-vao-dung-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-04T09:18:27Z

- cmd: bunx turbo run build --force
  run_id: minted-thanh-vien-vao-dung-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-04T09:18:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả nhánh lẫn baseline diffBase, chứng minh bộ đo chứ không chứng minh tính năng; hoặc là bảo vệ hồi quy có chủ ý):

- E19 (AC-13): thước đã ký `thanh-vien-hai-khoi-cung-khuon`, xanh cả hai phía. Bảo vệ hồi quy có chủ ý.
- E20 (AC-13): thước đã ký `bang-thanh-vien-giu-hang`, xanh cả hai phía. Bảo vệ hồi quy có chủ ý.
- E21 (AC-13): `domain-nha-tach`, `workspace-thanh-vien`, `go-thanh-vien`, xanh cả hai phía. Bảo vệ hồi quy có chủ ý.
- E23 (AC-14): `messages-guard.spec.ts`, xanh cả hai phía. Bảo vệ hồi quy có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ; lệnh suite hồi quy `bun run test -- --filter=api` đỏ ở ca `vai-chi-okr > ghi-chung` (thao tác `workspace.setStaffDomains` chưa được khai trong danh sách đầu vào hợp lệ của tệp kiểm vai OKR). Verdict REJECT, trả về bước cài đặt.
