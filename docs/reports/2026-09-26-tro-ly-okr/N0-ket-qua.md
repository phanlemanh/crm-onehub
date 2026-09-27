# N0 — Đo trước khi dựng Trợ lý OKR: kết quả

Đo ngày 27/09/2026 trên máy local, nhánh nháp `spike/n0-do-truoc` (commit `f148b2bb`, không
đẩy, không gộp), kho DB riêng `crm_n0_do`. Chỉ dùng dữ liệu giả. Tổng tiền gọi model:
**$0,59** (trần $1). Thiết kế đối chiếu: `12-kien-truc-va-lo-trinh.md` §4.1–4.3, §4.10, §6.3.

## Bảng tóm tắt

| # | Phép đo | Kết quả | Đạt? | Hệ quả cho lộ trình |
|---|---|---|---|---|
| 1 | ZDR với `google/gemini-3.7-flash` | Gateway nhận cờ, trả `enabledZeroDataRetention: true`. Chỉ **Vertex** phục vụ; Google AI Studio bị bỏ qua vì `zdr_not_supported` | **Đạt** | **Điều kiện ZDR của 9a đã thoả.** 9a còn chờ lượt 7 và bản vá lối rò Slack gộp. Không có nhà cung cấp dự phòng: Vertex hỏng thì việc hỏng, đúng hướng «hỏng thì đóng» |
| 1b | ZDR với `zai/glm-5.2-fast` | **Có** nhà cung cấp ZDR: Alibaba, dự phòng Baseten; cả hai đều ZDR | Đạt | Sửa một giả định sai trong thiết kế và memory: model dự phòng **có** ZDR. Chốt 1 (về gốc chỉ có mã) vẫn đứng, vì lời gọi của agent gốc không mang cờ ZDR |
| 2 | Cache trên đường ZDR | Hai lời gọi cùng prefix 7.297 token: lần 1 đọc cache 0, lần 2 và 3 đọc **4.077 (56%)**. Tiền mỗi lời gọi giảm từ $0,0076 xuống $0,0042. Prefix 2.600 token thì không có cache | **Đạt** | Giả định «60% cache» của §4.10 gần đúng (56%) cho prefix ≥ khoảng 4k. Phần tĩnh của subagent dưới 4k thì bước đầu không có cache |
| 3 | Token suy nghĩ | Mặc định: trung bình **662** token mỗi bước (6 lần, 523–792). Trường `reasoning` của AI SDK/eve **không có tác dụng** qua Gateway→Vertex (`low` ~580, `none` ~860). Cờ riêng `thinkingLevel: "low"` của Google/Vertex: trung bình **209** (4/6 lần bằng 0), tiền **giảm 54%**. `minimal` bị từ chối (400) | Đạt, kèm sửa thiết kế | Chốt 2 phải đặt **`modelOptions.providerOptions.{google,vertex}.thinkingConfig.thinkingLevel: "low"`**, không phải trường `reasoning`. Test ghim phải kiểm cờ này |
| 4 | Prefix agent gốc và giá thật | Một bước của gốc: **9.915 token** (bộ đếm GLM) hay **6.769** (bộ đếm Gemini) với 36 tool, 4 subagent, skill và một câu chỉ dẫn. Giá GLM 5.2 Fast thật qua Gateway: **$2,8 vào · $0,56 đọc cache · $8,8 ra** mỗi 1M (memory ghi $2,1/$6,6). Model trên kho local chung: Gemini 3.7 Flash. **Model trên production: chưa biết** — câu 0 của tệp SQL | Đo được | Bước chuyển tiếp ở gốc tốn **$0,0175/việc (gốc GLM)** hay **$0,0073 (gốc Gemini)**, so với giả định $0,0061. Gốc GLM làm §4.10 lệch gấp đôi (xem dưới) |
| 5 | Phép thử «stub cùng tên», 8 điểm | Đạt 6/8. **Hỏng hai điểm**: (4) stub trùng tên subagent không thay được subagent — **một lời gọi chạy cả stub lẫn subagent**; (7) resolver ném lỗi thì **phiên mở**: tool thật chạy lại, chỉ còn một dòng log | **Không đạt** | Lượt 10 **không đi đường stub**. Theo §6.3, khe 11/12 → 18/12 dành cho lượt 8; chat của lượt 10 (khi mở) đi eve app riêng |
| 6a | Subagent đọc thuộc tính phiên cha | Đọc được `purpose`, `okrTaskId`, `okrViec`; principal `eve:app` | Đạt | Subagent tự đọc việc theo `okrTaskId`; `message` không cần mang dữ liệu (§4.3) |
| 6b | Phiên con vượt trần dưới `mode: "task"` | Thất bại gọn bằng `SESSION_TOKEN_LIMIT_REACHED`, không hỏi Approve. Nhưng **lời gọi vượt trần vẫn chạy trọn**: trần 300 token ra, lời gọi sinh **6.142** | Đạt, kèm cảnh báo | Trần phiên con không chặn được một lời gọi chạy dài. eve không có trường chặn cỡ một lời gọi; 9a phải tìm cách khác (chưa đo) |
| 6c | Kết quả về gốc khi con sai khuôn hoặc vượt trần | Gốc chỉ nhận mã và một câu tiếng Anh cố định của eve. Cụm bí mật trong đầu ra của con xuất hiện **0 lần** ở phiên gốc. `toolResultFrom` **không** thu hẹp được kết quả subagent (trả `undefined`) | **Đạt** | Chốt 1 đứng. Hook ở gốc đọc `action.result` có `kind: "subagent-result"` và parse `output` bằng khuôn. Gốc **không** thất bại khi con hỏng (vẫn trả «xong»), nên phải đóng việc theo cờ `isError`, không chờ `turn.failed` |
| 7 | Giá mỗi câu hỏi CRM qua Zalo | Trung bình **$0,016/câu** (gốc Gemini) · **$0,039/câu** (gốc GLM). Ở trần 1.500 câu/tháng: **$23,5** hay **$57,9** | Đo được | **Trần 1.500 câu một mình đã vượt $20 của cả team.** Đề xuất hạ xuống **300 câu/tháng** (≈ $4,7 với Gemini). Nếu production đang dùng GLM thì 300 câu vẫn tốn ≈ $11,6 |
| 8 | Truy vấn production | Đã soạn, đã chạy thử trên kho đo riêng: chạy sạch, trong giao dịch chỉ-đọc | Sẵn sàng | Chủ kho chạy ba dòng ở đầu tệp `N0-truy-van-production.sql`. Kết quả chia $20 và trả lời model production |

