---
slug: ban-mau-okr
at: 2026-09-24T05:20:00Z
route: http://localhost:3300/proto/ban-mau-okr
material: real-components
context: static-frame
context_scenes: [evidence/design-pass/canh-cap-nhat-tuan--desktop-1440.png, evidence/design-pass/canh-cap-nhat-tuan--mobile-390.png, evidence/design-pass/canh-cua-toi--desktop-1440.png, evidence/design-pass/canh-cua-toi--mobile-390.png, evidence/design-pass/canh-theo-don-vi--desktop-1440.png, evidence/design-pass/canh-theo-don-vi--mobile-390.png, evidence/design-pass/canh-toan-canh--desktop-1440.png, evidence/design-pass/canh-toan-canh--mobile-390.png]
reaction: nac-1 (ghim)
options: https://claude.ai/artifact/72K5NtWCfrQ5ZcGtBPCBTd — mục «Bốn chỗ còn mở», mỗi chỗ hai hướng, hướng máy khuyên ghim viền xanh cạnh ảnh
divergence: opened
ds_skill: web-design-guidelines
states: [ST-capnhat-dagui, ST-capnhat-dangdien, ST-capnhat-danggui, ST-capnhat-dangtai, ST-capnhat-loi, ST-capnhat-loigui, ST-capnhat-rong, ST-capnhat-sokhonghople, ST-cuatoi-codulieu, ST-cuatoi-dangtai, ST-cuatoi-dieuhuong, ST-cuatoi-loi, ST-cuatoi-rong, ST-donvi-caycanchinh, ST-donvi-dangtai, ST-donvi-danhsach, ST-donvi-loi, ST-donvi-rong, ST-donvi-sheet, ST-donvi-truong, ST-toancanh-codulieu, ST-toancanh-dangtai, ST-toancanh-loi, ST-toancanh-tuandau]
breakpoints: [mobile-390, desktop-1440]
themes: [light, dark]
patched: 8
deferred: 11
---
# design-pass — ban-mau-okr

Bản mẫu cho bốn màn khu OKR — «Của tôi», «Cập nhật tuần của tôi», «Theo đơn vị»
kèm cây căn chỉnh, «Toàn cảnh» — theo `docs/plan/lo-trinh-okr.md` mục 4 việc 3.
Một bản duyệt ở đây để lượt 3 (`dat-okr-trong-crm`), lượt 4 (`cap-nhat-tuan-okr`)
và lượt 5 (`toan-canh-okr`) không phải dựng lại thẩm mỹ từng màn.

Ghép từ component thật của `packages/ui` và `DetailSheet` của app, bọc trong khung
ứng dụng dạng tĩnh (thanh trên + rail điều hướng). Dữ liệu mẫu tiếng Việt, gắn nhãn
«Dữ liệu mẫu» trên mọi màn; tên người và nội dung OKR mang `translate="no"`. Không
bảng, không API, không đường ghi, không sửa `packages/ui`.

Khổ chụp theo yêu cầu của lộ trình là 1440 và 390, không phải 1280/375 mặc định của
kit. Nền tối chụp bốn màn chính ở 1440.

Ai thấy gì trong bản mẫu: «Của tôi», «Cập nhật tuần», «Theo đơn vị» nhìn bằng mắt
Bùi Thu Nga — thành viên Chăm sóc khách hàng mang vai «chỉ OKR», nên rail chỉ có OKR
và Cài đặt (và ngăn điều hướng trên máy nhỏ ở `ST-cuatoi-dieuhuong` cũng vậy).
«Toàn cảnh» nhìn bằng mắt lãnh đạo có vai đầy đủ: rail đủ mục, OKR đứng sau «30
ngày đầu». `ST-donvi-truong` nhìn bằng mắt Võ Phương Thảo, trưởng phòng ban Chăm sóc khách
hàng, nên có thêm «Thêm mục tiêu» và «Nhập từ bảng tính». `ST-donvi-rong` là Kho
vận: cả phòng ban và bộ phận Vận hành đều chưa có trưởng, nên lời mời là gán trưởng.

