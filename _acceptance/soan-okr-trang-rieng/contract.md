---
schema_version: 1
feature: "Soạn OKR trên trang riêng /okr/soan/<cuộc>: hội thoại và bản nháp là hai ô co giãn, bản nháp là KaraArtifact với dòng inline, nhận cả nhóm, hoàn tác mọi quyết định, khoá khi Kara soạn, mốc nộp nối hai chiều, hỏi Kara từ một dòng, quyết trên bảng gửi kèm lượt sau, số đã gõ giữ theo khoá dòng"
slug: soan-okr-trang-rieng
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-07
design_doc: docs/superpowers/specs/2026-10-07-soan-okr-trang-rieng-design.md
---

# Acceptance Contract: soan-okr-trang-rieng

## Context

Hàng K2 của lộ trình OKR, dãy P1 đợt `sau-14-10`. Cổng Đáng `build` ký 2026-10-07T13:13:50Z (luật 16 của đợt).
Bốn câu khung chủ kho chốt 04/10: trang riêng có thanh kéo đổi cỡ, không sheet; khoá dòng chưa quyết khi Kara đang
soạn; có nhận theo nhóm; mốc nộp nối hai chiều, hỏi Kara từ dòng, Hoàn tác mọi quyết định. Chủ kho duyệt hướng 12
điểm ngày 07/10 (phiên P1), gồm hai chỗ máy chọn: trang soạn ẩn đầu trang OKR; hoàn tác Mục tiêu kéo KR đã quyết
của nó về chờ. K1 (`bo-xuong-kara`, #258) dựng sáu khối Kara; R1h (#251) đã làm «Thử lại nói rõ vì sao» và «Kara
sập không trừ lượt».

Source input: `opportunity.md` · design doc · `de-xuat-kara.html` mục «Mười nguyên tắc» · `docs/ai-ux.md` §2–7 ·
`docs/chat-ui.md` · `docs/design.md` «Vẽ tay là bậc cuối» · Known limits Ngoài-1, Ngoài-4 của `bo-xuong-kara`.

## Criteria

- AC-1: Given một trưởng phòng ở Theo đơn vị của phòng mình trong pha lập kế hoạch, When bấm «Soạn» (chưa có cuộc) hoặc «Tiếp tục» (có cuộc đang soạn), hoặc mở link cũ `…/okr/theo-don-vi?…&cuocSoan=<id>`, hoặc mở `/<slug>/okr/soan/<id không có>`, Then trình duyệt ở `/<slug>/okr/soan/<id cuộc>` và không còn sheet nào; trang có đầu riêng gồm liên kết «← Theo đơn vị», tên đơn vị, tên chu kỳ và «Lượt n/12», và không có thanh tab OKR hay ô chọn chu kỳ; link cũ được thay (không thêm một mục lịch sử); id không có thì trang hiện «Không mở được cuộc soạn» cùng liên kết về Theo đơn vị; «← Theo đơn vị» mở đúng đơn vị và chu kỳ của cuộc.
- AC-2: Given trang soạn ở khổ từ 1024 px trở lên, When dựng, kéo thanh giữa bằng chuột, và đặt focus lên thanh rồi bấm mũi tên trái/phải, Then hội thoại và bản nháp là hai ô cạnh nhau với ô hội thoại mặc định 380 px (±8 px); thanh có tên và focus nhìn thấy được; kéo và phím đều đổi bề rộng ô hội thoại, không nhỏ hơn 300 px và không lớn hơn nửa thân; mỗi ô cuộn riêng còn trang không cuộn; dưới 1024 px hai ô thành hai tab «Trò chuyện» / «Bản nháp (n)», tab đang mở nằm trên URL và tải lại vẫn giữ; không khổ nào trong {375, 768, 1024, 1440} tràn ngang.
- AC-3: Given trang soạn ở mỗi trạng thái của bảng trạng thái trong design doc, When dựng, Then bản nháp là `KaraArtifact` với tiêu đề «Bản nháp» và dòng phụ «n dòng · sửa lúc HH:MM» theo lần nộp cuối; lúc đang mở, Kara đang soạn mà chưa có dòng nào, cuộc không mở được, chưa cấu hình, cuộc đóng — mỗi trạng thái dùng `KaraState` đúng kind của bảng §7 `docs/ai-ux.md`, Kara đang soạn mà bản nháp rỗng thì thân ghi «Kara đang soạn bản nháp đầu…» chứ không «Chưa có dòng nào»; trang soạn không dựng `Spinner` trần, và không dùng `Alert` cho lúc Kara đang làm.
- AC-4: Given bản nháp có hai Mục tiêu, mỗi cái có KR có số, KR mốc và một căn chỉnh, When dựng, Then mỗi Mục tiêu là một `KaraProposalGroup` mang đúng một nhãn Kara ở đầu nhóm và các dòng trong nhóm không mang nhãn riêng; Mục tiêu, KR và căn chỉnh là `KaraProposal` dạng `inline` — không có `Confirmation`, không có thẻ `card` nào trong bản nháp; mỗi dòng chờ có đúng một nút tô màu mang động từ theo loại («Thêm Mục tiêu», «Thêm KR», «Thêm căn chỉnh»), «Sửa» viền (trừ căn chỉnh) và «Bỏ qua» dạng chữ; KR có số mang hai ô «Khởi điểm» và «Đích» trên chính dòng cả khi chờ lẫn khi đã nhận, KR mốc không có ô số; Mục tiêu đã bỏ qua không hiện KR con.
- AC-5: Given một dòng chờ của mỗi loại (Mục tiêu, KR, căn chỉnh), When người nhận, sửa rồi nhận, hay bỏ qua, rồi bấm «Hoàn tác» trên dòng biên nhận, Then mỗi quyết định thu dòng thành một biên nhận `role="status"` có nút «Hoàn tác»; «Hoàn tác» đưa dòng về chờ với đủ nút như trước, và ở cơ sở dữ liệu dòng đó có `trangThai = cho`, `giaTriCuoi`, `nguoiQuyet`, `quyetLuc` đều rỗng; hoàn tác một Mục tiêu đã nhận có KR đã quyết thì biên nhận nói trước «kèm N KR» và cả Mục tiêu lẫn N KR ấy về chờ; hoàn tác một Mục tiêu đã bỏ qua thì các KR bị bỏ kèm nó về chờ; API từ chối không ghi gì khi hoàn tác một dòng đang chờ, một dòng không còn trong bản nháp hiện tại, hay khi cuộc không còn đang soạn, và lời từ chối hiện ngay tại dòng. (cross-layer)
- AC-6: Given một Mục tiêu chờ có KR chờ đã gõ đủ hai số, KR chờ mới gõ một số, và KR mốc chờ, When bấm nút nhóm rồi «Hoàn tác» trên biên nhận nhóm, Then nút nhóm ghi «Thêm cả Mục tiêu và 2 KR đã đủ số» và bấm gửi đúng một lần ghi gồm Mục tiêu cùng đúng hai KR (đủ số và mốc); ở cơ sở dữ liệu ba dòng ấy `nhan` cùng một `quyetLuc` còn KR thiếu số vẫn `cho`; biên nhận nhóm «Đã thêm Mục tiêu 1 và 2 KR» có «Hoàn tác» đưa cả ba về chờ; một lệnh nhóm mang KR của Mục tiêu khác hay KR đã quyết bị API từ chối và không dòng nào đổi; Mục tiêu không còn KR chờ đủ điều kiện thì nút nhóm khoá. (cross-layer)
- AC-7: Given bản nháp có dòng chờ, dòng đã quyết và đủ số để đưa vào, When một lượt Kara đang chạy, rồi lượt xong, Then trong lúc chạy đầu bản nháp hiện «Kara đang soạn…», mọi nút và ô số của dòng chờ, mọi «Hoàn tác», nút nhóm và «Đưa vào» đều khoá và trỏ `aria-describedby` tới lý do; ô soạn mang nút «Dừng» và bấm «Dừng» chấm dứt lượt; lượt xong thì mọi thứ mở lại mà không cần tải lại trang.
- AC-8: Given một cuộc có hai lần Kara nộp, lần hai so với lần một thêm 1 KR, sửa chữ 1 Mục tiêu, chuyển 1 KR sang Mục tiêu khác và bỏ 1 KR, When mở trang, bấm mốc thứ hai, bấm nhãn «vừa sửa» trên một dòng, và tải lại trang, Then hội thoại có hai mốc «Bản nháp đầu: 2 Mục tiêu · 5 KR» và «+1 KR · sửa 1 · chuyển 1 · bỏ 1» đúng chỗ hai lần nộp; bấm mốc hai đưa dòng đổi đầu tiên vào khung nhìn của bản nháp và làm nổi nó; nhãn «vừa sửa» là nút, bấm đưa mốc mới nhất vào khung nhìn của hội thoại; dòng vừa sửa hiện chữ cũ gạch cạnh chữ mới; tải lại trang thì hai mốc giữ nguyên chữ; một lần nộp có đầu vào không đọc được thành mốc «Kara nộp bản nháp» không có số và trang không lỗi.
- AC-9: Given bản nháp có dòng KR «Tăng số đại lý gắn bó», When bấm «Hỏi Kara về dòng này», gõ «ngắn hơn» rồi gửi, và một lần khác gỡ chip trước khi gửi, Then ô soạn mang chip «KR · Tăng số đại lý gắn bó» có nút gỡ và focus nằm ở ô soạn (khổ hẹp: tab Trò chuyện được mở); tin Kara nhận chứa chữ của dòng và câu «ngắn hơn»; bong bóng của người hiện chip cùng câu hỏi và không hiện dấu khối máy nào; gỡ chip thì tin gửi đi không mang chữ của dòng. (cross-layer)
- AC-10: Given người nhận KR 1.2 và bỏ qua Mục tiêu 2 trên bảng, rồi một lần khác nhận rồi hoàn tác KR 1.3, When chưa gõ gì, rồi gửi lượt kế, rồi tải lại trang, Then trước khi gửi cuối hội thoại có một dòng hệ thống «Sẽ gửi kèm lượt sau: Bạn đã thêm KR … · bỏ qua Mục tiêu …» và không nhắc KR 1.3; tin Kara nhận ở lượt kế mang đủ hai quyết định ấy; sau tải lại, dòng hệ thống của hai quyết định nằm ngay trước bong bóng của lượt đó và bong bóng không hiện dấu khối máy. (cross-layer)
- AC-11: Given người đã gõ Khởi điểm và Đích cho một KR chờ và một KR đã nhận, When Kara nộp lại bản nháp giữ nguyên khoá của hai KR ấy, người đổi tab ở khổ hẹp, và người tải lại trang trong cùng phiên trình duyệt, Then hai cặp số vẫn ở trên hai dòng ấy sau cả ba việc; KR bị Kara bỏ khỏi bản nháp không còn được tính vào «Đưa vào»; «Đưa vào» gửi số theo id dòng của lần nộp hiện tại.
- AC-12: Given bản nháp có Mục tiêu và KR đã nhận, một KR đã nhận thiếu Đích, When xem chân bản nháp, bấm mục «Còn thiếu», gõ số còn thiếu, rồi «Đưa vào» và xác nhận, Then khi còn thiếu nút «Đưa vào» khoá và chân liệt «Còn thiếu» từng KR thiếu số là một nút, bấm thì ô số trống đầu tiên của KR đó nhận focus; đủ số thì nút ghi «Đưa vào N Mục tiêu, M KR», hộp xác nhận nói tên đơn vị và chu kỳ; xác nhận tạo đúng N Mục tiêu và M KR ở cơ sở dữ liệu với số đã gõ, cuộc thành đã đưa vào với `duaVaoLuc` có giá trị; bản nháp hiện biên nhận «Đã tạo N Mục tiêu» có liên kết sang Theo đơn vị, và không còn nút quyết hay «Hoàn tác» nào. (cross-layer)
- AC-13: Given kho sau lượt, When chạy cổng mồ côi, quét diff so với điểm rẽ khỏi `onehub`, và đọc tài liệu, Then `MIEN_TRU` của `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` rỗng, cổng xanh và đi qua `packages/ui/src/components/kara/` như cầu (trang soạn thôi dùng `KaraArtifact` thì cổng đỏ gọi tên `artifact.tsx`); diff chỉ chạm tệp trong ranh giới K2 cộng các tệp giám sát đã duyệt, bốn tệp chung (`theo-don-vi.tsx`, `thanh-tab.tsx`, `proto/registry.ts`, `proto/catalog.ts`) chỉ có dòng thêm; `resizable.tsx` có mặt trong `packages/ui` và được trang soạn dùng; bảng «What is in the tree today» của `docs/chat-ui.md` thôi ghi miễn trừ cho `artifact.tsx` và `task.tsx`.
- AC-14: Given trang soạn chạy thật trên phiên đo riêng của cây, Kara chạy bằng mô hình giả có kịch bản viết trước, When đi qua các trạng thái của bảng trạng thái ở khổ 1440, 768 và 375, nền sáng và tối, rồi kéo thanh bằng chuột và phím, Then mỗi trạng thái có ảnh, trang không tràn ngang, mỗi ô cuộn riêng còn trang không cuộn, ô hội thoại đổi bề rộng theo kéo và theo phím, và console không có lỗi.
- AC-15: Given ảnh của trạng thái có bản nháp, Kara đang soạn, đã quyết và còn thiếu ở 1440 và 375, When một người không làm lượt này đọc, Then họ phân biệt ngay hội thoại và bản nháp, thấy nút chính của mỗi dòng, biết dòng nào đã quyết, hiểu vì sao các nút đang khoá và biết còn thiếu gì để đưa vào. (judgment)

## Coverage

Quét bằng `morphological-scan` ngày 07/10 — đầy đủ ở `_acceptance/soan-okr-trang-rieng/coverage-scan.md`. Chân sản
phẩm: `docs/ai-ux.md`, `soan/kieu.ts`, `luat-ban-nhap.ts` [SUY-TỪ-REPO]. Chân ngành: ChatGPT Canvas, Claude
Artifacts, Copilot Pages, Copilot in Word «Accept / Accept all», Perdoo «Import selected» [NGÀNH: đề xuất 04/10 mục
«Nguồn»].

- **Trục A1 — việc Kara làm với một dòng:** thêm · sửa chữ · chuyển · bỏ  [thước CE: `soBanNhap` — SUY-TỪ-REPO]
- **Trục A2 — việc người làm:** nhận · sửa rồi nhận · bỏ qua · nhận cả nhóm · hoàn tác · gõ số · hỏi Kara · đưa vào  [thước CE: `docs/ai-ux.md` §5–6; NGÀNH: Copilot, Perdoo]
- **Trục B — loại dòng:** Mục tiêu · KR có số · KR mốc · căn chỉnh  [thước CE: `DongSoan`, `canSo` — SUY-TỪ-REPO]
- **Trục C — trạng thái Kara và cuộc:** rảnh · đang soạn · lỗi · hết lượt · chưa cấu hình · cuộc đóng · đã đưa vào  [thước CE: §7 `ai-ux.md`; `useCuocSoan`]
- **Trục D — hiển thị:** rộng có thanh kéo (≥ 1024 px) · hẹp hai tab (< 1024 px) · sáng · tối · bàn phím  [thước CE: `SOAN_UI.khoHep`; `rules/web/testing.md`; web-design-guidelines]
- Core: A2×B (AC-4, 5, 6); A2×C đang soạn (AC-7); A1 (AC-8); hỏi Kara, quyết trên bảng (AC-9, 10); gõ số × nộp lại/tab/tải lại (AC-11); đưa vào (AC-12); C (AC-3); D (AC-2, 14).
- Later: phiên bản từng lần nộp; «vì sao» có nguồn; hàng quyết chưa gửi sống qua tải lại; kéo thả đổi thứ tự.
- Never: trục người × quyền (K2 không đổi quyền); sửa câu lệnh của Kara; hoàn tác sau Đưa vào; sheet rộng.
- [GIẢ ĐỊNH] Chữ nút nhóm «Thêm cả Mục tiêu và N KR đã đủ số» — KR mốc tính là «đủ số».
- [GIẢ ĐỊNH] Hoàn tác Mục tiêu đã nhận đưa mọi KR đã quyết của nó (kể cả KR bỏ qua) về chờ.
- [GIẢ ĐỊNH] Nhận rồi hoàn tác trước khi gửi thì cặp ấy rút khỏi hàng «Sẽ gửi kèm lượt sau».
- [GIẢ ĐỊNH] Số đã gõ sống qua tải lại bằng `sessionStorage` của trình duyệt — không qua máy khác hay tab khác.
- [GIẢ ĐỊNH] Cỡ ô không lưu; mỗi lần mở về 380 px.
- [GIẢ ĐỊNH] Hai ô chỉ từ 1024 px: dưới đó thân không đủ 760 px để giữ cả «mặc định 380 px» lẫn «tối đa nửa thân» (gap-probe F1); máy tính bảng dọc dùng hai tab.

## Đường đo

Bốn ngưỡng của `opportunity.md` đo ở lái-thử người-lạ trước R1:

- «≥ 2/3 người đưa được bộ OKR vào trong ≤ 15 phút»: thời gian = `okrCuocSoan.duaVaoLuc − createdAt` của cuộc
  mỗi người thử (CSDL); tỉ lệ từ nhật ký lái thử. AC-12 bảo đảm `duaVaoLuc` được ghi.
- «0 lần mất số đã gõ»: nhật ký vấp của lái thử. AC-11 bảo đảm.
- «0 lần sửa trên bảng mà Kara không biết»: nhật ký vấp. AC-10 bảo đảm.
- «Mọi quyết định hoàn tác được ngay trên dòng»: AC-5, AC-6.

## Out of scope

- Phiên bản của từng lần nộp để quay về (`checkpoint` của AI Elements) và «vì sao» có nguồn — cần server.
- Sửa câu lệnh của Kara (`apps/agent-okr/agent/instructions.md`).
- Lưu cỡ ô giữa hai lần mở; hàng quyết chưa gửi sống qua tải lại.
- Hoàn tác sau khi đã Đưa vào.
- «Thử lại nói rõ vì sao», «Kara sập không trừ lượt» — R1h (#251).
- Đổi quyền ai được soạn — giữ nguyên `soan-okr-quyen.spec.ts`.

## Notes

- Tệp ngoài ranh giới giám sát đã duyệt (`tra-loi/P1-3.json`): khối `soanQuyetInput` trong `okr.contracts.ts`;
  `react-resizable-panels` vào `packages/ui/package.json` + `bun.lock` chỉ bằng `bun add`; `resizable.tsx` mới.
  Chờ duyệt (`P1-4`): `_acceptance/config.yaml` (thêm khoá `k2_*`), `apps/api/test/soan-okr-hoan-tac.spec.ts`,
  `docs/chat-ui.md`, `docs/ai-ux.md`.
- Bản mẫu `/proto/soan-okr-trang-rieng` ghép từ thành phần thật, dữ liệu giả; khung chia cố định 380 px vì
  `resizable` chỉ cài ở S3 (`docs/proto.md` «Ba điều cấm»).
- Kara của phép đo màn chạy bằng mô hình giả có kịch bản viết trước (`apps/agent-okr/test/support/mo-hinh-gia.ts`),
  không gọi mô hình thật.
- Mô tả PR ghi dòng «bậc 2 — resizable» theo `docs/design.md`.
