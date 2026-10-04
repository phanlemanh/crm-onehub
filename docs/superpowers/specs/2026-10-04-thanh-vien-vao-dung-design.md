# Thành viên vào đúng — thiết kế

Hồ sơ: `_acceptance/thanh-vien-vao-dung/` · hàng lộ trình R1b (`docs/plan/lo-trinh-okr.json`) · T3.
Cổng Đáng ký `build` ngày 04/10/2026 (Phan Le Manh).

## Vì sao

Cả công ty đã được nhập trên production ngày 04/10. Bốn chỗ hỏng còn lại đụng tới người được
thêm sau và tới lần cho phép lại:

| # | Hỏng gì | Chỗ |
|---|---|---|
| #28 | `appSetting.staffEmailDomains` chỉ có đường đọc. Lọc «người nhà» ở `tracking` tắt hẳn; ghép hộp thư chỉ còn suy tên miền từ địa chỉ người dùng | `apps/api/src/workspace/staff-domains.ts:18-23`, `tracking-filing.service.ts:82`, `mailbox-match.service.ts:60` |
| #29 | Cho phép một địa chỉ đã là thành viên tạo dòng `pending`. `ensureWorkspaceMembership` thoát sớm cho thành viên có sẵn nên dòng đó không bao giờ thành `accepted`, và người đó bị liệt trong «Được phép vào» như chưa vào | `workspace.service.ts` `allowEmail`, `packages/auth/src/organization.ts` |
| #43 | `quyenQuanTri()` ở trang Thành viên biến lỗi `workspace.get` thành «không quyền»; nút «Cho phép một địa chỉ» biến mất tới khi tải lại trang | `settings/members/page.tsx` |
| #44 | Khi bảng thành viên rỗng, đoạn dựng lại loại mọi người từng có một lời cho phép đã kết thúc, kể cả người đã được cho phép lại. Trái luật «có dòng còn hiệu lực thì cho» của `decideSignIn`. Trạng thái không đọc được bị nuốt im | `packages/auth/src/organization.ts` |

Quyết định của chủ kho trong brainstorm (04/10):
- Ô «Tên miền nội bộ» đặt ở Cài đặt › Thành viên.
- Cho phép một địa chỉ đã là thành viên: từ chối, báo rõ, không tạo dòng.
- Soi production cho #44: máy tự chạy, chỉ đọc.

## Thiết kế

### #28 — đường ghi tên miền nội bộ

- Hai thủ tục mới trong router `workspace`, cùng `PhamViChungMiddleware`:
  - `workspace.staffDomains` (query) → `{ domains: string[], canEdit: boolean }`. Mọi thành
    viên đọc được; `canEdit` = `canManageSettings(role)`.
  - `workspace.setStaffDomains` (mutation, input `{ domains: string[] }`, tối đa 20 mục) →
    cùng hình đầu ra. Chỉ chủ sở hữu và quản trị; người khác 403.
- Chuẩn hoá ở service: chữ thường, bỏ `@` đầu, bỏ khoảng trắng, bỏ trùng, giữ thứ tự gõ.
  Mỗi mục phải qua `normalizeDomain` và không phải tên miền thư công cộng
  (`FREE_EMAIL_DOMAINS` của `companies/domain.ts`, xuất thêm `isFreeEmailDomain`) — sai thì
  400, gọi tên mục sai, cơ sở dữ liệu không đổi. Danh sách rỗng hợp lệ: lưu `null`.
- Lưu vào cột có sẵn `appSetting.staffEmailDomains` dạng chuỗi ngăn dấu phẩy, đọc lại bằng
  `parseStaffDomains` — một bộ đọc, hai đường đọc cũ không đổi. Không migration.
- Ghi log `Staff domains changed` kèm người đổi và danh sách cũ/mới.

### #29 — cho phép một người đã là thành viên

- `allowEmail`: trước khi kiểm «đã ở danh sách», tìm thành viên có `user.email` bằng địa chỉ
  đã chuẩn hoá. Có → 400 `That person is already a member. Change their role in the members
  table.`, không tạo dòng.
