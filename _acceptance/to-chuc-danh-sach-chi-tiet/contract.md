---
schema_version: 1
feature: Cài đặt › Tổ chức theo bố cục danh sách – chi tiết — trưởng chọn tại chỗ, thêm người và gắn nhiều phòng ban một lượt, ô số lọc được, nhập ba bước, nhất quán với các màn Cài đặt
slug: to-chuc-danh-sach-chi-tiet
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-24-to-chuc-danh-sach-chi-tiet-design.md
approved_by: Manh Phan
approved_at: 2026-09-24
---

# Acceptance Contract: to-chuc-danh-sach-chi-tiet

## Context

Màn Cài đặt › Tổ chức của lượt 1 (`cau-truc-to-chuc`) dựng cây bằng menu «…» và hộp thoại trên từng dòng. Phiên lái-thử người-lạ (`_acceptance/cau-truc-to-chuc/stranger-drive.md`) bỏ cuộc ở hai việc dựng tay: gắn phòng ban vào bộ phận (5 thao tác mỗi phòng ban) và đặt trưởng (danh sách trống, không câu nào nói phải thêm người trước). Bản rà bố cục Cài đặt ghi 17 chỗ màn Tổ chức lệch các màn cùng khu. Vòng này đổi màn sang danh sách – chi tiết: cây bên trái để điều hướng, chi tiết của nút đang chọn bên phải, nơi mọi thao tác sửa đứng cạnh người cần chọn.

Source input: yêu cầu chủ kho 2026-09-24 («đồng ý» mở vòng sau đề xuất bố cục), nhật ký lái thử lượt 1, bản rà bố cục Cài đặt, bản mẫu `/proto/to-chuc-danh-sach-chi-tiet`.

## Criteria

