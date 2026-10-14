---
schema_version: 2
feature_slug: noi-bon-nut-dieu-phoi
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50dea330749dbfd9150d050f27cce733f47bf696
human_signoff: Phan Le Manh 2026-09-21
---

# Evidence Report: noi-bon-nut-dieu-phoi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E13 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | ui-check | PASS |
| E14 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-noi-bon-nut-dieu-phoi-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_them_bo_phan
  verified_at: 2026-09-21T09:00:00+07:00
  output: |
     0 fail
     4 expect() calls
    Ran 2 tests across 1 file. [613.00ms]

- eval: E2
  run_id: mubdn33oknx7
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_ghi_bo_phan
  verified_at: 2026-09-21T09:02:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [626.00ms]
    test-run: dropped crm_mubdn33oknx7_test

- eval: E3
  run_id: minted-noi-bon-nut-dieu-phoi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_soan_khuon
  verified_at: 2026-09-21T09:04:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [787.00ms]

- eval: E4
  run_id: minted-noi-bon-nut-dieu-phoi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_ghi_khuon
  verified_at: 2026-09-21T09:06:00+07:00
  output: |
    Ran 1 test across 1 file. [830.00ms]
    test-run: dropped crm_mubdne7bkamd_test
    EXIT_CODE=0

- eval: E5
  run_id: minted-noi-bon-nut-dieu-phoi-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_chua_co_bo_phan
  verified_at: 2026-09-21T09:08:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 2 tests across 1 file. [618.00ms]

- eval: E6
  run_id: minted-noi-bon-nut-dieu-phoi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_tao_ke_hoach
  verified_at: 2026-09-21T09:10:00+07:00
  output: |
     0 fail
     2 expect() calls
    Ran 1 test across 1 file. [798.00ms]

- eval: E7
  run_id: mubdn1jgd77g
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_ghi_ke_hoach_json
  verified_at: 2026-09-21T09:12:00+07:00
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [844.00ms]
    test-run: dropped crm_mubdn1jgd77g_test

- eval: E13
  run_id: mubdn1jgd77g
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_ghi_ke_hoach_json
  verified_at: 2026-09-21T09:12:00+07:00
  output: |
     6 expect() calls
    Ran 1 test across 1 file. [844.00ms]
    test-run: dropped crm_mubdn1jgd77g_test

- eval: E8
  run_id: minted-noi-bon-nut-dieu-phoi-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_nut_tren_thanh_cong_cu
  verified_at: 2026-09-21T09:14:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [579.00ms]

- eval: E9
  run_id: minted-noi-bon-nut-dieu-phoi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_them_moi_gioi
  verified_at: 2026-09-21T09:16:00+07:00
  output: |
     0 fail
     3 expect() calls
    Ran 1 test across 1 file. [714.00ms]

- eval: E10
  run_id: mubdn2dzsp70
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_ghi_danh
  verified_at: 2026-09-21T09:18:00+07:00
  output: |
     2 expect() calls
    Ran 1 test across 1 file. [591.00ms]
    test-run: dropped crm_mubdn2dzsp70_test

- eval: E11
  run_id: minted-noi-bon-nut-dieu-phoi-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_luu_hong
  verified_at: 2026-09-21T09:20:00+07:00
  output: |
     0 fail
     9 expect() calls
    Ran 1 test across 1 file. [686.00ms]

- eval: E14
  run_id: minted-noi-bon-nut-dieu-phoi-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.nbn_luu_mot_lan
  verified_at: 2026-09-21T09:22:00+07:00
  output: |
     0 fail
     5 expect() calls
    Ran 1 test across 1 file. [929.00ms]

- eval: E12
  run_id: minted-noi-bon-nut-dieu-phoi-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.ui_check
  verified_at: 2026-09-21T09:30:00+07:00
  screenshot: evidence/E12-them-bo-phan-mo-1440.png
  observed: |
    Đọc từng trong 16 frame đã lưu bằng Read (ảnh, không phải trí nhớ lệnh):
    E12-them-bo-phan-mo-1440.png: hộp thoại "Thêm bộ phận" mở, ô "Tên bộ phận" chứa "E12 BP 1440", nút Lưu/Huỷ đủ.
    E12-them-bo-phan-sau-1440.png: hộp thoại đã đóng, cột "Bộ phận" ở Điều phối 30 ngày hiện "E12 BP 1440" (dòng mới) trong danh sách.
    E12-soan-khuon-mo-1440.png: hộp thoại "Soạn khuôn kế hoạch" mở, đủ Tên khuôn ("E12 Khuon 1440"), Loại đối tác (để trống — tuỳ chọn), và ĐỦ HAI bước: bước 1 "Ho so"/"E12 BP 1440"/"01", bước 2 "Dao tao"/"E12 BP 1440"/"03".
    E12-soan-khuon-sau-1440.png: đóng hộp thoại, "E12 Khuon 1440" hiện trong "Khuôn kế hoạch" với số bước = 2.
    E12-tao-ke-hoach-mo-1440.png: hộp thoại "Tạo kế hoạch từ khuôn" mở, đủ ô: Công ty đối tác = Attio, Khuôn = E12 Khuon 1440, Ngày bắt đầu = 21 thg 9, 2026, Người cầm trịch = manh.phan.
    E12-tao-ke-hoach-sau-1440.png: đóng hộp thoại, danh mục bảng hiện dòng mới "Attio / Ho so / ... / E12 BP 1440", và nút "Kế hoạch mới" vẫn có trên thanh công cụ dù đã có kế hoạch (khớp AC-6).
    E12-them-moi-gioi-mo-1440.png: hộp thoại "Thêm môi giới" mở, ô "Cá nhân" đã chọn "Trâm Rangttmu3fhhhb".
    E12-them-moi-gioi-sau-1440.png: đóng hộp thoại, "Phễu môi giới" đổi mẫu số từ 0 lên "1 người đang làm nghề trên sàn", 4 bậc đều hiện 0/1 (phễu đã cập nhật).
    8 frame khổ 768 (them-bo-phan/soan-khuon/tao-ke-hoach/them-moi-gioi, mo+sau) lặp lại đúng nội dung tương ứng của khổ 1440 với tên hậu tố "768": mọi ô nhập đọc được trọn vẹn, hộp thoại (Sheet bên phải) nằm gọn trong 768px, không có phần bị cắt hay tràn ngang sang trái; nền tối bên trái chỉ là phần overlay, không phải nội dung bị đẩy ra ngoài khung.
    Không thiếu hộp thoại nào trong bốn hộp thoại yêu cầu (Thêm bộ phận, Soạn khuôn, Tạo kế hoạch từ khuôn, Thêm môi giới) ở cả hai khổ — khớp Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mubdmzs7y2wc
  exit_code: 0
  verified_at: 2026-09-21T09:35:00+07:00

