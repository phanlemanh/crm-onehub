---
slug: lich-su-moi-lan-cap-nhat
at: 2026-10-28T12:50:37Z
route: http://localhost:3303/proto/lich-su-moi-lan-cap-nhat
material: real-components
context: static-frame
context_scenes: []
reaction: nac-2 (gui-anh-va-link-ban-mau)
options:
divergence: skipped — khuôn có sẵn: mục Lịch sử của ngăn KR (VK7, HT5) giữ nguyên bố cục một cột; vòng này chỉ đổi đơn vị của dòng và điểm (tuần → lần), không có hướng bố cục nào khác để so
ds_skill: web-design-guidelines
states: [ST-lsk-nhieu-lan, ST-lsk-cung-ngay, ST-lsk-moc, ST-lsk-rong, ST-lsk-dang-tai, ST-lsk-loi, ST-lsk-dai, ST-lsk-hom-nay]
breakpoints: [mobile-375, desktop-1280]
themes: [light, dark]
patched: 1
deferred: 7
---
# design-pass — lich-su-moi-lan-cap-nhat

Bản mẫu `/proto/lich-su-moi-lan-cap-nhat` dựng mục «Lịch sử cập nhật» của chi tiết KR bằng thành phần thật: khung
`DetailSheet` của app (Sheet bên phải từ 768, ngăn kéo từ dưới dưới 768), `DetailSheetHeader`, `DetailSheetSection`,
`StatGroup`/`StatCard`, `Progress`, `TargetLineChart`, `ItemGroup`/`Item`, `ConfidenceIndicator`, `ThanhCamXuc`,
`Skeleton`, `VungTaiLoi`. Dữ liệu giả trong module, không tRPC; kỳ 14/09–13/12/2026, hôm nay 28/10. Mỗi lần cập nhật
một dòng, mới nhất trước, nhãn `dd/mm/yyyy HH:mm` giờ Việt Nam; biểu đồ mỗi lần một điểm (nhãn `dd/mm` của ngày gửi),
tuần không có lần nào một điểm chỉ có kỳ vọng. «Hôm nay» (`ST-lsk-hom-nay`) vẽ cách đang chạy — gom theo tuần, nhãn
ngày đầu tuần — trên cùng dữ liệu của `ST-lsk-nhieu-lan` để so trước và sau. Nút «Cập nhật» ở đầu ngăn gửi thử một
lần mới; ‹ › đi qua năm KR mẫu.

Đo bằng puppeteer trên bản đang chạy: bấm «Cập nhật» hai lần ở `ST-lsk-nhieu-lan` → 9 → 11 dòng, 9 → 11 điểm, dòng
đầu là lần vừa gửi; cùng thao tác ở `ST-lsk-hom-nay` → vẫn 6 dòng, 6 điểm, chỉ giá trị tuần 26/10 đổi. Đó đúng ngưỡng
sống của Cổng Đáng («gửi hai lần trong cùng tuần: Lịch sử tăng hai dòng, biểu đồ có hai điểm»).

