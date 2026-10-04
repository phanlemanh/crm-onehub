# Review findings: man-okr-truoc-r1 (round 2)

## Trong hợp đồng

Không có phát hiện nào nằm trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New MUI_GIO constant re-declares the OKR timezone that OKR_CHU_KY.muiGio already holds, and the old literal in the same file stays**
  Người dùng thấy gì: Ngay gio tren man Cap nhat tuan hien dung gio Viet Nam nhu mong doi. Chi la neu sau nay doi mui gio cua OKR thi man nay co the khong doi theo va phai sua them tay.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: medium
  Đề xuất: known-limits

- **DaXongTuanNay copies DaGui's KR list block almost line for line**
  Người dùng thấy gì: Hai danh sach KR da gui (sau khi gui va khi mo lai trang) hien nay giong nhau. Neu sau nay sua mot ben thi phai nho sua ben kia, nhung nguoi dung khong thay khac biet gi luc nay.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: low
  Đề xuất: wont-fix

- **After «Sửa cập nhật» or a send from the partly-sent state, the success screen says KRs already sent this week are still waiting**
  Người dùng thấy gì: Ngay sau khi bam gui, man thanh cong co the noi con KR dang cho lan gui sau trong khi KR do thuc ra da duoc gui tuan nay. Nguoi dung co the nghi minh con thieu mot cap nhat va gui lai khong can thiet.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: medium
  Đề xuất: new-contract

- **Focus after «Sửa cập nhật» is lost when the first KR's value field is locked to its data source**
  Người dùng thấy gì: Khi KR dau tien lay so tu nguon tu dong va khong sua tay duoc, bam Sua cap nhat se khong dat con tro vao o nao, nguoi dung phai tu bam vao o can sua. Khong mat du lieu, chi mat mot buoc tien loi.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ (E5u: mỗi hàng KR mang mức tự tin của chính KR đó)**
  Người dùng thấy gì: Phep kiem tren man that chi xac nhan chu muc tu tin co mat trong hang, chua chung minh moi KR hien dung muc cua chinh no khi hai KR chon muc khac nhau. Neu co loi tron muc giua hai KR thi phep kiem nay co the khong bat duoc.
  file: `_acceptance/man-okr-truoc-r1/rang/man-r1c.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên ma trận toàn phần 12 khẳng định nhưng 2 ô là hằng null===null (E7)**
  Người dùng thấy gì: Bai kiem chu tren man Toan canh dem du 12 phep nhung hai phep o trang thai moi don vi da co luon dung vi so sanh hai gia tri rong. Nguoi dung khong bi anh huong; chi la bai kiem yeu hon so voi loi tuyen bo.
  file: `apps/app/test/okr-toan-canh-chu.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
