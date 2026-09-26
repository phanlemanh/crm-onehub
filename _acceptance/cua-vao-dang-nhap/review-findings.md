# Review Findings — cua-vao-dang-nhap (round 3)

## Trong hợp đồng

(rỗng — không có phát hiện nào ánh xạ được vào AC ở vòng này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Shape 5 (claims a whole class but has only a point case): the E21 control never exercises a completed step, so 'old callers keep their progress mode unchanged' is not measured**
  Người dùng thấy gì: Neu sau nay co thay doi vo y lam mat dau tick o cac buoc da xong trong hop thoai moi thanh vien, cai dat to chuc hay khoi Zalo, loi do co the lot qua vi phep thu hien tai chua kiem tra dung truong hop nay — hanh vi dang chay bay gio van dung.
  file: `packages/ui/test/step-list-tinh.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Password-link TTL helper was extracted, but quen-mat-khau still computes the same value its own way (r1)**
  Người dùng thấy gì: Trang Quên mật khẩu vẫn hiển thị đúng số phút hết hạn cho người dùng; đây chỉ là một chỗ tính trùng lặp trong mã, không đổi những gì người dùng nhìn thấy.
  file: `apps/app/lib/cua-vao/thoi-han.ts`
  severity: low
  Đề xuất: known-limits

- **StepList makes activeStep optional for every caller, and the new packages/ui prop is named in Vietnamese (r1)**
  Người dùng thấy gì: Nếu sau này có nơi khác dùng lại danh sách bước ở chế độ tiến độ mà quên truyền bước đang chọn, bước đó sẽ không được đánh dấu rõ — nhưng mọi màn hình hiện tại đều truyền đủ nên chưa ai bị ảnh hưởng.
  file: `packages/ui/src/components/step-list.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ma trận phanLoaiLoiDangNhap gõ tay mã lỗi (r1)**
  Người dùng thấy gì: Một bài kiểm tra phụ dùng dữ liệu tự gõ thay vì dữ liệu thật, nhưng bài kiểm tra chính đã kiểm đúng dữ liệu thật ở chỗ khác nên lỗi thật vẫn bị phát hiện.
  file: `apps/app/test/cua-vao-ham.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): signInOptions của E1 không khai kiểu RouterOutputs như eval hứa (r1)**
  Người dùng thấy gì: Dữ liệu giả lập trong bài kiểm thiếu khai báo kiểu chặt chẽ; nếu khuôn dữ liệu API đổi sau này bài kiểm có thể không báo đỏ kịp thời, nhưng hiện tại không đổi những gì người dùng thấy.
  file: `apps/app/test/cua-vao-trang-khac.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).