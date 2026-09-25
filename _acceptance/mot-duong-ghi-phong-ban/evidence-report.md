---
schema_version: 2
feature_slug: mot-duong-ghi-phong-ban
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f6ff38da0423df968af03c2dea294f98df0c6fee
human_signoff:
---

# Evidence Report: mot-duong-ghi-phong-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | script | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E6b | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E7b | AC-6 | test | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | judgment | UNCERTAIN |
| E10 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: mugef51mz51z
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_go_duong_cu
  verified_at: 2026-09-25T03:25:42Z
  output: |
    Ran 1 test across 1 file. [953.00ms]
    test-run: dropped crm_mugef51mz51z_test

- eval: E2
  run_id: minted-mot-duong-ghi-phong-ban-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mdg_mot_cho_ghi_api
  verified_at: 2026-09-25T03:25:42Z
  output: |
    quet: 986 tep, 12 lenh ghi phong ban
    chieu do apps/api/src/onboarding/onboarding.service.ts: bat 1 vi pham moi
    EXIT_CODE=0

- eval: E3
  run_id: minted-mot-duong-ghi-phong-ban-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_luat_luu_tru
  verified_at: 2026-09-25T03:25:42Z
  output: |
     71 expect() calls
    Ran 5 tests across 1 file. [1137.00ms]
    test-run: dropped crm_mugef6h9516x_test

- eval: E4
  run_id: mugef4n02vph
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_luat_xoa_han
  verified_at: 2026-09-25T03:25:42Z
  output: |
     56 expect() calls
    Ran 2 tests across 1 file. [1355.00ms]
    test-run: dropped crm_mugef4n02vph_test

- eval: E5
  run_id: mugef4wvfix6
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_xoa_duoc_mot_noi
  verified_at: 2026-09-25T03:25:42Z
  output: |
     43 expect() calls
    Ran 1 test across 1 file. [1289.00ms]
    test-run: dropped crm_mugef4wvfix6_test

- eval: E6
  run_id: mugefg931ovo
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_quyen_ba_thu_tuc
  verified_at: 2026-09-25T03:25:42Z
  output: |
    Ran 1 test across 1 file. [1098.00ms]
    test-run: dropped crm_mugefg931ovo_test
    EXIT_CODE: 0

- eval: E6b
  run_id: minted-mot-duong-ghi-phong-ban-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ttc_quyen
  verified_at: 2026-09-25T03:25:42Z
  output: |
     147 expect() calls
    Ran 2 tests across 1 file. [2.19s]
    test-run: dropped crm_mugef4ii2xct_test

- eval: E7
  run_id: minted-mot-duong-ghi-phong-ban-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_man_goi_org
  verified_at: 2026-09-25T03:25:42Z
  output: |
     0 fail
     16 expect() calls
    Ran 1 test across 1 file. [856.00ms]

- eval: E7b
  run_id: minted-mot-duong-ghi-phong-ban-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.mdg_luat_luu_tru
  verified_at: 2026-09-25T03:25:42Z
  output: |
     71 expect() calls
    Ran 5 tests across 1 file. [1137.00ms]
    test-run: dropped crm_mugef6h9516x_test

- eval: E8
  run_id: minted-mot-duong-ghi-phong-ban-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mdg_mot_cho_ghi_app
  verified_at: 2026-09-25T03:25:42Z
  output: |
    quet: 986 tep, 0 cho goi duong ghi cu
    chieu do apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx: bat 1 vi pham moi
    chieu do apps/agent/agent/agent.ts: bat 1 vi pham moi

- eval: E10
  run_id: minted-mot-duong-ghi-phong-ban-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.mdg_ho_so_da_ghim
  verified_at: 2026-09-25T03:25:42Z
  output: |
    sinh: bai-kiem-da-ky.diff (14 tep), bai-kiem-dem.md
    chieu do: cau-truc-to-chuc: lan ghim co eval do · ho-so-gia: bi cham ma chua ghim lai
    khang dinh: 33, loi: 0

