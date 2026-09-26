# Số OKR tự chảy — thiết kế

Lượt 6 lộ trình OKR (`docs/plan/lo-trinh-okr.md` mục 5). Hồ sơ nghiệm thu:
`_acceptance/so-okr-tu-chay/`. Hạng T3: hai bảng mới ở cuối `schema.prisma`, một
việc mới trên nhịp dispatch của tác tử.

## 1. Việc lượt này giao

«Số của KR tự chảy từ CRM, bấm vào là ra bản ghi.» Cụ thể:

- Một **danh mục bảy chỉ số** trong mã, định nghĩa cố định (không trình dựng truy
  vấn — NG-04). Mỗi chỉ số khai đơn vị, cột ngày quyết định kỳ, cách quy công, loại
  bản ghi đằng sau, các phạm vi nhận.
- KR chọn **nguồn**: tay (như hôm nay) · chỉ số CRM · khoá API · Google Sheets.
- Tác tử **chụp mỗi ngày** số của mọi KR nguồn máy thành một dòng lịch sử chỉ thêm.
- **Bấm vào con số** mở danh sách bản ghi làm nên nó, chọn được ngày trong lịch sử.
- Máy khác **ghi số bằng khoá API**; tác tử **đọc ô Google Sheets** mỗi ngày.

Không làm: tiền, giai đoạn thoả thuận, truy vấn tự do, máy chọn mức tự tin, kỳ đo
riêng, ghi ngược bảng tính (hợp đồng mục Out of scope).

## 2. Danh mục chỉ số

`packages/validation/src/okr-chi-so.ts` — khuôn `CRM_EVENT_CATALOG`: một đối tượng
`CHI_SO_OKR` `as const satisfies Record<string, DinhNghiaChiSo>`, khoá suy ra
`MA_CHI_SO`. Mục chỉ mang dữ kiện cấu trúc; chữ hiện trên màn nằm ở
`apps/app/lib/messages/okr-so.ts` (vi, en).

| Mã | Đếm gì | Ngày quyết định kỳ | Quy công (người) | Bản ghi | Phạm vi |
|---|---|---|---|---|---|
| `thoa-thuan-chot-duoc` | thoả thuận `stage = CLOSED_WON` chưa lưu trữ | `closedAt` | người phụ trách thoả thuận | thoả thuận | toàn công ty · bộ phận · phòng ban · người |
| `thoa-thuan-moi` | thoả thuận chưa lưu trữ | `createdAt` | người phụ trách thoả thuận | thoả thuận | như trên |
| `goi-hen-duoc` | cuộc gọi chiến dịch `outcome = MEETING` | `createdAt` của cuộc gọi | người ghi cuộc gọi | cá nhân (kèm tên chiến dịch) | như trên |
| `buoc-xong-dung-han` | bước kế hoạch 30 ngày `completedAt ≤ dueAt` | `completedAt` | theo phòng ban: phòng ban của bước; theo người: người được giao | kế hoạch 30 ngày | như trên |
| `ghi-danh-dat-bac` | ghi danh có ngày đạt bậc đã chọn | cột ngày của bậc (`accountAt` · `courseAt` · `activeAt` · `dealAt`) | người cầm trịch kế hoạch | cá nhân | như trên; tham số bắt buộc `bac` |
| `form-thanh-ca-nhan` | form đã xếp vào một cá nhân (`contactId` có, `filedAt` có), cá nhân chưa lưu trữ | `filedAt` | người phụ trách cá nhân | cá nhân | như trên (form của cá nhân chưa có phụ trách chỉ vào toàn công ty) |
| `email-gui-ra` | thư có `fromEmail` trùng email một thành viên (không phân biệt hoa thường) | `sentAt` | thành viên đó | thư (liên kết cá nhân của luồng thư nếu có) | như trên |

**Phạm vi** (`PhamViChiSo`, khuôn Zod hợp): `{ kieu: "toan-cong-ty" }` ·
`{ kieu: "bo-phan", id }` · `{ kieu: "phong-ban", id }` · `{ kieu: "nguoi", id }`.
Theo phòng ban/bộ phận = người được quy công có **phòng ban chính** (`OrgPlacement`)
thuộc đơn vị đó **tại lúc đếm**; riêng `buoc-xong-dung-han` đọc phòng ban của bước.

