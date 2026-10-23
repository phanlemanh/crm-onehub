# Thiết kế — Dọn hồ sơ cũ (F35 `don-ho-so-cu`)

Ngày 2026-10-20 · dãy F1 của đợt lo-trinh-tin-hieu · hạng T2 · không chạm giao diện.

## Vấn đề, đo trên đỉnh onehub

Lưới trước-gộp chạy không `--base` trên `b32a1495f` (đỉnh `onehub` 20/10 08:30Z): **281/299 hồ sơ đã ký báo «evidence
is stale»**. Bộ lọc theo `paths` áp cho 204 hồ sơ — chúng cũ vì một gộp thật sự chạm tệp mà eval của chúng khai. 77 hồ sơ
còn lại rơi về luật thô vì có eval không khai `paths` (63 eval ngoài làn máy, 7 eval máy, 5 `paths` trỏ tệp không còn,
2 dạng lạ): chúng cũ lại sau gần như mọi gộp có mã.

Hồ sơ cũ không chặn ai cho tới khi một vòng khác chạm nó — lúc đó vòng kia phải ghim lại hồ sơ người khác, và nếu thước
của hồ sơ ấy gãy thì vòng kia đỏ oan (đêm 17→18/10 gom chín ca như vậy). Kit 2.33 có lệnh giữ tươi theo khoảng gộp
(`giu-tuoi.mjs`, hàng K-A), nhưng lệnh ấy chỉ gọi tên hồ sơ **tồn đọng** — cũ từ trước khoảng — không ghim chúng: «cần
một vòng dọn riêng của kho». F35 là vòng dọn đó.

## Thu phạm vi 20/10 (chủ kho)

Chia lô theo giờ máy thật cho ra 17 lô, ~21,6 giờ máy cho 214 hồ sơ — phần lớn là eval đo màn thật. Chủ kho quyết
«Thực hiện theo lời khuyên.»: vòng chỉ ghim

- lô 8 của bản chia ấy (`lo-goc.json`) — có `dot-hoi-y-tuong-okr`, hồ sơ mà vk cần ghim để có dấu đỏ E13/E16;
- các hồ sơ đang chặn một PR mở: PR (không phải của vòng) chạm `_acceptance/<slug>/` của một hồ sơ cũ mà không tự ghim
  lại hồ sơ đó (`rang/chan-pr.mjs` chụp `chan-pr.json`) — trừ `okr-soat-anh-luot-3` của #499, đang chờ chủ kho;
