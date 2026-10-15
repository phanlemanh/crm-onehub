---
schema_version: 1
feature: Toàn cảnh › Theo đơn vị có cách xem Sơ đồ — mỗi đơn vị một thẻ, đường nối theo căn chỉnh thật, lọc «Cần chú ý», mở thẻ ngay trên sơ đồ, thu gọn khi hơn 12 đơn vị
slug: so-do-can-chinh-don-vi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
approved_by: manh
approved_at: 2026-10-15
design_doc: docs/superpowers/specs/2026-10-15-so-do-can-chinh-don-vi-design.md
---

# Acceptance Contract: so-do-can-chinh-don-vi

## Context

Hàng DH4 của `docs/plan/lo-trinh-okr.json` («Lãnh đạo mở Toàn cảnh, chuyển sang Sơ đồ và thấy trong một màn đơn vị
nào chưa nối lên công ty, đơn vị nào đang trượt»), đợt `okr-dieu-huong-1410` (mã D1–D4, D6, B5 của
`docs/plan/pham-vi-okr-dieu-huong-1410.md`), Cổng Đáng ký `build` 15/10 với ngưỡng: ≥ 2/3 người dự phiên nghiệm thu
chỉ đúng một đơn vị chưa nối lên công ty trong ≤ 5 giây và một đơn vị đang trượt sau khi bật «Cần chú ý».

Source input: `opportunity.md`, design doc ở frontmatter, bản mẫu `/proto/so-do-can-chinh-okr` (nhánh
`feat/so-do-can-chinh-okr`, `6e98e80e5`, chỉ đọc). «Đơn vị» = công ty, bộ phận (`Division`), phòng ban
(`Department`); phòng ban chưa xếp vào bộ phận có cha là công ty. «Góp ra ngoài» của một mục tiêu = căn chỉnh
(`OkrAlignment`) tới mục tiêu hay KR của một đơn vị KHÁC; căn chỉnh tới mục tiêu của chính đơn vị là góp nội bộ.
Đơn vị «chưa nối lên» = có mục tiêu công bố mà không mục tiêu nào góp ra ngoài. «Trượt» = tình trạng `tinhTrang`
dùng chung trả nghĩa trượt.

## Criteria

