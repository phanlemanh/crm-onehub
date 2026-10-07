# Review findings: tro-ly-okr-bo-final-output (round 5)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E11 không khai okr/config.ts trong paths dù thước nay đọc MO_HINH từ tệp đó**
  Người dùng thấy gì: Nếu sau này ai đổi model của Trợ lý OKR, bằng chứng «phiên gốc chạy đúng model» đã ký vẫn hiện là còn hiệu lực dù thứ nó đo đã đổi, nên có thể không ai được nhắc chạy lại.
  file: `_acceptance/tro-ly-okr-bo-final-output/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E10 không khai packages/ai-okr, nơi thật sự gắn cờ ZDR ở bước gốc**
  Người dùng thấy gì: Nếu có người sửa phần dùng chung làm rơi cờ không lưu dữ liệu ở phiên gốc của Trợ lý OKR, bằng chứng đã ký vẫn báo ổn và không có gì yêu cầu kiểm lại, nên nội dung OKR có thể đi tới nhà cung cấp mô hình mà không ai biết.
  file: `_acceptance/tro-ly-okr-bo-final-output/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Phiên gốc okr dựng tay tùy chọn ZDR ngay ở chỗ gọi, không lấy từ cấu hình của Trợ lý**
  Người dùng thấy gì: Cờ không lưu dữ liệu và thẻ của Trợ lý OKR giờ được ghi ở ba nơi; sau này đổi thẻ hay cờ ở một nơi thì phiên gốc có thể vẫn dùng giá trị cũ mà không báo lỗi.
  file: `apps/agent/agent/lib/model.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, thiếu đối chứng dương): phần tự kiểm của E11 chỉ đòi «bắt được bước sai model», chưa từng thử «bước đúng model thì không bị đếm»**
  Người dùng thấy gì: Phép tự kiểm của bộ đo model chưa chứng minh được nó phân biệt bước đúng với bước sai, nhưng nếu nó sai thì chỉ báo đỏ nhầm chứ không cho qua nhầm, nên người dùng không chịu hậu quả.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (đo một chuỗi có mặt thay cho quan hệ cần chứng minh): cột «goc-khong-zdr» của E11 chỉ so mã model, không đo cờ ZDR**
  Người dùng thấy gì: Dòng báo «không có ZDR» trong kết quả đo chỉ kiểm phiên gốc có dùng đúng model hay không, chưa kiểm cờ không lưu dữ liệu ở lần chạy thật, nên người đọc có thể tin điều đó đã được xác nhận khi chạy thật hơn thực tế.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **New missing-data rule in the weekly summary instructions can never reach the model (r3)**
  Người dùng thấy gì: Khi tóm tắt tuần mà thiếu dữ liệu, dòng dặn trợ lý «không làm gì, trả lời done» được viết thêm nhưng thực tế không bao giờ đến được trợ lý. Việc vẫn được bảo vệ bằng quy định chung ở chỗ khác, nên người dùng không thấy khác biệt, chỉ là có một dòng dặn thừa.
  file: `apps/agent/agent/lib/okr/chi-dan-tom-tat.ts`
  severity: medium
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

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/tro-ly-okr-bo-final-output/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
