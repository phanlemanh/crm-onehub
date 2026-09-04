# Handoff — nhánh `onehub`

Viết lại sáng **2026-09-04**. Phiên này gộp lại các dòng đã rẽ, và nhận một
**hướng mới từ người** làm đổi trọng số của gần như mọi thứ còn treo.

Đọc ba mục trước khi làm bất cứ việc gì: "Hướng đã chốt", "Đứng ở cây nào",
và "Bẫy".

## Hướng đã chốt — 2026-09-04

**Việt hoá nhanh, rồi triển khai cho đội OneHub dùng.** Sản phẩm nội bộ. Khi
phải chọn, chọn về phía **dọn dẹp · mở · nội bộ** — không phải về phía chặt hơn.

Bốn quyết định của người trong lượt này, và cái giá của mỗi cái:

| Chỗ | Người chọn | Nghĩa là |
| --- | --- | --- |
| Vòng `thuoc-cua-lat-3a-co-rang` | **Dừng ở 12/14**, khai giới hạn | E11 (bị công cụ giết ở mốc 600 giây) và E13 (hội đồng đề nghị FAIL) thành **giới hạn đã khai**, không phải việc phải đóng. Đủ chặt cho một công cụ nội bộ |
| Vòng ① — E9 | **Chấp nhận** cắt kèm ba chấm | AC-7 của vòng ② thắng AC-9 của vòng ①. Căn cứ: 0 chỗ cắt trần, và tiếng Anh cùng khổ cũng cắt |
| Vòng ① — E12 | **Chấp nhận** mười nhãn cột như đang có | Không chạy vòng sửa chữ thứ ba. Nhãn đưa ra cho đội dùng, chính họ nói lại ở Cổng Giá trị |
| Đợt tới | Bốn việc, theo thứ tự dưới | Dồn sang **chữ trên màn**, không dồn thêm vào giàn đo |

Hệ quả cho phiên sau: **đừng mở thêm vòng nào có chủ ngữ là giàn đo.** Giàn đo
đã đủ dùng. Mọi vòng mới phải đưa thêm chữ tiếng Việt ra trước mắt một nhân viên.

## Đứng ở cây nào — đọc mục này trước

Sáng 04/09 có **ba phiên máy chạy cùng lúc** trên cùng một kho, và ba dòng đã rẽ
nhau trong đêm. Đã gộp một, còn một.

| Cây | Nhánh | Trạng thái |
| --- | --- | --- |
| `/Users/manhphan/dev/crm` | `onehub` | Kho gốc. **Máy chủ dev 3000/3001/2000 chạy từ đây.** `.env` chỉ sống ở đây |
| `.claude/worktrees/exciting-tharp-571c02` | `claude/elated-ptolemy-dc8eb1` | **Đã gộp** vào `onehub` ở `3b27b44`, gộp sạch |
| `.claude/worktrees/sweet-leavitt-d88e70` | `claude/sweet-leavitt-d88e70` | **Đã gộp** vào `onehub` ở `e695eb3`, ba phút sau khi dòng này được viết là "chưa gộp" |
| `/private/var/…/agk-baseline` | detached | Cây nền của bộ kit, đừng đụng |

Khi gộp nốt `sweet-leavitt`: chỉ **một file** đụng nhau,
`_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs`, **4 cụm**. Ba cụm là
cộng thêm hai bên (dòng `import`, và hai chỗ dùng `KHONG_DOI`) — ghép là xong.
Cụm thứ tư ở đoạn đếm bề mặt (~dòng 727) khác luồng điều khiển: nhánh sweet thêm
"không tìm thấy khung màn thì thoát mã 2" (AC-2), `onehub` thêm phần báo cáo độ
lệch bản khai (AC-6). **Giữ cả hai.**

Dây lùi đã đặt: `luu-onehub-2026-09-04` · `luu-elated-2026-09-04` ·
`luu-sweet-2026-09-04`.

**`onehub` ĐÃ đẩy lên `origin`** lúc 05:00 sáng 04/09 (`ecae119`). Bản handoff
trước nói "hơn origin 82 commit, chưa ai đẩy" — sai. Lượt gộp `3b27b44` thì chưa
đẩy.

Luật, và lần này nó có giá thật: **`git worktree list`, `ListAgents`, rồi xem máy
chủ dev chạy từ thư mục nào — trước khi tin handoff hay tin một con số.** Ngày
03/09 mất một buổi vì hai phiên cùng dịch một bộ chuỗi. Ngày 04/09 suýt lặp lại
với ba phiên. Nếu bạn thấy một phiên khác đang mở trên cây mình định gộp, **nhắn
nó trước**, đừng gộp đè.

## Đợt tới — bốn việc, người đã chọn cả bốn

