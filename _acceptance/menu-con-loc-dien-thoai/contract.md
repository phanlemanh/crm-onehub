---
schema_version: 1
feature: «Menu con của bộ lọc mở được trên điện thoại — không còn nằm ngoài màn ở khổ 375»
slug: menu-con-loc-dien-thoai
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-08T01:49:39Z
design_doc: docs/superpowers/specs/2026-10-08-menu-con-loc-dien-thoai-design.md
---

# Acceptance Contract: menu-con-loc-dien-thoai

## Context

Trên điện thoại, menu con của mọi tiêu chí lọc mở ra ngoài màn (đo 07/10: x=359, rộng 208, khung 375), nên người
dùng không chọn được lựa chọn nào — lỗi có từ trước, tách từ E7 `datatable-loc-ro` (OOS-6). Vòng này sửa
`DropdownMenuSubContent` của `packages/ui` để menu con tự dịch vào trong màn đúng bằng phần tràn, mọi menu con
(bộ lọc bảng, Kanban, thao tác hàng loạt) đúng cùng lúc.

Source input: yêu cầu P3-5 và luật 24 của đợt sau-14-10 (Cổng Đáng `build` 2026-10-08T00:51:04Z);
`_acceptance/menu-con-loc-dien-thoai/opportunity.md`; thiết kế anh duyệt 08/10 (menu con đè một phần menu cha).

## Criteria

- AC-1: Given người đăng nhập trên app thật ở khổ 375, When ở danh sách thoả thuận mở «Lọc» rồi chạm tiêu chí «Giai đoạn», Then hộp menu con nằm trọn trong khung nhìn (mép trái ≥ 8 px, mép phải ≤ 367 px), không tràn ngang trang; When chạm (sự kiện chạm của màn cảm ứng, không phải chuột) một giai đoạn trong menu con đó, Then địa chỉ mang tham số `stage` của giai đoạn vừa chạm.
- AC-2: Given khổ 375 ở danh sách cá nhân, When mở tiêu chí «Công ty» (menu con có ô tìm), Then hộp menu con và ô tìm nằm trọn trong khung nhìn, và gõ vào ô tìm thì chữ hiện trong ô.
- AC-3: Given khổ 1440, When mở «Lọc» rồi «Giai đoạn» ở danh sách thoả thuận, Then menu con không bị dịch khi đủ chỗ — vị trí hộp bằng đúng vị trí khi tắt lớp dịch (lệch ≤ 1 px), ở phía nào Radix đặt nó (nút «Lọc» nằm sát mép phải nên Radix lật menu con sang trái như trước vòng này) — và hộp nằm trọn trong khung nhìn.
- AC-4: (kiểm không hồi quy) Given khổ 768 ở danh sách thoả thuận đã chọn ít nhất một dòng, When mở menu thao tác hàng loạt rồi một menu con của nó (đổi người phụ trách), Then hộp menu con nằm trọn trong khung nhìn.
- AC-5: Given `DropdownMenuSubContent` của `packages/ui` mở ra, When nơi gọi không truyền `className`, Then menu con mang lớp dịch ngang cho cả phía phải (`data-[side=right]`, theo `--radix-popper-available-width`) lẫn phía trái (`data-[side=left]`); When nơi gọi truyền `className` riêng, Then `className` được ghép thêm, không thay lớp dịch; và `collisionPadding` mặc định là 8 (hiệu quả đo ở AC-1: mép phải ≤ 367 ở khổ 375).
- AC-6: Given các bài kiểm sẵn có của bảng dùng chung và bộ lọc (`data-table-loc-ro`, `data-table-locale`, `render-diff`, `lai-ra-man` của `packages/ui`; `bang-crm-loc-ro` của app), When chạy lại sau thay đổi, Then cả năm tệp thoát 0 không sửa kỳ vọng.
- AC-7: Given tệp giao diện sửa của vòng (`dropdown-menu.tsx`), When chạy sàn thiết kế của kho, Then không vi phạm P0, và không tệp nào ngoài `packages/ui` thêm `className` đổi vị trí cho menu con.

## Coverage

Quét bằng `morphological-scan` preset test-matrix (S1, 08/10).

- Trục A — Chỗ trống: đủ chỗ (phía Radix chọn, kể cả lật trái như ở 1440) | thiếu chỗ cả hai phía (Radix giữ phải) | bị lật sang trái mà vẫn thiếu [thước CE: hành vi `flip`/`shift` của `@radix-ui/react-popper` 1.3.7 — SUY-TỪ-REPO `node_modules/.bun/@radix-ui+react-popper@1.3.7*/dist/index.mjs` dòng 141–153]
- Trục B — Nơi dùng menu con: bộ lọc bảng | bộ lọc có ô tìm | Kanban | thao tác hàng loạt [thước CE: mọi nơi nhập `DropdownMenuSubContent` — grep 08/10: `data-table.tsx`, `bulk-actions.tsx`, `contacts-bulk-actions.tsx`, `deals-bulk-actions.tsx`]
- Trục C — Khổ: 375 | 768 | 1440 [thước CE: luật kho đo hai khổ cho mặt người nhìn; 768 vì thao tác hàng loạt chỉ có từ sm]
- Core → AC: thiếu chỗ phải ở 375 (AC-1) · có ô tìm (AC-2) · đủ chỗ không dịch (AC-3) · thao tác hàng loạt (AC-4) · lớp và mặc định của thành phần (AC-5) · hồi quy (AC-6) · sàn thiết kế (AC-7).
- Later: đo ca lật trái mà vẫn thiếu chỗ trên màn thật (cần dựng menu cha bám mép phải); Kanban ở 375 (cùng thành phần, cùng lớp).
- Never: viết lại định vị riêng; đổi menu con thành dạng đi sâu.

## Đường đo

- Thước: 5/5 người lạ trên điện thoại mở một tiêu chí và chọn được lựa chọn · số từ: nhật ký vấp của lái-thử người-lạ trên production (nghi thức `uat-session` §0), cảnh «lọc thoả thuận theo giai đoạn trên điện thoại» · bảo đảm bởi: AC-1, AC-2
- Thước: menu con nằm trọn trong màn ở 375 và 1440 · số từ: phép đo màn `rang/do-man.mjs` (toạ độ hộp so với khung nhìn) · bảo đảm bởi: AC-1, AC-3

## Out of scope

- Đổi menu con thành dạng «đi sâu rồi quay lại» trên điện thoại.
- Sửa tệp thao tác hàng loạt (`bulk-actions.tsx`, `*-bulk-actions.tsx` — ranh giới K6b/V2 của P2); chúng được lợi qua thành phần dùng chung, không đổi mã.
- Đo trên màn thật ca menu con bị lật sang trái mà vẫn thiếu chỗ — chỉ kiểm lớp CSS ở AC-5.
- Bề rộng và chiều cao tối đa của menu con (giữ như hiện tại).

## Notes

- Không migration, không đổi API.
- Đường nền đo xanh trên onehub `f7ef8adaa` (2026-10-08T01:06:24Z).
