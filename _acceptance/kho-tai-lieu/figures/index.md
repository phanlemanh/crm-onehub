# Hình tại điểm quyết định — kho-tai-lieu, Cổng 1

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Trình soạn giàu, lưu markdown qua một bộ tuần tự hoá, diff kiểu Track Changes (sổ quyết định, approach 1) | 5 bước nối tiếp: gõ hay dán → trình soạn → tuần tự hoá → lưu bản đề xuất → diff và hash lúc duyệt | `duong-cua-noi-dung` |
| Vòng đời một bản đề xuất, so-và-đặt (AC-4, AC-6, AC-7) | 3 nhánh rẽ từ «chờ duyệt»: đã duyệt · trả lại · cũ | `vong-doi-de-xuat` |
| Dời lịch sử, khôi phục, lưu trữ sang lượt 3 (descope) | dưới ngưỡng: 1 bước | — |
| Mọi trang toàn công ty đọc được (descope) | dưới ngưỡng: 1 bước | — |
| Quản trị duyệt thay cho phó (approach) | dưới ngưỡng: 1 nhánh | — |
| Chạy design-pass trước Cổng 1 (approach) | dưới ngưỡng: 1 bước | — |
| [GIẢ ĐỊNH] sự kiện composition mô phỏng đủ đại diện bộ gõ thật | dưới ngưỡng: 1 bước | — |

## Đề bài `duong-cua-noi-dung`

- Loại hình: sơ đồ luồng dữ liệu (data flow), trái sang phải.
- Nút: Người gõ hoặc dán từ Word/Google Docs → Trình soạn (Tiptap, chỉ bảy loại nút) → Bộ tuần tự hoá duy nhất (packages/ui, cùng cấu hình ở máy chủ) → Bản đề xuất (markdown, NFC) → Màn duyệt: hai bản → diff theo từ → ins/del trên trang đã trình bày + diffHash.
- Nhánh phụ: máy soạn ở lượt 2 đi vào cùng bộ tuần tự hoá (nét đứt, nhãn «lượt 2»).
- Nhãn: «markdown không bao giờ hiện cho người», «mở rồi lưu không sửa = y hệt từng byte (AC-10)».
- AC: AC-9, AC-10, AC-11, AC-13.

## Đề bài `vong-doi-de-xuat`

- Loại hình: máy trạng thái.
- Trạng thái: Chờ duyệt → Đã duyệt (tạo phiên bản N+1, đặt bản đang dùng) · Trả lại (cần lý do) · Cũ (bản gốc ≠ bản đang dùng, hoặc một đề xuất khác cùng bản gốc vừa được duyệt).
- Cạnh «Duyệt» có điều kiện: người duyệt được (chủ trang, quản trị) VÀ diffHash khớp VÀ bản gốc = bản đang dùng.
- Nhãn: «một lần ghi: phiên bản + con trỏ + sự kiện + liên kết + cột tìm».
- AC: AC-4, AC-5, AC-6, AC-7, AC-15.
