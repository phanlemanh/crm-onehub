## Trong hợp đồng

- **Việc của bước bị xoá hạn thì bước giữ hạn cũ, hai bên lệch nhau mà không báo**
  file: packages/db/src/buoc-viec-chieu.ts:36
  severity: medium
  AC: AC-4
  source: bugs
  detail: `chieuLenBuoc` ghi `dueAt: v.hanNgay ?? undefined`. `suaViec` cho đặt `hanNgay = null` trên Việc của bước, vì không có chặn nào: `input.hanNgay ? ngayHan(...) : null`. Khi Việc mất hạn, bước vẫn giữ `dueAt` cũ, trong khi thiết kế nói `dueAt` là bản chiếu của `hanNgay`. Hệ quả có hai. (1) Việc không còn hạn nên không phát viec-qua-han/viec-sap-han. Bước mang Việc lại bị `guiCua` bỏ qua (`s.viecId !== null`), nên lời nhắc hạn của bước mất hẳn. (2) Các nơi đọc bước, như «bước đúng hạn» của KR, Bước x/y hay quá hạn, vẫn tính theo hạn cũ đã lệch. Thêm nữa, `rescheduleStep` so `ngay(buoc.dueAt) === ngay(input.dueAt)` với hạn cũ đã lệch. Nếu người đặt lại đúng ngày đó, lệnh trả về sớm và Việc vẫn không có hạn. Cách sửa: chặn bỏ hạn trên Việc có bước (giống chanViecCuaBuoc), hoặc định nghĩa rõ cách chiếu khi hạn rỗng.

- **Thước «không xoá expect» bỏ sót tệp kiểm bị xoá hoặc đổi tên**
  file: _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs:11
  severity: medium
  AC: AC-10
  source: bugs
  detail: `tepKiemDaSua` dùng `git diff --name-only --diff-filter=M`, nên chỉ lấy tệp bị sửa. Tệp spec bị xoá (D) hoặc đổi tên (R) không vào danh sách. Mọi câu expect trong các tệp ấy có thể mất trọn mà thước vẫn in «khong expect san co nao bi xoa hay sua» và thoát 0. Đây là xanh rỗng đúng với lời hứa AC-10 mà thước tự nhận đo («mọi tệp kiểm ĐÃ CÓ ở mốc mà nhánh sửa»). Cần thêm D và R vào bộ lọc. Với tệp D, so với nội dung rỗng.

- **Ô tạo kế hoạch ghi đè trưởng phòng bằng người cầm trịch khi listDepartments đang tải hoặc lỗi**
  file: apps/app/app/(app)/[slug]/onboarding/tao-ke-hoach.tsx:115
  severity: low
  AC: AC-3
  source: bugs
  detail: `macDinh(phongId)` đọc `tenPhong`, dựng từ `dsPhong.data ?? []`. Khi `dsPhong` chưa về hoặc lỗi (isError không được xử lý ở đâu), mọi phòng rơi về `nguoiCam`, và mọi hàng hiện «Phòng chưa có trưởng phòng» dù phòng có trưởng. Lúc gửi, client lại gửi rõ `nguoiTheoPhongBan` cho MỌI phòng với userId = người cầm trịch. Máy chủ coi đó là lựa chọn của người: `kiemNguoiTheoPhong` ghi đè giá trị từ `nguoiMacDinhTheoPhong`. Kết quả là luật mặc định trưởng phòng ở máy chủ bị vô hiệu một cách lặng lẽ. Ô tên phòng cũng rỗng (`?? ""`). Cách sửa: chỉ gửi những phòng người đã đổi (`chonPhong`), hoặc chặn nút Tạo và hiện lỗi khi dsPhong chưa sẵn.

- **Hình dạng 1 — đo chỉ dẫn/mã nguồn thay vì đầu ra: E13 «thước chỉ đọc» grep cả tệp, khớp ngay dòng chú thích**
  file: apps/api/test/ke-hoach-sinh-viec-do-nguong.spec.ts:120
  severity: high
  AC: AC-8
  source: measurement
  detail: `if (!src.includes("READ ONLY")) throw new Error("kh: thuoc khong chi doc")` grep TOÀN văn bản do-nguong.mjs. Chuỗi này đã có sẵn ở dòng chú thích đầu tệp (do-nguong.mjs:5 «Chạy trong giao dịch READ ONLY»). Xoá `BEGIN TRANSACTION READ ONLY` (dòng 63) hay `default_transaction_read_only=on` thì phép đo vẫn xanh. E13 khai «chuỗi 'READ ONLY' có trong lệnh mở giao dịch», còn mã đo lại đọc chữ hướng dẫn. Không có ca hành vi nào (ví dụ thử ghi trong phiên của thước và thấy bị từ chối) để chứng minh giao dịch thật sự chỉ đọc.

