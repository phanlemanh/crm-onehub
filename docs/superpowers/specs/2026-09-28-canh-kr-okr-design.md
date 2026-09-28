# Việc, sáng kiến, ghi nhận và mẫu nằm cạnh KR — thiết kế (lượt 8a)

Hồ sơ: `_acceptance/canh-kr-okr/` · Hạng T3 · Mã: SK-01, SK-02, CI-05, CI-06, MT-07 ·
Chia mã 8a / 8b / 8c đề xuất ở `opportunity.md` (quyết ở Cổng Đáng).

Đọc trước khi viết: `docs/api.md` (mục OKR, tổ chức, tRPC), `docs/design.md`,
`docs/settings.md`, `docs/proto.md`, `CONTEXT.md`; skill chuẩn giao diện của kho
(`web-design-guidelines`).

## 1. Hiểu việc

- **Kết quả:** mỗi KR có một chỗ cho những thứ nằm cạnh con số — việc đơn vị đang làm,
  chiến dịch hay kế hoạch 30 ngày đang đẩy nó, bằng chứng khi mốc xong; mỗi mục tiêu có
  lời ghi nhận đồng nghiệp gửi nhau; quản trị có mẫu để mùa đặt OKR không viết lại từ đầu.
- **Chủ kho đã nói:** dựng hết bằng dữ liệu mẫu, dựng và đo trên bộ OKR mẫu của M; người
  dùng thấy ngay khi gộp, không công tắc; không gộp trong đóng băng; 8a gồm mã thêm bảng
  hay đổi quyền.
- **Máy giả định (gom về Coverage, gạch ở Cổng Phạm vi):** nghĩa từng mã rút theo thứ tự
  câu «Ý định»; «việc» tự gõ và «sáng kiến» gắn sẵn chung một danh sách; bằng chứng là
  đường dẫn; mẫu áp theo cấp và danh sách đơn vị.
- **Không làm:** tiến độ mục tiêu không đọc việc (KR đo kết quả); không đếm hay xếp hạng
  ghi nhận; không tải tệp.

## 2. Ba cách đã cân nhắc cho chỗ đặt «cạnh KR»

| Cách | Thế nào | Được | Mất |
|---|---|---|---|
| **A — Khung KR xếp chồng (chọn)** | Bấm tên KR hay số việc trong bảng KR → khung KR mở chồng lên khung mục tiêu, như khung số của lượt 6. Hai tab: «Việc và sáng kiến», «Bằng chứng» (chỉ KR mốc) | Đúng nghĩa «cạnh KR»; có đường dẫn riêng (`?record=kr:<id>`) để dán vào họp tuần; khuôn xếp chồng đã có | Thêm một loại bản ghi của ngăn xếp |
| B — Tab «Việc» ở khung mục tiêu, nhóm theo KR | Một tab mới cạnh «Vết», «Trao đổi» | Nhìn mọi việc của mục tiêu một lần | Bằng chứng không có chỗ tự nhiên; tab thứ sáu của khung mục tiêu |
| C — Dòng KR mở rộng tại chỗ | Bấm dòng KR, bảng bung phần dưới | Không thêm khung | Bảng KR có cột chọn và menu; bung dòng trong `SimpleTable` là vẽ tay; 390px chật |

Ghi nhận không đi theo KR mà theo mục tiêu (lời khen thường cho cả đơn vị), nên nằm trong
tab «Trao đổi» sẵn có, có thể gắn một KR — như bình luận. Mẫu nằm ở Cài đặt › Chương
trình OKR và ở hộp thoại «Đặt mục tiêu».

## 3. Dữ liệu — sáu bảng mới, khối liền cuối `schema.prisma`

`migration` chỉ `CREATE TABLE`, `CREATE INDEX` trên bảng mới, `ADD CONSTRAINT` trên bảng
mới. Không thêm cột vào bảng có sẵn (luật lượt 6, 7): ghi nhận và «mục tiêu sinh từ mẫu»
là bảng riêng thay cho cột mới trên `okrComment`, `okrObjective`.

