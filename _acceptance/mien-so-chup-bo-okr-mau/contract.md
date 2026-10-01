---
schema_version: 1
feature: Luật «sổ chụp chỉ thêm» của so-okr-tu-chay miễn cho công cụ dev okr:mau khi bốn chốt an toàn còn đứng — thước chi-them xanh lại trên onehub mà không mở lỗ cho lối ghi nào khác
slug: mien-so-chup-bo-okr-mau
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ci, docs]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-01T07:27:20Z
design_doc: docs/superpowers/specs/2026-10-01-mien-so-chup-bo-okr-mau-design.md
---

# Acceptance Contract: mien-so-chup-bo-okr-mau

## Context

Eval E8 của hồ sơ đã ký `so-okr-tu-chay` (`soi-ma.mjs --ca chi-them`) thoát 1 trên
`origin/onehub` 9c65f368. Nó bắt `okrSoChup.deleteMany` ở `nap.ts:146` và `okrSoChup.createMany`
ở `nap.ts:549`, cả hai thuộc công cụ `okr:mau` mà hồ sơ đã ký `bo-okr-mau` đòi (AC-3, AC-7,
AC-8). Ngày 01/10 chủ kho chọn hướng (a): luật chỉ-thêm miễn cho công cụ dev đó, đổi thước và
văn bản của `so-okr-tu-chay`, không sửa `nap.ts`.

Source input: prompt phiên 01/10 (đo bằng repin-lane, hai vi phạm) · quyết định chủ kho 01/10
(hướng a) · `_acceptance/so-okr-tu-chay/contract.md` AC-4, AC-14 · `_acceptance/bo-okr-mau/contract.md`
AC-3, AC-7…AC-10 · `docs/api.md` mục OKR.

## Criteria

