# Dự án và Gantt — thiết kế

Hàng DA4 của `docs/plan/lo-trinh-viec-du-an.json`, slug `du-an-gantt`, hạng T3. Câu giao: «Tôi gom việc của một
đợt triển khai vào một dự án và xem trên sơ đồ Gantt có phụ thuộc và mốc». Chủ kho ký Cổng Đáng 16/10/2026
(build · ngưỡng giữ đề xuất · ngày nghỉ T7+CN, quản trị thêm ngày lễ) — `_acceptance/du-an-gantt/opportunity.md`.

Gantt mức đủ theo hàng: ngày bắt đầu và hạn, phụ thuộc xong-rồi-mới-bắt-đầu, tự dời, mốc, bỏ ngày nghỉ. Độ trễ,
đường găng, baseline, tải từng người là DA6, ngoài lượt này.

Câu chờ chủ kho ở Cổng Phạm vi: Hỏi-1 … Hỏi-7 (sổ quyết định). Bản này soạn theo lối máy khuyên ở cả bảy câu.

## Hôm nay

- `Viec` có `hanNgay` (ngày lịch Việt Nam lưu lúc 00:00Z), việc con một tầng, `ViecGan` gắn nhiều bản ghi, sổ
  `ViecVet` với `LOAI_VET_VIEC` và `NGUON_VIEC` (`packages/db/src/viec.ts:67-96`). Mọi lần ghi đi qua
  `@crm/db/viec-ghi` trong một giao dịch, khoá hàng bằng `docViecGhi` (`FOR UPDATE`).
- Quyền P3: router `viec` khai `PhamViDoiTacMiddleware`; `dieuKienXemViec` cho thấy việc có gắn bản ghi, hay
  việc mình trong cuộc (`viec.ts:306-315`). Vai «chỉ OKR» chưa dùng Việc (`CONTEXT.md` mục «Việc»).
- Sửa việc: chỉ người giao hay người thực hiện (`suaViec`, `viec-ghi.ts:322-364`); đổi hạn ghi vết `doi-han`
  rồi chiếu lên bước kế hoạch (`chieuLenBuoc`).
- Việc của tôi có hai kiểu xem Danh sách và Bảng (`viec-cua-toi.tsx`, nuqs `xemViec`), bảng dựng trên `Board`.
- Kho chưa có hàm ngày làm việc nào, chưa có lịch ngày nghỉ chung; chỉ có «khoảng nghỉ» riêng của chu kỳ OKR.
- `packages/ui` chưa có Gantt. `@reui/gantt` (miễn phí, tải được không cần khoá) có thanh, hàng con, mũi tên
  xong-rồi-mới-bắt-đầu (`dependencies`), mốc (sự kiện dài 0 vẽ hình thoi), tô ngày nghỉ (`offDays`), kéo và
  kéo mép, lối phím, `timeZone`, và cửa duyệt `onEventUpdate`/`canDropEvent`.
- Thông báo trong CRM (`ThongBao`) chỉ do tác tử ghi (`apps/agent/agent/lib/thong-bao-ghi.ts`).

## Hình dạng

Dự án là một bản ghi chứa Việc chung — không có loại việc riêng cho dự án (`da_bac` x2). Một việc nằm trong
nhiều nhất một dự án: dự án là *chỗ chứa*, không phải một bản ghi gắn. Lịch, phụ thuộc và mốc sống trong dự án.

### Bảng dữ liệu

- `DuAn`: `id`, `ten` (≤120), `moTa?` (≤4000), `taoBoiId`, `taoLuc`, `doiLuc`, `dongLuc?`, `dongBoiId?`. Không
  `organizationId` (`docs/api.md` mục Tenancy).
- `DuAnVet`: sổ của dự án — `tao`, `doi-noi-dung`, `them-viec`, `bot-viec`, `them-moc`, `sua-moc`, `xoa-moc`,
  `dong`, `mo-lai` — cùng khuôn `truoc`/`sau` parse bằng zod như `ViecVet`.
