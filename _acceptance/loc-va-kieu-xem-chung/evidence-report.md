---
schema_version: 2
feature_slug: loc-va-kieu-xem-chung
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: effdc8c5ccef6244c2c7b694b31e69ff1c0cb62c
human_signoff: Phan Le Manh 2026-10-15
---

# Evidence Report: loc-va-kieu-xem-chung

Round 2. Nội dung thay toàn bộ round cũ; lịch sử round nằm ở mục Iterations. E2, E4, E5, E6 chuyển tiếp từ round 1 (delta không chạm paths của chúng).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E7m | AC-7 | script | PASS |
| E7j | AC-7 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-loc-va-kieu-xem-chung-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_dem
  verified_at: 2026-10-15T05:57:53Z
  output: |
    Ran 6 tests across 1 file. [826.00ms]

- eval: E2
  run_id: minted-loc-va-kieu-xem-chung-E2-r1
  exit_code: 0
  verifier: config:executors.test.lkx_quet
  verified_at: 2026-10-15T05:08:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-loc-va-kieu-xem-chung-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.lkx_trang_thai
  verified_at: 2026-10-15T05:57:53Z
  output: |
    Ran 3 tests across 1 file. [1460.00ms]

- eval: E4
  run_id: minted-loc-va-kieu-xem-chung-E4-r1
  exit_code: 0
  verifier: config:executors.test.lkx_kieu_xem
  verified_at: 2026-10-15T05:08:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-loc-va-kieu-xem-chung-E5-r1
  exit_code: 0
  verifier: config:executors.test.lkx_tai_lieu
  verified_at: 2026-10-15T05:08:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-loc-va-kieu-xem-chung-E6-r1
  exit_code: 0
  verifier: config:executors.test.lkx_duong_dan
  verified_at: 2026-10-15T05:08:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-loc-va-kieu-xem-chung-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lkx_man
  verified_at: 2026-10-15T05:57:53Z
  screenshot: /Users/manh-macmini/dev/crm/.claude/worktrees/blissful-jepsen-65fb89/.acceptance-runs/loc-va-kieu-xem-chung/evidence/E7-thoa-thuan-360.png
  observed: |
    thoa-thuan-360: tieu de 'Thoả thuận', o tim, nut 'Lọc' dang mo (chevron len) cho thay chip 'Tất cả 30', 'Đang mở 19', 'Đã chốt 11' voi so dem la chu phu xam nhat, o chon kieu xem 'Bảng' (dropdown, khong co nhom nut), cac nut Lọc/Sắp xếp/Cột (7)/Đã lưu trữ xep doc, bang DataTable bi cat ngang trong khung cuon (duoc phep), khong tran trang. thoa-thuan-1280: chip 'Tất cả 30 / Đang mở 19 / Đã chốt 11' cung dang vien, so dem chu phu; nhom nut 'Bảng' (dang chon) / 'Bảng cột'; khong o chon; bang day du 12 hang, 3 hang mau lkx o dau, khong tran ngang. onboarding-360: '30 ngày đầu', chip 'Đang chạy 1' / 'Đã đóng 0' cung dang chip nhu Thoa thuan, so dem chu phu; kieu xem la o chon 'Bảng cột' (khong nhom nut); the Kanban 'Gọi chào 1' voi 'Đối tác mẫu lkx'. onboarding-1280: chip 'Đang chạy 1', 'Đã đóng 0', nut 'Lọc', cac chip loc 'Bước đang tắc/Phòng ban/Bậc phễu/Trạng thái/Người được giao'; nhom nut 'Bảng' / 'Bảng cột' (dang chon Bảng cột) cung dang voi Thoa thuan; khong o chon. tai-lieu-360: 'Tài liệu', thanh the con, chip 'Tất cả 3 / Quy định 1 / Chính sách 1 / Quy trìn...' (hang chip cuon ngang, duoc phep), 2 o chon 'Mọi đơn vị', 'Mọi chủ trang', nut 'Đã lưu trữ', ba the danh sach (Item) Quy trình/Chính sách/Quy định mẫu lkx; khong co ViewSwitch. tai-lieu-1280: chip 'Tất cả 3, Quy định 1, Chính sách 1, Quy trình 1, Biểu mẫu 0, Chiến lược 0' cung dang chip, so dem chu phu; bang 3 hang khop 3 loai; khong ViewSwitch. Khong co phan tu nao bi cat ngoai mep man o 360 ngoai bang va hang chip. Tat ca khop Expected.
  network_observed: n-a (driver)
  output: |
    Buoc 2: thoa-thuan mo ?status=closed -> chip bat 'Đã chốt'; onboarding ?trangThai=da-dong -> chip bat 'Đã đóng'; tai-lieu ?loai=chinh-sach -> chip bat 'Chính sách'. PASS.
    Du 6 anh, moi anh mo bang Read.
    Frame luu o .acceptance-runs/loc-va-kieu-xem-chung/evidence/: lkx-{thoa-thuan,onboarding,tai-lieu}-{360,1280}.png va ban sao E7-{cung ten}.png. Vong S4 chep sang _acceptance/loc-va-kieu-xem-chung/evidence/.

