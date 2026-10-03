# Soạn OKR cùng Trợ lý — Trợ lý cần bối cảnh gì

Viết 2026-09-30, cho hạng mục `soan-okr-cung-tro-ly` (làn A · Trợ lý OKR). Đây là
bước «làm rõ bối cảnh» chủ kho đặt làm điều kiện mở hạng mục: nó trả lời một
người cùng soạn OKR giỏi cần biết gì, CRM đã có thứ đó ở đâu, ai được thấy, tốn
bao nhiêu, lớp nào vào lượt đầu — và hình dạng của việc soạn (mục 2b): một cuộc
đối thoại, không phải một lần bấm. Chủ kho duyệt tài liệu này xong mới chạy
`/feature-loop:feature-loop` với nó làm đầu vào. Nó không phải hợp đồng nghiệm
thu và không đặt ngưỡng nào — ngưỡng là việc của Cổng Đáng và Cổng Phạm vi.

Đã đọc: `docs/plan/lo-trinh-okr.md` (mục 5 «Dựng hết bằng dữ liệu mẫu», 9, 10),
`docs/plan/lo-trinh-tro-ly-okr.md`, thiết kế
`docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md` (§4.7, §4.8,
§7.2), `N0-ket-qua.md`, hồ sơ `_acceptance/tro-ly-okr-nen`,
`_acceptance/tro-ly-okr-de-xuat`, `docs/agent.md`, `docs/api.md`, `CONTEXT.md`, mã
ở `apps/agent/agent/lib/okr/`, `apps/agent/agent/subagents/tro_ly_okr/`,
`packages/db/prisma/schema.prisma`, `packages/validation/src/`, `apps/api/src/okr/`,
`apps/api/src/tai-lieu/`, `apps/api/scripts/okr-mau/`, và tài liệu «Operating
System – OneHub» chủ kho đưa ngày 30/09.

## 1. Điều chủ kho thấy hữu hiệu khi soạn OKR với Claude bên ngoài

Chủ kho không đưa được bản ghi trò chuyện; anh đưa tài liệu «Operating System –
OneHub» là thứ hay dán vào, và nói điều làm gợi ý đúng hơn là model biết **OneHub
mô hình gì, khách hàng là ai, hoạt động ở đâu, công ty nào tương tự**. Tức là thứ
thiếu nhất không phải số, mà là **hồ sơ công ty** và **chiến lược** — hai thứ
CRM hôm nay không giữ ở dạng máy đọc được.

Tài liệu đó nói với hạng mục này bốn điều:

1. **Không nhét nguyên được.** 121 nghìn ký tự, 22 nghìn từ, ước 45–55 nghìn
   token. Trợ lý OKR có trần 40 nghìn token vào cho cả phiên
   (`TRO_LY_OKR.limits`), và gói góp ý hôm nay khoảng 7 nghìn token. Phải có bản
   rút gọn.
2. **Có phần được đọc và phần không được đọc.** Được: Sao Bắc Đẩu, ba mỏ neo
   2030, bảng KGI có chủ sở hữu và đích, vùng cấm, tám sáng kiến, nhịp rà. Không:
   mục lương thưởng và các bảng điểm theo vai có trọng số. Trợ lý bị cấm nối OKR
   với lương, thưởng, xếp hạng (NG-01, NG-02, từ cấm trong bộ kiểm); đưa phần đó
   vào gói là đưa đúng thứ nó bị cấm nhắc tới.
3. **Cây tổ chức trong tài liệu khác cây trong CRM.** Tài liệu: Khối → Trụ sở
   Vùng → Trung tâm Kinh doanh, nhiệm vụ gắn với chức danh (CPO, CGO, MCD, OIM…).
   CRM: Bộ phận → Phòng ban, không có chức danh.
4. **Tài liệu là bản nháp và không có chữ «OKR».** Nó nói bằng KGI và KSF; Trợ
   lý phải dịch sang Mục tiêu và KR, không chép KGI thành Mục tiêu (cùng lỗi
   NG-06). Vì nó sẽ đổi, chỗ giữ nó phải có phiên bản, chủ trang và hạn xác minh
   — đúng khuôn Kho tài liệu đã có.

## 2. Trợ lý OKR hôm nay thấy gì (đọc mã)

