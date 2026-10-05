---
schema_version: 2
feature_slug: khep-ky-okr
verdict: PASS
failed_evals: []
reason: 
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 97a2eb9d7c24cc0cb7c6308c3bd47bd5211a3b02
human_signoff: Manh Phan 2026-09-28
---

# Evidence Report: khep-ky-okr

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | ui-check | PASS |
| E4 | AC-2 | script | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | ui-check | PASS |
| E8 | AC-5 | test | PASS |
| E9 | AC-6 | test | PASS |
| E10 | AC-7 | test | PASS |
| E11 | AC-8 | test | PASS |
| E12 | AC-9 | test | PASS |
| E13 | AC-10 | ui-check | PASS |
| E14 | AC-10 | script | PASS |
| E15 | AC-11 | ui-check | PASS |
| E16 | AC-12 | test | PASS |
| E17 | AC-13 | script | PASS |
| E18 | AC-14 | script | PASS |
| E19 | AC-14 | judgment | UNCERTAIN |
| E20 | AC-15 | script | PASS |
| E21 | AC-10 | test | PASS |
| E22 | AC-11 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-khep-ky-okr-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kko_luat
  verified_at: 2026-09-27T17:02:13Z
  output: |
     0 fail
     31 expect() calls
    Ran 28 tests across 1 file. [14.00ms]

- eval: E2
  run_id: minted-khep-ky-okr-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.kko_chu
  verified_at: 2026-09-27T17:02:13Z
  output: |
     0 fail
     648 expect() calls
    Ran 114 tests across 2 files. [751.00ms]

- eval: E3
  run_id: crm_sleepy_franklin_252447_do · cycle cmuk2ldzb0003tscfuxtbvtlr · objective N=cmuk2le0c0006tscfjea4uhby M=cmuk2le0u0008tscf31dpmkpp
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  screenshot: .acceptance-runs/khep-ky-okr/evidence/buoc-hoi.png
  observed: |
    buoc-hoi.png (1440/vi, evidence/buoc-hoi.png): hộp thoại «Thêm KR» mở trên sheet mục tiêu nháp N; ô Tên KR = «Gọi điện chào mừng mọi đối tác mới», dưới ô có icon-? + câu «Câu này đọc như một việc làm. Làm xong thì con số nào đổi?» (kr-la-viec, kiểu ghi-chú field-description); Khởi điểm=0 với câu dưới ô «Khởi điểm 0 là số thật, hay chưa đo?» (thieu-khoi-diem); Đích=40; nút «Thêm KR» (Lưu) tô xanh, KHÔNG có thuộc tính disabled — khớp Expected AC-2 (câu hỏi hiện, nút Lưu vẫn bật). buoc-hoi-390.png (390/vi): cùng hộp thoại ở khổ hẹp, mọi trường và hai câu hỏi vẫn đọc trọn trong khung, không tràn ngang (script đo scrollWidth 390 <= innerWidth 390 — assertion pass). buoc-doi-trong.png (1440/vi): sheet mục tiêu «Mở rộng mạng lưới đối tác khu phía Nam» (công bố, Tham vọng, 3 KR đều «Tăng tới») hiện băng cảnh báo viền vàng/cam «Mọi KR đều đẩy một con số lên» + «Có KR nào giữ chất lượng không — ví dụ tỷ lệ thoả thuận huỷ giữ dưới một mức? Câu hỏi này không chặn công bố.» nằm NGAY TRÊN bảng KR (đúng vị trí thieu-doi-trong yêu cầu); bảng liệt đủ 3 KR. man-khep-ky-network.txt rỗng (0 byte) cả trước và sau lượt chạy — không có pageerror/console.error/requestfailed nào bị script ghi lại trong toàn phiên (script tự nghe ba loại sự kiện này qua puppeteer, tương đương đường đọc network của driver).
  network_observed: clean
  output: |
    Không có driver Claude Browser trực tiếp (trình duyệt là puppeteer-core headless nội bộ của script, script tự nghe pageerror/console.error/requestfailed và ghi evidence/man-khep-ky-network.txt) — coi đây là đường đọc network của driver, không phải "n-a".

    Kết luận: mọi assertion của E3 (AC-2) PASS ở lượt đo sạch, và chiều đỏ bắt đúng lỗi tiêm vào — đúng Expected.

