---
schema_version: 2
feature_slug: dong-thoi-gian-giu-khi-loi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a28380e0ace0a15732fe3f690237593816a0f31e
human_signoff: Phan Le Manh 2026-10-08 — ký Cổng Bằng chứng trên vòng chấm 3 (7/7 eval đạt, 7/7 lệnh suite xanh, hội đồng E7 đạt, 0 phát hiện trong hợp đồng; ba vòng không đo đường nền). Bảy mục ngoài hợp đồng định đoạt từng mục — Ngoài-1, 2, 5 mở hợp đồng mới (cùng gốc cờ lỗi TanStack); Ngoài-3, 4, 6, 7 ghi Known limits. Phạm vi cắt/hoãn đồng ý như đã khai; các quyết định ghi sau Cổng Phạm vi được phê toàn bộ.
---

# Evidence Report: dong-thoi-gian-giu-khi-loi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-6 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-dong-thoi-gian-giu-khi-loi-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_xem_cu
  verified_at: 2026-10-08T13:31:45Z
  output: |
    Ran 1 test across 1 file. [943.00ms]

- eval: E2
  run_id: minted-dong-thoi-gian-giu-khi-loi-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_thu_lai
  verified_at: 2026-10-08T13:31:45Z
  output: |
    Ran 1 test across 1 file. [1.56s]

- eval: E3
  run_id: minted-dong-thoi-gian-giu-khi-loi-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_lam_moi
  verified_at: 2026-10-08T13:31:45Z
  output: |
    Ran 1 test across 1 file. [1083.00ms]

- eval: E4
  run_id: minted-dong-thoi-gian-giu-khi-loi-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.kts_dong_thoi_gian
  verified_at: 2026-10-08T13:31:45Z
  output: |
    Ran 1 test across 1 file. [1231.00ms]

- eval: E5
  run_id: minted-dong-thoi-gian-giu-khi-loi-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.dtg_en
  verified_at: 2026-10-08T13:31:45Z
  output: |
    Ran 1 test across 1 file. [954.00ms]

- eval: E6
  run_id: minted-dong-thoi-gian-giu-khi-loi-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.dtg_man
  verified_at: 2026-10-08T13:31:45Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1 / dtg-xem-cu-loi-1440.png: ngan ca nhan «Lan Phạm kzkssoz» mo o tab Hoat dong (1440), cac dong ghi chu «Ghi chú gọi khách số 20» ... «số 30» (30 dong, tu CN 4 THG 10 den THU 5 1 THG 10), cuoi danh sach co thong bao «Không tải được hoạt động cũ hơn.» kem nut «Thử lại»; khong co khung «Không tải được hoạt động»; chip «Tất cả 35» la tong so, dong hien 30. Khop Expected.
    E6-step2 / dtg-sau-thu-lai-1440.png: sau Thử lại, danh sach cuon toi day, hien den «Ghi chú gọi khách số 35» (THU 4 30 THG 9) nam trong khung nhin, khong con thong bao loi / «Thử lại». Khop Expected (35 dong).
    E6-step3 / dtg-xem-cu-loi-390.png: ngan dang bottom-sheet o 390 rong; tab bar va hang chip loc («Tất cả 35 ... Đã x» bi cat nhung cuon ngang duoc); danh sach den «số 30», thong bao «Không tải được hoạt động cũ hơn.» va nut «Thử lại» nam tron trong khung nhin, khong tran ngang trang. Khop Expected.
    E6-step4 / dtg-390-cuon-ngang.png: hai hang nut/chip da cuon ngang toi cuoi: hang nut hien «Cuộc gọi, Email, Cuộc họp, Việc cần làm», hang chip hien «cả 35, Ghi chú 35, Email, Cuộc họp, Sắp tới, Đã xong»; «Việc cần làm» va «Đã xong» nam trong khung nhin; thong bao + «Thử lại» van thay. Khop Expected.
  network_observed: n-a (driver)

### Judgment

- eval: E7
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba góc nhìn cùng chấm đạt. Danh sách hoạt động vẫn nguyên khi «Xem cũ hơn» lỗi, dòng «Không tải được hoạt động cũ hơn.» kèm đúng một nút «Thử lại»; sau thử lại hoạt động 31–35 nối vào; ở 390 trang không tràn và hai dải nút cuộn ngang được tới «Việc cần làm» và «Đã xong».
  human_override:  # chi nguoi ghi

Phiếu của hội đồng (đề xuất, người quyết ở Cổng 2):

