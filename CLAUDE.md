# CLAUDE.md — CRM của OneHub

> Cấu hình repo cho phiên máy: kho là gì, cổng nào, lệnh nào, từ nào. Luật
> hành vi (cách hỏi, cách báo cáo) không sống ở đây — nó theo cấu hình cá
> nhân của người dùng.

## Kho này là bản riêng, không phải kho của hãng

Tách từ `trycompai/crm` (MIT). Sản phẩm nội bộ của OneHub, không bán ra ngoài.

`origin` = `phanlemanh/crm-onehub`, nhánh làm việc `onehub`. `release` là bản
gương của hãng — không sửa. `upstream` chỉ đọc. Kéo bản mới của hãng về
`release` rồi merge sang `onehub`. CI riêng của công ty sống ở
`.github/workflows/acceptance.yml`. Riêng `.github/workflows/ci.yml` nay do OneHub giữ
(luật 47, 09/10): bước test chạy thành ma trận ba ô trên ba máy. Kéo bản mới của hãng về `release` rồi gộp sang
`onehub` mà đụng tệp này thì giữ bản của OneHub, chỉ chép tay phần hãng đổi mà OneHub cần.

Phí bản rẽ là chi phí dài hạn lớn nhất ở đây. Sửa được ở hãng thì gửi lên hãng,
đừng vá riêng.

## AGENTS.md của hãng: giữ luật kỹ thuật, bỏ luật hành vi

@AGENTS.md

Luật kỹ thuật trong đó giữ nguyên hiệu lực: không viết chú thích trong code,
trí khôn sống ở `apps/agent` chứ không ở API, một `.env` duy nhất ở gốc,
`/packages/ui` là nguồn duy nhất của giao diện, phân tích ở biên chứ không
truyền `Record<string, unknown>`. Bảng chỉ mục "đọc gì trước khi chạm gì" của
nó là bảng duy nhất — theo đúng bảng đó, và nói ra đã đọc gì.

Bốn mục hành vi của hãng đã **xoá khỏi `AGENTS.md`** ở kho này, không phải tắt
bằng lời: khuôn báo cáo `## Issues`, `"Use ASD-STE100"`, `"Median Tasks"` cùng
mục commit theo mã `MDN-…`, và lệnh cấm trailer đồng tác giả. Ngôn ngữ, giọng,
cách báo cáo và cách quy công đều theo cấu hình cá nhân của người dùng. Mã việc
của hãng (`CMP-…`) chỉ dùng khi thật sự vá cho hãng.

Trailer đồng tác giả rời khỏi luật kho ngày 10/09 theo yêu cầu của chủ kho: gắn
hay không gắn là chuyện quy công, không phải luật kỹ thuật của sản phẩm. Không
hook nào, không lệnh CI nào cưỡng chế nó — nó chỉ sống bằng chữ ở hai file này —
nên xoá chữ là xoá hẳn, và từ nay cấu hình cá nhân quyết. Xoá chứ không ghi
"không bắt buộc", vì lý do ngay dưới đây.

Xoá, chứ không phủ định, vì phủ định đã thử và hỏng: bản cũ ghi khuôn `## Issues`
là "không bắt buộc" — mà không bắt buộc là *cho phép*. Cái khuôn có sẵn mẫu và ví
dụ trong `AGENTS.md` thắng một dòng chối bỏ trong `CLAUDE.md`, nên nó vẫn bám vào
cuối câu trả lời qua nhiều phiên. Đây là chỗ rẽ cố ý so với `release`: kéo bản mới
của hãng về mà thấy bốn mục đó quay lại thì xoá tiếp, đừng tưởng sót merge.

## Bốn cổng, và vòng lặp là đường mặc định

`PRODUCT-MAP.md` vẽ bốn cổng người: **Cổng Đáng** (việc này có đáng làm không) ·
**Cổng Phạm vi** (bộ tiêu chí đã đủ và đúng chưa) · **Cổng Bằng chứng** (đã làm
đúng thứ đã hứa chưa) · **Cổng Giá trị** (thứ đã giao có ăn thua không). Bốn câu
đó chỉ người trả lời được.

Làm một tính năng = chạy `/feature-loop:feature-loop <mô tả>`. Đó là đường mặc
định cho T2/T3, không phải lựa chọn nâng cao. Chạy `/acceptance-gate:acceptance`
trần thì được hồ sơ nhưng mất sổ quyết định, mất phản biện context sạch, mất thẻ
cổng — bốn hồ sơ đầu của kho đã mất đúng những thứ đó. T1 (chỉ chạm `docs/**`,
`**/*.md`) thoát ở S0, làm thẳng.

Cấu hình cổng ở `_acceptance/config.yaml`: `enforcement: strict`, `recheck:
strict`. Đường T3 gồm `packages/auth`, `packages/db/prisma`, và các module
`auth` · `api-keys` · `sso` · `users` · `workspace` · `tracking` · `mailbox` của
API — chạm vào đó là T3, thêm một cổng duyệt kế hoạch.

Lỗi của bộ kit nghiệm thu phát hiện ở đây thì mở chip riêng sang
`~/dev/acceptance-gate-kit`, không sửa tại chỗ — phiên ở kho này chỉ làm tính
năng của kho này.

## Lộ trình là việc dựng; thiếu dữ liệu thì dùng dữ liệu mẫu

Chủ kho chốt 11/10: `docs/plan/lo-trinh-*.json` chỉ chứa việc dựng tính năng.
Không hàng nào chờ người — chờ phòng ban gửi dữ liệu, chờ gom câu hỏi thật, chờ
chạy thật xong. Mốc do người và tổ chức quyết sống ở `docs/plan/lich-van-hanh.md`.

