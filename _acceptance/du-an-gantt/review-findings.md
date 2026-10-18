## Trong hợp đồng

- **Hình dạng 3 (chỉ kiểm có mặt trong khi lời hứa là quan hệ giá trị): duAn.list chỉ được kiểm `truong in h`, giá trị soViec/soXong/batDauSom/hanMuon không được đo ở bất kỳ chỗ nào**
  file: `apps/api/test/du-an.spec.ts:116`
  AC: AC-1
  severity: medium
  detail: Dòng 116-120: `for (const truong of COT_LIST) if (!(truong in h)) throw 'dg: list thieu cot'`. Đây chỉ là kiểm khoá có mặt, mà hai dự án mo1, mo2 ở đây lại không có việc nào, nên mọi giá trị đều là 0/null. Lời hứa của AC-1 và E1b là bảng dự án hiện đúng «x/y việc xong» và đúng khoảng ngày, tức là quan hệ: soViec = số việc không Huỷ, soXong = số việc Xong, batDauSom = min(batDau), hanMuon = max(han). Service tính các giá trị đó ở du-an.service.ts dòng 91-110, nhưng không test API nào so chúng với dữ liệu đã gieo (grep soViec/soXong/batDauSom/hanMuon trong apps/api/test chỉ ra COT_LIST). Phía màn (du-an.dom.tsx, dòng 388-389) thì so với giá trị viết tay trong fixture (soViec 3, soXong 1, '2026-10-19', '2026-11-06'). Vì vậy chuỗi «dữ liệu thật → số trên bảng» không có phép đo nào.
  source: measurement

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cờ suaDuoc của duAn.lich được gõ tay ở test màn, phía máy chủ không test nào kiểm cờ đó**
  file: `apps/app/test/du-an-gantt.dom.tsx:336`
  AC: AC-5
  severity: medium
  detail: E5b khẳng định «V2 suaDuoc false thì không kéo được». Fixture LICH_P (dòng 335-337) gõ tay `thanhLich("v2", …, false)`, và dòng 603 chỉ kiểm rằng màn tôn trọng cờ đó (`v2?.draggable !== false`). Bên ghi, tức duAn.lich tính suaDuoc theo vai người xem, không được đo ở test API nào: grep `suaDuoc|nghia` trong apps/api/test không có kết quả nào cho du-an. Ma trận quyền (du-an-quyen.spec.ts) chỉ kiểm lệnh viec.doiLich bị từ chối, không kiểm cờ suaDuoc mà duAn.lich trả về cho người theo dõi hay người khác. Nếu máy chủ trả suaDuoc true cho người không sửa được, test màn vẫn xanh. Ánh xạ trangThai sang `nghia` (tô màu thanh 'xong' thành success ở E4) cũng chỉ có fixture viết tay, không có lượt đi-về từ bên ghi.
  source: measurement

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): khoá điều khiển của thành viên ở Lịch làm việc dựa trên cờ `sua` gõ tay, máy chủ không bao giờ được đo**
  file: `apps/app/test/lich-lam-viec.dom.tsx:135`
  AC: AC-9
  severity: medium
  detail: E9b nói «Mount… với phiên admin» và «Phiên member: mọi nút… mang disabled». Thực tế mock lichLamViec.get trả `sua` gõ tay qua `moTrang(true/false)` (dòng 129-135), và test member chỉ gọi `moTrang(false)`. Bên ghi là lich-lam-viec.service.ts dòng 35 (`sua: canManageSettings(...)`). Test API lich-lam-viec.spec.ts có gọi lichLamViec.get bằng cả owner lẫn member (dòng 70 và 136), nhưng không assert `sua` lần nào. Với member, nó chỉ kiểm `docM.status === 200`. Cờ quyết định màn có khoá hay không vì thế không có lượt đi-về từ bên ghi sang bên đọc.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **duAn.list tính «hôm nay» theo giờ UTC, không theo ngày lịch Việt Nam**
  Người dùng thấy gì: Từ nửa đêm đến 7 giờ sáng giờ Việt Nam, cột «Mốc» ở danh sách dự án và dải đầu dự án có thể hiện mốc của hôm qua thay vì mốc sắp tới.
  file: `apps/api/src/du-an/du-an.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Xoá dự án không để lại vết nào**
  Người dùng thấy gì: Khi một dự án hoặc một ngày lễ bị xoá, không còn dấu vết cho biết ai xoá và xoá lúc nào.
  file: `packages/db/src/du-an-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **ghiVetDuAn nhận JSON không kiểu rồi ép kiểu, trong khi đã có schema VetDuAn**
  Người dùng thấy gì: Người dùng không thấy khác biệt ngay. Chỉ là về sau nếu ai gõ sai khi ghi lịch sử dự án thì lỗi chỉ lộ ra lúc có người mở lịch sử đó.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: wont-fix

