# Review findings: tro-ly-okr-bo-final-output (round 5)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **With outputSchema removed, the tro_ly_okr result goes back to the non-ZDR root model as free text, breaking the rule that the root only sees constants**
  Người dùng thấy gì: Sau thay đổi này, trợ lý OKR trả lời lại cho phiên chính bằng chữ tự do thay vì một mã cố định. Nếu mô hình không đđáp 'done' mà tóm tắt hay trích nội dung OKR, nội dung đó có thể đi tới nhà cung cấp mô hình không cam kết xoá dữ liệu (ZDR). Hiện chỉ có lời dặn trong chỉ dẫn, chưa có gì chặn thật.
  file: `apps/agent/agent/subagents/tro_ly_okr/agent.ts`
  severity: high
  Đề xuất: new-contract

- **The okr-chuyen-tiep test 'kết quả về gốc… không có chữ tự do' still passes, but it now checks a schema that no longer controls the output**
  Người dùng thấy gì: Có một bài kiểm tra báo xanh rằng kết quả gửi về phiên chính không chứa chữ tự do, nhưng nó đang kiểm một khuôn không còn quyết định gì. Bài kiểm tra xanh nên tạo cảm giác an toàn giả cho điểm riêng tư này.
  file: `apps/agent/test/okr-chuyen-tiep.spec.ts`
  severity: medium
  Đề xuất: new-contract

- **The literal outcome 'da-nop' now has two sources: the agent config and the dead ketQuaTroLy schema that the app reads**
  Người dùng thấy gì: Chữ 'đã nộp' được ghi ở hai nơi riêng nhau. Hôm nay hai nơi khớp nên màn góp ý hiển thị đúng, nhưng nếu ai đổi một nơi mà quên nơi kia thì một lần góp ý thành công sẽ hiện như bị lỗi.
  file: `apps/agent/agent/lib/okr/config.ts`
  severity: medium
  Đề xuất: known-limits

- **The 'khong-lam-duoc:' prefix is built inline in viec.ts, not taken from the TRO_LY_OKR.ketThuc config**
  Người dùng thấy gì: Một tiền tố của mã lý do không làm được nằm riêng ở một chỗ thay vì chung với các mã khác. Người dùng không thấy khác biệt nào; chỉ gây khó cho người sửa sau này.
  file: `apps/agent/agent/lib/okr/viec.ts`
  severity: low
  Đề xuất: wont-fix

- **Stopping the measurement leaves the real model eval running**
  Người dùng thấy gì: Nếu dừng phép đo giữa chừng, bài kiểm tra dùng mô hình thật vẫn chạy ngầm và tiếp tục tiêu hạn mức chi của team, đồng thời có thể làm lệch số đo của lần chạy kế tiếp. Dừng bằng Ctrl-C trong terminal thì không bị.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **"Already submitted" weekly-summary paths leave the task open, so the hook labels it hong:khong-nop**
  Người dùng thấy gì: Khi một bản tóm tắt tuần đã có sẵn cho phòng đó và tuần đó, hoặc khi việc ghi bị lỗi sau lúc đã lưu xong, việc được ghi nhận là thất bại dù nội dung đã nằm trong hệ thống. Người theo dõi sẽ thấy báo lỗi sai và có thể làm lại không cần thiết.
  file: `apps/agent/agent/lib/okr/nop-tom-tat.ts`
  severity: low
  Đề xuất: new-contract

- **Hinh dang 2 (fixture viet tay dung khuon ben doc): bo dem outputSchema chi duoc tu-kiem bang mot span sua tay, trace that truoc ban sua khong bao gio sinh khuon do**
  Người dùng thấy gì: Một trong hai kiểm tra trong phép đo mô hình thật chỉ được chứng minh bằng dữ liệu viết tay, chưa từng gặp trong dữ liệu thật. Kiểm tra còn lại vẫn chắc, nên kết luận 'không còn lỗi cũ' không bị lung lay đáng kể.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hinh dang 2 (trang thai viet tay thay cho writer): test giu-viec tuyen 'tool nop dong da-nop' nhung tu dong viec bang dongDaNop**
  Người dùng thấy gì: Mot bai kiem tra ve viec giu nguyen ket qua da nop co ten noi rong hon nhung gi no thuc su kiem tra. Nguoi dung khong bi anh huong: viec 'nop xong thi dong viec' van duoc kiem o mot bai khac, nen chi can chap nhan va ghi vet.
  file: `apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hinh dang 3 (assert chuoi co mat thay cho quan he): kiem 'ket bang done' qua bat cu cho nao co chu `done`**
  Người dùng thấy gì: Bài kiểm tra chỉ thấy chữ 'done' xuất hiện đâu đó trong chỉ dẫn chứ không đảm bảo đúng chỗ. Nếu ai xoá nhầm một dòng chỉ dẫn, bài này có thể không báo, nhưng phần chấm bằng nhận xét vẫn bắt được.
  file: `apps/agent/test/tro-ly-okr-khong-khuon-ra.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **The model measurement script hard-codes millisecond values instead of building them from one minute/second base (r4)**
  Người dùng thấy gì: Các con số thời gian trong công cụ đo được viết thẳng thay vì đặt từ một đơn vị gốc. Người dùng không thấy gì khác đi: sản phẩm chạy như cũ, chỉ là sau này sửa một số có thể làm dòng báo thời gian ghi lệch.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: wont-fix

- **Stopping the measurement only kills the direct child; the `eve eval` started under it keeps running after the 'KET THUC' line (r4)**
  Người dùng thấy gì: Nếu người vận hành ngắt lượt đo giữa chừng, tiến trình gọi model thật có thể vẫn chạy ngầm và tiếp tục tốn tiền, trong khi nhật ký đã báo là đã dừng. Sản phẩm của người dùng cuối không bị ảnh hưởng.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: medium
  Đề xuất: known-limits

- **The 'tests running in this tree' check matches by path prefix, so it also counts worktrees nested inside the tree (r4)**
  Người dùng thấy gì: Khi đo từ thư mục chính, công cụ có thể tưởng bộ test của một bản làm việc khác đang chạy nên chờ lâu, tối đa 45 phút, rồi vẫn đo. Chỉ làm chậm lượt đo, không làm sai chức năng nào của sản phẩm.
  file: `_acceptance/tro-ly-okr-bo-final-output/rang/do-mo-hinh.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): «bộ test của cây đã yên» được chấp nhận chỉ vì đếm ra 0, không có đối chứng dương nào chứng minh bộ đếm thấy được một tiến trình test đang chạy (r4)**
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

## Chưa adversarial-verify (refuter chết)

Không có.

⚠ Cụm ngoài vùng phủ: 3/9 lỗi rơi vào file không bộ đo nào phủ (apps/agent/test/okr-chuyen-tiep.spec.ts, apps/agent/agent/lib/okr/config.ts, apps/agent/test/tro-ly-okr-giu-viec.integration.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
