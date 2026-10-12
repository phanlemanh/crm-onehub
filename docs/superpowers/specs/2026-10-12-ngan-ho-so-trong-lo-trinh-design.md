# Ngăn hồ sơ trong trang Lộ trình — thiết kế

Hồ sơ: `_acceptance/ngan-ho-so-trong-lo-trinh/` (hàng LT1b, T2). Gốc: `_acceptance/trang-lo-trinh-trong-crm/`
(LT1, trên production từ 10/10). Cổng Đáng: build, Manh Phan, 2026-10-12.

## Việc

Người dùng bấm một việc đã giao trong trang Lộ trình, ngăn việc LT1 đã có mở ra, và đọc trong một phút
năm điều: vì sao làm · đã lên chưa · sẽ đo gì, khi nào · còn thiếu gì · ai quyết. Chủ không gian làm việc
(vai `owner`) thấy thêm bảy con số của vòng làm: tiêu chí, phép đo, lượt chấm, token, quyết định máy,
quyết định người, commit đã chấm — kèm đường tìm PR.

Mọi chữ lấy từ dải tóm tắt bộ kit xuất (`hang.tom_tat`, khối `lo-trinh-du-lieu` bản 2, hàng X2 của kit).
CRM không đọc hồ sơ, không đọc tệp kế hoạch, không tự tính ô nào.

## Quyết định

1. **Bộ đọc là bản chép nguyên hàm `docDuLieu` bản 2** của kit nhánh chính `7f65e5a0` (thay bản 1 ở
   `apps/app/lib/lo-trinh/doc-du-lieu.js`). Khuôn Zod ở `packages/validation/src/lo-trinh-du-lieu.ts` thêm
   `hang.tom_tat` (null được) với hai nhóm `moi_nguoi` (chín ô, mỗi ô chuỗi hoặc null) và `chu_kho` (sáu số
   hoặc null, `ma` chuỗi hoặc null); bảng `KHOA_LO_TRINH_DU_LIEU` thêm ba cấp `tom_tat`, `moi_nguoi`,
   `chu_kho` đúng thứ tự bảng khoá của hàm — phép đo bản chép của LT1 so hai bảng.
2. **Khối bản 1 không phải «trang thiếu».** Bộ đọc bản 2 gặp khối bản 1 thì trả một câu nhắc «khuôn bản
   1»; trang LT1 hiện mọi câu nhắc thành băng cảnh báo cả trang. `docTrangLoTrinh` xét theo số phiên bản
   (`phien_ban === 1`), không theo câu chữ: khối bản 1 → không băng, mọi việc «chưa có tóm tắt». Khối mới
   hơn bản 2 giữ băng «một phần trang có thể thiếu» như LT1.
3. **Tầng chủ kho lọc ở máy chủ.** `page.tsx` đọc vai bằng `workspaceRoleOf(session.user.id)` (đã có ở
   `@crm/auth`, chỉ đọc), rồi một hàm thuần `choVaiXem(dauVao, vai)` ở `apps/app/lib/lo-trinh/` đặt
   `tom_tat.chu_kho = null` cho mọi vai khác `owner`. Mã khách không biết vai: thấy `chu_kho` thì vẽ phần
   chủ kho, không thấy thì thôi. Dữ liệu tầng đó vì vậy không có trong trang gửi xuống trình duyệt của vai
   khác. Phần đọc tệp vẫn nằm sau `"use cache"`; phần lọc chạy sau cache, theo từng lượt xem.
4. **Ngăn: phần «Tóm tắt hồ sơ» đứng đầu thân ngăn**, ngay sau hai cảnh báo LT1 (theo lời, lệch kế
   hoạch), trước «Chi tiết» và hai danh sách việc liên quan. Hàng theo đúng thứ tự ô của khối, bỏ ô
   `trang_thai` vì nó trùng chữ trạng thái ở dải số đầu ngăn (đặc tả kit: «đúng bằng hang.trang_thai»;
   đếm trên bản vẽ thật 81/81 trùng). Tám hàng: Đã giao gì · Vì sao làm · Hồ sơ cập nhật · Lên production ·
   Sẽ đo gì, khi nào · Kết quả đo · Còn thiếu gì · Ai quyết.
