# Kế hoạch thi công — sua-giao-dien-tin-hieu (TH6)

Hợp đồng: `_acceptance/sua-giao-dien-tin-hieu/contract.md` (12 tiêu chí, duyệt 14/10 08:32Z). Thiết kế:
`docs/superpowers/specs/2026-10-14-sua-giao-dien-tin-hieu-design.md`. Luật kho: không chú thích trong mã, không
`useEffect` trong mã app, không sửa `packages/ui`, `apps/api`, `packages/validation`, `packages/db`.

**Thứ tự cứng:** T1 và T8 làm ngay (tệp mới, không đụng TH4). T2–T7, T9 chỉ bắt đầu sau khi phiên điều phối báo
«đã gộp #403 → <sha>» và nhánh đã gộp `origin/onehub` mới nhất (kèm `bun install`, `prisma generate`). Mỗi task kết thúc
bằng lệnh verify của nó; lệnh nặng (cả bộ test) đi qua khoá máy.

## T1 — Tên màn

- Files: `apps/app/lib/tin-hieu/ten-man.ts` (mới), `apps/app/test/ten-man.spec.ts` (mới).
- Việc: `tenMan(duong, locale)` theo bảng trong thiết kế (U7): `MUC_RAIL` + `nhanRail`, `/agents` → mục Hội thoại,
  `/settings/<mục>` → «Cài đặt › <mục>» từ `NHOM_CAI_DAT` + `settingsMessages().thanhBen`, `/reminders` →
  `nhacQuaZaloMessages().tieuDe`, `/tin-hieu` → `tinHieuMessages().menu`; đoạn con và truy vấn bỏ; lạ → nguyên văn.
  Bài đo rút ma trận từ hệ thống tệp lúc chạy (mọi thư mục cấp một có `page.tsx`, kể cả con của nhóm `(agent-builder)`)
  + mọi mục `NHOM_CAI_DAT`, × {vi, en}; in hai thành phần của tổng; cặp đỏ: bản sao bỏ mục reminders → «man reminders chua co ten».
- Verify: `cd apps/app && bun test ./test/ten-man.spec.ts` + lượt phá-thử.
- Phục vụ: E8. independent: true.

## T8 — Hai răng của hồ sơ

- Files: `_acceptance/sua-giao-dien-tin-hieu/rang/ranh-gioi.mjs`, `_acceptance/sua-giao-dien-tin-hieu/rang/do-man.mjs` (mới).
- Việc: `ranh-gioi.mjs` suy gốc kho từ vị trí của nó; `git diff --name-only $(merge-base HEAD origin/onehub)...HEAD` không
  khớp bốn vùng cấm; đếm `expect(` của `apps/app/test/tin-hieu.dom.tsx` ở HEAD ≥ ở merge-base; cờ `--tep`, `--so-expect`
  cho chiều đỏ ghim. `do-man.mjs` theo khuôn `gui-tin-hieu-trong-crm/rang/do-man.mjs` (puppeteer-core, tien-de, phiên đo
  riêng, `canhCay`), ma trận 19 ô viết trước của E12, ghi ảnh vào `BANG_CHUNG` hay `.acceptance-runs/`.
- Verify: `node _acceptance/sua-giao-dien-tin-hieu/rang/ranh-gioi.mjs` (xanh) + hai lượt chiều đỏ; `do-man.mjs` chạy thử
  sau T4–T5 qua `sgt_do_man`.
- Phục vụ: E11c, E12. independent: true.

## T2 — Tệp lời

- Files: `apps/app/lib/messages/tin-hieu.ts`.
- Việc: đổi chữ theo bảng U8 (vi/en); thêm khoá `trang.cot.gui`, `hop.lyDoKhoa`, `trang.khongXoaDuoc`, `trang.daXoa`,
  `trang.xoaHong`, `trang.xoaHongDaLayVe`, `trang.xoaThan` có chỗ điền, `cauSauGom.{chua-gom, le, da-phu, nhom-chua-cat,
  chan-troi, hang}` (AC-12). Bỏ khoá `cot.man`, `cot.guiLuc` khi không còn ai đọc. Giữ khoá TH4 thêm nguyên vẹn.
- Verify: `cd apps/app && bun test test/messages-guard.spec.ts` + `bunx tsc --noEmit -p apps/app`.
- Phục vụ: E9, E10, E14. independent: false (T3–T5 đọc khoá mới).

## T3 — Câu trạng thái song ngữ

- Files: `apps/app/lib/tin-hieu/trang-thai.ts`, `apps/app/test/sua-giao-dien-tin-hieu-cau.spec.ts` (mới).
- Việc: trong `theoKit` (sau TH4) dựng `cau` từ `b.cho` + `m.cauSauGom` + trường bản ghi (`ten_nhom`, `ly_do`, tên hàng từ
  `docNhomHang`/khối); thiếu trường hay mã lạ → `cau_nguoi_gui ?? cau`. Hàm thuần, không đổi khuôn đọc.
