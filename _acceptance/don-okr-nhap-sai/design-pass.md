---
slug: don-okr-nhap-sai
at: 2026-10-06T23:13:52Z
route: http://localhost:3210/proto/don-okr-nhap-sai
material: real-components
context: static-frame
context_scenes: []
reaction: nac-1 (anh gui kem the Cong Pham vi)
options:
divergence: skipped — danh sách mục tiêu và ngăn chi tiết giữ nguyên khuôn; nhóm gập «Đã bỏ (n)» theo đúng mảnh ArchivedList đã có ở khuôn kế hoạch và cây tổ chức; không có hướng thứ hai đáng bày
ds_skill: web-design-guidelines
states: [ST-donvi-dabo-dong, ST-donvi-dabo-mo, ST-donvi-chi-dabo, ST-cuatoi-dabo-dong, ST-ngan-nhap-sach, ST-ngan-co-lich-su, ST-ngan-da-bo, ST-ngan-hoi-xoa]
breakpoints: [mobile-375, desktop-1280]
themes: [dark]
patched: 1
deferred: 1
---
# design-pass — don-okr-nhap-sai

Bản mẫu dựng bằng component thật của `packages/ui` (`SimpleTable` với kiểu dòng `sub`
cho mục tiêu đã bỏ, `Collapsible`, `Badge`, `Sheet`, `DropdownMenu`, `ConfirmDialog`),
trong khung ứng dụng tĩnh của bản mẫu OKR chung (`ban-mau-okr/phan-chung.tsx`). Dữ liệu
giả, không đường ghi. Chụp bằng puppeteer ở `localhost` (mở bằng `127.0.0.1` thì Next
chặn tài nguyên dev và phần phía trình duyệt không chạy). 16 ảnh, không ảnh nào tràn
ngang.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-donvi-dabo-dong | mobile-375 | dark | evidence/design-pass/ST-donvi-dabo-dong--mobile-375.png |
| ST-donvi-dabo-dong | desktop-1280 | dark | evidence/design-pass/ST-donvi-dabo-dong--desktop-1280.png |
| ST-donvi-dabo-mo | mobile-375 | dark | evidence/design-pass/ST-donvi-dabo-mo--mobile-375.png |
| ST-donvi-dabo-mo | desktop-1280 | dark | evidence/design-pass/ST-donvi-dabo-mo--desktop-1280.png |
| ST-donvi-chi-dabo | mobile-375 | dark | evidence/design-pass/ST-donvi-chi-dabo--mobile-375.png |
| ST-donvi-chi-dabo | desktop-1280 | dark | evidence/design-pass/ST-donvi-chi-dabo--desktop-1280.png |
| ST-cuatoi-dabo-dong | mobile-375 | dark | evidence/design-pass/ST-cuatoi-dabo-dong--mobile-375.png |
| ST-cuatoi-dabo-dong | desktop-1280 | dark | evidence/design-pass/ST-cuatoi-dabo-dong--desktop-1280.png |
| ST-ngan-nhap-sach | mobile-375 | dark | evidence/design-pass/ST-ngan-nhap-sach--mobile-375.png |
| ST-ngan-nhap-sach | desktop-1280 | dark | evidence/design-pass/ST-ngan-nhap-sach--desktop-1280.png |
| ST-ngan-co-lich-su | mobile-375 | dark | evidence/design-pass/ST-ngan-co-lich-su--mobile-375.png |
| ST-ngan-co-lich-su | desktop-1280 | dark | evidence/design-pass/ST-ngan-co-lich-su--desktop-1280.png |
| ST-ngan-da-bo | mobile-375 | dark | evidence/design-pass/ST-ngan-da-bo--mobile-375.png |
| ST-ngan-da-bo | desktop-1280 | dark | evidence/design-pass/ST-ngan-da-bo--desktop-1280.png |
| ST-ngan-hoi-xoa | mobile-375 | dark | evidence/design-pass/ST-ngan-hoi-xoa--mobile-375.png |
| ST-ngan-hoi-xoa | desktop-1280 | dark | evidence/design-pass/ST-ngan-hoi-xoa--desktop-1280.png |

## Cảnh ngữ-cảnh

- Không cần: bản mẫu đặt trong khung ứng dụng OKR tĩnh (thanh trên, thanh bên, tab
  OKR), người duyệt thấy vật nằm đúng chỗ trên màn «Theo đơn vị».

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Dòng mục tiêu đã bỏ bỏ nhãn loại «Cam kết/Tham vọng»: trong dòng đã mờ (`sub`), nhãn
  viền vẫn sáng và kéo mắt về dòng không còn dùng.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- `Badge` chưa có biến thể «tắt» (nền mờ, chữ mờ, không viền). Bản mẫu dùng `ghost`,
  khác hẳn «Nháp» (`outline`) nhưng chữ «Đã bỏ» hơi lơ lửng vì `ghost` không có nền.
  Đề xuất thêm `variant="muted"` vào `packages/ui/src/components/badge.tsx` ở S3 và
  dùng cho «Đã bỏ»; không thêm thì giữ `ghost`.
