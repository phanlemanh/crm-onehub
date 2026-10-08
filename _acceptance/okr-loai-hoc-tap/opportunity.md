---
schema_version: 1
slug: okr-loai-hoc-tap
feature: Loại mục tiêu thứ ba «Học tập» cho OKR
owner: manh.phan@onemount.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T14:50:00Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Soạn bổ sung sau khi gộp (PR #302, 6a0900fb), theo luật 28 của đợt `sau-14-10`. Nguồn: yêu cầu của chủ kho ngày 07/10 và sổ quyết định của hồ sơ.

OKR chỉ có hai loại mục tiêu, «Cam kết» và «Tham vọng». Một mục tiêu đặt ra để kiểm một giả thuyết chưa ai biết đáp án không vừa loại nào:

- đọc như cam kết thì bị «Trượt» chỉ vì giả thuyết sai, dù giả thuyết sai vẫn là một kết quả;
- đọc như tham vọng thì cuối kỳ không ai bị buộc ghi lại đã học được gì.

Chủ kho chốt ngày 07/10:

- Giữa kỳ, mục tiêu học tập đọc như tham vọng và không bao giờ «Trượt».
- Cuối kỳ đọc «Đã trả lời» hoặc «Chưa trả lời», không theo ngưỡng điểm. «Đã trả lời» nghĩa là đã ghi «Điều học được».
- Không đóng được kỳ khi còn mục tiêu học tập đã công bố mà chưa ghi «Điều học được».

**Người gặp:** đơn vị đặt mục tiêu thử hướng mới (thị trường, kênh, cách làm) và người quản trị đóng kỳ OKR.

## Ngưỡng chết / ngưỡng UAT

Ngưỡng soạn sau khi gộp, anh duyệt 08/10 trong phiên giám sát.

- Câu hỏi phép đo trả lời: đơn vị có dùng loại «Học tập» đúng chỗ, cho mục tiêu kiểm giả thuyết, và có ghi được điều học được khi đóng kỳ không?
- Kết quả nào là SỐNG:
  - kỳ OKR kế có ≥ 1 mục tiêu học tập đã công bố;
  - 100% mục tiêu học tập có «Điều học được» khi kỳ đóng;
  - không ai báo nhãn «Trượt» trên mục tiêu học tập.
- Kết quả nào là CHẾT:
  - sau một kỳ không đơn vị nào dùng loại này; hoặc
  - ≥ 2 trường hợp (Kara hoặc người duyệt bắt được) chọn «Học tập» để né «Trượt» cho một mục tiêu thực chất là cam kết.
- Timebox: một vòng feature-loop T2 (đã giao 08/10). Đo ở kỳ OKR kế.
