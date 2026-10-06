---
schema_version: 2
feature_slug: chan-lai-component-ra-man
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-command verify (dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: 977a9018f3511f37f189c25d26903aa9823df199
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

O E10 KHONG mang run_id, va do la co y: khong luot chay may nao cham no. Ban dau toi
co ghi mot run_id cho no — mot so TU DUC, vi bo chay S4 khong he ghi so dong nao cho
o phan xet. Luoi L2 PROVENANCE cua pre-merge bat dung cho do. Day la lan thu hai lop
loi lam-gia-xuat-xu nay xuat hien trong chuoi vong nay.

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

### Re-pin lần 1 — 07/09, do hợp nhất 88 commit của onehub vào chuỗi trước khi giao

run_id: repin-20260906T214517Z-82885
sha: 538796cf4a0f334454dc9fc3f44f3f836a6b0ebf · suites: 4 lệnh exit 0

### Re-pin lần 2 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 3 — 2026-09-08, do mốc cũ lệch cây sau khi kho nhận kit 2.9.0, lệnh dựng thành cổng thứ năm, và hai bản sửa tài liệu
run_id: repin-20260908T060804Z-76253
sha: 49605940ace8cf52b90e71c54c7076244cad9eef · suites: 5 lệnh exit 0 · evals: 10 eval máy exit 0

### Re-pin lần 4 — 2026-09-09, do ghim đồng hồ trong bài đo lái component và trả tạo phẩm về sau đột biến
run_id: repin-20260909T223730Z-82281
sha: b1a2d0780b772507ddacbea855931706f43f53de · suites: 5 lệnh exit 0 · evals: 10 eval máy exit 0

### Re-pin lần 5 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng phanlemanh@gmail.com
run_id: repin-20260917T051527Z-61120
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 6 — 2026-09-23, do canh neo dan so lai-ra-man 472 file sau PR #90, #94
run_id: repin-20260923T105425Z-21855
sha: 80756cd62d5871bc48856c3f380b025ea0cca5cf · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 (E10 không khai paths) · AC không có chốt máy: AC-10

### Re-pin lần 7 — 2026-09-24, do gop onehub d2a55da8, canh neo lai-ra-man 478 file
run_id: repin-20260924T005441Z-38083
sha: 7e0af3e7d0c2219f8c9c97736a5c804f59a57ea9 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 (E10 không khai paths) · AC không có chốt máy: AC-10

### Re-pin lần 8 — 2026-09-24, do go neo cung dan-so (neo-dan-so-khong-cung) va gop onehub 2e...; ghim lai o dau nhanh
run_id: repin-20260924T020954Z-69115
sha: e482d8d3ee21642b475427ea4984cd02a1c37c59 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 (E10 không khai paths) · AC không có chốt máy: AC-10

### Re-pin lần 9 — 2026-09-24, do gop onehub 35796299 (#106) truoc khi merge #107
run_id: repin-20260924T031944Z-19904
sha: bb2a22fbce6f69655e42f173fc8031f0bee76cf0 · suites: 4 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 (E10 không khai paths) · AC không có chốt máy: AC-10

### Re-pin lần 10 — 2026-10-05, do sửa thước đỏ lô 2-4 (f2)
run_id: repin-20261005T044526Z-97535
sha: 6ca1ebaa11c73b8cb58a3fc1e3e3895c0727ecd2 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10

### Re-pin lần 11 — 2026-10-06, do sửa thước đỏ lô 2-4 (f2c)
run_id: repin-20261006T111742Z-87303
sha: 977a9018f3511f37f189c25d26903aa9823df199 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E10 · AC không có chốt máy: AC-10
