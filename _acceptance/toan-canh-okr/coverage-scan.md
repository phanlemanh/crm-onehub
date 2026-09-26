# Quét độ phủ — toan-canh-okr

## Ngữ cảnh

- Sản phẩm: khu OKR của CRM OneHub, công cụ quản trị nội bộ — chân sản phẩm: đào repo (`CONTEXT.md` mục OKR, `docs/plan/lo-trinh-okr.md` mục 5 «Lượt 5», bản phạm vi OKR mã XEM-02…07 và QT-04, `_acceptance/ban-mau-okr/design-pass.md`, hợp đồng lượt 4 `cap-nhat-tuan-okr`) · chân ngành: Profit.co (cập nhật tuần có ghi chú, vướng mắc, mức tự tin), Perdoo (bản đồ căn chỉnh toàn tổ chức) — tra web 2026-09-26.

## Trục

- **Trục A — bề mặt:** danh sách theo đơn vị có lọc (XEM-02) · chi tiết mục tiêu đầy đủ — diễn biến giá trị và mức tự tin (XEM-03) · cây căn chỉnh toàn công ty (XEM-04) · bảng họp tuần (XEM-05) · toàn cảnh — tiến độ theo đơn vị (XEM-06a) · toàn cảnh — mức tự tin và heatmap (XEM-06b) · khối OKR trên Tổng quan và trang một người (XEM-07) · sức khoẻ chương trình (QT-04) · biến thể `packages/ui`  [thước CE: bảng phủ mục 8 lộ trình + định nghĩa mã trong bản phạm vi — mỗi mã một ô]
- **Trục B — nguồn số:** có sẵn sau lượt 3 (mục tiêu, KR, căn chỉnh, cây tổ chức, vết) · cần bảng lần cập nhật của lượt 4 · kênh nhắc (liên kết Zalo, khớp Slack)  [thước CE: `schema.prisma` khối OKR; schema lượt 4 `okrCheckIn`; `ZaloLink`, `SlackMemberMatch` — SUY-TỪ-REPO]
- **Trục C — người xem:** quản trị · trưởng đơn vị · thành viên thường · vai «chỉ OKR»  [thước CE: `WORKSPACE_ROLES`, `OkrAccessService`, chốt bản mẫu «mọi vai thấy Toàn cảnh»]
- **Trục D — trạng thái màn:** có dữ liệu · rỗng hay tuần đầu · đang tải · lỗi · không đủ quyền · 390 và 1440  [thước CE: nguyên tắc chia lượt «mỗi màn có rỗng · đang tải · lỗi»; `docs/settings.md` mục Trạng thái]

## Không gian (A × B, cắt theo C và D ở cross-cutting)

| Bề mặt | Nguồn | Có nghĩa? | Nhãn |
|---|---|---|---|
| Lọc theo đơn vị (gồm đơn vị con), người, loại, trạng thái | có sẵn | có | Core |
| Lọc theo mức tự tin | lượt 4 | có | Core (nhịp 2) |
| Diễn biến giá trị có đích trên sheet | lượt 4 | có | Core (nhịp 2) |
| Cây căn chỉnh gập mở, bàn phím | có sẵn | có | Core |
| Bảng họp tuần xếp theo tự tin tụt, KR im, ghi chú mới | lượt 4 | có | Core (nhịp 2) |
| Đếm trưởng mở bảng họp tuần (đường đo ngưỡng) | có sẵn (vết OKR) | có | Core |
| Toàn cảnh — tiến độ, lẽ ra, đơn vị đã công bố | có sẵn | có | Core |
| Toàn cảnh — phân bố tự tin, cập nhật tuần này, heatmap | lượt 4 | có | Core (nhịp 2) |
| Khối Tổng quan / trang một người — KR phụ trách, tiến độ, tình trạng | có sẵn | có | Core |
| Khối Tổng quan — mức tự tin mới nhất | lượt 4 | có | Core (nhịp 2) |
| Sức khoẻ — KR chưa có khởi điểm, người chưa nối kênh | có sẵn / kênh | có | Core |
| Sức khoẻ — cập nhật đúng tuần, KR im | lượt 4 | có | Core (nhịp 2) |
| Biến thể `packages/ui`: cây, thanh tiến độ trung tính, biểu đồ đường có đích, chọn chu kỳ, heatmap, cặp tự tin/tình trạng | — | có | Core |
| Biến thể `packages/ui`: `ToggleGroup` 44px, `DetailSheetHeader` ô biểu tượng, `DetailSheetStats` cắt chữ, `Tabs` line cho thanh khu, `StatGroup` bo góc | — | có | Later |
| Danh sách người chưa cập nhật, xếp hạng người | lượt 4 | có | Never |
| Bộ lọc lưu được, tìm OKR trong ô tìm chung | — | có | Later (lượt 8) |
| Cảnh báo tự động khi tiến độ và tự tin lệch | lượt 4 | có | Later (lượt 10) |
| Trang hồ sơ nhân viên ngoài khu OKR | — | có | Never (giả định 4) |
| Heatmap đơn vị × mục tiêu (câu cũ của bản phạm vi) | lượt 4 | có | Never — bản mẫu đã chốt đơn vị × tuần |

## Core (vì sao)

1. Lọc ở máy chủ và gồm đơn vị con — XEM-02, «không lọc trong bộ nhớ trình duyệt».
2. Cây căn chỉnh đi bằng bàn phím — XEM-04, đồng thời là thành phần dùng lại cho cây đơn vị.
3. Toàn cảnh phần tiến độ — XEM-06, dựng được ngay, ngưỡng lãnh đạo đọc.
4. Bảng họp tuần + đếm mở bảng — XEM-05 và thước Cổng Giá trị.
5. Sức khoẻ chương trình — QT-04, quản trị cần trước 26/10 để biết kèm ai.
6. Khối Tổng quan / trang một người — XEM-07.
7. Diễn biến trên sheet — XEM-03 đầy đủ.
8. Sáu biến thể `packages/ui` lộ trình gọi tên, cộng cặp tự tin/tình trạng (dùng ở ba màn trở lên nên phải vào thư viện).

## Later

- `ToggleGroup` cỡ chạm 44px — bề mặt dùng nó là «Cập nhật tuần» của lượt 4; áp khi lượt 4 gộp, hợp đồng riêng.
- `DetailSheetHeader` ô biểu tượng, `DetailSheetStats` cắt chữ ở 390 — việc của khung record sheet cho mọi loại bản ghi, không riêng OKR.
- `Tabs` biến thể thanh khu, `StatGroup` bo góc — vá chỗ gọi đang chạy được; `thanh-tab.tsx` lượt 4 đang sửa.
- Bộ lọc lưu được, tìm OKR (lượt 8); cảnh báo lệch (lượt 10).

## Never

- Danh sách người chưa cập nhật, xếp hạng người — NG-07; lộ trình ghi «theo KR, không liệt kê người».
- Trang hồ sơ nhân viên mới — ngoài khu OKR; «trang cá nhân» là trang OKR của một người (giả định 4, quyết ở Cổng Phạm vi).

## Cross-cutting áp mọi ô Core

- Ba trạng thái màn + không đủ quyền; 390 và 1440; vi và en; `translate="no"` cho chữ người nhập.
- Số truy vấn không tăng theo số đơn vị hay số mục tiêu (vài trăm người, vài nghìn KR mỗi chu kỳ).
- Vai «chỉ OKR» đọc được mọi thủ tục mới trừ sức khoẻ; sức khoẻ chỉ quản trị.
- Không tô khối cho tiến độ; tình trạng bằng chấm kèm chữ.
