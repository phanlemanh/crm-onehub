---
schema_version: 1
slug: cua-toi-ba-phan
feature: Trưởng đơn vị mở Của tôi và thấy ngay KR cần cập nhật tuần này, đơn vị mình dẫn và KR mình phụ trách
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-15T03:58:04Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DH3
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH3 của «OKR» (`docs/plan/lo-trinh-okr.json`).

Trưởng đơn vị mở Của tôi và thấy ngay KR cần cập nhật tuần này, đơn vị mình dẫn và KR mình phụ trách

Vì sao: «Của tôi» hôm nay chỉ liệt kê mục tiêu người đó phụ trách; trưởng đơn vị không là người phụ trách mục tiêu nào thì thấy trang trống dù đang dẫn cả đơn vị. Cách làm phổ biến (Perdoo): OKR thuộc đơn vị, trưởng là người dẫn, «Của tôi» là hộp việc.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Trưởng đơn vị có gửi cập nhật tuần ngay trong «Của tôi», không phải sang trang hay thẻ khác, ở phần lớn lượt cập nhật của hai tuần đầu không?
- Kết quả nào là SỐNG: Trong 14 ngày kể từ ngày DH3 lên production, ít nhất 80 % phiên cập nhật tuần ĐÃ GỬI của người đang dẫn ít nhất một đơn vị là phiên mở và gửi trong «Của tôi» (kể cả phiên đến từ liên kết nhắc Zalo/chuông, vì liên kết đó sẽ đáp xuống «Của tôi»); và có ít nhất 10 phiên đã gửi của nhóm này trong cửa sổ.
- Kết quả nào là CHẾT: Dưới 80 % khi hết 14 ngày. Dưới 10 phiên đã gửi thì là «không đủ mẫu» — không đọc thành sống, gia hạn thêm 14 ngày một lần rồi đọc lại.
- Timebox: 14 ngày kể từ ngày DH3 gộp vào `onehub` và lên production; DH3 nằm trong mốc m-1020dh «OKR · Khu Mục tiêu dễ đi» (hoàn tất dự kiến 20/10/2026).

Bản ở hàng DH3 của lộ trình (để đối chiếu): «Trưởng đơn vị gửi cập nhật tuần từ «Của tôi» mà không mở thẻ khác, ở ít
nhất 80% lượt cập nhật của hai tuần đầu». Máy giữ nguyên con số 80 % và hai tuần, chỉ khai rõ ba thứ:

- **Đếm ở đâu.** Kho đã ghi mỗi lượt cập nhật tuần thành một dòng bảng `okrCheckInSession` (người, lối vào `entry`,
  giờ mở, giờ gửi, số giây — `apps/api/src/okr/okr-cap-nhat.service.ts`, `moCapNhat`/gửi). Lối vào hôm nay là
  `nhac` · `viec-cua-toi` · `tab` · `sheet` (`packages/validation/src/okr-cap-nhat.ts`), và cả bốn đều mở phiên ở
  trang riêng «Cập nhật tuần» hoặc ở ngăn một KR. Vòng này thêm một lối vào cho phiên mở ngay trong «Của tôi», nên
  tử số đọc thẳng từ bảng — không cần dựng công cụ đo mới. «Không mở thẻ khác» đọc là «phiên mở và gửi trong Của
  tôi»; người lướt sang thẻ khác rồi quay lại mà vẫn gửi ở Của tôi thì máy không phân biệt được — giới hạn đã khai.
- **Ai là trưởng đơn vị.** Người đang dẫn ít nhất một đơn vị trong cây tổ chức lúc phiên mở (cùng phép đọc «đơn vị
  người này dẫn» mà DH1 dùng để chọn đơn vị đích của nút tạo).
- **Sàn mẫu.** Một tổ chức ít trưởng đơn vị cho ra vài phiên mỗi tuần; 2/2 phiên là 100 % mà không nói gì. Sàn 10
  phiên là đề xuất của máy — chủ kho sửa được ở Cổng Đáng.

Chiều đỏ của phép đo: hôm nay KHÔNG có phiên nào mở trong «Của tôi» (lối «việc của tôi» dẫn sang trang «Cập nhật
tuần»), nên số nền là 0 % theo cấu tạo; ngưỡng đỏ được nếu trưởng đơn vị vẫn cập nhật từng KR qua ngăn chi tiết ở
Theo đơn vị (lối `sheet`) thay vì ở «Của tôi».

## Nguồn quyết định Cổng Đáng

Chủ kho gõ ở phiên thợ DH3 (máy M5) ngày 15/10/2026: «Build» — trả lời lời mời Cổng Đáng có dòng điền sẵn
«ngưỡng: theo đề xuất máy (≥80 % lượt đã gửi của trưởng đơn vị mở và gửi trong Của tôi, sàn 10 lượt) · đo 14 ngày
từ ngày lên production»; chủ kho không sửa ô nào nên ngưỡng giữ đúng bản đề xuất ở trên. `decided_at` là giờ phiên
thợ ghi lại lời đó.