- eval: E7m
  run_id: minted-loc-va-kieu-xem-chung-E7m-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lkx_man_do
  verified_at: 2026-10-15T05:57:53Z
  output: |
    phien-do: xong — mã 0

- eval: E7j
  judged_by: judge panel 3 lens (fresh context), de xuat PASS
  verdict: PASS
  rationale: Đề xuất của hội đồng là PASS (hai lens PASS, một lens UNCERTAIN). Ý (1), (2), (4) khớp trên ảnh; ý (3) chưa kết luận được từ ảnh tĩnh. Người quyết ở Cổng 2.
  votes:
    - domain-correctness: UNCERTAIN — Các ý (1), (2) và (4) khớp trên ảnh. Chip ba màn cùng viền, cùng chiều cao 28px, cùng khoảng cách 8px, số đếm xám nhạt hơn nhãn. ViewSwitch là nhóm nút ở 1280 và ô chọn ở 360 trên cả Thoả thuận lẫn Onboarding. Bảng trạng thái ST-thoa-thuan-loc, ST-onboarding-loc, ST-tai-lieu-loc hiện đủ chip, số đếm và điều khiển. Ý (3) chưa kết luận được. Ở 360, hàng chip của Tài liệu bị cắt ở chip «Quy trìn» sát mép, mà Tài liệu không có khối lọc gập và design doc chỉ khai vùng cuộn ngang cho hàng chip trong khối lọc của Thoả thuận. Ảnh tĩnh không cho biết đây là vùng cuộn được hay bị cắt cứng. Việc số đếm không mờ (opacity 1) cũng không đo được từ điểm ảnh.
    - operational-feasibility: PASS — Chip lọc của ba màn cùng dạng (viền outline, chữ nhỏ, cùng chiều cao; chip đang chọn viền xanh; số đếm xám phụ, không mờ nhoè) ở cả 1280 lẫn 360. Thoả thuận và Onboarding đều dùng nhóm nút ở 1280 (Bảng / Bảng cột; năm lựa chọn «Chia cột theo» ở Onboarding) và ô chọn ở 360. Ở 360 chỉ bảng Thoả thuận và hàng chip Tài liệu bị cắt mép, đúng hai vùng cuộn ngang đã khai; các hàng chip điều khiển, Onboarding và Item Tài liệu không phần tử nào tràn. Cả ba hàng trong bảng trạng thái (ST-thoa-thuan-loc, ST-onboarding-loc, ST-tai-lieu-loc) đều hiện đúng.
    - spec-alignment: PASS — Chip lọc ở cả ba màn cùng dạng (viền, chữ, khoảng đệm), số đếm xám phụ, không mờ nhoè. Chuyển kiểu xem ở Thoả thuận và Onboarding là nhóm nút ở 1280 và ô chọn ở 360. Ở 360 chỉ bảng Thoả thuận và hàng chip Tài liệu bị cắt ở mép, đúng hai vùng cuộn ngang đã khai; các phần tử khác nằm gọn trong khung. Ba bảng trạng thái ST khớp ảnh: «Tất cả 30» bằng 19 + 11, Onboarding có «Đang chạy 1» và «Đã đóng 0» cùng nhóm «Chia cột theo» ở Bảng cột, Tài liệu có chip loại kèm ô đơn vị, chủ trang và nút lưu trữ.
  required_evidence:
    - Số đo DOM ở khổ 360 của màn Tài liệu › Trang: phần tử bọc hàng chip loại có overflow-x là auto hoặc scroll và scrollWidth lớn hơn clientWidth, kèm xác nhận document.documentElement.scrollWidth bằng 360. Lấy từ đầu ra của bàn đo màn (bun run do:man) hoặc bài DOM apps/app ghi vào .acceptance-runs/loc-va-kieu-xem-chung/. Nếu hàng này là vùng cuộn thì ý (3) đạt; nếu là overflow hidden hoặc không cuộn được thì ý (3) không đạt.
    - Hoặc một mục trong design doc 2026-10-14-loc-va-kieu-xem-chung-design.md, mục Hành vi, khai rõ hàng chip của Tài liệu ở 360 là vùng cuộn ngang. Khi đó chip bị cắt ở mép là hợp lệ.
    - Màu và độ mờ tính ra (getComputedStyle color và opacity) của span data-slot=toggle-group-item-count ở cả ba màn, từ bàn đo màn thật. Cần color là muted-foreground và opacity là 1 để chốt ý (1) «chữ phụ, không mờ nhoè».
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_api-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_app_filter_crm_ui-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_agent_filter_crm_aut-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_test_filter_agent_okr_filter_crm-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