**Ước lượng §4.10 lệch bao nhiêu** (kịch bản vừa, 40 phòng ban, tháng đặt OKR):

| | Thiết kế (60% cache) | Đo, gốc Gemini | Đo, gốc GLM | Đo, bỏ bước gốc (nấc 3) |
|---|---|---|---|---|
| Mỗi lần đề xuất | $0,013 | $0,016 | $0,026 | $0,009 |
| Mỗi bản tóm tắt | $0,014 | $0,017 | $0,028 | $0,010 |
| **Tháng đặt OKR** | **$8,43** | **$10,48 (+24%)** | **$16,98 (+101%)** | $5,83 |
| Tháng thường | $3,23 | $4,00 (+24%) | $6,42 (+99%) | $2,26 |

Trần $9 chỉ giữ được trong tháng đặt OKR khi có **cả hai** điều kiện: gốc dùng Gemini, và ít nhất
khoảng 18% lượt đề xuất được dùng lại theo `inputHash` (hoặc bỏ hẳn bước gốc). Nếu gốc là GLM
thì trần $9 không giữ được ngay cả ở tháng thường khi có thêm chat.

---

## Chi tiết từng phép đo

### Cách dựng

- **Gọi thẳng (phép 1–3):** `apps/agent/n0/do-mo-hinh.ts`, dùng `generateText` của AI SDK 7.0.85
  (cùng bản eve dùng) qua AI Gateway, khoá `AI_GATEWAY_API_KEY` trong `.env` gốc, cờ
  `providerOptions.gateway.zeroDataRetention: true`. Đọc `usage` và
  `providerMetadata.gateway` (định tuyến, tiền). Số thô: `apps/agent/n0/n0-mo-hinh.jsonl`,
  `n0-reasoning.jsonl`.
