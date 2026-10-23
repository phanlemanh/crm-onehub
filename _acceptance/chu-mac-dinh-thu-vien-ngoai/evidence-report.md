---
schema_version: 2
feature_slug: chu-mac-dinh-thu-vien-ngoai
verdict: PASS
failed_evals: []
reason:
verified_by: sequential per-command verify (dieu khoan CLASSIFIER-FALLBACK)
enforcement_mode: strict
bypass_used: false
verified_commit: 6fdc7ed4587ef09283181bd35699a668ab3faa27
run_id: s4r1-20260906T102507Z-35290
human_signoff: Manh Phan 2026-09-06
---

# Evidence Report: chu-mac-dinh-thu-vien-ngoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-1b | script | PASS |
| E3 | AC-2 | script | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-8 | script | PASS |
| E10 | AC-9 | judgment | PASS |

## Evidence

- eval: E1
  run_id: s4r1-20260906T102507Z-35290-E1
  exit_code: 0
  verifier: config:executors.script.tv_chu_la_tren_man
  verified_at: 2026-09-06T10:30:22Z
  output: |
    tap loai tru ghim ten: node_modules · .next · dist · build — con 2709 file nguon de hoi
    chuoi tieng Anh KHONG co trong file nguon nao: 26 · da khai 26 · chua khai 0
    XANH: moi chuoi khong-thuoc-ve-ai deu nam trong bang 4 dong nam ly do, va moi dong "sinh tu kho chuoi" con tro mot khoa co that.

- eval: E2
  run_id: s4r1-20260906T102507Z-35290-E2
  exit_code: 0
  verifier: config:executors.script.tv_dong_khai_song
  verified_at: 2026-09-06T10:30:22Z
  output: |
    tap loai tru ghim ten: node_modules · .next · dist · build — con 2709 file nguon de hoi
    chuoi tieng Anh KHONG co trong file nguon nao: 26 · da khai 26 · chua khai 0
    XANH (dong-khai): ca 4 dong khai deu con doi tuong that tren man.

- eval: E3
  run_id: s4r1-20260906T102507Z-35290-E3
  exit_code: 0
  verifier: config:executors.script.tv_khai_sinh
  verified_at: 2026-09-06T10:30:22Z
  output: |
    doc tu dia: 76 component · 37 boc thu vien ngoai · 16 doc kho chuoi dung chung
    neo ghim:  76 · 37 · 16
    XANH: ba con so doc tu dia bang ba con so neo.

- eval: E4
  run_id: s4r1-20260906T102507Z-35290-E4
  exit_code: 0
  verifier: config:executors.script.tv_boc_ma_khong_doc
  verified_at: 2026-09-06T10:30:22Z
  output: |
    bang: 29 dong · chan dem tu dia: 29 component boc-ma-khong-doc
    XANH: ca 29 dong tro dung mot component con ve ra dung nguyen ban da khai, va bang du.

- eval: E5
  run_id: s4r1-20260906T102507Z-35290-E5
  exit_code: 0
  verifier: config:executors.script.tv_chu_la_tren_man
  verified_at: 2026-09-06T10:30:22Z
  output: |
    tap loai tru ghim ten: node_modules · .next · dist · build — con 2709 file nguon de hoi
    chuoi tieng Anh KHONG co trong file nguon nao: 26 · da khai 26 · chua khai 0
    XANH: moi chuoi khong-thuoc-ve-ai deu nam trong bang 4 dong nam ly do, va moi dong "sinh tu kho chuoi" con tro mot khoa co that.

- eval: E6
  run_id: s4r1-20260906T102507Z-35290-E6
  exit_code: 0
  verifier: config:executors.test.tv_canh_kho_ui
  verified_at: 2026-09-06T10:30:22Z
  output: |
    5 pass

- eval: E7
  run_id: s4r1-20260906T102507Z-35290-E7
  exit_code: 0
  verifier: config:executors.script.tv_dot_bien
  verified_at: 2026-09-06T10:30:22Z
  output: |
    bang dong: 4 hinh dang, moi hinh dang mot vet va mot chan chuyen trach.
    XANH: ca 4 vet deu bi it nhat mot chan bat, va cay lanh thi ca 3 chan deu xanh.

- eval: E8
  run_id: s4r1-20260906T102507Z-35290-E8
  exit_code: 0
  verifier: config:executors.script.tv_mot_bo_thuoc
  verified_at: 2026-09-06T10:30:22Z
  output: |
    so 6 script cua vong nay voi 36 script cua nam vong truoc — nguong 12 dong.
    XANH: mot bo thuoc, khong ban chep nao troi.

- eval: E9
  run_id: s4r1-20260906T102507Z-35290-E9
  exit_code: 0
  verifier: config:executors.script.tv_gioi_han_bam_moi_hien
  verified_at: 2026-09-06T10:30:22Z
  output: |
    bang gioi han: 10 dong · chan dem tu dia: 10 component boc-ma-khong-doc thuoc loai chi-hien-sau-khi-bam
    XANH: ca 10 dong deu tro mot component that, con boc thu vien, va co dau hieu mo/dong doc duoc tu ma.

- eval: E10
  judged_by: nguoi — chu kho, Cong 2
  verdict: PASS
  run_id: s4r1-20260906T102507Z-35290-E10
  verified_at: 2026-09-06T10:30:22Z
  human_override: Đạt — Manh Phan 2026-09-06
  rationale: |
    Cac chuoi vong nay ghi de — nhan vung thong bao — co doc nhu tieng Viet cua nguoi
    lam nghe khong. May KHONG cham muc nay.

## Bốn lệnh chứng của kho

Tất cả mã 0: `bun run db:test && bun run test` · `bun run check-types` ·
`bun run lint` · `bun run lint:slop`.

