---
schema_version: 1
feature: Nền giao diện của Kara trong packages/ui — dấu tia sáng, nhãn Kara có ô «vì sao», ProposedChange hai độ dày (inline không viền, card), dòng biên nhận có Hoàn tác, phản hồi chung — để mọi màn AI sau đó dựng trên một bộ
slug: nen-kara
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-02
design_doc: docs/superpowers/specs/2026-10-02-nen-kara-design.md
---

# Acceptance Contract: nen-kara

## Context

Chủ kho chốt ngày 01/10 rằng AI của OneHub chỉ có một tên, «Kara», và một bộ luật giao diện
(`docs/ai-ux.md`). Mục 10 của luật liệt năm món `packages/ui` còn thiếu. Lượt này dựng đủ
năm món, đưa hình dạng đã duyệt trên `/proto/gop-y-dung-cho` vào `packages/ui`, và không
đổi điều người dùng thấy ở màn thật nào. Hai câu mở của hồ sơ cơ hội đã chốt ở S1 (chủ
kho duyệt 02/10): chỉ dựng nền; giữ `Confirmation` làm thân bản `card`, bản `inline` dựng
trên `Item`.

Source input: `opportunity.md` · `docs/ai-ux.md` · `docs/plan/ux-ai-thong-nhat-2026-10-01.md` · `apps/app/app/proto/_modules/gop-y-dung-cho/kara.tsx`

## Criteria

