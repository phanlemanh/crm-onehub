# Thiết kế — khung-chung-ngan-ban-ghi

## Vấn đề

`RecordSheetFrame` có từ 31/07 nhưng khe chờ tải và lỗi là tuỳ chọn, nên ngăn KR (28/09) và ngăn Số KR tự dựng đầu
ngăn, vòng quay, khối lỗi riêng. Có mẫu chưa đủ; phải có thứ buộc ngăn dùng mẫu (wiki `ban-do-khuon.md`).

## Cách làm

1. **Hai lớp khung.** `KhungNgan` chỉ trình bày: đầu ngăn (`DetailSheetHeader`), ô số, thân theo trạng thái, thẻ con.
   `RecordSheetFrame` bọc nó và tính nút quay lại từ `useRecordStack`. Ngăn KR dùng `KhungNgan` qua `KhungKr`, vì một
   bài kiểm đã ký dựng `KhungKr` không có bộ chuyển nuqs.
2. **Ba trạng thái, một chỗ chọn.** Thân = `loading ? (loadingView ?? KhungXuongNgan) : error ? (errorView ??
   KhungTaiLoi) : than(theCon) ?? stats + theCon`. Ngăn chỉ thay mặt trạng thái qua khe, không thay chỗ chọn.
3. **Buộc bằng kiểu.** `loading`, `error`, `title` bắt buộc; `tabs` đi kèm `tab`, `onTabChange` qua kiểu hợp.
4. **Thành phần trạng thái.** `KhungXuongNgan` = `KhungXuong hinh="ngan"` (hình mới trong `packages/ui`).
   `KhungTaiLoi` = lớp vỏ lỗi có `data-ly-do`; mất kết nối + thử lại thì mặt trong là `VungTaiLoi`, còn lại là `Empty`
   viền liền với đúng một nút (Đóng, hay khe `hanhDong`).
5. **Giữ dấu đã ký.** Khe `vo`, `vungThan`, `than` mang dấu DOM và bố cục mà 18 tệp DOM đã ký đọc.
6. **Khuôn.** `design/patterns/ngan-ban-ghi.md` khai đối tượng, khe bắt buộc, thứ cấm ngoài khuôn và ngoại lệ — bản đọc
   được bằng máy cho BK2.

## Đo

Năm răng ở `rang/`: `quet-ngan.mjs` (tĩnh + ba chiều đỏ), `chay-dom.mjs` (khung, lỗi, bản mẫu, đối chứng âm),
`kieu-bat-buoc.mjs` (`tsc` trên tệp tạm), `bai-cu.mjs` (18 tệp DOM đã ký), `chup-proto.mjs` (app thật, 46 ảnh).
