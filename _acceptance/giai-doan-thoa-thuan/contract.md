---
schema_version: 1
feature: Quản trị viên tự cấu hình giai đoạn thoả thuận hợp tác trong Cài đặt, thay enum DealStage cứng
slug: giai-doan-thoa-thuan
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: verified
design_doc: docs/superpowers/specs/2026-09-29-giai-doan-thoa-thuan-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-29
---

# Acceptance Contract: giai-doan-thoa-thuan

## Context

Giai đoạn của thoả thuận hợp tác là enum Prisma bảy giá trị thừa kế từ phễu bán
phần mềm của kho gốc; `CONTEXT.md` ghi mục này «chưa chốt nghĩa». Vòng này thay
enum bằng bảng giai đoạn mà owner và admin tự thêm, đổi tên, sắp xếp và xoá ở
Cài đặt › Giai đoạn thoả thuận. Mỗi giai đoạn thuộc một trong ba loại — Đang mở ·
Chốt được · Không thành — và mọi hành vi (đóng, bắt lý do, tỷ lệ chốt, chỉ số
OKR, bộ lọc của agent) dựa vào loại, không vào tên. Bộ ban đầu là đúng bảy bước
cũ, id giữ nguyên chuỗi enum, nên không thoả thuận và dòng lịch sử nào đổi.

Source input: prompt của chủ kho 2026-09-29 («Làm hướng 3, cho quản trị viên tự
cấu hình») + bốn câu trả lời ở brainstorm (một bộ chung · giữ 7 bước cũ · xoá thì
chuyển sang bước cùng loại · ba loại) + duyệt thiết kế A.

## Criteria

