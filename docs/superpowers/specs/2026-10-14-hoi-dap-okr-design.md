# Hỏi đáp OKR theo quyền (hàng C) — thiết kế

Hàng C của `docs/plan/lo-trinh-okr.json`. Câu giao: «Tôi hỏi về OKR trên web hoặc Zalo và nhận câu trả
lời theo quyền của tôi». Ô cơ hội `_acceptance/hoi-dap-okr/opportunity.md` (Cổng Đáng ký `build` 12/10).
Hạng T3: chạm `packages/db/prisma` và quyền đọc.

## Bài toán

Hôm nay chưa ai hỏi được Kara về OKR:

- Chat OKR trên web (`apps/agent-okr`, dựng ở D) chỉ soạn nháp. Cửa, thẻ, kênh đều buộc vào một cuộc
  soạn, và chỉ người sửa được đơn vị mới mở được cuộc soạn.
- Kara của CRM (`apps/agent`) chặn vai «chỉ OKR» ở cửa, và không được trả số OKR vì model của nó
  không mang ZDR (`docs/agent.md`, luật dữ liệu 5).
- Zalo trả câu chỉ đường sang web cho mọi câu OKR (`zalo-hoi-okr-khong-chet`).

## Hướng đã chọn

**Hỏi đáp chạy trong `apps/agent-okr`, loại phiên mới `okr-hoi`.**
- Bài học N0: không chặn được công cụ đối tác trong cùng tiến trình. Lớp cách ly tin được duy nhất là
  một app không có gì để rò (`docs/agent.md`, «App eve thứ hai»).
- `agent-okr` đã có sẵn model ZDR, kênh JWT riêng, sandbox `deny-all`, sổ chi phí và kiểm toán.
- Ranh giới của hỏi đáp trùng ranh giới của soạn: dữ liệu OKR, ZDR, vai `owner|admin|member|okr`.
  Vì vậy hỏi đáp là thêm `tool` vào cùng agent, không phải `subagent` mới (`docs/agent.md` luật 2–3).

**Mỗi `tool` tự kiểm quyền (`docs/agent.md` luật 4).**
- Ba công cụ mới: `tim_okr`, `doc_okr` và `nop_tra_loi`.
- Mỗi công cụ kiểm `purpose === "okr-hoi"` từ `auth.initiator`, rồi dựng ngữ cảnh xem bằng
  `nguCanhXemOkr` và lọc bằng `dieuKienXemMucTieu` (`packages/db/src/okr-hien-thi.ts`). Đây là cùng luật
  màn OKR đang dùng qua `OkrAccessService`.
- `nop_ban_nhap` từ chối mọi phiên không phải `okr-soan`.
- Công cụ dựng sẵn của eve vẫn tắt. Không dùng công cụ động: eve làm mất công cụ động khi phát lại
  bước (ghi nhớ «eve: hành vi đã đo»).

**Câu trả lời người đọc thấy do mã dựng (`docs/agent.md` luật 1; tiền lệ `tro_ly_kho`).**
- Kara nộp câu trả lời qua `nop_tra_loi`: từng câu chữ, mỗi câu kèm trích tới Mục tiêu hay KR đã đọc.
- Mã từ chối khi một trích trỏ tới thứ người hỏi không xem được, hoặc khi một con số trong câu không
  khớp giá trị của thứ được trích (tiến độ, giá trị hiện tại, đích, Mức tự tin). Lời từ chối nêu đúng
  chỗ cần sửa.
- Tình trạng (trượt, đúng hướng…) do `tinhTrang` của `packages/validation/src/okr-muc-tieu.ts` tính. Model
  chỉ diễn giải.

**Cuộc hỏi là một hàng mới, `OkrCuocHoi`.**
- Bảng giữ chủ của phiên, mã phiên eve và số lượt, cùng khuôn với `OkrCuocSoan` (placeholder `cho-eve:`,
  `cacPhien`).
- Cửa `apps/app/app/eve/agents/okr/...` chỉ chuyển đường của phiên thuộc cuộc của chính người gọi.
- Thủ tục API `okr.hoiMo` và `okr.hoiTangLuot` chỉ ghi sổ, không quyết gì (trí khôn ở agent).
- Migration chỉ thêm bảng.

**Màn web: cột Kara theo khuôn đã chốt 09/10.**
- Kara ở cột phải, mở qua chồng `?record=` (`docs/ai-ux.md` §11). Loại record mới `hoi-okr`; `KaraDock`
  chỉ có cột Kara, không có vật phẩm.
- Trích dẫn là `InlineCitation`, bấm mở `?record=objective:<id>` hoặc `?record=kr:<id>` chồng lên.
- Mỗi câu trả lời có `AiFeedback`.
- Lối vào là nút «Hỏi Kara» ở đầu khu OKR và ở tổng quan của vai chỉ OKR.

## Hai câu đang chờ chủ kho (soạn nháp theo khuyến nghị)

- **Hỏi-1 — Zalo.** Khuyến nghị tách Zalo thành hàng C2 đứng ngay sau C.
  - Webhook Zalo sống ở `apps/agent`, model không ZDR. Muốn Zalo trả số OKR phải dựng cầu nối mới
    `apps/agent → agent-okr` và đổi chỗ từ chối vai `okr` ở `apps/agent/agent/lib/zalo-hoi.ts:152`.
  - C2 dùng lại nguyên công cụ đọc, `nop_tra_loi` và bộ câu mẫu của C.
  - Bản nháp này coi Zalo là ngoài phạm vi; nếu chủ kho giữ Zalo trong C thì thêm AC kênh Zalo và mở
    lại Cổng Phạm vi.
