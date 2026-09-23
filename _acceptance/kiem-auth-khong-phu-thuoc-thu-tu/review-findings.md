## Trong hợp đồng

### tu-nhien (E4) reads only the junit file and ignores bun's exit code, so a spec file that fails to load is not counted as red
- file: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs:184`
- severity: medium
- AC: AC-4
- source: bugs

tuNhien() calls junit(AUTH, []) and junit(sao, []), then decides '0 ca do' from sua.hong. That value is the testsuites 'failures' attribute. The exit code (sua.ma / goc.ma) returned by chayBun is never checked. I reproduced this on bun 1.4.2: when a spec file throws at load time, bun prints '# Unhandled error between tests', counts it in '2 fail / 1 error' and exits 1. The junit file leaves that file out completely (tests=2 failures=1, only the tests that ran). Failure scenario: an integration spec in packages/auth throws at load in both the patched and the b812b65a run, for example on a DB or env problem. Both totals drop by the same amount, so sua.tong === goc.tong + moi still holds. sua.hong is 0, and E4 prints 'kat tu-nhien: 0 do …' and exits 0, while `bun test` on the same tree exits 1. AC-4 promises '0 ca đỏ', so this is a silent pass. Fix: fail when sua.ma !== 0, and require goc.ma to be a known value or print it. cap() and seed() also ignore ket.ma, but they only assert on the two named cua-google-con-song cases, so the risk there is smaller.

### Hình dạng 4 (âm tính một mình, không ghim thông điệp): răng hd-noi coi mọi lần ca onemount đỏ là đột biến bị bắt, không có đối chứng xanh trên bản sao
- file: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs:290`
- severity: medium
- AC: AC-8
- source: measurement

hdNoi chạy đối chứng xanh (dòng 274) trên AUTH thật, còn hai đột biến M1/M2 chạy trong bản sao `.sao-kat-sua-*` (dòng 279-289). Bản sao chưa đột biến không bao giờ được chạy. Dòng 290 chỉ grep `(fail) hd cua google theo danh sach "onemount.com"`, không ghim lý do đỏ (không kiểm giá trị nhận được là "sai.example.com" hay null). Trong hd-cua-google.spec.ts, hdKhiNap ném `khong nap duoc auth ...` khi `bun -e` không nạp được ./src/auth ở cwd của bản sao, và lỗi đó cũng làm đúng ca này đỏ. cap() có chạy `bun test` trong bản sao nhưng không chạy tiến trình con `bun -e` nạp auth từ bản sao. Vậy nếu việc nạp trong bản sao hỏng (phân giải module, .env), cả M1 lẫn M2 vẫn báo 'bi bat' và E11 xanh dù răng chưa bao giờ phân biệt được auth.ts đúng với auth.ts sai. Cần một lượt bản sao chưa đột biến chạy xanh, hoặc ghim thông điệp của phép so (Expected/Received).

### Hình dạng 1 (đo bản báo cáo thay vì đầu ra): tu-nhien đọc số 'failures' trong junit, bỏ qua mã thoát của bun test
- file: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs:198`
- severity: medium
- AC: AC-4
- source: measurement

AC-4 hứa toàn gói chạy '0 ca đỏ' như CI. tuNhien (dòng 184-207) kết luận từ `sua.hong`, tức thuộc tính `failures` của `<testsuites>` (chung.mjs dòng 152), và không đọc `sua.ma`, mã thoát mà junit() đã trả về. Tôi đã thử với bun 1.4.2: một tệp ném lỗi thành 'Unhandled error between tests' làm bun thoát 1 và in '1 error', nhưng junit vẫn ghi failures="1" (chỉ đếm lỗi afterAll) và không hề có testcase hay failure cho lỗi đó. Kiểm tổng số ca ở dòng 199 bắt được tệp hỏng lúc nạp, vì ca của tệp đó biến mất. Nó không bắt được lỗi bất đồng bộ xảy ra giữa các ca sau khi ca đã đăng ký. Khi đó bun test thoát 1, CI đỏ, mà E4 vẫn in '0 do' và thoát 0. Phép đo đang tin bản báo cáo phụ thay vì phán quyết thật của trình chạy.

### Hình dạng 2 (fixture theo khuôn bên đọc): token Google giả lấy hd từ chính cấu hình auth nên phép so hd không bao giờ lệch trong bộ kiểm ở HEAD
- file: `packages/auth/test/chia-mat-khau.integration.spec.ts:192`
- severity: medium
- AC: AC-7
- source: measurement

Ở HEAD, idTokenGia đặt `hd` của token bằng `auth.options.socialProviders?.google?.hd`, đúng giá trị mà Better Auth dùng để kiểm token đó. Vì fixture rút từ cấu hình của bên đọc, hai ca `cua-google-con-song` không thể đỏ vì hd, dù Better Auth có kiểm hd hay không. Trong bộ kiểm ở HEAD không còn ca nào gửi token có hd lệch để khẳng định cửa Google từ chối. Chiều đỏ của lời hứa 'cửa Google từ chối token không khớp' (AC-7) chỉ còn ở hai nơi: răng kat_cap/kat_seed chạy một lần trên bản gốc b812b65a, và E12 là eval người chấm. AC-8/E11 chỉ đo chỗ auth.ts nối hd vào cấu hình, không đo việc từ chối. Nếu sau này mất việc kiểm hd khi callback (ví dụ nâng Better Auth), suite ở HEAD vẫn xanh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **pham-vi (E10) uses a two-dot diff GOC..HEAD, so merging onehub into the branch would name unrelated product files**
  Người dùng thấy gì: Neu sau nay nhanh chinh duoc gop vao truoc khi kiem tra lai, cong cu kiem tra pham vi co the bao nham la ban da sua nhung phan khong lien quan, du ban chua dung vao chung.
  file: `_acceptance/kiem-auth-khong-phu-thuoc-thu-tu/rang/thu-tu-tep.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
