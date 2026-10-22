---
schema_version: 2
feature_slug: o-tep-dien-thoai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ff483289ad8e6140ba13e2b500f2da48c20af62c
human_signoff: manh 2026-10-22 — ký Cổng Bằng chứng trên S4 vòng 1 PASS (wf_14873b26-b74, verified_commit ff483289a; 6/6 eval, 7/7 suite, 0 phát hiện trong hợp đồng). Ngoài-1, 2, 3 ghi Known limits; đồng ý phần cắt/hoãn; phê hết các quyết định Treo.
---

# Evidence Report: o-tep-dien-thoai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-o-tep-dien-thoai-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.otdt_man
  verified_at: 2026-10-22T18:01:14Z
  runs: 1
  output: |
    Frame đã lưu: E1-step1.png (bản sao otdt-phieu-rong-375.png); các ảnh khác do răng lưu: otdt-phieu-co-tep-375.png, otdt-phieu-rong-1280.png, otdt-nguon-375.png, otdt-nguon-1280.png (cùng thư mục evidence).
    Mạng: driver là răng script (không có công cụ đọc network trong phiên này) nên không có E1-network.txt; ghi n-a (driver).
    Không có dev server tự start ngoài phiên đo của tien-de.mjs (đã tự dọn).
  screenshot: evidence/E1-step1.png
  observed: |
    Đã mở E1-step1.png / otdt-phieu-rong-375.png (khổ 375×812): phiếu Thoả thuận T1, thẻ Tổng quan. Thấy nhãn trường «Hợp đồng (thử DA19 khổ hẹp)» (một dòng, không bị cắt), dòng «Chưa có tệp.», rồi khung nét đứt, trong khung nút «+ Chọn tệp» nằm TRÊN cùng, bên dưới là hai dòng chữ: «Kéo tệp vào đây» (in đậm, một dòng) và «PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp» (một dòng). Khối chữ chiếm hết bề rộng trong khung, không có chữ nào đứng riêng một dòng hay bị bẻ hẹp cạnh nút. Khớp Expected. Số đo của răng khớp ảnh: nutTren=true, dongNhan=1, dongMoTa=1, rongChu=299/trong=299. Ngoài phạm vi: ở dưới có biểu tượng nổi (N, avatar) đè nhẹ lên dòng đầu mục MÔ TẢ, không thuộc [data-slot="nguon-keo-tha"].
  network_observed: n-a (driver)

