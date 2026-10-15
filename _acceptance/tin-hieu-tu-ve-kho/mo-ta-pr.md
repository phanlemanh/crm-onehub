## Tín hiệu tự về kho (TH1)

Mỗi ngày hai lần (21:00Z và 09:00Z) một lịch chạy của kho kéo tín hiệu về bằng một **khoá chỉ kéo tín hiệu** —
khoá chỉ làm được đúng việc đó, không đăng nhập được ở đâu. Thủ tục kéo về đóng dấu tín hiệu nên sáng hôm sau
người gửi thấy «Chờ gom» thay cho «Chờ lấy về», không ai chạy lệnh. Tệp kéo về lên **nhánh hàng chờ**
`tin-hieu/keo-ve` và một PR «Tín hiệu kéo về» đứng mở; lịch chạy không bao giờ gộp (lối A, Cổng Đáng 14/10).

Hồ sơ: `_acceptance/tin-hieu-tu-ve-kho/` · hàng TH1 của `docs/plan/lo-trinh-okr.json` (mã K1 · K2) · hạng T3
(khoá API, xác thực). Không migration.

### Cài một lần sau khi gộp (chủ kho)

1. Cài đặt → Khoá API → «Khoá dùng để: Chỉ kéo tín hiệu về kho» trên production.
2. Đặt hai bí mật kho `CRM_API_URL`, `CRM_KHOA_KEO_TIN_HIEU`.
3. Bật «Allow GitHub Actions to create and approve pull requests» (Settings › Actions › General).

### Gộp

- Gộp theo cửa sổ (đầu giờ UTC chẵn), điều phối xếp lô (#375). `vai-chi-okr.spec.ts` và `config.yaml` chỉ thêm
  dòng; `generated/server.ts` sinh lại.
- Đường kéo tay của LT2 (`tinHieu.keoVe`, `POST /rest/tin-hieu/keo-ve`) giữ nguyên.
- Kèm một sửa lỗi có sẵn: lỗi xác thực của thư viện ở controller Nest (`/auth/me`) nay trả đúng 401 thay vì 500.

### Khối giao diện mới — bậc đã dừng (`docs/design.md` «Vẽ tay là bậc cuối»)

- Mục «Khoá dùng để» trong tờ tạo khoá (`settings/api-keys/loai-khoa.tsx`, `to-tao-khoa.tsx`): dừng ở bậc 1 —
  `FieldSet`, `FieldLegend`, `RadioGroup`, `Field`, `FieldContent`, `FieldLabel`, `FieldDescription` của
  `packages/ui`; khuôn ghép theo `tai-lieu/hop-tai-nguon.tsx`. Không tra bậc 2–4: bậc 1 đủ.
- Nhãn «Chỉ kéo tín hiệu» trên danh sách: bậc 1 — `Badge variant="secondary"`.
- Lời dặn trong hộp khoá vừa tạo: bậc 1 — `Alert`, `AlertDescription`.
- Không thêm thành phần mới vào `packages/ui`.

### Bằng chứng

`_acceptance/tin-hieu-tu-ve-kho/evidence-report.md` — S4 vòng 3, 17/17 eval máy đạt, 7 lệnh kiểm toàn kho xanh,
hội đồng E11b đề xuất đạt; 14 mục ngoài hợp đồng chờ người quyết ở Cổng Bằng chứng.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