- `DuAnMoc`: `id`, `duAnId`, `ten` (≤120), `ngay` (ngày lịch Việt Nam lúc 00:00Z), `taoBoiId`, `taoLuc`.
  `DuAnMocCho`: (`mocId`, `viecId`) — việc phải xong trước mốc.
- `ViecPhuThuoc`: (`truocId`, `sauId`), duy nhất theo cặp, `taoBoiId`, `taoLuc`. Chỉ xong-rồi-mới-bắt-đầu.
- `Viec` thêm `duAnId?` (khoá ngoại `Restrict`, có chỉ mục) và `batDauNgay?` (cùng quy ước với `hanNgay`).
- `NgayNghi`: `ngay` (duy nhất), `ten` (≤80), `taoBoiId`, `taoLuc`. `AppSetting` thêm `ngayNghiTuan` — danh
  sách thứ trong tuần theo ISO (1 = Thứ Hai), mặc định `[6, 7]` khi trống.
- `migration` mang mốc UTC sau `migration` mới nhất trên onehub lúc gộp.

Hằng số chỉnh được sống ở một module: `DU_AN = { tenToiDa, moTaToiDa, viecToiDa: 300, mocToiDa: 50,
phuThuocToiDa: 600, ngayLeToiDa: 200 }` trong `@crm/db/du-an`.

### Một chỗ ghi

- `@crm/db/lich-lam-viec`: hàm thuần — `laNgayLam(ngay, lich)`, `ngayLamKe(ngay, lich)` (ngày làm việc đầu tiên
  SAU `ngay`), `congNgayLam(ngay, n, lich)`, `soNgayLam(tu, den, lich)` (đếm cả hai đầu). `lich` = thứ nghỉ trong
  tuần + tập ngày lễ. Tính theo ngày lịch Việt Nam, không theo giờ máy.
- `@crm/db/lich-viec`: hàm thuần `tinhDoi(doThi, thayDoi, lich)` → danh sách việc phải dời, theo thứ tự tô-pô.
  Luật «dời khi chồng» (Hỏi-1):
  - Việc sau S của việc trước T phải bắt đầu từ `ngayLamKe(T.han)` trở đi.
  - S bắt đầu sớm hơn mốc ấy → S dời tới đúng `ngayLamKe(T.han)` (lấy mốc muộn nhất nếu S chờ nhiều việc), giữ
    thời lượng tính bằng ngày làm việc: `S.han' = congNgayLam(S.batDau', soNgayLam(S.batDau, S.han) − 1)`.
  - Lan theo chuỗi; chỉ dời tới, không bao giờ kéo lùi. Việc đã Xong hay Huỷ không dời và không chặn.
  - Việc thiếu một trong hai ngày không tham gia phụ thuộc (lệnh tạo phụ thuộc đòi đủ hai ngày ở cả hai đầu).
- `@crm/db/du-an-ghi`: `taoDuAn`, `suaDuAn`, `dongDuAn`, `moLaiDuAn`, `xoaDuAn`, `taoMoc`, `suaMoc`, `xoaMoc`,
  `datMocCho`, `taoPhuThuoc`, `xoaPhuThuoc`. `@crm/db/viec-ghi` thêm `doiDuAn`, và `suaViec` nhận `batDauNgay`.
- Mọi lần đổi ngày (khung việc, kéo trên Gantt, tạo phụ thuộc) đi một đường: khoá các việc của dự án theo thứ tự
  `id`, áp thay đổi, chạy `tinhDoi`, ghi mọi lần dời trong cùng giao dịch. Mỗi việc đổi ghi đúng một vết cho mỗi
  ngày đổi (`doi-bat-dau`, `doi-han`), nguồn `gantt`, `web` hay `tu-doi`; vết `tu-doi` mang `boi` = việc trước
  gây dời. Việc gắn bước kế hoạch vẫn qua `chieuLenBuoc`.
