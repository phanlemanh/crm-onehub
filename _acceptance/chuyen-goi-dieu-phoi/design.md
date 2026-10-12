# Chuyển crm sang gói `dieu-phoi` của kit — thiết kế

Ngày 12/10/2026 · hạng T2 · nhánh `chore/chuyen-goi-dieu-phoi` · PR nháp, chỉ gộp khi đủ bốn điều kiện ở
`docs/plan/dot-r2/README.md`.

## Vì sao

Giai đoạn một (đợt `sau-14-10`) chạy bằng bộ điều phối crm tự viết trong `scripts/dieu-phoi/`. Kết quả đã chuyển sang kit
thành gói `dieu-phoi` (DP1–DP7 đã ký trên `main` của kit). Giai đoạn hai (đợt `r2`) chạy từ gói kit. Hai bản cùng đọc một
thư mục đợt thì ra cùng quyết định hai lần, nên trước khi mở `r2` crm phải bỏ hẳn bản của mình.

## Đã đo trước khi viết hợp đồng

Một worktree tạm ở `HEAD` (b9a3b160) gỡ bộ cũ và trỏ kiểm chéo sang kit `main`, một worktree tạm khác giữ nguyên; cùng
chạy mọi eval máy của 15 hồ sơ có `paths` hoặc lệnh chạm vùng này rồi so mã thoát.

- Gói kit có đủ 14 mô-đun `.mjs` của bộ cũ, mỗi mô-đun export đủ tên của bản cũ, **trừ đúng một**: `lich.mjs` không còn
  `PHIEN_XEP_CUOI`. Đó là luật F26 của crm («đơn `kiem-cheo` luôn xếp cuối»). Kit thay bằng `PHIEN_MANG_MOC`: đơn
  `kiem-cheo` có `moc` thì được xếp theo mốc đó. Mọi hàng của gói `r2` mang `moc`, nên đơn kiểm chéo **không** khai mốc thì
  rơi về mốc xa nhất `9999-12-31` và vẫn đứng sau mọi thợ — giữ hành vi F26 mà không sửa lõi kit.
- `kiemChuyen` của gói đọc gốc kho **chung** (`git rev-parse --git-common-dir`), nên chạy từ một worktree là đo checkout
  chính chứ không đo cây đang xét. Phép đo phải chạy trên một bản clone độc lập của `HEAD`. Cùng lý do cho `chan-doan`.
- `kiemChuyen` không thấy ba import tương đối `../dieu-phoi/…` của `scripts/kiem-cheo/` (nó tìm chuỗi
  `scripts/dieu-phoi/`), không thấy `test:dieu-phoi` ở `.githooks/pre-push` và `acceptance.yml`.
- Eval đỏ thật khi gỡ: mọi eval máy của `dieu-phoi-hai-tang`, `dieu-phoi-truoc-mo-dot` (trừ E5), `dieu-phoi-va-bien`;
  `kiem-cheo-chay-quang-lang/E1`; `kiem-cheo-sau-gop/E5`; `sua-paths-e5-soan-okr/E2`; `giam-phut-ci-nhap-t1/E5`, `E6`.
  Kiểm chéo nạp gói kit thì `kiem-cheo-sau-gop/E1, E3, E4` và `kiem-cheo-chay-quang-lang/E2, E3` vẫn xanh.
- Chuỗi kéo theo: ba eval của `giam-phut-acceptance` và một của `kiem-cheo-sau-gop` đang khai «thay bởi» trỏ vào chính
  các AC sắp mất eval sống; luật thay bởi của kit đòi AC được trỏ còn ít nhất một eval sống, nên con trỏ của chúng phải đổi
  sang hồ sơ này. Hai eval đo chính các con trỏ ấy (`giam-phut-ci-nhap-t1/E8`, `kiem-cheo-chay-quang-lang/E4`) và eval
  `giam-phut-ci-nhap-t1/E7` (bắt buộc lệnh `dpvb_cong` có trong tập rút ra) đỏ theo.

## Thay đổi

