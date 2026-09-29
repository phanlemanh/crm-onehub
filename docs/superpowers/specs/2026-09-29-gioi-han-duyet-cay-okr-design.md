# Mức hiển thị, bước duyệt nhẹ, tái cơ cấu không mồ côi — thiết kế (lượt 8c)

Hồ sơ `_acceptance/gioi-han-duyet-cay-okr`. Mã MT-06, QT-02, TC-06. Hạng T3: đổi luật đọc
trên mọi đường đọc OKR, thêm một trạng thái mục tiêu, đổi luật ghi của cây tổ chức, chạm
`packages/db/prisma`. Người dùng thấy ngay khi gộp, không công tắc riêng của lượt; bước
duyệt là một ô của Chương trình OKR, mặc định tắt. Dựng và đo trên bộ OKR mẫu.

Đã đọc: `docs/api.md` (tRPC, «The organization tree», «OKR»), `docs/design.md`,
`docs/settings.md`, `docs/proto.md`, `CONTEXT.md` (Trưởng đơn vị, Chương trình OKR, Căn
chỉnh, Vai «chỉ OKR», Phạm vi dữ liệu), hồ sơ `vai-chi-okr` và `canh-kr-okr`, skill
`web-design-guidelines` (luật kho thắng ở nút gửi: tắt tới khi hợp lệ). Ba lượt đọc mã
29/09 (quyền đọc, luồng công bố, cây tổ chức) là căn cứ của mục 1.

## 1. Hiểu việc — đo trên mã 29/09

- **Không đường đọc nào kiểm theo mục tiêu.** `OkrService.docMucTieu` nhận quyền người gọi
  chỉ để tính `canEdit`. 30 thủ tục đọc của `okr.*` trả mọi mục tiêu, kể cả nháp, cho mọi
  người qua được `PhamViOkrMiddleware`. Nhắc buổi sáng lọc theo trạng thái, không theo
  người xem. Trợ lý OKR đọc mục tiêu theo mã, không hỏi người yêu cầu.
- **Công bố có hai đường.** Nút «Công bố» (`publishObjective`) và nhập bảng tính có ô
  «công bố luôn» (`applyImport` ghi thẳng `cong-bo`). Công bố không báo ai.
- **Cây tổ chức không nhìn OKR.** `archiveDepartment`, `archiveDivision` cho qua đơn vị
  còn OKR kỳ đang chạy; đơn vị lưu trữ rơi khỏi cây, trưởng thôi tính, mục tiêu vắng khỏi
  «Theo đơn vị» và toàn cảnh, không ai sửa được. `purgeDepartment` trên đơn vị có mục tiêu
  chạm khoá ngoại RESTRICT và trả 500. `moveDepartment` giữ mục tiêu theo phòng ban, quyền
  sửa đổi theo trưởng bộ phận mới. Gỡ thành viên không đụng OKR; người phụ trách đã rời
  vẫn đứng tên.

## 2. Các cách đã cân nhắc

**Mức hiển thị (MT-06).**

- A — hai mức, công khai và giới hạn, người xem có tên thêm được; giới hạn không vào số
  gộp và không căn chỉnh được. **Chọn.** Đúng khuôn Perdoo; mỗi người thấy cùng một con số
  ở toàn cảnh; không cần dòng giữ chỗ trên cây căn chỉnh.
- B — ba mức (thêm «trong đơn vị»). Bỏ: mức giữa đổi theo mỗi lần người đổi phòng ban,
  một ma trận đo nữa, chưa ai hỏi. Later.
- C — giới hạn vẫn vào số gộp nhưng ẩn tên. Bỏ: số của một đơn vị có một mục tiêu vẫn lộ
  tiến độ của đúng mục tiêu đó.

**Chỗ đặt luật đọc.** Một hàm thuần quyết «ai xem được mục tiêu này» và một hàm dựng điều
kiện Prisma cùng nghĩa, gọi ở mọi truy vấn `okrObjective`; không lọc sau khi đọc (lọc sau
làm lệch đếm và phân trang). Nhắc buổi sáng và trợ lý gọi cùng hàm thuần.

