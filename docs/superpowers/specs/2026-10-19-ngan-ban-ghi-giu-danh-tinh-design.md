# Ngăn bản ghi giữ danh tính khi mở, đóng — thiết kế

Hàng VS8 của `docs/plan/lo-trinh-okr.json`, dãy R1 đợt `viec-du-an-kho-tai-lieu`. Cổng Đáng `build` (chủ kho,
2026-10-19T14:59:33Z). Mở từ Ngoài-8 của hồ sơ `ve-sinh-do-san-onehub`: «Khi đóng một bản ghi, ngăn bên phải có thể
biến mất đột ngột thay vì trượt ra.»

Câu giao: «Mở hay đóng ngăn bản ghi thì ngăn trượt ra, vào như cũ, không biến mất rồi hiện lại, mà vẫn chỉ nạp sẵn đúng
các khoá của #469».

## Gốc lỗi

`apps/app/components/crm/record-sheet/nap-san-khi-mo-ngan.tsx` (cách B của #469) trả về hai hình cây khác nhau:

```tsx
return stack.length > 0 ? (
	<HydrationBoundary state={state}>{children}</HydrationBoundary>
) : (
	children
);
```

Khi ngăn chuyển giữa rỗng và có bản ghi, React thấy kiểu phần tử ở vị trí con đổi (`RecordSheetHost` ↔
`HydrationBoundary`), nên gỡ cả cây con rồi dựng lại. `RecordSheetHost` mất hết trạng thái của nó:

- **Lúc đóng** (1 → 0): host mới dựng với `shown = null`, `DetailSheet` cũ bị gỡ ngay. Hiệu ứng `slide-out` 300 ms của
  `Sheet` (và của `Drawer` ở khổ hẹp) không có phần tử nào để chạy — ngăn biến mất đột ngột.
- **Lúc mở** (0 → 1): host mới dựng với `useSauKhiTaiXong()` = `false` từ đầu, nên ngăn đóng ở lượt vẽ đầu và chỉ mở
  sau một `requestIdleCallback` — trễ, và nếu đang dở hiệu ứng thì ngăn tắt rồi hiện lại.
- **Mở lại giữa lúc đang trượt ra** — cũng một lần gỡ và dựng, nên hiệu ứng không ngắt được giữa chừng (trái luật
  «Animations interruptible» của `web-design-guidelines`).

## Cách sửa

Giữ hình cây cố định, đổi đầu vào thay vì đổi hình:

```tsx
<HydrationBoundary state={stack.length > 0 ? state : undefined}>{children}</HydrationBoundary>
```

Vì sao đúng, theo mã `HydrationBoundary` của `@tanstack/react-query` 5.101.4 đang cài:

- `state` nhận `undefined` (kiểu `DehydratedState | null | undefined`) — ngăn rỗng thì không đổ khoá nào, đúng ca
  «ngăn rỗng không nạp» của #469.
- Khi `state` đổi từ `undefined` sang bản máy chủ, `useMemo([client, state])` chạy lại ngay trong lượt vẽ đó: khoá chưa
  có trong bộ đệm được đổ trước khi con đọc — trang trong ngăn đọc được dữ liệu ngay lượt vẽ đầu sau khi mở.
- Khoá đã có trong bộ đệm chỉ bị đổ lại khi bản máy chủ **mới hơn** (`dataUpdatedAt`). Đóng rồi mở lại không đè dữ liệu
  trình duyệt vừa đọc lại.

Không đổi `apps/app/app/(app)/[slug]/layout.tsx`, không đổi `RecordSheetHost`, không đổi `lib/ngan-ban-ghi-nap-san.ts`.

### Lối đã loại

- **Dời ranh giới đổ vào trong `RecordSheetHost`** (host nhận `state`, bọc phần thân của `DetailSheet`): đổi API của
  host mà VK7 của làn Mac Studio sẽ dùng (luật 20 của gói đợt: l5 → VS8 → VK7) — chạm vùng chung không cần thiết.
- **Chốt «đã đổ một lần»** (`useState` khoá cứng sau lần mở đầu): giữ thêm một trạng thái mà `HydrationBoundary` đã tự
  lo bằng so `dataUpdatedAt`; và lần mở sau không còn đổ bản mới hơn nếu máy chủ có.

## Đo thế nào

- **Bài DOM** `apps/app/test/ngan-ban-ghi-giu-danh-tinh.dom.tsx`: bọc một đầu dò trong `NapSanKhiMoNgan` thật, đi một
  ma trận viết trước bảy bước phủ cả năm hàm đổi ngăn của `useRecordStack` (`open`, `lotDuoi`, `close`, `thayDinh`,
  `closeAll`) trên `NuqsTestingAdapter hasMemory`; đếm số lần dựng và gỡ của đầu dò, và dãy giá trị
  `useSauKhiTaiXong()` sau khi trang đã tải xong. Cùng tệp: ca đổ khoá theo vai khi mở sau lúc rỗng, ca khoá cũ hơn
  bản máy chủ được nhận bản máy chủ, và ca không đè dữ liệu mới hơn.
- **Chiều đỏ của bài DOM** trên bản sao (`git worktree` tách rời, như `ve-sinh-do-san-onehub/rang/chieu-do.mjs`): trả
  tệp về bản của `onehub`, luôn đổ, đổ cưỡng bức, chỉ đổ khoá chưa có — mỗi đột biến đỏ với một thông điệp ghim.
- **Bản chạy thật** qua phiên đo (`scripts/lan-do/tien-de.mjs`), Thoả thuận seed `seed-deal-wise-1`, 1440 và 390:
  `MutationObserver` ghi lúc phần tử ngăn vào và rời trang, `getAnimations()` cho biết hiệu ứng trượt đang chạy hay đã
  xong — không phụ thuộc nhịp lấy mẫu; một dấu `dataset` gắn lên phần tử ngăn chứng cùng phần tử khi mở lại giữa chừng.
  Lượt chụp ảnh tách riêng, làm chậm hiệu ứng mười lần bằng CDP `Animation.setPlaybackRate` để ảnh rơi đúng giữa lúc
  trượt. Nhật ký sáu ô ghi vào `evidence/gdt-man.log` cho người chấm đối chiếu.
- **Chiều đỏ của phép đo màn** chạy trên đường sinh thật: `chieuDo` của `kho-tai-lieu/rang/man-lib.mjs` dựng phiên đo
  từ bản sao mang tệp cũ của `onehub` (thêm trễ 400 ms vào `sau-khi-tai-xong.ts` để lỗi mở trễ vượt ngưỡng) và đòi ba
  thông điệp ghim.
- Bài `ngan-ban-ghi-nap-san.dom.tsx` của #469, chiều đỏ «nap-san» và phép đo lỗi hydrat của `ve-sinh-do-san-onehub`
  chạy lại không sửa.

Giới hạn khai: lỗi lúc mở của bản cũ là trễ một nhịp rảnh, không phải biến rồi hiện; trên máy rảnh nhịp đó có thể dưới
ngưỡng 150 ms, nên phép đo «mở» là thước giữ-không-hồi-quy.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách (Công ty, Liên hệ, Thoả thuận…) → bấm một dòng → ngăn bản ghi trượt vào từ phải (1440) hoặc từ
  dưới (390) → bấm đóng, Esc hoặc bấm ra ngoài → ngăn trượt ra (điểm ra: danh sách, `record=` rỗng).
- Biên: mở thẳng đường dẫn có `record=` lúc trang đang tải — ngăn chờ trang tải xong rồi mới mở (giữ như #469); mở
  chồng bản ghi thứ hai rồi đóng hết.
- Lỗi & quay lại: bấm mở lại khi ngăn đang trượt ra → ngăn quay lại mở từ chỗ đang dở, không tắt rồi hiện lại.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ngăn bản ghi | Xem và sửa một bản ghi mà không rời danh sách | Từ dòng của danh sách / về danh sách |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ngan-dang-mo | Ngăn bản ghi | Ngăn trượt vào trong 300 ms, nội dung bản ghi có ngay nhờ nạp sẵn | Đọc, sửa |
| ST-ngan-dang-dong | Ngăn bản ghi | Ngăn trượt ra trong 300 ms, nội dung cũ vẫn thấy tới khi khuất | Chờ, hoặc mở lại |
| ST-ngan-mo-lai-giua-chung | Ngăn bản ghi | Ngăn đang trượt ra quay lại mở, cùng phần tử | Đọc tiếp |
| ST-ngan-rong | Danh sách | Không có ngăn; bộ đệm không mang khoá nạp sẵn | Bấm một dòng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Hiệu ứng trượt là của `Sheet`/`Drawer` trong `packages/ui`, không đổi: 300 ms, chỉ `transform`/`opacity`.
- Khổ dưới `md` dùng `Drawer` (trượt từ dưới), từ `md` trở lên dùng `Sheet` phải — cả hai giữ danh tính như nhau.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `HydrationBoundary` (`@tanstack/react-query`) | dùng | Luôn có mặt, đổi `state` thay vì đổi hình cây |
| `DetailSheet`, `Sheet`, `Drawer` | dùng | Không đổi; hiệu ứng có sẵn chỉ cần phần tử không bị gỡ |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — ngăn bản ghi là phần chi tiết mở trên danh sách, việc này không đổi bố cục, không tra mẫu.
<!-- UX-SPEC-TEMPLATE>>> -->
