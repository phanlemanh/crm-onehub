# Review findings — nhan-ung-dung-noi-tieng-viet (round 7)

## Trong hợp đồng

- **Nhãn kiểu trường vẫn tiếng Anh do máy chủ đúc sẵn, không thể theo người đọc**
  file: `apps/app/components/crm/fields/fields-list.tsx:338`
  severity: high
  AC: AC-2
  `serializeField` ở `packages/db/src/fields.ts:57` tính sẵn `typeLabel: typeLabel(definition.type)` — một chuỗi hiển thị tiếng Anh cứng từ `packages/db/src/fields-shape.ts:60` — rồi đẩy nó qua hợp đồng tRPC (`apps/api/src/fields/fields.contracts.ts:89` và ba contract companies/contacts/deals cùng khai `typeLabel: z.string()`).

  Tấm Trường vẽ chuỗi đó nguyên xi ở dòng 338 (`{field.typeLabel}` trong Badge), và dòng 224 còn gọi thẳng `typeLabel(template.type)` nhập từ `@crm/db/fields-shape`. Máy chủ không biết người đọc chọn tiếng gì, nên chuỗi này không bao giờ đi theo được người đọc.

  Vòng này đã dựng sẵn lối đúng — `fieldTypeLabel(type, locale)` ở `apps/app/components/crm/fields/fields-copy.ts:98` — nhưng chỉ đấu vào một chỗ, ô Select của `field-editor.tsx:292`. Kết quả: người đọc tiếng Việt mở tấm Trường thì ô chọn kiểu là tiếng Việt, còn huy hiệu kiểu ngay cạnh nó là tiếng Anh. Tấm này mở ra từ hồ sơ bản ghi qua `FieldsCog`, đúng nhánh AC-1 hứa ("kể cả chữ chỉ hiện ra sau khi mở một menu hay hộp thoại") và AC-2.

  Máy quét chuỗi tĩnh không thấy được vì chữ đến từ API lúc chạy, nên E15 vẫn PASS.

  Sửa: bỏ `typeLabel` khỏi `SerializedField`, để chỗ vẽ gọi `fieldTypeLabel(TYPE_KEY[field.type], locale)`.

- **`companies.ts` dùng khuôn khác bốn kho chuỗi anh em, mất chốt biên dịch mà AC-12 hứa**
  file: `apps/app/lib/messages/companies.ts:122`
  severity: medium
  AC: AC-12
  Bốn kho chuỗi kia (`crm.ts:617`, `deals.ts:162`, `contacts.ts:137`, `record-sheet.ts:374`) đều theo đúng khuôn của `packages/ui/src/lib/messages.ts`: `const en` → `export type XMessages = typeof en` → `const vi = {…} satisfies XMessages` → `const BANG = { en, vi } satisfies Record<Locale, XMessages>`.

  `companies.ts` một mình đi lối khác: một object `MESSAGES` bọc cả hai tiếng với `as const`, rồi `export type CompanyMessages = (typeof MESSAGES)[Locale]`. Không có `satisfies` nào so `vi` với `en`.

  Hệ quả cụ thể: `vi` không bị kiểm ở chỗ khai. Một khoá thừa trong `vi` không bao giờ bị bắt; một khoá thiếu chỉ vỡ nếu có chỗ gọi đọc đúng khoá đó — khoá không ai đọc thì lọt. AC-12 của contract hứa "một khoá tiếng Việt thiếu làm hỏng bản dựng"; ở riêng file này lời hứa đó chỉ còn được `apps/app/test/messages-guard.spec.ts` đỡ lúc chạy, không phải trình biên dịch.

  Sửa: tách `const en` / `const vi = {…} satisfies CompanyMessages` / `BANG` như bốn file kia.

- **Deal sheet delete confirmation is hardcoded English; its translation key is dead**
  file: `apps/app/components/crm/record-sheet/deal-sheet.tsx:218`
  severity: high
  AC: AC-2
  `consequence={`Its stage history, notes and agent conversations go too. ${deal.company.name} and the ${deal.contacts.length === 1 ? "person" : "people"} on it stay in the CRM.`}` is still an English template literal.

  `recordSheetMessages(locale).deal.deleteWarning(company, people)` was written for exactly this string (and `deal.person` / `deal.people` for the count word), and is never called from anywhere. A Vietnamese reader gets English in the one dialog that confirms an irreversible delete. The guard in finding #1 is what let this through.

