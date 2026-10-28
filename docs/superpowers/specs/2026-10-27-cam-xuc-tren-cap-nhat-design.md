# Cảm xúc và trả lời trên từng lần cập nhật — thiết kế (HT5 `cam-xuc-tren-cap-nhat`)

Hàng HT5 của `docs/plan/lo-trinh-okr.json`, đợt `okr-hop-tuan-2210`, dãy V3 đợt `vo-khu-muc-tieu`. Hạng T3 (thêm bảng ở
`packages/db/prisma`). Cổng Đáng ký `build` ngày 27/10 (`_acceptance/cam-xuc-tren-cap-nhat/opportunity.md`). Đứng trên
VK12 `cap-nhat-gan-day` (gộp `dd53c3870`, #574).

## Ý định và vì sao

Một thành viên đọc lần cập nhật của đồng đội trước buổi họp tuần, muốn nói «đã đọc, tốt» hay «cố lên» mà không phải viết
một câu. Hôm nay cách duy nhất là trả lời, và trả lời chỉ đặt được dưới lần mới nhất của mỗi KR (VK12, D5 lối a). Người
cập nhật không biết lần cập nhật của mình có ai đọc. Tability có Reply và Like trên từng check-in ở Recent updates, ngăn KR
và trình chiếu (`docs/findings/2026-10-22-hop-tuan/README.md` §5–§6).

Vòng này làm hai việc trên **một khoá chung là lần cập nhật** (`OkrCheckIn`):

1. **Cảm xúc.** Chạm một trong bốn cảm xúc cố định dưới một lần cập nhật để thả; chạm lại để gỡ. Chip hiện số người và
   ai đã thả. Hiện ở ba chỗ: Cập nhật gần đây, thẻ con Họp tuần của bộ OKR, ngăn KR.
2. **Trả lời trên từng lần** (D5, chủ kho 24/10). Mỗi dòng của Cập nhật gần đây có ô trả lời, không riêng lần mới nhất.
   Lần trả lời mới mang `checkInId` (D6), nên dòng nào hiện đúng trả lời của dòng ấy.

## Mục tiêu

- Một lần thả hiện ở cả ba chỗ trong cùng phiên, không tải lại trang; thả lại thì gỡ; người không xem được mục tiêu không
  thấy và không thả được (`bat_khi` của HT5).
- Người cập nhật thấy ai đã thả trên chính lần cập nhật của mình.
- Trả lời gắn đúng lần cập nhật; trả lời cũ của VK12 vẫn nằm đúng chỗ người đã thấy nó.
- Bộ OKR mẫu có cảm xúc và trả lời trên nhiều lần cập nhật, qua đường ghi thật, đủ để đo tỷ lệ của Cổng Giá trị.

## Không làm

- Trình chiếu (HT-C1) — chưa có màn; cảm xúc lên đó khi HT-C1 dựng.
- Báo tin cho người cập nhật khi có cảm xúc (tin nhắc buổi sáng, Zalo). Câu giao chỉ hứa «thấy ai đã thả» trên màn.
- Ô trả lời ở Họp tuần và ngăn KR — trả lời trên từng lần sống ở Cập nhật gần đây (D5 là Hỏi-1 lối b của VK12).
- Cảm xúc trên bình luận, trên mục tiêu, trên KR — chỉ trên lần cập nhật.
- Ô chọn emoji tuỳ ý — bộ cố định (Hỏi-1).
- Dùng `OkrGhiNhan` — đó là lời nhắn có người nhận, không phải một chạm (ghi chú hàng HT5).

## Điều làm vòng này hỏng dù chạy đúng

- Ba chỗ đọc ba câu hỏi khác nhau về «ai đã thả» (mỗi màn tự gom) — một số ở feed, số khác ở ngăn KR.
- Một đường đọc mới quên `dieuKienXemMucTieu` — người xem hẹp thấy tên người thả trên OKR giới hạn.
- Trả lời cũ của VK12 biến mất khỏi Cập nhật gần đây sau migration (khoá mới mà dữ liệu cũ không có khoá).
- Mỗi dòng một truy vấn cảm xúc — trang 20 dòng thành 20 truy vấn.

## Ràng buộc

- Luật «Who sees an objective» của `docs/api.md`: mọi đọc của bảng con đặt `dieuKienXemMucTieu` trong `where`; bảng mới
  thành bảng con thứ tám; `soi-ma.mjs --ca xem` phải biết nó.
- Ghi dựa trên mục tiêu trả `NotFoundException(OKR.thongDiep.khongThayMucTieu)` khi không xem được.
- Mỗi lần ghi để một dòng vết qua `vet()` (luật trao đổi và theo dõi).
- Số truy vấn cố định mỗi lần gọi (`okr-cap-nhat-gan-day.spec.ts`, `cng-trang`).
- `/packages/ui` là nguồn duy nhất của giao diện; thành phần dùng ở hai khu (trang OKR và `record-sheet`) sống ở đó.
- `apps/app/components/crm/record-sheet/**` là vùng của làn M5 (luật 19 của đợt) — sửa `kr-sheet.tsx` đi qua `cham-tep`.
- Migration không trỏ tới bảng tạo ở migration xếp sau (luật 2); mốc tên kiểm `origin/onehub` ngay trước đẩy.

## Cách làm

### Dữ liệu

Một migration:

- Bảng `okrCamXuc`: `id`, `checkInId` → `OkrCheckIn` (`onDelete: Restrict`, như mọi bảng con của lần cập nhật), `userId`,
  `loai` (chuỗi trong `LOAI_CAM_XUC`), `createdAt`; `@@unique([checkInId, userId, loai])`; `@@index([checkInId])`.
- Cột `okrComment.checkInId` (nullable) → `OkrCheckIn` (`onDelete: SetNull`), `@@index([checkInId])`.
- Lấp `checkInId` cho bình luận cũ có `keyResultId` theo đúng luật VK12 (Hỏi-2): lần cập nhật muộn nhất của KR ấy có
  thời điểm (`session.submittedAt`, vắng thì `createdAt`) không sau `createdAt` của bình luận. Bình luận trước lần cập
  nhật đầu tiên giữ `null`.

`packages/validation/src/okr-cam-xuc.ts`: `LOAI_CAM_XUC` (bốn khoá), schema `thaCamXucInput`, `tomTatCamXuc` (một phần tử
mỗi loại có người thả: `loai`, `so`, `cuaToi`, `nguoi` tới `OKR_CAM_XUC.tenToiDa` người, cũ trước) — một module cho cả
API và app.

### Máy chủ

- `okr.thaCamXuc({ checkInId, loai })` — đảo: chưa có hàng của người gọi thì tạo, có thì xoá; trả `tomTatCamXuc` mới của lần
  ấy. Trước khi ghi: lần cập nhật tồn tại và mục tiêu của nó xem được (`assertXemMucTieu`, sai thì `khongThayMucTieu`),
  chu kỳ chưa ẩn (`assertKyChuaAn`). Không khoá theo pha (bình luận cũng không). Vết `tha-cam-xuc` / `go-cam-xuc` với
  `after = { checkInId, loai }`. Hai lần gọi đồng thời cùng khoá: `unique` chặn bản thứ hai, dịch vụ đọc lại rồi trả tóm
  tắt, không ném lỗi ra màn. Không khoá theo pha — thả được cả khi chu kỳ đang chấm điểm hay đã
  đóng, như bình luận (Hỏi-4). Thủ tục mới thêm một dòng vào bảng ghi của bài kiểm chu kỳ ẩn.
- Một hàm đọc `tomTatCamXucCua(tx, checkInIds, nguoiXem, nc)` (`packages/db/src/okr-cam-xuc.ts`): một truy vấn, mang
  `dieuKienXemMucTieu` lồng qua `checkIn.keyResult.objective`; ba thủ tục gọi nó:
  - `okr.capNhatGanDay`: mỗi `dongCapNhat` thêm `camXuc`; `traLoi` đọc theo `checkInId` cho **mọi** dòng (bỏ `moiNhat` khỏi
    điều kiện trả lời; khoá `moiNhat` giữ cho nhãn «có lần mới hơn»).
  - `okr.hopTuan`: mỗi `dongHop` thêm `checkInId` của lần mới nhất (hay `null`) và `camXuc` của lần ấy.
  - `okr.dienBien`: mỗi điểm tuần thêm `checkInId` của lần cuối trong tuần và `camXuc` của lần ấy.
- `okr.addComment` nhận thêm `checkInId?`: lần ấy phải thuộc đúng KR (`keyResultId`) của bình luận, sai thì
  `OKR.thongDiep.capNhatKhacKr`; có `checkInId` mà thiếu `keyResultId` thì lấy KR của lần ấy. Lần ấy đọc với
  `objectiveId` của bình luận và `dieuKienXemMucTieu`: không thấy (lần của mục tiêu khác, hay mục tiêu không xem được)
  thì `khongThayMucTieu`, cùng câu với id không tồn tại.
- Router mới khai vào tập cho vai «chỉ OKR» (`vai-chi-okr.spec.ts`) và vào `cache.okr` (`thaCamXuc` làm mới `capNhatGanDay`,
  `hopTuan`, `dienBien`).

### Màn hình

- `ThanhCamXuc` mới trong `packages/ui` (ghép `Button`, `Tooltip`, `Popover`), bố cục theo ví dụ ReUI `c-emoji-picker-3`.
  Hàng chip: mỗi loại đã có người thả là một chip «emoji số», chip của mình sáng (`aria-pressed`); một nút «Thả cảm xúc»
  mở bảng: hàng bốn cảm xúc để thả, dưới đó mỗi loại đã có người thả kèm đủ tên — lối xem tên trên màn cảm ứng (chạm
  chip là đảo, tooltip không mở bằng chạm). Di chuột một chip trên máy tính: tooltip «Tên A, Tên B và n người khác». Thành phần nhận dữ liệu
  đã gom và một `onDao(loai)`; không gọi tRPC.
- Cập nhật gần đây (`dong-tin.tsx`): `ThanhCamXuc` dưới ghi chú của mọi dòng; ô trả lời trên mọi dòng, gửi `checkInId`.
- Họp tuần (`hop-tuan.tsx`): `ThanhCamXuc` gọn (chỉ chip có số, không nút thả khi dòng không có lần cập nhật) ở dòng KR.
- Ngăn KR (`kr-sheet.tsx`, Lịch sử): `ThanhCamXuc` dưới mỗi mục tuần — qua `cham-tep` với làn M5.

### Dữ liệu mẫu

`okr-mau/nap-cam-xuc.ts` gọi `OkrCamXucService.thaCamXuc` cho các ô của `cong-ty.json` (khối `camXuc` mới: lần cập nhật
theo khoá KR + tuần, người, loại); lần trả lời mẫu gắn `checkInId` qua `addComment`. Nạp lại không nhân đôi (đọc trước,
chỉ thả loại chưa có). Đủ để hơn một nửa lần cập nhật của tuần gần nhất có phản hồi, và ít nhất một lần có đủ bốn loại với
hơn `tenToiDa` người.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cập nhật gần đây → di tới một dòng → chạm «Thả cảm xúc» → chọn 👍 → chip «👍 1» sáng dưới dòng → mở Họp tuần của
  bộ ấy hay ngăn KR của KR ấy trong cùng phiên → chip «👍 1» sáng ở đó (điểm ra: chính ba màn).
- Gỡ: chạm chip đang sáng → số giảm; về 0 thì chip biến mất.
- Xem ai: di chuột một chip → tooltip tên người; trên điện thoại chạm nút «Thả cảm xúc» → bảng có danh sách tên từng loại.
- Trả lời: dòng bất kỳ → «Trả lời» → gõ → Gửi → lần trả lời hiện dưới đúng dòng ấy và ở thẻ Trao đổi.
- Biên: lần cập nhật chưa ai thả — chỉ còn nút «Thả cảm xúc»; KR chưa có lần cập nhật ở Họp tuần — không hàng cảm xúc;
  hơn `tenToiDa` người — «và n người khác».
- Lỗi & quay lại: thả hỏng (chu kỳ đã ẩn, mất mạng) → chip trở về như trước và một toast nói vì sao; không mất gì.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cập nhật gần đây | đọc, thả, trả lời trên từng lần cập nhật | thanh bên khu / ngăn KR |
| Họp tuần (thẻ con của bộ OKR) | bàn KR đáng bàn; thấy và thả cảm xúc trên lần mới nhất | trang bộ OKR / ngăn KR |
| Ngăn KR — Lịch sử | đọc diễn biến từng tuần; thấy và thả cảm xúc trên lần của tuần | mọi lối bấm KR / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-camxuc-trong | cả ba | chỉ nút «Thả cảm xúc» (nhãn ẩn, icon mặt cười) | chạm để thả |
| ST-camxuc-co | cả ba | chip «emoji số» theo thứ tự cố định của bộ | chạm để thả thêm loại, di để xem ai |
| ST-camxuc-cua-toi | cả ba | chip mình đã thả sáng (`aria-pressed=true`) | chạm để gỡ |
| ST-camxuc-dang-gui | cả ba | chip đổi ngay (lạc quan), nút tắt tới khi máy chủ trả | chờ |
| ST-camxuc-loi | cả ba | chip trả về như trước, toast «Chưa thả được: <lý do>» | thử lại |
| ST-camxuc-nhieu | cả ba | tooltip «A, B, C và n người khác» | — |
| ST-camxuc-bang | cả ba | bảng của nút thả: bốn cảm xúc + danh sách tên từng loại đã có | thả, hay đọc tên rồi Esc |
| ST-cng-traloi-moi-dong | Cập nhật gần đây | nút «Trả lời» trên mọi dòng, trả lời của đúng dòng ở dưới | trả lời |
| ST-hop-chua-cap-nhat | Họp tuần | dòng KR chưa có lần cập nhật: không hàng cảm xúc | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Bốn cảm xúc theo thứ tự cố định; chip chỉ hiện loại có người thả; số đếm `tabular-nums`.
- Thả và gỡ là lạc quan (`onMutate` chụp, lùi khi lỗi), làm mới qua `cache.okr` khi xong.
- Nút «Thả cảm xúc» có `aria-label`; mỗi chip có `aria-label` «👍 Đồng ý, 3 người, bạn đã thả».
- Bàn phím: Tab tới chip, Enter/Space đảo; bảng bốn cảm xúc đi bằng phím mũi tên, Esc đóng.
- 375: hàng chip xuống dòng trong khối của dòng; không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `ThanhCamXuc` | tạo (trong `packages/ui`, bậc 5) | ReUI `c-emoji-picker-3` có bố cục nhưng kéo `emoji-picker` tải dữ liệu jsDelivr; bộ cố định bốn không cần ô chọn |
| `Button`, `Tooltip`, `Popover` | dùng | có sẵn trong `packages/ui` |
| `InputGroup` (ô trả lời) | dùng | VK12 đã dùng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — cảm xúc là một hàng trong dòng đã có của ba màn; tra ReUI «emoji reaction bar…» ra `c-emoji-picker-3`
(chip có số, tooltip nêu tên, nút mở bảng) và `c-bubble-4`; rút bố cục chip + tooltip của `c-emoji-picker-3`.
<!-- UX-SPEC-TEMPLATE>>> -->

## Đường đo

- Thước của Cổng Giá trị: tỷ lệ lần cập nhật của các bộ OKR quý 4 đang chạy nhận ít nhất một cảm xúc hoặc một trả lời từ
  người khác người cập nhật, trong khoảng hai buổi họp tuần sau ngày bật · số từ:
  `_acceptance/cam-xuc-tren-cap-nhat/rang/ty-le-phan-hoi.sql` (đọc `okrCheckIn`, `okrCamXuc`, `okrComment.checkInId`) · bảo
  đảm bởi: AC-10 (lệnh chạy trên bộ mẫu cho đúng số viết trước).

## Để lại cho người dựng

- Hỏi-1 (bộ cảm xúc), Hỏi-2 (lấp `checkInId` cho bình luận cũ), Hỏi-3 (vòng đời của cảm xúc), Hỏi-4 (khoá theo pha) soạn theo khuyến nghị; Cổng
  Phạm vi chốt.
- `cham-tep` cho `kr-sheet.tsx` gửi ở S1; trả lời của làn M5 về trước S3.
