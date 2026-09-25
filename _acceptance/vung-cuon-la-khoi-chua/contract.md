---
schema_version: 1
feature: Vùng cuộn của khung trang là khối chứa — phần tử định vị bên trong mọi trang dùng PageShell không kéo dài document, trang dài chỉ có một vùng cuộn và khung ứng dụng không trượt
slug: vung-cuon-la-khoi-chua
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T14:44:58Z
design_doc: docs/superpowers/specs/2026-09-25-vung-cuon-la-khoi-chua-design.md
---

# Acceptance Contract: vung-cuon-la-khoi-chua

## Context

`main[data-slot=page-shell-scroll]` của `PageShell` là vùng cuộn dọc của mọi trang nhưng
không phải khối chứa. Phần tử `absolute` bên trong không có tổ tiên định vị — `span.sr-only`,
`<select>` ẩn của Radix Select, `<input>` ẩn của Radix Switch — lấy khung nhìn làm khối chứa;
khi nó nằm dưới mép màn, `document` dài ra: hai vùng cuộn dọc lồng nhau, lăn tới cuối thì cả
khung ứng dụng trượt lên. Quét 25/09 trên dữ liệu dev: năm trang Cài đặt mang 21 phần tử như
vậy (Trường 14, Chương trình OKR 4, Tiền tệ 1, Danh mục onboarding 1, Tổ chức 1), đang im chỉ
vì nằm trên mép màn. Vòng này cho `main` là khối chứa (`relative`) một lần, ở `PageShell`.

Mọi tiêu chí đo trên màn thật: cây đang xét ở 3500/3501, dữ liệu dev, quản trị
`ada@trycomp.ai`, tiếng Việt, ba khổ 1440×900, 768×1024, 375×812. «Trang đo» là trang mà
`main` cuộn của `PageShell` có mặt và không `contained`.

## Criteria

- AC-1: Given mọi tệp `page.tsx` dưới `apps/app/app/(app)/[slug]`, When bàn đo chạy, Then mỗi tệp × ba khổ có đúng một nhãn — đo, chuyển hướng, contained, hoặc không khung — số dòng nhãn bằng số tệp nhân ba; chỉ tập trang ghim sẵn được mang nhãn khác «đo» (chuyển hướng: bản ghi liên hệ, thoả thuận, công ty, kế hoạch onboarding, «Thông báo» cũ, Slack › Người khi chưa kết nối Slack; contained: chi tiết agent; không khung: hai trang trò chuyện), trang nào ngoài tập đó mang nhãn khác là trượt; và một đoạn động có tên bàn đo không biết, một đoạn động không có bản ghi, hay một lần bị đẩy về đăng nhập làm lượt thoát «không đo được» gọi tên chỗ đó thay vì bỏ qua trang.
- AC-2: Given một trang đo ở cả ba khổ, When trang tải xong, Then không phần tử `position: absolute` nào nằm trong `main` lấy `body` làm tổ tiên định vị (`offsetParent`).
- AC-3: Given một trang đo ở cả ba khổ với dữ liệu như đang có, When trang tải xong, Then `document` không tràn dọc và không tràn ngang (`scrollHeight − clientHeight ≤ 0`, `scrollWidth − clientWidth ≤ 0` của `documentElement`).
- AC-4: Given một trang đo ở cả ba khổ mà nội dung bị đẩy xuống dưới mép màn (bàn đo chèn vào `[data-slot=page-shell]` — con trực tiếp của `main` — một khối đệm cao gấp đôi khung nhìn ở đầu, và ở cuối một phần tử ẩn cho trình đọc màn hình — `span.sr-only` đẩy sang phải một khung rưỡi — đại diện cho mọi phần tử như thế trang sẽ có sau này), When đo lại, Then `document` vẫn không tràn dọc và không tràn ngang.
- AC-5: Given cùng trang dài của AC-4, When người dùng lăn con lăn trên vùng nội dung tới cuối rồi lăn thêm, Then khung ứng dụng không trượt — `window.scrollY` bằng 0 và đầu trang của khung ứng dụng vẫn ở mép trên khung nhìn.
- AC-6: Given một trang đo ở cả ba khổ, When trang tải xong, Then mọi phần tử `position: absolute` mà khối chứa là `main` đều đứng ở vị trí tĩnh — ép `top`, `right`, `bottom`, `left` về `auto` không dịch hộp của nó quá 1px — không phần tử nào đang định vị theo khung nhìn bị kéo sang định vị theo `main`.
- AC-7: Given một trang đo ở cả ba khổ, When so hộp của mọi phần tử trong `main` (vị trí và cỡ, cuộn ở đầu trang) giữa khung như đang có và khung bị ép về `position: static`, Then không hộp nào lệch quá 1px — việc cho `main` làm khối chứa không dịch chuyển gì nhìn thấy được.
- AC-8: Given ảnh chụp thật của lượt đo, When người xem mở ảnh trang Cài đặt › Trường ở ba khổ sau khi lăn tới cuối trang dài, cùng ảnh đối chứng khi tắt khối chứa, Then ở ảnh chính đầu trang và thanh bên của khung ứng dụng nằm nguyên chỗ; ở ảnh đối chứng khung ứng dụng trượt lên khỏi mép trên.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset test-matrix), bốn trục:

