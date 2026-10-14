---
schema_version: 1
feature: Căn chỉnh gắn bằng tay và căn chỉnh Kara đề xuất đều mang lý do — hộp thoại gắn có ô lý do và căn cứ, sửa được lý do sau khi gắn, đề xuất căn chỉnh của Kara mang lý do và căn cứ khi nhận
slug: gan-tay-va-kara-co-ly-do
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-14T00:55:22Z
design_doc: docs/superpowers/specs/2026-10-14-gan-tay-va-kara-co-ly-do-design.md
---

# Acceptance Contract: gan-tay-va-kara-co-ly-do

## Context

Hàng L4 của `docs/plan/lo-trinh-okr.json` («Căn chỉnh gắn bằng tay và căn chỉnh Kara đề xuất đều mang lý do»), Cổng
Đáng ký `build` 12/10. L1 thêm cột lý do và mức tin, L2 hiện lý do trên sheet, L3 trên cây; hai đường sinh căn chỉnh
hằng ngày vẫn ghi căn chỉnh trống lý do: hộp thoại gắn tay chỉ chọn đích, và nhận đề xuất căn chỉnh của Kara bỏ rơi
lý do Kara đã viết (`TroLyOkrService.ghiTheoDong` gọi `addAlignmentTrong` không kèm lý do). Hợp đồng L1 xếp vào hàng
này: ô lý do khi gắn tay, đề xuất của Kara kèm lý do, Kara soạn căn cứ, sửa lý do sau khi đã có và đổi `lyDoTuKara`
về false khi một người sửa.

Quyết định đã có: lý do không bắt buộc (chủ kho 08/10); bảng mức tin → nghĩa của L2 (`NGHIA_MUC_TIN`, chủ kho 13/10).

Source input: `opportunity.md`, design doc ở frontmatter, bản vẽ trước/sau phiên Logic Tree 08/10 mục 01 và 02.

## Criteria

