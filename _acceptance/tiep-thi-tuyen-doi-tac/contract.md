---
schema_version: 1
feature: Đội tiếp thị chạy trọn một chiến dịch tuyển đối tác trong CRM — phân khúc, làm giàu, nhắm, tiếp cận, đo
slug: tiep-thi-tuyen-doi-tac
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, cli]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-04
design_doc: docs/superpowers/specs/2026-09-04-tiep-thi-tuyen-doi-tac-design.md
amended_at: 2026-09-04
amended_reason: "Chặn lái S3 đo được: trạng thái đang-tải của màn danh sách không dựng lại được trên đường thật vì trang nạp trước ở máy chủ; nó chuyển sang nhóm đo ở mức đơn vị cùng hai trạng thái rỗng toàn cục"
amended_by: Manh Phan
---

# Acceptance Contract: tiep-thi-tuyen-doi-tac

## Context

Đội tiếp thị OneHub tuyển môi giới vào mạng lưới mà chưa có CRM cho việc đó.
Vòng này cho họ làm trọn bốn bước trong CRM: cá nhân từ sàn nhatot vào CRM kèm
sản lượng và địa bàn (làm giàu) · một góc nhìn đã lưu trên màn cá nhân làm phân
khúc · một chiến dịch chọn phân khúc đó với kênh gọi điện (nhắm) · ghi kết quả
từng cuộc gọi và đọc tỷ lệ trả lời của phân khúc cạnh toàn tập (tiếp cận, đo).

Vòng đi từ Cổng Đáng (`opportunity.md` ký 2026-09-04). Bản thiết kế lật ba đề
xuất của hồ sơ Cổng Đáng theo bằng chứng thực địa cùng ngày: nguồn nhatot thay vì
batdongsan, làn cá nhân thay vì công ty, phân khúc là góc nhìn đã lưu có sẵn.

Source input: prompt · `_acceptance/tiep-thi-tuyen-doi-tac/opportunity.md` · `docs/superpowers/specs/2026-09-04-tiep-thi-tuyen-doi-tac-design.md`

## Criteria

