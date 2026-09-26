## Trong hợp đồng

- **Hình dạng 5 (tuyên quét LỚP, chỉ đếm một phần): E5 hứa "tổng số lời gọi trong tệp đúng 6" nhưng thước chỉ đếm lời gọi nằm trong thân test()**
  file: `_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs:109`
  severity: low
  AC: AC-5
  evals.yaml E5 vế (2) hứa "tong so loi goi trong tep dung 6". AC-5 hứa "chỉ hai lời gọi ma trận trong khoa-con-bat truyền LO_SONG_SONG". Nhưng soiTuanTu (soi-tep.mjs:109-116) tính `tong` chỉ trên các lời gọi `maTranTrpc`/`maTranRest` có `g.dau > c.dau && g.ket < c.ket` với một ca test(). Vòng lặp theo CHO_GOI_MA_TRAN (125-146) cũng chỉ lọc trong khung ca. Ở tệp hiện tại cả 6 lời gọi (dòng 462/473/486/508/533/542) đều nằm trong ca, nên kết quả hôm nay đúng. Tuy vậy có ba cách truyền LO_SONG_SONG mà thước không thấy: (1) một hàm phụ ngoài test() gọi `maTranTrpc(dau, LO_SONG_SONG)` rồi được doi-chung-thanh-vien gọi; (2) một ca khác gọi thẳng `theoLo(soThuTuc(), fn, LO_SONG_SONG)`, vì thước không quét theoLo; (3) đổi giá trị mặc định `lo = 1` của theoLo, vì thước chỉ đọc số đối số. Ở cả ba cách, tệp có một ma trận khác chạy song song mà E5 vẫn in "tep co dung 6 loi goi ma tran trong cac ca" và thoát 0. Vế hành vi (ca theo-lo) chỉ đo theoLo trên 40 phần tử giả, không đo lời gọi thật của bốn ca kia. Tự kiểm duy nhất (thêm `, LO_SONG_SONG` vào doi-chung-thanh-vien) chỉ thử đúng dạng lời gọi trực tiếp trong thân ca. Thông điệp máy in ("trong cac ca") hẹp hơn lời hứa của eval ("trong tep").
  rationale: AC-5 hứa "chỉ hai lời gọi ma trận trong khoa-con-bat truyền LO_SONG_SONG — bốn lời gọi ma trận của các ca khác giữ mặc định tuần tự"; finding chỉ ra thước đo (E5) chỉ quét lời gọi trong thân test(), nên có những cách truyền LO_SONG_SONG nằm ngoài phạm vi quét mà vẫn được báo xanh, tức lời hứa của AC-5 không thực sự được kiểm chứng đầy đủ như đã tuyên.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **soi-tep.mjs khai lại đường dẫn spec và package.json đã có trong chung.mjs**
  Người dùng thấy gì: Nếu sau này đổi tên hoặc vị trí tệp kiểm thử, công cụ đo tự động có thể vẫn hiển thị tên tệp cũ trong thông báo kết quả, gây hiểu nhầm nhẹ khi đọc báo cáo — nhưng không ảnh hưởng đến việc tính năng có chạy đúng hay không.
  file: `_acceptance/khoa-con-bat-xa-tran/rang/soi-tep.mjs`
  severity: low
  Đề xuất: known-limits

- **Regex bỏ mã màu dựng bằng String.fromCharCode(27), lách luật noControlCharactersInRegex của biome**
  Người dùng thấy gì: Không ảnh hưởng đến người dùng cuối; đây là một chi tiết kỹ thuật trong công cụ đo nội bộ của đội phát triển, không phải trong phần mềm mà khách hàng sử dụng.
  file: `_acceptance/khoa-con-bat-xa-tran/rang/chung.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).