# Xoá bộ OKR mẫu dọn đủ — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `okr:mau --xoa` dọn việc chung và tín hiệu do người mẫu tạo, dừng có tên khi dữ liệu người ngoài còn giữ người mẫu, và một lưới bắt khoá chặn mới tới người dùng chưa khai.

**Architecture:** Một sổ khoá viết trước (`so-khoa-nguoi.ts`) khai mọi khoá chặn tới `User` là `don` hay `chan`; một bài kiểm đọc `schema.prisma` so hai chiều với sổ. `xoaTrong` gọi thêm một mô-đun `xoa-viec.ts`: dọn `viec`/`tinHieu` của người mẫu, chặn khi kéo theo dữ liệu người ngoài, và trước khi xoá người thì đọc `pg_constraint` để gọi tên mọi khoá chặn còn giữ.

**Tech Stack:** Bun, Prisma (`tx.$queryRaw`), bun test trên kho kiểm thật (`bun run test -- "cd apps/api && …"`).

**Spec:** `docs/superpowers/specs/2026-10-20-okr-mau-xoa-du-design.md`; hợp đồng `_acceptance/okr-mau-xoa-du/contract.md` (đã duyệt 20/10); thước `_acceptance/okr-mau-xoa-du/evals.yaml`.

## Global Constraints

- Không viết chú thích trong code (`AGENTS.md`).
- Mã thoát giữ nguyên `OKR_MAU.ma` (`dangGiu: 5`); lệnh vẫn từ chối production.
- Hằng tinh chỉnh vào `apps/api/scripts/okr-mau/cau-hinh.ts` (`OKR_MAU`), không đặt rải.
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7); dòng `okx_*` là của vòng này.
- Xoá việc theo `taoBoiId` ∈ người mẫu; tín hiệu theo `nguoiGuiId` ∈ người mẫu (Hỏi-1 đã duyệt).
- Thông điệp dừng: mỗi khoá một mục `<bảng>.<cột> (<n>)`, tên bảng/cột lấy từ catalog Postgres, không in «(User)» trần.

## Review Focus

- Việc của người mẫu có việc con mà chính việc con cũng do người mẫu tạo → phải dọn cả cây, không chặn (Task 2, ca `okx-viec` gieo một việc con do người mẫu tạo).
- Tín hiệu người ngoài gửi nhưng người mẫu lưu trữ → giữ hàng, `archivedById` về null (Task 2, ca `okx-tin-hieu`).
- Kho không có bộ mẫu → vẫn «không có bộ mẫu», mã 0, không gọi catalog (ca đã ký `xoa-mau`, Task 2 bước chạy lại).
- Hai khoá cùng giữ một người mẫu → thông điệp liệt cả hai, thứ tự cố định theo tên (Task 2, ca `okx-ten-giu`).
- Model có `@@map`/trường có `@map` → sổ dùng tên Prisma, catalog dùng tên bảng thật; bài đối chiếu phải ánh xạ đúng (Task 1).

---

### Task 1: Sổ khoá và lưới chống ruỗng

**Files:**
- Create: `apps/api/scripts/okr-mau/so-khoa-nguoi.ts`
- Create: `apps/api/test/okr-mau-khoa-nguoi.spec.ts`
- Modify: `_acceptance/config.yaml` (dòng `okx_luoi` của vòng: chạy qua `bun run test -- "cd apps/api && bun test test/okr-mau-khoa-nguoi.spec.ts -t okx-luoi"` để có kho kiểm)

**Interfaces:**
- Produces: `SO_KHOA_NGUOI: Readonly<Record<string, { loai: "don" } | { loai: "chan"; lyDo: string }>>` (khoá `"<Model>.<trường>"`); `khoaChanTuLuocDo(schema: string): string[]` (mọi trường quan hệ tới `User` có `onDelete` là `Restrict`, `NoAction` hoặc vắng; sắp xếp); `soKhoaLech(schema: string, so = SO_KHOA_NGUOI): { thieu: string[]; thua: string[] }`.

