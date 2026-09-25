# Khung trang Cài đặt — đợt 1 của `docs/settings.md`

Ngày 2026-09-25 · hồ sơ `_acceptance/khung-trang-cai-dat/` · T2

## Vì sao

Bản audit ngày 25/09 đo được: mười một mục của Cài đặt có ba khung trang
(`PageShell`, `ConnectionPage`, `<main>` tự viết ở danh sách Kết nối), bốn bề
rộng (768 căn trái, 820 căn giữa, 560 căn giữa, 1280), ba cỡ tiêu đề trang
(`text-3xl`, `text-2xl`, `text-xl`), và hai trang không có `h1` nào (Google,
Microsoft). Chuyển tab làm mép trái nội dung nhảy khoảng 145px và đỉnh tiêu đề
tụt 24 → 40px (tính từ CSS). Thanh bên mười một mục phẳng tự đè class lên
`Button`, và mục «Thông báo của bạn» — cài đặt của một người — nằm dưới nhãn
«Cài đặt công ty». Chủ kho chốt khuôn đích ở `docs/settings.md`; vòng này làm
**khung**, không làm nội dung trong thẻ (đợt 2–5).

## Làm gì

1. **`PageShell` nhận `width`.** `narrow` · `page` · `wide` dùng
   `--container-narrow` · `--container-page` · `--container-page-wide`, căn trái
   (không `mx-auto`); `full` là cả vùng nội dung, cũng căn trái. Không truyền
   `width` thì giữ nguyên hành vi hôm nay (`max-w-7xl mx-auto`) — 23 trang ngoài
   Cài đặt không đổi. `full` KHÔNG phải mặc định: nếu là mặc định thì Tổ chức sẽ
   căn giữa ở khổ trên 1280px vùng nội dung và mép trái lại nhảy. Đầu trang
   và nội dung nằm trong cùng khối nên tự rộng bằng nhau.
2. **Mọi trang dưới `/settings` dùng `PageShell` với `width` theo bảng dưới.** Bỏ
   `ConnectionPage`, `ConnectionPageLoading`, `<main>` tự viết của danh sách Kết
   nối, và bốn lớp bọc `max-w-3xl` (Chung, Tiền tệ, Theo dõi, Thông báo).
   `OAuthConnectionPage` chỉ còn đọc tham số và dựng `PageShell`.

   | `width` | Trang |
   | --- | --- |
   | `narrow` | Kết nối › Intake |
   | `page` | Chung, Theo dõi & phân tích, Tiền tệ, Kết nối (danh sách), Kết nối › Google/Microsoft/Slack/Slack › Người/Zalo, Nhắc buổi sáng |
   | `wide` | Trường, Thành viên, Khoá API, SSO, Điều phối 30 ngày |
   | `full` | Tổ chức |

   Điều phối 30 ngày và danh sách Kết nối không có trong bảng của
   `docs/settings.md`; vòng này xếp chúng như trên (Điều phối là lưới hai thẻ nên
   cần `wide`) và bổ sung bảng đó.
3. **Đầu trang.** Mỗi trang có đúng một `h1` là `PageShellTitle`. `PageShellHeader`
   nhận thêm ô `breadcrumb`, vẽ phía trên tiêu đề. Cài `breadcrumb` của shadcn vào
   `packages/ui` (bậc 2 của «Vẽ tay là bậc cuối»). Sáu trang con của Kết nối mang
   breadcrumb «Kết nối › <tên>» («Kết nối › Slack › Người» cho trang người khớp);
   mục cuối là trang hiện tại (`aria-current="page"`), các mục trước là liên kết.
   Tên kết nối mang `translate="no"`. Tiêu đề thẻ của Google và Microsoft bỏ tên
   nhà cung cấp lặp lại, chỉ còn `StatusIndicator`. Nút ở đầu trang
   («Thêm» của danh sách Kết nối, «Ngắt kết nối» của Slack) vào `PageShellActions`.
   Trạng thái «Chưa cắm» của Slack chưa kết nối xuống đầu thân trang. Logo và
   trạng thái trong đầu trang (`ConnectionHeader`) để đợt 5. Breadcrumb **chỉ có ở
   trang con** (hướng B của design-pass): chuyển tab trên thanh bên giữ tiêu đề
   đứng yên; trang con thấp hơn đúng một dòng vì nó sâu hơn một cấp. Hướng A —
   mọi trang mang dòng «Cài đặt › …» để tiêu đề đứng yên cả ở trang con — bị bỏ vì
   dòng đó lặp đúng điều thanh bên đã nói (bản mẫu `ST-phuong-an-a`).