- Người đặt ngày bắt đầu của S sớm hơn `ngayLamKe(T.han)` bằng tay → 400 «Việc này phải bắt đầu sau khi «T»
  xong (hạn dd/mm).» (Hỏi-5). Tạo phụ thuộc T → S khi S đang bắt đầu quá sớm thì S dời ngay theo luật trên.
- Luật tất định ở máy chủ, như luật deal thắng của DA3 — không có gì cho tác tử đoán.

### Quyền

- Router `duAn` khai `PhamViDoiTacMiddleware`: vai «chỉ OKR» không đọc dự án, không nhận việc trong dự án
  (`kiemNguoiNhanViec` coi việc trong dự án là việc phạm vi đối tác).
- Ai đọc được phạm vi đối tác thì thấy mọi dự án và mọi việc trong dự án (Hỏi-4): `dieuKienXemViec` thêm vế
  `duAnId` khác rỗng. Đưa một việc riêng vào dự án có một dòng nói trước «Mọi người xem được dự án sẽ thấy việc
  này».
- Sửa tên, mô tả, mốc, việc chờ mốc: mọi người đọc được dự án. Đóng, mở lại, xoá dự án: người tạo dự án và quản
  trị (Hỏi-2).
- Tạo việc trong dự án: mọi người đọc được dự án (họ là người giao). Đưa việc có sẵn vào hay ra dự án, đổi ngày,
  kéo thanh: người giao hay người thực hiện của việc đó — cùng luật `suaViec`.
- Tạo hay gỡ phụ thuộc T → S: người sửa được ngày của S (phụ thuộc ràng S). Tự dời chạy thay người đã đổi T kể
  cả khi họ không sửa được S, vì ràng buộc do người có quyền ở S đặt; vết ghi người đó và nguồn `tu-doi` (Hỏi-7).
- Thứ tự kiểm như Việc: 404, rồi 400, rồi 403, rồi vai «chỉ OKR»; riêng `duAn.xoa` kiểm quyền (403) trước lịch
  sử (409), để người không có quyền không biết dự án đã có lịch sử.

### API

- `duAn.list({ trangThai: "mo" | "dong" })`, `duAn.get`, `duAn.tao`, `duAn.sua`, `duAn.dong`, `duAn.moLai`,
  `duAn.xoa`.
- `duAn.lich({ id })` — một lần đọc cho Gantt: việc (có con), ngày, trạng thái, `suaDuoc`, phụ thuộc, mốc kèm
  `tre`, lịch làm việc của khoảng đang xem.
- `duAn.moc.tao | sua | xoa | datCho`, `duAn.phuThuoc.tao | xoa` — trả danh sách việc đã dời để màn báo «Đã dời
  n việc».
- `viec.sua` nhận `batDauNgay`; `viec.doiLich({ id, batDauNgay, hanNgay })` cho lần kéo thanh (hai ngày một
  lần ghi, nguồn `gantt`); `viec.doiDuAn({ id, duAnId | null })`; `viec.create` và `viec.bang` nhận `duAnId`.
- `lichLamViec.get` (phạm vi chung, mọi thành viên) và `lichLamViec.datNgayNghiTuan`, `themNgayLe`, `xoaNgayLe`
  (chủ hay quản trị, `canManageSettings`).
- Mỗi thủ tục mới vào danh sách làm mới của `useCrmCache()`; `src/generated/server.ts` sinh lại.

### Giao diện

- Thanh trái: mục «Dự án» ngay sau «Việc của tôi» (`khung-dieu-huong.ts`), ẩn với vai «chỉ OKR» qua
  `pham-vi-man.ts`.
- `/du-an`: `PageShell` «Dự án» + một câu mô tả; nút chính «Tạo dự án» (Dialog hai ô). Danh sách dự án đang mở:
  `SimpleTable surface="page"` từ `md`, `Item variant="outline"` dưới `md`; cột tên, tiến độ «x/y việc xong»,
  khoảng ngày (sớm nhất – muộn nhất), mốc kế và người tạo. «Đã đóng (n)» gập cuối danh sách.
