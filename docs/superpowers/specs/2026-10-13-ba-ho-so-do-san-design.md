# Hồ sơ đã ký không còn đỏ sẵn — thiết kế (F24, `ba-ho-so-do-san`)

Ngày 13/10/2026 · đợt r2, dãy P7 · hạng T2 · Cổng Đáng ký 12/10 (build).

## Vấn đề

Một hồ sơ đã ký «đỏ sẵn» khi thước của nó không còn đo được gì trên `onehub`: hoặc eval máy đỏ dù sản phẩm
không hỏng, hoặc mục `paths` trỏ tới tệp không có trên cây. Cả hai làm hỏng việc của người khác:

- Eval đỏ sẵn làm lượt ghim lại của mọi PR chạm hồ sơ ấy đỏ (P8-4, 09/10: ba hồ sơ, ghim lại chạm chúng là đỏ).
- Một mục `paths` chết tắt bộ lọc hoá cũ của CẢ hồ sơ (`staleByPaths` đóng mặc định — kit 2.28.0,
  `lib/evidence-core.cjs`), nên hồ sơ ấy bị coi là cũ sau mọi PR chạm bất cứ đâu và đòi ghim lại vô cớ.

## Số đo lúc mở vòng (mốc nền `3a2783409894908bc8dd1ee3893b88f990d1aebe`)

Quét bằng chính `phanLoaiMucPaths` của kit trên cây `git ls-files` ở mốc nền, mọi hồ sơ `signed-off`/`machine-cleared`:

