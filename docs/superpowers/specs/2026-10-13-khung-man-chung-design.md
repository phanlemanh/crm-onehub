# Khung màn chung — thiết kế (NM1, đợt r2 · dãy P4)

Hàng NM1 của `docs/plan/lo-trinh-okr.json`. Câu giao: «Màn nào đang tải cũng giữ tiêu đề, lỗi tải ở đâu cũng
một hình có nút thử lại, và đầu trang không có nút chính tắt mà không nói vì sao». Đích đã ghi ở
`docs/design.md` mục «Nếp màn trong app» (khảo sát bảy màn 09/10) và `docs/settings.md` mục «Trạng thái». Vòng
này áp đích đó lên màn đang lệch, không đặt nếp mới. Chỉ chạm `apps/app` và `packages/ui`.

## Hiện trạng đo 13/10 (kiểm kê trên `onehub` 3a2783409)

- **Vòng quay cả vùng.** `PageShellLoading` (một `Spinner` giữa vùng) là fallback ở 37 tệp. (`git grep -l` ra 39 —
  con số hàng lộ trình ghi — gồm cả `page-shell.tsx` và `page-shell-loading.tsx` là hai tệp định nghĩa nó.)
  Không có `loading.tsx` nào.
- **Mất tiêu đề khi tải.** Bảy màn dựng tiêu đề trong mã khách nằm trong `Suspense`: danh sách Tài liệu
  (`tai-lieu/page.tsx:30`, fallback `DangTaiDanhSach` không có tiêu đề), Trang mới, Sửa trang, Đọc trang,
  Duyệt đề xuất, Giai đoạn thoả thuận, chi tiết chiến dịch. Năm thẻ OKR dựng tiêu đề trong `okr/layout.tsx`,
  sau một `Suspense` chờ bốn truy vấn, nên lúc tải chỉ thấy một vạch xám.
- **Lỗi tải.** Bốn khung tự dựng mà hàng nêu tên, mỗi khung một hình: `onboarding/danh-muc-table.tsx`
  (`loiView`, và `ST-bangcot-loi` cùng tệp), `okr/toan-canh/toan-canh.tsx` (`LoiXem`, chỉ có mô tả),
  `tai-lieu/loi-tai.tsx` (`LoiTai`, chỉ có tiêu đề), `okr/trang-thai-okr.tsx` (`Loi`, có biểu tượng). Chi tiết
  chiến dịch (`campaign-detail.tsx:381`) quay mãi khi tải lỗi. Còn khoảng 30 khung tự dựng khác ở Cài đặt OKR,
  Tổ chức, Hỏi ý, Cập nhật tuần, các khối của bản ghi — xem «Ngoài phạm vi».
- **Đầu trang.** Ở mọi màn, `PageShellDescription` mang `order-last basis-full`, nên dưới 768 px các nút đứng
  trên câu mô tả. Onboarding: «Kế hoạch mới» (nút chính) tắt khi chưa có khuôn mà không nói vì sao, và khung
  trống có thêm một nút chính thứ hai. Tổ chức «Thêm bộ phận» và SSO «Thêm nhà cung cấp» tắt khi thiếu quyền,
  không có dòng lý do dưới tiêu đề. Tài liệu: dòng «Chưa bật lưu tệp nguồn» nằm trong `PageShellActions`, căn
  phải, lệch với hàng nút căn trái.
- **Tiêu đề mục thô.** `reminders/page.tsx:58,67` dựng `<h2>` tự đặt cỡ chữ. `SectionHeading` chỉ nhận
  `level` 3 hoặc 4, và đặt `id` lên thẻ bọc chứ không lên tiêu đề.

## Phương án

**Đã chọn — một thành phần khung xương có năm hình, trong `packages/ui`.** `KhungXuong` nhận `hinh`:

| `hinh` | Dựng | Dùng cho |
| --- | --- | --- |
| `bang` | thanh công cụ (ô tìm + hai chip) + hàng đầu bảng + 8 hàng | màn `DataTable` |
| `danh-sach` | 6 dòng: ô vuông nhỏ + hai vạch chữ | danh sách `Item`, danh sách kết nối, trường |
| `the` | 2 thẻ, mỗi thẻ có tiêu đề + 3 hàng nhãn/ô | trang Cài đặt dạng form, Nhắc buổi sáng |
| `tong-quan` | 4 ô số + 1 thẻ chứa 5 hàng bảng | Tổng quan, các thẻ OKR |
| `chi-tiet` | hàng tiêu đề (vạch cao 32 px + vạch mô tả) + 3 đoạn | màn bản ghi có tiêu đề theo dữ liệu |