- AC-1: Given một đề xuất dựng bằng `ProposedChange` với `density="inline"` (hoặc không truyền `density`), When nó hiện, Then gốc của nó là `Item` biến thể mặc định, không có `Alert` hay `Card` bên trong; chữ cũ và chữ mới mang `translate="no"`; thứ tự nhãn → chữ cũ gạch → chữ mới → lý do → hàng nút giữ như bản thẻ; đúng một nút tô màu.
- AC-2: Given cùng bộ props của một đề xuất, When dựng ở `inline` và ở `card` qua năm trạng thái chờ, đang gửi, nút khoá kèm lý do, lỗi, đang sửa, Then hai độ dày cho cùng tập nút (tên, kiểu, khoá), cùng lý do khoá trỏ bằng `aria-describedby`, cùng dòng lỗi, cùng ô sửa; Esc trong ô sửa gọi huỷ ở cả hai.
- AC-3: Given cột góp ý OKR (`okr/the-gop-y.tsx`) và thẻ thông tin liên hệ (`components/crm/facts.tsx`), When dựng sau lượt, Then cả hai ra bản `card` với thân `Confirmation` như trước lượt, và các bài DOM sẵn có của hai màn đó vẫn xanh.
- AC-4: Given một đề xuất đã quyết, When `decided` có `onUndo`, Then ở cả hai độ dày đề xuất thu thành một dòng biên nhận gồm chữ đã quyết và nút «Hoàn tác»; bấm «Hoàn tác» gọi `onUndo` đúng một lần; dòng mang `role="status"`; quyết định bỏ qua hay bác hiện chữ mờ và vẫn ở chỗ; không có `onUndo` thì không có nút «Hoàn tác».
- AC-5: Given `KaraMark`, When dựng có và không có phạm vi, Then nó hiện icon tia sáng ẩn với trình đọc màn hình và chữ «Kara», thêm «· {phạm vi}» khi có; màu là chữ phụ, không có lớp tô màu thương hiệu nào.
- AC-6: Given `KaraLabel` nằm trong một hàng có xử lý bấm, When người bấm, nhấn Enter hoặc Space trên «Vì sao?», Then ô «Vì sao?» mở với tiêu đề «Kara dựa trên gì», lý do và giờ đọc, và cả xử lý bấm lẫn xử lý phím của hàng đều không chạy; Esc đóng ô và trả focus về nút «Vì sao?».
- AC-7: Given `AiFeedback`, When người chọn «Hữu ích» rồi «Không hữu ích», Then `onChange` nhận `true` rồi `false`, nút đang chọn mang trạng thái bật, dòng cảm ơn hiện khi đã chọn và không đang gửi; và khối tóm tắt tuần (`okr/khoi-tom-tat.tsx`) dùng `AiFeedback` thay bản riêng, giữ `data-phan-hoi`, chữ hai nút, tên nhóm, chữ cảm ơn và việc lùi lựa chọn khi gửi lỗi.
- AC-8: Given các thành phần mới, When dựng cùng props ở tiếng Việt và tiếng Anh, Then mọi chữ do thành phần tự đặt (không phải chữ màn truyền vào) đổi theo tiếng, trừ tên «Kara»; khoá mới trong `messages.ts` được ghim trong bài gác messages.
- AC-9: Given `/proto/nen-kara` chạy trên máy chủ của cây này, When mở từng trạng thái ở khổ 1440 và 390, nền sáng và tối, Then đề xuất `inline` không có viền hay nền riêng, kể cả ở phần tử con (trừ nút, ô nhập và chữ chèn tô nền), bản `card` có viền, trang không tràn ngang, ô «Vì sao?» mở được, và bấm «Hoàn tác» ở dòng biên nhận đưa đề xuất về trạng thái chờ.
- AC-10: Given kho sau lượt, When chạy cổng mồ côi AI Elements và thước tên gọi của hồ sơ `the-gop-y-okr`, Then cả hai xanh: `confirmation.tsx` vẫn được một màn trong `apps/**` dùng tới qua bản `card`.
- AC-11: Given `docs/ai-ux.md` và `docs/chat-ui.md` sau lượt, When đọc, Then mục 10 ghi đã có bốn món của lượt này kèm tên thành phần; bảng «Lộ trình áp luật» có dòng lượt khung `muc-tieu-va-kr` đứng trước dòng `gop-y-dung-cho`, và dòng `gop-y-dung-cho` ghi dựng trên `BangMucTieu` qua sáu điểm cắm có tên; `docs/chat-ui.md` ghi `confirmation.tsx` là thân bản `card` của `ProposedChange`.
- AC-12: Given ảnh `/proto/nen-kara` ở 1440 và 390 do AC-9 chụp, When một người không làm lượt này đọc, Then họ thấy đề xuất `inline` là một phần của dòng nó sửa chứ không phải một hộp riêng, và chỉ ra ngay nút chính của mỗi đề xuất. (judgment)
- AC-13: Given các tệp giao diện mới hay sửa của lượt, When chạy sàn thiết kế tĩnh, Then số lỗi nền P0 bằng 0.

## Coverage

Quét bằng `morphological-scan` trong phiên (02/10). Chân sản phẩm: `docs/ai-ux.md`
[SUY-TỪ-REPO: docs/ai-ux.md]. Chân ngành: Google Docs chế độ gợi ý (chấp nhận/từ chối tại
chỗ), GitHub «suggested changes» trong review (đề xuất neo dưới dòng, nút áp một lần),
Notion AI (chấp nhận/bỏ, hoàn tác) [NGÀNH: Google Docs suggesting mode, GitHub suggested
changes, Notion AI].