**Kỳ đo** = chu kỳ của mục tiêu chứa KR: đếm các bản ghi có ngày quyết định kỳ trong
`[startsOn 00:00, cuối ngày chụp]` giờ Việt Nam, bị chặn trên bởi `endsOn`. Số cộng
dồn từ đầu kỳ.

**Một hàm dựng điều kiện, hai người dùng.** `packages/db/src/okr-chi-so.ts` có
`dieuKienChiSo(chiSo, phamVi, khoang)` trả `where` Prisma theo từng bảng;
`demChiSo` đếm bằng nó, `banGhiChiSo` liệt kê bằng nó. Tác tử (chụp) và API (bấm
vào số, xem trước) gọi cùng hai hàm, nên con số và danh sách không thể lệch định
nghĩa. Hằng số chỉnh được (trần danh sách, cỡ trang, giờ, trần KR mỗi lượt) ở
`OKR_SO` (`packages/db/src/okr-so-config.ts`), đơn vị thời gian suy từ một gốc.

## 3. Dữ liệu — hai bảng mới, khối liền cuối `schema.prisma`

`OkrNguonKr` — cấu hình nguồn máy của một KR (một dòng mỗi KR, sửa được):
`keyResultId @unique` · `loai` (`crm` · `api` · `bang-tinh`) · `chiSo?` ·
`phamVi Json?` (khuôn `PhamViChiSo`) · `bac?` · `sheetId?` · `sheetO?` (A1, có tên
trang) · `docLuc?` · `docGiaTri Decimal?` · `docLoi?` · `thuLuc?` · `taoBoiUserId`
· `createdAt` · `updatedAt`. Parse ở biên bằng `@crm/validation/okr-nguon`.

`OkrSoChup` — lịch sử chỉ thêm: `id` · `keyResultId` · `ngay DATE` (ngày VN mà số
đúng tới hết ngày đó) · `giaTri Decimal(18,4)` · `nguon` · `chiSo?` · `phamVi Json?`
· `bac?` (chép định nghĩa lúc chụp, để lịch sử tự mô tả) · `tacGiaUserId?` (khoá
API) · `chupLuc` · chỉ mục `[keyResultId, ngay]`. Khoá ngoại tới KR là
`ON DELETE RESTRICT`: không đường xoá nào (kể cả lan từ mục tiêu) mang lịch sử đi. **Chỉ mục duy nhất một phần**
`(keyResultId, ngay) WHERE nguon IN ('crm','bang-tinh')` — một KR một ngày một
dòng máy; dòng `api` nhiều dòng một ngày được, số của ngày là dòng mới nhất.
Không thủ tục nào sửa hay xoá bảng này; `soi-ma` chặn `okrSoChup.update*` /
`delete*` ngoài bài kiểm.

Cột có sẵn `okrKeyResult.source` (`tay` · `crm` · `api`, lượt 3) là **nguồn hiệu
lực** — nguồn lái `currentValue` và tiến độ. Thêm giá trị `bang-tinh` vào
`NGUON_KR` (khuôn Zod, không `migration`). `migration` chỉ `CREATE TABLE`,
`CREATE INDEX`, khoá ngoại mới.

## 4. Luật nguồn

- **Mục tiêu còn nháp:** đặt hay đổi nguồn có hiệu lực ngay — `source := loai`,
  dòng `OkrNguonKr` ghi đè.
- **Mục tiêu đã công bố:** nguồn hiệu lực **khoá khi công bố**, như khởi điểm.
  KR tay được **thêm số đo cạnh** (`OkrNguonKr` mới, `source` giữ `tay`): máy chụp
  và hiện cạnh số tay tới hết kỳ, tiến độ vẫn theo số tay. Đổi hay gỡ nguồn của KR
  máy đã công bố bị từ chối với câu ghim. Kỳ sau đặt KR mới với nguồn máy.
- **KR đo cạnh trong cập nhật tuần:** ô giá trị **điền sẵn số máy mới nhất**, người
  sửa được, kèm «Số máy: 15 · 25/10». Người chấp nhận số máy là người thôi đếm tay
  — đây là cách KR quý 4 (công bố từ 26/10, trước khi lượt này lên) dùng được số
  máy mà tiến độ không đổi định nghĩa giữa kỳ.
