---
schema_version: 1
feature: Cây căn chỉnh hiện lý do và mức tin của từng chỗ nối, lọc được các nhánh «Chưa có lý do» và «Đặt cược»
slug: cay-can-chinh-co-ly-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-13T08:21:19Z
design_doc: docs/superpowers/specs/2026-10-13-cay-can-chinh-co-ly-do-design.md
---

# Acceptance Contract: cay-can-chinh-co-ly-do

## Context

Hàng L3 của `docs/plan/lo-trinh-okr.json` («Cây căn chỉnh hiện lý do của từng đường nối và lọc được các đường «Chưa
có lý do»»), Cổng Đáng ký `build` 12/10. Lý do và mức tin của căn chỉnh có từ L1; L2 đã hiện chúng trên sheet mục
tiêu với bảng mức tin → nghĩa chủ kho chọn 13/10. Hàng này đưa chúng lên cây căn chỉnh (OKR → Theo đơn vị → Cây
căn chỉnh) và thêm bộ lọc.

Source input: `opportunity.md`, design doc ở frontmatter, hợp đồng L1 (`_acceptance/ly-do-can-chinh-tu-soan/contract.md`, Out of scope: «Lý do trên cây căn chỉnh và bộ lọc «Chưa có lý do» / «Đặt cược» (L3)»).

## Criteria

- AC-1 (cross-layer): Given chu kỳ có các căn chỉnh mang ba mức tin, When gọi `okr.cayCanChinh` qua tRPC, Then đầu ra có `canh` gồm đúng một phần tử cho mỗi chỗ nối của mục tiêu có mặt trong cây — `tu` = id mục tiêu con, `den` = id KR hoặc mục tiêu đích — với `lyDo`, `canCu`, `lyDoTuKara`, `mucTin` bằng giá trị `okr.objective` trả cho căn chỉnh đó; `roots` và `chuaCanChinh` giữ nguyên như trước vòng.
- AC-2: Given tập mục tiêu mà một người dùng thấy (đầu vào của cây), When dựng `canh`, Then chỉ có cạnh mà cả `tu` lẫn `den` nằm trong tập đó — cạnh trỏ tới mục tiêu hay KR ngoài tập bị bỏ; And trên bộ OKR mẫu, với mọi người dùng, mọi phần tử `canh` họ nhận có hai đầu là id có mặt trong cây trả cho chính họ.
- AC-3: Given cây có nút mục tiêu P góp vào KR K với cạnh `co-so-lieu` do Kara viết, When mở Cây căn chỉnh, Then nút P dưới K hiện nhãn «Có số liệu» với `tone` của nghĩa `xong`, một dòng lý do bằng đúng `lyDo`, và đúng một dấu Kara; nút gốc và nút KR không có dòng lý do.
- AC-4: Given ba nút con mang ba mức tin, When mở Cây căn chỉnh, Then nhãn và `tone` của từng nút đúng bảng mức tin → nghĩa của L2 (`NGHIA_MUC_TIN`, không khai bảng thứ hai); nút `chua-co-ly-do` chỉ mang nhãn «Chưa có lý do» — không dòng lý do, không dấu Kara.
- AC-5: Given mục tiêu P góp vào hai chỗ (nút hiện hai lần, lần hai `lapLai`) với hai lý do khác nhau, When mở Cây căn chỉnh, Then mỗi lần P hiện mang đúng lý do của chỗ nối dưới cha của lần đó.
- AC-6: Given cây có cạnh ở cả ba mức, When bấm chip «Chưa có lý do», Then chỉ còn nút mục tiêu có cạnh `chua-co-ly-do`, cùng mọi tổ tiên của chúng; nút không khớp mà không có hậu duệ khớp không hiện; mục «Chưa căn chỉnh» không hiện; đường dẫn mang giá trị lọc qua `nuqs`; And «Đặt cược» lọc tương tự; And «Tất cả» trả cây đầy đủ.
- AC-7: Given chip lọc, Then mỗi chip mang số cạnh của mức đó trong cây (chip «Tất cả» mang tổng số cạnh); chip có số 0 vẫn bấm được; lọc một mức không có cạnh nào → màn rỗng của cây với câu riêng, không phải cây trống câm; giá trị lọc lạ trên đường dẫn đọc như «Tất cả».
- AC-8: Given dữ liệu người nhập (lý do), Then phần tử chứa nó mang `translate="no"`; chip «Chưa có lý do» và «Đặt cược» mang đúng nhãn mức tin của L2 (`okr.ts`, `sheet.mucTin`); chữ khung mới (chip «Tất cả», câu rỗng của bộ lọc) đến từ `apps/app/lib/messages/okr-toan-canh.ts` và có đủ `vi`, `en` khác nhau.
- AC-9 (cross-layer): Given bộ OKR mẫu đã nạp (ba ca mức tin của L2), When mở Theo đơn vị → Cây căn chỉnh ở 1440 và 390 px, Then ba dòng mục tiêu mẫu (một nối lên KR, một nối thẳng lên mục tiêu) hiện đúng nhãn mức tin đã gieo, dòng lý do không bị cắt, trang không cuộn ngang; bấm chip «Chưa có lý do» thì dòng `q4-kd-nam-2` còn, hai dòng mục tiêu kia không hiện; bấm «Đặt cược» thì chỉ `q4-kd-bac-2` còn trong ba; có ảnh khung nhìn từng bộ lọc.
- AC-10: Given các hồ sơ đã ký có eval `test` không khai `status: not-run` mà `paths` ghi đích danh một tệp mã sản phẩm vòng này sửa, When chạy lại đúng lệnh của từng eval, Then mọi lệnh thoát đúng mã kỳ vọng; And `apps/api/test/okr-can-chinh.spec.ts` không đổi dòng nào và `apps/api/src/okr/can-chinh.ts` không đổi.
- AC-11: Given diff của vòng so với chỗ tách khỏi `feat/duong-ly-do-muc-tieu` (hoặc `onehub` khi L2 đã gộp), Then chỉ các tệp khai ở `## Notes` (mục Ranh giới), `_acceptance/cay-can-chinh-co-ly-do/**`, `docs/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` đổi; các tệp chỉ-thêm chỉ có dòng THÊM.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature), 13/10. Chân sản phẩm: `okr-xem.contracts.ts`, `can-chinh.ts`,
`cay-can-chinh.tsx`; chân ngành mượn từ quét của L1.