- Trục trang: mọi `page.tsx` dưới `(app)/[slug]` — 27 trang đo | chuyển hướng (bản ghi, Nhắc buổi sáng cũ) | contained (chi tiết agent) | không khung (trò chuyện) [thước CE: cây tệp `apps/app/app/(app)/[slug]` — SUY-TỪ-REPO; danh sách rút từ đĩa mỗi lượt nên trang mới tự vào]
- Trục khổ: 1440 | 768 | 375 [thước CE: `~/.claude/rules/web/testing.md` và khổ của hồ sơ `bang-thanh-vien-giu-hang` — SUY-TỪ-REPO]
- Trục độ dài nội dung: tự nhiên (dữ liệu dev) | dài hơn khung (phần tử thật bị đẩy dưới mép) [thước CE: lỗi gốc chỉ lộ khi phần tử nằm dưới mép — `_acceptance/bang-thanh-vien-giu-hang/contract.md` mục Notes; NGÀNH: Web Interface Guidelines «Text containers handle long content»]
- Trục phần tử định vị trong `main`: `absolute` không toạ độ (sr-only, select/input ẩn của Radix) | `absolute` có toạ độ | `fixed` | `sticky` [thước CE: quét 25/09 trên 30 đường — SUY-TỪ-REPO `docs/superpowers/specs/2026-09-25-vung-cuon-la-khoi-chua-design.md`; NGÀNH: W3C CSS Positioned Layout Module Level 3, định nghĩa khối chứa]
- Cắt ngang mọi ô Core: danh sách trang đủ (AC-1) · không dịch chuyển nhìn thấy (AC-7).

Core: mọi trang đo × ba khổ × tự nhiên (AC-2, AC-3) · × dài (AC-4, AC-5) · `absolute` có toạ độ (AC-6) · ảnh trang Trường (AC-8).

Later: nhánh `contained` (một trang, cùng dòng sửa) · `fixed` và `sticky` (không đổi theo `position: relative` — ghi số đếm, không chấm) · dữ liệu dài thật thay cho khối đệm (mỗi trang một kiểu gieo; khối đệm đẩy đúng các phần tử thật).

Never: che thanh cuộn bằng `overflow-x-hidden`/`overflow: clip` trên khung ứng dụng — che triệu chứng, không gỡ vùng cuộn thứ hai.

## Out of scope

- Nhánh `contained` của `PageShell` (trang chi tiết agent): nhận cùng dòng sửa nhưng không chấm.
- Gỡ `relative` nay thừa ở `<section>` của `settings/members/allowances-table.tsx`.
- Bảng «Được phép vào» vẽ tay và tràn ngang 98px bên trong `main` ở 375 — đợt 3–4 của `docs/settings.md`.
- Trang không dùng `PageShell`: landing, đăng nhập, trò chuyện với agent.

## Notes

- Không có `opportunity.md` — vòng sửa lỗi đi từ việc ngoài hợp đồng của `bang-thanh-vien-giu-hang`, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- Sáu hồ sơ đã ký đo `page-shell.tsx` trong `paths` (`bang-thanh-vien-giu-hang`, `chan-lai-component-ra-man`, `khung-trang-cai-dat`, `logo-onehub`, `mot-duong-ghi-phong-ban`, `tong-quan-va-khung-noi-tieng-viet`); sau khi vòng này xanh, ghim lại chúng bằng một lượt làn.
