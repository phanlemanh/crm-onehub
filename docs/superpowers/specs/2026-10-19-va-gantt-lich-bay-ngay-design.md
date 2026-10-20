# Vá Gantt: lịch bảy ngày, dự án 300 việc — thiết kế

Hàng DA12 của `docs/plan/lo-trinh-viec-du-an.json`, đợt `viec-du-an-kho-tai-lieu`, dãy V1. Chủ kho duyệt Cổng Đáng
(«build») ở thẻ khởi tạo đợt 19/10. Gốc là ba mục ngoài hợp đồng của DA4 (`du-an-gantt`) mà chủ kho chọn «mở hợp đồng
mới» ở Cổng Bằng chứng 18/10: Ngoài-3, Ngoài-9 (bỏ hết ngày nghỉ thì Thứ Bảy, Chủ nhật tự bật lại) và Ngoài-8 (dự án
đủ 300 việc khoá cả thao tác mốc và phụ thuộc).

## Ý định

Câu giao: «Lịch làm việc chọn đủ bảy ngày vẫn giữ đúng như chọn, và dự án đủ 300 việc vẫn sửa được mốc và phụ thuộc».

Hai lỗi độc lập, cùng vùng dự án và lịch làm việc của làn M5 (luật 19 của đợt):

1. **Lịch bảy ngày.** `AppSetting.ngayNghiTuan` là mảng số, mặc định mảng rỗng (migration `20261016120000_du_an_gantt`).
   `docLichLam` đọc mảng rỗng thành mặc định Thứ Bảy, Chủ nhật. Nên khi quản trị bỏ chọn hết, máy lưu mảng rỗng, báo
   «Đã lưu», rồi lần đọc kế trả lại T7, CN: màn Cài đặt bật lại hai ô, Gantt vẫn tô hai cột, tự dời vẫn nhảy qua cuối
   tuần. Công ty làm cả bảy ngày không đặt được lịch của mình.
2. **Trần 300 việc.** `docDuAnMo` vừa kiểm dự án còn mở vừa kiểm dự án chưa đủ 300 việc, và mọi thao tác mốc, phụ thuộc
   đều gọi nó. Dự án đủ 300 việc thì không thêm, sửa, xoá được mốc, không thêm hay gỡ được phụ thuộc, kèm lời sai «Một
   dự án chứa tối đa 300 việc.».

## Mục tiêu, không làm, phản mục tiêu

Mục tiêu:

- Lịch «không nghỉ ngày nào trong tuần» lưu được và đọc lại đúng ở mọi đường đọc: `lichLamViec.get` (màn Cài đặt),
  `duAn.lich` (Gantt), tự dời và luật phụ thuộc (`docLichLam` → `congNgayLam`, `ngayLamKe`).
- Lịch chưa từng đặt vẫn mặc định T7, CN — kể cả dữ liệu đã có trên production trước vòng này.
- Trần 300 việc chỉ chặn đúng thao tác **thêm việc vào dự án** (tạo việc trong dự án, thêm việc con, chuyển việc từ
  ngoài vào). Mốc, phụ thuộc, đổi ngày chỉ còn chặn khi dự án đã đóng.

Không làm:

- Chọn đủ bảy ngày nghỉ (hợp đồng `datNgayNghiTuan` giữ trần sáu; lịch không còn ngày làm nào thì tự dời không có chỗ).
- Câu báo mới trên màn Cài đặt; màn giữ nguyên.
- Hạt giống ô chọn «Dự án» bị cắt ở khổ 375 — hàng riêng (dòng sổ S1).

Phản mục tiêu (làm đúng kỹ thuật mà vẫn hỏng):

- Sửa đường đọc mà làm đổi lịch của công ty đang dùng mặc định: production đang có hàng `appSetting` với mảng rỗng
  nghĩa là «theo mặc định». Đọc mảng rỗng thành «không nghỉ» mà không phân biệt thì Gantt production thôi bỏ qua cuối
  tuần ngay khi gộp.
- Sửa thước đã ký của DA4 cho vừa mã mới.

## Ràng buộc

- Hạng T3: thêm cột ở `packages/db/prisma` (Cổng 1.5 duyệt kế hoạch).
- Tên migration theo giờ UTC thật (luật 1 của đợt); migration chỉ thêm, không trỏ bảng của migration xếp sau (luật 2).
- Không viết chú thích trong mã; hằng ở một tệp mỗi khu (`LICH_LAM_VIEC`, `DU_AN`).
- Bài kiểm đã ký của DA4 không sửa: `apps/api/test/lich-lam-viec.spec.ts` (`dg_lich`) dựng «lịch trống» bằng cách ghi
  mảng rỗng rồi đòi đọc ra T7, CN, và chỉ trả lại cột mảng ở bước dọn; kho `crm_<id>_test` dùng chung cho mọi tệp của
  một lượt `bun run test`, nên trạng thái một bài để lại đi sang tệp sau.

## Cách làm đã chọn

### Lịch bảy ngày — cột cờ «không nghỉ ngày nào»

Thêm `AppSetting.khongNghiTuan Boolean @default(false)`.

- `datNgayNghiTuan([])` ghi `ngayNghiTuan: []` và `khongNghiTuan: true`; `datNgayNghiTuan` với mảng khác rỗng ghi mảng
  và `khongNghiTuan: false` — cùng một lần `upsert`.
