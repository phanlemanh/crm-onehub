---
schema_version: 2
feature_slug: the-gop-y-okr
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 99ab35a30335c5f765410f94905e06d237d72c74
human_signoff: Phan Le Manh 2026-09-29
---

# Evidence Report: the-gop-y-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | ui-check | PASS |
| E12 | AC-12 | script | PASS |
| E13 | AC-13 | ui-check | PASS |
| E14 | AC-14 | judgment | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-1 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-the-gop-y-okr-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tgy_man_that
  verified_at: 2026-09-29T13:31:36Z
  output: |
    Frame luu bang puppeteer cua script: evidence/E1-1440-muc-tieu.png (buoc 4) va evidence/E1-1440-kr.png (buoc 5).
    Cung luot script con ghi E11-*.png va E13-*.png. E1-run.log va E1-network.txt cap nhat.
  screenshot: evidence/E1-1440-muc-tieu.png
  observed: |
    E1-1440-muc-tieu.png (da mo bang Read): hop thoai «Sua muc tieu» rong ~800px o 1440, hai cot canh nhau cung hang: ben trai form (Cap, Don vi, Ten muc tieu «Doanh thu quy 4 mien Bac», Loai, Phu trach, Nguoi tham gia, Vi sao luc nay), ben phai cot «Tro ly OKR» voi 4 the: the viet lai «Ten Muc tieu» (chu cu gach ngang «Doanh thu quy 4 mien Bac», cau moi «Thi truong mien Bac but pha hop dong va san sang dap ung nhu cau kho mua sam cuoi nam», ly do, hang nut Nhan (xanh, duy nhat to mau) / Sua / Bac), the viet lai «Ten KR», the «Cau hoi» voi «Bo qua», the «Can chinh» voi nut «Can chinh»/«Bac». Cau moi ngat dong thanh 2 dong, khong tran, khong thanh cuon ngang. Khop expected (cot 380>=360, cau moi 358>=320, form 364>=348, scrollWidth==innerWidth).
    E1-1440-kr.png: hop «Sua KR» cung bo cuc hai cot, form ben trai (Ten KR «Goi dien cho doi tac moi moi tuan» dang focus, Kieu, Khoi diem/Dich/Hien tai...), ben phai cot «Tro ly OKR · chi KR nay» voi dung 1 the viet lai «Ten KR» (cu gach ngang, moi «So doi tac moi duoc ket noi dat 200 cuoc», ly do, Nhan/Sua/Bac). Khong tran ngang, cot va form cung hang. Khop expected, khong mau thuan voi cac so do da in.
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-the-gop-y-okr-E2-r1
  exit_code: 0
  verifier: config:executors.test.tgy_the_ba_tang
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-the-gop-y-okr-E3-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_sua_roi_nhan
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-the-gop-y-okr-E4-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_mo_kr
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-the-gop-y-okr-E5-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_can_chinh
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-the-gop-y-okr-E6-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_chi_o
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-the-gop-y-okr-E7-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_phim
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-the-gop-y-okr-E8-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_khong_dong
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-the-gop-y-okr-E9-r1
  exit_code: 0
  verifier: config:executors.test.tgy_cot_trang_thai
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-the-gop-y-okr-E10-r1
  exit_code: 0
  verifier: config:executors.test.tgy_thong_tin
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: E11-20260929-2035
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tgy_man_that
  verified_at: 2026-09-29T13:31:36Z
  output: |
    8 frame evidence/E11-*.png (390, 1023, 1024, 1440 px, hop Sua muc tieu va hop Sua KR) chup bang puppeteer cua script, khong qua ui:capture.
    Driver la puppeteer, khong co bo doc network, ghi n-a (driver) vao E11-network.txt.
  screenshot: evidence/E11-390-muc-tieu.png
  observed: |
    I opened all 8 frames with Read, and each one matches Expected.
    - E11-390-muc-tieu.png: a single-column dialog "Sửa mục tiêu". The "Trợ lý OKR" column sits below the form. It holds 4 stacked cards (two Viết lại, Câu hỏi, Căn chỉnh) that fill the column width, with Lưu/Huỷ at the bottom. No horizontal overflow is visible.
    - E11-390-kr.png: dialog "Sửa KR". The form fields (Đơn vị đo, Phụ trách, Hạn) come first. Below them is the "Trợ lý OKR · chỉ KR này" column with one Viết lại card for the KR name, full width, and no overflow.
    - E11-1023-muc-tieu.png: still a single column. The dialog is scrolled so the column heading and its 4 cards (Viết lại x2, Câu hỏi, Căn chỉnh) sit below the form, and the last form hint is cut off at the top. The cards span the whole dialog width. This is not side by side.
    - E11-1023-kr.png: the form (Nguồn số, Đơn vị đo, Phụ trách, Hạn) is on top. The "Trợ lý OKR · chỉ KR này" column with one card is below it, at full width.
    - E11-1024-muc-tieu.png: two columns. The form is on the left (Tên mục tiêu, Loại, Phụ trách...). On the right, "Trợ lý OKR" starts at the same height as the form, with 4 cards and Nhận/Sửa/Bác buttons.
    - E11-1024-kr.png: two columns. The form (Tên KR, Kiểu, Khởi điểm/Đích/Hiện tại...) is on the left. The right column "Trợ lý OKR · chỉ KR này" holds one Viết lại card, level with the form.
    - E11-1440-muc-tieu.png: two columns with a wider dialog. The 4-card column is on the right, beside the form, and both start at the same height.
    - E11-1440-kr.png: two columns. One card in the right column, beside the KR form, with no overflow.
  network_observed: n-a (driver)

