# Khép kỳ OKR — thiết kế

Lượt 7 của lộ trình OKR (`docs/plan/lo-trinh-okr.md` mục 5). Câu giao: «Kỳ được rà,
chấm, nhìn lại và mang sang trong công cụ». Hạn cứng: production trước 2026-12-14.
Hồ sơ: `_acceptance/khep-ky-okr/`. Quét độ phủ: `coverage-scan.md`.

## 1. Việc lượt này giao

Nửa sau của vòng OKR chưa có trong CRM. Lượt 3 đã khai bốn pha chu kỳ (lập kế hoạch
→ đang chạy → chấm điểm → đã đóng) và khoá mười một thủ tục ghi ở hai pha cuối, nhưng
không có gì để làm ở hai pha đó. Lượt này thêm:

1. **Rà giữa kỳ** — quản trị mở một khoảng ngày cho cả chu kỳ đang chạy. Trong khoảng
   đó sửa đích như hôm nay. Ngoài khoảng đó, sửa đích của mục tiêu đã công bố phải
   ghi lý do, và KR mang nhãn «đích sửa ngoài rà» tới lúc chấm.
2. **Sang pha chấm** — chốt số mọi KR đã công bố, máy tính điểm gợi ý.
3. **Chấm** — người sửa được KR xác nhận gợi ý hoặc chỉnh kèm lý do. Màn chấm ghi
   «Điểm cuối kỳ không phải đánh giá nhân sự».
4. **Nhìn lại** — mỗi mục tiêu một ô «điều học được».
5. **Đóng** — chỉ khi mọi KR đã chấm; sau đóng mọi ghi của kỳ bị khoá.
6. **Mở lại** — quản trị, có lý do, để vết; về pha chấm.
7. **Mang sang** — mục tiêu dở thành bản nháp ở chu kỳ kế, nối hai chiều.
8. **Xuất** — kỳ đã đóng ra một tệp CSV.
9. **Kiểm chất lượng khi đặt bằng luật** (AI-03 phần luật) — bốn luật, hỏi không chặn.

Hạng T3: chạm `packages/db/prisma` (năm bảng mới). Lộ trình ghi T2; bộ nghiệm thu suy
T3 từ đường `t3_paths`, nên có Cổng 1.5.

## 2. Dữ liệu — năm bảng mới, khối liền cuối `schema.prisma`

Không cột mới trên bảng có sẵn (luật `migration` chỉ thêm của lượt 3 và 6). Mọi khoá
ngoại tới bảng OKR cũ là `RESTRICT`: lịch sử chấm không được biến mất theo một lần xoá.

| Model | Trường chính | Ghi chú |
|---|---|---|
| `OkrCuaSoRa` | `cycleId`, `tuNgay`, `denNgay` (ngày lịch), `moBoiUserId`, `dongLuc?`, `dongBoiUserId?` | Một chu kỳ có thể có nhiều cửa sổ nối tiếp; không hai cửa sổ còn hiệu lực chồng ngày |
| `OkrDoiDich` | `keyResultId`, `truoc`, `sau`, `lyDo`, `ngoaiRa`, `cuaSoRaId?`, `tacGiaUserId`, `luc` | Chỉ thêm. Ghi khi đích của KR thuộc mục tiêu đã công bố đổi ở pha đang chạy |
| `OkrDiemKr` | `keyResultId` (duy nhất), `cycleId`, `soChot`, `diemGoiY`, `diem?`, `lyDo?`, `thang`, `phienBanChuongTrinh`, `chamBoiUserId?`, `chamLuc?` | Dòng sinh lúc sang pha chấm; `diem` rỗng = chưa chấm. Điểm lưu chuẩn 0–1 hai chữ số |
| `OkrNhinLai` | `objectiveId` (duy nhất), `dieuHocDuoc`, `suaBoiUserId`, `suaLuc` | Một ô mỗi mục tiêu |
| `OkrMangSang` | `tuObjectiveId`, `sangObjectiveId` (duy nhất), `sangCycleId`, `boiUserId`, `luc` | Duy nhất theo (`tuObjectiveId`, `sangCycleId`) |

