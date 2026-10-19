# Quét độ phủ — so-do-toan-vung (VK6)

Preset `entity-feature` + `test-matrix` của `morphological-scan`, 19/10/2026, trước khi VK2 gộp. Thực thể là màn
Sơ đồ ở nhóm Báo cáo của vỏ khu Mục tiêu.

## Ngữ cảnh

- Sản phẩm: CRM OneHub, khu Mục tiêu (OKR) — chân sản phẩm: đào kho (`docs/plan/lo-trinh-okr.json` hàng VK6 và VK2,
  `docs/plan/pham-vi-okr-vo-khu-1810.md`, bản mẫu `apps/app/app/proto/_modules/vo-khu-muc-tieu/so-do.tsx` ở
  `2790552ac`, hồ sơ đã ký `so-do-can-chinh-don-vi` và `so-do-quanh-muc-tieu`) · chân ngành: Tability Strategy map,
  đặt bản đồ trong vỏ, cho nó trọn vùng, có Full screen [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json, trường `vi_sao`
  của VK6, ghi từ lượt rà Tability 18/10].

## Trục

- **Trục A — lối vào màn:** mục Sơ đồ trên thanh bên khu | nút trong ngăn chi tiết mục tiêu | đường cũ
  `/okr/quanh-muc-tieu/<id>` | đường cũ `?xemOkr=cay` | đường cũ Toàn cảnh › Sơ đồ (`?xemToanCanh=so-do`) | tải lại
  hay gửi đường dẫn đang ở toàn màn hình hoặc đang lấy tâm.
  - Thước CE: câu giao và `bat_khi` của VK6, `bat_khi` của VK2 [SUY-TỪ-REPO: docs/plan/lo-trinh-okr.json]; nếp
  «Giá trị lọc ghi lên đường dẫn bằng nuqs» [SUY-TỪ-REPO: docs/design.md].
- **Trục B — kiểu xem:** cả công ty theo đơn vị (đầu ra `okr.soDoDonVi`) | quanh một mục tiêu (đầu ra
  `okr.quanhMucTieu`) | lọc Cần chú ý.
  - Thước CE: hai thủ tục đã ký [SUY-TỪ-REPO: _acceptance/so-do-can-chinh-don-vi/contract.md,
  _acceptance/so-do-quanh-muc-tieu/contract.md]; bản mẫu có bộ lọc «Mọi đơn vị · Cần chú ý» [SUY-TỪ-REPO:
  apps/app/app/proto/_modules/vo-khu-muc-tieu/so-do.tsx @2790552ac].
- **Trục C — khung:** thường (thanh bên khu hiện) | toàn màn hình (thanh bên khu thu) | khổ dưới `md` | khổ `md`–`lg`
  (thanh bên khu thành dải ngang ở bản mẫu).
  - Thước CE: `KhungKhu` `anThanhBen`, `DaiDienThoai` hiện dưới `lg` [SUY-TỪ-REPO:
  apps/app/app/proto/_modules/vo-khu-muc-tieu/khung.tsx @2790552ac]; nếp «Danh sách» dưới `md` [SUY-TỪ-REPO:
  docs/design.md].
- **Trục D — trạng thái dữ liệu:** đang tải | lỗi | kỳ chưa có OKR | tâm không thấy hay không có quyền | có dữ liệu.
  - Thước CE: nếp «Chờ tải và lỗi tải» [SUY-TỪ-REPO: docs/design.md]; `NOT_FOUND` của `okr.quanhMucTieu`
  [SUY-TỪ-REPO: _acceptance/so-do-quanh-muc-tieu/contract.md AC-3].

## Không gian (A × B rút gọn, C và D là lát cắt)

| Lối vào \ Kiểu xem | Cả công ty | Quanh một mục tiêu |
|---|---|---|
| Thanh bên khu | Core (AC-1) | — vô nghĩa (thanh bên không mang tâm) |
| Ngăn mục tiêu | — vô nghĩa | Core (AC-5) |
| `/okr/quanh-muc-tieu/<id>` | — | Core (AC-6) |
| `?xemOkr=cay` | Core (AC-7, chờ Hỏi-1) | — |
| `?xemToanCanh=so-do` | Core (AC-6) | — |
| Tải lại, gửi đường dẫn | Core (AC-2) | Core (AC-4) |

Lát C: thường và toàn màn hình (AC-2, AC-3), dưới `md` (AC-8). Lát D: AC-9.

## Core

1. Sơ đồ chiếm trọn vùng nội dung, không bề rộng tối đa, không đầu trang lớn — lời hứa chính của câu giao.
2. Toàn màn hình thu thanh bên khu, ghi lên đường dẫn.
3. Esc thoát toàn màn hình, nhưng nhường Esc cho ngăn hay hộp thoại đang mở trên sơ đồ.
4. Một màn, hai kiểu xem: cả công ty và quanh một mục tiêu (tâm trên đường dẫn).
5. Lối vào từ ngăn mục tiêu mở Sơ đồ lấy tâm mục tiêu đó.
6. Đường cũ của trang quanh mục tiêu và của Toàn cảnh › Sơ đồ tới đúng kiểu xem.
7. Bỏ Cây căn chỉnh, `?xemOkr=cay` tới Sơ đồ mở sẵn thẻ đơn vị (chờ Hỏi-1).
8. Dưới `md`: danh sách, không khung vẽ, không nút toàn màn hình.
9. Chờ tải, lỗi, tâm không thấy — tiêu đề luôn hiện.
10. Chữ hai thứ tiếng, `translate="no"`, màn thật ở 1440 và 390.

## Later

- Thẻ Sơ đồ trong trang một bộ OKR (`SoDoNho` của bản mẫu) — thuộc VK3 `trang-bo-okr`.
- Toàn màn hình của trình duyệt (Fullscreen API) và giấu cả thanh biểu tượng, đầu ứng dụng — bản mẫu chỉ thu thanh bên
  khu; mở lại khi người dùng xin thêm chỗ.
- Lối vào từ ngăn KR — VK7 `ngan-kr-mot-cho` dựng ngăn KR mới.
- In hay xuất ảnh sơ đồ; lọc theo người dẫn trên sơ đồ.
- [NGÀNH: Tability Strategy map] chia sẻ đường dẫn công khai ra ngoài — không có ở CRM nội bộ.

## Never

- Sửa căn chỉnh, kéo nối từ sơ đồ — vòng chỉ đọc, sửa căn chỉnh ở tab «Căn chỉnh» của ngăn.
- Đổi đầu ra `okr.soDoDonVi`, `okr.quanhMucTieu`, `okr.cayCanChinh` — hai sơ đồ đã ký giữ nguyên nghĩa dữ liệu.

## Cross-cutting áp mọi ô Core

- Khổ 1440 | 390; `vi` | `en`; `translate="no"` cho tên mục tiêu, KR, đơn vị; phím và vòng `focus-visible`; không cuộn
  ở cấp tài liệu; hồ sơ đã ký đo trên các màn cũ.
