---
schema_version: 1
feature: Thanh biểu tượng bên trái hydrat khớp máy chủ — hết lỗi «Hydration failed» chập chờn ở AppIconRailFallback (aria-busy)
slug: hydrat-thanh-bieu-tuong
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-09-29-hydrat-thanh-bieu-tuong-design.md
approved_by:
approved_at:
veto_state: mo
veto_opened_at: 2026-09-28T23:51:26Z
---

# Acceptance Contract: hydrat-thanh-bieu-tuong

## Context

Phép đo màn `canh-kr-okr` (28/09) bắt được lỗi React «Hydration failed» chập chờn ở
`AppIconRailFallback`, lệch ở thuộc tính `aria-busy`, và phải tách nó ra dòng «ngoai pham vi».
Gốc: `AppIconRail` chọn bản chờ hay bản đủ theo cache TanStack dùng chung, mà
`HydrationBoundary` hoãn nạp dữ liệu cho truy vấn đã tồn tại — nên lượt render đầu ở máy chủ
và ở trình duyệt phụ thuộc thành phần nào khác chạm `workspace.get` trước. Cách sửa: máy chủ
truyền vai xuống làm prop; lượt render hydrat chỉ đọc prop; sau hydrat truy vấn ghi đè.
Chi tiết ở design doc.

Source input: yêu cầu của chủ kho 29/09 — tái hiện, tìm vì sao máy chủ và trình duyệt vẽ
khác `aria-busy`, sửa ở gốc, thêm test DOM đỏ trước khi sửa.

«Cache lệch» dưới đây nghĩa là: cache TanStack của một phía đã có sẵn truy vấn
`workspace.get` — rỗng (đang chờ, chưa dữ liệu) hoặc có dữ liệu — trước khi thanh render.

## Criteria

- AC-1: Given máy chủ biết vai `admin`, cache phía máy chủ có sẵn truy vấn `workspace.get` rỗng và cache phía trình duyệt đã có dữ liệu workspace, When thanh được dựng ở máy chủ rồi hydrat ở trình duyệt, Then React không báo lỗi hydrat nào; And HTML máy chủ không có `aria-busy`; And sau hydrat thanh có đủ số liên kết của `MUC_RAIL`.
- AC-2: Given máy chủ biết vai `admin`, cache phía máy chủ đã có dữ liệu và cache phía trình duyệt có sẵn truy vấn rỗng, When hydrat, Then React không báo lỗi hydrat nào; And HTML máy chủ không có `aria-busy`; And sau hydrat thanh có đủ số liên kết của `MUC_RAIL`.
- AC-3: Given máy chủ biết vai `okr` và cache hai phía đều có sẵn truy vấn rỗng, When hydrat, Then HTML máy chủ và thanh sau hydrat cùng có đúng số liên kết của `mucRailChoVai("okr")`, ít hơn `MUC_RAIL`; And không lỗi hydrat.
- AC-4: Given thanh đã hydrat với vai máy chủ `admin`, When dữ liệu truy vấn `workspace.get` về sau với vai `okr`, Then thanh đổi sang đúng số liên kết của `mucRailChoVai("okr")`.
- AC-5: Given máy chủ không tải được workspace (prop `null`), cache phía máy chủ có sẵn truy vấn rỗng và cache phía trình duyệt đã có dữ liệu, When hydrat, Then React không báo lỗi hydrat nào; And HTML máy chủ là bản chờ (`nav[aria-busy="true"]`, không liên kết); And sau hydrat thanh là bản đủ, không còn `aria-busy`.
- AC-6: Given ứng dụng thật trên phiên đo riêng có bộ OKR mẫu, một người vai `admin` và một người vai `okr`, When mỗi người tải `/okr`, sheet mục tiêu (`/okr?record=objective:<id>`), sheet KR (`/okr?record=kr:<id>`) và trang Tổng quan, Then HTML máy chủ (chưa chạy JS) có thanh không mang `aria-busy` và đúng số liên kết của vai (`MUC_RAIL` hoặc `mucRailChoVai("okr")`); And qua N lượt tải trong Chrome ở 1440, không lỗi hydrat nào nhắc thanh (bắt cả `pageerror` lẫn `console.error`); And sau khi tải thanh có đúng số liên kết của vai; And có ảnh thanh của từng vai.
- AC-7: Given cây sau vòng, When chạy bộ kiểm của kho (`test`, `check-types`, `lint`, `lint:slop`, `build`), Then tất cả xanh — gồm việc `layout.tsx` truyền prop bắt buộc `workspace` cho `AppIconRail`.

