# Review findings: vong-doi-mot-cach-cat (round 2)

## Trong hợp đồng

- **Undo after a partial bulk archive always ends in a red error toast showing the raw server message**
  file: `apps/app/app/(app)/[slug]/companies/companies-bulk-actions.tsx:105`
  severity: medium
  AC: AC-1
  source: bugs
  detail: `onHoanTac: () => hoanTac.mutate({ ids: variables.ids })` sends back every id that was submitted, including the ones the server already rejected. The same code is in contacts-bulk-actions.tsx and deals-bulk-actions.tsx. On the server, `archive()` only fails on NotFound: it uses `updateMany`, then `findUniqueOrThrow`, then `translate`. That means `restore(id)`, which calls `db.company.update({ where: { id } })`, fails on that same id with NotFound. `runBulk` then returns `failed >= 1` with `message = "No company with id …"`. The undo's `onSuccess` passes that result to `reportBulk`, and because `failed > 0` it calls `toast.error(leftAlone(..., ' — No company with id …'))`. So in the partial case that AC-1 describes ("some records left alone, Undo still offered"), clicking Undo restores every archived record correctly but still shows a red toast. That toast includes the raw server message, which AC-2 forbids, instead of the expected «Đã khôi phục …». The API spec confirms the server result: in the second test, `bulkRestore([id, gia])` on the server does fail 1, but the test never checks its result. The DOM test vdc-hoan-tac-loat (case `mot-phan`) hides the problem by mocking `bulkRestore` to return `3/0`, a result the server cannot produce for an id that failed archive. AGENTS.md says a fixture must not describe data that cannot exist. Possible fixes: restore only ids that were actually archived (needs ids back from the API), or treat `failed` on the undo path as expected and report only `succeeded`.
  Lý do vào hợp đồng: AC-1 nêu đúng trường hợp lưu trữ một phần rồi bấm Hoàn tác phải báo «Đã khôi phục …»; finding cho thấy trường hợp đó ra toast đỏ kèm thông điệp thô (đụng cả AC-2).

- **Hình dạng 4 (âm-tính-một-mình): E12 bước 1 kiểm «updatedAt không đổi» sau khi chỉ bấm ô, và không có thoả thuận đang dùng làm đối chứng**
  file: `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs:235`
  severity: medium
  AC: AC-4
  source: measurement
  detail: Trong `kiemNgan` (dòng 162-236), mỗi ô tên và mô tả chỉ nhận một cú `t.mouse.click(r.x, r.y)`, không gõ, không blur, không Enter. Sau đó dòng 231-235 so `updatedAt` trong db với giá trị lúc gieo. Bấm thuần không ghi gì xuống db ngay cả khi ô sửa được, nên assert này luôn đạt và không đo được lời hứa «không gọi lệnh cập nhật». Kiểm «bấm không mở input/textarea/listbox» (dòng 225-228) cũng âm tính một mình: script không bấm cùng ô trên một thoả thuận đang dùng để thấy chỗ sửa có mở. Chiều đỏ duy nhất được ghim (`--chieu-do` -> «man: khong thay dai luu tru») chỉ chạm vào dải báo, không chạm vào hai assert này.
  Lý do vào hợp đồng: phép đo màn thật cho lời hứa «không mở chỗ sửa, không gọi cập nhật» của AC-4 chỉ bấm suông và không có đối chứng dương, nên không chứng minh được AC-4.

- **Hình dạng 3 (assert có-mặt thay cho quan hệ trước/sau): E12 bước 2 chỉ kiểm tên thoả thuận đã cất có mặt sau khi bấm, không kiểm nó vắng mặt trước khi bấm**
  file: `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs:278`
  severity: low
  AC: AC-5
  source: measurement
  detail: Lời hứa của AC-5/E12 là bấm «Đã lưu trữ» thì màn chuyển từ Kanban (không có bản đã cất) sang danh sách đã lưu trữ. Dòng 273-279 chỉ `choThay(document.body.innerText.includes(deal.name))` sau khi bấm, cộng thêm kiểm URL có archived=true. Script không đo tên đó vắng mặt trên Kanban trước khi bấm. Vì vậy một hồi quy làm Kanban hiện cả bản đã cất, hoặc làm nút chỉ đổi URL mà màn không đổi, vẫn qua được phần «bang hien thoa thuan da cat».
  Lý do vào hợp đồng: AC-5 hứa bấm nút thì màn chuyển từ Kanban sang danh sách đã lưu trữ; phép đo chỉ kiểm trạng thái sau nên chưa chứng minh được sự chuyển đó.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **KhoaLuuTru disables the retry and record-opening buttons in an archived record's detail tab**
  Người dùng thấy gì: Khi mở một bản ghi đã lưu trữ, nút «Thử lại» (khi một vùng tải lỗi) và các nút mở sang thoả thuận hay kế hoạch liên quan đều bị tắt, nên người dùng không thử tải lại hay đi sang bản ghi liên quan được cho tới khi khôi phục bản ghi.
  file: `apps/app/components/crm/record-sheet/record-actions.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (assert có-mặt thay cho quan hệ): vdc-kanban ghi «cùng vị trí» ở dạng bảng nhưng chỉ kiểm nút có mặt**
  Người dùng thấy gì: Nút «Đã lưu trữ» có mặt ở cả dạng bảng và Kanban, nhưng chưa có phép kiểm nào bảo đảm nó nằm cùng chỗ ở hai dạng, nên sau này nút có thể lệch vị trí mà không ai hay.
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **The archived-record banner (DaiLuuTru) and read-only lock (KhoaLuuTru) are built inside apps/app instead of packages/ui (r1)**
  Người dùng thấy gì: Người dùng vẫn thấy dải báo «Đã lưu trữ» và nút Khôi phục đúng như hứa. Nhưng loại bản ghi tiếp theo cần dải báo này sẽ phải chép lại hoặc chui vào thư mục của CRM, nên giao diện dễ lệch nhau theo thời gian.
  file: `apps/app/components/crm/record-sheet/record-actions.tsx`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
