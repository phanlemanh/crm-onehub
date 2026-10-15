# Vệ sinh đỏ sẵn onehub — thiết kế

Hồ sơ: `_acceptance/ve-sinh-do-san-onehub/`. Gốc: `onehub` `f46c0bbda`. Nhánh `fix/ve-sinh-do-san-onehub`.

## Vì sao có vòng này

PR DH2 (`trang-don-vi-mot-bang`) phải ghim lại các hồ sơ đã ký nó chạm. Hai lượt ghim lại đỏ vì lỗi có sẵn
trên `onehub` (đo ở `eb5ab4269`, nhật ký `do-san-onehub/*.log` trong worktree DH2). Chủ kho chọn đường B:
tách bốn mục ra một vòng riêng, gộp trước, rồi DH2 ghim lại trên bản đã vệ sinh. Bốn mục:

1. Lỗi hydration khi mở thẳng đường có `record=`.
2. Lỗi 403 khi quản trị mở cuộc soạn của người khác.
3. Phép quét chuỗi của `man-cai-dat-noi-tieng-viet` bắt nhầm `hinh="the"`.
4. Các sửa gốc đã làm trên nhánh DH2 (neo F8, khai trang, `new Date`, toàn cảnh E2/E21).

## Mục 1 — hydration khi mở thẳng `record=`

### Cơ chế (điều tra chỉ-đọc 15/10, phiên DH2)

`app/(app)/[slug]/layout.tsx` đặt `RecordSheetHost` trong một `Suspense` riêng. Ranh giới đó không chờ gì nên
về trình duyệt và hydrate TRƯỚC các khối trang còn đang stream. Lúc hydrate, ngăn bản ghi tạo sẵn truy vấn
rỗng (trạng thái pending, `dataUpdatedAt = 0`) cho các khoá mà trang cũng nạp sẵn:

| Ngăn | Khoá ngăn tạo | Trang nạp sẵn cùng khoá |
| --- | --- | --- |
| `record=soan:` (`trang-soan.tsx:203`) | `okr.access` | `theo-don-vi/page.tsx:47`, `dau-trang-okr.tsx:57` |
| `record=deal:` (`deal-sheet.tsx:155,302`, `lib/giai-doan.ts:46`) | `users.list`, `giaiDoan.list` | `deals/page.tsx:76-77` |
| `record=deal:` trên Theo đơn vị | chưa chứng | — |

Khi khối trang về, `HydrationBoundary` (`lib/trpc/hydrate.tsx:8`) thấy khoá đã có trong bộ đệm mà dữ liệu máy
chủ mới hơn, nên hoãn nạp sang `useEffect` (luật của TanStack Query v5: khoá đã tồn tại thì không nạp trong lúc
render). Lần render đầu của cây trang đọc dữ liệu rỗng trong khi HTML máy chủ có dữ liệu → React báo
«Hydration failed» (lệch chữ) hoặc «attributes didn't match» (lệch thuộc tính). Chập chờn vì phụ thuộc thứ tự
stream về.

### Cách B (chủ kho duyệt ở phiên DH2)

Bọc ngăn bằng một server component `NganBanGhiNapSan` trong `layout.tsx`, vẫn trong `Suspense` riêng:

```
<Suspense fallback={null}>
  <NganBanGhiNapSan />          // await connection(); vai từ loadWorkspace() (đã có trong layout)
</Suspense>                     // prefetch các khoá trùng rồi <HydrateClient><RecordSheetHost/></HydrateClient>
```

- Ngăn hydrate trước → các khoá trùng vào bộ đệm bằng dữ liệu máy chủ (khoá mới → nạp ngay trong render).
- Khối trang về sau mang cùng khoá với cùng `dataUpdatedAt` (cùng `QueryClient` máy chủ theo yêu cầu,
  `staleTime` 30 giây nên lần prefetch thứ hai dùng lại) → không «mới hơn» → không hoãn → lần render đầu có dữ
  liệu, khớp HTML.
- Ngăn về sau trang → dữ liệu của ngăn không mới hơn → bỏ qua. Không hại.
- `layout` không đọc được `record=`, nên máy chủ nạp sẵn trên mọi trang `[slug]` khi tải cứng (điều hướng mềm
  không dựng lại layout). Giá: ba truy vấn nhỏ mỗi lần tải cứng, đã có `staleTime` nên trang trùng khoá không
  gọi lại API.
