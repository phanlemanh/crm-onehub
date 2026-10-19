# ReUI trong kho này

ReUI là một registry tương thích shadcn. Kho dùng nó làm **nguồn nguyên liệu**
cho `packages/ui` và cho `/proto`, không dùng nó để thay thư viện giao diện đang
có. Luật trong `docs/design.md` và `AGENTS.md` đứng trên mọi lời khuyên của
ReUI — kể cả lời khuyên từ MCP và skill của họ.

## ReUI có gì, gói nào mở gì

| Loại | Ví dụ | Cần |
| --- | --- | --- |
| 22 thành phần | `kanban`, `timeline`, `stepper`, `phone-input` | miễn phí |
| Ví dụ `c-*` | `c-kanban-3` | miễn phí |
| Block | `kanban-board-3`, `solution-crm-2` | gói Pro — đang có |
| Motion Icons, template | | gói Ultimate — không mua; kho có `icon.tsx` riêng |

## Cài

Chỉ cài vào `packages/ui`, từ trong thư mục đó:

```bash
bun run ui:add @reui/timeline --dry-run
```

`apps/app/components.json` cố ý không khai registry `@reui`: một thành phần
ReUI cài thẳng vào app là một bản sao giao diện thứ hai.

`ui:add` nạp `.env` ở gốc kho, nên khoá chỉ sống một chỗ (`REUI_LICENSE_KEY`,
xem `.env.example`). Thiếu khoá thì CLI từ chối **mọi** mục `@reui`, kể cả mục
miễn phí.

Luôn `--dry-run` trước. Không bao giờ `--overwrite`: mục ReUI kéo theo `button`,
`card`, `avatar`, `badge` bản gốc của shadcn, còn các file cùng tên trong kho đã
tuỳ biến. `@reui/badge` và `@reui/alert` là bản của ReUI, trùng tên với
`badge.tsx` và `alert.tsx` của kho.

Bản `--dry-run` ghi nhãn `overwrite` cho mọi file trùng tên, kể cả khi lệnh
thật sẽ không ghi đè: không có `--overwrite` thì CLI bỏ qua file đã có khi chạy
không tương tác, và hỏi từng file (mặc định «không») khi chạy tương tác. Nhãn đó
là danh sách file cần trả lời «không», không phải lý do bỏ mục. Mục ReUI gọi một
biến thể mà `button` của kho không có thì `bun run check-types` bắt.

Đọc danh sách phụ thuộc trong bản `--dry-run` trước khi cài thật. Có
`@base-ui/react` thì dừng: một số mục nhập Base UI ngay trong bản `radix-nova`
(`number-field`, `autocomplete`, `data-grid`, và các block `kanban-board-2`,
`kanban-board-3`, `timeline-8`, `timeline-9`, `solution-crm-2`). Kho thuần
Radix; hai thư viện nền cho cùng một việc là hai cách đóng mở, hai cách bắt
phím.

File rơi vào `src/components/reui/`, import bằng
`@crm/ui/components/reui/<tên>`.

## Sau khi cài, luôn sửa năm chỗ

Đo trên lần cài thử `@reui/timeline` với shadcn 4.16.1:

1. **`import { cn } from "cn"`** — CLI không đổi dòng này sang alias của kho mà
   thêm gói npm `cn` vào `packages/ui/package.json`. Đổi import sang
   `@crm/ui/lib/utils` rồi gỡ `cn` khỏi `dependencies`: hai bộ gộp class trong
   một thư viện là hai kết quả khác nhau cho cùng một `className`.
2. **Chú thích** — code ReUI có chú thích; kho cấm chú thích. Xoá hết.
3. **Icon** — ReUI dùng Lucide; giao diện kho dùng `@carbon/icons-react`.
4. **Màu và góc** — badge nhiều màu, sao đánh giá, `className` tại chỗ đều phạm
   `docs/design.md`: chỉ `primary` và `destructive` được tô nền, góc lấy từ thang
   `rounded-sm/md/lg`. Biến thể mới đặt trong `packages/ui`, không đặt ở chỗ gọi.
   Mục nào kéo `@reui/badge` hay `@reui/alert` thì CLI chèn vào `globals.css`
   một khối `--success`, `--info`, `--warning`, `--invert` và định nghĩa lại
   `--destructive-foreground` khác nhau giữa hai theme — gỡ cả khối.
5. **Chữ** — `data-grid`, `filters`, `cascader`, `event-calendar`, `gantt` mang
   nhãn tiếng Anh trong file `*-i18n`. Mọi nhãn đi qua
   `packages/ui/src/lib/messages.ts` và truyền vào prop `i18n`; bản tiếng Việt
   trùng nguyên văn tiếng Anh thì `test/messages-guard.spec.ts` đỏ.

## Chọn gì, bỏ gì

**Một mặt nền cho cả kho: `card`.** Kho đã có `card` và `card-table`; `frame`
của ReUI là kiểu khung thứ ba. Mọi lần tìm hay ghép trang qua MCP truyền
`surface: "card"`.

