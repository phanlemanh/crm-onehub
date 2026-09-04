# Handoff — nhánh `onehub`

Viết lại rạng sáng **2026-09-04**. Phiên trước dựng xong môi trường chạy được:
đăng nhập Google, khoá model, tác nhân, khoá cron, kho ảnh, tỷ giá thật. Rồi
quay lại lát ③a và tìm ra rằng thứ làm nó đỏ mấy vòng liền **không phải lỗi sản
phẩm**.

Đọc ba mục trước khi làm bất cứ việc gì: "Đứng ở cây nào", "Bẫy", và "Lớp lỗi
không thước nào bắt".

## Đứng ở cây nào — đọc mục này trước

Ba cây, và chúng nhích khác nhau **trong cùng một phiên**:

| Cây | Nhánh | Vai |
| --- | --- | --- |
| `/Users/manhphan/dev/crm` | `onehub` | Kho gốc. **Máy chủ dev 3000/3001/2000 chạy từ đây.** `.env` chỉ sống ở đây |
| `.claude/worktrees/exciting-tharp-571c02` | `claude/elated-ptolemy-dc8eb1` | Cây làm việc của phiên |
| `/private/var/…/agk-baseline` | detached | Cây nền của bộ kit, đừng đụng |

**Trong phiên 2026-09-03 có ít nhất hai phiên máy cùng commit vào `onehub`.** Nó
đi từ `7c2e498` lên `dbc8e37` trong lúc phiên này làm việc ở worktree. Hai commit
đó (`dc70600`, `dbc8e37`) không đụng file nào phiên này sửa, nhưng lần sau không
chắc may thế.

**Bản vá `68bb5f8` mới nhất CHƯA lên `onehub`** — nó nằm trên nhánh worktree.
Việc đầu tiên của phiên sau là quyết đưa nó sang, hoặc rebase worktree lên
`dbc8e37`.

`onehub` giờ hơn `origin` **82 commit**. Chưa ai đẩy. Đừng đẩy khi chưa hỏi.

Luật: `git worktree list`, rồi xem máy chủ dev chạy từ thư mục nào, **trước khi
tin handoff hay tin một con số**. Bản handoff mới nhất có thể không nằm trên
nhánh mình đang đứng.

## Môi trường: đã cắm gì, còn thiếu gì

Hai thứ chặn B1 và B2 của bản handoff cũ **đã gỡ xong**. `.env` không vào git nên
danh sách này là nơi duy nhất ghi lại.

| Khoá | Trạng thái |
| --- | --- |
| `GOOGLE_CLIENT_ID`/`SECRET` | **Xong.** Client "OneHub CRM local", consent screen **External / Testing** |
| `AI_GATEWAY_API_KEY` | **Xong.** Khoá `onehub-crm-local`, trần bám ngân sách team ($20) |
| `CRON_SECRET` | **Xong.** Sinh bằng `openssl rand -base64 32` |
| `BLOB_READ_WRITE_TOKEN` | **Xong.** Kho `onehub-crm-blob`, **Public** |
| `contextDevApiKey` | **Vẫn là chuỗi giả** `ctx-local-placeholder` |
| `PERPLEXITY_API_KEY` · `GITHUB_TOKEN` | Thiếu |
| `SLACK_CLIENT_ID`/`SECRET` | Thiếu, `slackInstallation` 0 hàng |

Chi tiết đắt giá:

- **Đăng nhập Google chạy thật.** `account` có hàng `providerId=google` cho
  `phanlemanh@gmail.com`, đủ `gmail.readonly` + `calendar.readonly` + refresh
  token. Địa chỉ quay về là cổng **3001**, không phải 3000 — Better Auth phục vụ
  `/api/auth/*` ở `API_URL`.
- **`ALLOWED_SIGN_IN` chỉ liệt kê ĐỊA CHỈ, cố ý.** `auth.ts` đặt
  `google.hd = allowList().domains[0]`, nên thêm mục domain là Google khoá ô
  email vào đuôi đó và chặn gmail trước khi CRM kịp xét. `hd` chỉ nhận một
  domain: không thể vừa mở `onemount.com` vừa cho gmail vào.
