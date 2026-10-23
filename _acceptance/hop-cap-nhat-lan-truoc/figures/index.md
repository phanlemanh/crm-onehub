# Hình tại điểm quyết định — hop-cap-nhat-lan-truoc

| Điểm | Đếm | Hình |
|---|---|---|
| d-…-1 nguồn dữ liệu của khối (vết + dienBien, ghép theo tuần) | 3 bước nối tiếp (vết → điểm dienBien cùng tuần → khối) và 2 nhánh (ghép được / lệch tuần) | `nguon-lan-truoc.html` |
| d-…-2 ô ghi chú một dòng | dưới ngưỡng: 1 bước | — |
| d-…-3 khối đầu hộp | dưới ngưỡng: 1 bước | — |
| d-…-9/10 phạm vi (trang tuần, người ghi) | dưới ngưỡng: 0 nhánh | — |
| d-…-6 bỏ coverage-scan | dưới ngưỡng: 0 nhánh | — |
| Hỏi-1 câu gợi ý (d-…-7) | dưới ngưỡng: chọn chữ, 0 bước | — |
| Hỏi-2 bỏ design-pass (d-…-8) | dưới ngưỡng: 2 lối, 1 bước | — |

## Đề bài `nguon-lan-truoc`

- Loại: luồng dữ liệu (data flow), trái sang phải.
- Nút: «Gửi cập nhật» (guiCapNhat) → hai nơi ghi cùng giao dịch: «OkrCheckIn (số, mức tự tin, ghi chú)» và «Vết cap-nhat-tuan (lúc, số, mức tự tin — không có ghi chú)».
- Đọc: «okr.objective → trail» → «lanTruocTuVet: lúc, số, mức tự tin»; «okr.dienBien → điểm theo tuần (lần cuối trong tuần, có ghi chú)» → «ghiChuLanTruoc: điểm cùng tuần VN với lúc».
- Nhánh ở ghép: tuần khớp → hiện ghi chú; lệch tuần hoặc ghi chú rỗng → không dòng ghi chú.
- Đích: «Khối Lần cập nhật trước (ngày giờ · số · mức tự tin · ghi chú)». AC liên quan: AC-1, AC-3.
