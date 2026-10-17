---
schema_version: 2
feature_slug: cho-tac-nhan-lau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 75c07b7a29904934857b49cb8bd3739f5ee60d8c
human_signoff: Phan Le Manh 2026-10-17 — ký Cổng 2 trên S4 vòng 5 (10/10 eval, 7/7 suite PASS; ghim lại ở 09fe4bcad, repin-20261017T030953Z-59292). Ngoài-1 tới Ngoài-12 ghi Known limits; Ngoài-13 mở hợp đồng mới; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: cho-tac-nhan-lau

Round 5. Bốn eval (E4, E5, E8, E9) và bảy lệnh suite chạy lại trên cây 0d258734285530c1fcdc08f6fbd0640eee97fbdf; sáu eval còn lại (E1, E2, E3, E6, E7, E10) được mang sang từ round 3 vì delta không chạm paths của chúng (xem từng khối).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-cho-tac-nhan-lau-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T12:22:26Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-cho-tac-nhan-lau-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T12:22:26Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-cho-tac-nhan-lau-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-16T12:22:26Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E4
  run_id: mvbn54ixobs2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_bao_khi_xong
  verified_at: 2026-10-17T00:10:42Z
  output: |
    cmd: bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 TZ=Asia/Ho_Chi_Minh bun test test/cho-tac-nhan-lau.integration.spec.ts"
    1 lan chay, 1 dat, khong phuong sai.
    test-run: dropped crm_mvbn54ixobs2_test

- eval: E5
  run_id: minted-cho-tac-nhan-lau-E5-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_dong_chuong
  verified_at: 2026-10-17T00:10:42Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cho-tac-nhan-lau-chuong.dom.tsx
    Ran 3 tests across 1 file. [463.00ms]

- eval: E6
  run_id: minted-cho-tac-nhan-lau-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_doc_khi_mo
  verified_at: 2026-10-16T12:22:26Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-cho-tac-nhan-lau-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_bao_khi_xong
  verified_at: 2026-10-16T12:22:26Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-cho-tac-nhan-lau-E8-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ctnl_the_dung
  verified_at: 2026-10-17T00:10:42Z
  output: |
    cmd: cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --preload ../../packages/ui/test/setup-dom.ts ./test/cho-tac-nhan-lau.dom.tsx
    Ran 6 tests across 1 file. [4.46s]

- eval: E9
  run_id: minted-cho-tac-nhan-lau-E9-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctnl_do_man
  verified_at: 2026-10-17T00:10:42Z
  screenshot: evidence/duoi-nguong-375.png
  observed: |
    duoi-nguong-375.png: the "Đang dựng tác nhân", "Đã 0:06", "1 trên 4", bốn bước (Phạm vi Xong, Chỉ dẫn Đang làm, Bản khai/Soát lại Đang xếp), ngay dưới là lời hứa "Bạn có thể rời trang. Kara sẽ báo trong hộp thông báo khi xong." + nút Dừng; KHÔNG có dòng quá ngưỡng; chuông "1"; không tràn ngang. duoi-nguong-1280.png: giống, bố cục có thanh bên, cùng lời hứa, không dòng quá ngưỡng. tren-nguong-375.png: "Đã 4:17", trong thẻ có dòng "Đã quá 3 phút. Kara vẫn đang dựng." cùng lời hứa chặn thẻ, vừa khổ 375. tren-nguong-1280.png: "Đã 4:14", cùng dòng quá ngưỡng. (Chữ "Đã quá 3 phút…" là cách nói của dòng "lâu hơn thường lệ" trong bản mẫu thiết kế.) chuong-375.png / chuong-1280.png: mở chuông ra hộp "Thông báo" có dòng "Kara đã dựng xong «Đo màn: tóm tắt deal mỗi sáng» — mở để duyệt" 07:11, chấm chưa đọc, nút chuông "1" — có tên tác nhân. mo-tu-chuong-375.png / -1280.png: sau khi bấm dòng, cuộc trò chuyện "Đo màn: đã xong" mở, chuông không còn số (1 -> 0). mo-tu-thanh-ben-1280.png: mở từ thanh bên, chuông cũng hết số. Không khung nào có tràn ngang, không khoá messages thô (không thấy chuỗi dạng a.b.c), không chữ máy trong thẻ/chuông. Ghi chú nhỏ: hàng "Eve:subagent:agent builder" phía trên thẻ là chrome có sẵn của thanh hội thoại, ngoài phạm vi AC-9.
  network_observed: n-a (driver)
  output: |
    9 assertion cua script deu DUNG: tren-nguong-1280 ("Đã 4:14", dong qua nguong "Đã quá 3 phút. Kara vẫn đang dựng.", rong trang 1280); tren-nguong-375 ("Đã 4:17", cung dong, rong 375); duoi-nguong-1280 ("Đã 0:06", dong qua nguong null); duoi-nguong-375 (nhu tren, rong 375); chuong-1280 (dong "Kara đã dựng xong «Đo màn: tóm tắt deal mỗi sáng» — mở để duyệt", chua doc 1, rong 1280); mo-tu-chuong-1280 (mo cuoc tro chuyen, chua doc 1 -> 0); chuong-375 (tuong tu, rong 375); mo-tu-chuong-375 (1 -> 0); mo-tu-thanh-ben-1280 (1 -> 0 trong 10 s, khong tai lai).
    Doi chieu mat 9 anh moi (mtime 17/10 07:11) da Read: duoi-nguong-375/1280, tren-nguong-375/1280, chuong-375/1280, mo-tu-chuong-375/1280, mo-tu-thanh-ben-1280 (thu muc _acceptance/cho-tac-nhan-lau/evidence/). Tat ca khop Expected. Cac tep E9-step1..8.png va E9-network.txt trong thu muc la cua lan chay truoc (16/10), khong phai frame cua lan nay; lan chay nay da ghi de 8 anh nhom tren (tep theo doi git, la hanh vi cua chinh lenh eval). Network: driver capture-only, khong doc duoc network.
    Ghi chu (khong lam fail): dong "Eve:subagent:agent builder" tren the dang dung la phan chrome cua thanh hoi thoai chung (goi tac nhan phu), khong thuoc diff vong nay va khong thuoc the/chuong ma AC-9 do; nhac de nguoi duyet biet.

