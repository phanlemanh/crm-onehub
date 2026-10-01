## Vá Trợ lý OKR sau lượt thử 30/09

Lượt thử 30/09 cho thấy Trợ lý OKR đứng im trên prod dù dự án tác tử đã bật OIDC của Vercel, và
có ba chỗ góp ý sai mắt người dùng. PR này vá cả bốn.

### Người dùng thấy gì khác

- Trợ lý OKR chạy được khi dự án tác tử chỉ có vé OIDC của Vercel, không cần cắm khoá AI Gateway.
  Thẻ Trợ lý OKR ở Cài đặt nói rõ nguồn: «Sẵn sàng · qua Vercel», «· khoá chung của tác tử» hay
  «· khoá riêng của Trợ lý OKR».
- Có thể cấp cho Trợ lý OKR một khoá Gateway riêng (`OKR_AI_GATEWAY_API_KEY`) để tách tiền.
  Khi nguồn khoá đổi, tác tử tự kiểm lại sau hạn kiểm, không cần chờ người.
- Trợ lý không còn đề xuất Căn chỉnh chồng lên cùng một nhánh mà Mục tiêu đã căn chỉnh tới.
- Luật «KR đọc như một việc» không bắt nhầm khi người gõ không dấu (ví dụ «Hợp đồng…» không còn
  bị đọc thành «Họp…»).
- Hộp sửa KR chỉ nói một giọng: cột góp ý rỗng không mâu thuẫn với gợi ý dưới ô; dòng xu hướng
  có đơn vị («… khoảng 6,61 tỷ đồng»).
- Câu hướng dẫn khi thiếu khoá lấy tên biến và số phút kiểm lại từ cấu hình, không chép chuỗi.

### Làn thiết kế

Không có thành phần giao diện mới; thẻ Cài đặt và hộp sửa KR chỉ đổi chữ, dùng thành phần của
`packages/ui`. Bộ soát thiết kế tĩnh (E15) xanh trên bốn tệp giao diện chạm tới.

### Bằng chứng

Hồ sơ `_acceptance/va-tro-ly-okr-sau-thu/`: hợp đồng 13 tiêu chí, ba vòng chấm, báo cáo bằng
chứng PASS ở vòng 3, đã ký Cổng Bằng chứng ngày 01/10.

- Vòng 1 trả lại vì bài canh chữ chờ câu xu hướng cũ; đã sửa.
- Bài phán xét luật kho (E14) không thể ra kết quả vì giám khảo không được đọc mã; vòng 3 tách
  thành bài máy quét sáu luật trên 19 tệp của lượt (E16) và bài phán xét chỉ hỏi tài liệu (E17).
  Lỗ thước đã mở việc riêng ở kho kit.
- Sáu hạn chế đã biết ghi ở `## Notes` của hợp đồng, đều là độ bền của phép đo, không phải hành vi
  người dùng thấy.

### Sau khi gộp

Chủ kho soát thẻ Trợ lý OKR trên prod lên «Sẵn sàng · qua Vercel» trong khoảng 10 phút sau deploy.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
