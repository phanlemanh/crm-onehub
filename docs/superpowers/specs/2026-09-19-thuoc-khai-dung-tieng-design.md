# Thước của hồ sơ khai đúng tiếng — thiết kế

Ngày 2026-09-19 · slug `thuoc-khai-dung-tieng` · T2 · surfaces `[tooling]`

## Sản phẩm của vòng này là cái thước

Hồ sơ `ho-so-khai-dung-tieng` chạm **trần nhát sửa thước**: năm nhát sửa kể từ
khi hợp đồng vào `implemented`, trần là ba, và cả năm đều chỉ chạm bộ đo. Sản
phẩm — khai `lang="en"` trên tấm hồ sơ — đã xong và không đổi một dòng nào suốt
năm nhát đó.

Người ký chọn lối 3 ngày 19/09: mở một vòng có chủ ngữ là thước, thay vì tiếp
tục sửa lén dưới bóng một hợp đồng nói về `lang="en"`.

Câu hỏi của vòng này không phải "sản phẩm đúng chưa" mà là: **màu xanh của bộ đo
này nói dối kiểu gì, và làm sao để nó thôi nói dối được.**

## Mười ba cách nó đã nói dối

Đây là dữ kiện, không phải giả thuyết — hai vòng chấm S4 và một phép kiểm tĩnh
tìm ra, mỗi cái có đường dẫn và số đo.

| # | Nó nói dối thế nào | Trạng thái |
| --- | --- | --- |
| A | Bộ phá thử phá TẠI CHỖ trên cây đang đo → thước tĩnh đỏ giả, và tệp bằng chứng bị ghi đè bằng số đo của bản đã phá | đã vá |
| B | **7/11 chuỗi ghim vô hiệu** — chuỗi in ở mọi lượt chạy nên chốt luôn trả CÓ | **chưa vá** |
| C | Giá trị đo là hằng gõ sẵn trong chân đo, không về từ máy chủ | đã vá |
| D | Đo nửa lời hứa; khẳng định âm tính không đối chứng dương | đã vá |
| E | Khớp TÊN THẺ trong khi lời hứa là QUAN HỆ | đã vá |
| F | Khoanh cả trang → đo bề mặt vốn đã đúng từ vòng trước | đã vá |
| G | Nhân bản HEAD mà không báo khi cây bẩn | đã vá |
| H | **Thước không nằm trong lệnh cổng nào** — "không quên được nữa" chỉ đúng trên giấy | **chưa vá** |
| I | **Bài kiểm sai gói, ngược chiều phụ thuộc, lọt khỏi mọi `tsconfig`** | **chưa vá** |
| J | **Kịch bản mượn bản ghi THẬT trong CSDL dev, không `try/finally`** | **chưa vá** |
| K | **`rmSync` đệ quy trên đường dẫn lấy thẳng từ biến môi trường** | **chưa vá** |
| L | **`evals.yaml` mô tả API đã bị hợp đồng tu chính bỏ** | **chưa vá** |
| M | **Hội đồng được bảo chấm một khoá chân đo không bao giờ ghi ra** | **chưa vá** |

Bảy cái đã vá là công của hai vòng chấm trước; chúng nằm đây để vòng này có phép
đo giữ chúng khỏi quay lại, không phải để làm lại.

## B là cái tệ nhất, và vì sao

Sáu cơ chế nói dối kia còn có cặp hai chiều đỡ: phá vật thật, xem thước có đỏ
không. **B ăn chính cặp hai chiều đó.**

Bộ phá thử khẳng định hai điều cho mỗi đột biến: chân đo phải thoát khác 0, và
thông điệp phải **ghim** — chứa một chuỗi gọi tên chỗ hỏng, để phân biệt "đỏ vì
đúng lý do" với "đỏ vì một lý do nào đó". Nhưng bảy trong mười một chuỗi ghim là
**tên chân**, và tên chân được in ra ở mọi lượt chạy:

```
-- DAN SO: gioi thieu ...
ket qua: chan=gioi-thieu · cho lech=0
```

Nên `thong diep CO ghim` luôn đúng, kể cả lượt xanh. Suốt hai vòng chấm, cái
chốt ấy không chốt gì.

Lời giải: **chuỗi ghim phải PHÂN BIỆT được** — nó phải vắng ở lượt xanh và có ở
lượt đỏ. Và điều đó phải được **đo**, không phải được hứa: bộ phá thử tự chạy
chân đo trên vật LÀNH trước, khẳng định chuỗi ghim VẮNG, rồi mới phá.

`[NGÀNH: mutation testing — Stryker/PIT]` gọi đúng tiền đề này: một phép kiểm
chưa từng đỏ thì không chứng minh gì. Vòng này thêm một tầng: một phép kiểm đỏ
mà không phân biệt được lý do cũng không chứng minh gì.

## H: cắm vào cổng, và cái giá của nó

Lời hứa AC-6 của hồ sơ kia là cơ chế: *"chỗ gọi thứ mười không quên được nữa."*
Nhưng `mot-duong.mjs` chỉ được gọi từ `_acceptance/config.yaml`, nên nó chỉ chạy
khi ai đó chạy lại vòng chấm. Người thêm chỗ thứ mười tuần sau đẩy qua bình
thường.

Kho đã có cơ chế cho đúng việc này, và **lý do viết thành chữ** trong
`.githooks/gate-shape.json`:

> "AC-9 và AC-10 đòi răng phải chặn được ở lệnh cổng, không chỉ khi có người gõ
> tay: một script nằm trong thư mục hồ sơ thì không chặn được ai."

