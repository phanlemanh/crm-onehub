---
schema_version: 2
feature_slug: ba-ho-so-do-san
verdict: REJECT
failed_evals: ["E6"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2f8798fd7475d9d48fd1b7295f7fee2d0596d756
human_signoff:
---

# Evidence Report: ba-ho-so-do-san

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | judgment | UNCERTAIN |
| E6 | AC-6 | script | FAIL |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ba-ho-so-do-san-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_paths_song
  verified_at: 2026-10-14T03:04:21Z
  output: |
    paths-song: 13 ho so, 0 muc chet, 0 bo loc tat moi

- eval: E2
  run_id: minted-ba-ho-so-do-san-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_danh_sach
  verified_at: 2026-10-14T03:04:21Z
  output: |
    ngoai_vong: 15 ho so tu kiem-cheo/2026-10-11,2026-10-12,2026-10-13.json, yeu cau P7-5

- eval: E3
  run_id: minted-ba-ho-so-do-san-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_khai_du
  verified_at: 2026-10-14T03:04:21Z
  output: |
    khai-du: 26 commit cua vong, 6 ho so hoan lai nguyen, 44 tep doi ngoai ho so nay, 110 eval doi, moi thay doi co dong danh sach

- eval: E4
  run_id: minted-ba-ho-so-do-san-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_ghim_xanh
  verified_at: 2026-10-14T03:04:21Z
  output: |
    ghim-xanh: 12/12 ho so

- eval: E6
  run_id: minted-ba-ho-so-do-san-E6-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.script.dmk_khong_noi_thuoc
  verified_at: 2026-10-14T03:04:21Z
  output: |
    (danh sach «cham:» cac tep cua ho so khac bi chay, cuoi danh sach)
        cham: _acceptance/tro-ly-doc-kho/run-log.jsonl
        cham: _acceptance/tro-ly-okr-de-xuat/evals.yaml
        cham: _acceptance/tro-ly-okr-de-xuat/evidence-report.md
        cham: _acceptance/tro-ly-okr-de-xuat/run-log.jsonl
      SAI  khong tep nao cua ho so khac hay canh-cay.mjs bi cham (72 tep doi)
      DUNG config.yaml chi them dong, khong sua hay xoa executor co san
    khong-noi-thuoc: 1 SAI

- eval: E7
  run_id: minted-ba-ho-so-do-san-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_danh_sach
  verified_at: 2026-10-14T03:04:21Z
  output: |
    ngoai_vong: 15 ho so tu kiem-cheo/2026-10-11,2026-10-12,2026-10-13.json, yeu cau P7-5

- eval: E8
  run_id: minted-ba-ho-so-do-san-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_chieu_do
  verified_at: 2026-10-14T03:04:21Z
  output: |
    chieu-do: 8 dong sua-rang, moi rang sua con bat loi

### Judgment

Panel đề xuất cho E5: UNCERTAIN. Ba lens; hai lens UNCERTAIN, một lens PASS. Mọi dissent giữ nguyên bên dưới.

- lens domain-correctness: UNCERTAIN — Các dòng khai-not-run (khung-tao-okr-nhu-deal E6/E24, the-gop-y-okr E1/E11) đúng loại (1): commit 081c9b792 xoá cot-gop-y.tsx (516 dòng) và bảng ghi vật ở HEAD là VẮNG. Các dòng sua-rang khoa-con-bat-xa-tran E4 (quyết định đã ký), lenh-dung-do-khong-ai-thay E5 (CLAUDE.md:14, luật 47) và E3/E6 đều có đột biến vẫn bắt được. Còn ba chỗ bảng chưa đủ để kết luận. Một: soan-okr-song-lai:E12 tự nhận chỉ đỏ khi tệp đích vắng, nhưng expected vẫn ghi chiều đỏ "gray-on-color → REJECT", và bảng không có commit gỡ man-soan.tsx. Hai: lenh-dung-do-khong-ai-thay:E2 chuyển phép quét sang cây ở sha gộp, nên bảng không chứng minh cây hiện tại không có getLocale ngoài Suspense. Ba: E5 và E8 gộp nhiều lý do, không thuộc đúng một loại.
- lens operational-feasibility: PASS — Cả 12 dòng khai-not-run (4) và sua-rang (8) đều rơi vào một trong ba loại. Bốn dòng khai-not-run (khung-tao E6, E24; the-gop-y E1, E11) thuộc loại 1: bảng ghi commit 081c9b792 xoá cot-gop-y.tsx (516 dòng) và "Vật … ở HEAD: VẮNG". Hai dòng sua-rang khoa-con-bat E4 và lenh-dung-do E5 thuộc loại 2: lý do trỏ decisions.jsonl:28 kèm lựa chọn (c) của chủ kho, và CLAUDE.md:14 (luật 47). Năm dòng còn lại (khoa-con-bat E3, E6; lenh-dung-do E2, E3, E8) cùng soan-okr E12 thuộc loại 3 hoặc loại 1: thụt lề cứng, neo 26 file và diff theo sha ghim bị lỗi thời, thiếu maxBuffer, và man-soan.tsx đã gỡ. Mọi dòng sua-rang đều có đột biến khai và dòng "that dat, dot bien bat" từ chieu-do.mjs, nên chiều đỏ vẫn còn. Không dòng nào cho thấy vật còn nguyên mà ô đỏ vì sản phẩm hỏng thật.
- lens spec-alignment: UNCERTAIN — Bốn dòng khai-not-run (khung-tao-okr-nhu-deal E6/E24, the-gop-y-okr E1/E11) thuộc loại (1): bảng cho thấy commit gỡ 081c9b792 xoá cot-gop-y.tsx (516 dòng xoá) và dòng "Vật ở HEAD: VẮNG". khoa-con-bat-xa-tran E4 thuộc loại (2) và còn hai đột biến đỏ. khoa-con-bat-xa-tran E3/E6 thuộc loại (3) và đột biến vẫn bắt. Ba chỗ còn lại hai tệp này không đủ để kết luận. (a) soan-okr-song-lai E12 chỉ nêu can_cu "574292047", không in commit hay dòng VẮNG, và ly_do tự nhận chiều đỏ duy nhất của ô là tệp đích vắng. (b) lenh-dung-do-khong-ai-thay E2/E3/E8 chuyển sang neo cặp sha gộp eeb6ea30 và bỏ mệnh đề đếm cảnh báo lint (3 thành 20); lý do loại (3) chỉ là lời khẳng định, bảng không cho thấy 20 cảnh báo không phải hồi quy thật. (c) E2 ghi neo 26 trong ly_do và mã, nhưng expected vẫn ghi "NEO 25".

- eval: E5
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment; fresh context)
  verdict: UNCERTAIN
  rationale: Bốn dòng khai-not-run và các dòng sua-rang có đột biến bắt được, nhưng bảng chưa chứng minh ba chỗ: soan-okr-song-lai:E12 (expected còn nhắc chiều đỏ không tồn tại), lenh-dung-do-khong-ai-thay E2/E3/E8 (neo sha gộp, bỏ mệnh đề đếm cảnh báo lint) và E5/E8 gộp nhiều lý do vào một dòng.
  required_evidence:
    - soan-okr-song-lai:E12. Chạy `git show --stat 574292047`, phải thấy man-soan.tsx bị xoá và trang-soan.tsx, khung-soan.tsx có mặt ở HEAD. Kèm đầu ra của `config:executors.script.sol_san_thiet_ke_trang` (đạt trên các tệp kế nhiệm) và của đột biến tep-dich-vang (không đạt). Phần expected của E12 phải bỏ lời hứa chiều đỏ gray-on-color, hoặc có một đột biến thật làm design-gate đỏ vì lỗi thiết kế, vì dòng lý do đã tự nhận chế độ static không bắt được.
    - lenh-dung-do-khong-ai-thay:E2. Chạy `node _acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs --goc <cây HEAD> --neo 54`. Đầu ra phải cho thấy cả 54 tệp gọi getLocale đều đi qua Suspense, tức ô đỏ ở lượt ghim 13/10 chỉ vì neo 26 đã cũ chứ không phải vì sản phẩm hỏng thật.
    - lenh-dung-do-khong-ai-thay:E5 và E8. Trong danh-sach.json, tách mỗi dòng gộp thành từng lý do riêng. E5 gồm luật 47, maxBuffer và tách hàm. E8 gồm maxBuffer và số cảnh báo lint hết hạn. Mỗi lý do gắn một loại (1/2/3) và một căn cứ riêng. Với E8, phải nêu rõ việc cảnh báo lint của apps/app tăng từ 3 lên 20 là trôi dạt của neo ghim chứ không phải lỗi sản phẩm cần giữ làm chiều đỏ.
    - Đầu ra git show --stat 574292047 trong kho crm, chứng minh man-soan.tsx bị gỡ ở commit đó (bảng hiện không in commit căn cứ cho dòng sua-rang này).
    - Đoạn luật F10 («vòng này» neo cặp sha gộp) ở tài liệu của kit hoặc hồ sơ lenh-dung-do-khong-ai-thay, kèm đầu ra `bun run lint` của apps/app tại HEAD cho thấy 20 cảnh báo là dòng cũ, không phải lỗi mới của sản phẩm.
    - Đầu ra chạy rang/khong-doc-ngoai-suspense.mjs trên cây HEAD (--goc trỏ HEAD) cho thấy ca đỏ cũ chỉ do đếm 26 so với 54, không có lời gọi getLocale nào ngoài Suspense. Kèm giải thích vì sao expected còn ghi "NEO 25" trong khi mã dùng 26.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