- **Trạng thái Testing làm refresh token hết hạn sau 7 ngày.** Khoảng 2026-09-10
  đồng bộ thư và lịch sẽ đứng; đăng nhập lại là chạy tiếp. Đưa lên Production thì
  phải qua thẩm định OAuth cộng CASA hằng năm vì `gmail.readonly` là restricted
  scope — không đáng cho máy cá nhân.
- **Kho Blob phải là Public.** `packages/db/src/blob.ts:54` ghi `access: "public"`
  và `next.config.ts` chỉ cho phép host `**.blob.vercel-storage.com`. Hộp thoại
  của Vercel mặc định **Private (Recommended)** — lấy mặc định là mọi logo 404 âm
  thầm.
- **Model mặc định nay là `google/gemini-3.7-flash`**, đặt qua Cài đặt → Chung
  (hàng `appSetting`, không phải biến môi trường). Rẻ hơn `zai/glm-5.2-fast`:
  $0,75 vào · $3,75 ra mỗi 1M so với $2,1 · $6,6.
- **Một phiên nghiên cứu tốn ~$0,19.** Dùng số này ước lượng trước khi thả hàng
  đợi: 71 phiên là ~$13,50.

### Khoá Context.dev: THAY, đừng xoá

Chuỗi giả làm tác nhân in `on` cho hai năng lực nó không có — log khởi động nói
thẳng "Company brand data: on", "LinkedIn: on". Gọi ra sẽ trượt.

Nhưng **xoá nó là khoá cả ứng dụng**: `apps/app/lib/onboarding.ts:74` trả
`required` khi không có khoá, đẩy mọi người vào `/onboarding/research` — cửa đó
không có nút bỏ qua. Khoá thật lấy miễn phí ở context.dev (500 tín dụng với email
công ty, không cần thẻ), dán ở **Cài đặt → Chung**.

## Lát ③a — cái đỏ hoá ra là lỗi của thước

Vòng 8 trả BLOCKED với lý do "máy chủ API không chạy". **Lý do đó sai.** Hai máy
chủ đang sống, cùng PID. Nguyên nhân thật: năm chân đo ghim slug `crm` trong khi
workspace của kho là `onehub`, `curl` không theo redirect nên đọc một cái 307
rỗng và gọi đó là ba màn hỏng. Đã vá ở `7c2e498` — slug nay suy từ ứng dụng đang
chạy, và slug không giải được là một lời từ chối có tên chứ không phải một phép
đo.

Chạy trọn bộ 14 chân đo sau bản vá: **11 xanh / 3 đỏ**. Rồi truy ba cái đỏ:

**① `ho-so` — dương tính giả, đã đóng ở `68bb5f8`.** Bốn "chuỗi tiếng Anh" là
*"Intro to your implementation lead"* và *"Send the security questionnaire"*.
Chúng sống **duy nhất** ở `packages/db/prisma/seed.ts:327,346` — chủ đề công
việc, thứ một nhân viên tự gõ. Không dòng nào trong `apps/` hay `packages/ui`
khoá cứng chúng.

`CLAUDE.md` đã viết sẵn lời giải: *dữ liệu người nhập không dịch, và đánh dấu để
trình duyệt không tự dịch*. Quy ước đó tồn tại ở **đúng hai chỗ** — ô tên công ty
(`companies-table.tsx:63`) và nhãn phạm vi tác nhân (`agent-scope-badges.tsx:35`)
— và không chỗ nào khác. Dòng thời gian, nơi lời của người dùng thật sự chạm màn,
không mang dấu nào, và **không thước nào biết quy ước ấy tồn tại**, nên không gì
báo được rằng nó đang được áp cho một bề mặt trên ba.

