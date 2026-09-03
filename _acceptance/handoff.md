# Handoff — nhánh `onehub`

Viết lại cuối phiên **2026-09-03**. Phiên này chạy S4 sáu vòng cho lát ③a và
kết thúc ở **16/16 tiêu chí máy đạt**. Đọc file này trước khi làm bất cứ việc gì
trong hàng đợi — nhất là mục "Bẫy" và mục "Lớp lỗi không thước nào bắt".

## Hai dòng đã gộp — đọc mục này trước

Tới sáng 2026-09-03 công việc nằm trên **hai dòng rẽ nhau** ở `ccd9ce6` (01/09),
và không ai biết: worktree `.claude/worktrees/exciting-tharp-571c02` (nhánh
`claude/suspicious-austin-9f8e15`) giữ vòng ③a cùng bản chạy lại S4 của vòng ①,
còn `onehub` giữ riêng vòng `hinh-cua-luoi` và `scripts/verify-gate-shape.mjs`.
Máy chủ dev ở cổng 3000/3001 chạy từ **worktree**, nên một phiên đọc handoff cũ
trên `onehub` đã dịch lại một loạt chuỗi mà worktree dịch xong từ trước.

Chiều 2026-09-03 người chọn gộp worktree vào `onehub`. Đã gộp, 22 file đụng
nhau, hồ sơ vòng ① lấy bản worktree (nó muộn hơn và mang quyết định Cổng 2 của
người), `PRODUCT-MAP.md` để máy vẽ lại. Hai dây lùi còn đó:
`pre-merge-onehub-2026-09-03` và `pre-merge-worktree-2026-09-03`.

**Luật rút ra: `git worktree list` và xem máy chủ dev chạy từ thư mục nào TRƯỚC
khi tin handoff hay tin một con số.** Bản handoff mới nhất có thể không nằm trên
nhánh mình đang đứng.

## Hiện trạng

- `origin` = `phanlemanh/crm-onehub` (riêng tư), nhánh làm việc `onehub`
- `upstream` = `trycompai/crm` (chỉ đọc, MIT) · `release` = bản gương, không sửa
- **Chưa đẩy** lên `origin`: cả hai dòng cộng lượt gộp. Chưa ai đẩy, và phiên
  trước được dặn không đẩy khi chưa hỏi.

Đã gửi lên hãng, đang mở: PR `trycompai/crm#194` (vá `dev-session`), issue `#195`
(nay đã biết là **không phải test phập phù** — xem mục bẫy).

## Việc tiếng Việt: năm vòng, đang ở đâu

`_acceptance/tieng-viet-cho-crm/opportunity.md` chốt năm vòng. Thứ tự đã đảo
ngày 2026-09-01: ② lên trước ①.

| Vòng | Vùng | Trạng thái |
| --- | --- | --- |
| ② | Bộ dựng chung (`packages/ui`) | **Đã ký Cổng 2** — `bo-dung-chung-nhan-chuoi` |
| ① | Xương sống + định dạng ngày/số | **Chờ chữ ký ở Cổng 2** — `tieng-viet-cho-crm` |
| ③a | Nhãn ứng dụng, lát ba luồng (`apps/app`) | **16/16 máy đạt sau S4 vòng 6.** Chờ hai chữ ký, và chờ vòng 7 vì mã đổi sau khi ghim |
| ④ | Câu máy chủ trả về | chưa mở |
| ⑤ | Chữ tác nhân sinh ra | chưa mở |

### Vòng ① — còn đúng một việc của người

S4 chạy lại ngày 2026-09-02. Chín tiêu chí đạt có bằng chứng hai chiều. Người đã
chọn ở Cổng 2: **bốn chuỗi còn lại chuyển sang vòng ③, vòng ① ký với giới hạn đã
khai** (`decisions.jsonl`, `d-2026-09-02T10:40:00Z-cong2v1`).

**Chữ ký chưa ghi.** Lệnh của người, một lượt gõ:

```
/acceptance-gate:signoff tieng-viet-cho-crm
```

Câu gộp còn cần lời của người cho hai mục **chưa chắc**, và máy không điền hộ:

