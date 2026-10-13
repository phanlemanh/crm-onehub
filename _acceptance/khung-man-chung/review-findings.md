## Trong hợp đồng

- **Hình dạng 4 (khẳng định âm tính đứng một mình, không đối chứng dương): bước 4 của chup-man.mjs không tạo trạng thái «lưu tệp tắt» và cũng không khẳng định nó, nên bước vẫn ra «đạt» ở trạng thái sai**
  file: `_acceptance/khung-man-chung/rang/chup-man.mjs:486`
  severity: high
  AC: AC-12
  source: measurement
  detail: E12 bước 4 khai «Tai lieu voi luu tep tat -> kmc-tailieu-dautrang-<kho>.png». Ở dòng 486–500 script chỉ mở /tai-lieu, chờ có một nút trong page-shell-actions rồi chạy kiemQuanHe. Nó không tắt kho lưu tệp (không gỡ BLOB, không chặn taiLieuNguon.trangThai) và không khẳng định [data-nguon-tat] hay nút «Tải nguồn lên» bị tắt. Ảnh bằng chứng kmc-tailieu-dautrang-375.png cho thấy đúng như vậy: nút «Tải nguồn lên» đang bật và không có dòng «Chưa bật lưu tệp nguồn». Bước 4 vì thế vẫn in «buoc 4: dat» khi trạng thái đã hứa không hề có. Thêm vào đó, phép đo jsdom của AC-10 dùng đầu trang tự dựng (xem finding kế tiếp), nên vị trí dòng lý do trên trang tai-lieu/page.tsx thật hiện không lớp nào đo.
  rationale: AC-12 yêu cầu ảnh và phép đo cho Tài liệu với lưu tệp tắt (dòng lý do cạnh nút tắt), nhưng bước chụp không tạo trạng thái đó nên ảnh bằng chứng là trạng thái bật.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nút giữ chỗ vẽ tay bằng Skeleton đổi góc ở chỗ gọi, chép lại 10 lần**
  Người dùng thấy gì: Chỗ giữ chỗ của nút «Thêm…» lúc đang tải được vẽ lặp lại ở nhiều màn. Người dùng thấy đúng, nhưng sau này đổi kích cỡ nút phải sửa nhiều nơi.
  file: `apps/app/app/(app)/[slug]/campaigns/create-campaign-sheet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Khung xương mới trong packages/ui tự vẽ hộp viền thay vì ghép Item hay khung bảng có sẵn**
  Người dùng thấy gì: Khung xương lúc tải tự vẽ viền và góc, nên nếu sau này đổi kiểu danh sách hay bảng thì khung chờ có thể lệch một chút so với nội dung thật.
  file: `packages/ui/src/components/khung-xuong.tsx`
  severity: low
  Đề xuất: known-limits

- **Khung xương phần thân màn chiến dịch nằm trong <header>**
  Người dùng thấy gì: Lúc chiến dịch đang tải, phần thân giữ chỗ nằm trong vùng đầu trang theo cách đánh dấu ngữ nghĩa, người dùng đọc màn hình có thể nghe cấu trúc trang hơi sai. Mắt thường không thấy khác biệt.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: low
  Đề xuất: known-limits

- **Dùng breadcrumb của Cài đặt cho màn ngoài Cài đặt**
  Người dùng thấy gì: Đường dẫn trên màn Chiến dịch và Tài liệu dùng chung thành phần mang tên «Cài đặt». Người dùng không thấy khác biệt, chỉ khiến người sửa sau dễ nhầm.
  file: `apps/app/app/(app)/[slug]/tai-lieu/duong-dan-tai-lieu.tsx`
  severity: low
  Đề xuất: wont-fix

- **Id lý do khoá nút: mỗi khu khai một kiểu**
  Người dùng thấy gì: Cách đặt tên liên kết giữa nút bị tắt và dòng lý do không thống nhất giữa các màn. Người dùng không bị ảnh hưởng.
  file: `apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx`
  severity: low
  Đề xuất: wont-fix

- **A campaign that doesn't exist shows a 'server didn't respond, try again' error**
  Người dùng thấy gì: Mở chiến dịch đã xoá hoặc gõ sai đường dẫn sẽ hiện «máy chủ không trả lời, thử lại», dù thử lại bao nhiêu lần cũng không có. Người dùng bị dẫn sai lý do.
  file: `apps/app/app/(app)/[slug]/campaigns/[campaignId]/campaign-detail.tsx`
  severity: medium
  Đề xuất: known-limits

- **When org.access fails to load, the Organisation buttons are disabled and the read-only reason is gone**
  Người dùng thấy gì: Nếu việc kiểm tra quyền ở trang Tổ chức bị lỗi, các nút Nhập và Thêm bộ phận bị tắt mà không có lời giải thích hay báo lỗi nào.
  file: `apps/app/app/(app)/[slug]/settings/organization/hanh-dong-dau-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **The NUT_GIU_CHO check scans the whole file when Suspense has no fallback, so it can pass when it shouldn't**
  Người dùng thấy gì: Bài kiểm tự động có thể bỏ sót nếu sau này ai đó xoá chỗ giữ chỗ của nút mà vẫn còn một vạch chờ ở chỗ khác. Hiện người dùng chưa bị ảnh hưởng.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): tai-lieu-nguon.dom.tsx tự đặt DongNguonTat ngoài PageShellActions rồi khẳng định nó nằm ngoài actions**
  Người dùng thấy gì: Bài kiểm tự động của dòng «Chưa bật lưu tệp nguồn» tự dựng đầu trang nên nếu trang thật đặt dòng này sai chỗ thì bài kiểm vẫn xanh.
  file: `apps/app/test/tai-lieu-nguon.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): E8/E9/E10 trong khung-man-chung.dom.tsx đo đầu trang tự dựng (DauTrangThu, DauTrangTaiLieu), không đo page.tsx thật**
  Người dùng thấy gì: Các bài kiểm tự động về dòng lý do dưới tiêu đề đo bản đầu trang dựng tay, không phải trang thật, nên đặt sai chỗ trên trang thật có thể không bị bắt.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (khẳng định thứ khác thay cho quan hệ đã hứa): màn chi tiết chiến dịch không so hàng breadcrumb giữa lúc tải và lúc xong**
  Người dùng thấy gì: Trên màn chiến dịch, đường dẫn phía trên có thể nhảy dòng giữa lúc tải và lúc xong mà phép đo không bắt được.
  file: `_acceptance/khung-man-chung/rang/chup-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo đầu vào thay vì đầu ra): ô LoiXem khẳng định data-trang-thai do chính bài kiểm truyền vào**
  Người dùng thấy gì: Bài kiểm tự động của khung lỗi Toàn cảnh OKR chỉ kiểm giá trị nó tự đưa vào, nên đổi mã trạng thái thật có thể không bị phát hiện. Người dùng không thấy khác biệt.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture không round-trip với writer): bảng hình khung-man-chung-hinh.json không được so lại với đầu ra của sinh-bang-hinh.mjs**
  Người dùng thấy gì: Bảng ghi hình khung chờ của từng màn có thể bị sửa tay lệch khỏi bản máy sinh mà bài kiểm không báo. Hiện hai bản đang khớp.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (kiểm có mặt ở bất kỳ đâu thay cho quan hệ Suspense → fallback): quetNutGiuCho lùi về quét cả tệp khi Suspense không có fallback**
  Người dùng thấy gì: Bài kiểm tự động chỗ giữ chỗ của nút «Thêm…» có thể cho qua nhầm trong một tình huống hiếm. Hiện người dùng không bị ảnh hưởng.
  file: `apps/app/test/khung-man-chung.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (đếm tổng thay cho quan hệ từng thẻ): ma trận khung-xuong ghi «the» là 2 thẻ × 3 hàng nhưng chỉ đếm tổng 6 hàng**
  Người dùng thấy gì: Bài kiểm tự động khung chờ dạng thẻ chỉ đếm tổng số vạch, nên một thẻ có thể thừa vạch, thẻ kia thiếu mà không bị bắt. Hiện hình hiển thị vẫn đúng.
  file: `packages/ui/test/khung-xuong.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên đếm lớp nhưng số đếm là hằng tự đúng): ca «loi» khẳng định ca.length = 3 trong khi E6 hứa đếm đúng 5 ô**
  Người dùng thấy gì: Bài kiểm tự động khung lỗi đếm một con số luôn đúng, nên bỏ sót một ô lỗi có thể không bị báo. Người dùng hiện không bị ảnh hưởng.
  file: `apps/app/test/khung-man-chung.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
