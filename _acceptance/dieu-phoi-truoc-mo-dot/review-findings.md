# Review findings: dieu-phoi-truoc-mo-dot

## Trong hợp đồng

- **Hình dạng 3 (assert chuỗi/tệp có mặt trong khi lời hứa là quan hệ): trang-thai.json và bang.html 'được ghi trong cùng nhịp' chỉ đo bằng existsSync**
  AC: AC-1
  file: `scripts/dieu-phoi/test/tra-loi.test.mjs:70`
  severity: medium
  source: measurement
  detail: AC-1 hứa rằng trang-thai.json và bang.html được ghi trong cùng nhịp có tệp trả lời hỏng. Nhưng ca 'tệp trả lời hỏng cú pháp…' đã chạy motNhip hai lần trước nhịp cần đo (io('10:00') và io('12:00')), và motNhip ghi hai tệp này ở mọi lượt (phat-lich.mjs, ghiJsonNguyenTu(pTrangThai, tt) và writeFileSync bang.html). Vì vậy `assert.equal(fs.existsSync(path.join(dot, 'trang-thai.json')), true)` ở dòng 70 và dòng bang.html ngay dưới đã đúng từ trước nhịp 12:10, và không đo nhịp 12:10. Ví dụ: một đột biến bỏ bước ghi trạng thái khi có sự kiện tra-loi-hong vẫn qua được. Quan hệ thật cần đo là trang-thai.json có `nhip_cuoi === luc('12:10')`, hoặc mtime/nội dung đổi so với sau nhịp 12:00.
  rationale: AC-1 nêu tường minh rằng trang-thai.json và bang.html được ghi trong cùng nhịp có tệp trả lời hỏng; phép đo chỉ kiểm tệp tồn tại nên lời hứa này chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **kiemTraLoi rewrites the unknown-key check instead of using the existing kiemKhoaLa helper**
  Người dùng thấy gì: Người dùng không thấy gì sai: tệp trả lời có khoá lạ vẫn bị cách ly và báo lý do như hứa. Chỉ có rủi ro nhỏ là sau này ai đó sửa câu báo lỗi ở một nơi mà quên nơi kia, nên hai thông báo có thể lệch nhau.
  file: `scripts/dieu-phoi/hinh-dang.mjs`
  severity: low
  Đề xuất: wont-fix
- **Hình dạng 3/5 (lời hứa là quan hệ nhưng chỉ đo ở một điểm suy biến): 'mã thoát trùng khớp' của dòng lệnh bọc chỉ đo khi mã thoát là 0**
  Người dùng thấy gì: Khi thợ chạy một lệnh bị bọc mà lệnh đó báo lỗi, chưa có phép đo nào chứng minh lỗi ấy được báo ngược lại đúng; cách bọc hiện tại vẫn chạy đúng với lệnh thành công và có thể che lỗi nếu sau này bị sửa sai.
  file: `scripts/dieu-phoi/test/hook-chan-s4.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
