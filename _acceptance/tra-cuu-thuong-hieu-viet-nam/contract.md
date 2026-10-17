---
schema_version: 1
feature: "Tra cứu thương hiệu không nhầm trang mạng xã hội, trả tiếng Việt, quốc gia theo ngôn ngữ người xem"
slug: tra-cuu-thuong-hieu-viet-nam
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: implemented
approved_by: Manh Phan
approved_at: 2026-10-17T02:50:10Z
design_doc: docs/superpowers/specs/2026-10-16-tra-cuu-thuong-hieu-viet-nam-design.md
---

# Acceptance Contract: tra-cuu-thuong-hieu-viet-nam

## Context

Rep dán trang Facebook của công ty vào ô «Tên miền»; hệ thống rút về `facebook.com`, Kara tra
context.dev theo tên miền đó và đổ thương hiệu Meta (logo, mô tả tiếng Anh, Menlo Park, United States)
vào bản ghi «Công ty BĐS Titan Miền Nam». Ngoài ra mọi lượt tra trả mô tả tiếng Anh vì không xin tiếng
Việt, và tên quốc gia hiện nguyên chữ nhà cung cấp dù ứng dụng có hai ngôn ngữ. Vòng sửa này chặn trang
nền tảng ở ô tên miền, xin context.dev trả tiếng Việt, cho «Tra cứu lại» thay phần máy điền mà người
chưa sửa, và hiện quốc gia theo ngôn ngữ người xem.

Source input: prompt (chủ kho, 16/10, kèm ảnh chụp ngăn công ty Titan)

## Criteria

- AC-1: Given sheet «Công ty mới» đang mở, When rep dán `https://www.facebook.com/titanmiennam` (hoặc `zalo.me/123`, `vn.linkedin.com/company/titan`) vào ô «Tên miền» rồi bấm «Thêm công ty», Then không có yêu cầu tạo nào được gửi, dưới ô hiện câu gọi đúng tên nền tảng theo ngôn ngữ người xem và bảo rep dán trang web riêng của công ty hoặc để trống, và gõ lại vào ô thì câu đó tắt. (cross-layer)
- AC-2: Given ngăn công ty đang mở ở Tổng quan, When rep sửa ô «Tên miền» thành một đường dẫn nền tảng, Then không có yêu cầu sửa nào được gửi, toast báo đúng câu mà sheet «Công ty mới» báo cho cùng nền tảng và ngôn ngữ (một hàm thông điệp sinh cả hai), và tên miền cũ giữ nguyên trên bản ghi.
- AC-3: Given một lời gọi `companies.create` hay `companies.update` gửi thẳng tới API (bỏ qua màn), When tên miền là tên miền nền tảng hay tên miền con của nó, Then API trả lỗi yêu cầu sai và không bản ghi nào được tạo hay đổi.
- AC-4: Given danh sách tên miền nền tảng là một nguồn duy nhất dùng chung cho màn, API và tác nhân, When đưa vào từng tên miền trong danh sách, một tên miền con của mỗi nền tảng, một đường dẫn trang hồ sơ, các tên miền trông giống (`box.com`, `fbx.vn`, `myzalo.me`) và tên miền thường (`datxanh.vn`), Then đúng các mục nền tảng bị nhận ra kèm tên nền tảng, còn các tên miền trông giống và tên miền thường đi qua.
- AC-5: Given một công ty đã mang tên miền nền tảng (như Titan với `facebook.com`), When tác nhân chạy lượt tra thương hiệu (lần đầu hay «Tra cứu lại»), Then không có lời gọi nào tới context.dev, không trừ tín dụng, và bản ghi kết thúc ở trạng thái bỏ qua với lý do gọi tên nền tảng.
- AC-6: Given khoá context.dev đã cấu hình, When tác nhân tra thương hiệu theo tên miền hoặc theo email, Then yêu cầu gửi đi mang `force_language` lấy từ cấu hình tác nhân, giá trị `vietnamese`.
- AC-7: Given lần tra trước đã điền mô tả, ngành, địa chỉ và rep đã sửa riêng ô ngành, When «Tra cứu lại» nhận kết quả mới, Then các trường máy điền mà rep chưa sửa nhận giá trị mới, ô ngành rep đã sửa và các ô rep tự gõ giữ nguyên, và tên công ty vẫn chỉ đổi khi còn là tên tạm bằng tên miền; mô tả công cụ tra của Kara nói đúng luật này (không còn «chỉ điền ô trống»).
- AC-8: Given một công ty có `countryCode` `US` và quốc gia `United States` do máy điền, When người xem mở ngăn công ty ở `vi` rồi ở `en`, Then dòng phụ đầu ngăn và ô «Quốc gia» hiện «Hoa Kỳ» rồi «United States»; còn quốc gia rep tự gõ hoặc không có mã thì hiện nguyên văn ở cả hai ngôn ngữ.
- AC-9: Given bàn đo có một công ty `US` máy điền và sheet «Công ty mới», When chụp ở 1440 và 390 px, Then ảnh cho thấy dòng lỗi nền tảng nằm ngay dưới ô «Tên miền», và tên quốc gia đúng theo ngôn ngữ ở cả dòng phụ lẫn ô «Quốc gia», không tràn ngang.
- AC-10: Given lần tra trước đã điền thành phố, bang và quốc gia mà rep chưa sửa, When «Tra cứu lại» nhận kết quả mới có địa chỉ nhưng thiếu bang, Then ô bang máy điền trở về trống (dòng phụ không còn «Hà Nội, CA, Việt Nam»); và When kết quả mới giống hệt lần trước, Then không ô nào được ghi lại và Kara báo mọi thứ đã có trên bản ghi.

