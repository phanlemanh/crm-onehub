# Trang máy vẽ gộp không xung đột, và hook trước-đẩy nhận cây mã đã chứng

Ngày 23/10/2026. Hai hạng B và E của gói «cắt 80%» (đoạn ký → gộp). Một hồ sơ, một PR:
`_acceptance/trang-ve-gop-va-dau-cay/`.

## Vì sao

Đợt `lo-trinh-tin-hieu` 19–23/10: 39 PR tính năng, PR mở → gộp trung vị 8,3 giờ. Hai chỗ ngốn giờ máy mà không đổi
được gì của sản phẩm:

- **B.** `PRODUCT-MAP.md` và `LO-TRINH.html` do `scripts/product-map.mjs` vẽ trọn từ nguồn, được commit trong mọi
  nhánh, và `--check` ở CI đòi chúng khớp nguồn trên đỉnh PR. Hai PR sửa hai nguồn khác nhau vẫn đụng nhau ở tệp vẽ.
  Đếm các commit «gộp `origin/onehub` vào nhánh» từ 16/10: `PRODUCT-MAP.md` khác cả hai cha ở 195 commit,
  `LO-TRINH.html` ở 176. Ca 23/10: #550 xung đột lúc 13:19 — dựng lại `bcf7ecdf9` gộp `084ec4d12` thì đúng hai tệp
  này và không tệp nào khác xung đột; gộp và đẩy lại mất 53 phút. Hạt giống kit
  `docs/plans/2026-10-16-hat-giong-tep-sinh-xung-dot-moi-lan-goi.md` (kho kit) đề xuất: giữ bản mình khi gộp rồi vẽ lại.
- **E.** `.githooks/pre-push` chạy `check-types`, `lint`, `lint:slop`, `test`, `build` với `TURBO_FORCE=true` ở mọi lần
  đẩy, kể cả khi đúng phần mã ấy vừa xanh ở lượt chấm S4, làn ghim lại, CI, hay chính hook lần đẩy trước. Một PR có hai
  lần đẩy đã chạy toàn bộ test sáu lần (S4, hook ×2, CI ×2, ghim lại).

## Tệp nào là trang máy vẽ

Đầu ra của bộ vẽ là danh sách đủ: `product-map.mjs` chỉ ghi hai tệp (`writeFileSync(mapPath)`,
`writeFileSync(pagePath)`), là `PRODUCT-MAP.md` và `LO-TRINH.html`. Các tệp khác hay bị gộp tay
(`_acceptance/config.yaml` 240 lần, `apps/api/src/generated/server.ts` 4 lần) không phải đầu ra của bộ vẽ — xem
«Ngoài phạm vi».

## B — gộp giữ bản mình rồi vẽ lại

### Khai báo

- `.gitattributes` ở gốc: `PRODUCT-MAP.md merge=union` và `LO-TRINH.html merge=union`. Đây là nơi duy nhất liệt kê
  trang máy vẽ; hook đọc danh sách từ đây.
- `union` là cách gộp dựng sẵn của git: gộp hai bản theo dòng, không bao giờ để dấu xung đột. Nội dung gộp ra là trộn
  của hai bản — vô nghĩa với một trang sinh — nhưng hook vẽ lại ngay sau đó (dưới), nên commit gộp mang trang đúng.
  Không cần khai gì trong cấu hình git: mọi clone, mọi worktree, mọi máy có ngay từ lúc `.gitattributes` vào cây.
- Bản đầu của vòng dùng một driver tự khai `merge=trang-ve` (= `true`, giữ bản mình) cài qua `prepare`. Đổi sang
  `union` ngày 23/10 sau khi đo: công cụ đồng bộ của app (`sync_with_base_branch`) từ chối gộp («filtered_path») đúng
  ở hai tệp mang driver tự khai, vì git của app không chạy driver kho khai. Hai cách cho cùng kết quả cuối (hook vẽ lại),
  cùng lưới (gộp đi đường không qua hook thì trang trộn hoặc trang cũ, `--check` đều đỏ); `union` bỏ được bước cài và có
  cơ hội giữ lối đồng bộ của app — đo ở lần `onehub` đi tiếp kế.

### Vẽ lại — đo trước khi chọn

Ba thử nghiệm trên kho git tạm (git 2.37, bản của máy):

