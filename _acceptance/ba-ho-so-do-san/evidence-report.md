---
schema_version: 2
feature_slug: ba-ho-so-do-san
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7dd95e6fc2c898d23fe88406fb42cf304ad0c404
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
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

Round 2. Mọi eval máy và bảy lệnh suite đều đạt. Tổng thể là REJECT vì bước phân loại phạm vi giữ lại bốn phát hiện mức cao và trung bình nằm TRONG hợp đồng (AC-5, AC-8). Danh sách đầy đủ ở review-findings.md. E5 là eval phán xét, hội đồng đề xuất UNCERTAIN và dành cho người quyết ở Cổng 2.

## Evidence

- eval: E1
  run_id: minted-ba-ho-so-do-san-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_paths_song
  verified_at: 2026-10-14T05:47:11Z
  output: |
    paths-song: 12 ho so, 0 muc chet, 0 bo loc tat moi

- eval: E2
  run_id: minted-ba-ho-so-do-san-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_danh_sach
  verified_at: 2026-10-14T05:47:11Z
  output: |
    ngoai_vong: 15 ho so tu kiem-cheo/2026-10-11,2026-10-12,2026-10-13.json, yeu cau P7-5

- eval: E7
  run_id: minted-ba-ho-so-do-san-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_danh_sach
  verified_at: 2026-10-14T05:47:11Z
  output: |
    ngoai_vong: 15 ho so tu kiem-cheo/2026-10-11,2026-10-12,2026-10-13.json, yeu cau P7-5

- eval: E3
  run_id: minted-ba-ho-so-do-san-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_khai_du
  verified_at: 2026-10-14T05:47:11Z
  output: |
    khai-du: 30 commit cua vong, 7 ho so hoan lai nguyen, 44 tep doi ngoai ho so nay, 110 eval doi, moi thay doi co dong danh sach

- eval: E4
  run_id: minted-ba-ho-so-do-san-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_ghim_xanh
  verified_at: 2026-10-14T05:47:11Z
  output: |
    ghim-xanh: 12/12 ho so

- eval: E8
  run_id: minted-ba-ho-so-do-san-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_chieu_do
  verified_at: 2026-10-14T05:47:11Z
  output: |
    chieu-do: 8 dong sua-rang, moi rang sua con bat loi

### Judgment

Đề xuất hội đồng cho E5 (panel mới ở round 2, không mang từ round trước). Người quyết điền human_override ở Cổng 2.

