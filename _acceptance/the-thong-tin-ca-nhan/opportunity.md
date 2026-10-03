---
schema_version: 1
slug: the-thong-tin-ca-nhan
feature: Gợi ý thông tin của tác tử ở tab Tổng quan của Cá nhân trải hết hàng, nói rõ là tác tử đề xuất và độ tin, và đặt giá trị cũ cạnh giá trị mới
owner: phanlemanh@gmail.com
stage: discovery
decision:
decided_by:
decided_at:
prototype:
  base_commit:
  disposition:
---

Gốc: hồ sơ `_acceptance/the-gop-y-okr` (AC-10) và buổi lái thử 30/09 ở `docs/plan/lai-thu-the-gop-y-2026-09-30/index.html`.

## Vấn đề & ai gặp

- Thẻ `ProposedChange` dạng gọn (`apps/app/components/crm/facts.tsx`) chen giữa lưới hai
  cột của khối «Chi tiết»: ô «Email» cột phải tụt xuống, để khoảng trống (ảnh 25).
- Thẻ không nói đây là đề xuất của tác tử, không nói độ tin (`band` POSSIBLE/PROBABLE), và không
  đặt «IT Director» (giá trị đang có) cạnh chức danh mới (ảnh 26).
- Trên 390 px thẻ bó trong cột giá trị, rộng 238 px, bỏ trống cột nhãn (ảnh 29).

**Người gặp:** nhân viên quan hệ đối tác duyệt thông tin tác tử tìm được cho Cá nhân.

## Giả định chốt sinh tử

- Dữ liệu cần đã có trên `contact.facts` (`band`, `score`, `evidence`); không đổi API.
- Dạng viết lại (cũ gạch → mới) của `ProposedChange` dùng được cho trường đã có giá trị.

## Câu hỏi mở cho Cổng Đáng

- Hiện độ tin bằng chữ («vừa», «khá chắc», «đã xác minh») hay bằng dấu?
- Có đưa «Sửa» vào thẻ thông tin như thẻ viết lại của OKR không?
