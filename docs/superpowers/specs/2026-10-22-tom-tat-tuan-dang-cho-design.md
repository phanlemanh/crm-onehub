# HT4 · Tóm tắt tuần có trạng thái chờ — thiết kế

Hàng HT4 (`docs/plan/lo-trinh-okr.json`, đợt `okr-hop-tuan-2210`, mốc `m-1026ht`). Câu giao: «Trưởng phòng ban mở Họp
tuần của phòng đã bật Tóm tắt tuần nhưng chưa có bản, và thấy bản đầu tiên tới lúc nào».

## Vấn đề

Đo 22/10 trên phiên đo: bật nấc «bật» cho một phòng bằng `okr.setProgram`, `okr.troLyTomTat` trả
`{ ban: null, dangSoan: false, chuaCapNhat: false }`, và `KhoiTomTat` rơi vào `else return null`
(`apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`). Trưởng phòng không biết tính năng đã bật, cũng không biết bao giờ
có bản.

Bản tới theo một lịch cố định của tác tử (`apps/agent/agent/lib/okr/lich-tom-tat.ts`): mỗi ngày lúc
`OKR_TOM_TAT.gioXep` (06:00 giờ VN) lượt xếp chạy cho các chu kỳ đang chạy có `updateWeekday` bằng thứ của **hôm
qua**, và xếp một việc tóm tắt cho từng phòng ở nấc bật hay ẩn có cập nhật trong cửa sổ 7 ngày, khi Kara sẵn sàng
(`troLyOkrSanSang` → `quaTranChung`: trần tháng, khoá mô hình). Vì lịch cố định, giờ bản đầu tiên tính trước được.

## Cách làm

**Đường đọc, không đổi lịch.** Thêm một hàm đọc ở `packages/db/src/okr-tom-tat.ts` — gói dùng chung đã giữ «gói, ghi,
đọc cho người xem» (`docs/agent.md`, mục Trợ lý OKR lượt 9c) — trả trạng thái chờ của một phòng:

- `toi-luc` với `luc` (ISO): lần xếp sớm nhất còn ở tương lai, tức 06:00 giờ VN của ngày ngay sau một ngày có thứ bằng
  `updateWeekday` của chu kỳ.
- `dang-xep`: giờ xếp của hôm nay đã qua nhưng việc `okr-tom-tat-xep` có `dueAt` đúng giờ đó chưa đóng — bản sắp có.
  Việc ấy đã đóng mà phòng vẫn chưa có bản (phòng bật sau giờ xếp) thì là `toi-luc` của tuần sau.
- `tam-dung` với `lyDo` `het-tran-thang` (kèm `moLai` = ngày 01 tháng sau, giờ VN) hoặc `chua-co-khoa-mo-hinh`
  (`moLai: null`). Hết trần mà lần xếp kế rơi sang tháng sau thì trần đã mở lại — trả `toi-luc`.

Hàm chỉ trả khác `null` khi: chu kỳ ở pha `dang-chay` và chưa ẩn; phòng chưa từng có bản nấc bật nào trong chu kỳ
(đếm `OkrTomTat` có `cau.nac = "bat"`, kể cả bản bị giữ hay quá hạn hiện). `dang-xep` chỉ xét ngày hôm nay khi hôm nay
là ngày xếp của chính chu kỳ đó.

**Một luật giờ xếp (Hỏi-2, nháp theo khuyến nghị).** `gioXepCua` và «thứ cập nhật của một ngày xếp» (thứ của hôm qua)
dời từ `lich-tom-tat.ts` sang `packages/db/src/okr-tom-tat.ts`; tác tử import lại, hành vi xếp giữ nguyên. Hàm đọc
dùng đúng hai hàm đó. Bài kiểm cặp (AC-3) vẫn chạy lượt xếp thật của tác tử ở giờ hàm đọc báo, kể cả nhánh tuần sau
với và không có cập nhật mới trong cửa sổ 7 ngày.

**API.** `TroLyService.troLyTomTat` gọi hàm này chỉ khi nấc là bật, `ban === null`, `!dangSoan`, `!chuaCapNhat`, và
thêm khoá `choBan` vào kết quả khi hàm trả khác `null`. Khoá **tuỳ chọn** trong `troLyTomTatOutput`: các trạng thái cũ
trả đúng ba khoá như trước (bài kiểm `tro-ly-okr-tom-tat-duong-do` so bằng `toEqual` với ba khoá; hồ sơ đó đã ký).

**Màn.** `KhoiTomTat` thêm một nhánh trước `return null`: có `choBan` thì thẻ «Tóm tắt tuần của Kara» hiện, thân là
một dòng. Dòng nêu cả thứ cập nhật (thứ của `luc` trừ một ngày), vì bản chỉ tới khi phòng có cập nhật trong cửa sổ.
Khối tự hỏi lại qua `refetchInterval` của truy vấn: `dang-xep` theo `nhipHoiLai` như lúc đang soạn; `toi-luc` một lần
khi tới `luc` (bỏ khi khoảng chờ vượt trần hẹn giờ của trình duyệt).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Họp tuần của phòng (`/okr/theo-don-vi?xemOkr=hop-tuan&donOkr=pb:<id>`) → thẻ «Tóm tắt tuần của Kara» ở
  đầu bảng → đọc một dòng «Kara gửi bản tóm tắt đầu tiên vào khoảng 06:00 thứ Ba, 27/10 — sáng hôm sau ngày cập
  nhật thứ Hai.» (điểm ra: không có hành động; tab mở tới đúng giờ ấy thì khối tự hỏi lại)