**Bước duyệt (QT-02).** Trạng thái `cho-duyet` trong cột `status` sẵn có (chuỗi, không
`migration`), người duyệt suy lúc đọc từ cây — trưởng đổi thì mục chờ đi theo trưởng mới.
Bỏ phương án bảng duyệt riêng (người duyệt ghi cứng, lệch khi cây đổi) và phương án duyệt
nhiều tầng (Later).

**Tái cơ cấu (TC-06).** Chặn lưu trữ, xoá hẳn đơn vị còn OKR; cho quản trị chuyển OKR sang
đơn vị khác; hiện OKR mồ côi cho quản trị. Bỏ phương án tự chuyển OKR khi lưu trữ (máy
đoán đơn vị nhận) và phương án cho quản trị sửa OKR của đơn vị không trưởng (đổi luật «quản
trị không sửa nội dung thay người» của lượt 3; chữa bằng đặt trưởng).

## 3. Dữ liệu

- `okrObjective.hienThi String @default("cong-khai")` — `cong-khai` · `gioi-han`, khuôn Zod
  `MUC_HIEN_THI` trong `@crm/validation/okr-hien-thi`.
- Bảng mới cuối `schema.prisma`: `OkrNguoiXem` (`objectiveId`, `userId`, `createdById`,
  `createdAt`, khoá chính đôi). Khoá ngoại tới mục tiêu CASCADE (mục tiêu nháp xoá được),
  tới người RESTRICT như mọi bảng OKR.
- `okrProgramConfig.duyetCongBo Boolean @default(false)` — theo phiên bản như mọi ô.
- `TRANG_THAI_MUC_TIEU` thêm `cho-duyet`. Hành động vết thêm `doi-hien-thi`, `gui-duyet`,
  `duyet`, `tra-lai`, `rut-duyet`, `chuyen-don-vi`.
- `migration` `20261006010000_okr_hien_thi_duyet`: hai cột có mặc định, một bảng, chỉ mục
  — không sửa dữ liệu, không xoá cột.

## 4. Luật xem — một hàm

`xemDuocMucTieu(nguCanh, mt)` (`@crm/validation/okr-hien-thi`, thuần) và
`dieuKienXemMucTieu(nguCanh)` (`@crm/db/okr-hien-thi`, trả `Prisma.OkrObjectiveWhereInput`).
Công khai: mọi người qua được phạm vi OKR. Giới hạn: người xem là

- quản trị (owner, admin) — thấy mọi mục tiêu;
- người phụ trách mục tiêu; người của mục tiêu cá nhân;
- người phụ trách một KR của nó; người làm một việc dưới KR của nó; người tham gia;
- người xem có tên;
- người sửa được đơn vị của nó theo `suaDuocDonVi` — trưởng phòng ban và trưởng bộ phận
  trên, trưởng bộ phận; trưởng phòng ban chính và trưởng bộ phận của người có mục tiêu cá
  nhân.

`nguCanhXemOkr(db, userIds)` (`@crm/db/okr-hien-thi`) dựng ngữ cảnh — vai, tập đơn vị làm
trưởng theo luật trưởng hiệu lực của cây (còn là thành viên, còn thuộc phòng ban, đơn vị
chưa lưu trữ). API dựng từ đây chứ không tự suy lần hai; một bài kiểm so tập trưởng của
ngữ cảnh với `OkrAccessService.quyen` trên bộ OKR mẫu để hai bên không trôi.

Hệ quả trên từng đường:

