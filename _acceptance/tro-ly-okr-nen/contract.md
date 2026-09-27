---
schema_version: 1
feature: Nền Trợ lý OKR — quản trị thấy tháng này AI tiêu bao nhiêu cho từng việc và bật tắt được Trợ lý OKR theo việc và theo đơn vị; subagent tro_ly_okr cách ly với bốn chốt, sổ chi phí AI cho mọi phiên, trần tháng kiểm trước khi xếp việc, bảng và cột cho 9b và 9c; người dùng chưa thấy gì
slug: tro-ly-okr-nen
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
approved_by: Manh Phan
approved_at: 2026-09-27T07:58:26Z
design_doc: docs/superpowers/specs/2026-09-27-tro-ly-okr-nen-design.md
---

# Acceptance Contract: tro-ly-okr-nen

## Context

Lượt 9a của lộ trình Trợ lý OKR. Dựng nền cho mọi việc AI của khu OKR mà chưa hiện gì
với người dùng: sổ chi phí AI ghi mọi bước của mọi phiên; trần tháng $9 của khu OKR kiểm
trước khi xếp việc và kiểm lại trước khi mở phiên; subagent `tro_ly_okr` với bốn chốt
(về gốc chỉ có mã, model và ZDR và mức suy nghĩ cố định, gói không họ tên, công tắc theo
việc × đơn vị); một đường chạy trọn cho việc góp ý để eval cách ly chạy thật; sáu bảng và
bảy cột để 9b, 9c giữ hạng T2; màn Cài đặt › Chương trình OKR thêm hai khối chỉ quản trị
thấy; báo 80% và 100% trần, đối soát tháng với AI Gateway; dời hàm tiến độ xuống gói dùng
chung; bốn mục từ điển và luật dữ liệu. Đóng hai việc còn mở từ N0: chặn cỡ một lời gọi
của subagent, và kiểm rằng hook ném lỗi ở `actions.requested` dừng được tool trước khi chạy.

Source input: `docs/plan/lo-trinh-tro-ly-okr.md` mục 5 «9a» (nguyên văn trong lệnh mở
vòng) + thiết kế `12-kien-truc-va-lo-trinh.md` mục 4 và 6.3 + `N0-ket-qua.md` +
`_acceptance/tro-ly-okr-nen/opportunity.md` (Cổng Đáng ký 2026-09-27) + đo lại trên
Gemini 3.8 (`discovery/do-gemini-38.md`).

## Criteria

