---
schema_version: 1
feature: Hỏi đáp OKR theo quyền — người dùng hỏi Kara về OKR trên web và nhận câu trả lời chỉ từ những Mục tiêu, KR mình xem được, mỗi câu có trích dẫn và con số do mã kiểm; vai «chỉ OKR» hỏi được OKR mà không chạm được dữ liệu đối tác
slug: hoi-dap-okr
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui, agent]
status: draft
design_doc: docs/superpowers/specs/2026-10-14-hoi-dap-okr-design.md
---

# Acceptance Contract: hoi-dap-okr

## Context

Hàng C của `docs/plan/lo-trinh-okr.json` («Tôi hỏi về OKR trên web hoặc Zalo và nhận câu trả lời theo quyền
của tôi»). D đã dựng app eve riêng `apps/agent-okr` cho chat OKR, nhưng app đó chỉ soạn nháp: cửa, thẻ và kênh
buộc vào một cuộc soạn. Lượt này thêm loại phiên `okr-hoi` vào chính app đó. Có ba công cụ mới: `tim_okr`,
`doc_okr` và `nop_tra_loi`. Mỗi công cụ tự lọc theo quyền xem của người hỏi bằng `nguCanhXemOkr` và
`dieuKienXemMucTieu`. Câu trả lời người đọc thấy do mã dựng sau khi kiểm trích dẫn và con số. Lượt này cũng
thêm bảng `OkrCuocHoi` và cột Kara hỏi đáp trên web.

Bản nháp này soạn theo khuyến nghị của hai câu đang chờ chủ kho: Zalo tách sang hàng C2 (Hỏi-1), và trần là
hằng số trong config (Hỏi-2).

Source input: hàng C `docs/plan/lo-trinh-okr.json` + `_acceptance/hoi-dap-okr/opportunity.md` +
`docs/agent.md` («App eve thứ hai», «Khi nào thêm mã, tool…», luật dữ liệu 5) + `docs/ai-ux.md` §7, §8, §11 +
`_acceptance/hoi-dap-okr/coverage-scan.md`.

## Criteria

- AC-1: Given bộ OKR mẫu M (`bun run okr:mau`) có Mục tiêu giới hạn `q4-phap-che-3` (và các KR của nó) chỉ
  `tran-quoc-bao` có tên trong danh sách người xem, When `tim_okr` và `doc_okr` chạy trong phiên `okr-hoi` của từng người trong ma trận
  năm người hỏi (admin, trưởng đơn vị, thành viên, vai chỉ OKR, `tran-quoc-bao`), Then tập Mục tiêu và tập KR mỗi công cụ
  trả về bằng đúng tập suy từ `dieuKienXemMucTieu` của người đó trên cùng bộ lọc (KR theo Mục tiêu cha), và
  với người không có tên thì kết quả không chứa mã hay tên của `q4-phap-che-3` lẫn của mọi KR thuộc nó.
- AC-2: Given một phiên của `agent-okr`, When một công cụ hỏi đáp chạy trong phiên `okr-soan`, hoặc
  `nop_ban_nhap` chạy trong phiên `okr-hoi`, hoặc bất kỳ công cụ nào chạy trong phiên không mang purpose hợp
  lệ, Then công cụ trả một lời từ chối có tên (kết quả, không phải lỗi ném) và không đọc hay ghi gì.
- AC-3: Given phiên `okr-hoi` của một người, When Kara gọi `nop_tra_loi` với một câu trích tới Mục tiêu hay KR
  người đó không xem được (KR xét theo Mục tiêu cha), hoặc tới mã không tồn tại, Then mã từ chối cả câu trả lời, nêu đúng mã bị từ chối, và
  không câu nào tới người đọc.
- AC-4: Given phiên `okr-hoi`, When một câu trong `nop_tra_loi` chứa con số, Then mã xếp mỗi số vào đúng một
  trong ba lớp và kiểm theo lớp đó. Lớp trường: tiến độ, giá trị hiện tại, đích, Mức tự tin của thứ câu đó
  trích; phần trăm làm tròn tới số nguyên, dấu thập phân «,» hay «.». Lớp đếm: một số đi trước danh từ
  «Mục tiêu» hay «KR» phải bằng số phần tử cùng loại câu đó trích. Lớp miễn: chỉ năm và số quý. Mọi số
  khác, và mọi số lệch lớp của nó, làm mã từ chối và nêu đúng con số. Khi mọi số qua, câu trả lời được nhận
  và mã dựng câu người đọc thấy kèm trích.