| Đường | Người không xem được |
|---|---|
| Danh sách (`byUnit`, `mine`, `danhSach`, `bangCham`, `xuatKy`, `khoiCuaToi`) | mục tiêu vắng, đếm và phân trang không tính nó |
| Theo mã (`objective`, `dienBien`, `canhKr`, `comments`, `lichSuSo`, `banGhiChiSo`) | 404 cùng câu với mã không tồn tại |
| Số gộp (`toanCanh`, `hopTuan`, `sucKhoe`, `countByUnit`) | giới hạn không vào số của AI — ai cũng thấy cùng số |
| Căn chỉnh (`alignmentTree`, `cayCanChinh`, `alignmentTargets`, `addAlignment`) | giới hạn không có căn chỉnh; không chọn làm đích được |
| Ghi dựa trên mục tiêu (`follow`, `addComment`, `guiGhiNhan`, `mangSang`, `ghiSoKr`) | 404, không hàng; nhắc tên và người nhận ghi nhận phải xem được |
| Nhắc (`viecCuaToi`, nhắc buổi sáng Zalo/Slack) | không mục nào nêu mục tiêu đó |
| Trợ lý OKR (`xepViecTroLy`, `apps/agent/agent/lib/okr/doc.ts`) | không xếp việc; tác tử đọc lại quyền trước khi đọc mục tiêu |
| Vết, diễn biến của mục tiêu KHÁC trỏ tới nó (căn chỉnh cũ, mang sang) | before/after trỏ tới nó thành `{ gioiHan: true }` — «một mục tiêu giới hạn», không mã, không tên (`vetChoNguoiXem`, cùng khuôn `vetSangKienChoVai`) |
| Bảng con đọc kèm mục tiêu (`okrKeyResult`, `okrViecKr`, `okrGhiNhan`, `okrComment`, `okrCheckIn`, `okrTrail`, `okrSoChup`) ở bất kỳ router nào | điều kiện xem lồng qua quan hệ `objective`; `soi-ma.mjs --ca xem` soi cả bảy bảng trên toàn `apps/api/src`, `packages/db/src`, `apps/agent/agent/lib` |

`datHienThi({ objectiveId, hienThi, nguoiXem })` — người sửa được mục tiêu, pha ghi được,
không khi đang chờ duyệt; người xem 0–`OKR_HIEN_THI.nguoiXemToiDa` (20) thành viên; sang
giới hạn khi mục tiêu còn căn chỉnh (hai chiều) bị từ chối nêu số căn chỉnh; một dòng vết
`doi-hien-thi` (trước → sau: mức, danh sách người xem). Hộp thoại tạo mục tiêu có ô mức,
để mục tiêu nhạy cảm không lộ dù chỉ một phút ở dạng nháp. Mang sang chép mức và người
xem còn là thành viên — mục tiêu giới hạn mang sang vẫn giới hạn; tạo từ mẫu, nhập bảng tính tạo công khai. `setProgram` ghi vết `cau-hinh` với before/after mang `duyetCongBo` để đếm được lần tắt.

## 5. Bước duyệt

- Chương trình OKR có ô «Công bố cần duyệt» (`duyetCongBo`), chỉ quản trị đổi.
- **Người duyệt** suy lúc đọc: phòng ban → trưởng bộ phận của nó; bộ phận → quản trị; cá
  nhân → trưởng phòng ban chính của người đó, hoặc trưởng bộ phận nếu chính người đó là
  trưởng phòng ban; không suy được ai → quản trị. OneHub không qua duyệt. Người duyệt
  luôn nằm trong tập người xem (mục 4).
- **Ai bấm gì.** Tắt: như hôm nay. Bật: người sửa được mục tiêu mà không duyệt được bấm
  «Gửi duyệt» (`guiDuyet`: nháp → chờ duyệt, cần ít nhất một KR); người duyệt bấm «Duyệt
  và công bố» (`duyetMucTieu`: cùng giao dịch công bố hôm nay — `publishedAt`, khoá khởi
  điểm) hoặc «Trả lại» kèm lý do 10–500 ký tự (`traLaiMucTieu`: về nháp); người gửi «Rút
  lại» (`rutDuyet`). Người bấm «Công bố» đã là người duyệt thì công bố thẳng, vết ghi
  `tuDuyet`.