1. `pre-merge-commit` gọi `git add` trang vừa vẽ: commit gộp **không** nhận — `git merge` đã tính cây trước khi gọi hook.
2. `post-merge` gọi `git commit --amend`: git từ chối «You are in the middle of a merge -- cannot amend» (`MERGE_HEAD`
   còn tới sau hook).
3. `pre-commit` khi kết thúc một lần gộp có xung đột (`git commit` lúc có `MERGE_HEAD`): commit nhận tệp hook vừa
   `git add`.

Nên có hai đường, một bộ vẽ:

- **Gộp tự động** (`git merge`, `git pull`, và đồng bộ của app — đều qua `git merge` trên máy): hook `post-merge`. Đỉnh
  có từ hai cha trở lên thì vẽ lại; vẽ ra khác cây của đỉnh thì dựng commit thay thế bằng lệnh nền
  (`commit-tree` với đúng các cha, tác giả, người commit, lời commit của đỉnh; cây = cây đỉnh với hai trang mới), dời
  nhánh bằng `update-ref` có so giá trị cũ, rồi cập nhật chỉ mục và tệp trong cây làm việc cho khớp. Gộp tua nhanh không
  sinh commit gộp: không làm gì.
- **Gộp dừng vì xung đột ở tệp khác** (hay `git merge --no-commit`): hook `pre-commit` khi có `MERGE_HEAD`. Vẽ lại từ
  cây của chỉ mục (`write-tree`), `git add` hai trang; `git commit` đọc lại chỉ mục sau hook.

**Vẽ trong cây tạm sạch, không trong cây làm việc.** Đo 23/10: một thư mục hồ sơ rỗng chưa commit trong cây làm việc làm
`--check` đỏ (bản đồ ghi thêm «hồ sơ hỏng»). Vẽ tại chỗ thì mọi hồ sơ đang soạn dở chưa commit lọt vào trang của commit
gộp, và CI đỏ đúng PR vừa được sửa. Bộ vẽ dựng một worktree tách rời tạm từ commit đang xét (đỉnh gộp; hoặc một commit
lơ lửng `commit-tree <cây chỉ mục> -p HEAD -p MERGE_HEAD`) — 2,8 giây — chạy `node scripts/product-map.mjs --root .`
trong đó (35 giây đo trên kho này; không cần `node_modules`), đọc hai trang ra, xoá worktree tạm (cả khi lỗi).
Worktree tạm là repo git thật nên các bộ đọc hồ sơ gọi `git` vẫn chạy như ở CI.

**Không bao giờ chặn lần gộp hay commit.** Bộ vẽ hỏng, thiếu `node`, `CRM_SKIP_HOOKS` bật → in đúng một dòng nói vì sao
và lệnh vẽ tay, thoát 0. Răng vẫn là `--check` ở CI: nó không đổi.

**Luôn chạy hook của chính cây.** Như `pre-push`: `core.hooksPath` của worktree trỏ `.githooks` của checkout chính, nên
hai hook mới mở đầu bằng cùng khối «có `.githooks/<hook>` của cây thì `exec` nó».

### Răng giữ nguyên

`acceptance.yml` bước «Product map» (`node scripts/product-map.mjs --root . --check`) không đổi một byte. Hai chiều của
một ca: gộp có hook → trang khớp, `--check` 0; cùng ca gộp với hook tắt (`CRM_SKIP_HOOKS=1`) → trang là bản trộn của
`union`, `--check` 1 gọi tên trang lệch. Tức là bỏ bước vẽ lại thì CI đỏ đúng chỗ.

### Phần nào của 53 phút B cắt được

Ca #550: xung đột lúc 13:19, đẩy lại xong sau 53 phút. B cắt phần giải tay (mở tệp, vẽ lại tay, kiểm, commit) và phần
đẩy lại vì trang vẽ tay sai: lần gộp trên máy tự xong trong khoảng 40 giây. B không cắt lần gộp và lần đẩy lại — GitHub
vẫn báo xung đột (giới hạn dưới) — và không cắt thời gian hook trước-đẩy của lần đẩy lại ấy; phần đó do đường «chỉ mang
phần của onehub» có sẵn của hook và E lo.

### Giới hạn đã biết của B

