# Đo tay ngoài S4 — trang-don-vi-mot-bang (lượt chấm 2)

Luật tạm của Điều phối M5 (tới kit 2.32.0): eval đổi định nghĩa giữa lượt chấm 1 (`31bb99271`) và lượt 2 phải đo tay kèm chiều đỏ trước S4. Mỗi dòng: vật lành (đối chứng dương) → từng đột biến (worktree tạm, câu ghim đúng). Đo trên nhánh tại `42b64d592`, sau khi ghim lại 10 hồ sơ AC-14 (`repin-20261017T155034Z-76983`, `repin-20261017T172149Z-45633`, `repin-20261017T174535Z-97743`).

| Eval | Đổi gì từ lượt 1 | Vật lành | Chiều đỏ |
|---|---|---|---|
| E4 | phân biệt «không có pha tải phía trình duyệt» với «mất khung xương» (trang dựng ở máy chủ + điều hướng mềm) | mã 0 (cùng lượt: E2, E3, E5, E17 mã 0) | `cay-cu` mã 1 «SAI AC-8: cay toi da 14 dong luc dang tai» |
| E12 | đếm dòng kiểm bị xoá chỉ trên commit riêng của DH2 | mã 0 | `ho-so` mã 1 «SAI AC-10: ux-lai-thu-8c-okr E2: ma 1 (ky vong 0)» · `xoa-ca` mã 1 «SAI AC-10: apps/app/test/okr-theo-don-vi.dom.tsx xoa 2 dong kiem ngoai dau cu» |
| E14 | đầu vào hội đồng thêm hợp đồng + thiết kế; câu hỏi ý 3 nói rõ hàng công cụ của cách xem không phải bảng | — (judgment, không có chiều đỏ máy) | — |
| E15 | 5 thẻ/25 liên kết → 4 thẻ/20 (onehub #459 gỡ thẻ Cập nhật tuần) | mã 0 | `bo-xem` mã 1 «dvb-giu-xem: lien ket cua-toi thieu xemOkr=hop-tuan» · `bo-notes-dh1` mã 1 «dvb-giu-xem: hop dong DH1 thieu dong Notes tro AC-13» |
| E16 | nhận khai `// F8 neo:`; **sau Cổng Phạm vi**: hồ sơ chỉ mượn lệnh (ve-sinh-do-san-onehub) chứng bằng dòng ghim của hồ sơ AC-14 chạy cùng lệnh | mã 0 «DUNG AC-14: 10/10» | `ghim-cu` mã 1 «SAI AC-14: okr-to-chuc-va ghim tren 22925c91f… chua co trang moi» · `muon-cu` mã 1 «SAI AC-14: ve-sinh-do-san-onehub muon _acceptance/toan-canh-okr/rang/man-toan-canh.mjs cua toan-canh-okr: ghim tren 22925c91f… chua co trang moi» |
| (mới) dvb-loc-nhanh | «Tất cả» đếm đúng số dòng qua `allCount` | mã 0 | `tat-ca-cong-o` mã 1 «dvb-loc-nhanh: nhan Tất cả dem 11, so dong 12» |
| (DH1) E3 dieu-huong-khu-muc-tieu | `coNutHoiKara` chỉ soi `hanh-dong-khu.tsx` (lối b, M5) | mã 0 | trước sửa: `thua-cho-hoi-kara` SAI thông điệp; sau sửa: mã 1 «dhk-hanh-dong: theo-don-vi lap-ke-hoach co 5 phan tu, mong 4» |

`ghim-cu` trước 17/10 là đột biến `chuaCo` (chưa từng chạy): E16 lượt 1 không có chiều đỏ thật.

## Nhóm trình duyệt `dvb-man --trinh-duyet` (18:38–18:44Z)

Vật lành E2/E3/E4/E5/E17 mã 0 (E3: hàng công cụ 1440 một hàng với ô lọc dạng nút sau gộp NM2). Đột biến: `the-don-vi` «SAI AC-2: khoang lech 120px» · `cach-xem-trong-loc` «SAI AC-4: danh-sach 390 — cach xem bi giau sau Lọc» · `cay-cu` «SAI AC-8: cay toi da 14 dong luc dang tai» · `chon-khong-doi` «SAI AC-1: URL khong doi sau khi chon» · `khoa-dem-sai` «SAI AC-7: o Kinh doanh miền Bắc hien Chưa đặt OKR, kho do 2» — 5/5 mã 1.
