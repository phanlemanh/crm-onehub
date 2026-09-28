---
schema_version: 2
feature_slug: may-soan-de-xuat
verdict: BLOCKED
failed_evals: []
reason: E2t (AC-12) không chạy được — lệnh `bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/may-soan-de-xuat/rang/blob-that.mjs"` thoát mã 2 với thông điệp "KHONG DO DUOC: thieu BLOB_READ_WRITE_TOKEN that". Phiên đo cần khoá Blob thật (không phải khoá giả) để gọi `taiLieu.nguon.xinCho`/`nhan`/`taiVe` qua Blob storage thật; môi trường phiên này không có khoá đó nên verifier không tự chạy được. Mọi eval máy khác (26/27 eval + 2 ui-check + 4 lệnh suite hồi quy) đều PASS trên đúng cây đã pin ở `verified_commit`.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2e0b39bf9c1e4820682870bb6775e0c38e8d0151
human_signoff:
---

# Evidence Report: may-soan-de-xuat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E2u | AC-2 | ui-check | PASS |
| E2t | AC-12 | script | BLOCKED |
| E3 | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5d | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |
| E11u | AC-11 | ui-check | PASS |
| E11s | AC-11 | script | PASS |
| E12 | AC-12 | test | PASS |
| E13 | AC-13 | test | PASS |
| E13b | AC-13 | script | PASS |
| E14 | AC-14 | test | PASS |
| E15a | AC-15 | script | PASS |
| E15j | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-may-soan-de-xuat-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_chi_them
  verified_at: 2026-09-28T05:29:24Z
  output: |
    migration moi: 20261003010000_may_soan_de_xuat · so cau lenh: 11

- eval: E1b
  run_id: minted-may-soan-de-xuat-E1b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_migration_tren_ban_sao
  verified_at: 2026-09-28T05:29:24Z
  output: |
    khang-dinh=7/7

- eval: E2
  run_id: minted-may-soan-de-xuat-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_nhan
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukum95xjj8y_test

- eval: E2u
  run_id: crm_wizardly_lumiere_e25e92_do (phien-do chinh) + crm_msd_tai_nguon_chieu_do_do (chieu-do)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_tai_nguon
  verified_at: 2026-09-28T05:29:24Z
  screenshot: evidence/E2u-step1.png
  observed: |
    step1 (msd-tai-1440.png, 1440px): dialog "Tài nguồn lên" mở đúng, có vùng kéo-thả với icon upload + chữ "Kéo tệp vào đây, hoặc chọn tệp" / "Word (.docx) hoặc PDF, tới 20 MB", mục "Tệp này cho trang nào" có radio "Trang mới" đã được chọn (nút xanh đậm), "Cập nhật trang đang dùng" bị mờ/disable kèm chữ "Chưa có trang nào có bản đang dùng." Đúng Expected bước 1.
    step2 (msd-nguon-1440.png, 1440px): trang "Tài liệu", tab "Nguồn" đang active, bảng có 1 hàng: cột Nguồn = "quyet-dinh-hoa-hong-doi-tac.docx", cột Trang = "Quyết định hoa hồng đối tác 2026", cột Người tải = "Lê Thu Trang", cột Trạng thái = icon + chữ "Máy đang soạn", cột Ngày tải = "28/09/2026". Đúng Expected bước 2.
    step3+step4 (390px): dialog và tab "Nguồn" xếp gọn kiểu thẻ, không tràn/cuộn ngang, vẫn hiển thị đầy đủ tên tệp và nhãn "Máy đang soạn". Đúng Expected bước 3 (không tràn ngang).
    Cả 4 frame không mâu thuẫn Expected — khớp hoàn toàn với ghi nhận trong log của chính script.
  network_observed: n-a (driver)

- eval: E2t
  status: BLOCKED (cannotRun)
  cmd: bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/may-soan-de-xuat/rang/blob-that.mjs"
  reason: Thiếu BLOB_READ_WRITE_TOKEN (environment variable required) — không thể chạy verifier script. Phiên đo cần khoá này để làm việc với blob storage.
  exit_code: 2
  verifier: config:executors.script.msd_blob_that
  verified_at: 2026-09-28T05:29:24Z
  output: |
    -- tiền đề làn đo: kho "crm" không phải kho dùng-một-lần — chạy trong một phiên đo riêng
    phien-do: kho crm_wizardly_lumiere_e25e92_do · app http://localhost:4281 · api http://localhost:4899
    KHONG DO DUOC: thieu BLOB_READ_WRITE_TOKEN that
    phien-do: xong — mã 2

- eval: E3
  run_id: minted-may-soan-de-xuat-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_tu_choi
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukum9oczedl_test

- eval: E3d
  run_id: minted-may-soan-de-xuat-E3d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_tai_loi
  verified_at: 2026-09-28T05:29:24Z
  output: |
    Ran 3 tests across 1 file. [1076.00ms]

