---
schema_version: 1
slug: so-do-can-chinh-don-vi
feature: Lãnh đạo mở Toàn cảnh, chuyển sang Sơ đồ và thấy trong một màn đơn vị nào chưa nối lên công ty, đơn vị nào đang trượt
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit: 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1    # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: DH4
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH4 của «OKR» (`docs/plan/lo-trinh-okr.json`), đợt `okr-dieu-huong-1410`
(`docs/plan/pham-vi-okr-dieu-huong-1410.md`, mã D1–D4, D6 và B5). Mốc m-1021dh «OKR · Sơ đồ căn
chỉnh» gồm DH4 và DH5; DH5 (D5, sơ đồ quanh một mục tiêu) dựng trên khung vẽ của vòng này.

Lãnh đạo mở Toàn cảnh, chuyển sang Sơ đồ và thấy trong một màn đơn vị nào chưa nối lên công ty,
đơn vị nào đang trượt.

**Người gặp:** Ban lãnh đạo (mở Toàn cảnh đầu tuần, cần biết chỗ hở trước khi họp) · trưởng đơn
vị (cần thấy đơn vị mình nằm đâu so với công ty).

**Bằng chứng (lượt rà production 14/10, khổ 1440 và 390):** cây căn chỉnh hôm nay là danh sách
thụt lề cao khoảng 4.100px, mọi nhánh mở sẵn; căn chỉnh nhiều–nhiều nên mục tiêu góp hai chỗ phải
hiện hai lần; cây luôn hiện toàn công ty dù trang đơn vị đang chọn đơn vị nào (B5); không nhìn ra
hình dáng tổng. Tability tách Strategy Map (thẻ theo đơn vị) khỏi Dependencies Map (quanh một mục).

Vật liệu nền: bản mẫu `/proto/so-do-can-chinh-okr` ở nhánh `feat/so-do-can-chinh-okr`
(`6e98e80e5`, bảy trạng thái); lý do căn chỉnh của L2–L4 (hồ sơ `cay-can-chinh-co-ly-do`,
`ly-do-can-chinh-tu-soan`) mà sơ đồ phải mang theo.

## Ý định của vòng (chốt một lần ở Cổng Đáng, máy áp cho mọi cạnh gãy sau)

- **Trọng số:** D1 (mỗi đơn vị một thẻ, nối theo cấp, nét đứt cho mục tiêu góp thẳng) và D3 (lọc
  «Cần chú ý») chở cơn đau chính — «đơn vị nào chưa nối, đơn vị nào trượt». D2 (mở thẻ trên sơ đồ)
  và D4 (thu gọn khi hơn 12 đơn vị) đỡ cho hai mã kia. D6 (khung vẽ dùng chung) là phương tiện,
  không phải mục đích. B5 chỉ làm khi sơ đồ thay được cây, kể cả phần lý do căn chỉnh.
- **Chính sách rủi ro:** vòng chỉ đọc dữ liệu, không ghi gì mới vào cơ sở dữ liệu; cách xem Bảng hiện
  có giữ làm mặc định tới khi phiên nghiệm thu đạt, nên sơ đồ sai thì đảo bằng cách ẩn cách xem.
  Thêm phụ thuộc ngoài là đánh đổi chủ kho quyết ở Cổng Phạm vi, không quyết ở đây.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Một thẻ đơn vị không có đường nối lên là tín hiệu đủ rõ để lãnh đạo chỉ ra «chưa nối» trong vài giây | Lãnh đạo vẫn phải đọc từng thẻ, sơ đồ chỉ đẹp hơn cây | Lái-thử người-lạ trên bản mẫu `/proto/so-do-can-chinh-okr`, trạng thái «Cần chú ý» | Chưa thử |
| 2 | Dữ liệu căn chỉnh thật đủ đầy để sơ đồ có nghĩa (đơn vị có trưởng, mục tiêu có góp lên) | Sơ đồ toàn thẻ đỏ, «Cần chú ý» thành mọi thứ | Đếm trên production: số đơn vị, số đơn vị chưa có trưởng, số mục tiêu chưa góp vào đâu | Chưa thử |
| 3 | Sơ đồ mang được lý do căn chỉnh của L2–L4 nên bỏ được cây ở trang đơn vị (B5) | Bỏ cây làm mất chỗ duy nhất đọc lý do và chip lọc «Chưa có lý do» vừa ship ở L3 (12/10) | Rà ở S1: cây đọc lý do từ `canhCuaCay` (`apps/api/src/okr/okr-xem.service.ts:126`), sơ đồ đọc cùng nguồn đó | Đã rà một phần 15/10: nguồn đọc dùng chung được |

