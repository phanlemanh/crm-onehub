---
schema_version: 2
feature_slug: tim-va-dieu-huong-kho
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d03129ecfa5bdbcff83dee9706a511e342f399c
human_signoff: Phan Le Manh 2026-09-29
---

# Evidence Report: tim-va-dieu-huong-kho

Vòng 2. Mọi eval máy đều đạt; còn một mục judgment (E12j) chưa ngã ngũ nên người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E3u | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4u | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E5d | AC-5 | test | PASS |
| E5u | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E6d | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8d | AC-8 | test | PASS |
| E8u | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10d | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E11d | AC-11 | test | PASS |
| E0s | AC-12 | test | PASS |
| E12j | AC-12 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-tim-va-dieu-huong-kho-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_tim_ma_tran
  verified_at: 2026-09-29T01:19:58Z

- eval: E2
  run_id: ""
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_khong_ro
  verified_at: 2026-09-29T01:19:58Z

- eval: E3
  run_id: minted-tim-va-dieu-huong-kho-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_tim_vai_okr
  verified_at: 2026-09-29T01:19:58Z

- eval: E3d
  run_id: minted-tim-va-dieu-huong-kho-E3d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_cmdk
  verified_at: 2026-09-29T01:19:58Z
  output: |
    Ran 4 tests across 1 file. [1113.00ms]

- eval: E3u
  run_id: minted-tim-va-dieu-huong-kho-E3u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_tim
  verified_at: 2026-09-29T01:19:58Z
  screenshot: evidence/E3u-step1.png
  observed: |
    E3u-step1.png (1440x900): the command palette opened over a dark page. The input reads 'quy dinh hoa hong'. There is one group heading 'Tài liệu' with one row, 'Quy định hoa hồng đối tác'. The excerpt below it is 'Tỉ lệ hoa hồng theo tầng. Xem bảo mật dữ liệu trước khi ...' with 'hoa' in bold. This matches Expected for step 1.
    E3u-step2.png (1440, okr): the input reads 'dao tao'. The only group is 'Tài liệu' with one row, 'Đào tạo nhân viên mới', with 'Đào' in bold. There is no error alert and no other group. This matches Expected for step 2.
    E3u-step3.png (390x844, member): the input reads 'hoa hong'. The group 'Tài liệu' has one row, 'Quy định hoa hồng đối tác', with 'hoa' in bold and the excerpt truncated with an ellipsis. The palette fits within the width with margins and nothing is cut off horizontally. This matches Expected for step 3. The backdrop behind the palette is black in all frames and only the palette is visible. I take that to be the palette overlay in dark theme, and it does not contradict any assertion.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-tim-va-dieu-huong-kho-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_chen_lien_ket_ui
  verified_at: 2026-09-29T01:19:58Z
  output: |
    Ran 4 tests across 1 file. [1322.00ms]

- eval: E4b
  run_id: minted-tim-va-dieu-huong-kho-E4b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_chen_lien_ket_api
  verified_at: 2026-09-29T01:19:58Z

- eval: E4u
  run_id: minted-tim-va-dieu-huong-kho-E4u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_tim
  verified_at: 2026-09-29T01:19:58Z
  screenshot: evidence/E4u-step1.png
  observed: |
    E4u-step1.png (1440, đọc bằng Read): trang "Sửa trang", tên trang "Đào tạo nhân viên mới", nội dung "Nhân viên mới học cách làm trong tuần thứ việc.". Trên thanh công cụ, nút biểu tượng trang tài liệu ("Liên kết tới trang") đang được nhấn và mở hộp chọn. Ô tìm kiếm chứa "bao mat". Danh sách có "Bảo mật dữ liệu khách hàng" ở đầu và đang được đánh dấu; bên dưới còn "Nghỉ phép năm" và "Quy định hoa hồng đối tác" (hai dòng này không khớp "bao mat", đây là ghi chú, không phải điều kiện). Khớp Expected: hộp chọn có trang cần tìm.
    E4u-step2.png (390, đọc bằng Read): cùng trạng thái ở màn hẹp. Hộp chọn nằm gọn trong màn, có "Bảo mật dữ liệu khách hàng" đầu danh sách, không thấy tràn ngang.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-tim-va-dieu-huong-kho-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_nhac_toi
  verified_at: 2026-09-29T01:19:58Z

