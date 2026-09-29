# Thanh biểu tượng hydrat khớp máy chủ — thiết kế

Ngày: 2026-09-29 · Hồ sơ: `_acceptance/hydrat-thanh-bieu-tuong/` · Hạng: T2

## Vấn đề

Ngày 28/09, phép đo màn `canh-kr-okr` (`_acceptance/canh-kr-okr/rang/man-canh-kr.mjs`)
bắt được lỗi React «Hydration failed» ở `AppIconRailFallback` (`apps/app/components/app-icon-rail.tsx`),
phần lệch là thuộc tính `aria-busy`. Lỗi chập chờn: thước đó phải tách nó ra dòng
«ngoai pham vi» (`LOI_NGOAI`), và mọi thước màn khác coi lỗi console là đỏ có thể lật màu vì nó.

## Gốc

`AppIconRail` quyết vẽ bản chờ (`AppIconRailFallback`, `<nav aria-busy="true">` với nút tắt)
hay bản đủ (liên kết) bằng `workspace.data !== undefined` của `useQuery(workspace.get)` —
tức bằng trạng thái của cache TanStack dùng chung cho cả cây.

`RailTheoVai` (layout `[slug]`) bọc thanh trong `HydrateClient` → `HydrationBoundary`.
`HydrationBoundary` (TanStack Query 5.101) nạp dữ liệu ngay trong lượt render **chỉ cho truy
vấn chưa có trong cache**; truy vấn đã tồn tại — kể cả đang `pending` không dữ liệu — bị hoãn
tới `useEffect`. Vậy lượt render đầu của thanh phụ thuộc việc thành phần nào khác đã chạm
`workspace.get` trước nó, và thứ tự đó khác nhau giữa hai phía:

- Máy chủ: Fizz dựng vỏ trước (vd `RecordSheetHost` → `ObjectiveSheet` → `BangKr` →
  `useXemDuocBanGhi` → `useQuery(workspace.get)` tạo truy vấn rỗng), biên Suspense của thanh
  tới sau → hoãn → vẽ bản chờ.
- Trình duyệt: fetch của thành phần khác có thể về trước khi biên của thanh hydrat → cache đã
  có dữ liệu → vẽ bản đủ. Hoặc ngược lại.

Hai phía lệch → React báo lỗi hydrat và dựng lại cây phía trình duyệt. Chữ ký lỗi tái hiện
được tất định trong jsdom (renderToString với cache có truy vấn rỗng, hydrateRoot với cache
có dữ liệu): diff đúng `aria-busy="true"` ở phía máy chủ, liên kết ở phía trình duyệt.

Trên ứng dụng thật, 60 lượt tải sáu màn không dữ liệu OKR, rồi 64 lượt có bộ OKR mẫu, không bắt
được lần nào. Điều kiện kích hoạt cần một thành phần khác chạm `workspace.get` ngoài biên hydrat
của thanh vào đúng khe thời gian giữa vỏ và biên của thanh; đường cụ thể trên ứng dụng thật
(ví dụ bảng KR) là giả định, chưa bắt được. Bản sửa không dựa vào giả định đó: lượt render
đầu của thanh thôi đọc cache, nên đường nào chạm cache trước cũng không đổi được nó.

## Cách sửa (đã chọn)

`RailTheoVai` đã `await loadWorkspace()` trên máy chủ. Nó truyền phần thanh cần xuống làm
prop: `workspace={workspace ? { viewerRole: workspace.viewerRole } : null}`. Luật `AGENTS.md`
«A server page computes. A client component renders.»

`AppIconRail({ workspace })`:

- `const hydrated = useHydrated()` (móc có sẵn ở `apps/app/lib/use-hydrated.ts`: `false` ở
  máy chủ và ở lượt render hydrat, `true` sau đó).
- Nguồn vai = `(hydrated ? truyVan.data : undefined) ?? workspace`. Lượt render hydrat chỉ
  đọc prop — hai phía cùng giá trị đã tuần tự hoá, không phụ thuộc cache. Sau hydrat, dữ liệu
  truy vấn (khi có) ghi đè — giữ hành vi cũ: đổi vai thì thanh theo.
- Nguồn vai rỗng (máy chủ không tải được workspace và cache chưa có) → bản chờ như cũ.

Prop bắt buộc, nên nơi gọi quên truyền là lỗi `check-types`, không phải lỗi chạy.

Giao diện không đổi: cùng hai bản vẽ, cùng lớp, cùng thành phần `@crm/ui`. Không chạm
`packages/ui`.

## Phương án đã loại

1. **Chỉ truyền prop, bỏ `useHydrated`.** Ca máy chủ không tải được workspace vẫn còn lệch
   (máy chủ vẽ bản chờ, trình duyệt có thể đã có dữ liệu). Loại vì để lại đúng lớp lỗi này ở
   một nhánh.
2. **Bỏ hẳn `useQuery` khỏi thanh, chỉ dùng prop.** Tất định nhưng mất hai hành vi đang có:
   thanh tự hồi khi máy chủ lỡ không tải được workspace, và thanh theo vai mới khi truy vấn
   làm mới. Loại.
3. **Sửa ở `HydrateClient`: nạp ngay trong render cả truy vấn đã tồn tại mà chưa có dữ liệu.**
   Chữa cả họ lỗi (thanh, `AppHeader`…) nhưng đổi ngữ nghĩa hydrat cho mọi màn, và vẫn không
   phủ ca máy chủ không có dữ liệu. Loại cho vòng này; `AppHeader` cùng họ (nhãn workspace đọc
   `workspace.data?.name`) đi việc riêng.

## Kiểm

`apps/app/test/thanh-bieu-tuong-hydrat.dom.tsx` — `renderToString` + `hydrateRoot` với
`onRecoverableError`, cache hai phía dựng lệch nhau có chủ đích. Năm ca e1–e5, map AC ở
contract. Bộ nghe lỗi bắt cả `onRecoverableError` lẫn `console.error` (React 19 báo lệch
thuộc tính thuần qua kênh sau), có hai ca `e0` đối chứng dương. Trước sửa: e1–e5 đỏ (e1/e2
đúng thông điệp «Hydration failed» với `aria-busy="true"` trong diff).

`_acceptance/hydrat-thanh-bieu-tuong/rang/man-thanh.mjs` — ứng dụng thật trên phiên đo riêng,
bộ OKR mẫu, người vai `admin` và `okr`, bốn màn (OKR, sheet mục tiêu, sheet KR, Tổng quan):
đếm liên kết của thanh trong HTML máy chủ, bắt lỗi hydrat qua N lượt Chrome, chụp thanh. Chạy
trên mã trước vòng: 0/64 lượt lỗi, 8/8 HTML sạch — lỗi thật chưa tái hiện được trên ứng dụng.

## Ngoài vòng

- Bỏ bộ lọc `LOI_NGOAI` trong `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs` — hồ sơ đã ký,
  vòng riêng.
- `AppHeader` cùng họ lỗi — việc riêng.
