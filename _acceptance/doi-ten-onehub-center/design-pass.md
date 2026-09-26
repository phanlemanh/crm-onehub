---
slug: doi-ten-onehub-center
at: 2026-09-26T11:10:00Z
route: http://localhost:3870/proto/doi-ten-onehub-center
material: scaffold
context: static-frame
context_scenes: []
reaction: nac-1 (anh-gui-kem-the-cong)
options:
divergence: skipped — chủ kho đã chốt hướng A trên ba ảnh mô phỏng ngày 26/09 (d-20260926T104902Z-1); hướng không mở lại
ds_skill: repo-tokens
states: [ST-sign-in-rong, ST-sign-in-loi, ST-sign-in-chi-mat-khau, ST-shell-khac, ST-dau-trang]
breakpoints: [mobile-375, desktop-1024, desktop-1440, desktop-1920]
themes: [light, dark]
patched: 1
deferred: 5
---
# design-pass — doi-ten-onehub-center

Bản mẫu ghép từ component thật của `@crm/ui` (`LogoLockup`, `Button`, `Field`, `Input`,
`Separator`, `Alert`). Hai thứ `packages/ui` chưa có — nền lưới chấm và đường nối giữa các bước —
vẽ tạm trong module bản mẫu bằng token (`--border`), nên vật liệu khai `scaffold`. Khung là bản
sao tĩnh lưới hai cột của `AuthShell` (`static-frame`), phủ **toàn màn hình** (`fixed inset-0`) để
né khung `max-w-5xl` của `/proto` — đúng lỗi gốc của vòng `cua-vao-dang-nhap`, nơi bản mẫu được
duyệt ở bề ngang hẹp hơn thật. Máy chủ riêng của cây này ở cổng 3870.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-sign-in-rong | mobile-375 | light | evidence/design-pass/ST-sign-in-rong--mobile-375--light.png |
| ST-sign-in-rong | mobile-375 (cả trang) | light | evidence/design-pass/ST-sign-in-rong--mobile-375--light-full.png |
| ST-sign-in-rong | mobile-375 | dark | evidence/design-pass/ST-sign-in-rong--mobile-375--dark.png |
| ST-sign-in-rong | desktop-1024 | light | evidence/design-pass/ST-sign-in-rong--desktop-1024--light.png |
| ST-sign-in-rong | desktop-1024 | dark | evidence/design-pass/ST-sign-in-rong--desktop-1024--dark.png |
| ST-sign-in-rong | desktop-1440 | light | evidence/design-pass/ST-sign-in-rong--desktop-1440--light.png |
| ST-sign-in-rong | desktop-1440 | dark | evidence/design-pass/ST-sign-in-rong--desktop-1440--dark.png |
| ST-sign-in-rong | desktop-1920 | light | evidence/design-pass/ST-sign-in-rong--desktop-1920--light.png |
| ST-sign-in-rong | desktop-1920 | dark | evidence/design-pass/ST-sign-in-rong--desktop-1920--dark.png |
| ST-sign-in-loi | desktop-1440 | dark | evidence/design-pass/ST-sign-in-loi--desktop-1440--dark.png |
| ST-sign-in-chi-mat-khau | desktop-1440 | light | evidence/design-pass/ST-sign-in-chi-mat-khau--desktop-1440--light.png |
| ST-shell-khac | desktop-1440 | light | evidence/design-pass/ST-shell-khac--desktop-1440--light.png |
| ST-shell-khac | desktop-1440 | dark | evidence/design-pass/ST-shell-khac--desktop-1440--dark.png |
| ST-dau-trang | desktop-1440 | light | evidence/design-pass/ST-dau-trang--desktop-1440--light.png |

## Cảnh ngữ-cảnh

- Không cần: nấc `static-frame` — khung hai cột của `AuthShell` bọc vật ngay trong mọi ảnh.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ở 1920 dòng neo 48px trông nhỏ giữa cột rộng ~1400px — nâng lên `text-6xl` từ khổ `2xl` (thang cỡ chữ sẵn có, không số mới).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `packages/ui` chưa có nền lưới — bản mẫu vẽ bằng lớp tuỳ ý trong module; S3 dựng `LuoiCham` ở `packages/ui/src/components` (đã có trong hợp đồng, AC-10).
- `StepperSeparator` của `reui/stepper` tô `bg-muted` — trùng màu nền cột trái (`bg-muted`), nên đường nối sẽ vô hình nếu dùng nguyên. Chế độ tĩnh của `StepList` cần đường màu `border` và đứt ở giữa hai chấm số như bản mẫu — sửa ở `packages/ui`, không ở chỗ gọi (AC-9).
- Khung `/proto` (`apps/app/app/proto/layout.tsx`) bóp mọi bản mẫu vào `max-w-5xl`; vòng này né bằng lớp phủ toàn màn hình. Đề xuất một cờ «tràn màn hình» trong `PROTO_CATALOG` — việc riêng, không thuộc vòng này.
- `design_pass.ds_skill: web-design-guidelines` không giải được thành skill nào trong phiên (lần thứ hai, sau `cua-vao-dang-nhap`); phiên chạy trên token của `packages/ui`. Chủ kho quyết: nhận token kho làm chuẩn, hay khai lại tên skill.
- Ở 1920 nửa phải cột trái vẫn là lưới trống vì khối nội dung giữ ≤576px và căn mép logo (AC-8). **Máy khuyên giữ** — một đường căn trái từ logo xuống ba bước là điểm neo đọc, và lưới chấm lấp khoảng thở; đường khác là căn giữa khối trong cột, đổi lại mất đường căn với logo.
