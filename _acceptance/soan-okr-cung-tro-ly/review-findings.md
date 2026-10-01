# Review findings — soan-okr-cung-tro-ly (round 3)

## Trong hợp đồng

- **Hình dạng 5 (tuyên quét lớp, chỉ có điểm-case): bài 390 px nói soi «thanh tab và trò chuyện» nhưng chỉ ghim số phần tử > 2, nên thanh tab có thể vắng mà bài vẫn xanh**
  AC: AC-7
  file: `apps/app/test/soan-okr.dom.tsx:1223`
  severity: medium
  source: measurement
  detail: Bài «ngăn soạn ở 390 px» gom tập phần tử cần soi gồm `[data-khong="hep"] [role="tab"]` (2 tab) và `[data-goi-y]`. Bản mẫu MO_DAU trong khung-soan-okr.tsx:360 có 2 câu hỏi × 2 gợi ý = 4 chip. Bài chỉ khẳng định `expect(goc.length).toBeGreaterThan(2)`, mà riêng 4 chip đã vượt ngưỡng này. Nếu màn không vào bố cục hẹp (bộ giả matchMedia `khoHep(true)` hết tác dụng, hoặc `SOAN_UI.khoHep` / `useKhoHep` đổi), màn vẽ bố cục rộng, không có `[data-khong="hep"]`, không có tab nào. Khi đó bài chỉ soi 4 chip trên bố cục rộng thu ở 390 px và vẫn xanh, dù câu báo đỏ TRAN_NGAN_HEP gọi đúng tên lỗi cần bắt là «tab Ban nhap bi cat». Bài không ghim đủ ma trận đã khai: không có `toHaveLength(6)`, và cũng không riêng khẳng định có đúng 2 tab. Đối lại, bài danh sách cuộc ngay dưới làm đúng: `expect(goc).toHaveLength(4)`.
  rationale: AC-7 đòi trạng thái «khổ hẹp hai tab» ở 390 hiện đúng và không tràn ngang; bài kiểm duy nhất cho điều đó không ghim được hai tab nên bằng chứng cho AC-7 rỗng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The S4 suite now runs as four lists of named packages, so a new workspace drops out of it without anyone noticing**
  Người dùng thấy gì: Nếu sau này có thêm một phần mới của sản phẩm kèm bài kiểm tra, bước nghiệm thu có thể bỏ sót nó mà báo cáo vẫn ghi là đạt. Hôm nay chưa sót phần nào, nhưng không có gì canh để việc đó không xảy ra.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **The note for OKR_AI_GATEWAY_API_KEY in .env.example is now wrong: apps/agent-okr also reads it**
  Người dùng thấy gì: Người tự cài hệ thống đọc ghi chú về khoá này sẽ tưởng nó chỉ dùng cho góp ý và tóm tắt tuần, không biết nó còn gánh chi phí của cuộc soạn OKR cùng Trợ lý. Họ có thể đặt trần chi phí sai chỗ.
  file: `.env.example`
  severity: low
  Đề xuất: known-limits

- **The startup self-test computes the eve lock path itself instead of importing it, so the stale-lock check can pass without testing anything**
  Người dùng thấy gì: Nếu cách tạo khoá khởi động đổi sau này, bài thử kiểm tra việc dọn khoá cũ vẫn báo đạt dù việc dọn đã hỏng. Người dùng chỉ thấy hậu quả khi Trợ lý không khởi động được sau một lần tắt đột ngột.
  file: `apps/agent-okr/test/support/thu-khoi-dong.ts`
  severity: low
  Đề xuất: wont-fix