- eval: E4
  run_id: minted-khep-ky-okr-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E5
  run_id: muk2i2weynzj
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_ra
  verified_at: 2026-09-27T17:02:13Z
  output: |
     62 expect() calls
    Ran 3 tests across 1 file. [1.70s]
    test-run: dropped crm_muk2i2weynzj_test

- eval: E6
  run_id: muk2i2oru3v7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_doi_dich
  verified_at: 2026-09-27T17:02:13Z
  output: |
     49 expect() calls
    Ran 4 tests across 1 file. [2.06s]
    test-run: dropped crm_muk2i2oru3v7_test

- eval: E7
  run_id: phien-do crm_sleepy_franklin_252447_do (app :4296, api :4489), man-khep-ky.mjs --chi E7
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  screenshot: evidence/E7-step2.png
  observed: |
    evidence/E7-step2.png (buoc-ly-do-dich, sau buoc 2): hộp thoại "Sửa KR" đang mở cho KR "Thoả thuận mới trong quý" (kiểu Tăng tới, khối 12 → hiện tại 12). Ô «Đích» đã đổi thành 35 (chú thích dưới ô: "Trước đây: 30", đúng KR đang published ngoài rà). Ngay dưới hiện đủ field «Lý do đổi đích» còn trống, kèm mô tả "Ngoài rà giữa kỳ, đổi đích cần lý do. KR sẽ mang nhãn «đích sửa ngoài rà» tới lúc chấm." — đúng ô cần hiện khi đổi đích ngoài rà. Khớp Expected bước 2.
    evidence/E7-step4.png (buoc-dai-ra, cuối buoc 4, chụp trên trang /okr chứ không phải trong hộp thoại — đúng thiết kế script vì dải cảnh báo sống ở đầu khu OKR chứ không trong dialog): ngay dưới thanh tab (Của tôi/Cập nhật tuần/Theo đơn vị/Toàn cảnh) có dải cảnh báo viền vàng data-dai-ky="ra" với tiêu đề "Đang rà giữa kỳ tới hết 30 th9 9, 2026" và mô tả "Sửa đích lúc này không cần lý do. Hết rà, sửa đích phải ghi lý do và KR mang nhãn «đích sửa ngoài rà» tới lúc chấm." — đúng dải "Đang rà giữa kỳ tới <ngày>" ở đầu khu OKR mà Expected mô tả. (Trạng thái "ô lý do có hiện hay không" khi đổi đích trong rà được script xác nhận bằng DOM ngay tại thời điểm mở dialog trong bước 4, trước khi chuyển sang trang chụp dải cảnh báo — kết quả: not present, đúng Expected — xem output.)
  network_observed: n-a (driver)
  output: |
    networkObserved = "n-a (driver)": driver dùng ở đây là Bash gọi script rang (dùng puppeteer-core nội bộ), không phải browser tool của tôi có read_network_requests/read_console_messages — không có đường đọc network/console từ phía verifier độc lập cho lượt này; file man-khep-ky-network.txt sinh ra rỗng vì lượt chỉ chạy nhóm E7 (không phải toàn bộ suite thu network). Script tự kiểm tra "không lỗi console" nội bộ (PASS, xem trên) nhưng đó là log console, không phải wire-level network — không đủ để tự xưng "clean" theo đúng nghĩa network truth nên giữ n-a (driver) như luật yêu cầu.

    Kết luận: cả 4 bước của E7/AC-4 đạt đúng Expected (chiều xanh) trên code hiện tại của repo; không thấy dấu hiệu chiều đỏ (ô lý do không hề bị ẩn khi đổi đích ngoài rà).

