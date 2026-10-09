---
schema_version: 1
slug: quyet-gop-y-noi-dung-ly-do
feature: "Quyết một góp ý của Kara mà máy chủ từ chối vì lý do cố định thì người dùng thấy đúng lý do, không phải câu «thử lại sau ít phút»"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09T13:04:37Z
prototype:
  base_commit: a896b0030
  disposition: archive
---

## Vấn đề & ai gặp

Trưởng phòng và người phụ trách KR quyết góp ý của Kara trong khung Mục tiêu. Từ K3 (`kara-gop-y-luot-2`, #342),
lỗi khi quyết một góp ý được xếp loại ở client (`loaiLoiDong`, `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`):
`NOT_FOUND` → «không còn», `CONFLICT` → «đã cũ», không mã → «mất kết nối», còn MỌI mã khác → «Chưa quyết được góp ý
này lúc này. Thử lại sau ít phút.». Nhưng phần lớn lỗi `BAD_REQUEST`/`FORBIDDEN` của `troLyQuyet` là lý do cố
định, thử lại không bao giờ qua: đích Căn chỉnh chưa công bố hay đã được liên kết, chu kỳ đã ẩn, không sửa được
KR đó… Người dùng thử mãi mà không biết lý do thật.

Nguồn: Ngoài-6 của K3, Cổng 2 lúc 2026-10-09T13:04:37Z — anh chọn «mở hợp đồng mới» (luật 26 của đợt `sau-14-10`).

Câu lý do phía máy chủ (`OKR.thongDiep`, `apps/api/src/okr/okr-config.ts`) chỉ có tiếng Việt.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Mọi lỗi cố định của `troLyQuyet` đi ra dưới `BAD_REQUEST`/`FORBIDDEN` kèm một câu sản phẩm | Có lỗi cố định ra dưới mã khác, vẫn thành câu thử lại | Liệt mọi `throw` trên đường `troLyQuyet` → `ghiTheoDong` → `okr.*Trong` | Chưa đo — làm ở S1 |
| 2 | Người dùng tiếng Anh cũng phải thấy lý do bằng tiếng Anh | Hiện câu tiếng Việt trên giao diện tiếng Anh — đúng lớp lỗi K2c vừa sửa | Quyết định của anh ở Cổng Phạm vi | Chờ anh |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người quyết một góp ý bị từ chối vì lý do cố định có kể lại đúng lý do không.
- SỐNG: ở lái-thử người-lạ trước R1, nhận một Căn chỉnh tới đích chưa công bố; người thử nói được «đích chưa công bố» và không bấm thử lại quá một lần.
- CHẾT: người thử bấm thử lại nhiều lần hoặc nói «lỗi mạng».
- Timebox: lái-thử người-lạ kế tiếp của dãy Kara OKR.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Không có | — | — | — | — |

## Cổng 0

- **decision = build.** Căn cứ: luật 26 — Ngoài-6 của `kara-gop-y-luot-2`, Cổng 2 2026-10-09T13:04:37Z.
- **disposition = archive.** Căn cứ: không có prototype.

## Thước đo thành công → ứng viên criterion

- Mỗi lý do cố định của `troLyQuyet` hiện đúng câu lý do dưới góp ý → AC.
- Lỗi tạm thời (5xx, quá tải) vẫn là câu thử lại → AC.
- Ở tiếng Anh: theo quyết định của anh ở Cổng Phạm vi.

## Out of scope từ khám phá

- Lỗi của Hoàn tác (đã có câu theo loại từ K3).
- Đổi luật quyết hay luật Căn chỉnh ở máy chủ.
