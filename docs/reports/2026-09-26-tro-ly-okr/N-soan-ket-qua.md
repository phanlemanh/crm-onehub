# N-soạn — đo trước khi dựng, 2026-09-30

Đo cho `soan-okr-cung-tro-ly` (giả định 1 và 3 của hồ sơ cơ hội). Mã thử là vật vứt đi, không vào kho; số thô giữ ở máy chủ kho.

# N-soạn — Đo trước Cổng Phạm vi «Soạn OKR cùng Trợ lý»: kết quả

Đo ngày 30/09/2026 trên máy local, cây làm việc `friendly-liskov-8d4458` (nhánh
`feat/soan-okr-cung-tro-ly`, không commit, không chạm mã sản phẩm). Chỉ dùng bộ mẫu Hải Đăng
Logistics đọc thẳng từ `apps/api/scripts/okr-mau/cong-ty.json`, không seed DB. Model
`google/gemini-3.8-flash` qua AI Gateway, khoá `AI_GATEWAY_API_KEY` ở `.env` gốc, **mọi lời gọi
mang cờ ZDR** (`enabledZeroDataRetention: true`, Vertex phục vụ, Google AI Studio bị bỏ vì
`zdr_not_supported`) và `thinkingConfig.thinkingLevel: "low"` cho cả `google` lẫn `vertex`.
Tổng tiền: **$0,041** (trần dừng $0,90, trần cứng $1,00). Hai giả định thử: **3** (tiền một cuộc
soạn) và **1** (bối cảnh có làm nháp tốt hơn rõ rệt không) của
`_acceptance/soan-okr-cung-tro-ly/opportunity.md`.

## Tóm tắt

| Giả định | Kết quả | Đọc |
|---|---|---|
| 3 · Một cuộc soạn ≤ 0,25 USD | Cuộc 4 lượt có gói đủ lớp: **$0,024**, không trúng cache. Ngoại suy 6–10 lượt: **$0,04–0,09**. Với gói cỡ thật 12 nghìn token (thiết kế §3): ≈ $0,11–0,15 | **Đứng**, dư 40–80% dưới ngưỡng. Mùa 40 đơn vị × 1–2 cuộc: $1–7 với gói mẫu, $4–12 với gói cỡ thật — trần tháng 9 USD chỉ căng ở kịch bản gói lớn và ai cũng soạn hai cuộc dài |
| 1 · Bối cảnh làm nháp đúng hơn rõ rệt | Giám khảo mù (cùng model, ZDR) chấm bản có gói **26/30**, bản không gói **10/30**, chọn bản có gói. Cách biệt lớn nhất ở căn chỉnh (5 so 1), khởi điểm (4 so 0), phù hợp đơn vị (4 so 1) | **Đứng** trên một mẫu (n = 1, một phòng ban, một giám khảo). Đủ để qua Cổng Phạm vi, chưa đủ làm số thống kê |

## 1. Cỡ gói bối cảnh (phòng Kinh doanh miền Bắc)

Gói dựng bằng chữ thường từ JSON, bọc trong `<du-lieu-okr> … </du-lieu-okr>` như
`goiThanhChiDan`. Bản đầy đủ ở `goi-boi-canh.txt`.

| Lớp | Nguồn | Ký tự |
|---|---|---|
| 0 · Hồ sơ công ty | viết tay cho spike | 1.094 |
| 5 · Chiến lược (Sao Bắc Đẩu, 3 mỏ neo, 5 KGI, sáng kiến, vùng cấm, nhịp quý, điều muốn thấy quý 4) | viết tay cho spike | 3.406 |
| 1 · Khối, đơn vị, trưởng, mô tả đơn vị | JSON + một đoạn mô tả viết tay | ≈ 600 |
| 2a · 3 Mục tiêu năm đủ KR, Mục tiêu quý 4 của khối đủ KR, tên Mục tiêu quý 4 của 3 phòng ngang cấp | JSON | ≈ 2.100 |
| 3 · Quý 3 của phòng: 1 Mục tiêu, 2 KR có số chốt và điểm, điều học được | JSON | ≈ 600 |
| 4 · 3 chỉ số CRM dạng tổng, quý 2 và quý 3 | viết tay cho spike | ≈ 300 |
| **Cả gói** | | **8.505 ký tự** |

Token: lời gọi đầu có gói vào **3.246 token** (gồm luật phương pháp ≈ 600); lời gọi không gói
vào 604. Suy ra **gói ≈ 2.650 token**, tức ≈ 3,2 ký tự một token với tiếng Việt có dấu.

Thấp hơn nhiều so với ước lượng 8–17 nghìn của thiết kế §3, vì bộ mẫu nhỏ: kỳ trước chỉ một
Mục tiêu hai KR, chưa có tóm tắt Cập nhật tuần, lớp 5 rút gọn 3,4 nghìn ký tự thay vì 4–8 nghìn
token. Hệ quả đo được: **prefix dưới ngưỡng ~4 nghìn token nên cache đọc 0 ở mọi lượt** (N0 đã
thấy prefix 2,6k không có cache, 7,3k có 56%). Gói cỡ thật sẽ vượt ngưỡng và bắt đầu trúng cache;
gói mẫu thì không — nên số dưới đây là số **không cache**, tức là cận trên.

