---
schema_version: 2
feature_slug: goi-y-mo-ke-hoach
verdict: REJECT
failed_evals: [E10]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5f6a54fe35437ad41b836188849699984376be1e
human_signoff:
---

# Evidence Report: goi-y-mo-ke-hoach

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
| E9 | AC-9 | judgment | PASS (de xuat cua hoi dong, cho nguoi quyet) |
| E10 | AC-10 | script | FAIL |
| E11 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-y-mo-ke-hoach-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_sinh
  verified_at: 2026-10-16T11:12:26Z
  output: |
    test-run: dropped crm_mvavcj89yz25_test

- eval: E2
  run_id: minted-goi-y-mo-ke-hoach-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_chan
  verified_at: 2026-10-16T11:12:26Z
  output: |
    test-run: dropped crm_mvavck54mvka_test

- eval: E3
  run_id: minted-goi-y-mo-ke-hoach-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_xu_ly
  verified_at: 2026-10-16T11:12:26Z
  output: |
    test-run: dropped crm_mvavciwrbsbu_test

- eval: E4
  run_id: minted-goi-y-mo-ke-hoach-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_dong
  verified_at: 2026-10-16T11:12:26Z
  output: |
    test-run: dropped crm_mvavcjruvxys_test

- eval: E5
  run_id: minted-goi-y-mo-ke-hoach-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_the
  verified_at: 2026-10-16T11:12:26Z
  output: |
    Ran 7 tests across 1 file. [1.99s]

- eval: E5b
  run_id: minted-goi-y-mo-ke-hoach-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_san_thiet_ke
  verified_at: 2026-10-16T11:12:26Z
  output: |
    gy san: 2 tep, 0 vi pham

- eval: E6
  run_id: minted-goi-y-mo-ke-hoach-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_man
  verified_at: 2026-10-16T11:12:26Z
  screenshot: evidence/E6-the-1280.png
  observed: |
    E6-the-1280.png: trang Thoa thuan o 1280x900 (nen toi), sheet deal 'Hop dong goi y that kavcrpx' mo ben phai. Duoi tieu de co the goi y: icon, dong 'Deal da thang — mo ke hoach 30 ngay cho Cong ty Co phan Dau tu va Phat trien Thuong mai Dich vu ...' (ten cong ty hien, bi cat o mep phai viewport), cau 'Mo ke hoach cho cong ty nay thi goi y tu dong.', hai nut 'Mo ke hoach' (xanh, noi bat) va 'Bo qua'. Khop Expected (the + ten cong ty + hai nut).
    E6-the-375.png: khung dien thoai 375 rong, sheet day tu duoi len. The goi y hien tron ven: tieu de day du 'Deal da thang — mo ke hoach 30 ngay cho Cong ty Co phan Dau tu va Phat trien Thuong mai Dich vu An Phat Hung Thinh that kavcrpx?', mo ta, hai nut 'Mo ke hoach' va 'Bo qua' ngang toan chieu rong the. Khong thay noi dung tran ngang; cac cot 'Gia tri / Ngay du... / O giai doan / Phu trach' co hien nhung nam trong khung. (Phan dau sheet o 375: tieu de deal xuong dong rat hep canh nut trang thai — dang xau nhung khong phai tran ngang, ngoai pham vi AC-6.)
    E6-sau-bo-qua-1280.png: cung sheet deal sau khi bam 'Bo qua': khong con the goi y, tu thanh 'Gia tri / Ngay du kien chot / O giai doan' len ngay duoi tieu de. Khop Expected (the mat); DB ghi trangThai=BO_QUA qua dong 'E6 bo qua: DAT — the mat=true trangThai=BO_QUA'.
    E6-nguoi-khac-1280.png: phien Q mo cung sheet 'Hop dong goi y that kavcrpx' (khong ve dang nhap, khong 404, ten deal hien), khong co the goi y, noi dung bat dau tu 'Gia tri / Ngay du kien chot / O giai doan'. Khop Expected (khong hien cho nguoi khac).
    Ket luan: bon frame khop Expected; ba luot tu thu deu bao KHONG DAT.
  network_observed: n-a (driver)
  output: |
    Frame da luu trong .acceptance-runs/goi-y-mo-ke-hoach/evidence/: E6-the-1280.png, E6-the-375.png, E6-nguoi-khac-1280.png, E6-sau-bo-qua-1280.png.
    Ghi chu nho khong lam hong eval: o 1280 phan phai cua sheet bi cat o mep viewport; vi tri mep trai sheet khac nhau giua cac anh (685 vs 745) nen nhieu kha nang chup giua luc sheet truot vao; khong phai loi cuon ngang cua the.

