## Trong hợp đồng

- **Efficiency: bulk import runs sequential queries per row in an interactive transaction**
  file: `apps/api/src/to-chuc/to-chuc.service.ts:491`
  severity: medium
  AC: AC-10
  detail: For each valid row (up to TO_CHUC.nhap.toiDaDong = 1000), applyImport awaits an orgPlacement.upsert, an orgSecondaryDepartment.deleteMany, and possibly a department.update. For a row where the person is division head (head === "bo-phan"), it also re-reads department.findUnique to get divisionId, even though that value was just computed into bpId/pbId. That is thousands of sequential round-trips inside `$transaction(async tx => ...)`, which has the default interactive timeout. Fix: keep the department→division mapping in memory while building pbId, and batch the placement writes with createMany/updateMany (or pass a timeout that matches the row limit).
  rationale: AC-10 đòi ghi đúng các dòng hợp lệ "trong một lần ghi (transaction)" cho lô tới 1000 dòng (trần của AC-9); nếu giao dịch treo/hết hạn ở lô lớn như finding mô tả, đúng yêu cầu đó của AC-10 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Reuse / Composition: two write paths for Department with different rules**
  Người dùng thấy gì: Một đường ghi dữ liệu phòng ban cũ vẫn hoạt động song song với màn Tổ chức mới, nên tên phòng ban trùng, quá dài hoặc bị chuyển sang bộ phận sai vẫn có thể lọt vào hệ thống mà màn Tổ chức không cho thấy dấu hiệu gì bất thường.
  file: `apps/api/src/onboarding/onboarding.router.ts:100`
  severity: high
  Đề xuất: new-contract

- **Consistency: bulk import skips the name checks**
  Người dùng thấy gì: Khi nhập hàng loạt từ bảng tính, tên phòng ban hoặc bộ phận quá dài vẫn được lưu vào cây tổ chức, dù nhập tay từng đơn vị sẽ bị chặn với cùng tên đó.
  file: `apps/api/src/to-chuc/to-chuc.service.ts:438`
  severity: medium
  Đề xuất: known-limits

- **Type slop: hand-written type duplicates a Zod schema (AGENTS: derive with z.infer)**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — đây là cách viết mã nội bộ trùng lặp định dạng dữ liệu nhập, có thể khiến hai nơi lệch nhau nếu một bên được sửa mà quên sửa bên kia, gây lỗi âm thầm về sau.
  file: `apps/api/src/to-chuc/nhap.ts:23`
  severity: medium
  Đề xuất: known-limits

- **Compatibility cruft: optional `division` filter while sibling filters use default([])**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — cách khai báo bộ lọc trong mã nguồn không đồng nhất giữa các trường lọc, dễ gây nhầm khi có người sửa tính năng lọc sau này.
  file: `apps/api/src/onboarding/onboarding.contracts.ts:263`
  severity: medium
  Đề xuất: known-limits

- **Naming consistency: `division` and `boPhan` mean different levels in the same filter set**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — hai cấp bộ phận và phòng ban dùng tên biến dễ gây nhầm cho người sửa mã sau này, có thể khiến lần sửa kế tiếp vô tình đảo lẫn hai cấp.
  file: `apps/app/app/(app)/[slug]/onboarding/onboarding-search-params.ts:26`
  severity: low
  Đề xuất: known-limits

- **Reuse: DaLuuTruToChuc copies the existing archived-list component**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — màn danh sách đã lưu trữ mới được chép gần như nguyên bản từ màn cũ, nên nếu cần sửa cách hiển thị danh sách lưu trữ sau này, dễ sửa một nơi mà quên nơi còn lại, khiến hai màn hiển thị khác nhau.
  file: `apps/app/app/(app)/[slug]/settings/organization/da-luu-tru-to-chuc.tsx:27`
  severity: low
  Đề xuất: known-limits

