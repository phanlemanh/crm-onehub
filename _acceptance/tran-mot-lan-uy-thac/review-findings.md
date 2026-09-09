## Trong hợp đồng

- **Assertion âm-tính-một-mình: `callIds).toEqual([])` bằng đúng giá trị mặc định nên không phân biệt được hook sống với hook chết**
  file: `apps/agent/test/tran-uy-thac.spec.ts:356`
  severity: medium
  AC: AC-9
  source: measurement
  detail: |
    Bài "khong-loi-goi: su kien khong mang agent_builder thi im lang" (dòng 344-359) chốt hai thứ: `expect(...).not.toThrow()` và

      expect(builderDelegationState.get().callIds).toEqual([]);

    evals.yaml E9 đặt đúng assert thứ hai này làm đối chứng dương: "Phai assert trang thai; 'khong nem' mot minh khong phan biet duoc voi mot hook chet." Nhưng trường được chọn không làm được việc đó. Mặc định của state khai ở apps/agent/agent/lib/builder-delegation.ts là `() => ({ turnId: null, callIds: [] })` — `callIds` mặc định ĐÃ là `[]`. Hook chạy và ghi `{ turnId: "turn-1", callIds: [] }` hay hook không chạy một dòng nào đều cho cùng một `[]`. Assert này vì thế vẫn là phủ định đơn độc đội lốt khẳng định: nó không ghim được rằng hook đã thật sự vào thân và gọi `builderDelegationState.update`.

    Trường phân biệt được nằm ngay cạnh và không được đọc: `turnId` đi từ `null` (mặc định) sang `"turn-1"` (hook đã ghi). Chỗ khác trong cùng file đã đọc cả object đúng cách — dòng 137 `expect(builderDelegationState.get()).toEqual({ turnId: "turn-1", callIds: ["call-1"] })` — nên cách chốt chặt hơn có sẵn trong file, riêng ô này bỏ qua.

    Lưu ý phạm vi: bài thứ ba của cùng describe (dòng 385 trở đi, chiều đổi `subagentName` sang `agent_builder` rồi assert `["call-1"]`) có đối chứng dương thật, nên executor `tr_khong_co_loi_goi` không hoàn toàn mù. Nhưng ô AC-9 chính — "sự kiện không mang agent_builder" — thì vẫn xanh nguyên nếu hook bị vô hiệu hóa hoàn toàn, đúng thứ E9 tuyên là đã chặn.
  rationale: AC-9 (qua eval E9 đi kèm) đòi bài đo phải phân biệt được hook đã chạy và ghi trạng thái với hook chết hoàn toàn; assert hiện tại so đúng giá trị mặc định của state nên không phân biệt được hai trường hợp đó, làm thất bại đúng phần bằng chứng AC-9 yêu cầu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Test đâm vào ruột build của eve, vòng qua exports map và đọc Symbol nội bộ trên globalThis**
  Người dùng thấy gì: Nếu thư viện eve nâng cấp nội bộ ở một bản vá nhỏ, bộ kiểm thử của tính năng chặn gọi lặp có thể báo lỗi hàng loạt dù tính năng vẫn hoạt động đúng, làm chậm các thay đổi khác không liên quan trong lúc chờ gỡ.
  file: `apps/agent/test/tran-uy-thac.spec.ts:31`
  severity: high
  Đề xuất: known-limits

- **Trần một-lần khoá theo callId do model sinh, trái đúng khuyến nghị trong guide hooks của eve**
  Người dùng thấy gì: Nếu một bước xử lý bị gián đoạn giữa chừng (mất mạng, khởi động lại) và hệ thống tự thử lại trong cùng một lượt, người dùng có thể thấy cả lượt báo lỗi dù họ chỉ yêu cầu tạo trợ lý đúng một lần.
  file: `apps/agent/agent/lib/builder-delegation.ts:37`
  severity: medium
  Đề xuất: new-contract

- **Hook vứt bỏ union đã có type của eve, thay bằng type tự viết tay — trần có thể im lặng thành no-op mà mọi bài test vẫn xanh**
  Người dùng thấy gì: Nếu thư viện eve đổi tên trường trong một bản cập nhật sau này, cơ chế chặn gọi lặp có thể ngừng hoạt động một cách âm thầm và người dùng có thể gặp lại đúng lỗi vòng lặp từng xảy ra trước đây, mà không ai được cảnh báo.
  file: `apps/agent/agent/lib/builder-delegation.ts:3`
  severity: medium
  Đề xuất: known-limits

- **Bài mang nhãn "chiều đỏ" của khong-quyen chạy y hệt bài dương của co-quyen, không đổi chiều nào**
  Người dùng thấy gì: Hồ sơ nghiệm thu có thể ghi số lượng phép thử cho nhánh này cao hơn thực tế, khiến người duyệt Cổng Bằng chứng tưởng nhánh được kiểm tra kỹ hơn mức nó thực sự được kiểm tra.
  file: `apps/agent/test/tran-uy-thac.spec.ts:118`
  severity: low
  Đề xuất: known-limits

- **Trần một-lần khóa theo callId do model sinh, trên state bền — một step chạy lại trong cùng lượt sẽ giết cả lượt**
  Người dùng thấy gì: Nếu một bước xử lý bị gián đoạn và hệ thống tự chạy lại trong cùng lượt, người dùng có thể thấy toàn bộ cuộc trò chuyện báo lỗi dù họ không hề gọi lại thao tác đó, kể cả ở những lượt trò chuyện thông thường không liên quan tới việc tạo trợ lý.
  file: `apps/agent/agent/lib/builder-delegation.ts:36`
  severity: medium
  Đề xuất: new-contract

- **Guard so chuỗi 'subagent-call'/'agent_builder' qua kiểu tự nới rộng — bản nâng eve có thể tắt trần mà không lỗi biên dịch**
  Người dùng thấy gì: Nếu thư viện eve đổi tên nhãn nội bộ ở một bản cập nhật sau này, cơ chế chặn gọi lặp có thể tắt hoàn toàn mà không có lỗi hay cảnh báo nào, và người dùng có thể gặp lại lỗi vòng lặp cũ.
  file: `apps/agent/agent/lib/builder-delegation.ts:30`
  severity: medium
  Đề xuất: known-limits

- **Fixture VIẾT TAY đúng khuôn bên đọc — sự kiện actions.requested không round-trip qua khuôn thật của eve**
  Người dùng thấy gì: Bộ kiểm thử có thể báo tính năng hoạt động đúng trong khi trên môi trường thật, dữ liệu từ thư viện eve có hình dạng khác khiến cơ chế chặn gọi lặp không chạy như mong đợi.
  file: `apps/agent/test/tran-uy-thac.spec.ts:16`
  severity: high
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).