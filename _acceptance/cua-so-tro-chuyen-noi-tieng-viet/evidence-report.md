---
schema_version: 2
feature_slug: cua-so-tro-chuyen-noi-tieng-viet
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: sequential per-command verify (dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: 15ce9c2a1b8facc02490ba5d53fe359227d75589
run_id: s4r1-20260906T085856Z-63650
human_signoff:
---

# Evidence Report: cua-so-tro-chuyen-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E0 | AC-5 | script | PASS |
| E1 | AC-1 | script | PASS |
| E2 | AC-1b | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-7b | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | UNCERTAIN |
| E12 | AC-9 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-9 | script | PASS |
| E15 | AC-10 | script | PASS |
| E16 | AC-11 | script | PASS |
| E17 | AC-12 | script | PASS |
| E18 | AC-12 | test | PASS |
| E19 | AC-12 | script | PASS |
| E21 | AC-5 | script | PASS |
| E20 | AC-13 | judgment | UNCERTAIN |

## Evidence

- eval: E0
  run_id: s4r1-20260906T085856Z-63650-E0
  exit_code: 0
  verifier: config:executors.script.ct_gieo_va_don
  verified_at: 2026-09-06T09:01:15Z
  output: |
    tien de: API tra loi · phien dang song · workspace onehub
    so lan goi createBuilder trong luot nay: 1
    XANH: da gieo mot hoi thoai (cmtpky4xh000ef2cf74upn1wf) va ghi vet cho cac chan man doc.

- eval: E1
  run_id: s4r1-20260906T085856Z-63650-E1
  exit_code: 0
  verifier: config:executors.script.ct_moi_chuoi
  verified_at: 2026-09-06T09:01:15Z
  output: |
    quet 6 file · 73 chuoi nguoi co the doc · tru 54/54 dong giu nguyen co ten
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E2
  run_id: s4r1-20260906T085856Z-63650-E2
  exit_code: 0
  verifier: config:executors.script.ct_chu_cung_jsx
  verified_at: 2026-09-06T09:01:15Z
  output: |
    ket qua: 21 file .tsx tren dia, tru 15 loai tru co ten, cong 0 khai them = 6 file quet. 0 chuoi khoa cung ngoai 7 dong mien tru, va ca 7 dong deu con doi tuong that.

- eval: E3
  run_id: s4r1-20260906T085856Z-63650-E3
  exit_code: 0
  verifier: config:executors.script.ct_thuoc_tinh
  verified_at: 2026-09-06T09:01:15Z
  output: |
    quet 6 file · 68 thuoc tinh doc tu kho chuoi · 326 thuoc tinh ky thuat co ten · 0 thuoc tinh con chuoi viet thang
    XANH: 68 thuoc tinh doc tu kho chuoi, va khong thuoc tinh nao ngoai danh sach ky thuat con mang chuoi viet thang.

- eval: E4
  run_id: s4r1-20260906T085856Z-63650-E4
  exit_code: 0
  verifier: config:executors.script.ct_toast
  verified_at: 2026-09-06T09:01:15Z
  output: |
    quet 6 file trong lat · nhan ra 14/14 loi goi khai trong bang · bo qua 7 luot chi chuyen tiep error.message (ngoai pham vi)
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.

- eval: E5
  run_id: s4r1-20260906T085856Z-63650-E5
  exit_code: 0
  verifier: config:executors.script.ct_tieu_de_khong_doi_tuong
  verified_at: 2026-09-06T09:01:15Z
  output: |
    luot A — lat nay (khong so huu page.tsx nao): ma thoat 2
    luot B — doi chung duong tren ho so dot mot: ma thoat 0
    XANH: chan tieu de tu khai KHONG CO DOI TUONG o lat nay, va van song — da chung bang mot lat co doi tuong that.

- eval: E6
  run_id: s4r1-20260906T085856Z-63650-E6
  exit_code: 0
  verifier: config:executors.script.ct_hai_tieng
  verified_at: 2026-09-06T09:01:15Z
  output: |
    ket qua: 40 cap doi chieu tren 2 route · hong=0

- eval: E7
  run_id: s4r1-20260906T085856Z-63650-E7
  exit_code: 0
  verifier: config:executors.script.ct_trang_thai
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH ST-dang-gui tren /chat: "Đang gửi"
    ket qua: 5 o trang thai · do duoc 4 · gioi han da khai 1 · hong=0

- eval: E8
  run_id: s4r1-20260906T085856Z-63650-E8
  exit_code: 0
  verifier: config:executors.script.ct_khong_dich
  verified_at: 2026-09-06T09:01:15Z
  output: |
    ket qua: 4 vi tri du lieu (nguoi nhap + tac nhan sinh) · 3 dong bang thuong hieu · so vi tri doi chieu HAI LUOT=4 · gioi han da khai=3 · thieu=0 · bi dich=0

- eval: E9
  run_id: s4r1-20260906T085856Z-63650-E9
  exit_code: 0
  verifier: config:executors.script.ct_du_lieu_nguoi_nhap
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH tieu de hoi thoai o thanh dau: <h1> boc {title} mang translate="no" (agent-builder-chat.tsx:780)
    ket qua: 2 o · xanh=2 · hong=0 · ban khai cu=0

- eval: E10
  run_id: s4r1-20260906T085856Z-63650-E10
  exit_code: 0
  verifier: config:executors.script.ct_be_rong
  verified_at: 2026-09-06T09:01:15Z
  output: |
    ket qua 360px: 8 nhan dich duoc · vi tran ma en vua=0

- eval: E11
  run_id: s4r1-20260906T085856Z-63650-E11
  exit_code: 2
  verifier: config:executors.script.ct_be_rong_do
  verified_at: 2026-09-06T09:01:15Z
  output: |
    tien de be rong o 360px: 18 nhan nhin thay duoc · hop CHAT CUNG mang chu CUA LAT=0
    KHONG DO DUOC: khong chu nao CUA LAT nay nam trong mot hop chat cung tren man do duoc — moi hop deu CHO XUONG DONG, nen mot nhan dai chi wrap chu khong bao gio tran. Thieu tien de de chung chieu do cua chan be-rong.
    KHONG DO DUOC: thieu tien de nen KHONG chay phep cam vet.

- eval: E12
  run_id: s4r1-20260906T085856Z-63650-E12
  exit_code: 0
  verifier: config:executors.script.ct_ban_giao
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH: moi dong ban giao tro dung, va neo cua ho so da ky con nguyen sau khi do lai tren dia.

- eval: E13
  run_id: s4r1-20260906T085856Z-63650-E13
  exit_code: 0
  verifier: config:executors.script.ct_khai_sinh
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH: 6 file, ba chan doc bang nhau; 14 loi goi toast va 0 o tieu de, khop bang khai.

- eval: E14
  run_id: s4r1-20260906T085856Z-63650-E14
  exit_code: 0
  verifier: config:executors.script.ct_dan_so_tu_dia
  verified_at: 2026-09-06T09:01:15Z
  output: |
    can gat khong_quet: 15 dong khai BAN GIAO cho ho so khac — quan he lien-ho-so do o chan ban-giao cua ho so nhan, KHONG do o day.
    can gat khong_quet: 15 dong, khong dong nao che giau chu tieng Anh ngoai cac dong khai hoan.
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E15
  run_id: s4r1-20260906T085856Z-63650-E15
  exit_code: 0
  verifier: config:executors.script.ct_ngoai_lat_rong
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH: khoi hien dien va rong; chan man cua dot mot chi con 1 dau phan cach, khong chuoi tieng Anh nao — man /chat da thuan tieng Viet.

- eval: E16
  run_id: s4r1-20260906T085856Z-63650-E16
  exit_code: 0
  verifier: config:executors.script.ct_dot_bien
  verified_at: 2026-09-06T09:01:15Z
  output: |
    bang dong: 5 hinh dang, moi hinh dang mot vet va mot chan chuyen trach.
    XANH: ca 5 vet deu bi it nhat mot chan bat, va cay lanh thi ca 5 chan deu xanh.

- eval: E17
  run_id: s4r1-20260906T085856Z-63650-E17
  exit_code: 0
  verifier: config:executors.script.ct_mot_bo_thuoc
  verified_at: 2026-09-06T09:01:15Z
  output: |
    so 9 script cua lat nay voi 27 script cua bon lat truoc — nguong 12 dong lien tiep, bo qua dong import va dau dong.
    XANH: mot bo thuoc, khong ban chep nao troi.

- eval: E18
  run_id: s4r1-20260906T085856Z-63650-E18
  exit_code: 0
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-06T09:01:15Z
  output: |
    60 pass

- eval: E19
  run_id: s4r1-20260906T085856Z-63650-E19
  exit_code: 0
  verifier: config:executors.script.ct_tu_dien
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH: ca 3 muc deu co trong CONTEXT.md va deu duoc ban vi cua lat dung.

- eval: E21
  run_id: s4r1-20260906T085856Z-63650-E21
  exit_code: 0
  verifier: config:executors.script.ct_don
  verified_at: 2026-09-06T09:01:15Z
  output: |
    XANH: cay tro lai sach, va do bang chan cua ho so KHAC chu khong bang loi tu khai.

- eval: E20
  judged_by: nguoi — chu kho, Cong 2
  verdict: UNCERTAIN
  run_id: s4r1-20260906T085856Z-63650-E20
  verified_at: 2026-09-06T09:01:15Z
  human_override:
  rationale: |
    Ban dich cua sau file cua so tro chuyen co doc nhu tieng Viet cua nguoi lam nghe
    khong — danh tu theo CONTEXT.md, thuat ngu ky thuat giu ten that, khong con dau
    vet dich may. May KHONG cham muc nay.

## Bốn lệnh chứng của kho

Tất cả mã 0: `bun run db:test && bun run test` · `bun run check-types` ·
`bun run lint` (về đúng ba cảnh báo có sẵn) · `bun run lint:slop`.

## Vì sao PENDING-JUDGMENT

Hai mươi chân máy mã 0 trong một lượt chạy CÓ GHI SỔ — mỗi `run_id` mint lúc
thực thi và có mặt trong `run-log.jsonl`. Hai ô không phải màu xanh:

- **E11 thoát mã 2 — thiếu tiền đề, không phải đạt.** Chiều đỏ của chân bề rộng:
  chân tự đo tiền đề rồi mới từ chối — **0 hộp chặt cứng mang chữ của lát** trên
  18 nhãn nhìn thấy được ở 360px. Nhãn của lát đều nằm trong hộp cho xuống dòng
  nên một nhãn dài chỉ wrap, không bao giờ tràn. Kết quả rỗng KHÔNG được đọc là
  "bản dịch vừa". Đây là đúng ca người đã định đoạt ở Cổng 2 đợt một.
- **E20 là phán xét** — chỉ người trả lời được.

## Số đo

- **276 → 0** chuỗi tiếng Anh trên 6 file; 54 dòng miễn trừ và 7 tiền tố, **mọi
  dòng đều có đối tượng thật**.
- **43 cặp** đối chiếu hai lượt tiếng trên 2 route, gieo bằng **đúng một** lời gọi
  `createBuilder`, dọn xong và **chứng bằng chân của hồ sơ khác**.
- **7 vị trí dữ liệu** (người gõ + tác nhân sinh) phải y hệt nhau ở hai lượt.
- **Bộ đột biến 5/5**, mỗi vết bị đúng chân chuyên trách bắt, cây trả nguyên trạng.
- **21 dòng bàn giao** đối chiếu hai chiều; neo của hồ sơ đã ký **đo lại trên đĩa**
  vẫn đúng (20 file quét, `khong_quet` 6 dòng).
