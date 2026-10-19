---
schema_version: 1
feature: "Thành viên đọc khu Mục tiêu thấy một tên cho một khái niệm: Góp vào cho căn chỉnh, OneHub cho đơn vị gốc, Lấy ý kiến thay Hỏi ý — ở cả bản tiếng Việt và tiếng Anh"
slug: doi-nhan-khu-muc-tieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-19-doi-nhan-khu-muc-tieu-design.md
---

# Acceptance Contract: doi-nhan-khu-muc-tieu

## Context

Hàng VK4 của `docs/plan/lo-trinh-okr.json`, dãy V2 đợt `vo-khu-muc-tieu`, Cổng Đáng ký `build` 19/10. Ba tên chốt ở
`CONTEXT.md` ngày 18/10: nhãn màn của căn chỉnh là «Góp vào»; đơn vị gốc mang tên không gian làm việc, «cả công ty»
khi nói phạm vi, «Công ty» khi gọi tên cấp; «Lấy ý kiến» thay «Hỏi ý». Kiểm kê 19/10 (`kiem-ke.json`, mốc
`1fce5d49c`) còn 84 khoá, 142 chuỗi mang tên cũ trong tệp chữ của khu và nhãn dây của sơ đồ. Hàng đổi chữ, đặt tên gốc ở màn còn thiếu,
thêm một luật máy giữ tên, không đổi bố cục.

Source input: hàng VK4 và ô cơ hội đã ký · ba mục `CONTEXT.md` · bản phạm vi `docs/plan/pham-vi-okr-vo-khu-1810.md`
(mã A2) · luật riêng 21 của đợt.

## Criteria

- AC-1: Given các khoá khái niệm «gop-vao» của `kiem-ke.json` ở bản tiếng Việt, When đọc giá trị hiện tại, Then không giá trị nào còn «căn chỉnh», «Đường lý do», «Gắn căn chỉnh», «Gắn thêm» hay «Chưa nối lên»; And thẻ của khung mục tiêu là «Góp vào», khối lý do là «Góp vào đâu», nút thêm là «Thêm chỗ góp vào», trạng thái trống là «Chưa góp vào đâu», cây là «Sơ đồ góp vào» — đúng chữ `CONTEXT.md` gọi tên; And nhãn đọc của dây trên sơ đồ (`packages/ui` `soDo.day`) là «Dây góp vào».
- AC-2: Given cùng các khoá ở bản tiếng Anh, When đọc giá trị hiện tại, Then không giá trị nào chứa «align», «Alignment», «Path of reasons» hay «Not connected»; And sáu nhãn của AC-1 lần lượt là «Contributes to», «Where it contributes», «Add where it contributes», «Not contributing anywhere», «Contribution map», «Contribution line»; And ở khổ 1440 nhãn và nút tiếng Anh dài nhất của thẻ không tràn hay bị cắt.
- AC-3: Given ba màn có đơn vị gốc — ô chọn đơn vị của Theo đơn vị, thanh hành động khu, hàng gốc của bảng độ phủ Lấy ý kiến, When không gian làm việc có tên, Then hàng gốc hiện đúng tên đó trong phần tử `translate="no"`; And khi tên chưa có, chữ dự phòng là «Công ty» / «Company»; And không màn nào của khu hiện «Toàn công ty», «Toàn OneHub», «Whole company» hay «All of OneHub» làm tên.
- AC-4: Given tên cấp và phạm vi của đơn vị gốc (`cap.goc`, cấp mục tiêu `hopThoai.capMucTieu.onehub`, lựa chọn phạm vi số đo và phạm vi Kara · OKR, nút «Về …» của màn không thấy đơn vị), When đọc vi và en, Then tên cấp là «Công ty» / «Company», nút là «Về cả công ty», và câu văn «cả công ty» chỉ phạm vi giữ nguyên.
- AC-5: Given các khoá khái niệm «lay-y-kien» của `kiem-ke.json`, When đọc bản tiếng Việt, Then thẻ khu là «Lấy ý kiến» và không giá trị nào còn «hỏi ý» (mọi hoa thường); And bản tiếng Anh của mọi khoá đó giữ nguyên «call for ideas» như mốc nền.
- AC-6: Given luật máy mới chạy trên mọi giá trị vi và en của `apps/app/lib/messages/okr*.ts`, `tro-ly-okr.ts`, `to-chuc.ts` và hai khoá dây `soDo.day`, `soDo.moTaDay` của `packages/ui`, When một giá trị mang một cụm cấm (vi không phân biệt hoa thường «căn chỉnh», «đường lý do», «chưa nối lên», «gắn thêm», «hỏi ý», «toàn công ty», «toàn onehub»; en «align…», «All of OneHub», «Path of reasons», hoặc đúng bằng «Whole company»), Then bài đỏ và gọi tên tệp, khoá, ngôn ngữ, cụm; And trên cây sau hàng này bài xanh; And `kiem-ke.json` nằm trong commit đứng trước mọi commit của nhánh chạm `apps/**`.
- AC-7: Given bản mẫu dưới `apps/app/app/proto/**` và các bài kiểm có sẵn ghim chữ cũ, When so cây với nền của nhánh, Then không tệp bản mẫu nào đổi và không tệp bản mẫu nào nạp tệp chữ OKR; And bài cũ khẳng định chữ mới, không bài nào bị xoá, bớt ca hay thêm `.skip`/`.only`/`.todo`, và bộ kiểm của kho xanh.
- AC-8: Given hai răng màn của hồ sơ đã ký chạy trong làn máy (`dat-okr-trong-crm/rang/man-okr.mjs`, `toan-canh-okr/rang/man-toan-canh.mjs`), When so với nền, Then mỗi dòng đổi chỉ thay đúng chuỗi cũ bằng chữ mới của AC-1, hằng mới bằng giá trị hiện tại của khoá chữ và chuỗi cũ không còn trong tệp chữ; And mỗi hồ sơ có một dòng sổ `fix` mang `decided_by` chủ kho nêu hàng này; And hai hồ sơ được ghim lại trên đỉnh nhánh trước khi gộp.

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — khái niệm:** Góp vào · đơn vị gốc · Lấy ý kiến [thước CE: ba mục `CONTEXT.md` chốt 18/10 + bảy chuỗi `bat_khi` của hàng] → AC-1…AC-5
- **Trục B — ngôn ngữ:** vi · en [thước CE: `BANG = { en, vi }` của mỗi tệp chữ] → AC-1, AC-2, AC-3, AC-4, AC-5
- **Trục C — nơi chữ sống:** tệp chữ · chữ cứng trong component · tên gốc từ dữ liệu không gian làm việc · câu api/agent [thước CE: kiểm kê ghim trước khi sửa] → AC-1…AC-6 (câu api/agent: Out of scope, VK5)
- **Trục D — giữ lâu:** luật máy · bài có sẵn · thước hồ sơ đã ký · bản mẫu không đổi [thước CE: luật riêng 21; vế «bản mẫu /proto không đổi» của `bat_khi`] → AC-6, AC-7, AC-8

