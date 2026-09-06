---
schema_version: 2
feature_slug: chan-lai-component-ra-man
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-command verify (dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: 972df8bc7c572c3826ef1ba3f2d41bf9237ae8dd
run_id: s4r1-20260906T145103Z-21187
human_signoff: Manh Phan 2026-09-06
---

# Evidence Report: chan-lai-component-ra-man

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E11 | AC-11 | script | PASS |
| E10 | AC-10 | judgment | PASS |

## Evidence

- eval: E1
  run_id: s4r1-20260906T145103Z-21187-E1
  exit_code: 0
  verifier: config:executors.script.cl_dan_so
  verified_at: 2026-09-06T14:52:28Z
  output: |
    tap loai tru ghim ten: node_modules · .next · dist · build — 389 file nguon
    gia tri mac dinh la chuoi co chu: 107 · component so huu: 50
    dong trong bang gioi han vong truoc: 9
    XANH: moi neo khop dia.

- eval: E2
  run_id: s4r1-20260906T145103Z-21187-E2
  exit_code: 0
  verifier: config:executors.script.cl_lai_ra_man
  verified_at: 2026-09-06T14:52:28Z
  output: |
    nhom chu-nguoi-doc: 0
    nhom ky thuat: 102
    khong ve duoc (da khai kem ly do): 5
    tong: 107 · neo: 107
    XANH: phan nhom do BAN VE quyet, khong danh sach ten prop nao.

- eval: E3
  run_id: s4r1-20260906T145103Z-21187-E3
  exit_code: 0
  verifier: config:executors.script.cl_phan_biet
  verified_at: 2026-09-06T14:52:28Z
  output: |
    chieu xanh — vat lanh: ca 8 cho da va deu KHONG con o nhom chu-nguoi-doc.
    doi chung am: packages/ui/src/components/button.tsx variant nam o nhom ky thuat, dung cho.
    da cay 8 gia tri mac dinh tieng Anh tro lai.
    chieu do — vat cay: ca 8 cho deu bi xep dung vao nhom chu-nguoi-doc.
    da tra lai 4 file ve nguyen trang.
    XANH: cap hai chieu tren cung mot vat — vat lanh sach, vat cay bi bat dung cho.

- eval: E4
  run_id: s4r1-20260906T145103Z-21187-E4
  exit_code: 0
  verifier: config:executors.script.cl_mo_nguyen_ban
  verified_at: 2026-09-06T14:52:28Z
  output: |
      popover.tsx  rong
      select.tsx  rong
      tabs.tsx  rong
      tooltip.tsx  rong
    dong doc duoc: 9 · neo doc lap: 9
    XANH: ca 9 dong deu mount duoc o trang thai mo. 9 dong khong sinh chu nao; 0 dong co sinh.

- eval: E5
  run_id: s4r1-20260906T145103Z-21187-E5
  exit_code: 0
  verifier: config:executors.script.cl_ban_khai_da_do
  verified_at: 2026-09-06T14:52:28Z
  output: |
      hover-card.tsx  rong
      popover.tsx  rong
      select.tsx  rong
      tabs.tsx  rong
      tooltip.tsx  rong
    XANH: tung dong cua ban khai vong truoc khop DUNG dau ra cua may — khong dong nao go tay.

- eval: E6
  run_id: s4r1-20260906T145103Z-21187-E6
  exit_code: 0
  verifier: config:executors.script.cl_dinh_doat
  verified_at: 2026-09-06T14:52:28Z
  output: |
    bang: 12 dong · da va 12 · da khai 0
    XANH: ca 12 dong deu o dung mot trang thai, moi dong "da va" khong con gia tri mac dinh tieng Anh va tro mot khoa CO THAT.

- eval: E7
  run_id: s4r1-20260906T145103Z-21187-E7
  exit_code: 0
  verifier: config:executors.test.cl_tieng_viet_den_man
  verified_at: 2026-09-06T14:52:28Z
  output: |
    tap loai tru ghim ten: node_modules · .next · dist · build — 389 file nguon
    gia tri mac dinh la chuoi co chu: 107 · component so huu: 50
    dong trong bang gioi han vong truoc: 9
    XANH: moi neo khop dia.
    bun test v1.3.10 (30e609e0)

- eval: E8
  run_id: s4r1-20260906T145103Z-21187-E8
  exit_code: 0
  verifier: config:executors.test.tv_canh_kho_ui
  verified_at: 2026-09-06T14:52:28Z
  output: |
    bun test v1.3.10 (30e609e0)

- eval: E9
  run_id: s4r1-20260906T145103Z-21187-E9
  exit_code: 0
  verifier: config:executors.script.cl_mot_bo_thuoc
  verified_at: 2026-09-06T14:52:28Z
  output: |
    chan cua lat: 8 · chan cua lat khac: 63 · khoi 12 dong da lap chi muc: 8531
    XANH: khong khoi 12 dong nao cua lat nay trung voi mot chan da co — dung lai thuoc qua o cam, khong chep.

- eval: E11
  run_id: s4r1-20260906T145103Z-21187-E11
  exit_code: 0
  verifier: config:executors.script.cl_khong_danh_sach_ten
  verified_at: 2026-09-06T14:52:28Z
  output: |
    ten tham so co that trong dan so: 27
    XANH: 2 file cua duong phan nhom khong chua mang nao ke ten tham so — phan nhom do BAN VE quyet.

- eval: E10
  judged_by: nguoi — chu kho, Cong 2
  verdict: PASS
  run_id: s4r1-20260906T145103Z-21187-E10
  verified_at: 2026-09-06T14:52:28Z
  human_override: Đạt — Manh Phan 2026-09-06
  rationale: |
    Muoi hai chuoi vong nay dua ve kho chuoi dung chung — nhan cho, nhan tim, nhan
    trong, bang lenh, chon ngay, dang tai, dang nghi — co doc nhu tieng Viet cua
    nguoi lam nghe khong. May KHONG cham muc nay.

## Bon lenh chung cua kho

Tat ca ma 0, chay CUONG BUC (--force) va NOI TIEP (--concurrency=1), 0 cache:
`bun run db:test && bun run test` · `bun run check-types` · `bun run lint`
(apps/app ve dung ba canh bao co san) · `bun run lint:slop`.

## Vi sao PASS

Muoi chan may deu ma 0 trong mot luot chay CO GHI SO — moi run_id mint luc thuc thi
va co mat trong run-log.jsonl. O thu muoi mot la phan xet cua nguoi (E10), da cham Dat
o Cong 2.

## So do

- **389 file** `.ts`/`.tsx` tren bon cay nguon · **107** gia tri mac dinh la chuoi
  co chu (truoc khi va la 119; 12 cho da roi khoi dan so vi da duoc va).
- Phan nhom do BAN VE quyet: **0** chu-nguoi-doc con lai · **102** ky thuat ·
  **5** khong ve duoc, moi dong kem ly do that.
- **12 gia tri mac dinh chu-nguoi-doc** tim ra va va het, moi dong tro mot khoa
  CO THAT trong kho chuoi.
- Bang muoi dong cua vong truoc: **9/9 dong mount duoc o trang thai mo, ca 9 khong
  sinh chu nao**. Radix khong mang chu.

## Ba lan chinh phep do bat loi cua nguoi viet no

1. **Ma tran toi thieu bat ca hong ma ben phan bien du doan.** Mount chi o trang
   thai DONG thi nam vi du dau bai roi sang nhom ky thuat ma tong van du 119 —
   chan van xanh. Phai bam that moi mo ra: 10 -> 12 cho chu-nguoi-doc.
2. **Mot ban va nua voi.** `conversation.tsx` duoc doi than ham ma khong go hai
   gia tri mac dinh, nen `??` khong bao gio chay. Con so lech (+2 nhom ky thuat
   trong khi tong giam 10) la ben phat hien, khong phai mat nguoi doc lai.
3. **Cap hai chieu tung XANH GIA.** Luot cay doc dan so CU nen bo ve khong ve file
   da va; 5 trong 8 cho cay lai bi xep nham. Chinh chan hai chieu bat, va S4 vong
   mot REJECT dung cho do.

Va mot lan nua o chan khong-chep-thuoc: chieu do dau tien KHONG NO vi khoi cay chi
con duoi 12 dong sau khi loc — cay lai mot khoi dac thi no bat dung ca hai file kem
so dong.
