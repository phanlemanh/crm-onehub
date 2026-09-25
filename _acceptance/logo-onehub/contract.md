---
schema_version: 1
feature: Mọi logo Comp AI trong CRM đổi sang logo OneHub — mark dựng lại bằng hình học trùng ảnh gốc từ 98% trở lên và căn đúng tâm, bản kèm chữ OneHub ở trang đăng nhập, bộ favicon và icon cài app sinh từ cùng một nguồn, và PNG đúng cỡ cho Slack, Zalo, Google
slug: logo-onehub
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by: Phan Le Manh
approved_at: 2026-09-25
design_doc: docs/superpowers/specs/2026-09-25-logo-onehub-design.md
---

# Acceptance Contract: logo-onehub

## Context

Logo trong app (thanh trên cùng, trang đăng nhập, tab Agent), bộ favicon và tên manifest
«Comp AI CRM» vẫn là của hãng. Chủ kho chỉ có PNG lệch tâm, nên chốt 25/09: dựng lại mark
bằng hình học, dưới 98% trùng thì dừng; chữ «OneHub» dựng theo nét trong PNG và duyệt bằng
mắt; giữ màu nút chính `#006B4F`. `Logo` giữ nguyên tên và cách gọi để xung đột merge với bản
của hãng chỉ nằm trong một file.

## Criteria

- AC-1: Given path mark trong `packages/ui/src/lib/logo-onehub.ts` và ảnh gốc `packages/ui/scripts/logo-goc/logo-mark.png` (625×622), When dựng mark lên đúng lưới 625×622 tại toạ độ tâm đã khai và so kênh alpha, Then IoU mềm ≥ 0,98; và trên các điểm ảnh đục của cả hai, sai số trung bình bình phương mỗi kênh màu R, G, B ≤ 8/255.
- AC-2: Given `Logo` render ra ảnh vuông, When đo khung bao của phần đục, Then tâm khung bao lệch tâm ảnh không quá 1% cạnh ảnh theo cả hai trục (ảnh gốc lệch 76px ≈ 12%).
- AC-3: Given một trang render hai `Logo` cạnh nhau, When đọc DOM, Then mỗi `svg` có `role="img"` và `aria-label="OneHub"`, hai `linearGradient` mang hai `id` khác nhau, và `fill` của path mỗi logo trỏ `url(#id)` tới đúng `linearGradient` nằm trong chính `svg` đó; `className` và `aria-hidden` truyền vào đè được giá trị mặc định.
- AC-4: Given `LogoLockup` và ảnh gốc `logo-horizontal.png` (2048×622), When dựng lên cùng lưới và so alpha riêng vùng mark và riêng vùng chữ, Then IoU vùng mark ≥ 0,98 và vùng chữ ≥ 0,98; path chữ mang `fill="currentColor"`; hai `LogoLockup` trên một trang có `id` dải màu khác nhau; `svg` có `role="img"` và `aria-label="OneHub"`.
- AC-5: Given bộ icon trong `apps/app`, When đọc từng file, Then `app/favicon.ico` và `public/favicon.ico` giống nhau từng byte và mỗi file chứa đúng ba ảnh 16, 32, 48px; `favicon-96x96.png` là 96×96; `apple-touch-icon.png` là 180×180 và mọi điểm ảnh đục hoàn toàn, bốn góc trắng; `web-app-manifest-192x192.png` và `-512x512.png` đúng cỡ, đục hoàn toàn, và mọi điểm ảnh khác nền trắng nằm trong vòng tròn bán kính 40% cạnh, tâm ở giữa ảnh; `favicon.svg` có `viewBox` vuông và dải màu hai điểm dừng `#0045FF`, `#02D7FF`.
- AC-6: Given script sinh icon và nguồn `logo-onehub.ts` hiện tại, When sinh lại toàn bộ bộ icon trong bộ nhớ, Then điểm ảnh giải mã của từng file trong kho trùng khít bản vừa sinh — không file raster nào sửa tay hay sót bản cũ.
- AC-7: Given `apps/app/public/site.webmanifest`, When đọc, Then `name` là «OneHub CRM», `short_name` là «OneHub», và hai icon 192, 512 vẫn khai `purpose: "maskable"`.
- AC-8: Given một thư mục ngoài kho, When chạy script với `--external <thư mục>`, Then thư mục đó có `slack-app-icon-1024.png` (1024×1024), `zalo-bot-avatar-512.png` (512×512, mark nằm trong vòng tròn bán kính 40% cạnh) và `google-oauth-logo-120.png` (120×120, dưới 1MB), cả ba đục hoàn toàn nền trắng; và `git status` của kho không đổi sau lượt chạy.
- AC-9: Given nhánh này so với điểm rẽ khỏi `onehub`, When liệt kê file đổi, Then trong các file đang gọi `Logo` chỉ `apps/app/components/auth-shell.tsx` và `apps/app/components/crm/agent-panel.tsx` đổi; không file nào dưới `apps/app/components/landing/`, `apps/app/app/(landing)/`, `packages/ui/src/components/brand-logos/`, `apps/api/src/companies/favicon.service.ts`, `packages/db/src/favicon.ts` đổi; và biến `--primary` trong `packages/ui/src/styles/globals.css` vẫn là `#006B4F` (mọi dòng khai `--primary` trong file đó).
- AC-10: Given bàn đo của chính cây này với dữ liệu mẫu, When chụp trang đăng nhập ở khổ 1440 và 390, thanh trên cùng ở giao diện sáng và tối, và màn trống tab Agent ở giao diện sáng và tối, Then nhìn thấy trên ảnh: mark sáu lục giác dải xanh ở mọi chỗ từng có logo, chữ OneHub đọc được trên nền tối của trang đăng nhập ở cả hai khổ, không còn hình mark cũ của Comp, không logo nào bị cắt hay tràn; và `/favicon.ico` máy chủ trả về giống từng byte với `apps/app/app/favicon.ico`.
- AC-11: Given tab Agent của một hồ sơ công ty, When mở màn trống ở giao diện sáng và tối, Then logo đứng thẳng trên nền của màn, không có ô tô nền nào phía sau (chính logo và mọi phần tử bao nó tới khối màn trống đều nền trong suốt) và logo cao từ 28px trở lên; và ảnh đại diện trợ lý là một khối vuông 32×32 nền xám chuẩn (biến thể `square` của `MessageAvatar` trong `packages/ui`) với logo 20px nằm giữa, ở cả hai giao diện, đo bằng CSS thật của app; trong mã của tab Agent không còn ô tô `bg-foreground` nào quanh hay trên logo ở cả hai chỗ.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (tự dựng trục — không preset nào khớp một
lượt thay thương hiệu). Chân sản phẩm đào từ repo; chân ngành là chuẩn icon của nền tảng có tên.