- eval: E12
  run_id: minted-the-gop-y-okr-E12-r1
  exit_code: 0
  verifier: config:executors.script.tgy_ten_goi
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E13
  run_id: minted-the-gop-y-okr-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tgy_man_that
  verified_at: 2026-09-29T13:31:36Z
  output: |
    Chay trong phien do rieng (kho crm_crm_tro_ly_do, cong app/api rieng), khoa model co mat.
    KET LUAN: 56 DUNG, 0 SAI. Cac khang dinh mot role=dialog sau moi cu bam, okr.objective doc lai bang chu da sua, OkrTrail co note tro-ly-okr:<id>, tab Vet 1440 va 390 co dong «theo de xuat cua Tro ly OKR» deu DUNG.
    Chieu do ghim («nhan khong doi gi») khong bat tren ban dung that, dung nhu ky vong. 10 frame evidence/E13-*.png.
  screenshot: evidence/E13-1440-co-dong.png
  observed: |
    E13-1440-co-dong.png: dialog "Sua muc tieu" two columns; left form with Ten muc tieu "Doanh thu quy 4 mien Bac"; right column "Tro ly OKR" header says 7 de xuat; first card "Viet lai - Ten Muc tieu" with struck old text and green new text "Doanh thu mien Bac dap ung nhu cau kho mua mua sam cuoi nam", one filled green primary "Nhan", "Sua" chip, "Bac" ghost; a second Viet lai Ten KR card, two "Cau hoi" cards with only "Bo qua" (and "Mo KR nay" chip), no filled button on question cards; exactly one dialog visible. E13-390-co-dong.png: single-column dialog, column stacked under/replacing form with same cards (Nhan filled, Sua, Bac; Cau hoi with Bo qua), Luu/Huy stacked at bottom, no horizontal overflow visible. E13-390-bac.png: after Bac, the Ten KR card collapsed to a row "Ten KR - Da bac", the Muc tieu Viet lai card still pending, dialog still open (single dialog). E13-390-bo-qua.png: after Bo qua one Cau hoi collapsed to row "Cau hoi - Da bo qua", other cards remain, dialog still open. E13-1440-dang-sua.png: Viet lai card in edit mode with textarea containing the new text "Khong thoa thuan nao cua mien Bac bi mat dau trong quy 4", old text struck, buttons "Nhan ban da sua" (primary) and "Huy"; header now 5 de xuat; dialog still open. E13-1440-da-nhan.png: card collapsed to "Ten Muc tieu - Da nhan", form field Ten muc tieu now shows the edited text, header 4 de xuat, toast "Da nhan / Hoan tac", dialog still open. E13-1440-vet.png: object sheet for "Khong thoa thuan nao cua mien Bac bi mat dau trong quy 4", tab Vet 4 active, top row "Sua ten - theo de xuat cua Tro ly OKR" with Truoc->sau "Doanh thu quy 4 mien Bac -> Khong thoa thuan nao ...". E13-390-vet.png: same sheet at 390, tab Vet 4, first row "Sua ten - theo de xuat cua Tro ly OKR" visible; table wider than viewport so the Truoc->sau column is clipped (not part of E13 assertions). All frames consistent with Expected.
  network_observed: n-a (driver)

