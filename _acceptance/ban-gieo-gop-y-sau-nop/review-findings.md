# Review findings: ban-gieo-gop-y-sau-nop (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gắn thuộc tính lạ `.ban` lên Set do trangThaiBangChung trả về (sửa đối tượng tại chỗ, kiểu ngầm)**
  Người dùng thấy gì: Không ảnh hưởng gì đến người dùng hay kết quả đo: chỉ là cách viết mã bên trong công cụ đo hơi vụng và đọc ảnh bằng chứng nhiều lần hơn cần thiết. Sửa tốn công mà không đổi kết quả nào.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`
  severity: low
  Đề xuất: wont-fix

- **Lỗi ghi khi trả tệp đã bẩn văng ra mã 1 thay vì KHONG DO DUOC mã 2**
  Người dùng thấy gì: Trong một tình huống hiếm (thư mục bằng chứng có tệp lạ bị lệnh đo xoá), phép đo có thể báo là đo đỏ thay vì báo là không đo được. Người đọc kết quả có thể hiểu nhầm mức độ sự cố, nhưng việc này không làm sai kết quả đo bình thường.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Đường dẫn bị porcelain đặt trong ngoặc kép làm lớp chụp và trả tệp đã bẩn im lặng không chạy**
  Người dùng thấy gì: Nếu sau này có ảnh bằng chứng đặt tên có dấu hoặc dấu cách, ảnh bị phép đo ghi đè có thể không được trả lại nguyên trạng mà không ai biết. Hiện chưa xảy ra vì mọi tên tệp đều không dấu.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`
  severity: low
  Đề xuất: known-limits

- **ba-ban-do.mjs: dirt left by an aborted run is treated as 'already dirty' on the next run, so the evidence guard passes quietly**
  Người dùng thấy gì: Nếu một lượt đo bị dừng đột ngột giữa chừng, lượt chạy kế tiếp có thể coi ảnh bằng chứng đã bị ghi đè là bình thường và báo xanh. Cách tránh: sau khi ngắt lượt đo, kiểm lại ảnh bằng chứng của ba hồ sơ kia trước khi tin kết quả.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 2 (khuôn viết tay theo ý bên đọc, không lấy từ bên ghi): regex kết luận của E3 không khớp dòng «KHONG DO:» mà r1a_man_chip thật sự in**
  Người dùng thấy gì: Khi một trong ba bàn đo màn dừng giữa chừng ở bước đo và in ra một câu báo không đo được theo kiểu riêng, bản tổng hợp sẽ không nhận ra câu đó và báo thiếu kết luận. Người đọc vẫn thấy bàn đó đỏ, nhưng lý do thật của nó bị che trong bản tổng hợp.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/ba-ban-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **dot-bien xoá mọi bản sao .san-gop-y-vet-* lúc khởi động, kể cả bản sao của một lượt dot-bien khác đang chạy (r1)**
  Người dùng thấy gì: Nếu hai lượt phá thử chạy cùng lúc trên một cây, lượt này có thể xoá bản sao đang dùng của lượt kia. Kết quả là báo «không đo được» hoặc báo nhầm vết lọt. Chạy lại từng lượt một thì hết.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc (hình 2): ca 'loi' dùng outcome không tồn tại, việc giả chép tay khuôn select của nop() (r1)**
  Người dùng thấy gì: Một ca thử dùng giá trị kết cục mà hệ thống thật không bao giờ ghi ra. Phép thử vẫn chặn đúng việc đóng sai, nhưng nếu tên kết cục thật đổi thì ca này không báo kịp.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/kiem-nop.mjs`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): vết (c) chỉ đòi bộ phân loại nói 'khong qua', không đối chứng dương trong cùng lượt (r1)**
  Người dùng thấy gì: Nếu bộ phân loại hỏng theo kiểu luôn báo «không qua bước gieo», phép thử phá này vẫn xanh. Lỗi đó chỉ lộ ra ở một phép đo khác chứ không ở chính phép thử này.
  file: `_acceptance/ban-gieo-gop-y-sau-nop/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
