---
schema_version: 1
feature: Cây tổ chức hai cấp dưới gốc OneHub — bộ phận chứa phòng ban — có người, có trưởng, dựng và nhập hàng loạt ở Cài đặt › Tổ chức
slug: cau-truc-to-chuc
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: draft
design_doc: docs/superpowers/specs/2026-09-24-cau-truc-to-chuc-design.md
---

# Acceptance Contract: cau-truc-to-chuc

## Context

CRM chỉ có một danh sách phẳng (`Department`) mà Điều phối 30 ngày gọi là «bộ
phận»; không ai thuộc về đâu, không đơn vị nào có trưởng. Lượt 1 của lộ trình OKR
(TC-01 … TC-04) thêm cấp bộ phận ở trên, thêm người (một phòng ban chính, phòng ban
phụ tuỳ chọn), thêm trưởng đơn vị, suy quản lý trực tiếp, và màn Cài đặt › Tổ chức để
quản trị dựng cây — tay hoặc nhập từ bảng tính. Danh sách phẳng cũ chính là cấp phòng
ban: dữ liệu và bước kế hoạch 30 ngày giữ nguyên.

Source input: câu ý định lượt 1 của `docs/plan/lo-trinh-okr.md` (dán vào vòng
2026-09-24), `opportunity.md` đã qua Cổng Đáng (build, keep, ngưỡng đã chốt), từ điển
`CONTEXT.md` (Bộ phận, Phòng ban, Đơn vị, Trưởng đơn vị — PR #110), bản mẫu
`/proto/cau-truc-to-chuc`, quyết định đổi nhãn ô «Mục tiêu» của chủ kho 2026-09-24.

## Criteria

- AC-1: Given cơ sở dữ liệu có phòng ban, khuôn kế hoạch và kế hoạch 30 ngày từ trước lượt này, When chạy `migration` của lượt này, Then mọi phòng ban cũ còn nguyên tên, thứ tự, trạng thái lưu trữ và mọi bước đã giao cho nó; And màn Tổ chức hiện chúng trong nhóm «Chưa xếp vào bộ phận»; And danh sách Điều phối 30 ngày trả đúng các kế hoạch và bước như trước `migration`. (cross-layer)
- AC-2: Given quản trị ở màn Tổ chức, When thêm, đổi tên, sắp lại một bộ phận; thêm phòng ban vào một bộ phận; chuyển một phòng ban sang bộ phận khác hoặc về «Chưa xếp vào bộ phận», Then cây sau khi tải lại phản ánh đúng từng thao tác; And tên trống, dài quá 80 ký tự, hoặc trùng tên với đơn vị chưa lưu trữ cùng cấp (không phân biệt hoa thường) bị từ chối bằng câu lỗi dưới ô và không ghi gì. (cross-layer)
- AC-3: Given một phòng ban còn là phòng ban chính của ít nhất một thành viên còn hiệu lực, hoặc một bộ phận còn phòng ban chưa lưu trữ, When quản trị lưu trữ nó, Then máy chủ từ chối với câu nêu số người hoặc số phòng ban còn lại và cây không đổi; And đơn vị đã hết người hoặc hết phòng ban thì lưu trữ được, biến khỏi cây và khỏi mọi ô chọn, hiện ở mục «Đã lưu trữ», khôi phục thì về đúng chỗ cũ; And «Xoá hẳn» chỉ có ở đơn vị đã lưu trữ và bị từ chối khi còn bước kế hoạch, người hoặc phòng ban trỏ tới nó. (cross-layer)
- AC-4: Given một thành viên, When quản trị đặt phòng ban chính của họ, thêm hoặc bỏ phòng ban phụ, Then mỗi người có nhiều nhất một phòng ban chính — đặt phòng ban chính mới là thay phòng ban cũ; And phòng ban phụ không trùng phòng ban chính; And người hiện dưới mọi phòng ban của họ, phòng ban phụ mang nhãn «phụ»; And người chưa có phòng ban chính hiện ở nhóm «Chưa có phòng ban». (cross-layer)
- AC-5: Given một phòng ban và một bộ phận, When quản trị đặt hoặc bỏ trưởng, Then mỗi đơn vị có nhiều nhất một trưởng, trưởng phòng ban chỉ chọn được trong số người của phòng ban đó, trưởng bộ phận chọn được trong mọi thành viên còn hiệu lực; And cây hiện huy hiệu «Trưởng phòng ban» hoặc «Trưởng bộ phận» đúng người; And một thành viên thường đang làm trưởng vẫn nhận `FORBIDDEN` ở mọi thủ tục ghi của cây — làm trưởng không cho quyền quản trị. (cross-layer)
- AC-6: Given cây có trưởng phòng ban, trưởng bộ phận và ghi đè, When đọc quản lý trực tiếp của từng người, Then kết quả theo đúng thứ tự: ghi đè (người còn hiệu lực, khác chính mình) → trưởng phòng ban chính (khác chính mình) → trưởng bộ phận của phòng ban chính (khác chính mình) → không có; And hộp thoại vị trí nói rõ quản lý đang «theo trưởng phòng ban» hay «đã chọn tay», và «Về theo trưởng phòng ban» xoá ghi đè; And đổi trưởng một phòng ban thì quản lý của mọi người trong đó đổi theo, không cần sửa từng người. (cross-layer)
- AC-7: Given thành viên thường, When mở màn Tổ chức, Then thấy cây, người, trưởng và dòng độ phủ, nhưng không có nút thêm, menu đơn vị, nút nhập hay hộp thoại sửa; And mọi thủ tục ghi của cây (`org.*` ghi và `onboarding.*Department`) gọi thẳng bằng phiên của họ đều trả `FORBIDDEN`; And cùng các thủ tục đó bằng phiên quản trị thì chạy. (cross-layer)
- AC-8: Given một thành viên có phòng ban chính, làm trưởng một phòng ban và là quản lý được ghi đè của người khác, When họ bị gỡ khỏi workspace, Then họ biến khỏi cây và khỏi mọi phép đếm; And phòng ban họ làm trưởng hiện «Chưa có trưởng» và tính là chưa có trưởng; And người có ghi đè trỏ tới họ nhận quản lý theo phép suy của AC-6. (cross-layer)
- AC-9: Given quản trị dán hoặc chọn tệp `.csv` bốn cột `email · phòng ban · bộ phận · trưởng`, When bấm «Xem trước», Then máy chủ trả từng dòng hợp lệ hoặc hỏng; mỗi loại hỏng mang đúng một câu lỗi đã ghim — email không phải thành viên · email lặp trong lô · thiếu email hoặc phòng ban · phòng ban đang thuộc bộ phận khác · một phòng ban mang hai bộ phận trong lô · giá trị «trưởng» lạ · hai người cùng làm trưởng một đơn vị; And lô quá 1000 dòng bị từ chối cả lô; And tóm tắt nói số dòng hợp lệ, hỏng, số phòng ban và bộ phận sẽ tạo; And xem trước không ghi gì vào cơ sở dữ liệu. (cross-layer)
- AC-10: Given một lô đã xem trước có cả dòng hợp lệ lẫn dòng hỏng, When bấm «Ghi N dòng», Then máy chủ phân tích lại chữ gốc và ghi đúng các dòng hợp lệ trong một giao dịch — tạo đơn vị còn thiếu, đặt phòng ban chính, đặt trưởng — và kết quả khớp đúng bản xem trước; And dòng hỏng không để lại gì; And ghi lại cùng lô lần hai không tạo đơn vị trùng và cây không đổi; And lô toàn dòng hỏng thì nút ghi khoá. (cross-layer)
- AC-11: Given thành viên còn hiệu lực, người đã rời, phòng ban có và không có trưởng, phòng ban đã lưu trữ, When mở màn Tổ chức, Then dòng độ phủ nói «X/M thành viên có phòng ban chính · K phòng ban chưa có trưởng», với M = số thành viên còn hiệu lực, X = số trong họ có phòng ban chính chưa lưu trữ, K = số phòng ban chưa lưu trữ không có trưởng còn hiệu lực — bằng phép đếm độc lập trên cùng dữ liệu. (cross-layer)
- AC-12: Given màn Điều phối 30 ngày và Cài đặt › Điều phối 30 ngày, When xem bằng tiếng Việt, Then mọi chữ đang chỉ danh sách phẳng cũ đọc «phòng ban» (cột, bộ lọc «Phòng ban đang cầm», chia cột, khuôn kế hoạch) và không còn chữ «bộ phận» nào chỉ cấp đó; And Cài đặt › Điều phối 30 ngày không còn danh sách phòng ban mà trỏ sang Cài đặt › Tổ chức; And bộ lọc mới «Bộ phận» giữ đúng các kế hoạch có phòng ban đang cầm thuộc bộ phận đã chọn, số đếm của bộ lọc bằng số dòng trả về. (cross-layer)
- AC-13: Given sheet kế hoạch 30 ngày, When mở bằng tiếng Việt và tiếng Anh, Then ô đang hiện số ngày mang nhãn «Thời lượng» / «Duration», và sheet không còn chữ «Mục tiêu» / «Target».
- AC-14: Given màn Tổ chức có dữ liệu, hộp thoại vị trí và hộp thoại nhập ở bước xem trước, ở khổ 320 · 375 · 768 · 1024 · 1440, tiếng Việt và tiếng Anh, When mở trên trình duyệt thật của cây đang xét, Then trang không tràn ngang, dòng độ phủ, tên bộ phận, tên phòng ban và huy hiệu trưởng đều thấy; And tên người, tên đơn vị, email mang `translate="no"`; And đi hết cây bằng Tab và Enter mở được một phòng ban và mở hộp thoại của một người.
- AC-15: Given các tệp giao diện lượt này chạm tới, When chạy cổng thiết kế tĩnh, Then không có vi phạm; And không tệp nào trong `packages/ui` bị sửa để phục vụ riêng màn này ngoài thành phần dùng chung.

## Coverage

Chân sản phẩm: dựng từ repo — `CONTEXT.md` mục Bộ phận, Phòng ban, Đơn vị, Trưởng
đơn vị [SUY-TỪ-REPO: CONTEXT.md]; bảng `Department`, `Member`, bước kế hoạch 30 ngày
giao cho phòng ban [SUY-TỪ-REPO: packages/db/prisma/schema.prisma]; vai và vị từ quyền
[SUY-TỪ-REPO: packages/auth/src/organization.ts]; phạm vi lượt 1 [SUY-TỪ-REPO:
docs/plan/lo-trinh-okr.md]. Chân ngành: [NGÀNH: HubSpot Teams — một «main team» và các
«additional teams» cho mỗi người dùng; knowledge.hubspot.com/user-management/create-and-manage-teams],
[NGÀNH: BambooHR — thông tin công việc có Division, Department, Reports To; help.bamboohr.com].

- Trục vòng đời đơn vị: tạo | đổi tên | sắp | chuyển cấp | lưu trữ–khôi phục | xoá hẳn [thước CE: preset entity-feature + thao tác của danh sách phòng ban cũ `danh-sach-bo-phan.tsx`] → AC-2, AC-3
- Trục vòng đời người trong cây: phòng ban chính | phòng ban phụ | trưởng | ghi đè quản lý | nhập hàng loạt | rời workspace [thước CE: HubSpot main/additional team, BambooHR Reports To, preset «chuyển giao khi nghỉ việc»] → AC-4, AC-5, AC-6, AC-8, AC-9, AC-10
- Trục vai: quản trị | thành viên thường (kể cả đang làm trưởng) | người đã rời [thước CE: `canManage*` của `@crm/auth`, `AuthMiddleware` đọc `member` mỗi lần gọi] → AC-5, AC-7, AC-8
- Trục trạng thái dữ liệu: rỗng | dữ liệu cũ chưa xếp | bình thường | thiếu trưởng hoặc trưởng đã rời | lô nhập lỗi [thước CE: bảng trạng thái của design doc] → AC-1, AC-8, AC-9, AC-11
- Trục đầu ra (ai đọc cây): màn Tổ chức (dòng độ phủ) | Điều phối 30 ngày | sheet kế hoạch | OKR lượt 2–5 [thước CE: lộ trình OKR §5] → AC-11, AC-12, AC-13; OKR đọc cây là việc của lượt 3.
- Cross-cutting: khổ 320–1440 và vi/en (AC-14) · `translate="no"` cho tên và email (AC-14) · bàn phím (AC-14) · cổng thiết kế tĩnh (AC-15).
- Core: AC-1 … AC-15. Later/Never: xem Out of scope và sổ quyết định.
- [GIẢ ĐỊNH] Trưởng phòng ban phải là người của chính phòng ban đó (chính hoặc phụ); trưởng bộ phận thì không cần. HubSpot và BambooHR không ép điều này — đây là lựa chọn để lô nhập bốn cột tự nhất quán.
- [GIẢ ĐỊNH] Trưởng bộ phận cũng cần một phòng ban chính (phòng ban họ ngồi); không có thì họ nằm ở «Chưa có phòng ban» và kéo dòng độ phủ xuống — bản mẫu lộ ra điều này (design-pass, Nhóm 2).
- [GIẢ ĐỊNH] Nhập ghi dòng hợp lệ và bỏ dòng hỏng (không phải cả-lô-hoặc-không), vì danh sách nhân sự thật có thể có vài người chưa vào CRM; lối vào máy (`/internal/*/ingest`) thì vẫn cả-lô-hoặc-không.
- [GIẢ ĐỊNH] Cây ghép từ `Collapsible` sẵn có thay vì cài `@reui/tree` (kéo theo `@headless-tree`) — cây chỉ có hai cấp cố định; bản mẫu đề nghị quyết ở Cổng Phạm vi.
- [GIẢ ĐỊNH] Khuôn tương tác «ô tìm tự mở nhánh khớp» lấy từ block `form-9` (hàng «chờ ký» ở `opportunity.md`) — chỉ khuôn, không chép mã block.

## Đường đo

- SỐNG ≥ 90% thành viên còn hiệu lực có phòng ban chính · số từ dòng độ phủ màn Tổ chức (`org.tree`) trên production ngày 2026-10-26 · AC-11 bảo đảm con số bằng phép đếm độc lập.
- SỐNG mọi phòng ban có trưởng · cùng dòng độ phủ, vế «K phòng ban chưa có trưởng» phải bằng 0 · AC-11 (và AC-8 cho trưởng đã rời).
- CHẾT < 70% · cùng dòng độ phủ · AC-11.
- CHẾT «phải nhờ sửa cơ sở dữ liệu mới dựng được cây» · phiên nghiệm thu hỏi quản trị đã dựng cây bằng đường nào · AC-2 … AC-10 phủ mọi thao tác cần để dựng cây từ rỗng và từ dữ liệu cũ.

## Out of scope

- Cấp «nhóm» dưới phòng ban.
- Quyền theo đơn vị (trưởng sửa OKR đơn vị mình) — lượt 2–3.
- Sơ đồ tổ chức, tĩnh hay kéo/phóng to (React Flow) — bản mẫu giữ trạng thái sơ đồ tĩnh làm mẫu, không vào sản phẩm lượt này.
- Đọc tệp `.xlsx` (kho chưa có thư viện đọc bảng tính).
- Nhập tạo lời mời cho người chưa vào CRM; nhập phòng ban phụ; nhập ghi đè quản lý.
- Chặn vòng quản lý (A quản lý B, B quản lý A) khi ghi đè tay.
- Nhật ký thay đổi cây (ai chuyển ai, lúc nào).
- Cột phòng ban trên bảng Cài đặt › Thành viên.
- Đồng bộ cây từ hệ thống nhân sự (TC-07).
- Chia cột theo bộ phận trên bảng cột Điều phối 30 ngày (lọc thì có, chia cột thì không).

## Notes

- GitHub Actions đang tắt vì thanh toán (2026-09-24). Bằng chứng của hồ sơ là năm lệnh chứng chạy trên máy (`bun run test`, `check-types`, `lint`, `lint:slop`, `build`) cùng các eval của hồ sơ; Cổng Bằng chứng ghi rõ điều này.
- Không sửa §10 «Theo dõi» của `docs/plan/lo-trinh-okr.md` — phiên điều phối OKR giữ mục đó.
- Hình dạng cây (hai cấp, nhóm «Chưa xếp vào bộ phận») giữ như bản mẫu: một phiên khác dùng nó cho màn OKR «Theo đơn vị».
