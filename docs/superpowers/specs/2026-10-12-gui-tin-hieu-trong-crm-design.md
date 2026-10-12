# Gửi tín hiệu trong CRM — design (hàng LT2)

Hồ sơ: `_acceptance/gui-tin-hieu-trong-crm/` · Cổng Đáng ký build 12/10 (chủ kho «Làm ; đường vào git: lối 1 ;
ngưỡng: như đề xuất») · hàng đứng trên LT1 (trang Lộ trình, đã gộp) và hàng L3 của kit (cửa tín hiệu, kit
2.27.0).

## 1. Điều chủ kho muốn (máy viết lại từ ô cơ hội — sửa nếu lệch)

- **Kết quả:** người dùng CRM bấm «Gửi tín hiệu» ở bất kỳ màn nào, kể điều mình gặp, rồi xem lại tín hiệu
  của mình đang ở đâu — chưa gom, vào nhóm nào, thành việc nào, đã giao chưa.
- **Ai dùng:** mọi người dùng CRM (mọi vai, kể cả «chỉ OKR») để gửi và xem; chủ kho chạy lượt kéo về.
- **Ràng buộc đã chốt:**
  - CRM chỉ GHI tín hiệu. Không ghi nhóm, ý định hay trạng thái — kit gom, chủ kho chọn.
  - Khuôn tín hiệu là của kit (`tin-hieu-template.md`, khuôn yêu cầu của gói Điều phối, `loai: "tin-hieu"`).
    CRM không đặt khuôn thứ hai. Cần đổi khuôn → dừng, báo phiên điều phối.
  - **Lối 1** (Cổng Đáng): CRM giữ hàng chờ; lượt gom chạy một lệnh kéo tín hiệu về git; người chạy lượt gom
    ký commit; ứng dụng không giữ khoá ghi git.
  - Câu trạng thái của tín hiệu đã vào git là câu kit viết (khoá `tin_hieu` của khối dữ liệu lộ trình). CRM
    không tự suy trạng thái sau gom.
  - Không đụng tệp của vòng LT1b (ngăn hồ sơ trong trang Lộ trình): `components/lo-trinh/*`, bộ đọc khuôn
    khối dữ liệu (`packages/validation/src/lo-trinh-du-lieu.ts`), `doc-trang.ts`.
- **Thành công:** ngưỡng ở ô cơ hội — 30 ngày sau khi lên production: ≥20 tín hiệu từ ≥3 phòng ban; tín hiệu
  gửi quá 7 ngày đã có chỗ sau gom và người gửi thấy chỗ đó.

## 2. Phương án bộ phận

| Câu | Chọn | Bỏ | Vì sao |
|---|---|---|---|
| Lệnh kéo về đọc production bằng gì | Một thủ tục của API chỉ quản trị gọi được, gọi bằng khoá API của chủ kho (`x-api-key`, khoá đóng vai chủ khoá) | Đọc thẳng CSDL production; điểm nhận REST mới có bí mật riêng | Khoá API đã có, không thêm bí mật, không chạm module khoá API (T3); đọc thẳng CSDL không đóng dấu «đã kéo về» được; điểm REST thứ ba là «một quyết định, không phải nếp» (`docs/api.md`) |
| Mã tín hiệu | Số tăng dần của CSDL, tệp `crm-<số>.json`, `phien: "crm"` | Mã theo người (`crm-u7-1`) | Mã theo người đưa dấu vết người gửi vào git; số tăng dần ổn định, ngắn, đúng khuôn `<phiên>-<số>` |
| Biết tín hiệu đã vào git chưa | Lượt kéo về đóng dấu `keoVeLuc` trong cùng giao dịch trả dữ liệu | Không đóng dấu, suy từ bản vẽ lộ trình | Luật vòng đời: chưa có lịch sử thì Xoá — «lịch sử» phải là một cột máy chủ kiểm được trong giao dịch, không phải một bản vẽ đến muộn |
| Đọc khoá `tin_hieu` của khối | Mô-đun mới đọc khoá đó từ khối thô (bộ chép `docDuLieu` giữ khoá lạ) và kiểm bằng khuôn riêng | Thêm `tin_hieu` vào khuôn khối của LT1 | Khuôn khối là tệp LT1b đang đổi sang bản 2; khuôn riêng không chạm tệp đó, và kit cũng để khoá này ngoài bảng khoá chuẩn |
| Chỗ xem «tín hiệu của tôi» | Một trang riêng, mở từ biên nhận trong hộp và từ menu người dùng | Danh sách nằm trong hộp gửi | Trạng thái sau gom đọc `LO-TRINH.html` ở máy chủ của app; trang máy chủ tính, chỉ trao câu của chính người xem — không đưa tiêu đề tín hiệu của người khác xuống trình duyệt |