1. **Gỡ bộ cũ.** Xoá 33 tệp dưới `scripts/dieu-phoi/`; bỏ khoá `hooks` của `.claude/settings.json` (bốn khối: PreToolUse
   `Workflow|Bash`, PostToolUse `*`, Notification `idle_prompt|permission_prompt`, UserPromptSubmit), các khoá khác giữ
   nguyên; bỏ script `test:dieu-phoi` của `package.json`; bỏ `test:dieu-phoi` khỏi vòng `for task in …` của
   `.githooks/pre-push`; bỏ checker `test:dieu-phoi` của `.githooks/gate-shape.json`; bỏ bước `- run: bun run
   test:dieu-phoi` của job `luat-kho` trong `.github/workflows/acceptance.yml`.
2. **Nối kiểm chéo sang gói.** Mô-đun mới `scripts/kiem-cheo/goi-dieu-phoi.mjs` giải gói bằng
   `scripts/resolve-plugin.mjs --plugin dieu-phoi --require scripts/dot.mjs --require scripts/hook-nhip.mjs --require
   scripts/hinh-dang.mjs` (đường `resolve-plugin.mjs` suy từ vị trí của chính mô-đun, không từ gốc kho được đo). Biến
   `KIEM_CHEO_GOI_DIEU_PHOI` chỉ định gốc gói thì vẫn đi qua `--root`, nên vẫn bị kiểm đủ tệp. Không giải được → ném lỗi
   nêu đầu ra của `resolve-plugin` (có lệnh cài). `dem.mjs` nạp gói một lần đầu lượt; lỗi → tệp ngày
   `ket_qua: khong-chay-duoc`, lý do nêu gói và lệnh cài, gọi lệnh báo người, mốc đứng. `khoa.mjs` nhận `timDot` từ bên
   gọi (không còn import tĩnh), thôi nhận và thôi ghi `moc`. Bỏ `canMoc` của `moc.mjs`, khoá `moc.sauGio` của
   `cau-hinh.mjs` và ca kiểm của chúng — không còn ai dùng. `test/khoa.test.mjs` lấy `kiemDon` từ gói qua cùng mô-đun.
3. **Khoá `dieu_phoi.goi_dot`.** Thêm vào cuối `_acceptance/config.yaml` (luật 7: chỉ thêm dòng):

   ```yaml
   dieu_phoi:
     goi_dot: docs/plan/dot-{ten}
   ```

4. **Tài liệu sống.** `docs/plan/dot-r2/README.md` và `LUAT-rieng.md` thôi nhắc nguyên văn đường `scripts/dieu-phoi/`
   (LUAT-rieng được chép vào `LUAT.md` của đợt, và `kiemChuyen` quét tệp đó khi đợt chạy).
5. **Thay bởi.** Khai `status: not-run` + `superseded_by: chuyen-goi-dieu-phoi#AC-n` cho mỗi eval ở bảng dưới; đổi giá
   trị `superseded_by` cho bốn eval đã khai từ trước mà AC đích sắp mất eval sống. Không sửa dòng nào khác của hồ sơ đã ký.
6. **Không làm ở vòng này.** Cài bốn gói ở tag mới (việc của giám sát khi kit cắt bản; cài đổi `.claude/settings.json`
   nên kéo theo một lượt ghim lại hồ sơ này). Kiểm chéo giữ khoá máy `s4` khi không có đợt: gói chỉ cấp khoá máy qua bộ
   phát lịch của một đợt, chưa có lối cho người gọi ngoài đợt.

## Đo trước khi kit phát hành

Gói `dieu-phoi` chưa có trong bản phát hành nào (tag mới nhất `v2.26.0`), và vòng này không cài bản chưa phát hành. Mọi
phép đo của hồ sơ cần gói đi qua `rang/goi.mjs`, giải theo thứ tự:

1. biến `KIEM_CHEO_GOI_DIEU_PHOI` (gốc gói chỉ định, kiểm bằng `resolve-plugin.mjs --root`);
2. bản đã cài (`resolve-plugin.mjs --plugin dieu-phoi`);
3. tệp trỏ tạm `.acceptance-runs/chuyen-goi-dieu-phoi/goi-tam.json` (`{"kho": "<kho kit>", "ref": "origin/main"}`, nằm
   trong thư mục git bỏ qua, chỉ ở máy này): trích `dieu-phoi/` của ref đó bằng `git archive` vào thư mục tạm theo sha.

