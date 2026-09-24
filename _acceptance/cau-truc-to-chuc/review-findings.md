## Trong hợp đồng

- **Import depends on row order: a department's division and division head are silently dropped when an earlier row for that department leaves the division column empty**
  AC: AC-9
  file: `apps/api/src/to-chuc/to-chuc.service.ts:460`
  severity: high
  source: bugs
  detail: In applyImport, the department loop records a department on the first row that mentions it. Every later row for the same department then hits `if (pbId.has(k)) continue;` before it can create the department under its division or run the `updateMany` that attaches it to one. The parser does not flag this case: `phongBanHaiBoPhan` only groups rows whose division column is filled in, so an empty cell plus "A" is not treated as a conflict. Reproduced with the parser: rows `a@x.vn\tPB moi\t\t` and `b@x.vn\tPB moi\tA\tbộ phận` both come back valid, with summary newDepartments=1, newDivisions=1. On write, division A is created, PB moi is created with divisionId=null, and the head step for row 2 reads divisionId null, so `if (bp)` skips it without an error. The result is an empty division A, the department left unassigned, and no division head, even though the write reports 2 rows written. With the two rows swapped, the department lands in A and the head is set. This breaks AC-9 (result does not depend on row order) and AC-10 (the write matches the preview). Fix: resolve each department's division from any row that names one, not just the first row, or reject the mix of empty and filled division as a pair error.

- **Import falls back to an archived division id: preview promises a new division that the write never creates, and the division head goes onto the archived division**
  AC: AC-10
  file: `apps/api/src/to-chuc/nhap.ts:202`
  severity: medium
  source: bugs
  detail: "`divisionId: bp?.id ?? pb?.divisionId ?? null`: when the row names a division that does not exist yet (bp undefined) and the matched live department still points at an archived division, the row takes that archived division's id. This happens after archiving a department, archiving its division, then restoring the department through onboarding.restoreDepartment, which keeps divisionId. The snapshot only holds live divisions, so the `phongBanBoPhanKhac` check never fires. Reproduced: a department with divisionId \"arch\" and the row `a@x.vn\\tD\\tY\\tbộ phận` give hopLe divisionId=\"arch\" and summary newDivisions=1. In applyImport, `h.divisionId !== null` maps \"y\" to the archived id, so division Y is never created (bpMoi stays 0). The `updateMany where divisionId null` does nothing, and the head step writes headUserId onto the archived division. The department stays under «Chưa xếp», and the write result does not match the preview (AC-10). Fix: only fall back to pb.divisionId when the row leaves the division empty, and only when that division is live."

- **If the first data row has no "@" in its email cell, it is taken as a header and dropped without an error**
  AC: AC-9
  file: `apps/api/src/to-chuc/nhap.ts:83`
  severity: medium
  source: bugs
  detail: "tachDong drops the first non-empty line whenever its first cell has no \"@\". A real first row with a missing email (`\\tD\\t\\t`) or a mistyped one (`lan.onehub.vn\\t...`) disappears from both preview and write. It is not reported as broken with «Thiếu email…» or «Email này chưa là thành viên CRM», and the valid/broken counts leave it out. Reproduced: `\\tD\\t\\t\\na@x.vn\\tD\\t\\t` returns only line 2. AC-9 requires every missing-email row to be reported as broken. Fix: detect the header by matching known column names (email/phòng ban/…), not by the absence of \"@\"."

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Composition/Reuse: vòng đời phòng ban bị tách qua hai router, và hai đường ghi có luật khác nhau**
  Người dùng thấy gì: Nếu ai đó vẫn dùng đường tạo/sửa phòng ban cũ (ngoài màn Tổ chức), họ có thể tạo được phòng ban trùng tên hoặc tên quá dài, phá vỡ quy tắc đặt tên áp dụng ở màn Tổ chức.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: high
  Đề xuất: known-limits

