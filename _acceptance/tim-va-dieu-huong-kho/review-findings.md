# Review findings: tim-va-dieu-huong-kho (round 1)

## Trong hợp đồng

- **demChoDuyetTheoNguoi works out the approver rule a second time instead of using dieuKienDuyetDuoc**
  AC: AC-9
  file: `packages/db/src/tai-lieu-quyen.ts:44`
  severity: medium
  source: conventions
  detail: docs/api.md (mục «Kho tài liệu: tìm, nhắc tới, sức khoẻ») nói luật «ai được duyệt» chỉ định nghĩa một lần, ở các hàm dựng điều kiện của module này, và không nơi nào suy lại. demChoDuyet đúng như vậy: ghép dieuKienDuyetDuoc. demChoDuyetTheoNguoi, dùng cho nhắc sáng và thẻ Tổng quan, thì không. Nó gom mọi bản CHO_DUYET theo trangId, tự ánh xạ từng trang sang chuTrangId, và trả `tong` cho quản trị qua laQuanTriTaiLieu. Đó là lặp cả hai vế của dieuKienDuyetDuoc: kiểm quản trị và điều kiện `trang.chuTrangId = id`. Nếu luật duyệt đổi (ví dụ cho trưởng đơn vị duyệt), dieuKienDuyetDuoc đổi và huy hiệu tab (demChoDuyet) theo, còn số của nhắc sáng và Tổng quan thì không, đúng kiểu lệch huy hiệu/nhắc mà tài liệu cảnh báo. Ở API còn bản thứ ba: laQuanTri/duyetDuoc trong apps/api/src/tai-lieu/quyen.ts kiểm quản trị bằng isWorkspaceAdmin của @crm/auth, trong khi module db dùng danh sách VAI_QUAN_TRI_TAI_LIEU riêng, nên một mô hình phân quyền có hai định nghĩa «admin».
  rationale: AC-9 đòi số N của nhắc sáng bằng số trên tab «Chờ duyệt» tính bằng cùng một hàm, và Notes nói rõ luật duyệt gom về một hàm; finding chỉ ra nhắc sáng dùng hàm khác với tab.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Raw SQL rows are cast, not parsed at the boundary (`$queryRaw<HangTim[]>` + `h.loai as LoaiTrang`)**
  Người dùng thấy gì: Kết quả tìm hiện vẫn đúng. Nếu sau này dữ liệu có dòng sai dạng, người dùng sẽ thấy lỗi chung chung thay vì một thông báo chỉ rõ chỗ hỏng.
  file: `apps/api/src/tai-lieu/tai-lieu-tim.service.ts`
  severity: low
  Đề xuất: known-limits

- **Magic factor `* 3` inline in a contract, even though TAI_LIEU_API already names it (HE_SO_NFD)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là nếu sau này đổi giới hạn độ dài câu tìm thì phải nhớ sửa thêm một chỗ.
  file: `apps/api/src/tai-lieu/tai-lieu.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **Page-link picker in the editor shows a failed search as 'no page matches'**
  Người dùng thấy gì: Khi tìm trang để chèn liên kết mà hệ thống gặp lỗi, hộp vẫn báo «không có trang nào khớp», nên người viết tưởng trang không tồn tại và có thể gõ chữ thường thay vì liên kết.
  file: `packages/ui/src/components/trinh-soan-lien-ket-trang.tsx`
  severity: medium
  Đề xuất: new-contract

- **QuickSwitcher hides a CRM search error as 'Nothing matches'**
  Người dùng thấy gì: Nếu việc tìm công ty, người hay thoả thuận bị lỗi, hộp tìm nhanh có thể báo «không có gì khớp» hoặc lặng lẽ ẩn các nhóm đó, người dùng không biết là do lỗi.
  file: `apps/app/components/crm/quick-switcher.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): E4/E4b/E4u never measure the /<ws>/ prefix of the inserted link**
  Người dùng thấy gì: Phép kiểm chưa chứng minh được liên kết chèn vào có đúng đường dẫn theo không gian làm việc; nếu sau này ai đó làm mất phần đó thì phép kiểm vẫn báo xanh.
  file: `packages/ui/test/trinh-soan-lien-ket.dom.tsx`
  severity: high
  Đề xuất: new-contract

- **Shape 4 (negative-only assertion) + Shape 2 (hand-written positive control): nhac-bang-tab only checks that three names are absent from quyen.ts, while quyen.ts still defines the approval rule locally**
  Người dùng thấy gì: Phép kiểm việc dùng chung luật duyệt còn lỏng: luật «ai được duyệt» vẫn còn một bản riêng ở nút duyệt, sau này đổi luật có thể làm nút duyệt và số đếm lệch nhau mà không ai báo.
  file: `apps/api/test/tai-lieu-nhac-bang-tab.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Shape 2: expected dates and fake clock in E8 are computed with dauNgayVN, the same function the service uses**
  Người dùng thấy gì: Phép kiểm chưa bắt được lỗi múi giờ trong việc xác định trang quá hạn xác minh, nên một trang có thể bị tính quá hạn sớm hay muộn một ngày mà không ai phát hiện.
  file: `apps/api/test/tai-lieu-suc-khoe.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to cover a class but checks too few points): the 'every row of the five lists has page name and page owner' test has no gay rows**
  Người dùng thấy gì: Danh sách liên kết gãy ở tab Sức khoẻ chưa được kiểm là có đủ tên trang và tên chủ trang, nên nếu thiếu thì chưa ai biết.
  file: `apps/api/test/tai-lieu-suc-khoe.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2: the E9 morning-reminder fixture writes CU/TRA_LAI straight into the column the reader counts**
  Người dùng thấy gì: Phép kiểm nhắc sáng dựng dữ liệu mẫu bằng cách ghi thẳng, nên chưa chắc phản ánh đúng trạng thái sinh ra khi người dùng thật duyệt hay trả lại bản.
  file: `apps/agent/test/tai-lieu-nhac.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Shape 3: the E2 cell 'Trang nhap S1 appears only in choDuyet' checks presence, not the 'only there' relation, for the four viewers**
  Người dùng thấy gì: Phép kiểm chưa chứng minh tên trang chưa từng duyệt không lọt vào các danh sách khác của Sức khoẻ với người tạo, chủ trang, owner và admin.
  file: `apps/api/test/tai-lieu-tim-khong-ro.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5: E9 promises 'no table changes' but compares only one table**
  Người dùng thấy gì: Phép kiểm chưa xác nhận hết mọi nơi lưu rằng câu trả lời «xong» trên Zalo không làm thay đổi gì.
  file: `apps/agent/test/tai-lieu-nhac.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
