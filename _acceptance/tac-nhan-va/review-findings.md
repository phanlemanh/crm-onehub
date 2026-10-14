# Review findings: tac-nhan-va (vòng 2)

## Trong hợp đồng

- **Hình dạng 3 (chỉ khẳng định chuỗi có mặt trong khi lời hứa là một quan hệ): ở E9, khẳng định trên màn không phân biệt được câu hỏi thứ hai với câu thứ nhất**
  AC: AC-9
  file: `_acceptance/tac-nhan-va/rang/khu-hoi.mjs:181`
  severity: medium
  source: measurement
  detail: Dòng màn man-cau-hoi-<khổ> chỉ kiểm document.body.innerText.includes(mong.prompt) (dòng 182–186) và có nút questionnaire-choice mang nhãn mong.options[0].label (dòng 191–204). Hai payload question đều do hoi_thu/agent.ts sinh ra với cùng CAU_HOI_THU.prompt «chon mot» và cùng lựa chọn «A» (fixture hai-luot-hoi-that.json cho thấy chúng chỉ khác nhau ở requestId). Vì thế màn hiện câu thứ nhất hay câu thứ hai thì dòng màn vẫn đạt như nhau, nên không đo được vế AC-9 «màn đọc đúng đầu ra đó». Chỉ dòng may-chu (dòng 167–171) nối với requestId. Ngoài ra, vế mà expected của evals.yaml hứa là «ô soạn thường không hiện» không có khẳng định nào trong script: ô câu hỏi hiện cùng ô soạn thì vẫn đạt.

- **Hình dạng 3 (chỉ khẳng định chuỗi có mặt trong khi lời hứa là một quan hệ): ở E4, «thấy được trong khung nhìn» chỉ được đo bằng innerText chứa chữ**
  AC: AC-4
  file: `_acceptance/tac-nhan-va/rang/man.mjs:325`
  severity: medium
  source: measurement
  detail: AC-4 hứa mỗi mục thoả thuận ở 375 «thấy được tên, công ty, giai đoạn và số tiền trong khung nhìn», và expected còn ghi «kiểm từng mục nằm trong khung nhìn khi cuộn tới». Script chỉ lọc mục có getClientRects().length > 0 (dòng 308–310) rồi kiểm chu.includes(d.name / company / stage / tien) trên innerText (dòng 325–338). Script không cuộn tới từng mục, cũng không so getBoundingClientRect của mục hay của từng phần với khung nhìn. innerText vẫn trả đủ chữ khi chữ bị cắt bằng CSS: ItemTitle của packages/ui mang line-clamp-1 (packages/ui/src/components/item.tsx dòng 133). Vì vậy một tên hay một số tiền bị cắt hoặc tràn ra ngoài khung (mà overflow hidden giữ không cho trang cuộn ngang) vẫn đạt.

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): ở E4, «ngăn lượt chạy không tràn» có chiều đỏ được tuyên bố nhưng không thể xảy ra**
  AC: AC-4
  file: `_acceptance/tac-nhan-va/rang/man.mjs:125`
  severity: medium
  source: measurement
  detail: evals.yaml E4 khai chiều đỏ là «chạy trên cây trước vòng in 'khong dat' ở ngăn lượt chạy (bảng 56rem)», còn bước gieo hứa kết lượt «với kết quả bảng thoả thuận năm dòng». Thực tế gieoTacNhan kết lượt bằng failRun(runId, "PROVIDER_ERROR", …) (dòng 125), không có kết quả bảng nào. DealListResultTable chỉ được render qua agent-result.tsx → agent-builder-chat.tsx, cả ở mốc 966eeb78e lẫn ở HEAD, không bao giờ trong ngăn lượt chạy. Vì vậy khẳng định ngan-luot-chay (ngan.trang <= 0 && ngan.tran.length === 0, dòng 291–295) là khẳng định âm trên một ngăn không chứa bảng 56rem, và chiều đỏ được tuyên bố không thể đỏ ở dòng này. evidence-report.md dòng 71–72 cũng ghi «khong co bang thoa thuan trong ngan» và «chieu do tren cay truoc vong khong kiem».

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New traBangChu lookup helper is copied inline in two places in the same diff**
  Người dùng thấy gì: Hai chỗ trong màn tác nhân viết lại cách tra chữ bằng tay thay vì dùng chung một hàm. Người dùng không thấy khác biệt nào, chỉ là mã hơi lặp.
  file: `apps/app/components/agent-builder/agent-builder-chat.tsx`
  severity: low
  Đề xuất: wont-fix

- **builderStepLabel bỏ đuôi « — <lý do>» của nhãn bước, mất lý do bỏ qua/từ chối của công cụ trong hội thoại dựng (cả tiếng Anh)**
  Người dùng thấy gì: Trong hội thoại dựng, khi một công cụ bị bỏ qua hoặc bị từ chối, màn chỉ hiện nhãn chung của bước đó, không còn kèm lý do như trước. Người xem không biết vì sao bước đó không chạy.
  file: `apps/app/lib/nhan-buoc.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): thước khong-xoa-expect mù với hai thư mục eve-tran mà nó tuyên canh**
  Người dùng thấy gì: Phép kiểm xem có ai xoá bớt các bài kiểm sẵn có không thì không nhìn thấy kiểu khẳng định mà các bài kiểm tác nhân giả dùng. Nếu ai đó xoá chúng, phép kiểm vẫn báo ổn.
  file: `_acceptance/tac-nhan-va/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
