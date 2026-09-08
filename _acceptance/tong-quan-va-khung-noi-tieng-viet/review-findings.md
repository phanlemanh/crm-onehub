# Review Findings — tong-quan-va-khung-noi-tieng-viet (round 3)

## Trong hợp đồng

- **Hình dạng 3 — E6/chân tieu-de assert "chuỗi có mặt + có dấu" trong khi lời hứa AC-6 là QUAN HỆ title ⟵ tongQuanMessages(getLocale())**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml:115`
  severity: high
  source: measurement
  AC: AC-6
  detail: E6 (cmd `tq_tieu_de` → `chu-ngoai-jsx.mjs --chan tieu-de`) khai: «Do QUAN HE, khong do import: gia tri title tra ve la thuoc tinh cua ket qua goi tongQuanMessages(await getLocale())» và khai chiều đỏ: «doi sang title: "Tong quan" viet thang thi van do vi khong con quan he voi kho».

  Chân thật (`_acceptance/man-cai-dat-noi-tieng-viet/rang/chu-ngoai-jsx.mjs`, hàm `chanTieuDe`, dòng 213-287) KHÔNG đo quan hệ nào. Nó chỉ làm hai việc: (a) đếm số PropertyAssignment tên `title` phải bằng `TD.so_o` (=1), và (b) lọc `con = thang.filter(x => !GIU_NGUYEN.has(x.viet_thang) && /[A-Za-z]/.test(x.viet_thang) && !DAU.test(x.viet_thang))` — tức chỉ đỏ khi literal là chữ Latin KHÔNG DẤU. Initializer không phải string literal thì `viet_thang = null` và bị bỏ qua hoàn toàn; không có node nào đọc `tongQuanMessages`, `getLocale`, hay kho chuỗi.

  Đã kiểm chứng thực nghiệm trên chính cây này: thay dòng 28 của `apps/app/app/(app)/[slug]/page.tsx` thành `return { title: "Tổng quan" };` (literal viết cứng, có dấu) rồi chạy lại chân — output vẫn là `1 o con viet thang` … `XANH: ca 1 o nhan deu doc tu kho chuoi`, thoát 0. (Cây đã trả nguyên trạng.) Nghĩa là chiều đỏ thứ hai mà E6 tự khai KHÔNG tồn tại, và vế QUAN HỆ của AC-6 hiện không có phép đo nào phủ — chỉ có vế `document.title` hai lượt ở E1, vốn cũng xanh với một literal tiếng Việt viết cứng.

  Lý do trong hợp đồng: AC-6 minh thị yêu cầu đo QUAN HỆ giá trị title với tongQuanMessages(getLocale()), không đo bằng sự có mặt của import; finding chứng thực nghiệm rằng chân đo hiện tại chỉ bắt literal ASCII không dấu và bỏ lọt một literal tiếng Việt viết cứng, nên vế quan hệ của AC-6 hiện không được đo.

- **Hình dạng 4 — assertion âm-tính-một-mình: `expect(ghim).toEqual([])` cho formatCount, không đối chứng dương, không ghim tổng số lời gọi quét được**
  file: `apps/app/test/messages-guard.spec.ts:617`
  severity: high
  source: measurement
  AC: AC-15
  detail: Ca `khong cho nao trong lat ghim "en" vao formatCount` (dòng 605-618) đọc 8 file rồi `expect(ghim).toEqual([])`. Không có bất kỳ khẳng định dương nào rằng bộ quét thật sự tìm ra lời gọi `formatCount` nào — tập rỗng vì mã đúng và tập rỗng vì phép đo mù cho ra cùng một màu xanh.

  Thực tế trong 8 file được quét chỉ có ĐÚNG MỘT lời gọi `formatCount` (`apps/app/app/(app)/[slug]/sales-dashboard.tsx:52`). Xoá lời gọi đó, đổi tên hàm, di chuyển nó sang file thứ 9 không nằm trong hằng `FILE` viết tay, hay bọc đối số đầu bằng một lời gọi khác — `ghim` vẫn `[]` và ca vẫn xanh. Regex `/formatCount\([^)]*"(en|vi)"[^)]*\)/g` còn không vượt được dấu `)` lồng, nên hồi quy thật như `formatCount(Number(n), noun, "en")` KHÔNG bị bắt.

  Đối chiếu: mọi chân khác trong repo này đều tự chặn tập rỗng (`chanToast`: `if (thay.length !== BANG.loi_goi.length) exit 2`; `chanThuocTinh`: «KHONG DO DUOC: 0 thuoc tinh nao doc tu kho chuoi. Tap quan sat rong khong bao gio la dat»). Ca này thiếu đúng cái chốt đó, dù E16 tuyên nó là ca «phan biet duoc cay nay voi cay truoc vong».

  Lý do trong hợp đồng: AC-15 yêu cầu minh thị 'không còn chỗ nào trong lát ghim "en" vào formatCount'; bài kiểm chỉ khẳng định tập ghim rỗng mà không xác nhận bộ quét thực sự tìm thấy lời gọi nào, nên không phân biệt được mã đúng với phép đo mù, khiến yêu cầu của AC-15 không được chứng thật.

- **Hình dạng 2 — bản khai `luat` của khong-dich-cua-lat.json là bản sao viết tay của hằng trong chân đo, không bên nào đọc bên nào**
  file: `_acceptance/tong-quan-va-khung-noi-tieng-viet/rang/khong-dich-cua-lat.json:18`
  severity: medium
  source: measurement
  AC: AC-7
  detail: File khai năm luật trừ (`so-thuan`, `du-lieu-nguoi-nhap`, `lang-en`, `so-tien` kèm `don_vi_rut_gon: [N, Tr, T, K, M, B]`, `o-nhap`) và nói rõ đó là luật của chân đo.

  `man-that.mjs` KHÔNG BAO GIỜ đọc `khai.luat`: `bangKhongDich()` (dòng 145-155) chỉ duyệt `k.dong`; `chanKhongDich` chỉ dùng thêm `khai.dong.length`. Toàn bộ luật trừ được viết cứng lần thứ hai trong chính script — `DON_VI_RUT_GON = ["N","Tr","T","K","M","B"]` ở dòng 38 là bản sao ký tự-đối-ký-tự của `don_vi_rut_gon` trong JSON, và `boiChung()` (dòng 165-175) cùng vòng lọc ứng viên (dòng 397-407) viết cứng CHI_SO / laSoTien / khongDich / `@value` / langEn.

  Hệ quả: sửa bản khai (thêm một đơn vị rút gọn, bỏ một luật) không đổi một phép đo nào — bản khai là tài liệu, không phải đầu vào. Độ trôi đã xảy ra thật và nhìn thấy được: hợp đồng AC-7 và E7 nói «trừ BA luật có tên», JSON khai NĂM, code áp SÁU nhánh trừ, và chính dòng log ở `man-that.mjs:408` vẫn in «(sau ba luat)». Không có chân nào bắt được sự lệch đó vì không có round-trip giữa bản khai và bên đọc.

  Lý do trong hợp đồng: AC-7 minh thị nói 'trừ ba luật có tên', nhưng finding cho thấy JSON khai năm luật, code áp sáu nhánh trừ viết cứng và log vẫn in 'sau ba luat' — ba con số không khớp nhau nghĩa là phép đo điều-kiện-trước-khi-gom mà AC-7 yêu cầu không đáng tin và không round-trip với bản khai.

- **Hình dạng 2 — bài kiểm mucDangMo chép tay `workspaceUrl` (helper `wu`) thay vì round-trip qua hàm thật**
  file: `apps/app/test/khung-dieu-huong.spec.ts:11`
  severity: medium
  source: measurement
  AC: AC-16
  detail: Dòng 11: `const wu = (p: string) => \`/onehub${p === "/" ? "" : p}\`;` là bản chép tay của `workspaceUrl` thật ở `apps/app/lib/workspace-url.ts:1-5` (`path === "/" ? "" : path.startsWith("/") ? path : "/" + path`), và bản chép bỏ mất nhánh chuẩn hoá đường dẫn không có dấu `/` đầu.

  `mucDangMo` nhận `workspaceUrl` như tham số nên hàm thật hoàn toàn import được (`app-icon-rail.tsx:209-229` truyền `useWorkspaceUrl()`). Vì bài kiểm tự dựng đường dẫn theo khuôn nó mong đợi thay vì đi qua bên ghi thật, mọi thay đổi của `workspaceUrl` (đổi tiền tố, thêm chuẩn hoá, đổi cách xử lý `"/"`) đều để bài kiểm xanh trong khi việc đánh dấu mục đang mở đã gãy trên màn.

  Lý do trong hợp đồng: AC-16 yêu cầu bài kiểm đơn vị xác nhận 'mục đang mở vẫn đúng theo pathname'; vì bài kiểm tự chép tay logic workspaceUrl thay vì gọi hàm thật (bỏ sót nhánh chuẩn hoá đường dẫn), một regression thật trong workspaceUrl sẽ không bị bắt, nên yêu cầu của AC-16 không được chứng đáng tin.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **monthIso đọc trường UTC trên Date dựng theo giờ máy — nhãn tháng của biểu đồ lệch một tháng ở múi giờ UTC+**
  Người dùng thấy gì: Biểu đồ 'Đã chốt so với mới mở' trên trang Tổng quan có thể hiện sai tên tháng cho mọi cột (lệch một tháng), khiến người dùng đọc nhầm thời điểm dữ liệu.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: high
  Đề xuất: new-contract

