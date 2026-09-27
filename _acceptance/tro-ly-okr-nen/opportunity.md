---
schema_version: 1
slug: tro-ly-okr-nen
feature: Nền Trợ lý OKR — quản trị thấy tháng này AI tiêu bao nhiêu cho từng việc và bật tắt được Trợ lý OKR theo việc và theo đơn vị; trợ lý chạy riêng, chỉ đọc OKR, chỉ gửi tới nhà cung cấp có ZDR, và chưa hiện gì với người dùng
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-27T06:59:07Z
prototype:
  base_commit: 9dc1a037c6a1e1c4cc9d0eb03eaef5bbe5c2f6cc
  disposition: archive
---

## Vấn đề & ai gặp

Lộ trình Trợ lý OKR (`docs/plan/lo-trinh-tro-ly-okr.md`, mục 5 «9a») đặt lượt này làm
nền cho mọi việc AI của khu OKR. Hôm nay có ba chỗ hở, đo được, chặn mọi lượt sau:

- **Chủ kho không biết $20 mỗi tháng đi đâu.** Không có sổ nào ghi tiền AI theo việc.
  `AgentRun.costUsd` chỉ ghi 21–46% tiền thật của một lượt Tác nhân vì phiên con không
  được đếm (`tac-nhan-hien-nay.md`); nghiên cứu danh bạ, hỏi CRM qua Zalo và trợ lý AI
  chỉ để lại token rời trong nhật ký sự kiện. Báo cáo của Gateway hôm 26–27/09 ghi
  $2,05 trên khoá local mà trong kho không có dòng nào khớp được.
- **Không có trần nào giữ bằng mã.** Chủ kho chốt 2026-09-26: khu OKR tối đa $9 mỗi tháng
  trong $20 chung. N0 đo tháng đặt OKR tốn $10,48 khi agent gốc dùng Gemini — vượt trần
  nếu không có chốt chặn trước khi xếp việc.
- **Không có chỗ an toàn để chạy AI trên dữ liệu OKR.** Agent gốc cầm 26 tool đối tác và
  đọc model từ cài đặt chung, đọc hỏng thì rơi về model không mang cờ ZDR. Chủ kho chốt:
  nội dung OKR chỉ gửi tới nhà cung cấp có ZDR, kể cả eval.

**Người gặp:** chủ kho và quản trị — người trả tiền và người phải trả lời «bật Trợ lý OKR
cho phòng nào». Người dùng cuối chưa gặp gì ở lượt này: mọi công tắc tắt, không nút nào
hiện, cho tới khi 9b qua Cổng Bằng chứng.

**Vật liệu nền:** thiết kế `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md`
mục 4 và 6.3; số đo `N0-ket-qua.md`; báo cáo `tac-nhan-hien-nay.md`; luật chín điều
«Khi nào thêm mã, `tool`, `skill`, `subagent` hay Tác nhân» trong `docs/agent.md` (chốt
2026-09-27); đo lại trên Gemini 3.8 hôm nay ở `discovery/do-gemini-38.md`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Sự kiện `step.completed` của mọi phiên — gốc và từng subagent — mang đủ token và tiền để sổ khớp báo cáo Gateway trong 10% | Trần giữ trên con số sai; quản trị đọc một bảng không đáng tin | Chạy vài phiên mỗi loại trên máy local, so tổng sổ với `getSpendReport` lọc khoá đó cùng khung giờ | Gateway trả báo cáo được bằng khoá local (đo hôm nay); khớp chưa đo — phép đo của S4 |
| 2 | Ném lỗi trong hook ở sự kiện `actions.requested` dừng được tool **trước** khi chạy | Agent gốc của việc OKR vẫn gọi được một tool đối tác một lần | Agent mẫu gọi một tool có tác dụng phụ; hook ném; đếm tác dụng phụ = 0 | Việc còn mở từ N0; đo ở S3 |
| 3 | Chặn được cỡ **một lời gọi** của subagent (trần token ra mỗi lời gọi) qua Gateway tới Vertex | Một lời gọi chạy dài vượt trần phiên — N0 thấy 6.142 token với trần 300 | Một lời gọi đặt trần ra nhỏ, đếm token ra thật | Việc còn mở từ N0; đo ở S3 |
| 4 | Gemini 3.8 Flash giữ được ZDR và giá của 3.7 | Phải đổi model hoặc đổi ước lượng trần | Gọi thử có cờ ZDR, đọc định tuyến và tiền | **Đạt** hôm nay: chỉ Vertex, giá như cũ (`discovery/do-gemini-38.md`) |
| 5 | Để mọi công tắc tắt thì lượt này không đổi trải nghiệm của ai | Người dùng thấy nút hay lỗi trước 9b | Thước màn: không nút Trợ lý OKR nào trên khu OKR khi công tắc tắt | Sẽ đo ở S4 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi lên production, quản trị có tin được con số «tháng này AI tiêu bao nhiêu cho từng việc» không, và trần của Trợ lý OKR có giữ bằng mã không?
- Kết quả nào là SỐNG: trong 30 ngày đầu trên production, tổng sổ chi phí AI lệch báo cáo Gateway của khoá production không quá 10%; phần tiền không gán được vào một việc có tên không quá 5%; không phiên nào của Trợ lý OKR mở khi trợ lý tắt hoặc khi đã chạm trần tháng.
- Kết quả nào là CHẾT: lần đối soát đầu lệch quá 25%; hoặc có một phiên Trợ lý OKR mở khi tắt hay khi đã chạm trần; hoặc một việc của Trợ lý OKR hỏng mà treo quá một phút không đóng.
- Timebox: đọc lần đối soát tự động đầu tiên, 30 ngày sau ngày lượt này lên production.

