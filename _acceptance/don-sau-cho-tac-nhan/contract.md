---
schema_version: 1
feature: "TheDangDung sống ở packages/ui; CardAction và CardFooter không bị className đổi khoảng cách ở chỗ gọi"
slug: don-sau-cho-tac-nhan
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-27-don-sau-cho-tac-nhan-design.md
approved_by: Manh Phan
approved_at: 2026-10-27T07:25:51Z
---

# Acceptance Contract: don-sau-cho-tac-nhan

## Context

Hàng K7c của lộ trình OKR, dọn hai mục Known limits chủ kho ghi khi ký K7 (`cho-tac-nhan-lau`, 17/10). Ngoài-5: thẻ
«Đang dựng» (`TheDangDung`) sống ở `apps/app/components/agent-builder/` thay vì `packages/ui`. Ngoài-11: ở chỗ gọi,
`CardAction` và `CardFooter` mang `className` đổi khoảng cách. Chủ kho ký Cổng Đáng 27/10.

## Criteria

- AC-1: Given cây sau vòng này, When tìm nơi định nghĩa thẻ «Đang dựng», Then `TheDangDung` được định nghĩa đúng một nơi
  là `packages/ui/src/components/the-dang-dung.tsx`; không tệp nào dưới `apps/app` định nghĩa nó; màn chat
  (`agent-builder-chat.tsx`) và bản mẫu `cho-tac-nhan-lau` nhập nó từ `@crm/ui/components/the-dang-dung`; tệp thẻ không
  nhập gì từ `@/` hay từ gói máy chủ (`@crm/db`, `@crm/auth`).
- AC-2: Given tệp thẻ ở `packages/ui`, When đọc `CardAction` và `CardFooter` trong đó, Then cả hai không mang
  `className`; và khi vẽ ra, lớp của `CardAction` và `CardFooter` trong thẻ bằng đúng lớp của một `CardAction`,
  `CardFooter` không tham số.
- AC-3: Given thẻ vẽ với tiến độ 0, 1, 3 và 4 trên 4, When đọc thẻ, Then nội dung giữ như K7: tiêu đề, «n trên 4», bước
  xong hiện tên vật (hoặc «Xong»), bước đang làm mang `aria-current="step"` và dòng «Đang ghi …» khi có, bước sau hiện
  «Đang xếp»; dòng đồng hồ (`data-slot="da-troi"`) và dòng quá ngưỡng (`data-slot="lau-hon"`) chỉ có khi được đưa vào;
  chân thẻ có câu «rời trang» và nút Dừng.
- AC-4: Given màn chat sau vòng này, When chạy lại bài kiểm thẻ của K7 (`apps/app/test/cho-tac-nhan-lau.dom.tsx`), Then
  bài kiểm xanh: đồng hồ tính từ lúc gửi, tăng mỗi giây, dòng quá ngưỡng sau 200 giây, câu chân thẻ đúng.
- AC-5: Given màn `/chat/<id>` thật đang dựng, When mở ở khổ 1280 và 375, dưới và trên ngưỡng, Then thẻ hiện đồng hồ, dòng
  quá ngưỡng đúng lúc, câu «rời trang», và trang không cuộn ngang ở 375 (bài đo màn của K7, có ảnh).

## Coverage

Bỏ quét không gian AC — xem dòng `descope` «bỏ coverage-scan» trong `decisions.jsonl`. Việc một chiều: dời một thẻ và bỏ
hai `className`; AC suy thẳng từ hai mục Known limits của K7.

## Đường đo

Ngưỡng của ô cơ hội đo bằng chính bộ AC, không có thước sau-gộp (việc dọn, không có Cổng Giá trị):

- «thẻ dựng từ `packages/ui`» — AC-1 (E1).
- «không còn `className` đổi khoảng cách trên `CardAction`, `CardFooter`» — AC-2 (E1, E2).
- «màn chờ ở 1280 và 375 trông như trước (tiến độ, đồng hồ, nút Dừng, câu rời trang)» — AC-3 (E3), AC-5 (E5).
- «các bài kiểm của K7 giữ xanh» — AC-4 (E4).
- CHẾT «thêm biến thể vào `Card` mà chỉ một chỗ dùng» — AC-2 (E2 so lớp với `Card` không tham số).

## Out of scope

- `CardContent` của thẻ vẫn mang `gap-2`: hai mục Known limits không nêu nó.
- `CardAction`, `CardFooter` mang `className` ở chỗ khác (`okr/toan-canh/toan-canh.tsx`, bản mẫu `khep-ky-okr`,
  `soan-okr-cung-tro-ly`) — thuộc các hàng NM của lộ trình.
- `translate="no"` cho tên tệp trên thẻ — vòng này dời nguyên trạng.
- Đổi chữ, đổi luồng hay đổi ngưỡng 200 giây của K7.

## Notes

- Khoảng ở đầu và chân thẻ theo Hỏi-1 (sổ): khuyến nghị mặc định của `Card` (đầu thẻ 12 → 8 px, chân thẻ 8 → 12 px);
  lối khác giữ 12/8 px bằng một phần tử bọc trong thẻ. Ảnh trước/sau ở `design-pass.md`.
- Bài kiểm của K7 vẽ thẻ qua `BuildingAgentCard` của màn chat, không nhập thẻ trực tiếp; E4 chặn mọi sửa ở tệp đó.
- Không đụng `packages/ui/src/lib/messages.ts` (#568 đang sửa).
- Known limits — chọn ở Cổng Bằng chứng 2026-10-27:
  - Ngoài-1: Bài kiểm nội dung thẻ «Đang dựng» dùng tên tệp viết sẵn thay vì lấy từ màn chat; nếu màn chat đổi tên hay thứ tự tệp, bài này vẫn xanh dù thẻ trên màn hiện khác.
