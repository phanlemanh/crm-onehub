---
schema_version: 1
slug: nen-kara
feature: Nền giao diện của Kara trong packages/ui — dấu tia sáng, nhãn Kara có ô «vì sao», ProposedChange hai độ dày (inline không viền, card), dòng biên nhận có Hoàn tác, phản hồi chung — để mọi màn AI sau đó dựng trên một bộ
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-10-01T17:19:47Z
prototype:
  base_commit:
  disposition:
---

Gốc: khảo sát `docs/plan/ux-ai-thong-nhat-2026-10-01.md`; luật đã chốt ở `docs/ai-ux.md`
(chủ kho quyết 2026-10-01: một tên Kara, dấu tia sáng, biên nhận tại chỗ là chỗ hoàn tác
chính, lượt nền đi trước). Bản mẫu: `/proto/gop-y-dung-cho` (`kara.tsx` là hình dạng mong
muốn, dựng tạm ở proto).

## Vấn đề & ai gặp

- 12 bề mặt AI, bảy tên, bốn dấu nhận diện, bốn kiểu chờ, hoàn tác chỉ có ở một loại đề xuất
  (khảo sát mục 1–2). Mỗi lượt AI mới lại tự dựng một kiểu vì `packages/ui` chưa có thứ để dùng.
- `ProposedChange` chỉ có dạng thẻ: thân là `Alert` có viền (qua `Confirmation` của AI
  Elements), đặt trong bảng hay dưới ô nhập thì thành ba lớp viền. AI Elements mô tả
  `Confirmation` là cổng duyệt công cụ, không phải chỗ nhận một chỉnh sửa.

**Người gặp:** người viết mã các lượt AI sau (`gop-y-dung-cho`, `tu-vung-tac-tu`,
`tac-tu-xin-duyet`); gián tiếp là mọi người dùng thấy AI mỗi màn một kiểu.

## Giả định chốt sinh tử

- `ProposedChange density="inline"` dựng được trên `Item` mặc định mà vẫn giữ nguyên API nút,
  khoá, lỗi, sửa tại chỗ của bản thẻ — hai màn đang dùng (cột OKR, thông tin liên hệ) không
  phải viết lại.
- Đổi thân khỏi `Confirmation` thì cổng mồ côi của `nen-chat-ai-elements` vẫn xanh hoặc
  `confirmation.tsx` được gỡ có ghi lý do trong `docs/chat-ui.md`.

## Câu hỏi mở cho Cổng Đáng

- Lượt này chỉ dựng nền (thành phần + bài kiểm + mục `/proto`), không đổi màn nào — đồng ý?
- Giữ `Confirmation` làm thân của bản `card`, hay bỏ hẳn cho cả hai độ dày?

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Sau khi có nền, các lượt AI kế tiếp có dựng đề xuất, dấu và phản hồi của Kara bằng thành phần chung của packages/ui, để người dùng thấy AI cùng một kiểu ở mọi màn không?
- Kết quả nào là SỐNG: Tới hết timebox, mọi lượt AI gộp sau nen-kara dựng đề xuất, dấu và phản hồi bằng ProposedChange, KaraMark, KaraLabel, AiFeedback chứ không tự dựng, số kiểu dấu nhận diện AI trên màn thật giảm từ bốn xuống tối đa hai, và trong phiên nghiệm thu ít nhất 2 trên 3 người chỉ đúng nút chính của một đề xuất inline.
- Kết quả nào là CHẾT: Có ít nhất 1 lượt AI gộp sau nen-kara tự dựng thẻ đề xuất hay dấu Kara riêng ngoài packages/ui, hoặc số kiểu dấu nhận diện AI trên màn thật vẫn là bốn.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)
