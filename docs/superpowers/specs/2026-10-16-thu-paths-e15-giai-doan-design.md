# thu-paths-e15-giai-doan — thiết kế

Hàng F31 của `docs/plan/lo-trinh-okr.json`. Cổng Đáng `build` 2026-10-16T04:38:49Z (chủ kho gõ ở phiên giám sát,
giám sát chuyển cho dãy P1). Hạng T2: chỉ chạm `_acceptance/**` và `_acceptance/config.yaml`, không chạm mã sản phẩm.

## Vấn đề

`pre-merge-check` xét hồ sơ hoá cũ bằng `staleByPaths` (`lib/evidence-core.cjs:510`): tệp đổi từ lúc ghim chỉ tính khi
khớp `paths` của một eval. Bộ lọc là «tất cả hoặc không»:

- Một eval (không khai `not-run`) thiếu `paths` → cả hồ sơ rơi về luật cũ, tệp nào đổi cũng hoá cũ
  (`eval-ngoai-may-thieu-paths` cho judgment và ui-check, `eval-may-thieu-paths` cho test và script).
- Một mục `paths` trỏ tệp không có trong cây → rơi về luật cũ (`paths-khong-tro-toi-tep`).
- `paths` của eval khai `not-run` vẫn vào hợp glob (E15 của `giai-doan-thoa-thuan`).

Đo 16/10 trên `onehub 34d31a8bf`: `bash scripts/pre-merge-check.sh .` (không `--base`) báo 245 hồ sơ hoá cũ; với hồ sơ hoá
cũ, bộ lọc không áp ở 49 hồ sơ vì `eval-ngoai-may-thieu-paths`, 7 vì `eval-may-thieu-paths`, 4 vì
`paths-khong-tro-toi-tep`, 1 `hop-paths-rong`, 1 `dang-khai-la`.

## Đã đo trước khi thiết kế

1. **E15 `giai-doan-thoa-thuan`** khai `not-run` (thay bởi `danh-sach-keo-chung#AC-8`), `paths` gồm
   `apps/app/lib/messages/**`. Mã của màn giai đoạn (`settings/giai-doan/**`) và bảng thoả thuận (`deals/**`) nhập
   thẳng ba tệp chữ: `settings.ts`, `deals.ts`, `crm.ts`. Bao đóng import cả khung ứng dụng có 26/48 tệp chữ (kể cả
   `tin-hieu.ts`) nhưng qua layout chung — và `paths` hiện tại của E15 vốn không phủ layout chung
   (`apps/app/components/**` không có trong E15). Ranh «tệp chữ của màn» lấy đúng ranh ấy: tệp chữ mà mã trong hai thư
   mục của màn nhập thẳng.
   E17 của cùng hồ sơ khai `apps/app/lib/**` (răng quét chữ cấm trên mọi `.ts` dưới bảy thư mục) — đúng thứ nó đọc.
   PR #427 (F23 `khong-re-theo-ten-thanh-luat-kho`, đang mở) thu E17 về tệp định nghĩa luật. Lời hứa «đổi tệp chữ
   khác không kéo hồ sơ vào ghim lại» chỉ đúng ở mức hồ sơ khi cả F23 lên `onehub`.
2. **Eval judgment thiếu `paths`** (`them-paths.mjs --ke`): 113 eval judgment; 42 có `paths` phủ đủ inputs, 18 có
   `paths` hẹp hơn inputs, 53 thiếu `paths` mà thêm được, 7 bỏ qua (4 khai `not-run`, 2 không có `inputs`, 1 input trỏ tệp
   đã mất: `okr-loai-hoc-tap` E14 → `apps/agent-okr/agent/instructions.md`). Mười eval khai `inputs` tương đối thư mục
   hồ sơ (`evidence/…`, `../../CONTEXT.md`) — bộ quy đổi giải từ gốc kho trước, rồi từ thư mục hồ sơ.
   Mô phỏng (`mo-phong.mjs`, cùng `staleByPaths`, cây git thật): 53 eval nằm ở 51 hồ sơ; thêm `paths` xong thì 4 hồ sơ
   đã ký hết hoá cũ, 3 hồ sơ chưa ghim, 44 hồ sơ đã ký VẪN hoá cũ thật (tệp eval máy hay ui-check của chính chúng đổi
   từ lúc ghim). PR chạm `evals.yaml` của hồ sơ đã ký thì `pre-merge-check --base` xét lại hồ sơ đó, nên làm trọn 51 hồ
   sơ là ghim lại 44 hồ sơ trong PR.
3. **`gioi-han-duyet-cay-okr`**: bao đóng import của năm trang răng màn mở (782 tệp) RỘNG hơn glob hiện tại — E15: 116
   tệp `apps/app` khớp glob nằm trong bao đóng, 192 tệp bao đóng nằm ngoài glob; E16, E18, E19, E24 cùng hình. Tệp của
   #431 (`tien-do-kr.tsx`, `tom-tat-quan-tri.tsx`) nằm trong bao đóng: lần hoá cũ ấy đúng. Chỉ E17 (DOM) thu được
   (129 → 36 tệp) mà E15/E16 vẫn phủ `okr/**`, mức hồ sơ không đổi.

