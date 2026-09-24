---
schema_version: 1
feature: Một đường ghi phòng ban — mọi thao tác ghi phòng ban đi qua org.* với một bộ luật; gỡ đường ghi onboarding.*Department; điều kiện «xoá hẳn được» tính một nơi
slug: mot-duong-ghi-phong-ban
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: approved
design_doc: docs/superpowers/specs/2026-09-24-mot-duong-ghi-phong-ban-design.md
approved_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
approved_at: 2026-09-25
---

# Acceptance Contract: mot-duong-ghi-phong-ban

## Context

Phòng ban có hai đường ghi: `org.*` của màn Tổ chức (chặn tên trống, dài quá 80 ký tự,
trùng tên cùng cấp) và `onboarding.*Department` còn sót từ Điều phối 30 ngày (≤ 120 ký
tự, không chặn trùng, bỏ qua bộ phận). Lưu trữ, khôi phục, xoá hẳn phòng ban lại chỉ có
ở `onboarding.*`, nên màn Tổ chức gọi cả hai router; và điều kiện «xoá hẳn được» tính ở
ba nơi, một nơi thiếu vế người. Vòng này để lại đúng một đường ghi, một bộ luật, một
hàm «xoá được», và ghim lại tám hồ sơ đã ký có bài kiểm đi qua đường cũ.