Mở lại kỳ không cần bảng: một dòng `okrTrail` hành động `mo-lai-ky` mang lý do ở `note`.

Bảy hành động vết mới vào `HANH_DONG_VET`: `mo-ra`, `dong-ra`, `doi-dich`, `cham-kr`,
`nhin-lai`, `mang-sang`, `mo-lai-ky`. Đổi pha vẫn là `doi-pha`.

## 3. Luật pha

- `setCyclePhase` đi **đúng một bước** tới (hôm nay nó cho nhảy, ví dụ lập kế hoạch →
  đã đóng). Hai bước có điều kiện mới:
  - **đang chạy → chấm điểm**: chỉ từ ngày sau ngày cuối của chu kỳ (giờ Việt Nam) **và**
    khi mọi KR nguồn CRM của mục tiêu đã công bố đã có bản chụp cho ngày cuối (nhịp chụp
    00:05 của lượt 6 đã chạy). Thiếu thì từ chối, câu ghim nêu số KR còn thiếu bản chụp.
    KR nguồn khoá API và Google Sheets không gác (số của chúng không do nhịp tính); số
    chốt của chúng là giá trị hiện tại. Cùng giao dịch: đóng
    cửa sổ rà còn mở, sinh một dòng `OkrDiemKr` cho mỗi KR của mục tiêu **đã công
    bố** trong chu kỳ với `soChot = currentValue`, `diemGoiY` theo mục 4, `thang` và
    `phienBanChuongTrinh` của cấu hình đang áp. Mục tiêu nháp và đã bỏ không có dòng.
  - **chấm điểm → đã đóng**: chỉ khi mọi dòng `OkrDiemKr` của chu kỳ có `diem`. Từ
    chối thì câu ghim nói còn bao nhiêu KR chưa chấm.
- **Mở lại** là thủ tục riêng `okr.moLaiKy({ id, lyDo })`: chỉ quản trị, chỉ từ «đã
  đóng», về «chấm điểm», lý do 10–500 ký tự. Số chốt và điểm gợi ý không tính lại.
- Khoá: mười một thủ tục ghi của lượt 3, cập nhật tuần, `ghiSoKr`, nhịp chụp số giữ
  nguyên luật `PHA_GHI_DUOC`. Thêm: `chamKr` chỉ ở chấm điểm; `ghiDieuHocDuoc` ở đang
  chạy và chấm điểm; `moRa`, `dongRa` chỉ ở đang chạy. `mangSang` đọc chu kỳ nguồn ở
  chấm điểm hoặc đã đóng và ghi vào chu kỳ đích ở pha ghi được.

## 4. Điểm gợi ý và cách đọc

`diemGoiY = lamTron(tienDoKr(kieu, khoi, dich, soChot) / 100, buoc)`, dùng lại
`tienDoKr` của `packages/validation/src/okr-kr.ts` để điểm gợi ý và thanh tiến độ không
bao giờ nói hai điều khác nhau. `tienDoKr` trả số nguyên phần trăm; `lamTron` lấy bậc gần nhất của lưới 0,1, **nửa bậc làm
tròn lên** (84 → 0,8; 85 → 0,9; 86 → 0,9). Lưới: bước 0,1 trên thang 0–1; bước 10 trên
thang 0–100 — cùng một lưới chuẩn 0–1.

**Đơn vị của điểm.** Cơ sở dữ liệu lưu `diemGoiY` và `diem` chuẩn 0–1. Mọi đầu vào và đầu
ra mặt người dùng theo **thang của dòng** (`OkrDiemKr.thang`, chép từ cấu hình lúc sang
pha chấm): thang 0–100 thì `chamKr` nhận số nguyên bội 10 (80, không 0,8), `bangCham`
và CSV viết 80; thang 0–1 thì nhận và viết 0,8. Điểm ngoài lưới của đúng thang bị từ
chối.

