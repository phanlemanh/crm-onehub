# Lịch sử hiện mọi lần cập nhật — thiết kế (SV7)

Hàng SV7 của `docs/plan/lo-trinh-okr.json`, bản phạm vi `docs/plan/pham-vi-okr-sau-vo-khu-2410.md` §8 (mã `LS`).
Cổng Đáng 28/10: build, hạn tới 2026-10-29, ngưỡng sống «gửi hai lần cập nhật cho một KR trong cùng tuần: Lịch sử
tăng hai dòng và biểu đồ có hai điểm».

## Vấn đề

Mục «Lịch sử» của chi tiết KR đọc `okr.dienBien`, và `dienBienKr` (`apps/api/src/okr/dien-bien.ts`) dựng mỗi tuần
một điểm bằng `cuoiTrongTuan` — lần cuối của tuần. Gửi lần thứ hai trong tuần thì dòng của tuần đó đổi giá trị chứ
không thêm dòng, biểu đồ không thêm điểm. Đó là Known limits Ngoài-1 mà VK7 (`ngan-kr-mot-cho`) đã ký 20/10. Từ
24/10 «Cập nhật» ghi lúc nào cũng được, mỗi lần một dòng (`CONTEXT.md`); `OkrCheckIn` không có khoá duy nhất theo tuần.

## Hướng làm

1. **Một thủ tục đọc mới `okr.lichSuKr`**, không đổi `okr.dienBien`. `dienBien` vẫn là chuỗi theo tuần cho bốn
   nơi đọc theo tuần: hộp cập nhật (đồ thị xem trước), khối «lần trước», dải mức tự tin ở chi tiết mục tiêu, và mức
   đổi của Họp tuần. `lichSuKr` dùng cùng luật quyền (`dieuKienXemMucTieu`) và cùng nguồn lần (`lanCuaKr`, đã sắp
   theo giờ gửi), trả:
   - `lan`: mọi lần cập nhật của KR, cũ trước — `checkInId`, `luc` (giờ gửi ISO), `ngay` (ngày VN), `tuan`,
     `giaTri` (null với KR mốc), `tuTin`, `ghiChu` (null khi rỗng), `camXuc` (tóm tắt như HT5).
   - `chuoi`: điểm của biểu đồ — mỗi lần một điểm mang `kyVong` của tuần chứa nó; tuần không có lần nào (kể cả tuần
     sau hôm nay) một điểm chỉ có `kyVong`. Hàm thuần `chuoiMoiLan` cạnh `dienBienKr`.
   - `kieu`, `dich`, `donVi`, `coCapNhat` như `dienBien`.
2. **Mục Lịch sử của chi tiết KR đọc `lichSuKr`**. Phần thân chuyển sang tệp riêng
   `apps/app/components/crm/record-sheet/lich-su-kr.tsx`; `kr-sheet.tsx` chỉ còn gọi nó (ít dòng chạm nhất ở tệp
   mà SV1 và VK19 cũng sửa).
   - Mỗi dòng một lần, mới nhất trước, nhãn là ngày giờ gửi bằng đúng hàm `luc` của dòng tin «Cập nhật gần đây» (giờ
     Việt Nam) — hai lần cùng ngày vẫn phân biệt được; hai lần cùng phút phân biệt bằng `data-lan-cap-nhat`. Dòng mang `data-lan-cap-nhat=<checkInId>` và `data-ngay=<ngay>`.
   - Biểu đồ: mỗi lần một điểm, nhãn trục `dd/mm` của ngày gửi; đường kỳ vọng và vạch đích như cũ. Nhãn đọc màn hình
     của biểu đồ đổi từ «… theo tuần» sang «… qua từng lần cập nhật». `TargetLineChart` (`packages/ui`) thêm biến thể
     nhịp «lần» để chú giải và đầu cột bảng ẩn nói «lần cập nhật»; khoá dòng của bảng ẩn theo chỉ số để hai lần cùng
     ngày không trùng khoá. Trục ngang xếp theo thứ tự lần, không theo thời gian: ba lần trong một tuần chiếm ba nấc.
   - Hàng cảm xúc (HT5) giữ ở từng dòng, theo `checkInId` của chính dòng.
3. **Gửi cập nhật thì Lịch sử tăng ngay**: `cache.okr` làm mới `okr.lichSuKr` cùng chỗ đang làm mới `okr.dienBien`
   (`apps/app/lib/trpc/cache.ts`), và thả cảm xúc cũng làm mới nó.
4. **Lật Known limits Ngoài-1 của VK7** — câu hỏi duy nhất cho chủ kho ở Cổng Phạm vi (Hỏi-1). Đổi đúng hai phép
   đo của VK7 đang ghim hành vi gom tuần: ca `vk7-than-ngan` của `apps/app/test/ngan-kr-mot-cho.dom.tsx` (mồi
   `okr.dienBien` cho Lịch sử) và bước «gom theo tuan» của `_acceptance/ngan-kr-mot-cho/rang/man.mjs`
   (`lichSau >= lichTruoc`). Sửa qua `yeu-cau cham-tep` của đợt, kèm dòng sổ `decided_by` chủ kho ở hồ sơ
   `ngan-kr-mot-cho`; không sửa thước hồ sơ đã ký nào khác.

