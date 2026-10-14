---
schema_version: 1
slug: viec-cha-khong-lo-tieu-de
feature: viec.bang và viec.con không lộ tiêu đề việc cha khi người xem không có quyền với việc cha
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA2b
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

## Vấn đề & ai gặp

Mở từ hàng DA2b của «Việc và Dự án» (`docs/plan/lo-trinh-viec-du-an.json`).

viec.bang và viec.con không lộ tiêu đề việc cha khi người xem không có quyền với việc cha

Vì sao: Ưu tiên cao — chủ kho chọn «mở hợp đồng mới» cho Ngoài-2 ở Cổng Bằng chứng của DA2 (14/10, gốc _acceptance/kanban-viec): người giao gỡ việc cha khỏi thoả thuận thì người làm việc con vẫn thấy tiêu đề của một việc riêng họ không được xem.

- **Người gặp:** người thực hiện việc con (và thành viên thấy việc con qua bản ghi gắn) khi việc cha đã thành
  việc riêng — họ thấy tiêu đề cha trên thẻ bảng («Thuộc: …») và trong khung việc («Thuộc việc: …»), bấm vào
  thì «Không có việc nào mang mã …».
- **Chỗ rò (đọc mã DA2, onehub `aac0975b5`):** `apps/api/src/viec/viec-bang.service.ts` — `viec.bang` và
  `viec.con` chọn `cha { id, tieuDe }` không qua `dieuKienXemViec`, trái câu «`dieuKienXemViec(userId)` đứng ở
  mọi câu đọc» của `docs/api.md` mục «Việc». Cùng tệp, `viec.bang` đếm `con` trên thẻ không lọc (Ngoài-3 của
  DA2, chủ kho đã ghi Known limits; hàng ghi «gộp vào lượt này nếu rẻ» — sửa là một dòng `where`).
- **Hạng:** T2 — sửa câu đọc ở `apps/api`, luật thấy việc ở `packages/db` giữ nguyên.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] Sau khi gộp, người dùng thật còn thấy tiêu đề hay số việc con của một việc họ không được xem không?
- Kết quả nào là SỐNG: [đề xuất] Hết timebox: 0 báo cáo nào về việc thấy tiêu đề việc cha hay số việc con của việc mình không được xem, và ma trận người × trạng thái việc cha của hợp đồng xanh trên onehub.
- Kết quả nào là CHẾT: [đề xuất] Có ≥1 báo cáo như trên còn tái hiện được trên bản đã gộp.
- Timebox: 14 ngày kể từ ngày gộp vào onehub.
