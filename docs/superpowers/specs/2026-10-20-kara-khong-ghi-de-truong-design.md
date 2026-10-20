# Kara không ghi đè giá trị trường tuỳ chỉnh đã có — thiết kế

Ngày 20/10/2026. Hồ sơ `_acceptance/kara-khong-ghi-de-truong/`. Hạng T2 nếu đi lối B, T3 nếu đi lối A.

## Lỗi

`writeField` (`apps/agent/agent/lib/fields.ts`) là đường ghi duy nhất của Kara vào giá trị trường tuỳ chỉnh
(`FieldValue`). Công cụ `set_field_value` gọi nó. Nó chỉ kiểm «ô đã có giá trị» khi tác vụ đang chạy là
`field-backfill`. Mọi đường khác ghi thẳng:

- phiên hội thoại ở tab bản ghi: Kara đọc được một nguồn, gọi `set_field_value`, giá trị người bán hàng đã gõ bị thay;
- tác vụ nền khác `field-backfill` (nghiên cứu, làm giàu): cũng thay.

`FieldValue` không có cột xuất xứ, nên `writeField` không biết ô đang giữ giá trị của người hay của Kara.

Luật đã khai mà mã đang trái:

- `docs/plan/dynamic-fields.md` §5: «Nothing a rep typed is ever overwritten.»
- `docs/agent.md` «Evidence, not confidence»: đường ghi thông tin liên hệ (`lib/facts.ts`) «never overwrite a human».
  Trường tuỳ chỉnh chưa có luật tương đương.
- `docs/ai-ux.md` §4: Kara không ghi thẳng vào bản ghi; `set_field_value` đang lệch, sửa ở lượt `tac-tu-xin-duyet`
  (T3, chưa làm). Lượt này không làm thay lượt đó. Nó chỉ chặn chỗ mất dữ liệu trong lúc chờ.

## Hai lối

**Lối A — xuất xứ trên `FieldValue`.** Thêm cột ghi ai đặt giá trị (người, Kara, nạp tin đăng). API, nạp tin đăng
và Kara mỗi đường ghi đúng nguồn của mình. `writeField` chỉ từ chối khi ô đang giữ giá trị của người; giá trị Kara
tự điền thì Kara được làm mới. Cần `migration` ở `packages/db/prisma` (T3, thêm Cổng 1.5), sửa `FieldsService`,
`listing-ingest`, bộ đọc, và quyết cách đọc các hàng cũ (không biết nguồn thì coi là của người).

**Lối B — chặn mọi lần ghi lên ô đã có giá trị, trừ khi người gọi nói rõ là thay.** Không đổi lược đồ.
`writeField` luôn khoá và đọc ô trong cùng `transaction` (như nhánh `field-backfill` hôm nay), rồi:

| Phiên | Ô trống | Ô có giá trị, không cờ | Ô có giá trị, `replace: true` |
| --- | --- | --- | --- |
| có người (hội thoại) | ghi | từ chối, nói giá trị hiện có | ghi |
| nền (mọi loại tác vụ, lượt Tác nhân) | ghi | từ chối | từ chối |

Xoá (`value: null`) lên ô có giá trị cũng là thay, theo cùng bảng.

«Có người» không lấy từ lời model. Công cụ tính bằng `isAutomated(ctx.session)` (`lib/approval.ts`) — đúng luật mà
`quyenDoiTruong` dùng để từ chối việc đổi trường trong phiên không người. `writeField` nhận nó qua tham số bắt buộc
`unattended`, nên một người gọi mới quên truyền thì `check-types` đỏ.

Lời từ chối ở phiên có người nói giá trị hiện có và bảo Kara: chỉ thay khi người bán hàng đã bảo thay trong hội thoại
này («only if the rep asked you to in this conversation»), khi đó gọi lại với `replace: true`. Mô tả công cụ nói cùng
điều ấy. Câu điều kiện được ghim trong bài kiểm: một lý do chỉ bảo «gọi lại với `replace: true`» là lời mời Kara tự
thay, đúng thứ lượt này chặn.

Bài kiểm dựng phiên có người bằng `thanhVienPrincipal(<người>, "crm-app")` — hàm kênh `channels/eve.ts` dùng cho hội
thoại tab bản ghi — và phiên nền bằng `taskAuth`. Lượt Tác nhân không có hàm dựng riêng (khuôn viết liền trong
`runDeployedAgent`), nên bài kiểm chép khuôn ấy; đó là giới hạn đã khai.

## Máy khuyên lối B

- Chặn đúng chỗ mất dữ liệu ngay, không `migration`, đảo được bằng một lần revert.
- Xuất xứ là phần của lượt `tac-tu-xin-duyet`: ở đó Kara thôi ghi thẳng, giá trị đến dưới dạng đề xuất kèm nguồn
  (`dynamic-fields.md` §5 khuyên gộp vào `RecordFact`). Dựng cột xuất xứ riêng bây giờ là dựng một thứ lượt đó sẽ
  thay.
- Giá phải trả của B: tác vụ nền không làm mới được giá trị mà chính Kara điền trước đó. Hôm nay mất ít:
  `field-backfill` vốn chỉ điền ô trống, và nạp tin đăng (`listing-ingest`) ghi qua API, không qua `writeField`.

Đây là câu chỉ chủ kho trả lời (Hỏi-1 ở Cổng Phạm vi). Hợp đồng và evals viết theo lối B; chọn A thì soạn lại thành
T3.

## Mã đụng (lối B)

- `apps/agent/agent/lib/fields.ts` — `writeField` nhận `replace` và `unattended`; khoá và đọc ô ở mọi lần ghi.
- `apps/agent/agent/tools/set_field_value.ts` — khoá `replace` trong `inputSchema`, truyền
  `unattended: isAutomated(ctx.session)`.
- `apps/agent/test/kara-khong-ghi-de-truong.integration.spec.ts` — bài kiểm mới.
- `docs/agent.md` — một mục ngắn: luật không ghi đè của trường tuỳ chỉnh.

Không đụng `packages/db`, `apps/api`, giao diện.

## Đặc tả UX

Không có. Lượt này không chạm màn nào (sổ quyết định ghi bỏ).
