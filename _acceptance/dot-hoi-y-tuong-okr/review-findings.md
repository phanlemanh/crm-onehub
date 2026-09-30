# Review findings: dot-hoi-y-tuong-okr (vòng 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The publish check passes raw DB strings for conclusion and draft link instead of parsed domain types**
  Người dùng thấy gì: Nếu một kết luận lưu trong dữ liệu bị hỏng hoặc sai giá trị, việc công bố có thể vẫn đi tiếp mà không báo lỗi. Với dữ liệu nhập qua màn hình hiện tại thì không gặp.
  file: `apps/api/src/okr/okr-hoi-y.service.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 4 — negative-only assertion, message not pinned: the soLieuHoiY rejection table checks only success=false and never checks the error path**
  Người dùng thấy gì: Bài kiểm tra giới hạn của các con số trong lần hỏi ý chỉ xác nhận là bị từ chối, không xác nhận từ chối vì lý do nào. Nếu quy tắc bị sửa nhầm, bài kiểm tra vẫn có thể xanh.
  file: `packages/validation/test/okr-hoi-y.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **capMode is a hand-written literal union instead of the type derived from CHE_DO_TRAN**
  Người dùng thấy gì: Hiện chỉ có hai chế độ trần mục tiêu và cả hai chạy đúng. Nếu sau này thêm chế độ thứ ba, bước công bố có thể không hiểu chế độ đó mà không có cảnh báo nào.
  file: `apps/api/src/okr/hoi-y.ts`
  severity: low
  Đề xuất: known-limits

- **The hỏi ý screen config re-declares the OKR timezone and time-unit bases instead of reusing the area config**
  Người dùng thấy gì: Múi giờ của khu OKR đang khai báo ở hai chỗ. Nếu sau này đổi múi giờ mà chỉ sửa một chỗ, màn Hỏi ý có thể hiển thị giờ lệch so với phần còn lại của OKR.
  file: `apps/app/app/(app)/[slug]/okr/hoi-y/man-hoi-y.ts`
  severity: low
  Đề xuất: known-limits

- **The CONTEXT.md entry still says the term is waiting for the Scope gate**
  Người dùng thấy gì: Từ điển sản phẩm vẫn ghi cụm từ Hỏi ý mục tiêu là đang chờ duyệt phạm vi, dù phạm vi đã được duyệt. Người đọc từ điển có thể tưởng các từ này chưa chốt.
  file: `CONTEXT.md`
  severity: low
  Đề xuất: known-limits

- **The default question keeps the first cycle's name after the admin picks a different cycle**
  Người dùng thấy gì: Khi có hai chu kỳ cùng ở giai đoạn lập kế hoạch và quản trị đổi chu kỳ trong hộp mở, câu hỏi mặc định vẫn nhắc tên chu kỳ đầu. Nếu không sửa tay trước khi bấm Mở, câu hỏi gửi cả công ty sẽ sai kỳ và không sửa lại được sau khi có ý đầu tiên.
  file: `apps/app/app/(app)/[slug]/okr/hoi-y/sheet-mo-hoi-y.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 2 — hand-written fixture shaped for the reader: the agent's hỏi ý reminder test builds okrHoiY, okrHoiYBanTruoc, okrChuDe and okrY rows with db.create and never goes through the write procedures**
  Người dùng thấy gì: Dòng nhắc buổi sáng gửi qua Zalo về Hỏi ý chỉ được thử trên dữ liệu dựng tay. Nếu cách ghi dữ liệu thật đổi hình dạng, bài kiểm tra vẫn xanh trong khi tin nhắc thật có thể sai.
  file: `apps/agent/test/support/okr-gieo.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
