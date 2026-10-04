---
schema_version: 2
feature_slug: tro-ly-okr-tom-tat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7282dbe45b2286f76d2c6fae39d04998a2a3e15d
human_signoff: Manh Phan 2026-10-01
---

# Evidence Report: tro-ly-okr-tom-tat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | ui-check | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | test | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-14 | script | PASS |
| E18 | AC-14 | test | PASS |
| E19 | AC-15 | script | PASS |
| E20 | AC-15 | judgment | PASS |
| E21 | AC-6 | script | PASS |
| E22 | AC-6 | test | PASS |

không chạy theo hồ sơ: E23

## Evidence

- eval: E9
  run_id: e9-r4-2026-10-01
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tts_man_that
  verified_at: 2026-10-01T01:50:00Z
  screenshot: evidence/E9-step1.png
  observed: |
    Da mo tung frame (24 anh E9-step1..E9-step24) bang Read. Step1 (co-cau 1440, dark): Hop tuan phong Kinh doanh mien Bac, khoi "Tom tat tuan cua Tro ly OKR" co 5 cau, moi cau co nhan "Cap nhat 28/09", nut Huu ich / Khong huu ich; ben duoi "Dang ban tuan nay 1". Step2 (390): cung khoi, cau xep doc, khong tran ngang.
    Step3-7 (trich dan cau 1..5 o 1440): the noi bat dung cau, tieu de KR, ngay 28/09/2026, gia tri va muc tu tin dung (cau1 2,9 ty dong Tu tin cao 1/4; cau2 17,5 cuoc hen Tu tin thap kem Ghi chu; cau3 2,9 ty dong cao; cau4 27,3 % cao; cau5 12,1 hop dong Tu tin vua), moi the co nut "Xem dien bien KR". Step8-12 (390): the trich dan cau 1..5 hien day du trong khung, khop gia tri/tu tin/ghi chu voi ban 1440; step8 cau 1 nay hien the 1/4 cung 2,9 ty dong (cho vong 3 chi chup khung dau).
    Step13-14: ngan dien bien "Giu da tang truong ban le mien Bac" (1440) va bottom-sheet (390), bieu do duong 6 diem, "Muc tu tin theo tuan" 6 dong, khong tran. Step15-16: nut Huu ich vien xanh da chon kem «Cam on, da ghi». Step17-18: muc "Tro ly OKR" co dong «Dong Tom tat tuan cua Tro ly OKR», cong tac bat roi tat sau khi tai lai. Step19-20 (phong B Cham soc doi tac): chi co «Dang ban tuan nay 1», khong co khoi Tom tat tuan. Step21-24: Suc khoe chuong trinh bang 2 hang (Kinh doanh mien Bac nac Bat, 5 cau, 0 bi bo, Huu ich 1/0; Cham soc doi tac nac Che do an, «Qua bo kiem, chi quan tri thay»), ngan ban phong B 5 cau kem Nguon, ban 390 rut gon khong tran. Moi anh scrollWidth khong vuot clientWidth ca 1440 va 390. Tat ca khop expected, khong frame nao mau thuan.
  network_observed: n-a (driver)

- eval: E10
  run_id: muovn3ocefma
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_duong_do
  verified_at: 2026-10-01T01:50:00Z
  output: |
    test-run: dropped crm_muovn3ocefma_test

- eval: E15
  run_id: minted-tro-ly-okr-tom-tat-E15-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_thuoc
  verified_at: 2026-10-01T01:50:00Z
  output: |
    test-run: dropped crm_muovn3rwdkvr_test

- eval: E19
  run_id: minted-tro-ly-okr-tom-tat-E19-r4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tts_tai_lieu
  verified_at: 2026-10-01T01:50:00Z
  output: |
    tai-lieu: muc cho re 9c, docs/api.md §OKR (3 thu tuc), docs/agent.md (chayXepTomTat, damBaoLichTomTat) deu du.

