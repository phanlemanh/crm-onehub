# Vỏ khu Mục tiêu — thiết kế (VK2)

Hàng VK2 của `docs/plan/lo-trinh-okr.json`, đợt `vo-khu-muc-tieu`, dãy V1, đứng trên VK1
(`AreaSidebar`, #489 đã gộp). Ô Cổng Đáng `_acceptance/vo-khu-muc-tieu/opportunity.md` (ký build
19/10, Phan Le Manh). Đầu vào thiết kế: bản mẫu `/proto/vo-khu-muc-tieu` ở `2790552ac` (luật 23).
Mang tiêu chí DH11 (luật 22).

Câu giao: «Trưởng đơn vị mở Mục tiêu và đi giữa Của tôi, Bộ OKR, Lấy ý kiến và Báo cáo bằng một
thanh bên, chu kỳ chọn một lần ở đầu thanh, và mọi đường dẫn cũ vẫn mở đúng chỗ».
Ngưỡng: «Trên trang đơn vị chỉ còn một lớp thẻ ngang; mọi đường dẫn cũ (?donOkr=, ?xemOkr=,
/okr/theo-don-vi, /okr/toan-canh, /okr/quanh-muc-tieu/…, /okr?tu=nhac) chuyển tới đúng chỗ mới».

## Hôm nay

`okr/layout.tsx` → `KhungTrangOkr` (`PageShell`). Mỗi trang dựng `DauTrangOkrTrang` → tiêu đề,
`HanhDongKhu` (Hỏi Kara · **ô chu kỳ** · Thêm · Soạn · menu) và `ThanhTabOkr` (Của tôi · Theo đơn
vị · Toàn cảnh · Hỏi ý). Trang đơn vị chồng thêm `ViewSwitch` `xemOkr` (danh sách · cây · họp tuần
· chấm điểm): hai lớp thẻ ngang, ô chu kỳ lẫn giữa nút hành động.

## Thiết kế

### Thanh bên khu

`okr/layout.tsx` dựng `ThanhBenMucTieu` + nội dung theo nếp `settings/layout.tsx`
(`flex-col md:flex-row`, `Suspense` với vỏ chờ). `ThanhBenMucTieu` là `AreaSidebar
label="Mục tiêu"`:

| Nhóm | Mục | Đường |
| --- | --- | --- |
| (không nhãn) | Của tôi | `/okr` |
| OKR | Bộ OKR · Lấy ý kiến (kèm số «cần ý kiến» như thẻ Hỏi ý cũ) | `/okr/bo-okr` · `/okr/lay-y-kien` |
| Báo cáo | Sức khoẻ · Sơ đồ | `/okr/suc-khoe` · `/okr/so-do` |

- `header`: ô chu kỳ (`ChonChuKy`, giữ `data-chon-chu-ky`) — rời `HanhDongKhu`.
- `footer`: «Chương trình OKR» → `/settings/okr`, chỉ khi `canManageProgram`.
- Số «cần ý kiến» lấy từ cùng truy vấn `ThanhTabOkr` dùng hôm nay, dời lên layout.
- Ô chu kỳ trong layout đọc chu kỳ hiệu lực của màn đang mở mỗi lần đổi đường (không giữ trạng thái cũ).
- Mục sáng theo đường (gồm đường con: `/okr/so-do/muc-tieu/<id>` sáng Sơ đồ).
- Liên kết mục mang theo `kyOkr` khi đường đang có (nếp `ThanhTabOkr` hôm nay); mỗi trang giữ
  chu kỳ mặc định của mình (Lấy ý kiến: chu kỳ lập kế hoạch).
- Mọi KR (VK11) và Cập nhật gần đây (VK12) chưa có màn → chưa lên thanh; hàng ấy thêm mục.
- `ThanhTabOkr` thôi dựng ở mọi trang. Trang Bộ OKR còn đúng một lớp thẻ ngang: `ViewSwitch`
  `xemOkr`.

### Đường mới, đường cũ

Không dời thư mục route: 42 hồ sơ đã ký trỏ `paths` và thước vào `okr/theo-don-vi/**`,
`okr/toan-canh/**`…, dời là làm chết `paths` của chúng. `apps/app/next.config.ts`:

- `rewrites()` (afterFiles): `/:slug/okr/bo-okr` → `theo-don-vi`, `/:slug/okr/lay-y-kien` →
  `hoi-y`, `/:slug/okr/suc-khoe` → `toan-canh`, `/:slug/okr/so-do/muc-tieu/:id` →
  `quanh-muc-tieu/:id`. `/:slug/okr/so-do` là trang mới (thư mục `okr/so-do/page.tsx`).
- `redirects()` (308, giữ truy vấn): `theo-don-vi` → `bo-okr`, `hoi-y` → `lay-y-kien`,
  `toan-canh` → `suc-khoe`, `toan-canh/suc-khoe` → `suc-khoe#chuong-trinh`,
  `quanh-muc-tieu/:id` → `so-do/muc-tieu/:id`; dòng cũ `cap-nhat-tuan` → `/okr` giữ.
- `/okr?tu=nhac`, `/okr?record=objective:<id>` không đổi đường — vẫn mở đúng phiên cập nhật /
  ngăn mục tiêu.
- `soan/[cuocSoanId]` chuyển thẳng tới `/okr/bo-okr?…&record=soan:<id>` (một bước, không hai).
- Liên kết trong `apps/app` trỏ thẳng đường mới (`DUONG` của `tab-okr.ts` và các chỗ ghép tay).
  Liên kết nhắc của `apps/agent` (email, Zalo, Slack) giữ đường cũ, đi qua redirect — đổi chữ máy
  là việc VK5.
