# 11 — Giám khảo lăng kính 2: giá trị sản phẩm và thời điểm

Viết 2026-09-26. Bài chấm độc lập ba phương án kiến trúc AI cho khu OKR
(`10-phuong-an-A.md`, `10-phuong-an-B.md`, `10-phuong-an-C.md`). Chỉ chấm **một
lăng kính**: người dùng cảm nhận được gì, và **khi nào** so với lịch cứng. Không chấm
độ an toàn kỹ thuật, phí bản rẽ hay độ sạch kiến trúc, trừ khi chúng đổi ngày người
dùng nhận được giá trị.

**Đã đọc**

- Trọn ba phương án, trọn `09-soat-do-du.md` (thắng khi mâu thuẫn).
- `docs/plan/lo-trinh-okr.md` trọn; `03-doi-thu-okr.md` phần tóm tắt, (b), (c) và bảng
  «hơn Tability»; bảng F01–F24 và mục 6 của `01-tability-chinh-chu.md`; phần giá của
  `08-ma-du-lieu-quyen-chi-phi.md`.

**Nhãn**

- **[mã]**: tự kiểm trong bản chụp `scratchpad/onehub`, đường dẫn tính từ gốc kho.
- **[eve]**: tự kiểm trong `apps/agent/node_modules/eve/docs` (eve 0.29.4).
- **[0x]**: lấy từ báo cáo nghiên cứu số 0x.
- **(suy luận)**: kết luận của giám khảo, chưa đo.

---

## 0. Kết luận một màn

| Phương án | Điểm (lăng kính 2) | Một câu |
|---|---|---|
| **A** «Dọc OKR trước» | **7,5** | Đưa giá trị tới tay sớm nhất và chắc nhất cho mùa đặt OKR quý 1; mất điểm ở độ trễ và «thuế chuyển tiếp» mỗi lần bấm, và ở chat lượt 10 phải làm lại |
| **B** «Nền tảng khai báo» | **7** | Đường chạy một phiên cho trải nghiệm bấm tốt nhất và đường tới chat rẻ nhất; mất điểm vì chen một lượt T3 vào đúng tuần mở R1 và dựng nền trước khi có dữ liệu thật |
| **C** «Đồng đội chủ động» | **6** | Tư duy sản phẩm hay nhất về nhịp tuần và chống spam; nhưng buộc giá trị OKR chờ việc sửa khung Tác nhân của hãng, trong cửa sổ hẹp nhất |

**Khuyến nghị (suy luận):** lấy **A làm nền**, ghép cách chạy một phiên của B/C
**nếu spike đạt**, ghép lớp chống spam và thước «không làm hỏng nhịp tuần» của C,
ghép thước đo và nhịp giờ tóm tắt của B. Bỏ lượt T3 chen giữa lượt 5 và 6 của B, bỏ
vòng đời Deploy và trigger sự kiện của C ở R3. Chi tiết ở mục 8 và 9.

---

## 1. Thước chấm của lăng kính này

| # | Tiêu chí | Trọng số | Câu hỏi cụ thể |
|---|---|---|---|
| T1 | **Giá trị đúng mùa** | 30% | Người dùng có gì trước 07/12 (ban lãnh đạo đặt OKR năm 2027), trước 21/12 (đặt OKR quý 1), trong 28/12–08/01 (đóng quý 4), và mỗi tuần sau đó? Lịch trượt thì mất gì? |
| T2 | **Ngang hoặc hơn Tability, có bằng chứng** | 20% | So bảng F01–F24 của 01 và bảng «hơn Tability» của 03 (đã sửa theo 09) |
| T3 | **Bài học Viva Goals** | 15% | AI phục vụ nhịp Cập nhật tuần hay chen vào nó? Có thước chặn việc AI làm hỏng nhịp không? |
| T4 | **Tỷ lệ dùng thật** | 15% | Ma sát trước lần bấm đầu, độ trễ, nút có biến mất giữa mùa vì trần không, có đo độ phủ không |
| T5 | **Điều kiện mở lượt 9/10 và luật «đứng trên dữ liệu thật»** | 15% | Tôn trọng hai câu trả lời của chủ kho, luật tuần tự, và không dựng thứ chưa có dữ liệu đòi |
| T6 | **Tiếng Việt và Zalo** | 5% | Có biến hai thứ này thành lợi thế đo được không |

---

## 2. Lịch cứng: người dùng thấy gì, khi nào

### 2.1 Mốc đã kiểm trong lộ trình

- R1 lên 23/10; cả công ty dùng OKR quý 4 từ 26/10 (`docs/plan/lo-trinh-okr.md` §1) [mã].
- Lượt 9 bắt đầu 23/11, dài 8 ngày; lượt 10 nối sau, 10 ngày; R3 lên 18/12 (gantt §1) [mã].
- Ban lãnh đạo đặt OKR năm 2027 **07/12 → 18/12**, tức **trước R3** (§6, bảng tuần) [mã].
- Phòng ban đặt OKR quý 1 **21/12 → 11/01**; chấm và nhìn lại quý 4 **28/12 → 08/01** [mã].
- Lượt 7 hạn cứng 14/12; lượt 8 mở «sau bốn tuần dùng quý 4» (§5) [mã].
- Tốc độ dựng không phải điểm nghẽn: lượt 1, 2, 3 đều gộp trong 24–25/09, nhiều cổng
  ký theo uỷ quyền (§10, dòng 1–3) [mã]. Điểm nghẽn thật là **dữ liệu thật** và **câu
  trả lời của chủ kho** (suy luận).

### 2.2 Bảng giá trị theo mùa

