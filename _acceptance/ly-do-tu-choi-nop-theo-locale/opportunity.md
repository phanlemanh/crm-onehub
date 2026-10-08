---
schema_version: 1
slug: ly-do-tu-choi-nop-theo-locale
feature: "Lý do Kara nộp bản nháp bị từ chối hiện thành câu theo ngôn ngữ người dùng, không lộ mã máy"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-08T16:47:19Z
prototype:
  base_commit: 577f23b2b
  disposition: archive
---

## Vấn đề & ai gặp

Trưởng phòng soạn OKR cùng Kara trên trang riêng. Khi Kara nộp bản nháp mà máy chủ từ chối, hội thoại hiện dòng
«Kara nộp bản nháp chưa được — chu ky khong o pha lap ke hoach»: lý do là mã máy không dấu của agent, ghép thẳng
vào câu, và ở giao diện tiếng Anh câu tiếng Anh nối với mã tiếng Việt. Nguồn: Ngoài-1 của `soan-okr-khong-lac`,
Cổng 2 lúc 2026-10-08T16:47:19Z (luật 26 của đợt `sau-14-10`); ảnh
`_acceptance/soan-okr-khong-lac/evidence/E10-nop-tu-choi-390.png`.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Bảy mã từ chối hiện có là đủ cho mọi lần agent trả `tu-choi` | Mã mới của agent hiện câu dự phòng không lý do | Đọc mọi chỗ gọi `tuChoi(` trong `nop-ban-nhap.ts` | Có — bảy mã, 09/10 |
| 2 | Transcript của cuộc đã lưu mang đúng chuỗi mã hiện tại | Đổi giá trị mã làm cuộc cũ mất lý do | Giữ nguyên từng giá trị chuỗi, chỉ đổi chỗ khai | Chấp nhận |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người soạn có hiểu vì sao Kara nộp chưa được, ở cả tiếng Việt lẫn tiếng Anh, không thấy mã máy.
- Kết quả nào là SỐNG: ở lái-thử người-lạ trước R1, kịch bản gây một lần nộp bị từ chối (chu kỳ rời pha Lập kế hoạch) ở mỗi ngôn ngữ; người thử kể lại đúng lý do và không gặp chữ không dấu.
- Kết quả nào là CHẾT: người thử đọc thấy mã máy, hoặc không kể lại được lý do ở cả hai ngôn ngữ.
- Timebox: lái-thử người-lạ kế tiếp của dãy Kara OKR.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có | — | — | — | — |

## Cổng 0

- **decision = build.** Căn cứ: luật 26 — Ngoài-1 của `soan-okr-khong-lac`, Cổng 2 2026-10-08T16:47:19Z.
- **disposition = archive.** Căn cứ: không có prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** như mục Ngưỡng — anh duyệt ở Cổng 1 ngày 2026-10-09 (luật 27).

## Thước đo thành công → ứng viên criterion

- Câu tiếng Việt có dấu cho mọi mã → AC-1.
- Câu tiếng Anh cho mọi mã → AC-2.
- Mã lạ không lộ ra màn → AC-3.
- Một chỗ khai tập mã, giá trị không đổi → AC-4, AC-5.

## Out of scope từ khám phá

- Ngoài-2 đến Ngoài-10 của K2b — anh đã định đoạt riêng (Known limits, chấp nhận, hoặc K2d cho Ngoài-4).
- Đổi lời Kara hay cách agent nộp lại sau lần bị từ chối.