- eval: E2
  run_id: minted-o-tep-dien-thoai-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.otdt_man
  verified_at: 2026-10-22T18:01:14Z
  runs: 1
  output: |
    Frame đã lưu: E2-step1.png, E2-step2.png (cả hai là bản sao của otdt-phieu-rong-375.png); ảnh gốc của lượt chạy: otdt-phieu-rong-375.png, otdt-phieu-rong-1280.png, otdt-phieu-co-tep-375.png, otdt-nguon-1280.png, otdt-nguon-375.png.
    Network: răng puppeteer, không có tool đọc network nên networkObserved = n-a (driver); ghi chú ở E2-network.txt.
    Chiều đỏ trên onehub 830d82e1f không chạy lại trong eval này.
  screenshot: evidence/E2-step1.png
  observed: |
    Đã mở otdt-phieu-rong-375.png (cũng là E2-step1.png và E2-step2.png, bản sao cùng một ảnh vì cả hai bước đều dùng ảnh này). Phiếu «Thoả thuận T1» ở 375 hẹp. Hàng Tệp: nhãn «Hợp đồng (thử DA19 khổ hẹp)» hiện trọn chữ trên một dòng riêng, không bị cắt. Ngay dưới là «Chưa có tệp.», rồi khung nét đứt dùng trọn bề ngang (nút «Chọn tệp» ở trên, «Kéo tệp vào đây» và dòng mô tả bên dưới). Nhãn căn trái cùng lề với phần giá trị bên dưới. Các hàng Công ty và Phụ trách phía trên vẫn xếp hai cột. Ảnh khớp Expected.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-o-tep-dien-thoai-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.otdt_man
  verified_at: 2026-10-22T18:01:14Z
  runs: 1
  output: |
    NETWORK: driver là script do-man.mjs chạy qua tien-de.mjs, không có công cụ đọc network/console, nên ghi n-a (driver) tại E3-network.txt.
    Lượt đo kết thúc sạch (phien-do: xong). Còn tiến trình tien-de.mjs/phien-do.mjs khởi lúc 1:02–1:03 AM trong ps thuộc eval song song khác, không tắt.
  screenshot: evidence/E3-step1.png
  observed: |
    Đã mở E3-step1.png bằng Read (khổ 375×812, phiếu Thoả thuận T2 otdt). Dưới nhãn «Hợp đồng (thử DA19 khổ hẹp)» nằm trên một dòng riêng, phần giá trị dùng trọn bề ngang. Dòng tệp là thẻ có viền: tên «Hợp đồng hợp tác An Phú — bản ký chính thức có phụ lục giá năm 2026.pdf» bị cắt bằng dấu … ở cuối dòng tên ('Hợp đồng hợp tác An Phú — bản ký chính t…'). Dòng dưới ghi cỡ '24KB · 22 thg 10, 2026 · bởi manh.phan', hàng cuối thẻ có hai nút «Mở» và «Xoá» (icon + chữ). Ngay dưới thẻ tệp là khung nét đứt xếp dọc: nút «+ Chọn tệp» ở trên, rồi «Kéo tệp vào đây» một dòng, và «PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp» một dòng, không chữ nào đứng riêng. Không thấy thanh cuộn ngang, không phần tử nào tràn mép phải phiếu. Khớp Expected. Ảnh chỉ chụp tới phần giữa phiếu, các phần phía dưới bị cắt theo khung chụp, không ảnh hưởng.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-o-tep-dien-thoai-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.otdt_man
  verified_at: 2026-10-22T18:01:14Z
  runs: 1
  output: |
    Frame da luu: evidence/otdt-phieu-rong-1280.png (goc), E4-step1.png, E4-step2.png (ban sao, step 1 cung luot E1 chua co anh rieng; step 2 la anh dang xet). Chieu do (basis-full) khong nam trong steps, khong chay.
    Network: driver la script do hinh hoc + anh, khong co doc network -> n-a (driver), khong tao E4-network.txt.
    Ghi chu phu (khong thuoc Expected cua E4): nhan truong o cot trai bi cat thanh 'Hợp đồng (thử D…' (nhanCat=true) do nhan thu trong du lieu mau dai.
  screenshot: evidence/E4-step2.png
  observed: |
    E4-step2.png (= otdt-phieu-rong-1280.png, 1280x900, da Read): tam phieu thoa thuan 'Thoả thuận T1 otdt' mo ben phai (nen toi). Muc CHI TIET: hang nhan cot trai 'Hợp đồng (thử D…' (x~431, bi cat), gia tri 'Chưa có tệp.' o cot gia tri (x~552) -> nhan nam ben trai phan gia tri. Duoi la khung net dut: nut '+ Chọn tệp' o ben trai (x~570-660, y~449-477) va khoi chu 'Kéo tệp vào đây' / 'PDF, DOCX, PNG, JPG · tối đa 20 MB · 10 tệp' dat canh nut (trai khoi chu x~672 >= phai nut ~660; khoang doc 446-482 chong len khoang doc cua nut). Khong xep doc, khong chu dung rieng dong. Khop Expected: nhan cot trai, nut Chon tep canh 'Kéo tệp vào đây'. So do rang khop anh: nhanTrai=true, cungHang=true.
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-o-tep-dien-thoai-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.otdt_man
  verified_at: 2026-10-22T18:01:14Z
  runs: 1
  output: |
    375: tranHop=false (scrollWidth hop <= clientWidth+1) va trangRong=375 <= 375 (khong co 'nguon 375 cuon ngang'): PASS
    375 nguon: nutTren=true, rongChu 277/277
    Frames da luu: E5-step1.png (= otdt-nguon-1280.png), E5-step2.png (= otdt-nguon-375.png), thu muc evidence. E5-network.txt ghi chu driver puppeteer khong co duong doc network. Server do la cua phien do, da tat.
  screenshot: evidence/E5-step1.png
  observed: |
    E5-step1.png (1280x900): hop thoai «Tải nguồn lên» o giua, mo ta mot dong ben duoi tieu de. Vung keo tha nen net dut: nut «+ Chọn tệp» ben trai, ngay canh phai la khoi chu «Kéo tệp vào đây» (mot dong) va «Word (.docx) hoặc PDF, tới 20 MB» (mot dong), cung hang ngang, khong xep doc, vung gon. Duoi la nhom radio Trang moi / Cap nhat trang dang dung, Ten trang, ba o chon Loai trang / Don vi / Chu trang, nut Huy va Tai len. Khop Expected 1280.
    E5-step2.png (375x812): hop «Tải nguồn lên», mo ta hai dong. Vung nét đứt gon: nut «+ Chọn tệp» tren, duoi no «Kéo tệp vào đây» mot dong va «Word (.docx) hoặc PDF, tới 20 MB» mot dong, khong chu nao dung rieng mot dong. Cac o form xep doc, nut Tai len / Huy day ngang, khong thanh cuon ngang, khong cat chu. Khop Expected 375 (nhan 1 dong, mo ta 1 <= 2 dong, khong cuon ngang). Khong thay mau thuan voi Expected o ca hai anh.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-o-tep-dien-thoai-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.otdt_dom
  verified_at: 2026-10-22T18:01:14Z
  runs: 1
  output: |
    Chặn «bài cũ bị sửa» đạt: năm tệp bài DOM không đổi so với merge-base origin/onehub.
    Ran 15 tests across 3 files. [1.86s]

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-o-tep-dien-thoai-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-o-tep-dien-thoai-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-o-tep-dien-thoai-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-o-tep-dien-thoai-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

- cmd: bunx turbo run lint --force
  run_id: minted-o-tep-dien-thoai-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

- cmd: bun run lint:slop
  run_id: minted-o-tep-dien-thoai-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

- cmd: bunx turbo run build --force
  run_id: minted-o-tep-dien-thoai-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-22T18:01:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

Không phân biệt (green trên cả HEAD lẫn baseline): E6. Đây là regression-guard có chủ ý: AC-6 đòi năm bài DOM có từ trước vòng chạy nguyên và không bị sửa, nên xanh trên cả hai phía là kết quả đúng của nó, không phải lỗi harness.

Baseline không đo: E1, E2, E3, E4, E5 (baseline n-a). Máy không đo baseline cho các eval ui-check này; chiều đỏ của chúng được khai trong evals.yaml (đo trên onehub 830d82e1f hoặc bản sao đột biến), không do máy đo lại ở lượt này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E6 và bảy lệnh suite đều đạt, không có eval hỏng. Ba mục ngoài hợp đồng (công cụ đo) ghi ở review-findings.md để người quyết ở Cổng 2.
