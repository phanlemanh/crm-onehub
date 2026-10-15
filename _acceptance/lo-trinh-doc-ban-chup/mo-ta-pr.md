Hàng **LT1c** của `docs/plan/lo-trinh-okr.json` (đợt `vong-tin-hieu-1410`, mốc mới «Lộ trình nhiều sản phẩm — bước 1: trang đọc bản chụp», 16/10). Hồ sơ `_acceptance/lo-trinh-doc-ban-chup/` (T3).

**Người dùng thấy gì khác:** trang Lộ trình đọc bản lộ trình mới nhất của nhánh chính mà GitHub gửi sang mỗi khi lộ trình đổi, không phải chờ bản dựng; đầu trang có dòng «Cập nhật lúc …» theo giờ người xem, kèm «(bản dựng)» khi trang đang đọc lộ trình đóng sẵn. Đây là nền cho LT3 (lộ trình nhiều sản phẩm) và TH3.

| Người dùng thấy gì khác | Đụng đâu | Tiêu chí |
|---|---|---|
| CRM giữ một bản lộ trình mỗi sản phẩm; bản cũ hơn không ghi đè bản mới | bảng `BanChupLoTrinh`, migration `20261014084104_ban_chup_lo_trinh` | AC-1, AC-4 |
| Chủ hoặc quản trị tạo khoá «Chỉ đẩy lộ trình» | `packages/auth` (cấu hình khoá thứ ba), Cài đặt › Khoá API | AC-2 |
| CRM nhận bản lộ trình qua khoá đó, từ chối bản hỏng và nói đúng chỗ hỏng | `POST /rest/lo-trinh/ban-chup` | AC-1, AC-2, AC-3 |
| Trang đọc bản lấy về khi mới hơn bản đang chạy; Preview luôn đọc bản của chính nó | `apps/app/lib/lo-trinh/*` | AC-5, AC-6, AC-8 |
| Dòng «Cập nhật lúc …» theo múi giờ trình duyệt | `components/lo-trinh/dong-gio-lay.tsx` | AC-7 |
| GitHub gửi bản mới mỗi lần lộ trình đổi, ghi kết quả từng lượt | `.github/workflows/ban-chup-lo-trinh.yml`, `scripts/ban-chup-lo-trinh/day.ts` | AC-1, AC-3, AC-5 |
| Chủ kho đo độ trễ hai tuần sau giao | `scripts/ban-chup-lo-trinh/do-tre.ts` | AC-9 |

**Bậc giao diện (docs/design.md «Vẽ tay là bậc cuối»):**
- Dòng giờ lấy: dừng ở bậc 1 — chữ phụ theo nếp `text-muted-foreground` đang có ở vùng lộ trình; đã tra `packages/ui` (không có thành phần «chữ phụ đứng riêng» ngoài `FieldDescription` dành cho ô nhập).
- Lựa chọn «Chỉ đẩy lộ trình»: bậc 1 — thêm một mục vào `RadioGroup` của ô loại khoá TH1 dựng.

**Chạm hồ sơ khác (theo điều kiện điều phối, crm-onehub#375):**
- TH1 `tin-hieu-tu-ve-kho`: thêm hai dòng miễn vào `rang/bang-duong-doc-khoa.json`, sửa test `tvk-man` từ 2 lên 3 lựa chọn; ghim lại trong PR này.
- LT1b `ngan-ho-so-trong-lo-trinh`: phá-thử vai của `apps/app/test/ngan-ho-so-vai.dom.tsx` theo lời gọi mới `docDauVaoChoVai`; ghim lại trong PR này.

**Sau gộp, chủ kho làm một lần:** tạo khoá «Chỉ đẩy lộ trình» ở Cài đặt › Khoá API; đặt bí mật kho `CRM_KHOA_DAY_LO_TRINH`; chạy tay workflow «Bản chụp lộ trình» một lần **từ nhánh `onehub`**.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
