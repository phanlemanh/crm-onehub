# Khung OKR trước R1 — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (Native). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Sửa chín lỗi trình bày của khung Mục tiêu, hàng Mục tiêu và thanh «Theo đơn vị», và cho liên kết chéo hỏi lại trước khi bỏ thay đổi.

**Architecture:** Lề, căn trái và cuộn cả khung nằm ở khung chi tiết dùng chung (`detail-sheet.tsx`, `record-parts.tsx`). Biến thể mới nằm trong `packages/ui` (Badge tương tác, DrawerHeader căn trái). Màn OKR chỉ đổi cách ghép. Nút soạn viết lại để luôn chiếm một chỗ, chữ phụ vào `Popover`.

**Tech Stack:** Next.js App Router, React 19, Tailwind v4, shadcn trong `packages/ui`, bun test + happy-dom, puppeteer-core cho đo màn.

**Spec:** `docs/superpowers/specs/2026-10-04-khung-okr-truoc-r1-design.md` · hợp đồng `_acceptance/khung-okr-truoc-r1/contract.md` · `evals.yaml`.

## Global Constraints

- Không viết chú thích trong mã.
- `packages/ui`: chỉ THÊM biến thể, không đổi biến thể cũ (điều phối 04/10 13:00).
- `lib/messages/*.ts`: chỉ thêm khoá mới, ghim ở `messages-guard`; khoá cũ `tabVet`, `tienDoTu` giữ nguyên.
- Không đè `className` lên thành phần `@crm/ui` tại chỗ gọi; dùng biến thể.
- Không chạm tệp đo của hồ sơ đã ký (`apps/app/test/khung-gop-y-dung-cho.tsx` và các tệp `gop-y-dung-cho-*`).
- Bun 1.3.12: `PATH="$(brew --prefix bun@1.3.12)/bin:$PATH"`. Cổng dev tay 3310/3311; đo màn qua `mot-luot.sh`.

## Review Focus

- Khung thoả thuận trên điện thoại: phải giữ nguyên đầu khung đứng yên (ô chat ghim đáy) — kiểm ở E8.
- Nút soạn khi `okr.soanSanSang` lỗi mạng: không được nở chữ ra thanh; giữ nút khoá — bài DOM `nut-soan` thêm ca lỗi.
- Tên Mục tiêu rất dài ở «Theo đơn vị» khổ hẹp: nhóm nhãn xuống dòng cả cụm — E13.
- Popover «i» trên điện thoại 375: không tràn ngang — E15 đo tràn ngang ở Theo đơn vị 375.
- Hộp Mức hiển thị: «Ở lại» phải giữ người xem đã thêm — E14 ca (a).

---

### Task 1: `packages/ui` — Badge tương tác, DrawerHeader căn trái

**Files:** Modify `packages/ui/src/components/badge.tsx`, `packages/ui/src/components/drawer.tsx`; Test `packages/ui/test/khung-okr-badge-drawer.dom.tsx`.
**Phục vụ:** E11, E12 (chip), E10 (căn trái). `independent: false` (Task 4, 5 dùng).

**Interfaces — Produces:**
- `Badge` nhận thêm `tuongTac?: boolean` (biến thể mới của cva, trục riêng): thêm `cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50`. `data-variant` vẫn là giá trị `variant`.
- `DrawerHeader` nhận thêm `align?: "center" | "start"` (mặc định `"center"`); `"start"` bỏ hai lớp `text-center` của ngăn kéo trên/dưới, ghi `data-align="start"`.

- [ ] Viết bài DOM: `<Badge asChild variant="outline" tuongTac><button/></Badge>` có `data-slot=badge`, `data-variant=outline`, lớp `hover:bg-muted`; `<Badge variant="outline">` không có lớp đó. `DrawerHeader align="start"` không có chuỗi `text-center`; mặc định vẫn có. Chạy → đỏ.
- [ ] Thêm biến thể; chạy → xanh. `bun run check-types --filter=@crm/ui`.
- [ ] Commit `feat(ui): Badge tương tác và DrawerHeader căn trái`.

