# Kanban việc — thiết kế

Hàng DA2 của `docs/plan/lo-trinh-viec-du-an.json`, hồ sơ `_acceptance/kanban-viec/`. Chủ kho mở ở Cổng Đáng
ngày 13/10/2026: build, mở lại «không làm: kéo thả bảng cột» **chỉ cho bảng cột của Việc**. Máy M5 giữ hàng
này; đứng trên DA1 (`viec-chung`, onehub `85c0e4cc9`).

Câu giao: «Tôi kéo việc giữa các cột Chưa làm, Đang làm, Chờ đánh giá, Xong, và tách một việc to thành việc con».

Ngưỡng (đề xuất máy, chủ kho không sửa ở Cổng Đáng): trong 14 ngày đầu dùng thật, ít nhất 40% lần đổi trạng thái
việc làm bằng kéo trên bảng, và ít nhất 10 việc có việc con do ít nhất 3 người tạo; chết khi dưới 15% hay dưới 3.

Đọc trước khi viết: `docs/api.md` mục «Việc», `docs/design.md` (nếp màn, «Vẽ tay là bậc cuối»), `docs/vong-doi.md`,
`docs/proto.md`, `CONTEXT.md` mục «Việc» và «Việc của tôi», hồ sơ DA1 `_acceptance/viec-chung/`, khảo sát
`docs/plan/viec-du-an-nghien-cuu/04-quan-ly-cong-viec.md` (mục kết luận 3–4) và `06-thi-truong-viet.md`. Chuẩn
giao diện kho khai: `web-design-guidelines` (bản tải 13/10). Skill: `nestjs-trpc`, `nuqs`, `prisma-database-setup`.

## Hôm nay

- «Việc của tôi» (`apps/app/app/(app)/[slug]/viec/`) là danh sách ba nhóm (Giao cho tôi · Tôi giao · Đang theo
  dõi), đổi trạng thái bằng nút trong khung việc (`apps/app/components/viec/khung-viec.tsx`).
- Đồ thị trạng thái `DO_THI` (`packages/db/src/viec.ts`) có 13 cặp hợp lệ trên 20; mọi lệnh ghi ở
  `packages/db/src/viec-ghi.ts`, mỗi thay đổi một dòng `ViecVet` với `nguon` ∈ web · zalo · api · chuyen-viec.
- `Viec` không có cột thứ tự, không có cha–con.
- `packages/ui` có `Board` (`board.tsx`, trên `reui/kanban.tsx`) — bảng thoả thuận dùng; nó chỉ báo lần thả
  sang cột khác, không báo vị trí thả, không biết cột nào không nhận một thẻ.

## Hình dạng

```
Việc của tôi ── Kiểu xem: Danh sách | Bảng   (?nhomViec= · ?xemViec=)
   Bảng: [Chưa làm n] [Đang làm n] [Chờ đánh giá n] [Xong n·7 ngày]   + dòng gập «Đã huỷ (n)»
          thẻ: tiêu đề · hạn · người thực hiện · «x/y việc con xong» · «Thuộc: <cha>» · tay kéo · «Chuyển sang…»

Việc ──< con (một tầng)        Việc ──< ViecThuTu >── User   (thứ tự riêng từng người trên bảng của họ)
```

### Bảng dữ liệu

Một migration, không sửa cột cũ:

- **`Viec.chaId String?`** — quan hệ tự trỏ `ViecCon`, `onDelete: Restrict`, chỉ mục `chaId`. Một tầng: việc có
  `chaId` không làm cha; việc đã có con không thành con (kiểm ở hàm ghi, không phải ràng buộc SQL).
- **`ViecThuTu`** — `userId`, `viecId`, `khoa String`, `doiLuc`; unique `(userId, viecId)`, `onDelete: Cascade` cả
  hai phía. Khoá là chuỗi chèn giữa (thư viện `fractional-indexing`, kiểu Figma; khảo sát kết luận 4: «đủ cho
  OneHub mà không cần cân bằng lại theo lịch»). Thứ tự thuộc **chỗ chứa** — ở lượt này chỗ chứa là bảng của
  một người (khảo sát kết luận 3), nên khoá theo người. (Hỏi-1)
- `NGUON_VIEC` thêm `bang-keo` (kéo bằng chuột, chạm hay phím) và `bang-menu` (menu «Chuyển sang…» trên thẻ).
  `LOAI_VET_VIEC` thêm `them-viec-con` (ghi trên việc cha, `sau: { conId, tieuDe }`).

