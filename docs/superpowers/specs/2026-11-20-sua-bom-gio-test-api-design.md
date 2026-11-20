# Sửa 9 ca đỏ sẵn của suite api — bom giờ trong mã kiểm

Hồ sơ: `_acceptance/sua-bom-gio-test-api/` · hạng T2 (chỉ `apps/api/test/**`) · ngày 20/11/2026

## Vấn đề

Suite api trên `onehub` (`74a29a68`) ra 2159 pass / 9 fail từ khoảng 12/11; ngày 03/11 cùng mã ấy xanh. Chín ca nằm
ở hai tệp: `chu-may-sinh-ten-moi-goc.spec.ts` (`cmst-goc`, lỗi ở `beforeAll`) và `gop-y-dung-cho.spec.ts` (tám ca
đếm chip góp ý: `dem-chip` ×5, `loc-gop-y`, `dong-bo`, `bo-qua`). Chỗ đỏ sẵn này chặn lượt chấm S4 của vòng chuyển
kit II.2.

## Nguyên nhân gốc (đã đo)

Bảng `okrProgramConfig` giữ lịch sử cấu hình theo `createdAt`. Bài kiểm ghim đồng hồ JS (`setSystemTime`) về những
mốc cố định trong quá khứ gần, còn một số hàng cấu hình được ghi khi đồng hồ chạy giờ thật. Trước 10–12/11, giờ thật
nằm TRƯỚC các mốc ghim nên thứ tự thời gian vẫn đúng; từ sau đó giờ thật vượt mốc ghim và thứ tự đảo.

Đầu dò tạm (in bảng `okrProgramConfig` và `new Date()` ngay trước chỗ đỏ, chạy trọn suite 20/11):

| Tệp | Hàng cấu hình lúc đỏ | Đồng hồ khi đọc | Vì sao đỏ |
| --- | --- | --- | --- |
| `cmst-goc` | v1 20/11 09:14Z (aiOn false) · v2 20/11 09:15Z (aiOn true, soạn toàn công ty — của chính bài) | 10/11 03:00Z (`LUC_DOC`) | `soanMo` đọc `createdAt ≤ now` → không hàng nào → mặc định «tắt» → `don-vi-chua-bat` |
| `gop-y-dung-cho` | v2 12/11 08:00Z (AI bật — của bài, ghim `MOC_MAU`) · v1 20/11 09:14Z (aiOn false, người tạo `<mã>-admin`) | 12/11 08:00Z | `demGopYCho` đọc hàng mới nhất theo `createdAt` → v1 giờ thật thắng → chip 0 |

Tái hiện nhỏ: `cmst-goc` đỏ cả khi chạy một mình; `gop-y-dung-cho` một mình thì xanh, đỏ đúng 8 ca khi có một hàng
cấu hình giờ thật cấy trước (preload `rang/hang-sot.ts`).

## Cách sửa (chỉ mã kiểm)

1. **`gop-y-dung-cho`** — ngay sau `batDauMau()` (đồng hồ = `MOC_MAU`), chụp nguyên văn (`to_jsonb`) các hàng
   `okrProgramConfig` có `createdAt > MOC_MAU` rồi tạm gỡ chúng; ở `afterAll`, sau `ketThucMau`, chèn lại đúng các
   hàng ấy (`jsonb_populate_record`, khuôn đã có ở `okr-mau-cau-hinh.spec.ts`). Thế giới mẫu bắt đầu ở `MOC_MAU`; hàng
   «từ tương lai» không thuộc về bài, và các tệp chạy sau thấy lại bảng y như trước.
2. **`cmst-goc`** — ở đầu `gieoCuocSoan` (đồng hồ đang ghim `LUC_DOC`), ghi lại cùng chương trình
   (`aiOn: true`, `aiSoanPhamVi: "toan-cong-ty"`) qua `okr.setProgram`, để hàng mà `soanMo` đọc có `createdAt` không
   muộn hơn đồng hồ của chính nó. Lần ghi đầu ở `beforeAll` giữ nguyên; vì `program()` đọc theo `version` cao nhất
   nên lần ghi thứ hai không bật AI lần nữa và không sinh thêm việc `okr-kiem-san-sang`.

