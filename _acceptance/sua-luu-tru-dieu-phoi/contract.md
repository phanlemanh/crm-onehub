---
schema_version: 1
feature: Người quản trị sửa, sắp xếp, lưu trữ và khôi phục bộ phận và khuôn; người điều phối đóng, mở lại kế hoạch và đánh dấu bậc phễu — chỉ quản trị được đổi cấu hình
slug: sua-luu-tru-dieu-phoi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-09-22
design_doc: docs/superpowers/specs/2026-09-22-sua-luu-tru-dieu-phoi-design.md
---

# Acceptance Contract: sua-luu-tru-dieu-phoi

## Context

Vòng `noi-bon-nut-dieu-phoi` chỉ nối nút **tạo**. Chủ kho báo 22/09: Điều phối 30 ngày
tạo được nhưng không sửa, không xoá. Máy chủ có sẵn phần lớn thủ tục nhưng không màn
nào gọi; module điều phối không kiểm quyền; và hai hạn chế đã ký ở vòng trước
(Ngoài-1, Ngoài-6) được gộp vào vòng này theo lời chủ kho. Cấp phòng ban thuộc bộ
phận đã tách thành ô `cau-truc-to-chuc`.

## Criteria

- AC-1: Given một quản trị ở Cài đặt › Điều phối 30 ngày, When đổi tên một bộ phận qua menu của dòng đó và lưu, Then tên mới được ghi và hiện trong danh sách, và bước của kế hoạch đang chạy giao cho bộ phận đó hiện tên mới trên hồ sơ kế hoạch. (cross-layer)
- AC-2: Given một quản trị và ít nhất hai bộ phận, When kéo một bộ phận sang vị trí khác, Then thứ tự mới được ghi, còn nguyên sau khi tải lại trang, và ô chọn bộ phận trong hộp thoại Soạn khuôn theo đúng thứ tự đó; máy chủ từ chối thì danh sách về thứ tự cũ. (cross-layer)
- AC-3: Given một quản trị và một bộ phận không khuôn chưa lưu trữ nào dùng, When lưu trữ nó và xác nhận, Then nó rời danh sách, hiện trong mục «Đã lưu trữ», một thông báo có nút «Hoàn tác» đưa nó trở lại danh sách; bước của kế hoạch đang chạy giao cho bộ phận đó vẫn hiện đúng tên trên hồ sơ kế hoạch. (cross-layer)
- AC-4: Given một bộ phận có mặt trong ít nhất một khuôn chưa lưu trữ, When lưu trữ nó — từ màn hoặc gọi thẳng máy chủ, Then máy chủ từ chối với thông điệp nêu tên khuôn đang dùng nó, bộ phận vẫn ở danh sách, và màn hiện thông điệp đó. (cross-layer)
- AC-5: Given một quản trị và một khuôn đã có kế hoạch tạo từ nó, When sửa tên, loại đối tác và các bước của khuôn trong hộp thoại Soạn khuôn điền sẵn rồi lưu, Then khuôn mang đúng giá trị mới, còn các bước của kế hoạch đã tạo không đổi. (cross-layer)
- AC-6: Given một quản trị, When lưu trữ một khuôn, Then khuôn rời danh sách khuôn, hiện trong «Đã lưu trữ», không còn trong ô chọn khuôn của «Tạo kế hoạch từ khuôn», và thông báo có «Hoàn tác» đưa nó trở lại. (cross-layer)
- AC-7: Given mục «Đã lưu trữ» có bộ phận và khuôn, When bấm «Khôi phục», Then mục đó trở lại danh sách đang dùng; khôi phục một khuôn có bước giao cho bộ phận đang lưu trữ thì máy chủ từ chối với thông điệp nêu tên bộ phận đó. Soạn hay sửa khuôn với bước giao cho bộ phận đã lưu trữ cũng bị từ chối như vậy. (cross-layer)
- AC-8: Given mục «Đã lưu trữ», When xem một bộ phận hay khuôn chưa từng được dùng (bộ phận: không bước kế hoạch nào; khuôn: không kế hoạch nào tạo từ nó), Then máy chủ báo mục đó xoá được và màn có nút «Xoá vĩnh viễn» và xác nhận xong thì nó biến mất khỏi cơ sở dữ liệu; mục đã từng được dùng thì không có nút, và gọi thẳng máy chủ xoá nó bị từ chối. (cross-layer)
- AC-9: Given một người có vai trò thành viên, When mở Cài đặt › Điều phối, Then mọi nút đổi cấu hình (thêm, sửa, sắp xếp, lưu trữ, khôi phục, xoá vĩnh viễn — cho bộ phận và khuôn) bị khoá kèm dòng «Cần quyền quản trị để đổi cấu hình điều phối», và gọi thẳng máy chủ bất kỳ thao tác nào trong số đó trả 403; cùng người đó vẫn tạo kế hoạch, đóng, mở lại, thêm môi giới và đánh dấu bậc được. (cross-layer)
- AC-10: Given hồ sơ một kế hoạch đang chạy, When bấm «Đóng kế hoạch» và xác nhận, Then kế hoạch có ngày đóng, rời danh mục mặc định, hiện khi lọc «Đã đóng», và hồ sơ hiện nhãn «Đã đóng» với nút «Mở lại»; bấm «Mở lại» thì kế hoạch trở về danh mục mặc định. (cross-layer)
- AC-11: Given hồ sơ kế hoạch có môi giới, When bấm một ô bậc còn trống của một người, Then bậc đó được ghi với ngày lịch hôm nay theo giờ của người dùng và phễu đếm thêm một; When bấm ô đã có ngày, chọn ngày khác hoặc «Bỏ đánh dấu», Then bậc mang ngày mới hoặc trở về trống; đánh dấu một bậc sau khi các bậc trước còn trống vẫn được. (cross-layer)
- AC-12: Given thủ tục tạo kế hoạch và thủ tục đánh dấu bậc gọi qua HTTP — và hộp thoại «Tạo kế hoạch từ khuôn» của vòng trước vẫn gửi đúng dạng ngày mà máy chủ nay đòi, When ngày gửi lên là chuỗi `YYYY-MM-DD` hợp lệ, Then ngày được ghi đúng ngày lịch đó; When ngày thiếu, là `null` ở ngày bắt đầu, là số, hay là chuỗi khác dạng, Then máy chủ trả 400 nêu tên trường và không ghi gì — không còn kế hoạch nào mang ngày 01/01/1970. (cross-layer)
- AC-13: Given một cá nhân đã có trong phễu của kế hoạch, When mở «Thêm môi giới», Then cá nhân đó hiện mờ kèm «đã trong phễu» và không chọn được; When gọi thẳng máy chủ thêm cá nhân đó, Then máy chủ trả 409 «Người này đã có trong phễu» và nguồn của ghi danh không đổi. (cross-layer)
- AC-14: Given một thao tác bất kỳ trong vòng này (đổi tên bộ phận, sắp xếp, sửa khuôn, lưu trữ, hoàn tác, khôi phục, xoá vĩnh viễn — cho cả bộ phận lẫn khuôn; đóng, mở lại, đánh dấu bậc), When máy chủ từ chối, Then màn giữ trạng thái trước thao tác, hộp thoại sửa còn mở và giữ mọi giá trị đã nhập, và thông điệp máy chủ trả hiện ra; When bấm lần nữa trong lúc đang chờ, Then chỉ một lời gọi được gửi.
- AC-15: Given dữ liệu thật trên bàn đo, When chụp ở khổ 1440 và 768: menu «…» của một bộ phận và một khuôn, hộp thoại Soạn khuôn ở chế độ sửa, mục «Đã lưu trữ» mở, màn của người vai trò thành viên, hồ sơ kế hoạch đã đóng, và ô bậc đang mở lịch, Then nhìn thấy trên ảnh đúng các trạng thái đó và ở khổ 768 không có gì tràn ngang.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset entity-feature), bốn trục:

