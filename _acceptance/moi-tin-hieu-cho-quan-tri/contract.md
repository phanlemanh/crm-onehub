---
schema_version: 1
feature: «Quản trị mở thẻ Tất cả của trang Tín hiệu và thấy ai đã gửi, phòng ban nào, từ màn nào, đang ở đâu, cùng ba con số của ngưỡng sống»
slug: moi-tin-hieu-cho-quan-tri
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-10-14-moi-tin-hieu-cho-quan-tri-design.md
---

# Acceptance Contract: moi-tin-hieu-cho-quan-tri

## Context

Từ LT2 (`_acceptance/gui-tin-hieu-trong-crm/`), mọi người dùng CRM gửi tín hiệu và chỉ thấy tín hiệu của mình;
quản trị chỉ có dòng tổng kết trong terminal sau lệnh kéo về, không thấy tên ai. Vòng này mở cho chủ và quản trị
CRM thẻ «Tất cả» trên trang Tín hiệu: mọi tín hiệu kèm người gửi, phòng ban, màn, trạng thái, bộ lọc, và ba con
số ngưỡng sống của LT2 — đếm bằng đúng hàm lệnh kéo về dùng. Hộp gửi báo trước rằng quản trị thấy tên người gửi.
Luật riêng tư chủ kho chốt 14/10 (`ghi_chu` hàng TH4): quản trị thấy tên; người khác chỉ thấy tín hiệu của mình;
tệp tín hiệu trong git không mang danh tính.

