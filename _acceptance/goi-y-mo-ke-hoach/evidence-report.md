---
schema_version: 2
feature_slug: goi-y-mo-ke-hoach
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 735c996977a6fa3e0aad9753f5b27adaea04267c
human_signoff: manh 2026-10-16
---

# Evidence Report: goi-y-mo-ke-hoach

Round 3. Mọi eval máy được mang sang từ round 1 hoặc round 2 (carry-forward); round này chỉ chạy lại bảy lệnh suite. Còn đúng một việc chờ người: E9 (judgment) cần `human_override`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | judgment | PASS (đề xuất của hội đồng, chờ human_override) |
| E10 | AC-10 | script | PASS |
| E11 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-y-mo-ke-hoach-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_sinh
  verified_at: 2026-10-16T11:40:40Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-goi-y-mo-ke-hoach-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_chan
  verified_at: 2026-10-16T11:40:40Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-goi-y-mo-ke-hoach-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_xu_ly
  verified_at: 2026-10-16T11:40:40Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-goi-y-mo-ke-hoach-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_dong
  verified_at: 2026-10-16T11:40:40Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-goi-y-mo-ke-hoach-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_the
  verified_at: 2026-10-16T11:12:26Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-goi-y-mo-ke-hoach-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_san_thiet_ke
  verified_at: 2026-10-16T11:12:26Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-goi-y-mo-ke-hoach-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_man
  verified_at: 2026-10-16T11:12:26Z
  carried_from_round: 1
  screenshot: evidence/E6-the-1280.png
  observed: |
    E6-the-1280.png: trang Thoa thuan o 1280x900 (nen toi), sheet deal 'Hop dong goi y that kavcrpx' mo ben phai. Duoi tieu de co the goi y: icon, dong 'Deal da thang — mo ke hoach 30 ngay cho Cong ty Co phan Dau tu va Phat trien Thuong mai Dich vu ...' (ten cong ty hien, bi cat o mep phai viewport), cau 'Mo ke hoach cho cong ty nay thi goi y tu dong.', hai nut 'Mo ke hoach' (xanh, noi bat) va 'Bo qua'. Khop Expected (the + ten cong ty + hai nut).
    E6-the-375.png: khung dien thoai 375 rong, sheet day tu duoi len. The goi y hien tron ven: tieu de day du 'Deal da thang — mo ke hoach 30 ngay cho Cong ty Co phan Dau tu va Phat trien Thuong mai Dich vu An Phat Hung Thinh that kavcrpx?', mo ta, hai nut 'Mo ke hoach' va 'Bo qua' ngang toan chieu rong the. Khong thay noi dung tran ngang; cac cot 'Gia tri / Ngay du... / O giai doan / Phu trach' co hien nhung nam trong khung. (Phan dau sheet o 375: tieu de deal xuong dong rat hep canh nut trang thai — dang xau nhung khong phai tran ngang, ngoai pham vi AC-6.)
    E6-sau-bo-qua-1280.png: cung sheet deal sau khi bam 'Bo qua': khong con the goi y, tu thanh 'Gia tri / Ngay du kien chot / O giai doan' len ngay duoi tieu de. Khop Expected (the mat); DB ghi trangThai=BO_QUA qua dong 'E6 bo qua: DAT — the mat=true trangThai=BO_QUA'.
    E6-nguoi-khac-1280.png: phien Q mo cung sheet 'Hop dong goi y that kavcrpx' (khong ve dang nhap, khong 404, ten deal hien), khong co the goi y, noi dung bat dau tu 'Gia tri / Ngay du kien chot / O giai doan'. Khop Expected (khong hien cho nguoi khac).
    Ket luan: bon frame khop Expected; ba luot tu thu deu bao KHONG DAT.
  network_observed: n-a (driver)
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: mvavcj94iwdv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_nhac
  verified_at: 2026-10-16T11:12:26Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-goi-y-mo-ke-hoach-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_thuoc
  verified_at: 2026-10-16T11:40:40Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-goi-y-mo-ke-hoach-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_hoi_quy
  verified_at: 2026-10-16T11:40:40Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-goi-y-mo-ke-hoach-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_dot_bien
  verified_at: 2026-10-16T11:12:26Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