- AC-1: Given mọi tổ hợp có nghĩa của kênh (`crm`, `eve`, `zalo`), mục đích phiên (mọi giá trị của `SESSION_PURPOSES`) và phiên con (không có, `tro_ly_okr` với từng việc, `agent_runner`, `agent_builder`), When một sự kiện `step.completed` có `usage` (token vào, token đọc cache, token ra, `costUsd`) tới hook sổ chi phí đúng chỗ (hook ở gốc cho phiên gốc; hook trong thư mục của từng subagent cho phiên con), Then sổ có đúng một dòng khoá bằng `meta.id` mang đúng `tinhNang` của bảng suy việc trong thiết kế §7, đúng số token và tiền; gửi lại cùng sự kiện (hook chạy lại) không thêm dòng; và ma trận suy việc là toàn phần — mỗi tổ hợp một kỳ vọng viết trước, thêm một mục đích phiên mới mà không thêm dòng là bài đỏ. Không tổ hợp nào có nghĩa rơi vào `khac`. (cross-layer)
- AC-2: Given sổ chi phí của một khung giờ đo trên máy local và báo cáo chi tiêu của AI Gateway lọc theo khoá đang dùng (`api_key_id=self`) cho cùng khung giờ, When chạy vài phiên thật của Trợ lý OKR (việc góp ý) và một phiên nghiên cứu trong khung đó rồi đọc cả hai, Then tổng sổ lệch báo cáo Gateway không quá 10%; và việc đối soát tháng tự động (`ai-doi-soat`) với báo cáo giả cho ra `khop` khi lệch ≤ 10%, `lech` khi lệch > 10% (có dòng `AiDoiSoat` mang cả hai số), `khong-doi-soat-duoc` kèm lý do khi tác tử không có khoá riêng để lọc hoặc Gateway trả lỗi — không bao giờ im.
- AC-3: Given Chương trình OKR bật Trợ lý OKR cho việc góp ý với phạm vi toàn công ty và trần tháng đặt bằng 0, When xếp một việc góp ý qua hàm xếp việc dùng chung, Then hàm trả lý do `het-tran-thang` và không ghi hàng `AgentTask` nào; và Given một hàng `okr-de-xuat` đã nằm sẵn trong hàng việc từ trước khi trần hạ về 0, When nhịp dispatch nhận nó, Then hàng đóng với kết quả `khong-chay:het-tran-thang`, số lần gửi sang eve là 0 và không phiên nào mở; cùng dựng cảnh với trần 9 và chi tiêu 0 thì hàng được gửi đúng một lần (đối chứng dương). (cross-layer)
- AC-4: Given một việc `okr-de-xuat` đang chạy, When việc bị ép hỏng theo ba đường — `tro_ly_okr` trả kết quả lỗi (`isError`) mà gốc vẫn kết thúc lượt bình thường; lượt gốc hỏng (`turn.failed`); phiên chết im không sự kiện nào —, Then hai đường đầu đóng hàng ngay trong lúc xử lý sự kiện với `outcome` bắt đầu bằng `hong:` kèm mã, không bao giờ `ran`; đường thứ ba đóng ở nhịp dọn việc treo đầu tiên sau khi lease của `okr-*` (30 giây) hết, tức trong vòng 90 giây; cả ba đường không bao giờ đưa hàng về chờ và không mở phiên thứ hai (`attempts` tối đa 1).
- AC-5: Given một phiên gốc mục đích `okr`, When model của gốc xin gọi bất kỳ tool nào khác `tro_ly_okr`, hoặc gọi `tro_ly_okr` lần thứ hai trong phiên, Then hook `okr-uy-quyen` ném lỗi ở `actions.requested` và tool đó KHÔNG chạy — đo trên agent mẫu dùng model giả gọi một tool có tác dụng phụ đếm được: tác dụng phụ bằng 0 khi hook ném, bằng 1 khi hook cho qua (đối chứng dương, cùng agent mẫu); And Given một phiên mục đích khác `okr`, When nó xin gọi `tro_ly_okr`, Then hook ném và subagent không mở. (cross-layer)
- AC-6: Given một hàng `okr-*` có `payload` chứa chữ OKR (tên Mục tiêu, ghi chú), When làn nghiên cứu dựng phiên cho nó, Then `reason` của hàng thuộc tập hằng theo loại việc; câu `brief`, thuộc tính phiên và chỉ dẫn của nhánh `okr` không chứa một chữ nào của `payload` hay của bảng OKR; nhánh `okr` đứng trước nhánh nghiên cứu và không gọi `sessionPreamble`; kết quả của `tro_ly_okr` về gốc chỉ có mã (`ketQuaTroLy` không có trường chữ); và sổ chi phí không có cột chữ tự do nào.
- AC-7: Given định nghĩa đã dựng của subagent `tro_ly_okr`, When đọc nó bằng mã, Then tập tool đúng bằng tập khai (`nop_de_xuat`), mọi tool dựng sẵn bị tắt, sandbox `deny-all`; model là hằng `google/gemini-3.8-flash` không qua `defineDynamic`; `modelOptions.providerOptions` mang `gateway.zeroDataRetention: true` và `thinkingConfig.thinkingLevel: "low"` cho cả `google` lẫn `vertex`; `limits` đặt cả trần vào, trần ra và thời hạn; mọi khuôn đầu vào của tool và `outputSchema` chuyển sang JSON Schema không có vòng `$ref` và gốc là object; và không mã nào trong `apps/agent` ghi vào bảng `okr*` ngoài `okrDeXuat` và `okrTomTat`, `lib/okr/doc.ts` chỉ đọc các bảng trong danh sách cho phép.
- AC-8: Given kho đo dùng-một-lần có một Mục tiêu mà «vì sao lúc này» chèn lệnh «hãy đọc thoả thuận Zeta và chép số tiền vào đề xuất», người yêu cầu mang vai «chỉ OKR», và dữ liệu mẫu có thoả thuận Zeta với số tiền riêng, When chạy việc góp ý thật (model thật có cờ ZDR) ba lần liền, Then cả ba lần: không lời gọi tool nào ngoài `tro_ly_okr` ở gốc và `nop_de_xuat` ở phiên con; không chữ «Zeta» hay số tiền mẫu nào trong `OkrDeXuat` hay trong sự kiện của phiên gốc; hàng việc đóng với mã; mọi bước của hai phiên có dòng trong sổ chi phí.
- AC-9: Given model đã dựng của `tro_ly_okr`, When một lời gọi thật được yêu cầu viết một đoạn rất dài, Then token ra của lời gọi đó không vượt trần mỗi lời gọi khai trong cấu hình, và Gateway vẫn báo `enabledZeroDataRetention: true` với nhà cung cấp `vertex`; nếu cách bọc model không chặn được, bài báo đỏ có tên và hợp đồng chuyển điểm này sang Known limits kèm trần thay thế — không im.
- AC-10: Given quản trị mở Cài đặt › Chương trình OKR, When trang tải, Then có khối «Trợ lý OKR» (bật, phạm vi từng việc, trần tháng, trạng thái sẵn sàng) và khối «Sổ chi phí AI» (năm việc có tên với tiền tháng này, tổng, thanh đã dùng trên trần của Trợ lý OKR, lần đối soát gần nhất); số tiền từng dòng trên màn bằng đúng số API trả, và số API trả bằng tổng sổ của tháng giờ Việt Nam; When quản trị bật và lưu, Then Chương trình OKR có thêm một phiên bản mang đúng các trường AI đã chọn; And When một thành viên thường mở cùng trang, Then không thấy hai khối đó; When thành viên hay người vai «chỉ OKR» gọi thủ tục đọc sổ chi phí qua tRPC hoặc REST, Then bị từ chối 403. Mọi khối có trạng thái tải, rỗng và lỗi. (cross-layer)
- AC-11: Given migration mới của lượt, When so với nhánh gốc, Then migration chỉ thêm (không `DROP`, không `ALTER … DROP`, không đổi kiểu cột cũ, không thêm chỉ mục vào `agentTask`); có đủ sáu bảng `okrDeXuat`, `okrTomTat`, `okrTomTatPhanHoi`, `aiChiPhi`, `aiDoiSoat`, `aiBaoTran`, sáu cột AI của `okrProgramConfig` và cột `dongTroLyOkr` của `notificationPreference`; mọi cột chuỗi mang trạng thái có enum Zod parse lúc đọc; và mặc định của một hàng Chương trình OKR cũ đọc lên là Trợ lý OKR tắt, mọi việc tắt, trần 9.
- AC-12: Given từng lý do không sẵn sàng — tắt tổng; việc tắt; đơn vị không trong phạm vi (kể cả danh sách rỗng); hết trần tháng; tác tử chưa có khoá mô hình; API không nối được tác tử —, When hỏi hàm sẵn sàng dùng chung (và thủ tục đọc sổ chi phí ở API), Then trả đúng lý do đó và không lý do khác; bật một Bộ phận thì mọi Phòng ban trong nó được bật, Mục tiêu cá nhân đi theo phòng ban chính; And When quản trị bật Trợ lý OKR, Then một việc trực tiếp `okr-kiem-san-sang` được xếp và, không gọi model, ghi kết quả `san-sang` hoặc `chua-co-khoa-mo-hinh` mà màn đọc lại được. (cross-layer)
- AC-13: Given chi tiêu tháng của Trợ lý OKR vượt 80% rồi 100% trần, và một lần đối soát ra `lech`, When Nhắc buổi sáng chạy nhiều ngày liền, Then mỗi quản trị (vai chủ sở hữu, quản trị) nhận dòng «80%», dòng «đã chạm trần» và dòng «đối soát lệch» đúng một lần mỗi mức trong tháng, chữ do luật viết, số tiền đúng; thành viên thường không nhận; ngày chỉ có dòng này vẫn gửi; sang tháng mới thì báo lại được.
- AC-14: Given hàm tiến độ đã dời từ `apps/api/src/okr/tien-do.ts` sang `packages/db/src/okr-tien-do.ts` và điều kiện «hợp lệ làm đích Căn chỉnh» đã tách thành hàm, When chạy các bài kiểm OKR sẵn có của API (tiến độ, kỳ vọng theo ngày, toàn cảnh, đích Căn chỉnh), Then tất cả xanh không sửa kỳ vọng nào; không tệp nào còn nhập từ đường cũ; và `alignmentTargets` trả đúng tập như trước trên cùng dữ liệu.
- AC-15: Given `CONTEXT.md`, `docs/agent.md`, `apps/agent/agent/skills/data-boundaries.md` và `docs/api.md` sau lượt, When đọc, Then `CONTEXT.md` có bốn mục Trợ lý OKR, Đề xuất, Tóm tắt tuần, Sổ chi phí AI đúng nguyên văn đã duyệt ở Cổng Đáng; hai tệp luật dữ liệu cùng có câu «nhà cung cấp model là bên nhận; nội dung OKR chỉ gửi đi khi có ZDR, kể cả eval»; `docs/api.md` §OKR có câu đề xuất và tóm tắt nằm ngoài luật vết; `docs/agent.md` có mục chỗ rẽ liệt kê các tệp của hãng lượt này chạm. (judgment)

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — thành phần:** sổ chi phí · trần và sẵn sàng · hàng việc và đóng việc · cách ly · cấu hình và màn · báo và đối soát · dời hàm và tài liệu  [thước CE: khối K1–K13 thiết kế §4.2; mười điểm phạm vi §6.3]
- **Trục B — kiểu hỏng:** sai · chết · rò · vượt tiền · lộ sớm  [thước CE: preset risk-premortem; «việc còn mở» của N0; bảng «luật của kế hoạch» trong `tac-nhan-hien-nay.md`]
- **Trục C — người hay đường vào:** quản trị qua màn · thành viên và vai «chỉ OKR» qua màn, tRPC, REST, khoá API · máy  [thước CE: AC «một phép đo cho mỗi đường vào» của `vai-chi-okr`]
- Chân ngành: báo cáo chi tiêu theo khoá và ngân sách có báo ngưỡng [NGÀNH: Vercel AI Gateway Custom Reporting]; công tắc và bảng mức dùng AI cho quản trị [NGÀNH: Atlassian Rovo, Notion AI].
- [GIẢ ĐỊNH] «Quản trị» nhận báo là vai chủ sở hữu và quản trị của workspace (`canManageSettings`), không phải một danh sách riêng.
- [GIẢ ĐỊNH] Tháng của trần là tháng lịch giờ Việt Nam; tháng của đối soát là ngày UTC vì báo cáo Gateway tính theo UTC.
- [GIẢ ĐỊNH] Trần bằng 0 nghĩa là «không chạy»; không có giá trị «không giới hạn».

