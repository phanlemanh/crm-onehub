---
schema_version: 1
feature: «Ngăn chi tiết một việc trên trang Lộ trình trông và dùng y như ngăn chi tiết của Thoả thuận; ba lỗi nhìn thấy trên production được sửa»
slug: lo-trinh-dong-bo-ho-so
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-10T09:25:00Z
design_doc: docs/superpowers/specs/2026-10-10-lo-trinh-dong-bo-ho-so-design.md
---

# Acceptance Contract: lo-trinh-dong-bo-ho-so

## Context

Trang Lộ trình (LT1, `trang-lo-trinh-trong-crm`) lên production 10/10 qua #329. Chủ kho đi thử rồi yêu
cầu ngăn chi tiết việc «sử dụng lại ux/ui để đồng nhất» với ngăn chi tiết của Thoả thuận. Hôm nay ngăn của
Lộ trình tự dựng (khung `Sheet` riêng, thẻ bọc lưới bốn ô), còn ngăn Thoả thuận, Công ty, Liên hệ đi chung
họ khung chi tiết `DetailSheet`. Lượt đi thử cũng thấy ba lỗi nhìn được: cột Mốc bị cắt ở điện thoại, chữ
trong thẻ «Bảng cột» căn giữa, nút «Đã bác» bật hay tắt trông như nhau; và hàng LT1 trong kế hoạch còn
«chưa mở».

Source input: yêu cầu chủ kho 10/10 trong phiên LT1; lượt đi thử production 10/10 (ảnh trong phiên); thiết
kế ở `design_doc`.

## Criteria

- AC-1: Given một việc bất kỳ của khối, When ngăn chi tiết của việc đó mở (từ bảng, bảng cột hay mốc), Then ngăn dựng bằng khung chi tiết dùng chung của ngăn Thoả thuận: đầu ngăn có câu giao làm tiêu đề, dòng `mã · lộ trình · nhóm` và nút đóng; ngay dưới là dải đúng bốn ô theo thứ tự Trạng thái · Mốc · Lộ trình · Nhóm với giá trị của việc; thân ngăn chia mục với tiêu đề mục kiểu chung — «Chi tiết» (chỉ khi có «Coi là thành công khi» hoặc «Vì sao», mỗi dòng một nhãn và một giá trị), «Cần xong trước», «Việc đang chờ việc này» — và mọi nội dung ngăn LT1 đã hứa (khung theo lời ghi, khung lệch kế hoạch với cờ nguyên văn, bấm việc liên quan thì chuyển ngăn, không có dòng lệnh) vẫn đúng.
- AC-2: Given khổ 1280px và cùng một người xem, When mở ngăn chi tiết một việc trên trang Lộ trình và ngăn chi tiết một thoả thuận trên trang Thoả thuận, Then hai ngăn cùng bề rộng, tiêu đề ngăn cùng cỡ và độ đậm chữ, dải ô cùng nền và cùng kiểu nhãn ô, và tiêu đề mục cùng kiểu chữ (cỡ, độ đậm, chữ hoa, màu).
- AC-3: Given khổ 375px, When mở ngăn chi tiết một việc, Then ngăn mở từ dưới lên như ngăn Thoả thuận ở cùng khổ, rộng bằng ngăn Thoả thuận, có tay kéo, trang không cuộn ngang, và đóng được.
- AC-4: Given ngăn chi tiết vừa mở từ một dòng của bảng, When người xem đóng ngăn bằng phím Esc, Then tiêu điểm bàn phím trở về đúng dòng đã mở ngăn (không về đầu trang như ngăn cũ trên production 10/10).
- AC-5: Given khổ 375px và bảng đang hiện việc có mốc, When nhìn cột Mốc, Then mọi ô Mốc hiện trọn ngày mốc và dòng «còn n ngày» / «hôm nay» / «Trễ n ngày» — không ô nào cắt chữ — và trang không cuộn ngang; ở 1280px cột Mốc vẫn như trước (không đổi bề rộng tương đối).
- AC-6: Given cách xem «Bảng cột», When nhìn một thẻ việc, Then câu giao và dòng phụ trong thẻ căn theo đầu dòng (cùng mép trái với nhau), không căn giữa.
- AC-7: Given thanh công cụ của trang, When bật «Đã bác», Then nút ở trạng thái bật nhìn thấy được — viền hoặc nền khác lúc tắt — và trình đọc màn hình đọc được là đang bật; When tắt, Then nút trở về đúng dáng lúc tắt và danh sách trước đó trở lại.
- AC-8: Given kế hoạch `docs/plan/lo-trinh-okr.json` sau vòng này, When đọc hàng LT1, Then hàng ghi trạng thái «đã lên onehub», PR #329 và bước kế là phiên nghiệm thu; `LO-TRINH.html` được vẽ lại khớp kế hoạch, và trang Lộ trình đọc tệp đó thấy LT1 ở nhóm «Đã giao».
- AC-9: Given vòng này đổi khung ngăn và khung chi tiết dùng chung nhận thêm thuộc tính, When chạy lại các phép đo máy của LT1 (hiện, lọc, vòng đời, ngày, cách xem, ngăn hồ sơ, đã bác, đọc khoan dung, chỉ đọc, bản chép, bản mẫu, lời), Then tất cả vẫn đạt; và các ngăn khác dùng khung chi tiết chung (Thoả thuận, Công ty, Liên hệ) không đổi hành vi — bộ kiểm của kho xanh.
- AC-10: Given các tệp giao diện vòng này chạm, When soát theo luật thiết kế của kho, Then không tệp nào đè kiểu một thành phần `@crm/ui` bằng `className`, không vẽ tay thứ đã có thành phần, và khung chi tiết dùng chung chỉ được cộng thêm (chỗ gọi cũ không phải sửa).
- AC-11: Given ảnh ngăn chi tiết việc và ảnh ngăn chi tiết thoả thuận chụp cùng khổ 1280px, When một người dùng CRM nhìn hai ảnh cạnh nhau, Then họ nhận ra đó là cùng một kiểu ngăn (cùng đầu ngăn, dải ô, kiểu mục), chỉ khác nội dung. (judgment)

## Coverage

Bỏ quét không gian tiêu chí theo entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`: phạm vi là một
khung đích có sẵn (ngăn Thoả thuận) cộng bốn lỗi có tên, không phải bài toán liệt kê. Bảng đối chiếu tay:
khung ngăn → AC-1, AC-2, AC-3, AC-4, AC-11 · ba lỗi → AC-5, AC-6, AC-7 · kế hoạch → AC-8 · không vỡ LT1 và chỗ
gọi khác → AC-9, AC-10.

## Out of scope

- Ngăn chi tiết việc có thẻ (Tổng quan / Hoạt động / Kara), nút thao tác hay ghi gì — trang vẫn chỉ đọc.
- Dời ngăn sang khung chồng bản ghi CRM (`?record=`, nút lùi) — giữ tham số `viec` của trang.
- Hai lỗi nhỏ còn lại của lượt đi thử: phím mũi tên phải không mở menu con của «Lọc», và chip trạng thái hiện ở Mốc nhưng ẩn ở Bảng trên điện thoại — để vòng sau.
- Dời bốn khu tự khai màu trạng thái về `status-tone` — việc của NM3.

## Notes

- Đổi `ho-so-viec.tsx` làm bằng chứng LT1 hoá cũ theo `paths`; vòng này ghim lại LT1 trước khi mở PR.
