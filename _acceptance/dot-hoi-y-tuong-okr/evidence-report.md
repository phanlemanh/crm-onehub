---
schema_version: 2
feature_slug: dot-hoi-y-tuong-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b557fca3b24cb5d3684006a748adf2735af0f24b
human_signoff: Manh Phan 2026-09-30
---

# Evidence Report: dot-hoi-y-tuong-okr

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
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | ui-check | PASS |
| E13 | AC-11 | script | PASS |
| E14 | AC-12 | test | PASS |
| E15 | AC-12 | ui-check | PASS |
| E16 | AC-12 | script | PASS |
| E17 | AC-13 | test | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | script | PASS |
| E20 | AC-15 | script | PASS |
| E21 | AC-15 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-dot-hoi-y-tuong-okr-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_mo
  verified_at: 2026-09-30T03:00:09Z
  output: |
    Ran 4 tests across 1 file. [1.86s]
    test-run: dropped crm_munippkfyvcp_test

- eval: E2
  run_id: minted-dot-hoi-y-tuong-okr-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_mo_tu_choi
  verified_at: 2026-09-30T03:00:09Z
  output: |
    Bộ ca từ chối của hỏi ý mở chạy xong, runner không in dòng lỗi nào.

- eval: E3
  run_id: minted-dot-hoi-y-tuong-okr-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_gop
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_munipmcgj6u7_test

- eval: E4
  run_id: minted-dot-hoi-y-tuong-okr-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ten_va_so
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_munipm5yplat_test

- eval: E5
  run_id: minted-dot-hoi-y-tuong-okr-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ban_truoc
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_munipl340wvm_test

- eval: E6
  run_id: minted-dot-hoi-y-tuong-okr-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_gom
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_munipkswp4p7_test

- eval: E7
  run_id: minted-dot-hoi-y-tuong-okr-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ket_luan
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_muniplz8kh7t_test

- eval: E8
  run_id: minted-dot-hoi-y-tuong-okr-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_cong_bo
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_munipkxzx3up_test

- eval: E9
  run_id: minted-dot-hoi-y-tuong-okr-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_ket_qua
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_munipknox5f2_test

- eval: E10
  run_id: minted-dot-hoi-y-tuong-okr-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_nhac
  verified_at: 2026-09-30T03:00:09Z
  output: |
    Bài nhắc của API và bài tích hợp của agent chạy xong, runner không in dòng lỗi nào.

- eval: E11
  run_id: minted-dot-hoi-y-tuong-okr-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_do_phu
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_muniplxvqzvr_test

- eval: E12
  run_id: E12-ui-verify-20260930-1003
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-30T03:00:09Z
  screenshot: evidence/E12-step3.png
  observed: |
    Đã mở từng khung ảnh bằng Read. Trang Hỏi ý mục tiêu hiện Empty «Chưa hỏi ý cho kỳ này» rồi sau khi mở thì dải pha 4 mốc (Mở, Hạn, Gom ý, Công bố), «Còn 48 giờ tới hạn», ba thẻ con số và toast «Đã mở hỏi ý»; ở 390px ô soạn «Ý của bạn» nằm trong 812px, tab «Hỏi ý» có huy hiệu «Mới».
    Khung gộp ý: «Ý của bạn (1/3)» có ý vừa gửi kèm Vì sao và Đo bằng gì, «Ý của đồng nghiệp (12)» không kèm tên; bảng độ phủ có hàng Toàn công ty 30.2% cùng các bộ phận và phòng ban; các trạng thái rỗng, lỗi «Thử lại» và skeleton đều khớp Expected, không tràn ngang ở 390px.
  network_observed: n-a (driver)
  output: |
    Chiều đỏ chạy thật (--chieu-do --chi E12-ten,E12-cot): E12-ten đỏ đúng ghim (in «E12 buoc-gop: ten lo «Cao Thanh Vân»»); E12-cot đỏ đúng ghim (in «E12 buoc-man-dau: mep tren o soan 894px», 894px lớn hơn 812).
    Nhật ký mạng chỉ có một lỗi máy chủ trên okr.hoiY do chính bước 9 chèn cố ý, không có pageerror hay requestfailed khác (evidence/E12-network.txt).

- eval: E13
  run_id: minted-dot-hoi-y-tuong-okr-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-30T03:00:09Z
  output: |
    phien-do: xong

- eval: E14
  run_id: minted-dot-hoi-y-tuong-okr-E14-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_man_dom
  verified_at: 2026-09-30T03:00:09Z
  output: |
    Ran 57 tests across 1 file. [5.67s]

