---
schema_version: 2
feature_slug: tro-ly-okr-tom-tat
verdict: BLOCKED
failed_evals: ["E2","E17"]
reason: |
  Phép đo màn E9 không đo được. Thước chính thức man-tom-tat.mjs dừng với mã 2 ở bước 8, trước khi có ảnh nào. Nguyên nhân: hàm sangMai() chọn giờ nhắc 08:31 ngày mai, nên cửa sổ sự kiện của viecTomTatCanNhac là từ 08:30 hôm nay đến 08:30 ngày mai. Bản tóm tắt được tạo lúc 04:2x giờ VN ngày 01/10, nằm ngoài cửa sổ, nên lenLichNhac không tạo việc nhắc cho Trưởng phòng A và thước báo "khong co tin nhac cho truong phong A". Thước chỉ chạy được sau 08:30 giờ VN. Không có ảnh chính thức nào.
blocked:
  - cmd: "ui-check:E9"
    reason: "Thước chính thức man-tom-tat.mjs dừng với mã 2 (không đo được) ở bước 8, trước mọi ảnh; phụ thuộc giờ chạy, chỉ chạy được sau 08:30 giờ VN."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bf64284aadbf0d8862f3af30e825280373bedb17
human_signoff:
---

# Evidence Report: tro-ly-okr-tom-tat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | FAIL |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | ui-check | BLOCKED |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | test | PASS |
| E14 | AC-11 | test | PASS |
| E15 | AC-12 | test | PASS |
| E16 | AC-13 | test | PASS |
| E17 | AC-14 | script | FAIL |
| E18 | AC-14 | test | PASS |
| E19 | AC-15 | script | PASS |
| E20 | AC-15 | judgment | UNCERTAIN |
| E21 | AC-6 | script | PASS |
| E22 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-tro-ly-okr-tom-tat-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_dang_ban
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 19 tests across 1 file. [44.00ms]

- eval: E2
  run_id: minted-tro-ly-okr-tom-tat-E2-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.tts_api_okr
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Lệnh chạy đủ, không bị công cụ giết. Năm tệp test api xanh: 99 pass, 1 skip, 0 fail, 3817 expect() calls, 100 tests across 5 files [41.67s].
    Lệnh thứ hai (ky-vong-khong-doi.mjs) dừng với mã 1 và in: ky vong bi sua: apps/api/test/vai-chi-okr.spec.ts
    Nghĩa là tệp vai-chi-okr.spec.ts đã bị sửa so với mốc kỳ vọng không đổi (ngoài dòng import).

- eval: E3
  run_id: minted-tro-ly-okr-tom-tat-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_lich
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolx9q1kytv_test

- eval: E4
  run_id: minted-tro-ly-okr-tom-tat-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_bo_kiem
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 37 tests across 1 file. [57.00ms]

- eval: E5
  run_id: minted-tro-ly-okr-tom-tat-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_nop
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolx9nbkg1e_test

- eval: E6
  run_id: minted-tro-ly-okr-tom-tat-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tts_cach_ly
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 9 tests across 1 file. [253.00ms]

- eval: E7
  run_id: minted-tro-ly-okr-tom-tat-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_doc
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolx9dex82o_test

- eval: E8
  run_id: minted-tro-ly-okr-tom-tat-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_man_khoi
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 24 tests across 1 file. [3.21s]