- AC-1: Given luật chung `lyDoCanChinhNhap` và `mucTinCanChinh` ở `@crm/validation/ly-do-can-chinh`, When nhận lần lượt các cặp viết trước — lý do «  Tăng tỷ lệ chốt  » (khoảng trắng hai đầu) · lý do `''`, `'   '`, `' \n\t'` · lý do 501 ký tự · căn cứ có chữ với lý do rỗng · căn cứ 501 ký tự —, Then lý do được cắt khoảng trắng; ba chuỗi rỗng thành `null`; hai chuỗi quá 500 ký tự bị từ chối; căn cứ thiếu lý do bị từ chối với mã `can-cu-can-ly-do`; And `mucTinCanChinh` trả `chua-co-ly-do`, `dat-cuoc`, `co-so-lieu` cho (null, null), (lý do, null), (lý do, căn cứ); And `apps/api/src/okr/can-chinh.ts` xuất lại đúng hàm đó (cùng một tham chiếu), không giữ bản thứ hai.
- AC-2 (cross-layer): Given người sửa được mục tiêu P, When gọi `okr.addAlignment` qua tRPC và qua REST (`POST /okr/alignments`) với lý do «  Tăng tỷ lệ chốt  » và căn cứ «Mảng X chiếm 30% doanh thu Q3», Then căn chỉnh mới có `lyDo` đã cắt, `canCu` như gửi, `lyDoTuKara` = false, và `okr.objective` của P trả căn chỉnh đó với `mucTin` = `co-so-lieu`; And gọi không gửi hai trường thì ra (null, null, false) như trước; And gửi căn cứ mà không lý do thì 400 và không có căn chỉnh nào được tạo.
- AC-3 (cross-layer): Given căn chỉnh A của P có (`lyDo`, `canCu`, `lyDoTuKara`) = («Lý do Kara», null, true), When người sửa được P gọi `okr.suaLyDoCanChinh` qua tRPC và qua REST (`PATCH /okr/alignments/{id}`) với lý do «Lý do người» và căn cứ «Căn cứ người», Then A có đúng hai chữ đó, `lyDoTuKara` = false, `mucTin` đọc qua `okr.objective` là `co-so-lieu`, và vết của P có đúng một dòng `sua-ly-do-can-chinh` mang lý do và căn cứ cũ và mới; And gửi lại y nguyên chữ đang lưu thì không thêm dòng vết nào và `lyDoTuKara` không đổi; And gửi hai ô rỗng thì A về `chua-co-ly-do`.
- AC-4: Given `okr.suaLyDoCanChinh`, When gọi bởi người không sửa được P, trên căn chỉnh không tồn tại, trên mục tiêu `da-bo` hay `cho-duyet`, hay trong chu kỳ không ghi được, Then mỗi ca nhận đúng lời từ chối mà `okr.removeAlignment` trả cho cùng ca đó và căn chỉnh không đổi; And vai «chỉ OKR» với được thủ tục này như `addAlignment` (danh sách của `vai-chi-okr.spec.ts` có thêm đúng một tên).
- AC-5: Given Kara nộp một dòng `can-chinh` có `lyDo` và `canCu` «Mảng X chiếm 30% doanh thu Q3» qua công cụ `nop_de_xuat` của `tro_ly_okr` (và qua `nopDeXuatVao` mà công cụ gọi), When đọc lại dòng qua `dongTuHang` và qua `okr.troLyDanhSach`, Then dòng mang đúng `canCu` đó; And dòng `can-chinh` cũ không có `noiDung` đọc ra `canCu` = null; And `dongGopY` từ chối `canCu` trên dòng `viet-lai` hay `hoi`, và từ chối `canCu` quá 200 ký tự.
- AC-6 (cross-layer): Given đề xuất `can-chinh` còn chờ của Kara trên P với `lyDo` L và `canCu` C, When người sửa được P nhận nó (`okr.troLyQuyet`, cách `nhan`) qua tRPC và qua REST, Then căn chỉnh mới có `lyDo` = L, `canCu` = C, `lyDoTuKara` = true và `okr.objective` của P trả `mucTin` = `co-so-lieu`; And đề xuất không có căn cứ cho `dat-cuoc`; And Hoàn tác của K3 vẫn gỡ đúng căn chỉnh đó.
- AC-7 (cross-layer): Given cùng đề xuất đó, When người sửa được P dùng cách `sua` với lý do L2 và căn cứ C2, qua tRPC và qua REST, Then căn chỉnh mới có `lyDo` = L2, `canCu` = C2, `lyDoTuKara` = false, dòng đề xuất ở trạng thái `sua` với `giaTriCuoi` = L2; And cách `sua` gửi y nguyên lý do và căn cứ của Kara (sau khi cắt khoảng trắng) thì như nhận: `lyDoTuKara` = true, dòng ở trạng thái `nhan`; And cách `sua` thiếu lý do bị từ chối như với dòng viết lại; And căn cứ thiếu lý do bị từ chối với cùng mã của AC-1.
- AC-8 (judgment): Given chỉ dẫn của `tro_ly_okr` (`apps/agent/agent/subagents/tro_ly_okr/instructions.md`), Then mục dòng `can-chinh` nói rõ: `lyDo` là vì sao mục tiêu này đẩy được đích; `canCu` chỉ viết khi khối dữ liệu có con số chống lưng và chép đúng số đó, không có thì để trống; luật «không viết số không có trong dữ liệu» áp cho cả `canCu`.
- AC-9: Given hộp thoại căn chỉnh ở chế độ gắn, When người gõ vào hai ô, Then dòng mức tin đổi theo chữ đã cắt khoảng trắng — `Chưa có lý do` (kể cả lý do chỉ có khoảng trắng), `Đặt cược` (kể cả căn cứ chỉ có khoảng trắng), `Có số liệu` — với nhãn và `tone` của bảng L2 (`NGHIA_MUC_TIN`); căn cứ có chữ mà lý do trống thì có lỗi dưới ô căn cứ và nút Gắn khoá; bấm Gắn gửi lý do và căn cứ đã cắt khoảng trắng; And ở chế độ sửa (mở từ «Sửa lý do» trên dòng tab Căn chỉnh) đích khoá, hai ô điền sẵn chữ đang lưu, nút Lưu gọi `okr.suaLyDoCanChinh`; And ở chế độ nhận đề xuất (mở từ «Sửa lý do» trên đề xuất của Kara) đích khoá, hai ô điền sẵn chữ Kara, nút gửi `okr.troLyQuyet` cách `sua`; And người không sửa được mục tiêu không thấy nút «Sửa lý do».
- AC-10: Given đề xuất `can-chinh` của Kara có lý do và căn cứ, When nhóm Kara trên sheet hiện nó, Then dòng có nhãn mức tin (`StatusIndicator`, tone theo `NGHIA_MUC_TIN`), dòng «Vì sao» bằng đúng `lyDo`, dòng «Căn cứ» bằng đúng `canCu`, và ba nút «Căn chỉnh kèm lý do» (chính), «Sửa lý do» (viền), «Bỏ qua» (chữ); đề xuất không căn cứ không có dòng «Căn cứ» và nhãn là «Đặt cược»; phần tử chứa lý do và căn cứ mang `translate="no"`.
- AC-11: Given chữ khung mới của hộp thoại và đề xuất, Then chúng đến từ `apps/app/lib/messages/okr.ts` và `apps/app/lib/messages/okr-gop-y.ts`, có đủ `vi` và `en` khác nhau; nhãn mức tin dùng lại `sheet.mucTin` của L2, không khai bản thứ hai.
- AC-12 (cross-layer): Given bộ OKR mẫu đã nạp, When mở sheet của mục tiêu mẫu có đề xuất căn chỉnh của Kara ở 1440 và 390 px, Then đề xuất hiện nhãn «Có số liệu», lý do và căn cứ mẫu; bấm «Căn chỉnh kèm lý do» thì khu «Đường lý do» (L2) hiện lý do đó với dấu Kara và nhãn «Có số liệu»; mở «Sửa lý do» trên căn chỉnh đó, xoá căn cứ, Lưu thì nhãn thành «Đặt cược» và dấu Kara mất; trang không cuộn ngang; có ảnh khung nhìn từng bước.
- AC-13: Given bộ OKR mẫu đã nạp và Kara đã bật cho chương trình qua `okr.setProgram` (như phiên đo màn làm), When chạy hàm nạp đề xuất mẫu `napDeXuatKaraMau` của bộ mẫu (`apps/api/scripts/okr-mau/nap-de-xuat-kara.ts`), Then có một đề xuất `can-chinh` của Kara còn chờ, mang lý do và căn cứ, ghi qua công cụ `nop_de_xuat` thật trên một `AgentTask` loại `okr-de-xuat` xếp bằng `xepViecTroLy`; không tệp nào của bộ mẫu chèn thẳng bảng `okrDeXuat`.
- AC-14: Given các hồ sơ đã ký có eval `test` không khai `status: not-run` mà `paths` ghi đích danh một tệp mã sản phẩm vòng này sửa, When chạy lại đúng lệnh của từng eval, Then mọi lệnh thoát đúng mã kỳ vọng; And `apps/api/test/okr-can-chinh.spec.ts` và `apps/api/test/okr-ly-do-can-chinh.spec.ts` không đổi dòng nào.
- AC-15: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp khai ở `## Notes` (mục Ranh giới), `_acceptance/gan-tay-va-kara-co-ly-do/**`, `docs/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` đổi; các tệp chỉ-thêm chỉ có dòng THÊM.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature), 14/10. Chân sản phẩm: `hop-thoai-can-chinh.tsx`,
`tro-ly.service.ts`, `nop-de-xuat.ts`, `okr-tro-ly.ts`; chân ngành mượn từ quét của L1.

