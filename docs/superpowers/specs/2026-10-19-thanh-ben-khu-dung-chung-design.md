# Thanh bên khu dùng chung — thiết kế (VK1)

Hàng VK1 của `docs/plan/lo-trinh-okr.json`, đợt `vo-khu-muc-tieu`, dãy V1. Ô Cổng Đáng
`_acceptance/thanh-ben-khu-dung-chung/opportunity.md` (ký build 19/10, Phan Le Manh).

Câu giao: «Thành viên mở Cài đặt hay Hội thoại và gặp cùng một thanh bên khu — cùng bề
rộng, cùng nhãn nhóm, trên điện thoại thành một hàng cuộn ngang».

## Vấn đề

Hai bản của một mẫu:

| | Cài đặt | Hội thoại |
| --- | --- | --- |
| Tệp | `settings/settings-sidebar.tsx` | `components/agent-builder/agent-builder-sidebar.tsx` |
| Bề rộng | `w-56` (224px) | `w-[213px]` — số tự đặt, trái `docs/design.md` |
| Nhãn nhóm | `NavGroupLabel` | `div` 11px tự đặt cỡ, `tracking-[0.08em]` |
| Mục | `NavItem` | `Link` tô nền tay (`bg-muted`) — đúng dòng «Dấu hiệu vẽ tay» |
| Điện thoại | `NavStrip` cuộn ngang | ẩn; chỉ thấy trong ngăn của thanh biểu tượng |
| Đang tải | cùng thanh, mục khoá | khung xương riêng, cùng `w-[213px]` |

VK2 (vỏ khu Mục tiêu) là nơi thứ ba; bản mẫu `/proto/vo-khu-muc-tieu` (`2790552ac`) đã
dựng thanh của nó bằng đúng ba mảnh `NavGroup`/`NavItem`/`NavStrip`, thêm ô chu kỳ ở đầu
và một mục ở chân. Luật kho (`docs/design.md` mục «Vẽ tay là bậc cuối»): thứ khu khác cần
tới thì chuyển vào `packages/ui` trước, rồi mới dùng lần hai.

## Tra bậc (docs/design.md «Vẽ tay là bậc cuối»)

1. `packages/ui`: có `NavItem`, `NavGroup`, `NavGroupLabel`, `NavStrip` (`nav-item.tsx`) —
   các mảnh, chưa có khung ghép chúng. Dừng ở đây: khung mới ghép từ chính các mảnh này.
2. shadcn `sidebar` (chưa cài): thanh cấp ứng dụng có `SidebarProvider`, thu gọn, điện
   thoại mở thành `Sheet`. Sai chỗ (kho đã có thanh biểu tượng cấp ứng dụng) và sai hành vi
   điện thoại (câu giao đòi hàng cuộn ngang).
3. ReUI `c-*` — câu tìm «section sidebar navigation with grouped links that becomes
   horizontal scroll tabs on mobile»: `c-sidebar-3` dựng trên shadcn `sidebar`, cùng lý do loại.
4. Block Pro: `profile-9` (thanh bên cài đặt có nhóm), `app-shell-28` — bản vẽ bố cục, cả
   hai đổi thanh thành `Sheet` dưới `lg`. Không chép được hành vi điện thoại.
5. Không bậc nào có khung → dựng `AreaSidebar` trong `packages/ui/src/components/area-sidebar.tsx`.

## Thiết kế

### Thành phần `AreaSidebar` (packages/ui)

```tsx
<AreaSidebar label="Cài đặt" header={…} footer={…} busy={…} placement="area">
  <AreaSidebarGroup label="Không gian làm việc">
    <AreaSidebarItem asChild active>
      <Link href="/settings">Chung</Link>
    </AreaSidebarItem>
  </AreaSidebarGroup>
</AreaSidebar>
```

- `placement="area"` (mặc định) dựng hai bố cục cùng lúc, chọn bằng CSS ở mốc `md` (768px):
  - **máy tính**: `<aside data-slot="area-sidebar">` rộng `w-56`, viền phải; trong đó
    `header` (nếu có), một `<nav aria-label={label}>` cuộn dọc chứa các nhóm, rồi `footer`
    (nếu có) ghim đáy.
  - **điện thoại**: `<div data-slot="area-sidebar-strip">` gồm `header` (nếu có) và một
    `NavStrip aria-label={label}`; mọi mục của mọi nhóm thành một hàng ngang theo thứ tự
    nhóm, không nhãn nhóm, không `footer`. Mục đang mở tự cuộn vào giữa (hành vi sẵn có
    của `NavStrip`).
- `placement="panel"`: chỉ bố cục dọc, giãn đầy chỗ chứa, không ẩn ở khổ nào — dùng trong
  ngăn điện thoại của thanh biểu tượng.
