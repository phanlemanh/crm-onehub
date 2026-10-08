# Review findings: danh-sach-keo-chung (round 1)

## Trong hợp đồng

- **Undo for archiving a stage stops working after its first use, and a failed undo cannot be retried**
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx:260`
  AC: AC-7
  severity: high
  source: bugs
  detail: `daHoanTac` is a `useRef(new Set<string>())`. `hoanTacLuuTru` adds `g.id` to it and nothing ever removes it. Case 1: archive stage X (no deals), click Undo, and X comes back. Archive X again and click Undo on the new toast: the check `daHoanTac.current.has(g.id)` returns early, so there is no restore call, no toast and no error. X stays archived while the user thinks it was undone. Case 2: the first Undo fails (network error, or a duplicate label rejected with M.trung). The id is already in the set, so every later click on that toast does nothing. SortableSaveList avoids this with `daTra = duoc` after the promise settles; this guard should also be released when the undo settles, or be scoped to one toast.
  rationale: AC-7 hứa bấm «Hoàn tác» trên toast lưu trữ thì giai đoạn trở lại đúng chỗ cũ; lưu trữ lại cùng giai đoạn rồi Hoàn tác không làm gì là AC-7 thất bại.

- **Shape 4 (negative assertion alone): the E7 row 5 check that the page no longer says «Xoá»/«Delete» passes even on the old page, because it reads the page text while every row menu is closed**
  file: `apps/app/test/giai-doan-cai-dat.dom.tsx:552`
  AC: AC-7
  severity: medium
  source: measurement
  detail: Test 'luu-tru-ngay: trang khong con chu Xoa cho giai doan, vi va en' mounts the page (dung() / dung("en")) and asserts only `chuVi.includes("Xoá")` and `en.textContent.includes("Delete")` equal false. No row menu is opened (the Radix DropdownMenuContent puts nothing in the DOM while closed). The fixture BAY has 7 stages with tran 20, so the cap message (old datTran said «xoá bớt») does not render either. On onehub before this round, the old «Xoá»/«Delete» menu item would also be absent from textContent, so the assertion is green whether or not the change exists. There is no positive control showing the same text scan can see a menu-item word, such as opening a menu and finding t.giaiDoan.luuTru. E7's CHIEU DO covers only rows 1 and 2, so row 5 has never been shown to go red.
  rationale: AC-7 hứa mục menu hàng ghi «Lưu trữ» và trang không còn chữ «Xoá»; bài kiểm không mở menu nên không chạm lời hứa và xanh cả trên bản cũ.

- **Shape 2 (hand-written fake, no round trip): the archive fake never removes the stage, so «order before archiving» and «order when Undo is clicked» are always equal (E7 row 6)**
  file: `apps/app/test/giai-doan-cai-dat.dom.tsx:527`
  AC: AC-7
  severity: medium
  source: measurement
  detail: AC-7 / E7 row 6 promises that Undo calls giaiDoan.reorder with the OPEN order from BEFORE the archive. The test asserts `{ ten: "giaiDoan.reorder", v: { kind: "OPEN", ids: GOC_MO } }`, where GOC_MO is the static BAY order. The fake `archive: thuTuc("giaiDoan.archive", () => null)` (line 99) only logs the call. It does not change duLieu, so giaiDoan.list keeps returning QUALIFIED_TO_BUY in place after the archive and after the restore. A wrong implementation that reads the current list when Undo is clicked would also send GOC_MO and pass. The relation (order captured before the archive versus order at Undo time) is never separated in the fixture. The writer's effect (archive removes the stage from the list) is not round-tripped into what the reader sees.
  rationale: AC-7 hứa Hoàn tác gọi reorder với thứ tự trước khi lưu trữ; hàng giả không bỏ giai đoạn khỏi danh sách nên bài kiểm không phân biệt được hai thứ tự đó.

- **Shape 4 (negative assertion alone): E7 row 8 checks «non-admin sees locked controls» with .every on arrays whose length is not pinned, and the contract's positive control is missing from the eval's run**
  file: `apps/app/test/giai-doan-cai-dat.dom.tsx:575`
  AC: AC-7
  severity: medium
  source: measurement
  detail: Test 'luu-tru-ngay: nguoi khong quan tri thay tay keo va menu khoa' asserts `{ tay: tayCam(k).every(khoa), menu: nutMenu(k).every(khoa) }` equals `{ tay: true, menu: true }`. `[].every(...)` is true, so if the drag handles or menu buttons are hidden instead of disabled for non-admins (or a selector is wrong), the test is still green. The contract row 8 explicitly requires a positive control: «doi chung duong: canManage true thi khong». That control is absent from describe 'luu-tru-ngay'. Eval E7 runs only `-t luu-tru-ngay`, so the length-pinned checks in describe 'khong-quyen' (toHaveLength(BAY.length)) do not run in this eval.
  rationale: AC-7 hứa người không quản trị thì tay kéo và menu hàng bị khoá; kiểm bằng every trên mảng có thể rỗng nên không chứng minh được lời hứa.

- **Shape 4 (negative assertion alone): E9 row 5 «list unchanged after rejection» cannot fail, because the fake archived list is static and still shows 2 rows even after a successful restore**
  file: `apps/app/test/giai-doan-cai-dat.dom.tsx:775`
  AC: AC-9
  severity: low
  source: measurement
  detail: Test 'da-luu-tru: khoi phuc xong co toast; bi chan thi bao loi, danh sach giu' first does a successful restore of CU_MO, then makes the restore reject and asserts `dong: k.querySelectorAll("[data-luu-tru]").length` equals 2. The fake `archived: thuTuc("giaiDoan.archived", () => daCat)` always returns HAI, so the list also keeps 2 rows after the SUCCESSFUL restore. There is no contrasting case where a row disappears, so `dong: 2` never separates «list kept on rejection» from «list never changes». Only `loi: ["trung"]` carries any signal.
  rationale: AC-9 hứa khi máy chủ chặn Khôi phục thì toast lỗi và danh sách không đổi; hàng giả luôn trả 2 dòng nên dòng «không đổi» không thể đỏ.

- **Shape 4 (does not pin the message): E5 for the stages page counts «saved» toasts as «toasts with an action», not by the sortableList.saved text**
  file: `apps/app/app/../test/giai-doan-cai-dat.dom.tsx:443`
  AC: AC-5
  severity: low
  source: measurement
  detail: E5 row 3 promises «toast thanh cong (sortableList.saved) goi 0 lan». In describe 'luu-loi', both the rejection test (line 443) and the positive control (line 460) count `goiToast.filter((x) => x.action !== undefined).length`. Neither filters on loai === "xong" nor on chu === messages("vi").sortableList.saved, the way sap-luu-loi.dom.tsx does. A regression that shows a plain success toast with no action after a rejection (like the old giai-doan daSapXep toast) would still get daLuu: 0. The positive control also does not check that the toast text is sortableList.saved.
  rationale: AC-5 hứa lưu bị từ chối thì không có toast «Đã lưu thứ tự mới»; bài kiểm đếm toast có nút hành động thay vì khớp thông điệp nên bỏ lọt toast thành công không nút.

- **Shape 5 (claims all elements, checks one point): E10 row 6 «every item has id, label, kind, archivedAt» only checks the keys of daCat[0]**
  file: `apps/api/test/giai-doan.spec.ts:887`
  AC: AC-10
  severity: low
  source: measurement
  detail: Contract E10 row 6: «moi phan tu co id, label, kind, archivedAt». The test asserts `khoa: Object.keys(daCat[0] ?? {}).sort()` equals ["archivedAt","id","kind","label"], which reads only the first element. If an element after the first had a different shape, the test would still pass. The check should run over every element of daCat (or at least every element of cuaToi), with one assert per element.
  rationale: AC-10 hứa giaiDoan.archived trả mỗi giai đoạn có id, label, kind, archivedAt; bài kiểm chỉ xét phần tử đầu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Undo of an archive reports failure after the stage was already restored, and can silently undo a later reorder**
  Người dùng thấy gì: Nếu giữa lúc lưu trữ và lúc bấm Hoàn tác có người thêm giai đoạn mới cùng nhóm, giai đoạn vẫn được khôi phục nhưng màn hình báo lỗi. Nếu người dùng đã tự sắp lại nhóm trước đó, Hoàn tác có thể âm thầm ghi đè thứ tự mới bằng thứ tự cũ.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: known-limits

- **An error loading the archived stages hides the «Archived» section with no message**
  Người dùng thấy gì: Khi danh sách đã lưu trữ tải lỗi, mục «Đã lưu trữ» không hiện, trong khi các thông báo lưu trữ vẫn bảo người dùng tìm giai đoạn ở đó. Người dùng không biết là lỗi tải hay thật sự không có gì.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: medium
  Đề xuất: new-contract

- **An Undo from an earlier reorder toast is not blocked while a save is running, and restores an old snapshot**
  Người dùng thấy gì: Nếu người dùng kéo hai lần liên tiếp rồi bấm Hoàn tác ở thông báo của lần kéo đầu, thứ tự cuối cùng trên máy chủ có thể không khớp với những gì màn hình hiện, hoặc lần kéo thứ hai bị lùi theo.
  file: `packages/ui/src/components/sortable-list.tsx`
  severity: medium
  Đề xuất: known-limits

- **A failed load of archived stages is silently hidden**
  Người dùng thấy gì: Nếu việc tải danh sách giai đoạn đã lưu trữ bị lỗi, mục «Đã lưu trữ» biến mất mà không có thông báo hay nút thử lại. Quản trị viên sẽ tưởng không có giai đoạn nào để khôi phục.
  file: `apps/app/app/(app)/[slug]/settings/giai-doan/giai-doan-settings.tsx`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
