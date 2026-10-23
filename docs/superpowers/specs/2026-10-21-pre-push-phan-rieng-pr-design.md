# pre-push xét phần PR tự thêm khi đỉnh là commit gộp onehub — thiết kế

Ngày 21/10/2026. Hồ sơ `_acceptance/pre-push-phan-rieng-pr/`. Hạng T2.

## Vấn đề

Đường nhẹ của `.githooks/pre-push` (hồ sơ `pre-push-t1`, #451, #480) quyết theo **phần tăng so với đầu nhánh từ xa**:
`git diff <sha từ xa> <sha cục bộ>`. Lần đẩy ngay sau khi gộp `origin/onehub` vào nhánh vì thế mang theo mọi tệp mà
người khác vừa đưa vào `onehub`. Có một tệp mã của người khác là cả lần đẩy thành nặng, chạy đủ năm bước (~30 phút),
dù mã ấy đã qua CI của PR của họ.

CI không lệch như vậy: `phan-loai.mjs` so `HEAD^1..HEAD` của merge-ref, tức **phần PR tự thêm so với onehub**. Hai bên
cùng luật nhưng khác gốc so.

Ca thật: commit `1ddf125b3` (gộp `origin/onehub` vào nhánh #523). Phần tăng 24 tệp, 4 tệp mã của người khác. Phần PR tự
thêm trong lần đẩy chỉ có `LO-TRINH.html`.

Đo trên lịch sử: mọi commit gộp `origin/onehub` vào nhánh PR mà `1f6757ba0` với tới, từ 00:00 ngày 14/10 (giờ Việt
Nam) — 412 lần —, phân loại bằng `quyetDinh` thật (`_acceptance/pre-push-phan-rieng-pr/rang/lich-su.mjs`, E6):

| Luật | Lần đi nhẹ |
| --- | --- |
| Cũ: cả phần tăng | 6 |
| Phép giao trần của bản phân tích (`tăng ∩ diff(cha thứ hai, đỉnh)`) | 72 |
| Vòng này: phép giao đủ hai vế (dưới) | 38 |

Không lần nào luật cũ cho nhẹ mà luật mới cho nặng. 34 lần chênh giữa hai dòng dưới là do vế `riêng_trước`; tệp nó kéo
vào phần lớn là `LO-TRINH.html` và `PRODUCT-MAP.md` — tệp sinh mà PR từng vẽ lại, rồi lần gộp trả về bản onehub, nên có
thể lệch với nguồn của PR. Phần còn nặng hầu hết vì `_acceptance/config.yaml` (PR nào cũng thêm khoá, bản gộp là bản ghép
tay) và `LO-TRINH.html` (tệp T1 mà mã đọc).

Mốc giờ phải ghi đủ: `git log --since=2026-10-14` hiểu là ngày đó lúc giờ hiện tại, nên cửa sổ co lại theo giờ chạy (lần
đo lúc thiết kế ra 351 rồi 347 trên cùng lịch sử).

## Luật mới

Mỗi dòng stdin có gốc so là sha từ xa (sha khác 0 và có trong kho) và có `refs/remotes/<remote>/onehub` được xét theo

```
nền         = merge-base(đỉnh, <remote>/onehub)
tăng        = diff(sha từ xa, đỉnh)
riêng_sau   = diff(nền, đỉnh)                          — phần PR khác bản onehub nó đang đứng trên
riêng_trước = diff(merge-base(nền, sha từ xa), sha từ xa) — phần PR đã khác onehub trước lần đẩy
S           = tăng ∩ (riêng_sau ∪ riêng_trước)
```

Tệp của `tăng` không thuộc `S` là **tệp của onehub**: ở cả hai đầu của lần đẩy, PR không khác bản onehub của tệp đó.

- Lần đẩy không mang commit mới của onehub (nền là tổ tiên của sha từ xa): khi đó `merge-base(nền, sha từ xa)` = nền,
  nên mọi tệp của `tăng` khác nền ở ít nhất một đầu và `S = tăng` — luật tự rút về luật cũ, không cần nhánh riêng.
- Lần đẩy mang commit mới của onehub — đỉnh là commit gộp, hay gộp rồi sửa thêm mới đẩy, hay gộp một nhánh mà nhánh đó
  chứa onehub mới — đều đi cùng một luật. Bản đầu của thiết kế chỉ áp cho đỉnh hai cha có cha thứ hai thuộc onehub; đó
  là một điều kiện thêm không chặn thêm rủi ro nào, chỉ giữ ca «gộp rồi sửa thêm» đi nặng (Hỏi-3 ở Cổng Phạm vi).
- `riêng_sau` là vế của bản phân tích, với nền là merge-base thay đầu `origin/onehub`: onehub đi tiếp sau lần gộp thì đầu
  ref đã khác bản đã gộp, so với nó kéo tệp người khác vào `S`.
- `riêng_trước` đóng một lỗ của phép giao trần: PR từng sửa `a.ts`, lần gộp giải xung đột lấy bản onehub của `a.ts`. Khi
  đó `a.ts` nằm trong `tăng` mà không trong `riêng_sau`; phép giao trần coi nó là của onehub và bỏ `test`, trong khi mã
  còn lại của PR có thể dựa vào bản cũ của nó. Cùng lỗ ấy với tệp sinh: `LO-TRINH.html` PR từng vẽ lại bị trả về bản
  onehub thì lệch với nguồn của PR.

Quyết định trên `S` (hợp qua mọi dòng; tệp thuộc `S` của dòng nào thì không còn là tệp của onehub ở dòng khác):

- `S` rỗng mà có tệp của onehub → bỏ `t1Only.skip`. `quyetDinh` của CI coi tập rỗng là nặng (`khong-co-tep`) vì một PR
  không tệp là bất thường; ở đây tập rỗng có nghĩa khác, nên bộ phân loại xử riêng ca này TRƯỚC khi gọi `quyetDinh`. Đẩy
  rỗng thật (`tăng` rỗng) vẫn nặng như cũ.
- `S` khác rỗng → `quyetDinh` y như cũ trên `S`: chỉ T1 → bỏ; có tệp `t1_ma_doc`, `.github/**`, hay tệp mã → đủ năm bước.

Dòng không có sha từ xa dùng được (ref mới, sha không có trong kho) đi đúng luật cũ: gốc là `merge-base(<remote>/onehub,
đỉnh)`, vốn đã là phần PR tự thêm. `<remote>/onehub` vắng mà sha từ xa có: luật cũ, không lỗi.

## Dòng stderr

Dòng của luật cũ giữ nguyên từng byte khi không có tệp của onehub. Có tệp của onehub thì:

- `S` rỗng: `pre-push: lần đẩy chỉ mang phần của onehub (<k> tệp), PR không tự thêm tệp nào — bỏ test, build; CI phân loại PR theo cùng luật.`
- `S` chỉ T1: `pre-push: chỉ tệp T1 trong phần PR tự thêm (<n> tệp; <k> tệp của onehub không tính) — bỏ test, build; CI phân loại PR theo cùng luật.`
- `S` nặng: `pre-push: phần PR tự thêm (<n> tệp; <k> tệp của onehub không tính) có <tệp dưới .github/|tệp T1 mà mã đọc|tệp ngoài T1> (<tối đa 3 tệp>[ +m]) — chạy đủ năm bước.`
  Nhãn theo lý do của `quyetDinh`: `cham-github` gọi tên tệp dưới `.github/`, kể cả tệp T1 như `.github/*.md` (thêm
  22/10, Ngoài-2 của Cổng Bằng chứng); `t1-ma-doc` gọi tên tệp `t1_ma_doc`; còn lại gọi tên tệp ngoài T1.

«test, build» là `t1Only.skip` nối bằng «, », không viết tay (răng một-nguồn của `pre-push-t1`).

## Không đổi

- `.githooks/pre-push` không đổi một byte: nó vẫn chỉ đọc stdout của bộ phân loại.
- `scripts/verify-gate-shape.mjs`, `phan-loai.mjs`, `t1_skip_globs`, `t1_ma_doc`.
- `t1Only.skip` vẫn `["test", "build"]`. Chỉ câu `vi_sao` của `t1Only` thêm luật gộp, để khai không nói sai.
- Các neo byte mà răng `dot-bien.mjs` và `mot-nguon.mjs` của `pre-push-t1` cấy đột biến vào (`return { boQua: kq.nang ?
  [] : boQua, …`, `const kq = quyetDinh(…)`, `return gitPhai(goc, "merge-base", ref, dong.localSha);`, `"--no-renames", `
  đúng một lần, `for (const dong of dongs) {`, `const SHA_RONG`).

## Đã cân nhắc và bỏ

- **Chỉ chạy các bài đọc `LO-TRINH.html` khi `S` chỉ có nó** (Hỏi-2 ở Cổng Phạm vi; máy khuyên không
  làm ở vòng này). Bộ quét `t1-ma-doc.mjs` biết 17 bên đọc ở năm gói, trong
  đó có `apps/app/lib/lo-trinh/doc-tep.ts` — mã chạy của app đọc tệp này qua `process.cwd()`. Bỏ `build` là bỏ đúng một
  bên đọc, nên đường «chỉ bài đọc» không phải đường nhẹ mà là một chế độ thứ ba của hook (chạy một phần `test`, giữ
  `build`), phải đổi vòng lặp hook đang bị sáu răng ghim byte và dạy `verify-gate-shape` nhận một lượt `test` thiếu gói.
  Làm được, nhưng là một vòng riêng có giá: đổi vòng lặp hook, dạy bộ soát hình cổng, và phải tự chứng 17 bên đọc đủ.
  Theo khuyến nghị, vòng này giữ `LO-TRINH.html` kéo nặng: **ca #523 không được giải**, chỉ được gọi tên đúng.
- **So với đầu `origin/onehub`** thay merge-base: xem trên.
- **Đòi PR không ở dạng nháp, kiểm `ci-ok` trên đầu từ xa** (điều kiện 1 và 5 của bản phân tích): cần mạng (`gh`), mà
  hook không gọi mạng. Chúng là điều kiện của lệ `--no-verify`, không phải của đường nhẹ — đường nhẹ vẫn chạy
  `check-types`, `lint`, `lint:slop`.

## Giới hạn

- Mã của PR không được thử lại cùng mã mới của onehub ở máy: `test` bị bỏ khi `S` chỉ T1 dù onehub vừa đổi một tệp mà
  mã PR gọi. `check-types` vẫn bắt lỗi kiểu; lỗi hành vi lộ ở CI (CI chạy trên merge-ref). Đây chính là đánh đổi của đề
  bài, như với lần đẩy chỉ T1 hôm nay.
- Lần đẩy gộp onehub vào nhánh nháp: CI nặng chưa chạy cho tới `gh pr ready`.
- Bộ phân loại tin `refs/remotes/<remote>/onehub` cục bộ; nó không `fetch`.
