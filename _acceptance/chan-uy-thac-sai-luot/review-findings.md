## Trong hợp đồng

### Hình dạng 3 — Assert "chuỗi có mặt" cho lời hứa "lớp trong còn chốt" (dòng import là đủ để xanh)
- file: `apps/agent/test/chan-uy-thac.spec.ts:130`
- severity: high
- AC: AC-3
- source: measurement

Vế (b) của AC-3 hứa mỗi tool VẪN GỌI `requireBuilderAttribute` trong `execute`. Phép đo lại là `expect(readFileSync(TOOL_DIR/<name>.ts)).toContain("requireBuilderAttribute")` (dòng 130-133). Chuỗi ấy đã có mặt trong chính dòng `import { requireBuilderAttribute } from "../../../lib/session-purpose";` ở đầu cả ba tool, nên xoá toàn bộ call site trong `execute` mà giữ import vẫn cho màu xanh — đúng cửa hở im lặng mà AC-3 (contract.md dòng 82-85) nói mình đang chặn. Cùng bộ lọc chuỗi này còn dùng làm dân số đĩa ở dòng 112-116, nên một tool chỉ import mà không gọi vẫn được đếm là "có chốt". Test bên cạnh (dòng 129) đã import thật module và soi `mod.default.approval` — vế lớp trong hoàn toàn có thể đo cùng cách đó.

Rationale: AC-3 đòi đếm trên đĩa số tool THỰC SỰ GỌI requireBuilderAttribute; phép đo hiện tại chỉ soi chuỗi xuất hiện trong file (kể cả dòng import), nên xoá lời gọi thật mà giữ import vẫn qua — đúng cửa hở mà AC-3 nói phải chặn.

### Hình dạng 3 — Đo chuỗi trong mã nguồn thay vì quan hệ gọi, và cửa sổ "thân hàm" cắt sai
- file: `apps/agent/test/chan-uy-thac.spec.ts:218`
- severity: medium
- AC: AC-9
- source: measurement

Test "luot thu hoi duoc noi vao dung cua vao cua lich dispatch" đọc text `custom-agent-dispatch.ts`, `src.slice(src.indexOf("export async function pendingBuilderSubmissionIds"))` rồi `than.slice(0, than.indexOf("}"))` và `toContain("recoverStalledBuilderTurns")`. Hai vấn đề nhìn thấy trực tiếp: (a) đây là grep chuỗi, không phải quan hệ gọi — hàm không hề được chạy, một `recoverStalledBuilderTurns` chết cũng qua; (b) `than.indexOf("}")` KHÔNG phải cuối thân hàm: dấu `}` đầu tiên sau tên hàm nằm trong object literal lồng của Prisma (`OR: [{ sessionId: null }, ...]`, custom-agent-dispatch.ts), nên cửa sổ chỉ là ~8 dòng đầu. Test xanh hiện nay chỉ vì lời gọi tình cờ đứng ở dòng 2 của thân hàm; chuyển lời gọi xuống sau `findMany` (vẫn đúng) là đỏ giả, còn phần lớn thân hàm thật thì không được soi.

Rationale: AC-9 vế agent đòi lượt thu hồi "có mặt ở đúng cửa vào của lịch dispatch"; phép đo hiện tại là grep chuỗi trên văn bản (không chạy hàm, không xét quan hệ gọi thật) và còn cắt sai vùng thân hàm, nên không chứng minh được đúng điều AC-9 yêu cầu.

### Hình dạng 4 — Ma trận AC-4 không ghim thông điệp từ chối
- file: `apps/agent/test/chan-uy-thac.spec.ts:66`
- severity: low
- AC: AC-4
- source: measurement

Test "ma tran toan phan purpose nhan commandType" (dòng 66-77) chỉ assert giá trị boolean của `builderTurnAuthorized`, không hề chạm `builderTurnApproval` hay `BUILDER_DENIED_REASON`. AC-4 (contract.md) và E4 (evals.yaml dòng 74+) đòi "Moi to hop TRU (builder + CREATE_AGENT) deu phai TU CHOI, KEM DUNG HANG GHIM". Hàng ghim chỉ được kiểm đúng một ca ở test E2 (`commandType: "CHAT"`); năm tổ hợp còn lại — đặc biệt `team-agent`, ca mà E4 nêu đích danh là lỗ phản biện bắt được — không phân biệt được "bị policy từ chối kèm lời giải" với "rơi xuống `requireBuilderAttribute` và ném Error", vì `builderTurnAuthorized` trả false ở cả hai đường.

Rationale: AC-4 nêu rõ mọi tổ hợp bị từ chối phải "cùng chuỗi lý do ghim"; phép đo ma trận chỉ chấm giá trị đúng/sai của việc cho phép, không chấm chuỗi lý do cho 5/6 tổ hợp, nên không đo đủ điều AC-4 hứa.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **recoverStalledBuilderTurns thu hồi nhầm submission cũ, nhả khoá lượt đang chạy**
  Người dùng thấy gì: Một tin nhắn cũ trong cuộc trò chuyện đã được trả lời xong có thể tự nhiên đổi thành trạng thái lỗi "chưa hoàn thành", và tin nhắn đang được xử lý ngay lúc đó có thể bị ngắt ngang giữa chừng.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: high
  Đề xuất: new-contract

- **Nhận vơ (claim) không lặp lại vị từ quá hạn trong giao dịch — lệch pattern của chính file**
  Người dùng thấy gì: Trong một số thời điểm trùng hợp hiếm gặp, một cuộc trò chuyện đang diễn ra bình thường có thể bị đánh dấu nhầm là lỗi.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: medium
  Đề xuất: new-contract

- **docs/agent.md không cập nhật trong khi diff đổi đúng hai bất biến nó khai**
  Người dùng thấy gì: Tài liệu mô tả cách tính năng này hoạt động chưa được cập nhật theo đúng thay đổi vừa làm, nên người đọc tài liệu sau này có thể hiểu sai hành vi hiện tại.
  file: `docs/agent.md`
  severity: medium
  Đề xuất: known-limits

- **recoverStalledBuilderTurns đánh dấu FAILED nhầm submission cũ đã xong, và nhả continuationToken khi lượt hiện tại vẫn đang chạy**
  Người dùng thấy gì: Một tin nhắn cũ đã được trả lời xong có thể tự nhiên hiện lỗi giả, và cuộc trò chuyện đang chạy ngay lúc đó có thể bị hai tin nhắn chồng lên nhau xử lý cùng lúc, gây kết quả lộn xộn.
  file: `apps/agent/agent/lib/custom-agent-dispatch.ts`
  severity: high
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
