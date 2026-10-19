---
schema_version: 2
feature_slug: lo-trinh-dong-bo-ho-so
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dbe02024a6bfa2872ff5473f2f29815684fdaa51
human_signoff: Manh Phan 2026-10-10
---

# Evidence Report: lo-trinh-dong-bo-ho-so

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | ui-check | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-lo-trinh-dong-bo-ho-so-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.ldb_khung
  verified_at: 2026-10-10T10:40:26Z
  output: |
    Ran 1 test across 1 file. [1.68s]

- eval: E2
  run_id: ui:E2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_do_man
  verified_at: 2026-10-10T10:40:26Z
  screenshot: evidence/E2-step1.png
  observed: |
    ngan-viec-1280.png: ngăn trượt từ phải, rộng khoảng 870px trên màn 1280; tiêu đề «Tôi viết được một trang, gửi chủ trang duyệt, cả công ty đọc được bản đang dùng» cùng dòng phụ «l1 · Kho tài liệu» và nút đóng; dưới đó là dải 4 ô ngăn bằng vạch: Trạng thái (Đã giao), Mốc (1 thg 10, 2026), Lộ trình (Kho tài liệu), Nhóm (Không nhóm); thân có tiêu đề mục CHI TIẾT chữ hoa nhỏ, không có Card.
    ngan-thoa-thuan-1280.png: cùng khung ngăn rộng khoảng 870px, tiêu đề «Nhà Đất Thủ Đức — Comp AI», cùng dải 4 ô (Giá trị, Ngày dự kiến chốt, Ở giai đoạn, Phụ trách) và cùng kiểu tiêu đề mục chữ hoa nhỏ (GIAI ĐOẠN, CHI TIẾT). Hai ngăn cùng bề rộng, cùng kiểu tiêu đề, cùng dải ô: khớp expected.
  network_observed: n-a (driver)

- eval: E3
  run_id: minted-lo-trinh-dong-bo-ho-so-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_do_man
  verified_at: 2026-10-10T10:40:26Z
  screenshot: evidence/E3-step1.png
  observed: |
    ngan-viec-375.png (rộng 375): ngăn kéo trượt từ dưới lên phủ hết bề ngang, có tay kéo là thanh nhỏ ở giữa mép trên; tiêu đề câu giao, dòng «l1 · Kho tài liệu», nút đóng, dải 4 ô (Trạng thái Đã giao, Mốc 1 thg 10 2026, Lộ trình Kho tài liệu, Nhóm Không nhóm) và mục CHI TIẾT; không tràn ngang.
    ngan-thoa-thuan-375.png: cũng là ngăn kéo có tay kéo, tiêu đề «Nhà Đất Thủ Đức — Comp AI», dải ô, thẻ Tổng quan / Cá nhân / Hoạt động / Kara. Khớp expected.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-lo-trinh-dong-bo-ho-so-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_do_man
  verified_at: 2026-10-10T10:40:26Z
  screenshot: evidence/E4-step2.png
  observed: |
    Ảnh 375px trang /lo-trinh thẻ Tất cả, bảng Việc / Mốc: bốn hàng đầu hiện cột Mốc đầy đủ ngày «1 thg 10, 2026», «6 thg 10, 2026», «8 thg 10, 2026», «12 thg 10, 2026» căn phải, không bị cắt, không dấu ba chấm, không tràn mép phải bảng, không thanh cuộn ngang. Khớp expected (ô mốc trọn vẹn ở 375).
  network_observed: n-a (driver)

- eval: E5
  run_id: minted-lo-trinh-dong-bo-ho-so-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_do_man
  verified_at: 2026-10-10T10:40:26Z
  screenshot: evidence/E5-step2.png
  observed: |
    Trang Lộ trình ở 1280px, chip «Bảng cột» đang bật, bốn cột Chưa bắt đầu 29, Đang làm 1, Đã giao 84, Khác 3. Chữ câu giao và mã trong mọi thẻ nhìn thấy đều căn lề trái, dòng đầu bắt đầu sát mép trong thẻ; không thẻ nào căn giữa. Khớp expected.
  network_observed: n-a (driver)

- eval: E6
  run_id: minted-lo-trinh-dong-bo-ho-so-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_do_man
  verified_at: 2026-10-10T10:40:26Z
  screenshot: evidence/da-bac-tat.png
  observed: |
    da-bac-tat.png (1280x900, nền tối, tab Bảng): nút «Đã bác» ở trạng thái tắt, viền xám mờ, nền trong, chữ xám; bảng việc hiện với bộ lọc «Chưa xong 30». da-bac-bat.png: sau khi bấm, nút có viền xanh lục sáng, vùng nội dung thay bằng khối «Việc kế hoạch đã cân nhắc và quyết không làm, kèm lý do» với bảng bốn hàng x1–x4. Khớp expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: minted-lo-trinh-dong-bo-ho-so-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ldb_ke_hoach
  verified_at: 2026-10-10T10:40:26Z
  output: |
    KET LUAN: 3 DUNG, 0 SAI

- eval: E8
  run_id: minted-lo-trinh-dong-bo-ho-so-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_hoi_quy
  verified_at: 2026-10-10T10:40:26Z
  output: |
    KET LUAN: hoi quy xanh

- eval: E9
  run_id: minted-lo-trinh-dong-bo-ho-so-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ldb_thiet_ke
  verified_at: 2026-10-10T10:40:26Z
  output: |
    KET LUAN: ma thoat 0

