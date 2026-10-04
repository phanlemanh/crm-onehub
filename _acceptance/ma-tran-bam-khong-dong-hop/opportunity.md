---
schema_version: 1
slug: ma-tran-bam-khong-dong-hop
feature: Phép đo «bấm trong cột góp ý không đóng hộp» dựa trên ma trận trạng thái thẻ × đích bấm viết trước, không đếm ca bằng ngưỡng và không lặng lẽ bỏ đích thiếu
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

Gốc: hồ sơ `_acceptance/the-gop-y-okr`, mục Ngoài-10 của Cổng Bằng chứng (định đoạt «mở hợp đồng mới», 29/09/2026).

## Vấn đề & ai gặp

Bài `khong-dong` của E8 (`apps/app/test/the-gop-y-okr.dom.tsx`) dựng danh sách đích bấm lúc
chạy từ DOM, bỏ qua đích không tìm thấy, và chỉ khẳng định số ca > 20. Một trạng thái thẻ mất
hẳn một đích bấm vẫn xanh; lời hứa AC-8 («mọi nút, chữ, khoảng trống trong cột, ở mọi trạng
thái thẻ») mạnh hơn phép đo. Bước tái hiện trên merge-base là dòng in sẵn (Ngoài-11).

**Người gặp:** người ký Cổng Bằng chứng của các lượt sau chạm cột góp ý.

## Giả định chốt sinh tử

- Ma trận viết trước = danh sách đóng {trạng thái thẻ} × {đích bấm có tên}; mỗi ô thiếu là đỏ có tên.
- Lớp chốt trình duyệt thật (E13) giữ nguyên.

## Câu hỏi mở cho Cổng Đáng

- Gộp vào lượt `the-gop-y-sua-nhanh` (cùng chạm cột) hay để riêng?
