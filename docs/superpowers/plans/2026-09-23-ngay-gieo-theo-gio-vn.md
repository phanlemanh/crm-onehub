# Kế hoạch: ngay-gieo-theo-gio-vn

Hồ sơ: `_acceptance/ngay-gieo-theo-gio-vn/` · Design:
`docs/superpowers/specs/2026-09-23-ngay-gieo-theo-gio-vn-design.md`

| Task | Làm gì | Tệp | Kiểm từng task | Phục vụ | independent |
| --- | --- | --- | --- | --- | --- |
| T1 | `ngayCach` lấy ngày lịch VN hôm nay cộng số ngày, lưu ở nửa đêm UTC | `apps/api/test/support/ke-hoach-gieo.ts` | `ngv_ngay_gieo` xanh | E3, E4 | false |
| T2 | Ca `viec-cua-toi` chạy dưới hai mốc ghim `khung-dem`, `khung-ngay` với ngày mong đợi viết trước; thêm ca `ngay-gieo-theo-vn` so `ngayCach` với `ngayLich` | `apps/api/test/moi-phia-ke-hoach.spec.ts` | `ngv_khung_dem`, `ngv_khung_ngay`, `ngv_ca_tep` xanh | E1, E2, E3, E5 | false |
| T3 | Răng đột biến trên bản sao thư mục ẩn | `_acceptance/ngay-gieo-theo-gio-vn/rang/dot-bien-utc.mjs` | `ngv_dot_bien_utc` xanh; dời mốc `khung-dem` ra 09:00 VN thì răng đỏ | E4 | false |
| T4 | Năm lệnh chứng | — | `bun run test`, `check-types`, `lint`, `lint:slop`, `build` thoát 0 | E6–E10 | false |

Thứ tự: T1 → T2 → T3 → T4. Không task nào song song: T2 và T3 đọc chính mã T1 viết.

Ghi chú: T1–T3 đã dựng và chạy trước khi hợp đồng viết xong, vì đề bài đã chốt
cách sửa. Kế hoạch ghi lại đúng thứ đã dựng; lượt kiểm từng task chạy lại ở T4
và ở S4.
