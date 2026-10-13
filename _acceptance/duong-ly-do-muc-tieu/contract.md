---
schema_version: 1
feature: Sheet mục tiêu hiện lý do căn chỉnh, căn cứ và mức tin của từng chỗ nối lên mục tiêu cha, kèm dấu Kara khi Kara viết lý do; bộ OKR mẫu gieo đủ ba mức tin
slug: duong-ly-do-muc-tieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: draft
design_doc: docs/superpowers/specs/2026-10-13-duong-ly-do-muc-tieu-design.md
---

# Acceptance Contract: duong-ly-do-muc-tieu

## Context

Hàng L2 của `docs/plan/lo-trinh-okr.json` («Sheet mục tiêu hiện lý do căn chỉnh của từng đường nối lên mục tiêu
cha»), Cổng Đáng ký `build` 12/10. L1 (#348) đã thêm `lyDo`, `canCu`, `lyDoTuKara` vào căn chỉnh và trả `mucTin`
trong `okr.objective`; chưa màn nào đọc. Hàng này chỉ đọc — không đổi API, không `migration`. Bố cục và màu mức tin anh đã chọn theo khuyến nghị (13/10, lượt 1 qua giám sát): giữ thứ tự cũ, khối «Góp vào» thành «Đường lý do»; Có số liệu = xong, Đặt cược = nháp, Chưa có lý do = chờ.

Source input: `opportunity.md`, design doc ở frontmatter, hợp đồng L1 `_acceptance/ly-do-can-chinh-tu-soan/contract.md`.

## Criteria

- AC-1: Given mục tiêu có một căn chỉnh qua KR với `lyDo` «Tăng tỷ lệ chốt 18% lên 25% thêm khoảng 9 tỷ», `canCu` «Mảng X chiếm 30% doanh thu Q3», `lyDoTuKara` = true, `mucTin` = `co-so-lieu`, When mở sheet mục tiêu ở tab KR, Then khối căn chỉnh (`[data-khu=gop-vao]`, vẫn đứng sau «Vì sao lúc này» và trước bảng KR) mang tiêu đề «Đường lý do», và trong dòng `[data-gop-vao]` của căn chỉnh đó có phần lý do `[data-ly-do]` hiện đúng câu lý do, dòng «Căn cứ: Mảng X chiếm 30% doanh thu Q3», nhãn «Có số liệu», và đúng một dấu Kara; `item-title` và `item-description` của dòng giữ nguyên như trước vòng.
- AC-2: Given ba căn chỉnh của cùng một mục tiêu với `mucTin` lần lượt `chua-co-ly-do`, `dat-cuoc`, `co-so-lieu`, When mở sheet, Then nhãn mức tin của từng dòng lần lượt là «Chưa có lý do», «Đặt cược», «Có số liệu» và `data-tone` của chấm lần lượt bằng `toneTheoNghia("cho")`, `toneTheoNghia("nhap")`, `toneTheoNghia("xong")`; nhãn đọc từ `mucTin` API trả, không tính lại từ `lyDo`/`canCu` ở màn.
- AC-3: Given căn chỉnh `chua-co-ly-do` (`lyDo` null), When mở sheet, Then phần lý do chỉ có nhãn «Chưa có lý do» — không phần tử câu lý do, không dòng «Căn cứ», không dấu Kara; And Given căn chỉnh `dat-cuoc` (`lyDo` có, `canCu` null), Then có câu lý do và nhãn «Đặt cược», không dòng «Căn cứ». And Given mục tiêu không có căn chỉnh nào, Then không có khối «Góp vào» nào.
- AC-4: Given căn chỉnh thẳng lên mục tiêu cha (`keyResultTitle` null) có lý do, When mở sheet, Then phần lý do hiện như AC-1 và `item-description` của dòng chỉ là tên đơn vị như trước vòng.
- AC-5: Given `lyDoTuKara` = false với `lyDo` có chữ, Then không có dấu Kara trong phần lý do; Given hai căn chỉnh có lý do, một của Kara một của người, Then số dấu Kara trong khối «Góp vào» bằng đúng 1 và nằm trong dòng của căn chỉnh Kara viết.
- AC-6: Given câu lý do và căn cứ là dữ liệu người nhập, Then hai phần tử chứa chúng mang `translate="no"`; mọi chữ khung mới (tiêu đề «Đường lý do», «Căn cứ», ba nhãn mức tin) đến từ `apps/app/lib/messages/okr.ts` và có đủ bản `vi` và `en` khác nhau; đổi `locale` sang `en` thì nhãn ra bản `en`.
- AC-7: Given các hồ sơ đã ký (`status` `signed-off` hoặc `machine-cleared`) có eval `test`/`script` mà `paths` khớp một tệp đổi trong diff của vòng, When chạy lại đúng lệnh của từng eval đó trên cây của vòng này, Then mọi lệnh thoát đúng mã kỳ vọng của eval (0, hoặc `expected_exit` đã khai) — tập eval tính bằng máy từ `_acceptance/*/evals.yaml`, không chép tay; And ba tệp bài của hồ sơ đã ký `muc-tieu-va-kr` và `kara-gop-y-luot-2` (`apps/app/test/muc-tieu-va-kr.dom.tsx`, `apps/app/test/gop-y-dung-cho-luot-2.dom.tsx`, `apps/app/test/gop-y-dung-cho-luot-2-khung.tsx`) không đổi dòng nào.
- AC-8: Given bộ OKR mẫu, When nạp bằng `bun run okr:mau` trên kho kiểm, Then có ít nhất một căn chỉnh mỗi mức tin (`co-so-lieu`, `dat-cuoc`, `chua-co-ly-do`) và ít nhất một căn chỉnh có lý do với `lyDoTuKara` = true, đọc lại qua `OkrService` (đường đọc thật của `okr.objective`) ra đúng `lyDo`, `canCu`, `mucTin` đã khai; And khuôn bộ mẫu từ chối một `canChinh` có `canCu` mà không có `lyDo`, ghim đường lỗi `canChinh.canCu`.
- AC-9 (cross-layer): Given bộ mẫu đã nạp và phiên đo của cây, When mở sheet ba mục tiêu mẫu mang ba mức tin ở 1440 và 390 px, Then mỗi sheet hiện phần lý do đúng mức tin đã gieo, câu lý do và căn cứ hiện trọn — không cắt bằng dấu ba chấm, không kẹp số dòng, không cuộn ngang; ở 390 px câu lý do dài nhất của bộ mẫu xuống ít nhất hai dòng — và có ảnh khung nhìn của từng ca.
- AC-10: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp khai trong `## Notes` (mục Ranh giới), `_acceptance/duong-ly-do-muc-tieu/**`, `docs/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` và các dòng THÊM vào `_acceptance/config.yaml`, `apps/app/lib/messages/okr.ts` đổi.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature), 13/10. Chân sản phẩm: hợp đồng L1 và `okr.contracts.ts`;
chân ngành mượn từ quét của L1.

