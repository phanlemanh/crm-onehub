---
schema_version: 1
slug: gop-y-dung-cho
feature: Góp ý của Kara ở khu OKR đặt đúng chỗ — «Kara · N góp ý» trên thẻ Mục tiêu, đề xuất neo ngay dưới từng KR ở khung chi tiết với biên nhận có Hoàn tác, hộp Sửa chỉ còn một dòng dẫn sang
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan
decided_at: 2026-10-01T17:19:47Z
prototype:
  base_commit: 53a707de267eeb3b3f8c02b23597a62075c406b6
  disposition:
---

Gốc: phân tích của chủ kho 01/10 (ảnh hộp Sửa mục tiêu) và khảo sát
`docs/plan/ux-ai-thong-nhat-2026-10-01.md` mục 5. Chủ kho chọn cả A và B (2026-10-01).
Bản mẫu: `/proto/gop-y-dung-cho`, bốn trạng thái. Dựng trên nền của lượt `nen-kara`.

## Vấn đề & ai gặp

- **Không ai thấy góp ý nếu chưa bấm Sửa.** `OkrDeXuat` lưu góp ý theo Mục tiêu với
  `trangThai = "cho"`; màn ngoài (`khoi-muc-tieu.tsx`) không báo gì.
- **Thiếu ngữ cảnh cho góp ý về KR.** Form Sửa mục tiêu không có KR nào; thẻ «Viết lại · Tên KR»
  và câu hỏi «chỉ có một KR…» nói về thứ không có trên màn. Cơ chế chỉ ô chỉ có hai đích
  (`hop-thoai-muc-tieu.tsx:405`, `:498`).
- **Hai cách lưu trong một hộp.** Form là bản nháp cần Lưu, cột thì «Nhận là ghi ngay».
- **Lặp lời.** Câu hỏi «thiếu KR đối trọng» của Kara nói lại cảnh báo cố định
  `CanhBaoDoiTrong` trong `bang-kr.tsx`.

**Người gặp:** người phụ trách và người sửa OKR của một đơn vị đã bật Kara · OKR.

## Giả định chốt sinh tử

- Khung chi tiết Mục tiêu (`objective-sheet.tsx`, tab KR) là nơi người ta xem lại bộ OKR — nếu
  không ai mở nó, đặt góp ý ở đó chỉ dời vấn đề.
- Tỉ lệ góp ý `cho` quá 7 ngày trên production đủ cao để đáng làm (đo trước Cổng Đáng).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: góp ý của Kara có được quyết (nhận, sửa, bỏ qua) thay vì nằm im không?
- Kết quả nào là SỐNG: 30 ngày sau khi lên, ít hơn 30% góp ý còn `cho` quá 7 ngày; tỉ lệ bỏ qua của góp ý về KR không cao hơn góp ý về Mục tiêu quá 15 điểm.
- Kết quả nào là CHẾT: tỉ lệ góp ý nằm im không giảm so với mốc đo trước lượt.
- Timebox: 2026-11-14 — phiên nghiệm thu chung sau khi BK và SV gộp (theo B7)

## Đụng hạt giống khác

`the-gop-y-cot-cuon-rieng` và một phần `the-gop-y-sua-nhanh` (PR #215) sửa cột góp ý trong hộp
Sửa — thứ lượt này gỡ khỏi hộp Mục tiêu. Hộp Sửa KR vẫn giữ cột. Chủ kho quyết ở Cổng Đáng:
gộp, thu hẹp về hộp KR, hay bỏ.

## Câu hỏi mở cho Cổng Đáng

- Hộp Sửa KR: giữ cột (chỉ góp ý của KR đó), hay cũng chuyển sang neo trong khung chi tiết KR?
- Bộ lọc «Có góp ý chờ» trên trang theo đơn vị: vào lượt này hay để sau?
