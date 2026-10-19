# Khung soạn chặn liên kết (K2f) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (Native, phiên này tự làm). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bấm liên kết trong khung soạn OKR lúc Kara đang soạn hoặc đang gõ dở thì hỏi trước khi rời; ở lại giữ chữ, rời đi đúng địa chỉ.

**Architecture:** `packages/ui/src/components/giu-thay-doi.tsx` thêm `hoiRoi` vào `GiuNguCanh` và hook `useChanLienKetTrongHop(dieuHuong)` dựa trên `useChanLienKet` sẵn có. `CuocSoanTrongKhung` gọi hook với `router.push`. Không chữ mới (Hỏi-1), đi thẳng không đóng khung trước (Hỏi-2).

**Tech Stack:** React 19, Radix (Sheet, AlertDialog qua `ConfirmDialog`), Next App Router, bun test + jsdom, puppeteer qua `tien-de.mjs`.

**Spec:** `docs/superpowers/specs/2026-10-15-khung-soan-chan-lien-ket-design.md`, hợp đồng `_acceptance/khung-soan-chan-lien-ket/contract.md` (đã duyệt 15/10), `evals.yaml` (E1–E9).

## Global Constraints

- Không chú thích trong code (AGENTS.md).
- Không chữ mới trong `apps/app/lib/messages/*.ts` hay `packages/ui/src/lib/messages.ts` (Hỏi-1).
- `_acceptance/config.yaml` chỉ thêm dòng (luật 7 của đợt) — các khoá `kcl_*` đã thêm ở S1.
- Tên test và thông điệp ghim đúng như `evals.yaml` (`kcl-soan`, `kcl-go-do`, `kcl-roi`, `kcl-khong-do`, `kcl-hop`, `kcl-hop-sach`, `kcl-khong-chan`, `kcl-ngoai`).
- Phép đo màn đi qua `tien-de.mjs` (phiên đo riêng của cây), không chạm cổng 3000/3001.

## Review Focus

- Nút rời chạy `tiep` rồi khung vẫn mở vì điều hướng chậm: người bấm lại liên kết khác → phải hỏi lại, không nhảy hai lần (h5).
- Cờ `boQua` của `useGiuGoc` không được rò sang lần đóng kế sau một lần rời.
- `ConfirmDialog` đóng bằng Esc phải xoá `tiep` đã nhớ, để lần đóng khung kế tiếp không vô tình điều hướng.
- Liên kết bên trong hộp hỏi khác hay trong portal không bị chặn nhầm khi khung không có thứ dở.
- Hook gọi ngoài mọi hộp không được ném lỗi (d3).

---

### Task 1: Cơ chế ở packages/ui

**Files:**
- Modify: `packages/ui/src/components/giu-thay-doi.tsx`
- Test: `packages/ui/test/giu-thay-doi-lien-ket.dom.tsx`

**Interfaces:**
- Produces: `GiuNguCanh.hoiRoi: (tiep: () => void) => void`; `export function useChanLienKetTrongHop(dieuHuong: (href: string) => void): void`.

**Phục vụ:** E2 (kcl-go-do gián tiếp), E3 (kcl-hop), E4 (kcl-hop-sach), E5 (kcl-khong-chan), E6 (kcl-ngoai). `independent: false` (Task 2 dùng hook).

- [ ] Viết test trước: `Sheet` mở, con có `Input` + `<a href="/dich">`, con gọi `useKhaiThayDoi()` khai theo giá trị Input và (trừ `kcl-ngoai`) `useChanLienKetTrongHop(gia)`. Bốn describe, mỗi describe một ca «đếm ô» viết trước: `kcl-hop` 5, `kcl-hop-sach` 2, `kcl-khong-chan` 9, `kcl-ngoai` 1.
- [ ] Chạy: `cd packages/ui && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ./test/setup-dom.ts ./test/giu-thay-doi-lien-ket.dom.tsx` → đỏ vì `useChanLienKetTrongHop` chưa có.
- [ ] Cài: `useGiuGoc` thêm ref `tiepRoi`; `hoiRoi(tiep)` gán ref rồi `datHoi(true)`; `onConfirm` → có ref thì `datHoi(false)`, chạy ref, xoá ref; không thì như cũ. `onOpenChange` của hộp (đóng bằng ở lại/Esc) xoá ref; khi `mo` thành false cũng xoá. Hook `useChanLienKetTrongHop` đọc `GiuContext`, `useCallback` cho `chan`, gọi `useChanLienKet(g?.coThayDoi === true, chan)`.
- [ ] Chạy lại → xanh; chạy `giu-thay-doi.dom.tsx` và `giu-thay-doi-loi-hoi.dom.tsx` → xanh.
- [ ] Phá-thử tại bản sao (E8 cặp b, c, d) ở Task 3; ở đây chỉ commit.
- [ ] Commit `feat(khung-soan-chan-lien-ket): hỏi trước khi rời theo liên kết trong hộp có thay đổi`.