- AC-1: Given cây của vòng này, When chạy lệnh của E8 đọc nguyên văn từ khoá `executors.script.sot_soi_chi_them` của `_acceptance/config.yaml`, Then lệnh thoát 0; dòng `chot mien bo mau:` bằng đúng `chot mien bo mau: C1 dat · C2 dat · C3 dat · C4 dat`; có đúng hai dòng `mien` — `mien apps/api/scripts/okr-mau/nap.ts:<d1> createMany trong napTrong` và `mien apps/api/scripts/okr-mau/nap.ts:<d2> deleteMany trong xoaTrong` — với d1, d2 bằng số dòng thật của `okrSoChup.createMany` và `okrSoChup.deleteMany` trong `nap.ts`; có đúng ba dòng `tao` (`okr-chup.ts` · `ghiBangTinh`, `okr-so.service.ts` · `ghiSoKr`, `okr-chi-so.ts` · `chupKrCrm`); `vi pham: 0`.
- AC-2: Given bản sao của tệp thật bị phá bằng đúng một lối ghi nằm ngoài cặp (hàm, lối) được miễn — mười ô viết trước: `deleteMany` trong hàm mới của `nap.ts`; `deleteMany` trong `nap-canh-kr.ts`; `updateMany` trong `xoaTrong`; `$executeRaw` `DELETE FROM "okrSoChup"` trong `xoaTrong`; `createMany` trong `xoaTrong`; `createMany` trong hàm mới của `nap.ts`; `deleteMany` trong `napTrong`; `delete` một hàng trong `xoaTrong`; `upsert` trong `napTrong`; lồng `soChup: { create }` trong `napTrong` — When chạy lệnh của E8 với `--thay <tệp>=<bản sao>`, Then mỗi ô thoát 1 và in đúng câu «okrSoChup bị sửa: <bản sao>:<dòng chèn> (<lối>)» (SQL thô: «(SQL thô $executeRaw)») hoặc «okrSoChup tạo ngoài chỗ được phép: <bản sao>:<dòng chèn> (<lối> trong <hàm>)»; And ở mọi ô cả hai dòng `mien` của hai lời gọi gốc vẫn còn và dòng chốt vẫn bốn `dat`.
- AC-3: Given bản sao làm vỡ đúng một vế của một chốt — mười ba ô viết trước: C1 × {`deleteMany({})`, `deleteMany()`} trong `xoaTrong`; C2 × {bỏ lời gọi `kiemDuocNap`, bỏ khối `if … process.exit`, thêm `import "./okr-mau/lenh"` tĩnh ở đầu `okr-mau.ts`}; C3 × {bỏ `kiemOkrThat` trong `xoaBoOkrMau`, bỏ `kiemOkrThat` trong `napBoOkrMau`, thêm `const f = xoaTrong` trong `nap.ts`, `lenh.ts` nhập và gọi `xoaTrong`}; C4 × {nhập tĩnh, `import()` động, `require`, `export … from`} `okr-mau/nap` từ `apps/api/src/okr/okr-so.service.ts` — When chạy lệnh của E8 với `--thay`, Then mỗi ô thoát 1; dòng `chot mien bo mau:` có đúng một chốt `vo` là chốt của ô, ba chốt kia `dat`; in câu ghim của ô nguyên văn như bảng 4.2 của thiết kế; ở ô C2, C3, C4 cả hai lời gọi của `nap.ts` quay lại thành vi phạm với câu cũ và không còn dòng `mien`; ở ô C1 chỉ `deleteMany` thành vi phạm, dòng `mien … createMany trong napTrong` vẫn còn.
- AC-4: Given chiều đỏ cũ của thước, When chạy `soi-ma.mjs --ca chi-them --chieu-do`, Then vẫn in `chieu do: 2/2 ban sao bi bat` và thoát 1 như trước vòng này; And `--ca` vắng hay lạ vẫn thoát 2 với «KHONG DO DUOC».
- AC-5: Given bốn nơi chép luật chỉ-thêm — câu AC-4 và AC-14 cùng Notes của hợp đồng `so-okr-tu-chay`, `expected` của E8 trong `evals.yaml` của nó, đoạn «`okrSoChup` is append-only history» của `docs/api.md` — When đối chiếu với bảng `DUOC_TAO` và `MIEN_BO_MAU` đọc từ chính `soi-ma.mjs`, Then mọi tệp và hàm trong hai bảng đều được nêu ở hợp đồng và ở `docs/api.md`; cả ba nơi nêu đủ hai chốt `kiemDuocNap` và `kiemOkrThat` và chữ `okr:mau`; `docs/api.md` không còn câu «written in three places only»; Notes của hợp đồng có dòng sửa đổi 01/10 trỏ `mien-so-chup-bo-okr-mau`; And cùng phép kiểm chạy trên bản các tệp đó ở `9c65f368` thì đỏ, gọi tên từng nơi thiếu.
- AC-6: Given bốn nơi đã sửa ở AC-5, When người đọc `docs/api.md` mà không mở thước, Then hiểu được luật chỉ-thêm, chỗ miễn, vì sao miễn an toàn (chỉ máy cục bộ, kho không có OKR thật) và rằng miễn mất khi chốt vỡ; câu sửa ở hợp đồng không nới lời hứa cho lịch sử số thật. (judgment)
- AC-7: Given nhánh của vòng này, When gom tệp của mọi commit không phải merge chạm `_acceptance/mien-so-chup-bo-okr-mau/`, và (khi nhánh chưa gộp) mọi tệp đổi giữa `merge-base` với `origin/onehub` và HEAD, Then không tệp nào nằm dưới `apps/` hay `packages/`; And cùng hàm phân loại chạy trên commit e3e2f252f của `bo-okr-mau` thì nêu `apps/api/scripts/okr-mau/nap.ts` (đối chứng âm).

## Coverage

Quét bằng `morphological-scan`, bản đầy đủ ở `coverage-scan.md`.

- **Trục A — lối ghi:** tạo · xoá · sửa · SQL thô · lồng [thước CE: tập `TAO`/`SUA`/`SQL_THO`/`SUA_LONG` của thước đã ký] → AC-1, AC-2
- **Trục B — chỗ đứng:** hàm được miễn · hàm khác của `nap.ts` · tệp `okr-mau` khác · ngoài `okr-mau` [thước CE: chuỗi gọi `okr-mau.ts` → `lenh.ts` → `nap.ts`] → AC-1, AC-2, AC-3 (C4)
- **Trục C — chốt:** C1…C4 × đạt/vỡ [thước CE: AC-9, AC-10 của `bo-okr-mau`; NGÀNH: Rails `ProtectedEnvironmentError`, Laravel `db:seed`] → AC-1, AC-3
- **Trục D — nơi nói luật:** thước · hợp đồng · `evals.yaml` · `docs/api.md` [thước CE: `grep okrSoChup`] → AC-5, AC-6
- Cross-cutting: thước cũ giữ hành vi (AC-4); vòng không chạm mã sản phẩm (AC-7); mọi phép đo gọi chính lệnh E8 trên bản sao trong `tmpdir`.
- [GIẢ ĐỊNH] Chốt C3 tin hành vi của `kiemOkrThat` đã đo ở AC-10 của `bo-okr-mau`; thước này chỉ đo rằng nó được gọi trước, không đo nội dung hàm.
- [GIẢ ĐỊNH] C1 đòi `where` có khoá `keyResultId`, không truy nguồn tập id về tiền tố mẫu.