Gói dựng ở `apps/agent/agent/lib/okr/goi-ngu-canh.ts`, đọc qua `doc.ts`, đẩy vào
lời dặn của phiên con qua `subagents/tro_ly_okr/instructions/viec.ts`. Mỗi lần
bấm «Nhờ Trợ lý OKR góp ý» nó nhận về **đúng một Mục tiêu**: thang chấm; Mục
tiêu (cấp, trạng thái, tên, vì sao lúc này); các KR (tên, kiểu, khởi điểm, đích,
số hiện tại, đơn vị); chỉ **tên** Mục tiêu và KR cấp trên để Căn chỉnh; luật kiểm
đã hỏi; đề xuất đã bác hay đang chờ. Danh sách tên thành viên được đọc nhưng chỉ
để bộ kiểm chặn câu nói về người — không vào lời dặn.

Mọi công cụ khác bị khoá, chỉ có nộp đề xuất. Không có lịch sử Cập nhật tuần,
không điểm và «điều học được» kỳ trước, không cây tổ chức, không OKR ngang cấp,
không số CRM, không tài liệu. Cả kho chưa có chỗ nào ước lượng cỡ một gói bối
cảnh — chỉ có trần ký tự lẻ tẻ (`BODY_LIMIT`, `toiDaKyTu` của Kho tài liệu).

## 2b. Hình dạng: một cuộc đối thoại, bộ nháp thành hình rồi người quyết đưa vào dùng

Chủ kho chỉnh 30/09: hạng mục không phải «bấm một nút, nhận vài dòng» như 9b. Nó
là **đối thoại trực tiếp** để hình thành bộ OKR nháp, rồi người quyết định đưa
bộ đó vào sử dụng. Bối cảnh ở mục 3 là thứ Trợ lý mang vào cuộc đối thoại đó.

**Người dùng thấy**

1. Người sửa được OKR của một đơn vị (trưởng đơn vị, hoặc quản trị ở cấp
   OneHub) mở «Soạn OKR cùng Trợ lý» cho đơn vị đó và chu kỳ đang lập kế hoạch.
2. Trợ lý mở đầu bằng điều nó đã biết từ bối cảnh — kỳ trước đạt gì, trượt gì,
   cấp trên đang nhắm gì, đơn vị chịu trách nhiệm gì — và hỏi hai tới bốn câu về
   điều nó chưa biết: ưu tiên kỳ này, điều muốn khác kỳ trước, ràng buộc.
3. Người trả lời bằng chữ. Trợ lý đưa **bản nháp**: hai tới bốn Mục tiêu, mỗi Mục
   tiêu hai tới bốn KR có tên, kiểu, đơn vị đo, khởi điểm khi có từ dữ liệu, **ô
   đích để trống**, mỗi dòng kèm một câu vì sao và chỗ Căn chỉnh gợi ý.
4. Bản nháp là **một bảng sống đứng cạnh cuộc trò chuyện**, không phải chữ trong
   bong bóng chat. Người sửa trực tiếp trên bảng hoặc nói trong chat («bỏ mục 2»,
   «KR này đo việc, đổi») và Trợ lý sửa bảng; từng dòng nhận · sửa · bác như 9b,
   dòng đã bác không mời lại.
5. «Đưa vào bộ OKR»: tạo Mục tiêu và KR ở trạng thái **nháp** qua đường ghi có
   quyền của OKR, có vết «theo bản soạn của Trợ lý OKR». Người điền đích, rồi công
   bố như mọi OKR khác. Không có gì tự công bố.
6. Cuộc soạn được lưu: bản nháp cuối, dòng nào thành OKR thật. Kỳ sau, lớp 3 đọc
   được «bộ nháp nào thành OKR và đạt tới đâu» mà không cần bộ nhớ riêng.

**Khác 9b ở đâu — và kho đã có gì cho nó**