- AC-1: Given quản trị ở Cài đặt › Tổ chức có cây nhiều bộ phận và phòng ban, When bấm gốc OneHub, một bộ phận, một phòng ban hoặc nhóm «Chưa có phòng ban» trên cây, Then khung chi tiết hiện đúng nút đó và nút mang `aria-current="page"`; And địa chỉ trang mang `?don=` tương ứng, tải lại trang vẫn mở đúng nút; And `?don=` không giải được (đơn vị không tồn tại, đã lưu trữ, chuỗi rác) thì mở gốc, không lỗi.
- AC-2: Given một phòng ban có người, When quản trị chọn trưởng trong ô «Trưởng phòng ban» của khung chi tiết, Then ô chỉ liệt kê người của phòng ban đó, chọn xong thì cây và danh sách người hiện nhãn «Trưởng phòng ban» đúng người sau khi tải lại; And với phòng ban chưa có ai, ô trưởng mờ, dưới ô có câu «Thêm người vào phòng ban trước, rồi chọn trưởng trong số họ.», và khung trống có nút «Thêm người». (cross-layer)
- AC-3: Given một bộ phận và các phòng ban chưa xếp hoặc đang thuộc bộ phận khác, When quản trị bấm «Gắn phòng ban có sẵn», tích nhiều phòng ban rồi xác nhận, Then mọi phòng ban đã tích thuộc bộ phận đó sau một lần ghi, nối vào cuối theo thứ tự đã tích, phòng ban đã có trong bộ phận giữ nguyên chỗ; And lô có một phòng ban đã lưu trữ, không tồn tại, hoặc bộ phận đích đã lưu trữ thì máy chủ từ chối cả lô bằng câu lỗi ghim và cây không đổi; And ô trưởng của bộ phận liệt kê mọi thành viên còn hiệu lực. (cross-layer)
- AC-4: Given một phòng ban và các thành viên — người chưa có phòng ban, người đang ở phòng ban khác, người có phòng ban này làm phòng ban phụ, người có quản lý chọn tay, When quản trị bấm «Thêm người», tích họ rồi xác nhận, Then phòng ban này thành phòng ban chính của mỗi người sau một lần ghi; And người có nó làm phòng ban phụ thì không còn ghi phụ nó nữa; And quản lý chọn tay giữ nguyên; And hộp chọn hiện phòng ban hiện tại của từng người («Đang ở … — sẽ chuyển»); And lô có người đã rời hoặc không phải thành viên thì máy chủ từ chối cả lô, không ghi gì. (cross-layer)
- AC-5: Given gốc OneHub và một bộ phận đang được chọn, When quản trị kéo thả — hoặc dùng bàn phím Space, mũi tên, Space — để sắp danh sách bộ phận trong khung gốc và danh sách phòng ban trong khung bộ phận, Then thứ tự mới giữ nguyên sau khi tải lại; And trên màn không còn mục menu «Lên trên / Xuống dưới» — mọi việc sắp thứ tự đi một đường duy nhất. (cross-layer)
- AC-6: Given cây có thành viên chưa có phòng ban chính và phòng ban chưa có trưởng, When xem hai ô số đầu trang rồi bấm từng ô, Then ô thứ nhất nói «X/M» và bấm vào chọn nhóm «Chưa có phòng ban» liệt kê đúng M − X người; And ô thứ hai nói K và bấm vào lọc cây còn đúng K phòng ban chưa có trưởng (kể cả phòng ban chưa xếp), địa chỉ mang `?loc=chua-truong`, bấm lại thì bỏ lọc; And X, M, K bằng phép đếm độc lập trên cùng dữ liệu. (cross-layer)
- AC-7: Given quản trị mở «Nhập từ bảng tính», When đi qua ba bước dán hoặc chọn tệp → xem trước → kết quả, Then thanh bước hiện đúng bước đang ở; And bản xem trước nêu đúng tên từng phòng ban và bộ phận sẽ được tạo, bằng đúng tập đơn vị mà lượt ghi tạo ra; And bước kết quả nói số người đã ghi và tên đơn vị mới, có nút «Xem cây». (cross-layer)
- AC-8: Given một lô nhập có dòng thiếu email, dòng thiếu phòng ban, và dòng làm trưởng bộ phận mà không suy được bộ phận, When xem trước, Then dòng thiếu email mang đúng câu «Thiếu email», dòng thiếu phòng ban mang đúng câu «Thiếu phòng ban», dòng trưởng bộ phận mang đúng câu «Trưởng bộ phận cần cột bộ phận, hoặc phòng ban đã thuộc một bộ phận» — thay câu gộp «Thiếu email, phòng ban, hoặc bộ phận của trưởng bộ phận» mà hồ sơ `cau-truc-to-chuc` (AC-9) đang ghim; And bước xem trước của hộp nhập hiện đúng câu của từng dòng; And bài kiểm của hồ sơ đó được sửa theo câu mới và hồ sơ được ghim lại bằng làn máy. (cross-layer)
- AC-9: Given thành viên thường, When mở Cài đặt › Tổ chức, Then thấy cây, chi tiết, người, trưởng và hai ô số; mọi nút sửa, ô chọn và kéo thả đều hiện nhưng mờ, kèm dòng «Chỉ quản trị sửa được cây tổ chức.»; And `org.attachDepartments` và `org.addPeople` gọi bằng phiên của họ trả `FORBIDDEN`, bằng phiên quản trị thì chạy; And danh sách thủ tục ghi `org.*` mà phép kiểm quyền đối chiếu gồm cả hai thủ tục mới. (cross-layer)
- AC-10: Given màn Tổ chức có dữ liệu, ở khổ 320 · 375 · 768 · 1024 · 1440, tiếng Việt và tiếng Anh, When mở trên trình duyệt thật của cây đang xét, Then từ 1024 trở lên hai cột cùng hiện; dưới 1024 cây chiếm cả bề ngang và chọn một nút mở khung trượt bên phải; trang không tràn ngang ở mọi khổ; And tên người, tên đơn vị, email mang `translate="no"`; And chỉ dùng Tab và Enter chọn được một phòng ban và mở được hộp «Thêm người».
- AC-11: Given màn Tổ chức lúc đang tải, lỗi tải, chưa có cây, và sau mỗi lần ghi, When xem, Then đang tải là vỏ tải chung của các màn Cài đặt; lỗi là khung trống có biểu tượng, câu mô tả và nút «Thử lại»; chưa có cây là khung trống có hai nút «Nhập từ bảng tính» và «Thêm bộ phận»; And mỗi lần ghi thành công hiện thông báo thành công; And lỗi trong mọi hộp thoại của màn hiện một kiểu duy nhất ngay dưới ô, và con trỏ nhảy tới ô lỗi đầu tiên.
- AC-12: Given quản trị lưu trữ một đơn vị ở Cài đặt › Tổ chức hoặc một khuôn ở Cài đặt › Điều phối 30 ngày, When hộp xác nhận mở, Then nút xác nhận lưu trữ không tô màu phá huỷ, còn nút «Xoá hẳn» vẫn tô; And mục «Đã lưu trữ (n)» của hai màn là cùng một thành phần dùng chung, cùng nhãn, cùng mũi tên mở, cùng cỡ nút khôi phục.
- AC-13: Given các lời hứa đã ký của `cau-truc-to-chuc`, `sua-luu-tru-dieu-phoi` và `noi-bon-nut-dieu-phoi`, When chạy lại bài kiểm của chúng sau vòng này, Then mọi bài xanh, trừ đúng câu lỗi mà AC-8 đổi có chủ đích; And bài kiểm màn nào dời sang bố cục mới giữ nguyên tên bài và lời hứa hành vi; And ba hồ sơ được ghim lại bằng làn máy.
- AC-14: Given các tệp giao diện vòng này chạm tới, When chạy cổng thiết kế tĩnh và quét mã, Then không có vi phạm; And không tệp nào dưới `settings/organization` chỉnh giao diện một thành phần bằng `className` (nút cây, ô số dùng biến thể trong `packages/ui`); And tệp sửa trong `packages/ui` chỉ gồm các thành phần dùng chung đã khai trong kế hoạch.

## Coverage

