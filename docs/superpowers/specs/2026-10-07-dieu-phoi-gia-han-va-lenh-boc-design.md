# dieu-phoi-gia-han-va-lenh-boc — design

Gốc: Cổng 2 của `dieu-phoi-va-bien` (07/10), hai mục owner chọn «mở hợp đồng mới». Phải gộp trước khi mở đợt sau-14-10
(`docs/plan/dot-sau-14-10/README.md` mục 1).

## 1. Tệp trả lời gia hạn hỏng làm đứng nhịp

**Hiện trạng.** Trong `motNhip`, `apGiaHan` chạy trước `xuLyKhoa`, `capPhat`, `capNhatHangKe` và bước ghi
`trang-thai.json`/`bang.html`. `apGiaHan` đọc `tra-loi/<id>.json` bằng `docJson`, hàm này ném lỗi khi JSON hỏng. Lỗi
bay lên `taoVong`, nhịp bị bỏ, sự kiện `loi-nhip` chỉ báo một lần mỗi 30′. Mỗi nhịp sau lặp lại y hệt: không thu hồi
khoá hết hạn, không cấp lượt, bảng đứng yên.

**Sửa.** Một hàm đọc tệp trả lời có kiểm trong `phat-lich.mjs`: đọc được và là object thì trả về; không đọc được
thành JSON, hoặc không phải object, thì dời tệp sang `tra-loi/hong/<id>.json` (cùng đường `hong/` mà `xin/` và
`yeu-cau/` đã dùng), ghi một sự kiện `tra-loi-hong` có `can_phan: true` nêu tệp và lý do, rồi trả `null` để
`apGiaHan` coi như chưa có trả lời. Tệp đã dời thì nhịp sau không thấy nó nữa, nên không báo lặp; yêu cầu quay về
đường xét thường của `xuLyYeuCau` (trong trần máy duyệt lại, vượt trần chờ giám sát).

Phương án đã loại: bọc cả `apGiaHan` trong `try/catch` rồi bỏ qua — nhịp sống lại nhưng tệp hỏng nằm nguyên, mỗi
nhịp ném lại, và không ai được báo đúng tệp nào hỏng.

## 2. Lệnh bọc giữ nhịp với biến môi trường đứng trước

**Hiện trạng.** `lenhBoc` trong `hook-chan-s4.mjs` để nguyên lệnh khi mọi ký tự «an toàn», và tập ký tự an toàn có
`=`. Lệnh `TZ=Asia/Ho_Chi_Minh bun test …` vì thế thành `node giu-nhip.mjs -- TZ=Asia/Ho_Chi_Minh bun test …`;
`giu-nhip.mjs` gọi `spawn('TZ=Asia/Ho_Chi_Minh', …)`, không có chương trình nào tên như vậy, thoát 127.

**Sửa.** `giu-nhip.mjs` tách các từ đầu có dạng `TÊN=giá trị` thành môi trường của tiến trình con (gộp trên
`process.env`), rồi chạy phần còn lại. Không còn lệnh nào sau phần gán biến thì thoát 2 với dòng cách dùng. Sửa ở
`giu-nhip` thay vì ở `lenhBoc` để cả dòng gợi ý của hook lẫn người gõ tay đều đúng; `lenhBoc` giữ nguyên.

Phương án đã loại: bắt `lenhBoc` luôn bọc bằng `bash -c` khi lệnh có `=` — chữa dòng gợi ý nhưng người gõ thẳng
`giu-nhip.mjs -- TZ=… lệnh` vẫn gặp 127.

## 3. Phép đo

- Test mới `scripts/dieu-phoi/test/gia-han-va-lenh-boc.test.mjs`: mỗi tiêu chí một ca, hai chiều trên cùng fixture.
- Bộ đột biến của vòng `_acceptance/dieu-phoi-gia-han-va-lenh-boc/rang/dot-bien.mjs` (cùng khuôn bộ của
  `dieu-phoi-hai-tang`): gỡ từng phần sửa thì đúng ca ghim đỏ.
- Ranh giới mã dùng lại thước `dph_ranh_gioi` của `dieu-phoi-hai-tang`.

## 4. Không chạm UI

Không có bề mặt giao diện; không có đặc tả UX, không design-pass.