- **Hình dạng 4 — assertion âm-tính-một-mình: kh-go-buoc dong-ke-hoach không kiểm closePlan(plan2) và reopenPlan có chạy thành công**
  file: apps/api/test/ke-hoach-sinh-viec.spec.ts:757
  severity: high
  AC: AC-5
  source: measurement
  detail: Dòng 757 gọi `await goi(app, "onboarding.closePlan", ..., { id: plan2 }, ...)` mà không đọc status. Ngay sau đó «kh: dong ke hoach huy khi khong chon» chỉ kiểm mọi Việc vẫn CHUA_LAM. Nếu closePlan hỏng (400, 500, quyền) thì Việc vẫn CHUA_LAM và ca xanh. Tương tự, reopenPlan ở dòng 763 không kiểm status, rồi «kh: mo lai hoi viec» chỉ kiểm Việc vẫn HUY: mở lại hỏng thì HUY vẫn giữ nguyên, nên ca xanh rỗng. reopenPlan ở dòng 717 cũng không kiểm status, và `trongTayOkr === 0` (dòng 727) đúng sẵn kể cả khi không mở lại, vì bước HUY đã có assigneeId null. Cả ba thiếu đối chứng dương rằng lệnh thật sự chạy (status 200, hoặc plan.closedAt đổi).

- **Hình dạng 3 — ca REST của kh-tao kiểm sự có mặt, không kiểm quan hệ «kết quả y như trên»**
  file: apps/api/test/ke-hoach-sinh-viec.spec.ts:207
  severity: medium
  AC: AC-1
  source: measurement
  detail: E1 và AC-1 hứa POST /onboarding/plans cho «kết quả cùng bốn bất biến trên»: hạn = ngày bắt đầu + lệch theo ngày VN, người giao = người gọi, mỗi bước là bản chiếu đúng Việc nó trỏ, Việc gắn kế hoạch. Ca REST chỉ kiểm `ds.length !== 3`, vết 'tao' có nguon 'khuon', và `ds[2]?.viec?.nguoiThucHienId` bằng k.o. Không kiểm nguoiGiaoId = k.t (ctx.user.id đi qua cầu REST là chỗ REST khác tRPC), không kiểm hanNgay, ViecGan, người phòng A, cũng không gọi kiemChieu. Vế quan hệ của lời hứa rơi khỏi đường REST.

- **Hình dạng 5 — ma trận AC-6 khai ô «kế hoạch rỗng» nhưng R dựng từ khuôn một bước**
  file: apps/api/test/ke-hoach-sinh-viec.spec.ts:786
  severity: medium
  AC: AC-6
  source: measurement
  detail: E7 và AC-6 khai hai ô: «kế hoạch rỗng R» và «kế hoạch K tạo từ khuôn». Nhưng R được tạo bằng createFromTemplate từ khuôn `rong` có một bước (`{ label: "tam", departmentId: k.B.id, ... }`). R vì vậy đã có một bước mang Việc, không rỗng. Ô «thêm bước tay vào kế hoạch rỗng» thực chất không được đo; ma trận chỉ có hai điểm-case cùng hình (kế hoạch từ khuôn), một có assigneeId và một không.

