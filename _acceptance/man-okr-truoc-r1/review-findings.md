# Review findings: man-okr-truoc-r1 (round 1)

## Trong hợp đồng

- **Hình dạng 3: lời hứa là quan hệ («số định dạng như ô giá trị của form») nhưng phép đo chỉ kiểm chuỗi có mặt, và chuỗi mong đợi lấy từ chính hàm mà màn dùng để vẽ**
  AC: AC-3
  file: `apps/app/test/okr-cap-nhat-tuan.dom.tsx:321`
  severity: high
  source: measurement
  detail: AC-3 và E3 hứa một quan hệ: số hiện tại trên màn «đã xong» phải định dạng giống ô giá trị của form. Test 'da xong' chỉ kiểm `o?.textContent?.includes(giaTri(k, k.currentValue, "vi"))`. Nhưng `giaTri` (bang-kr.tsx) cũng chính là hàm DaXongTuanNay gọi để vẽ, nên chuỗi mong đợi được suy ra từ chính thứ đang bị đo. Ô giá trị của form lại lấy chữ từ `oBanDau` → `hienSo` (hop-thoai-kr.tsx). Hai hàm này cho ra chữ khác nhau: `chuSo` dùng `toLocaleString('vi-VN')` nên 1234 thành «1.234 khách», còn `hienSo` cho «1234». Dữ liệu mẫu chỉ có currentValue 7 và 1, đúng vùng hai hàm trùng nhau. Vì vậy test xanh dù quan hệ đã hứa bị vỡ thật ở mã hiện tại với mọi số từ 1000 trở lên hoặc số thập phân. Đo đúng phải so dòng «đã xong» với `oGiaTri(id).value` sau khi bấm «Sửa cập nhật», trên một KR có số ≥ 1000.

- **Hình dạng 4: «mức tự tin không chọn sẵn» chỉ có khẳng định âm, không có đối chứng dương cho bộ chọn**
  AC: AC-3
  file: `apps/app/test/okr-cap-nhat-tuan.dom.tsx:297`
  severity: medium
  source: measurement
  detail: `tuTinDaChon()` truy `'[data-o="tu-tin"] [data-state="on"]'`. Trong cả diff, kết quả của nó chỉ từng được khẳng định là `[]`: `daChon: []` ở test 'sua cap nhat' (dòng 384), và `mong[`${x}.chonSan`] = []` ở cả ba ô x = 0, 1, 2 của ma trận 'mot phan'. Không chỗ nào khẳng định bộ chọn trả về khác rỗng. Ví dụ, ngay sau `vua.click()` (dòng 369) không có kiểm `tuTinDaChon()` bằng `[XONG_A.keyResultId]`. Nếu bộ chọn không bao giờ khớp (ToggleGroup đổi sang `aria-pressed`/`data-pressed`, hay `data-o` đổi chỗ), cả 4 khẳng định «chưa chọn» của AC-3 và AC-4 vẫn xanh. Hợp đồng cũng không có CHIỀU ĐỎ nào cho vế này.

- **Hình dạng 4: «bấm liên kết thì danh sách ý chưa gom vào khung nhìn» không đo trạng thái trước khi bấm**
  AC: AC-2
  file: `_acceptance/man-okr-truoc-r1/rang/man-r1c.mjs:316`
  severity: medium
  source: measurement
  detail: Bước hoi-y gán `c.scrollTop = c.scrollHeight` cho `[data-slot="page-shell-scroll"]`, bấm liên kết, rồi chỉ kiểm `r.bottom > 0 && r.top < innerHeight` cho `[data-khoi='y-chua-gom']` (dòng 326–333). Không có khẳng định nào rằng sau khi cuộn và trước khi bấm, danh sách đã nằm ngoài khung nhìn. Chính AC-2 nói danh sách này nằm ở khung nhìn đầu. Nếu trang không đủ cao, hoặc phép gán scrollTop không làm cuộn thật (bẫy đã ghi nhận: gán scrollTop vẫn xanh cả trên overflow hidden), danh sách vẫn ở trong khung nhìn và vế này xanh dù liên kết không làm gì. Phép giao chỉ cần chạm 1 px cũng làm điều kiện yếu thêm. Vế này cũng không có CHIỀU ĐỎ riêng.

