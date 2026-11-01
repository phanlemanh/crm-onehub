# Sửa mục tiêu và KR ngay trong ngăn (SV9 · `sua-tai-cho-muc-tieu-va-kr`)

Hàng SV9 của `docs/plan/lo-trinh-okr.json`, đợt `okr-ghi-trong-ngan-3010`, dãy K, đứng trên BK2 (onehub `d8daf37d7`).
Ô cơ hội ký `build`.

## Vấn đề, đo trên cây `d8daf37d7`

- Ngăn mục tiêu (`record-sheet/objective-sheet.tsx`): tên chỉ ở đầu ngăn (:998), «Vì sao» (`whyNow`) chỉ đọc và ẩn khi
  rỗng (`KhuViSao`, :487), người phụ trách chỉ đọc trong hàng ô số (:820). Muốn sửa phải chọn «Sửa» ở menu đầu ngăn
  (:312) → `NganOkr` (:444) mở `HopThoaiMucTieu` — một `Sheet` chồng lên ngăn.
- Ngăn KR (`record-sheet/kr-sheet.tsx`): tên ở đầu ngăn, người phụ trách chỉ đọc (`ChiTietKr`, :552). Ngăn KR không có
  lối sửa nào; sửa KR chỉ từ menu dòng KR của ngăn mục tiêu (`MenuKr`, :382) → `HopThoaiKr`, cũng là `Sheet` chồng.
- KR không có trường mô tả trong lược đồ.
- `docs/design.md` mục «Ghi vào bản ghi: ngay trong ngăn» ghi đúng chỗ này là nợ; ngăn deal sửa trường tại chỗ qua bảng
  kiểu trường (`fields/kieu-truong.tsx`, `MoTaTruong` + `OTruongPhieu`).

## Thiết kế

1. **Mục tiêu** — khối «Chi tiết» mới trong thân ngăn, ngay trên «Vì sao» cũ, dựng bằng `OTruongPhieu` với ba
   `MoTaTruong`: `title` (`TEXT`, bắt buộc), `whyNow` (`LONG_TEXT`), `ownerUserId` (`USER`, bắt buộc, danh sách thành viên
   từ `users.list` như hộp sửa đang dùng). `KhuViSao` chỉ đọc bỏ đi vì khối Chi tiết đã hiện «Vì sao» (rỗng thì hiện ô
   trống sửa được). Lưu qua `trpc.okr.updateObjective` gửi đúng một trường; xong thì `cache.okr(id)` để đầu ngăn, bảng
   KR, Sơ đồ đổi theo.
2. **KR** — `ChiTietKr` đổi hai dòng `title`, `ownerUserId` sang `OTruongPhieu`. Lưu qua `trpc.okr.updateKeyResult`
   gửi đúng một trường; xong thì `cache.okr(objectiveId)`.
3. **Quyền** — sửa được khi: mục tiêu `suaNoiDung(mt) && mt.kyGhiDuoc`; tên KR khi KR thuộc `canEditKr` và mục tiêu không
   bỏ, không chờ duyệt, chu kỳ ghi được; người phụ trách KR chỉ khi người xem có quyền sửa đơn vị (`mt.canEdit`), vì máy
   chủ trả 403 khi chủ KR tự đổi người phụ trách. Không đủ quyền thì ô hiện chữ, không sửa được.
4. **Lỗi** — độ dài chặn ở trình duyệt, không gửi: tên ngoài 3–200 ký tự → «Tên cần 3–200 ký tự.», «Vì sao» quá 500 →
   câu tương ứng (hai khoá mới trong `okrMessages`). Máy chủ từ chối → câu theo kiểu trường của `loiLuuTruong`
   (`fields/kieu-truong.tsx`) như ngăn deal: người không còn trong đơn vị → «Người này không còn trong đội…», lỗi khác →
   «Chưa lưu được <tên ô>. Thử lại sau một lát.» Ô trở về giá trị cũ.
5. **Hộp sửa giữ lại cho trường khác** — «Sửa» ở menu đầu ngăn và ở dòng KR vẫn mở `HopThoaiMucTieu`, `HopThoaiKr` cho loại,
   người tham gia, số liệu KR. Ba trường của vòng này sửa được ngay trong ngăn, không cần mở hộp.
