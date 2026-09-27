## Trong hợp đồng

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): E6 hứa 'không có chữ tiếng Anh của eve' nhưng chỉ liệt kê hai chuỗi**
  Phần expected của E6 (dòng 156-157) tuyên bố cả một lớp: không có chữ tiếng Anh nào của eve trên màn. Nhưng nó chỉ kể hai điểm, "output-token limit" và "Approve". Không có ma trận viết trước gồm mọi chuỗi tiếng Anh mà request thật mang theo. Fixture thật apps/agent/test/fixtures/session-limit-that.json, và dòng input.requested trong rang/luong-het-han-muc-that.ndjson mà tác tử giả mới phát lại, có một tập hữu hạn đã biết: nhãn "Approve" và "Stop"; mô tả "Grant a fresh token budget" và "Stop now"; câu prompt ("This session has hit...", "guardrail", "just approve to keep going"); tên tool session_limit_continuation. Với khuôn hiện tại, số assert (2) nhỏ hơn số phần tử của lớp. Chỗ hở này đã lộ ra ở vòng 1. Evidence-report ghi dòng "Session limit continuation" (tên tool eve được định dạng lại) hiện giữa thân hội thoại trong E6-het-han-muc-1440.png. Người chấm vẫn để qua vì "không phải 1 trong 2 chuỗi cấm nêu trong Expected". Nhãn "Stop" và các mô tả option cũng sẽ lọt qua theo cùng cách. Vậy phép đo sẽ không bắt được lời hứa "không lộ chữ eve" khi nó hỏng với bất kỳ chuỗi nào ngoài hai chuỗi đã kể. Vòng này sửa steps của E6 (thêm tác tử giả) nhưng giữ nguyên danh sách hai điểm này.
  file: `_acceptance/bo-dung-khong-ket/evals.yaml:156`
  severity: high
  source: measurement
  AC: AC-4

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The fake agent sends a stream end marker one past the last event, unlike real eve**
  Người dùng thấy gì: Công cụ đo dùng để chụp bằng chứng có thể không lặp lại đúng hệt cách hội thoại thật kết thúc, nên phần bằng chứng thu được có thể không phản ánh đầy đủ trải nghiệm thật, dù giao diện người dùng thật không bị ảnh hưởng.
  file: `_acceptance/bo-dung-khong-ket/rang/tac-tu-gia.ts`
  severity: medium
  Đề xuất: known-limits

- **Fake agent reports x-eve-stream-tail-index one past the last event, so every snapshot stalls ~7.75s on empty reconnects**
  Người dùng thấy gì: Mỗi lần phép đo mở lại đoạn hội thoại, nó có thể mất thêm vài giây chờ trước khi hiện đúng, nên một ảnh chụp làm bằng chứng có nguy cơ chụp nhằm lúc màn chưa kịp hiện xong, dù người dùng thật không gặp độ trễ này.
  file: `_acceptance/bo-dung-khong-ket/rang/tac-tu-gia.ts`
  severity: medium
  Đề xuất: known-limits

- **Stored builder answer JSON (now with `kind`) is read by two apps, each with its own loose schema, not one shared schema in packages/validation (r1)**
  Người dùng thấy gì: Dữ liệu bộ dựng lưu lại có thể được hai phần của hệ thống hiểu hơi khác nhau; một giá trị bất thường có thể bị bỏ qua âm thầm thay vì báo lỗi rõ ràng.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: medium
  Đề xuất: known-limits

- **Moving upstream code into a new file adds fork divergence, and a leftover re-export keeps the old import path alive (r1)**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay, nhưng lần cập nhật tiếp theo từ bản gốc của hãng có thể xung đột và mất công gỡ.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Session-limit prompt is a plain styled `<p>` inside `Item` instead of Item's own text slot (r1)**
  Người dùng thấy gì: Không đổi gì người dùng thấy; chỉ là cách dựng giao diện chưa theo đúng quy ước chung, có thể bị yêu cầu sửa lại sau.
  file: `apps/app/components/agent-session-limit-composer.tsx`
  severity: low
  Đề xuất: known-limits

- **The builder's 128k output budget never applies: the main agent's 50k cap limits it (r1)**
  Người dùng thấy gì: Sau vài lần chỉnh sửa trong cùng một hội thoại dựng, bộ dựng có thể lại hết hạn mức sớm hơn nhiều so với mức đã hứa, khiến người dùng phải cấp thêm nhiều lần hơn mong đợi, thậm chí bị chặn ngay từ bước đầu.
  file: `apps/agent/agent/lib/dispatch-config.ts`
  severity: high
  Đề xuất: new-contract

- **A budget-exhausted question from a new builder child can be silently dropped, leaving the conversation stuck (r1)**
  Người dùng thấy gì: Nếu hội thoại dựng gặp câu hỏi hết hạn mức lần thứ hai, màn hình có thể không hiện câu hỏi đó nữa — hội thoại treo im lặng mà người dùng không biết phải làm gì, đúng vấn đề mà bản vá này muốn chặn.
  file: `apps/agent/agent/lib/builder-input.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 2 (hand-written fixture, no writer→reader round-trip): the answer-bubble test feeds a hand-written {kind, optionId} straight into sessionLimitAnswerLabel (r1)**
  Người dùng thấy gì: Nếu cách lưu nhãn câu trả lời thay đổi trong tương lai, người dùng có thể thấy lại nhãn tiếng Anh thay vì tiếng Việt mà không phép thử nào phát hiện trước khi phát hành.
  file: `apps/app/test/het-han-muc.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): 'gui loi thi hai nut mo lai' only checks disabled=false and never shows the buttons locked while sending (r1)**
  Người dùng thấy gì: Nếu khoá hai nút trong lúc gửi bị bỏ sót trong lần sửa sau, người dùng có thể bấm hai lần liên tiếp mà không phép thử nào bắt được.
  file: `apps/app/test/het-han-muc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture): the dispatch test and the chay-tiep evals build the submission by hand instead of taking the message the API writes (r1)**
  Người dùng thấy gì: Nếu cách hai phần hệ thống trao đổi câu trả lời lệch nhau trong tương lai, lỗi có thể chỉ lộ ra khi người dùng thật gặp phải, vì phép thử hiện không đi qua đường thật.
  file: `apps/agent/test/cau-hoi-het-han-muc.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts a string is present when the promise is a relation): the docs check only greps '128k'/'500k'/'session-limit'/'outputSchema' inside the section (r1)**
  Người dùng thấy gì: Tài liệu có thể ghi đúng từ khoá nhưng sai nội dung, ví dụ đảo ngược hai con số hạn mức, mà không ai phát hiện qua kiểm tra tự động.
  file: `_acceptance/bo-dung-khong-ket/rang/tai-lieu.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).