## Trong hợp đồng

- **Chữ tiếng Anh hiển thị lọt qua răng chu-cung vì nó được suy ra, không phải chuỗi viết cứng**
  file: `packages/ui/src/components/ai-elements/conversation.tsx:128`
  severity: medium
  AC: AC-10
  `defaultFormatMessage` dựng nhãn vai bằng `message.role.charAt(0).toUpperCase() + message.role.slice(1)` rồi ghép vào `**${roleLabel}:** …`. Bản markdown người dùng tải về do đó mang "**User:**" / "**Assistant:**" — chữ tiếng Anh hiển thị, không đi qua `packages/ui/src/lib/messages.ts`, và `messages()` không có khoá nào cho nó.

  Đây là một lỗ đã chứng minh được ở đúng thước AC-10 mà vòng này bán là kín: `_acceptance/nen-chat-ai-elements/rang/chu-cung.mjs` quét *chuỗi có chữ* rồi trừ danh sách trắng, nên một nhãn suy ra từ `message.role` không có literal để nó nhìn thấy. Tệ hơn, chính danh sách trắng ghi lý do miễn cho `"user"` là "giá trị trường role của UIMessage … đi vào phép so sánh hoặc vào siêu dữ liệu, không đi vào câu chữ" (chu-cung.mjs:75-85) — mô tả đó nay sai với chính tệp nó đang gác. Cùng khối đó miễn `"conversation.md"` với ghi chú rất kỹ rằng nó CÓ hiện ra cho người dùng, nên chuẩn xét không nhất quán trong cùng một component.

  AC-5 của contract.md khai "không chuỗi nào là văn bản tiếng Anh viết cứng; mọi chuỗi hiển thị đọc từ useMessages()" — đúng theo nghĩa đen, nhưng răng chống lưng cho nó không bắt được hình dạng này. Mục `className` đè màu ở cùng tệp (`dark:bg-background`) đã khai ở Known limits nên không tính là finding.

  Rationale: Gate chu-cung không bắt được chuỗi tiếng Anh hiển thị này, đúng thất bại mà AC-10 mô tả — chuỗi tiếng Anh trong component nhưng lệnh cổng không đỏ.
  (source: conventions)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng biên nuốt lỗi phân tích: input/output của lượt did không bao giờ đỏ được**
  Người dùng thấy gì: Nếu dữ liệu của một bước xử lý bị hỏng hoặc sai định dạng, người dùng có thể thấy bước đó hiển thị như đã hoàn tất bình thường với kết quả trống, thay vì được báo lỗi rõ ràng.
  file: `packages/validation/src/agent-transcript.ts`
  severity: high
  Đề xuất: known-limits

- **Kế hoạch chuyển của area chat không được cập nhật, nay mô tả sai cây**
  Người dùng thấy gì: Tài liệu hướng dẫn các bước tiếp theo cho khu vực trò chuyện đang mô tả sai những gì thực sự còn lại trong mã nguồn, có thể khiến người làm việc sau đi theo hướng dẫn đã lỗi thời.
  file: `docs/plan/chat-ai-elements-rebuild.md`
  severity: high
  Đề xuất: known-limits

- **Cổng check-types bị gỡ khỏi bộ suite của cả kho, không chỉ vòng này**
  Người dùng thấy gì: Việc kiểm tra kiểu dữ liệu tự động đã bị bỏ khỏi bộ kiểm định chất lượng chung của cả hệ thống, không chỉ riêng tính năng này, nên lỗi kiểu dữ liệu ở các phần khác của sản phẩm có thể lọt qua ở những lần kiểm định sau.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Lớp chuyển ép sáu trạng thái công cụ xuống ba — lượt chờ duyệt đã trả lời hiện ra như đã xong**
  Người dùng thấy gì: Khi người dùng từ chối một yêu cầu thực hiện hành động, màn hình có thể hiển thị nhầm là hành động đó đã hoàn tất với kết quả trống, thay vì thể hiện đúng là đã bị từ chối.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: medium
  Đề xuất: known-limits

- **Răng mồ côi chỉ gieo hạt từ apps/**, bỏ qua chính packages/ui — báo đỏ đòi xoá code đang sống**
  Người dùng thấy gì: Công cụ tự động phát hiện tệp giao diện không còn dùng có thể báo nhầm là thừa và cần xoá cho một tệp thực ra vẫn đang chạy, nếu sau này mã nguồn được tổ chức lại theo một cách hợp lệ khác.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Miễn trừ hết hạn chỉ được in ra, không làm răng đỏ — có thể nuốt một mồ côi thật về sau**
  Người dùng thấy gì: Một ngoại lệ tạm thời cho một phần giao diện có thể tiếp tục được bỏ qua ở các lần kiểm tra sau ngay cả khi điều kiện áp dụng ngoại lệ đó đã hết hiệu lực, khiến vấn đề mà việc kiểm tra được dựng ra để chặn có thể quay lại mà không ai được cảnh báo dừng hẳn.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: medium
  Đề xuất: known-limits

- **ConversationDownload thu hồi blob URL ngay sau click và bỏ im mọi phần không phải text**
  Người dùng thấy gì: Nút tải hội thoại về máy hiện có thể không tải được gì trên một số trình duyệt, và với các hội thoại có bước suy nghĩ hay gọi công cụ, tệp tải về có thể thiếu gần hết nội dung mà không có cảnh báo nào.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — E8 chỉ chạy vế ĐỌC, không chạy round-trip rút-từ-writer mà chính nó đòi**
  Người dùng thấy gì: Một số phép đo tự động dùng để xác nhận tính năng đã làm đúng chỉ kiểm tra một nửa quy trình, nên một thay đổi làm sai nửa còn lại vẫn có thể được báo là đạt.
  file: `_acceptance/nen-chat-ai-elements/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert `toolName` có mặt trong khi lời hứa của chính bài kiểm là quan hệ output-vào ≡ output-ra**
  Người dùng thấy gì: Một bài kiểm tự động được đặt tên là xác nhận kết quả của một bước xử lý không bị mất, nhưng thực chất không kiểm tra điều đó, nên một lỗi làm mất kết quả vẫn có thể được báo là đạt.
  file: `packages/ui/test/eve-to-ai-sdk.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — `do_o` chỉ được assert là chuỗi khác rỗng, trong khi lời hứa là quan hệ tới một eval có thật (E7/E12 không tồn tại)**
  Người dùng thấy gì: Yêu cầu mỗi phép đo nằm ngoài quy trình tự động phải ghi rõ nơi nó được đo trên thực tế chỉ được kiểm là có ghi chữ, không kiểm nội dung đó có đúng và có tồn tại hay không, nên một ghi chú trỏ sai chỗ vẫn được coi là đạt.
  file: `packages/ui/test/rang-chat.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).