---
schema_version: 1
feature: Cửa vào nói tiếng Việt — màn đăng nhập và màn khai báo đọc đúng tiếng của nhân viên, ngay lần đầu họ mở CRM
slug: cua-vao-noi-tieng-viet
owner: manh.phan@onemount.com
risk_tier: T2
surfaces: [ui]
status: draft
approved_by:
approved_at:
design_doc: docs/superpowers/specs/2026-09-04-cua-vao-noi-tieng-viet-design.md
---

# Acceptance Contract: cua-vao-noi-tieng-viet

## Context

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
- AC-6: Given ba nhóm KHÔNG được dịch — dữ liệu người nhập (`provider.name` của SSO, tên workspace), định danh kỹ thuật (bốn tên biến môi trường, tiền tố `https://`, tiền tố `/`, gợi ý `acme.com`, giá trị slug), và tên riêng (Google, Microsoft, Context) — When trang dựng ở tiếng Việt, Then mỗi nhóm hiện nguyên văn như ở tiếng Anh, và phần tử chứa nó mang `translate="no"`. Một giá trị thuộc ba nhóm này mà bị dịch làm tiêu chí đỏ và gọi tên giá trị đó.
- AC-7: Given `provider.name` do người quản trị tự gõ, When nút SSO dựng ra, Then chữ trên nút ghép động từ đã dịch với tên nguyên văn — chuỗi không được đúc sẵn trong kho chuỗi thành một câu tiếng Anh trọn vẹn.
- AC-8: Given ba trang `/sign-in`, `/onboarding`, `/onboarding/research`, When một người đọc tiếng Việt mở từng trang, Then tiêu đề tài liệu (thứ hiện trên thẻ tab trình duyệt) hiện tiếng Việt; và ở tiếng Anh hiện tiếng Anh. Tiêu đề tĩnh không đổi theo tiếng là tiêu chí đỏ.
- AC-9: Given luật chọn tiếng ở `resolveLocale`, When một người mở cửa vào lần đầu, Then thứ tự áp dụng là cookie `lang` trước, rồi `Accept-Language`, rồi mặc định; và mặc định là `vi`. Ba lượt kiểm: có cookie `en` → ra tiếng Anh dù `Accept-Language` khai `vi`; không cookie và `Accept-Language` khai `en` → ra tiếng Anh; không cookie và không `Accept-Language` → ra tiếng Việt.
- AC-10: Given tiếng Việt dài hơn tiếng Anh, When ba màn dựng ở tiếng Việt trên các khổ màn 768px, 1024px và 1280px, Then không chuỗi người-đọc-thấy nào bị cắt trần — bề rộng chữ thật không vượt bề rộng ô chứa nó. Riêng tiêu đề lớn trong ô `max-w-[14ch]` phải được đo bằng bề rộng dựng thật, không suy từ số ký tự.
- AC-11: Given 8 file trong phạm vi, When bộ kiểm đọc cây cú pháp của chúng, Then không chuỗi người-đọc-thấy nào còn viết thẳng trong JSX — mọi chuỗi như vậy đến từ kho chuỗi. Chuỗi thuộc ba nhóm khai miễn ở AC-6 không tính.
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
- Trang chủ `/` và các trang lỗi của `(landing)`. Không nằm trong hai luồng cửa
  vào.
- Nhãn "Comp AI" ở những chỗ KHÁC ngoài khung cửa vào — tiêu đề tab của ứng dụng,
  chân trang bên trong, 12 chỗ màn Slack, `logo.tsx`. Vòng này chỉ gỡ dòng chân
  của khung cửa vào.
- Màn Cài đặt và phần còn lại của ứng dụng: đó là lát ③b.

## Notes

Hạng T2 đứng được vì không file nào trong phạm vi chạm `risk_tiers.t3_paths`.
`DEFAULT_WORKSPACE_NAME` sống ở `packages/auth` nhưng vòng này KHÔNG sửa nó —
nếu về sau ai đó quyết dịch giá trị đó thì việc ấy là T3 và phải mở vòng riêng.
