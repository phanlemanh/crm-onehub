# Review findings — soan-okr-trang-rieng (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The red-direction interceptor in man-so.mjs swallows its own fetch/parse errors and lets the real response through**
  Người dùng thấy gì: Trang soạn OKR không bị ảnh hưởng. Chỉ có phép thử mô phỏng lỗi dùng để kiểm bộ đo có thể im lặng chạy như bình thường khi nó tự gặp sự cố. Lúc đó người đọc báo cáo sẽ thấy phép thử đỏ không đỏ mà không biết vì sao.
  file: `_acceptance/soan-okr-trang-rieng/rang/man-so.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): ca «KR Kara vừa bỏ … không thành quyết định hoàn tác gửi Kara» chỉ đòi tên KR đã bỏ vắng mặt, không đối chứng dương**
  Người dùng thấy gì: Một ca kiểm tự động về việc hoàn tác Mục tiêu có thể vẫn xanh dù dòng ghi lại quyết định không hiện ra. Nếu sau này hoàn tác gửi nhầm một KR mà Kara vừa bỏ, ca này có thể không bắt được.
  file: `apps/app/test/soan-okr-trang.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **(r1) Soạn OKR page uses URL keys `tab` and `loc` outside SEARCH_PARAM, and both keys already belong to other features**
  Người dùng thấy gì: Ở màn hình hẹp, mở hoặc đóng một bản ghi bên cạnh có thể làm trang soạn nhảy từ tab Bản nháp về tab Trò chuyện, và tab của bản ghi có thể hiện sai.
  file: `apps/app/app/(app)/[slug]/okr/soan/cau-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **(r1) Failed group undo shows no error**
  Người dùng thấy gì: Khi bấm Hoàn tác trên biên nhận cả nhóm mà hệ thống từ chối hoặc mất mạng, màn hình không đổi và không có thông báo nào, nên người dùng tưởng đã hoàn tác mà thực ra chưa.
  file: `apps/app/app/(app)/[slug]/okr/soan/the-nhap.tsx`
  severity: medium
  Đề xuất: new-contract

- **(r1) Rejected or failed submissions still create a checkpoint and become the diff baseline**
  Người dùng thấy gì: Nếu Kara nộp bản nháp mà bị từ chối, hội thoại vẫn hiện mốc như đã nộp thành công, và lần nộp sau bị so với một bản chưa từng được lưu nên số liệu thay đổi hiển thị sai.
  file: `apps/app/app/(app)/[slug]/okr/soan/moc-nop.ts`
  severity: medium
  Đề xuất: new-contract

- **(r1) «Còn thiếu» buttons do nothing while the pending-only filter is on**
  Người dùng thấy gì: Khi đang bật chế độ chỉ xem dòng chờ, bấm vào mục Còn thiếu không có phản ứng gì, và người dùng không thấy cách tìm ô số còn thiếu cho tới khi tắt bộ lọc.
  file: `apps/app/app/(app)/[slug]/okr/soan/bang-nhap.tsx`
  severity: low
  Đề xuất: known-limits

- **(r1) Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): cau-noi-server soi regex trên mã nguồn trang soạn thay vì đo cờ TrangSoan nhận lúc chạy**
  Người dùng thấy gì: Một kiểm tra nội bộ xem trang soạn có truyền đúng cờ cấu hình Kara hay không chỉ đọc chữ trong mã nguồn nên có thể báo xanh dù cờ sai, hoặc báo đỏ dù trang vẫn chạy đúng.
  file: `apps/app/test/soan-okr-song-lai.spec.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