- **Qua eve (phép 4–7):** `eve dev --no-ui --port 2100` (`apps/agent/n0/chay-tac-tu.sh`), DB
  `crm_n0_do` tạo bằng `bun run db:do --tao --ten n0` (migrate + seed, dữ liệu `@trycomp.ai`),
  telemetry tắt. Trên nhánh nháp có:
  - purpose `okr` với một câu chỉ dẫn («gọi đúng công cụ được chỉ định một lần, rồi trả "xong"»);
  - hai subagent giả `tro_ly_okr` (trần 40k/4k) và `n0_tran_nho` (trần ra 300), model
    `google/gemini-3.7-flash`, cờ ZDR và `thinkingLevel: "low"` ở `modelOptions`, `outputSchema`
    là `ketQuaTroLy` của §4.3; tool `doc_thuoc_tinh`, `ghi_nhap`; hook ghi mọi bước;
  - tool động `n0-stub.ts` đè sáu tên (`search_crm`, `read_crm_history`, `list_deals`,
    `web_fetch`, `bash`, `tro_ly_okr`) khi phiên mang thuộc tính `n0Stub`;
  - hook gốc `n0-do.ts` thử `toolResultFrom` trên mọi `action.result`;
  - route `POST /internal/crm/n0` trên kênh `crm` (Bearer `AGENT_BRIDGE_SECRET`) gọi `send` với
    `auth` và `mode` tuỳ ý — để mở phiên đúng như kênh `crm` mở việc thật (`mode: "task"`,
    principal `eve:app`).
- Kịch bản gửi và đọc luồng: `apps/agent/n0/phien.py`, `gui.py`, `zalo.py`. Sự kiện thô:
  `apps/agent/n0/phien-*.json`, `zalo-*.json`.

### 1. ZDR

| Lời gọi | Nhà cung cấp phục vụ | Ghi chú định tuyến | Tiền |
|---|---|---|---|
| Gemini 3.7 Flash, cờ ZDR | `vertex` | «ZDR requested: 2 attempts → 1 ZDR attempts»; `google` bị bỏ vì `zdr_not_supported` | $0,0021 |
| GLM 5.2 Fast, cờ ZDR | `alibaba` (dự phòng `baseten`) | «all 2 attempts support ZDR» | $0,0133 |
| GLM 5.2 Fast, không cờ | `alibaba` | — | $0,0014 |

Không lời gọi nào lỗi. Kết quả trả về có `enabledZeroDataRetention: true`.

Hệ quả phụ: chọn ZDR cho Gemini là chỉ còn một nhà cung cấp. Nếu Vertex quá tải, việc `okr-*`
hỏng và đóng với lý do; không có đường rơi sang nhà cung cấp không ZDR. Đúng hướng thiết kế.

### 2. Cache trên đường ZDR

Prefix 7.297 token (60 dòng luật giả + gói OKR giả), `thinkingLevel` mặc định của AI SDK:

| Lần | Đọc cache | Affinity | Tiền |
|---|---|---|---|
| 1 | 0 | `no_pin` | $0,0076 |
| 2 | 4.077 | `confirmed`, ghim `vertex` | $0,0042 |
| 3 | 4.077 | như trên | $0,0047 |
| 2 lần thêm với `caching: "auto"` | 4.077 | như trên | $0,0045–0,0047 |

`caching: "auto"` không thêm gì. Cache ngầm của Gemini đi theo khối, nên chỉ ~56% prefix được
đọc lại. Prefix dưới khoảng 2.600 token (fixture subagent) thì cả hai bước đều đọc cache 0.

Phía agent gốc: bước chuyển tiếp trúng cache rất cao vì prefix giống hệt giữa các việc. Gốc GLM
đọc cache **9.856/9.915 (99%)** ngay từ việc thứ hai; gốc Gemini đọc **2.989/6.769 (44%)**.

### 3. Token suy nghĩ

Cùng một câu hỏi ngắn (3 KR giả, «KR nào đo được»), Gemini 3.7 Flash, cờ ZDR:

| Cách đặt | Token suy nghĩ (từng lần) | Trung bình | Tiền trung bình |
|---|---|---|---|
| Mặc định | 592, 776, 606, 792, 523, 682 | 662 | $0,00299 |
| `reasoning: "low"` (AI SDK/eve) | 565, 590 | 578 | $0,00269 |
| `reasoning: "minimal"` | 817, 676 | 747 | $0,00328 |
| `reasoning: "none"` | 902, 823 | 863 | $0,00372 |
| `google`+`vertex` `thinkingConfig.thinkingLevel: "low"` | 0, 638, 0, 0, 0, 618 | 209 | $0,00138 |
| `thinkingBudget: 0` | 511, 561 | 536 | $0,00254 |
| `thinkingLevel: "minimal"` | lỗi 400 «Thinking level is unsupported» | — | — |