- `/du-an/[id]`: tiêu đề là tên dự án, câu mô tả là mô tả của dự án hay «n việc · dd/mm – dd/mm». Nút chính
  «Thêm việc» (ô soạn việc của DA1, mặc định dự án này). Menu «…»: Sửa dự án · Thêm mốc · Đóng dự án · Xoá.
  `ViewSwitch` ba kiểu Gantt · Danh sách · Bảng, ghi lên đường dẫn `xemDuAn`, mặc định Gantt.
  - **Gantt**: hàng đầu «Mốc» chứa mọi mốc (hình thoi, nhãn tên, tô `error` khi trễ); mỗi việc một hàng, việc
    con thụt dưới cha; thanh từ ngày bắt đầu tới hết ngày hạn, màu theo nghĩa trạng thái (`toneTheoNghia`);
    mũi tên xong-rồi-mới-bắt-đầu; cột ngày nghỉ tô xám; vạch hôm nay. Việc thiếu ngày nằm ở nhóm «Chưa có lịch»
    cuối cây, mỗi hàng có nút «Đặt ngày». Thanh việc mình không sửa được thì không kéo được. Mặc định thang
    tuần; `GanttNav` đổi thang và về hôm nay.
  - **Danh sách**: `BangViec` lọc theo dự án, thêm cột Bắt đầu.
  - **Bảng**: `Board` của DA2 lọc theo dự án; thứ tự trong cột vẫn của riêng từng người.
- Khung việc: ô «Bắt đầu» cạnh «Hạn», ô «Dự án» (chọn hay bỏ), mục «Phải chờ» (chỉ khi việc ở trong dự án) liệt
  kê việc trước và nút «Thêm việc phải chờ» (chọn trong việc cùng dự án). Lịch sử đọc được vết `tu-doi`: «Hạn dời
  từ 23/10 sang 28/10 vì «Ký hợp đồng» dời».
- `/settings/lich-lam-viec` «Lịch làm việc», nhóm «Không gian làm việc», `width="page"`. Thẻ «Ngày nghỉ trong
  tuần» (bảy nút bật tắt, lưu ngay, toast có «Hoàn tác»); thẻ «Ngày lễ» (danh sách `Item` ngày + tên, nút xoá
  có `aria-label`; «Thêm ngày lễ» mở Dialog hai ô). Người không phải chủ hay quản trị: điều khiển khoá, một
  dòng «Không đủ quyền» dưới tiêu đề.

### Vòng đời — ba câu của `docs/vong-doi.md`

- **Gỡ thế nào**: dự án chưa có lịch sử thì Xoá (`ConfirmDialog`, không hoàn tác). Đã có lịch sử thì **Đóng ·
  Mở lại** — cùng chữ với kế hoạch 30 ngày, vì cả hai là một đợt có đầu có cuối. Đóng không đổi việc nào; còn
  việc mở thì hỏi lại một lần «Dự án còn n việc chưa xong. Vẫn đóng?» (`da_bac` x4). Dự án đã đóng chỉ đọc: không
  thêm việc, mốc, phụ thuộc; việc trong đó vẫn đổi trạng thái được như mọi việc.
- **Lịch sử là gì**: có ít nhất một dòng `DuAnVet` ngoài `tao` — thêm hay bớt việc, mốc, sửa nội dung, đóng. Kiểm
  ở máy chủ bằng `coLichSuDuAn`; xoá dự án có lịch sử → 409.
- **Danh sách mặc định**: dự án đang mở; «Đã đóng (n)» gập cuối. Gỡ việc khỏi dự án gỡ luôn phụ thuộc của nó
  (vết trên cả hai việc) và việc chờ mốc; việc không bị xoá hay đóng.
- Xoá việc (DA1, chỉ khi chưa có lịch sử) xoá phụ thuộc và việc chờ mốc của nó theo khoá ngoại.

### Đường đo