- **Reuse: điều kiện «xoá hẳn được» của phòng ban tính ở hai nơi, cho hai kết quả khác nhau**
  Người dùng thấy gì: Màn hình có thể báo một phòng ban là xoá được trong khi thực ra không xoá được, khiến quản trị bấm Xoá hẳn và bị từ chối bất ngờ, dù dữ liệu không mất.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Codebase consistency: chữ «boPhan» mang hai nghĩa, contract trộn division/boPhanCapTren**
  Người dùng thấy gì: Có chỗ dùng lẫn chữ giữa hai khái niệm khác cấp, có thể khiến người đọc mã hoặc tài liệu hiểu nhầm nghĩa, nhưng dữ liệu và màn hình người dùng vẫn đúng.
  file: `apps/api/src/onboarding/onboarding-danh-muc.ts`
  severity: medium
  Đề xuất: known-limits

- **Slop: thông điệp trùng lặp và không ai dùng trong TO_CHUC**
  Người dùng thấy gì: Có vài thông báo lỗi không dùng tới còn sót trong hệ thống, không ảnh hưởng gì tới người dùng.
  file: `apps/api/src/to-chuc/to-chuc-config.ts`
  severity: low
  Đề xuất: wont-fix

- **Parse at the boundary / constants: độ dài tên kiểm tay, số 80 viết cứng ở UI**
  Người dùng thấy gì: Giới hạn độ dài tên đơn vị được kiểm ở nhiều nơi khác nhau bằng tay; nếu quên đồng bộ khi sửa sau này, người dùng có thể thấy quy tắc đặt tên không nhất quán giữa các màn hình.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Type slop: kiểu viết tay nằm cạnh schema zod**
  Người dùng thấy gì: Đây là vấn đề tổ chức mã nguồn nội bộ, không ảnh hưởng gì tới điều người dùng nhìn thấy.
  file: `apps/api/src/to-chuc/nhap.ts`
  severity: low
  Đề xuất: wont-fix

- **Reuse: boDau chép lại helper sẵn có, regex chứa ký tự tổ hợp vô hình**
  Người dùng thấy gì: Đây là một chi tiết xử lý chữ có dấu trong mã nguồn nội bộ; không ảnh hưởng gì tới điều người dùng thấy trên màn hình.
  file: `apps/api/src/to-chuc/nhap.ts`
  severity: low
  Đề xuất: wont-fix

- **Client derives: hộp thoại vị trí tự suy lại chuỗi quản lý trực tiếp**
  Người dùng thấy gì: Hộp thoại chọn quản lý có thể hiện thiếu một phần câu giải thích, hoặc lệch khỏi quy tắc suy quản lý nếu quy tắc đó đổi ở phía máy chủ sau này, khiến quản trị hiểu chưa đúng ai đang là quản lý và vì sao.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx`
  severity: medium
  Đề xuất: known-limits

- **Reuse: tự ghép URL workspace thay vì dùng useWorkspaceUrl/GOC_CAI_DAT**
  Người dùng thấy gì: Đây là cách viết mã khác với quy ước dùng chung trong dự án; đường dẫn người dùng đi tới vẫn đúng như bình thường.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi.tsx`
  severity: low
  Đề xuất: wont-fix

- **Consistency: bộ lọc division là optional trong khi các bộ lọc anh em có default([])**
  Người dùng thấy gì: Một vài bộ lọc được khai báo khác cách nhau bên trong hệ thống, nhưng do đã có giá trị mặc định bù lại nên người dùng không thấy khác biệt khi lọc.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **Slop: kết quả tự chế và export hoặc public không cần**
  Người dùng thấy gì: Có vài chỗ đặt tên và giá trị trả về không rõ nghĩa trong mã nguồn nội bộ, không ảnh hưởng tới điều người dùng thấy hoặc làm được.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Efficiency: await tuần tự và truy vấn thừa trong setPlacement/applyImport**
  Người dùng thấy gì: Vài bước xử lý chạy nối tiếp thay vì gộp lại, có thể khiến việc gán vị trí hoặc nhập hàng loạt chậm hơn một chút khi dữ liệu lớn, nhưng không đổi kết quả cuối cùng.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: known-limits

- **Compatibility cruft: cờ stopped che việc handler onSignedIn không bao giờ được gỡ**
  Người dùng thấy gì: Đây là cách dọn dẹp trong lúc chạy kiểm thử nội bộ, không ảnh hưởng gì tới người dùng sản phẩm thật.
  file: `apps/api/src/backfill/backfill.service.ts`
  severity: low
  Đề xuất: wont-fix