- **E9** — tiêu đề cột dài bị cắt kèm dấu ba chấm ở màn hẹp. Câu chữ AC-9 cấm
  tiêu đề bị cắt; AC-7 của vòng ② mà người đã ký lại quy định cắt thì phải cắt
  thế nào. Hai lời hứa nghịch nhau. Đo được: **0 chỗ cắt trần** ở mọi khổ, mọi
  thứ tiếng; 4 chỗ cắt kèm ba chấm ở 768px, và tiếng Anh cùng khổ cũng cắt 2.
- **E12** — mười nhãn cột. Hai vòng hội đồng, năm nhãn đã đổi, hội đồng vẫn chia
  và hai hướng sửa họ đề nghị ngược nhau.

Sau khi ký: `PRODUCT-MAP.md` được vẽ lại, và vòng ③ mở được.

### Vòng ③a — sáu vòng S4, nay 16/16 máy đạt, chờ hai chữ ký

Lát khoanh bằng đồ thị nhập từ ba luồng của ngưỡng UAT: **96 file**, không phải
177 — phần còn lại đi lát ③b (Cài đặt) và ③c (trang khác).

| Vòng | Máy đỏ | Hội đồng E14 | Phát hiện trong-hợp-đồng |
| --- | --- | --- | --- |
| 1 | E1 E10 E13 E15 | UNCERTAIN | 7 |
| 2 | E13 | FAIL | 5 |
| 3 | — | UNCERTAIN | 2 |
| 4 | — (một lượt BLOCKED oan) | PASS | 6 |
| 5 | E13 | PASS | 6 |
| 6 | **không cái nào** | UNCERTAIN | 1 |

**Bằng chứng vòng 6 ghim `422ea73`, nhưng HEAD nay là `68b8fb5`** — mã đổi sau
khi ghim, nên lưới kiểm hiệu lực sẽ gọi hồ sơ là STALE. Vòng 7 phải chạy trước
khi trình Cổng 2.

Chạy vòng 7 (bốn bước, không bước nào bỏ được):

```
node ~/.claude/plugins/marketplaces/acceptance-gate-kit/feature-loop/scripts/s4-args.mjs \
  --slug nhan-ung-dung-noi-tieng-viet --root . --out <ws>/s4-args.json --no-carry
```

1. Máy chủ dev phải chạy TỪ WORKTREE, cổng 3000 và 3001. Executor không ghim
   cổng nên mặc định trỏ `localhost:3000`.
2. Cây phải SẠCH trước khi sinh args — args ghim một sha, ghim vào cây bẩn là
   hồ sơ nói dối.
3. Bộ sinh args đếm vòng từ mục `## Iterations` của `evidence-report.md`, mà
   workflow **không tự ghi vòng của chính nó**. Ghi tay dòng `Round N:` trước,
   không thì nó mint trùng số vòng và đụng `run_id` đã có.
4. Gọi `Workflow` với `scriptPath` tuyệt đối tới `acceptance-verify.js`, args
   nguyên văn từ file vừa sinh. **Không gõ tay một chữ nào trong args** — phiên
   này đã một lần tự sửa ba đoạn `expected` và phải dừng lượt chạy để đưa chúng
   về `evals.yaml`.

**Hai việc của người, không việc nào máy làm hộ được:**

1. Duyệt bản thu phạm vi E13 và E14: `contract.md` có `amended_by:` để trống.
   Bảng đối chiếu ở mục "Hai lời hứa thu lại".
2. Ký vòng: `/acceptance-gate:signoff nhan-ung-dung-noi-tieng-viet`.

### Lớp lỗi KHÔNG thước nào bắt — chỗ đáng đọc nhất file này

Vòng 6 đạt 16/16 tiêu chí máy **và vẫn còn 18 chỗ hiện tiếng Anh** cho người đọc
tiếng Việt: nút của màn trống trên hồ sơ, cả bảng Trường, hộp thoại Bảng xem,
nút "Show older". Sáu chỗ đã có khoá sẵn, dùng đúng cách đó tám chục dòng trong
cùng file.

Vì sao không thước nào thấy: **bốn chân vẽ chỉ thấy bề mặt chúng mở**, và chặn
khoá-chết chỉ đọc kho chuỗi, không đọc JSX. Hai hướng của cùng một lỗ —