- eval: E10
  run_id: minted-cho-tac-nhan-lau-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ctnl_san_thiet_ke
  verified_at: 2026-10-16T12:22:26Z
  carried_from_round: 3
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_api-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_app_filter_crm_ui-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_agent_filter_crm_aut-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_test_filter_agent_okr_filter_crm-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-cho-tac-nhan-lau-SUITE-bunx_turbo_run_lint_force-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

- cmd: bun run lint:slop
  run_id: minted-cho-tac-nhan-lau-SUITE-bun_run_lint_slop-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

- cmd: bunx turbo run build --force
  run_id: minted-cho-tac-nhan-lau-SUITE-bunx_turbo_run_build_force-r5
  exit_code: 0
  verified_at: 2026-10-17T00:10:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Moi eval ghi baseline n-a. Lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

none — khong eval nao duoc xac dinh la khong-phan-biet.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, khong eval nao co phuong sai)

## Iterations

Round 1: baseline do lan cuoi (evals.yaml khong doi tu do).
Round 2: E5 chay lai (run_id hau to -r2), cac round sau mang sang.
Round 3: E1-E4, E6-E10 chay lai (run_id hau to -r3).
Round 4: bay lenh suite chay lai tren cay 6f333c474fc9afd4997426bcc1a61ef07010003c va deu xanh; muoi eval mang sang vi delta khong cham paths. Mot phat hien trong hop dong (AC-9, muc medium) nam o review-findings.md.
Round 5: E4, E5, E8, E9 va bay lenh suite chay lai tren cay 0d258734285530c1fcdc08f6fbd0640eee97fbdf va deu xanh (E9 ghi de 8 anh nhom tren cung 1 anh moi, xem khoi E9); E1, E2, E3, E6, E7, E10 mang sang tu round 3 vi delta khong cham paths. Gio chay round 5 ghi theo ngay; ts chinh xac nam trong run-log.jsonl.

### Re-pin lần 1 — 2026-10-17, do ghim lại ở tip sau gộp onehub 7bf7be206, trước chữ ký Cổng 2
run_id: repin-20261017T030953Z-59292
sha: 09fe4bcad3ec78687309419c3c249d7b3dbc9d9c · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E9 · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-17, do ghim lại sau gộp onehub f6b0cb479 (#456 đổi dau-trang-okr.tsx)
run_id: repin-20261017T035557Z-57487
sha: 75c07b7a29904934857b49cb8bd3739f5ee60d8c · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E9 · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
