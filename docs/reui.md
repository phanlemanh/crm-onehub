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

File rơi vào `src/components/reui/`, import bằng
`@crm/ui/components/reui/<tên>`.

## Sau khi cài, luôn sửa bốn chỗ

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
- `timeline`, `stepper`, `phone-input`, `number-field` (số tiền theo
  `docs/currency.md`), `event-calendar` — những thứ kho chưa có.
- Block Pro — vật liệu cho `/proto` và phiên design-pass, xem `docs/proto.md`.
  Chỉ phần đã qua Cổng 1 mới được tách thành thành phần trong `packages/ui`.

Không dùng:

- `data-grid` và `filters` thay `data-table.tsx` — đó là hệ bảng thứ hai
  (TanStack) cạnh một bảng đã có lọc và ẩn cột, đang dùng ở mười hai file.
  Skill và MCP của ReUI nói «bảng thì luôn dùng data-grid»; ở kho này thì không.
- `code-block` trong màn chat — hội thoại thuộc AI Elements, xem
  `docs/chat-ui.md`.
- Skill ReUI cài toàn cục — nó dạy «bảng luôn là data-grid» và «không chỉnh
  style của mục đã cài», cả hai ngược với kho; công cụ MCP đủ dùng.

## Code trả phí không đi về hãng

Code của block Pro chỉ sống ở kho riêng. Nó không vào nhánh nào đẩy lên remote
`fork` hay PR gửi `trycompai/crm` — kho của hãng công khai. Thành phần miễn phí
muốn gửi lên hãng thì đọc giấy phép của ReUI trước. Mỗi file ReUI trong
`packages/ui` cũng là thêm một chỗ rẽ khỏi hãng, nên chỉ cài thứ có tính năng
thật cần tới.
