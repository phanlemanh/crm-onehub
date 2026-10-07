---
schema_version: 1
feature: «Kara trong hồ sơ bản ghi có một khung chung» — tab Kara của ngăn cá nhân, công ty, thoả thuận nói tiếng Việt với dấu, trạng thái và «Thử lại» của Kara; đề xuất thông tin liên hệ neo tại chỗ, nhận xong có biên nhận và Hoàn tác (thêm lệnh hoàn tác ở API); khung bản ghi tải lỗi có «Thử lại»; nút tra cứu mang dấu Kara; ngăn thêm nhanh hỏi lại khi lỡ đóng
slug: khung-ban-ghi-kara
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
design_doc: docs/superpowers/specs/2026-10-07-khung-ban-ghi-kara-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-07T14:04:10Z
---

# Acceptance Contract: khung-ban-ghi-kara

## Context

Ở OKR, Kara đã có tên, dấu tia sáng, lời «Kara đang…», lỗi có «Thử lại», đề xuất có biên nhận và Hoàn tác
(`docs/ai-ux.md`). Ở ngăn bản ghi — nơi người dùng làm hầu hết việc CRM — tab «Tác nhân» nói tiếng Anh viết
cứng, avatar là logo, lỗi in gợi ý cho lập trình viên; đề xuất thông tin liên hệ chỉ có «Nhận / Bác» và toast;
khung tải lỗi không có «Thử lại»; lỡ đóng ngăn thêm nhanh là mất chữ (khảo sát production 04/10). K4 đưa ngăn
bản ghi về cùng một Kara. Anh chốt 07/10 phương án (a): thêm lệnh hoàn tác quyết định của người ở API.

Source input: `docs/plan/lo-trinh-okr.json` hàng K4 · `_acceptance/khung-ban-ghi-kara/opportunity.md` ·
`.acceptance-runs/dieu-phoi-1410/nguon/lai-thu-prod-0410/khao-sat-dong-nhat.md` mục 3–6.

## Criteria

