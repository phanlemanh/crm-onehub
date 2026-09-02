# Handoff — nhánh `onehub`

Viết lại cuối phiên 2026-09-01. Bản trước (2026-08-31) có hai mục đã SAI — xem
"Bẫy cũ nay sai" ở cuối. Đọc file này trước khi làm bất cứ việc gì trong hàng đợi.

## Hiện trạng

- `origin` = `phanlemanh/crm-onehub` (riêng tư), nhánh làm việc `onehub`
- `upstream` = `trycompai/crm` (chỉ đọc, MIT) · `release` = bản gương, không sửa
- **22 commit chưa đẩy** lên `origin` tính đến cuối phiên này

Đã gửi lên hãng, đang mở: PR `trycompai/crm#194` (vá `dev-session`), issue `#195`
(nay đã biết là **không phải test phập phù** — xem mục bẫy).

## Việc tiếng Việt: năm vòng, đang ở đâu

`_acceptance/tieng-viet-cho-crm/opportunity.md` chốt năm vòng. Thứ tự **đã đảo**
ngày 2026-09-01: ② lên trước ①.

| Vòng | Vùng | Trạng thái |
| --- | --- | --- |
| ② | Bộ dựng chung (`packages/ui`) | **Đã ký Cổng 2** — `bo-dung-chung-nhan-chuoi` |
| ① | Xương sống + định dạng ngày/số | **Dừng ở S4**, cần chạy lại — `tieng-viet-cho-crm` |
| ③ | Nhãn ứng dụng (`apps/app`) | chưa mở |
| ④ | Câu máy chủ trả về | chưa mở |
| ⑤ | Chữ tác nhân sinh ra | chưa mở |

**Việc kế tiếp: chạy lại S4 cho vòng ①.** Nó nay đóng được AC-9 (bảng dùng chung
đã nhận chuỗi từ ngoài), nhưng **E6 vẫn sẽ đỏ**: ô tìm và nút `Archived` là chuỗi
khoá cứng **tại chỗ gọi** trong `apps/app`, tức vòng ③. Đọc
`_acceptance/tieng-viet-cho-crm/decisions.jsonl` trước — 15 dòng, mỗi dòng một
quyết định và căn cứ.

## Bài học đắt nhất của phiên, đừng trả giá lại

**Ba lần liên tiếp một phép đo nói dối, và mỗi lần tôi tin nó.**

1. Máy quét mã đếm 25 chuỗi; số thật là 53. Nó bỏ sót vì nó là **một danh sách
   hình dạng chuỗi**, và một danh sách hình dạng không chứng minh được sự vắng mặt.
   Người chấm gieo chữ lọt lưới bằng mười hai lối; rẻ nhất là đổi nháy kép thành
   nháy ngược.
2. Chuyển sang **chấm bản vẽ** — dựng thật từng component hai lần, tiếng Anh và
   tiếng Việt, rồi so chữ người đọc thấy. Không lối lách cú pháp nào tồn tại, vì
   nó không nhìn cú pháp. Nó bắt được cả chuỗi **của thư viện**: `dnd-kit` đặt
   `aria-roledescription="sortable"`, `cmdk` đặt `aria-label="Suggestions"` — thứ
   không máy quét mã nào của mình có thể thấy.
3. Rồi tôi công bố "phép đo bắt 39/39" trong khi số thật là 32/39. Kịch bản quét
   của tôi thay chuỗi ở nửa file không chứa bảng dịch, và **tôi không kiểm rằng
   đột biến có thật sự đổi file**. Bộ đo cũ có đúng phép kiểm đó; tôi đánh rơi nó
   khi đổi cách.

**Luật rút ra, áp cho mọi phép đo sau này:** trước khi tin một con số, phá vật
thật rồi xem phép đo có đỏ không — và kiểm rằng cú phá **thật sự đổi được vật**.
Một phép đo chỉ xanh được mà không đỏ được thì nó không đo gì.