Mỗi hình mang `aria-busy="true"`, phần vẽ `aria-hidden`, và một dòng `role="status"` ẩn đọc «Đang tải…» (chữ
mới trong `packages/ui/src/lib/messages.ts`, chỉ thêm). `PageShellLoading` bị xoá; `PageShellFallback` giữ vai
«chưa biết hình» như `docs/design.md` nói.

Đã loại: (a) **một khung chung cho mọi màn** — trái «khung xương cùng hình với mục»; (b) **khung xương riêng
từng màn** — 37 bản vẽ tay, trái «vẽ tay là bậc cuối»; (c) **`loading.tsx` theo tuyến** — thay cả trang lúc
chuyển, kéo tiêu đề đi theo, và ngược luật «`<Suspense>` nằm BÊN TRONG `PageShellContent`» mà bàn đo Cài đặt
đã vấp.

**Tiêu đề.** Màn có tiêu đề tĩnh dựng `PageShellHeader` trong `page.tsx`, ngoài mọi `Suspense`: danh sách Tài
liệu, Trang mới, Giai đoạn thoả thuận, năm thẻ OKR. OKR: `okr/layout.tsx` thôi dựng đầu trang; mỗi `page.tsx`
của năm thẻ dựng tiêu đề và mô tả của thẻ mình bằng chữ máy chủ, còn ô chọn chu kỳ và thanh thẻ (cần dữ liệu)
nằm trong một ranh `Suspense` nhỏ ngay dưới. Trang Soạn OKR giữ như cũ (không có đầu trang). Màn có tiêu đề là
tên bản ghi (chi tiết chiến dịch, Đọc trang, Sửa trang, Duyệt đề xuất) không biết tiêu đề trước khi có dữ liệu.
`page.tsx` của bốn màn đó dựng ngoài `Suspense` một `breadcrumb` trỏ về danh sách cha («Chiến dịch», «Tài liệu») —
nếp trang con của `docs/settings.md` — và khung `chi-tiet` giữ đúng chỗ và cỡ của hàng tiêu đề bên dưới, để lúc
tải và lúc lỗi vẫn có chữ nói đang ở đâu, và màn không nhảy khi tải xong.

**Lỗi tải.** `VungTaiLoi` (đã có trong `packages/ui`) nhận thêm thuộc tính `data-*` và chuyển nguyên lên khối
`Empty`, để bốn khung đổi sang nó mà giữ mã trạng thái `ST-…` các bài đo đã ký đang đọc. Chữ nút vẫn là «Thử
lại». Khung thiếu tiêu đề hay thiếu câu mô tả nhận chữ mới (chỉ thêm dòng vào tệp chữ). Chi tiết chiến dịch có
nhánh lỗi riêng dùng `VungTaiLoi`.

**Đầu trang dưới 768 px.** Sửa trong `PageShellHeader`/`PageShellDescription` của `apps/app/components/page-shell.tsx`
(khung chung, không đè `className` ở chỗ gọi): dưới `md` thứ tự là tiêu đề → mô tả → nút; từ `md` giữ như nay
(tiêu đề | nút, mô tả dưới). Bản gốc ghim `apps/app/test/fixtures/page-shell-truoc-width.tsx.txt` sửa cùng thay
đổi.

**Nút chính tắt.** Theo luật «Không đủ quyền» của `docs/settings.md`: nút giữ nguyên chỗ và tắt, một dòng
`FieldDescription` dưới tiêu đề nói vì sao, nút trỏ `aria-describedby` tới dòng đó. Áp ở Onboarding (chưa có
khuôn, dòng có liên kết tới Cài đặt › Khuôn), Tổ chức (chỉ đọc), SSO (không được cấu hình). Nút khung trống
của Onboarding đổi sang `outline`: màn chỉ còn một nút tô. Tài liệu: dòng «Chưa bật lưu tệp nguồn» dời xuống
dưới tiêu đề; trạng thái lưu tệp không đọc được thì dòng nói đúng điều đó thay vì im. Nút giữ chỗ tắt trong
fallback `Suspense` của sáu nút «Thêm…» (Liên hệ, Thoả thuận, Công ty, Chiến dịch, Khoá API, SSO) đổi thành một vạch
`Skeleton` cỡ nút: lúc chờ đầu trang không có nút tắt nào, và vẫn giữ chỗ nên không nhảy. Khung trống của
Onboarding: Hỏi-3 ở Cổng Phạm vi (khuyến nghị đã soạn: nút khung trống xuống `outline`).