- eval: E5d
  run_id: minted-tim-va-dieu-huong-kho-E5d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_nhac_toi
  verified_at: 2026-09-29T01:19:58Z
  output: |
    Ran 3 tests across 1 file. [596.00ms]

- eval: E5u
  run_id: minted-tim-va-dieu-huong-kho-E5u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_tim
  verified_at: 2026-09-29T01:19:58Z
  screenshot: evidence/E5u-step1.png
  observed: |
    step1 (1440, tdk-nhac-toi-1440): màn đọc 'Bảo mật dữ liệu khách hàng'; dưới nội dung 'Không chia sẻ dữ liệu khách ra ngoài.' có tiêu đề 'Trang nhắc tới trang này (2)' và 2 dòng thẻ: 'Nghỉ phép năm — Làm ở nhà thì theo **quy tắc bảo mật** của công ty.' và 'Quy định hoa hồng đối tác — Tỉ lệ hoa hồng theo tầng. Xem **bảo mật dữ liệu** trước khi gửi số.'; tên trang nguồn và câu có chữ đậm, khớp expected (N>=2). Cột phải có 'Chủ trang Lê Thu Trang'. Nhận xét thẩm mỹ nhẹ: khung thẻ cao khoảng 320px có khoảng trống lớn dưới 2 dòng, không làm sai expected.
    step2 (390): cùng trang, khối 'Trang nhắc tới trang này (2)' nằm dưới nội dung (giữa 'Không chia sẻ...' và 'Chủ trang'), 2 dòng đầy đủ, không thấy cuộn ngang hay cắt chữ.
    step3 (rỗng, 'Trang không ai nhắc tới'): tiêu đề 'Trang nhắc tới trang này (0)' và giữa khung có chữ 'Chưa trang nào nhắc tới trang này.', khớp expected.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-tim-va-dieu-huong-kho-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_loc
  verified_at: 2026-09-29T01:19:58Z

- eval: E6d
  run_id: minted-tim-va-dieu-huong-kho-E6d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_loc
  verified_at: 2026-09-29T01:19:58Z

- eval: E7
  run_id: minted-tim-va-dieu-huong-kho-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_suc_khoe_lien_ket
  verified_at: 2026-09-29T01:19:58Z

- eval: E8
  run_id: minted-tim-va-dieu-huong-kho-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_suc_khoe_trang_thai
  verified_at: 2026-09-29T01:19:58Z

- eval: E8d
  run_id: minted-tim-va-dieu-huong-kho-E8d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_suc_khoe
  verified_at: 2026-09-29T01:19:58Z

