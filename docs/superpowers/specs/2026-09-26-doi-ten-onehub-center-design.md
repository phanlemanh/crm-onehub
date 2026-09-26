# Đổi tên CRM → OneHub Center, và cột trái của /sign-in — thiết kế

Ngày 2026-09-26. Hồ sơ: `_acceptance/doi-ten-onehub-center/`. Hạng T3 (chạm
`packages/auth` và `apps/api/src/workspace`).

## 1. Vì sao

**Tên.** Sản phẩm chạy ở `onehub.center`, nhưng màn hình gọi nó là «CRM». Người
gõ một địa chỉ rồi đọc một tên khác. `CONTEXT.md` lại đang gạt nghĩa bán hàng mà
chữ CRM kéo theo (mục *Nhân viên quan hệ đối tác*: «họ không bán gì cho ai»). Chủ
kho chốt tên **OneHub Center** trong phiên 26/09.

**Cột trái.** Ở khổ thật (1860px), khối «Lần đầu vào?» là một `Card` rộng 448px
trong cột rộng khoảng 1340px: hai phần ba cột trống, không có điểm neo, dòng giới
thiệu thành chữ nhỏ ở đáy. Gốc rễ: bản mẫu được duyệt trong khung `max-w-5xl`
(`_acceptance/cua-vao-dang-nhap/design-pass.md`, mục Nhóm 2 cuối). Nền phẳng là
quyết định đã ký (AC-10 của `cua-vao-dang-nhap`), chọn vì `AuthShader` viết cứng
gradient đen không hợp giao diện sáng. Chủ kho duyệt hướng A ngày 26/09 sau khi
so ba hướng trên ảnh mô phỏng.

## 2. Luật tên

- Luôn viết đủ **OneHub Center**; không «Center» đứng một mình, không dịch
  «Trung tâm», tiếng Anh không kèm «the».
- Chỉ đổi chữ **người đọc**. Không đổi: gói `@crm/*`, CSDL `crm_*`, công cụ
  `search_crm`, mô tả công cụ và chỉ dẫn viết cho model ở `apps/agent`, tiêu đề
  tài liệu API, trang giới thiệu của hãng (`(landing)/**`, `components/landing/**`),
  các module `/proto` cũ.
- Giữ nguyên câu «This CRM is private…» ở `packages/auth/src/auth.ts`: trang
  `/sign-in` phân loại lỗi bằng chính câu đó (AC-5 của `cua-vao-dang-nhap`);
  người dùng không đọc nó, họ đọc câu tiếng Việt của `cua-vao.ts`.
- Mã giữ từng chuỗi viết thẳng, không có hằng chung: kho chuỗi `messages/*` là
  chuỗi viết thẳng, và không gói nào mà cả tệp client của `apps/app`, `apps/api`,
  `packages/auth` và `apps/agent` cùng nhập được. Tính nhất quán do **bộ quét**
  giữ (§4).

## 3. Phạm vi chữ

| Nguồn | Chỗ |
|---|---|
| `apps/app/lib/messages/*.ts` | 14 tệp, 110 chỗ (vi + en) |
| `apps/app/app/layout.tsx`, `apps/app/public/site.webmanifest` | tên tab, tên ứng dụng |
| `apps/app/lib/workspace-label.ts` | nhãn đầu trang (§3.1) |
| `apps/app/lib/agent-run-failure.ts`, `agent-transcript.ts` | 4 câu tiếng Anh hiện trên màn |
| `apps/api/src/{zalo,okr,to-chuc,currency,contacts,conversations,backfill}` | lời báo trả về màn |
| `apps/api/src/workspace/workspace.service.ts` (T3) | 2 dòng dòng thời gian |
| `packages/auth/src/{thu-mat-khau,organization,slack-connect,slack-scopes}.ts`, `appName` của `auth.ts` (T3) | tiêu đề thư mật khẩu, tên không gian mặc định, lời Slack |
| `packages/validation/src/vai-workspace.ts`, `packages/db/src/crm-events.ts` | lời báo vai, mô tả sự kiện |
| `apps/agent/agent/lib/zalo-config.ts` | 3 tin bot Zalo gửi người |

