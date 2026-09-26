---
schema_version: 1
feature: Đổi tên sản phẩm trên mọi chữ người đọc từ «CRM» sang «OneHub Center» (trùng tên miền onehub.center), và làm lại cột trái /sign-in theo hướng A — nền lưới chấm bằng token cho năm trang AuthShell, dòng neo cỡ lớn, ba bước nối bằng đường dọc, không Card
slug: doi-ten-onehub-center
owner: manh.phan@onemount.com
risk_tier: T3
surfaces: [ui, api]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-26T11:07:59Z
design_doc: docs/superpowers/specs/2026-09-26-doi-ten-onehub-center-design.md
---

# Acceptance Contract: doi-ten-onehub-center

## Context

Sản phẩm chạy ở `onehub.center` nhưng màn hình gọi nó là «CRM». Chủ kho chốt tên **OneHub
Center** ngày 26/09: luôn đủ hai chữ, không «Center» đứng một mình, không dịch, tiếng Anh không
kèm «the»; chỉ đổi chữ người đọc; gộp cả chỗ T3 (thư mật khẩu, tên không gian mặc định,
`workspace.service`). Cùng vòng, cột trái `/sign-in` làm lại theo hướng A mà chủ kho chọn sau khi
so ba ảnh mô phỏng: hôm nay ở khổ 1860px khối «Lần đầu vào?» là một `Card` 448px trong cột
~1340px. Thiết kế: `docs/superpowers/specs/2026-09-26-doi-ten-onehub-center-design.md`.

Hai nhóm tiêu chí tách bạch để bằng chứng đọc được: **Chữ** (AC-1 → AC-7) và **Cột trái** (AC-8 →
AC-12). AC-13 → AC-15 áp cả vòng.

Từ dùng trong hợp đồng này: «tập quét» là tập nguồn khai ở §3 của thiết kế; «ngoại lệ» là danh
sách tệp + chuỗi nguyên văn khai trước trong `rang/ngoai-le.json`; «khối hướng dẫn» là khối «Lần
đầu vào?»; «bốn trang kia» là `dat-mat-khau/[token]`, `grant-access`, `onboarding`,
`onboarding/research`; «hồ sơ đã ký» là hồ sơ `signed-off` hoặc `machine-cleared`.

## Criteria

**Nhóm Chữ**

- AC-1: Given tập quét khai theo chiều LOẠI TRỪ (toàn bộ `apps/app/{app,components,lib}`, `apps/api/src`, `packages/*/src`, `apps/agent/agent/lib/zalo-*.ts` và `apps/app/public/site.webmanifest`, trừ đúng các glob loại trừ ở mục Notes, mỗi glob một lý do) và bốn ngoại lệ liệt kê nguyên văn ở mục Notes, When chạy bộ quét trên cây sau vòng này, Then không còn chuỗi người đọc nào mang `CRM` như một từ đứng riêng ngoài bốn ngoại lệ; mỗi ngoại lệ vẫn còn đúng tệp (ngoại lệ mồ côi → đỏ); `rang/ngoai-le.json` bằng đúng bốn mục đó theo phép so tập (ngoại lệ lạ → đỏ); và trên `merge-base` cùng bộ quét đỏ, gọi tên đúng 35 tệp của `rang/tep-mang-ten-cu.txt`, không thiếu, không thừa.
- AC-2: Given tập quét, When bộ quét kiểm luật tên, Then mọi chữ `Center` trong chuỗi người đọc đứng ngay sau `OneHub `, không chuỗi nào chứa «Trung tâm» thay cho tên, và không chuỗi tiếng Anh nào chứa «the OneHub Center».
- AC-3: Given ngôn ngữ vi và en, When vẽ `/sign-in` và bốn trang kia, Then `h1` của `/sign-in` là «Đăng nhập vào OneHub Center» (en «Sign in to OneHub Center»); dòng giới thiệu là «OneHub Center: đối tác, kế hoạch 30 ngày và OKR.» (en «OneHub Center: partners, 30-day plans and OKRs.»); không trang nào còn nhãn nhỏ «CRM» phía trên tiêu đề; mô tả khối hướng dẫn là «OneHub Center chỉ mở cho địa chỉ quản trị viên đã cho phép.».
- AC-4: Given metadata gốc của ứng dụng và `site.webmanifest`, When đọc chúng, Then tên tab mặc định là «OneHub Center», khuôn tên tab là «%s · OneHub Center», và `name` của manifest là «OneHub Center».
- AC-5 (cross-layer): Given nhãn đầu trang, When tên không gian rỗng, chỉ có khoảng trắng, chưa tải, bằng tên mặc định mới, hoặc bằng tên mặc định cũ — giá trị `DEFAULT_WORKSPACE_NAME` đọc từ `merge-base`, không gõ tay — theo mọi kiểu hoa thường, Then nhãn là «OneHub Center»; When không gian có tên khác, Then nhãn là đúng tên đó đã cắt khoảng trắng, không hậu tố nào; và When `ensureWorkspaceMembership` chạy trên kho chưa có không gian nào, Then không gian được tạo mang tên «OneHub Center» (đọc lại từ cơ sở dữ liệu), còn kho đã có không gian thì tên và slug của nó không đổi.
- AC-6: Given thư đặt lại mật khẩu và thư báo mật khẩu vừa đổi, When dựng thư, Then tiêu đề lần lượt là «Đặt lại mật khẩu OneHub Center» và «Mật khẩu OneHub Center vừa được đổi»; `appName` của better-auth là «OneHub Center»; và câu «This CRM is private…» của hook `user.create.before` giữ nguyên từng byte, nên mọi ca lỗi của `/sign-in` vẫn được phân loại như trước.
- AC-7 (judgment): Given mọi chuỗi vi và en đổi ở vòng này và mục «OneHub Center» mới trong `CONTEXT.md`, When đọc đối chiếu `CONTEXT.md`, Then mỗi câu đọc tự nhiên sau khi thế tên (không «OneHub Center của bạn», không «dữ liệu OneHub Center của bạn» khi câu cũ nói «CRM của bạn» theo nghĩa kho dữ liệu), không dùng từ nằm trong `_Avoid_`, và mục từ điển có định nghĩa, `_Avoid_` và «Vì sao».

