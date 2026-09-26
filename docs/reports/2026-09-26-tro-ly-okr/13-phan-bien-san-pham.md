# 13 — Phản biện 2: hoài nghi sản phẩm và kế hoạch

Soát 2026-09-26, trên `12-kien-truc-va-lo-trinh.md` (đọc trọn 1.793 dòng). Đối chiếu với
`docs/plan/lo-trinh-okr.md` (đọc trọn), `CONTEXT.md` (mục OKR, Nhắc buổi sáng, Tác nhân,
Trợ lý AI, Đơn vị, Trưởng đơn vị), `09-soat-do-du.md` (đọc trọn), và tra 03, 08, 11 khi cần.
Mã tự kiểm trong `scratchpad/onehub`; tài liệu eve tự kiểm trong
`apps/agent/node_modules/eve/docs`. Không sửa tài liệu gốc.

**Kết luận ngắn.** 3 phát hiện mức **chặn**, 16 **nên sửa**, 9 **nhỏ**. Ba chỗ chặn đều
đánh vào lý lẽ mà chủ kho sẽ dựa vào để trả lời quyết định duy nhất:

1. Lẽ «lượt 4, 5 trễ cũng không kéo lùi đề xuất» vỡ luật tuần tự của lộ trình.
2. Câu «$8 đủ cho tháng đặt OKR khi trúng cache» sai số học theo chính bảng của tài liệu.
3. «Ban lãnh đạo dùng trợ lý từ 07/12» không chạy được với luật quyền hiện có: Mục tiêu
   cấp OneHub chỉ quản trị sửa được, mà nút chỉ hiện với người sửa được.

Phần tốt, giữ nguyên: đúng một quyết định chính, trả lời một chạm; bảng «Chỗ Tability vẫn
hơn» nói thẳng; NG-05 được giữ bằng khuôn đầu ra không có trường số; «hỏi, không chặn lưu»
và «một tin mỗi sáng» được tôn trọng ở mọi chỗ tôi soát.

---

## A. Chặn

### C1 — «Lượt 4, 5 trễ không kéo lùi 9b» vỡ luật tuần tự

- **Vị trí:** §0 «Ba lẽ», lẽ 1, gạch 3 («Lượt 4 hay lượt 5 có trễ cũng không kéo lùi phần
  này»); §4.1 «Giá trị … chịu được việc lượt 4 hay lượt 5 trễ»; §6.6 dòng 1 («9b vẫn kịp
  07/12 và 21/12, vì chỉ đứng trên lượt 3»); §6.6 dòng 2 (lượt 7 trễ thì «phần viết lại và
  Căn chỉnh vẫn chạy»).
- **Vấn đề:** tài liệu lẫn «đứng trên» (cần dữ liệu của lượt nào) với «thứ tự» (lượt nào
  chạy trước). Lộ trình bắt các lượt đi **tuần tự**. Nếu lượt 4 trễ hai tuần thì lượt 5, 6,
  7 trễ theo, và 9a chỉ mở được sau lượt 7. Riêng lượt 7 có hạn cứng 14/12, nên 9a không thể
  nhảy lên trước nó. Lẽ số 1 để chọn hướng này vì thế sai đúng ở kịch bản mà nó hứa che.
- **Bằng chứng:** `docs/plan/lo-trinh-okr.md` §1: «Mọi lượt đi **tuần tự**: 32 commit ghim
  lại từ 15/09 là cái giá của nhiều nhánh song song». Hạn cứng của lượt 7: cùng tệp, §5
  «Lượt 7 … Hạn cứng: lên production trước 2026-12-14». Gantt của 12 (§6.4) đặt `a9` ở
  23/11, sau `r7`.
- **Sửa đề xuất:** thay gạch 3 của lẽ 1 bằng:
  > «Đề xuất chỉ cần dữ liệu của lượt 3. Nhưng các lượt đi tuần tự, nên lượt 4–7 trễ bao
  > nhiêu thì 9a trễ bấy nhiêu. Đệm hiện có là khe 09/11 → 20/11 (xem N3): lượt 4–7 trễ
  > dưới hai tuần thì 9b vẫn kịp 07/12; trễ hơn thì 9b trượt, và đích còn giữ được là
  > 21/12.»

  Sửa dòng 1 và dòng 2 của §6.6 theo cùng ý đó.
- **Mức:** chặn.

### C2 — «$8 đủ cho tháng đặt OKR khi trúng cache» sai theo chính bảng của tài liệu

- **Vị trí:** §0 «Căn cứ», gạch «$8 là 40% của $20»; §9.1 «Căn cứ», gạch 4; §4.10 «Đọc
  bảng», gạch 1, ý «trần chặn ở khoảng 350–650 lượt [10-A]».
- **Vấn đề:** kịch bản vừa (M = 40, G = 500) với 60% trúng cache mà **chưa** làm nấc 2 (model
  rẻ cho gốc) thì vượt $8. Muốn xuống dưới $8 phải làm nấc 2, mà nấc 2 chạm `lib/model.ts`
  của hãng và tài liệu nói chỉ làm «khi số đo buộc». Chủ kho sẽ ký $8 trên một câu sai.
  Con số «350–650 lượt» lấy từ 10-A, không khớp đơn giá của chính 12.
