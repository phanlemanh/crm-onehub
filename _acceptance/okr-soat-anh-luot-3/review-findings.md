## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New code hardcodes the Vietnam timezone again and rewrites the existing ngayVN helper**
    Người dùng thấy gì: Nếu sau này một người sửa cách tính giờ Việt Nam ở chỗ này mà quên sửa chỗ kia, ngày dùng để gợi ý tên chu kỳ trên màn có thể lệch với ngày hệ thống thật sự dùng để tạo chu kỳ, khiến gợi ý sai lệch âm thầm.
    file: `apps/app/lib/okr-chu-ky-nhan.ts`
    severity: medium
    Đề xuất: known-limits

- **Chuỗi mục tiêu dài của lô thử có 119 ký tự, trong khi hợp đồng và eval E1 ghi là ≥ 120**
    Người dùng thấy gì: Dữ liệu thử cho trường hợp mục tiêu tên rất dài ngắn hơn một chút so với mức đã ghi, nhưng không làm đổi kết quả xem trước, nên người dùng không bị ảnh hưởng.
    file: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`
    severity: low
    Đề xuất: wont-fix

- **Hình dạng 3 — dong-ho-page chỉ soi tên hàm có mặt, không soi quan hệ «giá trị gợi ý tính ở server được truyền xuống»**
    Người dùng thấy gì: Bằng chứng kiểm tra hiện chỉ xác nhận hai bước tính ngày có được gọi tới, chứ chưa chắc chắn giá trị đó thật sự tới được đúng ô hiển thị; nếu sau này ô đó vô tình hiển thị sai hoặc bị gán cứng, bằng chứng vẫn có thể báo đạt.
    file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4 — E12 «design-gate mã 0» đứng một mình: lệnh đo không chạy đối chứng --pha**
    Người dùng thấy gì: Bằng chứng khẳng định giao diện không vi phạm quy tắc thiết kế hiện không kèm phép thử đối chứng trong chính lượt đo tự động, nên nếu cổng kiểm tra thiết kế sau này bị hỏng âm thầm, lượt đo vẫn có thể báo đạt như bình thường.
    file: `_acceptance/config.yaml`
    severity: medium
    Đề xuất: known-limits

- **Hình dạng 4 — đối chứng pha-lop đi đường khác đường đo thật: OSA_TEP tắt phần phân loại theo dòng đổi**
    Người dùng thấy gì: Phép thử đối chứng cho phần phân loại lỗi cũ/mới hiện đi một đường tắt khác với đường đo thật, nên nếu phần phân loại đó xếp nhầm một lỗi mới thành lỗi có sẵn, phép thử đối chứng sẽ không phát hiện ra.
    file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 5 — ma trận cột của E1 rút từ chính messages mà renderer dùng, không ghim trước con số 9**
    Người dùng thấy gì: Số cột được xác nhận trong bằng chứng lấy trực tiếp từ cùng nguồn dữ liệu mà màn hình dùng để vẽ bảng, nên nếu một cột bị bỏ sót ở cả hai nơi cùng lúc, bằng chứng vẫn báo đủ chín cột như đã hứa.
    file: `_acceptance/okr-soat-anh-luot-3/rang/do-man.mjs`
    severity: low
    Đề xuất: known-limits

- **Hình dạng 5 — lop-dem-tep là phép đếm rỗng: số tệp đã chấm so với chính danh sách vừa lặp**
    Người dùng thấy gì: Một phép đối chiếu số lượng tệp trong bằng chứng luôn tự khớp với chính nó, nên nếu thật sự có tệp bị bỏ sót khi đo, phép đối chiếu đó sẽ không bao giờ báo lệch.
    file: `_acceptance/okr-soat-anh-luot-3/rang/soi-ma.mjs`
    severity: low
    Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).