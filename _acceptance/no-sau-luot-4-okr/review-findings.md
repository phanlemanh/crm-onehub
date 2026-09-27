# Review Findings: no-sau-luot-4-okr — vòng 1

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **config.yaml hết là YAML thật: khoá n4_the_truc_tiep thiếu dấu cách sau dấu hai chấm**
  Người dùng thấy gì: Tệp cấu hình đo lường dùng chung của cả kho có thể đọc lỗi bằng các công cụ đọc chuẩn bên ngoài (trình soạn thảo, script khác), dù các phép đo của tính năng này vẫn chạy đúng như hiện tại.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **objective() thêm một truy vấn thừa để dựng lại đơn vị mà docMucTieu đã tính**
  Người dùng thấy gì: Mỗi lần mở sheet mục tiêu, hệ thống đọc thêm dữ liệu không cần thiết, làm chậm nhẹ thao tác nhưng không đổi kết quả hiển thị cho người dùng.
  file: `apps/api/src/okr/okr.service.ts`
  severity: low
  Đề xuất: known-limits

- **Khuôn đi qua ranh giới gói giờ nằm ở @crm/db, lệch luật «khuôn chung sống ở packages/validation/src» của AGENTS.md**
  Người dùng thấy gì: Đây là cách tổ chức mã nguồn nội bộ đã được thống nhất từ trước; không ảnh hưởng đến trải nghiệm hay dữ liệu của người dùng.
  file: `packages/db/src/okr-vet.ts`
  severity: low
  Đề xuất: known-limits

- **config.yaml: executor n4_the_truc_tiep thiếu dấu cách sau dấu hai chấm, làm hỏng cả tệp YAML**
  Người dùng thấy gì: Tệp cấu hình đo lường dùng chung của cả kho có thể đọc lỗi bằng các công cụ đọc chuẩn bên ngoài, dù các phép đo của tính năng này vẫn chạy đúng như hiện tại.
  file: `_acceptance/config.yaml`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình: lỗi lan tới thẻ việc và Tổng quan chỉ kiểm «HTTP khác 200»**
  Người dùng thấy gì: Nếu dữ liệu vết OKR bị hỏng theo một cách khác với dự kiến, phép kiểm tra hiện tại có thể vẫn báo là ổn dù thông báo lỗi hiển thị cho người dùng chưa chắc đúng nội dung.
  file: `apps/api/test/no-sau-luot-4-okr.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — ma trận 3×5 khai trước có một cột không được đo: «tin D+1 — fetch giả nhận đúng 1 tin»**
  Người dùng thấy gì: Phép kiểm tra hiện tại không đo đúng số tin thực sự được gửi vào buổi sáng hôm sau; nếu hệ thống gửi thừa tin trùng, phép kiểm có thể vẫn báo ổn mà không phát hiện ra.
  file: `apps/agent/test/nhac-moc-sang.integration.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — mot-khuon (b) so khuôn với chính bảng khoá đã dựng ra nó, không đo đầu ra**
  Người dùng thấy gì: Không ảnh hưởng đến trải nghiệm người dùng — đây là một bước kiểm tra nội bộ chưa đo được đúng như kỳ vọng, nhưng phần đo thật cho cùng yêu cầu đã có ở một bài kiểm khác.
  file: `_acceptance/no-sau-luot-4-okr/rang/mot-khuon.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/config.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