- [ ] Test `okx-luoi`: `soKhoaLech(lược đồ thật)` toEqual `{ thieu: [], thua: [] }`; ma trận đỏ trên chuỗi lược đồ sao trong bộ nhớ: thêm `model ThuMoi { id String @id nguoiId String nguoi User @relation(fields: [nguoiId], references: [id]) }` → `thieu` toEqual `["ThuMoi.nguoi"]`; xoá dòng trường `taoBoi` của `Viec` → `thua` chứa `"Viec.taoBoi"`; đổi `onDelete: Restrict` của `Viec.taoBoi` thành `Cascade` → `thua` chứa `"Viec.taoBoi"`. Bài phụ `okx-luoi catalog`: mỗi khoá sổ ánh xạ (qua `@@map`/`@map`) đúng một ràng buộc `pg_constraint` tới bảng `user` có `confdeltype` ∈ `r`,`a`; tập hai bên bằng nhau.
- [ ] Chạy, thấy đỏ (sổ chưa có). Viết sổ: `don` cho mọi khoá mà `xoaTrong`/`xoaCanhKr`/`xoaHoiY` đã dọn hoặc Task 2 sẽ dọn (`Viec.*`), `chan` (kèm lý do một dòng) cho phần còn lại (`Deal`, `Campaign*`, `Activity`, `Agent*`, `DuAn*`, `NgayNghi`, `GoiYKeHoach`, `SanPhamLoTrinh`, `TaiLieuHoi`, `TaiLieuBaoSai`, `OnboardingPlan`, …). Đọc lược đồ bằng đường suy từ `import.meta.dir`.
- [ ] Chạy `okx-luoi` xanh; phá thử trên bản sao (bỏ một dòng sổ) → đỏ đúng thông điệp ghim; khôi phục.
- [ ] Commit `test(okr-mau-xoa-du): sổ khoá chặn tới người dùng và lưới chống ruỗng`.

independent: true · phục vụ E5

### Task 2: Dọn việc và tín hiệu, chặn có tên

**Files:**
- Create: `apps/api/scripts/okr-mau/xoa-viec.ts`
- Modify: `apps/api/scripts/okr-mau/nap.ts` (`xoaTrong`: gọi mô-đun mới trước bước xoá người; thông điệp mã 5)
- Modify: `apps/api/test/okr-mau.spec.ts` (khối mới `okx`, không đổi ca nào của `xoa-mau`)

**Interfaces:**
- Consumes: `LoiBoMau`, `OKR_MAU` (`cau-hinh.ts`).
- Produces: `chanKeoNgoai(tx: Tx, U: string[]): Promise<void>` (ném `LoiBoMau(dangGiu)` nêu `viec.chaId` hay `viecPhuThuoc`); `xoaViecVaTinHieu(tx: Tx, U: string[]): Promise<{ viec: number; tinHieu: number }>`; `khoaConGiu(tx: Tx, U: string[]): Promise<string[]>` (mỗi phần tử `"<bảng>.<cột> (<n>)"`, sắp theo chuỗi).

- [ ] Tests khối `okx` trong `okr-mau.spec.ts`, đúng `expected` của E1–E4: `okx-viec` (người mẫu tạo việc qua `goi("viec.create", …)` với một người theo dõi là người mẫu; gieo thêm một việc con do người mẫu tạo; `--xoa` → 0; `demThamChieu` toEqual `{}`; nạp lại → 0); `okx-tin-hieu`; `okx-ngoai-giu`, `okx-ngoai-giu-con`, `okx-ngoai-giu-phu-thuoc` (hàng người ngoài gieo thẳng vào kho kiểm, `vanTayKho` trước/sau toEqual); `okx-ten-giu` (tách thông điệp thành tập dòng, toEqual tập mong đợi, không chứa `(User)`).
- [ ] Chạy, thấy đỏ (`okx-viec` mã 5).
- [ ] Viết `xoa-viec.ts`; trong `xoaTrong`: `chanKeoNgoai` → `xoaViecVaTinHieu` sau `xoaHoiY`, `khoaConGiu` ngay trước `tx.user.deleteMany` — rỗng thì đi tiếp, không rỗng thì ném `LoiBoMau(OKR_MAU.ma.dangGiu, …)` liệt các mục; câu chữ thông điệp đặt trong `OKR_MAU`.
- [ ] Chạy `okx-*` và `-t xoa-mau` (ba ca đã ký) xanh; phá thử: bỏ bước `xoaViecVaTinHieu` → `okx-viec` đỏ «xoa thoat 5»; khôi phục.
- [ ] Commit `fix(okr-mau-xoa-du): dọn việc và tín hiệu của người mẫu, dừng có tên`.

independent: false (cần sổ của Task 1 cho bài phụ catalog chỉ ở mức đọc; viết sau Task 1) · phục vụ E1, E2, E3, E4, E7

### Task 3: Phép đo màn canh-kr-okr dọn sạch

**Files:** không đổi mã; chạy `config:executors.script.okx_man_canh_kr`.

- [ ] Chạy `EVAL=E12,E15,E17 bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/canh-kr-okr/rang/man-canh-kr.mjs"`: kỳ vọng `0 hong`, không dòng «don dep», mã 0. Đỏ → quay Task 2 đọc thông điệp mã 5 (nay gọi tên khoá) rồi khai/dọn.
- [ ] Không commit gì nếu xanh.

independent: false · phục vụ E6
