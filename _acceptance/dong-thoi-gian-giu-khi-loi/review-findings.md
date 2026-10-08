## Trong hợp đồng

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E3 không đo vị trí «phía trên» của thông báo làm mới**
  AC: AC-3
  file: `apps/app/test/dong-thoi-gian-giu-khi-loi.dom.tsx:248`
  severity: medium
  source: measurement
  detail: AC-3 hứa một quan hệ vị trí: thông báo «Không làm mới được hoạt động…» hiện PHÍA TRÊN danh sách hoặc trạng thái rỗng (card-plain AC-3 cũng ghi «kèm «Thử lại» phía trên»). Bài dtg-lam-moi chỉ khẳng định thông báo có mặt và đúng chữ: phai(khung() === null && thongBao("lam-moi") !== null) ở dòng 248-251, expect(chu(tb)).toContain(VI.timeline.lamMoiLoi) ở dòng 254, và ở ô rỗng chỉ có phai(thongBao("lam-moi") !== null) cùng includes(VI.timeline.empty.allTitle) ở dòng 288-289. Không có compareDocumentPosition hay phép so thứ tự nào giữa [data-dtg-loi=lam-moi] với li đầu tiên của [data-slot=timeline], hoặc với khối rỗng. Nếu thông báo bị đặt xuống cuối vùng cuộn (sau 30 dòng, ngoài khung nhìn) thì bài vẫn xanh. AC-6 lại nói rõ thông báo làm mới «chỉ đo bằng bài DOM (không chụp ảnh)», nên không có phép đo nào khác bắt quan hệ này.
  rationale: AC-3 hứa thông báo làm mới hiện «phía trên» danh sách hoặc trạng thái rỗng, và AC-6 nói rõ chỉ đo bằng bài DOM; bài DOM chỉ kiểm có mặt và đúng chữ nên quan hệ vị trí của AC-3 không được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cờ lỗi của TanStack giữ status "error" qua lượt tải sau, nên thông báo xem-cu / lam-moi bật sai lượt (báo lỗi khi request đang chạy, và tắt im lặng cảnh báo làm mới hỏng)**
  Người dùng thấy gì: Khi tab Hoạt động vừa báo lỗi làm mới rồi người dùng bấm «Xem cũ hơn» (hoặc ngược lại), thông báo lỗi có thể hiện sai lúc: báo «không tải được hoạt động cũ hơn» khi yêu cầu còn đang chạy, hoặc làm mất cảnh báo «không làm mới được» dù các hoạt động đầu danh sách chưa hề được làm mới.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E1/E6 không đo thông báo xem-cũ nằm ở cuối danh sách**
  Người dùng thấy gì: Nếu thông báo «Không tải được hoạt động cũ hơn» bị đặt nhầm lên đầu danh sách thay vì ở cuối, các kiểm tra tự động vẫn xanh; chỉ người xem ảnh chụp màn hình mới phát hiện ra.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca lẻ): vế «Thử lại tắt khi đang tải» chỉ đo ở ô xem-cũ**
  Người dùng thấy gì: Nút «Thử lại» của thông báo «Không làm mới được hoạt động» có thể không bị tắt khi đang tải mà không có kiểm tra tự động nào bắt được, nên bấm liên tiếp có thể gửi chồng yêu cầu.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