## Out of scope

- Sửa `apps/api/scripts/okr-mau/**` hay mã sản phẩm nào — hướng (b), chủ kho đã loại 01/10.
- Miễn cho công cụ dev khác hay cả `apps/api/scripts/**`.
- Đo nội dung `kiemOkrThat`/`kiemDuocNap` — đã đo ở `bo-okr-mau`.
- Làm xanh E12/E14/E23/E25 của `so-okr-tu-chay` — đỏ vì lịch và vì `diff` vòng cũ, không thuộc vòng này.

> Rationale từng mục: `decisions.jsonl`.

## Notes

- Luật đã đọc: `AGENTS.md`, `docs/api.md` (mục OKR, đoạn `okrSoChup` append-only), `CLAUDE.md`
  (cổng, `bun run build`, `pre-push`); hợp đồng `so-okr-tu-chay`, `bo-okr-mau`. Bảng chỉ mục của
  `AGENTS.md` không có tài liệu cho `_acceptance/**`; vòng không chạm `apps/` nên không cần `docs/agent.md`.
- Sau khi gộp `onehub`: chạy `repin-lane.mjs --slug so-okr-tu-chay --write` ở đỉnh. E12/E14 (gần đầu
  quý) và E23/E25 (đo `diff` vòng cũ) có thể làm làn không xanh — báo chủ kho, không vượt.

Known limits — Cổng Bằng chứng (Phan Le Manh 2026-10-01, định đoạt mục ngoài hợp đồng của vòng chấm 1–3; sổ d-20261001T082016Z-7 … -15):

- Ngoài-1 (`docs/api.md`): Tài liệu API, tiêu chí AC-4 và E8 của «Số OKR tự chảy» nói hễ một chốt an toàn hỏng thì cả hai lệnh ghi của công cụ dev mất quyền miễn; thực tế khi chốt «xoá có lọc» hỏng thì lệnh thêm vẫn được miễn. Thước vẫn đỏ nên không lọt lỗi; người đọc tài liệu hiểu lệch phạm vi bị chặn.
- Ngoài-2 (`docs/api.md`): Tài liệu nói không có gì ngoài công cụ dev nhập mã nạp mẫu, nhưng các tệp kiểm thử thì có nhập và gọi thẳng hàm nạp/xoá. Chỉ là câu chữ thiếu vế ngoại trừ kiểm thử, không mở lỗ nào cho mã sản phẩm.
- Ngoài-5 (`_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`): Chốt chặn chạy trên máy thật chỉ được kiểm là có tồn tại, chưa kiểm là có thật sự phụ thuộc vào kết quả kiểm; ai cố tình thay điều kiện chặn bằng điều kiện luôn sai thì thước vẫn xanh.
- Ngoài-6 (`_acceptance/so-okr-tu-chay/rang/soi-ma.mjs`): Lệnh xoá của công cụ dev chỉ cần có điều kiện theo KR là qua chốt, kể cả khi điều kiện đó rộng tới mọi KR.
- Ngoài-7 (`_acceptance/mien-so-chup-bo-okr-mau/rang/do-mien.mjs`): Phép đo in «10/10» và «13/13» nhưng không tự đòi bảng có đúng 10 và 13 ô; xoá bớt ô trong script thì phép đo vẫn xanh với số nhỏ hơn.
- Ngoài-3 và Ngoài-4 mở hợp đồng mới: tệp lối vào `okr-mau.ts` không được chốt C3/C4 soi; C4 lọt với đuôi `.js` và tệp ngoài `.ts/.tsx`, C2 lọt với `export * from`.