- AC-1 (cross-layer): Given kỳ có công ty, hai bộ phận, phòng ban trong bộ phận và một phòng ban chưa xếp, với mục tiêu công bố góp vào cha, góp thẳng lên công ty bỏ qua bộ phận, góp chéo nhánh sang bộ phận khác, góp cả cha lẫn công ty, chỉ góp nội bộ, và không góp vào đâu, When gọi `okr.soDoDonVi({ cycleId })` qua tRPC, Then đầu ra có đúng một nút cho mỗi đơn vị (khoá `goc` / `bp:<id>` / `pb:<id>`, cha đúng cây tổ chức) mang trưởng (hoặc `null`), số mục tiêu, số KR, tiến độ trung bình, số KR theo ba tình trạng, số mục tiêu chưa góp vào đâu, cờ chưa nối lên; và mỗi cặp (đơn vị đích, đơn vị nguồn) có góp ra ngoài thành đúng một đường — `lien` khi đích là cha, `dut` khi đích là đơn vị khác (bỏ cấp hay chéo nhánh) — mang số mục tiêu góp; góp nội bộ không thành đường; đơn vị chưa nối lên không là nguồn của đường nào.
- AC-2: Given mỗi đơn vị khác công ty, Then cờ «Cần chú ý» của nó bật khi và chỉ khi thoả ít nhất một trong năm: không có trưởng · 0 mục tiêu công bố · chưa nối lên · có mục tiêu không có căn chỉnh nào · có KR mà `tinhTrang` trả nghĩa trượt; đầu ra ghi riêng từng cờ trong năm; nút công ty không bao giờ bật cờ; KR của mục tiêu không phải cam kết không bao giờ tính là trượt.
- AC-3: Given người xem không thấy một mục tiêu (mức hiển thị giới hạn), When gọi `okr.soDoDonVi`, Then mục tiêu đó không có trong danh sách mục tiêu của thẻ, không có tên trong bất kỳ trường nào của đầu ra, và không góp vào số đếm hay đường nối; tập mục tiêu dùng cho sơ đồ bằng đúng tập mục tiêu công bố của kỳ mà cây căn chỉnh trả cho cùng người xem.
- AC-4: Given Toàn cảnh, When mở thẻ «Theo đơn vị», Then `CardAction` có `ViewSwitch` hai mục Bảng · Sơ đồ, mặc định Bảng, giá trị ghi lên đường dẫn qua `nuqs` (giá trị lạ đọc như Bảng); bảng hiện có giữ nguyên; mã khung vẽ chỉ nạp khi chọn Sơ đồ (không nhập tĩnh vào tệp Toàn cảnh).
- AC-5: Given đầu ra của `okr.soDoDonVi`, When dựng sơ đồ, Then mỗi đơn vị một thẻ mang tên, trưởng hay «Chưa có trưởng», số mục tiêu · số KR · tiến độ và ba số đếm tình trạng; thẻ của đơn vị chưa nối lên không có đường nào đi lên và mang nhãn «Chưa nối lên»; thẻ cần chú ý có một dòng gọi tên từng cờ đang bật («Có KR trượt», «Chưa có trưởng»…); đường `lien` vẽ nét liền, đường `dut` vẽ nét đứt; chú giải ba dòng nói nét liền, nét đứt và «Chưa nối lên» nghĩa là gì.
- AC-6: Given sơ đồ có đơn vị cần chú ý, When bấm chip «Cần chú ý», Then chỉ thẻ cần chú ý giữ rõ và bấm được, thẻ khác mờ và không bấm được; hai chip mang số đơn vị («Mọi đơn vị N», «Cần chú ý K»); giá trị lọc ghi lên đường dẫn qua `nuqs`; kỳ không có đơn vị nào cần chú ý thì bật lọc hiện câu «Không đơn vị nào cần chú ý trong kỳ này», không phải sơ đồ mờ câm.
- AC-7 (cross-layer): Given sơ đồ, When bấm một thẻ hay nhấn Enter/Space khi thẻ có tiêu điểm, Then thẻ nở ra liệt kê mục tiêu của đơn vị, mỗi dòng: tên mục tiêu (bấm mở ngăn chi tiết mục tiêu), góp vào đâu (tên đích kèm đơn vị đích), nhãn mức tin và câu lý do của đúng chỗ nối ấy với cùng bảng mức tin → nghĩa của L2 (`NGHIA_MUC_TIN`, không khai bảng thứ hai), dấu Kara khi lý do do Kara viết; mục tiêu góp hai chỗ hiện hai dòng góp, mỗi dòng đúng lý do của nó; mức tin, câu lý do và dấu Kara của mỗi cặp (mục tiêu, đích) trong đầu ra `okr.soDoDonVi` bằng đúng các trường cạnh của `okr.cayCanChinh` cho cùng người xem; thẻ đang mở ghi lên đường dẫn, tải lại mở đúng thẻ — kể cả khi thẻ là phòng ban đang bị gộp (nhánh tự mở); bấm lại hay Esc thì đóng.
- AC-8: Given tổ chức hơn 12 đơn vị, When mở Sơ đồ, Then mặc định phòng ban gộp vào thẻ bộ phận của nó, trừ nhánh có phòng ban chưa nối lên — nhánh ấy mở sẵn ngay ở màn mặc định; thẻ bộ phận gộp ghi số phòng ban gộp và số phòng ban cần chú ý bên trong (khi khác 0); nút trên thẻ mở nhánh, nhánh mở ghi lên đường dẫn; bật «Cần chú ý» thì mọi nhánh có phòng ban cần chú ý tự mở; tổ chức từ 12 đơn vị trở xuống không gộp.
- AC-9: Given khổ dưới `md`, When mở Sơ đồ, Then không dựng khung vẽ; cùng dữ liệu hiện thành danh sách `Item variant="outline"` thụt lề theo cấp, mỗi dòng mang «Chưa nối lên» và «Cần chú ý» như thẻ, cùng chip lọc.
- AC-10: Given truy vấn đang chạy / hỏng / kỳ chưa có mục tiêu công bố nào, Then lần lượt: khung xương cùng hình với câu «Đang tải sơ đồ…» cho trình đọc; `VungTaiLoi` «Không tải được sơ đồ» có nút thử lại gọi lại truy vấn; thẻ công ty kèm câu «Kỳ này chưa có mục tiêu công bố» — không có khung vẽ trống câm.
- AC-11: Given chữ trên sơ đồ, Then chữ khung đến từ `apps/app/lib/messages/okr-toan-canh.ts` (chữ của khung vẽ dùng chung từ `packages/ui/src/lib/messages.ts`) và có đủ `vi`, `en` khác nhau; tên đơn vị, tên người, tên mục tiêu và câu lý do mang `translate="no"`; thẻ là phần tử bấm được bằng phím có vòng tiêu điểm `focus-visible`; ba nút thu nhỏ · phóng to · vừa khung có `aria-label`; khi `prefers-reduced-motion` thì không lia, không phóng có hiệu ứng.
- AC-12 (cross-layer): Given bộ OKR mẫu đã nạp, When mở Toàn cảnh › Theo đơn vị › Sơ đồ ở 1440 và 390 px, Then ở 1440 có đúng các đơn vị mà tệp dữ liệu mẫu khai «chưa nối lên» mang nhãn ấy và không có đường đi lên; bật «Cần chú ý» thì đúng tập đơn vị tệp mẫu khai cần chú ý còn rõ; bấm một thẻ có mục tiêu góp thì thẻ nở ra với câu lý do đã gieo; ở 390 hiện danh sách thay khung vẽ; trang không cuộn ngang; có ảnh khung nhìn từng trạng thái.
- AC-13: Given trang đơn vị, Then `ViewSwitch` không còn mục «Cây căn chỉnh»; đường dẫn cũ `?xemOkr=cay` mở Toàn cảnh › Sơ đồ với thẻ của đơn vị đang chọn mở sẵn (đơn vị công ty → không mở thẻ nào).
- AC-14: Given các hồ sơ đã ký có eval `test`/`script` không khai `status: not-run` mà `paths` ghi đích danh một tệp mã vòng này sửa, When chạy lại đúng lệnh của từng eval, Then mọi lệnh thoát đúng mã kỳ vọng, trừ đúng các eval đã nghỉ có tên ở `## Notes` kèm con trỏ thay thế; And `apps/api/src/okr/can-chinh.ts` không đổi.
- AC-15: Given diff của vòng so với `onehub`, Then chỉ các tệp khai ở `## Notes` (mục Ranh giới), `_acceptance/so-do-can-chinh-don-vi/**`, `docs/**`, `bun.lock`, `PRODUCT-MAP.md`, `LO-TRINH.html` đổi; các tệp chỉ-thêm chỉ có dòng THÊM; `packages/ui/package.json` chỉ thêm đúng các phụ thuộc chủ kho chọn ở Cổng Phạm vi.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature + test-matrix), 15/10. Chân sản phẩm: `schema.prisma`
(`Division`, `Department`, `OkrAlignment`), `okr-muc-tieu.ts` (`tinhTrang`), `okr-xem.service.ts` (`canhCuaCay`,
`toanCanh`); chân ngành: Tability Strategy Map qua lượt rà 14/10.

