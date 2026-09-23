# Mọi bài kiểm DOM đều chạy — kế hoạch thi công

**Spec:** `docs/superpowers/specs/2026-09-23-moi-bai-kiem-dom-deu-chay-design.md`
**Hợp đồng:** `_acceptance/moi-bai-kiem-dom-deu-chay/contract.md` · phép đo E1–E7 trong `evals.yaml`

## Task 1 — bộ chạy chung và hai script

**Files:**
- Tạo: `packages/ui/test/chay-tung-tep-dom.ts`
- Sửa: `apps/app/package.json` (`test:dom`), `packages/ui/package.json` (`test`)

Bộ chạy: liệt kê `test/*.dom.tsx` của thư mục đang đứng, sắp theo tên; với mỗi tệp in
`chay-dom: test/<tệp>` rồi chạy `bun test <cờ nhận được> ./test/<tệp>` với `stdio: inherit`;
tệp đầu tiên thoát khác 0 thì dừng, thoát đúng mã đó. Thư mục không có tệp nào thì thoát 1
và nói rõ.

- app: `TZ=Asia/Ho_Chi_Minh bun ../../packages/ui/test/chay-tung-tep-dom.ts --preload ../../packages/ui/test/setup-dom.ts`
- ui: `bun test --preload ./test/setup-dom.ts && bun ./test/chay-tung-tep-dom.ts --preload ./test/setup-dom.ts`

Kiểm: E1–E7 xanh; ba lần phá thử cho ra đúng thông điệp ghim — bộ chạy lọc bỏ
`keo-tha-thoa-thuan` (E1), bộ chạy không trả mã lỗi (E4), bỏ `TZ` (E6), bỏ `bun test` đầu
của ui (E2 vế spec).

## Task 2 — bộ chứng năm lệnh

`bun run test`, `check-types`, `lint`, `lint:slop`, `build` ở gốc đều xanh.
