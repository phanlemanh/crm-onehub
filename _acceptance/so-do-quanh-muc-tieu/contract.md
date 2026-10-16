---
schema_version: 1
feature: Sơ đồ quanh một mục tiêu — từ ngăn chi tiết bấm «Xem quanh mục tiêu» thấy đường góp lên tới KR công ty, KR của nó và ai góp vào nó, mỗi mục tiêu hiện một lần, rê chuột làm nổi đường đi
slug: so-do-quanh-muc-tieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: signed-off
approved_by: manh
approved_at: 2026-10-15
design_doc: docs/superpowers/specs/2026-10-15-so-do-quanh-muc-tieu-design.md
---

# Acceptance Contract: so-do-quanh-muc-tieu

## Context

Hàng DH5 của `docs/plan/lo-trinh-okr.json` («Từ một mục tiêu, tôi bấm Xem quanh mục tiêu và thấy nó góp vào đâu, ai
góp vào nó, mục tiêu góp hai chỗ chỉ hiện một lần»), đợt `okr-dieu-huong-1410` (mã D5 của
`docs/plan/pham-vi-okr-dieu-huong-1410.md`), Cổng Đáng ký `build` 15/10 với ngưỡng: ≥ 2/3 trưởng đơn vị dự phiên
nghiệm thu nói đúng KR công ty mà mục tiêu góp vào trong ≤ 10 giây kể từ lúc bấm «Xem quanh mục tiêu».

Source input: `opportunity.md`, design doc ở frontmatter, bản mẫu `/proto/so-do-can-chinh-okr?state=ST-sodo-quanh-muc-tieu`
(nhánh `feat/so-do-can-chinh-okr`, `6e98e80e5`, chỉ đọc). Dựng trên `FlowMap` của DH4 (`so-do-can-chinh-don-vi`).
«Tâm» = mục tiêu đang xem. «Góp» = một căn chỉnh (`OkrAlignment`) từ mục tiêu tới một mục tiêu hay một KR khác.
«Phía trên» = mọi mục tiêu/KR mà tâm góp lên được qua một chuỗi góp. «Phía dưới» = KR của tâm và mục tiêu góp thẳng
vào tâm hay vào một KR của tâm. «Công ty» = mục tiêu `level: "onehub"` và KR của nó.

## Criteria

