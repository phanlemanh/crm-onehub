# Review findings: cho-tac-nhan-lau (round 2)

## Trong hợp đồng

- **Opening a chat from the sidebar marks its notifications read on the server, but the bell count does not refresh**
  file: `apps/app/components/agent-builder/agent-builder-sidebar.tsx:61`
  severity: low
  source: bugs
  AC: AC-6
  detail: This round changed ConversationsService.markRead (apps/api/src/conversations/conversations.service.ts:649) so it also sets docLuc on every ThongBao with nguon 'tac-nhan' and duongDan '/chat/<id>'. Only the markRead in agent-builder-chat.tsx (line 286) was updated to also invalidate trpc.thongBao.chuong.pathKey(). The other caller, the sidebar's markRead (agent-builder-sidebar.tsx:61-67, fired on link click at line 119 when conversation.unread is true), still invalidates only builderList. So when a user opens the chat from the sidebar, the server marks the notification read, but the bell keeps showing the old unread count. The chat's onPointerEnter usually cannot fix this: it calls markRead only when lastAssistantAt > lastReadAt, and once builderById reloads after the sidebar's mutation, lastReadAt is already newer, so it skips the call. The bell catches up only on its own refetchInterval (THONG_BAO.hoiLaiMs = 60 s, chuong-thong-bao.tsx:177). This breaks AC-6 ('số trên chuông giảm tương ứng') for the most common way of opening a chat after leaving the page. Fix: add trpc.thongBao.chuong.pathKey() (or the cache helper) to the sidebar markRead's onSuccess.
  rationale: AC-6 đòi mở cuộc trò chuyện thì thông báo thành đã đọc và số trên chuông giảm; mở từ thanh bên làm số chuông không giảm ngay.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thành phần chat mới TheDangDung nằm trong apps/app/components, trong khi việc này đã có chủ trong sổ AI Elements (Task/KaraSteps)**
  Người dùng thấy gì: Thẻ «Đang dựng» được tách thành một khối riêng đặt sai chỗ so với quy ước của kho. Người dùng nhìn và dùng không thấy khác, nhưng sau này sửa giao diện chat sẽ phải làm ở hai nơi.
  file: `apps/app/components/agent-builder/the-dang-dung.tsx`
  severity: medium
  Đề xuất: known-limits
- **Đường dẫn `/chat/${id}` thành khoá nối giữa hai app nhưng được viết tay ở cả hai đầu**
  Người dùng thấy gì: Nếu sau này ai đổi đường dẫn của trang chat ở một phía mà quên phía kia, chuông sẽ giữ số «chưa đọc» mãi dù người dùng đã mở cuộc trò chuyện. Hiện tại thì vẫn chạy đúng.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 4 (âm tính một mình, rỗng): kiểm «không lẫn ngôn ngữ» cho dung.daTroi không bao giờ bắt được gì, và bản en của daTroi không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm tự động chưa bắt được trường hợp thẻ chờ hiện chữ «Đã» tiếng Việt ở bản tiếng Anh. Nếu có lỗi như vậy, người dùng tiếng Anh sẽ thấy chữ lẫn ngôn ngữ mà bài kiểm vẫn báo xanh.
  file: `apps/app/test/cho-tac-nhan-lau.dom.tsx`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 1 (đo tín hiệu phụ thay vì đầu ra): dòng E9 «mở từ chuông» xanh nhờ moMot có sẵn của chuông, không cần cuộc trò chuyện mở ra**
  Người dùng thấy gì: Phép đo tự động cho bước «bấm thông báo trên chuông» có thể báo đạt dù trang không chuyển sang cuộc trò chuyện. Chưa thấy lỗi thật ở màn, chỉ là bằng chứng chưa chắc.
  file: `_acceptance/cho-tac-nhan-lau/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits
- **Hình dạng 3 (có chuỗi trong khi lời hứa là quan hệ): kỳ vọng câu chuông lấy từ chính hàm đang bị đo, nên không ghim loại nào đi với câu nào**
  Người dùng thấy gì: Bài kiểm chưa chặn được việc hoán nhầm câu giữa «xong», «cần trả lời» và «hỏng». Nếu nhầm xảy ra, người dùng sẽ đọc sai thông báo về tác nhân của mình.
  file: `apps/app/test/cho-tac-nhan-lau-chuong.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **markRead làm mới thongBao bằng khoá liệt kê tại chỗ gọi, bỏ qua cache.thongBao() và không làm mới thongBao.danhSach (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi mở một cuộc trò chuyện, số trên chuông giảm đúng, nhưng trang Thông báo có thể vẫn hiện các dòng đó là chưa đọc cho tới khi tải lại trang.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: medium
  Đề xuất: known-limits

- **className đổi khoảng cách của CardAction và CardFooter từ @crm/ui (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khoảng cách và cỡ chữ ở thẻ Đang dựng được chỉnh riêng thay vì dùng kiểu chung của ứng dụng, nên có thể lệch nhẹ so với các màn khác sau này.
  file: `apps/app/components/agent-builder/the-dang-dung.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu «quá 3 phút» viết cứng, lệch khỏi ngưỡng có thể chỉnh CHO_TAC_NHAN.nguongLauMs (200 s); đơn vị giây khai lại lần nữa (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này đổi thời gian chờ lâu, dòng báo trên thẻ vẫn ghi «quá 3 phút» và sẽ không khớp con số mới.
  file: `apps/app/lib/messages/agent-builder-tro-chuyen.ts`
  severity: low
  Đề xuất: known-limits

- **Thông báo tác nhân kẹt «chưa đọc» khi người dùng xem kết quả ngay trên màn chat rồi gửi tiếp (r1)**
  Người dùng thấy gì: Nếu bạn ngồi chờ ngay trên màn chat, thấy kết quả rồi gõ tiếp, chuông có thể vẫn đếm một thông báo «xong» hoặc «cần trả lời» của chính cuộc trò chuyện đó.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
