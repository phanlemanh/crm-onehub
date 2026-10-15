---
schema_version: 2
feature_slug: ba-ho-so-do-san
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b9acad6b77fde52541221e857cd2eb01d839e45f
human_signoff: Phan Le Manh 2026-10-14
---

# Evidence Report: ba-ho-so-do-san

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | judgment | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ba-ho-so-do-san-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_paths_song
  verified_at: 2026-10-14T06:46:51Z
  output: |
    paths-song: 12 ho so, 0 muc chet, 0 bo loc tat moi

- eval: E2
  run_id: minted-ba-ho-so-do-san-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_danh_sach
  verified_at: 2026-10-14T06:46:51Z
  output: |
    ngoai_vong: 15 ho so tu kiem-cheo/2026-10-11,2026-10-12,2026-10-13.json, yeu cau P7-5

- eval: E3
  run_id: minted-ba-ho-so-do-san-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_khai_du
  verified_at: 2026-10-14T06:46:51Z
  output: |
    khai-du: 32 commit cua vong, 7 ho so hoan lai nguyen, 44 tep doi ngoai ho so nay, 110 eval doi, moi thay doi co dong danh sach

- eval: E4
  run_id: minted-ba-ho-so-do-san-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_ghim_xanh
  verified_at: 2026-10-14T06:46:51Z
  output: |
    ghim-xanh: 12/12 ho so

- eval: E5
  judged_by: judge panel (fresh context, 3 lens) — de xuat PASS
  verdict: PASS
  rationale: Ca 12 dong khai-not-run/sua-rang xep duoc vao mot trong ba loai (vat bi go o HEAD; quyet dinh/luat da ghi; loi cua rang), khong dong nao ha o do vi san pham hong that, moi dong sua-rang con dot bien hay doi chung am lam rang van do. De xuat cua panel la PASS; mot phieu con nghi ngo duoc ghi nguyen ben duoi cho nguoi quyet o Cong 2.
  votes:
    - domain-correctness: PASS — Cả 12 dòng khai-not-run/sua-rang đều có mục tương ứng trong bảng và lý do rơi vào một trong ba loại. Bốn dòng khai-not-run có vật `cot-gop-y.tsx` bị commit 081c9b792 xoá, bảng ghi "ở HEAD: VẮNG" (loại 1). Dòng soan E12 có `man-soan.tsx` bị 574292047 gỡ. Các dòng khoa-con-bat E4 (quyết định d-…-28 ký sau), lenh-dung E5/E2/E3/E8 (CLAUDE.md:14 và luật F10) thuộc loại 2, còn khoa-con-bat E3/E6 và các mục maxBuffer thuộc loại 3. Không dòng nào hạ một ô vì sản phẩm hỏng thật, và mỗi dòng sua-rang đều có đột biến hay đối chứng âm làm răng vẫn đỏ, với đầu ra `chieu-do.mjs` ghi "that dat, dot bien bat". Có ba điểm mỏng nhưng không đủ để FAIL. Một: ý "design-gate static không chặn được P0 nào" của soan E12 chỉ được khẳng định, bảng không chứng minh. Hai: dòng "tách hàm buildTrongPrePush" của lenh-dung E5 dùng chính tệp mới làm căn cứ. Ba: lenh-dung E2 với cây HEAD thoát mã 2 vì răng không đọc được tệp, không phải vì sản phẩm hỏng.
    - operational-feasibility: UNCERTAIN — Bốn dòng khai-not-run (khung-tao-okr-nhu-deal E6/E24, the-gop-y-okr E1/E11) đúng loại 1: căn cứ là commit 081c9b792 gỡ cot-gop-y.tsx, bảng ghi tệp VẮNG ở HEAD. Tám dòng sua-rang phần lớn hợp lệ và còn chiều đỏ (đầu ra chieu-do.mjs in "that dat, dot bien bat" ở từng dòng). Hai dòng bảng chưa đủ căn cứ. Một là khoa-con-bat-xa-tran:E4, xếp loại 2 vì quyết định d-...-28 ký sau AC-4. Nhưng lệnh grep trong bảng in approved_at rỗng và dòng quyết định bị cắt ở 700 ký tự, nên thứ tự "ký sau" không thấy được trong bảng. Hai là lenh-dung-do-khong-ai-thay:E5, có lý do "tách điều 3 thành hàm... không đổi hành vi" nhưng gắn loại 3 (lỗi của răng). Đó là refactor, bảng không cho thấy điều 3 trước đó là lỗi của răng.
    - spec-alignment: PASS — Cả 12 dòng khai-not-run và sua-rang đều xếp được vào đúng một loại, mỗi dòng có căn cứ. Bốn dòng khai-not-run (khung-tao-okr-nhu-deal E6 và E24, the-gop-y-okr E1 và E11) thuộc loại 1: cot-gop-y.tsx bị gỡ ở 081c9b792 và bảng ghi «VẮNG» ở HEAD. Các dòng sua-rang: soan-okr E12 thuộc loại 1 (574292047 gỡ man-soan.tsx); khoa-con E4 và lenh-dung E2, E3, E8 (mệnh đề đếm cảnh báo lint) thuộc loại 2 (quyết định đã ghi, luật F10, CLAUDE.md:14); khoa-con E3, E6 và lenh-dung E5, E8 (maxBuffer) thuộc loại 3. Không dòng nào hạ ô đỏ vì sản phẩm hỏng thật, và mọi dòng sua-rang đều còn ít nhất một đột biến làm răng đỏ, kèm đầu ra «that dat, dot bien bat». Có ba chỗ yếu nhưng không đổi được kết luận. (1) soan-okr E12 chỉ còn chiều đỏ «tệp đích vắng», và bảng thừa nhận điều đó. (2) lenh-dung E5 xếp việc tách hàm dùng chung vào loại 3, dù đó là việc giữ chiều đỏ chứ không sửa lỗi. (3) khoa-con E4 dẫn decisions.jsonl:28 bị cắt ở 700 ký tự, nên bảng không cho thấy «chủ kho chọn (c) 13/10».
  required_evidence (từ phiếu operational-feasibility):
    - Ngày ký AC-4 của khoa-con-bat-xa-tran (approved_at hoặc dòng sổ quyết định ghi AC-4 chốt trước 2026-09-27T11:28:53Z), lấy ở _acceptance/khoa-con-bat-xa-tran/contract.md hoặc decisions.jsonl của hồ sơ đó. Kèm dòng 28 của _acceptance/tro-ly-okr-nen/decisions.jsonl in đủ, không cắt, với trạng thái đã ký. Có mục này thì khoa-con-bat-xa-tran:E4 mới xác nhận được là loại 2.
    - Bằng chứng điều 3 của lenh-dung-do-khong-ai-thay:E5 ở mốc nền 3a2783409 không khai được đột biến hay đối chứng âm, tức là một lỗi của răng chứ không chỉ refactor. Ví dụ chạy ba-noi-deu-chay.mjs ở mốc nền với .githooks/pre-push đã bỏ build rồi ghi đầu ra cho thấy nó không bắt được. Nếu không có bằng chứng đó thì tách dòng lý do thứ ba khỏi ly_do_tach vì nó không thuộc loại nào trong ba loại.
  human_override:  # chi nguoi ghi

