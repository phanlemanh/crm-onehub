# Lộ trình Trợ lý OKR — AI cho khu OKR, theo lượt

Viết 2026-09-27. Đây là lộ trình phần AI của khu OKR, tức lượt 9 và lượt 10 của
`docs/plan/lo-trinh-okr.md`, viết lại theo kiến trúc đã chọn sau đợt nghiên cứu
ngày 26/09. Lộ trình không ghi ngày: mỗi lượt ghi nó bàn giao gì và khi nào chạy
được. Lượt nào đủ điều kiện thì chạy, và mỗi lúc chỉ một lượt có mã đang dựng,
theo luật tuần tự của lộ trình OKR.

- Tài liệu cho chủ kho (tiếng sản phẩm, có sơ đồ):
  https://claude.ai/artifact/1V3YaJt67YZVWwy8oBmUHd
- Thiết kế kỹ thuật đầy đủ — khuôn dữ liệu, bảng, trình tự, phạm vi từng lượt:
  `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md`. Phiên nào
  làm một lượt ở đây phải đọc mục 4 và mục 6.3 của tệp đó trước.
- Kết quả đo trước khi dựng (N0): `docs/reports/2026-09-26-tro-ly-okr/N0-ket-qua.md`.
- Nghiên cứu nền (Tability, đối thủ, mẫu kỹ thuật, bản đồ mã): các tệp `01`–`11`
  và `13` cùng thư mục.

## 1. Đã chốt

**Hai điều kiện mở lượt 9** — Manh Phan, 2026-09-26:

1. Nội dung OKR chỉ được gửi tới nhà cung cấp model khi có ZDR (zero data
   retention). Không có ZDR thì không gửi. Luật này bao cả tên đối tác người
   dùng tự gõ trong ghi chú, và áp cho cả eval (judge, golden cases).
2. Trần chi tiêu AI của khu OKR là **$9 mỗi tháng**, nằm trong trần $20 mỗi tháng
   của cả workspace.

Dòng 9 của bảng theo dõi trong `lo-trinh-okr.md` ghi một câu trả lời cùng ngày
(«cho gửi tới nhà cung cấp đang dùng; trần AI của workspace $20; cần khoá riêng
có trần»). Hai câu đọc cùng nhau: $20 là trần của cả workspace, $9 là trần của
khu OKR, và bắt buộc có ZDR.

**Kiến trúc: lát dọc OKR trước, rút khung chung khi có miền thứ hai.** Ba phương
án được dựng độc lập rồi chấm theo ba lăng kính: khớp kho, giá trị, rủi ro. Phương
án này thắng với 23 điểm, so với 19,5 của «nền tảng năng lực khai báo» và 15,5
của «mở rộng khung Tác nhân». Lý do đầy đủ ở mục 4.1 của thiết kế.

## 2. Kiến trúc trong năm dòng

1. Mọi việc AI vào bằng một hàng `AgentTask`, sau khi đã kiểm quyền, công tắc và
   trần tiền. API không gọi model.
2. Trợ lý OKR là một subagent eve riêng, `tro_ly_okr`, không thừa kế gì từ agent
   gốc. Nó làm việc trên skill tĩnh và một context pack do mã dựng, và không có
   tool nào chạm dữ liệu đối tác. Agent gốc chỉ chuyển tiếp việc đúng một lần, và
   không bao giờ thấy chữ OKR.
3. Máy chỉ viết vào sổ đề xuất và bảng tóm tắt, sau một bộ kiểm bằng mã. OKR chỉ
   đổi khi người bấm nhận; việc ghi đi qua `OkrService`, có quyền và có vết.
4. Nền chung cho mọi việc AI: sổ chi phí cho mọi phiên, trần tháng, luật ZDR, và
   eval bằng golden cases tiếng Việt.
5. Thêm một việc AI trong khu OKR tốn một lượt T2. Miền thứ hai là lúc rút khung
   chung, và chỉ rút một lần. Knowledge dạng tài liệu và MCP ra ngoài chỉ mở khi
   có số đo đòi.

**Bảy luật giữ bằng cấu trúc, không bằng lời dặn:**

1. Máy không ghi vào OKR.
2. Trợ lý không có tool đối tác nào, nên vai «chỉ OKR» an toàn.
3. Chỉ gửi tới nhà cung cấp có ZDR, và chữ OKR không quay về agent gốc.
4. Mọi con số máy viết được mã kiểm lại.
5. Không nói về người: context pack không mang họ tên, và có danh sách từ cấm cho
   NG-01, NG-02, NG-07.
