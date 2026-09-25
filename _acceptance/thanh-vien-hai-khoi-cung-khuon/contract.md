---
schema_version: 1
feature: Trang Cài đặt › Thành viên — hai khối «Đã vào» và «Được phép vào» dùng chung khuôn section Card → CardHeader → bảng; nút «Cho phép một địa chỉ» lên đầu trang; «Rút» vào menu «…»
slug: thanh-vien-hai-khoi-cung-khuon
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T11:58:42Z
design_doc: docs/superpowers/specs/2026-09-25-thanh-vien-hai-khoi-cung-khuon-design.md
---

# Acceptance Contract: thanh-vien-hai-khoi-cung-khuon

## Context

Trang `/<slug>/settings/members` có hai khối dựng theo hai cách: khối thành viên là `DataTable`
có vỏ viền, khối «Được phép vào» là bảng vẽ tay không viền, chữ to hơn, cột đầu sát mép, hai nút
hiện sẵn, tràn ngang ở 375px, và nút «Cho phép một địa chỉ» rơi dưới mép màn khi có 10 thành
viên. Phương án A (chủ kho duyệt 25/09/2026): cả hai theo khuôn section của kho — `Card` →
`CardHeader` có số đếm → một bảng; nút lên `PageShellActions`; «Rút» vào menu «…».

Tiêu chí màn hình đo trên cây đang xét, cổng 3500/3501, 10 thành viên có sẵn, 15 lời cho phép
do bàn đo gieo thêm, quản trị `ada@trycomp.ai`, tiếng Việt. «Vỏ bảng» là phần tử
`[data-slot=table-container]` của bảng; «khối dưới» là `section` chứa tiêu đề «Được phép vào».

## Criteria