- `allowances()`: dòng `pending` mà địa chỉ thuộc một thành viên hiện tại được trả với trạng
  thái `accepted` khi đọc. Không ghi cơ sở dữ liệu. Khối «Được phép vào» (chỉ lọc `pending`)
  thôi liệt những người đó, và số đếm của khối giảm theo.
- `ensureWorkspaceMembership` không đổi ở nhánh thành viên có sẵn (đã chọn không tự lành lúc
  đăng nhập).

### #43 — nút đầu trang không biến mất sau lỗi

- `HanhDongDauTrang` thôi quyết bằng `quyenQuanTri()`. Nó prefetch `workspace.get` (không
  ném) và bọc `ChoPhepDiaChi` trong `HydrateClient` riêng của đầu trang.
- `ChoPhepDiaChi` đọc `useQuery(trpc.workspace.get)`:
  - có dữ liệu, `canManageMembers` → nút như hôm nay;
  - có dữ liệu, không quyền → không nút (giữ AC-10 đã ký của `thanh-vien-hai-khoi-cung-khuon`);
  - đang tải → không nút;
  - lỗi sau lượt thử lại → vẫn hiện nút. API vẫn chặn người không quyền bằng 403 trong hộp.
- Lỗi lúc máy chủ dựng trang không còn là trạng thái cuối: truy vấn phía trình duyệt thử lại
  (`retryQuery` của `lib/trpc/query-client.ts`) và nút hiện khi truy vấn thành công, không cần
  tải lại trang.
- `quyenQuanTri()` còn một chỗ dùng (prefetch khối «Được phép vào»); đổi sang đọc cùng truy
  vấn, lỗi thì vẫn prefetch — khối đã tự kiểm quyền phía trình duyệt.

### #44 — luật dựng lại thành viên

- Nhánh `enrolled === 0`: một người bị loại khi và chỉ khi có dòng đã kết thúc **và không có**
  dòng còn hiệu lực cho cùng địa chỉ — cùng luật với `decideSignIn`.