- **Contact sheet delete confirmation is hardcoded English; its translation key is dead**
  file: `apps/app/components/crm/record-sheet/contact-sheet.tsx:225`
  severity: high
  AC: AC-2
  `consequence={`Their notes, agent conversations and everything the agent found go too; emails and meetings stay filed against the company.${contact.email ? ` The sync will not bring ${contact.email} back — only adding them yourself will.` : ""}`}`

  `recordSheetMessages(locale).contact.deleteWarning` holds the first sentence verbatim and is never called; the second (email-suppression) sentence has no key at all. Same irreversible-delete dialog, same English-in-Vietnamese result.

- **Untranslated labels left in the round's own scope**
  file: `apps/app/app/(app)/[slug]/deals/deals-bulk-actions.tsx:195`
  severity: medium
  AC: AC-1
  `<DropdownMenuSubTrigger>Change stage</DropdownMenuSubTrigger>` — no message key exists for this string in any of the five stores, so it was missed rather than deferred. It sits in the Deals bulk-actions menu, on one of the three list screens the round claims to cover.

  Same class, same scope: `apps/app/components/crm/record-sheet/deal-sheet.tsx:573` renders `<span className="sr-only">Take {contactName(contact)} off this deal</span>` in English, while the visible tooltip beside it uses `m.deal.takeOff`. The screen-reader label and the tooltip now disagree in Vietnamese.

  Neither is reachable by the automated measures: `khai-tieng.mjs` only opens the deals table and never opens the bulk menu, and `kiem-ke.mjs` is an inventory printer with no exit code.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây là thật, nhưng nằm ngoài phạm vi đã duyệt ở Cổng 1 — người quyết, máy không tự sửa.

- **Khoá thông điệp đi lậu trong trường `label`, mất kiểm tra biên dịch**
  Người dùng thấy gì: Nếu một dòng chữ trong khối liên kết mạng xã hội của công ty bị đặt sai, người xem hồ sơ công ty có thể thấy một đoạn mã kỹ thuật thay vì chữ tiếng Việt, mà không ai phát hiện trước khi phát hành.
  file: `apps/app/lib/social-links.ts`
  severity: high
  Đề xuất: known-limits

- **Sáu bản đồ `satisfies Record<RecordKind|FieldEntity, …>` bị đổi thành chuỗi if có nhánh rơi im lặng**
  Người dùng thấy gì: Nếu sau này có thêm một loại bản ghi hoặc loại trường mới, tên hiển thị của loại đó trên màn hình có thể sai — ví dụ hiện nhầm chữ của 'thoả thuận' — mà không ai nhận ra trước khi phát hành.
  file: `apps/app/components/crm/fields/fields-copy.ts`
  severity: medium
  Đề xuất: known-limits

- **Thước `dot-bien` ghi đè năm file mã nguồn đã theo dõi, dựa vào chụp-rồi-trả**
  Người dùng thấy gì: Nếu công cụ đo tự động bị dừng đột ngột giữa chừng, một số chữ tiếng Việt trên các màn công ty, cá nhân, thoả thuận có thể vô tình bị ghi đè ngược sang tiếng Anh trong kho mã nguồn mà không ai nhận ra ngay.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/dot-bien.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bộ xác minh lưới xoá file trong `.turbo/runs` mà nó không tạo, và xoá trước khi báo lỗi**
  Người dùng thấy gì: Khi việc kiểm tra trước khi đẩy mã phát hiện lỗi, bằng chứng cần thiết để tìm nguyên nhân có thể đã bị xoá mất, khiến việc sửa lỗi chậm lại — người dùng cuối không thấy ảnh hưởng trực tiếp.
  file: `scripts/verify-gate-shape.mjs`
  severity: low
  Đề xuất: known-limits

