# Review Findings — okr-soat-anh-luot-3 (round 2)

## Trong hợp đồng

(không có finding nào đã map được vào AC ở round này.)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **do-man.mjs re-derives the cycle suggestion (timezone, 3 months/quarter, 4 quarters) inline instead of importing OKR_CHU_KY / goiYChuKy**
  Người dùng thấy gì: Neu sau nay cong thuc tinh ten goi y chu ky duoc chinh sua, phep kiem man hinh cu co the khong phat hien ra va nguoi dung co the thay goi y ten chu ky sai ma khong ai biet truoc khi phat hanh.
  file: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **A red error stripe is invisible on rows that are both clickable and invalid**
  Người dùng thấy gì: Neu sau nay mot bang vua cho phep bam vao dong vua can danh dau dong loi, nguoi dung co the khong nhin thay dau hieu dong hong tru khi dang re chuot dung vao dong do.
  file: `packages/ui/src/lib/row-accent.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng không có ma trận viết trước): ma trận «lop-o-cho-goi» của soi-ma.mjs không có số đếm độc lập, đối chứng đếm là hằng đúng**
  Người dùng thấy gì: Neu phep do tu dong bo sot mot so thanh phan giao dien can kiem, mot kieu chinh sua mau sac hoac khoang cach thu cong co the lot vao san pham ma khong ai phat hien.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): E12 chấm «design-gate mã 0» mà lệnh S4 không chạy đối chứng dương --pha**
  Người dùng thấy gì: Luot kiem nay moi chung minh khong co loi thiet ke bi bat, chu chua chung minh cong cu kiem that su phat hien duoc loi khi co; neu cong cu kiem bi hong ngam, mot loi tuong phan mau co the lot qua ma khong ai biet.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt trong khi lời hứa là quan hệ): dong-ho-page chỉ kiểm page.tsx có gọi homNayVn và goiYChuKy**
  Người dùng thấy gì: Phep kiem nay khong dam bao chac chan ngay gio tinh o may chu luon duoc dua dung vao o goi y ten chu ky; neu co sai lech, nguoi dung co the thay goi y ten chu ky khong khop voi ngay that ma khong bi phat hien truoc khi phat hanh.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **New code hardcodes the Vietnam timezone again and rewrites the existing ngayVN helper (r1)**
  Người dùng thấy gì: Nếu sau này một người sửa cách tính giờ Việt Nam ở chỗ này mà quên sửa chỗ kia, ngày dùng để gợi ý tên chu kỳ trên màn có thể lệch với ngày hệ thống thật sự dùng để tạo chu kỳ, khiến gợi ý sai lệch âm thầm.
  file: `apps/app/lib/okr-chu-ky-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Chuỗi mục tiêu dài của lô thử có 119 ký tự, trong khi hợp đồng và eval E1 ghi là ≥ 120 (r1)**
  Người dùng thấy gì: Dữ liệu thử cho trường hợp mục tiêu tên rất dài ngắn hơn một chút so với mức đã ghi, nhưng không làm đổi kết quả xem trước, nên người dùng không bị ảnh hưởng.
  file: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 — dong-ho-page chỉ soi tên hàm có mặt, không soi quan hệ «giá trị gợi ý tính ở server được truyền xuống» (r1)**
  Người dùng thấy gì: Bằng chứng kiểm tra hiện chỉ xác nhận hai bước tính ngày có được gọi tới, chứ chưa chắc chắn giá trị đó thật sự tới được đúng ô hiển thị; nếu sau này ô đó vô tình hiển thị sai hoặc bị gán cứng, bằng chứng vẫn có thể báo đạt.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — E12 «design-gate mã 0» đứng một mình: lệnh đo không chạy đối chứng --pha (r1)**
  Người dùng thấy gì: Bằng chứng khẳng định giao diện không vi phạm quy tắc thiết kế hiện không kèm phép thử đối chứng trong chính lượt đo tự động, nên nếu cổng kiểm tra thiết kế sau này bị hỏng âm thầm, lượt đo vẫn có thể báo đạt như bình thường.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng pha-lop đi đường khác đường đo thật: OSA_TEP tắt phần phân loại theo dòng đổi (r1)**
  Người dùng thấy gì: Phép thử đối chứng cho phần phân loại lỗi cũ/mới hiện đi một đường tắt khác với đường đo thật, nên nếu phần phân loại đó xếp nhầm một lỗi mới thành lỗi có sẵn, phép thử đối chứng sẽ không phát hiện ra.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — ma trận cột của E1 rút từ chính messages mà renderer dùng, không ghim trước con số 9 (r1)**
  Người dùng thấy gì: Số cột được xác nhận trong bằng chứng lấy trực tiếp từ cùng nguồn dữ liệu mà màn hình dùng để vẽ bảng, nên nếu một cột bị bỏ sót ở cả hai nơi cùng lúc, bằng chứng vẫn báo đủ chín cột như đã hứa.
  file: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — lop-dem-tep là phép đếm rỗng: số tệp đã chấm so với chính danh sách vừa lặp (r1)**
  Người dùng thấy gì: Một phép đối chiếu số lượng tệp trong bằng chứng luôn tự khớp với chính nó, nên nếu thật sự có tệp bị bỏ sót khi đo, phép đối chiếu đó sẽ không bao giờ báo lệch.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
