---
schema_version: 2
feature_slug: o-cam-chay-duoc-that
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-eval verify, run_id minted at execution
enforcement_mode: strict
bypass_used: false
verified_commit: bfe4bd42b762527523887e7b546f5db9817fc1f4
run_id: s4r1-20260907T105205Z-7027
human_signoff:
---

# Evidence Report: o-cam-chay-duoc-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E9 | AC-9 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: s4r1-20260907T105205Z-7027-E1
  exit_code: 0
  verifier: config:executors.script.oc_moi_o_cam_chay_duoc
  verified_at: 2026-09-07T10:52:05.843Z
  output: |
    o cam giai duoc: 236 · neo: 236
    lenh hong cu phap: 0 · file script duoc chay ma thieu: 0
    XANH: ca 236 o cam giai ra lenh hop le cu phap, va moi file script duoc chay deu co that.

- eval: E2
  run_id: s4r1-20260907T105205Z-7027-E2
  exit_code: 0
  verifier: config:executors.script.oc_yaml_doc_duoc
  verified_at: 2026-09-07T10:52:05.469Z
  output: |
    YAML doc duoc · script 219 · test 15 · suite_keys 5
    XANH: file lanh parse duoc, va ban be hong thi nem loi — cap hai chieu tren cung mot vat.

- eval: E3
  run_id: s4r1-20260907T105205Z-7027-E3
  exit_code: 0
  verifier: config:executors.script.oc_hai_trinh_doc_bang_nhau
  verified_at: 2026-09-07T10:52:05.910Z
  output: |
    o cam so: 236 · lech giua hai trinh doc: 0
    chieu do: ban be hong -> kit "bun run lint:slop -- \"x" · yaml "bun run lint:slop -- \"x\""
    XANH: ca 236 o cam, hai trinh doc tra ve cung mot chuoi tung ky tu.

- eval: E4
  run_id: s4r1-20260907T105205Z-7027-E4
  exit_code: 0
  verifier: config:executors.script.oc_khoa_khong_doi
  verified_at: 2026-09-07T10:52:05.956Z
  output: |
    khoa tai sha ghim: 227 · khoa o HEAD: 236
      mat: 0 · them: 9 · them NGOAI danh sach: 0
    XANH: moi khoa cu con nguyen, va 9 khoa them deu nam trong danh sach tam ten da ghim.

- eval: E5
  run_id: s4r1-20260907T105205Z-7027-E5
  exit_code: 0
  verifier: config:executors.script.oc_verifier_con_giai_duoc
  verified_at: 2026-09-07T10:52:06.028Z
  output: |
    file evidence-report: 25 (neo >= 25) · khoa verifier distinct: 222 (neo >= 222)
    khoa khong giai duoc: 0
    XANH: ca 222 khoa verifier tren 25 bao cao deu giai duoc, va ca 16 khoa vong nay sua deu co mat.

- eval: E6
  run_id: s4r1-20260907T105205Z-7027-E6
  exit_code: 0
  verifier: config:executors.script.oc_lenh_van_lam_dung_viec
  verified_at: 2026-09-07T10:52:58.161Z
  output: |
      ok  script.tt_crawl_to_ingest · y dinh ma 127 · nay ma 127
      ok  script.apr_lech_so_dong_do · y dinh ma 0 · nay ma 0
      ok  script.apr_check_run · y dinh ma 0 · nay ma 0
      ok  script.apr_lech_so_dong · y dinh ma 0 · nay ma 0
      ok  script.apr_lech_noi_dung · y dinh ma 0 · nay ma 0
      ok  script.apr_check_run_do · y dinh ma 0 · nay ma 0
      ok  script.apr_lech_noi_dung_do · y dinh ma 0 · nay ma 0
    XANH: ca 16 o cam cho CUNG mot ma thoat voi y dinh tac gia tai sha ghim — sua cach viet, khong doi viec lenh lam.

- eval: E7
  run_id: s4r1-20260907T105205Z-7027-E7
  exit_code: 0
  verifier: config:executors.script.oc_chan_ho_so_da_ky_chay_lai
  verified_at: 2026-09-07T10:54:36.215Z
  output: |
    config.yaml tai sha ghim parse duoc bang YAML: KHONG
      ok  ba-noi-deu-chay.mjs · ma 0
      ok  o-cam-ep-chay-lai.mjs · ma 0
    XANH: ban cu nem loi YAML (tien de dung), va ca 2 chan cua ho so da ky nay chay duoc.

- eval: E9
  run_id: s4r1-20260907T105205Z-7027-E9
  exit_code: 0
  verifier: config:executors.script.oc_ham_kit_chua_doi
  verified_at: 2026-09-07T10:52:05.430Z
  output: |
    nap resolveConfigKey tu: /Users/manhphan/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.8.0/lib/evidence-core.cjs
      gia tri tran: "bun run test"
      boc nhay kep tron ven: "bunx turbo run build --force"
      ket thuc bang nhay kep khong boc: "bun run test -- \"cd apps/api && bun test x"
      cat sau dau thang: "bun run lint"
    XANH: bon dau van hanh vi khop — cat sau dau thang, boc dung mot ngoac moi dau.

- eval: E8
  run_id: s4r1-20260907T105205Z-7027-E8
  exit_code: 0
  verifier: config:executors.script.oc_nam_lenh_chung
  verified_at: 2026-09-07T10:55:34.561Z
  output: |
    test: ma 0
    check-types: ma 0
    lint: ma 0
    lint:slop: ma 0
    build: ma 0
    apps/app canh bao lint: 3 · ghim: 3
    XANH: ca nam lenh chung ma 0, canh bao lint dung ghim.

## Lệnh chứng — năm lệnh

| Lệnh | run_id | exit |
|---|---|---|
| `test` | s4r1-20260907T105205Z-7027-suite-test | 0 |
| `check-types` | s4r1-20260907T105205Z-7027-suite-check-types | 0 |
| `lint` | s4r1-20260907T105205Z-7027-suite-lint | 0 |
| `lint-slop` | s4r1-20260907T105205Z-7027-suite-lint-slop | 0 |
| `build` | s4r1-20260907T105205Z-7027-suite-build | 0 |
