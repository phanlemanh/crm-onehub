---
schema_version: 1
slug: the-gop-y-sua-nhanh
feature: Thẻ góp ý của Trợ lý OKR thôi để viền «ô được chỉ» kẹt sau khi thoát sửa, trả focus về thẻ, bỏ lời nhắc sai trong hộp Sửa KR, và làm dòng đã quyết đọc được
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

Gốc: hồ sơ `_acceptance/the-gop-y-okr` (Known limits Ngoài-4, Ngoài-9) và buổi lái thử 30/09 ở `docs/plan/lai-thu-the-gop-y-2026-09-30/index.html`.

## Vấn đề & ai gặp

Buổi lái thử thẻ góp ý trên mã production (onehub 0553e0ce, 30/09/2026) thấy:

- **L1 — viền «ô được chỉ» kẹt.** Bấm E hoặc «Sửa» trên thẻ tên rồi Esc hay «Huỷ»: ô «Tên
  mục tiêu» vẫn sáng viền; gõ sang ô «Vì sao lúc này» thì hai ô cùng sáng (ảnh 10, 11). Gốc
  khả dĩ: ô sửa bị gỡ khi đang giữ focus, Chrome không phát blur, nên `onBlur` của thẻ
  (`apps/app/app/(app)/[slug]/okr/the-gop-y.tsx`) không tắt `chiO`.
- **L2 — Esc làm rơi focus bàn phím.** Sau Esc focus không về thẻ (cùng gốc L1).
- **L3 — Ngoài-4.** Hộp Sửa KR có chữ chưa lưu: thẻ câu hỏi hiện «Lưu thay đổi của Mục tiêu
  trước khi mở KR» (ảnh 21). `the-gop-y-props.ts` đặt `lockedReason` cho câu hỏi mà không xét
  `coMoKr`.
- **U1 — viền «chỉ ô» trùng viền focus.** Ảnh 05 và 07 giống nhau; thẻ đang rê không có hover.
- **U4, U6 — dòng đã quyết.** «Câu hỏi — Đã bỏ qua», «Tên KR — Đã bác» không nói câu nào, KR
  nào; dòng đã quyết vẫn có viền như thẻ chờ và xếp lẫn giữa thẻ chờ (ảnh 15, 17).
- **U7 — điện thoại tự cuộn.** Mở lại hộp có sẵn đề xuất ở 390 px là cuộn qua ô tên tới cột
  (ảnh 22; `cuonToi` trong `cot-gop-y.tsx`).
- **Ngoài-9.** Trong lúc một thẻ đang gửi, «Bỏ qua», «Mở KR này», «Bác» ở thẻ khác không khoá.

**Người gặp:** trưởng đơn vị và người phụ trách KR sửa OKR với Trợ lý bật.

## Giả định chốt sinh tử

- Sửa được hết ở tầng giao diện (`packages/ui` + `apps/app`), không đổi API hay tác tử.
- Dấu «được chỉ» mới là một biến thể trong `packages/ui`, không `className` tại chỗ gọi.

## Câu hỏi mở cho Cổng Đáng

- Dấu «được chỉ» là nền nhấn nhạt hay vạch trái màu thương hiệu?
- Dòng đã quyết: trích câu mới hay tên trường + kết quả; có nhóm xuống cuối cột không?
- Gộp Ngoài-9 vào lượt này hay để riêng?

## Gộp

Gộp vào: gop-y-dung-cho (chủ kho quyết 03/10/2026). Phần tự hết vì lượt đó bỏ cột góp ý khỏi hai hộp Sửa và phần thành AC ghi ở `_acceptance/gop-y-dung-cho/contract.md` mục Notes.