Chạy: `cd apps/app && PROTO_ROUTE=1 PORT=3303 bun run dev`; ảnh chụp bằng `scripts/ui-capture.mjs` (desktop
`--w 1280 --h 1000`, điện thoại `--w 375 --h 1500`). Ảnh điện thoại chụp cao 1500 vì ngăn kéo chỉ cao 80vh: ở 812 chỉ
thấy đỉnh biểu đồ, không thấy dòng nào của mục đang xét. Góc dưới ảnh có nút công cụ dev của Next và nút nổi của app,
không thuộc bản mẫu.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-lsk-nhieu-lan | desktop-1280 | light | evidence/design-pass/nhieu-lan--desktop-1280--light.png |
| ST-lsk-nhieu-lan | desktop-1280 | dark | evidence/design-pass/nhieu-lan--desktop-1280--dark.png |
| ST-lsk-nhieu-lan | mobile-375 | light | evidence/design-pass/nhieu-lan--mobile-375--light.png |
| ST-lsk-nhieu-lan | mobile-375 | dark | evidence/design-pass/nhieu-lan--mobile-375--dark.png |
| ST-lsk-cung-ngay | desktop-1280 | light | evidence/design-pass/cung-ngay--desktop-1280--light.png |
| ST-lsk-cung-ngay | desktop-1280 | dark | evidence/design-pass/cung-ngay--desktop-1280--dark.png |
| ST-lsk-cung-ngay | mobile-375 | light | evidence/design-pass/cung-ngay--mobile-375--light.png |
| ST-lsk-cung-ngay | mobile-375 | dark | evidence/design-pass/cung-ngay--mobile-375--dark.png |
| ST-lsk-moc | desktop-1280 | light | evidence/design-pass/moc--desktop-1280--light.png |
| ST-lsk-moc | desktop-1280 | dark | evidence/design-pass/moc--desktop-1280--dark.png |
| ST-lsk-moc | mobile-375 | light | evidence/design-pass/moc--mobile-375--light.png |
| ST-lsk-moc | mobile-375 | dark | evidence/design-pass/moc--mobile-375--dark.png |
| ST-lsk-rong | desktop-1280 | light | evidence/design-pass/rong--desktop-1280--light.png |
| ST-lsk-rong | desktop-1280 | dark | evidence/design-pass/rong--desktop-1280--dark.png |
| ST-lsk-rong | mobile-375 | light | evidence/design-pass/rong--mobile-375--light.png |
| ST-lsk-rong | mobile-375 | dark | evidence/design-pass/rong--mobile-375--dark.png |
| ST-lsk-dang-tai | desktop-1280 | light | evidence/design-pass/dang-tai--desktop-1280--light.png |
| ST-lsk-dang-tai | desktop-1280 | dark | evidence/design-pass/dang-tai--desktop-1280--dark.png |
| ST-lsk-dang-tai | mobile-375 | light | evidence/design-pass/dang-tai--mobile-375--light.png |
| ST-lsk-dang-tai | mobile-375 | dark | evidence/design-pass/dang-tai--mobile-375--dark.png |
| ST-lsk-loi | desktop-1280 | light | evidence/design-pass/loi--desktop-1280--light.png |
| ST-lsk-loi | desktop-1280 | dark | evidence/design-pass/loi--desktop-1280--dark.png |
| ST-lsk-loi | mobile-375 | light | evidence/design-pass/loi--mobile-375--light.png |
| ST-lsk-loi | mobile-375 | dark | evidence/design-pass/loi--mobile-375--dark.png |
| ST-lsk-dai | desktop-1280 | light | evidence/design-pass/dai--desktop-1280--light.png |
| ST-lsk-dai | desktop-1280 | dark | evidence/design-pass/dai--desktop-1280--dark.png |
| ST-lsk-dai | mobile-375 | light | evidence/design-pass/dai--mobile-375--light.png |
| ST-lsk-dai | mobile-375 | dark | evidence/design-pass/dai--mobile-375--dark.png |
| ST-lsk-hom-nay | desktop-1280 | light | evidence/design-pass/hom-nay--desktop-1280--light.png |
| ST-lsk-hom-nay | desktop-1280 | dark | evidence/design-pass/hom-nay--desktop-1280--dark.png |
| ST-lsk-hom-nay | mobile-375 | light | evidence/design-pass/hom-nay--mobile-375--light.png |
| ST-lsk-hom-nay | mobile-375 | dark | evidence/design-pass/hom-nay--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không áp: context là static-frame — bản mẫu đặt mục Lịch sử trong khung ngăn KR thật (`DetailSheet`, ô số, thanh
  tiến độ, mục Việc và Chi tiết), trên nền trang Mục tiêu.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ghi chú dài bị cắt ở hai dòng kèm «…» (rõ nhất ở 375, `nhieu-lan` dòng 23/10): `ItemDescription` mặc định kẹp dòng.
  Lịch sử là chỗ đọc lại cả câu, nên bản mẫu bật `unclamped` (prop có sẵn của `Item`). `NoiDungLichSu` đang chạy
  cũng kẹp — đề xuất mang `unclamped` sang `lich-su-kr.tsx` ở S3.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- **Trùng key khi hai lần cùng ngày.** Bảng đọc màn hình ẩn trong `TargetLineChart` dùng `key={d.x}`; hai điểm cùng
  nhãn «27/10» làm React báo «Encountered two children with the same key … 27/10» (đo ở `ST-lsk-cung-ngay`; ảnh
  `cung-ngay--*` có huy hiệu «1 Issue» của Next vì lỗi này). Sửa ở `packages/ui/src/components/target-line-chart.tsx`
  — tệp này **chưa nằm trong «Ranh giới tệp» của thiết kế**; cần thêm vào ranh giới, hoặc cho điểm một khoá riêng.