**Nhóm Cột trái**

- AC-8: Given `/sign-in` ở khổ 1440 và 1920, giao diện sáng và tối, Google bật, When trang tải xong, Then cột trái không chứa phần tử `data-slot="card"`; dòng giới thiệu là phần tử `p` có cỡ chữ tính ra ≥ 36px; mép trái khối hướng dẫn và mép trái dòng giới thiệu cách mép trái logo cột trái không quá 1px; khối hướng dẫn rộng không quá 576px; và trang chỉ có một `h1`.
- AC-9: Given `StepList` ở chế độ tĩnh với n bước (n = 1, 2, 3, 4), When vẽ, Then có đúng n−1 đường nối, mỗi đường `aria-hidden`, không đường nào sau bước cuối; Given chế độ tiến độ (không `tinh`), Then số đường nối và dấu tick của bước đã xong giữ nguyên như trên `merge-base`.
- AC-10: Given năm trang `AuthShell`, When vẽ, Then cột trái của cả năm trang có nền `LuoiCham` (`aria-hidden`, nhập từ `@crm/ui`), không trang nào còn nhập `auth-shader`, tệp `apps/app/components/auth-shader.tsx` không còn; và mã nguồn `LuoiCham` không chứa màu viết cứng (hex, `rgb(`, `hsl(`, `oklch(` với số) — màu chỉ đến từ biến token.
- AC-11: Given `/sign-in` ở giao diện sáng rồi tối, When đo màu nền trang và màu chấm của `LuoiCham`, Then nền trang sáng ở giao diện sáng, tối ở giao diện tối; chấm của `LuoiCham` và đường nối của `StepList` đều khác màu nền cột trái ở cả hai giao diện (đường nối của `reui/stepper` mặc định tô `bg-muted`, trùng nền cột — design-pass 26/09); chữ trong khối hướng dẫn và dòng giới thiệu đạt tương phản AA (4,5:1; chữ lớn 3:1) trên màu nền cột trái ở cả hai giao diện.
- AC-12: Given khổ 320, 768, 1024, 1440, 1920 × sáng, tối, Google bật, When mở `/sign-in`, Then ở 320 và 768 khối hướng dẫn nằm hoàn toàn dưới nút «Đăng nhập»; ở 1024, 1440, 1920 khối hướng dẫn nằm ở cột trái; ở mọi khổ `document` không tràn ngang; vòng Tab và việc khối hướng dẫn không nhận tiêu điểm giữ nguyên như hồ sơ `cua-vao-dang-nhap` (thước đã ký của hồ sơ đó chạy lại và đạt).