- `publishObjective` của người không duyệt được khi ô bật → 400 câu ghim «Chương trình cần
  duyệt trước khi công bố — bấm «Gửi duyệt»». `applyImport` với «công bố luôn» ghi `cho-duyet`
  cho mục tiêu người nhập không duyệt được. Tắt ô khi còn mục chờ: mục chờ ở lại, người sửa
  được công bố thẳng từ chờ duyệt.
- Chờ duyệt khoá sửa nội dung mục tiêu và KR, căn chỉnh, mức hiển thị, người tham gia
  (400 «Mục tiêu đang chờ duyệt — rút lại để sửa»). Số gộp chỉ đếm `cong-bo` như hôm nay;
  trần mục tiêu đếm cả chờ duyệt.
- Nhắc: `okr-cho-duyet` — mỗi mục tiêu đang chờ người đó duyệt, mỗi sáng tới khi xử lý;
  `okr-tra-lai` — người gửi, trong cửa sổ 24 giờ, kèm lý do.

## 6. Tái cơ cấu

- **Đơn vị còn OKR mở không lưu trữ được.** `archiveDepartment`, `archiveDivision` từ chối
  khi còn mục tiêu (không bỏ) ở chu kỳ chưa đóng (lập kế hoạch, đang chạy, chấm điểm), câu
  nêu số mục tiêu và lối ra «chuyển OKR hoặc bỏ mục tiêu». Đếm qua một hàm dùng chung
  `demOkrCuaDonVi` (`@crm/db/okr-don-vi`) — `to-chuc` không nhập `okr`.
- **Không xoá hẳn đơn vị có lịch sử OKR.** `lyDoKhongXoaPhongBan` và luật xoá bộ phận thêm
  điều kiện «không mục tiêu nào trỏ tới», nên `org.tree` không đưa «Xoá hẳn» và máy chủ trả
  400 có câu thay cho 500.
- **Chuyển OKR** (`okr.chuyenDonVi`, quản trị): 1–50 mục tiêu cùng cấp (phòng ban → phòng
  ban, bộ phận → bộ phận) sang một đơn vị còn sống, ở chu kỳ chưa đóng; đổi `departmentId`
  hay `divisionId`, giữ KR, cập nhật tuần, căn chỉnh, người xem, vết; mỗi mục tiêu một vết
  `chuyen-don-vi`; một mã hỏng thì cả lô không ghi. Vượt trần mục tiêu của đơn vị nhận thì
  vẫn chuyển và trả cảnh báo. Gộp = chuyển hết rồi lưu trữ; tách = chuyển một phần.
- `org.tree` trả thêm `okrMo` (số mục tiêu mở) cho mỗi đơn vị, để hộp lưu trữ nói trước,
  không đợi lỗi.
- **OKR mồ côi** (`okr.moCoi`, quản trị): mục tiêu không bỏ ở chu kỳ chưa đóng mà đơn vị đã
  lưu trữ (dữ liệu trước lượt này), hoặc không ai sửa được (phòng ban không trưởng và bộ
  phận không trưởng hay không có bộ phận; bộ phận không trưởng; người của mục tiêu cá nhân
  đã rời), hoặc người phụ trách mục tiêu hay một KR đã rời. Sức khoẻ chương trình có khối
  «OKR mồ côi». `rang/okr-mo-coi.sql` đếm cùng lớp cho Cổng Giá trị.
- Dời phòng ban sang bộ phận khác: OKR đi theo phòng ban, căn chỉnh giữ nguyên, quyền sửa
  theo trưởng bộ phận mới; hộp dời nói trước số mục tiêu đi theo.

## 7. API mới (router `okr`, phạm vi OKR)

`datHienThi`, `guiDuyet`, `duyetMucTieu`, `traLaiMucTieu`, `rutDuyet`, `chuyenDonVi`,
`moCoi`. Danh sách thủ tục vai «chỉ OKR» với tới được trong `vai-chi-okr.spec.ts` sửa có chủ
ý thêm bảy thủ tục này — quyền theo bản ghi nằm ở dịch vụ.

## 8. Bộ OKR mẫu

