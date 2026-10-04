# Cửa vào vá — thiết kế (R1f `cua-vao-va`)

Hồ sơ: `_acceptance/cua-vao-va/` · ô cơ hội đã ký `build` 04/10 · hạng T2 · hạn 11/10.

## Vì sao

Sau đợt nhập cả công ty, mọi nhân viên đi qua cửa vào. Ba chỗ còn hở:

- **#31** — biểu mẫu Quên mật khẩu (`quen-mat-khau-form.tsx`) tự dựng tiêu đề không logo. Khung chờ
  dùng `AuthHeading` (có logo) nên logo hiện rồi biến mất khi biểu mẫu nạp xong; ở khổ điện thoại cột
  trái có logo bị ẩn, người dùng không thấy logo nào.
- **#32** — `apps/app/lib/sign-out.ts` hiện `error.message` của thư viện đăng nhập; câu tiếng Việt
  của nơi gọi chỉ là dự phòng.
- **#33** — `apps/api/src/trpc/trpc.context.ts` nuốt lỗi `getSession()` thành «không có phiên»; ba
  middleware cần đăng nhập ném `UNAUTHORIZED`; proxy của app thấy 401 là đưa về `/sign-in`. Lúc API
  lỗi cơ sở dữ liệu, người còn phiên bị đá ra, có khi vòng chuyển hướng (Known limits Ngoài-1/Ngoài-4
  của `phien-chet-ve-dang-nhap`). App không có `error.tsx` nào, nên lỗi dựng trang hiện trang lỗi
  mặc định tiếng Anh của Next, không có lối thử lại.