### Một chỗ ghi

Thêm vào `packages/db/src/viec-ghi.ts`, cùng nếp DA1 (nhận `tx`, `docViecGhi` khoá hàng, ném `LoiViec`):

- **`keoViec(tx, { viecId, nguoiId, trangThai, thuTu, nguon, now })`** — một giao dịch: nếu `trangThai` khác
  trạng thái hiện tại thì gọi đúng `doiTrangThai` của DA1 với `nguon` (`bang-keo` / `bang-menu`) — cùng thứ tự
  kiểm 404 → 400 → 403 → vai «chỉ OKR»; rồi ghi lại khoá `ViecThuTu` của người kéo cho danh sách `thuTu` (mã
  các việc của cột đích theo thứ tự trên màn, chỉ những việc người đó thấy). Đổi trạng thái bị từ chối thì
  không ghi khoá nào. Sắp thứ tự không ghi vết: thứ tự riêng không phải thứ người khác thấy hay dựa vào
  (`docs/vong-doi.md` «lịch sử»), nên không làm việc thành «có lịch sử».
- **`taoViecCon(tx, { chaId, nguoiId, tieuDe, nguoiThucHienId?, hanNgay?, now })`** — người gọi phải là người
  giao hay người thực hiện của cha (như quyền sửa, gắn — `docs/api.md`); cha phải đang mở và không phải con;
  tạo việc qua `taoViec` của DA1 (người giao = người gọi, người thực hiện mặc định là người gọi), rồi chép từng
  bản ghi gắn của cha qua `ganBanGhi` và thêm người giao, người thực hiện của cha làm người theo dõi qua
  `themTheoDoi` (bỏ qua ai đã có vai). Hai hàm này đã gọi `kiemNguoiNhanViec`, nên con của việc gắn đối tác không
  tới được người vai «chỉ OKR». Cuối cùng ghi vết `them-viec-con` lên cha.

Vì sao chép gắn và người (Hỏi-5 — máy khuyên, chủ kho chốt): luật thấy việc của DA1 giữ nguyên («Việc gắn ít nhất một bản ghi đối tác thì ai đọc
được dữ liệu đối tác cũng thấy; việc không gắn gì là việc riêng, chỉ ba vai người trong cuộc thấy» —
`CONTEXT.md`). Con mang gắn của cha thì ai thấy cha gắn đối tác cũng thấy con; cha riêng thì người giao và
người thực hiện của cha vẫn thấy con nhờ vai theo dõi. Sau lúc tạo, gắn của cha và con sống riêng.

### API

Router `viec`, sau `PhamViDoiTacMiddleware` như DA1:

- **`viec.bang({ nhom })`** — bốn cột theo thứ tự `CHUA_LAM · DANG_LAM · CHO_DANH_GIA · XONG`, mỗi cột
  `{ trangThai, tong, viec[] }`; cột Xong chỉ việc có `khepLuc` trong `VIEC.bang.xongGanDayNgay` (7) ngày, `tong`
  đếm đủ để thẻ cuối cột nói còn bao nhiêu (Hỏi-2); kèm `soHuy`. Trong cột: việc có khoá của người xem theo khoá,
  việc chưa có khoá đứng đầu theo hạn rồi `taoLuc` (việc mới đến nổi lên trên). Mỗi việc mang
  `chuyenDuoc: TrangThaiViec[]` (đích người xem được phép, máy chủ tính từ `DO_THI` + vai — giao diện không tự suy
  đồ thị), `con: { xong, tong } | null` (không tính Huỷ), `cha: { id, tieuDe } | null`, `conMo` (số con đang mở).
- **`viec.keo({ id, trangThai, thuTu, nguon })`** — gọi `keoViec`; trả việc sau khi đổi.
- **`viec.taoCon({ chaId, tieuDe, nguoiThucHienId?, hanNgay? })`** — gọi `taoViecCon`.
- **`viec.get`** thêm `cha`, danh sách `con` (tiêu đề, trạng thái, người thực hiện) và `conMo`.

### Giao diện

- **Kiểu xem.** «Việc của tôi» thêm `ViewSwitch` «Kiểu xem: Danh sách | Bảng» cạnh chip nhóm; giá trị trên đường
  dẫn `?xemViec=bang` bằng `nuqs` (khoá mới trong `apps/app/lib/search-param-keys.ts`), cùng `?nhomViec=`.