| Bảng | Cột chính | Khoá ngoại |
|---|---|---|
| `OkrViecKr` | `keyResultId`, `loai` (`viec` · `chien-dich` · `ke-hoach`), `tieuDe` (việc: 2–200 ký tự; gắn sẵn: rỗng), `nguoiLamUserId?`, `hanNgay?` (ngày VN), `xongLuc?`, `campaignId?`, `planId?`, `taoBoiUserId`, `position` | KR: RESTRICT · `campaign`, `onboardingPlan`: SET NULL (xoá hẳn bản ghi gốc không bị chặn) · `user`: RESTRICT |
| `OkrBangChung` | `keyResultId`, `url` (http/https, ≤ 2000), `ghiChu` (≤ 300), `tacGiaUserId`, `createdAt` | KR: RESTRICT |
| `OkrGhiNhan` | `objectiveId`, `keyResultId?`, `loiNhan` (1–500), `tacGiaUserId`, `createdAt` | mục tiêu, KR: RESTRICT |
| `OkrGhiNhanNhan` | `ghiNhanId`, `userId` — khoá chính ghép | ghi nhận: CASCADE · `user`: RESTRICT |
| `OkrMau` | `ten`, `cap` (`bo-phan` · `phong-ban` · `ca-nhan`), `donViIds String[]` (trống = mọi đơn vị cấp đó), `noiDung Json`, `archivedAt?`, `taoBoiUserId` | — |
| `OkrMucTieuTuMau` | `objectiveId @unique`, `mauId` | mục tiêu, mẫu: RESTRICT |

- Duy nhất: `(keyResultId, campaignId)` và `(keyResultId, planId)` — gắn một bản ghi hai
  lần vào một KR bị từ chối.
- `OkrMau.noiDung` parse ở biên bằng `@crm/validation/okr-mau` (`mauNoiDung`): câu mục
  tiêu gợi ý, loại (`cam-ket` · `tham-vong`), 1..`krCap` KR mẫu, mỗi KR `{ title, kind,
  unit, startValue?, targetValue? }`; có đủ hai số thì qua `kiemSoTheoKieu`. Không
  `Record<string, unknown>` ở đâu.
- Loại, trạng thái là Zod enum trong `packages/validation` (`okr-canh-kr.ts`,
  `okr-mau.ts`), lưu chuỗi — như mọi danh mục OKR.
- Trần và câu chữ vào `OKR` (`okr-config.ts`) mục `canhKr`, không số trần tại chỗ.

**Xoá KR.** `removeKeyResult` (đã từ chối KR có lịch sử) thêm: từ chối KR có bằng chứng
(`krCoBangChung`) hay ghi nhận gắn vào (`krCoGhiNhan`); việc và sáng kiến của KR nháp bị
xoá cùng giao dịch, mỗi hàng một dòng vết `go-viec`.

**Người rời.** Việc của người đã rời hiện «đã rời» cạnh tên; người sửa được KR giao lại
được. `transferWork` (lượt 4) chuyển thêm việc chưa xong của người rời sang người nhận,
cùng điều kiện `dieuKienChuyen`; `transferPreview` đếm thêm `viec`.

## 4. Quyền — trong `OkrAccessService`, không suy ở màn

| Thao tác | Ai | Khoá |
|---|---|---|
| Thêm, sửa, gỡ việc; gắn, gỡ sáng kiến; đính, gỡ bằng chứng | `ghiDuocKr` (người phụ trách KR, người sửa được đơn vị) | `assertKyGhiDuoc`; mục tiêu đã bỏ → từ chối |
| Đánh dấu một việc xong / chưa xong | `ghiDuocKr` **hoặc** người làm việc đó | như trên |
| Gắn chiến dịch hay kế hoạch 30 ngày | như dòng đầu **và** vai đọc được phạm vi đối tác (`docDuocPhamVi(role, "doi-tac")`) | vai «chỉ OKR» → 403 |
| Gửi ghi nhận | mọi thành viên, cả vai «chỉ OKR» | mục tiêu đã công bố, mọi pha; người nhận 1–5 thành viên còn trong không gian làm việc, khác người gửi |
| Gỡ ghi nhận | người gửi hoặc quản trị | — |
| Soạn, sửa, lưu trữ mẫu | quản trị chương trình (`canManageSettings`) | — |
| Tạo mục tiêu từ mẫu | người đặt được mục tiêu ở đơn vị đó (luật `createObjective`) | như `createObjective` |

