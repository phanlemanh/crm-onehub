# Lần đẩy chỉ ghim lại là T1 — thiết kế

Vòng `push-ghim-lai-t1` (hàng C-1c, `docs/plan/lo-trinh-okr.json`). Cổng Đáng ký 18/10 «build», «Không đo được»
(`_acceptance/push-ghim-lai-t1/opportunity.md`). Chồng trên `chore/t1-ma-doc` (#480).

## Vấn đề

Ghim lại (`repin-lane.mjs --write`) chỉ ghi `_acceptance/<slug>/run-log.jsonl`, `decisions.jsonl` (dòng `repin-do`)
và `evidence-report.md`. Hai tệp `.jsonl` không khớp glob nào của `risk_tiers.t1_skip_globs`, nên bộ phân loại chung
(`.github/scripts/phan-loai.mjs`, gọi lại từ `scripts/pre-push-t1.mjs`) trả `co-tep-nang`. Đo trên commit ghim lại
thật `38ecca3be`: 8/16 tệp không T1, đúng 8 tệp `run-log.jsonl`.

## Lựa chọn

1. **Thêm đúng hai glob vào `t1_skip_globs`:** `_acceptance/*/run-log.jsonl`, `_acceptance/*/decisions.jsonl`.
   - Không danh sách miễn riêng: bộ quét `.github/scripts/t1-ma-doc.mjs` chỉ canh tệp khớp `t1_skip_globs`, nên
     tên nằm ngoài khoá đó thì bài kiểm đọc chúng sau này không bị bắt.
   - Không dùng hạng `ho-so` của `pre-merge-check.sh --hang-pr` (kit): hạng đó xếp mọi `_acceptance/**` là nhẹ, mà
     kho này có bài kiểm đọc `evidence/**`, `rang/**`, `evals.yaml`, `config.yaml` (listing-fixture-batch.spec,
     lai-ra-man.spec, pre-push-t1.spec).
   - `evidence-report.md`, `contract.md`, `review-findings.md` đã là T1 qua `**/*.md`.
2. **Luật số đoạn trong `tachT1`.** Bộ khớp glob của kit cho `*` vượt `/`: `_acceptance/*/run-log.jsonl` khớp cả
   `_acceptance/x/rang/f/run-log.jsonl`. Hôm nay 590/590 tệp khớp nằm đúng một bậc, nhưng tệp sâu sẽ thành T1 và lần
   đẩy hay PR thêm nó bỏ test — kể cả bộ quét t1-ma-doc, nên một luật báo đặt trong bộ quét không chạy ở đúng PR nó
   phải bắt (gap-probe P1). Vì vậy `tachT1` của `.github/scripts/phan-loai.mjs` — hàm chung của CI, pre-push và bộ quét —
   thêm luật: glob có ký tự đại diện mà không có `**` chỉ tính cho tệp có cùng số đoạn đường dẫn với glob; tệp khác
   số đoạn thì xét lại với các glob còn lại (nên `_acceptance/x/rang/f/a.md` vẫn T1 qua `**/*.md`). Áp cho cả glob
   dương lẫn glob trừ `!`. Bộ khớp `match_globs` của kit dùng nguyên, không sửa (phí bản rẽ). Hôm nay ngoài hai glob mới
   không glob nào có ký tự đại diện mà thiếu `**`, nên luật không đổi kết quả của glob cũ nào — bài kiểm ghim điều đó.
   Cổng nghiệm thu (`pre-merge-check.sh`) không đọc luật này; nó bỏ qua `_acceptance/*` trước khi xét T1.
3. **Cổng nghiệm thu không đổi, và chứng điều đó bằng ca đỏ trên commit thật.** Job `acceptance gate` (`luat-kho`
   của `.github/workflows/acceptance.yml`) không phụ thuộc phân loại, không lọc đường dẫn ở `on.pull_request`, không
   `continue-on-error`. `pre-merge-check.sh` bỏ qua `_acceptance/*` trước khi so `t1_skip_globs` (dòng 680, 813), nên
   hết hạn bằng chứng và T1-escape không đổi kết luận. Răng `rang/cong-van-do.mjs` dựng `git worktree` tạm tại
   `38ecca3be^`, mang config mới, mô phỏng PR bằng `git merge --no-ff 38ecca3be`, và chạy đúng kịch bản `run:` của bước
   `Pre-merge check` đọc từ `acceptance.yml` thật: commit ghim lại thật → `chi-t1` và cổng sạch; cùng commit mà `run_id`
   của mục Re-pin bị đổi sang mã giả, hoặc `suites_exit` của dòng repin trong `run-log.jsonl` bị đổi thành có số 1 →
   vẫn `chi-t1` và cổng đỏ với `VIOLATION [t1-ma-doc]`. Ca thứ hai chạm đúng loại tệp `.jsonl` vòng này nới.

## Giới hạn

- CI xét cả PR: PR có mã thì lần đẩy ghim lại vào nó vẫn nặng ở CI. Lợi ích CI chỉ có ở PR toàn ghim lại.
- Lần đẩy mang commit gộp onehub kèm ghim lại vẫn nặng ở pre-push (diff mang tệp của onehub).
- Recheck kiểm báo cáo và sổ chạy nhất quán với nhau, không chạy lại eval: giả cả hai cho khớp thì không bị bắt — như
  trước vòng này, ở mọi PR.
- Bộ quét chỉ thấy tên tệp viết nguyên trong mã; tên ghép lúc chạy (`${slug}/run-log.jsonl`) không thấy. Đo 18/10:
  ba răng khai trong `gate-shape.json` không đọc sổ chạy; răng hồ sơ đọc sổ chạy bằng tên ghép chạy trong làn ghim
  lại, không chạy trong năm bước.

## Không đổi

`pre-merge-check.sh`, `match_globs`, `--hang-pr`, PR nháp (vốn đã nhẹ), câu `vi_sao` của khối `t1Only` (vẫn đúng: lần đẩy chỉ T1),
`CLAUDE.md`.
