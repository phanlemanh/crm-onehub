---
slug: va-gantt-lich-bay-ngay
preset: test-matrix
at: 2026-10-19
---

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub — chân sản phẩm: đào repo (`CONTEXT.md` mục «Lịch làm việc», «Phụ thuộc (việc)»,
  «Mốc (dự án)»; `docs/api.md` mục «Dự án»; `packages/db/src/du-an.ts`, `lich-lam-viec.ts`, `viec-ghi.ts`,
  `du-an-ghi.ts`; sổ `_acceptance/du-an-gantt/decisions.jsonl` dòng 61, 66, 67 — Ngoài-3, Ngoài-8, Ngoài-9) · chân
  ngành: lịch làm việc của công cụ Gantt `[NGÀNH: Microsoft Project — Change Working Time, mọi ngày đều có thể đặt là
  ngày làm việc]`, `[NGÀNH: Smartsheet — Project Settings › Working Days, bỏ chọn ngày nào thì ngày đó thành ngày làm]`.

## Trục

Bài toán là hai lỗi tách được, nên hai ma trận, mỗi ma trận hai trục.

### Ma trận L — lịch ngày nghỉ trong tuần

- **L-A. Trạng thái đã lưu:** chưa có cài đặt · có cài đặt nhưng chưa từng đặt lịch (dữ liệu trước vòng này, ô trống) ·
  đã đặt khác rỗng (vd T7, CN; chỉ CN) · đã đặt rỗng (không nghỉ ngày nào)
  [thước CE: `docs/api.md` mục «Lịch làm việc» `[SUY-TỪ-REPO: docs/api.md]` · migration
  `20261016120000_du_an_gantt` thêm cột với mặc định mảng rỗng `[SUY-TỪ-REPO: packages/db/prisma/migrations/20261016120000_du_an_gantt/migration.sql]`
  · chân ngành Microsoft Project, Smartsheet: «không nghỉ ngày nào» là một lịch hợp lệ]
- **L-B. Đường đọc lịch:** `lichLamViec.get` (màn Cài đặt) · `duAn.lich` (Gantt) · tự dời và luật phụ thuộc
  (`congNgayLam`, `ngayLamKe` qua `docLichLam`) · nút Hoàn tác (ghi lại giá trị cũ)
  [thước CE: mọi chỗ gọi `docLichLam` — grep 19/10 `[SUY-TỪ-REPO: packages/db/src/du-an.ts]`]

16 ô, mọi ô có nghĩa.

### Ma trận T — trần 300 việc

- **T-A. Thao tác:** tạo việc trong dự án · thêm việc con · chuyển việc từ ngoài vào · thêm mốc · sửa mốc · xoá mốc ·
  thêm phụ thuộc · gỡ phụ thuộc · đổi ngày việc (tự dời)
  [thước CE: mọi chỗ gọi `docDuAnMo` và `apLich` — grep 19/10 `[SUY-TỪ-REPO: packages/db/src/viec-ghi.ts]`,
  `[SUY-TỪ-REPO: packages/db/src/du-an-ghi.ts]`]
- **T-B. Trạng thái dự án:** mở, 299 việc · mở, đủ 300 việc · đã đóng
  [thước CE: `DU_AN.viecToiDa`, «Dự án đã đóng.» trong `docs/api.md` mục «Vòng đời»]

27 ô, mọi ô có nghĩa: ô «thêm việc» × 300 phải từ chối, ô «mốc, phụ thuộc, đổi ngày» × 300 phải thành công, ô «đã đóng»
giữ luật cũ.

## Core (≤20% số nhóm hành vi)

Ô của một ma trận nhỏ đều rẻ khi đo bằng một bảng viết trước, nên Core tính theo nhóm hành vi, không theo ô.

1. L·đã đặt rỗng × mọi đường đọc — không ngày nghỉ nào, kể cả tải lại. → AC-1, AC-3
2. L·chưa có cài đặt, chưa từng đặt × mọi đường đọc — mặc định T7, CN; dữ liệu cũ đã đặt giữ nguyên. → AC-2
3. L·Hoàn tác giữa rỗng và khác rỗng, bấm trên màn thật. → AC-4
4. T·mốc × đủ 300. → AC-5
5. T·phụ thuộc, đổi ngày × đủ 300. → AC-6
6. T·thêm việc (ba đường) × 299 và 300, kể cả hai người tranh việc thứ 300; mọi thao tác × đã đóng. → AC-7
7. Lớp nhìn thấy — màn Cài đặt và Gantt khi lịch không ngày nghỉ. → AC-8

## Later

- L·chọn đủ bảy ngày nghỉ — hợp đồng `datNgayNghiTuan` chặn ở sáu; lịch không ngày làm nào thì tự dời không có chỗ đặt.
- Câu báo trên màn Cài đặt «Không nghỉ ngày nào trong tuần» khi bỏ chọn hết — màn đã hiện đúng bảy ô không chọn.
- Hạt giống ô chọn «Dự án» bị cắt ở khổ 375 (`docs/plan/2026-10-19-hat-giong-o-chon-du-an-375.md`) — hàng riêng.

## Never

- Lưu «không nghỉ ngày nào» bằng mã giả trong mảng (vd `[0]`) — trái luật «schema mô tả đúng cái được lưu» của
  `AGENTS.md`.

## Cross-cutting áp mọi ô Core

- Lời từ chối giữ đúng chữ đã có (`DU_AN.thongDiep.viecToiDa`, `DU_AN.thongDiep.daDong`).
- Không đổi luật thấy việc, không đổi vết dự án hay vết việc ngoài các thao tác đang đo.
