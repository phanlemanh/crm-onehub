## Trong hợp đồng

- **Fixture viết tay đúng khuôn bên đọc — không round-trip từ toTranscript**
  file: `packages/ui/test/fixtures/eve-turns.json:1`
  severity: high
  AC: AC-4
  eve-turns.json là JSON tĩnh viết tay, mang đúng khuôn ĐẦU RA của toTranscript (thứ tự trường label/input/output/errorText/tone/pending/sources/tool chép theo apps/app/lib/agent-transcript.ts), và trong packages/ui/test/eve-to-ai-sdk.spec.ts:11-14 nó chỉ được đọc qua parseAgentTranscriptItem — tức là bên ĐỌC (schema packages/validation/src/agent-transcript.ts). Không chỗ nào trong kho sinh hay đối chiếu tệp này với writer: `grep -rn eve-turns` chỉ ra đúng hai chỗ, chính spec này và một dòng kế hoạch. packages/ui cũng không nhập được apps/app nên round-trip writer→reader không tồn tại. Hệ quả: toTranscript đổi hình dạng (đổi tên trường, bỏ errorText, đổi cách sinh id) thì fixture vẫn hợp lệ với reader và cả bộ bài kiểm lớp chuyển vẫn xanh. Assert "chứng minh xuất xứ" ở dòng 34-40 (mang đủ bốn dạng lượt mà kho thật sinh ra) đối chiếu fixture viết tay với danh sách viết tay ['asked','did','reasoned','said'] trong cùng tệp — nó không thể đỏ trừ khi có người sửa chính fixture, nên nó không bảo chứng gì cho câu "kho thật sinh ra". Đây đúng thứ evals.yaml E8 dòng 104-106 cấm: "PAYLOAD EVE THAT rut tu fixture san co o apps/app/test/agent-transcript.spec.ts, khong phai vat tu dung theo khuon ben doc".
  Rationale: AC-4 đòi một lượt eve THẬT cho mỗi dạng said/reasoned/did; fixture viết tay khớp khuôn bên đọc chứ không bắt nguồn từ writer toTranscript nên không chứng minh được đó là lượt thật như AC-4 yêu cầu.

- **Đo bản chép tay thay vì đo đầu ra thật — trang thử dựng lại CSS bằng tay**
  file: `_acceptance/nen-chat-ai-elements/rang/so-do-cuon.mjs:96`
  severity: high
  AC: AC-7
  Con số quyết định ngưỡng AC-7 đo trên một trang HTML viết tay (hằng TRANG, dòng 96-112) và cây DOM dựng bằng document.createElement (dòng 142-178), không phải trên Conversation/MessageScroller thật. Mọi giá trị bố cục được chép tay: `.noi-dung-cv { gap: 2rem; padding: 1rem }` chép từ `gap-8 p-4` của ConversationContent, `.luot.co-nhin` chép hai thuộc tính content-visibility/contain-intrinsic-size, `.o-cuon { overflow-y: auto }` trong khi Conversation thật là StickToBottom với `overflow-y-hidden`. Ô `cv_sau_va` (dòng 218-223) — chính là số "sau vá" đem so ngưỡng 1.2 ở dòng 283/298 — là trang thử tự bật class co-nhin, không phải bản vá trong packages/ui/src/components/ai-elements/conversation.tsx. Nghĩa là nếu bản vá thật bị gỡ khỏi conversation.tsx, tỉ số "sau vá" không đổi và phép đo vẫn "dat"; ngược lại nếu bố cục thật lệch khỏi bản chép tay (đổi gap, đổi wrapper, StickToBottom đổi khuôn) phép đo vẫn xanh vì nó không bao giờ chạm vật thật. Nguồn duy nhất lấy từ tệp thật là hai chuỗi CSS đọc bằng timDong ở dòng 53-57, dùng làm chốt chặn chứ không dựng vật đo.
  Rationale: AC-7 đòi đo Conversation thật trên trình duyệt; công cụ đo dựng lại một trang HTML/CSS chép tay thay vì đo component Conversation thật nên không thoả điều kiện "đo trên vật thật" của AC-7.