**Cả vòng**

- AC-13: Given các hồ sơ đã ký có eval máy (`test`/`script`) với `paths` giao `diff` của vòng này, When chạy eval đó trên HEAD và trên `merge-base`, Then mọi eval đạt ở `merge-base` vẫn đạt ở HEAD; và mọi tệp thước của hồ sơ đã ký mà vòng này sửa — tệp dưới `_acceptance/<hồ sơ đã ký>/` và tệp mà lệnh eval đã ký chạy — chỉ lệch `merge-base` bởi (i) các cặp trong `rang/bang-the.json`, mỗi cặp hoặc là phép thế tên (chuẩn hoá mọi dạng tên cũ và «OneHub Center» về cùng một dấu thì hai chuỗi bằng nhau từng byte), hoặc là cặp chuỗi sản phẩm thật (chuỗi cũ có nguyên văn trong mã ở `merge-base`, chuỗi mới có nguyên văn trong mã ở HEAD); hoặc (ii) đúng các vạch khai trong danh sách thay thế ở mục Notes, mỗi vạch có một dòng `supersedes` trong sổ quyết định và một eval của vòng này đo lời hứa mới, đỏ ở `merge-base`.
- AC-14: Given các tệp vòng này viết hoặc sửa, When soi mã và `diff` từ `merge-base`, Then không tệp `"use client"` nào nhập `@crm/auth` hay `@crm/db`; không `className` đổi màu, góc, viền, bóng của component `@crm/ui` ở chỗ gọi; `LuoiCham` nằm trong `packages/ui/src/components`; không chú thích mới trong mã; và `diff` không chạm danh sách cấm viết trước: `apps/app/proxy.ts`, `apps/app/app/(landing)/page.tsx`, `apps/app/components/landing/**`, các module có sẵn dưới `apps/app/app/proto/_modules/` (trừ module mới của vòng này), trường `name` của mọi `package.json`, và hai dòng «This CRM is private» của `packages/auth/src/auth.ts`. Các trang khác dưới `(landing)/` (năm trang `AuthShell`, `het-quyen`, `quen-mat-khau`) được phép sửa.
- AC-15 (ui-observed): Given `/sign-in` ở 375, 1440, 1920 × sáng, tối, When chụp màn thật của cây đang xét, Then người ký nhìn thấy nền lưới chấm, dòng neo cỡ lớn, ba bước nối bằng đường dọc không có hộp, và tên «OneHub Center» ở tiêu đề cột phải — sáu ảnh nằm trong `evidence/`.

## Coverage

Quét bằng morphological-scan (tự dựng trục; không preset nào khớp một vòng đổi tên + một trang
đăng nhập). Chân sản phẩm đào từ repo; chân ngành neo vào chuẩn có tên.

- Trục nguồn chữ: kho chuỗi `apps/app` | metadata và manifest | nhãn đầu trang | lời báo `apps/api` | thư và `appName` của `packages/auth` | `packages/validation`, `packages/db` | bot Zalo [thước CE: `grep -rn '\bCRM\b'` trên toàn kho ngày 26/09 — SUY-TỪ-REPO: bảng §3 của thiết kế]
- Trục kiểu chỗ: tên trong câu | tiêu đề/tên riêng | nhãn ghép tên không gian | chuỗi máy so khớp (không phải chữ người đọc) [thước CE: SUY-TỪ-REPO: `apps/app/lib/workspace-label.ts`, `packages/auth/src/auth.ts:315`; NGÀNH: Microsoft Writing Style Guide — dùng tên sản phẩm nhất quán, viết đủ tên]
- Trục trang × khổ × giao diện: 5 trang `AuthShell` × 320 | 768 | 1024 | 1440 | 1920 × sáng | tối [thước CE: `~/.claude/rules/web/testing.md`; lỗi gốc đo ở 1860px — ảnh chủ kho gửi 26/09; NGÀNH: WCAG 2.2 SC 1.4.10 Reflow]
- Trục chế độ `StepList`: tĩnh | tiến độ × số bước 1–4 [thước CE: SUY-TỪ-REPO: `packages/ui/src/components/step-list.tsx`, các nơi gọi `StepList`]
- Cắt ngang mọi ô Core: tương phản AA [NGÀNH: WCAG 2.2 SC 1.4.3] · nền trang trí `aria-hidden` [NGÀNH: WCAG 2.2 SC 1.1.1] · máy chủ tính, client vẽ (`AGENTS.md`) · không đổi thước của hồ sơ khác ngoài phép thế tên.

