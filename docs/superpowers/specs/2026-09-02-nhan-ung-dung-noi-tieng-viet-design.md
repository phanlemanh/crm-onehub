# Vòng ③a — nhãn ứng dụng nói tiếng Việt trên ba luồng của ngưỡng

Ngày 2026-09-02. Vòng ③ trong năm vòng của `_acceptance/tieng-viet-cho-crm/opportunity.md`,
lát đầu.

## Vấn đề

Vòng ① dựng đường ngôn ngữ và chứng minh nó chạy trên một màn. Vòng ② mở cho bộ
dựng chung nhận chuỗi từ ngoài. Cả hai xong rồi mà **người lạ lái thử vẫn nói
cùng một câu: "chỉ có trang Công ty được dịch"**, và chỗ khó chịu nhất không phải
tiếng Anh mà là nửa nọ nửa kia trong cùng một màn.

Chữ còn lại nằm ở chỗ gọi trong `apps/app`. Đó là vòng này.

## Vì sao cắt lát, và cắt ở đâu

Vòng ③ như hồ sơ cơ hội khai là **1103 chuỗi trên 143 file** (số do máy đếm —
`rang/dem-pham-vi.mjs`). Hồ sơ cơ hội tự khai timebox hai ngày cho một vòng.
1103 chuỗi không vừa.

Lát đầu lấy theo **chính ngưỡng nghiệm thu hồ sơ cơ hội đã viết**: ba luồng thật
— *thêm một công ty · ghi hoạt động · cập nhật một thoả thuận hợp tác*. Đây là
lát duy nhất làm cho ngưỡng ấy **đo được**; cắt kiểu khác thì Cổng Giá trị vẫn
đọc bảng với ô chưa đo.

Lát khoanh bằng **đồ thị nhập** từ ba luồng, không bằng thư mục — khoanh theo thư
mục bỏ sót đúng chỗ vòng ① gửi sang (`lib/enrichment-status.ts`).

| Đo được trên lát | Số |
| --- | ---: |
| File trong lát | 92 |
| File mang chữ người đọc | 62 |
| Chuỗi | 569 |
| — trong đó ghép biến | 76 |
| — trong đó chỉ trình đọc màn hình nghe | 42 |
| — trong đó nằm trong file `.ts` thuần (không dùng được hook) | 130 |
| File khai `use client` | 47 |
| File máy chủ vẽ | 15 |
| **File có nguồn gốc từ hãng** | **92 / 92** |

## Đường đã chọn: nối dài kho chuỗi, không thêm thư viện

Vòng ② cố ý để lại quyết định này: *"Không thêm thư viện đa ngôn ngữ. Ba mươi ba
chuỗi không đủ căn cứ chọn."* Vòng này có căn cứ, và căn cứ nói **không**:

1. **Tiếng Việt không biến hình số nhiều.** Lý do lớn nhất người ta rước ICU
   MessageFormat về ở đây không tồn tại. `formatCount(n, "công ty", "công ty", "vi")`
   đã chạy từ vòng ①.
2. **130 chuỗi nằm trong file `.ts` thuần**, nơi hook không sống được. Thư viện
   làm chỗ này khó hơn — chúng tách API máy chủ và API trình duyệt. Một hàm thuần
   nhận vùng làm tham số thì không có ca đặc biệt nào.
3. **Không có người dịch ngoài đội.** Kho danh mục rút được là để đưa cho dịch
   giả ngoài; ở đây chữ do chính đội viết.
4. **92/92 file là của hãng.** `CLAUDE.md`: phí bản rẽ là chi phí dài hạn lớn
   nhất của kho. Thêm một dòng nhập thư viện vào 62 file của hãng là xung đột ở
   mọi lần kéo bản mới, mà một lần kéo mang về 62 commit.

Giá phải trả, nói thẳng: 569 chuỗi gõ tay. Vòng ② đã bịt lỗ đó — `satisfies`
cùng một kiểu nên **trình biên dịch bắt thiếu khoá**, và `messages-guard.spec.ts`
bắt giá trị tiếng Việt không mang dấu.

## Kiến trúc

**Kho chuỗi — một module một vùng.** Đúng khuôn `apps/app/lib/messages/companies.ts`
(vòng ①) và `packages/ui/src/lib/messages.ts` (vòng ②): object `en`, object `vi`,
cả hai `satisfies` một kiểu, hàm cho câu ghép biến. Thêm bốn module:
`contacts.ts` · `deals.ts` · `record-sheet.ts` · `crm.ts`.