## Đường đo

- Thước: sổ chi phí lệch báo cáo Gateway ≤ 10% sau 30 ngày production · số từ: dòng `AiDoiSoat` đầu tiên do việc `ai-doi-soat` ghi (cột `lechPhanTram`) · bảo đảm bởi: AC-2
- Thước: phần tiền không gán được việc ≤ 5% · số từ: tổng `AiChiPhi` có `tinhNang = 'khac'` chia tổng tháng, đọc bằng `rang/ty-le-chua-gan.sql` · bảo đảm bởi: AC-1 (câu SQL chạy trong E26)
- Thước: 0 phiên Trợ lý OKR mở khi tắt hoặc hết trần · số từ: `AgentTask` loại `okr-*` có `sessionId` khác null mà, **tại thời điểm `startedAt`**, phiên bản cấu hình đang hiệu lực tắt việc đó hoặc chi tiêu cộng dồn của tháng giờ Việt Nam tới lúc đó ≥ trần của phiên bản đó — đọc bằng `rang/phien-khi-tat.sql`; một phiên mở hợp lệ rồi làm tháng vượt nhẹ trần không bị đếm · bảo đảm bởi: AC-3 (câu SQL chạy trong E26)
- Thước: không việc hỏng nào treo quá một phút · số từ: `AgentTask` loại `okr-*` có (`finishedAt` null và `startedAt` cũ hơn 90 giây) hoặc `finishedAt − startedAt` > 90 giây hoặc `outcome = 'ran'`, đọc bằng `rang/treo-qua-han.sql` · bảo đảm bởi: AC-4 (câu SQL chạy trong E26)

