---
schema_version: 1
feature: Lý do Kara viết cho dòng căn chỉnh ở Soạn OKR đi theo căn chỉnh vào OKR thật, căn chỉnh cũ từ Soạn được điền lại, và khuôn trả của mục tiêu nói rõ mức tin của từng căn chỉnh
slug: ly-do-can-chinh-tu-soan
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api]
status: approved
approved_by: Phan Le Manh
approved_at: 2026-10-10T00:03:23Z
design_doc: docs/superpowers/specs/2026-10-08-ly-do-can-chinh-tu-soan-design.md
---

# Acceptance Contract: ly-do-can-chinh-tu-soan

## Context

Ở Soạn OKR, Kara viết một câu «vì sao» (`viSao`) cho mỗi dòng căn chỉnh nháp. «Đưa vào OKR» (`apps/api/src/okr/soan-dua-vao.ts`) chỉ chép hai id sang `OkrAlignment`, nên câu đó kẹt lại ở `okrDeXuat` và không màn nào đọc lại. Bảng `OkrAlignment` chưa có cột lý do. Đây là hàng đầu của dãy L1–L4; L2–L4 hiện và soạn lý do trên cột mà hàng này thêm.

Quyết định của anh, 08/10 18:55: lý do không bắt buộc, cột nullable, không chặn lưu.

Source input: `opportunity.md`, design doc ở frontmatter, bản vẽ trước/sau mục 05 của phiên Logic Tree.

## Criteria

- AC-1: Given một cuộc soạn có dòng `can-chinh-moi` với `viSao` «  Tăng tỷ lệ chốt thêm khoảng 9 tỷ  » (có khoảng trắng hai đầu), When người có quyền bấm «Đưa vào OKR» qua tRPC và qua REST, Then căn chỉnh mới có `lyDo` = câu đó đã cắt khoảng trắng, `lyDoTuKara` = true, `canCu` = null; mục tiêu và KR đưa vào như trước.
- AC-2: Given hàm thuần `lyDoTuSoan` (`apps/api/src/okr/can-chinh.ts`) mà «Đưa vào OKR» dùng để biến `viSao` thành lý do, When nhận một trong ba chuỗi rỗng viết trước — `''`, `'   '`, `'\u00a0\n\t'` —, Then trả `lyDo` = null, `canCu` = null, `lyDoTuKara` = false — không lưu chuỗi rỗng; And đối chứng: bộ ghi dòng soạn `dongSoan` từ chối đúng ba chuỗi đó, nên dòng `can-chinh-moi` có `viSao` rỗng không sinh ra được (loại dòng và luật «ít nhất một ký tự» cùng sinh ở commit 1cf951c0).
- AC-3: Given đường gắn căn chỉnh tay hiện có (`okr.addAlignment`, đầu vào không có lý do), When người có quyền gắn, Then căn chỉnh lưu được với `lyDo` = null, `canCu` = null, `lyDoTuKara` = false; không có dòng lỗi mới nào về lý do; ma trận của `apps/api/test/okr-can-chinh.spec.ts` xanh — tệp đó chỉ được thêm đúng bốn trường mới (`lyDo`, `canCu`, `lyDoTuKara`, `mucTin`) vào dữ liệu giả `alignments`, không đổi dòng nào của ma trận.
- AC-4: Given ba căn chỉnh của cùng một mục tiêu với (`lyDo`, `canCu`) = (null, null), («Lý do», null), («Lý do», «Căn cứ»), When đọc mục tiêu đó qua đường đọc OKR có `alignments` (`mucTieuOutput`), Then mỗi phần tử `alignments` có đủ bốn khoá `lyDo`, `canCu`, `lyDoTuKara`, `mucTin`; ba khoá đầu đúng như lưu, và `mucTin` lần lượt là `chua-co-ly-do`, `dat-cuoc`, `co-so-lieu`.
- AC-5: Given trước `migration`: căn chỉnh A có dòng `okrDeXuat` loại `can-chinh-moi`, `taoRaId` = A, `noiDung.viSao` = «Lý do cũ A»; căn chỉnh B không có dòng đề xuất; căn chỉnh C có dòng đề xuất nhưng đã có `lyDo` «Người viết»; căn chỉnh D có dòng đề xuất với `viSao` chỉ khoảng trắng, When chạy câu điền lại trong `migration.sql` của hàng này, Then A có `lyDo` «Lý do cũ A» và `lyDoTuKara` = true; B và D giữ `lyDo` null; C giữ «Người viết» và `lyDoTuKara` không đổi.
- AC-6: Given một mục tiêu công khai có căn chỉnh mang `lyDo` «bi-mat-l1», When người có quyền sửa đổi hiển thị của mục tiêu đó sang giới hạn qua đường đổi hiển thị thật, Then bị từ chối 400 với `conCanChinh(1)` và căn chỉnh còn nguyên `lyDo` — nên lý do chỉ sống trên mục tiêu công khai (chốt sẵn có `gioiHanKhongCanChinh` chặn chiều ngược lại); và When một người ngoài workspace gọi `okr.mine` qua tRPC và REST, Then nhận 403 `NOT_A_MEMBER` và dữ liệu trả về không chứa «bi-mat-l1».
- AC-7: Given `migration.sql` của hàng này, Then nó chỉ thêm cột nullable hoặc có mặc định vào `okrAlignment` và chạy đúng một câu `UPDATE` điền lại; không `DROP`, không đổi kiểu, không thêm ràng buộc `NOT NULL` không mặc định.
- AC-8: Given diff của vòng so với merge-base với `onehub`, Then chỉ các tệp khai trong `## Notes` (mục Ranh giới), `_acceptance/ly-do-can-chinh-tu-soan/**`, `docs/superpowers/**`, `PRODUCT-MAP.md`, `LO-TRINH.html` và các dòng THÊM vào `_acceptance/config.yaml` đổi.