### Lệnh suite (hồi quy)

- cmd: bun run test
  run_id: mugef3615bnz
  exit_code: 0
  verified_at: 2026-09-25T03:25:42Z

- cmd: bunx turbo run lint --force
  run_id: minted-mot-duong-ghi-phong-ban-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-09-25T03:25:42Z

- cmd: bun run lint:slop
  run_id: minted-mot-duong-ghi-phong-ban-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-09-25T03:25:42Z

- cmd: bunx turbo run build --force
  run_id: minted-mot-duong-ghi-phong-ban-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-09-25T03:25:42Z

### Judgment (chưa chốt)

- eval: E9
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: UNCERTAIN
  rationale: Cả ba lens đều UNCERTAIN — không lens nào có căn cứ để bác bỏ diff/bảng đếm (không khẳng định nào bị bỏ hay nới), nhưng vế "mỗi hồ sơ có dòng revisit nhắc tên tệp kiểm của nó" của AC-7 không kiểm được vì sổ quyết định của chín hồ sơ không nằm trong Input được cấp cho phiên chấm. Xem từng vote dưới đây — không lược, không viết lại.
  votes:
    - domain-correctness: UNCERTAIN — Diff và bảng đếm (bai-kiem-dem.md) không cho thấy khẳng định nào bị bỏ hay đếm ít đi — mọi thay đổi bám sát đường gọi/đường gieo, hai câu ở AC-3, và ngoại lệ đã duyệt cho "tên trống". Nhưng vế thứ hai của câu hỏi ("mỗi hồ sơ có dòng revisit nhắc tên tệp kiểm của nó") không thể kiểm vì sổ quyết định của chín hồ sơ không nằm trong danh sách input được cấp cho phiên chấm này; đồng thời việc thêm ba mục org.archiveDepartment/restoreDepartment/purgeDepartment vào bảng `dungDauVaoHopLe` của `apps/api/test/to-chuc.spec.ts` (không chỉ ở vai-chi-okr.spec.ts) nằm ngoài phạm vi mà chữ AC-7 nêu tên ("...vào bảng của bài kiểm rút thủ tục từ router (vai-chi-okr)").
      required_evidence:
        - Sổ quyết định (decision log) của cả chín hồ sơ — dieu-phoi-30-ngay-dau, test-api-khong-de-viec-vo-chu, quan-ly-danh-muc-30-ngay, noi-bon-nut-dieu-phoi, khuon-mat-bo-phan, sua-luu-tru-dieu-phoi, cau-truc-to-chuc, to-chuc-danh-sach-chi-tiet, vai-chi-okr — mỗi hồ sơ phải có một dòng `revisit` nhắc đúng tên tệp kiểm nó bị chạm; các file này không có trong Input nên chưa kiểm được.
        - Xác nhận (trong contract.md hoặc sổ quyết định của cau-truc-to-chuc) rằng việc thêm ba mục org.archiveDepartment/restoreDepartment/purgeDepartment vào bảng `dungDauVaoHopLe` của apps/api/test/to-chuc.spec.ts (dòng ~934-940 của diff) được phép — vì chữ AC-7 chỉ nêu tên vai-chi-okr cho loại bổ sung này, không nêu to-chuc.spec.ts.
    - operational-feasibility: UNCERTAIN — Đối chiếu `bai-kiem-da-ky.diff` với `bai-kiem-dem.md` và các thay đổi được phép liệt kê trong `contract.md`/design doc, vế thứ nhất của AC-7 (không khẳng định nào bị bỏ hay nới ngoài các thay đổi cho phép) có căn cứ ủng hộ: số expect/ok mỗi tệp giữ nguyên hoặc tăng (không tệp nào giảm), các thay đổi quan sát được đều là đổi đường gieo/đường gọi (`onboarding.*` → `org.*`), thêm hậu tố tên gieo, hai câu từ chối đổi đúng khớp mục 5 của design doc, và ngoại lệ "tên trống bị từ chối" khớp đúng quyết định d-20260924T154916Z-16 đã duyệt. Nhưng vế thứ hai của câu hỏi (mỗi hồ sơ có dòng `revisit` nhắc tên tệp kiểm của nó) không thể kiểm vì sổ quyết định của chín hồ sơ đã ký không nằm trong danh sách Input được phép đọc cho eval này.
      required_evidence:
        - Sổ quyết định (decision log, ví dụ _acceptance/<slug>/quyet-dinh.md hoặc decisions.md) của từng hồ sơ trong chín hồ sơ AC-7 liệt kê (dieu-phoi-30-ngay-dau, test-api-khong-de-viec-vo-chu, quan-ly-danh-muc-30-ngay, noi-bon-nut-dieu-phoi, khuon-mat-bo-phan, sua-luu-tru-dieu-phoi, cau-truc-to-chuc, to-chuc-danh-sach-chi-tiet, vai-chi-okr), cho thấy một dòng revisit nêu tên tệp kiểm của chính hồ sơ đó đã đổi và vì sao — nếu thiếu dù chỉ một hồ sơ, verdict đổi sang FAIL.
    - spec-alignment: UNCERTAIN — Diff (bai-kiem-da-ky.diff) và bảng đếm (bai-kiem-dem.md, không tệp nào giảm số expect/ok) cho thấy mọi thay đổi trong 14 tệp kiểm chỉ nằm trong phạm vi AC-7 cho phép: đường gieo/đường gọi đổi sang org.*, tên gieo thêm hậu tố riêng, hai câu đổi đúng khớp AC-3, gỡ giả lập của thủ tục đã mất, thêm đầu vào hợp lệ cho vai-chi-okr, và ngoại lệ đã duyệt cho noi-bon-nut-dieu-phoi — không thấy khẳng định nào đổi đối tượng, nới quan hệ hay giảm ô ma trận. Nhưng câu hỏi AC-7 còn vế "mỗi hồ sơ có dòng revisit nhắc tên tệp kiểm của nó", và danh sách Input được cấp cho eval này không có sổ quyết định (decision log) của chín hồ sơ — nên vế đó không có căn cứ để phán, và theo luật phạm vi của eval này tôi không được tự đi tìm file đó.
      required_evidence:
        - (judge không nêu bằng-chứng-thiếu — ghi chú nguồn: vote gốc của lens này lẫn một đoạn tag hỏng (`</rationale>` + `<parameter name="required_evidence">...`) trong trường rationale, chép nguyên trạng ở trên vì luật "không lược, không viết lại"; trường required_evidence chính thức mà judge trả về chỉ có giá trị placeholder này)
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