**Ba lối đọc, theo chỗ gọi — không có lối thứ tư:**

| Chỗ gọi | Cách đọc | Tiền lệ trong kho |
| --- | --- | --- |
| Component trình duyệt (47 file) | `useLocale()` + `<vùng>Messages(locale)` | `companies-table.tsx` |
| Trang máy chủ vẽ (15 file) | `<vùng>Messages(await getLocale())` | `companies/page.tsx` |
| File `.ts` thuần (130 chuỗi) | hàm thuần nhận `locale` làm tham số | `formatDay(value, locale)` |

**Dữ liệu KHÔNG dịch, nhưng phải khai tiếng.** Cột `Ngành` đổ ra `Software`,
`Banking` từ cơ sở dữ liệu. Chúng giữ nguyên — nhưng một trang khai `lang="vi"`
mà chứa chữ tiếng Anh thì trình đọc màn hình đọc chúng bằng giọng Việt. WCAG 2.2
SC 3.1.2 đòi phần tử chứa chữ khác tiếng phải tự khai tiếng của nó. Vòng ① và ②
đều chưa làm; vòng này nhận.

## Nhận luôn một lỗi bố cục

Bề rộng cột. Vòng ① và ② đều vấp và đều không nhận: ở 768px bốn tiêu đề bị cắt,
**và tiếng Anh cũng cắt** — nên đây là chuyện cột chứ không phải chuyện tiếng
Việt dài. Lát này sở hữu ba bảng, nên nó là chỗ đúng để chữa.

## Phép đo

Dùng lại giàn vòng ① ở `_acceptance/tieng-viet-cho-crm/rang/`, mở rộng ra ba màn
và hồ sơ bản ghi. **Không dựng máy quét mã** — máy quét dùng để ĐẾM PHẠM VI thì
được, dùng để chứng minh sự vắng mặt thì không; vòng ② đã giết một cái vì lý do
đó.

Bốn luật thừa kế, mỗi luật một lần trả giá ở vòng trước:

1. Dựng vật thật hai lần (tiếng Anh, tiếng Việt) rồi trừ phần giống hệt.
2. Phá vật thật, xem phép đo có đỏ không, **và kiểm cú phá thật sự đổi được file**.
3. Danh sách trung tính **sinh ra từ máy chủ**, không viết tay.
4. Mọi giá trị tiếng Việt phải mang ít nhất một dấu tiếng Việt.

Cộng ba luật vòng ① học được ngày 2026-09-02:

5. Đếm **số lần xuất hiện**, không đếm số chuỗi phân biệt — chuỗi trùng chuỗi đã
   có trên màn sẽ tàng hình.
6. Đếm mọi chỗ dựng `Intl.*` **không truyền vùng nào**, không chỉ chỗ khai cứng.
7. Mọi lời chấm về chữ **bị cắt** phải đo lại bằng dựng-từng-tiền-tố — chữ cắt
   bằng CSS không nằm trong DOM.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách công ty → mở hồ sơ một công ty → ghi một hoạt động → mở
  thoả thuận của công ty đó → đổi giai đoạn (điểm ra: về lại danh sách)
- Biên: danh sách rỗng · công ty chưa có người phụ trách · công ty chưa có hoạt
  động nào · tên pháp nhân 40–60 ký tự · người dùng không có quyền sửa
- Lỗi & quay lại: lưu hỏng → thông báo nổi tiếng Việt nêu việc gì hỏng → chữ vừa
  gõ còn nguyên trong form, người sửa rồi lưu lại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Danh sách công ty | tìm đúng một công ty trong mạng lưới | thanh bên / hồ sơ công ty |
