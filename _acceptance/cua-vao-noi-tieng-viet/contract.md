---
schema_version: 1
feature: Cửa vào nói tiếng Việt — màn đăng nhập và màn khai báo đọc đúng tiếng của nhân viên, ngay lần đầu họ mở CRM
slug: cua-vao-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Manh Phan
approved_at: 2026-09-04
design_doc: docs/superpowers/specs/2026-09-04-cua-vao-noi-tieng-viet-design.md
amended_at: 2026-09-04
amended_reason: "S3 — khai tam gioi han moi truong: 8/15 chan do TU CHOI DO vi thieu fixture, khong vi san pham hong. Khong tieu chi nao bi thu hep."
amended_by:
---

# Acceptance Contract: cua-vao-noi-tieng-viet

## Context

**Sửa ở vòng 1 (04/09):** cửa vào có BỐN màn, không phải ba. Màn `grant-access`
dùng chung khung `AuthShell` nên nó nằm trong cùng luồng; lượt soi độc lập tìm
ra nó khi khung đã nói tiếng Việt còn thân màn thì chưa. Nay nó trong phạm vi.

Màn đăng nhập và màn khai báo là hai màn ĐẦU TIÊN một nhân viên OneHub nhìn thấy,
và cả hai vẫn tiếng Anh. Chúng nằm ngoài mọi lát đã khoanh: vòng ③a khoanh 96 file
của ba luồng bên trong ứng dụng, không đụng `(landing)`.

Cơ chế ngôn ngữ đã chạy sẵn cho hai màn này — `app/layout.tsx` là layout gốc và đã
gọi `resolveLocale(cookie, accept-language)`. Thiếu đúng kho chuỗi.

Lớp lỗi phải chặn, có lịch sử: vòng ③a đạt 16/16 tiêu chí máy mà vẫn còn 18 chỗ
tiếng Anh, vì các chân đo chỉ thấy bề mặt chúng tự mở. Ba bề mặt ở đây có cùng hình
dạng đó — nhánh chưa-cấu-hình, Suspense fallback, và trạng thái đang gửi.

Source input: prompt · `_acceptance/handoff.md` (hướng đã chốt 04/09) · 8 file đã đọc trọn

## Criteria

