# Khoá eve không tranh — kế hoạch thi công

Spec: `_acceptance/khoa-eve-khong-tranh/design.md` · hợp đồng `contract.md` · evals `evals.yaml`. Phiên P5 tự làm (native).

## Ràng buộc chung

- Chỉ chạm `apps/agent-okr/test/support/khoi-dong.ts`, `apps/agent-okr/test/khoa-eve*.spec.ts`, hồ sơ này, dòng thêm vào `_acceptance/config.yaml`.
- Không chú thích trong mã. Hằng mới vào `KHOI_DONG.khoa` (`duoiTam`, `duoiCu`).
- Lời gọi hiện có của `giuKhoaEve`, `ghiConVaoKhoa`, `traKhoaEve` không đổi chữ ký bắt buộc; tuỳ chọn mới mặc định vắng.

## Việc 1 — ghi trọn một lần và mã khoá (AC-1, AC-6) · độc lập: không

- `ghiChu(khoa, chu, giuaGhi?)`: ghi `chu.json<duoiTam><uuid>` rồi `renameSync` sang `chu.json`; `giuaGhi` chạy giữa hai bước.
- `chuKhoaEve` thêm `ma: z.string().optional()`; `giuMot` sinh `ma` bằng `randomUUID()`; `khoaDangGiu` giữ `{khoa, ma}`.
- `xetKhoaCu(khoa)` trả `{cu: boolean, dau: {ino, mtimeMs, ma}}`; `cungDau(a, b)` xuất ra, `ma` vắng chỉ bằng vắng.
- Bài: `khoa-eve.spec.ts` khối `ghi-tron` (E1) và `dau` (E9).
- Kiểm: `cd apps/agent-okr && bun test test/khoa-eve.spec.ts -t "ghi-tron|dau"`.

## Việc 2 — giành khoá cũ bằng đổi tên có kiểm dấu (AC-2, AC-3) · độc lập: không (sau việc 1)

- Trong `giuMot`, khi `xetKhoaCu` báo cũ: `sauKhiXetCu?.()`, rồi `renameSync(khoa, khoa + duoiCu + uuid)`. ENOENT thì quay lại vòng; giành được thì so dấu — khác thì trả lại tên cũ và chờ tiếp, khớp thì `dungMoCoi(daGianh)` rồi `rmSync(daGianh)`.
- `giuKhoaEve(cacGoc, tuyChon?)` nhận `{choMs?, sauKhiXetCu?, giuaGhi?}`.
- Bài: khối `hai-luot` (E2, tiến trình con B thật) và `mot-luot` (E3); ba ca cũ `mo-coi`, `ngoai-khoa`, `cho-route` của `khoi-dong-don.spec.ts` (E4, E5) vẫn xanh.

## Việc 3 — chủ khoá kiểm còn là chủ (AC-4) · độc lập: không (sau việc 1)

- `ghiConVaoKhoa` đọc `ma` hiện thời, khác thì ném «khoa cua <goc> da doi chu».
- `goNeuCuaMinh(that)` dùng cho `traKhoa` và bộ dọn lúc `exit`: chỉ gỡ khi `ma` khớp.
- Bài: khối `doi-chu` (E6).

## Việc 4 — thước của hồ sơ và kiểm toàn cây · độc lập: cuối

- `rang/pham-vi.mjs` (E7), `rang/dot-bien.mjs` trên bản sao (E8), `rang/lap.mjs` (E10) theo đúng `expected` của evals.
- Năm lệnh: `bun run check-types`, `bun run lint`, `bun run lint:slop`, `bun run build`, `bun run test`.
- Đặt `status: implemented`, commit, xin khoá `s4`.
