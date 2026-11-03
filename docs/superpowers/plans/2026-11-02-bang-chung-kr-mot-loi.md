# Kế hoạch thi công: bang-chung-kr-mot-loi (SV10)

Hồ sơ: `_acceptance/bang-chung-kr-mot-loi/` (Cổng Phạm vi duyệt 02/11, dòng nhập tại chỗ). Hạng T2, máy chủ không đổi.

## Ràng buộc đọc ra ở S2

- Thước đã ký `canh-kr-okr` (`rang/man-canh-kr.mjs` bước 9) đọc ô bằng chứng của khối cập nhật qua
  `[data-o='bang-chung'] input`, `field-label`, `field-error`, và so nhãn với `okrCanhKrMessages("vi").capNhat.bangChung`.
  Ô dùng chung giữ dấu `data-o="bang-chung"` và lấy nhãn, gợi ý từ `capNhat.bangChung`, `capNhat.goiY`. Giá trị nhãn đổi
  thành «Đường dẫn bằng chứng» (dòng nhập không có chữ «tuỳ chọn»); khoá tạm `bangChung.o` của bản mẫu bị gỡ.
- Bước 7 của cùng thước đọc `[data-hop-dinh-bang-chung] input[type='url']`, `[data-slot='field-error']`, `[data-nut='dinh']`,
  và đợi khối biến mất sau Đính. Dòng nhập giữ đúng các dấu này.
- `apps/app/test/cap-nhat-trong-ngan-kr.dom.tsx` đọc `[data-o="bang-chung"] input` trong khối cập nhật.

## Việc

1. `o-duong-dan-bang-chung.tsx`: thêm `data-o="bang-chung"`, nhãn và gợi ý theo `capNhat`. `loiDuongDan` sống ở đây.
2. `dong-dinh-bang-chung.tsx`: giữ nguyên (đã dựng ở S1 cho bản mẫu).
3. `kr-bang-chung.tsx`: gỡ `HopThoaiDinh` và mọi nhập `Dialog`, `Input`, `Field*`, `Textarea`, `Spinner`; dòng nhập
   `DongDinhBangChung` thay nút ở cuối danh sách hay trong khối rỗng; bỏ `loiDuongDan`, `BangChungVao` cục bộ (dùng kiểu của
   `@crm/validation/okr-canh-kr`). `kr-sheet.tsx` đổi chỗ nhập kiểu.
4. `khoi-cap-nhat-kr.tsx`: ô tự dựng thành `ODuongDanBangChung`; `loiDuongDan` nhập từ ô.
5. Messages: gỡ `bangChung.hop.{tieuDe,moTa,duongDan}` và `bangChung.o`; đổi giá trị `capNhat.bangChung` (vi, en).
   Bản mẫu `bang-chung-kr-mot-loi` đọc theo.
6. Khuôn `design/patterns/ngan-ban-ghi.md`: ngoại lệ `kr-bang-chung.tsx` còn `Spinner`. `apps/app/test/khung-ngan.spec.ts`:
   `NGOAI_LE_MONG` và ca `sheet-dialog` sửa theo.
7. Bài kiểm `apps/app/test/bang-chung-mot-loi.dom.tsx` (E1–E6, E12), răng `rang/nhap-lai-dialog.mjs` (E8),
   `rang/mot-o.mjs` (E13).
8. Năm lệnh của kho, rồi S4.

## Thứ tự

1 → 3 → 4 → 5 → 6 → 7 → 8. Bản mẫu và ảnh design-pass chụp lại ở E10 trong S4.