Nay `timeline-entry.tsx` đánh dấu cả hai chỗ: dòng chủ đề, **chỉ khi nó thật là
chủ đề** (khi nó là đổi giai đoạn thì đó là nhãn của mình và phải dịch), và phần
thân. Thước bỏ qua mọi nhánh mang dấu, ở cả lượt quét chữ lẫn lượt quét thuộc
tính — quy ước từ một thói quen thành một thứ đo được.

Chứng hai chiều trên cùng fixture: có dấu → `còn lại 0`; gỡ dấu → `còn lại 4`,
nêu đích danh hai chuỗi.

**② `dot-bien` — vẫn đỏ.** Thước tự khai: *"không quy kết được khoá nào. Phép quy
kết hỏng, không phải sản phẩm sắc."* Chưa sửa.

**③ `khong-may-quet` — vẫn đỏ, và đây là chỗ đáng đọc nhất.** Nó báo
`chu-cung-jsx.mjs` chỉ đọc mã, không chạm sản phẩm đang chạy. Cùng lượt chạy đó,
`chu-cung-jsx.mjs` tự báo **XANH "không chỗ nào khoá cứng"** trong khi thước
chạm-sản-phẩm thấy bốn chuỗi trên màn. Hai thước, một câu hỏi, hai câu trả lời
ngược nhau — và cái đọc mã là cái nói sai.

Đó là bằng chứng sống cho chính luật mà `khong-may-quet` tồn tại để giữ: **đọc
JSX không thấy được thứ sản phẩm bày ra.** Ba đường: cho `chu-cung-jsx` chạm sản
phẩm · bỏ nó bằng entry descope có tên · giữ như ngoại lệ có lý do viết ra.

### Hệ quả lan sang vòng ①

`tieng-viet-cho-crm` đang REJECT với lý do E6: *"còn bốn chuỗi tiếng Anh, tất cả
khoá cứng tại chỗ gọi trong `apps/app`"*. Câu đó **sai về sự kiện** — chúng không
ở `apps/app`. Cùng bốn chuỗi, cùng một dương tính giả. Bản vá `68bb5f8` nhiều
khả năng gỡ luôn E6, nhưng **phải chạy lại mới biết**.

Hai chặn còn lại của vòng ① vẫn cần người chọn, máy không điền hộ:

- **E9** — tiêu đề cột dài cắt kèm ba chấm ở màn hẹp. AC-9 cấm cắt; AC-7 của
  vòng ② mà người đã ký lại quy định cắt thì phải cắt thế nào. Hai lời hứa nghịch
  nhau. Đo được: 0 chỗ cắt trần ở mọi khổ, mọi thứ tiếng.
- **E12** — mười nhãn cột, hai vòng hội đồng, vẫn chia, hai hướng sửa ngược nhau.

Chữ ký, một lượt gõ: `/acceptance-gate:signoff tieng-viet-cho-crm`

### Điều khoản thôi-vá đang áp

Lát ③a đã ở **vòng 8**, và lớp lỗi lặp lại ba vòng liền là **đo nhầm vật**: vòng
4 đọc lỗi trần thành ECONNREFUSED · vòng 8 đọc slug `crm` thành ba màn hỏng ·
hôm nay đọc dữ liệu mẫu thành nhãn chưa dịch. Cùng một tên lớp lỗi, khác file,
khác dòng.

Vì vậy phiên trước **không tung vòng 9**. Người đã chọn đường "sửa thước, giữ hợp
đồng". Một trong ba cái đỏ đã đóng; còn hai.

## Lớp lỗi KHÔNG thước nào bắt

Vòng 6 đạt 16/16 tiêu chí máy **và vẫn còn 18 chỗ hiện tiếng Anh**: nút màn trống
trên hồ sơ, cả bảng Trường, hộp thoại Bảng xem, nút "Show older". Sáu chỗ đã có
khoá sẵn, dùng đúng cách đó tám chục dòng trong cùng file.

Vì sao mù: bốn chân vẽ chỉ thấy bề mặt chúng mở, còn chặn khoá-chết chỉ đọc kho
chuỗi. Hai hướng của cùng một lỗ —

