---
schema_version: 2
feature_slug: nen-kara
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: beac40ab8472f735a5e7ecc79a03ae01ea1d37cf
human_signoff: Phan Le Manh 2026-10-03
---

# Evidence Report: nen-kara

Round 3. Mọi eval máy xanh, E10 (ui-check) xanh với 32 ảnh đã mở bằng Read, E13 giữ nguyên đề xuất PASS của hội đồng từ round 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | ui-check | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-11 | script | PASS |
| E13 | AC-12 | judgment | PASS |
| E14 | AC-13 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nen-kara-E1-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_inline
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 1 test across 1 file. [485.00ms]

- eval: E2
  run_id: minted-nen-kara-E2-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_hai_do_day
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 1 test across 1 file. [511.00ms]

- eval: E3
  run_id: minted-nen-kara-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nk_man_cu
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 18 tests across 2 files. [9.64s]

- eval: E4
  run_id: minted-nen-kara-E4-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_bien_nhan
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 1 test across 1 file. [660.00ms]

- eval: E5
  run_id: minted-nen-kara-E5-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_dau
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 1 test across 1 file. [404.00ms]

- eval: E6
  run_id: minted-nen-kara-E6-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_vi_sao
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 2 tests across 1 file. [560.00ms]

- eval: E7
  run_id: minted-nen-kara-E7-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_phan_hoi
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 1 test across 1 file. [432.00ms]

- eval: E8
  run_id: minted-nen-kara-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nk_tom_tat
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 24 tests across 1 file. [2.33s]

- eval: E9
  run_id: minted-nen-kara-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nk_hai_tieng
  verified_at: 2026-10-02T21:09:19Z
  output: |
    Ran 5 tests across 1 file. [7.00ms]

- eval: E10
  run_id: E10-nen-kara-20261003
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.nk_man_proto
  verified_at: 2026-10-02T21:09:19Z
  screenshot: evidence/E10-ST-nenkara-inline-cho-1440-light.png
  observed: |
    inline-cho-1440-light: de xuat 'Doi ten KR' nam lien dong duoi KR 'Goi dien cho doi tac moi moi tuan', co dau AI, chu cu gach do, chu moi nen xanh nhat, giai thich, nut chinh xanh 'Doi ten KR' + 'Sua' + 'Bo qua'; KHONG co khung/vien/nen rieng, doc nhu mot phan cua dong. Nhan 'Kara · OKR · 2 gop y' + 'Vi sao?' hien o tieu de, khong tran ngang. inline-cho-390-light: cung bo cuc o kho hep, cau moi 'Doi tac moi hen gap duoc sau cuoc goi dau tien' xuong dong nhung doc lien mach (2 dong), nut chinh xanh nhan ra ngay, khong tran ngang. the-1440-light: cot rieng ben phai co 2 khoi dang the co vien: the de xuat 'Them KR doi trong' co vien nhin thay + nut chinh xanh 'Them KR doi trong' / 'Sua' / 'Bo qua', va dong bien nhan 'Da doi ten theo Kara · Hoan tac' cung co vien — dung 2 the. bien-nhan-1440-light: duoi KR hien dong bien nhan 'v Da doi ten theo Kara  Hoan tac' va dong 'Da bo qua' (khong vien, khong nen), dung 2 phan tu inline; de xuat cho khong con. nhan-1440-dark: nen toi, bang KR 3 dong, nhan 'Kara · OKR · 2 gop y' + 'Vi sao?' hien, khong de xuat, doc duoc tren nen toi. phan-hoi-390-dark: the 'Tom tat tuan' co dau Kara, nut 'Huu ich' (da chon, vien xanh) / 'Khong huu ich' va 'Cam on, da ghi', khong tran ngang o 390. Tat ca khop Expected.
  network_observed: n-a (driver)
  output: |
    rang/man-proto.mjs chay chieu xanh cuoi cung: XANH, 109 OK, 32 anh sach E10-*.png trong _acceptance/nen-kara/evidence/.
    Driver la script Playwright rieng cua rang, khong qua cong cu co read_network_requests, nen khong co E10-network.txt.
    Frames da doc bang Read: inline-cho-1440-light, inline-cho-390-light, the-1440-light, bien-nhan-1440-light, nhan-1440-dark, phan-hoi-390-dark.

