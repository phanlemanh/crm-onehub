---
schema_version: 1
slug: so-do-quanh-muc-tieu
feature: Từ một mục tiêu, tôi bấm Xem quanh mục tiêu và thấy nó góp vào đâu, ai góp vào nó, mục tiêu góp hai chỗ chỉ hiện một lần
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: manh
decided_at: 2026-10-15T05:04:18Z     # ISO UTC
prototype:
  base_commit: 60fc1b02dbd9de1abc1a7ece86fa2ec03a31cae1    # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition: archive    # keep | archive
lo_trinh_ma: DH5
lo_trinh_tep: docs/plan/lo-trinh-okr.json
---

## Vấn đề & ai gặp

Mở từ hàng DH5 của «OKR» (`docs/plan/lo-trinh-okr.json`), đợt `okr-dieu-huong-1410`
(`docs/plan/pham-vi-okr-dieu-huong-1410.md`, mã D5). Mốc m-1021dh «OKR · Sơ đồ căn chỉnh» gồm DH4
và DH5; vòng này dựng trên khung vẽ `FlowMap` của DH4 (`so-do-can-chinh-don-vi`, đã ký Cổng Phạm vi
15/10, đang ở kế hoạch).

Từ một mục tiêu, tôi bấm Xem quanh mục tiêu và thấy nó góp vào đâu, ai góp vào nó, mục tiêu góp
hai chỗ chỉ hiện một lần.

**Người gặp:** trưởng đơn vị (đang xem mục tiêu của đơn vị mình, cần biết nó đỡ KR nào của công ty
trước buổi họp kỳ) · người phụ trách mục tiêu (cần thấy ai đang góp vào mục tiêu của mình).

**Vì sao:** câu hỏi «mục tiêu này góp vào đâu» hôm nay chỉ trả lời bằng một dòng «Góp vào n chỗ» ở
hàng bảng; ngăn chi tiết mục tiêu chỉ hiện chỗ góp vào **một bậc lên** (khu «Đường lý do»), không có
gì cho chiều «ai góp vào mục tiêu này»; muốn thấy cả đường lên công ty phải lần tay qua cây. Tability
tách Dependencies Map (quanh một mục) khỏi Strategy Map (theo đơn vị) — DH4 làm vế sau, vòng này vế
trước.

## Ý định của vòng (chốt một lần ở Cổng Đáng, máy áp cho mọi cạnh gãy sau)

- **Trọng số:** cơn đau chính là «mục tiêu này góp vào KR nào của công ty» — đường đi LÊN tới mục
  tiêu/KR cấp công ty phải đọc được không cần lần tay; đó là thứ ngưỡng đo. «Ai góp vào nó» (một bậc
  xuống: KR của nó và mục tiêu góp thẳng vào nó hay vào KR của nó) là vế thứ hai của câu giao.
  «Góp hai chỗ hiện một lần» là điều kiện đúng của sơ đồ, không phải tính năng riêng. Rê chuột làm
  nổi đường đi đỡ cho vế chính khi sơ đồ có nhiều nhánh.
- **Chính sách rủi ro:** vòng chỉ đọc dữ liệu, không ghi gì mới vào cơ sở dữ liệu; lối vào là một nút
  thêm vào ngăn chi tiết mục tiêu, không đổi khu «Đường lý do» và tab «Căn chỉnh» đang có — sơ đồ sai
  thì đảo bằng cách ẩn nút. Không mở rộng khung vẽ của DH4 trừ khi nhắn Điều phối thống nhất.

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Đường đi lên vẽ thành sơ đồ (mục tiêu tâm ở giữa, chỗ góp vào ở trên) đủ để trưởng đơn vị đọc ra KR công ty trong vài giây | Họ vẫn phải đọc từng thẻ, sơ đồ không nhanh hơn danh sách «Đường lý do» | Lái-thử người-lạ trên bản mẫu `/proto/so-do-can-chinh-okr?state=ST-sodo-quanh-muc-tieu` | Chưa thử |
| 2 | Chuỗi căn chỉnh thật đủ sâu và đủ nối để có đường lên tới công ty (mục tiêu phòng ban góp vào bộ phận, bộ phận góp vào công ty) | Phần lớn mục tiêu dừng ở một bậc, sơ đồ chỉ là bản vẽ lại của «Đường lý do» | Đếm trên production: tỉ lệ mục tiêu có đường lên tới cấp `onehub` | Chưa thử |
| 3 | Thêm nút vào ngăn chi tiết mục tiêu không làm đỏ hồ sơ đã ký đang canh tệp đó | Vòng phải sửa test của hồ sơ đã ký — rào `giu-ho-so.mjs` cấm | Rà ở S1: chạy lại eval của các hồ sơ có `paths` trỏ `objective-sheet.tsx` sau khi thêm nút | Chưa thử |

