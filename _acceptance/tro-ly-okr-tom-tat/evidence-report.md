---
schema_version: 2
feature_slug: tro-ly-okr-tom-tat
verdict: REJECT
failed_evals: ["E17","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: accf48464184189cfe339fe045a151cdc12d1041
human_signoff:
---

# Evidence Report: tro-ly-okr-tom-tat

Round 2. Hai eval đỏ: E17 (chạy model thật) và E9 (đo màn thật). Bộ test đầy đủ cũng đỏ một ca, không gắn eval nào. Lịch sử round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | ui-check | FAIL |
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

Mốc thời gian `verified_at` của các khối round 2 là giờ lập báo cáo (sau khi các lệnh chạy xong); các lệnh không in giờ riêng.

- eval: E2
  run_id: minted-tro-ly-okr-tom-tat-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_api_okr
  verified_at: 2026-09-30T22:02:01Z
  output: |
    ky vong khong doi: 5 tep chi them dong hoac doi import

- eval: E3
  run_id: minted-tro-ly-okr-tom-tat-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_lich
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muonibkoj76k_test

- eval: E4
  run_id: minted-tro-ly-okr-tom-tat-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_bo_kiem
  verified_at: 2026-09-30T22:02:01Z
  output: |
    Ran 41 tests across 1 file. [59.00ms]

- eval: E5
  run_id: minted-tro-ly-okr-tom-tat-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_nop
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muonibsz62i1_test

- eval: E6
  run_id: minted-tro-ly-okr-tom-tat-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tts_cach_ly
  verified_at: 2026-09-30T22:02:01Z
  output: |
    Ran 9 tests across 1 file. [215.00ms]

- eval: E7
  run_id: minted-tro-ly-okr-tom-tat-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_doc
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muonibftwumj_test

- eval: E8
  run_id: minted-tro-ly-okr-tom-tat-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_man_khoi
  verified_at: 2026-09-30T22:02:01Z
  output: |
    Ran 24 tests across 1 file. [2.27s]

- eval: E9
  run_id: e9-verify-20261001-a (log: .acceptance-runs/tro-ly-okr-tom-tat/man/e9-verify-run.log); lần lặp e9-verify-run2.log
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.tts_man_that
  verified_at: 2026-09-30T22:02:01Z
  screenshot: evidence/E9-step1.png
  observed: |
    Đã mở bằng Read các ảnh step1, 2, 3, 13, 15, 17, 19, 21, 22, 24. step1 (1440, ST-tomtat-co-cau): OKR theo đơn vị › Kinh doanh miền Bắc › Họp tuần, khối 'Tóm tắt tuần của Trợ lý OKR' có 5 câu, mỗi câu có nhãn 'Cập nhật 28/09' (câu 1 '+3'), hai nút 'Hữu ích / Không hữu ích', bên dưới 'Đáng bàn tuần này 1'. step2 (390): cùng khối xếp dọc, không tràn ngang. step3: thẻ trích dẫn mở dưới câu 1, '1/4', tên KR 'Hợp đồng bán lẻ chốt được đạt 6 tỷ đồng', Giá trị 2,9 tỷ đồng, Mức tự tin 'Tự tin cao', liên kết 'Xem diễn biến KR' — khớp giá trị thước đọc từ kho. step13: ngăn mục tiêu 'Giữ đà tăng trưởng bán lẻ miền Bắc' mở ở tab 'Diễn biến' với biểu đồ KR đúng. step15: nút 'Hữu ích' được chọn, hiện 'Cảm ơn, đã ghi'. step17: trang 'Nhắc buổi sáng' có mục 'Trợ lý OKR — Dòng Tóm tắt tuần của Trợ lý OKR' với công tắc bật (ảnh chụp trước khi tắt, đúng thứ tự). step19: Phòng B (Chăm sóc đối tác) › Họp tuần chỉ có bảng 'Đáng bàn tuần này', KHÔNG có khối Tóm tắt tuần — đúng. step21: Toàn cảnh › Sức khoẻ chương trình (ảnh chỉ phủ phần trên của trang; hàng Bật/Ẩn của hai phòng nằm dưới nếp gập và được khẳng định bằng DOM trong log: phòng A Bật, phòng B Ẩn). step22/24: ngăn bản phòng B 'Chăm sóc đối tác · tuần 28/09', 'Chế độ ẩn · Qua bộ kiểm, chỉ quản trị thấy — bỏ 0/5 câu', 5 câu còn lại kèm Nguồn, 'Câu bị bỏ · 0' — đúng ở 1440 và 390. Các ảnh khớp Expected ngoại trừ bước 8: không có ảnh nào chứng minh vết mo-hop-tuan, và kiểm kho báo 0 vết (Expected yêu cầu đúng 1), nên E9 không đạt.
  network_observed: n-a (driver)
  output: |
    Lệnh: PHIEN_DO_TEN_CAY=tts-e9 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/tro-ly-okr-tom-tat/rang/man-tom-tat.mjs". Chạy 3 lần: lần 1 không đo được (eve dev cổng 50865 bị tiến trình eve eval okr/tom-tat của E17 chạy song song cùng cây chiếm; không phải lỗi sản phẩm). Lần 2 và lần 3 (chạy lại để xem có ngẫu nhiên không): cả hai đều đúng 80 DUNG, 1 SAI, cùng một dòng SAI.
    SAI (1 assertion, xác định, lặp lại 2/2 lần): «sau khi mo duong trong tin: 0 vet mo-hop-tuan cua truong phong A, phong A». Kỳ vọng đúng 1 vết mo-hop-tuan (actorUserId = Trưởng phòng A, after.donVi = pb:mau-okr-pb-kd-bac) sau khi mở đường trong tin; đếm bảng okrTrail thực tế 0. Đây là bước 8 của eval (AC-9 / gap-probe P1 'mở từ dòng báo phải ghi vết').
    Hp-tuan.tsx gọi okr.moHopTuan trong useMountEffect (mutation phía client); thước đọc kho ngay sau page.goto(waitUntil load) rồi đóng context không chờ. Chưa phân biệt được race của thước với vết thật sự không ghi được (người chấm chỉ đọc, không sửa mã hay thước).
    Đạt: cảnh cây + phiên đo riêng (kho crm_tts_e9_do); okr:mau --moc 2026-10-01 nạp OK; phòng A bật, phòng B ẩn; bản A và B hiện; tin nhắc Trưởng phòng A có dòng «1. Tóm tắt tuần Phòng Kinh doanh miền Bắc · 1 KR đáng bàn» kèm đường mở đúng tham số (xemOkr=hop-tuan, donOkr=pb:mau-okr-pb-kd-bac, kyOkr=mau-okr-chu-ky-quy4); 5 câu có số; thẻ trích dẫn 5 câu x 2 cỡ (1440, 390) khớp hàng OkrCheckIn đọc từ kho; Enter và Space mở thẻ, Esc đóng; 'Xem diễn biến KR' cho đúng URL; 'Hữu ích' ghi đúng 1 hàng OkrTomTatPhanHoi; công tắc Nhắc buổi sáng tắt, tải lại còn tắt, NotificationPreference.dongTroLyOkr=false; phòng B › Họp tuần không có khối Tóm tắt tuần; quản trị Toàn cảnh › Sức khoẻ: phòng A Bật, phòng B Ẩn. scrollWidth <= clientWidth ở mọi ảnh (24 ảnh, 1440 và 390).
    Ảnh: evidence/E9-step1..24.png. Log: .acceptance-runs/tro-ly-okr-tom-tat/man/e9-verify-run.log và e9-verify-run2.log.

- eval: E10
  run_id: minted-tro-ly-okr-tom-tat-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_duong_do
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muonic1n1d02_test

- eval: E12
  run_id: minted-tro-ly-okr-tom-tat-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_nhac
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muonibm5t2qh_test

- eval: E15
  run_id: minted-tro-ly-okr-tom-tat-E15-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_thuoc
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muonibwml7yi_test

- eval: E17
  run_id: minted-tro-ly-okr-tom-tat-E17-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.script.tts_eval
  verified_at: 2026-09-30T22:02:01Z
  output: |
    moc: 2026-09-29, 2026-09-15 · tran 1 USD
    eve eval okr/tom-tat (moc 2026-09-29) thoat 0 — chi 0.201354 USD theo AiChiPhi / tran 1 USD moi moc
    eve eval okr/tom-tat (moc 2026-09-15) thoat 1 — chi 0.183468 USD theo AiChiPhi / tran 1 USD moi moc
    chua gom tien judge: judge goi Gateway truc tiep, khong ghi vao AiChiPhi
    DUNG 19 ban tren 20; moi ban in nac=bat trang-thai=hien, 0 lech, 0 tut that bai; judge in kem, khong chan
    SAI ban 2026-09-14 Pháp chế nac=bat trang-thai=- cau=0 bo=0 lech=0 tut=0/0 judge=— — viec dong bang hong:SUBAGENT_EXECUTION_FAILED
    DUNG cau bi bo 1/96 = 1.0% (nguong 10%)
    Ghi chú: mốc 2026-09-15 không ra bản cho một phòng (Pháp chế) vì việc bị đóng băng hỏng; các chốt bằng mã trên 19 bản còn lại đều đạt. Nguyên nhân gốc (lỗi model/nhà cung cấp hay lỗi sản phẩm) chưa xác định trong vòng này.

- eval: E19
  run_id: minted-tro-ly-okr-tom-tat-E19-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.tts_tai_lieu
  verified_at: 2026-09-30T22:02:01Z
  output: |
    tai-lieu: muc cho re 9c, docs/api.md §OKR (3 thu tuc), docs/agent.md (chayXepTomTat, damBaoLichTomTat) deu du.

- eval: E21
  run_id: design-gate-ab2f58b0db
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tts_san_thiet_ke
  verified_at: 2026-09-30T22:02:01Z
  output: |
    design-gate --mode static chạy trên 5 tệp giao diện của lượt, không lỗi P0.

- eval: E22
  run_id: minted-tro-ly-okr-tom-tat-E22-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tts_doc_trang_thai
  verified_at: 2026-09-30T22:02:01Z
  output: |
    test-run: dropped crm_muoniln0ga56_test

### Mang sang từ round trước

Các eval dưới đây không bị delta chạm vào paths của chúng, round này không chạy lại.

- eval: E1
  run_id: minted-tro-ly-okr-tom-tat-E1-r1
  exit_code: 0
  verifier: config:executors.test.tts_dang_ban
  verified_at: 2026-09-30T21:17:21Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-tro-ly-okr-tom-tat-E11-r1
  exit_code: 0
  verifier: config:executors.test.tts_phan_hoi
  verified_at: 2026-09-30T21:17:21Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-tro-ly-okr-tom-tat-E13-r1
  exit_code: 0
  verifier: config:executors.test.tts_tat_dong
  verified_at: 2026-09-30T21:17:21Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14
  run_id: minted-tro-ly-okr-tom-tat-E14-r1
  exit_code: 0
  verifier: config:executors.test.tts_quan_tri
  verified_at: 2026-09-30T21:17:21Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-tro-ly-okr-tom-tat-E16-r1
  exit_code: 0
  verifier: config:executors.test.tts_chi_phi
  verified_at: 2026-09-30T21:17:21Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E18
  run_id: minted-tro-ly-okr-tom-tat-E18-r1
  exit_code: 0
  verifier: config:executors.test.tdx_judge_zdr
  verified_at: 2026-09-30T21:17:21Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

Hội đồng đề xuất cho E20: UNCERTAIN. Ô human_override để trống cho người quyết ở Cổng 2.

- domain-correctness: UNCERTAIN — Phần hiểu đúng hành vi thì đạt: CONTEXT.md (Tóm tắt tuần, Chế độ ẩn), docs/api.md §OKR và chỗ rẽ 9c của docs/agent.md đều nói rõ chạy sáng hôm sau ngày cập nhật, chỉ phòng ban, câu lệch số bị bỏ, bản quá 30% bị giữ lại không hiện cho ai, chế độ ẩn chỉ quản trị thấy. Phần luật kho chưa kết luận được: evidence/luat-kho.md xác nhận 0 chú thích, API chỉ đọc và ghi phản hồi, khuôn Zod ở packages/validation, hằng chính ở OKR_TOM_TAT; nhưng còn `className` trên thành phần `@crm/ui` (Button `self-start`, SimpleTableCell `whitespace-normal`/`align-top`/`hidden md:table-cell`, Skeleton) và vài hằng khai cục bộ (`LAM_TRON_GIA_TRI`, `NGHIN`, `CHU_SO_CHINH_XAC`, `HE_SO_DON_VI`). Có tính là «đè class ở chỗ gọi» hay «hằng tinh chỉnh» hay không thì cần luật design.md và diff, đều ngoài danh sách input của eval này.
- operational-feasibility: PASS — CONTEXT.md, docs/api.md và docs/agent.md (mục 9c) nói nhất quán cả năm điều: tóm tắt chạy sáng hôm sau ngày cập nhật, chỉ cho phòng ban, câu lệch số bị bỏ, bản bỏ quá 30% bị giữ lại không hiện cho ai, bản chế độ ẩn chỉ quản trị chương trình thấy ở Sức khoẻ. luat-kho.md cho thấy luật kho giữ được: 0 chú thích mới, API chỉ đọc bảng tóm tắt và ghi phản hồi, khuôn Zod ở packages/validation, hằng tinh chỉnh gom ở OKR_TOM_TAT (mấy hằng cục bộ chỉ là hệ số đổi đơn vị), inline-citation ở packages/ui, className trên thành phần @crm/ui chỉ là bố cục. Một điểm để người soát lưu ý: khoi-kenh.tsx:183 có thẻ h2 tự đặt cỡ chữ, thuộc bảng «vẽ tay» của design.md.
- spec-alignment: UNCERTAIN — Phần tài liệu đạt rõ (như trên). Phần luật kho trên diff thì chỉ có luat-kho.md, và tệp đó tự ghi hai chỗ mở hai cách đọc: hằng khai cục bộ ngoài `OKR_TOM_TAT` (`LAM_TRON_GIA_TRI`, `NGHIN`, `CHU_SO_CHINH_XAC`, `HE_SO_DON_VI`) và `className` thêm trên `SimpleTableCell` (`align-top`, `whitespace-normal`, `hidden md:table-cell`) cùng `Button` (`self-start`). Chưa đủ căn cứ để kết luận đạt hay trượt luật «hằng ở một tệp cấu hình» và «không đè class ở chỗ gọi».

- eval: E20
  judged_by: judge-subagent (fresh context)
  verdict: UNCERTAIN
  rationale: Tài liệu đạt rõ; luật kho trên diff chưa kết luận được vì có hai chỗ mở hai cách đọc (hằng khai cục bộ ngoài OKR_TOM_TAT, className thêm trên thành phần @crm/ui) và vài thẻ tiêu đề tự đặt cỡ chữ.
  required_evidence:
    - Phán quyết của chủ kho (ghi vào _acceptance/tro-ly-okr-tom-tat/evidence/, ví dụ luat-kho.md) rằng `className` chỉ làm bố cục trên `@crm/ui` ở apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx (Button `self-start`, Skeleton h/w) và okr/toan-canh/suc-khoe/tom-tat-quan-tri.tsx (SimpleTableCell `align-top`, `whitespace-normal`, `hidden md:table-cell`) được chấp nhận theo luật «không đè class» của docs/design.md; hoặc diff chuyển chúng thành biến thể trong packages/ui rồi chạy lại `grep -n className` trên hai tệp đó cho kết quả sạch.
    - Phán quyết tương tự (hoặc diff sửa) cho `<h2 className="font-medium text-sm">` ở settings/notifications/khoi-kenh.tsx:183 và `<h3 className="font-medium text-sm">` ở tom-tat-quan-tri.tsx:264,295 — docs/design.md mục «Dấu hiệu vẽ tay» xếp `<h2>` tự đặt cỡ chữ vào mẫu phải dùng `PageShellTitle`/`CardTitle`; bằng chứng là `grep -n "<h[1-6]"` trên ba tệp sau khi sửa hoặc dòng chấp nhận có chữ ký.
    - Xác nhận rằng các hằng khai cục bộ `LAM_TRON_GIA_TRI = 10_000` (packages/db/src/okr-tom-tat.ts), `NGHIN`, `CHU_SO_CHINH_XAC`, `HE_SO_DON_VI` (packages/validation/src/okr-kiem-tom-tat.ts) là hệ số đổi đơn vị/làm tròn chứ không phải hằng tinh chỉnh; hoặc diff dời chúng vào `OKR_TOM_TAT` ở packages/db/src/okr-tro-ly-danh-muc.ts, kèm lần chạy lại lệnh quét số cứng ở mục 4 của luat-kho.md.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

Một lệnh suite đỏ không gắn eval nào: `bun run test`. Trong đó gói agent báo một ca đỏ («goi > tap Muc tieu cua goi bang tap Muc tieu cong khai da cong bo cua phong trong chu ky; goi khong chua ho ten thanh vien»), 966 ca đạt trên 967; 8 trên 10 tác vụ turbo xong. Người chấm chỉ đọc nên chưa xác định đây là lỗi thật hay ca chập chờn dưới tải; cần chạy lại riêng và đọc log trước khi kết luận. Ba lệnh còn lại (lint, lint:slop, build) xanh.

- cmd: bun run test
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bun_run_test-r2
  exit_code: 1
  verified_at: 2026-09-30T22:02:01Z

- cmd: bunx turbo run lint --force
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-30T22:02:01Z

- cmd: bun run lint:slop
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-30T22:02:01Z

- cmd: bunx turbo run build --force
  run_id: minted-tro-ly-okr-tom-tat-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-30T22:02:01Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên baseline lẫn trên HEAD): E6 (`cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test test/tro-ly-okr-cach-ly.spec.ts`). Viết lại để khẳng định hành vi mới, hoặc xác nhận đây là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định; E17 chạy hai mốc ngày nhưng tính là một lần và không có tỷ lệ pass_rate)

## Iterations

Round 1: BLOCKED — thước E9 không đo được (giờ nhắc 08:31 ngày mai nằm ngoài cửa sổ sự kiện của việc nhắc khi bản tóm tắt tạo lúc 04:2x sáng 01/10), E17 đỏ, bộ test đầy đủ đỏ; sáu eval E1, E11, E13, E14, E16, E18 đạt và được mang sang round 2. Returned to implementation (sổ quyết định S4-r1: sửa bài ke-hoach-sheet theo ngày chạy, thêm ca cho E2, thêm bằng chứng luật kho cho E20, thêm gio-nhac cho E9).
Round 2: E17, E9 failed — E17: model thật không ra bản cho phòng Pháp chế ở mốc 2026-09-15 (việc đóng băng hỏng SUBAGENT_EXECUTION_FAILED), 19 trên 20 bản đạt các chốt bằng mã; E9: thước chạy được, 80 bước đạt, riêng bước 8 (mở đường trong tin nhắc phải ghi đúng 1 vết mo-hop-tuan) đếm được 0 vết, lặp lại 2/2 lần, chưa phân biệt race của thước với lỗi ghi vết thật. Bộ test đầy đủ đỏ một ca ở gói agent, không gắn eval nào. Returned to implementation.
