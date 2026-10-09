# Review findings: vong-doi-mot-cach-cat (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **baoHoanTacLoat hides real Undo failures behind a green success toast**
  Người dùng thấy gì: Sau khi Hoàn tác lưu trữ hàng loạt, nếu một vài bản không khôi phục được (ví dụ đã bị người khác xoá vĩnh viễn), bạn vẫn chỉ thấy thông báo xanh «Đã khôi phục …» và có thể tưởng tất cả đã về lại danh sách. Số bản báo là đã khôi phục cũng có thể nhiều hơn số bản thật sự đã được lưu trữ.
  file: `apps/app/components/crm/bulk-actions.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bulk Undo un-archives records that were archived before this action**
  Người dùng thấy gì: Nếu danh sách của bạn đã cũ và một bản ghi vừa được người khác lưu trữ, khi bạn lưu trữ hàng loạt rồi bấm Hoàn tác thì bản đó cũng bị khôi phục theo, dù bạn không hề lưu trữ nó.
  file: `apps/app/app/(app)/[slug]/contacts/contacts-bulk-actions.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture shaped to fit the reader): in vdc-hoan-tac-loat «mot-phan», bulkArchive is mocked as failed:1 with message:null, which the real server cannot return**
  Người dùng thấy gì: Khi lưu trữ hàng loạt mà có bản bị bỏ qua, thông báo có thể kèm một dòng tiếng Anh thô của máy chủ, và bài kiểm tự động hiện chưa phản ánh đúng trường hợp này nên không bắt được.
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): the archived-deal check in E12 step 1 reads updatedAt once, about 600 ms after the last Enter, while its own positive control allows a write up to 6 s**
  Người dùng thấy gì: Phép kiểm máy chỉ chờ chưa đến một giây rồi kết luận thoả thuận đã lưu trữ không bị sửa, nên một lần sửa lọt vào nhưng lưu chậm hơn có thể không bị phát hiện.
  file: `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): the new «not on Kanban before the click» check in E12 step 2 has no positive control showing the board renders deal names**
  Người dùng thấy gì: Phép kiểm tự động có thể báo đạt dù bảng Kanban chưa tải xong, nên chưa chứng minh chắc rằng thoả thuận đã lưu trữ thật sự bị ẩn khỏi Kanban.
  file: `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

- **KhoaLuuTru disables the retry and record-opening buttons in an archived record's detail tab (r2)**
  Người dùng thấy gì: Khi mở một bản ghi đã lưu trữ, nút «Thử lại» (khi một vùng tải lỗi) và các nút mở sang thoả thuận hay kế hoạch liên quan đều bị tắt, nên người dùng không thử tải lại hay đi sang bản ghi liên quan được cho tới khi khôi phục bản ghi.
  file: `apps/app/components/crm/record-sheet/record-actions.tsx`
  severity: low
  Đề xuất: known-limits

- **The archived-record banner (DaiLuuTru) and read-only lock (KhoaLuuTru) are built inside apps/app instead of packages/ui (r1)**
  Người dùng thấy gì: Người dùng vẫn thấy dải báo «Đã lưu trữ» và nút Khôi phục đúng như hứa. Nhưng loại bản ghi tiếp theo cần dải báo này sẽ phải chép lại hoặc chui vào thư mục của CRM, nên giao diện dễ lệch nhau theo thời gian.
  file: `apps/app/components/crm/record-sheet/record-actions.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 (assert có-mặt thay cho quan hệ): vdc-kanban ghi «cùng vị trí» ở dạng bảng nhưng chỉ kiểm nút có mặt (r2)**
  Người dùng thấy gì: Nút «Đã lưu trữ» có mặt ở cả dạng bảng và Kanban, nhưng chưa có phép kiểm nào bảo đảm nó nằm cùng chỗ ở hai dạng, nên sau này nút có thể lệch vị trí mà không ai hay.
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
