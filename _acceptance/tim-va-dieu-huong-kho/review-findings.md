# Review findings: tim-va-dieu-huong-kho (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Changing PageShell header from grid to flex breaks the agent detail screen, which still places items with grid classes**
  Người dùng thấy gì: Trên điện thoại, ở màn chi tiết của một agent, cụm nút và giờ chạy kế tiếp nhảy lên nằm giữa tiêu đề và phần mô tả thay vì nằm dưới mô tả như trước. Màn vẫn dùng được nhưng bố cục lệch so với cũ.
  file: `apps/app/components/page-shell.tsx`
  severity: medium
  Đề xuất: new-contract

- **demChoDuyetTheoNguoi now runs one COUNT per workspace member (N+1)**
  Người dùng thấy gì: Bản nhắc buổi sáng chạy chậm dần khi số người trong công ty tăng, vì mỗi người tốn một lượt đếm riêng. Với quy mô hiện tại chưa thấy được, kết quả đếm vẫn đúng.
  file: `packages/db/src/tai-lieu-quyen.ts`
  severity: low
  Đề xuất: known-limits

- **PageShell header moved from grid to flex, which breaks the grid-based layout in team-agent-detail**
  Người dùng thấy gì: Cùng lỗi bố cục với màn chi tiết agent: trên điện thoại, cụm nút chen lên giữa tiêu đề và mô tả, có thể nằm cùng dòng với tiêu đề ngắn. Chỉ ảnh hưởng cách sắp xếp, không mất chức năng.
  file: `apps/app/components/agent-builder/team-agent-detail.tsx`
  severity: medium
  Đề xuất: new-contract

- **E8u/E3u/E4u paths are missing page-shell.tsx and rang/khung.mjs, which the new measurement depends on**
  Người dùng thấy gì: Người dùng không thấy gì khác. Nếu sau này ai đó đổi khung đầu trang, các phép đo đã ký có thể vẫn báo xanh mà không được đo lại, nên có thể lọt một lỗi bố cục.
  file: `_acceptance/tim-va-dieu-huong-kho/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion with no positive control): the 390 check in step 4 of man-tim passes silently when the button is missing at 390**
  Người dùng thấy gì: Nếu trên điện thoại nút chèn liên kết biến mất, phép đo vẫn báo đạt và ảnh cũ có thể được đưa cho người duyệt xem. Người dùng thật chỉ bị ảnh hưởng nếu nút đó thực sự mất.
  file: `_acceptance/tim-va-dieu-huong-kho/rang/man-tim.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to sweep a CLASS but covers only point cases): the regex TU_SUY_QUAN_TRI misses the Prisma-where form of the owner rule, which is still in quyen.ts**
  Người dùng thấy gì: Luật ai được duyệt bản nào vẫn còn một bản sao ở phía máy chủ mà bài kiểm không bắt được. Nếu hai bản sao lệch nhau sau này, số bản chờ duyệt hiển thị có thể khác số trong bản nhắc buổi sáng.
  file: `apps/api/test/tai-lieu-nhac-bang-tab.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to match the side under test): the 'original version' of PageShell was hand-edited to copy the new header classes**
  Người dùng thấy gì: Bài kiểm hiện không còn phát hiện được nếu ai đó lỡ đổi bố cục đầu trang chung. Người dùng chỉ thấy hậu quả khi có thay đổi sau này làm lệch đầu trang mà không ai để ý.
  file: `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt`
  severity: low
  Đề xuất: known-limits

- **Raw SQL rows are cast, not parsed at the boundary (`$queryRaw<HangTim[]>` + `h.loai as LoaiTrang`) (r1)**
  Người dùng thấy gì: Kết quả tìm hiện vẫn đúng. Nếu sau này dữ liệu có dòng sai dạng, người dùng sẽ thấy lỗi chung chung thay vì một thông báo chỉ rõ chỗ hỏng.
  file: `apps/api/src/tai-lieu/tai-lieu-tim.service.ts`
  severity: low
  Đề xuất: known-limits

- **Magic factor `* 3` inline in a contract, even though TAI_LIEU_API already names it (HE_SO_NFD) (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là nếu sau này đổi giới hạn độ dài câu tìm thì phải nhớ sửa thêm một chỗ.
  file: `apps/api/src/tai-lieu/tai-lieu.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **Page-link picker in the editor shows a failed search as 'no page matches' (r1)**
  Người dùng thấy gì: Khi tìm trang để chèn liên kết mà hệ thống gặp lỗi, hộp vẫn báo «không có trang nào khớp», nên người viết tưởng trang không tồn tại và có thể gõ chữ thường thay vì liên kết.
  file: `packages/ui/src/components/trinh-soan-lien-ket-trang.tsx`
  severity: medium
  Đề xuất: new-contract