- Trục hình: mark | mark kèm chữ | icon raster trong app | ảnh xuất cho dịch vụ ngoài [thước CE: danh sách file icon mà `apps/app/app/layout.tsx` và `site.webmanifest` khai — SUY-TỪ-REPO: apps/app/app/layout.tsx]
- Trục bề mặt: thanh trên cùng (và khung chờ) | trang đăng nhập (3 chỗ) | tab Agent (màn trống, ảnh đại diện) | huy hiệu phạm vi agent-builder | proto OKR | tab trình duyệt | màn chính iOS | cài app Android | Slack · Zalo · Google [thước CE: grep `@crm/ui/components/logo` trong `apps/app` — SUY-TỪ-REPO: apps/app/components/app-header.tsx và 9 file khác]
- Trục giao diện: sáng | tối | trang đăng nhập luôn tối [thước CE: lớp `dark` cố định — SUY-TỪ-REPO: apps/app/components/auth-shell.tsx]
- Trục cỡ: 14–24px trong app | 16/32/48 favicon | 96–512 icon cài | 120–1024 ảnh ngoài [thước CE: NGÀNH: Apple HIG apple-touch-icon 180px · web.dev «maskable icons» vùng an toàn bán kính 40% · Google Cloud Console Help «App Identity & Branding» 120×120 · Slack app icon 512–2000px · tài liệu Zalo OA avatar tối thiểu 240×240 vuông]

Core (vào AC): mark trùng gốc (AC-1, 2) · API component (AC-3, 4) · bộ icon và nguồn chung (AC-5, 6, 7) · ảnh ngoài (AC-8) · ranh giới không đụng (AC-9) · nhìn thấy trên màn thật (AC-10) · ô quanh logo ở tab Agent (AC-11).

Để chủ kho gạch tại Cổng 1:
- [GIẢ ĐỊNH] Cả ba chỗ trong `auth-shell.tsx` dùng `LogoLockup`, kể cả ô giữ chỗ vô hình và đầu form (trên điện thoại đó là chỗ duy nhất có tên thương hiệu).
- [GIẢ ĐỊNH] Zalo xuất 512px (tài liệu chỉ nói tối thiểu 240) và Slack xuất 1024px, cả hai nền trắng.
- Chủ kho chốt ở Cổng Bằng chứng 25/09 (phương án B): bỏ ô vuông tương phản quanh logo ở tab Agent — màn trống để logo đứng thẳng trên nền, ảnh đại diện trợ lý dùng nền chuẩn của `MessageAvatar` (AC-11).
- [NGÀNH] Mark cùng màu ở hai giao diện; logo được miễn ngưỡng tương phản của WCAG 1.4.11 (logotype).

## Out of scope

- Trang landing của hãng: nó import `Logo` nên tự đổi theo, nhưng không sửa file nào và không dựng lại landing bằng `LogoLockup` trong vòng này.
- Đổi màu nút chính hay bất kỳ token màu nào.
- Tên bot «Comp AI» trong câu lệnh mời Slack và lời báo của agent (`slack-channels.tsx`, `lib/agent-handoff.ts`): đó là tên app Slack, đổi cùng lúc chủ kho đổi tên app.
- Tự thay ảnh trên Slack, Zalo, Google Cloud Console: vòng này chỉ xuất PNG, chủ kho tự tải lên.
- Bản logo một màu (`currentColor`) cho mark: chưa có chỗ nào cần.
- Ảnh tab trình duyệt thật (thanh tab của Chrome): máy chụp đầu không giao diện không có thanh tab — AC-10 đo bằng byte favicon máy chủ trả về; ảnh tab thật chụp tay đính vào gói Cổng 2.

## Notes

- Mở lại sau Cổng Bằng chứng round 2 (25/09): chủ kho chọn bỏ ô đen quanh logo ở tab Agent, sửa ngay trong vòng này — AC-9 thêm `agent-panel.tsx`, thêm AC-11.
- Ảnh đại diện trợ lý chỉ hiện khi đã có hội thoại; bàn đo không có hội thoại mẫu, nên vế ảnh đại diện của AC-11 đo bằng cách dựng thành phần trong trình duyệt với stylesheet thật của máy chủ dev (không trong luồng chat thật).
- Mở lại lần hai sau round 3 (25/09): chủ kho chọn làm vuông ảnh đại diện (bỏ ô đen làm nó dẹt 32×20) và cho chạy round 4 vượt trần.

- Đo trước khi viết hợp đồng (S1): mark dựng lại IoU 99,72% với `logo-mark.png`, chữ dò nét IoU 99,6%.
- `sharp` 0.34.5 đã có trong `bun.lock`; vòng này thêm nó vào `devDependencies` của `@crm/ui`.