- **Bảng** (`apps/app/components/viec/bang-cot-viec.tsx`) dựng trên `Board` của `packages/ui`. `Board` mở rộng
  (trong `packages/ui`, không ghép tay ở chỗ gọi) hai lựa chọn không bắt buộc, bảng thoả thuận không đổi:
  `canDrop(cardId, columnId)` — đang kéo thì cột không nhận mờ đi (`data-khong-nhan`), thả vào đó không gọi
  `onMove`, lời đọc màn hình nói «Không chuyển được sang …»; `reorder` — báo cả lần thả trong cùng cột, và mọi
  lần thả kèm thứ tự mới của cột đích.
- **Thẻ.** Tiêu đề (`translate="no"`), hạn (`HanViec`, quá hạn chấm `error`), người thực hiện (ở nhóm Tôi giao
  và Đang theo dõi), «x/y việc con xong», dòng «Thuộc: <cha>» cho việc con. Bấm thẻ mở khung việc
  (`useOpenRecord`). Nút «Chuyển sang…» (menu chỉ liệt kê đích được phép, nhãn là động từ của DA1: Bắt đầu, Gửi
  đánh giá, Đánh dấu xong, Làm lại, Về «Chưa làm») — lối bấm thay cho kéo theo chuẩn giao diện kho. Ở nhóm «Đang
  theo dõi» thẻ không có tay kéo, không có nút menu. Thẻ khác mà không có đích nào (người thực hiện ở việc «Chờ đánh
  giá») vẫn nhấc được — mọi cột mờ, thả không gọi máy chủ — và nút menu bị khoá kèm một dòng nói chỉ người giao xử lý.
- **Kéo lạc quan.** Thả là thẻ sang cột mới ngay, thẻ ở trạng thái chờ (`pendingIds`); máy chủ từ chối thì thẻ
  về chỗ cũ, toast nói lý do máy chủ trả và bảng tải lại (nếp của `deals/use-deal-board-move.ts`).
- **Đóng cha còn con mở.** Thả việc cha vào Xong, chọn «Đánh dấu xong» trong menu, hay bấm Xong/Huỷ trong khung
  việc khi `conMo > 0` → `ConfirmDialog` «Việc này còn n việc con chưa xong. Vẫn đánh dấu xong?» (Huỷ: «Vẫn
  huỷ?»). Đồng ý: cha đổi, con giữ nguyên (bẫy x4 của lộ trình). Không đồng ý: không ghi gì, thẻ về chỗ cũ. Hỏi lại thay vì chặn hay tự đóng con: da_bac x4 của lộ trình.
- **Việc con trong khung việc.** Mục «Việc con (x/y)» dưới phần chi tiết: danh sách `Item` (tiêu đề, người thực
  hiện, trạng thái), bấm mở khung con; nút «Thêm việc con» mở ô soạn gọn (tiêu đề, người thực hiện, hạn —
  `OSoanViec` thêm chế độ `cha`, không có ô gắn bản ghi). Khung việc con có dòng «Thuộc việc: <cha>» bấm được và
  không có nút thêm việc con. Khung chỉ hiện nút thêm cho người giao và người thực hiện của việc mở.
- **Điện thoại 375.** `ViewSwitch` thành ô chọn; bảng cuộn ngang trong khung của nó, trang không cuộn ngang; tay
  kéo rộng 44px với con trỏ thô (đã có ở `Board`); menu «Chuyển sang…» là lối chính.
- **Chữ** ở `apps/app/lib/messages/viec.ts`, khoá mới dưới `bang.*` và `con.*`.

### Vòng đời — ba câu của `docs/vong-doi.md`

1. **Dọn thế nào:** việc con là Việc — Xoá khi chưa có lịch sử, còn lại khép bằng Xong hay Huỷ, mở lại được.
2. **«Lịch sử»:** mọi vết ngoài «tạo» (như DA1); thêm việc con ghi `them-viec-con` lên cha, nên cha đã có con thì
   không xoá được. Sắp thứ tự không ghi vết.
3. **Danh sách mặc định:** bảng hiện việc mở và việc Xong trong 7 ngày; Huỷ ở dòng gập «Đã huỷ (n)» dưới bảng như
   danh sách; Xong cũ hơn ở kiểu Danh sách, dòng cuối cột Xong dẫn tới đó.