5. **Ô vắng hiện «Chưa có»**, chữ phụ, không bỏ hàng — người đọc biết ô đó có nhưng hồ sơ chưa ghi. Việc
   không có dải (chưa có hồ sơ, hoặc khối bản 1) hiện một câu «Chưa có tóm tắt hồ sơ cho việc này.» trong
   phần «Tóm tắt hồ sơ».
6. **Phần chủ kho «Số liệu làm việc»** đứng ngay sau «Tóm tắt hồ sơ», có một câu «Chỉ chủ không gian làm
   việc thấy phần này.» Hai cột ở máy tính, một cột ở điện thoại. Commit đã chấm hiện bảy ký tự đầu, nút
   sao chép trọn mã (`CopyValue`), và liên kết «Tìm PR» mở ô tìm PR của GitHub theo mã commit (tab mới):
   `https://github.com/search?q=<mã 40 ký tự>&type=pullrequests`. Mẫu URL nằm trong
   `apps/app/lib/lo-trinh/cau-hinh.ts`.
7. **Không thu gọn đoạn dài** ở lượt này. 31/81 ô «vì sao» quá 400 ký tự; ngăn cuộn được, các hàng có nhãn
   nên người đọc lướt theo nhãn. Đo ở phiên nghiệm thu; chữ cụt và chữ dài là việc của kit (chip đã mở).
8. **Không số PR.** Khối cố ý không mang (đặc tả kit). Đường tìm theo mã commit thay.

## Dữ liệu thật để làm và thử

`_acceptance/ngan-ho-so-trong-lo-trinh/rang/sinh-mau-x2.mjs --kit <thư mục kit> --ghi` lấy cây crm ở một
`sha` đã ghim (`git archive`), chạy bộ vẽ của kit đã chỉ, và ghi:

- `apps/app/test/fixtures/lo-trinh/x2/LO-TRINH.html` — trang kit vẽ, không sửa byte nào.
- `apps/app/test/fixtures/lo-trinh/x2/nguon.json` — nhãn nguồn: `sha` kit, `sha` crm, lệnh, ngày vẽ, và
  `sha256` của thân hàm `docDuLieu` trong bộ vẽ đã dùng.

Không có `--ghi` thì vẽ lại và so byte với tệp đang có (phép đo khứ hồi). Kit không có ở máy (CI) → thoát
2 kèm câu ghim, không đỏ giả. Bản mẫu `/proto` đọc khối của chính tệp này qua một JSON máy rút ra cùng
lượt. `LO-TRINH.html` ở gốc kho vẫn do kit đã cài vẽ — không đưa trang của kit nhánh chính vào gốc.

## Thứ tự gộp và các phép đo của LT1

Phép đo bản chép của LT1 (`rang/ban-chep.mjs`) so bản chép với `scripts/lo-trinh.mjs` của crm (kit 2.26,
bản 1) — sẽ đỏ từ commit đổi bộ đọc cho tới khi crm nhận kit 2.27. Vòng này:

- Có phép đo bản chép riêng: so thân hàm với `sha256` ghi trong `nguon.json` (luôn chạy được), và khi
  `scripts/lo-trinh.mjs` của crm đã mang bản 2 thì so thêm từng ký tự với nó. Còn bản 1 → thoát 2 với câu
  «crm chưa nhận kit có X2» — mã đã khai trước (`expected_exit: 2`); sau 2.27 lượt ghim lại trả 0 và pin
  nói «giới hạn đã khai không còn».
- Gộp vào `onehub` chỉ sau khi crm nhận kit 2.27: gộp `onehub` vào nhánh, ghim lại LT1 và LT1b một làn,
  rồi chủ kho bấm gộp. CI của PR đỏ ở phép đo LT1 trước mốc đó là đúng điều kiện, không phải lỗi.

## Ranh giới với LT2