- AC-1: Given ngăn một cá nhân, một công ty hay một thoả thuận đang mở, When người nhìn hàng tab và mở tab Kara khi chưa có lời nào, Then tab mang tên «Kara»; khoảng rỗng mang dấu Kara (tia sáng), không có logo OneHub nào trong tab; tiêu đề, mô tả, chữ gợi ý trong ô soạn và ba câu gợi ý là tiếng Việt, đúng theo loại bản ghi; bấm một câu gợi ý gửi đúng câu đó cho Kara.
- AC-2: Given tab Kara, When một cuộc trò chuyện cũ đang mở quá 1 giây hoặc Kara đang chạy một bước, Then màn hiện «Kara đang …» (dải chờ hoặc dải bước) và không có `Spinner` trần nào trong tab; bước đã xong mang dấu xong; nguồn của bước (LinkedIn, GitHub, web) vẫn mở được bằng liên kết.
- AC-3: Given tab Kara, When gửi câu hỏi mà lỗi — tác nhân không với tới hoặc lỗi khác, Then màn hiện «Kara chưa trả lời được» kèm một câu mô tả tiếng Việt và nút «Thử lại»; bấm «Thử lại» gửi lại đúng câu hỏi cuối; không chữ nào của thông điệp lỗi thô, `bun run dev`, `AGENT_URL` hay `AGENT_BRIDGE_SECRET` hiện trên màn. Lỗi do thiếu cấu hình cầu nối → «Kara chưa được bật» kèm một câu cho quản trị viên.
- AC-4: Given một cuộc trò chuyện Kara đang trả lời từ trước, hoặc một cuộc đã kết thúc, When người mở tab, Then ô soạn bị khoá kèm lý do tiếng Việt; cuộc đã kết thúc có nút «Bắt đầu cuộc mới» mở một cuộc mới với ô soạn dùng được.
- AC-5: Given Kara hỏi lại giữa chừng, hoặc người mở danh sách hội thoại của tab, When màn hiện, Then mọi chữ của câu hỏi lại (nút gửi, chỗ nhập, nhãn ẩn, lỗi gửi, chữ đang gửi) và của danh sách («Cuộc trò chuyện mới», chưa có, chưa đặt tên, thông báo đã xoá, nhãn ẩn của nút xoá) là tiếng Việt qua tệp chữ; các tệp giao diện Kara của ngăn bản ghi không còn chữ hiển thị viết cứng.
- AC-6: Given một cá nhân có đề xuất thông tin của Kara cho một trường, When người mở tab Tổng quan, Then đề xuất nằm ngay dưới trường đó và không có khung thẻ; mục Chi tiết mang nhãn «Kara · N đề xuất» đúng một lần, có «Vì sao?»; nút chính ghi «Thêm vào hồ sơ» khi trường trống và «Thay giá trị hiện có» khi trường đã có giá trị; «Bỏ qua» là nút chữ; không nút nào ghi «Nhận» trần.
- AC-7: Given một đề xuất đang chờ, When người bấm nút chính rồi bấm «Hoàn tác» trên dòng biên nhận, Then sau khi bấm nút chính trường mang giá trị đề xuất trên máy chủ và đề xuất thu thành «Đã thêm theo Kara · Hoàn tác» tại chỗ; sau Hoàn tác trường về đúng giá trị trước khi nhận (kể cả trống, và tên về đúng họ, tên cũ), đề xuất hiện lại ở trạng thái chờ và focus nằm trên nút chính của nó. (cross-layer)
- AC-8: Given một đề xuất đang chờ, When người bấm «Bỏ qua» rồi «Hoàn tác», Then sau Bỏ qua đề xuất thu thành «Đã bỏ qua · Hoàn tác» và trường không đổi; sau Hoàn tác đề xuất chờ lại và trường vẫn không đổi. (cross-layer)
- AC-9: Given một quyết định đã xong, When trường đã bị sửa sau lần nhận, hoặc một người khác người đã quyết gọi hoàn tác, hoặc đề xuất chưa từng được quyết, Then máy chủ từ chối và không hàng `contact` hay `contactFact` nào đổi; trên màn, dòng biên nhận đổi thành «Trường này đã đổi sau khi nhận — không hoàn tác được» và không còn nút Hoàn tác. Khi hoàn tác một lần nhận thành công, các đề xuất khác của cùng trường bị thay ở đúng lần nhận đó trở lại: đề xuất có giá trị bằng giá trị cũ về đã áp, còn lại về chờ. (cross-layer)
- AC-10: Given ngăn một cá nhân, công ty hay thoả thuận, When tải bản ghi lỗi, Then khung hiện «Không tải được bản ghi này» kèm một câu mô tả và nút «Thử lại», không in thông điệp lỗi thô; bấm «Thử lại» tải lại và hiện bản ghi khi lần sau thành công. Tab kế hoạch của công ty khi tải lỗi dùng cùng khung đó.
- AC-11: Given ngăn một cá nhân hay công ty có nút tra cứu, When nút hiện và khi đang tra cứu, Then nút mang dấu Kara (không còn `MagicWand`); lúc chạy, chữ nút là «Kara đang tra cứu…» thay `Spinner` trần; lỗi báo bằng câu tiếng Việt, không in thông điệp thô.
- AC-12: Given ngăn công ty hay thoả thuận đang mở một biểu mẫu thêm nhanh (thêm liên hệ, thêm thoả thuận, gắn người vào thoả thuận) có chữ đã gõ, When người đóng ngăn (Esc, bấm ra ngoài, nút đóng) hoặc bấm «Huỷ» của biểu mẫu, Then hộp «Bỏ những gì vừa nhập?» hiện và «Tiếp tục sửa» giữ nguyên chữ; biểu mẫu trống, hoặc vừa lưu xong, thì đóng không hỏi.
- AC-13: Given bản chạy thật của cây này, tab Kara của ba loại ngăn và mục Chi tiết có đề xuất, chụp ở khổ 1440 và 390, When một người không làm lượt này đọc ảnh, Then họ thấy cùng một Kara như ở OKR (dấu, cách nói, trạng thái, biên nhận), và ở 390 không có gì tràn ngang. (judgment)

