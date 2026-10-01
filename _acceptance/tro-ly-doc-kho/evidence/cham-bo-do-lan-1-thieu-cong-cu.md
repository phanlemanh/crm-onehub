# Chấm bộ câu đo — 2026-10-01T05:21:45.240Z

Bộ: `_acceptance/tro-ly-doc-kho/bo-do/mam-tam.json` (nhãn `tam`). Máy soạn ngày 2026-10-01 từ bo-do/trang-mau/*.md. Không phải câu thật của nhân viên OneHub; chủ kho chọn bộ «tạm» ở Cổng Phạm vi 2026-10-01.

Lượt một: model `zai/glm-5.2-fast`, khoá undefined. Lượt hai: model agent gốc `zai/glm-5.2-fast`, chỉ dẫn `CHI_DAN_ZALO`.

## Tổng

- dung trang: 100.0% (nguong >= 80.0%) dat
- tu choi dung: 83.3% (nguong >= 80.0%) dat
- Zalo chuyen cau quy dinh: 100.0% (nguong >= 90.0%) dat
- Zalo chuyen nham cau khong phai quy dinh: 20.0% (nguong <= 10.0%) KHONG DAT
- tra loi co trich khong qua kiem (dem lai): 0 dat
- demHoiKho cua cua so chay: traLoi 24, tuChoi 5, loi 0, tiLe 82.8%

## Lượt một — hỏi qua tro_ly_kho

| id | nhóm | câu | nhãn | trạng thái | chi tiết | câu trả lời |
| --- | --- | --- | --- | --- | --- | --- |
| c01 | co-trang | Đối tác tầng 2 được hưởng hoa hồng bao nhiêu phần trăm? | dung-trang | TRA_LOI | trich quy-dinh-hoa-hong-doi-tac-theo-tang; bac 0 | Đối tác tầng 2 được hưởng 1,2% doanh thu thuần của hợp đồng. [quy-dinh-hoa-hong-doi-tac-theo-tang#1: «Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.»] |
| c02 | co-trang | Nhân viên chính thức có bao nhiêu ngày nghỉ phép năm? | dung-trang | TRA_LOI | trich quy-dinh-nghi-phep-nam; bac 0 | Nhân viên chính thức có 12 ngày nghỉ phép năm. [quy-dinh-nghi-phep-nam#1: «Nhân viên chính thức có 12 ngày nghỉ phép năm.»] |
| c03 | co-trang | Hoa hồng đối tác được chuyển khoản vào ngày nào? | dung-trang | TRA_LOI | trich quy-trinh-doi-soat-va-chi-hoa-hong; bac 0 | Hoa hồng đối tác được chuyển khoản vào ngày 15 hằng tháng sau khi đối tác xác nhận. [quy-trinh-doi-soat-va-chi-hoa-hong#1: «Hoa hồng được chuyển khoản vào ngày 15 hằng tháng sau khi đối tác xác nhận.»] |
| c04 | co-trang | Nghi ngờ lộ dữ liệu khách hàng thì phải báo cho ai và trong bao lâu? | dung-trang | TRA_LOI | trich chinh-sach-bao-mat-du-lieu-khach-hang; bac 0 | Khi nghi ngờ lộ dữ liệu, nhân viên phải báo cho bộ phận An ninh thông tin trong vòng 24 giờ. [chinh-sach-bao-mat-du-lieu-khach-hang#1: «Khi nghi ngờ lộ dữ liệu, nhân viên báo cho bộ phận An ninh thông tin trong vòng 24 giờ.»] |
| c05 | co-trang | Khiếu nại thông thường phải giải quyết trong bao nhiêu ngày? | dung-trang | TRA_LOI | trich quy-trinh-xu-ly-khieu-nai-cua-khach-hang; bac 0 | Khiếu nại thông thường phải được giải quyết trong 7 ngày làm việc. [quy-trinh-xu-ly-khieu-nai-cua-khach-hang#1: «Khiếu nại thông thường được giải quyết trong 7 ngày làm việc.»] |
| c06 | co-trang | Công tác phí trong nước mỗi ngày là bao nhiêu? | dung-trang | TRA_LOI | trich quy-dinh-cong-tac-phi; bac 0 | Công tác phí trong nước là 300.000 đồng mỗi ngày. [quy-dinh-cong-tac-phi#1: «Công tác phí trong nước là 300.000 đồng mỗi ngày.»] |
| c07 | co-trang | Nhân viên kinh doanh thử việc bao lâu? | dung-trang | TRA_LOI | trich chinh-sach-thu-viec; bac 0 | Thời gian thử việc của nhân viên kinh doanh là 2 tháng. [chinh-sach-thu-viec#1: «Thời gian thử việc của nhân viên kinh doanh là 2 tháng.»] |
| c08 | co-trang | Biểu mẫu tạm ứng đã ký thì nộp cho phòng nào? | dung-trang | TRA_LOI | trich bieu-mau-de-nghi-tam-ung; bac 0 | Biểu mẫu tạm ứng đã ký thì nộp cho Phòng Kế toán. [bieu-mau-de-nghi-tam-ung#1: «Biểu mẫu đã ký nộp cho Phòng Kế toán.»] |
| c09 | co-trang | Muốn nghỉ phép thì phải xin trước mấy ngày? | dung-trang | TRA_LOI | trich quy-dinh-nghi-phep-nam; bac 0 | Nhân viên muốn nghỉ phép phải gửi đơn xin nghỉ cho quản lý trực tiếp trước ít nhất 3 ngày làm việc. [quy-dinh-nghi-phep-nam#1: «Nhân viên gửi đơn xin nghỉ cho quản lý trực tiếp trước ít nhất 3 ngày làm việc.»] |
| c10 | co-trang | Có được lưu hồ sơ khách hàng trên máy tính cá nhân không? | dung-trang | TRA_LOI | trich chinh-sach-bao-mat-du-lieu-khach-hang; bac 0 | Không được lưu hồ sơ khách hàng trên máy tính cá nhân; hồ sơ khách hàng được lưu trong OneHub Center, không lưu trên máy cá nhân. [chinh-sach-bao-mat-du-lieu-khach-hang#1: «Hồ sơ khách hàng được lưu trong OneHub Center, không lưu trên máy cá nhân.»] |
| c11 | co-trang (nguong-ngoai-le) | Hợp đồng có doanh thu thuần 15 triệu đồng có được tính hoa hồng không? | dung-trang | TRA_LOI | trich quy-dinh-hoa-hong-doi-tac-theo-tang; bac 1 | Không, vì hợp đồng có doanh thu thuần dưới 20 triệu đồng không phát sinh hoa hồng. [quy-dinh-hoa-hong-doi-tac-theo-tang#1: «Hợp đồng có doanh thu thuần dưới 20 triệu đồng không phát sinh hoa hồng.»] |
| c12 | co-trang (nguong-ngoai-le) | Tiền phòng khách sạn khi đi công tác được thanh toán tối đa bao nhiêu một đêm? | dung-trang | TRA_LOI | trich quy-dinh-cong-tac-phi; bac 0 | Tiền phòng khách sạn khi đi công tác được thanh toán tối đa 800.000 đồng mỗi đêm. [quy-dinh-cong-tac-phi#1: «Tiền phòng khách sạn được thanh toán tối đa 800.000 đồng mỗi đêm.»] |
| c13 | co-trang (nguong-ngoai-le) | Ngày phép năm chưa dùng có được đổi thành tiền không? | dung-trang | TRA_LOI | trich quy-dinh-nghi-phep-nam; bac 0 | Ngày phép năm chưa dùng không được quy đổi thành tiền, trừ khi nhân viên nghỉ việc. [quy-dinh-nghi-phep-nam#1: «Ngày phép chưa dùng không được quy đổi thành tiền, trừ khi nhân viên nghỉ việc.»] |
| c14 | co-trang (nguong-ngoai-le) | Đề nghị tạm ứng bao nhiêu tiền thì cần trưởng phòng ký? | dung-trang | TRA_LOI | trich bieu-mau-de-nghi-tam-ung; bac 0 | Đề nghị tạm ứng trên 10 triệu đồng thì cần chữ ký của trưởng phòng. [bieu-mau-de-nghi-tam-ung#1: «Đề nghị tạm ứng trên 10 triệu đồng phải có chữ ký của trưởng phòng.»] |
| c15 | co-trang (nguong-ngoai-le) | Khoản hoa hồng nhỏ dưới 500.000 đồng thì xử lý thế nào? | dung-trang | TRA_LOI | trich quy-trinh-doi-soat-va-chi-hoa-hong; bac 0 | Khoản hoa hồng dưới 500.000 đồng được cộng dồn sang kỳ sau. [quy-trinh-doi-soat-va-chi-hoa-hong#1: «Khoản hoa hồng dưới 500.000 đồng được cộng dồn sang kỳ sau.»] |
| c16 | co-trang (hai-trang) | Nhân viên đang thử việc có được nhận hoa hồng đối tác và có ngày nghỉ phép năm không? | dung-trang | TRA_LOI | trich chinh-sach-thu-viec, quy-dinh-hoa-hong-doi-tac-theo-tang, quy-dinh-nghi-phep-nam; bac 0 | Nhân viên đang thử việc không được nhận hoa hồng đối tác. [chinh-sach-thu-viec#1: «Nhân viên thử việc không được nhận hoa hồng đối tác.»; quy-dinh-hoa-hong-doi-tac-theo-tang#1: «Nhân viên đang thử việc không được nhận hoa hồng đối tác.»] Nhân viên thử việc cũng không có ngày nghỉ phép năm. [quy-dinh-nghi-phep-nam#1: «Nhân viên thử việc không có ngày nghỉ phép năm.»] |
| c17 | co-trang (hai-trang) | Đối tác tầng 1 hưởng bao nhiêu phần trăm và hoa hồng được đối soát vào ngày nào? | dung-trang | TRA_LOI | trich quy-dinh-hoa-hong-doi-tac-theo-tang, quy-trinh-doi-soat-va-chi-hoa-hong; bac 0 | Đối tác tầng 1 hưởng 2% doanh thu thuần của hợp đồng. [quy-dinh-hoa-hong-doi-tac-theo-tang#1: «Đối tác tầng 1 hưởng 2% doanh thu thuần của hợp đồng.»] Phòng Kế toán đối soát hoa hồng đối tác vào ngày 5 hằng tháng. [quy-trinh-doi-soat-va-chi-hoa-hong#1: «Phòng Kế toán đối soát hoa hồng đối tác vào ngày 5 hằng tháng.»] |
| c18 | co-trang (hai-trang) | Đi công tác cần tạm ứng thì điền biểu mẫu nào, và công tác phí trong nước mỗi ngày là bao nhiêu? | dung-trang | TRA_LOI | trich bieu-mau-de-nghi-tam-ung, quy-dinh-cong-tac-phi; bac 0 | Đi công tác cần tạm ứng thì điền "Biểu mẫu đề nghị tạm ứng", vì biểu mẫu này dùng khi nhân viên cần tạm ứng tiền cho công tác hoặc mua hàng cho công ty. [bieu-mau-de-nghi-tam-ung#1: «Biểu mẫu này dùng khi nhân viên cần tạm ứng tiền cho công tác hoặc mua hàng cho công ty.»] Công tác phí trong nước là 300.000 đồng mỗi ngày. [quy-dinh-cong-tac-phi#1: «Công tác phí trong nước là 300.000 đồng mỗi ngày.»] |
| c19 | co-trang (hai-trang) | Lương thử việc bằng bao nhiêu phần trăm lương chính thức, và người thử việc có ngày phép năm không? | dung-trang | TRA_LOI | trich chinh-sach-thu-viec, quy-dinh-nghi-phep-nam; bac 0 | Lương thử việc bằng 85% lương chính thức. [chinh-sach-thu-viec#1: «Lương thử việc bằng 85% lương chính thức.»] Nhân viên thử việc không có ngày nghỉ phép năm. [quy-dinh-nghi-phep-nam#1: «Nhân viên thử việc không có ngày nghỉ phép năm.»] |
| c20 | co-trang (hai-trang) | Khiếu nại đòi hoàn tiền cần ai duyệt, và có được gửi email của khách hàng ra ngoài không? | dung-trang | TRA_LOI | trich quy-trinh-xu-ly-khieu-nai-cua-khach-hang, chinh-sach-bao-mat-du-lieu-khach-hang; bac 0 | Khiếu nại liên quan đến hoàn tiền phải có trưởng phòng Kinh doanh duyệt. [quy-trinh-xu-ly-khieu-nai-cua-khach-hang#1: «Khiếu nại liên quan đến hoàn tiền phải có trưởng phòng Kinh doanh duyệt.»] Không gửi số điện thoại hay email của khách hàng cho bên ngoài OneHub. [chinh-sach-bao-mat-du-lieu-khach-hang#1: «Không gửi số điện thoại hay email của khách hàng cho bên ngoài OneHub.»] |
| c21 | khong-co | Công ty có hỗ trợ tiền gửi xe hằng tháng không? | sai | DANG_HOI | bac 0 |  |
| c22 | khong-co | Quy định về trang phục đi làm thế nào? | tu-choi-dung | TU_CHOI khong-co-trang | bac 0 |  |
| c23 | khong-co | Nhân viên được làm việc từ xa mấy ngày một tuần? | tu-choi-dung | TU_CHOI khong-co-trang | bac 0 |  |
| c24 | khong-co | Thưởng Tết năm nay được tính thế nào? | tu-choi-dung | TU_CHOI khong-co-trang | bac 0 |  |
| c25 | khong-co | Có chính sách bảo hiểm sức khoẻ cho người thân của nhân viên không? | tu-choi-dung | TU_CHOI khong-co-trang | bac 0 |  |
| c26 | khong-co | Quy trình xin mua laptop mới cho nhân viên là gì? | tu-choi-dung | TU_CHOI khong-co-trang | bac 0 |  |
| c27 | khong-dau | doi tac tang 2 duoc huong hoa hong bao nhieu phan tram? | dung-trang | TRA_LOI | trich quy-dinh-hoa-hong-doi-tac-theo-tang; bac 0 | Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng. [quy-dinh-hoa-hong-doi-tac-theo-tang#1: «Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.»] |
| c28 | khong-dau | nhan vien chinh thuc co bao nhieu ngay nghi phep nam? | dung-trang | TRA_LOI | trich quy-dinh-nghi-phep-nam; bac 0 | Nhân viên chính thức có 12 ngày nghỉ phép năm. [quy-dinh-nghi-phep-nam#1: «Nhân viên chính thức có 12 ngày nghỉ phép năm.»] |
| c29 | khong-dau | cong tac phi trong nuoc moi ngay la bao nhieu? | dung-trang | TRA_LOI | trich quy-dinh-cong-tac-phi; bac 0 | Công tác phí trong nước là 300.000 đồng mỗi ngày. [quy-dinh-cong-tac-phi#1: «Công tác phí trong nước là 300.000 đồng mỗi ngày.»] |
| c30 | khong-dau | khieu nai thong thuong giai quyet trong bao nhieu ngay? | dung-trang | TRA_LOI | trich quy-trinh-xu-ly-khieu-nai-cua-khach-hang; bac 0 | Khiếu nại thông thường được giải quyết trong 7 ngày làm việc. [quy-trinh-xu-ly-khieu-nai-cua-khach-hang#1: «Khiếu nại thông thường được giải quyết trong 7 ngày làm việc.»] |

## Lượt hai — hỏi qua agent gốc purpose zalo

| id | nhóm | câu | nhãn |
| --- | --- | --- | --- |
| c01 | co-trang | Đối tác tầng 2 được hưởng hoa hồng bao nhiêu phần trăm? | chuyen |
| c02 | co-trang | Nhân viên chính thức có bao nhiêu ngày nghỉ phép năm? | chuyen |
| c03 | co-trang | Hoa hồng đối tác được chuyển khoản vào ngày nào? | chuyen |
| c04 | co-trang | Nghi ngờ lộ dữ liệu khách hàng thì phải báo cho ai và trong bao lâu? | chuyen |
| c05 | co-trang | Khiếu nại thông thường phải giải quyết trong bao nhiêu ngày? | chuyen |
| c06 | co-trang | Công tác phí trong nước mỗi ngày là bao nhiêu? | chuyen |
| c07 | co-trang | Nhân viên kinh doanh thử việc bao lâu? | chuyen |
| c08 | co-trang | Biểu mẫu tạm ứng đã ký thì nộp cho phòng nào? | chuyen |
| c09 | co-trang | Muốn nghỉ phép thì phải xin trước mấy ngày? | chuyen |
| c10 | co-trang | Có được lưu hồ sơ khách hàng trên máy tính cá nhân không? | chuyen |
| c11 | co-trang | Hợp đồng có doanh thu thuần 15 triệu đồng có được tính hoa hồng không? | chuyen |
| c12 | co-trang | Tiền phòng khách sạn khi đi công tác được thanh toán tối đa bao nhiêu một đêm? | chuyen |
| c13 | co-trang | Ngày phép năm chưa dùng có được đổi thành tiền không? | chuyen |
| c14 | co-trang | Đề nghị tạm ứng bao nhiêu tiền thì cần trưởng phòng ký? | chuyen |
| c15 | co-trang | Khoản hoa hồng nhỏ dưới 500.000 đồng thì xử lý thế nào? | chuyen |
| c16 | co-trang | Nhân viên đang thử việc có được nhận hoa hồng đối tác và có ngày nghỉ phép năm không? | chuyen |
| c17 | co-trang | Đối tác tầng 1 hưởng bao nhiêu phần trăm và hoa hồng được đối soát vào ngày nào? | chuyen |
| c18 | co-trang | Đi công tác cần tạm ứng thì điền biểu mẫu nào, và công tác phí trong nước mỗi ngày là bao nhiêu? | chuyen |
| c19 | co-trang | Lương thử việc bằng bao nhiêu phần trăm lương chính thức, và người thử việc có ngày phép năm không? | chuyen |
| c20 | co-trang | Khiếu nại đòi hoàn tiền cần ai duyệt, và có được gửi email của khách hàng ra ngoài không? | chuyen |
| c21 | khong-co | Công ty có hỗ trợ tiền gửi xe hằng tháng không? | chuyen |
| c22 | khong-co | Quy định về trang phục đi làm thế nào? | chuyen |
| c23 | khong-co | Nhân viên được làm việc từ xa mấy ngày một tuần? | chuyen |
| c24 | khong-co | Thưởng Tết năm nay được tính thế nào? | chuyen |
| c25 | khong-co | Có chính sách bảo hiểm sức khoẻ cho người thân của nhân viên không? | chuyen |
| c26 | khong-co | Quy trình xin mua laptop mới cho nhân viên là gì? | chuyen |
| c27 | khong-dau | doi tac tang 2 duoc huong hoa hong bao nhieu phan tram? | chuyen |
| c28 | khong-dau | nhan vien chinh thuc co bao nhieu ngay nghi phep nam? | chuyen |
| c29 | khong-dau | cong tac phi trong nuoc moi ngay la bao nhieu? | chuyen |
| c30 | khong-dau | khieu nai thong thuong giai quyet trong bao nhieu ngay? | chuyen |
| c31 | khong-phai-quy-dinh | Thoả thuận với Công ty Minh An đang ở giai đoạn nào? | khong-chuyen |
| c32 | khong-phai-quy-dinh | Tuần này mình có việc nào quá hạn không? | khong-chuyen |
| c33 | khong-phai-quy-dinh | KR doanh thu quý này đang đạt bao nhiêu phần trăm? | chuyen |
| c34 | khong-phai-quy-dinh | Chào bạn, hôm nay thế nào? | khong-chuyen |
| c35 | khong-phai-quy-dinh | Liệt kê các thoả thuận sắp chốt trong tháng này. | khong-chuyen |
| c36 | khong-phai-quy-dinh | Ai đang phụ trách khách hàng Hoàng Long? | khong-chuyen |
| c37 | khong-phai-quy-dinh | Lần làm việc gần nhất với công ty Sao Việt là gì? | khong-chuyen |
| c38 | khong-phai-quy-dinh | Mục tiêu OKR của phòng Kinh doanh quý này là gì? | chuyen |
| c39 | khong-phai-quy-dinh | Cảm ơn nhé! | khong-chuyen |
| c40 | khong-phai-quy-dinh | Có bao nhiêu thoả thuận đang ở giai đoạn chào giá? | khong-chuyen |