- eval: E1
  run_id: minted-tro-ly-okr-tom-tat-E1-r3
  exit_code: 0
  verifier: config:executors.test.tts_dang_ban
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-tro-ly-okr-tom-tat-E2-r3
  exit_code: 0
  verifier: config:executors.test.tts_api_okr
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E3
  run_id: muouw63ppk3a
  exit_code: 0
  verifier: config:executors.test.tts_lich
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-tro-ly-okr-tom-tat-E4-r3
  exit_code: 0
  verifier: config:executors.test.tts_bo_kiem
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-tro-ly-okr-tom-tat-E5-r3
  exit_code: 0
  verifier: config:executors.test.tts_nop
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-tro-ly-okr-tom-tat-E6-r3
  exit_code: 0
  verifier: config:executors.test.tts_cach_ly
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-tro-ly-okr-tom-tat-E7-r3
  exit_code: 0
  verifier: config:executors.test.tts_doc
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-tro-ly-okr-tom-tat-E8-r3
  exit_code: 0
  verifier: config:executors.test.tts_man_khoi
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-tro-ly-okr-tom-tat-E11-r3
  exit_code: 0
  verifier: config:executors.test.tts_phan_hoi
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E12
  run_id: muouw92y1rrg
  exit_code: 0
  verifier: config:executors.test.tts_nhac
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-tro-ly-okr-tom-tat-E13-r3
  exit_code: 0
  verifier: config:executors.test.tts_tat_dong
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-tro-ly-okr-tom-tat-E14-r3
  exit_code: 0
  verifier: config:executors.test.tts_quan_tri
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E16
  run_id: muouwgx0jcse
  exit_code: 0
  verifier: config:executors.test.tts_chi_phi
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E17
  run_id: minted-tro-ly-okr-tom-tat-E17-r3
  exit_code: 0
  verifier: config:executors.script.tts_eval
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-tro-ly-okr-tom-tat-E18-r3
  exit_code: 0
  verifier: config:executors.test.tdx_judge_zdr
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E21
  run_id: design-gate-dee7356994
  exit_code: 0
  verifier: config:executors.script.tts_san_thiet_ke
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E22
  run_id: minted-tro-ly-okr-tom-tat-E22-r3
  exit_code: 0
  verifier: config:executors.test.tts_doc_trang_thai
  verified_at: 2026-10-01T01:28:57Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E20
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba judge cung cho PASS. CONTEXT.md mục Tóm tắt tuần, docs/api.md §OKR (ba thủ tục) và mục chỗ rẽ 9c, lịch tự nối ở docs/agent.md khớp hợp đồng AC-2, AC-3, AC-5, AC-9, AC-11, không mâu thuẫn. Chỉ có hai chênh lệch nhỏ không đổi nghĩa: CONTEXT.md không nhắc ca «không còn câu nào», và api.md thêm cửa sổ hiện 8 ngày mà hợp đồng không nói.
  human_override:  # chi nguoi ghi

### Hội đồng judge E20 (đề xuất, chờ người quyết)

Panel đề xuất: PASS. Để human_override trống cho người điền ở Cổng Bằng chứng.