### 3.1 Nhãn đầu trang

`workspaceLabel` hôm nay ghép «<tên không gian> CRM». Ghép «Center» sẽ ra «Acme
Center» — phạm luật tên. Nhãn mới: tên không gian rỗng, bằng tên mặc định mới,
hoặc bằng tên mặc định cũ «CRM» → «OneHub Center»; còn lại → đúng tên không gian,
không hậu tố. Không sửa dữ liệu: không gian đã mang tên «CRM» vẫn hiện «OneHub
Center» nhờ luật này, không cần migration.

## 4. Bộ quét tên

Một script (`_acceptance/doi-ten-onehub-center/rang/quet-ten.mjs`) quét tập nguồn
khai trước ở §3, tìm mọi chuỗi mang `\bCRM\b`, và đỏ khi còn chuỗi ngoài danh
sách ngoại lệ khai trước (tệp + chuỗi nguyên văn). Cùng lượt quét, nó kiểm luật
tên: mọi «Center» phải đi sau «OneHub », không có «Trung tâm», không có «the
OneHub Center». Ở `merge-base` nó đỏ và gọi tên từng tệp; đó là đối chứng.

## 5. Cột trái (hướng A)

- **`LuoiCham`** — thành phần mới ở `packages/ui/src/components/luoi-cham.tsx`
  (bậc 5 của `docs/design.md`: bậc 1–3 không có nền lưới; block ReUI `auth-1`,
  `auth-6` là bản Pro, chỉ tham chiếu bố cục). Lưới chấm tĩnh, `aria-hidden`,
  không chuyển động, màu chỉ từ token (`--border`), mờ dần bằng mask radial. Thay
  `AuthShader` ở cả năm trang `AuthShell`; xoá `auth-shader.tsx`.
- **`StepList` tĩnh vẽ đường nối** — `StepperSeparator` giữa các bước (n−1 đường),
  chỉ ở chế độ `tinh`; chế độ tiến độ giữ nguyên.
- **`/sign-in`** — bỏ `Card`; «Lần đầu vào?» thành nhãn nhỏ; dòng «OneHub Center:
  đối tác, kế hoạch 30 ngày và OKR.» thành thẻ `p` cỡ lớn làm điểm neo (một `h1`
  mỗi trang: «Đăng nhập vào OneHub Center» ở cột phải); khối rộng tối đa 36rem,
  mép trái trùng logo.
- **Bốn trang kia** — nền `LuoiCham` thay `AuthShader`; bỏ nhãn nhỏ «CRM» phía
  trên tiêu đề (logo đã ghi OneHub, tiêu đề ngay dưới mang tên đủ).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: mở `onehub.center` → `/sign-in` → đọc tiêu đề «Đăng nhập vào OneHub Center» → bấm Google hoặc điền mật khẩu → vào ứng dụng (điểm ra: `/`).