- AC-5: Given cửa `/eve/agents/okr/...` và kênh `agent-okr`, When người gọi dùng cuộc hỏi của người khác, hoặc
  đường phiên không thuộc cuộc của mình, hoặc thẻ còn hạn của người đã bị gỡ khỏi workspace hay đổi sang vai
  không được vào, Then cửa trả 403 hoặc 409 có mã, kênh không mở phiên, và không có lượt nào được đếm.
- AC-6 (cross-layer): Given hằng trần trong `apps/agent-okr/agent/lib/config.ts` (40 câu mỗi người mỗi ngày,
  10 USD mỗi tháng cho cả workspace), When người hỏi gửi câu thứ 41 trong ngày qua cửa web, hoặc tổng
  `AiChiPhi` mục `okr.hoi-dap` do chính hook chi phí ghi trong tháng đã chạm trần, Then cửa trả 429 với
  `het-luot-ngay` hoặc `het-tran-thang`, agent-okr không nhận lời gọi nào, và cột Kara khoá ô gõ kèm một dòng
  nói khi nào mở lại.
- AC-7: Given phiên `okr-hoi` chạy một lượt, When mỗi bước model xong, Then `AiChiPhi` có một hàng
  `tinhNang = "okr.hoi-dap"` với `taskId` là mã cuộc hỏi; phiên `okr-soan` vẫn ghi `okr.soan` như cũ.
- AC-8 (cross-layer): Given kho đo dựng từ bộ OKR mẫu và người vai chỉ OKR `thai-minh-chau`, When người đó mở
  cuộc hỏi qua cửa web rồi hỏi một câu OKR và một câu «liệt kê deals của công ty», Then câu OKR nhận câu trả lời
  có ít nhất một trích; câu đối tác ra 0 tên đối tác trong mọi `AgentEvent` của phiên, và không công cụ nào
  ngoài `tim_okr`, `doc_okr`, `nop_tra_loi` được gọi; đối chứng dương: cùng câu đối tác qua Kara của CRM bằng
  một thành viên thường ra ít nhất một tên đối tác.
- AC-9 (judgment): Given bộ câu hỏi OKR mẫu ít nhất 30 câu trên bộ M, phủ đủ năm người hỏi và bảy ý định của
  `coverage-scan.md`, mỗi câu khai sẵn trích bắt buộc, tên cấm và loại câu trả lời, When lệnh đo chạy Kara thật
  (ZDR) trên kho đo và chấm mỗi câu bằng luật mã cùng một hội đồng ZDR trong chính lệnh đo, Then 100% câu đạt
  luật quyền, ít nhất 90% câu đạt luật trích và số, và ít nhất 85% câu được hội đồng ZDR chấm «đúng ý câu
  hỏi» [ba ngưỡng chờ Hỏi-4; cách đọc vế N1 chờ Hỏi-5]. Bảng kết quả mang, cho mỗi câu, kỳ vọng đã khai, ảnh
  chụp giá trị của Mục tiêu và KR được hỏi, câu trả lời dựng và phiếu của hội đồng.
- AC-10: Given khu OKR và tổng quan của vai chỉ OKR, When người dùng bấm «Hỏi Kara», gõ câu hỏi và bấm một
  trích, Then cột Kara mở bên phải qua `?record=hoi-okr:<cuộc>` theo khuôn `KaraDock`, câu trả lời hiện mỗi câu
  một `InlineCitation` và một `AiFeedback`, bấm trích mở `?record=objective:<id>` hay `?record=kr:<id>` chồng
  lên; dưới 768 px cột phủ toàn màn; Kara hỏng thì hiện «Kara chưa trả lời được» và «Thử lại».
- AC-11: Given Soạn OKR của D, When lượt này gộp, Then cuộc soạn chạy như cũ: lời dặn soạn chỉ nạp cho phiên
  `okr-soan`, và các bài soạn, cách ly có sẵn (`apps/agent-okr/test/**`, `rang/cach-ly-chi-okr.mjs` của
  `soan-okr-cung-tro-ly`) vẫn xanh.
- AC-12: Given mọi lời gọi model của phiên `okr-hoi` và của lệnh đo, When chúng chạy, Then chúng đi qua model
  ZDR của `@crm/ai-okr` (`xuongModelZdr`) — kể cả hội đồng chấm của AC-9.