- eval: E9
  run_id: e9-20261001-tts-e9
  exit_code: 2
  baseline: n-a
  verifier: config:executors.script.tts_man_that
  verified_at: 2026-09-30T21:17:21Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/happy-rubin-36de0b/.acceptance-runs/tro-ly-okr-tom-tat/chan-doan/man/ST-tomtat-co-cau-1440.png
  observed: |
    Thước chính thức không tạo ảnh nào. Chỉ xem được 3 ảnh chẩn đoán (chạy 5, không phải bằng chứng chính thức). ST-tomtat-co-cau-1440: trang OKR theo đơn vị, phòng Kinh doanh miền Bắc, tab Họp tuần, khối «Tóm tắt tuần của Trợ lý OKR» có 4 câu, mỗi câu có nhãn «Cập nhật 28/09» và hai nút Hữu ích, Không hữu ích; các câu có số (2.9, 27.3, 12.1). ST-suckhoe-tomtat-co-1440: trang Toàn cảnh, Sức khoẻ chương trình, đăng nhập quản trị; ảnh cao 1000px chỉ thấy các thẻ tổng hợp và bảng Theo đơn vị, phần khối tóm tắt quản trị nằm dưới nếp ảnh nên chỉ dựa được vào dòng DUNG của thước (phòng A Bật, phòng B Ẩn). ST-tomtat-trich-dan-1-390: thẻ trích dẫn mở trên màn 390, «Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng», Giá trị 2,9 tỷ đồng, Mức tự tin cao, nút «Xem diễn biến KR», điều hướng 1/4, không tràn ngang.
  network_observed: n-a (driver)
  output: |
    KẾT QUẢ CHÍNH THỨC (thước nguyên bản, không sửa): KHÔNG ĐO ĐƯỢC, mã 2. Không có ảnh chính thức nào; E9-network.txt không viết vì driver là puppeteer trong script.
    Lần 1: tác tử con dừng (mã 1) vì có một máy chủ dev eve đang chạy cho cùng tác nhân, là tiến trình của eval khác cùng cây; không dừng nó, đợi rồi chạy lại.
    Lần 2 (thước nguyên bản): 5 bước DUNG (setProgram; nạp okr:mau --moc 2026-10-01; việc xếp đóng da-xep:2; việc tóm tắt phòng A nac bat đóng da-nop; việc tóm tắt phòng B nac an đóng da-nop; bản phòng A hien, bản phòng B hien). Sau đó KHONG DO DUOC tại bước nhac-mo-bang: khong co tin nhac cho truong phong A. Kết quả: 5 DUNG, 0 SAI, dừng với mã 2. Log: .acceptance-runs/tro-ly-okr-tom-tat/man/e9-run.log.
    Lý do đã kiểm: hiện 04:21 giờ VN 01/10; mocNhac(08:31 ngày mai) = 08:30 ngày mai; cửa sổ bắt đầu 08:30 hôm nay, bản tạo lúc 04:2x nên ngoài cửa sổ (packages/db/src/okr-nhac.ts cuaSoSuKien, okr-tom-tat.ts viecTomTatCanNhac). Đây là lỗi phụ thuộc giờ của thước, chưa chứng minh là lỗi sản phẩm.
    CHẨN ĐOÁN, KHÔNG PHẢI BẰNG CHỨNG (bản sao thước .acceptance-runs/tro-ly-okr-tom-tat/chan-doan/man-tom-tat-cd.mjs, ảnh ở .acceptance-runs/tro-ly-okr-tom-tat/chan-doan/man/, 22 ảnh ở 1440 và 390):
    - Chạy 1, 3, 4: SAI «ban phong A can-xem» (mã 1). Model thật không cho bản đủ câu qua lưới kiểm; 3 trên 5 lần chạy A ra can-xem, nên mô hình không ổn định.
    - Chạy 2 (không chờ): 74 DUNG, 1 SAI «sau khi mo duong trong tin: 0 vet mo-hop-tuan». HopTuan ghi vết bằng useMountEffect bất đồng bộ, thước đếm ngay rồi đóng trang: race của thước.
    - Chạy 5 (có chờ 5 giây): 75 DUNG, 0 SAI, mã 0. Thẻ trích dẫn của cả 4 câu ở 1440 và 390 khớp hàng OkrCheckIn trong kho (giá trị, mức tự tin, ghi chú); Enter, Space mở thẻ và Esc đóng; Xem diễn biến KR đúng URL; Hữu ích ghi đúng 1 hàng OkrTomTatPhanHoi; tin nhắc có dòng «Tóm tắt tuần Phòng Kinh doanh miền Bắc · 1 KR đáng bàn» với đường mở xemOkr=hop-tuan, donOkr=pb:mau-okr-pb-kd-bac, kyOkr=mau-okr-chu-ky-quy4; đúng 1 vết mo-hop-tuan; công tắc tắt vẫn tắt sau tải lại (dongTroLyOkr=false); phòng B không có khối tóm tắt; Sức khoẻ có A Bật, B Ẩn; mọi ảnh scrollWidth <= clientWidth.
    Kết luận: chưa có lượt chính thức nào qua bước 8 nên không khai PASS. Cần chủ thước sửa sangMai và đoạn chờ vết, rồi chạy lại sau 08:30 giờ VN.

- eval: E10
  run_id: minted-tro-ly-okr-tom-tat-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_duong_do
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolxa3ao5nz_test

- eval: E11
  run_id: minted-tro-ly-okr-tom-tat-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_phan_hoi
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolx9ftbxu9_test

