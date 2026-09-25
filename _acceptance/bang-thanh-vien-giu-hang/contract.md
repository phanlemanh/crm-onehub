---
schema_version: 1
feature: Trang Cài đặt › Thành viên giữ đủ hàng của bảng thành viên và cuộn như một trang khi danh sách «Được phép vào» dài — không khối nào đè lên bảng, menu đổi vai mở được
slug: bang-thanh-vien-giu-hang
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-25T09:08:11Z
design_doc: docs/superpowers/specs/2026-09-25-bang-thanh-vien-giu-hang-design.md
---

# Acceptance Contract: bang-thanh-vien-giu-hang

## Context

Ở `/<slug>/settings/members`, khi «Được phép vào» có từ khoảng 12 lời mời chờ trở lên,
bảng thành viên co về gần 0 chiều cao và khối «Được phép vào» đè lên nó: quản trị không
thấy thành viên nào và không mở được menu đổi vai. Nguyên nhân: `DataTable` chỉ biết lấp
đầy chiều cao còn lại của trang (`min-h-0 flex-1`), còn trang Thành viên đặt hai khối
dưới nhau trong một chuỗi `min-h-0` nên hai khối chia nhau chiều cao màn hình và bảng
nhường hết. Vòng này thêm cách xếp cao-theo-nội-dung cho `DataTable` trong `packages/ui`
và để trang Thành viên cuộn như mọi trang Cài đặt khác.

Mọi tiêu chí dưới đây đo trên màn thật: cây đang xét, 10 thành viên có sẵn, 15 lời mời
chờ do bàn đo gieo thêm, quản trị `ada@trycomp.ai`, tiếng Việt.

## Criteria

- AC-1: Given «Được phép vào» có từ 15 lời mời chờ trở lên, When quản trị mở Cài đặt › Thành viên ở 1440×900, 768×1024 và 375×812, Then số hàng nằm trọn trong vỏ bảng bằng số thành viên của workspace đọc từ cơ sở dữ liệu (một trang, tối đa 25), không hàng nào bị vỏ bảng cắt, và vỏ bảng không giấu phần nội dung nào sau thanh cuộn dọc riêng (chênh lệch cao nội dung và cao vỏ ≤ 2px).
- AC-2: Given cùng dữ liệu và ba khổ của AC-1, When trang tải xong, Then khối «Được phép vào» bắt đầu ở dưới đáy của khối bảng thành viên (tính cả dòng phân trang), và sau khi cuộn nút menu vai của một thành viên khác quản trị vào giữa khung nhìn, điểm giữa nút nằm trong khung nhìn và không bị phần tử nào khác che.
- AC-3: Given cùng dữ liệu và ba khổ của AC-1, When cuộn trang tới cuối, Then vùng cuộn của trang (`main` của `PageShell`) cuộn dọc được và hàng lời mời cuối cùng nằm trọn theo chiều dọc trong khung của vùng cuộn đó; đó là vùng cuộn dọc duy nhất — `document` không cuộn dọc riêng; và ở cả ba khổ trang không tràn ngang.
- AC-4: Given cùng dữ liệu và ba khổ của AC-1, When quản trị bấm nút menu vai của một thành viên khác mình, Then menu mở ra và có đủ bốn vai «Chủ sở hữu», «Quản trị», «Thành viên», «Chỉ OKR».
- AC-5: Given ô tìm của bảng thành viên chứa một chuỗi không khớp ai, When mở trang ở 1440×900, Then câu «Không ai khớp với bộ lọc này.» nằm trọn trong vỏ bảng, cao từ 16px, và không bị phần tử nào che.
- AC-6: Given trang Khoá API (dùng `DataTable` với cách xếp mặc định), When mở ở 1440×900, Then đáy khối bảng trùng đáy khung trang (lệch ≤ 2px) — cách xếp lấp đầy của bảy trang không đổi.
- AC-7: Given bàn đo đã gieo lời mời thử, When lượt đo kết thúc — đạt, trượt, hay hỏng giữa chừng (kể cả một lỗi cố ý ném ngay sau khi gieo) — Then không còn lời mời nào mang tiền tố của bàn đo, và tập lời mời có sẵn trước lượt còn nguyên.
- AC-8: Given ảnh chụp thật của lượt đo, When người xem mở hai ảnh mỗi khổ — đầu trang, và chỗ nối (đáy bảng thành viên cùng đầu «Được phép vào» trong một khung) — cùng ảnh menu vai đang mở và ảnh tìm không ra ai, Then nhìn thấy: bảng thành viên đủ hàng với «Được phép vào» nối bên dưới không đè; menu vai mở với bốn vai; câu «Không ai khớp với bộ lọc này.» nằm trong vỏ bảng.