- AC-1: Given một người đọc tiếng Việt mở `/sign-in`, When trang dựng xong ở trạng thái thường, Then mọi chuỗi người-đọc-thấy của khung chung và của nội dung màn hiện bằng tiếng Việt có dấu — gồm nhãn thay-ảnh của hai liên kết logo, nhãn nhóm, tiêu đề lớn, tiêu đề và mô tả của màn; và cùng trang ở tiếng Anh hiện bản tiếng Anh tương ứng. Không chuỗi nào hiện giống hệt nhau ở cả hai thứ tiếng trừ các nhóm khai miễn ở AC-6.
- AC-2: Given màn khai báo công ty và màn khoá nghiên cứu, When một người đọc tiếng Việt mở từng màn, Then ba nhãn trường, hai dòng mô tả trường, nhãn ô khoá, chữ gợi ý trong ô, chữ trên nút gửi, và chữ của liên kết đăng ký đều hiện tiếng Việt có dấu; và bản tiếng Anh hiện bản tiếng Anh.
- AC-3: Given cấu hình KHÔNG có cách đăng nhập nào (không Google, không Microsoft, không SSO), When một người đọc tiếng Việt mở `/sign-in`, Then màn "chưa có cách nào để vào" hiện tiêu đề, mô tả và đoạn hướng dẫn bằng tiếng Việt; và bốn tên biến môi trường trong đoạn đó giữ nguyên chữ hoa gốc, không bị dịch, không bị đổi dạng.
- AC-4: Given Suspense fallback của `/sign-in` (trạng thái hiện trong lúc đang đọc cấu hình), When phép đo dựng riêng trạng thái đó, Then tiêu đề và mô tả dự phòng hiện đúng tiếng của người đọc. Phép đo phải MỞ được trạng thái này chứ không suy từ mã.
- AC-5: Given ba nút gửi (đăng nhập, khai báo công ty, khoá nghiên cứu), When nút ở trạng thái đang gửi, Then chữ trên nút ở trạng thái đó hiện đúng tiếng của người đọc; và nút bị khoá trong lúc đang gửi.
- AC-6: Given BẢNG ĐÓNG mười ba giá trị không được dịch dưới đây, When trang dựng ở tiếng Việt, Then số giá trị quan sát được BẰNG mười ba; mỗi giá trị hiện nguyên văn giống hệt lượt tiếng Anh; và phần tử chứa nó mang `translate="no"`. Thiếu một dòng của bảng là TỪ CHỐI ĐO — thoát mã 2 và gọi tên dòng thiếu, không phải một lượt đạt. Một giá trị bị dịch làm tiêu chí đỏ và gọi tên giá trị đó.
  Định danh kỹ thuật: (1) `GOOGLE_CLIENT_ID` (2) `GOOGLE_CLIENT_SECRET` (3) `MICROSOFT_CLIENT_ID` (4) `MICROSOFT_CLIENT_SECRET` — cả bốn trong đoạn hướng dẫn của màn chưa-có-đường; (5) tiền tố `https://` của ô website; (6) tiền tố `/` của ô địa chỉ workspace; (7) gợi ý `acme.com` của ô website.
  Dữ liệu người nhập: (8) tên nhà cung cấp SSO trên nút; (9) giá trị người gõ trong ô tên công ty; (10) giá trị slug trong ô địa chỉ workspace; (11) gợi ý `CRM` của ô tên công ty.
  Tên riêng: (12) `Google` và `Microsoft` trên nút đăng nhập; (13) `Context` trong nhãn và mô tả ô khoá.
- AC-7: Given `provider.name` do người quản trị tự gõ, When nút SSO dựng ra, Then chữ trên nút ghép động từ đã dịch với tên nguyên văn — chuỗi không được đúc sẵn trong kho chuỗi thành một câu tiếng Anh trọn vẹn.
- AC-8: Given BA trang mà phép đo mở được — `/sign-in`, `/onboarding`, `/onboarding/research`. Màn thứ tư `/grant-access` KHÔNG nằm trong tiêu chí này: nó chỉ được bảo chứng bởi AC-11 (quét cú pháp), xem Known limits. When một người đọc tiếng Việt mở từng trang, When một người đọc tiếng Việt mở từng trang, Then tiêu đề tài liệu (thứ hiện trên thẻ tab trình duyệt) hiện tiếng Việt; và ở tiếng Anh hiện tiếng Anh. Tiêu đề tĩnh không đổi theo tiếng là tiêu chí đỏ.
- AC-9: Given trục C của mục Coverage khai NĂM cách chọn tiếng, When một người mở `/sign-in` qua MÁY CHỦ THẬT, Then phép đo đưa ra đúng NĂM khẳng định, mỗi ô một khẳng định, và số khẳng định bằng số ô: (1) cookie `vi` + `Accept-Language: en` → `vi`; (2) cookie `en` + `Accept-Language: vi` → `en`; (3) không cookie + `Accept-Language: vi` → `vi`; (4) không cookie + `Accept-Language: en` → `en`; (5) không cookie + không `Accept-Language` → `vi`. Mỗi khẳng định kiểm HAI vế trên lượt máy chủ trả về: thuộc tính `lang` của thẻ `html`, VÀ tiêu đề màn hiện ra đúng thứ tiếng mong đợi. Thiếu một ô là đỏ và gọi tên ô đó.
- AC-10: Given tiếng Việt dài hơn tiếng Anh, When BA màn mà phép đo mở được (không gồm `/grant-access` — xem Known limits) dựng ở tiếng Việt trên các khổ màn 768px, 1024px và 1280px, Then không chuỗi người-đọc-thấy nào bị cắt trần — bề rộng chữ thật không vượt bề rộng ô chứa nó. Riêng tiêu đề lớn trong ô `max-w-[14ch]` phải được đo bằng bề rộng dựng thật, không suy từ số ký tự.
- AC-11: Given DANH SÁCH FILE SINH TỪ ĐĨA — mọi `.tsx` dưới `app/(landing)` cộng khung dùng chung, trừ một bản khai loại-trừ có lý do từng dòng — When bộ kiểm đọc cây cú pháp của chúng, Then không chuỗi người-đọc-thấy nào còn viết thẳng trong JSX — mọi chuỗi như vậy đến từ kho chuỗi. Chuỗi thuộc ba nhóm khai miễn ở AC-6 không tính. Danh sách KHÔNG được viết tay: một màn mới thêm vào thư mục phải tự vào phạm vi mà không ai sửa bản khai, và một dòng loại-trừ không còn đối tượng thật làm bộ kiểm ĐỎ.
- AC-12: Given kho chuỗi mới `apps/app/lib/messages/auth.ts`, When biên dịch chạy, Then nó theo cùng khuôn `satisfies` với năm kho chuỗi anh em, để một khoá có ở tiếng Anh mà thiếu ở tiếng Việt làm biên dịch đỏ. Và mọi giá trị tiếng Việt mang ít nhất một ký tự có dấu tiếng Việt, trừ các khoá khai miễn có lý do ghi từng dòng.
- AC-13: Given dòng chân "Made with love by Comp AI" và liên kết `trycomp.ai`, When bất kỳ màn nào của cửa vào dựng ra, Then cả chữ lẫn liên kết KHÔNG còn trên màn ở cả hai thứ tiếng; và file `LICENSE` ở gốc kho không đổi.
- AC-14: Given người đọc tiếng Việt gặp lỗi mạng khi bấm một nút đăng nhập, When client tự dựng câu báo lỗi dự phòng, Then câu đó hiện tiếng Việt. Câu lỗi do máy chủ đúc sẵn nằm NGOÀI tiêu chí này — xem Known limits. (judgment)