Chân sản phẩm: màn và thủ tục hiện có [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/settings/organization/cay-to-chuc.tsx], [SUY-TỪ-REPO: apps/api/src/to-chuc/to-chuc.contracts.ts]; chỗ vấp khi dựng tay [SUY-TỪ-REPO: _acceptance/cau-truc-to-chuc/stranger-drive.md trên nhánh lai-thu/cau-truc-to-chuc]; khuôn chung của các màn Cài đặt [SUY-TỪ-REPO: apps/app/components/page-shell.tsx]. Chân ngành: [NGÀNH: Google Workspace Admin console — cây đơn vị tổ chức bên trái, cài đặt đơn vị bên phải], [NGÀNH: Zoho One — phòng ban có trưởng và thành viên].

- Trục A — nút đang chọn: gốc | bộ phận | phòng ban | nhóm «Chưa có phòng ban». [thước CE: bốn loại nút có trên cây lượt 1 + bộ lọc]
- Trục B — việc: xem | trưởng | thêm người | gắn phòng ban | sắp thứ tự | lọc từ ô số | nhập | lưu trữ. [thước CE: nhật ký lái thử vấp #1–#6, #8 + bản rà bố cục]
- Trục C — vai: quản trị | thành viên thường. [thước CE: `canManageOrganization`]
- Trục D — khổ: rộng ≥ 1024 | hẹp < 1024. [thước CE: năm khổ đo của lượt 1]
- Cross-cutting: vi/en, `translate="no"`, bàn phím, địa chỉ trang giữ trạng thái, trạng thái tải · lỗi · trống, không hồi quy ba hồ sơ đã ký.
- Core: AC-1 … AC-14. Later/Never: xem Out of scope và sổ quyết định.
- [GIẢ ĐỊNH] «Thêm người» đặt phòng ban chính và chuyển người đang ở nơi khác; thêm người làm phòng ban phụ vẫn làm ở hộp vị trí của từng người.
- [GIẢ ĐỊNH] Gắn một phòng ban đang thuộc bộ phận khác thì chuyển nó sang, không từ chối.
- [GIẢ ĐỊNH] Bộ lọc «chưa có trưởng» tính cả phòng ban chưa xếp vào bộ phận.
- [GIẢ ĐỊNH] Dưới 1024px chi tiết mở trong khung trượt; từ 1024 trở lên hai cột.

## Out of scope

- Sơ đồ tổ chức kéo/phóng to (block `flow-2`) — để sau, gắn với OKR.
- Người đứng đầu gốc OneHub (CEO) và việc suy quản lý của trưởng bộ phận lên gốc.
- Kéo thả người giữa các phòng ban; chọn nhiều người trên danh sách để chuyển hàng loạt.
- Thành phần `tree` của ReUI (`@headless-tree`) — cây hai cấp cố định giữ thành phần mở-gập sẵn có.
- Dùng mục «Đã lưu trữ» chung cho màn Trường.
- Sửa lệch của màn Kết nối, Theo dõi, Tiền tệ, Thành viên; thống nhất nút «…» toàn kho.
- Mời người chưa vào CRM từ lô nhập (chỗ vấp #7 của lái thử).
- Đường tạo/sửa/sắp phòng ban cũ `onboarding.*` — việc riêng đã mở (Ngoài-1 của `cau-truc-to-chuc`).

## Notes

- Bản mẫu 17 trạng thái: `/proto/to-chuc-danh-sach-chi-tiet`, ảnh ở `evidence/design-pass/`.
- Hai thủ tục ghi mới nằm trong module `to-chuc` của API, không chạm đường T3.
- Hai chỗ lệch được phê tại Cổng Bằng chứng (khối quyết định tạm): bài đã ký «nhap-man» của `cau-truc-to-chuc` đổi giá trị mong đợi của dữ liệu gửi lượt ghi (thêm `traTen: true`, lời hứa giữ nguyên); luật E21 cho thẻ HTML trần đọc là «bố cục + token thiết kế».

Known limits — chấp nhận tại Cổng Bằng chứng 2026-09-25 (Manh Phan):

- Ngoài-3: Bài kiểm tự động cho bước xem kết quả nhập có thể vẫn báo đạt dù màn hình đang hiển thị nhầm danh sách bộ phận dự kiến ban đầu thay vì danh sách thực sự đã tạo, nên một lỗi hiển thị sai kiểu này có thể lọt qua mà không ai phát hiện.
- Ngoài-4: Nếu sau này có người chỉnh ngưỡng thu nhỏ màn ở một chỗ mà quên chỗ kia, cây thư mục và khung chi tiết có thể đổi cỡ màn hình không cùng lúc với nhau.
- Ngoài-5: Trong một tổ chức lớn, admin có thể tích hơn 50 người hoặc phòng ban rồi bấm xác nhận mà nút vẫn cho bấm, chỉ để nhận một câu lỗi khó hiểu và không có gì được lưu.
- Ngoài-6: Nếu việc lấy tên không gian làm việc bị lỗi, tên gốc trên cây tổ chức âm thầm đổi thành «Toàn công ty» mà không có dấu hiệu nào báo có sự cố.
- Ngoài-7: Một số nút và hộp thoại mới có thể đang phá kiểu dùng chung của hệ thống mà công cụ rà lỗi thiết kế chưa bắt được.