- Trục đối tượng: bộ phận | khuôn | kế hoạch | ghi danh [thước CE: bốn bảng của Điều phối trong `packages/db/prisma/schema.prisma` — SUY-TỪ-REPO]
- Trục vòng đời: sửa | sắp thứ tự | lưu trữ + hoàn tác | khôi phục | xoá vĩnh viễn | đóng/mở lại | đánh dấu bậc [thước CE: khuôn «lưu trữ trước, xoá vĩnh viễn sau» của `docs/api.md` + thủ tục có sẵn trong `onboarding.router.ts`; NGÀNH: HubSpot pipeline/stage, Attio lists, Linear archive]
- Trục vai trò: quản trị/chủ | thành viên [thước CE: `WORKSPACE_ROLES` trong `packages/auth/src/roles.ts`]
- Trục kết quả: thành công | bị chặn vì đang dùng | bị chặn vì quyền | máy chủ từ chối/lỗi mạng | đầu vào sai kiểu

Core (vào tiêu chí): AC-1..AC-15. Cross-cutting áp mọi ô: lỗi giữ trạng thái + một lời gọi mỗi cú bấm (AC-14); quyền (AC-9).

Later (ngoài phạm vi, xem Out of scope): sửa bước của kế hoạch đang chạy · sửa người cầm trịch/ngày bắt đầu · nhật ký thay đổi · thao tác hàng loạt (lưu trữ nhiều bộ phận một lúc) · chuyển giao kế hoạch khi người cầm trịch nghỉ việc.

