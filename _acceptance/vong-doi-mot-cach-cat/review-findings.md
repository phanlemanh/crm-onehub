# Review findings: vong-doi-mot-cach-cat (round 1)

## Trong hợp đồng

- **Shape 4 (negative assertion alone): E6's per-cell check cannot see the deal stage menu opening, because it never counts [role=menu]**
  AC: AC-4
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx:599`
  severity: high
  source: measurement
  detail: soChoMo() (line 599) counts only `input:not([type=hidden]), textarea, [role=listbox], [role=dialog]...`. The "__giai-doan__" cell (timO, line 577) is the DealStageMenu button. DealStageMenu is a DropdownMenu (apps/app/components/crm/stage-change.tsx:71), and when it opens it renders [role=menu], which soChoMo does not count. That button also sits outside the tabpanel, so demChoSua's bat===0 check (line 840) does not cover it. The assertion `soChoMo() === moTruoc` at line 831 is a negative check with no positive control: nowhere does the test click the same cell on a non-archived deal and confirm that soChoMo goes up. The stage cell therefore passes even if the stage menu still opens on an archived deal. That is one of the 15 cells counted by expect(o.length).toBe(15).
  Lý do thuộc hợp đồng: AC-4 nêu rõ menu giai đoạn trên đầu ngăn thoả thuận phải tắt; phép đo hiện không thấy menu đó mở, nên tiêu chí chưa được chứng minh.

- **Shape 4 (negative assertion alone): the "Xoá vĩnh viễn" button is checked only as "not equal to 'Xoá'/'Delete'", not pinned to the promised string, and (d) has no English case**
  AC: AC-6
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx:957`
  severity: medium
  source: measurement
  detail: E8 promises the confirm button reads "Xoá vĩnh viễn" (en "Delete forever"). The test finds the button by the message key itself (`nutCo(c.bulkMenu.confirmDelete, hop)`), which is self-referential, and then only asserts `c.bulkMenu.confirmDelete !== (locale === "vi" ? "Xoá" : "Delete")`. Any other text, such as "Xoá luôn" or an empty string, passes. RecordActions (d) at line 997 is the same: `nutCo(VI.sheet.confirmDeleteForever, hop)` looks the button up by the message key and never compares it with "Xoá vĩnh viễn". The test also runs (d) only in vi, while the contract requires (c) and (d) in en ("Delete forever"). The bulk dialog (c) is never checked for "the consequence text for each record type" (only (d) checks the consequence text). (b) is also negative only: archivedNote/archiveBody "do not contain ẩn/hidden", with no positive pin.
  Lý do thuộc hợp đồng: AC-6 ghim nút xác nhận là «Xoá vĩnh viễn» / «Delete forever» và hộp phải nêu hậu quả; phép kiểm không ghim đúng chữ và thiếu ca tiếng Anh.

- **Shape 4 (negative assertion alone): the non-archived control in E5 asserts the banner is absent without waiting for the sheet to load the record**
  AC: AC-3
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx:738`
  severity: medium
  source: measurement
  detail: In the `!daCat` branch, right after moNgan (which only waits nhip(10)), the test runs `expect(document.querySelector("[data-dai-luu-tru]") === null).toBe(true)`. Nothing shows the sheet has rendered the record (record name, active tabpanel, or the byId call count). If the sheet is still loading, renders an error, or renders nothing, the "no banner" assertion still passes. The archived branch waits with cho, but this branch has no positive witness, so the 3 "dang-dung" cells in the 6-cell matrix are not real controls.
  Lý do thuộc hợp đồng: AC-3 nói bản ghi đang dùng không có dải báo; phép kiểm đối chứng có thể đúng khi ngăn chưa tải xong nên không chứng minh được vế này.

- **Shape 3 (asserting presence when the promise is a relation): E15 checks that baoDaLuuTru/baoLuuTruLoat appears anywhere in the file, not that it is called in the archive mutation's onSuccess**
  AC: AC-1
  file: `_acceptance/vong-doi-mot-cach-cat/rang/duong-luu-tru.mjs:28`
  severity: medium
  source: measurement
  detail: The script promises that every archive call site has Undo. GOI_LUU_TRU and CO_HOAN_TAC are tested separately against the whole file (line 58: `hoanTac: CO_HOAN_TAC.test(noiDung)`), so the script only checks that both strings exist in the same file. It does not check the relation "the bulkArchive/archive mutationOptions onSuccess calls baoLuuTruLoat/baoDaLuuTru". A file whose archive still uses bare reportBulk would pass whenever another place in the file (for example another mutation or a helper) has `baoLuuTruLoat(`. The --chieu-do only tests the case where the whole file lacks the string, so this gap is never driven red.
  Lý do thuộc hợp đồng: AC-1 đòi mọi đường lưu trữ (kể cả từ menu ngăn) có Hoàn tác; script chỉ thấy chuỗi xuất hiện đâu đó trong tệp, không chứng minh đúng đường lưu trữ gọi nó.

- **Shape 3 (asserting presence when the promise is a transition): step 5 of man.mjs checks "3 rows back in the table" with a condition that was already true before archiving**
  AC: AC-1
  file: `_acceptance/vong-doi-mot-cach-cat/rang/man.mjs:386`
  severity: medium
  source: measurement
  detail: E12 step 5 promises that after clicking «Hoàn tác» the 3 rows come back into the table, which is a removed-then-returned transition. The script waits for `tbody tr >= 3` before archiving (line 347) and waits for the same condition again after Undo (lines 386-391). It never records that the rows left the table after archiving. If the table never removed the rows on archive and never refreshed after restore, the step still passes. The DB check `conCat === 0` proves the server restored the records, not that the UI refreshed.
  Lý do thuộc hợp đồng: AC-1 đòi sau Hoàn tác các bản ghi hiện lại ở danh sách mặc định; điều kiện chờ đã đúng từ trước khi lưu trữ nên không chứng minh được việc biến mất rồi hiện lại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The archived-record banner (DaiLuuTru) and read-only lock (KhoaLuuTru) are built inside apps/app instead of packages/ui**
  Người dùng thấy gì: Người dùng vẫn thấy dải báo «Đã lưu trữ» và nút Khôi phục đúng như hứa. Nhưng loại bản ghi tiếp theo cần dải báo này sẽ phải chép lại hoặc chui vào thư mục của CRM, nên giao diện dễ lệch nhau theo thời gian.
  file: `apps/app/components/crm/record-sheet/record-actions.tsx`
  severity: medium
  Đề xuất: new-contract

- **Shape 3 (asserting presence when the promise is a relation): the "view=table" control in E7 checks only that the button exists, not that it is in "the same position"**
  Người dùng thấy gì: Nút «Đã lưu trữ» ở dạng bảng có thể nằm lệch chỗ so với dạng Kanban, nên đôi khi người dùng phải nhìn quanh một chút để tìm. Nút vẫn có mặt và bấm được ở cả hai dạng.
  file: `apps/app/test/vong-doi-mot-cach-cat.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
