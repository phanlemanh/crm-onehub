# Thiết kế — kiem-cheo-chay-quang-lang

## Sự thật đo (đêm 10/10, `lan-2026-10-10.log`)

- Bảy suite của làn tốn 13′ mỗi lần gọi (api 192 s, app/ui 267 s, agent 226 s, agent-okr 66 s, lint 3 s, lint:slop 4 s, build 40 s).
- 146 hồ sơ, 1839 eval máy; trong 80′ (trần `repin_budget_min` của làn) đo trọn 22 hồ sơ. Làn thoát mã 4, không in JSON kết quả,
  chỉ để lại từng dòng `[lane] <hồ sơ> <eval>: <lệnh> → exit <mã> (<giây>)` theo đúng thứ tự `--slug` đã truyền.
- `dem.mjs` coi mã 4 là «làn dừng sớm» → `khong-chay-duoc`, không lưu gì; mốc không tiến nên đêm sau đo lại đúng 146 hồ sơ.
- `xepHang` của `lich.mjs` xếp đơn `kiem-cheo` mang `moc` (ngày gộp cũ nhất chưa kiểm) trước mọi đơn thợ chưa có mốc.

## Cách làm

1. **Lịch.** Khoá xếp hàng thêm một phần tử đầu: đơn của phiên `kiem-cheo` = 1, mọi đơn khác = 0. Phần còn lại giữ nguyên (ghim
   lại mở merge, mốc, giờ xin). `capLuot` đã duyệt theo thứ tự xếp và đánh dấu tài nguyên đã cấp, nên đơn `kiem-cheo` chỉ được
   cấp khi không đơn thợ nào cùng tài nguyên còn chờ. Bỏ cách đọc `moc` để ưu tiên kiểm chéo (`PHIEN_MANG_MOC`).
2. **Đọc nhật ký khi chạm trần.** Mô-đun mới `scripts/kiem-cheo/tien-do.mjs`:
   - `docNhatKyDung(raLan, slugs)` — hồ sơ cuối có dòng kết quả là hồ sơ đang dở; mọi hồ sơ đứng trước nó là xong (kể cả hồ sơ
     không có eval máy nào). Dòng `(chạy lại)` thay kết quả lần đầu; dòng `(đã chạy)` lấy lệnh từ dòng trước cùng eval nếu có.
   - Eval lệch của hồ sơ xong (theo mã kỳ vọng ở `D`, hàm `lech` sẵn có) đi qua `phanLoai` như lượt thường.
3. **Tiến độ.** `.acceptance-runs/kiem-cheo/tien-do.json` = `{tu, den, xong, do}`, ghi tệp tạm rồi đổi tên. Lượt chạm trần ghi
   tệp này, báo kết quả ngày `chua-xong` (k/N), không tiến mốc. Lượt sau cùng mốc `tu`: tập đo = tập chạm `tu..D'` trừ hồ sơ
   `xong` không bị chạm trong `den..D'` (tính bằng `tapCham` trên `tepDoi(den, D')`). Đo hết → gộp `do` (bỏ `do` cũ của hồ sơ
   đo lại), tiến mốc tới `D'`, xoá tệp. Tệp hỏng hay khác mốc → đo trọn, ghi lý do vào kết quả ngày.
4. **Nối F9.** `kiem-cheo-sau-gop/E2` (AC-5 cũ) chuyển `status: not-run` + `superseded_by: kiem-cheo-chay-quang-lang#AC-1`.

## Thử

- `lich.test.mjs`: ma trận thợ × kiểm chéo (có/không `moc`, ghim lại mở merge) — kiểm chéo luôn sau; `capLuot` không cấp kiểm
  chéo khi còn đơn thợ cùng tài nguyên. Ca cũ «kiem-cheo mang moc xếp trước» đảo chiều.
- `tien-do.test.mjs`: đọc nhật ký (đang dở, chạy lại, đã chạy, ngoài danh sách, không dòng nào), tập còn lại, gộp `do`, đọc tệp
  hỏng/thiếu trường/khác mốc.
- `dem.test.mjs` thêm ba đêm trên kho git giả và làn giả: đêm 1 làn thoát 4 sau 2/4 hồ sơ → `chua-xong`, tiến độ ghi đúng, mốc
  đứng; đêm 2 không gộp mới → làn chỉ nhận 2 hồ sơ còn lại → xanh, mốc tiến, tiến độ xoá; biến thể đêm 2 có lần gộp mới chạm
  một hồ sơ đã xong → hồ sơ đó được đo lại.

## Đặc tả UX

Không áp: việc điều phối dòng lệnh, không có màn.