- **GitHub có thể vẫn báo xung đột.** Chưa đo phép tính «có xung đột không» của máy chủ GitHub có theo `merge=union` của
  `.gitattributes` hay không; nếu không, PR vẫn hiện «có xung đột» khi `onehub` đi tiếp tới lúc có một lần gộp trên máy
  được đẩy lên. Cái được: lần gộp đó tự
  xong, không còn giải tay, không còn tay sai trang. Bỏ hẳn được bước đẩy lại là phương án 2 của hạt giống (không
  commit trang ở PR, job sau gộp tự vẽ) — đổi luật `--check` của kit, ngoài phạm vi.
- `rebase` và `cherry-pick` cũng gộp trang theo `union` mà không vẽ lại. Kho dùng gộp, không
  rebase; trang lệch thì `--check` đỏ ở CI.

## E — hook trước-đẩy nhận cây mã đã chứng

### Dấu cây

**Cây mã** của một commit là cây git của nó bỏ đi các tệp T1 thường: khớp `risk_tiers.t1_skip_globs` mà không khớp
`t1_ma_doc` của `_acceptance/config.yaml`, đúng hàm `tachT1` của `.github/scripts/phan-loai.mjs` (một luật với CI và
đường T1 của hook). Tệp dưới `.github/` luôn thuộc cây mã, như `quyetDinh` coi chạm `.github/` là nặng. Hai commit
**cùng cây mã** khi và chỉ khi mọi tệp trong `git diff --name-only --no-renames <a> <b>` là T1 thường; khác một tệp mã,
một tệp `t1_ma_doc` hay một tệp `.github/` thì khác.

Không băm cả cây: đo 23/10, phân loại 17.011 tệp của cây bằng bộ khớp glob của `pre-merge-check.sh` mất 24 giây — mỗi
lần đẩy không có dấu sẽ chậm thêm chừng ấy. So bằng diff thì chỉ phân loại phần khác: diff giữa các ứng viên và đỉnh
được gom, mỗi diff trên 300 tệp coi luôn là khác cây (không phân loại, chỉ mất một lần bỏ bước, không bao giờ bỏ nhầm),
phần còn lại phân loại trong một lần gọi. Dấu ghi theo sha của commit đã chứng.

### Nguồn của «đã xanh»

Mỗi nguồn chứng một tập bước của hook, không chứng gì ngoài tập ấy. Ánh xạ và các ngưỡng khai trong
`.githooks/da-chung.json` — tệp vắng thì không nguồn nào được đọc và mọi lần đẩy chạy như cũ.

1. **Dấu của chính hook.** Sau một lần đẩy mà `verify-gate-shape` xanh, hook ghi một tệp `<sha>.json` (sha, thời
   điểm, vân tay môi trường, **đúng các bước vừa thật sự chạy** trên máy) vào `<git-common-dir>/crm-pre-push/da-chung/`
   (chung cho mọi worktree của máy, không vào git; dấu quá 14 ngày bị bỏ qua và dọn). Bước được bỏ vì đường T1 hay vì
   một nguồn khác không vào dấu: dấu không tự gia hạn, và chứng của CI hay sổ chạy không bao giờ đổi tên thành «hook».
   Lần đẩy được chứng đủ năm bước không chạy gì nên không ghi dấu mới — dấu ngày 0 hết hạn ở ngày 14 dù giữa chừng có
   bao nhiêu lần đẩy cùng cây.
2. **Sổ chạy của S4 và làn ghim lại** — `_acceptance/*/run-log.jsonl` của cây đang đẩy. Dòng lệnh S4 (khoá `cmd`,
   `exit_code` 0, `sha`) chứng bước mà lệnh đó là. Dòng `kind: repin` có `tong_ket.ket_cuc: "xanh"` chứng các lệnh của
   `feature_loop.suite_keys` (giải qua `executors.*` của `config.yaml` — tệp này thuộc cây mã, nên cùng cây mã thì cùng
   danh sách lệnh) có mã 0 trong `suites_exit`. Lệnh → bước theo `lenh` của tệp khai. `test` chỉ được chứng khi các
   lệnh test xanh trên cùng sha phủ đủ mọi gói có script `test` không miễn trong `gate-shape.json` (đọc từ các
   `--filter=`; `bun run test` trần phủ tất cả). Hôm nay làn ghim lại và S4 chạy bốn lệnh test, `lint`, `lint:slop`,
   `build` — không chạy `check-types`, nên `check-types` vẫn chạy.