Thước `_acceptance/du-an-gantt/rang/do-nguong.mjs --tu <ngày> --den <ngày>`, chỉ đọc. In:

- `duAnDat`: số dự án tạo trong khoảng có ≥5 việc mang cả ngày bắt đầu lẫn hạn.
- `duAnDatDu`: trong số đó, số dự án có ≥1 phụ thuộc và ≥1 mốc.
- `nguoiTaoDat`: số người tạo khác nhau của các dự án `duAnDat`.
- `duAnCoPhuThuoc`: số dự án có ≥1 phụ thuộc.

Sống: `duAnDat ≥ 3`, `duAnDatDu ≥ 2`, `nguoiTaoDat ≥ 2`. Chết: `duAnDat < 2` hay `duAnCoPhuThuoc = 0`. Dữ liệu mẫu
không lên production, nên thước trên production không cần lọc (vế «bỏ dữ liệu mẫu» của Cổng Đáng; dòng sổ riêng). Dữ liệu mẫu (`bun run db:seed`) có một dự án
mẫu sáu việc, ba phụ thuộc, một mốc, một ngày lễ, tạo qua đường ghi thật; `rang/dap-an.json` khai đáp án.

## Ngoài lượt này

- Gantt nâng cao (DA6): độ trễ, đường găng, baseline, tải từng người; ba kiểu phụ thuộc khác.
- Chế độ dời «giữ khoảng cách» và «không dời» (Hỏi-1).
- Báo người thực hiện khi việc của họ bị tự dời — cần một đường ghi qua tác tử; lượt này chỉ có lịch sử việc.
- Dự án gắn công ty đối tác; khuôn dự án; nhân bản dự án.
- Ngày bắt đầu trong khuôn kế hoạch 30 ngày (lối thứ hai của DA3 mục 8); màn kế hoạch không hiện ngày bắt đầu.
- Nạp sẵn lịch lễ Việt Nam; lịch riêng từng người.
- Đếm dự án trong `install_daily` (đo lường gửi về).
- Kéo nối phụ thuộc trực tiếp trên Gantt; sửa mốc bằng kéo; kéo thanh tự bám ngày làm việc (Hỏi-6).

## Rủi ro

- `@reui/gantt` đè bảy tệp có sẵn của `packages/ui` nếu cài trần — cài theo `docs/reui.md` (không
  `--overwrite`, sửa năm chỗ, nhãn qua `messages.ts`). Nó kéo thêm `date-fns`, `@date-fns/tz`,
  `react-day-picker` và `context-menu`; `cn` phải thay bằng `@crm/ui/lib/utils`.
- Lan dời trong một dự án lớn: chặn ở `DU_AN.viecToiDa`, khoá hàng `DuAn` rồi các việc của dự án theo thứ tự `id`
  để hai lần dời cùng lúc chạy nối nhau, không khoá chéo (AC-7 đo hai lần đổi cùng lúc).
- Đổi lịch làm việc không dời việc đã có — chỉ lần ghi sau mới tính theo lịch mới; Gantt tô theo lịch mới ngay.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: thanh trái › «Dự án» → «Tạo dự án» (tên, mô tả) → trang dự án, kiểu Gantt rỗng → «Thêm việc» vài lần
  với ngày bắt đầu và hạn → khung việc B › «Thêm việc phải chờ» › A → Gantt vẽ mũi tên A → B → «Thêm mốc»
  «Go-live» 30/10, chọn việc phải xong trước → kéo thanh A trễ hai ngày → B dời theo, bỏ Thứ Bảy, Chủ nhật và
  ngày lễ, toast «Đã dời 1 việc»; mốc chuyển «Trễ» nếu B nay quá 30/10 (điểm ra: Gantt).
- Biên: dự án chưa có việc; việc thiếu ngày (nhóm «Chưa có lịch»); người không sửa được việc (thanh không kéo);
  phụ thuộc tạo vòng hay khác dự án (bị từ chối); dự án đã đóng (chỉ đọc); vai «chỉ OKR» (không có mục Dự án);
  màn 375 (Gantt cuộn ngang trong khung).