- cmd: bunx turbo run lint --force
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bunx_turbo_run_lint_force-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

- cmd: bun run lint:slop
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bun_run_lint_slop-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

- cmd: bunx turbo run build --force
  run_id: minted-loc-va-kieu-xem-chung-SUITE-bunx_turbo_run_build_force-r2
  exit_code: 0
  verified_at: 2026-10-15T05:57:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Ghi chú: ba eval dưới đây không đo được baseline nên không kết luận phân biệt hay không.

### Baseline khong do

- cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx: bo qua baseline: tep packages/ui/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 15000 --preload ../../packages/ui/test/setup-dom.ts ./test/loc-va-kieu-xem.dom.tsx -t trang-thai: bo qua baseline: tep apps/app/test/loc-va-kieu-xem.dom.tsx co o cay dang kiem nhung chua co o merge-base 02ed3aec046978d3faddef46b5470284496ed6c5 — eval moi, chay tren code cu khong phan biet gi
- bash _acceptance/tieu-de-cot-doc-tron/rang/mot-luot.sh "bun _acceptance/loc-va-kieu-xem-chung/rang/chup-loc.mjs --chi-do": baseline vuot tran 180 giay/lenh — da dung ca cay tien trinh; BLOCKED ha tang, khong phai ket qua cua code cu

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: REJECT — AC-1 có một phát hiện trong hợp đồng: nút «Lọc» trên máy tính của DataTableFacetMenu còn làm mờ số đếm bằng opacity-60. Quay lại triển khai, sửa ở 2a5781033, chụp lại ba màn ở 360 và 1280.
Round 2: PASS — E1, E3, E7, E7m chạy lại và đạt; E2, E4, E5, E6 chuyển tiếp từ round 1; E7j đề xuất PASS, người quyết ở Cổng 2.

### Re-pin lần 1 — 2026-10-15, do #418 gộp onehub fbc6c9375; sửa chỗ cấy đột biến (a) của viec-chung
run_id: repin-20261015T130914Z-83813
sha: effdc8c5ccef6244c2c7b694b31e69ff1c0cb62c · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E7, E7j (E7j không khai paths) · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