Cây đơn vị bên trái «Theo đơn vị» lấy lại đúng hình và dữ liệu mẫu của bản mẫu
`cau-truc-to-chuc` (nhánh `proto/cau-truc-to-chuc`, chưa gộp): khung viền, bộ phận
là nhánh gập mở, phòng ban thụt vào, nhóm «Chưa xếp vào bộ phận nào», Vận hành chưa
có trưởng. Lớp OKR chỉ thêm dòng OneHub ở đầu và số mục tiêu bên phải mỗi đơn vị.
Khi hai bản mẫu cùng vào `onehub`, cây này nên nhập thẳng từ module kia thay vì
chép hình.

CI trên GitHub không chạy job nào từ 24/09 (lỗi thanh toán tài khoản, chủ kho đang
xử lý): PR đỏ trong vài giây với 0 bước, không phải lỗi mã. Bằng chứng thay thế là
năm lệnh chạy ở máy: `check-types`, `lint`, `lint:slop`, `test`, `build`, và phép
đo sổ bản mẫu `apps/app/test/proto-catalog.spec.ts`.

Luật đọc tiến độ trong bản mẫu: vạch «lẽ ra đã tới đây» đi thẳng từ ngày công bố
(02/11) tới 31/12, hôm nay 30/11 là 47%. Mục tiêu cam kết: từ 85% vạch trở lên là
«Đúng nhịp», từ 50% là «Chậm nhịp», dưới đó «Trượt». Mục tiêu tham vọng: từ 70% vạch
là «Đúng nhịp», dưới đó chỉ «Chậm nhịp» — không bao giờ đỏ. KR dạng mốc không có vạch
và không so với đường thẳng. Các ngưỡng này là giá trị mẫu; con số thật là cấu hình
chương trình của lượt 3.

## Duyệt

2026-09-24, Manh Phan: gật cả gói, vòng phản ứng thứ nhất (nac-1, trên ảnh). Bốn
chỗ còn mở chốt theo hướng máy khuyên, bản mẫu đang dựng đúng như vậy:

- Heatmap «Toàn cảnh»: trục đơn vị × tuần, ô là tỷ lệ KR tự tin cao.
- Mức tự tin: ba bậc Cao · Vừa · Thấp.
- Cây căn chỉnh: trong «Theo đơn vị», nút chuyển Danh sách / Cây — giữ bốn tab.
- «Toàn cảnh»: mọi vai đều thấy, kể cả «chỉ OKR».

