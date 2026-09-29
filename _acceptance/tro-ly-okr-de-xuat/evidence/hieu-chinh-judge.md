# Hiệu chỉnh judge — bộ Viết lại (E22 → E25)

Sinh bởi `bun _acceptance/tro-ly-okr-de-xuat/rang/eval-gop-y.mjs` lúc 2026-09-29T06:34:54.436Z, 22 ca bộ Viết lại, judge `zai/glm-5.2-fast` có ZDR, điểm judge trung bình 0.95.

Bảng lấy 20 cặp viết lại đầu tiên gom từ các ca đó (trần soCap), nên số ca và số cặp khác nhau.

Ba ý chấm, nguyên văn câu judge đọc (judge và chủ kho chấm cùng ba ý):

1. Câu đề xuất nói kết quả muốn đạt, không nói việc sẽ làm. Chỉ xét trường đang viết lại: nếu là tên Mục tiêu thì viết bằng chữ, không mang con số, không chỉ là tên một chỉ số kèm hướng tăng hay giảm, không mở đầu bằng động từ việc làm; nếu là tên KR thì gọi tên thứ được đo và không kết bằng cụm mơ hồ như «đạt kết quả tốt».
2. Câu đề xuất giữ ý của người viết câu gốc: không đổi sang mục tiêu khác, không gắn thêm lời tự khen hay khẩu hiệu không đo được («hàng đầu», «được tin cậy», «khẳng định vị thế»); diễn giải cùng ý đó bằng chữ thường không tính là thêm ý.
3. Câu đề xuất trả lời theo ngôn ngữ chiếm đa số trong nội dung câu gốc.

Chủ kho điền cột cuối bằng «Đạt» hoặc «Không đạt» cho từng cặp. Judge Đạt khi điểm bằng 1. Khớp là khi chấm của chủ kho trùng judge; E25 đạt khi khớp ≥ 85% và điểm judge trung bình ≥ 0,7.

| # | Ca | Trường | Gốc | Đề xuất | Judge | Chủ kho (Đạt/Không đạt) |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | gy-01 | title | Triển khai CRM cho đội kinh doanh | Dữ liệu thoả thuận của đội kinh doanh tập trung hoàn toàn trên CRM | 1.00 | Đạt |
| 2 | gy-02 | kr.title | Gọi 50 cuộc cho đối tác mới mỗi tuần | Tỷ lệ đối tác mới được chăm sóc và duy trì sau tháng đầu | 1.00 | Đạt |
| 3 | gy-03 | title | Tăng tốc ký hợp đồng | Hợp đồng với các đối tác được chốt và ký kết kịp thời | 1.00 | Đạt |
| 4 | gy-04 | kr.title | Cải thiện trải nghiệm đối tác | Điểm hài lòng của đối tác đạt 100 | 1.00 | Không đạt |
| 5 | gy-06 | title | Doanh thu 20 tỷ đồng | Doanh thu hoàn thành chỉ tiêu năm | 1.00 | Đạt |
| 6 | gy-07 | title | Launch app v2 cho đối tác | Đối tác theo dõi đơn thuận tiện trên app v2 | 1.00 | Đạt |
| 7 | gy-07 | kr.title | Release v2 lên App Store | App v2 có mặt trên App Store | 1.00 | Không đạt |
| 8 | gy-07 | kr.title | Cuộc gọi hỏi đơn giảm từ 1.000 xuống 500 | Số cuộc gọi hỏi đơn của đối tác | 1.00 | Đạt |
| 9 | gy-08 | title | Tăng MRR mảng SaaS kho | Mảng SaaS kho mở rộng nguồn thu định kỳ khi lượng khách thuê phần mềm kho tăng nhanh | 1.00 | Đạt |
| 10 | gy-09 | kr.title | Onboard 20 partner mới | Số partner mới hoàn tất onboard đạt 20 | 1.00 | Đạt |
| 11 | gy-11 | title | Improve NPS của đối tác | Đối tác hài lòng và gắn kết hơn với dịch vụ | 1.00 | Đạt |
| 12 | gy-14 | kr.title | Tổ chức 3 buổi đào tạo sản phẩm | Số nhân viên hoàn thành đào tạo sản phẩm | 1.00 | Không đạt |
| 13 | gy-15 | title | Giảm chi phí vận tải | Chi phí vận tải được tối ưu hiệu quả khi giá dầu tăng | 0.00 | Không đạt |
| 14 | gy-18 | title | Giảm công nợ quá hạn xuống 8% | Công nợ quá hạn được đưa về mức an toàn | 1.00 | Đạt |
| 15 | gy-20 | title | Q4 OKR: grow pipeline | Pipeline được mở rộng dồi dào cho quý 4 | 1.00 | Đạt |
| 16 | gy-21 | kr.title | Thời gian duyệt hợp đồng giảm từ 6 xuống 2 ngày | Thời gian duyệt hợp đồng | 1.00 | Đạt |
| 17 | gy-01 (lap 1) | title | Triển khai CRM cho đội kinh doanh | Đội kinh doanh quản lý toàn bộ thoả thuận tập trung trên CRM | 1.00 | Đạt |
| 18 | gy-02 (lap 1) | kr.title | Gọi 50 cuộc cho đối tác mới mỗi tuần | Tỷ lệ đối tác mới được kết nối và hỗ trợ trong tháng đầu | 1.00 | Đạt |
| 19 | gy-04 (lap 1) | kr.title | Cải thiện trải nghiệm đối tác | Điểm hài lòng của đối tác | 1.00 | Đạt |
| 20 | gy-06 (lap 1) | title | Doanh thu 20 tỷ đồng | Doanh thu hoàn thành chỉ tiêu năm | 1.00 | Đạt |

Cột «Chủ kho»: chủ kho (Manh Phan) nhận bản chấm máy round 5 trong `evidence/hieu-chinh-phan-tich-may.md` làm chấm của mình ngày 29/09 («Đạt (yếu)» ghi là «Đạt»). Khớp judge 17/20 = 85 %; lệch #4, #7, #12.