- eval: E5
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  votes:
    - domain-correctness: PASS — 12 dòng khai-not-run/sua-rang trong danh-sach.json đều có mục khớp trong bang-truoc-sau.md và mỗi lý do rơi vào một loại. Bốn dòng khai-not-run (khung-tao-okr-nhu-deal E6/E24, the-gop-y-okr E1/E11) là loại 1: commit 081c9b792 xoá cot-gop-y.tsx (516 dòng) và bảng ghi vật VẮNG ở HEAD. Các dòng sua-rang là loại 2 hoặc loại 3: ld E5 điều 2 (luật 47 ở CLAUDE.md:14), ld E2/E3/E8 (luật F10, thước neo cặp sha gộp), kcb E4 (decisions.jsonl:28), kcb E3/E6 (chuỗi đột biến lỗi thời), soan E12 (man-soan.tsx bị gỡ ở 574292047). Không dòng nào hạ ô mà vật còn nguyên và sản phẩm hỏng thật. Mỗi dòng sua-rang đều có đột biến hoặc đối chứng âm còn bắt được và in kết quả "that dat, dot bien bat". Hai điểm yếu nhỏ, không đủ để đổi kết luận. Chiều đỏ của soan E12 chỉ còn là tệp đích vắng, và bảng tự ghi rằng luật P0 không bắt được ở chế độ static. Việc tách hàm ở ld E5 điều 3 được xếp loại 3 dù đó là tái cấu trúc, không phải lỗi răng.
    - operational-feasibility: UNCERTAIN — 5 dòng khai-not-run (khung-tao-okr-nhu-deal E6/E24, the-gop-y-okr E1/E11) đúng loại 1: commit 081c9b792 xoá cot-gop-y.tsx và bảng ghi vật VẮNG ở HEAD. Phần lớn dòng sua-rang có đột biến vẫn đỏ (khoa E3/E6/E4, lenh E5/E3/E8). Chưa thể PASS vì ba chỗ không tự chứng minh trong hai tệp. Một: lenh-dung E2 và E3 neo thước vào cây sha gộp eeb6ea30, còn chạy trên HEAD ra MA 2 (bảng nói không chứng được cây HEAD), nên không loại trừ được ô đỏ vì sản phẩm hỏng thật; căn cứ của hai dòng này là một sha chứ không trỏ quyết định hay luật. Hai: khoa E4 và lenh E8 nói tiền đề bị quyết định hay luật lật, nhưng bảng chỉ trỏ decisions.jsonl:28 và contract.md:3 (dòng mô tả feature) mà không có nguyên văn, trong khi vật vẫn còn trong sản phẩm (trần 60_000 trong spec; 29 cảnh báo lint ở HEAD, còn ly_do ghi nay 20). Ba: soan-okr-song-lai E12 sau sửa chỉ còn chiều đỏ duy nhất là tệp đích vắng, bảng tự nhận design-gate static không chặn nổi P0 nào, mà expected vẫn giữ chiều đỏ gray-on-color.
    - spec-alignment: UNCERTAIN — Trong 12 dòng khai-not-run/sua-rang, 4 dòng khai-not-run (khung-tao E6/E24, the-gop-y-okr E1/E11) rõ là loại 1: commit 081c9b792 xoá cot-gop-y.tsx và bảng in VẮNG ở HEAD. khoa-con-bat E4 (loại 2, trỏ decisions.jsonl:28) và E3/E6 (loại 3) còn chiều đỏ qua đột biến. Ba dòng còn lại chưa đủ căn cứ. lenh-dung-do E2/E3 chỉ trỏ sha eeb6ea30 chứ không trỏ luật F10, và bảng cho thấy răng chạy trên HEAD thoát mã 2 mà không nói vật còn nguyên hay hỏng. E8 ghi "nay 20" cảnh báo nhưng bảng in "Found 29 warnings". E12 (soan-okr) chỉ còn chiều đỏ là tệp đích vắng, trong khi expected vẫn khai chiều đỏ gray-on-color mà chính lý do thừa nhận không bắt được.
  rationale: Hội đồng chia: một phiếu PASS, hai phiếu UNCERTAIN. Bốn dòng khai-not-run là loại 1 rõ ràng và phần lớn dòng sua-rang vẫn có đột biến còn bắt được. Chưa chắc ở ba chỗ: căn cứ của lenh-dung-do-khong-ai-thay E2/E3 chỉ là một sha, E4/E8 thiếu nguyên văn quyết định hay luật, và soan-okr-song-lai E12 chỉ còn chiều đỏ là tệp đích vắng.
  required_evidence:
    - Nguyên văn dòng 28 của _acceptance/tro-ly-okr-nen/decisions.jsonl (kèm ngày ký) cho thấy quyết định cho phép trần riêng 60 giây ở 5 ca đo quyền và nằm sau AC-4 của khoa-con-bat-xa-tran. Có thì khoa:E4 chắc chắn là loại 2.
    - Đầu ra của node _acceptance/lenh-dung-do-khong-ai-thay/rang/khong-doc-ngoai-suspense.mjs --goc . trên cây HEAD ra mã 0 hoặc 1 kèm danh sách file (không phải MA 2 ở dau-trang-okr.tsx), hoặc một ô riêng quét HEAD. Có thì E2 không còn che lỗi sản phẩm hiện tại.
    - Nguyên văn luật F10 (neo thước vòng này vào cặp sha gộp) kèm ngày ký, từ _acceptance/thuoc-khong-tu-het-han/contract.md hoặc decisions.jsonl, làm căn cứ loại 2 cho lenh-dung E2/E3/E8 thay cho sha eeb6ea30 và dòng mô tả feature.
    - Với soan-okr-song-lai:E12, một đột biến hoặc đối chứng âm làm design-gate --mode static đỏ vì lỗi thiết kế thật (ví dụ chèn text-gray-400 trên bg-blue-600 vào bản sao nut-soan.tsx, thấy gray-on-color, mã 2), hoặc sửa expected bỏ chiều đỏ gray-on-color cho khớp giới hạn đã nhận.
    - lenh-dung-do-khong-ai-thay E2/E3: trường can_cu trong danh-sach.json trỏ tới luật F10 (đoạn trích _acceptance/thuoc-khong-tu-het-han/contract.md:3, như E8 đã làm), không chỉ trỏ sha eeb6ea30. Và sửa số "nay 20" trong ly_do của E8 cho khớp "Found 29 warnings" mà bang-truoc-sau.md in ra, hoặc ghi rõ hai số đo ở hai thời điểm khác nhau.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

- cmd: bunx turbo run lint --force
  run_id: minted-ba-ho-so-do-san-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

- cmd: bun run lint:slop
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

- cmd: bunx turbo run build --force
  run_id: minted-ba-ho-so-do-san-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-14T05:47:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: cả năm eval mới đều có baseline n-a (xem dưới), nên chưa có phép đo A/B nào để xác nhận hay bác điều này.

Baseline khong do

- bun _acceptance/ba-ho-so-do-san/rang/paths-song.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/paths-song.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/danh-sach.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/danh-sach.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/khai-du.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/khai-du.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/ghim-xanh.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi
- bun _acceptance/ba-ho-so-do-san/rang/chieu-do.mjs: bo qua baseline: tep _acceptance/ba-ho-so-do-san/rang/chieu-do.mjs co o cay dang kiem nhung chua co o merge-base c4c8ab0abbaf672b9310df40da4e624ae79b6e25 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6 failed — rang khong-noi-thuoc bao «SAI khong tep nao cua ho so khac hay canh-cay.mjs bi cham (72 tep doi)» va dong cuoi «khong-noi-thuoc: 1 SAI»; cac eval may khac (E1, E2, E3, E4, E7, E8) va 7 lenh suite deu dat; E5 la judgment dang UNCERTAIN cho nguoi quyet o Cong 2. Returned to implementation.
Round 2: moi eval may (E1, E2, E3, E4, E7, E8) va 7 lenh suite deu dat; E5 la judgment dang UNCERTAIN (mot phieu PASS, hai phieu UNCERTAIN). REJECT vi phan loai pham vi giu lai bon phat hien trong hop dong: AC-8 (chieu-do khong do loi hua «dung thong diep ghim», 7/9 dot bien khong ghim thong_diep_may) va AC-5 (bang-truoc-sau.md khong sinh lai, khoi «Sau (HEAD)» cua soan-okr-song-lai:E12 in expected cu). Returned to implementation.
