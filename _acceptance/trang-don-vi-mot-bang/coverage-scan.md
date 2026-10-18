# Quét phủ — trang đơn vị một bảng (DH2)

Quét bằng `morphological-scan`, preset entity-feature (thực thể: trang của một đơn vị OKR), 15/10/2026.

## Ngữ cảnh

- Sản phẩm: OneHub CRM, khu Mục tiêu (OKR) — chân sản phẩm: đào repo (`docs/plan/pham-vi-okr-dieu-huong-1410.md`,
  hàng DH2 `docs/plan/lo-trinh-okr.json`, `okr/theo-don-vi/theo-don-vi.tsx`, `deals/deals-table.tsx`,
  `packages/ui/src/components/data-table.tsx`) · chân ngành: Tability và Perdoo [NGÀNH: Tability, Perdoo — lượt rà
  14/10 trong bản phạm vi đã đối chiếu cách hai sản phẩm chia trang theo đơn vị và người dẫn]; bảng có dòng mở rộng
  một cấp là nếp Thoả thuận của chính kho.

## Trục

- **Trục A — phần của trang:** ô chọn đơn vị · hàng công cụ (cách xem, ô lọc nhanh, bộ lọc, sắp xếp) · dòng mục tiêu ·
  dòng KR · ngăn chi tiết · chân bảng (thông tin đơn vị) · đơn vị trực thuộc · nhóm đã bỏ
  [thước CE: bản mẫu `/proto/dieu-huong-okr` @706ba494a `trang-don-vi.tsx`; B1–B4, B6–B8 của bản phạm vi — SUY-TỪ-REPO]
- **Trục B — loại đơn vị đang xem:** công ty · bộ phận · phòng ban · phòng ban chưa xếp · một người (`donOkr=nguoi:`) ·
  đơn vị không còn thấy [thước CE: `giaiDon` trong `theo-don-vi.tsx`, kiểu `DonChonOkr` — SUY-TỪ-REPO]
- **Trục C — cách xem:** Danh sách · Cây căn chỉnh · Họp tuần · Chấm điểm (chỉ pha chấm điểm, đã đóng)
  [thước CE: `CACH_XEM_OKR` + `PHA_CO_CHAM` — SUY-TỪ-REPO]
- **Trục D — dữ liệu:** có mục tiêu · rỗng · lọc không khớp · đang tải · lỗi · mục tiêu không KR · đơn vị chưa có trưởng ·
  có mục tiêu đã bỏ [thước CE: `trang-thai-okr.tsx` (`DangTai`, `Loi`, `Rong`, `DonKhongThay`, `ChuaChuKy`) — SUY-TỪ-REPO]
- **Lớp cắt ngang — khổ và ngôn ngữ:** 1440 · 390 · vi · en [thước CE: số đo production 14/10 ở 1440 và 390]

## Core

1. A×C: hàng công cụ (ô chọn đơn vị + cách xem) đứng một chỗ ở cả bốn cách xem — B4, việc chính của trang.
2. A ô chọn × B: chọn được công ty, bộ phận, phòng ban, phòng ban chưa xếp bằng tìm kiếm; người từ đường dẫn vẫn hiện.
3. A dòng mục tiêu/KR × D: một bảng, dòng mở ra KR, mục tiêu không KR không có mũi tên, trạng thái mở trên đường dẫn.
4. A ô lọc nhanh × D: «Cần bàn», «Chưa góp vào đâu» có số, lọc không khớp có lối bỏ lọc.
5. A sắp xếp: theo tiến độ, theo tình trạng.
6. A chân bảng + trực thuộc × B: thông tin đơn vị ở chân bảng; đơn vị con ở cuối trang; chưa có trưởng hiện cờ.
7. D đang tải × khổ 390: không nhảy bố cục, không bao giờ hiện cây 20 dòng.

## Later

- Cây căn chỉnh rời trang đơn vị (B5) — hàng DH4.
- Nút «Mở tất cả» của bảng có dòng mở rộng (E3), chốt chỗ đặt cách xem cho mọi danh sách (E5) — ngoài đợt này.
- Sắp xếp theo phụ trách, theo tên — không ai trong lượt rà đòi.

## Never

- Data-grid của ReUI — `docs/reui.md` cấm hệ bảng thứ hai.
- Ô lọc nhanh gọi máy chủ (đổi thủ tục `okr.danhSach`) — hai định nghĩa tính được trên hàng máy chủ đã trả.

## Cross-cutting áp mọi ô Core

- Chữ vi và en lấy từ tệp messages, không viết cứng.
- Không đổi thủ tục API, quyền, ngăn tạo, ngăn chi tiết; không sửa `packages/ui`.