- **Assert "chuỗi có mặt" thay cho quan hệ với vật thật — và còn không vào tiêu chí đỗ**
  file: `_acceptance/nen-chat-ai-elements/rang/so-do-cuon.mjs:67`
  severity: medium
  AC: AC-7
  Dòng 67-69: `conversationCoNhin = timDong(dongConversation, "content-visibility") !== null || timDong(dongConversation, "contain-intrinsic-size") !== null` — mối nối duy nhất giữa số đo và component được giao là một phép tìm chuỗi con bất kỳ trong conversation.tsx (khớp cả trong chú thích, trong tên biến, trong một className chết). Cờ này được ghi thẳng vào bằng chứng dưới tên `banVaThat.daApDung: true` (dòng 345-347, và evidence/so-do-cuon.json khai daApDung=true), tức hồ sơ tuyên "bản vá thật đã áp dụng" dựa trên sự CÓ MẶT của chuỗi, không dựa trên hiệu ứng đo được của nó. Nặng hơn: cờ này không nằm trong `ketLuan` (dòng 356 chỉ xét oThieu/thuocPhanUng/datNguong) và không có nhánh thoát khác 0 nào cho nó — dòng 420-424 chỉ console.log một dòng LƯU Ý sau khi đã in "dat". Một hồi quy gỡ [&>*]:[content-visibility:auto] khỏi ConversationContent vì vậy trả về mã 0.
  Rationale: Đây là bước xác minh bản vá trong cùng phép đo AC-7 (mục "Chưa đạt thì vá... rồi đo lại"); cờ xác nhận bản vá dựa trên tìm chuỗi con thay vì đo hiệu ứng thật nên không thoả yêu cầu đo có quan hệ của AC-7.

- **Tuyên ma trận toàn phần nhưng thiếu một phần tử — reasoningState.settled không có assert nào**
  file: `packages/ui/test/eve-to-ai-sdk.spec.ts:51`
  severity: medium
  AC: AC-4
  evals.yaml E8 (dòng 105-107) tuyên "MA TRAN TOAN PHAN viet truoc … So assert = so phan tu", và AC-4 hứa "kết quả mang đúng role và đúng state của AI SDK cho dạng đó". Bảng ánh xạ ở packages/ui/src/lib/eve-to-ai-sdk.ts:14 có hai phần tử state cho reasoned: `reasoningState = { streaming: "streaming", settled: "done" }`. Bài kiểm chỉ ghim phần tử streaming (dòng 51-63, toMatchObject state "streaming"), lấy từ fixture m2:0 với streaming:true. Không có phần tử fixture nào mang streaming:false và `grep '"done"' packages/ui/test` không ra kết quả nào — nhánh `item.streaming ? … : EVE_TO_AI_SDK.reasoningState.settled` (eve-to-ai-sdk.ts:73-75) chưa từng chạy trong bài kiểm. Ba state của toolState đều có assert; vế reasoning chỉ có điểm-case một nửa dân số, nên đảo hằng settled sang bất cứ chuỗi nào cũng không làm bài kiểm đỏ.
  Rationale: AC-4 đòi kết quả mang đúng state AI SDK cho dạng reasoned; state "settled/done" của reasoned không có assert nào nên phần này của AC-4 chưa được chứng minh.