- Trạng thái không đọc được (`docTrangThai().loi`) ghi `console.error` như hai chỗ đọc khác.
- Soi production, chỉ đọc: `apps/api/scripts/soi-thanh-vien.ts` chạy trong một giao dịch
  `READ ONLY` và chỉ in số đếm, không in địa chỉ:
  1. `treo` — dòng `pending` có địa chỉ thuộc một thành viên hiện tại (#29);
  2. `bo-sot` — người dùng không phải thành viên mà có cả dòng kết thúc lẫn dòng còn hiệu lực (#44);
  3. `khong-doc-duoc` — dòng có trạng thái ngoài năm giá trị đã biết.
  Máy lấy chuỗi kết nối production qua `vercel env pull` vào tệp tạm ngoài kho, chạy, xoá tệp.
  Số đếm ghi vào `Notes` của hợp đồng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Thành viên → thẻ «Tên miền nội bộ» dưới hai bảng → gõ `onehub.center, onehub.vn` → «Lưu» → toast «Đã lưu tên miền nội bộ», ô hiện bản đã chuẩn hoá (điểm ra: ở lại trang).
- Biên: thành viên thường thấy thẻ ở dạng khoá kèm một dòng lý do; danh sách rỗng là hợp lệ («Chưa có tên miền nội bộ»); quản trị cho phép một địa chỉ đã là thành viên → hộp giữ mở, báo trong hộp.
- Lỗi & quay lại: tên miền sai dạng hoặc thư công cộng → lỗi dưới ô, chữ gõ còn nguyên, sửa rồi «Lưu» lại; tải thẻ lỗi → `Empty` có nút «Thử lại»; `workspace.get` lỗi lúc dựng trang → nút đầu trang hiện khi truy vấn phía trình duyệt thành công.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt › Thành viên — thẻ «Tên miền nội bộ» | Khai tên miền thư của công ty để máy nhận ra người nhà | thanh bên Cài đặt / ở lại |
| Cài đặt › Thành viên — hộp «Cho phép một địa chỉ» | Cho phép một địa chỉ chưa là thành viên | nút đầu trang / đóng hộp |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ten-mien-dang-tai | thẻ Tên miền nội bộ | khung xương cùng hình thẻ (tiêu đề, một ô, nút) | chờ |
| ST-ten-mien-rong | thẻ Tên miền nội bộ | ô trống, mô tả «Chưa có tên miền nội bộ — máy chưa nhận ra người nhà ở Theo dõi và hộp thư» | gõ tên miền, «Lưu» |
| ST-ten-mien-co | thẻ Tên miền nội bộ | ô chứa danh sách đã chuẩn hoá, «Lưu» tắt tới khi sửa | sửa hoặc rời trang |
| ST-ten-mien-dang-luu | thẻ Tên miền nội bộ | «Lưu» có spinner, ô khoá | chờ |
| ST-ten-mien-loi-nhap | thẻ Tên miền nội bộ | `FieldError` dưới ô gọi tên mục sai, chữ gõ giữ nguyên | sửa, «Lưu» lại |
| ST-ten-mien-khoa | thẻ Tên miền nội bộ (thành viên thường) | ô và «Lưu» khoá, dòng «Chỉ chủ sở hữu hoặc quản trị đổi được tên miền nội bộ.» | đọc |
| ST-ten-mien-loi-tai | thẻ Tên miền nội bộ | `Empty` «Không tải được tên miền nội bộ.» + «Thử lại» | thử lại |
| ST-cho-phep-da-la-thanh-vien | hộp Cho phép một địa chỉ | hộp giữ mở, thông điệp của API trong hộp | đóng hộp, đổi vai trò ở bảng trên |
| ST-dau-trang-sau-loi | đầu trang Thành viên | nút «Cho phép một địa chỉ» hiện khi truy vấn phía trình duyệt thành công | bấm nút |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô nhận dấu phẩy, khoảng trắng hoặc xuống dòng làm dấu ngăn; tối đa 20 tên miền.
- «Lưu» chỉ bật khi giá trị khác bản đã lưu; Enter trong ô gửi form.
- Ô và chữ người gõ mang `translate="no"`.
- Lưu xong toast «Đã lưu tên miền nội bộ»; theo luật «Lưu» thứ hai của `docs/settings.md` (form có ô gõ chữ), không có «Hoàn tác».

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent` | dùng | khuôn section của `docs/settings.md` |
| `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `Input` | dùng | ô gõ chữ xếp dọc |
| `Button` (spinner) | dùng | nút «Lưu» ở `CardAction` |
| `Empty` | dùng | lỗi khi tải có «Thử lại» |
| `Skeleton` | dùng | khung xương thẻ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: thêm một thẻ vào trang Cài đặt sẵn có, theo khuôn section của `docs/settings.md`; luồng hiển nhiên, không tra mẫu. Đối chiếu ngành: Slack «Approved domains», GitHub Organization «Verified domains» đều là một danh sách tên miền ở trang quản trị thành viên.
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn UI

`feature_loop.ui_standards_skill: web-design-guidelines` (`.agents/skills/web-design-guidelines`)
là skill rà tệp giao diện theo Web Interface Guidelines; chạy trên bản mẫu ở design-pass và
trên tệp thật ở S3.

## Không làm

- Ghi dữ liệu production. Dòng treo cũ thôi hiện ở «Được phép vào» nhờ đọc, nhưng vẫn nằm
  trong cơ sở dữ liệu.
- Tự lành lúc đăng nhập (đổi `pending` → `accepted` trong `ensureWorkspaceMembership`).
- Việt hoá thông điệp lỗi API ở hộp cho phép — cùng lớp với «That address is already on the
  list.» đang có.
- Thành viên thường thấy nút «Cho phép một địa chỉ» ở dạng khoá — đợt 4 của `docs/settings.md`;
  đổi nó là chạm AC-10 đã ký.
- Nhánh dựng lại vẫn đặt người cũ nhất làm chủ sở hữu bất kể vai trò lời cho phép ghi
  (`docs/api.md` đã khai).
