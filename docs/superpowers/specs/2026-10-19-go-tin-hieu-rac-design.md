# Gỡ tín hiệu rác (TH5) — thiết kế

Hồ sơ: `_acceptance/go-tin-hieu-rac/`. Hàng TH5 của `docs/plan/lo-trinh-okr.json`, Cổng Đáng `build` 19/10/2026.
Hạng T3: thêm cột và một bảng trong `packages/db/prisma`.

## Câu giao và luật đã chốt

«Quản trị lưu trữ một tín hiệu rác trước khi đội sản phẩm lấy về, và hoàn tác được nếu lỡ tay.»

- Ghi chú của hàng: «Lưu trữ có Hoàn tác theo docs/vong-doi.md, không xoá hẳn.» — không có Xoá vĩnh viễn.
- Ngưỡng sống (`bat_khi`): «Lượt kéo về đầu tiên sau khi giao không mang tín hiệu nào đã lưu trữ; mỗi lần gỡ có vết
  người gỡ.»
- `docs/vong-doi.md`: lưu trữ không hỏi, toast luôn có «Hoàn tác»; khôi phục từ chỗ «Đã lưu trữ»; lưu trữ lại không
  đổi ngày đầu; số đếm trên màn chỉ đếm bản ghi đang dùng; bảng lớn có nút «Đã lưu trữ» trên thanh công cụ.
- `CONTEXT.md` «Tín hiệu»: chỉ người gửi xoá được, và chỉ khi đội sản phẩm chưa lấy về — giữ nguyên.

## Hiện trạng (đo trên `161383064`)

- Bảng `tinHieu`: `keoVeLuc` null là chưa lấy về. Không có cột cất.
- `TinHieuService.keoVe`: khoá bảng `SHARE ROW EXCLUSIVE`, đóng dấu mọi hàng `keoVeLuc: null`, rồi trả MỌI hàng
  (`findMany` không lọc) — lệnh `scripts/tin-hieu/keo-ve.ts` chỉ ghi tệp chưa có. Đường lịch
  (`tinHieuLich.keoVe`) gọi cùng hàm.
- `tatCa`: mọi hàng, mới nhất trước; trang `tin-hieu/tat-ca` đếm ba ô số từ chính danh sách đó (`ghepTatCa`) bằng
  hàm đếm chung với lệnh kéo về (TH4 AC-8).
- Thẻ «Tất cả» là `DataTable` lọc ở trình duyệt (`locDong`), không có cột thao tác.

## Thiết kế

### 1. Dữ liệu

- `tinHieu` thêm `archivedAt DateTime?` và `archivedById String?` (quan hệ `User`, `onDelete: SetNull`). Tên theo
  `archivedFilter` của `apps/api/src/trpc/list-input.ts` để danh sách dùng đúng mảnh chung.
- Bảng mới `tinHieuVet`: `id`, `tinHieuId` (cho phép rỗng, `SetNull` khi người gửi xoá tín hiệu), `so` (số của tín
  hiệu, để vết vẫn nói được mã `crm-N` sau khi tín hiệu bị xoá), `luc`, `nguoiId` (SetNull), `loai` (`"luu-tru"` |
  `"khoi-phuc"`), chỉ mục `(tinHieuId, luc)`. Mỗi lần lưu trữ hay khôi phục thật sự đổi trạng thái thì
  thêm đúng một dòng. Lần gọi không đổi gì (lưu trữ bản đang lưu trữ, khôi phục bản đang dùng) không thêm dòng.
- Một migration cộng thêm, không sửa dữ liệu cũ; mọi hàng cũ `archivedAt` null — hành vi cũ giữ nguyên.

Vì sao có bảng vết chứ không chỉ hai cột: khôi phục phải xoá `archivedById`, nên sau một vòng lưu trữ → khôi phục →
lưu trữ, hai cột chỉ còn lần cuối; nhật ký máy chủ trên Vercel không bền. Ngưỡng đòi «mỗi lần gỡ có vết».

### 2. API (`apps/api/src/tin-hieu`)

- `tinHieu.luuTru({ id })` — REST `POST /tin-hieu/{id}/luu-tru`. Chỉ chủ và quản trị (`laQuanTriWorkspace`), khác thì
  403. Trong một giao dịch, khoá bảng `ROW EXCLUSIVE` (như `xoa`, xung đột với khoá của `keoVe`): không có hàng → 404
  «Không có tín hiệu này.»; `keoVeLuc` khác null → 409 «Đội sản phẩm đã lấy tín hiệu này về — không lưu trữ được nữa.»;
  `archivedAt` khác null → trả `{ ok: true, daLuuTruLuc }` không đổi gì; còn lại đặt `archivedAt`, `archivedById` và
  thêm vết `luu-tru`. Nhật ký `tin-hieu.luu-tru` ghi người gọi và `so`.
- `tinHieu.khoiPhuc({ id })` — REST `POST /tin-hieu/{id}/khoi-phuc`. Cùng quyền. Đang lưu trữ → xoá hai cột, thêm vết
  `khoi-phuc`; đang dùng → `{ ok: true }` không đổi gì.