- eval: E4
  run_id: minted-may-soan-de-xuat-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_trung
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukum9kyc022_test

- eval: E5
  run_id: minted-may-soan-de-xuat-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khong_blob
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumadaf5mb_test

- eval: E5d
  run_id: minted-may-soan-de-xuat-E5d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_nguon_tat
  verified_at: 2026-09-28T05:29:24Z
  output: |
    Ran 2 tests across 1 file. [857.00ms]

- eval: E6
  run_id: minted-may-soan-de-xuat-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_doc_chu
  verified_at: 2026-09-28T05:29:24Z
  output: |
    (8 ca ma tran viet truoc: quyet-dinh.docx/quy-trinh.pdf DANG_SOAN, theo-doi.docx giu 1,8%
    bo 1,6%, ban-quet/cid/fffd CAN_GO_TAY 0 lan goi model, hong.docx/mat-khau.pdf LOI dung lyDo,
    ca thu 8 LOI sha256 khong khop)

- eval: E7
  run_id: minted-may-soan-de-xuat-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_dat
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumkzjsqfy_test

- eval: E8
  run_id: minted-may-soan-de-xuat-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_quet_duong_ghi
  verified_at: 2026-09-28T05:29:24Z
  output: |
    so tep da quet: 205 · so loi goi Prisma da xet: 300

- eval: E8b
  run_id: minted-may-soan-de-xuat-E8b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumn1wovkl_test

- eval: E9
  run_id: minted-may-soan-de-xuat-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_kiem_so
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumpwwnq8y_test

- eval: E10
  run_id: minted-may-soan-de-xuat-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_hong
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumq29zhh7_test

- eval: E10b
  run_id: minted-may-soan-de-xuat-E10b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_soan_lai
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumq6xycip_test

- eval: E10d
  run_id: minted-may-soan-de-xuat-E10d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_hang_nguon
  verified_at: 2026-09-28T05:29:24Z
  output: |
    Ran 5 tests across 1 file. [639.00ms]

- eval: E11
  run_id: minted-may-soan-de-xuat-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_man_duyet_may
  verified_at: 2026-09-28T05:29:24Z
  output: |
    Ran 12 tests across 1 file. [811.00ms]

- eval: E11b
  run_id: minted-may-soan-de-xuat-E11b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_duyet_ban_may
  verified_at: 2026-09-28T05:29:24Z
  output: |
    test-run: dropped crm_mukumn1wovkl_test

- eval: E11u
  run_id: crm_wizardly_lumiere_e25e92_do (app :4162, api :4230); mutation check kho crm_msd_duyet_may_chieu_do_do (app :4211, api :4524)
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_man_duyet_may
  verified_at: 2026-09-28T05:29:24Z
  screenshot: evidence/E11u-step1.png
  observed: |
    step1 (1440, buoc 1): "Bước 1 · Nguồn nói gì", tệp nguồn "quyet-dinh.docx". Đúng 3 đoạn được tô mark nền cam nhạt rõ: "Kể từ ngày 01/10/2026", "tầng hai là 1,5%", "tầng ba là 1,8%". Không có nút Duyệt nào trên màn này.
    step2 (1440, buoc 2): "Bước 2 · Đối chiếu với bản máy soạn" — hai khối "Nguồn" (trái) và "Bản máy soạn" (phải) nằm cùng hàng, cạnh nhau, không xếp chồng dọc.
    step3 (390, buoc 3): cùng màn Bước 2 nhưng ở 390px đổi thành hai thẻ tab "Nguồn" / "Bản máy soạn"; không thấy tràn/cuộn ngang.
    step4 (1440, buoc 4a): bảng "Con số và ngày" có cả 3 dòng đã tick "Đã đối chiếu" đúng thời điểm trước khi nút Duyệt mở khoá.
    step5 (buoc 4b): sau khi Duyệt, đã điều hướng sang trang tài liệu đã đăng — "Chính sách hoa hồng công ty đối tác · Phiên bản 2 · duyệt 28/09/2026"; mục "Nguồn" có tên tệp và nút "Tải về".
    Tất cả khớp Expected của cả 4 bước; không có mâu thuẫn nào giữa ảnh và Expected.
  network_observed: n-a (driver)

- eval: E11s
  run_id: design-gate-504bf2ed0c
  exit_code: 0
  baseline: green
  verifier: config:executors.script.msd_san_thiet_ke
  verified_at: 2026-09-28T05:29:24Z
  output: |
    design-gate --mode static chạy trên mọi tệp tsx của khu tai-lieu và thành phần mới của
    packages/ui đã thêm; in tên từng tệp đạt.

- eval: E12
  run_id: minted-may-soan-de-xuat-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_nguon_khong_ro
  verified_at: 2026-09-28T05:29:24Z
  output: |
    (ma tran 72 khang dinh: 6 nguoi x 3 trang thai x 4 thu tuc, test dem du 72)