- Lỗi & quay lại: máy chủ từ chối lần kéo (đặt sớm hơn việc phải chờ, quyền vừa đổi) → thanh về chỗ cũ, toast đọc
  nguyên lời; tải hỏng → `VungTaiLoi` + «Thử lại»; tạo phụ thuộc hỏng → lỗi dưới ô chọn, việc không đổi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Dự án (danh sách) | chọn hay tạo một đợt triển khai | thanh trái / trang dự án |
| Dự án › Gantt | xếp lịch các việc của đợt và thấy hệ quả khi một việc trễ | danh sách dự án / khung việc |
| Dự án › Danh sách, Bảng | xem và đẩy việc của đợt như Việc của tôi | cùng trang, `ViewSwitch` |
| Khung việc › Bắt đầu, Dự án, Phải chờ | đặt lịch và ràng một việc | thanh Gantt, danh sách / Gantt |
| Cài đặt › Lịch làm việc | khai ngày nào công ty nghỉ | thanh cài đặt / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-du-an-ds-cho-tai | Dự án | tiêu đề giữ nguyên, khung xương năm hàng | chờ |
| ST-du-an-ds-loi | Dự án | `VungTaiLoi` «Không tải được danh sách dự án» + «Thử lại» | thử lại |
| ST-du-an-ds-rong | Dự án | `Empty` «Chưa có dự án» + «Tạo dự án» | tạo dự án |
| ST-du-an-ds-co | Dự án | bảng dự án đang mở, «Đã đóng (n)» gập | mở dự án |
| ST-du-an-tao | Dự án | Dialog «Tạo dự án»: tên (bắt buộc), mô tả | tạo, huỷ |
| ST-gantt-cho-tai | Dự án › Gantt | tiêu đề giữ nguyên, khung xương cây năm hàng và trục ngày | chờ |
| ST-gantt-loi | Dự án › Gantt | `VungTaiLoi` «Không tải được lịch dự án» + «Thử lại» | thử lại |
| ST-gantt-rong | Dự án › Gantt | `Empty` «Dự án chưa có việc» + «Thêm việc» | thêm việc |
| ST-gantt-co-lich | Dự án › Gantt | hàng Mốc, cây việc, thanh màu trạng thái, mũi tên, cột nghỉ xám, vạch hôm nay | kéo thanh, bấm thanh |
| ST-gantt-chua-lich | Dự án › Gantt | nhóm «Chưa có lịch (n)», mỗi hàng nút «Đặt ngày» | đặt ngày |
| ST-gantt-moc-tre | Dự án › Gantt | mốc tô `error`, chú giải «Trễ: «B» hạn 02/11» khi rê | dời việc, sửa mốc |
| ST-gantt-dang-keo | Dự án › Gantt | bóng thanh theo con trỏ, nhãn ngày mới | thả, Esc |
| ST-gantt-da-doi | Dự án › Gantt | thanh việc sau ở chỗ mới, toast «Đã dời n việc» | xem lịch sử |
| ST-gantt-tu-choi | Dự án › Gantt | thanh về chỗ cũ, toast lời máy chủ | đọc, sửa |
| ST-gantt-chi-xem | Dự án › Gantt | dự án đã đóng: dòng «Dự án đã đóng» dưới tiêu đề, thanh không kéo, không nút thêm | mở lại (người tạo, quản trị) |
| ST-gantt-dien-thoai | Dự án › Gantt (375) | ô chọn kiểu xem; Gantt cuộn ngang trong khung, cây thu hẹp | chuyển Danh sách |
| ST-du-an-hoi-dong | Dự án | `ConfirmDialog` «Dự án còn n việc chưa xong. Vẫn đóng?» | đồng ý, thôi |
| ST-du-an-moc | Dự án | Dialog «Thêm mốc»: tên, ngày, việc phải xong trước | lưu, huỷ |
| ST-khung-viec-lich | Khung việc | ô Bắt đầu, Hạn, Dự án; mục «Phải chờ (n)» | đổi ngày, thêm phụ thuộc |
| ST-khung-viec-phai-cho-loi | Khung việc | lỗi dưới ô chọn: «Phụ thuộc này tạo vòng: A → B → A.» | chọn việc khác |
| ST-lich-lam-viec | Cài đặt › Lịch làm việc | hai thẻ: ngày nghỉ trong tuần, ngày lễ | bật tắt, thêm, xoá |
| ST-lich-lam-viec-khong-quyen | Cài đặt › Lịch làm việc | điều khiển khoá, «Không đủ quyền» dưới tiêu đề | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên dự án và tên mốc bắt buộc, tối đa 120 ký tự; ngày bắt đầu không sau hạn (lời «Ngày bắt đầu phải trước hay
  trùng hạn.»).