- **Dead-key guard cannot fail: it matches any quoted word anywhere in the source**
  Người dùng thấy gì: Một phép kiểm tra tự động dùng để tìm chữ dịch bị bỏ quên có thể báo 'an toàn' dù thực ra không có màn hình nào dùng tới dòng chữ đó, nên chữ tiếng Anh sót lại có thể không bị phát hiện trước khi phát hành.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Unused locale hook left in DetailSheet**
  Người dùng thấy gì: Không ảnh hưởng gì tới người dùng — đây là một dòng mã thừa, không hiển thị hay thay đổi bất kỳ chữ nào trên màn hình.
  file: `apps/app/components/detail-sheet.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 4 — khẳng định âm-tính-một-mình: chuỗi không hiện ở CẢ HAI thứ tiếng vẫn tính là đạt**
  Người dùng thấy gì: Phép đo cho năm chuỗi đã biết lỗi từ vòng trước có thể báo 'đã dịch xong' ngay cả khi một chuỗi thật ra không còn hiện ra ở đâu để kiểm tra, nên một chỗ bị gỡ nhầm hoặc hỏng có thể không bị phát hiện.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/no-vong-1.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình 2 — fixture viết tay đứng thay enum máy chủ: danh sách giai đoạn là hằng trong file đo**
  Người dùng thấy gì: Nếu sau này thêm một giai đoạn thoả thuận thứ tám, phép kiểm tra hiện tại sẽ không nhận ra và không báo lỗi, nên giai đoạn mới có thể hiển thị sai mà không ai biết.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs`
  severity: high
  Đề xuất: new-contract

- **Hình 1 — đo chỉ dẫn thay vì đầu ra: chặn "khoá chết" grep định danh toàn app, không hỏi renderer có đọc khoá không**
  Người dùng thấy gì: Phép kiểm tra dùng để tìm chữ dịch không còn được dùng tới hiện chỉ tìm tên xuất hiện ở bất kỳ đâu trong toàn bộ ứng dụng, không chứng minh có màn hình nào thực sự đọc và hiện chữ đó, nên một dòng chữ không còn ai dùng vẫn được báo là an toàn.
  file: `apps/app/test/messages-guard.spec.ts`
  severity: high
  Đề xuất: new-contract

- **Hình 3 — assert chuỗi có mặt trong khi lời hứa là quan hệ vi-có ⟂ en-không-có**
  Người dùng thấy gì: Phép đo hiện chỉ xác nhận có chữ tiếng Việt xuất hiện, không xác nhận chữ tiếng Anh tương ứng đã biến mất, nên một màn vừa có tiếng Việt vừa còn sót tiếng Anh vẫn có thể được báo là đạt.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/may-chu-ve.sh`
  severity: high
  Đề xuất: new-contract

- **Hình 5 — tuyên quét lớp bề mặt ẩn nhưng chỉ chạy điểm-case, và phép đếm bề mặt là hằng đúng**
  Người dùng thấy gì: Phép đo bề mặt ẩn của hồ sơ bản ghi hiện chỉ mở các tab, không mở menu hành động, ô sửa tại chỗ, hay hộp thoại xác nhận, và luôn tự báo 'đủ' bất kể có bỏ sót gì, nên chữ tiếng Anh sót trong các bề mặt đó có thể không bị phát hiện.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/ban-ve.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình 1 — đo dữ liệu đầu vào thay vì màn hình: E11 không hề dựng trình duyệt**
  Người dùng thấy gì: Phép đo cho ba trường hợp dữ liệu biên (không người phụ trách, vừa có hoạt động, tên dài) chỉ kiểm tra dữ liệu thô từ máy chủ, không thực sự mở màn hình lên xem, nên chữ hiển thị sai hoặc bố cục vỡ ở các trường hợp này có thể không bị phát hiện.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/du-lieu-bien.mjs`
  severity: medium
  Đề xuất: new-contract

- **Hình 1 + hình 4 — chân chống-lách tự chứng minh bằng cách grep mã nguồn, và không có đối chứng dương**
  Người dùng thấy gì: Bộ chặn 'phép đo giả' dùng để bảo đảm các phép đo khác thực sự mở ứng dụng lên kiểm tra lại tự kiểm tra bằng cách đọc mã nguồn, và chưa có phép thử nào chứng minh nó thực sự bắt được một phép đo giả, nên một phép đo giả có thể lọt qua mà không ai biết bằng chứng nghiệm thu là thật hay không.
  file: `_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khong-may-quet.sh`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

(không có)

⚠ Cụm ngoài vùng phủ: 4/18 lỗi rơi vào file không bộ đo nào phủ (apps/app/lib/social-links.ts, scripts/verify-gate-shape.mjs, apps/app/test/messages-guard.spec.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.