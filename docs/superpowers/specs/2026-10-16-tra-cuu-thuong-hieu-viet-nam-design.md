# Tra cứu thương hiệu cho công ty Việt Nam — thiết kế

Ngày: 2026-10-16 · Hạng: T2 · Hồ sơ: `_acceptance/tra-cuu-thuong-hieu-viet-nam/`

## Vấn đề

Chủ kho chụp ngăn công ty «Công ty BĐS Titan Miền Nam»: logo Meta, mô tả tiếng Anh về kính
Ray-Ban, «Menlo Park, CA, United States · Technology». Hai lỗi chồng nhau:

1. **Tra nhầm công ty.** Tên miền của bản ghi là `facebook.com`. Ô «Tên miền» nhận cả đường
   dẫn («Dán cả đường dẫn cũng được — hệ thống rút về tên miền gốc»), nên rep dán trang Facebook
   của công ty thì `normalizeDomain` rút về `facebook.com`, tác nhân tra context.dev theo tên miền
   đó và nhận thương hiệu Meta. Với môi giới bất động sản Việt Nam, trang Facebook, Zalo OA hay
   trang hồ sơ trên batdongsan.com.vn thường là «trang web» duy nhất họ có — lỗi này sẽ lặp.
2. **Tiếng Anh.** `brand.retrieve` của SDK context.dev 2.10.0 có tham số `force_language`
   (`'vietnamese'` có trong danh sách) ở cả bốn kiểu tra; `apps/agent/agent/lib/context-dev.ts`
   không truyền, nên mô tả về tiếng Anh. Tên quốc gia («United States») lưu nguyên chữ nhà cung cấp
   trả và hiện nguyên như thế, dù ứng dụng có hai ngôn ngữ (`vi` mặc định, `en`).

Thêm một chi tiết làm phần (2) vô hiệu với bản ghi cũ: `brandToUpdate` chỉ điền trường còn
trống, nên «Tra cứu lại» không thay được mô tả tiếng Anh đã điền.

## Cách làm

### A. Một danh sách tên miền nền tảng, ba chỗ dùng

Mô-đun mới `packages/validation/src/ten-mien-nen-tang.ts` giữ danh sách và một hàm:
`nenTangCuaTenMien(input) → { ten: string } | null` — nhận chuỗi rep gõ (tên miền trần hay đường
dẫn đủ), rút host theo đúng luật của `normalizeDomain` (bỏ `www.`), khớp **host bằng đúng tên miền
nền tảng hoặc kết thúc bằng `.` + tên miền đó** (bắt `m.facebook.com`, `vn.linkedin.com`, không bắt
`box.com` khi danh sách có `x.com`, không bắt `myzalo.me`). Trả tên nền tảng để câu báo gọi đúng tên.

Danh sách (nhóm theo nền tảng, mỗi nhóm một tên hiển thị):

| Tên | Tên miền |
|---|---|
| Facebook | facebook.com, fb.com, fb.me, m.me, messenger.com |
| Instagram | instagram.com |
| Threads | threads.net |
| Zalo | zalo.me |
| LinkedIn | linkedin.com, lnkd.in |
| TikTok | tiktok.com |
| YouTube | youtube.com, youtu.be |
| X | x.com, twitter.com |
| Telegram | t.me, telegram.me |
| Linktree | linktr.ee |
| Batdongsan | batdongsan.com.vn |
| Chợ Tốt | chotot.com, nhatot.com |
| Alonhadat | alonhadat.com.vn |
| Muaban | muaban.net |

Ba chỗ dùng:

- **Màn (apps/app)** — sheet «Công ty mới» và ô «Tên miền» trong ngăn công ty kiểm trước khi gửi.
  Trúng nền tảng → không gửi; sheet hiện `FieldError` dưới ô, ngăn công ty báo bằng toast (cùng
  kênh lỗi đang dùng cho ô đó). Câu báo theo ngôn ngữ người xem, gọi tên nền tảng, sinh bởi MỘT
  hàm trong `companyMessages` mà cả sheet lẫn ngăn công ty gọi.
- **API (apps/api)** — `CompaniesService.create`/`update` từ chối cùng điều kiện bằng
  `BadRequestException`, cạnh câu từ chối «is not a domain» đang có. Đây là kiểm đầu vào, không phải
  trí khôn: không gọi nhà cung cấp, không suy luận. `normalizeDomain` giữ nguyên (workspace — đường
  T3 — cũng gọi nó). `company-directory` (tên miền suy từ email) không đổi: địa chỉ @linkedin.com là
  chuyện khác, và thư mục đó không đi qua ô rep gõ.