### Đường đo

`_acceptance/kanban-viec/rang/do-nguong.mjs` (chỉ đọc; `--tu`, `--den`) in JSON: `doiTrangThaiNguoi` (vết
`doi-trang-thai` có `nguoiId`), `quaBangKeo` (`nguon = bang-keo`), `quaBangMenu`, `tiLeBangKeo`, `tiLeBang` (kéo cộng menu), `viecCoCon` (việc
có `them-viec-con` trong khoảng), `nguoiTaoCon` (số người khác nhau). Ngưỡng đọc `tiLeBangKeo` nếu chủ kho giữ
khuyến nghị ở Hỏi-4, `tiLeBang` nếu chọn đếm cả menu.

Dữ liệu mẫu: `gieoViecMau` (`packages/db/src/viec-gieo.ts`) thêm một việc cha gắn thoả thuận mẫu với ba việc
con (một Xong, một Đang làm, một Chưa làm) qua `taoViecCon`, và hai lần đổi trạng thái qua `keoViec` — đường
ghi thật, không chèn thẳng bảng; `db:seed` đã gọi nó.

## Ngoài lượt này

- Checklist trong việc (Hỏi-3).
- Kéo thả bảng cột của kế hoạch onboard 30 ngày — chủ kho giữ «không làm» ở Cổng Đáng.
- Kéo đổi người thực hiện, cột theo trường khác, làn ngang, giới hạn WIP, bắt điền trường khi sang cột.
- Việc con nhiều tầng, đổi cha, gỡ con khỏi cha.
- Bảng cột trong khối «Việc» của thoả thuận, công ty; bảng của Dự án (DA4).
- Thao tác hàng loạt trên bảng.
- Đo ngưỡng trên dữ liệu thật — sau gộp, ở Cổng Giá trị.

## Rủi ro

- **DA1b chạy song song** sửa `viec-ghi.ts`, `viec.ts` và có thể có migration. DA2 chỉ thêm hàm và giá trị mới, không
  sửa thân hàm cũ nào (`doiTrangThai` đã nhận `nguon` qua `DauGhi`); M5 chốt 13/10: vòng ký Cổng 2 trước gộp trước; trước khi đẩy kiểm `origin/onehub` và mốc migration, báo M5 xếp
  thứ tự gộp.
- **`Board` là thành phần dùng chung** (bảng thoả thuận, danh mục 30 ngày, trang Lộ trình). Hai lựa chọn mới không
  bắt buộc; bài kiểm của `Board` hiện có phải còn xanh. Báo #375 qua M5 vì chạm `packages/ui`.
- Khoá chèn giữa dài dần khi chèn mãi vào một khe; ở quy mô một người một bảng không cần cân bằng lại (khảo sát
  kết luận 4), nhưng `khoa` không giới hạn độ dài cứng.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: thanh trái › «Việc của tôi» → «Kiểu xem: Bảng» → kéo thẻ từ «Chưa làm» sang «Đang làm» → thẻ ở cột
  mới, số đếm hai cột đổi (điểm ra: bảng). Tách việc: bấm thẻ → khung việc → «Thêm việc con» → tiêu đề, người
  thực hiện → «Thêm» → con hiện trong mục «Việc con» và trên bảng của người nhận.
- Biên: người theo dõi xem bảng — thẻ không có tay kéo; thẻ không có đích hợp lệ khi kéo — các cột mờ; cha còn con
  mở mà bị đóng — hộp hỏi lại; cột rỗng — dòng «Chưa có việc»; việc con không thêm được con.
- Lỗi & quay lại: máy chủ từ chối lần kéo (việc vừa bị huỷ, quyền vừa đổi) → thẻ về cột cũ, toast nêu lý do, bảng
  tải lại; tải bảng hỏng → `VungTaiLoi` «Không tải được bảng việc» + «Thử lại»; thêm việc con hỏng → lỗi dưới
  nút, chữ đã gõ còn.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Việc của tôi › Bảng | đẩy việc của mình sang bước kế | thanh trái, kiểu xem Danh sách / khung việc |