## Đường đo

- Ngưỡng «không còn bảy chuỗi tên cũ trong tệp chữ của khu ở hai thứ tiếng»: số từ bài `dnk-luat` (AC-6) — 0 lỗi trên
  cây là SỐNG; thước bảo đảm: AC-1, AC-2, AC-5, AC-6.
- Vế «bản mẫu /proto không đổi»: số tệp bản mẫu đổi so với nền (AC-7) — 0 là SỐNG.

## Out of scope

- Câu báo lỗi máy chủ, tin nhắc buổi sáng, lời dặn Kara, và tên gốc «OneHub» viết cứng ở `apps/api/src/okr/okr-config.ts` — hàng VK5 `chu-may-sinh-ten-moi`.
- Khoá mã, tên tệp, đường dẫn `/okr/hoi-y` (`CONTEXT.md` mục «Lấy ý kiến»), tên thẻ «Toàn cảnh» và thanh bên (VK1, VK2).
- Thước hồ sơ đã ký nằm ngoài làn máy (ô `ui-check` ghim nhãn cũ), và hai thước đã lệch trước hàng này (`dot-hoi-y-tuong-okr/rang/soi-ma.mjs`, `gan-tay-va-kara-co-ly-do/rang/ranh-gioi.mjs`).
- Trang mẫu `apps/app/app/proto/**`.

## Notes

- Bảng thay chữ nằm trong design doc; bảng chữ cũ → mới từng khoá do `rang/bang-chu.mjs` sinh.
- Hai hồ sơ đã ký phải ghim lại ở đuôi vòng: `dat-okr-trong-crm`, `toan-canh-okr` (giám sát trả yêu cầu V2-2, 19/10).