- `tinHieu.tatCa` giữ nguyên đầu vào (không có) và chỉ trả hàng `archivedAt: null`; REST cũ `GET /tin-hieu/tat-ca`
  vẫn trả đúng như TH4 cho tín hiệu đang dùng. Thủ tục mới `tinHieu.daLuuTru` — REST `GET /tin-hieu/da-luu-tru` — trả
  hàng đã lưu trữ, mới lưu trữ trước. Dòng của cả hai thêm `archivedAt` và `nguoiLuuTru` (`{ id, ten }`, null khi tài
  khoản đã xoá). (Đổi ở S3 so với bản duyệt — một thủ tục riêng thay cho tham số `archived`, để cầu REST không phải ép
  kiểu tham số đúng/sai trên đường dẫn.)
- `keoVe`: `updateMany` và `findMany` thêm `archivedAt: null`. Tín hiệu đang lưu trữ không bị đóng dấu và không có
  trong `tep`; khôi phục rồi thì lượt sau lấy về như mới. Đường lịch đi cùng hàm nên theo luôn.
- `cuaToi`: mỗi dòng thêm `daLuuTru: boolean` cho trang người gửi.
- `xoa` của người gửi giữ nguyên — tín hiệu đang lưu trữ vẫn chưa lấy về, người gửi xoá được.

Khuôn đầu vào mới (`luuTruTinHieuInput`, `khoiPhucTinHieuInput`, `tatCaTinHieuInput`) và chữ lỗi mới
(`TIN_HIEU.loi.luuTruDaLayVe`) đặt ở `packages/validation/src/tin-hieu.ts`.

### 3. Thẻ «Tất cả»

- Thanh công cụ của `DataTable` có nút «Đã lưu trữ» như bảng Công ty (`variant` `outline`, `contrast` khi đang bật),
  ghi `archived` lên đường dẫn qua `setArchived` của `useTableQuery`. Bộ lọc giữ nguyên ở cả hai dạng xem.
- Mỗi dòng có cột thao tác cuối: nút `⋮` mở menu. Dạng đang dùng: «Lưu trữ». Tín hiệu đã lấy về: mục «Lưu trữ» bị khoá
  kèm dòng «Đội sản phẩm đã lấy về — không lưu trữ được nữa.» trong menu.
- Bấm «Lưu trữ»: mục khoá trong lúc chờ; xong thì dòng rời bảng (làm mới `tatCa`) và toast `baoDaLuuTru`
  «Đã lưu trữ tín hiệu crm-12.» kèm «Hoàn tác» 10 giây. Hoàn tác gọi `khoiPhuc`, dòng về chỗ cũ. Hỏng: toast lỗi nói
  rõ lý do — đã lấy về (409) hay mạng — và dòng ở lại.
- Dạng «Đã lưu trữ»: thêm hai cột «Lưu trữ lúc» (giờ Việt Nam) và «Người lưu trữ»; menu dòng có «Khôi phục». Rỗng:
  «Chưa lưu trữ tín hiệu nào».
- Ba ô số đếm tín hiệu đang dùng và đổi ngay sau lưu trữ, Hoàn tác, Khôi phục. Trang máy chủ chỉ đưa xuống dữ liệu
  phẳng: bản vẽ đọc được không và tập mã đã có chỗ sau gom; `TatCaTrang` đếm bằng đúng hàm chung
  (`demNguongSong(dongDemTuTatCa(…))`) trên kết quả `tatCa` mặc định đang có trong bộ đệm truy vấn, nên làm mới truy vấn
  là ô số theo. Bật «Đã lưu trữ» không đổi ô số (đếm từ truy vấn mặc định, không từ dạng đang xem). Số đếm của bộ lọc là
  số của dạng đang xem.

### 4. Trang người gửi

Tín hiệu bị lưu trữ vẫn ở danh sách «Của tôi» với nhãn «Đã lưu trữ» (nghĩa «đã kết thúc» → `neutral`) và câu «Quản
trị đã lưu trữ tín hiệu này — đội sản phẩm sẽ không lấy về.» Nút xoá của người gửi vẫn còn. Đây là câu Hỏi-1 ở Cổng
Phạm vi: lối khác là ẩn hẳn khỏi trang người gửi.

### 5. Chữ

Thêm vào `apps/app/lib/messages/tin-hieu.ts` (chỉ thêm dòng) và một mục «Lưu trữ tín hiệu» vào `CONTEXT.md` (chỉ thêm
mục, không sửa mục «Tín hiệu» — luật 7 của đợt).

### 6. Không làm

Xoá vĩnh viễn; lưu trữ tín hiệu đã lấy về; lưu trữ hàng loạt; lý do lưu trữ; báo người gửi; đưa tín hiệu đã lưu trữ
vào lịch dọn 180 ngày; đổi trần 10 tín hiệu mỗi ngày (vẫn đếm tín hiệu đã bị lưu trữ).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thẻ «Tất cả» → `⋮` của một dòng → «Lưu trữ» → dòng rời bảng, toast «Đã lưu trữ tín hiệu crm-12.» có
  «Hoàn tác» (điểm ra: bảng đang dùng, bớt một dòng).