Core (vào AC): quét chữ (AC-1, 2) · tiêu đề (AC-3, 4) · nhãn đầu trang (AC-5) · thư và chuỗi phân loại lỗi (AC-6) · chất chữ (AC-7) · bố cục cột trái (AC-8) · đường nối (AC-9) · nền (AC-10, 11) · khổ, Tab (AC-12) · không hồi quy (AC-13) · ranh giới (AC-14) · mắt người (AC-15).

Later: lời báo tiếng Anh của `apps/agent/agent/lib/{builder-runtime,run-runtime}.ts` (lẫn chỗ model đọc và người đọc) · biểu tượng trình duyệt và ảnh chia sẻ mang chữ.
Never: đổi tên gói `@crm/*`, CSDL `crm_*`, công cụ `search_crm` — phí bản rẽ khỏi hãng, người dùng không đọc.

Để chủ kho gạch tại Cổng Phạm vi:
- [GIẢ ĐỊNH] Nhãn đầu trang bỏ hậu tố: không gian «Acme» hiện «Acme», không phải «Acme Center» (ghép «Center» phạm luật tên) — AC-5.
- [GIẢ ĐỊNH] Không gian đang mang tên «CRM» được coi như chưa đặt tên và hiện «OneHub Center» ở đầu trang; không sửa dữ liệu, nên ô tên ở Cài đặt vẫn hiện «CRM» cho tới khi quản trị viên đổi — AC-5.
- [GIẢ ĐỊNH] Kho mới tinh (máy mới, CSDL đo `crm_<cây>_do`) tạo không gian tên «OneHub Center» với slug `onehub-center` thay vì `crm`; không gian đã có giữ slug vì `ensureWorkspaceMembership` upsert theo `WORKSPACE_ID` với `update: {}` — AC-5, AC-13 bắt nếu một thước màn đã ký viết cứng `/crm/`.
- [GIẢ ĐỊNH] Tên người gửi thư (`MAIL_FROM`, mẫu «CRM OneHub <no-reply@onehub.center>» ở `.env.example`) là cấu hình theo máy: vòng này chỉ đổi dòng mẫu trong `.env.example`; `.env` thật ở máy chủ do người đổi. `.env.example` không nằm trong tập quét vì phần còn lại là chú thích cho người cài.
- [GIẢ ĐỊNH] Bốn trang kia đổi nền sang `LuoiCham` và bỏ nhãn «CRM»; bố cục khác của chúng giữ nguyên.
- [NGÀNH: Microsoft Writing Style Guide] Tên sản phẩm viết đủ, nhất quán ở mọi chỗ — cơ sở của AC-2.

## Đường đo

Ngưỡng ở `opportunity.md` (Cổng Đáng ghi bù 26/09, chủ kho quyết `build` sau S4 round 1):
- 0 chữ «CRM» người dùng báo thấy trong 14 ngày · nguồn: lời báo của người dùng, đếm tay · AC bảo đảm vật được đo: AC-1, AC-2 (bộ quét không còn chuỗi nào ngoài bốn ngoại lệ), AC-4, AC-6.
- Tỉ lệ người mới hỏi cách vào không tệ hơn ≤ 10% của `cua-vao-dang-nhap` · nguồn: cùng thước tin nhắn hỏi quản trị viên của hồ sơ đó (không mã mới) · AC bảo đảm: AC-8, AC-12.
- Hai tên cho một sản phẩm báo từ 3 lần trở lên là CHẾT · nguồn: lời báo người dùng · AC bảo đảm: AC-5 (đầu trang hiện «OneHub Center» cho không gian còn tên «CRM»).

## Out of scope

- Đổi tên gói, CSDL, công cụ, chỉ dẫn và mô tả công cụ viết cho model ở `apps/agent`.
- Lời báo của `builder-runtime.ts` và `run-runtime.ts` — tách thành việc riêng.
- Tiêu đề tài liệu API («CRM API») — người đọc là lập trình viên.
- Câu «This CRM is private…» của `packages/auth/src/auth.ts` — chuỗi máy so khớp.
- Sửa dữ liệu không gian đã có (không migration).
- Ảnh sản phẩm, lời khen, logo khách ở cột trái — hướng B, C đã bác 26/09.
- Trang giới thiệu của hãng (`(landing)/**`, `components/landing/**`) và module `/proto` cũ.