- **Trục A — căn chỉnh của đơn vị:** góp cha | góp thẳng bỏ cấp | góp chéo nhánh | góp cả cha lẫn bỏ cấp | chỉ góp nội bộ | có OKR mà không góp | chưa đặt OKR | công ty.
  - Thước CE: hai cấp tổ chức cố định [SUY-TỪ-REPO: packages/db/prisma/schema.prisma]; căn chỉnh tới mục tiêu hoặc KR [SUY-TỪ-REPO: packages/db/prisma/schema.prisma].
- **Trục B — cờ «Cần chú ý»:** chưa có trưởng | chưa đặt OKR | chưa nối lên | mục tiêu không căn chỉnh | KR trượt | không cờ.
  - Thước CE: bốn cờ của mã D3 [SUY-TỪ-REPO: docs/plan/pham-vi-okr-dieu-huong-1410.md]; «trượt» chỉ ở cam kết [SUY-TỪ-REPO: packages/validation/src/okr-muc-tieu.ts].
- **Trục C — trạng thái màn:** mặc định | mở thẻ | lọc chú ý | lọc rỗng | thu gọn | kỳ rỗng | đang tải | lỗi | hẹp.
  - Thước CE: nếp «Chờ tải và lỗi tải», «Chip lọc và chuyển kiểu xem», «Danh sách» [SUY-TỪ-REPO: docs/design.md]; bảy trạng thái của bản mẫu [SUY-TỪ-REPO: docs/plan/pham-vi-okr-dieu-huong-1410.md].