- AC-1: Given cơ sở dữ liệu ở `migration` ngay trước vòng này, có thoả thuận ở cả bảy giai đoạn cũ (kể cả thoả thuận đã lưu trữ) và các dòng lịch sử `STAGE_CHANGE`, When chạy `migration` của vòng này, Then có đúng bảy giai đoạn với id bằng chuỗi enum cũ, nhãn bằng nhãn đang hiện, loại (bốn bước đầu Đang mở · `CLOSED_WON` Chốt được · `CLOSED_LOST` và `UNQUALIFIED_TO_BUY` Không thành) và vị trí theo thứ tự cũ; And mọi thoả thuận trỏ đúng giai đoạn nó đang ở, `closedAt` và `closedReason` không đổi; And `meta` của lịch sử không bị viết lại; And kiểu enum cũ không còn trong cơ sở dữ liệu. (cross-layer)
- AC-2: Given owner hoặc admin, When thêm một giai đoạn vào một loại, Then giai đoạn đứng cuối loại đó, có trong danh sách giai đoạn, thành một cột của bảng cột và một mục của menu giai đoạn theo đúng vị trí; And chuyển một thoả thuận vào đó hành xử theo loại của nó (AC-9). (cross-layer)
- AC-3: Given một giai đoạn có thoả thuận và có lịch sử chuyển vào nó, When đổi tên, Then nhãn mới hiện ở danh sách giai đoạn, bảng cột, menu giai đoạn, và ở CẢ những dòng lịch sử ghi trước khi đổi tên. (cross-layer)
- AC-4: Given một loại có từ hai giai đoạn, When gửi thứ tự mới là đủ và đúng các giai đoạn sống của loại đó, Then thứ tự cột của bảng cột và thứ tự bước của thanh tiến trình đổi theo; When danh sách gửi thiếu, thừa, trùng hoặc lẫn loại khác, Then máy chủ từ chối và thứ tự không đổi.
- AC-5: Given một giai đoạn không còn thoả thuận nào, When xoá, Then nó biến khỏi danh sách giai đoạn, bảng cột và menu giai đoạn; And tạo, chuyển từng cái hay chuyển hàng loạt thoả thuận vào nó đều bị từ chối; And dòng lịch sử cũ nhắc tới nó vẫn hiện đúng nhãn của nó trên màn, không hiện id. (cross-layer)
- AC-6: Given một giai đoạn còn N thoả thuận (gồm cả thoả thuận đã lưu trữ), Then danh sách giai đoạn báo đúng N — kể cả khi cả N đều đã lưu trữ — và nút Xoá mở hộp thoại chọn đích chứ không mở hộp hỏi lại; When xoá mà không chọn đích, hoặc chọn đích khác loại, chính nó, hay giai đoạn đã xoá, Then máy chủ từ chối và không gì thay đổi; When chọn một đích sống cùng loại, Then cả N thoả thuận sang đích, mỗi thoả thuận có đúng một dòng lịch sử `STAGE_CHANGE` và `stageChangedAt` mới, `closedAt` và `closedReason` không đổi, mỗi thoả thuận phát đúng một sự kiện `deal.stage.changed` từ nguồn sang đích, rồi giai đoạn nguồn mới bị xoá — tất cả hoặc không gì cả, và lượt thất bại không phát sự kiện nào. (cross-layer)
- AC-7: Given danh sách giai đoạn, When xoá giai đoạn sống cuối cùng của một loại, đặt nhãn rỗng hoặc dài hơn 40 ký tự sau khi cắt khoảng trắng, đặt nhãn trùng một giai đoạn sống khác (không phân biệt hoa thường), hoặc thêm khi đã đủ 20 giai đoạn sống, Then máy chủ từ chối với lời báo gọi đúng lý do và không gì thay đổi; And không thủ tục nào đổi được loại của một giai đoạn.
- AC-8: Given người có vai member hoặc okr, When gọi bất kỳ thủ tục ghi nào của giai đoạn, Then bị từ chối `FORBIDDEN`; And vai okr không đọc được danh sách giai đoạn; And trang Cài đặt › Giai đoạn thoả thuận hiện danh sách cho member với mọi điều khiển bị khoá và một dòng nói vì sao. (cross-layer)
- AC-9: Given giai đoạn thuộc từng loại, gồm cả giai đoạn mới thêm, When chuyển một thoả thuận — từng cái hay hàng loạt — vào loại Chốt được hoặc Không thành, Then `closedAt` được đóng dấu, và loại Không thành bắt lý do; When chuyển về loại Đang mở, Then `closedAt` và `closedReason` được xoá; And thoả thuận tạo mới không chọn giai đoạn thì vào giai đoạn Đang mở đứng đầu. (cross-layer)
- AC-10: Given thoả thuận đã đóng trong khung tính tỷ lệ ở mọi giai đoạn, gồm giai đoạn mới thêm và `UNQUALIFIED_TO_BUY`, When mở Tổng quan, Then tỷ lệ chốt bằng số thoả thuận loại Chốt được chia cho tổng loại Chốt được và Không thành; And phần «Đang mở» liệt kê mọi giai đoạn Đang mở theo vị trí với số đếm và giá trị của chúng.
- AC-11: Given thoả thuận chốt được ở hai giai đoạn Chốt được khác nhau, When đọc chỉ số OKR «thoả thuận chốt được» cho kỳ chứa chúng, Then chỉ số đếm cả hai; And dòng telemetry `deals_by_stage` đếm theo id giai đoạn và không chứa nhãn nào.
- AC-12: Given giai đoạn mới thêm ở cả ba loại và thoả thuận ở đó, When agent gọi `list_deals` với trạng thái open, won, lost, Then mỗi thoả thuận rơi đúng nhóm theo loại giai đoạn của nó; And lịch sử thoả thuận và phần mở đầu hội thoại của agent in nhãn giai đoạn, không in id. (cross-layer)
- AC-13: Given trang Cài đặt › Giai đoạn thoả thuận ở khổ 320 · 375 · 768 · 1024 · 1440, tiếng Việt và tiếng Anh, When mở trang, thêm một giai đoạn, và xoá một giai đoạn còn thoả thuận qua hộp thoại chọn đích, Then trang có ba thẻ theo loại, không tràn ngang, nhãn giai đoạn mang `translate="no"`, giai đoạn mới hiện ở bảng cột của màn Thoả thuận, và thoả thuận của giai đoạn đã xoá nằm ở giai đoạn đích; And lúc tải có khung xương, lúc hỏng có lời báo và nút «Thử lại». (cross-layer)
- AC-14: Given mã sản phẩm trong `apps/api/src`, `apps/agent/agent`, `apps/app/app`, `apps/app/components`, `apps/app/lib` và `packages/db/src` (trừ `seed` và bản mẫu dưới `apps/app/app/proto`), When quét, Then không chỗ nào nhắc bảy id giai đoạn cũ hay import `GIAI_DOAN_GOC`; And cổng thiết kế tĩnh trên các tệp giao diện vòng này chạm không có vi phạm.

## Coverage