## Coverage

- Trục đường vào: sheet tạo | ô sửa trong ngăn | gọi API thẳng | suy từ email [thước CE: mọi chỗ ghi `company.domain` — `companies.service.ts`, `company-directory.service.ts`]
- Trục đầu vào: nền tảng trần | đường dẫn trang hồ sơ | tên miền con | tên miền thật trông giống | tên miền thường [thước CE: luật khớp hậu tố trong thiết kế mục A]
- Trục lượt tra: lần đầu | tra cứu lại | theo email [thước CE: mọi lời gọi `brand.retrieve` trong `context-dev.ts`]
- Trục hiển thị: vi | en × máy điền khớp mã | người gõ | không có mã [thước CE: `LOCALES` trong `packages/ui/src/lib/locale.ts`]
- Chân ngành: [NGÀNH: Apify Domain List Cleaner; HubSpot excluded domains]
- [GIẢ ĐỊNH] Danh sách 14 nền tảng (thiết kế mục A) đủ cho môi giới bất động sản Việt Nam — người gạch hoặc thêm tại Cổng Phạm vi.
- [GIẢ ĐỊNH] context.dev hiểu `force_language: vietnamese` là dịch mô tả — chỉ thấy trên production sau gộp.

## Out of scope

- Gỡ dữ liệu sai đã đổ vào bản ghi đang mang tên miền nền tảng (logo, mô tả, địa chỉ Meta của Titan) — câu Hỏi-1 ở Cổng Phạm vi.
- Dịch tên ngành («Technology») và tên thành phố — dòng phụ có thể hiện «Menlo Park, CA, Hoa Kỳ · Technology» tới khi đo xong trên production (Hỏi về d-20261016T053428Z-12).
- Ô lưu đường dẫn Facebook/Zalo của công ty (cần cột mới — migration, đường T3).
- Tên miền suy từ email (`company-directory`) không bị chặn khi tạo — địa chỉ @linkedin.com là người làm ở chính công ty đó. Nhưng công ty tạo theo đường này mà mang tên miền nền tảng thì vẫn bị tác nhân bỏ qua tra thương hiệu (AC-5): không logo, không mô tả tự điền (d-20261016T053428Z-13).
- Người xem đặt giao diện tiếng Anh cũng thấy mô tả công ty bằng tiếng Việt: mô tả là một ô dữ liệu, một bản cho mọi người (Hỏi về d-20261016T053428Z-11).
- Câu lỗi tiếng Anh của API và lý do bỏ qua của tác nhân giữ tiếng Anh như các câu cùng loại.
- Chứng hành vi thật của context.dev (có dịch, bộ đệm có tách theo ngôn ngữ) — khoá cục bộ là chuỗi giả; đo trên production sau gộp.

## Notes

- Hỏi-2: AC-7 soạn theo khuyến nghị; người bỏ thì AC-7 rời hợp đồng và bản ghi cũ giữ mô tả tiếng Anh tới khi rep tự xoá.
- Mở lại ở Cổng Bằng chứng 16/10 (Manh Phan): Ngoài-5, Ngoài-6, Ngoài-7 và vế «dán trang web riêng» của câu báo nâng thành phạm vi (AC-10, AC-7, AC-1).

### Known limits

- Ngoài-1: dữ liệu lưu của lần tra trước bị hỏng thì «Tra cứu lại» chỉ điền ô trống, có dòng cảnh báo trong nhật ký nhưng không báo trên màn.
- Ngoài-2, Ngoài-8, Ngoài-12: bàn chụp màn dựng công ty mẫu bằng cách ghi thẳng bảng, không qua đường ghi thật.
- Ngoài-3: script chạy tay điền lại ảnh thương hiệu vẫn đọc dữ liệu lưu theo cách cũ, chưa qua schema mới.
- Ngoài-4: cách rút tên miền từ chuỗi rep dán có hai bản (danh sách nền tảng và máy chủ), hiện cho kết quả khớp nhau.
- Ngoài-9: ca «mỗi tên miền trong danh sách» đếm số ca từ chính danh sách nên không tự đỏ được.
- Ngoài-10: ca «công ty tạo từ email» dựng công ty bằng cách ghi thẳng bảng, không qua đường thư mục công ty.
- Ngoài-11: ca «raw hỏng khuôn» chưa có đối chứng dương cho vế «vẫn điền ô trống».
