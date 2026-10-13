# Review findings: duong-ly-do-muc-tieu (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ở khổ 390, phép đo tràn ngang không dừng ở sheet: không có sheet-content, nó đi lên tới html mà vẫn in là «tới sheet»**
  Người dùng thấy gì: Ở màn điện thoại, phép kiểm tra «không bị cuộn ngang» đo cả trang chứ không chỉ khung sheet. Kết quả hiện vẫn xanh, nhưng sau này nếu trang phía sau tràn ngang thì phép kiểm tra có thể báo đỏ nhầm cho sheet.
  file: `_acceptance/duong-ly-do-muc-tieu/rang/man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Số 4000px của đối chứng đỏ viết thẳng trong hàm, không nằm trong khối cấu hình MAN**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng gì: đây chỉ là chuyện sắp xếp một con số trong công cụ kiểm tra nội bộ, người chỉnh công cụ sau này sẽ hơi khó tìm số đó.
  file: `_acceptance/duong-ly-do-muc-tieu/rang/man.mjs`
  severity: low
  Đề xuất: wont-fix

- **ly-do-noi-gop.tsx tự viết lại việc chèn node vào chuỗi mẫu bằng split("{cau}"), bỏ qua dienNode có sẵn (r1)**
  Người dùng thấy gì: Dòng «Căn cứ» trên màn mục tiêu được ráp theo cách riêng thay vì cách chung của app. Người dùng hiện không thấy khác biệt; chỉ khi sau này bản dịch đổi cấu trúc câu thì mới có thể hiện sai.
  file: `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx`
  severity: low
  Đề xuất: wont-fix

- **Khuôn bộ mẫu nhận lyDoTuKara=true mà không có lyDo, trạng thái mà đường ghi thật không tạo ra (r1)**
  Người dùng thấy gì: Bộ dữ liệu mẫu cho phép gieo một chỗ nối ghi «Kara viết» mà lại không có câu lý do nào. Chỉ người dựng dữ liệu mẫu có thể vô tình gieo ra ca vô lý này; người dùng thật không gặp.
  file: `apps/api/scripts/okr-mau/khuon.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim không ghim): vết (a) của E11 ghim «can cu», chuỗi này đã có sẵn trong tên bài (r1)**
  Người dùng thấy gì: Bài thử đột biến có thể báo «bắt được lỗi» dù bài đỏ vì lý do khác với lý do định kiểm. Người dùng không bị ảnh hưởng; chỉ làm bằng chứng kiểm thử yếu hơn vẻ ngoài.
  file: `_acceptance/duong-ly-do-muc-tieu/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): l2-vang khẳng định «không dấu Kara» cho chua-co-ly-do bằng một fixture không bao giờ bật lyDoTuKara (r1)**
  Người dùng thấy gì: Bài kiểm chưa thử ca chỗ nối chưa có lý do mà lại bị đánh dấu do Kara viết. Ca này gần như không xảy ra với dữ liệu thật, nên người dùng khó gặp dấu Kara hiện sai chỗ.
  file: `apps/app/test/duong-ly-do.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng dương lặp lại chính nó): đối chứng «cat chu» của E10 đúng ngay từ cách dựng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm «câu lý do không bị cắt chữ» có thể không bắt được trường hợp bị cắt khi câu ngắn. Nếu sau này câu bị cắt bằng dấu ba chấm, bài kiểm có thể không báo.
  file: `_acceptance/duong-ly-do-muc-tieu/rang/man.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 («chuỗi có mặt» thay cho quan hệ bằng): tiêu đề vùng ở E1 so bằng includes trên textContent của cả vùng (r1)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận chữ «Đường lý do» có đâu đó trong vùng, chứ không chắc nó là tiêu đề. Người dùng vẫn thấy tiêu đề đúng; chỉ là bài kiểm lỏng hơn lời hứa.
  file: `apps/app/test/duong-ly-do.dom.tsx`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
