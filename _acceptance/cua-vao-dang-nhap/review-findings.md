## Trong hợp đồng

Không có phát hiện nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New doi-chung test breaks `bun run lint` (biome a11y errors): noNoninteractiveTabindex and noAutofocus**
  Người dùng thấy gì: Loi nay chi anh huong buoc kiem tra tu dong noi bo (lint), khong lam thay doi bat cu thu gi nguoi dung nhin thay tren man hinh dang nhap.
  file: `apps/app/test/cua-vao-sign-in.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **TEN_HANG is left unused after the mocks switched to `nhan`**
  Người dùng thấy gì: Day chi la mot dong code thua trong tep kiem thu noi bo, khong lam thay doi gi ma nguoi dung thay hay lam duoc tren trang dang nhap.
  file: `apps/app/test/cua-vao-sign-in.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Case html-no-one-can quietly becomes error="" when the hook sentence is not found, and an extraction error exits 1 instead of 2**
  Người dùng thấy gì: Neu cau canh bao trong he thong dang nhap doi chu trong tuong lai, cong cu do co the bao sai nguyen nhan loi thay vi bao 'khong do duoc' — nhung hien tai trang dang nhap van hoat dong dung nhu mo ta.
  file: `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, bộ dò không bắn được): vế «logo của khối hướng dẫn không phải liên kết» của E13 không có đường nào đỏ**
  Người dùng thấy gì: Neu sau nay ai do vo tinh bien logo trong khoi huong dan thanh mot duong dan bam duoc, cong cu do tu dong co the khong phat hien ra loi do — nhung hien tai trang dang nhap van dang hien thi dung nhu ky vong.
  file: `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (ma trận viết trước nhưng không có cột kỳ vọng theo ca): ma-tran-cua rẽ nhánh theo chính đầu ra**
  Người dùng thấy gì: Bo kiem thu tu dong cho cac kieu dang nhap khac nhau (chi mat khau, co SSO, chi Google...) co the khong bat duoc mot so loi hien sai nut dang nhap neu loi do xay ra trong tuong lai — nhung hien tai trang dang nhap van hoat dong dung cho tung kieu.
  file: `apps/app/test/cua-vao-sign-in.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): chữ «Cài đặt» ở bước 1 được ghim vào aria-label thanh bên, không vào nhãn menu người dùng thật sự bấm**
  Người dùng thấy gì: Neu sau nay ten muc menu 'Cai dat' tren giao dien doi chu khac, huong dan buoc 1 tren man dang nhap co the khong con khop voi ten muc menu that su nguoi dung nhin thay, nhung bai kiem thu tu dong se khong bao loi.
  file: `apps/app/test/cua-vao-sign-in.dom.tsx`
  severity: low
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

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).