**Hiện trạng đã rà 15/10 (đọc mã ở `e20ad7656`, nhánh DH4):**
- Ngăn chi tiết mục tiêu là `apps/app/components/crm/record-sheet/objective-sheet.tsx`
  (`ObjectiveSheet`, mở qua `?record=objective:<id>`, không có route riêng). Tab KR có khu
  «Đường lý do» (`KhuGopVao`) — danh sách phẳng các chỗ góp vào một bậc lên; tab «Căn chỉnh» là
  bảng ba cột có gỡ/sửa. Không có phần nào cho chiều xuống.
- Dữ liệu: `OkrAlignment` nhiều–nhiều (`objectiveId` → `targetObjectiveId` hoặc
  `targetKeyResultId`, kèm `lyDo`, `canCu`, `lyDoTuKara`). `okr.objective` chỉ trả căn chỉnh một bậc
  lên; `okr.cayCanChinh` trả cạnh của cả kỳ qua `canhCuaCay` (`apps/api/src/okr/okr-xem.service.ts`),
  đã lọc quyền qua `mucTieuCuaCay`. **Chưa có endpoint cho một mục tiêu** — vòng phải thêm phần đọc
  «quanh một mục tiêu» (lên tới cấp `onehub`, xuống một bậc), đọc qua cùng nguồn đã lọc quyền.
  Mục tiêu công ty là `level: "onehub"` (`packages/validation/src/okr-muc-tieu.ts:4`).
- Khung vẽ: `FlowMap` + `flow-layout` CHƯA có trên nhánh; kế hoạch DH4 (Task 1) giữ prop `focusId`
  «để DH5 dùng». Bản mẫu của khung có sẵn đèn đường đi (`lightId = hoverId ?? focusId`, nút ngoài
  đường mờ) và `pathAround(edges, focusId)` duyệt cả lên lẫn xuống — nếu DH4 rút đủ phần đó thì vòng
  này không phải mở rộng API khung.
- Rào: `objective-sheet.tsx` nằm trong `paths` của eval ở mười bảy hồ sơ đã ký (mười có rào script,
  vd `duong-ly-do-muc-tieu/rang/giu-ho-so.mjs` canh đúng khu «Đường lý do»), và `config.yaml` chạy
  design-gate static trên tệp này. Sửa tệp được, nhưng mọi eval đó phải chạy lại xanh và test của
  chúng không được đổi — giá đó trình ở Cổng Phạm vi.
- Gộp: DH1 (`dieu-huong-khu-muc-tieu`, chưa gộp) và DH4 cùng thêm khối vào `lib/messages/okr.ts` và
  `lib/search-param-keys.ts`; DH1–DH3 không chạm `objective-sheet.tsx`.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: từ ngăn chi tiết một mục tiêu cấp phòng ban có đường lên công ty, trưởng đơn vị có nói đúng mục tiêu ấy góp vào KR nào của công ty trong 10 giây không?
- Kết quả nào là SỐNG: ít nhất 2/3 người dự phiên nghiệm thu (trưởng đơn vị) nói đúng KR công ty mà mục tiêu góp vào trong ≤ 10 giây kể từ lúc bấm «Xem quanh mục tiêu».
- Kết quả nào là CHẾT: dưới 2/3 người dự nói đúng trong 10 giây, hoặc có người nói sai KR (chọn một KR công ty mà mục tiêu không góp vào).
- Timebox: phiên nghiệm thu chung với DH4, trong 14 ngày sau khi lên production, chậm nhất 2026-11-04; dựng theo mốc m-1021dh, ước ~7 giờ máy, hoàn tất dự kiến 2026-10-21.

## Kết quả prototype