4. **Thanh bên.** `lib/cai-dat-dieu-huong.ts` khai `NHOM_CAI_DAT`: bốn nhóm
   (Không gian làm việc: Chung · Tiền tệ · Trường; Con người: Thành viên · Tổ chức
   · Điều phối 30 ngày; Kết nối và dữ liệu: Kết nối · Theo dõi & phân tích; Bảo
   mật: SSO · Khoá API). `MUC_CAI_DAT` còn lại là danh sách phẳng suy từ nhóm, cho
   bên đọc cũ. Desktop: mỗi nhóm có nhãn, mỗi mục là `NavItem`. Nhãn nhóm và
   kiểu hàng ngang của khổ hẹp là biến thể mới trong
   `packages/ui/src/components/nav-item.tsx` — bản mẫu phải tạm ráp hai thứ này
   bằng class, đúng thứ luật «Vẽ tay là bậc cuối» cấm ở mã thật. Điện thoại: một
   hàng cuộn ngang, không nhãn nhóm. Vỏ tải (`SettingsSidebarFallback`) vẽ cùng
   hình để không nhảy khi tải xong. Nhãn cả thanh «Cài đặt»; mục «Tổng quan» →
   «Chung» (tiếng Anh giữ «General»; nhãn thanh tiếng Anh «Settings»). Thẻ đầu
   của trang Chung đổi tiêu đề «Công ty» → «Không gian làm việc», mô tả trang
   «Công ty bạn là ai…» → «OneHub là ai…» — cùng lý do từ điển.
   Menu người dùng dùng biểu tượng báo thức (`Alarm`), không dùng chuông: từ điển
   tránh «thông báo» vì người dùng sẽ đi tìm chuông trong app.
5. **Nhắc buổi sáng.** Trang mới `/[slug]/reminders`, `width="page"`, tiêu đề
   «Nhắc buổi sáng» / «Morning reminders», ghép đúng hai khối đang có
   (`khoi-zalo`, `khoi-kenh`). Không có thanh bên Cài đặt. Menu người dùng thêm
   mục «Nhắc buổi sáng» phía trên dòng đổi giao diện. `/[slug]/settings/notifications`
   chuyển hướng sang trang mới. `hrefThongBao` của Kết nối › Zalo trỏ trang mới.
   Mục **Nối Zalo** của `CONTEXT.md` đổi chỗ làm việc sang «Nhắc buổi sáng ở menu
   người dùng». Hai tệp `khoi-zalo.tsx`, `khoi-kenh.tsx` **để nguyên thư mục** vì
   ba bài kiểm đã ký import thẳng đường đó.

## Hai lời hứa đã ký bị đổi có chủ đích

- `loi-vao-dieu-phoi-30-ngay` ghim «Điều phối 30 ngày đứng cuối thanh bên»
  (`apps/app/test/cai-dat-dieu-huong.spec.ts`). Theo thứ tự nhóm đã chốt, mục ấy
  đứng cuối nhóm Con người, không cuối cả thanh. Đề xuất: đổi lời hứa thành
  «đứng cuối nhóm Con người», sửa bài kiểm, ghim lại hồ sơ bằng làn máy.
- `nhac-qua-zalo` E17 (phép đo nhìn-thấy) ghim «thanh bên Cài đặt có mục "Thông
  báo của bạn"» và mở `/settings/notifications`. Đề xuất: dòng đó đổi thành «menu
  người dùng có mục "Nhắc buổi sáng"», bước mở đổi sang `/reminders`; hồ sơ phải
  đi một vòng S4 delta vì phép đo nhìn-thấy không nằm trong làn ghim máy.

## Ngoài vòng

Nội dung trong thẻ (dòng `Field`, luật lưu, danh sách `Item`, trạng thái), gộp
Google/Microsoft, `ConnectionHeader`, chia nhóm danh sách Kết nối — đợt 2–5.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: menu người dùng hoặc biểu tượng Cài đặt → một mục thanh bên → trang
  của mục (mép trái, tiêu đề đứng yên) → trang con qua liên kết trong trang →
  breadcrumb về trang cha (điểm ra: mục khác trên thanh bên, hoặc rời Cài đặt).
