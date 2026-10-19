## Trong hợp đồng

- **Hình dạng 5 (hứa cả lớp mà chỉ đo vài điểm): AC-5 hứa «qua toàn bộ các lần đọc của AC-1…AC-5» nhưng vca-tinh-luc-doc chỉ bọc mười lần gọi của hai câu đọc**
  AC: AC-5
  file: `apps/api/test/viec-cha-an.spec.ts:312`
  severity: low
  source: measurement
  detail: AC-5 của contract.md viết: «qua toàn bộ các lần đọc của AC-1…AC-5 số hàng của viec, viecGan, viecTheoDoi, viecVet chỉ đổi đúng theo các lệnh ghi của fixture». Trong test, demHang() chỉ chụp trước và sau vòng `for (i<5) { conCua(c,K); bang(c,'giao-cho-toi') }` trong chính vca-tinh-luc-doc. Các câu đọc khác của các AC (viec.get, viec.lichSu, viec.cuaToi, viec.cuaBanGhi ở vca-quet, nhóm 'toi-giao' ở vca-bang và vca-dem-con) không nằm trong cặp đếm nào. Thêm nữa, phép đo là số hàng của bốn bảng, nên một câu đọc ghi đè lên hàng có sẵn (UPDATE) vẫn cho truoc === sau. Phép đo này chỉ phủ vài điểm trong lớp mà AC hứa. Bản thân evals.yaml E5 cũng đã thu hẹp lời hứa về hai câu đọc mà không khai giới hạn ấy.
  rationale: AC-5 hứa câu đọc không ghi gì qua toàn bộ các lần đọc của AC-1 đến AC-5. Phép đo chỉ bọc mười lần gọi của hai câu đọc, nên lời hứa của AC-5 chưa được đo đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tệp test mới thêm chú thích trong code, trái luật «Never add code comments» của AGENTS.md**
  Người dùng thấy gì: Hai dòng chú thích trong tệp kiểm thử không theo quy ước của kho. Người dùng không bị ảnh hưởng gì, chỉ là tệp này viết khác các tệp còn lại.
  file: `apps/api/test/viec-cha-an.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