- **Bằng chứng (số học, đơn giá của 12 §4.10):**
  - 60% trúng cache, không nấc 2: 500 × $0,013 = $6,50; tóm tắt 40 × 4,3 × 0,8 × $0,014
    = $1,93; **cộng $8,43 > $8**.
  - Có nấc 2: 500 × $0,010 + 137,6 × $0,011 = $5,00 + $1,51 = $6,51.
  - Số đề xuất còn chỗ dưới $8, sau khi giữ chỗ cho tóm tắt: không cache (8 − 137,6 ×
    0,026) / 0,024 = **184**; 60% cache (8 − 1,93) / 0,013 = **467**. Không phải 350–650.
  - 40 phòng ban, khoảng 3 Mục tiêu mỗi phòng ban (suy luận, từ G = M × O × p = 500) là 120
    Mục tiêu. 184 lượt tức khoảng 1,5 lần bấm cho mỗi Mục tiêu trong cả tháng.
- **Sửa đề xuất:** thay câu trong §0 và §9.1 bằng:
  > «$8 là 40% của $20. Nó đủ cho kịch bản vừa ở tháng thường ($2,5–6). Trong tháng đặt
  > OKR, $8 chỉ đủ khi vừa trúng cache vừa đổi model rẻ cho chặng chuyển tiếp ($6,5);
  > chỉ trúng cache thì thiếu khoảng $0,5, và trần chặn đề xuất ở khoảng 180–470 lượt
  > mỗi tháng. Số đo N0 cho biết mình đang ở đầu nào của khoảng này trước 23/11.»

  Sửa ý «350–650» ở §4.10 thành «khoảng 180–470».
- **Mức:** chặn. Đây là căn cứ của quyết định duy nhất.

### C3 — Ban lãnh đạo không thấy nút trên Mục tiêu cấp OneHub

- **Vị trí:** §0 lẽ 1 («Kịp ban lãnh đạo đặt OKR năm 2027 (từ 07/12)»); §6 «Được gì theo
  mốc» dòng 04/12 và 07/12 → 18/12; §6.5 điểm 1; §9.2 #9 («Cấp OneHub và ban lãnh đạo từ
  07/12»).
- **Vấn đề:** ban lãnh đạo đặt OKR năm 2027 **cấp OneHub** (lộ trình §6). Luật quyền của
  lượt 3 chỉ cho **quản trị workspace** sửa Mục tiêu cấp OneHub. §4.7 lại chốt «Nút chỉ hiện
  với người sửa được». Vậy thành viên ban lãnh đạo nào không phải quản trị sẽ không thấy
  nút. «Ban lãnh đạo» cũng không phải một Đơn vị trong từ điển, nên công tắc «theo đơn vị»
  không trỏ được vào họ. Cửa sổ giá trị 07/12 là lý do chính để xếp 9b lên trước; lý do đó
  đang đứng trên một điều chưa đúng.
- **Bằng chứng:**
  - `apps/api/src/okr/okr-access.service.ts`, hàm `suaDuocDonVi`: `case "onehub": return
    q.quanTri;`
  - `assertSuaMucTieu` đi qua `assertSuaDonVi` (cùng tệp).
  - `CONTEXT.md` mục **Đơn vị** chỉ gồm bộ phận, phòng ban, gốc OneHub. Mục **Trưởng đơn
    vị**: «làm trưởng không cho thêm quyền quản trị CRM nào».
  - Lộ trình §6, bảng tuần: «2026-12-07 → 12-18 | Ban lãnh đạo đặt OKR năm 2027 cấp OneHub».
- **Sửa đề xuất:** ghi rõ giả định và cách mở cửa sổ này. Câu thay cho §9.2 #9:
  > «Mở trước cho Mục tiêu cấp OneHub, tức người có vai quản trị, và cho các bộ phận mà
  > trưởng bộ phận thuộc ban lãnh đạo, từ 07/12; mọi phòng ban từ 21/12. Nếu ban lãnh
  > đạo đặt OKR năm qua một quản trị nhập hộ, cửa sổ 07/12 chỉ có một người dùng thật.»

  Máy đếm được trước 23/11 có bao nhiêu thành viên ban lãnh đạo mang vai quản trị. Nếu con
  số đó gần 0, bỏ «07/12» khỏi lẽ 1.
- **Mức:** chặn.

---

## B. Nên sửa

### N1 — Kết luận «chưa dựng nền tảng AI tổng quát» đọc như trái yêu cầu

- **Vị trí:** §0 «Kết luận», đoạn 1–2.
- **Vấn đề:** chủ sản phẩm nói rõ không cần một usecase, mà cần một **kiến trúc mở rộng**
  (agent, skill, knowledge, tích hợp). Câu mở đầu lại nói «chưa dựng nền tảng AI tổng
  quát». Phần trả lời thật cho yêu cầu này nằm tận §4.13 và §7, còn §0 không cho thấy bốn
  trục đó đi đâu. Người đọc dừng ở §0 sẽ hiểu là yêu cầu bị gạt.
- **Bằng chứng:** đề bài của đợt này, dòng «không phải một usecase: một KIẾN TRÚC mở rộng
  được (agent, skill, knowledge, tích hợp)»; 12 §0 dòng 45–51; §4.13; §7.
- **Sửa đề xuất:** thêm ngay sau «Kết luận» một khối năm dòng:
  > «Kiến trúc mở rộng gồm năm khuôn cố định, dựng xong ở 9a: (1) mọi việc AI vào qua một
  > hàng `AgentTask`; (2) mỗi miền là một subagent riêng, không thừa kế tool của gốc; (3) bộ
  > kiểm số và trích dẫn bằng mã; (4) sổ đề xuất nhận · sửa · bác; (5) sổ chi phí và trần
  > chung. Thêm một việc trong khu OKR là một lượt T2 (4.13). Thêm miền thứ hai (Điều phối
  > 30 ngày) là lúc rút khung chung, có điều kiện ở 7.1. Skill: skill tĩnh ở lượt 10.
  > Knowledge: dữ liệu có cấu trúc, tìm toàn văn và pgvector có điều kiện ở 7.2. Tích hợp:
  > Zalo và Slack cho nhắc; MCP có điều kiện ở 7.3.»
