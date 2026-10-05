---
schema_version: 2
feature_slug: canh-kr-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 97a2eb9d7c24cc0cb7c6308c3bd47bd5211a3b02
human_signoff: Phan Le Manh 2026-09-29
---

# Evidence Report: canh-kr-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | ui-check | PASS |
| E12 | AC-10 | script | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | ui-check | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-12 | ui-check | PASS |
| E17 | AC-12 | script | PASS |
| E18 | AC-13 | test | PASS |
| E19 | AC-14 | script | PASS |
| E20 | AC-14 | script | PASS |
| E21 | AC-15 | script | PASS |
| E22 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-canh-kr-okr-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_viec
  verified_at: 2026-09-28T17:07:50Z
  output: |
    __EXIT=0

- eval: E2
  run_id: minted-canh-kr-okr-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_viec_quyen
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli4wfqwhoh_test

    __EXIT=0

- eval: E3
  run_id: minted-canh-kr-okr-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_sang_kien
  verified_at: 2026-09-28T17:07:50Z
  output: |
    __EXIT=0

- eval: E4
  run_id: minted-canh-kr-okr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_an_doi_tac
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli4vfym1a6_test

    __EXIT=0

- eval: E5
  run_id: minted-canh-kr-okr-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_bang_chung
  verified_at: 2026-09-28T17:07:50Z
  output: |
    __EXIT=0

- eval: E6
  run_id: minted-canh-kr-okr-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_ghi_nhan
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli4uuo4n5t_test

    __EXIT=0

- eval: E7
  run_id: minted-canh-kr-okr-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_bao_ghi_nhan
  verified_at: 2026-09-28T17:07:50Z
  output: |
    vi pham: 0

    __EXIT=0

- eval: E8
  run_id: minted-canh-kr-okr-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_mau
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli512nhhu4_test
    __EXIT=0

- eval: E9
  run_id: minted-canh-kr-okr-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_tu_mau
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli4vqpkoav_test

    __EXIT=0

- eval: E10
  run_id: minted-canh-kr-okr-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_khoa_pha
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli4w6cw29v_test

    __EXIT=0

- eval: E11
  run_id: phien-do crm_canh_kr_okr_do · app http://localhost:4502 · api http://localhost:4608 (nen, tien-de.mjs, bg pid 75150)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ckr_man_chrome
  verified_at: 2026-09-28T17:07:50Z
  screenshot: evidence/man/buoc-bang-kr.png
  observed: |
    buoc-bang-kr.png: bang KR cua muc tieu "Đối tác cũ đặt lại đơn trong quý" (P1) co cot «Việc»: K1 «1/2 · 1 sáng kiến», K2 (mốc) co the «Có bằng chứng», K3 hien nut «+ Thêm» — dung nhu Expected buoc 3 (khong phai «1/3» — chieu do KHONG xay ra tren ban goc). buoc-bang-kr-chi-doc.png: cung bang do voi nguoi chi doc (Phan Kim Chi) — K3 hien «—» thay vi «Thêm», dung d-14. buoc-khung-kr.png: khung KR cua K1 mo chong len khung muc tieu, tab «Việc và sáng kiến» chon san, CHI mot tab (khong co «Bằng chứng») — dung buoc 4. buoc-khung-kr-chi-doc.png: cung khung KR do nguoi chi doc cung mo duoc (d-14). buoc-sang-kien.png: K1 co dong viec moi "Gọi lại 20 đối tác cũ" da danh dau xong (Đỗ Minh Khoa), va dong sang kien moi "Công ty Phương Nam cli7dp3" voi StatusIndicator xanh «Đang chạy» — dung buoc 5+6. buoc-bang-chung.png: tab «Bằng chứng» cua K2 co 2 dong, dong moi «drive.google.com» sau khi dinh https://drive.google.com/x, toast «Đã đính bằng chứng.» — dung buoc 7. buoc-mo-thang.png: trang thai loi «Không tìm thấy KR này» + nut «Về khung mục tiêu» khi mo record=kr:<khong ton tai> — dung buoc 8. buoc-cap-nhat-moc.png: K4 «Hoàn tất quy trình thẩm định đối tác» hien «Xong»/100%/«Có bằng chứng» sau khi gui cap nhat voi https://drive.google.com/bb, toast «Đã gửi cập nhật» — dung buoc 9. buoc-rong.png: khung KR K3 Empty state «Chưa có việc hay sáng kiến nào cho KR này» + nut «Thêm việc»/«Gắn…» — dung buoc 10 phan 1. buoc-loi.png: sau khi chan truy van canhKr, Empty chuyen thanh loi «Không tải được việc của KR này» + nut «Thử lại» — dung buoc 10 phan 2. buoc-khoa.png: sau khi day chu ky sang cham-diem, dong «Kỳ đang chấm điểm hoặc đã đóng, hay mục tiêu đã bỏ — việc chỉ đọc.», nut ghi (Thêm việc/Gắn…) khoa — dung buoc 10 phan 3. buoc-khung-kr-390.png va buoc-bang-kr-390.png: anh 390px, panel nam gon trong khung, khong thay thanh cuon ngang — khop voi khang dinh scrollWidth<=innerWidth ma script da tu kiem (PASS).
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-canh-kr-okr-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ckr_man_chrome
  verified_at: 2026-09-28T17:07:50Z
  output: |
    (cùng lần chạy tien-de.mjs với E11/E15/E17): phien-do: xong — mã 0
    __EXIT=0