| Cần | 9b có? | Kho đã có | Việc của hạng mục |
| --- | --- | --- | --- |
| Phiên có trí nhớ theo lượt, Trợ lý hỏi lại được | Không — một lần nộp, `ask_question` bị khoá | Kho đã quyết chat OKR đi bằng **eve app riêng** (`defineRemoteAgent`) vì phép thử stub ở N0 không đạt (`lo-trinh-tro-ly-okr.md` mục 5 lượt 10; thiết kế §4.12). Nền đó thuộc hạng mục C `hoi-dap-okr`, **chưa dựng** | Hạng mục này là **người dùng đầu tiên của nền chat OKR**: hoặc đi sau C, hoặc gánh nền và C dùng lại. Khuyến nghị: gánh nền, vì soạn có giá trị trước mùa 07/12 hơn hỏi đáp; C thành lượt nhỏ sau. Đổi thứ tự làn A → Cổng Đáng quyết |
| Giao diện hội thoại | Không | Tab **Tác nhân** của khung bản ghi (deal, công ty, liên hệ): một thành phần chung `AgentPanel`, nuôi bằng bảng «loại bản ghi → tiêu đề, câu mô tả, ba câu gợi ý, ô soạn, chỗ lưu» (`apps/app/lib/agent-record.ts`); danh sách hội thoại, «cuộc mới», giữ tab sống khi chuyển tab, `?thread=` trên URL. `docs/chat-ui.md`: AI Elements giữ hội thoại, shadcn giữ phòng xung quanh; tab hôm nay còn nửa shadcn (màn trống, câu gợi ý, ô soạn) và Phase 1 của `chat-ai-elements-rebuild` chưa chạy. Thẻ góp ý của `the-gop-y-okr` (Confirmation) cho từng dòng nháp | Thêm loại «Mục tiêu» và «Đơn vị» vào bảng đó → tab **Trợ lý** trong khung Mục tiêu (cạnh KR · Căn chỉnh · Vết · Trao đổi · Diễn biến) và màn soạn cả bộ ở khung đơn vị. Dùng lại vỏ, cơ chế tiếp nối phiên và danh sách hội thoại; phần hội thoại dựng bằng AI Elements đích (`Conversation`, `ConversationEmptyState`, `Suggestion`, `PromptInput` — kéo bằng CLI, nối vào màn thật cùng thay đổi), không chép phần shadcn của tab cũ. Bảng nháp đứng cạnh, bằng thẻ góp ý |
| Đường đi phía sau | Không | Tab Tác nhân đi qua cửa `/eve/v1` tới **tác nhân CRM gốc**: mục đích «research», đủ công cụ đối tác, model không ZDR; vai «chỉ OKR» bị chặn ở cửa (`docDuocPhamVi(role, "doi-tac")`) và ở kênh (`thanhVienPrincipal`). Mục đích `okr` hiện có là việc chạy nền, không phải chat | Đường riêng: eve app riêng (đã quyết ở N0), mục đích mới cho soạn, model ghim ZDR, không công cụ đối tác, gói bối cảnh mục 3 thay phần mở đầu về bản ghi; vai «chỉ OKR» được qua — **một đường vào mới, một phép đo riêng** theo luật của `vai-chi-okr` |
| Lưu hội thoại | Không | `AgentConversation` chỉ có `contactId` · `companyId` · `dealId`, thủ tục list/save đòi đúng một trong ba và nằm sau cửa dữ liệu đối tác; bản ghi phiên trong `AgentEvent` qua hook kiểm toán | Cột mới cho Mục tiêu và đơn vị (hoặc `kind` mới), thủ tục list/save trong `okr.router` dưới `PhamViOkrMiddleware`; tiêu đề lấy từ câu đầu như deal. Chạm `prisma` — khớp hạng T3 |
| Bản nháp thành OKR | Nhận từng dòng ghi vào Mục tiêu có sẵn | `OkrService` tạo Mục tiêu, KR, Căn chỉnh có quyền và vết; trạng thái `nhap` → `cong-bo` có sẵn | Một thủ tục tạo cả bộ ở trạng thái nháp trong một giao dịch, vết ghi nguồn là cuộc soạn |
| Sổ đề xuất | `OkrDeXuat` một dòng một đề xuất | Dùng lại; thêm loại dòng «mục tiêu mới», «KR mới» và mã cuộc soạn | Mở rộng sổ, không bảng mới cho sổ |
| Bối cảnh | Một Mục tiêu | Mục 3 | Gói cho **một đơn vị và một chu kỳ**, dựng một lần khi mở cuộc soạn, đứng đầu để trúng cache qua mọi lượt |
| Luật số | «Không viết số không có trong dữ liệu» | Bộ kiểm 9b | Mở rộng: số người gõ **trong cuộc trò chuyện** cũng là dữ liệu; đích vẫn trống trừ khi người gõ đích. NG-05 giữ |
| Chi phí | Một lời gọi mỗi lượt bấm | Sổ chi phí, trần tháng, trần lượt/người/ngày của 9a và 9b | Mỗi lượt hội thoại gửi lại cả phần đầu (cache ≈ 56%). Cần trần lượt mỗi cuộc và trần cuộc mỗi đơn vị mỗi kỳ — xem mục 3 |

