# Review findings: ke-hoach-sinh-viec (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ Cổng Phạm vi ký lại đã bỏ qua 4 quyết định vì decisions.jsonl có 4 dòng hỏng (thừa dấu '}' ở cuối)**
  Người dùng thấy gì: Thẻ để anh ký đã không hiện 4 quyết định mà máy tự đưa ra (cách ghi lệnh trên thẻ Bước, lỗi khi bỏ giao, chặn bỏ hạn). Anh có thể đã duyệt phạm vi mà chưa thấy các quyết định này, nên cần xem lại chúng trước khi chốt.
  file: `_acceptance/ke-hoach-sinh-viec/card.html`
  severity: medium
  Đề xuất: known-limits

- **Sổ quyết định có 4 dòng JSON hỏng (thừa dấu '}') nên thẻ Cổng Phạm vi vừa ký lại âm thầm bỏ mất 4 quyết định, trong đó có d-25 «chặn bỏ hạn trên Việc của bước»**
  Người dùng thấy gì: Thẻ anh ký không có các quyết định máy tự đưa ra, trong đó có việc chặn bỏ hạn trên Việc của bước. Nếu việc chặn này làm phiền người dùng thì anh chỉ biết sau khi đã ký, nên cần trình lại các quyết định đó cho anh.
  file: `_acceptance/ke-hoach-sinh-viec/card.html`
  severity: high
  Đề xuất: known-limits

