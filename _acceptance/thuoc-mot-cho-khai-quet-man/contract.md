---
schema_version: 1
feature: "Thước «một chỗ khai» của K2b quét thật khu soạn: ba gốc quét khai một chỗ trong chung.mjs, đọc thư mục thật, gốc nào rỗng thì đỏ gọi tên"
slug: thuoc-mot-cho-khai-quet-man
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [script]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-10
design_doc: docs/superpowers/specs/2026-10-09-thuoc-mot-cho-khai-quet-man-design.md
---

# Acceptance Contract: thuoc-mot-cho-khai-quet-man

## Context

Hàng K2d của dãy P7, đợt `sau-14-10`. Ngoài-4 của K2b `soan-okr-khong-lac`: anh chọn «mở hợp đồng mới» ở Cổng 2
lúc 2026-10-08T16:47:19Z; luật 26 coi như đã ký Cổng Đáng `build`. K2b đã gộp ở #322.

`_acceptance/soan-okr-khong-lac/rang/mot-nguon.mjs` (eval E7 của K2b, khoá `k2b_mot_nguon`) quét ba lớp bằng
`glob` của `node:fs/promises`. Mẫu lớp khu soạn `apps/app/app/(app)/[slug]/okr/soan/**/*.ts*` khớp 0 tệp vì `glob`
đọc `(app)` và `[slug]` là cú pháp mẫu (đo 09/10 trên `d089cb8d`: 0 trong 22 tệp). K2c đã có khuôn đúng cho thước của
chính nó (`ly-do-tu-choi-nop-theo-locale/rang/mot-nguon.mjs`: đọc thư mục đệ quy, gốc rỗng thì đỏ); K2d đưa khuôn ấy
về thước của K2b.

Source input: `opportunity.md` · design doc · `review-findings.md` của `soan-okr-khong-lac` (Ngoài-4) · contract K2b AC-7.

## Criteria

- AC-1: Given cây lành, When chạy `mot-nguon.mjs` của K2b, Then nó quét đúng ba gốc khai trong `chung.mjs` (`agent` = `apps/agent-okr/agent`, `khu-soan` = khu soạn, `validation` = `packages/validation/src`) bằng đọc thư mục thật; với mỗi gốc, số tệp `.ts`/`.tsx` nó đọc bằng số tệp `.ts`/`.tsx` mà `git ls-files` liệt dưới gốc đó và > 0 (bộ đo in cả hai vế từng gốc, ví dụ `khu-soan 22=22`); nó vẫn in dòng cũ «mot-nguon: KET_QUA_NOP 1 cho, agent + app dung chung» và thoát 0.
- AC-2: Given một cây tạm cùng bố cục với kho (chép ba gốc quét cùng `mot-nguon.mjs` và `chung.mjs`, nối `node_modules` thật) và ma trận viết trước ba ca — mỗi ca thêm một tệp `them.ts` khai `["da-ghi", "tu-choi"] as const` dưới đúng một gốc `agent`, `khu-soan`, `validation` — When chạy bản thước mới trên từng cây, Then mỗi lượt thoát 1 và in «tap ket qua khai 2 cho:» kèm `<gốc>/them.ts` của đúng ca; và trên cây ca `khu-soan`, bản thước của `d089cb8d` thoát 0 (tái hiện lỗi gốc) sau khi chính nó thoát 0 trên cây lành (đối chứng dương); tệp `.ts`/`.tsx` thật dưới ba gốc và `git status --porcelain` của kho giống hệt trước và sau lượt.
- AC-3: Given cây tạm như AC-2 và ma trận viết trước ba ca, mỗi ca làm rỗng đúng một gốc (thư mục còn, không tệp), When chạy bản thước mới, Then mỗi lượt thoát 1, in «goc quet rong: <tên gốc>» đúng gốc đó và không in dòng thành công — kể cả ca `agent`, nghĩa là gốc được kiểm trước khi nạp mô-đun của agent; tệp thật và `git status --porcelain` không đổi như AC-2.
- AC-4: Given các tệp `.mjs` trong `_acceptance/soan-okr-khong-lac/rang/`, When đọc nguồn, Then chuỗi đường khu soạn `apps/app/app/(app)/[slug]/okr/soan` chỉ xuất hiện trong `chung.mjs`, đúng một lần; `mot-nguon.mjs` không chứa chuỗi gốc nào trong ba gốc (lấy `GOC_QUET` từ `chung.mjs`); không tệp nào gọi `glob(` hay nhập tên `glob` từ `node:fs` hoặc `node:fs/promises`. Đường tệp cụ thể bắt đầu bằng một gốc (như `packages/validation/src/okr-cuoc-soan.ts` trong `ranh-gioi.mjs`) không tính là khai gốc.
- AC-5: Given lời hứa đã ký của E7 K2b, When chạy đúng lệnh `config:executors.script.k2b_mot_nguon` trên cây lành và kèm `--ban-sao them-tap`, Then lượt lành thoát 0 với dòng «mot-nguon: KET_QUA_NOP 1 cho, agent + app dung chung», lượt `them-tap` thoát 1 với «tap ket qua khai 2 cho» — E7 của K2b chạy nguyên như hợp đồng đã ký.
- AC-6: Given diff của vòng này — khi nhánh còn mở thì từ điểm rẽ khỏi `onehub` tới `HEAD`, khi hồ sơ đã lên `onehub` thì diff của merge đưa nó lên — When liệt tệp đổi, Then mọi tệp nằm trong ranh giới hàng K2d (`_acceptance/soan-okr-khong-lac/rang/**`, `_acceptance/thuoc-mot-cho-khai-quet-man/**`) hoặc danh sách `cham-tep` (`_acceptance/config.yaml`, design doc, kế hoạch, `PRODUCT-MAP.md`, `LO-TRINH.html`) cộng tệp ghi ghim của K2b (`_acceptance/soan-okr-khong-lac/evidence-report.md`, `run-log.jsonl`); `_acceptance/config.yaml` chỉ thêm dòng.

