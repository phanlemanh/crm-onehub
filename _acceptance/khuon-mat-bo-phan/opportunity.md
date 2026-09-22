---
schema_version: 1
slug: khuon-mat-bo-phan
feature: Khuôn đã lưu trữ khôi phục được kể cả khi một bộ phận nó dùng đã bị xoá vĩnh viễn
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-22T01:05:00Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Phát hiện ở Cổng Bằng chứng của `sua-luu-tru-dieu-phoi` ngày 2026-09-22 (mục
Ngoài-3 và Ngoài-5, cùng một lỗi). Chủ kho chọn «mở hợp đồng mới».

Một bộ phận chỉ còn được nhắc trong một khuôn **đã lưu trữ** thì bộ phận đó
được tính là «chưa từng dùng» và xoá vĩnh viễn được. Sau đó khuôn kia không bao
giờ khôi phục được: phép khôi phục khuôn kiểm từng bộ phận của nó, và bộ phận đã
biến mất khỏi cơ sở dữ liệu nên không bao giờ qua được bước kiểm.

**Người gặp:** người quản trị Điều phối 30 ngày dọn danh mục — lưu trữ khuôn cũ
trước, xoá vĩnh viễn bộ phận sau, rồi muốn dùng lại khuôn.

## Giả định chốt sinh tử

- Có người thật sự dọn theo thứ tự đó. Chưa kiểm chứng; danh mục hôm nay còn
  nhỏ.

## Câu hỏi mở cho Cổng Đáng

- Chặn xoá vĩnh viễn bộ phận còn nằm trong bất kỳ khuôn nào (kể cả đã lưu
  trữ), hay cho khôi phục khuôn mà bỏ các bước mồ côi?
- Nếu bỏ bước: người quản trị có được báo bước nào đã rơi không?

## Ngưỡng chết / ngưỡng UAT

Không đo được — ô này sửa một lỗi dữ liệu đã quan sát ở Cổng Bằng chứng của
`sua-luu-tru-dieu-phoi`, không đưa giá trị mới cho người dùng. Phép thử thực tế
là chủ kho thử lại đường dọn (lưu trữ khuôn, xoá vĩnh viễn bộ phận, khôi phục
khuôn) trên màn cài đặt sau khi gộp.

Chủ kho quyết `build` ngày 2026-09-22, theo khuyến nghị làm ô này trước
`cau-truc-to-chuc`. Chọn giữa hai hướng sửa (chặn xoá hay bỏ bước mồ côi) để
cho phần thiết kế, trình lại ở Cổng Phạm vi.

## Out of scope từ khám phá

- Cấu trúc hai cấp bộ phận / phòng ban — ô `cau-truc-to-chuc`.
