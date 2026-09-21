---
schema_version: 1
feature: Môi giới mà nền tảng gửi lên với mã chưa khớp ai được tác nhân tra ra và ghép vào kế hoạch, thay vì nằm im
slug: tac-nhan-khop-ma-doi-tac
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, config]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-21-tac-nhan-khop-ma-doi-tac-design.md
---

# Acceptance Contract: tac-nhan-khop-ma-doi-tac

## Context

Điểm nhận dữ liệu từ nền tảng OneHub (hồ sơ `dieu-phoi-30-ngay-dau`) khớp môi
giới với Cá nhân chỉ bằng mã nền tảng. Mục không khớp thì hôm nay nằm im: lô không
mang danh tính để tra, bốn mốc ngày bị bỏ, và tác nhân không có nhánh cho loại việc
đó. Vòng này nối lại đường: lô mang danh tính, mục không khớp được giữ trọn, tác
nhân tự ghép khi khớp đúng email hoặc số điện thoại với một Cá nhân, và mọi ca còn
lại hiện cho người quyết trên hồ sơ kế hoạch.

Hạng T3 vì vòng này thêm một bảng vào lược đồ cơ sở dữ liệu.

Source input: `_acceptance/tac-nhan-khop-ma-doi-tac/opportunity.md` (Cổng Đáng ký
«build» 2026-09-21) cộng bốn điểm thiết kế chủ kho duyệt cùng ngày.

## Criteria

- AC-1: Given điểm nhận đã khai khoá, When gửi một lô mà mỗi mục mang thêm tên, số điện thoại, email — hoặc không mang trường nào trong ba — Then lô được nhận; còn một mục mang email sai khuôn thì cả lô bị từ chối 400 với thông điệp nêu tên trường.
- AC-2: Given một mục mang mã không khớp ai, When gửi lô, Then một hàng chờ ghép được lưu với đủ danh tính và bốn mốc của mục đó, cùng đúng một việc cho tác nhân trỏ vào hàng ấy; gửi lại cùng mã cho cùng kế hoạch thì cập nhật hàng cũ, không sinh hàng thứ hai. (cross-layer)
- AC-3: Given một hàng chờ ghép có email trùng đúng email của MỘT Cá nhân (không phân biệt hoa thường, bỏ khoảng trắng hai đầu), When tác nhân xử lý việc, Then ghi danh của Cá nhân đó vào kế hoạch được tạo với đủ bốn mốc, mã nền tảng được ghi vào trường của Cá nhân, và hàng chờ chuyển sang đã ghép.
- AC-4: Given số điện thoại của hàng chờ và của một Cá nhân chỉ khác cách viết (+84 912 345 678 so với 0912345678), When tác nhân xử lý, Then kết quả giống AC-3.
- AC-5: Given email hoặc số điện thoại của hàng chờ trùng HAI Cá nhân trở lên, When tác nhân xử lý, Then không ghi danh nào được tạo, không trường nào được ghi, và hàng chờ mang đủ các Cá nhân đó làm ứng viên với lý do khớp.
- AC-6: Given hàng chờ chỉ khớp một Cá nhân bằng tên đầy đủ (giữ dấu), When tác nhân xử lý, Then không ghi gì mà chỉ đề xuất ứng viên đó; còn tên chỉ khác dấu («Nguyen Van An» so với «Nguyễn Văn An») thì KHÔNG thành ứng viên.
- AC-7: Given Cá nhân khớp email đã mang một mã nền tảng KHÁC, When tác nhân xử lý, Then mã cũ giữ nguyên, không ghi danh nào được tạo, và ca đó thành đề xuất.
- AC-8: Given không Cá nhân nào khớp email, số điện thoại hay tên, When tác nhân xử lý, Then không ghi gì, và hàng chờ ở trạng thái «không tìm thấy», vẫn hiện cho người.
- AC-9: Given việc `onboarding-identify` với payload hỏng hoặc trỏ tới hàng chờ không còn, When tác nhân nhận việc, Then việc kết thúc với lỗi có tên, không được đánh dấu xong lặng lẽ; và loại việc này có trong sổ đăng ký loại việc, chạy ở làn thẳng không qua mô hình.
- AC-10: Given một môi giới đã được ghép ở vòng trước, When nền tảng gửi lô tiếp theo cùng mã, Then điểm nhận khớp thẳng và cập nhật ghi danh, không sinh hàng chờ hay việc tác nhân nào. (cross-layer)
- AC-11: Given hồ sơ kế hoạch có hàng chờ ở trạng thái đề xuất, When người bấm «Đúng người này» ở một ứng viên, Then ghi danh của ứng viên đó được tạo với bốn mốc của hàng chờ, mã nền tảng được ghi vào Cá nhân, và dòng biến khỏi khối Chờ ghép. (cross-layer)
- AC-12: Given hồ sơ kế hoạch có hàng chờ, When người bấm Bác rồi xác nhận, Then hàng chờ chuyển sang đã bác, không ghi danh nào được tạo, và dòng biến khỏi khối; bấm Bác rồi huỷ thì không đổi gì.
- AC-13: Given hồ sơ kế hoạch có một hàng chờ đề xuất và một hàng chờ không tìm thấy, When mở màn, Then nhìn thấy khối Chờ ghép với hai dòng: dòng đề xuất có tên ứng viên, lý do khớp và nút xác nhận; dòng không tìm thấy nói rõ không tìm thấy ai.
- AC-14: Given email của hàng chờ khớp đúng Cá nhân A còn số điện thoại khớp đúng Cá nhân B khác, When tác nhân xử lý, Then không ghi danh nào được tạo, trường mã của cả A và B không đổi, và hàng chờ đề xuất cả A lẫn B, mỗi người một lý do.
- AC-15: Given một hàng chờ vừa được điểm nhận ghi mà tác nhân chưa xử lý, hoặc việc của nó đã kết thúc lỗi, When mở hồ sơ kế hoạch, Then khối Chờ ghép vẫn hiện dòng đó kèm câu nói rõ nó đang chờ tác nhân hoặc tác nhân không xử lý được. (cross-layer)
- AC-16: Given một bảng mẫu có đáp án gồm mọi ca khớp của hợp đồng này, When mọi dòng chạy qua điểm nhận rồi qua đúng đường giao việc của tác nhân trên cùng một cơ sở dữ liệu, Then số ca ghép nhầm bằng 0 và số dòng đã chấm bằng số dòng của bảng. (cross-layer)