- **Tác nhân (apps/agent)** — `runBrand` gặp công ty mang tên miền nền tảng thì kết thúc
  `SKIPPED` với lý do «<tên miền> is a <Nền tảng> page, not the company's own site» **trước** khi
  trừ tín dụng và trước mọi lời gọi context.dev. Đây là lưới cho bản ghi đã lỡ mang tên miền đó,
  như Titan. Lượt tra chỉ thấy tên miền, nên công ty tạo từ email @linkedin.com cũng bị bỏ qua — giá
  đã ghi ở Out of scope; tách hai nguồn cần cột mới (migration, đường T3).

### B. Xin context.dev trả tiếng Việt

`CONTEXT.brandLanguage = "vietnamese"` trong `context-config.ts` (một chỗ để chỉnh, theo luật hằng
số của AGENTS.md). `brandByDomain` và `brandByEmail` truyền `force_language: CONTEXT.brandLanguage`.
`verifyKey` (thăm dò email gmail, không tốn tín dụng) không đổi.

Giới hạn biết trước: khoá context.dev ở máy cục bộ là chuỗi giả, nên vòng này chỉ chứng **mã gửi
đúng tham số theo hợp đồng SDK**; context.dev có dịch mô tả, có dịch tên ngành hay không, và bộ đệm
90 ngày của họ có tách theo ngôn ngữ hay không — chỉ thấy được trên production sau khi gộp.

### C. «Tra cứu lại» thay phần máy đã điền mà người chưa sửa

`runBrand` đọc `CompanyEnrichment.raw` của lần tra trước, parse bằng schema Zod mới (luật «parse ở
biên»), dựng lại các giá trị lần đó định điền bằng chính `brandToUpdate` trên ảnh chụp rỗng. Một
trường được coi là còn điền được khi: đang trống (như cũ), **hoặc** giá trị hiện tại bằng đúng giá
trị lần tra trước đã điền. Raw không qua schema thì lượt đó lùi về chỉ điền trường trống và ghi một
dòng cảnh báo `brand raw unreadable: <thông điệp Zod>` — lỗi có tên, không nuốt. Trường người sửa (khác giá trị máy) hay người tự gõ từ đầu giữ nguyên.
Áp cho mọi lượt tra có bản ghi trước, không chỉ «Tra cứu lại» — cùng một luật, ít nhánh hơn. Tên công
ty giữ luật riêng (chỉ thay khi còn là tên tạm bằng tên miền).

### D. Tên quốc gia theo ngôn ngữ người xem

Hàm thuần `tenQuocGia(country, countryCode, locale)` ở `apps/app/lib` trả
`Intl.DisplayNames([locale], { type: "region" }).of(countryCode)` **chỉ khi** `country` khớp (không
phân biệt hoa thường) tên tiếng Anh `Intl` của chính mã đó — tức là giá trị máy điền chưa ai sửa;
ngược lại trả `country` nguyên văn (dữ liệu người nhập không dịch — CLAUDE.md). Dùng ở dòng phụ đầu
ngăn công ty và ô «Quốc gia» trong «Chi tiết». Không đổi dữ liệu lưu, không migration; bản ghi cũ hiện
đúng ngay.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: Công ty › «Công ty mới» → gõ tên, dán `titanmiennam.vn` → «Thêm công ty» → ngăn công ty
  mở, Kara tra (điểm ra: ngăn công ty, mô tả tiếng Việt).
- Biên: dán `https://www.facebook.com/titanmiennam` → dưới ô hiện «Đây là trang Facebook, không phải
  trang web của công ty. Để trống nếu công ty chưa có trang web riêng.»; nút gửi vẫn bấm được nhưng
  không gửi, focus về ô.
- Lỗi & quay lại: sửa tên miền trong ngăn thành `zalo.me/…` → toast cùng câu, tên miền cũ giữ nguyên.
  Bản ghi đã mang `facebook.com` → «Tra cứu lại» → nhãn «Không tìm thấy gì», rê chuột thấy lý do.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sheet «Công ty mới» | Tạo công ty với tên miền đúng | Danh sách Công ty / ngăn công ty |
