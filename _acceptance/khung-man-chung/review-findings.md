# Review findings: khung-man-chung (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Skeleton mới bị ghi đè góc bằng className ở 10 chỗ gọi (rounded-md thay cho rounded-sm mặc định)**
  Người dùng thấy gì: Chỗ giữ chỗ cho nút «Thêm…» lúc đang tải bo góc hơi khác mặc định của bộ giao diện chung. Người dùng gần như không thấy khác biệt, nhưng về sau sửa kiểu dáng sẽ phải sửa ở nhiều nơi.
  file: `apps/app/app/(app)/[slug]/campaigns/create-campaign-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Khung xương của cả thân trang nằm bên trong <header> của PageShellHeader**
  Người dùng thấy gì: Ở trang chi tiết chiến dịch, phần khung giả lúc đang tải được đặt chung với đầu trang nên có thể chuyển cảnh theo đầu trang. Người dùng có thể thấy hiệu ứng chuyển trang hơi lạ trong lúc chờ.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: low
  Đề xuất: known-limits

- **PageShellNote chép nguyên chuỗi class của PageShellDescription và được xuất ở hai nơi**
  Người dùng thấy gì: Dòng giải thích dưới tiêu đề hiện đúng như mong muốn. Chỉ là mã bên dưới chép lại kiểu dáng của câu mô tả, nên sau này đổi một nơi có thể lệch nơi kia.
  file: `apps/app/components/page-shell-note.tsx`
  severity: low
  Đề xuất: known-limits

- **Chiến dịch không tồn tại hoặc không có quyền bị báo là «Máy chủ không trả lời», kèm nút Thử lại không bao giờ có tác dụng**
  Người dùng thấy gì: Mở chiến dịch đã xoá hoặc gõ sai đường dẫn sẽ hiện câu «Máy chủ không trả lời», dù thật ra là không tìm thấy hoặc không có quyền. Bấm Thử lại không giúp được gì.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lỗi đọc quyền org.access giờ khoá nút mà không có dòng nói vì sao (trước đây có câu «chỉ đọc»)**
  Người dùng thấy gì: Nếu hệ thống không đọc được quyền ở trang Tổ chức, hai nút Nhập và Thêm đơn vị bị khoá mà không có lời giải thích. Người dùng sẽ không biết vì sao không bấm được.
  file: `apps/app/app/(app)/[slug]/settings/organization/hanh-dong-dau-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có mặt thay cho quan hệ): ca dau-trang của E7 không so giá trị order của mô tả với order của nút dưới md**
  Người dùng thấy gì: Bài kiểm tự động chưa bắt được trường hợp ai đó đổi thứ tự câu mô tả và nút ở đầu trang trên điện thoại. Giao diện hiện tại vẫn đúng và bài đo trên màn thật vẫn kiểm điều này.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): chiều đỏ của E15 dùng một component tự dựng (ThayKhiLoi) thay vì bản campaign-detail.tsx đã đổi**
  Người dùng thấy gì: Bài kiểm tự động chưa chắc bắt được lỗi nếu sau này ai đó sửa nhầm cách trang chiến dịch xử lý lỗi tải. Giao diện hiện tại không bị ảnh hưởng.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định có mặt thay cho quan hệ): kiemKhungXuong chỉ kiểm có ít nhất một phần tử aria-hidden, không kiểm các vạch nằm trong nó**
  Người dùng thấy gì: Bài kiểm tự động chưa đảm bảo mọi vạch của khung chờ tải đều được ẩn khỏi trình đọc màn hình nếu sau này có người sửa. Hiện tại khung chờ vẫn ẩn đúng.
  file: `packages/ui/test/khung-xuong.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): vòng aria-labelledby của muc-nhac qua rỗng khi không có section nào**
  Người dùng thấy gì: Bài kiểm tự động chưa bắt được trường hợp hai mục Zalo và Kênh ở trang Nhắc buổi sáng mất liên kết với tiêu đề của chúng. Trang hiện tại vẫn đúng.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