- **Chú giải và đầu cột còn nói «tuần».** Dòng chú giải dưới biểu đồ (`msg.bieuDo.chuGiai`) vẫn là «Đường liền: giá
  trị mỗi lần cập nhật tuần», và cột đầu bảng đọc màn hình là «Tuần». Khi mỗi điểm là một lần thì hai chữ này sai
  nghĩa. Chữ sống trong thông điệp của `packages/ui`, cũng ngoài ranh giới tệp — cùng quyết định với mục trên.
- **Trục ngang theo thứ tự, không theo thời gian.** Ba lần trong tuần 05/10 chiếm bề ngang bằng ba tuần; đường kỳ
  vọng thành bậc thang (phẳng trong tuần, nhảy ở đầu tuần sau). Đọc được và đúng đặc tả («không lớp phủ tuần»), nhưng
  độ dốc của đường giá trị không còn so được với đường kỳ vọng theo thời gian. Giữ; Cổng Phạm vi xác nhận.
- **Chú thích nổi của biểu đồ chỉ có `dd/mm`.** Rê lên hai điểm cùng ngày ra hai nhãn «27/10» giống nhau, không có
  giờ. Cần nhãn chú thích riêng với nhãn trục (`TargetLinePoint` chưa có chỗ) — hoãn sang S3 hoặc SV-C1.
- **30 điểm ở 375** (`dai--mobile-375--*`): chấm bán kính 4 nối thành chuỗi hạt; nhãn trục tự bỏ bớt, không chồng
  nhau. Chấp nhận cho vòng này; ẩn chấm khi nhiều điểm là việc của `packages/ui`.
- **Nhãn «Đích …» đè lên đường kỳ vọng** ở cuối kỳ (mọi state có biểu đồ, rõ ở `nhieu-lan--desktop-1280`). Có từ
  VK7, không do vòng này; ghi lại, không sửa.
- **Đầu ngăn ở 375**: tên KR dài bị ép còn khoảng 140 px vì hàng ‹ › «Cập nhật» × — tên chiếm sáu dòng và đẩy mục
  Lịch sử xuống dưới nếp gấp của ngăn kéo. Thuộc khung ngăn KR chung (VK7, VK19), ngoài vòng này.

### Hỏi Gate 1

- **Thứ tự ngày và giờ trên nhãn dòng.** Đặc tả viết `dd/mm/yyyy HH:mm`; `formatNgayGio(…, { phan: "ngay-gio" })` cho
  tiếng Việt trả `HH:mm dd/mm/yyyy`. Bản mẫu ghép hai phần (`ngay` + `gio`) để đúng đặc tả. Giữ đặc tả (ngày trước —
  dễ quét danh sách theo ngày, hai lần cùng ngày đứng cạnh nhau), hay theo nếp chung của hàm (giờ trước)?