| Ngăn công ty › Tổng quan | Xem và sửa thông tin công ty | Danh sách, tìm kiếm / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tao-cong-ty-ten-mien-nen-tang | Sheet «Công ty mới» | `FieldError` dưới ô «Tên miền», gọi tên nền tảng; ô mang `aria-invalid` | Xoá ô hoặc dán trang web thật |
| ST-ngan-cong-ty-sua-ten-mien-nen-tang | Ngăn công ty | Toast lỗi cùng câu; ô trở về giá trị cũ | Gõ lại tên miền thật |
| ST-ngan-cong-ty-quoc-gia-may-dien | Ngăn công ty | «Hoa Kỳ» (vi) / «United States» (en) ở dòng phụ và ô Quốc gia | Không gì |
| ST-ngan-cong-ty-quoc-gia-nguoi-go | Ngăn công ty | Nguyên văn rep gõ, `translate="no"` | Không gì |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kiểm khi gửi, không kiểm từng phím (rep đang dán dở thì chưa báo). Gõ lại vào ô thì lỗi tắt.
- Lỗi đặt ngay dưới ô có lỗi, ô mang `aria-invalid` và `aria-describedby` trỏ dòng lỗi; tên quốc gia
  dịch bằng `Intl.DisplayNames`, không bảng tay — ba điều đối chiếu từ Web Interface Guidelines
  (skill `web-design-guidelines` của kho).

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `FieldError` (`@crm/ui/components/field`) | dùng | Có sẵn ở bậc 1, đúng chỗ cho lỗi dưới ô |
| toast `sonner` | dùng | Kênh lỗi ô sửa trong ngăn đang dùng |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi bố cục — hai màn có sẵn (danh sách Công ty và ngăn bản ghi) giữ nguyên khuôn; vòng
này chỉ thêm một trạng thái lỗi và đổi chữ hiển thị.
<!-- UX-SPEC-TEMPLATE>>> -->

## Quét không gian tiêu chí

- Sản phẩm: CRM nội bộ OneHub, môi giới bất động sản — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: apps/app/lib/messages/companies.ts, apps/api/src/companies/domain.ts] · chân ngành:
  [NGÀNH: Apify Domain List Cleaner — bỏ `facebook.com/brand` thay vì lưu thành tên miền công ty;
  HubSpot «excluded domains» cho tự gắn công ty].

Trục:

- Đường vào: sheet tạo · ô sửa trong ngăn · gọi API thẳng · suy từ email
  [thước CE: mọi chỗ ghi `company.domain` — grep `company.create`/`update`]
- Đầu vào: nền tảng trần · đường dẫn trang hồ sơ · tên miền con của nền tảng · tên miền thật trông
  giống · tên miền thật thường [thước CE: luật khớp hậu tố]
- Lượt tra: lần đầu · tra cứu lại · theo email [thước CE: các hàm gọi `brand.retrieve`]
- Hiển thị: vi · en × máy điền khớp mã · người gõ · không có mã [thước CE: `LOCALES` của `@crm/ui`]

Core: sheet tạo × {trần, đường dẫn, tên miền con} · ô sửa × đường dẫn · API × trần · tên miền thật
trông giống đi qua · lần đầu và tra cứu lại × tên miền nền tảng · mọi lượt × ngôn ngữ · tra cứu lại ×
trường người sửa · hiển thị {vi, en} × {máy điền, người gõ}.

Later: ghi trang Facebook rep dán vào một ô «Facebook» của công ty (cần cột mới — migration, đường T3) ·
dịch tên ngành EIC · gỡ dữ liệu Meta đã đổ vào bản ghi như Titan (xem Hỏi-1).

Never: suy từ email × nền tảng — địa chỉ @linkedin.com, @facebook.com là người làm ở chính công ty đó,
không phải trang dán nhầm.

## Ngoài phạm vi

- Không tự gỡ dữ liệu sai đã đổ vào bản ghi đang mang tên miền nền tảng (Hỏi-1 ở Cổng Phạm vi).
- Không dịch tên ngành («Technology») và tên thành phố.
- Không thêm ô lưu đường dẫn Facebook/Zalo của công ty.
- Không đổi câu lỗi tiếng Anh của API đang có, và lý do «Không tìm thấy gì» trong chú thích vẫn bằng
  tiếng Anh như các lý do khác của tác nhân.
