---
schema_version: 1
feature: «Quản trị lưu trữ một tín hiệu rác trước khi đội sản phẩm lấy về, và hoàn tác được nếu lỡ tay»
slug: go-tin-hieu-rac
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-10-19T14:11:15Z
design_doc: docs/superpowers/specs/2026-10-19-go-tin-hieu-rac-design.md
---

# Acceptance Contract: go-tin-hieu-rac

## Context

Từ LT2 mọi người dùng CRM gửi tín hiệu, và lượt kéo về của đội sản phẩm lấy hết — kể cả tín hiệu thử, trùng, gửi nhầm.
Từ TH4 chủ và quản trị thấy mọi tín hiệu ở thẻ «Tất cả» nhưng không gỡ được gì; chỉ người gửi xoá được tín hiệu của
mình. Rác vì thế đi thẳng vào lượt gom và làm nhiễu con số ngưỡng sống. Vòng này cho chủ và quản trị lưu trữ một tín
hiệu chưa lấy về: tín hiệu rời bảng đang dùng, lượt kéo về bỏ qua nó, mỗi lần lưu trữ hay khôi phục để lại vết người
làm, và lỡ tay thì Hoàn tác hay Khôi phục được. Không có xoá vĩnh viễn (ghi chú hàng TH5).

Source input: `_acceptance/go-tin-hieu-rac/opportunity.md` (Cổng Đáng `build` 2026-10-19, hàng TH5 của
`docs/plan/lo-trinh-okr.json`).

## Criteria

