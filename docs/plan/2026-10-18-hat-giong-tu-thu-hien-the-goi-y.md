# Hạt giống — Thước màn của thẻ gợi ý mở kế hoạch: lượt tự thử chiều hiện chưa chứng được cú bấm đã thành

Gốc: `_acceptance/lam-moi-goi-y-ke-hoach/` (DA3c), Cổng Bằng chứng 18/10/2026. S4 chạm trần 3 lượt, chủ kho (manh)
chọn thu phạm vi: vế «lượt tự thử chiều hiện» của AC-6 ra Known limits (mục Notes của hợp đồng) và mở hạt giống này.
Phát hiện gốc: t2 của S4 lượt 3 trong `review-findings.md`. Hạt giống là SỔ, không phải ô: mở thành hàng khi chủ kho
xếp nó vào lộ trình Việc và Dự án.

## Lỗ

Thước màn E6 (`_acceptance/lam-moi-goi-y-ke-hoach/rang/man.mjs`, bước 0) tự thử chiều đỏ trước lượt thật: giữ treo mọi
yêu cầu có `goiYCuaDeal` trong URL, bấm cột Chốt được trên thanh giai đoạn, rồi đòi thẻ KHÔNG hiện. Thẻ không hiện được
tính ngay là «thước có răng». Nhưng sau cú bấm không có mốc nào cho thấy đổi giai đoạn đã thật sự xảy ra. Thêm nữa, app
gom các lần đọc vào một yêu cầu chung (`httpBatchLink` ở `apps/app/lib/trpc/client.tsx`), nên bộ giữ treo chặn luôn lần
đọc deal và cả loạt đọc lại. Một cú bấm không tới máy chủ, hay một trang đứng hẳn, cũng in đúng dòng
«E6 hien sau thang: KHONG DAT». Lượt tự thử chiều mất (thêm 18/10) không có lỗ này vì nó đợi thẻ hiện rồi mới treo.

## Vì sao chưa làm ở DA3c

Vòng đã chạm trần 3 lượt S4, và hai lượt cuối hỏng cùng lớp «kiểm âm tính đứng một mình». Chính sách đợt M5 là chạm
trần thì thu phạm vi, không mở lượt 4. Tính năng không bị ảnh hưởng: lượt thật của E6 vẫn đo thẻ hiện và mất trong 5
giây, sheet không dựng lại. Chiều thẻ hiện vẫn có chiều đỏ ở lớp bài kiểm giao diện (`dot-bien.mjs` cặp a).

## Hướng

Một hàng T2 nhỏ, chỉ sửa thước: sau cú bấm trong lượt tự thử chiều hiện, thêm mốc dương rằng đổi giai đoạn đã thành.
Có thể đọc lại deal qua API của người P (giai đoạn là Chốt được), hoặc thấy cột Chốt được đang chọn trên thanh giai
đoạn, trong khi thẻ vẫn vắng. Có thể cân thêm việc chỉ giữ treo đúng phần đọc gợi ý trong yêu cầu gom, thay vì cả yêu
cầu. Cặp hai chiều trên cùng bàn đo: bản đúng thì lượt tự thử báo «KHONG DAT» kèm mốc «đã sang Chốt được»; bản phá
(cú bấm không gửi đi) thì lượt tự thử phải báo «không đo được», không được báo «KHONG DAT».