- eval: E13
  run_id: minted-may-soan-de-xuat-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.msd_khoa_rieng
  verified_at: 2026-09-28T05:29:24Z
  output: |
    (khoa rieng KHO_TAI_LIEU_AI_GATEWAY_API_KEY nhan dung; TaiLieuSuKien MAY_SOAN ghi
    dung tokenVao/tokenRa/chiPhiUsd)

- eval: E13b
  run_id: minted-may-soan-de-xuat-E13b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.msd_bien_ba_nha
  verified_at: 2026-09-28T05:29:24Z
  output: |
    KHO_TAI_LIEU_AI_GATEWAY_API_KEY: co o capabilities.ts

- eval: E14
  run_id: minted-may-soan-de-xuat-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.msd_ranh_gioi
  verified_at: 2026-09-28T05:29:24Z
  output: |
    Ran 11 tests across 2 files. [259.00ms]

- eval: E15a
  run_id: minted-may-soan-de-xuat-E15a-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.msd_soan_that
  verified_at: 2026-09-28T05:29:24Z
  output: |
    phien-do: xong — mã 0

- eval: E15j
  judged_by: judge-subagent (fresh context, panel 3 lens)
  verdict: UNCERTAIN
  rationale: |
    Panel không đồng thuận. Đề xuất tổng hợp của panel nghiêng về không đạt (2/3 lens),
    nhưng lens thứ ba chưa đủ căn cứ để kết luận vì thiếu ảnh màn đúng bản đang xét — nên
    mục này ở trạng thái chưa chốt, cần người quyết tại Cổng 2 sau khi đọc đủ ba phiếu bên
    dưới. Không phiếu nào bị tóm tắt hay viết lại — nguyên văn từng phiếu ở mục votes.
  votes:
    - domain-correctness: FAIL — Bản soan-that-quyet-dinh-hoa-hong.md tự thừa nhận "Nguồn trình bày công thức dạng hình, cần đối chiếu" (dòng ngay sau công thức, mục "Công thức tính hoa hồng thực nhận") — tức nguồn KHÔNG nêu rõ công thức bằng chữ — nhưng vẫn viết một dòng «Hoa hồng thực nhận = Hoa hồng cấp bậc × Doanh số phân bổ × Chi phí cơ bản», trong khi quy-tac-viet.md mục "Con số, ngày và công thức" quy định công thức dạng một dòng A=B×C×D chỉ được viết "khi nguồn nêu rõ từng thành phần"; khi không rõ thì "liệt kê các thành phần... và ghi «Nguồn trình bày công thức dạng hình, cần đối chiếu»" — tức chỉ được chọn một trong hai cách, không phải cả hai. Không có trích đoạn nào trong mục "Trích đoạn" của chính tệp này bao bọc chuỗi công thức đó, nên đây là nội dung tự suy ra chứ không phải chép nguyên văn nguồn — vi phạm rõ, đọc được ngay từ chính hồ sơ được giao mà không cần tệp nào khác. Hai bản còn lại (quy-trinh.md, bieu-mau.md) và bốn ảnh màn (nguồn / duyệt bước 1-2 / 390) không thấy lỗi tương đương; màn hình đọc được, đối chiếu số rõ ràng.
      required_evidence:
        - Trích đoạn nguyên văn từ quyet-dinh-hoa-hong.docx (không phải qua tệp soan-that-*.md) cho thấy công thức 'Hoa hồng thực nhận = Hoa hồng cấp bậc × Doanh số phân bổ × Chi phí cơ bản' thực sự xuất hiện dưới dạng CHỮ (không chỉ hình) ở đúng thứ tự ba thành phần đó trong nguồn — nếu có, viết công thức một dòng là đúng luật và verdict đổi thành PASS cho điểm này.
        - Nếu nguồn chỉ có hình (không có chữ), thì cần sửa soan-that-quyet-dinh-hoa-hong.md: xoá dòng công thức một dòng, chỉ giữ phần liệt kê thành phần + câu 'Nguồn trình bày công thức dạng hình, cần đối chiếu' — bản sửa đó mới đạt PASS.
    - operational-feasibility: UNCERTAIN — Nội dung ba bản khá vững theo Quy tắc viết (bị bác đúng lý do trích quá ngắn rồi tự sửa đạt ở vòng sau; hai ngày hiệu lực mâu thuẫn được ghi cả hai kèm trích và cờ xác nhận; bảng giữ nguyên hàng/cột; số thập phân và dấu «+» giữ nguyên) nhưng soan-that-quyet-dinh-hoa-hong.md dùng «CBNV» hai lần mà không viết đầy đủ lần đầu, trái đúng lời dặn ở mục «Chữ viết tắt và thuật ngữ». Bốn ảnh msd-*.png chỉ chụp một tài liệu mẫu khác hẳn (Chính sách hoa hồng công ty đối tác, tầng hai/tầng ba) — không ảnh nào chụp màn nguồn/màn duyệt cạnh nhau của đúng ba bản đang xét, đặc biệt hai bản có bảng (quyết-định-hoa-hồng, biểu-mẫu), nên chưa có căn cứ bảng có đọc được cạnh nhau hay không cho đúng nội dung được chấm.
      required_evidence:
        - Ảnh màn Bước 1 và Bước 2 (1440 và 390) của đúng một trong ba bản đang xét có bảng — ví dụ soan-that-quyet-dinh-hoa-hong (bảng KPI, bảng chi phí cơ bản) hoặc soan-that-bieu-mau — cho thấy bảng hiện cạnh nguồn, đọc được, không tràn hay vỡ dòng.
        - Bản soan-that-quyet-dinh-hoa-hong.md (hay bản máy soạn gốc) đã sửa: «CBNV» viết đầy đủ kèm viết tắt ở lần xuất hiện đầu («cán bộ nhân viên (CBNV)»), hoặc xác nhận nguồn không có chỗ nào định nghĩa để loại trừ lỗi này.
    - spec-alignment: FAIL — Ba bản máy soạn (quyet-dinh-hoa-hong, quy-trinh, bieu-mau) giữ một chủ đề mỗi trang, chép đúng số liệu (1,3%; +0.3%; 6/7/8/18/21/24 tỷ; 0,5%; 1 V-point = 1000 VNĐ...), nêu đúng đối tượng áp dụng/loại trừ và không thêm quy định ngoài trích đoạn — phần này khớp Quy tắc viết. Nhưng màn duyệt bước 2 (nguồn cạnh nhau) không đọc được cho người văn phòng: panel "Bản máy soạn" mục "Mức hoa hồng" hiển thị một dòng diễn diff xáo trộn thứ tự từ, không phải câu liền mạch.
      required_evidence:
        - Ảnh _acceptance/may-soan-de-xuat/evidence/msd-duyet-b2-1440.png, vùng panel phải mục 'Mức hoa hồng' (khoảng x=760-1390, y=330-440 trên ảnh 1440x900): dòng diff hiện 'Mức Kể hoa từ hồng ngày đo 01/10/2026, phòng công Đối ty đối tác thông tầng báo hai từng hưởng kỳ 1,5% và tầng ba hưởng 1,8% giá trị giao dịch đã xác nhận.' — từ bị xen kẽ gạch ngang/gạch chân không theo thứ tự câu gốc lẫn câu mới, không đọc được như văn xuôi. Nếu chụp lại đúng màn duyệt bước 2 ở 1440 sau khi sửa thuật toán diff (căn theo cụm từ/LCS đúng thứ tự) và đoạn 'Mức hoa hồng' đọc thành câu liền mạch theo đúng trật tự của bản đề xuất, thì verdict phần màn hình đổi thành PASS.
  required_evidence:
    - Xem required_evidence bên trong từng vote ở trên (3 mục cụ thể, mỗi mục gắn với đúng lens nêu ra nó).
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_test-r1
  exit_code: 0
  verified_at: 2026-09-28T05:29:24Z

