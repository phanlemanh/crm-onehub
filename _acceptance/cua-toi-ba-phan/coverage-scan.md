# Quét độ phủ — cua-toi-ba-phan (15/10, preset entity-feature, tự dựng trục)

## Ngữ cảnh
- Sản phẩm: OneHub CRM, khu Mục tiêu (OKR), thẻ «Của tôi» — chân sản phẩm: đào kho
  [SUY-TỪ-REPO: docs/plan/pham-vi-okr-dieu-huong-1410.md C1–C3, A3] [SUY-TỪ-REPO: apps/app/app/(app)/[slug]/okr/cua-toi.tsx]
  [SUY-TỪ-REPO: apps/api/src/okr/okr-cap-nhat.service.ts `capNhatTuan`, `moCapNhat`]
  [SUY-TỪ-REPO: apps/api/src/okr/okr.contracts.ts `okrAccessOutput.headOf`] · chân ngành: [NGÀNH: Perdoo «My OKRs» —
  OKR thuộc đơn vị, trưởng là người dẫn, trang của tôi là hộp việc] (hàng DH3 dẫn) và bản mẫu
  `/proto/dieu-huong-okr` `cua-toi.tsx` @706ba494a.

## Trục
- Trục A — phần của trang: cần cập nhật | khối việc | đơn vị bạn dẫn | KR bạn phụ trách | nhóm tham gia / theo dõi /
  đã bỏ | thanh thẻ | đường cũ `/okr/cap-nhat-tuan`  [thước CE: bản mẫu 14/10 + `cua-toi.tsx` hôm nay]
- Trục B — người xem: trưởng bộ phận | trưởng phòng ban | dẫn hai đơn vị | thành viên không dẫn ai | quản trị không
  dẫn đơn vị | vai «chỉ OKR»  [thước CE: `headOf` của `okr.access`]
- Trục C — trạng thái KR tuần này: còn thiếu | thiếu một phần | đủ | không phụ trách KR nào | ô chu kỳ khác chu kỳ
  đang chạy  [thước CE: `capNhatTuan.items[].updatedThisWeek`]
- Trục D — lối vào phiên: nút trong Của tôi | `?tu=nhac` | `?tu=viec-cua-toi` | đường cũ | ngăn KR (`sheet`) | tải
  trang không bấm  [thước CE: `LOI_VAO` trong `packages/validation/src/okr-cap-nhat.ts`]
- Trục E — trạng thái dữ liệu: đang tải | lỗi một phần | gửi lỗi | đơn vị chưa có mục tiêu  [thước CE: `docs/design.md`
  «Chờ tải và lỗi tải»]

## Core
1. A «cần cập nhật» × C (thiếu / một phần / đủ / không KR) — AC-1, E1.
2. D «nút trong Của tôi» × gửi thật, phiên ghi `cua-toi`, tải không bấm không phiên — AC-2, E2 + E3.
3. D `?tu=nhac` / `?tu=viec-cua-toi` / lạ × mở sẵn, `tu` rời đường dẫn — AC-3, E4 + E16 (máy chủ thật).
4. A «đường cũ» × giữ tham số; tin nhắc mới trỏ `/okr`; 0 liên kết cũ — AC-4, E5 + E6.
5. A «đơn vị bạn dẫn» × B (bộ phận / phòng ban / hai đơn vị) × E «đơn vị rỗng», số khớp Theo đơn vị — AC-5, E7 + E16.
6. A «KR bạn phụ trách» + nhóm tham gia: không mục tiêu nào rời Của tôi — AC-6, E8.
7. B «thành viên không dẫn ai» × OKR cá nhân bật/tắt: không lời mời tạo — AC-7, E9.
8. A «thanh thẻ» bốn thẻ × vi/en — AC-8, E10.
9. E đang tải / lỗi một phần / gửi lỗi — AC-9, E11.
10. Đường đo ngưỡng Cổng Đáng (lối vào × đã gửi × người dẫn × cửa sổ) — AC-10, E12.
11. Bài kiểm cũ của hồ sơ đã ký — AC-11, E13. Bản mẫu — AC-12, E14. Đọc thứ tự trên ảnh — AC-13, E15 + E17.

## Later
- Phần 1 theo ô chu kỳ khi chu kỳ đang chọn không phải chu kỳ đang chạy — hôm nay trang cũ cũng theo chu kỳ đang
  chạy; [GIẢ ĐỊNH] giữ nguyên.
- Đo «không mở thẻ khác» bằng dấu vết điều hướng phía trình duyệt — giới hạn đã khai ở ô cơ hội.

## Never
- Quản trị không dẫn đơn vị × phần «Đơn vị bạn dẫn» toàn công ty: không — quản trị có Toàn cảnh; `headOf` rỗng thì
  không phần 2.
- Vai «chỉ OKR» × giao diện riêng: không — vai này đi đúng nhánh người xem thường của `headOf` và `mine`.
- Ngăn KR (lối `sheet`) × đổi luồng: không — lối đó giữ nguyên, nó là đối chứng của đường đo.

## Cross-cutting áp mọi ô Core
- Khổ 1440 và 390; tiếng Việt và tiếng Anh; quyền và số lấy từ máy chủ (`headOf`, `danhSach`, `capNhatTuan`), không
  tính ở trình duyệt.
