# Review findings: soan-okr-cung-tro-ly (round 2)

## Trong hợp đồng

- **Hình dạng 2 — Fixture VIẾT TAY đúng khuôn bên đọc: luồng «tác nhân chết» E20(a) là chuỗi sự kiện tự bịa, kết bằng session.failed với mã AGENT_DIED mà eve không có**
  file: `apps/app/test/soan-okr-hong.dom.tsx:71`
  severity: medium
  AC: AC-12
  source: measurement
  detail: Bản vá E20(a) (1a070cb7) cho luồng đi qua loadThread và classify thật, nhưng sự kiện đưa vào classify được viết tay trong luongChetSau5Giay (dòng 71–91): step.failed → turn.failed → session.failed, mang { code: "AGENT_DIED", message: "agent process exited" }. Trong apps/agent-okr/node_modules/eve không có mã AGENT_DIED; danh sách mã lỗi của eve chỉ có SESSION_FAILED, MODEL_CALL_FAILED, TIMEOUT, TRANSPORT… Chuỗi này dựng đúng nhánh mà classify (apps/app/lib/agent-session.ts) đọc: `last.type === "session.failed"` → "ended". Vì vậy hai lời gọi expect(daPhanLoai.at(-1)).toBe("ended") ở dòng 102 và 121 chỉ chứng rằng classify nhận ra session.failed, tức là đúng thứ người viết fixture đã đặt vào. Phép thử không chứng rằng khi tiến trình tác nhân chết thật thì eve phát ra session.failed. Nếu tác nhân chết mà luồng chỉ im (không có sự kiện kết thúc), classify sẽ trả "working" cho tới ABANDONED_AFTER_MS = 90 s, ngược với lời hứa AC-12(a) «chết sau 5 s → classify trả ended». Mốc 5 giây (CHET_SAU_MS) trong fixture cũng không góp phần vào kết quả: với session.failed, classify trả ended bất kể thời gian. Bài tích hợp apps/agent-okr/test/hong-chen.integration.spec.ts, nơi hợp đồng E20 đặt ca (a), không có ca nào giết tác nhân hay gọi classify (grep classify/session.failed/chet không ra gì). Không có phép đo nào lấy luồng từ eve thật (bên ghi) rồi đưa vào classify (bên đọc).
  rationale phân loại: AC-12 hứa phiên mà tác nhân chết im sau 5 giây phải hiện «Trợ lý OKR chưa trả lời được» kèm Thử lại; bằng chứng hiện có dùng chuỗi sự kiện tự viết chứ không phải khi tác nhân chết thật, nên chưa chứng minh được lời hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new retry after a port clash almost never runs: the 'eve exited early' branch catches it first**
  Người dùng thấy gì: Hiếm khi, khi cổng máy bị chiếm đúng lúc dựng môi trường thử, bài đo sẽ báo hỏng ngay thay vì tự thử lại; chạy lại là qua. Người dùng cuối không bị ảnh hưởng.
  file: `apps/agent-okr/test/support/khoi-dong.ts`
  severity: medium
  Đề xuất: known-limits

- **The fix that put the bridge-session shape in one place (E29) missed the eval harness: it still hand-writes the claim type and the issuer, audience and purpose strings**
  Người dùng thấy gì: Nếu sau này đổi thông số của thẻ phiên soạn, bộ đo chất lượng Trợ lý sẽ báo lỗi giả như thể Trợ lý hỏng, dù người dùng không bị ảnh hưởng gì.
  file: `apps/agent-okr/evals/okr-soan/the.ts`
  severity: low
  Đề xuất: known-limits

