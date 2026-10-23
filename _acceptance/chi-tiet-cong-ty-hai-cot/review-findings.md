# Review findings: chi-tiet-cong-ty-hai-cot (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (quét LỚP nhưng chỉ có điểm-case, không có ma trận viết trước): mẫu số «14/14» của --chi-do đếm từ chính bảng CAY_DO**
  Người dùng thấy gì: Phiếu Công ty và các ngăn khác hiển thị đúng như đã hứa. Chỉ có công cụ kiểm tra bố cục có thể lặng lẽ bỏ sót một chiều đo mà vẫn báo xanh nếu sau này ai đó xoá nhầm một mục của nó.
  Căn cứ: Người dùng không bị ảnh hưởng gì; rủi ro chỉ xảy ra cho người sửa bộ kiểm tra về sau và dễ phát hiện khi đọc con số in ra.
  file: `_acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm đứng một mình, chưa từng chứng là đỏ được): các vế quan hệ của AC-3, AC-5, AC-6 không có chiều phá thử nào**
  Người dùng thấy gì: Một vài chi tiết bố cục (dòng chờ của Kara dưới mục Chi tiết, dòng mô tả vùng kéo thả, trang cuộn ngang) đang được kiểm nhưng chưa ai thử cố ý làm hỏng để xem bộ kiểm có báo đỏ không. Nếu về sau các chỗ này vỡ, bộ kiểm có thể không báo.
  Căn cứ: Giao diện hiện tại đo ra đạt nên người dùng không thấy lỗi nào, và bổ sung phép phá thử sau này rẻ, không mất dữ liệu.
  file: `_acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm đứng một mình): vế «Hoạt động web hiện sau dòng Kara chờ» của AC-6 không bao giờ được thực thi**
  Người dùng thấy gì: Thứ tự «Hoạt động web hiện sau dòng Kara chờ» trên phiếu Công ty chưa được đo thật bằng bộ kiểm tự động, nên nếu thứ tự này đảo thì chưa có gì báo.
  Căn cứ: Hậu quả chỉ là sai thứ tự hai mục trên màn, không mất dữ liệu, và mục này chỉ hiện khi có khách truy cập đã nhận diện nên ít người gặp.
  file: `_acceptance/chi-tiet-cong-ty-hai-cot/rang/do-bo-cuc.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
