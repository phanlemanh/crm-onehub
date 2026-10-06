# Nguồn không kẹt — thiết kế (l4a `kho-nguon-khong-ket`)

Ngày 2026-10-04 · hạng T2 · hồ sơ `_acceptance/kho-nguon-khong-ket/` · Cổng Đáng đã ký `build`.

## Vì sao bây giờ

Từ 26/10 mọi phòng ban nạp 10–20 tệp mỗi nơi vào Kho tài liệu. Ba lỗi nằm đúng trên đường
nạp tệp và viết trang (khảo sát lộ trình 04/10, mục #22, #20, #21):

- **#22.** `chaySoanTuNguon` (`apps/agent/agent/lib/tai-lieu-soan.ts`) đặt nguồn về `CHO_DOC`
  rồi mới đọc tệp. Đọc tệp (`kho.doc`) hay bóc chữ (`docChu`) ném lỗi thì không nhánh nào đưa
  nguồn về `LOI`. Việc được thử lại theo lease; khi `retireExhausted` cho việc nghỉ, nguồn vẫn
  đứng ở `CHO_DOC`. `soanLai` của API từ chối nguồn `CHO_DOC` vì coi là đang soạn. Người nạp
  không có lối ra. Chỉ `DANG_SOAN` có lưới (`dongMaySoanQuaHan`).
- **#20.** `NutLienKetTrang` (`packages/ui/src/components/trinh-soan-lien-ket-trang.tsx`) đưa lượt
  tìm lỗi vào cùng nhánh với lượt rỗng (`setDs([])`), nên hộp hiện «Không có trang nào khớp.»
- **#21.** Ngoài-12 của `tim-va-dieu-huong-kho`: các ca E4/E4b/E4u dùng fixture viết tay
  `/ws/tai-lieu/…`, nên không đo liên kết chèn thật có mang đúng tiền tố workspace.

## Thiết kế

### 1. Bắt lỗi ở máy soạn (#22)

`chaySoanTuNguon` bọc phần từ sau bước đặt `CHO_DOC` tới hết trong một `try`. Bắt được lỗi:
ghi log lỗi đầy đủ ở server, đưa nguồn về `LOI` với lý do cố định
`TAI_LIEU_AGENT.lyDo.docLoi` («Chưa đọc được tệp — bấm Soạn lại để thử lần nữa.»), rồi đóng
việc. Lý do là hằng chữ: thông điệp lỗi gốc của lưu trữ có thể mang URL ký hay đường tệp nên
không bao giờ vào `lyDo`. Khối `catch` chỉ nhận lỗi bị ném; các ca lỗi đã có (`khongTai`,
`bamLech`, `can-go-tay`, `thieuQuyTac`) vẫn đi `ketThuc` như cũ và giữ đúng lý do của chúng.

Đánh đổi đã chọn: lỗi thoáng qua không còn được lease tự thử lại; người nạp bấm «Soạn lại».
Đổi lại người nạp thấy lỗi ngay, không chờ vô hạn.

### 2. Lưới nguồn mồ côi (#22)

Hàm mới `dongNguonMoCoi()` ở `apps/agent/agent/lib/tai-lieu-phien.ts`, gọi trên nhịp dispatch
cạnh `dongMaySoanQuaHan()` (`apps/agent/agent/schedules/dispatch.ts`). Một câu `UPDATE` đưa về
`LOI` (lý do `TAI_LIEU_AGENT.lyDo.moCoi`) mọi nguồn `CHO_DOC` không có việc `soan-tu-nguon` nào
còn mở (`finishedAt IS NULL`) mang `payload->>'nguonId'` của nó. Việc còn mở — lease sống,
hay chờ lượt thử — thì không đụng. Không cần cột mới, không migration: cả hai đường tạo nguồn
(tải lên, soạn lại) ghi nguồn và việc trong cùng transaction, nên một nguồn `CHO_DOC` không có
việc mở chắc chắn là mồ côi. Nguồn đang kẹt trên production về `LOI` ở nhịp đầu sau triển khai.
Chạy lại không đổi gì thêm (đã `LOI`). Mọi mức khác `CHO_DOC` (`CHO_SOAN`, `DANG_SOAN`, `DA_SOAN`,
`CAN_GO_TAY`, `LOI`) không bao giờ bị lưới đụng.

Cận thời gian: `soan-tu-nguon` chạy ở làn hiện (`DIRECT_KINDS`), lease `DISPATCH.visible.leaseMs`
6 phút, `MAX_ATTEMPTS` 3, nhịp dispatch 1 phút. Tiến trình chết lặp lại cả ba lượt thì nguồn về
`LOI` sau tối đa khoảng 3 × (6 + 1) = 21 phút — dưới mốc 30 phút của ngưỡng. E2 kiểm cận này
bằng chính các hằng đó.

### 3. Soạn lại

Không đổi `soanLai`: nguồn đã ở `LOI` thì «Soạn lại» xếp lại việc như hôm nay.

### 4. Hộp chèn liên kết báo lỗi (#20)

`NutLienKetTrang` giữ một cờ `loi` cho lượt tìm mới nhất. Mỗi lần chữ trong ô đổi (kể cả gõ lùi
còn dưới 2 chữ) và mỗi lần đóng hộp, cờ tắt trước. Lượt mới nhất bị từ chối → cờ bật, danh sách
rỗng. `CommandEmpty` xét độ dài chữ trước: dưới tối thiểu → `nhan.goThem`; rồi cờ lỗi →
`nhan.loiTim`; còn lại → `nhan.khongCo`. Lượt cũ về muộn không đổi cờ (giữ nguyên bảo vệ
`moiNhat`). `NhanLienKetTrang` thêm
trường `loiTim`; chữ ở `apps/app/lib/messages/tai-lieu.ts` (vi «Chưa tìm được trang — thử gõ
lại.», en «Couldn't search pages — try typing again.»), ghim ở `messages-guard`.

### 5. Bài kiểm tiền tố (#21)

Một ca mới ở `apps/app/test/tai-lieu-soan.dom.tsx` chạy qua `ManSoan` thật dưới workspace
`kho-thu`, chèn liên kết bằng hộp, đọc markdown được lưu, kiểm href đúng
`/kho-thu/tai-lieu/<slug>`. Danh sách trang lấy qua lớp `trpc.taiLieu.tim` giả nhưng đường dẫn
do chính `ManSoan` dựng (`url(duongTrang(slug))`), không viết tay trong fixture.

### 6. Đường đo cho ngưỡng

`_acceptance/kho-nguon-khong-ket/rang/dem-ket.ts` — chỉ đọc, xuất hằng `MOC_KET_MS` (30 phút).
In số nguồn kẹt quá mốc theo từng mức: `CHO_DOC` và `CHO_SOAN` tính từ lúc tạo việc
`soan-tu-nguon` mới nhất; `DANG_SOAN` tính từ `soanLuc`. Cộng số nguồn `LOI` theo lý do.
`CHO_SOAN` kẹt vì gửi máy soạn lỗi lặp nằm ngoài phạm vi vòng này nhưng vẫn được đếm (dòng riêng),
vì ngưỡng đã ký tính cả nó. Chạy được trên kho production bằng
`DATABASE_URL` chỉ đọc vào ngày đọc số 10/11.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: màn soạn trang → nút chèn liên kết → gõ ≥ 2 chữ → chọn trang → liên kết vào bài (điểm ra: hộp đóng, con trỏ về trình soạn).
- Biên: gõ < 2 chữ → «Gõ ít nhất hai chữ.»; không trang nào khớp → «Không có trang nào khớp.»
- Lỗi & quay lại: lượt tìm lỗi → «Chưa tìm được trang — thử gõ lại.» → gõ tiếp một chữ là lượt mới; lượt mới thành công thì câu lỗi biến mất.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp chèn liên kết trang (popover trong màn soạn) | chọn một trang để chèn liên kết | nút liên kết của thanh công cụ / về trình soạn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lien-ket-go-them | Hộp chèn liên kết | «Gõ ít nhất hai chữ.» | gõ thêm |
| ST-lien-ket-rong | Hộp chèn liên kết | «Không có trang nào khớp.» | đổi từ tìm hoặc đóng |
| ST-lien-ket-loi | Hộp chèn liên kết | «Chưa tìm được trang — thử gõ lại.» | gõ tiếp để tìm lại |
| ST-lien-ket-co | Hộp chèn liên kết | danh sách trang | chọn một trang |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Câu lỗi chỉ theo lượt tìm mới nhất; lượt cũ về muộn không bật hay tắt nó.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Command`/`CommandEmpty` (`@crm/ui`) | dùng | ô trống của Command đã là chỗ của câu trạng thái |
| `NutLienKetTrang` | mở rộng | thêm một trường chữ `loiTim`, không đổi bố cục |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: popover tìm-rồi-chọn đã có sẵn trong kho; vòng này chỉ thêm một câu trạng thái, không đổi khuôn — không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- Tự thử lại lỗi thoáng qua sau khi nguồn đã về `LOI` (người nạp bấm «Soạn lại»).
- Nguồn kẹt ở `CHO_SOAN` khi gửi máy soạn lỗi lặp (`drainMaySoan` gửi lại mỗi nhịp).
- Báo người nạp qua Zalo hay email khi nguồn về `LOI`.
- Đổi giao diện màn Nguồn (lý do `LOI` đã hiện ở đó).

## Tài liệu đã đọc

`docs/agent.md` (Dispatch on demand, Stale rows are closed on the dispatch tick, Chỗ rẽ: Máy soạn
của Kho tài liệu), `docs/design.md`. Repo khai `feature_loop.ui_standards_skill: web-design-guidelines`
nhưng skill đó không có trong phiên này — artifact UI không có đối trọng chuẩn nội.
