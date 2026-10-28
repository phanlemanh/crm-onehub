# SV1 `cua-toi-chi-liet-kr` — Của tôi chỉ liệt KR, cập nhật qua bộ

Hàng SV1 của `docs/plan/lo-trinh-okr.json`. Cổng Đáng: chủ kho 28/10 «build, giữ ngưỡng đề xuất»
(`_acceptance/cua-toi-chi-liet-kr/opportunity.md`).

## Vì sao

Chủ kho chốt «Lối (b)» ngày 24/10 (`docs/plan/pham-vi-okr-sau-vo-khu-2410.md` §1,
`docs/findings/2026-10-22-hop-tuan/README.md` §1, §4): cập nhật KR chỉ đi qua bộ OKR như Tability. Trên onehub
`39448ab1d` vẫn còn hai đường:

- Của tôi › «Cần cập nhật tuần này» mở bảng cập nhật hàng loạt `BangCapNhat` ngay trong trang
  (`okr/phan-can-cap-nhat.tsx`), qua nút «Cập nhật N KR», «Sửa lần gửi tuần này», hoặc tự mở khi đường dẫn mang
  `?tu=nhac` · `?tu=viec-cua-toi`.
- Tin nhắc 08:30 «N KR chờ cập nhật tuần này» dẫn tới `/okr?tu=nhac` (`apps/agent/agent/lib/nhac-ke-hoach.ts:192`);
  việc «Cập nhật» trong danh sách việc OKR dẫn tới `/okr?tu=viec-cua-toi` (`okr/viec-cua-toi.tsx:170`).

Đường còn lại — ngăn KR › «Cập nhật» mở hộp cập nhật một KR — là đường duy nhất sau vòng này.

Chủ kho 25/10 chọn Q5 (a) của `docs/findings/2026-10-25-bo-okr-gom-lan/README.md`: bỏ mục gập «Đang theo dõi (n)»
khỏi Của tôi; theo dõi xem ở Bộ OKR › Đang theo dõi. Ghi ở `ghi_chu` của hàng SV1, nên vào vòng này.

## Thiết kế

1. **Phần «Cần cập nhật tuần này» thành một danh sách.** Mỗi KR chưa có lần cập nhật của tuần là một dòng `Item`
   (bấm được cả dòng): tên KR, «đơn vị · mục tiêu», số hiện tại, «lần trước dd/mm» hoặc «chưa cập nhật lần nào»,
   mức tự tin lần trước. Không ô nhập, không nút «Cập nhật N KR», không «Sửa lần gửi». Hết KR thiếu thì một câu
   «Bạn đã cập nhật đủ … cho tuần …» — sửa một lần đã gửi thì mở KR đó. Phần vẫn theo chu kỳ đang chạy, không theo
   ô chu kỳ (`cua-toi-ba-phan` d-…-10). Giữ dấu `data-phan="can-cap-nhat"`, `data-kr`, `data-khung-xuong`,
   `ST-ctbp-loi-phan` để các bài đo không liên quan của DH3 (E11) vẫn đọc được.
2. **Bấm một KR → trang bộ OKR của nó, ngăn KR mở sẵn.** Đích:
   `/okr/bo-okr?donOkr=<khoá đơn vị của mục tiêu>&kyOkr=<chu kỳ của mục tiêu>&record=kr:<id>`. Đúng câu giao của
   hàng («ngăn KR mở trong bộ OKR của nó») và bản mẫu 24/10 (`/proto/hop-tuan-mo-dung-bo`, `5ebcd43dc`, «Bấm một KR
   để mở nó trong bộ OKR rồi cập nhật»). Đóng ngăn thì người đứng ở bộ đó; ‹ › của ngăn đi qua KR của bộ.
3. **Một hàm dựng đích, hai cách có dữ liệu.** Hàm thuần `dichKrTrongBo(slug, krId, viTri)` ở
   `apps/app/lib/okr-duong-kr.ts` dựng đích của mục 2 từ `{ donOkr, cycleId }`, hoặc `/okr?record=kr:<id>` khi vị trí
   là `null`.
   - Của tôi › «Cần cập nhật tuần này» đã có dữ liệu: `okr.capNhatTuan` trả thêm `donOkr` (khoá đơn vị của mục tiêu)
     và `cycleId` cho mỗi KR, nên dòng KR là liên kết thẳng tới đích, không qua bước chuyển hướng.
   - Lối chỉ biết `krId` (tin nhắc, việc OKR, các danh sách KR của AC-8) trỏ `/okr/kr/<keyResultId>`. Trang máy chủ
     hỏi `okr.viTriKr` → `{ donOkr, cycleId }` hoặc `null` theo quyền xem của người hỏi, rồi chuyển hướng bằng cùng
     hàm. KR không có, đã lưu trữ hay người không xem được → Của tôi với ngăn KR tự báo «không thấy», không lộ tên bộ.
   Vị trí sống ở API vì đó là chỗ biết quyền xem (`dieuKienXemMucTieu`); không có trí khôn nào (AGENTS.md: chỉ đọc
   khoá đơn vị và chu kỳ của mục tiêu). Chu kỳ là chu kỳ của mục tiêu, không phải chu kỳ đang chạy.