- **Mức:** nên sửa.

### N2 — Các câu «hơn Tability» thiếu mức tin, và thiếu kết luận chung so với mục tiêu

- **Vị trí:** §2.5 bảng «OneHub hơn Tability ở đâu»; §5 cột «So với Tability».
- **Vấn đề:**
  - Bốn dòng dựa vào chuyện tài liệu Tability **không nói**, chứ chưa ai thấy Tability
    **không làm**: lọc theo người nhận (09 G2 tự ghi «nguồn im lặng»), kiểm số (03 để mức
    tin «thấp»), đo nhận · sửa · bác, không mời lại.
  - «Lọc theo người xem» chưa có tác dụng tới lượt 8. §4.7 tự ghi «bộ lọc chưa bỏ câu nào»,
    vì hôm nay mọi thành viên đọc được mọi OKR.
  - «Tiếng Việt» chưa có căn cứ: chất lượng tiếng Việt của Tability chưa ai đo (09 G21),
    của gemini-3.7-flash cũng chưa.
  - «Đo nhận · sửa · bác» là số cho chủ kho, người dùng không thấy khác gì.
  - Không có câu nào trả lời thẳng câu hỏi gốc «tương tự hoặc tốt hơn Tability» tại R3.
- **Bằng chứng:** 09 dòng 60 («cao (nguồn im lặng) / vừa (suy luận)») và dòng 79 (G21 chưa
  lấp); 03 dòng 419 («vừa (Betterworks) / thấp (phần còn lại)»); 12 §4.7, hàng «Người nhận».
- **Sửa đề xuất:**
  - Thêm cột «Mức tin» vào §2.5.
  - Đổi dòng «Tiếng Việt» thành «Chưa so được; OneHub có ca vàng tiếng Việt để đo».
  - Đổi dòng lọc theo người xem thành «Hơn từ lượt 8; trước đó ngang».
  - Mở §2.5 bằng câu:
    > «Tại R3, OneHub không ngang Tability về độ rộng: thiếu chat (trừ khi lượt 10 mở),
    > MCP, coaching trên từng KR và importer. OneHub hơn ở bốn chỗ có kiểm chứng: người
    > giữ số, bật theo đơn vị, ZDR, và số trong tóm tắt được mã kiểm. Ba chỗ còn lại chỉ
    > dựa vào việc tài liệu Tability không nói tới.»
- **Mức:** nên sửa.

### N3 — Khe trống 09/11 → 20/11, trong khi 9a bị nén vào 4 ngày

- **Vị trí:** §6.1 điểm 3; §6.3 dòng 9a; §6.4 Gantt.
- **Vấn đề:** Gantt của 12 cho lượt 7 xong khoảng 07/11 (`r6` từ 26/10, 7 ngày; `r7` 6
  ngày). Lượt 8 đã dời đi. Vậy từ 09/11 tới 20/11 không có lượt nào chạy. Trong khi đó 9a
  (T3, có Cổng 1.5, 8 hạng mục) bị nén vào thứ Hai 23/11 → thứ Năm 26/11. Lý do đợi, «không
  chạm R2», yếu, vì chính 9a «chưa có nút nào hiện». Rủi ro R9 «Lịch R3 dồn» phần lớn là do
  tài liệu tự xếp.
- **Bằng chứng:** 12 §6.4 (`r6 2026-10-26 7d`, `r7 after r6 6d`); §6.3 (`9a 23/11 → 26/11`);
  lộ trình §5 (lượt 9 chỉ cần điều kiện mở, không cần ngày).
- **Sửa đề xuất:** mở 9a ngay sau khi lượt 7 gộp (sớm nhất khoảng 09/11), nếu quyết định ở
  §0 đã có câu trả lời và phép thử ZDR đã đạt. Migration lên tắt sẵn. Câu thay cho §6.1
  điểm 3:
  > «9a mở ngay sau lượt 7, sớm nhất khoảng 09/11. Nó không hiện gì với người dùng, nên
  > lên cùng R2 cũng không đổi gì trên màn. Nếu lượt 4–7 trễ, 9a lùi theo; hạn chót để 9b
  > kịp 07/12 là 23/11.»
- **Mức:** nên sửa.

### N4 — Nhiều chỗ lệch lộ trình không được khai

- **Vị trí:** §6.1 đoạn «Lượt 9 lệch lộ trình ở một điểm».
- **Vấn đề:** tài liệu chỉ khai một chỗ lệch (T2 thành T3). Các chỗ lệch sau thì không khai:
  1. Lượt 9 dài từ 8 ngày (23/11 → 30/11) lên 18 ngày (23/11 → 10/12).
  2. Lượt 10 co từ 10 ngày (khoảng 01/12 → 10/12) xuống 8 ngày (11/12 → 18/12).
  3. AI tới tay người dùng từ 07/12, trước R3 (18/12). Lộ trình ghi AI thuộc R3.
  4. Lượt 8 không có trên Gantt của 12.
  5. «Nháp điều học được» là một lượt mới, không mang mã nào trong 78 mã của lộ trình, và
     đặt vào 21/12 → 24/12, đúng tuần đầu mùa đặt OKR quý 1.
  6. Đề nghị tách AI-06 và AI-07 khỏi điều kiện mở của lượt 10 (§6.3, «Gợi ý (suy luận)»).
     Đây là đổi luật của lộ trình, và không có trong §9.2.
- **Bằng chứng:** lộ trình §1 Gantt (`r9 2026-11-23 8d`, `r10 after r9 10d`), §1 bảng («R3
  … Trợ lý AI»), §8 (bảng phủ 78 mã, không có mã nào cho «nháp điều học được»), §5 lượt 10
  «Điều kiện mở lượt».
