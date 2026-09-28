---
schema_version: 1
feature: Phiên chết về trang đăng nhập — người mang cookie phiên đã hết không còn thấy landing của hãng ở / hay trang «không còn trong không gian làm việc»; proxy tách 401 của workspace.get khỏi «không biết», trang / và /het-quyen tự kiểm phiên
slug: phien-chet-ve-dang-nhap
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T02:02:27Z
design_doc: docs/superpowers/specs/2026-09-28-phien-chet-ve-dang-nhap-design.md
---

# Acceptance Contract: phien-chet-ve-dang-nhap

## Context

Đo ngày 2026-09-28 trên production `www.onehub.center`: người mang cookie
`crm.session_token` mà phiên phía máy chủ đã hết mở `/` thì thấy landing của hãng
(«The CRM for agents», logo Comp AI); mở `/het-quyen` thì được bảo «Tài khoản này
không còn trong không gian làm việc». Người dùng OneHub Center đọc đó là sản phẩm
khác hoặc là mình bị gỡ quyền. Vòng này đưa mọi người hết phiên về `/sign-in`, không
đổi gì cho người còn phiên.

Source input: prompt (phiên 2026-09-28, chủ kho chọn A kèm B và phương án (a)).

## Criteria

- AC-1: Given `IS_MARKETING` tắt và request mang cookie phiên mà `workspace.get` trả HTTP 401, When proxy xử lý `/`, `/<slug>/companies`, `/companies`, `/onboarding` hoặc `/onboarding/research`, Then phản hồi là chuyển hướng tới `/sign-in`.
- AC-2: Given request mang cookie phiên tới một đường có cổng, When `workspace.get` hết giờ, lỗi mạng, trả 5xx hoặc 403, Then proxy KHÔNG chuyển tới `/sign-in` và giữ đúng hành vi trước vòng này.
- AC-3: Given cookie phiên chết (API trả 401), When proxy xử lý `/sign-in`, một đường ẩn danh (`/t/…`, `/proto/…`, `/dat-mat-khau/…`, `/quen-mat-khau`) hoặc một đường `UNGATED` (`/grant-access`, `/eve/…`, `/het-quyen`), Then proxy không gọi API và không chuyển hướng; và Given `IS_MARKETING=true`, When proxy xử lý `/` với cookie chết, Then không chuyển hướng (landing công khai giữ nguyên).
- AC-4: Given phản hồi của `workspace.get`, When `readWorkspaceGate` đọc nó, Then `hetPhien` là `true` khi và chỉ khi status là 401; 200, 403, 5xx, timeout, lỗi mạng và request không cookie đều cho `false`, còn `gate`/`slug`/`inWorkspace`/`viewerRole` giữ đúng giá trị như trước vòng này.
- AC-5: Given `IS_MARKETING` tắt và `getSession()` trả `null`, When trang `/` được vẽ, Then trang chuyển hướng tới `/sign-in` và không vẽ landing.
- AC-6: Given `IS_MARKETING` tắt và `getSession()` trả một phiên, When trang `/` được vẽ, Then trang hỏi `workspace.get` từ máy chủ và chuyển tới `/<slug>`; khi lời hỏi đó lỗi hoặc không có slug, trang ném lỗi — không chuyển tới `/sign-in`, không vẽ landing.
- AC-7: Given `IS_MARKETING=true`, When trang `/` được vẽ, Then landing hiện như trước và trang không đọc phiên.
- AC-8: Given `getSession()` trả `null`, When trang `/het-quyen` được vẽ, Then trang chuyển tới `/sign-in`; Given một phiên, Then trang hiện tiêu đề «không còn trong không gian làm việc» và nút đăng xuất như trước.
- AC-9: Given app và API của cây chạy trên phiên đo riêng, và một phiên thật đã bị xoá khỏi CSDL (cookie còn trong trình duyệt), When trình duyệt mở `/`, `/<slug>/companies`, `/<slug>/agents`, `/onboarding` và `/het-quyen`, Then mỗi lần đều dừng ở màn đăng nhập OneHub Center, không có chữ của landing; và Given phiên còn sống, When mở `/`, Then không dừng ở `/sign-in` và không có chữ của landing. (cross-layer)
- AC-10: Given toàn bộ bài kiểm của cổng proxy trước vòng này, When chạy lại sau vòng này, Then tất cả vẫn xanh (không hồi quy người không cookie, người còn phiên, cổng onboarding, cổng khoá nghiên cứu, slug).

## Coverage

- Trục A — lớp đường dẫn theo nhánh proxy: `/sign-in` | ẩn danh | `UNGATED` | `/` | có cổng [thước CE: mọi nhánh `return` của `proxy()` trong apps/app/proxy.ts; NGÀNH: hướng dẫn Authentication của Next.js — proxy kiểm lạc quan, trang kiểm thật]
- Trục B — phiên × tín hiệu API: không cookie | chết+401 | chết+API lỗi | sống+200 | sống+API lỗi [thước CE: phép đo production 2026-09-28 + nhánh của `read()` trong apps/app/lib/onboarding.ts; NGÀNH: better-auth `getSessionCookie` không xác thực]
- Trục C — `IS_MARKETING`: tắt | bật [thước CE: `isPublic()` / `isMarketing()`]
- Core → AC: có cổng×chết+401×tắt → AC-1 · `/`×chết+401×tắt → AC-1, AC-9 · có cổng×API lỗi → AC-2 · `/sign-in`, ẩn danh, UNGATED × chết → AC-3 · `/`×chết+401×bật → AC-3 · tín hiệu 401 → AC-4 · `/`×chết+API lỗi×tắt → AC-5 · `/`×sống+API lỗi×tắt → AC-6 · `/`×bật → AC-7 · `/het-quyen` → AC-8, AC-9 · hồi quy → AC-10
- Later/Never: xem Out of scope. Giới hạn đo đã biết: ô `/`×sống+API lỗi chỉ đo ở lớp test (AC-6), không có đo màn — dựng API chậm trên phiên đo là việc riêng.

## Out of scope

- Không báo «phiên đã hết, đăng nhập lại» trên `/sign-in` — màn đăng nhập giữ nguyên chữ.
- Không xoá cookie chết trong proxy; đăng nhập lại để better-auth ghi đè.
- Không dựng màn riêng cho lúc API sập (phương án b) — lỗi thì Next vẽ trang lỗi mặc định.
- Không đổi landing của hãng, không xoá `components/landing/` hay cờ `IS_MARKETING` (giữ phí bản rẽ thấp).
- Không tách 403 hay 401 của `settings.researchKey`; chỉ 401 của `workspace.get` quyết.
- Không soạn bản vá gửi lên `trycompai/crm`.

## Notes

- Đo lại sau khi lên production: `curl -s -o /dev/null -w "%{http_code} -> %{redirect_url}\n" -H "Cookie: __Secure-crm.session_token=het-han.abc" https://www.onehub.center/` kỳ vọng `307 -> https://www.onehub.center/sign-in`.
- `cookieCache` 5 phút của better-auth: một phiên vừa bị thu hồi vẫn được app và API coi là sống tới 5 phút — hai bên đồng ý nên không lặp; người thấy workspace tới hết 5 phút như trước vòng này.