### Re-pin lần 1 — 06/09, do một ca test lọt vào commit gói bằng chứng sau lượt chấm

run_id: repin-20260906T131500Z-88301
sha: 7705ef6b07754baa39374895e8843ac76ff49c5a · suites: 4 lệnh exit 0

`packages/ui/test/render-diff.spec.tsx` — ca vẽ cho `Sonner` — đổi SAU mốc ghim cũ
`3a71e509`, nên lưới stale của pre-merge chặn đúng. Lượt lane này chạy CƯỠNG BỨC
(`--force`), 0 cache: test 11/11 · check-types 13/13 · lint 9/9 (`apps/app` về đúng
ba cảnh báo có sẵn) · lint:slop 0 lỗi.

**Lượt chạy cache đã che một màu đỏ.** Chạy lại có cache thì cả bốn lệnh mã 0; chạy
cưỡng bức song song thì `api#test` đỏ ở `mailbox-thread-writer` — nhiều gói dùng
CHUNG một cơ sở dữ liệu test nên đụng ràng buộc duy nhất `rfcMessageId`. Chạy nối
tiếp (`--concurrency=1`) thì xanh, và chạy riêng `apps/api` cũng xanh (385 pass, 0
fail).

> **Đính chính 07/09.** Câu cuối của đoạn trên nguyên văn là «Đây là tính chất của
> LỆNH CHỨNG, không phải của mã vòng này» — **sai**. Lệnh chứng của kho là
> `turbo run test --concurrency=1`, đã nối tiếp sẵn; màu đỏ ấy đến từ lệnh tự gõ
> trong phiên (`bunx turbo run test --force`, thiếu `--concurrency=1`). Phần đo còn
> lại của đoạn vẫn đúng. Người viết báo cáo tự đính chính, không đụng verdict, chữ
> ký hay con số nào.

## Vì sao PASS

Chín chân máy đều mã 0 trong một lượt chạy CÓ GHI SỔ — mỗi `run_id` mint lúc thực
thi và có mặt trong `run-log.jsonl`. Ô thứ mười là phán xét của người (E10), đã
chấm Đạt ở Cổng 2.

## Số đo

- **76 component `.tsx`** trong `packages/ui` · **37** vẽ ra một nguyên bản của thư
  viện ngoài · **16** đọc kho chuỗi dùng chung → **29** bọc mà không đọc.
- **26 chuỗi không-thuộc-về-ai** trên bốn màn, cả 26 nằm trong bảng bốn dòng năm lý
  do; `"Notifications alt+T"` biến mất vì nay đọc từ kho chuỗi.
- **Bảng giới hạn 10 dòng** — component chỉ hiện sau khi bấm, mỗi dòng chứng bằng
  dấu hiệu mở/đóng đọc được từ mã.
- **Bộ đột biến 4/4**, mỗi vết bị đúng chân chuyên trách bắt.

## Ba lần chính phép đo bắt lỗi của người viết nó

1. **Bốn con số neo trong hợp đồng đều sai** — chúng đến từ phép đếm tay: 79→76,
   35→37, 20→30. Và định nghĩa «bọc» phải đổi từ *danh sách tên gói gõ tay* sang
   *định danh nhập từ gói ngoài và được vẽ ra như thẻ JSX*.
2. **Neo sai lần thứ hai** — vá `sonner` xong thì chính nó rời khỏi nhóm
   bọc-mà-không-đọc: 15→16 và 30→29. Chân là bên phát hiện, không phải người đọc lại.
3. **Bộ chạy vòng chấm của người viết đếm thiếu** — nó kết luận PASS trong khi một
   suite đang đỏ, vì chỉ đếm eval mà không đếm suite. Đã sửa để suite đỏ ép verdict
   xuống PENDING-JUDGMENT.

Và một cái thước có sẵn của `packages/ui` bắt được thay đổi của vòng này: mọi
component đọc bảng dịch đều phải có một ca trong bộ chấm bản vẽ — `sonner` thiếu ca,
đã thêm.

### Re-pin lần 2 — 07/09, do hợp nhất 88 commit của onehub vào chuỗi trước khi giao

run_id: repin-20260906T214517Z-82885
sha: 538796cf4a0f334454dc9fc3f44f3f836a6b0ebf · suites: 4 lệnh exit 0

### Re-pin lần 3 — 07/09, do vòng sửa `thuoc-cache-het-doi-tuong` chạm hai file cấu hình turbo

run_id: repin-20260907T005455Z-44758
sha: f8aa7f4a9e1ec9ce1be8585683103adf1a901431 · suites: 4 lệnh exit 0

### Re-pin lần 4 — 2026-09-16, do Ghim lại sau khi gieo tiền đề ảnh đại diện và bỏ dòng khai chỉ sống ở một máy
run_id: repin-20260916T022636Z-63692
sha: f1a55ba0832031aa920fa708d3665e9b4dad6437 · suites: 4 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 5 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng manh.phan@onemount.com
run_id: repin-20260917T034607Z-83188
sha: 7c451de7b2567dde776a98770a8560a8efb77ff5 · suites: 4 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 6 — 2026-09-17, do chiến dịch ghim lại kit 2.14.0 (PR #47): làn eval thật trên cây đã chuyển đường ghi tạo phẩm; đo bằng manh.phan@onemount.com
run_id: repin-20260917T043608Z-90496
sha: ed70d70dd0ec9ee7412b45e63c90c925500d50c6 · suites: 4 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 7 — 2026-10-23, do F28 ho-so-do-kiem-cheo: sua thuoc ho so da ky kiem cheo goi ten (Cong Pham vi 23/10)
run_id: repin-20261023T105529Z-32502
sha: 6fdc7ed4587ef09283181bd35699a668ab3faa27 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E10 (E10 không khai paths) · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