- `children` được dựng **hai lần** (một lần mỗi bố cục), mỗi lần trong một ngữ cảnh mang
  `orientation`. `AreaSidebarGroup` đọc ngữ cảnh: dọc → `NavGroup` + `NavGroupLabel`
  (nhóm không `label` thì không nhãn); ngang → chỉ trả các mục. `AreaSidebarItem` là
  `NavItem` lấy `orientation` từ ngữ cảnh. Hook `useAreaSidebarOrientation()` cho bên gọi
  bỏ phần chỉ hợp với bố cục dọc (nút xoá trên dòng, câu rỗng, khung xương).
- `busy` đặt `aria-busy` trên cả hai `nav`.
- Tên chuyển cảnh `[view-transition-name:area-sidebar]` trên hai bố cục của
  `placement="area"`, thay `settings-sidebar` (một trang chỉ có một thanh khu, bố cục kia
  `display:none`). `placement="panel"` không mang tên: ở điện thoại ngăn của thanh biểu
  tượng mở cùng lúc với hàng ngang của trang.
- Không nhận `className`: bề rộng, viền, khoảng cách là của khung, không của nơi gọi.

### Cài đặt

`SettingsSidebar` và `SettingsSidebarFallback` dựng bằng `AreaSidebar`; dữ liệu, nhãn,
lọc theo vai, luật mục đang mở (`mucCaiDatDangMo`) giữ nguyên. DOM giữ những gì hồ sơ đã ký
`khung-trang-cai-dat` đọc: `aside nav`, `[data-slot=nav-group]`, `[data-slot=nav-group-label]`,
`[data-slot=nav-item]`, một `nav` ngoài `aside` cho hàng ngang, `nav[aria-label=Cài đặt]`.

### Hội thoại

- `AgentBuilderSidebar` dựng bằng `AreaSidebar label={danhSachHoiThoai}`:
  - `header`: nhãn «Hội thoại» và nút biểu tượng «Hội thoại mới» (như nay).
  - mỗi nhóm ngày (Hôm nay · Hôm qua · 7 ngày qua) là một `AreaSidebarGroup` mang nhãn
    `NavGroupLabel`; mỗi hội thoại là `AreaSidebarItem asChild active` bọc `Link`, có biểu
    tượng trạng thái (đang chạy · chưa đọc · đã giao) và tiêu đề `truncate`, `translate="no"`.
  - dọc: mỗi dòng có `DeleteChatAction` như nay; ngang: không.
  - nhóm «Tác nhân của đội»: nhãn là liên kết tới `/agents` kèm số đếm; mỗi tác nhân một
    `AreaSidebarItem`.
  - không hội thoại nào trong 7 ngày: dọc hiện câu «trongBayNgay» như nay; ngang không có
    mục hội thoại.
  - bấm hội thoại chưa đọc vẫn gọi `markRead`; `onNavigate` vẫn gọi sau mỗi lần bấm.
- `AgentBuilderShell` đổi thành `flex-col md:flex-row` như layout Cài đặt, để hàng ngang
  nằm trên nội dung ở điện thoại.
- Layout `(agent-builder)` bỏ `className="hidden w-[213px] …"`; `AgentBuilderSidebarFallback`
  dựng bằng `AreaSidebar busy` với khung xương trong bố cục dọc.
- `AgentBuilderSidebar` nhận `placement: "area" | "panel"` **bắt buộc** (không mặc định),
  để nơi gọi quên prop là lỗi kiểu chứ không lặng lẽ rơi về `area`. Layout truyền `area`;
  ngăn điện thoại của thanh biểu tượng (`app-icon-rail.tsx`) truyền `panel` thay
  `className="flex flex-1"`.

### Luật giao diện

`docs/design.md` thêm mục «Thanh bên khu và thẻ con» dưới «Nếp màn trong app»:

- **Thanh bên khu** (`AreaSidebar`): một khu có nhiều nơi đến ngang hàng mà người đi qua
  lại — Cài đặt, Hội thoại, Mục tiêu. Đặt trong `layout.tsx` của khu, một khu một thanh,
  nhóm có nhãn danh từ; điện thoại tự thành hàng cuộn ngang.
- **Thẻ con** (`Tabs variant="line"`, mục «Thẻ con của trang»): các phần của MỘT vật mở
  trên một trang — một bộ OKR (OKR · Họp tuần · Việc · Sơ đồ · Chấm điểm), một bản ghi.
  Không nhóm, ít thẻ, cùng tiêu đề trang.
- Một màn tối đa một thanh bên khu và một hàng thẻ con; thẻ con không lồng thẻ con.
- Dòng mới trong «Dấu hiệu vẽ tay»: `<aside>` tự đặt bề rộng cho điều hướng của khu →
  `AreaSidebar`.

`docs/settings.md` mục «Thanh bên» trỏ sang `AreaSidebar`.

## Không làm

- Khu Mục tiêu (VK2) — dùng thành phần này ở hàng kế.
- Đổi ngăn điện thoại của thanh biểu tượng: vẫn liệt hội thoại dọc, có nút xoá và tác nhân
  của đội — hàng ngang không mang nút xoá.
