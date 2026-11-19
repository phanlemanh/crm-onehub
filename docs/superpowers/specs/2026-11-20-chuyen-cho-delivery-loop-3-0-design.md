# crm chuyển sang chợ delivery-loop v3.0.0 — thiết kế

Hồ sơ `_acceptance/chuyen-cho-delivery-loop-3-0/`. Chặng II.2 của «chuyển nhà giai đoạn 2» (kế hoạch chủ kho duyệt
19/11, `delivery-loop/migration/KE-HOACH-GIAI-DOAN-2.md` mục 4; chủ kho «Mở crm» 20/11). Một vòng, một PR, mốc cài
`v3.0.0` (commit `c16d25db`), không ghép đổi hành vi. Kho trước đã chuyển: Inventory, Quỹ hàng (PR #247, gộp `f7218b5f`).

## 1. crm khác Quỹ hàng ở phía CI

Quỹ hàng kéo kit lúc chạy CI. crm thì không: job `gate` chạy **bản chép** của kit ngay trong kho — «lớp CI chép»
theo khối `INIT-CI-COPY-LIST` của `commands/acceptance-init.md`, lần chép cuối là 2.37.0 (`6479d42c4`). Chỉ một
workflow kéo kit lúc chạy: `tin-hieu-gom.yml` (gom tín hiệu hằng ngày, `KIT_REF v2.36.0`).

Đo 20/11 trên `74a29a68`: 38 tệp của danh sách 3.0.0 — 13 khớp từng byte, 20 khác, 5 chưa có. Mọi tệp hiện có khớp
từng byte bản 2.37.0, nên phần khác là đúng phần kit đổi từ 2.37.0 tới 3.0.0. Phần lớn là chú thích (đường tài liệu
thành liên kết tới kho kit cũ ghim commit); phần có tác dụng:

| Tệp | Đổi |
|---|---|
| `lib/chan-lo-trinh.cjs`, `scripts/pre-merge-check.sh` | dò plugin lộ trình bằng `roadmap@` thay `road-map@`, tên tra qua bảng `lib/ho-goi.cjs` (mới) |
| `scripts/tin-hieu.mjs` | nạp bốn tệp dùng chung từ `scripts/hop-thu/` (mới) thay `../dieu-phoi/scripts/`; skill gom tìm theo khối nó mang qua `scripts/tim-skill.cjs` (mới) |
| `scripts/co-hop-dong.cjs` | skill cắt lượt tìm qua `tim-skill.cjs`, đường dự phòng `skills/scope-slice/` |
| `scripts/lo-trinh.mjs`, `skills/acceptance/references/tri-thuc-template.md` | chuỗi tên lệnh mới (`/roadmap:undo`, `/knowledge:ingest`…) |
| `scripts/pre-merge-check.sh` | luật 2.38 «code `t3_paths` phải có hồ sơ thật sự bị chấm» (T3-CAN-HO-SO-GUARD) |
| `scripts/recheck-evidence.cjs` | ứng viên thứ tư khi giải `verifier:` — gốc gói lõi trong `.claude-plugin/marketplace.json`; kho không có tệp ấy đi đúng đường cũ |

**Vì sao phải chép lại cùng lượt với settings:** bản 2.37 của `chan-lo-trinh.cjs` coi kho «bật lộ trình» khi
`.claude/settings.json` có khoá `road-map@…` bật. Đổi settings sang `roadmap@delivery-loop` mà giữ lớp chép cũ thì
luật chặn lộ trình tự tắt, không báo gì. crm hôm nay không khai `lo_trinh.chan` nên luật không chạy ở đây, nhưng lớp
chép phải đi đúng bản với settings: chép lại từ 3.0.0 trong cùng PR.

**Một luật mới đi cùng lớp chép:** `pre-merge-check.sh` 3.0 mang luật của kit 2.38 «code `t3_paths` phải đi cùng hồ sơ
thật sự bị chấm» (T3-CAN-HO-SO-GUARD): PR chạm `t3_paths` mà hồ sơ trong PR không khai hạng trong `required_for`, hay
hạng dưới T3 mà chưa có chữ ký người, bị chặn. Bản 2.37 chỉ đòi PR có tệp dưới `_acceptance/`. Luật xét theo diff của
PR, nên không đổi phán quyết của hồ sơ đã ký nào (đo dưới); nó chỉ siết PR sau chạm đường T3. Đây là thay đổi của chính
mốc 3.0, không phải thứ vòng này thêm; tách nó ra thì phải giữ một bản chép vá riêng (Hỏi-3).

**0 phán quyết đổi — đo trước:** `pre-merge-check.sh . --recheck-all --base origin/onehub` trên `74a29a68` bằng ba bản
lớp chép — 2.37 đang dùng, 2.39.0, 3.0.0: cả ba 366 hồ sơ OK, 0 VIOLATION, đầu ra giống nhau từng byte (147 giây mỗi
lượt). AC-7 đo lại điều này trên merge-base và trên HEAD.

`dieu-phoi/scripts/{hinh-dang,cau-hinh,dot}.mjs` ở gốc kho là bản chép cho `tin-hieu.mjs` cũ. Bản 3.0 nạp
`scripts/hop-thu/`, nên ba tệp ấy thành mồ côi: gỡ, và đổi ba dòng của chúng trong `risk_tiers.t1_skip_globs` thành
năm đích mới (`lib/ho-goi.cjs`, `scripts/tim-skill.cjs`, `scripts/hop-thu/{hinh-dang,cau-hinh,dot}.mjs`). Dòng
`dieu-phoi/scripts/**` trong `ignorePatterns` của `.oxlintrc.json` thôi trỏ gì — gỡ cùng.

`scripts/resolve-plugin.mjs` là bản chép của bộ giải plugin trong `feature-loop`; bản 3.0.0 chỉ khác dòng lệnh cài
gợi ý (`@delivery-loop`). Chép lại.

## 2. Danh sách tệp đổi (viết trước — AC-9 đo theo nó)

1. **Phía CI**
   - 38 đích của `INIT-CI-COPY-LIST` 3.0.0 (25 tệp chạm: 20 sửa, 5 thêm); `scripts/resolve-plugin.mjs`;
     gỡ `dieu-phoi/scripts/*` (3 tệp); `.oxlintrc.json` (một dòng).
   - `_acceptance/config.yaml`: `t1_skip_globs` (thay 3 dòng bằng 5), và khoá executor mới của hồ sơ này (`cc30_*`).
   - `.github/workflows/tin-hieu-gom.yml`: bản vá `--soan` (K3) — `KIT_REF v3.0.0`, clone `phanlemanh/delivery-loop`
     (kho công khai), `claude plugin install acceptance-gate@delivery-loop`.
   - `scripts/tin-hieu/gom-cau-hinh.ts`: bộ giải kit đòi `skills/signal-intake/SKILL.md` thay `skills/gom-tin-hieu/…`;
     hai skill phiên gom được gọi là `acceptance-gate:signal-intake`, `acceptance-gate:scope-slice`, ở danh sách quyền
     và lời dặn. Không sửa thì job gom hằng ngày chết ngay bước giải kit: kit 3.0 không có thư mục skill tên cũ.
     Bài kiểm theo cùng: `scripts/tin-hieu/test/gom-gia-co.test.ts`, `gom-lich.test.ts`.
   - `docs/setup.md` mục TIN_HIEU_TOKEN: kho kit nay là `phanlemanh/delivery-loop`.
2. **Phía phiên** — `.claude/settings.json` theo bản vá `--soan` (K1): chợ `delivery-loop` (github
   `phanlemanh/delivery-loop`, `ref: v3.0.0`), sáu plugin `acceptance-gate`, `feature-loop`, `diagram-design`,
   `dispatch`, `roadmap`, `knowledge` `@delivery-loop` bật.
3. **Sáu dòng tắt** — cùng tệp (K2): sáu khoá `<tên cũ>@acceptance-gate-kit` = `false`.
4. **Tên lệnh cũ trong tệp sống** (K4, K5 — 2 + 40 chỗ):
   - 9 chỗ trong `scripts/lo-trinh.mjs` và `tri-thuc-template.md`: hết khi chép lại lớp CI.
   - 8 chỗ ở gói đợt đã đóng `docs/plan/dot-*/README.md` (`/dieu-phoi:mo-dot` → `/dispatch:open`, một chỗ
     `/acceptance-gate:cat-luot` → `/acceptance-gate:scope-slice`): lệnh tên cũ không còn chạy được (kit 3.0 không có bí
     danh), nên câu «mở lại bằng …» phải mang tên mới.
   - 8 chỗ ở `scripts/tin-hieu/` (mục 1) — có tác dụng, không chỉ chữ.
   - `scripts/kiem-cheo/cau-hinh.mjs` (K4): kiểm chéo đêm giải gói `dispatch` thay `dieu-phoi`, lệnh cài gợi ý
     `claude plugin install dispatch@delivery-loop --scope project`; `scripts/kiem-cheo/test/dem.test.mjs` theo cùng. Ba
     tệp nó nạp (`scripts/dot.mjs`, `hook-nhip.mjs`, `hinh-dang.mjs`) và ba hàm (`timThuMucDot`, `chamNhip`, `kiemDon`)
     có ở `plugins/dispatch/scripts/` của 3.0.0. Không sửa thì đêm nào nó cũng dùng `dieu-phoi` trong cache chợ cũ.
   - 14 chỗ ở `apps/agent/test/mau/lo-trinh-kit.html` — Hỏi-1.
   - `CLAUDE.md` dòng «Lỗi của bộ kit … mở chip riêng sang `~/dev/acceptance-gate-kit`» — Hỏi-2.
5. **Ghim lại.** Lưới trước-gộp chỉ xét lại hồ sơ có tệp trong diff — ô `gate` trên bản sửa chặn đúng một hồ sơ, của
   chính vòng. Vậy «hồ sơ cần ghim» là hồ sơ mà vòng làm đỏ một eval của nó. Ứng viên: mọi eval máy của hồ sơ đã ký mà
   `paths` khớp một tệp PR đổi (`rang/ung-vien.mjs`; 157 eval ở 63 hồ sơ trên bản sửa). 27 eval chỉ khớp vì tệp mẫu
   `lo-trinh-kit.html` (glob `apps/agent/**`) được thay bằng ba bài kiểm thật sự đọc tệp ấy — tệp mẫu không vào mã nào
   khác. Chạy khô trên tip (`rang/chay-kho.mjs`), chạy lại eval đỏ trên nhánh chính và trên bản sau gộp giả (bản sao của
   tip có nhánh chính trỏ về tip), rồi xếp lớp (`rang/phan-loai.mjs` → `evidence/phan-loai-ghim.json`):
   - «đỏ cả hai bên» — đỏ sẵn trên nền, để nguyên, liệt tên;
   - «đo diff của nhánh» — thước so diff của PR đang mở với nhánh chính, xanh trên bản sau gộp giả;
   - «đỏ vì vòng» — ghim lại bằng làn máy `repin-lane.mjs` của feature-loop 3.0.0 tại tip (`run-log.jsonl`,
     `evidence-report.md`), hoặc khai `gioi-han` khi hồ sơ không ghim được (Hỏi-4).

   Đo 20/11: 157 ứng viên, 50 đỏ trên tip `29fa0598`. 35 đỏ cả trên nhánh chính (ví dụ `o-cam-chay-duoc-that` trỏ cứng
   cache `feature-loop/2.8.0`; các thước móc `pre-push` đọc «không chạy gì» vì `74a29a68` đã xanh ở CI). 14 xanh trên
   bản sau gộp giả `183ae167` (kho trần cục bộ làm `origin`, `onehub` = commit gộp): 7 thước đo diff của nhánh, 6 eval
   chỉ vướng `lint:slop` của chính hồ sơ này (đã sửa), `luot-kho` vướng chạy song song. 1 đỏ vì vòng:
   `chuyen-goi-dieu-phoi/E6`. Tập ghim: rỗng.

Ngoài danh sách: hồ sơ này, `PRODUCT-MAP.md`, `LO-TRINH.html` (vẽ lại). Không tệp mã sản phẩm nào dưới `apps/`,
`packages/` đổi, trừ tệp mẫu của Hỏi-1.

## 3. Không đổi

- Dữ liệu sản phẩm nhắc `phanlemanh/acceptance-gate-kit` làm **ví dụ kho** của trang lộ trình nhiều sản phẩm
  (`apps/app/lib/messages/san-pham.ts`, proto, bài kiểm) — đó là dữ liệu mẫu, không phải chỗ kéo kit.
- `docs/superpowers/**`, `docs/findings/**`, `docs/plan/don-dep-3110.md`, hồ sơ đã ký: sổ kể lại.
- Mọi khoá, luật mới của kit 3.0 chưa bật ở kho này vẫn không bật.
- `CLAUDE.md` dòng 28 (`acceptance-gate-kit#301`) là liên kết tới vấn đề cũ, giữ.

## 4. Câu chỉ người trả lời

- **Hỏi-1 — tệp mẫu `apps/agent/test/mau/lo-trinh-kit.html`.** Đây là bản chép trang lộ trình của kho kit lúc viết bài
  kiểm `lo-trinh-nhieu-san-pham` (20/10), có 14 tên lệnh cũ trong chữ hàng và khối dữ liệu. Khuyên: thay đúng 14 tên
  theo bảng tên, không đổi gì khác (bài kiểm đọc khuôn trang, không đọc tên lệnh) — công cụ kiểm chuyển kho ra
  `KẾT: ĐẠT`; giá: hồ sơ đọc tệp này phải ghim lại. Lối khác: giữ nguyên làm mẫu lịch sử — K5 còn 14 chỗ, nhánh chính
  không ra `KẾT: ĐẠT` tới khi công cụ có luật loại trừ cho tệp mẫu.
- **Hỏi-2 — `CLAUDE.md`, dòng chỉ đường báo lỗi kit.** Kho kit cũ đóng băng ở `v2.39.0`, nên «mở chip riêng sang
  `~/dev/acceptance-gate-kit`» chỉ phiên sau tới kho không ai sửa. Khuyên: đổi đúng chữ ấy thành `~/dev/delivery-loop`
  trong PR này (T1). Lối khác: để phiên giữ đợt đổi ở II.4 — tới đó phiên ở crm vẫn báo lỗi kit nhầm kho.

- **Hỏi-3 — luật chặn T3 của kit 2.38 vào kho cùng lớp chép 3.0.** Khuyên: nhận theo mốc `v3.0.0` — Inventory và Quỹ
  hàng đã chạy lưới 3.0 có luật này; 366 hồ sơ đã ký không đổi phán quyết. Lối khác: giữ `pre-merge-check.sh` bản không
  có luật — giá: bản chép vá riêng, lệch kit từ ngày đầu, trái luật «phí bản rẽ» của `CLAUDE.md`.
- **Hỏi-4 — `chuyen-goi-dieu-phoi/E6` đỏ vì vòng.** Thước `goi-vang.mjs` viết cứng gói `dieu-phoi` và lệnh cài cũ ở
  bốn chỗ; sau vòng, kiểm chéo đêm giải `dispatch` và nêu lệnh cài mới, nên thước đỏ dù hành vi đúng. Hồ sơ ấy không ghim
  được: E1 (`kiem-chuyen`) và E10 (`khong-do-them`) đã đỏ trên nhánh chính. Khuyên: để nguyên, khai `gioi-han` ở hợp đồng
  và Known limits; hồ sơ ấy đỏ trên kiểm chéo đêm như trước, không thêm hồ sơ đỏ mới. Lối khác: vòng sửa cả ba thước
  (E1, E6, E10) cho gói `dispatch` rồi ghim lại — giá: mở rộng phạm vi sang hồ sơ khác, thêm một lượt S4 cho hồ sơ ấy,
  và chạm thước đã ký trái luật tạm 18/10.

## 5. Đo trước Cổng Phạm vi (20/11)

Ghi đủ trong thẻ Cổng Phạm vi: công cụ kiểm chuyển kho (`KẾT: CHƯA (5 điểm)` trên cây chưa sửa), bản vá `--soan`
(áp sạch), ô `gate` trên bản sửa, đối chứng ba bản lớp chép trên 366 hồ sơ, bộ kiểm của kho trên cây chưa sửa, làn ghim
lại khô trên bản sửa với đối chứng nhánh chính.
