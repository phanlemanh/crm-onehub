# Review findings: duong-ly-do-muc-tieu (round 1)

## Trong hợp đồng

- **Phép đo «không tràn ngang» của E10/AC-9 luôn đạt vì đang đo một phần tử display:contents**
  file: `_acceptance/duong-ly-do-muc-tieu/rang/man.mjs:136`
  severity: high
  AC: AC-9
  source: bugs
  detail: `vungCuon` là danh sách chọn `[data-okr-sheet="<id>"] [data-slot=detail-sheet-body], [data-okr-sheet="<id>"]`. Trong kho không có `data-slot="detail-sheet-body"`: grep trong packages/ui và apps/app không ra kết quả nào, sheet.tsx chỉ có `sheet-body`. Vì vậy `document.querySelector` (dòng 90) luôn trả về chính phần tử `[data-okr-sheet]`. Phần tử này dựng ở apps/app/components/crm/record-sheet/objective-sheet.tsx:994-996 với `className="contents"`, tức `display: contents`. Theo CSSOM, phần tử không có hộp bố cục thì `scrollWidth` và `clientWidth` đều bằng 0. Biểu thức `vung.scrollWidth > vung.clientWidth + 1` thành `0 > 1`, nên `tranNgang` luôn là `false` và `kiem("khong tran ngang", o.tranNgang === false)` luôn in DUNG, sheet có cuộn ngang thật hay không cũng vậy. Kết quả: vế «không cuộn ngang» mà AC-9 hứa, và E10 khai là đo «scrollWidth ≤ clientWidth của vùng cuộn sheet», không được kiểm, mà phép đo vẫn báo đạt. Phép đo này cũng không có đối chứng đỏ nên không lộ ra. Cần chọn vùng cuộn thật, ví dụ `[data-okr-sheet="<id>"]` kèm `[data-slot=sheet-body]` hoặc phần tử cuộn có hộp bố cục. Cần thêm một bước kiểm khi chạy: phần tử chọn được phải có `clientWidth > 0`, nếu không thì thoát với «KHONG DO DUOC».
  rationale: AC-9 hứa «không cuộn ngang» ở 1440 và 390 px; phép đo đo phần tử không có hộp nên không kiểm được vế này.

- **Hình dạng 4 (âm tính một mình, phép đo không thể đỏ): «khong tran ngang» ở E10 đo trên phần tử display:contents**
  file: `_acceptance/duong-ly-do-muc-tieu/rang/man.mjs:136`
  severity: high
  AC: AC-9
  source: measurement
  detail: vungCuon = `[data-okr-sheet="${id}"] [data-slot=detail-sheet-body], [data-okr-sheet="${id}"]`. Kho không có data-slot="detail-sheet-body" (grep apps/app/components và packages/ui/src chỉ ra detail-sheet-stats và detail-sheet-table), nên querySelector rơi vào chính [data-okr-sheet]. Phần tử đó (objective-sheet.tsx:994-996) có className="contents", tức display:contents và không có hộp, nên scrollWidth = clientWidth = 0. Dòng 100 `tranNgang: vung.scrollWidth > vung.clientWidth + 1` vì thế luôn là false, và dòng 143 `kiem(... o.tranNgang === false)` luôn DUNG ở cả 1440 lẫn 390. AC-9 hứa «không cuộn ngang», nhưng không có đối chứng dương nào cho thấy phép đo này bắt được tràn ngang. Như đang viết, nó không thể đỏ.
  rationale: Cùng gốc với finding trên: vế «không cuộn ngang» của AC-9 không có phép đo có thể đỏ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **ly-do-noi-gop.tsx tự viết lại việc chèn node vào chuỗi mẫu bằng split("{cau}"), bỏ qua dienNode có sẵn**
  Người dùng thấy gì: Dòng «Căn cứ» trên màn mục tiêu được ráp theo cách riêng thay vì cách chung của app. Người dùng hiện không thấy khác biệt; chỉ khi sau này bản dịch đổi cấu trúc câu thì mới có thể hiện sai.
  file: `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx`
  severity: low
  Đề xuất: wont-fix

- **Khuôn bộ mẫu nhận lyDoTuKara=true mà không có lyDo, trạng thái mà đường ghi thật không tạo ra**
  Người dùng thấy gì: Bộ dữ liệu mẫu cho phép gieo một chỗ nối ghi «Kara viết» mà lại không có câu lý do nào. Chỉ người dựng dữ liệu mẫu có thể vô tình gieo ra ca vô lý này; người dùng thật không gặp.
  file: `apps/api/scripts/okr-mau/khuon.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim không ghim): vết (a) của E11 ghim «can cu», chuỗi này đã có sẵn trong tên bài**
  Người dùng thấy gì: Bài thử đột biến có thể báo «bắt được lỗi» dù bài đỏ vì lý do khác với lý do định kiểm. Người dùng không bị ảnh hưởng; chỉ làm bằng chứng kiểm thử yếu hơn vẻ ngoài.
  file: `_acceptance/duong-ly-do-muc-tieu/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): l2-vang khẳng định «không dấu Kara» cho chua-co-ly-do bằng một fixture không bao giờ bật lyDoTuKara**
  Người dùng thấy gì: Bài kiểm chưa thử ca chỗ nối chưa có lý do mà lại bị đánh dấu do Kara viết. Ca này gần như không xảy ra với dữ liệu thật, nên người dùng khó gặp dấu Kara hiện sai chỗ.
  file: `apps/app/test/duong-ly-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương lặp lại chính nó): đối chứng «cat chu» của E10 đúng ngay từ cách dựng**
  Người dùng thấy gì: Phép kiểm «câu lý do không bị cắt chữ» có thể không bắt được trường hợp bị cắt khi câu ngắn. Nếu sau này câu bị cắt bằng dấu ba chấm, bài kiểm có thể không báo.
  file: `_acceptance/duong-ly-do-muc-tieu/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 («chuỗi có mặt» thay cho quan hệ bằng): tiêu đề vùng ở E1 so bằng includes trên textContent của cả vùng**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận chữ «Đường lý do» có đâu đó trong vùng, chứ không chắc nó là tiêu đề. Người dùng vẫn thấy tiêu đề đúng; chỉ là bài kiểm lỏng hơn lời hứa.
  file: `apps/app/test/duong-ly-do.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
