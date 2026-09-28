# Phiên chết về trang đăng nhập — thiết kế

Ngày 2026-09-28 · hạng T2 · hồ sơ `_acceptance/phien-chet-ve-dang-nhap/`

## Vấn đề (đã đo trên production)

Người mang một cookie phiên `crm.session_token` mà phiên phía máy chủ đã hết —
bị thu hồi, đăng xuất ở tab/máy khác, đăng xuất lỗi — mở `https://www.onehub.center/`
thì thấy landing của hãng («The CRM built for Agents», logo Comp AI, nút Star on
GitHub). Đo 2026-09-28 bằng `curl`:

| Cookie | `GET /` |
| --- | --- |
| không có | 307 → `/sign-in` |
| `__Secure-crm.session_token=het-han.abc` | 200, tiêu đề «The CRM for agents · OneHub Center» |

API production trả `401 UNAUTHORIZED` cho `workspace.get` và `settings.researchKey`
khi phiên chết lẫn khi không có cookie. `POST /api/auth/sign-out` xoá đủ ba cookie
kể cả với token giả — nút đăng xuất không phải chỗ hỏng.

`/het-quyen` với cookie chết trả 200 và nói «Tài khoản này không còn trong không
gian làm việc» — sai cho người chỉ hết phiên.

## Vì sao lọt

1. `proxy.ts` chỉ kiểm có cookie hay không (`getSessionCookie`), không kiểm cookie
   còn hiệu lực — đúng vai «kiểm lạc quan» của proxy theo hướng dẫn Authentication
   của Next.js và tài liệu `getSessionCookie` của better-auth.
2. Có cookie → proxy hỏi `workspace.get`. 401 bị `read()` trong `lib/onboarding.ts`
   gộp chung với timeout và lỗi mạng thành `null` → `gate: "unknown"` → `NextResponse.next()`.
3. `(landing)/page.tsx` không tự kiểm `isMarketing()` — vẽ landing cho ai lọt qua proxy.
   `/onboarding` và `/grant-access` tự kiểm phiên trong trang nên không lọt; `/` và
   `/het-quyen` thì không.

## Thiết kế

### B — proxy tách 401 khỏi «không biết»

- `read()` trong `lib/onboarding.ts` trả thêm tín hiệu «hết phiên», bật khi và chỉ khi
  phản hồi có status **401**. Timeout, lỗi mạng, 5xx, 403, phong bì hỏng: không bật.
- `WorkspaceGate` có thêm trường `hetPhien: boolean`. `readResearchGate` giữ nguyên
  kết quả (chỉ đọc phần dữ liệu).
- `proxy()`: sau khi đọc hai cổng, `workspace.hetPhien` bật và đường dẫn không công khai
  → chuyển `/sign-in` (cùng cách chuyển với người không cookie). Đường công khai
  (`/` khi `IS_MARKETING=true`) giữ landing. `/sign-in`, đường ẩn danh và `UNGATED`
  thoát trước bước đọc cổng như cũ — không gọi API, không đổi.
- Không xoá cookie chết trong proxy: app và API đọc phiên bằng cùng `@crm/auth`, cùng
  cấu hình, nên trang đăng nhập (`getSession()` thật) không thấy phiên sống mà API
  nói chết — không có vòng `/sign-in` ↔ `/`. Đăng nhập lại thì better-auth ghi đè cookie.

### A — trang `/` tự giữ điều kiện của mình

`IS_MARKETING` bật → landing như cũ. Tắt → trang không bao giờ vẽ landing mà chuyển
hướng, theo hàm `duongTrangGoc()` ở `lib/trang-goc.ts`:

- `getSession()` trả `null` → `/sign-in`.
- Còn phiên → hỏi lại `workspace.get` từ máy chủ trang (không giới hạn 2 giây như proxy),
  có slug → `/<slug>`. Đây là ca người còn phiên nhưng proxy không nhận được trả lời
  trong 2 giây (API khởi động nguội). Chủ kho chọn phương án (a) ngày 2026-09-28.
- API vẫn lỗi, hoặc trả không có slug → ném lỗi, Next vẽ trang lỗi. Không chuyển về
  `/sign-in` (trang đăng nhập thấy phiên sống sẽ đẩy ngược về `/`, thành vòng lặp) và
  không vẽ landing.

### `/het-quyen` tự kiểm phiên