E6b — pass trên cả HEAD lẫn baseline (`bun run test -- "cd apps/api && bun test test/to-chuc.spec.ts -t quyen"`, baseline: green). Đây là regression-guard cho danh sách quyền rút từ `src/generated/server.ts` chứ không tự phân biệt tính năng mới của round này; giới hạn đo cụ thể (tuyên quét lớp, không ma trận viết trước, đọc file sinh ra thay vì router đang chạy) đã ghi ở review-findings.md mục "Hình dạng 5 ... ở E6b" — không phải AC thất bại vì AC-1 đã được E1 chứng đúng trên router đang chạy.

## Variance

none — every multi-run eval is uniform (không eval nào mang `runs` > 1 trong round này).

## Iterations

Round 1: 11 eval feature (E1–E8, E10) + 4 lệnh suite hồi quy đều PASS trên HEAD (mã f6ff38da0423df968af03c2dea294f98df0c6fee), mọi baseline red trừ E6b (green, đã ghi ở Analyst). E9 (AC-7, judgment) UNCERTAIN ở cả ba lens — panel đề xuất UNCERTAIN, người quyết ở Gate 2 vì thiếu sổ quyết định (decision log) của chín hồ sơ đã ghim để đối chiếu dòng revisit theo tên tệp kiểm.