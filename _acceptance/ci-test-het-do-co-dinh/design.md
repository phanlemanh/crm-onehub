# Thiết kế — ci-test-het-do-co-dinh (F37)

## Vấn đề

Từ 28/10 21:12Z, mọi lượt CI đủ đỏ ở bốn ca: `dau-hook (e)` (`test (app-ui)`) và ba ca của `test (api)` — móc dọn
`mat-khau-lien-ket`, `vai-chi-okr > gan-vai`, `dgt-thuoc`. Nếp «`test (api)` chập chờn không chặn» che màu đỏ này,
nên PR nào cũng gộp khi test đỏ.

Cả bốn ca đều **phụ thuộc thứ tự tệp**: chạy riêng thì xanh, kể cả trên máy và trong Docker Linux giống CI. Bun chạy
mọi tệp spec của một gói trong **một tiến trình** và trên **một kho dữ liệu dùng chung của lượt**. Thứ tự tệp đổi khi
thêm hay bớt tệp, nên trước 28/10 có nhánh đỏ có nhánh xanh, rồi đỏ cố định.

## Nguyên nhân, có bằng chứng

Chiều đỏ đo trên nền `onehub` 6ca59691a, lưu ở `chieu-do-tren-nen.md`.

### Ca `dau-hook (e)` — đồng hồ toàn cục bị ghim

`packages/ui/test/lai-ra-man.spec.tsx:62` gán `globalThis.Date` bằng lớp `DateNeo` ngay ở tầng module, với
`Date.now()` đứng im ở `2026-09-08T12:00:00+07:00`, và không trả lại. Khi tệp đó chạy trước
`pre-push-da-chung.spec.ts`, ca (e) ghi `luc` của dấu = 26/08. Hook là tiến trình `node` riêng, dùng giờ thật, nên coi
dấu đã quá 14 ngày, bỏ nó, và chạy lại ba bước (`Expected - 1 · Received + 5`).

Thứ tự khớp ở cả ba log CI: lượt đỏ 41191965481 và 40615647043 chạy `lai-ra-man` trước, lượt xanh 40573884050 (27/10)
chạy sau. Tái hiện bằng `bun test ./test/lai-ra-man.spec.tsx ./test/pre-push-da-chung.spec.ts -t dau-hook`.

Cùng lớp lỗi: `nguon-ci (d)` đo thời gian chạy bằng `Date.now()`. Khi đồng hồ bị ghim thì hiệu luôn bằng 0, phép đo
luôn xanh.

### Ba ca `api` — một người dùng sót lại, một móc dọn quá rộng

Phát lại 278 tệp đúng thứ tự lượt 41191965481 trên kho thử riêng cho ra **2167 pass · 3 fail**, đúng ba ca như CI.
Tra kho sau lượt đỏ:

1. `dev-grant-needed.spec.ts` (vị trí 62) tạo người dùng `<TEST_RUN_ID>-grant-needed@localhost`. Hàm
   `ensureWorkspaceMembership` cho người đó vai **owner**, vì không gian làm việc đang trống. Tệp không có `afterAll`.
2. Một tệp chạy sau gọi `gieoViecMau`. Hàm này giao việc mẫu cho thành viên sớm nhất, tức đúng người sót lại: việc
   «Đọc lại ghi chú buổi gặp quý trước», `nguoiGiaoId = dev-66333774687574752d67`.
3. Móc dọn của `mat-khau-lien-ket` (vị trí 101) xoá mọi người dùng có email *chứa* `TEST_RUN_ID` hay id bắt đầu bằng
   `TEST_RUN_ID-`. Khoảng 70 tệp dùng chung tiền tố này, nên móc dọn nhắm cả người sót lại kia. Hàng `viec` chặn bằng
   khoá ngoại `viec_nguoiGiaoId_fkey`, và cả lượt dọn rơi.
4. Người sót lại vẫn là owner. Vì vậy ở `vai-chi-okr` (154), «chu» không còn là chủ sở hữu cuối và lệnh hạ vai không bị
   chặn. `dgt-thuoc` (173) gọi `gieoDuAnMau`, hàm này chọn người đó làm người tạo dự án mẫu. Phần đăng nhập của bài
   kiểm dùng email `<id>@thu.test`, nên báo `User not found`.

### Hai ca `dau-hook (i)`, `(j)` — khác gốc, giám sát cho gánh luôn

Dãy D đo đường nền trên máy bận thì thấy hai ca này hết giờ. Tệp không đặt giờ chờ, nên mỗi ca chỉ có 5 giây mặc
định. Số đo:

| Lượt | (i) | (j) |
| --- | --- | --- |
| Máy bận, đường nền dãy K, tải ~5 | 3361ms | 1871ms |
| CI 27/10 | 1610ms | 707ms |
| Docker Linux rảnh | 943ms | 392ms |

## Cách sửa

