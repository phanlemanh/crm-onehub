---
schema_version: 1
feature: Cửa vào đăng nhập cho người mới — trang /sign-in nói cách vào ở khối «Lần đầu vào?» (bước tính theo nút đang bật), báo lỗi khi better-auth trả về vì địa chỉ chưa được cho phép, theo giao diện máy thay vì ép tối; bốn trang AuthShell khác giữ bố cục
slug: cua-vao-dang-nhap
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-09-26T07:16:17Z
design_doc: docs/superpowers/specs/2026-09-25-cua-vao-dang-nhap-design.md
---

# Acceptance Contract: cua-vao-dang-nhap

## Context

Cửa vào thật của CRM là `/sign-in` (`/` đẩy người chưa đăng nhập về đó vì `IS_MARKETING` tắt).
Từ 26/10 người mới vào hàng loạt (OKR mở cho mọi phòng ban). Trang hôm nay không nói cách vào,
ẩn cột giới thiệu ở màn hẹp, ép `dark`, và bỏ im lỗi: better-auth trả người bị từ chối về
`/sign-in?error=<câu tiếng Anh của hook, khoảng trắng thành _>` mà trang không đọc `error`.

Hướng A (chủ kho duyệt 25/09): `AuthShell` nhận một chỗ trống cột trái, chỉ `sign-in` đặt khối
«Lần đầu vào?» vào đó; ô báo lỗi đọc `error`; bỏ ép `dark`. Thiết kế:
`docs/superpowers/specs/2026-09-25-cua-vao-dang-nhap-design.md`.

Từ dùng trong hợp đồng này: «khối hướng dẫn» là khối «Lần đầu vào?»; «ô lỗi» là phần tử
`role="alert"` của trang; «nút ngoài» là nút Google, Microsoft hay SSO; «bốn trang kia» là
`dat-mat-khau/[token]`, `grant-access`, `onboarding`, `onboarding/research`. Tiêu chí màn hình đo
trên cây đang xét, không đăng nhập, tiếng Việt, API của cùng cây trả `signInOptions`.

## Criteria

