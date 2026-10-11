# Quét độ phủ — okr-mau-xoa-cuoc-soan

## Ngữ cảnh
- Sản phẩm: CRM OneHub, bộ OKR mẫu «Hải Đăng Logistics» (`bun run okr:mau`) — chân sản phẩm: đào repo [SUY-TỪ-REPO: docs/setup.md «Bộ OKR mẫu»] [SUY-TỪ-REPO: apps/api/scripts/okr-mau/nap.ts] [SUY-TỪ-REPO: packages/db/prisma/schema.prisma] · chân ngành: lệnh dựng/gỡ dữ liệu mẫu của khung web — [NGÀNH: Laravel `migrate:fresh --seed`], [NGÀNH: Django `manage.py flush`]: gỡ dữ liệu mẫu phải gỡ cả hàng do sản phẩm ghi lên đó sau khi gieo, nếu không lần gieo kế va vào hàng cũ.

## Trục
- **A — loại hàng sinh ra khi dùng tính năng soạn trên bộ mẫu:** `okrCuocSoan` | `okrDeXuat` có `cuocSoanId` (mọi trạng thái: chờ, nhận, sửa, bác, bị loại) | `aiChiPhi` `tinhNang = okr.soan` | `agentEvent` của phiên soạn | `okrTrail` `soan-okr:` | Mục tiêu do «Đưa vào bộ OKR» tạo   [thước CE: `docs/agent.md` — tác tử soạn khai đúng bốn bảng được ghi (`okrDeXuat`, `okrCuocSoan`, `aiChiPhi`, `agentEvent`); `docs/api.md` — `soanDuaVao` ghi Mục tiêu, KR, vết]
- **B — đường gỡ:** `--xoa` | nạp lại (xoá bộ cũ trong cùng giao dịch) | nạp hỏng tự dọn (`napBoOkrMau` gọi `xoaBoOkrMau`)   [thước CE: `nap.ts` — ba lời gọi `xoaTrong`, không đường thứ tư]
- **C — trạng thái kho lúc gỡ:** bộ mẫu đủ, có cuộc soạn | chỉ còn cuộc mồ côi (bộ mẫu đã gỡ bằng bản cũ — đúng ca tái hiện 2026-10-10) | có cuộc soạn không thuộc bộ mẫu | dữ liệu ngoài đang giữ người mẫu (mã 5)   [thước CE: mã thoát ở `docs/setup.md` + ca tái hiện của người]

## Core
1. A1 × B1 × C1 — `--xoa` gỡ cuộc soạn có cột trỏ chu kỳ, đơn vị hay người mẫu (lỗi gốc).
2. A2 × B1 × C1 — đề xuất của các cuộc đó đi theo, mọi trạng thái (objectiveId của chúng là chuỗi rỗng, nên đường xoá theo Mục tiêu cũ không chạm tới).
3. A1+A2 × B2 × C1 — nạp lại gỡ cuộc cũ, không để cuộc trỏ vào chu kỳ vừa nạp lại.
4. A1 × B1 × C2 — cuộc mồ côi từ lần xoá cũ được gỡ và đếm; không thì kho đang có lỗi vẫn giữ lỗi.
5. A1 × B1 × C3 — cuộc soạn ngoài bộ mẫu đứng nguyên (không xoá thừa).
6. A1 × B1 × C4 — mã 5: không hàng nào đổi, kể cả cuộc soạn.
7. A3 × B1 — giữ `aiChiPhi`: nó là tiền đã tiêu thật và là nguồn của trần chi phí tháng (`chiTieuKhung` đọc theo `at`).
8. Số đếm in ra có cuộc soạn và đề xuất soạn.

## Later
- A1 × B3 — nạp hỏng tự dọn: cùng hàm `xoaTrong` với B1, phủ gián tiếp; không viết ca riêng.
- A6 — Mục tiêu do «Đưa vào bộ OKR» (và chốt hỏi ý) tạo trong chu kỳ mẫu mang mã không có tiền tố `mau-okr-`, nên `--xoa` từ chối mã 3. Lỗi khác, việc riêng.

## Never
- A4 `agentEvent` — không cột nào trỏ mã mẫu; là nhật ký vận hành, giữ như `aiChiPhi`.
- A5 `okrTrail soan-okr:` — đã đi theo `cycleId`/`objectiveId` ở đường xoá vết hiện có.
- Xoá `aiChiPhi` — hạ số đã tiêu của tháng, mở lại trần chi phí giả.

## Cross-cutting áp mọi ô Core
- Một giao dịch: gỡ hỏng thì không hàng nào đổi.
- `demThamChieu` (quét mọi cột `id`/`*Id`) phải về rỗng sau khi gỡ.