**Không có trong hạng mục này:** soạn qua Zalo hay Slack (chỉ trong app); Trợ lý
tự công bố; bộ nhớ chéo giữa các cuộc ngoài dữ liệu OKR và sổ đề xuất.

## 3. Các lớp bối cảnh: CRM có gì, ai thấy, tốn gì

Khung năm lớp chủ kho gợi ý, thêm lớp 0 (hồ sơ công ty) vì đó là thứ anh thấy
hữu hiệu nhất, và tách Hỏi ý mục tiêu thành 2b vì nó chưa lên `onehub`.

Ước lượng token là cho một lượt soạn bộ OKR của **một đơn vị** (3–5 Mục tiêu),
suy từ số đo N0 (gói 7,3 nghìn token ≈ 0,0076 USD một lời gọi chưa cache; cache
đọc lại ≈ 56% phần tĩnh đứng đầu). Chúng là ước lượng để xếp lớp, không phải
ngưỡng; Cổng Phạm vi đặt phép đo thật.

| Lớp | CRM đã có ở đâu | Vai «chỉ OKR» thấy? | Token mỗi lượt | Giá trị cho nháp | Lớn dần theo kỳ? |
| --- | --- | --- | --- | --- | --- |
| **0 · Hồ sơ công ty** — mô hình, khách hàng, địa bàn, sản phẩm chủ lực, công ty tương tự | **Chưa có.** `WorkspaceProfile` (`sells`, `sellsTo`, `edge`, 320 ký tự) là bản máy viết từ website, dùng cho tác nhân CRM, không có phiên bản hay duyệt | Có (không phải dữ liệu đối tác) | ≈ 800–1.500, ổn định → đứng đầu gói, trúng cache | **Cao nhất** — điều chủ kho nói thẳng | Không |
| **1 · Cây tổ chức và vai người hỏi** | `Division` → `Department` (trưởng), `OrgPlacement` (phòng ban chính, quản lý trực tiếp), `Member.role`; đường đọc `to-chuc.tree` | Có (phạm vi «tổ chức» đã mở cho vai này) | ≈ 200–400, chỉ nhánh của đơn vị đang soạn | Vừa: biết soạn cho phòng ban hay bộ phận, ai là trưởng | Không |
| **1n · Mô tả đơn vị và chức danh** — «đơn vị này làm gì, chịu trách nhiệm gì»; chức danh của người | **Chưa có** trường nào trên `Division`, `Department`, `User` hay `OrgPlacement`; tài liệu Operating System ghi mandate và KPI theo Khối nhưng CRM không có chỗ giữ; bộ mẫu chưa gán quản lý trực tiếp | Có (phạm vi «tổ chức») | ≈ 150–400: mô tả của đơn vị đang soạn và đơn vị cha, chức danh người hỏi | **Cao** cho OKR đơn vị — không có nó, nháp cho hai phòng ban khác nhau ra na ná nhau; chức danh cao cho OKR cá nhân | Không |
| **2a · OKR cấp trên và ngang cấp** | Đủ trong bảng OKR (Mục tiêu, KR, tiến độ, Cập nhật tuần); gói hôm nay chỉ lấy tên cấp trên | Có | ≈ 1.000–3.000: cấp trên đủ KR và tiến độ, ngang cấp chỉ tên | Cao: Căn chỉnh đúng, không trùng ngang cấp | Không (chỉ kỳ đang soạn và năm) |
| **2b · Hỏi ý mục tiêu** | Nhánh `feat/dot-hoi-y-tuong-okr`, đã qua S4, chờ Cổng Bằng chứng, **chưa lên `onehub`**. Chủ đề được chọn có `cauMucTieu`, `ketLuan`, `lyDo` | Có | ≈ 300–800 | Cao cho cấp OneHub và bộ phận mùa đặt OKR năm | Không |
| **3 · Lịch sử kỳ trước** | `OkrDiemKr` (số chốt, điểm, lý do), `OkrNhinLai.dieuHocDuoc`, `OkrMangSang`, toàn bộ `OkrCheckIn` (giá trị, mức tự tin cao·vừa·thấp, ghi chú ≤ 200 ký tự) | Có | ≈ 1.500–4.000 cho một kỳ, **khi mã tóm gọn** Cập nhật tuần (mức tự tin đầu và cuối, số tuần im, ghi chú hai lần cuối); đưa thô thì gấp 3–5 lần | Cao: biết bộ nào đạt, bộ nào trượt và vì sao | **Có** — mỗi kỳ thêm một tầng; lượt đầu một kỳ, sau đó hai kỳ gần nhất |
| **4 · Số CRM theo danh mục cố định** | `CHI_SO_OKR` bảy chỉ số (thoả thuận chốt, thoả thuận mới, gọi hẹn được, bước xong đúng hạn, ghi danh đạt bậc, form thành cá nhân, email gửi ra) theo toàn công ty · bộ phận · phòng ban · người; `demChiSo` | **Không** — `okr-so.service.ts` đã chặn số CRM với vai này ngay trong khu OKR; lớp này rỗng cho họ | ≈ 300: quý trước và quý này tới nay, dạng tổng | Vừa: khởi điểm có thật cho KR nguồn CRM | Nhẹ |
| **5 · Chiến lược** — Sao Bắc Đẩu, mỏ neo, KGI, vùng cấm, sáng kiến | **Chưa có.** Kho tài liệu có thật (`TaiLieuTrang`, phiên bản, chủ trang, xác minh đến ngày, tìm toàn văn) nhưng loại trang chỉ có quy định · chính sách · quy trình · biểu mẫu, và chưa có trang nào về công ty | Có — hôm nay mọi vai đọc được mọi trang đang dùng; quyền theo trang chưa dựng | ≈ 4.000–8.000 bản rút gọn, ổn định trong năm → đứng ngay sau lớp 0 | Cao: mục tiêu đơn vị neo vào KGI và sáng kiến thật | Không (đổi theo năm) |