- cmd: bunx turbo run lint --force
  run_id: minted-noi-bon-nut-dieu-phoi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-21T09:40:00+07:00

- cmd: bun run lint:slop
  run_id: minted-noi-bon-nut-dieu-phoi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-21T09:42:00+07:00

- cmd: bunx turbo run build --force
  run_id: minted-noi-bon-nut-dieu-phoi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-21T09:45:00+07:00

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — không có eval nào chạy nhiều lần (runs > 1)

## Iterations

Round 1: 14 eval (E1–E14) và 4 lệnh suite (bun run test, bunx turbo run lint --force, bun run lint:slop, bunx turbo run build --force) đều PASS ngay vòng đầu tiên — không có vòng trước.

### Re-pin lần 1 — 2026-09-21, do hoá cũ do trộn onehub (PR #70 kit 2.18.0)
run_id: repin-20260921T154017Z-20554
sha: f30b237fbad09ace55e3cb89f573d5b9756c7110 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 2 — 2026-09-22, do lượt ke-hoach-la-mot-ban-ghi sửa bài kiểm của hồ sơ (d-21, d-23) và dời màn hồ sơ kế hoạch sang PlanSheet
run_id: repin-20260922T065429Z-21311
sha: 2b389d3c924a29785f9250584bbae77718359592 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9

### Re-pin lần 3 — 2026-09-22, do CI đỏ vì mock next/navigation của E12 sống sang tệp đăng nhập; sửa bài kiểm ở 18ddded2
run_id: repin-20260922T070657Z-92620
sha: 18ddded26be1c1a204d4e2df661aa27669700a88 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 4 — 2026-09-22, do bai kiem nut-tren-thanh-cong-cu viet lai do nut o dau trang (onboarding-giong-deals)
run_id: repin-20260922T151614Z-70182
sha: 8a8f86a7e454db4fd02d0fee4fea6a4770944bdc · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9

### Re-pin lần 5 — 2026-09-22, do hoa cu do merge origin/onehub (#84)
run_id: repin-20260922T152039Z-31450
sha: e1c3ff8a020a3667823dbb8f87058686559ed67d · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 6 — 2026-09-24, do hành vi phòng ban dời sang Cài đặt › Tổ chức (cau-truc-to-chuc AC-12)
run_id: repin-20260924T071819Z-86475
sha: ff81251be877f3cd4c53c7682150e2def52a09b0 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9

### Re-pin lần 7 — 2026-09-24, do sửa của cau-truc-to-chuc ở S4 và hai lần gộp onehub chạm vùng phòng ban
run_id: repin-20260924T092647Z-71437
sha: 7aa510c3404a0b01e5e523712f5cfc65906f3f3f · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 8 — 2026-09-24, do dời bài kiểm đã ký sang bố cục danh sách – chi tiết (to-chuc-danh-sach-chi-tiet), đổi câu lỗi nhập theo AC-8
run_id: repin-20260924T164220Z-99128
sha: ded515a9d79a9a0a729930d227b1fe7b5801e70b · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9

### Re-pin lần 9 — 2026-09-24, do S4 vòng 2 của to-chuc-danh-sach-chi-tiet: bài nhap-man đổi dữ liệu gửi mong đợi (traTen), dòng người và bước 3 hộp nhập
run_id: repin-20260924T183547Z-84900
sha: 70776c91ed7b3c29c44fdcd1863f171659aa4346 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 10 — 2026-09-25, do mot-duong-ghi-phong-ban: bài kiểm chuyển sang org.*, đường ghi phòng ban cũ gỡ
run_id: repin-20260925T025226Z-13987
sha: dd85e27b0cd98a954011374c51e2679021a3c880 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 11 — 2026-09-25, do mot-duong-ghi-phong-ban: ghim lại sau gộp onehub a8572437 (#129) và thêm ba thủ tục org.*Department
run_id: repin-20260925T032447Z-74232
sha: dfc8ff345842e738f421c08891eb1754198d9064 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 12 — 2026-09-25, do gộp onehub 5d9e8b9c (#135 Zalo) vào nhánh — mã Zalo không chạm phòng ban
run_id: repin-20260925T042418Z-71551
sha: fd4ed7c19a1d747430525b716a645d0a4fd7f732 · suites: 4 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · AC không có chốt máy: AC-9

### Re-pin lần 13 — 2026-10-14, do ngay-lich-test-tao-ke-hoach sửa ngayGiuaThangNay() trong apps/app/test/noi-bon-nut.dom.tsx
run_id: repin-20261014T221230Z-92162
sha: 50dea330749dbfd9150d050f27cce733f47bf696 · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E12 · diff chạm vật đo ngoài làn máy: E12 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-9 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
