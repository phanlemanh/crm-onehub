---
schema_version: 1
slug: kara-gop-y-luot-2
feature: "Kara góp ý OKR lượt 2: vùng Kara không biến mất khi lỗi, không chờ mãi, Căn chỉnh có Hoàn tác, người phụ trách nhiều KR nhờ được Kara, chữ và ngày giờ nhất quán"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z
prototype:
  base_commit: c1067c163
  disposition: archive
---

## Vấn đề & ai gặp

Người phụ trách Mục tiêu và KR mở khung Mục tiêu để xem và quyết góp ý của Kara. Lượt một (`gop-y-dung-cho`) để lại
mười lăm chỗ lạc, gom trong hàng K3 của lộ trình (`de-xuat-lo-trinh.md` dòng 91): vùng Kara biến mất khi danh sách tải
lỗi, «Kara đang đọc…» mãi khi mở khung lúc Kara đang đọc dở, Nhờ Kara lỗi không nói gì, nhận «Căn chỉnh» rồi không hoàn
tác được, người phụ trách nhiều KR chỉ nhờ được cho KR đầu, lỗi từng dòng in câu máy, «Thử lại» xám không lý do, số ít
số nhiều tiếng Anh sai, dòng dẫn không đưa tới đúng KR, năm chỗ ngày giờ năm khuôn. Nguồn: Cổng Đáng `build` cho 16 hàng
lúc 2026-10-07T13:13:50Z (luật 16 của đợt `sau-14-10`).

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Danh sách góp ý đã tự lọc theo KR người gọi sửa được khi không truyền `keyResultId` | Người phụ trách nhiều KR thấy góp ý của KR người khác | Đọc `okr-de-xuat.ts:65-66` | Có — 09/10 |
| 2 | Kết quả nhận «Căn chỉnh» mang đích (`targetObjectiveId`/`targetKeyResultId`) đủ để tìm lại liên kết vừa tạo | Hoàn tác gỡ nhầm liên kết | Đọc `noiGopOutput` (`okr.contracts.ts:285-292`) | Có — 09/10 |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người phụ trách có còn bị lạc ở vùng Kara (vùng biến mất, chờ mãi, không hoàn tác được, nhờ không được cho KR của mình) không.
- Kết quả nào là SỐNG: ở lái-thử người-lạ trước R1, kịch bản gây đủ bốn điều kiện (tắt mạng khi mở khung, mở khung lúc Kara đang đọc dở, nhận một Căn chỉnh rồi muốn bỏ, người phụ trách hai KR); 0 lần vấp ở bốn loại đó.
- Kết quả nào là CHẾT: ≥ 1 lần vấp cùng loại ở cả hai người thử.
- Timebox: lái-thử người-lạ kế tiếp của dãy Kara OKR, trước khi gom ca thật N1 → 9b.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có | — | — | — | — |

## Cổng 0

- **decision = build.** Căn cứ: luật 16 — anh ký `build` cả 16 hàng lúc 2026-10-07T13:13:50Z.
- **disposition = archive.** Căn cứ: không có prototype.
- **Ngưỡng UAT chốt cùng lúc ký:** như mục Ngưỡng — anh duyệt ở Cổng 1 ngày 2026-10-09 (luật 27).

## Thước đo thành công → ứng viên criterion

- Vùng Kara không biến mất, không chờ mãi, lỗi có phản hồi → AC-2, AC-3, AC-4, AC-5, AC-6.
- Hoàn tác được Căn chỉnh, hai Hoàn tác không đua → AC-7, AC-8.
- Người phụ trách nhiều KR nhờ được → AC-10.
- Chữ, dòng dẫn, ngày giờ nhất quán → AC-11, AC-12, AC-13, AC-14.

## Out of scope từ khám phá

- Bộ quét đóng việc Kara treo ở máy chủ.
- Đổi schema lời nhờ hay danh sách góp ý.