## 3. Kiến trúc

```
Nút «Gửi tín hiệu» (thanh đầu trang, mọi màn)  ─► hộp kể ─► tinHieu.gui ─► bảng TinHieu (số, người gửi,
                                                                              phòng ban chính lúc gửi, màn,
                                                                              tiêu đề, mô tả, gửi lúc, kéo về lúc)
Trang «Tín hiệu đã gửi» (máy chủ)  ─ tinHieu.cuaToi + LO-TRINH.html (khoá tin_hieu) ─► danh sách + câu trạng thái
Lệnh kéo về (máy chủ kho) ─ x-api-key ─► tinHieu.keoVe (quản trị) ─► tin-hieu/crm/crm-<số>.json ─► commit ─► kit gom
```

### 3.1 Dữ liệu (T3 — `packages/db/prisma`)

Bảng `TinHieu`: `id` (cuid) · `so` (số tăng dần, duy nhất) · `nguoiGuiId` (User, `SetNull`) · `phongBanId`
(Department, `SetNull` — phòng ban chính của người gửi LÚC GỬI, vắng nếu người đó chưa có phòng ban chính
còn dùng) · `tieuDe` · `moTa` (tuỳ chọn) · `man` · `guiLuc` · `keoVeLuc` (tuỳ chọn). Chỉ mục
`(nguoiGuiId, guiLuc)`. Không cột cất: tín hiệu không lưu trữ.

### 3.2 Khuôn và hằng số (`packages/validation/src/tin-hieu.ts`, nhập bằng `@crm/validation/tin-hieu`)

- `TIN_HIEU` — hằng số một chỗ: trần mỗi người mỗi ngày giờ Việt Nam (10), trần độ dài (2.000 ký tự), độ dài
  tiêu đề (120), số ngày của phép đếm (30), thư mục nguồn (`tin-hieu/crm`), phiên (`crm`).
- `tachNoiDung(chu)` — dòng đầu khác rỗng thành `tieu_de` (cắt 120, thêm «…» khi cắt); cả đoạn thành `mo_ta`
  khi dài hơn dòng đầu.
- `tepTinHieu` — khuôn tệp của kit: `{phien, loai: "tin-hieu", hang: null, noi_dung: {tieu_de, man, mo_ta?},
  luc}`; `tepTuBanGhi(row)` dựng tệp với thứ tự khoá cố định; `idTep(so)` = `crm-<so>`.
- `duongTinHieu` — khuôn một bản ghi đường đi của kit (13 trường `TRUONG_DUONG`), `parseDuongTinHieu(raw)`
  trả `{kieu: "co", banGhi} | {kieu: "khong-co"} | {kieu: "hong", loi}`. Bản ghi sai khuôn là lỗi có tên, không
  nuốt thành mảng rỗng.

### 3.3 API (`apps/api/src/tin-hieu/`, router `tinHieu`, `PhamViChungMiddleware`)

- `gui({chu, man})` — tự phục vụ. Khoá theo người (`lockIdempotencyKey`), đếm tín hiệu của người đó trong ngày
  giờ Việt Nam; quá trần → 429 kèm câu nói trần và lúc mở lại. `man` chỉ giữ đường dẫn (bỏ `?…` và `#…`), cắt
  200 ký tự. Phòng ban: `orgPlacement.primaryDepartmentId` khi phòng ban đó chưa lưu trữ.
- `cuaToi()` — tín hiệu của người gọi, mới nhất trước: `{id, so, tieuDe, man, guiLuc, daKeoVe}`.
- `xoa({id})` — chỉ tín hiệu của người gọi; trong cùng giao dịch kiểm `keoVeLuc` rỗng; đã kéo về → 409 «Đội sản phẩm đã lấy tín hiệu này về — không xoá được nữa». Tín hiệu của người khác → 404 như không có. Ghi vết bằng `Logger` (mã, người
  gọi), không ghi nội dung.
