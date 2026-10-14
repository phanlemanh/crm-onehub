# Review findings: hop-thong-bao-tren-web (round 1)

## Trong hợp đồng

- **Đối chiếu chạy trong transaction tương tác có trần mặc định 5 s, nên đo 30 ngày trên production sẽ hỏng** — `apps/agent/scripts/thong-bao-doi-chieu.ts:29` — severity: medium — AC: AC-12 — source: bugs
  detail: `db.$transaction(async (tx) => { SET TRANSACTION READ ONLY; return doiChieu(tx, …) })` không truyền `timeout`, nên Prisma dùng mặc định timeout 5000 ms (client ở packages/db/src/client.ts không đặt transactionOptions). Bên trong, `doiChieu` đọc MỌI lượt nhac-ke-hoach trong lịch sử (findMany không lọc theo ngày, kèm payload), rồi với mỗi lượt (người, ngày) trong khoảng lại gọi tuần tự một `thongBao.findMany`, sau đó thêm 2 lượt groupBy. Thước của contract (dòng 61) là chạy lệnh này trên production cho cả 30 ngày. Với 20 người × 30 ngày là khoảng 600 lần đi về tuần tự từ laptop tới Neon (mỗi lần 20–60 ms), tức 12–36 s, vượt xa 5 s. Transaction hết hạn, lệnh hỏng với P2028 «Transaction already closed» và không in được con số nào. Test tích hợp gọi thẳng `doiChieu(db, …)` ngoài transaction trên dữ liệu nhỏ nên không bắt được. Cách sửa: truyền `{ timeout, maxWait }` đủ lớn, hoặc gom truy vấn (một findMany thongBao cho cả khoảng rồi so trong bộ nhớ) và lọc lượt theo createdAt.
  lý do vào hợp đồng: AC-12 đòi lệnh đối chiếu in số liệu theo từng ngày cho một khoảng ngày; nếu lệnh hết thời gian trên khoảng 30 ngày thì không in được gì, đúng thước đo của hợp đồng.

- **Bước dọn 90 ngày xoá cả thông báo của mục vẫn đang nhắc liên tục; sáng hôm sau mục đó thành một thông báo chưa đọc mới** — `apps/agent/agent/lib/thong-bao-ghi.ts:66` — severity: medium — AC: AC-2 — source: bugs
  detail: `donThongBaoCu` xoá theo `taoLuc < now - 90 ngày`. Nhưng `ghiThongBao` gộp mục lặp vào CÙNG một hàng: chỉ cập nhật `thayNgay`/`noiDung` và không bao giờ đổi `taoLuc`. Một mục nằm liên tục trong danh sách nhắc hơn 90 ngày (Việc quá hạn bị bỏ quên, KR im lìm `okr-kr-im`, kế hoạch im `ke-hoach-im`) thì bị nhịp mỗi phút xoá ngay khi qua mốc, dù `thayNgay` vẫn là hôm nay. Mục đó biến khỏi chuông và trang tới sáng hôm sau. Sáng hôm sau `findFirst(thayNgay in [homQua, homNay])` không thấy gì nên tạo một hàng mới, `ngayDau` là hôm nay và chưa đọc. Như vậy AC-2 («không có thông báo mới cho mục đó, dù thông báo cũ đã đọc hay chưa … cho mọi loại mục») bị vi phạm. Thêm nữa, lệnh đối chiếu chạy cho một khoảng có các ngày mà hàng cũ từng phủ sẽ báo các mục đó là «mất» và thoát mã 1, một báo động giả. Nên tính hạn giữ theo `thayNgay` (ngày cuối còn được nhắc), hoặc cập nhật mốc giữ mỗi lần gộp.
  lý do vào hợp đồng: AC-2 cấm tạo thông báo mới cho mục nằm liên tục trong danh sách nhắc, đúng cho mọi loại; bước dọn xoá hàng cũ khiến mục lặp sinh thông báo mới chưa đọc.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **New variable DOI_CHIEU_DATABASE_URL is missing from .env.example**
  Người dùng thấy gì: Người chạy lệnh đối chiếu thông báo lần đầu chỉ biết cần thêm một địa chỉ cơ sở dữ liệu riêng khi lệnh báo lỗi, vì chưa có dòng hướng dẫn nào trong tệp cấu hình mẫu.
  file: `apps/agent/scripts/thong-bao-doi-chieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Notification write stores noiDung without parsing it, but the read path parses strictly and fails the whole list**
  Người dùng thấy gì: Nếu sau này một loại thông báo bị sửa lệch giữa hai nơi, một thông báo sai dạng có thể làm chuông và trang Thông báo của người đó báo lỗi tải cho tới khi thông báo bị dọn sau 90 ngày.
  file: `apps/agent/agent/lib/thong-bao-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **Reconcile command re-declares the subject format and run outcomes as untyped literals**
  Người dùng thấy gì: Nếu sau này thêm một kết quả nhắc mới hay đổi tên kết quả cũ, báo cáo đối chiếu có thể đếm sai số người có kênh và không có kênh mà không ai hay.
  file: `apps/agent/agent/lib/thong-bao-doi-chieu.ts`
  severity: low
  Đề xuất: known-limits

