---
schema_version: 2
feature_slug: bang-thanh-vien-giu-hang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 51a4de40d820df124d6455b7bd6d918958c1666b
human_signoff: Phan Le Manh 2026-09-25
---

# Evidence Report: bang-thanh-vien-giu-hang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-thanh-vien-giu-hang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E2
  run_id: minted-bang-thanh-vien-giu-hang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E3
  run_id: minted-bang-thanh-vien-giu-hang-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E4
  run_id: minted-bang-thanh-vien-giu-hang-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E5
  run_id: minted-bang-thanh-vien-giu-hang-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E6
  run_id: minted-bang-thanh-vien-giu-hang-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E7
  run_id: minted-bang-thanh-vien-giu-hang-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    -- tiền đề làn đo: đã dọn tên miền được phép

- eval: E8
  run_id: minted-bang-thanh-vien-giu-hang-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ttv_do_bang
  verified_at: 2026-09-25T09:38:23Z
  screenshot: _acceptance/bang-thanh-vien-giu-hang/evidence/thanh-vien-1440-dau.png
  observed: |
    Đọc trực tiếp cả 8 file PNG trong _acceptance/bang-thanh-vien-giu-hang/evidence/ (mtime 16:41, mới nhất, sinh ra từ đúng lượt đo này):
    1) thanh-vien-1440-dau.png — scrollTop 0: tiêu đề "Thành viên" + mô tả + ô tìm + nút Lọc/Sắp xếp/Cột và các hàng đầu bảng (Ada Okafor, Marcus Lindqvist, Priya Raman, dev, manh.phan, manh, e12-admin, zzm5c39f436, E13...) hiện rõ, không khối nào đè lên. Khớp Expected.
    2) thanh-vien-1440-noi.png — đáy gốc DataTable ở giữa khung cuộn: hàng cuối bảng thành viên (E13 Chu ke hoach khac), dòng phân trang "1–10 trong số 10" và tiêu đề "Được phép vào" cùng nằm trong một khung nhìn; khối "Được phép vào" (mô tả + nút "Cho phép một địa chỉ" + hàng ttv-lan-do-...) bắt đầu ngay bên dưới, không đè lên hàng nào. Khớp Expected.
    3) thanh-vien-768-dau.png — 768px, đầu trang: tiêu đề + bảng, cột bị cắt do hẹp nhưng không hàng nào bị đè/cắt dọc. Khớp.
    4) thanh-vien-768-noi.png — 768px, đáy gốc bảng giữa khung cuộn: hàng cuối + "1–10 trong số 10" + tiêu đề "Được phép vào" (bảng 4 cột: Địa chỉ/Vai trò khi vào/Người cho phép/Cho phép lúc) cùng khung, không đè. Khớp.
    5) thanh-vien-375-dau.png — 375px mobile: header rút gọn (hamburger), tab ngang Chung/Tiến tệ/Trưởng/Thành viên/Tổ chức, tiêu đề Thành viên, ô tìm, nút Lọc, hàng đầu bảng (chỉ 2 cột Tên/Vai trò) hiện rõ. Khớp.
    6) thanh-vien-375-noi.png — 375px, đáy gốc bảng: hàng cuối + "1–10 trong số 10" + tiêu đề "Được phép vào" + bảng phép vào bắt đầu ngay dưới, không đè hàng. Khớp.
    7) menu-vai-1440.png — nút "..." của Marcus Lindqvist đã click, menu mở hiện đủ bốn vai trò yêu cầu (Chủ sở hữu, Quản trị, Thành viên, Chỉ OKR) cộng thêm hai mục hành động (Chuyển việc 30 ngày…, Gỡ khỏi không gian làm việc màu đỏ). Khớp "menu mở với bốn vai".
    8) tim-khong-ra-1440.png — ô tìm chứa "ttv-khong-ai-trung-tu-nay", bảng hiện đúng câu "Không ai khớp với bộ lọc này." nằm giữa vỏ bảng có viền (border), dưới có dòng "Không có kết quả". Khớp "câu nằm trong vỏ bảng có viền".
    Không có mâu thuẫn nào với Expected ở cả 8 khung hình.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mugrqlnxmwg7
  exit_code: 0
  verified_at: 2026-09-25T09:38:23Z

- cmd: bunx turbo run lint --force
  run_id: minted-bang-thanh-vien-giu-hang-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-25T09:38:23Z

- cmd: bun run lint:slop
  run_id: minted-bang-thanh-vien-giu-hang-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-25T09:38:23Z

- cmd: bunx turbo run build --force
  run_id: minted-bang-thanh-vien-giu-hang-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-25T09:38:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3 REJECT — thước tràn ngang cũ chỉ đo `document`, bỏ sót bảng "Được phép vào" tràn bên trong `main` ở 375px (thước cũ báo "DUNG 375: tràn ngang 0px" trong khi ảnh 375 cho thấy bảng tràn trong main); trở lại thực thi để sửa thước đo cả `main.scrollWidth`.
Round 2: toàn bộ 8 eval (E1–E8) và 4 lệnh suite (test, lint, lint:slop, build) PASS.

### Re-pin lần 1 — 2026-09-25, do tệp kiểm khung-trang-cai-dat.dom.tsx thôi gọi git merge-base (CI không có origin/onehub); E16 neo vào cặp sha của lần gộp #138
run_id: repin-20260925T105306Z-51706
sha: d60133f3d91fdf51b9db5e788dc375d25de6c12a · suites: 4 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 · diff chạm vật đo ngoài làn máy: E8 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-8

### Re-pin lần 2 — 2026-10-04, do gộp onehub 6e7accc2 (#252) và vá thước lăn do-bang/do-khoi chống đua (51a4de40)
run_id: repin-20261004T131201Z-36740
sha: 51a4de40d820df124d6455b7bd6d918958c1666b · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 · diff chạm vật đo ngoài làn máy: E8 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-8
