# Kế hoạch: trang-ve-gop-va-dau-cay

Thiết kế: `docs/superpowers/specs/2026-10-23-trang-ve-gop-va-dau-cay-design.md`. Hợp đồng và evals:
`_acceptance/trang-ve-gop-va-dau-cay/`. Mọi task tuần tự trong phiên chính (các task E dùng chung bộ khung bài kiểm).

| # | Việc | Tệp | Kiểm từng task | Phục vụ | independent |
| --- | --- | --- | --- | --- | --- |
| 1 | Khai trang máy vẽ và driver | `.gitattributes`, `package.json` (`prepare`) | `bun run prepare` rồi `git config merge.trang-ve.driver` từ worktree khác | E1 | false |
| 2 | Bộ vẽ lại sau gộp | `scripts/trang-ve-gop.mjs` | thử tay trên kho tạm: gộp tự động, gộp xung đột | E2–E4, E7 | false |
| 3 | Hai hook gộp | `.githooks/post-merge`, `.githooks/pre-commit` | như task 2, có `core.hooksPath` trỏ checkout khác | E3, E4, E7 | false |
| 4 | Bài kiểm B | `packages/ui/test/trang-ve-gop.spec.ts` | `bun test ./test/trang-ve-gop.spec.ts` + phá thử từng ca | E1, E3, E4, E7 | false |
| 5 | Ca thật #550 và răng không đổi | `_acceptance/<slug>/rang/ca-550.mjs`, `rang/khong-doi.mjs` | chạy hai lệnh; chiều đỏ trên bản sao | E2, E5, E6 | false |
| 6 | Tệp khai dấu cây và mô-đun | `.githooks/da-chung.json`, `scripts/pre-push-da-chung.mjs` | bài kiểm `cay-ma` | E8, E14 | false |
| 7 | Nối vào bộ phân loại và bộ kiểm hình | `scripts/pre-push-t1.mjs` (chỉ `chay()`), `scripts/verify-gate-shape.mjs` | ba spec cũ xanh; neo đột biến đúng một lần | E9–E13 | false |
| 8 | Bài kiểm E | `packages/ui/test/pre-push-da-chung.spec.ts` | `bun test ./test/pre-push-da-chung.spec.ts` + phá thử | E8–E11, E13 | false |
| 9 | Răng đối chiếu | `_acceptance/<slug>/rang/doi-chieu.mjs` | chạy, đủ tám «BAT» | E12 | false |
| 10 | Năm lệnh chứng, `--check`, ghim lại hồ sơ hoá cũ | — | `bun run test/check-types/lint/lint:slop/build` | tất cả | false |

Lựa chọn tải trọng: neo của các răng đột biến cũ (`pre-push-t1`, `pre-push-phan-rieng-pr`, `pre-push-cau-va-nhan`)
nằm trong các hàm cũ của `pre-push-t1.mjs` và dòng `checkSkip` của `verify-gate-shape.mjs`; task 7 chỉ thêm, không sửa
các dòng ấy, và kiểm `neo.mjs` của `pre-push-cau-va-nhan` sau task.