Thêm: một mục tiêu phòng Pháp chế ở mức giới hạn có một người xem có tên; một mục tiêu phòng
Kinh doanh vùng 2 đang chờ duyệt (ô duyệt của chương trình mẫu tắt — đúng ca «tắt khi còn
mục chờ»); một dòng vết trả lại trên một mục tiêu nháp; một phòng ban đã lưu trữ chỉ còn mục
tiêu quý 3 đã khép. Sau nạp, `okr.moCoi` trả 0.

## 9. Đường đo

`rang/ty-le-gioi-han-duyet.sql` (chỉ đọc, `SET okr.chu_ky` trước): tỷ lệ giới hạn trên mục
tiêu đã công bố; trung vị giờ từ `gui-duyet` tới `duyet` hay `tra-lai`, tỷ lệ xử lý trong
5 ngày; số lần tắt ô duyệt trong 14 ngày sau lần bật (`tatTrongHaiTuan`, từ vết `cau-hinh`). Ghép cặp: mỗi `gui-duyet` với dòng `duyet`, `tra-lai` hay `rut-duyet` kế tiếp trên cùng mục tiêu; `rut-duyet` không tính là xử lý, cặp còn mở không vào trung vị. Mồ côi: `rang/okr-mo-coi.sql` liệt `objectiveId`, `lop` — không đo tuổi (gỡ thành viên xoá hàng, không còn mốc); ngưỡng đọc bằng cách so danh sách giữa các lần đọc tuần. Lỗi 500 khi
xoá đơn vị đọc từ nhật ký `tRPC org.purge* err` (đã có).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (giới hạn): khung mục tiêu › menu «…» › «Mức hiển thị…» → hộp thoại: chọn «Giới
  hạn», thêm người xem → Lưu → đầu khung có nhãn khoá «Giới hạn» (điểm ra: đóng hộp). Tạo
  mới: «Đặt mục tiêu» có ô «Mức hiển thị».
- Suôn sẻ (duyệt): trưởng phòng › khung mục tiêu nháp › «Gửi duyệt» → hỏi lại → khung hiện
  «Chờ Lê Minh duyệt» + «Rút lại». Trưởng bộ phận mở từ «Việc OKR của tôi» › «Chờ bạn duyệt»
  → khung có dải «Trần Hà gửi duyệt» + «Duyệt và công bố» / «Trả lại…».
- Suôn sẻ (chuyển OKR): Cài đặt › Tổ chức › phòng ban › dòng «OKR: 4 mục tiêu ở kỳ đang mở»
  › «Chuyển OKR…» → hộp thoại: chọn phòng ban nhận, bỏ chọn mục tiêu không chuyển → Chuyển.
- Biên: người không xem được mở đường dẫn mục tiêu giới hạn; mục tiêu còn căn chỉnh khi
  chọn giới hạn; ô duyệt tắt khi còn mục chờ; đơn vị không có trưởng; lưu trữ phòng ban còn
  OKR; không OKR mồ côi.
- Lỗi & quay lại: lưu mức hỏng → lỗi trong hộp, giữ lựa chọn; trả lại thiếu lý do → lỗi dưới
  ô, nút khoá; chuyển OKR hỏng → cả lô không ghi, lỗi nêu mục tiêu hỏng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung mục tiêu · đầu khung | Cho biết mục tiêu giới hạn hay chờ ai duyệt | Theo đơn vị, việc của tôi / hộp mức, hộp trả lại |