**Kỳ đã chấm đọc theo phiên bản đã chép.** Điểm mục tiêu, trọng số và câu đọc của một kỳ
ở pha chấm hoặc đã đóng tính theo `phienBanChuongTrinh` lưu trong `OkrDiemKr`, không theo
cấu hình hiện tại — đổi chương trình cho quý sau không đổi được số của quý đã chấm.

| Kiểu | Gợi ý |
|---|---|
| tăng tới, giảm xuống | phần đi được từ khởi điểm tới đích, cắt trong [0, 1] |
| giữ trên, giữ dưới | 1 nếu số chốt ở phía đúng của đích, ngược lại 0 |
| mốc | 1 nếu xong, 0 nếu chưa |
| phần trăm | số chốt / 100 — đúng như thanh tiến độ hôm nay; KR «phần trăm» 20 → 80 chốt 80 gợi ý 0,8, người chỉnh lên kèm lý do nếu muốn (giả định chờ Cổng Phạm vi) |

Điểm mục tiêu = trung bình các điểm KR, có trọng số khi chương trình bật trọng số;
tính khi đọc, không lưu. Đọc theo loại (chữ cố định, không màu đỏ):

| Loại | Điểm | Câu đọc |
|---|---|---|
| tham vọng | ≥ 0,7 | «Tốt — với mục tiêu tham vọng, 0,7 là tốt» |
| tham vọng | < 0,7 | «Dưới mức tốt 0,7 của mục tiêu tham vọng» |
| cam kết | = 1 | «Đạt cam kết» |
| cam kết | < 1 | «Cam kết chưa trọn» |

Hằng số (bước, ngưỡng 0,7, trần chữ lý do và điều học được) ở `OKR_KHEP` trong
`packages/validation/src/okr-khep.ts`, cùng khuôn Zod của mọi đầu vào mới và hàm tính
điểm gợi ý — màn và máy chủ đọc một nguồn, không rải số.

## 5. Chấm và nhìn lại

- `okr.chamKr({ keyResultId, diem, lyDo? })` — quyền `assertSuaKr` (người phụ trách KR,
  trưởng đơn vị, quản trị). `diem ≠ diemGoiY` thì `lyDo` bắt buộc (10–500 ký tự). Chấm
  lại được nhiều lần trong pha chấm; mỗi lần một dòng vết `cham-kr`.
- `okr.ghiDieuHocDuoc({ objectiveId, noiDung })` — quyền `assertSuaMucTieu`, ≤ 2000 ký
  tự, rỗng được (xoá ý cũ). Không bắt buộc để đóng kỳ (giả định 5 của hồ sơ cơ hội,
  chủ kho chốt tại Cổng Đáng).
- `okr.bangCham({ cycleId, donVi? })` — đọc cho mọi vai đọc được OKR: mục tiêu đã công
  bố của đơn vị (hoặc cả chu kỳ), mỗi KR kèm khởi điểm, đích, số chốt, điểm gợi ý, điểm,
  lý do, người chấm, danh sách lần đổi đích **ngoài rà** (ngày, trước → sau, lý do),
  cờ sửa được; mỗi mục tiêu kèm điểm mục tiêu, câu đọc, điều học được, liên kết mang
  sang; đầu trả tổng KR chưa chấm theo đơn vị cho hộp thoại đóng kỳ.

## 6. Rà giữa kỳ và đổi đích

- `okr.moRa({ cycleId, tuNgay, denNgay })`, `okr.dongRa({ id })` — chỉ quản trị, chu kỳ
  đang chạy, hai ngày nằm trong chu kỳ, `tuNgay ≤ denNgay`, không chồng cửa sổ còn hiệu
  lực. «Trong rà» = hôm nay (giờ VN) ∈ [`tuNgay`, `denNgay`] và cửa sổ chưa đóng sớm.
