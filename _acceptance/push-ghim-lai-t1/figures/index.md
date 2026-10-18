# Hình tại điểm quyết định — push-ghim-lai-t1 (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 thêm đúng hai glob vào t1_skip_globs | dưới ngưỡng: 1 bước, 0 nhánh | — |
| d-…-9 luật số đoạn trong tachT1 (thay d-…-2) | 2 nhánh rẽ (cùng số đoạn / khác số đoạn → xét glob còn lại) | `luat-so-doan` |
| d-…-10 răng cổng trên commit thật (thay d-…-3) | 5 bước nối tiếp, 3 nhánh ca (lành / báo cáo giả / sổ chạy giả) | `rang-cong-van-do` |
| d-…-4 tệp kiểm riêng | dưới ngưỡng: 1 bước | — |
| d-…-5 răng đột biến AC-8 | dưới ngưỡng: 1 bước lặp | — |
| d-…-6, -7, -8 ba dòng bỏ | dưới ngưỡng: 0 bước | — |

## Đề bài `luat-so-doan`

- Loại: flowchart quyết định, trái → phải.
- Nút: «tệp trong diff» → «khớp glob của t1_skip_globs? (bộ khớp kit, không đổi)» → nhánh «glob có * mà không có **» → «số đoạn tệp = số đoạn glob?» → có: «T1» · không: «xét lại với các glob còn lại» → khớp `**/*.md`: «T1» / không khớp: «nặng — chạy test, build».
- Ví dụ nhãn: `_acceptance/x/run-log.jsonl` → T1; `_acceptance/x/rang/f/run-log.jsonl` → nặng; `_acceptance/x/rang/f/a.md` → T1.
- Ghi chú: một hàm `tachT1` cho CI, pre-push, bộ quét t1-ma-doc. AC-4, AC-2 ca 8, AC-3 ca 3.

## Đề bài `rang-cong-van-do`

- Loại: sequence/flow năm bước rồi ba ca.
- Bước: «worktree tạm tại 38ecca3be^» → «chép config của vòng (không commit)» → «origin/onehub = gốc» → «git merge --no-ff 38ecca3be (+ commit của ca)» → «bộ phân loại CI» và «kịch bản Pre-merge check đọc từ acceptance.yml thật».
- Ba ca: lành → `chi-t1` + cổng 0 · `run_id` giả trong evidence-report.md → `chi-t1` + `VIOLATION [t1-ma-doc]` chứa mã giả · `suites_exit` có 1 trong run-log.jsonl → `chi-t1` + `VIOLATION … nonzero suites_exit`.
- Ghi chú: điều kiện chủ kho 17/10 — PR chỉ ghim lại vẫn chạy cổng, recheck vẫn đỏ. AC-6.