- **duAn.get tải toàn bộ dự án (cả mở lẫn đóng) rồi lọc theo id trong JS; list chạy một truy vấn đếm cho từng dự án**
  Người dùng thấy gì: Khi công ty có rất nhiều dự án, mở một dự án hoặc danh sách dự án sẽ chậm dần.
  file: `apps/api/src/du-an/du-an.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hộp «Thêm ngày lễ» ở Cài đặt giữ trạng thái mở bằng useState, và nút gửi không tắt khi form chưa hợp lệ**
  Người dùng thấy gì: Ở trang Lịch làm việc, tải lại trang thì hộp «Thêm ngày lễ» tự đóng, và nút «Thêm» vẫn bấm được khi chưa chọn ngày hay chưa gõ tên, chỉ báo lỗi sau khi bấm.
  file: `apps/app/app/(app)/[slug]/settings/lich-lam-viec/lich-lam-viec.tsx`
  severity: medium
  Đề xuất: known-limits

- **Phạm vi một dự án: lỗi tải duAn.get (không phải 404) hiện khung xương mãi, không có VungTaiLoi**
  Người dùng thấy gì: Nếu việc tải phần đầu của một dự án bị hỏng, người dùng thấy khung chờ mãi mà không có thông báo lỗi hay nút thử lại.
  file: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hằng số một ngày tính bằng mili giây viết lại hai lần, trong khi đã có DAY_MS**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; chỉ là mã lặp lại một con số ở vài nơi nên sau này chỉnh dễ sót.
  file: `packages/db/src/lich-lam-viec.ts`
  severity: low
  Đề xuất: wont-fix

- **Trần 300 việc viết cứng trong câu thông báo, không lấy từ DU_AN.viecToiDa; vài câu lỗi nằm rải ngoài DU_AN.thongDiep**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng hôm nay; nếu sau này đổi số việc tối đa mà quên sửa câu thì thông báo sẽ ghi sai con số.
  file: `packages/db/src/du-an.ts`
  severity: low
  Đề xuất: wont-fix

- **Gantt ReUI chép vào mang góc viết tay rounded-[2px] / rounded-[1px]**
  Người dùng thấy gì: Một vài góc bo trên sơ đồ Gantt lệch nhẹ so với thang góc chung của giao diện; mắt thường gần như không thấy.
  file: `packages/ui/src/components/reui/gantt/gantt-bar.tsx`
  severity: low
  Đề xuất: known-limits

- **docDuAnMo trộn kiểm «dự án đang mở» với trần 300 việc nên khoá mọi thao tác mốc và phụ thuộc khi dự án đủ 300 việc**
  Người dùng thấy gì: Khi một dự án đã đủ 300 việc, người dùng không thêm, sửa hay xoá được mốc và phụ thuộc, và nhận câu báo sai rằng dự án chứa tối đa 300 việc.
  file: `packages/db/src/du-an-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **Bỏ chọn hết ngày nghỉ trong tuần thì máy lặng lẽ quay về Thứ Bảy và Chủ Nhật**
  Người dùng thấy gì: Nếu quản trị bỏ chọn hết ngày nghỉ trong tuần, hệ thống vẫn báo đã lưu nhưng lại tự trả về Thứ Bảy và Chủ Nhật nghỉ, nên công ty làm cả tuần không đặt được.
  file: `packages/db/src/du-an.ts`
  severity: medium
  Đề xuất: new-contract

- **Phạm vi một dự án: duAn.get lỗi khác NOT_FOUND thì dải đầu dự án hiện khung xương mãi, không có vùng lỗi hay nút thử lại**
  Người dùng thấy gì: Nếu phần đầu trang của một dự án tải hỏng, người dùng chỉ thấy khung chờ mãi, không biết là lỗi và không có cách thử lại.
  file: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`
  severity: low
  Đề xuất: known-limits

- **duAn.list chọn «mốc kế» theo ngày UTC trong khi lịch dự án tính theo giờ VN**
  Người dùng thấy gì: Từ nửa đêm đến 7 giờ sáng giờ Việt Nam, danh sách dự án có thể ghi mốc của hôm qua là mốc kế tiếp.
  file: `apps/api/src/du-an/du-an.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): phần design-gate của san-thiet-ke.mjs chưa bao giờ được chứng minh là bắt được lỗi, và chính design-gate tự khai không đo được tệp .tsx**
  Người dùng thấy gì: Bước quét tự động giao diện có thể báo xanh dù thực ra nó không kiểm được các tệp giao diện, nên một số lỗi giao diện có thể lọt qua mà không ai biết.
  file: `_acceptance/du-an-gantt/rang/san-thiet-ke.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): «phiên thành viên khác không thấy Đóng dự án» được đo bằng cờ quyen.dong gõ tay**
  Người dùng thấy gì: Chưa có kiểm tra nào xác nhận máy chủ báo đúng rằng người không phải chủ dự án thì không thấy nút «Đóng dự án»; nếu sai, nút có thể hiện cho người không có quyền (lệnh đóng thật vẫn bị từ chối).
  file: `apps/app/test/du-an.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): «chín loại vết dự án đọc được» chỉ đưa fixture gõ tay qua parseVetDuAn, bên ghi không có kiểu**
  Người dùng thấy gì: Chưa có kiểm tra nào xác nhận lịch sử dự án đã ghi thật vẫn đọc lại được; nếu hình dạng ghi và đọc lệch nhau, lịch sử dự án có thể không hiển thị đúng.
  file: `packages/db/test/du-an-vet.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «Giao việc không điền sẵn P» khi dự án đóng không có đối chứng dương rằng dự án mở thì có điền sẵn**
  Người dùng thấy gì: Chưa chắc tính năng tự điền tên dự án khi giao việc từ trang dự án đang mở có hoạt động, vì kiểm tra hiện chỉ xác nhận nó không điền ở dự án đã đóng.
  file: `apps/app/test/du-an.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): lời ghim 'dg san:' của đột biến (n) luôn có trong mọi lượt chạy san-thiet-ke**
  Người dùng thấy gì: Phép thử cố ý làm hỏng giao diện để xem bộ quét có bắt được hay không đang được tính là bắt được vì bất cứ lỗi nào, chứ không phải đúng lỗi màu thô; nên độ tin cậy của bộ quét bị thổi phồng.
  file: `_acceptance/du-an-gantt/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
