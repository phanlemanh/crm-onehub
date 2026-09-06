---
schema_version: 2
feature_slug: agent-builder-noi-tieng-viet
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-command verify (dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: fbfaeeebbc4064937e515f3ffa8db5577621c01a
run_id: s4r1-20260906T062452Z-14850
human_signoff: Manh Phan 2026-09-06
---

# Evidence Report: agent-builder-noi-tieng-viet

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1b | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-6b | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-9 | script | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-12 | script | PASS |
| E18 | AC-13 | judgment | PASS |

## Evidence

- eval: E1
  run_id: s4r1-20260906T062452Z-14850-E1
  exit_code: 0
  verifier: config:executors.script.ab_hai_tieng
  verified_at: 2026-09-06T06:26:25Z
  output: |
    ket qua: route do duoc 2/4 (thu muc sinh ra 4, chua chot cach gieo 2) · 22 cap doi chieu · ngoai lat=9 · hong=0 · tu choi do=0

- eval: E2
  run_id: s4r1-20260906T062452Z-14850-E2
  exit_code: 0
  verifier: config:executors.script.ab_chu_cung_jsx
  verified_at: 2026-09-06T06:26:25Z
  output: |
    ket qua: 26 file .tsx tren dia, tru 6 loai tru co ten, cong 0 khai them = 20 file quet. 0 chuoi khoa cung ngoai 0 dong mien tru, va ca 0 dong deu con doi tuong that.

- eval: E3
  run_id: s4r1-20260906T062452Z-14850-E3
  exit_code: 0
  verifier: config:executors.script.ab_toast
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: khong loi goi toast nao con mang chu tieng Anh viet thang.

- eval: E4
  run_id: s4r1-20260906T062452Z-14850-E4
  exit_code: 0
  verifier: config:executors.script.ab_tieu_de
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: ca 4 o nhan deu doc tu kho chuoi.

- eval: E5
  run_id: s4r1-20260906T062452Z-14850-E5
  exit_code: 0
  verifier: config:executors.script.ab_thuoc_tinh
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: 39 thuoc tinh doc tu kho chuoi, va khong thuoc tinh nao ngoai danh sach ky thuat con mang chuoi viet thang.

- eval: E6
  run_id: s4r1-20260906T062452Z-14850-E6
  exit_code: 0
  verifier: config:executors.script.ab_trang_thai
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH ST-doi-rong tren /agents: "Đội chưa có tác nhân nào"
    ket qua: 9 o trang thai · do duoc 2 · gioi han da khai 7 · hong=0

- eval: E7
  run_id: s4r1-20260906T062452Z-14850-E7
  exit_code: 0
  verifier: config:executors.script.ab_khong_dich
  verified_at: 2026-09-06T06:26:25Z
  output: |
    ket qua: 2 dong bang + 8 chuoi ngoai lat · so vi tri doi chieu HAI LUOT=8 · gioi han da khai=2 · thieu=0 · bi dich=0

- eval: E8
  run_id: s4r1-20260906T062452Z-14850-E8
  exit_code: 0
  verifier: config:executors.script.ab_du_lieu_nguoi_nhap
  verified_at: 2026-09-06T06:26:25Z
  output: |
    ket qua: 3 o · xanh=3 · hong=0 · ban khai cu=0

- eval: E9
  run_id: s4r1-20260906T062452Z-14850-E9
  exit_code: 0
  verifier: config:executors.script.ab_dot_bien
  verified_at: 2026-09-06T06:26:25Z
  output: |
    bang dong: 7 hinh dang, moi hinh dang mot vet va mot chan chuyen trach.
    XANH: ca 7 vet deu bi it nhat mot chan bat, va cay lanh thi ca 7 chan deu xanh.

- eval: E10
  run_id: s4r1-20260906T062452Z-14850-E10
  exit_code: 0
  verifier: config:executors.script.ab_khai_sinh
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: 20 file, ba chan doc bang nhau; 10 loi goi toast va 4 o tieu de, khop bang khai.

- eval: E11
  run_id: s4r1-20260906T062452Z-14850-E11
  exit_code: 0
  verifier: config:executors.script.ab_dan_so_tu_dia
  verified_at: 2026-09-06T06:26:25Z
  output: |
    can gat khong_quet: 6 dong khai HOAN sang dot sau — con tieng Anh la dung thiet ke, va quan he "chu cua dot nay ro sang vung hoan" do o chan khai-sinh.
    can gat khong_quet: 6 dong, khong dong nao che giau chu tieng Anh ngoai cac dong khai hoan.
    XANH: dan so tu thay file moi, va ca hai chan deu do vi no.

- eval: E12
  run_id: s4r1-20260906T062452Z-14850-E12
  exit_code: 0
  verifier: config:executors.script.ab_be_rong
  verified_at: 2026-09-06T06:26:25Z
  output: |
    ket qua 360px: 10 nhan dich duoc · vi tran ma en vua=0 · tran ca hai luot=0

- eval: E14
  run_id: s4r1-20260906T062452Z-14850-E14
  exit_code: 0
  verifier: config:executors.script.ab_moi_chuoi
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: khong chuoi nguoi doc thay nao con la tieng Anh.

- eval: E15
  run_id: s4r1-20260906T062452Z-14850-E15
  exit_code: 0
  verifier: config:executors.script.ab_mot_bo_thuoc
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: mot bo thuoc, khong ban chep nao troi.

- eval: E16
  run_id: s4r1-20260906T062452Z-14850-E16
  exit_code: 0
  verifier: config:executors.test.rang3_khoa_chet
  verified_at: 2026-09-06T06:26:25Z
  output: |
    51 pass

- eval: E17
  run_id: s4r1-20260906T062452Z-14850-E17
  exit_code: 0
  verifier: config:executors.script.ab_tu_dien
  verified_at: 2026-09-06T06:26:25Z
  output: |
    XANH: ca 3 muc deu co trong CONTEXT.md va deu duoc ban vi cua lat dung.

- eval: E18
  judged_by: nguoi — chu kho, Cong 2
  verdict: PASS
  run_id: s4r1-20260906T062452Z-14850-E18
  verified_at: 2026-09-06T06:26:25Z
  human_override: Đạt — Manh Phan 2026-09-06
  rationale: |
    Ban dich co doc nhu tieng Viet cua nguoi lam nghe khong — danh tu theo CONTEXT.md,
    thuat ngu ky thuat giu ten that, khong con dau vet dich may. Nguoi cham tren tam anh
    chup tung buoc trong evidence/, ngay 06/09.

## Bốn lệnh chứng của kho

Tất cả mã 0: `bun run db:test && bun run test` · `bun run check-types` ·
`bun run lint` (về đúng ba cảnh báo có sẵn) · `bun run lint:slop`.

## Vì sao PASS

Mười sáu eval máy đều mã 0 trong một lượt chạy CÓ GHI SỔ — mỗi mã `run_id` mint
lúc thực thi và có mặt trong `run-log.jsonl`. Ô thứ mười bảy là phán xét của
người (E18), đã chấm Đạt trên tám ảnh chụp từng bước trong `evidence/`.

**E13 đã được gỡ khỏi bộ eval của lát này** — người chốt ở Cổng 2. Phép đo chiều
đỏ bề rộng không có đối tượng ở đây, và đó là điều ĐO được chứ không khai suông:
4 hộp chặt cứng trên hai màn dựng được, **0 hộp mang chữ của lát**. Script
`be-rong-do.sh` ở lại và vẫn chạy được; nó chỉ không còn là một eval của vòng
này. Giữ một phép đo không bao giờ chạy được rồi đọc mã 2 của nó thành "đạt" là
đúng lớp lỗi vòng này tồn tại để chặn.

## Bốn phép đo giả bị bắt trong chính vòng này

1. **AC-5 không có chân nào** — ổ cắm trỏ vào một chân chưa ai viết.
2. **Chân dữ liệu người nhập chỉ đọc bảng của chính nó** rồi báo lại.
3. **Chân không-dịch so chuỗi với chính nó**, nên nhánh đỏ là mã chết.
4. **E11 chưa từng được chạy**, và nó đỏ vì cãi nhau với AC-8.

Cả bốn đã vá, và mỗi phép đo mới đều có cặp hai chiều đã chạy thật.