- **Hình dạng 4: số ý bị phủ bằng 0 có thể là 0 rỗng, vì không đếm và không đòi số ý thật sự được kiểm**
  AC: AC-2
  file: `_acceptance/man-okr-truoc-r1/rang/man-r1c.mjs:240`
  severity: low
  source: measurement
  detail: Vòng đo phủ bỏ qua mọi ý không nằm trọn trong khung nhìn (`if (r.top < 0 || r.bottom > cao) continue;`). Script chỉ đòi `dau.soY > 0`, tức tổng số ý, chứ không đòi số ý nằm trọn trong khung đầu, là số ý đã thật sự chạy qua elementFromPoint. Ở 390 × 844, nếu không ý nào nằm trọn trong khung đầu thì `phu = 0` và vế «không ý nào bị phủ» xanh một cách rỗng. Đối chứng dương duy nhất là CHIỀU ĐỎ `--chieu-do=hoi-y`, mà ghim của nó (`/hoi-y 1440: y chua gom bi thanh phu: [1-9]/`) chỉ ở khổ 1440, nên khổ 390 không có đối chứng nào.

- **Hình dạng 3: «hai KR đúng mức vừa chọn» được đo bằng chuỗi có mặt ở cả trang, không theo từng KR**
  AC: AC-5
  file: `_acceptance/man-okr-truoc-r1/rang/man-r1c.mjs:423`
  severity: low
  source: measurement
  detail: AC-5 hứa rằng sau khi tải lại, trang ở ST-capnhat-daxong «với hai KR đúng mức vừa chọn», tức một quan hệ giữa từng KR và mức của nó. Script chỉ kiểm `chu.includes(MC.tuTinNhan(MC.mucTuTin.cao))` trên `document.body.innerText`. Chuỗi xuất hiện một lần là đủ xanh, nên một KR hiện mức cũ hoặc không hiện mức nào vẫn qua. Bước sửa sau đó có đo theo hàng (`[data-kr="${ids[0]}"]`, dòng 441–448), nhưng chỉ cho KR đầu, còn lần đo sau lần gửi đầu thì không theo hàng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New timezone constant added next to its first use instead of using the OKR area config**
  Người dùng thấy gì: Giờ Việt Nam được khai ở hai chỗ trong mã. Người dùng không thấy khác biệt, chỉ là sau này đổi múi giờ phải sửa nhiều nơi.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: medium
  Đề xuất: wont-fix

- **Sentence for 'units without objectives' is now built in JSX, and the English version breaks when more than one unit is listed**
  Người dùng thấy gì: Khi giao diện tiếng Anh và có nhiều đơn vị chưa có mục tiêu, thẻ Toàn cảnh đọc như «Sales, Marketing has no objectives of its own», sai ngữ pháp. Bản tiếng Việt không bị.
  file: `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx`
  severity: medium
  Đề xuất: known-limits

- **DaXongTuanNay copies DaGui's sent-KR list markup instead of sharing it**
  Người dùng thấy gì: Hai màn «vừa gửi» và «đã gửi tuần này» hiện danh sách KR bằng hai đoạn mã giống nhau. Hiện hai màn khớp nhau, nhưng sau này sửa một màn có thể làm hai màn lệch nhau.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: low
  Đề xuất: wont-fix

- **After «Sửa cập nhật», or a send from the partly-sent state, the success screen says KRs already sent this week are still waiting**
  Người dùng thấy gì: Ngay sau khi gửi thành công, màn có thể báo nhầm là còn KR chưa gửi dù KR đó đã gửi từ trước trong tuần. Người dùng có thể tưởng mình còn thiếu và gửi lại không cần thiết.
  file: `apps/app/app/(app)/[slug]/okr/cap-nhat-tuan/cap-nhat-tuan.tsx`
  severity: medium
  Đề xuất: new-contract

- **English 'units not set' sentence uses singular 'has … its own' after a list of several unit names**
  Người dùng thấy gì: Bản tiếng Anh của thẻ Toàn cảnh dùng động từ số ít sau một danh sách nhiều đơn vị nên đọc sai ngữ pháp. Nghĩa vẫn hiểu được.
  file: `apps/app/lib/messages/okr-toan-canh.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
