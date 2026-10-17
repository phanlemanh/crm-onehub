# Dịch tên ngành bằng bảng — thiết kế (VN1)

Hồ sơ: `_acceptance/dich-ten-nganh-bang-bang/` · Cổng Đáng: build (chủ kho, 17/10).
Gốc: vòng `tra-cuu-thuong-hieu-viet-nam` (#462) để ngành tiếng Anh «đợi đo production»
(`d-20261016T053428Z-12`); đo 17/10 trả lời: context.dev không dịch ngành dù xin tiếng Việt.

## Vấn đề

Giao diện tiếng Việt hiện ngành công ty bằng chữ tiếng Anh của nhà cung cấp ở ba chỗ:

| Chỗ | Mã hiện tại |
|---|---|
| Dòng phụ đầu ngăn công ty | `company-sheet.tsx` — `parts={[…, { text: company.industry, lang: "en" }]}` |
| Cột «Ngành» bảng công ty | `companies-table.tsx` — `<ForeignText lang="en">{row.industry}</ForeignText>` |
| Bộ lọc «Ngành» bảng công ty | `companies-table.tsx` — `facetValueOptions(...)` → nhãn = giá trị gốc |

Ngành do tác nhân ghi nguyên chữ nhà cung cấp (`brand-mapping.ts` — `fill("industry", eic.industry)`).
Thư viện `context.dev` bản agent đang cài (2.10.0) khai ngành là danh sách cố định **24** giá trị
(`Industries.Eic.industry`), ngành phụ **220** giá trị (`Industries.Eic.subindustry`).

**Ngành phụ không hiện ở màn nào của ứng dụng** — chỉ API trả nó và Kara đọc nó
(`apps/agent/agent/lib/accounts.ts:248`). Ô cơ hội viết «ngành và ngành phụ ở cả ba chỗ» là đọc
nhầm từ phiên đo (phiên đo đọc qua API). Xem Hỏi-1.

## Hướng chọn — dịch lúc hiển thị, theo khuôn tên quốc gia

Kho đã có tiền lệ đúng hình này: `apps/app/lib/ten-quoc-gia.ts` — `tenQuocGia(country, countryCode, locale)`
trả `{ ten, dich }`; ngăn công ty hiện tên đã dịch, tên không dịch thì bọc `translate="no"`.

Thêm `apps/app/lib/ten-nganh.ts`:

- `BANG_NGANH: Record<string, string>` — khoá là đúng 24 chuỗi tiếng Anh của thư viện, giá trị là tên Việt.
- `tenNganh(industry, locale): { ten: string; dich: boolean } | null` — rỗng/null → `null`;
  `locale === "vi"` và giá trị (sau trim) là khoá của bảng → `{ ten: <tên Việt>, dich: true }`;
  mọi ca khác (tiếng Anh, giá trị ngoài bảng, rep tự gõ) → `{ ten: <nguyên văn>, dich: false }`.
- `soTapNganh(bang, dsThuVien): { thieu: string[]; thua: string[] }` — hàm thuần mà bài kiểm phủ bảng dùng.

Ba chỗ hiển thị gọi `tenNganh`:

- Đầu ngăn: `dich` → phần chữ không mang `lang`; không dịch → giữ `lang: "en"` như hôm nay.
- Cột bảng: `dich` → chữ thường kèm `title` = tên đầy đủ (cột hẹp cắt bằng dấu ba chấm, rê chuột đọc đủ); không dịch → `ForeignText lang="en"` như hôm nay.
- Bộ lọc: `options` giữ `value` = chữ gốc (đường lọc API `industry in [...]` không đổi),
  `label` = `tenNganh(value, locale).ten`.

**Giá trị ngoài bảng giữ đúng cách hiện hôm nay** (nguyên văn, `lang="en"`): gỡ nhãn tiếng Anh cho mọi giá trị ngoài bảng sẽ đúng với chữ rep gõ tiếng Việt nhưng sai với chữ Anh mới của nhà cung cấp — một đánh đổi chưa ai được hỏi, và không phải việc của vòng này (ghi Ngoài vòng).

**Không đổi:** tác nhân (`brand-mapping.ts`), API, cơ sở dữ liệu, Kara. Dữ liệu lưu vẫn là chữ gốc,
nên công ty tra từ trước cũng hiện tiếng Việt ngay, không cần «Tra cứu lại», và luật «máy điền vs
rep đã sửa» của vòng #462 (so giá trị cũ với bản thô cũ) không bị chạm.

Lối đã loại: **dịch lúc ghi** (tác nhân ghi tên Việt vào ô ngành) — phải tra lại mọi công ty cũ,
làm vỡ phép so «rep đã sửa ô ngành chưa» của #462, và giao diện tiếng Anh mất chữ gốc.
**Gọi model dịch** — chủ kho đã chốt bảng (Hỏi-5 của #462), danh sách cố định không cần model.

## Thước gắn vào vật

Danh sách 24 ngành KHÔNG chép tay vào bài kiểm. Bài kiểm rút nó từ chính thư viện mà agent cài:
giải `context.dev` từ thư mục `apps/agent` (đường suy từ vị trí tệp test), đọc `resources/brand.d.ts`,
lấy union của `industry:` trong `Eic`. Rồi so tập với khoá của `BANG_NGANH`:

- thiếu một giá trị thư viện có → đỏ, thông điệp nêu tên giá trị;
- thừa một khoá thư viện không còn → đỏ, thông điệp nêu tên;
- rút được 0 giá trị, hoặc gặp hai union `industry` khác nhau → đỏ «khuôn thư viện đổi».

Chiều đỏ trên cùng fixture: bản sao bảng bỏ «Real Estate & PropTech» → `thieu` đúng một giá trị đó;
danh sách thư viện thêm «Quantum Computing» → `thieu` chứa nó. Nâng `context.dev` mà nhà cung cấp
thêm ngành → bài kiểm đỏ ngay ở lượt nâng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bảng công ty → thấy cột «Ngành» tiếng Việt → mở một công ty → dòng phụ đầu ngăn «Hà Nội, Việt Nam · Bất động sản & Công nghệ bất động sản» (điểm ra: ngăn công ty)
- Biên: ngành trống → ô trống như hôm nay; ngành rep tự gõ / ngoài danh sách → hiện nguyên văn
- Lỗi & quay lại: không có đường lỗi mới — chỉ đổi chữ hiển thị

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng công ty | Tìm và lọc công ty | Thanh bên / mở ngăn công ty |
| Ngăn công ty | Xem một công ty | Bảng công ty / đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-bang-nganh-dich | Bảng công ty | Cột «Ngành»: tên Việt (vi) / chữ gốc (en) | Lọc hoặc mở công ty |
| ST-bang-nganh-la | Bảng công ty | Giá trị ngoài danh sách: nguyên văn, hiện y như hôm nay | Như trên |
| ST-bang-nganh-trong | Bảng công ty | Ô trống như hôm nay | Như trên |
| ST-loc-nganh | Bảng công ty | Bộ lọc «Ngành»: nhãn tên Việt, số đếm như cũ | Chọn ngành → bảng lọc theo chữ gốc |
| ST-ngan-dau-nganh | Ngăn công ty | Dòng phụ: «<địa điểm> · <tên Việt>» | Đọc tiếp |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên Việt dài hơn chữ Anh; cột «Ngành» (`w-[12%]`, `truncate`) cắt bằng dấu ba chấm, ô mang `title` để rê chuột đọc đủ, chữ đầy đủ vẫn nằm trong ô cho trình đọc màn hình — không đổi bề rộng cột. Lượt chụp AC-7 đếm số tên bị cắt ở mỗi ngôn ngữ và khổ.
- Khớp bảng sau khi trim; không khớp hoa-thường lệch (nhà cung cấp trả đúng chuỗi enum).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MetaLine`, `ForeignText`, `DataTable` facet | dùng | Chỉ đổi chữ truyền vào |
| `tenNganh` | tạo (theo khuôn `tenQuocGia`) | Tiền lệ dịch-lúc-hiển-thị đã có trong kho |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không đổi IA — bảng công ty + ngăn chi tiết có sẵn; luồng hiển nhiên, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Tên Việt của 24 ngành (bản máy soạn — Hỏi-2)

| Thư viện | Tên Việt | Số chữ (Anh → Việt) |
|---|---|---|
| Aerospace & Defense | Hàng không vũ trụ & Quốc phòng | 19 → 30 |
| Technology | Công nghệ | 10 → 9 |
| Finance | Tài chính | 7 → 9 |
| Healthcare | Y tế | 10 → 4 |
| Retail & E-commerce | Bán lẻ & Thương mại điện tử | 19 → 27 |
| Entertainment | Giải trí | 13 → 8 |
| Education | Giáo dục | 9 → 8 |
| Government & Nonprofit | Nhà nước & Phi lợi nhuận | 22 → 24 |
| Industrial & Energy | Công nghiệp & Năng lượng | 19 → 24 |
| Automotive & Transportation | Ô tô & Vận tải | 27 → 14 |
| Lifestyle & Leisure | Phong cách sống & Thư giãn | 19 → 26 |
| Luxury & Fashion | Hàng xa xỉ & Thời trang | 16 → 23 |
| News & Media | Tin tức & Truyền thông | 12 → 22 |
| Sports | Thể thao | 6 → 8 |
| Real Estate & PropTech | Bất động sản & Công nghệ bất động sản | 22 → 37 |
| Legal & Compliance | Pháp lý & Tuân thủ | 18 → 18 |
| Telecommunications | Viễn thông | 18 → 10 |
| Agriculture & Food | Nông nghiệp & Thực phẩm | 18 → 23 |
| Professional Services & Agencies | Dịch vụ chuyên nghiệp & Agency | 32 → 30 |
| Chemicals & Materials | Hoá chất & Vật liệu | 21 → 19 |
| Logistics & Supply Chain | Logistics & Chuỗi cung ứng | 24 → 26 |
| Hospitality & Tourism | Khách sạn & Du lịch | 21 → 19 |
| Construction & Built Environment | Xây dựng & Công trình | 32 → 21 |
| Consumer Packaged Goods (CPG) | Hàng tiêu dùng đóng gói | 29 → 23 |

Giữ «&» như nguồn để nhãn ngắn trong cột hẹp; «Logistics», «Agency» giữ nguyên vì là cách gọi
thông dụng trong giới kinh doanh Việt Nam (luật kho: không tự đúc từ ghép).

## Ngoài vòng

- Ngành phụ (220 giá trị) — không màn nào hiện (Hỏi-1).
- Ngành rep tự gõ tiếng Việt vẫn bị đánh dấu tiếng Anh như hôm nay (có từ trước vòng này).
- Kara nói tên ngành: Kara đọc chữ gốc và tự diễn đạt bằng tiếng Việt; không đổi ở vòng này.
- Sắp theo cột «Ngành» vẫn theo chữ gốc tiếng Anh — ở giao diện tiếng Việt thứ tự trông không theo chữ cái.
- Trang giới thiệu (`components/landing/product-shot/companies-page.tsx`) dùng dữ liệu mẫu tĩnh.
- «Tra cứu lại» không bỏ bộ đệm 90 ngày (`apps/agent/agent/lib/dispatch.ts:104`) và tốn hơn 2 tín
  dụng mỗi lần vì Kara soạn thêm hồ sơ công ty — ghi Known limits, không gộp.