- eval: E9
  judged_by: hoi dong ba lens (domain-correctness, operational-feasibility, spec-alignment) — panel giu nguyen tu round 2 — inputs khong doi, khong cham lai; rationale xem round do
  verdict: PASS
  rationale: panel giu nguyen tu round 2 — inputs khong doi, khong cham lai; rationale xem round do. Day la de xuat cua may, nguoi quyet o Cong 2.
  votes:
    - domain-correctness: PASS (r2)
    - operational-feasibility: PASS (r2)
    - spec-alignment: PASS (r2)
  human_override: Đạt — manh 2026-10-16

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

- cmd: bunx turbo run lint --force
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bunx_turbo_run_lint_force-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

- cmd: bun run lint:slop
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

- cmd: bunx turbo run build --force
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-16T12:17:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do: moi eval feature trong round nay la carry-forward tu round 1 hoac round 2, khong chay lai tren diffBase nen baseline la n-a. Bảy lệnh suite khong gan eval, baseline n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — ba lenh suite do (api, agent, agent-okr) va E10 dung moc cung; tra ve implementation.
Round 2: PENDING-JUDGMENT — E1-E4, E8, E10 va bay lenh suite chay lai xanh; chi con E9 cho nguoi; Cong 1 duoc mo lai de ghi ngoai le co ten cho AC-10 (cau dem loai thong bao 21 thanh 22).
Round 3: PENDING-JUDGMENT — delta chi cham evals.yaml va s4-args.json; moi eval may mang sang tu round 1 hoac 2, chi bay lenh suite chay lai xanh; E9 cho human_override. verified_at cua cac lenh suite la thoi diem ghi bao cao round 3.

## Đo tay ngoài S4 — E10 (AC-10 sau sửa 12:17Z)

Thợ đo, KHÔNG phải tác tử chấm: S4 lượt 3 mang E10 sang từ lượt 2 dù câu expected vừa đổi, và vòng đã chạm trần 3 lượt, nên AC-10 mới được đo lại bằng tay theo yêu cầu của Điều phối M5 (16/10). Người ký đọc mục này như số đo thật, không phải phán quyết của hội đồng.

- cmd (nguyên văn `config:executors.script.gymk_hoi_quy`): `node _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs --moc "$(git merge-base HEAD origin/onehub)" && bun run check-types`
- sha: a335f8be94d25f2afecf1a8b49a948f7e4ac0c02 · lúc: 2026-10-16T12:55:55Z · exit_code: 0
- output: `tu-thu 5/5 …` · `moc 28d8ca19f · 1 tep · 8 cau expect san co · 1 cau cho phep mat` · `khong expect san co nao bi xoa hay sua` · check-types `15 successful, 15 total`
- Chiều đỏ, trên cây sao dùng một lần cắt từ cùng sha:
  - (a) danh sách cho-phép rỗng → exit 1: `packages/validation/test/thong-bao.spec.ts: expect bi xoa hay sua: expect(newSet(LOAI_THONG_BAO).size).toBe(21)` — ngoại lệ là thứ duy nhất cho câu đếm qua.
  - (b) ngoại lệ còn nguyên, đổi giá trị một expect khác cùng tệp (`toBe(b)` → `toBe(a)`) → exit 1: `… expect bi xoa hay sua: expect(a,"muc gop sinh thong bao moi khi so doi").toBe(b)` — ngoại lệ không mở cho câu khác.
  - (c) đối chứng: chỉ đổi khoảng trắng ngoài chuỗi ở câu đó → exit 0 (đúng luật của răng).
- Giới hạn còn lại (Ngoài-4, Ngoài-6 trên thẻ): ngoại lệ so theo chuỗi con và không gắn tên tệp.

### Re-pin lần 1 — 2026-10-16, do ghim lại sau gộp onehub 773115a69 (#443)
run_id: repin-20261016T140424Z-16502
sha: bfb40466cb5e3c0917ddb1cbbae5d010c400601d · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E6, E9 (E9 không khai paths) · diff chạm vật đo ngoài làn máy: E6 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-6, AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-16, do lan-dem-16-10: gộp onehub ngày 16/10 (#434…#453)
run_id: repin-20261016T233032Z-31285
sha: 735c996977a6fa3e0aad9753f5b27adaea04267c · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E6, E9 (E9 không khai paths) · AC không có chốt máy: AC-6, AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