## Coverage

Trục lớp quét × trạng thái gốc, ma trận viết tay đủ (không chạy morphological-scan, entry `descope` trong sổ):

| Lớp \ trạng thái | lành | khai trùng | gốc rỗng |
|---|---|---|---|
| agent | AC-1 | AC-2 | AC-3 |
| khu-soan | AC-1 | AC-2 | AC-3 |
| validation | AC-1 | AC-2 | AC-3 |

Thước CE: ba gốc là đúng ba gốc E7 của K2b hứa quét (contract K2b AC-7, `expected` của E7). AC-4 giữ «một chỗ khai» cho
đường quét, AC-5 giữ lời hứa đã ký của K2b, AC-6 ranh giới.

## Đường đo

Ngưỡng ở `opportunity.md` (đang `[đề xuất]`) đo ngay ở lượt S4 của hồ sơ, không có phiên nghiệm thu người dùng:

- «Ba lớp > 0 tệp và xanh trên cây lành»: E1 (AC-1).
- «Khai trùng trong khu soạn làm thước đỏ, gọi tên tệp»: E2 (AC-2, ca `khu-soan`).
- «Không lớp nào quét rỗng mà xanh»: E3 (AC-3).

## Out of scope

- Ngoài-1 đến Ngoài-3, Ngoài-5 đến Ngoài-10 của K2b — anh đã định đoạt riêng (K2c, Known limits).
- Sửa thước của hồ sơ khác: chỉ `mot-nguon.mjs` của K2b mắc bẫy `glob` (09/10: `grep 'glob('` trong `_acceptance/*/rang/*.mjs` ra đúng một tệp).
- Đổi `evals.yaml` hay `contract.md` đã ký của K2b — dòng in và chiều đỏ cũ giữ nguyên để E7 chạy như đã ký.
- Sửa mã sản phẩm: khu soạn hôm nay không khai lại tập (đo 09/10, 0 trong 22 tệp).

## Notes

- Tệp ngoài ranh giới xin `cham-tep` (`yeu-cau/P7-15.json`): `_acceptance/config.yaml` (thêm khoá `k2d_*`), design doc,
  kế hoạch, bản đồ sản phẩm.
- Mọi chiều đỏ chạy trên bản sao trong thư mục tạm hay trong bộ nhớ, không sửa tệp thật — cây của hồ sơ đã ký (K2b)
  không được chạm trong lượt đo.
- Đổi `mot-nguon.mjs` chạm `paths` của E7 K2b — ghim lại K2b ở bước cuối nhánh. Đo 09/10: không eval nào của
  K2b có `paths` chứa `chung.mjs`; chỉ E7 (script) khai `mot-nguon.mjs`; E10 (ui-check) chỉ khai `man.mjs` — sửa
  `chung.mjs` không làm cũ eval ngoài làn máy.
- Đo 09/10 tại `d089cb8d` (chuỗi gốc trong `rang/*.mjs` của K2b): đường khu soạn chỉ ở `chung.mjs`; `apps/agent-okr/agent`
  ở `chung.mjs` và `mot-nguon.mjs`; `packages/validation/src` ở `chung.mjs`, `mot-nguon.mjs` và `ranh-gioi.mjs` (đường tệp
  `okr-cuoc-soan.ts`, không phải khai gốc).
- Cây tạm của chiều đỏ nằm dưới `.acceptance-runs/thuoc-mot-cho-khai-quet-man/` (ba cấp dưới gốc kho, kho bỏ qua), xoá
  sau lượt; đã thử 09/10: bản `d089cb8d` thoát 0 trên cây lành, 0 khi khu soạn khai trùng, 1 khi agent khai trùng.
- Known limits (Ngoài-1, Cổng 2): Nếu sau này ai đó làm hỏng cách thước kiểm tra quét thư mục soạn OKR, bằng chứng đã ký của vòng trước vẫn được coi là còn mới và không bị báo cũ. Chỉ khi mở lại vòng trước và ghim lại thì lỗ hổng này mới được vá.
- Known limits (Ngoài-2, Cổng 2): Khi máy đo thiếu thứ nó cần (ví dụ chưa cài đủ phụ thuộc hay thiếu lịch sử git), bộ đo có thể báo là thước sai thay vì báo là không đo được. Người duyệt có thể tưởng tính năng hỏng trong khi thật ra chỉ là môi trường chưa sẵn sàng.