- **Trục A — căn chỉnh sinh ra từ đâu:** gắn tay | nhận đề xuất Kara | sửa rồi nhận đề xuất Kara | sửa sau khi gắn.
  - Thước CE: các lời gọi `addAlignmentTrong` (`okr.service.ts`, `tro-ly.service.ts`, `soan-dua-vao.ts`) [SUY-TỪ-REPO: apps/api/src/okr/tro-ly.service.ts].
- **Trục B — chữ người gửi:** lý do có chữ | rỗng hay chỉ khoảng trắng | quá trần | căn cứ không kèm lý do.
  - Thước CE: `lyDoCanChinhNhap` và luật `khuon.ts` của bộ mẫu [SUY-TỪ-REPO: apps/api/scripts/okr-mau/khuon.ts].
- **Trục C — mức tin:** chưa có lý do | đặt cược | có số liệu.
  - Thước CE: `MUC_TIN_CAN_CHINH` [SUY-TỪ-REPO: apps/api/src/okr/can-chinh.ts].
- **Trục D — ai viết:** Kara (`lyDoTuKara` = true) | người (false) | người sửa chữ của Kara (đổi về false).
  - Thước CE: `docs/ai-ux.md` §3 [SUY-TỪ-REPO: docs/ai-ux.md].
- **Trục E — ai gọi:** người sửa được | người không sửa được | vai «chỉ OKR» | chu kỳ khoá, mục tiêu bỏ hay chờ duyệt.
  - Thước CE: cổng của `removeAlignment` và `vai-chi-okr.spec.ts` [SUY-TỪ-REPO: apps/api/test/vai-chi-okr.spec.ts].
- **Cross-cutting:** tRPC | REST; khổ 1440 | 390; `vi` | `en`; `translate="no"`.
- **Ô Core:** luật chung (AC-1) · gắn tay (AC-2) · sửa sau khi gắn (AC-3, AC-4) · Kara viết căn cứ (AC-5, AC-8) · nhận
  (AC-6) · sửa rồi nhận (AC-7) · hộp thoại (AC-9) · đề xuất (AC-10) · chữ (AC-11) · màn thật (AC-12) · mẫu (AC-13) ·
  giữ hồ sơ đã ký (AC-14) · ranh giới (AC-15).