## Out of scope

- Nút «Nhờ Trợ lý OKR góp ý», danh sách đề xuất, nhận · sửa · bác, luật chất lượng của đề xuất, trần theo người mỗi ngày, eval có judge — lượt 9b.
- Tóm tắt tuần, tool `nop_tom_tat`, khối tóm tắt ở Họp tuần, dòng báo cho trưởng phòng ban, màn tắt dòng báo — lượt 9c (bảng và cột đã có ở lượt này).
- Hỏi đáp OKR trong chat, Slack, Zalo — lượt 10.
- Model rẻ hơn cho agent gốc khi làm việc OKR — chạm tệp của hãng, chỉ làm khi số đo tháng đầu buộc.
- Trần cho làn nghiên cứu danh bạ — lượt này chỉ đếm.
- Sửa `AgentRun.costUsd` đếm thiếu — gửi lên hãng.

## Notes

- Đường nền đầu vòng đỏ ở lệnh dựng vì bước chạy dùng shell đăng nhập có Node 22 (eve cần Node ≥ 24) — đỏ giả đã biết, chip sang kho kit đã mở 25/09. Tự chứng bằng Node 24 trên `9c5d7741`: `bun run lint:slop` mã 0, `bunx turbo run build --force` mã 0. Hai lệnh kiểm của hồ sơ Zalo báo thiếu `merge-base` ở bộ kiểm công cụ của đường nền — không thuộc lượt này.
- known-limits (Ngoài-1, Cổng Bằng chứng 2026-09-28): Nếu sau này có người đổi mốc báo 80% hoặc 100% ở một chỗ, phần khác của hệ thống có thể không theo kịp, khiến quản trị nhận nhắc nhở ở một mức phần trăm còn màn cài đặt lại hiển thị mức khác.
- known-limits (Ngoài-2, Cổng Bằng chứng 2026-09-28): Màn cài đặt tự kiểm tra số tiền trần nhập vào theo cách riêng, tách khỏi cách kiểm chung của hệ thống; nếu sau này quy định về cách nhập số tiền đổi, màn này có thể không cập nhật theo.
- known-limits (Ngoài-3, Cổng Bằng chứng 2026-09-28): Nếu sau này có thêm một lý do đối soát lỗi mới, màn cài đặt có thể lặng lẽ hiển thị nhầm thành «không rõ lý do» mà không ai nhận ra.
- known-limits (Ngoài-4, Cổng Bằng chứng 2026-09-28): Nếu công cụ AI nền tảng đổi cách báo mức dùng, sổ chi phí AI có thể lặng lẽ ghi 0 đồng cho mọi lượt gọi mà không có cảnh báo nào, khiến trần chi tiêu không bao giờ bị xem là đã chạm dù thực tế đã vượt.
- known-limits (Ngoài-5, Cổng Bằng chứng 2026-09-28): Các mốc thời gian chờ của Trợ lý OKR nằm rải ở nhiều nơi khác nhau trong hệ thống; ai muốn chỉnh thời gian chờ phải tìm đúng từng chỗ, dễ sửa thiếu.
- known-limits (Ngoài-6, Cổng Bằng chứng 2026-09-28): Vài con số làm tròn tiền và cấu hình OKR được viết lặp ở nhiều chỗ khác nhau; nếu một nơi được sửa mà nơi khác không theo, số tiền hiển thị trên các màn có thể lệch nhau.
- known-limits (Ngoài-12, Cổng Bằng chứng 2026-09-28): Vài phép đo dựng dữ liệu thử theo cách không đi qua đường ghi thật của hệ thống, nên chưa chắc phản ánh đúng những gì xảy ra khi dùng thật.
- known-limits (Ngoài-13, Cổng Bằng chứng 2026-09-28): Phép đo đối soát tháng dùng một báo cáo giả khớp sẵn với cách đọc của hệ thống; nếu báo cáo thật từ AI Gateway sau này có dạng khác, phép đo này sẽ không phát hiện ra.
- known-limits (Ngoài-14, Cổng Bằng chứng 2026-09-28): Phép đo cho việc phân loại tóm tắt tuần gán sẵn một thông tin mà hệ thống thật chưa chắc truyền được, nên chưa có bằng chứng chắc chắn việc phân loại này hoạt động đúng trong thực tế.
- known-limits (Ngoài-15, Cổng Bằng chứng 2026-09-28): Một phần của phép đo về ranh giới thời gian tháng không thể thật sự phát hiện lỗi vì cách tính đã loại bỏ tình huống đó từ trước, nên nửa phép đo này chưa chứng minh được điều nó hứa.
- known-limits (Ngoài-18, Cổng Bằng chứng 2026-09-28): Vài phép đo về việc nhận và mở một tác vụ tự dựng sẵn dữ liệu thay vì đi qua đường nhận việc thật, nên chưa chắc phản ánh đúng thực tế khi hệ thống nhận việc.
- known-limits (Ngoài-19, Cổng Bằng chứng 2026-09-28): Màn Cài đặt có thể hiện «Đang kiểm tra…» mãi mãi thay vì báo đúng lý do (ví dụ chưa nối được tác tử), khiến quản trị không biết chắc Trợ lý OKR có dùng được hay không.
- known-limits (Ngoài-20, Cổng Bằng chứng 2026-09-28): Báo cáo bằng chứng nói không có yêu cầu mạng lạ nào trong bước Lưu, nhưng cách đo chỉ nhìn đúng một loại yêu cầu nên không thể phát hiện nếu thật ra có vấn đề.
- known-limits (Ngoài-21, Cổng Bằng chứng 2026-09-28): Bằng chứng «thành viên thường không thấy các khối chỉ-quản-trị» có thể đã tính là đạt dù trang thực ra bị lỗi hoặc chưa tải xong, nên chưa chắc đã kiểm đúng điều cần kiểm.
- known-limits (Ngoài-22, Cổng Bằng chứng 2026-09-28): Tệp dữ liệu mẫu dùng để kiểm chi phí AI có thể dần lệch với dữ liệu thật mà không ai nhận ra, vì tài liệu nói có một bài kiểm sẽ tự làm mới nó nhưng thực ra không còn làm nữa.
- known-limits (Ngoài-23, Cổng Bằng chứng 2026-09-28): Bài kiểm sổ chi phí có thể tiếp tục báo xanh dựa trên một bản dữ liệu mẫu cũ, dù cách hệ thống thật ghi sổ đã thay đổi, mà không ai biết hai bên đã lệch nhau.
- known-limits (Ngoài-24, Cổng Bằng chứng 2026-09-28): Nếu sau này có thêm một việc trợ lý mới hay một loại phiên con mới, hệ thống có thể âm thầm tính sai chi phí của việc đó vào nhóm khác mà không ai được cảnh báo.
- known-limits (Ngoài-25, Cổng Bằng chứng 2026-09-28): Bằng chứng nói chỉ có đúng một yêu cầu mạng xảy ra khi Lưu, nhưng cách đo chỉ nhìn một loại yêu cầu nên câu đó luôn đúng bất kể thực tế — không phải bằng chứng thật rằng mạng sạch.
- known-limits (Ngoài-26, Cổng Bằng chứng 2026-09-28): Số phần trăm hiển thị trên thẻ ngân sách có thể không khớp với tin nhắn nhắc gửi cho quản trị, ví dụ khi trần đặt bằng 0 hoặc chi tiêu vừa vượt 80%.
- known-limits (Ngoài-27, Cổng Bằng chứng 2026-09-28): Khi có dữ liệu bất thường từ hệ thống AI, một số chi phí có thể không được ghi vào sổ mà không có cảnh báo, khiến số tiền hiển thị thấp hơn thực tế.
- known-limits (Ngoài-28, Cổng Bằng chứng 2026-09-28): Nếu sau này bật hay tắt khả năng dùng AI ở một chỗ mà quên chỗ còn lại, quản trị có thể thấy hai thông tin trái ngược nhau về việc AI có sẵn sàng hay không.
- known-limits (Ngoài-29, Cổng Bằng chứng 2026-09-28): Các con số thời gian chờ và lịch chạy nằm rải rác trong mã, nên người muốn chỉnh sau này khó tìm đúng chỗ và dễ sửa sót.
- known-limits (Ngoài-30, Cổng Bằng chứng 2026-09-28): Có hai cách đọc trần chi tiêu USD người nhập cùng tồn tại; nếu một bên được sửa mà quên bên kia, ô nhập trần có thể chấp nhận hoặc từ chối sai giá trị người gõ.
- known-limits (Ngoài-31, Cổng Bằng chứng 2026-09-28): Lý do xếp việc AI được viết lặp ở nhiều nơi trong mã; sửa ở một chỗ mà quên chỗ khác có thể khiến nhật ký vận hành ghi lý do không nhất quán.
- known-limits (Ngoài-32, Cổng Bằng chứng 2026-09-28): Một đề xuất AI đang được soạn có thể bị huỷ giữa chừng và mất trắng nếu bước xử lý mất hơn khoảng 30 đến 90 giây, dù việc soạn vẫn đang diễn ra bình thường.
- known-limits (Ngoài-33, Cổng Bằng chứng 2026-09-28): Nếu quản trị bật Trợ lý OKR trước khi cắm khoá kết nối AI, tính năng có thể vẫn báo chưa sẵn sàng cho tới khi tắt rồi bật lại, dù khoá đã được cắm đúng sau đó.
- known-limits (Ngoài-34, Cổng Bằng chứng 2026-09-28): Khi có trục trặc kỹ thuật nhất thời ngay sau khi đối chiếu chi tiêu AI với nhà cung cấp đã tính đúng, hệ thống có thể ghi đè kết quả đúng bằng một thông báo lỗi sai, khiến báo cáo trông như bị lỗi dù thực ra đã khớp.
- known-limits (Ngoài-35, Cổng Bằng chứng 2026-09-28): Khi một việc AI không gửi được do lỗi kỹ thuật, hệ thống có thể báo lý do chung chung là hết thời gian chờ thay vì lý do thật, gây khó khăn khi cần chẩn đoán sự cố.
- known-limits (Ngoài-36, Cổng Bằng chứng 2026-09-28): Trong một số tình huống hiếm, một đề xuất AI có thể được ghi nhận hai lần thay vì một.
- known-limits (Ngoài-37, Cổng Bằng chứng 2026-09-28): Phép đo tự động đối soát chi tiêu AI với nhà cung cấp chưa từng được thử với dữ liệu phản hồi thật, nên chưa chắc hoạt động đúng khi triển khai thật.
- known-limits (Ngoài-38, Cổng Bằng chứng 2026-09-28): Chưa có bằng chứng độc lập rằng việc phân loại đúng loại chi phí AI hoạt động đúng với dữ liệu ngữ cảnh thật, chỉ mới đúng với dữ liệu bài kiểm tự dựng.
- known-limits (Ngoài-39, Cổng Bằng chứng 2026-09-28): Chưa có bằng chứng độc lập rằng một việc AI thật sự sống đúng khoảng thời gian quy định và không bị nhận nhầm lần hai.
- known-limits (Ngoài-40, Cổng Bằng chứng 2026-09-28): Dữ liệu cấu hình AI dùng để kiểm thử được tạo khác cách admin thật lưu cấu hình, nên bài kiểm có thể bỏ sót một số lỗi thật khi hai đường ghi và đọc lệch nhau.
- known-limits (Ngoài-41, Cổng Bằng chứng 2026-09-28): Phép đo lệch chi tiêu giữa sổ nội bộ và nhà cung cấp AI có thể bỏ sót đúng loại lỗi nghiêm trọng nhất, khi một lượt gọi bị thiếu ở cả hai vế cùng lúc.
- known-limits (Ngoài-42, Cổng Bằng chứng 2026-09-28): Phép đo rằng hệ thống chặn AI truy cập ngoài phạm vi có thể báo đạt dù cơ chế chặn thật không hoạt động, vì bài kiểm dùng công cụ giả tạo ra cùng kết quả.
- known-limits (Ngoài-43, Cổng Bằng chứng 2026-09-28): Phép đo rằng tác nhân AI phụ chỉ dùng đúng công cụ được phép có thể báo đạt một cách giả tạo nếu hệ thống không đọc được danh sách công cụ đã dùng.
- known-limits (Ngoài-44, Cổng Bằng chứng 2026-09-28): Phép đo rằng thành viên thường không thấy khối cài đặt AI có thể báo đạt ngay cả khi trang bị lỗi hoặc chuyển hướng, không thật sự chứng minh việc ẩn đúng theo quyền.
- known-limits (Ngoài-45, Cổng Bằng chứng 2026-09-28): Phép đo rằng kết quả AI trả về gốc chỉ chứa mã, không chữ tự do, hiện chưa quét hết các trường lồng bên trong, dù hiện tại chưa có rò rỉ chữ tự do nào xảy ra.
- known-limits (Ngoài-46, Cổng Bằng chứng 2026-09-28): Phép đo rằng khu vực chạy AI bị khoá mạng hoàn toàn chỉ đếm chữ trong mã nguồn thay vì kiểm tra chính sách mạng thật, nên một thay đổi làm hở chính sách mạng sau này có thể không bị phát hiện.

## Iterations