## Coverage

- Quét bằng `morphological-scan`, trục tự dựng (preset `entity-feature` không khớp: K4 thống nhất một bề mặt AI, không đổi vòng đời bản ghi).
- Trục A — bề mặt trong ngăn bản ghi: tab Kara (hội thoại, ô soạn, câu hỏi lại, danh sách) | đề xuất thông tin liên hệ | nút tra cứu | khung bản ghi lúc tải | ngăn thêm nhanh | tab kế hoạch công ty [thước CE: `khao-sat-dong-nhat.md` mục 3–6 và `ghi_chu` hàng K4 — SUY-TỪ-REPO]
- Trục B — loại bản ghi: cá nhân | công ty | thoả thuận [thước CE: `record-sheet-host.tsx`, ba ngăn có tab Kara — SUY-TỪ-REPO]
- Trục C — trạng thái: đang làm | rỗng | lỗi / không với tới | kết thúc / bận | đã quyết | đã hoàn tác | hoàn tác bị chặn [thước CE: `docs/ai-ux.md` §6–7 — SUY-TỪ-REPO; NGÀNH: HubSpot Breeze Copilot đặt trợ lý trong thanh bên hồ sơ và hiện từng bước; nguyên tắc «user control and freedom» của Nielsen Norman Group — hoàn tác thay vì hỏi lại]
- Ô gạch: đề xuất × công ty / thoả thuận (không có cơ chế đề xuất thông tin); tra cứu × thoả thuận (không có tra cứu).
- Later: vết «theo đề xuất của Kara» ở tab Hoạt động; nhãn và Hoàn tác cho thông tin Kara tự ghi thẳng; phản hồi «Hữu ích»; `InlineCitation` cho nguồn — xem Out of scope.

## Đường đo

- Thước: lái thử người lạ trên ba loại ngăn không vấp ở năm nhóm · số từ: nhật ký vấp của nghi thức lái thử (khuôn `stranger-drive-template.md`) · bảo đảm bởi: đã có sẵn: nghi thức lái-thử của `/acceptance-gate:uat-session` §0
- Thước: 0 chữ tiếng Anh viết cứng và 0 gợi ý lập trình viên trong tệp giao diện Kara của ngăn bản ghi · số từ: răng `_acceptance/khung-ban-ghi-kara/rang/chu-cung.mjs` · bảo đảm bởi: AC-5, AC-3

## Out of scope

- Đổi công cụ ghi của Kara (`record_fact`, `set_field_value`, `set_contact_socials`) thành đề xuất — lượt T3 `tac-tu-xin-duyet`; thông tin Kara đã tự ghi thẳng vẫn chỉ có gạch chân nguồn như hôm nay.
- Vết «theo đề xuất của Kara» ở tab Hoạt động cho mỗi lần nhận hay hoàn tác (ai-ux §6) — cần loại hoạt động mới, tức đổi schema.
- Trang Chat và khung chung Chat + Deal — K5 `chat-deal-mot-khung`; cuộn hội thoại giữ `MessageScroller`, không đổi sang `KaraTranscript`.
- Phản hồi «Hữu ích / Không hữu ích» và `InlineCitation` cho câu trả lời trong tab (ai-ux §8) — K5.
- Nút dừng lượt đang chạy của Kara trong tab (eve chỉ dừng được bằng đường cancel của phiên).
- Giữ chữ của ngăn thêm nhanh khi người chuyển tab bên trong ngăn.
- Hoàn tác sau khi rời ngăn: biên nhận sống tới khi ngăn đóng; sau đó người sửa trường như thường.

