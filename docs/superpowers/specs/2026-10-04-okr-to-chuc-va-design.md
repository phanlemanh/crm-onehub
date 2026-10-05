# OKR và tổ chức vá (R1d, `okr-to-chuc-va`) — thiết kế

Ngày: 2026-10-04 · Hạng: T2 · Hồ sơ: `_acceptance/okr-to-chuc-va/` · Lộ trình: `docs/plan/lo-trinh-okr.json` hàng R1d.

## Vì sao

Từ 14/10 mọi phòng ban dựng cây tổ chức và đặt OKR quý đầu tiên. Khảo sát 04/10 (`de-xuat-lo-trinh.md`
mục A3) gom các lỗi trên đường đó; điều phối thêm R1m-7, Cổng Bằng chứng R1a thêm AC-10 điện thoại.
Đọc mã lại ngày 04/10 thì một mục đã sửa từ trước (#17), bảy mục còn sống.

## Từng lỗi: gốc và hướng

### #11 — mục tiêu đã thu gọn tự mở lại

Gốc: `bang-muc-tieu.tsx` `doiMo` dựng danh sách mới từ `ds` đang hiện
(`ds.map(id).filter(daThu.has)`), nên id của mục tiêu đang bị bộ lọc hay đổi đơn vị che khuất rơi khỏi
`thuMucTieu`. Quay lại thì mục tiêu đó mở ra, không báo. Nguồn: `muc-tieu-va-kr` Ngoài-4 (L32).

Hướng: đảo trạng thái của đúng một id trên **toàn bộ** danh sách đã thu trong URL, không lọc theo `ds`.
Đã cân: tỉa id không còn tồn tại (mục tiêu đã xoá) — không làm; URL chỉ dài thêm vài id, và tỉa đòi
biết toàn bộ mục tiêu của kỳ, thứ màn danh sách không có.

### #13 — nút số KR trên điện thoại không có móc đo

Gốc: `bang-kr.tsx` bản điện thoại gọi `SoCuaKr` với `moc={false}`, nên nút số không mang `data-so-kr`.
Thước đã ký `so-okr-tu-chay` E11 ở 390 px không tìm ra nút. Nguồn: `muc-tieu-va-kr` Ngoài-7 (L35).

Hướng: bản điện thoại mang cùng móc (`moc` mặc định). Hai bản cùng có trong DOM nhưng chỉ một bản hiện
ở mỗi khổ; thước của kho chọn phần tử đang hiện (`__tim` lọc `__hien`). Đã cân: tên móc riêng cho điện
thoại — bỏ, vì thước đã ký đòi đúng `data-so-kr`.

### #16 — người được giao KR từ mẫu không nhận thông báo

Gốc: thông báo «Bạn được giao phụ trách KR» (`okr-duoc-giao`, `packages/db/src/okr-nhac.ts`) suy từ dòng
vết `tao`/`tao-kr`. Đường tạo tay ghi dòng `tao-kr` cho mỗi KR (`okr.service.ts:1038`); `taoTuMau`
(`okr-mau.service.ts:317-332`) thì không. Nguồn: `canh-kr-okr` Ngoài-1.

Hướng: `taoTuMau` ghi một dòng vết `tao-kr` cho mỗi KR, cùng hàm ghi vết và cùng hình dữ liệu với đường
tay, trong cùng giao dịch. Không đổi schema.

### #18 — câu chặn lưu trữ phòng ban sai ngôn ngữ

Gốc: `lyDoChanLuuTru` (`to-chuc.service.ts:360`) trả `{ loai, cau }` với `cau` là câu tiếng Việt viết
cứng (`to-chuc-config.ts`); hộp xác nhận (`xac-nhan-luu-tru.tsx:80`) in thẳng `cau`. Người dùng giao
diện tiếng Anh đọc câu tiếng Việt. Nguồn: `ux-lai-thu-8c-okr` Ngoài-1.

Hướng: lý do mang dữ liệu thay vì câu — `{ loai, so }` (`nguoi`, `okr`) hoặc `{ loai, khuon: string[] }`
— parse ở biên bằng Zod (`packages/validation`), và hộp dựng câu từ `lib/messages` theo ngôn ngữ người
xem. `cau` tiếng Việt vẫn giữ cho lỗi ném ra từ `archiveDepartment` (đường đua hiếm: hộp đã kiểm rồi mà
lúc bấm lại bị chặn).

### #30 — khôi phục phòng ban rơi vào bộ phận đã lưu trữ, có thể trùng tên

Gốc: `restoreDepartment` (`to-chuc.service.ts:409`) chỉ gỡ `archivedAt`. Tạo mới thì từ chối bộ phận
đã lưu trữ (`boPhanDaLuuTru`) và tên trùng (`tenKhongTrung`), khôi phục thì không. `restoreDivision`
cũng không kiểm trùng tên. Nguồn: `mot-duong-ghi-phong-ban` Ngoài-1.

Hướng: khôi phục chạy đúng các kiểm của tạo mới — bộ phận cha đã lưu trữ, hoặc tên trùng một đơn vị đang
hoạt động — và áp cho cả phòng ban lẫn bộ phận. Bị chặn thì thủ tục không ném câu tiếng Việt: nó trả
`{ chan: { loai: "cha-luu-tru" | "trung-ten", ten } }` (schema ở `packages/validation`, parse ở biên như
#18), không đổi dữ liệu; màn «Đã lưu trữ» dựng toast từ `lib/messages` theo ngôn ngữ người xem
(«khôi phục bộ phận X trước», «đã có đơn vị đang hoạt động tên X»). Không làm vậy thì vòng này sinh lại
đúng lỗi #18 ở chỗ mới (gap-probe P1). Đã cân: khôi phục vào «chưa xếp bộ phận» — bỏ, vì âm thầm đổi chỗ của
phòng ban; khôi phục bộ phận sau đó không đưa nó về.

### #17 — đã sửa trước vòng này

Commit `7e133944` (25/09, «cổng khoá nghiên cứu chỉ đẩy người đổi được khoá») đã làm `congNghienCuu` cho
qua người không đổi được khoá; `apps/app/test/onboarding-gate.spec.ts` giữ nó. Vòng này không sửa lại,
chỉ có một eval chạy lại bài kiểm đó để lộ trình không đánh dấu nhầm.

### R1m-7 — quản trị không thêm được một mục tiêu lẻ

Gốc: `okr-access.service.ts` có hai luật. `nhapDuoc` (nhập cả bộ) = `quanTri || suaDuocDonVi`;
`suaDuocDonVi` (đằng sau `canEdit` và `createObjective`) chỉ cho quản trị ở cấp công ty. Quản trị không là
trưởng đơn vị thì thấy nút «Nhập bảng tính» nhưng không thấy «Thêm mục tiêu», và API từ chối
`createObjective` ở cấp bộ phận, phòng ban, cá nhân.

Hướng (khuyên A+, hỏi ở Cổng Phạm vi):
- **A+ — tạo lẻ theo luật nhập.** Quản trị tạo lẻ được đúng thứ việc nhập cả bộ tạo được: mục tiêu và KR.
  `createObjective` và `createKeyResult` dùng `nhapDuoc`; `byUnit` trả thêm `canCreate` (= `nhapDuoc`);
  nút «Thêm mục tiêu», ngăn tạo và nút thêm KR đọc `canCreate`. Sửa, xoá mục tiêu và KR vẫn theo
  `suaDuocDonVi`, như mục tiêu nhập từ bảng tính hôm nay. Không chạm luật sửa mà nhiều hồ sơ đã ký đo.
- A — chỉ mục tiêu. Bỏ: `mucTieuInput` không mang KR, nên quản trị tạo xong một mục tiêu rỗng mà không
  thêm được KR nào — vẫn vấp ngay ở ngưỡng SỐNG «thêm một mục tiêu lẻ» (gap-probe P2).
- B — quản trị sửa được mọi đơn vị (`suaDuocDonVi` trả true khi `quanTri`). Quản trị sửa được mục tiêu
  mình vừa tạo, nhưng mở quyền sửa KR, duyệt, nhập số cho mọi đơn vị; đụng ma trận quyền của
  `vai-chi-okr`, `muc-tieu-va-kr` và nhiều thước đã ký.

### AC-10 điện thoại của R1a — chip Kara không cuộn tới vùng Kara

Gốc: `useIsMobile` trả `false` ở lần vẽ đầu; `RecordSheetFrame` dựng bố cục máy tính trước. Hiệu ứng
cuộn trong `TabKr` (`objective-sheet.tsx:492`) chạy ngay khi dữ liệu đã có, cuộn trong thân khung, rồi
`setNeo(null)`. Sau đó khung sang bố cục điện thoại, vùng cuộn đổi sang hộp ngoài ở đầu, không gì cuộn
lại.

Hướng: `CuonCaKhungContext` mang ba giá trị `chua-biet | ca-khung | than` thay cho boolean;
`RecordSheetFrame` đọc giá trị gốc của `useIsMobile` (cần biết `undefined`) nên `packages/ui` thêm một hook
trả ba trạng thái, không đổi `useIsMobile` cũ. Hiệu ứng cuộn chờ khi còn `chua-biet` và giữ `neo` tới lúc
cuộn thật.

## Ngoài phạm vi

- Câu lỗi tiếng Việt viết cứng ở các thao tác khác của màn Tổ chức (`e.message` ở `hop-thoai-*`,
  `chi-tiet-*`): cùng lớp với #18 nhưng ngoài mục đã khảo sát — ghi một chip riêng.
- Quản trị sửa mục tiêu sau khi tạo (lối B của R1m-7) nếu Cổng Phạm vi chọn A.
- Tỉa id thu gọn của mục tiêu đã xoá khỏi URL (#11).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: quản trị mở «Theo đơn vị» một phòng ban → «Thêm mục tiêu» → ngăn tạo → lưu → mục tiêu mới
  trong danh sách; người được giao KR từ mẫu thấy «Bạn được giao phụ trách KR» ở Lời nhắc.
- Biên: thu gọn mục tiêu A, lọc làm A khuất, thu gọn B, bỏ lọc → A vẫn thu gọn; điện thoại 390 px bấm
  chip Kara của mục tiêu đã mở trước đó → khung cuộn tới vùng Kara.
- Lỗi & quay lại: khôi phục phòng ban dưới bộ phận đã lưu trữ → toast «khôi phục bộ phận X trước» bằng
  ngôn ngữ người xem, phòng ban vẫn trong «Đã lưu trữ»; trùng tên → toast gọi tên đơn vị đang hoạt động; lưu trữ bị chặn → hộp
  liệt kê lý do bằng ngôn ngữ người xem.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Theo đơn vị | Xem và đặt OKR của một đơn vị | thanh bên / ngăn tạo, khung Mục tiêu |
| Khung Mục tiêu (điện thoại) | Đọc một Mục tiêu và các KR | chip Kara / đóng về danh sách |
| Cài đặt › Tổ chức | Dựng cây bộ phận, phòng ban | thanh Cài đặt / hộp lưu trữ, mục Đã lưu trữ |
| Hộp lưu trữ phòng ban | Nói vì sao chưa lưu trữ được | nút Lưu trữ / chuyển OKR, đóng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-donvi-quantri-them | Theo đơn vị | quản trị không là trưởng: «Nhập bảng tính» và «Thêm mục tiêu» cùng hàng | thêm một mục tiêu |
| ST-donvi-thanhvien | Theo đơn vị | thành viên thường: không có hai nút trên | không phải làm gì |
| ST-danhsach-thugon | Của tôi, Theo đơn vị | mục tiêu đã thu vẫn thu sau khi lọc, đổi đơn vị rồi quay lại | mở lại khi muốn |
| ST-khung-dienthoai-kara | Khung Mục tiêu (390) | mở từ chip → vùng Kara trong tầm nhìn | đọc góp ý |
| ST-luutru-chan-en | Hộp lưu trữ | ba lý do (khuôn, người, OKR) bằng tiếng Anh khi giao diện tiếng Anh | chuyển OKR, sửa khuôn, chuyển người |
| ST-luutru-khoiphuc-chan | Đã lưu trữ | toast chặn bằng ngôn ngữ người xem, tên đơn vị không dịch; mục vẫn ở «Đã lưu trữ» | khôi phục bộ phận / đổi tên trước |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thu gọn: một id đảo trạng thái, các id khác trong URL giữ nguyên dù đang khuất.
- Chip Kara trên điện thoại: chờ biết bố cục rồi mới cuộn; `prefers-reduced-motion` thì cuộn tức thì.
- Lý do chặn lưu trữ: số và tên khuôn chèn vào câu của ngôn ngữ người xem; tên khuôn là dữ liệu người
  nhập, đánh dấu `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `NutThemMucTieu`, `NganTaoMucTieu` | dùng | đã có; chỉ đổi cờ quyền đọc vào |
| `Alert` trong `xac-nhan-luu-tru.tsx` | dùng | giữ khung, đổi nguồn câu |
| hook ba trạng thái khổ màn | tạo (trong `packages/ui/src/hooks`) | `useIsMobile` làm mất «chưa biết» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: vòng này không đổi khuôn; R1m-7 dùng lại ngăn tạo đã có, các mục khác sửa hành vi trong màn hiện có.
<!-- UX-SPEC-TEMPLATE>>> -->