- *khoá không có chỗ gọi* → chặn khoá-chết bắt được.
- *chữ cứng trong JSX lẽ ra là khoá* → `chu-cung-jsx.mjs` dựng cho hướng này,
  nhưng nó đọc mã nên **vẫn mù với thứ sản phẩm thật bày ra** (xem ③ ở trên).

18 chỗ đó do một người đọc diff tìm ra. Phép đột biến đo được **265 khoá nằm
ngoài tầm với** của bốn chân; danh sách ở `rang/dot-bien-sot.txt`.

## Luật đo — năm luật, mỗi luật một lần trả giá

1. **Không dựng máy quét mã để chứng minh "không còn chữ tiếng Anh".** Một danh
   sách hình dạng chuỗi không chứng minh được sự vắng mặt. Dựng vật thật hai lần,
   hai thứ tiếng, rồi so chữ người đọc thấy.
2. **Trước khi tin một con số: phá vật thật, xem phép đo có đỏ không, VÀ kiểm
   rằng cú phá thật sự đổi được vật.** Xanh mà chưa từng đỏ thì không đo gì.
3. **Danh sách trung tính phải sinh ra, không viết tay.**
4. **Mọi giá trị tiếng Việt phải mang dấu tiếng Việt** — chặn lối dịch một khoá
   thành một chuỗi tiếng Anh KHÁC.
5. **Mới: phân biệt nhãn của mình với chữ của người dùng trước khi chấm.** Một
   thước quét chữ trên trang mà không trừ dữ liệu người nhập sẽ bắt đúng thứ luật
   kho bảo đừng đụng, và vòng sau sẽ đi dịch dữ liệu của khách. Dấu để trừ là
   `translate="no"`; đặt ở nơi dữ liệu chạm màn, không đặt ở nhãn.

### Lời chấm của hội đồng phải đo lại, không tin thẳng

Ba lời chấm nặng liên tiếp về chữ **bị cắt** đều SAI. Chữ cắt bằng CSS **không
nằm trong DOM**, nên người chấm đọc ảnh chỉ đoán. Đo bằng cách dựng từng tiền tố
rồi so bề rộng ô.

## Bẫy

**1. Máy chủ ở `:3000` phục vụ mã của KHO GỐC.** Sửa trong worktree mà đo ở 3000
là đo cây khác. Dựng máy chủ riêng cho cây làm việc:

```
cd <worktree>/apps/app && PORT=3100 API_URL=http://localhost:3001 APP_URL=http://localhost:3100 bun run dev
```

rồi chạy thước với `APP_URL=http://localhost:3100`, **từ gốc worktree** — mọi
`rang/*.mjs` dùng đường dẫn tương đối gốc kho. `.env` trong worktree là symlink
về kho gốc nên không cần chép.

**2. `docker exec` thiếu cờ `-i` thì heredoc SQL không tới psql, và lệnh im lặng
không chạy gì.** Phiên trước tưởng đã xoá xong một giao dịch, kiểm lại thấy số
liệu y nguyên. Luôn `docker exec -i`, và luôn đọc lại số sau khi ghi.

**3. Chân đo gieo lại cơ sở dữ liệu.** Sau khi dọn sạch dữ liệu mẫu chiều
2026-09-03, tới rạng sáng 04 nó **đầy trở lại**: 18 công ty, 52 liên hệ, 27 thoả
thuận, đúng bộ seed với ngày lùi. Người dùng và tên workspace thì vẫn sạch. Commit
`d1dddcb` nói thẳng trong tiêu đề: *"reseed the tree it reads"*. Nghĩa là **trạng
thái CRM sạch không sống qua một lượt chạy thước** — đừng dựa vào nó, và đừng
tưởng ai đó lén khôi phục.

**4. `git checkout --` để dọn cây sau khi chân đột biến chết** khôi phục về HEAD
chứ không về bản trước đột biến. Đã mất cả một buổi chiều dịch. Commit trước khi
chạy chân đột biến.

**5. `git status --porcelain` có output vẫn thoát 0.** `git status --porcelain <path> && echo SACH`
in "SACH" trong khi file đang bẩn. Dùng `[ -z "$(...)" ]`.

