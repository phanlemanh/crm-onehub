## Trong hợp đồng

(không có finding nào map được vào AC ở round này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **okr-chu-ky-nhan.ts dựng lại helper «hôm nay giờ Việt Nam» và hằng múi giờ đã có sẵn ở @crm/db/onboarding-nhac**
  Người dùng thấy gì: Nếu sau này có người đổi múi giờ hệ thống, một vài nơi tính ngày có thể không được cập nhật theo vì logic đang lặp lại ở hai chỗ thay vì một chỗ duy nhất.
  file: `apps/app/lib/okr-chu-ky-nhan.ts`
  severity: medium
  Đề xuất: known-limits

- **Dialog size "table" loses its side gutter between 640px and about 1152px wide**
  Người dùng thấy gì: Ở một số kích thước cửa sổ trung bình (không phải điện thoại, không phải máy tính lớn), hộp thoại nhập bảng dữ liệu có thể chạm sát hai mép màn hình thay vì có khoảng trắng viền quanh.
  file: `packages/ui/src/components/dialog.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): E12 chỉ chấm «design-gate mã 0» và lệnh đo không bao giờ chạy phép đối chứng --pha**
  Người dùng thấy gì: Nếu sau này có lỗi thiết kế thật sự lọt vào (như chữ xám trên nền màu), phép đo tự động của vòng đo này có thể không phát hiện ra vì nó thiếu bước tự kiểm tra rằng cổng kiểm tra vẫn đang hoạt động đúng.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (quét cả lớp nhưng bộ đếm tự so với chính nó): «lop-dem-tep» và «tap tep: n» không bao giờ đỏ**
  Người dùng thấy gì: Nếu bộ lọc tệp bỏ sót một tệp giao diện đã thay đổi, phép đo có thể không nhận ra và vẫn báo mọi thứ ổn.
  file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần viết trước): MA_TRAN của do-man tự suy từ COT, MUC_CAI_DAT và LO, không ghim số lượng đã hứa**
  Người dùng thấy gì: Nếu một cột bảng hay một mục cài đặt bị thiếu mất trong mã nguồn, phép đo tự động có thể không phát hiện ra sự thiếu sót đó.
  file: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «có mặt» cho một lời hứa về quan hệ): dong-ho-page chỉ kiểm page.tsx có gọi homNayVn và goiYChuKy**
  Người dùng thấy gì: Phép đo tự động chỉ kiểm tra hai bước tính ngày và gợi ý tên có được gọi hay không, chứ chưa chắc chắn xác nhận chúng được nối đúng thứ tự với nhau, nên một lỗi hiếm khi ghép sai kết quả có thể lọt qua mà không bị phát hiện.
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