Phép đo hiện tại: `cd packages/ui && bun run test`. Quét 43 khoá bảng dịch, trả
từng khoá về tiếng Anh một lượt: **43/43 đỏ**. Cách chạy quét ghi trong
`_acceptance/bo-dung-chung-nhan-chuoi/contract.md`, mục AC-6.

## Người lạ lái thử tìm ra gì

Hai người lạ dùng CRM một ngày làm việc, không biết gì về vòng nào. Cả hai nói
cùng một câu: **"chỉ có trang Công ty được dịch"**, và chỗ khó chịu nhất không
phải tiếng Anh mà là **nửa nọ nửa kia trong cùng một màn**.

### Lỗi sản phẩm — không thuộc vòng ngôn ngữ nào, chưa ai nhận

1. **Sắp xếp theo `Thoả thuận mở` ra sai thứ tự.** Đọc từ trên xuống:
   2·2·2·2·0·1·1·2·1·1·0·1·1·1·0. Cột khai `sortable: true`
   (`companies-table.tsx`), nên lỗi ở đường truy vấn.
2. **Bấm đầu cột vừa sắp xếp vừa mở hồ sơ dòng đầu.** Lặp lại ba lần.
3. **Ở 390px không còn ô đánh dấu, nhưng lựa chọn cũ vẫn sống** — bấm được
   `Actions → Archive` cho một dòng không nhìn thấy là dòng nào. Đây là chỗ nguy
   nhất trong danh sách.
4. **`Cột (7)` nói dối ở màn hẹp**: cột đã ẩn theo bề rộng vẫn được đếm, vẫn còn
   dấu tick, bấm tick không có gì xảy ra.
5. **Cột ô đánh dấu chiếm ~120px ở 768px** trong khi bốn tiêu đề bên cạnh bị cắt;
   tắt bớt một cột thì khoảng trống phình lên ~240px. Bảng không cuộn ngang.
   Đây là **nguyên nhân gốc** của việc cắt chữ mà vòng ② vá bằng cách nới phần trăm.
6. **`Esc` đóng form thêm công ty, mất sạch chữ vừa gõ, không hỏi lại.**
7. **Menu con của bộ lọc rất khó mở bằng cách bấm** trên màn cảm ứng — bấm lần đầu
   thường đóng sạch cả menu. Thiết kế cho chuột rê.

### Thuộc vòng ①, nhận lại khi chạy lại S4

Ba nhãn cột người lạ **phải đi hỏi mới hiểu**, cả hai người độc lập nêu đúng ba
chữ này: `Thoả thuận mở` · `Cá nhân` · `Bổ sung`. Hai chữ đầu đứng trên cột
**toàn số**, nên một danh từ chỉ người và một danh từ chỉ quan hệ đều đọc sai loại.

### Thuộc vòng ③

Trang chủ, Liên hệ, Thoả thuận, Chat, Cài đặt, form thêm công ty, hồ sơ công ty:
tiếng Anh 100%. Và `packages/ui/src/lib/format.ts` mặc định `locale = "en"` với
**24 chỗ gọi ở `apps/app`, 0 chỗ truyền vùng** — nên tiền, ngày, phần trăm vẫn in
tiếng Anh. Giờ hiện `9:09 PM`, ngày hiện `CN, 26 THG 7, 2026`.

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

Chạy bằng `/feature-loop:feature-loop <mô tả>`. Cổng nghiệm thu **đã chạy thật 6
lần** trong hai phiên vừa rồi — không còn là đường chưa ai đi.

1. **`tieng-viet-cho-crm` chạy lại S4** — T2 — việc kế tiếp, xem mục trên.
2. **Vòng ③ nhãn ứng dụng** — T2 — quét lớn nhất. Dùng lại giàn kiểm bản vẽ của
   vòng ②, đừng dựng máy quét mã.
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