## Kết quả prototype

Không dựng bản mẫu. Kiến trúc đã chốt ở lộ trình (phương án A, chấm 23 điểm so với 19,5
và 15,5), và các điều chưa biết đã có phép đo riêng ở N0. Màn Cài đặt › Chương trình OKR
sẽ đi nghi thức design-pass ở S1, trên bản bấm được, trước Cổng Phạm vi.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Báo cáo chi tiêu theo khoá, theo ngày | Vercel AI Gateway Custom Reporting (`GET /v1/report`, `gateway.getSpendReport`) | triết-lý/logic | có | — |
| Luật subagent: không thừa kế, hook riêng, trần phiên, `mode: "task"` | eve 0.29.4, `docs/subagents.mdx`, `agent-config.md` §Runtime limits | triết-lý/logic | có | — |
| Báo quản trị ở 80% và 100% trần | Mẫu của Notion, Atlassian Rovo (thiết kế §4.1) | triết-lý/logic | có | — |

Không có vật liệu ngôn-ngữ-thiết-kế/hình-thái nào từ ngoài kho: màn dùng thành phần sẵn
của `/packages/ui`.

## Bốn mục từ điển mới — duyệt ở cổng này

Máy viết vào `CONTEXT.md` ở S3 đúng như dưới đây, trừ chỗ chủ kho sửa khi ký.

**Trợ lý OKR**: phần AI của khu OKR — góp ý khi người bấm trên một Mục tiêu hay KR, và
tóm tắt tuần cho phòng ban. Chạy riêng khỏi trợ lý AI: chỉ đọc dữ liệu OKR, không đọc
được dữ liệu đối tác, không tự ghi vào OKR — mọi thay đổi là người bấm nhận. Nội dung
OKR chỉ gửi tới nhà cung cấp model có cam kết không lưu dữ liệu (ZDR). Quản trị bật theo
từng việc và từng đơn vị ở Cài đặt › Chương trình OKR; mặc định tắt.
_Avoid_: trợ lý AI (khi nói về OKR), AI OKR, bot OKR, copilot
Vì sao: «trợ lý AI» đã là thứ đọc dữ liệu đối tác; gọi chung một tên thì người mang vai
«chỉ OKR» không biết mình được dùng cái nào. «bot» đã là bot Zalo.

**Đề xuất**: một dòng Trợ lý OKR đưa ra trên một Mục tiêu hay KR — câu viết lại (câu cũ
cạnh câu mới), một câu hỏi về chất lượng, hoặc một chỗ Căn chỉnh nên gắn. Người nhận,
sửa rồi nhận, hay bác từng dòng; dòng đã bác thì không mời lại. Đề xuất không phải bản
ghi OKR nên không để vết; nhận một đề xuất thì vết ghi sửa của người, «theo đề xuất của
Trợ lý OKR».
_Avoid_: gợi ý, khuyến nghị, suggestion
Vì sao: «Gợi ý» đã là câu hướng xử lý đi kèm nhắc kế hoạch im; «khuyến nghị» nghe như
đã được duyệt.

