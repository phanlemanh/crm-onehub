# Loại mục tiêu «Học tập» — design

Ngày: 2026-10-07 · Hồ sơ: `_acceptance/okr-loai-hoc-tap/` · Hạng: T2

## Vấn đề

OKR của kho có hai loại mục tiêu: «Cam kết» (phải tới đích) và «Tham vọng» (0,7 là tốt). Đội
cần một loại thứ ba cho mục tiêu mà đáp án chưa biết — mục đích là kiểm một giả thuyết và học
được điều gì, không phải đạt một con số. Ép những mục tiêu đó vào hai loại cũ làm tình trạng
giữa kỳ báo «Trượt» oan và làm điểm cuối kỳ trông như thất bại.

## Quyết định (chủ kho chốt 07/10)

1. Mã `hoc-tap`, nhãn «Học tập» / «Learning».
2. Giữa kỳ: đọc tình trạng như tham vọng — không bao giờ «Trượt».
3. Cuối kỳ: không đọc theo ngưỡng điểm. «Đã trả lời» khi mục tiêu đã có «Điều học được», còn
   chưa thì «Chưa trả lời».
4. Bắt buộc ghi «Điều học được» cho mọi mục tiêu học tập đã công bố, chưa bỏ, trước khi khép kỳ.
5. Kara được đề xuất loại học tập khi mục tiêu là kiểm một giả thuyết chưa biết đáp án.

## Thiết kế

### Một nguồn cho danh sách loại

`LOAI_MUC_TIEU = ["cam-ket", "tham-vong", "hoc-tap"]` (`packages/validation/src/okr-muc-tieu.ts`).
Hai bản chép tay dẫn từ nó: `LOAI_MUC_TIEU_NHAP` (`okr-cuoc-soan.ts`) trở thành chính
`LOAI_MUC_TIEU`, và `loaiMucTieu: z.enum(["cam-ket", "tham-vong"])` trong
`apps/api/src/okr/okr.contracts.ts` thành `z.enum(LOAI_MUC_TIEU)`. Cột `kind` là `String` không
CHECK, nên không có migration. Hộp chọn loại, bộ lọc theo loại và chip loại đã lặp
`LOAI_MUC_TIEU` hoặc tra `m.loai[...]` theo kiểu `Record<LoaiMucTieu, …>`, nên tự có giá trị mới
khi nhãn được thêm.

### Giữa kỳ — `tinhTrang`

Nhánh tham vọng đổi điều kiện từ `loai === "tham-vong"` thành `loai !== "cam-ket"`: tham vọng
và học tập cùng đọc «Đúng nhịp» khi tỉ lệ ≥ 0,7, «Chậm nhịp» khi dưới, không bao giờ «Trượt».

### Cuối kỳ — `cachDoc`

`CACH_DOC` thêm `da-tra-loi`, `chua-tra-loi`. Chữ ký mới
`cachDoc(loai, diem, dieuHocDuoc)`; với `hoc-tap` trả `da-tra-loi` khi `dieuHocDuoc.trim()`
khác rỗng, còn lại `chua-tra-loi` — không đọc `diem`, nên được tính cả khi KR chưa có điểm.
Loại cũ giữ nguyên đường cũ (`diem === null` → không có cách đọc). Chỗ gọi duy nhất ở
`okr-khep.service.ts` (bảng chấm) truyền `m.nhinLai?.dieuHocDuoc ?? ""`.

### Khép kỳ

Hàm mới `hocTapChuaGhi(tx, cycleId)` trong `apps/api/src/okr/khep.ts`: mục tiêu
`kind = "hoc-tap"`, `status = "cong-bo"`, của chu kỳ, mà `nhinLai` vắng hoặc `dieuHocDuoc` rỗng
sau khi bỏ khoảng trắng; trả `{ id, ten }[]` theo `position`, `id`.

- `setCyclePhase(... "da-dong")` (`okr.service.ts`): sau kiểm KR chưa chấm, danh sách khác rỗng
  → `BadRequestException(T.khep.conHocTapChuaGhi(n, tên))`, chu kỳ giữ pha cũ.
- `bangCham` trả thêm `hocTapChuaGhi: { id, ten }[]` (lọc theo quyền xem như `conLai`).
- `HopThoaiDongKy` (`settings/okr/hop-thoai-dong-ky.tsx`): hộp xác nhận chỉ hiện khi
  `conLai === 0` VÀ `hocTapChuaGhi` rỗng; ngược lại hộp chặn liệt kê cả đơn vị còn KR chưa chấm
  lẫn mục tiêu học tập chưa ghi (một `ItemGroup` mới `data-hoc-tap-chua-ghi`).

Mục tiêu nháp, chờ duyệt hay đã bỏ không chặn khép kỳ: chúng không vào bảng chấm hôm nay.

### Màn chấm điểm