## Notes

- Bàn đo màn thật (AC-8, 11, 12, 15) chạy trong phiên đo của `tien-de.mjs` trên kho `crm_<cây>_do`, qua `mot-luot.sh`, không dùng CSDL dev chung, không dùng cổng 3000/3300/3500. Khoá Google giả `ci-only-google-client-id` đặt khi `.env` để rỗng, như hồ sơ `cua-vao-dang-nhap`.
- AC-13 dùng quan hệ «đạt ở `merge-base` thì đạt ở HEAD», không «làn thoát 0»: ~46 eval đo màn của các hồ sơ đã ký đỏ sẵn trên máy này vì môi trường (đo 25/09).
- Ba thước đã ký biết trước sẽ phải sửa bằng phép thế tên: `cai-dat-con-lai-noi-tieng-viet/rang/khong-dich-cua-lat.json`, `dat-okr-trong-crm/rang/man-okr.mjs`, `man-xin-quyen-co-rang/rang/chieu-do.mjs`. Test của kho (`apps/*/test`, `packages/*/test`) ghim chữ cũ đổi theo, được suite chạy mỗi round.

- **Glob loại trừ khỏi tập quét (AC-1):** `apps/app/app/(landing)/page.tsx` và `apps/app/components/landing/**` — trang giới thiệu của hãng; `apps/app/app/proto/**` — bản mẫu đã chốt của các vòng cũ; `apps/api/src/create-app.ts` — tiêu đề tài liệu API cho lập trình viên; tệp `*.spec.*`, `*.test.*`, `*.dom.tsx`, thư mục `test/` — thước, không phải chữ người đọc; `apps/agent/**` ngoài `zalo-*.ts` — chỉ dẫn và lời báo cho model (Later).
- **Bốn ngoại lệ (AC-1), nguyên văn:** `packages/auth/src/auth.ts` · ``This CRM is private. Sign in with your @${domain} account.`` · `packages/auth/src/auth.ts` · `This CRM is private. That address is not on the allow-list.` (chuỗi máy so khớp của `/sign-in`) · `packages/db/src/settings.ts` · `CRM` (mã giảm giá Context cho bản dev, không phải tên) · `packages/db/src/safe-fetch.ts` · `Mozilla/5.0 (compatible; CRM/1.0)` (user-agent gửi máy chủ ngoài).
- **Danh sách thay thế (AC-13 (ii)), rút bằng máy ngày 26/09 từ lệnh của mọi eval máy đã ký:** `cua-vao-dang-nhap` E2 — ba vạch «có con của AuthShader», «có chữ CRM», «cột trái bg-muted phẳng khi có khối» của `apps/app/test/cua-vao-shell.dom.tsx`, thay bằng E3, E10 của vòng này; `cua-vao-dang-nhap` E11, E12, E13, E19 — vạch `khong-shader` của `_acceptance/cua-vao-dang-nhap/rang/do-cua-vao.mjs` (nó coi mọi nền `radial-gradient` là AuthShader, nên `LuoiCham` làm nó đỏ), thay bằng E10, E11; `cua-vao-dang-nhap` E14 (judgment) — vế «nền xám phẳng», thay bằng E15. Các eval đã ký khác mà máy tìm thấy trong tệp mang chữ «CRM» (`messages-guard.spec.ts`, `cua-vao-sign-in.dom.tsx`, `chu-la.mjs`, `man-okr.mjs`, `logo-icons.spec.ts`, `agent-transcript.spec.ts`, `quen-mat-khau-cau-hinh.spec.ts`, hai tệp tích hợp Zalo) chỉ được sửa theo (i).
- Lint W6 báo 5 chữ theo nghĩa khác với mục `_Avoid_` của `CONTEXT.md`: «nhóm» là nhóm tiêu chí Chữ / Cột trái (không phải bộ phận); «khối» là khối giao diện «Lần đầu vào?» (không phải bộ phận); «quản trị» nằm trong «quản trị viên» — vai quản trị của không gian làm việc (không phải trưởng đơn vị); «điểm» là điểm neo thị giác (không phải mức tự tin); «module» là module bản mẫu dưới `/proto` (không phải phạm vi dữ liệu).