**Cộng lại cho gói của một cuộc soạn** (lớp 0 · 1 · 1n · 2a · 3 · 4 · 5): ≈ 8–17
nghìn token, dựng một lần khi mở cuộc soạn. Vì là đối thoại, gói đó được gửi lại
**mỗi lượt** cùng lịch sử trò chuyện; cache đọc lại ≈ 56% phần đứng đầu (N0). Một
cuộc soạn 6–10 lượt, ra 2–4 nghìn token cho bộ nháp cộng các lần sửa: suy từ N0
≈ **0,10–0,25 USD một cuộc**. Mùa đặt OKR với 40 đơn vị, mỗi đơn vị một tới hai
cuộc: ≈ 4–20 USD — **có thể vượt trần tháng 9 USD** khi cộng góp ý 9b. Ba việc
theo sau: trần lượt mỗi cuộc (giả định 12) và trần cuộc mỗi đơn vị mỗi kỳ (giả
định 3) ở Chương trình OKR; chủ kho quyết ở Cổng Đáng có nâng trần tháng riêng cho
tháng đặt OKR hay không; và đo thật trước Cổng Phạm vi như N0 đã làm cho 9a.

## 4. Chỗ thiếu, và cách có nó

| Thiếu | Cách có — khuyến nghị | Cách khác đã cân, vì sao không |
| --- | --- | --- |
| Hồ sơ công ty (lớp 0) và chiến lược rút gọn (lớp 5) | **Một loại trang mới «chiến lược» trong Kho tài liệu.** Quản trị viết hai trang: «Hồ sơ công ty» và «Chiến lược năm», rút từ tài liệu Operating System, không có phần lương thưởng. Trang có chủ trang, phiên bản, xác minh đến ngày; Trợ lý chỉ đọc **bản đang dùng** của mọi trang loại này. Mỗi trang có trần ký tự, kiểm lúc duyệt bản đề xuất — chủ trang thấy ngay, không cắt im lặng. Thêm giá trị vào `LOAI_TRANG` (cột `loai` là chuỗi) — không migration | Mở rộng `WorkspaceProfile` thành form: bảng có sẵn nhưng là bản máy viết và tự làm mới từ website, không phiên bản, không duyệt — dễ ghi đè bản người viết. Bảng mới `OkrBoiCanh`: T3 và lặp lại thứ Kho tài liệu đã có |
| Lương thưởng lọt vào trang chiến lược | Dùng lại danh sách từ cấm của bộ kiểm 9b để **cảnh báo lúc duyệt** trang loại «chiến lược» (không chặn — chủ trang quyết). Bộ kiểm đầu ra vẫn chạy như 9b | Không làm gì: dữ liệu là dữ liệu, nhưng đưa từ cấm vào gói là mời model vi phạm rồi để bộ kiểm dọn |
| Mô tả đơn vị và chức danh (1n) | **Làm trong lượt này** (chủ kho chốt 30/09). Hai ô, một migration chỉ thêm: `moTa` ≤ 500 ký tự trên `Division` và `Department`, quản trị sửa ở màn Cây tổ chức; `chucDanh` ≤ 80 ký tự trên `OrgPlacement`, sửa ở chỗ đặt người vào phòng ban. Cả hai thuộc phạm vi «tổ chức». Bộ mẫu điền đủ cho Hải Đăng Logistics | Để sau: tiết kiệm được T3 hôm nay nhưng chức danh và mô tả rồi cũng cần, và mở một lượt T3 nữa đắt hơn thêm hai cột cùng lúc. Chỉ thêm mô tả đơn vị, bỏ chức danh: đã trả giá T3 thì cột thứ hai gần như miễn phí. Nhét mô tả đơn vị vào trang «Hồ sơ công ty»: không migration, nhưng model phải khớp tên đơn vị trong chữ tự do, và người sửa cây tổ chức không thấy chỗ sửa mô tả |
| Hỏi ý mục tiêu (2b) chưa lên `onehub` | **Lượt đầu không đọc.** Khi Hỏi ý gộp, thêm lớp 2b bằng một lượt T2 nhỏ: chỉ đọc chủ đề đã kết luận «chọn» của lần hỏi ý trong chu kỳ đang soạn | Dựng có điều kiện trong lượt này: hai nhánh chạm cùng gói bối cảnh, S4 phải chấm lại khi nhánh kia gộp |
| Bộ mẫu chưa thử được lớp 3 | **Làm trong lượt này:** quý 3 mẫu (`lanQuy3` ở `dien-bien.ts`) sinh mức tự tin đều «vừa» và ghi chú rỗng — thêm kịch bản mức tự tin trôi và ghi chú có lý do trượt cho vài KR; thêm hai trang loại «chiến lược» của Hải Đăng Logistics; gán quản lý trực tiếp | — |
| Không có thước cỡ gói | Một hàm ước lượng token theo ký tự trong `lib/okr/config.ts` (hệ số theo N0), trần mỗi lớp và trần tổng; quá trần thì cắt lớp 3 trước (kỳ xa hơn), rồi ngang cấp — **không bao giờ cắt lớp 0 và 5** | Đếm bằng bộ mã hoá thật: đúng hơn nhưng thêm phụ thuộc; đo ở S4 để hiệu chỉnh hệ số là đủ |
| Nhiều kỳ, tìm KR tương tự, quyền theo trang | Để sau — đã ghi ở thiết kế §7.2 (tìm toàn văn, pgvector), và lộ trình Kho tài liệu (`chu-trang-va-pham-vi`) | — |