### Task 2: Khung soạn bật chặn liên kết

**Files:**
- Modify: `apps/app/app/(app)/[slug]/okr/soan/trang-soan.tsx`
- Test: `apps/app/test/khung-soan-chan-lien-ket.dom.tsx`

**Interfaces:**
- Consumes: `useChanLienKetTrongHop` của Task 1.

**Phục vụ:** E1, E2, E3, E4. `independent: false`.

- [ ] Viết test trước dùng bộ giả `khung-soan-okr.tsx` + `RecordSheetHost` (như `soan-okr-trong-khung.dom.tsx`): quyền `canManageProgram: true`, `datDanhSach({ thieuBoiCanh: true, dong: BAN_NHAP })`. Describe `kcl-soan` 2 ô, `kcl-go-do` 4 ô, `kcl-roi` 3 ô, `kcl-khong-do` 2 ô; ô chữ `[data-o=hoi-thoai] textarea`, ô số `[data-o-so] input` đầu tiên.
- [ ] Chạy: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test --timeout 10000 --preload ../../packages/ui/test/setup-dom.ts ./test/khung-soan-chan-lien-ket.dom.tsx` → đỏ ở «co hop hoi».
- [ ] Cài: thành phần `ChanLienKetKhung` trong `trang-soan.tsx` gọi `useRouter()` và `useChanLienKetTrongHop(useCallback((href) => router.push(href), [router]))`; dựng trong `CuocSoanTrongKhung`.
- [ ] Chạy lại → xanh; chạy `soan-okr-trong-khung.dom.tsx`, `ngan-ban-ghi-giu.dom.tsx`, `tai-lieu-soan.dom.tsx` → xanh (E6).
- [ ] Commit `feat(khung-soan-chan-lien-ket): khung soạn hỏi trước khi theo liên kết`.

### Task 3: Phép đột biến (E8)

**Files:**
- Create: `_acceptance/khung-soan-chan-lien-ket/rang/dot-bien.mjs`

**Phục vụ:** E8 (và chiều đỏ của E1, E3, E4, E5). `independent: true`.

- [ ] Dùng `dungBanSao`, `goBanSao`, `thayMotLan`, `KhongDo` của `_acceptance/ca-chap-chon-cach-ly/rang/ban-sao.mjs`. Đối chứng dương trên bản sao chưa đổi (lệnh E1–E5) → phải thoát 0, không thì thoát 2. Bốn cặp a–d như `evals.yaml`, mỗi cặp phục hồi tệp sau khi chạy.
- [ ] Chạy `node _acceptance/khung-soan-chan-lien-ket/rang/dot-bien.mjs` → in «kcl dot-bien: 4/4 cắn», thoát 0.
- [ ] Commit.

### Task 4: Phép đo màn thật (E7, E9)

**Files:**
- Create: `_acceptance/khung-soan-chan-lien-ket/rang/man.mjs`

**Phục vụ:** E7, E9. `independent: true`.

- [ ] Dựa trên bàn đo của K2e (`_acceptance/soan-okr-trong-khung/rang/man-chung.mjs`: `chayTrongPhienSoan`, `trang`, `mo`, `guiTin`, `moCuocMoi`, `docCuoc`, `CHON`, `KHUNG`, `m`, `mui`, `MAN`), đăng nhập quản trị `MAN.quanTri`. `--phan man` (mặc định): bước a, b ở 1280 và 375, c ở 1280. `--phan luot`: E9. `--kiem-do-do khong-chan` và `--kiem-do-do dung-luot` cho chiều đỏ.
- [ ] Chạy `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/khung-soan-chan-lien-ket/rang/man.mjs"` và `--phan luot` → thoát 0; hai lệnh chiều đỏ → thoát 1 với đúng thông điệp.
- [ ] Commit.

### Task 5: Lưới của kho

- [ ] `bun run check-types`, `bun run lint`, `bun run lint:slop` → xanh.
- [ ] Đặt contract `status: implemented`, commit, xin lượt `s4`.