- eval: E7
  run_id: minted-ba-ho-so-do-san-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_danh_sach
  verified_at: 2026-10-14T06:46:51Z
  output: |
    ngoai_vong: 15 ho so tu kiem-cheo/2026-10-11,2026-10-12,2026-10-13.json, yeu cau P7-5

- eval: E8
  run_id: minted-ba-ho-so-do-san-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.bhds_chieu_do
  verified_at: 2026-10-14T06:46:51Z
  output: |
    chieu-do: 8 dong sua-rang, moi rang sua con bat loi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

- cmd: bunx turbo run lint --force
  run_id: minted-ba-ho-so-do-san-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

- cmd: bun run lint:slop
  run_id: minted-ba-ho-so-do-san-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

- cmd: bunx turbo run build --force
  run_id: minted-ba-ho-so-do-san-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-14T06:46:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Moi eval may mang baseline n-a o round nay.

Eval khong-phan-biet: none. Cac lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform (moi eval may chay mot lan, deterministic, khong co phuong sai).

## Iterations

Round 1: E6 failed — rang khong-noi-thuoc bao «SAI khong tep nao cua ho so khac hay canh-cay.mjs bi cham (72 tep doi)» va dong cuoi «khong-noi-thuoc: 1 SAI»; cac eval may khac (E1, E2, E3, E4, E7, E8) va 7 lenh suite deu dat; E5 la judgment cho nguoi quyet o Cong 2. Returned to implementation.
Round 2: moi eval may (E1, E2, E3, E4, E7, E8) va 7 lenh suite deu dat; REJECT vi phan loai pham vi giu lai bon phat hien trong hop dong: AC-8 (chieu-do khong do loi hua «dung thong diep ghim», 7/9 dot bien khong ghim thong_diep_may) va AC-5 (bang-truoc-sau.md khong sinh lai, khoi «Sau (HEAD)» cua soan-okr-song-lai:E12 in expected cu). Returned to implementation.
Round 3: moi eval may (E1, E2, E3, E4, E7, E8) va 7 lenh suite deu dat tren commit 6309e0f62; panel E5 de xuat PASS (hai phieu PASS, mot phieu con nghi ngo ghi day du o tren); phan loai pham vi khong con phat hien trong hop dong, nam phat hien ngoai hop dong (low/medium) cho nguoi quyet o Cong 2.

### Re-pin lần 1 — 2026-10-15, do ghim ở đỉnh sau gộp onehub 3818ad4ec, ngay trước gộp #406 (làn X lần 2, 11 hồ sơ)
run_id: repin-20261014T231434Z-99400
sha: b9acad6b77fde52541221e857cd2eb01d839e45f · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · ngoài làn máy: E5 (E5 không khai paths) · AC không có chốt máy: AC-5 · chập chờn (đỏ lần đầu, đạt khi chạy lại): lenh-dung-do-khong-ai-thay E8 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
