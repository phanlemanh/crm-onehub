# Cập nhật tuần OKR — thiết kế (lượt 4 lộ trình OKR)

Viết 2026-09-25. Hồ sơ `_acceptance/cap-nhat-tuan-okr/` (Cổng Đáng ký: build,
keep, ngưỡng chốt). Đứng trên lượt 3 (#140, `739c8701`): bảng `okr*`, module
`apps/api/src/okr`, khu `apps/app/app/(app)/[slug]/okr`, sheet mục tiêu.

## 1. Câu giao và ranh

«Sáng thứ Hai tôi được nhắc và cập nhật mọi KR của mình trong một phút.»

Năm việc, theo mục 5 lộ trình:

1. **Màn «Cập nhật tuần của tôi»** — tab thứ tư của khu OKR, gom mọi KR tôi phụ
   trách, điền sẵn số tuần trước; gửi một lượt ghi giá trị, mức tự tin (Cao · Vừa ·
   Thấp) và một dòng ghi chú cho từng KR.
2. **Bảng lần cập nhật** chỉ thêm: người ghi, ghi hộ, kênh, lối vào, số giây từ mở
   tới gửi đo ở máy chủ.
3. **Nhắc** — loại việc OKR mới trong **cùng một tin** buổi sáng; thẻ «việc của
   tôi» đọc **cùng một hàm**. KR im quá N ngày nhắc người phụ trách, rồi trưởng
   đơn vị. Báo khi được giao KR, được nhắc tên, mục tiêu đang theo dõi có việc mới.
4. **Bình luận, nhắc tên, theo dõi** trên mục tiêu và KR (tab mới của sheet mục tiêu).
5. **Chuyển KR và mục tiêu khi người nghỉ** ở màn Thành viên.

Luật đi kèm (điều phối, Cổng Đáng 2026-09-25):

- Vai «chỉ OKR» thấy thẻ OKR trên trang Tổng quan riêng của họ.
- Màn cập nhật tuần và thẻ «việc của tôi» chạy **đầy đủ cho người chưa nối Zalo
  hay Slack**: nhắc qua kênh chỉ là một lối vào thêm, không phải điều kiện.

## 2. Dữ liệu — năm bảng mới, liền cuối `schema.prisma`

| Bảng | Cột | Ghi chú |
|---|---|---|
| `OkrCheckInSession` (`okrCheckInSession`) | `id`, `userId`, `entry`, `openedAt` (máy chủ, `now()`), `submittedAt?`, `seconds?` | Một lần mở màn (hoặc hộp cập nhật một KR) là một phiên. Gửi thành công đóng phiên: `submittedAt` và `seconds = ⌊submittedAt − openedAt⌋` tính ở máy chủ. Trung vị «một lần cập nhật» đọc bảng này |
| `OkrCheckIn` (`okrCheckIn`) | `id`, `keyResultId` → KR (Restrict), `sessionId` → phiên, `weekStart` (date, thứ Hai giờ VN), `value` Decimal(18,4), `confidence`, `note` (≤ 200), `authorUserId`, `ownerUserId` (người phụ trách lúc ghi), `onBehalf` (bool), `channel` (`web`), `createdAt` | **Chỉ thêm**: không thủ tục sửa hay xoá. Gửi lại trong tuần thêm dòng mới; «lần mới nhất của tuần» là dòng có `createdAt` lớn nhất |
| `OkrComment` (`okrComment`) | `id`, `objectiveId` → mục tiêu (Restrict), `keyResultId?` → KR (SetNull), `body` (1–2000), `authorUserId`, `createdAt` | Chỉ thêm ở lượt này |
| `OkrMention` (`okrMention`) | `commentId` → bình luận (Cascade), `userId`; khoá (`commentId`,`userId`) | Người được nhắc là thành viên đang hoạt động, kiểm ở máy chủ |
| `OkrFollow` (`okrFollow`) | `objectiveId` → mục tiêu (Cascade), `userId`, `createdAt`; khoá (`objectiveId`,`userId`) | Bấm lần nữa để bỏ = xoá dòng |

- Người (`userId`, `authorUserId`…) là chuỗi không khoá ngoại, như `OkrTrail.actorUserId`
  — không thêm quan hệ ngược nào lên `User`. Quan hệ ngược chỉ thêm trên
  `OkrKeyResult` và `OkrObjective` (trường Prisma, không cột SQL).
- `migration` chỉ `CREATE TABLE`, `CREATE INDEX`, `ADD CONSTRAINT … FOREIGN KEY`.
- KR đã có lần cập nhật thì `removeKeyResult` từ chối bằng câu ghim («KR đã có lần
  cập nhật — không xoá được, hãy bỏ mục tiêu hoặc đổi tên KR»), không để lỗi khoá
  ngoại thành 500. KR chưa có lần cập nhật xoá như lượt 3.
- Danh mục mới là Zod enum trong `packages/validation` (`okr-cap-nhat.ts`,
  `okr-trao-doi.ts`): `MUC_TU_TIN = cao | vua | thap`, `LOI_VAO = nhac | viec-cua-toi
  | tab | sheet`, `KENH_CAP_NHAT = web` (zalo, slack để lượt 10). Hành động vết thêm
  `cap-nhat-tuan`, `binh-luan`, `theo-doi`, `bo-theo-doi`, `chuyen-viec`.
- Tuần = thứ Hai → Chủ nhật theo giờ Việt Nam. Hàm `dauTuanVN(now)` đặt cạnh
  `dauNgayVN` trong `@crm/db/onboarding-nhac` để agent và API dùng chung.

## 3. Thủ tục (`okr.*`, `PhamViOkrMiddleware`)

| Thủ tục | Loại | Ai | Làm gì |
|---|---|---|---|
| `okr.capNhatTuan` | query | mọi thành viên | KR tôi phụ trách, mục tiêu `cong-bo`, chu kỳ `dang-chay`: tên KR, mục tiêu, đơn vị, kiểu, đơn vị đo, đích, giá trị hiện tại, lần cập nhật gần nhất (giá trị, mức tự tin, lúc), cờ «đã cập nhật tuần này», hạn (ngày cập nhật của chu kỳ) |
| `okr.moCapNhat` | mutation | mọi thành viên | tạo phiên `{entry}`, trả `sessionId` |
| `okr.guiCapNhat` | mutation | người phụ trách, hoặc người sửa được đơn vị (ghi hộ) | `{sessionId, items[{keyResultId, value, confidence, note}]}` — cả lô một giao dịch; mỗi mục một dòng `OkrCheckIn`, `currentValue` của KR đổi theo, một dòng vết `cap-nhat-tuan` (trước → sau giá trị, mức tự tin); đóng phiên, trả `{written, seconds}` |
| `okr.viecCuaToi` | query | mọi thành viên | các việc OKR của người gọi — **đúng** phần OKR của `viecCanNhac(db, {now, userId})` |
| `okr.comments` | query | mọi thành viên | bình luận của một mục tiêu, cũ → mới, kèm người nhắc tên |
| `okr.addComment` | mutation | mọi thành viên | `{objectiveId, keyResultId?, body, mentionUserIds[]}`; một dòng vết `binh-luan` (chỉ mã, không nội dung) |
| `okr.follow` | mutation | mọi thành viên | `{objectiveId, on}`; bật hai lần không thêm dòng; vết `theo-doi` / `bo-theo-doi` khi đổi thật |
| `okr.transferPreview` | query | quản trị | `{fromUserId}` → `{kr, mucTieu}` ở chu kỳ còn ghi được |
| `okr.transferWork` | mutation | quản trị | `{fromUserId, toUserId}` → chuyển trong một giao dịch, một dòng vết `chuyen-viec` mỗi bản ghi |

- `okr.objective` thêm `following` (tôi có theo dõi không) và `followerCount`;
  `okr.mine` thêm mục tiêu tôi theo dõi (cờ `theoDoi`).
- Mọi đầu vào parse ở biên bằng Zod `.strict()`: máy khách **không có trường nào**
  để khai số giây hay người ghi.
- Kiểm theo kiểu: mốc nhận 0 hoặc 1; phần trăm 0–100; bốn kiểu số còn lại nhận số
  hữu hạn. Mức tự tin bắt buộc. Ghi chú ≤ 200 ký tự.
- Mục tiêu nháp hoặc đã bỏ, chu kỳ không ở pha `dang-chay`: từ chối cả lô.
- Màn mở phiên đúng một lần mỗi lần vào, ngay khi danh sách KR hiện (không lúc bấm
  gửi); «Gửi lại» sau lỗi dùng lại phiên đó.
- Phiên: của người khác → 403; đã gửi xong → 400 «phiên đã gửi — mở lại màn để gửi
  lần mới»; gửi hỏng (lô bị từ chối) không đóng phiên, nên «Gửi lại» dùng cùng phiên.

## 4. Quyền

| Việc | Được | Không được |
|---|---|---|
| Gửi cập nhật cho KR | người phụ trách KR (`onBehalf = false`); người sửa được đơn vị của mục tiêu theo `OkrAccessService.suaDuocDonVi` (`onBehalf = true`) | mọi người khác, kể cả người phụ trách KR khác cùng mục tiêu |
| Bình luận, nhắc tên, theo dõi | mọi thành viên đọc được OKR, kể cả vai «chỉ OKR» | — |
| Nhắc tên ai | thành viên đang hoạt động | người đã rời workspace, mã lạ |
| Chuyển KR/mục tiêu | quản trị (`yeuCauQuanTri`, cùng luật hộp chuyển việc 30 ngày) | mọi người khác |

Vai «chỉ OKR» đi qua `PhamViOkrMiddleware` như lượt 3; không cụm nào mới khai phạm vi
khác. Ma trận `apps/api/test/vai-chi-okr.spec.ts` chạy lại xanh.

## 5. Nhắc buổi sáng và thẻ «việc của tôi» — một hàm

`viecCanNhac(db, {now, userId?})` (`@crm/db/onboarding-nhac`) nay trả cả việc kế
hoạch lẫn việc OKR; phần OKR nằm ở `@crm/db/okr-nhac` (`viecOkrCanNhac`), gọi từ
trong `viecCanNhac`. Agent (`lenLichNhac`, `chayNhac`) và API (`okr.viecCuaToi`,
thẻ kế hoạch ở `dashboard`) đều đọc hàm đó, nên tin và thẻ không nói khác nhau.

| Loại (`loai`) | Ai nhận | Khi nào | Dòng trong tin / thẻ | Mở |
|---|---|---|---|---|
| `okr-cap-nhat` | người phụ trách | từ ngày cập nhật của chu kỳ (`updateWeekday`, giờ VN) tới hết Chủ nhật, còn KR chưa có lần cập nhật trong tuần và công bố trước hôm nay | «N KR chờ cập nhật tuần này» (một dòng, gom KR) | `/okr/cap-nhat-tuan?tu=nhac` |
| `okr-kr-im` | người phụ trách | KR im ≥ `imNgay` (14) | «KR «X» im N ngày» | `/okr?record=objective:<id>` |
| `okr-kr-im` | trưởng đơn vị | KR im ≥ `imNgayTruong` (21) — trưởng phòng ban, không có thì trưởng bộ phận; không gửi trùng cho người phụ trách | «KR «X» của <người> im N ngày» | như trên |
| `okr-duoc-giao` | người mới phụ trách | vết `tao-kr`/`sua-kr`/`tao`/`sua`/`chuyen-viec` trong 24 giờ qua đưa KR hay mục tiêu về tay mình, người làm khác mình | «Bạn phụ trách KR «X»» | như trên |
| `okr-nhac-ten` | người được nhắc | bình luận trong 24 giờ qua, người viết khác mình | «<người> nhắc tên bạn ở «X»» | như trên |
| `okr-theo-doi` | người theo dõi | mục tiêu mình theo dõi có lần cập nhật hoặc bình luận của người khác trong 24 giờ qua | ««X» có N cập nhật, M bình luận mới» | như trên |

- «Im» = số ngày VN từ lần cập nhật gần nhất, không có thì từ ngày công bố. Chỉ mục
  tiêu `cong-bo` ở chu kỳ `dang-chay`.
- Hằng số ở `OKR_NHAC` (`@crm/db/okr-nhac`): `imNgay`, `imNgayTruong`,
  `suKienGio: 24`. Giờ gửi, trần 10 việc, trần 2.000 ký tự Zalo dùng lại `NHAC` và
  `ZALO.tranKyTu` — trần áp **chung** cho cả tin, không trần riêng cho OKR.
- Thứ tự trong tin: `okr-cap-nhat` đứng đầu (một dòng, là việc chính của sáng thứ
  Hai, không để bị trần 10 cắt mất); sau đó bốn loại kế hoạch như cũ; rồi bốn loại
  OKR còn lại.
- Chào: tin chỉ có việc kế hoạch giữ nguyên câu cũ («… việc 30 ngày đầu …»); tin
  có việc OKR dùng «Chào X, sáng nay có N việc cần bạn để ý.»
- `payload.muc` / `payload.daGui` là hợp các khuôn: kế hoạch giữ `{loai, planId,
  stepId?}`; OKR là `{loai, krIds[]}` (cập nhật), `{loai, keyResultId}` (im, giao
  KR), `{loai, objectiveId}` (giao mục tiêu, theo dõi), `{loai, commentId}` (nhắc
  tên) — chỉ mã. Hai câu truy vấn của `may-nhac-truoc-nguoi` lọc `loai =
  'buoc-sap-han'` nên không đổi.
- Người nhận phải là thành viên đang hoạt động (cùng lọc `member` như việc kế hoạch).
- Người **chưa nối kênh**: `chayNhac` đóng `khong-slack` / `khong-khop` như hôm nay,
  không gửi gì; thẻ và màn vẫn đọc đủ việc của họ.

**Thẻ «việc của tôi» phần OKR** — một thành phần client `ViecOkrCuaToi` trong khu
`okr/`, đọc `okr.viecCuaToi`, hiện ở ba chỗ:

- Tổng quan của vai đầy đủ (`dashboard-summary.tsx` — thẻ riêng cạnh thẻ việc
  hiện có; thẻ việc kế hoạch không đổi).
- Tổng quan của vai «chỉ OKR» (`tong-quan-chi-okr.tsx`) — lần đầu trang này có dữ
  liệu, qua phạm vi `okr`, không qua `dashboard`.
- Khối «Việc của tôi» đầu tab «Của tôi» (bản mẫu `ViecCanLam`).

Mỗi dòng dẫn thẳng vào đích: dòng cập nhật → màn «Cập nhật tuần» với `?tu=viec-cua-toi`;
dòng khác → sheet mục tiêu.

## 6. Bình luận, nhắc tên, theo dõi — trên sheet mục tiêu

- Tab mới «Trao đổi» (thứ tư, sau «Vết»): danh sách bình luận cũ → mới (người, lúc,
  chip KR nếu gắn, tên người được nhắc tô `font-medium`), rồi khung soạn: ô chữ
  (`Textarea`), chọn KR (tuỳ chọn, `Select` các KR của mục tiêu), chọn người nhắc
  tên (`Combobox` một lựa chọn, mỗi lần chọn thêm một chip `Badge` có nút gỡ; chỉ
  thành viên đang hoạt động), nút «Gửi».
- Nút «Theo dõi» / «Đang theo dõi» ở phần hành động đầu sheet, cho **mọi người**
  (hôm nay phần đó chỉ hiện với người sửa được — nút theo dõi đứng riêng).
- Menu «…» của từng dòng KR thêm «Cập nhật» cho người phụ trách và người sửa được
  đơn vị; mở hộp cập nhật một KR (cùng ba ô như màn tuần, cùng thủ tục, `entry =
  sheet`). Người không phải người phụ trách thấy dòng «Bạn ghi hộ <tên>».

## 7. Chuyển KR và mục tiêu khi người nghỉ

Hộp «Chuyển việc 30 ngày» đã ký ở hồ sơ `moi-phia-deu-thay-ke-hoach`, và bài đo của
hồ sơ đó ghim đúng hai con số và đúng một lời gọi `onboarding.transferWork`. Ghép OKR
vào hộp ấy là đổi một hợp đồng đã ký. Lượt này thêm **mục riêng «Chuyển OKR…»** ngay
dưới mục đó trong cùng menu «…» của hàng thành viên, hộp cùng hình (xem trước hai
con số, chọn người nhận, xác nhận), gọi `okr.transferPreview` / `okr.transferWork`.

- Chuyển: KR có `ownerUserId = người đi` và mục tiêu cấp đơn vị có `ownerUserId =
  người đi`, ở chu kỳ pha `lap-ke-hoach` hoặc `dang-chay`. Mục tiêu cá nhân của người
  đi không chuyển. Lần cập nhật cũ giữ nguyên người ghi. Người đi rời người tham gia.
- Một giao dịch; mỗi bản ghi một dòng vết `chuyen-viec` (trước → sau người phụ trách).
- Sau chuyển, `viecCanNhac` của người đi không còn việc OKR; người nhận có dòng
  `okr-duoc-giao` trong 24 giờ.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tin nhắc sáng thứ Hai hoặc thẻ «việc của tôi» → màn «Cập nhật tuần» (số đã điền sẵn) → sửa số đã đổi, chọn mức tự tin, ghi một dòng → «Gửi N cập nhật» → tóm tắt đã gửi kèm số giây (điểm ra: «Về Của tôi»).
- Biên: không phụ trách KR nào đang chạy (rỗng); KR mốc (hai nút Chưa xong / Xong); chỉ chọn mức tự tin cho vài KR (gửi phần đã chọn, phần còn lại chờ); người chưa nối kênh (màn và thẻ như mọi người); trưởng đơn vị ghi hộ từ sheet.
- Lỗi & quay lại: số không hợp lệ → báo ngay dưới ô, nút gửi khoá; máy chủ từ chối hoặc không trả lời → cảnh báo trên danh sách, mọi ô còn nguyên, nút thành «Gửi lại»; tải danh sách hỏng → `Empty` có «Thử lại».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cập nhật tuần của tôi (`/okr/cap-nhat-tuan`) | ghi số, mức tự tin, ghi chú cho mọi KR của tôi trong một lượt | tin nhắc, thẻ việc, tab / Của tôi |
| Thẻ việc OKR (Tổng quan ×2, Của tôi) | cho biết hôm nay OKR cần tôi làm gì | Tổng quan / màn cập nhật hoặc sheet mục tiêu |
| Tab «Trao đổi» của sheet mục tiêu | hỏi, trả lời, nhắc tên người trên mục tiêu và KR | sheet mục tiêu / cùng sheet |
| Hộp cập nhật một KR | ghi một lần cập nhật (hoặc ghi hộ) từ sheet | menu KR / sheet |
| Hộp «Chuyển OKR…» | giao KR và mục tiêu của người nghỉ cho một người | menu hàng ở Thành viên / Thành viên |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-capnhat-dangtai | Cập nhật tuần | khung xương cùng hình danh sách | chờ |
| ST-capnhat-rong | Cập nhật tuần | `Empty` «Tuần này bạn không có KR nào cần cập nhật» + câu người tham gia không phải cập nhật | «Về Của tôi» |
| ST-capnhat-loi | Cập nhật tuần | `Empty` «Không lấy được danh sách KR của bạn. Chưa có gì bị mất» + «Thử lại» | Thử lại |
| ST-capnhat-dangdien | Cập nhật tuần | danh sách KR, số điền sẵn, «Tuần trước: …», thanh gửi dính đáy đếm «Đã chọn mức tự tin a/b KR» | sửa, chọn, gửi |
| ST-capnhat-sokhonghople | Cập nhật tuần | ô đỏ «Nhập một số, ví dụ 3,5», thanh gửi «1 KR có số chưa hợp lệ», nút khoá | sửa ô |
| ST-capnhat-danggui | Cập nhật tuần | ô khoá, nút «Đang gửi…» có spinner | chờ |
| ST-capnhat-loigui | Cập nhật tuần | `Alert` đỏ «Chưa gửi được» + câu máy chủ, ô còn nguyên, nút «Gửi lại N cập nhật» | Gửi lại |
| ST-capnhat-dagui | Cập nhật tuần | «Đã gửi N cập nhật lúc HH:MM · mất S giây», danh sách tóm tắt | «Về Của tôi» |
| ST-viecokr-coviec | Thẻ việc OKR | dòng theo loại, mỗi dòng một nút đích | bấm dòng |
| ST-viecokr-rong | Thẻ việc OKR | «Hôm nay OKR không cần gì từ bạn» | — |
| ST-viecokr-loi | Thẻ việc OKR | câu lỗi + «Thử lại» | Thử lại |
| ST-traodoi-rong | Tab Trao đổi | «Chưa có trao đổi nào» + khung soạn | viết |
| ST-traodoi-codulieu | Tab Trao đổi | bình luận cũ → mới, chip KR, tên được nhắc | viết tiếp |
| ST-traodoi-loigui | Tab Trao đổi | câu lỗi dưới khung soạn, chữ còn nguyên | gửi lại |
| ST-chuyenokr-xemtruoc | Hộp Chuyển OKR | «<tên> đang phụ trách a KR và b mục tiêu ở chu kỳ đang chạy» + chọn người nhận | xác nhận |
| ST-chuyenokr-khongviec | Hộp Chuyển OKR | «<tên> không phụ trách KR hay mục tiêu nào đang chạy», nút xác nhận khoá | đóng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô giá trị: `inputMode="decimal"`, nhận cả dấu phẩy thập phân; kiểm ngay khi gõ; KR mốc dùng hai nút.
- Mức tự tin là `ToggleGroup` một lựa chọn, không chọn sẵn; «Tuần trước: vừa» là `FieldDescription`.
- Ghi chú ≤ 200 ký tự (`maxLength`), bình luận 1–2000.
- Thanh gửi dính đáy có `aria-live="polite"`; ở 390 các ô xếp dọc, `ToggleGroup` trải đủ bề ngang (`w-full`, `flex-1` ở chỗ gọi như bản mẫu).
- Tên KR, mục tiêu, người, đơn vị đo, nội dung bình luận mang `translate="no"`.
- Mở màn gọi `okr.moCapNhat` đúng một lần; `?tu=` trên URL chọn `entry`, vắng thì `tab`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `InputGroup`, `Input`, `Textarea` | dùng | ô nhập theo `docs/design.md` |
| `ToggleGroup` | dùng | mức tự tin và KR mốc — bản mẫu đã duyệt |
| `Item` (danh sách KR, dòng việc, bình luận) | mở rộng — cài `item` của shadcn vào `packages/ui` (bậc 2, tệp mới, `--dry-run` trước) | thay `ul divide-y` của bản mẫu — bảng «Dấu hiệu vẽ tay»; `docs/settings.md` đợt 3 cũng cần nó |
| `StatusIndicator` | dùng | chấm mức tự tin kèm chữ |
| `Alert`, `Empty`, `Spinner`, `Skeleton`, `Card` | dùng | bốn trạng thái |
| `Combobox`, `Badge`, `Select`, `Dialog`, `DropdownMenu` | dùng / ghép | nhắc tên (Combobox một lựa chọn + chip), chọn KR, hộp một KR, hộp chuyển OKR, menu KR |
| `DetailSheet` tab | dùng | tab «Trao đổi» trong khung record sheet có sẵn |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: màn chính là một danh sách KR đồng dạng điền trong một lượt, có thanh gửi dính đáy — bản mẫu đã duyệt 2026-09-24 dựng đúng như vậy; không có khuôn thứ hai khả dĩ nên không tra thêm. Bình luận nằm trong sheet mục tiêu (khuôn danh-sách-chi-tiết của lượt 3).
<!-- UX-SPEC-TEMPLATE>>> -->

## 8. Bậc thang «Vẽ tay là bậc cuối» — từng khối

| Khối (tệp dự kiến) | Bậc dừng | Đã tra |
|---|---|---|
| `okr/cap-nhat-tuan/page.tsx`, `cap-nhat-tuan.tsx` — màn cập nhật | 1 (`packages/ui`) + `Item` ở bậc 2 | `Field`, `ToggleGroup`, `InputGroup`, `Alert`, `Empty` có sẵn; `item` chưa có trong `packages/ui/src/components` → cài bản shadcn gốc |
| `okr/viec-cua-toi.tsx` — thẻ việc OKR | 1 + `Item` (bậc 2) | `Card`, `Button` |
| `record-sheet/objective-trao-doi.tsx` — tab Trao đổi | 1 + `Item` (bậc 2) | `Textarea`, `Combobox` một lựa chọn + `Badge` (không có combobox nhiều lựa chọn; `token-field` là ô soạn chat), `Select` |
| `okr/hop-thoai-cap-nhat-kr.tsx` — hộp một KR | 1 | `Dialog`, cùng ô với màn tuần |
| `settings/members/chuyen-okr-dialog.tsx` | 1 | cùng hình `chuyen-viec-dialog.tsx` |

Không khối nào dừng ở bậc 5. Biến thể còn thiếu ghi ở bản mẫu (cỡ chạm ≥ 44px của
`ToggleGroup`, cặp thành phần mức tự tin / tình trạng) là việc lượt 5; lượt này
không sửa tệp có sẵn nào trong `packages/ui`, chỉ thêm `item.tsx`.

## 9. Giả định chờ Cổng Phạm vi

1. Tuần là thứ Hai → Chủ nhật giờ VN; việc «cập nhật» hiện từ ngày cập nhật của
   chu kỳ tới hết Chủ nhật (tin và thẻ nhắc mỗi sáng tới khi xong).
2. Ngưỡng im: 14 ngày nhắc người phụ trách, 21 ngày thêm trưởng đơn vị.
3. Cửa sổ sự kiện (giao, nhắc tên, theo dõi) là 24 giờ, cho cả tin lẫn thẻ.
4. Chuyển OKR là mục riêng «Chuyển OKR…» cạnh «Chuyển việc 30 ngày…», không ghép
   vào hộp đã ký (mục 7).
5. Ghi hộ: người sửa được đơn vị (trưởng; quản trị ở cấp OneHub) ghi được cho KR của
   người khác, dòng mang `onBehalf = true`.
6. Chỉ cập nhật được KR của mục tiêu đã công bố, ở chu kỳ pha «Đang chạy».
7. Ô «giá trị hiện tại» của hộp thoại KR (lượt 3) giữ nguyên; đổi số qua đó không
   phải lần cập nhật tuần và không được đếm (Later — mở vòng riêng nếu số đo cần).
8. Thẻ việc OKR hiện cả khi rỗng, ở cả hai trang Tổng quan.
9. Mẫu số ngưỡng «≥ 80% KR mỗi tuần trên mọi phòng ban» là mọi KR đang chạy (mọi cấp,
   kể cả cá nhân), xếp vào phòng ban chính của người phụ trách; đếm KR khác nhau, không
   đếm dòng — một KR gửi hai lần trong tuần vẫn là một.

## 10. Hồ sơ đã ký bị chạm

Danh sách dưới là bản khai tay lúc S1; tập thật do máy rút (`rang/ho-so-bi-cham.mjs`,
E21: lệnh và `paths` của mọi eval máy ở mọi hồ sơ đã ký, giao với `diff` của lượt).
Cuối S3 chép tập máy rút vào `HO_SO_BI_CHAM` của `rang/cau-hinh.mjs` và sửa danh sách
này cho khớp; E21 đỏ khi hai bên lệch. Mọi hồ sơ trong tập được ghim lại bằng làn
eval sau khi lượt lên `onehub`.


- `vai-chi-okr` — thủ tục mới dưới alias `okr` (ma trận chạy lại, danh sách không đổi).
- `dat-okr-trong-crm` — sheet mục tiêu thêm tab và nút, `okr.objective` thêm trường,
  `removeKeyResult` thêm một câu từ chối; bài đo lượt 3 phải xanh nguyên.
- `nhac-qua-zalo`, `may-nhac-truoc-nguoi`, `moi-phia-deu-thay-ke-hoach` — dựng tin và
  khuôn `payload` đổi; tin chỉ có việc kế hoạch giữ nguyên chữ.
- `khung-dieu-huong` (thanh tab OKR ba → bốn), nếu bài đo đếm tab.

## 11. Luật và skill đã đọc

`AGENTS.md` (bảng chỉ mục), `CONTEXT.md` (Cập nhật tuần, Mức tự tin, Người phụ trách
(OKR), Nhắc buổi sáng, Trưởng đơn vị, Phạm vi dữ liệu, vai «chỉ OKR»), `docs/api.md`
(tRPC, phạm vi, OKR, freshness), `docs/agent.md` (hai làn, Nhắc buổi sáng, Zalo),
`docs/design.md` (kể cả «Vẽ tay là bậc cuối», «Dấu hiệu vẽ tay»), `docs/settings.md`,
`docs/reui.md`, lộ trình OKR mục 1–10, hồ sơ `ban-mau-okr`, `dat-okr-trong-crm`,
`may-nhac-truoc-nguoi`, `moi-phia-deu-thay-ke-hoach`; skill `morphological-scan`,
`web-design-guidelines` (chuẩn Vercel Web Interface Guidelines, nạp làm đối trọng).
Skill kho sẽ nạp ở S3: `.agents/skills/nestjs-trpc`, `prisma-database-setup`, `eve`,
`shadcn`, `nuqs`.
