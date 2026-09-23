---
schema_version: 2
feature_slug: tieu-de-cot-doc-tron
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e14252d466ea31b3e803fa1b2099c06d025bdbd5
human_signoff:
---

# Evidence Report: tieu-de-cot-doc-tron

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-tieu-de-cot-doc-tron-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-tieu-de-cot-doc-tron-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E3
  run_id: minted-tieu-de-cot-doc-tron-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E4
  run_id: minted-tieu-de-cot-doc-tron-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E5
  run_id: minted-tieu-de-cot-doc-tron-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E6
  run_id: minted-tieu-de-cot-doc-tron-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E7
  run_id: minted-tieu-de-cot-doc-tron-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_tieu_de_cot
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E8
  run_id: minted-tieu-de-cot-doc-tron-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdc_doi_chung_ke_hoach
  verified_at: 2026-09-23T00:05:57Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E9
  run_id: minted-tieu-de-cot-doc-tron-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-23T00:05:57Z
  screenshot: _acceptance/tieu-de-cot-doc-tron/evidence/E9/deals-320-vi.png
  observed: |
    Đã mở cả 12 file trong evidence/E9 bằng Read (đọc ảnh trực tiếp), đối chiếu 3 dòng Expected cho từng ảnh:

    deals-320-vi.png: header "Tên ↑↓ | Công ty ↑↓ | Giai đoạn ↑↓" đủ chữ, không «…». Cột đầu "One Mount -", "Wise — expa", "Nhà Đất Thù", "Notion — Co" — mỗi ô có ít nhất một từ tròn. Bảng chỉ hiện 3 cột vừa khung 320px, không cột nào bị khung thẻ xén.
    deals-320-en.png: header "Deal ↑↓ | Company ↑↓ | Stage ↑↓" đủ chữ. Cột đầu có từ tròn (One Mount, Wise, Nhà Đất, Notion). Không cắt mép phải.
    deals-1024-vi.png: 7 cột header đầy đủ "Tên/Công ty/Giai đoạn/Giá trị/Phụ trách/Ngày chốt/Hoạt động gần nhất" — cột cuối tự xuống dòng "Hoạt động"/"gần nhất", không «…». Cột đầu "One Mount - Triển khai", "Wise — expansion" v.v. đủ từ tròn. Bảng kết thúc gọn trong khung, không cột nào bị xén.
    deals-1024-en.png: 7 header đầy đủ, "Last activity" xuống dòng. Cột đầu đủ từ tròn. Không cắt mép.
    companies-320-vi.png: header "Tên ↑↓" đủ chữ. Cột đầu "Viet Phat Group", "Song Hong Land" v.v. đủ chữ (chỉ 1 cột, không tràn).
    companies-320-en.png: header "Company ↑↓" đủ chữ, cột đầu đủ chữ.
    companies-1024-vi.png: 7 header "Tên/Tên miền/Ngành/Phụ trách/Số lượng cá nhân/Số thoả thuận đang mở/Hoạt động gần nhất" đều xuống dòng đầy đủ, không «…». Cột đầu "Viet Phat Gro…" bị cắt nhưng "Viet Phat" là hai từ tròn hiện đủ (thoả yêu cầu ít nhất một từ tròn). Bảng không bị xén mép phải.
    companies-1024-en.png: 7 header đầy đủ ("Last activity" xuống dòng). Cột đầu có từ tròn. Không cắt mép.
    campaigns-320-vi.png: header "Tên ↑↓ | Trạng thái ↑↓ | Trả lời ↑↓" đủ chữ, "Trạng thái" xuống dòng. Cột đầu "Chiến dịch bé r" — "Chiến dịch" là từ tròn đủ hiện. Không cắt mép (chỉ 3 cột vừa khung).
    campaigns-320-en.png: header "Name/Status/Answered" đủ chữ, "Answered" xuống dòng. Cột đầu có từ tròn.
    campaigns-1024-vi.png: 7 header "Tên/Phân khúc/Trạng thái/Đã gọi/Trả lời/Phụ trách/Ngày tạo" đầy đủ, "Ngày tạo" xuống dòng. Cột đầu "Chiến dịch bé rộng ttmu3fhhhb" đủ chữ hoàn toàn. Không cắt mép.
    campaigns-1024-en.png: 7 header đầy đủ, "Created" xuống dòng. Cột đầu đủ chữ. Không cắt mép.

    Không có ảnh nào vi phạm 1 trong 3 dòng Expected → không có dòng nào không đạt.
  network_observed: n-a (driver)

- eval: E10
  run_id: design-gate-271d76a1d6, design-gate-03f9e452ed
  exit_code: 0
  baseline: green
  verifier: config:executors.script.tdc_san_thiet_ke
  verified_at: 2026-09-23T00:05:57Z
  output: |
      - p0_count: 0

    Both files passed design gate verification with no P0 violations.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mudcg1aw0ofz
  exit_code: 0
  verified_at: 2026-09-23T00:05:57Z

- cmd: bunx turbo run lint --force
  run_id: minted-tieu-de-cot-doc-tron-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-23T00:05:57Z

- cmd: bun run lint:slop
  run_id: minted-tieu-de-cot-doc-tron-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-23T00:05:57Z

- cmd: bunx turbo run build --force
  run_id: minted-tieu-de-cot-doc-tron-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-23T00:05:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

E10 (AC-1, design-gate --mode static trên packages/ui/src/components/data-table.tsx và apps/app/app/(app)/[slug]/campaigns/campaigns-table.tsx) — xanh trên cả nhánh hiện tại lẫn cây diffBase (baseline: green), tức phép đo tĩnh này không phân biệt được feature với code cũ. Cân nhắc: hoặc viết thêm assertion cho hành vi mới của tiêu đề cột, hoặc xác nhận đây là một regression-guard có chủ ý (không phải bug) cho hai tệp UI vừa sửa.

## Variance

none — không có eval nào khai runs > 1 trong vòng này (không có eval ngẫu nhiên).

## Iterations

Round 1: toàn bộ 10 eval (E1–E10) cùng bốn lệnh suite (test, lint, lint:slop, build) đều xanh ngay ở lượt xác minh đầu tiên — không có eval nào fail, không cần quay lại implementation.