- `docLichLam` đọc: `khongNghiTuan` là `true` → `[]`; còn lại giữ nguyên luật hôm nay (mảng khác rỗng → mảng đó, mảng
  rỗng hay chưa có hàng → `LICH_LAM_VIEC.ngayNghiTuanMacDinh`).
- Migration chỉ thêm cột, mặc định `false`, không câu `UPDATE` nào: trước vòng này chưa ai lưu được «không nghỉ», nên
  mọi hàng đã có đọc y như hôm nay.

Vì sao cờ «không nghỉ» chứ không cờ «đã đặt»: kho `crm_<id>_test` dùng chung cho mọi tệp của một lượt `bun run test`.
Bài `dg_lich` đã ký của DA4 ghi lịch qua `datNgayNghiTuan` rồi chỉ trả lại cột mảng; với cờ «đã đặt», nó để cờ `true`
và mảng rỗng lại cho các tệp chạy sau (tự dời, phụ thuộc), thành lịch không nghỉ — đỏ tuỳ thứ tự tệp. Bài đó không bao
giờ đặt rỗng qua API, nên cờ «không nghỉ» luôn `false` sau nó. Vì sao không đổi mặc định của cột thành `{6,7}`: chép
mặc định T7, CN ra hai nơi và buộc sửa bước dựng của bài `dg_lich` đã ký. Vì sao không mã giả `[0]`: trái luật «schema mô
tả đúng cái được lưu» của `AGENTS.md`.

Bài mới của vòng ghi cờ thì phải trả cờ về `false` ở bước dọn và tự kiểm lại sau dọn, để không để lịch không nghỉ cho
tệp sau.

Màn Cài đặt › Lịch làm việc và Gantt không đổi mã: màn đã vẽ đúng bảy ô theo `ngayNghiTuan` trả về, nút Hoàn tác gửi
lại giá trị trước lần lưu, Gantt chuyển `ngayNghiTuan` sang `weekendDays` và `gantt-lib` chỉ dùng mặc định khi giá trị
là `undefined`, không khi là mảng rỗng.

### Trần 300 việc — tách hai lời kiểm

- `docDuAnMo(tx, id)` chỉ kiểm có dự án và dự án còn mở; mốc, phụ thuộc giữ gọi nó.
- Lời kiểm mới `docDuAnNhanViec(tx, id)` khoá hàng `duAn` (`SELECT … FOR UPDATE`) rồi làm `docDuAnMo` cộng trần
  `DU_AN.viecToiDa`; `taoViec` (cả việc con, vì `taoViecCon` đi qua `taoViec`) và `doiDuAn` (chuyển vào) gọi nó. Khoá
  nằm trong lời kiểm nên chỉ ba đường thêm việc vào dự án chờ nhau; việc ngoài dự án không chạm khoá nào. Hai người
  cùng thêm việc thứ 300 thì người sau nhận lời trần.
- Đổi ngày việc (`apLich`) vốn chỉ kiểm dự án đóng — giữ nguyên, đo lại trên dự án đủ 300 việc.

### Tài liệu

`docs/api.md` mục «Lịch làm việc» thôi nói «rỗng nghĩa là mặc định»; nói «chưa đặt thì mặc định T7, CN; đặt rỗng là
không nghỉ ngày nào», và mục «Vòng đời» nói trần 300 chỉ chặn thêm việc. `CONTEXT.md` mục «Lịch làm việc» thêm «quản
trị bỏ hết thì không nghỉ ngày nào».

## Đo

- Bài API mới `apps/api/test/lich-bay-ngay.spec.ts` (đặt rỗng, đọc lại ở hai thủ tục, tự dời qua cuối tuần, hoàn tác).
- Bài DB mới `packages/db/test/lich-bay-ngay.spec.ts` (bảng đọc viết trước, mặc định của cột mới đọc từ chính kho đã
  nâng, ghi cột mảng không chạm cờ vẫn đọc như hôm nay).
- Bài API mới `apps/api/test/du-an-tran-viec.spec.ts`: ma trận viết trước chín thao tác × ba trạng thái dự án, đủ 27
  kết quả, cộng một ca hai giao dịch tranh nhau việc thứ 300.
- Bài DOM mới `packages/ui/test/gantt-bay-ngay.dom.tsx`: `GanttDuAn` với lịch rỗng không tô cột nào, đối chứng
  `[6, 7]` tô.
- Răng màn `_acceptance/va-gantt-lich-bay-ngay/rang/man.mjs` qua phiên đo (`tien-de.mjs`): bấm bỏ ô trên màn Cài đặt,
  tải lại, bấm Hoàn tác, chụp Cài đặt và Gantt ở 1280 và 375.
- Răng đột biến `_acceptance/va-gantt-lich-bay-ngay/rang/dot-bien.mjs` cài lại từng lỗi gốc vào bản sao, đòi bài tương
  ứng đỏ đúng lời.

## Để thợ quyết

Tên hàm, tên ca trong bài kiểm, thứ tự việc trong kế hoạch, cách dựng 300 việc trong bài (qua `taoViec` thật trong một
giao dịch, không chèn thẳng bảng).