6. Việc chạy nền không mượn quyền của ai; tóm tắt được lọc theo người xem lúc
   hiện.
7. Không thêm tin nhắn: tối đa hai dòng báo do luật viết trong nhắc buổi sáng.

**Bốn chốt của subagent**, kèm sửa từ kết quả N0:

1. Kết quả trả về gốc chỉ là mã. N0 thấy agent gốc không thất bại khi subagent
   hỏng, nên việc phải đóng theo cờ `isError` của kết quả, không chờ `turn.failed`.
2. Model và ZDR đặt cố định ở cấp agent của subagent. Mức suy nghĩ phải đặt bằng
   `modelOptions.providerOptions.{google,vertex}.thinkingConfig.thinkingLevel:
   "low"`. Trường `reasoning` của eve không có tác dụng qua Gateway tới Vertex
   (N0 phép 3).
3. Context pack không mang họ tên.
4. Công tắc theo việc × đơn vị trong `OkrProgramConfig`.

## 3. Số lượt

| Nhóm | Số | Gồm |
|---|---|---|
| Việc không viết mã sản phẩm | 2 | N0 đo trước khi dựng (**xong**); N1 golden cases |
| Lượt phải có trước | 1 | Vá lối rò Slack |
| **Lượt của Trợ lý OKR, tới mùa đặt OKR quý 1** | **4** | 9a nền · 9b góp ý · 9c tóm tắt tuần · lượt 10 |
| Lượt sau mùa, có điều kiện | 2–3 | Nháp «điều học được» · tóm tắt cấp bộ phận · chat OKR (lượt riêng) |
| Mở rộng sau Cổng Giá trị | 3 | Miền thứ hai · knowledge tài liệu · MCP |
| Lượt OKR gốc chạy xen giữa (không có AI) | 4 | 6 · 7 · 8a · 8b |
| Việc của chủ kho | 3 | Chạy truy vấn production của N0; triển khai Zalo; khai ngưỡng ở Cổng Đáng 9a và 9b |

## 4. Thứ tự chạy