- eval: E10
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba judge đều thấy hai ảnh là cùng một kiểu ngăn (đầu ngăn, dải bốn ô, kiểu tiêu đề mục); chỗ khác chỉ do nội dung. Lệch nhỏ được ghi nhận: giá trị ô «Mốc» căn phải và dòng phụ bị cắt chữ, không đủ để coi là khác kiểu.
  human_override:  # chi nguoi ghi

### Judge panel (đề xuất)

- E10 panel: domain-correctness, operational-feasibility, spec-alignment. Đề xuất PASS. Người quyết ở Cổng 2 và điền human_override ở trên.
- domain-correctness: PASS — Hai ảnh dùng cùng một ngăn: cùng khung bên phải, cùng đầu ngăn (tiêu đề, dòng phụ nhỏ ở dưới, nút đóng), cùng dải bốn ô số liệu có vạch ngăn dọc, cùng kiểu tiêu đề mục (chữ hoa nhỏ màu xám). Chỗ khác chỉ do nội dung: ngăn thoả thuận có biểu tượng, ô chọn trạng thái, nút ba chấm và thẻ tab; ngăn việc có thêm dòng phụ trong ô số liệu nên dải cao hơn (khoảng 84px so với 70px). Giá trị ô «Mốc» căn phải còn các ô khác căn trái, và dòng phụ «Đã giao — chờ phiên nghiệm thu» bị cắt chữ; đây là lệch nhỏ, không làm người dùng thấy là hai kiểu ngăn khác nhau.
- operational-feasibility: PASS — Hai ảnh cùng một khung ngăn: cùng mép trái (x khoảng 410, viền xanh), đầu ngăn có tiêu đề cỡ chữ như nhau, dòng phụ xám và nút đóng ở góc phải. Dưới đầu ngăn là dải bốn ô chia bằng nhau, nhãn nhỏ xám trên giá trị sáng; tiêu đề mục là chữ hoa nhỏ xám cùng mép x khoảng 431. Khác biệt thấy được đều do nội dung. Giá trị ô «Mốc» ở ảnh việc căn phải trong khi các ô khác căn trái, lệch nhỏ chứ không đổi kiểu ngăn.
- spec-alignment: PASS — Hai ảnh là cùng một kiểu ngăn: cùng đầu ngăn, cùng dải 4 ô số liệu có vạch chia dọc và nhãn xám nhỏ phía trên giá trị, cùng kiểu tiêu đề mục chữ hoa nhỏ màu xám («VIỆC ĐANG CHỜ VIỆC NÀY» so với «GIAI ĐOẠN», «CHI TIẾT»). Phần khác chỉ là nội dung hoặc phụ thuộc nội dung. Có hai lệch nhỏ trong hai ảnh này, không đủ để coi là khác kiểu: giá trị ngày ở ô «Mốc» của ngăn việc căn phải trong khi ngăn thoả thuận căn trái; dòng phụ của ngăn việc xám mờ hơn và hai dòng phụ trong dải bị cắt chữ.

### Lệnh suite (hồi quy)

- cmd: bun run test -- --filter=api
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bun_run_test_filter_api-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

- cmd: bun run test -- --filter=app --filter=@crm/ui
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bun_run_test_filter_app_filter_crm_ui-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

- cmd: bun run test -- --filter=agent --filter=@crm/auth --filter=@crm/db
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bun_run_test_filter_agent_filter_crm_aut-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

- cmd: bun run test -- --filter=agent-okr --filter=@crm/env --filter=@crm/ai-okr --filter=@crm/telemetry --filter=@crm/validation
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bun_run_test_filter_agent_okr_filter_crm-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

- cmd: bunx turbo run lint --force
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bunx_turbo_run_lint_force-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

- cmd: bun run lint:slop
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bun_run_lint_slop-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

- cmd: bunx turbo run build --force
  run_id: minted-lo-trinh-dong-bo-ho-so-SUITE-bunx_turbo_run_build_force-r1
  exit_code: 0
  verified_at: 2026-10-10T10:40:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đều đạt; không có eval nào phải trả về cho bước thi công.

### Re-pin lần 1 — 2026-10-10, do ghim lại sau gộp onehub f8be41ee7 (#363)
run_id: repin-20261010T124213Z-73942
sha: e7300a99bc69915c48c420421973f630573332fb · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E2, E3, E4, E5, E6, E10 (E10 không khai paths) · AC không có chốt máy: AC-2, AC-3, AC-4, AC-5, AC-6, AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 2 — 2026-10-10, do ghim lại sau gộp onehub d5078b8e3 (#358, #364)
run_id: repin-20261010T133931Z-21790
sha: 2989e7ae58cc19fb523e44d7b2c18db94f369f75 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E2, E3, E4, E5, E6, E10 (E10 không khai paths) · AC không có chốt máy: AC-2, AC-3, AC-4, AC-5, AC-6, AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)

### Re-pin lần 3 — 2026-10-15, do #407 gộp onehub eb5ab4269 (vá đua act TanStack, mẫu b1); khung-man-chung không ghim — E12m đỏ do #419
run_id: repin-20261015T120029Z-49021
sha: dbe02024a6bfa2872ff5473f2f29815684fdaa51 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · ngoài làn máy: E2, E3, E4, E5, E6, E10 (E10 không khai paths) · diff chạm vật đo ngoài làn máy: E2, E3, E4, E5, E6 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-2, AC-3, AC-4, AC-5, AC-6, AC-10 · suite chạy ở môi trường giống CI (biến rỗng: AI_GATEWAY_API_KEY, KHO_TAI_LIEU_AI_GATEWAY_API_KEY, KHO_TAI_LIEU_BLOB_TOKEN, ZALO_BOT_TOKEN)