- eval: E12
  run_id: muolxfg7gs5g
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_nhac
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolxfg7gs5g_test

- eval: E13
  run_id: minted-tro-ly-okr-tom-tat-E13-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_tat_dong
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 6 tests across 1 file. [578.00ms]

- eval: E14
  run_id: minted-tro-ly-okr-tom-tat-E14-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_quan_tri
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 8 tests across 1 file. [752.00ms]

- eval: E15
  run_id: minted-tro-ly-okr-tom-tat-E15-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_thuoc
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolxh9b0okr_test

- eval: E16
  run_id: minted-tro-ly-okr-tom-tat-E16-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tts_chi_phi
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolxjcpg8kh_test

- eval: E17
  run_id: minted-tro-ly-okr-tom-tat-E17-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tts_eval
  verified_at: 2026-09-30T21:17:21Z
  output: |
    moc: 2026-09-29, 2026-09-15 · tran 1 USD
    moc 2026-09-29: 0.187825 USD theo AiChiPhi / tran 1 USD moi moc (chua gom tien judge: judge goi Gateway truc tiep, khong ghi vao AiChiPhi)
    moc 2026-09-15: 0.138563 USD theo AiChiPhi / tran 1 USD moi moc (chua gom tien judge)
    Mốc 2026-09-29: 10 bản đều DUNG (không số lệch, KR tụt đều có câu dẫn, không họ tên).
    SAI ban 2026-09-14 Kinh doanh miền Bắc nac=bat trang-thai=can-xem cau=2 bo=3 lech=0 tut=0/1 — kr tut khong co cau: mau-okr-kr-q4-kd-bac-1-k2
    SAI ban 2026-09-14 Marketing nac=bat trang-thai=- cau=0 — viec dong bang hong:SUBAGENT_EXECUTION_FAILED
    SAI ban 2026-09-14 Pháp chế nac=bat trang-thai=- cau=0 — viec dong bang hong:SUBAGENT_EXECUTION_FAILED
    SAI cau bi bo 15/90 = 16.7% (nguong 10%)

- eval: E18
  run_id: minted-tro-ly-okr-tom-tat-E18-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tdx_judge_zdr
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Ran 2 tests across 1 file. [151.00ms]

- eval: E19
  run_id: minted-tro-ly-okr-tom-tat-E19-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tts_tai_lieu
  verified_at: 2026-09-30T21:17:21Z
  output: |
    tai-lieu: muc cho re 9c, docs/api.md §OKR (3 thu tuc), docs/agent.md (chayXepTomTat, damBaoLichTomTat) deu du.

- eval: E21
  run_id: design-gate-dca805c0b6
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tts_san_thiet_ke
  verified_at: 2026-09-30T21:17:21Z
  output: |
    design-gate --mode static chạy lần lượt trên 5 tệp (khoi-tom-tat.tsx, hop-tuan.tsx, tom-tat-quan-tri.tsx, khoi-kenh.tsx, inline-citation.tsx); vòng lặp không dừng giữa chừng.

- eval: E22
  run_id: minted-tro-ly-okr-tom-tat-E22-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_doc_trang_thai
  verified_at: 2026-09-30T21:17:21Z
  output: |
    test-run: dropped crm_muolxngv9ufv_test

### Judgment (E20, AC-15)

Đề xuất của hội đồng: UNCERTAIN. Để trống human_override cho người quyết ở Cổng 2. Nửa luật kho (không chú thích trong mã, không đè class, hằng ở một tệp) chưa chấm được vì diff không nằm trong danh sách input của eval.