- **Sửa đề xuất:**
  - Thay đoạn §6.1 bằng một bảng «Chỗ lệch lộ trình», mỗi dòng ghi lộ trình nói gì, tài
    liệu này làm gì, vì sao.
  - Đưa điểm 6 vào §9.2 thành một mặc định có veto, hoặc bỏ nó.
  - Chuyển «nháp điều học được» sang «Sau R3, có điều kiện», với ngày sớm nhất 04/01. Cổng
    Đáng của nó phải gắn với một mã trong bản phạm vi.
- **Mức:** nên sửa.

### N5 — Việc vá lối rò Slack chạy song song, và «gửi lên hãng» là công bố lỗ hổng

- **Vị trí:** §0 «Lộ trình» dòng 1; §6.3 N0 điểm 8; §6.4 Gantt (`s1, 2026-09-28, 5d`, chồng
  lên `r45`); §9.2 #10.
- **Vấn đề:**
  - Việc vá chạm mã `apps/agent` và chạy song song với lượt 4 và 5, tức vỡ luật tuần tự
    (C1).
  - Nếu vá trong bản rẽ, nó là lần **đầu** bản rẽ chạm `lib/run-runtime.ts` và
    `lib/approval.ts`. Điều này trái câu «Không tệp mã nào của hãng mà bản rẽ chưa từng sửa
    bị chạm» ở §0.
  - Nếu chỉ gửi lên hãng, onehub vẫn hở cho tới lần kéo `release` kế tiếp.
  - Gửi một PR sửa lỗi rò lên một kho MIT công khai là công bố lỗ hổng. Đó là việc công bố,
    cần chủ kho cho phép, không để thành một mặc định có veto.
- **Bằng chứng:** lộ trình §1 (tuần tự); 12 Phụ lục C (bản rẽ chưa từng sửa `approval.ts`,
  `run-runtime.ts`); 12 §3.3 khoảng trống 8.
- **Sửa đề xuất:** câu thay cho §9.2 #10:
  > «Vá trong bản rẽ như một lượt T2 riêng, xếp ngay sau khi lượt 4 gộp và trước 26/10.
  > Báo cho hãng qua kênh báo lỗi bảo mật riêng, không qua PR công khai; việc gửi đi cần
  > chủ kho cho phép.»

  Bỏ `s1` khỏi dải song song trên Gantt.
- **Mức:** nên sửa.

### N6 — Bốn mặc định «có veto» thật ra là việc khó đảo hoặc phán xét

- **Vị trí:** §9.2 #5, #6, #7, #10 (#10 đã nói ở N5).
- **Vấn đề:** luật làm việc của chủ kho là chỉ việc rẻ-đảo và máy-chắc mới làm trước rồi báo.
  Ba mặc định dưới đây không thuộc loại đó:
  - **#5 (chữ tự do có tên đối tác vẫn gửi tới model):** dữ liệu đã gửi thì không lấy lại
    được.
  - **#6 (OKR thật lưu trong kho git riêng tư):** khó xoá khỏi lịch sử git.
  - **#7 (máy chạy truy vấn trên production):** chính 09 G20 đã không làm việc này vì phải
    đọc khoá DB.
- **Bằng chứng:** 09 dòng 78 (G20: «Không làm vì phải đọc khoá DB trong `.env`»); nhịp làm
  việc «Đảo rẻ và máy chắc → LÀM … Chỉ việc phán-xét / trách-nhiệm / khó-đảo mới hỏi trước».
- **Sửa đề xuất:** giữ đúng một quyết định, nhưng gộp #5 vào câu của nó:
  > «Nội dung OKR, **kể cả tên đối tác người dùng tự gõ trong ghi chú**, chỉ được gửi tới
  > nhà cung cấp model khi có ZDR; không có ZDR thì không gửi. Trần khu OKR $8/tháng trong
  > $20 chung.»

  Đổi mặc định #6 thành «lưu ngoài git, trong thư mục bị gitignore trên máy chủ kho». Đổi #7
  thành «chủ kho chạy truy vấn máy soạn sẵn, hoặc cấp một vai chỉ-đọc lúc cần».
- **Mức:** nên sửa.

### N7 — Eval gửi OKR thật tới judge mà không có ZDR

- **Vị trí:** §4.11 «Eval offline», bullet «Judge … thuộc họ model khác Gemini»; «Nguồn ca»;
  §9.2 #6.
- **Vấn đề:** ca vàng là OKR quý 4 thật, chỉ thay tên người và tên đối tác. Judge là model
  thuộc họ khác, gọi qua Gateway, và tài liệu không đặt ZDR cho nó. Vậy nội dung OKR tới một
  nhà cung cấp mà không có ZDR, trái đúng luật mà chủ kho được mời ký ở §0.
- **Bằng chứng:** eve `docs/evals/judge.mdx`, dòng 71–73 và 98: judge nhận `modelOptions`
  theo từng eval hay từng lời gọi, và «For provider-specific judge settings, use
  `modelOptions.providerOptions`»; judge gọi qua Gateway khi dùng chuỗi id.
- **Sửa đề xuất:** thêm một dòng vào bảng «Cách ly, tĩnh» của §4.11:
  > «Mọi `defineEval` có judge phải khai `judge.modelOptions.providerOptions` với ZDR, và
  > model judge phải có trong danh sách ZDR của Gateway. Có test ghim.»

  Thêm vào §9.1: «Luật này áp cả cho eval.»
- **Mức:** nên sửa.

### N8 — Số tiền nền sai ở ba chỗ