- Mọi lần đặt, đổi, gỡ để **một dòng vết** `doi-nguon` với trước → sau.
- Khoá theo pha: như mười một thủ tục ghi, thêm `datNguonKr` và `ghiSoKr`.
- `updateKeyResult` từ chối đổi `currentValue` của KR nguồn máy ở mọi pha.
- `removeKeyResult` từ chối KR đã có bản chụp.

## 5. Chụp mỗi ngày — tác tử

`chupSoOkr(now)` (`apps/agent/agent/lib/okr-chup.ts`) chạy trên nhịp dispatch cạnh
`lenLichNhac` — không lịch mới. Mỗi nhịp:

1. `ngay` = hôm qua theo giờ VN. Chọn KR có `OkrNguonKr` loại `crm` hoặc
   `bang-tinh`, mục tiêu không «đã bỏ», chu kỳ ở pha ghi được, `ngay` trong
   `[startsOn, endsOn]`, và **chưa có dòng máy cho `ngay`**. Không còn KR nào thì
   dừng — nhịp thường là một câu truy vấn.
2. `crm`: `demChiSo` cho khoảng `[startsOn, ngay]`. `bang-tinh`: đọc ô (mục 7);
   lỗi thì ghi `docLoi`, `thuLuc` và bỏ qua KR tới khi qua `OKR_SO.sheets.thuLaiMs`.
3. Ghi `OkrSoChup` bằng `createMany … skipDuplicates`; KR có `source` bằng loại
   nguồn thì cập nhật `currentValue` trong cùng giao dịch. KR đo cạnh không đụng
   `currentValue`.
4. Tối đa `OKR_SO.chup.toiDaMoiNhip` KR và `OKR_SO.sheets.toiDaMoiNhip` lần đọc
   Sheets một nhịp, mỗi lần đọc có trần `OKR_SO.sheets.tranMs`; phần còn lại nhịp
   sau. Cả lượt chụp phải xong dưới 60 giây kể cả khi Google treo, để nhắc buổi sáng
   và hàng việc cùng nhịp không bị trễ (trần sweep của dispatch là 4 phút).

Không dòng vết mỗi ngày: bảng chụp chính là vết của số máy. Ngày đã khép không
bao giờ chụp lại, nên lưu trữ bản ghi, mở lại thoả thuận, đổi tiền tệ báo cáo hay
chuyển người sang phòng khác không đổi số đã chụp; KR của chu kỳ đã qua `endsOn`
hoặc pha khoá thì `currentValue` đứng yên.

## 6. Khoá API

`okr.ghiSoKr` — `POST /rest/okr/key-results/{id}/value`, gọi bằng `x-api-key`
(khoá của một thành viên — `enableSessionForAPIKeys`). Vào: `giaTri`, `ghiChu?`.
Quyền: `OkrAccessService.canEditKr` của chủ khoá. Từ chối: KR không có nguồn `api`
(câu ghim), giá trị không hợp kiểu (`kiemSoTheoKieu`), pha khoá, ngày ngoài kỳ.
Từ chối cả khi hôm nay (giờ VN) đã qua `endsOn` dù pha chưa chuyển.
Ghi một `OkrSoChup` (`nguon: api`, `tacGiaUserId`), cập nhật `currentValue` khi
`source = api`, một dòng vết `ghi-so-api`. Vai «chỉ OKR» gọi được (phạm vi OKR).

## 7. Google Sheets — tác tử

Tài khoản dịch vụ chỉ đọc (giả định 8 của hồ sơ cơ hội): hai biến tuỳ chọn
`GOOGLE_SHEETS_EMAIL` và `GOOGLE_SHEETS_KHOA` trong `.env` gốc, khai ở
`.env.example`; API khai trong `env.validation.ts` và chỉ đọc email để hiện «chia
sẻ bảng tính cho …» và biết nguồn có bật không. Thiếu một trong hai → nguồn Sheets
không hiện, tác tử không gọi Google, không gì ném (`capabilities.ts`).

`apps/agent/agent/lib/okr-sheets.ts`: ký JWT RS256 bằng Web Crypto, đổi lấy token
ở `oauth2.googleapis.com/token` (phạm vi `spreadsheets.readonly`), đọc
`values/<ô>?valueRenderOption=UNFORMATTED_VALUE` qua `@crm/db/safe-fetch`, hai lần
thử, trần thời gian. Kết quả: số, hoặc một nguyên nhân có tên — `chua-chia-se`
(403), `khong-thay` (404), `khong-phai-so`, `o-trong`, `google-loi`. Không ghi log
giá trị ô hay đường dẫn đầy đủ.