| Cửa sổ | Người dùng cần gì | A | B | C |
|---|---|---|---|---|
| 26/10 → 02/11, đặt OKR quý 4 | Đặt nhanh, đủ | Không có AI (đúng luật: chưa có điều kiện lượt 9) | Không có AI; **gia số 0 (T3) chen vào đúng quanh ngày mở** | Không có AI |
| 02/11 → 18/12, Cập nhật tuần quý 4 | Nhịp tuần sống | Không đụng | Không đụng | Không đụng |
| **07/12 → 18/12**, ban lãnh đạo đặt OKR năm | Góp ý câu mục tiêu | **Có nếu đạt đích «lên `onehub` trước 04/12»** (A §11.2) | Chỉ khi 9a lên sớm; B tự nêu điều này (B §6.3) | Khó: gia số 0 T3 nặng nằm trong cùng cửa sổ |
| **21/12 → 11/01**, đặt OKR quý 1 | Viết lại, hỏi chất lượng, gợi ý Căn chỉnh | **Có**, không phụ thuộc lượt 4/5 | Có (9a) | Có **nếu** gia số 0 + 1 kịp; C tự xếp rủi ro «quá sức một người trước 18/12» là vừa–cao (C §12.1 #5) |
| 28/12 → 08/01, đóng quý 4 lần đầu | Nháp «điều học được» | Chưa; gia số 5 sau R3 «nếu trần còn chỗ», dùng lại sổ gợi ý | Chưa; «retro nháp» sau R3 | Chưa; «ứng viên sau R3» |
| Mỗi tuần từ giữa tháng 1 | Tóm tắt trước họp tuần | Có (nhịp 2) | Có (9b) | Có (gia số 2) |
| Lượt 10 | Chat trên OKR | **Phải làm lại** (W1: tách eve app riêng) → dễ trượt quá R3 | Rẻ nhất: cùng resolver, thêm cầu nối | Qua cầu nối, cần migration loại hội thoại |

Cả ba đều đúng ở chỗ quan trọng nhất: **«đặt» trước «tóm»**. Tóm tắt quý 4 chỉ còn khoảng
hai tuần sau R3, rơi vào nghỉ lễ; giá trị thật của tóm tắt bắt đầu khi quý 1 chạy
(suy luận, khớp A §11.2, B §10.3, C §11.3).

### 2.3 Một lỗi nhịp giờ mà cả ba ít để ý: tóm tắt tuần có bị cũ một tuần không

- `OkrCycle.updateWeekday` mặc định là 1 (`packages/db/prisma/schema.prisma` dòng
  1958) [mã], và lượt 4 hứa «Sáng thứ Hai tôi được nhắc» [mã]. Tức Cập nhật tuần dồn
  vào thứ Hai.
- **A** xếp tóm tắt lúc 05:00 thứ Hai, cho «tuần vừa khép» (A §2.3). **C** chạy lúc 07:30
  của chính ngày cập nhật (C §4.5). Cả hai tóm tắt các lần cập nhật **đã một tuần tuổi**,
  đúng lúc người ta sắp cập nhật số mới (suy luận).
- **B** đặt `dueAt` thứ Ba 07:00 (B §3.6), tức sau ngày cập nhật. Đây là nhịp đúng: tóm
  tắt đọc số mới nhất, tới tay Trưởng đơn vị trước họp tuần.
- Điều cần chốt ở Cổng Đáng lượt 9: tóm tắt chạy **sau ngày cập nhật, trước buổi họp
  tuần** của đơn vị. Lộ trình chưa ghi ngày họp; đây là một tham số của Chu kỳ, không
  phải hằng số (suy luận).

---

## 3. Chấm từng phương án

### 3.1 Phương án A — 7,5/10

**Điểm theo tiêu chí:** T1 8,5 · T2 6,5 · T3 6 · T4 6 · T5 9 · T6 7.

**Vì sao cao**

- **Giá trị sớm nhất và chịu được trượt lịch.** Góp ý chỉ đứng trên dữ liệu lượt 3
  (đã lên `onehub`), cộng luật lượt 7 nếu đã có. Lượt 4 hay lượt 5 trễ thì chỉ tóm tắt
  lùi, còn góp ý vẫn kịp mùa quý 1 (A §11.2 «Nếu lịch trượt»). Đích 04/12 còn bắt được
  cửa sổ ban lãnh đạo 07/12–18/12, dù A không gọi tên cửa sổ này.
- **Tôn trọng điều kiện mở lượt 9 hơn cả.** Việc 0.1 của gia số 0 là hai câu trả lời của
  chủ kho; R10 nói rõ: chủ kho trả lời «không gửi» thì `aiOn = false`, «không có khung
  chung nào bị bỏ phí» (A §12.1). Đây là phương án duy nhất mà câu trả lời «không» gần
  như không làm mất công.
- **Đứng trên dữ liệu thật đúng nghĩa lộ trình.** Khung chung chỉ rút khi ca thứ hai tới;
  RAG chỉ mở khi log chat lượt 10 đòi; ca vàng lấy từ OKR quý 4 thật từ 02/11 (A §5.3,
  §8.2, §10).
- **Gom theo mục tiêu.** Một lần bấm cho ra mọi dòng góp ý của cả mục tiêu (tên, «vì sao
  lúc này», KR, Căn chỉnh) (A §7.3). Với người dùng, đó là một lần chờ thay vì năm; với
  trần, đó là ít phiên hơn.
- **Nói thẳng chỗ Tability vẫn hơn** (A §9 cuối): không chat trước lượt 10, không MCP,
  không agent, không importer tự do, không coaching theo KR.

**Vì sao không cao hơn**

- **Độ trễ và «thuế chuyển tiếp» mỗi lần bấm.** Đường đi là gốc hai bước cộng subagent
  hai bước; A tự ước 6–15 giây (A R5) và tự tính chặng gốc chiếm khoảng 60% đầu vào
  (A §7.4). Với trần đề xuất $8, A tự tính góp ý bị chặn ở khoảng 350–650 lượt mỗi
  tháng (A §7.4). Tức là **nút có thể biến mất giữa mùa đặt OKR quý 1**, đúng tuần giá
  trị cao nhất (suy luận). A có ba nấc giảm, nhưng nấc 2 sửa `agent.ts` mà A cam kết
  không sửa ở gia số đầu.
- **Chat lượt 10 phải làm lại** (W1: tách thành eve app riêng hoặc làm đường vào có phạm
  vi). A chấp nhận vì lượt 10 vốn T3, nhưng với lịch lượt 10 kết thúc khoảng 11/12 theo
  gantt, việc làm lại này gần như chắc đẩy chat qua R3 (suy luận). Khoảng cách với
  AI-mode của Tability (F11) vì thế kéo dài nhất ở A.
- **Không có thước độ phủ và thước chặn hỏng nhịp tuần.** Thước của A (§6.4, §8.3) đo chất
  lượng gợi ý và độ trễ, nhưng không đo: bao nhiêu phần trăm Mục tiêu quý 1 có người bấm
  góp ý, bao nhiêu Trưởng đơn vị mở tóm tắt, và trung vị thời gian Cập nhật tuần có tăng
  không. Thiếu ba thước này thì Cổng Giá trị không trả lời được câu «có ăn thua không».
- **Tóm tắt cũ một tuần** (mục 2.3).
- **Một công tắc toàn chương trình** (`OkrProgramConfig.aiOn`). 03 bảng «hơn Tability»
  dòng 3 gợi ý mở AI dần theo phòng ban; A không có lối đó.

**Lỗi chết người:** không có. Rủi ro nặng nhất là trần bị chặng chuyển tiếp ăn mất
trong tuần đặt OKR quý 1; đo được và có lối giảm.

### 3.2 Phương án B — 7/10

**Điểm theo tiêu chí:** T1 7,5 · T2 8 · T3 7,5 · T4 7,5 · T5 5,5 · T6 7.

**Vì sao cao**

- **Trải nghiệm bấm tốt nhất nếu spike đạt.** Chạy thẳng ở gốc, khoảng hai bước model
  (B §3.2). Ước giá một lần viết lại khoảng $0,010, bằng khoảng 40% giá đi qua chuyển
  tiếp (B §6.3). Rẻ hơn thì trần theo người rộng tay hơn, nút ít biến mất hơn trong mùa
  cao điểm (suy luận).
- **Đường tới chat (AI-07) rẻ nhất.** Lượt 10 dùng lại purpose `ai-feature` và resolver,
  chỉ thêm móc ở `channels/eve.ts` và route app (B §3.4, §10.3). Đây là phương án có cơ
  hội ngang AI-mode của Tability sớm nhất.
- **Nhìn rõ lịch.** Tách 9a/9b để phần góp ý kịp quý 1; nêu đúng rằng ban lãnh đạo đặt OKR
  năm 2027 trước R3, và đính chính rằng tuần đặt OKR quý 4 chưa có AI (B §6.3 «Đọc bảng»).
- **Có thước chặn hỏng nhịp tuần.** Ngưỡng Cổng Giá trị đề xuất có câu «trung vị thời gian
  cập nhật tuần **không tăng** sau khi có AI» (B §7.3), và thước «tóm tắt được mở» đo qua
  liên kết trong nhắc buổi sáng (B §5.4). Đây là bài học Viva Goals viết thành số.
- **Tóm tắt thứ Ba**, sau ngày cập nhật (mục 2.3).
- **Dùng lại khi trùng đầu vào** (`inputHash`, B §5.2): bấm hai lần không tốn hai lần.
- **Công tắc từng tính năng, trần và ZDR ở một màn quản trị** (B §6.1). Ngang F20 của Tability.

**Vì sao không cao hơn**

- **Chen một lượt T3 vào đúng tuần mở R1.** Gia số 0 đặt «sau khi lượt 5 gộp, trước khi mở
  lượt 6» (B §10.2), tức quanh 26/10, khi cả công ty vào CRM lần đầu và chủ kho phải trực
  câu hỏi. Lộ trình ghi mọi lượt đi tuần tự, nên thêm một lượt T3 ở đây là đẩy lượt 6 và
  lượt 7 lùi, mà lượt 7 có hạn cứng 14/12 [mã `docs/plan/lo-trinh-okr.md` §1, §5]. B có
  lối lùi (dời xuống ngay trước lượt 9), nhưng lối chính vẫn rơi vào cửa sổ nhạy nhất.
- **Dựng nền trước khi có dữ liệu thật và trước câu trả lời của chủ kho.** Khuôn bản khai
  đã có trigger `su-kien`, `hoi-thoai`, kiểu duyệt `duyet-ghi` chưa tính năng nào dùng
  (B §2.3, §5.1). «Luật của hai» của B là đúng, nhưng khuôn đã đi trước luật.
- **Nói quá về «số chi phí thật».** B hứa gia số 0 cho «4–6 tuần số chi phí thật (cả nền
  mỗi bước) trước Cổng Đáng lượt 9» (B §10.2). Nhưng ở gia số 0 chưa có tính năng OKR nào
  chạy; số thật chỉ có cho làn nghiên cứu hiện có và cho tính năng thử `he-thong.kiem-khung`.
  Số đó vẫn có ích để chia $20, nhưng không phải số chi phí của AI OKR (suy luận).
- **Một chỗ trượt khỏi ranh «máy không viết cập nhật».** Bảng hấp thụ Tability ghi «AI chỉ
  được đề xuất *câu ghi chú* khi người bấm» (B §8, dòng Check-in). Không gia số nào dựng
  điều này, nhưng nếu dựng thì nó chen vào màn «Cập nhật tuần của tôi», nơi lượt 4 hứa
  dưới 60 giây [mã lộ trình §5 lượt 4]. C cố ý không làm việc này (C §12.2).
- **Rủi ro spike.** Cả luận điểm dựa trên việc tool động thay được tool đã viết theo tên.
  Tài liệu eve có nói vậy (mục 7.2 dưới đây), nhưng chưa ai chạy thử. Hỏng thì B lùi về
  hình của A.

**Lỗi chết người:** không có. Nặng nhất là chen T3 vào tuần mở R1.

### 3.3 Phương án C — 6/10

**Điểm theo tiêu chí:** T1 5 · T2 7,5 · T3 9 · T4 6 · T5 4,5 · T6 8. Trừ thêm vì một trích
dẫn sai (mục 7.3).

**Vì sao có điểm cao ở vài tiêu chí**

- **Hiểu bài học Viva Goals sâu nhất.** Thước «tỷ lệ người tắt hẳn Nhắc buổi sáng trước
  và sau khi bật tác nhân», gọi thẳng là dấu hiệu AI đang phá vòng Cập nhật tuần (C §2.3).
  Cố ý không gợi ý câu ghi chú trên màn Cập nhật tuần ở R3 để giữ ngưỡng 60 giây
  (C §12.2).
- **Lớp chống spam là thiết kế sản phẩm thật:** tối đa hai dòng mỗi tin, dòng tác nhân đứng
  sau việc của người, cảnh báo theo cạnh chứ không theo mức, nguội 14 ngày, không báo
  trùng KR im của lượt 4, người nhận tắt được từng tác nhân (C §2.3).
- **Gắn nhịp vào cuộc họp thật:** bản tin hiện ở đầu bảng họp tuần của lượt 5 (C §4.5),
  đúng dòng 6 của bảng «hơn Tability» trong 03.
- **Dòng nhắc mang số đếm do luật tính**, không mang chữ model: «Bản tin tuần Phòng X: 3 KR
  đáng bàn» (C §2.3). Nhiều thông tin hơn «tóm tắt đã có» của A và B, mà vẫn không đưa
  chữ model lên máy chủ Zalo.
- **Tiếng Việt tinh:** bộ kiểm NG-07 so **họ tên đầy đủ, không dấu**, vì nhiều tên riêng
  là từ thường («An», «Bình») (C §8.2).
- **Tìm ra một lối rò có thật, độc lập với OKR:** `postRunSlackMessage` chỉ kiểm đích đã
  duyệt, không kiểm ai đang trong kênh (`apps/agent/agent/lib/run-runtime.ts` dòng 378,
  1024–1056) [mã]; lượt 2 để kênh nội bộ ngoài phạm vi (`_acceptance/vai-chi-okr/contract.md`
  mục Out of scope) [mã]. Nếu một tác nhân đối tác đăng vào kênh Slack có người vai «chỉ
  OKR», dữ liệu đối tác tới người đó từ 26/10 (suy luận).

**Vì sao điểm tổng thấp**

- **Giá trị OKR bị buộc chờ việc sửa khung Tác nhân của hãng.** Gia số 0 là T3, không có
  gì người dùng thấy, gồm: purpose, stub, ba chốt, cửa vào `AgentTask`, bộ điều phối
  riêng, sổ chi phí và trần, phép đo quyền, và khoảng 13 hunk trong 12 tệp của hãng,
  kể cả đổi nghĩa `isAutomated` trong `lib/approval.ts` (C §3.3, §11.2). Tất cả nằm trong
  cửa sổ lượt 9, cùng lúc với hạn cứng lượt 7. C tự xếp rủi ro này «vừa–cao».
- **Ma sát trước lần bấm đầu.** Nút chỉ chạy khi có một tác nhân LIVE cho đơn vị: bộ xếp
  lượt «đọc tác nhân LIVE» (C §3.1 K4), và việc bật là Deploy từ mẫu (C §0 ý 1, K3). Quản
  trị có thể Deploy một lần cho «toàn công ty», nhưng đó vẫn là một bước người phải nhớ
  làm đúng tuần 18–21/12 (suy luận).
- **Sai khái niệm với người dùng.** Một người bấm «Viết lại» không nghĩ mình đang gọi một
  «tác nhân». Trong `CONTEXT.md`, «Tác nhân» và «Trợ lý AI» hôm nay đều là khái niệm của
  phạm vi đối tác [mã `CONTEXT.md` dòng 485–487 «Phạm vi dữ liệu» liệt kê «tác nhân và
  hội thoại» trong phạm vi đối tác; dòng 497 «Trợ lý AI»]. C đề nghị sửa từ điển (C §11.1), nhưng đặt
  nút viết lại dưới chữ «tác nhân» là gánh thêm một khái niệm (suy luận).
- **Lớp chủ động đi trước dữ liệu.** Trigger theo sự kiện OKR (`okr.lech-ky-vong`,
  `okr.chu-ky.doi-pha`…) và «ghép tác nhân bằng biểu mẫu» là cược rằng người dùng muốn
  đồng đội chủ động. Chưa có Cập nhật tuần thật nào để kiểm cược đó. Luật lộ trình nói
  lượt sau đứng trên dữ liệu thật của lượt trước.

**Lỗi chết người (theo lăng kính thời điểm, có điều kiện):** nếu spike stub hoặc một trong
các hunk khung trễ, **không có đường tắt nào giữ được mùa đặt OKR quý 1** ngoài việc cắt
chính gia số 1. Ở A, góp ý không phụ thuộc khung chung nào.

---

## 4. Ngang hay hơn Tability, tính tại R3 (18/12)

Ký hiệu: ✓ có · ◐ có một phần · ✗ không (cố ý hay trượt ghi rõ). Nhóm tính năng theo
bảng F01–F24 của 01; đính chính theo 09.

| Tability | A tại R3 | B tại R3 | C tại R3 (nếu kịp) |
|---|---|---|---|
| F01 soạn OKR / chat soạn | ✗ cố ý, chỉ viết lại câu người đã viết | ✗ cố ý | ✗ cố ý |
| F02 góp ý plan | ✓ và hơn: sổ nhận/sửa/bác, «không mời lại» thực thi ở đường ghi | ✓ và hơn, như A | ✓ và hơn, như A |
| F06 Plan Score | ◐ luật lượt 7 + model hỏi, không chấm điểm | ◐ như A | ◐ như A, lý do «điểm tổng dễ thành xếp hạng» (C §9) |
| F07/F08 check-in do AI | ✗ cố ý (NG-05) | ✗ cố ý | ✗ cố ý |
| F09 coaching, tóm tắt KR | ◐ tóm tắt theo phòng ban | ◐ như A | ◐ gắn bảng họp tuần |
| F10 retro nháp | ✗ trượt, sau R3 | ✗ trượt | ✗ trượt |
| F11 AI-mode chat | ✗ dễ trượt quá R3 (W1) | ◐ khả thi nhất ở lượt 10 | ◐ lượt 10, thêm migration |
| F12 scheduled prompts | ◐ tóm tắt cố định, lọc theo người xem | ◐ như A | ✓ tác nhân theo lịch có lọc người nhận, bật theo đơn vị |
| F13–F15 agents | ✗ cố ý | ✗ cố ý | ◐ mẫu tác nhân, không phải agent tự trị |
| F16 MCP | ✗ sau R3 | ✗ sau R3 | ✗ sau R3 |
| F20 quản trị AI | ◐ một công tắc + trần | ✓ công tắc từng tính năng + trần + ZDR | ✓ bật theo đơn vị |

**Chỗ hơn Tability có bằng chứng, chung cho cả ba** (không phân biệt được phương án):

- Kiểm số bằng mã, lệch thì bỏ câu: không nhà cung cấp nào công bố [03 bảng «hơn
  Tability» dòng 7].
- Lọc theo người xem hay người nhận khi chạy nền: scheduled prompt của Tability không
  có câu nào nói lọc theo người nhận [09 G2].
- Người giữ số và Mức tự tin: Tabby đăng check-in thẳng, đứng tên máy [09 G1].
- Đo nhận/sửa/bác: không nhà cung cấp nào công bố [03 dòng 8].
- Tiếng Việt: Tability không nhắc tiếng Việt [01 §6 ý 11]. Zalo: không đối thủ nào có
  [03 dòng 9].

**Kết luận mục 4 (suy luận).** Về «ngang», B nhỉnh nhất vì chat và công tắc; về «hơn», cả ba
như nhau ở phần lõi, C hơn thêm ở nhịp họp và bật theo đơn vị, nhưng chỉ khi kịp giờ.
Không phương án nào có nháp «điều học được» cho lần đóng quý 4 đầu tiên (28/12), trong khi
F10 của Tability làm đúng việc đó. Đây là chỗ hụt chung đáng lấp (mục 8, G-A3).

---

## 5. Bài học Viva Goals và tỷ lệ dùng thật

Bài học [03 tóm tắt ý 5, (c) ý 1]: Viva Goals có Copilot, có Teams, vẫn bị khai tử vì mức
dùng không tăng; AI nên phục vụ nhịp Cập nhật tuần, không thay nó.

| Câu hỏi | A | B | C |
|---|---|---|---|
| AI có chạm màn «Cập nhật tuần của tôi» không | Không | Có một câu mở đường («đề xuất câu ghi chú khi người bấm») | Không, cố ý |
| AI có thêm tin thứ hai mỗi sáng không | Không: một dòng dẫn | Không: một dòng dẫn | Không: tối đa hai dòng, có số đếm |
| Có thước chặn «AI làm hỏng nhịp» không | **Không** | Có: trung vị thời gian cập nhật không tăng | Có: tỷ lệ tắt Nhắc buổi sáng trước/sau, tỷ lệ tắt từng tác nhân |
| Có thước độ phủ (bao nhiêu người thật sự dùng) không | Không | ◐ tóm tắt được mở | ◐ tỷ lệ bấm dòng nhắc |
| Ma sát trước lần bấm đầu | Quản trị bật một công tắc | Quản trị bật một công tắc | Deploy mẫu (đơn vị hoặc toàn công ty) |
| Độ trễ nút bấm | 6–15 s (A tự ước) | «vài giây», hai bước | Đích p50 ≤ 8 s |
| Nút có biến mất giữa mùa cao điểm không | Rủi ro cao nhất (thuế chuyển tiếp) | Thấp hơn | Thấp nếu chạy thẳng và khoá suy nghĩ |

Điểm chung đáng giữ: câu tóm tắt nào cũng dẫn về lần Cập nhật tuần gốc. Tức là **mỗi lần
cập nhật trở nên có người đọc**; đó là động lực cập nhật mà không cần nêu tên ai chậm
(NG-07) (suy luận).

---

## 6. Tiếng Việt và Zalo

- **Tiếng Việt.** Cả ba có ca vàng tiếng Việt lấy từ OKR quý 4 thật và bộ kiểm số hiểu dấu
  phẩy thập phân kiểu Việt (`docSoOkr` trong `packages/validation/src/okr-kr.ts`). A thêm
  danh sách từ cấm lấy từ `_Avoid_` của `CONTEXT.md`; B lưu ý tiếng Việt có dấu tốn token
  hơn; C so họ tên đầy đủ không dấu. **Chưa phương án nào** nêu điều 03 (b) ý 9: trả lời theo
  ngôn ngữ chiếm đa số của nội dung. OKR ở công ty Việt hay trộn Anh–Việt («Launch app
  v2», «Tăng MRR»), nên đây là ca vàng phải có (suy luận).
- **Zalo.** Cả ba chỉ đưa lên Zalo một dòng dẫn, không đưa chữ model. Cách này giữ ranh
  gửi dữ liệu ra ngoài, nhưng làm Zalo thành kênh dẫn đường chứ chưa thành lợi thế AI.
  Lợi thế Zalo thật nằm ở NH-06 (cập nhật ngay trong chat, lượt 10), và cả ba đều giữ
  NH-06 tất định, không AI. Đúng hướng: trả lời bằng chữ trên Zalo rẻ, tất định, và phục
  vụ thẳng nhịp tuần (suy luận).
- Dòng nhắc có **số đếm do luật tính** (C) mang giá trị hơn dòng «đã có» (A, B), mà vẫn
  không có chữ model.

---

## 7. Điều kiện mở lượt 9/10, luật «dữ liệu thật», và các khẳng định đã kiểm

### 7.1 Điều kiện mở

| Điều kiện | A | B | C |
|---|---|---|---|
| Lượt 9: chủ kho trả lời «có gửi nội dung OKR tới nhà cung cấp model không» và «trần tháng» | Việc đầu tiên của gia số 0; «không» thì tắt gọn | Dựng nền trước khi có câu trả lời; nền vẫn có ích cho sổ chi phí CRM | Trước 23/11, trước gia số 0 |
| Lượt 10: số đo lượt 4 cho thấy trễ quá một ngày làm việc hoặc cập nhật quá 2 phút | Tôn trọng | Tôn trọng | Tôn trọng |
| Luật tuần tự | Không mở lượt mới | **Thêm một lượt T3 giữa 5 và 6** | Không mở lượt mới, nhưng lượt 9 nặng lên |
| Không dựng khi chưa có dữ liệu đòi | Tốt nhất: khung rút khi có ca thứ hai | Khuôn có kiểu chưa dùng | Lớp chủ động, trigger sự kiện chưa có dữ liệu |

Một ghi chú cho người điều phối: điều kiện lượt 10 đo độ trễ Cập nhật tuần, nên nó là
điều kiện của NH-06. AI-06 (cảnh báo) và AI-07 (chat) không phụ thuộc thẳng vào con số
đó. Tách hai nửa này ở Cổng Đáng lượt 10 thì chat không bị kéo lùi theo NH-06 (suy luận).

### 7.2 Khẳng định đã tự kiểm, đứng

- Tool động trùng tên với tool đã viết thì **đè** nó: «A dynamic tool or skill whose name
  matches an **authored** one **overrides** it — a per-caller resolver can replace a
  built-in by name» (`guides/dynamic-capabilities.md` §Conflicts) [eve]. Lối stub của B và
  C có căn cứ tài liệu; vẫn cần spike vì chưa ai chạy thử.
- Hook của gốc không chạy trong lượt của subagent (`guides/hooks.md` §Subagent isolation)
  [eve]; `apps/agent/agent/subagents/agent_runner/` không có thư mục `hooks/` [mã]. Điểm mù
  chi phí mà A và C nêu là có thật (suy luận mạnh).
- Purpose lạ rơi về `research`: `z.enum(SESSION_PURPOSES).catch("research")` trong
  `apps/agent/agent/lib/session-purpose.ts` [mã].
- Một lượt RUNNING mỗi tác nhân: `pendingAgentRunIds` lọc `runs: { none: { status: { in:
  ["RUNNING", "WAITING_FOR_APPROVAL"] } } }` (`apps/agent/agent/lib/custom-agent-dispatch.ts`
  dòng 377–409) [mã]. Lượt nền của tác nhân chạy bằng `run.agent.createdById` khi không có
  người bấm (cùng tệp, khoảng dòng 498) [mã].
- `Suggestion` chỉ có `value`, `rationale`, `onAccept`, `onDismiss`
  (`packages/ui/src/components/suggestion.tsx`) [mã]; cả ba đều phải thêm biến thể «câu
  cũ, câu mới, sửa».
- `inline-citation` và `sources` ở trạng thái Adopted trong `docs/chat-ui.md` nhưng
  `packages/ui/src/components/ai-elements/` hôm nay chỉ có `conversation`, `message`,
  `reasoning`, `shimmer` [mã]. B nói đúng điều này; A nói «dùng» mà không nêu phải đưa vào
  cây trước, tức thêm một việc UI trong lượt 9.
- `HANH_DONG_VET` có đúng 13 hành động (`packages/validation/src/okr-vet.ts`) [mã], khớp A.
- `alignmentTargets` ở `apps/api/src/okr/okr.service.ts:890`; `tien-do.ts` 58 dòng, nhập
  `soNgayVN` từ `@crm/db/onboarding-nhac` [mã], khớp A.
- `NHAC.tran = 10` (`packages/db/src/onboarding-nhac.ts`) [mã]; giới hạn phiên gốc 500k/50k
  (`apps/agent/agent/agent.ts`) [mã].
- `PRIORITY` cao nhất trong làn nghiên cứu là `workspace` 500; `brand` 900, `portrait` 800,
  `slack-channel-join` 950 thuộc `DIRECT_KINDS` (`packages/db/src/agent-tasks.ts`) [mã].
  Mức 850 của B cho hàng bấm đúng là đứng đầu làn nghiên cứu.

### 7.3 Khẳng định sai hoặc quá tay

- **C, «gemini-3.7-flash là model có suy nghĩ (thẻ `reasoning` trong catalog Gateway,
  NC-08)»** (C mở đầu ý 4). Tìm trong `08-ma-du-lieu-quyen-chi-phi.md` không có chữ
  «reasoning», «suy nghĩ» hay «thinking». Trích dẫn sai nguồn. Ý đáng giữ (đo và khoá ngân
  sách suy nghĩ nếu có), nhưng con số «gấp khoảng ba lần» chưa có căn cứ. Trừ điểm.
- **B, «4–6 tuần số chi phí thật (cả nền mỗi bước)» trước Cổng Đáng lượt 9** (B §10.2).
  Quá tay như đã nêu ở 3.2: chưa có tính năng OKR nào chạy ở gia số 0.
- **B, lập luận chống lối subagent** (B §3.2: «gốc vẫn đọc chữ người dùng; chữ tiêm vào tên
  mục tiêu có thể khiến gốc gọi `read_crm_history`»). Không áp cho A: ở A, tin gửi cho gốc
  không mang dữ liệu, subagent tự đọc theo `okrTaskId` (A §3.3, §4.2). Không phải lăng kính
  của bài này, nhưng người đọc B không nên coi đó là phản bác A.
- **C, «cửa sổ lượt 9 khoảng 23/11–18/12»** (C §11.3). Gantt đặt lượt 9 dài 8 ngày từ 23/11
  và lượt 10 nối sau [mã lộ trình §1]. Coi cả khoảng tới 18/12 là của lượt 9 là đếm thừa
  khoảng 10 ngày của lượt 10.

---

## 8. Ý tưởng đáng ghép vào phương án thắng (A)

| Mã | Từ | Ghép gì | Vì sao (lăng kính 2) |
|---|---|---|---|
| G-B1 | B, C | **Spike 1–2 giờ về stub cùng tên, làm trước Cổng Phạm vi lượt 9** (danh sách sáu điều của C §4.1). Đạt thì chạy lát dọc của A ngay ở gốc, purpose `okr`, bỏ chặng chuyển tiếp; hỏng thì giữ subagent như A | Bỏ được hai điểm yếu nhất của A: độ trễ 6–15 s và thuế chuyển tiếp làm nút biến mất giữa mùa quý 1. Cũng làm chat lượt 10 thành việc thêm, không phải làm lại (W1). Còn phải qua lăng kính an toàn |
| G-B2 | B | **Tóm tắt chạy sau ngày cập nhật** (thứ Ba 07:00 khi `updateWeekday` là thứ Hai), đặt thành tham số theo Chu kỳ | Tóm tắt đọc số mới nhất trước họp tuần, không cũ một tuần |
| G-B3 | B | **Ngưỡng Cổng Giá trị «trung vị thời gian Cập nhật tuần không tăng sau khi có AI»** và thước «tóm tắt được mở» qua liên kết nhắc buổi sáng | Bài học Viva Goals thành số; A thiếu cả hai |
| G-B4 | B | **Dùng lại kết quả khi trùng đầu vào** (`inputHash`) | Bấm hai lần không tốn hai lần; giữ trần trong tuần cao điểm |
| G-B5 | B | **Gọi tên cửa sổ ban lãnh đạo 07/12–18/12** trong hợp đồng lượt 9; đích «lên `onehub` trước 04/12» của A thành AC có ngày | Thêm một lần dùng thật trước mùa quý 1; người đặt OKR năm là người dùng khó tính nhất, phản hồi sớm |
| G-B6 | B | Một truy vấn chỉ-đọc cộng `step.completed` của làn nghiên cứu **hiện có** để chia $20, thay cho cả gia số 0 của B | Lấy được phần có ích của gia số 0 mà không chen T3 vào tuần mở R1 |
| G-C1 | C | **Lớp chống spam**: tối đa hai dòng AI mỗi tin, dòng AI đứng sau việc của người, cảnh báo theo cạnh, không báo trùng KR im, người nhận tắt được từng loại dòng AI | Giữ «mỗi sáng một tin» có giá trị; chặn con đường Viva Goals |
| G-C2 | C | **Thước tỷ lệ tắt**: tắt từng loại dòng AI, và tắt Nhắc buổi sáng trước/sau khi bật AI | Thước chặn duy nhất đo thẳng việc AI làm người ta rời nhịp tuần |
| G-C3 | C | **Dòng nhắc mang số đếm do luật tính** («3 KR đáng bàn, 2 KR tụt tự tin»), không mang chữ model | Người nhận biết có đáng mở không; vẫn không đưa chữ model lên Zalo |
| G-C4 | C | **Bản tóm tắt hiện ở đầu bảng họp tuần của lượt 5** | Một sản phẩm, gắn vào cuộc họp thật; đúng chỗ hơn Tability có bằng chứng (03 dòng 6) |
| G-C5 | C | **Bộ kiểm NG-07 so họ tên đầy đủ không dấu**, không so tên riêng | Tiếng Việt: tránh bỏ nhầm câu vì «An», «Bình» là từ thường |
| G-C6 | C | **Không gợi ý câu ghi chú trên màn Cập nhật tuần ở R3** ghi thành một dòng «Ngoài phạm vi» của lượt 9 | Giữ ngưỡng dưới 60 giây của lượt 4 |
| G-C7 | C | **Mở AI dần theo phòng ban** bằng một danh sách đơn vị bật trong `OkrProgramConfig` (không cần vòng đời Deploy) | Rollout có kiểm soát (03 dòng 3), đo được nhóm bật và nhóm chưa bật |
| G-C8 | C | **Mở việc riêng cho lối rò Slack của tác nhân đối tác** (đích đã duyệt nhưng không kiểm thành viên kênh có vai «chỉ OKR») | Rủi ro niềm tin từ 26/10, trước mọi AI OKR; không nên chờ lượt 9 |
| G-C9 | C | **Đích p50 ≤ 8 giây** cho nút góp ý, ghi thành ngưỡng | Độ trễ quyết định tỷ lệ bấm lần hai |
| G-C10 | C | **Đo token suy nghĩ trong spike** và khoá nếu có (bỏ con số «gấp ba» chưa có nguồn) | Một biến số chi phí chưa ai đo |
| G-A1 | A (giữ) | Gom một phiên cho **cả một mục tiêu** | Một lần chờ cho mọi dòng góp ý; ít phiên hơn |
| G-A2 | A (giữ) | DO-06 bằng mã (chiếu xu hướng), không model | Rẻ, đúng, không phụ thuộc trần |
| G-A3 | A (đẩy sớm) | **Nháp «điều học được» cho đóng quý 4**, dòng `OkrGoiY` với `truong = dieuHocDuoc`, đặt làm gia số đầu tiên sau R3 với đích 28/12 | Lấp chỗ hụt chung với F10 của Tability, đúng lần đóng kỳ đầu tiên trong công cụ; dùng lại sổ gợi ý nên rẻ |
| G-03 | 03 (b) ý 9 | **Ca vàng Anh–Việt trộn**; đầu ra theo ngôn ngữ chiếm đa số của nội dung | Chỗ dễ sai mà không phương án nào nêu |

---

## 9. Khuyến nghị tổng hợp

**Nền: phương án A.** Lý do theo lăng kính này: đưa góp ý tới tay sớm nhất (đích 04/12,
kịp cả ban lãnh đạo lẫn mùa quý 1), chịu được việc lượt 4 hay 5 trễ, tôn trọng nhất hai
câu trả lời mở lượt 9 và luật «đứng trên dữ liệu thật», và gần như không bỏ phí gì nếu
chủ kho trả lời «không».

**Ghép**

1. Trước Cổng Phạm vi lượt 9: spike stub (G-B1, G-C10) và truy vấn chi phí làn nghiên cứu
   (G-B6). Spike đạt thì bỏ chặng chuyển tiếp; hỏng thì giữ subagent. Cả hai đường giữ
   nguyên phần còn lại của A.
2. Trong hợp đồng lượt 9: ngưỡng p50 ≤ 8 s (G-C9), ngưỡng «trung vị Cập nhật tuần không
   tăng» (G-B3), thước tắt (G-C2), thước «tóm tắt được mở» (G-B3), thước độ phủ (phần trăm
   Mục tiêu quý 1 có người bấm góp ý), dùng lại khi trùng đầu vào (G-B4), mở theo phòng ban
   (G-C7), ca vàng Anh–Việt (G-03), so họ tên đầy đủ (G-C5), và một dòng «Ngoài phạm vi»:
   không gợi ý trên màn Cập nhật tuần (G-C6).
3. Nhịp 2 của lượt 9: tóm tắt sau ngày cập nhật (G-B2), hiện ở đầu bảng họp tuần (G-C4),
   dòng nhắc mang số đếm do luật tính (G-C3), lớp chống spam (G-C1).
4. Sau R3, việc đầu tiên: nháp «điều học được» cho đóng quý 4, đích 28/12 (G-A3).
5. Ngay bây giờ, ngoài lộ trình AI: một việc riêng cho lối rò Slack của tác nhân đối tác
   (G-C8).

**Bỏ**

- Gia số 0 T3 của B chen giữa lượt 5 và 6: chen vào tuần mở R1 và đẩy lượt 7 về sát hạn
  cứng. Lấy phần có ích bằng G-B6.
- Khuôn bản khai có trigger và kiểu duyệt chưa dùng của B.
- Vòng đời Deploy, danh mục gói/mẫu, trigger sự kiện OKR và «ghép tác nhân» của C ở R3:
  đi trước dữ liệu, thêm ma sát, và buộc giá trị OKR chờ việc sửa khung của hãng.
- Câu «AI đề xuất câu ghi chú khi người bấm» của B.

**Điều duy nhất cần người, và nó đã có trong lộ trình:** hai câu mở lượt 9 (có gửi nội
dung OKR tới nhà cung cấp model không, và trần tháng). Khuyến nghị kèm căn cứ từ B §12 và
08: gửi được với ZDR theo từng yêu cầu, trần khu OKR khoảng $8 trong $20 chung. Trả lời
càng sớm thì spike và ca vàng càng sớm; không cần đợi 23/11.