- AC-1: Given cổng tiếp nhận có khoá bí mật đúng và một lô từ 1 đến 500 mục hợp lệ từ nhatot, When gửi lô, Then mỗi mục thành đúng một bản ghi cá nhân nguồn «sàn» với chín trường tuỳ chỉnh mang đúng giá trị của mục, và phản hồi báo đúng số tạo và số cập nhật.
- AC-2: Given một lô đã tiếp nhận, When gửi lại cùng lô với số tin đổi, Then không cá nhân nào được tạo thêm, số tin và mốc «sàn cập nhật lúc» đổi theo, tổng số cá nhân nguồn «sàn» không tăng; mục có số điện thoại thì đè số, mục vắng số điện thoại thì **giữ nguyên** số đang có trên bản ghi.
- AC-3: Given khoá bí mật sai, hoặc chưa cấu hình, hoặc một mục thiếu trường bắt buộc hay sai kiểu, When gửi lô, Then cổng từ chối lần lượt bằng 403, 503, 400 — lỗi 400 gọi tên mục và trường sai — và không cá nhân, không giá trị trường nào được ghi trong cả ba ca.
- AC-4: Given một lô hợp lệ, When tiếp nhận, Then không hàng việc nghiên cứu nào (`identify`) được xếp cho cá nhân từ sàn, và trạng thái làm giàu của họ là «bỏ qua».
- AC-5: Given kho chưa có trường nào từ sàn, When lô đầu tiên tiếp nhận, Then chín trường tuỳ chỉnh tồn tại trên thực thể cá nhân với khoá cố định và nhãn tiếng Việt, «Sản lượng» và «Hình thái» và «Chứng chỉ» lọc được trên màn cá nhân, và cả chín có `agentFilled` tắt.
- AC-6: Given nhân viên tiếp thị lọc màn cá nhân theo Sản lượng = Cao rồi lưu góc nhìn dùng chung, When mở hộp tạo chiến dịch và chọn góc nhìn đó, Then chiến dịch được tạo ở trạng thái nháp và danh sách thành viên của nó bằng đúng tập kết quả của bộ lọc đó tại thời điểm hỏi. (cross-layer)
- AC-7: Given một chiến dịch nháp, When nhân viên bấm Bắt đầu, Then trạng thái thành đang chạy với mốc bắt đầu; When bấm Kết thúc, Then thành đã kết thúc với mốc kết thúc; và một chiến dịch đã kết thúc không bắt đầu lại được.
- AC-8: Given chiến dịch đang chạy và một cá nhân trong phân khúc, When nhân viên ghi một trong năm kết quả cuộc gọi, Then một lượt gọi thuộc chiến dịch được lưu VÀ một hoạt động «gọi» xuất hiện trên dòng thời gian của cá nhân đó sau khi tải lại trang, cùng người ghi, cùng mốc thời gian, hai bản ghi được ghi trong một lần không tách rời (không có lượt gọi nào mà thiếu hoạt động, và ngược lại); hoạt động mang tiêu đề «<nhãn kết quả> · <tên chiến dịch>» và thân là ghi chú nếu có. (cross-layer)
- AC-9: Given chiến dịch ở trạng thái nháp hoặc đã kết thúc, When ghi kết quả cuộc gọi, Then bị từ chối với thông điệp nêu trạng thái hiện tại, và không lượt gọi, không hoạt động nào được tạo.
- AC-10: Given chiến dịch có lượt gọi, When mở trang chiến dịch, Then thấy số thành viên, đã gọi, trả lời, hẹn gặp, tỷ lệ trả lời, tỷ lệ hẹn của chiến dịch đặt cạnh cùng các số của **đối chứng = mọi chiến dịch khác** (không tính chính nó); mỗi số đếm trên cá nhân riêng biệt (một người gọi ba lần đếm một) và khớp truy vấn trực tiếp vào cơ sở dữ liệu; chưa gọi ai thì tỷ lệ hiện «—», và khi chưa có chiến dịch nào khác thì hàng đối chứng hiện «chưa có đối chứng» thay vì số.
- AC-11: Given góc nhìn đang được một chiến dịch dùng, When ai đó xoá góc nhìn, Then bị từ chối và thông điệp nêu tên chiến dịch đang dùng; góc nhìn không bị xoá.
- AC-12: Given nhân viên đọc tiếng Việt, When mở đủ **mười hai** trạng thái đã khai ở bảng trạng thái của bản thiết kế — ST-danh-sach-loading · ST-danh-sach-empty · ST-tao-khong-goc-nhin · ST-tao-dang-luu · ST-chien-dich-nhap · ST-chien-dich-dang-chay · ST-chien-dich-ket-thuc · ST-thanh-vien-rong · ST-thanh-vien-chua-so · ST-ghi-ket-qua-dang-luu · ST-ghi-ket-qua-loi · ST-so-do-chua-goi — Then mọi chữ giao diện là tiếng Việt, mọi giá trị trong kho chuỗi của tính năng mang dấu tiếng Việt, dữ liệu từ sàn hay người nhập không bị dịch (phần tử chứa chúng mang `translate="no"`), phép đo in tên đủ mười hai mã và thiếu một mã là hỏng; **ba** trạng thái đo ở mức đơn vị vì không dựng lại được trên đường thật — hai trạng thái rỗng toàn cục (ST-danh-sach-empty, ST-tao-khong-goc-nhin) và ST-danh-sach-loading — ghi ở Notes; chín trạng thái còn lại dựng trên trình duyệt.
- AC-13: Given mẫu trang danh bạ và trang hồ sơ nhatot đã lưu, When bộ cào chạy ở chế độ khô trên mẫu, Then lô đầu ra hợp lệ theo lược đồ tiếp nhận và mỗi mẫu ra đúng giá trị đã biết (tên chuyên trang, tên người theo giấy phép, tổng tin, tin mới 30 ngày, địa bàn, chứng chỉ, hình thái, mức sản lượng); và mẫu bị phá (xoá số tin) làm phép đo đỏ với thông điệp nêu tên trường.
- AC-14: Given bộ cào chạy thật một lượt giới hạn tối đa 50 hồ sơ trên nhatot với tuân thủ tệp khai báo máy quét bật, When đọc lô đầu ra và nhật ký lượt chạy, Then số hồ sơ lấy được, số bị chặn, tỷ lệ có số điện thoại và tứ phân vị tin mới 30 ngày được ghi lại, đủ để quyết lượt cào có mở được chiến dịch đầu không. (judgment)
- AC-15: Given hai màn mới, When chạy sàn kiểm thiết kế của kho, Then không lỗi P0 về trợ năng hay tương phản, và ở 768px tiêu đề cột bị cắt mang dấu ba chấm với chữ đầy đủ tới trình đọc màn hình.
- AC-16: Given chiến dịch ở trạng thái nháp hoặc đã kết thúc, When mở trang chiến dịch, Then bảng thành viên không có nút kết quả và trang đã kết thúc không có nút Bắt đầu; và When nhân viên bấm Kết thúc trên trang chiến dịch đang chạy, Then sau khi tải lại trang thấy huy hiệu «Đã kết thúc» kèm mốc, và bản ghi trong cơ sở dữ liệu ở trạng thái đã kết thúc với mốc kết thúc. (cross-layer)

