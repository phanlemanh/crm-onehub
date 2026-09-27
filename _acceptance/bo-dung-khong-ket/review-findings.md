## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Stored builder answer JSON (now with `kind`) is read by two apps, each with its own loose schema, not one shared schema in packages/validation**
  Người dùng thấy gì: Dữ liệu bộ dựng lưu lại có thể được hai phần của hệ thống hiểu hơi khác nhau; một giá trị bất thường có thể bị bỏ qua âm thầm thay vì báo lỗi rõ ràng.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: medium
  Đề xuất: known-limits

- **Moving upstream code into a new file adds fork divergence, and a leftover re-export keeps the old import path alive**
  Người dùng thấy gì: Không ảnh hưởng người dùng ngay, nhưng lần cập nhật tiếp theo từ bản gốc của hãng có thể xung đột và mất công gỡ.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: low
  Đề xuất: known-limits

- **Session-limit prompt is a plain styled `<p>` inside `Item` instead of Item's own text slot**
  Người dùng thấy gì: Không đổi gì người dùng thấy; chỉ là cách dựng giao diện chưa theo đúng quy ước chung, có thể bị yêu cầu sửa lại sau.
  file: `apps/app/components/agent-session-limit-composer.tsx`
  severity: low
  Đề xuất: known-limits

- **The builder's 128k output budget never applies: the main agent's 50k cap limits it**
  Người dùng thấy gì: Sau vài lần chỉnh sửa trong cùng một hội thoại dựng, bộ dựng có thể lại hết hạn mức sớm hơn nhiều so với mức đã hứa, khiến người dùng phải cấp thêm nhiều lần hơn mong đợi, thậm chí bị chặn ngay từ bước đầu.
  file: `apps/agent/agent/lib/dispatch-config.ts`
  severity: high
  Đề xuất: new-contract

- **A budget-exhausted question from a new builder child can be silently dropped, leaving the conversation stuck**
  Người dùng thấy gì: Nếu hội thoại dựng gặp câu hỏi hết hạn mức lần thứ hai, màn hình có thể không hiện câu hỏi đó nữa — hội thoại treo im lặng mà người dùng không biết phải làm gì, đúng vấn đề mà bản vá này muốn chặn.
  file: `apps/agent/agent/lib/builder-input.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 2 (hand-written fixture, no writer→reader round-trip): the answer-bubble test feeds a hand-written {kind, optionId} straight into sessionLimitAnswerLabel**
  Người dùng thấy gì: Nếu cách lưu nhãn câu trả lời thay đổi trong tương lai, người dùng có thể thấy lại nhãn tiếng Anh thay vì tiếng Việt mà không phép thử nào phát hiện trước khi phát hành.
  file: `apps/app/test/het-han-muc.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Shape 4 (negative assertion alone): 'gui loi thi hai nut mo lai' only checks disabled=false and never shows the buttons locked while sending**
  Người dùng thấy gì: Nếu khoá hai nút trong lúc gửi bị bỏ sót trong lần sửa sau, người dùng có thể bấm hai lần liên tiếp mà không phép thử nào bắt được.
  file: `apps/app/test/het-han-muc.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 2 (hand-written fixture): the dispatch test and the chay-tiep evals build the submission by hand instead of taking the message the API writes**
  Người dùng thấy gì: Nếu cách hai phần hệ thống trao đổi câu trả lời lệch nhau trong tương lai, lỗi có thể chỉ lộ ra khi người dùng thật gặp phải, vì phép thử hiện không đi qua đường thật.
  file: `apps/agent/test/cau-hoi-het-han-muc.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserts a string is present when the promise is a relation): the docs check only greps '128k'/'500k'/'session-limit'/'outputSchema' inside the section**
  Người dùng thấy gì: Tài liệu có thể ghi đúng từ khoá nhưng sai nội dung, ví dụ đảo ngược hai con số hạn mức, mà không ai phát hiện qua kiểm tra tự động.
  file: `_acceptance/bo-dung-khong-ket/rang/tai-lieu.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