Dòng đầu mỗi phép đo in nguồn: `goi dieu-phoi: da cai <phiên bản>` hay `goi dieu-phoi: CHUA PHAT HANH kit <sha12>`. Sau
khi cài, bước 2 thắng bước 3 nên lượt ghim lại sau cài tự đo trên bản phát hành. Mã sản phẩm (`scripts/kiem-cheo/`) chỉ
biết bước 1 và 2.

## Phân lớp dòng của `kiemChuyen` (dùng cho AC-1)

Một dòng `<tệp>:<số>` là **lịch sử** khi thuộc một trong các lớp sau; mọi dòng khác là chỗ còn trỏ bản cũ.

| Lớp | Điều kiện |
|---|---|
| hồ sơ khác | `_acceptance/<slug>/<tệp>` với `<slug>` khác hồ sơ này và `<tệp>` khác `evals.yaml` |
| eval chết | dòng của `_acceptance/<slug>/evals.yaml` nằm trong khối eval khai `status: not-run` |
| executor chết | dòng `    <khoá>: …` của `_acceptance/config.yaml` mà không eval sống nào có `cmd: config:executors.<nhóm>.<khoá>` |
| kế hoạch cũ | `docs/superpowers/**` |
| đợt đã đóng | `docs/plan/dot-sau-14-10/**`, `docs/plan/phan-loai-do-kiem-cheo.md` (báo cáo hàng F25 của đợt `sau-14-10`) |
| tên việc trong lộ trình | `docs/plan/lo-trinh-*.json` và `LO-TRINH.html` (máy vẽ từ các tệp đó): tên mốc mô tả chính việc gỡ, không gọi bản cũ |
| hồ sơ này | `_acceptance/chuyen-goi-dieu-phoi/**` |
| eval sống được miễn | dòng của `_acceptance/<slug>/evals.yaml` nằm trong khối eval có id thuộc danh sách miễn dưới đây |

Danh sách miễn (rút 12/10 bằng cách quét mọi khối eval không khai `not-run` mà ngoài bảng thay bởi và còn nhắc đường cũ):

| Eval | Vì sao còn sống |
|---|---|
| dieu-phoi-hai-tang/E22 | `judgment` đọc README cũ; làn ghim lại không chạy eval ngoài làn máy (sổ quyết định, dòng 8) |
| dieu-phoi-truoc-mo-dot/E13 | `judgment`, cùng lý do |
| dieu-phoi-va-bien/E20 | `judgment`, cùng lý do |
| sua-paths-e5-soan-okr/E7 | `script` lấy `scripts/dieu-phoi/giu-nhip.mjs` làm tệp mẫu ngoài-paths rồi ghi thêm vào nó; ghi vào tệp vắng thì tạo tệp, nên phép đo vẫn có nghĩa. AC-10 chạy nó ở hai cây: đỏ thêm thì nó vào bảng thay bởi và rời danh sách này |

E1 so tập id của các khối sống mà `kiemChuyen` trả dòng với danh sách miễn: thừa hay thiếu đều đỏ.

Tệp `rang/` của hồ sơ khác là lịch sử theo lớp đầu: phép đo nào còn sống mà hỏng vì vòng này thì AC-10 bắt.

## Eval cũ thay bởi vòng này

