---
schema_version: 1
feature: Chủ kho chọn OneHub Platform hay một sản phẩm khác ngay trên trang Lộ trình của OneHub Center và đọc lộ trình, tiến độ, hồ sơ của sản phẩm đó như của CRM
slug: lo-trinh-nhieu-san-pham
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: verified
approved_by: Manh Phan
approved_at: 2026-10-20
design_doc: docs/superpowers/specs/2026-10-20-lo-trinh-nhieu-san-pham-design.md
---

# Acceptance Contract: lo-trinh-nhieu-san-pham

## Context

Trang Lộ trình chỉ đọc được CRM: bản chụp ghim nguồn `crm`, và đường duy nhất đưa lộ trình vào là Actions của chính kho
CRM đẩy bằng khoá của một người. Vòng này thêm danh bạ sản phẩm do quản trị khai ở Cài đặt, một ứng dụng GitHub chỉ đọc
mà tác nhân dùng để lấy `LO-TRINH.html` của từng kho mỗi khi nhánh chính đổi, bộ chọn sản phẩm trên trang Lộ trình và
quyền xem theo sản phẩm. CRM giữ nguyên là mục cố định khai trong mã. Phủ L2–L5 của bản phạm vi 14/10.

Source input: hàng LT3 `docs/plan/lo-trinh-okr.json` · `_acceptance/lo-trinh-nhieu-san-pham/opportunity.md` (Cổng Đáng:
build, Phan Le Manh 19/10) · `docs/plan/pham-vi-vong-tin-hieu-1410.md` (L2–L5) · thiết kế
`docs/superpowers/specs/2026-10-20-lo-trinh-nhieu-san-pham-design.md`.

## Criteria