- eval: E20
  judged_by: judge panel (fresh context, 3 lens)
  verdict: UNCERTAIN
  votes:
    - domain-correctness: UNCERTAIN — Nửa đọc-hiểu đạt: mục Tóm tắt tuần của CONTEXT.md, đoạn tóm tắt ở docs/api.md và mục chỗ rẽ 9c của docs/agent.md nói rõ tóm tắt chạy sáng hôm sau ngày cập nhật, chỉ cho phòng ban, câu lệch số bị bỏ, bản quá 30% câu bị bỏ không hiện cho ai, chế độ ẩn chỉ quản trị thấy. Nửa luật kho (không chú thích trong mã, không đè class ở chỗ gọi, hằng ở một tệp cấu hình) không có trong danh sách input, còn diff thì bị cấm đọc để giữ chấm mù, nên chỉ kết luận được phần tài liệu tự khai (API chỉ đọc và ghi phản hồi, khuôn ở packages/validation, hằng ở OKR_TOM_TAT, popover và inline-citation ở packages/ui), chưa kiểm được trên mã thật.
    - operational-feasibility: UNCERTAIN — Nửa đầu của câu hỏi (người không đọc mã hiểu đúng) đạt: mục Tóm tắt tuần trong CONTEXT.md, docs/api.md và docs/agent.md nói rõ tóm tắt chạy sáng hôm sau ngày cập nhật, chỉ cho phòng ban, câu lệch số bị bỏ, bản có hơn 30% câu bị bỏ không hiện cho ai, và chế độ ẩn chỉ quản trị thấy. Nửa sau (diff giữ luật kho: không chú thích trong mã, hằng ở một tệp cấu hình, khuôn parse ở packages/validation, thành phần ở packages/ui không đè class) không chấm được: diff không nằm trong danh sách Input và lượt chấm là blind. Các tài liệu chỉ là lời khai của người code, không phải bằng chứng. Ngoài ra CONTEXT.md mục «Chế độ ẩn» viết quản trị đọc kết quả ở «Cài đặt › Chương trình OKR», còn mục Tóm tắt tuần và thiết kế đặt nó ở «Sức khoẻ chương trình», nên hai mục hơi lệch nhau.
    - spec-alignment: UNCERTAIN — Phần tài liệu đạt: CONTEXT.md (Tóm tắt tuần, Chế độ ẩn), docs/api.md §OKR và docs/agent.md nói rõ tóm tắt chạy sáng hôm sau ngày cập nhật, chỉ phòng ban, câu lệch số bị bỏ, bản bị bỏ quá 30% không hiện cho ai, chế độ ẩn chỉ quản trị thấy. Phần "diff có giữ luật kho" (không chú thích trong mã, hằng ở một tệp cấu hình, thành phần mới ở packages/ui không đè class ở chỗ gọi) không có diff trong danh sách Input nên không thể phán. Các dòng trong docs chỉ là lời tự khai của lượt, không phải bằng chứng. Lệch nhỏ: mục Chế độ ẩn của CONTEXT.md nói quản trị đọc kết quả ở Cài đặt › Chương trình OKR, trong khi mục Tóm tắt tuần và api.md nói ở Sức khoẻ chương trình.
  rationale: Cả ba lens đều UNCERTAIN cùng một lý do — phần tài liệu đạt, phần luật kho trên mã thật chưa có bằng chứng vì diff không nằm trong danh sách input; thêm một chỗ lệch chữ giữa hai mục của CONTEXT.md về nơi quản trị đọc kết quả.
  required_evidence:
    - Kết quả `bun run lint:slop` và `bun run lint` từ gốc kho trên nhánh feat/tro-ly-okr-tom-tat, mã thoát 0, in kèm tay kết quả quét chú thích: `git diff origin/onehub...HEAD -- '*.ts' '*.tsx'` không có dòng thêm nào bắt đầu bằng `//` hoặc `/*` (lấy từ eval máy của lượt, không phải từ judge này).
    - Kết quả quét className trong diff của `apps/app/**/okr/khoi-tom-tat.tsx` và `apps/app/**/suc-khoe/tom-tat-quan-tri.tsx`: không có `className` đổi màu, góc, khoảng cách của component `@crm/ui`; lấy từ luật anti-slop trong `bun run lint:slop` hoặc `grep -n className` trên hai tệp đó.
    - Xác nhận bằng `grep -rn 'OKR_TOM_TAT'` trong `apps/agent`, `packages/db`, `apps/api` rằng không còn số tinh chỉnh (06:00, 7 ngày, 8 ngày, 30%, hai dòng báo) viết thẳng ngoài `packages/db/src/okr-tro-ly-danh-muc.ts`.
    - Xác nhận `apps/api/src/okr/tro-ly.service.ts` không nhập client model nào và không ghi `AgentTask` loại `okr-tom-tat-*`: `grep -nE "okr-tom-tat|@ai-sdk|gateway" apps/api/src/okr/tro-ly.service.ts` chỉ thấy đọc `OkrTomTat` và upsert `OkrTomTatPhanHoi`.
    - Danh sách tệp diff kèm kết quả kiểm tra tại `apps/agent` (lich-tom-tat.ts, nop-tom-tat.ts), `apps/api/src/okr/tro-ly.service.ts` và `packages/validation/src/okr-tom-tat.ts`, cho thấy API chỉ đọc `OkrTomTat` và ghi `OkrTomTatPhanHoi` mà không gọi model, các hằng tinh chỉnh chỉ nằm ở `OKR_TOM_TAT`, và khuôn Json được parse bằng Zod ở biên. Lấy từ `git diff origin/onehub...HEAD --stat` và đọc các tệp đó.
    - Diff của `packages/ui/src/components/popover.tsx` và `khoi-tom-tat.tsx` cho thấy biến thể `size="panel"` được thêm trong packages/ui và nơi gọi không đè `className` về màu, góc hay khoảng cách (kết quả `bun run lint:slop`, hoặc grep `className` trên `khoi-tom-tat.tsx` và `tom-tat-quan-tri.tsx`).
    - Sửa hoặc xác nhận câu trong CONTEXT.md mục «Chế độ ẩn» để chỗ quản trị đọc kết quả tóm tắt khớp với «Sức khoẻ chương trình» ở mục Tóm tắt tuần (CONTEXT.md dòng 828–832 và mục Tóm tắt tuần).
    - Diff của lượt (git diff origin/onehub...HEAD, giới hạn apps/agent, apps/api, apps/app, packages/db, packages/validation, packages/ui) được đưa vào danh sách Input của eval E20, để kiểm không có chú thích trong mã, không có hằng tinh chỉnh ngoài OKR_TOM_TAT, và không có className đè ở chỗ gọi.
    - Kết quả lint:slop và kiểm tĩnh không-chú-thích trên các tệp mới của lượt (chạy `bun run lint:slop` ở gốc kho), nếu hội đồng muốn bằng chứng máy thay cho đọc diff.
    - Một dòng sửa ở mục Chế độ ẩn của CONTEXT.md (khoảng dòng 828-832) cho khớp nơi quản trị thấy bản tóm tắt (Sức khoẻ chương trình), hoặc xác nhận của chủ kho rằng hai chỗ không mâu thuẫn.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bun_run_test-r1
  exit_code: 1
  verified_at: 2026-09-30T21:17:21Z
  output: |
    Lệnh không gắn eval nào. Gói api: 1399 pass, 3 skip, 1 fail, 1403 tests across 145 files [134.89s].
    Ca đỏ duy nhất: an-vang > an-vang: ma tran ghi — moi mutation cua okr co dung mot dong GHI_VAO_KY_AN hoac MIEN_GHI; goi vao X da an 400 cau ghim va ban ghi dich doc lai giu nguyen; cung lenh vao V duoc.
    Tasks: 9 successful, 11 total; Failed: api#test. Kho dùng một lần crm_muolx7ui3iu2_test đã drop.

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-30T21:17:21Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-30T21:17:21Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-30T21:17:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả nhánh lẫn mốc diffBase, chứng minh harness chứ không chứng minh tính năng; nên viết lại để khẳng định hành vi mới, hoặc xác nhận là lưới hồi quy có chủ ý):

