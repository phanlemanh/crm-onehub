# Bộ OKR mẫu — thiết kế

Hạng mục M của `docs/plan/lo-trinh-okr.md` (mục 5 «Dựng hết bằng dữ liệu mẫu», dòng M
mục 10). T2: không chạm `schema.prisma`, không chạm quyền.

## Câu giao

«Máy dev có một công ty giả chạy OKR đủ một quý, để mọi lượt sau dựng và đo trên cùng
một bộ.» Bản ý định gốc có thêm «và bản xem trước» — xem «Bản xem trước» dưới đây.

## Hiểu đề

Người dùng của hạng mục này là **các lượt sau** (8a, 8b, 9b, 9c, 10, C, L, T, 7n) và
chủ kho khi mở máy dev: ai cũng đứng trên đúng một công ty giả, nên số đo của hai lượt
so được với nhau. Thành công là: một lệnh nạp xong trong vài giây; màn OKR của máy dev
trông như công ty đang ở tuần 6 của quý; lượt 9b đọc ca góp ý mẫu bằng đúng hàm nó sẽ
dùng để đọc ca thật của N1.

Chủ kho nói: khoảng 40 người tên giả, ba bộ phận, mười phòng ban có trưởng, ít nhất
một người vai «chỉ OKR»; OKR năm cấp OneHub và OKR quý 4 mọi phòng ban, đủ sáu kiểu
KR, vài KR nguồn CRM; sáu tuần Cập nhật tuần, mức tự tin trôi dần, có KR «đáng bàn»
và KR bỏ cập nhật; một quý 3 đã khép; khoảng 30 ca góp ý mẫu, có ca trộn Anh–Việt,
cùng khuôn với golden cases N1; lệnh nạp từ chối production và workspace đã có OKR
thật; không chạm `schema.prisma`.

Máy suy thêm (gạch ở Cổng Phạm vi nếu sai):

- **Mốc thời gian trôi theo ngày nạp.** «Đáng bàn» của bảng họp tuần tính theo hôm
  nay: «tụt» chỉ bắt khi lần cập nhật mới nhất rơi đúng tuần này, «im» khi lần cuối
  cách hôm nay từ 14 ngày (`apps/api/src/okr/hop-tuan.ts`, `OKR_NHAC.imNgay`). Bộ
  ghim lịch cố định thì sau một tuần không còn KR đáng bàn nào. Nên tuần 6 của quý 4
  mẫu luôn là tuần chứa ngày nạp; `--moc YYYY-MM-DD` ghim ngày cho phép đo cần lặp
  lại. Quý 4 mẫu dài 13 tuần bắt đầu thứ Hai của tuần 1; quý 3 mẫu là 13 tuần liền
  trước; năm mẫu chứa cả hai. Tên chu kỳ theo câu chuyện («Quý 4 · mẫu»), không theo
  lịch.
- **Bộ mẫu nhận ra được bằng mã.** Mọi hàng bộ mẫu ghi có mã bắt đầu `mau-okr-`, người
  mẫu có thư điện tử đuôi `@mau.onehub.test` (miền `.test` không bao giờ nhận thư).
  «OKR thật» = bất kỳ chu kỳ, mục tiêu hay KR nào **không** mang tiền tố đó. Máy dev
  hôm nay có 0 chu kỳ, 2 phòng ban, 22 người (đếm 2026-09-28) — nạp được ngay.
- **Workspace đích là workspace duy nhất của kho** (`WORKSPACE_ID`). Không có hàng
  `Organization` đó thì thoát kèm câu ghim bảo chạy `db:seed` trước. Bộ nạp không đánh
  dấu onboard — đó là việc của `db:seed` và của phiên đo. Phòng ban và người sẵn có của
  kho giữ nguyên, đứng cạnh phòng ban mẫu (máy dev hôm nay: 12 phòng ban sau khi nạp).
- **Nạp là nạp lại.** Mỗi lần nạp xoá bộ mẫu cũ rồi ghi bộ mới trong một giao dịch;
  `--xoa` chỉ gỡ. Hàng ngoài bộ mẫu không bị đụng. Xoá đi theo **quan hệ tới thực thể
  mẫu**, không theo tiền tố: lần cập nhật, phiên cập nhật, vết, phiên đăng nhập mà dịch
  vụ thật ghi lên người, KR hay chu kỳ mẫu sau khi nạp cũng đi theo. Một hàng ngoài bộ
  mẫu trỏ vào thực thể mẫu (vd thoả thuận giao cho người mẫu) thì giao dịch cuộn lại và
  lệnh nêu bảng đang giữ.