- AC-1: Given quản trị đã khai một sản phẩm (tên, kho `owner/repo`, nhánh, đường tệp) và ứng dụng GitHub đã cài vào kho đó (GitHub giả theo đúng hợp đồng REST thật, phục vụ `LO-TRINH.html` thật của kho kit), When nhịp điều phối kế tiếp chạy, Then CRM giữ đúng một bản chụp cho sản phẩm mang sha và giờ commit của đầu nhánh cùng nguyên khối dữ liệu, Cài đặt › Sản phẩm hiện trạng thái «đã lấy» cùng giờ lấy, và chủ kho chọn sản phẩm ấy trên trang Lộ trình thì thấy mọi lộ trình, tiến độ, mốc và ngăn hồ sơ của khối — đúng những gì trang hiện cho cùng khối khi khối là của CRM. (cross-layer)
- AC-2: Given một sản phẩm đã có bản chụp, When đầu nhánh đổi sang commit mới, Then bản chụp mới thay bản cũ ở nhịp kiểm kế tiếp; When đầu nhánh đứng yên, Then nhịp không tải lại tệp (không lời gọi tải nội dung nào) mà vẫn ghi giờ kiểm; When sản phẩm vừa được kiểm chưa tới nhịp kiểm, Then nhịp không gọi GitHub cho nó; và một nhịp không lấy quá trần số sản phẩm đã khai trong cấu hình của khu.
- AC-3: Given mỗi ca hỏng — máy chủ tác nhân thiếu biến của ứng dụng GitHub, ứng dụng chưa cài vào kho, kho hay nhánh không có, tệp không có, tệp không mang khối hay khối không qua khuôn lộ trình, tệp quá 2 MB, GitHub trả lỗi máy chủ hay hết hạn mức — When nhịp lấy sản phẩm đó, Then bản chụp đang lưu không đổi, sản phẩm mang đúng một trạng thái gọi đúng chỗ hỏng và Cài đặt › Sản phẩm hiện câu cho người ứng với trạng thái ấy, nhịp điều phối không ném, sản phẩm khác trong cùng nhịp vẫn được lấy, và trang Lộ trình của CRM y như hôm nay; sản phẩm đã có bản chụp mà lần lấy gần nhất hỏng thì trang Lộ trình vẫn hiện bản chụp ấy với dòng giờ lấy của bản đang hiện, kèm một dòng nói lần lấy gần nhất hỏng vì sao.
- AC-4: Given sản phẩm P cấp cho thành viên A theo cách chốt ở Cổng Phạm vi (Hỏi-1), When chủ, quản trị, A, thành viên B không được cấp và người chỉ OKR mở trang Lộ trình — kể cả bằng đường dẫn gõ tay mang `?san-pham=` của P — Then chỉ chủ, quản trị và A thấy P trong bộ chọn và đọc được lộ trình của P — A đọc P mà không có khối số liệu chủ kho, đúng như thành viên đọc CRM hôm nay; B và người chỉ OKR không thấy P ở bộ chọn, đường dẫn gõ tay cho họ trang CRM mà không lộ tên P, và thủ tục đọc danh bạ ở máy chủ không trả P cho họ. CRM vẫn hiện cho mọi người như hôm nay. (cross-layer)
- AC-5: Given danh bạ sản phẩm, When chủ hay quản trị thêm, sửa hay cấp quyền xem, Then thay đổi được lưu và hiện lại ngay; When thành viên mở Cài đặt › Sản phẩm, Then họ thấy danh sách và trạng thái, mọi điều khiển khoá cùng một dòng nói vì sao, và thủ tục ghi ở máy chủ từ chối họ; khai sai (kho không đúng dạng `owner/repo`, nhánh rỗng, đường tệp có `..` hay bắt đầu bằng `/`, tên rỗng, mã trùng hay mã `crm`) bị từ chối ở cả trình duyệt lẫn máy chủ với lời nói đúng ô; CRM là dòng cố định không sửa, không dọn; và sửa kho, nhánh hay đường tệp đổi sản phẩm theo cách chốt ở Cổng Phạm vi (Hỏi-3; khuyến nghị: bản chụp cũ vẫn hiện kèm dòng «nguồn vừa đổi» tới khi nguồn mới lấy được, lần lấy đầu của nguồn mới thay hẳn bản cũ kể cả khi commit của nó cũ hơn). (cross-layer)
- AC-6: Given một sản phẩm, When quản trị dọn nó theo ba câu chốt ở Cổng Phạm vi (Hỏi-2), Then cách dọn đúng câu trả lời: sản phẩm chưa có lịch sử thì Xoá (hỏi lại một lần); đã có lịch sử thì Lưu trữ có Hoàn tác, Khôi phục và Xoá vĩnh viễn từ mục «Đã lưu trữ», máy chủ từ chối Xoá vĩnh viễn một sản phẩm chưa lưu trữ, Xoá vĩnh viễn mất cả bản chụp và người xem; sản phẩm đã lưu trữ biến khỏi bộ chọn và nhịp không lấy nó nữa. (cross-layer)
- AC-7: Given khối của một sản phẩm là khuôn bản 1, bản 2 chưa mang mô hình hiển thị, hay bản mới hơn bộ đọc, When người có quyền mở sản phẩm đó, Then tác nhân vẫn lấy và ghi bản chụp cho cả ba đời khuôn, trang hiện phần đọc được (như khối cùng đời của CRM) và một dòng nói sản phẩm đang ở khuôn bản n — cũ hay mới hơn trang; Cài đặt › Sản phẩm hiện bản khuôn của từng sản phẩm; và khối mang `khuon` khác `lo-trinh-du-lieu` bị từ chối là khối hỏng (AC-3), không ghi bản chụp.
- AC-8: Given người xem ở 375 px và 1280 px, tiếng Việt và tiếng Anh, nền sáng và tối, When họ mở trang Lộ trình thấy từ hai sản phẩm và mở Cài đặt › Sản phẩm, Then bộ chọn chỉ hiện khi thấy từ hai sản phẩm, chọn sản phẩm ghi lên đường dẫn và mở lại đường dẫn giữ sản phẩm, dòng giờ lấy nói kho và nhánh của sản phẩm, liên kết tìm PR của số liệu chủ kho giới hạn trong kho của sản phẩm, tên sản phẩm và dữ liệu lộ trình không bị dịch, không màn nào cuộn ngang, và trạng thái lấy ở Cài đặt đọc được bằng chữ chứ không chỉ bằng màu. (cross-layer)
- AC-9: Given tác nhân lấy lộ trình bằng ứng dụng GitHub, When nó xin quyền đọc một kho, Then token xin đúng kho đã khai với đúng quyền `contents: read` và `metadata: read`, JWT của ứng dụng sống không quá 10 phút, khoá riêng chỉ được đọc trong `apps/agent` và không vào nhật ký, bảng nào hay bản chụp nào, và không đường nào trong kho đọc lộ trình sản phẩm bằng khoá cá nhân.
- AC-10: Given danh bạ có sản phẩm đã khai, When chủ kho chạy lệnh đo, Then lệnh in mỗi sản phẩm một dòng — giờ khai, giờ cài ứng dụng, giờ bản chụp đầu, độ trễ tính từ mốc muộn hơn của khai và cài, cờ khi quá một ngày hay chưa có bản chụp — và một dòng kết luận đạt hay không đạt theo ngưỡng của Cổng Đáng; lệnh từ chối chạy khi không đọc được danh bạ thay vì in «đạt».

## Coverage

