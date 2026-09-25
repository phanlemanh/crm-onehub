---
slug: khung-trang-cai-dat
at: 2026-09-25T01:55:00Z
route: http://localhost:3300/proto/khung-trang-cai-dat
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-menu--desktop-1280--light.png, evidence/design-pass/ST-nhac--desktop-1280--light.png]
reaction: nac-1 (ghim)
options: http://localhost:3300/proto/khung-trang-cai-dat?state=ST-phuong-an-a
divergence: opened
ds_skill: web-design-guidelines
states: [ST-chung, ST-thanh-vien, ST-ket-noi, ST-google, ST-slack-nguoi, ST-intake, ST-dang-tai, ST-menu, ST-nhac, ST-phuong-an-a]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 3
deferred: 3
---
# design-pass — khung-trang-cai-dat

Vật của vòng này là chính cái khung (thanh bên, cột nội dung, đầu trang), nên bản
mẫu là một khung host dạng tĩnh phủ cả màn hình, ghép từ component thật của kho
(`NavItem`, `PageShell*`, `Card`, `DropdownMenu`, `StatusIndicator`). Bấm mục
thanh bên, mục breadcrumb, hay mục menu người dùng chuyển trạng thái — bản mẫu
bấm được. Thanh biểu tượng bên trái của app không vẽ lại.

Phân kỳ mở ở đúng một điểm máy không tự chắc: breadcrumb đẩy tiêu đề trang con
xuống 44px (đo trên bản mẫu: `h1` top 72px ở trang mục, 116px ở trang con; left
248px ở mọi trang). Hướng A — mọi trang mang dòng «Cài đặt › …», tiêu đề đứng yên
mọi nơi, đổi lại dòng đó lặp điều thanh bên đã nói. Hướng B — chỉ trang con có
breadcrumb, chuyển tab trên thanh bên vẫn giữ tiêu đề đứng yên, trang con thấp
hơn một dòng vì sâu hơn một cấp. **Máy khuyên B**, lời khuyên ghim trên chính
trạng thái `ST-phuong-an-a` của bản mẫu.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-chung | desktop-1280 | light | evidence/design-pass/ST-chung--desktop-1280--light.png |
| ST-chung | mobile-375 | light | evidence/design-pass/ST-chung--mobile-375--light.png |
| ST-thanh-vien | desktop-1280 | light | evidence/design-pass/ST-thanh-vien--desktop-1280--light.png |
| ST-thanh-vien | mobile-375 | light | evidence/design-pass/ST-thanh-vien--mobile-375--light.png |
| ST-ket-noi | desktop-1280 | light | evidence/design-pass/ST-ket-noi--desktop-1280--light.png |
| ST-ket-noi | mobile-375 | light | evidence/design-pass/ST-ket-noi--mobile-375--light.png |
| ST-google | desktop-1280 | light | evidence/design-pass/ST-google--desktop-1280--light.png |
| ST-google | desktop-1280 | dark | evidence/design-pass/ST-google--desktop-1280--dark.png |
| ST-google | mobile-375 | light | evidence/design-pass/ST-google--mobile-375--light.png |
| ST-slack-nguoi | desktop-1280 | light | evidence/design-pass/ST-slack-nguoi--desktop-1280--light.png |
| ST-slack-nguoi | mobile-375 | light | evidence/design-pass/ST-slack-nguoi--mobile-375--light.png |
| ST-intake | desktop-1280 | light | evidence/design-pass/ST-intake--desktop-1280--light.png |
| ST-intake | mobile-375 | light | evidence/design-pass/ST-intake--mobile-375--light.png |
| ST-dang-tai | desktop-1280 | light | evidence/design-pass/ST-dang-tai--desktop-1280--light.png |
| ST-dang-tai | mobile-375 | light | evidence/design-pass/ST-dang-tai--mobile-375--light.png |
| ST-menu | desktop-1280 | light | evidence/design-pass/ST-menu--desktop-1280--light.png |
| ST-menu | mobile-375 | light | evidence/design-pass/ST-menu--mobile-375--light.png |
| ST-nhac | desktop-1280 | light | evidence/design-pass/ST-nhac--desktop-1280--light.png |
| ST-nhac | mobile-375 | light | evidence/design-pass/ST-nhac--mobile-375--light.png |
| ST-phuong-an-a | desktop-1280 | light | evidence/design-pass/ST-phuong-an-a--desktop-1280--light.png |
| ST-phuong-an-a | mobile-375 | light | evidence/design-pass/ST-phuong-an-a--mobile-375--light.png |

## Cảnh ngữ-cảnh

- evidence/design-pass/ST-menu--desktop-1280--light.png — điểm vào mới: menu người dùng mở, «Nhắc buổi sáng» đứng đầu.
- evidence/design-pass/ST-nhac--desktop-1280--light.png — điểm đến: trang Nhắc buổi sáng không có thanh bên Cài đặt.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Menu người dùng dùng biểu tượng chuông cho «Nhắc buổi sáng» → đổi sang `Alarm`: từ điển tránh «thông báo» vì người dùng đi tìm chuông trong app.
- Thẻ đầu trang Chung mang tiêu đề «Công ty» (chữ của từ điển cho đối tác trong mạng lưới) → «Không gian làm việc»; mô tả trang «Công ty bạn là ai» → «OneHub là ai». Đưa vào AC-7.
- Breadcrumb đẩy tiêu đề trang con xuống một dòng → AC-3 đo đỉnh tiêu đề trong từng cấp trang, mép trái trên mọi trang; hướng A giữ ở `ST-phuong-an-a` để người veto.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `packages/ui` chưa có `breadcrumb` — bản mẫu ráp tạm bằng `Link` và `<ol>`. Cài `breadcrumb` của shadcn vào `packages/ui` ở S3 (bậc 2 của «Vẽ tay là bậc cuối»), đo bằng AC-13.
- `NavItem` chưa có nhãn nhóm — bản mẫu ráp tạm bằng `<p>` có class. Thêm nhãn nhóm vào `nav-item.tsx` ở S3.
- `NavItem` chưa có kiểu hàng ngang cho khổ hẹp — bản mẫu đè `className="w-auto shrink-0"`. Thêm biến thể vào `nav-item.tsx` ở S3, để `settings-sidebar.tsx` không đè class (AC-13).