- AC-1: (cross-layer) Given một tín hiệu chưa lấy về, When một chủ hay quản trị lưu trữ nó (tRPC `tinHieu.luuTru` hay REST `POST /tin-hieu/{id}/luu-tru`), Then máy chủ ghi lúc lưu trữ và người lưu trữ lên tín hiệu, thêm đúng một dòng vết «lưu trữ» mang người đó, danh sách «Tất cả» mặc định không còn tín hiệu ấy, và danh sách «Đã lưu trữ» có nó kèm lúc lưu trữ và tên người lưu trữ; Given tín hiệu đó đang lưu trữ, When lưu trữ lại, Then lúc lưu trữ giữ nguyên lần đầu và không thêm vết nào.
- AC-2: (cross-layer) Given trên máy chủ có tín hiệu đang lưu trữ, tín hiệu đang dùng chưa lấy về, và một tín hiệu đã lưu trữ rồi khôi phục, When lượt kéo về chạy (bằng tay `POST /tin-hieu/keo-ve` hay theo lịch `POST /tin-hieu/lich/keo-ve`), Then phản hồi không mang tín hiệu đang lưu trữ, tín hiệu ấy không bị đóng dấu đã lấy về, tín hiệu đã khôi phục được lấy về như mọi tín hiệu khác, lệnh `bun run tin-hieu:keo-ve` không ghi tệp nào cho tín hiệu đang lưu trữ, và dòng tổng kết của lệnh không đếm nó.
- AC-3: (cross-layer) Given một tín hiệu đội sản phẩm đã lấy về, When chủ hay quản trị lưu trữ nó, Then máy chủ từ chối (409) với câu «Đội sản phẩm đã lấy tín hiệu này về — không lưu trữ được nữa.» và không đổi gì; Given lệnh lưu trữ và một lượt kéo về chạy cùng lúc trên cùng tín hiệu, Then đúng một trong hai kết cục xảy ra — tín hiệu đang lưu trữ và không có trong phản hồi kéo về, hoặc tín hiệu đã lấy về và lệnh lưu trữ bị từ chối.
- AC-4: (cross-layer) Given người vai thành viên hay vai chỉ OKR (kể cả khi chính họ gửi tín hiệu đó), When họ gọi lưu trữ, khôi phục, hay xem danh sách «Đã lưu trữ» qua tRPC hay REST bằng khoá của chính họ, Then máy chủ từ chối (403), không đổi tín hiệu nào và không trả dòng nào.
- AC-5: (cross-layer) Given quản trị vừa lưu trữ tín hiệu crm-N ở thẻ «Tất cả», When họ bấm «Hoàn tác» trên thông báo «Đã lưu trữ tín hiệu crm-N.» trong 10 giây, hoặc về sau bấm «Khôi phục» ở dạng «Đã lưu trữ», Then tín hiệu trở lại bảng đang dùng với trạng thái cũ, lúc lưu trữ và người lưu trữ được xoá, máy chủ thêm đúng một dòng vết «khôi phục» mang người bấm, và lượt kéo về kế tiếp lấy nó về; khôi phục một tín hiệu đang dùng không đổi gì và không thêm vết.
- AC-6: Given thẻ «Tất cả» của chủ hay quản trị, When họ nhìn thanh công cụ và một dòng, Then thanh công cụ có nút «Đã lưu trữ» bật tắt được, trạng thái của nó nằm trên đường dẫn và tải lại trang giữ nguyên, bật tắt đưa về trang đầu và giữ bộ lọc; mỗi dòng có nút thao tác mở menu: dòng chưa lấy về có «Lưu trữ», dòng đã lấy về có «Lưu trữ» bị khoá kèm dòng «Đội sản phẩm đã lấy về — không lưu trữ được nữa.»; dạng «Đã lưu trữ» có thêm cột «Lưu trữ lúc» (giờ Việt Nam) và «Người lưu trữ», menu dòng có «Khôi phục», và khi rỗng nói «Chưa lưu trữ tín hiệu nào».
- AC-7: (cross-layer) Given có tín hiệu đang lưu trữ, When quản trị mở thẻ «Tất cả» hay chạy lệnh kéo về, Then ba ô số đầu thẻ và số đếm từng giá trị lọc của dạng đang dùng không đếm tín hiệu đang lưu trữ, ba ô số không đổi khi bật «Đã lưu trữ», và ba con số trên thẻ vẫn bằng đúng ba con số dòng tổng kết của lệnh kéo về in ra cho cùng bộ tín hiệu; When quản trị vừa lưu trữ, Hoàn tác hay Khôi phục mà không tải lại trang, Then ba ô số đổi theo ngay, bằng số đếm của danh sách «Tất cả» mặc định lúc đó.
- AC-8: Given người gửi có một tín hiệu đã bị lưu trữ, When họ mở «Tín hiệu đã gửi», Then tín hiệu vẫn ở danh sách với nhãn «Đã lưu trữ» màu xám và câu «Quản trị đã lưu trữ tín hiệu này — đội sản phẩm sẽ không xem xét nó.», nút xoá của họ vẫn còn, và trang không lộ tên người lưu trữ.
- AC-9: Given thẻ «Tất cả», When lệnh lưu trữ hay khôi phục đang chờ, hỏng vì mạng, hỏng vì tín hiệu vừa bị lấy về, hay màn hình rộng 375 px, Then mục menu đang chờ bị khoá và không gửi chồng lần hai; hỏng thì thông báo lỗi nói đúng lý do («vừa lấy về» khác «chưa lưu trữ được — thử lại sau») và dòng ở lại bảng; vừa bị lấy về thì bảng làm mới và dòng hiện trạng thái đã lấy về; ở 375 px nút thao tác nằm trong khung và trang không cuộn ngang.
- AC-10: Given cơ sở dữ liệu production đang có tín hiệu, When migration của vòng này chạy, Then nó chỉ thêm (hai cột cho phép rỗng, một bảng vết, chỉ mục, khoá ngoại), không sửa hay xoá dòng nào, mọi tín hiệu có sẵn ở trạng thái đang dùng, tên migration xếp sau mọi migration nó trỏ tới, và schema sau migration khớp `schema.prisma` không trôi.

## Coverage