- Biên: người mới chưa được cho phép → đọc ba bước ở cột trái (dưới form ở 320/768) → nhờ quản trị viên.
- Lỗi & quay lại: bị từ chối → `/sign-in?error=…` → ô lỗi phía trên nút đầu tiên (giữ nguyên hồ sơ `cua-vao-dang-nhap`) → làm lại theo ba bước.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| `/sign-in` | đăng nhập, và chỉ đường cho người chưa có quyền | `/` hoặc liên kết ngoài / `/` |
| Bốn trang `AuthShell` kia | việc riêng từng trang (đặt mật khẩu, cấp quyền, bắt đầu) | thư, lời mời / `/` |
| Đầu trang ứng dụng | nói người đang ở không gian nào | mọi trang trong `(app)` |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-sign-in-rong | `/sign-in` khổ ≥1024 | nền lưới chấm; dòng neo «OneHub Center: đối tác, kế hoạch 30 ngày và OKR.»; nhãn «Lần đầu vào?»; ba bước nối bằng đường dọc; form ở cột phải | đăng nhập hoặc làm theo ba bước |
| ST-sign-in-hep | `/sign-in` khổ 320/768 | form trước, khối ba bước dưới nút «Đăng nhập» | như trên |
| ST-sign-in-loi | `/sign-in?error=…` | ô lỗi `role="alert"` trên nút đầu tiên, cột trái không đổi | thử lại hoặc nhờ quản trị viên |
| ST-sign-in-chi-mat-khau | `/sign-in`, không nút ngoài | hai bước, bước mật khẩu là đường chính | xin liên kết đặt mật khẩu |
| ST-shell-khac | bốn trang kia, khổ ≥1024 | nền lưới chấm, dòng tiêu đề lớn, không nhãn «CRM» | việc của trang |
| ST-dau-trang-mac-dinh | đầu trang, không gian chưa đặt tên hoặc tên «CRM» | «OneHub Center» | dùng ứng dụng |
| ST-dau-trang-co-ten | đầu trang, không gian có tên | đúng tên không gian, không hậu tố | dùng ứng dụng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Khối ba bước và nền không nhận tiêu điểm; vòng Tab giữ nguyên hồ sơ `cua-vao-dang-nhap` (logo cột phải → nút ngoài → email → mật khẩu → «Quên mật khẩu?» → «Đăng nhập»).
- Khổ: dưới 1024 khối ba bước nằm dưới form; từ 1024 nằm ở cột trái; đo thêm 1920.
- Giao diện sáng và tối cùng dùng một nền, màu lấy từ token; nền không chuyển động nên `prefers-reduced-motion` không có gì để tắt.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `StepList` | mở rộng | chế độ `tinh` thêm `StepperSeparator` sẵn có của `reui/stepper` |
| `LuoiCham` | tạo | bậc 1–3 không có nền lưới; block Pro `auth-1`/`auth-6` chỉ tham chiếu bố cục |
| `LogoLockup`, `Separator` | dùng | giữ nguyên |
| `Card` | bỏ khỏi khối hướng dẫn | hộp trong hộp — khối là nội dung của cột, không phải một mặt nền |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: đã tra Mobbin (12 trang đăng nhập chia đôi: Deputy, Midday, YNAB, Cofounder, LangSmith, Fabric, Deel, Juicebox, WorkOS…) và ReUI (`auth-1`, `auth-6`, `auth-14`, `auth-18`). Rút ra: cột phụ gần như luôn là không khí thương hiệu, còn «xin quyền» thường chỉ là một dòng dưới form. CRM nội bộ không có lời khen hay logo khách để trưng, nên ba bước vẫn ở cột trái, trình theo lối biên tập của LangSmith (tiêu đề lớn và nội dung đặt thẳng trên nền có kết cấu).
<!-- UX-SPEC-TEMPLATE>>> -->

## 6. Đo

- Chữ: bộ quét (§4), test DOM tiêu đề vi/en, test nhãn đầu trang, test tiêu đề thư.
- Bố cục: test DOM `StepList` (đường nối n−1, chế độ tiến độ giữ nguyên) và `AuthShell` (năm trang dùng `LuoiCham`, không còn `AuthShader`); thước màn thật trong phiên đo ở 1440 và 1920 (không `Card`, mép trái khối trùng logo, cỡ dòng neo, khối ≤ 576px); chạy lại thước màn đã ký của `cua-vao-dang-nhap` (320/768/1024/1440, Tab, tương phản).
- Không hồi quy: eval máy của hồ sơ đã ký có `paths` giao `diff` — đạt ở `merge-base` thì phải đạt ở HEAD. Thước của hồ sơ đã ký mà vòng này sửa thì chỉ được sửa bằng phép thế tên: thế ngược «OneHub Center» → chữ cũ phải cho lại đúng từng byte tệp ở `merge-base`.
- Mắt người: ảnh `ui-check` `/sign-in` ở 375, 1440, 1920 × sáng, tối.

## 7. Không làm

- Đổi tên gói, CSDL, công cụ, chỉ dẫn cho model.
- Lời báo của `builder-runtime.ts`/`run-runtime.ts` ở `apps/agent` (tiếng Anh, lẫn giữa chỗ model đọc và chỗ người đọc — tách thành việc riêng).
- Sửa dữ liệu không gian đã có.
- Ảnh sản phẩm, lời khen, logo khách ở cột trái (hướng B, C đã bác).
