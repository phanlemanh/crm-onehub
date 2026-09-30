## Trong hợp đồng

- **Hình dạng 3 (có mặt thay vì QUAN HỆ): E12 bỏ hẳn lanTraLaiTruoc.luc, không so với dòng vết**
  file: `apps/api/test/okr-ux-8d.spec.ts:578`
  severity: medium
  AC: AC-9
  source: measurement
  detail: E12 hứa lanTraLaiTruoc toEqual {lyDo L1, nguoi người trả, luc đúng dòng vết}. Phần luc là quan hệ giữa hai giá trị: thời điểm trả về phải bằng trường `at` của dòng okrTrail tra-lai tương ứng. Nhưng bài chỉ chụp `[lan2.lyDo, lan2.nguoi?.id]` và `[lan3...lyDo, ...nguoi?.id]`, và không đọc trường `at` của dòng tra-lai nào trong trail. Hệ quả: nếu bộ dựng lấy luc của dòng gui-duyet, hay trả `new Date()`, bài vẫn xanh. Phần nối lý do/người với dòng vết được đo, còn phần nối thời điểm với dòng vết thì không.
  rationale: AC-9 đòi rõ lần trả lại trước mang đúng lý do, người trả lại và thời điểm; bài kiểm không đo thời điểm nên phần này của AC không được chứng minh.

- **Hình dạng 3 (có mặt thay vì QUAN HỆ): E1 lấy tập 'giới hạn xem được' từ chính đầu ra, không tính bằng xemDuocMucTieu**
  file: `apps/api/test/okr-ux-8d.spec.ts:211`
  severity: medium
  AC: AC-1
  source: measurement
  detail: E1 hứa tập id giới hạn của mỗi ô toEqual tập mục tiêu giới hạn người đó xem được, tính bằng xemDuocMucTieu trên cùng dữ liệu, không viết tay. Trong bài, `nen = muc.filter((m) => gioiHan.has(m.id))` lọc ngay danh sách thủ tục vừa trả, rồi so `coGioiHan` với `nen`. Phép so này chỉ kiểm cờ hienThi của các mục đã có trong danh sách khớp với cột trong DB. Nó không kiểm danh sách có chứa đúng những mục giới hạn người đó được xem. Vì `nen` rút từ đầu ra, một danh sách thiếu mục giới hạn hay chứa mục người đó không được xem vẫn có `lech 0`. Phần 'xem được' chỉ còn đỡ bằng con số kyVong viết tay trong MA_TRAN, đúng thứ eval nói không dùng. Không có lời gọi xemDuocMucTieu nào trong bài.
  rationale: AC-1 đòi tập mục giới hạn trong mỗi danh sách bằng đúng tập mục giới hạn người đó xem được; bài kiểm lấy tập chuẩn từ chính đầu ra nên không chứng minh được điều AC đòi.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The archive-block dialog now shows the server's Vietnamese-only error sentences instead of the app's bilingual copy**
  Người dùng thấy gì: Khi dùng giao diện tiếng Anh, hộp lưu trữ phòng ban hiện tiêu đề tiếng Anh nhưng câu giải thích lý do chặn lại bằng tiếng Việt. Tên khuôn mẫu trong câu đó cũng có thể bị trình duyệt tự dịch sai.
  file: `apps/api/src/to-chuc/to-chuc.service.ts`
  severity: high
  Đề xuất: new-contract

- **The approver's name is joined into a plain string in the submit-for-approval dialog, so it cannot be marked translate="no"**
  Người dùng thấy gì: Trong hộp gửi duyệt, tên người duyệt có thể bị trình duyệt tự dịch nếu người dùng bật dịch tự động, trong khi các dải thông báo khác thì không bị.
  file: `apps/app/components/crm/record-sheet/objective-duyet.tsx`
  severity: medium
  Đề xuất: known-limits

- **Archive check shows a cached, out-of-date block reason, and keeps showing it if the recheck fails**
  Người dùng thấy gì: Sau khi chuyển hết OKR khỏi một phòng ban, mở lại hộp lưu trữ có thể vẫn hiện lý do cũ «còn mục tiêu» trong chốc lát. Nếu lần kiểm lại bị lỗi mạng, hộp có thể giữ lý do cũ, khoá nút Lưu trữ và không báo là chưa kiểm được.
  file: `apps/app/app/(app)/[slug]/settings/organization/xac-nhan-luu-tru.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp): E10 PHẦN 1 kiểm số ô bằng một phép so tự quy chiếu**
  Người dùng thấy gì: Nếu sau này có phòng ban chưa xếp vào khối nào, bài kiểm số nhãn Giới hạn theo đơn vị sẽ không soi tới phòng ban đó. Hiện tại với dữ liệu mẫu thì chưa có sai lệch nào.
  file: `apps/api/test/okr-ux-8d.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): E2 kiểm nhãn trên cây 'không tabindex' mà không có đối chứng dương**
  Người dùng thấy gì: Nếu sau này nhãn Giới hạn trên cây đơn vị vô tình trở thành phần tử nhận phím Tab, bài kiểm hiện tại có thể không báo. Người dùng bàn phím sẽ phải Tab qua thêm một điểm dừng thừa.
  file: `apps/app/test/okr-theo-don-vi.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (có mặt thay vì con số): E15 kiểm cây Pháp chế bằng includes("3 mục tiêu")**
  Người dùng thấy gì: Phép đo trên màn thật có thể chấp nhận nhầm nếu cây đơn vị Pháp chế ghi 13 hay 23 mục tiêu thay vì 3. Số hiển thị sai kiểu đó có thể lọt qua bước đo bằng mắt máy.
  file: `_acceptance/ux-lai-thu-8c-okr/rang/man-ux-8d.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