**Kho dùng bản Radix (`radix-nova`).** MCP mặc định trả tài liệu và bản xem trước
của bản Base; thêm `?style=radix-nova` vào URL máy chủ MCP để khớp. CLI thì tự
đọc `components.json` và cài đúng bản Radix.

Dùng:

- `kanban` — kéo thả thương vụ giữa các giai đoạn. Màn Deals hiện chỉ có bảng;
  `@dnd-kit` đã có sẵn trong `packages/ui`.
- `timeline`, `stepper`, `tree`, `phone-input`, `event-calendar`, `gantt` —
  những thứ kho chưa có.
- Block Pro — vật liệu cho `/proto` và phiên design-pass, xem `docs/proto.md`.
  Chỉ phần đã qua Cổng 1 mới được tách thành thành phần trong `packages/ui`.
  Ngoại lệ là **phần máy** của block, xem mục «Block có phần máy» ngay dưới.

Không dùng:

- `data-grid` và `filters` thay `data-table.tsx` — đó là hệ bảng thứ hai
  (TanStack) cạnh một bảng đã có lọc và ẩn cột, đang dùng ở mười hai file.
  Skill và MCP của ReUI nói «bảng thì luôn dùng data-grid»; ở kho này thì không.
- `number-field`, `autocomplete` — nhập Base UI. Ô số tiền theo
  `docs/currency.md` dựng trên `input` của kho.
- `code-block` trong màn chat — hội thoại thuộc AI Elements, xem
  `docs/chat-ui.md`.
- Skill ReUI cài toàn cục — nó dạy «bảng luôn là data-grid» và «không chỉnh
  style của mục đã cài», cả hai ngược với kho. Bản trong kho ở mục dưới là để
  tra cứu, và mang sẵn dòng nói rõ hai điều đó không áp dụng.

## Block có phần máy: rút tệp, không cài block

Có block mà giá trị nằm ở phần máy chứ không ở bố cục: bộ xếp vị trí, đường
nối, phím tắt và điều khiển khung vẽ của các block `flow-*` (React Flow và
dagre). Nhìn ảnh rồi viết lại phần đó là làm lại thứ kho đã mua. Cài nguyên
block thì không được: đo bằng `--dry-run` ngày 14/10/2026, `@reui/flow-2` ghi đè
17 tệp đã tuỳ biến (`card` sang `rounded-xl`), thêm 18 biến màu vào
`globals.css`, kéo gói `cn` và bảy logo hãng.

Nên rút từng tệp:

1. Xem tệp trong `packages/ui`:
   `bun run ui:add @reui/<block> --dry-run --view <đường tệp>`.
2. Chỉ chép **tệp máy** — xếp vị trí, đường nối, phím tắt, điều khiển khung vẽ —
   vào `packages/ui/src/components/<tên>/`. Thẻ, ngăn bên, thanh công cụ, dữ
   liệu mẫu và logo hãng không chép; dựng lại bằng thành phần của kho.
3. Phụ thuộc mà tệp máy cần (`@xyflow/react`, `@dagrejs/dagre`) thêm bằng
   `bun add` trong `packages/ui`, không qua CLI shadcn.
4. Sửa đủ năm chỗ ở mục «Sau khi cài».

Luật Base UI vẫn giữ: tệp máy nào nhập `@base-ui/react` thì dừng như mọi mục
khác. Tệp rút từ block Pro vẫn là code trả phí, xem mục cuối.

## Skill ReUI

Skill nằm ở `.agents/skills/reui/`, cạnh các skill khác của kho, để tra cách tìm,
cài và đọc API của thành phần và block. Nó không nằm trong `.claude/skills/` nên
không tự bật; người hay tác nhân mở khi cần. Dòng đầu `SKILL.md` là phần của kho:
file này đứng trên skill, hai lời khuyên ở mục «Không dùng» bị gạt.

Cập nhật khi công cụ `get_agent_skill` của MCP báo phiên bản mới hơn dòng
«ReUI skill version» trong `SKILL.md`: tải gói ở
`https://mcp.reui.io/api/skills/download` (JSON, mỗi mục một `path` và
`content`), ghi đè từng file vào `.agents/skills/reui/`, rồi gắn lại dòng đầu của
kho. Không chạy bộ cài một dòng `curl … | node -`: nó ghi thêm cấu hình Cursor,
OpenCode, `.mcp.json` trong kho và `~/.codex/config.toml` ngoài kho.

## Code trả phí không đi về hãng

Code của block Pro chỉ sống ở kho riêng. Nó không vào nhánh nào đẩy lên remote
`fork` hay PR gửi `trycompai/crm` — kho của hãng công khai. Thành phần miễn phí
muốn gửi lên hãng thì đọc giấy phép của ReUI trước. Mỗi file ReUI trong
`packages/ui` cũng là thêm một chỗ rẽ khỏi hãng, nên chỉ cài thứ có tính năng
thật cần tới.
