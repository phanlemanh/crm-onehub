---
schema_version: 1
slug: dieu-phoi-va
feature: «Mã đối tác không khớp vẫn có người xử lý; kế hoạch rỗng thêm được bước; thẻ quá hạn báo còn sót»
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-07T13:13:50Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: E6
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng E6 của «OKR» (`docs/plan/lo-trinh-okr.json`).

«Mã đối tác không khớp vẫn có người xử lý; kế hoạch rỗng thêm được bước; thẻ quá hạn báo còn sót»

Bản khảo sát lộ trình 04/10 (mục #38 #39 #40) đã mất cùng worktree khảo sát; ba lỗi được dò lại từ mã ở S1.

Cổng Đáng: build — chủ kho ký cho E3, E1, E4, E5, E6 lúc 2026-10-07T13:13:50Z (luật 16 của đợt sau-14-10).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau khi lên production, mã đối tác lệch có tới tay người, kế hoạch rỗng có thêm được bước, và thẻ quá hạn có nói đúng số không?
- Kết quả nào là SỐNG: ở phiên nghiệm thu, (1) mọi mã lệch của lô thật trong 7 ngày đầu đều thành việc mở của người cầm trịch kế hoạch, 0 hàng `onboarding-identify` rút vì hết lượt; (2) người thử thêm được bước đầu cho một kế hoạch rỗng và bước cho một bộ phận chưa có bước, 0 lần hỏi; (3) số trên thẻ «Việc quá hạn» bằng số đếm thẳng trong cơ sở dữ liệu cho cùng người.
- Kết quả nào là CHẾT: một mã lệch không thành việc của ai; hoặc kế hoạch rỗng vẫn không thêm được bước từ màn; hoặc thẻ ghi số khác số đếm thật.
- Timebox: phiên nghiệm thu đầu tiên sau khi lên production, chậm nhất 2026-10-21.

Bản khảo sát gốc mất nên ba lỗi được dò lại ngày 09/10: (1) `onboarding-identify` không có trong `TASK_KINDS`, tác nhân không xử lý, không ai được báo; (2) `plan-steps.tsx` chỉ có nút thêm bước trong nhóm bộ phận đã có bước (Ngoài-5 của `ke-hoach-la-mot-ban-ghi`); (3) thẻ «Việc quá hạn» đếm trên danh sách đã cắt 10.
