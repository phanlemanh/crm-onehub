---
schema_version: 1
feature: crm thôi mang bộ điều phối tự viết — gỡ scripts/dieu-phoi, hook trong settings và test:dieu-phoi ở cổng; kiểm chéo đêm nạp gói dieu-phoi của kit và thôi khai mốc; eval đã ký mất vật đo khai thay bởi; khoá dieu_phoi.goi_dot
slug: chuyen-goi-dieu-phoi
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: []
status: signed-off
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-10-12T04:44:04Z
design_doc: _acceptance/chuyen-goi-dieu-phoi/design.md
---

# Acceptance Contract: chuyen-goi-dieu-phoi

## Context

Đợt `r2` chạy Điều phối – Thợ từ gói `dieu-phoi` của kit. Trước khi mở đợt, crm phải bỏ bản tự viết của giai đoạn một
(`scripts/dieu-phoi/`, bốn hook trong `.claude/settings.json`, `test:dieu-phoi` ở `package.json`, `pre-push`,
`gate-shape.json`, `acceptance.yml`), nối lượt kiểm chéo đêm sang gói kit, khai «thay bởi» cho các eval đã ký đo bản cũ, và
khai khoá gói đợt. PR ở dạng nháp và chỉ gộp sau khi kit cắt bản mang gói và crm cài đúng tag đó. «Merge-base» trong
các tiêu chí là neo của vòng tính lúc đo: nhánh còn mở thì `merge-base(HEAD, origin/onehub)`; hồ sơ đã lên `onehub` thì
cặp sha của commit gộp (`merge-base(M^1, M^2)` và `M^2`). Lúc viết hợp đồng nó là `b9a3b1609b47`. Trước khi kit phát hành, mọi phép đo cần gói dùng `dieu-phoi/` của kit
`origin/main` qua tệp trỏ tạm (design doc, mục «Đo trước khi kit phát hành»).

## Criteria

- AC-1: Given cây sau vòng dựng thành một bản clone độc lập của `HEAD`, When gọi `kiemChuyen` của gói `dieu-phoi` đã giải
  trên bản clone đó, Then mọi dòng trả về thuộc một lớp lịch sử của bảng «Phân lớp dòng» ở design doc và số dòng ngoài lớp
  bằng 0; tập id của khối eval sống có dòng trả về bằng đúng danh sách miễn của design doc; `git ls-files
  scripts/dieu-phoi` rỗng; và không tệp mã được theo dõi nào ngoài `_acceptance/` và `docs/` có import hay require tương
  đối giải vào `scripts/dieu-phoi/`.
- AC-2: Given các tệp `.mjs` ở thư mục gốc `scripts/dieu-phoi/` tại merge-base (đọc bằng git, không chép tay), When so với
  `scripts/` của gói đã giải, Then mỗi tệp có tệp cùng tên trong gói, mỗi tên mà mô-đun cũ export thì mô-đun gói cùng tên
  cũng export, và tập tên thiếu bằng đúng tập ngoại lệ đã khai `{lich.mjs: PHIEN_XEP_CUOI}` — thiếu thêm hay thôi thiếu đều
  là sai; hai tài liệu vận hành của bộ cũ (`README.md`, `mau/LUAT.md`) có bản không rỗng trong gói (`README.md`,
  `scripts/mau/LUAT.md`).
- AC-3: Given `.claude/settings.json` ở merge-base và ở `HEAD`, When đọc cả hai, Then `HEAD` không còn lệnh hook nào gọi tệp
  dưới `scripts/` của kho, mọi khoá khác ngoài `hooks` giữ nguyên giá trị (riêng `enabledPlugins` được thêm đúng một mục
  `dieu-phoi@acceptance-gate-kit: true` — bước cài sau phát hành); và với mỗi bộ (sự kiện, matcher, tên tệp script)
  của các khối hook gỡ đi, `hooks/hooks.json` của gói đã giải có một hook cùng sự kiện, cùng matcher, gọi
  `${CLAUDE_PLUGIN_ROOT}/scripts/<cùng tên tệp>`, và tệp đó có trong gói.
