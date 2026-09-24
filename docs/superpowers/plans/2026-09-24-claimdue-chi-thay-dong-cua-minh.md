# Kế hoạch: claimdue-chi-thay-dong-cua-minh

Design: `docs/superpowers/specs/2026-09-24-claimdue-chi-thay-dong-cua-minh-design.md`
Hợp đồng: `_acceptance/claimdue-chi-thay-dong-cua-minh/contract.md`

Mọi task tuần tự trong vòng chính: T2–T4 dùng chung một bộ dựng bản gương và
một bộ đọc JUnit, T1 là vật mà T2–T4 đo.

## T1 — Bài test chỉ lấy dòng của chính nó

- Files: `apps/agent/test/tasks.integration.spec.ts`
- Làm: thêm `const MINE = { only: [kind] } as const;`, đổi mọi `claimDue(…, RESEARCH)`
  trong ba khối `claimDue` · `retireExhausted` · `completeTask` sang `MINE`. Khối
  `a limited lock subquery…` giữ `RESEARCH`. Không chú thích.
- Verify: `bun run test -- "cd apps/agent && CRM_TELEMETRY_DISABLED=1 bun test ./test/tasks.integration.spec.ts"`
- Phục vụ: E1, E2, E4, E12
- independent: false

## T2 — Hàng xóm ồn ào (`rang/hang-xom.sh`, `rang/hang-xom.preload.ts`, `rang/chung.sh`, `rang/doc-junit.ts`)

- Files: `_acceptance/claimdue-chi-thay-dong-cua-minh/rang/*`
- Làm: `chung.sh` dựng bản gương trong `mktemp -d` (liên kết mềm `agent`,
  `node_modules` sang `apps/agent`), đếm `it(` của file, gọi `bun test` với
  JUnit. Preload chèn 22 `identify` ưu tiên 1.000.050 + 2 `brand` + 1 nghiên
  cứu chưa đến hạn trước mỗi bài, chụp mọi cột, sau bài ghi một dòng JSON theo
  số thứ tự bài (`doi`, `mat`) rồi xoá dòng lạ. `doc-junit.ts` ghép số thứ tự với
  tên bài và in `HANG-XOM-BI-DUNG` / `HANG-XOM-MAT` cho ba khối. Ba chế độ:
  `lanh` (file thật), `pha` (sed `MINE` → `RESEARCH`), `pha-don-bang` (thêm
  `beforeEach` xoá cả bảng).
- Verify: chạy cả ba chế độ; `lanh` exit 0, `pha` exit 0 với ba tên CI,
  `pha-don-bang` exit 0 với `HANG-XOM-MAT`. Lượt phá-thử bắt buộc: chạy chế
  độ `lanh` trên bản sao phá phải thoát 1 kèm thông điệp ghim.
- Phục vụ: E1, E2, E3, E13
- independent: false

## T3 — Cùng lượt với các file ghi `AgentTask` (`rang/chung-luot.sh`)

- Files: `_acceptance/claimdue-chi-thay-dong-cua-minh/rang/chung-luot.sh`, `rang/gieo.ts`
- Làm: trong một cơ sở dữ liệu của lượt, ba thứ tự × N lần, mỗi file một tiến
  trình `bun test`; gieo lại 22 `identify` ngay trước file tasks, in số dòng lạ
  đến hạn chưa thuê, sàn 22; chấm file tasks qua JUnit, chín file kia chỉ báo.
  Chế độ `lanh` thêm một lượt chung một tiến trình. Chế độ `pha` thay file tasks
  bằng bản sao phá, đòi đỏ ở cả ba thứ tự.
- Verify: `lanh 5` exit 0 với 16/16; `pha 1` exit 0 với 3/3 thứ tự đỏ.
- Phục vụ: E4, E5
- independent: false

## T4 — Nhánh `except` vẫn có người giữ (`rang/lanes-giu-except.sh`)

- Files: `_acceptance/claimdue-chi-thay-dong-cua-minh/rang/lanes-giu-except.sh`
- Làm: chạy `lanes.integration.spec.ts` thật (JUnit 0 hỏng), rồi chạy bản sao
  trong bản gương có `agent/lib/*` liên kết mềm, trừ `tasks.ts` là bản chép
  đột biến `ELSE t2.kind <> ALL(…)` → `ELSE TRUE`; đòi đỏ.
- Verify: exit 0; đổi đột biến thành bản chép nguyên thì script phải thoát 1 với
  `NHANH-EXCEPT-MO-COI`.
- Phục vụ: E6
- independent: false

**Đổi giữa S3.** T4 đo ra lanes không đỏ trên đột biến `ELSE TRUE`. Thước đổi
tên thành `rang/nhanh-except.sh`, chạy cả tasks và lanes; T1 thêm bài
`leaves a visible kind to the visible lane` (giữ `RESEARCH`, `claimDue(1, …)`,
hai dòng của chính bài ở ưu tiên tối đa). Xem entry `fix` trong sổ.