1. **Màn đăng nhập + màn khai báo.** Hai màn ĐẦU TIÊN một nhân viên mới nhìn
   thấy, và cả hai vẫn tiếng Anh. Chúng nằm **ngoài mọi lát đã khoanh** — không
   vòng nào đang phủ. Triển khai nội bộ mà cửa vào còn tiếng Anh thì công dịch
   bên trong mất một nửa ý nghĩa.
2. **Đổi nhãn "Comp AI" thành OneHub.** ~20 chỗ người đọc được: tiêu đề mọi tab,
   chân trang, khung đăng nhập, 12 chỗ màn Slack, và `logo.tsx:10` mang
   `aria-label="Comp AI Logo"`. Chạm cùng nhóm file với mục 1 — làm chung một đợt.
3. **Thêm VND vào danh sách tiền tệ.** `CURRENCY_LIST` có 11 đồng tiền và
   **không có VND**. Phải sửa mã, không phải cấu hình; `minorUnits = 0`. Đọc
   `docs/currency.md` trước. Tỷ giá thật đã lấy về, chỉ thiếu VND trong danh sách.
4. **Lát ③b — màn Cài đặt.** Phần còn lại theo kế hoạch đã khoanh.

Còn nợ **ba** chữ ký — và KHÔNG phải "một lượt gõ mỗi cái".

Ba hồ sơ đều mang verdict mà bộ dựng thẻ từ chối mời ký (`one_shot: null` với
REJECT/BLOCKED). Thứ biến chúng thành ký được là bốn quyết định ở mục "Hướng đã
chốt", và chúng vào hồ sơ bằng `human_override` từng mục, không bằng một vòng
chạy mới.

Bằng chứng đã được **ghim lại vào cây hiện tại** sáng 04/09 — trước đó ba hồ sơ
chứng cho cây cách đây 87 · 9 · 4 file mã. Một lượt làn máy, `run_id`
`repin-20260904T030617Z-17073`, bốn suite exit 0, 1263 bài không đỏ, `Cached: 0`.

```
/acceptance-gate:signoff tieng-viet-cho-crm
/acceptance-gate:signoff nhan-ung-dung-noi-tieng-viet
/acceptance-gate:signoff thuoc-cua-lat-3a-co-rang
```

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
| ~~`_acceptance/config.yaml`~~ | ~~`ui_standards_skill` trỏ skill không tồn tại~~ — **SAI, đã đóng 04/09.** `web-design-guidelines` có thật ở `.claude/skills/`, nạp được, và nó tải luật từ `raw.githubusercontent.com/vercel-labs/web-interface-guidelines` nên cần mạng lúc chạy |

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

## Hàng đợi còn lại

Thứ tự ưu tiên nằm ở mục **"Đợt tới"** đầu file, không nằm ở đây. Mục này là
phần tồn còn lại, sau khi hai mục đầu của hàng đợi cũ đã được người đóng ngày
04/09 — E9 và E12 chấp nhận, vòng thước dừng ở 12/14.

Chạy bằng `/feature-loop:feature-loop <mô tả>`. Cổng nghiệm thu đã chạy thật 13
lần — không còn là đường chưa ai đi.

1. **`them-vnd-vao-tien-te`** — T2 — xem mục nợ. Đọc `docs/currency.md` trước.
2. **`don-vet-cau-hinh`** — T2 nhỏ — `AGENT_PORT`, `.env.example`, `launch.json`.
3. **`prerender-mat-vi-doc-cookie`** — T2, mức cao. Đọc `cookies()` ở layout gốc
   làm **mọi tuyến** mất khả năng dựng sẵn. Máy chủ dev in một lỗi mỗi lượt tải
   trang, trỏ `apps/app/app/layout.tsx:47`.
4. **`he-icon-mot-moi`** — T2 — `components.json` khai `lucide` nhưng thực tế 73
   file Carbon / 28 lucide. Cần người chọn ở Cổng Đáng.
5. **`eve-stream-sang-ui-message`** — T2, rủi ro cao nhất. Đọc `docs/agent-panel.md`
   trước khi chạm. **Không thay eve** — nó là thứ cho agent bền, lịch chạy, sandbox.
6. **`transcript-dung-tron-ai-elements`** — T2 — phụ thuộc mục 5.
7. **`geist-kich-thuoc-dieu-khien`** — T2. Geist **không công bố thang bo góc** —
   đừng đi tìm cái không tồn tại.
8. **`ban-chay-cho-doi`** — T3 — mục lớn nhất. **Nay đã mở khoá**: nó phụ thuộc
   đăng nhập Google, mà đăng nhập Google đã chạy.

## Đã gửi lên hãng

PR `trycompai/crm#194` (vá `dev-session`) và issue `#195` — nay đã biết là **không
phải test phập phù**, xem bẫy số 9.