## 2. Giả định 3 — một cuộc soạn 4 lượt, gửi lại cả lịch sử mỗi lượt

Kịch bản: hệ thống = luật phương pháp (chép nguyên mục «OKR method» của
`subagents/tro_ly_okr/instructions.md`) + luật số + gói; người là trưởng phòng Kinh doanh miền Bắc.

| Lượt | Người gõ | Vào | Đọc cache | Ra (suy nghĩ) | Trễ | USD |
|---|---|---|---|---|---|---|
| 1 | «Soạn bộ OKR quý 4 cho phòng này: hỏi tôi 2–3 câu trước» | 3.246 | 0 | 361 (0) | 4,9 s | 0,00379 |
| 2 | Trả lời ba câu (ưu tiên, khác quý 3, ràng buộc) | 3.712 | 0 | 714 (0) | 6,6 s | 0,00546 |
| 3 | «Đưa bản nháp: 2–4 Mục tiêu, mỗi cái 2–4 KR, có kiểu, đơn vị đo, khởi điểm nếu có, đích để trống, mỗi dòng một câu vì sao» | 4.469 | 0 | 1.022 (0) | 11,7 s | 0,00718 |
| 4 | «Bỏ mục tiêu 2, KR đầu của mục tiêu 1 đo việc chứ không đo kết quả, đổi» | 5.514 | 0 | 925 (0) | 7,3 s | 0,00760 |
| **Cộng** | | 16.941 | 0 | 3.022 | 30,5 s | **0,02404** |

Giá suy từ hoá đơn Gateway: **$0,75 vào · $3,75 ra mỗi 1M token** (Gemini 3.8 Flash, cao hơn
3.7 Flash mà N0 đo). Token suy nghĩ = 0 ở mọi lượt nhờ `thinkingLevel: "low"` (lời gọi thử
không đặt cờ này sinh 162 token suy nghĩ cho một câu một chữ). Lượt sau đắt hơn lượt trước vì
lịch sử dài thêm ≈ 750–1.000 token mỗi lượt; tiền ra chiếm 47%.

**Ngoại suy** (cùng nhịp tăng lịch sử ≈ 1.000 token/lượt, ≈ 800 token ra mỗi lượt sau, không cache):

| Cỡ cuộc | Gói mẫu 2,7k token | Gói cỡ thật 12k token |
|---|---|---|
| 4 lượt (đo) | $0,024 | ≈ $0,05 |
| 6 lượt | ≈ $0,04 | ≈ $0,08 |
| 8 lượt | ≈ $0,06 | ≈ $0,11 |
| 10 lượt | ≈ $0,08 | ≈ $0,15 |

Gói cỡ thật cộng thêm 9,3k token vào mỗi lượt (≈ $0,007/lượt), trước khi trừ cache; với cache
56% phần đứng đầu như N0, cột phải giảm còn ≈ $0,08–0,11 ở 8–10 lượt.

**Mùa đặt OKR, 40 đơn vị:**

| | 1 cuộc mỗi đơn vị | 2 cuộc mỗi đơn vị |
|---|---|---|
| 4 lượt, gói mẫu | $0,96 | $1,92 |
| 8 lượt, gói mẫu | $2,4 | $4,8 |
| 8 lượt, gói cỡ thật, không cache | $4,4 | $8,8 |
| 10 lượt, gói cỡ thật, không cache | $6,0 | $12,0 |

Ngưỡng «≤ 0,25 USD một cuộc» của giả định 3 **đứng với biên rộng** ở mọi kịch bản. Trần tháng
9 USD chỉ chạm khi gói cỡ thật, không cache, và mọi đơn vị đều soạn hai cuộc 8–10 lượt — cộng
thêm góp ý 9b. Trần lượt mỗi cuộc (giả định 12 của thiết kế) và trần cuộc mỗi đơn vị mỗi kỳ vẫn
cần, nhưng con số của chúng có chỗ rộng.

## 3. Giả định 1 — có gói và không gói, giám khảo mù

Cùng phòng, cùng yêu cầu của lượt 3, gọi độc lập (không có hai lượt hỏi đáp trước):

| Bản | Vào | Ra | Trễ | USD |
|---|---|---|---|---|
| Có gói (`nhap-co-boi-canh.md`) | 3.269 | 1.306 | 11,0 s | 0,00735 |
| Không gói — chỉ tên đơn vị + luật (`nhap-khong-boi-canh.md`) | 604 | 1.051 | 10,5 s | 0,00439 |

Giám khảo: cùng model, ZDR, thấy gói bối cảnh và hai bản nháp xáo thứ tự ngẫu nhiên (bản có gói
rơi vào **B**), chấm 0–5 sáu tiêu chí, một lời gọi $0,00484:

| Tiêu chí | Không gói (A) | Có gói (B) |
|---|---|---|
| Căn chỉnh với Mục tiêu năm và Mục tiêu quý 4 của khối | 1 | 5 |
| Dùng đúng khởi điểm từ kỳ trước và số CRM | 0 | 4 |
| KR đo kết quả, không đo việc | 2 | 4 |
| Có đối trọng | 2 | 4 |
| Không số đích bịa, đích để trống | 4 | 5 |
| Phù hợp đơn vị | 1 | 4 |
| **Cộng** | **10/30** | **26/30** |

Giám khảo chọn **B (có gói)**. Lời bình: bản B bám Mục tiêu quý của khối, bài học bảng giá quý 3
và yêu cầu giữ chân đối tác mùa Tết; bản A chung chung, lấn sang chăm sóc đối tác và vận hành,
đưa việc nội bộ («hoàn thiện bộ tài liệu hướng dẫn», «tỷ lệ tham gia Cập nhật tuần») vào OKR.

Đọc bằng mắt, khớp với giám khảo: bản có gói lấy khởi điểm 82% gia hạn từ Mục tiêu năm, nhắc
11 hợp đồng quý 3 và chỉ tiêu 14 tỷ của khối, căn chỉnh tới `q4-kd`, `n1`, `n2`; bản không gói
không có một con số nào từ thực tế và bịa vai «kết nối hiệp hội doanh nghiệp».

Giới hạn: một mẫu, một phòng ban, một giám khảo cùng họ model với người soạn; giám khảo được
xem gói nên tiêu chí căn chỉnh và khởi điểm **tự nhiên thiên về** bản có gói — đó là chủ ý của
rubric (đúng bối cảnh là điều cần đo), không phải phép đo trung lập về «chất lượng văn».

## 4. Điều thấy bên lề, cần cho thiết kế

- **Model gọi tên người** («Chào chị Lan») ở mọi lượt có gói, dù luật cấm nêu tên: lớp 1 mang
  tên trưởng phòng, model dùng ngay. Gói nên đưa **chức danh**, không đưa tên (thiết kế §3 lớp
  1n đã hướng vậy); hoặc bộ kiểm chặn tên như 9b đang làm với `tenThanhVien`.
- **Máy ghi số đích hai lần** dù luật bảo để trống: «Đích: 1» cho KR kiểu mốc (lượt 2, 3, và bản
  so sánh), và «đạt 100%» trong tên KR (lượt 3). Bộ kiểm NG-05 «0 số đích do máy ghi» phải soi
  cả **tên KR** lẫn ô đích, và KR kiểu mốc cần luật riêng (đích của mốc là 1 theo định nghĩa —
  cho phép hay không phải chốt).
- Lượt 4 hiểu «bỏ mục tiêu 2» rồi lại **kéo KR của mục tiêu 2 sang mục tiêu 1** (KR 1.4 bảng
  giá). Người có thể muốn vậy hoặc không; bảng nháp sống cạnh chat (thiết kế §2b) nên hiện diff
  từng dòng để người thấy dòng nào được chuyển chứ không chỉ bị xoá.
- Lượt 2 tự đưa bản nháp trước khi được yêu cầu (người mới trả lời câu hỏi). Nếu muốn giữ nhịp
  «hỏi → trả lời → nháp», chỉ dẫn hệ thống phải nói rõ.
- Không cache ở prefix 3,2k: gói mẫu cần thêm lớp (tóm tắt Cập nhật tuần, lớp 5 đủ dài) mới
  vượt ngưỡng ~4k mà cache Gemini bắt đầu đọc lại. Đo cache thật phải chờ gói cỡ thật.

## 5. Tiền đã tiêu cho spike

| Lời gọi | USD |
|---|---|
| Thử khoá và đọc trường tiền (1 câu một chữ) | 0,00062 |
| Cuộc soạn 4 lượt | 0,02404 |
| Nháp có gói + nháp không gói | 0,01174 |
| Giám khảo | 0,00484 |
| **Cộng (8 lời gọi, 8 thành công)** | **0,04125** |

Số lấy từ `providerMetadata.gateway.cost` của từng lời gọi, ghi ở `goi.jsonl`. Không tạo khoá
mới, không gọi model nào thiếu cờ ZDR.

## Tệp

- `goi-boi-canh.ts` — dựng gói từ JSON, ba lớp viết tay (0, 5, 4) và mô tả đơn vị.
- `do-soan.ts` — bộ đo: `goi` (in gói), `thu` (thử khoá), `cuoc`, `so-sanh`, `judge`; dừng khi
  tiền cộng dồn ≥ $0,90. Chạy từ gốc kho: `bun run apps/agent/n-soan/do-soan.ts <phép>`.
- `goi.jsonl` — mọi lời gọi thô: usage, gateway, tiền, văn bản trả về.
- `goi-boi-canh.txt` — gói đã dựng. `cuoc-soan.json`, `cuoc-soan.log` — bốn lượt.
  `nhap-co-boi-canh.md`, `nhap-khong-boi-canh.md`, `so-sanh.log` — hai bản nháp.
  `judge.json`, `judge.log` — điểm và thứ tự A/B.