- Nhắc buổi sáng: menu người dùng → «Nhắc buổi sáng» → `/[slug]/reminders`.
  Liên kết «Nối Zalo của tôi» ở Kết nối › Zalo cũng tới đây.
- Biên: đường cũ `/settings/notifications` (dấu trang, tin cũ) → chuyển hướng tới
  `/reminders`. Thành viên thường thấy cùng thanh bên; trang nào khoá thì khoá
  trong thân trang, không ẩn mục.
- Lỗi & quay lại: trang con lỗi tải vẫn có breadcrumb và thanh bên để về.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Thanh bên Cài đặt | chọn đúng mục cài đặt | biểu tượng Cài đặt / mọi trang Cài đặt |
| Trang mục (10) | chỉnh một nhóm thiết lập | thanh bên / trang con |
| Trang con Kết nối (6) | xem và chỉnh một kết nối | danh sách Kết nối / breadcrumb |
| Nhắc buổi sáng | chọn kênh nhắc, nối Zalo của mình | menu người dùng, Kết nối › Zalo / nơi khác |
| Menu người dùng | tới cài đặt của riêng mình | đầu trang / Nhắc buổi sáng |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-thanh-ben-dang-tai | Thanh bên | bốn nhóm, mục mờ, cùng vị trí với bản tải xong | chờ |
| ST-thanh-ben-desktop | Thanh bên | nhãn nhóm + mục, mục đang mở sáng | chọn mục |
| ST-thanh-ben-hep | Thanh bên | một hàng cuộn ngang, không nhãn nhóm | vuốt, chọn mục |
| ST-thanh-ben-trang-con | Thanh bên | «Kết nối» sáng khi ở mọi trang con | chọn mục |
| ST-trang-dang-tai | Trang mục | tiêu đề thật + vỏ tải chung | chờ |
| ST-trang-con-breadcrumb | Trang con | «Kết nối › Google» trên tiêu đề «Google» | bấm «Kết nối» để về |
| ST-nhac-duong-cu | `/settings/notifications` | chuyển hướng, không vẽ gì | — |
| ST-nhac-trang | Nhắc buổi sáng | tiêu đề «Nhắc buổi sáng», hai khối Zalo và kênh, không thanh bên | nối Zalo, chọn kênh |
| ST-menu-nguoi-dung | Menu người dùng | mục «Nhắc buổi sáng» trên dòng đổi giao diện | bấm để mở trang |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mép trái cột nội dung trùng nhau trên mọi trang Cài đặt ở cùng khổ; đỉnh `h1`
  trùng nhau trong các trang mục, và trong các trang con (thấp hơn một dòng).
- Breadcrumb: mục trước là `<a>`, mục cuối là chữ mang `aria-current="page"`.
- Thanh bên: `aria-current="page"` trên đúng một mục; Tab đi qua các mục theo thứ tự nhóm.
- Khổ < 768: thanh bên thành hàng cuộn ngang; không trang nào tràn ngang ở 375.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `PageShell` | mở rộng | thêm `width`; mặc định giữ nguyên cho 23 trang khác |
| `PageShellHeader` | mở rộng | thêm ô `breadcrumb` |
| `breadcrumb` (shadcn) | dùng | bậc 2: cài vào `packages/ui`, không vẽ tay |
| `NavItem` | mở rộng | thêm nhãn nhóm và kiểu hàng ngang trong `packages/ui`, thay `Button` đè class |
| `DropdownMenuItem` | dùng | mục mới của menu người dùng |
| `ConnectionPage` | xoá | thay bằng `PageShell` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: đã tra Mobbin (Twenty, v0, Railway, Plain, Airtable, Customer.io — màn
cài đặt không gian làm việc). Rút ra: thanh bên chia nhóm có nhãn, cột nội dung
căn trái cạnh thanh bên, breadcrumb «Workspace / Security» trên tiêu đề (Twenty).
Khác biệt có chủ đích: Twenty và v0 giữ cài đặt cá nhân trong thanh bên (nhóm
User/Account); chủ kho chọn đưa ra menu người dùng.
<!-- UX-SPEC-TEMPLATE>>> -->