LT2 (nút «Gửi tín hiệu», phiên khác) sở hữu nút toàn cục, đường ghi tín hiệu và phần hiện tín hiệu. Vòng
này chỉ chạm ngăn hồ sơ (`apps/app/components/lo-trinh/ho-so-viec.tsx` và tệp mới cạnh nó), bộ đọc
(`apps/app/lib/lo-trinh/`), khuôn Zod, `page.tsx` của trang Lộ trình, nhãn ở `apps/app/lib/messages/lo-trinh.ts`
và bản mẫu của chính hồ sơ. Đụng cùng tệp với LT2 thì báo phiên điều phối; LT1b gộp trước LT2.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: trang Lộ trình → bấm một việc đã giao (Bảng, Bảng cột, Mốc, hay việc liên quan trong ngăn) →
  ngăn mở, «Tóm tắt hồ sơ» ở đầu thân → đọc năm câu (điểm ra: đóng ngăn, về đúng chỗ đứng như LT1).
- Biên: việc chưa có dải → một câu «Chưa có tóm tắt hồ sơ cho việc này.»; ô vắng → «Chưa có»; vai khác
  `owner` → không có phần «Số liệu làm việc»; khối bản 1 → mọi việc «chưa có tóm tắt», không băng.
- Lỗi & quay lại: dải sai kiểu → cả trang về khung «dữ liệu lộ trình hỏng» của LT1 kèm chỗ hỏng (khung
  LT1, không khung mới); khối mới hơn → băng cảnh báo của LT1, ngăn đọc phần biết.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn việc (LT1) | Cho biết một việc ở đâu và vì sao, ai quyết | Từ một dòng, thẻ hay việc liên quan / về trang Lộ trình |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-day-du | Ngăn việc | «Tóm tắt hồ sơ» tám hàng đủ chữ, không có «Số liệu làm việc» | Đọc, đóng ngăn |
| ST-ngan-chu-kho | Ngăn việc | Như trên + «Số liệu làm việc»: sáu số, commit bảy ký tự, nút sao chép, «Tìm PR» | Sao chép mã, mở PR |
| ST-ngan-o-vang | Ngăn việc | Hàng có ô vắng hiện «Chưa có» chữ phụ | Đọc phần có |
| ST-ngan-chua-co-tom-tat | Ngăn việc | «Chưa có tóm tắt hồ sơ cho việc này.»; phần còn lại như LT1 | Đọc phần kế hoạch |
| ST-ngan-khuon-cu | Trang + ngăn | Không băng cảnh báo; ngăn «Chưa có tóm tắt hồ sơ cho việc này.» | Như trên |
| ST-ngan-doan-dai | Ngăn việc (375) | Ô «Vì sao làm» 1.311 ký tự xuống dòng trọn, không tràn ngang | Cuộn ngăn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chữ của dải và mã commit mang `translate="no"`; nhãn có bản tiếng Anh và tiếng Việt.
- Số dùng chữ số đều (`tabular-nums`), token định dạng theo ngôn ngữ (`Intl.NumberFormat`); ngày «Hồ sơ cập
  nhật» qua `formatDay` như ô Mốc của LT1.
- Chữ dài xuống dòng (`wrap-anywhere` của ô thuộc tính), không cắt, không tràn ngang ở 375.
- «Tìm PR» là thẻ `<a>` mở tab mới (`rel="noreferrer noopener"`); nút sao chép có nhãn đọc màn hình.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DetailSheetSection`, `DetailSheetProperties`, `DetailSheetProperty`, `DetailSheetProse` | dùng | Họ ngăn của LT1 (`apps/app/components/detail-sheet.tsx`), giữ nếp Thoả thuận |
| `CopyValue` | dùng | Bảng «Dấu hiệu vẽ tay» cấm `navigator.clipboard` tự viết |
| `Link` (`@crm/ui/components/link`) | dùng | Liên kết chữ có vòng focus sẵn |
| `TomTatHoSo` (`apps/app/components/lo-trinh/tom-tat-ho-so.tsx`), `SoLieuLamViec` (`apps/app/components/lo-trinh/so-lieu-lam-viec.tsx`) | ghép | Hai thành phần mới cạnh `ho-so-viec.tsx`, chỉ ghép thành phần có sẵn; mọi nhãn lấy từ tệp lời |

Bậc «vẽ tay là bậc cuối»: dừng ở bậc 1 (`packages/ui` và họ `DetailSheet` sẵn có); không cần tra ReUI.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — LT1 đã dựng danh sách và ngăn chi tiết theo khung Thoả thuận; vòng này chỉ thêm
nội dung vào ngăn chi tiết, không đổi khuôn.
<!-- UX-SPEC-TEMPLATE>>> -->