Màn hỏi `canEditKr`, `coTheGanSangKien`, `laNguoiLam` từ API, không tự suy.

**Không lộ dữ liệu đối tác.** Hàng sáng kiến chỉ lưu mã bản ghi gốc. Mọi thủ tục trả hàng
sáng kiến đi qua một hàm `lienKetChoVai(role, hang)`: vai có phạm vi đối tác nhận
`{ loai, id, ten, trangThai }` đọc sống từ bản ghi gốc (`campaign.status`,
`onboardingPlan.closedAt`, tên công ty của kế hoạch); vai «chỉ OKR» nhận `{ loai,
coQuyen: false }` — không mã, không tên, không trạng thái. Áp ở mọi đường vào: tRPC, cầu
REST, khoá API. Bộ chọn chiến dịch hay kế hoạch dùng thủ tục danh sách **có sẵn** của hai
router đối tác, không mở đường đọc đối tác mới trong router `okr`.

## 5. API — router `okr` (phạm vi OKR)

- Đọc: `canhKr({ keyResultId })` → `{ kr, viec[], bangChung[], quyen }`;
  `objective` thêm cho mỗi KR `soViec { xong, tong }`, `soSangKien`, `soBangChung`;
  `traoDoi` (đọc của tab Trao đổi) trả thêm `ghiNhan[]` xen theo thời gian;
  `mau({ cap?, donViId? })` (quản trị: mọi mẫu kể cả đã lưu trữ; người khác: mẫu còn sống
  hợp cấp và đơn vị).
- Ghi: `themViec`, `suaViec`, `danhDauViec`, `goViec`, `ganSangKien`, `themBangChung`,
  `goBangChung`, `guiGhiNhan`, `goGhiNhan`, `luuMau`, `luuTruMau`, `khoiPhucMau`,
  `taoTuMau({ mauId, cycleId, donVi, mucTieu, krs[] })` — một giao dịch: mục tiêu nháp,
  KR (mỗi KR qua `krInput` và `kiemSoTheoKieu`, trần `krCap` theo chế độ chương trình),
  một hàng `OkrMucTieuTuMau`, vết `tao` với `after.tuMau`.
- Vết: thêm hành động `them-viec`, `sua-viec`, `xong-viec`, `go-viec`, `gan-sang-kien`,
  `dinh-bang-chung`, `go-bang-chung`, `ghi-nhan`, `go-ghi-nhan`, `sua-mau` (mẫu không
  thuộc mục tiêu: `objectiveId` null, `after = { mauId, ten }`). Vết của sáng kiến gắn
  sẵn (`gan-sang-kien`, và `go-viec` khi gỡ một sáng kiến) chỉ mang `{ loai, campaignId }`
  hoặc `{ loai, planId }` — không tên, không trạng thái. Thủ tục đọc vết của mục tiêu
  (tab «Vết») trả hai hành động đó qua cùng `lienKetChoVai`: vai «chỉ OKR» nhận
  `{ loai, coQuyen: false }`, không mã.
- `guiCapNhat` (lượt 4) nhận thêm `bangChung?: { url, ghiChu }` cho KR mốc được gửi là
  «Xong», parse bằng cùng khuôn của `okr-canh-kr`; hàng `okrBangChung` ghi trong **cùng
  giao dịch** với lần cập nhật, kèm một vết `dinh-bang-chung`. Đường dẫn sai thì cả lần
  gửi bị từ chối, KR không đổi — không có đường hai lời gọi rời.
- Danh sách thủ tục vai «chỉ OKR» với tới được (`vai-chi-okr.spec.ts`) sửa có chủ ý.

## 6. Báo người nhận ghi nhận

Thêm loại `okr-ghi-nhan` vào `viecOkr` (`@crm/db/okr-nhac`) cạnh `okr-nhac-ten`, sinh
trong `viecTraoDoi` từ `okrGhiNhan` trong cửa sổ, mỗi người nhận một mục
`{ ghiNhanId, objectiveId, nhan, nguoiGui }`. Hiện trong «việc của tôi» và tin nhắc buổi
sáng qua đúng đường lượt 4 — không thêm tin thứ hai, không kênh mới. Chạm vùng nhắc buổi
sáng mà 9c cũng chạm: ai gộp sau kéo `onehub` về và soát lại.