- **Chỉ đổ vào bộ đệm khi ngăn có bản ghi** (phản biện gap-probe P1): nếu đổ trên mọi trang, một trang không nạp
  sẵn `users.list` mà có thành phần khách đọc khoá đó sẽ có dữ liệu ở lần render đầu phía trình duyệt trong khi
  HTML máy chủ rỗng — hydration ngược chiều trên trang hôm nay đang xanh. Vì vậy server component chỉ chuyển trạng
  thái đã `dehydrate` xuống một thành phần khách `NapSanKhiMoNgan`; thành phần này đọc `useRecordStack()` và chỉ
  bọc `HydrationBoundary` khi ngăn có ít nhất một bản ghi (đọc từ `record=` của URL — máy chủ và trình duyệt thấy
  cùng giá trị nên cùng nhánh). Không `record=` → không nạp gì, như hôm nay. Mở ngăn bằng bấm sau khi tải (điều
  hướng mềm) → ranh giới cũng bọc, nhưng lúc đó trang đã hydrate xong nên khoá có sẵn không bị hoãn, khoá mới chỉ
  thêm dữ liệu sẵn cho ngăn.
- Đo hồi quy trên trang không có `record=`: tám trang đọc một khoá nạp sẵn hoặc nằm cạnh ngăn (tổng quan, Thoả
  thuận, Liên hệ, Công ty, Của tôi, Theo đơn vị, Toàn cảnh, Cài đặt › Giai đoạn), 1440 và 390, 2 lượt mỗi khổ.
- Danh sách khoá theo vai sống ở MỘT module chung `apps/app/lib/ngan-ban-ghi-nap-san.ts` (không `server-only`,
  để bài kiểm đọc được): `khoaNapSan(vai)` trả tên khoá. Vai chỉ-OKR bị cấm `users.list` và không mở được thoả
  thuận → chỉ `okr.access`. Vai khác → `okr.access`, `users.list`, `giaiDoan.list`. Server component ánh xạ tên
  khoá sang `queryOptions()` của tRPC.
- Bước 0 của S3: đo ca Theo đơn vị + `record=deal` bằng răng mới (in nguyên văn thông báo React, không cắt) để
  chứng khoá trùng thật trước khi chốt danh sách. Khoá đo được nằm ngoài ba khoá trên thì thêm vào danh sách,
  ghi một dòng sổ `fix`.

Lối đã loại: cách A (gắn nội dung ngăn sau `document.readyState === "complete"` + một nhịp) — không có tín hiệu
«hydrate xong» chính thức nên vẫn có thể chập chờn, và ngăn hiện chậm khi tải cứng. Cách C (tự viết
`HydrationBoundary` nạp đè khoá pending trong render) — đổi hành vi của thư viện, chủ kho đã chọn B.

## Mục 2 — 403 khi quản trị mở cuộc soạn của người khác

`usePhienCuoc` (`okr/soan/dung-cuoc-soan.ts:99-110`) chạy `loadThread` tới `/eve/agents/okr` khi
`trangThai === "dang"` mà không kiểm người mở. Route `app/eve/agents/okr/eve/v1/[...path]/route.ts:87-89` trả
403 `cuocKhongThuocBan` cho người không mở cuộc. `loadThread` nuốt lỗi, trả `offline`.

Sửa: `usePhienCuoc` đọc `trpc.users.me` và chỉ bật truy vấn luồng khi `cuoc.nguoiMo.id === me.id`. Không nới
route (đó là đổi bảo mật). Với người xem không phải người mở, luồng vắng (`undefined`) — `composerState` và
`eventsOf` xử lý `undefined` y như `offline` với `events: []`, nên khung hiện như hôm nay. Trong lúc chờ
`users.me` ở cuộc đang soạn, `ThanCuoc` vẫn hiện «đang mở» như lúc chờ luồng (không nháy Than → chờ → Than).
`users.me` không trang nào nạp sẵn nên không tạo khoá trùng mới cho mục 1.

Khung bài kiểm khu soạn (`apps/app/test/khung-soan-okr.tsx`) đặt mặc định `users.me` là người mở của cuộc mẫu,
để các bài soạn hiện có vẫn tải luồng như cũ.

## Mục 3 — `moi-chuoi` bắt nhầm `hinh="the"`

`KhungXuong` (`packages/ui/src/components/khung-xuong.tsx`) nhận `hinh: HinhKhungXuong` — một mã liệt kê
(`bang`, `danh-sach`, `the`, `tong-quan`, `chi-tiet`), không phải chữ người đọc. Từ `665d85b34`
`settings/page.tsx:39` và `settings/currencies/page.tsx:36` dùng `hinh="the"`, nên `rang/moi-chuoi.mjs` báo
«CON TIENG ANH … [thuoc:hinh] "the"» và E16 của `khung-trang-cai-dat` (chạy lại nó) đỏ.

