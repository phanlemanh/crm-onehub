---
schema_version: 2
feature_slug: vung-cuon-la-khoi-chua
verdict: REJECT
failed_evals: [E8]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2e6c8d1c55222f976a54cc76dc8d5d52358dca4a
human_signoff:
---

# Evidence Report: vung-cuon-la-khoi-chua

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | ui-check | FAIL |

## Evidence

- eval: E1
  run_id: minted-vung-cuon-la-khoi-chua-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E2
  run_id: minted-vung-cuon-la-khoi-chua-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E3
  run_id: minted-vung-cuon-la-khoi-chua-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E4
  run_id: minted-vung-cuon-la-khoi-chua-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E5
  run_id: minted-vung-cuon-la-khoi-chua-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E6
  run_id: minted-vung-cuon-la-khoi-chua-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E7
  run_id: minted-vung-cuon-la-khoi-chua-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  output: |
    THOI GIAN tong: 216s
    ANH .acceptance-runs/vung-cuon-la-khoi-chua/evidence/
    KET LUAN: 22 DUNG, 0 SAI — ma thoat 0

- eval: E8
  run_id: minted-vung-cuon-la-khoi-chua-E8-r2
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.vckc_do_khung
  verified_at: 2026-09-25T15:41:04Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/busy-chatterjee-fc04e2/_acceptance/vung-cuon-la-khoi-chua/evidence/truong-1440-cuoi.png
  observed: |
    truong-1440-cuoi.png: Header khung ung dung (logo "CRM", badge "Đang tra cứu 216", avatar) nam sat mep tren (y=0). Thanh ben trai nguyen ven tu "KHONG GIAN LAM VIEC" xuong "BAO MAT/Khoa API", muc "Truong" dang highlight. Vung noi dung hien tu tieu de "Truong" xuong den hang cuoi bang ("BDR owner") va nut "Truong moi" — hang cuoi cua bang hien trong vung noi dung. Khop dung Expected cho -cuoi 1440.

    truong-1440-doi-chung.png: Anh bat dau ngay tai muc "KET NOI VA DU LIEU" (khong con thay logo CRM, badge, hay cac muc dau sidebar nhu "KHONG GIAN LAM VIEC"/"CON NGUOI") — dau trang cua khung ung dung da truot len khoi mep tren. Khop dung Expected cho -doi-chung 1440.

    truong-768-cuoi.png: Header "CRM" + badge nam sat mep tren, sidebar day du tu "KHONG GIAN LAM VIEC" xuong, noi dung xuong toi "Truong moi" o day anh. Header o mep tren, sidebar nguyen cho, hang cuoi hien trong noi dung — khop Expected cho -cuoi 768.

    truong-768-doi-chung.png: Anh bat dau tu doan mo ta "Hinh dang du lieu cua ban..." va tab "Cong ty/Ca nhan/Thoa thuan", GOC TREN TRAI chi con hai icon nho (khong con logo CRM/header day du, khong con day du sidebar tu dau) — dau trang da truot len khoi mep tren mot phan. Khop Expected cho -doi-chung 768.

    truong-375-cuoi.png: Header mobile (nut hamburger ☰, "CRM", badge "Đang tra cứu 216") nam sat mep tren; duoi do la thanh tab ngang (Chung/Tien te/Truong/...) thay cho sidebar (dung voi bo cuc mobile); noi dung xuong toi "Truong moi" + dong ghi chu + avatar o day anh — header o mep tren, hang cuoi hien trong noi dung. Khop Expected cho -cuoi 375.

    truong-375-doi-chung.png: Anh bat dau thang vao danh sach truong ("Account type / 4 lua chon"...) — KHONG con header mobile (khong hamburger, khong logo CRM, khong badge) o dau anh. Dau trang da truot len khoi mep tren (gan nhu het). Khop Expected cho -doi-chung 375.

    => Tat ca 6 frame dung nhu Expected mo ta bang mat, nhung day la doi chieu THI GIAC — khong co dong DUNG/SAI may-sinh tu chinh script cho tieu chi nay do script crash o duong khac truoc khi toi doan kiem() lien quan AC-8. Ban than script bao "KHONG DO DUOC" (ma thoat 2) vi mot loi crash o duong /settings/connections/slack/people hoac /settings/fields ke tiep trong danh sach quet, khong phai loi ha tang hay cong cu (cannotRun=false, killedByTool=false).
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-25T15:41:04Z

- cmd: bunx turbo run lint --force
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-25T15:41:04Z

- cmd: bun run lint:slop
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-25T15:41:04Z

- cmd: bunx turbo run build --force
  run_id: minted-vung-cuon-la-khoi-chua-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-25T15:41:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay
none — round nay khong do baseline (P2, evals.yaml khong doi tu lan baseline cuoi round 1); danh sach eval khong-phan-biet: rong ([])

## Variance

none — khong co eval chay nhieu lan (runs > 1) round nay; khong co ca deterministic nao bat on dinh giua cac lan chay.

## Iterations

Round 1: E8 failed — ui-check crash o mot duong khac ngoai pham vi /settings/fields ("Cannot read properties of null (reading 'scrollHeight')" trong choDungYen) truoc khi in dong DUNG/SAI cho AC-8; ban goc ghim cua PageShell mang sẵn `relative`. Returned to implementation.
Round 2: E8 van fail — script tu bao "KHONG DO DUOC" (ma thoat 2) do cung dang crash xay ra ngay sau khi da do xong /settings/connections/slack, o duong /settings/connections/slack/people hoac /settings/fields ke tiep; 6 anh bang chung AC-8 da luu thanh cong va khop Expected khi doi chieu bang mat, nhung khong co dong DUNG/SAI may-sinh nen khong dat may-kiem-duoc. E1-E7 + 4 lenh suite (test, lint, lint:slop, build) deu xanh. REJECT.
