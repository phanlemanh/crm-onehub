## Trong hợp đồng

- **Hình dạng 2 — bản đột biến `than-hook-rong` VIẾT TAY, không dẫn từ văn bản thật đọc từ đĩa**
  file: `_acceptance/tran-uy-thac-chiu-chay-lai/rang/hook-chet.mjs:33`
  severity: high
  AC: AC-9
  detail: Hai hình dạng `bo-record-va-update` (dòng 49-56) và `bo-update` (dòng 58-61) nhận `nguon` — văn bản thật đọc từ `apps/agent/agent/hooks/builder-delegation.ts` ở dòng 70 — rồi biến đổi bằng regex. Hình dạng thứ nhất thì không: `cam: () => [...].join("\n")` (dòng 33-45) BỎ HẲN tham số `nguon` và trả về một thân hook 10 dòng chép tay. Hệ quả cụ thể: chốt chống lạc hậu ở dòng 149 `if (banDotBien === nguon) chet(...)` không bao giờ nổ được cho hình dạng này, vì chuỗi chép tay không bao giờ bằng `nguon` kể cả khi hook thật đã đổi hoàn toàn cấu trúc (ví dụ hook thật chuyển sang `defineHook({ events: { "actions.requested": handler } })` với handler tách file). Lúc đó bản đột biến vẫn nạp được, bộ đo replica vẫn đỏ, răng vẫn in "hình dang than-hook-rong -> bi bat" và E9 vẫn xanh — trong khi cái bị đột biến là một bản mã không còn tồn tại trong cây. Đây đúng điều E9 sàn khuôn (a) cấm: "Ban dot bien sinh tu VAN BAN THAT doc tu dia, KHONG phai ba ham chep tay trong bo do. Chep tay la hang-dung."
  rationale: AC-9 đòi bộ đo đột biến phải đo đúng ba hình dạng "đã đo tại 83501f3" (tức đột biến trên văn bản thật); một hình dạng chép tay không mutate mã nguồn thật khiến kết quả ĐỎ của AC-9 cho hình dạng đó không còn chứng minh được điều AC-9 yêu cầu.
  source: measurement

- **Hình dạng 2 — trạng thái "đã ghi" là object literal viết tay đúng khuôn bên đọc, không round-trip qua `recordBuilderDelegation`**
  file: `apps/agent/test/tran-uy-thac.spec.ts:26`
  severity: medium
  AC: AC-1
  detail: "`const DA_GHI: TrangThai = { turnId: \"turn-1\", stepIndex: 2, sequence: 0 }`" (dòng 26) được nạp thẳng làm tham số `state` cho `recordBuilderDelegation` ở E1 (dòng 30, 37), E3 (dòng 59, 64), E4/`luot-moi` (dòng 148, 157), `lap-callid` (dòng 134, 141) và `mot-cau` (dòng 231) — tức khuôn mà BÊN ĐỌC mong đợi, viết tay, không lấy từ giá trị trả về của chính bên ghi. Đường round-trip có sẵn và đã được dùng đúng ở chỗ khác: `apps/agent/test/custom-agent-runtime.spec.ts` lấy `first = recordBuilderDelegation(EMPTY_BUILDER_DELEGATION, duLieu(...))` rồi mới nạp `first` vào lượt sau, và trong cùng file này `lan-dau` (dòng 81-84) cùng `khong-xoa-slot` (dòng 253-261) cũng làm vậy. Hệ quả đo lường cụ thể ở E1: sàn khuôn của nó ghi "hai lan phai co callId KHAC NHAU trong fixture. Fixture dung lai dung callId khong do duoc gi", nhưng với `DA_GHI` thì cả fixture chỉ có ĐÚNG MỘT callId (`call-b` ở dòng 30) — lần uỷ thác thứ nhất không hề tồn tại như một lời gọi, nên điều kiện "hai callId khác nhau" không được thoả mà bài đo vẫn xanh.
  rationale: AC-1 quy định rõ trong Sàn khuôn — "callId của hai lần phải khác nhau trong fixture; fixture dùng lại đúng callId không đo được gì" — dùng state DA_GHI viết tay khiến fixture chỉ còn một callId thật, đúng điều Sàn khuôn của AC-1 cấm.
  source: measurement

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **docs/agent.md không theo kịp vòng 2 — vẫn tả trần theo callId, không nói toạ độ sự kiện, không nói khoá state đã bump v2**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về cách giới hạn này hoạt động chưa được cập nhật theo cách làm mới, nên người xử lý sự cố sau này có thể mất thêm thời gian hiểu đúng nguyên nhân khi có lỗi, dù bản thân tính năng vẫn chạy đúng.
  file: `docs/agent.md`
  severity: medium
  Đề xuất: known-limits

