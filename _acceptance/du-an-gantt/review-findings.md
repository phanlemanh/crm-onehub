# Review findings: du-an-gantt (vòng 1)

## Trong hợp đồng

- **Hình dạng 2 + 4: «có lịch sử thì không có Xoá» chỉ đo một fixture viết tay đã đặt sẵn quyen.xoa=false, không ca nào thấy Xoá hiện ra**
  AC: AC-11
  file: apps/app/test/du-an.dom.tsx:660
  severity: high
  source: measurement
  detail: Ở dòng 661-670, mock duAn.get/duAn.list được đưa vào dự án viết tay `duAn({coLichSu: true, quyen: {dong: true, xoa: false}})`, rồi chỉ kiểm `if (mucMenu().includes(D.dai.xoa)) throw 'dg: xoa hien sai'`. dai-du-an.tsx:154 chỉ đọc `duAn.quyen.xoa`, và quan hệ «có lịch sử thì không xoá» được tính ở máy chủ (du-an.service.ts:127 `xoa: duocDong && !coLichSu`). Vậy chính fixture tự đặt kết quả, chưa bao giờ rút từ đầu ra thật của service. Hiện không spec API nào kiểm quyen.xoa hay coLichSu của duAn.list/get (grep apps/api/test không có). Assert lại thuần âm tính: cả file không ca nào có quyen.xoa=true để thấy mục «Xoá» hiện ra. Nếu bỏ hẳn mục Xoá khỏi menu, hoặc service trả xoa=true cho dự án đã có lịch sử, E11b vẫn xanh.
  lý do vào hợp đồng: AC-11 đòi nút Xoá không có trên menu dự án đã có lịch sử; phép đo chỉ đọc fixture tự đặt nên không chứng minh được vế này.

- **Hình dạng 4: «ô soạn không cho chọn P đã đóng» đúng sẵn nhờ mock, và không có đối chứng dương nào cho thấy danh sách chọn đã hiện**
  AC: AC-11
  file: apps/app/test/du-an.dom.tsx:647
  severity: medium
  source: measurement
  detail: Trong moDuAn với p.dong=true, mock duAn.list({trangThai:'mo'}) trả `[P2]` (dòng 556). o-soan-viec.tsx:46 lại lấy danh sách chọn từ chính duAn.list({trangThai:'mo'}), nên P1 không bao giờ có trong option, logic phía khách làm gì cũng vậy. Dòng 652-657 chỉ kiểm `chon.some(x => x.includes(P1.ten))` là sai. Test không kiểm `chon` có P2 hay có phần tử nào: combobox không mở được thì chon=[] và test vẫn qua. Dòng 648 `chuCua(oDuAn).includes(P1.ten)` cũng là assert âm tính đứng một mình. Kết quả là phần 'dg: trang dong sai giao viec/o soan' của E11b không phân biệt được màn đúng với màn hỏng.
  lý do vào hợp đồng: AC-11 đòi dự án đã đóng rời danh sách dự án đang mở và không còn đường thêm việc; phép đo xanh sẵn nhờ mock nên không chứng minh vế này.

- **Hình dạng 4: kiểm «không kéo lùi» ở dg-tu-doi không xác nhận lệnh doiLich đã chạy được**
  AC: AC-7
  file: apps/api/test/du-an-lich.spec.ts:794
  severity: medium
  source: measurement
  detail: Dòng 794-800 gọi `viec.doiLich` để đưa hạn A về 2026-10-20 nhưng bỏ qua kết quả: không kiểm status 200, cũng không đọc lại hạn A. Dòng 801-808 chỉ kiểm B, C vẫn giữ ngày cũ. Nếu lệnh bị từ chối hay lỗi (ví dụ một luật mới chặn rút hạn), B và C đương nhiên đứng yên và assert 'dg: keo lui that' vẫn xanh. Đây là assert âm tính không có đối chứng dương rằng thao tác kích hoạt đã thật sự xảy ra.
  lý do vào hợp đồng: AC-7 đòi kéo hạn A sớm lên thì không việc sau nào lùi; phép đo không xác nhận lệnh kéo sớm đã chạy thành công.

- **Hình dạng 4: «hai lần doiLich cùng lúc» không kiểm lần nào ghi thành công, nên phần ràng buộc cuối đúng sẵn**
  AC: AC-7
  file: apps/api/test/du-an-lich.spec.ts:810
  severity: medium
  source: measurement
  detail: doLan (dòng 810-825) chỉ trả thời gian chạy, kết quả `goi(...)` bị bỏ. Promise.all ở dòng 826-829 chỉ kiểm thời gian ≤ 5 giây. Dòng 841-848 chỉ kiểm không cặp phụ thuộc nào vỡ trong trạng thái cuối. Nếu cả hai lần đều trả lỗi nhanh (deadlock, serialization, 500), không gì được ghi, trạng thái trước đó vốn đã hợp lệ, và 'dg: hai lan doi vo rang buoc' vẫn không ném. Thiếu đối chứng dương rằng ít nhất một lần doiLich đã ghi, ví dụ status 200 hay hạn A, B đọc lại đúng giá trị mới.
  lý do vào hợp đồng: AC-7 có vế hai người cùng đổi hạn thì kết quả cuối vẫn đúng ràng buộc; phép đo không xác nhận có lần ghi nào thành công.