3. **CI xanh** trên một commit cùng cây mã: các check-run của commit (`gh api`), theo `ci` của tệp khai: «check-types,
   lint» → `check-types`, `lint`, `lint:slop`; ba ô «test (…)» cùng xanh → `test`; «lệnh dựng» → `build`. Ô bị bỏ qua
   (PR nháp, PR chỉ T1) không phải xanh. CI chạy trên merge-ref (đỉnh gộp với `onehub` lúc đó) nhưng gắn check-run vào
   đỉnh PR; hồ sơ nhận đó là chứng cho cây của đỉnh, vì đề bài của chủ kho (mục E) liệt nguồn này, và CI vẫn chạy lại
   trên lần đẩy mới. Remote không phải GitHub, `gh` vắng, lỗi hay quá 10 giây → nguồn này im, không đổi gì.

Ứng viên để so: mọi dấu của hook còn hạn, các sha trong sổ chạy (dòng mới nhất trước, tối đa 40 sha có trong kho), và
với CI: đầu nhánh từ xa của lần đẩy cùng 20 commit gần nhất của đỉnh. Nguồn rẻ đọc trước (dấu hook, sổ chạy); `gh` chỉ
được gọi khi còn bước chưa chứng.

### Hook dùng dấu thế nào — không sửa `.githooks/pre-push`

`.githooks/pre-push` và `.githooks/gate-shape.json` giữ nguyên từng byte. Lý do đo được: răng `ho-so-cu.mjs` của hai hồ
sơ đã ký (`pre-push-phan-rieng-pr`, `pre-push-cau-va-nhan`) đòi hook giống từng byte và `gate-shape.json` giống ngoài
`t1Only.vi_sao` so với `merge-base(HEAD, origin/onehub)`; `rang-cu.mjs` của `pre-push-t1` và các răng `hinh-cua-luoi`,
`dieu-phoi-va-bien`, `chuyen-goi-dieu-phoi` ghim từng dòng của vòng `for task`. Sửa hai tệp ấy là các hồ sơ đó hoá cũ
mà làn ghim lại đỏ, tức phải mở lại hồ sơ đã ký.

Hook hôm nay đã có đúng hai chỗ cắm: nó bỏ mọi bước có tên trong stdout của `scripts/pre-push-t1.mjs` (`BO_QUA`), và
chuyển nguyên `BO_QUA` cho `scripts/verify-gate-shape.mjs --bo-qua`. Nên:

- `scripts/pre-push-t1.mjs` gọi mô-đun mới `scripts/pre-push-da-chung.mjs`. Stdout là hợp của bước bỏ theo đường T1 và
  bước đã chứng, trên một dòng như cũ. Có bước đã chứng thì stderr thêm đúng một dòng:
  `pre-push: cây mã của <sha 9> đã xanh ở <nguồn> (<sha 9 nguồn>, <thời điểm>) — bỏ <các bước>.` Không có dấu → không in
  thêm gì, stdout y như trước vòng.
- Cùng lúc, nó ghi **phiếu** của lần đẩy vào `<git-common-dir>/crm-pre-push/phieu/<băm gốc cây làm việc>.json`: các sha
  đẩy, tập bước bỏ theo T1, tập bước đã chứng kèm nguồn.
- `scripts/verify-gate-shape.mjs` đọc phiếu của chính cây làm việc, chỉ khi phiếu mới hơn tệp `--runs-before` mà hook tạo
  ngay trước khi gọi bộ phân loại (nên phiếu của lần đẩy trước không bao giờ được dùng). Không có phiếu → luật cũ y
  nguyên: `--bo-qua` phải bằng `t1Only.skip`. Có phiếu → `--bo-qua` phải bằng hợp hai tập của phiếu; phần T1 kiểm như cũ
  với `t1Only`; phần đã chứng chỉ nhận khi tệp khai có `vi_sao`, mỗi bước là checker đã khai, và bước đó thật sự không
  chạy. Xanh → ghi dấu của hook cho từng sha trong phiếu với đúng các bước đã chạy (không ghi khi không bước nào
  chạy), rồi xoá phiếu.
- Bộ đọc dấu hỏng → một dòng «không đọc được dấu cây (…) — chạy như cũ», không thêm bước nào vào stdout. Không có
  `--no-verify` mới nào.

## Quét không gian (morphological-scan, preset test-matrix)

