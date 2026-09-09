## Trong hợp đồng

- **Fixture viết tay thay round-trip: cờ quyền được truyền tay vào phép đo, đường sinh thật (crm.ts) không phép đo nào chạm**
  file: `apps/agent/test/builder-runtime.integration.spec.ts:176`
  severity: high
  AC: AC-1
  source: measurement
  detail: AC-1/E1 hứa: "Given hook input.requested chạy với ctx của một lượt builder ... Then bản ghi mang kết quả builderTurnAuthorized(ctx) của lượt đã hỏi". Nhưng mọi lời gọi trong phép đo đều TỰ TAY đưa giá trị đó vào: persistBuilderInputRequest(event, undefined, conversationId, true) ở dòng 100/137/143/152/259/273 và ..., conversation.id, false) ở dòng 176-200. Nói cách khác bài đo dựng sẵn đúng thứ mà bên đọc cần, thay vì để bên SINH sinh ra nó rồi bên đọc đọc lại.

  Bên sinh thật là apps/agent/agent/channels/crm.ts:248 — `builderTurnAuthorized(ctx)` truyền vào tham số thứ tư — và đó là chỗ DUY NHẤT trong mã chạy sinh giá trị này (grep builderTurnAuthorized: chỉ có session-purpose.ts định nghĩa, authorization.ts dùng cho policy, crm.ts:248 dùng cho đường ghi, còn lại là chan-uy-thac.spec.ts). Không bài đo nào trong diff import channels/crm ngoài crm-token.spec.ts và close-task.integration.spec.ts, cả hai không chạm hook này.

  Hệ quả cụ thể: đổi crm.ts:248 thành hằng `true` thì toàn bộ E1..E9 của cả hai hồ sơ vẫn xanh, trong khi mọi câu hỏi đều được ghi là "được phép" — đúng lại lỗ mà vòng này sinh ra để vá (câu trả lời kế thừa CREATE_AGENT). Chính evals.yaml E1 đã khai sàn cho tình huống này — "San dan so: khong dung duoc ctx cua hook -> ma 2" — nhưng phép đo không dừng ở mã 2, nó thay ctx bằng literal rồi báo xanh.
  rationale: AC-1 khai rõ sàn khuôn fixture buộc phải round-trip qua chính đường runtime thật đặt giá trị đó; bài đo này tự tay gán cờ thay vì lấy từ đường sinh thật nên trực tiếp làm sàn đó thất bại.

- **Ma trận lớp không ghim dân số: PURPOSES là literal ba phần tử, sàn "tập giá trị purposeOf trả về ≠ 3 -> mã 2" không được cài**
  file: `apps/agent/test/chan-uy-thac.spec.ts:13`
  severity: medium
  AC: AC-4
  source: measurement
  detail: E4 (chan-uy-thac) tuyên quét toàn lớp: "MA TRAN TOAN PHAN tren tich: {research, team-agent, builder} x {co CREATE_AGENT, khong co}" và khai kèm sàn dân số "tap gia tri purposeOf tra ve dem ra khac 3 -> ma 2, IN gia tri la".

  Phép đo cài ma trận (dòng 69-84) đúng 6 ô và có `expect(cases).toHaveLength(6)`, nhưng dân số của lớp đến từ hằng viết tay ở dòng 13: `const PURPOSES = ["research", "team-agent", "builder"] as const;`. Không assert nào nối danh sách này với lớp thật — `SessionPurpose` trong apps/agent/agent/lib/session-purpose.ts:3 hay tập giá trị `purposeOf` có thể trả. Sàn dân số mà E4 khai không tồn tại trong file.

  Hệ quả: thêm một purpose thứ tư vào `SessionPurpose`/`purposeOf` thì `cases` vẫn dài 6, `toHaveLength(6)` vẫn đúng, ma trận lặng lẽ thành điểm-case và eval vẫn xanh — đúng lớp lỗi mà E4 dựng ra để chặn (nó viện dẫn chính chuyện team-agent lọt cửa khi policy chỉ liệt kê research).
  rationale: AC-4 khai đúng yêu cầu 'tập giá trị purposeOf đếm ra khác 3 → mã 2, nêu giá trị lạ' làm sàn dân số bắt buộc, và bài đo không cài sàn này mà chỉ ghim cứng ba giá trị viết tay.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Định danh tiếng Việt trong mã sản phẩm (traVeTuChoi / tuChoiQuyen)**
  Người dùng thấy gì: Đây là cách đặt tên trong mã nguồn nội bộ, không hiển thị và không ảnh hưởng gì tới người dùng khi thao tác trên sản phẩm; nó chỉ khiến người phát triển sau này đọc và sửa mã khó hơn.
  file: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
  severity: high
  Đề xuất: known-limits