- `updateKeyResult` thêm `lyDoDoiDich?`. Khi đích đổi, mục tiêu đã công bố và pha đang
  chạy: trong rà → ghi `OkrDoiDich` `ngoaiRa = false` (lý do tuỳ); ngoài rà → thiếu lý
  do thì từ chối với câu ghim, đủ thì ghi `ngoaiRa = true`. Mục tiêu nháp hay pha lập kế
  hoạch: không ghi `OkrDoiDich` (vết `sua-kr` như cũ).
- `okr.cycles` trả thêm cửa sổ rà đang hiệu lực, để hộp thoại KR biết khi nào hiện ô lý do.

## 7. Mang sang

`okr.mangSang({ objectiveId })` — quyền `assertSuaMucTieu` trên mục tiêu nguồn và quyền
sửa đơn vị ở chu kỳ đích. Chu kỳ đích = chu kỳ cùng loại, ngày đầu sau ngày cuối của
nguồn, gần nhất, đang ở pha ghi được; không có thì từ chối «Chưa có chu kỳ kế để mang
sang — quản trị mở chu kỳ trước». Tạo mục tiêu **nháp** cùng cấp, đơn vị, loại, người
phụ trách, người tham gia, tên và «vì sao lúc này»; chép các KR có điểm < 1 với khởi
điểm = số chốt, đích giữ nguyên, nguồn «tay», không hạn; KR mà khởi điểm mới làm hỏng
luật kiểu (ví dụ tăng tới đã vượt đích) không chép và được liệt trong đầu ra. Căn chỉnh
không chép (mục tiêu cấp trên ở kỳ cũ). Trần số mục tiêu và OKR cá nhân của chương trình
áp như `createObjective`. Mục tiêu nguồn, điểm và vết của nó không đổi. Mang sang lần hai
tới cùng chu kỳ đích bị từ chối.

## 8. Xuất

`okr.xuatKy({ cycleId })` — chỉ chu kỳ đã đóng; mọi vai đọc được OKR. Trả `{ tenTep,
noiDung }`: CSV UTF-8 có BOM, phân cách phẩy, một dòng mỗi KR của mục tiêu đã công bố và
đã bỏ (đã bỏ không có điểm). Cột: chu kỳ, cấp, đơn vị, mục tiêu, loại, trạng thái, người
phụ trách mục tiêu, KR, kiểu, đơn vị đo, người phụ trách KR, khởi điểm, đích, số chốt,
điểm gợi ý, điểm, lý do chỉnh, số lần đổi đích ngoài rà, điểm mục tiêu, điều học được,
mang sang tới. Số viết dấu chấm thập phân. Không cột nào đọc dữ liệu đối tác. Đọc, không
ghi — không vết.

## 9. Kiểm chất lượng bằng luật — nền cho 9b

Hàm thuần `kiemOkr` ở `packages/validation/src/okr-kiem.ts` (gói dùng chung, không ở
`apps/api` — 9b chạy câu hỏi bằng mô hình **sau** lớp này và cần đọc cùng mã luật). Đầu
vào: mục tiêu (tên, «vì sao lúc này») và các KR (tên, kiểu, khởi điểm, đích). Đầu ra:
danh sách `{ ma, truong, krIndex? }` với mã ổn định:

| Mã | Khi nào hỏi | Câu hỏi (vi) |
|---|---|---|
| `kr-la-viec` | tên KR (bỏ dấu, chữ thường) mở đầu bằng một động từ việc làm trong danh sách cấu hình, kiểu khác «mốc» | «Câu này đọc như một việc làm. Làm xong thì con số nào đổi?» |
| `thieu-khoi-diem` | kiểu khác «mốc», khởi điểm = 0 | «Khởi điểm 0 là số thật, hay chưa đo?» |
| `dich-bang-khoi-diem` | kiểu «giữ trên», «giữ dưới» hoặc «phần trăm», đích = khởi điểm (tăng tới và giảm xuống đã bị lượt 3 chặn) | «Đích bằng khởi điểm — KR này đòi đổi gì?» |
| `thieu-doi-trong` | mục tiêu có ≥ 2 KR, mọi KR «tăng tới», không KR «giữ trên»/«giữ dưới» | «Mọi KR đều đẩy một con số lên. Có KR nào giữ chất lượng không?» |

