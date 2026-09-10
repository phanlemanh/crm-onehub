## Trong hợp đồng

(không có — không phát hiện nào ánh xạ được vào AC ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Xoá 9/14 component thuộc nhóm "Adopted" mà không sửa bảng đăng ký ở docs/chat-ui.md**
  Người dùng thấy gì: Tài liệu hướng dẫn nội bộ về các khối giao diện chat vẫn liệt kê một số khối đã bị gỡ bỏ, khiến người làm việc sau có thể tưởng nhầm chúng vẫn dùng được và cố dùng lại.
  file: `docs/chat-ui.md`
  severity: high
  Đề xuất: known-limits

- **Đè màu của component bằng className tại chỗ gọi — trái docs/design.md**
  Người dùng thấy gì: Một nút bấm trên khung chat được tô màu riêng thay vì dùng đúng kiểu chung của hệ thống, nên nếu sau này đổi giao diện tối/sáng chung, nút này có thể lệch màu so với các nút khác mà không ai để ý.
  file: `packages/ui/src/components/ai-elements/conversation.tsx`
  severity: medium
  Đề xuất: known-limits

- **Cổng test của packages/ui phụ thuộc vào thư mục hồ sơ của một vòng cụ thể**
  Người dùng thấy gì: Bộ kiểm tra tự động của toàn bộ giao diện dùng chung đang dựa vào một hồ sơ công việc riêng của đợt này; nếu hồ sơ đó bị dọn dẹp hay đổi chỗ sau này, việc kiểm tra chất lượng giao diện có thể ngừng chạy được mà không ai hay.
  file: `packages/ui/test/rang-chat.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **Hai phụ thuộc thành mồ côi sau khi xoá 19 component, không lệnh cổng nào bắt**
  Người dùng thấy gì: Hai gói phần mềm phụ trợ không còn được dùng vẫn bị khai là cần thiết, làm ứng dụng nặng hơn một chút một cách không cần thiết; không ảnh hưởng gì tới người dùng.
  file: `packages/ui/package.json`
  severity: low
  Đề xuất: wont-fix

- **output-denied / approval-responded rơi vào nhánh "đã xong" — lượt gọi bị từ chối hiện ra như thành công**
  Người dùng thấy gì: Khi người dùng bấm từ chối một hành động do trợ lý AI đề xuất thực hiện, màn hình có thể hiển thị nhầm như thể hành động đó đã được thực hiện xong, khiến người dùng hiểu sai là việc đã được làm trong khi thực ra đã bị từ chối.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: high
  Đề xuất: new-contract

- **Lớp chuyển mặc định locale "vi", không đọc từ locale provider**
  Người dùng thấy gì: Nếu nơi gọi quên chỉ định ngôn ngữ, một câu thông báo lỗi có thể hiện bằng tiếng Việt ngay giữa một cuộc hội thoại đang dùng tiếng Anh.
  file: `packages/ui/src/lib/eve-to-ai-sdk.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — E8 (AC-4) chỉ chạy vế ĐỌC, không chạy round-trip rút-từ-writer mà chính nó đòi**
  Người dùng thấy gì: Bằng chứng tự động dùng để chứng minh dữ liệu công cụ không bị mất khi hiển thị lại đang dựa vào một phép đo không thực sự kiểm tra đúng điều đó; nếu sau này có người chỉ chạy đúng phép đo được ghi nhận chính thức, một lỗi làm mất dữ liệu có thể lọt qua mà không bị phát hiện.
  file: `_acceptance/nen-chat-ai-elements/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — assert tên công cụ có mặt trong khi lời hứa của chính bài kiểm là quan hệ output-vào ≡ output-ra**
  Người dùng thấy gì: Một phần của bộ kiểm tra tự động không thực sự xác nhận rằng kết quả trả về từ một hành động được giữ nguyên khi hiển thị lại, nên nếu sau này có lỗi làm mất dữ liệu đó ở đúng trường hợp này, bộ kiểm tra có thể không phát hiện ra.
  file: `packages/ui/test/eve-to-ai-sdk.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — 'do_o' của răng ngoài cổng chỉ được assert là chuỗi khác rỗng, trong khi lời hứa là quan hệ tới eval có thật**
  Người dùng thấy gì: Một số công cụ đo chất lượng nằm ngoài quy trình kiểm tra tự động ghi chú nơi chúng được đo, nhưng thông tin đó trỏ tới hai nơi đo không còn tồn tại; nếu có ai dựa vào ghi chú đó để tìm bằng chứng, họ sẽ không tìm thấy.
  file: `packages/ui/test/rang-chat.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).