- Verify: `sgt_cau_sau_gom` + phá-thử (trả `cau_nguoi_gui` cho mọi mã → đỏ ghim); `gth_trang_thai` của LT2 (E10 dự kiến đỏ
  ở đúng ô câu kit → vào bảng thay ở T6).
- Phục vụ: E14. independent: false.

## T4 — Hộp gửi

- Files: `apps/app/components/tin-hieu/hop-gui-tin-hieu.tsx`, `apps/app/components/tin-hieu/nut-gui-tin-hieu.tsx`.
- Việc: vùng lỗi `Alert variant="destructive"` của cả hộp, bỏ `data-invalid` ở Field; mã lỗi đọc từ `gui.error.data.httpStatus`
  (429 → `dien(hop.quaTran, {tran})` theo locale, khác → `hop.chuaGui`, không bao giờ `error.message`); khoá theo ngày giờ VN
  giữ ở state của `NutGuiTinHieu` (khoá ngày `Intl` `Asia/Ho_Chi_Minh`, so lúc render); dòng `hop.lyDoKhoa` +
  `aria-describedby`; `Dialog coThayDoi` = soạn && có chữ; dòng «Gửi từ màn» dùng `tenMan`, giá trị gửi vẫn đường dẫn.
- Verify: `sgt_loi`, `sgt_cham`, `sgt_dong`, `sgt_ten_man` (phần DOM) + `gth_hop` + `tsc`.
- Phục vụ: E2, E6, E7, E8, E11. independent: false.

## T5 — Danh sách và trang

- Files: `apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx`, `apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx`.
- Việc: bốn cột (kể · Gửi `w-36` · Trạng thái `w-[30%]` · thao tác); `[data-ten-man]`, `[data-gio-gui]` theo locale; mã trong
  dòng phụ (bảng, Item) `translate="no"`; ⋮ cho mọi dòng, Item dùng `icon-lg`, bảng giữ cỡ cũ; mục Xoá khoá + `DropdownMenuLabel`
  lý do khi đã lấy về; `ConfirmDialog` với `noiDung` (điều đã kể) và `onCloseAutoFocus` chặn trả tiêu điểm; trang: xoá →
  `onSuccess` chờ `cache.tinHieu()` rồi dời tiêu điểm theo bảng AC-5 (truy `[data-thao-tac-tin-hieu]`/`[data-tin-hieu]`,
  dòng `tabIndex={-1}`), vùng `aria-live`; `onError` → `Alert` đầu danh sách theo mã (409 / khác).
- Verify: `sgt_bang`, `sgt_gio`, `sgt_ma`, `sgt_tieu_diem`, `sgt_chu` + `gth_trang` + `tsc` + `lint`.
- Phục vụ: E1, E3, E4, E5, E6, E9, E11b, E13. independent: false.

## T6 — Bài và ô đo của LT2

- Files: `apps/app/test/tin-hieu.dom.tsx`, `_acceptance/gui-tin-hieu-trong-crm/evals.yaml`.
- Việc: chạy mọi eval máy của LT2 trên mã mới; sửa đúng khẳng định của các ô trong bảng thay (không bớt khẳng định — E11c);
  khai `status: not-run` + `superseded_by` cho E1, E3b, E5b, E13, E10 theo khuôn EVAL-THAY-BOI-TEMPLATE; đọc lại kỳ vọng E13,
  E14 của LT2. Ô thứ sáu đỏ hay nói ngược → DỪNG, trình chủ kho.
- Verify: mọi lệnh `gth_*` máy của LT2 + `ranh-gioi.mjs`.
- Phục vụ: E11, E11b, E11c. independent: false.

## T7 — Bản mẫu nhập thành phần thật

- Files: `apps/app/app/proto/_modules/sua-giao-dien-tin-hieu/{index.tsx,du-lieu.ts}`, xoá `ban-moi.tsx`; `catalog.ts`
  (bỏ hai trạng thái «Trước»).
- Việc: bản mẫu dựng từ `DanhSachTinHieu`/`HopGuiTinHieu` thật như LT2, để không còn bản nháp song song.
- Verify: `cd apps/app && bun test test/proto-catalog.spec.ts` + `tsc`.
- independent: false.

## T9 — Từ điển

- Files: `CONTEXT.md` (mục «Tín hiệu»).
- Việc: «chờ lấy về, chờ gom» → «đã nhận, đang xem xét», thêm một câu: câu trạng thái sau gom CRM dựng theo ngôn ngữ từ mã
  chỗ của kit.
- Verify: đọc lại; `bun run lint:slop`.
- independent: true.

## Cuối S3

`bun run check-types`, `bun run lint`, `bun run lint:slop` trên cây; contract `status: implemented`; sinh args S4 với
`--diff-base origin/onehub`; Workflow S4 qua khoá máy.