**Đọc thử:** `datNguonKr` loại `bang-tinh` (và nút «Đọc lại») làm API ghi một hàng
`AgentTask` loại `okr-doc-sheet` (làn trực tiếp, không mô hình) rồi `poke()`; tác tử
đọc ô, ghi `docLuc/docGiaTri/docLoi` — không ghi lịch sử. Hộp thoại hỏi lại mỗi vài
giây khi đang chờ. API không gọi Google.

## 8. Đọc — API

- `okr.chiSo` — danh mục + phạm vi hợp lệ + `sheetsBat` + email tài khoản dịch vụ.
- `okr.xemTruocChiSo({ chiSo, phamVi, bac?, cycleId })` — số đếm tới lúc này (không
  ghi gì) cho hộp thoại.
- `okr.lichSuSo({ keyResultId })` — các dòng chụp theo ngày, mới trước.
- `okr.banGhiChiSo({ keyResultId, ngay?, trang })` — **định nghĩa để tính lại là bản
  chép trong dòng chụp của ngày đó** (`chiSo`, `phamVi`, `bac`), không phải
  `OkrNguonKr` hiện tại; không có dòng chụp (KR mới) thì dùng cấu hình hiện tại.
  Trả định nghĩa, khoảng ngày, số đã
  chụp của `ngay` (mặc định ngày mới nhất), số tính lại lúc bấm cho cùng khoảng,
  cờ `lech`, và một trang bản ghi (`OKR_SO.banGhi.coTrang`) mỗi dòng mang
  `{ loai, id, ten, ngay }` để mở bản ghi trong ngăn chồng. **Vai «chỉ OKR» nhận
  403** với câu ghim (dữ liệu đối tác); ba vai kia đọc được.
- `okr.objective` thêm vào mỗi KR `nguon`, `soMay` (dòng chụp mới nhất khi có
  `OkrNguonKr`) và `doCanh` (có nguồn máy mà `source = tay`).
- `okr.capNhatTuan` thêm `nguon` mỗi KR.

## 9. Cập nhật tuần với KR máy

`guiCapNhat` với KR `source ≠ tay` (crm, api, bang-tinh — cả ba): bỏ giá trị người gửi, ghi `OkrCheckIn.value`
bằng `currentValue` máy hiện hành, không đụng `currentValue`; mức tự tin và ghi chú
vẫn bắt buộc như cũ (từ điển «Cập nhật tuần»: số tự chảy không phải cập nhật tuần).
Màn khoá ô giá trị và ghi «Số từ CRM · 25/10» (hoặc API, Sheets). KR đo cạnh: ô
điền sẵn số máy, sửa được (mục 4).

## 10. Đường đo

- `_acceptance/so-okr-tu-chay/rang/ty-le-kr-co-nguon.sql` — trên KR đã công bố của
  các bộ phận truyền vào (`SET okr.bo_phan = '<id>,<id>'`) trong chu kỳ quý đang xét,
  trả ba cột tách riêng: tỷ lệ KR nguồn hiệu lực CRM (`source = 'crm'`), tỷ lệ KR đo
  cạnh CRM (`source = 'tay'` có `OkrNguonKr.loai = 'crm'`), và trong các lần cập nhật
  tuần của KR đo cạnh sau bản chụp đầu, tỷ lệ lần mà giá trị bằng số máy của ngày
  trước đó (người nhận số máy = thôi đếm tay). Ngưỡng 50%/20% so với tổng hai cột
  đầu; cột ba là căn cứ đọc «có thôi đếm tay không».
- `_acceptance/so-okr-tu-chay/rang/tin-so.mjs` — năm chỉ số (`thoa-thuan-chot-duoc`,
  `thoa-thuan-moi`, `goi-hen-duoc`, `buoc-xong-dung-han`, `email-gui-ra`) tính bằng
  `demChiSo` và bằng SQL đếm độc lập viết riêng trong `rang/dem-doc-lap.sql` (không
  nhập mã danh mục), so với bảng lệch khai trước `rang/lech-khai-truoc.md`. S4 chạy
  trên kho đo; production chạy chỉ đọc sau triển khai, số đếm tay của người ghi vào
  cùng bảng.