## 7. Bộ OKR mẫu

`apps/api/scripts/okr-mau/cong-ty.json` (M) thêm: mỗi phòng ban mẫu có 2–4 việc (xong và
chưa), ba KR mốc đã xong có bằng chứng, sáu ghi nhận, ba mẫu OKR (một cho bộ phận, một
cho các phòng kinh doanh, một cho các phòng hỗ trợ), hai mục tiêu quý 4 sinh từ mẫu.
Không sáng kiến gắn sẵn trong bộ mẫu (bộ mẫu không có chiến dịch, kế hoạch); phép đo sáng
kiến tự gieo. `--xoa` xoá sạch hàng của sáu bảng mới; nạp lại không nhân đôi.

## 8. Đường đo

`_acceptance/canh-kr-okr/rang/ty-le-canh-kr.sql` (chỉ SELECT, `SET okr.chu_ky`):
`coViecHaySangKien / mucTieu` (mục tiêu đã công bố có ít nhất một việc hay sáng kiến);
`mocCoBangChung / mocXong`; `phongBanCoGhiNhan / phongBanTong` (ghi nhận gửi trên mục
tiêu của phòng đó) và `ghiNhanTong`; `tuMauPhongBan / mucTieuPhongBan` (chỉ cấp phòng ban,
chỉ đã công bố); đọc kèm `viecXong / viecTong`, `sangKienKeHoach / sangKienTong`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (việc): khung mục tiêu › bảng KR › bấm «2/4» ở cột Việc → khung KR, tab «Việc và
  sáng kiến» → «Thêm việc» → dòng nhập tại chỗ (tiêu đề, người làm, hạn) → Enter lưu →
  dòng mới có ô đánh dấu (điểm ra: đóng khung KR, về khung mục tiêu, số cột Việc đổi).
- Suôn sẻ (sáng kiến): khung KR › «Gắn…» › «Kế hoạch 30 ngày» → hộp chọn có tìm → chọn →
  dòng sáng kiến mang tên và trạng thái kế hoạch, bấm mở kế hoạch chồng lên.
- Suôn sẻ (bằng chứng): hộp thoại Cập nhật KR mốc, chọn «Xong» → ô «Bằng chứng (đường
  dẫn)» hiện, không bắt buộc → Gửi; hoặc khung KR › tab «Bằng chứng» › «Đính bằng chứng».
- Suôn sẻ (ghi nhận): khung mục tiêu › tab «Trao đổi» › chọn «Ghi nhận» ở ô soạn → chọn
  người nhận, tuỳ chọn KR, viết lời → Gửi → dòng ghi nhận ở cuối dòng thời gian.
- Suôn sẻ (mẫu): Cài đặt › Chương trình OKR › «Mẫu OKR» › «Thêm mẫu» → sheet → Lưu. Đặt
  mục tiêu ở đơn vị: «Đặt mục tiêu» → «Bắt đầu từ mẫu» → chọn → form điền sẵn, ô số trống
  → điền → «Tạo bản nháp».
- Biên: KR chưa có gì; vai «chỉ OKR» thấy sáng kiến gắn sẵn không tên; bản ghi gốc đã lưu
  trữ / đã xoá; người làm đã rời; không có mẫu nào hợp đơn vị; chu kỳ chấm điểm / đã đóng
  (mọi nút ghi khoá, trừ ghi nhận).
- Lỗi & quay lại: lưu hỏng → dòng nhập giữ chữ, lỗi dưới ô; tải khung KR hỏng → `Empty` có
  «Thử lại»; đường dẫn bằng chứng sai → lỗi dưới ô, nút Đính khoá.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng KR (khung mục tiêu) | Cho thấy KR nào có việc, bao nhiêu xong | khung mục tiêu / khung KR |