- Khôi phục: «Đã lưu trữ» trên thanh công cụ → `⋮` → «Khôi phục» → dòng rời dạng lưu trữ, toast «Đã khôi phục tín hiệu
  crm-12.» → tắt «Đã lưu trữ» thấy dòng ở lại bảng.
- Biên: tín hiệu đã lấy về — mục «Lưu trữ» khoá, có dòng nói vì sao; «Đã lưu trữ» rỗng; người không phải quản trị không
  thấy thẻ «Tất cả» (TH4).
- Lỗi & quay lại: lưu trữ trúng lúc lượt kéo về vừa chạy → toast lỗi «Đội sản phẩm vừa lấy tín hiệu crm-12 về — không
  lưu trữ được nữa.», bảng làm mới và dòng hiện trạng thái đã lấy về; mạng hỏng → toast «Chưa lưu trữ được crm-12 —
  thử lại sau.», dòng ở lại, bấm lại được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tín hiệu › Tất cả | gỡ tín hiệu rác khỏi lượt kéo về | thanh thẻ «Của tôi · Tất cả» / dạng «Đã lưu trữ» |
| Tín hiệu › Tất cả, dạng «Đã lưu trữ» | lấy lại tín hiệu gỡ nhầm | nút «Đã lưu trữ» / tắt nút về bảng đang dùng |
| Tín hiệu đã gửi (người gửi) | biết tín hiệu của mình đã bị lưu trữ | trang có sẵn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tat-ca-co-menu | Tất cả | dòng có `⋮`, menu «Lưu trữ» | bấm Lưu trữ |
| ST-tat-ca-da-lay-ve | Tất cả | menu «Lưu trữ» khoá + «Đội sản phẩm đã lấy về — không lưu trữ được nữa.» | đóng menu |
| ST-tat-ca-vua-luu-tru | Tất cả | dòng rời bảng, toast «Đã lưu trữ tín hiệu crm-12.» + «Hoàn tác» | Hoàn tác hoặc để toast tắt |
| ST-tat-ca-luu-tru-loi | Tất cả | toast lỗi nói lý do, dòng ở lại | thử lại |
| ST-da-luu-tru-co | Đã lưu trữ | nút «Đã lưu trữ» đang bật, cột «Lưu trữ lúc», «Người lưu trữ», menu «Khôi phục» | Khôi phục |
| ST-da-luu-tru-rong | Đã lưu trữ | «Chưa lưu trữ tín hiệu nào» + câu nói chỗ lưu trữ | tắt «Đã lưu trữ» |
| ST-cua-toi-da-luu-tru | Tín hiệu đã gửi | nhãn «Đã lưu trữ» xám + câu «Quản trị đã lưu trữ…» | xoá nếu muốn |
| ST-tat-ca-375 | Tất cả | `⋮` vẫn trong khung, không cuộn ngang | như trên |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Lưu trữ không hỏi lại (luật `docs/vong-doi.md`); Hoàn tác 10 giây (`LUU_TRU.hoanTacMs`), bấm một lần.
- Mục menu đang chờ thì khoá, không bấm chồng.
- Nút `⋮` có `aria-label` «Thao tác cho tín hiệu crm-12» (chữ `trang.thaoTac` có sẵn).
- Bật/tắt «Đã lưu trữ» đưa về trang đầu, giữ bộ lọc.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| `DataTable` (`actions`) + `useTableQuery.setArchived` | dùng | nếp «Đã lưu trữ» của bảng Công ty |
| `DropdownMenu` + nút `⋮` | dùng | cùng menu thao tác của trang «Của tôi» |
| `baoDaLuuTru` (`packages/ui/src/lib/bao-luu-tru.ts`) | dùng | toast Hoàn tác chung |
| `StatusIndicator` qua `TrangThai` | dùng | nhãn trạng thái người gửi |
| `Empty` | dùng | dạng «Đã lưu trữ» rỗng |

Tra bậc: bậc 1 có đủ; không cần shadcn hay ReUI.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — thêm một thao tác dòng và một dạng xem vào bảng có sẵn; khuôn của bảng Công ty và của
Productboard Insights (lọc «Archived», bỏ lưu trữ cùng menu) trùng nhau, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Kiểm thử

- API (`apps/api/test/tin-hieu-luu-tru.spec.ts`, kho thử của lượt): ma trận quyền × trạng thái × thao tác; kéo về bỏ
  qua bản lưu trữ và lấy lại bản đã khôi phục; vết đếm đúng số lần; ca chạy đồng thời lưu trữ với kéo về.
- Giao diện (`apps/app/test/tin-hieu-luu-tru.dom.tsx`): menu, khoá, toast Hoàn tác, dạng «Đã lưu trữ», trang người gửi.
- Màn thật (`_acceptance/go-tin-hieu-rac/rang/do-man.mjs`, bám `moi-tin-hieu-cho-quan-tri/rang/do-man.mjs`): lưu trữ,
  Hoàn tác, khôi phục trên bản chạy với dữ liệu mẫu gieo qua `tinHieu.gui`, chụp 1280 và 375.
- Migration: luật 2 của đợt và `prisma migrate diff` không trôi.