## Coverage

Quét bằng skill `morphological-scan`, preset feature-quanh-một-entity với entity
trung tâm là **chiến dịch** (thành viên là cá nhân từ sàn). Chân sản phẩm dựng
từ kho (mục 13 bản thiết kế). Chân ngành: Apollo.io và HubSpot Sales Hub
(Sequences) `[NGÀNH: Apollo.io, HubSpot Sales Hub]` — cả hai đặt luồng «danh
sách → tiếp cận từng người → kết quả từng người → tỷ lệ» làm khuôn; Beike (mô
hình OneHub đã khai ở `CONTEXT.md`) `[NGÀNH: Beike]` cho ý «hồ sơ thành tích
theo người».

- Trục **vòng đời chiến dịch**: tạo | chọn phân khúc | bắt đầu | ghi kết quả | kết thúc | đọc số | sửa · xoá · lưu trữ | chuyển giao khi nghỉ [thước CE: preset entity-feature (lifecycle + actor) `[NGÀNH: Apollo.io]`] — Core: sáu giá trị đầu (AC-6…AC-11, AC-16 cho hai trạng thái chỉ đọc và nút Kết thúc trên giao diện); Later: sửa/xoá/lưu trữ, chuyển giao.
- Trục **đường dữ liệu vào**: gieo địa chỉ | tải hồ sơ | lộ số | tiếp nhận | cập nhật lại | bị chặn hoặc sai lược đồ [thước CE: bằng chứng thực địa 2026-09-04 `[SUY-TỪ-REPO: docs/superpowers/specs/2026-09-04-tiep-thi-tuyen-doi-tac-design.md]` mục 2 và 6] — Core: tất cả trừ «lộ số» chỉ có trần (AC-1…AC-5, AC-13, AC-14).
- Trục **người và quyền**: nhân viên tiếp thị tạo và ghi | thành viên khác cùng workspace xem và ghi | máy tiếp nhận bằng khoá | tác nhân KHÔNG được đụng chín trường [thước CE: luật «cộng thêm mở cho mọi thành viên» `[SUY-TỪ-REPO: docs/connections.md]`] — Core: bốn giá trị (AC-3, AC-5, AC-8); `[GIẢ ĐỊNH]` ai trong workspace cũng kết thúc được chiến dịch của người khác — người gạch tại cổng.
- Trục **trạng thái dữ liệu**: cá nhân chưa có số | cùng một chuyên trang gửi hai lần | số đổi giữa hai lượt | rời phân khúc giữa chiến dịch | tên chuyên trang dài | phân khúc rỗng | lô 500 mục [thước CE: preset ma-trận-kiểm nhánh biên `[SUY-TỪ-REPO: _acceptance/nhan-ung-dung-noi-tieng-viet/contract.md]`] — Core: chưa có số, gửi hai lần, số đổi, phân khúc rỗng, lô 500 (AC-1, AC-2, AC-12); Later: «rời phân khúc giữa chiến dịch» chấp nhận vì số đo chỉ đếm lượt gọi.

Cross-cutting áp mọi ô Core:

- Tiếng Việt có dấu, dữ liệu không dịch, `translate="no"` → AC-12 (kế thừa AC-7 và AC-12 của vòng nhãn).
- Dữ liệu cá nhân: chỉ lộ số cho người sắp gọi và có trần; không xếp việc nghiên cứu → AC-4, AC-14. Khung pháp lý: Luật Bảo vệ dữ liệu cá nhân 2025 (⏱ verify-current) — `[GIẢ ĐỊNH]` lời khai miệng của owner 2026-09-04 đủ cho vòng đầu, chưa có văn bản pháp chế trong hồ sơ — người gạch tại cổng.
- Vết: mỗi lượt gọi có người ghi và một hoạt động trên dòng thời gian → AC-8.
- Mười hai trạng thái khai trước (rỗng, đang tải, lỗi, chỉ đọc) → AC-12 và AC-16; sàn trợ năng → AC-15.