- **Vị trí:** §0 «Kết luận» («$20 mỗi tháng hôm nay đã có hai bên tiêu»); §4.10 «Đọc bảng»
  («Chưa có con số về làn nghiên cứu»); §4.11 «Tiền» («Eval chạy bằng khoá local có trần
  riêng, không tiêu vào $20 của production»).
- **Vấn đề:**
  - Hôm nay có ít nhất ba bên tiêu: nghiên cứu, hội thoại dựng Tác nhân, lượt chạy Tác nhân.
    Chính bảng `tinhNang` ở §4.10 liệt kê cả ba. Trợ lý OKR thì chưa tồn tại.
  - Làn nghiên cứu đã có số đo: khoảng $0,19 mỗi phiên.
  - $20 là ngân sách **của team** trên Gateway, và trần của khoá local đi theo ngân sách
    team. Eval, phép đo N0 và các phiên dev vì vậy tiêu vào cùng $20.
- **Bằng chứng:** 08 dòng 184 («một phiên nghiên cứu `workspace-profile` tốn khoảng **0,19
  USD**»); 04 dòng 687; ghi nhớ của kho `ai-gateway-key-and-budget.md` («ngân sách team nâng
  lên **$20**, và trần của khoá `onehub-crm-local` tự đi theo»).
- **Sửa đề xuất:**
  > «$20 của team hôm nay chia cho làn nghiên cứu (khoảng $0,19 mỗi phiên), hội thoại dựng
  > Tác nhân, lượt chạy Tác nhân, và mọi lời gọi từ máy dev, kể cả eval. Trần $8 cho khu
  > OKR để lại $12 cho tất cả phần còn lại.»

  Thêm một dòng «eval và dev» vào công thức tháng.
- **Mức:** nên sửa.

### N9 — Giữ chỗ cho tóm tắt đi ngược giá trị mùa đặt OKR

- **Vị trí:** §4.10, bảng «Trần», dòng «Giữ chỗ cho tóm tắt».
- **Vấn đề:** khi tiền sắp hết, luật này dừng đề xuất trước để tóm tắt vẫn chạy. Nhưng chính
  tài liệu nói tóm tắt quý 4 cuối tháng 12 «rơi vào kỳ nghỉ lễ» và giá trị thật chỉ bắt đầu
  khi quý 1 chạy. Còn 21/12 → 11/01 là đỉnh giá trị của đề xuất. Chọn việc nào nhường việc
  nào là một phán xét sản phẩm bị giấu trong một dòng bảng.
- **Bằng chứng:** 12 §6.3, lượt 9c, mục «Nếu trễ»; §6 «Được gì theo mốc», dòng 21/12 →
  11/01.
- **Sửa đề xuất:** thứ tự ưu tiên thành một tham số theo pha của Chu kỳ:
  > «Khi Chu kỳ đang ở pha đặt OKR, đề xuất được ưu tiên và tóm tắt tạm nghỉ trước. Ở các
  > pha khác, tóm tắt được ưu tiên.»
- **Mức:** nên sửa.

### N10 — «Bác rồi không mời lại» chỉ khớp đúng từng câu

- **Vị trí:** §4.9 «Luật của sổ đề xuất», dòng 1.
- **Vấn đề:** khoá chặn là «câu đã chuẩn hoá». Model viết lại theo cách khác mỗi lần bấm,
  nên một đề xuất đã bị bác sẽ quay lại dưới dạng khác. Người dùng gặp đúng điều luật đã
  chốt muốn tránh. Hai loại dòng `hoi` và `can-chinh` cũng chưa có khoá chặn nào.
- **Bằng chứng:** 12 §4.3 (`dongDeXuat`: `hoi` có `maVanDe`, `can-chinh` có `dich`, không có
  `truong`); ràng buộc đã chốt «bị bác không mời lại».
- **Sửa đề xuất:**
  > «Đã bác một đề xuất viết lại cho trường X của Mục tiêu hay KR nào thì không đề xuất
  > viết lại trường X nữa, cho tới khi chính người dùng sửa trường đó. Dòng `hoi` khoá
  > theo (đối tượng, mã vấn đề). Dòng `can-chinh` khoá theo (Mục tiêu, đích).»
- **Mức:** nên sửa.

### N11 — Thiếu trạng thái rỗng, lỗi và tắt AI; hai chỗ nói ngược nhau

- **Vị trí:** §4.5 («hỏi lại mỗi 1,5 giây tới khi có đề xuất»); §4.6 nhánh «cần xem»; §4.10
  dòng «Trần tháng khu OKR»; §8.1 R4.
- **Vấn đề:** lộ trình buộc mọi màn có trạng thái rỗng, đang tải và lỗi. Tài liệu chưa nói
  người dùng thấy gì trong các trường hợp:
  - không có đề xuất nào vì câu đã tốt (ca vàng buộc «không đề xuất gì»);
  - việc kết thúc `khong-lam-duoc`, `het-tran-gateway`, hay không tới được tác tử. Khi đó
    vòng hỏi lại 1,5 giây không có hạn;
  - đề xuất tự hết hạn khi người đã sửa câu;
  - tóm tắt bị giữ ở «cần xem»: **không có ai được giao xem** và không có màn nào để xem;
  - tuần không có Cập nhật tuần nào;
  - mọi câu bị lọc theo người xem;
  - đơn vị đang tắt trợ lý.

  Thêm vào đó, §4.10 ghi «Nút biến mất … quản trị thấy lý do ở Cài đặt», còn R4 ghi «nút ghi
  rõ lý do».
- **Bằng chứng:** lộ trình §2: «mỗi màn có trạng thái rỗng · đang tải · lỗi»; 12 §4.3
  (`ketQuaTroLy.maLoi`, `troLySanSang.lyDo`), §4.11 («câu đã tốt (phải **không** đề xuất
  gì)»).