### Task 2: Khung chi tiết — khe bảng, ô số xuống dòng, căn trái, cuộn cả khung

**Files:** Modify `apps/app/components/detail-sheet.tsx`, `apps/app/components/crm/record-sheet/record-parts.tsx`. Không chạm `responsive-sheet.tsx`: `DetailSheetHeader` tự chọn `DrawerHeader align="start"` khi `useIsMobile()`.
**Phục vụ:** E1, E8, E9, E10. `independent: false`.

**Interfaces — Produces:**
- `DetailSheetTable({ children })` → `<div data-slot="detail-sheet-table" className="px-5 py-3">`.
- `DetailSheetStats` mang `data-slot="detail-sheet-stats"`; `DetailSheetStat` dd: `truncate` chỉ từ `md` trở lên, dưới `md` xuống dòng (`wrap-anywhere`).
- `DetailSheetHeader` dùng `DrawerHeader align="start"` của `@crm/ui` khi `useIsMobile()`, ngược lại `SheetHeader` như cũ.
- `CuonCaKhung` context + `RecordSheetFrame` prop `cuonCaKhung?: boolean`: khi `useIsMobile()` và bật → một vùng cuộn `data-cuon-ca-khung` bọc đầu khung, ô số, tab; `TabsList` bọc khối `sticky top-0 z-10 bg-background`; `DetailSheetBody`/`TabsContent` bỏ `overflow` riêng.

- [ ] Bài DOM (Task 8 chứa) cho cấu trúc; ở đây verify bằng `bun run check-types --filter=app` và bản mẫu.
- [ ] Commit `feat(app): khung chi tiết có khe bảng, căn trái và cuộn cả khung trên điện thoại`.

### Task 3: Khung Mục tiêu — bảng có lề, tab không trùng, số ít, liên kết chéo

**Files:** Modify `objective-sheet.tsx`, `objective-hien-thi.tsx`, `apps/app/lib/messages/okr.ts` (thêm `sheet.tabVetNhan`, `sheet.tienDoTuSo`), `apps/app/test/messages-guard.spec.ts` (ghim khoá mới).
**Phục vụ:** E1, E6, E7, E14. `independent: false`.

- [ ] `TabKr`: `<DetailSheetTable><BangKr …/></DetailSheetTable>`; `TabCanChinh` và tab Vết bọc bảng tương tự; nhãn tab Vết `m.tabVetNhan`; dòng tiến độ `m.tienDoTuSo(x, n)`; `RecordSheetFrame cuonCaKhung`.
- [ ] `HopMucHienThi`: nút «Mở tab Căn chỉnh» bọc `DialogClose asChild`, onClick đặt `sangCanChinh.current = true`; `onOpenChange(false)` gọi `moCanChinh()` khi cờ bật, ngược lại `dong()`. Bộ giữ thay đổi của `Dialog` hỏi trước khi gọi.
- [ ] `messages-guard.spec.ts -t` của khoá mới xanh.
- [ ] Commit.

### Task 4: Chip Kara cùng hình và cùng chỗ với nhãn

**Files:** Modify `chip-gop-y.tsx`, `khoi-muc-tieu.tsx`.
**Phục vụ:** E11, E12, E13. `independent: true` so với Task 5.

- [ ] Chip: `<Badge asChild variant="outline" tuongTac><button …><KaraMark …/></button></Badge>`, giữ `aria-label`, `data-chip-gop-y`, `stopPropagation`.
- [ ] `khoi-muc-tieu.tsx`: bọc nhãn loại, trạng thái, giới hạn và `nhan` trong `<span data-nhom-nhan className="inline-flex shrink-0 flex-wrap items-center gap-2">`.
- [ ] Commit.

### Task 5: Nút soạn giữ một chỗ, chữ phụ vào popover

