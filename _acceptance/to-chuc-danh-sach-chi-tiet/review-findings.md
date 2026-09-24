## Trong hợp đồng

- **Step 3 of the import works out which units were created by comparing two cached copies of the tree, when the server already knows and should return the names**
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-nhap.tsx:93`
  severity: medium
  source: conventions
  AC: AC-7
  rationale: AC-7 hứa bước kết quả của nhập nói đúng tên đơn vị mới do lượt ghi tạo ra; đây đúng là bước đó và đúng là lời hứa về tên đơn vị mới.
  The fix for 'step 3 names the units the write actually created' makes the client work that out itself. Before `applyImport`, `ghiLo` saves the unit names from the cached tree (`truocGhi.current = docCay()`). After the write it calls `await lamMoi()`, reads the cache again and treats any name that was not there before as new. Meanwhile `ToChucService.applyImport` (apps/api/src/to-chuc/to-chuc.service.ts ~490-600) creates each division and department itself, inside the transaction, and returns only the counts `newDepartments`/`newDivisions`. The client ignores those counts and derives its own answer. AGENTS.md says an interactive client component 'receives finished data. It never derives it'. The fix that follows that rule is to have `applyImport` return `newNames`, built from the rows it created, the same way `previewImport` already does in nhap.ts. The client-side comparison can also give a wrong answer. `lamMoi` uses `invalidateQueries`, and in TanStack v5 that does not throw when the refetch fails. If the tree refetch fails, `getQueryData` returns the same data that was saved before the write, so `taoMoi` is empty. Step 3 then says `khongTaoMoi` ('no new units were created') even though the server created divisions or departments, and even though `kq.newDivisions` in the same response says otherwise. A change made by another admin between the save and the refetch would likewise be reported as created by this import. The DOM test (to-chuc-chi-tiet.dom.tsx, the `applyImport` mock that adds to `cay`) only checks the path where the refetch succeeds.

- **Import step 3 can silently say 'no new units created' because it ignores the server's counts and diffs a cache that may not have refreshed**
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-nhap.tsx:96`
  severity: medium
  source: bugs
  AC: AC-7
  rationale: Cùng lời hứa của AC-7 về bước kết quả nói đúng tên/đơn vị mới sau khi ghi — finding này là một cách khác diễn tả cùng chỗ hỏng đó.
  The latest round changed step 3 so that it no longer uses the server's result. The server's applyImport already returns newDepartments and newDivisions, counted inside the write transaction. Step 3 now works out which units were created by comparing names in the org.tree query cache before the write (truocGhi.current = docCay() in ghiLo) with names after `await lamMoi()`. lamMoi calls queryClient.invalidateQueries. In TanStack Query v5 that call swallows refetch errors, because throwOnError defaults to false, and a query whose refetch fails keeps its old data. Failure case: the import creates the division 'Tài chính' and the server returns newDivisions: 1, but the tree refetch fails (network or 5xx). lamMoi still resolves, docCay() returns the pre-import tree, taoMoi becomes {departments: [], divisions: []}, and step 3 shows m.khongTaoMoi ('no new units created') with no error. A stale 'before' snapshot also gives a wrong result. If another admin creates unit X after this page loaded its tree and the CSV references X, the import matches the existing X (server count 0), but X shows up in the post-refetch tree and step 3 lists it as created by this import. Fix: build the list from, or check it against, kq.newDepartments and kq.newDivisions. A better fix is for applyImport to return the names it created, since it already knows them in the transaction. Do not fall back silently to an empty list when the refetch fails.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (assertion âm tính một mình): bài kiểm vắng «Bảo hành» không có đối chứng dương cho nửa phòng ban của bước 3**
  Người dùng thấy gì: Nếu bước kết thúc nhập từ bảng tính hiển thị sai số phòng ban mới, có khả năng không ai phát hiện ra qua các bài kiểm hiện tại.
  file: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «chuỗi có mặt» khi lời hứa là quan hệ): «Tài chính» được kiểm ở bất kỳ đâu trong bước 3, không kiểm nó nằm dưới dòng «Bộ phận mới:»**
  Người dùng thấy gì: Nếu tên bộ phận mới vô tình bị ghi nhầm vào dòng dành cho phòng ban mới (hoặc ngược lại) ở bước kết thúc nhập, người dùng có thể thấy tên đúng nhưng đặt nhầm chỗ mà không bị phát hiện.
  file: `apps/app/test/to-chuc-chi-tiet.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **The new 50-item cap for bulk adds has no message and the screen does not enforce it, so going over it shows raw English Zod text (r1)**
  Người dùng thấy gì: Nếu một quản trị chọn hơn 50 người hoặc phòng ban trong một lượt, màn có thể hiện một câu lỗi tiếng Anh khó hiểu thay vì hướng dẫn rõ ràng, và không gì được lưu.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Screen-width hook written locally with a hard-coded breakpoint instead of following the shared hook in packages/ui (r1)**
  Người dùng thấy gì: Nếu sau này có người chỉnh ngưỡng thu nhỏ màn ở một chỗ mà quên chỗ kia, cây thư mục và khung chi tiết có thể đổi cỡ màn hình không cùng lúc với nhau.
  file: `apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx`
  severity: low
  Đề xuất: known-limits

- **Add-people and attach-departments dialogs let you pick more than 50 items, and the server rejects them (r1)**
  Người dùng thấy gì: Trong một tổ chức lớn, admin có thể tích hơn 50 người hoặc phòng ban rồi bấm xác nhận mà nút vẫn cho bấm, chỉ để nhận một câu lỗi khó hiểu và không có gì được lưu.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-them-nguoi.tsx`
  severity: medium
  Đề xuất: known-limits

- **workspace.get failure is swallowed, and the root silently falls back to the generic label (r1)**
  Người dùng thấy gì: Nếu việc lấy tên không gian làm việc bị lỗi, tên gốc trên cây tổ chức âm thầm đổi thành «Toàn công ty» mà không có dấu hiệu nào báo có sự cố.
  file: `apps/app/app/(app)/[slug]/settings/organization/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 4 (am tinh mot minh, doi chung lech khung): o thu tu cua BON_NUT trong bai chi-doc luon ra false vi o khung goc khong co nut data-nguoi (r1)**
  Người dùng thấy gì: Việc kiểm 'thành viên thường không thấy nút chọn trưởng' có thể luôn báo đạt dù một lỗi thật để lộ nút đó cho thành viên thường.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hinh dang 5 (tuyen quet LOP nhung bo sot): san-thiet-ke.mjs noi quet className tren moi phan tu JSX nhung regex bo qua 15 the thanh phan (r1)**
  Người dùng thấy gì: Một số nút và hộp thoại mới có thể đang phá kiểu dùng chung của hệ thống mà công cụ rà lỗi thiết kế chưa bắt được.
  file: `_acceptance/to-chuc-danh-sach-chi-tiet/rang/san-thiet-ke.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).