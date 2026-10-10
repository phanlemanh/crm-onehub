---
slug: dien-thoai-o-deal-cong-ty
at: 2026-10-09T21:52:00Z
verdict: findings
p0: 0
p1: 2
p2: 3
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals, contract | Ô `deal-bang-375` chỉ kiểm chữ số nằm trong khung ô, không kiểm chữ bị cắt hay xuống dòng | Cột Điện thoại hẹp ở 375 làm số hiện «0901 234…» hoặc gãy hai dòng; E3 vẫn xanh vì rect chữ nằm trong ô | scrollWidth ≤ clientWidth và chiều cao bằng một dòng; chiều đỏ ép cột còn 8% | fixed: AC-3 thêm «ở khổ 375 số hiện đủ trên một dòng, không bị cắt»; ô `deal-bang-375` đo scrollWidth/clientWidth và chiều cao một dòng; chiều đỏ ghim «so bi cat o 375» |
| P1 | evals | AC-6 hứa tiêu đề «Phone» cho cả hai bảng nhưng ma trận chỉ có ô tiếng Anh của bảng thoả thuận | Tab Cá nhân của công ty quên khoá dịch, tiếng Anh vẫn hiện «Điện thoại»; E6 xanh | Thêm ô `cong-ty-bang-en-1440`, ma trận 6/6 | fixed: ma trận 6 ô, E6 đọc thêm dòng «DUNG cong-ty-bang-en-1440» |
| P2 | evals | E1/E2 so dữ liệu service, không qua schema output của router — khoá `phone` bị zod lọc ở router vẫn xanh | Service trả phone nhưng `dealContactSummaryOutput` thiếu khoá, app nhận undefined | Parse bằng chính schema output; R tạo qua `ContactsService.create` với số thật; chiều đỏ bỏ phone khỏi schema | fixed: E1/E2 parse bằng `dealByIdOutput`, schema output của contactOptions và `companyDetailOutput`; R có số «0901 234 569»; chiều đỏ thêm bản sao schema bỏ phone |
| P2 | evals | E7 grep chỉ đòi chữ «SoDienThoai» có trong diff — dòng import cũng thoả | Tệp import SoDienThoai nhưng ô vẫn in `phone` thô hoặc `.replace` tay | Mỗi tệp ≥ 1 dòng JSX `<SoDienThoai`, không dòng thêm nào `.replace(`/`.slice(` trên phone | fixed: `rang/dung-so-chung.mjs` đếm dòng JSX theo từng tệp, chặn tự định dạng; chiều đỏ `--tu-thu` ghim «dung-so-chung: tu dinh dang so» |
| P2 | evals | `paths` của vài eval thiếu tệp chúng thật sự phụ thuộc | Sửa `so-dien-thoai.tsx` hay `deals/**` không làm hoá cũ bằng chứng E3/E4/E5b | Thêm paths | fixed: E3/E4 thêm `so-dien-thoai.tsx`, E4 thêm `record-sheet.ts`, E5b thêm `apps/api/src/deals/**`, E6 thêm `deal-sheet.tsx` và `company-sheet.tsx` |