- AC-4: Given merge-base và `HEAD`, When đọc tên script của `package.json`, danh sách task của vòng `for task in …` của
  `.githooks/pre-push` (rút bằng cách chạy chính dòng đó), id checker của `.githooks/gate-shape.json`, và lệnh `run` của mọi
  job trong `.github/workflows/acceptance.yml` (parse YAML), Then mỗi nơi mất đúng một phần tử — `test:dieu-phoi` (lệnh
  `bun run test:dieu-phoi` ở workflow) — không thêm phần tử nào, phần còn lại của tệp không đổi; và mỗi task của vòng
  `pre-push` có script cùng tên trong `package.json`.
- AC-5: Given `scripts/kiem-cheo/` sau vòng và gói đã giải, When lượt kiểm chéo nạp điều phối và xin khoá `s4` qua một đợt
  đang sống, Then `timThuMucDot` và `chamNhip` mà lượt dùng là chính hàm của gói (cùng đối tượng hàm); đơn
  `xin/kiem-cheo-s4.json` do `layKhoa` thật ghi qua được `kiemDon` của gói và không có khoá `moc`; `node --test
  "scripts/kiem-cheo/test/*.test.mjs"` xanh với gói đó; và trên một đợt dựng từ `hang-viec.json` của gói đợt `r2` (mọi
  hàng mang `moc`), với đơn thợ do chính hàm ghi đơn của gói sinh ra SAU đơn kiểm chéo (giờ xin của kiểm chéo sớm nhất),
  `xepHang` của gói đặt đơn kiểm chéo sau mọi đơn thợ — đối chứng cùng fixture: cùng đơn thêm `moc` sớm hơn mọi hàng thì
  đứng trước ít nhất một đơn thợ; đơn thợ mất `slug` thì kiểm chéo đứng đầu.
- AC-6: Given gói `dieu-phoi` không giải được (biến chỉ định trỏ thư mục thiếu tệp; hoặc không biến và không bản cài), When
  `node scripts/kiem-cheo/dem.mjs` chạy một lượt có hồ sơ đổi, Then lượt không ghi đơn xin khoá, không chạy làn, ghi tệp
  ngày `ket_qua: khong-chay-duoc` với `ly_do` chứa `dieu-phoi` và `claude plugin install dieu-phoi@acceptance-gate-kit`,
  gọi lệnh báo người, mốc giữ nguyên từng byte. Và Given gói giải được không qua biến (bản cài trong HOME tạm, bố cục rút
  từ đường cài thật của `feature-loop` trên máy này) và không có đợt nào, When lượt chạy, Then lượt lấy khoá tay, chạy làn,
  ghi `ket_qua: xanh`, mốc tiến tới đỉnh `origin/onehub`, không có tệp `xin/` nào.
- AC-7: Given một kho giả có `origin` và hồ sơ đổi sau mốc (mốc ghi quá 20 giờ trước), một đợt mở bằng CLI của gói (`mo`
  rồi `chay`; khoá máy ở thư mục tạm qua `DIEU_PHOI_MAY_DIR`) và làn giả qua `KIEM_CHEO_LAN`, When chạy
  `node scripts/kiem-cheo/dem.mjs --goc <kho giả>` một lượt, Then bộ phát lịch của gói cấp `khoa/s4` cho phiên
  `kiem-cheo` trước khi làn chạy (làn giả đọc được `chu.json` của phiên đó, không có `moc`), khoá được nhả sau lượt, tệp ngày
  ghi `ket_qua: xanh`, mốc tiến tới đỉnh mới; sau `dong` không còn tiến trình bộ phát lịch nào sống và khoá máy đã nhả.
- AC-8: Given `_acceptance/config.yaml` sau vòng, When `docKhoaGoiDot` của gói đọc nó, Then trả đúng `docs/plan/dot-{ten}`;
  so với merge-base tệp chỉ thêm dòng; và `chan-doan --mo r2 --json` của gói chạy trên bản clone độc lập của `HEAD` trả
  `co-dot: thieu`, `goi-dot: du` với đường kết thúc bằng `docs/plan/dot-r2`, các mục còn lại `khong-ap` — đối chứng cùng
  bản clone bỏ khoá: `goi-dot: thieu`.
