## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — assertion âm tính một mình: 5/7 chuỗi của lớp chữ eve không bao giờ có mặt trong bản ghi, kể cả khi chưa lọc**
  Người dùng thấy gì: Bài kiểm chỉ chứng minh được một phần rằng chữ tiếng Anh gốc của trợ lý không hiện trên màn khi có câu hỏi hết hạn mức; một vài trường hợp lẽ ra cần kiểm chưa thực sự được kiểm chứng đầy đủ, dù kết quả nhìn thấy trên màn vẫn đúng như mong đợi.
  file: `apps/app/test/het-han-muc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **The fake agent sends a stream end marker one past the last event, unlike real eve (r2)**
  Người dùng thấy gì: Công cụ đo dùng để chụp bằng chứng có thể không lặp lại đúng hệt cách hội thoại thật kết thúc, nên phần bằng chứng thu được có thể không phản ánh đầy đủ trải nghiệm thật, dù giao diện người dùng thật không bị ảnh hưởng.
  file: `_acceptance/bo-dung-khong-ket/rang/tac-tu-gia.ts`
  severity: medium
  Đề xuất: known-limits

- **Fake agent reports x-eve-stream-tail-index one past the last event, so every snapshot stalls ~7.75s on empty reconnects (r2)**
  Người dùng thấy gì: Mỗi lần phép đo mở lại đoạn hội thoại, nó có thể mất thêm vài giây chờ trước khi hiện đúng, nên một ảnh chụp làm bằng chứng có nguy cơ chụp nhằm lúc màn chưa kịp hiện xong, dù người dùng thật không gặp độ trễ này.
  file: `_acceptance/bo-dung-khong-ket/rang/tac-tu-gia.ts`
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