Never: xoá vĩnh viễn thứ đã từng dùng — lịch sử kế hoạch trỏ tới nó; trộn đang dùng và đã lưu trữ trong một danh sách — trái `docs/api.md`.

[GIẢ ĐỊNH] Thành viên được đóng/mở lại kế hoạch của người khác — chưa có luật sở hữu kế hoạch; gạch tại Cổng Phạm vi nếu sai.

## Out of scope

- Cấu trúc bộ phận → phòng ban — ô cơ hội `cau-truc-to-chuc`.
- Sửa người cầm trịch hay ngày bắt đầu của kế hoạch — cần thủ tục máy chủ mới.
- Sửa các bước của một kế hoạch đang chạy.
- Nhật ký ai đổi gì; thao tác hàng loạt.
- «Loại đối tác» của khuôn lấy từ trường chọn của Công ty.
- Phân quyền cho Cài đặt › Trường — ô `chi-quan-tri-sua-duoc-truong`.

## Notes

- `canManageOnboarding` là hàm mới trong `@crm/auth` (đường T3), theo khuôn `canManageCurrency`.
- Luồng đồng bộ từ nền tảng (`onboarding-ingest.service.ts`) ghi ghi danh bằng đường riêng — AC-13 không chạm nó.

Known limits — chấp nhận tại Cổng Bằng chứng 2026-09-22 (Phan Le Manh), từ mục ngoài hợp đồng của S4:

- Ngoài-1: kiểm quyền quản trị đặt ở router (`yeuCauQuanTri(ctx.user.id)` trước lời gọi service), không ở trong service như khuôn `canManageCurrency`; một lối gọi service khác sau này có thể bỏ sót bước kiểm quyền.
- Ngoài-2: làm mới truy vấn sau thao tác dùng một hàm cục bộ (`lam-moi.ts`) và các danh sách khoá rải ở chỗ gọi, không đi qua `useCrmCache`; đánh dấu bậc chưa làm mới bảng cột và danh mục.
- Ngoài-4: kiểu hàng `HangBoPhan`, `HangKhuon`, `HangGhiDanh` viết tay cạnh các `select` của Prisma thay vì suy ra bằng `GetPayload`; thêm trường vào `select` mà quên kiểu thì trường bị bỏ âm thầm.
- Ngoài-6: phép đo E6 dùng một câu lỗi tự đặt cho bản giả, không phải câu thật của máy chủ; màn hiện sai câu máy chủ trả thì E6 không bắt được.
- Ngoài-7: ô «hoàn tác bộ phận/khuôn (b)» của E25 khẳng định chỉ một lời gọi mà không có đối chứng rằng cú bấm thứ hai thực sự đã xảy ra.
- Ngoài-8: ô sai dạng của trường `at` trong E22 kiểm «thông điệp chứa tên trường» bằng `includes("at")`, điều mà mọi lỗi ngày đều thoả.

Mở hợp đồng mới (Ngoài-3, Ngoài-5 — cùng một lỗi): xoá vĩnh viễn một bộ phận chỉ còn trong khuôn đã lưu trữ làm khuôn đó không bao giờ khôi phục được; ô cơ hội `khuon-mat-bo-phan`.