- **Bell popover header is hand-drawn while PopoverHeader and PopoverTitle exist in packages/ui**
  Người dùng thấy gì: Phần đầu của ô thông báo trông và hoạt động đúng, nhưng được dựng riêng thay vì dùng thành phần chung, nên sau này đổi kiểu giao diện phải sửa hai nơi.
  file: `apps/app/components/thong-bao/chuong-thong-bao.tsx`
  severity: low
  Đề xuất: known-limits

- **Phân trang con trỏ với `skip: 1` bỏ sót một thông báo chưa đọc khi hàng làm con trỏ vừa thành đã đọc**
  Người dùng thấy gì: Khi mở trang Thông báo ở hai thẻ trình duyệt và đọc một thông báo ở thẻ này, bấm «Xem thêm» ở thẻ kia có thể bỏ sót một thông báo chưa đọc, không có lời báo nào.
  file: `apps/api/src/thong-bao/thong-bao.service.ts`
  severity: low
  Đề xuất: known-limits

- **Mở một thông báo hỏng thì không báo gì: mutation `moMot` không có onError**
  Người dùng thấy gì: Nếu mạng chập chờn lúc bấm một thông báo, bạn vẫn được đưa tới đúng chỗ nhưng thông báo vẫn chưa đọc và số trên chuông không giảm, không có dòng nào cho biết vì sao.
  file: `apps/app/components/thong-bao/chuong-thong-bao.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ma trận htb-gop f đưa thẳng MUC_MAU viết tay vào ghiThongBao, không gieo qua đường ghi thật**
  Người dùng thấy gì: Bài kiểm cho việc không nhân đôi thông báo dùng mục mẫu cố định, nên nếu sau này một loại mục lặp bị sinh thông báo mới mỗi sáng thì bài kiểm có thể vẫn báo xanh.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận không rút từ lớp): bài câu thông báo lặp trên LOAI_THONG_BAO viết tay thay vì THU_TU_NHAC**
  Người dùng thấy gì: Nếu sau này thêm một loại nhắc mới mà quên viết câu hiển thị cho nó, bài kiểm hiện tại có thể không bắt được và người dùng sẽ thấy thông báo thiếu câu.
  file: `apps/app/test/thong-bao-cau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): lệnh htb_thiet_ke chỉ quét page.tsx của trang thông báo**
  Người dùng thấy gì: Phần chính của trang Thông báo (danh sách và bộ lọc) không được máy kiểm tra giao diện quét, nên lỗi kiểu dáng ở đó chỉ lộ ra khi người xem bằng mắt.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): vai okr chỉ được kiểm `.not.toBe(403)`**
  Người dùng thấy gì: Bài kiểm cho người chỉ dùng OKR chỉ xác nhận họ không bị từ chối, chưa xác nhận họ thật sự nhận được dữ liệu, nên một lỗi khác vẫn có thể lọt qua.
  file: `apps/api/test/thong-bao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình, không ghim thông điệp): htb-kenh 4 chỉ kiểm «có ném», còn lần thử lại chạy rỗng vẫn qua**
  Người dùng thấy gì: Bài kiểm tình huống gửi Zalo hỏng rồi thử lại có thể báo xanh dù lần thử lại không thật sự chạy, nên việc không nhân đôi thông báo khi thử lại chưa được chứng minh chắc.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính không có đối chứng phân biệt): hàng biên của htb-don không tách được `<` và `<=`**
  Người dùng thấy gì: Bài kiểm việc dọn thông báo cũ không phân biệt được thông báo đúng 90 ngày tuổi bị giữ hay xoá; chênh lệch chỉ một khoảnh khắc nên ảnh hưởng người dùng gần như không có.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bước dọn trong nhịp mỗi phút được kiểm bằng regex trên mã nguồn dispatch.ts**
  Người dùng thấy gì: Việc nhịp chạy mỗi phút có thật sự dọn thông báo quá 90 ngày chỉ được kiểm bằng cách đọc chữ trong mã, chưa được kiểm bằng việc chạy thật.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): đường dẫn thông báo được kiểm qua hàm phụ duongTrongApp, không qua duongDan đã ghi**
  Người dùng thấy gì: Việc đường dẫn trong thông báo trùng với đường dẫn tin Zalo được kiểm gián tiếp, nên nếu hai bên lệch nhau sau này người dùng có thể bấm thông báo và đến chỗ khác với tin Zalo mà bài kiểm không báo.
  file: `apps/agent/test/thong-bao-duong.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm có mặt hay số đếm trong khi lời hứa là quan hệ thứ tự): «mới nhất trước» không được kiểm ở đâu**
  Người dùng thấy gì: Chưa có bài kiểm nào giữ cho thông báo mới nhất luôn nằm trên cùng, nên nếu sau này thứ tự bị đảo, người dùng sẽ thấy thông báo cũ lên trước mà không bài kiểm nào báo.
  file: `apps/api/test/thong-bao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (số đếm thay cho quan hệ): phân trang bằng con trỏ chỉ đếm 30 và 5 dòng**
  Người dùng thấy gì: Bài kiểm «Xem thêm» chỉ đếm số dòng mỗi trang nên nếu trang sau lặp lại dòng của trang trước thì người dùng thấy thông báo trùng mà bài kiểm vẫn xanh.
  file: `apps/api/test/thong-bao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên «mỗi dòng» nhưng chỉ có điểm-case): href và chấm chưa đọc chỉ kiểm dòng đầu và phía chưa đọc**
  Người dùng thấy gì: Bài kiểm danh sách thông báo chỉ soi dòng đầu và các dòng chưa đọc; nếu một dòng khác sai đường dẫn hoặc hiện nhầm chấm chưa đọc thì bài kiểm không thấy.
  file: `apps/app/test/thong-bao.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (đếm thay cho quan hệ): khoá «bộ kiểm cũ không sửa assert» chỉ đếm số chuỗi `expect(`**
  Người dùng thấy gì: Việc giữ nguyên tin Zalo và Slack chỉ được bảo vệ bằng số dòng kiểm tra, nên một thay đổi kỳ vọng cũ có thể lọt qua mà không ai nhận ra.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính đứng một mình): ô doc-het-1280 chỉ kiểm «không còn số» mà không đối chứng với API**
  Người dùng thấy gì: Phép đo màn «đánh dấu tất cả đã đọc» có thể báo đạt khi số chưa kịp tải về, nên kết quả đo có khả năng đạt giả.
  file: `_acceptance/hop-thong-bao-tren-web/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên «in đủ» nhưng chỉ có điểm-case): đầu ra CLI ca 6 chỉ kiểm khoá đầu tiên của K2**
  Người dùng thấy gì: Bài kiểm lệnh đối chiếu chỉ xác nhận lệnh in ra mã mục mất đầu tiên, nên nếu lệnh in thiếu các mã sau thì bài kiểm không phát hiện.
  file: `apps/agent/test/thong-bao-doi-chieu.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
