# 12 — Kiến trúc AI mở rộng cho OneHub và lộ trình tích hợp OKR (bản 2)

Viết 2026-09-26. Đây là tài liệu cuối của đợt nghiên cứu, viết cho chủ sản phẩm.

**Bản 2, cùng ngày.** Đã áp hai bản phản biện: `13-phan-bien-ma-that.md` (27 phát hiện) và
`13-phan-bien-san-pham.md` (28 phát hiện). Mọi phát hiện về mã đã được tự kiểm lại trong bản
chụp trước khi áp. Mọi phép tính chi phí đã tính lại bằng số học tường minh (4.10). Mỗi phát
hiện có một dòng trong mục cuối, «Nhật ký áp phản biện».

Tài liệu tổng hợp các báo cáo 01–11, không chép lại chúng. Khi hai nguồn mâu thuẫn thì
báo cáo soát độ đủ (09) thắng; sau đó tới phần tôi tự kiểm lại trong mã và trong tài liệu
eve. Mỗi mục mở bằng điều người dùng hay chủ kho được, rồi mới tới chi tiết kỹ thuật.

**Nhãn**

| Nhãn | Nghĩa |
|---|---|
| [mã] | Tôi tự đọc trong bản chụp nhánh `onehub` (`scratchpad/onehub`). Đường dẫn tính từ gốc kho |
| [eve] | Tôi tự đọc trong tài liệu eve 0.29.4 cài kèm, ở `apps/agent/node_modules/eve/docs/`. Đường dẫn viết tắt tính từ thư mục `docs/` |
| [git] | Lệnh git chỉ-đọc tôi tự chạy trong kho. Đầu `origin/onehub` là `e394b581` (26/09 12:17, gộp #152 `khoa-api-ghi-thua`), đầu `origin/release` là `6d4793dd`. Bản chụp `scratchpad/onehub` lấy trước #152; phần mã tôi dẫn không đổi qua #152 |
| [cây] | Tôi tự đọc, chỉ đọc, trong cây làm việc riêng `.claude/worktrees/*`: mã chưa gộp vào `onehub` |
| [0x] | Lấy từ báo cáo số 0x của đợt này, tôi không tự kiểm lại |
| (suy luận) | Kết luận của tôi: chưa có nguồn nào nói thẳng, chưa chạy thử |

**Đã đọc trước khi viết.** Theo bảng chỉ mục của `AGENTS.md`, tôi đã đọc:

- `docs/agent.md`: các mục Model, What may be read, Team-agent builder and runner;
- `docs/api.md`: mục Intelligence never lives in the API;
- `docs/chat-ui.md`: sổ AI Elements;
- `docs/plan/lo-trinh-okr.md`: trọn;
- `CONTEXT.md`: các mục OKR, Gợi ý, Trợ lý AI, Tác nhân, Nhắc buổi sáng, Bot Zalo, Phạm vi dữ liệu, vai «chỉ OKR»;
- skill `.agents/skills/eve`. Skill này chỉ trỏ về tài liệu eve cài kèm, và tôi đã đọc bản đó.

Về báo cáo: đọc trọn 09, trọn ba phương án 10-A/B/C và ba bài giám khảo 11; đọc các mục
tổng kết của 01–08.

**Về chữ.** Bốn chữ dưới đây chưa có mục trong `CONTEXT.md`. Tài liệu dùng chúng như chữ
đề xuất; mục từ điển được duyệt ở **Cổng Đáng của 9a**, trước khi viết dòng mã nào, không để
tới «trước màn đầu tiên».

- **Trợ lý OKR**: trợ lý AI chỉ đọc OKR. Mục từ điển phải có dòng «Khác **Trợ lý AI**: Trợ lý
  AI thuộc phạm vi đối tác, vai «chỉ OKR» không gọi được» và `_Avoid_: trợ lý` (một mình).
  `CONTEXT.md` mục **Trợ lý AI** đã cấm đúng việc để «trợ lý» đứng một mình [mã]. Vì vậy mọi
  chữ trên màn mang đủ tên: nút là **«Nhờ Trợ lý OKR góp ý»**, không phải «Nhờ trợ lý góp ý».
- **Đề xuất**: một dòng do Trợ lý OKR soạn, chờ người nhận, sửa hoặc bác. Tài liệu không
  dùng «Gợi ý», vì chữ đó đã chốt cho câu hướng xử lý đi kèm nhắc Kế hoạch im
  (`CONTEXT.md` [mã]).
- **Tóm tắt tuần**: bản tóm tắt các lần Cập nhật tuần của một Phòng ban trong một tuần.
- **Sổ chi phí AI**: chữ quản trị thấy ở Cài đặt, cho bảng ghi tiền AI của từng việc.

**Chữ kỹ thuật.** Theo `CLAUDE.md` §Ngôn ngữ sản phẩm, tài liệu không đúc từ ghép tiếng Việt
cho thuật ngữ kỹ thuật:

- `apps/agent` gọi là **tác tử** hoặc giữ nguyên `apps/agent`, như các plan của kho
  (`docs/agent.md`, `docs/plan/lo-trinh-zalo.md` [mã]). Chữ **Tác nhân** chỉ dùng đúng nghĩa từ
  điển: việc tự động do người dùng dựng ra (khung team agent).
- Giữ nguyên: `instructions`, context pack, golden cases, reasoning tokens, `reasoning`,
  prefix, cache, `purpose`, làn `research` của `AgentTask`, bước chuyển tiếp ở agent gốc.

---

## 0. Tóm tắt một trang

**Kết luận.** Chủ kho hỏi một **kiến trúc để mở rộng** (agent, skill, knowledge, tích hợp),
không phải một usecase. Câu trả lời: **năm khuôn cố định, dựng xong ở lượt 9a**, và OKR là
miền đầu tiên đi qua chúng. Khung chung chỉ được rút ra, đúng một lần, khi miền thứ hai tới:
rút từ hai ca thật thì biết đường cắt, rút từ một ca là đoán.

Năm khuôn:

1. Mọi việc AI vào qua một hàng `AgentTask`, sau khi mã đã kiểm quyền, công tắc và trần tiền.
2. Mỗi miền là một subagent riêng, không thừa kế tool nào của agent gốc.
3. Mọi con số và trích dẫn trong đầu ra được mã kiểm lại, lúc ghi và lúc hiện.
4. Mọi đầu ra vào một sổ đề xuất có trạng thái nhận · sửa · bác, chờ người quyết.
5. Một sổ chi phí AI và một bộ trần dùng chung cho mọi việc AI của kho.

**Bốn trục mở rộng đi đâu**

| Trục | Dựng ở 9a (và 9b, 9c) | Miền sau lặp lại thế nào | Khi nào rút khung chung |
|---|---|---|---|
| **Agent** | Subagent `tro_ly_okr`: không thừa kế, tắt mọi tool dựng sẵn, sandbox `deny-all`; model, ZDR và `reasoning` cố định; về gốc chỉ trả mã. Agent gốc chỉ chuyển tiếp một lần theo `purpose` `okr`, có hook uỷ quyền | Chép khung thành một subagent mới (ví dụ `tro_ly_dieu_phoi`), cộng một `purpose` và một loại việc. Không chạm các hook, hàng việc, sổ chi phí (4.13) | Miền thứ hai (Điều phối 30 ngày, điều kiện ở 7.1): các nhánh `if` thành một bản đồ `purpose → subagent` dùng chung |
| **Skill** | Chưa có skill mới. Luật và phương pháp OKR nằm trong `instructions` tĩnh của subagent, đẩy vào chứ không kéo bằng tool | Lượt 10: một skill tĩnh «phương pháp OKR» cho chat, không đọc dữ liệu. Miền sau có chat thì thêm skill tĩnh của miền đó | Skill động (cần sandbox) chỉ khi có số đo đòi. Không dựng registry skill trước miền thứ hai |
| **Knowledge** | Context pack có cấu trúc do mã dựng: mọi con số do mã tính, không mang họ tên, lọc theo người xem lúc hiện | Mỗi miền một hàm dựng context pack từ dữ liệu của chính nó (ví dụ `lib/dieu-phoi/doc.ts`) | Bộ kiểm số và trích dẫn rút thành hàm chung ở miền thứ hai. Tìm toàn văn, rồi pgvector, chỉ khi đủ điều kiện ở 7.2 |
| **Tích hợp** | Không kênh mới. Một dòng báo trong Nhắc buổi sáng (Zalo hoặc Slack), số đếm do luật tính. Sổ chi phí AI và trần chung cho mọi việc AI | Miền sau thêm một dòng vào nhắc của miền đó. Lượt 10: Slack và Zalo nhận tin vào | Cấu hình công tắc và trần theo tính năng rút chung ở miền thứ hai. MCP ra ngoài khi đủ điều kiện ở 7.3 |

Nền của hướng này là phương án A, được cả ba giám khảo độc lập chọn (A 23 điểm, B 19,5, C
15,5), cộng bốn chốt an toàn và vài phần ghép từ B và C.

**Tiền.** $20 mỗi tháng là ngân sách **của cả team** trên Gateway. Hôm nay nó đã chia cho ít
nhất bốn bên: làn `research` (khoảng $0,19 mỗi phiên [08]), hội thoại dựng Tác nhân, lượt chạy
Tác nhân, và mọi lời gọi từ máy dev, kể cả eval. Vì vậy sổ chi phí AI làm chung ngay từ 9a.
Trần $8 cho khu OKR để lại $12 cho tất cả phần còn lại.

Ba lẽ chọn hướng này:

1. **Đến tay người dùng sớm nhất.**
   - Đề xuất khi bấm lên `onehub` trước 04/12, và kịp mùa đặt OKR quý 1 (từ 21/12).
   - Cửa sổ ban lãnh đạo đặt OKR năm 2027 (07/12 → 18/12) chỉ mở được cho người sửa được
     Mục tiêu cấp OneHub, tức người mang vai quản trị (luật quyền của lượt 3 [mã]). Máy đếm
     trước 23/11 có bao nhiêu thành viên ban lãnh đạo mang vai đó; nếu gần 0, lẽ này chỉ còn
     mốc 21/12.
   - Đề xuất chỉ cần dữ liệu của lượt 3. Nhưng các lượt đi **tuần tự**, nên lượt 4–7 trễ bao
     nhiêu thì 9a trễ bấy nhiêu. Đệm hiện có là khe 09/11 → 20/11 (6.1): lượt 4–7 trễ dưới hai
     tuần thì 9b vẫn kịp 07/12; trễ hơn thì 9b trượt, và đích còn giữ được là 21/12.
2. **Hỏng thì việc thất bại, dữ liệu không đi ra.** Vai «chỉ OKR» và ZDR được giữ bằng cấu
   trúc, không bằng `instructions`:
   - Trợ lý OKR không có tool nào đọc được dữ liệu đối tác;
   - ZDR đặt cố định trong chính Trợ lý OKR;
   - agent gốc chỉ nhận hằng và mã: cột `reason`, câu `brief` và kết quả của subagent đều không
     mang chữ OKR;
   - việc hỏng được đóng kèm lý do và không bị thử lại (4.3).
3. **Bản rẽ phình ít, và chỗ phình được đếm.**
   - Lượt 9 không chạm lần đầu tệp mã nào của hãng [git]. Ngoại lệ duy nhất là một tệp
     markdown, skill `data-boundaries.md`: nó phải sửa để luật dữ liệu nói đúng sự thật.
   - Tám tệp mã của hãng mà bản rẽ đã sửa dày thêm khoảng 110 dòng, cộng khoảng 10 dòng
     `docs/agent.md` (bảng ở 8.1, R12; suy luận).
   - Riêng lượt vá lối rò Slack, không thuộc lượt 9, chạm lần đầu hai tệp của hãng. Nó được ghi
     thành chỗ rẽ có tên.

**Kiến trúc trong 5 dòng**

1. Mọi việc AI vào bằng một hàng việc (`AgentTask`), sau khi đã kiểm công tắc và trần tiền.
   Việc do người bấm thì API ghi, sau khi kiểm thêm quyền sửa; việc định kỳ tự đặt việc tuần
   sau bằng `dueAt`. API không gọi model.
2. Trợ lý OKR là một subagent eve riêng, không thừa kế gì từ agent gốc:
   - chỉ đọc context pack OKR do mã dựng sẵn, và chỉ có hai tool để nộp kết quả;
   - agent gốc chỉ chuyển tiếp đúng một lần và không bao giờ thấy chữ OKR, kể cả qua cột
     `reason` hay qua kết quả lỗi của subagent.
3. Mọi đầu ra đi qua bộ kiểm bằng mã rồi mới vào hai bảng riêng trong khối OKR (đề xuất và
   tóm tắt). Khi người bấm nhận, chính `OkrService` hiện có ghi, kèm vết.
4. Model, ZDR và `reasoning` đặt cố định trong subagent. Một sổ chi phí AI chung ghi từng
   bước của mọi phiên, và trần được kiểm trước khi xếp việc.
5. Kênh nhắc chỉ mang con trỏ và số đếm do luật tính. Chữ do AI viết chỉ hiện trong app, và
   được thủ tục `okr.*` lọc theo người xem ngay lúc hiện.

**Lộ trình trong 5 dòng**

1. **Bây giờ → 23/10: chưa viết mã của Trợ lý OKR.**
   - Máy đo trước bốn điều: nội dung OKR gửi đi có được giữ kín ở phía nhà cung cấp không;
     mỗi lần bấm tốn bao nhiêu; phần tốn nhất nằm ở đâu; và $20 hiện đang đi đâu.
   - Vá lối rò Slack của Tác nhân đối tác thành một lượt T2 riêng, ngay sau khi lượt 4 gộp và
     trước 26/10.
2. **02/11 → 20/11:** gom khoảng 30 golden cases từ OKR quý 4 thật; lượt 6–8 đặt các luật
   dùng chung vào gói chung.
3. **09/11 → 20/11: lượt 9a «nền Trợ lý OKR»** (T3, có Cổng 1.5), mở ngay sau khi lượt 7
   gộp; hạn chót mở là 23/11. Chưa có nút nào hiện.
4. **23/11 → 04/12: lượt 9b «đề xuất khi bấm»** (T2); ai sửa được Mục tiêu cấp OneHub dùng từ
   07/12. **07/12 → 10/12: lượt 9c «tóm tắt tuần»** (T2).
5. **11/12 → 18/12:**
   - lượt 10 nếu phép thử stub đạt và đủ điều kiện, không thì lượt 8;
   - R3 ngày 18/12 là mốc sẵn sàng cho mùa đặt OKR quý 1 (21/12);
   - nháp «điều học được» sang sau R3, có điều kiện, sớm nhất 04/01.

**Một quyết định cần chủ kho**

> **Mở lượt 9 với luật «nội dung OKR, kể cả tên đối tác người dùng tự gõ trong ghi chú, chỉ
> được gửi tới nhà cung cấp model khi có ZDR; không có ZDR thì không gửi; luật này áp cả cho
> eval», và trần khu OKR là $8/tháng trong $20 chung.**
> Trả lời một chạm: «đồng ý», hoặc sửa luật hay con số.

Căn cứ:

- Đây đúng là **hai câu mở lượt 9** lộ trình đã ghi. Việc chọn phương án không thêm câu hỏi
  nào mới. Câu về tên đối tác tự gõ và câu về eval là hai trường hợp của cùng luật, gộp vào
  đây vì dữ liệu đã gửi thì không lấy lại được.
- **ZDR theo từng yêu cầu thì miễn phí** ở gói Pro, và team đang ở gói Pro [08]. Google
  Vertex nằm trong danh sách nhà cung cấp có ZDR [08].
- **Không có ZDR thì yêu cầu hỏng, chứ dữ liệu không lọt.**
  - Yêu cầu mang cờ ZDR mà không có nhà cung cấp ZDR thì lỗi `no_providers_available` [08].
  - Cờ ZDR đặt cố định trong subagent, và judge của eval phải khai cùng cờ (có test ghim), nên
    luật đứng bằng cấu trúc.
- **$8 là 40% của $20.** Tính cho kịch bản vừa: 40 phòng ban, 500 lượt đề xuất trong tháng đặt
  OKR, 100 lượt ở tháng thường, 137,6 bản tóm tắt mỗi tháng (4.10):
  - **Tháng thường: $2,51–5,98.** $8 đủ, kể cả khi không trúng cache.
  - **Tháng đặt OKR, 60% đầu vào trúng cache:** 500 × $0,013 + 137,6 × $0,014 = $6,50 + $1,93
    = **$8,43, vượt $8 khoảng $0,43.** $8 chỉ đủ khi có thêm một trong hai: ít nhất 33 trong
    500 lượt (khoảng 7%) được dùng lại theo đầu vào không đổi, hoặc đổi model rẻ cho bước
    chuyển tiếp ở agent gốc (nấc 2): 500 × $0,010 + 137,6 × $0,011 = **$6,51**.
  - **Tháng đặt OKR, không trúng cache:** 500 × $0,024 + 137,6 × $0,026 = **$15,58**. Trần
    giữ ở $8 bằng cách cho đề xuất tạm nghỉ: sau khoảng 184 lượt nếu vẫn giữ chỗ cho tóm tắt
    ((8 − 3,58) / 0,024), tối đa 333 lượt nếu tóm tắt nhường hẳn theo luật của pha đặt OKR
    (8 / 0,024).
  - Muốn đủ cho trường hợp 60% cache mà không cần nấc 2 hay dùng lại thì con số là $9.
  - Chạm trần thì đề xuất tạm nghỉ chứ không gãy; quản trị được báo ở 80%; nâng trần là việc
    đảo được. Số đo N0 cho biết mình đang ở đầu nào của khoảng này trước khi 9a mở.
- **Nên trả lời sớm, không cần đợi 09/11.**
  - Trả lời sớm thì phép thử ZDR và việc gom golden cases chạy sớm.
  - Trả lời «không» thì Trợ lý OKR tắt gọn, không khung chung nào bị bỏ phí.

**Quyết định nhỏ đã có mặc định.** Máy làm theo mặc định nếu không bị veto; danh sách đủ ở
mục 9.2. Chỉ việc đảo được mới nằm ở đây.

- Lượt 9 tách thành 9a (T3), 9b và 9c (T2); 9a mở ngay sau lượt 7, sớm nhất 09/11.
- Lượt 9 đi trước lượt 8, nếu lượt 8 phải chờ đủ bốn tuần dữ liệu.
- 9b đứng trên lượt 3 (và luật lượt 7 nếu đã lên), lệch lộ trình vốn ghi lượt 4, 7.
- Thêm bốn mục từ điển ở Cổng Đáng 9a.
- Tóm tắt tuần chạy sáng hôm sau ngày cập nhật, xong trước giờ nhắc sớm nhất.
- Trong pha đặt OKR, đề xuất được ưu tiên hơn tóm tắt khi tiền sắp hết; pha khác thì ngược lại.
- Golden cases đã ẩn danh lưu ngoài git, trong thư mục bị gitignore trên máy chủ kho.
- Truy vấn chi phí trên production: máy soạn sẵn, chủ kho chạy.
- Đường chat của lượt 10 quyết ở Cổng 1.5 của lượt đó; phép thử stub không đạt thì chat sang
  tháng 1.
- Mở Trợ lý OKR theo đơn vị: cấp OneHub từ 07/12, mọi phòng ban từ 21/12.
- Vá lối rò Slack trong bản rẽ như một lượt T2 riêng. Việc báo cho hãng thì **không** phải
  mặc định: máy không gửi gì cho tới khi chủ kho cho phép.

---

## 1. Tability làm gì bằng AI

**Được gì.** Biết chính xác mình đang so với cái gì. Danh mục dưới đây đã sửa theo các
đính chính của 09.

Tability là một lớp prompt và luồng công việc mỏng đặt trên dữ liệu OKR có cấu trúc. Nó dùng
một nhà cung cấp model (OpenAI), do một đội khoảng 9 người làm [01, 02]. Thứ đáng chép ở đây
là **kỷ luật thiết kế**, không phải các khối.

| Nhóm việc | Tính năng | Cách làm | Điều đáng học | Điểm yếu |
|---|---|---|---|---|
| Đặt OKR | Soạn OKR, chat với Tabby (F01) | Người mô tả ý định bằng lời; từ 05/2024 là hội thoại. AI chỉ gợi ý; người bấm «Use this suggestion» thì mới ghi | Gợi ý trước, người chốt sau | Soạn trọn bộ cho cả đội. Lộ trình OneHub để việc này ngoài phạm vi |
| Đặt OKR | AI feedback cho plan (F02) | Nút «Generate analysis». Gợi ý tô sáng đúng dòng, kèm câu viết lại; người chọn Update hoặc Dismiss từng gợi ý | Gợi ý đứng cạnh bản gốc, quyết từng dòng | Không có tài liệu về «đã bác thì không mời lại», không đo nhận hay bác |
| Đặt OKR | Sinh initiative (F03), dò chỉ số (F04) | F03: gợi ý rồi dùng. F04: tự áp giá trị đầu và đích khi người gõ KR, bật sẵn | — | F04 tự áp số mà không hỏi |
| Đặt OKR | AI Importer (F05) | Bản nháp riêng, có bộ lọc Needs fixing / Needs attention / Excluded. Không tạo người mới, không bịa, nhập nguyên khối. 250 credit mỗi lần | Mẫu «đề xuất → duyệt → ghi nguyên khối» mạnh nhất | Mặc định công bố ngay sau khi nhập |
| Đặt OKR | Plan Score (F06) | Điểm 0–100, trung bình năm chiều: Focus, Descriptive, Measurable, Ownership, Actionable. Guide chính chủ có ghi (09 G8). Nhiều khả năng tính bằng luật | Có lớp luật đặt cạnh AI | Một điểm tổng dễ thành bảng xếp hạng đơn vị (suy luận) |
| Theo dõi | Tự đồng bộ số, kèm AI (F07) | Đăng số theo lịch, đứng tên Tabby. AI viết bình luận, 200 credit mỗi lần. «Deep Analysis» gợi ý cả confidence. Hệ thống vẫn nhắc người cập nhật | Nhãn tác giả AI; vẫn giữ người trong vòng | Ghi mà không qua duyệt; gợi ý cả mức tự tin |
| Theo dõi | Generate check-in (F08) | Người bấm (tài liệu khuyên dùng khi trễ quá 2 ngày). Cập nhật **hiện thẳng** trên dòng thời gian KR, đứng tên Tabby, không có bước duyệt (09 G1) | — | Mờ ai chịu trách nhiệm cho con số. Chính Tability nhận chất lượng kém hơn người viết [02] |
| Theo dõi | Coaching AI (F09) | Bấm Generate, nhận tóm tắt một KR kèm việc nên làm. Quản trị tắt riêng được | AI xuất hiện đúng chỗ đang làm việc | — |
| Theo dõi | Workspace Insights (không phải AI) | Bảng chẩn đoán bằng luật: plan thiếu check-in, KR không đo được, KR lệch (09 G7) | Lớp luật đặt cạnh AI, đúng hình lượt 5 và lượt 7 của OneHub | — |
| Báo cáo | Nhìn lại cuối kỳ (F10) | Nháp → sửa → publish. AI chấm điểm objective | Nháp để người đăng | AI tự chấm điểm |
| Báo cáo | AI-mode (F11) | Chat trên dữ liệu workspace, câu trả lời kèm link nguồn, hội thoại được lưu. Từ 27/08/2026 ghi được KPI theo cùng mô hình quyền; mọi thao tác xoá phải xác nhận. Khoảng 30 prompt mỗi người mỗi tháng | Luật bằng chứng nằm ngay trong mẫu prompt; phải xác nhận khi phá | Phần *đọc* chung không nói lọc theo quyền (09 G3). Không trộn được nguồn khác |
| Báo cáo | Scheduled prompts (F12) | Người viết prompt và chọn người nhận; kết quả sinh lúc chạy, gửi email; hiện giờ chạy kế tiếp trước khi lưu | Tách nội dung khỏi giao nhận | Tài liệu không có câu nào nói lọc theo quyền từng người nhận (09 G2). Người soạn được dặn tự giữ nội dung nhạy cảm. Đây là lối rò khi chạy nền |
| Thực thi | Agents (F13–F15) | Tability chỉ là nơi điều khiển; model chạy ở host ngoài (Codex, ChatGPT, Cowork) theo nhịp heartbeat. Đội con được duyệt bằng bình luận «Approve». Tối đa 6 agent, đang beta | Tạo idempotent; `begin_run` / `finish_run` đúng một lần; coi bình luận là đầu vào không đáng tin | Cài nhiều bước, phụ thuộc host, duyệt bằng chữ tự do |
| Kết nối | MCP server (F16) | 48 tool theo tài liệu hiện hành, trong đó 16 tool cho agent. OAuth, quyền theo người, quản trị bật API từng người. Không có tool tạo plan, objective hay KPI (09 G4) | Xác thực OAuth; tự kiểm bằng `whoami` | Marketing lệch tài liệu |
| Kết nối | Skills (F17); Teams qua Copilot Studio (F19); app Slack | Skills: 15 skill, mặc định chỉ đọc, có hợp đồng đầu ra. Teams: một danh tính dùng chung, Tability tự khuyên tạo user riêng. App Slack: nhắc và digest tuần, không có chat hay tóm tắt AI (09 G6) | Kỷ luật của skill | Danh tính dùng chung phá quyền theo người |
| Quản trị và giá | Công tắc (F20), giá (F21), dữ liệu (F22) | Công tắc: tắt toàn workspace; tắt từng tính năng (Coaching AI, dò chỉ số); tắt MCP và agents; bật API theo người; quyền theo plan (Edit/View/None) mà MCP kế thừa (09 G3). Giá: Premium $10–12/người/tháng, 4.000 credit và 30 prompt (một dòng ghi 25); Agentic (sắp ra) 10.000 credit và 500 prompt; Basic không có credit trong bảng giá mới. Dữ liệu: chỉ OpenAI, xoá sau 30 ngày, xử lý ở Mỹ | Công tắc nhiều tầng; tắt AI thì phần lõi vẫn chạy y nguyên | Không bật AI theo nhóm hay phòng ban. Đong tiền theo đầu người. Tặng 5.000 credit cho mỗi đánh giá 5 sao trên G2 [02] |

**Đọc bảng**

- **Chuyện ghi thay người.** Mọi thao tác ghi của AI mà tài liệu các hãng mô tả đều qua
  người duyệt, **trừ Tability** [09 §5 ý 2]:
  - tự đồng bộ số thì tự đăng;
  - «Generate check-in» đăng thẳng khi bấm.
- **Chuyện quyền.** Tability làm tốt khâu tương tác theo quyền người hỏi. Còn khâu chạy nền
  rồi gửi cho nhiều người thì nó giao cho người soạn tự canh.
- **Chuyện chất lượng.** Tability không công bố số đo AI nào. Lời chê cụ thể duy nhất tìm
  được là «thông báo AI dồn dập, kể cả cho việc không phải của mình» [02]. Không tài liệu
  nào nhắc tiếng Việt [01].

---

## 2. Thị trường

**Được gì.** Biết đâu là mức tối thiểu người dùng đã quen, chỗ nào đáng học, và câu «OneHub
hơn» nào có căn cứ.

### 2.1 Mức nền năm 2026

Thiếu những thứ sau thì người đã quen Tabby hay Copilot sẽ thấy hụt [03 (a), 04 §0]:

- soạn OKR từ một câu hoặc một tài liệu;
- kiểm chất lượng KR;
- tóm tắt tiến độ cho người quản lý;
- hỏi đáp trên dữ liệu OKR theo quyền người hỏi;
- công tắc AI cho quản trị, kèm cam kết không huấn luyện trên dữ liệu khách;
- MCP server ra Claude hay ChatGPT. Sáu hãng đã có; ba hãng có ngày ra đều trong 2026;
- mọi thao tác ghi của AI qua người duyệt (trừ Tability, như trên).

Không nền tảng nào để AI tự ghi số tiến độ, tự đặt mức tự tin hay chấm người [04 §4]. OneHub
đã khoá đúng ba điều này ở NG-05, NG-01 và NG-07.

### 2.2 Tám khác biệt đáng học

| # | Khác biệt | Ai làm, nguồn | OneHub dùng ở đâu |
|---|---|---|---|
| 1 | **Quyền của câu trả lời đi theo quyền của nguồn.** Insight rút từ một cuộc họp hay một tệp chỉ hiện với người có quyền với nguồn đó | Cascade, https://feedback.cascade.app/changelog | Tóm tắt tuần lọc từng câu theo người xem, dựa trên nguồn của câu (4.7) |
| 2 | **Đề xuất cập nhật từ ngữ cảnh định tính**, gắn đúng mục tiêu, kèm mức tự tin, người duyệt trước khi đăng. Trả lời theo ngôn ngữ chiếm đa số của nội dung | Cascade Tapestry Connect, cùng nguồn | Để sau R3 (7.2). Riêng golden cases Anh–Việt thì làm ngay ở lượt 9 (4.11) |
| 3 | **Agent đi theo nhịp họp thật**: memo thứ Hai, tổng kết thứ Sáu, tài liệu đọc trước | WorkBoard, https://www.workboard.com/resources/product-updates/gen2-ai-agents | Tóm tắt tuần hiện ở đầu bảng họp tuần của lượt 5 (lượt 9c) |
| 4 | **Tách «biết phương pháp» khỏi «đọc dữ liệu».** Coach chỉ biết phương pháp thì có ở mọi gói; assistant đọc dữ liệu thì đong tiền | Perdoo, https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon | Skill phương pháp tĩnh cho chat ở lượt 10, không đọc dữ liệu (4.8) |
| 5 | **Tắt mặc định, bật theo tính năng và theo nhóm**, giải thích vì sao gợi ý | Betterworks, https://www.betterworks.com/ai-for-hr ; Viva Goals, https://learn.microsoft.com/en-us/viva/goals/copilot-intro | Công tắc theo việc × đơn vị trong Chương trình OKR (lượt 9a) |
| 6 | **Danh tính riêng, phạm vi hẹp cho việc chạy nền**; tóm tắt đứng trên chữ do người viết | Linear, https://linear.app/developers/agents ; https://linear.app/docs/pulse | Tóm tắt chỉ đọc Cập nhật tuần do người ghi; việc nền không mượn quyền của ai (4.7) |
| 7 | **Trần tiền theo agent và theo workspace**, báo ở 80% và 100%, tự dừng khi cạn | Notion, https://www.notion.com/help/buy-and-track-notion-credits-for-custom-agents ; Rovo, https://support.atlassian.com/rovo/docs/rovo-usage-limits/ | Trần khu OKR, báo quản trị ở 80% và 100%, nút mờ kèm lý do khi hết (4.10) |
| 8 | **Nói thẳng AI không làm gì**: không ra quyết định nhân sự. Agent do automation gọi thì không được ghi | Lattice, https://lattice.com/ai ; Rovo, https://support.atlassian.com/rovo/docs/agents-in-automations/ | Không tool nào ghi bảng OKR. NG-01, NG-05, NG-07 thành từ cấm trong bộ kiểm (4.11) |

### 2.3 Lối rò khi chạy nền

Rò quyền tập trung ở khâu chạy nền, và có ở cả bốn nơi [09 §5 ý 3; 04 M4]:

- **Copilot Studio**: trigger chạy bằng quyền của người dựng agent; Microsoft tự cảnh báo
  điều này (https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about).
- **ClickUp**: dữ liệu đã chia cho agent được dùng để trả lời bất kỳ ai gọi được agent
  (https://help.clickup.com/hc/en-us/articles/36926065055127-Super-Agent-privacy-security-and-permissions).
- **Notion Custom Agent**: chạy bằng quyền người tạo (mức tin vừa) [04].
- **Tability scheduled prompts**: một bản kết quả cho mọi người nhận (09 G2).

Kho OneHub cũng có đúng lối này ở khung Tác nhân của hãng (xem 3.3, khoảng trống 8).

### 2.4 Bài học Viva Goals

- **Chuyện gì đã xảy ra.** Microsoft đưa Copilot vào Viva Goals (GA quý 1/2024), rồi khai tử
  sản phẩm ngày 31/12/2025 vì mức dùng không tăng
  (https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq).
- **Bài học.** AI không cứu được một vòng dùng yếu. Thứ giữ OKR sống là nhịp Cập nhật tuần.
  AI phải phục vụ nhịp đó, không chen vào nó [03 (c) ý 1].
- **Bài học đó thành ba luật trong kiến trúc:**
  1. Ở R3, Trợ lý OKR không có mặt trên màn «Cập nhật tuần của tôi». Lượt 4 đã hứa một lần
     cập nhật dưới 60 giây.
  2. Không thêm tin thứ hai mỗi sáng. Nhắc buổi sáng có tối đa hai **dòng báo của Trợ lý
     OKR**, và chúng đứng sau việc của người. Dòng báo là chữ do luật viết, nói về kết quả của
     Trợ lý OKR; nó không phải chữ do AI viết (4.12).
  3. Có hai ngưỡng chặn ở Cổng Giá trị:
     - trung vị thời gian một lần Cập nhật tuần không tăng sau khi bật Trợ lý OKR;
     - tỷ lệ người tắt Nhắc buổi sáng không tăng.

### 2.5 OneHub hơn Tability ở đâu

**Kết luận chung, so với câu hỏi gốc «tương tự hoặc tốt hơn Tability».** Tại R3, OneHub
**không ngang** Tability về độ rộng: thiếu chat (trừ khi lượt 10 mở), MCP, coaching trên từng
KR và importer. OneHub hơn ở bốn chỗ có kiểm chứng: người giữ số, bật theo đơn vị, ZDR, và số
trong tóm tắt được mã kiểm. Các chỗ «hơn» còn lại chỉ dựa vào việc tài liệu Tability không nói
tới, chưa ai thấy Tability không làm.

Cột «Mức tin»: **cao** = có nguồn nói thẳng hoặc đã kiểm; **thấp** = dựa vào chỗ nguồn im lặng.

| Điểm | Căn cứ | Mức tin | Chốt trong kiến trúc | Từ lượt |
|---|---|---|---|---|
| Người giữ số và Mức tự tin | Tabby đăng cập nhật thẳng, đứng tên máy, không qua duyệt (09 G1). Auto-sync gợi ý cả confidence [01 F07] | Cao | Không tool nào ghi số hay Mức tự tin. Khuôn đầu ra không có trường đó | 9a |
| Bật theo đơn vị | Tability có công tắc từng tính năng và quyền theo plan, nhưng không bật AI theo nhóm hay phòng ban (09, đính chính 03) | Cao | Công tắc theo việc × đơn vị | 9a |
| ZDR bắt buộc | Tability chỉ dùng OpenAI, xoá sau 30 ngày [01 F22] | Cao | Cờ ZDR cố định trong subagent và trong judge | 9a |
| Mọi con số trong tóm tắt được mã kiểm lại | Không hãng nào công bố việc kiểm số tự động [03] | Cao về phía OneHub (có mã); thấp về phía Tability (03 để mức tin «thấp») | Bộ kiểm bỏ câu lệch, và chạy lại lúc hiện | 9c |
| Chạy nền mà vẫn lọc theo từng người xem | Tài liệu scheduled prompts của Tability không có câu nào nói lọc theo quyền người nhận (09 G2) | Thấp (nguồn im lặng) | Tóm tắt lưu nguồn của từng câu, và lọc ngay lúc hiện. **Hơn từ lượt 8; trước đó ngang**, vì hôm nay mọi thành viên đọc được mọi OKR nên bộ lọc chưa bỏ câu nào (4.7) | 9c, có tác dụng từ 8 |
| Đo chất lượng AI bằng hành vi: nhận, sửa, bác, hoàn tác | Tability không công bố số đo AI nào [02]. Không hãng nào công bố tỷ lệ nhận, sửa, bác [03] | Thấp (nguồn im lặng) | Sổ đề xuất có trạng thái, đo bằng thước SQL. Đây là số cho chủ kho; người dùng không thấy khác gì | 9b |
| Đã bác thì không mời lại | Tability không có tài liệu về luật này [01] | Thấp (nguồn im lặng) | Từ chối ngay ở đường ghi, theo tiền lệ `apps/agent/agent/lib/facts.ts` [mã] | 9b |
| Tiếng Việt | Chất lượng tiếng Việt của Tability chưa ai đo (09 G21); của gemini-3.7-flash cũng chưa | — | **Chưa so được.** OneHub có golden cases tiếng Việt và Anh–Việt để đo | 9b |
| Zalo | Không hãng nào nhắc Zalo [03] | Cao | Dòng nhắc qua Zalo | 4 (nhắc), 9c |
| Chi phí tính theo khu và đơn vị, không theo đầu người | Tability đong credit theo người [01 F21] | Cao | Trần tháng cho khu OKR; gom việc theo đơn vị | 9a |

**Chỗ Tability vẫn hơn tại R3, nói thẳng:**

- soạn trọn bộ OKR bằng hội thoại (OneHub cố ý không làm);
- chat trên OKR (OneHub chỉ có nếu lượt 10 mở);
- MCP với 48 tool;
- agent sở hữu mục tiêu;
- AI Importer;
- coaching trên từng KR.

Nháp nhìn lại cuối kỳ (F10) thì OneHub chỉ có sau R3, có điều kiện, sớm nhất 04/01 (6.3).

---

## 3. Kho hôm nay có gì

**Được gì.** Thấy Trợ lý OKR dựng trên những gì sẵn có, và vướng ở đâu.

### 3.1 Bản đồ ngắn

| Khái niệm | Trong kho hôm nay | Nguồn |
|---|---|---|
| Agent | Một app eve (`apps/agent`, eve 0.29.4). Model của agent gốc là `AppSetting.agentModelId`; hàng **trống** hoặc đọc hỏng thì là `zai/glm-5.2-fast` (`readAgentModel` trả `isDefault: true`, `lib/model.ts` trả `null`). Trần mỗi phiên: 500k token vào, 50k token ra, sống 30 ngày | `apps/agent/agent/agent.ts`, `apps/agent/agent/lib/model.ts`, `packages/db/src/settings.ts` [mã] |
| Purpose | Ba giá trị: `builder`, `team-agent`, `research`. Giá trị lạ **rơi về `research`**, tức là nhận `instructions` nghiên cứu | `apps/agent/agent/lib/session-purpose.ts` [mã] |
| Tool | 26 tool tự viết, tĩnh, hiện với mọi phiên gốc; thêm `tools/agent.ts` để tắt tool tự nhân bản. 16 trong 26 tool không tự kiểm purpose [06] | `apps/agent/agent/tools/` [mã] |
| Skill | 4 skill tĩnh: `data-boundaries`, `evidence`, `identity-matching`, `writing-a-brief` | `apps/agent/agent/skills/` [mã] |
| Subagent | `agent_builder` có hook riêng. `agent_runner` không có hook; tắt 9 tool dựng sẵn; sandbox `deny-all`; có `outputSchema` | `apps/agent/agent/subagents/` [mã] |
| Tác nhân (team agent) | Khuôn Zod có phiên bản, Deploy làm cổng duyệt, lượt chạy có sổ hành động và cột chi phí. Lượt chạy nền mang danh tính người dựng: `principalId = run.initiatedById ?? run.agent.createdById` | `apps/agent/agent/lib/custom-agent-dispatch.ts` [mã] |
| Kênh | `crm` (việc nội bộ); `eve` (cầu nối từ app, từ chối vai «chỉ OKR»); `zalo` (webhook, chỉ đọc lệnh cố định) | `apps/agent/agent/channels/` [mã] |
| Lịch | Một lịch chạy mỗi phút: nhắc, xả hàng việc, lượt Tác nhân. Lịch không tự quyết gì | `apps/agent/agent/schedules/dispatch.ts` [mã] |
| Hàng việc | Bảng `AgentTask` có hai làn: làn trực tiếp (không gọi model) và làn `research` (một phiên eve mỗi hàng). Mức ưu tiên nằm trong một hằng. Cột `reason` bắt buộc và **đi vào agent gốc** qua `taskAuth` và câu `brief` mặc định (`Handle this: ${reason}`). Lease làn `research` 30 phút, thử tối đa 3 lần (`MAX_ATTEMPTS`). Kênh `crm` gửi phiên **không** kèm `mode: "task"`, và `turn.failed` không đóng việc | `packages/db/src/agent-tasks.ts`, `packages/db/prisma/schema.prisma`, `apps/agent/agent/lib/dispatch.ts`, `lib/dispatch-config.ts`, `channels/crm.ts` [mã] |
| Knowledge | Dữ liệu có cấu trúc trong Postgres, cộng preamble ghép sẵn. Không có pgvector, tsvector hay pg_trgm | `packages/db/prisma/schema.prisma` [mã]; [08] |
| Quyền | Tool đọc Postgres với đủ quyền; chỉ kiểm ở cửa vào. Vai «chỉ OKR» bị chặn khỏi Trợ lý AI ở hai lớp: route cầu nối đòi phạm vi `doi-tac`, và `repFromCrm` trả rỗng với vai này | `apps/app/app/eve/v1/[...path]/route.ts`, `apps/agent/agent/channels/eve.ts` [mã] |
| Chi phí | Chỉ `AgentRun` có cột `costUsd`, tức chỉ Tác nhân được cộng. Phiên gốc để usage trong `AgentEvent.data`, chưa ai cộng. **Phiên con không có trong `AgentEvent`**: hook `audit.ts` không chạy trong subagent, và `agent_runner` không có hook; tiền phiên con chỉ đọc được qua `GET /eve/v1/session/:childSessionId/stream`. Không có trần tháng trong app. Không có `providerOptions` nào, nên chưa có ZDR | `apps/agent/agent/hooks/audit.ts`, `apps/agent/agent/lib/model.ts` [mã]; [08] |
| Eval | Một bộ eval (`agent-builder`); chưa khai judge | `apps/agent/evals/` [mã] |
| Miền OKR | Hàm thuần tính tiến độ, Tình trạng và thứ bậc cấp đã nằm ở `packages/validation/src/okr-kr.ts` và `okr-muc-tieu.ts`. Một phần vẫn nằm trong `apps/api`: `apps/api/src/okr/tien-do.ts` (58 dòng), `can-chinh.ts`, và `okr-access.service.ts` (phụ thuộc Nest). Vết OKR có 13 hành động. Chương trình OKR có phiên bản | [mã] |
| UI | `Suggestion` (`packages/ui/src/components/suggestion.tsx`) có `value`, `rationale`, `pending`, `onAccept`, `onDismiss`. Nó khác `Suggestion` trong sổ AI Elements (gợi ý câu hỏi bấm được của hội thoại). Có hai `Shimmer`: `packages/ui/src/components/shimmer.tsx` và bản `ai-elements/shimmer.tsx` thuộc hội thoại. Sổ AI Elements ghi 14 thành phần *Adopted*, nhưng cây chỉ có 4 tệp; `inline-citation` và `sources` chưa có trong cây. Cổng «mồ côi» đỏ với bất kỳ tệp nào không được `apps/**` nhập | `packages/ui/src/components/suggestion.tsx`, `docs/chat-ui.md` [mã] |
| Trạng thái các lượt | Lượt 1–3 đã lên `onehub`. Hợp đồng lượt 4 (`cap-nhat-tuan-okr`) và lượt 5 (`toan-canh-okr`) đều đã `implemented` trong cây làm việc riêng, **chưa gộp**. Lượt 5 đã viết luật «đáng bàn» ở `apps/api/src/okr/hop-tuan.ts` (`lyDoCua`, 172 dòng). #152 (gộp 26/09) xác nhận khoá API tắt rate limit | [git]; [cây] |

### 3.2 Điểm mạnh dùng lại được

1. **Hàng việc và làn `research`**: một cửa vào có ưu tiên, có thử lại và đối soát, không
   phải thêm cron.
2. **Khuôn subagent đã chạy thật.** Trợ lý OKR chép phần tắt tool dựng sẵn, sandbox
   `deny-all` và `outputSchema` của `agent_runner`, và nhánh từ chối hợp lệ (`not_authorized`)
   của `agent_builder` [mã]. Nó **không** chép `defineDynamic` model của `agent_runner`: đó
   đúng là lựa chọn động mà chốt 2 cấm (4.1).
3. **Luật «đã bác thì không mời lại» thực thi ở đường ghi**
   (`apps/agent/agent/lib/facts.ts` [mã]).
4. **Hook chặn bằng cách ném lỗi**, đã có tiền lệ ở
   `apps/agent/agent/hooks/builder-delegation.ts`. Bài học «từ chối là một kết quả, không
   phải ngoại lệ» đã ghi trong `docs/agent.md` [mã].
5. **Đường ghi OKR có quyền và có vết**: `OkrService`, `OkrTrail`, khoá pha. Khi người nhận
   một đề xuất, việc ghi đi đúng đường này.
6. **Khuôn dữ liệu dùng chung** ở `packages/validation`. Hàm thuần của miền OKR đã nằm ở đó
   (`okr-kr.ts` với `tienDoKr`, `okr-muc-tieu.ts` với `tinhTrang` [mã]), và `@crm/db` có
   `exports` theo subpath cho hàm cần mã của gói đó.
7. **Usage của từng bước đã có trong sự kiện** `step.completed`, gồm cả `cacheReadTokens` và
   `costUsd` (`apps/agent/agent/hooks/activity.ts` [mã]).
8. **Năng lực biến mất khi thiếu khoá** (`apps/agent/agent/lib/capabilities.ts` [mã]).
9. **Nhắc buổi sáng**: một tin mỗi người mỗi ngày, trần 10 mục, 2.000 ký tự cho Zalo
   (`packages/db/src/onboarding-nhac.ts`, `apps/agent/agent/lib/zalo-config.ts` [mã]).
10. **Khung eval của eve** chạy trên HTTP thật, và judge khai được theo từng eval
    ([eve] `evals/judge.mdx`).

### 3.3 Tám khoảng trống chặn đường

| # | Khoảng trống | Hệ quả nếu không lấp | Lấp ở đâu |
|---|---|---|---|
| 1 | **Tool ở gốc là tĩnh.** eve cho tool động *thay* tool đã có theo tên, nhưng không *gỡ* được tool; `disableTool()` gỡ cho mọi phiên ([eve] `guides/dynamic-capabilities.md` §Conflicts, `concepts/default-harness.md`) | Một purpose OKR đặt ở gốc vẫn thấy `read_crm_history`, `search_crm`… | Trợ lý OKR là một subagent (4.2) |
| 2 | **Chưa có đường vào AI nào cho vai «chỉ OKR».** Hai lớp chặn hiện có là đúng | Mở cầu nối là đổi quyền (T3), và thêm một đường vào phải đo | Lượt 9 đi qua `okr.router`, không qua cầu nối (4.7) |
| 3 | **Chưa có trần tiền trong app, và sổ chi phí mù phiên con.** Hook của gốc không chạy trong lượt của subagent ([eve] `guides/hooks.md` §Subagent isolation). `agent_runner` không có hook, nên `AgentRun.costUsd` nhiều khả năng chỉ đếm phần chuyển tiếp (suy luận mạnh) | Vượt $20 mà không ai biết; nút gãy bằng lỗi 402 | Sổ chi phí chung, cộng trần kiểm trước khi xếp việc (4.10) |
| 4 | **Chưa có ZDR, và luật dữ liệu chưa coi nhà cung cấp model là bên nhận.** `docs/agent.md` và `apps/agent/agent/skills/data-boundaries.md` ghi `apps/agent` «được đọc mọi thứ» [mã] | Không trả lời được câu mở lượt 9 | ZDR cố định trong subagent; viết lại luật dữ liệu (9a) |
| 5 | **Số và quyền OKR một phần nằm trong `apps/api`**, nên `apps/agent` không nhập được | Màn và Trợ lý OKR tính ra hai con số khác nhau | Dời `tien-do.ts`; tách vị từ «hợp lệ làm đích Căn chỉnh» (9a) |
| 6 | **Từ điển va chạm.** «Gợi ý» và «Trợ lý AI» đã mang nghĩa khác [mã] | Chữ trên màn sai nghĩa | Ba mục từ điển mới (9a) |
| 7 | **Giao diện chưa có mẫu «câu cũ – câu mới – sửa», cũng chưa có trích dẫn** | Mỗi màn tự vẽ một kiểu | Biến thể `Suggestion` trong `packages/ui` (gửi lên hãng); đưa `inline-citation` vào cây cùng lúc với màn dùng nó |
| 8 | **Khung Tác nhân của hãng có lối rò khi chạy nền.** Lượt nền chạy bằng danh tính người dựng. Gửi Slack chỉ kiểm đích đã duyệt, không kiểm ai đang ở trong kênh (`apps/agent/agent/lib/run-runtime.ts`, hàm `approvedSlackDestination` [mã]). `isAutomated` chỉ nhận đúng `APP_AUTH` (`apps/agent/agent/lib/approval.ts` [mã]) | Từ 26/10, một Tác nhân đối tác có thể đăng dữ liệu đối tác vào kênh Slack có người mang vai «chỉ OKR» (suy luận về mức độ: còn tuỳ luật «kênh Slack có thuộc ranh CRM không») | Một lượt T2 riêng trong bản rẽ, ngay sau khi lượt 4 gộp và trước 26/10, độc lập với Trợ lý OKR. Lượt này chạm lần đầu `run-runtime.ts` và `approval.ts`, nên ghi thành chỗ rẽ có tên. Báo cho hãng qua kênh báo lỗi bảo mật riêng, không qua PR công khai; việc gửi cần chủ kho cho phép |

Một điều kiện nữa không phải khoảng trống của kiến trúc mà là của dữ liệu: **tóm tắt tuần
cần chuỗi Cập nhật tuần của lượt 4**, mà lượt 4 chưa gộp và sau đó còn cần vài tuần dữ liệu
thật [09 sự thật 9].

---

## 4. Kiến trúc đề xuất

**Được gì**

- **Người đặt OKR.** Trưởng đơn vị (hoặc quản trị, với Mục tiêu cấp OneHub) bấm «Nhờ Trợ lý
  OKR góp ý» trên hộp thoại Mục tiêu. Người phụ trách một KR bấm cùng nút trên hộp thoại KR
  của mình, với phạm vi chỉ KR đó. Vài giây sau họ nhận vài đề xuất:
  - câu cũ đặt cạnh câu mới;
  - câu hỏi về một KR chưa đo được;
  - chỗ Căn chỉnh nên gắn.

  Họ nhận, sửa hay bác từng dòng. Dòng nào đã bị bác thì Trợ lý OKR không mời lại.
- **Trưởng phòng ban.** Sáng hôm sau ngày cập nhật, họ mở bảng họp tuần và thấy tóm tắt tuần
  của phòng. Câu nào cũng bấm ra được lần Cập nhật tuần gốc, và số nào cũng đã được máy kiểm
  lại.
- **Người mang vai «chỉ OKR».** Họ dùng được Trợ lý OKR mà không bao giờ chạm dữ liệu đối
  tác, kể cả khi ai đó gõ lệnh chèn vào tên một KR.
- **Chủ kho.** Chủ kho:
  - bật hay tắt Trợ lý OKR theo từng việc và từng đơn vị;
  - đặt trần tháng;
  - thấy tháng này AI tiêu bao nhiêu cho từng việc, kể cả làn `research` danh bạ;
  - được báo khi tiêu tới 80%.
- **Luật chung.** Máy không bao giờ ghi số, Mức tự tin hay Cập nhật tuần.

### 4.1 Phương án nền và phần ghép

**Nền: phương án A, «dọc OKR trước, tổng quát sau».** Cả ba giám khảo chọn A, mỗi người
theo một lăng kính:

- **Khớp kho.** Lượt 9 không chạm lần đầu tệp mã nào của hãng; các tệp đã rẽ dày thêm có đếm
  (8.1, R12). Cách ly dựa trên cam kết của eve
  mà kho đã chạy thật (`agent_runner`).
- **Giá trị.** Đề xuất tới tay sớm nhất: nó chỉ cần dữ liệu của lượt 3. Nhưng các lượt đi
  tuần tự, nên lượt 4–7 trễ thì 9a trễ theo; đệm là khe 09/11 → 20/11 (6.1).
- **Rủi ro.** A là phương án duy nhất mà mức hỏng tệ nhất của cách ly và của ZDR là «việc
  thất bại», chứ không phải «dữ liệu đi ra».

**Bốn chốt bắt buộc trước Cổng Bằng chứng của lượt 9a.** Các chốt này lấy từ giám khảo rủi
ro; tôi đã tự kiểm lại căn cứ.

1. **Kết quả subagent trả về gốc chỉ là mã (enum), không có chữ tự do.**
   - Model của gốc là `AppSetting.agentModelId`; hàng trống hoặc đọc hỏng thì là
     `zai/glm-5.2-fast` (`apps/agent/agent/agent.ts`, `packages/db/src/settings.ts`,
     `apps/agent/agent/lib/model.ts` [mã]).
   - Báo cáo 08 không thấy Z.ai trong danh sách nhà cung cấp ZDR (mức tin vừa) [08].
   - Vì vậy mẩu chữ OKR nào quay về gốc cũng là một mẩu có thể tới nhà cung cấp ngoài ZDR.
   - Có ba đường chữ có thể về gốc, và cả ba phải đóng:
     - **cột `reason` của `AgentTask`**: nó vào gốc qua `taskAuth`, qua câu `brief` mặc định
       và qua `sessionPreamble` [mã]. `reason` của mọi việc `okr-*` là một hằng theo loại việc
       (ví dụ `"okr-de-xuat"`), đặt trong `TRO_LY_OKR`. Khuôn `onboardingMatchNeeded` đặt dữ
       liệu vào `reason`, nên **không** chép phần đó;
     - **câu `brief` và `instructions` của gốc**: `brief()` có nhánh riêng cho `okr-*` trả câu
       cố định; nhánh `okr` của `instructions/task.ts` đứng **trước** nhánh nghiên cứu và không
       gọi `sessionPreamble`;
     - **kết quả lỗi của subagent**: `outputSchema` chỉ ràng buộc đường thành công. Khi subagent
       hết lượt thử model, hết trần, hay trả đầu ra sai khuôn, eve trả về «one failed task
       result» ([eve] `subagents.mdx`), và tài liệu không nói nội dung lỗi đó có chép đầu ra sai
       khuôn không (suy luận). N0 đo điều này; nếu có chữ, hook `okr-uy-quyen` kết thúc lượt
       ngay khi thấy kết quả lỗi của `tro_ly_okr`, trước bước model kế tiếp.
2. **ZDR và `reasoning` đặt ở cấp agent của subagent, không bao giờ nằm trong lựa chọn động.**
   - eve ghi rằng resolver model hỏng thì «degrade, never fail the turn» và rơi về
     `fallback` ([eve] `agent-config.md` §Set the model).
   - Một lựa chọn động bỏ trống `modelOptions` thì dùng lại `modelOptions` cấp agent. Còn lựa
     chọn có `modelOptions` riêng thì có gộp với cấp agent hay không, tài liệu không nói
     (suy luận).
   - Vì vậy lượt 9 không dùng lựa chọn động cho subagent, và có một test ghim điều này.
3. **Gói tóm tắt không mang họ tên người.**
   - Gói chỉ mang id; màn tự ghép tên từ id.
   - Bộ kiểm bỏ câu nào có họ tên đầy đủ của thành viên, so không dấu.
   - Bộ kiểm có danh sách từ cấm cho NG-01, NG-02 và NG-07.
4. **Có công tắc theo việc và theo đơn vị trong Chương trình OKR**, ngoài công tắc tổng. Nhờ
   vậy, một loại đề xuất bị bác nhiều thì tắt riêng được, không phải tắt luôn tóm tắt.

**Lấy từ B và C**

| Lấy gì | Từ | Vì sao |
|---|---|---|
| Phép thử «stub cùng tên» ở gốc, dùng như **một phép đo**, không phải đường chạy của lượt 9 | B, C | Kết quả quyết đường chat ở lượt 10. Rẻ: 1–2 giờ, nhánh nháp, không gộp |
| Đặt `reasoning` tường minh và đo reasoning tokens | C | Một biến chi phí chưa ai đo. eve có sẵn trường `reasoning` ([eve] `agent-config.md` §Reasoning effort) |
| Sổ chi phí chung cho mọi purpose, có ngay từ 9a | B | Làn `research` đang tiêu chung $20 mà không có trần. «Luật của hai» đã thoả, vì $20 đã có ít nhất bốn bên tiêu (mục 0, «Tiền») |
| Dùng lại kết quả khi đầu vào không đổi (`inputHash`) | B | Bấm lại không tốn tiền trong tuần cao điểm |
| Bộ kiểm là hàm thuần, chạy lại cả lúc hiện | B | Số đổi sau khi tóm tắt thì câu bị ẩn, thay vì hiện sai |
| Test tĩnh «không ghi bảng `okr*`» | B | NG-05 đứng bằng test, không bằng `instructions` |
| Năng lực biến mất một cách chủ động | B, C | Không có lượt hỏng đầu tiên |
| Không thêm chỉ mục vào bảng `AgentTask` của hãng | C, qua giám khảo khớp kho | Migration chỉ nằm trong khối riêng của bản rẽ |
| Chốt cho `tro_ly_okr` ở phiên thuộc purpose khác; test purpose `okr` không rơi về `research` | Giám khảo khớp kho | Subagent hiện thành một tool trong **mọi** phiên gốc ([eve] `subagents.mdx` §What the parent sees) |
| Gói không tên người; so họ tên đầy đủ, không dấu; danh sách từ cấm theo NG | C | NG-07 đứng bằng cấu trúc; tránh bỏ nhầm câu vì «An», «Bình» cũng là từ thường |
| Chống tin dồn dập: tối đa hai dòng báo của Trợ lý OKR; đứng sau việc của người; báo theo cạnh; nguội 14 ngày; người nhận tự tắt được; đo tỷ lệ tắt | C | Lời chê cụ thể duy nhất về AI của Tability [02]; bài học Viva Goals |
| Dòng nhắc mang số đếm do luật tính | C | Người nhận biết có đáng mở không, mà chữ model không lên máy chủ Zalo |
| Giữ tóm tắt lại khi quá 30% số câu bị bỏ | C | Tóm tắt kém không tới tay ai |
| Báo quản trị khi tiêu tới 80% và 100% trần | C (mẫu của Notion, Rovo) | Nút không mờ đi mà không ai hay |
| Tóm tắt chạy sau ngày cập nhật, hiện ở đầu bảng họp tuần | B, C, qua giám khảo giá trị | Không tóm tắt số đã một tuần tuổi |
| Ngưỡng «trung vị Cập nhật tuần không tăng», «tỷ lệ tắt nhắc», «tóm tắt được mở», «độ phủ» | B, C | Để Cổng Giá trị trả lời được câu «có ăn thua không» |
| Kiểm chữ chỉ chiều; đo `cacheReadTokens` trên đường ZDR; từ lượt 8, gói dùng chung chỉ chứa thứ mọi người nhận đều đọc được | Giám khảo rủi ro | Ba lỗ mà cả ba phương án cùng sót |

**Bỏ**

| Bỏ gì | Từ | Vì sao |
|---|---|---|
| Danh mục bản khai (manifest), bảng chung `AiOutput`, các trigger và kiểu duyệt chưa dùng | B | Dựng khung khi mới có một miền. Giữ lại làm đích rút khung khi có miền thứ hai (4.13) |
| Lượt nền T3 chèn giữa lượt 5 và lượt 6 | B | Rơi vào tuần mở R1 (26/10), và đẩy lượt 7 sát hạn cứng 14/12 |
| Stub che tool ở phiên gốc làm đường chạy của lượt 9 | B, C | Tài liệu eve không nói resolver tool hỏng thì phiên đóng hay mở ([eve] `guides/dynamic-capabilities.md`). Cách ly phải hỏng theo hướng đóng |
| Sửa `agent.ts` và `lib/model.ts` ngay gia số đầu; thêm cột vào `AppSetting` | B | Hai tệp này của hãng, bản rẽ chưa từng sửa [git]. Chỉ sửa khi số đo buộc phải sửa |
| Để model đề xuất đích cho DO-06 | B | Con số không có nguồn nào để mã kiểm. DO-06 tính bằng mã |
| Câu «AI đề xuất câu ghi chú khi người bấm» | B | Chen vào màn Cập nhật tuần, nơi lượt 4 hứa dưới 60 giây |
| Khung Tác nhân làm đơn vị mở rộng, `AgentAction` làm sổ đề xuất, Deploy theo đơn vị, trigger theo sự kiện OKR, Tác nhân do người dùng tự ghép | C | Chạm lần đầu bảy tệp của hãng. Đầu ra OKR thành một đường đọc thứ hai qua router của hãng. `instructions` tự do chạy trong phiên sinh nội dung cho người khác đọc |
| Vá `audit.ts` ngay trong bản rẽ | C | Hook chi phí là tệp mới, không cần sửa `audit.ts`. Riêng `isAutomated` (`lib/approval.ts`) thì vá trong bản rẽ, nhưng ở lượt vá lối rò Slack, không ở lượt 9 (3.3, khoảng trống 8) |

### 4.2 Các khối

| # | Khối | Người dùng hay chủ kho được gì | Làm gì | Vị trí | Mới hay sửa |
|---|---|---|---|---|---|
| K1 | **Cửa vào ở API** | Nút chỉ hiện khi mình sửa được Mục tiêu (hay KR) đó và Trợ lý OKR đang bật | Kiểm quyền sửa (`OkrAccessService`), công tắc, trần, dùng lại theo `inputHash`; ghi `AgentTask` qua `AgentTriggerService.enqueue` với `reason` là hằng theo loại việc và `subject: [{ path: ["objectiveId"], … }]` để chống trùng; poke. Áp quyết định của người qua `OkrService`. Không gọi model | `apps/api/src/okr/tro-ly.service.ts` (mới); thủ tục trong `apps/api/src/okr/okr.router.ts`; một phương thức trong `apps/api/src/agent/agent-trigger.service.ts`. Chép phần xếp việc của `onboardingMatchNeeded` [mã], **không** chép cách nó đặt dữ liệu vào `reason` | Mới, cộng sửa nhỏ |
| K2 | **Hàng việc** | Bấm hai lần không chạy hai lần; mỗi phòng ban mỗi tuần có đúng một bản tóm tắt; việc hỏng không chạy lại sau 30 và 60 phút | Hai loại việc ở làn `research`: `okr-de-xuat`, `okr-tom-tat-tuan`. Hai loại ở làn trực tiếp, không gọi model: `okr-kiem-san-sang`, `okr-tom-tat-xep`. Mức ưu tiên đặt trong `PRIORITY`: việc bấm cao hơn mọi loại của làn `research` (cao nhất hôm nay là `workspace` 500 [mã]). **Việc `okr-*` không được thử lại**: số lần thử tối đa là 1, không phải `MAX_ATTEMPTS = 3` | `packages/db/src/agent-tasks.ts` | Sửa nhỏ |
| K3 | **Lịch tóm tắt** | Tóm tắt tới trước giờ nhắc; không thêm cron, không sửa lịch | Theo luật `docs/agent.md` §Budget and scheduling («`schedules/dispatch.ts` is the only schedule and decides nothing… belongs in a `dueAt`» [mã]): việc `okr-tom-tat-xep` ở làn trực tiếp tới hạn thì kiểm (có Cập nhật tuần, còn công tắc và trần), rồi ghi `okr-tom-tat-tuan` hoặc đóng mà không gọi model, và **tự đặt việc tuần sau** bằng `dueAt`. Việc đầu tiên do API đặt khi quản trị bật công tắc. Dùng `lockIdempotencyKey` (`packages/db/src/idempotency.ts` [mã]). Không theo tiền lệ lệch `lenLichNhac()` | `apps/agent/agent/lib/okr/lich.ts` (mới) | Mới |
| K4 | **Chuyển tiếp ở gốc** | Agent gốc không bao giờ thấy chữ OKR; việc hỏng đóng ngay kèm lý do | Purpose `okr`. `instructions` một câu: gọi `tro_ly_okr` đúng một lần; nhánh `okr` đứng **trước** nhánh nghiên cứu và không gọi `sessionPreamble`. `brief()` có nhánh `okr-*` trả câu cố định. Hook chặn mọi tool khác và mọi lời gọi thứ hai; ở phiên thuộc purpose khác, hook chặn lời gọi `tro_ly_okr`. Kênh `crm` gửi việc `okr-*` với `mode: "task"`, như lượt Tác nhân (`lib/custom-agent-dispatch.ts` [mã]); `turn.failed` của việc `okr-*` gọi `completeTask` kèm lý do | `apps/agent/agent/lib/session-purpose.ts`, `instructions/task.ts`, `lib/dispatch.ts` (`taskAuth`, `brief`), `channels/crm.ts`; `apps/agent/agent/hooks/okr-uy-quyen.ts` (mới) | Sửa nhỏ, cộng tệp mới |
| K5 | **Subagent `tro_ly_okr`** | Trợ lý OKR chỉ biết OKR | Không thừa kế gì. `instructions` tĩnh (luật, NG, từ vựng) cộng `instructions` động (quy trình của việc, context pack). Hai tool nộp. Tắt mọi tool dựng sẵn. Sandbox `deny-all`. Model, ZDR, `reasoning`, `limits` đặt cố định, không `defineDynamic`. `outputSchema` chỉ gồm mã | `apps/agent/agent/subagents/tro_ly_okr/**` (mới) | Mới |
| K6 | **Context pack** | Màn và Trợ lý OKR tính ra cùng một con số | Đọc chỉ-đọc các bảng OKR và cây tổ chức. Nhận `nguoiXem` từ hàng việc. Mọi con số do mã tính. Không mang họ tên | `apps/agent/agent/lib/okr/doc.ts`, `goi-ngu-canh.ts` (mới); `packages/db/src/okr-tien-do.ts` (dời từ `apps/api/src/okr/tien-do.ts`) | Mới, cộng dời |
| K7 | **Bộ kiểm** | Không câu nào mang số bịa tới tay người | Hàm thuần: chạy trong tool nộp trước khi ghi, và chạy lại lúc hiện | `packages/validation/src/okr-kiem-tro-ly.ts` (mới, có test) | Mới |
| K8 | **Sổ đề xuất, bảng tóm tắt, phản hồi** | Đếm được nhận, sửa, bác; bác rồi không mời lại; người nhận bấm «hữu ích / không» và tắt được dòng báo | Ba bảng trong khối OKR, cộng một cột trong `NotificationPreference` (bảng của bản rẽ). Hai bảng đầu ra **nằm ngoài** luật «mỗi lần ghi để lại một hàng `OkrTrail`», vì chúng không phải bản ghi OKR | `packages/db/prisma/schema.prisma`, khối OKR | Mới (T3) |
| K9 | **Sổ chi phí AI và trần** | Chủ kho thấy tiền đi đâu; trần giữ bằng mã | Bảng `AiChiPhi` ghi mọi bước. Một hook ở gốc (mọi purpose) và một hook trong subagent. `tinhNang` là một enum trong `packages/validation`, suy theo kênh (`crm` hay `eve`) **trước**, rồi mới theo purpose. Hai hàm `chiTieuThang`, `troLyOkrSanSang` dùng chung cho API và `apps/agent` | Bảng mới trong khối riêng của bản rẽ; `apps/agent/agent/hooks/so-chi-phi.ts` (mới); `apps/agent/agent/subagents/tro_ly_okr/hooks/so-chi-phi.ts` (mới); `packages/db/src/ai-chi-phi.ts` (mới) | Mới (T3) |
| K10 | **Công tắc và trần trong Chương trình OKR** | Bật theo việc × đơn vị; mỗi lần đổi đều có phiên bản | Cột mới trong `OkrProgramConfig`; khuôn `okrProgram` và `OKR_PROGRAM_MAC_DINH` thêm các trường tương ứng; màn ở Cài đặt › Chương trình OKR | `schema.prisma`; `packages/validation/src/okr-chuong-trinh.ts`; `apps/app/app/(app)/[slug]/settings/okr/form-cau-hinh.tsx` | Sửa (T3) |
| K11 | **Giao diện** | Câu cũ cạnh câu mới, nhận từng dòng; câu tóm tắt có trích dẫn | Nút «Nhờ Trợ lý OKR góp ý» trên hộp thoại Mục tiêu (người sửa được Mục tiêu) và trên hộp thoại KR (người sửa được KR đó, kể cả Người phụ trách KR; phạm vi chỉ KR đó); danh sách đề xuất; khối tóm tắt ở bảng họp tuần; biến thể «trước / sau / sửa» của `Suggestion` trong `packages/ui/src/components/suggestion.tsx` (tệp đã có `value`, `rationale`, `pending`, `onAccept`, `onDismiss`); trạng thái đang soạn dùng `packages/ui/src/components/shimmer.tsx`, không dùng bản `ai-elements/` của hội thoại | `apps/app/app/(app)/[slug]/okr/**`; `packages/ui/src/components/suggestion.tsx` (biến thể mới, gửi lên hãng); `inline-citation` của AI Elements vào cây cùng lúc với màn dùng nó | Mới, cộng biến thể |
| K12 | **Eval** | Đổi `instructions` hay đổi model thì biết ngay có hỏng không | Eval cách ly (bằng mã) ở 9a; golden cases tiếng Việt, eval số và eval NG có judge ở 9b và 9c. Judge khai trong từng eval, kèm cờ ZDR | `apps/agent/evals/okr/**` (mới). Không sửa `apps/agent/evals/evals.config.ts` của hãng ([eve] `evals/judge.mdx`) | Mới |
| K13 | **Luật và từ điển** | Chữ trên màn đúng nghĩa; luật dữ liệu nói đúng sự thật | Bốn mục từ điển. Mục OKR và câu «nhà cung cấp model là bên nhận» trong luật dữ liệu. Câu «`OkrDeXuat`, `OkrTomTat` nằm ngoài luật vết» trong `docs/api.md` §OKR | `CONTEXT.md`, `docs/agent.md` §What may be read, `apps/agent/agent/skills/data-boundaries.md`, `docs/api.md` §OKR. Hai tệp giữa phải khớp nhau [mã] | Sửa tài liệu |

**Hằng tinh chỉnh.** Theo luật «một tệp cấu hình cho mỗi khu» của `AGENTS.md`:

- `packages/validation/src/okr-tro-ly.ts`, hằng `TRO_LY_OKR_TRAN`: trần theo người, cỡ context
  pack, và **trần chữ riêng theo từng trường**: tên Mục tiêu và tên KR 200 ký tự, «vì sao lúc
  này» 500 ký tự (khớp `OKR_CONFIG` của API [mã]), lý do 200, câu tóm tắt 280, số dòng và số
  nguồn tối đa. Cả API lẫn `apps/agent` cùng đọc.
- `apps/agent/agent/lib/okr/config.ts`, hằng `TRO_LY_OKR`: những gì chỉ `apps/agent` dùng —
  model, `limits`, giờ chạy tóm tắt, `reason` cố định của từng loại việc, số lần thử tối đa
  (1). Viết `as const`, đơn vị gốc `MINUTE_MS`, theo khuôn
  `apps/agent/agent/lib/dispatch-config.ts` [mã].
- `apps/api/src/okr/okr-config.ts` [mã]: những gì chỉ API dùng.
- Mức ưu tiên đặt trong `PRIORITY` của `packages/db/src/agent-tasks.ts`, không đặt ở chỗ thứ
  hai.
- `packages/db/package.json` khai `exports` cho bốn subpath mới: `okr-tien-do`, `ai-chi-phi`;
  và `packages/validation` cho `okr-tro-ly`, `okr-kiem-tro-ly`.

**Vì sao `okr-tien-do` ở `@crm/db`.** `apps/api/src/okr/tien-do.ts` là hàm thuần, chỉ nhập
`soNgayVN` của `@crm/db/onboarding-nhac` [mã]. Vì vậy nó đi cùng gói có `soNgayVN`. Lý do
không phải tiền lệ `onboarding-buoc`: `datBuocXong` ở đó là hàm ghi DB, khác loại.

### 4.3 Hợp đồng

Đây là phác thảo mặt giao tiếp, không phải mã cuối. Mọi khuôn sống ở
`packages/validation/src/okr-tro-ly.ts`, nhập theo subpath, và kiểu suy ra bằng `z.infer`.
Trần chữ và trần số dòng đọc từ `TRO_LY_OKR_TRAN` (4.2), không viết số trong khuôn.

```ts
export const TRANG_THAI_DE_XUAT = [
  "cho", "nhan", "sua", "bac", "het-han", "da-sua-theo", "bo-qua",
] as const;
export const trangThaiDeXuat = z.enum(TRANG_THAI_DE_XUAT);

export const AI_PHAM_VI = ["toan-cong-ty", "danh-sach"] as const;
export const aiPhamVi = z.enum(AI_PHAM_VI);

export const okrTroLyViec = z.discriminatedUnion("viec", [
  z.object({
    viec: z.literal("de-xuat"),
    objectiveId: z.string().min(1),
    keyResultId: z.string().min(1).nullable(),
    nguoiYeuCau: z.string().min(1),
    inputHash: z.string().min(1),
  }),
  z.object({
    viec: z.literal("tom-tat-tuan"),
    departmentId: z.string().min(1),
    cycleId: z.string().min(1),
    tuan: ngayLich,
    inputHash: z.string().min(1),
  }),
]);

export const dongDeXuat = z.discriminatedUnion("loai", [
  z.object({
    loai: z.literal("viet-lai"),
    objectiveId: z.string(),
    keyResultId: z.string().nullable(),
    truong: z.enum(["title", "whyNow", "kr.title"]),
    truoc: z.string(),
    sau: z.string().trim().min(3),
    lyDo: z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.lyDo),
  }).superRefine(sauTrongTranCuaTruong),
  z.object({
    loai: z.literal("hoi"),
    objectiveId: z.string(),
    keyResultId: z.string().nullable(),
    maVanDe: z.enum(["kr-la-viec", "thieu-doi-trong", "khong-do-duoc", "trung-y", "muc-tieu-la-so"]),
    cauHoi: z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.cauHoi),
  }),
  z.object({
    loai: z.literal("can-chinh"),
    objectiveId: z.string(),
    dich: z.union([
      z.object({ targetObjectiveId: z.string() }),
      z.object({ targetKeyResultId: z.string() }),
    ]),
    lyDo: z.string().trim().min(1).max(TRO_LY_OKR_TRAN.chu.lyDo),
  }),
]);

export const nopDeXuat = z.object({
  dong: z.array(dongDeXuat).max(TRO_LY_OKR_TRAN.soDongDeXuat),
});

export const cauTomTat = z.object({
  vanBan: z.string().trim().min(5).max(TRO_LY_OKR_TRAN.chu.cauTomTat),
  nguon: z.array(z.string()).min(1).max(TRO_LY_OKR_TRAN.soNguonMoiCau),
});

export const nopTomTat = z.object({
  cau: z.array(cauTomTat).max(TRO_LY_OKR_TRAN.soCauTomTat),
});

export const ketQuaTroLy = z.object({
  trangThai: z.enum(["da-nop", "khong-lam-duoc"]),
  maLoi: z.enum(["thieu-du-lieu", "khuon-hong", "sai-viec", "het-han-muc", "tu-choi"]).nullable(),
});

export const troLySanSang = z.discriminatedUnion("bat", [
  z.object({ bat: z.literal(true), conLaiUsd: z.number() }),
  z.object({
    bat: z.literal(false),
    lyDo: z.enum([
      "tat", "viec-tat", "don-vi-chua-bat", "het-tran-thang", "het-tran-ngay",
      "chua-noi-tac-tu", "chua-co-khoa-mo-hinh", "het-tran-gateway",
    ]),
  }),
]);

export function inputHashTroLy(goi: GoiTroLy): string { … }
```

- `sauTrongTranCuaTruong` đọc trần theo `truong`: tên Mục tiêu và tên KR 200 ký tự, «vì sao
  lúc này» 500 ký tự. Một trần chung 200 sẽ không viết lại được câu «vì sao lúc này» dài
  201–500 ký tự.
- **`inputHashTroLy` là hàm băm duy nhất**, nhận đúng các trường của context pack: Mục tiêu,
  KR, Căn chỉnh, cấu hình chương trình, đề xuất đã bác, kết quả luật lượt 7. API và `apps/agent`
  cùng gọi hàm này; băm lệch thì dùng lại kết quả cũ sai.
- `reason` của hàng `AgentTask` không nằm trong khuôn nào ở đây: nó là hằng theo loại việc
  trong `TRO_LY_OKR` (4.1, chốt 1).

**Khuôn cố ý không có gì**

- **Không có trường số hiện tại, Mức tự tin, khởi điểm hay đích** trong đề xuất.
  - Dòng `hoi` hỏi người về đích hay khởi điểm còn thiếu; nó không điền hộ.
  - Mọi con số xuất hiện trong `sau` phải đã có sẵn trong dữ liệu đầu vào (4.11).
- **`ketQuaTroLy` không có chữ tự do.** Đó là chốt số 1: về gốc chỉ có mã. `lyDo` của từng
  dòng đề xuất là chữ, nhưng nó vào bảng riêng, không quay về gốc.
- **`ketQuaTroLy` luôn có nhánh `khong-lam-duoc`.**
  - Đây là bài học ghi trong `docs/agent.md` [mã]: nếu từ chối bị ném thành lỗi, model sẽ
    thử lại, còn phiên con thì không có đường kết thúc hợp lệ.
  - Hậu quả khi đó là lượt đứng mãi ở «Working in background».

**Việc hỏng đóng thế nào.** Hôm nay kênh `crm` khi nhận `turn.failed` chỉ `settle` bản ghi
liên quan, không gọi `completeTask`; việc chỉ đóng ở `session.completed` với outcome cố định
`"ran"`, và lease 30 phút cộng `MAX_ATTEMPTS = 3` cho một việc hỏng mở thêm hai phiên sau 30 và
60 phút [mã]. Với việc `okr-*`:

- gửi với `mode: "task"`, như lượt Tác nhân: phiên không tới được người thì vượt trần sẽ thất
  bại gọn bằng `SESSION_TOKEN_LIMIT_REACHED`, không treo chờ Approve ([eve] `agent-config.md`
  §Runtime limits);
- `turn.failed` gọi `completeTask` kèm lý do, không để hết lease;
- không thử lại: số lần thử tối đa 1;
- `ketQuaTroLy` được ghi vào `AgentTask.outcome` bởi hook ở gốc nghe `action.result` của lời gọi
  `tro_ly_okr`, parse bằng `ketQuaTroLy` ngay lúc đọc. `toolResultFrom` của eve thu hẹp kết quả
  cho tool tự viết hay MCP ([eve] `guides/hooks.md` §Narrowing tool results); nó có nhận
  subagent không thì N0 đo, không thì parse thẳng bằng khuôn;
- `okr.troLyDanhSach` đọc `finishedAt` và `outcome` của hàng việc để hạ cờ `dangSoan`, và thước
  «Tỷ lệ không làm được» đọc cùng cột đó.

**Bảng (phác)**

Ba bảng cuối khối OKR, một bảng trong khối riêng của bản rẽ, các cột mới của
`OkrProgramConfig`, và một cột mới của `NotificationPreference` (bảng của bản rẽ, không phải
của hãng). Chỉ thêm, không sửa bảng nào của hãng.

```prisma
model OkrDeXuat {
  id          String    @id @default(cuid())
  taskId      String
  objectiveId String
  keyResultId String?
  loai        String
  truong      String?
  truoc       String?
  sau         String?
  sauChuan    String?
  maVanDe     String?
  dich        Json?
  lyDo        String
  trangThai   String    @default("cho")
  giaTriCuoi  String?
  inputHash   String
  nguoiYeuCau String
  nguoiQuyet  String?
  quyetLuc    DateTime?
  createdAt   DateTime  @default(now())
  @@index([objectiveId, trangThai])
  @@index([createdAt])
  @@map("okrDeXuat")
}

model OkrTomTat {
  id           String   @id @default(cuid())
  taskId       String   @unique
  cycleId      String
  departmentId String
  tuan         DateTime @db.Date
  cau          Json
  soCauBo      Int
  trangThai    String
  inputHash    String
  createdAt    DateTime @default(now())
  @@unique([cycleId, departmentId, tuan])
  @@map("okrTomTat")
}

model OkrTomTatPhanHoi {
  id        String   @id @default(cuid())
  tomTatId  String
  userId    String
  huuIch    Boolean
  luc       DateTime @default(now())
  @@unique([tomTatId, userId])
  @@map("okrTomTatPhanHoi")
}

model AiChiPhi {
  id              String   @id
  at              DateTime
  sessionId       String
  tinhNang        String
  taskId          String?
  modelId         String?
  inputTokens     Int?
  cacheReadTokens Int?
  outputTokens    Int?
  costUsd         Decimal? @db.Decimal(12, 6)
  @@index([at])
  @@index([tinhNang, at])
  @@map("aiChiPhi")
}
```

Cột thêm vào bảng có sẵn: `NotificationPreference.dongTroLyOkr Boolean @default(true)`, để
người nhận tắt được dòng báo của Trợ lý OKR mà không tắt Nhắc buổi sáng.

Hai cột Json và các cột chuỗi mang trạng thái được xử lý như sau:

- `OkrDeXuat.dich` và `OkrTomTat.cau` **luôn được parse bằng khuôn ở trên** ngay lúc đọc.
- `OkrDeXuat.trangThai` parse bằng `trangThaiDeXuat`; `aiPhamVi` parse bằng `aiPhamVi`. Theo
  `docs/api.md` §OKR, loại trong khu OKR là enum Zod trong `packages/validation` [mã].
- Parse hỏng là lỗi thật, không bị nuốt thành «không có đề xuất». Đó là luật «parse ở biên»
  của `AGENTS.md`.

Còn lại:

- `AiChiPhi.id` là `meta.id` của sự kiện `step.completed`. Hook chạy lại vẫn không ghi trùng.
- `OkrTomTat` duy nhất theo (chu kỳ, phòng ban, tuần), vì chu kỳ năm và chu kỳ quý chạy chồng
  nhau (`OkrCycle.parentId` [mã]).
- `OkrProgramConfig` thêm năm cột: `aiOn`, `aiViec` (danh sách việc được bật), `aiPhamVi`
  (`toan-cong-ty` hoặc `danh-sach`), `aiDonVi`, `aiTranThangUsd`. Khuôn `okrProgram` và
  `OKR_PROGRAM_MAC_DINH` trong `packages/validation/src/okr-chuong-trinh.ts` thêm đúng các
  trường đó.
  - Lưu là thêm một phiên bản mới, nên luôn biết mỗi tháng AI chạy theo cấu hình nào.
  - Danh sách đơn vị rỗng không bao giờ có nghĩa là «tất cả».
- `OkrDeXuat` và `OkrTomTat` **không** để lại hàng `OkrTrail` khi `apps/agent` ghi: chúng
  không phải bản ghi OKR. `docs/api.md` §OKR ghi «Every write leaves one `OkrTrail` row» [mã],
  nên 9a thêm câu nói rõ ngoại lệ này.

**Hợp đồng giữa các tầng**

| Từ → tới | Hợp đồng |
|---|---|
| Màn → API | `okr.troLySanSang()` trả `troLySanSang`. `okr.troLyDeXuat({objectiveId, keyResultId?})` trả `{ taskId }`. `okr.troLyDanhSach({objectiveId})` trả các dòng đang chờ, kèm cờ `dangSoan` và mã kết thúc của việc. `okr.troLyQuyet({deXuatId, cach, giaTri?})`. `okr.troLyTomTat({departmentId, tuan})` đọc `OkrTomTat`, chạy lại bộ kiểm với số hiện tại, lọc câu theo người xem, trả câu kèm trích dẫn |
| API → hàng việc | `AgentTriggerService.enqueue({ kind, reason: hằng, subject: [{ path: ["objectiveId"], value }], payload: okrTroLyViec, priority })`, rồi poke. Chống trùng bằng khoá tư vấn của `enqueue` (`lockIdempotencyKey`) cộng so đường dẫn trong `payload`, không bằng cột `subject` [mã]. Không bao giờ gọi HTTP sang `apps/agent` để lấy kết quả (`docs/api.md` §Intelligence never lives in the API [mã]) |
| Hàng việc → gốc | Kênh `crm` gửi với `mode: "task"`. `taskAuth(task)` gắn thêm `purpose=okr`, `okrTaskId`, `okrViec`; `reason` là hằng. Principal vẫn là `eve:app` |
| Gốc → subagent | Gọi tool `tro_ly_okr({ message })`. `message` không mang dữ liệu; subagent tự đọc theo `okrTaskId` |
| Subagent → dữ liệu | Đọc chỉ qua `lib/okr/doc.ts`. Ghi chỉ qua hai tool nộp, vào `OkrDeXuat` và `OkrTomTat`. Không ghi bảng `Okr*` nào khác |
| Subagent → gốc | Chỉ `ketQuaTroLy`. Kết quả lỗi của eve được đo ở N0 (4.1, chốt 1) |
| Kết thúc → hàng việc | Thành công: hook ở gốc ghi `ketQuaTroLy` vào `AgentTask.outcome`. Hỏng: `turn.failed` gọi `completeTask` kèm lý do. Không thử lại |
| Người → dữ liệu OKR | Chỉ qua `OkrService`, bằng biến thể nhận `tx` (4.9). `OkrTrail.note` ghi «theo đề xuất của Trợ lý OKR · `deXuatId`»; không trộn vào `after`, vì `after` là ảnh chụp trường đã đổi và màn Vết chỉ vẽ các khoá trong `KHOA_HIEN` (`apps/app/app/(app)/[slug]/okr/bang-vet.tsx` [mã]) |
| Mọi bước → chi phí | Hook gốc và hook con ghi vào `AiChiPhi`; `tinhNang` suy theo kênh trước, rồi theo purpose và loại việc (4.10) |

### 4.4 Sơ đồ khối

```mermaid
flowchart LR
  subgraph APP["apps/app · khu OKR"]
    HT["Hộp thoại Mục tiêu và KR<br/>nút «Nhờ Trợ lý OKR góp ý»"]
    DX["Danh sách đề xuất<br/>câu cũ · câu mới · Nhận / Sửa / Bác"]
    BH["Bảng họp tuần<br/>khối Tóm tắt tuần"]
    CD["Cài đặt › Chương trình OKR<br/>công tắc việc × đơn vị · trần · sổ chi phí AI"]
  end
  subgraph API["apps/api · khu okr"]
    R["okr.router · thủ tục troLy<br/>PhamViOkrMiddleware · trần theo người"]
    SV["tro-ly.service<br/>quyền sửa · công tắc · trần · inputHash<br/>nhận và sửa qua OkrService, cùng tx"]
  end
  subgraph DB["Postgres"]
    AT[("AgentTask")]
    DXT[("OkrDeXuat")]
    TT[("OkrTomTat")]
    CP[("AiChiPhi")]
    OKR[("Bảng OKR · Cập nhật tuần")]
    VET[("OkrTrail")]
  end
  subgraph AG["apps/agent · eve"]
    XEP["Việc okr-tom-tat-xep<br/>làn trực tiếp, tự đặt tuần sau bằng dueAt"]
    CRM["Kênh crm<br/>xả hàng việc · mode task"]
    GOC["Gốc · purpose okr<br/>chuyển tiếp một lần<br/>hook uỷ quyền · hook chi phí · ghi outcome"]
    SUB["Subagent tro_ly_okr<br/>model · ZDR · reasoning cố định<br/>context pack · 2 tool nộp · bộ kiểm"]
    NHAC["Nhắc buổi sáng<br/>làn trực tiếp, không model"]
  end
  GW["AI Gateway<br/>chỉ nhà cung cấp có ZDR"]
  ZS["Zalo hoặc Slack<br/>một dòng báo, số đếm do luật"]
  HT --> R --> SV --> AT
  CD --> R
  SV -. poke .-> CRM
  XEP --> AT
  AT --> CRM --> GOC --> SUB
  SUB -- "đọc chỉ bảng OKR" --> OKR
  SUB -- "ghi sau bộ kiểm" --> DXT
  SUB -- "ghi sau bộ kiểm" --> TT
  SUB --> GW
  GOC -- "mọi bước" --> CP
  SUB -- "mọi bước" --> CP
  GOC -- "mã kết thúc" --> AT
  DX -- "nhận · sửa · bác" --> R
  SV -- "OkrService có sẵn" --> OKR
  SV --> VET
  BH -- "okr.troLyTomTat" --> R
  R -- "đọc · kiểm lại · lọc theo người xem" --> TT
  TT -.-> NHAC
  NHAC --> ZS
```

### 4.5 Trình tự: viết lại khi người bấm

```mermaid
sequenceDiagram
  autonumber
  participant U as Trưởng đơn vị, hoặc quản trị với cấp OneHub
  participant A as App · hộp thoại Mục tiêu
  participant API as API · okr.troLy
  participant DB as Postgres
  participant G as Gốc · purpose okr
  participant S as Subagent tro_ly_okr
  U->>A: bấm «Nhờ Trợ lý OKR góp ý»
  A->>API: troLyDeXuat với objectiveId
  API->>DB: kiểm quyền sửa, công tắc, trần tháng, trần ngày của người bấm
  alt cùng inputHash đã có đề xuất đang chờ
    API-->>A: trả đề xuất cũ, không gọi model
  else đầu vào mới
    API->>DB: enqueue AgentTask okr-de-xuat, reason là hằng, payload không có chữ OKR
    API-->>G: poke, kênh crm xả hàng với mode task
    G->>S: gọi tro_ly_okr một lần, message không mang dữ liệu
    Note over S: session.started nạp instructions động và context pack theo okrTaskId
    S->>S: nop_de_xuat rồi bộ kiểm bằng mã, sửa khuôn tối đa một lần
    S->>DB: ghi các dòng OkrDeXuat đã qua bộ kiểm
    S-->>G: trangThai và maLoi, chỉ là mã
    G-->>DB: hook ghi outcome vào AgentTask và AiChiPhi cho mọi bước
    Note over G,DB: nếu turn.failed thì completeTask kèm lý do, không thử lại
  end
  A->>API: hỏi lại mỗi 1,5 giây, tối đa 30 giây
  alt có dòng đề xuất
    API-->>A: các dòng đang chờ
  else việc kết thúc mà không có dòng nào
    API-->>A: «Trợ lý OKR không thấy chỗ nào cần sửa»
  else việc hỏng, hoặc quá 30 giây
    API-->>A: «Trợ lý OKR chưa trả lời được, thử lại sau»
  end
  U->>A: nhận, sửa hoặc bác từng dòng
  A->>API: troLyQuyet với deXuatId, cách và giá trị
  API->>DB: cùng một tx, OkrService ghi Mục tiêu hoặc KR, OkrTrail.note mang deXuatId, OkrDeXuat đổi trạng thái có điều kiện
```

Người phụ trách một KR đi đúng đường này từ hộp thoại KR, với `keyResultId` trong việc và phạm
vi chỉ KR đó.

**Điểm cần đo.** Đường này có bốn bước model: hai bước ở agent gốc và hai bước ở subagent.
Phương án A ước 6–15 giây (suy luận). Ngưỡng đặt là p50 ≤ 8 giây và p90 ≤ 15 giây (4.9). Nếu
trượt ngưỡng, cách giảm nằm ở 4.10.

### 4.6 Trình tự: tóm tắt tuần theo phòng ban

```mermaid
sequenceDiagram
  autonumber
  participant X as Việc okr-tom-tat-xep, làn trực tiếp
  participant DB as Postgres
  participant G as Gốc · purpose okr
  participant S as Subagent tro_ly_okr
  participant N as Nhắc buổi sáng
  participant T as Trưởng phòng ban
  participant M as Màn bảng họp tuần
  participant API as API · okr.troLyTomTat
  X->>DB: tới hạn sáng hôm sau ngày cập nhật, kiểm có Cập nhật tuần, còn công tắc và trần
  X->>DB: khoá idempotency rồi ghi AgentTask okr-tom-tat-tuan, đặt việc xếp của tuần sau bằng dueAt
  DB-->>G: dispatch xả hàng qua kênh crm với mode task
  G->>S: gọi tro_ly_okr một lần
  Note over S: context pack gồm id KR, giá trị, Mức tự tin, ghi chú, cờ đáng bàn của lượt 5, chênh lệch do mã tính, không họ tên
  S->>S: nop_tom_tat với câu và nguồn từng câu
  S->>S: kiểm số, chữ chỉ chiều, id nguồn, họ tên, từ cấm, nộp lại tối đa một lần
  alt quá 30 phần trăm số câu bị bỏ
    S->>DB: OkrTomTat trạng thái cần xem, không dẫn vào nhắc
  else đạt
    S->>DB: OkrTomTat trạng thái hiện, kèm nguồn từng câu
  end
  S-->>G: chỉ trả mã
  N->>DB: giờ nhắc của Trưởng phòng ban, đọc việc cần nhắc
  N-->>T: một dòng «Tóm tắt tuần Phòng X, 3 KR đáng bàn», số đếm do luật tính
  T->>M: mở bảng họp tuần
  M->>API: okr.troLyTomTat dưới PhamViOkrMiddleware
  API->>DB: đọc OkrTomTat, chạy lại bộ kiểm với số hiện tại, lọc câu theo người xem
  API-->>M: các câu kèm trích dẫn tới lần Cập nhật tuần gốc; trang chỉ vẽ
```

Trang của `apps/app` không đọc DB: nó gọi tRPC phía máy chủ (`getServerTrpc()`,
`apps/app/app/(app)/[slug]/okr/page.tsx` [mã]). Đọc `OkrTomTat` thẳng từ trang sẽ bỏ qua
`PhamViOkrMiddleware` và `OkrAccessService`, và kéo `@crm/db` vào `apps/app`.

**Nhịp giờ**

- **Vì sao sáng hôm sau.** Ngày cập nhật của Chu kỳ mặc định là thứ Hai
  (`OkrCycle.updateWeekday @default(1)`, `packages/db/prisma/schema.prisma` [mã]), và Nhắc
  buổi sáng mặc định gửi lúc 8 giờ 30 (`NHAC.gio`, `packages/db/src/onboarding-nhac.ts` [mã]).
  - Chạy sáng hôm sau ngày cập nhật thì tóm tắt đọc được số mới nhất.
  - Chạy lúc 5 giờ sáng thứ Hai như bản A đề nghị thì tóm tắt số đã một tuần tuổi.
- **Xong trước giờ nhắc sớm nhất.** Nhắc buổi sáng gửi lúc giờ từng người đã khai
  (`CONTEXT.md` mục **Nhắc buổi sáng** [mã]), nên 8 giờ 30 chỉ là mặc định. Việc xếp tóm tắt
  tới hạn đủ sớm để tóm tắt xong trước giờ nhắc sớm nhất của các Trưởng phòng ban nhận nó;
  không kịp thì dòng báo dời sang tin của sáng hôm sau.
- **Là tham số, không là hằng.** Giờ chạy là tham số theo Chu kỳ. Lộ trình chưa ghi ngày họp
  tuần của các đơn vị.
- **Tóm tắt đọc những gì.** Mọi Cập nhật tuần ghi trong 7 ngày trước giờ chạy.

### 4.7 Phạm vi và principal

**Được gì.** Không ai đọc được qua Trợ lý OKR một thứ mà họ không đọc được trên màn, kể cả khi
việc chạy nền và gửi cho nhiều người.

| Tình huống | Phiên chạy dưới ai | Phạm vi đọc giữ bằng gì | Ai được thấy kết quả |
|---|---|---|---|
| **Tương tác**: người bấm «Nhờ Trợ lý OKR góp ý» | Luôn là `eve:app` (principal runtime, gắn qua `taskAuth` [mã]). Người yêu cầu nằm trong `payload.nguoiYeuCau`, do API ghi từ phiên đăng nhập; không do model hay máy khách ghi | **Bằng cấu trúc.** Subagent không có tool đối tác nào; nó chỉ đọc qua `lib/okr/doc.ts`, và thư viện này chỉ truy vấn bảng OKR, cây tổ chức và tên người | Người yêu cầu, và người khác sửa được Mục tiêu đó. Nút chỉ hiện với người **sửa được**, vì người không sửa được thì không có gì để nhận. Hệ quả: Mục tiêu cấp OneHub chỉ quản trị workspace sửa được (`suaDuocDonVi`, `case "onehub": return q.quanTri`, `apps/api/src/okr/okr-access.service.ts` [mã]), nên thành viên ban lãnh đạo không mang vai quản trị **không thấy nút** trên Mục tiêu cấp OneHub. «Ban lãnh đạo» cũng không phải một Đơn vị trong từ điển. Người phụ trách KR sửa được KR của mình (`assertSuaKr`), nên thấy nút trên hộp thoại KR |
| **Chạy nền**: tóm tắt tuần | `eve:app`, với phạm vi là một phòng ban | Gói chỉ chứa OKR của phòng ban đó; mỗi câu chỉ được dẫn các lần Cập nhật tuần thuộc KR của phòng ban đó | Xem hàng dưới |
| **Người nhận**: màn và dòng nhắc | — | **Lúc hiện, không phải lúc sinh.** Thủ tục `okr.troLyTomTat` (dưới `PhamViOkrMiddleware`) chỉ giữ câu nào mà mọi nguồn của câu đều hiện được với người đang xem. Kênh nhắc chỉ mang con trỏ và số đếm | Mỗi người xem một bản đã lọc riêng. Hôm nay mọi thành viên đọc được mọi OKR [07], nên bộ lọc chưa bỏ câu nào; từ lượt 8 nó thành chốt thật mà không phải sinh lại tóm tắt |
| **Vai «chỉ OKR»** | Như trên | Đi qua `okr.router` (`PhamViOkrMiddleware`, `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts` [mã]). Không chạm `/eve/v1`, không chạm `repFromCrm`. Hai lớp chặn đang có giữ nguyên, cùng hai phép đo của chúng | Như mọi người. Đường vào mới có phép đo riêng, theo AC «một phép đo cho mỗi đường vào» của lượt 2 |
| **Lượt 10: chat** | Người hỏi | Chọn ở Cổng 1.5 của lượt 10 (6.3), dựa trên kết quả phép thử stub | Người hỏi |

**Năm chỗ phải nói rõ**

1. **Gốc vẫn cầm 26 tool đối tác** (09 G11). Có ba lớp chặn:
   - `instructions` nhánh `okr` chỉ cho làm một việc;
   - hook `okr-uy-quyen` ném lỗi khi gốc gọi bất cứ tool nào khác `tro_ly_okr`, hoặc gọi lần
     thứ hai. Khuôn này có tiền lệ ở `apps/agent/agent/hooks/builder-delegation.ts` [mã];
     eve biến lỗi ném trong hook thành `turn.failed` ([eve] `guides/hooks.md`);
   - subagent **không dùng `message` của gốc làm dữ liệu**. Gốc có nhét gì vào `message` thì
     thứ đó cũng không vào context pack.

   Cộng thêm một điều: gốc không bao giờ đọc chữ OKR, nên chữ chèn vào tên một KR không dụ
   được gốc. Điều này chỉ đúng khi ba đường chữ về gốc đều đóng: cột `reason`, câu `brief`, và
   kết quả lỗi của subagent (4.1, chốt 1).
2. **`tro_ly_okr` hiện trong mọi phiên gốc.** eve hạ mọi subagent thành một tool thấy được
   ([eve] `subagents.mdx`). Vì vậy:
   - ở phiên thuộc purpose khác, hook chặn lời gọi `tro_ly_okr`;
   - tool nộp tự từ chối khi thiếu `purpose=okr` hay `okrTaskId`, hoặc khi hàng việc đó không
     ở trạng thái đang chạy.
3. **Subagent có đọc được thuộc tính của phiên cha không?**
   - Kho đang dựa vào việc này: `agent_runner` đọc `runId` qua thuộc tính phiên [mã].
   - Tài liệu eve lại ghi `auth.current` và `auth.initiator` có thể `null` «trên đường nội bộ,
     subagent chẳng hạn» ([eve] `guides/auth-and-route-protection.md`).
   - Vì vậy đây là một phép đo ở N0 (6.3). Nếu không đọc được thì có lối lùi: gốc chuyển
     `okrTaskId` trong `message` (chỉ một id, gốc lấy từ `brief`), và subagent kiểm lại bằng
     chính hàng việc: đúng loại `okr-*`, đang chạy, chưa có kết quả.
4. **Thủ tục `okr.*` cũng lộ ra REST** (`restMeta` trong `apps/api/src/okr/okr.router.ts`
   [mã]). Nghĩa là khoá API của một người cũng thành một đường gọi Trợ lý OKR. #152 (gộp 26/09)
   xác nhận khoá API chạy với rate limit tắt [git], nên trần theo người ở router là **bắt
   buộc**, không chỉ là lớp thêm.
5. **Chữ tự do có tên đối tác.**
   - Ghi chú, bình luận và tên KR có thể chứa tên đối tác do người gõ.
   - Đó là dữ liệu OKR mà vai «chỉ OKR» vốn đã đọc được trên màn [07]; Trợ lý OKR không đọc
     thêm gì phía sau.
   - Những chữ này vẫn vào context pack, và vì vậy chỉ được gửi tới nhà cung cấp có ZDR. Đây
     không còn là mặc định có veto: dữ liệu đã gửi thì không lấy lại được, nên câu này đã gộp
     vào quyết định chính (mục 0, 9.1).

**Từ lượt 8, «mức hiển thị giới hạn» thêm hai luật**

- **Hàm đọc phải đọc lại vai và mức hiển thị ở mỗi lần đọc.** Nó không tin bản chụp trong
  payload. Vị từ hiển thị đặt ở `packages/validation`, để API và `apps/agent` dùng chung một hàm.
- **Gói của một bản tóm tắt dùng chung chỉ chứa thứ mà mọi người nhận đều đọc được.** Nếu
  không được vậy thì chia gói theo tầng hiển thị.
  - Lý do: lọc theo nguồn không chặn được một câu dẫn KR Y mà mang ý của KR X bị ẩn.
  - Bộ kiểm số chỉ chặn con số, không chặn chữ (giám khảo rủi ro, suy luận).

### 4.8 Knowledge: bây giờ và sau này

**Được gì.** Trợ lý OKR nói đúng luật chơi OKR của OneHub, dùng đúng chữ của công ty, và không
bao giờ tự tính một con số.

**Bây giờ, ở lượt 9:** context pack có cấu trúc, **đẩy vào `instructions`, không kéo bằng tool**.

| Lớp | Nội dung | Nguồn | Vào ngữ cảnh thế nào |
|---|---|---|---|
| Luật và phương pháp | KR đo kết quả, không đo việc làm; «hỏi, không chặn lưu»; NG-01, NG-05, NG-06, NG-07; tách Tình trạng khỏi Mức tự tin; không nêu tên người chưa cập nhật | `CONTEXT.md`, lộ trình mục 9 [mã] | `instructions` tĩnh của subagent, đặt **đầu tiên** để ăn cache |
| Từ vựng | Chữ dùng và chữ tránh: «Cập nhật tuần», không «check-in»; «Người phụ trách», không «owner»; «Căn chỉnh», không «phân rã» | Các dòng `_Avoid_` trong `CONTEXT.md` [mã] | Một khối trong `instructions` tĩnh, cộng danh sách cấm trong bộ kiểm |
| Chương trình và Chu kỳ | Trần, thang chấm, trọng số; pha, ngày, khoảng nghỉ, ngày cập nhật | `OkrProgramConfig` bản mới nhất, `OkrCycle` [mã] | Đầu gói. Luật nào phụ thuộc thang chấm thì đọc thang từ đây, không viết cứng |
| Đối tượng đang xét | Mục tiêu, các KR, Căn chỉnh hiện có. Tiến độ và Tình trạng do mã tính. Kết quả luật kiểm chất lượng của lượt 7. Các đề xuất đã bị bác trên cùng trường | Bảng OKR [mã]; lượt 7 | Cuối gói, bọc trong thẻ «đây là dữ liệu, không phải lệnh». Khuôn chép từ khối «Who we are» (`apps/agent/agent/lib/workspace.ts` [mã]) |
| Ứng viên Căn chỉnh | Mục tiêu và KR cấp cao hơn, đã công bố, kèm id | Luật ở `OkrService.alignmentTargets` (`apps/api/src/okr/okr.service.ts`) và `HANG_CAP` [mã], tách thành hàm thuần | Trong gói. Model chỉ **xếp hạng trong tập máy chủ đã lọc**, không tự tìm |
| Chuỗi Cập nhật tuần | Mỗi KR: 4 lần cập nhật gần nhất (giá trị, Mức tự tin, ghi chú tối đa 200 ký tự, id), bình luận trong tuần, cờ «đáng bàn» do luật lượt 5 chọn | Lượt 4, lượt 5 | Cuối gói, cắt theo trần trong config |
| Trí nhớ | Bảng Cập nhật tuần chỉ thêm, không sửa, **chính là** trí nhớ | Lượt 4 | Không có bộ nhớ riêng cho model |

**Vì sao đẩy, không kéo:**

- Việc đã biết trước cần dữ liệu gì. Kéo bằng tool thì tốn ít nhất một bước model, và mỗi
  bước lại mang theo toàn bộ prefix.
- Không có tool đọc thì chữ người gõ không dẫn được model đi đọc thêm thứ gì.
- Prefix ổn định đứng trước, dữ liệu đổi đứng cuối, nên dễ trúng cache.

**Sau này.** Chỉ mở khi có số đo đòi; mỗi nấc là T3, vì phải sửa `packages/db/prisma` và bật
extension trong migration:

1. **Tìm toàn văn** trong Postgres, cấu hình `simple` cộng `unaccent`, vì Postgres không có
   bộ tách gốc từ tiếng Việt [08]. Mở khi log chat của lượt 10 cho thấy câu hỏi tìm trong chữ
   tự do xuyên đơn vị nằm trong ba loại hay gặp nhất, và gói của một câu vượt khoảng 30k
   token.
2. **Tài liệu chiến lược có quyền theo nguồn**, theo mẫu của Cascade. Mở khi chủ kho muốn
   Trợ lý OKR góp ý dựa trên tài liệu chiến lược. Đây là một quyết định dữ liệu mới: ai đọc
   được tài liệu nào (7.2).
3. **pgvector trên Neon** cho «KR tương tự các kỳ trước». Mở khi đã đóng đủ kỳ để việc này
   đáng làm; sớm nhất là sau khi quý 1 đóng.

Riêng **phương pháp OKR cho chat** ở lượt 10 là một skill tĩnh. Skill tĩnh không cần sandbox;
skill động thì cần ([eve] `skills.mdx`).

### 4.9 Người duyệt, dấu vết, đo nhận · sửa · bác

**Được gì.** Không có chữ nào của máy lọt vào OKR mà không có người bấm. Chủ kho biết Trợ lý
OKR có ăn thua không bằng con số, không bằng cảm giác.

**Bậc can thiệp**

| Bậc | Dùng cho | Máy làm | Người làm |
|---|---|---|---|
| Đề xuất rồi nhận | Viết lại tên Mục tiêu, «vì sao lúc này», tên KR; đề xuất Căn chỉnh | Hiện câu cũ cạnh câu mới, kèm một dòng lý do | Nhận, sửa rồi nhận, hoặc bác, **từng dòng** |
| Hỏi | Kiểm chất lượng bằng model, chạy **sau** lớp luật của lượt 7 | Một câu hỏi gắn đúng KR hay Mục tiêu | Tự sửa, hoặc bỏ qua. **Không chặn lưu**. Dòng `hoi` có hai trạng thái riêng: `da-sua-theo` khi trường liên quan đổi trong 7 ngày (đọc từ `OkrTrail`), `bo-qua` khi người bấm bỏ qua hoặc hết 7 ngày, để luật đếm nhận · sửa · bác áp được cho loại dòng này |
| Báo | Tóm tắt tuần; dòng xu hướng cạnh ô đích (DO-06, do mã tính) | Câu đã kiểm số, câu nào cũng dẫn nguồn | Đọc, bấm vào lần cập nhật gốc |
| Tự chạy | **Không có**, với mọi dữ liệu OKR | — | — |

**Luật của sổ đề xuất**

| Luật | Thực thi ở đâu |
|---|---|
| Bác rồi không mời lại | Tool nộp từ chối ngay ở đường ghi, theo tiền lệ `apps/agent/agent/lib/facts.ts` [mã]. Khoá chặn **không** phải câu đã chuẩn hoá, vì model viết lại khác mỗi lần bấm. Khoá theo loại dòng: `viet-lai` khoá (Mục tiêu, KR, trường), cho tới khi chính người dùng sửa trường đó; `hoi` khoá (Mục tiêu, KR, `maVanDe`); `can-chinh` khoá (Mục tiêu, đích) |
| Không mời trùng lúc đang chờ | Cùng câu `sau` đang chờ thì không ghi dòng thứ hai |
| Đề xuất cũ tự hết hạn | `truoc` khác giá trị hiện tại thì dòng thành `het-han` và không hiện nữa |
| Nhận thì ghi qua đường có quyền | Hôm nay `updateObjective`, `updateKeyResult`, `addAlignment` mỗi hàm tự mở `this.db.$transaction(...)` và không nhận `tx`; Prisma không lồng giao dịch tương tác [mã]. Vì vậy 9b tách thân ba hàm đó thành `…Trong(tx, …)`, hàm cũ gọi lại hàm mới. `troLyQuyet` gọi biến thể nhận `tx`, rồi đổi `OkrDeXuat.trangThai` bằng cập nhật có điều kiện `trangThai = 'cho'` trong cùng `tx`. Nhờ vậy vẫn kiểm quyền sửa, khoá pha, trần số mục, và ghi đúng một hàng `OkrTrail`. Đây là sửa trong `apps/api/src/okr`, tính vào phạm vi 9b |
| Chỉ quyết một lần | Dòng đã khác trạng thái `cho` thì không quyết lại được; muốn sửa tiếp thì sửa bình thường trên màn |

**Nhãn tác giả**

- **Dòng đề xuất** mang nhãn «Trợ lý OKR».
- **Sửa đã nhận là sửa của người.**
  - `actorUserId` là người bấm. Nguồn ghi vào cột `note` sẵn có của `OkrTrail`: «theo đề xuất
    của Trợ lý OKR · `deXuatId`». Không trộn vào `after`, vì màn Vết chỉ vẽ các khoá trong
    `KHOA_HIEN` [mã], nên một khoá `nguon` sẽ không tự hiện.
  - Tab «Vết» đọc `note` và hiện «Sửa tên — theo đề xuất của Trợ lý OKR».
  - `HANH_DONG_VET` không cần thêm hành động nào (13 hành động hiện có [mã]).
- **Tóm tắt** mở đầu bằng dòng «Trợ lý OKR tóm tắt từ N lần cập nhật». Câu nào cũng có trích
  dẫn bấm được.
- **Không có Cập nhật tuần nào mang tên máy.** Đây là chỗ khác Tability (09 G1).

**Thước đo.** Đo bằng thước SQL trên bảng, đặt ở `_acceptance/<slug>/rang/` như kho đang
làm; không đo qua PostHog của hãng [08].

| Thước | Định nghĩa | Dùng cho |
|---|---|---|
| Tỷ lệ nhận nguyên văn; sửa rồi nhận; bác | Chia theo loại dòng, theo tuần | Chất lượng đề xuất |
| Tỷ lệ hoàn tác | Đề xuất đã nhận mà trong 7 ngày trường đó quay về `truoc`, đọc từ `OkrTrail` | **Tín hiệu xấu nhất** |
| Tỷ lệ câu bị bỏ | `soCauBo` trên tổng số câu của tóm tắt | Model bịa số |
| Tỷ lệ «không làm được» | Việc có `AgentTask.outcome` là `khong-lam-duoc` hoặc hỏng, trên tổng số việc (4.3, «Việc hỏng đóng thế nào») | Context pack thiếu, hoặc `instructions` sai |
| Độ trễ nút bấm | Từ lúc ghi `AgentTask` tới lúc có `OkrDeXuat`; lấy p50 và p90 | Có giữ được đường hàng việc cho nút bấm không |
| Chi phí mỗi đề xuất được nhận | Chi tiêu tháng chia cho (nhận + sửa) | Cổng Giá trị |
| **Độ phủ** | Phần trăm Mục tiêu quý 1 có người bấm «Nhờ Trợ lý OKR góp ý» | Người dùng có thật sự dùng không |
| **Tóm tắt được mở** | Lượt mở qua dòng nhắc (tham số `tu=nhac`, như lượt 4 dự định đo; tham số này chưa có trên `onehub` [cây]) chia cho số người nhận; cộng tỷ lệ «hữu ích» từ bảng `OkrTomTatPhanHoi` | Tóm tắt có ai đọc không |
| **Nhịp tuần còn khoẻ** | Trung vị thời gian một lần Cập nhật tuần, trước và sau khi bật Trợ lý OKR; tỷ lệ người tắt Nhắc buổi sáng, và tỷ lệ tắt dòng báo của Trợ lý OKR (`NotificationPreference.dongTroLyOkr`) | Bài học Viva Goals |

**Người dùng thấy gì.** Lộ trình buộc mọi màn có trạng thái rỗng, đang tải và lỗi (lộ trình
§2). Mọi chữ dưới đây mang đủ tên «Trợ lý OKR».

| Tình huống | Người dùng thấy |
|---|---|
| Thiếu khoá mô hình, chưa nối tác tử, hoặc hết budget của Gateway (`chua-co-khoa-mo-hinh`, `chua-noi-tac-tu`, `het-tran-gateway`) | Nút biến mất. Quản trị thấy lý do ở Cài đặt › Chương trình OKR |
| Công tắc tắt, việc tắt, đơn vị chưa bật (`tat`, `viec-tat`, `don-vi-chua-bat`) | Nút không hiện. Trưởng đơn vị thấy một dòng ở Cài đặt: «Trợ lý OKR chưa bật cho đơn vị này» |
| Hết trần tháng (`het-tran-thang`) | Nút còn nhưng mờ, kèm câu «Trợ lý OKR tạm nghỉ tới 01/MM» |
| Hết trần ngày của người bấm (`het-tran-ngay`) | Nút còn nhưng mờ, kèm câu «Đã dùng hết lượt hôm nay» |
| Đang soạn | `Shimmer` trên danh sách đề xuất; hỏi lại mỗi 1,5 giây, **tối đa 30 giây** |
| Chờ quá 30 giây, việc hỏng, hoặc `khong-lam-duoc` | «Trợ lý OKR chưa trả lời được, thử lại sau» |
| Việc xong mà không có dòng nào (câu đã tốt) | «Trợ lý OKR không thấy chỗ nào cần sửa» |
| Đề xuất tự hết hạn vì người đã sửa câu | Dòng biến mất khỏi danh sách; không có thông báo |
| Tóm tắt ở trạng thái «cần xem» | Không hiện ở bảng họp tuần, không dẫn vào nhắc. Chỉ quản trị chương trình thấy, ở màn sức khoẻ chương trình của lượt 5 |
| Tuần không có Cập nhật tuần nào | Không có tóm tắt; khối tóm tắt ghi «Tuần này chưa có Cập nhật tuần nào» |
| Mọi câu bị lọc theo người xem | Khối tóm tắt ghi «Không có câu nào bạn xem được trong tóm tắt tuần này» |

**Ngưỡng gợi ý cho Cổng Giá trị.** Chủ kho khai ở Cổng Đáng lượt 9, trước khi thấy số; máy
không tự đặt. Mốc để bàn:

- nhận (nguyên văn cộng sửa) ≥ 40%;
- câu bị bỏ ≤ 10%;
- hoàn tác ≤ 5%;
- p50 ≤ 8 giây, p90 ≤ 15 giây;
- trung vị thời gian Cập nhật tuần không tăng;
- tỷ lệ tắt nhắc không tăng.

### 4.10 Chi phí

**Được gì.** Chủ kho đặt một con số và nó được giữ bằng mã:

- chạm trần thì nút mờ kèm lý do, chứ không gãy bằng lỗi (4.9, «Người dùng thấy gì»);
- quản trị được báo trước khi chạm trần;
- lần đầu tiên có số thật về $20 đang đi đâu.

**Sổ.** Bảng `AiChiPhi`, mỗi bước model một hàng.

- **Hook ở gốc.** Tệp mới `apps/agent/agent/hooks/so-chi-phi.ts` nghe `step.completed` ở mọi
  purpose; nó **không sửa** `hooks/audit.ts`, tệp bản rẽ chưa từng động tới [git]. `tinhNang`
  là một enum trong `packages/validation`, suy theo **kênh trước**, rồi mới theo purpose:
  - kênh `eve` (hội thoại tab Agent qua cầu nối) → `crm.hoi-dap`. Phiên này không mang
    `purpose`, nên rơi về `research` (`session-purpose.ts`, `.catch("research")` [mã]); suy
    theo purpose trước thì nó bị tính nhầm là nghiên cứu;
  - kênh `crm`, purpose `research` → `crm.nghien-cuu`;
  - `builder` → `crm.dung-tac-nhan`;
  - `team-agent` → `crm.tac-nhan`;
  - `okr` → `okr.chuyen-tiep`.
- **Hook trong subagent.** Ghi `okr.de-xuat` hoặc `okr.tom-tat`. Hook này **bắt buộc**, vì
  hook của gốc không chạy trong lượt của subagent ([eve] `guides/hooks.md`).
- **Hai phiên con của hãng vẫn mù.** `agent_builder` và `agent_runner` chưa được ghi.
  - Phần sửa (thêm hook trong hai subagent đó) là việc tổng quát, gửi lên hãng.
  - Cùng phần sửa đó cũng chữa luôn `AgentRun.costUsd`, hôm nay nhiều khả năng đang đếm thiếu.
- **Hook chỉ ghi số đo, không ghi chữ OKR** vào bảng nào của hãng.
- **Đối soát tự động mỗi tháng.** Một thước so tổng `AiChiPhi` với Custom Reporting của
  Gateway; lệch quá ±10% thì báo một dòng vào Nhắc buổi sáng của quản trị. Hook bọc lỗi rồi chỉ
  cảnh báo, như `audit.ts` đang làm [mã], nên có thể đếm thiếu mà không ai hay; đối soát là chỗ
  bắt được chuyện đó. Chủ kho không phải đối soát tay.

**Trần**

| Trần | Mặc định (chủ kho chốt) | Kiểm ở đâu | Chạm trần thì sao |
|---|---|---|---|
| Công tắc tổng, công tắc việc, danh sách đơn vị | Tắt | `troLyOkrSanSang()`, ở API và ở việc xếp tóm tắt | Nút không hiện; tóm tắt không xếp |
| Trần tháng khu OKR | **$8** | Như trên, **trước** khi xếp việc; `apps/agent` kiểm lại trước khi gửi, vì hàng có thể phải đợi | Nút mờ kèm «Trợ lý OKR tạm nghỉ tới 01/MM»; quản trị thấy lý do ở Cài đặt |
| Thứ tự nhường khi tiền sắp hết | **Theo pha của Chu kỳ.** Chu kỳ đang ở pha đặt OKR: đề xuất được ưu tiên, tóm tắt tạm nghỉ trước. Pha khác: phần còn lại của trần không đủ cho số tóm tắt dự kiến tới hết tháng thì đề xuất tạm nghỉ trước. Tham số trong `TRO_LY_OKR` | Cùng hàm | Việc bị nhường tạm nghỉ; việc được ưu tiên vẫn chạy |
| Trần theo người | 10 lượt đề xuất mỗi người mỗi ngày | Ở router, nên khoá API cũng phải chịu (khoá API chạy với rate limit tắt, #152) | Nút mờ kèm «Đã dùng hết lượt hôm nay» |
| Trần mỗi phiên con | Khoảng 40k token vào, 4k token ra | `limits` của subagent. Phiên con nhận một phần hạn mức còn lại của cha; giới hạn tự viết chỉ áp khi chặt hơn ([eve] `agent-config.md` §Runtime limits) | Việc `okr-*` gửi với `mode: "task"`, nên phiên vượt trần thất bại gọn bằng `SESSION_TOKEN_LIMIT_REACHED`; `turn.failed` đóng việc kèm lý do, không thử lại (4.3). N0 chỉ xác nhận hành vi này |
| Báo quản trị | Ở 80% và 100% | Một dòng trong Nhắc buổi sáng của quản trị chương trình | — |
| Lưới cuối | Budget của Gateway theo project; trả `402` khi vượt | Việc đánh `het-tran-gateway` | Nút ẩn, không thử lại |

Trần $8 chỉ đếm tiền của khu OKR trên production. Eval, phép đo N0 và các phiên dev không vào
$8, nhưng vẫn tiêu vào $20 của team, vì trần của khoá local đi theo ngân sách team.

**Thiếu khoá thì năng lực biến mất một cách chủ động**

- `apps/agent/agent/lib/capabilities.ts` [mã] thêm một mục «Mô hình AI»: có khoá Gateway hoặc
  có OIDC. Thiếu cả hai thì `apps/agent` đóng mọi việc `okr-*` ngay, với lý do
  `chua-co-khoa-mo-hinh`, không mở phiên.
- Khi quản trị bật công tắc, API xếp một việc `okr-kiem-san-sang` ở làn trực tiếp, không gọi
  model. Nhờ vậy màn Cài đặt biết trước «Trợ lý OKR sẵn sàng» hay «chưa có khoá mô hình», và
  người dùng đầu tiên không phải gặp một lượt hỏng.
- API tự biết «chưa nối tác tử» qua `AgentTriggerService.canReachAgent()`, hàm đã có sẵn
  (`apps/api/src/agent/agent-trigger.service.ts` [mã]).

**Gom việc, cache, model**

- **Gom việc.**
  - Một phiên cho **cả một Mục tiêu**: tên, «vì sao lúc này», mọi KR, Căn chỉnh.
  - Một phiên cho mỗi phòng ban mỗi tuần.
  - Tóm tắt cấp bộ phận (sau R3) gộp từ các bản đã kiểm của phòng ban, không đọc lại Cập nhật
    tuần gốc.
- **Cache.** `instructions` tĩnh và quy trình giữ nguyên từng byte; context pack đứng cuối.
  - Cả ba phương án đều giả định có cache. Nhưng chưa ai kiểm cache ngầm có còn trên đường
    ZDR không.
  - Đo `cacheReadTokens` trên hai lời gọi cùng prefix, có cờ ZDR, là việc của N0.
- **Model.** Subagent dùng cố định `google/gemini-3.7-flash`, kèm `reasoning` thấp (mức cụ
  thể do N0 và eval chọn). Agent gốc giữ model của `AppSetting.agentModelId`, trống thì là
  `zai/glm-5.2-fast`.
- **Ba nấc giảm, theo thứ tự đảo được, khi số đo xấu:**
  1. Nếu bước chuyển tiếp ở agent gốc đã trúng cache thì không làm gì.
  2. Chọn model rẻ và nhanh cho agent gốc khi purpose là `okr`. Việc này an toàn về dữ liệu,
     vì gốc không bao giờ thấy chữ OKR. Nó chạm `lib/model.ts` của hãng, nên chỉ làm khi số đo
     buộc; «model theo purpose» là phần tổng quát nên gửi lên hãng.
  3. Bỏ hẳn bước chuyển tiếp ở agent gốc bằng đường của lượt 10: eve app riêng, hoặc stub nếu
     phép thử qua.

**Ước lượng có tham số** (suy luận; phải thay bằng số đo ở N0 và tuần đầu của lượt 9b)

Giả định token cho một việc:

| Bước | Đề xuất cho một Mục tiêu | Tóm tắt một phòng ban |
|---|---|---|
| Agent gốc: 2 bước × prefix khoảng 8k (khoảng có thể 6–10k) | 16k vào, 0,15k ra | 16k vào, 0,15k ra |
| Subagent: 2 bước (`instructions` khoảng 2k cộng context pack) | 11k vào, 0,85k ra | 13k vào, 0,95k ra |
| **Cộng** | **27k vào, 1,0k ra** | **29k vào, 1,1k ra** |

Bước chuyển tiếp ở agent gốc chiếm 16k/27k ≈ 59% đầu vào của một đề xuất, và 16k/29k ≈ 55% của
một tóm tắt.

**Giá.** gemini-3.7-flash: $0,75 mỗi 1M token vào, $0,075 mỗi 1M token đọc cache, $3,75 mỗi 1M
token ra [08]. Hai giả định cần nói rõ:

- **Giá của agent gốc.** Bảng tính agent gốc theo giá gemini-3.7-flash để có một con số. Giá
  thật là giá của model đang đặt trong `AppSetting` (mặc định `zai/glm-5.2-fast`); N0 đo con số
  thật.
- **Nấc 2.** «Model rẻ» cho agent gốc được giả định có giá bằng **một nửa** gemini-3.7-flash ở
  cả ba hạng ($0,375 vào, $0,0375 đọc cache, $1,875 ra). Chưa chọn model cụ thể.

60% trúng cache nghĩa là giá vào bình quân 0,4 × $0,75 + 0,6 × $0,075 = $0,345 mỗi 1M token.

| Kịch bản | Đề xuất (c_dx) | Tóm tắt (c_tt) |
|---|---|---|
| Không trúng cache | 27k × $0,75/M + 1,0k × $3,75/M = $0,02025 + $0,00375 = **$0,024** | 29k × $0,75/M + 1,1k × $3,75/M = $0,02175 + $0,00413 = **$0,026** |
| 60% đầu vào trúng cache | 27k × $0,345/M + $0,00375 = $0,00932 + $0,00375 = **$0,013** | 29k × $0,345/M + $0,00413 = $0,01001 + $0,00413 = **$0,014** |
| 60% trúng cache, agent gốc dùng model rẻ (nấc 2) | subagent $0,00698 + agent gốc $0,00608 / 2 = $0,00698 + $0,00304 = **$0,010** | subagent $0,00805 + agent gốc $0,00304 = **$0,011** |
| Rủi ro nếu không khoá `reasoning`: thêm khoảng 1.500 reasoning tokens ra ở mỗi bước con | 2 × 1.500 × $3,75/M = cộng **$0,011** | cộng **$0,011** |

Trong đó phần agent gốc có 60% cache là 16k × $0,345/M + 0,15k × $3,75/M = $0,00552 + $0,00056
= $0,00608; phần subagent đề xuất là 11k × $0,345/M + 0,85k × $3,75/M = $0,00380 + $0,00319 =
$0,00698; phần subagent tóm tắt là 13k × $0,345/M + 0,95k × $3,75/M = $0,00449 + $0,00356 =
$0,00805.

Công thức tháng:

```
C_thang = G × c_dx  +  T × c_tt  +  L × c_dx  (+ H × c_hd khi có chat ở lượt 10)

T = M × 4,3 × f          số bản tóm tắt trong tháng
G = M × O × p            số lượt đề xuất trong tháng đặt OKR; các tháng khác ≈ 20% con số đó
M = số phòng ban · O = số Mục tiêu mỗi phòng ban · p = số lần bấm mỗi Mục tiêu
f = tỷ lệ phòng ban có Cập nhật tuần trong tuần (giả định 0,8)
L = số Mục tiêu có nháp «điều học được» (≈ M × O, chỉ ở tháng đóng kỳ, từ khi việc đó mở)
H = số câu chat trong tháng · c_hd ≈ $0,012–0,022 mỗi câu [10-B]
N (số người) chỉ vào qua G, H và trần theo người; chi phí không tỷ lệ thẳng với N
Ngoài trần $8, trong $20: E = eval và phiên dev. Một lượt chạy khoảng 40 golden cases không
cache ≈ 40 × $0,024 = $0,96, chưa kể judge (suy luận)
```

Với O = 3 Mục tiêu mỗi phòng ban cho cả ba kịch bản, p là 3,3 · 4,2 · 6,25 lần bấm mỗi Mục
tiêu. p tăng theo cỡ là cố ý, để kịch bản lớn làm cận trên xấu; chưa có số đo nào cho p.

| Kịch bản | M | T | G tháng đặt OKR · tháng thường | Tháng đặt OKR: nấc 2 · 60% cache · không cache | Tháng thường: nấc 2 · 60% cache · không cache |
|---|---|---|---|---|---|
| Nhỏ | 15 | 51,6 | 150 · 30 | $2,07 · $2,67 · $4,94 | $0,87 · $1,11 · $2,06 |
| Vừa | 40 | 137,6 | 500 · 100 | **$6,51 · $8,43 · $15,58** | $2,51 · $3,23 · $5,98 |
| Lớn | 80 | 275,2 | 1.500 · 300 | $18,03 · $23,35 · $43,16 | $6,03 · $7,75 · $14,36 |
| Chat ở lượt 10, 150 người × 4 câu mỗi tháng | — | — | — | cộng 600 × $0,012–0,022 = $7,2–13,2 | cộng $7,2–13,2 |

Kiểm một ô, kịch bản vừa, tháng đặt OKR, 60% cache: 500 × $0,013 + 137,6 × $0,014 = $6,50 +
$1,93 = $8,43. Chưa cộng L: nếu nháp «điều học được» chạy cùng tháng thì cộng thêm 120 × $0,010–0,024
= $1,20–2,88.

**Đọc bảng**

- **Rủi ro chi phí nằm ở đề xuất trong mùa đặt OKR**, không nằm ở tóm tắt, đúng như 09 cảnh
  báo.
  - Mùa quý 1 (21/12 → 11/01) trải qua hai tháng lịch, nên đỉnh mỗi tháng thấp hơn bảng.
  - **Kịch bản vừa vượt $8 ngay cả khi 60% trúng cache** ($8,43), nếu chưa làm nấc 2. $8 chỉ đủ
    khi có thêm nấc 2 ($6,51), hoặc khi ít nhất 33 trong 500 lượt được dùng lại theo `inputHash`
    ((8 − 1,93) / 0,013 = 467 lượt).
  - **Đề xuất còn chạy được bao nhiêu lượt dưới $8**, nếu vẫn giữ chỗ cho 137,6 bản tóm tắt:
    không cache (8 − 3,58) / 0,024 = **184**; 60% cache (8 − 1,93) / 0,013 = **467**; nấc 2
    (8 − 1,51) / 0,010 = **648**. Với khoảng 120 Mục tiêu, 184 lượt là khoảng 1,5 lần bấm cho
    mỗi Mục tiêu trong cả tháng.
  - Trong pha đặt OKR, luật nhường mới cho đề xuất đi trước tóm tắt. Nếu tóm tắt nghỉ hẳn thì
    trần cho tối đa 8 / 0,024 = 333, 8 / 0,013 = 615, hoặc 8 / 0,010 = 800 lượt.
  - Lúc chạm 80%, quản trị được báo, và câu hỏi cho chủ kho là: nâng trần, hay làm nấc 2.
- **Bước chuyển tiếp ở agent gốc chiếm khoảng 55–60% đầu vào** của mỗi lượt. Đây là chỗ đo
  đầu tiên.
- **Chat ở lượt 10 cần trần riêng**, và trần câu theo người mỗi ngày là bắt buộc.
  - Phiên chat có người mà vượt trần token thì eve hỏi Approve hoặc Stop; Approve mở một cửa
    sổ ngân sách mới ([eve] `agent-config.md` §Runtime limits).
  - Nghĩa là người dùng tự mở thêm ngân sách được, nên trần phải nằm ở tầng app.
- **Làn `research` đã có một số đo:** khoảng $0,19 mỗi phiên `workspace-profile` [08]. Chưa có
  tổng tháng; N0 cộng phần này bằng một truy vấn chỉ-đọc, từ 9a thì sổ chung đo liên tục. Chưa
  chặn làn `research` ở lượt 9.
- **Số người và số đơn vị dùng OKR vẫn chưa biết** (09 G17). Máy soạn sẵn truy vấn đếm trên
  `org.tree`; chủ kho chạy trên production sau 23/10.

### 4.11 Chất lượng và eval

**Được gì.** Câu nào có số sai thì không tới tay người, và mọi thay đổi về `instructions` hay
model đều có một bộ golden cases tiếng Việt chặn lại.

**Bộ kiểm lúc chạy.** Một hàm thuần, chạy trong tool nộp trước khi ghi, và chạy lại lúc hiện.

| Kiểm | Áp cho | Cách |
|---|---|---|
| Khuôn | Mọi đầu ra | `safeParse`. Hỏng thì trả lý do để model sửa **một lần**; hỏng lần nữa thì việc kết thúc `khong-lam-duoc` |
| Id thuộc gói | Mọi dòng và câu | Mục tiêu, KR, đích Căn chỉnh, id nguồn đều phải có trong gói. Ngoài gói thì bỏ |
| Số khớp nguồn | Câu tóm tắt | Rút mọi con số và chuẩn hoá bằng `docSoOkr` (dấu phẩy thập phân kiểu Việt, `packages/validation/src/okr-kr.ts` [mã]). Số phải bằng một giá trị trong các lần cập nhật được dẫn, hoặc một số dẫn xuất mã đã tính sẵn trong gói. Lệch thì bỏ câu |
| Không số mới | Câu viết lại | Mọi con số trong `sau` phải đã có trong `truoc`, hoặc trong ô số của chính KR đó |
| **Chữ chỉ chiều** | Câu tóm tắt | «tăng», «giảm», «tụt», «vượt» phải cùng dấu với chênh lệch mã đã tính cho KR được dẫn |
| Còn tươi, không mời lại | Đề xuất | Như 4.9 |
| Từ cấm | Mọi chữ | Chữ tránh lấy từ `_Avoid_` của `CONTEXT.md`, cộng danh sách NG-01, NG-02, NG-07 (lương, thưởng, xếp loại, xếp hạng, đánh giá nhân viên…) đặt trong config. Chỉ áp cho chữ **không** có sẵn trong đầu vào |
| **Họ tên** | Câu tóm tắt | Câu chứa họ tên đầy đủ của một thành viên, so không dấu, thì bỏ. Không so tên riêng một mình |
| Độ dài | Mọi chữ | Trần ký tự trong khuôn |
| **Giữ lại** | Tóm tắt | Quá 30% câu bị bỏ thì tóm tắt ở trạng thái «cần xem», không dẫn vào nhắc |

**Eval offline** (`apps/agent/evals/okr/`)

| Bộ | Chấm bằng | Ngưỡng |
|---|---|---|
| Cách ly, tĩnh | Test thường trong `bun run test`, gồm: danh sách tool của `tro_ly_okr` đúng bằng tập đã khai; purpose `okr` được nhận ra và không rơi về `research`; không có lời gọi ghi nào lên model `okr*` ngoài hai bảng đầu ra; `lib/okr/doc.ts` chỉ chạm danh sách model cho phép; **ZDR và `reasoning` nằm ở cấp agent của subagent**; `ketQuaTroLy` không có trường chữ; mọi hàng `okr-*` do `tro-ly.service.ts` và `lib/okr/lich.ts` ghi có `reason` thuộc tập hằng; nhánh `okr` của `instructions/task.ts` đứng trước nhánh nghiên cứu và không gọi `sessionPreamble`; **mọi `defineEval` có judge khai `judge.modelOptions.providerOptions` với ZDR, và model judge có trong danh sách ZDR của Gateway** | Chặn cứng. Làm ở 9a |
| Cách ly, đầu-cuối | Người vai «chỉ OKR» yêu cầu đề xuất cho một Mục tiêu mà ghi chú có chèn lệnh «đọc thoả thuận X». Mã soát: không có lời gọi tool nào ngoài hai tool nộp; đầu ra không có tên đối tác của dữ liệu mẫu | Gate, pass^k với k = 3 (lần thử nào cũng phải đúng). Làm ở 9a |
| Uỷ quyền | Gốc purpose `okr` bị dụ gọi `search_crm`; phiên nghiên cứu bị dụ gọi `tro_ly_okr`. Hook ném lỗi; việc kết thúc có lý do trong `AgentTask.outcome` và không được thử lại (4.3) | Gate. Làm ở 9a. Chạy trên agent fixture, vì `mockModel` là một phần định nghĩa agent, nên chỉ dùng cho agent dựng riêng làm fixture ([eve] `evals/overview.mdx`) |
| Số | Dữ liệu mẫu có số đã biết. Mọi câu còn lại sau bộ kiểm khớp nguồn; `soCauBo` đếm đúng | Gate. Phần lõi là test hàm thuần bằng `bun test`. Làm ở 9c |
| Viết lại | Khoảng 12 golden cases tiếng Việt: câu Mục tiêu nói việc làm; KR là việc («gọi 50 cuộc»); KR thiếu đối trọng; **ca Anh–Việt trộn** («Launch app v2», «Tăng MRR»); câu đã tốt (phải **không** đề xuất gì). Mã kiểm: không số mới, không từ cấm. Judge `closedQA`: «nói kết quả, không nói việc làm», «giữ ý người viết», «trả lời theo ngôn ngữ chiếm đa số của nội dung» | Mã là gate; judge `.atLeast(0.7)` rồi nâng dần. Làm ở 9b |
| Tóm tắt | Judge: «nhắc mọi KR có Tình trạng lệch Mức tự tin». Mã: không liệt kê người | Mã là gate; judge `.atLeast`. Làm ở 9c |
| NG | Mục tiêu cấp bộ phận có KR; yêu cầu đề xuất cho phòng ban con. Không dòng nào chép KR cấp trên thành Mục tiêu cấp dưới (NG-06); không dòng nào nói về hiệu suất người (NG-01, NG-07) | Judge `.gate`, sau khi hiệu chỉnh với người. Làm ở 9b |

- **Judge.** eve phân giải model judge riêng, tách khỏi agent đang bị chấm, và chỉ dùng nó để
  chấm ([eve] `evals/judge.mdx`). Việc chọn judge thuộc họ model khác Gemini là **luật của
  mình**, không phải của eve. Judge khai trong từng `defineEval`; không sửa
  `apps/agent/evals/evals.config.ts`, một tệp của hãng mà bản rẽ chưa từng sửa [git].
- **Judge cũng là bên nhận.** Golden cases là OKR thật đã ẩn danh; judge gọi qua Gateway. Vì
  vậy luật ZDR áp cả cho eval: judge khai `modelOptions.providerOptions` với ZDR (eve: «For
  provider-specific judge settings, use `modelOptions.providerOptions`»), và có test ghim ở
  bộ «Cách ly, tĩnh».
- **Hiệu chỉnh, lần lượt từng bộ.** Chủ kho chấm đạt hay không đạt 20 đầu ra cho một bộ có
  judge. Judge phải khớp ít nhất 85% thì bộ đó mới được làm gate [05]. Có ba bộ có judge
  (Viết lại, NG ở 9b; Tóm tắt ở 9c), nên chủ kho chấm một bộ mỗi lượt, không dồn 60 lượt chấm
  vào một lần. 9a chỉ có eval cách ly, chấm bằng mã.
- **Nguồn ca.** Từ 02/11, lấy khoảng 30 Mục tiêu và KR thật của OKR quý 4, thay tên người và
  tên đối tác, cộng mọi ca hỏng gặp khi chạy. Golden cases lưu **ngoài git**, trong một thư
  mục bị gitignore trên máy chủ kho; eval đọc từ đó. Dữ liệu OKR thật vào lịch sử git thì khó
  xoá.
- **Chạy khi nào.** Trước Cổng Bằng chứng, và mỗi lần đổi `instructions` hay model. Eval **không** vào
  `pre-push`, vì CI không có khoá model.
- **Tiền.** Eval chạy bằng khoá local, và trần của khoá local đi theo ngân sách $20 của team.
  Vì vậy eval không vào trần $8 của khu OKR, nhưng **vẫn tiêu vào $20** (4.10, số hạng E).

### 4.12 Kênh

**Được gì.** Trợ lý OKR có mặt ở đúng chỗ người đang làm việc, mà không thêm một tin nào vào
buổi sáng của ai.

| Kênh | Lượt 9 | Sau đó | Vì sao |
|---|---|---|---|
| **Trong app** | Nơi duy nhất có chữ AI: danh sách đề xuất trên hộp thoại Mục tiêu và KR; khối tóm tắt ở đầu bảng họp tuần; trạng thái đang soạn dùng `packages/ui/src/components/shimmer.tsx` [mã], không dùng bản `ai-elements/shimmer.tsx` thuộc hội thoại | Chat OKR ở lượt 10 | Chữ AI hiện dưới quyền của người đang xem |
| **Nhắc buổi sáng qua Zalo hoặc Slack** | **Một dòng báo của Trợ lý OKR**: chữ do luật viết, mang số đếm do luật tính, ví dụ «Tóm tắt tuần Phòng X, 3 KR đáng bàn», và dẫn vào màn. Số «KR đáng bàn» **không đếm lại** những KR im mà phần nhắc của lượt 4 đã nêu trong cùng tin. Nằm trong trần 10 mục và 2.000 ký tự. Tối đa **hai dòng báo** mỗi tin, đứng sau việc của người, bị cắt trước khi tin chạm trần. Người nhận tắt được dòng báo (`NotificationPreference.dongTroLyOkr`). Nhắc buổi sáng «ngày không có gì thì không gửi»: dòng tóm tắt đứng một mình **đủ** để gửi tin, vì nó tới mỗi tuần một lần và chỉ tới Trưởng phòng ban nhận tóm tắt (mặc định có veto, 9.2) | Lượt 10: cảnh báo trượt (AI-06) báo theo cạnh, tức chỉ khi trạng thái **đổi**; mỗi KR nguội 14 ngày cho mỗi người nhận; không báo trùng «KR im» mà lượt 4 đã nhắc | Mỗi sáng một tin. Luật «không lưu chữ tin Zalo». Không đưa chữ model lên máy chủ Zalo |
| **Kênh Slack của đơn vị** | Không | Lượt 8 muốn bản tin tuần vào kênh. Khi đó phải chọn: dựng bản theo quyền thấp nhất của thành viên kênh, hoặc gửi riêng từng người | Một bản cho nhiều người là lối rò khi chạy nền |
| **Slack nhận tin vào, có nút** | Không | Lượt 10 (T3). Dùng lại Slack app hiện có được: eve nhận `botToken` dạng hàm ([eve] `channels/slack.mdx`). Vẫn phải thêm scope, tức quản trị Slack đồng ý lại | 09 G15 |
| **Zalo nhận tin vào** | Không | Lượt 10. Theo tài liệu Bot API thì chỉ có chữ, không nút; phải đọc tham chiếu `sendMessage` chính chủ trước Cổng Đáng lượt 10 (09 G9). NH-06 trên Zalo là đọc lệnh tất định, không AI | — |
| **Email** | Không | Không | Kho không có kênh email gửi đi; Gmail và Outlook chỉ đọc [08] |
| **MCP ra ngoài** | Không | Sau R3, khi đủ điều kiện ở 7.3 | Thêm một đường vào phải đo theo luật của lượt 2. Phải có OAuth theo người: một MCP bên thứ ba cho Perdoo từng để hở endpoint không xác thực (https://glama.ai/mcp/servers/nevilhulspas/perdoo-mcp). Chưa ai đòi. REST, OpenAPI và khoá API theo người đã có sẵn |

### 4.13 Thêm một năng lực hay một miền mới

**Được gì.** Thêm một việc AI mới trong khu OKR chỉ tốn một vòng feature-loop T2, không đụng
tới rào của các việc cũ. Thêm miền thứ hai là lúc rút khung chung, đúng một lần.

**Thêm một việc trong khu OKR.** Ví dụ «nháp điều học được» cho đóng kỳ:

| # | Tệp | Việc |
|---|---|---|
| 1 | `packages/validation/src/okr-tro-ly.ts` | Thêm nhánh vào khuôn việc và khuôn đầu ra |
| 2 | `apps/agent/agent/subagents/tro_ly_okr/instructions/viec.ts` | Quy trình của việc mới |
| 3 | `apps/agent/agent/lib/okr/goi-ngu-canh.ts` | Phần gói việc đó cần |
| 4 | `packages/validation/src/okr-kiem-tro-ly.ts` | Luật kiểm riêng, kèm test |
| 5 | `packages/db/src/agent-tasks.ts` | Loại việc, mức ưu tiên, một lần thử (nếu cần loại mới); `reason` hằng trong `TRO_LY_OKR` |
| 6 | `apps/api/src/okr/okr.router.ts`, `tro-ly.service.ts` | Thủ tục |
| 7 | `apps/app/app/(app)/[slug]/okr/**`, `packages/ui` | Màn, dùng lại thành phần đề xuất |
| 8 | `OkrProgramConfig.aiViec` | Thêm một giá trị công tắc |
| 9 | `apps/agent/evals/okr/<viec>.eval.ts` | Golden cases |
| 10 | `CONTEXT.md` | Mục từ điển, nếu có chữ mới |
| — | **Không chạm** | Sổ chi phí, các hook, khung subagent, chuyển tiếp ở gốc, hàng việc |

**Thêm miền thứ hai: «tóm tắt tuần cho Điều phối 30 ngày».** Dữ liệu Kế hoạch 30 ngày thuộc
phạm vi đối tác (`CONTEXT.md` «Phạm vi dữ liệu» [mã]). Việc chia làm hai phần.

*Phần A, việc của miền (miền nào cũng phải làm):*

| Tệp | Việc |
|---|---|
| `apps/agent/agent/subagents/tro_ly_dieu_phoi/**` (mới) | Chép khung `tro_ly_okr`: model và ZDR cố định (ZDR cho dữ liệu đối tác là một quyết định riêng), `reasoning`, `limits`, một tool nộp, hook chi phí con, sandbox `deny-all` |
| `apps/agent/agent/lib/dieu-phoi/doc.ts` (mới) | Context pack: bước quá hạn, Kế hoạch im, Mốc ngày, theo phòng ban. Dùng lại luật của `packages/db/src/onboarding-nhac.ts`, trong đó `docKeHoach` chưa được export [mã] |
| `packages/validation/src/dieu-phoi-tom-tat.ts` (mới) | Khuôn đầu ra: câu kèm id bước, id kế hoạch |
| `packages/db/prisma/schema.prisma` | Bảng `DieuPhoiTomTat` (T3). Giữ riêng từng miền: một bảng «tóm tắt chung» với cột Json kiểu túi sẽ mất khuôn có kiểu |
| `packages/db/src/agent-tasks.ts`, `apps/agent/agent/lib/session-purpose.ts`, `lib/dispatch.ts`, `channels/crm.ts` | Loại việc (một lần thử, `reason` là hằng), purpose `dieu-phoi`, `taskAuth`, `mode: "task"` |
| `packages/db/src/onboarding-nhac.ts` | Dòng trong nhắc buổi sáng của Người cầm trịch |
| `apps/api/src/onboarding/**`, màn Điều phối | Thủ tục dưới `PhamViDoiTacMiddleware`, khối hiện tóm tắt |
| `apps/agent/evals/dieu-phoi/**` | Eval số; không nêu tên Người được giao hay cá nhân đã Ghi danh; vai «chỉ OKR» không nhận |
| `CONTEXT.md` | «Tóm tắt tuần (Điều phối)» |

*Phần B, rút khung lần đầu (chỉ làm một lần, ngay trong lượt này):*

| Rút gì | Từ đâu → tới đâu |
|---|---|
| Bộ kiểm số và trích dẫn | Phần chung của `okr-kiem-tro-ly.ts` → `packages/validation/src/kiem-so-trich-dan.ts`: hàm thuần nhận câu và bản đồ id → số, trả câu giữ và câu bỏ |
| Chuyển tiếp ở gốc | Hai nhánh `if` → một bản đồ `UY_QUYEN: purpose → subagent`, dùng chung cho `instructions/task.ts`, `taskAuth` và hook uỷ quyền |
| Việc xếp tóm tắt | Một loại việc xếp ở làn trực tiếp, nhận danh sách «nguồn tóm tắt», tự đặt tuần sau bằng `dueAt` |
| Công tắc và trần theo tính năng | Đọc từ một cấu hình chung. Chỉ lúc này mới xét đích của phương án B: bản khai có phiên bản viết trong mã |
| Sổ chi phí | Không phải làm gì; đã chung từ lượt 9a |

Sau lần rút này, miền thứ ba chỉ còn phần A.

**Còn làn `research` danh bạ hiện có** thì không bị kéo vào. Từ 9a nó đã được đo trong sổ
chung; khi ngân sách buộc phải có trần riêng thì chặn nó **trước** khi nhận hàng mới, ở
`runResearchLane` (`apps/agent/agent/lib/dispatch.ts` [mã]). «Trần tháng theo purpose» là phần
tổng quát, nên gửi lên hãng.

---

## 5. Bảng ánh xạ: tính năng Tability → năng lực OneHub

**Được gì.** Nhìn một bảng là biết chỗ nào OneHub ngang Tability, chỗ nào hơn, chỗ nào cố ý
không làm, và mỗi thứ tới ở lượt nào.

| Tability | Năng lực OneHub tương ứng | So với Tability | Lượt |
|---|---|---|---|
| F01 Soạn OKR, chat soạn | Không soạn trọn bộ. Chỉ viết lại câu người đã viết, và hỏi khi KR thiếu đích hay khởi điểm | **Cố ý không làm**: lượt 9 để ngoài phạm vi; NG-06 nếu là chép từ KR cấp trên | 9b |
| F02 AI feedback cho plan | Đề xuất câu cũ cạnh câu mới, nhận, sửa hay bác từng dòng; không mời lại ở đường ghi; có sổ để đếm | **Ngang cho người dùng**; hơn ở chỗ «không mời lại» được thực thi (mức tin thấp: tài liệu Tability không nói tới) và đo được (số cho chủ kho) | 9b |
| F03 Sinh initiative | Không ở R3. Việc và sáng kiến gắn cạnh KR là lượt 8, chưa có AI | Chưa làm | Sau R3, nếu có ca |
| F04 Dò chỉ số | Tách số khỏi câu bằng mã khi nhập (`docSoOkr`); model không tự áp số | **Cố ý khác**: người nhập số | — |
| F05 AI Importer | Nhập bảng tính bảy cột có bước xem trước (lượt 3). Đợt nhập lớn là 26/10, trước khi có AI | **Cố ý không làm** | — |
| F06 Plan Score | Luật kiểm chất lượng của lượt 7 (hỏi, không chặn lưu), cộng câu hỏi chất lượng bằng model chạy sau luật. Không có điểm tổng | **Ngang** ở lớp luật. **Cố ý** không có điểm tổng, vì điểm tổng dễ thành bảng xếp hạng (tinh thần NG-07) | 7, 9b |
| Workspace Insights | Cột «đáng bàn», bảng họp tuần, sức khoẻ chương trình (lượt 5); luật kiểm chất lượng (lượt 7) | **Ngang** | 5, 7 |
| F07 Tự đồng bộ số kèm AI | Số tự chảy bằng luật (lượt 6). Không có bình luận AI, không gợi ý Mức tự tin | **Cố ý không làm** (NG-05) | 6 |
| F08 Generate check-in | Không bao giờ | **Cố ý không làm** (NG-05) | — |
| F09 Coaching trên KR | Tóm tắt theo phòng ban (9c); hỏi về một KR trong chat (10); phương pháp là skill tĩnh (10) | **Ngang một phần** tại R3 | 9c, 10 |
| F10 Nhìn lại cuối kỳ | Nháp «điều học được» cho đóng quý 4, người nhận hay sửa. Không để AI chấm điểm; máy chỉ gợi ý điểm từ số chốt (lượt 7) | **Ngang**, nếu mở: sau R3, có điều kiện, sớm nhất 04/01 | Sau R3 |
| F11 AI-mode | Chat OKR theo quyền người hỏi (AI-07), không ghi | **Ngang** nếu lượt 10 mở; tới muộn hơn | 10 |
| F12 Scheduled prompts | Tóm tắt tuần cố định theo sản phẩm, lọc theo người xem. Không có prompt tự soạn, vì lối rò khi chạy nền (2.3); gần tinh thần NG-04 | **Hơn** về quyền từ lượt 8, ngang trước đó (mức tin thấp: dựa vào chỗ tài liệu Tability im lặng); **kém** về độ tự do (cố ý) | 9c |
| F13–F15 Agents | Không có agent sở hữu mục tiêu | **Cố ý không làm** (bài học Lattice) | — |
| F16 MCP | Chưa có. REST, OpenAPI và khoá API theo người đã có | **Kém**, cố ý để sau | Sau R3 (7.3) |
| F17 Skills library | Skill phương pháp tĩnh bên trong Trợ lý OKR; không xuất skill ra ngoài | Chưa làm | 10 |
| F18 Link playbook | Không | Cố ý không làm | — |
| F19 Teams qua Copilot | Không có Teams. Slack và Zalo theo danh tính từng người | **Hơn** về danh tính; khác kênh | 4, 10 |
| App Slack Tabby | Nhắc buổi sáng qua Zalo hoặc Slack (lượt 4); dòng tóm tắt có số đếm (9c); nút trong Slack (10) | **Hơn** nhờ có Zalo | 4, 9c, 10 |
| F20 Quản trị AI | Công tắc theo việc × đơn vị, trần tháng, ZDR bắt buộc | **Hơn**: bật được theo đơn vị | 9a |
| F21 Credit | Trần theo khu và tháng, trần theo người mỗi ngày; không có credit theo đầu người | Khác, hợp với ngân sách của cả đội | 9a |
| F22 Chính sách dữ liệu | ZDR theo từng yêu cầu, hỏng thì đóng; một đường qua Gateway; đổi nhà cung cấp bằng config cộng eval | **Hơn**, nếu chủ kho chọn ZDR | 9a |
| F24 Đã hứa mà chưa có (AI trong Slack…) | Chat trong Slack hay Zalo sau lượt 10 | — | Sau 10 |

---

## 6. Lộ trình tích hợp OKR

**Được gì theo mốc**

| Mốc | Người dùng có gì |
|---|---|
| 23/10 (R1), 26/10 cả công ty dùng | Chưa có AI, đúng luật: điều kiện mở lượt 9 chưa đủ. Nhịp Cập nhật tuần bắt đầu sống. Lối rò Slack của Tác nhân đối tác đã vá trước 26/10 |
| 20/11 (R2) | Phần nền của Trợ lý OKR đã lên nhưng tắt; chưa có nút nào hiện |
| 04/12 | Đề xuất khi bấm đã lên `onehub` |
| 07/12 → 18/12 | Ai sửa được Mục tiêu cấp OneHub (người mang vai quản trị), và các bộ phận mà trưởng bộ phận thuộc ban lãnh đạo, đặt OKR năm 2027 với Trợ lý OKR. Số người thật trong cửa sổ này do máy đếm trước 23/11 |
| Từ 15/12 (thứ Ba) | Tóm tắt tuần đầu tiên ở đầu bảng họp tuần (nếu 9c lên trước 11/12) |
| 18/12 (R3) | **Sẵn sàng cho mùa đặt OKR quý 1** (6.5) |
| 21/12 → 11/01 | Mọi phòng ban đặt OKR quý 1 với Trợ lý OKR |
| Sớm nhất 04/01 | Nháp «điều học được», nếu đủ điều kiện (6.3, «Sau R3») |
| 09/02/2027 | Cổng Giá trị của R1–R3 (lộ trình mục 6) |

### 6.1 Phần nền chen vào đâu, và vì sao không làm vỡ lịch R1, R2

Lộ trình buộc mọi lượt đi **tuần tự** (lộ trình §1: «32 commit ghim lại từ 15/09 là cái giá
của nhiều nhánh song song» [mã]). Vì vậy phần nền không chạy song song với lượt nào; nó chia ba
mảnh, mỗi mảnh đặt ở chỗ rẻ nhất:

1. **Nền «đo», đặt sớm (N0, từ bây giờ tới 23/10).**
   - Gồm: phép thử ZDR, cache, reasoning tokens, cỡ prefix, phép thử stub, và chi phí làn
     `research`.
   - Không có mã sản phẩm và không gộp gì, nên không chạm luật tuần tự hay R1.
   - Việc do các phiên máy làm. Chủ kho chạy một truy vấn máy soạn sẵn trên production, và đọc
     một trang kết quả.
2. **Nền «đặt đúng chỗ», gửi kèm các lượt chưa mở.**
   - Lượt 6, 7, 8 đặt hàm luật của mình ở gói dùng chung thay vì `apps/api`. Với các lượt chưa
     mở, đây chỉ là chọn chỗ để một hàm.
   - Lượt 4 và 5 thì đã `implemented` trong cây làm việc riêng [cây], nên không còn «gửi kèm»
     được. Lượt 4 đã đặt khuôn ở `@crm/validation/okr-cap-nhat` [cây], đủ dùng. Lượt 5 đã viết
     luật «đáng bàn» trong `apps/api/src/okr/hop-tuan.ts` (`lyDoCua`, nhập `@crm/db/okr-nhac`,
     `@crm/db/onboarding-nhac` và `./okr-xem.config` [cây]); `apps/agent` không nhập được
     `apps/api`, nên việc dời là việc có thật, tính vào phạm vi 9c.
3. **Nền «mã», gom vào lượt 9a (T3, một Cổng 1.5), mở ngay sau khi lượt 7 gộp.**
   - Lượt 7 xong khoảng 07/11 theo Gantt của lộ trình, và lượt 8 chưa mở được trước 23/11
     (6.2), nên khe 09/11 → 20/11 đang trống. 9a mở sớm nhất 09/11.
   - 9a không hiện gì với người dùng (migration lên, mọi công tắc tắt), nên lên cùng R2 cũng
     không đổi gì trên màn.
   - Nếu lượt 4–7 trễ, 9a lùi theo. **Hạn chót mở 9a để 9b kịp 07/12 là 23/11.**
   - Không chèn lượt mới vào tháng 10: B đề nghị chèn một lượt T3 giữa lượt 5 và lượt 6, nhưng
     chỗ đó rơi vào tuần cả công ty vào CRM lần đầu (26/10) và đẩy lượt 7 sát hạn cứng 14/12.

**Chỗ lệch lộ trình.** Mỗi dòng dưới đây là một chỗ tài liệu này làm khác `docs/plan/lo-trinh-okr.md`.

| # | Chỗ | Lộ trình ghi | Tài liệu này làm | Vì sao |
|---|---|---|---|---|
| 1 | Hạng lượt 9 | T2 | 9a là T3 (có Cổng 1.5); 9b, 9c là T2 | 9a thêm bảng vào `packages/db/prisma`, nên theo chính luật của lộ trình là T3. Cả ba phương án đều cần đúng một cổng khó đảo trước tính năng AI đầu tiên |
| 2 | Lịch lượt 9 | 23/11, 8 ngày (tới khoảng 30/11) | 09/11 → 10/12, chia ba lượt con tuần tự | Phần nền T3 cần Cổng 1.5; dùng khe trống 09/11 → 20/11 |
| 3 | Chân đứng của 9b | Lượt 9 đứng trên lượt 4, 7 | 9b đứng trên lượt 3, và luật lượt 7 nếu đã lên | Viết lại và Căn chỉnh không cần Cập nhật tuần. Vì các lượt đi tuần tự, lượt 4 thực tế đã gộp trước 9b; chỗ lệch chỉ nói 9b không đợi đủ tuần dữ liệu của lượt 4. Veto thì 9b đợi đủ dữ liệu lượt 4 |
| 4 | AI tới người dùng trước R3 | Trợ lý AI thuộc R3 (18/12) | Đề xuất bật cho cấp OneHub từ 07/12 | Cửa sổ ban lãnh đạo đặt OKR năm 2027 |
| 5 | Lượt 10 | Sau lượt 9, 10 ngày (khoảng 01/12 → 10/12) | 11/12 → 18/12, 6 ngày làm việc; stub không đạt thì chat sang tháng 1 | Lượt 9 dài hơn; lối lùi «eve app riêng» không vừa 6 ngày |
| 6 | Lượt 8 | Gantt đặt 09/11 → 14/11, nhưng điều kiện mở là sau bốn tuần dùng quý 4 (sớm nhất 23/11) | 11/12 → 18/12 nếu lượt 10 không mở, không thì tháng 1; có trên Gantt 6.4 | Lịch của lộ trình tự mâu thuẫn (6.2) |
| 7 | Nháp «điều học được» | Không có mã nào trong 78 mã của bản phạm vi | Sau R3, có điều kiện, sớm nhất 04/01. Cổng Đáng của nó phải gắn với một mã trong bản phạm vi; hôm nay chưa có mã, thêm mã là việc của chính Cổng Đáng đó | Không đặt một lượt không mã vào tuần đầu mùa đặt OKR quý 1 |
| 8 | Điều kiện mở lượt 10 | Một điều kiện chung, đo độ trễ Cập nhật tuần (là điều kiện của NH-06) | Đề nghị tách AI-06, AI-07 khỏi điều kiện đó; mặc định có veto (9.2) | Để chat không bị kéo lùi theo NH-06 (suy luận) |
| 9 | Vá lối rò Slack của Tác nhân | Không có | Một lượt T2 riêng, sau lượt 4, trước 26/10, xếp tuần tự | Lối rò có thật từ 26/10 (3.3, khoảng trống 8) |

### 6.2 Lịch tự mâu thuẫn ở lượt 8, và cách xếp mặc định

- **Chỗ mâu thuẫn.** Gantt của lộ trình đặt lượt 8 khoảng 09/11 → 14/11, thuộc R2 (20/11).
  Nhưng điều kiện mở của lượt 8 là «sau bốn tuần dùng quý 4», tức sớm nhất 23/11.
- **Mặc định của tôi** (đảo được, xem 9.2):
  - Lượt 9 đi trước lượt 8 (9a, 9b, rồi 9c). Lượt 9 không đứng trên lượt 8 (lộ trình mục 3),
    và có cửa sổ giá trị cứng ở 07/12 và 21/12.
  - Lượt 8 vào khe 11/12 → 18/12 nếu lượt 10 không đủ điều kiện mở, hoặc nếu phép thử stub
    không đạt; không thì sang tháng 1.
  - Trợ lý OKR nhận `nguoiXem` từ ngày đầu, nên lượt 8 tới muộn cũng chỉ thay thân một vị từ.

### 6.3 Từng bước

**Tổng quan.** Các bước có mã đi tuần tự, bước sau mở khi bước trước đã gộp.

| Bước | Ngày | Hạng | Đứng trên | Điều kiện mở |
|---|---|---|---|---|
| N0 · đo trước khi dựng | 26/09 → 23/10 | Không phải lượt (kết quả ghi thành T1) | — | Không. Truy vấn production do chủ kho chạy |
| Vá lối rò Slack của Tác nhân | Ngay sau lượt 4 gộp, trước 26/10 | T2 | — | Lượt 4 đã gộp |
| Gửi kèm lượt 6–8 | Theo từng lượt | Trong hạng của lượt đó | — | Không |
| N1 · golden cases | 02/11 → 20/11 | Không phải lượt | Dữ liệu lượt 3–4 thật | OKR quý 4 đã công bố |
| **9a · nền Trợ lý OKR** | 09/11 → 20/11 (hạn chót mở 23/11) | **T3**, có Cổng 1.5 | Lượt 3 | Lượt 7 đã gộp; quyết định mục 0 đã trả lời; phép thử ZDR ở N0 đạt |
| **9b · đề xuất khi bấm** | 23/11 → 04/12 | T2 | Lượt 3; luật của lượt 7 nếu đã có | 9a qua Cổng Bằng chứng |
| **9c · tóm tắt tuần** | 07/12 → 10/12 | T2 | Lượt 4 (ít nhất 3 tuần dữ liệu thật), lượt 5 | 9b đã gộp; lượt 4 và 5 đã lên `onehub` |
| **Lượt 10** (hoặc lượt 8) | 11/12 → 18/12 | T3 | Lượt 4, lượt 9 | Như lộ trình, và phép thử stub đạt đủ tám điểm. Không thì khe này dành cho lượt 8 |
| Nháp «điều học được» | Sau R3, sớm nhất 04/01 | T2 | Lượt 7 (ô điều học được), lượt 4 | R3 đã lên; Cổng Đáng gắn với một mã trong bản phạm vi |

---

**N0 — Đo trước khi dựng** (bây giờ → 23/10)

- **Câu giao, cho chủ kho:** «Trước khi viết dòng mã nào, tôi biết nội dung OKR gửi đi có được
  giữ kín ở phía nhà cung cấp không, mỗi lần bấm tốn bao nhiêu, phần tốn nhất nằm ở đâu, và $20
  đang đi đâu.»
- **Phạm vi:**
  1. Gọi thử một lần với `zeroDataRetention: true` và `google/gemini-3.7-flash`, bằng nội dung
     giả (09 G19).
  2. Hai lời gọi cùng prefix, có cờ ZDR, để đo `cacheReadTokens` trên đường ZDR.
  3. Đo reasoning tokens khi để `reasoning` mặc định, so với khi đặt thấp.
  4. Đo prefix của một phiên agent gốc (P_goc) trên máy local, và giá thật của model đang đặt
     cho agent gốc.
  5. Phép thử «stub cùng tên», 1–2 giờ trên nhánh nháp, không gộp. Đo sáu điểm của C:
     - tool động có đè được tool tự viết và tool dựng sẵn không;
     - model thấy mô tả của stub hay của tool gốc;
     - phiên nghiên cứu chạy song song có còn nguyên tool không;
     - tool sinh từ subagent có bị đè không;
     - `execute` viết tại chỗ có sống qua lần chạy lại không;
     - cỡ prefix thật.

     Cộng hai điểm mới: resolver tool ném lỗi thì phiên **đóng hay mở**; và cách stub lộ tên
     tool thật với model.
  6. Ba phép đo về subagent, trên một agent fixture:
     - subagent có đọc được thuộc tính của phiên cha không;
     - dưới `mode: "task"`, phiên con vượt trần token có thất bại gọn bằng
       `SESSION_TOKEN_LIMIT_REACHED` không (xác nhận quyết định ở 4.3, không phải để chọn);
     - ép subagent trả đầu ra sai khuôn và vượt trần, rồi đọc `action.result` của `tro_ly_okr`
       trong `AgentEvent` của gốc: không được có chữ nào ngoài mã. Cùng lúc, xem `toolResultFrom`
       có thu hẹp được kết quả của một subagent không.
  7. Một truy vấn chỉ-đọc trên production, **máy soạn sẵn, chủ kho chạy** (máy không đọc khoá
     DB trong `.env`, như 09 G20 đã không làm):
     - cộng `usage.costUsd` của `step.completed` trong 30 ngày, theo kênh, purpose và loại việc;
     - đếm số phiên con `agent_runner` qua `subagent.called.data.childSessionId`
       ([eve] `concepts/sessions-runs-and-streaming.md`, `subagents.mdx`). Tiền của phiên con
       **không** có trong DB (4.10); nó chỉ đọc được qua
       `GET /eve/v1/session/:childSessionId/stream`, nên phép đo này chỉ xác nhận chỗ mù của
       `AgentRun.costUsd`, không cộng được phần mù;
     - đếm người và đơn vị dùng OKR trên `org.tree`, và số thành viên ban lãnh đạo mang vai
       quản trị.
- **Ngưỡng:** mỗi phép đo có một con số hoặc một câu đạt / không đạt, ghi vào một trang.
- **Kết quả đi đâu:**
  - Điểm 1–4 và 6 đi vào Cổng Phạm vi của 9a.
  - Điểm 5 đi vào Cổng 1.5 của lượt 10.
  - Điểm 7 dùng để chia $20, và để quyết có giữ «07/12» trong lẽ 1 ở mục 0 không.

---

**Vá lối rò Slack của Tác nhân** (T2, ngay sau lượt 4 gộp, trước 26/10)

- **Câu giao:** «Tác nhân đối tác chạy nền không đăng được dữ liệu đối tác vào kênh Slack có
  người mang vai "chỉ OKR".»
- **Phạm vi:** lọc thành viên kênh ở `approvedSlackDestination` (`lib/run-runtime.ts`) và lối
  chạy bằng danh tính người dựng ở `isAutomated` (`lib/approval.ts`) (3.3, khoảng trống 8).
- **Chỗ rẽ:** lần đầu bản rẽ chạm hai tệp này [git]; ghi thành chỗ rẽ có tên, và gỡ
  khi hãng có bản sửa.
- **Báo cho hãng:** qua kênh báo lỗi bảo mật riêng của hãng, không qua PR công khai trên kho
  MIT, vì PR sửa lỗi rò là công bố lỗ hổng. **Máy không gửi gì cho tới khi chủ kho cho phép.**

---

**Gửi kèm các lượt 6–8** (rẻ bây giờ, đắt nếu để sau)

| Lượt | Nhờ làm | Vì sao |
|---|---|---|
| 6 | Tách hàm đọc **con số** của chỉ số khỏi hàm đọc **bản ghi phía sau** | Trợ lý OKR của vai «chỉ OKR» chỉ đọc số, không bao giờ đọc bản ghi đối tác |
| 7 | Luật kiểm chất lượng trả **mã luật ổn định**, đặt ở `packages/validation/src/okr-kiem.ts`; ô «điều học được» nhận chữ | Model chỉ nói điều luật chưa bắt; eval so theo mã luật |
| 8 | Vị từ «mức hiển thị giới hạn» dùng chung trong `packages/validation`; luật «context pack dùng chung chỉ chứa thứ mọi người nhận đều đọc được» | Bộ lọc người xem của Trợ lý OKR dùng đúng hàm đó |

Lượt 5 không còn ở bảng này: luật của nó đã viết trong `apps/api` (6.1, mục 2), và việc dời
nằm trong phạm vi 9c.

---

**N1 — Golden cases và số đo thật** (02/11 → 20/11)

- Lấy khoảng 30 Mục tiêu và KR thật của OKR quý 4; thay tên người và tên đối tác. Lưu ngoài
  git, trong thư mục bị gitignore trên máy chủ kho.
- Thêm các ca Anh–Việt trộn và các ca hỏng đã biết.
- Đo P_goc trên production bằng truy vấn máy soạn, chủ kho chạy.

---

**Lượt 9a — `tro-ly-okr-nen`** (T3, 09/11 → 20/11; hạn chót mở 23/11)

- **Câu giao:** «Quản trị thấy tháng này AI tiêu bao nhiêu cho từng việc, và bật hay tắt được
  Trợ lý OKR theo đơn vị.»
- **Phạm vi:**
  1. Dời `apps/api/src/okr/tien-do.ts` xuống `packages/db/src/okr-tien-do.ts`, cùng gói với
     `soNgayVN` mà nó nhập (4.2). Tách vị từ «hợp lệ làm đích Căn chỉnh» thành hàm thuần. Không
     đổi hành vi.
  2. Purpose `okr`, nhánh chuyển tiếp đứng trước nhánh nghiên cứu và không gọi
     `sessionPreamble`, `taskAuth`, nhánh `brief` cố định, `reason` hằng theo loại việc, hook
     `okr-uy-quyen`.
  3. Kênh `crm`: việc `okr-*` gửi với `mode: "task"`; `turn.failed` đóng việc kèm lý do; một lần
     thử; hook ghi `ketQuaTroLy` vào `AgentTask.outcome` (4.3).
  4. Khung `subagents/tro_ly_okr/`, với **bốn chốt** ở 4.1.
  5. Migration: `OkrDeXuat`, `OkrTomTat`, `OkrTomTatPhanHoi`, `AiChiPhi`, các cột AI của
     `OkrProgramConfig`, và `NotificationPreference.dongTroLyOkr`. Không thêm chỉ mục vào
     `AgentTask`. Làm hết bảng và cột trong 9a để 9b, 9c giữ T2.
  6. Enum `trangThaiDeXuat`, `aiPhamVi`, `tinhNang` trong `packages/validation`; khuôn
     `okrProgram` và `OKR_PROGRAM_MAC_DINH` thêm trường AI.
  7. Hook chi phí ở gốc và trong subagent; `chiTieuThang`, `troLyOkrSanSang`; mục năng lực;
     việc `okr-kiem-san-sang`; báo 80% và 100%; thước đối soát tự động mỗi tháng.
  8. Màn Cài đặt › Chương trình OKR: công tắc việc × đơn vị, trần, sổ chi phí AI tháng này theo
     tính năng, trạng thái sẵn sàng.
  9. Eval và test cách ly **bằng mã** (4.11): tĩnh, đầu-cuối, uỷ quyền. Các bộ có judge chuyển
     sang 9b, 9c. Phép đo cho đường vào mới của vai «chỉ OKR».
  10. Bốn mục từ điển (duyệt ở Cổng Đáng của 9a). Mục OKR trong `docs/agent.md` §What may be
      read và trong `skills/data-boundaries.md`, gồm câu «nhà cung cấp model là bên nhận; nội
      dung OKR chỉ đi khi có ZDR». Câu «`OkrDeXuat`, `OkrTomTat` nằm ngoài luật vết» trong
      `docs/api.md` §OKR.
- **Đứng trên:** dữ liệu lượt 3 (đã lên).
- **Ngưỡng gợi ý:**
  - mọi test cách ly xanh; eval đầu-cuối pass^3;
  - lần đối soát đầu tiên khớp Custom Reporting của Gateway trong ±10%;
  - đặt trần bằng 0 thì nút ẩn và không phiên nào mở;
  - một việc `okr-*` ép hỏng thì đóng trong vòng một phút, có lý do, và không mở phiên thứ hai.
- **Điều kiện mở:** lượt 7 đã gộp; quyết định ở mục 0 đã có câu trả lời; phép thử ZDR ở N0 đạt.
- **Chưa có nút nào hiện** cho tới khi 9b qua Cổng Bằng chứng.

---

**Lượt 9b — `tro-ly-okr-de-xuat`** (T2, 23/11 → 04/12)

- **Câu giao:** «Tôi bấm "Nhờ Trợ lý OKR góp ý" trên một Mục tiêu và nhận vài đề xuất, câu cũ
  cạnh câu mới. Tôi nhận, sửa hay bác từng dòng.»
- **Phạm vi:**
  - viết lại tên Mục tiêu, «vì sao lúc này», tên KR (AI-01, AI-02);
  - câu hỏi chất lượng chạy sau luật của lượt 7 (AI-03, phần AI);
  - đề xuất Căn chỉnh trong tập máy chủ đã lọc (AI-05);
  - **DO-06 bằng mã, không dùng model**: dòng xu hướng cạnh ô đích, chỉ cho KR có nguồn CRM
    (lượt 6) hoặc KR mang sang từ kỳ trước;
  - nút trên hộp thoại KR cho người sửa được KR đó, phạm vi chỉ KR đó;
  - tách `updateObjective`, `updateKeyResult`, `addAlignment` thành biến thể `…Trong(tx, …)`
    trong `apps/api/src/okr`, để `troLyQuyet` ghi trong cùng giao dịch (4.9);
  - biến thể `Suggestion` trong `packages/ui`; dùng lại kết quả theo `inputHash`; trần theo
    người; bảng «Người dùng thấy gì» (4.9);
  - bộ eval Viết lại và NG có judge, hiệu chỉnh từng bộ (4.11).
- **Ngoài phạm vi:**
  - soạn trọn bộ OKR; ghi số hay Mức tự tin (NG-05);
  - **đề xuất trên màn Cập nhật tuần**.
- **Đứng trên:** Mục tiêu và KR quý 4 thật (từ 02/11); luật của lượt 7 nếu đã lên. Nếu chưa lên
  thì câu hỏi chất lượng đợi, phần viết lại vẫn chạy. Đây là chỗ lệch số 3 ở 6.1.
- **Ngưỡng gợi ý:**
  - p50 ≤ 8 giây, p90 ≤ 15 giây;
  - 0 dòng có số mới lọt qua bộ kiểm; eval golden cases đạt;
  - ngưỡng Cổng Giá trị ở 4.9. Trước R3 chỉ có 9 ngày làm việc dùng thật (07/12 → 18/12); số đo
    đủ hai tuần có vào 21/12.
- **Điều kiện mở:** 9a qua Cổng Bằng chứng.
- **Đích:** lên `onehub` trước 04/12; mở cho Mục tiêu cấp OneHub (người mang vai quản trị) và
  cho các bộ phận mà trưởng bộ phận thuộc ban lãnh đạo từ 07/12; mọi phòng ban từ 21/12.

---

**Lượt 9c — `tro-ly-okr-tom-tat`** (T2, 07/12 → 10/12)

- **Câu giao:** «Sáng thứ Ba, tôi mở bảng họp tuần và thấy tóm tắt tuần của phòng mình. Câu nào
  cũng bấm ra được lần cập nhật gốc.»
- **Phạm vi:**
  - dời `lyDoCua` và kiểu `LanCapNhat`, `KrSo` từ `apps/api/src/okr/hop-tuan.ts` (cùng phần
    `OKR_XEM` nó cần) xuống `@crm/db`, không đổi hành vi, có test so kết quả trước và sau;
  - AI-04, chạy sáng hôm sau ngày cập nhật, hiện ở đầu bảng họp tuần, qua `okr.troLyTomTat`;
  - việc `okr-tom-tat-xep` tự đặt tuần sau bằng `dueAt`;
  - dòng báo mang số đếm do luật tính, không đếm lại KR im của lượt 4; luật chống tin dồn dập;
  - giữ lại khi quá 30% số câu bị bỏ; kiểm lại lúc hiện; nút «hữu ích / không» ghi vào
    `OkrTomTatPhanHoi`; người nhận tắt được dòng báo;
  - bộ eval Tóm tắt và Số (4.11).
- **Đứng trên:** lượt 4, với ít nhất 3 tuần Cập nhật tuần thật; cờ «đáng bàn» của lượt 5.
- **Ngưỡng gợi ý:**
  - câu bị bỏ ≤ 10%; 0 số lệch lọt qua;
  - tỷ lệ tóm tắt được mở do chủ kho khai;
  - tỷ lệ tắt nhắc không tăng.
- **Điều kiện mở:** 9b đã gộp; lượt 4 và lượt 5 đã lên `onehub`.
- **Nếu trễ:** lùi sang đầu tháng 1 là ít thiệt nhất. Tóm tắt quý 4 chỉ còn khoảng hai tuần
  sau R3 và rơi vào kỳ nghỉ lễ; giá trị thật của tóm tắt bắt đầu khi quý 1 chạy.

---

**Lượt 10 — `okr-trong-chat`** (T3, 11/12 → 18/12, nếu đủ điều kiện)

- **Câu giao:** giữ nguyên như lộ trình.
- **Phạm vi:**
  - **AI-06:** phát hiện bằng luật; Trợ lý OKR chỉ viết một dòng diễn giải, qua cùng bộ kiểm.
    Báo theo cạnh, nguội 14 ngày.
  - **AI-07, chat:** đường đi chọn ở Cổng 1.5 theo kết quả phép thử stub ở N0.
    - Stub đạt đủ tám điểm thì chat vào lượt 10, chạy ở gốc, qua cầu nối nhận vai `okr` chỉ khi
      token mang purpose OKR và phạm vi không có `doi-tac`.
    - **Không đạt thì chat lùi sang tháng 1 thành một lượt riêng**, có thể là eve app riêng gọi
      qua `defineRemoteAgent` ([eve] `guides/remote-agents.md`). Khe 11/12 → 18/12 dành cho lượt
      8. Lý do: lượt 10 đã là T3, có Cổng 1.5, thêm scope Slack và quản trị Slack phải đồng ý
      lại; thêm một app nữa (biến môi trường, tin cậy OIDC, R13) thì 6 ngày làm việc không đủ.
    - Trần câu theo người mỗi ngày là bắt buộc.
    - Phương pháp OKR là skill tĩnh.
  - **NH-06:** tất định, không AI.
- **Đứng trên:** lượt 4, lượt 9.
- **Điều kiện mở:** như lộ trình, cộng phép thử stub đạt. Đề nghị (suy luận, mặc định có veto
  ở 9.2): điều kiện của lộ trình đo độ trễ Cập nhật tuần, tức là điều kiện của NH-06; tách
  AI-06 và AI-07 khỏi nó ở Cổng Đáng lượt 10, để chat không bị kéo lùi theo NH-06.

---

**Sau R3**

- **Nháp «điều học được»** (T2, có điều kiện, sớm nhất 04/01):
  - đó là dòng `OkrDeXuat` với trường `dieuHocDuoc`, dùng lại nguyên sổ đề xuất;
  - người nhận hay sửa thì chữ vào ô của lượt 7;
  - Cổng Đáng của nó phải gắn với một mã trong bản phạm vi; hôm nay chưa có mã nào;
  - đóng quý 4 chạy 28/12 → 08/01, nên mở 04/01 chỉ còn phục vụ phần cuối của đợt đóng quý;
    giá trị chính của nó là đóng quý 1.
- **Tóm tắt cấp bộ phận:** gộp từ các bản đã kiểm của phòng ban. Làm sau khi bản phòng ban đã có
  số đo, tức tháng 1.

### 6.4 Gantt

```mermaid
gantt
  dateFormat YYYY-MM-DD
  axisFormat %d/%m
  section Nền đo, không mã sản phẩm
  N0 đo ZDR · cache · reasoning · stub · chi phí  :n0, 2026-09-28, 2026-10-23
  N1 gom golden cases từ OKR quý 4 thật          :n1, 2026-11-02, 2026-11-20
  section Các lượt, tuần tự
  Lượt 4 cập nhật tuần (ước)                     :r4, 2026-09-28, 7d
  Vá lối rò Slack của Tác nhân (T2)              :s1, after r4, 4d
  Lượt 5 toàn cảnh (ước)                         :r5, after s1, 2026-10-23
  R1 lên production                              :milestone, m1, 2026-10-23, 0d
  Lượt 6 số tự chảy                              :r6, 2026-10-26, 7d
  Lượt 7 rà chấm khép kỳ                         :r7, after r6, 6d
  Lượt 9a nền T3 có Cổng 1.5                     :crit, a9, 2026-11-09, 2026-11-21
  R2 lên production                              :milestone, m2, 2026-11-20, 0d
  Lượt 9b đề xuất khi bấm                        :crit, b9, 2026-11-23, 2026-12-05
  Lượt 9c tóm tắt tuần                           :c9, 2026-12-07, 4d
  Lượt 10 nếu stub đạt, không thì lượt 8         :x10, 2026-12-11, 2026-12-19
  R3 lên production                              :milestone, m3, 2026-12-18, 0d
  Nháp điều học được, có điều kiện               :l1, 2027-01-04, 4d
  Lượt 8 nếu chưa vào khe 11/12                  :r8, 2027-01-04, 6d
  section Vận hành
  Quý 4 mọi phòng ban                            :q4, 2026-10-26, 2026-12-31
  Cấp OneHub đặt OKR năm 2027                    :ld, 2026-12-07, 2026-12-18
  Đặt OKR quý 1                                  :q1, 2026-12-21, 2027-01-11
  Đóng quý 4                                     :cl, 2026-12-28, 2027-01-08
  Cổng Giá trị R1 đến R3                         :milestone, m4, 2027-02-09, 0d
```

Gantt tính theo ngày lịch. Ngày của lượt 4, lượt 5 và lượt vá Slack là ước: hai hợp đồng lượt
4, 5 đã `implemented` nhưng chưa gộp. Hai dải tháng 1 là «nếu có», không chạy song song thật:
nếu cả hai cùng mở thì xếp tuần tự.

### 6.5 Mốc «sẵn sàng cho mùa đặt OKR quý 1» (kiểm vào 18/12)

1. Đề xuất đã bật cho mọi đơn vị cần, và đã dùng thật 9 ngày làm việc (07/12 → 18/12) ở cấp
   OneHub. Số đo đủ hai tuần có vào 21/12, ngày mở mùa đặt OKR quý 1. Nếu máy đếm được gần như
   không thành viên ban lãnh đạo nào mang vai quản trị, mốc này chỉ còn số đo trên máy dev và
   golden cases.
2. Đã có số đo của 9 ngày đó: p50, tỷ lệ nhận, câu bị bỏ, chi phí mỗi đề xuất được nhận.
   - Dự báo tháng 12 và tháng 1 được đặt cạnh trần, bằng công thức ở 4.10.
   - Nếu dự báo vượt, chủ kho quyết nâng trần hay giữ nguyên **trước** 21/12, không phải giữa
     mùa, dựa trên số của 9 ngày này.
3. Công tắc việc × đơn vị chạy đúng: tắt một loại đề xuất không tắt tóm tắt.
4. Eval cách ly pass^3 xanh; phép đo đường vào của vai «chỉ OKR» xanh.
5. ZDR đã xác nhận trên production, bằng một lời gọi có cờ và bằng test ghim; judge của eval
   cũng mang cờ.
6. Có một trang «Trợ lý OKR làm gì, không làm gì» cho Trưởng đơn vị. Trang này mở rộng từ
   hướng dẫn theo vai của lượt 5.

### 6.6 Nếu lịch trượt

Các lượt đi tuần tự, nên trễ ở bất kỳ lượt nào trước 9a đều đẩy 9a.

| Trượt | Hệ quả | Giữ gì |
|---|---|---|
| Lượt 4–7 trễ dưới hai tuần | 9a mở muộn hơn 09/11 nhưng trước 23/11 | 9b vẫn kịp 07/12 và 21/12 |
| Lượt 4–7 trễ quá hai tuần (9a mở sau 23/11) | 9b trượt, mất cửa sổ 07/12 | Giữ đích 21/12 cho mùa quý 1; 9c sang tháng 1 |
| Lượt 7 trễ (hạn cứng 14/12) | Lượt 7 vẫn phải đi trước 9a, nên cả lượt 9 lùi theo | Không có phần nào của lượt 9 chạy trước lượt 7 |
| 9a trễ quá 20/11 | 9b bắt đầu muộn; mất cửa sổ 07/12 nếu 9a xong sau 26/11 | Giữ đích 18/12 cho quý 1; 9c sang tháng 1 |
| Lượt 10 không đủ điều kiện, hoặc phép thử stub không đạt | Chat lùi sang tháng 1 | Khe 11/12 → 18/12 dành cho lượt 8 |
| Chủ kho trả lời «không gửi» | Không có lượt 9 | Nền «đo» vẫn có ích để chia $20. Không khung nào bị bỏ phí |

---

## 7. Sau OKR: ba bước mở rộng

**Được gì.** Mỗi bước mở rộng có một điều kiện đo được. Không bước nào mở chỉ vì «nên có».

### 7.1 Miền thứ hai: tóm tắt tuần cho Điều phối 30 ngày

- **Người dùng được gì.** Người cầm trịch và Trưởng phòng ban nhận tóm tắt tuần của các kế
  hoạch đang chạy: bước quá hạn, Kế hoạch im, Mốc ngày sắp tới. Câu nào cũng dẫn về bước gốc.
- **Điều kiện kích hoạt** (cần cả ba):
  1. Tóm tắt tuần của OKR qua Cổng Giá trị (09/02/2027), với tỷ lệ «được mở» đạt ngưỡng chủ
     kho đã khai.
  2. Có người dùng thật hỏi tới việc này.
  3. Chủ kho quyết ZDR cho dữ liệu đối tác. Hôm nay dữ liệu đối tác đã đi tới nhà cung cấp
     model qua làn `research`, và chưa có ZDR [08].
- **Việc cần làm:**
  - phần A và phần B ở 4.13, hạng T3 vì có bảng mới;
  - đây là lượt **rút khung chung** lần đầu;
  - vai «chỉ OKR» tự động không nhận, vì phạm vi của vai đó không có `doi-tac`.

### 7.2 Knowledge tài liệu, có quyền theo nguồn

- **Người dùng được gì.** Trợ lý OKR góp ý dựa trên tài liệu chiến lược năm, hoặc trả lời câu
  hỏi tìm trong ghi chú và bình luận.
- **Điều kiện kích hoạt** (một trong ba):
  1. Log chat của lượt 10 cho thấy câu hỏi tìm trong chữ tự do nằm trong ba loại hay gặp nhất,
     và gói của một câu vượt khoảng 30k token.
  2. Chủ kho muốn Trợ lý OKR dựa trên tài liệu chiến lược. Đó là một quyết định dữ liệu mới: ai đọc
     được tài liệu nào.
  3. Soạn OKR quý 2 cần «KR tương tự các kỳ trước», và số kỳ đã đóng đủ để việc này đáng làm.
- **Việc cần làm:**
  - Bậc thang: tìm toàn văn trước (`simple` cộng `unaccent`), pgvector trên Neon sau [08].
  - Quyền của câu trả lời đi theo quyền của nguồn, theo mẫu của Cascade. Hạ tầng lọc từng câu
    theo nguồn (4.7) đã có sẵn cho việc này.
  - Hạng T3, vì có extension và migration.

### 7.3 MCP ra ngoài

- **Người dùng được gì.** Người đang làm việc trong Claude hay ChatGPT đọc được OKR của mình
  ngay trong đó, và tạo được đề xuất.
- **Điều kiện kích hoạt** (cần cả ba):
  1. Một nhóm người dùng thật dùng Claude hay ChatGPT cho việc hằng ngày, và hỏi tới.
  2. Có OAuth theo người.
  3. Có phép đo cho đường vào mới, theo luật «một phép đo cho mỗi đường vào» của lượt 2.
- **Việc cần làm:**
  - một lớp bọc mỏng trên REST, OpenAPI và khoá API có sẵn;
  - chỉ lộ tool đọc và tool «tạo đề xuất», không có tool ghi thẳng. Đề xuất vẫn chờ người nhận
    trong app.
- **Vì sao chưa làm ở R3:**
  - thêm một đường vào phải đo;
  - chưa ai đòi;
  - rủi ro MCP không xác thực đã thấy ngoài thị trường (4.12).

---

## 8. Rủi ro và điều cố ý không làm

### 8.1 Rủi ro và cách giảm

| # | Rủi ro | Mức | Cách giảm |
|---|---|---|---|
| R1 | **Chi phí vỡ trần trong mùa đặt OKR quý 1.** Bước chuyển tiếp ở agent gốc chiếm khoảng 55–60% đầu vào; kịch bản vừa ra $8,43 ngay cả khi 60% trúng cache | Cao | Đo ở N0. Dùng lại kết quả theo `inputHash`. Trần theo người. Trong pha đặt OKR, tóm tắt nhường đề xuất. Báo ở 80%. Ba nấc giảm, xếp theo thứ tự đảo được (4.10) |
| R2 | **Rò dữ liệu đối tác qua gốc chuyển tiếp** | Cao nếu bỏ sót | Hook uỷ quyền; `brief` và `reason` là hằng; subagent không dùng `message`; test tĩnh danh sách tool và tập `reason`; eval đầu-cuối pass^3; phép đo đường vào |
| R3 | **ZDR lọt** | Cao nếu bỏ sót | ZDR đặt cố định ở cấp agent của subagent và trong judge, có test ghim. Kết quả về gốc chỉ là mã; kết quả lỗi của subagent được đo ở N0 và chặn bằng hook nếu có chữ. Gateway trả `no_providers_available` khi không có nhà cung cấp ZDR |
| R4 | **Nút mờ giữa mùa**: rủi ro niềm tin, không chỉ rủi ro tiền | Vừa | Báo 80%; chủ kho quyết trần trước 21/12 (6.5); nút mờ kèm câu «Trợ lý OKR tạm nghỉ tới 01/MM» (4.9, «Người dùng thấy gì»); trong pha đặt OKR, đề xuất được ưu tiên hơn tóm tắt |
| R5 | **Độ trễ nút bấm**, vì có bốn bước model | Vừa | Ưu tiên cao nhất trong làn `research`; trạng thái đang soạn; ngưỡng p50 ≤ 8 giây; chờ quá 30 giây thì báo rõ. Nếu trượt: dùng model nhanh cho agent gốc (nấc 2), rồi đường của lượt 10 |
| R6 | **Chất lượng tiếng Việt, và câu Anh–Việt trộn** | Vừa | Golden cases từ OKR thật; judge đã hiệu chỉnh; tắt được từng loại đề xuất; người luôn là người quyết |
| R7 | **Sổ chi phí AI hụt**: hook nuốt lỗi | Vừa | Thước đối soát tự động mỗi tháng với Custom Reporting của Gateway, lệch quá ±10% thì báo quản trị; ghi theo `meta.id` nên không trùng |
| R8 | **Subagent không đọc được thuộc tính của phiên cha** | Vừa | Đo ở N0. Lối lùi: chuyển id qua `message` và kiểm lại bằng hàng việc; nhánh `khong-lam-duoc`. Chuyện «vượt trần thì treo» đã đóng bằng `mode: "task"` (4.3) |
| R9 | **Lịch R3 dồn**: 9a, 9b, 9c, lượt 10 hoặc lượt 8, trong khi lượt 7 có hạn cứng 14/12 | Vừa | 9a mở sớm vào khe 09/11 → 20/11; 9c lùi được sang tháng 1; chat có lối lùi sang tháng 1 thay vì dựng thêm app trong 6 ngày; lượt 8 được xếp lại (6.2) |
| R10 | **Context pack dùng chung lọt ý từ nguồn không được dẫn**, kể từ lượt 8 | Vừa | Context pack chỉ chứa thứ mọi người nhận đều đọc được, hoặc chia theo tầng hiển thị |
| R11 | **Tin dồn dập làm người tắt nhắc**, đúng đường của Viva Goals | Vừa | Tối đa hai dòng báo của Trợ lý OKR, đứng sau việc của người; người nhận tắt riêng được dòng báo; đo tỷ lệ tắt; ngưỡng «không tăng» |
| R12 | **Phí bản rẽ** | Thấp | Lượt 9 không chạm lần đầu tệp mã nào của hãng. Tám tệp đã rẽ dày thêm khoảng 110 dòng (bảng dưới). Lượt vá Slack chạm lần đầu hai tệp, ghi thành chỗ rẽ có tên. Phần tổng quát gửi lên hãng: biến thể `Suggestion`, model theo purpose, hook chi phí cho phiên con, danh tính riêng khi Tác nhân chạy nền, lọc thành viên kênh Slack (qua kênh bảo mật riêng, khi chủ kho cho phép) |
| R13 | **Lượt 10 phải làm lại nhiều hơn dự tính**: tách thành app riêng nghĩa là thêm một lần triển khai, thêm biến môi trường, thêm tin cậy OIDC | Vừa | Giữ `subagents/tro_ly_okr/` tự đủ, không nhập `lib/` của gốc ngoài phần OKR. Stub không đạt thì chat sang tháng 1, không nhồi vào 6 ngày |
| R14 | **Cửa sổ 07/12 không có người dùng thật**: Mục tiêu cấp OneHub chỉ quản trị sửa được, và «ban lãnh đạo» không phải một Đơn vị | Vừa | Máy đếm trước 23/11 số thành viên ban lãnh đạo mang vai quản trị. Gần 0 thì bỏ «07/12» khỏi lẽ 1; đích còn lại là 21/12. Nếu ban lãnh đạo nhập OKR năm qua một quản trị, cửa sổ đó chỉ có một người dùng thật |

**Chỗ dày thêm trong các tệp của hãng mà bản rẽ đã sửa** (ước lượng, suy luận)

| Tệp | Hôm nay đã rẽ [git] | Lượt 9 thêm khoảng | Để làm gì |
|---|---|---|---|
| `apps/agent/agent/lib/session-purpose.ts` | 24 dòng | 3 | Giá trị `okr` |
| `apps/agent/agent/instructions/task.ts` | 4 | 8 | Nhánh `okr` đứng trước nhánh nghiên cứu |
| `apps/agent/agent/lib/dispatch.ts` | 6 | 15 | `taskAuth`, nhánh `brief` cho `okr-*` |
| `apps/agent/agent/channels/crm.ts` | 358 (phần lớn là định dạng) | 12 | `mode: "task"` và `turn.failed` cho `okr-*` |
| `packages/db/src/agent-tasks.ts` | 3 | 10 | Bốn loại việc, ưu tiên, số lần thử theo loại |
| `apps/agent/agent/lib/capabilities.ts` | 6 | 8 | Mục «Mô hình AI» |
| `apps/api/src/agent/agent-trigger.service.ts` | 32 | 25 | Phương thức xếp việc `okr-*` |
| `packages/ui/src/components/suggestion.tsx` | 6 | 30 | Biến thể «trước / sau / sửa» |
| **Cộng tám tệp mã** | | **khoảng 110** | |
| `docs/agent.md` | — | 10 | Mục OKR trong §What may be read |

`schedules/dispatch.ts` không còn bị chạm: việc tóm tắt tự đặt tuần sau bằng `dueAt` (4.2, K3).
`schema.prisma` chỉ thêm vào khối OKR và khối riêng của bản rẽ.

### 8.2 Điều cố ý không làm

| Không làm | Vì sao |
|---|---|
| Máy ghi số, Mức tự tin hay Cập nhật tuần; gợi ý Mức tự tin | NG-05 |
| Soạn trọn bộ OKR cho cả đội; chép KR cấp trên thành Mục tiêu cấp dưới | Lượt 9, mục «Ngoài phạm vi»; NG-06 |
| Nối điểm vào lương thưởng; nhận xét hay xếp hạng người; liệt kê người chưa cập nhật; điểm tổng chất lượng cho đơn vị | NG-01, NG-07 |
| Prompt đặt lịch do người dùng tự soạn; hỏi đáp tự do trước lượt 10; để model tự tính số | Lối rò khi chạy nền (2.3); gần tinh thần NG-04 (trình dựng truy vấn tự do: con số đổi nghĩa mà không ai hay) |
| Kiểm chất lượng chặn không cho lưu | Luật đã chốt: «hỏi, không chặn lưu» |
| Đề xuất trên màn Cập nhật tuần ở R3 | Giữ ngưỡng dưới 60 giây của lượt 4; bài học Viva Goals |
| Chữ AI trong tin Zalo hay Slack; tin thứ hai mỗi sáng | Mỗi sáng một tin; luật «không lưu chữ tin Zalo» |
| Agent sở hữu mục tiêu; Tác nhân do người dùng tự ghép cho OKR; đưa agent vào cây tổ chức | Bài học Lattice; `instructions` tự do chạy trong phiên sinh nội dung cho người khác đọc |
| Mở cầu nối `/eve/v1` cho vai «chỉ OKR» ở lượt 9 | Không cần cho đề xuất hay tóm tắt. Mở cầu nối là đổi quyền |
| RAG, pgvector, bộ nhớ theo người; skill động | Knowledge của OKR là dữ liệu có cấu trúc nhỏ; skill động cần sandbox |
| Registry, bản khai chung, bảng đầu ra chung trước khi có miền thứ hai | Rút khung từ một ca là đoán đường cắt |
| MCP ra ngoài ở R3 | 7.3 |
| AI Importer | Nhập bảng tính bảy cột đã có; đợt nhập lớn diễn ra trước khi có AI |
| Đo qua telemetry | Telemetry gửi về PostHog của hãng [08] |
| Nhiều nhà cung cấp model chạy song song | Một nhà cung cấp qua Gateway; đổi bằng config cộng eval |

---

## 9. Quyết định cần chủ kho

### 9.1 Quyết định chính

> **Mở lượt 9 với luật «nội dung OKR, kể cả tên đối tác người dùng tự gõ trong ghi chú, chỉ
> được gửi tới nhà cung cấp model khi có ZDR; không có ZDR thì không gửi; luật này áp cả cho
> eval», và trần khu OKR là $8/tháng trong $20 chung.**
>
> Trả lời một chạm: **«đồng ý»**, hoặc sửa luật hay con số.

- **Khuyến nghị:** đồng ý, và trả lời ngay, không đợi 09/11.
- **Căn cứ:**
  - Đây là hai câu mở lượt 9 đã có trong lộ trình. Câu về tên đối tác tự gõ và câu về eval là
    hai trường hợp của cùng luật; chúng nằm ở đây, không ở mặc định có veto, vì dữ liệu đã gửi
    thì không lấy lại được.
  - ZDR theo yêu cầu miễn phí ở gói Pro, và Google Vertex có trong danh sách ZDR [08].
  - Cờ ZDR đặt cố định trong subagent và trong judge, có test ghim. Gateway lỗi
    `no_providers_available` khi không có nhà cung cấp ZDR, nên luật «không có ZDR thì không
    gửi» đứng bằng cấu trúc.
  - $8 là 40% của $20 của team. $20 hôm nay chia cho làn `research` (khoảng $0,19 mỗi phiên),
    hội thoại dựng Tác nhân, lượt chạy Tác nhân, và mọi lời gọi từ máy dev, kể cả eval; $8 để
    lại $12 cho tất cả phần đó.
  - Kịch bản vừa (40 phòng ban, 137,6 bản tóm tắt mỗi tháng; 500 lượt đề xuất trong tháng đặt
    OKR, 100 lượt ở tháng thường), theo 4.10:
    - tháng thường: $2,51–5,98, nên $8 đủ, kể cả khi không trúng cache;
    - tháng đặt OKR, 60% trúng cache: 500 × $0,013 + 137,6 × $0,014 = $6,50 + $1,93 = **$8,43,
      vượt $8 khoảng $0,43**. $8 chỉ đủ khi có thêm nấc 2 (500 × $0,010 + 137,6 × $0,011 =
      $6,51), hoặc khi ít nhất 33 trong 500 lượt được dùng lại theo `inputHash`;
    - tháng đặt OKR, không trúng cache: 500 × $0,024 + 137,6 × $0,026 = $15,58. Trần giữ $8
      bằng cách cho đề xuất tạm nghỉ sau 184–333 lượt, tuỳ tóm tắt có nhường hay không;
    - muốn đủ cho trường hợp 60% cache mà không cần nấc 2 hay dùng lại thì con số là $9.
  - Chạm trần thì đề xuất tạm nghỉ chứ không gãy. Quản trị được báo ở 80%; nâng trần là việc
    đảo được. Số đo N0 cho biết mình ở đầu nào của khoảng trước khi 9a mở.
  - Trả lời «không» thì Trợ lý OKR tắt gọn, không khung chung nào bị bỏ phí.

### 9.2 Quyết định có mặc định

Máy sẽ làm theo mặc định dưới đây, trừ khi bị veto. Chỉ việc đảo được nằm trong bảng này. Hai
việc cũ không đảo được đã rời bảng: «chữ tự do có tên đối tác vẫn vào context pack» đã gộp vào
quyết định chính; «máy chạy truy vấn trên production» đổi thành việc chủ kho chạy.

| # | Quyết định | Mặc định | Vì sao | Veto thì |
|---|---|---|---|---|
| 1 | Hạng của lượt 9 | Tách **9a nền (T3, một Cổng 1.5)**, 9b và 9c (T2). Ghi rõ là chỗ lệch lộ trình (6.1) | Có bảng mới trong `packages/db/prisma`, nên theo luật của chính lộ trình là T3. Không phải chèn lượt nào vào tháng 10 | Nếu giữ T2 thì không được thêm bảng. Khi đó phải lưu đầu ra vào bảng của hãng, là điều cả ba giám khảo khuyên tránh |
| 2 | Thứ tự lượt 8 và lượt 9 | Lượt 9 đi trước (6.2) | Lượt 9 có cửa sổ giá trị cứng; lượt 8 chưa mở được trước 23/11 | Lượt 8 đi trước, 9b trượt khỏi cửa sổ 07/12 |
| 3 | Từ điển | Thêm bốn mục «Trợ lý OKR», «Đề xuất», «Tóm tắt tuần», «Sổ chi phí AI», duyệt ở **Cổng Đáng 9a**. Mục «Trợ lý OKR» ghi «Khác Trợ lý AI» và `_Avoid_: trợ lý` (một mình); nút là «Nhờ Trợ lý OKR góp ý» | «Gợi ý» và «Trợ lý AI» đã mang nghĩa khác; `CONTEXT.md` cấm «trợ lý» đứng một mình | Chủ kho chọn chữ khác |
| 4 | Giờ chạy tóm tắt | Sáng hôm sau ngày cập nhật của Chu kỳ, xong trước giờ nhắc sớm nhất của các Trưởng phòng ban nhận nó; không kịp thì dòng báo dời sang sáng hôm sau. Là tham số theo Chu kỳ | Đọc được số mới nhất trước buổi họp tuần | Chọn giờ khác |
| 5 | Nơi lưu golden cases | Ngoài git, trong thư mục bị gitignore trên máy chủ kho; eval đọc từ đó | Dữ liệu OKR thật vào lịch sử git thì khó xoá | Chỉ dùng ca dựng tay |
| 6 | Truy vấn trên production | Máy soạn sẵn truy vấn chỉ-đọc (chỉ cộng usage, đếm người và đơn vị, không đọc nội dung); chủ kho chạy, hoặc cấp một vai chỉ-đọc lúc cần | Máy không đọc khoá DB trong `.env` (09 G20) | Đo trên local, kém đại diện hơn |
| 7 | Đường chat của lượt 10 | Quyết ở Cổng 1.5 của lượt 10, theo kết quả phép thử stub. Stub không đạt đủ tám điểm thì chat sang tháng 1 thành một lượt riêng; khe 11/12 → 18/12 cho lượt 8 | Cách ly phải hỏng theo hướng đóng; eve app riêng không vừa 6 ngày làm việc | Chọn đường khác ở chính Cổng 1.5 đó |
| 8 | Mở Trợ lý OKR theo đơn vị | Mục tiêu cấp OneHub (người mang vai quản trị) và các bộ phận mà trưởng bộ phận thuộc ban lãnh đạo, từ 07/12; mọi phòng ban từ 21/12. Nếu máy đếm được gần như không thành viên ban lãnh đạo nào mang vai quản trị, bỏ «07/12» khỏi lẽ 1 | Chín ngày làm việc phản hồi từ những người dùng khó tính nhất trước mùa. Nếu ban lãnh đạo nhập OKR năm qua một quản trị, cửa sổ 07/12 chỉ có một người dùng thật | Mở cho cả công ty ngay từ 07/12 |
| 9 | Lối rò Slack và lối chạy bằng danh tính người dựng của Tác nhân | Vá trong bản rẽ như một lượt T2 riêng, ngay sau lượt 4 gộp và trước 26/10; ghi thành chỗ rẽ có tên. **Báo cho hãng không phải mặc định**: qua kênh báo lỗi bảo mật riêng, không qua PR công khai, và máy không gửi gì cho tới khi chủ kho cho phép | Lối rò có thật từ 26/10, độc lập với Trợ lý OKR. PR công khai là công bố lỗ hổng | Để sau, chấp nhận rủi ro |
| 10 | Làn `research` danh bạ | Đo trong sổ chung, chưa chặn | Mới có số đo một phiên ($0,19), chưa có tổng tháng để đặt trần | Đặt trần ngay |
| 11 | DO-06 | Tính bằng mã, không dùng model | Số do model nghĩ ra thì không có nguồn để kiểm | Để model giải thích xu hướng, nhưng vẫn qua bộ kiểm |
| 12 | Ngưỡng Cổng Giá trị | Chủ kho khai ở Cổng Đáng lượt 9; mốc để bàn nằm ở 4.9 | Người khai trước khi thấy số | — |
| 13 | Chân đứng của 9b | Lượt 3, và luật lượt 7 nếu đã lên. Lệch lộ trình vốn ghi lượt 4, 7 (6.1, chỗ lệch 3) | Viết lại và Căn chỉnh không cần Cập nhật tuần | 9b đợi đủ tuần dữ liệu của lượt 4 |
| 14 | 9a mở sớm | Ngay sau lượt 7 gộp, sớm nhất 09/11; hạn chót mở 23/11 | Khe 09/11 → 20/11 đang trống; 9a không hiện gì nên lên cùng R2 không đổi gì trên màn | 9a mở 23/11, cả lượt 9 dồn vào 23/11 → 10/12 |
| 15 | Thứ tự nhường khi tiền sắp hết | Theo pha của Chu kỳ: pha đặt OKR thì tóm tắt nghỉ trước; pha khác thì đề xuất nghỉ trước | 21/12 → 11/01 là đỉnh giá trị của đề xuất; tóm tắt quý 4 cuối tháng 12 rơi vào kỳ nghỉ lễ | Luôn giữ chỗ cho tóm tắt |
| 16 | Điều kiện mở lượt 10 | Tách AI-06 và AI-07 khỏi điều kiện độ trễ Cập nhật tuần (điều kiện của NH-06), ở Cổng Đáng lượt 10 | Để chat không bị kéo lùi theo NH-06 | Giữ một điều kiện chung như lộ trình |
| 17 | Dòng tóm tắt đứng một mình | Đủ để gửi Nhắc buổi sáng cho Trưởng phòng ban nhận tóm tắt, tối đa một lần mỗi tuần | Nhắc buổi sáng «ngày không có gì thì không gửi»; một tóm tắt mới là có việc | Chỉ gửi dòng tóm tắt kèm tin đã có việc của người |

---

## Phụ lục A — Nguồn chính

**Tability, chính chủ**

- https://www.tability.io/ai
- https://www.tability.io/pricing
- https://guides.tability.io/docs/become-a-tability-power-user/how-tos/put-your-okrs-on-autopilot-with-tabilitys-ai-automation
- https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/scheduled-prompts
- https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/ai-mode
- https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-score
- https://guides.tability.io/docs/become-a-tability-power-user/features/plans/plan-permissions
- https://guides.tability.io/docs/become-a-tability-power-user/features/plans/import-okrs-and-kpis-with-ai
- https://guides.tability.io/docs/become-a-tability-power-user/integrations/tability-mcp-server
- https://guides.tability.io/docs/become-a-tability-power-user/features/ai-features/agent-workforce-manager
- https://guides.tability.io/docs/become-a-tability-power-user/features/reporting/workspace-insights
- https://guides.tability.io/legals/artificial-intelligence-policy
- https://feedback.tability.io/changelog
- https://www.tability.io/odt/articles/guide-chief-of-staff-weekly-leadership-brief
- https://github.com/tabilityio/tability-skills

**Tability, bên thứ ba**

- https://slack.com/marketplace/A020WJERWCU-tabby-by-tability
- https://www.g2.com/products/tability/reviews
- https://www.investible.com/blog/investment-notes-tability

**Đối thủ OKR**

- Cascade: https://feedback.cascade.app/changelog
- WorkBoard: https://www.workboard.com/resources/product-updates/gen2-ai-agents
- Perdoo: https://support.perdoo.com/en/articles/10153623-release-notes-coming-soon
- Profit.co: https://www.profit.co/integrations/profit-co-in-claude/
- Betterworks: https://www.betterworks.com/ai-for-hr ; https://www.betterworks.com/product/mcp
- Lattice: https://lattice.com/ai ; https://www.shrm.org/topics-tools/news/technology/lattice-scraps-plans-to-treat-ai-bots-as-employees-after-backlash
- Viva Goals: https://learn.microsoft.com/en-us/viva/goals/goals-retirement-faq ; https://learn.microsoft.com/en-us/viva/goals/copilot-intro
- MCP bên thứ ba không xác thực: https://glama.ai/mcp/servers/nevilhulspas/perdoo-mcp

**Nền tảng agent**

- Atlassian Rovo: https://support.atlassian.com/rovo/docs/agents-in-automations/ ; https://support.atlassian.com/rovo/docs/rovo-usage-limits/
- Microsoft Copilot Studio: https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-triggers-about
- Notion: https://www.notion.com/help/buy-and-track-notion-credits-for-custom-agents
- ClickUp: https://help.clickup.com/hc/en-us/articles/36926065055127-Super-Agent-privacy-security-and-permissions
- Linear: https://linear.app/developers/agents ; https://linear.app/docs/pulse
- Salesforce: https://architect.salesforce.com/docs/architect/fundamentals/guide/hybrid-reasoning-agentforce-builder-agent-script

**Hạ tầng**

- Vercel AI Gateway, ZDR: https://vercel.com/docs/ai-gateway/security-and-compliance/zdr
- Budgets: https://vercel.com/docs/ai-gateway/observability-and-spend/budgets
- Custom Reporting: https://vercel.com/docs/ai-gateway/observability-and-spend/custom-reporting
- Catalog model và giá: https://ai-gateway.vercel.sh/v1/models
- Neon pgvector: https://neon.com/docs/extensions/pgvector
- Zalo Bot: https://docs.zaloplatforms.com/docs/BOT

**eve 0.29.4**, ở `apps/agent/node_modules/eve/docs/`:

- `subagents.mdx`
- `agent-config.md`
- `guides/dynamic-capabilities.md`
- `guides/hooks.md`
- `guides/auth-and-route-protection.md`
- `guides/remote-agents.md`
- `concepts/default-harness.md`
- `concepts/sessions-runs-and-streaming.md`
- `skills.mdx`
- `channels/slack.mdx`
- `evals/overview.mdx`
- `evals/judge.mdx`

---

## Phụ lục B — Đính chính đã áp dụng

**Từ 09, áp cho các báo cáo nghiên cứu**

| Chỗ | Đã sửa thành |
|---|---|
| 01 F12 | Scheduled prompts **không** được tài liệu nói là lọc theo quyền người nhận; người soạn tự giữ nội dung nhạy cảm (09 G2) |
| 02 §1, §9.1 | «Generate check-in» đăng **thẳng** lên dòng thời gian KR, không phải «nháp sửa được» (09 G1) |
| 02 §9.2 | Plan Score có trong guide chính chủ: năm chiều, điểm 0–100 (09 G8) |
| 02, câu hỏi mở 4 | Tability có quyền theo plan; MCP kế thừa quyền; thao tác KPI của AI Mode theo cùng mô hình. Riêng phần *đọc* chung thì tài liệu im lặng (09 G3) |
| 03, giá | Premium: 4.000 credit, 30 prompt. Agentic: 10.000 credit, 500 prompt. Basic: không có credit |
| 03, MCP | 48 tool, không phải 27; 27 là con số lúc ra mắt (09 G4) |
| 03, Căn chỉnh | ◐ chứ không phải ○: có skill kiểm alignment, nhưng không gợi ý trong editor |
| 03, công tắc | Tability có công tắc từng tính năng và quyền theo plan; thứ nó thiếu là bật AI theo nhóm |
| 03, check-in tự động | Tách hai việc: tự đồng bộ số tự đăng; «Generate check-in» do người bấm rồi đăng thẳng |
| 05, số tool | 26 tool tự viết, cộng `tools/agent.ts`; tôi đã kiểm lại [mã] |
| 05, cấp tool theo vai ở gốc | Không làm được như viết; phải dùng subagent hoặc eve app riêng (09 G11) |
| 05, khoá Gateway riêng | Chỉ đặt được ở `step.started`, hoặc đặt tĩnh (09 G12) |
| 07, trạng thái lượt | Hợp đồng lượt 4 và lượt 5 đều đã `implemented` trong cây làm việc riêng, chưa gộp; đã kiểm lại [git], [cây] |
| 07, 08, Zalo | «Không có nút» đúng với các phương thức Bot API đã có tài liệu; cần kiểm tham chiếu `sendMessage` trước lượt 10 (09 G9) |
| 08, Slack | Không bắt buộc Slack app thứ hai; eve nhận `botToken` dạng hàm (09 G15) |
| 04, 08, chi phí | Hai ước lượng là một khoảng, không phải số đo (09 G14) |

**Từ ba giám khảo, áp cho các phương án**

| Chỗ | Đã sửa thành |
|---|---|
| A, `suggestion.tsx` | Bản rẽ **đã** sửa tệp này (6 dòng); tôi đã kiểm lại [git] |
| A, «chỉ chạm sáu tệp đã rẽ» | A còn chạm `skills/data-boundaries.md` (markdown, bản rẽ chưa sửa) và thêm chỉ mục vào `AgentTask`. Tài liệu này bỏ chỉ mục đó |
| A, `mockModel` | Chỉ dùng được cho agent dựng riêng làm fixture, không dùng trực tiếp trên agent thật ([eve] `evals/overview.mdx`) |
| A, hạng lượt 9 | T2 thành T3; tài liệu này ghi rõ chỗ lệch |
| A, giờ tóm tắt | 5 giờ sáng thứ Hai là đọc số đã cũ; đổi thành sáng hôm sau ngày cập nhật |
| A, judge | `evals.config.ts` là tệp của hãng mà bản rẽ chưa sửa; judge khai theo từng eval |
| B, E11 | «Subagent đọc được thuộc tính của phiên cha» là điều **phải đo**, chưa phải sự thật |
| B, §6.1 | Hook ở gốc **không** thấy các bước của `agent_builder` và `agent_runner` |
| B, §10.2 | «4–6 tuần số chi phí thật» là nói quá: ở gia số 0 chưa có tính năng OKR nào chạy |
| B, §1 | «Mọi tính năng sau gia số 0 là T2» là lạc quan, vì dời phần quyền cũng là chạm quyền |
| B, E7 | Phiên gốc gửi qua kênh `crm` không ở task mode; vượt trần thì hỏi Approve hay Stop, chứ không thất bại |
| C, «gemini-3.7-flash có suy nghĩ, theo NC-08» | 08 không có chữ nào như vậy. Giữ ý «đo và khoá `reasoning`», bỏ con số «gấp ba» |
| C, «cửa sổ lượt 9 là 23/11 → 18/12» | Đếm lẫn khoảng 10 ngày của lượt 10 |
| C, §3.3 | Mã hãng parse `AgentVersion.manifest` ở sáu chỗ, C mới lọc ba |

**Tôi tự phát hiện thêm**

- Gantt của lộ trình đặt lượt 8 trước 20/11, nhưng điều kiện mở của nó là sau bốn tuần dùng
  quý 4, tức sớm nhất 23/11 (6.2).
- Cổng «mồ côi» của AI Elements đỏ với tệp nào không được `apps/**` nhập, nên `inline-citation`
  chỉ vào cây cùng lúc với màn dùng nó (`docs/chat-ui.md` [mã]).

---

## Phụ lục C — Tôi đã tự kiểm những gì

**Mã**, trong bản chụp `scratchpad/onehub`:

- `apps/agent/agent/`:
  - `agent.ts`, `lib/model.ts`, `lib/session-purpose.ts`, `instructions/task.ts`;
  - `lib/capabilities.ts`, `lib/dispatch.ts` (`taskAuth`, `brief`), `lib/facts.ts`,
    `lib/approval.ts`, `lib/run-runtime.ts` (`approvedSlackDestination`),
    `lib/custom-agent-dispatch.ts` (`principalId`), `lib/workspace.ts`;
  - `hooks/audit.ts`, `hooks/activity.ts`, danh sách `hooks/`;
  - `schedules/dispatch.ts`, `channels/crm.ts` (`/internal/crm/dispatch`), `channels/eve.ts`;
  - danh sách `tools/` (26 tool cộng `agent.ts`) và `skills/`;
  - `subagents/agent_runner/{agent.ts, tools/*, sandbox/sandbox.ts}`, danh sách
    `subagents/agent_builder/`.
- `apps/agent/evals/evals.config.ts`, danh sách `apps/agent/evals/`.
- `packages/db/src/`: `agent-tasks.ts`, `settings.ts`, `onboarding-nhac.ts`, `idempotency.ts`,
  `onboarding-buoc.ts`.
- `packages/db/prisma/schema.prisma`: `AgentTask`, `AgentEvent`, `OkrProgramConfig`,
  `OkrCycle.updateWeekday`, `costUsd`; không có vector.
- `packages/validation/src/`: `okr-kr.ts`, `okr-muc-tieu.ts`, `okr-vet.ts`.
- `apps/api/src/okr/`: `tien-do.ts`, `can-chinh.ts`, `okr-access.service.ts` (các import),
  `okr.service.ts` (`alignmentTargets`), `okr.router.ts` (`restMeta`), `okr-config.ts`.
- `apps/api/src/agent/agent-trigger.service.ts` (`canReachAgent`, `onboardingMatchNeeded`);
  `apps/api/src/trpc/middlewares/pham-vi-du-lieu.middleware.ts`.
- `apps/app/app/eve/v1/[...path]/route.ts`; danh sách `apps/app/app/(app)/[slug]/okr/` và
  `settings/okr/`.
- `packages/ui/src/components/suggestion.tsx`, danh sách `ai-elements/`.
- `docs/agent.md`, `docs/api.md`, `docs/chat-ui.md`, `docs/environment.md`,
  `docs/plan/lo-trinh-okr.md`, `CONTEXT.md`, `_acceptance/vai-chi-okr/contract.md`,
  `.agents/skills/eve/SKILL.md`.

**Tự kiểm thêm cho bản 2**, trong bản chụp, trước khi áp phản biện:

- `apps/agent/agent/lib/dispatch.ts` (`taskAuth` chép `reason`; `work()` nhánh mặc định trả
  `Handle this: ${reason}`); `instructions/task.ts` (`sessionPreamble`); `schema.prisma`
  (`AgentTask.reason String`, `NotificationPreference`, `OkrTrail.note`, `OkrCycle.parentId`,
  chỉ mục `agentTask_nhac_mot_ngay`).
- `apps/agent/agent/channels/crm.ts` (`turn.failed` chỉ `settle`; `session.completed` đóng
  `"ran"`; `send` không có `mode`); `lib/dispatch-config.ts` (`research.leaseMs: 30 * MINUTE_MS`);
  `packages/db/src/agent-tasks.ts` (`MAX_ATTEMPTS = 3`); `lib/custom-agent-dispatch.ts`
  (`mode: "task"`).
- `apps/api/src/okr/okr.service.ts` (ba hàm tự mở `$transaction`); `okr-access.service.ts`
  (`suaDuocDonVi`, `assertSuaKr`); `okr-config.ts` (`viSao: 500`, `mucTieuToiDa: 200`);
  `apps/app/app/(app)/[slug]/okr/page.tsx` (`getServerTrpc`); `bang-vet.tsx` (`KHOA_HIEN`).
- `apps/agent/agent/subagents/agent_runner/agent.ts` (`defineDynamic` model);
  `agent_builder/lib/authorization.ts` (`not_authorized`); `packages/db/src/settings.ts`
  (`isDefault: true` khi trống); `session-purpose.ts` (`.catch("research")`);
  `schedules/dispatch.ts` (`lenLichNhac`); `packages/ui/src/components/suggestion.tsx`
  (`pending`), hai tệp `shimmer.tsx`; `packages/db/package.json` (`exports`).
- `docs/api.md` («Every write leaves one `OkrTrail` row»), `docs/agent.md` («only schedule and
  decides nothing»), `docs/plan/lo-trinh-okr.md` (§1 tuần tự, §3 lượt 9 đứng trên 4, 7, §5 hạn
  cứng lượt 7, §9 NG-04), `CONTEXT.md` (mục **Trợ lý AI**).
- Cây làm việc `toan-canh-okr`: `apps/api/src/okr/hop-tuan.ts` (172 dòng, `lyDoCua`, các import).
- eve: `subagents.mdx` («one failed task result»), `agent-config.md` §Runtime limits (task-mode
  thất bại bằng `SESSION_TOKEN_LIMIT_REACHED`), `guides/hooks.md` (`toolResultFrom` cho tool tự
  viết hay MCP), `evals/judge.mdx` (judge phân giải riêng; `modelOptions.providerOptions`).

**eve**: các tệp liệt kê ở phụ lục A; bản 0.29.4, đã kiểm `package.json`.

**Git**, chỉ đọc, trong kho crm:

- `git log origin/onehub`: lượt 4 và lượt 5 chưa gộp; đầu nhánh là `e394b581` (26/09 12:17, #152).
- `git show origin/onehub:_acceptance/khoa-api-ghi-thua/contract.md`: khoá API chạy với rate
  limit tắt.
- `git diff --stat origin/release origin/onehub -- apps/agent/agent/channels/crm.ts`: bản rẽ đã
  sửa tệp này (358 dòng), nên việc thêm `mode: "task"` không phải chạm lần đầu.
- `git show origin/release:packages/db/prisma/schema.prisma`: `NotificationPreference` và
  `OkrProgramConfig` không có ở bản của hãng, tức là bảng của bản rẽ.
- `git diff --stat origin/release origin/onehub` trên 16 tệp: bản rẽ chưa từng sửa
  `agent.ts`, `lib/model.ts`, `hooks/audit.ts`, `lib/approval.ts`, `lib/run-runtime.ts`,
  `evals/evals.config.ts`, `skills/data-boundaries.md`; đã sửa `session-purpose.ts` (24 dòng),
  `instructions/task.ts` (4), `lib/dispatch.ts` (6), `schedules/dispatch.ts` (4),
  `agent-tasks.ts` (3), `agent-trigger.service.ts` (32), `capabilities.ts` (6),
  `suggestion.tsx` (6).

**Lấy từ báo cáo, không tự kiểm lại**:

- mọi dữ kiện về sản phẩm bên ngoài (01–04, 09);
- 16/26 tool không kiểm purpose (06);
- mã lượt 4 trong cây làm việc riêng (07);
- giá model và chi tiết ZDR của Gateway (08);
- trạng thái hợp đồng lượt 5 (09).

---

## Nhật ký áp phản biện

Mã **MT-** là `13-phan-bien-ma-that.md`; mã **SP-** là `13-phan-bien-san-pham.md`. Mọi phát hiện
về mã đã được tự kiểm lại trong bản chụp `scratchpad/onehub`, trong cây làm việc (chỉ đọc) hoặc
trong tài liệu eve trước khi áp (Phụ lục C, «Tự kiểm thêm cho bản 2»). Không phát hiện nào sai
về sự thật. Hai phát hiện áp một phần; lý do ghi ở dòng của chúng.

**Phản biện mã thật (27)**

| Mã | Mức | Vị trí trong bản 2 | Áp? | Ghi chú |
|---|---|---|---|---|
| MT-A1 | Chặn | 4.1 chốt 1; 4.2 K1, K4; 4.3; 4.11 cách ly tĩnh; 6.3 9a | Áp | Đã kiểm `taskAuth`, nhánh mặc định `Handle this: ${reason}`, `sessionPreamble`, `AgentTask.reason String`. `reason` thành hằng; `brief` và `instructions` có nhánh `okr` riêng; test tĩnh tập `reason` |
| MT-A2 | Chặn | 4.3 «Việc hỏng đóng thế nào»; 4.2 K2, K4; 4.10 trần phiên con; 6.3 N0 điểm 6, 9a | Áp một phần | Đã kiểm `crm.ts` (`turn.failed` chỉ `settle`, đóng `"ran"`, `send` không `mode`), lease 30 phút, `MAX_ATTEMPTS = 3`, `mode: "task"` ở `custom-agent-dispatch.ts`. Áp đủ: `mode: "task"`, `completeTask` khi `turn.failed`, một lần thử, `outcome` làm nguồn cho `dangSoan` và thước. **Không áp nguyên văn** câu «hook nghe `action.result` loại `subagent-result`, khuôn `toolResultFrom`»: tài liệu eve không có loại `subagent-result`, và `toolResultFrom` chỉ nói về tool tự viết hay MCP. Thay bằng: parse `action.result` của lời gọi `tro_ly_okr` bằng `ketQuaTroLy`, N0 đo `toolResultFrom` có nhận subagent không |
| MT-B1 | Nên sửa | 4.9 luật sổ đề xuất; 4.3 hợp đồng tầng; 6.3 9b | Áp | Đã kiểm ba hàm tự mở `$transaction`. Biến thể `…Trong(tx, …)`, cập nhật có điều kiện, tính vào 9b |
| MT-B2 | Nên sửa | 4.4; 4.6; 4.7; 4.3 hợp đồng tầng | Áp | Đã kiểm `page.tsx` dùng `getServerTrpc`. Lọc ở `okr.troLyTomTat`, trang chỉ vẽ |
| MT-B3 | Nên sửa | 6.1 mục 2; 6.3 «Gửi kèm», 9c | Áp | Đã kiểm `hop-tuan.ts` (172 dòng, `lyDoCua`) trong cây `toan-canh-okr`, hợp đồng lượt 4 và 5 `implemented`. Bỏ lượt 5 khỏi «Gửi kèm»; việc dời vào 9c. Lượt 4 đã có khuôn ở `@crm/validation/okr-cap-nhat` |
| MT-B4 | Nên sửa | 4.3 bảng; 4.2 K8; 6.3 9a mục 5 | Áp | Đã kiểm `NotificationPreference` chỉ có `userId`, `channel`, và là bảng của bản rẽ (không có ở `release`), nên thêm cột không phạm luật «không sửa bảng của hãng». Cột đặt tên `dongTroLyOkr` theo SP-S3 |
| MT-B5 | Nên sửa | 0; 4.10; 9.1 | Áp | Tính lại: $8,43 (60% cache), $6,51 (nấc 2), 184 · 467 · 648 lượt; khớp phản biện. Ghi giả định giá nấc 2 (một nửa gemini-3.7-flash) |
| MT-B6 | Nên sửa | «Về chữ»; 4.2 K11; 4.5; 9.2 #3 | Áp | Đã kiểm `CONTEXT.md` mục **Trợ lý AI**. Nút «Nhờ Trợ lý OKR góp ý»; mục từ điển duyệt ở Cổng Đáng 9a |
| MT-B7 | Nên sửa | 6.1 chỗ lệch 3; 9.2 #13; 6.3 9b | Áp | Đã kiểm lộ trình §3: lượt 9 đứng trên lượt 4, 7 |
| MT-B8 | Nên sửa | 4.1 chốt 1; 6.3 N0 điểm 6; 8.1 R3 | Áp | Đã kiểm `subagents.mdx` («one failed task result») |
| MT-C1 | Nhỏ | 3.2 mục 2; 4.2 K5 | Áp | Đã kiểm `defineDynamic` ở `agent_runner`, `not_authorized` ở `agent_builder` |
| MT-C2 | Nhỏ | 3.1 hàng Agent; 4.1 chốt 1; 4.10 «Giá» | Áp | Đã kiểm `readAgentModel` trả `isDefault: true` khi trống. Bảng chi phí ghi rõ giá agent gốc là giá model đang đặt |
| MT-C3 | Nhỏ | 3.2 mục 6; 4.2 «Vì sao `okr-tien-do` ở `@crm/db`», `exports` | Áp | Chọn phương án giữ `@crm/db` với lý do đúng (`soNgayVN`), vì ít dời hơn; thêm dòng `exports` cho bốn subpath |
| MT-C4 | Nhỏ | 3.1 hàng UI; 4.2 K11; 4.12 | Áp | Đã kiểm prop `pending` và hai `shimmer.tsx` |
| MT-C5 | Nhỏ | 4.3 hợp đồng tầng; 4.9 nhãn tác giả | Áp | Đã kiểm `OkrTrail.note`, `KHOA_HIEN` |
| MT-C6 | Nhỏ | 4.3 «Còn lại»; 4.2 K8, K13; 6.3 9a mục 10 | Áp | Đã kiểm `docs/api.md` §OKR |
| MT-C7 | Nhỏ | 4.2 K3; 4.4; 4.6; 6.3 9c | Áp | Chọn làm theo luật `docs/agent.md` (`dueAt`), không theo tiền lệ lệch `lenLichNhac`. Nhờ vậy `schedules/dispatch.ts` không bị chạm |
| MT-C8 | Nhỏ | 4.2 K9; 4.10 «Sổ» | Áp | Đã kiểm `.catch("research")`. `tinhNang` suy theo kênh trước, là enum |
| MT-C9 | Nhỏ | 4.3 khuôn; 4.2 K10, «Hằng tinh chỉnh» | Áp | Đã kiểm `viSao: 500`, `mucTieuToiDa: 200`, `okrProgram`, `OKR_PROGRAM_MAC_DINH`. Hai enum, trần theo trường |
| MT-C10 | Nhỏ | 4.3 `inputHashTroLy` | Áp | Một hàm băm dùng chung |
| MT-C11 | Nhỏ | 4.3 bảng `OkrTomTat` | Áp | Đã kiểm `OkrCycle.parentId`. `@@unique([cycleId, departmentId, tuan])` |
| MT-C12 | Nhỏ | 4.9 luật «Bác rồi không mời lại» | Áp | Gộp với SP-N10 |
| MT-C13 | Nhỏ | 4.2 K1; 4.3 hợp đồng tầng | Áp | Đã kiểm `enqueue`, `lockIdempotencyKey`, chỉ mục `agentTask_nhac_mot_ngay` |
| MT-C14 | Nhỏ | 3.1 hàng Chi phí; 6.3 N0 điểm 7 | Áp | Đã kiểm `audit.ts` và `hooks.md` §Subagent isolation |
| MT-C15 | Nhỏ | 3.3 khoảng trống 8; 6.3 «Vá lối rò Slack»; 8.1 R12; 9.2 #9 | Áp một phần | Áp: ghi thành chỗ rẽ có tên, không nói «không tệp nào của hãng bị chạm lần đầu» cho lượt vá. **Không áp** «gửi lên hãng trước; chỉ vá tại chỗ nếu tới 26/10 hãng chưa gộp»: nó xung đột với SP-N5. Gửi PR công khai lên kho MIT là công bố lỗ hổng, và lối rò mở từ 26/10 nên đợi hãng là để hở. Thay bằng vá trong bản rẽ trước 26/10, báo hãng qua kênh bảo mật riêng khi chủ kho cho phép |
| MT-C16 | Nhỏ | 4.11 «Judge» | Áp | Đã kiểm `judge.mdx`: eve phân giải judge riêng; chọn họ khác là luật của mình |
| MT-C17 | Nhỏ | Nhãn [git]; 3.1 trạng thái; 4.7 mục 4; Phụ lục C | Áp | Đã kiểm `e394b581` và hợp đồng #152 (rate limit của khoá API tắt) |

**Phản biện sản phẩm (28)**

| Mã | Mức | Vị trí trong bản 2 | Áp? | Ghi chú |
|---|---|---|---|---|
| SP-C1 | Chặn | 0 lẽ 1; 4.1 «Giá trị»; 6.1; 6.6 | Áp | Đã kiểm lộ trình §1 (tuần tự), §5 (hạn cứng lượt 7) |
| SP-C2 | Chặn | 0; 4.10; 9.1 | Áp | Số học khớp MT-B5. Câu căn cứ nói rõ $8,43 > $8 và điều kiện để $8 đủ |
| SP-C3 | Chặn | 0 lẽ 1; 4.7; 6 mốc; 6.3 9b; 6.5; 8.1 R14; 9.2 #8 | Áp | Đã kiểm `suaDuocDonVi` (`onehub` → `quanTri`), `assertSuaMucTieu`, lộ trình §6. Máy đếm ở N0 điểm 7 |
| SP-N1 | Nên sửa | 0 «Kết luận», năm khuôn, bảng bốn trục | Áp | Cũng là yêu cầu 3 của đợt sửa này |
| SP-N2 | Nên sửa | 2.5; 5 (F02, F12) | Áp | Thêm cột «Mức tin», câu kết luận chung, sửa dòng Tiếng Việt và lọc theo người xem |
| SP-N3 | Nên sửa | 0 lộ trình; 6.1 mục 3; 6.3; 6.4; 9.2 #14 | Áp | 9a mở sau lượt 7, sớm nhất 09/11; hạn chót 23/11 |
| SP-N4 | Nên sửa | 6.1 bảng «Chỗ lệch lộ trình»; 6.3; 6.4; 9.2 #16 | Áp | Chín dòng lệch; nháp «điều học được» sang sau R3, sớm nhất 04/01; lượt 8 có trên Gantt |
| SP-N5 | Nên sửa | 0; 3.3; 6.3 «Vá lối rò Slack»; 6.4; 9.2 #9 | Áp | Bỏ dải song song trên Gantt; báo hãng cần chủ kho cho phép, không là mặc định |
| SP-N6 | Nên sửa | 0; 4.7 mục 5; 4.11; 6.3 N0, N1; 9.1; 9.2 #5, #6 | Áp | Tên đối tác tự gõ gộp vào quyết định chính; golden cases ngoài git; chủ kho chạy truy vấn |
| SP-N7 | Nên sửa | 0; 4.11; 9.1; 6.5 | Áp | Đã kiểm `judge.mdx` (`modelOptions.providerOptions`). Test ghim ở bộ cách ly tĩnh |
| SP-N8 | Nên sửa | 0 «Tiền»; 4.10; 4.11 «Tiền»; 9.1 | Áp | Bốn bên tiêu; $0,19 mỗi phiên [08]; eval tiêu vào $20; thêm số hạng E |
| SP-N9 | Nên sửa | 4.10 bảng trần; 9.2 #15 | Áp | Thứ tự nhường theo pha, là mặc định có veto (đảo được bằng một tham số) |
| SP-N10 | Nên sửa | 4.9 | Áp | Khoá theo trường, không theo câu |
| SP-N11 | Nên sửa | 4.5; 4.9 «Người dùng thấy gì»; 4.10; 8.1 R4 | Áp | Hết trần thì nút mờ kèm lý do; thiếu khoá thì nút biến mất; hai chỗ không còn nói ngược |
| SP-N12 | Nên sửa | 6.3 9b; 6.5 | Áp | 9 ngày làm việc; hai tuần đủ vào 21/12 |
| SP-N13 | Nên sửa | «Chữ kỹ thuật»; toàn bài | Áp | `apps/agent` gọi là tác tử; giữ `instructions`, context pack, golden cases, reasoning tokens, prefix, làn `research`, bước chuyển tiếp ở agent gốc. «Sổ chi phí AI» thành mục từ điển đề xuất. Tên tệp `goi-ngu-canh.ts` giữ nguyên: đó là định danh mã, không phải chữ trong câu |
| SP-N14 | Nên sửa | 0 lộ trình dòng 1; 6.3 N0 câu giao | Áp | |
| SP-N15 | Nên sửa | 4.10 đối soát; 4.11 hiệu chỉnh; 6.3 9a | Áp | Judge sang 9b, 9c; đối soát tự động; câu giao 9a mới. Thước so với Custom Reporting chưa kiểm API (suy luận) |
| SP-N16 | Nên sửa | 6.3 lượt 10; 9.2 #7; 8.1 R13 | Áp | |
| SP-S1 | Nhỏ | 4.10 | Áp | Tính lại mọi ô; ghi giá nấc 2, O và p, thêm số hạng L |
| SP-S2 | Nhỏ | 0; 6.3; 6.4 | Áp | 9c 07/12 → 10/12; ghi Gantt tính theo ngày lịch |
| SP-S3 | Nhỏ | 2.4; 4.12; 8.1 R11; 9.2 #17 | Áp | «Dòng báo của Trợ lý OKR»; không đếm lại KR im; dòng tóm tắt đứng một mình đủ để gửi (mặc định có veto) |
| SP-S4 | Nhỏ | 4 «Được gì»; 4.2 K11; 4.3 khuôn; 4.5; 4.7 | Áp | Đã kiểm `assertSuaKr`. Thêm nút trên hộp thoại KR, phạm vi một KR |
| SP-S5 | Nhỏ | 5 F12; 8.2 | Áp | Đã kiểm lộ trình §9 NG-04 |
| SP-S6 | Nhỏ | 0 lẽ 3; 8.1 R12 và bảng dòng thêm | Áp | Ước lượng khoảng 110 dòng trong tám tệp (suy luận) |
| SP-S7 | Nhỏ | 4.9 thước «Tóm tắt được mở» | Áp | Đã kiểm: `tu=nhac` không có trong bản chụp |
| SP-S8 | Nhỏ | 4.6 «Nhịp giờ»; 9.2 #4 | Áp | |
| SP-S9 | Nhỏ | 4.3 `TRANG_THAI_DE_XUAT`; 4.9 bậc «Hỏi» | Áp | |