1. **Lượt 6** đã lên `onehub` (#162, 2026-09-27). **N0 đã xong** (2026-09-27).
2. **Vá lối rò Slack**: chạy khi lượt 6 đã gộp. Phải xong trước ngày mở cho cả
   công ty.
3. **9a**: chạy khi vá Slack đã gộp. Điều kiện ZDR của N0 đã đạt. Sau 9a, chủ kho
   triển khai Zalo trên production, để sổ chi phí chạy trước khi hỏi CRM qua Zalo
   mở cho cả công ty.
4. **Lượt 7**: chạy khi 9a đã gộp. Nếu 9a kẹt thì lượt 7 đi trước. Lượt 7 phải lên
   trước khi đóng quý 4.
5. **Đóng băng quanh ngày mở cho cả công ty**: không mở lượt mới, chỉ vá lỗi, cho
   tới khi các phòng ban công bố xong OKR quý 4.
6. **N1** chạy khi OKR quý 4 đã công bố. **9b** chạy khi lượt 7 đã lên và N1 có ít
   nhất 12 ca.
7. **9c** chạy khi 9b đã gộp và có ít nhất 3 tuần Cập nhật tuần thật.
8. **Lượt 8a** (cần 4 tuần dùng quý 4) và **lượt 10** (cần số đo của lượt 4): lượt
   nào đủ điều kiện trước thì chạy trước.
9. **Đóng băng trong mùa đặt OKR quý 1 và lúc đóng quý 4.** Góp ý được bật cho cấp
   OneHub trước mùa OKR năm, và cho mọi phòng ban trước mùa quý 1.
10. **Sau mùa**: lượt 8b, chat OKR (lượt riêng), nháp «điều học được», tóm tắt cấp
    bộ phận.
11. **Sau Cổng Giá trị**: ba bước mở rộng ở mục 7 của thiết kế.

## 5. Bàn giao từng lượt

Mỗi lượt chạy bằng `/feature-loop:feature-loop <ý định>`. Dòng «Ý định» dưới đây
dán nguyên vào lệnh đó. Phạm vi chi tiết ở mục 6.3 của thiết kế.

### N0 · Đo trước khi dựng — xong 2026-09-27

Tiền đã tiêu $0,59 trên trần $1, và chỉ dùng dữ liệu giả. Kết quả chi tiết ở
`N0-ket-qua.md`.

| Phép đo | Kết quả | Hệ quả |
|---|---|---|
| ZDR với `google/gemini-3.7-flash` | Đạt; chỉ Vertex phục vụ | Điều kiện ZDR của 9a đã thoả |
| ZDR với model dự phòng `zai/glm-5.2-fast` | Đạt (Alibaba, Baseten) | Sửa giả định cũ. Chốt 1 vẫn đứng, vì lời gọi của agent gốc không mang cờ ZDR |
| Cache trên đường ZDR | 56% khi prefix ≥ khoảng 4k token | Giả định 60% gần đúng; phần tĩnh dưới 4k thì không có cache |
| Mức suy nghĩ | `reasoning` không có tác dụng; `thinkingLevel: "low"` giảm tiền 54% | Sửa chốt 2 (mục 2) |
| Prefix của agent gốc | 6,8k–9,9k token mỗi bước | Bước chuyển tiếp tốn $0,007 (gốc Gemini) tới $0,018 (gốc GLM) mỗi việc |
| Phép thử «stub cùng tên» | Không đạt 2/8: một lời gọi chạy cả stub lẫn subagent; resolver lỗi thì phiên **mở** | Chat của lượt 10 đi bằng eve app riêng, không đi đường stub |
| Subagent đọc thuộc tính phiên cha | Đạt | Tool nộp tự đọc việc theo `okrTaskId` |
| Phiên con vượt trần | Thất bại gọn; nhưng một lời gọi đơn lẻ vẫn chạy trọn | 9a phải tìm cách chặn cỡ một lời gọi (chưa đo) |
| Chữ OKR quay về gốc khi con hỏng | 0 lần | Chốt 1 đứng |
| Giá mỗi câu hỏi CRM qua Zalo | $0,016 (gốc Gemini) · $0,039 (gốc GLM) | Trần 1.500 câu mỗi tháng tốn $23,5–57,9, một mình đã vượt $20. N0 đề xuất hạ xuống 300 câu |

**Chi phí thiết kế đã lệch.** Theo số đo, kịch bản 40 phòng ban trong tháng đặt
OKR tốn $10,48 khi agent gốc dùng Gemini và $16,98 khi dùng GLM, không phải $8,43.
Trần $9 chỉ giữ được khi agent gốc dùng Gemini **và** ít nhất khoảng 18% lượt đề
xuất được dùng lại kết quả cũ (hoặc bỏ hẳn bước chuyển tiếp ở gốc).

**Còn chờ chủ kho:** chạy `N0-truy-van-production.sql` (hướng dẫn ba dòng ở đầu
tệp). Truy vấn trả lời production đang đặt model nào cho agent gốc, $20 đang đi
đâu, và có bao nhiêu người, bao nhiêu đơn vị dùng OKR.

### Vá lối rò Slack · T3

- **Ý định:** Tác nhân chạy nền không đăng được dữ liệu đối tác vào kênh Slack có
  người mang vai «chỉ OKR», và lượt chạy nền của Tác nhân được coi là tự động nên
  mọi thao tác ghi nhạy cảm bị từ chối.
- **Bàn giao:**
  - Phép đo đỏ trước khi vá, xanh sau khi vá.
  - Chỗ vá chạm `apps/agent/agent/lib/run-runtime.ts` (`approvedSlackDestination`)
    và `apps/agent/agent/lib/approval.ts` (`isAutomated`). Đây là hai tệp của hãng
    mà bản rẽ chạm lần đầu, nên ghi thành chỗ rẽ có tên.
  - Không báo cho hãng qua PR công khai. Chỉ báo qua kênh bảo mật riêng, khi chủ
    kho cho phép.
- **Chạy khi:** lượt 6 đã gộp. Phải xong trước ngày mở cho cả công ty.

### 9a · Nền Trợ lý OKR · T3, có Cổng 1.5

- **Ý định:** Quản trị thấy tháng này AI tiêu bao nhiêu cho từng việc, và bật tắt
  được Trợ lý OKR theo đơn vị. Việc này dựng nền Trợ lý OKR mà chưa hiện gì với
  người dùng:
  - subagent `tro_ly_okr` với bốn chốt ở mục 2;
  - sổ chi phí AI cho mọi phiên, và trần tháng $9 của khu OKR kiểm trước khi xếp
    việc;
  - các bảng đề xuất, tóm tắt, phản hồi tóm tắt, và các cột AI của Chương trình
    OKR;
  - màn Cài đặt › Chương trình OKR.
- **Người dùng thấy:** chưa thấy gì; mọi công tắc đều tắt.
- **Chủ kho thấy:**
  - công tắc theo việc × đơn vị;
  - trần tháng;
  - chi tiêu AI tháng này theo từng việc: nghiên cứu danh bạ, hỏi CRM qua Zalo,
    Tác nhân, Trợ lý OKR;
  - trạng thái sẵn sàng của trợ lý;
  - báo ở 80% và 100% trần.
- **Trong kho:**
  - subagent và hook `okr-uy-quyen`;
  - migration chỉ thêm, làm hết bảng và cột ở lượt này để 9b và 9c giữ hạng T2;
  - hàm tiến độ dời từ `apps/api` xuống gói dùng chung;
  - eval cách ly bằng mã;
  - bốn mục từ điển mới: Trợ lý OKR, Đề xuất, Tóm tắt tuần, Sổ chi phí AI;
  - luật dữ liệu mới trong `docs/agent.md` và `skills/data-boundaries.md`.
- **Bằng chứng để ký:**
  - test cách ly xanh;
  - eval đầu-cuối đạt 3 lần liền;
  - sổ chi phí khớp báo cáo của Gateway trong khoảng 10%;
  - đặt trần bằng 0 thì không phiên nào mở;
  - một việc bị ép hỏng thì đóng trong một phút, có lý do.
- **Việc còn mở từ N0:**
  - chặn cỡ một lời gọi của subagent;
  - kiểm rằng ném lỗi ở hook `actions.requested` dừng được tool trước khi chạy.
- **Chạy khi:** vá Slack đã gộp. Điều kiện ZDR đã đạt ở N0.

### N1 · Golden cases (không viết mã sản phẩm)

- **Bàn giao:** khoảng 30 ca lấy từ OKR quý 4 thật, đã thay tên người và tên đối
  tác, cộng các ca trộn Anh–Việt. Lưu ngoài git, trong thư mục bị gitignore trên
  máy chủ kho.
- **Chạy khi:** các phòng ban đã công bố OKR quý 4.

### 9b · Góp ý khi bấm · T2 — AI-01, AI-02, AI-03 (phần AI), AI-05, DO-06

- **Ý định:** Tôi bấm «Nhờ Trợ lý OKR góp ý» trên một Mục tiêu và nhận vài đề
  xuất, câu cũ cạnh câu mới; tôi nhận, sửa hay bác từng dòng.
- **Người dùng thấy:**
  - nút góp ý trên hộp thoại Mục tiêu (cho người sửa được Mục tiêu đó) và trên
    hộp thoại KR (cho người phụ trách KR đó);
  - đề xuất viết lại tên Mục tiêu, câu «vì sao lúc này» và tên KR;
  - câu hỏi chất lượng, chạy sau luật kiểm của lượt 7;
  - đề xuất chỗ Căn chỉnh;
  - dòng xu hướng cạnh ô đích, tính bằng mã.

  Nhận một đề xuất thì vết ghi «theo đề xuất của Trợ lý OKR». Đề xuất đã bác thì
  không quay lại.
- **Chủ kho thấy:** tỷ lệ nhận, sửa, bác và hoàn tác; chi phí cho mỗi đề xuất được
  nhận.
- **Bằng chứng để ký:**
  - độ trễ p50 ≤ 8 giây, p90 ≤ 15 giây;
  - không dòng nào có số mới lọt qua bộ kiểm;
  - golden cases đạt;
  - đủ mọi trạng thái rỗng, lỗi và tắt.
- **Chạy khi:** 9a và lượt 7 đã lên; N1 có ít nhất 12 ca.
- **Bật khi:** cấp OneHub được bật trước mùa OKR năm; mọi phòng ban được bật trước
  mùa quý 1.

### 9c · Tóm tắt tuần · T2 — AI-04

- **Ý định:** Sáng hôm sau ngày cập nhật, tôi mở bảng họp tuần và thấy tóm tắt tuần
  của phòng; câu nào cũng bấm ra được lần cập nhật gốc.
- **Người dùng thấy:**
  - khối tóm tắt ở đầu bảng họp tuần, kèm trích dẫn và nút «hữu ích / không»;
  - một dòng trong nhắc buổi sáng, mang số đếm do luật tính; người nhận tắt được
    dòng này.

  Quản trị chương trình thấy các bản tóm tắt bị giữ lại ở màn sức khoẻ chương
  trình.
- **Trong kho:**
  - lịch tóm tắt tự đặt việc cho tuần sau bằng `dueAt`;
  - luật «đáng bàn» (`lyDoCua` trong `apps/api/src/okr/hop-tuan.ts`) dời ra gói
    dùng chung;
  - eval tóm tắt và eval số.
- **Bằng chứng để ký:**
  - câu bị bỏ ≤ 10%;
  - không số lệch nào lọt qua;
  - tỷ lệ tắt nhắc không tăng.
- **Chạy khi:** 9b đã gộp; có ít nhất 3 tuần Cập nhật tuần thật.

### Lượt 10 · OKR trong chat · T3 — AI-06, AI-07, NH-06

- **Ý định:** Tôi cập nhật ngay trong Slack hoặc Zalo, và biết sớm KR nào đang
  trượt.
- **Người dùng thấy:**
  - Trưởng đơn vị nhận cảnh báo khi tiến độ và Mức tự tin lệch vạch kỳ vọng. Luật
    phát hiện; Trợ lý OKR viết một dòng diễn giải. Cảnh báo chỉ gửi khi trạng thái
    đổi, và mỗi KR nghỉ 14 ngày giữa hai lần báo.
  - Trong Slack có nút chọn Mức tự tin và sửa số; trên Zalo thì trả lời bằng chữ.
  - Hỏi đáp OKR theo quyền người hỏi, trên web và trên Zalo (dùng lại kênh hỏi CRM
    qua Zalo). Người mang vai «chỉ OKR» chỉ hỏi được về OKR.
- **Trong kho:**
  - cửa nhận tin vào từ Slack, với scope mới nên quản trị Slack phải đồng ý lại;
  - skill phương pháp OKR dạng tĩnh;
  - trần số câu mỗi người mỗi ngày.

  Vì phép thử stub ở N0 không đạt, chat chạy bằng một eve app riêng
  (`defineRemoteAgent`). Nếu phần đó không vừa lượt, chat tách thành một lượt riêng
  sau mùa; cảnh báo và nút trong Slack vẫn ở lượt 10.
- **Chạy khi:** số đo của lượt 4 đạt điều kiện của `lo-trinh-okr.md`. Đề nghị tách
  chat và cảnh báo khỏi điều kiện này, ở Cổng Đáng của lượt 10.

### Sau mùa đặt OKR quý 1, có điều kiện

| Lượt | Hạng | Bàn giao | Chạy khi |
|---|---|---|---|
| Nháp «điều học được» | T2 | Trợ lý soạn nháp cho ô «điều học được» khi đóng kỳ; người nhận hay sửa. Dùng lại sổ đề xuất | Cổng Đáng gắn được với một mã trong bản phạm vi (hôm nay chưa có mã) |
| Tóm tắt cấp bộ phận | T2 | Gộp từ các bản tóm tắt đã kiểm của phòng ban, không đọc lại Cập nhật tuần gốc | Tóm tắt phòng ban đã có số đo đạt ngưỡng |
| Chat OKR, nếu đã tách khỏi lượt 10 | T3 | Như phần chat của lượt 10 | eve app riêng đã dựng |

## 6. Chỗ lệch so với `lo-trinh-okr.md`

| # | Chỗ | Lộ trình OKR ghi | Lộ trình này |
|---|---|---|---|
| 1 | Hạng lượt 9 | Một lượt T2 | Ba lượt: 9a (T3, thêm bảng), 9b và 9c (T2) |
| 2 | Thứ tự lượt 9 | Sau lượt 8 | 9a ngay sau vá Slack; 9b sau lượt 7 |
| 3 | Chân đứng của 9b | Lượt 4 và 7 | Lượt 3, cùng luật của lượt 7 |
| 4 | AI tới người dùng | Thuộc R3 | Cấp OneHub được bật trước mùa OKR năm, sớm hơn R3 |
| 5 | Lượt 8 | Gantt đặt sớm hơn điều kiện mở của chính nó (sau bốn tuần dùng) | Tách 8a và 8b; 8a chạy khi đủ bốn tuần |
| 6 | Lượt 10 | Chat dựng trong lượt | Chat bằng eve app riêng; trên Zalo dùng lại kênh hỏi CRM qua Zalo |
| 7 | Điều kiện mở lượt 10 | Một điều kiện chung về độ trễ Cập nhật tuần | Tách chat và cảnh báo khỏi điều kiện đó |
| 8 | Nháp «điều học được» | Không có trong 78 mã | Sau mùa, có điều kiện |
| 9 | Vá lối rò Slack | Không có | Lượt T3 riêng, xong trước ngày mở cho cả công ty |
| 10 | Đóng băng | Không có | Quanh ngày mở cho cả công ty, và trong mùa đặt OKR quý 1; chỉ vá lỗi |
| 11 | Điều kiện mở lượt 9 | Dòng 9: gửi tới nhà cung cấp đang dùng, trần workspace $20 | Thêm ZDR bắt buộc (kể cả eval), và trần $9 cho khu OKR |

## 7. Nếu một điều kiện không đạt

| Điều kiện không đạt | Hệ quả | Giữ gì |
|---|---|---|
| 9a chưa gộp khi tới lúc triển khai Zalo | Hỏi CRM qua Zalo mở mà chưa có sổ chi phí | Hạ trần hỏi CRM qua Zalo xuống mức N0 đề xuất |
| 9a hoặc lượt 7 chưa xong trước đóng băng | Làm sau đóng băng | Vá Slack vẫn phải xong trước ngày mở; nếu cần thì đi trước mọi lượt khác |
| 9b chưa xong trước mùa OKR năm | Cấp OneHub đặt OKR năm mà không có trợ lý | Giữ đích cho mùa quý 1 |
| Chưa đủ 3 tuần Cập nhật tuần thật | 9c chờ; lượt 8a hoặc 10 đi trước | 9c vẫn chạy được khi đủ dữ liệu |
| Production dùng GLM cho agent gốc | Trần $9 không giữ được | Chuyển agent gốc sang Gemini, hoặc bỏ bước chuyển tiếp (nấc 3 ở mục 4.10 của thiết kế), hoặc chủ kho nâng trần |

## 8. Kiểm «sẵn sàng cho mùa đặt OKR quý 1»

1. Góp ý đã dùng thật ở cấp OneHub, có số đo: độ trễ, tỷ lệ nhận, câu bị bỏ, chi
   phí mỗi đề xuất được nhận.
2. Dự báo chi phí của mùa đặt cạnh trần $9. Nếu vượt, chủ kho quyết nâng trần hay
   giữ **trước** khi mùa mở.
3. Tắt một loại đề xuất không tắt tóm tắt.
4. Eval cách ly xanh ba lần liền; phép đo đường vào của vai «chỉ OKR» xanh.
5. ZDR đã xác nhận trên production, kể cả cho judge của eval.
6. Có trang «Trợ lý OKR làm gì, không làm gì» cho Trưởng đơn vị.

## 9. Theo dõi — cập nhật sau mỗi hạng mục

Một dòng một hạng mục. Cột Trạng thái chỉ nhận một trong các giá trị: chưa mở ·
Cổng Đáng · Cổng Phạm vi · đang dựng · Cổng Bằng chứng · đã lên `onehub` · Cổng
Giá trị · xong. Không sửa dòng cũ, chỉ nối thêm ở cột Ghi chú.

| Hạng mục | Trạng thái | PR | Ghi chú |
| --- | --- | --- | --- |
| N0 đo trước khi dựng | xong | — | 2026-09-27, $0,59; nhánh nháp `spike/n0-do-truoc` không đẩy; kết quả ở `docs/reports/2026-09-26-tro-ly-okr/N0-ket-qua.md` · chờ chủ kho chạy truy vấn production |
| Vá lối rò Slack | chưa mở | — | chip đã mở 2026-09-26 · đủ điều kiện chạy từ 2026-09-27: lượt 6 đã gộp (#162) |
| 9a `tro-ly-okr-nen` | chưa mở | — | ZDR đạt ở N0; chờ vá Slack |
| N1 golden cases | chưa mở | — | chờ OKR quý 4 công bố |
| 9b `tro-ly-okr-de-xuat` | chưa mở | — | — |
| 9c `tro-ly-okr-tom-tat` | chưa mở | — | — |
| 10 `okr-trong-chat` | chưa mở | — | chat bằng eve app riêng (N0 phép 5) |
