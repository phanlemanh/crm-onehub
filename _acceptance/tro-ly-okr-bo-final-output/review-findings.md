# Review findings: tro-ly-okr-bo-final-output (round 3)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A crash before the log is cleared leaves the previous run's 'KET THUC ma <n>' line in place, and the grader takes that as the result**
  Người dùng thấy gì: Phép đo thử Trợ lý OKR với model thật có thể đọc nhầm kết quả của lần chạy trước. Nếu lần chạy mới hỏng ngay từ đầu, người chấm vẫn có thể thấy một kết quả «đạt» cũ và ghi nhận như thật.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **If the process is killed by a signal, no 'KET THUC' line is written, so a grader waiting for that line has no ending**
  Người dùng thấy gì: Nếu phép đo Trợ lý OKR bị công cụ cắt ngang giữa chừng, người chấm không nhận được dấu hiệu kết thúc nên không biết lần đo đã xong hay đã chết. Phải chạy lại phép đo, và những lần đo dài có thể phải làm lại nhiều lần.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **The old output schema ketQuaTroLy is still the app's source for "da-nop", while the agent now writes it from its own config (r2)**
  Người dùng thấy gì: Hom nay the gop y cua Kara dua vao mot khai bao cu de nhan ra viec da nop xong, trong khi tro ly lai ghi ket qua theo cau hinh rieng cua no. Neu ai do xoa khai bao cu hoac doi ten ma, moi viec da xong se hien thanh loi tren man gop y ma khong co kiem tra nao bao.
  file: `packages/validation/src/okr-tro-ly.ts`
  severity: medium
  Đề xuất: new-contract

- **The submit tools write their rows and close the task in two separate statements; the "already submitted" branch never closes the task (r2)**
  Người dùng thấy gì: Neu co loi co so du lieu rat hiem ngay luc dong viec, cac de xuat hoac ban tom tat van duoc luu nhung viec bi danh dau la hong. Man gop y se hien loi, va lan sau he thong co the chay lai mo hinh cho cung yeu cau, ton them chi phi AI.
  file: `apps/agent/agent/lib/okr/nop-de-xuat.ts`
  severity: low
  Đề xuất: known-limits

- **The 'already submitted' branches do not close the task, so a write that lands without its close ends up as hong:khong-nop (r2)**
  Người dùng thấy gì: Sau mot loi hiem luc dong viec, de xuat da luu van nam o trang thai cho duyet nhung viec lai bi tinh la that bai. Nguoi dung thay thong bao loi tren the gop y du noi dung da co, va he thong co the tra them chi phi AI de lam lai.
  file: `apps/agent/agent/lib/okr/nop-de-xuat.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 2, hand-written fixture: the giu-viec test writes da-nop itself instead of having the submit tool write it, so the final assert cannot fail (r2)**
  Người dùng thấy gì: Mot bai kiem tra tu ghi san ket qua roi doc lai, nen no se van xanh du viec dong viec trong cong cu nop co hong. Phan kiem tra nay chua chung minh duoc rang cong cu nop thuc su tu dong viec.
  file: `apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