- `keoVe()` — chỉ owner/admin; `POST /rest/tin-hieu/keo-ve`. Trong một giao dịch: đóng dấu `keoVeLuc` cho tín
  hiệu chưa dấu, trả MỌI tín hiệu còn lại xếp theo số: `{tep: tepTinHieu, phongBan: string | null}`.
- Nhật ký không ghi nội dung tín hiệu (docs/api.md, Logging). Không `AgentTask`: không có việc phán nào ở đây.
- Router thêm vào danh sách ghim của `apps/api/test/vai-chi-okr.spec.ts`.

### 3.4 Lệnh kéo về (`scripts/tin-hieu/keo-ve.ts`, `bun run tin-hieu:keo-ve`)

Chạy trên máy chủ kho, đầu mỗi lượt gom. Đọc `CRM_API_URL` + `CRM_API_KEY` (khai ở `.env.example`, API không
đọc). Thiếu một trong hai → thoát 2 gọi tên biến, không ghi tệp. Gọi `keoVe`, kiểm từng tệp bằng
`tepTinHieu`, ghi `tin-hieu/crm/<id>.json` (JSON hai dấu cách + xuống dòng cuối) cho tệp chưa có; tệp đã có
cùng byte → bỏ qua; khác byte → thoát 1 gọi tên tệp, không ghi đè. In tổng kết: mới · đã có · trong 30 ngày
<n> tín hiệu từ <k> phòng ban (mỗi phòng ban một dòng số đếm; «chưa có phòng ban» là một dòng riêng). Không
commit hộ — người chạy lượt gom commit cùng bản gom.

### 3.5 Cửa tín hiệu của kho

`_acceptance/config.yaml` thêm khối `tin_hieu:` (`nguon: [tin-hieu/crm]`, `gom: tin-hieu/gom`); hai thư mục
có `.gitkeep`. Kit 2.26 bỏ qua khối này; từ 2.27 bản vẽ `LO-TRINH.html` mang khoá `tin_hieu`.

### 3.6 Trang «Tín hiệu đã gửi» (`/[slug]/tin-hieu`)

Máy chủ: `requireSession`, lấy `cuaToi`, đọc `LO-TRINH.html` bằng `docTepLoTrinh` + `docDuLieu` của LT1, lấy
khoá thô `tin_hieu`, giữ đúng bản ghi có `id` thuộc tín hiệu của người xem, trao xuống mã khách
`{trangThai: Record<id, {cau, nghia}>, banVe: "co" | "khong-co-danh-sach" | "vang" | "hong"}`.

Câu trạng thái:

Mỗi dòng hiện một nhãn ngắn có chấm màu và câu đầy đủ ở dòng phụ (nếp nhãn chính + dòng phụ của trang Lộ trình;
design-pass Nhóm 1). Nhãn ngắn: chờ lấy về · chờ gom (`chua-gom`) · không thành việc (`le`) · đã có việc (`da-phu`) ·
đã vào nhóm (`nhom-chua-cat`) · để sau (`chan-troi`) · `hang-*` theo nhóm trạng thái của hàng (chưa bắt đầu · đang
làm · đã giao · khác).

| Tình huống | Câu (dòng phụ) | Nghĩa (`toneTheoNghia`) |
|---|---|---|
| Chưa kéo về | «Đã nhận — chờ đội sản phẩm lấy về» | nháp |
| Đã kéo về, chưa có trong bản vẽ | «Đội sản phẩm đã lấy về — chờ gom nhóm» | nháp |
| Có trong bản vẽ | câu `cau` của kit, nguyên văn | `chua-gom`, `le`, `nhom-chua-cat`, `chan-troi` → nháp; `da-phu` → xong; `hang-*` → theo `nhom_trang_thai` của hàng đó trong cùng khối (`da-giao` → xong, `dang-lam` → đang chạy, còn lại → nháp) |

`banVe` khác `co` → dưới tiêu đề danh sách có một dòng «Trạng thái sau gom chưa đọc được — đang hiện trạng
thái lúc gửi», các dòng dùng hai câu đầu bảng.

### 3.7 Nút và hộp kể