- **The new goiSoan config uses a named PHAN_TRAM for one field and a bare 100 for the next**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng; chỉ là cách viết hai con số cấu hình chưa đồng nhất, người sửa sau có thể hiểu nhầm hai số có liên quan.
  file: `packages/db/src/okr-tro-ly-danh-muc.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — Fixture VIẾT TAY thay cho vòng ghi-rồi-đọc: «thuộc tính cửa ghi đọc lại nguyên vẹn» không gọi bên ghi**
  Người dùng thấy gì: Chưa có phép thử nào chứng minh tên và email người soạn đi nguyên vẹn qua thẻ phiên tới Trợ lý; nếu hỏng, Trợ lý có thể nhận thiếu thông tin người dùng mà bài thử vẫn xanh.
  file: `packages/validation/test/okr-phien-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — Đo CHỈ DẪN thay vì ĐẦU RA: «vai lấy lại từ hàng member, không tin thẻ» chỉ kiểm khuôn bỏ khoá vai**
  Người dùng thấy gì: Chưa có bài thử nào cho thấy khi thẻ phiên ghi một vai khác với vai thật của người dùng thì hệ thống vẫn lấy vai thật; hiện thẻ do chính ứng dụng cấp nên rủi ro thấp.
  file: `packages/validation/test/okr-phien-soan.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — Assert «có mặt» trong khi lời hứa là QUAN HỆ: «có .eve riêng» chỉ kiểm thư mục tồn tại, trạng thái cũ còn sót cũng làm xanh**
  Người dùng thấy gì: Một bài thử kiểm app Trợ lý OKR có vùng làm việc riêng gần như không bao giờ đỏ sau lần chạy đầu, nên nếu vùng này hỏng thật thì bài thử có thể không báo; người dùng cuối không bị ảnh hưởng.
  file: `apps/agent-okr/test/app-rieng.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Biến mới OKR_AGENT_PORT chưa có trong .env.example** (r1)
  Người dùng thấy gì: Người tự dựng hệ thống đọc tệp mẫu cấu hình sẽ không biết có thể đổi cổng của Trợ lý OKR. Mặc định vẫn chạy bình thường.
  file: `apps/agent-okr/scripts/start.ts`
  severity: low
  Đề xuất: known-limits

- **The retry button hides errors from soanMo, so a failed retry looks like nothing happened** (r1)
  Người dùng thấy gì: Khi bấm Thử lại sau lúc chu kỳ đã qua giai đoạn lập kế hoạch, hoặc cuộc soạn vừa bị đóng, nút chỉ quay rồi thôi và vẫn hiện thông báo chung chung, không nói vì sao. Bấm lại thì lặp y như cũ.
  file: `apps/app/app/(app)/[slug]/okr/soan/dung-cuoc-soan.ts`
  severity: medium
  Đề xuất: new-contract

- **A turn is counted before the agent is reached, so an agent outage uses up the session's 12-turn cap** (r1)
  Người dùng thấy gì: Khi Trợ lý tạm thời không liên lạc được, mỗi lần thử lại vẫn bị tính một lượt trong 12 lượt của cuộc soạn. Sập vài phút có thể làm hết lượt và khoá ô nhập dù Trợ lý chưa trả lời lần nào.
  file: `apps/app/app/eve/agents/okr/eve/v1/[...path]/route.ts`
  severity: medium
  Đề xuất: new-contract

- **Shape 1 (measures the instruction, not the output): the cuonRieng test promises 'hai cột tự cuộn' but only checks classes on the sheet body** (r1)
  Người dùng thấy gì: Kiểm tra tự động cho việc hai cột tự cuộn chỉ xem lớp trang trí. Nếu hai cột không cuộn thật, người dùng trên màn thấp có thể thấy nội dung bị cắt mà không có kiểm tra nào báo.
  file: `packages/ui/test/sheet-khung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Shapes 2 and 3 (hand-written fixture plus a 'string is present' check): 'KyTruoc của db đi thẳng vào tomGonKy' does not read from the db and only checks that the string KR appears** (r1)
  Người dùng thấy gì: Một kiểm tra phụ chỉ xem chữ «KR» có mặt, nên nếu phần đọc kỳ trước đổi dạng dữ liệu mà vẫn đúng kiểu thì kiểm tra này không bắt được. Tóm tắt kỳ trước trong gói có thể lệch mà không ai thấy.
  file: `packages/validation/test/okr-goi-soan-khop.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