- domain-correctness: PASS — CONTEXT.md mục Tóm tắt tuần nói bằng chữ thường đủ năm ý: chạy sáng hôm sau ngày cập nhật, chỉ phòng ban, câu sai số bị bỏ, quá 30% thì bản bị giữ lại và không hiện cho ai, chế độ ẩn chỉ quản trị chương trình thấy ở Sức khoẻ chương trình. docs/api.md §OKR (ba thủ tục, ai gọi được, luật lọc lúc hiện) và mục chỗ rẽ 9c, lịch tự nối ở docs/agent.md khớp hợp đồng AC-2, AC-3, AC-5, AC-9 và AC-11, không có chỗ nào mâu thuẫn. Chỉ có hai chênh lệch nhỏ, không đổi nghĩa: CONTEXT.md không nhắc trường hợp «không còn câu nào» (hợp đồng AC-3 có), và api.md thêm cửa sổ hiện 8 ngày (hợp đồng không nói).
- operational-feasibility: PASS — Năm điều đều có chữ rõ trong tài liệu và khớp hợp đồng AC-2/3/5/9/11. CONTEXT.md nói bằng chữ thường: tóm tắt đến sáng hôm sau ngày cập nhật, chỉ cho phòng ban, số sai thì câu bị bỏ, bỏ quá 30% thì bản không hiện cho ai, chế độ ẩn chỉ quản trị thấy ở Sức khoẻ. docs/api.md và docs/agent.md nói cùng điều đó bằng chữ kỹ thuật hơn. Lệch nhẹ: mục Tóm tắt tuần của CONTEXT.md thiếu ca «không còn câu nào» (agent.md có), nhưng không mâu thuẫn hợp đồng.
- spec-alignment: PASS — Mục Tóm tắt tuần của CONTEXT.md, đoạn tóm tắt ở docs/api.md §OKR và mục chỗ rẽ 9c của docs/agent.md nói cùng một điều với hợp đồng (AC-2, 3, 5, 9, 11): chạy sáng hôm sau ngày cập nhật; chỉ phòng ban; câu lệch số bị bỏ; bản bỏ quá 30% là `can-xem` và không hiện cho ai; bản chế độ ẩn chỉ quản trị thấy ở Sức khoẻ chương trình. CONTEXT.md đủ để người không đọc mã hiểu đúng. Hai tài liệu kỹ thuật chỉ thêm chi tiết (cửa sổ 8 ngày, mã trạng thái, mốc 06:00) và không mâu thuẫn hợp đồng. Lệch nhỏ không đổi kết luận: CONTEXT.md bỏ vế «không còn câu nào» của ngưỡng, và vế chế độ ẩn nằm ở mục Chế độ ẩn chứ không ở mục Tóm tắt tuần.

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-10-01T01:50:00Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-10-01T01:50:00Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-10-01T01:50:00Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-10-01T01:50:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1-2: xem lịch sử run-log.jsonl và các commit S4-r1, S4-r2 của nhánh.
Round 3: E19 và E9 hỏng (mục chỗ rẽ 9c thiếu agent-tasks.ts; ba ảnh E9 chỉ chụp khung đầu). Quay lại thi công, chủ kho cho mở vòng 4 sửa ba chỗ.
Round 4: sửa danh sách chỗ rẽ, thước E9 cuộn tới phần tử trước khi chụp, tách E20 thành bài chấm tài liệu cho người chấm. Mọi eval và lệnh suite đạt; E10, E15, E19 đỏ trên baseline (có phân biệt); các eval còn lại giữ nguyên từ round 3.

### Re-pin lần 1 — 2026-10-01, do PR 226: vòng 9c chạm mã trong vùng của hồ sơ; sửa bài bảng quản trị đếm phòng bộ mẫu
run_id: repin-20261001T035438Z-57515
sha: 8fa89fe50f884a461be5514e055bb16b55311eca · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E23 · ngoài làn máy: E9, E20

### Re-pin lần 2 — 2026-10-01, do PR 226: gộp onehub sau #225 chạm mã trong vùng của hồ sơ
run_id: repin-20261001T071828Z-69614
sha: 858f1967383b3bd27de9be8c90ce53db7f3a32c3 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E23 · ngoài làn máy: E9, E20 · diff chạm vật đo ngoài làn máy: E9, E20 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 3 — 2026-10-03, do hoá cũ do nen-kara chạm khoi-tom-tat.tsx, bài DOM và thước màn; E19 neo vào merge #226
run_id: repin-20261003T092630Z-48603
sha: e6dbcf7dcc29a8ac12d9d2d84ec533458c6c4733 · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E23 · ngoài làn máy: E9, E20 · diff chạm vật đo ngoài làn máy: E9, E20 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-10-03, do hoá cũ sau khi gộp onehub có #234 muc-tieu-va-kr
run_id: repin-20261003T095736Z-43153
sha: 7282dbe45b2286f76d2c6fae39d04998a2a3e15d · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E23 · ngoài làn máy: E9, E20 · diff chạm vật đo ngoài làn máy: E9 — chưa chứng lại, đi vòng S4 delta