- **Hình dạng 4: «V3 ngoài dự án không có dòng phụ» xanh sẵn khi dòng/thẻ V3 không hiện**
  AC: AC-2
  file: apps/app/test/viec-bang.dom.tsx:591
  severity: low
  source: measurement
  detail: `if (cua("v3")?.querySelector("[data-dong-du-an]")) throw 'dg: dong du an thua'`. Test không kiểm `cua('v3')` có tồn tại. Nếu V3 không render (lọc sai, selector lệch), assert âm tính này vẫn qua ở cả kiểu Danh sách lẫn kiểu Bảng. Cần một đối chứng dương rằng dòng/thẻ V3 có mặt.
  lý do vào hợp đồng: AC-2 đòi việc không thuộc dự án không có dòng phụ «Dự án: P»; phép đo xanh sẵn khi dòng V3 không hiện.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Xoá dự án không để lại vết hay dòng log nào**
  Người dùng thấy gì: Khi xoá một dự án chưa có lịch sử, hệ thống không giữ lại dấu nào cho biết ai đã xoá và xoá lúc nào. Sau này nếu cần truy xét một dự án biến mất thì không có gì để tra.
  file: `packages/db/src/du-an-ghi.ts`
  severity: medium
  Đề xuất: new-contract

- **duAn.list tính «hôm nay» theo giờ UTC, không theo ngày lịch Việt Nam**
  Người dùng thấy gì: Từ 0 giờ tới 7 giờ sáng giờ Việt Nam, danh sách dự án có thể ghi «mốc kế» là một mốc của hôm qua đã qua rồi. Màn Gantt thì tính đúng, nên hai màn có thể hiện hai mốc khác nhau.
  file: `apps/api/src/du-an/du-an.service.ts`
  severity: medium
  Đề xuất: new-contract

- **duAn.get tải toàn bộ dự án hai lần rồi lọc trong bộ nhớ, kèm N+1 truy vấn coLichSuDuAn**
  Người dùng thấy gì: Mở một dự án phải tải lại toàn bộ dự án khác ở phía sau, nên khi số dự án và việc tăng nhiều thì trang dự án sẽ mở chậm dần.
  file: `apps/api/src/du-an/du-an.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Gantt của ReUI còn giữ góc bo viết cứng (rounded-[2px], rounded-[1px])**
  Người dùng thấy gì: Một vài góc bo nhỏ trên sơ đồ Gantt lệch nhẹ so với thang góc bo chung của ứng dụng. Người dùng gần như không nhận ra, chỉ khác về độ đồng nhất giao diện.
  file: `packages/ui/src/components/reui/gantt/gantt-view.tsx`
  severity: low
  Đề xuất: known-limits

- **gantt-cua-du-an.tsx tự viết lại homNayVN và múi giờ thay vì dùng @crm/validation/ngay-vn**
  Người dùng thấy gì: Múi giờ Việt Nam được khai ở thêm vài chỗ. Người dùng không thấy gì khác; chỉ khi sau này đổi múi giờ thì phải sửa nhiều nơi.
  file: `apps/app/components/du-an/gantt-cua-du-an.tsx`
  severity: low
  Đề xuất: wont-fix

- **Dự án đủ 300 việc thì khoá luôn mọi thao tác với mốc và phụ thuộc**
  Người dùng thấy gì: Khi một dự án đã có đủ 300 việc, người dùng không thêm, sửa hay xoá được mốc, cũng không đặt hay gỡ được việc phải chờ, và nhận thông báo sai là dự án chứa tối đa 300 việc. Muốn chỉnh lịch phải bỏ bớt việc ra khỏi dự án trước.
  file: `packages/db/src/viec-ghi.ts`
  severity: high
  Đề xuất: new-contract

- **Bỏ chọn hết ngày nghỉ trong tuần thì máy lặng lẽ quay về T7 và CN**
  Người dùng thấy gì: Nếu quản trị bỏ chọn hết mọi ngày nghỉ trong tuần, hệ thống vẫn báo đã lưu nhưng sau đó lại tự trả về nghỉ Thứ Bảy và Chủ nhật. Lịch của công ty không đúng ý quản trị mà không có thông báo lỗi nào.
  file: `packages/db/src/du-an.ts`
  severity: medium
  Đề xuất: new-contract

- **Tải dự án lỗi (không phải NOT_FOUND) thì đầu trang dự án hiện khung xương mãi**
  Người dùng thấy gì: Nếu việc tải thông tin dự án bị hỏng (mất mạng, lỗi máy chủ), phần đầu trang dự án cứ hiện khung chờ mãi, không có thông báo lỗi và không có nút thử lại. Người dùng tưởng trang vẫn đang tải.
  file: `apps/app/app/(app)/[slug]/viec/viec-cua-toi.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hoàn tác trên toast cài đặt lịch nuốt lỗi khi mutation thất bại**
  Người dùng thấy gì: Nếu bấm «Hoàn tác» trên lịch làm việc mà việc hoàn tác thất bại, người dùng không thấy báo lỗi và tưởng đã trả lại như cũ trong khi lịch vẫn giữ thay đổi mới.
  file: `apps/app/app/(app)/[slug]/settings/lich-lam-viec/lich-lam-viec.tsx`
  severity: low
  Đề xuất: known-limits

- **Gantt hiện nút «Đặt ngày» cho cả việc người xem không sửa được**
  Người dùng thấy gì: Người không có quyền sửa một việc vẫn thấy nút «Đặt ngày», bấm vào, chọn ngày rồi mới bị báo không đủ quyền. Dữ liệu không bị đổi, chỉ tốn thao tác vô ích.
  file: `packages/ui/src/components/gantt-du-an.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
