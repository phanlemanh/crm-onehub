# Nâng bậc design-floor cho crm: đường đi, điều kiện, và bậc nào đáng bật

Nghiên cứu ngày 31/10/2026, chỉ đọc. Nền: `origin/onehub` ở `aeb8b8152` (sau #531), kit acceptance-gate 2.36.0 cài
ở `~/.claude/plugins/cache/acceptance-gate-kit/acceptance-gate/2.36.0` (dưới đây gọi `<kit>`). Kho kit đọc ở
`origin/main` = `c8870a49`. Không sửa `_acceptance/config.yaml`, không chạy S4, không chạy `bun test`. Mọi phép thử bậc
chạy trong một bản `git clone --shared` ở scratchpad, với một bản sao kit có vá một dòng (mục 3.1).

Chủ kho giao (qua giám sát Mac Studio): «mở phiên nghiên cứu đưa CRM mở design-floor lên các mức cao hơn để tối ưu
hoạt động hiệu quả với kit và xem đâu là điều kiện cần giải quyết».

## Kết luận

1. **Hôm nay crm không lên được bậc nào, dù khai gì.** Kit 2.36.0 có hai lỗi chặn cứng với kho cỡ crm. Thứ nhất, bộ
   đọc bậc đọc `git ls-files` không đặt `maxBuffer`: crm có 18 463 tệp (1 057 605 byte), vượt 1 MiB, lỗi bị nuốt, nên
   bậc luôn là M0 kèm lý do sai «không khớp tệp nào». Thứ hai, S3 và S4 của design-floor chỉ dò nhánh `main` hay
   `master`: ở crm (nhánh chính `onehub`) cả hai thoát 1 ở mọi vòng giao diện. Cả hai phải gửi kit sửa.
2. **M1 rẻ nhưng gần như không bắt được gì ở crm.** Với glob `*.tsx` đề xuất, 0 trên 137 vòng giao diện từ 01/10 bị
   hex thô chặn, và không vòng nào thêm một mã hex mới. Chi phí thật của M1 nằm chỗ khác. Lưới tier-mismatch sẽ DỪNG
   49 trên 49 vòng giao diện từ 17/10 nếu đọc đúng chữ của kit, và S1 nạp khoảng 9,4–10,3 nghìn token tri thức chung
   mỗi vòng. M2 và M3 không thêm gì cho `.tsx` ở S4.
3. **Lỗi UX cũ của crm nằm ở tầng khung và hành vi, không ở token.** Nợ hex trong app chỉ là 11 chỗ ở 6 tệp trang giới
   thiệu. Các dấu hiệu vẽ tay của `docs/design.md` thì có ở khoảng 60 tệp. Vì vậy đợt dọn dẹp nên làm ba việc rẻ (mục 5),
   gửi kit năm lỗi, và để bản đồ khuôn (BK1–BK3) gánh lớp lỗi thật. Chưa nên bật M1 trước khi kit sửa hai lỗi chặn và
   định nghĩa lại «eval design» của lưới. M2 và M3 chưa đáng làm.

## 1. Hiện trạng đo được

| Đo | Kết quả | Lệnh hay nguồn |
| --- | --- | --- |
| Bậc hiện tại | M0: `_acceptance/config.yaml` không có khối `design:` hay `design_floor:` ở mức gốc | `grep -n -E "^(design\|design_floor):" _acceptance/config.yaml` → không dòng nào |
| Làn design (CT1) | **Đã bật** từ trước: `executors.design.gate` và `executors.design.ui_check` có ở `_acceptance/config.yaml:3687-3689` | `<kit>/feature-loop/skills/feature-loop/SKILL.md:190` (điều kiện CT1 là có `executors.design.*`) |
| Kiểu eval trong 376 hồ sơ | `test` 2 650 · `script` 1 319 · `ui-check` 359 · `judgment` 153 · `design` 0 | `grep -h -o "executor: *[a-z-]*" _acceptance/*/evals.yaml \| sort \| uniq -c` |
| Eval gọi `config:executors.design.*` | 23 chỗ ở 20 hồ sơ (22 `ui_check`, 1 `gate`) | `grep -h -o "config:executors.design[.a-z_]*" _acceptance/*/evals.yaml` |
| Khoá `*_san_thiet_ke` (gọi `design-gate --mode static`) | 77 khoá, 0 khoá có `--require-measured` | `grep -c "_san_thiet_ke:"` và `grep -c "require-measured"` trên config |
| `design-gate --mode static` trên một `.tsx` có hex thật (`apps/app/components/landing/ask-card.tsx`) | không cờ: thoát **0**; có `--require-measured`: thoát **5** `KHONG-DO-DUOC` | chạy tay ngày 31/10 |

Hàng cuối nghĩa là 77 khoá thiết kế tĩnh của crm đang **xanh rỗng** trên `.tsx`: chúng không đo gì mà vẫn báo đạt.
Kit đã ghi điều này (`<kit>/CHANGELOG.md:450-451`, đếm 61 khoá ở bản 2.35.0).

## 2. Đường M0 → M1 → M2 → M3

Luật bậc ở `<kit>/scripts/design-floor-bac.mjs:5-9`. Luật chặn ở `<kit>/scripts/design-floor-s4.mjs:10-11` và `GUIDE.md:947-949`.

| Bậc | Khoá phải khai | Giá trị đề xuất cho crm |
| --- | --- | --- |
| M1 | `design.surface_globs` khớp ít nhất một tệp có theo dõi; nên khai thêm `executors.design.floor` | xem khối dưới |
| M2 | thêm `design_floor.tokens` **và** `design_floor.registry`, cả hai tệp phải có thật | chưa đề xuất (mục 3.6) |
| M3 | thêm `design_floor.niem_phong`, chỉ người ghi | không đề xuất |

Khối M1 đề xuất (chưa khai, chờ chủ kho và chờ kit, mục 5):

```yaml
design:
  surface_globs:
    - "apps/app/app/**/*.tsx"
    - "apps/app/components/**/*.tsx"
    - "packages/ui/src/**/*.tsx"
executors:
  design:
    floor: "node ${CLAUDE_PLUGIN_ROOT:-$(node scripts/resolve-plugin.mjs --plugin acceptance-gate --require scripts/design-floor-s4.mjs)}/scripts/design-floor-s4.mjs --root . --base origin/onehub"
```

Ba glob này khớp 843 tệp (`git ls-files` cùng ba mẫu). Lý do chọn như vậy:

- **Chỉ `.tsx`, không `.css`.** Hai tệp CSS của `packages/ui/src` đều là tệp token: `styles/globals.css` (13 chỗ hex) và
  `styles/geist.css` (82 chỗ). Kit chỉ loại được **một** tệp `design_floor.tokens` (`design-floor-s4.mjs:75,80`), nên
  thêm `**/*.css` là chặn mọi vòng chạm `geist.css`. Đã thử: một vòng giả thêm ba dòng không màu vào `chart.tsx`,
  `built-with.tsx`, `geist.css` thoát 2 với 88 dòng báo, và không dòng nào nằm trên dòng vừa thêm.
- **Không `**`, không `.json`.** Thư mục `apps/app/app/proto/_modules/` chứa dữ liệu mẫu JSON có số issue như `#373`,
  `#140`. Regex đọc chúng là hex 3 chữ số, nên glob rộng (`apps/app/app/**`) sẽ chặn oan 3 vòng từ 01/10.
- **Không có loại trừ.** Bộ khớp glob của kit không có phủ định (`<kit>/lib/evidence-core.cjs:385-396`), nên chỉ liệt
  kê dương được. Liệt kê từng thư mục để né `brand-logos/` thì gặp đúng chỗ vấp BH2 của invest (thư mục mới rơi khỏi
  vùng). Đề xuất để `brand-logos/` và `chart.tsx` trong vùng, vì từ 01/09 cả hai bị chạm 0 lần trên 680 commit
  first-parent.
- **`--base origin/onehub` bắt buộc.** Thiếu nó, lệnh thoát 1 (mục 3.2).

### Mỗi vòng giao diện đổi ra sao khi bật M1 (sau khi kit sửa mục 3.1–3.2)

| Bước | Thêm gì | Ai bị chặn, khi nào | Tốn thêm |
| --- | --- | --- | --- |
| S0 | một dòng `design-floor: bậc M1 — …`, thêm một dòng cảnh báo nếu chưa khai `floor` | không ai | ~0 |
| S1 (0d) | ghi `design-floor.json` và nối một dòng `usage-report.md`; nạp chỉ mục cùng tối đa hai tệp tri thức Design OS | không chặn | **5 310 token chỉ mục + 3 600–4 600 token hai tệp**, đo trên 4 hồ sơ gần nhất: `cap-nhat-trong-ngan-kr` 9 881, `bo-okr-chi-don-vi` 9 415, `che-do-soan-bo-okr` 9 415, `hop-tuan-tren-bang` 10 313 |
| S3 (2b) | autofix `.html` (crm không có), chạy `sinh_lai` (crm không khai) | **hôm nay chặn mọi vòng**: thoát 1 vì không có `main` (mục 3.2) | ~0,1 s khi đã sửa |
| S4 chuẩn bị args | lưới tier-mismatch | **DỪNG và hỏi người** khi diff chạm glob mà không có «eval design» (mục 3.3) | một lượt gọi người mỗi vòng |
| S4 chấm | eval `script` `cmd: config:executors.design.floor` | chặn (thoát 2) khi một tệp vòng chạm **chứa** hex ở bất kỳ dòng nào | ~0,1 s |

Ở M2, S4 không thêm gì cho `.tsx`: độ phủ token chỉ chạy trên `.html` và `.htm` (`design-floor-s4.mjs:28,89-104`), và
crm không có trang `.html` nào là giao diện. Thứ M2 thêm thật là `reuse-plan check` ở S1, và chỉ khi hồ sơ có
`reuse-plan.md` (`<kit>/scripts/design-floor-s1.mjs`, nhánh `reuse_plan`). M3 chỉ biến cảnh báo độ phủ token thành chặn,
nghĩa là vẫn chỉ cho `.html`. Với crm, M3 bằng M2.

## 3. Điều kiện phải giải trước từng bậc

### 3.1 Kit: bộ đọc bậc tràn bộ đệm, kho lớn kẹt ở M0 (chặn cứng mọi bậc)

`<kit>/scripts/design-floor-bac.mjs:38` gọi `execFileSync('git', ['ls-files'], …)` mà không đặt `maxBuffer`, nên trần
mặc định của Node là 1 MiB. Lỗi bị `catch` nuốt thành `dsTep = []` (dòng 39-41), rồi dòng 48 in «không khớp tệp nào».

- `git ls-files | wc -lc` ở crm: **18 463 tệp · 1 057 605 byte**.
- Gọi lại đúng cách kit gọi: `ENOBUFS`.
- Khai khối M1 ở trên trong bản clone: `design-floor-bac.mjs --json` trả `"bac":"M0","ly_do":"design.surface_globs
  không khớp tệp nào (…)"`. Thêm `maxBuffer: 64 * 1024 * 1024` vào bản sao kit thì in `bậc M1 — có giao diện (867 tệp
  khớp …)` (đo khi còn glob `.css`).

S1, S3 và S4 đều gọi `docBac`, nên cả ba im lặng như M0. Đây là lỗi im lặng đúng hình dạng: kho tưởng đã bật mà không
có gì chạy. crm không vá được phía mình.

### 3.2 Kit: S3 và S4 chỉ dò `main`/`master`

`timBase` (`design-floor-s4.mjs:42-51`) thử `origin/main`, `origin/master`, `main`, `master`, rồi ném lỗi. S3 dùng lại
nó. Khối lệnh trong SKILL không truyền `--base`: `SKILL.md:199` (S4) và `SKILL.md:405` (S3). Đo trong bản clone, sau khi
vá mục 3.1:

```
design-floor-s4.mjs --root .                → «không tìm được nhánh chính để so diff — truyền --base <ref>», thoát 1
design-floor-s3.mjs --root . --slug <s>     → cùng dòng, thoát 1
… cùng hai lệnh, thêm --base aeb8b8152      → thoát 0
```

crm vá được S4 bằng `--base origin/onehub` trong `executors.design.floor`. S3 thì không, vì khối là của kit. Theo
`SKILL.md:402`, thoát 1 nghĩa là «đọc dòng lỗi, sửa rồi chạy lại», nên mọi vòng giao diện sẽ kẹt ở S3. Trong khi đó
`s4-args.mjs:300-322` của chính kit đã đọc nhánh chính từ remote (`origin/HEAD` của crm là `refs/remotes/origin/onehub`).
Hai bộ dò của một kit trả hai đáp án khác nhau.

Không nên tạo một nhánh `main` cục bộ để lách. `merge-base` với một `main` cũ cho mốc so sai mà không báo gì.

### 3.3 Lưới tier-mismatch ở S4

Luật là văn xuôi cho tác tử đọc, không phải mã (`SKILL.md:203`). Có `design.surface_globs`, diff chạm glob, mà
`evals.yaml` «KHÔNG có eval design nào (static/fidelity)» thì DỪNG và hỏi người: nâng làn hay ghi `descope`.

Đo trên 130 merge first-parent của `onehub` từ 17/10, với ba glob `apps/app/app/**`, `apps/app/components/**`,
`packages/ui/src/**`. Có 74 merge mang hồ sơ, 49 trong số đó chạm giao diện.

| Cách tác tử hiểu «eval design» | Số vòng bị DỪNG |
| --- | --- |
| Đúng chữ: eval gọi `config:executors.design.*` | **49 / 49** |
| Tính cả khoá `script` gọi `design-gate.mjs` (`*_san_thiet_ke`) | 46 / 49 |
| Tính cả executor `ui-check` | 3 / 49 (`#589 ve-khung-muc-tieu-dung-kr`, `#560 bam-kr-mo-chi-tiet-kr`, `#469 ve-sinh-do-san-onehub`) |

Kết quả chuẩn của crm cho «eval design» là `ui-check`. Đó là executor của kit chấm trên bản đang chạy, nhưng lưới
không gọi tên nó. Hai câu kit chưa trả lời: eval `floor` (`script` có `cmd: config:executors.design.floor`, đúng cách
`SKILL.md:196` dặn) có được tính là eval design không, và `ui-check` có được tính không. Lưới chạy với mọi kho đã khai
`surface_globs`, tức là bật M1 kéo theo lưới. Khi luật còn là văn xuôi thì cùng một vòng có thể DỪNG hay đi tiếp tuỳ
phiên. Điều kiện trước M1: kit định nghĩa «eval design» bằng một danh sách máy đọc được, có cả `floor` và `ui-check`.

### 3.4 Hex thô: nợ thật và bắt nhầm

Chạy đúng `RE_HEX` của `design-floor-s4.mjs:27` (import từ tệp của kit) trên `git ls-files apps/app packages/ui`:
1 794 tệp, 455 chỗ khớp. Phân loại:

| Nhóm | Tệp · chỗ | Loại | Có trong glob đề xuất? |
| --- | --- | --- | --- |
| `apps/app/components/landing/*` (`text-[#5A5A5A]`, `bg-[#1A1A1A]`, `stroke="#4A4A4A"`…) | 6 · 11 | **nợ thật**: giá trị Tailwind tuỳ ý, trái `docs/design.md` «Do not introduce custom … colours» | có |
| `packages/ui/src/components/brand-logos/*` (Google, Microsoft, Slack, DocuSign, Claude, Stripe) | 6 · 17 | đúng chỗ: màu nhận diện của hãng khác không thể là token | có |
| `packages/ui/src/components/chart.tsx:67` (`[stroke='#ccc']`, `[stroke='#fff']`) | 1 · 5 | **bắt nhầm**: bộ chọn CSS khớp thuộc tính Recharts tự sinh, không phải màu đem dùng (mã shadcn gốc) | có |
| `packages/ui/src/styles/globals.css`, `geist.css` | 2 · 95 | tệp token | không (chỉ `.tsx`) |
| `apps/app/app/proto/_modules/**/du-lieu-*.json` (`#373`, `#140`) | 2 · 27 | **bắt nhầm**: số issue trong chữ | không |
| `test/fixtures/**` (HTML dán từ Google Docs, Word, `LO-TRINH.html`) | 7 · 289 | dữ liệu kiểm | không |
| `packages/ui/src/lib/logo-onehub.ts`, `scripts/logo-icons-config.ts`, `test/*.spec.ts`, `public/*.svg`, `site.webmanifest` | 7 · 11 | màu logo OneHub và bài kiểm của nó | không (`.ts`, `.svg`) |

Ngoài `components/landing`, `apps/app/app` và `apps/app/components` có 0 chỗ hex. Câu «`apps/app` có 0 tệp chứa hex
thô» của lần rà trước đúng với phần màn trong app, nhưng thiếu trang giới thiệu, `public/` và `proto`. Không thấy bắt
nhầm kiểu chú thích (K3), vì crm cấm chú thích. Cũng không thấy `href="#…"` hay tệp nhị phân trong vùng `.tsx`.

**K2 (chấm cả tệp).** S4 đọc cả tệp (`design-floor-s4.mjs:79-87`), nên vòng nào chạm `brand-logos/*`, `chart.tsx` hay
`landing/*` đều bị chặn dù không thêm màu nào. Mô phỏng M1 với glob `.tsx` trên 357 merge first-parent từ 01/10: 137
merge chạm vùng, **0 bị chặn cả tệp, 0 có dòng thêm mang hex**. Với glob rộng: 139 chạm, 3 bị chặn, cả 3 do JSON proto.
Từ 01/09, các tệp nợ hex bị chạm 1 lần trên 680 commit (`landing/`).

### 3.5 `.tsx` không có độ phủ token

Độ phủ token chỉ chạy trên `.html`/`.htm` (`design-floor-s4.mjs:28,91`). Hợp đồng nhập cố ý trả 5 cho `.tsx` (DF-05,
`<kit>/design-floor/HOP-DONG-NHAP.md` §5 và §8). Ở M2 và M3, kho `.tsx` không được thêm gì ở S4. Chỉ có `reuse-plan
check` ở Cổng 1 khi hồ sơ viết `reuse-plan.md`. Kit tự khai giới hạn này ở mục K4 của bản phạm vi design-floor
(`docs/plans/pham-vi-design-floor-kho-moi-2910.md:19` của kho kit) và đặt cách gỡ vào DFK1. Cách gỡ đó in đúng tác
dụng theo loại tệp, chứ không thêm phép đo.

### 3.6 Token và registry: crm có gì, thiếu gì

| | Có sẵn | Thiếu cho M2 |
| --- | --- | --- |
| Token | `packages/ui/src/styles/globals.css`: 179 biến CSS, `:root` (dòng 10), `.dark` (78), `@theme inline` (89); `geist.css` thêm 425 biến. Cả hai đi qua Tailwind 4 | **tệp token JSON** mà Design OS đọc (`design.tokens.json`, `token-coverage.ts`). crm cần một lệnh sinh từ CSS (khai vào `design_floor.sinh_lai`) và một bài kiểm giữ hai bên khớp |
| Registry | `packages/ui/components.json` (shadcn, style `radix-nova`); 167 `.tsx` trong `packages/ui/src/components` (122 ở gốc, `reui` 14, `ai-elements` 10, `kara` 10, `brand-logos` 10, `icons` 1); `exports` mở `./components/*` | **`component-registry.json`** dạng `{ version, components: [{ name, category, deprecated? }] }` (`registry-store.ts:341-371` của bản vendored). Khuôn màn (`PageShell`, `AreaSidebar`, `RecordSheetFrame`…) nên mang `category` `layout`/`pattern` để `reuse-plan check` nhận làm mẫu |

Thang dùng lại của `reuse-plan check` trùng ý với «Vẽ tay là bậc cuối» của `docs/design.md`: dùng cái có, cài cái có
sẵn, `ds-new` là bậc cuối. Đó là phần M2 đáng nhất với crm, nhưng nó chỉ kiểm **tên** trong bản kế hoạch, không kiểm mã.
Nó cũng chưa có người dùng: 0 hồ sơ crm có `reuse-plan.md` hay `flow.json` (`git ls-files '_acceptance/*/reuse-plan.md' '_acceptance/*/flow.json'`).

### 3.7 Chỗ vấp ở invest và khoá hành vi S4

Theo bản phạm vi design-floor của kit (`pham-vi-design-floor-kho-moi-2910.md`, viết tắt PV-DF) và `docs/plans/lo-trinh-kit.json`:

| Mã | Ở invest | Ở crm |
| --- | --- | --- |
| K1 vendor | vùng ôm thư mục vendor, 248/263 chỗ bắt là mã không được sửa (PV-DF:16) | không có thư mục vendor trong vùng `.tsx`; `brand-logos` là cùng hình dạng nhưng nhỏ (17 chỗ) |
| K2 chấm cả tệp | 2/10 vòng đường nền đỏ oan | 0/137 theo lịch sử; đỏ oan chỉ khi chạm 13 tệp nợ (mục 3.4) |
| K3 hex trong chú thích, mặt nạ | `#000` phải đổi thành `black` | không có chú thích; bắt nhầm kiểu khác: bộ chọn CSS, số issue |
| K4 `.tsx` ở M2 | chỉ thêm một kiểm không chặn | như trên (mục 3.5) |
| K5 tri thức | ~9,5 nghìn token mỗi vòng | đo 9 415–10 313 token (mục 2); tri thức là tệp chung của Design OS (`component-catalog.md`, `accessibility.md`, `designmd-format.md`, `verification-honesty.md`), không phải `docs/design.md` của crm |

**Khoá DO1.** Chủ kho kit chốt không đổi hành vi S4 của design-floor trong 10 vòng giao diện kế tiếp của invest sau khi
invest lên M1 (PV-DF:26-27). Thứ bị khoá là regex, cách chấm cả tệp, việc chỉ loại một tệp token, và cách chọn đích
diff ∩ glob. DFK2 (chấm dòng thêm, `stripNoise`, miễn trừ có lý do) chỉ phát hành sau đủ 10 vòng (PV-DF:106).
`lo-trinh-kit.json` ước DFK1–3 lên ngày 12/11. Kit khuyên crm «chờ kết quả thí điểm ở invest trước khi khai
`executors.design.floor`» (`<kit>/CHANGELOG.md:452`).

Hai lỗi ở mục 3.1 và 3.2 không đổi hành vi chấm, nên chúng không thuộc khoá DO1. Chúng là sửa hạ tầng và có thể gửi ngay.

**Xung đột luật.** Miễn trừ của DFK2 là một chú thích ghi lý do ngay tại dòng (PV-DF:62-63). `AGENTS.md` của crm cấm mọi
chú thích trong mã. crm cần một đường miễn trừ ngoài tệp (danh sách trong config). Nếu không, `chart.tsx` và
`brand-logos/*` sẽ mang bắt nhầm mãi.

### 3.8 Quan hệ với bản đồ khuôn

| Lớp lỗi UX cũ của crm | Tầng | Trục giải | design-floor bắt được? |
| --- | --- | --- | --- |
| Màu, góc, khoảng cách đè bằng `className`, giá trị tuỳ ý `[…px]` | token / thành phần | lint (`tools/oxlint`, chưa có luật); hex chỉ là một phần nhỏ | chỉ hex |
| Khung trang: `PageShell`, đầu trang, chờ tải, lỗi | khung | BK3 (mở răng `apps/app/test/khung-man-chung.spec.ts` khỏi bảng đóng); KH1, KH5 của kit | không |
| Ngăn thoát khung, ngăn tự dựng đầu | khung | BK1 (một khung), BK2 (răng ngăn) | không |
| Hộp thoại chồng ngăn để ghi hay sửa | hành vi | luật «Ghi vào bản ghi: ngay trong ngăn»; răng `cnk_khong_hop_thoai` của hồ sơ `cap-nhat-trong-ngan-kr` là mẫu | không |
| Hàng công cụ: lọc lệch chỗ, chip tự ghép | khung / hành vi | mục «Hàng công cụ» và «Thứ tự một màn» của `docs/design.md`; chưa có răng | không |
| Vẽ tay thay thành phần có sẵn | thành phần | bảng «Dấu hiệu vẽ tay» → luật `anti-slop` (đã hứa trong `docs/design.md`); `reuse-plan check` ở M2 chỉ kiểm tên | M2, chỉ ở mức tên |
| Cảm nhận «một sản phẩm» | hành vi / cảm nhận | BK4, KH3: chụp màn mới cạnh màn mẫu trong `design-pass` | không |

Đếm thô dấu hiệu vẽ tay trong 512 `.tsx` của app (bỏ `proto/`), bằng `grep`, chỉ để thấy độ lớn chứ không phải phép
đo đã chấm: `Dialog` 19 tệp, giá trị tuỳ ý `[…px|rem]` 24 tệp (87 chỗ), `<h1>`/`<h2>` tự đặt cỡ chữ 18 tệp,
`AlertDialog` ráp tay 7, `navigator.clipboard` 7, `<ul className="divide-y">` 5. So với 6 tệp hex.

Bản đồ khuôn chạy được ở M0: kit nói khuôn là trục riêng, không phải một bậc M (`docs/findings/2026-10-30-ui-dong-nhat-giua-cac-man.md:610`
của kho kit). Các KH1–KH5 của kit chờ crm (BK1, BK2) hay onehub-quy-hang chạy thử trước (`pham-vi-ban-do-khuon-kit-3110.md:14,21`).
Riêng KH5 gắn vào lệnh bật một lần của DFK1. Vì vậy đường đáng làm cho crm là: bản đồ khuôn trước, design-floor M1 sau
khi kit có DFK1, còn M2 và M3 thì để chân trời.

## 4. Bậc nào bật, bậc nào chờ

| Bậc | Quyết định đề xuất | Mở lại khi |
| --- | --- | --- |
| M1 | **chờ** | kit đã gửi bản sửa mục 3.1 và 3.2; lưới tier-mismatch có danh sách «eval design» máy đọc gồm `floor` và `ui-check`; invest xong 10 vòng DO1 hay DFK2 đã phát hành |
| M2 | **chưa đáng** | kit có bộ đọc JSX cho độ phủ token (DFK-C1), hoặc crm có ít nhất 3 hồ sơ viết `reuse-plan.md` |
| M3 | **không làm** | M2 đã chạy và độ phủ token có nghĩa với `.tsx` |

Bật M1 ngay hôm nay (dù kit đã sửa hai lỗi) thì crm trả một lượt gọi người mỗi vòng cho lưới, cộng khoảng 10 nghìn
token S1, để đổi lấy một phép chặn mà lịch sử 137 vòng chưa từng kích hoạt. Điều này trái phép thử North Star của
chính kit: «không thêm lượt gọi người» (`<kit>/design-floor/HOP-DONG-NHAP.md:174`).

## 5. Danh sách hàng cho đợt dọn dẹp

Mã `SN` (sàn) chưa có ở `docs/plan/lo-trinh-*.json`. Thứ tự đề xuất: SN1 và SN2 chạy ngay trong đợt dọn dẹp; SN3 đi cùng
hay sau BK1–BK3; SN4 và SN5 vào `chan_troi`.

| Mã | Nhánh | Việc | Vì sao | Ước cỡ |
| --- | --- | --- | --- | --- |
| SN1 | `docs/thuoc-thiet-ke-xanh-rong` | Ghi luật vào `docs/design.md` (hay `docs/proto.md`): hồ sơ **mới** không khai khoá `design-gate --mode static` trên `.tsx`; eval giao diện là `ui-check` hay răng khung. Liệt kê 77 khoá `*_san_thiet_ke` là thước rỗng. Không sửa hồ sơ đã ký. | thước xanh rỗng che mắt người ký; sửa hồ sơ đã ký sẽ kéo ghim lại | T1, ~0,3 giờ máy |
| SN2 | `fix/hex-trang-gioi-thieu` | Thay 11 hex ở 6 tệp `apps/app/components/landing/*` bằng token có sẵn hay token mới trong `packages/ui/src/styles/globals.css` | nợ hex thật duy nhất trong app; làm trước thì bật M1 không chặn oan vòng chạm trang giới thiệu | T2 giao diện, ~1 giờ máy, có `ui-check` hai khổ |
| SN3 | `feat/luat-ve-tay-thanh-lint` | Biến 4–6 dòng máy đọc được của bảng «Dấu hiệu vẽ tay» (`<table>`, `navigator.clipboard`, `<h1>`–`<h4>` tự đặt cỡ, `divide-y` tự dựng, `size-2 rounded-full`, hex trong `className`) thành luật `tools/oxlint/onehub`, chặn ở `bun run lint:slop` cho tệp mới, có danh sách nợ cũ | đây là lớp lỗi thật của crm, chạy ở mọi lượt lint chứ không chỉ ở S4; thay được phần hex của design-floor | T2, ~3–4 giờ máy; chồng vùng với BK2/BK3 nên cùng dãy K |
| SN4 | `chore/design-floor-m1` | Khai khối M1 ở mục 2 (glob `.tsx`, `floor` có `--base origin/onehub`) | đường cho kit khi điều kiện mục 4 đủ | T1 config, ~0,5 giờ máy + một vòng thử; `chan_troi`, `mo_lai_khi`: điều kiện M1 của mục 4 |
| SN5 | `feat/registry-tu-packages-ui` | Lệnh sinh `component-registry.json` từ `packages/ui` (khuôn màn mang `category: layout`) và `design.tokens.json` từ `globals.css`, khai vào `design_floor.sinh_lai`, kèm bài kiểm khớp | điều kiện M2 | T2, ~3 giờ máy; `chan_troi`, `mo_lai_khi`: điều kiện M2 của mục 4 |

Không có hàng nào chờ người hay chờ dữ liệu. Mọi số đo ở trên đã chạy trên mã có sẵn.

## 6. Gửi kit

Chưa mở issue. Giám sát quyết định gửi một issue hay nhiều issue.

1. **`design-floor-bac.mjs:38` thiếu `maxBuffer`.** Kho có hơn khoảng 18 nghìn tệp kẹt ở M0, kèm lý do sai «không khớp tệp
   nào», và S1, S3, S4 im lặng theo. Sửa: thêm `maxBuffer` như `design-floor-s4.mjs:39`, và đừng nuốt lỗi git thành
   danh sách rỗng. Chiều đỏ: một repo giả có `git ls-files` lớn hơn 1 MiB.
2. **`timBase` (`design-floor-s4.mjs:42-51`, dùng lại ở S3) không đọc nhánh chính của remote** như `s4-args.mjs:300-322`.
   Hai khối `SKILL.md:199,405` không truyền `--base`. Kho có nhánh chính khác `main`/`master` thì S3 kẹt ở mọi vòng
   giao diện. Sửa: một bộ dò nhánh chính dùng chung với `s4-args`. Đây là sửa hạ tầng, không thuộc khoá DO1.
3. **Lưới tier-mismatch (`SKILL.md:203`) chưa định nghĩa «eval design».** Cần một danh sách máy đọc được (`executor` và
   tiền tố `cmd`), nói rõ `floor` và `ui-check` có được tính không. Số crm: 49/49, 46/49 hay 3/49 vòng bị DỪNG tuỳ cách
   hiểu.
4. **Chỉ một tệp token được loại** (`design-floor-s4.mjs:75,80`). Kho Tailwind 4 kiểu shadcn có nhiều tệp CSS token
   (crm: `globals.css`, `geist.css`). Đề xuất `design_floor.tokens_css` là một danh sách.
5. **Miễn trừ bằng chú thích (DFK2, PV-DF:62-63) không dùng được ở kho cấm chú thích.** Cần một đường miễn trừ ngoài
   tệp. Thêm hai mẫu bắt nhầm cho bộ `stripNoise`: bộ chọn thuộc tính CSS (`[stroke='#ccc']`) và số issue `#123`
   trong chuỗi.

Ghi thêm, không phải lỗi: tri thức S1 (K5) không đọc luật thiết kế của chính kho, dù crm đã khai
`feature_loop.ui_standards_skill` và `design_pass.ds_skill`. DFK3 nên cho kho trỏ tri thức S1 vào tệp của mình.

## 7. Tái lập

Mọi lệnh chạy từ gốc kho ở `aeb8b8152`. Bản clone dùng `git clone --shared` trong scratchpad, với một commit thêm khối
`design:` (glob của mục 2, có thêm `packages/ui/src/**/*.css`) và `design_floor.tokens: packages/ui/src/styles/globals.css`.

```bash
node -e 'const {execFileSync}=require("child_process");try{execFileSync("git",["ls-files"],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});console.log("ok")}catch(e){console.log(e.code)}'
```

```bash
git ls-files | wc -lc
```

```bash
git symbolic-ref refs/remotes/origin/HEAD
```

Ba script đo (hex theo tệp, lưới tier-mismatch theo merge, mô phỏng M1 theo merge) import thẳng `RE_HEX` từ
`<kit>/scripts/design-floor-s4.mjs` và `pathGlobToRe` từ `<kit>/lib/evidence-core.cjs`, để regex và glob là của kit.
Chúng không vào kho vì chỉ dùng một lần. Bản sao nằm ở thư mục ghi chú chung của nhóm phiên, tệp
`design-floor-crm-do.md`.