- AC-9: Given bảng «Eval cũ thay bởi vòng này» của design doc, When đọc `evals.yaml` của các hồ sơ cũ, Then mỗi eval trong
  bảng mang `status: not-run` và `superseded_by: chuyen-goi-dieu-phoi#<AC của bảng>`; so với merge-base mỗi tệp `evals.yaml`
  cũ chỉ đổi đúng các dòng đó (hai dòng thêm cho eval mới khai, một dòng giá trị `superseded_by` đổi cho eval đã khai từ
  trước); mỗi AC được trỏ có trong hợp đồng này và có ít nhất một eval sống; và với MỌI con trỏ `superseded_by` trong
  `_acceptance/*/evals.yaml` ở `HEAD` (không chỉ dòng của bảng), `chungThayBoi` của kit trả `ok`, hoặc trả
  `ho-so-thay-chua-ky` khi đích là hồ sơ này và hồ sơ này chưa ký.
- AC-10: Given các eval `test`/`script` sống của hồ sơ `signed-off` hoặc `machine-cleared` khác mà `paths` khớp một tệp vòng
  này đổi ngoài `_acceptance/`, hoặc lệnh đã giải nhắc `scripts/dieu-phoi/`, `test:dieu-phoi` hay `scripts/kiem-cheo/` (rút
  bằng lệnh, không liệt tay), When chạy lệnh của chúng trên bản clone đầy đủ của `HEAD` và của merge-base, mỗi bản ở trạng thái sau gộp
  (`onehub` trỏ chính sha của bản), với cùng gói đã
  giải, Then không lệnh nào đỏ trên `HEAD` mà xanh trên merge-base; lệnh đỏ ở cả hai được ghi tên kèm nhật ký; lệnh nặng
  trong danh sách bỏ khai sẵn được nêu tên kèm lý do.

## Coverage

- Trục A — chỗ crm chạm bộ cũ: hook settings | script `package.json` | vòng `pre-push` | checker `gate-shape.json` | bước
  CI | import của kiểm chéo | eval hồ sơ đã ký | tài liệu sống | executor `config.yaml` [thước CE: `xem --kiem-chuyen` của
  gói + `git grep` import tương đối + thử gỡ trên worktree tạm 12/10]
- Trục B — trạng thái gói: đã cài | chỉ định qua biến | vắng | thiếu tệp [thước CE: mã thoát của `resolve-plugin.mjs`]
- Trục C — hàng chờ khoá `s4`: chỉ thợ | chỉ kiểm chéo | cả hai, thợ có mốc | kiểm chéo có mốc (đối chứng) | không đợt
  (khoá tay) [thước CE: `lich.mjs` của gói]
- Trục D — số phận eval cũ: đỏ → thay bởi | con trỏ cũ mất đích → đổi con trỏ | xanh mà `paths` chạm → ghim lại | đỏ sẵn ở
  merge-base → ghi tên [thước CE: so mã thoát hai cây tạm 12/10]
- Core → AC: A → AC-1, AC-3, AC-4, AC-8; A×D → AC-9, AC-10; B → AC-5, AC-6 (đã cài qua HOME tạm; bản cài thật ở lượt
  ghim lại sau cài); C → AC-5, AC-6 (không đợt), AC-7; «chuyển, không mất» → AC-2.
- Later: kiểm chéo giữ khoá máy khi không có đợt (gói chưa có lối cho người gọi ngoài đợt); đo lại bộ lọc `paths` của F19
  với tệp mẫu khác. Never: sửa script kit vendored; sửa thước hồ sơ đã ký ngoài lối thay bởi; cài bản kit chưa phát hành.
- [GIẢ ĐỊNH] Bản phát hành mang gói `dieu-phoi` giữ nguyên giao kèo tệp của thư mục đợt (`xin/`, `khoa/<loại>/chu.json`,
  `phat-lich.pid`) như `origin/main` hôm nay.

## Out of scope

- Cài `acceptance-gate`, `feature-loop`, `diagram-design`, `dieu-phoi --scope project` ở tag mới — việc của giám sát khi kit
  cắt bản; cài đổi `.claude/settings.json` nên kéo theo một lượt ghim lại hồ sơ này.