Hỏi, không chặn: hộp thoại KR hiện câu hỏi dưới đúng ô (`FieldDescription` tông cảnh
báo — xem mục Nhóm 2 của design-pass nếu biến thể chưa có), vẫn lưu được; sheet mục tiêu
hiện `thieu-doi-trong` thành một `Alert` trên bảng KR cho người sửa được. Máy chủ không
chạy luật lúc ghi — luật là lời hỏi ở màn, và 9b gọi cùng hàm.

## 10. Quyền và phạm vi

Mọi thủ tục mới nằm trong `OkrRouter` (phạm vi OKR), nên vai «chỉ OKR» gọi được theo
quyền bản ghi; không thủ tục nào đọc dữ liệu đối tác. Ma trận `vai-chi-okr` tự dò thủ
tục, phải xanh sau khi thêm.

## 11. Đường đo

`_acceptance/khep-ky-okr/rang/khep-ky.sql`, tham số `cycleId`: số mục tiêu đã công bố,
tỷ lệ KR có điểm, tỷ lệ mục tiêu có «điều học được» không trống, tỷ lệ mục tiêu được
mang sang, tỷ lệ KR có điểm khác gợi ý, pha hiện tại, và `chamDon` — số đơn vị mà mọi
lần chấm do một người trong ≤ 10 phút (dấu hiệu chấm ngoài rồi gõ lại). Chạy chỉ đọc trên production ngày
2027-01-15 và 2027-01-31. Phép đo trên dữ liệu gieo ở AC-13.

## 12. Hồ sơ đã ký có thể phải ghim lại

`dat-okr-trong-crm` (pha đi đúng một bước; `updateKeyResult` thêm luật đổi đích; hộp
thoại KR), `vai-chi-okr` (thủ tục mới trong ma trận), `so-okr-tu-chay` (nếu bài của nó
nhảy pha), `toan-canh-okr` (nút Xuất ở đầu Toàn cảnh).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ (quản trị): Cài đặt › Chương trình OKR › Chu kỳ → menu dòng quý → «Mở rà giữa
  kỳ» → chọn hai ngày → dải «Đang rà giữa kỳ tới <ngày>» hiện ở khu OKR → hết kỳ, menu
  «Sang chấm điểm» → đơn vị chấm → menu «Đóng kỳ» → xác nhận (điểm ra: dòng chu kỳ «Đã
  đóng»; Toàn cảnh có nút «Xuất»).
- Hai hướng đặt màn chấm mở ở design-pass (`design-pass.md`): **A** — cách xem thứ tư
  của «Theo đơn vị» (máy khuyên); **B** — tab «Chấm điểm» trong sheet mục tiêu. Luồng
  dưới viết theo hướng A.
- Suôn sẻ (trưởng đơn vị): Theo đơn vị → cách xem «Chấm điểm» → mỗi KR xác nhận gợi ý
  hoặc chỉnh + lý do → ô «điều học được» mỗi mục tiêu → «Mang sang kỳ sau» cho mục tiêu
  dở → hộp thoại nói sẽ chép gì, sang chu kỳ nào → xác nhận (điểm ra: bản nháp ở quý kế,
  mở được từ liên kết «Đã mang sang»).
- Suôn sẻ (người đặt): hộp thoại KR → câu hỏi hiện dưới ô → sửa hoặc cứ lưu.
- Biên: đơn vị không có mục tiêu đã công bố; mọi KR đã chấm; chưa có chu kỳ kế; sửa đích
  ngoài rà; vai «chỉ OKR» không sửa được KR của người khác (thấy điểm, không thấy ô).