- Rủi ro: rewrite + redirect cùng gốc với App Router và `cacheComponents` — task đầu của S3 là
  bản thử chứng không vòng lặp; hỏng thì quay về dời thư mục và báo cáo giá `paths`.

### Màn trong vỏ

- **Sức khoẻ** = nội dung Toàn cảnh hôm nay + phần quản trị (`SucKhoe`, `TomTatQuanTri`,
  `OkrMoCoi`) ở cuối trang, mục `#chuong-trinh`, chỉ khi `canManageProgram` (CONTEXT: Sức khoẻ có
  «phần quản trị»). `ViewSwitch` bảng · sơ đồ đơn vị của trang giữ nguyên.
- **Sơ đồ** = Sơ đồ góp vào cả công ty (`CayCanChinh` ở đơn vị gốc, theo `kyOkr`); trang quanh một
  mục tiêu nằm dưới nó, nút quay lại trỏ `/okr/so-do`. Khung toàn vùng + Toàn màn hình là VK6.
- **Bộ OKR** = trang Theo đơn vị hôm nay (VK3 tách mỗi bộ một trang).
- **Lấy ý kiến** = trang Hỏi ý hôm nay. Không đổi chữ trên màn (VK4).

### DH11

`phan-don-vi-dan.tsx` xét cả `org.tree`: đang tải → khung xương; lỗi → `LoiPhan` có «Thử lại»;
không còn thẻ tiêu đề rỗng. Bài kiểm mới `okr-don-vi-dan-cay.dom.tsx` (không chạm `okr-cua-toi-ba-phan.dom.tsx` của hồ sơ đã ký).

### Bài kiểm đã ký gắn với thanh thẻ ngang

`okr-thanh-tab.dom.tsx`, `okr-dau-trang-khu.dom.tsx`, phần thẻ của `khung-okr-truoc-r1.dom.tsx`,
`soan-okr-song-lai.spec.ts` và thước `data-khung-tab` của `dot-hoi-y-tuong-okr`, `khung-man-chung`
đo thanh thẻ ngang sẽ bỏ. Đây là sửa thước hồ sơ đã ký — câu hỏi ở Cổng Phạm vi.

## Không làm

Mọi KR (VK11) · Cập nhật gần đây (VK12) · mỗi bộ OKR một trang và bộ lọc Tôi dẫn (VK3) · khung toàn
vùng của Sơ đồ (VK6) · đổi chữ trên màn (VK4) · chữ trong tin nhắc, lời dặn Kara (VK5) · ngăn KR
(VK7) · đổi đường dẫn trong `apps/agent`.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: thanh biểu tượng → Mục tiêu → `/okr` Của tôi, thanh bên trái → bấm Bộ OKR → trang đơn
  vị (một lớp thẻ xem) → đổi chu kỳ ở đầu thanh → bấm Sức khoẻ: cùng chu kỳ (điểm ra: màn bấm tới).
- Biên: vai chỉ OKR không thấy «Chương trình OKR»; không có ý kiến nào cần → mục Lấy ý kiến không
  số; người mở liên kết cũ trong email → chuyển về đúng màn mới.
- Lỗi & quay lại: cây tổ chức lỗi ở Của tôi → khối «Đơn vị bạn dẫn» báo lỗi + Thử lại (DH11).

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Của tôi `/okr` | việc OKR của tôi trong chu kỳ | thanh bên, tin nhắc / mọi mục |
| Bộ OKR `/okr/bo-okr` | xem và làm trên bộ OKR một đơn vị | thanh bên, Của tôi / ngăn mục tiêu |
| Lấy ý kiến `/okr/lay-y-kien` | góp và đọc ý kiến chu kỳ tới | thanh bên, tin nhắc |
| Sức khoẻ `/okr/suc-khoe` | nhìn cả công ty một chu kỳ | thanh bên / Bộ OKR của đơn vị |
| Sơ đồ `/okr/so-do` | xem bộ OKR góp vào nhau | thanh bên / quanh một mục tiêu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-vo-loading | mọi màn khu | thanh bên đủ mục, mục khoá, ô chu kỳ chờ, `aria-busy` | chờ |
| ST-vo-dangmo | mọi màn khu | đúng một mục sáng, chu kỳ đang xem ở đầu thanh | bấm mục khác, đổi chu kỳ |
| ST-vo-dienthoai | mọi màn <768 | ô chu kỳ trên hàng cuộn ngang năm mục | vuốt, bấm |
| ST-vo-chiokr | mọi màn, vai chỉ OKR | không có «Chương trình OKR» ở chân | — |
| ST-cuatoi-caylo | Của tôi | «Đơn vị bạn dẫn» báo lỗi tải cây + Thử lại | Thử lại |
| ST-lienketcu | liên kết cũ | chuyển ngay tới màn mới, giữ chu kỳ và đơn vị | đọc màn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mốc `md` của `AreaSidebar`; chân thanh không lên hàng ngang điện thoại.
- Chuyển hướng 308, giữ mọi tham số truy vấn.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `AreaSidebar` | dùng | VK1 dựng cho đúng việc này |
| `ChonChuKy`, `ViewSwitch`, `LoiPhan`, `Badge` | dùng | có sẵn |
| `ThanhBenMucTieu` | ghép | dữ liệu của khu nối vào `AreaSidebar` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: trung-tâm-toả-nhánh (hub-and-spoke)
Căn cứ: bản mẫu `/proto/vo-khu-muc-tieu` và CONTEXT.md đã chốt thanh bên chia theo việc (OKR) và
vật để đọc (Báo cáo) như Work · Reports của Tability; không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->
