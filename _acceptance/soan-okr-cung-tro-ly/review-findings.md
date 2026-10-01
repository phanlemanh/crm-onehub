# Review findings: soan-okr-cung-tro-ly (round 1)

## Trong hợp đồng

- **Shape 2 (fixture written by hand to match what the reader expects): E20(a) never runs classify. The screen is fed a status of ended or error that the test typed in**
  file: `apps/app/test/soan-okr-hong.dom.tsx:38`
  severity: medium
  AC: AC-12
  source: measurement
  detail: E20(a) in evals.yaml promises that when the fake agent dies 5 s in, classify returns ended, and the screen then shows 'Trợ lý OKR chưa trả lời được' with Thử lại. The test harness apps/app/test/khung-soan-okr.tsx:200-206 mocks loadThread in @/lib/agent-session so it returns threadGia exactly as the test set it. The test at line 38 calls datThread({ status: "ended", ... }) directly, and the test at line 53 sets datAgent({ status: "error", error: new Error("session ended") }) by hand. Neither path takes an event stream from a dead agent and runs it through classify. The status is written already in the form the screen reads. The integration file in the same cmd (apps/agent-okr/test/hong-chen.integration.spec.ts) only covers (c) and (d), and agent-session.spec.ts, which does call classify, is not in the soan_hong_chen cmd. So the link from 'agent dies at 5 s' to 'classify → ended' is never measured. If classify mislabels that stream (for example as working), E20 stays green.
  rationale phân loại: AC-12 có Given «tác nhân chết im sau 5 giây» rồi Then màn hiện «chưa trả lời được» và Thử lại; phép đo gõ tay trạng thái ended/error nên mắt xích từ tác nhân chết đến classify chưa được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tập trạng thái «đã quyết»/«đã nhận» của dòng nháp được định nghĩa lại ở ba nơi, không bám vào danh mục gốc**
  Người dùng thấy gì: Hôm nay ba nơi đang hiểu «dòng đã quyết» giống nhau nên không sai gì. Nếu sau này thêm một trạng thái quyết mới mà sót một nơi, bảng nháp có thể hiện dòng là đã quyết trong khi Trợ lý vẫn được ghi đè nó.
  file: `apps/api/src/okr/soan-ban-nhap.ts`
  severity: medium
  Đề xuất: known-limits

- **Biến mới OKR_AGENT_PORT chưa có trong .env.example**
  Người dùng thấy gì: Người tự dựng hệ thống đọc tệp mẫu cấu hình sẽ không biết có thể đổi cổng của Trợ lý OKR. Mặc định vẫn chạy bình thường.
  file: `apps/agent-okr/scripts/start.ts`
  severity: low
  Đề xuất: known-limits

- **Mô tả công cụ nop_ban_nhap ghi cứng «2–4», lặp lại trần BAN_NHAP_TRAN**
  Người dùng thấy gì: Nếu sau này đổi số Mục tiêu hay KR tối đa mà quên sửa lời dặn, Trợ lý sẽ nộp số lượng bị bộ kiểm từ chối và người dùng thấy bản nháp thiếu dòng.
  file: `apps/agent-okr/agent/tools/nop_ban_nhap.ts`
  severity: low
  Đề xuất: known-limits

- **The retry button hides errors from soanMo, so a failed retry looks like nothing happened**
  Người dùng thấy gì: Khi bấm Thử lại sau lúc chu kỳ đã qua giai đoạn lập kế hoạch, hoặc cuộc soạn vừa bị đóng, nút chỉ quay rồi thôi và vẫn hiện thông báo chung chung, không nói vì sao. Bấm lại thì lặp y như cũ.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **A turn is counted before the agent is reached, so an agent outage uses up the session's 12-turn cap**
  Người dùng thấy gì: Khi Trợ lý tạm thời không liên lạc được, mỗi lần thử lại vẫn bị tính một lượt trong 12 lượt của cuộc soạn. Sập vài phút có thể làm hết lượt và khoá ô nhập dù Trợ lý chưa trả lời lần nào.
  file: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 1 (measures the instruction, not the output): the cuonRieng test promises 'hai cột tự cuộn' but only checks classes on the sheet body**
  Người dùng thấy gì: Kiểm tra tự động cho việc hai cột tự cuộn chỉ xem lớp trang trí. Nếu hai cột không cuộn thật, người dùng trên màn thấp có thể thấy nội dung bị cắt mà không có kiểm tra nào báo.
  file: `packages/ui/test/sheet-khung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shapes 2 and 3 (hand-written fixture plus a 'string is present' check): 'KyTruoc của db đi thẳng vào tomGonKy' does not read from the db and only checks that the string KR appears**
  Người dùng thấy gì: Một kiểm tra phụ chỉ xem chữ «KR» có mặt, nên nếu phần đọc kỳ trước đổi dạng dữ liệu mà vẫn đúng kiểu thì kiểm tra này không bắt được. Tóm tắt kỳ trước trong gói có thể lệch mà không ai thấy.
  file: `packages/validation/test/okr-goi-soan-khop.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