## Bản xem trước — không nạp được mà không nạp vào production

`docs/setup.md` («Preview deploys share the production database») và cấu hình Vercel
đã đo 2026-09-07 cho hai sự thật: `DATABASE_URL` của preview là cơ sở dữ liệu
production, và app bản xem trước gọi **api production**. Nạp bộ mẫu «vào bản xem trước»
hôm nay chính là nạp 40 người giả và OKR giả vào production — đúng thứ câu giao cấm.

Nên hạng mục này giao **máy dev và phiên đo** (`bun run db:do`, `do:man --chay`), và
lệnh nạp từ chối mọi máy chủ không phải máy cục bộ, không có đường vượt. Bản xem trước
có bộ mẫu khi nó có cơ sở dữ liệu và api riêng — việc cấu hình Vercel/Neon của chủ kho,
khó đảo, ngoài kho. Đây là điểm quyết định duy nhất ở Cổng Phạm vi.

## Cách làm — ba phương án

1. **Tệp dữ liệu + bộ nạp ghi thẳng, mọi hàng đi qua khuôn của sản phẩm (chọn).** Công
   ty viết tay trong một tệp JSON đọc được; diễn biến sáu tuần sinh tất định từ «kịch
   bản» của từng KR. Bộ nạp parse tệp bằng khuôn Zod riêng, rồi đưa từng chu kỳ, KR, số,
   nguồn CRM qua đúng khuôn nhập của sản phẩm (`chuKyInput`, `krInput`,
   `kiemSoTheoKieu`, `datNguonKrInput`, luật chu kỳ quý trong năm) trước khi ghi. Điểm
   gợi ý quý 3 tính bằng `goiYDiem` thật. Nhanh (vài giây), không cần máy chủ chạy, tất
   định. Rủi ro: ghi thẳng bỏ qua dịch vụ nên có thể tạo trạng thái dịch vụ không bao
   giờ tạo → chặn bằng phép đo đọc lại qua **dịch vụ đọc thật** và chạy **thủ tục ghi
   thật** trên bộ đã nạp (AC-12).
2. **Gọi dịch vụ thật trong một ngữ cảnh Nest.** Trung thực nhất (có vết), nhưng
   `setCyclePhase` đọc đồng hồ thật, `datNguonKr` đẩy việc cho tác nhân đọc số CRM (số
   trôi khỏi câu chuyện), mỗi lần đổi chữ ký dịch vụ là bộ mẫu gãy, và cần đủ khoá của
   API để khởi động. Loại.
3. **Sinh ngẫu nhiên như `prisma/seed.ts`.** Ít chữ viết tay, nhưng tên mục tiêu, KR và
   ghi chú ngẫu nhiên không đọc như OKR thật, và ca góp ý không sinh ngẫu nhiên được.
   Loại.

## Thành phần