- *khoá không có chỗ gọi* → chặn khoá-chết bắt được (đã có).
- *chữ cứng trong JSX lẽ ra là khoá* → **không gì bắt được**.

18 chỗ đó do một người đọc diff tìm ra. Vòng sau cũng vậy, trừ khi ai đó dựng
được phép đo cho hướng thứ hai.

Con số bổ trợ, cùng câu chuyện: phép đột biến đo được **265 khoá nằm ngoài tầm
với** của bốn chân (hộp thoại tạo, màn trống, màn lưu trữ, thao tác hàng loạt).
Danh sách đủ ở `rang/dot-bien-sot.txt`.

### Giàn đo của lát ③a — trạng thái sau khi sửa

`rang/dot-bien.mjs` — trả từng khoá về tiếng Anh trên máy chủ thật.

- Bắt **cả vùng giá trị** (từ dòng `khoa:` tới dòng đóng bằng dấu phẩy), nên
  khoá giá trị-hàm và chuỗi-nhiều-dòng cũng đảo được. Bản cũ chỉ khớp
  `khoa: "một dòng",` và mù với **93 khoá, 17%**, không khai ở đâu.
- Kiểm bằng cách **đọc lại file sau khi ghi**, không đoán số dòng git đếm.
- Ba sổ, ba nghĩa khác nhau: *bắt được* · *mù* (vẽ ra mà không bắt) ·
  *không quy kết được* (giá trị quá ngắn hoặc toàn biến, không đủ căn cứ nói
  bốn chân có vẽ ra hay không). Chỉ hai sổ đầu vào mẫu số ngưỡng.
- Từ chối `0/0` là đạt.
- Bắt SIGINT/SIGTERM/SIGHUP và lỗi không bắt, trả năm kho chuỗi về nguyên trạng
  trước khi thoát. Đã kiểm bằng cách giết một lượt chạy thật ở giây 230.

Số hiện tại: **bắt 240/240 khoa vẽ ra (100%), mù 0**, trên nền 519 khoá đảo
được / 538 khoá có cả hai bản. 17 khoá giống hệt nhau ở hai bản (`Email`, `URL`,
`Website`, `LinkedIn`, `GitHub`, `X`) được gọi tên chứ không bỏ im.

`rang/kiem-ban-dich.mjs` — đối chiếu bảng dịch **hai chiều** (kho→bảng và
bảng→kho), khớp bằng đường đầy đủ hoặc hai đoạn cuối, không khớp hậu tố bất kỳ.
Bản lỏng trước đó che 15 khoá dùng chung một dòng tên `title`, 12 dòng tả khoá
đã biến mất, và hai giai đoạn thoả thuận ghi sai tên enum.

`apps/app/test/messages-guard.spec.ts` — chặn khoá-chết buộc lá đi kèm tên cha
và **mang theo chiều đỏ của chính nó**. Bản cũ khớp theo tên lá trên một khối
văn bản gộp nên `.name`, `.title`, `.email` làm gần như mọi khoá trông còn sống:
nó **không thể đỏ**.

## Luật đo — bốn luật, mỗi luật một lần trả giá

1. **Không dựng máy quét mã để chứng minh "không còn chữ tiếng Anh".** Một danh
   sách hình dạng chuỗi không chứng minh được sự vắng mặt. Dựng vật thật hai
   lần, tiếng Anh và tiếng Việt, rồi so chữ người đọc thấy.
2. **Trước khi tin một con số: phá vật thật, xem phép đo có đỏ không, VÀ kiểm
   rằng cú phá thật sự đổi được vật.** Một phép đo chỉ xanh được mà không đỏ
   được thì nó không đo gì.
3. **Danh sách trung tính phải sinh ra, không viết tay.** Vòng ① sinh 128 giá trị
   từ máy chủ: dữ liệu qua tRPC, chữ viết tắt bằng chính hàm của sản phẩm, ngày
   bằng chính bộ định dạng của sản phẩm.
4. **Mọi giá trị tiếng Việt phải mang dấu tiếng Việt** — chặn lối dịch một khoá
   thành một chuỗi tiếng Anh KHÁC.

### Ba cái thước hỏng trong phiên 2026-09-02, cùng một họ

