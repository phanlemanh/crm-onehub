# Review findings: cho-tac-nhan-lau (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Sidebar markRead lists cache keys at the call site instead of calling useCrmCache().thongBao()**
  Người dùng thấy gì: Khi mở một cuộc trò chuyện từ thanh bên, số trên chuông giảm đúng, nhưng trang danh sách thông báo có thể còn hiện dòng đó là chưa đọc trong tối đa nửa phút cho tới khi tải lại.
  file: `apps/app/components/agent-builder/agent-builder-sidebar.tsx`
  severity: medium
  Đề xuất: known-limits

- **do-man.mjs now depends on agent-builder-khung.ts, but E9's paths do not list that file**
  Người dùng thấy gì: Nếu sau này ai đó đổi nhãn của danh sách hội thoại ở thanh bên, bài đo màn đã ký có thể không bị đánh dấu cũ và lặng lẽ đo lệch. Người dùng cuối không thấy gì khác.
  file: `_acceptance/cho-tac-nhan-lau/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **markRead ở thanh bên làm mới chuông nhưng bỏ sót danh sách /thong-bao; không dùng cache.thongBao()**
  Người dùng thấy gì: Mở cuộc trò chuyện từ thanh bên làm chuông giảm số, nhưng trang Thông báo mở lại ngay sau đó có thể vẫn hiện dòng ấy là chưa đọc, nên hai chỗ hiện lệch nhau một lúc.
  file: `apps/app/components/agent-builder/agent-builder-sidebar.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ có assertion âm tính): ô mo-tu-thanh-ben-1280 coi «không có huy hiệu» là đếm về 0, và nhãn «khong tai lai trang» in ra mà không đo**
  Người dùng thấy gì: Bài kiểm tra màn cho trường hợp mở từ thanh bên có thể báo đạt cả khi trang bị tải lại thay vì chuông tự cập nhật. Sản phẩm chạy đúng, nhưng bằng chứng ở ca này yếu hơn vẻ ngoài.
  file: `_acceptance/cho-tac-nhan-lau/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Thành phần chat mới TheDangDung nằm trong apps/app/components, trong khi việc này đã có chủ trong sổ AI Elements (Task/KaraSteps) (r2)**
  Người dùng thấy gì: Thẻ «Đang dựng» được tách thành một khối riêng đặt sai chỗ so với quy ước của kho. Người dùng nhìn và dùng không thấy khác, nhưng sau này sửa giao diện chat sẽ phải làm ở hai nơi.
  file: `apps/app/components/agent-builder/the-dang-dung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Đường dẫn `/chat/${id}` thành khoá nối giữa hai app nhưng được viết tay ở cả hai đầu (r2)**
  Người dùng thấy gì: Nếu sau này ai đổi đường dẫn của trang chat ở một phía mà quên phía kia, chuông sẽ giữ số «chưa đọc» mãi dù người dùng đã mở cuộc trò chuyện. Hiện tại thì vẫn chạy đúng.
  file: `apps/api/src/conversations/conversations.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, rỗng): kiểm «không lẫn ngôn ngữ» cho dung.daTroi không bao giờ bắt được gì, và bản en của daTroi không có đối chứng dương (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động chưa bắt được trường hợp thẻ chờ hiện chữ «Đã» tiếng Việt ở bản tiếng Anh. Nếu có lỗi như vậy, người dùng tiếng Anh sẽ thấy chữ lẫn ngôn ngữ mà bài kiểm vẫn báo xanh.
  file: `apps/app/test/cho-tac-nhan-lau.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo tín hiệu phụ thay vì đầu ra): dòng E9 «mở từ chuông» xanh nhờ moMot có sẵn của chuông, không cần cuộc trò chuyện mở ra (r2 · tệp đã đổi)**
  Người dùng thấy gì: Phép đo tự động cho bước «bấm thông báo trên chuông» có thể báo đạt dù trang không chuyển sang cuộc trò chuyện. Chưa thấy lỗi thật ở màn, chỉ là bằng chứng chưa chắc.
  file: `_acceptance/cho-tac-nhan-lau/rang/do-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (có chuỗi trong khi lời hứa là quan hệ): kỳ vọng câu chuông lấy từ chính hàm đang bị đo, nên không ghim loại nào đi với câu nào (r2)**
  Người dùng thấy gì: Bài kiểm chưa chặn được việc hoán nhầm câu giữa «xong», «cần trả lời» và «hỏng». Nếu nhầm xảy ra, người dùng sẽ đọc sai thông báo về tác nhân của mình.
  file: `apps/app/test/cho-tac-nhan-lau-chuong.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **markRead làm mới thongBao bằng khoá liệt kê tại chỗ gọi, bỏ qua cache.thongBao() và không làm mới thongBao.danhSach (r1)**
  Người dùng thấy gì: Sau khi mở một cuộc trò chuyện, số trên chuông giảm đúng, nhưng trang Thông báo có thể vẫn hiện các dòng đó là chưa đọc cho tới khi tải lại trang.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: medium
  Đề xuất: known-limits

- **className đổi khoảng cách của CardAction và CardFooter từ @crm/ui (r1)**
  Người dùng thấy gì: Khoảng cách và cỡ chữ ở thẻ Đang dựng được chỉnh riêng thay vì dùng kiểu chung của ứng dụng, nên có thể lệch nhẹ so với các màn khác sau này.
  file: `apps/app/components/agent-builder/the-dang-dung.tsx`
  severity: low
  Đề xuất: known-limits

- **Câu «quá 3 phút» viết cứng, lệch khỏi ngưỡng có thể chỉnh CHO_TAC_NHAN.nguongLauMs (200 s); đơn vị giây khai lại lần nữa (r1)**
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
