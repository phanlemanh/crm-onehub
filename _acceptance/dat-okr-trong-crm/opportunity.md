---
schema_version: 1
slug: dat-okr-trong-crm
feature: Khu OKR trong CRM — quản trị mở chu kỳ năm và quý; mỗi cấp đặt mục tiêu với KR đủ sáu kiểu, căn chỉnh vào cấp trên, công bố; nhập bộ OKR quý 4 từ bảng tính có xem trước; mọi sửa đổi để lại vết
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Manh Phan — uỷ quyền phiên điều phối 2026-09-24
decided_at: 2026-09-25T03:40:00Z
prototype:
  base_commit: 9a7f024ca172317f4c893597e75b60e95c3965c5
  disposition: keep
---

## Vấn đề & ai gặp

Lộ trình OKR (`docs/plan/lo-trinh-okr.md`, chốt 2026-09-24) đưa **mọi phòng ban**
vào CRM từ 2026-10-26 để đặt và cập nhật OKR quý 4. Hôm nay CRM không có chỗ nào
để đặt một mục tiêu: OKR của OneHub sống trong bảng tính rời của từng phòng ban,
không căn chỉnh được vào cấp trên, không ai biết bộ nào đã công bố, và sửa một con
số không để lại vết. Hai lượt trước đã dựng nền: cây tổ chức có người và trưởng
(#120, #128) và vai «chỉ OKR» cho người ngoài khối kinh doanh (#129). Lượt này là
lượt đầu tiên người dùng *đặt được* một bộ OKR trong CRM.

**Người gặp:** trưởng phòng ban và trưởng bộ phận (đặt mục tiêu, gắn KR, công bố
cho đơn vị mình — hôm nay làm trong bảng tính rồi gửi lên); ban lãnh đạo (đặt OKR
cấp OneHub để các đơn vị căn chỉnh vào); người phụ trách KR (sửa KR của mình);
quản trị chương trình (mở chu kỳ, cấu hình chương trình, nhập bộ OKR quý 4 từ
bảng tính cho phòng ban chưa quen CRM).

Vật liệu nền: mục 5 «Lượt 3» của lộ trình; từ điển `CONTEXT.md` (Mục tiêu, KR,
Chu kỳ, Căn chỉnh, Người phụ trách, Trưởng đơn vị, Phạm vi dữ liệu); bản mẫu đã
duyệt `_acceptance/ban-mau-okr/design-pass.md` (mục «Duyệt» 2026-09-24); hồ sơ
lượt 1 và 2 đã ký.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Trưởng đơn vị (ô `headUserId` trên đơn vị) là người đủ để quyết «ai sửa OKR của đơn vị» — không cần vai OKR riêng | Phải thêm vai hoặc bảng phân quyền OKR riêng, chạm lại lượt 2 | `CONTEXT.md` mục «Trưởng đơn vị» chốt 2026-09-24: «Trong OKR, trưởng sửa được OKR của đơn vị mình và đơn vị con» | Đã chốt ở từ điển |
| 2 | Bộ OKR quý 4 hiện có của các phòng ban đưa được vào CRM bằng một bảng tính phẳng (mỗi dòng một KR, mục tiêu lặp tên) mà không phải sửa quá một lần | Phòng ban nhập đi nhập lại, bỏ CRM về bảng tính | Xem trước báo từng dòng hỏng trước khi ghi; ngưỡng «không bộ nào nhập lại quá một lần» đo ở Cổng Giá trị | Sẽ thử ở S4 và đo sau ship |
| 3 | Sáu kiểu KR (tăng tới · giảm xuống · giữ trên · giữ dưới · mốc · phần trăm — sổ quyết định d-1) phủ mọi KR trong bộ quý 4 hiện có | KR không nhập được, phải vặn thành kiểu khác — số đọc sai nghĩa | Rà bộ OKR quý 4 thật khi nhập ở tuần 2026-10-26; lượt này giữ kiểu là danh mục cố định trong mã, thêm kiểu là một vòng nhỏ | [đề xuất] chưa thử — quyết ở Cổng Phạm vi |
| 4 | Cây tổ chức của lượt 1 (`org.tree`) là đủ để chọn đơn vị và suy quyền — OKR không cần cây riêng | Phải dựng cây thứ hai, trái nguyên tắc «một cây cho cả CRM» | `org.tree` đã trả trưởng bộ phận, trưởng phòng ban, người và độ phủ (#120) | Đã đọc mã: đủ |
| 5 | Vai «chỉ OKR» đọc và ghi OKR qua cơ chế khai nhóm dữ liệu `okr` của lượt 2 mà không phải sửa lớp chặn | Phải mở lớp chặn — chạm T3 của lượt 2 | `PhamViOkrMiddleware` đã có, `docDuocPhamVi("okr","okr") === true` | Đã đọc mã: đủ |

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: sau ngày mở (2026-10-26), các phòng ban có đưa được bộ OKR quý 4 của mình vào CRM và công bố mà không phải làm lại không?
- Kết quả nào là SỐNG: đến 2026-11-02, **mọi phòng ban** chưa lưu trữ có ít nhất một mục tiêu đã công bố trong chu kỳ quý 4 ở pha «Đang chạy» (số từ bảng mục tiêu nối bảng phòng ban, trạng thái = công bố, chu kỳ = Q4-2026); và **không bộ nào phải nhập lại quá một lần** (số từ vết OKR: số lượt «nhập từ bảng tính» ghi thành công cho cùng một đơn vị trong cùng chu kỳ ≤ 2).
- Kết quả nào là CHẾT: ≥ 1 phòng ban chưa có mục tiêu công bố sau 2026-11-02 vì công cụ (không phải vì chưa có OKR); hoặc ≥ 1 đơn vị nhập từ bảng tính từ 3 lần trở lên; hoặc phải sửa cơ sở dữ liệu tay để mở chu kỳ hay công bố.
- Timebox: đo ở phiên nghiệm thu R1 ngày 2026-11-13 (mục 6 lộ trình), số lấy tại 2026-11-02.

## Kết quả prototype

Bản mẫu bốn màn `/proto/ban-mau-okr` đã duyệt ngày 2026-09-24 (PR #113, hồ sơ
`_acceptance/ban-mau-okr`, 23 trạng thái, 58 ảnh, nấc phản ứng nac-1). Bốn chỗ mở
đã chốt: mức tự tin ba bậc; cây căn chỉnh nằm trong «Theo đơn vị» với nút Danh
sách / Cây; heatmap theo đơn vị × tuần; mọi vai thấy «Toàn cảnh». Lượt này dựng
theo bản mẫu đó; không dựng lại thẩm mỹ.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Kiểu dữ liệu mẫu và phần dùng chung của bản mẫu OKR | `apps/app/app/proto/_modules/ban-mau-okr/` (trong kho) | triết-lý/logic (hình dạng dữ liệu) + hình thái đã duyệt ở design-pass | có | Manh Phan 2026-09-24 (duyệt bản mẫu) |
| Khuôn nhập bảng tính xem-trước-rồi-ghi | `apps/api/src/to-chuc/nhap.ts`, `settings/organization/hop-thoai-nhap.tsx` (trong kho) | triết-lý/logic | có | — |
| Khuôn quyền theo bản ghi trong service | `apps/api/src/agent/agent-access.service.ts` (trong kho) | triết-lý/logic | có | — |
| Sáu kiểu KR theo bốn phép đo số + hai phép đo mốc | Thực hành OKR phổ biến ở công cụ cùng loại (Perdoo, Weekdone: increase to / decrease to / stay above / stay below / milestone) | triết-lý/logic | có (ứng viên, chốt ở Cổng Phạm vi) | — |

Không có vật liệu ngôn-ngữ-thiết-kế nào ngoài kho: giao diện ghép từ `packages/ui`
theo bản mẫu đã duyệt.

## Cổng 0

- **decision = build.** Căn cứ: lộ trình OKR mục 5 «Lượt 3» và mục 6 — tuần 2026-10-26 các phòng ban phải có bộ OKR quý 4 trong CRM; chủ kho chốt 2026-09-24, uỷ quyền phiên điều phối ký các cổng của lượt ngày 2026-09-24.
- **disposition = keep.** Căn cứ: bản mẫu `/proto/ban-mau-okr` đã ở trên `onehub` (#113) và ở lại kho vĩnh viễn theo `docs/proto.md`; lượt này đọc kiểu dữ liệu và phần dùng chung từ nó, không xoá.
- **Ngưỡng UAT chốt cùng lúc ký:** đến 2026-11-02 mọi phòng ban có bộ OKR quý 4 ở pha «Đang chạy»; không bộ nào phải nhập lại quá một lần — chốt tại Cổng Đáng 2026-09-25 theo uỷ quyền.

## Thước đo thành công → ứng viên criterion

- Số phòng ban có mục tiêu đã công bố trong chu kỳ quý 4 → AC về công bố mục tiêu ghi trạng thái và AC về màn «Theo đơn vị» đếm được theo đơn vị.
- Số lượt nhập từ bảng tính theo đơn vị và chu kỳ → AC về vết OKR ghi mỗi lượt nhập thành công kèm đơn vị và chu kỳ.
- Không phải sửa cơ sở dữ liệu tay → AC phủ mở chu kỳ, đặt mục tiêu, công bố, cấu hình chương trình bằng đường sản phẩm.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|
| `apps/app/app/proto/_modules/ban-mau-okr/du-lieu.ts` | Giữ; khuôn Zod thật dựng theo hình này ở `packages/validation/src/okr-*.ts` | không | Kiểu mẫu chỉ có `so`/`moc`; khuôn thật mở thành sáu kiểu |
| `apps/app/app/proto/_modules/ban-mau-okr/phan-chung.tsx` | Dựng lại thành component thật trong khu `okr/` của app, dùng token ở chỗ gọi như bản mẫu | không | Biến thể `packages/ui` là việc lượt 5; lượt này không sửa component nền |
| `apps/app/app/proto/_modules/ban-mau-okr/theo-don-vi.tsx`, `cua-toi.tsx` | Dựng lại: màn «Theo đơn vị» thật đọc `org.tree` và `okr.*`; cây đơn vị lấy từ `settings/organization/cay-dieu-huong.tsx` | không | Bản mẫu giữ nguyên làm phòng trưng bày |
| `apps/app/app/proto/catalog.ts`, `registry.ts` | Giữ | không | Sổ bản mẫu |

## Out of scope từ khám phá

- Cập nhật tuần, mức tự tin theo tuần và nhắc (lượt 4) — lượt này KR chỉ có khởi điểm, đích, giá trị nhập tay khi đặt.
- Toàn cảnh, heatmap, họp tuần và 11 biến thể `packages/ui` (lượt 5).
- Số tự đo từ CRM hoặc API (lượt 6) — cột nguồn của KR chỉ nhận «tay», chừa chỗ cho `crm`/`api`.
- Rà giữa kỳ, chấm điểm, khép kỳ (lượt 7) — pha «Chấm điểm» và «Đã đóng» có trong danh mục pha nhưng chưa có màn.
- Mức hiển thị giới hạn và mẫu OKR (lượt 8).
- Nút phân rã KR cấp trên thành mục tiêu cấp dưới (NG-06) — đã quyết không làm.
- Nối điểm OKR vào lương, thưởng (NG-01).