- eval: E13
  run_id: minted-canh-kr-okr-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ckr_khung_kr_dom
  verified_at: 2026-09-28T17:07:50Z
  output: |
    Ran 44 tests across 1 file. [2.37s]

    __EXIT=0

- eval: E14
  run_id: bqinj1xi1 / EVAL=E14 tien-de.mjs run, kho crm_canh_kr_okr_do
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ckr_man_chrome
  verified_at: 2026-09-28T17:07:50Z
  screenshot: evidence/E14-step2.png
  observed: |
    E14-step2.png (buoc-chi-okr, dark theme, desktop): khung KR K1 cho người vai «chỉ OKR» (Đoàn Thị Thu) hiện đúng hai dòng khoá «Một kế hoạch 30 ngày — bạn không có quyền xem» kèm icon ổ khoá, không có liên kết bấm được, không có nút «Gắn…»; không thấy tên công ty P (Phương Nam) hay Q ở đâu trong khung — khớp Expected bước 2. E14-step3.png (buoc-ghi-nhan): tab Trao đổi ở chế độ «Ghi nhận» hiện dòng «Đoàn Thị Thu ghi nhận Hoàng Yến Nhi, Ngô Văn Toàn» với icon cúp (khác hẳn dòng bình luận thường), kèm lời ghi nhận đã gõ — khớp Expected bước 3. E14-step4.png (buoc-mo-ke-hoach): sau khi trưởng P1 bấm dòng sáng kiến trong khung KR K1, khung kế hoạch 30 ngày của P («Công ty Phương Nam cli92py») mở chồng lên, đúng tiêu đề công ty P — khớp Expected bước 4. E14-step5.png (buoc-ghi-nhan ở 390px): cùng dòng ghi nhận hiện gọn trong khung 390px, không tràn ngang thấy được bằng mắt (script tự khẳng định scrollWidth<=innerWidth và translate=no, nằm trong 27 khẳng định, 0 hỏng) — khớp Expected bước 5. Log chạy cho thấy bước 1 (gieo K1 có cả sáng kiến P lẫn Q — hai dòng kế hoạch 30 ngày) đã thành công trước khi vào bước 2. Kết luận: exitCode=0, mọi khẳng định (27/27) đạt, ảnh khớp Expected sau khi đọc trực tiếp từng frame. KHÔNG có sửa code nào được thực hiện trong phiên chấm này.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-canh-kr-okr-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ckr_man_chrome
  verified_at: 2026-09-28T17:07:50Z
  output: |
    (cùng lần chạy tien-de.mjs với E11/E12/E17): phien-do: xong — mã 0
    Network: driver là script node nội bộ (man-canh-kr.mjs), không phải browser tool có read_network_requests trong phiên verifier này → networkObserved = "n-a (driver)"; dump tham khảo (log CDP nội bộ của chính eval E15 dùng chung một lần chạy) ghi ở _acceptance/canh-kr-okr/evidence/E14-network.txt.
    __EXIT=0