## Coverage

Quét bằng `morphological-scan` (preset entity-feature), 08/10.

- **Trục A — căn chỉnh sinh ra từ đâu:** «Đưa vào OKR» từ Soạn | gắn tay | đề xuất căn chỉnh của Kara trên sheet.
  - Thước CE: các lời gọi `addAlignmentTrong` (`soan-dua-vao.ts`, `okr.service.ts addAlignment`) và bản vẽ mục 01, 02, 05.
- **Trục B — lý do có gì:** câu có chữ | rỗng hay chỉ khoảng trắng | không có dòng đề xuất (căn chỉnh cũ).
  - Thước CE: `dongCanChinhMoi.viSao` (min 1) và biến thể `noiDungSoan` (`z.string()`) trong `packages/validation/src/okr-tro-ly.ts`.
- **Trục C — căn cứ:** có | không.
  - Thước CE: ba mức tin của bản vẽ mục 04 (chưa có lý do · đặt cược · có số liệu).
- **Trục D — ai đọc:** xem được mục tiêu nguồn | không xem được.
  - Thước CE: `boGioiHan` và quyền xem trong `okr.service.ts`.
- **Trục E — lúc nào:** căn chỉnh tạo sau bản này | căn chỉnh đã có trước `migration`.
- **Ô Core:** A1×B1 (AC-1) · A1×B2 (AC-2) · A2 (AC-3) · B×C ba mức tin (AC-4) · E2×B (AC-5) · D (AC-6) · `migration` chỉ thêm (AC-7) · ranh giới (AC-8).
- **Đối chiếu ngành:** [NGÀNH: Atlassian Goals — liên kết mục tiêu kèm «why this goal matters»]; [NGÀNH: Mooncamp/Perdoo — alignment có ghi chú, không bắt buộc].
- **Later:** A3 đề xuất căn chỉnh của Kara kèm lý do và A2 có ô lý do (L4); C1 Kara soạn căn cứ (L4); hiện lý do trên sheet (L2) và trên cây, lọc «Chưa có lý do» (L3).
- **Never:** bắt buộc lý do — anh đã chọn không (08/10 18:55).

## Đường đo

- «Mọi căn chỉnh tạo qua Đưa vào OKR mà dòng nháp có lý do thì giữ lý do»: câu SQL commit sẵn ở `_acceptance/ly-do-can-chinh-tu-soan/rang/do-nguong.sql` đếm `okrAlignment` nối `okrDeXuat` qua `taoRaId` có `lyDo` NULL trong khi `btrim(noiDung->>'viSao') <> ''`; SỐNG là 0. Người đo chạy đúng câu đó trên production · AC-1, AC-2; E11 chạy chính câu đó trên dữ liệu gieo.
- «Căn chỉnh cũ có dòng đề xuất mang lý do đều đã được điền lại»: cùng câu SQL, không lọc ngày · AC-5.

## Out of scope

- Hiện lý do và mức tin trên sheet mục tiêu (L2 `duong-ly-do-muc-tieu`).
- Lý do trên cây căn chỉnh và bộ lọc «Chưa có lý do» / «Đặt cược» (L3 `cay-can-chinh-co-ly-do`).
- Ô lý do khi gắn tay, đề xuất căn chỉnh của Kara kèm lý do, Kara soạn căn cứ (L4 `gan-tay-va-kara-co-ly-do`).
- Sửa lý do sau khi đã đưa vào, và đổi `lyDoTuKara` về false khi một người sửa (L4).
- Dọn `okrDeXuat` cũ sau khi điền lại.

## Notes

- Có migration: thêm `lyDo String?`, `canCu String?`, `lyDoTuKara Boolean @default(false)` vào `OkrAlignment`, cùng câu `UPDATE` điền lại. Mốc tên theo giờ thật lúc viết, kiểm `origin/onehub` ngay trước khi đẩy.
- Mã viết sau K2b của P1 (cùng chạm `soan-dua-vao.ts`): S0–S2 làm trước, S3 chờ K2b gộp.
- Ranh giới (sẽ xin `cham-tep`): `packages/db/prisma/schema.prisma`, `packages/db/prisma/migrations/<mốc>_ly_do_can_chinh/migration.sql`; `apps/api/src/okr/soan-dua-vao.ts`, `okr.service.ts`, `okr.contracts.ts`, `can-chinh.ts`, `okr-config.ts`; `apps/api/src/generated/server.ts` (nếu `trpc:generate` đổi); bài thử `apps/api/test/okr-ly-do-can-chinh*.spec.ts`; ba tệp kiểm dom dựng `noiGopOutput` giả: `apps/app/test/khung-okr-truoc-r1.dom.tsx`, `apps/app/test/tro-ly-okr-vet.dom.tsx`, `apps/app/test/muc-tieu-va-kr.dom.tsx` (chỉ thêm bốn trường mới vào dữ liệu giả); `apps/api/test/okr-can-chinh.spec.ts` (chỉ thêm bốn trường mới vào dữ liệu giả `alignments`, không đổi ma trận — sửa ở S3 theo AC-3 duyệt lại); `apps/app/test/khung-gop-y-luot-2.tsx` (chỉ thêm bốn trường mới vào dữ liệu giả của `lienKet` — tệp vào `onehub` qua 5e03e71b sau Cổng 1, chủ kho duyệt thêm 09/10).
- Đọc trước khi chạm (bảng chỉ mục của `AGENTS.md`): `docs/api.md`, `docs/ai-ux.md` (§3 dấu Kara giữ tới khi người sửa → cột `lyDoTuKara`).