**6. Trần thời gian của Bash là 600 giây.** Chân đột biến chạy ~20 phút nên luôn
phải chạy nền. Bộ 14 chân đo của ③a chạy ~25 phút vì mỗi chân tự đăng nhập lại.

**7. `bun run dev` ở gốc không chạy trong phiên không có TTY.** Chạy từng app.
Và `npx` gãy với `EBADDEVENGINES` vì kho khai `packageManager: bun` — dùng `bunx`.

**8. `vercel env pull` ghi `.env.local`, và `.env.local` thắng `.env`.** Đừng
chạy. Cần kéo thì kéo vào file trơ: `vercel env pull .env.vercel`.

**9. `agent#test` đỏ ở `retireExhausted`** khi cơ sở dữ liệu còn hàng `AgentTask`
của một lượt chạy bị cắt ngang. Không phải test phập phù. `bun run db:test` cho
sạch rồi mới tin màu đỏ.

**10. `bun run test` chạy song song có lượt đỏ ở `api#test`**; chạy tuần tự
(`--concurrency=1`) thì xanh. Nhiều gói dùng chung một cơ sở dữ liệu thử.

## Nợ đã biết — chưa sửa, mỗi cái có tên

| Chỗ | Chuyện gì |
| --- | --- |
| `packages/db/src/currency.ts` | `CURRENCY_LIST` có **11 đồng tiền và không có VND**. Đổi tiền báo cáo sang VND **không phải việc cấu hình** — phải sửa mã, chạm vùng tiền nong có `docs/currency.md` riêng. VND `minorUnits = 0`. Tỷ giá thật đã lấy về (10 đồng, `open.er-api.com`), chỉ thiếu VND trong danh sách |
| `.claude/launch.json` mục `dev` | Chạy `npm run dev` — sai trình quản lý gói và đúng lệnh không chạy được khi không có TTY. Mục `dev-dang-chay` mới là mục đúng |
| `turbo.json` gốc | Thiếu `AGENT_PORT` trong `globalPassThroughEnv`; nó được đọc ở `apps/agent/scripts/start.ts:4` và có trong `.env.example`. Turbo strict-env giấu im lặng |
| `.env.example` | Vắng `DATABASE_URL_UNPOOLED` dù mã đọc lúc dựng bản phát hành. Ngược lại `AUTH_TRUSTED_ORIGINS` khai trong `turbo.json` cả app lẫn api mà không mã nào đọc |
| Nhãn "Comp AI" | Còn ~20 chỗ người đọc được: tiêu đề mọi tab, chân trang, khung đăng nhập, 12 chỗ màn Slack, và `logo.tsx:10` mang `aria-label="Comp AI Logo"` |
| Màn đăng nhập và màn khai báo | Vẫn tiếng Anh. Lát ③a khoanh 96 file của ba luồng; hai màn đầu tiên một nhân viên mới nhìn thấy nằm ngoài |
| `apps/app/lib/social-links.ts:30` | Giấu khoá thông điệp trong trường `label: string` rồi tra bằng ép kiểu. **Bị nêu sáu vòng liền** |
| `packages/ui/src/components/carousel.tsx:57` | Mất `aria-roledescription` ở cả hai thứ tiếng, còn một `useMessages()` chết. `sortable-list.tsx:112` cũng xoá `roleDescription` thay vì dịch. **Trình đọc màn hình nghe được ít hơn trước vòng dịch** |
| `packages/ui/tsconfig.json:4` | `include: ["src"]` nên ~850 dòng test của `packages/ui` nằm ngoài `check-types` |
| `translate="no"` | Có ở đúng bốn chỗ: ô tên công ty, nhãn phạm vi tác nhân, và (mới) dòng chủ đề + phần thân của dòng thời gian. **Tên thoả thuận và tên cá nhân thì chưa** — cùng một loại dữ liệu, khác bề mặt |
| `fields-list.tsx:338`, `:224` | Nhãn kiểu trường hai nguồn: máy chủ tính `field.typeLabel` (luôn tiếng Anh) trong khi hộp sửa ngay cạnh hiện tiếng Việt |
| Năm chỗ ghim `"en"` | `sales-dashboard.tsx:94,99,132` · `dashboard-summary.tsx:211` · `currency-settings.tsx:305`. Ba chỗ đầu **có `locale` sống ngay trong file** |
| Định danh tiếng Việt trong mã sản phẩm | `BANG`, `khoa`, `kichBan`, `manh`, `con`, `MOC`, `NUT_TU`. Trái luật `CLAUDE.md`. Nặng nhất ở `packages/ui` — nơi merge với kho hãng |
| `_acceptance/config.yaml` | `ui_standards_skill` và `design_pass.ds_skill` trỏ `web-design-guidelines`, skill **không tồn tại trên đĩa** |