- AC-1 (cross-layer): Given kỳ có mục tiêu công ty N với KR N.k1, bộ phận A có mục tiêu A1 góp vào N.k1, phòng ban có mục tiêu P1 góp vào A1, mục tiêu P3 góp cả vào A1 lẫn thẳng vào N, và mục tiêu không góp vào đâu, When gọi `okr.quanhMucTieu({ objectiveId })` qua tRPC với tâm là P1, P3, N và mục tiêu không góp, Then phía trên của P1 gồm đúng A1, N.k1, N với cạnh N→N.k1, N.k1→A1, A1→P1 và `gopLenCongTy` = [N.k1 của N]; của P3 gồm A1, N.k1, N mỗi cái đúng một nút, cạnh thêm N→P3, và `gopLenCongTy` có cả N.k1 lẫn N (kr rỗng); KR khác của N không là nút; tâm N có `laCongTy` đúng và không có gì phía trên; mục tiêu không góp có phía trên rỗng và `gopLenCongTy` rỗng; And tâm ở kỳ quý góp qua bộ phận lên KR của mục tiêu công ty ở kỳ năm (kỳ cha) có `gopLenCongTy` chứa KR ấy.
- AC-2: Given tâm có KR k1, k2, mục tiêu C1 góp thẳng vào tâm, C2 góp vào k2, và D góp vào C1, When gọi `okr.quanhMucTieu`, Then phía dưới gồm đúng k1, k2, C1, C2 với cạnh tâm→k1, tâm→k2, tâm→C1, k2→C2; D không là nút (chỉ một bậc); dữ liệu có vòng góp (X góp vào Y, Y góp vào X) thì truy vấn vẫn trả và mỗi mục tiêu đúng một nút.
- AC-3 (cross-layer): Given người xem U không thấy mục tiêu G (mức hiển thị giới hạn) — một ca G phía dưới tâm, một ca tâm X góp vào G và G góp lên KR công ty (G phía trên), When U gọi `okr.quanhMucTieu`, Then tên G không có trong bất kỳ trường nào của đầu ra, G không là nút, không cạnh nào chạm G; ở ca G phía trên, `gopLenCongTy` của U rỗng (đường dừng ở X, không nhắc tới G); tập id mục tiêu của đầu ra là tập con của tập id mà `okr.cayCanChinh` trả cho U cùng kỳ; tâm không tồn tại hoặc U không thấy tâm → lỗi `NOT_FOUND`.
- AC-4: Given ngăn chi tiết một mục tiêu đọc được, When ngăn dựng xong, Then hàng hành động có nút «Xem quanh mục tiêu» là một liên kết (`<a href>`) tới `/<slug>/okr/quanh-muc-tieu/<id mục tiêu>`; khu «Đường lý do» và tab «Căn chỉnh» không đổi.
- AC-5: Given đầu ra của `okr.quanhMucTieu`, When trang sơ đồ dựng ở khổ từ `md` trở lên, Then mỗi nút của đầu ra là đúng một thẻ trong khung vẽ (mục tiêu: tên, đơn vị, tiến độ; KR: tên, tiến độ), thẻ cấp công ty mang nhãn «Công ty», thẻ tâm ở trạng thái đang chọn và là nút khung lia tới; trên khung có dòng «Đang xem quanh: <tên tâm>» và một dòng góp lên công ty — liệt kê từng KR công ty (kèm mục tiêu của nó) và mục tiêu công ty góp thẳng khi có, «Đây là mục tiêu cấp công ty» khi tâm là công ty, «Không thấy đường lên công ty trong phạm vi bạn xem được.» khi rỗng; tập KR và mục tiêu in trên dòng bằng đúng tập `gopLenCongTy` — không thêm KR công ty nào khác.
- AC-6: Given sơ đồ đã dựng, When rê chuột lên một thẻ, Then thẻ và cạnh không nằm trên đường đi qua thẻ ấy mờ đi, thẻ và cạnh trên đường giữ rõ; rời chuột thì đường quanh tâm sáng lại.
- AC-7: Given sơ đồ, When bấm một thẻ mục tiêu hay nhấn Enter/Space khi nó có tiêu điểm, Then ngăn chi tiết của đúng mục tiêu ấy mở; thẻ KR thì mở ngăn của đúng KR ấy.
- AC-8: Given khổ dưới `md`, When mở trang, Then không dựng khung vẽ; cùng dữ liệu hiện thành danh sách `Item variant="outline"` bốn nhóm theo thứ tự «Góp vào» (phía trên, công ty trước), «Mục tiêu này», «KR của nó», «Góp vào nó»; nhóm rỗng không hiện; mỗi dòng bấm mở ngăn như AC-7; dòng góp lên công ty vẫn hiện trên danh sách.
- AC-9: Given truy vấn đang chạy / hỏng / trả `NOT_FOUND`, Then lần lượt: khung xương cùng hình với chữ «Đang tải sơ đồ…» cho trình đọc; `VungTaiLoi` «Không tải được sơ đồ» với nút thử lại gọi lại truy vấn; câu «Không tìm thấy mục tiêu này, hoặc bạn không có quyền xem.» kèm liên kết về Toàn cảnh — không khung vẽ trống câm, tiêu đề trang luôn hiện.
- AC-10: Given chữ của trang và nút, Then chữ đến từ `apps/app/lib/messages/okr-quanh.ts` có đủ `vi`, `en` khác nhau; tên mục tiêu, KR, đơn vị mang `translate="no"`; thẻ bấm được bằng phím có vòng `focus-visible`; tệp giao diện mới và ngăn chi tiết qua sàn thiết kế tĩnh của kho.
- AC-11: Given bộ OKR mẫu với ca sơ đồ của DH4 đã nạp, When mở ngăn chi tiết của mục tiêu phòng ban góp qua bộ phận lên KR công ty, bấm «Xem quanh mục tiêu» ở 1440 px, rồi mở cùng trang ở 390 px, Then ở 1440 trang sơ đồ hiện với dòng góp lên công ty gọi đúng KR công ty mà tệp gieo khai, thẻ KR ấy mang nhãn «Công ty»; mở trang của mục tiêu góp hai chỗ thì mục tiêu công ty chỉ một thẻ; rê chuột lên một thẻ ngoài đường thì thẻ khác mờ; ở 390 hiện danh sách, trang không cuộn ngang; có ảnh từng trạng thái.
- AC-12: Given các hồ sơ đã ký có eval `test`/`script` không khai `status: not-run` mà `paths` ghi đích danh một tệp mã vòng này sửa, When chạy lại đúng lệnh của từng eval, Then mọi lệnh thoát đúng mã kỳ vọng; And `apps/api/src/okr/can-chinh.ts`, `packages/ui/src/components/flow-map.tsx`, `packages/ui/src/lib/flow-layout.ts` không đổi so với nhánh DH4.
- AC-13: Given diff của vòng so với điểm gộp nhánh DH4 gần nhất, Then chỉ các tệp khai ở `## Notes` (mục Ranh giới), `_acceptance/so-do-quanh-muc-tieu/**`, `docs/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` đổi; tệp đánh «chỉ thêm» chỉ có dòng THÊM.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature + test-matrix), 15/10; bảng ở `coverage-scan.md`. Chân sản
phẩm: `schema.prisma` (`OkrAlignment`), `okr-muc-tieu.ts` (`CAP_MUC_TIEU`), `okr.service.ts` (`mucTieuCuaCay`), bộ gieo
`apps/api/scripts/okr-mau/ca-so-do.ts`; chân ngành: Tability Dependencies Map qua lượt rà 14/10 của đợt.

