# VK8 `bo-okr-co-so` — kế hoạch S2

Hợp đồng `_acceptance/bo-okr-co-so/contract.md` (approved 25/10 09:37Z, Phan Le Manh). Bản mẫu `/proto/bo-okr-co-so`.
Đọc trước khi chạm: `docs/api.md` (tRPC, OKR, aggregates bỏ mục tiêu giới hạn cho mọi người qua `boGioiHan`),
`docs/design.md` (Thứ tự một màn, Hàng công cụ, Ô số tổng quan, Chờ tải và lỗi tải), `docs/proto.md`.

## Việc 1 — API `okr.soBo` (E14)

- `toan-canh.ts`: xuất hàm dựng hàng (đổi `hang` → `dungHangSo`, `gopToanCanh` gọi nó) — không công thức mới.
- `okr-xem.contracts.ts`: `soBoInput = { cycleId, unit: donViChon }`, `soBoOutput = hangToanCanh.pick({ tienDo, kyVong,
  soMucTieu, soKr, tuTin, daCapNhat })`.
- `okr-xem.service.ts`: `soBo(userId, input)` — `where = { cycleId, status: "cong-bo", AND: [dieuKienDonVi(unit, q)] }`,
  cùng đường `docMucTieu(…, "so-gop")` + `lanCuaKr` + `tuanCuaKy` + `krSoCua` như `toanCanhTheo`; tách phần chung
  thành một hàm riêng để hai thủ tục không lệch.
- `okr.router.ts`: `@Query soBo`, `restMeta("POST", "/okr/units/numbers", TAG)` (input có unit, như `viecCuaBo`).
- `cd apps/api && bun run trpc:generate` → `src/generated/server.ts`.
- `apps/api/test/okr-so-bo.spec.ts` ca `bco-so-bo` + chiều đỏ `bco-so-bo-do`; gieo qua đường ghi thật.
- `docs/api.md`: thêm `soBo` vào câu «Aggregates (...)» và mục OkrXemService (xin cham-tep).

## Việc 2 — `DataTable` `expandable.moSan` (E5, E7, E9)

- `packages/ui/src/components/data-table.tsx`: `DataTableExpandable` thêm `moSan?: boolean`. Bật: khoá URL `gap`
  (mảng id dòng gập) thay `expand`; mở = `isExpandable && !gap.has(id)`; một nút đổi nhãn «Gập tất cả»/«Mở tất cả»
  (`msg.table.gapTatCa`/`moTatCa`, `aria-label` = nhãn), cuối nhóm nút phải ở `sm+`, và ngoài phần gập «Lọc» dưới `sm`
  (Hỏi-5). Không bật → y như cũ.
- `packages/ui/src/lib/messages.ts`: thêm hai nhãn vi/en (chỉ thêm dòng).
- `packages/ui/test/data-table-mo-san.dom.tsx`.

## Việc 3 — Hàng số ở thẻ OKR (E2, E3, E4, E10)

- `theo-don-vi/o-so-bo.ts`: hàm thuần `oSoBo(so, chuKy, homNay)` → bốn ô (giá trị, mô tả); biên Hỏi-4; ngày VN.
- `theo-don-vi/hang-so-bo.tsx`: `useQuery(okr.soBo)`; tải → bốn `StatCard` khung xương; lỗi → `VungTaiLoi` + Thử lại;
  có số → `StatGroup` `data-hang-so-bo`.
- `theo-don-vi.tsx`: chèn `<HangSoBo>` ngay sau khối thẻ con, chỉ khi `xem === "danh-sach"` và `dv !== null`, ở cả
  nhánh bảng đang tải; không ở thẻ khác.
- `bang.tsx`: `moRong.moSan = true`.
- `apps/app/lib/messages/okr-vo-khu.ts`: nhãn bốn ô và mô tả (chỉ thêm dòng); dùng lại `okr-toan-canh.ts` cho nhãn trùng.
- `apps/app/test/bo-okr-co-so.dom.tsx` ca `bco-o-so`, `bco-bien`, `bco-the`, `bco-tai` + chiều đỏ.

## Việc 4 — Thước màn và thước đã ký (E1, E6, E8, E11, E12, E13)

- `_acceptance/bo-okr-co-so/rang/man-bo-okr-co-so.mjs` (+ `--chieu-do`), chạy qua `tien-de.mjs`.
- `_acceptance/bo-okr-co-so/rang/thuoc-da-ky.mjs`: quét, lập danh sách thước đã ký chạm bước mở dòng / `expand` / hàng
  công cụ / khoảng dưới thẻ con; xin cham-tep danh sách ấy; sửa đúng ba lớp Hỏi-1, mỗi hồ sơ một dòng sổ `fix`
  `decided_by` chủ kho, đo hai chiều.

## Việc 5 — Chứng và giao

- `bun run test`, `check-types`, `lint`, `lint:slop`, `build`; hồ sơ `implemented`; vẽ lại bản đồ; đẩy nhánh;
  `gh pr create --draft --base onehub` «VK8 · feat(bo-okr-co-so): …». Dừng trước S4, xin khoá qua giám sát.

Mỗi khối mới trong mô tả PR: bậc 1 (`StatGroup`, `StatCard`, `VungTaiLoi`, `DataTable` mở rộng ở packages/ui).
