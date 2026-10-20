---
schema_version: 1
feature: Mở hay đóng ngăn bản ghi thì ngăn trượt ra, vào như cũ, không biến mất rồi hiện lại, mà vẫn chỉ nạp sẵn đúng các khoá của #469
slug: ngan-ban-ghi-giu-danh-tinh
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-19T15:26:32Z
design_doc: docs/superpowers/specs/2026-10-19-ngan-ban-ghi-giu-danh-tinh-design.md
---

# Acceptance Contract: ngan-ban-ghi-giu-danh-tinh

## Context

Hàng VS8 của `docs/plan/lo-trinh-okr.json`, dãy R1 đợt `viec-du-an-kho-tai-lieu`; Cổng Đáng `build` (chủ kho,
2026-10-19T14:59:33Z). Mở từ Ngoài-8 của `ve-sinh-do-san-onehub`. Từ #469, `NapSanKhiMoNgan` chỉ bọc
`HydrationBoundary` khi ngăn có bản ghi, nên mỗi lần ngăn chuyển giữa rỗng và có bản ghi thì `RecordSheetHost` bị gỡ
rồi dựng lại: đóng thì ngăn biến mất thay vì trượt ra, mở thì ngăn chờ thêm một nhịp rảnh rồi mới mở.

Source input: hàng VS8 (`docs/plan/lo-trinh-okr.json`), `_acceptance/ngan-ban-ghi-giu-danh-tinh/opportunity.md`

## Criteria

- AC-1: Given ngăn bản ghi đang rỗng và trang đã tải xong, When đi lần lượt qua cả năm lối đổi ngăn — mở một bản ghi, lót một bản ghi xuống dưới, đóng bản trên, đóng bản cuối về rỗng, mở bản ghi khác, thay bản trên cùng, đóng hết — Then thành phần chủ ngăn được dựng đúng một lần và không bị gỡ lần nào suốt dãy đó.
- AC-2: Given như AC-1, When mở một bản ghi lúc ngăn đang rỗng, Then cờ «trang đã tải xong» mà ngăn dùng để mở vẫn bật liên tục — ngăn được lệnh mở ngay ở lượt vẽ đầu sau khi bấm, không qua một lượt đóng rồi mới mở.
- AC-3: Given bản chạy thật của cây này và một Thoả thuận đang mở trong ngăn, When đóng ngăn ở khổ 1440 và ở khổ 390, Then phần tử ngăn còn trên trang ở trạng thái đóng với hiệu ứng trượt ra đang chạy, và chỉ rời trang sau khi hiệu ứng đó kết thúc.
- AC-4: Given bản chạy thật và ngăn đang rỗng, When bấm mở một Thoả thuận ở khổ 1440 và 390, Then phần tử ngăn vào trang trong vòng 150 ms kể từ lúc bấm, vào đúng một lần, có hiệu ứng trượt vào đang chạy, và không bị gỡ khỏi trang cho tới khi trượt xong.
- AC-5: Given bản chạy thật và ngăn vừa được đóng, When mở lại một bản ghi trước khi ngăn trượt ra xong, Then ngăn quay lại mở với chính phần tử ngăn đang trượt ra (không bị gỡ rồi dựng phần tử mới).
- AC-6: Given ngăn đang rỗng, When mở một bản ghi, Then trang trong ngăn đọc được dữ liệu ngay lượt vẽ đầu với đúng các khoá nạp sẵn của vai (chỉ OKR: `okr.access`; vai khác: `okr.access`, `users.list`, `giaiDoan.list`), không khoá nào ngoài danh sách đó được đổ vào bộ đệm, lúc ngăn rỗng bộ đệm không mang khoá nạp sẵn nào, và khoá trình duyệt đang giữ bản cũ hơn bản máy chủ thì nhận bản máy chủ.
- AC-7: Given trình duyệt đã có dữ liệu mới hơn bản máy chủ cho một khoá nạp sẵn, When đóng ngăn rồi mở lại, Then dữ liệu mới đó không bị bản máy chủ cũ đè.
- AC-8: Given bài `ngan-ban-ghi-nap-san.dom.tsx` của #469 và phép đo lỗi hydrat của `ve-sinh-do-san-onehub`, When chạy lại cả hai không sửa, Then cả sáu ca DOM vẫn xanh, kể cả ca đối chứng «ngăn không nạp sẵn thì trang đọc rỗng», và mở thẳng đường dẫn có `record=` trên bản chạy thật không sinh lỗi hydrat nào.

## Coverage