| Nhóm | Hồ sơ | Ghi chú |
|---|---|---|
| Mục `paths` trỏ tệp không có (`paths-khong-tro-toi-tep`) | 16 | 4 hồ sơ `dieu-phoi-*`/`kiem-cheo-*` trỏ `scripts/dieu-phoi/**` đã gỡ ở `063891179` (#373) — mọi ô đã `not-run`; số còn lại trỏ tệp đã xoá/dời ở commit có tên, hoặc tệp chưa từng có trong lịch sử (gõ sai lúc viết) |
| Mục khai sai dạng (`dang-khai-la`) | 1 | `danh-sach-keo-chung`: thư mục viết có `/` ở cuối |
| Eval máy đỏ sẵn (P8-4) | 3 | `khoa-con-bat-xa-tran` E4 · `lenh-dung-do-khong-ai-thay` E5 · `do-man-tren-kho-rieng` (`dmk_khong_noi_thuoc`) |

`khoa-con-bat-xa-tran` có mặt ở cả hai nhóm → **19 hồ sơ** trong danh sách đóng.

Nguyên nhân ba ca P8-4, đo lại 13/10:

- `kcb_khong_noi_tran` đỏ: 5 ca của `apps/api/test/go-la-cat-quyen.spec.ts` mang trần riêng `TRAN_MA_TRAN_MS = 60_000`,
  thêm ở `b703e8bef` (27/09) bởi `tro-ly-okr-nen` vòng S4-r1 (`d-20260927T112853Z-28`: «go-la-cat-quyen hết trần 5
  giây dưới tải S4»). Hồ sơ `khoa-con-bat-xa-tran` (ký 26/09) hứa AC-4 «không ca nào mang trần thời gian riêng». Hai
  hồ sơ đã ký mâu thuẫn nhau — câu hỏi cho người (Hỏi-2).
- `ld_ba_noi_deu_chay` đỏ: điều 2 đòi `.github/workflows/ci.yml` giống từng ký tự bản ở sha `3c97e759`; luật 47 (09/10,
  `CLAUDE.md`) giao `ci.yml` cho OneHub và tệp đã đổi 85 dòng. Thêm: `spawnSync` không khai `maxBuffer` (đầu ra
  pre-push > 1 MiB → `status` null).
- `dmk_khong_noi_thuoc` nay xanh (chạy 13/10 ở mốc nền: «khong-noi-thuoc: sach») — tự hết đỏ, chỉ ghi lại.

Ngoài vòng: kiểm chéo đêm 11–13/10 mới chấm ~45/223 hồ sơ (theo thứ tự chữ cái) và đã gọi tên 15 hồ sơ có eval đỏ
(39 eval), phần lớn là phép đo màn cần máy chủ ở cổng 3000/3500. Tập đó còn mở và lớn dần mỗi đêm (Hỏi-1).

## Cách làm

Một **danh sách đóng** `_acceptance/ba-ho-so-do-san/danh-sach.json` là vật trung tâm: mỗi dòng là một (hồ sơ, eval,
mục) đỏ hoặc chết ở mốc nền, kèm đúng một cách xử lý:

| Xử lý | Khi nào | Đổi gì |
|---|---|---|
| `tro-duong-moi` | tệp bị dời/đổi tên, hoặc gõ sai mà tệp đúng có trên cây | `paths` trỏ đường thật; `cmd`/`expected` giữ nguyên |
| `bo-paths` | ô đã `not-run` mà `paths` trỏ vật đã gỡ | bỏ khoá `paths` (ô không chạy thì không cần theo dõi vật) |
| `khai-not-run` | vật mà ô đo đã gỡ khỏi sản phẩm, hoặc lời hứa bị một quyết định đã ký sau thay | `status: not-run` + `ly_do` + `can_cu` (sha có thật hoặc tệp:dòng có thật) |
| `sua-rang` | răng đỏ vì tiền đề đã bị luật sau lật, hoặc lỗi của chính răng | sửa răng; chiều đỏ của răng vẫn phải bắt |
| `tu-het` | eval đã xanh lại ở mốc nền | không đổi; ghi lượt chạy xanh |

Mỗi hồ sơ bị chạm được **ghim lại một lượt lane** (`repin-lane.mjs --slug … --write`, khoá `ghim-lai`) ở đuôi vòng.
Ghim xanh = định nghĩa của «không còn đỏ sẵn»: mọi eval máy của hồ sơ đạt kỳ vọng ở cây đang xét.

Lớp đo của vòng (bốn lớp, mỗi lớp một eval):

1. **Tĩnh** — `rang/paths-song.mjs`: không còn mục nào `paths-khong-tro-toi-tep`/`dang-khai-la` trong 19 hồ sơ.
2. **Khai** — `rang/danh-sach.mjs` + `rang/khai-du.mjs`: danh sách đúng bằng tập quét ra ở mốc nền (không thiếu, không
   thừa); mọi đổi dưới `_acceptance/<hồ sơ khác>/` từ mốc nền tới HEAD đều có một dòng của danh sách — không ô nào
   bị hạ thầm lặng; không hồ sơ ngoài danh sách bị chạm.
3. **Hành vi** — `rang/ghim-xanh.mjs`: mỗi hồ sơ bị chạm có dòng `repin` mới, suite và eval đều đạt, `verified_commit`
   khớp, `recheck-evidence` không VIOLATION.
4. **Phán xét** — hội đồng đọc `danh-sach.json` + `bang-truoc-sau.md`: mỗi lý do `khai-not-run`/`sua-rang` là lý do
   thật, không phải lối thoát cho một sản phẩm đang hỏng. `bang-truoc-sau.md` do `rang/bang.mjs` sinh, mỗi dòng có bốn
   phần: eval trước/sau; với `khai-not-run` thì `git show --stat <can_cu>` cho thấy vật bị xoá và `git ls-files` ở HEAD
   không còn vật; với `sua-rang` thì diff của răng và đầu ra của đột biến có tên.
5. **Chiều đỏ của răng đã sửa** — `rang/chieu-do.mjs`: mỗi dòng `sua-rang` khai một đột biến; hàm kiểm của răng
   (tách ra mô-đun dùng chung, vd `dieu-ci.mjs` cho `ld`) đạt trên nội dung thật và bắt bản sao đột biến.

Mốc nền được ghim bằng sha cố định, không dùng `merge-base` hay `HEAD`, để thước không tự hết hạn khi vòng gộp
(bài học F21, `sua-ho-so-da-ky-keo-ghim-lai`).

## Ranh giới và chi phí

- Hàng khai ranh giới `_acceptance/ba-ho-so-do-san/**`; vòng còn chạm `_acceptance/<18 hồ sơ>/evals.yaml` và (tuỳ Hỏi-2)
  răng của chúng → gửi `cham-tep` cho giám sát trước S3. `_acceptance/config.yaml` chỉ thêm khoá (luật 7).
- Không chạm mã sản phẩm (`apps/**`, `packages/**`) ở lối máy khuyên. Lối (a) của Hỏi-2 mới chạm `apps/api/test/**`.
- Ghim lại 18 hồ sơ trong một lượt lane: suite chạy một lần + eval máy của 18 hồ sơ (phần lớn ô `dieu-phoi-*` đã
  `not-run`). Ước 40–80 phút dưới trần `repin_budget_min: 80`.

## Câu hỏi cho người (lên thẻ Cổng Phạm vi)

- **Hỏi-1 · phạm vi kiểm chéo.** Khuyên: vòng này chỉ 19 hồ sơ (3 P8-4 + 17 paths chết, trùng 1). Hồ sơ kiểm chéo gọi
  tên mà ngoài danh sách vào mục `ngoai_vong` của danh sách, mở một hàng mới qua giám sát. Lối khác: gộp cả 15 hồ sơ
  kiểm chéo đã thấy — giá: thêm khoảng 39 eval, phần lớn cần bàn đo màn, vượt hạn mức dãy vệ sinh, và tập đó vẫn
  chưa khép vì kiểm chéo mới đi được khoảng 1/5.
- **Hỏi-3 · điều 2 của `ld_ba_noi_deu_chay`** (sinh từ gap-probe P0). Khuyên: thay phép so từng ký tự với bản `ci.yml`
  của hãng bằng phép kiểm cấu trúc — `ci.yml` còn ít nhất một bước chạy `bun run build` không mang `if` hay
  `continue-on-error` — để răng vẫn giữ lời hứa «ba nơi đều chạy» mà không đỏ khi `ci.yml` đổi chỗ khác. Lối khác: bỏ
  hẳn điều 2 (rẻ nhất, răng chỉ còn kiểm hai nơi); ghim lại bản `ci.yml` hiện tại (đỏ lại mỗi lần sửa `ci.yml`).
- **Hỏi-2 · trần 60 giây của `go-la-cat-quyen`.** Khuyên: (b) khai E4 của `khoa-con-bat-xa-tran` là `not-run`, lý do
  trỏ `d-20260927T112853Z-28` của `tro-ly-okr-nen` — lý do nới trần đã nói thành lời, đúng luật chủ kho đặt 26/09; không
  chạm mã. Lối khác: (a) gỡ trần ở 5 ca, giữ lời hứa AC-4 — giá: chạm `apps/api/test`, phải chứng 10 lượt xanh dưới tải
  S4, có rủi ro đỏ lại như S4-r1 của `tro-ly-okr-nen`; (c) sửa răng cho phép trần chỉ khi khai ở một hằng có tên kèm
  lý do — giá: đổi nghĩa AC-4 đã ký, viết lại răng 257 dòng.

## Đặc tả UX

Không áp dụng — vòng không chạm mặt người nhìn (surface `tooling`). Đã ghi `descope` trong sổ.