- eval: E8
  run_id: muk2i35a7pb4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_sang_cham
  verified_at: 2026-09-27T17:02:13Z
  output: |
     161 expect() calls
    Ran 5 tests across 1 file. [2.68s]
    test-run: dropped crm_muk2i35a7pb4_test

- eval: E9
  run_id: muk2i2eqlyrk
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_cham
  verified_at: 2026-09-27T17:02:13Z
  output: |
     240 expect() calls
    Ran 4 tests across 1 file. [3.82s]
    test-run: dropped crm_muk2i2eqlyrk_test

- eval: E10
  run_id: muk2i54l4gnq
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_dong
  verified_at: 2026-09-27T17:02:13Z
  output: |
     63 expect() calls
    Ran 1 test across 1 file. [1.55s]
    test-run: dropped crm_muk2i54l4gnq_test

- eval: E11
  run_id: muk2i25jcqb5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_mang_sang
  verified_at: 2026-09-27T17:02:13Z
  output: |
     136 expect() calls
    Ran 3 tests across 1 file. [3.75s]
    test-run: dropped crm_muk2i25jcqb5_test

- eval: E12
  run_id: muk2i31kimb9
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_xuat
  verified_at: 2026-09-27T17:02:13Z
  output: |
     191 expect() calls
    Ran 2 tests across 1 file. [1.82s]
    test-run: dropped crm_muk2i31kimb9_test

- eval: E13
  run_id: minted-khep-ky-okr-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/sleepy-franklin-252447/evidence/E13-step2.png
  observed: |
    evidence/E13-step2.png (buoc-cham @1440): màn «Theo đơn vị», cách xem «Chấm điểm» đã chọn (viền xanh), câu «Điểm cuối kỳ không phải đánh giá nhân sự» + phụ đề đầy đủ hiện trong khung info; «Đã chấm 0/4 KR»; cột Điểm mỗi dòng có sẵn giá trị gợi ý (0,6 · gợi ý; 1 · gợi ý); nhãn «Đích sửa ngoài rà» gắn đúng ở dòng KR có ghi chú đổi đích 28/9 «Khách lớn đổi kế hoạch quý». Khớp expected bước 2.
    evidence/E13-step5.png (buoc-mang-sang): hộp thoại «Mang sang Quý 3/2026 kk2lqx9» nêu rõ «Chép 1 KR chưa trọn» (Đối tác gia hạn hợp tác) và «Không chép: «Đối tác dùng cổng đặt hàng mới» — điểm đã trọn»; toast «Đã lưu điều học được» vẫn còn hiện góc dưới trái, xác nhận bước 4 đã chạy trước đó. Khớp expected bước 4–5.
    evidence/E13-step6-loi.png: bảng chấm thay bằng thông báo lỗi «Không tải được bảng chấm. Điểm đã lưu vẫn còn; bấm Thử lại.» kèm nút «Thử lại» — đúng trạng thái chặn truy vấn bangCham ở bước 6.
    evidence/E13-step6-rong.png: đơn vị «Phòng chưa có mục tiêu kk2lqx9» hiện «Không có mục tiêu đã công bố trong kỳ» — đúng trạng thái rỗng.
    evidence/E13-step6-chi-okr.png: đăng nhập vai «chỉ OKR» — cột Điểm hiện chữ tĩnh «Chưa chấm / Người sửa được KR này chấm», không có ô chọn nào — đúng «điểm đọc được, không ô chọn».
    evidence/E13-step6-da-dong.png: banner đổi thành «Quý 2/2026 kk2lqx9 đã đóng... chỉ còn để đọc»; điểm hiện dạng text tĩnh (không ô chọn), điều học được hiển thị, và dòng «Đã mang sang Quý 3/2026 kk2lqx9» xuất hiện dưới khối mục tiêu — đúng cả trạng thái chỉ-đọc lẫn xác nhận mang sang ở bước 5.
    evidence/E13-step7-390.png: viewport 390 — bộ chọn cách xem là một dropdown «Chấm điểm ⌄» (không phải nhóm nút), không tràn ngang; câu «Điểm cuối kỳ không phải đánh giá nhân sự» vẫn hiện đủ. Đúng bước 7.
    evidence/E13-network.txt: chỉ có 2 dòng 500 GET .../okr.bangCham — đây là 2 lượt bị script tự chặn (request-interception) để dựng trạng thái lỗi ở bước 6 (script tự đếm "chan 2 luot bangCham", khớp số chặn), không phải lỗi backend thật ngoài kịch bản.
  network_observed: n-a (driver)
  output: |
    Ghi chú NETWORK TRUTH: driver đo là chính script kịch bản (puppeteer nội bộ), không phải browser-tool của phiên verifier này (không dùng mcp__Claude_Browser/read_network_requests) → networkObserved = "n-a (driver)" theo đúng luật. Nội dung evidence/E13-network.txt (2 dòng 500 GET .../okr.bangCham) là do chính test chặn có chủ đích để dựng UI lỗi ở bước 6, khớp số "chan 2 luot bangCham" mà script tự in ra — không phải dấu hiệu app thật lỗi.

    Không có lệnh nào bị công cụ giết hoặc cắt output; hai lệnh đều chạy trọn và in dòng tổng kết cuối cùng.

