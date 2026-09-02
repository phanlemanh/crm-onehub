---
schema_version: 1
slug: nhan-ung-dung-noi-tieng-viet
feature: Nhãn ứng dụng nói tiếng Việt trên ba luồng của ngưỡng
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-02T11:00:00Z
prototype:
  base_commit:
  disposition: archive
---

## Hồ sơ này thừa kế, không mở lại Cổng Đáng

Cơ hội gốc là `_acceptance/tieng-viet-cho-crm/opportunity.md` — một hồ sơ cho cả
năm vòng, người đã ký `decision: build` ngày 2026-09-01. Vòng này là **lát đầu
của vòng ③**, và nó không mở lại câu hỏi "có đáng làm không".

File này tồn tại để **ngưỡng nghiệm thu đi cùng lát**, thay vì nằm ở hồ sơ của
vòng khác nơi không thẻ nào đọc tới.

## Ngưỡng chết / ngưỡng UAT

Chép nguyên văn từ hồ sơ gốc. **Bốn dòng vẫn mang tiền tố `[đề xuất]` — đó là
lời của máy, người CHƯA gỡ.** Máy không tự gỡ.

- Câu hỏi phép đo trả lời: [đề xuất] Nhân viên quan hệ đối tác làm xong một việc thật bằng tiếng Việt mà không phải quay về tiếng Anh giữa chừng không?
- Kết quả nào là SỐNG: [đề xuất] Ba nhân viên quan hệ đối tác, mỗi người chạy trọn một luồng thật (thêm một công ty · ghi hoạt động · cập nhật một thoả thuận hợp tác), và không ai gặp một câu tiếng Anh nào ở bước bắt buộc.
- Kết quả nào là CHẾT: [đề xuất] Người vẫn gặp tiếng Anh ở giữa luồng, hoặc họ nói bản tiếng Việt đọc gượng hơn bản tiếng Anh.
- Timebox: [đề xuất] Hai ngày dựng cho vòng đầu, và vòng đầu chỉ lấy MỘT nguồn chữ.

## Điều lát này biết trước là sẽ trượt ngưỡng

Ngưỡng SỐNG đòi *không ai gặp một câu tiếng Anh nào ở bước bắt buộc*. Lát này
biết trước **hai chỗ sẽ gặp**, và cả hai đều có tên trong hợp đồng:

1. **Bảy giai đoạn thoả thuận** — luồng thứ ba kết bằng đổi giai đoạn, và bảy giá
   trị đó `CONTEXT.md` khai là CHƯA CHỐT NGHĨA. AC-14 giữ chúng nguyên và bắt
   chúng khai `lang="en"`. Đây là chỗ ngưỡng trượt, và là câu hỏi ở Cổng 1.
2. **Câu lỗi máy chủ trả về** — 107 chỗ, vòng ④. AC-3 đo và ghi lại chữ hiện ra
   thay vì giấu.

Nói trước ở đây để Cổng Giá trị không bất ngờ.