- Ngữ cảnh: chân sản phẩm [SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts] [SUY-TỪ-REPO: apps/app/lib/lo-trinh/doc-trang.ts] [SUY-TỪ-REPO: docs/plan/pham-vi-vong-tin-hieu-1410.md] · chân ngành [NGÀNH: Backstage software catalog — thực thể đăng ký bằng tệp trong kho, ứng dụng GitHub, vòng làm mới định kỳ, lỗi hiện trên từng thực thể] [NGÀNH: GitHub Apps — `contents: read`, token cài đặt một giờ, thu hẹp theo kho].
- Trục A — vòng đời mục danh bạ: khai | sửa thông tin | sửa nguồn | cấp quyền xem | dọn | CRM cố định [thước CE: `docs/vong-doi.md`; Backstage register/unregister].
- Trục B — người × việc: chủ | quản trị | thành viên được cấp | thành viên không cấp | chỉ OKR × xem trang | khai-sửa | cấp quyền [thước CE: `WORKSPACE_ROLES`].
- Trục C — trạng thái nguồn: chưa cấu hình máy chủ | chưa cài | kho/nhánh không có | tệp không có | khối hỏng | khuôn cũ | khuôn mới hơn | quá trần | GitHub hỏng | nhánh đứng yên | nhánh đổi | nhánh lùi [thước CE: mã lỗi REST của GitHub; AC-3..6 của `lo-trinh-doc-ban-chup`].
- Trục D — mặt đọc: trang Lộ trình | Cài đặt › Sản phẩm | lệnh đo × 375/1280 × vi/en × sáng/tối.
- Core → AC: lấy lần đầu và đọc đủ (AC-1) · nhịp (AC-2) · ca hỏng (AC-3) · quyền xem (AC-4) · danh bạ chỉ quản trị và sửa nguồn (AC-5) · dọn (AC-6) · nhiều khuôn (AC-7) · màn (AC-8) · khoá chỉ đọc (AC-9) · đường đo (AC-10).
- Ô «nhánh lùi» rơi vào Out of scope (cùng giới hạn của hàm ghi một chiều đã khai ở LT1c); ô «khoá máy, chưa đăng nhập» phủ bởi luật proxy hiện có, không thêm AC.

## Đường đo

- Thước: kho thứ hai hiện đủ trên trang trong ngày cài · số từ: `SanPhamLoTrinh` (`taoLuc`, `caiLuc` đọc từ GitHub, `layDauLuc`) và bản chụp `BanChupLoTrinh` của sản phẩm, in bằng `bun run lo-trinh:do-san-pham` · bảo đảm bởi: AC-10 (lệnh), AC-1 (bản chụp đủ khối), AC-3 (trạng thái khi chưa lấy được)
- Thước: người không có quyền với sản phẩm không thấy nó · số từ: hàm quyền `sanPhamXemDuoc` dùng chung cho trang, thủ tục và lệnh đo; sau khi cài đo bằng phiên nghiệm thu (đăng nhập bằng một thành viên chưa được cấp) · bảo đảm bởi: AC-4

## Out of scope

- Webhook đẩy khi nhánh đổi — nhịp kiểm 5 phút thay; mở lại khi cần độ trễ dưới một phút.
- Chuyển chính CRM sang ứng dụng GitHub — theo khuyến nghị của Hỏi-4: CRM giữ đường Actions đẩy đã ký (LT1c, LT1d) tới khi cửa đo 14 ngày của LT1d đọc xong 30/10, rồi chuyển ở hàng riêng. Chủ kho chọn chuyển ngay thì mục này thành một AC.
- Nút «Lấy lại ngay» ở Cài đặt — nhịp sau tự lấy.
- Cấp quyền xem theo phòng ban hay nhóm.
- Lịch sử bản chụp của sản phẩm — một hàng mỗi nguồn như hôm nay.
- Nhánh lùi (force-push về commit cũ hơn): hàm ghi một chiều giữ bản mới hơn, như LT1c.
- Tín hiệu nhiều sản phẩm (L6) — hàng riêng.
- Ghi bất cứ gì vào kho sản phẩm; đọc thân hồ sơ đầy đủ từ kho (trang chỉ đọc phần tóm tắt trong khối).
- Tạo ứng dụng GitHub thật, đặt biến trên Vercel, cài ứng dụng vào kho kit — việc vận hành của chủ kho sau khi gộp («Ra khỏi kho» của PR).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bốn câu chờ chủ kho chốt ở Cổng Phạm vi (sổ quyết định): Hỏi-1 cách cấp quyền xem (AC-4), Hỏi-2 ba câu vòng đời của `docs/vong-doi.md` (AC-6), Hỏi-3 sửa nguồn giữ hay xoá bản chụp cũ (AC-5), Hỏi-4 CRM có chuyển sang ứng dụng GitHub trong vòng này (Out of scope). Máy soạn theo khuyến nghị; trả lời khác thì AC liên quan viết lại trước khi duyệt.
- GitHub giả (`scripts/lo-trinh-san-pham/github-gia.ts`) đi đúng năm đường REST thật mà tác nhân gọi, đúng hình JSON và mã lỗi của GitHub; bài kiểm, phép đo màn và bản demo local chạy trên nó. Ứng dụng thật chỉ có sau khi chủ kho tạo.
- Biến mới (`GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_API_URL` — chỉ ghi đè ngoài production) khai ở `.env.example`, chỉ tác nhân đọc.
