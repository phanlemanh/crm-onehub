# Review findings: tro-ly-okr-bo-final-output (round 3)

## Trong hợp đồng

Không có finding nào map được vào tiêu chí.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New missing-data rule in the weekly summary instructions can never reach the model**
  Người dùng thấy gì: Khi tóm tắt tuần mà thiếu dữ liệu, dòng dặn trợ lý «không làm gì, trả lời done» được viết thêm nhưng thực tế không bao giờ đến được trợ lý. Việc vẫn được bảo vệ bằng quy định chung ở chỗ khác, nên người dùng không thấy khác biệt, chỉ là có một dòng dặn thừa.
  file: `apps/agent/agent/lib/okr/chi-dan-tom-tat.ts`
  severity: medium
  Đề xuất: known-limits

- **E6's 'wait until the [e17] line' instruction has no exit when the script stops early**
  Người dùng thấy gì: Nếu bài đo tự động dừng giữa chừng vì lỗi, người chấm có thể cứ chờ mãi đến hết giờ rồi báo «bị kẹt» thay vì báo đúng lỗi đã xảy ra. Chỉ ảnh hưởng việc kiểm thử nội bộ, không ảnh hưởng người dùng cuối.
  file: `_acceptance/tro-ly-okr-bo-final-output/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Shape 1 (đo CHỈ DẪN thay vì ĐẦU RA): E2 chấm câu «thiếu khối dữ liệu» của chi-dan-tom-tat.ts, nhưng bộ dựng chỉ dẫn không bao giờ đưa câu đó cho model khi khối dữ liệu thiếu**
  Người dùng thấy gì: Bài kiểm tra hiện chỉ xác nhận câu dặn có nằm trong văn bản, chứ chưa thử xem khi tóm tắt tuần thiếu dữ liệu thì trợ lý thực sự nhận được gì và làm gì. Có thể bài kiểm tra báo đạt trong khi tình huống thiếu dữ liệu thật chưa được thử.
  file: `_acceptance/tro-ly-okr-bo-final-output/evals.yaml`
  severity: medium
  Đề xuất: new-contract

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

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tro-ly-okr-bo-final-output/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