Bản mẫu `/proto/so-do-can-chinh-okr` (nhánh `feat/so-do-can-chinh-okr`, `6e98e80e5`, 14/10) có
trạng thái `ST-sodo-quanh-muc-tieu`: dòng «Đang xem quanh: <tên>», nút «Về sơ đồ đơn vị», chú thích
«Phía trên: những gì mục tiêu này góp vào. Phía dưới: KR của nó. Rê chuột lên một thẻ để làm nổi
đường đi», khung vẽ cao 600px với `focusId` là mục tiêu tâm. Dữ liệu mẫu: mục tiêu góp vào cả một
KR công ty lẫn một mục tiêu bộ phận cùng góp vào KR ấy — KR công ty hiện một lần. Bản mẫu chỉ vẽ KR
của mục tiêu tâm ở phía dưới, chưa vẽ mục tiêu góp vào nó; chưa có lối vào từ ngăn chi tiết. Nhánh
tụt khoảng 408 commit so với `onehub` nên không gộp — chỉ đọc bằng `git show`.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn (đường dẫn/tên gói) | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Khung vẽ, đèn đường đi, xếp vị trí | `FlowMap` + `flow-layout` của DH4 (rút từ block Pro `@reui/flow-2` theo luật «Block có phần máy») | triết-lý/logic | có, dùng qua API của DH4, không sửa tệp khung | — |
| Sơ đồ quanh một mục tách khỏi sơ đồ theo đơn vị | Tability Dependencies Map | triết-lý/logic | có | — |
| Trạng thái «quanh mục tiêu» của bản mẫu | `apps/app/app/proto/_modules/so-do-can-chinh-okr/` ở nhánh bản mẫu | ngôn-ngữ-thiết-kế/hình-thái đã có trong kho | có, dựng lại trên nhánh DH4 | Người ký Cổng Đáng |

## Cổng 0

- **decision = build.** Căn cứ: hàng DH5 thuộc mốc m-1021dh mà chủ kho mở 15/10 (crm #375); dựng trên khung vẽ `FlowMap` của DH4. manh chọn «build» 2026-10-15.
- **disposition = archive.** Căn cứ: nhánh bản mẫu tụt khoảng 408 commit so với `onehub`, không gộp, không rebase; vòng chỉ đọc nó bằng `git show` rồi dựng lại trên nhánh cắt từ nhánh DH4. Bản mẫu giữ nguyên ở nhánh của nó làm tham chiếu.
- **Ngưỡng UAT chốt cùng lúc ký:** SỐNG ít nhất 2/3 người dự phiên nghiệm thu (trưởng đơn vị) nói đúng KR công ty mà mục tiêu góp vào trong ≤ 10 giây kể từ lúc bấm «Xem quanh mục tiêu»; CHẾT dưới 2/3 người dự nói đúng trong 10 giây, hoặc có người nói sai KR; phiên nghiệm thu chung với DH4, trong 14 ngày sau khi lên production, chậm nhất 2026-11-04 — chốt tại Cổng Đáng 2026-10-15, manh («build»; disposition và ngưỡng theo đúng dòng máy điền sẵn «___ · archive · ngưỡng giữ như đề xuất — manh»).

## Thước đo thành công → ứng viên criterion

- Nói đúng KR công ty trong 10 giây → AC đường lên tới mục tiêu/KR cấp `onehub` hiện trọn, mục tiêu tâm nổi rõ, KR công ty nhận ra được không cần mở thẻ.
- Góp hai chỗ hiện một lần → AC mỗi mục tiêu/KR là một thẻ dù nhiều đường đi qua nó.
- Ai góp vào nó → AC phía dưới có KR của mục tiêu tâm và mục tiêu góp thẳng vào nó.
- Lối vào → AC nút «Xem quanh mục tiêu» ở ngăn chi tiết mục tiêu mở sơ đồ với mục tiêu ấy làm tâm.
- Rê chuột làm nổi đường đi → AC đèn đường đi của khung.

## Bảng nợ kế thừa (CHỈ khi disposition: keep)

| Path | Giữ / Dựng lại | Chạm t3_paths? | Ghi chú |
|---|---|---|---|

## Out of scope từ khám phá

- Sơ đồ theo đơn vị toàn công ty (D1–D4, D6, B5) — là DH4.
- Sửa căn chỉnh từ sơ đồ (kéo nối, đổi cha, gỡ) — vòng chỉ đọc; gỡ/sửa vẫn ở tab «Căn chỉnh».
- Đi xuống quá một bậc (cháu, chắt góp vào) — câu giao hỏi «ai góp vào nó», không hỏi cả cây con.
- Đổi khu «Đường lý do» hay tab «Căn chỉnh» của ngăn chi tiết.