- Trục A — Thao tác: lưu trữ | hoàn tác | khôi phục | lưu trữ lại | xoá vĩnh viễn (Never) | hàng loạt (Later) [thước CE: ba cách dọn của `docs/vong-doi.md`; NGÀNH: Productboard Insights (archive · unarchive), Khoros (mark spam · recover)] → AC-1, AC-5
- Trục B — Tín hiệu đang ở đâu: chưa lấy về | đã lấy về | đang lưu trữ | kéo về cùng lúc [thước CE: cột `keoVeLuc`; khoá bảng của `keoVe`, `xoa`] → AC-1, AC-2, AC-3
- Trục C — Ai gọi: chủ · quản trị | thành viên · chỉ OKR | người gửi không quản trị | khoá kéo theo lịch | REST [thước CE: `laQuanTriWorkspace`; `KhoaKeoTinHieuMiddleware`; bảng phạm vi router `docs/api.md`] → AC-2, AC-4
- Trục D — Chỗ thấy hậu quả: lượt kéo về | bảng «Tất cả» và «Đã lưu trữ» | ba ô số | trang người gửi | vết [thước CE: `bat_khi` của hàng TH5; «Danh sách mặc định hiện gì» của `docs/vong-doi.md`] → AC-2, AC-6, AC-7, AC-8
- Cắt ngang: bộ chữ «Lưu trữ · Khôi phục · Đã lưu trữ · Hoàn tác»; dữ liệu người nhập không dịch; ca màn → AC-6, AC-9. Migration chỉ thêm → AC-10.
- Chân ngành [NGÀNH: Productboard Insights], [NGÀNH: Featurebase], [NGÀNH: Khoros Communities] — phần cắt ở Later/Never của bản quét.
- Quét đầy đủ (Core / Later / Never): `_acceptance/go-tin-hieu-rac/coverage-scan.md`

## Vòng đời (ba câu của `docs/vong-doi.md`)

1. Dọn thế nào: người gửi Xoá tín hiệu của mình khi chưa lấy về (giữ như LT2); chủ và quản trị Lưu trữ → Khôi phục, có
   Hoàn tác; không có Xoá vĩnh viễn. → AC-1, AC-5
2. «Lịch sử» là gì: đội sản phẩm đã lấy tín hiệu về — từ đó không xoá, không lưu trữ được nữa. → AC-3
3. Danh sách mặc định: thẻ «Tất cả» chỉ hiện tín hiệu đang dùng; tín hiệu đã lưu trữ tìm lại ở nút «Đã lưu trữ» trên
   thanh công cụ. Trang người gửi vẫn hiện tín hiệu đã lưu trữ kèm nhãn (Hỏi-1). → AC-6, AC-8

## Đường đo

- Thước: lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ · số từ: tập mã ở dạng «Đã lưu trữ» của
  thẻ «Tất cả» trên production ngay trước lượt kéo về đầu tiên sau ngày giao, đối với tập tệp mới trong
  `tin-hieu/crm/` mà lượt đó ghi ra — giao nhau rỗng VÀ tập đã lưu trữ có ít nhất một mã thì SỐNG; tập đã lưu trữ rỗng
  thì ghi «chưa đo được», đọc lại ở lượt kéo về kế tiếp có tín hiệu đã lưu trữ · bảo đảm bởi: AC-2 (kéo về bỏ qua),
  AC-3 (không lưu trữ được thứ đã lấy), AC-6 (dạng «Đã lưu trữ» liệt mã)
- Thước: mỗi lần gỡ có vết người gỡ · số từ: truy vấn chỉ đọc trên production theo `docs/production.md` — với MỌI tín
  hiệu đang lưu trữ (`archivedAt` khác rỗng), có một dòng vết «lưu trữ» cùng tín hiệu với `luc` bằng `archivedAt` và
  người bằng `archivedById`; nguồn so là cột trên tín hiệu, độc lập với bảng vết. Vết mất người chỉ được miễn khi tài
  khoản người lưu trữ đã bị xoá (khi đó `archivedById` cũng rỗng) và ghi rõ số ca miễn · bảo đảm bởi: AC-1, AC-5 (mỗi
  lần đổi trạng thái đúng một dòng vết mang người, cùng lúc với cột)