- cmd: bunx turbo run lint --force
  run_id: minted-ba-ho-so-do-san-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

- cmd: bun run lint:slop
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

- cmd: bunx turbo run build --force
  run_id: minted-ba-ho-so-do-san-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-14T03:04:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: danh sách trên là danh sách do máy tính (rỗng). Thực tế baseline chỉ đo được E6, và E6 xanh trên code cũ rồi đỏ ở HEAD, nghĩa là vòng này làm đỏ một ô vốn xanh (hồi quy do vòng gây ra, không phải ô vốn đỏ sẵn). Năm eval còn lại là eval mới nên baseline n-a.

Baseline khong do:
- bun _acceptance/ba-ho-so-do-san/rang/paths-song.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/paths-song.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/danh-sach.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/danh-sach.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/khai-du.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/khai-du.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/chieu-do.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base 966eeb78e4fb39accd6ebf272692d7282c4441fb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6 failed — rang khong-noi-thuoc bao «SAI khong tep nao cua ho so khac hay canh-cay.mjs bi cham (72 tep doi)» va dong cuoi «khong-noi-thuoc: 1 SAI»; cac eval may khac (E1, E2, E3, E4, E7, E8) va 7 lenh suite deu dat; E5 la judgment dang UNCERTAIN cho nguoi quyet o Cong 2. Returned to implementation.
