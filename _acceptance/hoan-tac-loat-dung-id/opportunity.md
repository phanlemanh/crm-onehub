---
schema_version: 1
slug: hoan-tac-loat-dung-id
feature: «Hoàn tác hàng loạt đúng bản đã cất» — lưu trữ hàng loạt trả về đúng các bản thật sự đã cất; Hoàn tác chỉ khôi phục những bản đó và nói thật khi có bản không khôi phục được
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-09T16:34:54Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
---

Nguồn: Ngoài-1, Ngoài-2, Ngoài-3 của V2 `vong-doi-mot-cach-cat` (#346), cùng một gốc. Anh chọn «mở hợp đồng mới» cho cả ba ở Cổng
2 lúc 2026-10-09T16:34:54Z — theo luật 26 đó là Cổng Đáng `build`. Hàng V2d, dãy P2, ưu tiên 3.05, chờ V2 và E4 gộp; V2a đứng
sau hàng này.

## Vấn đề & ai gặp

«Hoàn tác hàng loạt đúng bản đã cất»

Người gặp: người bán và quản lý dọn danh sách cá nhân, công ty, thoả thuận bằng thao tác hàng loạt rồi bấm «Hoàn tác» vì lỡ tay.

Lưu trữ hàng loạt (`bulkArchive` của ba service, qua `runBulk` ở `apps/api/src/crm/bulk.ts`) chỉ trả số đếm. V2 vì vậy cho
«Hoàn tác» gửi lại cả danh sách id đã chọn. Ba hậu quả:

- Một bản đã có người khác cất từ trước (danh sách của mình còn cũ) vẫn đếm là «đã lưu trữ», và «Hoàn tác» khôi phục luôn nó —
  đảo ngược việc của người khác (Ngoài-2).
- Khi «Hoàn tác» có bản không khôi phục được (vd vừa bị xoá vĩnh viễn), toast vẫn chỉ báo xanh «Đã khôi phục n …»; người dùng
  tưởng mọi bản đã về (Ngoài-1).
- Lưu trữ hàng loạt có bản bị bỏ qua thì toast kèm câu lỗi tiếng Anh thô của máy chủ («No contact with id …») (Ngoài-3).

## Ngưỡng chết / ngưỡng UAT

- [đề xuất] Câu hỏi phép đo trả lời: sau khi lưu trữ hàng loạt rồi «Hoàn tác», có đúng những bản mình vừa cất quay lại — không
  hơn, không kém — và toast có nói thật số bản không về được, bằng tiếng của người dùng, không?
- [đề xuất] Kết quả nào là SỐNG: trên máy chủ thật, bản đã cất từ trước không bao giờ bị «Hoàn tác» khôi phục; toast «Hoàn tác»
  ghi đúng số đã khôi phục và số không khôi phục được; 0 toast lưu trữ hay hoàn tác chứa câu lỗi tiếng Anh thô của máy chủ.
- [đề xuất] Kết quả nào là CHẾT: «Hoàn tác» còn khôi phục một bản người khác đã cất trước; hoặc còn toast xanh khi có bản không
  khôi phục được; hoặc còn câu lỗi máy chủ thô trên toast.
- [đề xuất] Timebox: 1 ngày máy.

## Đường đo

- Thước: số bản đã cất từ trước bị «Hoàn tác» khôi phục (mong 0) · số từ: bài máy chủ thật `apps/api/test/hoan-tac-loat-dung-id.spec.ts`
  và răng màn trên trình duyệt thật
- Thước: số toast lưu trữ/hoàn tác chứa câu lỗi máy chủ thô (mong 0) · số từ: bài DOM `apps/app/test/hoan-tac-loat-dung-id.dom.tsx`
  và răng màn
