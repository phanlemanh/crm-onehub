---
slug: tai-lieu-khoi-phuc-chap-chon
at: 2026-10-16T15:45:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-1, AC-2 hứa «không dùng mốc đồng hồ» mà không eval nào đo vế này; E4 dò đúng chuỗi 'Date.now() - 1' nên `Date.now()-1` không dấu cách lọt; E3 thiếu đối chứng dương cho hàm mới. | Hai ca vẫn đếm theo mốc giờ (viết khác chữ) mà E1–E5 vẫn xanh; hàm mới luôn trả {} mà E3 vẫn xanh. | E4 quét thân hai ca có tên, mẫu chịu khoảng trắng, chiều đỏ trên ba mẫu; E3 thêm sự kiện sinh sau khi chụp phải được đếm. | fixed: AC-3 thêm vế đối chứng dương; AC-4 và E4 viết lại — thân hai ca phải gọi idSuKien trước lệnh duyệt và suKienMoi sau, cả tệp (trừ thân tlkp-dem, tlkp-tinh) không khớp /Date\.now\(\)\s*-/ hay gọi suKienSau; chiều đỏ bốn mẫu có ghim. |
| P1 | evals | E3 đòi cách đếm cũ còn trong tệp làm đối chứng, E4 cấm chuỗi đó trong toàn tệp — mâu thuẫn. | Bản sửa đúng làm E4 đỏ trỏ vào dòng đối chứng; nới vùng miễn để cứu thì che luôn mốc sót trong ca 213 hay 287. | Vùng miễn chỉ trùm đúng một chỗ có tên; chiều đỏ chép dòng đối chứng vào thân ca 287. | fixed: cách đếm theo mốc giờ chỉ sống trong thân ca tlkp-dem (design, E3); E4 miễn đúng thân tlkp-dem và tlkp-tinh; thêm mẫu đỏ «bản sao thân ca 287 có chép dòng đối chứng». |
| P2 | design | Chẩn đoán không kèm dòng đỏ nguyên văn của #413. | Lần đỏ thật có dạng khác (KHOI_PHUC: 2, sự kiện CU rò) thì E3 đỏ đúng ghim trên dữ liệu tự gieo mà pre-push vẫn đỏ ngẫu nhiên. | Trích dòng đỏ nguyên văn; không có thì ghi «chưa rõ». | fixed: design ghi «chưa rõ» — không tìm thấy nhật ký trong kho hay các cây; ca 213 hạ thành suy luận từ mã. Bản sửa đếm theo id không phụ thuộc loại sự kiện thừa nên vẫn đúng với mọi dạng lần đỏ do mốc giờ. |
| P2 | contract | Căn cứ của dòng sổ mở phạm vi sang ca 213 và dòng bỏ năm tệp khác lệch nguồn. | Người duyệt tưởng câu giao đã giao cả hai ca và đã chốt bỏ năm tệp kia. | Trích đúng nguồn; ghi rõ mở phạm vi là đề xuất của máy. | fixed: dòng sổ mới (supersedes) ghi «máy mở phạm vi sang ca 213» với căn cứ là câu «một lần đỏ giả là một lượt đẩy lại khoảng 15 phút»; dòng bỏ năm tệp trích câu giao nêu đích danh tệp. |