- Bỏ quét bằng `morphological-scan`, xem sổ quyết định (bỏ coverage-scan). Trục kê tay:
- Trục A — chuyển của ngăn: `open` rỗng → một (AC-1, AC-2, AC-4, AC-6) | `lotDuoi` một → hai (AC-1) | `close` hai → một và một → rỗng (AC-1, AC-3) | `thayDinh` một → một khác (AC-1) | `closeAll` (AC-1) | đóng rồi mở lại giữa chừng (AC-5) | đóng rồi mở lại sau khi xong (AC-7) [thước CE: mọi lối đổi `record=` trong `record-stack.ts` — SUY-TỪ-REPO: `useRecordStack` trả `open`, `close`, `closeAll`, `thayDinh`, `lotDuoi` — cả năm đổi `record=` qua một hàm `write`]
- Trục B — khổ: 1440 (`Sheet` phải) | 390 (`Drawer` dưới) — AC-3, AC-4.
- Trục C — vai: chỉ OKR | vai khác — AC-6.
- Trục D — bộ đệm: khoá chưa có (AC-6) | khoá đã có, cũ hơn máy chủ (AC-6) | khoá đã có, mới hơn máy chủ (AC-7).

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng; việc sửa hành vi có sẵn, không có thước giá trị riêng (xem sổ quyết định).

## Out of scope

- Đổi hiệu ứng trượt của `Sheet`/`Drawer` trong `packages/ui` (thời lượng, đường cong, `prefers-reduced-motion`).
- Đổi danh sách khoá nạp sẵn theo vai hay cách nạp ở `apps/app/app/(app)/[slug]/layout.tsx` và `lib/ngan-ban-ghi-nap-san.ts`.
- Đổi API của `RecordSheetHost` (VK7 của làn Mac Studio đứng sau hàng này).
- Ngoài-16 của `ve-sinh-do-san-onehub` (bài thứ tự tải của ngăn chưa chứng bắt đúng lỗi gốc) — hàng riêng nếu cần.

## Notes

- Vòng đời (luật 14): không có nút xoá, lưu trữ hay trạng thái kết thúc — không áp.
- Máy chủ không đổi.
- Ranh giới: `apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx`, tệp kiểm mới
  `apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx`, `_acceptance/ngan-ban-ghi-giu-danh-tinh/**`, thêm khoá vào
  `_acceptance/config.yaml` (luật 7: chỉ thêm dòng). Vùng `record-sheet/**` là của làn M5 (luật 19).
- Known limits — chọn ở Cổng Bằng chứng 2026-10-20:
  - Ngoài-1: Bản sao chiều đỏ của phép đo màn không bắt tín hiệu ngắt và dùng chung tên kho đo, nên huỷ giữa chừng có thể để lại bản sao tạm và hai vòng đo cùng lúc phải chờ nhau.
  - Ngoài-2: Lời khai E5/E12 nói đột biến «bản cũ» lấy từ nhánh chính, thực tế là một bản chép cố định.
  - Ngoài-3: Lời khai E3 nói khoá ngoài danh sách là khoá người dùng hiện tại, bài kiểm dùng một khoá mẫu tự đặt.
  - Ngoài-4: Răng chiều đỏ DOM thoát giữa chừng khi lệch neo thì để lại bản sao tạm và bỏ bước kiểm cây sạch.
  - Ngoài-5: Bản sao chiều đỏ của phép đo màn nuốt lỗi dựng, người chạy chỉ thấy «chưa chạy» mà không thấy nguyên nhân.
  - Ngoài-6: Lượt chụp màn hỏng giữa chừng có thể để ảnh lượt trước nằm cạnh nhật ký mới.
  - Ngoài-7: Bài kiểm chưa chứng riêng cho khoá tRPC thật nằm ngoài danh sách nạp sẵn.
  - Ngoài-8: Vế «không có khoá ngoài danh sách trong bộ đệm» của bài kiểm không đỏ được khi ngăn bị sửa hỏng.
  - Ngoài-9: Khi môi trường đo hỏng, phép đo màn có thể báo «tính năng hỏng» thay vì «không đo được».
  - Ngoài-10: Bản sao chiều đỏ của phép đo màn không đặt tên cây riêng, nên dùng chung kho đo với các bản sao khác.
  - Ngoài-11: Bản sao chiều đỏ của phép đo màn không chuyển tín hiệu ngắt và không kiểm bước dựng bản sao.
  - Ngoài-12: Lời khai E3 nói khoá thật, bài kiểm dùng khoá giả (trùng Ngoài-3, mang từ lượt 1).
  - Ngoài-13: Răng chiều đỏ DOM từng đỏ oan khi phép đo màn chạy song song; đã sửa ở lượt 1, mục mang theo từ lượt trước.
  - Ngoài-15: Đột biến «bản cũ» của răng chiều đỏ là chuỗi chép tay, không rút từ nhánh chính như lời khai.