4. **Đường của tin nhắc và việc OKR theo số KR.** Một hàm dùng chung `duongCapNhatKr(krIds)` trong
   `packages/validation/src/okr-cap-nhat.ts`: một KR → `/okr/kr/<id>`; từ hai KR → `/okr` (Của tôi, phần đầu liệt
   đủ). `duongTrongApp` của agent (Zalo, Slack và dòng hộp thông báo web, vì hộp thông báo lưu đúng `duongDan` này)
   và nút «Cập nhật» của việc OKR cùng gọi nó. Nhãn liên kết trong tin: «mở KR» khi một KR, «mở Của tôi» khi nhiều.
5. **Liên kết cũ đã gửi** (`/okr?tu=nhac`, `/okr?tu=viec-cua-toi`) về Của tôi như thường; trang thôi đọc `tu`, không
   mở gì, không báo lỗi.
6. **Bỏ «Đang theo dõi (n)» khỏi Của tôi** (`cua-toi.tsx:64`). «Đã bỏ» vẫn ở chỗ cũ.
7. **Không xoá mã đã thôi dùng ở vòng này.** `BangCapNhat`, `CapNhatTuan` (trong `cap-nhat-tuan/cap-nhat-tuan.tsx`)
   và giá trị `nhac`, `viec-cua-toi`, `cua-toi` của `LOI_VAO` ở lại: cột `OkrCheckInSession.entry` còn hàng cũ mang
   chúng, bản gieo mẫu ghi `entry:"nhac"`, và năm hồ sơ đã ký (`cap-nhat-tuan-okr` E2 · E25, `hop-cap-nhat-lan-truoc`
   E5, `man-okr-truoc-r1` E3 · E4, `da-gui-dem-dung-kr-cho` E1–E6) đo chính các vật đó. Dọn là một hàng riêng.
8. **Hỏi-2 (chủ kho quyết):** «KR bạn phụ trách» ở Của tôi và khối «KR của tôi» ở Tổng quan hôm nay mở ngăn KR ngay
   trên trang đang đứng (SV6 vừa ký). Máy khuyên đổi cả hai sang `/okr/kr/<id>` để mọi danh sách KR của người đó mở
   cùng một cách.
9. **Vòng khép.** Hộp một KR ghi lần cập nhật với lối `sheet`; `capNhatTuan` và bước gom nhắc 08:30 phải coi lần đó là
   «đã cập nhật tuần này» bất kể lối, để KR rời danh sách và rời tin kế. Tra 28/10: `updatedThisWeek` so `weekStart`
   của lần cập nhật cuối, không lọc lối — vòng này đo nó bằng một bài trên kho thật (E15), không sửa gì nếu xanh.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: tin nhắc 08:30 (1 KR) hoặc Của tôi › dòng KR → `/okr/kr/<id>` → trang bộ OKR của KR, ngăn KR mở →
  «Cập nhật» → hộp cập nhật một KR → «Gửi cập nhật» (điểm ra: ngăn KR, số mới; quay lại Của tôi bằng nút lùi —
  KR vừa cập nhật rời phần «Cần cập nhật»).
- Biên: tin nhắc nhiều KR → Của tôi, phần đầu liệt đủ; không phụ trách KR nào → một câu; đã đủ tuần → một câu.
- Lỗi & quay lại: KR đã xoá, lưu trữ hay hết quyền → Của tôi, ngăn KR báo «không thấy KR này», đóng ngăn là về danh
  sách; tải phần hỏng → «Chưa tải được phần này» + «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Của tôi › Cần cập nhật tuần này | thấy KR nào chưa có số tuần này | thanh bên, tin nhắc nhiều KR / trang bộ của KR |