- cmd: bunx turbo run lint --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-28T05:29:24Z

- cmd: bun run lint:slop
  run_id: minted-may-soan-de-xuat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-28T05:29:24Z

- cmd: bunx turbo run build --force
  run_id: minted-may-soan-de-xuat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-28T05:29:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (pass trên cả HEAD lẫn baseline):
- E11s (AC-11, `design-gate --mode static`) — pass trên cả hai phía vì đây là quét thiết kế tĩnh trên tệp hiện tại của nhánh, không phải phép so trước/sau; chiều đỏ của chính nó (chèn className thô) đã riêng chứng minh nó phân biệt được lỗi thiết kế, nên đây là regression-guard có chủ ý chứ không phải lỗi đo.
- E14 (AC-14, `tai-lieu-ranh-gioi.spec.ts` + `khuon-di-dong.spec.ts`) — pass trên cả hai phía vì các file quét (sandbox.ts, khai báo subagent) đã tồn tại từ trước; đây là regression-guard cho ranh giới sandbox/tool-set, không phải hành vi mới của tính năng — giữ nguyên, không cần viết lại.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 26/27 eval máy PASS, 2 ui-check PASS, 4 lệnh suite hồi quy PASS, 1 judgment (E15j) UNCERTAIN chờ người quyết. E2t (AC-12, `blob-that.mjs`) không chạy được — thiếu BLOB_READ_WRITE_TOKEN thật trong phiên đo. Verdict: BLOCKED — chờ khoá Blob thật rồi chạy lại đúng E2t, không cần chạy lại các eval khác.