Sửa đúng định nghĩa — hai lối, chủ kho chọn ở Cổng Phạm vi (Hỏi-1):
(a) **khuyến nghị** — thêm `hinh` vào `thuoc_jsx_ky_thuat` của `khong-phai-chu-nguoi-doc.json` (bản khai RIÊNG của
lát cài đặt) — cùng chỗ đã khai `variant`, `size`, `tone`; trong lát cài đặt chỉ `KhungXuong` có prop `hinh`.
(b) thêm chiều «theo thành phần» (`KhungXuong.hinh`) vào khuôn bản khai và vào `moi-chuoi.mjs` — hẹp hơn, nhưng
sửa mã của thước đã ký mà năm lát dùng chung. Hai chiều: bản sao bỏ khai → đỏ ghim đúng hai dòng cũ; bản
sao chèn một chữ tiếng Anh thật vào `settings/page.tsx` → vẫn đỏ ghim chữ đó (thước không nới).

## Mục 4 — sửa gốc mang từ nhánh DH2

Cherry-pick nguyên commit (đã ở nhánh): `1e61d3448`, `0593568eb`, `31bb99271`, `c443f59eb`; từ `c4647994d` chỉ
hunk `toan-canh-okr` E21. Mỗi chỗ sửa trên hồ sơ đã ký giữ chú thích khai, nhãn đổi sang slug vòng này
(`// F8 neo (ve-sinh-do-san-onehub):`, `// ve-sinh-do-san-onehub cach-toi:`). Kiểm tĩnh 15/10 trên nhánh:
`osa_soi_ma` 19/19, `osa_ktcd_khong_trinh_duyet`, `osa_san_thiet_ke` 9/9, `sk_luat` — đều mã 0.

## Ghim lại

Sau S3: tập hồ sơ đã ký bị chạm = hồ sơ có eval mà `paths` khớp tệp trong diff `merge-base..HEAD` (lưới
pre-merge tính). Xin lượt `ghim-lai` qua Điều phối M5, chạy `repin-lane.mjs` một lượt cho cả tập. Eval E11 đọc
lưới pre-merge, chỉ nhận vi phạm của chính hồ sơ này.

## Đo chiều đỏ

Răng `rang/chieu-do.mjs --ca <tên>` dựng `git worktree add --detach` tạm ở HEAD, symlink `node_modules` và
`.env` về cây thật, áp đột biến của ca vào bản sao, chạy lệnh của ca, đòi mã khác 0 và thông điệp ghim, rồi gỡ
worktree. Không ghi gì vào cây làm việc (bài học DH1: đột biến tại chỗ làm S4 REJECT oan): trước và sau mỗi ca
chụp `git status --porcelain -uall` cộng `git hash-object` của mọi tệp đang sửa hay chưa theo dõi; khác → «CHIEU DO
GHI CAY <tệp>». Tự kiểm: ca giả ghi một byte vào một tệp đang sửa phải đỏ.

| Ca | Đột biến | Đòi |
| --- | --- | --- |
| `hydrat` | `layout.tsx` về bản merge-base | răng hydrat đếm lỗi theo từng ô; ô có ≥3/10 là «tái hiện», 1–2 là «tái hiện yếu», 0 là «không tái hiện»; đạt khi ≥1 ô tái hiện |
| `nap-san` | `khoaNapSan` bỏ `users.list` | bài DOM đỏ «trang doc rong luc hydrate: users.list» |
| `403` | bỏ điều kiện người mở trong `usePhienCuoc` | bài DOM đỏ «tai luong cuoc nguoi khac» |
| `moi-chuoi-khai` | bỏ `hinh` khỏi bản khai | `moi-chuoi` đỏ ghim `settings/page.tsx:39 [thuoc:hinh] "the"` |
| `moi-chuoi-that` | chèn `<p>Loading settings</p>` vào `settings/page.tsx` | `moi-chuoi` đỏ ghim `"Loading settings"` |
| `ghim` | xoá dòng repin cuối của một hồ sơ chạm | răng ghim đỏ gọi tên hồ sơ |

## Rủi ro

- Ca Theo đơn vị + `record=deal` có khoá trùng ngoài ba khoá → bước 0 đo trước, thêm khoá.
- Thứ tự stream ở máy đo khác máy người dùng → đo ≥5 lượt mỗi ô ở 1440 và 390, cộng chiều đỏ trên bản sao.
- Bài soạn hiện có phụ thuộc luồng được tải → khung bài kiểm đặt `users.me` mặc định là người mở.
- Diff chạm `apps/app/**` → nhiều hồ sơ đã ký có `paths` rộng bị chạm → làn ghim lại có thể dài; xin lượt sớm.