- **Trục A — tâm đứng đâu trên chuỗi góp:** góp qua KR lên công ty | góp thẳng mục tiêu công ty | góp hai chỗ chung một tổ tiên | là công ty | không góp vào đâu | đường lên đi qua mục tiêu người xem không thấy | góp sang kỳ cha.
  - Thước CE: căn chỉnh tới mục tiêu hoặc KR [SUY-TỪ-REPO: packages/db/prisma/schema.prisma]; bốn cấp mục tiêu [SUY-TỪ-REPO: packages/validation/src/okr-muc-tieu.ts]; gộp kỳ cha và kỳ con [SUY-TỪ-REPO: apps/api/src/okr/okr.service.ts].
- **Trục B — phía dưới:** không ai góp | góp vào tâm | góp vào KR của tâm | góp bậc hai | mục tiêu giới hạn góp vào | vòng góp.
  - Thước CE: câu giao «ai góp vào nó» [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json].
- **Trục C — trạng thái màn:** mặc định | rê chuột | công ty | chưa lên | đang tải | lỗi | không thấy | hẹp | nút trong ngăn.
  - Thước CE: nếp «Chờ tải và lỗi tải», «Danh sách» [SUY-TỪ-REPO: docs/design.md]; trạng thái ST-sodo-quanh-muc-tieu của bản mẫu [SUY-TỪ-REPO: _acceptance/so-do-quanh-muc-tieu/opportunity.md].
- **Trục D — người xem:** thấy mọi mục tiêu | thiếu mục tiêu giới hạn | không thấy tâm.
  - Thước CE: lọc quyền của `mucTieuCuaCay` [SUY-TỪ-REPO: apps/api/src/okr/okr.service.ts].