- hai hồ sơ của K6a (luật 24: F35 thay PR #411).

Tập ấy là 12 hồ sơ, 2 lô, ~2,6 giờ máy. Gần 200 hồ sơ còn lại không ghim hàng loạt: PR nào chạm tới hồ sơ thì tự ghim hồ
sơ đó. Lý do theo thước North Star (giờ máy trên mỗi kết quả giao): một hồ sơ chỉ cần tươi khi có vòng chạm tới nó, nên
ghim lười chỉ trả tiền cho hồ sơ thật sự được dùng, còn ghim trước trả cho cả hồ sơ không ai chạm — và gộp kế tiếp lại
làm nhiều cái cũ lại. Các ca thước gãy đã gọi tên dưới đây mà không nằm trong tập ghim được sửa khi PR chạm tới (luật 23
vẫn áp). Lỗi gốc — gần như mọi hồ sơ cũ sau mỗi gộp, `giu-tuoi.mjs` không có `--slug` — chuyển sang kho kit.

Các mục dưới đây là thiết kế trước khi thu; phần «tập ghim» và «lô» đọc theo mục này.

## Cách làm

1. **Kiểm kê** (`rang/kiem-ke.mjs`): chạy chính `scripts/pre-merge-check.sh` không `--base` trên một sha, rút mọi
   `VIOLATION [<slug>]: evidence is stale` và dòng NOTE lý do bộ lọc không áp → `kiem-ke.json` (sha, danh sách hồ sơ cũ,
   mỗi hồ sơ một nhóm: `loc-ap` | `thieu-paths:<lý do>`). Không viết luật «cũ» thứ hai.
2. **Tập ghim** = hồ sơ nhóm `loc-ap` ∪ các ca đã gọi tên (mục dưới), trừ hồ sơ có vòng đã ký đang chờ gộp ở làn khác
   (luật 23). Nhóm `thieu-paths` ngoài các ca gọi tên KHÔNG ghim ở vòng này (Hỏi-1).
3. **Lô** (`rang/lo.mjs`): chia tập ghim thành lô, mỗi lô ước dưới trần làn 80′ (`feature_loop.repin_budget_min`) từ
   số lệnh eval của từng hồ sơ; mỗi hồ sơ đúng một lô → `lo.json`.
4. **Ghim từng lô, mỗi lô một PR gộp ngay** (Hỏi-2): nhánh `chore/don-ho-so-cu-lo-<n>` cắt từ đỉnh `onehub`, xin lượt
   `ghim-lai`, rồi `repin-lane.mjs --tung-ho-so --slug … --write` bọc `giu-nhip` + khoá máy. Suite chung chạy một lần
   mỗi lô; hồ sơ xanh được ghim. Đầu ra JSON của làn lưu vào `_acceptance/don-ho-so-cu/lan/<run_id>.json` (nhánh vòng).
   Hồ sơ đỏ: làn đã ghi dòng `repin-do` vào sổ chạy của nó — **hoàn lại cả cây `_acceptance/<slug>/` của hồ sơ đỏ về
   đỉnh `onehub`** trước khi commit lô, vì PR chạm thư mục một hồ sơ còn cũ là PR bị lưới trước-gộp chặn; bằng chứng
   đỏ sống ở tệp JSON của làn. PR lô chỉ chạm `run-log.jsonl` và `evidence-report.md` của hồ sơ xanh — đều là T1, CI
   nhẹ — và gộp qua lượt vk như mọi PR (luật 26), như PR #411 của K6a.
5. **Xử từng hồ sơ đỏ** — đúng một trong bốn, ghi vào `xu-ly.json`:
   - `sua-thuoc` — thước gãy (luật 23): sửa trong `rang/` hay lệnh của chính hồ sơ, đối chứng dương trên bản nguyên vẹn
     XANH, bản tiêm ĐỎ với đúng thông điệp ghim, một dòng sổ `fix` mang `decided_by` chủ kho (duyệt nhóm A 19/10), không
     đổi lời AC; rồi ghim lại trong lô kế.
   - `loi-kit` — thước gãy vì lỗi bộ kit: mở việc ở kho kit, không vá tại chỗ (CLAUDE.md).
   - `ngoai-pham-vi` — đỏ vì mã sản phẩm thật sự đổi (hồi quy hay thay đổi có chủ đích): không sửa mã ở vòng này; gọi tên
     làn chủ và gửi một việc phụ.
   - `cho-lan-chu` — làn chủ có vòng đã ký chờ gộp (luật 23): không chạm, ghi ngày hỏi trên #375.
   Hồ sơ `sua-thuoc` đi PR của vòng (nó cần chấm S4), rồi được ghim lại trên nhánh vòng sau commit sửa.
6. **Cuối vòng**: gộp `onehub`, chạy `giu-tuoi.mjs --tu <đỉnh onehub lúc lô đầu gộp> --write` để ghim lại hồ sơ mà các
   gộp trong lúc dọn làm cũ lại; rồi đối chiếu (`rang/doi-chieu.mjs`): chạy lưới trên HEAD, mọi hồ sơ còn cũ thuộc tập ghim
   phải có dòng trong `xu-ly.json` với cách xử khác `sua-thuoc`; và lưới `--base origin/onehub` như CI chạy trên PR của
   vòng phải sạch.

### Các ca đã gọi tên (hàng F35, luật 24, bàn giao F26)

| Hồ sơ | Eval | Gốc đã biết |
|---|---|---|
| hop-thoai-giu-cho-dang-nhap | E11 | `--ca thiet-ke` lệch phạm vi §12; `--ca huy` dùng danh sách hộp viết tay, thừa 11 hộp |
| trang-don-vi-mot-bang | E12, E16, E14 | so merge-base với onehub, gãy khi chính nó gộp; E14 không khai paths |
| dieu-huong-khu-muc-tieu | E3 | `coNutHoiKara` grep cả thư mục |
| ve-sinh-do-san-onehub | E18, Ngoài-15 | bất biến lúc gộp; `so-tac-nhan.ts` dò mã bằng `indexOf` |
| so-do-quanh-muc-tieu | E14 | `ranh-gioi.mjs` buộc nhánh `feat/so-do-can-chinh-don-vi` |
| tac-nhan-glm-5-3-cham | E5 | `so-tac-nhan.ts --pham-vi` đếm mọi tệp đổi trên nhánh |
| tac-nhan-va | E9 | lỗi kit `resolveConfigKey` không bỏ thoát hai nháy đơn → `loi-kit` |
| chuyen-goi-dieu-phoi | E1 | ca phá `eval-mat-not-run` mong dòng evals.yaml, gặp dòng `dph_lich` của config (bàn giao F26) |
| va-lo-ro-vai-chi-okr | E7b | DA0c: thước «Việc của bạn» không tự đỏ khi câu ghim sai |
| khung-khong-con-dung-chu, lich-su-va-luu-tru-trang | — | K6a #411: ghim sau #389; PR #411 đóng khi vòng mở PR |
| thu-haiku-tro-ly-okr | E7 | ghim lại |

Ca nào trên onehub hôm nay đã xanh thì chỉ ghim, không sửa — lượt ghim trả lời câu đó, không phải trí nhớ.

## Lựa chọn và căn cứ

- **Dùng chính lưới trước-gộp làm định nghĩa «cũ»** — giu-tuoi và GUIDE §7.1 đã chọn vậy; một luật thứ hai sẽ lệch.
- **`--tung-ho-so`** thay vì làn thường — làn thường một đỏ thì không ai được ghim; với hàng trăm hồ sơ là không bao giờ
  xong.
- **Mỗi lô một PR gộp ngay, hồ sơ vòng một PR riêng** (Hỏi-2, chờ chủ kho) — lô để giữ khoá `ghim-lai` dưới trần và nhả
  cho dãy khác giữa các lô. Gộp từng lô thì hồ sơ đã ghim tươi trên `onehub` ngay, vòng khác chạm chúng không phải ghim
  lại, và sổ chạy ít va giữa các nhánh; cái giá là khoảng mười lượt gộp vk. Lối khác: một PR mang mọi lô — một lượt gộp,
  nhưng hai trăm hồ sơ nằm cũ trên `onehub` tới cuối vòng, và giu-tuoi ở bước 6 phải ghim lại phần bị gộp khác làm cũ.
- **Hồ sơ đỏ không chạm thư mục** — PR chạm `_acceptance/<slug>/` của một hồ sơ còn cũ bị lưới trước-gộp chặn (hồ sơ vào
  diff thì bị soi `verified_commit`); bằng chứng đỏ nằm trong tệp JSON của làn ở thư mục vòng.
- **Không ghim nhóm thiếu `paths`** (Hỏi-1) — ghim chúng tốn thêm ước 4 giờ máy và chúng cũ lại ngay ở gộp có mã kế
  tiếp. Khai `paths` cho chúng là sửa `evals.yaml` của hồ sơ đã ký — một hàng riêng.

## Đo gì

Ba thước máy của vòng (kiem-ke, lo, doi-chieu) và một thước cho nghi thức sửa thước (`rang/sua-thuoc.mjs`: mỗi dòng
`sua-thuoc` có commit chỉ chạm thước của hồ sơ đó, có lượt đối chứng dương và bản tiêm đỏ, có dòng sổ `fix`, lời AC không
đổi). Mỗi thước có cặp hai chiều trên cùng dữ liệu: vật lành xanh, vật phá đỏ với thông điệp ghim.

## Không làm

- Không sửa mã sản phẩm để làm xanh một hồ sơ đỏ.
- Không khai `paths` cho nhóm thiếu `paths` (trừ eval đang được sửa thước theo luật 23).
- Không viết tay dòng `repin`, `repin-do`, `nen-do` hay mục Re-pin — chỉ máy (repin-lane, giu-tuoi) viết.
- Không đổi lời AC hay `expected` của hồ sơ đã ký ngoài phần thước đã gãy.
