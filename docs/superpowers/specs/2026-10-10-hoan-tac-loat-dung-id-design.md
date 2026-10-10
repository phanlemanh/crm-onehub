# V2d `hoan-tac-loat-dung-id` — Hoàn tác hàng loạt đúng bản đã cất

Hàng V2d của đợt `sau-14-10`, dãy P2. Nguồn: Ngoài-1, 2, 3 của V2 `vong-doi-mot-cach-cat` (#346). Anh chọn «mở hợp đồng mới»
ở Cổng 2 lúc 2026-10-09T16:34:54Z.

## Vấn đề

Lưu trữ và khôi phục hàng loạt của cá nhân, công ty, thoả thuận đi qua `runBulk` (`apps/api/src/crm/bulk.ts`). Có ba chỗ hỏng,
cùng một gốc:

1. `archive(id)` chạy `updateMany({ where: { id, archivedAt: null } })` rồi `findUniqueOrThrow`. Bản đã cất từ trước không đổi
   gì, nhưng vẫn trả về bản ghi, nên `runBulk` đếm nó là `succeeded`. `restore(id)` chạy `update` không điều kiện, nên bản đang
   dùng cũng tính là «khôi phục được».
2. Ba schema đầu ra (`bulkResultOutput`, `companyBulkResultOutput`, `dealBulkResultOutput`) chỉ có `requested`, `succeeded`,
   `failed`, `message`. Zod cắt mọi trường khác, nên `skipped` không bao giờ tới trình duyệt.
3. Vì máy chủ không nói id nào đã đổi, «Hoàn tác» của V2 gửi lại cả danh sách đã chọn (`variables.ids`). Kết quả: nó khôi
   phục luôn bản người khác đã cất (Ngoài-2), báo xanh khi có bản không về được (Ngoài-1), và toast lưu trữ một phần nối thêm
   thông điệp tiếng Anh thô «No contact with id …» (Ngoài-3, qua `bulkMenu.leftAlone` với `result.message`).

## Cách làm

**Máy chủ.**

- `BulkResult` thêm `changedIds: string[]`. `runBulk` đẩy `id` vào đó mỗi khi `act` trả giá trị khác `null`. Mọi thao tác hàng
  loạt (đổi người phụ trách, xoá vĩnh viễn, làm giàu) cũng có trường này, cùng nghĩa «id đã thành công». Đây là thay đổi thêm.
- Mỗi service có hai hàm riêng cho đường hàng loạt: `archiveIfActive(id)` và `restoreIfArchived(id)`.
  - Chạy `updateMany` có điều kiện: `archivedAt: null` khi lưu trữ, `archivedAt: { not: null }` khi khôi phục.
  - `count === 1` → trả `{ id }`, tức đã đổi.
  - `count === 0` → `findUnique` xem bản ghi còn không. Còn → trả `null`, tức bị bỏ qua. Không còn → ném `NotFoundException`
    như `translate`, tức thất bại.
  - `bulkArchive` và `bulkRestore` dùng hai hàm này. `archive` và `restore` đơn lẻ (ngăn bản ghi, K6b) không đổi.
- Ba schema đầu ra thêm `skipped: z.number()` và `changedIds: z.array(z.string())`. Ba bản giống hệt nhau nên gộp thành một
  `bulkResultOutput` trong `apps/api/src/crm/bulk.ts`. Ba `*.contracts.ts` re-export dưới tên cũ để `generated/server.ts` không
  đổi.

**Trình duyệt.**

- `BulkResult` của `bulk-actions.tsx` thêm `skipped`, `changedIds`.
- Ba `*-bulk-actions.tsx`: `onHoanTac` gửi `{ ids: result.changedIds }`, không gửi `variables.ids` nữa.
- `baoLuuTruLoat`:
  - `changedIds` rỗng → không có nút «Hoàn tác». Báo «không có gì thay đổi», kèm số bị bỏ qua nếu có.
  - Còn lại → toast có «Hoàn tác». Có bản bị bỏ qua (`skipped + failed > 0`) thì dùng câu chữ mới `bulk.boQua`, không nối
    `result.message`.
- `baoHoanTacLoat`:
  - `succeeded === 0` → giữ `bulk.hoanTacLoi` của V2.
  - `failed > 0` → `toast.warning` bằng `bulk.hoanTacThieu(daVe, khongVe)`, không in `result.message`.
  - Còn lại → `toast.success(restored(n))` như V2.
- `bulkMenu.leftAlone` của các thao tác khác giữ nguyên. Đổi chỗ đó nằm ngoài lời hứa.

## Vòng đời (luật 14 — ba câu)

1. Dọn thế nào: không đổi — Lưu trữ → Khôi phục → Xoá vĩnh viễn.
2. «Lịch sử»: không đổi.
3. Danh sách mặc định: không đổi. Bản đã cất vẫn chỉ hiện ở «Đã lưu trữ».

## Ngoài phạm vi

- Lưu trữ từng bản từ menu ngăn (K6b): đã hoàn tác đúng một id.
- Câu báo của xoá vĩnh viễn, đổi người phụ trách, đổi giai đoạn hàng loạt: vẫn dùng `leftAlone` kèm thông điệp máy chủ.
- Danh sách liên quan lọc bản đã cất (V2a). Dải báo và vùng khoá dùng chung (`dai-luu-tru-dung-chung`).

## Thay một lời hứa đã ký

AC-1 của V2 hứa «Hoàn tác gọi khôi phục hàng loạt với đúng danh sách id vừa gửi đi lưu trữ». V2d đổi thành «đúng danh sách id
thật sự đã cất» (AC-2 ở đây). Bài `vdc-hoan-tac-loat` trong `apps/app/test/vong-doi-mot-cach-cat.dom.tsx` đổi fixture cho có
`changedIds`, và assert ids theo luật mới. Eval E9 của V2d chạy lại đúng bài đó. Đơn `cham-tep` P2-60 đã được duyệt.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: chọn n bản đang dùng → «Thao tác» → «Lưu trữ» → toast «Đã lưu trữ n …» kèm «Hoàn tác» → bấm → toast «Đã khôi
  phục n …».
- Biên: trong lô có bản người khác đã cất, hoặc bản không còn → toast nói số đã lưu trữ và số bị bỏ qua. «Hoàn tác» chỉ đưa
  về những bản mình vừa cất.
- Lỗi và quay lại: «Hoàn tác» về thiếu → toast vàng nói số đã khôi phục và số không khôi phục được, chỉ tới «Đã lưu trữ».
  Lời gọi hỏng hẳn → «Chưa hoàn tác được…» (V2).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng cá nhân / công ty / thoả thuận (dạng bảng; Kanban không có thao tác hàng loạt) | dọn nhiều bản ghi một lượt | thanh bên / toast rồi vẫn ở bảng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-htl-luu-tru-du | Bảng | «Đã lưu trữ n …» + «Hoàn tác» | bỏ qua hoặc Hoàn tác |
| ST-htl-luu-tru-bo-qua | Bảng | «Đã lưu trữ n … · k bản bị bỏ qua (đã lưu trữ từ trước hoặc không còn)» + «Hoàn tác» | bỏ qua hoặc Hoàn tác |
| ST-htl-luu-tru-khong-doi | Bảng | «Không có gì thay đổi · k bản bị bỏ qua», không có «Hoàn tác» | xem «Đã lưu trữ» |
| ST-htl-hoan-tac-du | Bảng | «Đã khôi phục n …» (xanh) | tiếp tục |
| ST-htl-hoan-tac-thieu | Bảng | «Đã khôi phục a … · b bản không khôi phục được — xem mục Đã lưu trữ» (vàng) | mở «Đã lưu trữ» |
| ST-htl-hoan-tac-loi | Bảng | «Chưa hoàn tác được. Các bản ghi vẫn ở mục Đã lưu trữ.» (đỏ) | mở «Đã lưu trữ» |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Toast lưu trữ và toast hoàn tác không bao giờ in `result.message` của máy chủ.
- «Hoàn tác» gọi đúng một lần, với `changedIds` của lần lưu trữ đó.
- Chữ en và vi lấy từ `crmMessages`. messages-guard giữ cặp khoá.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `toast` của `sonner` (`success` / `warning` / `error`) qua `baoDaLuuTru` | dùng | toast hàng loạt sẵn có của V2; `warning` là kiểu sẵn có của sonner |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: chỉ đổi phản hồi sau thao tác hàng loạt trên bảng, không thêm màn hay luồng mới.
<!-- UX-SPEC-TEMPLATE>>> -->
