---
schema_version: 1
feature: «Tôi bấm Gửi tín hiệu ở bất kỳ màn nào, kể điều mình gặp, rồi thấy nó đã vào nhóm nào, thành việc nào, đã giao chưa»
slug: gui-tin-hieu-trong-crm
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-12-gui-tin-hieu-trong-crm-design.md
---

# Acceptance Contract: gui-tin-hieu-trong-crm

## Context

Người dùng CRM — mọi phòng ban từ 14/10, phần lớn không dùng git — bấm «Gửi tín hiệu» trên thanh đầu trang ở bất kỳ
màn nào, kể điều mình gặp, rồi mở «Tín hiệu đã gửi» để xem tín hiệu của mình đang ở đâu. CRM chỉ GHI tín hiệu: nó cất
tín hiệu trong một hàng chờ của mình; đầu mỗi lượt gom, chủ kho chạy một lệnh kéo tín hiệu về git theo đúng khuôn
tín hiệu của bộ kit (lối 1, Cổng Đáng 12/10); bộ kit gom nhóm, chủ kho chọn nhóm vào bản phạm vi. Câu trạng thái sau
gom là câu kit viết trong khối dữ liệu của `LO-TRINH.html` — CRM đọc lại, không tự suy.

Source input: `_acceptance/gui-tin-hieu-trong-crm/opportunity.md` (Cổng Đáng `build` 2026-10-12, hàng LT2 của
`docs/plan/lo-trinh-okr.json`); khuôn tín hiệu: `skills/acceptance/references/tin-hieu-template.md` và
`scripts/tin-hieu.mjs` của kho kit (hàng L3, hồ sơ `cua-tin-hieu-gom-nhom`, kit main #319, mốc 2.27.0).

## Criteria

- AC-1: Given một người đã đăng nhập với bất kỳ vai nào (kể cả vai chỉ OKR), When họ đứng ở bất kỳ màn nào của ứng dụng (Tổng quan, OKR, Tài liệu, Lộ trình, Cài đặt, Thoả thuận khi vai cho phép), Then thanh đầu trang có nút «Gửi tín hiệu» (chữ ở máy tính, biểu tượng có tên đọc được ở điện thoại); bấm nút mở hộp «Gửi tín hiệu» có ô «Bạn gặp điều gì?» và dòng cho biết màn đang đứng sẽ gửi kèm; ô rỗng hoặc toàn khoảng trắng thì nút «Gửi» khoá.
- AC-2: (cross-layer) Given hộp đã có chữ, When người dùng bấm «Gửi», Then máy chủ cất đúng một tín hiệu với người gửi, phòng ban chính của họ lúc gửi (vắng khi họ chưa có phòng ban chính còn dùng), màn đang đứng chỉ gồm đường dẫn trong ứng dụng (bỏ tên không gian làm việc, phần sau `?` và `#`), tiêu đề là dòng đầu của chữ (cắt 120 ký tự) và cả đoạn khi dài hơn dòng đầu; hộp hiện biên nhận mang mã tín hiệu và liên kết «Xem tín hiệu đã gửi»; mở trang đó thấy tín hiệu nằm đầu danh sách với trạng thái «Đã nhận — chờ đội sản phẩm lấy về».
- AC-3: Given một người đã gửi đủ trần tín hiệu trong ngày giờ Việt Nam, When họ gửi thêm, Then máy chủ từ chối, không cất gì, và hộp hiện lỗi ngay dưới ô nói trần và lúc gửi lại được, chữ đã gõ còn nguyên; When chữ dài hơn trần độ dài, Then ô không nhận thêm và máy chủ cũng từ chối nếu bị gọi thẳng; When máy chủ lỗi, Then hộp nói chưa gửi được, chữ còn nguyên, bấm lại được; sang ngày mới giờ Việt Nam thì gửi lại được.
- AC-4: Given nhiều người đã gửi tín hiệu, When một người mở «Tín hiệu đã gửi» hay gọi thẳng thủ tục danh sách, Then họ chỉ thấy tín hiệu của chính mình, mới nhất trước; trang không đưa xuống trình duyệt tiêu đề hay trạng thái của tín hiệu người khác; người chưa đăng nhập mở trang được đưa về đăng nhập.
- AC-5: (cross-layer) Given một tín hiệu của chính người xem chưa được kéo về kho, When họ bấm Xoá và xác nhận trong hộp hỏi lại, Then tín hiệu mất khỏi danh sách và khỏi máy chủ, và lượt kéo về sau đó không có nó; Given tín hiệu đã được kéo về, Then dòng đó không có nút Xoá và máy chủ từ chối xoá kèm câu nói đội sản phẩm đã lấy tín hiệu về; Given tín hiệu của người khác, Then máy chủ trả như không có; điều kiện «chưa kéo về» được kiểm lại trong cùng giao dịch xoá.
- AC-6: Given khoá API của một quản trị (owner hoặc admin), When gọi thủ tục kéo về, Then máy chủ trả mọi tín hiệu còn lại xếp theo số, mỗi tín hiệu một tệp đúng khuôn tín hiệu của kit kèm tên phòng ban lúc gửi, và đóng dấu «đã kéo về» cho tín hiệu chưa dấu trong cùng giao dịch; Given khoá của một thành viên thường hay vai chỉ OKR, Then máy chủ từ chối và không đóng dấu gì.
- AC-7: Given máy chủ kho có địa chỉ và khoá của CRM, When chủ kho chạy lệnh kéo về, Then mỗi tín hiệu thành một tệp `<mã>.json` trong thư mục nguồn tín hiệu của kho; bộ đọc tín hiệu của kit (cùng hàm kiểm của kênh yêu cầu) đọc mọi tệp đó 0 lỗi; tệp không mang tên, thư, mã người dùng hay phòng ban của người gửi.
- AC-8: Given lệnh kéo về đã chạy một lần, When chạy lại, Then không tệp nào mới hay đổi byte; tín hiệu bị xoá trước khi kéo về không bao giờ thành tệp; thiếu địa chỉ hoặc khoá thì lệnh thoát với mã 2 gọi tên biến thiếu và không ghi tệp nào; một tệp đã có mà khác byte thì lệnh thoát với mã 1 gọi tên tệp và không ghi đè.
- AC-9: Given kho khai cửa tín hiệu (nguồn là thư mục kéo về, nơi gom là thư mục bản gom), When bộ vẽ lộ trình của kit (bản có cửa tín hiệu) vẽ `LO-TRINH.html` trên kho có tệp kéo về, Then khối dữ liệu mang danh sách tín hiệu với đúng mã các tệp đó, và bộ đọc trạng thái của CRM đọc ra câu trạng thái kit viết cho từng mã.
- AC-10: Given «Tín hiệu đã gửi» và bản vẽ lộ trình có danh sách tín hiệu, When người xem nhìn một dòng, Then dòng có điều đã kể, màn, lúc gửi, và trạng thái gồm một nhãn ngắn có chấm màu theo nghĩa của bảng chung (đã giao, đã có việc → xong; đang làm → đang chạy; còn lại → nháp) cộng một câu ở dòng phụ: câu kit viết nguyên văn khi mã có trong bản vẽ; «Đã nhận — chờ đội sản phẩm lấy về» khi chưa lấy về; «Đội sản phẩm đã lấy về — chờ gom nhóm» khi đã lấy về mà bản vẽ chưa có. Nhãn ngắn chỉ đặt tên cho chỗ kit đã xếp (`cho` của bản ghi, nhóm trạng thái của hàng), không tự suy trạng thái.
- AC-11: Given `LO-TRINH.html` vắng khỏi bản đang chạy, không mang khối, khối hỏng, khối không có danh sách tín hiệu, hoặc một bản ghi tín hiệu sai khuôn, When người xem mở «Tín hiệu đã gửi», Then danh sách vẫn hiện đủ tín hiệu của họ với trạng thái lúc gửi kèm một dòng báo trạng thái sau gom chưa đọc được, trang không vỡ, và nút «Gửi tín hiệu» vẫn gửi được; Given họ chưa gửi tín hiệu nào, Then trang hiện câu rỗng kèm nút gửi.
- AC-12: Given tín hiệu đã gửi trong 30 ngày qua thuộc nhiều phòng ban, When chủ kho chạy lệnh kéo về, Then dòng tổng kết in số tín hiệu mới, số đã có, số tín hiệu trong 30 ngày và số phòng ban có tín hiệu, mỗi phòng ban một dòng số đếm và một dòng riêng cho tín hiệu chưa có phòng ban — các số khớp với tín hiệu trong máy chủ.

## Coverage

- Trục A — Vòng đời một tín hiệu: gửi | cất kèm trần | xoá khi chưa kéo về | kéo về git | gom (kit, ngoài CRM) | trạng thái về người gửi | đếm cho ngưỡng [thước CE: chuỗi «tín hiệu → nhóm → hàng → hồ sơ → trạng thái» của thiết kế cửa tín hiệu ở kho kit; luật `docs/vong-doi.md`] → AC-1, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-12
- Trục B — Người × quyền: người gửi (mọi vai, kể cả chỉ OKR) | quản trị chạy kéo về | người khác | chưa đăng nhập [thước CE: bảng phạm vi router `docs/api.md`; `apps/app/lib/pham-vi-man.ts`] → AC-1, AC-4, AC-5, AC-6
- Trục C — Nguồn của trạng thái: CSDL của CRM | bản vẽ có danh sách tín hiệu | bản vẽ vắng, không khối, hỏng, không danh sách, bản ghi sai khuôn [thước CE: năm ca đọc khoan dung của LT1] → AC-9, AC-10, AC-11
- Trục D — Ca: suôn sẻ | rỗng | vượt trần | máy chủ lỗi | khoá vắng hoặc sai vai | chạy lặp | tín hiệu đã xoá [thước CE: ca của hộp «Báo sai» và trần của `tai-lieu-hoi.service.ts`] → AC-3, AC-6, AC-8, AC-11
- Cắt ngang: tên, thư, mã người gửi không vào git; nhật ký máy chủ không ghi nội dung; hai khổ màn; chữ người gõ không dịch → AC-1, AC-7
- Chân ngành [NGÀNH: Sentry User Feedback widget] (nút cố định, tự ghi màn, một ô chữ) và [NGÀNH: Canny] (người gửi thấy trạng thái ý của mình) — phần bị cắt nằm ở Later/Never của bản quét.
- Quét đầy đủ (Core / Later / Never): `_acceptance/gui-tin-hieu-trong-crm/coverage-scan.md`

## Vòng đời (ba câu của `docs/vong-doi.md`)

1. Dọn thế nào: Xoá — chỉ người gửi, chỉ khi tín hiệu chưa kéo về kho. Không lưu trữ. → AC-5
2. «Lịch sử» là gì: tín hiệu đã được lượt kéo về đóng dấu (đã vào git). → AC-5, AC-6
3. Danh sách mặc định: mọi tín hiệu còn lại của người xem, mới nhất trước; không có chỗ «Đã lưu trữ» vì không có gì cất. → AC-4

## Đường đo

- Thước: ≥20 tín hiệu trong 30 ngày từ ≥3 phòng ban · số từ: dòng tổng kết của lệnh kéo về chạy ở ngày đo (phòng ban chính lúc gửi, cất trong CRM) · bảo đảm bởi: AC-2 (cất phòng ban lúc gửi), AC-12 (đếm)
- Thước: mọi tín hiệu gửi quá 7 ngày đã có chỗ sau gom và người gửi thấy chỗ đó · số từ: danh sách tín hiệu của khối dữ liệu `LO-TRINH.html` trên commit đang chạy production (bản ghi `cho` khác `chua-gom`, so `luc` với ngày đo) · bảo đảm bởi: AC-7, AC-9 (tín hiệu vào bản vẽ), AC-10 (người gửi thấy câu)
- Thước (vế CHẾT): không tín hiệu nào mất trên đường vào git · số từ: số tín hiệu trong CRM so với số tệp kéo về ở cùng ngày · bảo đảm bởi: AC-8, AC-12

## Out of scope

- CRM ghi ý định, trạng thái hay nhóm — kit gom, chủ kho chọn nhóm vào bản phạm vi (chốt 08/10).
- Gom, phân loại bằng AI trong CRM hay tác nhân — việc phán của phiên gom theo skill kit.
- Đổi khuôn tín hiệu — khuôn thuộc kit; cần đổi thì báo phiên điều phối.
- Ứng dụng tự commit vào git — Cổng Đáng 12/10 chọn lối 1.
- Báo tin cho người gửi (thư, Zalo) khi trạng thái đổi.
- Bầu chọn, xếp ưu tiên theo số tín hiệu — trái luật «không xếp điểm ưu tiên tự động» của kit.
- Đính ảnh chụp màn hình vào tín hiệu — cần chỗ cất tệp và luật riêng tư.
- Quản trị xem, gỡ tín hiệu rác trước khi kéo về; kéo về tự chạy theo lịch.
- Sửa tín hiệu sau khi gửi.
- Ngăn hồ sơ trong trang Lộ trình — vòng LT1b; vòng này không đổi khuôn khối dữ liệu hay bộ đọc của LT1.

## Notes

- Phụ thuộc: câu trạng thái sau gom chỉ có khi crm nhận kit ≥ 2.27 (bộ vẽ đặt danh sách tín hiệu vào khối). Trước đó
  trang hiện trạng thái lúc gửi kèm dòng báo (AC-11). AC-7 và AC-9 chạy bộ đọc và bộ vẽ của kit main trên máy, không
  dùng bản kit đang cài. Gộp vào `onehub` chỉ sau khi crm nhận kit 2.27 (từ 15/10), và sau LT1b.
- Hằng số (trần mỗi ngày 10, độ dài 2.000 ký tự, tiêu đề 120 ký tự, 30 ngày đếm) sống ở một chỗ
  (`@crm/validation/tin-hieu`), tiêu chí đo theo hằng số chứ không theo con số.
- Bảng `TinHieu` mới làm vòng chạy hạng T3 (hàng lộ trình ghi T2; máy không sửa hàng).