- **Sửa đề xuất:** thêm một bảng «Người dùng thấy gì» vào §4.9, mỗi mã lỗi và mỗi lý do một
  dòng. Chốt chung:
  - thiếu khoá thì nút biến mất;
  - hết trần tháng hay trần ngày thì nút còn nhưng mờ, kèm câu «Trợ lý tạm nghỉ tới
    01/MM»;
  - chờ quá 30 giây thì hiện «Trợ lý chưa trả lời được, thử lại sau»;
  - không có đề xuất nào thì hiện «Trợ lý không thấy chỗ nào cần sửa»;
  - tóm tắt «cần xem» chỉ hiện cho quản trị chương trình, ở màn sức khoẻ chương trình của
    lượt 5.
- **Mức:** nên sửa.

### N12 — «Hai tuần dùng thật» trước R3 chỉ có 11 ngày

- **Vị trí:** §6.5 điểm 1; §6.3 lượt 9b, ngưỡng «đo sau hai tuần dùng»; §9.2 #9, cột «Vì
  sao».
- **Vấn đề:** từ thứ Hai 07/12 tới thứ Sáu 18/12 là 11 ngày lịch, 9 ngày làm việc. Hai tuần
  dùng thật sớm nhất là 21/12, tức sau R3 và đúng ngày mở mùa đặt OKR quý 1.
- **Bằng chứng:** `date`: 2026-12-07 là thứ Hai, 2026-12-18 là thứ Sáu, 2026-12-21 là thứ
  Hai.
- **Sửa đề xuất:** đổi §6.5 điểm 1 thành
  > «Đề xuất đã dùng thật 9 ngày làm việc (07/12 → 18/12). Số đo đủ hai tuần có vào
  > 21/12, ngày mở mùa đặt OKR quý 1.»

  Lấy ngày chốt trần ở §6.5 điểm 2 theo số của 9 ngày này.
- **Mức:** nên sửa.

### N13 — Dùng «tác nhân» sai nghĩa từ điển, và tự đúc từ cho thuật ngữ kỹ thuật

- **Vị trí:** §4.2 «Hằng tinh chỉnh» («Cả API lẫn tác nhân cùng đọc», «chỉ tác nhân dùng»);
  §4.3 («gọi HTTP sang tác nhân»); §4.10 («tác nhân kiểm lại trước khi gửi», «tác nhân đóng
  mọi việc `okr-*`», «chưa nối tác nhân»); §3.3 khoảng trống 4 và 5. Cùng với đó là toàn bài:
  «lời dặn», «gói ngữ cảnh», «ca vàng», «token suy nghĩ», «mức suy nghĩ», «tiền tố», «chặng
  gốc», «làn nghiên cứu», «sổ chi phí».
- **Vấn đề:**
  - Trong từ điển, **Tác nhân** là việc tự động do người dùng dựng ra. Tài liệu lại dùng chữ
    này cho `apps/agent`, và ở §3.1, §3.3 dòng 8 thì dùng đúng nghĩa từ điển. Cùng một chữ
    mang hai nghĩa trong một bài.
  - Các plan của kho gọi `apps/agent` là «tác tử».
  - Chín cụm còn lại không có trong `CONTEXT.md` hay `docs/`. Luật kho cấm tự đúc từ ghép
    tiếng Việt cho thuật ngữ kỹ thuật.
- **Bằng chứng:**
  - `CONTEXT.md`, mục **Tác nhân** («một việc tự động do người dùng dựng ra») và mục **Trợ
    lý AI**, dòng `_Avoid_: agent, eve`.
  - `docs/superpowers/plans/2026-09-22-may-nhac-truoc-nguoi.md:7` («Tác tử (`apps/agent`)»).
  - grep trong `CONTEXT.md`, `docs/`, `apps/agent/agent`: 0 kết quả cho «lời dặn», «gói ngữ
    cảnh», «ca vàng», «sổ chi phí», «chặng gốc», «token suy nghĩ», «mức suy nghĩ», «làn
    nghiên cứu».
  - `CLAUDE.md` §Ngôn ngữ sản phẩm.
- **Sửa đề xuất:**
  - «tác nhân» (nghĩa là `apps/agent`) → `apps/agent`.
  - «lời dặn» → `instructions`.
  - «gói ngữ cảnh» → context pack.
  - «ca vàng» → golden cases.
  - «token suy nghĩ», «mức suy nghĩ» → reasoning tokens, `reasoning`.
  - «tiền tố» → prefix.
  - «chặng gốc» → bước chuyển tiếp ở agent gốc.
  - «làn nghiên cứu» → làn `research` của `AgentTask`.
  - Giữ «sổ chi phí» chỉ ở chữ hiện trên màn (quản trị thấy), và thêm mục vào từ điển ở 9a.
- **Mức:** nên sửa.

### N14 — Vài câu ở §0 không còn nghĩa khi bỏ tên kỹ thuật

- **Vị trí:** §0 «Lộ trình trong 5 dòng», dòng 1 («Máy đo: ZDR, cache, token suy nghĩ, cỡ
  tiền tố, phép thử «stub cùng tên», và chi phí của làn nghiên cứu»); §0 «Kiến trúc trong 5
  dòng», dòng 4.
- **Vấn đề:** xoá tên kỹ thuật đi thì dòng 1 không còn gì. Người đọc sản phẩm không biết máy
  đo để trả lời câu hỏi nào của mình.
