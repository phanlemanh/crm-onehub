# Review Findings — cau-truc-to-chuc (round 2)

## Trong hợp đồng

- **Consistency: template split and hard-coded user-facing text**
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx:177`
  severity: low
  detail: The dialog title uses `v.tieuDe.split("{ten}")[0]` instead of the `dien` helper the rest of the screen uses. Anything after {ten} in a translation would be silently dropped. hop-thoai-nhap.tsx:121 hard-codes a Vietnamese placeholder row outside the message file, so English users see it too, and its 'Trưởng' cell (line 183) shows user-typed text without translate="no", against the repo rule that user data is not machine-translated. The `KHONG = "__none"` and `"__chua-xep"` sentinels are also declared separately in several files.
  source: invariants
  AC: AC-14
  rationale: Chi tiết nêu cụ thể ô «Trưởng» hiện tên người do người dùng nhập mà không mang translate="no", đúng là điều AC-14 yêu cầu bắt buộc cho tên người.

- **A row with an empty division column silently takes its division from rows the import rejected, and which one it gets depends on row order**
  file: `apps/api/src/to-chuc/nhap.ts:121`
  severity: high
  detail: The `bpTrongLo` map (lines 121-128) is filled from every parsed row before any error is assigned, and the first row per department wins. Rows that are later rejected still count: rows flagged `phongBanHaiBoPhan` (the department is given two different divisions in the batch) and rows flagged `emailKhongPhaiThanhVien` or `emailLap`. A valid row for the same department with an empty division column then gets that division through `tenBpCua` (line 206). `applyImport` creates or links the division and attaches the department to it. Reproduced with `phanTichLo` and an empty snapshot. (1) The rows `a@x.vn,D,A` / `b@x.vn,D,B` / `c@x.vn,D,,bộ phận` give: rows 2 and 3 rejected for 'D mang hai bộ phận', row 4 valid with divisionName 'A' and head 'bo-phan'. Swapping the first two rows gives 'B' instead. So the batch the import itself calls ambiguous still writes a division, picked by row order, and makes c@ head of it. This is exactly the order dependence commit 954eccaf set out to remove. (2) `zzz@x.vn,D,A` (not a member, rejected) followed by `c@x.vn,D,,` makes row 3 valid with divisionName 'A', and newDivisions is 1. The only row that named 'A' was rejected, yet a division 'A' is created and D is attached to it. In both cases the preview table shows the raw row with an empty division column (`rows: tho`), so the user cannot see the division that will be written. Fix: build `bpTrongLo` only from rows still error-free after all the `danhCap` passes, and never infer a division for a department whose batch rows were flagged `phongBanHaiBoPhan`.
  source: bugs
  AC: AC-9
  rationale: Finding đưa ra hai tình huống tái hiện cụ thể cho thấy kết quả phụ thuộc thứ tự dòng ngay ở loại lỗi «phòng ban hai bộ phận», trái với câu AC-9 «kết quả không phụ thuộc thứ tự dòng» cho đúng loại lỗi cặp này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Composition and Boundaries: one department, two routers with different rules**
  Người dùng thấy gì: Nếu sau này có ai gọi trực tiếp các đường ghi phòng ban cũ (không qua màn Cài đặt › Tổ chức), tên phòng ban dài hơn giới hạn hoặc trùng tên vẫn có thể được lưu, dù màn hình chính không cho việc đó xảy ra.
  file: `apps/app/app/(app)/[slug]/settings/organization/cay-to-chuc.tsx:181`
  severity: high
  Đề xuất: new-contract

- **Reuse Existing Code: DaLuuTruToChuc copies DaLuuTru**
  Người dùng thấy gì: Không ảnh hưởng người dùng — cả hai màn lưu trữ và khôi phục vẫn hoạt động đúng như đã hứa; đây chỉ là mã nguồn trùng lặp phía sau.
  file: `apps/app/app/(app)/[slug]/settings/organization/da-luu-tru-to-chuc.tsx:27`
  severity: medium
  Đề xuất: wont-fix

- **Codebase Consistency: name validation differs between the two department routers**
  Người dùng thấy gì: Người dùng trên màn Cài đặt › Tổ chức vẫn thấy đúng giới hạn 80 ký tự; sự khác biệt chỉ nằm ở một đường ghi cũ không ai gọi tới qua giao diện.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts:5`
  severity: medium
  Đề xuất: wont-fix