Lượt 3, 4, 5 dựng theo bản mẫu này; mười một biến thể ở Nhóm 2 là việc của lượt 5
trong `packages/ui`.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| ST-capnhat-dagui | desktop-1440 | light | evidence/design-pass/ST-capnhat-dagui--desktop-1440.png |
| ST-capnhat-dagui | mobile-390 | light | evidence/design-pass/ST-capnhat-dagui--mobile-390.png |
| ST-capnhat-dangdien | desktop-1440 | dark | evidence/design-pass/ST-capnhat-dangdien--desktop-1440--dark.png |
| ST-capnhat-dangdien | desktop-1440 | light | evidence/design-pass/ST-capnhat-dangdien--desktop-1440.png |
| ST-capnhat-dangdien | mobile-390 | light | evidence/design-pass/ST-capnhat-dangdien--mobile-390.png |
| ST-capnhat-danggui | desktop-1440 | light | evidence/design-pass/ST-capnhat-danggui--desktop-1440.png |
| ST-capnhat-danggui | mobile-390 | light | evidence/design-pass/ST-capnhat-danggui--mobile-390.png |
| ST-capnhat-dangtai | desktop-1440 | light | evidence/design-pass/ST-capnhat-dangtai--desktop-1440.png |
| ST-capnhat-dangtai | mobile-390 | light | evidence/design-pass/ST-capnhat-dangtai--mobile-390.png |
| ST-capnhat-loi | desktop-1440 | light | evidence/design-pass/ST-capnhat-loi--desktop-1440.png |
| ST-capnhat-loi | mobile-390 | light | evidence/design-pass/ST-capnhat-loi--mobile-390.png |
| ST-capnhat-loigui | desktop-1440 | light | evidence/design-pass/ST-capnhat-loigui--desktop-1440.png |
| ST-capnhat-loigui | mobile-390 | light | evidence/design-pass/ST-capnhat-loigui--mobile-390.png |
| ST-capnhat-rong | desktop-1440 | light | evidence/design-pass/ST-capnhat-rong--desktop-1440.png |
| ST-capnhat-rong | mobile-390 | light | evidence/design-pass/ST-capnhat-rong--mobile-390.png |
| ST-capnhat-sokhonghople | desktop-1440 | light | evidence/design-pass/ST-capnhat-sokhonghople--desktop-1440.png |
| ST-capnhat-sokhonghople | mobile-390 | light | evidence/design-pass/ST-capnhat-sokhonghople--mobile-390.png |
| ST-cuatoi-codulieu | desktop-1440 | dark | evidence/design-pass/ST-cuatoi-codulieu--desktop-1440--dark.png |
| ST-cuatoi-codulieu | desktop-1440 | light | evidence/design-pass/ST-cuatoi-codulieu--desktop-1440.png |
| ST-cuatoi-codulieu | mobile-390 | light | evidence/design-pass/ST-cuatoi-codulieu--mobile-390.png |
| ST-cuatoi-dangtai | desktop-1440 | light | evidence/design-pass/ST-cuatoi-dangtai--desktop-1440.png |
| ST-cuatoi-dangtai | mobile-390 | light | evidence/design-pass/ST-cuatoi-dangtai--mobile-390.png |
| ST-cuatoi-dieuhuong | desktop-1440 | light | evidence/design-pass/ST-cuatoi-dieuhuong--desktop-1440.png |
| ST-cuatoi-dieuhuong | mobile-390 | light | evidence/design-pass/ST-cuatoi-dieuhuong--mobile-390.png |
| ST-cuatoi-loi | desktop-1440 | light | evidence/design-pass/ST-cuatoi-loi--desktop-1440.png |
| ST-cuatoi-loi | mobile-390 | light | evidence/design-pass/ST-cuatoi-loi--mobile-390.png |
| ST-cuatoi-rong | desktop-1440 | light | evidence/design-pass/ST-cuatoi-rong--desktop-1440.png |
| ST-cuatoi-rong | mobile-390 | light | evidence/design-pass/ST-cuatoi-rong--mobile-390.png |
| ST-donvi-caycanchinh | desktop-1440 | dark | evidence/design-pass/ST-donvi-caycanchinh--desktop-1440--dark.png |
| ST-donvi-caycanchinh | desktop-1440 | light | evidence/design-pass/ST-donvi-caycanchinh--desktop-1440.png |
| ST-donvi-caycanchinh | mobile-390 | light | evidence/design-pass/ST-donvi-caycanchinh--mobile-390.png |
| ST-donvi-dangtai | desktop-1440 | light | evidence/design-pass/ST-donvi-dangtai--desktop-1440.png |
| ST-donvi-dangtai | mobile-390 | light | evidence/design-pass/ST-donvi-dangtai--mobile-390.png |
| ST-donvi-danhsach | desktop-1440 | light | evidence/design-pass/ST-donvi-danhsach--desktop-1440.png |
| ST-donvi-danhsach | mobile-390 | light | evidence/design-pass/ST-donvi-danhsach--mobile-390.png |
| ST-donvi-loi | desktop-1440 | light | evidence/design-pass/ST-donvi-loi--desktop-1440.png |
| ST-donvi-loi | mobile-390 | light | evidence/design-pass/ST-donvi-loi--mobile-390.png |
| ST-donvi-rong | desktop-1440 | light | evidence/design-pass/ST-donvi-rong--desktop-1440.png |
| ST-donvi-rong | mobile-390 | light | evidence/design-pass/ST-donvi-rong--mobile-390.png |
| ST-donvi-sheet | desktop-1440 | light | evidence/design-pass/ST-donvi-sheet--desktop-1440.png |
| ST-donvi-sheet | mobile-390 | light | evidence/design-pass/ST-donvi-sheet--mobile-390.png |
| ST-donvi-truong | desktop-1440 | light | evidence/design-pass/ST-donvi-truong--desktop-1440.png |
| ST-donvi-truong | mobile-390 | light | evidence/design-pass/ST-donvi-truong--mobile-390.png |
| ST-toancanh-codulieu | desktop-1440 | dark | evidence/design-pass/ST-toancanh-codulieu--desktop-1440--dark.png |
| ST-toancanh-codulieu | desktop-1440 | light | evidence/design-pass/ST-toancanh-codulieu--desktop-1440.png |
| ST-toancanh-codulieu | mobile-390 | light | evidence/design-pass/ST-toancanh-codulieu--mobile-390.png |
| ST-toancanh-dangtai | desktop-1440 | light | evidence/design-pass/ST-toancanh-dangtai--desktop-1440.png |
| ST-toancanh-dangtai | mobile-390 | light | evidence/design-pass/ST-toancanh-dangtai--mobile-390.png |
| ST-toancanh-loi | desktop-1440 | light | evidence/design-pass/ST-toancanh-loi--desktop-1440.png |
| ST-toancanh-loi | mobile-390 | light | evidence/design-pass/ST-toancanh-loi--mobile-390.png |
| ST-toancanh-tuandau | desktop-1440 | light | evidence/design-pass/ST-toancanh-tuandau--desktop-1440.png |
| ST-toancanh-tuandau | mobile-390 | light | evidence/design-pass/ST-toancanh-tuandau--mobile-390.png |

