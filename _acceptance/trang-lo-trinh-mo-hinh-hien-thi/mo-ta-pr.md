Trang Lộ trình trong CRM nay lấy đúng tập việc, mốc và tên mà bộ vẽ `LO-TRINH.html` của kit 2.33 đã tính sẵn trong khối dữ liệu (năm khoá `ten_hien_thi`, `hien`, `viec_hien`, `con_lai`, `chua_hen_moc`), thay vì tự lọc. Hai trang không còn hai nguồn sự thật cho cùng một lộ trình.

## Người dùng thấy gì khác

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Việc nằm dưới đúng mốc mà khối dữ liệu liệt nó, ở bảng, ngăn hồ sơ và bộ lọc | `lib/lo-trinh/mo-hinh.ts`, `components/lo-trinh/viec.ts` | AC-1 (việc theo mốc của khối) |
| Kiểu xem «Mốc» chỉ hiện mốc khối cho hiện; mỗi mốc có dòng «còn n/m việc» / «đã giao đủ m việc» | `components/lo-trinh/xem-moc.tsx`, `lib/messages/lo-trinh.ts` | AC-2 (mốc hiện và dòng số) |
| Nhóm «Chưa hẹn mốc» và bộ lọc cùng tên lấy đúng danh sách của khối | `components/lo-trinh/xem-moc.tsx` | AC-3 (chưa hẹn mốc) |
| Tên việc là tên hiển thị của khối ở mọi chỗ, tìm kiếm khớp cả tên ấy | `dong-lien-quan.tsx`, `bang-cot.tsx`, `ho-so-viec.tsx`, `trang-lo-trinh.tsx` | AC-4 (tên hiển thị) |
| Trang và `LO-TRINH.html` thật khớp nhau: 23 mốc, 95 việc dưới mốc, 99 việc chưa hẹn mốc | `test/lo-trinh-mo-hinh.dom.tsx` | AC-5 (ca đối chiếu) |
| Bản chụp hay tệp đời trước vẫn hiện như cũ, không bật hộp «Trang có thể thiếu một phần» | `lib/lo-trinh/doc-trang.ts`, `cau-hinh.ts` | AC-6 (khối cũ) |
| Đúng ở 375 và 1280 px, tiếng Việt và Anh, sáng và tối | thước `rang/do-man.mjs` | AC-7 (màn thật) |

Trên dữ liệu thật hôm nay người xem không thấy khác gì ngoài dòng số của mốc.

## Khối giao diện

Không có khối mới. Dòng số là chữ phụ trong `TimelineContent` của `Timeline` (bậc 1, `packages/ui`), cùng kiểu dòng tên lộ trình ngay trên; các chỗ khác chỉ đổi nguồn tên.

## Hồ sơ

- `_acceptance/trang-lo-trinh-mo-hinh-hien-thi/` — Cổng Đáng (build, 19/10) · Cổng Phạm vi làn V (cửa veto mở 13:48Z) · S4 vòng 2 PASS ở `e96ab66de` · Cổng Bằng chứng chờ chủ kho định tuyến 5 mục ngoài hợp đồng.
- Nhánh dựng trên `chore/lo-trinh-tin-hieu-cong-dang` (#492, mười hai ô Cổng Đáng của đợt `lo-trinh-tin-hieu`) — PR này mang theo các commit ấy nếu #492 chưa gộp trước.

## Ra khỏi kho

Không có.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