- eval: E16
  run_id: canh-kr-okr-E16-2026-09-29T00:12
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ckr_man_chrome
  verified_at: 2026-09-28T17:07:50Z
  screenshot: evidence/man/buoc-mau-danh-sach.png
  observed: |
    7 frame đã mở bằng Read, đối chiếu evals.yaml E16: 1) buoc-mau-danh-sach.png (1440, admin le-hai-dang) — trang {slug}/settings/okr, khối «Cấu hình» hiện đủ, nút «Thêm mẫu» ở góc phải khối «Mẫu OKR»; ba dòng mẫu nằm dưới fold nên không thấy trong ảnh này, được xác nhận qua DOM assertion trong log. 2) buoc-mau-sheet.png (1440) — sheet «Thêm mẫu OKR» mở, KR thứ 2 có Khởi điểm=50/Đích=20, viền ô Đích đỏ, dòng lỗi đỏ «Đích phải lớn hơn khởi điểm.», nút «Lưu mẫu» xám (tắt) — đúng expected. 3) buoc-mau-sheet-390.png (390) — cùng sheet, cột đơn, không tràn ngang. 4) buoc-mau-luu.png (1440) — sheet đóng, toast xanh «Đã lưu mẫu.» góc dưới trái. 5) buoc-mau-khong-quyen.png (1440, member phan-kim-chi) — dòng lý do «Chỉ quản trị đổi được cấu hình chương trình.» dưới tiêu đề «Chương trình OKR» — đúng expected. 6) buoc-tu-mau.png (1440, sau tạo) — khung mục tiêu nháp «Giữ chân đối tác cũ» mở, badge «Nháp», 2 KR đúng số (12/30 và 55/90), toast «Đã tạo mục tiêu nháp từ mẫu.» — đúng expected. 7) buoc-tu-mau-390.png (390) — form «Thêm mục tiêu» điền sẵn, ô Khởi điểm/Đích trống viền đỏ + lỗi «Điền khởi điểm và đích của đơn vị.» dưới mỗi ô, không tràn ngang. Log chiều đỏ (--chieu-do --chi E16): bản sao tu-mau.tsx bỏ lọc theo đơn vị làm bước 5 đỏ đúng như kỳ vọng, in nguyên văn câu ghim khớp regex trong evals.yaml — xác nhận eval nhạy thật, không phải cổng giả.
  network_observed: n-a (driver)