- **Client derives instead of rendering: manager fallback copied into the dialog**
  Người dùng thấy gì: Hộp thoại chọn vị trí có thể gợi ý một quản lý khác với quản lý thật hệ thống sẽ áp dụng, ví dụ vẫn gợi ý một người đã rời hoặc một trưởng không thuộc phòng ban đó, trong một số trường hợp hiếm.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx:136`
  severity: medium
  Đề xuất: new-contract

- **Codebase Consistency: one division filter under three names, plus optional-field cruft**
  Người dùng thấy gì: Không ảnh hưởng người dùng — bộ lọc «Bộ phận» ở Điều phối 30 ngày vẫn lọc đúng kế hoạch; đây chỉ là cách đặt tên không nhất quán trong mã nguồn.
  file: `apps/api/src/onboarding/onboarding.contracts.ts:263`
  severity: medium
  Đề xuất: wont-fix

- **Type slop: types written by hand next to Zod schemas**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là cách viết kiểu dữ liệu trùng lặp trong mã nguồn, không đổi kết quả hiển thị.
  file: `apps/api/src/to-chuc/nhap.ts:23`
  severity: low
  Đề xuất: wont-fix

- **Slop: dead duplicate messages in TO_CHUC config**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là các dòng chữ lỗi thừa, không bao giờ hiển thị.
  file: `apps/api/src/to-chuc/to-chuc-config.ts:20`
  severity: low
  Đề xuất: wont-fix

- **Match existing copy: 'Xoá hẳn' where the glossary says 'Xoá vĩnh viễn'**
  Người dùng thấy gì: Người dùng có thể thấy hai cách gọi khác nhau cho cùng một hành động xoá hẳn ở hai màn khác nhau trong ứng dụng.
  file: `apps/app/lib/messages/to-chuc.ts:33`
  severity: low
  Đề xuất: known-limits

- **Efficiency: extra query per row in applyImport**
  Người dùng thấy gì: Không ảnh hưởng người dùng — nhập hàng loạt vẫn ra kết quả đúng, chỉ chạy chậm hơn một chút vì gọi cơ sở dữ liệu thừa cho mỗi dòng.
  file: `apps/api/src/to-chuc/to-chuc.service.ts:507`
  severity: low
  Đề xuất: wont-fix

- **Reuse Existing Code: second copy of boDau**
  Người dùng thấy gì: Không có bằng chứng người dùng thật bị ảnh hưởng — đây là một bản sao hàm xử lý dấu tiếng Việt viết khác cách với bản gốc, có thể ẩn chứa rủi ro nhỏ nhưng chưa xác nhận.
  file: `apps/api/src/to-chuc/nhap.ts:45`
  severity: low
  Đề xuất: wont-fix

- **Composition: reorder API shape forces guessing which item moved**
  Người dùng thấy gì: Khi quản trị sắp lại nhiều bộ phận trong một lượt kéo-thả, có khả năng (chưa xác nhận) máy ghi nhầm bộ phận nào vừa được di chuyển.
  file: `apps/app/app/(app)/[slug]/settings/organization/cay-to-chuc.tsx:316`
  severity: low
  Đề xuất: new-contract

- **Composition: one dialog handles five unrelated actions**
  Người dùng thấy gì: Không ảnh hưởng người dùng — hộp thoại vẫn cho tạo, đổi tên, đặt trưởng, chuyển bộ phận đúng như đã hứa; đây chỉ là một hộp thoại gánh nhiều việc.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-don-vi.tsx:32`
  severity: low
  Đề xuất: wont-fix

- **Shape 5 (claims a whole class but tests only one case): four header names are accepted, but only 'email' is ever tested**
  Người dùng thấy gì: Nếu ai đó dùng dòng tiêu đề viết khác cách chữ 'email' (có dấu tiếng Việt hoặc viết hoa), máy có thể hiểu nhầm đó là một dòng dữ liệu và báo lỗi, dù cách viết phổ biến nhất đã được kiểm tra kỹ.
  file: `apps/api/test/to-chuc-nhap.spec.ts:21`
  severity: low
  Đề xuất: known-limits

Carried từ round 1 (tệp không đổi, không chấm lại round này):

- **Reuse: điều kiện «xoá hẳn được» của phòng ban tính ở hai nơi, cho hai kết quả khác nhau (r1)**
  Người dùng thấy gì: Màn hình có thể báo một phòng ban là xoá được trong khi thực ra không xoá được, khiến quản trị bấm Xoá hẳn và bị từ chối bất ngờ, dù dữ liệu không mất.
  file: `apps/api/src/onboarding/onboarding.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Codebase consistency: chữ «boPhan» mang hai nghĩa, contract trộn division/boPhanCapTren (r1)**
  Người dùng thấy gì: Có chỗ dùng lẫn chữ giữa hai khái niệm khác cấp, có thể khiến người đọc mã hoặc tài liệu hiểu nhầm nghĩa, nhưng dữ liệu và màn hình người dùng vẫn đúng.
  file: `apps/api/src/onboarding/onboarding-danh-muc.ts`
  severity: medium
  Đề xuất: known-limits

- **Parse at the boundary / constants: độ dài tên kiểm tay, số 80 viết cứng ở UI (r1)**
  Người dùng thấy gì: Giới hạn độ dài tên đơn vị được kiểm ở nhiều nơi khác nhau bằng tay; nếu quên đồng bộ khi sửa sau này, người dùng có thể thấy quy tắc đặt tên không nhất quán giữa các màn hình.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts`
  severity: low
  Đề xuất: known-limits