Cả ba **xanh được mà chưa từng chứng minh đỏ được**:

- **Đếm theo tập hợp chuỗi phân biệt.** Trả `headers.archived` về `"Archived"`
  thì nó trùng nút `Archived` đã có trên màn, tập hợp không đổi, phép đo báo
  XANH. → Đếm **số lần xuất hiện**, không đếm số chuỗi khác nhau.
- **Đọc `box-shadow` để biết có vòng tiêu điểm.** Giá trị đọc được trong suốt
  hoàn toàn. → So **điểm ảnh** trước và sau khi có tiêu điểm.
- **Chân định dạng chỉ grep vùng KHAI CỨNG.** Nó mù với `Intl.DateTimeFormat(undefined, …)`,
  nên màn công ty in ngày tiếng Anh suốt một vòng trong khi AC-8 được chấm ĐẠT.
  → Đếm mọi chỗ dựng `Intl.*` **không truyền vùng nào**.

### Lời chấm của hội đồng phải đo lại, không tin thẳng

Ba lời chấm nặng liên tiếp về chữ **bị cắt** đều SAI: `Hoạt động cuối` không cắt
ra từ tục, `Phụ trách` không cắt, `Ngày tạo` hiện `Ngày t…` chứ không phải `N..`.
Chữ cắt bằng CSS **không nằm trong DOM**, nên người chấm đọc ảnh chỉ đoán. Đo
bằng cách dựng từng tiền tố rồi so bề rộng ô.

## Bẫy mới — đắt nhất phiên này

**Máy chủ dev ở `:3000`/`:3001` chạy từ kho gốc `/Users/manhphan/dev/crm`, không
phải từ cây làm việc.** Bốn lượt đo đầu đo nhầm cây. Hai cây tình cờ cùng commit
nên con số không sai, nhưng **đột biến không thể đỏ**: kịch bản sửa file ở cây
này trong khi máy chủ đọc file ở cây kia, và mọi khoá đều báo "lọt lưới".

Luật: **`ps ax | grep next` xem máy chủ chạy từ thư mục nào TRƯỚC khi tin bất kỳ
con số nào.** Cây làm việc thì dựng máy chủ riêng:

```
cd apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev
```

**Và: đừng để kịch bản đo khôi phục bằng `git checkout`.** Kịch bản đột biến của
vòng ① từng làm thế và **xoá mất bản sửa chưa commit** của phiên. Khôi phục bằng
nội dung đã chụp trong bộ nhớ.

### Bẫy của phiên 2026-09-03 — bốn cái, mỗi cái trả giá thật

**1. `git checkout --` để dọn cây sau khi chân đột biến chết.** Nó khôi phục về
HEAD chứ không về bản trước đột biến, và lần này **mất cả buổi chiều dịch**.
Dựng lại được chỉ vì `ban-dich.md` sinh sau khi thêm khoá nên giữ đủ 537 khoá
kèm hai thứ tiếng. Luật: **commit trước khi chạy chân đột biến**, và nếu cây bẩn
thì đọc `git status` xem cái gì bẩn trước khi đụng vào.

**2. Chân đột biến ghi đè năm file mã sản phẩm trong ~10 phút mỗi lượt.** Trong
cửa sổ đó, bốn cổng máy vẫn xanh vì bản tiếng Anh đúng kiểu. Commit lúc ấy là
đóng bản tiếng Anh vào lịch sử mà không gì báo. Nay chân đã bắt tín hiệu dừng,
nhưng **commit chủ động thì không gì chặn** — kiểm `git status` trước.

**3. `git status --porcelain` có output vẫn thoát 0.** Câu
`git status --porcelain <path> && echo SACH` in "SACH" **trong khi file đang bẩn**.
Phiên này đã đọc sai một lần đúng ở chỗ nguy hiểm nhất. Dùng `[ -z "$(...)" ]`.

**4. Trần thời gian của Bash là 600 giây, không phải giá trị truyền vào.** Chân
đột biến chạy ~20 phút nên **luôn phải chạy nền**, không chạy tiền cảnh.

### Hai lỗi của bộ kit — nên mở chip sang `~/dev/acceptance-gate-kit`

