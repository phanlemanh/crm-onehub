# Review findings: ly-do-tu-choi-nop-theo-locale (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mã dongTrungKhoa không bao giờ thành kết quả tu-choi: câu đã dịch và ca thứ bảy của ma trận đo một trạng thái không thể xảy ra**
  Người dùng thấy gì: Khi bản nháp có hai dòng trùng nhau, Kara nộp không được nhưng người dùng chỉ thấy câu chung «Kara nộp bản nháp chưa được», không thấy lý do. Câu giải thích đã dịch sẵn cho trường hợp này sẽ không bao giờ hiện lên màn.
  file: `apps/agent-okr/agent/lib/nop-ban-nhap.ts`
  severity: medium
  Đề xuất: known-limits

- **Vết (a) của dot-bien.mjs và chiều đỏ --kiem-do-do của man.mjs bơm TÊN khoá chứ không bơm giá trị chuỗi của mã như eval hứa**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Bài thử cố ý làm hỏng màn vẫn báo đỏ, nhưng nội dung báo lỗi chưa đúng như tài liệu mô tả, nên ảnh bằng chứng khó tái lập y hệt.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/dot-bien.mjs`
  severity: low
  Đề xuất: known-limits

- **docMau của ranh-gioi.mjs không lọc dòng đầu diff '---'/'+++', nên chiều đỏ --diff-mau / --diff-mau-nop luôn ra exit 1 với tệp diff thật**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Chế độ tự kiểm của công cụ soát ranh giới tệp sửa luôn báo vi phạm với mẫu thật, nên không chứng minh được nó phân biệt mẫu sạch với mẫu sai.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **docDot nuốt mọi lỗi đọc hang-viec.json rồi lặng lẽ quay về ranh giới chép tay**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Nếu tệp khai ranh giới của đợt bị hỏng, công cụ soát phạm vi lặng lẽ dùng bản chép tay thay vì báo lỗi, nên có thể xanh trên một phạm vi không đúng bản đã duyệt.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ thấy máy đỏ, không ghim thông điệp): chiều đỏ --kiem-do-do của E9 nhận mọi lần thoát mã 1**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Phép thử cố ý làm hỏng màn coi mọi thất bại là «bắt được», kể cả khi thất bại vì lý do khác, nên chưa chứng minh nó bắt đúng lỗi lộ mã máy.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (lời hứa là quan hệ vị trí, phép đo chỉ thấy chuỗi có mặt): E8 xét dòng đổi của config.ts và nop-ban-nhap.ts theo danh sách nội dung, không theo khối**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Công cụ soát phạm vi sửa tệp cấu hình chỉ kiểm nội dung từng dòng, không kiểm dòng đó nằm đúng khối nào, nên một chỉnh sửa lạc chỗ nhưng trùng nội dung có thể lọt.
  file: `_acceptance/ly-do-tu-choi-nop-theo-locale/rang/ranh-gioi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo cái tác giả đã ký thay vì cây đang kiểm): E9 của K2b giờ neo vào hai sha cố định**
  Người dùng thấy gì: Không ảnh hưởng người dùng cuối. Phép soát phạm vi của một tính năng cũ nay luôn đọc lại cùng bản đã ký thay vì cây hiện tại; đây là chủ ý đã ghi lại, chỉ cần chấp nhận và ghi vết.
  file: `_acceptance/soan-okr-khong-lac/rang/ranh-gioi.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