- eval: E14
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ở cả 1440 và 390 px mỗi thẻ cần quyết có đúng một nút chính tô xanh đặc ("Nhận" ở hai thẻ Viết lại, "Căn chỉnh" ở thẻ Căn chỉnh), "Sửa" là nút phụ viền nhạt, "Bác" là chữ trơn, thẻ Câu hỏi chỉ có "Bỏ qua". Câu đề xuất mới chạy trọn chiều rộng thẻ, chỉ xuống dòng một hai lần, đọc liền mạch; nút nằm hàng riêng dưới câu nên hết cảm giác chật của cột cũ lượt 9b.
  panel_proposal: PASS (đề xuất của máy, ba judge)
  votes:
    - domain-correctness: PASS — mỗi thẻ cần quyết có đúng một nút chính xanh đặc; câu mới chỉ xuống dòng một lần ở 1440 và 390, khác ảnh cột cũ bị bẻ thành dòng ba bốn chữ.
    - operational-feasibility: PASS — nút chính lọt mắt ngay, câu mới chiếm trọn chiều rộng thẻ, 1-2 dòng mỗi dòng 6-8 chữ ở 1440 và 5-7 chữ ở 390.
    - spec-alignment: PASS — thẻ Viết lại có Nhận xanh đặc, Sửa phụ, Bác chữ trơn; thẻ Căn chỉnh có Căn chỉnh xanh đặc; thẻ Câu hỏi chỉ có Bỏ qua nên không tranh nút chính; câu mới dài 1-2 dòng, mỗi dòng 5-8 chữ.
  human_override:  # chi nguoi ghi

- eval: E15
  run_id: minted-the-gop-y-okr-E15-r1
  exit_code: 0
  verifier: config:executors.script.tgy_san_thiet_ke
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E16
  run_id: minted-the-gop-y-okr-E16-r1
  exit_code: 0
  verifier: config:executors.test.tgy_co_hop
  verified_at: 2026-09-29T13:15:46Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-the-gop-y-okr-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-29T13:31:36Z

- cmd: bunx turbo run lint --force
  run_id: minted-the-gop-y-okr-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-29T13:31:36Z

- cmd: bun run lint:slop
  run_id: minted-the-gop-y-okr-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-29T13:31:36Z

- cmd: bunx turbo run build --force
  run_id: minted-the-gop-y-okr-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-29T13:31:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — E1 lỗi ở bước E13 thiếu thẻ câu hỏi trong bộ thẻ chụp, E14 chưa chắc vì thiếu ảnh đủ loại thẻ. Returned to implementation.
Round 2: PASS — kịch bản màn nhờ lại tới khi đủ loại thẻ và chụp trọn thẻ căn chỉnh (commit 2b93a081, 932ab456); E1, E11, E13 chạy lại và E14 chấm lại trên ảnh mới, E2-E10, E12, E15, E16 mang từ round 1 vì delta không chạm paths của chúng.

### Re-pin lần 1 — 2026-09-29, do gộp onehub (#208–#211) vào nhánh thẻ góp ý OKR
run_id: repin-20260929T165336Z-18491
sha: a8af896d4f715b6d413bf3cb36faadf81ce95631 · suites: 4 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E1, E11, E13, E14 · AC không có chốt máy: AC-13, AC-14

### Re-pin lần 2 — 2026-09-30, do vỏ Sheet của khung-tao-okr-nhu-deal và gộp onehub
run_id: repin-20260930T072126Z-75787
sha: 21b20e9fc9789a48272e69d636391a3544ec3e95 · suites: 4 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E1, E11, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13, AC-14

### Re-pin lần 3 — 2026-09-30, do gộp onehub (#219) trước khi gộp PR #220
run_id: repin-20260930T090606Z-76836
sha: 1d4312c2d5d0fae6e9f66254a7c3634f756e9798 · suites: 4 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E13 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13, AC-14

### Re-pin lần 4 — 2026-10-02, do hoá cũ do soan-okr-cung-tro-ly (gộp onehub 923f5717)
run_id: repin-20261002T015945Z-89793
sha: d6fe85037147097194a3d0b80bc50e4a382af04a · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E1, E11, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-13, AC-14

### Re-pin lần 5 — 2026-10-02, do hoá cũ do sửa lịch tóm tắt tuần lọc chu kỳ ẩn (405fe2da) trong PR soan-okr-cung-tro-ly
run_id: repin-20261002T031659Z-45883
sha: 255a3688eaa146901ac98df58fc8957d22dba7e9 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E1, E11, E13, E14 · AC không có chốt máy: AC-13, AC-14