## Coverage

Quét không gian tiêu chí bằng morphological-scan (preset test-matrix), bốn trục:

- Trục độ dài «Được phép vào»: không có (người không phải quản trị không thấy khối) | ngắn (≤ 6, dữ liệu dev hôm nay) | dài (≥ 12, khung hỏng) [thước CE: khung hỏng `_acceptance/khung-trang-cai-dat/evidence/settings_members-1440.png` so với khung lành `_acceptance/vai-chi-okr/evidence/menu-vai.png`; NGÀNH: Vercel Web Interface Guidelines «anticipate short, average, and very long user-generated content»]
- Trục trạng thái bảng thành viên: có hàng | tìm không ra ai | đang tải [thước CE: lớp phủ `deferredRows.length === 0` trong `packages/ui/src/components/data-table.tsx` — SUY-TỪ-REPO; NGÀNH: Web Interface Guidelines «handle empty states explicitly»]
- Trục khổ: 1440 | 768 | 375 [thước CE: `~/.claude/rules/web/testing.md` và khổ chụp của các hồ sơ Cài đặt trước — SUY-TỪ-REPO]
- Trục trang dùng `DataTable`: Thành viên (cao theo nội dung) | bảy trang lấp đầy — Khoá API, SSO, Liên hệ, Thoả thuận, Công ty, Chiến dịch, Danh mục onboarding [thước CE: mọi `<DataTable` trong `apps/app` — SUY-TỪ-REPO]
- Cắt ngang mọi ô Core: menu vai mở được và không bị che · không tràn ngang (1440, 768) · dữ liệu thử được dọn.

Core: dài × có hàng × ba khổ (AC-1..AC-4) · dài × tìm không ra ai × 1440 (AC-5) · Khoá API lấp đầy × 1440 (AC-6, đại diện bảy trang) · dọn (AC-7) · ảnh (AC-8).

Later: trạng thái đang tải của bảng cao-theo-nội-dung (chung một lớp phủ với «tìm không ra ai», thoáng qua nên khó chụp) · sáu trang lấp đầy còn lại ngoài Khoá API · danh sách «Được phép vào» ngắn và khối vắng (không có lỗi để bắt).

Never: ảo hoá hay thu gọn danh sách «Được phép vào» — lời hứa là trang cuộn, không phải giấu bớt hàng.

## Out of scope

- Thay bảng «Được phép vào» vẽ tay (`<table>`, `<h2>`) bằng `SimpleTable`/`Card` — đợt 3–4 của `docs/settings.md`.
- Đổi cách xếp của bảy trang đang dùng `DataTable` lấp đầy.
- Tiêu đề bảng thành viên dính khi cuộn.

## Notes

- Không có `opportunity.md` — vòng sửa lỗi đi thẳng từ khung hỏng, không có ngưỡng nghiệm thu, nên không có mục Đường đo.
- Chiều đỏ đã chạy trên mã chưa sửa (25/09): 13 SAI, mã 1; ảnh ở `.acceptance-runs/bang-thanh-vien-giu-hang/truoc-sua/`.
- Sửa sau niêm phong Cổng 1 (S3, xem sổ): bỏ `min-h-0` làm lộ lỗi hai vùng cuộn — hai `span` sr-only ở tiêu đề bảng «Được phép vào» vẽ tay không có khối chứa trong `main`, kéo dài `document` (153/387/632px) và gây luôn tràn ngang 98px ở 375. AC-3 thêm «một vùng cuộn» và nâng «không tràn ngang» lên cả ba khổ; `<section>` của khối đó thành khối chứa (`relative`).