| Eval cũ | AC mới | Đo gì / vì sao |
|---|---|---|
| dieu-phoi-hai-tang/E1 | AC-2 | bài `lich` — mô-đun nay ở gói |
| dieu-phoi-hai-tang/E2 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E3 | AC-2 | bài `lich` |
| dieu-phoi-hai-tang/E4 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E5 | AC-2 | bài `lich` |
| dieu-phoi-hai-tang/E6 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E7 | AC-2 | bài `suc-khoe` |
| dieu-phoi-hai-tang/E8 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E9 | AC-3 | bài hook chặn S4 |
| dieu-phoi-hai-tang/E10 | AC-3 | bài hook chặn S4 |
| dieu-phoi-hai-tang/E11 | AC-3 | hook thật trong `.claude/settings.json` |
| dieu-phoi-hai-tang/E12 | AC-3 | bài hook nhịp, chờ người |
| dieu-phoi-hai-tang/E13 | AC-2 | bài `yeu-cau` |
| dieu-phoi-hai-tang/E14 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E15 | AC-2 | bài `lich` |
| dieu-phoi-hai-tang/E16 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E17 | AC-2 | bài `bang` |
| dieu-phoi-hai-tang/E18 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E19 | AC-2 | bài `phat-lich` |
| dieu-phoi-hai-tang/E20 | AC-2 | bài `cli` |
| dieu-phoi-hai-tang/E21 | AC-7 | bản sao kho chạy bộ phát lịch thật |
| dieu-phoi-hai-tang/E23 | AC-2 | ranh giới mã của bộ cũ |
| dieu-phoi-hai-tang/E24 | AC-2 | `bun run test:dieu-phoi` |
| dieu-phoi-hai-tang/E25 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E26 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E27 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E28 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E29 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E30 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E31 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E32 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E33 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E34 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E35 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E36 | AC-2 | một nhịp của bản thật |
| dieu-phoi-hai-tang/E37 | AC-2 | một nhịp của bản thật |
| dieu-phoi-hai-tang/E38 | AC-3 | chờ người với Notification thật |
| dieu-phoi-hai-tang/E39 | AC-7 | lệnh Monitor từ bộ phát lịch đang sống |
| dieu-phoi-hai-tang/E40 | AC-2 | bài `bien` |
| dieu-phoi-hai-tang/E41 | AC-2 | bài `bien` |
| dieu-phoi-hai-tang/E42 | AC-2 | bài `bien` |
| dieu-phoi-hai-tang/E43 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E44 | AC-2 | đột biến bộ cũ |
| dieu-phoi-hai-tang/E45 | AC-2 | đột biến bộ cũ |
| dieu-phoi-truoc-mo-dot/E1 | AC-2 | bài `tra-loi` |
| dieu-phoi-truoc-mo-dot/E2 | AC-2 | bài `tra-loi` |
| dieu-phoi-truoc-mo-dot/E3 | AC-2 | bài `tra-loi` |
| dieu-phoi-truoc-mo-dot/E4 | AC-3 | bài hook chặn S4 |
| dieu-phoi-truoc-mo-dot/E6 | AC-2 | `bun run test:dieu-phoi` |
| dieu-phoi-truoc-mo-dot/E7 | AC-2 | đột biến bộ cũ |
| dieu-phoi-truoc-mo-dot/E8 | AC-2 | đột biến bộ cũ |
| dieu-phoi-truoc-mo-dot/E9 | AC-4 | `pre-push` chạy `test:dieu-phoi` không đổi kho |
| dieu-phoi-truoc-mo-dot/E10 | AC-4 | `test:dieu-phoi` trong bốn chỗ của cổng |
| dieu-phoi-truoc-mo-dot/E11 | AC-2 | ranh giới mã của bộ cũ |
| dieu-phoi-truoc-mo-dot/E12 | AC-2 | đột biến bộ cũ |
| dieu-phoi-truoc-mo-dot/E14 | AC-2 | README của bộ cũ |
| dieu-phoi-va-bien/E1 | AC-3 | bài hook chặn S4 |
| dieu-phoi-va-bien/E2 | AC-3 | bài hook chặn S4 |
| dieu-phoi-va-bien/E3 | AC-2 | bài `hinh-dang` |
| dieu-phoi-va-bien/E4 | AC-2 | bài `hinh-dang` |
| dieu-phoi-va-bien/E5 | AC-2 | bài `hinh-dang` |
| dieu-phoi-va-bien/E6 | AC-3 | bài hook chặn S4 |
| dieu-phoi-va-bien/E7 | AC-3 | bài hook chờ người |
| dieu-phoi-va-bien/E8 | AC-4 | `test:dieu-phoi` nối cổng |
| dieu-phoi-va-bien/E9 | AC-4 | checker `node-test` đọc log `test:dieu-phoi` |
| dieu-phoi-va-bien/E10 | AC-2 | bài `giu-nhip` |
| dieu-phoi-va-bien/E11 | AC-2 | bài `giu-nhip` |
| dieu-phoi-va-bien/E12 | AC-3 | bài hook chặn S4 |
| dieu-phoi-va-bien/E13 | AC-2 | bài `gia-han` |
| dieu-phoi-va-bien/E14 | AC-2 | bài `gia-han` |
| dieu-phoi-va-bien/E15 | AC-2 | bài `gia-han` |
| dieu-phoi-va-bien/E16 | AC-2 | ranh giới mã của bộ cũ |
| dieu-phoi-va-bien/E17 | AC-2 | đột biến bộ cũ |
| dieu-phoi-va-bien/E18 | AC-2 | `bun run test:dieu-phoi` |
| dieu-phoi-va-bien/E19 | AC-2 | đột biến bộ cũ |
| dieu-phoi-va-bien/E21 | AC-3 | phân loại S4 trên tệp workflow thật |
| dieu-phoi-va-bien/E22 | AC-4 | `pre-push` chạy `test:dieu-phoi` không đổi kho |
| kiem-cheo-chay-quang-lang/E1 | AC-5 | kiểm chéo xếp sau thợ — nay dưới lịch của gói |
| kiem-cheo-chay-quang-lang/E4 | AC-9 | con trỏ của `kiem-cheo-sau-gop/E2` |
| kiem-cheo-sau-gop/E2 | AC-5 | đổi con trỏ: AC-1 của `kiem-cheo-chay-quang-lang` mất eval sống |
| kiem-cheo-sau-gop/E5 | AC-7 | lượt thật trên bản sao kho |
| sua-paths-e5-soan-okr/E2 | AC-1 | tệp mẫu ngoài-paths `scripts/dieu-phoi/giu-nhip.mjs` bị gỡ |
| giam-phut-ci-nhap-t1/E5 | AC-4 | job `luat-kho` khác bản ghim vì mất bước `test:dieu-phoi` |
| giam-phut-ci-nhap-t1/E6 | AC-4 | «không mất lệnh CI nào» — mất đúng `bun run test:dieu-phoi` |
| giam-phut-ci-nhap-t1/E7 | AC-10 | tập lệnh rút ra phải có `dpvb_cong` |
| giam-phut-ci-nhap-t1/E8 | AC-9 | con trỏ của `giam-phut-acceptance` |
| giam-phut-acceptance/E1 | AC-4 | đổi con trỏ: AC-5 của `giam-phut-ci-nhap-t1` mất eval sống |
| giam-phut-acceptance/E2 | AC-4 | đổi con trỏ: AC-6 của `giam-phut-ci-nhap-t1` mất eval sống |
| giam-phut-acceptance/E3 | AC-10 | đổi con trỏ: AC-7 của `giam-phut-ci-nhap-t1` mất eval sống |