- **Nợ thước `cua-vao-dang-nhap`** — đo trên cây `da5455f4` (05/10): 14/15 eval máy xanh, đỏ E16
  `soi-ma.mjs` vạch «danh-sach: 0 tệp vòng này trong apps/app». Thước lấy danh sách tệp bằng
  `git diff merge-base(HEAD, origin/onehub)` — đo diff của nhánh đang đứng, không phải của vòng đã ký:
  đỏ trên nhánh không chạm `apps/app`, đo sai sau khi merge và trên CI nông (cùng lớp #139). Vạch
  `khong-shader` của `do-cua-vao.mjs` đo lại trong lượt ghim.

## Quyết định đã chốt với chủ kho

- Trang lỗi: phương án (a) — trang lỗi tiếng Việt cho vùng app, bắt mọi lỗi dựng trang, có nút
  «Thử lại» (05/10).
- API: phương án A — ngữ cảnh ghi cờ «đọc phiên lỗi», middleware ném `SERVICE_UNAVAILABLE` (503).
  Loại phương án B (bỏ bắt lỗi trong ngữ cảnh) vì thủ tục công khai không cần phiên sẽ hỏng oan.

## Thiết kế

### #33 — API (`apps/api/src/trpc/`)

- `context.types.ts`: `BaseTrpcContext` thêm `sessionError: boolean`.
- `trpc.context.ts`: lỗi của `getSession()` → `session: null, sessionError: true`, ghi một dòng
  `logger.error({ message: "Could not read the session" }, err.stack)` (không header, không cookie —
  luật Logging của `docs/api.md`). Không có lỗi → `sessionError: false`.
- `auth.middleware.ts`, `signed-in.middleware.ts`, `session-only.middleware.ts`: trước khi kiểm
  `user`, `ctx.sessionError` → `throw new TRPCError({ code: "SERVICE_UNAVAILABLE" })`. Các nhánh còn
  lại giữ nguyên: không phiên vẫn 401, không là thành viên vẫn 403.
- Thủ tục công khai không đọc cờ — chạy như cũ.
- Đo đủ: quét mọi thủ tục tRPC trả 401 khi không phiên, mỗi thủ tục phải trả 503 khi `getSession` ném
  (E2, gap-probe F2) — không dựa vào danh sách ba lớp viết tay.
- Không chạm `apps/api/src/auth/**`, `packages/auth/**` → hạng T2.
- Proxy (`apps/app/proxy.ts`, `lib/onboarding.ts`) không sửa: `docGate` chỉ coi 401 là hết phiên,
  mọi mã khác là «không đọc được» → cho đi (luật «An unreachable API fails open» của `docs/api.md`).
  Vòng này thêm một ca kiểm khoá hành vi đó với 503.

### #33 — trang lỗi của app

- `apps/app/app/(app)/[slug]/error.tsx` — bắt lỗi dựng trang dưới `/<slug>/…`; nằm trong layout
  `[slug]` nên đầu trang và thanh biểu tượng vẫn còn (layout đã tự nuốt lỗi `workspace.get`).
- `apps/app/app/(app)/error.tsx` — bắt lỗi của chính layout `[slug]` (vd app không đọc được phiên).
- Cả hai: `"use client"`, nhận `{ error, retry }` theo quy ước Next 16.3
  (`node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`), dựng chung một
  thành phần `TrangLoiTam` trong `apps/app/components/` bằng `Empty` + `Button` của `@crm/ui`. Chữ ở
  `apps/app/lib/messages/` (vi + en). Không nút đăng xuất, không chuyển hướng.

### #31 — logo Quên mật khẩu

- Tách phần thân của `AuthHeading` thành `DauCuaVao` (không async, nhận chữ đã dịch) trong
  `apps/app/components/auth-shell.tsx` hoặc tệp cạnh nó; `AuthHeading` server gọi lại nó.
- `quen-mat-khau-form.tsx` bỏ `Heading` tự dựng, dùng `DauCuaVao` cho cả hai trạng thái; trang
  truyền chữ `homepage` xuống.

### #32 — đăng xuất

- `signOutAndRedirect(loiMacDinh)`: lỗi trả về hoặc ném → `toast.error(loiMacDinh)` và
  `console.error` lỗi gốc; thành công → `/sign-in`. Ba nơi gọi đã truyền câu tiếng Việt, không đổi.

### Nợ thước

- `_acceptance/cua-vao-dang-nhap/rang/soi-ma.mjs`: danh sách tệp «vòng này» đọc từ tệp đóng băng
  `_acceptance/cua-vao-dang-nhap/rang/tep-vong.txt` (commit trong hồ sơ) thay cho
  `merge-base(HEAD, origin/onehub)`; vạch (d) cũng đọc danh sách đó. Không gọi git ở đường đo
  (clone nông thiếu đối tượng của `d864d529`). Tệp đóng băng được đối chiếu với
  `git diff --name-only d864d529^1 d864d529 -- apps/app` ở nơi có đủ lịch sử (E13, gap-probe F1).
  Giữ đường `CVDN_SOI_TEP` cho đối chứng.
- Ghim lại `cua-vao-dang-nhap` trong cùng làn với R1f; `khong-shader` đo lại ở đó.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: đăng nhập → bấm «Quên mật khẩu?» → trang Quên mật khẩu (logo trên tiêu đề) → nhập email →
  «Đã gửi» (logo vẫn ở đó) → «Quay lại đăng nhập» (điểm ra: `/sign-in`).
- Biên: đăng xuất lỗi ở đầu trang app, trang hết quyền, trang cấp quyền hộp thư → toast tiếng Việt,
  người ở lại trang.
- Lỗi & quay lại: đang ở `/<slug>/…` mà API không đọc được phiên → trang lỗi trong khung app, «Thử
  lại» dựng lại đoạn hỏng; thử lại vẫn lỗi → trang lỗi ở lại, không chuyển hướng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Quên mật khẩu | xin liên kết đặt lại mật khẩu | từ `/sign-in` / về `/sign-in` |
| Trang lỗi trong app | báo hệ thống trục trặc, phiên còn, cho thử lại | từ mọi trang `/<slug>/…` / ở lại chỗ cũ |
| Trang lỗi ngoài khung | như trên khi khung app không dựng được | từ `/<slug>/…` / ở lại chỗ cũ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-quen-mat-khau-dang-tai | Quên mật khẩu | logo + tiêu đề + mô tả (khung chờ) | chờ |
| ST-quen-mat-khau-nhap | Quên mật khẩu | logo + «Quên mật khẩu» + ô email + nút gửi | nhập email |
| ST-quen-mat-khau-da-gui | Quên mật khẩu | logo + tiêu đề «đã gửi» + mô tả số phút + «Quay lại đăng nhập» | mở hộp thư / quay lại |
| ST-trang-loi-trong-khung | Trang lỗi trong app | đầu trang + thanh biểu tượng; giữa: «Hệ thống đang trục trặc» + «Phiên của bạn vẫn còn…» + nút «Thử lại» | bấm «Thử lại» |
| ST-trang-loi-dang-thu | Trang lỗi trong app | nút «Thử lại» khoá, có Spinner | chờ |
| ST-trang-loi-ngoai-khung | Trang lỗi ngoài khung | cùng chữ và nút, không đầu trang | bấm «Thử lại» |
| ST-dang-xuat-loi | đầu trang / hết quyền / cấp quyền | toast «Chưa đăng xuất được…» (tiếng Việt) | thử lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- «Thử lại» là nút chính duy nhất trên trang lỗi; focus tự vào nút khi trang lỗi hiện (bàn phím
  Enter thử lại ngay).
- Tiêu đề trang lỗi mang `role="heading"` `aria-level={1}` (vì `EmptyTitle` là `div`); vùng lỗi mang
  `aria-live="polite"` để «Đang thử lại…» được đọc (design-pass, luật web-design-guidelines).
- Khổ 375 và 1440: logo Quên mật khẩu nằm trên tiêu đề, không tràn ngang; trang lỗi canh giữa vùng
  nội dung, nút trong khung nhìn không cần cuộn.
- Không chữ tiếng Anh nào của thư viện lộ ra màn; chữ người nhập (email) không dịch.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `LogoLockup`, `Link` | dùng | đã là logo của mọi trang cửa vào |
| `DauCuaVao` | ghép (tách từ `AuthHeading`) | một khối tiêu đề cho server và client, không vẽ lại |
| `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` | dùng | khuôn trạng thái trống/lỗi của `@crm/ui` |
| `Button`, `Spinner` | dùng | nút chính + trạng thái đang thử |
| `TrangLoiTam` | ghép | một thân cho hai `error.tsx` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — ba màn đều một việc, không có lựa chọn khuôn thứ hai; không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- `app/global-error.tsx` (lỗi của layout gốc) và trang lỗi cho các trang cửa vào `(landing)`.
- Lượt tự thử lại của truy vấn phía trình duyệt khi gặp 503.
- Độ trễ 5 phút của `cookieCache` (Notes của `phien-chet-ve-dang-nhap`).
- Tự đăng xuất người khi API lỗi — trái chính lời hứa của vòng.
- Proxy tự phân biệt 5xx — proxy đã bỏ qua mọi mã khác 401.

## Đo

Theo `MEASURE-BIRTH-CLAUSE`: mỗi phép đo mới có cặp hai chiều trên cùng fixture với thông điệp ghim.
API bằng test HTTP thật qua Nest (`spyOn(auth.api, "getSession")`, khôi phục sau mỗi ca); proxy bằng
`onboarding-gate.spec.ts`; app bằng test DOM; màn thật bằng `rang/do-man.mjs` qua `mot-luot.sh` ở khổ
375 và 1440 (lỗi đọc phiên dựng bằng lỗi có thể hoàn lại trong kho đo dùng-một-lần); nợ thước bằng
chính `soi-ma.mjs` sau khi sửa.
