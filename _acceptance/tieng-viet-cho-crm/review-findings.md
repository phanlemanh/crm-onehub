# Kết quả soát vòng ①, vòng chấm 2 — 2026-09-02

## Ngoài hợp đồng

Lỗi thật, tìm ra trong lúc nghiệm thu, nằm ngoài bộ tiêu chí đã duyệt.

- **Mọi trang mất khả năng dựng sẵn, không riêng trang đăng nhập**
  file: `apps/app/app/layout.tsx:47`
  severity: cao
  Người dùng thấy gì: mỗi trang phải chờ máy chủ dựng lại từ đầu, không trang nào phục vụ được từ bản dựng sẵn — trang mở chậm hơn ở mọi màn, không chỉ màn đăng nhập.
  Đề xuất: mở hợp đồng mới — đo lại giá thật rồi chọn giữa bọc chỗ đọc cookie trong một vùng chờ, hay chấp nhận giá và ghi đúng vào hợp đồng.

- **Cột trạng thái có nhãn tiếng Việt nhưng ô tiếng Anh, và hai chữ không cùng nghĩa**
  file: `apps/app/lib/enrichment-status.ts:10`
  severity: trung bình
  Người dùng thấy gì: tiêu đề cột đọc "Bổ sung dữ liệu" còn ô dưới nó đọc "Not researched" — nửa Việt nửa Anh trong cùng một cột, và "đã tra cứu" không phải là "bổ sung".
  Đề xuất: mở hợp đồng mới — năm nhãn trạng thái này là nhãn ứng dụng, thuộc vòng ③.

- **Chữ thời gian tương đối vẫn tiếng Anh**
  file: `apps/app/components/local-date-time.tsx`
  severity: trung bình
  Người dùng thấy gì: một công ty vừa có hoạt động sẽ hiện "just now", "2h ago", "in 3d" giữa màn tiếng Việt. Dữ liệu thử không có công ty nào như vậy nên không phép đo nào của vòng này chạm tới.
  Đề xuất: mở hợp đồng mới — chúng là chuỗi chứ không phải định dạng, nên đi cùng vòng ③.

- **Nhãn "Bổ sung dữ liệu" gọi tên một năng lực chưa có mục từ**
  file: `CONTEXT.md`
  severity: thấp
  Người dùng thấy gì: chưa thấy gì sai trên màn, nhưng từ điển sản phẩm chưa định nghĩa việc "bổ sung dữ liệu" là gì, nên vòng sau dễ đặt một cái tên khác cho cùng thứ đó.
  Đề xuất: nâng phạm vi sửa ngay — thêm một mục từ, việc năm phút.

- **Hai cột đếm cạnh nhau khó phân biệt khi bị cắt ở khổ hẹp**
  file: `apps/app/lib/messages/companies.ts`
  severity: thấp
  Người dùng thấy gì: ở 1024px hai tiêu đề hiện "Số lượn…" và "Số thoả thu…"; ở 768px cột cá nhân bị ẩn hẳn mà không có dấu hiệu nào báo là đang ẩn.
  Đề xuất: mở hợp đồng mới — cách chữa là nới bề rộng cột chứ không phải rút nhãn, và bề rộng cột thuộc vòng ③.