## Notes

- Ba eval đã ký bị thay bởi hồ sơ này (bảng «eval cũ → AC mới» trong design doc): `the-gop-y-okr/E10` → AC-6, `logo-onehub/E14` → AC-1; ca «màn cũ: thông tin liên hệ vẫn là thẻ» trong `apps/app/test/nen-kara-man-cu.dom.tsx` (eval `nen-kara/E3` đã nghỉ, thay bởi `gop-y-dung-cho#AC-5`) chuyển sang AC-6. Các hồ sơ đã ký có `paths` giao diff ghim lại cuối vòng, dưới khoá `ghim-lai` của đợt, sau Cổng Bằng chứng.
- Điều kiện của giám sát khi duyệt chạm tệp (yêu cầu P2-5): trong `the-gop-y-okr.dom.tsx` chỉ chuyển ca thông tin liên hệ; mỗi hồ sơ cũ chỉ thêm `status`/`superseded_by` vào đúng một eval; thẻ Cổng 2 nêu ba eval bị thay và danh sách hồ sơ ghim lại.
- `decideFact` đổi đúng một chỗ: một mốc thời gian chung cho `supersededAt` và `decidedAt`, để hoàn tác khớp đúng lần nhận.
- Known limits (Cổng Phạm vi, anh duyệt theo khuyến nghị của design-pass): ở khổ 375 dòng biên nhận «Đã thêm theo Kara · Hoàn tác» trong ô thuộc tính hẹp xuống hai dòng — đọc được, bấm được; thành phần biên nhận chưa có cách xếp gọn cho ô hẹp.
- Nút gọi Kara dùng chung (`NutKara`) dựng ở `packages/ui/src/components/kara/ban-ghi.tsx` để nút tra cứu không tự nhập icon ở chỗ gọi (finding Nhóm 2 của design-pass, anh duyệt làm ở S3).
- **Known limits (chủ kho ghi ở Cổng Bằng chứng 2026-10-08):**
  - Ngoài-1 — hai người cùng mở một liên hệ, người kia vừa sửa chức danh, rồi người này nhận đề xuất của Kara và bấm Hoàn tác: chức danh người kia vừa sửa bị đè bằng giá trị cũ trên màn của người này, hệ thống vẫn báo hoàn tác thành công. Giá trị cũ do màn gửi lên, máy chủ không tự lưu trước lúc nhận.
  - Ngoài-2 — ai gọi thẳng vào hệ thống (không qua màn) có thể hoàn tác một lần nhận tên và để liên hệ có tên trống, hoặc để chức danh là chuỗi rỗng thay vì không có; người thao tác trên màn không gặp.
  - Ngoài-6 — trong lúc Kara đang làm giàu hồ sơ và màn tự làm mới, bấm Thay rồi Hoàn tác có thể báo thành công nhưng trường vẫn giữ giá trị mới, giá trị cũ mất.
  - Ngoài-7 — thông tin không có ô riêng trong hồ sơ (nơi làm việc, địa điểm) thì hoàn tác luôn bị từ chối; màn hiện không cho hoàn tác các trường này.
  - Ngoài-8 — kiểm thử chưa chứng minh Hoàn tác trả lại đúng giá trị cũ, kể cả khi hoàn tác tên.
  - Ngoài-9 — phép kiểm gợi ý của công ty và thoả thuận có chép nhầm câu của liên hệ không bao giờ đỏ.
  - Ngoài-10 — kiểm thử máy chủ chỉ xác nhận trường đã đổi sau khi nhận, chưa xác nhận trường mang đúng giá trị Kara đề xuất.
- Hợp đồng mới (Cổng Bằng chứng 2026-10-08): Ngoài-4 — mở bản ghi đã xoá hay không có quyền xem thì khung chỉ nói kiểm tra kết nối; Ngoài-5 — bước Kara tìm được mà hệ thống từ chối lưu vẫn hiện dấu xong.
