# Quét độ phủ — cap-nhat-trong-ngan-kr (SV8)

Preset `entity-feature` (thực thể: một lần cập nhật KR). Bài toán: mọi cách ghi một lần cập nhật KR đi qua một khối trong
ngăn KR; không hộp thoại nào.

## Ngữ cảnh

- Sản phẩm: OneHub CRM, khu Mục tiêu — chân sản phẩm: đào repo (`hop-thoai-cap-nhat-kr.tsx`, `cap-nhat-kr.tsx`,
  `kr-sheet.tsx`, `lich-su-kr.tsx`, `docs/design.md` mục «Ghi vào bản ghi: ngay trong ngăn») · chân ngành: Tability
  (check-in ngay trên KR, xem lịch sử cạnh ô nhập — ảnh chụp 22/10 ở `docs/findings/2026-10-22-hop-tuan/README.md`), và
  khuôn ô soạn trên dòng thời gian của chính kho (`ActivityComposer` của Deal).

## Trục

- Trục A — người xem với KR: sửa được, đến hạn | sửa được, đã cập nhật tuần này | ghi hộ (trưởng đơn vị) | không sửa được
  hay kỳ khoá hay mục tiêu bỏ [thước CE: `coNutCapNhat`, `coTheCapNhat` — SUY-TỪ-REPO: `apps/app/app/(app)/[slug]/okr/cap-nhat-kr.tsx`]
- Trục B — kiểu KR: tăng tới | giảm tới | mốc [thước CE: `XemTruocSo`, `XemTruocMoc` — SUY-TỪ-REPO:
  `apps/app/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr.tsx`]
- Trục C — vòng đời lần ghi: thu | mở | đang gõ | đang gửi | gửi được | gửi lỗi | bỏ nháp [thước CE: mục «Ghi vào bản
  ghi» — SUY-TỪ-REPO: `docs/design.md`]
- Trục D — lối vào: trong ngăn | dòng Họp tuần | dòng bảng theo đơn vị | menu ngăn mục tiêu [thước CE: bốn lối gọi
  `useCapNhatKr` — SUY-TỪ-REPO: `apps/app/components/crm/record-sheet/kr-sheet.tsx`, `objective-sheet.tsx`,
  `apps/app/app/(app)/[slug]/okr/nut-cap-nhat-dong.tsx`]
- Cắt ngang — khổ: ≥ md | < md (ngăn kéo) [thước CE: `RecordSheetHost` < 768 là ngăn kéo]

## Không gian

4 × 3 × 7 × 4 = 336 ô — quét theo lát của Trục C (quan trọng nhất). Gạch: không-sửa-được × mọi giá trị C ngoài «không
khối» (vô nghĩa: không có khối); mốc × «xem trước số» (mốc không biểu đồ).

## Core (10 tiêu chí)

1. A sửa-được và ghi hộ × C thu/mở → AC-1.
2. A không-sửa-được → AC-2.
3. B × C đang gõ → AC-3.
4. C gửi được × B số và mốc → AC-4 (cross-layer).
5. C gửi lỗi → AC-5.
6. C bỏ nháp × {đóng, ‹, ›} → AC-6.
7. D ngoài ngăn × C mở → AC-7.
8. Đầu ngăn + đi KR kế sau gửi → AC-8.
9. Khổ < md × {AC-1, AC-4, AC-7} → AC-9.
10. Thước đã ký và không còn hộp → AC-10.

## Later

- Đang gửi (nút khoá, chữ «Đang gửi…»): cùng hành vi nút của hộp hiện tại.

## Never

- Gửi nhiều KR một lần, ô nhập trên dòng — `docs/design.md` cấm.
- Trang «Cập nhật tuần» đổi hình — ngoài hàng.

## Cross-cutting áp mọi ô Core

- Không `[role=dialog]` nào ngoài ngăn bản ghi.
- Chữ người nhập (ghi chú) mang `translate="no"`.