- **Cross-cutting:** khổ 1440 | 390; `vi` | `en`; `translate="no"`; phím và tiêu điểm; sàn thiết kế tĩnh.
- **Ô Core:** đường lên và KR công ty (AC-1) · phía dưới một bậc, vòng góp (AC-2) · quyền (AC-3) · lối vào (AC-4) · thẻ và dòng công ty (AC-5) · rê chuột (AC-6) · bấm thẻ (AC-7) · hẹp (AC-8) · tải, lỗi, không thấy (AC-9) · chữ, phím, sàn (AC-10) · màn thật (AC-11) · giữ hồ sơ đã ký (AC-12) · ranh giới (AC-13).
- **Đối chiếu ngành:** [NGÀNH: Tability Dependencies Map — sơ đồ quanh một mục, tách khỏi Strategy Map theo đơn vị].
- **Later:** lý do căn chỉnh trên đường nối; đi xuống nhiều bậc; lối vào từ sơ đồ đơn vị của DH4; lọc theo kỳ.
- **Never:** sửa căn chỉnh từ sơ đồ — vòng chỉ đọc; nhắc «có mục tiêu ẩn» ở chỗ đường bị cắt — lộ sự tồn tại của mục tiêu giới hạn.

## Đường đo

- Ngưỡng «nói đúng KR công ty trong 10 giây» — số đo ở phiên nghiệm thu chung với DH4
  (`/acceptance-gate:uat-session`), bấm giờ từ lúc bấm «Xem quanh mục tiêu» tới lúc người dự nói tên KR; vật bảo đảm:
  AC-1 (`gopLenCongTy` đúng), AC-4 (lối vào), AC-5 (dòng góp lên công ty, nhãn «Công ty»), AC-11 (màn thật). Không có
  code đo mới.

## Out of scope

- Sơ đồ theo đơn vị toàn công ty, cách xem của Toàn cảnh (DH4); đổi `FlowMap` hay `flow-layout`.
- Lý do căn chỉnh trên đường nối; đi xuống quá một bậc.
- Sửa căn chỉnh, kéo nối hay đổi cha từ sơ đồ; đổi khu «Đường lý do» hay tab «Căn chỉnh» của ngăn.
- Đổi `apps/api/src/okr/can-chinh.ts` hay đầu ra `okr.objective`, `okr.cayCanChinh`.

## Notes