Đọc: trường `reasoning` chung của eve (`defineAgent({ reasoning })`) đi qua AI SDK và **không
tới được** Vertex qua Gateway. Chỉ cờ riêng của nhà cung cấp có tác dụng, và phải khai cả
`google` lẫn `vertex` vì Gateway chọn Vertex khi có ZDR. Giả định rủi ro «+1.500 token suy nghĩ
mỗi bước con» của §4.10 là cao quá: đo được +662 khi để mặc định, +209 khi đặt thấp.

### 4. Prefix của agent gốc và giá thật

| Phiên | Model gốc | Bước 1: vào · đọc cache · ra | Bước 2: vào · đọc cache · ra | Tiền gốc mỗi việc |
|---|---|---|---|---|
| `okr`, việc đầu tiên | GLM | 9.915 · 0 · 282 | 10.216 · 9.856 · 19 | $0,0369 |
| `okr`, sai khuôn | GLM | 9.913 · 9.856 · 744 | 10.685 · 9.856 · 4 | $0,0201 |
| `okr`, vượt trần | GLM | 9.914 · 9.856 · 298 | 10.237 · 9.856 · 4 | $0,0149 |
| `okr`, lần 1 | Gemini | 6.769 · 0 · 189 | 6.979 · 0 · 14 | $0,0111 |
| `okr`, lần 2 | Gemini | 6.769 · 2.989 · 237 | 7.027 · 3.010 · 23 | $0,0073 |
| hỏi đáp (purpose `research`, không việc) | GLM | 10.159 · 3.072 · 4 | — | $0,0216 |

- Prefix nằm trong khoảng 6–10k mà §4.10 giả định. Thay sáu mô tả tool bằng stub ngắn chỉ bớt
  405 token (phép 5, điểm 6), nên cắt tool không phải đòn bẩy lớn.
- Chỗ lệch là **token ra**: GLM sinh 280–740 token suy nghĩ ở bước gọi tool, với giá ra $8,8/1M.
  Thiết kế giả định 150 token ra cho cả hai bước.
- Giá GLM 5.2 Fast tính từ bảng tiền của Gateway: vào $2,8, đọc cache $0,56, ra $8,8 mỗi 1M
  (`inputInferenceCost`, `outputInferenceCost` của lời gọi ZDR; phần cache suy từ ba bước gốc,
  khớp nhau tới $0,01/1M). Memory `ai-gateway-key-and-budget` ghi $2,1 · $6,6 — cũ.
- Model của hàng `appSetting` trên kho local chung `crm`: `google/gemini-3.7-flash` (đọc chỉ-đọc).
  Production: câu 0 của tệp SQL.

### 5. Phép thử «stub cùng tên»

| Điểm | Cách đo | Kết quả |
|---|---|---|
| 1. Tool động đè tool tự viết và tool dựng sẵn | Phiên có stub gọi `search_crm` và `bash` | **Đè được**: cả hai trả `STUB-N0-DA-CHAY …` |
| 2. Model thấy mô tả nào | Nhờ model chép nguyên văn mô tả | **Mô tả của stub** («MO-TA-STUB-N0: …») |
| 3. Phiên nghiên cứu chạy song song | Một phiên không stub chạy cùng lúc, chép mô tả và gọi `search_crm` | **Còn nguyên**: mô tả gốc, kết quả tìm thật |
| 4. Tool sinh từ subagent | Stub tên `tro_ly_okr`, gốc gọi `tro_ly_okr` | **Không đè được.** Một `callId` sinh **hai** `action.result`: một của stub, một của subagent thật (có `subagent.called`, phiên con chạy). Model thấy mô tả của subagent |
| 5. `execute` viết tại chỗ sống qua chạy lại | Lượt 1 gọi stub; tắt và bật lại máy chủ; lượt 2 cùng phiên gọi lại | **Sống**: lượt 2 vẫn trả kết quả stub |
| 6. Cỡ prefix thật | Bước 1 của phiên `okr` có sáu stub | 9.510 token (không stub: 9.915) |
| 7. Resolver ném lỗi | Resolver cố ý `throw` | **Phiên mở.** eve log «Dynamic tool resolver … threw — skipping», phiên chạy với `search_crm` thật và trả dữ liệu thật |
| 8. Stub lộ tên tool thật | Nhờ model liệt kê mọi tool | **Lộ.** Stub giữ nguyên tên; model liệt kê đủ 40 tên, gồm mọi tool bị đè và mọi subagent. Chỉ mô tả và khuôn đầu vào bị thay |