- **Client derives: hộp thoại vị trí tự suy lại chuỗi quản lý trực tiếp (r1)**
  Người dùng thấy gì: Hộp thoại chọn quản lý có thể hiện thiếu một phần câu giải thích, hoặc lệch khỏi quy tắc suy quản lý nếu quy tắc đó đổi ở phía máy chủ sau này, khiến quản trị hiểu chưa đúng ai đang là quản lý và vì sao.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx`
  severity: medium
  Đề xuất: known-limits

- **Reuse: tự ghép URL workspace thay vì dùng useWorkspaceUrl/GOC_CAI_DAT (r1)**
  Người dùng thấy gì: Đây là cách viết mã khác với quy ước dùng chung trong dự án; đường dẫn người dùng đi tới vẫn đúng như bình thường.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi.tsx`
  severity: low
  Đề xuất: wont-fix

- **Consistency: bộ lọc division là optional trong khi các bộ lọc anh em có default([]) (r1)**
  Người dùng thấy gì: Một vài bộ lọc được khai báo khác cách nhau bên trong hệ thống, nhưng do đã có giá trị mặc định bù lại nên người dùng không thấy khác biệt khi lọc.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: low
  Đề xuất: wont-fix

- **Compatibility cruft: cờ stopped che việc handler onSignedIn không bao giờ được gỡ (r1)**
  Người dùng thấy gì: Đây là cách dọn dẹp trong lúc chạy kiểm thử nội bộ, không ảnh hưởng gì tới người dùng sản phẩm thật.
  file: `apps/api/src/backfill/backfill.service.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 — Assertion âm tính một mình: 'đơn vị chưa lưu trữ không có nút Xoá hẳn' dò ở chỗ nút đó không bao giờ hiện (r1)**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù nút Xoá hẳn vô tình xuất hiện sai chỗ, nên lỗi xoá nhầm đơn vị có thể lọt ra ngoài mà không ai biết.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — Âm tính rỗng: vai thành viên không mở mục Đã lưu trữ, mà `khoa(null)=true` nên Khôi phục/Xoá hẳn luôn tính là khoá (r1)**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù nút Khôi phục hoặc Xoá hẳn vẫn hiện cho vai thành viên thường, nên lỗi lộ quyền quản trị có thể lọt ra ngoài mà không ai biết.
  file: `apps/app/test/sua-luu-tru.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — Assert 'chuỗi có mặt' cho số đếm cạnh lựa chọn A, trong khi lời hứa là số đó bằng facetCounts (r1)**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù số đếm cạnh bộ lọc bị sai, vì bài chỉ tìm chữ có sẵn trên màn hình chứ không so số thật.
  file: `apps/app/test/doi-nhan-phong-ban.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — 'Huy hiệu trưởng đúng người' chỉ kiểm chuỗi có mặt trong cả cây con của bộ phận (r1)**
  Người dùng thấy gì: Một bài kiểm tra tự động có thể báo đạt dù huy hiệu Trưởng bộ phận gắn nhầm cho người khác, vì bài không kiểm đúng người mang huy hiệu.
  file: `apps/app/test/to-chuc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — 'org.tree không đổi' sau khi bị từ chối dùng phép chiếu lọc theo id đã biết, nên không thấy được đơn vị bị tạo lọt (r1)**
  Người dùng thấy gì: Một bài kiểm tra tự động về 'cây không đổi khi yêu cầu bị từ chối' có thể không phát hiện được nếu hệ thống lỡ vẫn ghi thêm một đơn vị mới khi từ chối yêu cầu.
  file: `apps/api/test/to-chuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — Danh sách thủ tục ghi đọc bằng regex trên tệp sinh sẵn generated/server.ts, không rút từ router lúc chạy (r1)**
  Người dùng thấy gì: Danh sách các chức năng ghi dữ liệu cần kiểm quyền có thể lỗi thời so với mã thật, nên một chức năng ghi dữ liệu mới có thể thiếu kiểm quyền mà bài kiểm tra tự động không phát hiện ra.
  file: `apps/api/test/to-chuc.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).