| Khung việc › Việc con | chia một việc to cho nhiều người | thẻ trên bảng, Việc của tôi / khung việc con |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-viec-cho-tai | Bảng | tiêu đề trang giữ nguyên, khung xương bốn cột, mỗi cột ba thẻ | chờ |
| ST-bang-viec-loi | Bảng | `VungTaiLoi`: «Không tải được bảng việc» + «Thử lại» | thử lại |
| ST-bang-viec-rong | Bảng | bốn cột, mỗi cột «Chưa có việc»; nút «Giao việc» ở đầu trang | giao việc |
| ST-bang-viec-co-viec | Bảng | bốn cột có số, thẻ có hạn, «x/y việc con xong», «Thuộc: …»; dòng gập «Đã huỷ (n)» | kéo, mở menu, bấm thẻ |
| ST-bang-viec-dang-keo | Bảng | thẻ nổi theo con trỏ; cột nhận được viền `ring`, cột không nhận mờ | thả |
| ST-bang-viec-cho-luu | Bảng | thẻ ở cột mới, tay kéo khoá tới khi máy chủ trả lời | chờ |
| ST-bang-viec-tu-choi | Bảng | thẻ về cột cũ, toast lý do («Chỉ người giao được …») | đọc, thử lối khác |
| ST-bang-viec-menu | Bảng | menu «Chuyển sang…» chỉ các đích được phép | chọn đích |
| ST-bang-viec-hoi-dong-cha | Bảng / khung việc | `ConfirmDialog` «Việc này còn n việc con chưa xong. Vẫn đánh dấu xong?» | đồng ý hay thôi |
| ST-bang-viec-chi-xem | Bảng (Đang theo dõi) | thẻ không tay kéo, không menu | bấm thẻ để xem |
| ST-bang-viec-dien-thoai | Bảng (375) | ô chọn kiểu xem; bảng cuộn ngang trong khung; menu là lối chính | chọn đích từ menu |
| ST-khung-viec-con | Khung việc | mục «Việc con (x/y)», danh sách con, nút «Thêm việc con» | thêm, mở con |
| ST-khung-viec-con-soan | Khung việc | ô soạn gọn: tiêu đề, người thực hiện, hạn, «Thêm» | gửi |
| ST-khung-viec-la-con | Khung việc con | dòng «Thuộc việc: <cha>»; không nút thêm việc con | mở cha |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kéo bằng chuột bắt đầu sau 4px; bằng chạm giữ tay kéo; bằng phím: Tab tới tay kéo, Space nhấc, mũi tên đổi cột
  và vị trí, Space thả, Esc thôi — lời đọc màn hình tiếng Việt cho từng bước.
- Chỉ animate `transform` và `opacity`; tôn trọng `prefers-reduced-motion`.
- Số đếm `tabular-nums`; tiêu đề dài xuống dòng (`break-words`), thẻ `min-w-0`.
- Tiêu đề việc con bắt buộc, tối đa 200 ký tự như DA1; nút giữ bật tới khi gửi, rồi «Đang thêm…».
- Kiểu xem và nhóm nằm trên đường dẫn; F5 giữ nguyên.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `ViewSwitch` | dùng | `docs/design.md`: chuyển kiểu xem bằng `ViewSwitch`, không tự ghép |
| `Board` | mở rộng (`canDrop`, `reorder` trong `packages/ui`) | bậc 1 có bảng cột; biến thể mới phải sống ở `packages/ui` |
| `DropdownMenu`, `ConfirmDialog`, `Item`, `Badge`, `StatusIndicator`, `VungTaiLoi`, `Skeleton` | dùng | thành phần sẵn của bậc 1 |
| `OSoanViec` (chế độ `cha`) | mở rộng | ô soạn việc của DA1, bớt ô gắn bản ghi |

Tra bậc 1 trước: `packages/ui/src/components/board.tsx` (có), `sortable-list.tsx` (một cột dọc, không đủ cho
nhiều cột), `reui/kanban.tsx` (nền của `Board`). Không cần bậc 2–5.

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: kanban
Căn cứ: câu giao gọi tên bốn cột và lối kéo giữa chúng; khảo sát DA0 ghi mọi hãng Việt đều có «Bảng (Kanban)» theo
trạng thái (`06-thi-truong-viet.md` dòng D1: Base, 1Office, MISA AMIS, Getfly, Fastwork). Khung việc giữ khuôn
danh-sách-chi-tiết của DA1. Không có khuôn thứ hai khả dĩ, nên không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