**Tiêu đề mục.** `SectionHeading` nhận `level={2}` và đặt `id` lên chính thẻ tiêu đề; Nhắc buổi sáng dùng nó cho
hai mục.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: bấm mục ở thanh bên → đầu trang (tiêu đề, mô tả) hiện ngay, vùng nội dung là khung xương cùng hình
  → dữ liệu về, khung xương đổi thành nội dung tại chỗ (điểm ra: màn đã tải).
- Biên: tiêu đề là tên bản ghi → khung `chi-tiet` giữ hàng tiêu đề; thiếu quyền hay chưa có khuôn → nút chính
  tắt, dòng lý do dưới tiêu đề.
- Lỗi & quay lại: truy vấn lỗi → `VungTaiLoi` (tiêu đề, một câu, «Thử lại») tại đúng vùng đó, đầu trang vẫn
  đứng → bấm «Thử lại» chạy lại truy vấn, nút tắt trong lúc chạy.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| 37 tệp có `PageShellLoading` (bảng ở §Hình theo màn) | việc của chính màn — vòng này chỉ đổi lúc tải | thanh bên / không đổi |
| Danh sách Tài liệu | tìm và mở trang tài liệu | thanh bên / Đọc trang |
| Onboarding | xem và tạo kế hoạch onboarding | thanh bên / chi tiết kế hoạch, Cài đặt › Khuôn |
| Tổ chức, SSO | sửa cây bộ phận / cấu hình đăng nhập một lần | Cài đặt / không đổi |
| Nhắc buổi sáng | chọn kênh nhắc | menu người dùng / không đổi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-trang-dangtai | mọi màn có tiêu đề tĩnh | tiêu đề + mô tả thật, `KhungXuong` cùng hình, «Đang tải…» cho trình đọc màn hình | chờ |
| ST-chitiet-dangtai | chiến dịch, Đọc/Sửa trang, Duyệt đề xuất | breadcrumb «Chiến dịch»/«Tài liệu» + `KhungXuong hinh="chi-tiet"` có hàng tiêu đề giữ chỗ | chờ, hoặc bấm breadcrumb về danh sách |
| ST-danhmuc-loi · ST-bangcot-loi | Onboarding | `VungTaiLoi`: tiêu đề, một câu, «Thử lại» | thử lại |
| ST-toancanh-loi (và các mã `LoiXem` khác) | các thẻ OKR | `VungTaiLoi` | thử lại |
| ST-donvi-loi | OKR của tôi, Theo đơn vị | `VungTaiLoi` | thử lại |
| ST-tailieu-loi | danh sách Tài liệu, Chờ duyệt | `VungTaiLoi` | thử lại |
| ST-chiendich-loi | chi tiết chiến dịch | `VungTaiLoi` thay vòng quay vô hạn | thử lại |
| ST-dautrang-khoa | Onboarding, Tổ chức, SSO | nút chính tắt + dòng lý do dưới tiêu đề | làm theo dòng lý do |
| ST-tailieu-nguontat | Tài liệu | «Chưa bật lưu tệp nguồn — nhờ quản trị cấu hình.» dưới tiêu đề | nhờ quản trị |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dưới 768 px: tiêu đề → mô tả → dòng lý do (nếu có) → nút, căn trái. Từ 768 px: tiêu đề | nút cùng hàng, mô
  tả và dòng lý do bên dưới.