## Coverage

Bỏ quét `morphological-scan` — xem entry `descope` «bỏ coverage-scan» trong
`decisions.jsonl`. Không gian nhỏ, liệt tay đủ:

- Trục A — cache máy chủ trước khi thanh render: chưa có truy vấn | truy vấn rỗng | có dữ liệu [thước CE: ba nhánh của `HydrationBoundary` 5.101 — mới / đã tồn tại / đã tồn tại mà mới hơn]
- Trục B — cache trình duyệt lúc thanh hydrat: cùng ba giá trị như trục A [thước CE: như trên]
- Trục C — vai máy chủ đưa xuống: `admin` (đủ mục) | `okr` (rút gọn) | không tải được (`null`) [thước CE: `mucRailChoVai` có hai kết quả; `loadWorkspace` trả dữ liệu hoặc `null`]
- Trục D — thời điểm: lượt hydrat | sau hydrat khi truy vấn đổi
- Trục E — lớp đo: DOM jsdom (cache dựng lệch có chủ đích) | ứng dụng thật (layout, máy chủ, Chrome) [thước CE: hai lớp đang chạy được ở kho]
- Core: A-rỗng × B-dữ liệu × admin (AC-1); A-dữ liệu × B-rỗng × admin (AC-2); A-rỗng × B-rỗng × okr (AC-3); sau hydrat × truy vấn đổi vai (AC-4); A-rỗng × B-dữ liệu × null (AC-5); ứng dụng thật × admin/okr × bốn màn (AC-6).
- Later: A/B «chưa có truy vấn» — nhánh mới của `HydrationBoundary` nạp ngay trong render ở cả hai phía, vốn khớp trước vòng này; sau sửa lượt hydrat không đọc cache nên mọi ô trục A×B cho cùng kết quả.

## Out of scope

- Bỏ bộ lọc `LOI_NGOAI` trong `_acceptance/canh-kr-okr/rang/man-canh-kr.mjs` — hồ sơ đã ký, vòng riêng.
- `AppHeader` cùng họ lỗi (nhãn workspace đọc `workspace.data?.name` trong một `HydrateClient` khác) — việc riêng.
- Đổi `HydrateClient` hay ngữ nghĩa hydrat của TanStack cho toàn ứng dụng.
- Đổi giao diện hai bản vẽ của thanh (bản chờ, bản đủ, sheet di động).

## Notes

- Test đỏ trước khi sửa đã chạy: e1, e2 đỏ với «Hydration failed…» và `aria-busy="true"` trong diff; e3 đỏ (0 liên kết thay 4); e5 đỏ.
- Trên ứng dụng thật, mã TRƯỚC vòng không tái hiện được lỗi: 60 lượt tải sáu màn không dữ liệu OKR, rồi 64 lượt tải bốn màn có bộ OKR mẫu cho hai vai (thước E7 chạy trên mã cũ) — 0 lỗi hydrat. Gốc lỗi được xác nhận ở lớp DOM (cùng chữ ký: `aria-busy="true"` phía máy chủ, liên kết phía trình duyệt), chưa được xác nhận trên ứng dụng thật. Bản sửa làm lượt render đầu của thanh không đọc cache nữa, nên mọi thứ tự chạm cache đều khép — không riêng đường đã giả định.
- Phần «0 lỗi hydrat qua N lượt» của AC-6 xanh cả trước lẫn sau vòng trên ứng dụng thật; chiều đỏ của nó là bản sao thanh cố ý lệch theo `typeof window` (chứng bộ nghe thấy được lỗi của thanh), không phải bản trước vòng.
