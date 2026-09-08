## Trong hợp đồng

- **Fixture VIẾT TAY đúng khuôn bên đọc — bản ghi quyền bịa tại chỗ thay vì gọi buildPendingInputRequest**
  file: `apps/agent/test/custom-agent-runtime.spec.ts:75`
  severity: low
  source: measurement
  AC: AC-3
  Dòng 75-91: hai assert mới gọi `commandTypeFromAuthorization({ kind: "question", requestId: "question-1", prompt: "Which one", options: [], [BUILDER_AUTHORIZATION_KEY]: true })` (và bản `false`) trên một object literal viết thẳng trong bài đo. File chỉ import `BUILDER_AUTHORIZATION_KEY` + `commandTypeFromAuthorization` (bên ĐỌC), không import `buildPendingInputRequest` (bên GHI) — nên đây là fixture dựng đúng khuôn reader, không phải bản ghi rút-từ-writer-đọc-bằng-reader.

  Đối chiếu ngay trong cùng diff: apps/api/test/conversations.spec.ts và apps/agent/test/quyen-luot.spec.ts đều đã chuyển sang dựng bản ghi bằng `buildPendingInputRequest(...)`, và E1 của _acceptance/quyen-luot-mang-theo/evals.yaml ghim rõ "Fixture dung tay dung khuon ben doc -> ma 2". Chỗ này là chỗ duy nhất còn bịa.

  Hệ quả: `buildPendingInputRequest` còn làm một việc nữa là `askedQuestion.safeParse` rồi NÉM nếu câu hỏi sai khuôn (packages/validation/src/builder-question.ts:56-63). Fixture bịa đi vòng qua bước đó, nên nó có thể mã hoá một bản ghi mà đường ghi thật không bao giờ sinh ra được, và mọi thay đổi ở writer (bọc cờ vào nhánh con, đổi hình dạng envelope) sẽ không làm hai assert này đỏ.

  Rationale khớp AC: AC-3 nêu đúng sàn khuôn này: "bản ghi dựng bằng object literal viết tay thay vì hàm dựng chung → mã 2" — file này dựng bản ghi quyền bằng object literal thay vì gọi buildPendingInputRequest, đúng hình dạng thất bại AC-3 đã đặt tên.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **pendingInputRequest bị parse hai lần bằng hai schema khác nhau — trái luật "parse ở biên, một module sở hữu một shape"**
  Người dùng thấy gì: Nếu sau này ai đó đổi cấu trúc dữ liệu câu hỏi đang chờ trả lời, phần quyết định có cho tạo tác nhân hay không có thể ngưng hoạt động đúng mà không ai nhận ra ngay, vì thông tin này đang được đọc lại rời rạc ở hai chỗ khác nhau trong cùng một luồng xử lý.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: high
  Đề xuất: known-limits

- **buildPendingInputRequest validate rồi vứt kết quả parse, trả về T thô**
  Người dùng thấy gì: Dữ liệu câu hỏi được lưu xuống có thể chưa được làm sạch đầy đủ trước khi lưu, nên các phần khác của hệ thống đọc lại dữ liệu này về sau có thể thấy thông tin không hoàn toàn nhất quán với những gì đáng lẽ được chuẩn hoá.
  file: `packages/validation/src/builder-question.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape not_authorized khai hai nơi, sẽ trôi khỏi nhau**
  Người dùng thấy gì: Nếu sau này tên trạng thái "bị từ chối quyền" của tác nhân dựng agent bị đổi ở một chỗ mà quên đổi chỗ còn lại, hội thoại có thể lại bị kẹt mãi ở trạng thái đang xử lý không bao giờ dừng, giống sự cố đã từng xảy ra trước đây.
  file: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai bài test quét văn bản mã nguồn bằng regex, một bài còn với sang app khác**
  Người dùng thấy gì: Một số phép đo tự động chỉ kiểm tra hình dạng chữ trong mã nguồn thay vì chạy thử hành vi thật, và một phép đo còn phải mở sang bộ mã của ứng dụng khác để đếm — nên nếu sau này có người viết lại đúng logic đó theo cách khác, phép đo có thể báo nhầm là lỗi, hoặc vỡ khi hai ứng dụng được tách triển khai riêng hẳn.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Trần một-lần-uỷ-thác bị tắt đúng trên lượt không có quyền — nhánh not_authorized không có chốt cứng**
  Người dùng thấy gì: Khi tác nhân dựng agent bị từ chối quyền, hệ thống cha có thể thử gọi lại nhiều lần trong cùng một lượt vì không có gì chặn cứng việc gọi lại — chỉ có lời khuyên trong chỉ dẫn nói đừng thử lại — nên mỗi lượt bị từ chối có thể tốn thêm thời gian chờ và chi phí xử lý không cần thiết.
  file: `apps/agent/agent/hooks/builder-delegation.ts`
  severity: medium
  Đề xuất: new-contract

⚠ Cụm ngoài vùng phủ: 3/6 lỗi rơi vào file không bộ đo nào phủ (apps/agent/agent/subagents/agent_builder/lib/execution-state.ts, apps/agent/agent/hooks/builder-delegation.ts, apps/agent/test/custom-agent-runtime.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