- **Trục A — thành phần:** KaraMark · KaraLabel + ô vì sao · ProposedChange inline · ProposedChange card · dòng biên nhận · AiFeedback  [thước CE: bảng mục 10 của `docs/ai-ux.md` — SUY-TỪ-REPO]
- **Trục B — trạng thái đề xuất:** chờ · đang gửi · khoá · lỗi · đang sửa · đã nhận có hoàn tác · đã nhận không hoàn tác · bỏ qua/bác  [thước CE: `ProposedChangeProps` và AC-9 của `the-gop-y-okr` — SUY-TỪ-REPO]
- **Trục C — chỗ đặt và khổ:** dưới dòng trong bảng / hàng bấm được · cột riêng · 1440 · 390 · sáng · tối  [thước CE: mục 5 của `docs/ai-ux.md`; NGÀNH: GitHub suggested changes neo dưới dòng]
- **Trục D — cách tương tác:** chuột · bàn phím · trình đọc màn hình · tiếng Việt/Anh  [thước CE: `web-design-guidelines` của kho]
- Core: A×B ở cả hai độ dày (AC-1, 2, 4), hai màn cũ (AC-3), dấu và nhãn trong hàng bấm được (AC-5, 6), phản hồi (AC-7), hai tiếng (AC-8), khổ × nền (AC-9).
- Later: dấu nhỏ trên giá trị đã nhận (mục 3) · chữ cảm ơn nói điều gì sẽ xảy ra (mục 8) · trạng thái «Kara đang …» (mục 7) — lượt `tu-vung-tac-tu`.
- Never: bản `inline` có viền hay nền riêng; dấu tô xanh thương hiệu; nhãn là nút gọi Kara làm lại — luật mục 2, 3, 5 cấm.
- [GIẢ ĐỊNH] Mặc định `density` là `inline` theo mục 5, hai màn đang dùng ghi `card` tường minh.
- [GIẢ ĐỊNH] Tên thành phần: `KaraMark`, `KaraLabel`, `ProposedChangeReceipt`, `AiFeedback`.
- [GIẢ ĐỊNH] «Hoàn tác» chỉ gọi `onUndo`; lùi giá trị thật là việc của màn gọi.

## Out of scope

- Đổi màn thật nào sang `inline` — `gop-y-dung-cho` (khu OKR) và `tu-vung-tac-tu` (thông tin liên hệ).
- Dấu nhỏ tại chỗ trên giá trị đã nhận, và vết «theo đề xuất của Kara» ở tab Vết.
- Đổi chữ cảm ơn của tóm tắt tuần để nói điều gì sẽ xảy ra; thay tên «Trợ lý OKR» trên màn.
- `simple-table.tsx` và `row-accent.ts` — thuộc lượt khung `muc-tieu-va-kr`.
- Gỡ `Confirmation` hay đổi sổ AI Elements.

## Notes

- Chạm `packages/ui/**`, `proposed-change.tsx`, `facts.tsx`, `khoi-tom-tat.tsx`, `messages.ts`, `proto/catalog.ts` làm hoá cũ khoảng 30 hồ sơ đã ký; ghim lại một lượt ở commit cuối sau khi hợp nhất `onehub`.
- S4 xếp tuần tự với lượt khung `muc-tieu-va-kr`; nhắn phiên «Phân tích và hoàn thiện OKR» trước khi chạy.

### Known limits (Cổng Bằng chứng, 2026-10-03)

- AC-8 (round 3, trong hợp đồng): ô `ProposedChange` của bài hai tiếng chỉ dựng ở trạng thái chờ, nên hai nhãn ẩn của nó — tên ô sửa (`proposedChange.edit`) và nhãn đang tải lúc gửi (`spinner.loading`) — không được bài này đo; hai nhãn vẫn đi qua `messages.ts` và có bài gác messages. Vòng đã chạm trần ba lượt chấm.
- Ngoài-1: trang mẫu `/proto/nen-kara` luôn ghi «2 góp ý» trên nhãn Kara, kể cả khi không còn đề xuất nào chờ; luật mục 6 đòi số đếm suy từ đề xuất còn chờ — lượt `gop-y-dung-cho` không chép con số cứng này.
- Ngoài-2: tập miễn dịch `TEN_RIENG` (hiện chỉ có «Kara») chưa có bài ghim cỡ như các danh sách miễn khác.
- Ngoài-4: thước màn E10 suy số ô cần đo từ chính bảng trạng thái nó duyệt; gỡ một trạng thái khỏi cả bảng lẫn mục lục proto thì thước vẫn xanh với ít ô hơn.
- Ngoài-5: thước màn E10 chỉ kiểm bốn ảnh đầu vào của E13 có tồn tại, không kiểm ảnh có do lượt chạy này chụp.
