# Review findings: hop-tuan-mo-dung-bo (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Schema quyền ở packages/validation chép lại okrAccessOutput của API, nên hai bản sẽ lệch nhau**
  Người dùng thấy gì: Hiện nay Họp tuần vẫn mở đúng bộ cho từng người. Nhưng nếu sau này phần quyền ở máy chủ đổi hình dạng mà phía trang không đổi theo, việc tự chuyển về bộ của mình có thể tắt đi mà không ai được báo.
  Căn cứ: Hiện chưa gây hại cho người dùng, chỉ là rủi ro lệch về sau và nếu lệch thì người dùng chỉ mất việc tự chuyển bộ (vẫn vào được bộ bằng tay); sửa lúc nào cũng rẻ.
  file: `packages/validation/src/okr-bo-hop-tuan.ts`
  severity: medium
  Đề xuất: known-limits

- **page.tsx gọi fetchQuery cho access và cây tổ chức mà không bắt lỗi, khác cách proxy và các trang cùng khu xử lý lỗi**
  Người dùng thấy gì: Khi hệ thống không đọc được quyền hay cây tổ chức của người xem, cả trang Bộ OKR hiện màn lỗi thay vì mở một bộ mặc định. Người dùng tải lại là vào được.
  Căn cứ: Hợp đồng chủ ý không cho trang âm thầm mở bộ OneHub khi lỗi, nên màn lỗi là hậu quả nhẹ, người dùng tự gỡ bằng cách tải lại, và chỉ xảy ra khi máy chủ đang trục trặc.
  file: `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **okr:mau xoá ca Họp tuần theo tiền tố tên hiển thị ở mọi lần chạy, trước bước kiểm OKR thật**
  Người dùng thấy gì: Lệnh nạp dữ liệu mẫu có thể xoá nhầm một chu kỳ hoặc phòng ban do người dùng tự đặt tên bắt đầu bằng «Ca Họp tuần» trên máy dev hoặc máy đo. Môi trường thật không bị ảnh hưởng vì lệnh bị chặn ở đó.
  Căn cứ: Chỉ chạm môi trường dev và đo, không chạm dữ liệu khách; dữ liệu mất là dữ liệu thử, và trùng tên đúng tiền tố là hiếm.
  file: `apps/api/scripts/okr-mau/lenh.ts`
  severity: low
  Đề xuất: known-limits

- **Hai khoá message thôi dùng được thêm vào danh sách miễn của guard thay vì xoá**
  Người dùng thấy gì: Hai câu chữ cũ của dòng tóm tắt tuần vẫn nằm trong kho chữ dù màn đã không còn dùng. Người dùng không thấy gì khác.
  Căn cứ: Không có hậu quả nào với người dùng, chỉ là rác nhỏ trong mã; dọn lúc nào cũng được và chi phí mở việc riêng vượt lợi ích.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Lặp helper ngày: ngayThang có hai bản trong cùng thư mục, NGAY_MS khai thêm một lần nữa**
  Người dùng thấy gì: Cách đổi ngày sang dạng ngày/tháng được viết hai lần ở hai nơi của màn Họp tuần. Người dùng vẫn thấy ngày đúng.
  Căn cứ: Không ảnh hưởng người dùng, hai bản cho cùng kết quả; sửa sau rẻ nhưng cũng không đáng mở việc riêng.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: low
  Đề xuất: wont-fix

- **HopTuan nuốt lỗi của truy vấn okr.cycles (và org.tree): mất hàng số, sai lý do rỗng, câu có tên trống**
  Người dùng thấy gì: Nếu việc tải danh sách chu kỳ hoặc cây tổ chức bị lỗi, màn Họp tuần lặng lẽ mất hàng bốn số, có thể báo sai lý do trống, và câu «chưa có KR công bố trong …» hiện thiếu tên bộ hoặc tên chu kỳ. Không có thông báo lỗi hay nút thử lại.
  Căn cứ: Người dùng thấy màn thiếu chữ và dễ hiểu nhầm nhưng không mất dữ liệu, chỉ xảy ra khi hệ thống lỗi và tải lại thường khỏi; sửa không đắt nên nên đăng thành việc riêng nếu chủ kho muốn.
  file: `apps/app/app/(app)/[slug]/okr/hop-tuan.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ô goc của htmb-chua-kr chèn tay 4 hàng toanCanh, nên «theo thứ tự cây» thành phép đo tự đúng**
  Người dùng thấy gì: Bài kiểm danh sách «Đơn vị có KR» dựng dữ liệu bằng tay, nên nếu thứ tự đơn vị trên màn thật bị đảo thì bài kiểm vẫn báo đạt. Màn hiện nay vẫn hiển thị đúng.
  Căn cứ: Không làm người dùng gặp lỗi ngay, chỉ làm lưới an toàn lỏng hơn cho lần sửa sau; củng cố bài kiểm lúc nào cũng được.
  file: `apps/app/test/hop-tuan-mo-dung-bo.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): bẫy MutationObserver «dòng vị trí không mang tên gốc» không có đối chứng dương**
  Người dùng thấy gì: Phép đo xác nhận dòng vị trí không từng hiện tên bộ gốc có thể báo đạt dù công cụ bắt lỗi hỏng, nên có thể bỏ sót một lần nháy sai tên bộ. Người dùng thật chưa bị ảnh hưởng.
  Căn cứ: Rủi ro là bỏ sót một lần nháy tên sai thoáng qua, tác hại nhỏ và tự hết khi tải lại; gia cố phép đo rẻ và làm lúc nào cũng được.
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng thiếu ma trận viết trước): khong-doi-hinh.mjs không có sàn hay danh sách mong đợi, nên lớp rỗng vẫn kết luận «dat»**
  Người dùng thấy gì: Công cụ kiểm không-đổi-hình có thể báo «đạt» ngay cả khi vì lỗi nào đó nó không quét được hồ sơ nào. Người dùng không thấy gì.
  Căn cứ: Chỉ làm lỏng công cụ kiểm nội bộ chứ không chạm người dùng, và lỗi lớn kiểu này sẽ lộ ra ở các eval khác của từng hồ sơ.
  file: `_acceptance/hop-tuan-mo-dung-bo/rang/khong-doi-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