- **Trục A — mức tin của cạnh:** chưa có lý do | đặt cược | có số liệu.
  - Thước CE: `MUC_TIN_CAN_CHINH` [SUY-TỪ-REPO: apps/api/src/okr/can-chinh.ts].
- **Trục B — vị trí nút:** gốc | KR | mục tiêu con | mục tiêu con hiện lại (`lapLai`) | nhóm chưa căn chỉnh.
  - Thước CE: `dungCayCanChinh` [SUY-TỪ-REPO: apps/api/src/okr/can-chinh.ts].
- **Trục C — bộ lọc:** tất cả | chưa có lý do | đặt cược | lọc rỗng | giá trị lạ.
- **Trục D — tập mục tiêu người dùng thấy:** đủ cả hai đầu | thiếu một đầu (luật quyền chỉ giấu mục tiêu giới hạn, mà mục tiêu giới hạn không căn chỉnh được — ca thiếu đầu chỉ dựng được ở bài thuần).
  - Thước CE: `mucTieuCuaCay` lọc quyền [SUY-TỪ-REPO: apps/api/src/okr/okr.service.ts].
- **Cross-cutting:** khổ 1440 | 390; `vi` | `en`; `translate="no"`; dấu Kara (`docs/ai-ux.md` §3).
- **Ô Core:** cạnh trong đầu ra (AC-1) · quyền (AC-2) · nút con có số liệu (AC-3) · ba mức (AC-4) · `lapLai` (AC-5) · lọc (AC-6) · số đếm, rỗng, giá trị lạ (AC-7) · chữ (AC-8) · màn thật (AC-9) · giữ hồ sơ đã ký (AC-10) · ranh giới (AC-11).
- **Đối chiếu ngành:** [NGÀNH: Atlassian Goals — liên kết mục tiêu kèm «why this goal matters»]; [NGÀNH: Mooncamp/Perdoo — alignment có ghi chú, không bắt buộc] [SUY-TỪ-REPO: _acceptance/ly-do-can-chinh-tu-soan/contract.md].
- **Later:** lọc «Có số liệu»; số đầu → đích của KR trên cạnh; ô lý do khi gắn tay, sửa lý do, đề xuất căn chỉnh của Kara kèm lý do (L4).
- **Never:** bắt buộc lý do (chủ kho chọn không, 08/10).

## Out of scope

- Đổi kiểu nút cây `NutCanChinh` hay hàm `dungCayCanChinh` — lý do đi trong danh sách `canh` riêng.
- Lọc «Có số liệu», và lọc kết hợp với bộ lọc của kiểu xem Danh sách.
- Sửa, thêm hay xoá lý do từ cây (L4).
- Đổi `migration` hay cột cơ sở dữ liệu.

## Notes

- Ranh giới (xin `cham-tep` trước S3): `apps/api/src/okr/okr-xem.contracts.ts`, `apps/api/src/okr/okr-xem.service.ts`,
  `apps/app/app/(app)/[slug]/okr/cay-can-chinh.tsx`, `apps/app/app/(app)/[slug]/okr/theo-don-vi/theo-don-vi.tsx`,
  `apps/app/app/(app)/[slug]/okr/okr-search-params.ts`, `apps/app/lib/search-param-keys.ts` (chỉ thêm),
  `apps/app/lib/messages/okr-toan-canh.ts` (chỉ thêm), `apps/app/test/okr-theo-don-vi.dom.tsx` (chỉ thêm `canh` vào
  dữ liệu giả), `apps/app/test/cay-can-chinh-ly-do.dom.tsx` (mới), `apps/api/test/okr-cay-ly-do.spec.ts` (mới),
  `_acceptance/config.yaml` (chỉ thêm).
- Nhánh chồng lên L2 (`feat/duong-ly-do-muc-tieu`, đã ký, chờ CI để gộp): dùng lại `NGHIA_MUC_TIN` của
  `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx` và ba ca bộ mẫu của L2. Không sửa tệp nào của L2.
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/api.md`, `docs/design.md`, `docs/ai-ux.md`.
