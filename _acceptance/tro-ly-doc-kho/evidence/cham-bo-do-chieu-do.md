# Chấm bộ câu đo — 2026-10-01T05:29:30.293Z

Bộ: `_acceptance/tro-ly-doc-kho/bo-do/chieu-do-3-cau.json` (nhãn `chieu-do`). Chiều đỏ của E15: ba câu của mam-tam.json (c01, c02, c06) bị đổi trang mong đợi sang một trang không trả lời câu đó. Script chấm phải in ba dòng «sai» và thoát mã 1.

Lượt một: model `zai/glm-5.2-fast`, khoá undefined. Lượt hai: model agent gốc `zai/glm-5.2-fast`, chỉ dẫn `CHI_DAN_ZALO`.

## Tổng

- dung trang: 0.0% (nguong >= 80.0%) KHONG DAT
- tu choi dung: 0.0% (nguong >= 80.0%) KHONG DAT
- Zalo chuyen cau quy dinh: 100.0% (nguong >= 90.0%) dat
- Zalo chuyen nham cau khong phai quy dinh: 0.0% (nguong <= 10.0%) dat
- tra loi co trich khong qua kiem (dem lai): 0 dat
- demHoiKho cua cua so chay: traLoi 3, tuChoi 0, loi 0, tiLe 100.0%

## Lượt một — hỏi qua tro_ly_kho

| id | nhóm | câu | nhãn | trạng thái | chi tiết | câu trả lời |
| --- | --- | --- | --- | --- | --- | --- |
| c01 | co-trang | Đối tác tầng 2 được hưởng hoa hồng bao nhiêu phần trăm? | sai | TRA_LOI | trich quy-dinh-hoa-hong-doi-tac-theo-tang; bac 0 | Đối tác tầng 2 được hưởng 1,2% doanh thu thuần của hợp đồng. [quy-dinh-hoa-hong-doi-tac-theo-tang#1: «Đối tác tầng 2 hưởng 1,2% doanh thu thuần của hợp đồng.»] |
| c02 | co-trang | Nhân viên chính thức có bao nhiêu ngày nghỉ phép năm? | sai | TRA_LOI | trich quy-dinh-nghi-phep-nam; bac 0 | Nhân viên chính thức có 12 ngày nghỉ phép năm. [quy-dinh-nghi-phep-nam#1: «Nhân viên chính thức có 12 ngày nghỉ phép năm.»] |
| c06 | co-trang | Công tác phí trong nước mỗi ngày là bao nhiêu? | sai | TRA_LOI | trich quy-dinh-cong-tac-phi; bac 0 | Công tác phí trong nước là 300.000 đồng mỗi ngày. [quy-dinh-cong-tac-phi#1: «Công tác phí trong nước là 300.000 đồng mỗi ngày.»] |

## Lượt hai — hỏi qua agent gốc purpose zalo

| id | nhóm | câu | nhãn |
| --- | --- | --- | --- |
| c01 | co-trang | Đối tác tầng 2 được hưởng hoa hồng bao nhiêu phần trăm? | chuyen |
| c02 | co-trang | Nhân viên chính thức có bao nhiêu ngày nghỉ phép năm? | chuyen |
| c06 | co-trang | Công tác phí trong nước mỗi ngày là bao nhiêu? | chuyen |
