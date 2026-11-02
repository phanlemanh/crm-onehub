## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ô Phụ trách để trống khi okr.thanhVien đang tải hoặc lỗi, và lỗi tải không được báo**
  Người dùng thấy gì: Khi danh sách thành viên chưa tải xong hoặc tải lỗi, ô Phụ trách trong ngăn mục tiêu và ngăn KR hiện trống, không có tên người phụ trách và không có thông báo lỗi. Tải lại trang thường làm tên hiện lại.
  Căn cứ: Ô trống chỉ xuất hiện trong lúc tải chậm hoặc khi mất mạng, không làm mất hay sai dữ liệu, và người dùng tự gỡ được bằng cách tải lại; sửa nằm ngoài những gì hợp đồng đã hứa.
  file: `apps/app/components/crm/record-sheet/chi-tiet-okr.tsx`
  severity: medium
  Đề xuất: known-limits

- **Validation duplicates the shared schema's length limits as hand-copied constants instead of reusing mucTieuUpdate/krInput (r1)**
  Người dùng thấy gì: Hiện giới hạn độ dài tên và «Vì sao» ở ngăn khớp với máy chủ nên người dùng không thấy gì sai. Nếu sau này máy chủ đổi giới hạn mà ngăn không đổi theo, ngăn có thể chặn nhầm hoặc cho qua nhầm.
  Căn cứ: Hôm nay không ảnh hưởng người dùng; chỉ có rủi ro lệch khi giới hạn đổi, và sửa lúc đó rẻ.
  file: `apps/app/components/crm/record-sheet/truong-okr.ts`
  severity: medium
  Đề xuất: known-limits

- **The «Phụ trách» field on the KR sheet takes its people list from okr.thanhVien, while the objective sheet and the KR create/edit dialog use users.list (r1)**
  Người dùng thấy gì: Ở ngăn KR, danh sách người phụ trách lấy từ một nguồn khác với ngăn mục tiêu, và vẫn tải danh sách ngay cả khi người xem không được đổi người. Người dùng không thấy khác biệt rõ ràng, chỉ tốn thêm một lần tải.
  Căn cứ: Hậu quả nhẹ, chỉ là tải thừa và không nhất quán bên trong, không mất dữ liệu; gom về một nguồn có thể làm ở vòng dọn dẹp sau.
  file: `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận có ô trùng): KHOA năm ca thực ra chỉ có bốn ca khác nhau (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một trường hợp quyền «KR chỉ đọc nhưng vẫn sửa được mục tiêu» chưa được bài kiểm tự động kiểm riêng. Người dùng chưa gặp lỗi nào, chỉ là một tình huống hiếm có thể hỏng mà không ai báo sớm.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; bổ sung ca kiểm sau là việc rẻ.
  file: `apps/app/test/sua-tai-cho-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): mock useCrmCache.okr bỏ id và options, xoá cache mọi query (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tự động việc làm mới dữ liệu sau khi lưu dùng bản giả rộng hơn bản thật, nên nếu việc làm mới hỏng ở ngăn KR thì có thể không bị phát hiện. Hiện chưa có dấu hiệu người dùng thấy dữ liệu cũ sau khi lưu.
  Căn cứ: Người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu; chỉ là mức tin cậy của bài kiểm thấp hơn mong muốn.
  file: `apps/app/test/sua-tai-cho-okr.dom.tsx`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
