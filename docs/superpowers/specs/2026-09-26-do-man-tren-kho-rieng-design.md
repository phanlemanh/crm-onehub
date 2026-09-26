# Đo màn trên kho riêng — thiết kế

Ngày: 2026-09-26 · hồ sơ `_acceptance/do-man-tren-kho-rieng/` · hạng T2

## Vấn đề

Mọi phép đo màn thật (`_acceptance/*/rang/*.mjs` chạy qua `scripts/lan-do/tien-de.mjs`)
và mọi máy chủ dev của mọi worktree dùng chung một kho: `crm@localhost:5432`, tên kho lấy
từ `DATABASE_URL` của `.env` gốc duy nhất. Răng được phép ghi vào kho (gieo chu kỳ OKR,
đặt khoá nghiên cứu giả, tạo người dùng), nên cặn của lượt này là tiền đề hỏng của lượt
khác, và của người dùng.

Đo 2026-09-26: kho `crm` đang giữ ba chu kỳ OKR thử của lượt 4 (`cap-nhat-tuan-okr`).
Thước đã ký `dat-okr-trong-crm/rang/man-okr.mjs` đòi kho có 0 chu kỳ và thoát mã 2 khi gặp
chu kỳ lạ, nên làn ghim lại của `okr-soat-anh-luot-3` (PR #146) không chạy được. Trước đó
đã có tám người dùng `@thu.test` sót lại và va chạm id của `dev-session.ts`. Hôm nay còn
hai máy chủ dev của cây khác đang nghe ở 3811 và 3911 — cổng mặc định mà eval
`dok_man_chrome` khai.

Mẫu đã có trong kho: `bun run test` dựng `crm_<id>_test` mỗi lượt, tạo trước, xoá sau,
dọn kho mồ côi theo tuổi bằng `COMMENT ON DATABASE` (`docs/setup.md` «One run, one
database»). Vòng này làm cùng việc đó cho phép đo màn.

## Ba mảnh

### 1. Kho đo của một cây — `bun run db:do`

`packages/db/scripts/measure-db.ts`, cạnh `test-db.ts`, dùng lại `test-db-admin.ts`
(`withMaintenance`, `dropDatabase`). Hằng số và luật đặt tên ở
`packages/db/src/measure-database.ts` (cùng khuôn `test-database.ts`).

- Tên cây = `PHIEN_DO_TEN_CAY` nếu đặt, không thì tên thư mục gốc của cây
  (`git rev-parse --show-toplevel`); hạ chữ thường, mọi ký tự ngoài `[a-z0-9]` thành `_`.
  `PHIEN_DO_TEN_CAY` cho hai phiên độc lập trong cùng một checkout (răng của vòng này dùng
  nó để mỗi eval có khoá, kho, tệp ghi và thư mục dựng riêng khi Workflow S4 chạy chúng song
  song). Tên sạch (chữ thường, số, gạch ngang đơn) cho kho đo `crm_<cây>_do`; tên khác thêm
  `__<6 ký tự băm của tên gốc>` để hai cây khác tên không bao giờ chung một kho. Kho mẫu mang
  đuôi `__mau_do` — tên kho đo không bao giờ chứa `__mau`, nên không kho đo nào trùng kho mẫu
  (S4 round 1: cây `x-mau` từng trùng kho mẫu của cây `x`).
  Cắt để tổng ≤ 63 ký tự (giới hạn tên của Postgres), giữ nguyên hậu tố.
- Máy chủ = máy chủ của `DATABASE_URL` (thay tên kho). Máy chủ không cục bộ → từ chối
  (mã 2), cùng tập máy cục bộ với `require-local-db.ts`.
- **Kho mẫu.** Seed đầy mất ~30 giây (đo 26/09: 1,4 giây CPU, còn lại chờ mạng lấy icon
  công ty), migrate mất ~1 giây. Kho mẫu dựng một lần bằng `prisma migrate deploy` + seed
  của kho (`prisma/seed.ts`) và mang dấu vân tay (tên các thư mục migration +
  `schema.prisma` + `seed.ts`) trong `COMMENT`. Mỗi phiên tạo kho đo bằng
  `CREATE DATABASE … TEMPLATE <mẫu>` (~1 giây). Dấu lệch → dựng lại mẫu.
- Seed chạy với `BLOB_READ_WRITE_TOKEN` rỗng (không đẩy icon lên kho blob thật — một
  phép đo không ghi ra ngoài) và `NODE_ENV` không phải `test` (nếu là `test`, `client.ts`
  chuyển sang `TEST_DATABASE_URL` và seed nhầm kho).
- Mọi kho do lệnh này tạo mang `COMMENT` bắt đầu bằng `crm phien do` kèm giờ tạo; kho mẫu
  mang thêm giờ dùng gần nhất, cập nhật mỗi lần một kho đo được tạo từ nó.
  `--quet` (và mọi `--tao`) xoá kho mang dấu ấy, không còn kết nối, mà mốc gần nhất (giờ
  dùng nếu có, không thì giờ tạo) cũ hơn `maxAgeMs` (12 giờ). Kho mẫu của một cây còn dùng
  vì thế không bị quét; kho mẫu của cây đã xoá thì bị. Không bao giờ xoá kho không mang dấu,
  và không bao giờ xoá tên không kết thúc bằng `_do`.
- Lệnh: `bun run db:do --tao` (in URL ở dòng cuối) · `--xoa` · `--quet`. Thêm `--ten <cây>`
  để làm cho cây khác tên thư mục (dùng trong test).

Không chép dữ liệu của `crm`: seed của kho là dữ liệu tổng hợp (công ty, deal, tỷ giá mẫu);
răng hiện có cần nó (`man-okr` đòi deal `seed-deal-wise-1`), nên seed tối thiểu
(`SEED_TOI_THIEU`) không đủ.

### 2. Phiên đo — `bun run do:man --chay "<lệnh>"`

`scripts/lan-do/phien-do.mjs`. Hằng số ở `scripts/lan-do/cau-hinh.mjs` (một đối tượng
`PHIEN_DO`: người mặc định, dải cổng, thời hạn chờ, thư mục dựng của app, chỗ ghi nhật ký).

Trình tự:

1. **Khoá theo cây.** Giữ `pg_advisory_lock` trên kho `postgres` suốt phiên, khoá theo tên
   kho đo. Phiên thứ hai trên cùng cây chờ (tối đa `cho.khoaMs`, in một dòng «chờ phiên
   khác của cây này»), không bao giờ chạy chồng. Tiến trình chết (kể cả SIGKILL) thì kết
   nối đóng và khoá tự nhả. Hai cây khác nhau không chờ nhau.
2. **Dọn lượt bị giết.** Tệp ghi `.acceptance-runs/phien-do/<tên kho>/phien.json` (pid
   phiên, nhóm tiến trình của hai máy chủ, tên kho, hai cổng) còn lại nghĩa là lượt trước của
   CÙNG tên kho chết không dọn: giết các nhóm tiến trình ghi trong đó (chỉ tiến trình mà môi
   trường mang `PHIEN_DO=<tên kho này>`, đọc bằng `ps eww`), rồi xoá tệp. Tệp ghi, khoá và
   thư mục dựng đều theo tên kho, nên phiên của tên kho khác không bao giờ đụng máy chủ của
   phiên này.
3. **Kho.** `db:do --tao` (hàm, không qua tiến trình con). Kho cũ cùng tên bị xoá, tạo lại
   từ mẫu.
4. **Cổng.** Chọn hai cổng tự do trong dải `cong.tu..cong.den` (4100–4899). Không dùng cổng
   eval khai sẵn — hôm nay 3811/3911 đang bận vì máy chủ của cây khác.
5. **Máy chủ của chính cây.** API: `bun src/main.ts` ở `apps/api` (không `--watch`, không
   `nestjs-trpc watch` — `src/generated/server.ts` đã nằm trong git). App: `bun run dev`
   ở `apps/app` với `PROTO_DIST_DIR=.next-phien-do-<tên cây>` (thư mục dựng riêng, không tranh khoá
   `.next` với máy chủ dev người dùng đang chạy trong cùng cây; giữ lại giữa các phiên cho
   ấm biên dịch). Cả hai nhận `DATABASE_URL` của kho đo, `PORT`, `APP_URL`, `API_URL`,
   `NEXT_PUBLIC_API_URL`, `PHIEN_DO`; mỗi máy chủ một nhóm tiến trình riêng
   (`detached`), nhật ký ở `.acceptance-runs/phien-do/<tên kho>/{api,app}.log`.
6. **Sẵn sàng.** `API_URL/health` trả 200 (chạm kho) trong `cho.apiMs`; app trả bất kỳ mã
   HTTP nào trong `cho.appMs`; tiến trình con thoát giữa chừng (vd cổng bị giành) → mã 2
   kèm đuôi nhật ký.
7. **Cảnh cây.** Gọi `canhCay()` của `man-cai-dat-noi-tieng-viet/rang/canh-cay.mjs` (nhập,
   không sửa) với `APP_URL` của phiên. Không `dung-cay` → mã 2 với đúng dòng nó in.
8. **Phiên đăng nhập.** `bun run dev:session <NGUOI>` ở `apps/api` trên kho đo, cho
   `NGUOI` (mặc định `PHIEN_DO.nguoi`, cùng hằng `tien-de.mjs` dùng). Lần đăng nhập đầu tạo
   hàng workspace; kho mới dựng chưa có hàng đó lúc seed chạy, nên seed không đặt được mốc
   onboarding (trên kho chung, hàng đã có từ trước khi seed). Phiên đặt mốc ngay sau đó
   bằng `markOnboarded` của `packages/db/src/workspace.ts` — đúng hàm seed dùng.
9. **Lệnh.** `bash -c "<lệnh>"` ở gốc cây với `DATABASE_URL`, `APP_URL`, `API_URL`,
   `PHIEN_DO` của phiên. Mã thoát của phiên = mã của lệnh.
10. **Dọn — `finally` và bắt SIGINT/SIGTERM/SIGHUP.** Giết lệnh nếu còn chạy, SIGTERM hai
    nhóm máy chủ, chờ `cho.donMs`, SIGKILL; xoá kho đo (cắt kết nối trước); xoá tệp ghi;
    nhả khoá. Bị ngắt → mã 130/143/129. Dọn hỏng → in «DỌN HỎNG …» và mã 2 nếu lệnh xanh.

Mã thoát theo quy ước làn đo: hạ tầng hỏng (không dựng được kho, cổng, máy chủ, cảnh cây
khác cây, người đăng nhập) là **mã 2 — không đo được**, không bao giờ mã 1.

Lồng nhau: `PHIEN_DO` trùng tên kho trong `DATABASE_URL` nghĩa là đã ở trong phiên — chạy
thẳng lệnh, không xin khoá (xin lại là tự chờ chính mình).

### 3. `tien-de.mjs` không bao giờ chạy trên kho chung

Hôm nay `tien-de.mjs` ghi `contextDevApiKey`, ảnh đại diện, tên miền được phép vào kho mà
`DATABASE_URL` trỏ tới — tức `crm`. Sửa: trước khi nạp `@crm/db`, nếu `DATABASE_URL` không
phải kho dùng-một-lần (tên kết thúc bằng `_do` của phiên đo nhưng không phải kho mẫu
`__mau_do`, hoặc `_gieo` của kho nháp `kho-nhap.mjs`), `tien-de` tự chạy lại chính nó bên trong một phiên đo:
`phien-do.mjs --chay "bun scripts/lan-do/tien-de.mjs --chay <răng>"`. Kho `_gieo` và kho
`_do` giữ đường cũ, chạy thẳng.

Hệ quả: mọi eval màn hiện có (~60 lệnh `config:` dạng
`APP_URL=${APP_URL:-…} … bun scripts/lan-do/tien-de.mjs --chay "<răng>"`) đổi môi trường
mà không đổi một chữ nào của thước: gọi riêng lẻ (Workflow S4, `repin-lane`) thì mỗi lệnh
một phiên với kho sạch; gói cả làn trong `bun run do:man --chay "<làn>"` thì cả làn dùng
một phiên (nhanh hơn, cặn giữa các eval như trước). Cổng eval khai sẵn bị phiên ghi đè vì
phiên xuất `APP_URL`/`API_URL` của nó, và các lệnh đọc `${APP_URL:-…}`.

Hằng người mặc định của `tien-de` chuyển sang `cau-hinh.mjs` (`PHIEN_DO.nguoi`) để phiên và
`tien-de` không lệch nhau.

Thời hạn: `cho.khoaMs` = 60 phút (phiên chờ khoá của cùng tên kho), `cho.apiMs` = 2 phút,
`cho.appMs` = 3 phút, `cho.donMs` = 10 giây — tất cả trong `PHIEN_DO` của `cau-hinh.mjs`.

## Phương án đã loại

- **`tien-de` từ chối (mã 2) khi không ở trong phiên, bắt mọi người gói bằng `do:man`.**
  Workflow S4 của kit chạy từng eval trong agent riêng và không gói được, nên mọi S4 có
  thước màn sẽ BLOCKED. Tự dựng phiên giữ được «không bao giờ ghi kho chung» mà không đổi
  cách gọi.
- **Một kho mỗi phiên, tên mang id phiên (`crm_<cây>_<id>_do`), cho chạy song song.** Hai
  `next dev` cùng thư mục dựng tranh khoá; mỗi phiên một thư mục dựng thì mất biên dịch ấm.
  Xếp hàng theo cây giữ tên người dùng yêu cầu và giữ ấm.
- **Dùng cổng eval khai sẵn.** Đụng máy chủ của cây khác (3811/3911 đang bận hôm nay).
- **Dựng lại kho giữa từng eval trong một phiên (terminate kết nối rồi tạo lại từ mẫu).**
  Pool của API gặp lỗi ở truy vấn đầu sau khi bị cắt — đỏ ngẫu nhiên. Muốn kho sạch từng
  eval thì gọi riêng lẻ (mỗi lệnh một phiên).
- **Sửa `quet.mjs` và `trang-thai-rong.mjs` sang phiên đo.** Chúng đã chỉ chạy trên kho nháp
  `_gieo` và không bao giờ chạm `crm`; để nguyên.

## Ngoài vòng

Răng không đi qua `tien-de.mjs` mà ghi kho: `tieu-de-cot-doc-tron/rang/mot-luot.sh` (gọi
`tien-de` bên trong nên được che), các lệnh khai cổng cứng (`ccq_chup_hai_vai` 3500,
`lgo_chup` 3300) — cổng cứng đè lên cổng phiên, nên muốn chạy trên kho riêng phải sửa lệnh
của hồ sơ đã ký: không làm ở vòng này. Bản sao `CONG_SAO` của `man-xin-quyen-co-rang` và
`dot-bien.mjs` khởi máy chủ riêng: chạy trong phiên thì nhận `DATABASE_URL` của phiên.

## Chứng

Răng của vòng này không đo trên kho `crm` thật để kết luận «kho chung không đổi»: máy chủ
dev của người dùng và tác tử được phép ghi vào nó bất cứ lúc nào (Out of scope), nên dấu
vân tay của nó lệch vì lý do khác. Răng dựng một kho chung giả (tên không `_do`, không
`_gieo`), gieo dữ liệu lạ, trỏ `DATABASE_URL` vào đó. Kho `crm` thật chỉ được soi thêm
(chỉ đọc) khi `pg_stat_activity` không có kết nối nào khác vào nó.

Mỗi răng dựng phiên bằng `PHIEN_DO_TEN_CAY` riêng của eval, nên Workflow S4 chạy chúng song
song mà không chờ khoá của nhau hay đụng tệp ghi của nhau.

- Năm lệnh ở gốc.
- Bài kiểm `packages/db/test/measure-database.spec.ts` (tên, tạo, mẫu, xoá, quét mồ côi).
- Răng `_acceptance/do-man-tren-kho-rieng/rang/phien.mjs` (đầu-cuối, đỏ, ngắt, SIGKILL,
  xếp hàng, `tien-de` tự dựng phiên, lồng nhau).
- Răng `rang/kho-chung-khong-doi.mjs`: chạy nguyên văn lệnh `dok_man_chrome` của hồ sơ đã
  ký `dat-okr-trong-crm` khi kho chung có chu kỳ OKR lạ — xanh, và dấu vân tay mọi bảng
  của kho chung không đổi.
- Kiểm tra trước khi gộp toàn kho (không `--slug`, `--base origin/onehub`) sạch với mọi
  hồ sơ khác — vòng đổi `tien-de.mjs` mà khoảng 60 lệnh eval của hồ sơ đã ký đi qua.
- Một lượt `repin-lane` thật của `dat-okr-trong-crm` tại HEAD trong khi `crm` giữ ba chu kỳ
  lạ của lượt 4; kết quả ghi vào Notes của hợp đồng.
