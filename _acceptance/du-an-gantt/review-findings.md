# Review findings: du-an-gantt (round 3)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ghiVetDuAn nhận loai: string, truoc/sau: unknown rồi ép sang InputJsonValue, bỏ qua schema VetDuAn đã có**
  Người dùng thấy gì: Không ảnh hưởng gì người dùng hiện nay. Về sau, nếu có người code sai tên loại vết thì lịch sử dự án có thể ghi một dòng sai hình và chỉ vỡ khi có người mở lại lịch sử.
  file: `packages/db/src/viec-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **Xoá dự án không ghi vết nào, trái luật «Xoá … ghi vết» của docs/vong-doi.md**
  Người dùng thấy gì: Khi một dự án trống bị xoá hoặc một ngày lễ bị xoá, hệ thống không lưu lại ai xoá và xoá lúc nào, nên sau này không tra lại được.
  file: `packages/db/src/du-an-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **datNgayNghiTuan nhận mảng rỗng, mà mảng rỗng lại được đọc thành mặc định Thứ Bảy, Chủ nhật: lưu xong thì giá trị bật ngược lại**
  Người dùng thấy gì: Quản trị tắt hết ngày nghỉ trong tuần, thấy báo đã lưu, nhưng vài giây sau Thứ Bảy và Chủ nhật tự bật lại. Công ty làm cả bảy ngày không đặt được lịch của mình.
  file: `apps/api/src/lich-lam-viec/lich-lam-viec.contracts.ts`
  severity: medium
  Đề xuất: new-contract

- **Hộp «Thêm ngày lễ» ở Cài đặt để nút gửi bấm được khi form chưa hợp lệ**
  Người dùng thấy gì: Ở hộp thêm ngày lễ, nút Thêm vẫn bấm được khi chưa chọn ngày hay chưa gõ tên, rồi mới hiện lỗi. Hơi vướng nhưng không làm mất dữ liệu.
  file: `apps/app/app/(app)/[slug]/settings/lich-lam-viec/lich-lam-viec.tsx`
  severity: medium
  Đề xuất: known-limits

- **Phạm vi một dự án: duAn.get lỗi mà không phải 404 thì hiện khung xương mãi, không có VungTaiLoi**
  Người dùng thấy gì: Nếu việc tải thông tin một dự án hỏng vì lỗi máy chủ hay mạng, dải đầu trang dự án cứ hiện khung chờ mãi, không báo lỗi, không có nút thử lại, và các nút đóng, sửa, xoá dự án không xuất hiện.
  file: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`
  severity: medium
  Đề xuất: known-limits

- **duAn.list/get tính «hôm nay» theo UTC thay cho ngày lịch Việt Nam; get tải mọi dự án rồi lọc bằng JS**
  Người dùng thấy gì: Từ nửa đêm đến 7 giờ sáng giờ Việt Nam, mốc kế của dự án có thể vẫn là mốc của hôm qua. Mở một dự án cũng chậm hơn cần thiết khi có nhiều dự án.
  file: `apps/api/src/du-an/du-an.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hằng một ngày tính bằng mili giây viết lại thêm hai lần, và hàm cộng ngày, ngày rút gọn, múi giờ Việt Nam bị chép lại**
  Người dùng thấy gì: Người dùng không thấy gì. Chỉ là mã có vài chỗ chép lặp, sau này đổi quy tắc ngày dễ sửa sót một chỗ.
  file: `packages/ui/src/components/gantt-du-an.tsx`
  severity: low
  Đề xuất: wont-fix

- **Dự án đủ 300 việc thì không thêm, sửa, xoá được mốc và phụ thuộc nữa**
  Người dùng thấy gì: Khi một dự án đã có đủ 300 việc, người dùng không thêm, sửa hay xoá được mốc, không gỡ được phụ thuộc, và còn thấy câu báo lỗi sai là dự án chứa tối đa 300 việc.
  file: `packages/db/src/viec-ghi.ts`
  severity: high
  Đề xuất: new-contract

- **Bỏ chọn hết ngày nghỉ trong tuần thì lặng lẽ thành Thứ Bảy và Chủ Nhật**
  Người dùng thấy gì: Quản trị bỏ chọn hết ngày nghỉ, thấy báo đã lưu, nhưng lịch vẫn nghỉ Thứ Bảy và Chủ nhật. Sơ đồ Gantt và việc tự dời vẫn bỏ qua hai ngày đó mà không có lời báo nào.
  file: `packages/db/src/du-an.ts`
  severity: medium
  Đề xuất: new-contract

- **duAn.get lỗi khác NOT_FOUND thì dải dự án hiện khung xương mãi**
  Người dùng thấy gì: Khi tải thông tin dự án gặp lỗi máy chủ hay mất mạng, dải đầu trang dự án hiện khung chờ mãi, không có nút thử lại, và các nút thao tác dự án biến mất.
  file: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`
  severity: low
  Đề xuất: known-limits

- **Lỗi khi bấm Hoàn tác ở Lịch làm việc bị nuốt im**
  Người dùng thấy gì: Nếu bấm Hoàn tác mà bị lỗi (ví dụ người khác vừa thêm lại ngày lễ đó, hay mất quyền), người dùng không thấy báo gì và tưởng đã hoàn tác xong.
  file: `apps/app/app/(app)/[slug]/settings/lich-lam-viec/lich-lam-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 4 (assertion am-tinh-mot-minh, khong doi chung duong): phep thu hoan tac ngay nghi tuan khong phan biet duoc 'da ghi roi hoan tac' voi 'chua bao gio ghi'**
  Người dùng thấy gì: Không ảnh hưởng người dùng trực tiếp. Phép thử cho việc đặt rồi hoàn tác ngày nghỉ tuần có thể vẫn xanh dù tính năng ghi hỏng, nên một lỗi về sau có thể lọt qua mà không ai biết.
  file: `apps/api/test/lich-lam-viec.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 4 (assertion am-tinh-mot-minh): 'khong con muc du an rieng' so voi mot khoa khong ton tai va trai nep dat ten cua tep**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện nay. Nếu sau này ai đó thêm lại mục Dự án riêng ở thanh trái theo cách khác, phép thử này sẽ không bắt được.
  file: `apps/app/test/du-an.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 2 (fixture viet tay dung khuon ben doc, khong round-trip): dg-vet doc vet du an va vet viec moi tu fixture go tay**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện nay. Nếu phần ghi lịch sử dự án lệch khuôn so với phần đọc, phép thử vẫn xanh và lỗi chỉ lộ khi người dùng mở lịch sử.
  file: `packages/db/test/du-an-vet.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 2 (fixture viet tay khong the ton tai): doi chung duong cua 'co lich su thi khong Xoa' dung trang thai may chu khong bao gio tra**
  Người dùng thấy gì: Không ảnh hưởng người dùng hiện nay. Phép thử kiểm việc dự án đã có lịch sử thì không có nút Xoá dùng dữ liệu giả không bao giờ xảy ra, nên chưa chứng minh chắc chắn được điều đó.
  file: `apps/app/test/du-an.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
