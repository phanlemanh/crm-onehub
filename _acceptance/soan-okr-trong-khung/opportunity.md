---
schema_version: 1
slug: soan-okr-trong-khung
feature: "Soạn OKR mở trong khung bản ghi như deal, Kara cố định bên phải, bản nháp mở thêm về bên trái"
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-10-09T07:38:00Z
prototype:
  base_commit: 660f3e436dcf4b6381f440540db9cf916e27f9a6
  disposition: keep
---

## Vấn đề & ai gặp

Trưởng phòng soạn bộ OKR với Kara trên một trang riêng `/okr/soan/<cuộc>` (K2, #312), còn mọi bản ghi khác (deal,
công ty, Mục tiêu, KR) mở bằng khung trượt từ phải. Chủ kho chỉ ra ngày 09/10 kèm hai ảnh màn: hai cách mở cho cùng
loại việc, đầu trang lớn và ô hội thoại rỗng phí chỗ, cột chat «như bị mất khung», và liên kết Kara đưa ra sau này phải
biết hai cách mở.

## Quyết định Cổng Đáng

Lời giao thẳng của chủ kho trong phiên 09/10 được tính là quyết định `build` (tiền lệ luật 26 của đợt `sau-14-10`,
giám sát soát lối ngày 09/10). Nguyên văn:

> «1. Đồng ý lật quyết định
> 2. Cố định không gian soạn, mở thêm không gian canvas/artifact/okr nháp,...-> Cao hơn không có không gian chết, cố
> định từng không gian và chuẩn hóa.
> 3. Đồng ý áp cho soạn OKR bây giờ
> 4. Trong ảnh soạn OKR nháp bên khung soạn có cảm giác như bị mất khung.»

`decided_at` là giờ ước theo nhật ký phiên — tin giao tới ngay trước đơn khoá đường nền đầu tiên của phiên
(`2026-10-09T07:44:56Z`); máy không có dấu giờ chính xác của tin.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một cách mở cho mọi bản ghi làm người tìm Kara và bản nháp nhanh hơn trang riêng | khung chỉ đổi vỏ, không đổi gì cho người | lái thử người lạ: chỉ ra Kara và bản nháp ngay lần đầu nhìn | Chưa thử |
| 2 | Đóng khung không làm mất lượt Kara hay số đã gõ | người mất công, bỏ dùng khung | AC-7, AC-8 trên phiên đo; nhật ký lái thử | Chưa thử |
| 3 | Bề ngang cố định 380 + tối đa 800 đủ chỗ soạn ở màn 1280–1920 | người đòi quay lại trang riêng | lái thử ở 1280 và 1440 | Chưa thử |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: khung soạn có giữ được nhịp soạn của trang riêng mà không mất lượt hay số, và người có tìm ngay ra Kara và bản nháp không.
- Kết quả nào là SỐNG: trong lái thử người lạ (≥ 3 người đóng vai trưởng phòng), ≥ 2/3 đưa được bộ OKR vào trong ≤ 15 phút (giữ ngưỡng K2), 0 lần mất lượt Kara hay mất số đã gõ khi đóng và mở lại khung, và ≥ 4/5 lần nhìn đầu người chỉ đúng Kara và bản nháp không cần hỏi.
- Kết quả nào là CHẾT: có ít nhất một lần mất lượt hay mất số do đóng khung; hoặc dưới 1/2 đưa được bộ OKR vào trong 15 phút; hoặc ≥ 2/3 người thử nói muốn quay lại trang riêng vì thiếu chỗ.
- Timebox: một buổi lái thử người lạ trong 2 ngày sau khi gộp vào onehub, trước phiên nghiệm thu.

## Kết quả prototype

Bản mẫu `/proto/soan-okr-trong-khung` (thành phần thật, dữ liệu giả) dựng và chụp 80 ảnh ở S1-D; chủ kho duyệt hướng
qua hình phác ba trạng thái và bốn block ReUI `ai-chat-2/4/6/8`. Không đo ngưỡng trên bản mẫu — ngưỡng đo ở lái thử
và UAT trên sản phẩm thật.

## Nguồn ngoài & phạm vi kế thừa

- ReUI `ai-chat-2`, `-4`, `-6`, `-8` (block Pro): chỉ là bản vẽ bố cục, không cài (`docs/design.md` bậc 4).
- Ảnh màn của chủ kho 09/10 (khung Mục tiêu, trang Soạn OKR): vật liệu đề bài, không chép vào kho.
