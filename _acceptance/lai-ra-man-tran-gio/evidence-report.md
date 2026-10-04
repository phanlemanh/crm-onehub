---
schema_version: 2
feature_slug: lai-ra-man-tran-gio
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d03129ecfa5bdbcff83dee9706a511e342f399c
human_signoff: Phan Le Manh 2026-09-28
---

# Evidence Report: lai-ra-man-tran-gio

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-lai-ra-man-tran-gio-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lrm_tran_co_mat
  verified_at: 2026-09-28T07:48:27Z
  output: |
    chieu do da bat: ca khong co tran tuong minh: chuoi da va den man bang tieng Viet, va so ca bang so dong da va

- eval: E2
  run_id: minted-lai-ra-man-tran-gio-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lrm_tran_can_cu
  verified_at: 2026-09-28T07:48:27Z
  output: |
    chieu do da bat: tran 25000 ms duoi 4 lan moc 7469.2 ms (can duoi do 36371259813/1)

- eval: E3
  run_id: minted-lai-ra-man-tran-gio-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lrm_co_lap
  verified_at: 2026-09-28T07:48:27Z
  output: |
    vong lai het gio van ve tiep: chuoi da va den man do theo (3/3)

- eval: E4
  run_id: minted-lai-ra-man-tran-gio-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.lrm_ban_ve_khong_doi
  verified_at: 2026-09-28T07:48:27Z
  output: |
    chieu do (b) da bat: ban ve lech: mo-nguyen-ban.json khoa accordion.tsx

- eval: E5
  judged_by: judge panel (fresh context)
  verdict: PASS
  panel:
    - domain-correctness: PASS — Run 36390451637 của PR#191: lượt 2 (lái 4280ms) và lượt 3 (lái 7241ms) đều xanh dưới trần 30000ms; lượt 3 với 7241ms > 5000ms tự thân xác nhận có lượt mà trần cũ 5000ms sẽ làm đỏ (đúng như 3/33 lượt đỏ ở bảng "trước" khi lái >5000ms). Cặp PR#189 (có vá) và PR#190 (chưa vá) khớp đúng dạng hợp đồng hứa; hầu hết số liệu gắn run_id/attempt cụ thể và khớp nội bộ với rang/bang-do-ci.json.
    - operational-feasibility: UNCERTAIN — Câu 1 và phần đầu câu 2 có căn cứ rõ (PR#191 xanh dưới trần 30000ms, lượt 7241ms đúng là sẽ đỏ dưới trần cũ 5000ms), nhưng bằng chứng "render-diff chạy SAU lai-ra-man trong cùng tiến trình" chỉ là một câu khẳng định trong do-ci.md, không kèm trích đoạn log để tự kiểm; con số "kéo thêm 20 ca render-diff" ở lượt 36371259813/1 không có trong bang-do-ci.json và không kèm nguồn nào.
      required_evidence:
        - "Trích đoạn log thật (không phải câu mô tả) từ 'gh run view 36390059764 --repo phanlemanh/crm-onehub --attempt 1 --log | grep -n \"##\\[group\\]\"' (hoặc run 36390650557/1) cho thấy nhóm test/lai-ra-man.spec.tsx đứng ngay trước nhóm test/render-diff.spec.tsx trong cùng job @crm/ui#test."
        - "Danh sách tên ca (hoặc log gốc) của '20 ca render-diff' bị kéo đỏ ở lượt 36371259813/1, lấy bằng 'gh run view 36371259813 --repo phanlemanh/crm-onehub --attempt 1 --log' rồi lọc phần render-diff.spec.tsx."
    - spec-alignment: PASS — Bảng do-ci.md mục "PR#191" nêu rõ run 36390451637 (lượt 2 và 3 xanh dưới trần 30000ms, lượt 3 minh hoạ đúng ranh giới trần cũ). Bảng "Sau — cô lập ép trần 500ms" khớp đúng hợp đồng: nhánh có vá (#189) chỉ đỏ đúng ca lái, nhánh chưa vá (#190) đỏ thêm chuoi-da-va và 22 ca render-diff, kèm bằng chứng thứ tự chạy cùng tiến trình. Gần như mọi số gắn run_id/attempt cụ thể, đối chiếu được với rang/bang-do-ci.json.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-lai-ra-man-tran-gio-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T07:48:27Z

- cmd: bunx turbo run lint --force
  run_id: minted-lai-ra-man-tran-gio-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T07:48:27Z

- cmd: bun run lint:slop
  run_id: minted-lai-ra-man-tran-gio-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T07:48:27Z

- cmd: bunx turbo run build --force
  run_id: minted-lai-ra-man-tran-gio-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T07:48:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào chạy nhiều lần (runs=1 cho mọi eval và mọi lệnh suite; không có pass_rate hỗn hợp)

## Iterations

Round 1: E1–E4 (script) và bốn lệnh suite (bun run test, turbo lint, lint:slop, turbo build) đều xanh ngay lần chạy đầu, mỗi eval feature đều đỏ trên baseline (có phân biệt); E5 (judgment) — panel đề xuất PASS, một lens (operational-feasibility) dissent UNCERTAIN vì thiếu trích log gốc, nhưng không chặn verdict tổng vì proposal panel là PASS. Không có round lặp lại.

### Re-pin lần 1 — 2026-09-28, do gộp onehub #186–#188 sau chữ ký — CI kiểm bản đồ trên commit gộp
run_id: repin-20260928T084508Z-16649
sha: e23fa3363044c4aa596e45e8acd1852749b6fd66 · suites: 4 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E5 (E5 không khai paths) · AC không có chốt máy: AC-5

### Re-pin lần 2 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E5 · AC không có chốt máy: AC-5

### Re-pin lần 3 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E5 · AC không có chốt máy: AC-5

### Re-pin lần 4 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T161003Z-91842
sha: 0d03129ecfa5bdbcff83dee9706a511e342f399c · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E5 · AC không có chốt máy: AC-5
