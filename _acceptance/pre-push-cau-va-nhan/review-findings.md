## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dòng báo đường nặng tự viết lại luật .github thay vì lấy từ bộ phân loại chung**
  Người dùng thấy gì: Hôm nay dòng báo khi đẩy code chạm thư mục cấu hình CI vẫn đúng. Nếu sau này luật nhận diện thư mục đó đổi ở một nơi mà nơi kia không đổi theo, dòng báo có thể nêu sai lý do hoặc sai danh sách tệp, dù việc chạy đủ hay bỏ vẫn quyết đúng.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ có thể gây báo sai lý do nếu luật đổi sau này; người đẩy code tự thấy ngay khi dòng báo lệch và sửa lúc đó vẫn rẻ.
  file: `scripts/pre-push-t1.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ khẳng định âm, không có đối chứng dương): bước so ngược với bản cũ trong lich-su-sap chỉ kiểm rằng không có dòng nào**
  Người dùng thấy gì: Phép thử dùng để chứng minh bản cũ đếm nhầm ca sập có thể báo đạt dù bản cũ chạy hỏng sớm. Phần sửa cho người dùng vẫn được kiểm chặt, chỉ bằng chứng so với cách làm cũ là yếu hơn vẻ ngoài.
  Căn cứ: Chỉ làm bằng chứng phụ yếu đi, không làm mất hay lộ dữ liệu của người dùng; phần chính vẫn được kiểm và có thể siết lại ở vòng sau với chi phí thấp.
  file: `_acceptance/pre-push-cau-va-nhan/rang/lich-su-sap.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
