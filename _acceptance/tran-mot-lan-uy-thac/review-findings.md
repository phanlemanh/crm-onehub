## Trong hợp đồng

### Nhiều bài chiều đỏ không đổi thứ mà tên bài hứa sẽ đổi
- file: `apps/agent/test/tran-uy-thac.spec.ts:348`
- severity: low
- source: conventions
- AC: AC-9

Vài bài đặt tên là chiều đỏ (đột biến) nhưng thân bài không thực hiện đột biến đó, mà lặp lại y nguyên assert dương của bài khác:

- Dòng 348 `khong-loi-goi: chieu do — doi subagentName sang agent_builder thi chan`: thân bài bỏ qua hoàn toàn `hinhDang` (actions rỗng / subagent khác) dựng ở dòng 321-334, chỉ gọi hai `goiBuilder("call-1"/"call-2")`. Không có `subagentName` nào bị đổi.
- Dòng 118 `khong-quyen: chieu do — ... doi mot truong sang duoc phep, cung chan`: dựng `phien({}, true)` rồi assert ném — trùng khít kịch bản của dòng 131 `co-quyen: goi lan hai bi chan nhu cu`.
- Dòng 162, 217, 246 lặp lại cùng một assert "lời gọi thứ hai khác callId thì ném", đã có ở dòng 109.

Kết quả: assert "lời gọi thứ hai thì ném" xuất hiện sáu lần, còn AC-9 (sự kiện không mang lời gọi) chỉ được một bài dương canh, chiều đỏ của nó rỗng. Executor `tr_khong_co_loi_goi` trong `_acceptance/config.yaml` vì vậy khai nhiều răng hơn số răng thật.

Kịch bản hỏng: hook hồi quy ở nhánh sự kiện rỗng — ví dụ ai đó cho nó ném khi `actions` rỗng, hoặc bỏ nhánh reset `callIds` — thì bài chiều đỏ của `khong-loi-goi` vẫn xanh vì nó không hề chạy fixture rỗng; chỉ bài dương bắt được, và hồ sơ nghiệm thu vẫn ghi "đã có chiều đỏ" cho AC-9.

Rationale: AC-9 yêu cầu rõ chiều đỏ "đổi subagentName của lời gọi sang agent_builder cho cả hai lần → phải ném"; bài đo được đặt tên đúng chiều đỏ này lại không thực hiện phép đổi đó, nên yêu cầu của AC-9 chưa được đáp ứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Test đâm thẳng vào ruột build của eve, ngoài exports map**
  Người dùng thấy gì: Nếu thư viện agent nền được nâng cấp dù chỉ một bản vá nhỏ, các bài kiểm tra bảo vệ tính năng "chặn gọi lặp" có thể báo lỗi hàng loạt dù tính năng thực tế vẫn chạy đúng, làm chậm các đợt cập nhật khác của sản phẩm.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Trần một-lần khoá theo callId, trái khuyến nghị của eve và trái pattern anh em recordBuilderActions**
  Người dùng thấy gì: Nếu một bước xử lý bị gián đoạn và hệ thống tự thử lại trong cùng một lượt trò chuyện, sản phẩm có thể hiểu nhầm đó là yêu cầu tạo trợ lý lần thứ hai và làm cả lượt đó thất bại hẳn, dù người dùng chỉ yêu cầu một lần duy nhất.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: medium
  Đề xuất: known-limits

- **Once-per-turn gate keys on model-generated callId, so a re-run step wedges the turn**
  Người dùng thấy gì: Nếu một bước xử lý bị gián đoạn và hệ thống tự thử lại trong cùng một lượt trò chuyện, sản phẩm có thể hiểu nhầm đó là yêu cầu tạo trợ lý lần thứ hai và làm cả lượt đó thất bại hẳn, dù người dùng chỉ yêu cầu một lần duy nhất.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: state assert của khong-loi-goi trùng đúng giá trị mặc định, không phân biệt được hook chết**
  Người dùng thấy gì: Nếu tính năng chặn gọi lặp ngưng hoạt động do một lỗi ẩn ở nhánh không có lời gọi nào, bộ kiểm tra hiện tại có thể không phát hiện ra và vẫn báo mọi thứ ổn.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: lap-callid so trạng thái với chính nó, không ghim giá trị dương**
  Người dùng thấy gì: Nếu tính năng cho phép gọi lặp lại đúng một yêu cầu ngưng hoạt động âm thầm, bài kiểm tra tương ứng vẫn có thể báo xanh, khiến lỗi này khó bị phát hiện sớm.
  file: `apps/agent/test/tran-uy-thac.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
