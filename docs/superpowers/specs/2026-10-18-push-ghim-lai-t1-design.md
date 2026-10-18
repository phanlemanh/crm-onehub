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
2. **Canh độ sâu trong bộ quét.** Bộ khớp glob của kit cho `*` vượt `/`: `_acceptance/*/run-log.jsonl` khớp cả
   `_acceptance/x/rang/f/run-log.jsonl`. Hôm nay 590/590 tệp khớp nằm đúng một bậc. Bộ quét thêm luật chung: với mọi
   glob của `t1_skip_globs` dạng `_acceptance/*/<tên>` (không ký tự đại diện nào khác), tệp đang theo dõi khớp nó mà
   không nằm đúng `_acceptance/<slug>/<tên>` thì báo `glob-qua-sau <glob> <tệp>` và thoát 1. Sửa bộ khớp là việc của
   kit (phí bản rẽ), không làm ở đây.
3. **Cổng nghiệm thu không đổi, và chứng điều đó bằng ca đỏ trên commit thật.** Job `acceptance gate` (`luat-kho`
   của `.github/workflows/acceptance.yml`) không phụ thuộc phân loại. `pre-merge-check.sh` bỏ qua `_acceptance/*`
   trước khi so `t1_skip_globs` (dòng 680, 813), nên hết hạn bằng chứng và T1-escape không đổi kết luận. Răng
   `rang/cong-van-do.mjs` dựng bản sao tại `38ecca3be`, mang config mới: commit ghim lại thật → phân loại `chi-t1`
   và cổng sạch; cùng commit đó mà `run_id` trong báo cáo bị sửa → phân loại vẫn `chi-t1` và cổng đỏ.

## Giới hạn

- CI xét cả PR: PR có mã thì lần đẩy ghim lại vào nó vẫn nặng ở CI. Lợi ích CI chỉ có ở PR toàn ghim lại.
- Lần đẩy mang commit gộp onehub kèm ghim lại vẫn nặng ở pre-push (diff mang tệp của onehub).
- Bộ quét chỉ thấy tên tệp viết nguyên trong mã; tên ghép lúc chạy (`${slug}/run-log.jsonl`) không thấy. Đo 18/10:
  ba răng khai trong `gate-shape.json` không đọc sổ chạy; răng hồ sơ đọc sổ chạy bằng tên ghép chạy trong làn ghim
  lại, không chạy trong năm bước.

## Không đổi

`pre-merge-check.sh`, `--hang-pr`, PR nháp (vốn đã nhẹ), câu `vi_sao` của khối `t1Only` (vẫn đúng: lần đẩy chỉ T1),
`CLAUDE.md`.
