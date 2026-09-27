## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E6 promises zalo-loc.ts is byte-identical to f9932858, but its command never checks this**
  Người dùng thấy gì: Nếu sau này có người sửa lại bộ lọc số mà không ai để ý, bộ kiểm tra tự động vẫn có thể báo "đạt" dù hành vi che số đã âm thầm đổi khác so với bản đã duyệt.
  file: `_acceptance/hoan-thien-hoi-crm-qua-zalo/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (quét lớp, số assert không ghim số phần tử): dem === DIEN_THOAI_LIEN.length là phép so tự quy, không ghim 13**
  Người dùng thấy gì: Nếu sau này có ai vô tình bớt câu thử trong bộ kiểm, hệ thống vẫn có thể báo "đạt" dù bộ kiểm không còn đủ như đã cam kết, khiến lỗi che số có thể lọt ra mà không bị phát hiện trước khi phát hành.
  file: `apps/agent/test/zalo-loc.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Chặn Zalo trong execute không tới được ở hai công cụ có approval (archive_field, record_job_change) (r1)**
  Người dùng thấy gì: Với các thao tác cần duyệt trước khi ghi (như lưu trữ trường hay ghi nhận đổi việc), người hỏi qua Zalo có thể bị kẹt ở bước hỏi lại thay vì nhận được câu trả lời tiếp theo, dù không có dữ liệu nào bị ghi nhầm.
  file: `apps/agent/agent/tools/archive_field.ts`
  severity: medium
  Đề xuất: known-limits

- **assertNotZaloQuestion so với chuỗi "zalo" viết tay, trong khi lớp ẩn dùng ZALO.hoi.purpose (r1)**
  Người dùng thấy gì: Hiện chưa ảnh hưởng gì tới người dùng vì hai cách viết đang cho cùng một giá trị; nhưng nếu sau này có người đổi một chỗ mà quên chỗ còn lại, ranh giới bảo vệ dữ liệu khi hỏi qua Zalo có thể lặng lẽ hỏng mà không ai biết.
  file: `apps/agent/agent/lib/session-purpose.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
