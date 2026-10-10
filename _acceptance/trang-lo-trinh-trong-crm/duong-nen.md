---
slug: trang-lo-trinh-trong-crm
at: 2026-10-08T17:40:56.058Z
sha: 3e2ee92ff610de8263fa551dceca08dba10485a1
nen: do
cong_cu: xanh
suite: xanh
luoi: do
engine: xanh
---

## Dòng đỏ

- nen luoi: LOI CHAY ma 1

## Ghi chú của phiên

- Lượt này chạy trên bản sao sạch của commit 3e2ee92f (đã có tệp S1 của vòng). Lượt đầu (cây 6d1ea30e, chưa có
  tệp nào của vòng được commit) cho lưới trước khi gộp xanh; đỏ ở đây là chính hồ sơ này: bản mẫu dưới /proto
  đã commit trong khi hợp đồng còn `draft`, nên lưới báo «hồ sơ có bằng chứng nhưng status chưa arm cổng».
  Đây là trạng thái giữa vòng, không phải nền hạ tầng hỏng; hết khi hợp đồng tới `implemented`. Hệ quả: nhánh
  của vòng chưa đẩy được lên PR trước S4.
- Lượt đầu cũng có `lint:slop` đỏ: do một tệp bản mẫu viết trong lúc lượt chạy (bảng màu khai kiểu mở), đã sửa
  bằng `satisfies` trước commit 3e2ee92f; lượt sạch cho bộ kiểm xanh.
