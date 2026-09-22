## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New regression test waits a fixed 20 ticks instead of for a condition, and its guard can pass before the error renders**
  Người dùng thấy gì: Bài kiểm tự động cho màn báo lỗi có thể báo "qua" dù màn thật chưa kịp hiện lỗi, nên một lỗi thật trên trang có thể không bị bắt lại ở lần kiểm sau.
  file: `apps/app/test/onboarding-giong-deals.dom.tsx`
  severity: low
  Đề xuất: known-limits

- **E14-network.txt says 'clean' after reading only 50 of 470 requests, none of them from API port 3001**
  Người dùng thấy gì: Nếu trang có lỗi gọi mạng thật (ví dụ tới máy chủ API), bằng chứng đã ghi "sạch" dù chưa đọc hết các yêu cầu mạng, nên lỗi đó có thể lọt qua mà không ai biết.
  file: `_acceptance/onboarding-giong-deals/evidence/E14-network.txt`
  severity: low
  Đề xuất: known-limits

- **E14-network.txt reports 'clean' after reading only 50 of 470 requests, with no onboarding or API-port traffic among them**
  Người dùng thấy gì: Bằng chứng ghi "sạch" nhưng mẫu đã xem không có yêu cầu nào từ chính trang 30 ngày đầu, nên một lỗi mạng thật trên trang này có thể chưa từng được kiểm mà vẫn được ký là qua.
  file: `_acceptance/onboarding-giong-deals/evidence/E14-network.txt`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): noi-bon-nut `nut-tren-thanh-cong-cu` khẳng định «dau trang=true» trên div do chính test dựng (r1)**
  Người dùng thấy gì: Bài kiểm tự động cho việc «nút Kế hoạch mới nằm ở đầu trang» có thể luôn báo đạt dù trang thật lỡ đặt sai vị trí sau này, vì bài kiểm tự dựng khối để đo trên chính nó thay vì đo trang thật — nghĩa là nếu vị trí nút bị đổi nhầm trong một lần sửa sau, bài kiểm này sẽ không bắt được.
  file: `apps/app/test/noi-bon-nut.dom.tsx`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/onboarding-giong-deals/evidence/E14-network.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.