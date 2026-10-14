# Review findings: tac-nhan-va (vòng 3)

## Trong hợp đồng

- **Ở locale vi, nhãn bước trong hội thoại dựng vẫn ra tiếng Anh cứng vì builderStepLabel ưu tiên INPUT_LABELS, và bài kiểm còn khoá chữ tiếng Anh đó**
  AC: AC-2
  file: `apps/app/lib/nhan-buoc.ts:26`
  severity: medium
  source: conventions
  detail: `builderStepLabel` trả `inputLabel(item)` trước rồi mới xét bảng chữ. Mà `inputLabel` dựng chữ từ các chuỗi tiếng Anh viết cứng trong `apps/app/lib/agent-tool-display.ts` («Writing …», «Wrote instructions», «Saved draft · X», «Named this chat · X»), không qua module `messages/*` theo locale. Thêm nữa, công cụ không có trong `t.tab.buoc` thì nhận `item.label` thô ở cả locale vi. Kết quả: các bước `write_agent_file`, `save_agent_draft`, `set_chat_title` của bộ dựng hiện chữ tiếng Anh trên màn tiếng Việt. Điều này trái nếp chữ giao diện nằm trong bảng `messages` theo locale, và trái chính AC-2 («nhãn bước công cụ trong hội thoại dựng là chữ tiếng Việt của bảng bước»). `apps/app/test/tac-nhan-va.dom.tsx:447` còn khẳng định `builderStepLabel(ngoaiBang, vi, "vi")` bằng «Saved draft», và với `set_chat_title` chỉ kiểm `toContain("Báo cáo tuần")`, nên chữ tiếng Anh lọt qua mà bài kiểm vẫn xanh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ dựng mới đọc pendingInputRequest bằng schema .catch(null), nên dữ liệu hỏng bị coi như không có câu hỏi đang chờ và câu hỏi cũ hơn được ghi đè lên**
  Người dùng thấy gì: Nếu dữ liệu câu hỏi đang chờ của một cuộc trò chuyện dựng bị hỏng, hệ thống coi như không có câu nào đang chờ và có thể ghi đè bằng một câu hỏi cũ hơn, không báo lỗi. Trường hợp này hiếm vì nó cần dữ liệu đã hỏng sẵn.
  file: `apps/agent/agent/lib/builder-input.ts`
  severity: medium
  Đề xuất: known-limits

- **Vừa thêm helper traBangChu mà hai chỗ khác trong cùng diff lại tự viết lại logic Object.hasOwn kèm ép kiểu keyof**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là mã có hai cách tra bảng chữ giống nhau, gây phiền cho người bảo trì về sau.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: low
  Đề xuất: wont-fix

- **Trạng thái rỗng của danh sách thoả thuận trên điện thoại dựng tay bằng <p> thay vì dùng thành phần Empty có sẵn**
  Người dùng thấy gì: Khi không có thoả thuận nào, màn điện thoại vẫn hiện dòng thông báo nhưng kiểu dáng hơi khác các màn trống khác trong app.
  file: `apps/app/components/agent-builder/deal-list-result.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét cả LỚP khẳng định nhưng thước chỉ thấy dòng chứa `expect(`, nên khẳng định viết nhiều dòng thành vô hình**
  Người dùng thấy gì: Công cụ kiểm tra việc không ai lặng lẽ xoá hay sửa bài kiểm cũ có thể bỏ sót một số bài kiểm viết nhiều dòng. Chưa có bài kiểm nào được chỉ ra là đã bị sửa.
  file: `_acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2: fixture bài nộp viết tay theo khuôn bên đọc, mà khuôn đọc có `.catch(null)`, nên không round-trip qua đầu ra API**
  Người dùng thấy gì: Bài kiểm câu báo lỗi gửi hỏng dùng dữ liệu tự dựng chứ chưa lấy từ máy chủ thật. Nếu máy chủ quên trả mã lỗi, màn sẽ hiện câu chung thay vì câu theo mã và bài kiểm vẫn không báo.
  file: `apps/app/test/tac-nhan-va.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: khẳng định «ô soạn thường vắng» đứng một mình, không có đối chứng dương**
  Người dùng thấy gì: Phép đo xác nhận ô soạn tin biến mất khi có câu hỏi chờ chưa được thử ở lúc ô soạn đang hiện. Nếu nhãn ô soạn đổi, phép đo vẫn báo đạt dù ô soạn còn hiện cạnh ô câu hỏi.
  file: `_acceptance/tac-nhan-va/rang/khu-hoi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: E8 hứa dòng lỗi === chữ theo mã, nhưng test chỉ kiểm chuỗi có mặt trong toàn khung**
  Người dùng thấy gì: Bài kiểm chưa chặt: nếu màn hiện thêm một câu báo lỗi thừa cùng câu đúng thì bài kiểm vẫn qua.
  file: `apps/app/test/tac-nhan-va.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: AC-2 hứa «lý do hỏng theo mã lỗi», nhưng fixture quét lớp không có mã lỗi nào, và màn chỉ đo đúng một điểm**
  Người dùng thấy gì: Lý do một lượt chạy hỏng mới được kiểm kỹ ở một mã lỗi. Các mã còn lại có thể hiện sai chữ mà bài kiểm chưa phát hiện.
  file: `apps/app/test/tac-nhan-va.dom.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
