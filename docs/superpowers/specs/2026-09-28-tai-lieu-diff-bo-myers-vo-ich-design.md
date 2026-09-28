# tai-lieu-diff-bo-myers-vo-ich — design

Ngày 2026-09-28 · T2 · `packages/validation`

## Vấn đề

Ca `tai-lieu-diff > tat-dinh: dong ho chay nhanh hay cham thi diff va diffHash van y het`
(`packages/validation/test/tai-lieu-diff.spec.ts`) chạy sát trần 5 000 ms mặc định của
bun trên CI. Ngày 28/09 nó đỏ ở ba lượt CI «check-types, lint, test»: 36429546046
(5 079 ms), 36403538413 (5 065 ms), 36397919441 (5 133 ms); xanh ở 36420751519 (4 882 ms).

Ca đó gọi `soSanh` hai lần trên hai bản 200 000 ký tự khác nhau hoàn toàn, một lần với
đồng hồ thật và một lần với `Date.now` giả nhảy 60 giây mỗi lần gọi.

## Điều tra — hai giả thuyết

**Giả thuyết 1: có nhánh phụ thuộc `Date.now` (hạn thời gian) bị đồng hồ giả đẩy vào
đường chậm.** Bác bỏ. `soSanh` không đọc đồng hồ. Thư viện `diff` 8.0.4 (`libesm/diff/base.js`)
gọi `Date.now()` ở mỗi vòng `editLength` và so với `Date.now() + (options.timeout ?? Infinity)`.
Kho không truyền `timeout`, nên vế so luôn là `Infinity` và đồng hồ giả không đổi được nhánh.
Đo: một lần `soSanh` trên cặp văn bản của ca này gọi `Date.now` 2 001 lần; bọc bằng `spyOn`
hay hàm đếm tay thì thời gian như nhau (±3 %).

**Giả thuyết 2: chỉ là văn bản dài.** Đúng một phần. Tách một lần `soSanh` (máy Mac mini,
Bun 1.3.12, lặp ba lần sau hâm nóng):

| Phần | ms | Bản chất |
| --- | --- | --- |
| `chuanHoa` hai bên | ~200 | parse → tuần tự hoá, việc thật |
| `nap` hai bên | ~200 | parse lần hai, việc thật |
| `diffArrays` mức khối | ~250–300 | **việc vứt đi** |

Hai bản khác nhau hoàn toàn nên khoảng cách sửa Myers `D` ≈ 3 300 khối, vượt
`TAI_LIEU.diff.tranSuaKhoi` = 2 000. `diffArrays` chạy đủ 2 000 vòng `editLength` (khoảng
bốn triệu ô đường chéo) rồi mới trả `undefined`, và `soSanh` rơi về `theoKhoi`. Cả phần
đó không đóng góp gì vào kết quả.

## Cách sửa gốc

Myers tìm `D = N + M − 2·LCS`, và `LCS ≤ |giao đa tập của hai dãy khối|`. Vậy
`canDuoiSua = N + M − 2·|giao đa tập|` là một cận dưới của `D`, tính được trong O(N + M)
bằng một `Map` đếm khoá `[kieu, chu]` (đúng quan hệ bằng của `giong`).

`soSanh` chỉ gọi `diffArrays` khi `canDuoiSua(a, b) ≤ tranSuaKhoi`. Khi cận dưới vượt trần
thì `D > tranSuaKhoi`, nên `diffArrays` chắc chắn đã trả `undefined`: bỏ lời gọi cho ra
**đúng từng byte** kết quả cũ. Không có hằng mới; trần vẫn là `TAI_LIEU.diff.tranSuaKhoi`
trong `packages/validation/src/tai-lieu.ts`, module cấu hình của khu.

Đo trên bản mẫu (scratchpad): `soSanh` trên cặp của ca `tat-dinh` 687 → 417 ms (−40 %),
`Date.now` 2 001 → 0 lần. Sáu fixture biên cho `diffHash` trùng từng ký tự với bản gốc
`cfac5bea`. Hai đột biến bị bắt đúng chỗ: `>=` thay `>` làm lệch `bien-dung-tran`;
«không đếm phần chung» làm lệch `dai-sua-rai-rac`.

Ước lượng CI: ca `tat-dinh` 1 450 → ~870 ms tại chỗ; hệ số CI/tại chỗ đo được ~3,5 →
khoảng 3 000 ms trên CI, cách trần 5 000 ms khoảng 40 %, trong khi dao động đo được giữa
bốn lượt CI là ±5 %.

## Không đặt trần thời gian riêng

Đề bài cho hai đường: sửa gốc nếu có, đặt trần riêng qua hằng cấu hình nếu chỉ là khối
lượng. Có gốc để sửa, nên vòng này **không** đặt trần riêng cho ca `tat-dinh`. Nâng trần
chỉ nới thước: một hồi quy hiệu năng thật của `soSanh` lúc đó sẽ đi qua ca này im lặng.
Lời hứa tốc độ đã có chỗ riêng là hai ca `diff-trang-dai` với `TRAN_MS`.

Điều kiện xét lại: sau khi merge, nếu ca `tat-dinh` trên CI vượt 3 500 ms ở bất kỳ lượt
nào thì mở vòng mới, và bàn lần parse thứ hai hoặc trần riêng.

## Ngoài phạm vi

- Lần parse thứ hai trong `khoiCua` (`nap(chuanHoa(md))`): bỏ nó có thể đổi cây khi vòng
  khứ hồi markdown không lũy đẳng, tức đổi `diffHash` đã lưu. Cần hợp đồng riêng.
- Chặn tương tự ở mức từ (`diffWordsWithSpace` trong `soTheoTu`): bộ tách từ nằm trong
  thư viện; dựng lại cận dưới phải khớp đúng bộ tách của nó. Ca `diff-trang-dai: một đoạn
  200 000 ký tự` không đỏ chập chờn.
- Ca đảo thứ tự (`dao-thu-tu`): cận dưới bằng 0 nhưng `D` vượt trần; `diffArrays` vẫn chạy
  đủ trần rồi bỏ cuộc như trước. Chặn được ca đó cần LCS thật, không rẻ.
- Đặt `timeout` cho `diffArrays`: kết quả sẽ phụ thuộc tốc độ máy, phá đúng lời hứa của
  ca `tat-dinh`.

## Đo

- Ghim `diffHash` bản gốc cho sáu fixture biên trong `tai-lieu-diff.spec.ts` (ca
  `tran-duoi-khoi: <tên>`).
- Ca `myers-vo-ich`: đếm `Date.now` trong một lần `soSanh` — 0 khi khác hết; đối chứng
  dương trên `dai-sua-rai-rac` (trong trần) phải thấy > 0, để chứng cây đếm còn sống.
- Răng `rang/cat-thuoc.mjs`: worktree tạm, cấy ba đột biến, mỗi đột biến làm đúng một
  ca đỏ với thông điệp ghim; bản lành xanh.
- Răng `rang/nhanh-hon-goc.ts`: chạy thân ca `tat-dinh` mười lượt xen kẽ trên mã HEAD và
  mã ở merge-base; trung vị HEAD ≤ 0,75 × trung vị gốc.
- Chạy lại E6, E13 của hồ sơ đã ký `kho-tai-lieu` (hai eval có `paths` chứa `tai-lieu-diff.ts`).
