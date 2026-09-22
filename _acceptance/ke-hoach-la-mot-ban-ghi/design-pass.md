---
slug: ke-hoach-la-mot-ban-ghi
at: 2026-09-22T04:40:00Z
route: http://localhost:3300/proto/ke-hoach-la-mot-ban-ghi
material: real-components
context: standalone
context_scenes: [evidence/design-pass/canh-canh-nhau--desktop-1280--light.png, evidence/design-pass/canh-thoa-thuan-that--desktop-1280--light.png, evidence/design-pass/canh-thoa-thuan-that--desktop-1280--dark.png]
reaction: nac-1 (ghim)
options:
divergence: skipped — khuôn có sẵn: họ record sheet của Công ty · Cá nhân · Thoả thuận; hướng A đã chốt trong brainstorm 2026-09-22 (d-20260922T040054Z-3)
ds_skill: repo-tokens
states: [ST-kehoach-codulieu, ST-kehoach-quahan, ST-kehoach-dangghi, ST-kehoach-khongbuoc, ST-kehoach-dadong, ST-kehoach-dangtai, ST-kehoach-loi, ST-kehoach-phieurong, ST-kehoach-phieu80, ST-kehoach-hoatdong]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 4
deferred: 5
---
# design-pass — ke-hoach-la-mot-ban-ghi

Bản mẫu ghép từ **component thật** của kho: `DetailSheet`, `DetailSheetHeader`,
`DetailSheetStats`, `DetailSheetTabs`, `DetailSheetSection`,
`DetailSheetProperties`, `DetailSheetEmpty` (`apps/app/components/detail-sheet.tsx`)
và `@crm/ui` theo subpath. Sheet mở chồng lên một bảng danh mục giả, như khi mở
từ danh mục thật. Dữ liệu giả, không đường ghi, không tRPC (`docs/proto.md`).

Tab Hoạt động trong bản mẫu là phác: bản thật dùng thẳng `Timeline` có sẵn cùng
composer ghi chú, nên bố cục dòng ở tab này sẽ là bố cục của `Timeline`, không
phải của bản mẫu.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-kehoach-codulieu | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-kehoach-codulieu--*.png |
| ST-kehoach-quahan | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-kehoach-quahan--*.png |
| ST-kehoach-dadong | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-kehoach-dadong--*.png |
| ST-kehoach-phieu80 | desktop-1280 · mobile-375 | light · dark | evidence/design-pass/ST-kehoach-phieu80--*.png |
| ST-kehoach-dangghi | desktop-1280 | light · dark | evidence/design-pass/ST-kehoach-dangghi--*.png |
| ST-kehoach-khongbuoc | desktop-1280 | light · dark | evidence/design-pass/ST-kehoach-khongbuoc--*.png |
| ST-kehoach-dangtai | desktop-1280 | light · dark | evidence/design-pass/ST-kehoach-dangtai--*.png |
| ST-kehoach-loi | desktop-1280 | light · dark | evidence/design-pass/ST-kehoach-loi--*.png |
| ST-kehoach-phieurong | desktop-1280 | light · dark | evidence/design-pass/ST-kehoach-phieurong--*.png |
| ST-kehoach-hoatdong | desktop-1280 | light · dark | evidence/design-pass/ST-kehoach-hoatdong--*.png |

28 ảnh, chụp bằng `scripts/ui-capture.mjs` của kho (`--theme light|dark`).

## Cảnh ngữ-cảnh

- `canh-canh-nhau--desktop-1280--light.png` — sheet thoả thuận THẬT (dựng từ cây
  này, API 3301, phiên dev, bản ghi `seed-deal-stripe-0`) đặt cạnh sheet kế hoạch
  bản mẫu, cùng khổ 1280. Đây là cảnh vòng một bỏ và là gốc của lệch. Đọc được
  trên ảnh: cùng vị trí đầu sheet, cùng dải bốn ô số, cùng thanh tab, cùng tiêu
  đề mục chữ hoa nhỏ và cặp nhãn–giá trị.
- `canh-thoa-thuan-that--desktop-1280--{light,dark}.png` — hai ảnh gốc của sheet
  thoả thuận thật để soi riêng.
- Storyboard vào–ra: luồng vào là bấm hàng danh mục; màn danh mục thật ở máy này
  chỉ hiện «chưa có khuôn» vì cơ sở dữ liệu cục bộ không có kế hoạch, nên không
  làm cảnh được. Bản mẫu vẽ sheet chồng lên bảng danh mục giả thay cho cảnh đó;
  cảnh thật của luồng vào sẽ do E17 chụp ở S4 trên dữ liệu gieo.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Huy hiệu «Quá hạn» đứng sau ngày hạn đẩy lệch cột người và hạn giữa các dòng → dời lên sát nhãn bước; cột người và hạn thẳng hàng lại.
- Dòng phụ lặp «One Mount» ngay dưới tiêu đề «One Mount» (chữ thừa theo luật nhãn) → thay bằng liên kết «Hồ sơ công ty».
- Mục đầu tab Bước tên «Kế hoạch» trong khi sheet thoả thuận gọi mục cùng vai là «Chi tiết» → đổi thành «Chi tiết»; design doc sửa theo.
- Nút gỡ trên từng hàng môi giới dùng biểu tượng `⋯` (nghĩa «thêm thao tác») cho một việc gỡ → đổi sang `Close`, như nút gỡ ở tab Contacts của thoả thuận.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Hai chữ cho cùng một vai.** Thoả thuận gọi người sở hữu bản ghi là «Phụ trách», kế hoạch gọi «Cầm trịch» (vòng một chọn có chủ ý: một người điều phối nhiều bộ phận). Đặt cạnh nhau thì người dùng thấy hai chữ. Lượt này phải viết mục `CONTEXT.md` cho nó — người duyệt quyết: giữ «Cầm trịch» kèm lý do trong từ điển, hay dùng chung «Phụ trách».
- **`DetailSheetStat` cắt chữ ở khổ 375.** Ô «Cầm trịch» còn «Cầm trị…» và tên người còn «Pha». Đây là component chung; sheet thoả thuận có cùng bốn ô nên nhiều khả năng cắt y hệt. Sửa ở `components/detail-sheet.tsx` cho cả họ, không vá riêng sheet kế hoạch.
- **Bảng môi giới sáu cột tràn ngang ở 375.** Hai hướng: ẩn bốn cột bậc ở khổ hẹp và thay bằng một ô «x/4 bậc», hoặc giữ nguyên và chấp nhận cuộn ngang. Design-pass vòng một đã nêu cùng câu hỏi: cần biết người dùng thật có mở màn này trên điện thoại không.
- **Tiêu đề cột bậc cuộn đi mất ở 80 dòng.** `SimpleTable` không có biến thể dính đầu; thêm biến thể phải làm ở `/packages/ui`. Design doc đã sửa để không hứa điều đó.
- **Phễu bốn bậc vẫn ghép tại chỗ bằng bốn thanh `Progress`.** Nợ ghi từ design-pass vòng một, giữ nguyên ở lượt này (Out of scope của hợp đồng).

Nhóm 2 cũng mang một dòng theo thang DS: `design_pass.ds_skill` khai
`web-design-guidelines`, nhưng đó là skill **rà soát mã đã có** chứ không phải
chuẩn thiết kế, nên phiên chạy trên nấc 2 — từ vựng token của kho
(`packages/ui` + `docs/design.md`). Cùng ghi chú với vòng một; chưa ai quyết.
