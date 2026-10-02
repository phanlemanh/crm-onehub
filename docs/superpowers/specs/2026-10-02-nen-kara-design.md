# nen-kara — nền giao diện của Kara trong `packages/ui`

Ngày: 2026-10-02 · Hồ sơ: `_acceptance/nen-kara/` · Hạng: T2 · Cổng Đáng: build (Manh Phan)

Luật gốc: `docs/ai-ux.md` (mục 2, 3, 5, 6, 8, 10). Hình dạng mong muốn đã dựng tạm ở
`apps/app/app/proto/_modules/gop-y-dung-cho/kara.tsx` và trạng thái `ST-b-chi-tiet` của
`/proto/gop-y-dung-cho` (PR #230). Lượt này đưa hình dạng đó vào `packages/ui` để các
lượt sau (`gop-y-dung-cho`, `tu-vung-tac-tu`, `tac-tu-xin-duyet`) chỉ việc dùng.

## Mục tiêu

Mỗi lượt AI hôm nay tự dựng một kiểu vì `packages/ui` chưa có thứ để dùng. Sau lượt này
`packages/ui` có đủ năm món của mục 10, và không màn thật nào đổi thứ người dùng thấy.

## Hai câu mở của hồ sơ cơ hội — đã chốt ở S1 (chủ kho duyệt 02/10)

1. **Chỉ dựng nền.** Màn thật chỉ bị chạm ở ba chỗ, không chỗ nào đổi điều người dùng thấy:
   `okr/the-gop-y.tsx` và `components/crm/facts.tsx` thêm `density="card"`;
   `okr/khoi-tom-tat.tsx` thay `PhanHoi` riêng bằng thành phần phản hồi chung (giữ chữ,
   DOM, `data-phan-hoi`, đường gửi và lùi khi lỗi).
2. **Giữ `Confirmation` làm thân bản `card`; bản `inline` dựng trên `Item` mặc định.**
   Bỏ hẳn `Confirmation` thì `confirmation.tsx` thành mồ côi: cổng
   `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` đỏ, và AC-12 của hồ sơ đã ký
   `the-gop-y-okr` (đòi `confirmation.tsx` được ít nhất một màn dùng tới) hỏng. Sổ
   `docs/chat-ui.md` vẫn xếp `confirmation` vào Adopted đúng việc «duyệt một thay đổi AI
   đề xuất»; bản `card` vẫn là việc đó.

## Thành phần

| Thành phần (tệp) | API | Ghi chú |
| --- | --- | --- |
| `KaraMark` (`kara.tsx`) | `{ scope?: ReactNode }` | Icon `AiGenerate` (`aria-hidden`) + «Kara», thêm «· {scope}» khi có. `text-muted-foreground`, không màu riêng. |
| `KaraLabel` (`kara.tsx`) | `{ scope?, text?: ReactNode, reason: ReactNode, readAt?: ReactNode }` | `KaraMark` + chữ nhóm («2 góp ý») + nút ghost xs «Vì sao?» mở `Popover`: tiêu đề «Kara dựa trên gì», `reason`, dòng «Đọc lúc {readAt}». Nút chặn `click` và `keydown` nổi bọt (điểm cắm `nhanMucTieu` nằm trong hàng bấm được). Nhãn không phải nút gọi Kara làm lại. |
| `ProposedChange` (`proposed-change.tsx`) | thêm `density?: "inline" \| "card"` (mặc định `"inline"`), `decided.onUndo?: () => void` | Mọi prop cũ giữ nguyên nghĩa. `inline`: gốc là `Item` mặc định (không viền, không `Alert`, không `Card`), media là dấu tia sáng, thân giữ thứ tự nhãn → chữ cũ gạch → chữ mới → lý do, hàng nút ở `ItemActions`/chân như bản thẻ. `card`: như hôm nay, thân `Confirmation`. Cả hai mang `data-slot="proposed-change"` và thêm `data-density`. |
| `ProposedChangeReceipt` (`proposed-change.tsx`) | `{ decision, text, onUndo?, density? }` | Dòng biên nhận: icon dấu tích khi `accepted`, chữ, nút ghost «Hoàn tác» khi có `onUndo`. `role="status"`. Bỏ qua / bác: chữ mờ, vẫn ở chỗ. Giữ `data-slot="proposed-change-decided"` trên chữ để thước cũ đọc được. `ProposedChange` dùng nó khi có `decided`. |
| `AiFeedback` (`ai-feedback.tsx`) | `{ value: boolean \| null, onChange(v: boolean), pending?, label, thanks }` | `ToggleGroup` «Hữu ích / Không hữu ích» (chữ qua `messages.ts`, `label` là tên nhóm do màn đưa), dòng `role="status"` hiện `thanks` khi đã chọn và không đang gửi. Không gọi mạng: màn giữ việc gửi và lùi khi lỗi. |

Chữ mới đi qua `packages/ui/src/lib/messages.ts` (en + vi): `kara.name` («Kara»),
`kara.why` («Vì sao?»), `kara.whyTitle` («Kara dựa trên gì»), `kara.readAt`,
`proposedChange.undo` («Hoàn tác»), `aiFeedback.useful`, `aiFeedback.notUseful`. Khoá mới
được ghim trong `packages/ui/test/messages-guard.spec.ts`.

Vì sao mặc định `inline`: `docs/ai-ux.md` mục 5 gọi `inline` là mặc định, `card` chỉ khi
không có chỗ neo. Để mặc định trong mã khác mặc định trong luật thì màn mới quên prop sẽ
ra sai kiểu. Hai màn đang dùng là `card` (cột góp ý riêng; thẻ thông tin liên hệ chuyển
sang `inline` là việc của lượt `tu-vung-tac-tu`) nên ghi `density="card"` tường minh.

## Bản mẫu `/proto/nen-kara`

Mục mới trong `apps/app/app/proto/catalog.ts` + `registry.ts`, module
`apps/app/app/proto/_modules/nen-kara/`, chỉ ghép thành phần thật, dữ liệu giả, không
tRPC. Đây là mặt đo `ui-check` (AC-9) và mặt duyệt bằng mắt (AC-12).

## Phiên design-pass

Bỏ, có ghi tên trong sổ: hình dạng đã duyệt trên `/proto/gop-y-dung-cho`
`ST-b-chi-tiet` (PR #230, chủ kho đi qua phiên design-pass ngày 01/10). Lượt này không
đặt ra hình dạng mới, chỉ đưa hình dạng đó vào `packages/ui`; Cổng Phạm vi mở bản bấm
được ở đó.

## Tài liệu

- `docs/ai-ux.md` mục 10: ghi đã có gì, tên thành phần. Bảng «Lộ trình áp luật»: thêm
  lượt khung `muc-tieu-va-kr` đi trước `gop-y-dung-cho`; dòng `gop-y-dung-cho` ghi dựng
  trên `BangMucTieu` qua sáu điểm cắm của `DiemCam` (`_modules/muc-tieu-va-kr/diem-cam.ts`
  của proto khung): `nhanMucTieu`, `duoiMucTieu`, `duoiKr` dính hàng KR, `sauTenKr`,
  `dangMo`/`onDoiMo` mở hàng cha từ ngoài, giữ `data-muc-tieu`/`data-kr`; phần bấm được
  trong `nhanMucTieu` phải `stopPropagation()` — `KaraLabel` đã tự làm việc đó.
- `docs/chat-ui.md`: dòng `confirmation.tsx` ghi nó là thân bản `card` của
  `ProposedChange`; bản `inline` dựng trên `Item`.

## Ranh giới với lượt song song

Lượt khung `muc-tieu-va-kr` sở hữu `okr/khoi-muc-tieu.tsx`, `okr/bang-kr.tsx`,
`record-sheet/objective-sheet.tsx`, `packages/ui/src/components/simple-table.tsx`,
`packages/ui/src/lib/row-accent.ts`. Lượt này không chạm năm tệp đó. Cả hai cùng thêm
một mục vào `proto/catalog.ts` và `proto/registry.ts` — xung đột thêm dòng, hoà khi
hợp nhất. S4 hai bên xếp tuần tự; trước khi chạy S4 nhắn phiên «Phân tích và hoàn thiện
OKR».

## Bán kính hoá cũ

Mọi hồ sơ đã ký có `paths` phủ `packages/ui/**`, `proposed-change.tsx`, `facts.tsx`,
`khoi-tom-tat.tsx`, `packages/ui/src/lib/messages.ts`, `proto/catalog.ts` sẽ hoá cũ (đếm
02/10: khoảng 30 hồ sơ). Ghim lại một lượt ở commit cuối, sau khi hợp nhất `onehub`
(xem memory «Ghim lại đi cuối cùng»).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: đề xuất của Kara hiện ngay dưới thứ nó sửa (`inline`) → người bấm nút chính
  gọi đúng hậu quả → đề xuất thu thành dòng biên nhận «Đã … · Hoàn tác» tại chỗ (điểm
  ra: dòng biên nhận; bấm «Hoàn tác» đưa về đề xuất chờ hoặc giá trị cũ, tuỳ màn).
- Biên: không có chỗ neo (hội thoại, cột riêng) → `card`; đề xuất bị khoá (ô đang sửa
  chưa lưu) → nút chính khoá + lý do; bỏ qua → dòng mờ «Đã bỏ qua», không biến mất.
- Lỗi & quay lại: nhận bị từ chối → `FieldError` dưới đề xuất, nút còn bấm lại được;
  «Sửa» mở ô sửa, Esc/«Huỷ» về chờ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| `/proto/nen-kara` | Bày mọi trạng thái của năm thành phần nền để duyệt và đo | mục lục `/proto` / không đi đâu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-nenkara-nhan | /proto/nen-kara | «Kara · OKR · 2 góp ý» + «Vì sao?»; popover mở: «Kara dựa trên gì», lý do, «Đọc lúc 09:12» | đóng popover |
| ST-nenkara-inline-cho | /proto/nen-kara | Đề xuất `inline` dưới một dòng KR trong bảng: chữ cũ gạch → chữ mới tô, lý do, «Đổi tên KR» (tô) · «Sửa» (viền) · «Bỏ qua» (chữ) | nhận / sửa / bỏ qua |
| ST-nenkara-inline-khoa | /proto/nen-kara | Như trên, nút chính khoá + dòng lý do «Lưu thay đổi của KR trước» | lưu ô kia rồi nhận |
| ST-nenkara-inline-loi | /proto/nen-kara | Như chờ + dòng lỗi «Kara chưa ghi được — thử lại» | bấm lại |
| ST-nenkara-inline-sua | /proto/nen-kara | Ô sửa thay chữ mới, «Nhận bản đã sửa» (tô) · «Huỷ» | nhận bản sửa / Esc |
| ST-nenkara-bien-nhan | /proto/nen-kara | Dòng «✓ Đã đổi tên theo Kara · Hoàn tác» tại chỗ đề xuất; một dòng mờ «Đã bỏ qua» | Hoàn tác → về chờ |
| ST-nenkara-the | /proto/nen-kara | Bản `card` (thân `Confirmation`) trong một cột riêng, chờ và đã nhận | như inline |
| ST-nenkara-phan-hoi | /proto/nen-kara | «Hữu ích / Không hữu ích», sau khi chọn: dòng cảm ơn | đổi lựa chọn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Một nút tô màu mỗi đề xuất ở cả hai độ dày; nút khoá mang `aria-describedby` trỏ lý do.
- «Vì sao?» mở bằng chuột, chạm, Enter, Space; Esc đóng, focus về nút. Bấm nó trong một
  hàng bấm được không bật hàng.
- Dòng biên nhận là `role="status"` để trình đọc màn hình đọc «Đã …».
- Chữ người nhập và chữ Kara viết mang `translate="no"`; chữ của máy thì không.
- Khổ 390: hàng nút xuống dòng, không tràn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `Item`, `ItemMedia`, `ItemContent`, `ItemActions` | dùng | Thân `inline` là `Item` mặc định — luật mục 5 |
| `Confirmation` (AI Elements) | dùng | Thân `card`, giữ như hôm nay |
| `Popover` | dùng | Ô «Vì sao?» |
| `ToggleGroup` | dùng | Phản hồi, như tóm tắt tuần |
| `ProposedChange` | mở rộng | Thêm `density` và hoàn tác |
| `KaraMark`, `KaraLabel`, `ProposedChangeReceipt`, `AiFeedback` | tạo (bậc 5 của `docs/design.md`) | Tra bậc 1–4: `packages/ui` không có dấu AI hay dòng biên nhận; shadcn gốc không có; ReUI tra «ai badge», «undo», «feedback thumbs» — không có thành phần miễn phí cùng việc |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: thành phần nền chen vào màn sẵn có, không đặt khuôn IA mới; bản mẫu chỉ là một
cột cuộn bày trạng thái. Luồng hiển nhiên, không tra.
<!-- UX-SPEC-TEMPLATE>>> -->