- eval: E11
  run_id: minted-nen-kara-E11-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nk_mo_coi
  verified_at: 2026-10-02T21:09:19Z
  output: |
    RĂNG TÊN GỌI XANH

- eval: E12
  run_id: minted-nen-kara-E12-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nk_tai_lieu
  verified_at: 2026-10-02T21:09:19Z
  output: |
    XANH

- eval: E13
  judged_by: judge panel (3 lens, fresh context)
  verdict: PASS
  proposal: PASS
  rationale: Panel giu nguyen tu round 2 — inputs khong doi, khong cham lai; rationale xem round do. Day la de xuat cua hoi dong, nguoi quyet o Gate 2.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override:  # chi nguoi ghi

- eval: E14
  run_id: minted-nen-kara-E14-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nk_san_thiet_ke
  verified_at: 2026-10-02T21:09:19Z
  output: |
    design-gate.mjs --mode static chay lan luot tren sau tep man cua luot va moi .tsx duoi proto/_modules/nen-kara, khong tep nao bi chan.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-nen-kara-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

- cmd: bunx turbo run lint --force
  run_id: minted-nen-kara-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

- cmd: bun run lint:slop
  run_id: minted-nen-kara-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

- cmd: bunx turbo run build --force
  run_id: minted-nen-kara-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-02T21:09:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

Hai eval xanh cả trên bản trước lượt lẫn bản hiện tại (baseline green), nên chúng chứng minh bộ đo chứ không chứng minh tính năng mới. Cả hai là hàng rào hồi quy có chủ ý:

- E3 (AC-3): hai màn cũ vẫn ra bản card như trước.
- E11 (AC-10): hai thước mồ côi và tên gọi sẵn có, xanh cả hai phía.

Lệnh fail không gắn eval: không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT, E10 đỏ ở chiều đỏ của script đo (đã vá ở commit 475d8177), kèm các finding trong sổ quyết định S4-r1.
Round 2: REJECT, E8 đỏ vì lệnh gồm hai nửa mà nửa sau không chạy được; khuôn đo được đổi sang lệnh ngắn rang/tom-tat.sh.
Round 3: PASS, mọi eval máy xanh, E10 đo 32 ô, E13 giữ nguyên từ round 2.

### Re-pin lần 1 — 2026-10-03, do hoá cũ sau khi gộp onehub có #234 muc-tieu-va-kr
run_id: repin-20261003T095736Z-43153
sha: 7282dbe45b2286f76d2c6fae39d04998a2a3e15d · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E10, E13 (E13 không khai paths) · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9, AC-12

### Re-pin lần 2 — 2026-10-04, do sửa thước đỏ lô 2-4 (c2)
run_id: repin-20261004T155414Z-26973
sha: 7273fe74b579dfdaeb558a5d6afc1514a1cea03b · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E10, E13 · diff chạm vật đo ngoài làn máy: E10, E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9, AC-12

### Re-pin lần 3 — 2026-10-06, do sửa thước đỏ lô 2-4 (c2)
run_id: repin-20261006T093159Z-42780
sha: 787b6a34842f17cdf14e6beca7f6aef7b92f6c45 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E10, E13 · diff chạm vật đo ngoài làn máy: E10, E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9, AC-12

### Re-pin lần 4 — 2026-10-08, do gộp onehub sau chữ ký Cổng 2 của khung-ban-ghi-kara; eval của the-gop-y-okr, logo-onehub, nen-kara bị thay hay sửa ở vòng này
run_id: repin-20261008T004656Z-80562
sha: beac40ab8472f735a5e7ecc79a03ae01ea1d37cf · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E3, E14 · thay bởi hồ sơ đã ký: E3→gop-y-dung-cho#AC-5, E14→gop-y-dung-cho#AC-14 · ngoài làn máy: E10, E13 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-3, AC-9, AC-12, AC-13 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
