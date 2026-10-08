# Review findings: dong-thoi-gian-giu-khi-loi (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Clicking «Xem cũ hơn» after a refresh error immediately shows the «couldn't load older» error while the request is still loading**
  Người dùng thấy gì: Khi tab Hoạt động đang báo không làm mới được rồi người dùng bấm «Xem cũ hơn», trong lúc đang tải họ có thể thấy ngay dòng «Không tải được hoạt động cũ hơn» dù phần cũ chưa hề lỗi. Nếu tải thành công thì dòng này tự biến mất, nên chỉ là một thông báo sai thoáng qua.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: known-limits

- **A background refetch after a failed «Xem cũ hơn» briefly shows the «couldn't refresh» banner even though no refresh has failed**
  Người dùng thấy gì: Sau khi «Xem cũ hơn» bị lỗi, nếu danh sách tự làm mới ngầm, người dùng có thể thấy tạm dòng «Không làm mới được hoạt động» dù lần làm mới đó chưa lỗi. Làm mới thành công thì dòng này mất, danh sách vẫn nguyên.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: known-limits

- **man.mjs drops every console error for the whole measured page, not just the expected BAD_REQUEST**
  Người dùng thấy gì: Phép kiểm tra tự động trên màn Hoạt động bỏ qua mọi lỗi ghi ra ở trình duyệt, không chỉ lỗi cố ý gây ra, nên một lỗi lạ khác trên màn này có thể lọt qua mà không ai được báo. Người dùng cuối không thấy ảnh hưởng trực tiếp.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E6 bước 1 khai «dòng cuối (số 35) trong khung nhìn» nhưng chỉ đếm 35 dòng và một cận dưới, không khẳng định dòng cuối là số 35 (r2)**
  Người dùng thấy gì: Sau khi bấm «Thử lại», máy chỉ đếm đủ số dòng chứ chưa kiểm dòng cuối đúng là hoạt động cũ nhất. Nếu trang cũ hơn bị nối nhầm lên đầu danh sách, phép đo tự động vẫn báo đạt và chỉ người nhìn ảnh mới phát hiện.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Cờ lỗi của TanStack giữ status "error" qua lượt tải sau, nên thông báo xem-cu / lam-moi bật sai lượt (báo lỗi khi request đang chạy, và tắt im lặng cảnh báo làm mới hỏng) (r1)**
  Người dùng thấy gì: Khi tab Hoạt động vừa báo lỗi làm mới rồi người dùng bấm «Xem cũ hơn» (hoặc ngược lại), thông báo lỗi có thể hiện sai lúc: báo «không tải được hoạt động cũ hơn» khi yêu cầu còn đang chạy, hoặc làm mất cảnh báo «không làm mới được» dù các hoạt động đầu danh sách chưa hề được làm mới.
  file: `apps/app/components/crm/timeline/timeline.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 (chuỗi có mặt thay cho quan hệ): E1/E6 không đo thông báo xem-cũ nằm ở cuối danh sách (r1)**
  Người dùng thấy gì: Nếu thông báo «Không tải được hoạt động cũ hơn» bị đặt nhầm lên đầu danh sách thay vì ở cuối, các kiểm tra tự động vẫn xanh; chỉ người xem ảnh chụp màn hình mới phát hiện ra.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có ca lẻ): vế «Thử lại tắt khi đang tải» chỉ đo ở ô xem-cũ (r1)**
  Người dùng thấy gì: Nút «Thử lại» của thông báo «Không làm mới được hoạt động» có thể không bị tắt khi đang tải mà không có kiểm tra tự động nào bắt được, nên bấm liên tiếp có thể gửi chồng yêu cầu.
  file: `_acceptance/dong-thoi-gian-giu-khi-loi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