- **Assert "chuỗi có mặt" đứng tên kiểm quan hệ trong vế sổ lệch chuẩn**
  file: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs:338`
  severity: medium
  AC: AC-8
  evals.yaml E12 dòng 218-219 khai vế này là "Kiem QUAN HE, khong phai chuoi co mat: so phai noi thanh loi viec chay lai lenh them se ghi de im lang, va liet ke cac buoc phai lam sau moi lan keo ban moi". Cài đặt lại đúng là chuỗi có mặt: dòng 338 `if (!so.chu.includes(CAU_GHI_DE))` với CAU_GHI_DE = "ghi đè im lặng" (dòng 39) — khớp ở bất kỳ đâu trong tệp, kể cả trong một câu phủ định hay trong mục lục; dòng 350-351 chỉ đếm số dòng khớp regex /^\s*\d+\.\s+\S/ trong khối tiêu đề và đòi >= 4, không xét nội dung bước nào. Bốn dòng đánh số rỗng nghĩa vẫn xanh. (Phần còn lại của răng — so bản CLI tươi với bản trong cây, đối chiếu số dòng và vân tay ở dòng 253-335 — là round-trip thật và không dính lỗi này; chỉ vế đọc sổ ở dòng 337-357 đo bằng chuỗi.)
  Rationale: AC-8 đòi sổ lệch chuẩn "nêu thành lời" việc ghi đè im lặng và các bước sau khi kéo bản mới; phép kiểm điều này chỉ là tìm chuỗi con có mặt, không phải kiểm quan hệ nội dung như AC-8 yêu cầu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Nút trong ai-elements đè màu của biến thể Button bằng className — trái docs/design.md**
  Người dùng thấy gì: Hai nút trong khung chat (cuộn xuống, tải hội thoại) có thể hiện màu nền tối hơi khác các nút viền khác trong ứng dụng, và nếu sau này đổi màu nút chuẩn thì hai nút này sẽ không tự đổi theo.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: medium
  Đề xuất: known-limits

- **Commit perf ghi đè hồ sơ bằng chứng của một vòng nghiệm thu đã đóng**
  Người dùng thấy gì: Hồ sơ bằng chứng của một đợt nghiệm thu đã chốt trước đó bị ghi đè bởi số đo mới, nên nếu sau này cần đối chiếu lại quyết định cũ, số liệu gốc đã không còn nguyên vẹn.
  file: `_acceptance/chan-lai-component-ra-man/evidence/ve-that.json`
  severity: medium
  Đề xuất: new-contract

- **Bản hội thoại tải về in nhãn vai bằng tiếng Anh, không đi qua bảng chuỗi**
  Người dùng thấy gì: Nếu sau này bật tính năng tải hội thoại về máy, tệp tải về sẽ ghi nhãn người nói bằng tiếng Anh (User/Assistant) thay vì tiếng Việt; tính năng tải chưa được bật ở đâu nên chưa ai gặp phải.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: known-limits

- **Cổng lai-ra-man nuốt lỗi nạp module: 6 component đã xoá vẫn nằm trong dân số, gate vẫn xanh**
  Người dùng thấy gì: Một cổng kiểm tra khác (thuộc đợt nghiệm thu trước, không phải đợt này) có thể báo mọi thứ ổn dù một phần giao diện đã bị xoá khỏi ứng dụng, khiến người đọc báo cáo tin nhầm là mọi thứ vẫn còn hoạt động.
  file: `packages/ui/test/lai-ra-man.spec.tsx`
  severity: high
  Đề xuất: new-contract

- **toToolPart biến lượt tool đã lỗi thành output-available khi errorText rỗng**
  Người dùng thấy gì: Khi một hành động của trợ lý AI thất bại nhưng không kèm dòng thông báo lỗi cụ thể, màn hình chat có thể hiển thị như thể hành động đó đã chạy xong bình thường, khiến người dùng không biết là nó đã hỏng.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: medium
  Đề xuất: new-contract

- **Răng mồ côi in "MIEN TRU THUA" nhưng vẫn thoát 0**
  Người dùng thấy gì: Một ngoại lệ tạm thời trong công cụ kiểm tra tự động có thể tồn tại quá thời hạn đáng lẽ phải gỡ mà không ai bị bắt buộc cảnh báo; đây là rủi ro cho đội kỹ thuật, không ảnh hưởng người dùng sản phẩm.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: low
  Đề xuất: known-limits

- **so-lech-chuan.mjs bỏ lại sân tạm mỗi lần đo hỏng — finally không chạy sau process.exit**
  Người dùng thấy gì: Một công cụ nội bộ dùng khi kiểm tra có thể để lại vài tệp rác tạm trên máy mỗi lần chạy lỗi; không ảnh hưởng gì tới người dùng sản phẩm.
  file: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