- **Trục D — người xem:** thấy mọi mục tiêu | thiếu mục tiêu giới hạn.
  - Thước CE: lọc quyền của `mucTieuCuaCay` [SUY-TỪ-REPO: apps/api/src/okr/okr.service.ts].
- **Cross-cutting:** khổ 1440 | 390; `vi` | `en`; `translate="no"`; phím và tiêu điểm; `prefers-reduced-motion`.
- **Ô Core:** đầu ra đơn vị và đường (AC-1) · năm cờ (AC-2) · quyền (AC-3) · cách xem (AC-4) · thẻ và đường (AC-5) · lọc (AC-6) · mở thẻ và lý do (AC-7) · thu gọn (AC-8) · hẹp (AC-9) · tải, lỗi, rỗng (AC-10) · chữ, phím (AC-11) · màn thật (AC-12) · B5 (AC-13) · giữ hồ sơ đã ký (AC-14) · ranh giới (AC-15).
- **Đối chiếu ngành:** [NGÀNH: Tability Strategy Map — thẻ theo đơn vị, đường theo căn chỉnh, tách khỏi Dependencies Map]; [NGÀNH: Perdoo — chủ sở hữu mục tiêu theo đơn vị].
- **Later:** lia/phóng ghi lên đường dẫn; xuất ảnh sơ đồ; lọc theo từng cờ riêng; sơ đồ quanh một mục (DH5).
- **Never:** kéo-thả để sửa căn chỉnh trên sơ đồ — vòng chỉ đọc; sơ đồ thay Bảng làm mặc định trước phiên nghiệm thu.

## Đường đo

- Ngưỡng «chỉ ra đơn vị chưa nối trong 5 giây» — số đo ở phiên nghiệm thu (`/acceptance-gate:uat-session`), bấm
  giờ từ lúc màn Sơ đồ hiện, chưa bật lọc; vật bảo đảm: AC-1 (định nghĩa chưa nối), AC-5 (nhãn «Chưa nối lên», không dây
  đi lên), AC-8 (nhánh có đơn vị chưa nối mở sẵn ở màn mặc định), AC-12.
- Ngưỡng «chỉ ra đơn vị đang trượt sau khi bật Cần chú ý» — cùng phiên; vật bảo đảm: AC-2, AC-5 (dòng gọi tên cờ
  «Có KR trượt»), AC-6, AC-12.

## Out of scope

