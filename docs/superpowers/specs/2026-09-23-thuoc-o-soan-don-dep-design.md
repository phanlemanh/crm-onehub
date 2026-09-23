# Thước `o-soan.mjs` dọn sạch mọi lối thoát — design

Ngày: 2026-09-23 · Hồ sơ: `thuoc-o-soan-don-dep` · Hạng: T2 · Gốc: `7cf69d6a` (onehub sau PR #90)

## Vấn đề

`_acceptance/o-soan-va-ly-do-loi/rang/o-soan.mjs` là thước puppeteer của hồ sơ đã ký
`o-soan-va-ly-do-loi` (E1, E2, E8). Vòng chấm S4 round 1 của hồ sơ đó ghi ba lỗi
ngoài hợp đồng, cộng một hạn chế đã biết (Ngoài-1):

1. `chanCay()` tự viết lại việc chặn cây. `khongDo()` gọi `process.exit(2)` trong
   `try`, mà `process.exit` không chạy `finally`, nên dấu mốc
   `apps/app/public/o-soan-canh-<pid>-<uuid>.svg` sót lại mỗi khi cây sai. Tên không
   mang tiền tố `canh-cay-` nên bộ gom rác của `canh-cay.mjs` không nhặt.
2. Mọi lối `khongDo()` sau `gieo()` thoát bằng `process.exit(2)`: bỏ qua
   `trinh.close()` và `db.agentConversation.deleteMany`. Hội thoại «o-soan do» mang
   thẻ lỗi nằm lại trong danh sách hội thoại của người đo (DB dev lúc viết còn một hàng
   như thế, tạo 07:50 hôm nay), và Chrome headless có thể mồ côi.
3. `EMAIL` mặc định là một email thật ghi cứng; token `builder:${id}` viết tay thay vì
   `builderToken`.
4. (Ngoài-1) Màu con trỏ khai hai lần — chuỗi CSS và mảng RGB — không ràng nhau.

## Cách sửa

Một tệp sản phẩm của vòng: `o-soan.mjs`.

- **Một lối ra.** `khongDo(cau)` ném `KhongDoDuoc`. Toàn bộ thân kịch bản nằm trong
  một `try/catch/finally` ở tầng ngoài; `finally` gọi `donDep()` rồi mới
  `process.exit(ma)`. Không còn `process.exit` nào trước khi dọn.
- **`donDep()` chạy đúng một lần** (giữ promise), gồm ba bước độc lập, mỗi bước bọc
  riêng: đóng Chrome nếu đã mở · xoá hội thoại nếu đã gieo · ngắt DB. Bước nào hỏng in
  `KHONG DON DUOC: <gì>: <lỗi>` và nâng mã thoát lên 2 — không im.
- **Mọi lỗi đều ra mã 2.** Nhánh `catch` gán mã 2 cho cả `KhongDoDuoc` lẫn lỗi lạ
  (lỗi lạ in `KHONG DO DUOC: rang hong giua chung: <lỗi>` như bản cũ).
- **Id hội thoại ghi lại ngay sau `create`**, trước `update` và `agentEvent.create`,
  để một lần gieo hỏng giữa chừng vẫn được dọn.
- **Tín hiệu.** `puppeteer.launch` đặt `handleSIGINT/handleSIGTERM/handleSIGHUP: false`
  (mặc định của puppeteer tự `process.exit` khi nhận tín hiệu, bỏ qua dọn DB). Kịch bản
  tự bắt SIGINT/SIGTERM: chạy `donDep()` rồi thoát 130/143.
- **Chặn cây** bằng `canhCay()` của `man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs`
  (dấu mốc `canh-cay-*`, dọn trong `finally` của nó + `process.on("exit")`, gom rác cũ).
  Kết quả khác `dung-cay` → in `dong` của nó, mã 2.
- **Người đo bắt buộc.** `NGUOI` vắng → `KHONG DO DUOC: thieu NGUOI …`, mã 2, trước
  mọi bước khác. Không mặc định email nào trong tệp.
- **`builderToken`** import từ `apps/agent/agent/lib/custom-agent-dispatch.ts`
  (đo: import từ `.mjs` dưới bun chạy được, 54 ms).
- **Màu:** `MAU_CON_TRO = \`rgb(${MAU_CON_TRO_RGB.join(", ")})\``.
- **Thư mục bằng chứng** đọc `BANG_CHUNG` từ môi trường, vắng thì như cũ
  (`../evidence`). Cần để lượt chạy thật của hồ sơ này không ghi đè ảnh của hồ sơ đã ký.

Vì sao không dùng email sinh theo pid như `man-xin-quyen.mjs`: E1/E2/E8 chạy
`o-soan.mjs` bên trong `scripts/lan-do/tien-de.mjs` — tiến trình khác, pid khác — và
`tien-de` đòi `NGUOI` có sẵn trong kho rồi đặt tiền đề (ảnh đại diện…) cho đúng người
đó. Email theo pid của `o-soan` không bao giờ trùng người `tien-de` đã chuẩn bị.
Nên `NGUOI` bắt buộc, và `steps` của E1/E2/E8 trong `evals.yaml` của hồ sơ đã ký
truyền `NGUOI=${NGUOI:-dev@localhost}` (nếp của các lệnh `tq_*` trong `config.yaml`).
`dev@localhost` đã có trong kho và là thành viên `crm`.

## Cách chứng

`_acceptance/thuoc-o-soan-don-dep/rang/pha-thu.mjs`:

- Chép rang đang xét vào `.acceptance-runs/thuoc-o-soan-don-dep/`, đổi import tương
  đối sang đường tuyệt đối, chèn lỗi tại mốc có tên (mốc vắng → mã 2 gọi tên mốc, không
  im lặng xanh).
- Dựng máy chủ tĩnh giả trên cổng ngẫu nhiên thay app: phục vụ `apps/app/public` của
  cây (canh-cay ra `dung-cay`) hoặc một thư mục khác có một `.svg` (ra `khac-cay`).
  Không cần máy chủ dev.
- Mỗi ca chụp ba thứ trước và sau: tệp trong `apps/app/public`, hội thoại «o-soan do»
  của mọi người dùng tạo sau lúc bắt đầu, tiến trình Chrome có `TMPDIR` riêng của lượt
  trong dòng lệnh. Các ca chạy tuần tự qua khoá `mot-luot.sh`. Đối chứng dương: SIGKILL
  bản sửa giữa chừng thì bộ đo phải thấy Chrome và hội thoại sót. Vật sót → ca đỏ với thông
  điệp ghim `<ca>: sot <vat>`; bộ đo tự dọn vật sót nó thấy (xoá tệp, xoá hàng, giết
  đúng pid mới) để không để lại rác cho người khác.
- Chiều đỏ: chính kịch bản đó trên `o-soan.mjs` ở `7cf69d6a` phải đỏ ở các ca đã hứa.
- Lượt thật (`ui-check`): ba chế độ trên máy chủ dev của cây (3600/3601) bằng đúng dòng
  lệnh trong `steps` của E1/E2/E8 — cũng là lần chứng lại ba eval đó, vì làn ghim lại
  không chạy `ui-check`.

Sau khi hồ sơ này qua S4: `repin-lane.mjs --write` cho `o-soan-va-ly-do-loi`. Dòng
ghim sẽ liệt E1/E2/E8 vào `evals_not_machine_touched`; bằng chứng chứng lại ba eval ấy
là lượt thật của hồ sơ này.

## Không làm

- SIGKILL giữa lượt: không chặn được từ trong tiến trình; vẫn có thể sót hàng.
- Gom rác hội thoại «o-soan do» cũ theo tuổi (như `canh-cay` gom dấu mốc).
- Email mặc định ghi cứng trong `scripts/lan-do/tien-de.mjs` — tệp của hồ sơ khác.
- `gieo()` chọn `organization.findFirst()` thay vì không gian của người đo.
