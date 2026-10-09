---
schema_version: 1
feature: "Soạn OKR mở trong khung bản ghi như deal (?record=soan:<cuộc>), Kara cố định ở mép phải với bề ngang chuẩn, bản nháp mở thêm về bên trái, hai ô có khung liền, khung cao hết màn, dưới 768 px phủ toàn màn hai tab, đang soạn thì không lỡ tay đóng và đóng không giết lượt"
slug: soan-okr-trong-khung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-09
design_doc: docs/superpowers/specs/2026-10-09-soan-okr-trong-khung-design.md
---

# Acceptance Contract: soan-okr-trong-khung

## Context

Chủ kho lật quyết định 04/10 của K2 (`soan-okr-trang-rieng`, #312, chưa UAT) ngày 09/10: cuộc soạn mở như khung chi
tiết deal; Kara cố định ở mép phải; bản nháp mở thêm về bên trái; mỗi ô một bề ngang chuẩn; khung cao hết màn; cột
chat hiện «như bị mất khung» (khung ngoài của cột chat). Chủ kho duyệt hình phác ba trạng thái trong phiên.

Source input: tin chủ kho 09/10 cùng hai ảnh (khung Mục tiêu, trang Soạn OKR) · design doc · `docs/ai-ux.md` ·
`docs/design.md` · `docs/agent-panel.md` · hợp đồng K2.

## Criteria

- AC-1: Given một trưởng phòng ở Theo đơn vị của phòng mình trong pha lập kế hoạch, When bấm «Soạn» (chưa có cuộc) hoặc «Tiếp tục» (có cuộc), mở đường cũ `/<slug>/okr/soan/<id>`, mở link cũ `…/okr/theo-don-vi?…&cuocSoan=<id>`, hoặc mở `?record=soan:<id không có>`, Then đường vẫn là Theo đơn vị và URL mang `record=soan:<id>`, khung bản ghi trượt từ phải với nội dung cuộc soạn, không có trang `/okr/soan/` nào được dựng; đường cũ và link cũ thành Theo đơn vị của đúng đơn vị và chu kỳ của cuộc mà không thêm mục lịch sử; id không có thì khung hiện lỗi «Kara chưa mở cuộc soạn được» và đóng được.
- AC-2: Given người đang ở một trang khác của không gian làm việc (Thoả thuận, OKR Của tôi), When mở liên kết do `recordHref` sinh cho một cuộc soạn hoặc thêm `record=soan:<id>` vào URL trang đó, rồi đóng khung, Then khung cuộc soạn mở ngay trên trang đó mà đường không đổi; đóng thì về đúng trang ấy với URL không còn `record`; `recordHref` của loại `soan` trả liên kết sang Theo đơn vị mang `record=soan:<id>`.
- AC-3: Given khung soạn ở khổ từ 1024 px trở lên, When mở một cuộc chưa có dòng nháp, Kara nộp bản nháp đầu, và mở một cuộc đã có nháp, Then lúc chưa có nháp khung chỉ có cột Kara rộng bằng `--container-assist-rail` (380 ± 8 px); sau khi nộp — không tải lại — bản nháp hiện bên trái, cột Kara vẫn 380 ± 8 px và mép phải của nó không dời; bản nháp không rộng quá `--container-assist` (800 + 8 px) và khung không rộng quá bề ngang màn trừ 32 px; mở cuộc đã có nháp thì khung rộng ngay; không có thanh kéo đổi cỡ; khung cao bằng màn, khung và trang nền không cuộn còn thân mỗi ô cuộn riêng; không khổ nào trong {1024, 1280, 1440, 1920} tràn ngang.
- AC-4: Given khung soạn rộng có bản nháp và khung hẹp chỉ có Kara, When dựng ở nền sáng và tối, Then khung là một bề mặt liền: bản nháp và cột Kara chia nhau bằng đúng một đường kẻ dọc, không ô nào có viền bốn cạnh hay góc bo riêng bên trong khung; mỗi ô có một dòng đầu cao bằng nhau và thẳng hàng nhau; ô soạn nằm ở đáy cột Kara và «Đưa vào» nằm ở đáy bản nháp; lăn tới cuối thân mỗi ô thì phần tử cuối cùng hiện trọn phía trên đáy của ô đó.
- AC-5: Given khung soạn ở mọi trạng thái của bảng trạng thái, When dựng, Then đầu khung là một `DetailSheetHeader` duy nhất gồm tiêu đề «Soạn OKR», mô tả «<đơn vị> · <chu kỳ>» với tên đơn vị mang `translate="no"`, và nút đóng; số lượt «Lượt n/12» nằm ở dòng đầu cột Kara cạnh dấu Kara, không ở đầu khung; không có liên kết «← Theo đơn vị», không có `PageShellTitle`, không có thanh tab OKR hay ô chọn chu kỳ trong khung; lúc đang mở đầu khung đã có «Soạn OKR».
- AC-6: Given khung soạn ở khổ 768–1023 px và dưới 768 px, When dựng, bấm tab «Bản nháp», và tải lại, Then ở 768–1023 khung không rộng quá `--container-assist` và có hai tab «Trò chuyện» / «Bản nháp (n)»; dưới 768 khung phủ toàn màn (rộng bằng bề ngang và cao bằng chiều cao khung nhìn, sai số 2 px), không phải ngăn kéo thấp hơn màn, cùng hai tab; tab đang mở nằm trên URL và tải lại vẫn giữ; không khổ nào trong {375, 768, 1023} tràn ngang.
- AC-7: Given khung soạn khi Kara đang soạn và khi Kara rảnh, When bấm ra ngoài khung, bấm Esc, bấm nút đóng (và vuốt xuống trên khổ điện thoại), Then khi Kara đang soạn bấm ra ngoài không đóng khung, còn Esc, nút đóng và vuốt xuống mở `ConfirmDialog` nói Kara đang soạn và lượt vẫn chạy khi đóng — «Ở lại» giữ khung và lượt, «Đóng» đóng khung; khi Kara rảnh mọi cách trên đóng ngay không hỏi; đóng xong focus về nút đã mở khung; trình duyệt hỏi trước khi rời hay tải lại trang (`beforeunload`) khi và chỉ khi Kara đang soạn.
- AC-8: Given một lượt Kara đang soạn trong khung, When người xác nhận đóng khung, mở một Mục tiêu chồng lên khung, hoặc tải lại trang, rồi mở lại cuộc (hoặc đóng bản ghi chồng lên), Then lượt không bị dừng: máy chủ ghi xong lần nộp của lượt đó và số lượt của cuộc tăng đúng một; khung mở lại hiện «Kara đang soạn…» nếu lượt chưa xong rồi bản nháp mới khi xong, hoặc bản nháp mới ngay nếu đã xong, không có mốc lỗi và không cần tải lại trang. (cross-layer)
- AC-9: Given khung soạn chạy thay trang riêng, When chạy lại các bài máy của K2 còn là lời hứa sống (E4–E13, E16 của `soan-okr-trang-rieng`), Then tất cả xanh: nhận, sửa, bỏ qua, nhận cả nhóm, hoàn tác, khoá khi Kara soạn, mốc nộp, hỏi Kara từ dòng, quyết trên bảng gửi kèm, số giữ qua nộp lại và tải lại, «Còn thiếu» và «Đưa vào» vẫn đúng trong khung.
- AC-10: Given kho sau lượt, When quét diff so với điểm rẽ khỏi `onehub` và đọc tài liệu, Then khung soạn không có bề ngang nào viết bằng số ở chỗ gọi — cỡ khung là biến thể `kara` trong `packages/ui/src/components/sheet.tsx` đọc `--container-assist-rail` và `--container-assist`; khung cột Kara là thành phần trong `packages/ui/src/components/kara/`; không còn `ResizablePanelGroup` trong khu soạn; `docs/ai-ux.md` có mục «Kara ở đâu» nói Kara ở cột phải, vật phẩm mở thêm về bên trái, áp cho Soạn OKR và hẹn khung deal ở K5; sáu ô `E1`, `E1b`, `E2`, `E2b`, `E3`, `E14` của `soan-okr-trang-rieng` khai `status: not-run` kèm `superseded_by` trỏ tiêu chí ở bảng «Eval cũ bị thay»; diff chỉ chạm tệp trong ranh giới của design doc cộng tệp giám sát đã duyệt.
- AC-11: Given khung soạn chạy thật trên phiên đo riêng của cây, Kara chạy bằng mô hình giả có kịch bản viết trước, When đi qua các trạng thái của bảng trạng thái ở khổ 1440, 1024, 768 và 375, nền sáng và tối, Then mỗi trạng thái có ảnh, không khổ nào tràn ngang, khung và trang nền không cuộn, bề ngang cột Kara và bản nháp đúng AC-3 và AC-6, và console không có lỗi.
- AC-13: Given một cuộc soạn đủ số để đưa vào, mở trong khung trên Theo đơn vị của phòng, When bấm «Đưa vào», xác nhận, rồi đóng khung mà không tải lại trang, Then trang Theo đơn vị phía sau hiện đủ N Mục tiêu mới — số Mục tiêu của phòng trên màn bằng số đọc từ CSDL — và nút của phòng không còn «Tiếp tục» cho cuộc đã đưa vào.
- AC-12: Given ảnh khung hẹp, khung rộng, khung đang soạn, hộp hỏi khi đóng và khổ điện thoại, cạnh ảnh khung chi tiết Mục tiêu, When một người không làm lượt này đọc, Then họ nói được ngay Kara ở đâu và bản nháp ở đâu, thấy đây là cùng một kiểu khung với chi tiết Mục tiêu, thấy hai ô đều có khung, và hiểu hộp hỏi nói gì sẽ xảy ra với lượt đang chạy. (judgment)

## Coverage

Quét bằng `morphological-scan` ngày 09/10 (tự dựng trục, không preset nào khớp). Chân sản phẩm: `record-stack.ts`,
`record-sheet-host.tsx`, `sheet.tsx`, `globals.css`, `okr/soan/**` [SUY-TỪ-REPO]. Chân ngành: Microsoft 365 Copilot
trong Word, GitHub Copilot Chat trong VS Code, Notion AI (trợ lý cột phải cạnh vật đang sửa); ChatGPT Canvas, Claude
Artifacts (chat trái — đối chứng, bị loại vì chat là thứ chính ở đó) [NGÀNH: các sản phẩm trên].

- **Trục A — đường vào:** «Soạn» · «Tiếp tục» · đường cũ `/okr/soan/<id>` · link cũ `?cuocSoan=` · `record=soan` trên trang khác · id không có  [thước CE: `nut-soan.tsx`, `chuyen-link-cu.ts`, `[cuocSoanId]/page.tsx` — SUY-TỪ-REPO]
- **Trục B — nội dung khung:** đang mở · chỉ Kara · Kara soạn bản đầu · có nháp · có nháp và đang soạn · lỗi · chưa cấu hình · đã đưa vào  [thước CE: bảng trạng thái K2, §7 `docs/ai-ux.md`]
- **Trục C — rời khung:** bấm ra ngoài · Esc · nút đóng · vuốt xuống · bản ghi khác chồng lên · tải lại  [thước CE: `giu-thay-doi.tsx`, `record-stack.ts`; NGÀNH: web-design-guidelines «warn before navigation with unsaved changes»]
- **Trục D — khổ và nền:** ≥ 1024 hai ô · 768–1023 hai tab · < 768 toàn màn · sáng · tối  [thước CE: `SOAN_UI.khoHep`, `use-mobile`, `rules/web/testing.md`]
- Core: A (AC-1, 2); B × D (AC-3, 4, 5, 6, 11); C × Kara đang soạn, gồm tải lại (AC-7, 8); giữ hành vi K2 (AC-9); trang nền sau khi đưa vào (AC-13); luật và token (AC-10).
- Later: khung deal có cột Kara (K5); Kara gửi liên kết bản ghi trong tin nhắn; lưu bề ngang theo người.
- Never: thanh kéo đổi cỡ (chủ kho chốt bề ngang cố định 09/10); giữ trang riêng song song với khung (hai cách mở là thứ vòng này gỡ).
- [GIẢ ĐỊNH] Cột Kara dùng đúng `--container-assist-rail` 380 px (chủ kho nói «khoảng 400»; 380 là chuẩn sẵn có của cột Kara thẻ góp ý).
- [GIẢ ĐỊNH] 768–1023 px dùng hai tab trong khung rộng tối đa 800 px, không hai ô — dưới 1024 không đủ chỗ cho 380 + một bản nháp đọc được (cùng lý do ngưỡng của K2).
- [GIẢ ĐỊNH] Hỏi lại chỉ khi Kara đang soạn; số đã gõ chưa đưa vào không gây hỏi vì K2 đã giữ chúng qua `sessionStorage`.
- [GIẢ ĐỊNH] Đóng khung khi Kara đang soạn không dừng lượt (eve `stop()` chỉ cắt luồng trình duyệt) — AC-8 đo điều này thay vì tin.

## Đường đo

Ngưỡng ở `opportunity.md` (còn `[đề xuất]`, chờ chủ kho chốt) đo ở lái-thử người-lạ rồi phiên nghiệm thu:

- «≥ 2/3 đưa được bộ OKR vào trong ≤ 15 phút»: thời gian = `okrCuocSoan.duaVaoLuc − createdAt` của cuộc mỗi người
  thử (CSDL); tỉ lệ từ nhật ký lái thử. AC-9 giữ phép đo «Đưa vào» của K2 (ghi `duaVaoLuc`), AC-13 bảo đảm đóng khung
  xong thấy ngay kết quả.
- «0 lần mất lượt hay mất số khi đóng và mở lại khung»: nhật ký vấp của lái thử. AC-7, AC-8 bảo đảm trên phiên đo.
- «≥ 4/5 lần nhìn đầu chỉ đúng Kara và bản nháp»: nhật ký lái thử (câu hỏi «Kara ở đâu, bản nháp ở đâu?» trước khi
  người bấm gì). AC-12 là phép chấm gần nhất trên ảnh.
- «≥ 2/3 muốn quay lại trang riêng» (chết): câu hỏi cuối buổi lái thử, ghi vào nhật ký.

## Out of scope

- Khung deal có cột Kara bên phải — K5 `chat-deal-mot-khung`.
- «Không đọc lại được các lượt trước» thấy trong ảnh 09/10 — kiểm riêng.
- Kara mở bản ghi bằng liên kết trong câu trả lời.
- Đổi hành vi soạn của K2 (nhận, hoàn tác, mốc, đưa vào) — chỉ đổi vỏ.
- Thanh kéo đổi cỡ; lưu bề ngang.

## Notes

- Bản mẫu `/proto/soan-okr-trong-khung` ghép từ thành phần thật, dữ liệu giả (S1-D).
- Kara của phép đo màn chạy bằng mô hình giả có kịch bản viết trước (`apps/agent-okr/test/support/mo-hinh-gia.ts`).
- Mô tả PR ghi dòng bậc theo `docs/design.md`: `DetailSheet` bậc 1; cỡ `kara`, ngăn kéo toàn màn và khung cột Kara bậc 5.
