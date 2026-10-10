---
schema_version: 2
feature_slug: nguon-keo-tha-reui
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1946af2d61b3416e148f07e7b21c6419a8e46d59
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: nguon-keo-tha-reui

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11u | AC-11 | ui-check | PASS |
| E12 | AC-12 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nguon-keo-tha-reui-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nkt_cai_sach
  verified_at: 2026-09-28T11:49:43Z
  output: |
    13/13 o dat

- eval: E2
  run_id: minted-nguon-keo-tha-reui-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nkt_dung_moc
  verified_at: 2026-09-28T11:49:43Z
  output: |
    kiem moc: dat

- eval: E3
  run_id: minted-nguon-keo-tha-reui-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nkt_hanh_vi_cu
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 5 tests across 1 file. [333.00ms]

- eval: E4
  run_id: minted-nguon-keo-tha-reui-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nkt_hanh_vi_cu
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 5 tests across 1 file. [333.00ms]

- eval: E5
  run_id: minted-nguon-keo-tha-reui-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nkt_hanh_vi_cu
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 5 tests across 1 file. [333.00ms]

- eval: E4b
  run_id: minted-nguon-keo-tha-reui-E4b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nkt_nut_chon
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 4 tests across 1 file. [368.00ms]

- eval: E5b
  run_id: minted-nguon-keo-tha-reui-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nkt_nut_chon
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 4 tests across 1 file. [368.00ms]

- eval: E6
  run_id: minted-nguon-keo-tha-reui-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nkt_nut_chon
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 4 tests across 1 file. [368.00ms]

- eval: E7
  run_id: minted-nguon-keo-tha-reui-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nkt_dang_keo
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 2 tests across 1 file. [353.00ms]

- eval: E8
  run_id: minted-nguon-keo-tha-reui-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_man_tai_loi
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 3 tests across 1 file. [677.00ms]

- eval: E9
  run_id: minted-nguon-keo-tha-reui-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_man_nguon_tat
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 2 tests across 1 file. [545.00ms]

- eval: E9b
  run_id: minted-nguon-keo-tha-reui-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_man_hang_nguon
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 5 tests across 1 file. [640.00ms]

- eval: E10
  run_id: minted-nguon-keo-tha-reui-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nkt_chu
  verified_at: 2026-09-28T11:49:43Z
  output: |
    Ran 1 test across 1 file. [520.00ms]