- eval: E8u
  run_id: minted-tim-va-dieu-huong-kho-E8u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.tdk_man_suc_khoe
  verified_at: 2026-09-29T01:19:58Z
  screenshot: evidence/E8u-step1.png
  observed: |
    Đã mở từng frame thật bằng Read. Step1 (1440, tab Sức khoẻ, nền tối): tab "Sức khoẻ" gạch chân đang chọn, tab "Chờ duyệt" có huy hiệu 1; khối "Quá hạn xác minh" huy hiệu 2 với 2 thẻ (Quá hạn Q2 xác minh đến 22/09/2026, Quá hạn Q1 xác minh đến 28/09/2026); khối "Có đề xuất chờ duyệt" huy hiệu 1 với 1 thẻ (Sức khoẻ N1 nháp, 1 bản chờ duyệt); các khối còn lại nằm dưới nếp gấp (5 khối đã xác nhận bằng DOM), khớp mong đợi E7 (2 và 1 thấy rõ). Đầu trang: tiêu đề "Tài liệu" và các nút Tìm nhanh/Tải nguồn lên/Trang mới không đè lên nhau.
    Step2 (390): một cột, các nút xếp trên tiêu đề không đè lên nhau, không thấy cuộn ngang, cùng 2 khối và số 2/1 như 1440.
    Step3 (1440, tab Trang): chip loại (Tất cả 1, Quy định 1, Chính sách 0, Quy trình 0, Biểu mẫu 0), dropdown đơn vị "Phòng Kinh doanh", dropdown chủ trang "Lê Thu Trang", nút "Bỏ lọc"; bảng thu còn đúng 1 dòng "Lọc L1" (Quy định, Lê Thu Trang, Phòng Kinh doanh) - danh sách đã thu hẹp (URL mang lọc và tải lại giữ lọc do script bước 3 khẳng định: bước 3 đạt).
    Step4 (tab Chờ duyệt): huy hiệu 30, nhãn "Đang chờ", trang cuối hiện 5 dòng (4 Chờ duyệt nháp + 1 Sức khoẻ N1 nháp), chân trang "26-30 trong số 30", "2 / 2", nút Trước/Tiếp - khớp 25 dòng trang 1 + 5 dòng trang 2. Không mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E9
  run_id: mulzpbfxgca8
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_nhac_sang
  verified_at: 2026-09-29T01:19:58Z

- eval: E9b
  run_id: minted-tim-va-dieu-huong-kho-E9b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_nhac_bang_tab
  verified_at: 2026-09-29T01:19:58Z

- eval: E10
  run_id: minted-tim-va-dieu-huong-kho-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_ong_dung
  verified_at: 2026-09-29T01:19:58Z
  output: |
    Ran 8 tests across 1 file. [703.00ms]

- eval: E10d
  run_id: minted-tim-va-dieu-huong-kho-E10d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_ong_dung_doc
  verified_at: 2026-09-29T01:19:58Z
  output: |
    Ran 4 tests across 1 file. [706.00ms]

- eval: E11
  run_id: minted-tim-va-dieu-huong-kho-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_de_xuat_phan_trang
  verified_at: 2026-09-29T01:19:58Z

- eval: E11d
  run_id: minted-tim-va-dieu-huong-kho-E11d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.tdk_man_cho_duyet
  verified_at: 2026-09-29T01:19:58Z
  output: |
    Ran 2 tests across 1 file. [853.00ms]

- eval: E0s
  run_id: minted-tim-va-dieu-huong-kho-E0s-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.tdk_san_thiet_ke
  verified_at: 2026-09-29T01:19:58Z