| Đơn vị | Chỗ | Việc |
| --- | --- | --- |
| Hằng số | `apps/api/scripts/okr-mau/cau-hinh.ts` | `OKR_MAU`: tiền tố mã, miền thư, số tuần, độ dài quý, máy chủ cục bộ |
| Chặn | `apps/api/scripts/okr-mau/chan.ts` | `kiemDuocNap(env)`: máy chủ của `DATABASE_URL` (đúng biến mà Prisma client đọc) phải cục bộ; `NODE_ENV` không phải `production`; `VERCEL_ENV` không phải `production` hay `preview`. Chạy **trước** khi nạp module `@crm/db` |
| Khuôn bộ mẫu | `apps/api/scripts/okr-mau/khuon.ts` | Zod cho `cong-ty.json`: người, cây, chu kỳ, mục tiêu, KR, kịch bản, quý 3 |
| Dữ liệu | `apps/api/scripts/okr-mau/cong-ty.json` | Công ty «Hải Đăng Logistics» giả — xem dưới |
| Diễn biến | `apps/api/scripts/okr-mau/dien-bien.ts` | Hàm thuần: kịch bản + 6 tuần → giá trị, mức tự tin, ghi chú từng tuần |
| Nạp | `apps/api/scripts/okr-mau/nap.ts` | `napBoOkrMau(db, bo, { moc })`, `xoaBoOkrMau(db)`, kiểm OKR thật; một giao dịch |
| Lệnh | `apps/api/scripts/okr-mau.ts`, `okr:mau` ở `apps/api` và gốc | `bun run okr:mau [--moc YYYY-MM-DD] [--xoa]` |
| Khuôn ca góp ý | `packages/validation/src/okr-ca-gop-y.ts` | `caGopY`, `parseCaGopY(value, tep)` — khuôn chung của ca mẫu và ca thật N1 |
| Đọc ca | `apps/agent/evals/okr/ca-gop-y.ts` | `docBoCaGopY(thuMuc)`; `THU_MUC_CA_MAU`, `THU_MUC_CA_THAT` |
| Ca mẫu | `apps/agent/evals/okr/ca-gop-y/mau/*.json` | 30 ca, mỗi tệp một ca |
| Ca thật | `apps/agent/evals/okr/ca-gop-y/that/` | Bị `.gitignore`; N1 bỏ ca vào đây |
| Tài liệu | `docs/setup.md` mục «Bộ OKR mẫu», `CONTEXT.md` mục «Bộ OKR mẫu» | Lệnh, phiên đo, vì sao không có ở bản xem trước |

## Công ty giả

«Hải Đăng Logistics» — 40 người, tên giả Việt, thư `ho.ten@mau.onehub.test`.

- **Khối Kinh doanh** (trưởng khối): KD miền Bắc · KD miền Nam · Chăm sóc đối tác ·
  Marketing.
- **Khối Vận hành**: Kho vận · Điều phối vận tải · Sản phẩm số.
- **Khối Hỗ trợ**: Tài chính · Nhân sự · Pháp chế.

Mỗi phòng ban 3–5 người, một trưởng. Một quản trị (Giám đốc điều hành, vai `admin`).
Người của Tài chính, Nhân sự, Pháp chế mang vai «chỉ OKR» (`okr`) — đúng người ngoài
khối kinh doanh; còn lại vai `member`. Mỗi người có phòng ban chính và người quản lý.

**Năm mẫu** — ba mục tiêu cấp OneHub, mỗi mục tiêu 3 KR, đã công bố.

**Quý 4 mẫu** (pha «Đang chạy») — mỗi phòng ban 2 mục tiêu (một tham vọng), mỗi mục tiêu
2–4 KR; hai mục tiêu cấp bộ phận. Mọi mục tiêu phòng ban căn chỉnh vào một mục tiêu
hoặc KR OneHub. Mỗi kiểu KR có ít nhất ba KR. Năm KR nguồn CRM (thoả thuận chốt được,
thoả thuận mới, gọi hẹn được, bước xong đúng hạn) ở các phòng kinh doanh và điều phối,
có sáu bản chụp số tuần. Một mục tiêu nháp, một mục tiêu đã bỏ — để màn có đủ trạng
thái.

**Sáu tuần Cập nhật tuần** — mỗi người phụ trách một phiên mỗi tuần, mỗi KR một lần. Kịch
bản mỗi KR: `deu` (đều, tự tin cao), `cham` (chậm, cao → vừa), `tut` (tụt đúng tuần 6:
vừa → thấp — thành «đáng bàn» lý do tụt), `bo` (ngừng sau tuần 3 — «đáng bàn» lý do
im, ≥ 14 ngày), `vuot` (vượt đích), `ghi-chu` (ghi chú tuần 6). Mọi KR của một người phụ trách mẫu
(trưởng Pháp chế) chưa gửi tuần 6 — kịch bản `chua-gui`: có người để lượt 4 nhắc và để
phép đo gửi Cập nhật tuần thật. Lần cập nhật tuần k đặt lúc 09:00 thứ Hai tuần đó giờ
Việt Nam, không muộn hơn mốc. Vài ghi chú trộn Anh–Việt
để tóm tắt tuần (9c) có ca khó.

**Quý 3 mẫu** (pha «Đã đóng») — mỗi phòng ban 1 mục tiêu, 2–3 KR; số chốt, điểm gợi ý
bằng `goiYDiem`, điểm người chấm (vài KR khác gợi ý có lý do), điều học được mọi mục
tiêu, ba mục tiêu mang sang quý 4 (`OkrMangSang`), bốn lần cập nhật mỗi KR.

