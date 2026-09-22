## Trong hợp đồng

(không có — không finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **o-soan.mjs writes its own tree check instead of using canh-cay.mjs, and its marker file is left behind on the wrong-tree path**
  Người dùng thấy gì: Kich ban do tu dong co the de sot mot tep anh thua trong thu muc cong khai cua ung dung sau moi lan do o cay khac, va tep do khong tu don duoc — neu ai gop nham anh nay vao ban chinh thuc thi nguoi dung co the thay mot anh la xuat hien trong ung dung.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: medium
  Đề xuất: new-contract

- **The script's exit-2 paths skip cleanup of seeded DB rows and never close Chrome**
  Người dùng thấy gì: Moi luot do bao 'khong do duoc' co the de lai mot hoi thoai gia mang the bao loi trong danh sach hoi thoai that cua mot nhan vien, va mot trinh duyet chay ngam khong tat — rac nay tich luy dan theo thoi gian.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: medium
  Đề xuất: new-contract

- **A real user email is hardcoded as the default identity in a committed script**
  Người dùng thấy gì: Kich ban do co san mot dia chi email that lam mac dinh; neu ai chay kich ban ma quen chi dinh tai khoan, he thong se tu dang nhap va ghi du lieu thu vao dung tai khoan cua nguoi do ma ho khong hay biet.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: new-contract

- **A test fixture under apps/api/test is imported by relative path from apps/agent and apps/app**
  Người dùng thấy gì: Neu ai do xoa hoac doi ten thu muc test cua mot ung dung, hai ung dung khac am tham hong theo ma khong co canh bao, vi ba noi cung dung chung mot tep du lieu mau nam ngoai cho quy dinh.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **o-soan.mjs: khongDo() calls process.exit inside the measuring try, skipping cleanup of the seeded conversation and the browser**
  Người dùng thấy gì: Moi luot do khong ket luan duoc co the de lai mot hoi thoai gia mang the bao loi trong danh sach hoi thoai that cua nguoi dung, va mot trinh duyet chay ngam khong tat.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình): E2 dòng 1 'chữ gợi ý không hiện' không thể đỏ vì bị chính bước chờ gác trước**
  Người dùng thấy gì: Neu sau nay co ai vo tinh lam chu goi y khong bien mat sau khi go, vong do tu dong cho tinh nang nay van co the bao 'dat' vi cach do hien tai khong thuc su nhin vao chu hien thi — nguoi dung co the tiep tuc thay chu goi y de len noi dung da go ma khong ai phat hien qua vong do.
  file: `_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay vì quan hệ): E7 hàng 3 không kiểm lý do hỏng M3 của bản ghi task**
  Người dùng thấy gì: Neu tac vu nghien cuu hong nhung ly do luu lai bi sai hoac de trong, vong do hien tai van co the bao dat vi chi kiem trang thai hong chu khong kiem dung ly do — nguoi xem bao cao hong co the thay ly do khong khop voi chuyen da thuc su xay ra.
  file: `apps/agent/test/log-loi-hoi-thoai.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).