- eval: E7
  run_id: mvavcj94iwdv
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_nhac
  verified_at: 2026-10-16T11:12:26Z
  output: |
    test-run: dropped crm_mvavcj94iwdv_test

- eval: E8
  run_id: minted-goi-y-mo-ke-hoach-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.gymk_thuoc
  verified_at: 2026-10-16T11:12:26Z
  output: |
    test-run: dropped crm_mvavcisoxeff_test

- eval: E10
  run_id: minted-goi-y-mo-ke-hoach-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.gymk_hoi_quy
  verified_at: 2026-10-16T11:12:26Z
  output: |
    tu-thu 5/5: sua gia tri nhieu dong -> bat; sua khoang trang trong chuoi -> bat; doi khoang trang ngoai chuoi -> khong bat; doc M/D/R -> dung; tep bi xoa -> bat
    apps/app/test/khung-okr-truoc-r1.dom.tsx: expect bi xoa hay sua: expect(hang?.lastElementChild,`nhom soan khong cuoi thanh: ${d.ten}`).toBe(nhom)
    apps/app/test/okr-thanh-tab.dom.tsx: expect bi xoa hay sua: expect(o.querySelector("h1")?.textContent).toBe(m.tieuDe["hoi-y"])
    apps/app/test/okr-theo-don-vi.dom.tsx: expect bi xoa hay sua: (ba cau, gom nutTruong/thanhVien, wrap/trongDau/cardAction, tieuDe/lienKet/dangChon)
    apps/app/test/okr-to-chuc-va.dom.tsx: expect bi xoa hay sua: (hai cau, nut them va nut nhap)
    apps/app/test/soan-okr-song-lai.spec.ts: expect bi xoa hay sua: expect(page,"trang khong tinh co cau noi").toMatch(...)
    apps/app/test/soan-okr.dom.tsx: expect bi xoa hay sua: expect(q("[data-nut-soan]")).toBeNull()
    moc 7ebcb0242 · 7 tep · 353 cau expect san co · 0 cau cho phep mat

- eval: E11
  run_id: minted-goi-y-mo-ke-hoach-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.gymk_dot_bien
  verified_at: 2026-10-16T11:12:26Z
  output: |
    dot-bien: 10/10 cap dat

### Judge (E9) — de xuat, chua co nguoi chot