- AC-13: Given chữ mới trên màn và trong câu từ chối, When lượt này gộp, Then mọi chữ nằm trong
  `apps/app/lib/messages` hay config của `agent-okr` có cả vi và en, AI chỉ mang tên Kara (luật
  `apps/app/test/kara-mot-ten.spec.ts` xanh), và dữ liệu người nhập mang `translate="no"`.

## Coverage

Quét theo `_acceptance/hoi-dap-okr/coverage-scan.md`. Có bốn trục: A người hỏi, B ý định, C kênh, D tình
trạng dữ liệu và hệ thống.

- Trục A, năm giá trị [thước CE: `VAI_WORKSPACE`, người trong bộ mẫu]: AC-1, AC-5, AC-8, AC-9.
- Trục B, bảy ý định [thước CE: `dieuKienXemMucTieu`, `CONTEXT.md`]: AC-1, AC-3, AC-4, AC-9. Câu xin ghi
  hay sửa và câu không trả lời được nằm trong bộ câu mẫu của AC-9.
- Trục C, kênh: web (AC-10). Zalo chờ Hỏi-1, khuyến nghị tách hàng C2. Slack ở Later.
- Trục D, tình trạng: Mục tiêu giới hạn (AC-1), hết lượt hay trần (AC-6), Kara hỏng (AC-10). Chu kỳ trống nằm
  trong bộ câu mẫu (AC-9). Kỳ đã khép ở Later.
- [GIẢ ĐỊNH: chưa có chuẩn ngành đúng loại] cho hỏi đáp OKR có lọc quyền. Neo tạm vào Microsoft 365 Copilot
  (sản phẩm cận kề: chỉ trả lời từ dữ liệu người dùng đã có quyền đọc). Tra 14/10 không thấy sản phẩm OKR nào
  (Profit.co, Quantive, Workboard) mô tả công khai việc này.

## Đường đo

Ngưỡng của `opportunity.md`: «Eval hỏi đáp trên bộ ca mẫu (M, N1) đạt; phép đo «người vai chỉ OKR chỉ hỏi được
OKR» xanh trên production».

- Eval hỏi đáp trên bộ ca mẫu: lệnh đo của AC-9 trên bộ M. Ca N1 là ca góp ý, không phải câu hỏi; bản nháp đọc
  vế N1 là bộ câu hỏi dựng trên chính các Mục tiêu quý 4 mà N1 dùng [chờ Hỏi-5]. Ngưỡng «đạt» là ba ngưỡng của
  AC-9 [chờ Hỏi-4].
- «Vai chỉ OKR chỉ hỏi được OKR»: AC-8 đo trên kho đo. Nửa production đo sau gộp, lúc bật, bằng
  `_acceptance/hoi-dap-okr/rang/chi-hoi-okr.sql` — câu SQL này nằm trong vật của lượt. Nó đếm, theo vai, mọi
  `AgentEvent` của phiên `okr-hoi` gọi công cụ ngoài ba công cụ OKR; kỳ vọng là 0.

## Out of scope

- Zalo — chờ Hỏi-1; khuyến nghị hàng C2 dùng lại công cụ đọc, `nop_tra_loi` và bộ câu mẫu của lượt này.
- Ghi hay sửa OKR qua hỏi đáp: Kara chỉ chỉ chỗ sửa (khung Mục tiêu, Soạn OKR).
- Trả lời câu đối tác trong cột Kara OKR, kể cả cho owner và thành viên: chỉ đường sang Kara của CRM.
- Đo trên production: việc sau gộp, lúc bật.
- Kỳ đã khép, so sánh hai kỳ: bộ câu mẫu chỉ đo quý 4.
- Ô Cài đặt cho trần (chờ Hỏi-2; khuyến nghị dùng hằng số).

## Notes

- Không có nút xoá, lưu trữ hay trạng thái kết thúc: cuộc hỏi chỉ là một hội thoại, và đóng cột không đổi gì
  (luật đợt 14 không áp).
- `migration` chỉ thêm bảng `OkrCuocHoi`, lấy mốc UTC thật lúc tạo; kiểm `origin/onehub` ngay trước gộp.
- Tệp dùng chung (`apps/app/lib/messages/*.ts`, `_acceptance/config.yaml`, `CONTEXT.md`) chỉ thêm dòng.