## Out of scope

- Xoá vĩnh viễn tín hiệu của người khác; đưa tín hiệu đã lưu trữ vào lịch dọn tự động — hàng TH5 ghi «không xoá hẳn».
- Lưu trữ tín hiệu đã lấy về — tệp đã ở kho sản phẩm, gỡ ở CRM không gỡ được tệp.
- Lưu trữ hàng loạt và lý do lưu trữ — Later trong bản quét.
- Báo người gửi khi tín hiệu bị lưu trữ — dãy thông báo (TB2).
- Đổi trần 10 tín hiệu mỗi ngày — trần vẫn đếm tín hiệu đã bị lưu trữ.
- Xem toàn bộ lịch sử vết trên màn — vết chỉ đọc qua máy chủ trong vòng này.

## Notes

- Known limits — chọn ở Cổng Bằng chứng 2026-10-20:
  - Ngoài-1: Ảnh và nhật ký của bước đo màn E5c thuộc hai lượt chạy khác nhau, nên giờ trên ảnh không khớp giờ trong nhật ký.
  - Ngoài-2: Việc khoá các dòng khác khi đang khôi phục chưa có bài kiểm riêng; mới chỉ đo nhánh lưu trữ.
  - Ngoài-3: Ba ô số được tính ở trình duyệt; để trang mở rất lâu thì ô «quá 7 ngày» có thể lệch nhẹ tới khi tải lại.
  - Ngoài-4: Ở dạng «Đã lưu trữ», bộ lọc Trạng thái vẫn hiện và ghi «Chờ lấy về» cho tín hiệu đã lưu trữ.
  - Ngoài-5: Lưu trữ một tín hiệu mà người gửi vừa xoá chỉ báo lỗi chung và dòng ở lại bảng.
  - Ngoài-6: Bộ lọc Trạng thái chọn ở bảng chính đi theo sang dạng «Đã lưu trữ», nên bảng có thể trống mà không rõ vì sao.
  - Ngoài-7: Phép đo «không ghi đè giao diện» chỉ hiểu một cách viết className; cách viết động có thể lọt.
  - Ngoài-8: Bài kiểm thanh công cụ chưa dựng đủ ma trận bốn ô như lời hứa của E6.
  - Ngoài-10: Bài kiểm từ chối quyền khẳng định «không lộ tiêu đề» mà chưa có đối chứng dương cho chính phép tìm.
  - Ngoài-11: Danh sách «Đã lưu trữ» tải hết về trình duyệt rồi mới lọc và chia trang; sẽ chậm khi danh sách lớn.
  - Ngoài-12: Cách đếm ba ô số đặt ở trình duyệt thay vì trang máy chủ, lệch nếp «máy chủ tính, trình duyệt vẽ».
  - Ngoài-13: Tín hiệu đã lưu trữ mang trạng thái dự phòng «Chờ lấy về» trong dạng «Đã lưu trữ».
  - Ngoài-14: Chạy trần phép đo màn (không qua lệnh chuẩn) có thể ghi vào kho dữ liệu chung và đóng dấu «đã lấy về» lên tín hiệu thật.
  - Ngoài-15: Ở dạng «Đã lưu trữ», bộ lọc gợi ý «Chưa lấy về» và bộ lọc mang sang có thể cho câu rỗng sai.
  - Ngoài-16: Phép đo migration của hồ sơ so với mốc gộp nên sẽ đỏ sau khi PR gộp; các lượt chấm lại hồ sơ về sau sẽ vấp.
  - Ngoài-17: Lưu trữ hoặc khôi phục tín hiệu người gửi vừa xoá báo «thử lại sau», nhưng thử lại không bao giờ được.
  - Ngoài-18: Phép đo «không ghi đè giao diện» tuyên quét mọi phần tử nhưng chỉ có vài mẫu chiều đỏ.
