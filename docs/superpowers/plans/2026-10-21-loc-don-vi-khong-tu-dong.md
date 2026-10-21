# Kế hoạch — loc-don-vi-khong-tu-dong (DH13)

Hồ sơ: `_acceptance/loc-don-vi-khong-tu-dong/`. Thiết kế: `docs/superpowers/specs/2026-10-21-loc-don-vi-khong-tu-dong-design.md`.

## T1 — Cờ `refreshing` của `DataTable`

- Files: `packages/ui/src/components/data-table.tsx`, `packages/ui/test/data-table-tai-lai.dom.tsx` (mới)
- Việc: prop `refreshing?: boolean`; khi khác `undefined`, bọc `<Table>` trong `VungDangTai dangTai={refreshing}`. Bài DOM
  ba ca (true, false, không truyền) nhóm `ldv-bang`, cộng phá thử hai chiều.
- Verify: `cd packages/ui && bun test --preload ./test/setup-dom.ts ./test/data-table-tai-lai.dom.tsx -t ldv-bang`
- Phục vụ: E7
- independent: true

## T2 — Hàm giữ dữ liệu khi chỉ đổi lọc

- Files: `apps/app/app/(app)/[slug]/okr/theo-don-vi/giu-bang.ts` (mới), `apps/app/test/loc-don-vi-giu-bang.spec.ts` (mới)
- Việc: `giuKhiChiDoiLoc(truoc, truyVanTruoc, dauVao)` trả dữ liệu cũ khi cùng `cycleId` và cùng đơn vị, còn lại
  `undefined`. Ma trận bốn ca nhóm `ldv-giu`.
- Verify: `cd apps/app && bun test ./test/loc-don-vi-giu-bang.spec.ts -t ldv-giu`
- Phục vụ: E6
- independent: true

## T3 — Trang Theo đơn vị không gỡ bảng khi đổi lọc

- Files: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`, `apps/app/app/(app)/[slug]/okr/theo-don-vi/bang.tsx`
- Việc: `placeholderData` của `okr.danhSach` dùng hàm của T2; bỏ `isPlaceholderData` khỏi nhánh khung chờ; `isError`
  đứng trước nhánh bảng; `BangDonVi` nhận `dangTaiLai` và truyền `refreshing` xuống `DataTable`.
- Verify: `bun run check-types` và bài DOM sẵn có của trang (`khung-cho-don-vi.dom.tsx`)
- Phục vụ: E1–E6s, E8
- independent: false (cần T1, T2)

## T4 — Rang đo trên trình duyệt

- Files: `_acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs`, `_acceptance/loc-don-vi-khong-tu-dong/rang/hai-chieu.mjs`
- Việc: giữ `okr.danhSach` bằng `page.route`, lấy mẫu 50 ms, in một dòng mỗi AC (AC-1…AC-6 chu kỳ), chụp ba ảnh E8;
  `LDV_PHA` cho các lối phá: `go-bang`, `khong-mo`, `loi-treo`, `giu-moi-khoa`.
- Verify: `bun scripts/lan-do/tien-de.mjs --chay "bun _acceptance/loc-don-vi-khong-tu-dong/rang/man-loc.mjs"` xanh, và mỗi lối
  phá trên bản sao đỏ đúng thông điệp ghim.
- Phục vụ: E1–E5, E6s, E8
- independent: false (cần T3)

Thực thi tuần tự trong vòng chính — bốn việc nhỏ, hai việc độc lập không đủ lớn để đáng chia worktree.