Phương án đã loại:
- Dời lần ghi ở `beforeAll` xuống sau khi ghim: việc `okr-kiem-san-sang` mà lần bật AI sinh ra có thể mang
  `createdAt` theo đồng hồ ghim (đo 20/11: Prisma điền `@default(now())` bằng đồng hồ JS) và lọt khỏi bước dọn
  `createdAt ≥ BAT_DAU` (lớp lỗi của #616).
- Sửa ngày `createdAt` của hàng cấu hình bằng `update`: trái luật «dữ liệu vào qua đường ghi thật».
- Chỉ xoá các hàng tương lai (khuôn của tiền lệ `tom-tat-tuan-dang-cho`): đổi bảng mà các tệp chạy sau nhìn thấy.
- Sửa `demGopYCho` cho đọc «tại now»: đổi mã sản phẩm, ngoài phạm vi; ở production hai cách đọc trùng nhau.

## Đo

- E1: trọn suite api 0 fail (chiều đỏ: 9 fail ở `74a29a68`).
- E2/E3: `rang/bom-gio.mjs` — chiều thuận trên cây của vòng; `--doi-chung 74a29a68d` dựng lớp phủ ngoài kho với
  hai tệp kiểm bản cũ và đòi đỏ đúng dấu.
- E4/E5: `rang/pham-vi.mjs` — vùng tệp đổi (đúng hai tệp kiểm), và hai tệp kiểm chỉ thêm dòng.
- E6: thước việc máy vô chủ của #616 (`vvc_ca_goi_api`) — trọn suite không để lại `AgentTask` chưa xong.

## Câu hỏi cho chủ kho

- Hỏi-1: sửa mã kiểm ở vòng này (khuyến nghị) hay coi chỗ đọc cấu hình bất nhất của sản phẩm (`demGopYCho` đọc bản
  mới nhất, `soanMo` đọc tại `now`) là nguyên nhân và dừng vòng? Ở production hai cách đọc trùng nhau vì
  `createdAt` không vượt giờ thật.

## Đặc tả UX

Không chạm giao diện (entry `bỏ đặc-tả-UX`).

## Mở lại sau S4 (20/11): các ca CI `test (api)` đỏ trên Linux

Chủ kho, qua phiên giữ đợt: «Kiểm tra và điều phối sửa pr 621». Hai lượt CI trên PR #621 (`104b29c0b`, `7ae40f624`) đỏ ở
những ca ngoài chín ca gốc. Thứ tự tệp trên Linux đổi theo máy chạy (`gop-y-dung-cho` thứ 151 ở lượt một, 220 ở lượt
hai), nên bộ ca đỏ khác nhau giữa hai lượt. Trên Mac không dựng lại được thứ tự ấy (`bun test --randomize` trộn cả ca
trong tệp: 119 fail), nên mỗi lớp được tái hiện bằng một cặp «tệp gây bẩn → tệp bị hại».

| Lớp | Ca trên CI | Nguyên nhân gốc (đã tái hiện) | Sửa |
| --- | --- | --- | --- |
| A — tên không gian làm việc | `htmb-toan-canh`, `bkr-cay-api` | CSDL mới tinh; tệp dựng tổ chức đầu tiên quyết tên gốc (`bao-loi` dựng «OneHub Center», `dungKho` dựng «CRM»); hai tệp mẫu ghim «CRM». `bao-loi` → `htmb`/`bam-kr` đỏ, diff đúng một trường `ten` | Hai bài so mẫu thay tên không gian làm việc thật (`readTenGoc`) bằng nhãn «CRM» trước khi so; tệp mẫu không đổi |
| B — thế giới mẫu | `soan-okr-so-do` | Đọc cấu hình ở `luc(22)` = `MOC_MAU` + 22 ngày, sau giờ thật; hàng giờ thật của tệp khác chen vào. Có hàng sót: 0 pass 1 fail `don-vi-chua-bat` | `batDauMau` chụp, tạm gỡ hàng `createdAt > MOC_MAU`; `ketThucMau` trả lại — cho cả 37 tệp dùng bộ mẫu |
| C — dữ liệu rò | `vai-chi-okr gan-vai` | `cua-vao-va` để lại người dùng, thành viên, phiên `cvv-doc-phien`; `ensureWorkspace` dựng lại tổ chức thì người dùng đầu tiên thành owner | `cua-vao-va` dọn phiên, thành viên, người dùng của mình |
| D — thứ tự hoà khoá | `l3-canh` | `docMucTieu` sắp `position, createdAt`, không khoá phân định; bộ mẫu cùng `createdAt` | Hỏi-2: (a) thêm `{ id: "asc" }` (mã sản phẩm) · (b) Known limits |
| E — chậm | `quyen-ban-ghi` (5000 ms) | Chưa rõ; lượt hai chậm 2,2 lần | Chạy lại đúng job một lần sau A–D, đo rồi mới quyết |