- **restoreDivision skips the duplicate-name check, so restoring can create two live divisions with the same name**
  Người dùng thấy gì: Khôi phục một bộ phận đã lưu trữ có thể tạo ra hai bộ phận đang sống trùng tên nhau, khiến việc chọn hoặc nhập hàng loạt theo tên sau này có thể gán nhầm vào đơn vị không mong muốn.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: known-limits

- **Bulk import creates divisions and departments without the 80-character name limit**
  Người dùng thấy gì: Nhập hàng loạt từ bảng tính có thể tạo bộ phận hoặc phòng ban với tên rất dài, vượt quá giới hạn cho phép khi tạo tay, và đơn vị đó sau này khó đổi lại tên ngắn giống các đơn vị khác qua màn hình.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính một mình: 'đơn vị chưa lưu trữ không có nút Xoá hẳn' dò ở chỗ nút đó không bao giờ hiện**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù nút Xoá hẳn vô tình xuất hiện sai chỗ, nên lỗi xoá nhầm đơn vị có thể lọt ra ngoài mà không ai biết.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — Âm tính rỗng: vai thành viên không mở mục Đã lưu trữ, mà khoa(null)=true nên Khôi phục/Xoá hẳn luôn tính là khoá**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù nút Khôi phục hoặc Xoá hẳn vẫn hiện cho vai thành viên thường, nên lỗi lộ quyền quản trị có thể lọt ra ngoài mà không ai biết.
  file: `apps/app/test/sua-luu-tru.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — Assert 'chuỗi có mặt' cho số đếm cạnh lựa chọn A, trong khi lời hứa là số đó bằng facetCounts**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù số đếm cạnh bộ lọc bị sai, vì bài chỉ tìm chữ có sẵn trên màn hình chứ không so số thật.
  file: `apps/app/test/doi-nhan-phong-ban.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — 'Huy hiệu trưởng đúng người' chỉ kiểm chuỗi có mặt trong cả cây con của bộ phận**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù huy hiệu Trưởng bộ phận gắn nhầm cho người khác, vì bài không kiểm đúng người mang huy hiệu.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — 'org.tree không đổi' sau khi bị từ chối dùng phép chiếu lọc theo id đã biết, nên không thấy được đơn vị bị tạo lọt**
  Người dùng thấy gì: Một bài kiểm tra tự động về 'cây không đổi khi yêu cầu bị từ chối' có thể không phát hiện được nếu hệ thống lỡ vẫn ghi thêm một đơn vị mới khi từ chối yêu cầu.
  file: `apps/api/test/to-chuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tuyên 'dòng hỏng không để lại hàng nào' nhưng chỉ đếm OrgPlacement**
  Người dùng thấy gì: Một bài kiểm tra tự động về 'dòng hỏng khi nhập không để lại gì' có thể không phát hiện được nếu hệ thống lỡ vẫn tạo bộ phận hoặc phòng ban mới từ dòng hỏng đó.
  file: `apps/api/test/to-chuc-nhap.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — Tiêm lỗi giữa giao dịch chỉ đếm OrgPlacement, trong khi Department được tạo trước trong cùng lượt**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể không phát hiện được nếu một lô nhập lỗi giữa chừng vẫn để lại phòng ban mồ côi trong cơ sở dữ liệu.
  file: `apps/api/test/to-chuc-nhap.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Kỳ vọng 'rút từ previewImport' lấy cột bộ phận từ chính cây đang kiểm khi ô bộ phận trống**
  Người dùng thấy gì: Một bài kiểm tra tự động về việc nhập hàng loạt gán đúng phòng ban có thể không phát hiện được lỗi gán sai, vì bài tự so kết quả với chính kết quả đã ghi.
  file: `apps/api/test/to-chuc-nhap.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — Danh sách thủ tục ghi đọc bằng regex trên tệp sinh sẵn generated/server.ts, không rút từ router lúc chạy**
  Người dùng thấy gì: Danh sách các chức năng ghi dữ liệu cần kiểm quyền có thể lỗi thời so với mã thật, nên một chức năng ghi dữ liệu mới có thể thiếu kiểm quyền mà bài kiểm tra tự động không phát hiện ra.
  file: `apps/api/test/to-chuc.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/27 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/backfill/backfill.service.ts, apps/app/test/sua-luu-tru.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.