- Kiểm chéo giữ khoá máy `~/.claude/dieu-phoi/may/s4` khi không có đợt nào chạy.
- Gỡ `scripts/gate-shape-node-test.mjs` và kiểu checker `node-test` của `scripts/verify-gate-shape.mjs`.
- Sửa `.acceptance-runs/dieu-phoi-sau-14-10/` (hồ sơ đợt đã đóng) và mọi tệp lịch sử của hồ sơ đã ký.
- Sửa script kit vendored (`scripts/recheck-evidence.cjs`, `scripts/product-map.mjs`, `scripts/pre-merge-check.sh`,
  `scripts/resolve-plugin.mjs`).
- Chuyển PR sang sẵn sàng và gộp — giám sát làm theo bốn điều kiện của `docs/plan/dot-r2/README.md`.

## Notes

- Điều kiện cuối của luật thay bởi (eval sống có mã 0 trong báo cáo ĐÃ KÝ của hồ sơ này) chỉ thoả sau chữ ký; các hồ sơ cũ
  ghim lại ở đỉnh nhánh sau Cổng Bằng chứng, một lượt làn cho mọi slug. Vế «`chungThayBoi` trả `ok` cho con trỏ về hồ sơ
  này» được chứng ở lượt làn đó, không ở S4.
- Đường «gói đã cài» của mã sản phẩm (không biến) được đo ở S4 trên HOME tạm; trên bản cài thật của máy này nó được đo ở
  lượt ghim lại sau khi giám sát cài gói.
- Trước khi kit phát hành, phép đo dùng gói trích từ kit `origin/main`; dòng đầu mỗi phép đo in nguồn gói. Lượt ghim lại
  sau khi cài là nơi chứng trên bản phát hành.
- `diagram-design` đi số phiên bản riêng (đang 2.7.1, ba gói kia 2.26.0): điều kiện «cùng số phiên bản cho cả bốn gói»
  không thoả theo nghĩa đen — giám sát quyết cách đọc.
- E10 không chạy lại 11 lệnh họ `pre-push` của `hinh-cua-luoi` và `luoi-day-do-that` (mỗi lệnh chạy cổng thật nhiều
  lượt) cùng ba lệnh trùng suite; thay bằng phép đo dòng vòng. Hai bộ chặn đó ghim dòng vòng `check-types lint lint:slop
  test build` nên đã lệch từ khi `test:dieu-phoi` vào vòng (07/10); vòng này đưa dòng vòng về đúng dạng ghim.
- Hành vi của bộ điều phối (xếp lượt, hạn thuê, hook, bảng, CLI) nay do kit đo ở hồ sơ DP1–DP7 của kit; crm chỉ đo chuyển
  đủ (AC-2), hook đủ (AC-3) và chỗ nối (AC-5–AC-7).
- Known limit (Cổng 2, Ngoài-2, Ngoài-5): E9 chỉ xét `evals.yaml` bị sửa (`--diff-filter=M`); một tệp của hồ sơ đã ký bị
  xoá hay đổi tên lọt qua mà E9 vẫn xanh. Cây lúc ký không có tệp nào như vậy.
- Known limit (Cổng 2, Ngoài-4): thiếu `origin/onehub` trên máy đo thì cả mười phép đo thoát 1 (đỏ) thay vì 2 («không đo
  được»). `git fetch origin onehub` trước khi đo.
- Known limit (Cổng 2, Ngoài-7): nhánh «đã gộp» của neo vòng (cặp sha của commit gộp) chưa phép đo nào chạy qua; lần đo
  đầu tiên sau khi PR gộp là lần đầu nó được dùng.
- Known limit (Cổng 2, Ngoài-15): E3 miễn cả dòng lệnh hook có nhắc `${CLAUDE_PLUGIN_ROOT}`, và ô miễn đó không có ca đo;
  một lệnh vừa gọi gói vừa lùi về mã của kho sẽ không bị bắt.
- Known limit (Cổng 2, Ngoài-16, Ngoài-19): `napGoiDieuPhoi` không kiểm ba hàm của gói có mặt; bản gói sau đổi tên hay bỏ
  `timThuMucDot`, `chamNhip`, `kiemDon` thì lượt kiểm chéo đêm hỏng với lỗi khó đọc, hoặc mất nhịp mà không báo.
- Known limit (Cổng 2, Ngoài-20): E7 kiểm «khoá máy s4 đã nhả sau khi đóng đợt» trên một đợt chưa từng lấy khoá máy, nên
  chiều đó luôn xanh; hành vi nhả khoá do kit đo.