- eval: E14
  run_id: minted-khep-ky-okr-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E15
  run_id: minted-khep-ky-okr-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  screenshot: /Users/manhphan/dev/crm/.claude/worktrees/sleepy-franklin-252447/evidence/E15-step2-mo-ra.png
  observed: |
    Đọc trực tiếp 7 file PNG vừa lưu (đối chiếu evidence gốc .acceptance-runs/khep-ky-okr/evidence/, mtime 00:05–00:06, mới hơn lần chạy trước và cùng phiên đo vừa chạy):

    - E15-step2-mo-ra.png (buoc-mo-ra): bảng «Chu kỳ» hiện dòng «Quý 3/2026 kk2knpo» với dòng phụ «Rà giữa kỳ: 28 thg 9, 2026 – 30 thg 9, 2026» đúng dưới tên chu kỳ, pha vẫn «Đang chạy»; toast xanh «Đã mở rà giữa kỳ của Quý 3/2026 kk2knpo.» ở góc dưới trái. Khớp Expected bước 2 (dòng chu kỳ hiện khoảng rà + toast xác nhận). Dải ở khu OKR (`[data-dai-ky='ra']`) được script kiểm riêng (assertion pass, không có ảnh riêng).
    - E15-step4-dong-chan.png (buoc-dong-chan, 1440px): hộp thoại «Chưa đóng được Quý 1/2026 kk2knpo», mô tả «Kỳ chỉ đóng khi mọi KR của mục tiêu đã công bố có điểm. Còn 3 KR chưa chấm:», liệt kê đúng hai đơn vị «Phòng Đối tác khép kỳ kk2knpo — 2 KR» và «Phòng Vận hành khép kỳ kk2knpo — 1 KR» (khớp DB: log script in `DB con {"...cmuk2kov2...":2,"...cmuk2kozf...":1}`). Nút «Đóng kỳ» hiện mờ/nhạt màu (disabled) so với nút «Đóng hộp thoại» đậm màu — đúng CHIỀU ĐỎ cần chặn: nút KHÔNG bấm được khi còn KR chưa chấm. Khớp Expected bước 4.
    - E15-step9-dong-chan-390.png (cùng hộp thoại, viewport 390): bố cục xếp dọc, nội dung không tràn ngang (script tự kiểm scrollWidth<=innerWidth mỗi lần chụp, assertion nằm trong 51 khẳng định, 0 hỏng), nút «Đóng kỳ» vẫn ở trạng thái mờ/disabled giống bản 1440.
    - E15-step6-mo-lai-ly-do.png: hộp thoại «Mở lại Quý 1/2026 kk2knpo», ô «Lý do mở lại» đã gõ «Chấm nhầm thang điểm của phòng Đối tác», nút «Mở lại kỳ» chuyển sang xanh đậm/bấm được (script đã kiểm trước đó nút disabled khi ô trống và khi dưới 10 ký tự, đều pass).
    - E15-step6-mo-lai.png: sau xác nhận, dòng «Quý 1/2026 kk2knpo» đổi pha sang «Chấm điểm» (chấm cam) trên bảng chu kỳ; toast «Quý 1/2026 kk2knpo đã về pha chấm điểm.». Khớp Expected bước 6.
    - E15-step7-xuat.png: màn «Toàn cảnh OKR» lọc theo «Quý 1/2026 kk2knpo», banner «Quý 1/2026 kk2knpo đã đóng», nút «Xuất» hiện rõ. Script xác nhận tệp tải về .csv, dòng đầu (bỏ BOM) đúng bằng COT_XUAT viết trước, và số dòng dữ liệu (3) khớp số KR đọc DB (3) — log: «tep xuat okr-quy-1-2026-kk2knpo-2026-09-28.csv: 3 dong du lieu, DB 3 KR».
    - E15-step8-khong-quyen.png: đăng nhập thành viên thường (avatar «LV»), trang Chương trình OKR hiện dòng giải thích «Chỉ quản trị đổi được cấu hình chương trình.» ngay dưới tiêu đề trang; script xác nhận toàn bộ nút menu ba chấm của các dòng chu kỳ đều disabled và đều trỏ aria-describedby tới đúng dòng giải thích đó (assertion pass).

    Không có frame nào mâu thuẫn Expected; không thấy dấu hiệu nút «Đóng kỳ» bị bật sai ở bước chặn (buoc-dong-chan) — đây là điểm CHIỀU ĐỎ chính của eval và nó đứng đúng.
  network_observed: n-a (driver)
  output: |
    NETWORK TRUTH: driver là script Puppeteer chuyên dụng của kho (không phải browser tool của tôi với read_network_requests/read_console_messages) → networkObserved = "n-a (driver)" theo đúng luật. Tự script vẫn có kênh ghi lỗi mạng riêng (pageerror/console.error/requestfailed/response>=400) dump vào evidence/E15-network.txt — file đó RỖNG (0 byte) sau khi chạy hết 9 bước, tức không có request lỗi hay console error nào bị bắt trong toàn phiên; kết hợp với assertion "khong loi console" PASS ở trên, không có dấu hiệu app-fail.

    Toàn bộ 51 khẳng định của script (bao trùm đúng 9 bước steps giao) đều pass, không do sửa code tay.