- Biên: giờ xếp hôm nay đã qua mà lượt xếp chưa xong → «đang xếp, thường có trong vài phút»; phòng bật sau giờ xếp →
  giờ của tuần sau; Kara hết trần tháng → tạm nghỉ tới 01/<tháng sau>; chưa nối mô hình → nói chưa nối.
- Lỗi & quay lại: tải lỗi → `KaraState kind="error"` sẵn có, nút «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Họp tuần (thẻ Tóm tắt tuần) | cho trưởng phòng biết bản tóm tắt đầu tiên tới lúc nào | thanh bên / thẻ con Họp tuần, tin nhắc sáng / bảng đáng bàn ngay dưới |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tomtat-cho-ban-dau | Họp tuần | thẻ «Tóm tắt tuần của Kara», một dòng chữ phụ «Kara gửi bản tóm tắt đầu tiên vào khoảng 06:00 thứ Ba, 27/10 — sáng hôm sau ngày cập nhật thứ Hai.» | cập nhật KR vào thứ Hai; họp tiếp trên bảng |
| ST-tomtat-dang-xep | Họp tuần | thẻ, một dòng «Kara đang xếp bản tóm tắt đầu tiên — thường có trong vài phút.» | chờ; khối tự hỏi lại |
| ST-tomtat-tam-dung | Họp tuần | thẻ, `KaraState kind="off"`: «Kara tạm nghỉ tóm tắt tuần tới 01/11.» hoặc «Kara chưa tóm tắt được: quản trị chưa nối mô hình AI.» | không có; quản trị xử ở Cài đặt |
| ST-tomtat-an | Họp tuần | không hiện gì — nấc tắt, việc tắt, đơn vị chưa bật, chế độ ẩn (như trước) | — |
<!-- UX-STATE-TABLE>>> -->

Các trạng thái sẵn có không đổi: `ST-tomtat-dang-tai`, `ST-tomtat-dang-soan`, `ST-tomtat-chua-cap-nhat`,
`ST-tomtat-co-cau`, `ST-tomtat-loc-het`, `ST-tomtat-loi`.

### 4. Hành vi

- Giờ, thứ, ngày hiện theo `Asia/Ho_Chi_Minh` (`OKR_CHU_KY.muiGio`), không theo múi giờ máy người xem; tiếng Anh dùng
  cùng mốc giờ.
- Dòng nằm trong `CardContent`, nhìn thấy ở mọi khổ (không dùng `CardDescription` — ẩn dưới 640 px).
- `dang-xep` hỏi lại theo nhịp `OKR_TOM_TAT.hoiLaiMs` tới `tranChoMs`; lượt xếp mở việc thì khối sang
  `ST-tomtat-dang-soan` và đi tiếp nhịp sẵn có. `toi-luc` hỏi lại đúng một lần khi tới `luc`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | dùng | khung thẻ sẵn có của khối |
| dòng chữ phụ `text-muted-foreground` trong `CardContent` | dùng | cùng cách dòng nguồn `data-dong-nguon` của chính khối |
| `KaraState kind="off"` | dùng | `docs/ai-ux.md` §7: tắt hay hết lượt → `FieldDescription`, nói khi nào mở lại |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: không đổi IA — chỉ thêm một trạng thái trong một thẻ sẵn có của Họp tuần; luồng hiển nhiên nên không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chữ

Theo tiền lệ «Kara tạm nghỉ … tới đầu tháng sau» (`apps/app/lib/messages/okr-hoi.ts`, `okr-soan.ts`) và câu «Kara
tóm tắt sáng hôm sau ngày cập nhật» của chính khối. Không nêu số tiền hay trần — chỗ đó là của quản trị ở Sức khoẻ
chương trình.

## Tệp

- `packages/validation/src/okr-tom-tat.ts` — `choBanTomTat`, khoá tuỳ chọn `choBan` trong `troLyTomTatOutput`.
- `packages/db/src/okr-tom-tat.ts` — `gioXepCua`, `thuCapNhatCuaNgayXep`, `lanXepTomTatKe` (thuần) và
  `choBanDauTomTat` (đọc).
- `apps/agent/agent/lib/okr/lich-tom-tat.ts` — import hai hàm giờ xếp thay cho bản riêng; hành vi không đổi.
- `apps/api/src/okr/tro-ly.service.ts` — nối vào `troLyTomTat`.
- `apps/app/app/(app)/[slug]/okr/khoi-tom-tat.tsx`, `apps/app/lib/messages/okr-toan-canh.ts` (chỉ thêm khoá).
- Bài kiểm mới: `apps/api/test/tom-tat-tuan-dang-cho.spec.ts`, `apps/agent/test/tom-tat-tuan-dang-cho.integration.spec.ts`,
  `apps/app/test/tom-tat-tuan-dang-cho.dom.tsx`; bàn đo màn `_acceptance/tom-tat-tuan-dang-cho/rang/do-man.mjs`.

Không chạm `hop-tuan.tsx` (VK3/HT1 giữ), không migration.

## Ngoài phạm vi

- «Bản kế tiếp tới lúc nào» khi phòng đã có bản nhưng tuần mới nhất bị giữ, không làm được hay quá 8 ngày.
- Báo qua tin nhắc buổi sáng hay Zalo rằng phòng vừa bật tóm tắt.