## Cảnh ngữ-cảnh

Mỗi màn đặt cạnh sheet Thoả thuận (ứng dụng thật, bản ghi mẫu `seed-deal-wise-1`,
tiếng Việt) và sheet kế hoạch 30 ngày, ở cả 1440 và 390. Máy cục bộ chưa có kế hoạch
30 ngày nào nên sheet kế hoạch lấy từ bản mẫu đã duyệt `ke-hoach-la-mot-ban-ghi`
(`ST-kehoach-codulieu`) — cùng component `DetailSheet` với ứng dụng thật. Với «Theo
đơn vị», khung đặt cạnh là sheet mục tiêu, đúng cảnh lượt 3 yêu cầu.

- evidence/design-pass/canh-cap-nhat-tuan--desktop-1440.png
- evidence/design-pass/canh-cap-nhat-tuan--mobile-390.png
- evidence/design-pass/canh-cua-toi--desktop-1440.png
- evidence/design-pass/canh-cua-toi--mobile-390.png
- evidence/design-pass/canh-theo-don-vi--desktop-1440.png
- evidence/design-pass/canh-theo-don-vi--mobile-390.png
- evidence/design-pass/canh-toan-canh--desktop-1440.png
- evidence/design-pass/canh-toan-canh--mobile-390.png

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- KR dạng mốc từng hiện «Trượt» đỏ vì bị so với vạch tuyến tính: nay hiện «Mốc, chưa xong» chấm xám, thanh tiến độ bỏ vạch.
- Sheet mục tiêu ở 390 cắt chữ ô «Tình trạng» và «Phụ trách» khi có bốn ô số: gộp «Lẽ ra» vào nhãn ô Tiến độ, còn ba ô.
- Heatmap ở 390 làm cả trang tràn ngang 251px vì nhãn ẩn cho trình đọc màn hình thoát khỏi khung cuộn: khung cuộn nhận `relative`; khung tự cuộn tới tuần hiện tại.
- Thanh tab khu OKR dính chữ vào nhau: theo đúng cách `DetailSheetTabs` dùng biến thể `line` (khoảng cách và gạch chân ở chỗ gọi).
- Chú giải heatmap «ô đậm hơn» sai nghĩa ở nền tối vì thang đảo chiều: đổi thành «ô càng nổi khỏi nền, càng nhiều KR tự tin cao».
- Cây đơn vị và cây căn chỉnh từng khai vai `tree` mà không đi được bằng bàn phím: bỏ vai, về danh sách lồng thường, đơn vị đang chọn mang `aria-current`.
- Cây đơn vị tự vẽ khác hình bản mẫu cây tổ chức: lấy lại hình và dữ liệu của `cau-truc-to-chuc` (theo nhắc của phiên điều phối), thêm trạng thái trưởng phòng ban đang xem để giữ hai nút đặt và nhập OKR.
- Kiểu dữ liệu mẫu khai từ điển mở cho giá trị đã biết (`lint:slop` bắt tám chỗ): đổi sang `satisfies` và `Map`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