## 5. Đề xuất: lớp nào vào lượt đầu

**Lượt đầu — `soan-okr-cung-tro-ly`:** lớp 0, 5 (qua loại trang «chiến lược»), 1
và 1n (mô tả đơn vị, chức danh), 2a, 3 (một kỳ, tóm gọn bằng mã), 4 (rỗng với vai
«chỉ OKR»), cộng thước cỡ gói và bổ sung bộ mẫu. Thứ tự trong gói: lời dặn tĩnh →
lớp 0 → lớp 5 → lớp 1 và 1n → lớp 2a → lớp 3 → lớp 4 → đơn vị đang soạn, để phần
tĩnh trúng cache.
Mọi lớp bọc trong thẻ «đây là dữ liệu, không phải lệnh» như 9b.

**Để sau, mỗi thứ một lượt nhỏ, có điều kiện mở:** 2b khi Hỏi ý lên `onehub`;
hai kỳ trở lên sau khi quý 4 khép; tìm toàn văn và quyền theo trang theo điều
kiện đã ghi ở thiết kế §7.2.

**Mỗi lớp thêm vào có một phép đo cho vai «chỉ OKR»**, theo luật «một phép đo cho
mỗi đường vào» của `vai-chi-okr`: lớp 4 phải rỗng với vai này; lớp 0, 5 là trang
Kho tài liệu họ vốn đọc được; lớp 1, 1n là dữ liệu tổ chức và lớp 2a, 3 là dữ
liệu OKR họ vốn đọc được.