- **Chuỗi 'not_authorized' khai ở hai nơi, không nối nhau bằng kiểu hay hằng**
  Người dùng thấy gì: Nếu sau này có người sửa nhầm chỉ một trong hai chỗ đang lặp lại trạng thái từ chối, hệ thống có thể lại rơi vào tình trạng luôn cho phép tạo tác nhân dù người dùng chưa yêu cầu — đúng sự cố đã xảy ra trước đó — mà không có cách nào phát hiện ngay.
  file: `apps/agent/agent/subagents/agent_builder/lib/execution-state.ts`
  severity: high
  Đề xuất: known-limits

- **buildPendingInputRequest kiểm khuôn rồi vứt kết quả, ghi xuống giá trị thô**
  Người dùng thấy gì: Câu hỏi được lưu lại cho người dùng có thể mang một số dữ liệu không được làm sạch hoặc kiểm tra đúng như quy định, khiến nội dung lưu trong hệ thống có thể sai khác so với những gì phần đọc lại mong đợi.
  file: `packages/validation/src/builder-question.ts`
  severity: high
  Đề xuất: known-limits

- **builderCommandType nay là hàm đồng nhất với một tham số chết**
  Người dùng thấy gì: Đây là một đoạn mã nội bộ không dùng tới, không tạo ra hành vi sai và không ảnh hưởng gì đến trải nghiệm của người dùng.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: medium
  Đề xuất: wont-fix

- **Bài đo của packages/validation đặt trong hai app, trùng nhau**
  Người dùng thấy gì: Đây là việc tổ chức bài kiểm tra nội bộ bị trùng lặp giữa hai nơi, làm tăng công sức bảo trì về sau nhưng không ảnh hưởng gì tới người dùng đang dùng sản phẩm.
  file: `apps/api/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Bài đo đơn vị quét chữ trong mã nguồn và đọc sang app khác**
  Người dùng thấy gì: Một số phép đo tự động cho tính năng này dựa trên cách dò tìm chữ trong mã nguồn thay vì đo hành vi thật, nên kết quả đạt của các phép đo đó không chắc chắn phản ánh đúng thực tế — người quyết định nên biết độ tin cậy ở đây thấp hơn con số thể hiện.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **outputSchema kieu discriminatedUnion lower thanh JSON Schema goc oneOf khong co type:"object" — schema cua tool final_output**
  Người dùng thấy gì: Có khả năng toàn bộ tính năng dựng tác nhân — kể cả những yêu cầu hợp lệ, đúng quy trình — sẽ không chạy được khi dùng với mô hình thật, vì định nghĩa gửi cho mô hình có thể bị từ chối. Việc này chưa được thử với một lượt chạy thật nên chưa ai kiểm chứng nó có thật sự xảy ra hay không.
  file: `apps/agent/agent/subagents/agent_builder/agent.ts`
  severity: medium
  Đề xuất: known-limits

- **Đo chuỗi-có-mặt thay vì quan hệ: sàn dân số AC-5 là regex một dòng, không phải phép đếm tính chất**
  Người dùng thấy gì: Một phép đo dùng để đảm bảo hệ thống không tự suy đoán quyền hạn từ nội dung tin nhắn đang dựa trên cách dò tìm một mẫu chữ cụ thể trong mã nguồn; nếu mã được viết theo cách khác đi một chút, phép đo này có thể báo an toàn dù rủi ro thực tế vẫn còn.
  file: `apps/agent/test/quyen-luot.spec.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa phân loại (triage-failed)

phân loại phạm vi không chạy được — không lỗi nào bị máy tự sửa, người xem lại toàn bộ.

- **Union 'CHAT' | 'CREATE_AGENT' viết tay lần thứ ba**
  file: `packages/validation/src/builder-question.ts:64`
  severity: low
  source: conventions
  detail: Kiểu trả về `"CHAT" | "CREATE_AGENT"` được gõ tay ở đây, trong khi cùng tập giá trị đã khai ở apps/api/src/conversations/conversations.contracts.ts:122 (`z.enum(["CHAT", "CREATE_AGENT"])`) và ở apps/app/lib/agent-builder.ts (`BuilderCommandType`). Ba khai báo cho một tập giá trị, không cái nào suy ra từ cái nào — thêm một loại lệnh thứ ba sẽ phải sửa ba chỗ và trình biên dịch chỉ bắt được hai.

⚠ Cụm ngoài vùng phủ: 7/11 lỗi rơi vào file không bộ đo nào phủ (packages/validation/src/builder-question.ts, apps/agent/agent/lib/custom-agent-dispatch.ts, apps/api/test/quyen-luot.spec.ts, apps/agent/test/quyen-luot.spec.ts, apps/agent/test/builder-runtime.integration.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.