| Danh sách cá nhân | tìm đúng một người | thanh bên / hồ sơ cá nhân |
| Danh sách thoả thuận | thấy thoả thuận nào đang mở | thanh bên / hồ sơ thoả thuận |
| Hồ sơ bản ghi | đọc và sửa một bản ghi tại chỗ | danh sách / đóng về danh sách |
| Dòng thời gian | ghi lại một việc vừa làm với đối tác | trong hồ sơ / ở lại hồ sơ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-danh-sach-dang-tai | ba danh sách | khung xương bảng, không chữ tiếng Anh nào | chờ |
| ST-danh-sach-rong | ba danh sách | câu rỗng tiếng Việt + nút tạo mới | tạo bản ghi đầu |
| ST-danh-sach-loc-khong-khop | ba danh sách | câu "chưa có … khớp bộ lọc này" | gỡ bộ lọc |
| ST-danh-sach-hep-768 | ba danh sách | tiêu đề cột cắt kèm ba chấm, chữ đầy đủ ở trình đọc màn hình | rê chuột / dùng trình đọc |
| ST-ho-so-thieu-truong | hồ sơ bản ghi | ô trống hiện dấu gạch, không hiện chữ tiếng Anh | điền vào |
| ST-ho-so-khong-quyen | hồ sơ bản ghi | ô chỉ đọc, câu giải thích tiếng Việt vì sao | nhờ người có quyền |
| ST-dong-thoi-gian-rong | dòng thời gian | câu rỗng tiếng Việt + ô soạn hoạt động | ghi hoạt động đầu |
| ST-luu-hong | hồ sơ, dòng thời gian | thông báo nổi tiếng Việt, chữ vừa gõ còn nguyên | sửa rồi lưu lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chuỗi tiếng Việt dài hơn tiếng Anh 20–30%: ở 1024px trở lên không tiêu đề cột
  nào được cắt; ở 768px cắt thì phải kèm ba chấm và chữ đầy đủ tới được trình đọc
  màn hình.
- Dữ liệu người nhập không dịch và mang `translate="no"`.
- Giá trị từ cơ sở dữ liệu còn tiếng Anh phải nằm trong phần tử tự khai `lang="en"`.
- Đổi tiếng không tải lại trang; component máy chủ chưa vẽ lại vẫn phải đổi chữ.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `DataTable`, `Table`, `DropdownMenu`… | dùng | vòng ② đã cho chúng nhận chuỗi từ ngoài |
| Bề rộng cột của ba bảng | mở rộng | ô chữ hẹp hơn nội dung ở 768–1024px, lỗi có sẵn |
| Kho chuỗi bốn module mới | tạo | đúng khuôn hai vòng trước, không khuôn mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: vòng này KHÔNG đổi kiến trúc thông tin — ba bảng danh sách mở ra hồ sơ
bản ghi là khuôn đang chạy, và đây là vòng dịch chữ. Không có ≥2 khuôn khả dĩ nên
không tra mẫu. (Công cụ tra mẫu thị trường trong phiên này cũng không kết nối
được.)
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- **Cài đặt** (308 chuỗi, 36 file) — lát ③b. Người dùng ít, phần lớn là quản trị.
- **Trang khác** (319 chuỗi, 59 file) — lát ③c.
- **Chữ tác nhân và khung trò chuyện** (327 chuỗi) — vòng ⑤. `docs/agent-panel.md`
  và bản bàn giao đều gọi đây là vùng rủi ro cao nhất.
- **Câu lỗi máy chủ trả về** — vòng ④.
- **Trang giới thiệu công khai của hãng** (105 chuỗi) — đề nghị bỏ hẳn khỏi cả
  năm vòng: CRM này là sản phẩm nội bộ không bán ra ngoài, nên không ai ở OneHub
  đọc trang tiếp thị đó.
- **Không thêm ngôn ngữ thứ ba, không đổi tiền tệ, không đổi múi giờ.**

## Đã đọc trước khi viết

`AGENTS.md` · `CLAUDE.md` · `CONTEXT.md` · `docs/design.md` · `docs/api.md`
(bảng chỉ mục cho vùng chạm) · `_acceptance/tieng-viet-cho-crm/{opportunity,contract,decisions,evidence-report}.md`
· `_acceptance/bo-dung-chung-nhan-chuoi/{contract,evidence-report}.md` ·
`packages/ui/src/lib/messages.ts` · `packages/ui/test/messages-guard.spec.ts`.

Kho khai `feature_loop.ui_standards_skill: web-design-guidelines` ở
`_acceptance/config.yaml`, **nhưng skill đó không tồn tại trên máy này** — vòng ①
và ② cũng đã chạy S1 mà thiếu đúng cái đối trọng ấy. Chuẩn giao diện lấy từ
`docs/design.md` của kho và skill `acceptance-gate:ux-ui-craft`.