- **`runLogWriteFailed: true` ở cả sáu lượt.** Workflow không ghi được
  `run-log.jsonl` lẫn `evidence-report.md`; phiên này dựng lại bằng tay từ kết
  quả mỗi lần. Không làm thì vòng sau đếm sai số vòng.
- **Bộ đếm vòng đọc `## Iterations` nhưng workflow chỉ ghi lịch sử TRƯỚC vòng
  của nó**, không ghi vòng của chính nó. Phải ghi tay dòng `Round N:` sau mỗi
  lượt, không thì mint trùng số vòng và đụng `run_id` đã có.

## Nợ đã biết của lát ③a — chưa sửa, mỗi cái có tên

Xếp theo mức nặng. Bốn cái đầu do phiên 2026-09-03 gây ra khi vá lỗi khác.

| Chỗ | Chuyện gì |
| --- | --- |
| `apps/app/lib/social-links.ts:30` | Giấu khoá thông điệp (`"facts.pricing"`) trong trường `label: string` rồi tra bằng ép kiểu; gõ sai một ký tự thì in thẳng `facts.pricing` lên màn. Ba module anh em cùng vòng dùng trường `khoa` có kiểu. **Bị nêu sáu vòng liền.** |
| `packages/ui/src/components/carousel.tsx:57` | Mất `aria-roledescription` ở cả hai thứ tiếng và còn một `useMessages()` chết. `sortable-list.tsx:112` cũng xoá `roleDescription` thay vì dịch. **Trình đọc màn hình nghe được ít hơn trước vòng dịch.** biome bỏ qua thư mục đó. |
| `packages/ui/tsconfig.json:4` | `include: ["src"]` nên ~850 dòng test của `packages/ui` **nằm ngoài `bun run check-types`**; `jsdom` chỉ khai ở `package.json` gốc. Bật `["src","test"]` lên thì lộ hơn mười lỗi kiểu, phần lớn là fixture nặn theo bên đọc chứ không theo kiểu thật. |
| `.claude/launch.json` mục `dev` | Chạy `npm run dev` ở gốc — sai trình quản lý gói (kho dùng bun) và đúng lệnh mà `CLAUDE.md` nói không chạy được khi không có TTY. Mục `dev-dang-chay` (đính vào cổng 3000 sẵn có) mới là mục đúng. |
| `packages/ui/src/components/reasoning.tsx:17` | Mất nhãn mặc định, không có khoá thay: gọi không truyền `label` và không streaming thì nút mở ra rỗng. |
| `fields-list.tsx:338` và `:224` | Nhãn kiểu trường có hai nguồn: máy chủ tính `field.typeLabel` (luôn tiếng Anh) trong khi hộp sửa ngay cạnh hiện tiếng Việt. **Trong lát.** |
| `packages/ui/src/lib/format.ts:67` | `formatMoney`/`formatMoneyCompact` để tham số bắt buộc sau tham số có mặc định nên mặc định `"usd"` là mã chết. |
| Năm chỗ ghim `"en"` | `sales-dashboard.tsx:94,99,132` · `dashboard-summary.tsx:211` · `currency-settings.tsx:305`. Ngoài lát nên chữ vẫn tiếng Anh, nhưng ba chỗ đầu **có `locale` sống ngay trong file**. |
| `apps/app/lib/messages/companies.ts:122` | Khuôn khác bốn kho còn lại, không có `satisfies` nên lệch khoá không đỏ lúc biên dịch. |
| Định danh tiếng Việt trong mã sản phẩm | `BANG`, `khoa`, `kichBan`, `manh`, `con`, `MOC`, `NUT_TU`. Trái luật `CLAUDE.md`; `manh` và `con` không có nghĩa ở cả hai thứ tiếng. Nặng nhất ở `packages/ui` vì đó là nơi merge với kho hãng. |
| `translate="no"` | Mới áp cho đúng ô tên công ty; tên thoả thuận và tên cá nhân cùng vừa sửa thì không. |
| Sáu phát hiện về thước, vòng 5 | Fixture bảy giai đoạn gõ tay không round-trip từ enum máy chủ · E11 đếm hàng trong cơ sở dữ liệu chứ không đọc chữ trên màn · số facet là hằng viết tay · chặn hồ sơ đếm chính thứ nó vừa mở. |
| `_acceptance/config.yaml` | `ui_standards_skill` và `design_pass.ds_skill` trỏ vào `web-design-guidelines`, skill không tồn tại. |

