# Làm mới thẻ gợi ý mở kế hoạch khi đổi giai đoạn trên sheet deal — design

Hồ sơ: `_acceptance/lam-moi-goi-y-ke-hoach/` · Ngoài-16 của `goi-y-mo-ke-hoach` (DA3b) · hạng T2.

## 1. Vấn đề

`TheGoiYKeHoach` (`apps/app/components/crm/record-sheet/goi-y-ke-hoach.tsx`) đọc `onboarding.goiYCuaDeal({ dealId })`.
App để mọi query tươi 30 giây (`apps/app/lib/trpc/query-client.ts`). Sau khi đổi giai đoạn, mọi đường gọi
`useCrmCache().deal(id)`; khối `deal` của `apps/app/lib/trpc/cache.ts` làm mới `deals.byId`, danh sách, dòng thời
gian… nhưng không làm mới `goiYCuaDeal`. Thẻ luôn được dựng trong sheet (không phụ thuộc giai đoạn), nên query của
nó còn sống và giữ kết quả cũ: sang thắng thì `null` cũ — không thẻ; rời thắng thì gợi ý cũ — thẻ còn.

## 2. Mọi đường đổi giai đoạn phía app

| Đường | Tệp | Làm mới sau khi xong |
|---|---|---|
| Thanh giai đoạn trên sheet | `apps/app/components/crm/stage-stepper.tsx` | `cache.deal(dealId)` |
| Menu giai đoạn đầu sheet, ô giai đoạn ở bảng, hộp lý do thua | `apps/app/components/crm/stage-change.tsx` (`useStageMutation`) | `cache.deal(variables.id)` |
| Kéo thả Kanban | `apps/app/app/(app)/[slug]/deals/use-deal-board-move.ts` | `cache.deal(variables.id)` |
| Hàng loạt | `apps/app/app/(app)/[slug]/deals/deals-bulk-actions.tsx` | `cache.deal()` |
| Lưu trữ / sửa giai đoạn | `apps/app/app/(app)/[slug]/settings/giai-doan/*.tsx` | `cache.deal()` |

Mọi đường đi qua một lệnh, nên sửa ở lệnh ấy. Bốn hàng đầu (mọi lời gọi `deals.setStage`/`deals.bulkSetStage`)
được `rang/duong-doi-giai-doan.mjs` quét lại mỗi lượt (E10); hàng lưu trữ giai đoạn chỉ đọc lúc thiết kế.

Tiền đề phía máy chủ, không đổi ở vòng này: `DealsService` gọi `sinhGoiYKeHoach(tx, …)` ngay trong giao dịch đổi giai
đoạn (`apps/api/src/deals/deals.service.ts`), nên đọc `goiYCuaDeal` ngay sau `setStage` đã thấy gợi ý;
`OnboardingService.goiYCuaDeal` chỉ trả gợi ý «chờ» của deal có `giaiDoan.kind = WON`
(`apps/api/src/onboarding/onboarding.service.ts`), nên deal rời thắng thì đọc lại ra `null`. Hai điều này đã ký ở
DA3b (E1, E3) và vòng này chạy lại hai bài ấy (E8, E9).

## 3. Cách làm

Thêm khoá `goiYCuaDeal` vào phần **chờ** (`record`) của khối `deal`:

- `cache.deal(id)` → `trpc.onboarding.goiYCuaDeal.queryKey({ dealId: id })` — chỉ deal đó;
- `cache.deal()` → `trpc.onboarding.goiYCuaDeal.queryKey()` — mọi deal (hàng loạt, sửa giai đoạn).

Vì sao phần chờ chứ không phần nền: thẻ là thứ người vừa bấm chờ thấy; `StageStepper` chờ `cache.deal` xong mới báo
«đã cập nhật giai đoạn», và các ô sửa tại chỗ dùng `settle: "record"` vẫn chờ phần `record` — thẻ cập nhật cùng nhịp
với tiêu đề sheet.

Lối bị loại:
- Cho thẻ đọc `deal.stage` rồi tự làm mới khi giai đoạn đổi (`useEffect`): sửa ở chỗ đọc, trái luật «invalidate
  through useCrmCache, never at the call site» của `docs/api.md`, và chỉ phủ sheet.
- Hạ `staleTime` của query thẻ về 0: vẫn không đọc lại khi query đang sống mà không ai bảo nó; tốn thêm lượt đọc mỗi
  lần dựng.
- Gọi `invalidateQueries` cho `goiYCuaDeal` ngay trong `StageStepper` và `DealStageMenu`: bỏ sót Kanban và hàng loạt,
  hai chỗ phải nhớ.

## 4. Phép đo

- Bài kiểm DOM mới `apps/app/test/lam-moi-goi-y-ke-hoach.dom.tsx`, khung `khung-gop-y` như
  `goi-y-ke-hoach.dom.tsx`. Khung thay `useCrmCache` bằng bản rỗng; tệp mới bắt bản thật trước khi nạp khung rồi đặt
  lại sau, nên chính khối `deal` thật chạy trong bài kiểm. QueryClient của bài kiểm để `staleTime: 30_000` như app —
  không thì thẻ có thể «tự» đúng vì lý do khác.
- `rang/dot-bien.mjs` gỡ dòng mới trong bản sao kho và đòi bài kiểm đỏ với thông điệp ghim; đổi khoá theo deal thành
  khoá chung và đòi E4 đỏ «làm mới gợi ý deal khác».
- `rang/man.mjs` trên bàn đo của chính cây (phiên đo): bấm thật trên thanh giai đoạn, đo mili giây tới lúc thẻ
  hiện/mất; tự thử chiều đỏ bằng cách chặn mọi lần đọc lại `goiYCuaDeal`.
- `rang/khong-xoa-expect.mjs` chép từ `goi-y-mo-ke-hoach`, danh sách cho-phép rỗng.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: sheet deal đang mở, deal ở giai đoạn mở → bấm cột thắng (thanh giai đoạn) hay chọn thắng (menu đầu sheet) → thẻ gợi ý hiện ở đầu sheet cùng nhịp với nhãn giai đoạn mới (điểm ra: người bấm «Mở kế hoạch» hay «Bỏ qua» như DA3b).
- Biên: công ty đã có kế hoạch mở hay deal đã có gợi ý bị bỏ qua — máy chủ không sinh, thẻ không hiện (không đổi so với DA3b).
- Lỗi & quay lại: `setStage` lỗi → toast lời máy chủ như hôm nay, không làm mới gì, thẻ giữ nguyên; đọc lại gợi ý lỗi → không thẻ (đường `gy-the-an` của DA3b).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Sheet deal | xem và đổi giai đoạn của một deal | danh sách / Kanban / tìm nhanh → đóng sheet |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-sheet-vua-thang | Sheet deal | thẻ «Deal đã thắng — mở kế hoạch 30 ngày cho <công ty>?» hiện ngay sau khi nhãn giai đoạn đổi | Mở kế hoạch · Bỏ qua |
| ST-sheet-vua-roi-thang | Sheet deal | thẻ mất cùng nhịp với nhãn giai đoạn mới | tiếp tục làm việc trên deal |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Thẻ cập nhật cùng lúc với phần đầu sheet (cùng lượt chờ của `cache.deal`), không chờ hết 30 giây, không đóng mở lại sheet.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TheGoiYKeHoach` | dùng | không đổi giao diện — chỉ đổi lúc nó đọc lại dữ liệu |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — sheet deal là trang chi tiết của danh sách/Kanban; lượt này không thêm màn hay luồng.
<!-- UX-SPEC-TEMPLATE>>> -->
