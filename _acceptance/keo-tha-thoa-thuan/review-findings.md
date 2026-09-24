## Trong hợp đồng

(không có phát hiện nào map được vào AC.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **The two new board test files never run in `bun run test`, so the pre-push gate skips them**
    Người dùng thấy gì: Một số bài kiểm tra mới cho tính năng kéo thả có thể không tự chạy trước khi phát hành, nên nếu tính năng này hỏng sau này, lỗi có nguy cơ lọt ra ngoài mà không ai kịp phát hiện.
    file: `apps/app/package.json`
    severity: medium
    Đề xuất: known-limits

- **While a moved card is still saving, both columns show the wrong counts and the source column shows a phantom 'còn 1 thẻ'**
    Người dùng thấy gì: Trong lúc một thoả thuận vừa được kéo sang cột khác và chưa lưu xong, số lượng thẻ hiển thị ở đầu hai cột có thể tạm thời sai và xuất hiện dòng 'còn 1 thẻ' không có thật; tự hết ngay sau khi lưu xong.
    file: `apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 5: tuyên quét 3 ca nhưng chỉ chạy 2 (thiếu ca huỷ kéo)**
    Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng việc huỷ một thao tác kéo thả giữa chừng luôn hoạt động đúng như đã hứa, vì phần kiểm tra tương ứng chưa thực sự thử tình huống đó.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 1 + 5: lời báo cho trình đọc màn hình được đo trên kho chuỗi, không đo trên đầu ra của Board; phép đếm là hằng đúng**
    Người dùng thấy gì: Chưa có bằng chứng chắc chắn rằng lời thông báo cho người dùng trình đọc màn hình khi kéo thả thẻ thực sự đúng ngôn ngữ của màn hình, vì phép kiểm tra hiện tại không đo đúng thứ người dùng sẽ nghe.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 3: số trên đầu cột được kiểm bằng includes() trên cả chuỗi tiêu đề, và chữ số của tổng tiền cũng làm nó đúng**
    Người dùng thấy gì: Số lượng thẻ hiển thị ở đầu mỗi cột có thể bị sai mà không bị phát hiện, vì cách kiểm tra hiện tại đôi khi vẫn báo đúng ngay cả khi con số đó thực ra sai.
    file: `apps/app/test/keo-tha-thoa-thuan.dom.tsx`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4: not.toContain(lỗi thô) vô nghĩa vì lỗi thô không bao giờ được đưa vào thẻ**
    Người dùng thấy gì: Ở một tính năng khác (thẻ báo lỗi hội thoại của agent), chưa có bằng chứng chắc chắn rằng nội dung lỗi kỹ thuật thô không bao giờ bị lộ ra cho người dùng thấy.
    file: `apps/app/test/the-loi-hoi-thoai.dom.tsx`
    severity: medium
    Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có.)

⚠ Cụm ngoài vùng phủ: 2/6 lỗi rơi vào file không bộ đo nào phủ (apps/app/package.json, apps/app/test/the-loi-hoi-thoai.dom.tsx) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.