Thiếu dữ liệu để dựng hay đo thì mở rộng dữ liệu mẫu, không đợi:

- OKR: bộ OKR mẫu `bun run okr:mau` (`_acceptance/bo-okr-mau`) — thêm ca vào
  đó. Dữ liệu chung: `bun run db:seed`.
- Dữ liệu mẫu vào qua đường ghi thật (service, API), không chèn thẳng bảng. Dịch
  vụ ngoài giả theo đúng hợp đồng thật của nó, không theo cái dễ giả.
- Lệnh nạp mẫu từ chối chạy trên production. Dữ liệu mẫu không lên production.

Đo trên dữ liệu thật — chạy ẩn, phiên nghiệm thu, Cổng Giá trị — là việc sau
khi gộp, lúc bật cho người dùng. Nó không phải cổng của việc dựng.

## Ngôn ngữ sản phẩm

`CONTEXT.md` là từ điển. Từ chưa có mục ở đó thì hoặc thêm mục trước, hoặc viết
bằng chữ thường ai cũng hiểu.

Cấm tự đúc từ ghép tiếng Việt cho thuật ngữ kỹ thuật — giữ nguyên tên thật
(`diff`, `sha`, `migration`, `worktree`), đặt trong ngoặc khi cần.

Nhãn trên màn hình mang phần ngữ cảnh **chưa cấp**: xoá một chữ mà người đứng ở
màn đó vẫn hiểu đúng thì chữ đó thừa. Dữ liệu người nhập không dịch, và đánh dấu
để trình duyệt không tự dịch.

## Cách chứng minh nó chạy

Từ gốc kho, không cần export gì:

```
bun run test
bun run check-types
bun run lint
bun run lint:slop
bun run build
```

`bun run build` là lệnh thứ năm, thêm 07/09. Bốn lệnh đầu không dựng ứng dụng, nên
một hồi quy làm `next build` đỏ đã đi qua bốn vòng đã ký mà không cổng nào thấy.
Hình dạng cổng khai ở `.githooks/gate-shape.json`; thêm task mà không khai là
`verify-gate-shape.mjs` cắn.

Hai lỗi môi trường cũ đã vá 2026-09-01 — cách lách cũ (tự export khoá Google
giả) nay sai, đừng dùng lại. Mỗi lượt `bun run test` có cơ sở dữ liệu riêng
`crm_<id>_test`, tạo trước và drop sau, nên hàng `AgentTask` của một lượt bị cắt
ngang không sang được lượt kế. Chỉ `bun test` trần trong một gói mới dùng chung
`crm_test`; thấy `agent#test` đỏ ở `retireExhausted` theo lối đó thì chạy
`bun run db:test --reset` rồi mới tin màu đỏ. Chi tiết ở `docs/setup.md`.

`bun run dev` ở gốc không chạy trong phiên không có TTY. Chạy từng app:
`apps/app` 3000, `apps/api` 3001, `apps/agent` 2000. Đăng nhập không cần OAuth:
`cd apps/api && bun run dev:session <email>`.

Ba cổng đó cũng là mặc định của các phép đo trong `_acceptance/config.yaml`
(`APP_URL:-http://localhost:3000`, `API_URL:-http://localhost:3001`). Hệ quả cũ:
một bản dev đang chạy ở checkout chính bị đo thay cho cây đang xét, và kết quả
vẫn in ra như thường. Từ 10/09 các chặn đọc màn hình hết im lặng ở chỗ đó:
`rang/canh-cay.mjs` đặt một dấu mốc vào `apps/app/public` rồi xin lại nó qua
`APP_URL` trước khi mở màn đầu tiên; không nhận lại dấu mốc thì thoát mã 2 và gọi
tên cây đang xét, chứ không đọc con số nào. Đo một cây khác vẫn phải đặt `APP_URL`
và `API_URL` tay — cảnh cây chỉ nói cho biết đã đặt sai, không sửa hộ. `dot-bien.mjs`
dựng bản sao riêng ở `CONG_SAO` (mặc định 3200) đúng vì lý do đó.

Cảnh cây mới với tới `APP_URL`. Một máy chủ api của cây khác ở `API_URL` vẫn lọt,
và `bun run dev:session` thì luôn chạy trong cây đang xét bất kể `API_URL` trỏ đâu.

Từ 26/09 phép đo màn không cần máy chủ dev dựng tay và không bao giờ ghi vào kho
chung `crm`: `tien-de.mjs` thấy `DATABASE_URL` không phải kho dùng-một-lần thì tự
chạy trong một phiên đo — kho `crm_<cây>_do` riêng, API và app của chính cây trên hai
cổng tự do, dọn khi xong hay bị ngắt. Muốn cả làn dùng một phiên:
`bun run do:man --chay "<làn>"`. Kho chung là của người; máy chủ dev chạy tay vẫn dùng
nó. Chi tiết ở `docs/setup.md` mục «Screen measurements».

Đẩy lên `origin` cần `http.version HTTP/1.1` (đã đặt trong git config của kho);
HTTP/2 trả 400. `pre-push` chạy `check-types`, `lint`, `lint:slop`, `test`. Đừng
`--no-verify` trừ khi có lý do nói được thành lời.

## Đừng sửa tay

`PRODUCT-MAP.md` do máy vẽ lại mỗi lần một người ký một cổng. Sửa tay là làm hồ
sơ lệch, và CI bắt.
