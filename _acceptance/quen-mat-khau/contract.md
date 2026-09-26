---
schema_version: 1
feature: Quên mật khẩu — người dùng tự xin liên kết đặt lại qua thư (tiếp quản PR #104)
slug: quen-mat-khau
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, ui]
status: signed-off
design_doc: docs/superpowers/specs/2026-09-26-quen-mat-khau-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-26
---

# Acceptance Contract: quen-mat-khau

## Context

Người dùng cửa mật khẩu quên mật khẩu thì hôm nay phải nhờ quản trị phát liên kết.
Vòng này cho họ tự xin một liên kết qua thư ở `/quen-mat-khau`, và gửi một thư báo
khi mật khẩu vừa bị đổi. Hai việc đó trả hai món nợ d-4 và d-5 của vòng
`vao-bang-email-va-mat-khau`. Đây là cửa công khai trên luồng xác thực, nên lời hứa
nặng nhất là cửa không trở thành công cụ dò xem địa chỉ nào có tài khoản.

Source input: PR phanlemanh/crm-onehub#104 (commit 2818333d) + yêu cầu tiếp quản
của chủ kho ngày 26/09 · thiết kế duyệt trong chat 26/09 (Q1 = A, Q2 = A).

## Criteria

- AC-1: Given `RESEND_API_KEY` và `MAIL_FROM` đều chưa khai, When màn đăng nhập hỏi `sso.signInOptions`, Then cờ `quenMatKhau` là `false`, màn đăng nhập không có liên kết «Quên mật khẩu?», và mở thẳng `/quen-mat-khau` thì bị đưa về `/sign-in`. (cross-layer)
- AC-2: Given cả hai biến đã khai, When một người chưa đăng nhập mở `/sign-in`, Then cờ `quenMatKhau` là `true`, dưới ô mật khẩu có liên kết «Quên mật khẩu?» trỏ tới `/quen-mat-khau`, và mở đường đó khi chưa đăng nhập thì trang xin liên kết hiện ra chứ không bị đẩy về `/sign-in`. (cross-layer)
- AC-3: Given chỉ một trong hai biến `RESEND_API_KEY`, `MAIL_FROM` được khai, When mô-đun cấu hình xác thực nạp, Then nó ném lỗi nêu tên cả hai biến.
- AC-4: Given thư đã cấu hình, When xin liên kết cho bốn loại địa chỉ — có tài khoản và còn quyền vào, không có tài khoản, có tài khoản nhưng đã bị thu quyền vào, có tài khoản chỉ vào bằng Google — Then cả bốn nhận cùng một mã trạng thái và cùng một thân trả lời, giống nhau từng byte.
- AC-5: Given dịch vụ thư trả lời chậm 1,5 giây, When xin liên kết cho một địa chỉ có tài khoản và còn quyền vào, Then câu trả lời về trước khi thư gửi xong (dưới 1,5 giây), chênh trung vị so với một địa chỉ không có tài khoản nằm dưới ngưỡng khai trong eval, và lá thư vẫn được gửi đi sau đó.
- AC-6: Given thư đã cấu hình, When xin liên kết cho một địa chỉ có tài khoản và còn quyền vào (kể cả tài khoản chỉ vào bằng Google), Then đúng một thư được gửi tới chính địa chỉ đó, chứa liên kết `<APP_URL>/dat-mat-khau/<chìa>` với chìa có hàng tương ứng trong kho, và câu hạn dùng mang số phút suy từ `PASSWORD.tokenTtlSeconds`; với địa chỉ không có tài khoản hoặc đã bị thu quyền thì không thư nào được gửi.
- AC-7: Given một người đã xin hai liên kết, When người đó đặt mật khẩu thành công bằng một trong hai, Then dùng lại chính liên kết ấy thì bị từ chối, liên kết còn lại cũng bị từ chối, và mật khẩu vừa đặt không đổi.
- AC-8: Given một liên kết xin qua thư, When nó được dùng sau khi đã quá `PASSWORD.tokenTtlSeconds` kể từ lúc xin, Then bị từ chối và mật khẩu không đổi; mốc hết hạn lưu trong kho đúng bằng lúc xin cộng `PASSWORD.tokenTtlSeconds`.
- AC-9: Given cùng một nơi gửi đã xin ba lần trong 60 giây, When nó xin lần thứ tư, dù với địa chỉ nào, Then máy chủ trả 429, không thư nào được gửi thêm, và màn xin liên kết hiện câu riêng cho ca quá lượt nói đúng số phút phải chờ; quá 60 giây kể từ lượt cuối thì xin lại được. (cross-layer)
- AC-10: Given một người vừa đặt lại mật khẩu thành công bằng liên kết, When việc đặt xong, Then đúng một thư báo «mật khẩu vừa được đổi» được gửi tới địa chỉ của tài khoản; dịch vụ thư chậm 1,5 giây không làm câu trả lời đặt mật khẩu chờ theo, dịch vụ thư lỗi không làm hỏng việc đặt mật khẩu, và một lượt đặt mật khẩu bị từ chối (liên kết sai, đã dùng hay quá hạn) thì không gửi thư báo nào.
- AC-11: Given dịch vụ thư trả lỗi hoặc không với tới được, When xin liên kết cho một địa chỉ có tài khoản, Then câu trả lời vẫn y như AC-4, và dòng log của lần gửi hỏng có mã lỗi nhưng không có địa chỉ email nào và không có thân trả lời của dịch vụ thư.
- AC-12: Given trang `/quen-mat-khau`, When người dùng gửi địa chỉ, Then lúc đang gửi nút tắt và ghi «Đang gửi…»; gửi xong thì form nhường chỗ cho màn «Kiểm tra hộp thư» mang số phút thật; lỗi mạng hoặc lỗi máy chủ thì hiện câu lỗi kèm cách thử lại, vẫn ở form, chữ đã gõ còn nguyên; và 429 thì hiện câu quá lượt thay cho màn «đã gửi».
- AC-14: Given hai người ở hai địa chỉ khác nhau cùng đi qua proxy /api của app, When một người xin quá lượt, Then người kia vẫn xin được; và một yêu cầu tự đặt header x-forwarded-for hay header địa chỉ giả (không có chữ ký đúng của proxy) không né được giới hạn — máy chủ chỉ tin địa chỉ do proxy của chính mình ký. Cùng cơ chế áp cho luật chống dò mật khẩu ở màn đăng nhập. (cross-layer)
- AC-15: Given một người gọi mở yêu cầu POST tới /api/auth/* rồi ngắt kết nối khi mới gửi được một phần thân, When máy chủ xử lý yêu cầu dở đó, Then tiến trình API vẫn sống và trả lời bình thường cho yêu cầu kế tiếp; và lớp kiểm địa chỉ không đổi cách máy chủ trả lời bất kỳ yêu cầu nào so với better-auth gốc (vd POST JSON thân rỗng).
- AC-13: Given các chữ mới trên màn đăng nhập, trang xin liên kết và hai lá thư, When một nhân viên kinh doanh người Việt đọc lần đầu, Then họ biết phải làm gì tiếp ở mỗi màn, không câu nào ngầm nói địa chỉ có tài khoản hay không, và chữ theo luật nhãn của CONTEXT.md, không có thuật ngữ kỹ thuật tự đúc. (judgment)

## Coverage

Quét bằng lưới chống sót (`morphological-scan`), trục tự dựng từ preset
risk-premortem + entity-feature, 2026-09-26. Chân ngành: `[NGÀNH: OWASP Forgot
Password Cheat Sheet]` và `[NGÀNH: NIST SP 800-63B Rev 4]`, cái sau vòng trước đã neo.

- Trục A — ai đứng sau địa chỉ gửi vào: có tài khoản còn quyền | không có tài khoản | có tài khoản đã bị thu quyền | chỉ vào bằng Google | người đang đăng nhập [thước CE: SUY-TỪ-REPO packages/auth/src/allow-list.ts + mục Được phép vào của CONTEXT.md]
- Trục B — chặng: hiện cửa | xin liên kết | nhận thư | dùng liên kết | sau khi đổi [thước CE: NGÀNH OWASP Forgot Password Cheat Sheet, vòng đời yêu cầu đặt lại]
- Trục C — cấu hình thư: chưa khai | khai đủ và chạy | khai đủ mà chậm hoặc lỗi | khai một nửa [thước CE: SUY-TỪ-REPO packages/auth/src/env.ts, luật cặp biến của docs/environment.md]
- Trục D — đường lộ hay lạm dụng: thân câu trả lời | thời gian trả lời | dội liên tục | chìa dùng lại hoặc quá hạn [thước CE: NGÀNH OWASP Forgot Password Cheat Sheet, mục thông điệp thống nhất, thời gian thống nhất, chìa một lần]
- Ô Core thành AC-1 tới AC-12; AC-13 là lớp cắt ngang về chữ.
- Ô «người đang đăng nhập mở /quen-mat-khau» gạch khỏi Core: trang vẫn hiện, giống `/dat-mat-khau`, không có gì để hứa thêm.
- `[GIẢ ĐỊNH]` tài khoản chỉ vào bằng Google xin được liên kết, và đặt xong thì có thêm cửa mật khẩu. Nhất quán với vòng trước (quản trị phát liên kết cho bất kỳ ai; d-1 «một cơ chế cho ba ca mới/quên/đổi»), nhưng lần này người dùng tự làm. Chờ chủ kho gạch tại Cổng 1.
- Ô bị cắt để vết ở Out of scope, không biến mất câm.

## Out of scope

- Bánh phiên 5 phút — đổi mật khẩu chưa cắt phiên cũ tức thì; giới hạn khai từ vòng `vao-bang-email-va-mat-khau`, hạ mốc là cấu hình toàn kho.
- Chênh lệch thời gian ở mức truy vấn DB giữa nhánh có tài khoản (ghi một hàng) và nhánh không có (đọc một hàng) — mức giảm thiểu của chính better-auth; AC-5 đo tới mức «không chờ thư».
- Giới hạn tần suất theo địa chỉ nhận — bộ đếm chỉ theo nơi gửi, nhiều nơi gửi vẫn dội được hộp thư của một người.
- Xin liên kết mới không huỷ liên kết cũ còn hạn — chỉ đặt mật khẩu thành công mới dọn (AC-7).
- Thư HTML có nhận diện thương hiệu, xử lý thư dội và báo spam.
- CAPTCHA và câu hỏi bảo mật — OWASP khuyên không dùng câu hỏi bảo mật; luật kho ưu tiên chống lạm dụng nhẹ hơn CAPTCHA.
- Tự đăng nhập sau khi đặt lại — OWASP khuyên không; luồng `/dat-mat-khau` của vòng trước giữ nguyên.
- Xác minh SPF/DKIM ở Resend và cắm khoá lên hai dự án Vercel — việc vận hành của chủ kho trước khi bật.

## Notes

- Cờ tên `quenMatKhau` và đường `/quen-mat-khau` là giao kèo với hồ sơ `cua-vao-dang-nhap` (nhánh `feat/cua-vao-dang-nhap`); đổi tên thì phải báo chủ kho.
- Commit 2818333d của Tuan Do Viet được cherry-pick nguyên, giữ tác giả; các sửa của vòng này là commit riêng phía trên.
- AC-14 thêm sau S4 round 1 (d-18, chủ kho chọn phương án a): proxy /api xoá x-forwarded-for nên mọi người chung một khoá đếm. Proxy ký địa chỉ do nền tảng đặt (x-real-ip, Vercel ghi đè) bằng HMAC với BETTER_AUTH_SECRET; better-auth chỉ đọc header địa chỉ đã qua kiểm chữ ký. Tự dựng máy chủ thì reverse proxy phải ghi đè x-real-ip; thiếu khoá hay thiếu x-real-ip thì đếm như trước, không ném lỗi.
- Vận hành: proxy của app và API phải dùng CÙNG `BETTER_AUTH_SECRET`; lệch thì chữ ký bị từ chối và bộ đếm lùi về một khoá chung cho mọi người. Ngày 26/09 cả hai dự án Vercel đều có biến này (Preview + Production), chưa ai so hai giá trị.
- AC-15 thêm sau S4 round 2 (d-20, chủ kho chọn a): bản sửa round 2 đọc trọn thân yêu cầu trước better-auth, ngoài chỗ nó bắt lỗi, nên người gọi ngắt giữa chừng làm sập API. Lớp bọc nay chỉ sửa header địa chỉ trên yêu cầu gốc.
- AC-9 sửa sau Cổng Phạm vi, chủ kho chọn hướng (b) ngày 26/09: PR #104 hứa ba lượt mỗi 15 phút, nhưng bộ dọn hàng đếm của better-auth 1.6.25 xoá mọi hàng cũ hơn 60 giây và không tính luật riêng, nên cửa sổ 15 phút không giữ được trên môi trường thật (đo bằng ca `sau-don`). Hạ về ba lượt mỗi 60 giây, đúng mức thư viện giữ. Xem lại khi better-auth tính luật riêng vào bộ dọn, hoặc khi có báo cáo bị dội thư.
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 (Ngoài-2, 2026-09-26): hằng đổi giây sang phút được khai lại ở `thu-mat-khau.ts` và trang `/quen-mat-khau` thay vì suy từ một gốc trong `PASSWORD`; người dùng không thấy khác, nhưng sửa thời hạn phải nhớ sửa nhiều chỗ.
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 (Ngoài-3, 2026-09-26): cấu hình thư đọc lại `process.env` mỗi lần hỏi thay vì chụp một lần vào `env` như các cặp khoá khác; hành vi AC-3 vẫn đúng.
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 (Ngoài-4, 2026-09-26): tự dựng máy chủ ngoài Vercel mà reverse proxy không ghi đè `X-Real-IP` thì người gọi tự đặt địa chỉ và né được giới hạn tần suất của quên mật khẩu lẫn đăng nhập. Trên Vercel an toàn vì nền tảng ghi đè.
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 (Ngoài-5, 2026-09-26): nếu bước dọn liên kết còn treo gặp lỗi CSDL sau khi mật khẩu mới đã lưu, better-auth bỏ qua bước huỷ phiên cũ — biến thể hiếm của giới hạn bánh phiên đã khai.
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 (Ngoài-9, 2026-09-26): ca lỗi mạng của E18 chỉ khẳng định có một thông báo lỗi, chưa khẳng định đó đúng là câu lỗi mạng chứ không phải câu quá lượt.
- Giới hạn đã biết, chủ kho định đoạt tại Cổng 2 (Ngoài-10, 2026-09-26): ca chạy nền không có ngữ cảnh Vercel chỉ có vế «không ném» là đo thật; vế «việc vẫn chạy xong» không đỏ được.
- Mở hợp đồng mới theo định đoạt Cổng 2 (2026-09-26): Ngoài-1 (tiêu đề trang xin liên kết tự vẽ, logo biến mất khi tải xong), Ngoài-7 (số phút trên màn chưa đo so với `PASSWORD`), Ngoài-8 (ca hết hạn thiếu đối chứng dương). Chấp nhận không sửa: Ngoài-6 (log lỗi gửi thư cố ý chỉ ghi mã).
