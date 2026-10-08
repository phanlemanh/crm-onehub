---
schema_version: 2
feature_slug: dong-thoi-gian-giu-khi-loi
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3e22135231b7a075cd6851c59304f74720367599
human_signoff:
---

# Evidence Report: dong-thoi-gian-giu-khi-loi

Round 1. Mọi eval máy xanh; còn một mục judgment (E7) chờ người quyết ở Cổng 2.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-6 | judgment | UNCERTAIN |

## Evidence

- eval: E1
  run_id: minted-dong-thoi-gian-giu-khi-loi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_xem_cu
  verified_at: 2026-10-08T11:39:40Z
  output: |
    Ran 1 test across 1 file. [1075.00ms]

- eval: E2
  run_id: minted-dong-thoi-gian-giu-khi-loi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_thu_lai
  verified_at: 2026-10-08T11:39:40Z
  output: |
    Ran 1 test across 1 file. [1384.00ms]

- eval: E3
  run_id: minted-dong-thoi-gian-giu-khi-loi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_lam_moi
  verified_at: 2026-10-08T11:39:40Z
  output: |
    Ran 1 test across 1 file. [1390.00ms]

- eval: E4
  run_id: minted-dong-thoi-gian-giu-khi-loi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_dong_thoi_gian
  verified_at: 2026-10-08T11:39:40Z
  output: |
    Ran 1 test across 1 file. [1.51s]

- eval: E5
  run_id: minted-dong-thoi-gian-giu-khi-loi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_en
  verified_at: 2026-10-08T11:39:40Z
  output: |
    Ran 1 test across 1 file. [1.52s]

- eval: E6
  run_id: minted-dong-thoi-gian-giu-khi-loi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dtg_man
  verified_at: 2026-10-08T11:39:40Z
  screenshot: evidence/E6-step1.png   # frames: E6-step1.png, E6-step2.png, E6-step3.png
  observed: |
    Frame 1 (1440): tab "Hoạt động" hiển thị đến "Ghi chú gọi khách số 30", không có dòng thứ 31; cuối danh sách có khung "Không tải được hoạt động cũ hơn." kèm nút "Thử lại" trong khung nhìn, không có khung lỗi "Không tải được hoạt động". Khớp Expected.
    Frame 2 (1440, sau khi bỏ chặn và bấm "Thử lại"): thông báo lỗi biến mất, danh sách nối tiếp có "Ghi chú gọi khách số 31" và tiêu đề ngày "THỨ 4, 30 THG 9, 2026"; khớp bản in "35 dong" của lệnh.
    Frame 3 (390, bottom-sheet): danh sách cuộn tới số 30, khung "Không tải được hoạt động cũ hơn." và nút "Thử lại" hiện trọn trong khung nhìn, không cắt ngang, không thanh cuộn ngang. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Chạy qua tien-de.mjs, phiên đo riêng (kho dùng-một-lần, app và api cổng tự do, tự dọn, cổng đóng sau lượt).
    "dong-thoi-gian-giu-khi-loi man: dat"; buoc 1 dat ("xem cu: 30 dong -> loi giu 30 dong -> thu lai 35 dong"); buoc 2 dat (scrollWidth trang và ngăn không vượt clientWidth, nút trong khung nhìn).
    Ba ảnh evidence_required tồn tại; mỗi ảnh đã mở bằng Read và khớp Expected. Không có E6-network.txt vì driver không đọc được network.