Cơ chế: khối `rang` trong `gate-shape.json` khai từng thước; `rang-chat.spec.ts`
đọc khối đó rồi CHẠY từng thước trong `@crm/ui#test`, nên `bun run test` và
`pre-push` đều đi qua. Khai sai hoặc bỏ khai là bài kiểm đỏ — khối đó là **bản
khai có hiệu lực**, không phải chú thích.

**Nhưng cơ chế hiện chỉ đỡ MỘT hồ sơ.** `rang` là một khối với một `dir`, và bài
kiểm đòi mọi `.mjs` trong đúng thư mục ấy phải có định đoạt. Cắm thước của hồ sơ
thứ hai vào nghĩa là **mở rộng chính cơ chế** — đổi `rang` từ một khối thành một
danh sách khối, mỗi hồ sơ một khối, và cho bộ chạy lặp qua chúng.

**Cái giá, nói thẳng:** `.githooks/gate-shape.json` nằm trong `paths` của eval
thuộc hồ sơ `nen-chat-ai-elements`, và hồ sơ đó đã `signed-off` tại
`verified_commit: 6a8c8e99`. Sửa tệp ấy làm bằng chứng đã ghim của nó hoá cũ,
nên vòng này phải chạy thêm nghi thức **ghim-lại** cho hồ sơ đó. Kho có làn sẵn
(`repin-lane.mjs`) nên đây là chi phí có đường đi, không phải ngõ cụt — nhưng nó
là chi phí thật và người ký thấy nó trên thẻ.

Ràng buộc kèm theo: bộ chạy đổi hình dạng thì **ba thước của hồ sơ kia phải vẫn
xanh** — đó là một tiêu chí của vòng này, không phải một hy vọng.

## I: bài kiểm về đúng nhà

`packages/ui/test/khai-tieng.spec.tsx` nhập `MetaLine` từ
`apps/app/components/...` bằng đường dẫn tương đối chui ra khỏi gốc gói. Đây là
chỗ DUY NHẤT trong `packages/` làm thế. Hai hệ quả đo được:

- `packages/ui/tsconfig.json` khai `include: ["src"]`, nên `@crm/ui#check-types`
  không soi tệp này; `apps/app#check-types` cũng không, vì tệp nằm ngoài
  `apps/app`. Bài kiểm ràng buộc hình dạng `MetaPart` mà **không cổng kiểu nào
  soi nó**.
- Nó chạy được chỉ nhờ bun giải `@/*` theo `tsconfig` gần tệp được nhập — hành vi
  của bun, không phải hợp đồng khai ra.

Tách đôi: phần `ForeignText` ở lại `packages/ui/test`; phần `MetaLine` sang
`apps/app/test`. Người ký đã chốt lối này, và chốt luôn hệ quả: **AC-7 của hồ sơ
`ho-so-khai-dung-tieng` phải tu chính lần thứ hai**, vì nó hứa "ba chiều trong
CÙNG một bài kiểm". Lời hứa thật — ba chiều đều được đo, và đo bởi một cổng kiểu
thật sự soi chúng — không đổi; chỗ ở đổi.

## J và K: thước không được làm hỏng thứ nó đo

`datDuGiaiDoan()` MƯỢN thoả thuận thật trong cơ sở dữ liệu dev và đổi `stage` của
chúng để phủ đủ enum. Phép trả lại nằm trên đường chạy thẳng, **không trong
`try/finally`**. Bất kỳ ngoại lệ nào ở giữa để lại thoả thuận thật ở sai giai
đoạn vĩnh viễn, và danh sách đã mượn sống trong bộ nhớ tiến trình đã chết.

`dungCaySao()` nhận `CAY_SAO` từ biến môi trường rồi đưa thẳng vào
`rmSync(..., { recursive: true, force: true })` — không kiểm nó có phải worktree
do chính script tạo không, không kiểm tên có mang tiền tố, không kiểm nó nằm
ngoài gốc kho.

Cả hai cùng một luật: **một cái thước không được để lại dấu vết trên vật nó đo,
kể cả khi nó chết giữa chừng.**

## L và M: bản khai phải khớp bản thật

`evals.yaml` E7 còn mô tả `MetaLine.parts` nhận chuỗi trần — API đó đã bị hợp
đồng tu chính bỏ ở vòng trước, và chính bộ phá thử đang phá một hình dạng khác.
Bản khai và bản thật nói hai chuyện.

E11 bảo hội đồng chấm "danh sách chuỗi tiếng Việt lọt vào trong là RỖNG ở mọi
mục", nhưng chân đo chỉ ghi khoá đó ở đúng một mục (`tieng-trang`). Hội đồng
được giao một tiêu chí mà vật đo không mang.

Luật: **mọi khoá hội đồng được bảo chấm phải có chân đo ghi ra**, và bản khai
phải mô tả đúng đầu vào còn tồn tại. Đây là thứ đo được bằng máy, không cần mắt.

## Cái gì KHÔNG đổi

Sản phẩm. Không một dòng nào của `ForeignText`, `MetaLine`, bốn chỗ gọi trên tấm
hồ sơ, hay năm chỗ đã chuyển. Vòng này chạm thước, và một tiêu chí của nó là
chứng minh điều đó: hồ sơ `ho-so-khai-dung-tieng` phải vẫn xanh sau mọi thay đổi
ở đây.

## Đã đọc trước khi viết

`AGENTS.md` · `CLAUDE.md` · `.githooks/gate-shape.json` (khối `rang` của
`nen-chat-ai-elements`) · `packages/ui/test/rang-chat.spec.ts` · `.githooks/pre-push` ·
`_acceptance/ho-so-khai-dung-tieng/review-findings.md` (cả hai vòng) ·
`_acceptance/nen-chat-ai-elements/contract.md` và `evals.yaml` · năm tệp của bộ đo.