- **Bằng chứng:** phép thử «xoá tên file, hàm, lệnh» trong nhịp làm việc của chủ kho.
- **Sửa đề xuất:** thay dòng 1 bằng:
  > «Máy đo trước bốn điều: nội dung OKR gửi đi có được giữ kín ở phía nhà cung cấp không;
  > mỗi lần bấm tốn bao nhiêu; phần tốn nhất nằm ở đâu; và $20 hiện đang đi đâu.»
- **Mức:** nên sửa.

### N15 — Phần nền và việc định kỳ quá tay cho một người

- **Vị trí:** §6.3 lượt 9a (8 hạng mục trong 4 ngày); §4.10 «Đối soát mỗi tuần»; §4.11
  «Hiệu chỉnh».
- **Vấn đề:**
  - 9a gồm: ba bảng cộng năm cột, hai hook, subagent, màn Cài đặt, bảy bộ eval, dời mã, tài
    liệu. Tất cả là T3, có Cổng 1.5.
  - Việc định kỳ rơi vào chủ kho:
    - đối soát ±10% với báo cáo Gateway mỗi tuần, làm tay;
    - hiệu chỉnh judge, 20 đầu ra cho mỗi bộ có judge. Có ba bộ (Viết lại, Tóm tắt, NG),
      tức khoảng 60 lượt chấm;
    - xem tóm tắt «cần xem» (N11).
  - Câu giao của 9a có «Trợ lý chưa làm gì», trái nguyên tắc «mỗi lượt giao một câu người
    dùng nói được».
- **Bằng chứng:** lộ trình §2, gạch 1; 12 §4.11 («Chủ kho chấm đạt hay không đạt 20 đầu ra
  một lần … ít nhất 85%»).
- **Sửa đề xuất:**
  - Chuyển các bộ eval có judge sang 9b; trong 9a chỉ giữ eval cách ly (bằng mã).
  - Đối soát chạy tự động mỗi tháng, bằng một thước so với Custom Reporting; lệch quá 10%
    thì báo vào Nhắc buổi sáng của quản trị.
  - Hiệu chỉnh judge lần lượt, mỗi lượt một bộ.
  - Câu giao của 9a:
    > «Quản trị thấy tháng này AI tiêu bao nhiêu cho từng việc, và bật hay tắt được trợ lý
    > OKR theo đơn vị.»
- **Mức:** nên sửa.

### N16 — Lối lùi «eve app riêng» không vừa khe 11/12 → 18/12

- **Vị trí:** §6.3 lượt 10, AI-07, gạch «Không đạt thì tách `tro_ly_okr` thành một eve app
  riêng»; §8.1 R13.
- **Vấn đề:** lượt 10 là T3, có Cổng 1.5, có thêm scope Slack và quản trị Slack phải đồng ý
  lại. Nếu còn phải triển khai thêm một app (biến môi trường, tin cậy OIDC, như R13 tự nêu)
  thì 6 ngày làm việc không đủ. Khi đó R3 hứa một thứ không kịp.
- **Bằng chứng:** 12 §8.1 R13; lộ trình §5 lượt 10 («quyền mới — T3»).
- **Sửa đề xuất:**
  > «Stub đạt đủ tám điểm thì chat vào lượt 10. Không đạt thì chat lùi sang tháng 1 thành
  > một lượt riêng, và khe 11/12 → 18/12 dành cho lượt 8.»
- **Mức:** nên sửa.

---

## C. Nhỏ

### S1 — Cận dưới của bảng kịch bản lệch với công thức

- **Vị trí:** §4.10, bảng kịch bản.
- **Bằng chứng:** tính lại theo `C = G × c_dx + M × 4,3 × 0,8 × c_tt`, cận dưới dùng c_dx =
  $0,010 và c_tt = $0,011.

  | Kịch bản | Tài liệu ghi | Tính lại |
  |---|---|---|
  | Vừa, tháng đặt OKR | $6,3 | 5,00 + 1,51 = **$6,51** |
  | Vừa, tháng thường | $2,4 | 1,00 + 1,51 = **$2,51** |
  | Lớn, tháng đặt OKR | $17 | 15,0 + 3,03 = **$18,0** |
  | Lớn, tháng thường | $5,8 | 3,0 + 3,03 = **$6,03** |

  Cận trên thì khớp: $4,94 · $15,58 · $43,2 · $5,98 · $14,4.
- **Vấn đề khác:**
  - c_dx = $0,010 ở nấc 2 không ghi giá của «model rẻ» đem ra tính.
  - O × p mỗi phòng ban không đồng nhất giữa ba kịch bản (10 · 12,5 · 18,75) mà không nói
    vì sao.
  - Công thức thiếu chi phí «nháp điều học được» (tháng 12 và tháng 1).
- **Sửa đề xuất:** sửa bốn ô, ghi giá model của nấc 2, ghi O và p của từng kịch bản.
- **Mức:** nhỏ.

### S2 — 9c bắt đầu vào thứ Bảy

- **Vị trí:** §6.3 và §6.4 («05/12 → 10/12»).
- **Bằng chứng:** 2026-12-05 là thứ Bảy.
- **Sửa đề xuất:** «07/12 → 10/12», hoặc ghi rõ Gantt tính theo ngày lịch.
- **Mức:** nhỏ.

### S3 — «Dòng AI» nghe như ngược với «không đưa chữ AI vào tin Zalo/Slack»

- **Vị trí:** §2.4 luật 2; §4.12 («Tối đa hai dòng AI mỗi tin»); §8.2 («Chữ AI trong tin
  Zalo hay Slack» là điều cố ý không làm).
- **Vấn đề:** «dòng AI» ở đây là dòng báo do luật viết, nói về kết quả của trợ lý. Người đọc
  sẽ hiểu đó là chữ do AI viết.