- **Đối chiếu ngành:** [NGÀNH: Atlassian Goals — liên kết mục tiêu kèm «why this goal matters»]; [NGÀNH: Mooncamp/Perdoo — alignment có ghi chú, không bắt buộc] [SUY-TỪ-REPO: _acceptance/ly-do-can-chinh-tu-soan/contract.md].
- **Later:** Kara soạn nháp lý do trong hộp thoại gắn tay (Hỏi-1); điền lại lý do cho căn chỉnh đã nhận từ Kara trước
  bản này (Hỏi-2); căn cứ và «Sửa rồi nhận» ở Soạn OKR (bản vẽ mục 05); căn cứ có đường dẫn nguồn.
- **Never:** bắt buộc lý do (chủ kho chọn không, 08/10).

## Out of scope

- Kara soạn nháp lý do và căn cứ ngay trong hộp thoại gắn tay (bản vẽ mục 01 «Kara soạn nháp») — chủ kho chọn tách hàng L4b (Hỏi-1, 14/10).
- Điền lại lý do cho căn chỉnh đã nhận từ đề xuất của Kara trước bản này — cần `migration`; chủ kho chọn không làm trong L4 (Hỏi-2, 14/10).
- Màn Soạn OKR: căn cứ và «Sửa rồi nhận» ở dòng căn chỉnh nháp (bản vẽ mục 05).
- Đổi cách chọn đích, quyền xem, quyền sửa, tiến độ; đổi `migration` hay cột cơ sở dữ liệu.

## Notes

- Ranh giới (xin `cham-tep` trước S3; bốn tệp sau dấu «S3» thêm ở S3, có dòng sổ quyết định): `packages/validation/src/ly-do-can-chinh.ts` (mới), `packages/validation/src/okr-tro-ly.ts`, `packages/validation/package.json` (chỉ thêm đường con), `packages/validation/test/ly-do-can-chinh.spec.ts` (mới); `apps/api/src/okr/can-chinh.ts`, `apps/api/src/okr/okr.contracts.ts`, `apps/api/src/okr/okr.service.ts`, `apps/api/src/okr/okr.router.ts`, `apps/api/src/okr/okr-config.ts`, `apps/api/src/okr/tro-ly.service.ts`, `apps/api/src/generated/server.ts` (sinh lại bằng `trpc:generate`); `apps/api/test/okr-gan-ly-do.spec.ts` (mới), `apps/api/test/vai-chi-okr.spec.ts` (chỉ thêm một tên); `apps/api/scripts/okr-mau/nap-de-xuat-kara.ts` (mới); `apps/agent/agent/lib/okr/nop-de-xuat.ts`, `apps/agent/agent/subagents/tro_ly_okr/instructions.md`, `apps/agent/test/nop-de-xuat-can-cu.integration.spec.ts` (mới); `apps/app/app/(app)/[slug]/okr/hop-thoai-can-chinh.tsx`, `apps/app/app/(app)/[slug]/okr/nhom-kara.tsx`, `apps/app/app/(app)/[slug]/okr/gop-y-kara.ts`, `apps/app/components/crm/record-sheet/objective-sheet.tsx`, `apps/app/lib/messages/okr.ts` (chỉ thêm), `apps/app/lib/messages/okr-gop-y.ts` (chỉ thêm, trừ giá trị `dong.canChinh` — cham-tep P2-16), `apps/app/test/gan-ly-do.dom.tsx` (mới); `_acceptance/config.yaml` (chỉ thêm); S3: `packages/db/src/okr-vet.ts` (chỉ thêm một hành động vết), `apps/app/test/khung-gop-y.tsx` (chỉ thêm `canCu: null` vào dữ liệu giả), `packages/validation/src/okr-kiem-de-xuat.ts` (căn cứ qua cùng bộ soát chữ), `apps/app/test/gop-y-dung-cho-khung.tsx` (hai chỗ đếm nút của bài đã ký `gy_khoa`, `gy_focus_khung` theo nút «Sửa lý do»).
- Không `migration`: căn cứ của đề xuất Kara nằm trong cột JSON `OkrDeXuat.noiDung` đã có.
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/api.md`, `docs/agent.md`, `docs/ai-ux.md`, `docs/design.md`.
- Repo khai `feature_loop.ui_standards_skill: web-design-guidelines` nhưng skill đó không cài trên máy này — artifact UI
  không có đối trọng chuẩn nội ngoài `docs/design.md` và `docs/ai-ux.md`.