## Ba thứ chặn, cần người quyết — không phải việc code

**B1 — Google OAuth.** `GOOGLE_CLIENT_ID`/`SECRET` rỗng, trang sign-in báo "No way
in yet", cả đội chưa vào được. Redirect URI
`http://localhost:3001/api/auth/callback/google`, consent screen để **Internal**
(`gmail.readonly` là restricted scope). `ALLOWED_SIGN_IN` đã mở cho `onemount.com`.

**B2 — Khoá model.** Không có `AI_GATEWAY_API_KEY`, agent trả "AI Gateway received
no credentials". Phần lớn việc AI Elements chưa kiểm chứng bằng mắt vì lý do này.

**B3 — Câu hỏi pháp lý về Geist.** `packages/ui/src/styles/geist.css` là token
trích từ CSS đã biên dịch của Vercel. `@vercel/geistcn` không có trên npm, không
có repo công khai — **không tìm thấy giấy phép cho phép dùng lại**. Cần người có
thẩm quyền xác nhận trước khi ra khỏi môi trường nội bộ. Đường lùi: giữ cấu trúc
token, thay giá trị bằng thang màu tự dựng.

## Hàng đợi feature-loop

Chạy bằng `/feature-loop:feature-loop <mô tả>`. Cổng nghiệm thu **đã chạy thật 13
lần** — không còn là đường chưa ai đi.

1. **Lát ③a nhãn ứng dụng** — T2 — đã chạy sáu vòng S4, xem mục trên. Việc còn
   lại: chạy vòng 7 trên HEAD, rồi hai chữ ký của người.
2. **`prerender-mat-vi-doc-cookie`** — T2 — **mới, mức cao.** Đọc `cookies()` ở
   layout gốc làm **mọi tuyến** mất khả năng dựng sẵn, không riêng trang đăng
   nhập như hợp đồng vòng ① khai. Máy chủ dev in một lỗi mỗi lượt tải trang, trỏ
   `apps/app/app/layout.tsx:47`. Cần đo giá thật rồi chọn giữa bọc vùng chờ và
   chấp nhận giá.
3. **`he-icon-mot-moi`** — T2 — `components.json` khai `lucide` nhưng thực tế 73
   file Carbon / 28 lucide. Cần người chọn ở Cổng Đáng.
4. **`eve-stream-sang-ui-message`** — T2 — rủi ro cao nhất. Đọc `docs/agent-panel.md`
   trước khi chạm. **Không thay eve** — nó là thứ cho agent bền, lịch chạy, sandbox.
5. **`transcript-dung-tron-ai-elements`** — T2 — phụ thuộc mục 4 và B2.
6. **`geist-kich-thuoc-dieu-khien`** — T2. Geist **không công bố thang bo góc** —
   đừng đi tìm cái không tồn tại.
7. **`ban-chay-cho-doi`** — T3 — mục lớn nhất, phụ thuộc B1.
8. **`nhip-dong-bo-upstream`** — T1 — upstream chạy nhanh; một lần pull mang về 62
   commit. Bốn file là mặt va chạm: `.oxlintrc.json`, `package.json`, `bun.lock`,
   `packages/ui/src/styles/globals.css`.
9. **`oxlint-thu-hep-mien-tru`** — T1 — `.oxlintrc.json` bỏ qua cả `lib/**` và
   `scripts/**`; mọi script viết sau này cũng thoát luật.
10. **`du-lieu-thu-thieu-hai-trang-thai`** — T1 — 0 trên 15 công ty thiếu người
    phụ trách, 0 có hoạt động. Hai khoá bản dịch vì thế **không có phép đo nào
    che**, và chữ thời gian tương đối cũng không.

Ngoài hàng đợi, cần **chip riêng**:

- `packages/ui/src/components/logo.tsx:10` mang `aria-label="Comp AI Logo"` —
  trình đọc màn hình đọc tên hãng cũ cho nhân viên OneHub.
