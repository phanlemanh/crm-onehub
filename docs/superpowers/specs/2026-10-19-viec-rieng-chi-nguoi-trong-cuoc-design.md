# DA11 · Việc riêng chỉ người trong cuộc thấy — thiết kế

Hồ sơ `_acceptance/viec-rieng-chi-nguoi-trong-cuoc/`. Gốc: `_acceptance/du-an-gantt/` (mục T1 của lượt tự lái 18/10).
Hạng T2. Chủ kho chọn nghĩa A ngày 19/10/2026: «A · đếm: có».

## Vấn đề

Khung việc ghi «Việc riêng — chỉ người trong cuộc thấy» cho mọi việc không gắn bản ghi
(`apps/app/components/viec/khung-viec.tsx:203`, `:337`). Nhưng luật thấy việc đã ký ở DA4
(`dieuKienXemViec`, vế `duAnId != null`) cho ai đọc được phạm vi đối tác thấy mọi việc trong dự án. Một việc trong
dự án mà không gắn bản ghi bị khung hứa sai: cả đội thấy nó trên Gantt.

Bản quét đường đọc ngày 19/10 thấy thêm một chỗ lộ thật. `viec.lichSu` chỉ kiểm quyền trên việc đang mở, rồi trả
nguyên văn các vết nhắc việc khác:

- `them-phu-thuoc`, `go-phu-thuoc`;
- `doi-han` và `doi-bat-dau` khi mang `boi` (tự dời «vì «V» dời»);
- `them-viec-con`.

Rút V khỏi dự án thì V thành việc riêng, nhưng tiêu đề và mã V vẫn nằm trong lịch sử các việc còn trong dự án. Lỗi
này cùng họ với DA2b (`viec-cha-khong-lo-tieu-de`).

## Lối đã chọn (A)

1. **Việc trong dự án là việc chung.** Việc riêng là việc không gắn bản ghi và không thuộc dự án — đúng ý 1 của P3
   trong `docs/plan/viec-du-an-nghien-cuu/05-phan-quyen-va-muc-tieu.md`. Luật thấy việc giữ nguyên.
   `packages/db/src/viec.ts` không đổi.
2. **Máy chủ nói ai thấy việc.** `viec.get` trả thêm `aiThay`, một trong ba giá trị:
   - `rieng`: không gắn bản ghi, không dự án;
   - `du-an`: trong dự án, không gắn bản ghi;
   - `ban-ghi`: gắn ít nhất một bản ghi.

   Giá trị tính ở `apps/api/src/viec/viec.service.ts` từ chính hàng việc. Khung việc là thành phần khách, nên chỉ vẽ
   theo `aiThay`, không tự suy (AGENTS.md: «It never derives it.»).
3. **Chữ trên khung:**
   - `rieng`: giữ «Việc riêng — chỉ người trong cuộc thấy».
   - `du-an`: ô «Gắn với» ghi «Việc trong dự án — mọi người xem được dự án đều thấy việc này»; dòng dưới tiêu đề khung
     ghi tên dự án. Câu dựa trên lời báo trước mà DA4 đã ký: «Mọi người xem được dự án sẽ thấy việc này».
   - `ban-ghi`: như cũ, tên bản ghi.
4. **Lịch sử che việc người xem không thấy.**
   - `viec.lichSu` gom mọi mã việc mà các vết nhắc tới, rồi đọc một lần bằng `dieuKienXemViec` của người xem.
   - Mã nào không đọc được (kể cả việc đã xoá) thì vết ra ngoài mang `viec: null` thay cho `{id, tieuDe}`. Phản hồi
     không còn tiêu đề hay mã của việc đó.
   - Khung lịch sử ghi «một việc bạn không có quyền xem», đúng ý 3 của P3.
   - Vết lưu trong cơ sở dữ liệu không đổi: người trong cuộc vẫn thấy đủ.
   - Lược đồ ra ngoài sống ở `apps/api/src/viec/viec.contracts.ts`, là phép chiếu của `vetViec`: chỉ bốn vết có trường
     nhắc việc khác được nới thành `nullable` (`viec` của hai vết phụ thuộc, `boi` của hai vết tự dời, `sau` của
     `them-viec-con`).
5. **Màn dự án:** không đổi mã. Một bài kiểm giữ cho việc vừa rút khỏi dự án không còn trong Gantt, Danh sách, Bảng,
   Tất cả dự án và các con số tổng.
6. **Lệnh đếm production** `bun run viec:dem-rieng`, nằm ở `packages/db/scripts/dem-viec-rieng.ts`.
   - Đọc `DATABASE_URL` và chạy trong một giao dịch `READ ONLY`.
   - In JSON gồm ba số:
     - `viecDuAnKhongGan`: số khung đã hứa sai;
     - `vetNhacViecRieng`: số dòng lịch sử đang giữ tiêu đề của một việc nay là riêng, trên việc mà người ngoài cuộc đọc được;
     - `viecRiengBiNhac`: số việc riêng bị nhắc như vậy.
   - Chủ kho tự chạy trên production. Máy không vào production.