- eval: E15
  run_id: minted-dot-hoi-y-tuong-okr-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-30T03:00:09Z
  screenshot: evidence/E15-step2.png
  observed: |
    Đã mở từng khung ảnh bằng Read. Người chọn Lê Hải Đăng ở kỳ «Quý kế» thấy «Bạn là người chọn nên không góp ý» và khối «Bạn viết trước» 3 câu; danh sách ý còn khoá, «Y chưa gom (4)» có tên người góp ở bước gom, mục lục «2/5 chủ đề đã kết luận», thanh công bố «Còn 4 điều trước khi công bố» với «Công bố» tắt.
    Sau kết luận đủ «6/6 chủ đề», nút «Công bố» bật, toast «Đã công bố, 3 mục tiêu nháp đã tạo»; thành viên Đinh Công Sơn thấy hành trình «Thành mục tiêu nháp», lý do nguyên văn và bảng viết trước với nhãn Đổi, Bỏ, Giữ nguyên, Thêm, không tràn ngang ở 390px.
  network_observed: n-a (driver)
  output: |
    Chiều đỏ chạy thật (--chieu-do --chi E15) đỏ đúng Expected: «HONG: E15 buoc 2: danh sach y khoa, dong ly do «Niêm phong trước khi đọc ý», 0 y hien (thay {tt:gop,khoa:0,soY:2})»; tổng kết «E15: DO DUNG GHIM — in «E15 buoc-khoa-nguoi-chon: nguoi chon chua niem phong thay 2 y»».
    Nhật ký mạng evidence/E15-network.txt: driver puppeteer, không có requestfailed hay pageerror.

- eval: E16
  run_id: minted-dot-hoi-y-tuong-okr-E16-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_man_chrome
  verified_at: 2026-09-30T03:00:09Z
  output: |
    phien-do: xong

- eval: E17
  run_id: minted-dot-hoi-y-tuong-okr-E17-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.hy_bo_mau
  verified_at: 2026-09-30T03:00:09Z
  output: |
    test-run: dropped crm_muniq6u2s42n_test

- eval: E18
  run_id: minted-dot-hoi-y-tuong-okr-E18-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_ty_le
  verified_at: 2026-09-30T03:00:09Z
  output: |
    phien-do: xong

- eval: E19
  run_id: minted-dot-hoi-y-tuong-okr-E19-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_migration_chi_them
  verified_at: 2026-09-30T03:00:09Z
  output: |
    goc so sanh: origin/onehub (79168cbe) · migration moi: 20261008010000_okr_hoi_y · so cau lenh: 26 · khoa ngoai viet truoc khop: 14/14

- eval: E20
  run_id: minted-dot-hoi-y-tuong-okr-E20-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.hy_san_thiet_ke
  verified_at: 2026-09-30T03:00:09Z
  output: |
    Phép soi thiết kế chạy xong, không in vi phạm nào.