Source input: `_acceptance/moi-tin-hieu-cho-quan-tri/opportunity.md` (Cổng Đáng `build` 2026-10-14, hàng TH4 của
`docs/plan/lo-trinh-okr.json`, mã Q1 · Q2 · Q3 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`).

## Criteria

- AC-1: Given một người có vai chủ hoặc quản trị, When họ mở «Tín hiệu đã gửi», Then ngay dưới đầu trang có thanh thẻ «Của tôi · Tất cả» (kiểu thẻ con dạng gạch dưới của các màn khác), thẻ đang mở được đánh dấu là trang hiện tại, mỗi thẻ là một đường dẫn riêng (`/<slug>/tin-hieu` và `/<slug>/tin-hieu/tat-ca`), và trang «Của tôi» vẫn đúng như LT2; Given vai thành viên hay vai chỉ OKR, Then trang «Tín hiệu đã gửi» không có thanh thẻ nào.
- AC-2: (cross-layer) Given tín hiệu của nhiều người ở nhiều phòng ban, cả đã và chưa kéo về, When một chủ hay quản trị gọi thủ tục danh sách mọi tín hiệu (tRPC hay REST `GET /tin-hieu/tat-ca`), Then máy chủ trả mọi tín hiệu, mới nhất trước, mỗi tín hiệu kèm mã, tiêu đề, điều muốn làm, màn, lúc gửi, đã kéo về hay chưa, người gửi (mã và tên, vắng khi tài khoản đã bị xoá) và phòng ban lúc gửi (mã và tên, vắng khi không có); phản hồi không mang thư điện tử của ai; không dấu «đã kéo về» nào đổi; trên cùng kho, tập mã mà thủ tục này trả bằng đúng tập mã thủ tục kéo về trả, cùng phòng ban cho từng mã; Given vai thành viên hay vai chỉ OKR, Then máy chủ từ chối (403) và không trả dòng nào.
- AC-3: Given một người không phải chủ hay quản trị, When họ mở thẳng `/<slug>/tin-hieu/tat-ca`, Then trang giữ tiêu đề, thân trang nói «Chỉ chủ và quản trị CRM xem được mọi tín hiệu.» kèm nút về «Tín hiệu đã gửi», không có thanh thẻ, và trang đưa xuống trình duyệt không mang tiêu đề, tên người gửi hay trạng thái của tín hiệu nào.
- AC-4: Given thẻ «Tất cả» và bản vẽ lộ trình có danh sách tín hiệu, When quản trị nhìn một dòng, Then dòng có mã, điều đã kể (tiêu đề, dòng phụ «Muốn: …»), người gửi, phòng ban, màn, lúc gửi theo giờ Việt Nam, và trạng thái gồm nhãn có chấm màu theo nghĩa cộng một câu — đúng nhãn và đúng câu thẻ «Của tôi» hiện cho cùng mã; tiêu đề, tên người, tên phòng ban và màn được đánh dấu để trình duyệt không tự dịch.
- AC-5: Given một tín hiệu mà tài khoản người gửi đã bị xoá, một tín hiệu không có phòng ban, và bản vẽ lộ trình vắng hay không đọc được, When quản trị mở thẻ «Tất cả», Then dòng thứ nhất ghi người gửi «Không còn tài khoản», dòng thứ hai ghi «Chưa có phòng ban», mọi dòng hiện trạng thái của CRM («Chờ lấy về» hay «Chờ gom») kèm một dòng báo trạng thái sau gom chưa đọc được, và trang không vỡ.
- AC-6: Given thẻ «Tất cả» có tín hiệu từ nhiều phòng ban, nhiều trạng thái, nhiều người gửi, When quản trị chọn giá trị ở ba bộ lọc phòng ban, trạng thái, người gửi, Then bảng chỉ còn dòng khớp (nhiều giá trị trong một bộ lọc là «hoặc», giữa các bộ lọc là «và»), mỗi giá trị lọc hiện số dòng của nó, giá trị lọc nằm trên đường dẫn và tải lại trang giữ nguyên, đổi lọc đưa về trang đầu, ba ô số không đổi theo lọc; lọc ra rỗng thì bảng nói không có tín hiệu khớp và có nút bỏ lọc.
- AC-7: Given thẻ «Tất cả», When quản trị nhìn đầu thẻ, Then có ba ô số «Tín hiệu 30 ngày qua», «Phòng ban có tín hiệu» (trong 30 ngày) và «Quá 7 ngày chưa có chỗ», với số 30 và 7 lấy từ cấu hình chung của tín hiệu; ô thứ nhất nói số gồm cả tín hiệu chưa lấy về, ô thứ hai nói số tín hiệu chưa có phòng ban, ô thứ ba nói trên bao nhiêu tín hiệu gửi quá 7 ngày; bản vẽ không đọc được thì ô thứ ba hiện «—» và nói chưa đọc được trạng thái sau gom, không hiện một số 0.
- AC-8: (cross-layer) Given cùng một bộ tín hiệu trên máy chủ và cùng một bản vẽ lộ trình đọc được, When lệnh kéo về chạy và thẻ «Tất cả» đếm ở cùng thời điểm, Then ba con số trên thẻ bằng đúng ba con số của dòng tổng kết lệnh in ra («trong 30 ngày: N tín hiệu từ M phòng ban», «chưa có chỗ sau gom: K»), vì cả hai đếm bằng một hàm và phòng ban được đếm theo mã (hai phòng ban trùng tên là hai); dòng tổng kết của lệnh giữ nguyên từng chữ như LT2; và tệp tín hiệu lệnh ghi ra vẫn không mang tên hay thư điện tử của người gửi.
- AC-9: Given người dùng bất kỳ vai nào mở hộp «Gửi tín hiệu», When hộp đang ở bước soạn, Then câu mô tả của hộp có câu «Quản trị CRM thấy tên bạn cùng tín hiệu này.» trước khi họ bấm Gửi; phần còn lại của hộp không đổi.
- AC-10: Given thẻ «Tất cả», When danh sách đang tải, tải lỗi, chưa ai gửi tín hiệu, hay màn hình rộng 375 px, Then lúc tải hiện khung xương của ba ô và các dòng; lúc lỗi có khung lỗi nói chưa tải được kèm «Thử lại»; lúc rỗng ba ô hiện 0 và bảng nói chưa ai gửi tín hiệu; ở 375 px trang không cuộn ngang, mỗi dòng vẫn đọc được người gửi và trạng thái.
- AC-11: Given bản dựng production, When đường `/<slug>/tin-hieu/tat-ca` được dựng, Then danh sách tệp mà đường đó mang theo có `LO-TRINH.html` của chính commit được dựng (như đường «Tín hiệu đã gửi»).

## Coverage

- Trục A — Vật trên thẻ Tất cả: danh sách | bộ lọc | ba ô số | thanh thẻ [thước CE: câu giao TH4 + mã Q1, Q2 của `docs/plan/pham-vi-vong-tin-hieu-1410.md`; Canny/Productboard] → AC-1, AC-4, AC-6, AC-7, AC-8
- Trục B — Người × quyền: chủ | quản trị | thành viên | vai chỉ OKR | gọi API thẳng [thước CE: `laQuanTriWorkspace`; bảng phạm vi router `docs/api.md`] → AC-1, AC-2, AC-3, AC-9
- Trục C — Hình dạng một dòng: đủ | người gửi đã bị xoá | không phòng ban | bản vẽ thiếu mã | bản vẽ vắng hay hỏng [thước CE: cột rỗng được của bảng `tinHieu`; năm ca đọc khoan dung của LT1/LT2] → AC-4, AC-5, AC-7
- Trục D — Ca của trang: suôn sẻ | rỗng | chờ tải | lỗi tải | 375 px | lọc rỗng | bản dựng production [thước CE: «Nếp màn trong app» của `docs/design.md`] → AC-6, AC-10, AC-11
- Cắt ngang: tên người gửi chỉ tới quản trị; tệp git không mang danh tính; dữ liệu người nhập không dịch → AC-2, AC-3, AC-4, AC-8. Nhật ký máy chủ chỉ ghi người gọi và số dòng — luật `docs/api.md`, soi ở review, không có eval riêng.
- Chân ngành [NGÀNH: Canny] (bảng quản trị mọi ý, người gửi, lọc theo trạng thái) và [NGÀNH: Productboard Insights] (hộp ghi nhận mọi người, lọc theo người, công ty) — phần cắt nằm ở Later/Never của bản quét.
- Quét đầy đủ (Core / Later / Never): `_acceptance/moi-tin-hieu-cho-quan-tri/coverage-scan.md`

## Vòng đời (ba câu của `docs/vong-doi.md`)

1. Dọn thế nào: thẻ «Tất cả» chỉ đọc — không xoá, không lưu trữ; gỡ tín hiệu rác là TH5. Xoá của người gửi giữ như LT2. → AC-2
2. «Lịch sử» là gì: tín hiệu đã kéo về vẫn nằm trong danh sách, trạng thái nói nó đang ở đâu. → AC-4
3. Danh sách mặc định: mọi tín hiệu của mọi người, mới nhất trước, không lọc. → AC-2, AC-6

## Đường đo

- Thước: ở ngày 12/11 chủ kho đọc ba con số trên thẻ «Tất cả» mà không chạy lệnh · số từ: ba ô số của thẻ trên production · bảo đảm bởi: AC-7 (ô số có mặt, đúng nhãn), AC-1, AC-2 (quản trị vào được)
- Thước: ba con số trên trang bằng dòng tổng kết của lệnh kéo về đọc ngay sau đó · số từ: dòng tổng kết của `bun run tin-hieu:keo-ve` cùng ngày, chạy trên cây ở đúng commit production đang chạy (đối sha bản dựng production với `git rev-parse HEAD` trước khi so — lệch commit thì vế «chưa có chỗ» đọc hai bản vẽ khác nhau, không phải hàm đếm sai) · bảo đảm bởi: AC-2 (cùng tập mã, cùng phòng ban với kéo về), AC-8 (một hàm đếm, ca hai chiều), AC-11 (bản dựng mang bản vẽ)

## Out of scope

- Gỡ, lưu trữ tín hiệu rác trước khi kéo về — TH5 (T3).
- Kéo về tự chạy theo lịch, khoá chỉ kéo — TH1.
- Thông báo «có n tín hiệu mới» cho quản trị — N5, đợt hộp thông báo.
- Sửa các lỗi giao diện U1–U9 của thẻ «Của tôi» — hàng riêng của đợt.
- Tìm theo chữ, xuất tệp, trả lời người gửi trong CRM.
- Trưởng phòng ban xem tín hiệu của phòng mình — luật 14/10 chỉ mở cho quản trị.
- Đưa tên người gửi vào tệp git — luật riêng tư 14/10.

## Notes