- Lỗi & quay lại: đóng kỳ khi còn KR chưa chấm → hộp thoại liệt đơn vị còn thiếu, nút
  «Đóng kỳ» tắt; lưu điểm lỗi → ô giữ giá trị, thông báo lỗi, bấm lại; tải bảng chấm lỗi
  → «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chấm điểm (cách xem của Theo đơn vị) | Chấm mọi KR và nhìn lại mọi mục tiêu của một đơn vị | Theo đơn vị / sheet mục tiêu, hộp thoại mang sang |
| Hộp thoại mang sang | Xác nhận chép mục tiêu dở sang chu kỳ kế | Chấm điểm / bản nháp mới |
| Chu kỳ ở Cài đặt (thêm ba mục menu, một sheet, hai hộp thoại) | Quản trị điều khiển pha, rà giữa kỳ, đóng, mở lại | Cài đặt / chính nó |
| Hộp thoại KR (thêm ô lý do đổi đích, câu hỏi chất lượng) | Đặt hoặc sửa một KR | Sheet mục tiêu / sheet mục tiêu |
| Dải trạng thái kỳ trong khu OKR | Nói kỳ đang ở rà, chấm hay đã đóng | Mọi tab OKR |
| Nút «Xuất» ở đầu Toàn cảnh (kỳ đã đóng) | Tải tệp kỳ đã đóng | Toàn cảnh / tệp tải về |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cham-donvi | Chấm điểm | Hướng A: cách xem thứ tư của Theo đơn vị; câu «Điểm cuối kỳ không phải đánh giá nhân sự»; «Đã chấm N/M KR»; mỗi mục tiêu một khối: KR · khởi điểm → đích · số chốt · gợi ý · ô điểm; KR có nhãn «Đích sửa ngoài rà» kèm ngày, trước → sau, lý do; điểm mục tiêu + câu đọc; ô điều học được | Chấm, ghi điều học được, mang sang |
| ST-cham-sheet | Chấm điểm | Hướng B: tab «Chấm điểm» trong sheet mục tiêu, cùng nội dung cho một mục tiêu | Chấm từng mục tiêu |
| ST-cham-lydo | Chấm điểm | Điểm chọn khác gợi ý → ô lý do bắt buộc, lỗi «Cần lý do khi điểm khác gợi ý» | Ghi lý do |
| ST-cham-daxong | Chấm điểm | Mọi KR của đơn vị đã chấm — dòng tóm tắt, không nút thừa | Mang sang, hoặc chờ quản trị đóng |
| ST-cham-chiokr | Chấm điểm | Vai «chỉ OKR» không sửa được KR này — điểm đọc được, ô tắt | Xem |
| ST-cham-dadong | Chấm điểm | Kỳ đã đóng — chỉ đọc, dải «Đã đóng», không ô sửa | Xuất ở Toàn cảnh |
| ST-cham-rong | Chấm điểm | «Đơn vị này không có mục tiêu đã công bố trong kỳ» | Chọn đơn vị khác |
| ST-cham-dangtai | Chấm điểm | Khung xương theo khối mục tiêu | Chờ |
| ST-cham-loi | Chấm điểm | «Không tải được bảng chấm» + «Thử lại» | Thử lại |
| ST-mangsang-hoi | Hộp thoại mang sang | Sang chu kỳ nào, KR nào chép với khởi điểm mới, KR nào không chép và vì sao | Xác nhận / Huỷ |
| ST-mangsang-khongky | Hộp thoại mang sang | «Chưa có chu kỳ kế để mang sang — quản trị mở chu kỳ trước» | Đóng |
| ST-caidat-ra | Chu kỳ ở Cài đặt | Sheet «Mở rà giữa kỳ» hai ô ngày; dòng chu kỳ hiện «Rà giữa kỳ: <từ> – <đến>» | Mở / Huỷ |
| ST-caidat-dong-chan | Chu kỳ ở Cài đặt | Hộp thoại «Đóng kỳ»: còn N KR chưa chấm, liệt theo đơn vị; nút đóng tắt | Đóng hộp thoại |
| ST-caidat-dong | Chu kỳ ở Cài đặt | Hộp thoại xác nhận đóng khi đủ điểm | Đóng kỳ |
| ST-caidat-molai | Chu kỳ ở Cài đặt | Hộp thoại «Mở lại kỳ» với ô lý do bắt buộc | Mở lại / Huỷ |
| ST-kr-lydo | Hộp thoại KR | Ngoài rà, đổi đích → ô «Lý do đổi đích» bắt buộc + dòng «KR sẽ mang nhãn đích sửa ngoài rà tới lúc chấm» | Ghi lý do, lưu |
| ST-kr-hoi | Hộp thoại KR | Câu hỏi chất lượng dưới ô tên và ô khởi điểm; nút Lưu vẫn bật | Sửa hoặc lưu |
| ST-muctieu-doitrong | Sheet mục tiêu | `Alert` «Mọi KR đều đẩy một con số lên…» trên bảng KR | Thêm KR giữ, hoặc bỏ qua |
| ST-dai-ra | Khu OKR | Dải «Đang rà giữa kỳ tới <ngày> — sửa đích lúc này không cần lý do» | Sửa đích |
| ST-toancanh-xuat | Toàn cảnh | Kỳ đã đóng: dải «Đã đóng», nút «Xuất» ở đầu trang | Tải tệp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô điểm là `Select` trên lưới (0,0 … 1,0 hoặc 0 … 100), gợi ý chọn sẵn; lưu từng KR
  bằng nút «Lưu điểm» trên dòng — không lưu tự động, để lý do đi cùng điểm.