## 11. Thứ tự nhịp và tệp chung

Lượt này chạm tệp OKR đang có (`okr.service.ts`, `okr-cap-nhat.service.ts`,
`okr.router.ts`, `okr.contracts.ts`, `bang-kr.tsx`, `hop-thoai-kr.tsx`,
`objective-sheet.tsx`, màn cập nhật tuần). Vòng «Nợ sau lượt 5 OKR» đang sửa khu
`apps/app` OKR và gộp trước; S3 bắt đầu sau khi gộp lại `origin/onehub`. Mã mới ở
tệp riêng; tệp cũ chỉ nối thêm.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: sheet mục tiêu › «Thêm KR» → ô «Nguồn số» chọn «Chỉ số CRM» → chọn chỉ số, phạm vi (mặc định đơn vị của mục tiêu) → dòng «Tới hôm nay: 12 thoả thuận» → Lưu → bảng KR hiện dấu «CRM» cạnh số; sáng hôm sau số là số máy; bấm số → ngăn «Số của KR» chồng lên sheet mục tiêu (danh sách bản ghi, lịch sử theo ngày) → bấm một thoả thuận → sheet thoả thuận chồng tiếp, «Quay lại» về ngăn số.
- Biên: KR của mục tiêu đã công bố → ô nguồn khoá, nút «Thêm số đo cạnh» (chỉ KR tay); vai «chỉ OKR» thấy số không bấm được; chỉ số chưa có bản ghi nào trong kỳ; nguồn Sheets chưa cắm khoá → lựa chọn không có, một dòng nói quản trị chưa cắm; KR nguồn API → hộp thoại hiện mã KR để chép và lệnh mẫu.
- Lỗi & quay lại: Sheets đọc thử hỏng → dòng trạng thái gọi tên nguyên nhân («Bảng tính chưa chia sẻ cho …») + «Đọc lại»; xem trước lỗi → «Thử lại» trong ô; ngăn số lỗi → `Empty` có «Thử lại»; lưu nguồn bị từ chối → `FieldError` với câu máy chủ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp thoại KR › Nguồn số | chọn con số của KR đến từ đâu | nút «Thêm KR»/«Sửa KR» của sheet mục tiêu / về sheet |
| Bảng KR (sheet mục tiêu, Theo đơn vị) | cho thấy số đến từ đâu và mở nó | — / ngăn «Số của KR» |
| Ngăn «Số của KR» (`?record=so-kr:<id>`) | cho thấy bản ghi làm nên con số của một ngày | số trong bảng KR / sheet bản ghi |
| Cập nhật tuần của tôi (dòng KR máy) | ghi mức tự tin và ghi chú cho số máy | nhắc, thẻ việc / gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hopthoai-nguon-tay | Hộp thoại KR | ô «Nguồn số» = «Nhập tay» (mặc định), không thêm ô | lưu như cũ |
| ST-hopthoai-nguon-crm | Hộp thoại KR | ô chỉ số, ô phạm vi, ô bậc (chỉ khi «ghi danh đạt bậc»), `FieldDescription` định nghĩa một dòng | chọn rồi lưu |
| ST-hopthoai-xemtruoc-dangtai | Hộp thoại KR | «Đang đếm…» trong dòng xem trước | chờ |
| ST-hopthoai-xemtruoc-co | Hộp thoại KR | «Tới hôm nay: 12 thoả thuận» | lưu |
| ST-hopthoai-xemtruoc-loi | Hộp thoại KR | «Không đếm được» + «Thử lại» | thử lại |
| ST-hopthoai-nguon-api | Hộp thoại KR | mã KR có nút chép, lệnh mẫu một dòng, liên kết Cài đặt › Khoá API | chép mã |
| ST-hopthoai-nguon-sheets | Hộp thoại KR | ô đường dẫn, ô «Ô» (vd `Tổng!B2`), dòng «Chia sẻ bảng tính cho <email>» có nút chép | lưu |
| ST-hopthoai-sheets-dangdoc | Hộp thoại KR | «Đang đọc thử…» | chờ |
| ST-hopthoai-sheets-doc-duoc | Hộp thoại KR | «Đọc được 1.240 lúc 09:12» | xong |
| ST-hopthoai-sheets-loi | Hộp thoại KR | nguyên nhân có tên + «Đọc lại» | sửa chia sẻ, đọc lại |
| ST-hopthoai-sheets-tat | Hộp thoại KR | không có lựa chọn Sheets; một dòng «Quản trị chưa cắm khoá Google Sheets» | chọn nguồn khác |
| ST-hopthoai-khoa | Hộp thoại KR | ô nguồn khoá, chú thích «nguồn khoá khi công bố»; KR tay có «Thêm số đo cạnh» | thêm đo cạnh hoặc đóng |
| ST-bangkr-dau-nguon | Bảng KR | dấu «CRM» · «API» · «Sheets» cạnh số | bấm số |
| ST-bangkr-do-canh | Bảng KR | «12 tay · 15 máy» | bấm số máy |
| ST-bangkr-chua-chup | Bảng KR | số tay cũ + «Số máy: sáng mai» | chờ |
| ST-bangkr-chi-okr | Bảng KR | số không phải nút, chú thích khi rê | — |
| ST-so-dangtai | Ngăn số | khung xương | chờ |
| ST-so-co | Ngăn số | đầu ngăn: tên chỉ số, phạm vi, khoảng ngày, số đã chụp; bảng bản ghi; bảng lịch sử | bấm bản ghi hay ngày |
| ST-so-rong | Ngăn số | «Chưa có thoả thuận nào chốt được trong kỳ» (theo chỉ số) | — |
| ST-so-lech | Ngăn số | «Đã chụp 15 · tính lại lúc này 14 — dữ liệu đã đổi sau khi chụp» | đọc danh sách hiện tại |
| ST-so-loi | Ngăn số | `Empty` + «Thử lại» | thử lại |
| ST-so-api | Ngăn số | không danh sách bản ghi; bảng các lần ghi (ngày, số, người cầm khoá) | — |
| ST-capnhat-may | Cập nhật tuần | ô giá trị khoá, «Số từ CRM · 25/10» | chọn mức tự tin, ghi chú |
| ST-capnhat-do-canh | Cập nhật tuần | ô giá trị điền sẵn số máy, sửa được, «Số máy: 15 · 25/10» | giữ hoặc sửa số, chọn mức tự tin |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô phạm vi: bốn lựa chọn; chọn bộ phận/phòng ban/người mở `Combobox` tìm theo tên; mặc định là đơn vị của mục tiêu (mục tiêu cá nhân → người đó).
- Ô «Ô» của Sheets: `Trang!A1` hoặc `A1`; sai khuôn báo ngay dưới ô; đường dẫn phải là `docs.google.com/spreadsheets/d/<id>`.
- Xem trước gọi lại khi đổi chỉ số, phạm vi hay bậc (không gõ phím nào gọi máy chủ).
- Ngăn số: lịch sử tối đa theo kỳ; chọn một ngày đổi danh sách và URL (`ngaySo`); trang bản ghi 50 dòng với «Xem thêm».
- Tên chỉ số, tên đơn vị, tên người, tên bản ghi mang `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Field`, `Select`, `Combobox`, `FieldDescription`, `FieldError` | dùng | ô của hộp thoại KR đã dùng chúng |
| `ToggleGroup` | dùng | bốn nguồn loại trừ nhau, nhìn thấy cả bốn |
| `CopyValue` | mở rộng (chuyển từ `settings/copy-value.tsx` vào `packages/ui`) | dùng lần hai — luật «chuyển trước rồi dùng» |
| `Badge` | dùng | dấu nguồn trong bảng KR |
| `SimpleTable`, `Empty`, `Skeleton` | dùng | danh sách bản ghi và lịch sử |
| ngăn chồng của record sheet (`record-stack.ts`) | ghép | thêm loại `so-kr` như `objective`, `plan` — Quay lại có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: con số trong bảng KR là «danh sách», ngăn số là «chi tiết» chồng lên sheet mục tiêu — cùng khuôn ngăn chồng mà mục tiêu, kế hoạch, thoả thuận đang dùng; Perdoo đặt nguồn tiến độ trong hộp thoại KR (bảng tính · trang · ô) — rút: nguồn là một ô của hộp thoại KR, không phải màn riêng.
<!-- UX-SPEC-TEMPLATE>>> -->