`NutGuiTinHieu` (mã khách) đặt trong cụm nút bên phải của `AppHeader` trước `UserMenu`, kèm chỗ giữ trong
`AppHeaderFallback`. Mở `Dialog` ở mọi khổ (như hộp «Báo sai»); hộp tự hỏi lại khi đóng lúc đã gõ (bộ giữ thay đổi của `Dialog`).
Menu người dùng thêm mục «Tín hiệu đã gửi». Mọi chữ qua tệp chữ (`lib/messages/tin-hieu.ts`, vi + en).

## 4. Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bấm «Gửi tín hiệu» trên thanh đầu trang → hộp «Gửi tín hiệu» (ô «Bạn gặp điều gì?», dòng «Gửi từ
  màn: /okr/kr») → «Gửi» → biên nhận trong hộp «Đã nhận tín hiệu crm-12» + liên kết «Xem tín hiệu đã gửi» (điểm
  ra: trang «Tín hiệu đã gửi», dòng mới nằm đầu, «Đã nhận — chờ đội sản phẩm lấy về»).
- Biên: chưa gửi tín hiệu nào → trang rỗng có nút «Gửi tín hiệu»; bản vẽ lộ trình không đọc được → dòng báo +
  trạng thái lúc gửi; người dùng vai «chỉ OKR» thấy nút như mọi người.
- Lỗi & quay lại: quá trần ngày → lỗi ngay dưới ô, chữ đã gõ giữ nguyên, nói lúc mở lại; máy chủ lỗi → lỗi dưới ô,
  nút «Gửi» bấm lại được; đóng hộp khi đã gõ → hỏi «Bỏ tín hiệu đang viết?».

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hộp «Gửi tín hiệu» | Kể một điều mình gặp | Nút trên thanh đầu trang / biên nhận → trang «Tín hiệu đã gửi» |
| Trang «Tín hiệu đã gửi» | Xem tín hiệu của mình đang ở đâu | Biên nhận, menu người dùng / hộp gửi, xoá |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hop-trong | Hộp gửi | Ô trống, nút «Gửi» khoá, dòng «Gửi từ màn: …» | Gõ |
| ST-hop-dang-gui | Hộp gửi | Nút «Gửi» quay vòng «Đang gửi…», ô khoá | Chờ |
| ST-hop-da-gui | Hộp gửi | «Đã nhận tín hiệu crm-12» + «Xem tín hiệu đã gửi» + «Đóng» | Xem hoặc đóng |
| ST-hop-qua-tran | Hộp gửi | Lỗi dưới ô: «Hôm nay bạn đã gửi 10 tín hiệu — gửi tiếp từ 0 giờ ngày mai», chữ giữ | Chép chữ, đóng |
| ST-hop-loi | Hộp gửi | Lỗi dưới ô: «Chưa gửi được — thử lại», chữ giữ | Gửi lại |
| ST-ds-dang-tai | Trang | Khung xương ba dòng, tiêu đề trang giữ | Chờ |
| ST-ds-rong | Trang | «Bạn chưa gửi tín hiệu nào» + nút «Gửi tín hiệu» | Gửi |
| ST-ds-co | Trang | Bảng: điều đã kể · màn · gửi lúc · trạng thái (chấm + câu) · nút Xoá ở dòng chưa kéo về | Đọc, xoá |
| ST-ds-khong-doc-ban-ve | Trang | Dòng báo «Trạng thái sau gom chưa đọc được…», dòng dùng trạng thái lúc gửi | Đọc |
| ST-ds-xac-nhan-xoa | Trang | «Xoá tín hiệu crm-12?» — «Đội sản phẩm chưa lấy tín hiệu này về. Xoá là mất hẳn» · «Xoá tín hiệu» | Xoá / huỷ |
| ST-ds-loi | Trang | `VungTaiLoi`: tiêu đề, một câu, «Thử lại» | Thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô chữ tối đa 2.000 ký tự, đếm hiện khi còn dưới 200; rỗng hay toàn khoảng trắng thì «Gửi» khoá.
- Mở hộp thì con trỏ vào ô (máy tính); ⌘/Ctrl+Enter gửi; Esc đóng (hỏi lại khi đã gõ).
- Nút trên thanh đầu trang: máy tính có chữ «Gửi tín hiệu»; dưới `md` chỉ biểu tượng, có `aria-label`.
- Biên nhận và lỗi đọc bằng `aria-live="polite"`. Chữ người gõ đánh dấu `translate="no"`.
- Trang: từ `md` là `SimpleTable surface="page"`; dưới `md` là danh sách `Item variant="outline"`. Điều đã kể
  cắt hai dòng, xem đủ khi rê chuột.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Dialog, Field, FieldLabel, FieldError, FieldDescription, Textarea, Spinner | dùng | khuôn hộp «Báo sai» đang chạy |
