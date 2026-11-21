# Hình tại điểm quyết định — chuyen-cho-delivery-loop-3-0

| Điểm | Đếm | Hình |
|---|---|---|
| Phía CI của crm: lớp chép chạy trong kho, một luồng kéo kit lúc chạy, hai công cụ máy gọi gói theo tên | 4 bước nối tiếp (thẻ kit → lớp chép → lưới `gate` → luồng gom và kiểm chéo đêm) | `phia-ci.html` |
| Hỏi-1 tệp mẫu `lo-trinh-kit.html` | 2 nhánh rẽ | gộp vào `phia-ci.html` (nhánh ở ô tên lệnh cũ) |
| Hỏi-2 `CLAUDE.md` chỉ đường báo lỗi kit | 2 nhánh rẽ | gộp vào `phia-ci.html` |
| Dòng sổ máy đã quyết (chép lại lớp CI, gỡ `dieu-phoi/`, tên skill và gói, gói đợt, tập ghim) | mỗi dòng một lối sống | dưới ngưỡng: 1 lối |

## Đề bài `phia-ci.html`

- Loại: sơ đồ luồng trái → phải, một hàng chính, hai nhánh rẽ ở cuối.
- Nút: «Thẻ v3.0.0 (c16d25db)» → «Lớp CI chép 38 tệp (thay bản 2.37)» → «Lưới gate trên PR: 366/366 hồ sơ cùng phán quyết» ;
  nhánh phụ từ thẻ: «tin-hieu-gom.yml kéo kit lúc chạy» → «phiên gom gọi signal-intake, scope-slice» ; «kiểm chéo đêm giải gói dispatch».
- Nhánh rẽ cuối: «Hỏi-1 tệp mẫu: đổi 14 tên (khuyên) / giữ» và «Hỏi-2 CLAUDE.md: đổi đường (khuyên) / để II.4».
- Nhãn chữ thường, tiếng Việt; AC liên quan: AC-1, AC-2, AC-5, AC-6, AC-7.