Chân sản phẩm: Product Context dựng từ repo — thoả thuận hợp tác là thực thể của mạng lưới, giai đoạn «chưa chốt nghĩa» [SUY-TỪ-REPO: CONTEXT.md]; luật nhóm và nơi dùng [SUY-TỪ-REPO: packages/db/src/deal-stage.ts, apps/app/lib/deal-stage.ts, apps/api/src/dashboard/dashboard.service.ts, packages/db/src/okr-chi-so.ts, apps/agent/agent/lib/lookup.ts]; vai và phạm vi [SUY-TỪ-REPO: docs/api.md]; khuôn trang Cài đặt [SUY-TỪ-REPO: docs/settings.md]. Chân ngành: [NGÀNH: Salesforce Opportunity Stage — mỗi giai đoạn mang kiểu Open / Closed Won / Closed Lost, báo cáo đọc kiểu chứ không đọc tên], [NGÀNH: Pipedrive pipeline settings — xoá giai đoạn còn deal phải chuyển deal sang giai đoạn khác], [NGÀNH: HubSpot deal pipelines — thêm, đổi tên, sắp xếp giai đoạn trong cài đặt; giai đoạn đóng thắng/thua là loại riêng].

- Trục vòng đời giai đoạn: khởi tạo từ `migration` (AC-1) | thêm (AC-2) | đổi tên (AC-3) | sắp xếp (AC-4) | xoá khi trống (AC-5) | xoá khi còn thoả thuận (AC-6) | khôi phục (Later) | đổi loại (Never) [thước CE: năm thủ tục của router + Salesforce/Pipedrive/HubSpot]
- Trục người × quyền: owner/admin ghi (AC-2…AC-7) | member đọc, khoá (AC-8) | okr không đọc (AC-8) | agent đọc theo loại (AC-12) [thước CE: `docDuocPhamVi` và `canManageSettings` trong `docs/api.md`]
- Trục bên tiêu thụ: màn Thoả thuận — bảng cột, menu, thanh tiến trình, tạo mới (AC-2, AC-4, AC-9) | lịch sử (AC-3, AC-5) | Tổng quan (AC-10) | OKR và telemetry (AC-11) | agent (AC-12) | sự kiện `deal.stage.changed` (AC-6) [thước CE: bản đồ nơi dùng của design doc, rút bằng grep toàn kho 2026-09-29]
- Trục ràng buộc: ≥1 mỗi loại · nhãn rỗng/dài · nhãn trùng · trần · danh sách sắp cũ hoặc lẫn loại · đích xoá sai (AC-4, AC-6, AC-7) [thước CE: bảng bất biến của design doc]
- Cross-cutting: khổ 320–1440 và vi/en (AC-13) · `translate="no"` cho nhãn người nhập (AC-13) · trạng thái tải/lỗi/không quyền (AC-8, AC-13) · không rẽ nhánh theo tên (AC-14). Dữ liệu cá nhân: giai đoạn không chứa dữ liệu cá nhân — không áp.
- [GIẢ ĐỊNH] Hai quản trị viên sửa cùng lúc: bất biến chạy trong transaction có khoá hàng nên dữ liệu không vỡ; màn hình của người thứ hai chỉ thấy lời từ chối và tự làm mới — không có AC riêng.
- [GIẢ ĐỊNH] Trần 20 giai đoạn và 40 ký tự là con số đặt ra, không đo từ dữ liệu; nằm trong `GIAI_DOAN` để chỉnh.
- Later/Never: xem Out of scope và sổ quyết định.

## Out of scope

- Nhiều bộ giai đoạn theo loại hợp tác (công ty / cá nhân).
- Tự chọn màu cho giai đoạn — màu suy từ loại và vị trí.
- Xác suất, giá trị có trọng số hay dự báo theo giai đoạn.
- Đổi loại của một giai đoạn đã tạo.
- Khôi phục giai đoạn đã xoá.
- Dịch hay đổi tên bảy nhãn cũ — quản trị viên tự làm sau khi lên.
- Nhật ký ai đổi cấu hình giai đoạn lúc nào.
- Xoá hẳn một giai đoạn khỏi cơ sở dữ liệu.

## Notes

- Hạng T3: chạm `packages/db/prisma`. Merge vào `onehub` là `migrate deploy` trên production; `migration` chỉ đổi kiểu cột trên chuỗi đã có, không mất dữ liệu, nhưng không có đường đảo ngược tự động.
- Mốc `migration` `20261006010000`; kiểm lại `origin/onehub` ngay trước merge.
- Tỷ lệ chốt ở Tổng quan có thể giảm sau khi lên vì «Unqualified» vào mẫu số — chủ kho đã chấp nhận ở brainstorm.
- Test của các hồ sơ đã ký import `DealStage` phải sửa sang `GIAI_DOAN_GOC`; các hồ sơ đó ghim lại ở S5.