- eval: E9
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ca ba tham phan cung thay sau dieu hop dong deu co chu ro trong CONTEXT.md, docs/api.md va hang DA3b cua lo-trinh-viec-du-an.json.
  panel (de xuat):
    - domain-correctness: PASS — Ca sau dieu deu co chu ro trong ba tep. (1) CONTEXT.md dinh nghia «Goi y mo ke hoach» la ban ghi may sinh, va muc «Goi y» (dong 348-350) tu noi khac. (2) CONTEXT.md va api.md neu du ba dieu kien sinh (di tu giai doan khong phai thang hoac tao moi, cong ty chua co ke hoach mo, deal chua co goi y cho) va «moi lan chuyen sang thang la mot goi y». (3) Ba ket cuc cho · da mo ke hoach · da bo qua va quyen bo qua cua nguoi nhan hoac quan tri co o CONTEXT.md, con api.md ghi 403 cho nguoi khac. (4) createFromTemplate, tRPC hay REST, chuyen moi goi y cho cua cong ty sang DA_MO. (5) goiYCuaDeal va boQuaGoiY deu co trong api.md. (6) Hang DA3b ghi «dang dung», khong con «chua mo». Muc «Ke hoach 30 ngay» con dat «du an» vao Avoid, va api.md khong co chu «du an».
    - operational-feasibility: PASS — Ca sau dieu deu co chu ro trong ba tep duoc giao. (1) CONTEXT.md dinh nghia «Goi y mo ke hoach» la ban ghi may sinh, tach khoi «Goi y» la cau huong xu ly di kem nhac ke hoach im. (2) CONTEXT.md va api.md dong 313-316 neu du dieu kien sinh, moi lan chuyen mot goi y. (3) Ba ket cuc cho, da mo ke hoach, da bo qua nam o CONTEXT.md, con api.md noi nguoi khac bo qua bi 403. (4) createFromTemplate chuyen moi goi y CHO cua cong ty sang DA_MO. (5) Hai thu tuc goiYCuaDeal va boQuaGoiY co trong api.md. (6) Hang DA3b ghi «dang dung», con «chua mo» chi nam o cac hang khac. Hai tep CONTEXT.md va api.md chi nhac chu «du an» de loai no khoi nghia cua ke hoach 30 ngay.
    - spec-alignment: PASS — Sau dieu deu co trong ba tep. (1) va (3) nam o CONTEXT.md dong 348-364: «Goi y» la cau trong tin nhac, «Goi y mo ke hoach» la ban ghi may sinh, co ba ket cuc cho · da mo ke hoach · da bo qua, va chi nguoi nhan hoac quan tri bo qua duoc. (2), (4) va (5) nam o docs/api.md dong 310-323: dieu kien sinh, moi lan chuyen mot goi y, createFromTemplate dong moi goi y CHO cua cong ty bat ke duong nao, va hai thu tuc goiYCuaDeal va boQuaGoiY. (6) Hang DA3b trong lo-trinh-viec-du-an.json co trang_thai la «dang dung», khong phai «chua mo». Doan Goi y mo ke hoach trong CONTEXT.md, doan tuong ung trong api.md va hang DA3b khong dung chu «du an» cho ke hoach 30 ngay. Tep lo trinh co dung «du an» o hang DA4, nhung do la khai niem Du an khac.
  required_evidence:
    - (judge khong neu bang-chung-thieu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_api-r1
  exit_code: 1
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z
  output: |
    api:test: 6 tests failed:
    api:test: (fail) what the enrichment widget reads > lists work that is due now [7.65ms]
    api:test: (fail) what the enrichment widget reads > names the company a due row is about [1.26ms]
    api:test: (fail) what the enrichment widget reads > hands back exactly the number of rows asked for [1.45ms]
    api:test: (fail) what the enrichment widget reads > counts every due task, not only the ones it returned [3.32ms]
    api:test: (fail) what the enrichment widget reads > treats a nonsense limit as one row, never as none [1.47ms]
    api:test: (fail) what the enrichment widget reads > reads the whole page when asked for more than exists [1.87ms]
    api:test:  1878 pass / 6 skip / 6 fail. Ran 1890 tests across 225 files. [296.86s]

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 1
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z
  output: |
    agent:test: 2 tests failed:
    agent:test: (fail) duong > duong: moi loai, duong thong bao trung duong tin Zalo truoc vong [0.11ms]
    agent:test: (fail) htb-kenh > htb-kenh: 2 — tin Zalo va Slack moi loai trung tung byte ban chup truoc vong [12.16ms]
    agent:test:  1277 pass / 1 skip / 2 fail. Ran 1280 tests across 139 files. [120.98s]

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 1
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z
  output: |
    @crm/validation:test: 1 tests failed:
    @crm/validation:test: (fail) khoa-thong-bao > du 21 loai, khong trung [0.05ms]
    @crm/validation:test:  566 pass / 1 fail. Ran 567 tests across 51 files. [4.87s]

- cmd: bunx turbo run lint --force
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z

- cmd: bun run lint:slop
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z
  output: |
    Finished in 1.6s on 3582 files with 11 rules using 18 threads.

- cmd: bunx turbo run build --force
  run_id: minted-goi-y-mo-ke-hoach-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  baseline: n-a
  verified_at: 2026-10-16T11:12:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

Lệnh fail không gắn eval (ghi rõ để người quyết thấy, không gán cho AC nào):
- bun run test -- --filter=api: sáu ca "what the enrichment widget reads" đỏ.
- bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db: hai ca đỏ ở "duong" và "htb-kenh" (so với bản chụp trước vòng của tin Zalo và Slack).
- bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation: một ca đỏ "khoa-thong-bao > du 21 loai, khong trung".
- Lệnh của E10 cũng được xếp ở đây theo bản tính sẵn; nó đã gắn E10 (xem failed_evals). Nguyên nhân E10 đỏ theo review-findings.md: lệnh ghim mốc 7ebcb0242 trong khi merge-base hiện tại là 28d8ca19f, nên thước quét cả thay đổi test của PR khác.

Non-discriminating evals (xanh ở cả HEAD lẫn baseline):
none — moi eval feature deu red tren baseline (co phan biet)
Lưu ý: không eval nào có số đo baseline (mọi field baseline là n-a, lý do ở mục dưới), nên dòng "none" nghĩa là không phát hiện eval không-phân-biệt nào, chưa phải bằng chứng đã đo red.

Baseline khong do
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-sinh": bo qua baseline: tep apps/api/test/goi-y-mo-ke-hoach.spec.ts co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-chan": bo qua baseline: tep apps/api/test/goi-y-mo-ke-hoach.spec.ts co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-xu-ly": bo qua baseline: tep apps/api/test/goi-y-mo-ke-hoach.spec.ts co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.spec.ts -t gy-dong": bo qua baseline: tep apps/api/test/goi-y-mo-ke-hoach.spec.ts co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/goi-y-ke-hoach.dom.tsx: bo qua baseline: tep apps/app/test/goi-y-ke-hoach.dom.tsx co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/goi-y-mo-ke-hoach/rang/san-thiet-ke.mjs: bo qua baseline: tep _acceptance/goi-y-mo-ke-hoach/rang/san-thiet-ke.mjs co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/agent && TZ=Asia/Ho_Chi_Minh bun test test/goi-y-mo-ke-hoach.integration.spec.ts -t gy-nhac": bo qua baseline: tep apps/agent/test/goi-y-mo-ke-hoach.integration.spec.ts co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- bun run test -- "cd apps/api && bun test test/goi-y-mo-ke-hoach-do-nguong.spec.ts": bo qua baseline: tep apps/api/test/goi-y-mo-ke-hoach-do-nguong.spec.ts co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs --tu-thu && node _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs --moc 7ebcb0242 && bun run check-types: bo qua baseline: tep _acceptance/goi-y-mo-ke-hoach/rang/khong-xoa-expect.mjs co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/goi-y-mo-ke-hoach/rang/dot-bien.mjs: bo qua baseline: tep _acceptance/goi-y-mo-ke-hoach/rang/dot-bien.mjs co o cay dang kiem nhung chua co o merge-base 28d8ca19ff923bc0ce686700c43dd69dcbe3f711 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — lệnh hồi quy ghim mốc 7ebcb0242 thay vì merge-base hiện tại 28d8ca19f, nên báo expect bị xoá hay sửa ở 7 tệp OKR do PR khác của onehub đổi; ba lệnh suite (api, agent, validation) cũng đỏ ngoài eval nào. Returned to implementation.