| Hộp thoại mức hiển thị | Chọn ai thấy mục tiêu | khung mục tiêu / khung mục tiêu |
| Hộp thoại trả lại | Nói vì sao chưa duyệt | khung mục tiêu / khung mục tiêu |
| Cài đặt › Chương trình OKR · Công bố cần duyệt | Bật hay tắt bước duyệt | thanh bên Cài đặt / — |
| Cài đặt › Tổ chức · chi tiết đơn vị | Cho biết đơn vị còn bao nhiêu OKR mở | cây / hộp chuyển OKR, hộp lưu trữ |
| Hộp thoại chuyển OKR | Đưa OKR sang đơn vị khác | chi tiết đơn vị, OKR mồ côi / chi tiết đơn vị |
| Sức khoẻ chương trình · OKR mồ côi | Cho quản trị thấy OKR không ai trả lời | khu OKR / hộp chuyển OKR, Tổ chức, Thành viên |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-khung-gioi-han | Khung mục tiêu | nhãn khoá «Giới hạn» cạnh trạng thái; rê chuột: «Chỉ người liên quan và 2 người xem có tên thấy» | mở hộp mức |
| ST-khung-khong-thay | Khung mục tiêu | `Empty` «Không tìm thấy mục tiêu này» — cùng câu cho mã không tồn tại | đóng khung |
| ST-hienthi-hop | Hộp mức hiển thị | `RadioGroup` Công khai · Giới hạn; ô người xem (`TokenField`); dòng «Luôn thấy: người phụ trách, người phụ trách KR, người tham gia, trưởng sửa được mục tiêu, quản trị» | lưu, huỷ |
| ST-hienthi-con-can-chinh | Hộp mức hiển thị | lỗi «Mục tiêu còn 2 căn chỉnh — gỡ trước khi đặt giới hạn» | gỡ căn chỉnh |
| ST-duyet-cho-nguoi-gui | Khung mục tiêu | `Alert` «Chờ Lê Minh duyệt · gửi 29/09» + «Rút lại»; nút sửa khoá | rút lại |
| ST-duyet-cho-nguoi-duyet | Khung mục tiêu | `Alert` «Trần Hà gửi duyệt» + «Duyệt và công bố» (primary), «Trả lại…» | duyệt, trả lại |
| ST-duyet-tra-lai-hop | Hộp trả lại | ô lý do 10–500 ký tự, đếm ký tự, «Trả lại» khoá tới khi đủ | gửi |
| ST-duyet-bi-tra-lai | Khung mục tiêu | `Alert` «Lê Minh trả lại: …» trên bản nháp + «Gửi duyệt» | sửa, gửi lại |
| ST-duyet-viec-cua-toi | Việc OKR của tôi | mục «Chờ bạn duyệt: Mở rộng kho Bình Dương» | mở khung |
| ST-chuongtrinh-duyet | Cài đặt › Chương trình OKR | dòng `Field` ngang «Công bố cần duyệt» + mô tả + `Switch` trong form, Lưu ở `CardAction` | lưu |
| ST-chuongtrinh-khong-quyen | Cài đặt › Chương trình OKR | công tắc khoá, dòng lý do dưới tiêu đề | — |
| ST-tochuc-okr-mo | Tổ chức · chi tiết | dòng «OKR: 4 mục tiêu ở kỳ đang mở» + «Chuyển OKR…» | chuyển |
| ST-tochuc-luu-tru-chan | Tổ chức · hộp lưu trữ | «Phòng ban còn 4 mục tiêu ở kỳ đang mở — chuyển OKR hoặc bỏ mục tiêu trước khi lưu trữ» + «Chuyển OKR…»; nút lưu trữ khoá | chuyển |
| ST-chuyen-hop | Hộp chuyển OKR | `Combobox` đơn vị nhận (cùng cấp, còn sống); danh sách mục tiêu có ô chọn; «Chuyển 4 mục tiêu» | chuyển |
| ST-chuyen-loi | Hộp chuyển OKR | lỗi nêu mục tiêu hỏng, không mục nào được chuyển | sửa, thử lại |
| ST-mocoi-co | Sức khoẻ · OKR mồ côi | `Item` mỗi mục tiêu: tên, đơn vị, `Badge` lý do («Đơn vị đã lưu trữ», «Không ai sửa được», «Người phụ trách đã rời»), hành động | chuyển, đặt trưởng |
| ST-mocoi-rong | Sức khoẻ · OKR mồ côi | `Empty` «Không có OKR mồ côi» | — |
| ST-mocoi-dang-tai | Sức khoẻ · OKR mồ côi | khung xương cùng hình | chờ |
| ST-mocoi-loi | Sức khoẻ · OKR mồ côi | `Empty` «Không tải được danh sách» + «Thử lại» | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lý do trả lại 10–500 ký tự; người xem có tên tối đa 20, chỉ thành viên; ô người xem và ô
  nhắc tên của mục tiêu giới hạn làm mờ người không xem được, kèm dòng «không xem được mục
  tiêu này».
