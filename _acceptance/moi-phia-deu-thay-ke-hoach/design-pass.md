---
slug: moi-phia-deu-thay-ke-hoach
at: 2026-09-22T08:30:00Z
route: http://localhost:3300/proto/moi-phia-deu-thay-ke-hoach
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/ST-congty-codulieu--desktop-1280--light.png, evidence/design-pass/ST-tongquan-cobuoc--desktop-1280--light.png]
reaction: nac-1 (khong-dong-bo, ghim tren anh)
options:
divergence: skipped — năm bề mặt đều đi theo khuôn có sẵn (tab record sheet, mục DetailSheetSection, dòng thẻ Tasks, facet danh mục, hộp thoại màn Thành viên); ba lựa chọn hướng đã chốt trong brainstorm (d-1, d-2, d-3)
ds_skill: repo-tokens
states: [ST-congty-codulieu, ST-congty-rong, ST-congty-dangtai, ST-congty-loi, ST-congty-lechsua, ST-canhan-coghidanh, ST-tongquan-cobuoc, ST-tongquan-saphan, ST-danhmuc-cotnguoigiao, ST-chuyen-hoi, ST-chuyen-khongviec]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 1
deferred: 2
---
# design-pass — moi-phia-deu-thay-ke-hoach

Bản bấm được dựng bằng component thật của kho (`DetailSheet`, `SimpleTable`,
`Card`, `Dialog`, `Select`, `StatusIndicator`), dữ liệu giả, không đường ghi.
Nấc ngữ cảnh `static-frame`: tab mới đứng trong chính khung sheet Công ty với các
tab thật cạnh nó, và dòng bước đứng trong chính khung thẻ Tasks — nhưng không phải
host đang chạy với dữ liệu thật.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-congty-codulieu | desktop-1280 | light · dark | evidence/design-pass/ST-congty-codulieu--desktop-1280--{light,dark}.png |
| ST-congty-codulieu | mobile-375 | light | evidence/design-pass/ST-congty-codulieu--mobile-375--light.png |
| ST-congty-rong | desktop-1280 | light · dark | evidence/design-pass/ST-congty-rong--desktop-1280--{light,dark}.png |
| ST-congty-dangtai | desktop-1280 | light · dark | evidence/design-pass/ST-congty-dangtai--desktop-1280--{light,dark}.png |
| ST-congty-loi | desktop-1280 | light · dark | evidence/design-pass/ST-congty-loi--desktop-1280--{light,dark}.png |
| ST-congty-lechsua | desktop-1280 | light · dark | evidence/design-pass/ST-congty-lechsua--desktop-1280--{light,dark}.png |
| ST-canhan-coghidanh | desktop-1280 | light · dark | evidence/design-pass/ST-canhan-coghidanh--desktop-1280--{light,dark}.png |
| ST-tongquan-cobuoc | desktop-1280 | light · dark | evidence/design-pass/ST-tongquan-cobuoc--desktop-1280--{light,dark}.png |
| ST-tongquan-cobuoc | mobile-375 | light | evidence/design-pass/ST-tongquan-cobuoc--mobile-375--light.png |
| ST-tongquan-saphan | desktop-1280 | light · dark | evidence/design-pass/ST-tongquan-saphan--desktop-1280--{light,dark}.png |
| ST-danhmuc-cotnguoigiao | desktop-1280 | light · dark | evidence/design-pass/ST-danhmuc-cotnguoigiao--desktop-1280--{light,dark}.png |
| ST-danhmuc-cotnguoigiao | mobile-375 | light | evidence/design-pass/ST-danhmuc-cotnguoigiao--mobile-375--light.png |
| ST-chuyen-hoi | desktop-1280 | light · dark | evidence/design-pass/ST-chuyen-hoi--desktop-1280--{light,dark}.png |
| ST-chuyen-hoi | mobile-375 | light | evidence/design-pass/ST-chuyen-hoi--mobile-375--light.png |
| ST-chuyen-khongviec | desktop-1280 | light · dark | evidence/design-pass/ST-chuyen-khongviec--desktop-1280--{light,dark}.png |

## Cảnh ngữ-cảnh

- `ST-congty-codulieu--desktop-1280--light.png` — tab «30 ngày đầu» nằm sau «Thoả thuận» trong cùng thanh tab của sheet Công ty, cùng kiểu nhãn và số đếm.
- `ST-tongquan-cobuoc--desktop-1280--light.png` — dòng bước xen giữa dòng việc trong cùng bảng của thẻ Tasks; bước quá hạn chấm đỏ, bước hôm nay và sắp hạn chấm trung tính.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Bảng kế hoạch trong tab «30 ngày đầu» tràn ngang ở khổ 375 → ẩn cột Ngày, Đang tắc ở, Cầm trịch dưới khổ `sm`, giữ Kế hoạch và Bước, đúng dòng hành vi của design doc.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Thanh tab sáu mục ở khổ 375.** Sheet Công ty nay có sáu tab; ở 375 tab «30 ngày đầu» nằm sát mép phải và phần số đếm bị cắt, người phải cuộn ngang thanh tab mới thấy. `DetailSheetTabs` là component chung của mọi sheet; sửa ở đó cho cả họ, không vá riêng sheet Công ty. Lượt này không đổi component chung.
- **Nấc DS:** `design_pass.ds_skill` khai `web-design-guidelines`, nhưng đó là skill rà mã đã có trong `.agents/skills`, không phải chuẩn thiết kế; phiên chạy trên nấc 2 — từ vựng token của kho (`/packages/ui` + `docs/design.md`). Cùng ghi chú với lượt 1; chưa ai quyết.