- **Hợp đồng tRPC vẫn khai month: z.string() sau khi ý nghĩa trường đổi thành khoá ISO YYYY-MM**
  Người dùng thấy gì: Nếu dữ liệu tháng từ máy chủ sai định dạng, biểu đồ có thể hiện chuỗi thô khó hiểu (như '2026-13') thay vì báo lỗi rõ ràng cho người dùng.
  file: `apps/api/src/dashboard/dashboard.contracts.ts`
  severity: medium
  Đề xuất: known-limits

- **Câu tiếng Anh của unconverted.sentence mất động từ và đại từ so với bản cũ**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh sẽ thấy câu thông báo về tiền tệ chưa quy đổi bị thiếu động từ và đại từ, đọc lủng củng, khó hiểu.
  file: `apps/app/lib/messages/tong-quan.ts`
  severity: medium
  Đề xuất: known-limits

- **Tên công ty/cá nhân trong hàng đợi tra cứu chưa đánh dấu translate="no"**
  Người dùng thấy gì: Khi trình duyệt tự động dịch trang, tên công ty hoặc cá nhân hiển thị trong hàng đợi tra cứu có thể bị dịch sai thành cụm từ khác, gây hiểu lầm về danh tính khách hàng.
  file: `apps/app/components/enrichment-queue.tsx`
  severity: medium
  Đề xuất: known-limits

