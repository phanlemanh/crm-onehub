# Kế hoạch: trang Lộ trình đọc mô hình hiển thị (LT1f)

Thiết kế: `docs/superpowers/specs/2026-10-19-trang-lo-trinh-mo-hinh-hien-thi-design.md` · hợp đồng
`_acceptance/trang-lo-trinh-mo-hinh-hien-thi/contract.md`. Các task phụ thuộc nhau theo thứ tự (cùng vùng
`components/lo-trinh`), chạy tuần tự.

## Task 1 — hàm biên `moHinhCua`

- Files: `apps/app/lib/lo-trinh/mo-hinh.ts` (mới), `apps/app/test/lo-trinh-mo-hinh-mau.ts` (mới),
  `apps/app/test/lo-trinh-mo-hinh.spec.ts` (mới).
- `moHinhCua(lo)` → `{ coMoHinh, mocCuaMa: Map<ma, MocLoTrinh>, chuaHen: Set<ma>, mocHien: Set<MocLoTrinh> }`. Khối mang
  mô hình: đọc `viec_hien`, `chua_hen_moc`, `hien`; khối cũ: luật mốc đầu tiên như `phangViec` hôm nay.
- `tenViec(h)` = `ten_hien_thi ?? cau_giao`.
- Verify: `cd apps/app && TZ=Asia/Ho_Chi_Minh bun test ./test/lo-trinh-mo-hinh.spec.ts`.
- Phục vụ E1, E6. independent: false.

## Task 2 — trang đi qua hàm biên

- Files: `apps/app/components/lo-trinh/viec.ts`, `xem-moc.tsx`, `trang-lo-trinh.tsx`, `dong-lien-quan.tsx`,
  `bang-cot.tsx`, `ho-so-viec.tsx`, `apps/app/lib/lo-trinh/doc-trang.ts`, `cau-hinh.ts`, `apps/app/lib/messages/lo-trinh.ts`
  (chỉ thêm khoá).
- `phangViec` lấy mốc từ `moHinhCua`, thêm `ten`; `tuyChonLoc` + danh sách chọn mốc chỉ mốc hiện; `hopTim` khớp `ten`;
  `XemMoc` lọc mốc theo `mocHien`, nhóm chưa hẹn theo `chuaHen`, dòng số `[data-lo-trinh-moc-dem]` dưới tên lộ trình khi
  `coMoHinh`; `canhBaoChoTrang` gỡ cờ mô hình.
- Verify: `bun run check-types` trong `apps/app`; bộ `lo-trinh*.dom.tsx` cũ xanh.
- Phục vụ E1–E6. independent: false.

## Task 3 — bài kiểm DOM

- Files: `apps/app/test/lo-trinh-mo-hinh.dom.tsx` (mới).
- Sáu describe `ltmh-*` theo `evals.yaml`; mỗi eval một lượt phá-thử trên bản sao (chiều đỏ, thông điệp ghim).
- Verify: sáu lệnh `executors.test.ltmh_*`.
- Phục vụ E1–E6. independent: false.

## Task 4 — thước màn

- Files: `_acceptance/trang-lo-trinh-mo-hinh-hien-thi/rang/do-man.mjs` (mới, theo khuôn `lo-trinh-hien-ngay-du-kien`).
- Verify: `executors.script.ltmh_do_man` mã 0, tám ảnh.
- Phục vụ E7. independent: false.