| Bộ OKR của KR + ngăn KR | đọc một KR và cập nhật nó | `/okr/kr/<id>` / hộp cập nhật, dòng vị trí |
| Hộp cập nhật một KR | ghi một lần cập nhật | nút «Cập nhật» của ngăn KR hay dòng KR / ngăn KR |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ctlk-cua-toi | Của tôi | «N KR chưa có số của tuần …, hạn …» + mỗi KR một dòng | bấm một KR |
| ST-ctlk-mo-kr | Bộ OKR + ngăn KR | trang bộ của KR, ngăn KR của đúng KR đó mở | «Cập nhật» hoặc ‹ › |
| ST-ctlk-dong-ngan | Bộ OKR | trang bộ, KR vừa mở được đánh dấu | đọc bộ, lùi về Của tôi |
| ST-ctlk-hop-cap-nhat | Hộp cập nhật | lần trước, giá trị, mức tự tin, ghi chú | gửi hoặc huỷ |
| ST-ctlk-kr-khong-thay | Của tôi + ngăn KR | «Không thấy KR này» — đã xoá, lưu trữ, hoặc hết quyền | đóng ngăn |
| ST-ctlk-da-du | Của tôi | «Bạn đã cập nhật đủ … cho tuần …» | không gì |
| ST-ctlk-khong-kr | Của tôi | «Bạn không phụ trách KR nào ở chu kỳ đang chạy.» | không gì |
| ST-ctlk-dang-tai | Của tôi | khung xương cùng hình danh sách, giữ tiêu đề phần | chờ |
| ST-ctlk-loi | Của tôi | «Chưa tải được phần này.» + «Thử lại» | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Cả dòng KR là một liên kết (`Item asChild` + `Link`): phím Tab tới từng dòng, Enter mở. Dưới `sm` số hiện tại và
  «lần trước» xuống dòng dưới tên, tên KR không bị cắt bởi cột số.
- Tên KR, tên đơn vị, tên mục tiêu mang `translate="no"` (dữ liệu người nhập).

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `Item`, `ItemGroup` (`packages/ui`) | dùng | danh sách không cần tìm, lọc hay phân trang — bảng «Dấu hiệu vẽ tay» của `docs/design.md` |
| `SectionHeading` | dùng | tiêu đề mục ngoài thẻ |
| `ConfidenceIndicator` | dùng | mức tự tin như mọi chỗ khác của khu OKR |
| ngăn KR, hộp cập nhật một KR | dùng | có sẵn (`kr-sheet.tsx`, `hop-thoai-cap-nhat-kr.tsx`), không đổi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên, không tra thêm — Tability «My focus» liệt KR, bấm KR mở ngăn chi tiết (README hop-tuan §4,
ảnh `tab/t09-my-focus.jpg`, `tab/t03-ngan-kr.jpg`); bản mẫu 24/10 của HT1 dựng đúng khuôn này.
<!-- UX-SPEC-TEMPLATE>>> -->

## Hồ sơ đã ký mà vòng này thay

Lối (b) lật hành vi mà các eval dưới đây đo. Mỗi ô khai `status: not-run` + `superseded_by:
cua-toi-chi-liet-kr#AC-<n>` (khuôn `EVAL-THAY-BOI-TEMPLATE` của kit 2.24). Sửa `evals.yaml` của hồ sơ đã ký đi qua
yêu cầu `cham-tep` cho giám sát, không tự sửa. Ô nào còn đo được vật không đổi thì giữ nguyên.

