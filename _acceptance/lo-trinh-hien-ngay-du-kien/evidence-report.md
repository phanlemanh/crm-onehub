---
schema_version: 2
feature_slug: lo-trinh-hien-ngay-du-kien
verdict: REJECT
failed_evals: [E9]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9c286aa175c408695618eba7aaf679759ec480b1
human_signoff:
---

# Evidence Report: lo-trinh-hien-ngay-du-kien

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
| E9 | AC-8 | ui-check | FAIL |
| E10 | AC-8 | test | PASS |
| E11 | AC-5 | judgment | PASS (đề xuất của hội đồng, chờ người điền human_override) |
| E12 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lo-trinh-hien-ngay-du-kien-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_ban_chep
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 2 tests across 1 file. [58.00ms]

- eval: E2
  run_id: minted-lo-trinh-hien-ngay-du-kien-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldk_khuon
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 5 tests across 1 file. [63.00ms]

- eval: E3
  run_id: minted-lo-trinh-hien-ngay-du-kien-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_co_ngay
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 2 tests across 1 file. [2.18s]

- eval: E4
  run_id: minted-lo-trinh-hien-ngay-du-kien-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_so_do
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 2 tests across 1 file. [1.78s]

- eval: E5
  run_id: minted-lo-trinh-hien-ngay-du-kien-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_qua_tai
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 2 tests across 1 file. [1.98s]

- eval: E6
  run_id: minted-lo-trinh-hien-ngay-du-kien-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_chua_co
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 2 tests across 1 file. [1.93s]

- eval: E7
  run_id: minted-lo-trinh-hien-ngay-du-kien-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_viec
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 6 tests across 1 file. [3.95s]

- eval: E8
  run_id: minted-lo-trinh-hien-ngay-du-kien-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_ban_cu
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 4 tests across 1 file. [2.18s]

- eval: E9
  run_id: minted-lo-trinh-hien-ngay-du-kien-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.script.ldk_do_man
  verified_at: 2026-10-17T15:55:01Z
  screenshot: evidence/E9-step1.png
  observed: |
    step1 (dong-goi-moc-1280-vi, 1280x900, nen sang): trang Lo trinh kieu Moc, 4 moc dau (Kho cho nguoi 1 thg 10, Noi dung vao nhanh, Tim duoc, Lan R1 va xong tren production) tat ca «Đã giao»; khong thay chu «dự kiến» hay co nao. step2 (dong-goi-moc-375-en, 375x812): "Roadmap", Shipped, 2-3 moc dau; khong co «Expected». step3-6 (ban-chup-moc-375 vi/en x sang/toi): cung dau trang, 2-3 moc dau «Đã giao»/«Shipped»; nen toi doc duoc, nhung khong co ngay du kien, khong co co. step7-10 (ban-chup-moc-1280 vi/en x sang/toi): cung 4 moc dau da giao; khong co «dự kiến»/«Expected», khong co co; nen toi co tuong phan on, khong chong chu. step11 (ban-chup-ngan-375-vi): ngan ho so viec DH2 mo toan man: «Ngày dự kiến — Dự kiến xong 15 thg 10, 2026», chip «ước sơ bộ», hai co «sau ngày mục tiêu», «đã qua ngày dự kiến», chu bi cat o day khung nhin, khong chong chu. step12 (ban-chup-ngan-1280-en): ngan DH2 voi «Expected date: Expected by Oct 15, 2026», chip «rough estimate», co «after target date» va «past expected date», giai thich «Estimated by the system when the milestone started...», «Effort estimate 4–6.5 machine hours rough estimate»; doc duoc, khong chong chu. Tom lai: chi 2 anh ngan (step11-12) cho thay noi dung du kien; 10 anh con lai khong chua phan tu can kiem.
  network_observed: n-a (driver)
  output: |
    Phiên đo riêng (kho crm_lo_trinh_hien_ngay_du_kien_1f947b_do, app :4746, api :4770), tự dọn khi xong.
    Dòng kết luận của máy: "KET LUAN: 12 DUNG, 0 SAI" — các khẳng định dựa trên DOM đều đúng ở cả 12 ô.
    Đối chiếu mắt (bước 3) trên 12 ảnh E9-step1..12.png: sai ở 10 ảnh mốc và đóng gói (step1-10).
    Cả 10 ảnh là ảnh đầu trang (fullPage không mở rộng vì trang cuộn trong khung bên trong), chỉ thấy 4 mốc đầu đã giao.
    Không ảnh nào trong 10 ảnh đó chứa chữ «dự kiến»/«Expected», cờ chưa-đủ-số-đo / quá-tải / đã-qua hay câu cách tính.
    Kỳ vọng «ngày dự kiến đọc được cạnh chữ dự kiến, có dễ nhìn ở nền tối, không chữ nào chồng lên nhau» không kiểm chứng được bằng mắt ở nền sáng lẫn nền tối của 8 ô mốc và 2 ảnh đóng gói.
    Hai ảnh ngăn hồ sơ (step11, step12) đạt: đọc được, không chồng chữ.
    Đề nghị của người đối chiếu: chụp phần tử hoặc cuộn tới mốc M (scrollIntoView), hoặc chụp vùng chứa timeline thay vì fullPage.