Kết luận: cách ly bằng stub hỏng theo hướng **mở** ở hai chỗ (điểm 4 và 7). Điều §4.1 «Bỏ» đã
lo, nay có số đo.

Ghi chú bên lề, không thuộc OKR: `tools/zalo-chi-doc.ts` (hỏi CRM qua Zalo chỉ-đọc) dựa đúng
vào cơ chế này. Resolver của nó hiện là hàm thuần trên danh sách tĩnh nên không có đường ném lỗi
thực tế; nhưng ai sửa nó mà thêm một lời đọc DB thì một lỗi DB sẽ trả lại tool ghi cho phiên Zalo.

### 6. Ba phép đo subagent

- **6a.** Tool `doc_thuoc_tinh` trong phiên con ghi: `current` và `initiator` đều là
  `{purpose: "okr", okrTaskId: "n0-task-001", okrViec: "de-xuat"}`, principal `eve:app`. Khớp
  với cách `agent_runner` đang đọc `runId` trong resolver model của nó.
- **6b.** `n0_tran_nho` (trần ra 300), phiên gốc `mode: "task"`. Bước 1 của con sinh 6.142 token
  ra (bị buộc gọi `ghi_nhap` với một đoạn dài) và chạy trọn — tốn $0,025. Bước 2 bị chặn:
  `step.failed` → `turn.failed` → `session.failed`, cùng mã `SESSION_TOKEN_LIMIT_REACHED`,
  `details: {kind: "output", limit: 300, usedTokens: 6142}`. Không có `input.requested`.
- **6c.** Gốc nhận:
  - sai khuôn: `{"code": "SUBAGENT_EXECUTION_FAILED", "message": "The agent could not produce a result matching the requested schema."}`, `isError: true` (phiên con: `OUTPUT_SCHEMA_NOT_FULFILLED`, chỉ một bước, không thử lại);
  - vượt trần: cùng mã, câu «The session reached its configured output token limit.».

  Cụm «BIMAT-OKR-7731 Doanh thu Zeta 12 tỷ» mà con bị buộc viết: 0 lần trong mọi sự kiện của
  phiên gốc và trong bảng `agentEvent`. Thành công thì gốc nhận
  `{kind: "subagent-result", output: {trangThai, maLoi}, usage: {...}}`.

  `toolResultFrom(event.data.result, <agent.ts của subagent>)` trả `undefined` ở cả ca thành
  công: không dùng được cho subagent. Parse thẳng `data.result.output` khi
  `data.result.kind === "subagent-result"`.

Ba điều thiết kế chưa biết, nay đo được:

- **Gốc không hỏng khi con hỏng.** Model gốc đọc kết quả lỗi rồi trả «xong»; lượt gốc kết thúc
  bằng `turn.completed`. Nhánh «`turn.failed` gọi `completeTask`» của §4.3 sẽ không bao giờ chạy
  cho ca này. Hook ở gốc phải đọc `isError` trong `action.result` của `tro_ly_okr` và đóng việc
  với mã lỗi.
- **`subagent.called` không vào bảng `agentEvent`** (0 dòng sau 7 lần gọi; `subagent.completed`
  chỉ có ở ca thành công). Truy vấn §6.3 điểm 7 theo `subagent.called` sẽ luôn ra 0; tệp SQL đếm
  qua `action.result` thay vào.
- **Kết quả lỗi không mang `usage`.** Token của một phiên con hỏng (6.142 token ra ở trên) không
  đọc được từ phía gốc. Hook chi phí **trong** subagent (§4.10) vì vậy là đường duy nhất; fixture
  cho thấy hook đó chạy và thấy `costUsd` ở mọi bước của con.

### 7. Giá mỗi câu hỏi CRM qua Zalo

Đường đo: phiên eve mang đúng `auth` mà `hoiTacTu` (`lib/zalo-hoi.ts`) dựng — authenticator
`zalo`, principal là thành viên, thuộc tính `{purpose: "zalo", userId, zaloChatId, hoiId}`,
continuation token `chat:<chat>:<người>:<ngày>` — nên có đúng chỉ dẫn `CHI_DAN_ZALO` và bộ tool
chỉ-đọc `zalo-chi-doc`. Khác đường thật một chỗ: phiên mở qua route nháp trên kênh `crm` thay vì
webhook Zalo, để không có tin nào gửi ra Zalo. Model, chỉ dẫn, tool và cache giống hệt.