**Tóm tắt tuần**: vài câu Trợ lý OKR viết cho một phòng ban sau ngày cập nhật, gom các
lần Cập nhật tuần của tuần đó. Câu nào cũng dẫn tới lần cập nhật gốc; số nào cũng được
máy kiểm lại, sai thì câu bị bỏ. Hiện ở đầu Họp tuần; không nêu tên người.
_Avoid_: báo cáo tuần, bản tin tuần, digest
Vì sao: «báo cáo tuần» là thứ người viết gửi lên để duyệt; «bản tin» gợi một tin gửi đi
cho nhiều người, còn tóm tắt nằm trên màn và lọc theo người xem.

**Sổ chi phí AI**: sổ ghi mỗi bước gọi model của mọi việc AI trong CRM — việc nào, bao
nhiêu token, bao nhiêu tiền. Quản trị đọc tổng tháng này theo từng việc (nghiên cứu danh
bạ, trợ lý AI, hỏi CRM qua Zalo, Tác nhân, Trợ lý OKR) ở Cài đặt › Chương trình OKR. Trần
tháng của Trợ lý OKR kiểm trên sổ này trước khi xếp việc. Mỗi tháng máy đối soát sổ với
báo cáo của AI Gateway và báo khi lệch quá 10%.
_Avoid_: hoá đơn AI, billing, nhật ký chi phí
Vì sao: «hoá đơn» là chứng từ của nhà cung cấp, còn sổ là số của chính CRM để đối soát
với hoá đơn đó.

## Cổng 0

- **decision = build.** Căn cứ: lộ trình Trợ lý OKR mục 4 (thứ tự chạy) và mục 5 «9a»; điều kiện mở đã đủ — vá lối rò Slack gộp 2026-09-27 (#170), ZDR đạt ở N0 và đạt lại trên Gemini 3.8 hôm nay. Quyết 2026-09-27 bởi Manh Phan trong phiên lượt 9a, bằng `/acceptance-gate:start tro-ly-okr-nen`; câu gõ nguyên văn: «quyết: build; ngưỡng: gỡ nhãn đề xuất ; từ điển: giữ bốn mục».
- **disposition = archive.** Căn cứ: không có mã bản mẫu.
- **Ngưỡng UAT chốt cùng lúc ký:** gỡ nhãn đề xuất cho SỐNG, CHẾT và timebox như section Ngưỡng. Bốn mục từ điển giữ nguyên văn như section «Bốn mục từ điển mới».

## Thước đo thành công → ứng viên criterion

- Tổng sổ chi phí so với báo cáo Gateway cùng khoá, cùng khung ngày → AC về đối soát tự động mỗi tháng, cộng một phép đo khớp trong 10% trên máy local ở S4.
- Phần tiền không gán được việc → AC về cách sổ suy việc từ kênh, mục đích phiên và loại việc; mọi mục đích phiên hôm nay có một việc có tên.
- Phiên Trợ lý OKR mở khi tắt hay hết trần → AC «trần bằng 0 thì không phiên nào mở», đo bằng đếm phiên, không bằng đọc mã.
- Việc hỏng treo quá một phút → AC «việc bị ép hỏng đóng trong một phút, có lý do, không mở phiên thứ hai».

## Out of scope từ khám phá

- Nút «Nhờ Trợ lý OKR góp ý», danh sách đề xuất, nhận · sửa · bác, eval viết lại có judge — lượt 9b.
- Tóm tắt tuần, khối tóm tắt ở Họp tuần, dòng báo trong nhắc buổi sáng cho trưởng phòng ban, eval tóm tắt có judge — lượt 9c.
- Hỏi đáp OKR trong chat, Slack hay Zalo — lượt 10, đi eve app riêng vì phép thử «stub cùng tên» của N0 không đạt.
- Chọn model rẻ hơn cho agent gốc khi làm việc OKR (nấc 2 của §4.10) — chạm tệp của hãng; chỉ làm khi số đo tháng đầu buộc.
- Trần cho làn nghiên cứu danh bạ — sổ chỉ đếm; chưa chặn làn đó ở lượt này.