**Files:** Modify `okr/soan/nut-soan.tsx`, `theo-don-vi/theo-don-vi.tsx` (NutSoan cuối hàng), `apps/app/lib/messages/okr-soan.ts` (thêm `nut.thongTin`, `nut.thongTinTieuDe`), `messages-guard.spec.ts`.
**Phục vụ:** E2, E3, E4, E5, E18. `independent: true` so với Task 4.

Bảng dạng → nhóm (mọi nhóm là `<span data-nhom-soan>` ở cuối `[data-hang-nut]`):

| Dạng | Nút chính | «i» chứa |
|---|---|---|
| `!cauNoi`, quản trị | khoá «Soạn…» | `nut.chuaCauHinh` |
| `!cauNoi`, không quản trị | không có nhóm | — |
| đang tải / lỗi | khoá «Soạn…», không «i» | — |
| hết cuộc | khoá | `hetCuoc` + nút `dsCuoc` |
| tạm nghỉ | khoá | `tamNghi` |
| chưa có khoá | khoá | `lyDo.chua-co-khoa-mo-hinh` |
| có cuộc đang soạn | «Tiếp cuộc đang soạn» | `tiepMoTa` + nút `dsCuoc` |
| chế độ ẩn (quản trị) | «Soạn…» | `cheDoAn` + `cheDoAnMoTa` + nút `dsCuoc` |
| mở được, đã dùng > 0 | «Soạn…» | nút `dsCuoc` |
| mở được, chưa dùng | «Soạn…», không «i» | — |

- [ ] Viết lại `NutSoan` theo bảng; `soanSanSang` dùng `skipToken` khi `!cauNoi`; nút «i» `data-nut="thong-tin-soan"`, `aria-label={m.nut.thongTin}`.
- [ ] Commit.

### Task 6: Bài DOM của hồ sơ

**Files:** Create `apps/app/test/khung-okr-truoc-r1.dom.tsx`, `apps/app/test/khung-khung-okr-truoc-r1.tsx` (khung dựng riêng: tRPC giả có `okr.soanSanSang`, `okr.setHienThi`, chu kỳ pha `lap-ke-hoach`, quyền quản trị bật/tắt; dữ liệu parse bằng schema thật của `apps/api`).
**Phục vụ:** E2, E4, E5, E6, E7, E11, E14. Lệnh: `config:executors.test.r1a_*`.

- [ ] Sáu `describe` mang đúng tên `-t`: `nut-soan`, `popover-soan`, `chua-cau-hinh`, `tab-khung`, `so-it`, `chip`, `lien-ket-cheo`; mỗi bài in số ca và ghim thông điệp đỏ đúng chuỗi của `expected`.
- [ ] Phá-thử từng chiều đỏ trên bản sao (thư mục `.acceptance-runs/khung-okr-truoc-r1/`), ghi lệnh và thông điệp đỏ vào `rang/do-do.md`.
- [ ] Commit.

### Task 7: Phép đo màn thật

**Files:** Create `_acceptance/khung-okr-truoc-r1/rang/san-khung.mjs` (seed), `man-khung.mjs` (`--phan le|thanh|dien-thoai|chip`, cờ `--kiem-do-do`, `--tat-chan`), `bon-vai.mjs` (bốn vai, cờ `--kiem-do-do`, `--kiem-do-vai`).
**Phục vụ:** E1, E3, E8, E9, E10, E12, E13, E15, E18.

- [ ] Viết theo khuôn `gop-y-dung-cho/rang/man-gop-y.mjs` (phiên đo, cookie, puppeteer-core, con lăn).
- [ ] Chạy từng phần qua `mot-luot.sh` trên cây, xanh; chạy từng chiều đỏ, đúng thông điệp.
- [ ] Commit.

### Task 8: Bộ kiểm của kho

- [ ] `bun run test`, `check-types`, `lint`, `lint:slop`, `build` từ gốc; đỏ thì sửa trong task gây ra.
- [ ] Set contract `status: implemented`, commit.