- **Trục A — mức tin:** chưa có lý do | đặt cược | có số liệu.
  - Thước CE: `MUC_TIN_CAN_CHINH` và `mucTinCanChinh` [SUY-TỪ-REPO: apps/api/src/okr/can-chinh.ts].
- **Trục B — đích căn chỉnh:** lên mục tiêu | qua KR.
  - Thước CE: `noiGopOutput.targetKeyResultId` nullable [SUY-TỪ-REPO: apps/api/src/okr/okr.contracts.ts].
- **Trục C — số căn chỉnh:** 0 | 1 | nhiều.
  - Thước CE: `mucTieuOutput.alignments` là mảng; 0 giữ hành vi cũ (không khối).
- **Trục D — ai viết lý do:** Kara (`lyDoTuKara`) | người hoặc không ai.
  - Thước CE: `docs/ai-ux.md` §3 (dấu nhỏ tại chỗ tới khi người sửa).
- **Cross-cutting:** khổ 1440 | 390; `vi` | `en`; dữ liệu người nhập `translate="no"`; quyền xem (đã chốt ở L1 AC-6, màn chỉ đọc cái API lọc).
- **Ô Core:** A×1 qua KR, Kara (AC-1) · A ba mức (AC-2) · A1, A2 vắng phần thừa và C0 (AC-3) · B lên mục tiêu (AC-4) · C nhiều × D (AC-5) · chữ và dịch (AC-6) · mọi eval đã ký chạm diff còn xanh (AC-7) · dữ liệu mẫu (AC-8) · màn thật hai khổ (AC-9) · ranh giới (AC-10).
- **Đối chiếu ngành:** [NGÀNH: Atlassian Goals — liên kết mục tiêu kèm «why this goal matters»]; [NGÀNH: Mooncamp/Perdoo — alignment có ghi chú, không bắt buộc] [SUY-TỪ-REPO: _acceptance/ly-do-can-chinh-tu-soan/contract.md].
- **Later:** số đầu → đích của KR cha trên chỗ nối (API căn chỉnh chưa trả); dời «Vì sao lúc này» xuống cuối đường như bản vẽ mục 03 (nếu anh chọn lối khác ở Hỏi-1); chuỗi nhiều bậc lên OneHub và lọc theo mức tin (L3); cột lý do ở tab Căn chỉnh, ô lý do khi gắn tay, sửa lý do (L4).
- **Never:** bắt buộc lý do — anh đã chọn không (08/10).

## Out of scope

- Đổi API hay `migration`: hàng này chỉ đọc bốn trường L1 đã trả.
- Số đầu → đích của KR cha trên chỗ nối, và chuỗi nhiều bậc lên OneHub (L3).
- Tab Căn chỉnh, hộp gắn căn chỉnh, đề xuất căn chỉnh của Kara (L4).
- Sửa hay xoá lý do; đổi `lyDoTuKara` khi người sửa (L4).

## Notes

- Ranh giới (xin `cham-tep` trước S3): `apps/app/components/crm/record-sheet/objective-sheet.tsx`,
  `apps/app/components/crm/record-sheet/ly-do-noi-gop.tsx` (mới), `apps/app/test/duong-ly-do.dom.tsx` (mới),
  `apps/api/scripts/okr-mau/khuon.ts`, `apps/api/scripts/okr-mau/nap.ts`, `apps/api/scripts/okr-mau/cong-ty.json`,
  `apps/api/test/okr-mau-ly-do.spec.ts` (mới).
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/design.md`, `docs/ai-ux.md` (§2, §3), `docs/proto.md`.
- Bộ mẫu ghi căn chỉnh bằng `createMany` từ trước (`apps/api/scripts/okr-mau/nap.ts`, khối `okrAlignment`); ba trường mới đi cùng hàng đó, không thêm đường ghi thứ hai. Đường ghi qua service cho căn cứ là việc của L4.
- Bộ mẫu là việc chung với dãy P1 (N1 `bo-ca-mau-quy-4`): chỉ thêm trường tuỳ chọn và ca mới, không sửa ca có sẵn.