- Thu gọn thanh bên thành biểu tượng, tìm trong thanh bên, phím mũi tên giữa các mục.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh biểu tượng → Cài đặt (hay Hội thoại) → thanh bên khu hiện bên trái ở máy
  tính, hàng ngang trên nội dung ở điện thoại → bấm một mục → trang mở, mục đó sáng
  (`aria-current`) (điểm ra: trang của mục).
- Biên: vai chỉ OKR thấy một nhóm Bảo mật (Khoá API); Hội thoại không có cuộc nào trong 7
  ngày → chỉ nhóm Tác nhân của đội; tiêu đề hội thoại rất dài → cắt bằng dấu ba chấm.
- Lỗi & quay lại: không có luồng lỗi riêng; dữ liệu chưa về thì thanh ở trạng thái đang tải,
  giữ nguyên bề rộng.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Cài đặt (mọi trang con) | đi giữa các trang cài đặt của không gian | thanh biểu tượng / trang cài đặt khác |
| Hội thoại (`/chat`, `/chat/[id]`, `/agents/[id]`) | đi giữa các cuộc hội thoại và tác nhân | thanh biểu tượng / cuộc khác |
| Ngăn điện thoại của thanh biểu tượng (mục Hội thoại) | chọn khu hoặc cuộc hội thoại | nút menu / trang của cuộc |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-caidat-loading | Cài đặt | thanh đủ bốn nhóm, mục khoá, `aria-busy` | chờ |
| ST-caidat-dangmo | Cài đặt | đúng một mục sáng | bấm mục khác |
| ST-caidat-dienthoai | Cài đặt <768 | hàng ngang mọi mục, không nhãn nhóm, mục đang mở ở giữa | vuốt ngang, bấm |
| ST-hoithoai-loading | Hội thoại | thanh rộng 224px, nhãn «Hội thoại», khung xương, `aria-busy` | chờ |
| ST-hoithoai-rong | Hội thoại | câu «Không có hội thoại trong 7 ngày», nhóm Tác nhân của đội | bấm Hội thoại mới |
| ST-hoithoai-dangmo | Hội thoại | cuộc đang mở sáng, nút xoá hiện khi rê | bấm cuộc khác, xoá |
| ST-hoithoai-dienthoai | Hội thoại <768 | dòng «Hội thoại +», hàng ngang các cuộc rồi tác nhân | vuốt ngang, bấm |
| ST-hoithoai-ngan | Ngăn thanh biểu tượng | thanh dọc đủ nhóm, nút xoá | bấm cuộc, ngăn đóng |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mốc khổ `md` (768px) — cùng mốc thanh biểu tượng đổi sang nút menu, và là mốc thước đã ký
  của `khung-trang-cai-dat` đòi nhãn nhóm Cài đặt hiện ở 768.
- Dòng hội thoại là `NavItem` cỡ `sm` như mục Cài đặt — `h-7 text-xs`, đúng mật độ hôm nay;
  bàn đo in số dòng thấy được ở 1280×800.
- Mục là liên kết thật (`<a>`): Cmd/Ctrl-bấm mở thẻ mới; `focus-visible` của `Button`.
- Hàng ngang cuộn bằng vuốt; mục đang mở được cuộn vào giữa khi trang mở.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `AreaSidebar`, `AreaSidebarGroup`, `AreaSidebarItem` | tạo (ghép từ mảnh có sẵn) | chưa có khung ghép; shadcn `sidebar` và ReUI sai hành vi điện thoại |
| `NavItem`, `NavGroup`, `NavGroupLabel`, `NavStrip` | dùng | mảnh sẵn của `packages/ui` |
| `DeleteChatAction`, `Skeleton` | dùng | giữ nguyên |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: thanh bên là danh sách nơi đến, vùng phải là chi tiết; luồng hiển nhiên, không tra
thêm — khuôn đã chốt ở bản mẫu `/proto/vo-khu-muc-tieu` và bản phạm vi
`docs/plan/pham-vi-okr-vo-khu-1810.md` («thanh bên hai lớp như Cài đặt và Hội thoại»).
<!-- UX-SPEC-TEMPLATE>>> -->

## Chuẩn web (web-design-guidelines)

Điểm áp vào vòng này: mục là `<a>`; vòng focus thấy được (`Button` có sẵn); con của flex cần
`min-w-0` để cắt chữ — tiêu đề hội thoại; biểu tượng trang trí `aria-hidden`; nút chỉ có
biểu tượng có `aria-label` («Hội thoại mới» — đã có).

## Đo

Bài kiểm DOM của thành phần (`packages/ui/test/area-sidebar.dom.tsx`), của hai khu
(`apps/app/test/thanh-ben-khu.dom.tsx`), bài đã ký của Cài đặt
(`khung-trang-cai-dat-thanh-ben.dom.tsx`) giữ xanh, một bàn đo màn trên phiên đo riêng
(`rang/do-man.mjs`: bề rộng, kiểu nhãn nhóm, hàng ngang, tràn ngang, ảnh), một bài quét vẽ
tay (`rang/quet-vo-tay.mjs`) và hội đồng đọc luật trong `docs/design.md`.
