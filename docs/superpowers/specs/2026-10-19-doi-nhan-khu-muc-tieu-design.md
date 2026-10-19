# Đổi nhãn khu Mục tiêu (VK4) — thiết kế

Hàng VK4 của `docs/plan/lo-trinh-okr.json`, dãy V2 đợt `vo-khu-muc-tieu`, Cổng Đáng ký `build` 19/10. Câu giao:
«Thành viên đọc khu Mục tiêu thấy một tên cho một khái niệm: Góp vào cho căn chỉnh, OneHub cho đơn vị gốc, Lấy ý
kiến thay Hỏi ý — ở cả bản tiếng Việt và tiếng Anh». Ba tên đã chốt ở `CONTEXT.md` ngày 18/10 (PR #477): mục
«Căn chỉnh» (nhãn màn «Góp vào»), mục «Đơn vị» (gốc mang tên không gian làm việc; «cả công ty» cho phạm vi, «Công ty»
cho tên cấp), mục «Lấy ý kiến».

## Hiện trạng (kiểm kê 19/10 trên `onehub` 1fce5d49c)

84 khoá chữ, 142 chuỗi (80 vi, 62 en) trong `apps/app/lib/messages/okr*.ts`, `tro-ly-okr.ts`, `to-chuc.ts` và hai
khoá dây `soDo.day`, `soDo.moTaDay` của `packages/ui/src/lib/messages.ts` còn tên cũ — danh sách ghim ở `_acceptance/doi-nhan-khu-muc-tieu/kiem-ke.json` trước khi sửa chữ đầu tiên.

| Khái niệm | Khoá | Tên cũ trên màn |
|---|---|---|
| Góp vào | 55 | vi «căn chỉnh», «Cây căn chỉnh», «Đường lý do», «Gắn căn chỉnh», «Gắn thêm», «Chưa nối lên»; en «Alignment», «align(ed)», «Path of reasons», «Not connected» |
| Lấy ý kiến | 21 | vi «Hỏi ý», «hỏi ý», «lần hỏi ý»; en đã một tên «Call for ideas» |
| Đơn vị gốc | 8 | vi «Toàn công ty», «Toàn OneHub», «Cả công ty» (tên cấp); en «Whole company», «All of OneHub» |

Không chuỗi nào viết cứng ngoài tệp chữ trong `apps/app/app`, `apps/app/components` (đã quét). Bản mẫu
`apps/app/app/proto/**` không nạp tệp chữ OKR nào, nên đổi tệp chữ không chạm bản mẫu.

Tên đơn vị gốc: màn Theo đơn vị (`theo-don-vi.tsx:182`) và thanh hành động khu (`hanh-dong-khu.tsx:89`) đã lấy
`workspace.get().name`, `m.goc` chỉ là chữ dự phòng khi chưa tải xong. Khối độ phủ của Lấy ý kiến
(`hoi-y/khoi-do-phu.tsx:23`) in thẳng `m.goc` — chỗ duy nhất trong ba màn chưa mang tên không gian làm việc.

## Dựng gì

1. **Đổi giá trị chữ** vi và en của 84 khoá trong kiểm kê; không đổi tên khoá, không xoá khoá. Khoá mã
   (`canChinh`, `hoi-y`, `can-chinh`) và đường dẫn `/okr/hoi-y` giữ nguyên — `CONTEXT.md`: «Mã và đường dẫn giữ
   `hoi-y` tới khi khu Mục tiêu đổi đường dẫn».
2. **Bảng thay chữ** — nhãn `CONTEXT.md` gọi tên thì ghim đúng chữ; còn lại theo nghĩa:

| Chỗ | vi | en |
|---|---|---|
| Thẻ của khung mục tiêu | «Góp vào» | «Contributes to» |
| Khối lý do trong thẻ | «Góp vào đâu» | «Where it contributes» |
| Nút thêm (hộp thoại, thẻ, soạn) | «Thêm chỗ góp vào» | «Add where it contributes» |
| Trạng thái trống | «Chưa góp vào đâu» | «Not contributing anywhere» |
| Sơ đồ | «Sơ đồ góp vào», «Sơ đồ góp vào theo đơn vị», «Sơ đồ góp vào cả công ty» | «Contribution map», «Contribution map by unit», «Company-wide contribution map» |
| Nhãn đọc của dây (`packages/ui`) | «Dây góp vào», «Dây góp vào giữa hai thẻ.» | «Contribution line», «A contribution line between two cards.» |
| Câu có «căn chỉnh» | «góp vào» theo ngữ pháp câu («không góp vào được», «gỡ góp vào {ten}») | «contribute(s) to», «contribution» |
| Lấy ý kiến | «Lấy ý kiến», «lần lấy ý kiến» | giữ «Call for ideas» |
| Tên đơn vị gốc | tên không gian làm việc (dữ liệu, `translate="no"`); chữ dự phòng «Công ty» | tên không gian làm việc; dự phòng «Company» |
| Tên cấp cạnh Bộ phận, Phòng ban | «Công ty» | «Company» |
| Phạm vi trong câu | «cả công ty» («Về cả công ty») | «the whole company» |

3. **Tên đơn vị gốc ở khối độ phủ** — `NhanHang` của `khoi-do-phu.tsx` đọc `trpc.workspace.get` (đã nạp sẵn ở
   `dau-trang-okr.tsx:79`) và in tên trong `<span translate="no">`, rơi về «Công ty» khi chưa có tên — cùng lối hai
   màn kia đang dùng.
4. **Luật máy giữ một tên** — bài mới `apps/app/test/doi-nhan-khu-muc-tieu.spec.ts`, luật ở
   `apps/app/test/doi-nhan-khu-muc-tieu-luat.ts`: rải phẳng mọi giá trị vi và en của các tệp chữ của khu (dùng lại
   `mucKhoChu` của `kara-mot-ten-luat.ts`); cụm cấm vi không phân biệt hoa thường «căn chỉnh», «đường lý do», «chưa
   nối lên», «gắn thêm», «hỏi ý», «toàn công ty», «toàn onehub»; en «align…», «All of OneHub», «Path of reasons», và
   giá trị đúng bằng «Whole company». Câu văn «cả công ty» / «the whole company» chỉ phạm vi được giữ. Mười ba nhãn
   `CONTEXT.md` gọi tên được ghim đúng chữ ở hai thứ tiếng.
5. **Bài kiểm có sẵn** khẳng định chữ cũ đổi theo chữ mới, không bài nào bị gỡ: `okr-cua-toi-ba-phan.dom.tsx`
   (nhãn thẻ), `okr-sheet.dom.tsx` (thẻ «Góp vào»), `okr-tai-co-cau.dom.tsx`, `messages-guard.spec.ts`; các bài khác
   đọc khoá chữ nên tự theo.
6. **Thước hồ sơ đã ký** (luật riêng 21 của đợt): hai răng màn chạy trong làn máy khẳng định chữ cũ —
   `dat-okr-trong-crm/rang/man-okr.mjs` (dòng 40 «Cây căn chỉnh», dòng 1151 thẻ «Căn chỉnh») và
   `toan-canh-okr/rang/man-toan-canh.mjs` (dòng 56 «Cây căn chỉnh toàn công ty»). Đổi đúng chuỗi cũ → mới, không đổi
   logic; mỗi hồ sơ một dòng sổ `fix` mang `decided_by` chủ kho; ghim lại hai hồ sơ ở đuôi vòng trước khi gộp (giám
   sát trả lời yêu cầu V2-2, 19/10). Dòng 796 («cả công ty» của gợi ý hàng gốc) giữ nguyên vì chữ đó là phạm vi.

7. **Thước neo theo dải của vòng**, không theo merge-base trần: `rang/dai.mjs` trả merge-base..HEAD khi nhánh còn mở,
   và cặp cha của commit gộp khi đã lên `onehub`; dải rỗng là «không đo được» (mã 2), không xanh im.

## Không làm

- Câu báo lỗi máy chủ, tin nhắc, lời dặn Kara, và tên gốc «OneHub» viết cứng ở `apps/api/src/okr/okr-config.ts`
  (`OKR.tenGoc`) — hàng VK5 `chu-may-sinh-ten-moi`.
- Thước hồ sơ đã ký nằm ngoài làn máy (khoảng 11 ô `ui-check` ghim nhãn cũ trong `evals.yaml`) — không chạy ở làn
  ghim; chúng đổi khi hồ sơ đó có vòng S4 kế.
- Hai thước đã lệch trước hàng này: `dot-hoi-y-tuong-okr/rang/soi-ma.mjs` (đòi mục từ điển «Hỏi ý mục tiêu» đã đổi
  từ #477) và `gan-tay-va-kara-co-ly-do/rang/ranh-gioi.mjs` (dòng mẫu không còn trong tệp) — «đỏ sẵn trên nền».
- Tên thẻ «Toàn cảnh», thanh bên, đường dẫn — VK1, VK2.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: không đổi luồng nào — mọi màn khu Mục tiêu giữ bố cục, chỉ đổi chữ (điểm ra: như cũ)
- Biên: không gian làm việc chưa đặt tên hoặc truy vấn tên chưa xong → tên gốc hiện «Công ty»
- Lỗi & quay lại: truy vấn tên lỗi → giữ «Công ty», không chặn màn

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Khung mục tiêu, thẻ Góp vào | xem và sửa mục tiêu góp vào đâu | Theo đơn vị / như cũ |
| Theo đơn vị | đọc bộ OKR của một đơn vị, gốc mang tên không gian làm việc | thanh khu / như cũ |
| Lấy ý kiến | mở và góp ý trước khi đặt OKR | thẻ «Lấy ý kiến» / như cũ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-dophu-gocten | Lấy ý kiến | hàng gốc của bảng độ phủ mang tên không gian làm việc | đọc độ phủ |
| ST-dophu-gocchuaten | Lấy ý kiến | tên chưa có → «Công ty» | đọc độ phủ |
| ST-gopvao-trong | Khung mục tiêu | «Chưa góp vào đâu» + nút «Thêm chỗ góp vào» | thêm chỗ góp vào |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên không gian làm việc là dữ liệu người nhập: không dịch, `translate="no"`.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Heatmap (`@crm/ui`) | dùng | nhãn hàng vẫn là node React, chỉ đổi chữ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hàng không đổi kiến trúc thông tin — giữ khuôn đang chạy của khu; thanh bên mới là VK1/VK2.
<!-- UX-SPEC-TEMPLATE>>> -->