- **Hỏi-2 — Trần.** Khuyến nghị dùng hằng số trong `apps/agent-okr/agent/lib/config.ts`: trần tháng
  10 USD cho cả workspace, 40 câu mỗi người mỗi ngày. Sổ chi phí mục mới `okr.hoi-dap`. Không thêm ô
  Cài đặt.

## Đo

- **Bộ câu hỏi OKR mẫu** trên bộ OKR mẫu M (`bun run okr:mau`): khoảng 30 câu, đủ năm người hỏi của trục
  A và bảy ý định của trục B (`_acceptance/hoi-dap-okr/coverage-scan.md`).
  - Mỗi câu khai sẵn kỳ vọng: những Mục tiêu/KR phải trích, những tên không được nhắc, loại câu trả lời.
  - Lệnh đo chạy Kara thật (ZDR) trong phiên đo của cây.
  - Chấm hai lớp. Luật mã: quyền, trích, số. Hội đồng ZDR: câu trả lời đúng ý câu hỏi.
- **N1** là ca góp ý, không phải câu hỏi. Ca của N1 dựng trên chính Mục tiêu quý 4 của M, nên bộ câu
  hỏi hỏi về đúng các Mục tiêu đó. Không ca nào của N1 được chạy lại ở đây.
- **«Vai chỉ OKR chỉ hỏi được OKR»** đo hai chiều trên kho đo:
  - hỏi OKR được câu trả lời có trích;
  - hỏi đối tác ra 0 tên đối tác, và không công cụ nào ngoài ba công cụ OKR được gọi;
  - có đối chứng dương: chính câu đối tác đó qua Kara của CRM bằng thành viên thường thì ra tên đối tác.
- **Nửa «trên production»** là việc sau gộp, lúc bật (`CLAUDE.md`, «Lộ trình là việc dựng»). Hợp đồng
  ghi sẵn câu SQL đọc `AgentEvent` theo vai.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: khu OKR (hay tổng quan của vai chỉ OKR) → bấm «Hỏi Kara» → cột Kara trượt từ phải, ô gõ có
  sẵn ba câu gợi ý → gõ câu hỏi → Kara đọc rồi trả lời, mỗi câu có trích → bấm trích mở Mục tiêu hay KR
  chồng lên (điểm ra: khung Mục tiêu, hoặc đóng cột).
- Biên: câu về Mục tiêu người hỏi không xem được → «Kara không thấy…» như không tồn tại; câu đối tác
  của vai chỉ OKR → Kara nói ở đây chỉ đọc OKR; câu xin sửa → Kara chỉ chỗ sửa; chu kỳ chưa có OKR →
  «Kara không thấy OKR nào trong kỳ này».
- Lỗi & quay lại: Kara hỏng giữa lượt → «Kara chưa trả lời được» + «Thử lại» gửi lại đúng câu; hết lượt
  ngày hay hết trần tháng → ô gõ khoá, một dòng nói khi nào mở lại; đóng cột giữa lượt không giết lượt,
  mở lại thấy cuộc đang dở.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cột Kara hỏi đáp (`?record=hoi-okr:<cuộc>`) | hỏi một câu về OKR, đọc câu trả lời có trích | nút «Hỏi Kara» ở khu OKR, tổng quan chỉ OKR / khung Mục tiêu, KR qua trích |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hoi-okr-trong | Cột Kara | `KaraState` trống: «Hỏi Kara về OKR bạn xem được» + ba câu gợi ý | bấm gợi ý hay gõ |
| ST-hoi-okr-dang-doc | Cột Kara | `ThinkingIndicator` «Kara đang đọc OKR…» | chờ / dừng |
| ST-hoi-okr-tra-loi | Cột Kara | câu trả lời, `InlineCitation` mỗi câu, `AiFeedback` | bấm trích / hỏi tiếp |
| ST-hoi-okr-khong-thay | Cột Kara | «Kara không thấy …» + một câu vì sao | hỏi lại khác đi |
| ST-hoi-okr-loi | Cột Kara | «Kara chưa trả lời được» + `KaraRetry` | Thử lại |
| ST-hoi-okr-het-luot | Cột Kara | ô gõ khoá + `FieldDescription` nói khi nào mở lại | chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu hỏi tối đa 500 ký tự; Enter gửi, Shift+Enter xuống dòng (hành vi của `KaraComposer`).
- Dưới 768 px cột Kara phủ toàn màn; trích mở khung chồng lên, đóng thì về đúng cuộc.
- Dữ liệu người nhập (tên Mục tiêu, KR) đánh dấu `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `KaraDock`, `KaraTranscript`, `KaraComposer`, `KaraState`, `KaraRetry` | dùng | sáu khối Kara đã chốt, Soạn OKR đang chạy |
| `InlineCitation`, `AiFeedback` | dùng | luật §8 của `docs/ai-ux.md` |
| Thẻ câu trả lời có trích | ghép | ghép `KaraTranscript` với `InlineCitation`, không khối mới trong `packages/ui` |
| Nút «Hỏi Kara» | dùng | `Button variant="outline"` trong `PageShellActions`; nút chính của trang không đổi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hội-thoại
Căn cứ: luồng hiển nhiên — một câu hỏi, một câu trả lời, trích mở chi tiết; vị trí cột phải đã chốt
09/10 (`docs/ai-ux.md` §11), không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Zalo (chờ Hỏi-1; khuyến nghị hàng C2).
- Ghi hay sửa OKR qua hỏi đáp — ranh giới của Soạn OKR và khung Mục tiêu.
- Câu đối tác của owner, thành viên trong cột Kara OKR: chỉ đường sang Kara của CRM.
- Đo trên production — việc sau gộp, lúc bật.
- Kỳ đã khép và so sánh hai kỳ: công cụ đọc nhận mọi chu kỳ xem được, nhưng bộ câu mẫu chỉ đo quý 4.