`cham-diem.tsx`: nhãn cách đọc cạnh điểm đọc `m.cachDoc[mt.cachDoc]`; với học tập nhãn hiện
cả khi điểm còn trống. Ô «Điều học được» của mục tiêu học tập có `FieldDescription`
«Bắt buộc trước khi đóng kỳ» / «Required before the cycle closes». Lưu điều học được phải làm
mới `okr.bangCham` (qua `cache.okr`, danh sách làm mới đã gồm `bangCham`) để nhãn đổi ngay và hộp
khép kỳ mở bằng bấm không đọc bảng cũ — kiểm `onSuccess` của mutation `ghiDieuHocDuoc` ở S3.
Tên mục tiêu trong hộp chặn là dữ liệu người nhập: bọc `translate="no"`.

### Kara

`apps/agent-okr/agent/instructions.md`: `loai` nhận `cam-ket`, `tham-vong` hoặc `hoc-tap`, kèm
một câu khi nào dùng học tập. Lược đồ đầu ra của soạn OKR dùng `LOAI_MUC_TIEU_NHAP` nên tự nhận.

### Từ điển

`CONTEXT.md` thêm mục «Loại mục tiêu» (ba giá trị, cách đọc giữa kỳ và cuối kỳ, luật bắt buộc
ghi điều học được). Theo luật 7 của đợt sau-14-10, chỉ thêm dòng, không sửa câu cũ.

### Vòng đời

Không thêm loại bản ghi hay trạng thái kết thúc mới (`docs/vong-doi.md` — ba câu không áp):
vòng chỉ thêm một giá trị cho trường có sẵn và một điều kiện cho bước khép kỳ đã có.

### Chuẩn nội đã soi

`web-design-guidelines`: phần UI mới là một lựa chọn trong `Select` sẵn có, một nhãn chữ, một
`FieldDescription` và một `ItemGroup` trong hộp chặn sẵn có — cùng thành phần `@crm/ui` đang
dùng; không thêm chuyển động, không thêm điều khiển.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Thêm mục tiêu → hộp «Loại» chọn «Học tập» → lưu → chip «Học tập» trên mục tiêu → chu kỳ sang Chấm điểm → màn chấm điểm hiện «Chưa trả lời» → ghi «Điều học được» → «Đã trả lời» → Cài đặt › OKR › Khép kỳ → hộp xác nhận → chu kỳ «Đã đóng» (điểm ra: bảng chu kỳ).
- Biên: còn mục tiêu học tập chưa ghi điều học được → hộp khép kỳ là hộp chặn liệt kê tên mục tiêu; mục tiêu học tập đã bỏ hay còn nháp không chặn.
- Lỗi & quay lại: API từ chối khép (người khác vừa xoá điều học được) → toast lỗi nói số và tên, hộp đóng, chu kỳ giữ pha.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp thoại mục tiêu | chọn loại cho mục tiêu | Thêm/Sửa mục tiêu / danh sách mục tiêu |
| Chấm điểm | đọc kết quả từng mục tiêu, ghi điều học được | tab OKR / khép kỳ |
| Hộp khép kỳ | khép chu kỳ hoặc thấy vì sao chưa khép được | Cài đặt › OKR / bảng chu kỳ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-chamdiem-hoctap-chua | Chấm điểm | nhãn «Chưa trả lời» + chú thích «Bắt buộc trước khi đóng kỳ» dưới ô điều học được | ghi điều học được |
| ST-chamdiem-hoctap-da | Chấm điểm | nhãn «Đã trả lời» | không cần gì |
| ST-dongky-chan-hoctap | Hộp khép kỳ | tiêu đề chặn + danh sách «Mục tiêu học tập chưa ghi điều học được» | sang Chấm điểm ghi |
| ST-dongky-xacnhan | Hộp khép kỳ | hộp xác nhận như hôm nay | Khép kỳ / Huỷ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chú thích bắt buộc chỉ hiện với mục tiêu học tập.
- Nhãn cách đọc của học tập không phụ thuộc điểm.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Select` (`@crm/ui`) | dùng | hộp chọn loại sẵn có, thêm một lựa chọn |
| `FieldDescription` (`@crm/ui`) | dùng | chữ phụ cạnh ô nhập theo bảng «Dấu hiệu vẽ tay» |
| `ItemGroup`/`Item` (`@crm/ui`) | dùng | danh sách chặn đang dùng trong hộp khép kỳ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — không đổi bố cục nào; chỉ thêm giá trị vào các màn danh sách và hộp thoại đang có.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đo

- Hàm thuần: ma trận 3 loại × 5 mức tiến độ cho `tinhTrang`; 3 loại × điểm/điều học được cho `cachDoc`; danh sách loại dẫn từ một nguồn.
- API trên CSDL riêng: tạo mục tiêu học tập; khép kỳ bị chặn rồi mở; bảng chấm trả cách đọc và danh sách chưa ghi.
- DOM: hộp chọn ba loại vi/en; màn chấm điểm; hộp khép kỳ chặn.
- Màn thật: đi trọn luồng suôn sẻ và nhánh chặn.