- eval: E10
  run_id: minted-lo-trinh-hien-ngay-du-kien-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ldk_khoi_that
  verified_at: 2026-10-17T15:55:01Z
  output: |
    Ran 3 tests across 1 file. [108.00ms]

- eval: E11
  judged_by: judge-subagent panel (fresh context) — đề xuất, chưa có người chốt
  verdict: PASS
  rationale: Cả ba lăng kính cùng cho PASS — mọi chuỗi hiện ngày mang chữ «dự kiến»/«Expected», ba câu lý do không có từ nội bộ, hai ngôn ngữ cùng nghĩa.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

  Phiếu từng lăng kính (không giấu bất đồng nào — cả ba cùng PASS):
  - domain-correctness: PASS — (1) Hai chuỗi hiện ngày đều có chữ «dự kiến»/«Expected»: vi `Dự kiến xong ${ngay}` và `dự kiến ${ngay}`, en `Expected by ${ngay}` và `expected ${ngay}`. Câu cách tính nói rõ là ước tính và nêu giả định chỉ mình mốc đang chạy. Vi: «Máy tính lúc mốc bắt đầu (…), coi như chỉ mình mốc này đang chạy. Đây là ước tính, không phải cam kết.» En: «…as if it were the only milestone running. Not a commitment.» Khớp mục «Lời ước, không phải cam kết» của tệp thiết kế («máy tính lúc mốc bắt đầu, coi như chỉ mình mốc ấy đang chạy»). (2) Ba câu lyDo không chứa từ nội bộ kit, khối, dự báo hay giờ máy, và nói được điều đang xảy ra. «Bản lộ trình này chưa mang ngày dự kiến.» «Máy đặt ngày khi việc đầu tiên của mốc được mở; mốc này chưa có việc nào mở từ lúc máy bắt đầu tính ngày.» «Ngày dự kiến trong dữ liệu lộ trình không đọc được.» (3) Bản en khớp nghĩa với bản vi ở cả ba lyDo. Ví dụ «This copy of the roadmap does not carry expected dates yet.» và «The system sets the date when the first item of the milestone starts; none has started since it began doing so.» Các chuỗi còn lại cũng khớp: `quaTai` «after target date», `daQua` «past expected date», `chuaDuSoDoMoTa`. Hai điểm lệch nhỏ không đổi verdict. Vi nói «việc … được mở», en nói «starts». Ngoài lyDo, `gio` hiện «giờ máy» / «machine hours», nằm ngoài phạm vi câu hỏi nên không tính.
  - operational-feasibility: PASS — (1) Mọi chuỗi hiện ngày đều có «Dự kiến xong» / «dự kiến» / «Expected by» / «expected». Câu cachTinh nói rõ ước tính và giả định chỉ một mốc chạy: «Máy tính lúc mốc bắt đầu (${ngay}), coi như chỉ mình mốc này đang chạy. Đây là ước tính, không phải cam kết.» và «Estimated by the system when the milestone started (${ngay}), as if it were the only milestone running. Not a commitment.», khớp mục «Lời ước, không phải cam kết». (2) Ba câu lyDo («Bản lộ trình này chưa mang ngày dự kiến.», «Máy đặt ngày khi việc đầu tiên của mốc được mở; …», «Ngày dự kiến trong dữ liệu lộ trình không đọc được.») không chứa kit, khối, du-bao hay gio_may. Từ «Máy» chưa được giải thích nhưng không thuộc danh sách từ cấm. (3) Các cặp vi/en (chuaDuSoDo, quaTai, daQua, chuaCo, gio, lyDo, chuaDuSoDoMoTa) cùng nghĩa.
  - spec-alignment: PASS — (1) Hai chuỗi hiện ngày đều mang chữ «dự kiến»/«Expected»: vi `ngay: "Dự kiến xong ${ngay}"` và `ngayGon: "dự kiến ${ngay}"`, en `"Expected by ${ngay}"` và `"expected ${ngay}"`. Chuỗi `cachTinh` nói rõ đây là ước tính và nêu giả định chạy một mình. Bản vi: «Máy tính lúc mốc bắt đầu (${ngay}), coi như chỉ mình mốc này đang chạy. Đây là ước tính, không phải cam kết.» Bản en: "…as if it were the only milestone running. Not a commitment." Cả hai khớp mục «Lời ước, không phải cam kết» của tệp thiết kế. (2) Ba `lyDo` không chứa từ nội bộ nào trong danh sách cấm (kit, khối, du-bao, gio_may). Ví dụ vi: «Bản lộ trình này chưa mang ngày dự kiến.», «Máy đặt ngày khi việc đầu tiên của mốc được mở; mốc này chưa có việc nào mở từ lúc máy bắt đầu tính ngày.», «Ngày dự kiến trong dữ liệu lộ trình không đọc được.» Với trưởng phòng ban, các câu này đủ nói chuyện gì đang xảy ra, dù chữ «Máy» hơi trừu tượng. (3) Bản vi và en cùng nghĩa ở từng cặp: «sau ngày mục tiêu» và "after target date", «đã qua ngày dự kiến» và "past expected date", «giờ máy» và "machine hours", «không phải cam kết» và "Not a commitment". Chỉ lệch nhỏ «mở» và "starts", không đổi nghĩa.

