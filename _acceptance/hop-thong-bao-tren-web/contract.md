---
schema_version: 1
feature: Người dùng CRM thấy mọi điều CRM muốn báo ở chuông trên đầu trang, biết số chưa đọc và bấm vào là tới đúng chỗ cần làm
slug: hop-thong-bao-tren-web
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
approved_by: Manh Phan
approved_at: 2026-10-14T03:18:11Z
design_doc: docs/superpowers/specs/2026-10-14-hop-thong-bao-tren-web-design.md
---

# Acceptance Contract: hop-thong-bao-tren-web

## Context

Mỗi sáng CRM tính sẵn cho từng người những điều cần nhắc (bước onboarding, Việc, OKR, tài liệu chờ duyệt, tóm tắt OKR,
cảnh báo AI) rồi gửi qua Zalo hay Slack; người chưa nối kênh nào thì mất hết. Vòng này ghi mỗi mục nhắc thành một
thông báo cho MỌI người, đặt chuông có số chưa đọc trên đầu trang và một trang xem lại; bấm một thông báo là tới đúng
chỗ cần làm. Zalo và Slack không đổi (TB2 rẽ chúng từ cùng bản ghi sau).

Source input: `_acceptance/hop-thong-bao-tren-web/opportunity.md` (Cổng Đáng `build`, Lối 1, 2026-10-14T02:34:36Z;
hàng TB1 của `docs/plan/lo-trinh-okr.json`, mã N1 và N2 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`).

## Criteria

- AC-1: (cross-layer) Given ba người cùng có mục nhắc sáng nay — một người nối Zalo, một người nối Slack, một người không nối kênh nào — When lượt nhắc buổi sáng của từng người chạy, Then mỗi mục nhắc của người đó thành đúng một thông báo của chính họ, mang loại mục, nội dung mục và đường dẫn tới chỗ cần làm; lượt của người không có kênh vẫn đóng như hôm nay («không có kênh») nhưng thông báo đã nằm trong chuông của họ; hàng lượt nhắc ghi lại danh sách mã mọi mục đã tính cho người đó, ghi TRƯỚC và độc lập với việc ghi thông báo (ghi thông báo hỏng thì danh sách vẫn còn).
- AC-2: (cross-layer) Given một mục đã có thông báo từ một sáng trước và mục còn nằm liên tục trong danh sách nhắc tới hôm nay, When lượt hôm nay chạy, Then không có thông báo mới cho mục đó, dù thông báo cũ đã đọc hay chưa, và nội dung thông báo được cập nhật theo sáng mới nhất (mục gộp như «n tài liệu chờ duyệt» hiện số mới); điều này đúng cho mọi loại mục nhắc; Given mục vắng ít nhất một sáng rồi quay lại, Then có một thông báo mới; Given lượt hôm nay chạy lại (bị thử lại sau lỗi), Then số thông báo không đổi.
- AC-3: Given người có kênh Zalo hay Slack, When lượt nhắc chạy sau vòng này, Then tin họ nhận giống từng chữ và từng đường dẫn tin trước vòng; Given ghi thông báo hỏng, Then tin Zalo/Slack vẫn gửi và lỗi ghi thông báo có trong nhật ký và hàng lượt nhắc; Given gửi Zalo/Slack hỏng, Then thông báo đã ghi vẫn còn.
- AC-4: Given người đã đăng nhập với bất kỳ vai nào (kể cả vai chỉ OKR), When họ đứng ở bất kỳ màn nào, Then đầu trang có nút chuông (cùng kiểu các nút cạnh nó) mang tên đọc được nói số chưa đọc; cạnh biểu tượng chuông là số thông báo chưa đọc của họ, không hiện khi bằng 0, hiện «99+» khi quá 99; mở chuông không đổi số; số mới hiện trong vòng 60 giây hoặc ngay khi quay lại thẻ, không cần tải lại trang, và trình đọc màn được báo số mới.
- AC-5: Given người có thông báo của hôm nay và của những ngày trước, When họ bấm chuông, Then một ô bật ra (ở khổ 375 không tràn ra ngoài màn) liệt kê tối đa 20 thông báo mới nhất chia «Hôm nay» và «Trước đó» theo ngày giờ Việt Nam; mỗi dòng có câu theo loại bằng ngôn ngữ đang chọn, giờ, và chấm chưa đọc nếu chưa đọc; chân có «Xem tất cả» tới trang Thông báo; chưa có thông báo, đang tải, và tải hỏng hiện đúng như bảng trạng thái của bản thiết kế.
- AC-6: (cross-layer) Given một thông báo chưa đọc, When người bấm dòng đó (kể cả Cmd/Ctrl+bấm mở thẻ mới), Then họ tới đúng đường dẫn đã lưu trong không gian làm việc của họ, thông báo thành đã đọc và ghi lúc bấm mở, số trên chuông giảm một.
- AC-7: (cross-layer) Given người có nhiều thông báo chưa đọc và người khác cũng có, When họ bấm «Đánh dấu tất cả đã đọc», Then mọi thông báo chưa đọc của họ thành đã đọc mà không ghi lúc bấm mở, số về 0 ngay, thông báo của người khác không đổi; khi không còn thông báo chưa đọc thì nút khoá; khi lệnh hỏng thì số giữ nguyên và một dòng báo nói chưa đánh dấu được.
- AC-8: Given người mở trang Thông báo, When trang tải, Then trang có tiêu đề «Thông báo» và một câu mô tả, lọc «Tất cả | Chưa đọc» ghi trên đường dẫn, danh sách chia theo ngày, mới nhất trước, «Xem thêm» khi còn; lọc «Chưa đọc» mà không còn gì thì nói đã đọc hết kèm nút xem tất cả; tải hỏng dùng vùng lỗi chung có Thử lại; ở khổ 375 trang không cuộn ngang.
- AC-9: (cross-layer) Given hai người cùng có thông báo, When một người gọi bất kỳ thủ tục thông báo nào (danh sách, số, mở một, đánh dấu hết), Then họ chỉ đọc và chỉ đổi được thông báo của chính mình; mở một thông báo của người khác trả như không có; người chưa đăng nhập bị từ chối; người vai chỉ OKR gọi được cả bốn thủ tục.
- AC-10: Given mỗi loại trong 21 loại mục nhắc, When thông báo của loại đó được ghi, Then đường dẫn của thông báo trùng đường dẫn tin Zalo của cùng mục (bỏ phần địa chỉ và tên không gian làm việc), và câu hiển thị có cho cả tiếng Việt lẫn tiếng Anh; Given bản ghi đích đã xoá hay người không còn quyền xem, When họ bấm thông báo, Then chỗ tới nói bản ghi không còn xem được, không hiện trang lỗi chung.
- AC-11: Given thông báo tạo cách đây 91 ngày và thông báo tạo cách đây 89 ngày, When lượt dọn định kỳ có sẵn của tác nhân chạy, Then thông báo 91 ngày bị xoá và thông báo 89 ngày còn; danh sách và số chưa đọc chỉ tính thông báo còn giữ.
- AC-12: Given lượt nhắc đã chạy nhiều ngày cho người có và không có kênh, When chủ kho chạy lệnh đối chiếu cho một khoảng ngày, Then lệnh in theo từng ngày số người có lượt nhắc, số có và không có kênh, số mục đã tính (từ danh sách lượt nhắc ghi trước khi ghi thông báo), số mục có thông báo, số mục mất kèm mã; lượt nhắc không mang danh sách mục đã tính thì cả lượt tính là mất, không tính là 0; và cho cả khoảng: số người có thông báo và số người đã bấm mở ít nhất một; có mục mất thì thoát mã 1 gọi tên mục; các số khớp dữ liệu trong kho.
- AC-13: (judgment) Given từ điển `CONTEXT.md`, When người đọc mục «Thông báo» và mục «Nhắc buổi sáng», Then «Thông báo» có mục riêng nói nó là gì, ai nhận, khác «Nhắc buổi sáng» ở đâu; mục «Nhắc buổi sáng» không còn lý do «kho không có bảng thông báo».

## Coverage

- Trục A — Vòng đời thông báo: sinh từ lượt nhắc | gộp mục lặp | hiện trên chuông | bấm mở | đánh dấu tất cả | xem lại | tự dọn [thước CE: `docs/vong-doi.md`; NGÀNH: chuông Salesforce (20 mới nhất, 90 ngày), HubSpot (số chưa đọc)] → AC-1, AC-2, AC-4, AC-6, AC-7, AC-8, AC-11
- Trục B — Người nhận × quyền: có kênh | không kênh | trưởng phòng | quản trị | vai chỉ OKR | mất quyền xem đích | người khác | chưa đăng nhập [thước CE: bảng phạm vi router `docs/api.md`; `VAI_NHAN_BAO_AI`] → AC-1, AC-4, AC-9, AC-10
- Trục C — Nguồn × đích: 21 loại mục nhắc × (bản ghi cụ thể | trang đã lọc) [thước CE: `THU_TU_NHAC`, `duongMo`] → AC-1, AC-10
- Trục D — Trạng thái màn × khổ: chờ tải | rỗng | lỗi | có | 99+ | lọc rỗng | 1280 | 375 [thước CE: `docs/design.md` mục «Nếp màn trong app»] → AC-4, AC-5, AC-7, AC-8
- Cắt ngang: Zalo/Slack không đổi; ghi và gửi không làm hỏng nhau; chạy lại không nhân đôi; song ngữ; chỉ của mình → AC-2, AC-3, AC-9, AC-10
- Quét đầy đủ (Core / Later / Never): `_acceptance/hop-thong-bao-tren-web/coverage-scan.md`

## Vòng đời (ba câu của `docs/vong-doi.md`)

Máy đề xuất, chủ kho chốt ở Cổng Phạm vi (Hỏi-1):

1. Dọn thế nào: không xoá, không lưu trữ trên màn; máy tự dọn thông báo quá 90 ngày. → AC-11
2. «Lịch sử» là gì: mọi thông báo là vết của điều CRM đã báo — không có trạng thái «chưa có lịch sử» để xoá tay.
3. Danh sách mặc định: mọi thông báo còn giữ của người xem, mới nhất trước; lọc «Chưa đọc»; không có chỗ «Đã lưu trữ» vì không có gì cất. → AC-8

## Đường đo

- Thước: mọi mục nhắc tính cho người không có kênh đều có thông báo (0 mục mất) trong 30 ngày · số từ: lệnh đối chiếu chạy trên production ở ngày đo · bảo đảm bởi: AC-1 (ghi trước khi chọn kênh; danh sách mục đã tính ghi độc lập với ghi thông báo), AC-12 (đếm, lượt thiếu danh sách tính là mất)
- Thước: ≥ một nửa số người có thông báo đã bấm mở ít nhất một (vế chết: dưới một phần tư) · số từ: cùng lệnh, đếm lúc bấm mở · bảo đảm bởi: AC-6 (ghi lúc bấm mở, tách khỏi «đánh dấu tất cả» ở AC-7), AC-12

## Out of scope

- Zalo và Slack rẽ từ bản ghi thông báo; cài đặt loại × kênh; mức Cần làm / Để biết — TB2 (N3, N4).
- «Có n tín hiệu mới» cho quản trị — TH2 (N5); người gửi nhận thông báo khi tín hiệu đổi chỗ — TH3 (S2).
- Thông báo tức thời lúc sự kiện xảy ra (giao việc, nhắc tên) — vòng sau, đi cùng TB2.
- Xoá, ẩn, tạm tắt từng thông báo; nhóm thông báo theo bản ghi.
- Đẩy qua trình duyệt, thư, ứng dụng điện thoại; cập nhật tức thời bằng websocket.
- Đường dẫn sâu hơn tin Zalo (tới đúng bước trong kế hoạch, đúng KR, đúng bình luận) — cùng nguồn đường dẫn với Zalo; làm sâu là việc chung của hai kênh.

## Notes

- Hạng T3: bảng `ThongBao` mới và migration chỉ thêm bảng (`packages/db/prisma`). Danh sách tệp chạm đăng ở
  phanlemanh/crm-onehub#375 trước Cổng Phạm vi (luật 5).
- Hằng số (20 dòng trên chuông, 60 giây hỏi lại, 90 ngày giữ, trần «99+») sống ở một chỗ (`@crm/validation/thong-bao`);
  tiêu chí đo theo hằng số, không theo con số.
- Hai câu chờ chủ kho ở Cổng Phạm vi: Hỏi-1 (vòng đời — mục trên), Hỏi-2 (mục lặp — AC-2). Câu trả lời khác khuyến nghị
  thì máy sửa AC-2 hay AC-11 rồi trình lại.
