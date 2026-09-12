> **Lưu ý đọc:** lượt này resume nên phần phản biện replay từ bộ nhớ đệm của
> lượt trước. HAI mục dưới đây ĐÃ được sửa ở commit `040c523`, sau khi báo cáo
> đó được viết: nhãn vai trong bản tải về nay đọc từ bảng chuỗi, và
> `docs/plan/chat-ai-elements-rebuild.md` nay mở đầu bằng khối "Phase 0 đã xong".
> Mọi dòng nhật ký của lượt này neo `040c523`, tức các phép đo chạy trên cây mới.

## Trong hợp đồng

### Chữ tiếng Anh hiển thị lọt qua răng chu-cung vì nó được suy ra, không phải chuỗi viết cứng
file: `packages/ui/src/components/ai-elements/conversation.tsx:128`
severity: medium
AC: AC-5
source: conventions

`defaultFormatMessage` dựng nhãn vai bằng `message.role.charAt(0).toUpperCase() + message.role.slice(1)` rồi ghép vào `**${roleLabel}:** …`. Bản markdown người dùng tải về do đó mang "**User:**" / "**Assistant:**" — chữ tiếng Anh hiển thị, không đi qua `packages/ui/src/lib/messages.ts`, và `messages()` không có khoá nào cho nó.

Đây là một lỗ đã chứng minh được ở đúng thước AC-10 mà vòng này bán là kín: `_acceptance/nen-chat-ai-elements/rang/chu-cung.mjs` quét *chuỗi có chữ* rồi trừ danh sách trắng, nên một nhãn suy ra từ `message.role` không có literal để nó nhìn thấy. Tệ hơn, chính danh sách trắng ghi lý do miễn cho `"user"` là "giá trị trường role của UIMessage … đi vào phép so sánh hoặc vào siêu dữ liệu, không đi vào câu chữ" (chu-cung.mjs:75-85) — mô tả đó nay sai với chính tệp nó đang gác. Cùng khối đó miễn `"conversation.md"` với ghi chú rất kỹ rằng nó CÓ hiện ra cho người dùng, nên chuẩn xét không nhất quán trong cùng một component.

AC-5 của contract.md khai "không chuỗi nào là văn bản tiếng Anh viết cứng; mọi chuỗi hiển thị đọc từ useMessages()" — đúng theo nghĩa đen, nhưng răng chống lưng cho nó không bắt được hình dạng này. Lưu ý: mục `className` đè màu ở cùng tệp (`dark:bg-background`) ĐÃ được khai ở Known limits nên tôi không tính là finding.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hình dạng biên nuốt lỗi phân tích: input/output của lượt did không bao giờ đỏ được**
  Người dùng thấy gì: Khi một công cụ trả về dữ liệu hỏng dạng, màn hình cuộc trò chuyện hiển thị y như công cụ đã chạy xong mà không có kết quả, thay vì báo có lỗi xảy ra. Người dùng không biết có sự cố ở bước đó.
  file: `packages/validation/src/agent-transcript.ts`
  severity: high
  Đề xuất: known-limits

- **Kế hoạch chuyển của area chat không được cập nhật, nay mô tả sai cây**
  Người dùng thấy gì: Tài liệu hướng dẫn cho giai đoạn kế tiếp của việc nâng cấp khung chat vẫn mô tả sai số lượng thành phần còn lại, vị trí đặt chuỗi hiển thị, và những tệp cần sửa tiếp theo. Người làm giai đoạn sau có thể theo hướng dẫn sai và mất công sửa lại.
  file: `docs/plan/chat-ai-elements-rebuild.md`
  severity: high
  Đề xuất: new-contract

- **Cổng check-types bị gỡ khỏi bộ suite của cả kho, không chỉ vòng này**
  Người dùng thấy gì: Bộ kiểm tra tự động của toàn bộ hệ thống hiện không còn kiểm tra kiểu dữ liệu ở mỗi lần đổi. Một lỗi kiểu dữ liệu ở nơi khác trong hệ thống có thể lọt qua khâu kiểm tự động và chỉ bị chặn muộn hơn, ngay trước khi đẩy code lên.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Lớp chuyển ép sáu trạng thái công cụ xuống ba — lượt chờ duyệt đã trả lời hiện ra như đã xong**
  Người dùng thấy gì: Khi người dùng từ chối cho một công cụ chạy, màn hình vẫn hiển thị như công cụ đó đã chạy xong với kết quả rỗng, khiến người dùng nhầm tưởng việc đã hoàn tất trong khi thực ra bị từ chối.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: medium
  Đề xuất: known-limits

- **Miễn trừ hết hạn chỉ được in ra, không làm răng đỏ — có thể nuốt một mồ côi thật về sau**
  Người dùng thấy gì: Một ngoại lệ tạm thời cho phép bỏ qua kiểm tra ở một màn hình cụ thể sẽ không tự động bị gỡ hay chặn lại khi hết hạn, chỉ hiện cảnh báo. Về sau, một thành phần lẽ ra phải bị phát hiện là thừa có thể lọt qua vì vẫn núp trong ngoại lệ cũ.
  file: `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — E8 chỉ chạy vế ĐỌC, không chạy round-trip rút-từ-writer mà chính nó đòi**
  Người dùng thấy gì: Một trong các phép đo tự động kiểm tra ít hơn những gì nó tuyên bố kiểm tra. Một số thay đổi làm lệch giữa các phần của hệ thống có thể không bị chính phép đo đó bắt ngay, dù bộ kiểm khác trong quy trình vẫn có cơ hội bắt được.
  file: `_acceptance/nen-chat-ai-elements/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert `toolName` có mặt trong khi lời hứa của chính bài kiểm là quan hệ output-vào ≡ output-ra**
  Người dùng thấy gì: Một bài kiểm tra tự động chỉ xác nhận tên công cụ đúng chứ không thực sự xác nhận kết quả trả về được giữ nguyên. Một thay đổi làm mất dữ liệu kết quả ở ca chạy bình thường có thể không bị bài kiểm này phát hiện.
  file: `packages/ui/test/eve-to-ai-sdk.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — `do_o` chỉ được assert là chuỗi khác rỗng, trong khi lời hứa là quan hệ tới một eval có thật (E7/E12 không tồn tại)**
  Người dùng thấy gì: Một quy tắc yêu cầu mỗi phần kiểm tra nằm ngoài quy trình duyệt tự động phải ghi rõ nơi nó thực sự được đo, nhưng việc kiểm tra quy tắc đó chỉ xác nhận có ghi chữ chứ không xác nhận nơi đó có thật. Trên thực tế đã có hai mục trỏ tới nơi đo không tồn tại mà không ai phát hiện.
  file: `packages/ui/test/rang-chat.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