- AC-1: Given 10 thành viên và từ 15 lời cho phép đang chờ, When quản trị mở trang ở 1440×900, 768×1024 và 375×812, Then vỏ bảng của hai khối có cùng độ dày viền trên (≥ 1px), cùng bán kính góc, hàng tiêu đề cột cùng màu nền (không trong suốt), và ô dữ liệu cùng cỡ chữ.
- AC-2: Given cùng dữ liệu và ba khổ của AC-1 (vỏ bảng dưới ở vị trí cuộn ngang 0), When trang tải xong, Then mép trái nội dung của ô cột đầu — cả ô tiêu đề lẫn ô dữ liệu hàng đầu — ở hai bảng lệch nhau không quá 1px.
- AC-3 (cross-layer): Given cùng dữ liệu, When quản trị mở trang ở 1440×900 và chưa cuộn, Then nút «Cho phép một địa chỉ» nằm trong vùng hành động của đầu trang, trọn trong khung nhìn, và điểm giữa nút trả về chính nút; bấm nút mở hộp «Cho phép một địa chỉ», và cho phép một địa chỉ mới thì hàng của địa chỉ đó hiện trong khối dưới, cơ sở dữ liệu có đúng một lời cho phép đang chờ cho địa chỉ đó, và số đếm của khối dưới tăng một.
- AC-4: Given cùng dữ liệu, When trang tải xong ở 1440×900, Then tiêu đề hai khối là «Đã vào · N» và «Được phép vào · M», với N là số thành viên và M là số lời cho phép đang chờ đọc từ cơ sở dữ liệu; mỗi khối là một `section` có tên trỏ tới chính tiêu đề đó; và khi ô tìm của khối trên lọc còn một người, tiêu đề vẫn là «Đã vào · N».
- AC-5: Given cùng dữ liệu, When quản trị mở trang ở 375×812, Then cả `document` lẫn vùng cuộn `main` không tràn ngang; vỏ bảng dưới cuộn ngang được bên trong chính nó; và sau khi lăn con lăn ngang trong vỏ đó, nút «…» của một hàng nằm trọn trong vỏ.
- AC-6 (cross-layer): Given cùng dữ liệu, When quản trị xem khối dưới ở 1440×900, Then không có nút chữ «Rút» hiện sẵn; mỗi hàng có nút «Phát liên kết» hiện sẵn và một nút «…» có tên «Hành động với <địa chỉ>»; bấm «…» mở menu có mục «Rút» kiểu phá huỷ; chọn mục đó mở hộp «Rút lời cho phép này?»; xác nhận thì hàng biến mất, số đếm giảm một, và lời cho phép đó không còn ở trạng thái chờ trong cơ sở dữ liệu.
- AC-7: Given cùng dữ liệu, When trang tải xong ở 1440×900, Then ở khối dưới: ô «Vai trò khi vào» và «Người cho phép» có màu chữ bằng màu chữ tiêu đề cột; cột «Cho phép lúc» căn phải ở cả ô tiêu đề và ô dữ liệu; và cỡ chữ ô dữ liệu bằng cỡ chữ ô dữ liệu của khối trên.
- AC-8: Given quản trị và truy vấn «Được phép vào» chưa trả về, When khối dưới được vẽ, Then khối có mặt với tiêu đề «Được phép vào» và ít nhất ba ô khung xương, và không hiện câu «Chỉ những người ở bảng trên vào được…».
- AC-9: Given quản trị và không có lời cho phép nào đang chờ, When khối dưới được vẽ, Then tiêu đề là «Được phép vào · 0», câu rỗng nằm trong `CardTableEmpty`, và khối không có bảng.
- AC-10: Given một người vai «Thành viên» (không có quyền quản trị), When họ mở trang ở 1440×900, Then họ thấy «Đã vào · N», không thấy nút «Cho phép một địa chỉ» ở đâu trên trang, và không thấy khối «Được phép vào».
- AC-11: Given từ điển sản phẩm, When đọc `CONTEXT.md` và `apps/app/lib/messages/settings-thanh-vien.ts`, Then từ điển có mục «Đã vào» và mục «Được phép vào», mỗi mục có dòng `_Avoid_` và dòng «Vì sao»; và chuỗi tiếng Việt của hai tiêu đề khối đúng bằng hai chữ đó.
- AC-12: Given cây sau vòng này, When chạy lại bàn đo đã ký của `bang-thanh-vien-giu-hang` (`ttv_do_bang`), Then nó đạt trọn như lúc ký; và trang chỉ có một `DataTable` (một ô tìm trong vùng nội dung).
- AC-13: Given bàn đo đã gieo và tạo lời cho phép thử, When lượt đo kết thúc — đạt, trượt, hay hỏng giữa chừng — Then không còn lời cho phép nào mang tiền tố của bàn đo, và tập lời cho phép có sẵn trước lượt còn nguyên cả số lẫn trạng thái.
- AC-14: Given ảnh chụp thật của lượt đo, When người xem mở ảnh đầu trang và ảnh chỗ nối hai khối ở mỗi khổ, ảnh menu «…» đang mở và ảnh của người không có quyền, Then nhìn thấy hai khối cùng một kiểu thẻ — tiêu đề có số đếm, vỏ bảng viền bo, tiêu đề cột nền xám — nút «Cho phép một địa chỉ» ở đầu trang, và «Rút» chỉ nằm trong menu.
- AC-15 (cross-layer): Given hộp «Cho phép một địa chỉ» mở từ đầu trang, When quản trị cho phép một địa chỉ đã có trong danh sách chờ, Then hộp vẫn mở, thông điệp lỗi của API nằm trong hộp, cơ sở dữ liệu không thêm lời cho phép nào, và tiêu đề khối dưới giữ nguyên số đếm.
- AC-16: Given các tệp của trang Thành viên sau vòng này, When soi mã, Then không component `@crm/ui` nào ở chỗ gọi mang lớp đổi viền, góc, nền hay bóng, các component khung (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardTable`, `DataTable`) không nhận `className`, và chuỗi lớp của `CardTable` trong `packages/ui` giữ nguyên.

## Coverage

Quét bằng morphological-scan (preset test-matrix), bốn trục:

- Trục khối: đầu trang (nút) | «Đã vào» | «Được phép vào» [thước CE: `apps/app/app/(app)/[slug]/settings/members/page.tsx` — SUY-TỪ-REPO]
- Trục trạng thái dữ liệu: đang tải | rỗng | có hàng (dài: 15 lời cho phép) | lỗi khi tải [thước CE: mục «Trạng thái» của `docs/settings.md` — SUY-TỪ-REPO; NGÀNH: Vercel Web Interface Guidelines «handle empty states explicitly»]
- Trục khổ: 1440×900 | 768×1024 | 375×812 [thước CE: khổ của bàn đo `_acceptance/bang-thanh-vien-giu-hang/rang/do-bang.mjs` — SUY-TỪ-REPO]
- Trục vai người xem: quản trị (chủ sở hữu, quản trị) | thành viên thường [thước CE: `canManageMembers` trong `apps/api/src/workspace/workspace.service.ts` — SUY-TỪ-REPO]
- Cắt ngang mọi ô Core: số đếm không đổi theo bộ lọc · không tràn ngang · thao tác phá huỷ qua hỏi lại · dữ liệu thử được dọn · đối chiếu ngành: GitHub Organization › People (lời mời chờ tách khỏi thành viên, nút mời ở đầu trang) và Linear Settings › Members (nút «Invite» ở đầu trang) [NGÀNH: GitHub, Linear].

Core: có hàng × hai khối × ba khổ (AC-1, AC-2, AC-5) · đầu trang × 1440 (AC-3, đường lỗi AC-15) · không đè lớp (AC-16) · tiêu đề và đếm (AC-4) · hành động hàng (AC-6, AC-7) · đang tải (AC-8) · rỗng (AC-9) · thành viên thường (AC-10) · từ điển (AC-11) · không hồi quy (AC-12) · dọn (AC-13) · ảnh (AC-14).

Later: lỗi khi tải «Được phép vào» — `Empty` có nút thử lại (đợt 4) · thành viên thường thấy khối ở dạng khoá (đợt 4) · khung xương của khối «Đã vào» (do `DataTable` lo, chưa đổi).

Never: gộp hai khối thành một `DataTable` có tab — hai danh sách là hai loại vật (người đã vào / địa chỉ), và hai `DataTable` trên một trang đụng khoá URL.

[GIẢ ĐỊNH] Tên hai khối «Đã vào» / «Được phép vào» và hai mục từ điển mới là bản máy soạn theo gợi ý của phương án A — người gạch ở cổng.

## Out of scope

- Người không phải quản trị thấy khối «Được phép vào» ở dạng khoá kèm lý do — đợt 4 của `docs/settings.md`; API `workspace.allowances` trả 403 cho họ.
- Ghi trạng thái mở của hộp «Cho phép một địa chỉ» lên URL — luật «Tạo mới» của `docs/settings.md`.
- Chuyển `ConfirmDialog` vào `packages/ui` — đợt 2.
- Trạng thái lỗi khi tải «Được phép vào» — đợt 4.
- Thêm trường đếm thành viên vào API `workspace` — đường T3, không cần cho vòng này.
- Đường lỗi của «Rút» (toast lỗi, hàng giữ nguyên) — mã xử lý lỗi không đổi so với bản cũ, và không có cách gây lỗi API rút trên màn thật mà không sửa dữ liệu người khác.
- Trạng thái rỗng đo trên màn thật — app chỉ có một không gian làm việc và cơ sở dữ liệu dev có lời cho phép của người khác; AC-9 đo bằng test DOM với dữ liệu giả gõ kiểu theo đầu ra thật của API.

## Notes

- Không có `opportunity.md` — vòng đồng bộ giao diện đi thẳng từ ảnh đo thật, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- Ảnh hiện trạng: `_acceptance/bang-thanh-vien-giu-hang/evidence/thanh-vien-*-noi.png`.
- «Khối» trong hợp đồng này là một section của trang Thành viên, không phải bộ phận của cây tổ chức; «quản trị» là vai chủ sở hữu hoặc quản trị của không gian làm việc (`canManageMembers`), không phải trưởng đơn vị. Lint W6 của kit báo hai chữ này theo nghĩa khác trong `CONTEXT.md`.