- eval: E21
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Ba nhãn kính đều không có diff, schema.prisma, migration, service, mã màn hay CONTEXT.md trong tầm đọc, nên không xác nhận được từng vế của câu hỏi bằng mã thật. Thiết kế và hợp đồng nhất quán về sáu bảng, quyền trong service, công bố qua đường tạo mục tiêu và tránh chữ «đợt», nhưng đó là kế hoạch chứ không phải bằng chứng về diff; mục Ngoài-5 của hợp đồng còn thừa nhận CONTEXT.md ghi chờ duyệt phạm vi.
  panel_votes:
    - domain-correctness: UNCERTAIN — Chỉ có thiết kế, hợp đồng và design-pass; không thể xác nhận mã thật khớp từng ý. Nhất quán về hình dạng sáu bảng, quyền trong service, công bố qua đường tạo mục tiêu và tránh chữ «đợt» nhưng đó là kế hoạch, không phải bằng chứng về diff.
    - operational-feasibility: UNCERTAIN — Input không có diff, schema, service, tệp màn hay CONTEXT.md; ba tệp chỉ nói lượt phải làm gì chứ không chứng minh mã đã làm vậy. Mục Ngoài-5 thừa nhận CONTEXT.md còn ghi «đang chờ duyệt phạm vi» nên vế mục từ điển đúng nếp chưa thể chấm PASS.
    - spec-alignment: UNCERTAIN — Ba tệp được đọc chỉ nói hình dạng cần có, không chứa diff hay tệp mã; Ngoài-5 (CONTEXT.md còn để cụm «Hỏi ý mục tiêu» chờ duyệt phạm vi) và Ngoài-4 (múi giờ khai báo hai chỗ) khiến chưa thể cho PASS về mục từ điển.
  required_evidence:
    - Khối sáu model mới (OkrHoiY, OkrHoiYBanTruoc, OkrY, OkrYDongY, OkrChuDe, OkrHoiYHieu) liền nhau cuối packages/db/prisma/schema.prisma và migration.sql của lượt (git diff origin/onehub -- packages/db/prisma): chỉ CREATE TABLE, CREATE INDEX, ADD CONSTRAINT trên bảng mới; OkrHoiYBanTruoc là hàng riêng hoiYId @unique; OkrChuDe.objectiveId @unique; không cột mới trên bảng cũ; khoá ngoại tới bảng có sẵn là RESTRICT.
    - apps/api/src/okr/okr-hoi-y.service.ts và hoi-y.ts: một hàm duy nhất quyết định ai đọc tên người góp, số đồng ý và bản viết trước (grep các chỗ trả tacGia, soDongY, banTruoc ngoài hàm đó ra 0 kết quả), và trả cờ quyen (moDuoc, gopDuoc, gomDuoc, chonDuoc, congBoDuoc, lyDoChuaCongBo) cho màn; grep apps/app/app/(app)/[slug]/okr/hoi-y không thấy tự suy quyền từ vai.
    - Hàm congBo trong okr-hoi-y.service.ts gọi đường tạo mục tiêu có sẵn của OkrService (title = mucTieuInput.shape.title, cùng vết tao) trong giao dịch FOR UPDATE, không có prisma.okrObjective.create trực tiếp.
    - Danh sách import trong apps/app/app/(app)/[slug]/okr/hoi-y/*.tsx chỉ từ @crm/ui (kể cả timeline, scrollspy, Heatmap, SaveBar mở rộng), git diff --stat packages/ui, và bun run lint:slop xanh: không có table, ul divide-y, chấm size-2 tự vẽ.
    - Diff CONTEXT.md: các mục Hỏi ý mục tiêu, Ý, Người chọn, Bản viết trước, Chủ đề, Ý lạ, Kết luận, Kho ý mỗi mục có nghĩa, dòng _Avoid_ và dòng «Vì sao»; grep chữ «đợt» trong phần thêm mới chỉ ở dòng Avoid; mục Hỏi ý mục tiêu không còn ghi chờ duyệt phạm vi (Ngoài-5), hoặc người ký chấp nhận nó là giới hạn đã biết.
  human_override: Manh Phan 2026-09-30 — Đạt

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bun_run_test-r4
  exit_code: 0
  verified_at: 2026-09-30T03:00:09Z

- cmd: bunx turbo run lint --force
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bunx_turbo_run_lint_force-r4
  exit_code: 0
  verified_at: 2026-09-30T03:00:09Z

- cmd: bun run lint:slop
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bun_run_lint_slop-r4
  exit_code: 0
  verified_at: 2026-09-30T03:00:09Z

- cmd: bunx turbo run build --force
  run_id: minted-dot-hoi-y-tuong-okr-SUITE-bunx_turbo_run_build_force-r4
  exit_code: 0
  verified_at: 2026-09-30T03:00:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — không có eval nào được liệt kê là không-phân-biệt; lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PENDING-JUDGMENT — các eval máy đạt nhưng thước lệch (tệp args cũ neo c2927fa1, cây chấm d8785f4c); ghi nguyên trạng, chấm lại ở lượt mới.
Round 2: E1–E20 đạt trên cây a235a090, hai lượt đo màn E12 và E15 có ảnh và phần quan sát; E21 chưa có căn cứ nên UNCERTAIN. Chuyển lên Cổng 2.
Round 3: E1–E20 đạt trên cây 6736d5d9 (sau khi gộp onehub, có thêm ba thủ tục đọc hỏi ý vào ma trận xem giới hạn); E12 và E15 có ảnh và phần quan sát mới; E21 vẫn UNCERTAIN vì hội đồng không có diff thật, chờ người quyết ở Cổng 2. Baseline không đo lại.
Round 4: E1–E20 và bốn lệnh suite đạt trên cây 169eb0c0 (hợp đồng về implemented để chấm lại sau khi hồ sơ vòng 3 trượt khuôn run_id E15, mã không đổi); E12 và E15 có ảnh và phần quan sát mới; E21 vẫn UNCERTAIN vì hội đồng không có diff thật, chờ người quyết ở Cổng 2. Baseline không đo lại (evals.yaml không đổi từ round 1).

### Re-pin lần 1 — 2026-09-30, do dùng lại bản ghim bài canh Trợ lý OKR của onehub sau chữ ký; thước màn thôi ghi vào hồ sơ đã ký
run_id: repin-20260930T035602Z-23610
sha: 44a7274a3f3f61703819d36644320f35179b559c · suites: 4 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12 (E12 không khai paths), E15 (E15 không khai paths), E21 (E21 không khai paths)

### Re-pin lần 2 — 2026-10-04, do sửa thước theo diff sau gộp và khai paths (lô a)
run_id: repin-20261004T095914Z-97808
sha: b0e84291d6a770394f91f9c24730616f21273654 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E15, E21 · diff chạm vật đo ngoài làn máy: E12, E15 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 3 — 2026-10-05, do sửa thước đỏ lô 2-4 (a)
run_id: repin-20261005T012004Z-26223
sha: 97a2eb9d7c24cc0cb7c6308c3bd47bd5211a3b02 · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E15, E21 · diff chạm vật đo ngoài làn máy: E12, E15 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-10-06, do sửa thước đỏ lô 2-4 (a)
run_id: repin-20261006T100303Z-21340
sha: b557fca3b24cb5d3684006a748adf2735af0f24b · suites: 7 lệnh exit 0 · evals: 18/18 eval máy đạt kỳ vọng · ngoài làn máy: E12, E15, E21 · diff chạm vật đo ngoài làn máy: E12, E15 — chưa chứng lại, đi vòng S4 delta