- E6 (tts_cach_ly): `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-cach-ly.spec.ts`
- E16 (tts_chi_phi): `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/so-chi-phi.integration.spec.ts -t tom-tat"`
- E18 (tdx_judge_zdr): `cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-cach-ly.spec.ts -t judge-zdr`

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, không eval nào khai runs lớn hơn 1).

## Iterations

Round 1: E2 và E17 không đạt; E9 bị chặn vì thước màn phụ thuộc giờ chạy (chỉ chạy được sau 08:30 giờ VN). E2: vai-chi-okr.spec.ts đã bị sửa so với mốc kỳ vọng không đổi, năm tệp test api đều xanh. E17: 15/90 câu bị bỏ (16.7%, ngưỡng 10%) ở mốc 2026-09-15, trong đó hai phòng (Marketing, Pháp chế) có việc đóng băng hỏng SUBAGENT_EXECUTION_FAILED và một bản thiếu câu dẫn tới KR tụt; mốc 2026-09-29 đạt cả 10 bản; chi phí theo AiChiPhi 0.187825 và 0.138563 USD, dưới trần 1 USD mỗi mốc. Lệnh hồi quy `bun run test` không gắn eval cũng có một ca đỏ (an-vang, ma trận ghi của okr), chưa xác định nguyên nhân. E20 còn UNCERTAIN, chờ người quyết ở Cổng 2. Chờ người xem trước khi quay lại thi công.
