## Gửi tín hiệu trong CRM (LT2)

Người dùng CRM bấm «Gửi tín hiệu» ở đầu mọi màn, trả lời hai câu («Bạn đang muốn làm gì?», «Điều gì
xảy ra, hoặc còn thiếu gì?»), rồi xem tín hiệu của mình ở trang «Tín hiệu đã gửi»: chờ đội sản phẩm lấy
về, chờ gom, vào nhóm nào, thành việc nào, đã giao chưa. CRM chỉ GHI tín hiệu; lượt gom kéo tín hiệu về
git bằng `bun run tin-hieu:keo-ve` (lối 1, Cổng Đáng 12/10); bộ kit gom nhóm và viết câu trạng thái.

Hồ sơ: `_acceptance/gui-tin-hieu-trong-crm/` · hàng LT2 của `docs/plan/lo-trinh-okr.json` · hạng T3
(bảng `tinHieu` mới).

### Gộp

- Chỉ gộp khi crm đã nhận kit ≥ 2.27 (từ 15/10) — trước đó trang hiện trạng thái lúc gửi kèm một dòng
  báo, không vỡ.
- Gộp sau vòng LT1b (ngăn hồ sơ trong trang Lộ trình). Vòng này không đụng tệp của LT1b; chỉ đọc
  `apps/app/lib/lo-trinh/doc-du-lieu.js` và `doc-tep.ts`.
- Migration `20261012030857_tin_hieu` chỉ thêm bảng; soát `origin/onehub` không có migration nào sắp sau
  trước khi gộp.

### Khối giao diện mới — bậc đã dừng (`docs/design.md` «Vẽ tay là bậc cuối»)

- Nút «Gửi tín hiệu» + hộp hai câu (`apps/app/components/tin-hieu/hop-gui-tin-hieu.tsx`): dừng ở bậc 1 —
  `Dialog`, `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `Textarea`, `Button`, `Spinner` của
  `packages/ui`; khuôn ghép theo hộp «Báo sai» (`tai-lieu/hop-bao-sai.tsx`). Không tra bậc 2–4: bậc 1 đủ.
- Danh sách «Tín hiệu đã gửi» (`danh-sach-tin-hieu.tsx`): dừng ở bậc 1 — `SimpleTable` từ `md`, `Item`
  dưới `md`, `StatusIndicator` + `toneTheoNghia`, `Empty`, `DropdownMenu` (menu ⋮ như
  `settings/onboarding/danh-sach-khuon.tsx`), `ConfirmDialog`, `VungTaiLoi`.
- Không thêm thành phần mới vào `packages/ui`. Ghi chú design-pass Nhóm 2: `StatusIndicator` chỉ có nhãn
  một dòng — câu dài đi dòng phụ `SimpleTableNote`; chưa cần biến thể.

### Bằng chứng

Báo cáo bằng chứng: `_acceptance/gui-tin-hieu-trong-crm/evidence-report.md` (sau S4).
