# Cửa sổ trò chuyện nói tiếng Việt — thiết kế

Đợt HAI của lát dựng tác nhân. Đợt một đã ký (PR #5) và để lại ba mối nối có răng
mà vòng này phải tháo.

## Quét không gian tiêu chí (morphological-scan, preset test-matrix)

### Ngữ cảnh

Sản phẩm: CRM nội bộ của OneHub. **Chân sản phẩm** — `CLAUDE.md`, `CONTEXT.md`,
và bốn hồ sơ Việt hoá đã ký trong chính kho này
`[SUY-TỪ-REPO: _acceptance/agent-builder-noi-tieng-viet/]`. **Chân ngành** — ba
chuẩn có tên cho việc kiểm một giao diện đã thật sự được bản địa hoá chưa:
thuộc tính `translate` của **WHATWG HTML** `[NGÀNH: WHATWG HTML — translate]`,
**W3C Internationalization Best Practices** `[NGÀNH: W3C i18n]`, và thực hành
**pseudo-localization** `[NGÀNH: pseudo-localization]` — cắm chuỗi dài giả để lộ
chuỗi chưa dịch và chỗ tràn trước khi có bản dịch thật.

Chân ngành vào đây làm **ứng viên**, không phải fact: thước CE mạnh hơn của kho
là lịch sử lỗi thật của bốn vòng đã ký.

### Trục

- **Trục A — chữ nấp ở đâu:** văn bản JSX | thuộc tính JSX | lời gọi toast | khoá
  object và mảng lựa chọn | hàm ghép câu | tiêu đề tài liệu | chuỗi sinh từ enum
  (không phải hằng nên bộ quét không thấy).
  [thước CE: mỗi giá trị là một chỗ đã sót THẬT — toast và tiêu đề sót ở vòng ③a,
  thuộc tính ở ③b vòng 1, component dùng chung ở ③b vòng 5, enum ở chính Cổng 2
  của đợt một (Ngoài-2). Vòng này đo được: 183 văn bản · 93 thuộc tính · 14 toast
  · **0 tiêu đề**]
- **Trục B — điều kiện hiện ra:** mặc định | rỗng | đang tải | **nhất thời** (đang
  gửi · đã gửi · gửi hỏng) | lỗi hoặc bị chặn | cần một vật gieo.
  [thước CE: ③b đo được 3/6 ô trạng thái rồi khai ba ô còn lại; đợt một đo 2/9 và
  khai bảy. Giá trị *nhất thời* là mới của lát này — ba chuỗi Sending/Sent/Send
  failed nằm ngay trong khối `ngoai_lat` mà đợt một đã khai]
- **Trục C — thứ KHÔNG được dịch:** tên thương hiệu | định danh kỹ thuật | dữ liệu
  người nhập | **nội dung tác nhân sinh ra**.
  [thước CE: ③b AC-6/AC-6b tìm ra lỗi sản phẩm thật. Giá trị thứ tư là mới và đã
  đo: ảnh chụp màn gieo cho thấy tác nhân trả lời bằng tiếng Việt — đó là đầu ra
  của model, không phải chữ của sản phẩm và cũng không phải chữ người nhập, nên
  không phép đo nào của ba vòng trước phân loại đúng nó]
- **Trục D — mối nối giữa hai hồ sơ:** bản khai bàn giao | khối `ngoai_lat` chết |
  năm con số neo của hồ sơ kia | vế *trùng chuỗi* có thể đỏ oan.
  [thước CE: cả bốn đo được trong phiên này — cờ `hoan` có chiều đỏ, 8 chuỗi
  `ngoai_lat` đều từ `agent-composer.tsx`, neo 26/20/237/180/57, và vế trùng-chuỗi
  của AC-8 đợt một]

Trục D độc lập thật: đổi cách bàn giao không ép đổi chỗ chữ nấp, và ngược lại.

Không gian 7 × 6 × 4 × 4 = 672 ô — vượt xa ngưỡng 50, nên quét theo **pairwise**
đúng như preset dạy, không dựng tích Descartes đầy đủ.

### Core

1. **A×B mọi giá trị × mặc định** — 276 chuỗi phải về 0, đo ở mức mã trên dân số
   sinh từ đĩa. Đây là ô đông nhất và là ô mọi vòng trước đều dùng làm xương sống.
2. **A=tiêu đề × không-có-đối-tượng** — chân tiêu đề chạy trên lát này ra *"XANH:
   cả 0 ô"*. Tập quan sát rỗng mà vẫn xanh là đúng lớp lỗi kho này đã trả giá bốn
   vòng; phải khai không-có-đối-tượng thay vì để nó xanh.
3. **A×B trên MÀN THẬT có gieo** — `/chat` và `/chat/[chatId]`, hai lượt tiếng.
4. **B=nhất thời** — ba trạng thái gửi, vì chúng nằm trong hộp chặt cứng và là
   thứ người dùng gặp nhiều nhất khi gõ.
5. **C×(màn thật)** — bốn thứ không được dịch, so theo VỊ TRÍ trong cây DOM.
6. **D toàn trục** — bốn giá trị, vì bỏ sót một là làm đỏ một hồ sơ đã ký.
7. **Cross-cutting bề rộng** — nhãn tiếng Việt dài hơn ở 360px.

Bảy ô trên ~0.1% không gian — dưới trần 20% rất xa, vì pairwise đã gộp phần lớn.

### Later

- Nhiều hội thoại cùng lúc (khối lượng lớn) — cần gieo hàng loạt, tốn token thật.
- Mất mạng giữa chừng khi đang gửi — cần chặn mạng, chưa có thước.
- Chia sẻ hội thoại ra ngoài (`share-chat-dialog`) đo trên màn thật — cần một
  người thứ hai; vòng này chỉ đo ở mức mã.

### Never

- **Dịch nội dung tác nhân sinh ra** — đó là đầu ra của model, không phải chữ của
  sản phẩm. Nó vào trục C như thứ KHÔNG được dịch.
- **Hai lỗ đã có định đoạt "mở hợp đồng mới" ở Cổng 2 đợt một** — gốc gom chữ của
  bộ thước màn, và trạng thái tác nhân tiếng Anh. Người đã quyết, không kéo lại.

### Cross-cutting áp mọi ô Core

Dân số sinh từ đĩa · mỗi phép đo mới có cặp hai chiều đã chạy thật · mọi dòng
miễn trừ có đối tượng thật · không chép thước · **và vòng này thêm một điều: mọi
phép đo trả tập rỗng phải thoát mã 2, không được xanh**.

## Ba mối nối, và cách tháo

### 1 · Bàn giao — một cơ chế, hai chiều

Sáu file đang khai `hoan: true` trong bản khai đợt một. Cờ đó có chiều đỏ: file
hết tiếng Anh là ĐỎ. Nếu gỡ sáu dòng ra thì năm con số neo của đợt một sai, tức
sửa một hợp đồng đã ký.

Nên **đổi lý do loại trừ, không gỡ dòng**: `hoan: true` → `chuyen_giao:
"cua-so-tro-chuyen-noi-tieng-viet"`. Nghĩa đổi từ *"hoãn, còn tiếng Anh là đúng
thiết kế"* sang *"đã bàn giao, hồ sơ kia quét chúng"*. Chiều đỏ mới: **hồ sơ được
gọi tên phải tồn tại VÀ bản khai của nó phải thật sự chứa file đó**.

Bản khai đợt hai làm ngược lại: 15 file kia khai `chuyen_giao:
"agent-builder-noi-tieng-viet"`. Một cơ chế, hai chiều, một đoạn mã trong bộ
thước dùng chung — cùng khuôn chọn-tham-gia với cờ `hoan` mà đợt một vừa thêm,
nên hồ sơ nào chưa khai nó thì không đi qua nhánh này.

Đổi lại: `khong_quet` của đợt một vẫn **sáu dòng**, `file_quet` vẫn **20**, năm
con số neo vẫn đúng. Không hợp đồng đã ký nào phải mở lại.

### 2 · Khối `ngoai_lat` phải rỗng

Đợt một khai 8 chuỗi từ `agent-composer.tsx` là *giới hạn đã khai* trên màn
`/chat`, và mỗi dòng phải còn vẽ ra — dòng chết là ĐỎ. Dịch xong thì cả 8 chết.

Vòng này gỡ khối đó khỏi bản khai đợt một, và **AC riêng canh việc gỡ**: sau vòng
này, khối `ngoai_lat` của đợt một phải HIỆN DIỆN-và-rỗng (không phải vắng mặt —
vắng là đường sạch-giả rẻ nhất), và chân màn của đợt một phải xanh với
`ngoai lat=0`.

### 3 · Vế *trùng chuỗi* có thể đỏ oan

AC-8 đợt một: *file bị loại trừ mà mang chuỗi TRÙNG với một giá trị của kho chuỗi
mới là ĐỎ* — nghĩa gốc là "chữ của đợt này đã rò sang vùng hoãn". Sau đợt hai,
kho chuỗi cửa sổ trò chuyện sẽ có *Huỷ · Lưu · Đóng*, trùng với kho của đợt một
một cách hoàn toàn chính đáng.

Xử: vế đó chỉ áp cho dòng khai `hoan`, KHÔNG áp cho dòng khai `chuyen_giao`. Lý
lẽ: "rò sang vùng hoãn" là lỗi vì vùng hoãn CHƯA được dịch; vùng đã bàn giao thì
đã có hồ sơ khác quét, nên chữ chung là bình thường. Chuyển vế này thành một điều
kiện của cờ `hoan` là sửa đúng chỗ, và không đụng chữ trong hợp đồng đã ký.

## Gieo vật đo

Đã chứng trong phiên thiết kế, không phải giả định:

```
POST /api/trpc/conversations.createBuilder
  {clientRequestId: <uuid>, commandType: "CHAT", message: "..."}   → 200 {id}
POST /api/trpc/conversations.remove {id}                            → 200
```

Chân trạng thái của đợt một xác nhận cây trở lại sạch sau khi dọn.

Hai điều kèm theo, cũng đo được:

- **Gieo tốn token thật.** `commandType: "CHAT"` làm tác nhân trả lời; khoá AI
  Gateway của kho có trần $5 trọn đời. Nên chân gieo phải gieo MỘT lần cho cả
  lượt đo, không gieo lại cho từng chân, và phải dọn kể cả khi đo hỏng.
- **Bộ thước màn dùng chung không đo được màn này.** Nó chờ `networkidle0`; cửa
  sổ trò chuyện giữ một kết nối sống nên không bao giờ lặng — đã đo, hết giờ.
  Chân của lát này dùng `domcontentloaded` + lặng có kỳ hạn. Đây là chỗ dễ chép
  nhất, nên phải viết mới chứ không bê thân hàm cũ.

## Kho chuỗi

Ba kho, chia theo màn chứ không theo file, để một màn đọc một kho:

- `agent-builder-tro-chuyen.ts` — khung hội thoại và dòng thời gian
  (`agent-builder-chat`, `agent-history`).
- `agent-builder-o-soan.ts` — ô soạn và thẻ gợi ý (`agent-composer`,
  `chat-chips`).
- `agent-builder-hoi-thoai-thao-tac.ts` — chia sẻ và xoá (`share-chat-dialog`,
  `delete-chat-action`).

Khuôn như ba vòng trước: `const en` → `export type XMessages = typeof en` →
`const vi satisfies XMessages` → `Record<Locale, XMessages>` → hàm đọc theo
locale. Không `as const`. Client đọc `useLocale()`.

## Đặc tả UX

Vòng này KHÔNG dựng màn mới, KHÔNG đổi bố cục hay component — chỉ đổi chữ trên màn
đã có. Đặc tả UX vì thế bỏ bằng entry `descope` có tên, cùng lý do đợt một đã ghi.

## Ngoài phạm vi

- **Route `/agents/[agentId]`** — thuộc đợt một, đã ký với giới hạn đã khai.
- **Gốc gom chữ của bộ thước màn** và **trạng thái tác nhân tiếng Anh** — hai lỗ
  người đã định đoạt "mở hợp đồng mới" ở Cổng 2 đợt một.
- **Chuỗi sinh từ API** (`error.message` chuyển tiếp) — sống ở `apps/api`, là
  `t3_paths`.
- **Đo màn chia sẻ hội thoại với người thứ hai** — cần một tài khoản nữa.