- «Rút lại», «Trả lại», «Chuyển OKR» và lưu mức hiển thị đổi quyền nên đi qua hộp thoại có
  nút chính bên phải, «Huỷ» bọc `DialogClose`; «Gửi duyệt» hỏi lại bằng `ConfirmDialog`.
- Tên mục tiêu, lý do trả lại là chữ người nhập: `translate="no"`.
- Khổ 390: hộp thoại theo khuôn `Dialog` sẵn có (chưa có biến thể toàn màn — design-pass Nhóm 2), dải chờ duyệt xếp dọc, không cuộn ngang.
- Ngày theo giờ Việt Nam, in bằng `Intl.DateTimeFormat`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Dialog`, `DialogClose`, `ConfirmDialog` | dùng | ba hộp thoại, hỏi lại |
| `RadioGroup`, `TokenField`, `Field` | ghép | hộp mức hiển thị |
| `Alert` | dùng | dải chờ duyệt, bị trả lại |
| `Badge` | dùng | nhãn «Giới hạn», «Chờ duyệt», lý do mồ côi |
| `Switch` + `Field orientation="horizontal"` | dùng | ô «Công bố cần duyệt» |
| `Combobox`, `Checkbox`, `Item` | ghép | hộp chuyển OKR, danh sách mồ côi |
| `Empty`, `Skeleton` | dùng | ba trạng thái |

Bậc dừng: 1 (`packages/ui`). Đã tra: `radio-group`, `token-field`, `alert`, `combobox`,
`confirm-dialog`, `item`, `badge`, `empty` đều có ở `packages/ui/src/components` (29/09);
ReUI «transfer list» cho hộp chuyển — không cần, `Checkbox` trong `Item` đủ cho ≤ 50 dòng.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: ba luật đều gắn vào màn có sẵn — khung mục tiêu (chi tiết của «Theo đơn vị»), chi
tiết đơn vị ở Tổ chức, Chương trình OKR; không màn mới nào ngoài khối mồ côi trong Sức khoẻ.
Luồng hiển nhiên, không tra thêm; khuôn duyệt theo dải trên đầu khung như Viva Goals
«Approval workflows» [NGÀNH: Microsoft Viva Goals].
<!-- UX-SPEC-TEMPLATE>>> -->

## 10. Rủi ro

- **Một đường đọc sót luật xem** là lộ dữ liệu. Chặn bằng ba lưới: ma trận thủ tục đọc rút
  lúc chạy × ba người × ba cửa vào; `soi-ma.mjs --ca xem` đếm mọi truy vấn `okrObjective` ở
  `apps/api/src/okr`, `packages/db/src/okr-*` và `apps/agent/agent/lib/okr` phải đi qua
  `dieuKienXemMucTieu` hay nằm trong danh sách miễn có lý do; và thủ tục đọc mới làm bài
  ma trận đỏ tới khi được khai.
- **Hiệu năng toàn cảnh**: điều kiện xem thêm mệnh đề `where`, không thêm truy vấn; bài
  `okr-toan-canh-hieu-nang.spec.ts` (50 phòng ban × 2000 KR, số truy vấn cố định) phải xanh.
- **Chạm cùng vùng với 9b** (trợ lý đọc OKR) và `to-chuc` của các vòng khác: ai gộp sau kéo
  `onehub` về, chạy lại `soi-ma.mjs --ca xem`.
- **Dữ liệu trước lượt**: có thể đã có đơn vị lưu trữ còn OKR mở — không sửa tự động; khối
  mồ côi hiện chúng ra.
