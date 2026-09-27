---
schema_version: 1
slug: ro-slack-tac-nhan
feature: Vá lối rò Slack — Tác nhân chạy nền không đăng được dữ liệu đối tác vào kênh Slack có người mang vai «chỉ OKR», và lượt chạy nền của Tác nhân được coi là tự động nên mọi thao tác ghi nhạy cảm bị từ chối
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-09-27T02:56:44Z
prototype:
  base_commit:
  disposition:
---

## Vấn đề & ai gặp

Từ 2026-10-26 cả công ty vào CRM; người ngoài khối kinh doanh vào bằng vai «chỉ
OKR» và không đọc được dữ liệu đối tác ở màn, API, khoá API hay trợ lý AI (hồ sơ
`vai-chi-okr`, đã lên `onehub`). Khung Tác nhân của hãng còn hai lối vòng qua lớp
chặn đó:

- **Đăng Slack không nhìn người nhận.** Một Tác nhân đối tác đăng vào kênh đã duyệt
  lúc Deploy; kênh ấy có thể có (hoặc sau này có) người vai «chỉ OKR». Hôm nay tin
  vẫn đi. Nguồn: `docs/reports/2026-09-26-tro-ly-okr/12-kien-truc-va-lo-trinh.md`
  §3.3 khoảng trống 8, xác minh lại bằng đọc mã 2026-09-27.
- **Lượt nền mượn danh tính người dựng.** Lượt Tác nhân không bị coi là tự động, nên
  thao tác ghi nhạy cảm xin người duyệt trong một phiên không ai ngồi.

**Người gặp:** người vai «chỉ OKR» (nhận dữ liệu họ không được đọc), và chủ kho
(lời hứa của vai «chỉ OKR» hở ở một lối không ai nhìn). Lối mở từ 26/10.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người Slack khớp được với thành viên CRM qua email hoặc bảng khớp Slack | Người «chỉ OKR» lọt vì không khớp | Ca khớp bằng bảng khi email lệch (AC-2) | Đo trong vòng |
| 2 | Slack cho đọc thành viên kênh công khai bằng quyền đã cấp | Tác nhân đăng kênh công khai hỏng hàng loạt | Phép thử sống `slack-delivery.e2e.ts` sau triển khai | Chưa thử — ngoài bộ chứng |
| 3 | Chỉ bộ giao lượt Tác nhân đánh dấu phiên là «lượt Tác nhân» | Một phiên có người ngồi bị từ chối oan | Kiểm kê mọi chỗ dựng danh tính (AC-14) | Đo trong vòng |

## Ngưỡng chết / ngưỡng UAT

Không đo được — vá một lỗ quyền: không có hành vi người dùng nào để đếm sau khi giao; thứ phải chứng là lỗ đã đóng, và phép đo đỏ trên mã trước vá, xanh trên mã sau vá (AC-11) là bằng chứng đó, chấm ở Cổng Bằng chứng.

## Kết quả prototype

Không dựng prototype — không có màn nào.

## Nguồn ngoài & phạm vi kế thừa

| Món | Nguồn | Loại | Kế thừa | Ghi chú |
|---|---|---|---|---|
| Lớp lỗi «lượt nền mượn quyền người dựng» | Microsoft Copilot Studio, authoring-triggers-about (dẫn ở báo cáo 12 §2.3) | triết-lý/logic | có | chỉ để nhận diện lớp lỗi |
| Hình trả lời của Slack Web API | Tài liệu Slack `conversations.members`, `users.list` | triết-lý/logic | có | ghim trong evals |

## Cổng 0

- **decision = build.** Căn cứ: lộ trình Trợ lý OKR mục 5 khối «Vá lối rò Slack · T3»; lối mở từ 2026-10-26, độc lập với Trợ lý OKR. Quyết 2026-09-27 bởi Manh Phan trong phiên lượt, câu trả lời «Làm».
- **Ngưỡng chốt cùng lúc ký:** nhận lời khai «Không đo được» như section Ngưỡng — bằng chứng là phép đo đỏ trước vá, xanh sau vá (AC-11), chấm ở Cổng Bằng chứng; không phiên nghiệm thu sau khi giao.