- Lý do chấm và lý do đổi đích 10–500 ký tự; điều học được ≤ 2000, lưu bằng nút riêng
  mỗi mục tiêu.
- 390: khối mục tiêu xếp dọc, dòng KR thành thẻ hai hàng; không tràn ngang.
- Tên mục tiêu, tên KR, tên người, lý do, điều học được mang `translate="no"`.
- Cách xem «Chấm điểm» nằm trong URL (tham số cách xem của «Theo đơn vị», như «Họp tuần»); mở đường dẫn là vào đúng cách xem.
- Cách xem «Chấm điểm» chỉ hiện khi chu kỳ đang chọn ở pha chấm điểm hoặc đã đóng.
- Cổng Phạm vi 2026-09-27 chốt hướng A và nhận hai biến thể mới trong `packages/ui`: kiểu chữ «câu hỏi» cho dòng ghi chú dưới ô (câu hỏi chất lượng), và bộ chọn cách xem thu về danh sách thả xuống dưới `md` (áp cả ba cách xem cũ của «Theo đơn vị»).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | dùng | Khối mỗi mục tiêu |
| `SimpleTable` | dùng | Dòng KR ở 1440 |
| `Item` | dùng | Dòng KR ở 390, liệt đơn vị ở hộp thoại đóng |
| `Select`, `Textarea`, `Field`, `FieldDescription`, `FieldError` | dùng | Ô điểm, lý do, điều học được |
| `Dialog`, `DialogClose`, `Sheet` | dùng | Mang sang, mở lại, mở rà |
| `ConfirmDialog` | dùng | Sang chấm, đóng kỳ khi đủ |
| `Alert` | dùng | Dải trạng thái kỳ, câu «không phải đánh giá nhân sự», thiếu đối trọng |
| `Badge` | dùng | Nhãn «Đích sửa ngoài rà» |
| `StatusIndicator` | dùng | Chưa chấm / đã chấm |
| `DatePicker` | dùng | Hai ngày rà |
| `LoaiMucTieuNhan`, `ConfidenceIndicator` | dùng (bản mẫu / `okr-status`) | Đọc theo loại |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: nấc (ii) — phiên có công cụ tra mẫu Mobbin nhưng màn chấm cuối kỳ là màn nội bộ
hiếm trên ứng dụng tiêu dùng; chọn khuôn của «Theo đơn vị» đã duyệt ở lượt 3 và 5 (cây
đơn vị trái, nội dung phải) để chấm là một cách xem nữa của cùng màn, như «Họp tuần».
<!-- UX-SPEC-TEMPLATE>>> -->
