# Review findings: khung-ban-ghi-kara (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **undoFactDecision writes back a previous value supplied by the client instead of one the server recorded**
  Người dùng thấy gì: Nếu hai người cùng mở một liên hệ, người kia vừa sửa chức danh, rồi bạn nhận đề xuất của Kara và bấm Hoàn tác, chức danh người kia vừa sửa sẽ bị đè bằng giá trị cũ trên màn của bạn. Hệ thống vẫn báo hoàn tác thành công.
  file: `apps/api/src/contacts/contacts.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Undo input schema is looser than contactUpdateInput: an empty first name gets through and blanks are not normalised**
  Người dùng thấy gì: Ai gọi thẳng vào hệ thống (không qua màn hình) có thể hoàn tác một lần nhận tên và để liên hệ có tên trống, hoặc để chức danh là chuỗi rỗng thay vì không có. Người dùng thao tác trên màn không gặp ca này.
  file: `apps/api/src/contacts/contacts.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **The list of fact fields and their columns now lives in three places**
  Người dùng thấy gì: Danh sách các trường mà Kara được đề xuất đang chép ở ba chỗ. Nếu sau này thêm một trường mới cho Kara, nút Hoàn tác của trường đó có thể xoá trắng giá trị cũ thay vì khôi phục.
  file: `apps/app/lib/contact-facts.ts`
  severity: low
  Đề xuất: wont-fix

- **Record sheet load errors all show as a connection problem, and the real error is thrown away**
  Người dùng thấy gì: Khi mở một liên hệ đã bị xoá hoặc không có quyền xem, màn chỉ nói kiểm tra kết nối và Thử lại mãi không được. Người dùng không biết bản ghi đã mất hay họ không có quyền.
  file: `apps/app/components/crm/record-sheet/record-parts.tsx`
  severity: medium
  Đề xuất: new-contract

- **Kara steps hide tool results that did not store or write (written/stored === false shows as done)**
  Người dùng thấy gì: Khi Kara tìm được thông tin nhưng hệ thống từ chối lưu, bước đó vẫn hiện dấu xong như khi đã lưu. Người dùng tưởng thông tin đã vào hồ sơ trong khi chưa có gì được ghi.
  file: `apps/app/components/crm/agent-panel.tsx`
  severity: medium
  Đề xuất: new-contract

- **Undo's previous value is read when decideFact succeeds, not when the button is clicked**
  Người dùng thấy gì: Trong lúc Kara đang làm giàu hồ sơ và màn tự làm mới, bấm Thay rồi Hoàn tác có thể báo thành công nhưng trường vẫn giữ giá trị mới, và giá trị cũ mất.
  file: `apps/app/components/crm/facts.tsx`
  severity: low
  Đề xuất: known-limits

- **undoFactDecision always returns 409 after accepting a fact whose field has no column**
  Người dùng thấy gì: Với các thông tin không có ô riêng trong hồ sơ như nơi làm việc hay địa điểm, hoàn tác luôn bị từ chối dù chẳng có gì đổi. Màn hiện nay không cho hoàn tác các trường này nên người dùng chưa gặp.
  file: `apps/api/src/contacts/contacts.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc) + 5 (ma trận thiếu ô): `truoc` của Hoàn tác không đi qua hàm sinh ra nó**
  Người dùng thấy gì: Kiểm thử hiện chưa chứng minh được Hoàn tác trả lại đúng giá trị cũ, kể cả khi hoàn tác tên. Nếu có người vô tình sửa sai chỗ đó, kiểm thử vẫn báo xanh.
  file: `apps/app/test/kara-ban-ghi-de-xuat.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): kiểm gợi ý company/deal không chứa "người này" không bao giờ đỏ**
  Người dùng thấy gì: Phép kiểm xem gợi ý của công ty và thoả thuận có chép nhầm câu của liên hệ hay không không bao giờ đỏ. Nếu ai chép nhầm, kiểm thử không bắt được.
  file: `apps/app/test/agent-session.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E9 hứa cột = fact.value sau khi nhận, test chỉ kiểm cột khác giá trị cũ**
  Người dùng thấy gì: Kiểm thử chỉ xác nhận trường đã đổi sau khi nhận, chưa xác nhận trường mang đúng giá trị Kara đề xuất. Nếu hệ thống ghi nhầm giá trị, kiểm thử vẫn xanh.
  file: `apps/api/test/hoan-tac-thong-tin.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «Bỏ qua là nút chữ» vẫn qua khi không có nút Bỏ qua**
  Người dùng thấy gì: Một phép kiểm về kiểu nút Bỏ qua sẽ vẫn xanh nếu nút này biến mất. Các bài kiểm khác đã bấm nút này nên nguy cơ rất thấp.
  file: `apps/app/test/kara-ban-ghi-de-xuat.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): grep mã nguồn tìm tên khoá `t.tab.batDauMoi`**
  Người dùng thấy gì: Một phép kiểm về nút Bắt đầu cuộc mới chỉ soi chữ trong mã, không soi màn. Hành vi thật đã được kiểm ở bài khác nên không có hậu quả cho người dùng.
  file: `apps/app/test/agent-session.spec.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/12 lỗi rơi vào file không bộ đo nào phủ (apps/app/test/agent-session.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
