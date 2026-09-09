## Trong hợp đồng

### Assert "chuỗi có mặt" trong khi lời hứa là QUAN HỆ giữa các giá trị — ca (a) của AC-4 không đo đường đi của errorText

- file: `packages/ui/test/eve-to-ai-sdk.spec.ts:102`
- severity: high
- AC: AC-4
- source: measurement

AC-4 ca (a) hứa một QUAN HỆ giữa đầu vào và đầu ra: "state gốc là output-error kèm chuỗi lỗi → output-error mang ĐÚNG CHUỖI ĐÓ" (contract.md, mục AC-4; E8 của evals.yaml chép lại nguyên văn: "(a) state goc output-error kem chuoi loi -> output-error mang dung chuoi do").

Bài kiểm ghim ca này (dòng 96-109) lại chỉ so:

  expect({ tone: item.tone, errorText: item.errorText, state: part.state })
    .toEqual({ tone: "warning", errorText: "hết lượt gọi trong ngày", state: "output-error" });

`item` là VẬT THỬ đã phân tích (dòng 97: `const item = didAt("m3:call-warning")`), nên `item.errorText` ở dòng 102 chỉ khẳng định vật thử tự nó mang chuỗi đó — một điều hiển nhiên đúng vì chính fixtures/eve-turns.json:85 viết ra nó. Vế duy nhất nói về đầu ra là `part.state`. Không dòng nào chạm `part.errorText`.

Đây đúng là hình dạng "đo chuỗi có mặt thay vì đo quan hệ": chuỗi lỗi có mặt ở đầu VÀO được lấy làm bằng chứng cho lời hứa về đầu RA.

Hiệu ứng cụ thể: trong packages/ui/src/lib/eve-to-ai-sdk.ts:54, nhánh failed viết `errorText: item.errorText ?? messages(locale).chatTool.failed`. Đổi dòng đó thành `errorText: messages(locale).chatTool.failed` (bỏ hẳn chuỗi lỗi thật, mọi lượt hỏng đều hiện "Bước này lỗi") thì:
  - ca (a) vẫn xanh, vì nó không assert part.errorText;
  - ca (b) (dòng 111-131) cũng vẫn xanh, vì nó ghim đúng chuỗi mặc định `messages("vi").chatTool.failed` và `messages("en").chatTool.failed`;
  - ca (c) và các ca còn lại không đi qua nhánh failed.
Cả bộ suite xanh trong khi người dùng mất nguyên văn lý do lỗi trên màn.

Grep toàn kho xác nhận không có phép đo nào khác bịt lỗ này: "hết lượt gọi trong ngày" chỉ xuất hiện ở packages/ui/test/eve-to-ai-sdk.spec.ts:106, packages/ui/test/fixtures/eve-turns.json:85 và apps/app/test/agent-transcript.spec.ts:759 (bài kiểm round-trip của toTranscript, không gọi toToolPart). packages/validation/test/agent-transcript.spec.ts:29 chỉ kiểm schema đọc lại đúng trường, không kiểm lớp chuyển.

Đối chiếu với hai ca kia cho thấy khuôn đúng đã có sẵn ngay trong cùng tệp: ca (b) dòng 124-130 assert `part` bằng toMatchObject kèm errorText, ca (c) dòng 146-149 assert cả `state` lẫn `output`. Chỉ ca (a) — ca có chuỗi lỗi thật, tức ca duy nhất chứng minh chuỗi thật đi xuyên qua được lớp chuyển — là thiếu vế đầu ra.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Xoá 9/14 component "Adopted" mà không sửa bảng đăng ký ở docs/chat-ui.md**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ cho các phiên làm việc sau vẫn liệt kê một số thành phần chat đã bị gỡ bỏ khỏi kho là "đã dùng được", có thể khiến người làm tiếp theo tưởng nhầm và cấu hình sai theo hướng dẫn cũ.
  file: `docs/chat-ui.md`
  severity: high
  Đề xuất: known-limits

- **suite_keys mất check_types_khong_cache cho MỌI vòng sau, trong khi lý do chỉ áp cho vòng này**
  Người dùng thấy gì: Từ nay, các lần kiểm tra tính năng tiếp theo trong toàn bộ dự án sẽ không còn tự động kiểm tra lỗi kiểu dữ liệu nữa, dù tài liệu nội bộ vẫn ghi là có — vấn đề kiểu dữ liệu chỉ được phát hiện muộn hơn, lúc dựng ứng dụng hoặc ngay trước khi đẩy code lên.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **className đè màu của Button ở hai chỗ trong conversation.tsx**
  Người dùng thấy gì: Hai nút (cuộn xuống đáy và tải hội thoại) trong khung chat có thể hiện màu nền hơi lệch chuẩn giao diện chung ở chế độ tối, vì màu được ấn định riêng tại chỗ dùng thay vì lấy từ bộ giao diện dùng chung của toàn sản phẩm.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: medium
  Đề xuất: known-limits

- **Nhãn vai trong bản tải hội thoại là chuỗi tiếng Anh dựng bằng code, ngoài bảng chuỗi**
  Người dùng thấy gì: Khi người dùng tải file hội thoại về máy, nhãn người nói trong file luôn hiện bằng tiếng Anh (User/Assistant) dù giao diện sản phẩm đang ở tiếng Việt.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lý do giữ pham-vi-diff ngoài cổng đã sai sự thật, và không gì bắt được**
  Người dùng thấy gì: Một trong các bước kiểm tra tự động của dự án đang được miễn kiểm tra dựa trên một lý do đã không còn đúng với thực tế, mà không có cơ chế nào tự phát hiện việc lý do đó đã lỗi thời.
  file: `.githooks/gate-shape.json`
  severity: medium
  Đề xuất: known-limits

- **so-lech-chuan.mjs bỏ lại sân tạm trên mọi đường "KHÔNG ĐO ĐƯỢC"**
  Người dùng thấy gì: Nếu quá trình kiểm tra tự động bị lỗi mạng giữa chừng, công cụ có thể để lại các thư mục tạm chứa bản sao mã nguồn trên máy chủ dựng, dồn lại qua nhiều lần chạy mà không có cảnh báo nào.
  file: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **content-visibility trên mọi con của ConversationContent: chiều cao ước lượng và cắt tràn**
  Người dùng thấy gì: Khi màn hình thật sau này dùng lại khung cuộn hội thoại, có nguy cơ vòng viền lấy nét ở mép mỗi lượt chat bị cắt xén, và vị trí thanh cuộn có thể trôi nhẹ khi người dùng cuộn ngược lên xem tin nhắn cũ.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: known-limits

- **ConversationDownload thu hồi blob URL ngay sau click — tải có thể im lặng không xảy ra**
  Người dùng thấy gì: Nếu nút tải hội thoại này được đưa vào dùng thật, người dùng dùng trình duyệt Firefox hoặc Safari có thể bấm tải mà không có tệp nào được lưu xuống máy, và không có thông báo lỗi nào hiện ra.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