- eval: E12j
  judged_by: hội đồng judge (fresh context), ba lăng kính: domain-correctness, operational-feasibility, spec-alignment
  verdict: UNCERTAIN
  rationale: Hai trên ba lăng kính chưa thể kết luận. Tab Sức khoẻ chỉ lộ 2 trên 5 danh sách trong khung ảnh; ở 390, hàng chip lọc trên tab Trang thiếu chip "Biểu mẫu" và chip cuối sát mép phải nên chưa rõ bị cắt hay cuộn ngang; nhãn "Có đề xuất chờ duyệt" và "1 bản chờ duyệt" lệch từ điển («Bản đề xuất»). Lăng kính spec-alignment cho PASS.
  panel:
    - domain-correctness: UNCERTAIN — Most screens read clearly and the dictionary terms match (Chủ trang, xác minh đến ngày, Bản đang dùng). Three things stop me from calling PASS. Tab Sức khoẻ shows only 2 of its 5 lists (the first is cut at the bottom of the frame). The 390 filter row on the Trang tab shows Tất cả, Quy định, Chính sách and Quy trình, with Biểu mẫu missing and the last chip flush against the right edge, so I cannot tell whether it is clipped or scrolls sideways. The heading "Có đề xuất chờ duyệt" and the text "1 bản chờ duyệt" do not use the dictionary's «Bản đề xuất»; «Đề xuất» is a separate entry for Trợ lý OKR. The evidence also cannot show what the name on a Chờ duyệt row means (proposer, chủ trang or approver).
    - operational-feasibility: UNCERTAIN — Most screens read clearly and use the CONTEXT.md terms (Chủ trang, xác minh đến ngày, Trang nhắc tới trang này, Bỏ lọc), and I saw no overlapping text in the 12 images. Two things stop a PASS. In tdk-loc-390.png the fifth chip "Biểu mẫu 0" (present in tdk-loc-1440.png) is missing after "Quy trình 0", so it is either clipped or reached by horizontal scroll. The Sức khoẻ tab shows only 2 of its 5 lists in both images, and no image shows the Nguồn area or the empty states.
    - spec-alignment: PASS — Trong 14 ảnh (hộp ⌘K, khối "Trang nhắc tới trang này (2)", tab Sức khoẻ, danh sách Kho có lọc, hộp chèn liên kết, Chờ duyệt trang 2) mỗi màn tự nói rõ việc của nó bằng nhãn và câu dẫn ngắn ("Việc chủ trang nên xem, theo từng danh sách", "xác minh đến 22/09/2026", "1 bản chờ duyệt", "Chủ trang", "26–30 trong số 30"). Nhãn khớp từ điển CONTEXT.md (chủ trang, bản đang dùng, xác minh đến ngày, Sức khoẻ). Ở cả 390 và 1440 không thấy cuộn ngang, cắt chữ hay chữ đè lên nhau. Các khoảng trống lớn dưới danh sách thẻ ở Sức khoẻ và khối nhắc tới chỉ là bố cục lỏng, không làm khó hiểu.
  required_evidence:
    - Ảnh chụp toàn trang (fullPage:true) của tab Sức khoẻ ở 1440 và 390, thấy đủ năm danh sách (quá hạn xác minh, có bản đề xuất chờ duyệt, liên kết gãy, được nhắc mà chưa có trang, trang mồ côi) kèm nhãn và trạng thái rỗng. Chạy lại eval ui-check cho tdk-suc-khoe với chụp fullPage vào _acceptance/tim-va-dieu-huong-kho/evidence/ (tên gợi ý tdk-suc-khoe-*-full.png).
    - Số đo ở 390 trên tab Trang (dùng seed như tdk-loc-390.png) gồm scrollWidth so với clientWidth của hàng chip loại (Tất cả / Quy định / Chính sách / Quy trình / Biểu mẫu) và document.documentElement.scrollWidth so với innerWidth, cùng một ảnh thấy chip Biểu mẫu (xuống dòng hoặc có dấu hiệu cuộn).
    - Dòng nguồn (messages / vi locale của apps/app) của nhãn «Có đề xuất chờ duyệt» và «1 bản chờ duyệt» trên tab Sức khoẻ, kèm mục trong CONTEXT.md cho phép «đề xuất» thay «bản đề xuất» ở màn này, hoặc đổi nhãn thành «Có bản đề xuất chờ duyệt».
    - Ảnh dòng Chờ duyệt (hoặc tooltip/nhãn) cho thấy tên người bên cạnh ngày nghĩa là gì, ví dụ «Người soạn» hay «Chủ trang».
    - Ảnh 390 của hộp chèn liên kết (tdk-chen-lien-ket-390.png) với mép phải nằm trong 390px, kèm nhãn hoặc placeholder cho biết hộp làm gì (ở ảnh hiện tại hộp kết thúc ở x≈389 và không thấy nhãn).
  human_override: Đạt — Phan Le Manh 2026-09-29

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bun_run_test-r2
  exit_code: 0
  verified_at: 2026-09-29T01:19:58Z