- **Vấn đề kèm theo:**
  - Nhắc buổi sáng «ngày không có gì thì không gửi», nên cần nói: một dòng tóm tắt đứng một
    mình có đủ để gửi tin không.
  - Số «3 KR đáng bàn» có thể đếm trùng những KR im mà lượt 4 đã nhắc ngay trong tin đó.
- **Bằng chứng:** `CONTEXT.md`, mục **Nhắc buổi sáng**.
- **Sửa đề xuất:** đổi «dòng AI» thành «dòng báo của trợ lý (chữ do luật viết)». Thêm luật
  không đếm trùng KR im với phần nhắc của lượt 4.
- **Mức:** nhỏ.

### S4 — Người phụ trách KR không thấy nút

- **Vị trí:** §4.5 (participant «Người phụ trách hoặc Trưởng đơn vị»).
- **Vấn đề:** nút đặt trên Mục tiêu, và chỉ hiện với người sửa được Mục tiêu. Người phụ
  trách KR mà không phải trưởng đơn vị thì chỉ sửa được KR của mình, nên không thấy nút.
- **Bằng chứng:** `apps/api/src/okr/okr-access.service.ts`: `assertSuaKr` cho qua khi
  `kr.ownerUserId === userId`, còn `assertSuaMucTieu` chỉ đi qua `suaDuocDonVi`.
- **Sửa đề xuất:** đổi participant thành «Trưởng đơn vị (hoặc quản trị với cấp OneHub)».
  Nếu muốn người phụ trách KR dùng được, thêm nút trên hộp thoại KR, với phạm vi chỉ KR đó.
- **Mức:** nhỏ.

### S5 — Viện dẫn NG-04 sai chỗ

- **Vị trí:** §5, dòng F12 («Không có prompt tự soạn (NG-04)»); §8.2, dòng «Prompt đặt lịch
  … NG-04».
- **Vấn đề:** NG-04 là trình dựng truy vấn tự do, với lý do «con số đổi nghĩa mà không ai
  hay». Nó không nói gì về prompt tự soạn.
- **Bằng chứng:** lộ trình §9 («Trình dựng truy vấn tự do (NG-04) — con số đổi nghĩa mà
  không ai hay»).
- **Sửa đề xuất:** dẫn «lối rò khi chạy nền (2.3)» làm lý do chính; nếu vẫn muốn nhắc NG-04
  thì viết «gần tinh thần NG-04».
- **Mức:** nhỏ.

### S6 — «Bản rẽ gần như không phình» chỉ đếm tệp chạm lần đầu

- **Vị trí:** §0 lẽ 3; §8.1 R12.
- **Vấn đề:** kế hoạch làm dày thêm phần sửa trong tám tệp của hãng mà bản rẽ đã sửa, cộng
  `schema.prisma` và `docs/agent.md`. Tám tệp đó là `session-purpose.ts`,
  `instructions/task.ts`, `lib/dispatch.ts`, `schedules/dispatch.ts`, `agent-tasks.ts`,
  `capabilities.ts`, `agent-trigger.service.ts`, `suggestion.tsx`. Chính phần sửa trong các
  tệp này là chỗ va khi kéo `release` về.
- **Bằng chứng:** 12 Phụ lục C (git diff --stat).
- **Sửa đề xuất:** ghi ước lượng số dòng thêm trong từng tệp đã rẽ. Đổi câu thành «không tệp
  mới nào của hãng bị chạm; tám tệp đã rẽ dày thêm khoảng N dòng».
- **Mức:** nhỏ.

### S7 — Tham số `tu=nhac` chưa có trong nhánh `onehub`

- **Vị trí:** §4.9, dòng «Tóm tắt được mở» («như lượt 4 đang đo»).
- **Bằng chứng:** grep `tu=nhac` trong `apps/` và `packages/` của bản chụp: 0 kết quả. Lượt 4
  chưa gộp (12 §3.1).
- **Sửa đề xuất:** gắn nhãn [07], hoặc ghi «như lượt 4 dự định đo».
- **Mức:** nhỏ.

### S8 — Giờ chạy tóm tắt chưa tính người đặt giờ nhắc sớm

- **Vị trí:** §4.6 «Nhịp giờ».
- **Vấn đề:** tóm tắt chạy lúc 7 giờ và dựa vào mốc 8 giờ 30. Nhưng Nhắc buổi sáng gửi «lúc
  giờ đã khai» của từng người, nên ai đặt giờ sớm hơn 7 giờ sẽ nhận nhắc trước khi có tóm
  tắt.
- **Bằng chứng:** `CONTEXT.md`, mục **Nhắc buổi sáng**; `packages/db/src/onboarding-nhac.ts`
  (`gio: { gio: 8, phut: 30 }` là mặc định).
- **Sửa đề xuất:** «Tóm tắt xong trước giờ nhắc sớm nhất của các trưởng đơn vị nhận nó; nếu
  không kịp thì dòng tóm tắt dời sang tin của sáng hôm sau.»
- **Mức:** nhỏ.

### S9 — Dòng «hỏi» chưa có trạng thái để đếm

- **Vị trí:** §4.9 bảng «Bậc can thiệp», dòng «Hỏi»; §4.3 (`trangThai` của `OkrDeXuat`).
- **Vấn đề:** người dùng «tự sửa, hoặc bỏ qua» một câu hỏi. Chưa có trạng thái nào cho hai
  lựa chọn đó, nên luật «đếm nhận · sửa · bác» không áp được cho loại dòng này.
- **Sửa đề xuất:** thêm hai trạng thái `da-sua-theo` và `bo-qua` cho dòng `hoi`. «Đã sửa
  theo» tính khi trường liên quan đổi trong 7 ngày, đọc từ `OkrTrail`.
- **Mức:** nhỏ.