## Còn chặn, cần người quyết

**B3 — Câu hỏi pháp lý về Geist.** `packages/ui/src/styles/geist.css` là token
trích từ CSS đã biên dịch của Vercel. `@vercel/geistcn` không có trên npm, không
có repo công khai — **không tìm thấy giấy phép cho phép dùng lại**. Cần người có
thẩm quyền xác nhận trước khi ra khỏi môi trường nội bộ. Đường lùi: giữ cấu trúc
token, thay giá trị bằng thang màu tự dựng.

**B4 — Khoá Context.dev.** Xem mục môi trường. Miễn phí, hai phút, nhưng phải là
người tự tạo tài khoản.

**B5 — Theo dõi website.** Site ID `cmp_cfe816be`, tên miền `onehub.vn` đã khai.
Thẻ script **chưa dán lên trang thật**, và nó đang trỏ `http://localhost:3000/t/crm.js`
nên chỉ dùng được sau khi CRM có địa chỉ công khai.

## Hàng đợi

Chạy bằng `/feature-loop:feature-loop <mô tả>`. Cổng nghiệm thu đã chạy thật 13
lần — không còn là đường chưa ai đi.

1. **Gỡ nốt hai cái đỏ của lát ③a** — sửa phép quy kết của `dot-bien`; quyết số
   phận `chu-cung-jsx`. Rồi chạy lại trọn bộ, rồi hai chữ ký.
2. **Chạy lại vòng ①** để xem `68bb5f8` có gỡ E6 không, rồi người chọn E9 và E12.
3. **`them-vnd-vao-tien-te`** — T2 — xem mục nợ. Đọc `docs/currency.md` trước.
4. **`don-vet-cau-hinh`** — T2 nhỏ — `AGENT_PORT`, `.env.example`, `launch.json`.
5. **`prerender-mat-vi-doc-cookie`** — T2, mức cao. Đọc `cookies()` ở layout gốc
   làm **mọi tuyến** mất khả năng dựng sẵn. Máy chủ dev in một lỗi mỗi lượt tải
   trang, trỏ `apps/app/app/layout.tsx:47`.
6. **`he-icon-mot-moi`** — T2 — `components.json` khai `lucide` nhưng thực tế 73
   file Carbon / 28 lucide. Cần người chọn ở Cổng Đáng.
7. **`eve-stream-sang-ui-message`** — T2, rủi ro cao nhất. Đọc `docs/agent-panel.md`
   trước khi chạm. **Không thay eve** — nó là thứ cho agent bền, lịch chạy, sandbox.
8. **`transcript-dung-tron-ai-elements`** — T2 — phụ thuộc mục 7.
9. **`geist-kich-thuoc-dieu-khien`** — T2. Geist **không công bố thang bo góc** —
   đừng đi tìm cái không tồn tại.
10. **`ban-chay-cho-doi`** — T3 — mục lớn nhất. **Nay đã mở khoá**: nó phụ thuộc
    đăng nhập Google, mà đăng nhập Google đã chạy.

## Đã gửi lên hãng

PR `trycompai/crm#194` (vá `dev-session`) và issue `#195` — nay đã biết là **không
phải test phập phù**, xem bẫy số 9.
