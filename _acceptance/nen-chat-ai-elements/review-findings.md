## Trong hợp đồng

- **Tool call ở trạng thái lỗi bị chuyển thành "đã xong" khi errorText rỗng**
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts:44`
  severity: high
  AC: AC-4
  detail: toToolPart chỉ trả state "output-error" khi CẢ HAI điều kiện đúng: item.tone === "warning" VÀ item.errorText !== null. Nhưng hai trường đó do hai đường khác nhau sinh ra ở apps/app/lib/agent-transcript.ts: outcomeTone() (dòng ~290) đặt "warning" khi part.state === "output-error", còn errorTextOf() (dòng 391) trả null khi errorText là chuỗi rỗng hoặc chỉ có khoảng trắng (`return text?.trim() ? text : null`).

    Kịch bản hỏng: một dynamic-tool part về với `state: "output-error", errorText: ""` (hoặc "   ") — AI SDK không đảm bảo errorText khác rỗng. Khi đó item.tone = "warning", item.errorText = null, nên cả hai nhánh trên đều trượt và hàm rơi xuống nhánh cuối: trả `state: "output-available", output: item.output`. output ở đó là `eveToolOutput.parse(undefined)` = null (schema có `.catch(null)`), nên màn hình vẽ ra một lượt gọi công cụ ĐÃ XONG THÀNH CÔNG với kết quả rỗng, thay vì một lượt gọi lỗi. Lỗi bị nuốt hoàn toàn, không có dấu vết nào ở UI.

    Điều kiện nên bám vào state gốc (hoặc vào riêng errorText !== null), không bám vào `tone` — tone là một suy diễn hiển thị trộn hai nguồn (output-error và `stored === false` / `written === false`), nên nó không phải là thứ để quyết định state của AI SDK. Bộ test packages/ui/test/eve-to-ai-sdk.spec.ts chỉ phủ ca errorText có chữ ("hết lượt gọi trong ngày"), nên ca này không có răng nào chặn.
  rationale: Lỗi khiến một lượt gọi công cụ thực sự báo lỗi (Tone=warning) hiển thị thành đã hoàn tất, đúng kịch bản AC-4 yêu cầu phải hiện state báo lỗi chứ không phải state hoàn tất.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Golden fixture regenerates itself before the assertion that compares against it, and writes into another package**
  Người dùng thấy gì: Bài kiểm nội bộ dùng để bắt lỗi khi định dạng cuộc trò chuyện thay đổi có thể tự vá cho mình mỗi lần chạy, nên nếu định dạng bị lỗi trong tương lai, hệ thống có thể không cảnh báo kịp — người dùng không thấy khác biệt gì ở bản này.
  file: `apps/app/test/agent-transcript.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Downloaded conversation carries hardcoded English role labels, past the round's own string gate**
  Người dùng thấy gì: Khi tải một cuộc trò chuyện xuống tệp, các nhãn người dùng/trợ lý luôn hiện bằng tiếng Anh (User/Assistant) dù đang dùng giao diện tiếng Việt.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: medium
  Đề xuất: known-limits

- **Unreachable `asked` guard in the conversion layer can never fire**
  Người dùng thấy gì: Không có tác động tới người dùng ở bản này; đây là một đoạn kiểm tra an toàn không bao giờ chạy tới, sẽ cần rà lại khi tính năng này được nối vào màn hình thật.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: low
  Đề xuất: known-limits

- **Another feature's signed evidence file regenerated inside this round's diff**
  Người dùng thấy gì: Hồ sơ bằng chứng đã ký của một tính năng khác trong quá khứ bị ghi đè bởi lần đo hôm nay, khiến sau này khó tra lại chính xác những gì đã được duyệt lúc đó — không ảnh hưởng người dùng cuối.
  file: `_acceptance/chan-lai-component-ra-man/evidence/ve-that.json`
  severity: low
  Đề xuất: known-limits

- **Răng màu khai là "danh sách trắng đóng" nhưng danh sách tiền tố lại mở**
  Người dùng thấy gì: Bộ chặn màu sắc ngoài chuẩn hiện chỉ canh đúng nhóm màu chữ/nền/viền/con trỏ cơ bản; một số kiểu tô màu khác (viền ngoài, đổ bóng, gạch chân...) có thể lọt vào giao diện ở các đợt sau mà không bị cảnh báo.
  file: `_acceptance/nen-chat-ai-elements/rang/mau-ban-kinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **ConversationDownload thu hồi object URL ngay sau click, và nhãn vai là chuỗi cứng tiếng Anh**
  Người dùng thấy gì: Nút tải cuộc trò chuyện xuống có thể âm thầm không tải được tệp trên một số trình duyệt, và nhãn người dùng/trợ lý trong tệp tải về vẫn hiện tiếng Anh — nhưng tính năng này chưa xuất hiện trên màn hình nào của người dùng.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: low
  Đề xuất: known-limits

- **pham-vi-diff.mjs thoát mã 1 khi KHÔNG ĐO ĐƯỢC, lẫn với mã 1 khi có vi phạm**
  Người dùng thấy gì: Công cụ đo phạm vi thay đổi có thể báo nhầm giữa 'không đo được' và 'có vi phạm' khi chạy trên một số máy hoặc bản sao kho không đầy đủ, khiến người xét duyệt hiểu nhầm là có vi phạm trong khi phép đo thực ra chưa chạy được.
  file: `_acceptance/nen-chat-ai-elements/rang/pham-vi-diff.mjs`
  severity: low
  Đề xuất: known-limits

- **Fixture khớp khuôn bên đọc — lệnh của E8 không chạy vế round-trip, writer đổi hình dạng vẫn xanh**
  Người dùng thấy gì: Phép đo tự động dùng để xác nhận việc chuyển đổi định dạng hội thoại đúng đắn chưa thực sự kiểm tra hết chiều tạo dữ liệu, nên một lỗi ở khâu đó có thể không bị phát hiện dù báo cáo vẫn ghi là đạt.
  file: `_acceptance/nen-chat-ai-elements/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