- **Duplicated logic: client re-implements the direct-manager rule**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp ngay bây giờ — hộp thoại chọn vị trí tính trước ai sẽ là quản lý bằng một bản sao riêng của quy tắc suy quản lý; nếu quy tắc đó đổi ở nơi khác mà quên đổi ở đây, hộp thoại có thể hiện sai người quản lý so với kết quả thật được lưu.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-vi-tri.tsx:136`
  severity: low
  Đề xuất: known-limits

- **Constants: magic number duplicates the server config**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — giới hạn độ dài tên đơn vị được chép tay vào hộp thoại thay vì lấy từ một nguồn chung, nên nếu giới hạn đó đổi ở máy chủ mà quên đổi ở đây, người dùng có thể bị chặn ở giới hạn cũ sai.
  file: `apps/app/app/(app)/[slug]/settings/organization/hop-thoai-don-vi.tsx:178`
  severity: low
  Đề xuất: known-limits

- **Consistency: link built by hand instead of useWorkspaceUrl**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — đường dẫn tới trang Cài đặt Tổ chức được ghép tay thay vì dùng cách ghép đường dẫn chung của hệ thống, nên nếu đường dẫn cơ sở đổi sau này, liên kết này có thể dẫn sai chỗ mà không ai để ý.
  file: `apps/app/app/(app)/[slug]/settings/onboarding/cai-dat-dieu-phoi.tsx:79`
  severity: low
  Đề xuất: known-limits

- **Reuse: new boDau duplicates an existing diacritic-stripping helper**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — hàm bỏ dấu tiếng Việt cho việc so khớp tên khi nhập được viết lại thay vì dùng bản có sẵn, có thể lệch cách xử lý một số ký tự đặc biệt so với phần còn lại của hệ thống.
  file: `apps/api/src/to-chuc/nhap.ts:45`
  severity: low
  Đề xuất: known-limits

- **Slop: dead message keys in TO_CHUC config**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — một vài dòng chữ thông báo được thêm vào cấu hình nhưng không được dùng ở đâu, chỉ là phần thừa trong mã nguồn.
  file: `apps/api/src/to-chuc/to-chuc-config.ts:19`
  severity: low
  Đề xuất: known-limits

- **Constants: 'not found' messages edited inline instead of moved into config**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — vài câu thông báo lỗi 'không tìm thấy phòng ban' được viết trùng nội dung với câu đã có sẵn ở nơi khác, thay vì dùng chung một câu.
  file: `apps/api/src/onboarding/onboarding.service.ts:304`
  severity: low
  Đề xuất: known-limits

- **Naming hides behavior: boPhanSong also returns archived divisions**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — tên một hàm kiểm tra nội bộ khiến người đọc mã dễ hiểu nhầm là nó chỉ trả về đơn vị chưa lưu trữ, có thể gây lỗi nếu ai đó dùng nhầm mà không tự kiểm tra lại.
  file: `apps/api/src/to-chuc/to-chuc.service.ts:133`
  severity: low
  Đề xuất: known-limits

- **Type slop: return value made up to satisfy orgOkOutput**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — kết quả trả về sau khi sắp lại thứ tự bộ phận mang một giá trị id không có ý nghĩa thật, chỉ để hợp khuôn dữ liệu, không phản ánh gì về đơn vị đã sắp.
  file: `apps/api/src/to-chuc/to-chuc.service.ts:181`
  severity: low
  Đề xuất: known-limits

- **Slop: key={JSON.stringify(...)} and a duplicated messages call**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — cách làm mới hộp thoại sửa đơn vị dùng một khoá không theo quy ước chung của hệ thống, và một đoạn lấy chữ hiển thị được gọi lặp hai lần trong cùng một nơi.
  file: `apps/app/app/(app)/[slug]/settings/organization/to-chuc.tsx:152`
  severity: low
  Đề xuất: known-limits

- **React: optimistic reset repeated in onSuccess and onError; moved item guessed by heuristic**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp ngay bây giờ — khi kéo-thả sắp lại thứ tự, hiệu ứng tạm trên màn hình đoán món nào vừa được di chuyển bằng suy luận thay vì biết chắc, nên trong một số cách kéo-thả hiệu ứng tạm có thể hiện sai món trước khi màn hình tự sửa lại đúng.
  file: `apps/app/app/(app)/[slug]/settings/organization/cay-to-chuc.tsx:319`
  severity: low
  Đề xuất: known-limits

- **The 'two heads' error names the division in lowercase when the division was filled in automatically**
  Người dùng thấy gì: Thông báo lỗi 'hai người cùng làm trưởng' khi nhập hàng loạt đôi khi hiện tên bộ phận viết thường, không giống cách tên đó hiển thị trên cây tổ chức, dễ khiến quản trị đọc nhầm lô dữ liệu đang lỗi ở đâu.
  file: `apps/api/src/to-chuc/nhap.ts:199`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình dạng 4): kiểm ô người nhập không bị dịch chỉ đòi danh sách rỗng, không ghim số ô đã soi**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối trực tiếp — bài kiểm tra tự động cho phần 'không dịch tên người, email' chưa chắc chắn kiểm hết mọi ô cần kiểm, nên nếu sau này ai đó vô tình bỏ sót một ô, phần mềm kiểm tra có thể không phát hiện ra.
  file: `apps/app/test/to-chuc.dom.tsx:578`
  severity: low
  Đề xuất: known-limits

Carried từ round 1-2 (tệp không đổi, không chấm lại round này):

- **Reuse Existing Code: DaLuuTruToChuc copies DaLuuTru (r2)**
  Người dùng thấy gì: Không ảnh hưởng người dùng — cả hai màn lưu trữ và khôi phục vẫn hoạt động đúng như đã hứa; đây chỉ là mã nguồn trùng lặp phía sau.
  file: `apps/app/app/(app)/[slug]/settings/organization/da-luu-tru-to-chuc.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Codebase Consistency: name validation differs between the two department routers (r2)**
  Người dùng thấy gì: Người dùng trên màn Cài đặt › Tổ chức vẫn thấy đúng giới hạn 80 ký tự; sự khác biệt chỉ nằm ở một đường ghi cũ không ai gọi tới qua giao diện.
  file: `apps/api/src/to-chuc/to-chuc.contracts.ts`
  severity: medium
  Đề xuất: wont-fix

- **Codebase Consistency: one division filter under three names, plus optional-field cruft (r2)**
  Người dùng thấy gì: Không ảnh hưởng người dùng — bộ lọc «Bộ phận» ở Điều phối 30 ngày vẫn lọc đúng kế hoạch; đây chỉ là cách đặt tên không nhất quán trong mã nguồn.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: wont-fix

- **Slop: dead duplicate messages in TO_CHUC config (r2)**
  Người dùng thấy gì: Không ảnh hưởng người dùng — đây là các dòng chữ lỗi thừa, không bao giờ hiển thị.
  file: `apps/api/src/to-chuc/to-chuc-config.ts`
  severity: low
  Đề xuất: wont-fix

- **Efficiency: extra query per row in applyImport (r2)**
  Người dùng thấy gì: Không ảnh hưởng người dùng — nhập hàng loạt vẫn ra kết quả đúng, chỉ chạy chậm hơn một chút vì gọi cơ sở dữ liệu thừa cho mỗi dòng.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: low
  Đề xuất: wont-fix

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
