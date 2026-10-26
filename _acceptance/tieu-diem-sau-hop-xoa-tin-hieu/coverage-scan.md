# Quét chống sót — tiêu điểm sau hộp xoá tín hiệu (preset test-matrix)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, trang «Tín hiệu đã gửi» của người gửi — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: _acceptance/sua-giao-dien-tin-hieu/contract.md] (AC-5 đã ký: tiêu điểm sau xoá thành công)
  [SUY-TỪ-REPO: _acceptance/sua-giao-dien-tin-hieu/review-findings.md] (Ngoài-6: «Giữ lại» và xoá hỏng làm tiêu điểm rơi
  về đầu trang) [SUY-TỪ-REPO: apps/app/components/tin-hieu/danh-sach-tin-hieu.tsx] (`onCloseAutoFocus` luôn chặn trả tiêu
  điểm) [SUY-TỪ-REPO: apps/api/src/tin-hieu/tin-hieu.router.ts] (`keoVe` là đường thật làm tín hiệu thành «đã lấy về»).
- Chân ngành: [NGÀNH: WAI-ARIA Authoring Practices — Dialog (Modal) Pattern] đóng hộp thì tiêu điểm về phần tử đã mở hộp,
  trừ khi phần tử ấy không còn hay luồng tự nhiên chỉ chỗ khác; [NGÀNH: WCAG 2.2] 2.4.3 Focus Order, 2.4.7 Focus Visible,
  4.1.3 Status Messages (lỗi phải tới tai trình đọc màn mà không cần dời tiêu điểm vào câu lỗi).

## Trục

- **A — Đường đóng hộp × kết cục:** «Giữ lại» · Esc · xác nhận → xoá xong · xác nhận → đội sản phẩm vừa lấy về (409) ·
  xác nhận → mất mạng · xác nhận → máy chủ lỗi khác
  [thước CE: ba nút/phím của `ConfirmDialog` ở `packages/ui/src/components/confirm-dialog.tsx` (Cancel, Esc, Action); ba
  nhánh `onSuccess`/`onError` (409 / còn lại) của `danh-sach-tin-hieu-trang.tsx`]
- **B — Khổ:** 375 (danh sách thẻ) · 1280 (bảng) [thước CE: hai bản nút ⋮ — `md:hidden` và `hidden md:block`; ngưỡng
  `bat_khi` của hàng TH6b]
- **C — Vị trí dòng:** đầu · giữa · cuối · duy nhất [thước CE: năm ô `sgt-tieu-diem` của TH6]
- **D — Ngôn ngữ:** vi · en [thước CE: `apps/app/lib/messages/tin-hieu.ts` khai hai bản]

## Không gian

A × B × C × D = 6 × 2 × 4 × 2 = 96 ô. C chỉ đổi đích ở nhánh «xoá xong» (đích là dòng khác); ở «Giữ lại», Esc và xoá hỏng
đích luôn là chính dòng đó, nên C gộp về một giá trị. D chỉ đổi câu lỗi, không đổi chỗ đứng. Còn lại 5 × 2 ô có nghĩa cho
chỗ đứng, cộng nhánh xoá xong (đã ký ở TH6) làm đối chứng.

## Core

1. «Giữ lại» × {375, 1280} — tiêu điểm về đúng nút ⋮ của dòng đã mở hộp, đúng bản đang hiện ở khổ đó → AC-1
2. Esc × {375, 1280} — như ô 1 → AC-1
3. xoá hỏng 409 × {375, 1280} × {vi, en} — dòng còn, câu «đội sản phẩm vừa mở» tới trình đọc màn, tiêu điểm về nút ⋮ của
   dòng; menu ⋮ khoá Xoá kèm lý do sau làm mới → AC-2
4. xoá hỏng mất mạng / máy chủ lỗi × {375, 1280} × {vi, en} — dòng còn, câu «chưa xoá được» tới trình đọc màn, tiêu điểm
   về nút ⋮, bấm lại xoá được → AC-3
5. lúc chờ máy chủ trả lời — tiêu điểm không rơi về đầu trang giữa lúc bấm «Xoá» và lúc có kết quả → AC-4
6. xoá xong × C — giữ nguyên năm ô đích đã ký ở TH6 (đối chứng: sửa không làm hỏng nhánh đã đúng) → AC-5
7. mọi ô 1–4 trên bản chạy thật bằng bàn phím, vòng sáng tiêu điểm thấy được, mỗi tổ hợp một ảnh → AC-6

## Later

- Mất mạng kéo dài làm cả lượt làm mới danh sách hỏng → trang chuyển sang vùng lỗi tải, danh sách biến mất (đường sẵn có
  của trang, không do vòng này) — cần quyết giữ danh sách cũ khi làm mới hỏng; thành tín hiệu riêng.
- [NGÀNH: WCAG 2.2] 2.4.11 Focus Not Obscured — nút ⋮ của dòng cuối nằm dưới mép màn sau khi đóng hộp ở 375: trình duyệt
  tự cuộn khi `focus()`, không đo riêng.

## Never

- Đổi `ConfirmDialog` của `packages/ui` để tự trả tiêu điểm — mọi chỗ gọi khác đang chặn trả tiêu điểm có lý do riêng; vòng
  này chỉ dùng chỗ cắm `onCloseAutoFocus` đã có.
- Giữ hộp mở trong lúc chờ máy chủ — đổi hành vi đã ký của TH6 («xoá xong và danh sách làm mới»), không phải lỗi tiêu điểm.
- Chuột × mọi ô — người dùng chuột không dò lại trang; trả tiêu điểm sau cú bấm chuột không làm hiện vòng sáng
  (`:focus-visible`), nên cùng một cách sửa phục vụ cả hai mà không cần ô riêng.

## Cross-cutting áp mọi ô Core

- Đích tiêu điểm là bản nút ⋮ đang hiện ở khổ hiện tại (bảng từ `md`, thẻ dưới `md`), không phải bản ẩn.
- Ô 3–5: không lấy tiêu điểm khỏi chỗ người dùng đã tự dời tới trong lúc chờ máy chủ (chỉ trả về khi tiêu điểm đã rơi về
  đầu trang). Ô 6 giữ nguyên cách đã ký ở TH6.