- eval: E7
  judged_by: judge-subagent (fresh context), ba lăng kính domain-correctness / operational-feasibility / spec-alignment
  verdict: UNCERTAIN
  rationale: Điểm 1 và 2 đạt ở cả 1440 và 390 (12 hoạt động đã tải vẫn hiện nguyên, chỉ có một dòng "Không tải được hoạt động cũ hơn." và một nút "Thử lại", không lỗi thô, không khung lỗi thay danh sách). Điểm 3 chỉ đạt một nửa vì ảnh sau thử lại cắt trước cuối danh sách. Điểm 4 chưa kết luận được vì ở 390 hàng nút soạn và hàng tab lọc bị cắt chữ, ảnh không cho biết đó là dải cuộn ngang có chủ đích hay tràn.
  required_evidence:
    - Ảnh dtg-sau-thu-lai-1440 chụp sau khi cuộn tới cuối danh sách (thấy mục 35) và không còn dòng "Không tải được hoạt động cũ hơn." hay nút "Thử lại"; lấy bằng cách chạy lại răng màn E6, cuộn vùng cuộn của sheet xuống đáy rồi chụp sau khi bấm Thử lại.
    - Số đo DOM ở 390 trong bản chụp lỗi (document.documentElement.scrollWidth bằng 390) và hai hàng bị cắt (hàng nút soạn, hàng tab lọc) có overflow-x là auto hoặc scroll với scrollWidth lớn hơn clientWidth, kèm ảnh sau khi cuộn ngang hai hàng đó; lấy bằng javascript_exec trong Playwright của răng màn E6 hoặc nhật ký đo của nó.
    - Văn bản AC-6 trong contract.md nói rõ phạm vi "không bị cắt chữ hay nút" chỉ tính cho dải lỗi cuối danh sách hay cho cả hàng tab và hàng nút phía trên.
  human_override:  # chi nguoi ghi

### Judge panel (đề xuất, ba phiếu cùng một hướng)

- domain-correctness: UNCERTAIN — (1) và (2) đạt: ảnh lỗi 1440 giữ nguyên 12 hoạt động đã tải (số 19–30), dòng cuối "Không tải được hoạt động cũ hơn." kèm một nút "Thử lại" duy nhất, không lỗi thô, khớp ai-ux.md mục 7. (3) đạt một nửa: có mục 31 nối vào dưới "THỨ 4, 30 THG 9, 2026" và dòng lỗi đã rời chỗ cũ, nhưng ảnh cắt ở y=900 nên không thấy mục 32–35, không xác nhận được thông báo lỗi đã hết hẳn. (4) chưa chắc: ở 390 hàng nút soạn bị cắt thành "Vi…" và tab lọc cắt ở "Đã xong"; dòng lỗi và nút "Thử lại" vừa khung.
- operational-feasibility: UNCERTAIN — Điểm 1 và 2 đạt ở cả 1440 và 390. Điểm 3 chưa chứng minh được: ảnh sau thử lại dừng ở số 31 nên chưa chắc dòng lỗi đã mất. Điểm 4 chưa rõ: ở 390 hàng nút bị cắt thành "Vi…" và hàng tab thành "Đã xon…", ảnh không cho biết dải cuộn ngang có chủ đích hay tràn ngang.
- spec-alignment: UNCERTAIN — Đạt (1) và (2). (3) đạt một nửa vì khung ảnh cắt trước cuối danh sách. (4) chưa kết luận được vì ở 390 hàng nút "Việc cần làm" chỉ hiện "Vi" và hàng tab "Đã xong" sát mép; cần xác định phạm vi chữ AC-6 "không bị cắt chữ hay nút" có tính cho hai hàng phía trên hay chỉ cho dải lỗi cuối danh sách.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

- cmd: bunx turbo run lint --force
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

- cmd: bun run lint:slop
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

- cmd: bunx turbo run build --force
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-08T11:39:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried từ round trước — baseline không đo lại round này.

Không có eval nào xanh trên cả HEAD lẫn baseline cần liệt kê. Các lệnh suite xanh cả hai phía là regression-guard bình thường.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E6 xanh, ba phiếu judge E7 cùng UNCERTAIN (ảnh sau thử lại chưa thấy cuối danh sách; hàng nút và hàng tab bị cắt chữ ở 390 chưa rõ có chủ đích). Chờ người quyết ở Cổng 2.