## Coverage

Quét bằng skill `morphological-scan`, preset `test-matrix`. Chủ ngữ là chữ trên
màn của hai luồng cửa vào. Ba trục, 6 × 5 × 5 = 150 ô; không gian > 50 nên quét
theo lát cắt trục A và phủ theo cặp, đúng mục Pareto của preset.

- Trục **A — bề mặt & trạng thái hiển thị** (MECE trên câu hỏi "người đang nhìn
  cái gì"): khung dùng chung | tiêu đề tài liệu | nội dung màn ở trạng thái
  thường | nhánh rẽ theo cấu hình | trạng thái tạm | phản hồi lỗi
  [thước CE: `[SUY-TỪ-REPO: apps/app/components/auth-shell.tsx]` cùng bảy file
  còn lại đã đọc trọn · `[SUY-TỪ-REPO: _acceptance/handoff.md]` — 18 chỗ sót của
  vòng ③a, mỗi chỗ là một ô trục A từng bị bỏ qua]
- Trục **B — nguồn của chuỗi** (MECE trên câu hỏi "ai đúc ra chữ này"): nhãn của
  mình | dữ liệu người nhập | định danh kỹ thuật | tên riêng | chuỗi máy chủ đúc
  sẵn
  [thước CE: `[SUY-TỪ-REPO: CLAUDE.md]` — luật "dữ liệu người nhập không dịch" ·
  `[NGÀNH: Vercel Web Interface Guidelines]` — luật `translate="no"` cho tên
  thương hiệu, mã và định danh, tra ngày 04/09]
- Trục **C — cách chọn tiếng**: cookie vi | cookie en | không cookie +
  `Accept-Language` vi | không cookie + `Accept-Language` en | không cookie +
  không `Accept-Language`
  [thước CE: `[SUY-TỪ-REPO: apps/app/lib/locale/resolve.ts]` — ba nhánh của hàm ·
  `[NGÀNH: WCAG 2.2 §3.1.1 Language of Page]`]

**Core** (14 ô, → AC-1…AC-14). Ba ô mà lịch sử lỗi của kho chỉ đích danh là dễ
sót nhất đều nằm trong Core và có tiêu chí riêng: nhánh chưa-cấu-hình (AC-3),
Suspense fallback (AC-4), trạng thái đang gửi (AC-5).

**Later** — mỗi dòng một câu:
- Dịch chuỗi lỗi máy chủ đúc sẵn: cần máy chủ gửi mã lỗi cho client tra, chạm hợp
  đồng tRPC, là vòng riêng.
- Đưa lỗi vào cạnh trường thay vì toast (Vercel WIG khuyến nghị): đổi thiết kế
  chứ không phải dịch.
- Thêm dấu ba chấm cho chữ ở trạng thái đang tải theo Vercel WIG: gộp vào vòng
  quét toàn ứng dụng, không làm riêng ở hai màn.

**Never** — mỗi dòng một lý do:
- Dịch `DEFAULT_WORKSPACE_NAME`: nó là tên và slug thật của workspace, dịch là
  đổi địa chỉ.
- Dịch tên biến môi trường: người đọc phải gõ y nguyên.
- Dịch tên hãng Google, Microsoft, Context: tên riêng.

**Cross-cutting áp mọi ô Core**: `translate="no"` ở mọi chỗ dữ liệu hoặc định
danh chạm màn (AC-6); không chỗ nào bị cắt trần ở tiếng Việt (AC-10); không chuỗi
nào còn viết thẳng trong JSX (AC-11).

## Out of scope

- Chuỗi lỗi do máy chủ đúc sẵn (`error.message` của Better Auth và tRPC ở bốn chỗ
  gọi `toast.error`). Máy chủ không biết tiếng của người gọi nên câu đó không đi
  theo người đọc được. Vòng này chỉ dịch câu dự phòng của client.
- Trang chủ `/` và các trang lỗi của `(landing)`. Không nằm trong luồng cửa vào.
- Nhãn "Comp AI" ở những chỗ KHÁC ngoài khung cửa vào — tiêu đề tab của ứng dụng,
  chân trang bên trong, 12 chỗ màn Slack, `logo.tsx`. Vòng này chỉ gỡ dòng chân
  của khung cửa vào.
- Màn Cài đặt và phần còn lại của ứng dụng: đó là lát ③b.

## Known limits

### Nợ giàn đo còn lại khi ký (vòng 3, 04/09)

Bốn màn của cửa vào đều đã dịch. Nhưng **việc đổi khuôn chỉ tới được một trong
bốn chỗ**: dân số sinh từ đĩa mới áp cho bộ quét cú pháp (AC-11). Ba chân đo
chạy trên trình duyệt — tiêu đề tài liệu, bề rộng, không-dịch — vẫn gõ tay cùng
ba đường dẫn ở ba chỗ trong `rang/cua-vao.mjs`, nên chúng **chưa bao giờ mở màn
`/grant-access`**. AC-8 và AC-10 nay nói rõ điều đó thay vì nói "ba màn" trong
khi Bối cảnh nói bốn.

Ba món nợ nữa, tất cả nằm ở THƯỚC chứ không ở thứ người dùng thấy:

| Nợ | Hậu quả |
| --- | --- |
| Ba danh sách đường dẫn gõ tay trong `cua-vao.mjs` | Màn thứ năm nào thêm vào sẽ lại vô hình với ba chân đó |
| Hai quy ước cho một việc: mốc `NUL` ở `grant-access`, tách theo chữ `Context` ở `research-form` | Bản tách theo chữ mất im lặng nửa câu nếu ai đó viết lại câu mà không còn chữ `Context` |
| Màn đăng nhập vẫn ghép chuỗi ở máy chủ rồi truyền xuống | Nó là màn duy nhất phải bọc `translate="no"` quanh CẢ nhãn thay vì quanh riêng tên hãng |

Ba món này đi vào một vòng riêng có chủ ngữ là giàn đo — kho đã có tiền lệ đúng
kiểu đó và nó chạy được.

### Đổi khuôn ở vòng 2 (04/09)

Hai vòng liền sót cùng một bề mặt vì **dân số của phép đo được viết tay**: thư
mục `(landing)` có mười file, bản khai của tôi có tám, và hai file thiếu chính
là hai file bị sót cả hai lần. Nay danh sách sinh từ đĩa; mọi loại trừ phải có
tên và phải còn đối tượng thật. Đã chứng minh: thêm một màn mới mà KHÔNG sửa
bản khai thì phép đo tự bắt.

### Tám chỗ môi trường này KHÔNG dựng nổi vật để đo (khai ở S3, 04/09)

Không tiêu chí nào bị thu hẹp. Phép đo vẫn đòi đúng điều đã hứa, và vẫn TỪ CHỐI
ĐO thay vì báo đạt. Đây là ghi nhận rằng môi trường chưa có vật, không phải
tuyên bố sản phẩm đã đúng.

| Không đo được | Vì sao | Tiêu chí chạm tới |
| --- | --- | --- |
| Hai màn khai báo | Workspace này đã khai báo xong nên `/onboarding` và `/onboarding/research` chuyển hướng về ứng dụng. Đi theo chuyển hướng là đo bảng điều khiển — một bản nháp đã làm đúng thế và báo 4 ô có mặt trong khi chúng chưa từng ở đó | AC-2, AC-5, AC-8 (2/3 đường), AC-10 (2/3 màn) |
| Nhánh "chưa có cách nào để vào" | Cổng gọi API từ phía máy chủ nên chặn ở trình duyệt không tới được. Cần cấu hình không có nhà cung cấp nào | AC-3 (nửa "hiện ra trên màn") |
| Nhà cung cấp SSO | Chưa gieo bản ghi `ssoProvider` nào có tên không phải ASCII | AC-7, AC-6 (1/13 dòng) |
| Nhà cung cấp Microsoft | Chưa cấu hình | AC-6 (1/13 dòng) |

**Đã bù được một phần:** bốn tên biến môi trường của AC-3 được bảo chứng bởi bài
kiểm đơn vị `auth-messages.spec.ts` — chúng giữ nguyên ở cả hai thứ tiếng. Chỉ
nửa "hiện ra trên màn" là chưa đo.

**Đường mở khoá, nếu về sau muốn:** một cặp máy chủ thứ hai chạy trên cơ sở dữ
liệu thử sạch (workspace chưa khai báo, không nhà cung cấp nào), cộng một bản ghi
`ssoProvider` gieo sẵn. Ước lượng: một khối việc riêng, không phải một lượt sửa.

### Giới hạn đã khai từ Cổng 1

- **Chuỗi lỗi do máy chủ đúc sẵn vẫn hiện tiếng Anh.** Bốn chỗ gọi
  `toast.error(error.message)` nhận câu Better Auth và tRPC tự dựng ở máy chủ.
  Máy chủ không biết tiếng của người gọi nên câu đó không đi theo người đọc được.
  Sửa đúng là gửi MÃ lỗi cho client tra — vòng riêng, chạm hợp đồng tRPC.
  AC-14 và E17 chỉ bảo chứng câu dự phòng do client tự dựng.
- Kho chưa wire `executors.design.static` nên vòng này KHÔNG có static eval
  per-surface; chỉ có sân thiết kế ở E16.

## Notes

Hạng T2 đứng được vì không file nào trong phạm vi chạm `risk_tiers.t3_paths`.
`DEFAULT_WORKSPACE_NAME` sống ở `packages/auth` nhưng vòng này KHÔNG sửa nó —
nếu về sau ai đó quyết dịch giá trị đó thì việc ấy là T3 và phải mở vòng riêng.