- eval: E17
  run_id: minted-canh-kr-okr-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ckr_man_chrome
  verified_at: 2026-09-28T17:07:50Z
  output: |
    (cùng lần chạy tien-de.mjs với E11/E12/E15): phien-do: xong — mã 0
    Assertion phạm vi ghi: git status --short sau khi chạy chỉ cho thấy ảnh evidence/man/*.png đổi cùng vài tệp evidence khác thuộc nhóm E11/E14 (mtime sớm hơn, không thuộc 7 ảnh của E16) — kết luận có một phiên/luồng khác chạy song song trên cùng worktree (khớp memory "Hai luồng cùng một checkout"), không phải do lệnh của phiên này; không đụng, không revert.
    __EXIT=0

- eval: E18
  run_id: minted-canh-kr-okr-E18-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ckr_bo_mau
  verified_at: 2026-09-28T17:07:50Z
  output: |
    test-run: dropped crm_muli5br9e31a_test

    __EXIT=0

- eval: E19
  run_id: minted-canh-kr-okr-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ckr_ty_le
  verified_at: 2026-09-28T17:07:50Z
  output: |
    phien-do: xong — mã 0

    __EXIT=0

- eval: E20
  run_id: minted-canh-kr-okr-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ckr_migration_chi_them
  verified_at: 2026-09-28T17:07:50Z
  output: |
    goc so sanh: origin/onehub (7db7cea3) · migration moi: 20261004010000_okr_canh_kr · so cau lenh: 32 · khoa ngoai viet truoc khop: 15/15

    __EXIT=0

- eval: E21
  run_id: minted-canh-kr-okr-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ckr_san_thiet_ke
  verified_at: 2026-09-28T17:07:50Z
  output: |
    vi pham: 0

    __EXIT=0

- eval: E22
  judged_by: judge-panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Ba file được cấp (design doc lượt 8a, contract.md, design-pass.md) đều là hồ sơ ý định/thiết kế, không phải cái đã làm; không file nào chứa diff hay mã nguồn thực tế của lượt này để xác nhận triển khai có khớp thiết kế hay không.
    - operational-feasibility: UNCERTAIN — Ba file trong phạm vi chỉ mô tả ý định thiết kế và bản mẫu /proto tĩnh (dữ liệu giả, không đường ghi); không file nào cho thấy diff thật (schema.prisma, OkrAccessService, hàm lienKetChoVai, các component Khung KR/dòng ghi nhận/sheet mẫu, CONTEXT.md đã sửa) nên không đủ căn cứ chấm PASS hay FAIL.
    - spec-alignment: UNCERTAIN — Input không cấp diff của lượt này (không schema.prisma, không OkrAccessService, không router okr, không CONTEXT.md, không component KR/ghi-nhan/sheet mẫu); không có căn cứ để xác nhận hay bác bỏ bất kỳ nhánh nào trong năm nhánh của câu hỏi AC-15.
  rationale: |
    Cả ba lens đồng thuận UNCERTAIN vì bộ input của E22 chỉ gồm hồ sơ thiết kế/ý định (design doc lượt 8a, contract.md, design-pass.md) — không có diff hay mã nguồn thật của lượt "canh-kr-okr" round 1 để đối chiếu năm vế của AC-15: hình dạng sáu bảng mới trong schema.prisma, vị trí quyền trong OkrAccessService, hàm lienKetChoVai chống lộ dữ liệu đối tác cho vai okr, xuất xứ component từ packages/ui, và mục từ điển CONTEXT.md.
  required_evidence:
    - git diff của lượt này trên schema.prisma (packages/db/prisma) — xác nhận đúng sáu model mới liền cuối file, chỉ CREATE TABLE/INDEX/khoá ngoại trên bảng mới, không ADD COLUMN trên bảng OKR có sẵn
    - Mã nguồn OkrAccessService (đường dẫn thật trong apps/api) cho các hàm assertKyGhiDuoc/ghiDuocKr/coTheGanSangKien — xác nhận quyền nằm ở đó chứ không suy ở apps/app
    - Mã nguồn hàm lienKetChoVai cùng grep mọi nơi gọi nó trong apps/api/src/okr — xác nhận đúng một điểm quyết định trả hàng sáng kiến, và bộ chọn chiến dịch/kế hoạch dùng thủ tục list có sẵn của router campaign/onboarding-plan
    - Diff các component Khung KR (tab Việc và sáng kiến / Bằng chứng), dòng ghi nhận trong tab Trao đổi, và sheet Mẫu OKR — xác nhận dùng Sheet/Item/Checkbox/PickListDialog/TokenField/StatusIndicator/ConfirmDialog của packages/ui, không có <table>/<ul className="divide-y">/hộp rounded-lg border tự dựng
    - Diff CONTEXT.md thêm năm mục Việc (KR), Sáng kiến, Bằng chứng, Ghi nhận, Mẫu OKR theo đúng khuôn ba phần (nghĩa, Avoid, Vì sao) như các mục hiện có
  human_override: Phan Le Manh 2026-09-29 — Đạt

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-canh-kr-okr-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T17:07:50Z

- cmd: bunx turbo run lint --force
  run_id: minted-canh-kr-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T17:07:50Z

- cmd: bun run lint:slop
  run_id: minted-canh-kr-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T17:07:50Z

- cmd: bunx turbo run build --force
  run_id: minted-canh-kr-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T17:07:50Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: Cả 21 eval máy (E1-E21, gồm ba cặp ui-check + script chung một lần chạy tien-de.mjs cho AC-10/AC-11/AC-12) và bốn lệnh suite hồi quy (test, lint, lint:slop, build) đều pass ở lần chạy đầu, không có eval nào fail hay bị BLOCKED. E22 (judgment, AC-15) — cả ba lens (domain-correctness, operational-feasibility, spec-alignment) đều UNCERTAIN vì input chỉ có hồ sơ thiết kế/ý định, không có diff mã nguồn thật của lượt này — chờ người tự soi diff và quyết ở Gate 2.

### Re-pin lần 1 — 2026-09-29, do PR #210 sửa hai thước của canh-kr-okr (ảnh ra .acceptance-runs; E20 đo được sau gộp); bằng chứng hoá cũ từ b7823dd1
run_id: repin-20260929T141057Z-15407
sha: b08c53a6574d2a596d22b3f023cf9c24a1a0a7cc · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E11 (E11 không khai paths), E14 (E14 không khai paths), E16 (E16 không khai paths), E22 (E22 không khai paths)

### Re-pin lần 2 — 2026-09-29, do thước migration của khep-ky-okr và canh-kr-okr đo được sau khi lượt đã gộp (dựng lại nền lúc gộp)
run_id: repin-20260929T151035Z-23219
sha: f55e110820fbc2ccf229a0445cdf99813408649e · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E11 (E11 không khai paths), E14 (E14 không khai paths), E16 (E16 không khai paths), E22 (E22 không khai paths)

### Re-pin lần 3 — 2026-10-04, do sửa thước theo diff sau gộp và khai paths (lô a)
run_id: repin-20261004T095914Z-97808
sha: b0e84291d6a770394f91f9c24730616f21273654 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E11, E14, E16, E22 · diff chạm vật đo ngoài làn máy: E11, E14, E16 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-10-05, do sửa thước đỏ lô 2-4 (a)
run_id: repin-20261005T012004Z-26223
sha: 97a2eb9d7c24cc0cb7c6308c3bd47bd5211a3b02 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E11, E14, E16, E22 · diff chạm vật đo ngoài làn máy: E11, E14, E16 — chưa chứng lại, đi vòng S4 delta