Chân sản phẩm: `[SUY-TỪ-REPO: CLAUDE.md]` (luồng PR, `onehub`, năm lệnh chứng, `core.hooksPath` trỏ checkout chính),
`[SUY-TỪ-REPO: .githooks/pre-push]`, `[SUY-TỪ-REPO: scripts/product-map.mjs]`. Chân ngành: `[NGÀNH: gitattributes(5) —
driver gộp tự khai, mẫu «merge=ours» cho tệp sinh]`, `[NGÀNH: npm-merge-driver — driver gộp dựng lại lockfile thay vì
gộp văn bản]`, `[NGÀNH: Turborepo task hash, Bazel action cache — khoá kết quả theo băm đầu vào gồm cả biến môi trường
và phiên bản công cụ]`. Chân ngành thêm một trục mà bản nháp đầu thiếu: **môi trường** — Turborepo và Bazel đưa biến
môi trường và phiên bản công cụ vào khoá; dấu của hook vì thế mang thêm vân tay môi trường (dưới).

Trục:

- B · kiểu gộp: tự động | dừng vì xung đột tệp khác | `--no-commit` | tua nhanh | rebase, cherry-pick
  [thước CE: các đường git tạo commit nhiều cha — `merge`, `commit` kết thúc gộp; `pull` đi qua `merge`].
- B · cấu hình: có thuộc tính gộp và hook | không thuộc tính | hook tắt (`CRM_SKIP_HOOKS`) | bộ vẽ hỏng | hook của checkout chính
  cũ hơn cây [thước CE: lỗi cũ `core.hooksPath` trỏ checkout chính, hồ sơ `dieu-phoi-truoc-mo-dot`].
- B · cây làm việc: sạch | có hồ sơ chưa commit [thước CE: đo 23/10, thư mục hồ sơ rỗng làm `--check` đỏ].
- E · nguồn: dấu hook | sổ chạy S4 | sổ chạy ghim lại | CI | không có [thước CE: đề bài mục E].
- E · trạng thái dữ liệu của nguồn: đủ năm bước | một phần | đỏ | bỏ qua | quá hạn | hỏng (JSON lỗi) | môi trường khác.
- E · tệp khác giữa hai commit: T1 thường | `t1_ma_doc` | `.github/` | mã | `config.yaml` | quá ngưỡng
  [thước CE: các nhánh của `quyetDinh` và `tachT1`].
- Cross-cutting: đẩy nhiều ref một lần (chỉ bỏ bước mọi ref đều đã chứng); hai worktree đẩy cùng lúc (phiếu theo cây
  làm việc); ghi dấu hai lần (ghi đè, không lỗi).

Core: các ô của AC-1…AC-10. Later: dọn dấu bằng lệnh tay; đưa vân tay môi trường vào nguồn sổ chạy. Never: driver tự vẽ
ngay trong lúc gộp — git gọi driver khi các tệp nguồn của trang chưa gộp xong, nên trang vẽ ra không phải của cây gộp.

**Vân tay môi trường của dấu hook:** sha-256 của `node --version`, `bun --version` và nội dung `.env` ở gốc cây làm việc
(chỉ băm, không ghi nội dung). Dấu chỉ được dùng khi vân tay hiện tại khớp. Nguồn sổ chạy và CI không mang vân tay — CI
chạy trên môi trường trắng nghiêm hơn máy; sổ chạy ghi `suites_env: "ci"` khi làn chạy với biến trắng.

## Ngoài phạm vi

- Xung đột ở `_acceptance/config.yaml` — tệp gộp tay nhiều nhất (240 commit gộp), nhưng người viết, không phải máy vẽ;
  cần cách khác (tách khối theo hồ sơ). Đề xuất thành việc riêng.
- `apps/api/src/generated/server.ts` (do `trpc:generate` sinh) — 4 lần; không phải đầu ra của bộ vẽ bản đồ.
- Phương án 2 của hạt giống (không commit trang ở PR, job sau gộp tự vẽ) và mọi đổi ở kit; đổi `--check`.
- Đường đẩy thẳng lên `onehub`: hook vẫn như trên; dấu không đổi luật nhánh.

## Đặc tả UX

Không chạm giao diện: không có màn, không có trạng thái người dùng nhìn thấy. Bỏ bằng dòng sổ «bỏ đặc-tả-UX».
