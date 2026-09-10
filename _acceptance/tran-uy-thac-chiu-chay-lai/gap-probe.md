---
slug: tran-uy-thac-chiu-chay-lai
at: 2026-09-10T08:52:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
claims_input: ok
round: 2
---

# Phản biện context sạch — lượt hai, trên hợp đồng ĐÃ đổi khuôn

Lượt một soi bộ artifact đầu (khoá theo toạ độ) và trả 5 finding, cả năm đã sửa —
xem mục lịch sử ở cuối. Lượt này soi bộ artifact **sau khi đổi khuôn**, và được
mở thêm một cửa có chủ ý: **được đọc mã `eve` trong `node_modules`**, vì đúng chỗ
tin-tài-liệu-không-đọc-mã là chỗ hợp đồng bản đầu sai.

Kết quả: **khuôn thứ hai cũng sai**, và sai ở cả hai chiều. Hai mục P0 dưới đây
đẩy lên người quyết ở Cổng 1 — không sửa im lặng, vì không còn tín hiệu nào trong
tầm nhìn của hook để vá tại chỗ.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | contract | Không tiêu chí nào phủ ô «`step.started` tới đúng ô đã ghi mà KHÔNG có lần chạy model lại». AC-1 lại khai việc xoá ô ở đúng ca đó là ĐÚNG. | Lượt builder, model gọi `agent_builder` ở step 2 → hook ghi ô. Vì subagent-call là runtime action, harness **park** batch và lưu `emissionState` y nguyên — `advanceStep` chỉ được gọi ở nhánh kết step. Builder xong, harness vào lại `executeStepBody`, đọc cùng `stepIndex` 2 và phát `step.started` (turn-1, step 2) → AC-1 xoá ô. Model chạy tiếp, vẫn step 2, uỷ thác **lần hai** → không ném. Trần chết trên đường **thường nhất**: builder trả về rồi model gọi lại. E1–E13 vẫn xanh vì hợp đồng khai việc xoá ấy là đúng. | Tiêu chí đo ba sự kiện theo thứ tự eve thật phát, và ranh giới chạy lại phải là tín hiệu phân biệt được resume-sau-subagent với chạy-lại-thật. | **human-gate1** — không sửa được tại chỗ. `step.started` là tín hiệu duy nhất tôi tìm ra cho ranh giới chạy lại, và nó vừa bị bác. Xem ba đường ở mục dưới. |
| P0 | contract | AC-2 và chiều đỏ của AC-1 đóng băng «không có `step.started` giữa hai lời gọi cùng toạ độ → ném», nhưng eve có đường chạy lại model TRONG một step mà **không** phát `step.started` nào. | `runOneModelCall` gọi `runModelCallWithRetries`, và mọi attempt khác 1 truyền `suppressStepStartedEmission: true`; `buildStepHooks` nhận `emitStepStarted: e.suppressStepStartedEmission !== true`, nên `prepareStep` **không** phát. Hai đường recovery (`empty-response`, `unsupported-provider-tool`) cũng truyền `true`. Attempt 1 phát `agent_builder` (`call-a`) rồi lỗi; attempt 2 sinh `call-b` cùng `(turn-1, step 2)`, không `step.started` ở giữa → AC-2 đòi ném → `turn.failed`. Đúng lượt mà eve đang cố cứu, tức **bug gốc chưa được vá**. | Eval mô phỏng attempt-retry trong một step và đòi KHÔNG ném; hoặc thay tín hiệu ranh giới bằng thứ eve thật sự cấp. | **human-gate1** — cùng gốc với mục trên. |
| P1 | contract | Dòng «`step.started` phát ở đâu» trong mục *Sự thật về eve* **sai**, và thước CE của trục A′ ghim đúng câu sai đó — mục sinh ra để sửa hai vòng tin tài liệu lại tin một tiền đề không có trong mã. | Người duyệt Cổng 1 đọc bảng mang nhãn «đọc từ mã» và duyệt khuôn mới trên tiền đề ấy; sau ship, hai lớp lỗi P0 trên không cổng nào thấy vì evals đã đóng băng tiền đề sai. | Phát biểu lại thành mệnh đề đo được: `step.started` phát **một lần mỗi lần vào `executeStepBody`**, gồm resume sau park runtime-action, **không** gồm attempt của `runModelCallWithRetries` và hai đường recovery. Đổi thước CE sang `tool-loop.js`. | **fixed:** đã sửa dòng đó trong hợp đồng và trong `docs/agent.md`, và ghi thêm bảng đường-đi-thật. Đây là finding tôi phải nhận: tôi đã tự đọc `emission.js` nhưng **không** đọc `tool-loop.js`, nên chỉ thấy nửa sự thật. |
| P1 | evals | AC-10 đòi tương đương hai chiều cho **cả** `clearBuilderDelegationStep`, nhưng E10 chỉ khai một quan hệ (cho `ActionsRequestedData`). Hàm mới của vòng này không có assert kiểu nào. | `clearBuilderDelegationStep` khai tay `turnId`/`stepIndex`. `tsc` xanh, E10 xanh. Vì `step.completed` cũng mang ba trường ấy, handler xoá ô có thể nối vào `step.completed` mà không phép đo nào đỏ — và `step.completed` đến **sau** `actions.requested` của cùng step, tức ô bị xoá sai thời điểm. | E10 thêm hằng thứ hai cho hàm clear, cộng phản-ví-dụ gồm cả kiểu khai tay đủ trường và kiểu `data` của `step.completed`. | **deferred** — treo cùng hai P0, vì nếu khuôn đổi lần nữa thì `clearBuilderDelegationStep` có thể không còn tồn tại. Ghi vào sổ, không bỏ. |
| P2 | contract | Mục Coverage không hoà số: phần chữ tính 21 ô, bảng có 24 dòng, ghi Core 19/24. Trục A′ ba giá trị chưa bao giờ được nhân vào không gian A × B. | Người duyệt đọc 21 rồi đọc bảng 24 dòng, không có cách nào biết ô nào chưa được sinh ra. Và vì A′ không vào tích, đúng ô sinh ra P0 thứ nhất **không tồn tại** trong bảng — nên khoảng trống nặng nhất của vòng đi qua cổng dưới nhãn «đã quét đủ». | Nhân A′ vào tích rồi liệt kê từng ô; hoà một tổng duy nhất suy từ tích các trục và đối chiếu với số dòng bảng. | **deferred** cùng hai P0 — bảng Coverage phải dựng lại theo khuôn được chọn, dựng bây giờ là dựng cho một khuôn sắp bị thay. |

## Lịch sử

Lượt một (cùng ngày, trên bộ artifact khoá-theo-toạ-độ): 5 finding — 2 P0, 2 P1,
1 P2 — cả năm đã sửa vào artifact, không mục nào đẩy sang người. Chi tiết ở lịch
sử git của file này.