| Khung KR · Việc và sáng kiến | Ghi và theo dõi việc đang đẩy một KR | bảng KR, `?record=kr:<id>` / kế hoạch, chiến dịch |
| Khung KR · Bằng chứng | Giữ căn cứ cho một mốc đã xong | khung KR / đường dẫn ngoài (tab mới) |
| Hộp thoại gắn sáng kiến | Chọn một chiến dịch hay kế hoạch có sẵn | khung KR / khung KR |
| Trao đổi · Ghi nhận | Khen đồng nghiệp ngay cạnh mục tiêu | khung mục tiêu / việc của tôi của người nhận |
| Cài đặt · Mẫu OKR | Soạn và cất mẫu cho từng nhóm đơn vị | Chương trình OKR / sheet mẫu |
| Hộp thoại «Đặt mục tiêu» · Bắt đầu từ mẫu | Bắt đầu mục tiêu từ khung có sẵn | Theo đơn vị / khung mục tiêu nháp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bangkr-co-viec | Bảng KR | cột «Việc» «2/4», KR mốc có dấu «Có bằng chứng» | bấm số → khung KR |
| ST-bangkr-chua-viec | Bảng KR | cột «Việc» «—» (người sửa được: «Thêm») | bấm → khung KR |
| ST-khungkr-dang-tai | Khung KR | khung xương cùng hình danh sách | chờ |
| ST-khungkr-rong | Khung KR | `Empty` «Chưa có việc hay sáng kiến nào cho KR này» + «Thêm việc» (người sửa được) | thêm |
| ST-khungkr-loi | Khung KR | `Empty` «Không tải được việc của KR này» + «Thử lại» | thử lại |
| ST-khungkr-co-viec | Khung KR | `Item` mỗi việc: ô đánh dấu, tiêu đề, người làm, hạn (quá hạn đỏ chữ), menu «…»; sáng kiến: biểu tượng loại, tên, `StatusIndicator` trạng thái | đánh dấu, sửa, gỡ, mở bản ghi |
| ST-khungkr-chi-okr | Khung KR | sáng kiến gắn sẵn: «Một kế hoạch 30 ngày — bạn không có quyền xem» không đường mở | — |
| ST-khungkr-goc-mat | Khung KR | «Kế hoạch đã xoá» / «Chiến dịch đã lưu trữ» | gỡ sáng kiến |
| ST-khungkr-khoa | Khung KR | mọi nút ghi khoá, dòng «Kỳ đang chấm điểm — việc chỉ đọc» | — |
| ST-khungkr-nguoi-roi | Khung KR | tên người làm kèm «đã rời» | giao lại |
| ST-bangchung-rong | Tab Bằng chứng | `Empty` «Chưa có bằng chứng» + «Đính bằng chứng» | đính |
| ST-bangchung-co | Tab Bằng chứng | `Item`: tên miền, ghi chú, người đính, ngày; mở trong tab mới | mở, gỡ |
| ST-capnhat-moc | Hộp thoại cập nhật KR mốc | chọn «Xong» → ô «Bằng chứng (tuỳ chọn)» hiện; đường dẫn sai → lỗi dưới ô, «Gửi cập nhật» khoá | gửi |
| ST-bangchung-sai | Hộp thoại đính | lỗi «Đường dẫn phải bắt đầu bằng http:// hoặc https://» dưới ô | sửa |
| ST-traodoi-ghinhan | Trao đổi | dòng ghi nhận khác bình luận: biểu tượng, «An ghi nhận Bình, Chi», KR nếu có, lời | gỡ (người gửi) |
| ST-traodoi-soan-ghinhan | Trao đổi | ô soạn ở chế độ «Ghi nhận»: ô người nhận (tối đa 5), lời, chọn KR | gửi |
| ST-mau-rong | Cài đặt · Mẫu | `CardTableEmpty` «Chưa có mẫu nào» + «Thêm mẫu» | thêm |
| ST-mau-danh-sach | Cài đặt · Mẫu | `Item` mỗi mẫu: tên, cấp, «3 đơn vị» / «Mọi phòng ban», số KR, «đã dùng N lần» | sửa, lưu trữ |
| ST-mau-khong-quyen | Cài đặt · Mẫu | danh sách đọc được, nút khoá, dòng lý do dưới tiêu đề trang | — |
| ST-mau-sheet | Sheet mẫu | form: tên, cấp, đơn vị, câu mục tiêu, loại, KR mẫu (thêm/bớt dòng) | lưu |
| ST-datmt-chon-mau | Đặt mục tiêu | nút «Bắt đầu từ mẫu» → danh sách mẫu hợp đơn vị | chọn |
| ST-datmt-khong-mau | Đặt mục tiêu | không có nút «Bắt đầu từ mẫu» khi không mẫu nào hợp | đặt tay |
| ST-datmt-tu-mau | Đặt mục tiêu | form điền sẵn, ô số trống viền lỗi khi bấm tạo | điền, tạo |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tiêu đề việc 2–200 ký tự; lời ghi nhận 1–500 (đếm ký tự hiện dưới ô); ghi chú bằng
  chứng ≤ 300; đường dẫn ≤ 2000, chỉ `http:`, `https:`; mở bằng `target="_blank"
  rel="noopener noreferrer"`, hiện tên miền.