| PageShell, SimpleTable, Item, Empty, StatusIndicator, ConfirmDialog, VungTaiLoi | dùng | nếp màn của `docs/design.md` |
| NutGuiTinHieu | ghép | nút + hộp trong `apps/app/components/tin-hieu/` — một khu, chưa ai khác cần |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: hộp gửi là một cửa vào nhỏ nổi trên mọi màn ([NGÀNH: Sentry User Feedback widget] — nút cố định, tự ghi
đường dẫn, một ô chữ); xem lại là một danh sách «của tôi» mỗi dòng một trạng thái ([NGÀNH: Canny] — người gửi thấy
trạng thái ý của mình). Không tra thêm: luồng hiển nhiên, cả hai mẫu đều đã có trong kho (hộp «Báo sai», danh sách
«Chờ duyệt»).
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Vòng đời (ba câu của `docs/vong-doi.md` — máy đề xuất, người chốt ở Cổng Phạm vi)

1. **Dọn thế nào:** Xoá — chỉ người gửi, chỉ khi tín hiệu chưa kéo về kho. Không lưu trữ.
2. **«Lịch sử» là gì:** tín hiệu đã được lượt kéo về đóng dấu (đã vào git). Từ đó nút Xoá biến mất, máy chủ từ chối.
3. **Danh sách mặc định:** mọi tín hiệu còn lại của người xem, mới nhất trước. Không có gì cất nên không có chỗ «Đã
   lưu trữ».

## 6. Chứng minh

- Ca API (`apps/api/test/tin-hieu.spec.ts`, kho thử riêng mỗi lượt): gửi, trần, chỉ-của-mình, xoá trước/sau kéo
  về, kéo về chỉ quản trị và đóng dấu.
- Ca khuôn (`packages/validation/test/tin-hieu.spec.ts`): tách nội dung, dựng tệp, đọc bản ghi đường đi đủ năm
  ca khoan dung.
- Lệnh kéo về: chạy trên kho tạm với API giả trả đúng khuôn thủ tục `keoVe` (đầu ra rút từ hàm service thật,
  không viết tay), rồi đọc tệp bằng CHÍNH bộ đọc của kit (`scripts/tin-hieu.mjs` của kit main, `docTinHieu`) —
  0 lỗi; chạy lại → 0 tệp mới, cùng byte.
- Đi trọn vòng kit: dùng `lo-trinh.mjs` + `product-map.mjs` của kit main vẽ `LO-TRINH.html` trên bản sao kho có
  tệp kéo về và khối `tin_hieu:` → khối mang `tin_hieu`; bộ đọc trạng thái của CRM đọc ra câu của kit cho đúng id.
- Màn: ca DOM cho hộp và trang (bảng trạng thái trên), và một phép chụp màn thật hai khổ (1280, 375).
- Mỗi phép đo mới có cặp hai chiều trên cùng vật (luật đo sinh của kit).

## 7. Ngoài phạm vi

- Báo tin cho người gửi khi trạng thái đổi; đính ảnh chụp màn; quản trị xem/gỡ rác trước khi kéo về; kéo về tự
  chạy theo lịch — Later (quét chống sót).
- Bầu chọn, xếp ưu tiên; gom bằng AI; ứng dụng tự commit; sửa tín hiệu sau khi gửi — Never.
- Đổi khuôn tín hiệu; ngăn hồ sơ trong trang Lộ trình (LT1b).

## 8. Giới hạn đã khai

- Trước khi crm nhận kit 2.27, bản vẽ `LO-TRINH.html` của kho chưa mang `tin_hieu`: trang hiện trạng thái lúc gửi
  kèm dòng báo. Phép đo «đi trọn vòng kit» dùng kit main ở máy, không dùng bản kit đang cài.
- Trạng thái sau gom tới người gửi trễ một nhịp gom cộng một lần gộp `onehub` (lối 1).
