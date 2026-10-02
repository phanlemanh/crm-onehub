# Review findings: nen-kara (round 1)

## Trong hợp đồng

Không có lỗi nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The inline ProposedChange draws the Kara mark itself, without KaraMark and without the word «Kara»**
  Người dùng thấy gì: Mỗi đề xuất của Kara trong dòng đang sửa hiện một tia sáng nhỏ mà không có chữ «Kara» đi kèm, lệch với luật giao diện AI chung, nên người dùng có thể không biết ngay đề xuất này từ đâu ra.
  file: `packages/ui/src/components/proposed-change.tsx`
  severity: medium
  Đề xuất: known-limits

- **The nen-kara proto module renders a second <main> inside the proto layout's <main>**
  Người dùng thấy gì: Trang mẫu nội bộ của Kara có hai vùng nội dung lồng nhau, trình đọc màn hình có thể đọc thành hai trang chính. Chỉ ảnh hưởng trang mẫu nội bộ, không ảnh hưởng màn người dùng thật.
  file: `apps/app/app/proto/_modules/nen-kara/index.tsx`
  severity: low
  Đề xuất: known-limits

- **docs/ai-ux.md points to DiemCam/BangMucTieu and a file path that do not exist on any branch**
  Người dùng thấy gì: Tài liệu lộ trình nhắc tới một bảng và một tệp mẫu chưa có trong kho, ai đọc trước khi lượt kia xong sẽ không tìm thấy. Không ảnh hưởng điều người dùng thấy.
  file: `docs/ai-ux.md`
  severity: low
  Đề xuất: known-limits

- **docs/chat-ui.md Rule 3 still says ProposedChange is built on Confirmation, but the default density now uses Item**
  Người dùng thấy gì: Một dòng trong tài liệu nội bộ vẫn nói đề xuất của Kara luôn dựng trên khung cũ, trong khi bản mặc định đã đổi. Chỉ gây hiểu nhầm cho người làm tiếp, không đổi gì trên màn.
  file: `docs/chat-ui.md`
  severity: low
  Đề xuất: known-limits

- **The AiFeedback spec checked ReUI but has no record of the AI Elements register check that chat-ui.md Rule 1 requires**
  Người dùng thấy gì: Bản thiết kế không ghi lại việc đã tra thư viện hội thoại trước khi dựng nút phản hồi mới. Người dùng không thấy khác biệt nào.
  file: `packages/ui/src/components/ai-feedback.tsx`
  severity: low
  Đề xuất: wont-fix

- **The proto measurement script hardcodes UI copy instead of reading it from messages**
  Người dùng thấy gì: Nếu sau này đổi chữ trên nút «Vì sao?» hay «Hoàn tác», phép kiểm tra màn sẽ báo đỏ giả. Người dùng không bị ảnh hưởng.
  file: `_acceptance/nen-kara/rang/man-proto.mjs`
  severity: low
  Đề xuất: known-limits

- **A signed eval for the OKR suggestion card now tests the inline layout instead of the card**
  Người dùng thấy gì: Bài kiểm tra cũ của cột góp ý OKR vẫn xanh nhưng nay kiểm bản gọn thay vì bản thẻ mà cột đó thật sự dùng, nên nếu bản thẻ hỏng thứ tự khối hay hàng nút thì có thể không ai báo.
  file: `packages/ui/test/proposed-change.dom.tsx`
  severity: medium
  Đề xuất: new-contract

- **Shape 4 (a negative assertion with no positive control): E10 checks that inline has no border or background, but never asserts that any inline element exists**
  Người dùng thấy gì: Phép kiểm tra màn có thể báo xanh dù trang không còn đề xuất gọn nào để kiểm, nên một hồi quy làm mất bản gọn có thể lọt qua mà không ai thấy.
  file: `_acceptance/nen-kara/rang/man-proto.mjs`
  severity: medium
  Đề xuất: new-contract

- **Shape 4 (a negative assertion with no positive control): the tom-tat 'send fails, rollback' case only checks that the final state equals the initial state**
  Người dùng thấy gì: Bài kiểm tra việc lùi lựa chọn khi gửi phản hồi lỗi chỉ xem trạng thái cuối giống ban đầu, nên nếu lựa chọn không bao giờ được hiện thì vẫn xanh. Người dùng có thể không bị ảnh hưởng, nhưng chưa được bảo chứng.
  file: `apps/app/test/nen-kara-man-cu.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 (no positive control): E3 claims a positive control on merge-base, but the cmd does not run it and it cannot pass**
  Người dùng thấy gì: Mô tả phép kiểm tra hứa có một lần đối chứng trên bản cũ nhưng thực tế không chạy lần đó, nên độ tin cậy của kết quả xanh thấp hơn cách nó được trình bày.
  file: `_acceptance/nen-kara/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 3 (asserting 'is present' when the promise is a relation): E10 promises catalog states == the UX-STATE-TABLE set, but the script only checks containment in one direction**
  Người dùng thấy gì: Phép kiểm tra các trạng thái trên trang mẫu có thể bỏ sót một trạng thái dư hoặc thiếu nếu cả bảng thiết kế lẫn danh mục cùng đổi, nên bộ ảnh bằng chứng có thể không đủ như đã hứa.
  file: `_acceptance/nen-kara/rang/man-proto.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/11 lỗi rơi vào file không bộ đo nào phủ (packages/ui/test/proposed-change.dom.tsx, _acceptance/nen-kara/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