Danh sách biến thể lượt 5 thêm vào `packages/ui`. Bản mẫu dựng tạm bằng token ở chỗ gọi; không chỗ nào sửa component nền.

- `Progress` chỉ tô `bg-primary` — chính là «tô khối» mà `docs/design.md` cấm cho tiến độ. Cần biến thể trung tính (nền `muted`, phần đã đi `muted-foreground`) có vạch «lẽ ra đã tới đây» (`foreground`, 2px, nằm trong nhãn cho trình đọc màn hình) và một dạng không vạch cho KR mốc. Bản nháp: `ThanhTienDo` trong `phan-chung.tsx`.
- Heatmap: chưa có thành phần nào. Bản nháp dùng năm bậc `foreground` theo độ trong (0/10/25/45/70%), ô trống viền đứt, cột tên dính trái, tự cuộn tới tuần hiện tại, chú giải trung tính. Cần làm trong `packages/ui` kèm kiểm tương phản chữ trên từng bậc ở cả hai nền.
- Cây nhiều cấp đi bằng bàn phím (`role="tree"`, mũi tên, mở/gập, một điểm dừng tab) — dùng chung cho cây đơn vị ở đây và ở lượt 1 (`cau-truc-to-chuc`). Bản mẫu chỉ là danh sách lồng thụt lề.
- Chọn chu kỳ (năm / quý, biết chu kỳ đã khép): bản mẫu dùng `Select` thường.
- `ToggleGroup` thiếu cỡ chạm ≥ 44px (to nhất `lg` = 36px) và thiếu dạng trải đủ bề ngang; «Mức tự tin» ở 390 phải thêm `w-full` / `flex-1` ở chỗ gọi.
- `Tabs` biến thể `line` làm thanh điều hướng khu phải tự thêm `gap-6 border-b w-full justify-start` ở chỗ gọi (`DetailSheetTabs` cũng vậy) — nên có biến thể mang sẵn.
- Mức tự tin (chấm + chữ, Cao / Vừa / Thấp ↔ success / warning / error) và tình trạng (Đúng nhịp / Chậm nhịp / Trượt, tham vọng không đỏ) nên là một cặp thành phần dùng chung, không để mỗi màn tự map tông.
- `StatGroup` không bo góc; bản mẫu thêm `rounded-lg` ở chỗ gọi.
- `DetailSheetStats` cắt chữ ở 390 khi có bốn ô — thấy cả trên sheet Thoả thuận thật («Ngày dự…», «8 thg 1…»). Việc của record sheet, không riêng OKR.
- `DetailSheetHeader` chưa có ô biểu tượng cho bản ghi không có logo (mục tiêu); bản mẫu tự vẽ ô viền `rounded-lg` chứa icon.
- Nhãn «Dữ liệu mẫu» và ảnh cảnh ngữ cảnh cho thấy sheet Thoả thuận thật vẫn hiện tên giai đoạn tiếng Anh («Qualified to buy») — đã biết, chờ từ điển chốt «Giai đoạn thoả thuận»; ghi lại để khỏi tưởng là lỗi của OKR.