Ô cắt sang Never có tên: tạo bộ lọc trong trang chiến dịch (màn cá nhân đã
làm) · gửi hàng loạt (câu «gửi» pháp lý chưa trả lời).

## Đường đo

- Thước: ≥ 3 chiến dịch chạy trọn trong 4 tuần · số từ: bảng `Campaign` trạng thái đã kết thúc có ≥ 1 lượt gọi, mốc bắt đầu trong cửa sổ · bảo đảm bởi: AC-7, AC-8, AC-16
- Thước: ít nhất một phân khúc có tỷ lệ trả lời ≥ 2× đối chứng · số từ: hàng «chiến dịch» và hàng «đối chứng = mọi chiến dịch khác» trên trang chiến dịch, đếm trên cá nhân riêng biệt; chưa có chiến dịch khác thì hàng đối chứng hiện «chưa có đối chứng» và thước này CHƯA đọc được — phiên nghiệm thu cần ≥ 2 chiến dịch trên phân khúc khác nhau · bảo đảm bởi: AC-10
- Thước: đội không xuất bảng tính để chạy · số từ: không đo được trong sản phẩm — hỏi đội tại phiên nghiệm thu, ghi ở `opportunity.md` · bảo đảm bởi: đã có sẵn: phiên nghiệm thu
- bỏ đường-đo — đường nền tỷ lệ trả lời trước khi bật: hoạt động Gọi hiện có không mang kết quả nên không ra được tỷ lệ; đối chứng lấy từ các chiến dịch khác thay cho đường nền (entry d-20260904T130000Z-duongnen)

## Out of scope