- **Hình dạng 5 — khong-xoa-expect chỉ quét tệp kiểm bị sửa (M); xoá hay đổi tên tệp kiểm thì lọt**
  file: _acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs:11
  severity: low
  AC: AC-10
  source: measurement
  detail: `git diff --name-only --diff-filter=M` bỏ qua tệp kiểm bị xoá (D) và đổi tên (R). AC-10 hứa «không expect nào bị xoá ở các tệp kiểm đã có». Xoá nguyên một tệp spec là cách xoá expect triệt để nhất, nhưng thước báo `0 sai` và thoát 0. Bộ tự thử `--tu-thu` chỉ thử hàm `mat()` trên chuỗi, không có ca tệp bị xoá hay đổi tên.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thêm chú thích trong code, trái luật «Never add code comments» của AGENTS.md/CLAUDE.md**
  Người dùng thấy gì: Mã mới có nhiều dòng ghi chú trái quy ước của đội. Người dùng không thấy gì khác đi, chỉ khiến người bảo trì sau này phải dọn.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **viecTrangThai tự liệt kê lại enum thay vì dùng z.enum(TRANG_THAI_VIEC)**
  Người dùng thấy gì: Danh sách trạng thái công việc bị chép tay thêm một bản. Hôm nay vẫn đúng, nhưng nếu sau này thêm hay đổi tên một trạng thái thì màn kế hoạch có thể báo lỗi mà không ai thấy trước.
  file: `apps/api/src/onboarding/onboarding.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **huyViecMoCuaKeHoach cứng tập trạng thái mở thay vì dùng TRANG_THAI_MO**
  Người dùng thấy gì: Định nghĩa «việc còn mở» được viết ở ba nơi. Hôm nay con số trên hộp đóng kế hoạch vẫn khớp số việc bị huỷ, nhưng có thể lệch nếu sau này đổi trạng thái.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **hanTuNgay viết số ma 24*60*60*1000 dù DAY_MS có sẵn trong chính module đang import**
  Người dùng thấy gì: Một phép tính ngày dùng con số viết thẳng thay vì hằng có sẵn. Hạn của việc vẫn tính đúng, người dùng không bị ảnh hưởng.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: wont-fix

- **Thông điệp VIEC.thongDiep.buocLuonCoNguoi được thêm nhưng không chỗ nào dùng**
  Người dùng thấy gì: Có một câu thông báo được thêm nhưng chưa nơi nào hiển thị. Người dùng không thấy và không bị ảnh hưởng.
  file: `packages/db/src/viec.ts`
  severity: low
  Đề xuất: wont-fix

- **kiemNguoiTheoPhong chép gần nguyên kiemNguoiNhanViec, chỉ khác câu báo lỗi**
  Người dùng thấy gì: Luật «ai được nhận việc» bị viết lặp thêm một bản. Hôm nay người dùng không thấy khác biệt, nhưng sửa luật sau này dễ sót một nơi.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Bước mang Việc bị đếm hai lần ở chuyển việc và ở lời từ chối đổi vai**
  Người dùng thấy gì: Khi chuyển việc hay từ chối đổi vai, một việc có thể được đếm thành «N bước, N việc», nên con số hiển thị lớn hơn thực tế. Việc thật được chuyển vẫn đúng.
  file: `apps/api/src/onboarding/onboarding-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Chặn gỡ gắn kế hoạch áp lên MỌI kế hoạch, không riêng kế hoạch của bước**
  Người dùng thấy gì: Nếu một việc của bước được gắn thêm một kế hoạch khác, người dùng sẽ không gỡ được gắn kết đó và bị báo lỗi dù việc gỡ là vô hại.
  file: `packages/db/src/viec-ghi.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm-tính-một-mình: kh-chon-nguoi (4) «người lạ» chỉ kiểm status ≠ 200, không ghim thông điệp, không đếm hàng**
  Người dùng thấy gì: Phép thử chặn người không thuộc tổ chức khá lỏng: nếu chặn này hỏng thì người dùng có thể gặp lỗi hệ thống thay vì lời báo rõ, mà bài thử vẫn xanh.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: hai spec cũ bỏ writer createFromTemplate, chuyển sang ghi db trực tiếp**
  Người dùng thấy gì: Hai bộ thử cũ về vai chỉ OKR giờ chỉ thử kế hoạch kiểu cũ, nên việc giao hay chuyển việc cho người chỉ OKR trên kế hoạch mới có thể không được kiểm.
  file: `apps/api/test/vai-chi-okr-ke-hoach.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — chốt «đếm ô = số hàng bảng» của kh-ban-chieu là tautology, không so với bảng viết trước**
  Người dùng thấy gì: Phép kiểm «đã chạy đủ các lệnh» không bắt được việc ai đó xoá bớt một dòng khỏi bảng thử, nên độ phủ có thể giảm mà không báo.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — sàn thiết kế E17 khai danh sách rút từ git diff, mã lại dùng danh sách tay ba tệp**
  Người dùng thấy gì: Phép kiểm giao diện chỉ quét ba màn đã biết, nên màn mới thêm trong tương lai có thể lọt khỏi kiểm tra mà không ai hay.
  file: `_acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — «đối chứng âm» của kh-tao không chạm vật nên không thể đỏ**
  Người dùng thấy gì: Một phép thử nói rằng kế hoạch cũ không sinh việc thực ra không chạm đến phần mã mới, nên nó không chứng minh được điều đó.
  file: `apps/api/test/ke-hoach-sinh-viec.spec.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/21 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ke-hoach-sinh-viec/rang/khong-xoa-expect.mjs, _acceptance/ke-hoach-sinh-viec/rang/san-thiet-ke.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