| Ô bị thay | Đo gì hôm nay | Thay bởi |
|---|---|---|
| cua-toi-ba-phan/E1 | nút «Cập nhật N», «Sửa lần gửi» ở phần 1 | cua-toi-chi-liet-kr#AC-1 |
| cua-toi-ba-phan/E2 | bấm «Cập nhật N» mở bảng tại chỗ với `entry:"cua-toi"` | cua-toi-chi-liet-kr#AC-6 |
| cua-toi-ba-phan/E3 | phiên `cua-toi` mở được | cua-toi-chi-liet-kr#AC-6 |
| cua-toi-ba-phan/E4 | `?tu=nhac`, `?tu=viec-cua-toi` tự mở phiên | cua-toi-chi-liet-kr#AC-1 |
| cua-toi-ba-phan/E6 | spec agent còn chuỗi `/okr?tu=nhac` | cua-toi-chi-liet-kr#AC-4 |
| cua-toi-ba-phan/E8 | phần 3 có nhóm «Đang theo dõi» | cua-toi-chi-liet-kr#AC-7 |
| cua-toi-ba-phan/E15 | màn: nút cập nhật trong khung nhìn, bảng mở | cua-toi-chi-liet-kr#AC-2 |
| cua-toi-ba-phan/E17 | judgment «nút để làm nó» | cua-toi-chi-liet-kr#AC-2 |
| cua-toi-ba-phan/E18 | màn: `?tu=nhac` thêm một phiên | cua-toi-chi-liet-kr#AC-1 |
| cua-toi-ba-phan/E19 | lỗi mở phiên từ nút và từ `?tu=` | cua-toi-chi-liet-kr#AC-6 |
| cua-toi-ba-phan/E20 | bảng đang điền còn khi tải lại lỗi | cua-toi-chi-liet-kr#AC-9 |
| cap-nhat-tuan-okr/E10 | một tin gom việc, liên kết `/okr?tu=nhac` | cua-toi-chi-liet-kr#AC-4 |
| cap-nhat-tuan-okr/E13 | màn: liên kết `/okr?tu=viec-cua-toi` | cua-toi-chi-liet-kr#AC-5 |
| cap-nhat-tuan-okr/E16 | màn: dòng `[data-kr]` của bảng phần 1 | cua-toi-chi-liet-kr#AC-1 |
| okr-cua-toi-tach-theo-doi/E7 | nhóm «Đang theo dõi (n)» ở Của tôi | cua-toi-chi-liet-kr#AC-7 |
| okr-cua-toi-tach-theo-doi/E8 | như trên | cua-toi-chi-liet-kr#AC-7 |
| okr-cua-toi-tach-theo-doi/E10 | như trên | cua-toi-chi-liet-kr#AC-7 |
| okr-cua-toi-tach-theo-doi/E11 | màn: `[data-nhom-dang-theo-doi]` | cua-toi-chi-liet-kr#AC-7 |
| okr-cua-toi-tach-theo-doi/E12 | như trên | cua-toi-chi-liet-kr#AC-7 |
| okr-cua-toi-tach-theo-doi/E13 | như trên | cua-toi-chi-liet-kr#AC-7 |
| okr-cua-toi-tach-theo-doi/E15 | đột biến «g» tìm `{nhomTheoDoi}` | cua-toi-chi-liet-kr#AC-7 |
| vo-khu-muc-tieu/E6 | hàng 3: bảng mở, URL bỏ `tu` | cua-toi-chi-liet-kr#AC-2 |
| vo-khu-muc-tieu/E10 | màn thanh bên «tu-nhac» | cua-toi-chi-liet-kr#AC-1 |
| vo-khu-muc-tieu/E11 | chạy cả tệp DOM của DH3 | cua-toi-chi-liet-kr#AC-1 |
| hop-thong-bao-tren-web/E3 | bản chụp tin trước TB1 mang `/okr?tu=nhac` | cua-toi-chi-liet-kr#AC-4 |
| hop-thong-bao-tren-web/E10 | như trên | cua-toi-chi-liet-kr#AC-4 |
| thong-bao-mot-nguon-nhieu-kenh/E2 | như trên | cua-toi-chi-liet-kr#AC-4 |
| bam-kr-mo-chi-tiet-kr/E1 | bấm tên KR ở «KR bạn phụ trách» mở ngăn tại chỗ | cua-toi-chi-liet-kr#AC-8 |

Bản chụp `apps/agent/test/fixtures/tin-nhac-truoc-tb1.json` mà ba ô cuối so: sửa nó thì `bam-kr-mo-chi-tiet-kr` E6
(«ảnh chụp lịch sử không đổi» so với `origin/onehub`) đỏ trên nhánh tới khi gộp. Đây là việc của `cham-tep` ở S3:
giám sát chọn giữa giữ bản chụp (ba ô trên thay bằng AC-4) và đổi bản chụp kèm dòng sổ `fix` cho bkr/E6.

Hai thước đã ký đo nhiều lối, nên sửa thước chứ không thay cả ô (qua `cham-tep`): `bam-kr-mo-chi-tiet-kr/E7`
(bảng `cho-mo-ban-ghi.json` bỏ dòng `phan-kr-phu-trach.tsx`, chiều đỏ chuyển sang `viec-cua-toi.tsx`) và
`ngan-kr-mot-cho/E1` (ma trận chín lối bỏ ô «Của tôi» — khối «KR của tôi» nay đo ở `ctlk-phu-trach` — còn tám lối).
Ca kiểm của ô đã bị thay gỡ khỏi tệp kiểm theo tiền lệ `3d0f64e55`.

Thước thứ ba sửa theo `cham-tep` V4-15 (29/10): `hop-tuan-tren-bang/E6` nhánh Của tôi → thay bởi
cua-toi-chi-liet-kr#AC-8. Ca `htb-nguon` đo «bấm KR từ chỗ khác mở ngăn đúng thứ tự mục tiêu» qua hai lối thật; lối
Của tôi nay là liên kết sang bộ OKR chứ không mở ngăn tại chỗ, nên bỏ khỏi `LOI_THAT`, còn lối Trang đơn vị và hai
nhánh còn lại của ca giữ nguyên kỳ vọng. Ô E6 vẫn chạy, không khai `status: not-run`.

Hai bài không thuộc hồ sơ nào sửa thẳng: `apps/app/test/viec-okr-cua-toi.dom.tsx` (href `?tu=viec-cua-toi`) và
`messages-guard.spec.ts` (khoá chữ thôi dùng: `baPhan.capNhatN`, `baPhan.suaLanGui`, `khoiMucTieu.nhomDangTheoDoi`).
Xoá khoá chữ ở `apps/app/lib/messages/okr.ts` là xoá dòng của tệp chữ chung → `cham-tep`.
