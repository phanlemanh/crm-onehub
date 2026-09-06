---
schema_version: 2
feature_slug: lenh-chung-khong-an-cache-doi
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: sequential per-command verify (dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: ed221f4b3803b6d1251b1a4667b5cbed21ffdd26
run_id: s4r1-20260906T153520Z-37144
human_signoff:
---

# Evidence Report: lenh-chung-khong-an-cache-doi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: s4r1-20260906T153520Z-37144-E1
  exit_code: 0
  verifier: config:executors.script.kc_suite_cuong_buc
  verified_at: 2026-09-06T15:37:21Z
  output: |
      cuong buc  executors.script.lint_khong_cache
                  bunx turbo run lint --force
      cuong buc  executors.script.lint_slop
                  → oxlint --format=default
    da soi 4 lenh
    XANH: ca 4 lenh chung cua cong deu chay CUONG BUC hoac khong qua turbo — khong lenh nao co the tra ve mot mau xanh phat lai.

- eval: E2
  run_id: s4r1-20260906T153520Z-37144-E2
  exit_code: 0
  verifier: config:executors.script.kc_dan_so_tu_config
  verified_at: 2026-09-06T15:37:21Z
  output: |
    chieu xanh: ma 0 · da soi 4 · config khai 4
    chieu do: ma 1
    XANH: cap hai chieu goi CHINH chan cua AC-1 — config that thi ma 0 va soi du so lenh; ban sao co o cam an cache thi ma 1 va goi dung ten.

- eval: E3
  run_id: s4r1-20260906T153520Z-37144-E3
  exit_code: 0
  verifier: config:executors.script.kc_cache_noi_that
  verified_at: 2026-09-06T15:37:21Z
  output: |
    bang khai: 2 dong · lenh do: bunx turbo run test --filter=@crm/ui --concurrency=1
      _acceptance/chan-lai-component-ra-man/rang/da-tim-thay.json  (DOC luc chay)
        moi 2/2 · khong doi 2/2 · da cham 1/2
      apps/app/components/agent-builder/chat-chips.tsx  (NHAP nhu mo-dun)
        moi 2/2 · khong doi 2/2 · da cham 1/2
    XANH: ca 2 dong — khong doi thi cache trung, cham mot byte ngoai goi thi cache be. Khoa cache noi that ve ca hai loai phu thuoc.

- eval: E4
  run_id: s4r1-20260906T153520Z-37144-E4
  exit_code: 0
  verifier: config:executors.script.kc_do_hanh_vi
  verified_at: 2026-09-06T15:37:21Z
  output: |
    chan AC-3 doc duoc: truoc 2/2 · sau khi cham 1/2
    cap so DOI theo trang thai that: 2 -> 1. Ket luan cua chan AC-3 den tu dau ra cua cong cu, khong tu turbo.json.
    XANH: chan AC-3 doc DAU RA THAT — cap so no dua vao thay doi dung theo trang thai cache ma phep do vua dung len.

- eval: E5
  run_id: s4r1-20260906T153520Z-37144-E5
  exit_code: 0
  verifier: config:executors.script.kc_lenh_hang_ngay
  verified_at: 2026-09-06T15:37:21Z
  output: |
    chieu xanh — scripts.test = "turbo run test --concurrency=1"
    chieu do — cay vao ban sao: "turbo run test --concurrency=1 --force" -> phep thu nhan ra
    XANH: lenh hang ngay giu nguyen cache; phep thu co ca hai chieu tren cung mot vat.

- eval: E6
  run_id: s4r1-20260906T153520Z-37144-E6
  exit_code: 0
  verifier: config:executors.test.api_khong_cache
  verified_at: 2026-09-06T15:37:21Z
  output: |
    app:test:  809 expect() calls
    app:test: Ran 243 tests across 20 files. [678.00ms]
    
     Tasks:    11 successful, 11 total
    Cached:    0 cached, 11 total
      Time:    23.269s

- eval: E7
  run_id: s4r1-20260906T153520Z-37144-E7
  exit_code: 0
  verifier: config:executors.script.kc_mot_bo_thuoc
  verified_at: 2026-09-06T15:37:21Z
  output: |
    chan cua lat: 6 · chan cua lat khac: 71 · nguong: 12 dong lien tiep
    run dai nhat tim duoc: 7 dong
    XANH: run dai nhat 7 dong, duoi nguong 12 — dung lai thuoc qua o cam, khong chep.

- eval: E8
  judged_by: nguoi — chu kho, Cong 2
  verdict: UNCERTAIN
  run_id: s4r1-20260906T153520Z-37144-E8
  verified_at: 2026-09-06T15:37:21Z
  human_override:
  rationale: |
    Ep chay lai lam moi luot cham cua cong ton them 21 giay. Cai gia ay co dang doi
    lay mot mau xanh co nghia khong. May KHONG cham muc nay.

## Bon lenh chung cua kho

Tat ca ma 0, chay CUONG BUC va NOI TIEP, 0 cache.

## Vi sao PENDING-JUDGMENT

Bay chan may deu ma 0 trong mot luot chay CO GHI SO. O thu tam la phan xet cua nguoi
(E8) — cai gia cua viec ep chay lai.

## So do

- **Truoc khi sua:** 1 trong 4 lenh chung cua cong an cache — `executors.test.api`
  giai ra `turbo run test --concurrency=1`, khong `--force`.
- **Sau khi sua:** 4/4 lenh chay cuong buc hoac khong qua turbo.
- **Khoa cache cua bo ve:** ca HAI loai phu thuoc ngoai goi nay noi that — khong doi
  thi 2/2 trung, cham mot byte thi 1/2.
- **Cai gia:** luot co cache 1092 ms · luot cuong buc 22271 ms · chenh **21179 ms**
  moi luot cham.

## Ba lan phep do bat loi cua nguoi viet no

1. **Bao dong gia ngay luot chay dau.** Doan theo TEN thi `bun run lint:slop` bi ket
   oan la an cache; giai ten script ra thi no la `oxlint` chay thang. Phep phan biet
   phai GIAI chu khong duoc DOAN.
2. **Chieu do tra ve mot cache-hit gia.** Cham file bang mot ky tu CO DINH thi chinh
   trang thai da-cham cung duoc dem lai, nen luot sau trung cache va cap hai chieu xanh
   gia. Chan `do-hanh-vi` la ben phat hien; da doi sang noi dung chua tung co.
3. **Lenh kiem o cam cua toi bao sai.** No noi ca 7 o cam deu thieu trong khi chung da
   nam trong config — mot loi escape trong chinh lenh kiem. Cung lop bao dong gia voi
   muc 1, va lan nay la toi doc lai file moi thay.

Va mot dinh chinh cho ban thiet ke: ben phan bien du doan hai loai phu thuoc ngoai goi
can HAI co che khac nhau. Do that thi ca hai va duoc bang `inputs` — mot ban va thay
vi hai.
