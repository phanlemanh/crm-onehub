---
schema_version: 1
feature: Các ca của nop-ban-nhap chọn dòng theo khoá bản nháp hay thứ tự tường minh, không theo vị trí vật lý — hết đỏ ngẫu nhiên trên CI
slug: nop-ban-nhap-chon-theo-khoa
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: verified
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-04T02:58:24Z
design_doc: docs/superpowers/specs/2026-10-04-nop-ban-nhap-chon-theo-khoa-design.md
---

# Acceptance Contract: nop-ban-nhap-chon-theo-khoa

## Context

`apps/agent-okr/test/nop-ban-nhap.integration.spec.ts`, ca «Mục tiêu đã nhận: đổi tên qua chat
không tạo dòng thứ hai cùng khoá…», chọn Mục tiêu sẽ đánh dấu «nhan» bằng `orderBy: { createdAt: "asc" }`.
Mọi dòng của một lần nộp được ghi bằng một `createMany` trong một transaction nên mang chung một
`createdAt`; giữa `m1` và `m3`, Postgres trả theo vị trí vật lý. CI run 37169842118 (PR #240) đỏ
một lần đúng chỗ này: `giu: []`, `m1` thêm tên «Đối tác miền Bắc gắn bó thêm hai năm». Tại chỗ:
15 lượt cả tệp bằng Bun 1.3.12 → đỏ 1; dời bản ghi `m1` bằng một lần cập nhật không-HOT → đỏ tất định.

Source input: prompt (phiên 2026-10-04, chủ kho giao: tái hiện, chọn theo khoá bản nháp, rà ca cùng mẫu).

## Criteria

- AC-1: Given một lần nộp `tron()`, When đọc các dòng Mục tiêu đang chờ nó ghi, Then mọi dòng ấy mang đúng một giá trị `createdAt` — thứ tự theo `createdAt` không phân biệt được `m1` với `m3`.
- AC-2: Given bản sao của ca «Mục tiêu đã nhận» mà ngay sau lần nộp đầu, bảng được xếp lại vật lý để `m3` đứng trước `m1` (chỉ mục tạm theo khoá bản nháp giảm dần + `CLUSTER`) và `findFirst` theo `createdAt` đã trả một dòng khác `m1`, When chạy ca với bộ chọn theo khoá, Then ca xanh.
- AC-3: Given cùng bản sao và cùng phép xếp của AC-2, When chỉ thay bộ chọn bằng bộ chọn `orderBy: { createdAt: "asc" }` cũ, Then ca đỏ đúng chữ ký CI 37169842118: dòng vế Received của diff có `"giu": [],` và tên «Đối tác miền Bắc gắn bó thêm hai năm».
- AC-4: Given spec đã sửa, không xếp lại bảng, When chạy cả tệp `nop-ban-nhap.integration.spec.ts` qua `bun run test --` bằng Bun 1.3.12, Then mọi ca xanh.
- AC-5: Given hai cây `apps/agent-okr/test` và `packages/*/test`, When quét hai mẫu (A) `orderBy: { createdAt` đứng một mình và (B) `findFirst`/`findFirstOrThrow` không `orderBy`, nhận diện mỗi chỗ bằng tệp + nội dung lời gọi, Then tập chỗ quét được trùng từng chỗ với danh sách đã rà (11 chỗ); và Given cùng cây nhưng trong bộ nhớ trả bộ chọn cũ của ca «Mục tiêu đã nhận» và ca «nộp lại dòng có khoá đã bác», When quét lại, Then thấy đúng 2 chỗ chưa rà.
- AC-6: Given bảng rà trong design doc, spec đã sửa, `nop-ban-nhap.ts`, schema bản nháp `okr-cuoc-soan.ts` và ba spec của `packages/auth` có trong danh sách đã rà, When đối chiếu, Then ba chỗ đã sửa chọn theo khoá hay theo thứ tự tường minh, mười một chỗ còn lại đúng là không để thứ tự quyết định kết quả, và lập luận «mã sản phẩm không cần đổi» đứng trên khoá phụ `id` của `docDaQuyet` — không dựa vào tính duy nhất của khoá bản nháp. (judgment)
- AC-7: Given bản sao của ca «nộp lại dòng có khoá đã bác» (chạy cùng ca «bản nháp trộn» gieo dòng cho nó) mà đầu ca, bảng được xếp lại để `m3` đứng trước `m1` và `findFirst` không `orderBy` đã trả dòng khác `m1`, When ca chạy với bộ chọn theo khoá, Then hai ca xanh; When chỉ thay bằng bộ chọn `findFirstOrThrow` không `orderBy` cũ, Then ca đỏ với `Expected: "so-moi"` / `Received: undefined` (ca đánh dấu nhầm `m3` là «bac»).
- AC-8: Given cùng ca, ngay sau lần nộp `lai` thứ hai, bảng được xếp lại theo `createdAt` giảm dần để dòng `m3:cc` cũ nhất (đích `id-la`) đứng cuối và `findMany` không `orderBy` lấy `.at(-1)` đã trả đúng dòng đó, When đọc `dich("m3:cc")` với `orderBy: [{ createdAt: "asc" }, { id: "asc" }]`, Then hai ca xanh; When bỏ `orderBy` đó, Then ca đỏ với dòng vế Received có `"id-la",`.

## Coverage

- Trục A — thứ tự vật lý của dòng cần chọn so với dòng cùng loại: đúng ý ca | ngược ý ca [thước CE: `CLUSTER` theo chỉ mục tạm đặt được thứ tự tất định — đo tại chỗ trên Postgres của kho, 3/3 lượt]
- Trục B — bộ chọn: theo vị trí (`createdAt` trùng mốc, hay không `orderBy`) | theo khoá bản nháp hay thứ tự tường minh [thước CE: hai bộ chọn của mỗi ca trong bảng `CA` của `rang/dao-thu-tu.mjs`]
- Trục C — ca: `nhan` (trong một lần nộp) | `bac` (trong một lần nộp) | `dich` (giữa các lần nộp) [thước CE: ba chỗ sửa ở bảng «Cách sửa» của design doc]
- Core → AC: nguồn của sự bằng nhau → AC-1 · ngược ý × theo khoá × nhan → AC-2 · ngược ý × theo vị trí × nhan → AC-3 · ngược ý × hai bộ chọn × bac → AC-7 · ngược ý × hai bộ chọn × dich → AC-8 · đúng ý × theo khoá (đường thường của CI) → AC-4 · các chỗ cùng mẫu → AC-5 (máy đếm) · AC-6 (người đọc lập luận)
- Ô «đúng ý × theo vị trí» là đường xanh cũ — không cần đo lại.
- Quét không gian bằng skill `morphological-scan` đã bỏ — sổ quyết định ghi lý do; ba trục trên liệt tay.

## Out of scope

- Không đổi mã sản phẩm: `nop-ban-nhap.ts`, `packages/db`, `packages/validation` giữ nguyên (lý do ở design doc mục «Mã sản phẩm: không đổi»).
- Không sửa mười một chỗ còn lại trong danh sách đã rà — thứ tự ở đó không quyết định kết quả.
- Không rà `orderBy: { createdAt }` trong mã sản phẩm `apps/agent` hay `apps/api` — ngoài phạm vi chủ kho giao.
- Không thêm bước xếp lại bảng vào chính spec: bước đó sống trong bản sao của răng.
- Không chặn bản nháp có hai Mục tiêu (hay hai KR cùng cha) trùng `khoa`: schema `banNhap` hiện cho qua, `docDaQuyet` khi đó giữ dòng `id` nhỏ hơn. Khe kiểm đầu vào của sản phẩm — đã mở việc riêng.

## Notes

- Phạm vi mở rộng sau S4 round 1 (sổ quyết định): hội đồng E4 và tác tử review chỉ ra ca «nộp lại dòng có khoá đã bác» còn chọn `m1` theo vị trí vật lý (`findFirstOrThrow` không `orderBy`), đã tái hiện đỏ. Chủ kho giao «tìm ca cùng mẫu rồi sửa luôn», nên AC-7, AC-8 được thêm và AC-5, AC-6 viết lại trong cùng hồ sơ.
- Răng `rang/quet-mau.mjs` (E5) đỏ khi ai thêm, bớt hay sửa một chỗ thuộc hai mẫu A/B trong hai cây đã quét — có chủ đích: lượt ghim lại buộc trả lời «thứ tự có quyết định kết quả không?».
- Giới hạn đo đã biết: máy không quét `findMany` không `orderBy` rồi lấy theo vị trí (`.at`, `[0]`); chỗ đó rà bằng mắt (design doc) và hội đồng E4 đọc lại spec.
- Răng `rang/dao-thu-tu.mjs` ghi bản sao vào `.acceptance-runs/nop-ban-nhap-chon-theo-khoa/sao-<ca>-<chiều>-<pid>/`, xoá trong `finally`; mỗi lượt có DB `crm_<id>_test` riêng, nên `CREATE INDEX`/`CLUSTER`/`DROP INDEX` không chạm DB nào khác.
