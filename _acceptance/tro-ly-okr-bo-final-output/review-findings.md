# Review findings — tro-ly-okr-bo-final-output (vòng 4)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The model measurement script hard-codes millisecond values instead of building them from one minute/second base**
  Người dùng thấy gì: Các con số thời gian trong công cụ đo được viết thẳng thay vì đặt từ một đơn vị gốc. Người dùng không thấy gì khác đi: sản phẩm chạy như cũ, chỉ là sau này sửa một số có thể làm dòng báo thời gian ghi lệch.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **Stopping the measurement only kills the direct child; the `eve eval` started under it keeps running after the 'KET THUC' line**
  Người dùng thấy gì: Nếu người vận hành ngắt lượt đo giữa chừng, tiến trình gọi model thật có thể vẫn chạy ngầm và tiếp tục tốn tiền, trong khi nhật ký đã báo là đã dừng. Sản phẩm của người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **The 'tests running in this tree' check matches by path prefix, so it also counts worktrees nested inside the tree**
  Người dùng thấy gì: Khi đo từ thư mục chính, công cụ có thể tưởng bộ test của một bản làm việc khác đang chạy nên chờ lâu, tối đa 45 phút, rồi vẫn đo. Chỉ làm chậm lượt đo, không làm sai chức năng nào của sản phẩm.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «bộ test của cây đã yên» được chấp nhận chỉ vì đếm ra 0, không có đối chứng dương nào chứng minh bộ đếm thấy được một tiến trình test đang chạy**
  Người dùng thấy gì: Dòng nhật ký báo bộ test đã yên có thể in ra dù công cụ thực ra không nhìn thấy test nào đang chạy. Người đọc bằng chứng không phân biệt được lần chờ thật với lần chờ mù, nên số đo của một lượt có thể chạy chồng mà không ai biết.
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

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