Hành vi đo bởi các eval AC-2 nay do kit đo ở hồ sơ DP1–DP7 của chính kit. Ở crm, điều còn lại để đo là: mô-đun và tên
export của bộ cũ đều có trong gói (chuyển, không mất), chỉ trừ ngoại lệ đã khai.

`sua-paths-e5-soan-okr/E2` đo bộ lọc `paths` của kit (`staleByPaths`) trên bốn tệp, một trong số đó là tệp bị gỡ. Ba tệp
còn lại không ai đo lại ở crm; bộ lọc là của kit và kit đo nó. Ghi ở sổ quyết định.

Ba eval `judgment` (`dieu-phoi-hai-tang/E22`, `dieu-phoi-truoc-mo-dot/E13`, `dieu-phoi-va-bien/E20`) đọc tệp của bộ cũ.
Làn ghim lại không chạy eval ngoài làn máy; chúng hiện ở khoá `evals_not_machine_touched` của lượt ghim, không khai thêm.

## Ghim lại sau chữ ký

Luật thay bởi đòi hồ sơ thay đã có chữ ký người, nên các hồ sơ cũ ghim lại ở đỉnh nhánh **sau** Cổng Bằng chứng, một lượt
làn cho mọi slug: mọi hồ sơ ở bảng trên, cộng mọi hồ sơ có `paths` khớp tệp vòng này đổi (rút bằng lệnh ở AC-10). Trước khi
kit phát hành, lượt ấy chạy với `KIEM_CHEO_GOI_DIEU_PHOI` trỏ bản trích từ kit `main`; sau khi cài, giám sát ghim lại một
lần nữa trên bản phát hành.