- cmd: bunx turbo run lint --force
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-09-29T01:19:58Z

- cmd: bun run lint:slop
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-09-29T01:19:58Z

- cmd: bunx turbo run build --force
  run_id: minted-tim-va-dieu-huong-kho-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-09-29T01:19:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

E0s: pass cả trên code cũ lẫn code mới (baseline green), nên nó chứng minh bộ đo chứ chưa chứng minh tính năng. Đây là cổng thiết kế tĩnh có chủ ý (regression-guard); chiều đỏ của nó dựa vào bản sao thêm className, không dựa vào diff của tính năng. Mọi eval máy khác của tính năng đều red trên baseline (có phân biệt); các eval ui-check không chạy được trên baseline (n-a).

## Variance

none — mọi eval đều chạy một lần, xác định; không eval nào có pass_rate lẫn.

## Iterations

Round 1: BLOCKED (commit 895dfe7e) — vòng đầu không ra kết quả chạy trọn; đã sửa ở 143216f0 (một luật duyệt, đầu trang không đè ở 390) rồi đưa ảnh màn vòng 2 vào hồ sơ ở 0fe5a080.
Round 2: mọi eval máy đạt, lệnh suite đạt; E12j UNCERTAIN (hội đồng chưa thấy đủ năm danh sách Sức khoẻ, chip Biểu mẫu ở 390, nhãn lệch từ điển). Verdict PENDING-JUDGMENT, chờ người quyết ở Cổng 2.

### Re-pin lần 1 — 2026-09-29, do gộp onehub (#204) vào nhánh trước khi mở PR
run_id: repin-20260929T014426Z-19569
sha: 0e97c6c04e50b432ae1472e6828d8248540e6752 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E3u, E4u, E5u, E8u, E12j (E12j không khai paths)

### Re-pin lần 2 — 2026-10-01, do hoa cu sau khi gop onehub (#230) va thuoc bi cham boi tro-ly-doc-kho
run_id: repin-20261001T235038Z-61043
sha: 58f8fb3ff0bedc55cea6a773c79628a69fb5f838 · suites: 4 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E3u, E4u, E5u, E8u, E12j (E12j không khai paths) · diff chạm vật đo ngoài làn máy: E3u, E4u, E5u, E8u — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 3 — 2026-10-04, do hoá cũ sau khi gộp onehub #247 vào PR #231, đổi tên migration, vá ba xung đột ngầm
run_id: repin-20261004T060523Z-75459
sha: 80fea3400e5c375fb68ed9df1c79280ca748b079 · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E3u, E4u, E5u, E8u, E12j (E12j không khai paths) · diff chạm vật đo ngoài làn máy: E3u, E4u, E5u, E8u — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 4 — 2026-10-04, do khai paths lô 2: chỉ thêm khoá paths vào evals.yaml
run_id: repin-20261004T075112Z-36317
sha: 11bd93cf9f3488a2ed6df5c432a362feff41a428 · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E3u, E4u, E5u, E8u, E12j

### Re-pin lần 5 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T141023Z-83923
sha: 4893629a5ff0068f0b3a0fc09523a037c7c953b7 · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E3u, E4u, E5u, E8u, E12j · diff chạm vật đo ngoài làn máy: E3u, E5u, E8u, E12j — chưa chứng lại, đi vòng S4 delta

### Re-pin lần 6 — 2026-10-04, do gộp onehub sau khi khai paths lô 2
run_id: repin-20261004T161003Z-91842
sha: 0d03129ecfa5bdbcff83dee9706a511e342f399c · suites: 7 lệnh exit 0 · evals: 20/20 eval máy đạt kỳ vọng · ngoài làn máy: E3u, E4u, E5u, E8u, E12j · diff chạm vật đo ngoài làn máy: E3u, E4u, E5u, E8u — chưa chứng lại, đi vòng S4 delta
