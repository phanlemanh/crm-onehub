<!-- skin: custom -->
# Diagram skin — CRM của OneHub

Source: `docs/design.md` của kho (nền trắng phẳng, xám không pha, một màu xanh
thương hiệu `#006B4F`). Written by the diagram-design skill; edit tokens here,
never in the skill.

| Role | Light | Dark |
|---|---|---|
| paper | #fafafa | #171717 |
| paper-2 | #f2f2f2 | #212121 |
| ink | #171717 | #fafafa |
| muted | #575757 | #b4b4b4 |
| soft | #666666 | #9a9a9a |
| rule | rgba(23,23,23,0.12) | rgba(250,250,250,0.12) |
| accent | #006B4F | #2f9b7a |
| link | #1f4f7a | #6a95d8 |

Fonts: sans = Geist · serif = Lora

Ghi chú hai chỗ lệch khỏi mặc định, cả hai có lý do đọc được:

- **Serif chỉ còn Lora.** Instrument Serif không có glyph tiếng Việt. Mọi hình ở
  kho này viết tiếng Việt, nên để Instrument Serif đứng trước sẽ trộn hai bộ chữ
  trong cùng một từ. Lora mang subset `vietnamese` ở cả roman lẫn italic.
- **Giấy gần trắng, xám không pha.** `docs/design.md` khai màu nền phẳng trắng và
  xám cố ý không ám sắc. `#fafafa` giữ đúng ý đó mà không chói như trắng tuyệt đối.

`accent` `#006B4F` đạt 6.5:1 trên giấy nên dùng được cả làm chữ; `accent-text`
bằng chính nó. `accent-tint` = `rgba(0,107,79,0.08)`.