- Thanh: kéo giữa thân dời cả hai ngày, kéo mép đổi một đầu; phím: Tab tới thanh, mũi tên trái phải dời một ngày,
  Shift+mũi tên đổi hạn, Enter lưu, Esc thôi — lời đọc màn hình tiếng Việt. Lần kéo chỉ gửi khi thả.
- Dữ liệu người nhập (tên dự án, tên việc, tên mốc, tên ngày lễ) mang `translate="no"`.
- Ngày hiện `dd/mm`, năm khi khác năm nay; số `tabular-nums`.
- Kiểu xem và thang Gantt nằm trên đường dẫn; F5 giữ nguyên.
- Chỉ animate `transform` và `opacity`; tôn trọng `prefers-reduced-motion`.
- Chuẩn `web-design-guidelines` của kho (`feature_loop.ui_standards_skill`): mọi cử chỉ kéo có lối bấm (khung
  việc đặt ngày) và lối phím; ngày định dạng bằng `Intl.DateTimeFormat` theo `vi-VN`, chặn lệch giữa máy chủ và
  trình duyệt; xoá ngày lễ không xoá ngay mà có toast «Hoàn tác»; nút chỉ có biểu tượng mang `aria-label`; toast
  lưu đọc qua `aria-live="polite"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `@reui/gantt` → `packages/ui/src/components/reui/gantt/` | ghép (cài bậc 3, sửa năm chỗ) | có sẵn thanh, mốc, phụ thuộc, ngày nghỉ, lối phím |
| `GanttDuAn` trong `packages/ui` | tạo | bọc ReUI theo token của kho: màu theo `toneTheoNghia`, nhãn tiếng Việt, tắt hộp chọn hàng và cuộn vô tận |
| `PageShell`, `ViewSwitch`, `SimpleTable`, `Item`, `Empty`, `VungTaiLoi`, `ConfirmDialog`, `Dialog`, `DatePicker`, `Combobox`, `StatusIndicator`, `ToggleGroup`, `Card` | dùng | bậc 1 |
| `Board`, `BangViec`, `OSoanViec`, `KhungViec` | mở rộng (tham số `duAnId`; ô Bắt đầu, Dự án, mục Phải chờ) | màn của DA1–DA2 |

Tra bậc 1: không có Gantt hay trục thời gian trong `packages/ui/src/components` (`timeline` của ReUI là dòng sự
kiện dọc). Bậc 2: shadcn gốc không có Gantt. Bậc 3: `@reui/gantt` có — dừng ở đây (`bun run ui:add @reui/gantt
--dry-run` từ `packages/ui`: 10 tệp mới, 7 tệp đè, 5 phụ thuộc).

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: danh sách dự án → trang một dự án có ba kiểu xem, như Asana, monday, ClickUp trong khảo sát
(`docs/plan/viec-du-an-nghien-cuu/04-quan-ly-cong-viec.md`, mẫu «Gantt mức đủ» và mục từng hãng); không có khuôn
thứ hai khả dĩ cho một bản ghi chứa nhiều việc, nên không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