- eval: E11u
  run_id: crm_xenodochial_gould_763cda_do (phien-do session; app http://localhost:4246, api http://localhost:4189)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T11:49:43Z
  screenshot: evidence/msd-tai-1440.png
  screenshot: evidence/msd-nguon-1440.png
  screenshot: evidence/msd-tai-390.png
  screenshot: evidence/msd-nguon-390.png
  observed: |
    Đã Read trực tiếp cả 4 file ảnh đã lưu (không suy từ log):
    - msd-tai-1440.png (1440px): dialog "Tải nguồn lên" mở, có mô tả "Máy soạn đọc tệp và soạn một bản đề xuất cho một trang...", vùng kéo-thả [data-slot='nguon-keo-tha'] hiện nút "+ Chọn tệp" cùng chữ "Kéo tệp vào đây, hoặc chọn tệp — Word (.docx) hoặc PDF, tới 20 MB", radio "Trang mới" đã chọn (khớp Expected bước 1).
    - msd-nguon-1440.png (1440px, sau khi tải): tab "Nguồn" hiện đúng 1 hàng — tên tệp "quyet-dinh-hoa-hong-doi-tac.docx", cột Trang = "Quyết định hoa hồng đối tác 2026", Người tải = "Lê Thu Trang", Trạng thái = "Máy đang soạn" (đúng nhãn, không lộ mã thô), Ngày tải = 28/09/2026 (khớp Expected bước 2).
    - msd-tai-390.png (390px): cùng dialog "Tải nguồn lên" nhưng layout dồn dọc một cột, nút "Chọn tệp" + chữ kéo-thả vẫn hiện đủ, hai nút "Tải lên"/"Huỷ" xếp full-width ở cuối; toàn bộ nội dung nằm gọn trong khung 390px, không thấy dấu hiệu tràn ngang.
    - msd-nguon-390.png (390px, tab Nguồn): hiện dạng thẻ (card) thay cho bảng — tên tệp, tên trang đích, ngày, trạng thái "Máy đang soạn" đều đọc được, gọn trong khung 390px, không tràn ngang.
    Không có frame nào mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-nguon-keo-tha-reui-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_san_thiet_ke
  verified_at: 2026-09-28T11:49:43Z
  output: |
    design-gate --mode static: mọi tệp tsx của khu tài liệu và packages/ui/src/components/nguon-*.tsx được in tên đã đạt

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-nguon-keo-tha-reui-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T11:49:43Z

- cmd: bunx turbo run lint --force
  run_id: minted-nguon-keo-tha-reui-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T11:49:43Z

- cmd: bun run lint:slop
  run_id: minted-nguon-keo-tha-reui-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T11:49:43Z

- cmd: bunx turbo run build --force
  run_id: minted-nguon-keo-tha-reui-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T11:49:43Z

## Known limits

## Ngoài hợp đồng

## Analyst

E3, E4, E5 (cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/nguon-canh-nhau.dom.tsx -t NguonKeoTha) — pass trên cả HEAD và baseline: khối describe này chạy nguyên văn hành vi cũ chưa đổi ở vòng này, nên là regression-guard có chủ ý cho hành vi hộp tải sẵn có, không phải bằng chứng riêng cho NguonKeoTha.

E8 (cd apps/app && bun test ... tai-lieu-nguon.dom.tsx -t tai-loi), E9 (-t nguon-tat), E9b (-t hang-nguon) — cùng lý do: các khối test này thuộc màn hình tải nguồn của hồ sơ máy-soạn-đề-xuất trước đó, chạy nguyên văn để xác nhận vùng kéo-thả mới không phá hành vi cũ.

E12 (design-gate --mode static trên các tệp của khu tài liệu và packages/ui/src/components/nguon-*.tsx) — pass trên cả hai vì phần lớn tệp trong tập quét vốn đã sạch thiết kế tĩnh trước khi NguonKeoTha được thêm vào; chiều đỏ riêng của E12 (chèn className màu thô vào nguon-keo-tha.tsx) đã được khai trong định nghĩa eval để bù cho điểm này.

## Variance

none — every multi-run eval is uniform (không eval nào trong vòng này có runs > 1).

## Iterations

Round 1: mọi eval máy pass ngay lần chạy đầu (E1–E12, gồm E4b/E5b/E9b, và ui-check E11u); bốn lệnh suite hồi quy (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều xanh. Không có vòng quay lại implementation.

### Re-pin lần 1 — 2026-10-09, do thuoc-khong-tu-het-han sửa paths; hồ sơ hoá cũ do onehub đổi vật
run_id: repin-20261009T224054Z-34604
sha: 99ab35a30335c5f765410f94905e06d237d72c74 · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E11u · diff chạm vật đo ngoài làn máy: E11u — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-10, do hoá cũ do thuoc-khong-tu-het-han (F10) sửa paths chết và gộp onehub eaf0886d5; ghim lại ở tip trước khi gộp
run_id: repin-20261010T064619Z-39877
sha: eb2280d03ab034c35a9cc5c03fc2def43ab0f0da · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E11u · AC không có chốt máy: AC-11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-10, do hoá cũ do gộp onehub f8be41ee (LT1 + H6) vào thuoc-khong-tu-het-han; ghim lại ở tip trước khi gộp
run_id: repin-20261010T123509Z-40413
sha: 1946af2d61b3416e148f07e7b21c6419a8e46d59 · suites: 7 lệnh exit 0 · evals: 14/14 eval máy đạt kỳ vọng · ngoài làn máy: E11u · AC không có chốt máy: AC-11 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