- domain-correctness: PASS — (1) Ở dtg-xem-cu-loi-1440.png danh sách vẫn còn nguyên (hoạt động 20–30 theo ngày), không bị thay bằng khung lỗi hay chỗ trống. (2) Cuối danh sách có một dòng «Không tải được hoạt động cũ hơn.» kèm đúng một nút «Thử lại», không có lỗi thô, khớp ai-ux mục 7. (3) dtg-sau-thu-lai-1440.png cho thấy hoạt động 31–35 nối vào, dòng cuối là số 35, thông báo lỗi đã hết. (4) Ở 390 dòng lỗi và «Thử lại» nằm gọn trong khung. Dải nút và dải tab lọc vượt khung nhưng cuộn ngang được: ảnh dtg-390-cuon-ngang.png cho thấy «Việc cần làm» và «Đã xong» hiện đủ sau khi cuộn. dtg-do-390.txt xác nhận trang 390/390 không tràn và không phần tử nào bị cắt mà không cuộn được.
- operational-feasibility: PASS — Ở ảnh lỗi (1440 và 390) danh sách hoạt động 20–30 (26–30 ở 390) vẫn hiện nguyên, và dòng cuối ghi «Không tải được hoạt động cũ hơn.» kèm đúng một nút «Thử lại» (outline, nhỏ, không icon) như docs/ai-ux.md mục 7. Ảnh sau thử lại ở 1440 có hoạt động 31–35 nối vào với đề mục ngày mới, dòng cuối là số 35 và không còn thông báo lỗi. Ở 390, trang không tràn ngang (scrollWidth 390/390); hai dải nút và dải lọc bị cắt ở mép lúc đầu nhưng cuộn ngang được (ảnh dtg-390-cuon-ngang.png hiện «Việc cần làm» và «Đã xong»), và số đo ghi «khong phan tu nao bi cat ma khong cuon duoc».
- spec-alignment: PASS — Ảnh lỗi 1440 vẫn hiện danh sách hoạt động 20–30 kèm dòng «Không tải được hoạt động cũ hơn.» và đúng một nút «Thử lại», không có lỗi thô hay khung lỗi thay chỗ danh sách (khớp ai-ux.md mục 7). Ảnh sau thử lại nối tiếp hoạt động 31–35 và dòng lỗi đã mất. Ở 390 chỉ có hai dải nút/tab cắt ở mép nhưng cuộn ngang được (ảnh cuộn ngang cho thấy «Việc cần làm» và «Đã xong» tới được), trang 390/390 không tràn, số đo ghi «không phần tử nào bị cắt mà không cuộn được».

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_api-r3
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_app_filter_crm_ui-r3
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_agent_filter_crm_aut-r3
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_test_filter_agent_okr_filter_crm-r3
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

- cmd: bunx turbo run lint --force
  run_id: ""
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

- cmd: bun run lint:slop
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bun_run_lint_slop-r3
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

- cmd: bunx turbo run build --force
  run_id: minted-dong-thoi-gian-giu-khi-loi-SUITE-bunx_turbo_run_build_force-r3
  exit_code: 0
  verified_at: 2026-10-08T13:31:45Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round truoc — baseline khong do lai round nay. Khong eval nao bi liet ke la khong-phan-biet; moi eval may ghi baseline n-a vi round nay khong do lai.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh; E7 chờ người quyết vì ba phiếu chưa chốt điểm (4) về hai hàng bị cắt ở 390 (nút soạn «Việc cần làm», hàng lọc «Đã xong») và E3 chưa đo vị trí «phía trên». Trả về thực thi.
Round 2: E3 đã đo vị trí «phía trên» (commit 6da22975b); thêm bằng chứng E7 (đáy danh sách, số đo 390) và ghi số đo hai hàng bị cắt vào dtg-do-390.txt; mọi eval máy xanh, ba phiếu E7 cùng chấm đạt. Ba phát hiện AC-6 trong hợp đồng (E7 bị viết hẹp giữa S4, răng màn đo tràn 390 mà vẫn đậu, số đo «cuộn ngang được» luôn sai) trả về thực thi.
Round 3: hai hàng nút ở 390 cuộn ngang được và răng màn đo cắt cho mọi phần tử (commit 199cd8fb0); E1–E6 xanh, E6 có thêm khung E6-step4 chụp hai dải đã cuộn tới cuối, ba phiếu E7 cùng chấm đạt, bảy lệnh suite xanh. Ba phát hiện ngoài hợp đồng chuyển người quyết ở Cổng 2.

### Re-pin lần 1 — 2026-10-08, do hoá cũ do gộp onehub 6f59c0ad sau chữ ký; K6c đổi timeline.tsx trong vùng đo của K6b
run_id: repin-20261008T151524Z-47744
sha: 6622a94ec8d3e85f889f747a27e0d8b3297edbd1 · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7 (E7 không khai paths) · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-08, do hoá cũ do gộp onehub 942bf18f (#318)
run_id: repin-20261008T155533Z-97411
sha: a04af4bf268544df69929f890dce6b3ad52bc23a · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7 (E7 không khai paths) · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-08, do ghim lại sau chữ ký K6e và gộp onehub 0422d797 (timeline.tsx đổi sau pin K6c, K6b; buocKe bỏ return null)
run_id: repin-20261008T234356Z-75588
sha: e7509b2c373bb4a6a8a5fce45e2c82a26e098ebc · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7 (E7 không khai paths) · diff chạm vật đo ngoài làn máy: E6 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 4 — 2026-10-09, do ghim lại sau gộp onehub 0b62cebb9 (#324)
run_id: repin-20261009T010037Z-31258
sha: a28380e0ace0a15732fe3f690237593816a0f31e · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7 (E7 không khai paths) · AC không có chốt máy: AC-6 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
