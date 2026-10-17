---
schema_version: 1
slug: lam-moi-goi-y-ke-hoach
feature: Đổi giai đoạn ngay trên sheet deal thì thẻ gợi ý mở kế hoạch hiện ngay khi sang Chốt được và ẩn ngay khi rời Chốt được
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-17T10:08:54Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DA3c
lo_trinh_tep: docs/plan/lo-trinh-viec-du-an.json
---

Gốc: Ngoài-16 của `_acceptance/goi-y-mo-ke-hoach/` (DA3b, phanlemanh/crm-onehub#447) — anh chọn «mở hợp đồng mới» ở Cổng Bằng chứng 16/10/2026 (dòng sổ d-20261016T130310Z-38). Mục tiêu và ngưỡng 14 ngày của DA3b là nền của vòng này.

CHÍNH SÁCH ĐỢT: chạm trần 3 lượt → thu phạm vi · đỏ sẵn trên nền → tách vòng vệ sinh · giữ cỡ khi tiêu chí là rào chắn.

## Vấn đề & ai gặp

Người phụ trách deal. Khi họ chuyển deal sang giai đoạn Chốt được ngay trên sheet deal đang mở (thanh giai đoạn
`StageStepper` hay menu giai đoạn ở đầu sheet `DealStageMenu`), thẻ «Deal đã thắng — mở kế hoạch 30 ngày cho
<công ty>?» không hiện: thẻ đọc `onboarding.goiYCuaDeal`, query ấy giữ kết quả cũ (`null`) tới 30 giây, và
`useCrmCache().deal(id)` — lệnh làm mới chung sau mọi lần đổi giai đoạn — không làm mới nó. Họ phải đợi khoảng nửa
phút hay đóng rồi mở lại sheet. Chiều ngược lại cũng vậy: deal rời Chốt được thì thẻ cũ còn trên sheet một lúc, mời mở
kế hoạch cho một deal không còn ở Chốt được. Thẻ là kênh chính để người phụ trách xử lý gợi ý — mà ngưỡng đã ký của DA3b
đếm tỉ lệ gợi ý được xử lý trong 3 ngày.

Nguồn: Ngoài-16 của `goi-y-mo-ke-hoach` (DA3b, phanlemanh/crm-onehub#447), S4 round 1 (2026-10-16); anh chọn «mở
hợp đồng mới» ở Cổng Bằng chứng 2026-10-16 (dòng sổ d-20261016T130310Z-38 của
`_acceptance/goi-y-mo-ke-hoach/decisions.jsonl`). Chọn đó mở việc; Cổng Đáng của vòng này vẫn do anh ký ở đây.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Người phụ trách hay đổi giai đoạn sang Chốt được ngay trên sheet deal (không chỉ ở Kanban hay danh sách) | việc này ít người gặp | không cần — sheet có hai điều khiển đổi giai đoạn và cả hai dùng chung lệnh làm mới | Chấp nhận |
| 2 | Thẻ hiện ngay lúc sang Chốt được làm người ta xử lý gợi ý sớm hơn so với lúc mở lại sheet | thẻ hiện muộn cũng chẳng sao | đọc ở phiên nghiệm thu cùng ngưỡng của DA3b | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: người phụ trách chuyển deal sang Chốt được ngay trên sheet deal có thấy thẻ gợi ý trước khi rời sheet, và chuyển deal ra khỏi Chốt được thì thẻ có mất không?
- Kết quả nào là SỐNG: ở phiên nghiệm thu, người thử chuyển deal của một công ty chưa có kế hoạch sang Chốt được trên sheet: thẻ hiện trong vòng 2 giây, không phải đóng mở lại sheet; chuyển deal về giai đoạn Đang mở thì thẻ mất trong vòng 2 giây; 0 lần hỏi.
- Kết quả nào là CHẾT: người thử phải đóng mở lại sheet hoặc chờ quá vài giây mới thấy thẻ, hoặc thẻ còn trên deal đã rời Chốt được.
- Timebox: phiên nghiệm thu đầu tiên sau khi lên production, cùng phiên đọc ngưỡng 14 ngày của DA3b.

## Kết quả prototype

Không dựng prototype: lỗi đã thấy và định vị ở S4 của DA3b (`apps/app/lib/trpc/cache.ts`, khối `deal`).

## Nguồn ngoài & phạm vi kế thừa

Không có vật liệu ngoài kho.
