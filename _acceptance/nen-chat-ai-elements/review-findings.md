## Trong hợp đồng

(rỗng — không finding nào map được vào AC nào của hợp đồng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Hồ sơ bằng chứng đã ký của một vòng khác bị ghi đè trong diff của vòng này**
  Người dùng thấy gì: Bằng chứng đã được ký duyệt của một đợt làm việc trước đó bị ghi đè, nên sau này không ai còn cách kiểm lại đợt đó từng được duyệt trên phiên bản nào.
  file: `_acceptance/chan-lai-component-ra-man/evidence/ve-that.json`
  severity: high
  Đề xuất: new-contract

- **Nhãn vai trong bản tải về là chuỗi cứng tiếng Anh, nằm ngoài bảng chuỗi và ngoài tầm răng chu-cung**
  Người dùng thấy gì: Khi người dùng chọn giao diện tiếng Việt và tải cuộc trò chuyện về máy, nhãn người nói trong tệp tải về vẫn hiện bằng tiếng Anh.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: medium
  Đề xuất: known-limits

- **source.url khai lỏng hơn schema đang thật sự sinh ra nó, trong khi giá trị chảy thẳng vào href**
  Người dùng thấy gì: Một đường liên kết nguồn tham khảo do AI tìm ra có thể trỏ tới một đoạn mã thay vì một trang web thật, mà hệ thống chưa cảnh báo trước khi người dùng bấm vào.
  file: `packages/validation/src/agent-transcript.ts`
  severity: medium
  Đề xuất: known-limits

- **toToolPart biến kết quả "chạy xong nhưng không ghi" thành lỗi giả và nuốt mất output**
  Người dùng thấy gì: Khi trợ lý làm xong một việc bình thường nhưng công cụ báo chưa lưu được, màn hình có thể hiện thành một lỗi nghiêm trọng kèm thông báo lỗi không có thật, và lý do thật của việc chưa lưu biến mất khỏi màn hình.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: high
  Đề xuất: new-contract

- **so-lech-chuan.mjs rò thư mục tạm ở mọi đường thoát lỗi — process.exit bỏ qua finally**
  Người dùng thấy gì: Mỗi lần công cụ đo nội bộ báo lỗi, một thư mục tạm bị bỏ quên lại trên máy chạy phép đo, tích tụ dần theo thời gian.
  file: `_acceptance/nen-chat-ai-elements/rang/so-lech-chuan.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét cả lớp component nhưng chỉ assert một điểm: 6 tệp không nạp được vẫn xanh**
  Người dùng thấy gì: Nếu sau này một component trò chuyện bị xoá hay đổi tên gây lỗi khi tải, bài kiểm liên quan vẫn báo đạt, nên lỗi đó không bị phát hiện qua bộ kiểm tự động.
  file: `packages/ui/test/lai-ra-man.spec.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert tên công cụ có mặt trong khi lời hứa của chính bài kiểm là quan hệ output-vào ≡ output-ra**
  Người dùng thấy gì: Bài kiểm đứng tên bảo đảm nội dung phản hồi của công cụ được giữ nguyên khi hiển thị, nhưng thực ra không kiểm tra điều đó, nên nội dung có thể bị rơi mất mà không ai phát hiện qua bộ kiểm tự động.
  file: `packages/ui/test/eve-to-ai-sdk.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).