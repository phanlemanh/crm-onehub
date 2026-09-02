# Handoff — nhánh `onehub`

Viết lại cuối phiên 2026-09-02. Bản trước (2026-09-01) đúng về luật đo nhưng
thiếu một cái bẫy đắt — xem "Bẫy mới" ở cuối. Đọc file này trước khi làm bất cứ
việc gì trong hàng đợi.

## Hiện trạng

- `origin` = `phanlemanh/crm-onehub` (riêng tư), nhánh làm việc `onehub`
- `upstream` = `trycompai/crm` (chỉ đọc, MIT) · `release` = bản gương, không sửa
- **27 commit chưa đẩy** lên `origin` tính đến cuối phiên này

Đã gửi lên hãng, đang mở: PR `trycompai/crm#194` (vá `dev-session`), issue `#195`
(nay đã biết là **không phải test phập phù** — xem mục bẫy).

## Việc tiếng Việt: năm vòng, đang ở đâu

`_acceptance/tieng-viet-cho-crm/opportunity.md` chốt năm vòng. Thứ tự đã đảo
ngày 2026-09-01: ② lên trước ①.

| Vòng | Vùng | Trạng thái |
| --- | --- | --- |
| ② | Bộ dựng chung (`packages/ui`) | **Đã ký Cổng 2** — `bo-dung-chung-nhan-chuoi` |
| ① | Xương sống + định dạng ngày/số | **Chờ chữ ký ở Cổng 2** — `tieng-viet-cho-crm` |
| ③ | Nhãn ứng dụng (`apps/app`) | **việc kế tiếp**, chưa mở |
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

### Vòng ③ — việc kế tiếp, và nó thừa kế một hoá đơn

Chạy `/feature-loop:feature-loop <mô tả>`. Đây là vòng quét lớn nhất: 177 file
nhãn ứng dụng.

**Cổng 2 của vòng ③ phải đo lại đúng năm chuỗi này và thấy chúng biến mất:**

| Chuỗi | Ở đâu |
| --- | --- |
| `Search companies by name or domain…` | `companies-table.tsx:264` |
| `Archived` | `companies-table.tsx`, nút chuyển màn lưu trữ |
| `Views` | `saved-views-menu.tsx` |
| `New company` | `create-company-sheet.tsx` |
| `Not researched` + 4 nhãn trạng thái | `lib/enrichment-status.ts:10` |

Cộng ba thứ nữa vòng ① tìm ra mà không nhận:

- **Chữ thời gian tương đối** — `just now`, `2h ago`, `in 3d`, và ba hậu tố
  `m`/`h`/`d`, trong `local-date-time.tsx`. Dữ liệu thử không sinh ra chúng nên
  **không phép đo nào che chúng**. Thêm một công ty có hoạt động vào dữ liệu thử
  trước khi tin bất kỳ con số nào.
- **20 chuỗi mặc định đè được** mà vòng ② cố ý bỏ — ô ngày vẫn đọc `No date yet`,
  ô gợi ý công ty vẫn đọc `Search companies…`.
- **Bề rộng cột.** Đây mới là chỗ chữa việc cắt tiêu đề. Rút nhãn ngắn hơn không
  cứu được gì: ở 768px tiếng Anh cũng cắt.

**Dùng lại nguyên giàn đo của vòng ①**, đừng dựng cái mới:
`_acceptance/tieng-viet-cho-crm/rang/ban-ve-man-cong-ty.mjs` (dựng màn thật hai
lần rồi trừ) và `rang/dot-bien.mjs` (trả từng khoá về tiếng Anh, một khoá một
lượt). Chúng đã chịu bốn luật và ba lần tự hỏng.

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

Chạy bằng `/feature-loop:feature-loop <mô tả>`. Cổng nghiệm thu **đã chạy thật 7
lần** — không còn là đường chưa ai đi.

1. **Vòng ③ nhãn ứng dụng** — T2 — việc kế tiếp, xem mục trên.
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