- **QuickSwitcher hides a CRM search error as 'Nothing matches' (r1)**
  Người dùng thấy gì: Nếu việc tìm công ty, người hay thoả thuận bị lỗi, hộp tìm nhanh có thể báo «không có gì khớp» hoặc lặng lẽ ẩn các nhóm đó, người dùng không biết là do lỗi.
  file: `apps/app/components/crm/quick-switcher.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped for the reader): E4/E4b/E4u never measure the /<ws>/ prefix of the inserted link (r1)**
  Người dùng thấy gì: Phép kiểm chưa chứng minh được liên kết chèn vào có đúng đường dẫn theo không gian làm việc; nếu sau này ai đó làm mất phần đó thì phép kiểm vẫn báo xanh.
  file: `packages/ui/test/trinh-soan-lien-ket.dom.tsx`
  severity: high
  Đề xuất: new-contract

- **Shape 2: expected dates and fake clock in E8 are computed with dauNgayVN, the same function the service uses (r1)**
  Người dùng thấy gì: Phép kiểm chưa bắt được lỗi múi giờ trong việc xác định trang quá hạn xác minh, nên một trang có thể bị tính quá hạn sớm hay muộn một ngày mà không ai phát hiện.
  file: `apps/api/test/tai-lieu-suc-khoe.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims to cover a class but checks too few points): the 'every row of the five lists has page name and page owner' test has no gay rows (r1)**
  Người dùng thấy gì: Danh sách liên kết gãy ở tab Sức khoẻ chưa được kiểm là có đủ tên trang và tên chủ trang, nên nếu thiếu thì chưa ai biết.
  file: `apps/api/test/tai-lieu-suc-khoe.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 2: the E9 morning-reminder fixture writes CU/TRA_LAI straight into the column the reader counts (r1)**
  Người dùng thấy gì: Phép kiểm nhắc sáng dựng dữ liệu mẫu bằng cách ghi thẳng, nên chưa chắc phản ánh đúng trạng thái sinh ra khi người dùng thật duyệt hay trả lại bản.
  file: `apps/agent/test/tai-lieu-nhac.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Shape 3: the E2 cell 'Trang nhap S1 appears only in choDuyet' checks presence, not the 'only there' relation, for the four viewers (r1)**
  Người dùng thấy gì: Phép kiểm chưa chứng minh tên trang chưa từng duyệt không lọt vào các danh sách khác của Sức khoẻ với người tạo, chủ trang, owner và admin.
  file: `apps/api/test/tai-lieu-tim-khong-ro.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5: E9 promises 'no table changes' but compares only one table (r1)**
  Người dùng thấy gì: Phép kiểm chưa xác nhận hết mọi nơi lưu rằng câu trả lời «xong» trên Zalo không làm thay đổi gì.
  file: `apps/agent/test/tai-lieu-nhac.spec.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 4/7 lỗi rơi vào file không bộ đo nào phủ (apps/app/components/page-shell.tsx, apps/app/components/agent-builder/team-agent-detail.tsx, _acceptance/tim-va-dieu-huong-kho/evals.yaml, apps/app/test/fixtures/page-shell-truoc-width.tsx.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
