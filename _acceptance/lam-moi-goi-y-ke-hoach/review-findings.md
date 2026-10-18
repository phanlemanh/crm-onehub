## Trong hợp đồng

- **Hình dạng 4 (kiểm âm tính đứng một mình): lượt tự thử chiều đỏ «hiện» của E6 không có đối chứng dương rằng cú bấm cột thắng đã thành**
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs:170`
  severity: medium
  AC: AC-6
  source: measurement
  detail: Ở bước 0, dòng 170–180: treoDocGoiY(t) → bamCot(t, gd.thang.label) → theCoTen(...). Thẻ không hiện (k.dung=false) được tính ngay là «luot chan doc lai bao KHONG DAT», tức là bằng chứng thước có răng. Sau cú bấm, không có kiểm nào cho thấy đổi giai đoạn đã thật sự xảy ra: không đọc lại deal qua d.hoi(P.cookie, 'deals.byId'), cũng không xem aria-current của cột thắng trong [data-slot=stage-stepper]. Ca tự thử «ẩn» ngay dưới (dòng 186–188) có mỏ neo dương (thẻ hiện rồi mới treo), ca «hiện» thì không. Ngoài ra app dùng httpBatchLink (apps/app/lib/trpc/client.tsx:31). Mọi khoá mà cache.deal làm mới cùng đi chung một URL batch có chữ goiYCuaDeal, nên bộ chặn ở dòng 98 treo luôn deals.byId và cả loạt đọc lại, không chỉ riêng goiYCuaDeal. Một cú bấm không tới được setStage, hay một trang đứng hẳn, cũng in ra đúng dòng KHONG DAT như vậy. Vì thế dòng «E6 tu thu: luot chan doc lai bao KHONG DAT» chưa phân biệt được «thước nhạy với lần đọc lại gợi ý» với «hành động chưa xảy ra». Kiểm thiếu: sau cú bấm, phải thấy giai đoạn đã sang thắng (ở máy chủ hoặc ở cột đang chọn) trong khi thẻ vẫn vắng.
  rationale: AC-6 đòi thước màn phải đỏ khi trang bị chặn mọi lần đọc lại gợi ý; lượt tự thử chiều «hiện» không chứng minh được thước đỏ vì đúng lý do đó nên chính điều khoản này chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ba răng mới và khong-xoa-expect.mjs mang chú thích, trái luật «Never add code comments»**
  Người dùng thấy gì: Một vài tệp kiểm của hồ sơ nghiệm thu có dòng ghi chú, trái quy ước chung của kho. Người dùng không thấy gì khác đi, tính năng chạy y như cũ.
  file: `_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