- **Schema zod khai ra nhưng KHÔNG bao giờ parse — lệch pattern schema+parse của kho, và biên rehydrate state vẫn không ai kiểm**
  Người dùng thấy gì: Trạng thái nội bộ của giới hạn uỷ thác không được kiểm tra hình dạng dữ liệu khi đọc lại từ bộ nhớ bền, nên nếu dữ liệu cũ có định dạng khác, hệ thống có thể âm thầm xử lý sai thay vì báo lỗi rõ ràng, gây khó khăn khi gỡ sự cố.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: medium
  Đề xuất: known-limits

- **defineState trả về CHÍNH object EMPTY_BUILDER_DELEGATION làm giá trị khởi tạo, không phải object mới mỗi lần**
  Người dùng thấy gì: Giá trị khởi tạo mặc định của giới hạn uỷ thác đang dùng chung một đối tượng cho mọi phiên làm việc; nếu một đoạn mã sau này lỡ sửa trực tiếp giá trị đó, các phiên khác có thể bị ảnh hưởng chéo nhau theo cách rất khó phát hiện ra nguyên nhân.
  file: `apps/agent/agent/lib/builder-delegation-state.ts`
  severity: low
  Đề xuất: known-limits

- **mock.module chạy lúc import ở helper test — mock và biến toàn cục kho/nhatKy rò sang mọi spec nạp sau trong cùng process**
  Người dùng thấy gì: Cách dựng dữ liệu giả cho phần kiểm thử này có thể ảnh hưởng đến kết quả của các bài kiểm thử khác chạy sau nó trong cùng một lượt kiểm thử toàn bộ, khiến một lỗi thật có nguy cơ bị bỏ sót hoặc báo nhầm chỗ khác.
  file: `apps/agent/test/tran-uy-thac/chuoi-cuong-che.ts`
  severity: low
  Đề xuất: known-limits

- **Trần uỷ thác không còn chặn hai lời gọi agent_builder trong CÙNG một step khi eve phát chúng thành hai sự kiện riêng**
  Người dùng thấy gì: Nếu trợ lý gọi công cụ tạo agent con hai lần thật sự khác nhau nhưng hệ thống phát ra thành hai thông báo riêng cùng một bước xử lý, giới hạn "chỉ uỷ thác một lần mỗi lượt" có thể không nhận ra lần gọi thứ hai, khiến việc tạo agent con xảy ra nhiều hơn số lần cho phép trong một số tình huống hiếm.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: high
  Đề xuất: new-contract

- **`sequence` không thêm thông tin phân biệt: trong một lượt nó là hằng và suy được từ turnId, nên vài eval đang đo một hình dạng sự kiện eve không bao giờ phát**
  Người dùng thấy gì: Một phần kịch bản kiểm thử cho giới hạn uỷ thác đang mô phỏng tình huống mà hệ thống thật có thể không bao giờ tạo ra, nên kết quả "đạt" ở phần đó không chắc chứng minh giới hạn hoạt động đúng trong tình huống tương ứng ngoài thực tế.
  file: `apps/agent/agent/lib/builder-delegation.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/8 lỗi rơi vào file không bộ đo nào phủ (docs/agent.md, apps/agent/test/tran-uy-thac/chuoi-cuong-che.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