### Re-pin lần 6 — 2026-10-02, do hoá cũ do sửa mã kiểm (agent-okr Node 24, api nguon-khoa) cho CI PR #232
run_id: repin-20261002T070749Z-51832
sha: 68478e877021999d6c540e4dd4a93e6d57549890 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng · ngoài làn máy: E1, E11, E13, E14 · AC không có chốt máy: AC-13, AC-14

### Re-pin lần 7 — 2026-10-06, do nhận kit 2.24.0 — eval máy khai superseded_by theo BANG-THAY-THE của gop-y-dung-cho
run_id: repin-20261006T163931Z-72362
sha: c57cf22c6193ebbbdd903cf74f0b1fdb3c7022f2 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E3, E4, E5, E6, E7, E8, E9, E15, E16 · thay bởi hồ sơ đã ký: E3→gop-y-dung-cho#AC-7, E4→gop-y-dung-cho#AC-5, E5→gop-y-dung-cho#AC-5, E6→gop-y-dung-cho#AC-12, E7→gop-y-dung-cho#AC-10, E8→gop-y-dung-cho#AC-12, E9→gop-y-dung-cho#AC-11, E15→gop-y-dung-cho#AC-14, E16→gop-y-dung-cho#AC-12 · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E1, E11, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-11, AC-13, AC-14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 8 — 2026-10-08, do gộp onehub sau chữ ký Cổng 2 của khung-ban-ghi-kara; eval của the-gop-y-okr, logo-onehub, nen-kara bị thay hay sửa ở vòng này
run_id: repin-20261008T004656Z-80562
sha: beac40ab8472f735a5e7ecc79a03ae01ea1d37cf · suites: 7 lệnh exit 0 · evals: 2/2 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E3, E4, E5, E6, E7, E8, E9, E10, E15, E16 · thay bởi hồ sơ đã ký: E3→gop-y-dung-cho#AC-7, E4→gop-y-dung-cho#AC-5, E5→gop-y-dung-cho#AC-5, E6→gop-y-dung-cho#AC-12, E7→gop-y-dung-cho#AC-10, E8→gop-y-dung-cho#AC-12, E9→gop-y-dung-cho#AC-11, E10→khung-ban-ghi-kara#AC-6, E15→gop-y-dung-cho#AC-14, E16→gop-y-dung-cho#AC-12 · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E1, E11, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-13, AC-14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 9 — 2026-10-08, do gộp onehub sau #303 (datatable-loc-ro)
run_id: repin-20261008T011613Z-35007
sha: 9315f0aec7b0fb77cd2a3b43d91f869ca2946a1d · suites: 7 lệnh exit 0 · evals: 2/2 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E3, E4, E5, E6, E7, E8, E9, E10, E15, E16 · thay bởi hồ sơ đã ký: E3→gop-y-dung-cho#AC-7, E4→gop-y-dung-cho#AC-5, E5→gop-y-dung-cho#AC-5, E6→gop-y-dung-cho#AC-12, E7→gop-y-dung-cho#AC-10, E8→gop-y-dung-cho#AC-12, E9→gop-y-dung-cho#AC-11, E10→khung-ban-ghi-kara#AC-6, E15→gop-y-dung-cho#AC-14, E16→gop-y-dung-cho#AC-12 · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E1, E11, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-13, AC-14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 10 — 2026-10-09, do thuoc-khong-tu-het-han sửa paths; hồ sơ hoá cũ do onehub đổi vật
run_id: repin-20261009T224054Z-34604
sha: 99ab35a30335c5f765410f94905e06d237d72c74 · suites: 7 lệnh exit 0 · evals: 2/2 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E3, E4, E5, E6, E7, E8, E9, E10, E15, E16 · thay bởi hồ sơ đã ký: E3→gop-y-dung-cho#AC-7, E4→gop-y-dung-cho#AC-5, E5→gop-y-dung-cho#AC-5, E6→gop-y-dung-cho#AC-12, E7→gop-y-dung-cho#AC-10, E8→gop-y-dung-cho#AC-12, E9→gop-y-dung-cho#AC-11, E10→khung-ban-ghi-kara#AC-6, E15→gop-y-dung-cho#AC-14, E16→gop-y-dung-cho#AC-12 · ngoài làn máy: E1, E11, E13, E14 · diff chạm vật đo ngoài làn máy: E1, E11, E13, E14 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-1, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-11, AC-13, AC-14 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
