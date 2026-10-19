# gieo-nguoi-chiu-song-song — kế hoạch thi công

Hợp đồng: `_acceptance/gieo-nguoi-chiu-song-song/contract.md` (đã duyệt 14/10). Thiết kế:
`docs/superpowers/specs/2026-10-14-gieo-nguoi-chiu-song-song-design.md`.

Thứ tự bắt buộc: đường nền chạy xong trên cây chưa có mã sửa (lượt do Điều phối M5 cấp)
TRƯỚC task 1.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Hai lượt gieo người cùng lúc trên kho thử mới thôi đỏ vì lỗi trùng khoá | `apps/api/test/dieu-phoi-gieo.ts` | AC-1 (gieo song song xong), AC-5 (không nuốt lỗi khác) |
| Có bài kiểm canh đúng ca đua đó | `apps/api/test/gieo-nguoi-song-song.spec.ts` | AC-1 (một tổ chức, bốn thành viên) |
| Thước tự đỏ khi cách sửa bị tắt | `_acceptance/gieo-nguoi-chiu-song-song/rang/dot-bien.mjs` | AC-2 (thước thấy lỗi) |
| Diff không chạm chỗ gọi hay mã sản phẩm | `_acceptance/gieo-nguoi-chiu-song-song/rang/pham-vi.mjs` | AC-4 (phạm vi tệp) |

## Task 1 — mã sửa trong helper

- Files: `apps/api/test/dieu-phoi-gieo.ts`
- Việc: tách bước upsert tổ chức thành `gieoToChuc()`; bắt `Prisma.PrismaClientKnownRequestError`
  mã `P2002` rồi `db.organization.findUniqueOrThrow({ where: { id: WORKSPACE_ID } })`; lỗi khác
  ném lại. `gieoNguoi()` gọi `gieoToChuc()`.
- Verify: `bun run test -- "cd apps/api && bun test test/dieu-phoi-va.spec.ts -t dem-qua-han"` xanh
  (trên onehub chưa có #405 thì đây là ca tái hiện, trước sửa đỏ 3/3).
- Phục vụ: E3, E5. `independent: false`.

## Task 2 — bài kiểm song song

- Files: `apps/api/test/gieo-nguoi-song-song.spec.ts`
- Việc: bốn `gieoNguoi()` qua `Promise.all`; đếm đúng một hàng tổ chức `WORKSPACE_ID` và đúng bốn
  hàng thành viên của bốn `userId`; `test.skipIf` khi kho đã có tổ chức lúc nạp tệp.
- Verify: `bun run test -- "cd apps/api && bun test test/gieo-nguoi-song-song.spec.ts"` có dòng
  `(pass) gieo-nguoi-song-song > gnss-dong-thoi`.
- Phục vụ: E1, E5. `independent: false` (cần task 1).

## Task 3 — hai răng

- Files: `_acceptance/gieo-nguoi-chiu-song-song/rang/dot-bien.mjs`, `rang/pham-vi.mjs`
- Việc: đột biến chạy trong bản sao cây ở HEAD (dùng `ca-chap-chon-cach-ly/rang/ban-sao.mjs`), đổi
  `"P2002"` → `"P0000"` ở nhánh bắt, đòi đỏ 3/3 với câu ghim; phạm vi so diff với
  `merge-base origin/onehub HEAD`, có ca mẫu đỏ trước.
- Verify (lượt phá-thử của MEASURE-BIRTH): `node …/rang/dot-bien.mjs` in `dot-bien: 1/1 cap dat`;
  `node …/rang/pham-vi.mjs` in dòng mẫu bị bắt rồi `0 ngoai pham vi`. Đột biến cần commit trước
  (bản sao lấy HEAD) và cần lượt M5.
- Phục vụ: E2, E4. `independent: false`.

## Task 4 — kiểm kiểu và lint

- Verify: `bun run check-types`, `bun run lint`, `bun run lint:slop` xanh.