## Không làm

- Xem riêng một lần cũ khi bấm dòng (SV-C1, mở lại sau SV7).
- Đổi `okr.dienBien` hay bốn nơi đọc theo tuần.
- Sửa, xoá một lần cập nhật đã gửi.
- Gom lại theo tuần trên biểu đồ (lớp phủ tuần).

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: chi tiết KR (từ Họp tuần, trang đơn vị, Của tôi, bảng KR) → mục Lịch sử → đọc từng lần, mới nhất trên
  cùng, biểu đồ mỗi lần một điểm (điểm ra: đóng ngăn hay ‹ › sang KR kế).
- Gửi lần mới từ «Cập nhật» ở đầu ngăn hay trên dòng → hộp đóng → Lịch sử thêm một dòng ở đầu, biểu đồ thêm một điểm,
  không tải lại trang.
- Biên: KR chưa có lần nào → câu «Chưa có lần cập nhật nào», không biểu đồ. KR mốc → dòng có mức tự tin và ghi chú,
  không số, không biểu đồ. Nhiều lần cùng ngày → hai dòng cùng ngày, khác giờ.
- Lỗi & quay lại: không tải được Lịch sử → vùng lỗi trong mục với «Thử lại»; các mục khác của ngăn vẫn dùng được.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chi tiết KR › Lịch sử | Cho người phụ trách thấy mọi lần cập nhật của KR theo thời gian | Từ mọi lối mở KR / ‹ › sang KR kế, đóng ngăn |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lsk-nhieu-lan | Lịch sử | Biểu đồ mỗi lần một điểm; dòng mới nhất trước, hai lần cùng tuần là hai dòng, nhãn ngày giờ | Đọc, thả cảm xúc, Cập nhật |
| ST-lsk-cung-ngay | Lịch sử | Hai lần cùng ngày: hai dòng cùng ngày khác giờ, hai điểm cùng nhãn ngày trên trục | Đọc |
| ST-lsk-moc | Lịch sử | KR mốc: dòng chỉ có mức tự tin và ghi chú, không biểu đồ | Đọc |
| ST-lsk-rong | Lịch sử | «Chưa có lần cập nhật nào», không biểu đồ | Bấm «Cập nhật» ở đầu ngăn |
| ST-lsk-dang-tai | Lịch sử | Khung xương cao bằng biểu đồ | Chờ |
| ST-lsk-loi | Lịch sử | Vùng lỗi «Không tải được diễn biến của KR này.» + Thử lại | Thử lại |
| ST-lsk-dai | Lịch sử | 30 lần trong kỳ: danh sách cuộn trong ngăn, biểu đồ 30 điểm | Cuộn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nhãn dòng theo giờ Việt Nam (`formatNgayGio`, `Asia/Ho_Chi_Minh`), không theo giờ máy người xem.
- Ghi chú là dữ liệu người nhập: `translate="no"`.
- Dưới 768 ngăn là drawer; danh sách và biểu đồ giữ nguyên thứ tự.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `TargetLineChart` | dùng | Biểu đồ đích của ngăn đã dùng nó; chỉ đổi dữ liệu vào |
| `Item`, `ItemGroup` | dùng | Danh sách Lịch sử hiện có dựng bằng nó |
| `ConfidenceIndicator`, `HangCamXuc` | dùng | Giữ như VK7 và HT5 |
| `VungTaiLoi`, `Skeleton` | dùng | Nếp chờ tải và lỗi tải của `docs/design.md` |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: mục Lịch sử là một cột trong ngăn đã có (VK7); Tability Timeline của ngăn KR cũng là một cột từng lần kèm số,
mức đổi và câu phân tích (`docs/findings/2026-10-22-hop-tuan/README.md`, ảnh `tab/t03b-ngan-kr-dong-thoi-gian.jpg`).
<!-- UX-SPEC-TEMPLATE>>> -->

## Ranh giới tệp

- `apps/api/src/okr/dien-bien.ts`, `apps/api/src/okr/okr-xem.service.ts`, `apps/api/src/okr/okr-xem.contracts.ts`,
  `apps/api/src/okr/okr.router.ts`, `apps/api/src/generated/**`
- `apps/app/components/crm/record-sheet/lich-su-kr.tsx` (mới), `apps/app/components/crm/record-sheet/kr-sheet.tsx`
  (chỉ thay phần Lịch sử bằng lời gọi)
- `apps/app/lib/trpc/cache.ts`, `apps/app/lib/messages/okr-toan-canh.ts` (tệp bảo vệ — xin cham-tep)
- `packages/ui/src/components/target-line-chart.tsx`, `packages/ui/src/lib/messages.ts`
- `apps/app/app/proto/_modules/lich-su-moi-lan-cap-nhat/**`, `apps/app/app/proto/catalog.ts`,
  `apps/app/app/proto/registry.ts`
- Bài kiểm mới `apps/api/test/lich-su-moi-lan-cap-nhat.spec.ts`, `apps/app/test/lich-su-moi-lan-cap-nhat.dom.tsx`
- Theo Hỏi-1: `apps/app/test/ngan-kr-mot-cho.dom.tsx`, `_acceptance/ngan-kr-mot-cho/rang/man.mjs` (qua cham-tep)
