# Review findings: hop-thong-bao-tren-web (vòng 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trần giao dịch đối chiếu viết lại phép đổi phút ngay tại chỗ thay vì dẫn từ một hằng phút chung**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào. Chỉ là mấy con số thời gian của chuông thông báo được viết hơi lặp, sau này đổi một mốc phải sửa nhiều chỗ.
  file: `packages/validation/src/thong-bao.ts`
  severity: low
  Đề xuất: known-limits

- **Shape 3 (presence instead of relation): the new cleanup test checks only 'last seen today' and misses the boundary with the writer's continuity window**
  Người dùng thấy gì: Nếu sau này ai đó sửa nhầm việc dọn thông báo cũ, một thông báo của mục vẫn đang được nhắc mỗi ngày có thể bị xoá sớm và người dùng sẽ thấy thông báo đã đọc hiện lại như mới. Hiện chưa có bài kiểm nào bắt được lỗi kiểu đó.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (declared row without an assert): E12 row 8 promises the CLI command runs a read-only transaction capped by THONG_BAO.doiChieu.tranGiaoDichMs, but no test checks it**
  Người dùng thấy gì: Lệnh đối chiếu số thông báo của chủ kho chạy trên dữ liệu thật lớn có thể báo lỗi hết giờ nếu ai đó gỡ mất giới hạn thời gian riêng của nó, và không bài kiểm nào cảnh báo trước.
  file: `_acceptance/hop-thong-bao-tren-web/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Shape 5 (claims a whole class, checks one point): the 'reads the table once' test only counts findMany, so per-row reads through another method slip past**
  Người dùng thấy gì: Lệnh đối chiếu có thể bị chậm đi nhiều khi dữ liệu thông báo lớn nếu về sau ai đó cho nó đọc từng dòng một, mà bài kiểm hiện tại không phát hiện. Số liệu in ra vẫn đúng.
  file: `apps/agent/test/thong-bao-doi-chieu.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **New variable DOI_CHIEU_DATABASE_URL is missing from .env.example (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người chạy lệnh đối chiếu thông báo lần đầu chỉ biết cần thêm một địa chỉ cơ sở dữ liệu riêng khi lệnh báo lỗi, vì chưa có dòng hướng dẫn nào trong tệp cấu hình mẫu.
  file: `apps/agent/scripts/thong-bao-doi-chieu.ts`
  severity: medium
  Đề xuất: known-limits

- **Notification write stores noiDung without parsing it, but the read path parses strictly and fails the whole list (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này một loại thông báo bị sửa lệch giữa hai nơi, một thông báo sai dạng có thể làm chuông và trang Thông báo của người đó báo lỗi tải cho tới khi thông báo bị dọn sau 90 ngày.
  file: `apps/agent/agent/lib/thong-bao-ghi.ts`
  severity: medium
  Đề xuất: known-limits

- **Reconcile command re-declares the subject format and run outcomes as untyped literals (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này thêm một kết quả nhắc mới hay đổi tên kết quả cũ, báo cáo đối chiếu có thể đếm sai số người có kênh và không có kênh mà không ai hay.
  file: `apps/agent/agent/lib/thong-bao-doi-chieu.ts`
  severity: low
  Đề xuất: known-limits

- **Bell popover header is hand-drawn while PopoverHeader and PopoverTitle exist in packages/ui (r1)**
  Người dùng thấy gì: Phần đầu của ô thông báo trông và hoạt động đúng, nhưng được dựng riêng thay vì dùng thành phần chung, nên sau này đổi kiểu giao diện phải sửa hai nơi.
  file: `apps/app/components/thong-bao/chuong-thong-bao.tsx`
  severity: low
  Đề xuất: known-limits

- **Phân trang con trỏ với `skip: 1` bỏ sót một thông báo chưa đọc khi hàng làm con trỏ vừa thành đã đọc (r1)**
  Người dùng thấy gì: Khi mở trang Thông báo ở hai thẻ trình duyệt và đọc một thông báo ở thẻ này, bấm «Xem thêm» ở thẻ kia có thể bỏ sót một thông báo chưa đọc, không có lời báo nào.
  file: `apps/api/src/thong-bao/thong-bao.service.ts`
  severity: low
  Đề xuất: known-limits

- **Mở một thông báo hỏng thì không báo gì: mutation `moMot` không có onError (r1)**
  Người dùng thấy gì: Nếu mạng chập chờn lúc bấm một thông báo, bạn vẫn được đưa tới đúng chỗ nhưng thông báo vẫn chưa đọc và số trên chuông không giảm, không có dòng nào cho biết vì sao.
  file: `apps/app/components/thong-bao/chuong-thong-bao.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ma trận htb-gop f đưa thẳng MUC_MAU viết tay vào ghiThongBao, không gieo qua đường ghi thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm cho việc không nhân đôi thông báo dùng mục mẫu cố định, nên nếu sau này một loại mục lặp bị sinh thông báo mới mỗi sáng thì bài kiểm có thể vẫn báo xanh.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng ma trận không rút từ lớp): bài câu thông báo lặp trên LOAI_THONG_BAO viết tay thay vì THU_TU_NHAC (r1)**
  Người dùng thấy gì: Nếu sau này thêm một loại nhắc mới mà quên viết câu hiển thị cho nó, bài kiểm hiện tại có thể không bắt được và người dùng sẽ thấy thông báo thiếu câu.
  file: `apps/app/test/thong-bao-cau.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): lệnh htb_thiet_ke chỉ quét page.tsx của trang thông báo (r1)**
  Người dùng thấy gì: Phần chính của trang Thông báo (danh sách và bộ lọc) không được máy kiểm tra giao diện quét, nên lỗi kiểu dáng ở đó chỉ lộ ra khi người xem bằng mắt.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): vai okr chỉ được kiểm `.not.toBe(403)` (r1)**
  Người dùng thấy gì: Bài kiểm cho người chỉ dùng OKR chỉ xác nhận họ không bị từ chối, chưa xác nhận họ thật sự nhận được dữ liệu, nên một lỗi khác vẫn có thể lọt qua.
  file: `apps/api/test/thong-bao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính một mình, không ghim thông điệp): htb-kenh 4 chỉ kiểm «có ném», còn lần thử lại chạy rỗng vẫn qua (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tình huống gửi Zalo hỏng rồi thử lại có thể báo xanh dù lần thử lại không thật sự chạy, nên việc không nhân đôi thông báo khi thử lại chưa được chứng minh chắc.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm tính không có đối chứng phân biệt): hàng biên của htb-don không tách được `<` và `<=` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm việc dọn thông báo cũ không phân biệt được thông báo đúng 90 ngày tuổi bị giữ hay xoá; chênh lệch chỉ một khoảnh khắc nên ảnh hưởng người dùng gần như không có.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bước dọn trong nhịp mỗi phút được kiểm bằng regex trên mã nguồn dispatch.ts (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc nhịp chạy mỗi phút có thật sự dọn thông báo quá 90 ngày chỉ được kiểm bằng cách đọc chữ trong mã, chưa được kiểm bằng việc chạy thật.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): đường dẫn thông báo được kiểm qua hàm phụ duongTrongApp, không qua duongDan đã ghi (r1)**
  Người dùng thấy gì: Việc đường dẫn trong thông báo trùng với đường dẫn tin Zalo được kiểm gián tiếp, nên nếu hai bên lệch nhau sau này người dùng có thể bấm thông báo và đến chỗ khác với tin Zalo mà bài kiểm không báo.
  file: `apps/agent/test/thong-bao-duong.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm có mặt hay số đếm trong khi lời hứa là quan hệ thứ tự): «mới nhất trước» không được kiểm ở đâu (r1)**
  Người dùng thấy gì: Chưa có bài kiểm nào giữ cho thông báo mới nhất luôn nằm trên cùng, nên nếu sau này thứ tự bị đảo, người dùng sẽ thấy thông báo cũ lên trước mà không bài kiểm nào báo.
  file: `apps/api/test/thong-bao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (số đếm thay cho quan hệ): phân trang bằng con trỏ chỉ đếm 30 và 5 dòng (r1)**
  Người dùng thấy gì: Bài kiểm «Xem thêm» chỉ đếm số dòng mỗi trang nên nếu trang sau lặp lại dòng của trang trước thì người dùng thấy thông báo trùng mà bài kiểm vẫn xanh.
  file: `apps/api/test/thong-bao.spec.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên «mỗi dòng» nhưng chỉ có điểm-case): href và chấm chưa đọc chỉ kiểm dòng đầu và phía chưa đọc (r1)**
  Người dùng thấy gì: Bài kiểm danh sách thông báo chỉ soi dòng đầu và các dòng chưa đọc; nếu một dòng khác sai đường dẫn hoặc hiện nhầm chấm chưa đọc thì bài kiểm không thấy.
  file: `apps/app/test/thong-bao.dom.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 3 (đếm thay cho quan hệ): khoá «bộ kiểm cũ không sửa assert» chỉ đếm số chuỗi `expect(` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc giữ nguyên tin Zalo và Slack chỉ được bảo vệ bằng số dòng kiểm tra, nên một thay đổi kỳ vọng cũ có thể lọt qua mà không ai nhận ra.
  file: `apps/agent/test/thong-bao-ghi.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính đứng một mình): ô doc-het-1280 chỉ kiểm «không còn số» mà không đối chứng với API (r1)**
  Người dùng thấy gì: Phép đo màn «đánh dấu tất cả đã đọc» có thể báo đạt khi số chưa kịp tải về, nên kết quả đo có khả năng đạt giả.
  file: `_acceptance/hop-thong-bao-tren-web/rang/do-man.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên «in đủ» nhưng chỉ có điểm-case): đầu ra CLI ca 6 chỉ kiểm khoá đầu tiên của K2 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm lệnh đối chiếu chỉ xác nhận lệnh in ra mã mục mất đầu tiên, nên nếu lệnh in thiếu các mã sau thì bài kiểm không phát hiện.
  file: `apps/agent/test/thong-bao-doi-chieu.integration.spec.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