- **`CONTEXT.md` viết cả `thoả` lẫn `thỏa`** cho cùng một từ. Chọn một.
- **`CONTEXT.md` chưa có mục từ cho "bổ sung dữ liệu"** — một năng lực sản phẩm
  đang hiện trên màn mà từ điển chưa định nghĩa.

Đã mở chip sang `~/dev/acceptance-gate-kit`: thẻ Cổng 2 gặp eval trượt là khuyên
"máy quay lại sửa code" kể cả khi phần việc còn lại thuộc vòng sau, và ở trạng
thái đó nó **nuốt luôn** các mục cần người quyết cùng khối "Ngoài hợp đồng".

## Đã kiểm / chưa kiểm

Xanh cuối phiên, ép chạy không cache: `check-types` 13/13 · `lint` 9/9 ·
`lint:slop` sạch · `test` 11/11.

Đã đo tận mắt trên máy chủ dựng từ cây làm việc: năm ca phân giải ngôn ngữ; bề
rộng và chữ-thật-hiện-ra của mọi tiêu đề cột ở 768/1024/1280/1440/1920px, hai thứ
tiếng; 15 ngày in đúng quy ước Việt trong lượt vẽ đầu của máy chủ; vòng tiêu điểm
so bằng điểm ảnh; bốn trạng thái màn trước đây không phép đo nào chạm (cột ẩn,
màn lưu trữ, bảng rỗng, mọi menu mở kể cả menu con).

**Chưa kiểm:** trình đọc màn hình thật (NVDA/JAWS/VoiceOver). Năm chỗ gọi
`DataTable` ngoài màn công ty. Kích thước gói sau khi ba component thành client
component. Tên pháp nhân thật 40–60 ký tự — dữ liệu thử dài nhất là "Pennylane".

## Bẫy còn đúng

- `bun run dev` ở gốc **không chạy trong phiên không có TTY**. Chạy từng app:
  `apps/app` 3000, `apps/api` 3001, `apps/agent` 2000.
- Đăng nhập không cần OAuth: `cd apps/api && bun run dev:session <email>`.
- Đẩy lên `origin` cần `http.version HTTP/1.1` (đã đặt trong git config kho).
  HTTP/2 trả 400. `pre-push` chạy `check-types`, `lint`, `lint:slop`, `test`.
- **Khung trình duyệt ẩn thì mọi bề rộng trả về 0** và ảnh chụp vô dụng. Cột bị
  ẩn theo bề rộng cũng trả 0 — lọc chúng ra trước khi đếm "cắt trần".
- `bun run test` chạy **song song** có lượt đỏ ở `api#test`; chạy tuần tự
  (`--concurrency=1`) thì xanh. Nhiều gói dùng chung một cơ sở dữ liệu thử.
- `agent#test` đỏ ở `retireExhausted` khi cơ sở dữ liệu còn hàng `AgentTask` của
  một lượt chạy bị cắt ngang. **Không phải test phập phù** (issue `#195` nói sai).
  `bun run db:test` cho sạch rồi mới tin màu đỏ.
- Bản handoff 2026-08-31 bảo tự export khoá Google giả và tự nạp `.env` cho
  `db:test`. **Cả hai đã vá 2026-09-01 và cách lách cũ nay sai.**
- CLI `ai-elements` bỏ qua cả cờ `--help` và cài thẳng toàn bộ. Lấy từ
  `https://registry.ai-sdk.dev/<tên>.json` và tự ghi file.
- `PRODUCT-MAP.md` do máy vẽ lại mỗi lần một người ký một cổng. Sửa tay là làm hồ
  sơ lệch, và `--check` bắt. Hai trạng thái hồ sơ dễ sai: `status` của hợp đồng
  chỉ nhận `draft|approved|implemented|verified|signed-off|machine-cleared`, và
  `evidence-report.md` **bắt buộc có frontmatter kèm `verdict`**.
- Thẻ Cổng 2 đọc `evidence-report.md` bằng **khuôn máy**: bảng phải là
  `| E6 | AC-6 | ui-check | FAIL |` với verdict `PASS`/`FAIL`/`UNCERTAIN`, và
  mỗi eval phải có một khối `- eval: <id>`. Viết bảng bằng chữ người thì thẻ
  không thấy mục nào.