Chân ngành: Turborepo `inputs`, Nx `inputs`, Bazel `srcs`/`data` — khai thiếu đầu vào cho ra cache trúng sai (bỏ qua
việc phải chạy lại), khai thừa chỉ tốn chạy lại. Nên mọi lần thu `paths` ở đây chỉ thu tới đúng tệp được đọc, không
dưới.

## Cách làm

- **(1)** Sửa tay một chỗ: E15 của `giai-doan-thoa-thuan`, thay dòng `apps/app/lib/messages/**` bằng ba tệp
  `settings.ts`, `deals.ts`, `crm.ts`; ba mục còn lại giữ nguyên.
- **(2)** `rang/them-paths.mjs`: quét mọi `_acceptance/*/evals.yaml` (tệp git theo dõi), với eval judgment không khai
  `not-run`, chưa có `paths`, có `inputs` và mọi input giải được thành tệp git theo dõi → chèn khối `paths:` ngay sau khối
  `inputs`, cùng thụt, mỗi mục một dòng trong ngoặc kép, giá trị = inputs đã quy về gốc kho (giữ thứ tự, bỏ trùng). Đọc
  lại bằng `evalListsOf` sau khi chèn; lệch là ném lỗi, không ghi tệp. Chế độ `--ke` (in), `--ghi` (viết),
  `--kiem` (thước: thiếu hay lệch → mã 1), đều nhận `--ho-so a,b` để giới hạn.
  Danh sách hồ sơ theo luật: thêm xong thì hồ sơ không hoá cũ, hoặc hồ sơ chưa ghim. Một nguồn duy nhất:
  `_acceptance/thu-paths-e15-giai-doan/danh-sach.txt`, tính lúc S3 trên `onehub` mới nhất; E3 tính lại luật trên HEAD và
  so với tệp (thừa hay thiếu đều đỏ). Hai hồ sơ chủ kho gọi tên (`thu-haiku-tro-ly-okr` E8, `ghim-thuoc-soi-xem-okr` E3)
  phải có trong danh sách: lúc dựng mà chúng không thoả luật thì máy dừng và hỏi chủ kho, không tự bỏ.
- **(3)** Không thu (xem Hỏi-1).
- **Thước**: E1 lặp qua mọi tệp `apps/app/lib/messages/*.ts` (ma trận toàn phần), tập phải giữ suy từ các dòng nhập
  `@/lib/messages/<tên>` dưới hai thư mục của màn. E8 chạy `pre-merge-check` thật trên merge-base và HEAD (worktree tạm
  tách rời) và so tập hồ sơ hoá cũ. `rang/hoa-cu-theo-paths.mjs` dùng đúng `staleByPaths` + cây `git ls-files` như `pre-merge-check`:
  `--ho-so` in `SACH`/`CHUA_GHIM`/`CON_HOA_CU`/`KHONG_AP`; `--gia-dinh tệp=bo|giu` kiểm một tệp giả định đổi có bị bộ
  lọc bỏ qua hay giữ, `--chi-eval <id>` giới hạn về glob của một eval. `rang/chi-them-paths.mjs` so `evals.yaml` ở
  merge-base và HEAD theo từng eval: mọi trường ngoài `paths` giữ nguyên chữ, `paths` mới bằng inputs quy đổi, và
  không tệp nào dưới `lib/` đổi.
- Không sửa `lib/evidence-core.cjs`. Đề xuất cho kit («paths mặc định = inputs cho judgment»; «paths của eval
  `not-run` không vào hợp glob») đi qua yêu cầu `viec-phu`.

## Hỏi chủ kho (lên thẻ Cổng Phạm vi)

- **Hỏi-1** (yêu cầu P1-21): bỏ mục (3). Khuyến nghị bỏ, có số ở trên; lối khác: thu E17 (một hồ sơ đã ký phải ghim lại,
  không bớt lần hoá cũ nào) hoặc nới `paths` theo bao đóng (hàng riêng).
- **Hỏi-2** (yêu cầu P1-22): thu hẹp mục (2) về hồ sơ không bị kéo ghim lại. Ký theo khuyến nghị là đổi câu SỐNG
  thứ hai của ô cơ hội («không hồ sơ nào còn lý do `eval-ngoai-may-thieu-paths` do một eval judgment») thành «ở các hồ
  sơ trong danh sách»: 44 hồ sơ đợi lần ghim kế, ba eval không suy được paths còn rơi về luật cũ. Khuyến nghị thu hẹp; lối khác: làm trọn 51
  hồ sơ và ghim lại 44 trong PR (nhiều giờ máy, chiếm khoá `s4` của đợt), hoặc bỏ (2) chỉ báo kit.

## Đường đo

`bash scripts/pre-merge-check.sh .` không `--base`, đếm dòng `evidence is stale`, chạy trên cùng `onehub` trước và sau
khi áp PR (trước: 245 trên `34d31a8bf`). AC-5 bảo đảm phần giảm bằng máy: mỗi hồ sơ đã ký trong danh sách đổi từ hoá cũ
sang `SACH`.