Ba câu mẫu trong cùng một phiên (một người, một ngày), trên dữ liệu seed:

| Câu | Gemini: bước · vào · cache · ra · tiền | GLM: bước · vào · cache · ra · tiền |
|---|---|---|
| «Thoả thuận nào của tôi sắp hạn?» | 2 · 13.113 · 3.160 · 2.906 · $0,0186 | 2 · 17.304 · 6.912 · 3.961 · $0,0678 |
| «Công ty nào đang có nhiều thoả thuận mở nhất?» | 1 · 10.792 · 6.689 · 1.306 · $0,0085 | 1 · 10.314 · 6.912 · 746 · $0,0200 |
| «Tóm tắt giúp tôi thoả thuận lớn nhất đang mở.» | 4 · 53.945 · 40.842 · 1.881 · $0,0199 | 2 · 22.261 · 20.608 · 1.342 · $0,0280 |
| **Trung bình** | **$0,0157** | **$0,0386** |

Ở trần hiện tại 1.500 câu/tháng: **$23,5** (Gemini) hay **$57,9** (GLM). Ở 300 câu: $4,7 hay
$11,6. Phần lớn tiền là token ra (suy nghĩ), không phải prefix: câu đầu của Gemini có 2.906
token ra, trả lời chỉ vài trăm. Đặt `thinkingLevel: "low"` cho purpose `zalo` sẽ giảm thêm,
nhưng chạm `lib/model.ts` của hãng (chưa đo).

### 8. Truy vấn production

`N0-truy-van-production.sql`: bốn nhóm câu trong một giao dịch `read only`, có hướng dẫn ba dòng
ở đầu tệp. Đã chạy thử trên `crm_n0_do`: sạch, và nhóm 1 phân loại đúng các phiên N0.

- **0.** Model đang đặt cho agent gốc.
- **1.** Tiền 30 ngày theo kênh · purpose · loại việc, suy từ `agentTask`, `agentRun`, `zaloHoi`,
  `agentConversation`; cộng tiền theo ngày.
- **2.** Phiên con theo subagent (đếm qua `action.result`, kèm token con khi có), so với
  `AgentRun.costUsd`, và thống kê Hỏi CRM qua Zalo.
- **3.** Thành viên theo vai; số người dùng OKR theo cách dùng; phòng ban và bộ phận đã có Mục
  tiêu.
- **4.** Ban lãnh đạo mang vai quản trị. «Ban lãnh đạo» không phải một Đơn vị trong dữ liệu, nên
  câu lấy **trưởng bộ phận** làm đại diện, kèm tổng số người mang vai quản trị.

Giới hạn: `step.completed` không ghi tên model từng bước, nên tiền theo model không tách được;
tiền của phiên con không có trong DB (chỉ token khi con thành công).

## Tiền đã tiêu cho N0

| Phần | Tiền |
|---|---|
| Gọi thẳng Gateway (phép 1–3, 36 lời gọi, 34 thành công) | $0,106 |
| Phiên gốc qua eve (phép 4–6) | $0,276 |
| Phiên con (subagent giả) | $0,045 |
| Hỏi CRM qua Zalo (6 câu) | $0,163 |
| **Cộng** | **$0,590** |

Số lấy từ `costUsd` Gateway trả về từng bước. Khoá `onehub-crm-local`, không tạo khoá mới.

## Việc còn mở cho 9a (không chặn mở 9a)

- Chặn cỡ **một lời gọi** của subagent: eve 0.29.4 không có trường nào; thử cờ riêng của
  Google/Vertex trong `providerOptions` (chưa đo).
- Hook «chặn mọi tool khác» ở gốc (K4): hook của eve chỉ quan sát; cách duy nhất là ném lỗi, làm
  lượt thất bại. Cần đo ở 9a rằng ném lỗi ở `actions.requested` dừng được tool trước khi chạy.
- Cache của subagent chỉ có khi phần đầu cố định ≥ khoảng 4k token.

## Dọn

Kho `crm_n0_do` và bản mẫu `crm_n0__mau_do` đã xoá sau khi đo. Máy chủ eve cổng 2100 đã tắt.
Không ghi gì vào kho `crm` chung (chỉ đọc hàng `appSetting`).