Ngoài hàng đợi, cần **chip riêng**: `packages/ui/src/components/logo.tsx:10` mang
`aria-label="Comp AI Logo"` — trình đọc màn hình đọc tên hãng cũ cho nhân viên
OneHub. Đổi tên hãng không phải việc vòng ngôn ngữ.

## Đã kiểm / chưa kiểm

Xanh cuối phiên, ép chạy không cache: `check-types` 13/13 · `lint` 9/9 ·
`lint:slop` sạch · `test` 11/11, trong đó **76 bài ở `@crm/ui`**.

Đã đo tận mắt trên máy chủ thật: năm ca phân giải ngôn ngữ (trình duyệt `vi`→`vi`,
`en`→`en`, cookie thắng header cả hai chiều, cookie rác→`en`); bề rộng tiêu đề cột
ở 768/1024/1280/360px; số phân trang khớp giữa máy chủ và trình duyệt; đổi tiếng
không tải lại trang, chứng minh bằng thanh chọn dòng mà máy chủ chưa bao giờ vẽ.

**Chưa kiểm:** trình đọc màn hình thật (NVDA/JAWS/VoiceOver) — chỉ đọc cây trợ
năng của trình duyệt. Năm chỗ gọi `DataTable` ngoài màn công ty. Kích thước gói
sau khi ba component thành client component. Tên pháp nhân thật 40–60 ký tự — dữ
liệu thử chỉ có "Đất Xanh", 8 ký tự.

## Bẫy cũ NAY SAI — đừng dùng lại

Bản handoff trước bảo tự export khoá Google giả và tự nạp `.env` cho `db:test`.
**Cả hai đã vá 2026-09-01 và cách lách cũ nay sai.** Từ gốc kho, không export gì:

```
bun run db:test && bun run test
```

`agent#test` đỏ ở `retireExhausted` khi cơ sở dữ liệu kiểm còn hàng `AgentTask`
của một lượt chạy bị cắt ngang. **Không phải test phập phù** — issue `#195` chẩn
đoán sai. Nguyên nhân: nó gọi `claimDue(10, RESEARCH)`, tức lấy **mọi** hàng đến
hạn chứ không chỉ ba hàng nó tự tạo. Đo 2026-09-01: 3 lần đỏ trong 11 lượt lưới
đầy đủ, cả ba đều ngay sau một suite bị cắt ngang. `bun run db:test` cho sạch rồi
mới tin màu đỏ.

## Bẫy còn đúng

- `bun run dev` ở gốc **không chạy trong phiên không có TTY**. Chạy từng app:
  `apps/app` 3000, `apps/api` 3001, `apps/agent` 2000.
- Đăng nhập không cần OAuth: `cd apps/api && bun run dev:session <email>`.
- Đẩy lên `origin` cần `http.version HTTP/1.1` (đã đặt trong git config kho).
  HTTP/2 trả 400.
- **Khung trình duyệt ẩn thì mọi bề rộng trả về 0** và ảnh chụp vô dụng. Đưa tab
  lên trước rồi mới đo. Phiên này mất hai lượt đo vì quên.
- **Nhiều phiên chấm ghi cùng một cây làm việc thì hồ sơ bằng chứng lẫn nhau.**
  Một người chấm phải băm md5 từng lượt để biết mã đang ở bản nào. Vòng sau chạy
  trong worktree riêng.
- CLI `ai-elements` bỏ qua cả cờ `--help` và cài thẳng toàn bộ. Lấy từ
  `https://registry.ai-sdk.dev/<tên>.json` và tự ghi file.
- `PRODUCT-MAP.md` do máy vẽ lại mỗi lần một người ký một cổng. Sửa tay là làm hồ
  sơ lệch, và `--check` bắt. Hai trạng thái hồ sơ dễ sai: `status` của hợp đồng
  chỉ nhận `draft|approved|implemented|verified|signed-off|machine-cleared`, và
  `evidence-report.md` **bắt buộc có frontmatter kèm `verdict`**.