## Coverage

- Bỏ coverage-scan — phạm vi do chủ kho chốt bằng bốn điểm thiết kế ngày 2026-09-21; không gian ca đã liệt kê theo ma trận khớp (một · nhiều · chỉ tên · khác dấu · mã khác · không có · hai tín hiệu trái nhau) ở AC-3 đến AC-8 và AC-14, cộng bảng mẫu có đáp án ở AC-16 (entry `d-20260921T102346Z-1` trong `decisions.jsonl`).

## Đường đo

- Thước: không ca nào ghép nhầm môi giới sang Cá nhân khác · số từ: phép đo trên mẫu đã biết đáp án, chạy mỗi vòng · bảo đảm bởi: AC-16, cùng AC-5, AC-6, AC-7, AC-14
- Thước: việc `onboarding-identify` có nhánh riêng và khuôn payload · số từ: chính mã và bài kiểm · bảo đảm bởi: AC-9
- Thước: ca không chắc hiện cho người trên hồ sơ kế hoạch · số từ: màn hồ sơ kế hoạch · bảo đảm bởi: AC-11, AC-12, AC-13, AC-15

## Out of scope

- Tạo Cá nhân mới từ lô nền tảng — tác nhân chỉ ghép vào Cá nhân sẵn có (giả định 1 của hồ sơ cơ hội).
- Nối thật với nền tảng OneHub (bên gửi) — việc của đội nền tảng; vòng này chỉ đổi khuôn nhận.
- So khớp gần đúng (bỏ dấu, sai chính tả, tên đảo thứ tự) — luật kho cấm, vì khớp nhầm một người thật tệ hơn để trống.
- Tra danh tính ngoài CRM (LinkedIn, dịch vụ làm giàu) — vòng này chỉ tra dữ liệu đã có trong CRM.
- Sửa cách điểm nhận ghi đè mốc bằng giá trị rỗng (Ngoài-17 của hồ sơ trước) — ô riêng.

## Notes

- Tác nhân chạy ở làn thẳng, không qua mô hình ngôn ngữ, theo tiền lệ `slack-people-match`: việc khớp đúng email hoặc số điện thoại không có gì phải quyết.
- Khuôn lô nền tảng đổi (thêm ba trường không bắt buộc). Lô cũ không mang ba trường vẫn hợp lệ.