- **AC-5 (gỡ bước, đóng kế hoạch, mở lại) nằm trong wont_do của thẻ nên hiện dưới «Sẽ KHÔNG làm» dù là tiêu chí trong phạm vi và có E6 đo**
  Người dùng thấy gì: Thẻ cho anh đọc ghi việc gỡ bước và đóng kế hoạch (có hỏi huỷ việc còn dở) vào mục «Sẽ KHÔNG làm», trong khi tính năng này vẫn được làm. Anh có thể hiểu nhầm là việc đóng kế hoạch sẽ không huỷ việc dở.
  file: `_acceptance/ke-hoach-sinh-viec/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **Lượt sửa thêm chú thích mới vào ba tệp kiểm, trái luật «Never add code comments» (r2)**
  Người dùng thấy gì: Vài dòng ghi chú thừa trong các bài kiểm của tính năng trái quy ước của kho. Người dùng không thấy gì khác đi, chỉ lệch nếp viết mã nội bộ.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Spec tự viết kiểu DauVaoTao trong khi đã có schema planCreateFromTemplateInput (r2)**
  Người dùng thấy gì: Bài kiểm tự khai báo lại hình dạng dữ liệu tạo kế hoạch thay vì dùng bản gốc. Hôm nay không ảnh hưởng người dùng, nhưng sau này nếu dữ liệu đổi thì bài kiểm có thể lệch mà không báo.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — đối chứng dương suy biến: ô bo-han của kh-chan chạy trên Việc thường vốn KHÔNG có hạn (r2)**
  Người dùng thấy gì: Chưa có bài kiểm nào chứng minh việc bỏ hạn trên Việc thường vẫn dùng được như cũ, vì bài kiểm đang thử trên một Việc vốn không có hạn. Nếu sau này chặn lan sang cả Việc thường, người dùng không thể bỏ hạn một Việc thường mà bài kiểm vẫn xanh.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: tu-thu M/D/R chỉ thử docTenTrangThai, không chạm lệnh git sinh ra dữ liệu (r2)**
  Người dùng thấy gì: Công cụ kiểm tra việc không ai xoá bài kiểm cũ chưa được thử trên trường hợp tệp bị xoá hoặc đổi tên thật. Hôm nay kết quả vẫn đúng, nhưng nếu công cụ hỏng ở nhánh đó thì sẽ không ai biết.
  file: `_acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét «MỌI tệp kiểm nhánh sửa» nhưng bộ lọc tên tệp bỏ sót helper có expect mà chính vòng này sửa (r2)**
  Người dùng thấy gì: Công cụ kiểm tra bài kiểm cũ không bị xoá bỏ sót một tệp phụ trợ. Lần này tệp đó không mất gì nên kết quả vẫn đúng, nhưng lần sau có thể không bắt được.
  file: `_acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa là QUAN HỆ «mặc định hiển thị ở ô tạo = người máy chủ tự điền», nhưng mỗi bên chỉ được so với đáp án viết tay riêng (r2)**
  Người dùng thấy gì: Trong một số trường hợp hiếm, như phòng ban của bước đã bị lưu trữ, màn hình có thể hiện một người nhận việc nhưng hệ thống lại giao cho người khác. Hiện chưa có bài kiểm nào đối chiếu hai bên với nhau.
  file: `apps/app/test/tao-ke-hoach-nguoi.dom.tsx`
  severity: medium
  Đề xuất: known-limits

- **Thêm chú thích trong code, trái luật «Never add code comments» của AGENTS.md/CLAUDE.md (r1)**
  Người dùng thấy gì: Mã mới có nhiều dòng ghi chú trái quy ước của đội. Người dùng không thấy gì khác đi, chỉ khiến người bảo trì sau này phải dọn.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **viecTrangThai tự liệt kê lại enum thay vì dùng z.enum(TRANG_THAI_VIEC) (r1)**
  Người dùng thấy gì: Danh sách trạng thái công việc bị chép tay thêm một bản. Hôm nay vẫn đúng, nhưng nếu sau này thêm hay đổi tên một trạng thái thì màn kế hoạch có thể báo lỗi mà không ai thấy trước.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **huyViecMoCuaKeHoach cứng tập trạng thái mở thay vì dùng TRANG_THAI_MO (r1)**
  Người dùng thấy gì: Định nghĩa «việc còn mở» được viết ở ba nơi. Hôm nay con số trên hộp đóng kế hoạch vẫn khớp số việc bị huỷ, nhưng có thể lệch nếu sau này đổi trạng thái.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **hanTuNgay viết số ma 24*60*60*1000 dù DAY_MS có sẵn trong chính module đang import (r1)**
  Người dùng thấy gì: Một phép tính ngày dùng con số viết thẳng thay vì hằng có sẵn. Hạn của việc vẫn tính đúng, người dùng không bị ảnh hưởng.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: wont-fix

- **Thông điệp VIEC.thongDiep.buocLuonCoNguoi được thêm nhưng không chỗ nào dùng (r1)**
  Người dùng thấy gì: Có một câu thông báo được thêm nhưng chưa nơi nào hiển thị. Người dùng không thấy và không bị ảnh hưởng.
  file: `packages/db/src/viec.ts`
  severity: low
  Đề xuất: wont-fix

- **kiemNguoiTheoPhong chép gần nguyên kiemNguoiNhanViec, chỉ khác câu báo lỗi (r1)**
  Người dùng thấy gì: Luật «ai được nhận việc» bị viết lặp thêm một bản. Hôm nay người dùng không thấy khác biệt, nhưng sửa luật sau này dễ sót một nơi.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Bước mang Việc bị đếm hai lần ở chuyển việc và ở lời từ chối đổi vai (r1)**
  Người dùng thấy gì: Khi chuyển việc hay từ chối đổi vai, một việc có thể được đếm thành «N bước, N việc», nên con số hiển thị lớn hơn thực tế. Việc thật được chuyển vẫn đúng.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Chặn gỡ gắn kế hoạch áp lên MỌI kế hoạch, không riêng kế hoạch của bước (r1)**
  Người dùng thấy gì: Nếu một việc của bước được gắn thêm một kế hoạch khác, người dùng sẽ không gỡ được gắn kết đó và bị báo lỗi dù việc gỡ là vô hại.
  file: `packages/db/src/viec-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: kh-chon-nguoi (4) «người lạ» chỉ kiểm status ≠ 200, không ghim thông điệp, không đếm hàng (r1)**
  Người dùng thấy gì: Phép thử chặn người không thuộc tổ chức khá lỏng: nếu chặn này hỏng thì người dùng có thể gặp lỗi hệ thống thay vì lời báo rõ, mà bài thử vẫn xanh.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: hai spec cũ bỏ writer createFromTemplate, chuyển sang ghi db trực tiếp (r1)**
  Người dùng thấy gì: Hai bộ thử cũ về vai chỉ OKR giờ chỉ thử kế hoạch kiểu cũ, nên việc giao hay chuyển việc cho người chỉ OKR trên kế hoạch mới có thể không được kiểm.
  file: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — chốt «đếm ô = số hàng bảng» của kh-ban-chieu là tautology, không so với bảng viết trước (r1)**
  Người dùng thấy gì: Phép kiểm «đã chạy đủ các lệnh» không bắt được việc ai đó xoá bớt một dòng khỏi bảng thử, nên độ phủ có thể giảm mà không báo.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — sàn thiết kế E17 khai danh sách rút từ git diff, mã lại dùng danh sách tay ba tệp (r1)**
  Người dùng thấy gì: Phép kiểm giao diện chỉ quét ba màn đã biết, nên màn mới thêm trong tương lai có thể lọt khỏi kiểm tra mà không ai hay.
  file: `_acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — «đối chứng âm» của kh-tao không chạm vật nên không thể đỏ (r1)**
  Người dùng thấy gì: Một phép thử nói rằng kế hoạch cũ không sinh việc thực ra không chạm đến phần mã mới, nên nó không chứng minh được điều đó.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/3 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ke-hoach-sinh-viec/card.html, _acceptance/ke-hoach-sinh-viec/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