Source input: yêu cầu của chủ kho 2026-09-24 theo «Ngoài-1» và «Ngoài-24» của hồ sơ
`_acceptance/cau-truc-to-chuc/` (PR phanlemanh/crm-onehub#120); quyết định
`d-20260924T062111Z-12` của hồ sơ đó; `docs/api.md` mục «The organization tree».

## Criteria

- AC-1: Given máy chủ API đang chạy và một phiên quản trị, When gọi bất kỳ thủ tục ghi phòng ban cũ nào — tRPC `onboarding.createDepartment` · `updateDepartment` · `reorderDepartments` · `archiveDepartment` · `restoreDepartment` · `purgeDepartment`, hoặc REST ghi dưới `/rest/onboarding/departments` — Then máy chủ trả 404 và bảng phòng ban không đổi; And trong router đang chạy, mọi thủ tục ghi có «Department» trong tên đều nằm dưới `org.`, mọi đường REST ghi chứa `/departments` đều nằm dưới `/org/`; And trong mã nguồn các app và gói, lệnh ghi vào bảng phòng ban chỉ nằm trong `apps/api/src/to-chuc/`; And `onboarding.listDepartments` (đọc) vẫn trả danh sách như trước.
- AC-2: Given phòng ban ở từng trạng thái — nằm trong khuôn chưa lưu trữ · chỉ nằm trong khuôn đã lưu trữ · còn 2 thành viên hiệu lực nhận làm phòng ban chính · chỉ còn người nhận làm phòng ban phụ · chỉ còn người đã rời nhận làm phòng ban chính · có bước kế hoạch · trống — When quản trị gọi `org.archiveDepartment` (tRPC và REST), Then ca thứ nhất và ca thứ ba bị từ chối 400 với đúng câu «Phòng ban này còn nằm trong khuôn <tên khuôn> — sửa khuôn trước.» và «Còn 2 người có phòng ban chính ở đây — chuyển họ trước.» và phòng ban vẫn chưa lưu trữ; And năm ca còn lại lưu trữ được; And `org.restoreDepartment` đưa phòng ban về đúng bộ phận và vị trí cũ. (cross-layer)
- AC-3: Given phòng ban ở từng trạng thái — chưa lưu trữ · đã lưu trữ còn bước kế hoạch · đã lưu trữ còn người (kể cả người đã rời) nhận làm phòng ban chính · đã lưu trữ còn nằm trong một khuôn (kể cả khuôn đã lưu trữ) · đã lưu trữ chỉ còn người nhận làm phòng ban phụ · đã lưu trữ trống — When quản trị gọi `org.purgeDepartment`, Then bốn ca đầu bị từ chối 400 với đúng câu «Chỉ xoá hẳn được đơn vị đã lưu trữ.» · «Phòng ban còn bước kế hoạch trỏ tới nên không xoá hẳn được.» · «Phòng ban còn người trỏ tới nên không xoá hẳn được.» · «Phòng ban này còn nằm trong khuôn <tên> — xoá vĩnh viễn khuôn đó hoặc bỏ phòng ban khỏi khuôn trước.» và hàng còn nguyên; And hai ca cuối xoá được, hàng biến mất, dòng phòng ban phụ trỏ tới nó biến theo. (cross-layer)
- AC-4: Given cùng một tập phòng ban đã lưu trữ phủ mọi vế của điều kiện xoá (bước kế hoạch · người nhận làm chính còn hiệu lực · người nhận làm chính đã rời · chỉ người phụ · khuôn chưa lưu trữ · khuôn đã lưu trữ · trống), When đọc `org.tree` (`archived.departments[].purgeable`), đọc `onboarding.listDepartments({ archived: true })` (`purgeable`), rồi gọi `org.purgeDepartment` trên từng phòng ban, Then với mọi phòng ban ba câu trả lời trùng nhau: hai bên đọc cùng giá trị, và giá trị đó `true` đúng khi lệnh xoá thành công.
- AC-5: Given thành viên thường, quản trị và chủ workspace, When gọi `org.archiveDepartment`, `org.restoreDepartment`, `org.purgeDepartment` bằng tRPC và bằng REST với đầu vào hợp lệ, Then thành viên thường nhận 403 và không có gì đổi, quản trị và chủ nhận 200; And bài kiểm quyền rút danh sách thủ tục ghi từ router đang chạy phủ cả ba thủ tục mới và không còn thủ tục `onboarding.*Department` nào. (cross-layer)
- AC-6: Given quản trị ở màn Cài đặt › Tổ chức, When lưu trữ một phòng ban từ menu dòng của nó trong khung chi tiết bộ phận (qua hộp xác nhận), hoàn tác trên thông báo, khôi phục và xoá hẳn một phòng ban trong mục «Đã lưu trữ», Then màn gọi `org.archiveDepartment` / `org.restoreDepartment` / `org.purgeDepartment` với đúng `{ id }` của phòng ban đó và không gọi thủ tục `onboarding.*` ghi nào; And khi máy chủ từ chối lưu trữ, khôi phục hay xoá hẳn, câu của máy chủ hiện nguyên văn và cây cùng danh sách «Đã lưu trữ» không đổi; And không tệp nào của ứng dụng web còn nhắc tới thủ tục ghi phòng ban `onboarding.*`. (cross-layer)
- AC-7: Given tám hồ sơ đã ký có eval máy chạy một tệp kiểm đi qua đường cũ (`dieu-phoi-30-ngay-dau`, `test-api-khong-de-viec-vo-chu`, `quan-ly-danh-muc-30-ngay`, `noi-bon-nut-dieu-phoi`, `khuon-mat-bo-phan`, `sua-luu-tru-dieu-phoi`, `cau-truc-to-chuc`, `to-chuc-danh-sach-chi-tiet`), When vòng này đổi các tệp kiểm đó, Then mỗi khẳng định cũ vẫn còn và vẫn chứng đúng điều nó chứng trước đây — chỉ được đổi đường gieo, đường gọi, tên gieo (thêm hậu tố riêng), hai câu ở AC-3, gỡ giả lập của thủ tục không còn tồn tại khi không khẳng định nào đọc giả lập đó, và một ngoại lệ đã duyệt (d-20260924T154916Z-16): chiều đỏ «tên trống bị từ chối» của `noi-bon-nut-dieu-phoi` đo câu «Tên không được để trống.» của cây kèm vế «không ghi hàng nào»; không khẳng định nào bị bỏ hay nới, kể cả khẳng định thứ tự và vị trí tuyệt đối của phòng ban sau khi sắp; And sổ quyết định của mỗi hồ sơ có một dòng `revisit` nói bài nào đổi và vì sao. (judgment)
- AC-8: Given cây sau khi vòng này xong, When máy rút tập hồ sơ đã ký có eval máy chạy một tệp kiểm mà vòng này sửa, Then tập đó đúng bằng tám hồ sơ ở AC-7; And làn ghim lại bằng máy cho tám hồ sơ đó tại HEAD xanh — mọi eval máy của từng hồ sơ thoát 0 — và mỗi hồ sơ có dòng `repin` chung một `run_id`, với `sha` bằng `verified_commit` của báo cáo; And kiểm tra trước khi gộp của cả kho (không `--slug`) không có vi phạm nào ở hồ sơ khác ngoài chính hồ sơ đang chấm.

## Coverage

Chân sản phẩm: `docs/api.md` mục «The organization tree» [SUY-TỪ-REPO: docs/api.md]; hai
router và luật hiện có [SUY-TỪ-REPO: apps/api/src/to-chuc/to-chuc.service.ts,
apps/api/src/onboarding/onboarding.service.ts]; điều kiện xoá của cây
[SUY-TỪ-REPO: apps/api/src/to-chuc/cay.ts]; vai và vị từ quyền
[SUY-TỪ-REPO: packages/auth/src/organization.ts]; bài kiểm của tám hồ sơ đã ký
[SUY-TỪ-REPO: _acceptance/config.yaml]. Chân ngành: [NGÀNH: Google API Improvement
Proposals AIP-164 «Soft delete»] — xoá mềm, khôi phục, xoá hẳn là ba phương thức của
CÙNG một tài nguyên trên cùng một bề mặt API, không rải ra hai dịch vụ.

- Trục thao tác: tạo | đổi tên | chuyển/sắp | lưu trữ | khôi phục | xoá hẳn [thước CE: bảng thủ tục của hai router + AIP-164] → AC-1 (đường cũ gỡ), AC-2, AC-3; tạo/đổi tên/chuyển đã được AC-2 của `cau-truc-to-chuc` chứng trên `org.*`.
- Trục lối vào: tRPC `org` | REST `/org` | tRPC `onboarding` | REST `/onboarding` | màn Tổ chức | lệnh ghi trong mã [thước CE: router đang chạy + `restMeta` + quét mã] → AC-1, AC-5, AC-6.
- Trục vai: quản trị | chủ | thành viên thường [thước CE: `canManageOrganization`, bài kiểm quyền của `cau-truc-to-chuc`] → AC-5.
- Trục trạng thái phòng ban cho điều kiện lưu trữ/xoá: chưa lưu trữ | còn bước | người chính hiệu lực | người chính đã rời | chỉ người phụ | khuôn sống | khuôn đã lưu trữ | trống [thước CE: vế kiểm của ba nơi hiện tính «xoá được»] → AC-2, AC-3, AC-4.
- Cross-cutting: hồ sơ đã ký bị chạm (AC-7, AC-8) · câu từ chối theo chữ của cây (AC-3).
- Core: AC-1 … AC-8. Later/Never: xem Out of scope và sổ quyết định.

## Out of scope

- Các màn Điều phối 30 ngày chuyển sang đọc phòng ban từ `org.tree` (đường đọc `onboarding.listDepartments` giữ nguyên).
- Chặn tên dài quá 80 ký tự trong nhập hàng loạt (Ngoài-2 của `cau-truc-to-chuc`).
- Khuôn kế hoạch: luật lưu trữ/xoá và câu «xoá vĩnh viễn» của khuôn.
- Lối chuyển tiếp giữ tên cũ `onboarding.*Department` gọi sang `org.*`.
- Thứ tự phẳng toàn bộ phòng ban (`reorderDepartments`) — thứ tự chỉ có nghĩa trong một bộ phận.

## Notes

- Hạng T3 do chủ kho khai (đổi thủ tục ghi có kiểm quyền); máy suy từ `risk_tiers.t3_paths` ra T2 vì không tệp nào nằm trong đường T3 đã khai. Vòng đi hạng cao hơn.
- Vị từ quyền không đổi: `canManageOnboarding` và `canManageOrganization` cùng là `isWorkspaceAdmin`; vòng này không chạm `packages/auth`.