**Hiện trạng đã rà 15/10 (đọc mã ở `38300b3c8`):** tổ chức cố định hai cấp — công ty › bộ phận
(`Division`) › phòng ban (`Department`), mỗi đơn vị có `headUserId`; không có bảng cây tổng quát,
nên «thu gọn theo cấp» (D4) là thu gọn phòng ban dưới bộ phận. Toàn cảnh
(`apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx`) chưa có cách xem nào; hàng của nó
(`hangToanCanh`) chưa mang trưởng đơn vị, căn chỉnh hay số KR trượt — vòng phải thêm phần đọc
đó. Căn chỉnh nhiều–nhiều ở `OkrAlignment` (kèm `lyDo`, `canCu`, `lyDoTuKara`); «trượt» chỉ có ở
mục tiêu loại cam kết (`tinhTrang`, `packages/validation/src/okr-muc-tieu.ts:44`). Hồ sơ đã ký
`cay-can-chinh-co-ly-do` có rào `rang/giu-ho-so.mjs` cấm sửa `apps/api/src/okr/can-chinh.ts`: vòng
này chỉ đọc qua nó, không sửa. B5 (bỏ cách xem Cây) chạm mười một hồ sơ đã ký có eval trỏ
`theo-don-vi.tsx` — giá đó trình ở Cổng Phạm vi.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] trên Toàn cảnh › Sơ đồ với dữ liệu thật, Ban lãnh đạo có chỉ ra được đơn vị chưa nối lên công ty và đơn vị đang trượt trong 5 giây không?
- Kết quả nào là SỐNG: [đề xuất] ít nhất 2/3 người dự phiên nghiệm thu chỉ đúng một đơn vị chưa nối lên công ty trong ≤ 5 giây kể từ lúc màn Sơ đồ hiện, và chỉ đúng một đơn vị đang trượt sau khi bật «Cần chú ý».
- Kết quả nào là CHẾT: [đề xuất] dưới 2/3 người dự chỉ đúng trong 5 giây, hoặc có người chỉ sai đơn vị (chọn một đơn vị đã nối là «chưa nối»).
- Timebox: [đề xuất] phiên nghiệm thu trong 14 ngày sau khi lên production, chậm nhất 2026-11-04; dựng theo mốc m-1021dh, ước ~10 giờ máy, hoàn tất dự kiến 2026-10-21.

## Kết quả prototype

Bản mẫu `/proto/so-do-can-chinh-okr` (nhánh `feat/so-do-can-chinh-okr`, `6e98e80e5`, 14/10) có
bảy trạng thái: sơ đồ đơn vị toàn công ty, mở một thẻ ngay trên sơ đồ, lọc «Cần chú ý», lấy một
mục tiêu làm tâm (thuộc DH5), cách xem Bảng, đang tải, lỗi tải; dưới khổ md thay khung vẽ bằng danh
sách thụt lề. Dữ liệu từ bộ OKR mẫu, không đo số nào. Nhánh tụt khoảng 455 commit so với `onehub`
nên không gộp, không rebase — chỉ đọc bằng `git show`.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Phần máy của khung vẽ: xếp vị trí dagre, đường nối theo điểm uốn, thanh phóng | block Pro `@reui/flow-2`, đã rút vào `packages/ui/src/components/flow-map.tsx` + `packages/ui/src/lib/flow-layout.ts` ở nhánh bản mẫu | triết-lý/logic | có, theo luật «Block có phần máy» của `docs/reui.md` (luật đó chưa gộp `onehub` — quyết ở Cổng Phạm vi) | — |
| Tách sơ đồ theo đơn vị khỏi sơ đồ quanh một mục | Tability Strategy Map / Dependencies Map | triết-lý/logic | có (DH4 theo đơn vị, DH5 quanh một mục) | — |
| Chủ sở hữu theo đơn vị | Perdoo | triết-lý/logic | có | — |
| Thẻ đơn vị, ngăn mở thẻ, thanh lọc của bản mẫu | `apps/app/app/proto/_modules/so-do-can-chinh-okr/` ở nhánh bản mẫu (dựng bằng thành phần của kho) | ngôn-ngữ-thiết-kế/hình-thái đã có trong kho | có, dựng lại trên `onehub` | Người ký Cổng Đáng |

## Cổng 0

- **decision = …** Căn cứ: …
- **disposition = …** Căn cứ: …
- **Ngưỡng UAT chốt cùng lúc ký:** …

## Thước đo thành công → ứng viên criterion

- Chỉ ra đơn vị chưa nối trong 5 giây → AC thẻ không có đường nối lên hiện khác hẳn (D1) và lọc «Cần chú ý» (D3).
- Chỉ ra đơn vị trượt → AC «Cần chú ý» gồm KR trượt (D3) và thẻ mang tình trạng.
- Không mất lý do căn chỉnh khi bỏ cây (B5) → AC lý do hiện trên sơ đồ.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|

## Out of scope từ khám phá

- Sơ đồ quanh một mục tiêu (D5) — là DH5, dựng trên khung vẽ của vòng này.
- Bảng Theo đơn vị ở Toàn cảnh thành cây có số cuộn lên (E4) — nhóm E, chờ xác minh.
- Trang đơn vị trên DataTable, ô chọn đơn vị (B1–B4, B6–B8) — vòng khác của đợt.
- Sửa dữ liệu căn chỉnh từ sơ đồ (kéo nối, đổi cha) — vòng chỉ đọc.
- Mã rút từ block Pro trong PR gửi kho hãng — đó là mã trả phí.