7. **Từ điển:** `CONTEXT.md` mục «Việc» sửa câu «việc không gắn gì là việc riêng» thành «việc không gắn bản ghi
   và không thuộc dự án là việc riêng». `docs/api.md` mục «Việc» thêm `aiThay` và luật che trong lịch sử.

Lối đã bỏ:

- **B (lọc màn dự án theo người xem):** chủ kho bỏ ngày 19/10.
- **Sửa vết đã lưu:** người trong cuộc mất lịch sử, và không đảo được.
- **Khung tự suy từ `banGhi` + `duAn`:** trái luật thành phần khách của AGENTS.md, và để hai nơi giữ cùng một luật.
- **Đặt luật che vào `packages/db/src/viec.ts`:** tệp T3. DA2b đã đặt phép che tiêu đề cha ở `apps/api/src/viec`
  (`viec-bang.service.ts`, `chaThay`), lượt này theo đúng nếp đó.

## Tệp dự kiến chạm

- `apps/api/src/viec/viec.service.ts`, `viec.contracts.ts`
- `apps/app/components/viec/khung-viec.tsx`, `lich-su-viec.tsx`, `apps/app/lib/messages/viec.ts`
- `packages/db/scripts/dem-viec-rieng.ts`, `packages/db/package.json`
- `CONTEXT.md`, `docs/api.md`
- Bài kiểm: `apps/api/test/viec-rieng-trong-cuoc.spec.ts`, `apps/app/test/viec-rieng-trong-cuoc.dom.tsx`,
  `packages/db/test/dem-viec-rieng.spec.ts`
- Răng: `_acceptance/viec-rieng-chi-nguoi-trong-cuoc/rang/man.mjs`
- `_acceptance/config.yaml`: khai các lệnh eval `vrc_*`.

Không chạm `packages/db/src/viec.ts` hay `packages/db/prisma`, nên lượt này là T2. Nếu S3 buộc phải chạm `viec.ts`
thì nâng hạng và dừng ở cổng duyệt kế hoạch.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Việc › mở một việc → khung việc → ô «Gắn với» và dòng dưới tiêu đề nói đúng ai thấy việc; thẻ «Lịch sử» liệt
  kê vết (điểm ra: đóng khung).
- Biên:
  - việc trong dự án mà không gắn bản ghi;
  - việc vừa rút khỏi dự án;
  - người theo dõi việc cha riêng xem lịch sử có việc con họ không xem được;
  - việc được nhắc đã bị xoá.
- Lỗi & quay lại: lịch sử tải hỏng → `VungTaiLoi` «Không tải được lịch sử» với nút thử lại (đã có).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung việc › Chi tiết | Nói việc là gì, ai làm, và ai thấy nó | từ mọi danh sách việc, Gantt, khối Việc của bản ghi / đóng khung |
| Khung việc › Lịch sử | Kể việc đã đổi thế nào mà không kể về việc người xem không thấy | thẻ Lịch sử của khung / thẻ Chi tiết |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-khung-rieng | Khung › Chi tiết | «Gắn với»: «Việc riêng — chỉ người trong cuộc thấy»; dòng dưới tiêu đề cùng chữ | gắn bản ghi hay chọn dự án |
| ST-khung-du-an | Khung › Chi tiết | «Gắn với»: «Việc trong dự án — mọi người xem được dự án đều thấy việc này»; dòng dưới tiêu đề: tên dự án | đọc, sửa như thường |
| ST-khung-ban-ghi | Khung › Chi tiết | «Gắn với»: liên kết tên bản ghi (như cũ) | bấm sang bản ghi |
| ST-lich-su-khuat | Khung › Lịch sử | vết nhắc việc người xem không thấy ghi «một việc bạn không có quyền xem» thay tiêu đề, phần còn lại của dòng giữ nguyên | đọc tiếp |
| ST-lich-su-day-du | Khung › Lịch sử | người trong cuộc thấy tiêu đề như cũ | đọc tiếp |
| ST-lich-su-cho-tai | Khung › Lịch sử | khung xương (đã có) | chờ |
| ST-lich-su-loi | Khung › Lịch sử | `VungTaiLoi` «Không tải được lịch sử» + Thử lại (đã có) | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Đổi dự án trong khung (chọn hay bỏ dự án) → khung đọc lại `viec.get` sau khi lưu, chữ «Gắn với» đổi theo `aiThay`
  mà không phải đóng mở lại khung.
- Khổ 375: chữ «Gắn với» xuống dòng trong ô, không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheetProperty` | dùng | ô «Gắn với» đã có, chỉ đổi chữ |
| `Item` (lịch sử) | dùng | dòng vết đã có, chỉ đổi chuỗi điền |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: khung việc là ngăn chi tiết mở từ danh sách việc; lượt này chỉ đổi chữ trong ngăn, không thêm màn hay luồng.
<!-- UX-SPEC-TEMPLATE>>> -->