- **Phiên đo khởi động eve ở apps/agent mà không lấy khoá gốc, trong khi app-rieng nay giữ khoá apps/agent và cũng dựng eve ở đó, nên khoá không loại trừ được hai bên**
  Người dùng thấy gì: Khi hai phép đo cách ly dữ liệu và bộ kiểm toàn kho chạy cùng lúc, một trong hai có thể báo đỏ giả. Người ký có thể thấy màu đỏ mà sản phẩm không hề hỏng.
  file: `_acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 6 (đường dẫn hardcode ROOT): kịch bản bước 4 cd cứng vào worktree của tác giả**
  Người dùng thấy gì: Nếu chạy lại phép đo tải ở một bản chép khác của dự án, nó vẫn âm thầm đo bản cũ và báo số của bản đó. Vòng này số đo vẫn đúng cây.
  file: `_acceptance/soan-okr-cung-tro-ly/rang-tam-buoc4.sh.txt`
  severity: low
  Đề xuất: wont-fix

- **The fix that put the bridge-session shape in one place (E29) missed the eval harness: it still hand-writes the claim type and the issuer, audience and purpose strings (r2)**
  Người dùng thấy gì: Nếu sau này đổi thông số của thẻ phiên soạn, bộ đo chất lượng Trợ lý sẽ báo lỗi giả như thể Trợ lý hỏng, dù người dùng không bị ảnh hưởng gì.
  file: `apps/agent-okr/evals/okr-soan/the.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture VIẾT TAY thay cho vòng ghi-rồi-đọc: «thuộc tính cửa ghi đọc lại nguyên vẹn» không gọi bên ghi (r2)**
  Người dùng thấy gì: Chưa có phép thử nào chứng minh tên và email người soạn đi nguyên vẹn qua thẻ phiên tới Trợ lý; nếu hỏng, Trợ lý có thể nhận thiếu thông tin người dùng mà bài thử vẫn xanh.
  file: `packages/validation/test/okr-phien-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: «vai lấy lại từ hàng member, không tin thẻ» chỉ kiểm khuôn bỏ khoá vai (r2)**
  Người dùng thấy gì: Chưa có bài thử nào cho thấy khi thẻ phiên ghi một vai khác với vai thật của người dùng thì hệ thống vẫn lấy vai thật; hiện thẻ do chính ứng dụng cấp nên rủi ro thấp.
  file: `packages/validation/test/okr-phien-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Biến mới OKR_AGENT_PORT chưa có trong .env.example (r1)**
  Người dùng thấy gì: Người tự dựng hệ thống đọc tệp mẫu cấu hình sẽ không biết có thể đổi cổng của Trợ lý OKR. Mặc định vẫn chạy bình thường.
  file: `apps/agent-okr/scripts/start.ts`
  severity: low
  Đề xuất: known-limits

- **The retry button hides errors from soanMo, so a failed retry looks like nothing happened (r1)**
  Người dùng thấy gì: Khi bấm Thử lại sau lúc chu kỳ đã qua giai đoạn lập kế hoạch, hoặc cuộc soạn vừa bị đóng, nút chỉ quay rồi thôi và vẫn hiện thông báo chung chung, không nói vì sao. Bấm lại thì lặp y như cũ.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **A turn is counted before the agent is reached, so an agent outage uses up the session's 12-turn cap (r1)**
  Người dùng thấy gì: Khi Trợ lý tạm thời không liên lạc được, mỗi lần thử lại vẫn bị tính một lượt trong 12 lượt của cuộc soạn. Sập vài phút có thể làm hết lượt và khoá ô nhập dù Trợ lý chưa trả lời lần nào.
  file: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 1 (measures the instruction, not the output): the cuonRieng test promises 'hai cột tự cuộn' but only checks classes on the sheet body (r1)**
  Người dùng thấy gì: Kiểm tra tự động cho việc hai cột tự cuộn chỉ xem lớp trang trí. Nếu hai cột không cuộn thật, người dùng trên màn thấp có thể thấy nội dung bị cắt mà không có kiểm tra nào báo.
  file: `packages/ui/test/sheet-khung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shapes 2 and 3 (hand-written fixture plus a 'string is present' check): 'KyTruoc của db đi thẳng vào tomGonKy' does not read from the db and only checks that the string KR appears (r1)**
  Người dùng thấy gì: Một kiểm tra phụ chỉ xem chữ «KR» có mặt, nên nếu phần đọc kỳ trước đổi dạng dữ liệu mà vẫn đúng kiểu thì kiểm tra này không bắt được. Tóm tắt kỳ trước trong gói có thể lệch mà không ai thấy.
  file: `packages/validation/test/okr-goi-soan-khop.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/6 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml, _acceptance/tro-ly-okr-de-xuat/rang/phien-tro-ly.mjs, _acceptance/soan-okr-cung-tro-ly/rang-tam-buoc4.sh.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