- batdongsan làm nguồn — không có sản lượng ở thẻ lẫn hồ sơ; giá trị của nó là tổng đài công ty, mở cùng làn công ty ở vòng sau.
- Tạo hay sửa bộ lọc bên trong trang chiến dịch — màn cá nhân đã làm việc đó; chiến dịch chỉ chọn góc nhìn đã lưu.
- Lộ số điện thoại theo yêu cầu từ CRM — vòng đầu lộ số cho mức Cao với trần 200 mỗi lượt cào.
- Chỉnh ngưỡng sản lượng trong Cài đặt — vòng đầu ở tệp cấu hình của bộ cào.
- Gửi tin nhắn, email, hay gọi tự động hàng loạt — kênh duy nhất là người gọi và ghi; câu «gửi» pháp lý chưa có câu trả lời.
- Chấm điểm bằng mô hình học máy — luật đếm được trước.
- Lịch chạy bộ cào — vòng đầu chạy tay sau khi đọc lượt thật đầu tiên.
- Sửa, xoá, lưu trữ chiến dịch; chuyển giao khi nhân sự nghỉ.
- Người của ngân hàng phụ trách quan hệ (RM) và loại đối tác khác — «Hình thái» là một trường, không khoá vào môi giới.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Hạng T3 vì thêm hai bảng, ba enum và một giá trị enum vào `packages/db/prisma`; module API mới `apps/api/src/listings` và `apps/api/src/campaigns` không nằm trong đường T3.
- Biến môi trường mới `LISTING_INGEST_SECRET` (tuỳ chọn, vắng → cổng trả 503): khai ở `.env.example` và `apps/api/src/config/env.validation.ts`.
- Bộ cào chạy trong venv riêng tại `tools/listing-crawl/`, ghim `crawl4ai==0.9.2`; phép đo AC-13 chạy ở làn máy trên máy này, CI của hãng không có Python — ghi rõ ở gói Cổng Bằng chứng.
- Ngưỡng mức sản lượng 60/20/1 tin mới 30 ngày là đề xuất chưa có phân phối; AC-14 in tứ phân vị để owner chỉnh trước chiến dịch đầu.
- Thông điệp lỗi máy chủ (403/503/400, từ chối ghi kết quả) vẫn tiếng Anh theo phạm vi vòng ④ của hồ sơ tiếng Việt; giao diện hiện nguyên văn như AC-3 vòng nhãn.
- Lời khai pháp lý của owner là lời khai miệng tại Cổng Đáng; bước này nên đính một dòng xác nhận bằng văn bản vào `opportunity.md`.
- **Giới hạn đã khai — trạng thái đang-tải của màn danh sách không hiện trên đường thật.** Trang nạp trước danh sách ở máy chủ rồi trao sang trình duyệt, nên cờ đang-tải không bao giờ bật ở lượt đầu; nhánh đó chỉ chạy khi lượt nạp trước hỏng. Nó đo ở mức đơn vị cùng hai trạng thái rỗng toàn cục. Lệnh tái lập: `cd apps/app && bun test test/campaign-states.spec.ts`.
- **Giới hạn đã khai — câu lỗi máy chủ vẫn tiếng Anh.** Khi cổng từ chối ghi kết quả, thông báo nổi hiện nguyên văn câu của máy chủ. Đó là phạm vi vòng ④ của hồ sơ tiếng Việt, đã khai ở Out of scope của hồ sơ đó. Chặn `chu` **ghi lại nguyên văn chữ hiện ra** thay vì trừ nó đi lặng lẽ — cùng nếp với AC-3 của vòng nhãn, để chỗ đứt nằm trong hồ sơ chứ không bị giấu.
- **VIỆC CỦA NGƯỜI — sàn không có con số «tin mới 30 ngày» riêng.** Đo ở vòng sửa sau nghiệm thu 1, trên 49 hồ sơ thật: thẻ danh bạ, ô «Tin hiện có», ô «tin mới · Trong 30 ngày», và hai khoá trong dữ liệu nhúng **luôn trả cùng một số**. Nghĩa là trường «Tin mới 30 ngày» hiện mang đúng giá trị của «Tin đang đăng», và mức sản lượng thật ra xếp theo **tổng tin đang đăng**, không theo độ tươi. Máy KHÔNG tự bỏ trường hay đổi tên ngưỡng — hai đường đi tiếp là (a) bỏ «Tin mới 30 ngày», đổi tên ngưỡng theo tổng tin, hoặc (b) tìm nguồn khác cho độ tươi. Một bài kiểm ghim lời khai này (`test_nhatot_chi_cong_bo_mot_con_so_cho_ca_hai_truong`): ngày sàn tách hai số ra, bài đó đỏ và nhắc mở lại quyết định.
- **Giới hạn đã khai — bộ lọc «chưa gọi» quét có trần.** Danh sách thành viên không loại được người đã gọi bằng một câu truy vấn (bộ lọc cá nhân không nhận vế loại trừ), nên máy quét góc nhìn theo lô một trăm và dừng ở năm nghìn. Phân khúc nhỏ hơn trần thì tổng số đúng; lớn hơn trần thì tổng số hụt và bộ lọc bỏ sót người ở cuối. Vòng đầu chốt phân khúc một quận nên chưa chạm trần. Lệnh tái lập: tạo góc nhìn khớp hơn năm nghìn cá nhân rồi bật «Chưa gọi» — tổng số dừng ở trần.
- **Giới hạn đã khai — hai trạng thái rỗng toàn cục.** «Chưa có chiến dịch nào» và «chưa có góc nhìn cá nhân dùng chung» chỉ tồn tại trước chiến dịch đầu tiên của workspace duy nhất, nên phép đo trình duyệt không dựng lại được sau lượt đầu. Chúng đo ở mức đơn vị: hàm chọn trạng thái thuần và chuỗi trong kho (`apps/app/test/campaign-states.spec.ts`). Lệnh tái lập: `cd apps/app && bun test test/campaign-states.spec.ts`.
- Lược đồ JSON mà bộ cào dùng để tự kiểm (`tools/listing-crawl/schemas/listing-ingest.schema.json`) do một script `bun` sinh từ chính lược đồ Zod; một bài kiểm so bản đã commit với bản sinh lại, lệch là đỏ — không có bản chép tay nào giữa hai ngôn ngữ.
- Phản biện context sạch 2026-09-04 (`gap-probe.md`): một P0 về đường đo đã sửa trong bản này nhưng **ngưỡng vẫn là của người** — người ký Cổng Phạm vi đọc lại hai dòng đường đo còn lại và dòng bỏ có tên.
