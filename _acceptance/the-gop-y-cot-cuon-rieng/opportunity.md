---
schema_version: 1
slug: the-gop-y-cot-cuon-rieng
feature: Cột góp ý của Trợ lý OKR cuộn riêng với form trong hộp sửa rộng, bỏ số đề xuất lặp hai lần, và hộp mở rộng không làm bố cục nhảy
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

Gốc: hồ sơ `_acceptance/the-gop-y-okr` và buổi lái thử 30/09 ở `docs/plan/lai-thu-the-gop-y-2026-09-30/index.html`.

## Vấn đề & ai gặp

- **U2 — cuộn chung.** Hộp cỡ assist dùng một vùng cuộn `max-h-[70svh]` cho cả form lẫn cột
  (`DialogAssistBody` trong `packages/ui/src/components/dialog.tsx`). Cột 6 thẻ bị cắt ở đáy;
  cuộn để xem thẻ thì form, tiêu đề và số đếm của cột trôi theo (ảnh 05, 15).
- **U3 — lặp số đếm.** Nút «6 đề xuất đang chờ» ở đầu form lặp dòng «6 đề xuất…» đầu cột; câu
  «Nhận là ghi ngay, kèm vết…» chiếm hai dòng mỗi lần mở (ảnh 05).
- **U10 — bố cục nhảy.** Bấm «Nhờ góp ý» làm hộp nở 384 → 800 px và dời form sang trái cùng lúc
  (ảnh 03 → 04).

**Người gặp:** người sửa OKR ở màn ≥ 1024 px với nhiều đề xuất.

## Giả định chốt sinh tử

- Hai vùng cuộn chỉ ở ≥ 1024 px; dưới đó giữ một vùng cuộn như hôm nay.
- Phép đo bố cục E1/E11 của `the-gop-y-okr` đổi theo và hồ sơ đó phải ghim lại.

## Câu hỏi mở cho Cổng Đáng

- Mở sẵn cỡ assist khi Trợ lý đã bật cho đơn vị, hay giữ cỡ mặc định và thêm chuyển tiếp?
- Nút đầu form khi cột đang mở: ẩn, hay đổi thành «Đóng cột»?

## Gộp

Gộp vào: gop-y-dung-cho (chủ kho quyết 03/10/2026). Phần tự hết vì lượt đó bỏ cột góp ý khỏi hai hộp Sửa và phần thành AC ghi ở `_acceptance/gop-y-dung-cho/contract.md` mục Notes.