`HetQuyenPage` gọi `getSession()`; `null` → `/sign-in`. Người còn phiên nhưng không
thuộc workspace vẫn thấy trang như hiện nay.

## Không gian đã quét (morphological-scan, preset test-matrix)

- Sản phẩm: OneHub Center (crm-onehub) — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: apps/app/proxy.ts, apps/app/lib/proxy-paths.ts] · chân ngành:
  [NGÀNH: Next.js — hướng dẫn Authentication, proxy kiểm lạc quan, trang/DAL kiểm thật]
  [NGÀNH: better-auth — `getSessionCookie` chỉ đọc cookie, không xác thực].
- Trục A — lớp đường dẫn theo nhánh của proxy: `/sign-in` | ẩn danh (`/t`, `/proto`,
  `/dat-mat-khau`, `/quen-mat-khau`) | `UNGATED` (`/grant-access`, `/eve`, `/het-quyen`) |
  `/` | có cổng (`/<slug>/…`, `/onboarding`, `/onboarding/research`, đường cũ thiếu slug)
  [thước CE: mọi nhánh `return` của `proxy()`].
- Trục B — phiên × tín hiệu API: không cookie | cookie chết + 401 | cookie chết + API
  lỗi | cookie sống + 200 | cookie sống + API lỗi (timeout/5xx/mạng)
  [thước CE: phép đo production 28/09 + nhánh của `read()`].
- Trục C — `IS_MARKETING`: tắt | bật [thước CE: `isPublic()` và `isMarketing()`].
- Core: có cổng × chết+401 × tắt; `/` × chết+401 × tắt (lỗi production); có cổng ×
  sống+API lỗi (giữ mở); `/` × chết+API lỗi × tắt; `/` × sống+API lỗi × tắt;
  `/het-quyen` × không phiên / sống-ngoài-workspace; `/sign-in` × chết+401 (không vòng);
  `/` × chết+401 × bật (landing công khai giữ nguyên); ẩn danh/UNGATED × chết (không đổi).
- Later: báo «phiên đã hết, đăng nhập lại» trên `/sign-in`; xoá cookie chết ở proxy;
  màn riêng cho API sập (phương án b).
- Never: tách 403 khỏi unknown (không phải phiên); dùng 401 của `settings.researchKey`
  (một nguồn quyết là đủ, `workspace.get` đã đọc trước); chặn `/dat-mat-khau`,
  `/quen-mat-khau` (ẩn danh theo thiết kế).

## Đặc tả UX

Bỏ — vòng này không dựng màn mới, chỉ đổi màn nào hiện cho người hết phiên (xem sổ
quyết định). Màn người hết phiên thấy là `/sign-in` hiện có, đã qua hồ sơ
`cua-vao-dang-nhap`.

## Đo

- Test proxy (`onboarding-gate.spec.ts`) theo cặp hai chiều trên cùng bộ trả lời giả:
  401 → `/sign-in`; timeout/5xx/mạng → giữ nguyên.
- Test trang `/` và `/het-quyen` trong tệp `.dom.tsx` riêng (mỗi tệp một tiến trình,
  `mock.module` không rò).
- Đo màn thật trên phiên đo của cây (`tien-de`): phiên thật tạo bằng `dev:session`
  (chỉ in một cookie `crm.session_token`, không có `crm.session_data` nên bộ đệm cookie
  5 phút không che) rồi xoá khỏi CSDL (phiên bị thu hồi). Trình duyệt mang đúng hai cookie:
  phiên đó và `lang=vi`. Tiền đề: API trả 401 cho đúng bộ cookie đó, không thì thoát mã 2.
  Mở `/`, `/<slug>/companies`, `/<slug>/agents`, `/onboarding`, `/het-quyen` → màn đăng
  nhập, có ảnh; đối chứng dương: phiên sống ở `/` không bị đẩy về `/sign-in`.
- `/<slug>/agents` là đường **chỉ proxy quyết**: trang agents, layout `(agent-builder)` và
  layout `[slug]` không tự kiểm phiên (tra 2026-09-28). Nó là thước đầu-cuối riêng của B:
  gỡ nhánh hết phiên trong proxy mà giữ A thì đường này trả 200 thay vì 307.
- Sau khi lên production: đo lại bằng đúng lệnh `curl` có cookie giả ở trên.