- **COT đặt tên hằng UPPER_SNAKE cho giá trị tính lại mỗi lần render**
  Người dùng thấy gì: Không ảnh hưởng đến người dùng cuối; chỉ khiến lập trình viên bảo trì sau này dễ hiểu nhầm biến này là hằng số cố định.
  file: `apps/app/app/(app)/[slug]/dashboard-summary.tsx`
  severity: low
  Đề xuất: wont-fix

- **Nhãn tháng của biểu đồ trend lệch một tháng ở mọi múi giờ UTC+ (gồm Asia/Saigon)**
  Người dùng thấy gì: Biểu đồ 'Đã chốt so với mới mở' trên trang Tổng quan có thể hiện sai tên tháng cho mọi cột (lệch một tháng), khiến người dùng đọc nhầm thời điểm dữ liệu.
  file: `apps/api/src/dashboard/dashboard.service.ts`
  severity: high
  Đề xuất: new-contract

- **formatMonth nuốt lỗi định dạng, trả nguyên chuỗi ISO ra trục biểu đồ**
  Người dùng thấy gì: Nếu dữ liệu backend đổi định dạng bất ngờ, trục thời gian của biểu đồ có thể hiện lẫn lộn chuỗi thô khó hiểu mà không có cảnh báo nào cho người vận hành.
  file: `packages/ui/src/lib/format.ts`
  severity: low
  Đề xuất: known-limits

- **Chuỗi tiếng Anh mất thông tin/ngữ pháp khi tách ra kho chuỗi**
  Người dùng thấy gì: Người dùng dùng giao diện tiếng Anh sẽ thấy nhãn số việc quá hạn và câu tiền tệ chưa quy đổi bị cụt, thiếu danh từ hoặc động từ, đọc không tự nhiên.
  file: `apps/app/lib/messages/tong-quan.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/12 lỗi rơi vào file không bộ đo nào phủ (apps/api/src/dashboard/dashboard.service.ts, apps/api/src/dashboard/dashboard.contracts.ts, packages/ui/src/lib/format.ts, _acceptance/tong-quan-va-khung-noi-tieng-viet/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