## Ca góp ý — khuôn chung với N1

Một ca là một tệp JSON tự đủ (không trỏ vào cơ sở dữ liệu), để ca thật của N1 — lấy
từ OKR thật đã thay tên — đi cùng khuôn mà không cần nạp gì:

```
{ "id", "bo": "viet-lai" | "ng", "ngonNgu": "vi" | "tron-anh-viet",
  "donVi": { "cap": "onehub" | "bo-phan" | "phong-ban", "ten" },
  "mucTieu": { "title", "whyNow", "kind": "cam-ket" | "tham-vong" },
  "krs": [ { "title", "kind", "startValue", "targetValue", "unit" } ],
  "capTren"?: { "mucTieu", "krs": [ … ] },
  "kyVong": { "vanDe": [MA_VAN_DE…], "vietLai": ["title" | "whyNow" | "kr.title"…],
              "khongGopY": boolean, "khongDuoc": ["chep-kr-cap-tren" | "noi-ve-nguoi"…] },
  "ghiChu" }
```

`vanDe` dùng đúng `MA_VAN_DE` của `okr-tro-ly.ts`; KR đi qua `krInput` và
`kiemSoTheoKieu`. 30 ca: ~20 bộ «viết lại» (Mục tiêu nói việc làm, KR là việc, thiếu đối
trọng, không đo được, trùng ý, Mục tiêu là số), ≥ 5 ca trộn Anh–Việt, ≥ 3 ca câu đã
tốt (`khongGopY: true`), ~6 bộ «NG» (có `capTren`, cấm chép KR cấp trên, cấm nói về hiệu
suất người) — khớp bảng eval của `12-kien-truc-va-lo-trinh.md` §4.11. Đổi mẫu sang
thật = đổi thư mục truyền vào `docBoCaGopY`.

## Lỗi và chặn

- Máy chủ không cục bộ, hoặc `NODE_ENV=production`, hoặc `VERCEL_ENV` là `production`
  hay `preview` → thoát 2, câu ghim, **trước** khi mở kết nối; không có biến vượt (khác
  `ALLOW_REMOTE_DB` của `db:seed`). `VERCEL_ENV=development` (do `vercel env pull` ghi)
  không chặn — máy chủ cục bộ mới là điều kiện.
- Có OKR thật → thoát 3, nêu số chu kỳ/mục tiêu thật, 0 hàng ghi.
- Tệp bộ mẫu sai khuôn hay trái luật sản phẩm → thoát 4, nêu đường dẫn trường hỏng,
  0 hàng ghi.
- Lỗi giữa lúc ghi → giao dịch cuộn lại; bộ cũ (nếu có) còn nguyên.

## Kiểm

- `apps/api/test/okr-mau.spec.ts` (kho `_test` của `bun run test`): nạp, nạp lại, xoá,
  chặn OKR thật, bộ hỏng; đọc lại qua `okr.toanCanh`, `okr.hopTuan`, `okr.bangCham`,
  cây tổ chức; gửi một Cập nhật tuần thật trên KR mẫu. Hàm chặn và hàm diễn biến kiểm
  thuần; lệnh chặn production kiểm bằng tiến trình con.
- `apps/agent/test/okr-ca-gop-y.spec.ts`: đọc thư mục mẫu, tỷ lệ ca, tệp hỏng gọi tên,
  thư mục thật đọc bằng cùng hàm.
- Màn: `_acceptance/bo-okr-mau/rang/man-bo-mau.mjs` qua phiên đo — nạp, đăng nhập trưởng
  phòng mẫu, chụp Toàn cảnh và Họp tuần.

## Không làm

Bản xem trước (xem trên); chạy trên production; gắn bộ mẫu vào kho mẫu của phiên đo
(`crm_<cây>__mau_do`) — các thước đã ký cần kho không có chu kỳ, nên lượt sau gọi
`okr:mau` trong tiền đề của chính nó; ca «tóm tắt tuần» của 9c (9c tự viết ca của nó
trên ghi chú của bộ này); đề xuất và tóm tắt AI đã sinh sẵn (`OkrDeXuat`, `OkrTomTat`).