- Sơ đồ quanh một mục tiêu (D5) — hàng DH5, dựng trên `FlowMap` của vòng này.
- Bảng Theo đơn vị ở Toàn cảnh thành cây có số cuộn lên (E4); trang đơn vị trên DataTable (B1–B4, B6–B8).
- Sửa căn chỉnh, kéo nối hay đổi cha từ sơ đồ; đổi `migration` hay cột cơ sở dữ liệu.
- Đổi `apps/api/src/okr/can-chinh.ts` hay đầu ra `hangToanCanh` của Toàn cảnh.
- Mã rút từ block Pro trong PR gửi kho hãng.

## Notes

- Ranh giới (đăng crm #375 trước Cổng Phạm vi; S2 chốt danh sách cuối): `apps/api/src/okr/so-do-don-vi.ts` (mới),
  `apps/api/src/okr/okr-xem.contracts.ts` (chỉ thêm), `apps/api/src/okr/okr-xem.service.ts`,
  `apps/api/src/okr/okr.router.ts` (chỉ thêm), `apps/api/test/okr-so-do-don-vi.spec.ts` (mới),
  `apps/api/scripts/okr-mau.ts` hay tệp dữ liệu mẫu của nó (chỉ thêm ca chưa nối, trượt, không trưởng),
  `apps/app/app/(app)/[slug]/okr/toan-canh/toan-canh.tsx`, `apps/app/app/(app)/[slug]/okr/toan-canh/so-do-don-vi.tsx`
  (mới), `apps/app/app/(app)/[slug]/okr/toan-canh/the-don-vi.tsx` (mới),
  `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`, `apps/app/lib/search-param-keys.ts` (chỉ thêm),
  `apps/app/lib/messages/okr-toan-canh.ts` (chỉ thêm), `apps/app/test/okr-so-do-don-vi.dom.tsx` (mới),
  `packages/ui/src/components/flow-map.tsx` (mới), `packages/ui/src/lib/flow-layout.ts` (mới),
  `packages/ui/src/lib/messages.ts` (chỉ thêm), `packages/ui/package.json` (chỉ thêm), `docs/reui.md`, `docs/proto.md`,
  `_acceptance/config.yaml` (chỉ thêm). Nếu làm B5: `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`,
  `apps/app/app/(app)/[slug]/okr/theo-don-vi/page.tsx`, `packages/validation/src/okr-tham-so.ts`,
  `apps/app/test/okr-theo-don-vi.dom.tsx`, `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx` (xoá),
  `apps/app/test/cay-can-chinh-ly-do.dom.tsx` (xoá).
- Rủi ro gộp (crm #375, Mac Studio 02:41Z): #410 (Kho tài liệu) sửa `packages/ui/package.json` và
  `packages/ui/src/lib/messages.ts`; NM2 `loc-va-kieu-xem-chung` sửa `packages/ui` toggle-group (prop `count`) và có thể thêm
  khối vào `packages/ui/src/lib/messages.ts`; C `hoi-dap-okr` sửa `apps/app/lib/messages/okr-hoi.ts` (kề, không trùng
  tệp). Chỉ là khối kề nhau — ai gộp sau gỡ; `bun.lock` thì bên sau chạy lại `bun install`, không gỡ tay.
- Nền hạ tầng 15/10 (`duong-nen.md`, sha `31dd7afd6`): công cụ · suite · lưới xanh; chân engine đỏ vì 8 tệp kit chép
  trong kho (vendored) lệch bản kit đang chạy — lỗi đã biết của kho, PR #413 (nhận kit 2.30) gỡ; nhãn: *không đọc được ở
  đây*, không phải lỗi của vòng.
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/api.md`, `docs/design.md`, `docs/reui.md`, `docs/ai-ux.md`.
- Hạng T3 do mốc m-1021dh tính DH4 là T3 (thêm React Flow + dagre, chạm `packages/ui`); hạng máy suy theo
  `t3_paths` là T2.