6. **Bản mẫu** `/proto/sua-tai-cho-muc-tieu-va-kr`: ngăn mục tiêu và ngăn KR với dữ liệu mẫu dày (tên dài, «Vì sao» rỗng
   và dài, người phụ trách đã rời đơn vị), bốn trạng thái mỗi ngăn — xem · đang sửa · đang lưu · lỗi lưu — khổ 1280 và 375,
   theo nếp `docs/proto.md`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở ngăn mục tiêu (từ Toàn cảnh, Sơ đồ, Của tôi) → bấm ô Tên / «Vì sao» / Người phụ trách trong khối Chi tiết →
  sửa → Enter (ô một dòng), Ctrl/⌘+Enter (ô nhiều dòng) hay rời ô → ô hiện giá trị mới, đầu ngăn và bảng KR đổi theo (điểm
  ra: vẫn trong ngăn). Ngăn KR giống vậy cho Tên KR và Người phụ trách KR.
- Biên: «Vì sao» rỗng vẫn có ô trống bấm được; người phụ trách đã rời đơn vị hiện tên kèm «đã rời»; chủ KR không quyền
  đơn vị thấy Người phụ trách KR chỉ đọc; mục tiêu đã bỏ, chờ duyệt, chu kỳ khoá → mọi ô chỉ đọc.
- Lỗi & quay lại: máy chủ từ chối → toast câu theo kiểu trường, ô trở về giá trị cũ, bấm lại để sửa; Esc lúc đang sửa →
  huỷ, không lưu.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn mục tiêu | đọc và sửa nội dung một mục tiêu | Toàn cảnh, Sơ đồ, Của tôi, dòng tin / ngăn KR con |
| Ngăn KR | đọc và sửa một KR | dòng KR của ngăn mục tiêu, Sơ đồ / ngăn mục tiêu cha |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-muc-tieu-xem | Ngăn mục tiêu | khối Chi tiết: Tên, Vì sao, Người phụ trách dạng chữ bấm được | bấm một ô để sửa |
| ST-muc-tieu-dang-sua | Ngăn mục tiêu | ô Tên thành ô nhập, con trỏ trong ô | gõ rồi Enter / Esc |
| ST-muc-tieu-dang-luu | Ngăn mục tiêu | ô khoá, vòng quay nhỏ cạnh ô (`savingField`) | chờ |
| ST-muc-tieu-loi | Ngăn mục tiêu | toast «Tên cần 3–200 ký tự», ô về tên cũ | sửa lại |
| ST-kr-xem | Ngăn KR | Chi tiết KR: Tên, Người phụ trách bấm được | bấm một ô để sửa |
| ST-kr-dang-sua | Ngăn KR | ô Tên KR thành ô nhập | gõ rồi Enter / Esc |
| ST-kr-dang-luu | Ngăn KR | ô khoá, vòng quay nhỏ | chờ |
| ST-kr-loi | Ngăn KR | toast «Chưa lưu được, thử lại», ô về giá trị cũ | sửa lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên: 3–200 ký tự sau khi cắt khoảng trắng; «Vì sao» tối đa 500; Enter lưu ô một dòng, Ctrl/⌘+Enter lưu ô nhiều dòng,
  Esc huỷ, rời ô lưu. Chỉ gửi khi giá trị khác giá trị cũ. Dưới `md` ô vẫn trong ngăn (ngăn kéo), không đẩy ra màn riêng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `OTruongPhieu` + `MoTaTruong` | dùng | bảng kiểu trường của ngăn deal — một trường, một cách cư xử |
| `DetailSheetSection` | dùng | khối «Chi tiết» trong thân ngăn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: ngăn bản ghi là phần chi tiết của danh sách OKR; luồng hiển nhiên — sửa tại chỗ trong chính phần chi tiết, như
ngăn deal.
<!-- UX-SPEC-TEMPLATE>>> -->

## Lựa chọn và căn cứ

- Ba trường qua bảng kiểu trường chứ không viết ô riêng: `docs/design.md` «Màn không tự viết ô cho một trường».
- Giữ hộp sửa cho các trường khác: `bat_khi` của hàng chỉ nói tên, mô tả, người phụ trách; dời cả hộp là vòng khác.
- «Mô tả» của mục tiêu là `whyNow`: lược đồ mục tiêu không có trường mô tả khác; KR không có mô tả.
- Không mở `Sheet`/`Dialog` nào trong thư mục ngăn — luật `onehub/ngan-trong-khung` của BK2 canh.

## Ngoài vòng

- Dời loại, người tham gia, số liệu KR ra khỏi hộp sửa chồng lên ngăn.
- Sửa trường ở Sơ đồ, Của tôi, bảng KR.
- Trường mô tả cho KR (cần đổi lược đồ).