- AC-1: Given năm trang dùng `AuthShell`, When mỗi trang được vẽ, Then chỉ `sign-in` có khối hướng dẫn; bốn trang kia gọi `AuthShell` mà không truyền khối cột trái.
- AC-2: Given `AuthShell` không nhận khối cột trái, When nó được vẽ, Then cột trái vẫn có hiệu ứng nền, chữ «CRM» và một dòng tiêu đề, vẫn ẩn dưới khổ `lg` như hôm nay; dòng tiêu đề tiếng Việt là «CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.» (không còn «Mọi khách hàng, một chỗ.»); và không phần tử nào của khung mang lớp `dark`.
- AC-3: Given `signInOptions` trả Google bật, Microsoft tắt, không SSO, When mở `/sign-in`, Then khối hướng dẫn có tiêu đề «Lần đầu vào?» và đúng ba bước theo thứ tự — nhờ quản trị viên cho phép địa chỉ (có chỉ đường Cài đặt › Thành viên › Cho phép một địa chỉ, chữ nút lấy từ `settings-thanh-vien.ts`) · đăng nhập bằng Google đúng địa chỉ đó · xin liên kết đặt mật khẩu với số phút hết hạn tính từ `PASSWORD.tokenTtlSeconds` — và một dòng «CRM của OneHub: đối tác, kế hoạch 30 ngày và OKR.»
- AC-4: Given mỗi tổ hợp cửa trong ma trận viết trước — chỉ mật khẩu · Microsoft bật · có SSO · `?method=google` · `signInOptions` lỗi — When mở `/sign-in`, Then tập tên nhà cung cấp mà bước 2 gọi bằng đúng tập tên trên các nút ngoài đang hiện; không có nút ngoài thì không có bước 2 và bước mật khẩu là đường chính («Xin liên kết đặt mật khẩu.»); `signInOptions` lỗi thì nút và bước giống hệt ca Google bật.
- AC-5: Given `error` là chuỗi mà better-auth đang cài sinh ra từ mỗi câu mở đầu «This CRM is private.» trong hook `user.create.before` của `packages/auth/src/auth.ts` (rút từ nguồn, qua phép đổi khoảng trắng của callback và `URLSearchParams`), When mở `/sign-in?error=<chuỗi đó>`, Then ô lỗi có biểu tượng cảnh báo, tiêu đề «Địa chỉ này chưa được cho phép vào» và mô tả «Nhờ quản trị viên cho phép đúng địa chỉ email bạn vừa dùng.»
- AC-6: Given `error=access_denied` (mã nhà cung cấp trả khi người bấm huỷ, RFC 6749 §4.1.2.1), When mở `/sign-in`, Then ô lỗi có tiêu đề «Bạn đã dừng đăng nhập giữa chừng» và mô tả «Bấm lại nút đăng nhập để thử lần nữa.»
- AC-7: Given `error` là bất kỳ giá trị nào khác trong ma trận viết trước — câu «No one can sign in yet…» của hook đã biến đổi, `invalid_code`, `state_mismatch`, chuỗi chứa `<script>` và `<img onerror>`, chuỗi 2000 ký tự — When mở `/sign-in`, Then ô lỗi có tiêu đề chung «Chưa đăng nhập được» và mô tả «Thử lại; nếu vẫn không được, nhờ quản trị viên xem giúp.»; phần HTML ngoài các thẻ `<script>` (chữ hiện ra và thuộc tính) không chứa giá trị đó ở dạng thô, dạng thoát HTML hay dạng mã hoá URL; payload RSC của Next trong `<script>` được phép mang giá trị nhưng không mang thẻ `<script`/`<img` thô; `error` vắng hoặc rỗng thì không có ô lỗi; `error` lặp thì xét giá trị đầu.
- AC-8: Given `/sign-in` có `error`, When trang tải xong, Then ô lỗi là phần tử `role="alert"` duy nhất của trang, đứng trước nút đăng nhập đầu tiên trong thứ tự tài liệu, có tiêu đề và mô tả của loại lỗi (AC-5/6/7) trong cây truy cập, và không lấy tiêu điểm.
- AC-9: Given ngôn ngữ vi và en, When mở `/sign-in`, Then tiêu đề cột phải là «Đăng nhập vào CRM» (en: «Sign in to the CRM») với một câu mô tả; không còn «Mừng bạn quay lại» / «Welcome back»; mọi chuỗi mới có bản vi và en, và `messages-guard` ghim chúng.
- AC-10: Given máy người xem đặt giao diện sáng rồi tối, When mở `/sign-in`, Then nền và chữ của trang đổi theo (nền trang sáng ở giao diện sáng, tối ở giao diện tối); cột trái của `sign-in` là nền `muted` phẳng, không có hiệu ứng nền `AuthShader`.
- AC-11: Given khổ 320, 768, 1024, 1440 px × giao diện sáng, tối, When mở `/sign-in` (Google bật), Then ở 320 và 768 khối hướng dẫn nằm hoàn toàn dưới nút «Đăng nhập» của ô mật khẩu; ở 1024 và 1440 khối hướng dẫn nằm ở cột bên trái khung đăng nhập; ở mọi khổ `document` không tràn ngang.
- AC-12: Given `/sign-in` có ô lỗi, Google bật, ở khổ 1440 và 320, When người dùng nhấn Tab liên tiếp từ đầu trang, Then tiêu điểm đi giống nhau ở hai khổ: liên kết logo của tiêu đề cột phải («Trang chủ») → nút Google → ô email → ô mật khẩu → («Quên mật khẩu?» khi `signInOptions` trả `quenMatKhau: true` — cờ của PR #104; liên kết trỏ `/quen-mat-khau`) → nút «Đăng nhập»; không phần tử nào trong khối hướng dẫn nhận tiêu điểm, và logo của khối hướng dẫn (chỉ hiện từ `lg`) không phải liên kết; chữ trong khối hướng dẫn và ô lỗi đạt tương phản AA (4,5:1; chữ lớn 3:1) ở cả hai giao diện.
- AC-13: Given ba hồ sơ đã ký có eval trỏ vào vùng vòng này sửa — `logo-onehub` (E11), `man-xin-quyen-co-rang` (E1, E2, E4–E10), `vao-bang-email-va-mat-khau` (E13, E15) — When chạy lại các eval máy (`test`/`script`) của chúng trên cây sau vòng này và trên `merge-base` với `onehub`, Then mọi eval đạt ở `merge-base` vẫn đạt; eval nào đổi kết quả thì dòng ra gọi tên hồ sơ, eval và mã thoát hai phía.
- AC-14: Given các tệp vòng này viết hoặc sửa, When soi mã và `diff` từ `merge-base` với `onehub`, Then không tệp `"use client"` nào nhập `@crm/auth` hay `@crm/db`; khối hướng dẫn dựng từ `StepList` ở chế độ tĩnh (hướng «Đều nhau» chủ kho chọn ở Cổng Phạm vi: không bước nào mang `aria-current`, không bước nào mờ, mọi chỉ báo cùng một trạng thái, vẫn là danh sách có tên; chế độ tiến độ của các nơi dùng cũ giữ nguyên) và ô lỗi từ `Alert` của `@crm/ui`, không `className` đổi màu, góc, viền, bóng trên component `@crm/ui` ở chỗ gọi; mã mới nằm ở tệp riêng của OneHub; và `diff` không chạm `components/landing/**`, `apps/app/proxy.ts`, `packages/auth/**`.
- AC-15 (judgment): Given mọi chuỗi tiếng Việt mới hoặc đổi của vòng này, When đọc đối chiếu `CONTEXT.md`, Then không chuỗi nào dùng từ nằm trong `_Avoid_` theo đúng nghĩa của mục đó, nhãn theo luật «ngắn theo ngữ cảnh», và mọi câu người đọc phân vân đã có dòng trả lời của người thật trong sổ quyết định.

## Coverage

Quét bằng morphological-scan (tự dựng trục, không preset nào khớp một trang đăng nhập). Chân
sản phẩm đào từ repo; chân ngành neo vào hai chuẩn có tên.

- Trục trang của `AuthShell`: sign-in | dat-mat-khau/[token] | grant-access | onboarding | onboarding/research [thước CE: mọi chỗ gọi `AuthShell` — SUY-TỪ-REPO: apps/app/components/auth-shell.tsx và năm `page.tsx` dưới `apps/app/app/(landing)/`]
- Trục cửa đang bật: Google (mặc định) | Microsoft | SSO | chỉ mật khẩu | `?method=` ép | `signInOptions` lỗi [thước CE: nhánh chọn nút — SUY-TỪ-REPO: apps/app/app/(landing)/sign-in/page.tsx]
- Trục `error`: vắng | rỗng | tiền tố `This_CRM_is_private.` (có miền / không miền) | `No_one_can_sign_in_yet…` | `access_denied` | mã OAuth khác | chuỗi độc hại hoặc quá dài | lặp [thước CE: SUY-TỪ-REPO: better-auth `dist/api/routes/callback.mjs`, `dist/oauth2/link-account.mjs`, `packages/auth/src/auth.ts`; NGÀNH: RFC 6749 §4.1.2.1]
- Trục khổ × giao diện: 320 | 768 | 1024 | 1440 × sáng | tối [thước CE: `~/.claude/rules/web/testing.md` — khổ bắt buộc; NGÀNH: WCAG 2.2 SC 1.4.10 Reflow (320 CSS px)]
- Cắt ngang mọi ô Core: không in giá trị URL · ô lỗi là thông báo trạng thái [NGÀNH: WCAG 2.2 SC 4.1.3, 3.3.1] · tương phản AA [NGÀNH: WCAG 2.2 SC 1.4.3] · máy chủ tính, client vẽ (`AGENTS.md`) · phí bản rẽ nhỏ (`CLAUDE.md`).

Core (vào AC): sign-in × Google (AC-3) · ma trận cửa (AC-4) · bốn trang không khối (AC-1, AC-2) · ba loại `error` + vắng/rỗng/lặp (AC-5, 6, 7, 8) · khổ × giao diện (AC-10, 11) · Tab, tương phản và #104 trong bố cục mới (AC-12) · chữ (AC-9, 15) · không hồi quy hồ sơ đã ký (AC-13) · ranh giới mã (AC-14).

Phủ tệp (bổ sung 26/09 sau S4 round 1, chủ kho quyết): `packages/ui/src/components/step-list.tsx` đo bằng E21 (`packages/ui/test/step-list-tinh.dom.tsx`); `apps/app/test/cua-vao-ham.spec.ts` là tệp test của các hàm thuần, được phủ bởi suite `bun run test` chạy mỗi round.

Để chủ kho gạch tại Cổng Phạm vi:
- [GIẢ ĐỊNH] Viết «địa chỉ email» thay «email công ty» đã duyệt ở Q1 — hồ sơ `vao-bang-email-va-mat-khau` ghi nhân viên kinh doanh dùng Gmail cá nhân (giả định 2 của `opportunity.md`). Mô tả dưới tiêu đề: «Dùng đúng địa chỉ email đã được cho phép.»
- [GIẢ ĐỊNH] Ngoài «chưa được cho phép», chỉ `access_denied` đáng một câu riêng; `invalid_code`, `state_mismatch`, `please_restart_the_process`… đi câu chung.
- [GIẢ ĐỊNH] Người đã bị gỡ khỏi không gian làm việc không đi qua `?error=` (tài khoản còn, hook `user.create.before` không chạy) — trang `het-quyen` lo ca đó.
- [NGÀNH: WCAG 2.2 SC 4.1.3] Ô lỗi đọc lên bằng `role="alert"`, không kéo tiêu điểm.

## Đường đo

Ngưỡng ở `opportunity.md` (chờ ký Cổng Đáng):
- Tỉ lệ người mới phải nhắn quản trị viên hỏi cách vào · mẫu số: số người có phiên đăng nhập đầu tiên (`Session.createdAt` nhỏ nhất theo người) từ 26/10 đến 08/11, đọc thẳng cơ sở dữ liệu (không mã mới) — không dùng `User.createdAt`, vì người được tạo sẵn tài khoản trước 26/10 để đặt mật khẩu sẽ rơi khỏi mẫu số · tử số: quản trị viên đếm tay tin nhắn Zalo/Slack · AC bảo đảm vật được đo: AC-3, AC-4 (khối hướng dẫn nói đúng đường vào theo nút đang bật).
- Số người bị từ chối mà không thấy câu báo — mục tiêu 0 · nguồn: dòng `This_CRM_is_private.` trong nhật ký máy chủ api (better-auth `logger.error` ở callback) đối chiếu lời báo của người dùng · AC bảo đảm: AC-5, AC-7, AC-8.

## Out of scope

- Landing dài ở `/` và `components/landing/*` của hãng — hướng B đã bác ở brainstorm 2026-09-25.
- Sửa `proxy.ts` hay đường dẫn — giữ nguyên theo quyết định đã chốt.
- Đổi câu tiếng Anh của hook thành mã máy gọn — việc T3 ở `packages/auth`; vòng này đọc câu thật đang có.
- Trang «Quên mật khẩu» và luồng gửi thư — thuộc PR #104; vòng này chỉ giữ liên kết của nó hiện đúng (AC-12).
- Bật Microsoft — chưa có khoá; AC-4 đo nhánh Microsoft bằng dữ liệu `signInOptions` giả.
- Chuỗi đầu-cuối Google → callback → `/sign-in?error=` với một nhà cung cấp OAuth giả — mối nối được khoá bằng hai mỏ neo nguồn ở AC-5.
- Đổi bố cục bốn trang kia hay bỏ `AuthShader` ở đó — chỉ đổi chuỗi dòng tiêu đề (Q4) và bỏ ép `dark` (Q3).

## Notes

- S3 chờ PR #104 merge vào `onehub` (sửa đúng `sign-in/page.tsx` và `password-sign-in.tsx`, thêm cờ `quenMatKhau`). Việc logo (#141) đã merge. Mốc lên môi trường thật trước 19/10.
- Mã lỗi đo ngày 2026-09-25 (spec §2): `This_CRM_is_private._Sign_in_with_your_@onemount.com_account.`, `This_CRM_is_private._That_address_is_not_on_the_allow-list.`, `No_one_can_sign_in_yet:_set_ALLOWED_SIGN_IN_…_and_restart.` — phụ thuộc câu chữ ở `packages/auth`; AC-5 khoá mối nối.
- Bàn đo màn thật chạy trên cổng riêng của cây đang xét (mặc định 3840/3841), qua `mot-luot.sh` và cảnh cây; không dùng 3000, 3300, 3500, 3620, và bản `next dev` của phiên khác ở 3810.
- Phản biện context sạch 25/09 (`gap-probe.md`): 4 P1 + 1 P2, đã sửa trong artifact. Hoãn một phần của P1 thứ tư: nhánh chỉ-mật-khẩu, SSO và Microsoft chỉ đo bằng test DOM với fixture mang kiểu thật của router — trên màn thật chỉ đo cấu hình mà API của cây trả về.
- Test DOM của vòng này tách ba tệp, mỗi tệp một lệnh, vì `mock.module` của bun sống cả tiến trình; S3 chạy gói `apps/app` hai thứ tự `--randomize --seed` và so tập đỏ trước khi tin màu xanh.
- design-pass 25/09 (`design-pass.md`): bản mẫu `/proto/cua-vao-dang-nhap`, 36 ảnh; một vá Nhóm 1 (ô lỗi có tiêu đề + biểu tượng), năm mục Nhóm 2 chờ Cổng Phạm vi — trong đó hướng của khối «Lần đầu vào?» («Đều nhau» hay «Tiến độ»).
- Lint W6 của kit báo 8 chữ theo nghĩa khác với mục `_Avoid_` của `CONTEXT.md`: «ẩn» là ẩn phần tử bằng CSS (không phải lưu trữ); «khách» nằm trong chuỗi cũ «Mọi khách hàng, một chỗ.» mà vòng này bỏ; «quản trị» là vai quản trị của không gian làm việc (không phải trưởng đơn vị); «thuộc tính» là thuộc tính HTML (không phải trường); «điểm» là điểm Tab; «người xem» là người đang nhìn màn hình (không phải vai).
- Tiền đề của bàn đo màn thật (`cvdn_do_cua_vao`, E11–E14, E19): lệnh đặt `GOOGLE_CLIENT_ID=ci-only-google-client-id` và `GOOGLE_CLIENT_SECRET=ci-only-google-client-secret` khi hai biến này rỗng, đúng giá trị CI dùng (`.github/workflows/ci.yml`). `.env` của máy dev để rỗng hai khoá này nên trang thật không có nút Google; khoá giả chỉ làm API báo `google=true` để điều kiện «Google bật» của AC-3/AC-11/AC-12 đúng — không ai bấm được nút đó tới Google. Thước gọi tên khi tiền đề sai («tien de AC-12 khong dung — API tra google=false»). Bàn đo chạy trong phiên đo #150 trên `crm_<cây>_do`, không trên CSDL dev chung.
- Chiều đỏ và phá-thử của S3 (26/09): test DOM mới chạy trên mã cũ — `cua-vao-sign-in` 20/24 đỏ, `cua-vao-trang-khac` 1/5 đỏ, `cua-vao-shell` 6/7 đỏ, mỗi ca đỏ với thông điệp ghim; phá-thử trên cây đã commit — bỏ `method` khi tính bước, in `error` ra trang, `onboarding` nhận khối, ô lỗi sau ô mật khẩu, trang thôi truyền `quenMatKhau` — mỗi nhát đỏ đúng ca mang tên. `ma-loi-that`: câu hook đổi → 4 SAI; dist SSO đổi → «SAI moc sso». `soi-ma`: client nhập `@crm/auth` → SAI (a), `<Card className="rounded-2xl bg-muted">` → SAI (c). Bàn đo: khoá Google rỗng → 4 dòng «tien de AC-12 khong dung»; bỏ khổ 768 → 6 dòng «thieu»; ép `dark` lên `<main>` → «light: 1 phan tu mang lop dark». `thuoc-da-ky`: gỡ vạch «hoặc» → «SAI vao-bang-email-va-mat-khau/E13: base 0 -> head 1».
- `thuoc-da-ky` rút danh sách theo luật của E20 nên khác danh sách viết tay của AC-13: thêm `man-xin-quyen-co-rang` E3, E11 và `vao-bang-email-va-mat-khau` E17; `logo-onehub` E11 và `man-xin-quyen-co-rang` E10 là `ui-check`, ngoài làn máy (sổ quyết định d-…-9, chờ phê ở Cổng Bằng chứng).

Known limits — chủ kho chấp nhận 26/09 sau S4 round 2 (dừng-vá, đường a), việc siết thước tách sang chip «siết thước cửa vào»:

- Vế «logo của khối hướng dẫn không phải liên kết» của E13 không có đường đỏ: logo nằm ngoài `[data-khoi-huong-dan]`, và vòng Tab dừng khi gặp lại tên phần tử đầu, nên một logo bị bọc thành liên kết «Trang chủ» không làm dòng nào đỏ.
- Ma trận `ma-tran-cua` của E4 rẽ nhánh theo số nút trang vừa vẽ, không theo cột kỳ vọng viết trước cho từng ca: sáu ca cùng đo quan hệ «bước 2 khớp nút đang hiện», không ca nào ghim tập nút đúng của cấu hình mình.
- Chữ «Cài đặt» ở bước 1 (E3) được rút từ `settingsMessages(...).thanhBen.nhan` — nhãn trợ năng của thanh bên — không phải nhãn menu người dùng thấy; hai chữ đang trùng nên hôm nay đúng, nhưng thước không bắt được khi chúng tách.
