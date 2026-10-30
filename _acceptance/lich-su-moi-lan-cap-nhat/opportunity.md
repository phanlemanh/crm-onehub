---
schema_version: 1
slug: lich-su-moi-lan-cap-nhat
feature: Người phụ trách KR mở chi tiết KR và thấy trong Lịch sử mọi lần cập nhật, kể cả nhiều lần trong một tuần, và biểu đồ có một điểm cho mỗi lần
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Phan Le Manh
decided_at: 2026-10-28T12:37:24Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: SV7
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng SV7 của «OKR» (`docs/plan/lo-trinh-okr.json`).
Nguồn: chưa có trang: trang nền, trang đợt okr-sau-vo-khu-2410, mã LS
Mốc: chưa gắn — việc này chưa thuộc mốc nào của kế hoạch; gắn nó vào một mốc, hoặc ghi vì sao chưa.

Người phụ trách KR mở chi tiết KR và thấy trong Lịch sử mọi lần cập nhật, kể cả nhiều lần trong một tuần, và biểu đồ có một điểm cho mỗi lần

Vì sao: Ngăn KR gom lịch sử theo tuần, nên gửi lần thứ hai trong tuần thì số dòng lịch sử không tăng. OkrCheckIn không có khoá duy nhất theo tuần (chỉ @@index([weekStart]) ở packages/db/prisma/schema.prisma), và «Cập nhật» ghi lúc nào cũng được (CONTEXT.md 24/10). Tability: Timeline của ngăn KR hiện từng lần kèm số, mức đổi và câu phân tích (README hop-tuan, ảnh tab/t03b-ngan-kr-dong-thoi-gian.jpg).

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Gửi hai lần cập nhật cho một KR trong cùng tuần: Lịch sử tăng hai dòng và biểu đồ có hai điểm» chưa?
- Kết quả nào là SỐNG: Gửi hai lần cập nhật cho một KR trong cùng tuần: Lịch sử tăng hai dòng và biểu đồ có hai điểm
- Kết quả nào là CHẾT: chưa đạt «Gửi hai lần cập nhật cho một KR trong cùng tuần: Lịch sử tăng hai dòng và biểu đồ có hai điểm» khi hết timebox
- Timebox: tới 2026-10-29

Cổng Đáng 2026-10-28, chủ kho nguyên văn ở phiên giám sát: «SV7 Cổng Đáng: build; timebox tới 2026-10-29; ngưỡng giữ như đề xuất».