Chỉ sửa trong ranh giới của dãy K (`packages/ui/test/pre-push-da-chung.spec.ts`, `apps/api/test/**`). Mỗi chỗ sửa ở
**nguồn rò** hoặc ở **chỗ ca tự giả định**, không vá chỗ triệu chứng.

- **`pre-push-da-chung.spec.ts`**:
  - `bayGio()` lấy giờ thật từ `performance.timeOrigin + performance.now()`, thay cho mọi `Date.now()` toàn cục. Đây
    là đồng hồ mà hook cũng dùng.
  - Ca **(k)** mới tự ghim `Date` như `lai-ra-man`, rồi chạy lại chuỗi 13→15 ngày; ca này giữ lỗi khỏi quay lại.
  - Trần chung `TRAN_DAU_HOOK_MS = 30 000` cho mọi ca của `describe("dau-hook")`, ép được bằng `DAU_HOOK_TRAN_MS`.
- **`dev-grant-needed.spec.ts`**: thêm `afterAll` dọn đúng người dùng của mình (session, account, member, user).
- **`mat-khau-lien-ket.spec.ts`**: đổi tiền tố thành `mkl-<TEST_RUN_ID>`, để móc dọn chỉ khớp dữ liệu của chính nó.
- **`du-an-do-nguong.spec.ts`**:
  - Trước khi gieo, dời `createdAt` thành viên của n1, n2 lên trước thành viên sớm nhất hiện có; chỉ chạm hàng của
    chính ca.
  - Thêm dòng `expect(nguoiMau, "<lý do đỏ cũ>").toBe(n1.id)`.
- **`vai-chi-okr.spec.ts`**: thêm tiền đề nói to `expect(chuKhac, "chu phai la chu so huu duy nhat; …").toEqual([])`.
  Còn chủ sở hữu sót lại thì ca đỏ và gọi tên người đó, thay vì đỏ mơ hồ ở `rejects.toThrow`.

## Lựa chọn đã loại

- **Sửa `lai-ra-man.spec.tsx` cho trả `Date` sau `afterAll`** (sửa tận gốc ca (e)). Tệp nằm ngoài ranh giới và nằm
  trong `evals.yaml` của năm hồ sơ đã ký, nên sửa nó kéo theo ghim lại. Đã gửi `viec-phu` K-1 để giám sát xếp hàng
  riêng. Ca (k) bảo đảm pre-push-da-chung đứng vững dù tệp đó còn hay đã sửa.
- **Ở `vai-chi-okr`, tạm hạ vai các chủ sở hữu khác rồi trả lại.** Cách này xanh kể cả khi có rò, nhưng ghi vào dữ
  liệu của tệp khác, và che một lỗi rò có thật. Tiền đề nói to thì chỉ đúng chỗ rò.
- **Sửa `gieoViecMau`/`gieoDuAnMau` để thôi chọn «thành viên sớm nhất».** Hai hàm nằm ở `packages/db/src`, ngoài ranh
  giới, và là hàm gieo dữ liệu mẫu thật. Ghi thành hạt giống.

## Phép đo

| Răng | Đo gì | Chiều đỏ |
| --- | --- | --- |
| `rang/dong-ho-va-tran.mjs` | (e), (i), (k) xanh trên bản lành; trần ép được | thay `bayGio()` bằng `Date.now()` → (k) đỏ, thông điệp ghim; `DAU_HOOK_TRAN_MS=100` → (i) hết giờ |
| `rang/ro-ri.mjs` | tệp mồi tái dựng đúng chuỗi rò của CI; mkl, vai, dgt, dev xử đúng | tiền tố cũ → khoá ngoại; tiền đề vai gọi tên; bỏ bước dời n1, n2 → thông điệp lý do cũ; bỏ `afterAll` → còn một người dùng |
| `rang/phat-lai-thu-tu.mjs` | 278 tệp `api` và 21 tệp `app-ui` đúng thứ tự lượt CI đỏ → 0 fail; kiểm cả thứ tự thật | cùng thứ tự trên nền 6ca59691a → 3 fail, (e) fail (`chieu-do-tren-nen.md`) |
| `rang/rieng-ba-luot.mjs` | mỗi tệp trong bốn ca chạy riêng ba lượt liền xanh | — (đối chứng của phát lại) |

`bun test` thu gọn đầu ra khi thấy `CLAUDECODE=1`: không in tên tệp, không in dòng `(pass)`. Các răng gỡ biến đó
trước khi gọi bun.

## Ngoài phạm vi, hạt giống

- `lai-ra-man.spec.tsx` trả `Date` sau `afterAll` (K-1).
- `gieoViecMau`/`gieoDuAnMau` chọn thành viên sớm nhất của kho chung: dữ liệu mẫu thật có thể giao cho người không mong
  muốn.
- Khoảng 70 tệp `apps/api/test` dùng tiền tố `TEST_RUN_ID` trần, và nhiều móc dọn khớp bằng `contains`. Vòng này chỉ
  sửa tệp đã gây đỏ.