- Khung xương tôn trọng `prefers-reduced-motion` (`Skeleton` đã có `motion-reduce:animate-none`).
- «Thử lại» tắt trong lúc truy vấn chạy lại (`dangTai` của `VungTaiLoi`).
- Khung xương chiếm đúng chỗ của nội dung (cùng bề rộng vùng, hàng tiêu đề cùng cao) để màn không nhảy khi tải
  xong.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Skeleton` | dùng | vạch xám sẵn có, đã tắt nhịp khi giảm chuyển động |
| `KhungXuong` | tạo (trong `packages/ui`) | bậc 1–4 không có khung xương theo hình; tra ReUI «skeleton» chỉ ra `Skeleton` trần |
| `VungTaiLoi` | mở rộng (`data-*`) | đã là hình lỗi chung của kho, chỉ thiếu đường chuyển mã trạng thái |
| `SectionHeading` | mở rộng (`level={2}`, `id` lên tiêu đề) | đã là tiêu đề mục chung, thiếu bậc h2 |
| `FieldDescription` | dùng | dòng lý do dưới tiêu đề, như luật «Không đủ quyền» |
| `PageShellHeader` | mở rộng (thứ tự dưới `md`) | khung đầu trang chung của `apps/app` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: vòng này không đổi khuôn IA của màn nào, chỉ đổi trạng thái tải, lỗi và đầu trang; khuôn ghi theo màn
chiếm số đông (danh sách → chi tiết bản ghi). Mẫu chờ tải theo IBM Carbon Design System («Loading»: khung
xương cho trang và mục, vòng quay chỉ cho thao tác ngắn), là hệ biểu tượng kho đang dùng.
<!-- UX-SPEC-TEMPLATE>>> -->

## Hình theo màn

| Hình | Màn (đường dưới `apps/app/app/(app)/[slug]/`) |
| --- | --- |
| `bang` | contacts, deals, companies, campaigns, onboarding, settings/api-keys, settings/sso, settings/members |
| `danh-sach` | (agent-builder)/agents, settings/connections, settings/fields, settings/connections/slack/people, settings/giai-doan |
| `the` | settings, settings/currencies, settings/tracking, settings/onboarding, settings/okr, settings/organization (cả `to-chuc.tsx`), reminders, settings/connections/oauth-connection-page, settings/connections/zalo, settings/connections/intake, settings/connections/slack |
| `tong-quan` | `page.tsx` (Tổng quan), okr, okr/toan-canh, okr/toan-canh/suc-khoe, okr/theo-don-vi, okr/hoi-y |
| `chi-tiet` | campaigns/[campaignId] (page và `campaign-detail.tsx`), tai-lieu/[trang], tai-lieu/[trang]/sua, tai-lieu/moi, tai-lieu/de-xuat/[id] |

Danh sách Tài liệu đổi `DangTaiDanhSach` sang `KhungXuong hinh="bang"` và giữ tiêu đề trong `page.tsx`. Bảng này là
nguồn của fixture `apps/app/test/fixtures/khung-man-chung-hinh.json`, sinh bằng `rang/sinh-bang-hinh.mjs` từ
`git grep` ở 3a2783409 (38 tệp), không chép tay.

## Đo

- Bài quét mã (`apps/app/test/khung-man-chung.spec.ts`): không còn `PageShellLoading`; mỗi chỗ trong bảng «Hình
  theo màn» dùng đúng `hinh`; các màn tiêu đề tĩnh có `PageShellTitle` trong `page.tsx`, ngoài mọi `Suspense`.
  Mỗi luật có cặp hai chiều: mã thật xanh, bản sao bị chèn lại vòng quay hay dời tiêu đề vào `Suspense` đỏ với
  thông điệp ghim tên tệp.
- Bài DOM (`packages/ui/test/khung-xuong.dom.tsx`, `apps/app/test/khung-man-chung.dom.tsx`): năm hình khác cấu
  trúc; `VungTaiLoi` giữ `data-trang-thai` và nút gọi lại truy vấn; thứ tự DOM của đầu trang; dòng lý do và
  `aria-describedby`; `SectionHeading level={2}`.
- Ảnh màn thật (`ui-check`) ở 1280 và 375, chụp bằng bàn đo `do:man` với truy vấn bị giữ (đang tải) và bị trả
  lỗi (lỗi tải). Mỗi màn đang tải chụp cả lúc xong; máy so hộp bao (hàng tiêu đề lệch ≤ 4 px, vùng nội dung
  ≤ 8 px) và đo quan hệ đầu trang ở cả 1280 lẫn 375.

## Ngoài phạm vi

- Khoảng 30 khung lỗi tự dựng khác (Cài đặt OKR, Tổ chức, Hỏi ý, Cập nhật tuần, khối bản ghi, Tác tử) — hàng NM1b
  sau NM1 ở dãy P4 (Hỏi-1, chủ kho duyệt 13/10). Vòng này dựng thước đếm `rang/dem-khung-loi.mjs` in số khung còn
  lại và `tệp:dòng` để gói Cổng Bằng chứng nói ra con số.
- Vòng quay cấp mục bên trong nội dung (`dashboard-summary`, `campaigns-table`, `fields-list`, record sheet,
  timeline) và vòng quay trong `DataTable` lúc bảng rỗng đang tải.
- `<h2>` thô ở các màn khác (Kết nối, Zalo, Slack, chi tiết chiến dịch).
- Lọc, kiểu xem, màu trạng thái: NM2, NM3.