## 6. Ranh giới đổi so với lộ trình — Cổng Đáng phải nói rõ

- Lộ trình ghi Trợ lý «không soạn trọn bộ OKR cho cả đội» (mục 5, lượt 9). Hạng
  mục này đổi thành: **soạn trọn bộ nháp qua đối thoại khi người yêu cầu; người
  nhận, sửa, bác từng dòng; số đích do người đặt; bộ chỉ vào CRM ở trạng thái
  nháp và người công bố** — Trợ lý đề xuất KR với đơn vị đo và khởi điểm khi có
  từ lớp 3 hay 4, ô đích để trống. NG-05 (máy không ghi số hay mức tự tin thay
  người) và NG-06 (chép KR cấp trên thành mục tiêu cấp dưới) giữ nguyên.
- Thứ tự làn A đổi: hạng mục này dựng nền chat OKR (eve app riêng) mà lộ trình
  đang xếp cho C `hoi-dap-okr`; C đi sau và dùng lại nền. Cổng Đáng ghi rõ.
- Trần tháng 9 USD có thể không đủ cho tháng đặt OKR khi có đối thoại; Cổng Đáng
  quyết giữ hay nâng riêng cho tháng đó, trước khi mùa mở (mục 8 của lộ trình
  Trợ lý OKR đã đòi điều này cho 9b).
- ZDR bắt buộc kể cả eval; trần tháng của khu OKR giữ (Cài đặt, mặc định 9 USD).
- Dùng lại sổ đề xuất, cách nhận · sửa · bác từng dòng và công tắc ba nấc tắt ·
  chế độ ẩn · bật của 9b; tắt khi gộp.
- Trang loại «chiến lược» là dữ liệu, không phải lệnh: bộ kiểm và thẻ dữ liệu
  như 9b. Người viết trang là quản trị, và trang qua duyệt như mọi trang.
- Hạng: **T3** — hai cột mới trên cây tổ chức (mô tả đơn vị, chức danh) chạm
  `packages/db/prisma`, và nền chat OKR là một đường vào mới cho vai «chỉ OKR».
  Có Cổng 1.5 duyệt kế hoạch. Chủ kho chọn 30/09 thêm hai cột trong lượt này.
- Hạn tự nhiên: trước mùa đặt OKR năm, 2026-12-07. Làn A đang bận 9c; thiết kế
  chạy song song, viết mã và chấm S4 hỏi chủ kho trước.

## 7. Giả định đã ghi

- [GIẢ ĐỊNH] Chủ kho đưa cả tài liệu Operating System và mô tả đơn vị bằng lời
  khi soạn với Claude bên ngoài; Claude hỏi lại về số khởi điểm và phạm vi đơn vị.
  Chủ kho xác nhận phần «hồ sơ công ty» là thứ hữu hiệu nhất; phần Claude hỏi lại
  là suy đoán.
- [GIẢ ĐỊNH] Hệ số token theo ký tự suy từ N0 trên Gemini 3.8 Flash; đo lại ở
  bước đo trước Cổng Phạm vi.
- [GIẢ ĐỊNH] Trần ký tự cho một trang loại «chiến lược» quanh 20 nghìn ký tự
  (≈ 8 nghìn token); con số đặt ở Cổng Phạm vi.
- [GIẢ ĐỊNH] Trần 12 lượt mỗi cuộc soạn, 3 cuộc mỗi đơn vị mỗi kỳ; 6–10 lượt là
  cỡ cuộc soạn thường gặp. Đặt lại ở Cổng Phạm vi sau khi đo.
- [GIẢ ĐỊNH] Hạng mục này gánh nền chat OKR thay cho C; nếu chủ kho giữ thứ tự
  cũ thì hạng mục chạy sau C và bỏ dòng «nền chat» ở mục 2b.
- [GIẢ ĐỊNH] Bản rút gọn của tài liệu Operating System do chủ kho tự viết, không
  do máy soạn — máy soạn của Kho tài liệu chỉ soạn từ một nguồn đã tải và trang
  đó vẫn phải qua duyệt; có thể dùng nó để có bản đầu, nhưng chủ kho quyết nội
  dung.
