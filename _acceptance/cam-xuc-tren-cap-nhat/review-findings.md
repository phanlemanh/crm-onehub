# Review findings: cam-xuc-tren-cap-nhat (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 (fixture/cấu hình viết tay đúng khuôn bên đọc): ca «loai la doc tu co so du lieu nem loi» tự dựng `cach.docLoai` thay vì đi qua đường của dịch vụ**
  Người dùng thấy gì: Nếu sau này có người sửa khiến màn bỏ qua im lặng một loại cảm xúc lạ trong dữ liệu, bài kiểm hiện tại vẫn xanh và không báo. Hiện chưa có lỗi nào người dùng nhìn thấy, chỉ là lưới an toàn cho trường hợp dữ liệu hỏng này mỏng hơn vẻ ngoài.
  Căn cứ: Không ảnh hưởng người dùng ở thời điểm này và không làm mất dữ liệu; chỉ là bài kiểm kém chắc, nên ghi lại như một hạn chế đã biết thay vì mở thêm việc.
  file: `apps/api/test/okr-cam-xuc.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Cột okrCamXuc.loai đọc từ DB không được parse; giá trị lạ bị bỏ qua im lặng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Hôm nay mọi cảm xúc đều được ghi qua đường kiểm chặt nên người dùng không thấy gì sai. Nếu sau này đổi hay bỏ một loại cảm xúc, những cảm xúc cũ thuộc loại đó sẽ lặng lẽ biến mất khỏi số đếm mà không báo lỗi.
  Căn cứ: Chưa gây hại cho ai lúc này, chỉ phát sinh khi sau này đổi bộ cảm xúc, và lúc đó sửa kèm là rẻ.
  file: `packages/db/src/okr-cam-xuc.ts`
  severity: low
  Đề xuất: known-limits

- **Clicks inside the reaction popover reach the row's click handler and open the KR sheet on the Recent updates screen (r1 · tệp đã đổi)**
  Người dùng thấy gì: Ở màn Cập nhật gần đây, khi đang đọc danh sách tên người đã thả cảm xúc trong bảng, chạm vào chỗ không phải nút có thể làm ngăn chi tiết KR bật ra giữa chừng. Người dùng đóng ngăn đó rồi mở lại bảng là đọc tiếp được.
  Căn cứ: Gây phiền khi đọc tên chứ không mất hay lộ dữ liệu, người dùng tự đóng ngăn và thử lại được.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-gan-day/dong-tin.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert có mặt thay cho quan hệ): ca cx-tha không phân biệt được thứ tự LOAI_CAM_XUC với thứ tự theo số giảm (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sản phẩm vẫn xếp các cảm xúc dưới một lần cập nhật theo thứ tự cố định, nhưng bài kiểm hiện không bắt được nếu sau này ai đó đổi sang xếp theo số người. Khi đó người dùng sẽ thấy thứ tự chip nhảy lung tung.
  Căn cứ: Chưa sai với người dùng hôm nay, chỉ là lưới bảo vệ về sau còn hở, và bổ sung ca kiểm là việc rẻ.
  file: `apps/api/test/okr-cam-xuc.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận viết trước): lệnh cx_quyen chạy ma-tran-trpc, mà tập so sánh của bài đó rút từ chính router; danh sách viết tay chứa okr.thaCamXuc nằm ở bài sang-kien-an không được chạy (r1)**
  Người dùng thấy gì: Việc người mang vai chỉ OKR thả được cảm xúc vẫn có bài kiểm, nhưng lệnh nghiệm thu đã khai không chạy bài đó. Nếu sau này quyền này bị đổi nhầm, lượt nghiệm thu có thể vẫn xanh.
  Căn cứ: Quyền hiện đúng và có bài kiểm riêng, chỗ hở chỉ ở lệnh nghiệm thu, không ảnh hưởng người dùng hôm nay.
  file: `apps/api/test/vai-chi-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