- Ranh giới (đăng crm #375 trước Cổng Phạm vi; S2 chốt danh sách cuối): `apps/api/src/okr/quanh-muc-tieu.ts` (mới),
  `apps/api/src/okr/okr-xem.contracts.ts` (chỉ thêm), `apps/api/src/okr/okr-xem.service.ts` (chỉ thêm),
  `apps/api/src/okr/okr.router.ts` (chỉ thêm), `apps/api/src/generated/server.ts` (sinh lại),
  `apps/api/test/okr-quanh-muc-tieu.spec.ts` (mới),
  `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/[objectiveId]/page.tsx` (mới),
  `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/quanh-muc-tieu.tsx` (mới),
  `apps/app/app/(app)/[slug]/okr/quanh-muc-tieu/the-quanh.tsx` (mới),
  `apps/app/components/crm/record-sheet/objective-sheet.tsx` (chỉ thêm),
  `apps/app/lib/messages/okr-quanh.ts` (mới), `apps/app/test/okr-quanh-muc-tieu.dom.tsx` (mới),
  `apps/app/test/messages-guard.spec.ts` (chỉ thêm), `_acceptance/config.yaml` (chỉ thêm).
  S3 chốt thêm: `apps/app/test/okr-quanh-loi-vao.dom.tsx` (mới — bài lối vào dùng bộ dựng ngăn chi tiết
  `khung-gop-y-dung-cho.tsx`, mỗi tệp bun chỉ một mock tRPC), `docs/superpowers/plans/2026-10-15-so-do-quanh-muc-tieu.md`.
  S4-r1 chốt thêm (suite của kho đỏ vì thủ tục và trang mới): `apps/api/test/vai-chi-okr.spec.ts` (chỉ thêm —
  khai `okr.quanhMucTieu` vào hai danh sách ghim và ma trận quyền theo vai), `apps/app/lib/trpc/cache.ts` (chỉ thêm —
  `cache.okr` làm mới truy vấn mới).
- Bộ gieo: dùng nguyên ca sơ đồ của DH4 (`apps/api/scripts/okr-mau/ca-so-do.ts`) — `sd-a1-1` góp qua `sd-a-1` lên KR
  `n1-k1` của mục tiêu công ty `n1`; `sd-a3-1` góp cả `sd-a-1` lẫn thẳng `n1`; `sd-g` giới hạn góp vào `sd-a-1`. Không
  sửa tệp gieo.
- Rủi ro gộp: DH1 (`dieu-huong-khu-muc-tieu`, đã ký, chưa gộp) và DH4 cùng sửa `apps/app/lib/messages/okr.ts`,
  `apps/app/lib/search-param-keys.ts` — vòng này không chạm hai tệp đó. `_acceptance/config.yaml` và
  `apps/api/src/okr/okr.router.ts`/`okr-xem.*` chỉ thêm khối kề khối của DH4 — ai gộp sau gỡ. PR mở sau khi DH4 gộp
  `onehub`.
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/api.md`, `docs/design.md`, `docs/reui.md`.
- Hạng T2 (máy suy theo `t3_paths`, khớp hạng của hàng DH5).
- Known limits — chọn ở Cổng Bằng chứng 2026-10-15:
  - Ngoài-1: Phép kiểm E16 xác nhận sơ đồ không đọc lộ mục tiêu giới hạn còn có thể xanh mà chưa soi đúng chỗ đọc của sơ đồ; bảo đảm chống lộ dựa chính vào bài quyền (E3) và ma trận vai.
  - Ngoài-2: Trong lúc trang Sơ đồ quanh mục tiêu tải, có thể hiện thêm một khung tiêu đề giả dưới tiêu đề thật và trình đọc màn hình gặp nhiều vùng nội dung chính.
  - Ngoài-3: Khi dữ liệu sơ đồ về, hiệu ứng chuyển trang có thể chạy chồng một lần vì khung chờ là khung cấp trang.
  - Ngoài-6: Trang Sơ đồ quanh mục tiêu có lề dư và hai vùng cuộn lồng nhau; dữ liệu và thao tác vẫn đúng.
  - Ngoài-9: Phép giữ hồ sơ đã ký (E13, không chạy ở vòng này) cho qua một eval đã ký đỏ nếu bản nền cũng đỏ vì lý do khác.
  - Ngoài-10: Phép giữ hồ sơ đã ký bỏ qua các hồ sơ chỉ trỏ tới tệp bài kiểm (như bộ kiểm chữ) mà không báo.
  - Ngoài-11: Bộ phá thử có thể nhận nhầm một lần đỏ khác lý do là đúng, vì thông điệp ghim còn khớp được trong khung mã nguồn bun in lại.
  - Ngoài-12: Bài kiểm nhãn «Công ty» đếm assert theo chính đầu ra nên con số «một assert mỗi thẻ» không tự chứng điều gì.
  - Ngoài-13: Bài dòng góp lên công ty đo mục góp thẳng qua thuộc tính máy, chưa đo chữ người dùng thấy.
  - Ngoài-14: Bài danh sách trên điện thoại ở ca không góp vào đâu chỉ kiểm nhóm vắng, chưa kiểm danh sách đã dựng.
  - Ngoài-15: Bài góp vòng tròn chỉ kiểm không lặp thẻ, chưa có đối chứng rằng vòng thật sự được duyệt.
  - Ngoài-16: Bài rê chuột ở trạng thái đầu (tâm là mục tiêu công ty) không có thẻ nào ngoài đường, nên vế «ngoài đường mờ» chỉ được đo sau khi rê.
  - Ngoài-17: Bài chữ kiểm thuộc tính không-dịch trên phần tử tên, chưa kiểm tên và đơn vị nằm bên trong phần tử đó.
  - Ngoài-18: Phép đo màn thật đọc dòng góp lên công ty qua thuộc tính máy, chưa đọc chữ hiển thị.