- Dòng nhập việc: Enter lưu, Esc huỷ; ô đánh dấu một vùng bấm; nút biểu tượng có
  `aria-label`; hai hành động trở lên gom vào menu «…».
- Gỡ việc, sáng kiến, bằng chứng, ghi nhận, lưu trữ mẫu: `ConfirmDialog`.
- Khung KR: tab trên URL (`useRecordSheetView`), khổ 390 khung toàn màn, không cuộn ngang.
- Chữ người nhập (tiêu đề việc, lời ghi nhận, ghi chú, tên mẫu) mang `translate="no"`.
- Ngày theo giờ Việt Nam (`dauNgayVN`), in bằng `Intl.DateTimeFormat`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Sheet` khung chi tiết (`DetailSheet*`) | dùng | khuôn xếp chồng của khung số lượt 6 |
| `Item`, `ItemActions` | dùng | mỗi việc, sáng kiến, bằng chứng, mẫu là một đối tượng có hành động |
| `Checkbox`, `Field`, `Input`, `DatePicker`, `Combobox` | ghép | dòng nhập việc |
| `PickListDialog` | dùng | chọn chiến dịch hay kế hoạch có tìm |
| `TokenField` | dùng | người nhận ghi nhận |
| `ToggleGroup` | dùng | ô soạn Trao đổi: Bình luận · Ghi nhận |
| `StatusIndicator` | dùng | trạng thái kế hoạch, chiến dịch |
| `Empty`, `CardTableEmpty`, `Skeleton` | dùng | ba trạng thái |
| `ConfirmDialog` | dùng | gỡ, lưu trữ |
| `SimpleTable` (bảng KR) | dùng | thêm một cột, không vẽ lại |

Bậc dừng: 1 (`packages/ui`). Đã tra bậc 3 ReUI cho danh sách việc có ô đánh dấu
(câu tìm «task list checkbox», «todo») — không cần: `Item` + `Checkbox` đủ.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: bảng KR là danh sách, khung KR xếp chồng là chi tiết — đúng khuôn khung mục tiêu
và khung số đã có trong khu OKR; hai khuôn khả dĩ (A và B ở mục 2) đã so; Perdoo đặt
Initiatives ngay dưới KR trong trang OKR [NGÀNH: Perdoo].
<!-- UX-SPEC-TEMPLATE>>> -->

## 9. Rủi ro

| Rủi ro | Giảm |
|---|---|
| Vai «chỉ OKR» đọc tên chiến dịch, kế hoạch qua sáng kiến | một hàm `lienKetChoVai`, ma trận bốn đường vào có chiều đỏ |
| Người gõ tên đối tác vào tiêu đề việc | không chặn được bằng máy; từ điển và hướng dẫn nói tiêu đề việc ai cũng đọc |
| Ghi nhận thành thi đua | không đếm theo người ở màn nào; phép đo soi mã không có `count` theo người nhận |
| Chạm nhắc buổi sáng cùng 9c | một loại mục mới, không đổi luật cửa sổ; gộp sau thì kéo `onehub` về |
| Bảng mới làm `--xoa` của bộ mẫu sót hàng | AC bộ mẫu đọc lại mọi bảng sau `--xoa` |