- eval: E12
  run_id: minted-lo-trinh-hien-ngay-du-kien-E12-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldk_day
  verified_at: 2026-10-17T15:55:01Z
  output: |
    test-run: dropped crm_mvckvoklshwp_test

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-17T15:55:01Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 1
  verified_at: 2026-10-17T15:55:01Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-17T15:55:01Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-17T15:55:01Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 1
  verified_at: 2026-10-17T15:55:01Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-17T15:55:01Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-hien-ngay-du-kien-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-17T15:55:01Z

### Lệnh fail không gắn eval

Hai lệnh suite đỏ không gắn eval nào. Máy chưa chẩn đoán nguyên nhân; người đọc output ở run-log trước khi kết luận.

- `bun run test -- --filter=app --filter=@crm/ui`: 882 test qua, 2 test đỏ trên 89 tệp — «kho chuoi cua vong ③a > moi ham ghep bien co khang dinh, va so ham bang so khang dinh» và «khoa chet > moi khoa da khai deu co cho goi, tru ban khai CHUA_NOI». Gói app#test đỏ, các gói còn lại trong lượt chạy xanh.
- `bunx turbo run lint --force`: gói app#lint đỏ với 1 lỗi, 34 cảnh báo, 20 thông tin. Phần cuối output cho thấy khác biệt định dạng ở các mảng `dung_tren` trong một tệp JSON (output không in tên tệp). 10 trên 11 tác vụ lint xanh.

Lệnh `ui-check:E9` đỏ và đã gắn với E9 ở trên.

## Known limits

## Ngoài hợp đồng

## Analyst

Non-discriminating: none — không eval nào xanh trên cả bản cũ lẫn HEAD. E2 và E12 đỏ trên baseline (có phân biệt). Tám eval test còn lại và E9 (ui-check) không đo được baseline (n-a); lý do ở mục dưới. Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

### Baseline khong do

- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-du-kien.spec.ts -t ban-chep: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.spec.ts co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t co-ngay: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.dom.tsx co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-du-kien.spec.ts -t so-do && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t so-do: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.spec.ts co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-du-kien.spec.ts -t qua-tai && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t qua-tai: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.spec.ts co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-du-kien.spec.ts -t chua-co && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t chua-co: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.spec.ts co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t viec: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.dom.tsx co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd packages/validation && bun test test/ban-chup-lo-trinh.spec.ts -t gio-may && cd ../../apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-du-kien.spec.ts -t ban-cu && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/lo-trinh-du-kien.dom.tsx -t ban-cu: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.spec.ts co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-du-kien.spec.ts -t khoi-that && TZ=UTC bun test ./test/lo-trinh-du-kien.spec.ts -t khoi-that: bo qua baseline: tep apps/app/test/lo-trinh-du-kien.spec.ts co o cay dang kiem nhung chua co o merge-base 9dfdf062845daed5298e251d10a33501b1640527 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lượt, không eval nào có pass_rate lẫn.

## Iterations

Round 1: E9 failed — máy báo 12 dòng đúng, nhưng 12 ảnh đối chiếu mắt đều là ảnh đầu trang (fullPage không mở rộng vì trang cuộn trong khung bên trong), 10 ảnh mốc và đóng gói không chứa phần tử ngày dự kiến nên kỳ vọng nhìn thấy ở nền sáng và nền tối không chứng được; hai ảnh ngăn hồ sơ đạt. Hai lệnh suite đỏ không gắn eval (test app/@crm/ui hai ca, lint app một lỗi). Review còn sáu mục trong hợp đồng về phép đo yếu (E12, E2, E9, E7, E3) và một mục ngoài hợp đồng, xem review-findings.md. Returned to implementation.
