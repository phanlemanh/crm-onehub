---
schema_version: 1
feature: Người điều phối tạo được bộ phận, khuôn, kế hoạch và ghi danh môi giới ngay trên màn — bốn nút đang trần nay làm đúng việc của nó
slug: noi-bon-nut-dieu-phoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [api, ui]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-21T14:17:47Z
design_doc: docs/superpowers/specs/2026-09-21-noi-bon-nut-dieu-phoi-design.md
---

# Acceptance Contract: noi-bon-nut-dieu-phoi

## Context

Chủ kho báo 21/09: «Soạn khuôn» và «Thêm bộ phận» trên prod không làm gì. Rà cả tính
năng «30 ngày đầu» thấy bốn nút chưa gắn hành động (hai nút ở Cài đặt, «Tạo kế hoạch từ
khuôn» ở danh mục, «Thêm môi giới» ở hồ sơ kế hoạch), và thủ tục tạo kế hoạch từ chối mọi
lời gọi từ màn vì đòi ngày dạng `Date`. Không bắt đầu được tính năng từ màn hình, nên
phiên nghiệm thu của `dieu-phoi-30-ngay-dau` và `quan-ly-danh-muc-30-ngay` đang tắc.

## Criteria

- AC-1: Given Cài đặt › Điều phối 30 ngày, When bấm «Thêm bộ phận», nhập tên và lưu, Then một bộ phận mang đúng tên đó được ghi, hộp thoại đóng và bộ phận hiện trong danh sách không cần tải lại trang; tên rỗng thì không lưu được. (cross-layer)
- AC-2: Given có ít nhất một bộ phận, When bấm «Soạn khuôn», nhập tên, loại đối tác tuỳ chọn và hai bước (mỗi bước nhãn, bộ phận, ngày thứ mấy) rồi lưu, Then một khuôn được ghi với đúng tên, loại đối tác và các bước theo đúng thứ tự đã nhập, và hiện trong danh sách khuôn. (cross-layer)
- AC-3: Given chưa có bộ phận nào, When bấm «Soạn khuôn», Then hộp thoại nói phải thêm bộ phận trước và không cho lưu; không lời gọi tạo khuôn nào được gửi.
- AC-4: Given có ít nhất một khuôn, When ở danh mục bấm «Tạo kế hoạch từ khuôn», chọn công ty, khuôn, ngày bắt đầu, người cầm trịch (mặc định là người đang dùng) rồi lưu, Then một kế hoạch được ghi với đúng công ty, khuôn, người cầm trịch và ngày bắt đầu là đúng ngày lịch đã chọn (không lệch ngày theo múi giờ), các bước của nó chép từ khuôn, và danh mục hiện kế hoạch đó. (cross-layer)
- AC-5: Given thủ tục tạo kế hoạch gọi qua HTTP như client của app gọi (thân JSON, ngày bắt đầu là chuỗi), When gửi lời gọi có phiên đăng nhập, Then máy chủ trả thành công và kế hoạch được tạo với đúng ngày đó — không bị từ chối vì sai kiểu. (cross-layer)
- AC-6: Given danh mục đã có kế hoạch, When xem danh mục ở dạng bảng hoặc bảng cột, Then vẫn có nút tạo kế hoạch mới trên thanh công cụ, mở cùng hộp thoại ở AC-4.
- AC-7: Given hồ sơ một kế hoạch, When bấm «Thêm môi giới», tìm và chọn một cá nhân rồi lưu, Then một ghi danh nguồn «tay» của cá nhân đó vào kế hoạch được ghi và phễu cập nhật; nút có mặt cả khi phễu trống lẫn khi đã có người. (cross-layer)
- AC-8: Given một hộp thoại bất kỳ trong bốn hộp thoại, When máy chủ từ chối lần lưu, Then hộp thoại vẫn mở, mọi giá trị đã nhập giữ nguyên, và thông điệp lỗi máy chủ trả hiện trong hộp thoại.
- AC-10: Given một hộp thoại bất kỳ trong bốn hộp thoại đang lưu, When bấm «Lưu» thêm lần nữa trước khi máy chủ trả lời, Then chỉ một lời gọi được gửi và nút Lưu ở trạng thái không bấm được cho tới khi có trả lời.
- AC-9: Given dữ liệu thật trên bàn đo, When chụp bốn hộp thoại đang mở và màn sau khi lưu ở khổ 1440 và 768, Then nhìn thấy trên ảnh đủ ô nhập của từng hộp thoại, bản ghi mới trong danh sách sau khi lưu, và ở khổ 768 hộp thoại không tràn ngang.

## Coverage

- Bỏ coverage-scan — không gian là đúng bốn nút đã gọi tên, mỗi nút ba trạng thái (nhập · lưu xong · lưu hỏng), cộng lỗi kiểu ngày của thủ tục tạo kế hoạch; liệt kê đủ ở AC-1 đến AC-8 và AC-10 (entry `descope` «bỏ coverage-scan» trong `decisions.jsonl`).

## Out of scope

- Đổi tên, lưu trữ, sắp thứ tự bộ phận; sửa và lưu trữ khuôn — thủ tục có sẵn, nối ở vòng sau.
- Đánh dấu bậc phễu của một ghi danh trên màn (thủ tục `markEnrollmentStage` cũng đòi ngày kiểu `Date`) — chưa màn nào gọi, sửa cùng vòng có màn gọi.
- Tạo Cá nhân mới ngay trong hộp thoại Thêm môi giới — chọn Cá nhân sẵn có.

## Notes

- Ô chọn cá nhân chưa có trong kho; ghép từ Combobox theo khuôn của CompanyPicker, đặt cạnh màn điều phối.