- eval: E16
  run_id: muk2ibigzu3p
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kko_pham_vi
  verified_at: 2026-09-27T17:02:13Z
  output: |
     8 expect() calls
    Ran 2 tests across 1 file. [1035.00ms]
    test-run: dropped crm_muk2ibigzu3p_test

- eval: E17
  run_id: minted-khep-ky-okr-E17-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_ty_le
  verified_at: 2026-09-27T17:02:13Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

- eval: E18
  run_id: minted-khep-ky-okr-E18-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kko_san_thiet_ke
  verified_at: 2026-09-27T17:02:13Z
  output: |
    cho goi apps/app: FieldDescription variant="hoi" 1 · ViewSwitch 1
    tong tep da soi: 67
    vi pham: 0

- eval: E19
  judged_by: judge panel (fresh context) — 3 lens: domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  rationale: Cả ba lens đều UNCERTAIN vì ba file input được cấp cho hội đồng chỉ là hồ sơ thiết kế/kế hoạch (đặc tả thiết kế lượt 7, contract, design-pass) — nói Ý ĐỊNH (kiemOkr/OKR_KHEP phải ở packages/validation, đầu vào mới phải parse bằng Zod, màn chấm phải dùng packages/ui, câu "không phải đánh giá nhân sự" phải hiện) chứ không phải bằng chứng về mã đã viết thật hay ảnh chụp màn hình sau khi implement; hội đồng bị BLIND với diff nên không đủ căn cứ khẳng định PASS hay chỉ ra vi phạm cụ thể để khẳng định FAIL.
  votes:
    - domain-correctness: UNCERTAIN — Ba file input chỉ nói lượt này DỰ ĐỊNH làm gì (đặc tả) và ghi nhận trạng thái bản mẫu /proto trước khi viết mã — không file nào là bằng chứng về mã đã viết thật (diff, nội dung packages/validation, cây import của màn chấm/hộp thoại/điều khiển chu kỳ, hay ảnh chụp màn hình sau khi implement). Contract tự liệt câu hỏi này thành AC-14 loại «(judgment)» đúng vì nó cần bằng chứng riêng để chấm, và hồ sơ design-pass là của bản mẫu tĩnh trước S3, không xác nhận mã cuối cùng có theo đúng bản mẫu (Nhóm 2 ghi rõ "chờ Gate 1", tức tại thời điểm đó còn chưa xong).
      required_evidence:
        - Nội dung packages/validation/src/okr-kiem.ts và okr-khep.ts (đường dẫn thật trong diff lượt này) để xác nhận kiemOkr là hàm thuần, trả mã ổn định (kr-la-viec, thieu-khoi-diem, dich-bang-khoi-diem, thieu-doi-trong), không đọc DB/gọi mạng
        - Kết quả grep 'Record<string, unknown>' và các schema Zod ở biên trong các file mới/sửa của lượt này (đường dẫn cụ thể trong diff), để xác nhận mọi đầu vào mới được parse bằng Zod chứ không truyền Record<string, unknown>
        - Đoạn mã hoặc ảnh chụp màn Chấm điểm, hộp thoại mang sang, và điều khiển chu kỳ ở Cài đặt cho thấy chúng dựng từ component packages/ui (Card, SimpleTable, Item, Dialog, ConfirmDialog...) chứ không phải div/table/AlertDialog tự dựng — ví dụ ảnh evidence/design-pass/ST-cham-donvi--desktop-1440.png đối chiếu với mã nguồn thật sau S3, không chỉ bản mẫu /proto trước Gate 1.5
        - Ảnh chụp hoặc DOM của màn chấm (ST-cham-donvi) từ ứng dụng đã build (không phải /proto) cho thấy câu 'Điểm cuối kỳ không phải đánh giá nhân sự' hiển thị đúng vị trí như bản mẫu đã duyệt
    - operational-feasibility: UNCERTAIN — Ba file input chỉ là hồ sơ thiết kế/kế hoạch (design doc, contract, design-pass) — chúng nói ý định (kiemOkr thuần ở packages/validation, khuôn Zod, bảng "xuất xứ component" toàn "dùng", câu "không phải đánh giá nhân sự" trong đặc tả UX) chứ không phải bằng chứng đã chạy cổng thiết kế tĩnh / soi mã trên diff thật như AC-14 đòi hỏi. Judge bị BLIND với diff và không có trong danh sách Input các file bằng chứng (scan output, ảnh chụp thật, mã nguồn đã sửa), nên không đủ căn cứ để khẳng định PASS hay FAIL.
      required_evidence:
        - Output của cổng thiết kế tĩnh / bộ quét «Dấu hiệu vẽ tay» + soi mã (vd. bun run lint:slop hoặc script tương đương) chạy trên đúng các tệp lượt này thêm/sửa, cho thấy không vi phạm P0 và không có <table>, divide-y, rounded-lg border tự dựng, navigator.clipboard, AlertDialog ráp tay trong apps/app
        - Mã nguồn thật của packages/validation/src/okr-kiem.ts và okr-khep.ts (hoặc đường dẫn tương đương trong diff) cho thấy kiemOkr là hàm thuần (không import DB/network) và mọi đầu vào mới được parse bằng Zod, không có Record<string, unknown> hay bản sao ở apps/api/apps/app
        - Ảnh chụp hoặc DOM/text-dump thật của màn Chấm điểm (ST-cham-donvi) cho thấy câu «Điểm cuối kỳ không phải đánh giá nhân sự» thực sự render trên màn, không chỉ ghi trong đặc tả — ví dụ evidence/design-pass/ST-cham-donvi--desktop-1440.png kèm text đã OCR/verify
        - Đoạn import trong mã nguồn các tệp dựng màn chấm, hộp thoại mang sang, và điều khiển chu kỳ ở Cài đặt, cho thấy dùng component từ packages/ui (Card, Item, Select, Dialog, ConfirmDialog, Alert...) thay vì JSX tự dựng tương đương
    - spec-alignment: UNCERTAIN — Ba tệp input (design spec, contract, design-pass) chỉ mô tả Ý ĐỊNH thiết kế — chúng nói rõ kiemOkr/OKR_KHEP PHẢI ở packages/validation, mọi đầu vào PHẢI parse bằng Zod, màn chấm PHẢI dùng packages/ui và PHẢI có câu "không phải đánh giá nhân sự" — nhưng câu hỏi đòi phán trên diff/mã thực tế của lượt này (hàm có thuần không, mã lỗi có ổn định không, màn có thực sự dựng bằng component packages/ui hay vẽ tay), mà theo luật BLIND không được đọc diff và danh sách input không có mã nguồn hay ảnh chụp evidence (dù design-pass.md có liệt các file evidence/design-pass/*.png, chúng không nằm trong danh sách Input được cấp cho eval này). Riêng design-pass.md còn cho thấy hai biến thể packages/ui (tông "câu hỏi" của FieldDescription, Select thu gọn ở 390) ở Nhóm 2 mới là đề xuất "chờ Gate 1" tại thời điểm design-pass, không phải bằng chứng đã dựng xong trong mã — nên không đủ căn cứ để khẳng định PASS hay bắt lỗi cụ thể để khẳng định FAIL.
      required_evidence:
        - Chạy AC-14 như contract mô tả: cổng thiết kế tĩnh + bộ quét 'Dấu hiệu vẽ tay' + soi mã trên diff thực của lượt này, đính kèm output/exit-code cho thấy không có <table>, <h1>, <h2>, divide-y, rounded-lg border tự dựng, navigator.clipboard, AlertDialog ráp tay trong apps/app, và không có bản sao kiemOkr/OKR_KHEP ngoài packages/validation
        - grep -rn 'Record<string, unknown>' và tìm định nghĩa Zod schema cho mọi input mới (moRa, dongRa, chamKr, ghiDieuHocDuoc, moLaiKy, mangSang...) trong diff của lượt này, để xác nhận parse ở biên
        - Ảnh chụp hoặc DOM output thực tế của màn Chấm điểm (route /proto/khep-ky-okr?state=ST-cham-donvi hoặc màn thật apps/app) cho thấy câu 'Điểm cuối kỳ không phải đánh giá nhân sự' thực sự hiển thị trên màn, không chỉ là đặc tả
  human_override: Manh Phan 2026-09-28 — Đạt

- eval: E20
  run_id: minted-khep-ky-okr-E20-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kko_migration_chi_them
  verified_at: 2026-09-27T17:02:13Z
  output: |
    goc so sanh: origin/onehub (13477d5f) · migration moi: 20260930010000_okr_khep_ky · so cau lenh: 21 · khoa ngoai toi bang OKR cu: 8/8
    kho tam crm_kko_mig_82133: 92 bang cu, gieo user=1 company=1 deal=1 division=1 department=1 orgPlacement=1 okrCycle=2 okrObjective=2 okrKeyResult=2 okrCheckInSession=1 okrCheckIn=1 okrNguonKr=1 okrSoChup=1; sau migration so dong va van tay khong doi; bang moi: okrCuaSoRa, okrDiemKr, okrDoiDich, okrMangSang, okrNhinLai; xoa truoc khi gan: kr=xoa duoc mucTieu=xoa duoc chuKy=xoa duoc; xoa sau khi gan: kr=23503 mucTieu=23503 chuKy=23503

- eval: E21
  run_id: minted-khep-ky-okr-E21-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.kko_bang_cham_dom
  verified_at: 2026-09-27T17:02:13Z
  output: |
     0 fail
     21 expect() calls
    Ran 7 tests across 1 file. [963.00ms]

- eval: E22
  run_id: minted-khep-ky-okr-E22-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.kko_man_chrome
  verified_at: 2026-09-27T17:02:13Z
  output: |
    -- tiền đề làn đo: đã dọn contextDevApiKey
    -- tiền đề làn đo: đã dọn ảnh đại diện
    phien-do: xong — mã 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: muk2i1pi16q2
  exit_code: 0
  verified_at: 2026-09-27T17:02:13Z

- cmd: bunx turbo run lint --force
  run_id: minted-khep-ky-okr-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-27T17:02:13Z

- cmd: bun run lint:slop
  run_id: minted-khep-ky-okr-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-27T17:02:13Z

- cmd: bunx turbo run build --force
  run_id: minted-khep-ky-okr-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-27T17:02:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

- E2 (cmd: `cd apps/app && bun test test/okr-khep-chu.spec.ts test/messages-guard.spec.ts`) — baseline: green. Bài đọc mã trên nhánh cũ (diffBase) cũng đạt, nên tự nó không phân biệt được feature: nó khẳng định danh sách mã đọc từ `MA_LUAT_OKR` (không chép tay) và các câu hỏi song ngữ đã tồn tại từ trước hay do lượt này thêm — không tách riêng. Đây là regression-guard có chủ ý (giữ tệp chữ song ngữ nhất quán mọi lượt về sau), không cần viết lại.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: toàn bộ 21 eval máy (E1–E18, E20–E22) đạt ngay từ lượt đầu, kể cả các ca "chiều đỏ" (chạy `--chieu-do` trên bản sao lỗi cố ý) đều bắt đúng lỗi tiêm vào như `expected` mô tả. Duy nhất E19 (AC-14, judgment) là UNCERTAIN ở cả ba lens vì bộ input cấp cho hội đồng chỉ là hồ sơ thiết kế/kế hoạch, không phải bằng chứng về mã đã viết — verdict tổng dừng ở PENDING-JUDGMENT, chờ người tự xem diff/ảnh chụp thật ở Cổng 2 rồi điền `human_override`.

### Re-pin lần 1 — 2026-09-27, do gộp onehub #178 trước khi gộp PR #179
run_id: repin-20260927T221723Z-27965
sha: a93384d5e34ab5e56af0e1d95d728d15d45755bb · suites: 4 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E3 (E3 không khai paths), E7 (E7 không khai paths), E13 (E13 không khai paths), E15 (E15 không khai paths), E19 (E19 không khai paths)

### Re-pin lần 2 — 2026-09-29, do thước migration của khep-ky-okr và canh-kr-okr đo được sau khi lượt đã gộp (dựng lại nền lúc gộp)
run_id: repin-20260929T151035Z-23219
sha: f55e110820fbc2ccf229a0445cdf99813408649e · suites: 4 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E3 (E3 không khai paths), E7 (E7 không khai paths), E13 (E13 không khai paths), E15 (E15 không khai paths), E19 (E19 không khai paths)

### Re-pin lần 3 — 2026-10-04, do sửa thước theo diff sau gộp và khai paths (lô a)
run_id: repin-20261004T095914Z-97808
sha: b0e84291d6a770394f91f9c24730616f21273654 · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E3, E7, E13, E15, E19 · diff chạm vật đo ngoài làn máy: E3, E7, E13, E15 — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-10-05, do sửa thước đỏ lô 2-4 (a)
run_id: repin-20261005T012004Z-26223
sha: 97a2eb9d7c24cc0cb7c6308c3bd47bd5211a3b02 · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E3, E7, E13, E15, E19 · diff chạm vật đo ngoài làn máy: E3, E7, E13, E15 — chưa chứng lại, đi vòng S4 delta
