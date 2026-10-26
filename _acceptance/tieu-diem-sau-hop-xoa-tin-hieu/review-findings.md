# Review findings: tieu-diem-sau-hop-xoa-tin-hieu (round 1)

## Trong hợp đồng

Không có phát hiện nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The new focus helper is only half adopted: the same selector for the row's ⋮ button now lives in two places**
  Người dùng thấy gì: Hiện nay tiêu điểm vẫn về đúng nút ⋮ sau mọi cách đóng hộp xoá. Chỉ có nguy cơ về sau: nếu ai đó đổi cách tìm nút này ở một nơi mà quên nơi kia, tiêu điểm sau khi xoá xong có thể lại rơi về đầu trang.
  Căn cứ: Người dùng chưa gặp lỗi nào, và nếu sau này có hỏng thì chỉ cần tải lại trang là dùng tiếp được; nên ghi lại chứ chưa cần mở việc riêng.
  file: `apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx`
  severity: low
  Đề xuất: known-limits

- **Boundary check passes silently when it compares zero files**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Nếu chạy lại phép kiểm ranh giới sau khi nhánh đã gộp, nó có thể báo đạt mà thực ra không xét tệp nào, nên người duyệt có thể tin nhầm là vùng cấm vẫn sạch.
  Căn cứ: Chỉ ảnh hưởng người chạy phép kiểm chứ không chạm dữ liệu hay màn hình của ai, và kết quả của lượt này đã đúng, nên chấp nhận và ghi lại là đủ.
  file: `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình): ô mất mạng kiểm «không lộ thông điệp máy chủ» bằng một chuỗi không bao giờ có mặt**
  Người dùng thấy gì: Khi mất mạng, người dùng vẫn thấy đúng câu «chưa xoá được» bằng ngôn ngữ đã chọn. Chỉ có một bài kiểm phụ không bắt được trường hợp sau này trang lộ thẳng thông báo lỗi kỹ thuật ra ngoài vùng đọc màn.
  Căn cứ: Hành vi hiện tại đúng và đã có bài kiểm chính giữ lời hứa này; rủi ro chỉ là bỏ sót một hồi quy hiếm gặp về sau.
  file: `apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): lỗi tRPC ráp tay, không đi qua bộ định dạng lỗi của máy chủ**
  Người dùng thấy gì: Người dùng không gặp lỗi nào. Bài kiểm tự động dùng lỗi dựng tay chứ không phải lỗi thật từ máy chủ, nên nếu máy chủ đổi cách báo lỗi thì bài kiểm này có thể vẫn xanh trong khi màn hình sai.
  Căn cứ: Phép đo bàn phím trên máy chủ thật đã bù phần này (chỉ cho tiếng Việt), và nếu hỏng thì người dùng chỉ thấy câu báo lỗi chung, thử lại được.
  file: `apps/app/test/tieu-diem-sau-hop-xoa-tin-hieu.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình): ranh-gioi.mjs báo ĐÚNG cả khi danh sách tệp rỗng**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng. Phép kiểm ranh giới có thể báo đạt khi không xét tệp nào, nếu chạy lại sau khi nhánh đã gộp.
  Căn cứ: Chỉ là công cụ kiểm nội bộ, kết quả lượt này đã đúng, và lỗi chỉ lộ khi chạy lại sau gộp; ghi lại là đủ.
  file: `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
