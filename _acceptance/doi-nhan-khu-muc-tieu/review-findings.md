# Review findings: doi-nhan-khu-muc-tieu (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **bang-chu.mjs: khoá đọc hụt thành «(không đọc được)» mà lệnh vẫn thoát 0 (r1)**
  Người dùng thấy gì: Bảng đối chiếu chữ cũ và mới dùng để người duyệt đọc có thể chứa một ô ghi «không đọc được» mà không báo lỗi. Màn hình người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ làm tài liệu duyệt kém tin cậy một chút, không đổi chữ người dùng thấy, và người duyệt tự nhận ra ô lạ khi đọc.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/bang-chu.mjs`
  severity: low
  Đề xuất: known-limits

- **chup.mjs: lệnh chép ảnh sang evidence không kiểm kết quả, vẫn ghi dòng ANH evidence/… (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu việc chép ảnh chụp màn hình bị hỏng, ảnh của lượt trước có thể nằm lại làm bằng chứng mà không ai biết. Người dùng cuối không gặp gì.
  Căn cứ: Hiếm xảy ra, chỉ ảnh hưởng hồ sơ duyệt chứ không ảnh hưởng sản phẩm, và người duyệt nhìn ảnh là thấy chữ cũ.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng phép khớp rỗng): E8 (c) phủ mọi chỗ trúng trong okr.ts vì một cu.vi bắt đầu bằng 'X' (r1)**
  Người dùng thấy gì: Phép kiểm xem danh sách chữ cần đổi có đủ hay không bỏ sót được nhiều dòng trong một tệp chữ lớn. Chữ cũ còn sót trên màn vẫn bị một bài kiểm khác bắt.
  Căn cứ: Rủi ro chỉ là danh sách kê thiếu, còn chữ cũ lọt ra màn thì có lưới kiểm thứ hai chặn, nên hậu quả cho người dùng nhẹ.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/kiem-ke.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên cả lớp nhưng chỉ chép tay một phần): CAM_VI của E15 phân biệt hoa thường và thiếu cụm so với CAM_VI của luật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép quét chữ trên ảnh chụp màn hình bỏ sót vài cách viết của chữ cũ như «hỏi ý» viết thường. Chữ cũ trong kho chữ vẫn bị bài kiểm chính chặn.
  Căn cứ: Chỉ là lưới phụ trùng với bài kiểm chính nên chữ cũ khó lọt tới người dùng, và nếu có thì thấy ngay trên màn.
  file: `_acceptance/doi-nhan-khu-muc-tieu/rang/chup.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo mã nguồn thay vì đầu ra): thanh hành động khu (hanh-dong-khu.tsx) chỉ được kiểm bằng cách grep 'useTenGoc(' trong mã (r1 · tệp đã đổi)**
  Người dùng thấy gì: Câu giải thích vì sao nút thêm bị khoá chỉ được kiểm gián tiếp, nên nếu tên workspace ghép sai vào câu đó thì bài kiểm không thấy.
  Căn cứ: Chỉ ảnh hưởng một câu giải thích hiếm gặp, người dùng vẫn hiểu nút bị khoá, và lỗi này dễ sửa lại sau khi phát hiện.
  file: `apps/app/test/doi-nhan-khu-muc-tieu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
