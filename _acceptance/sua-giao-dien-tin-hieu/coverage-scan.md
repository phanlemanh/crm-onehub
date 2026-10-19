# Quét chống sót — sửa giao diện tín hiệu (preset test-matrix)

## Ngữ cảnh

- Sản phẩm: CRM nội bộ OneHub, người gửi tín hiệu là nhân viên mọi phòng ban, không dùng git — chân sản phẩm: đào repo
  [SUY-TỪ-REPO: CONTEXT.md] (mục «Tín hiệu») [SUY-TỪ-REPO: docs/plan/pham-vi-vong-tin-hieu-1410.md] (U1–U8)
  [SUY-TỪ-REPO: _acceptance/gui-tin-hieu-trong-crm/contract.md] (hành vi đã ký).
- Chân ngành: [NGÀNH: WCAG 2.2] — 3.3.1 Error Identification (lỗi nêu bằng chữ, gắn đúng chỗ), 2.4.3 Focus Order
  (tiêu điểm không rơi về đầu trang sau thao tác), 2.5.8 Target Size Minimum (24px tối thiểu, 2.5.5 AAA 44px);
  [NGÀNH: Apple Human Interface Guidelines] đích chạm 44pt trên điện thoại;
  [NGÀNH: Material Design 3] đích chạm 48dp, lỗi biểu mẫu cấp toàn biểu mẫu tách khỏi lỗi từng ô.

## Trục

- **A — Mặt × trạng thái:** hộp {soạn trống · soạn có chữ · đang gửi · quá trần · máy chủ lỗi · biên nhận} · trang
  {có dòng · rỗng · hỏi xoá · xoá xong · xoá hỏng · dòng đã lấy về}
  [thước CE: bảng trạng thái Đặc tả UX của thiết kế; 13 trạng thái proto LT2 trong `apps/app/app/proto/catalog.ts`]
- **B — Khổ:** 375 · 768 · 900 · 1100 · 1280
  [thước CE: lượt rà production 14/10 (khoảng lỗi 768–1100, crm-1); breakpoint `md` của `docs/design.md`]
- **C — Ngôn ngữ:** vi · en [thước CE: `apps/app/lib/messages/tin-hieu.ts` khai đúng hai bản]
- **D — Loại lỗi:** bố cục · lỗi sai chỗ · định dạng theo ngôn ngữ · nhận diện (mã, tên màn) · tiêu điểm và cỡ chạm ·
  hỏi lại sai · chữ trạng thái [thước CE: U1–U8; WCAG 2.2 ở trên]

## Không gian

Tích A × D là trục chính (12 trạng thái × 7 loại = 84 ô, phần lớn vô nghĩa — vd «biên nhận × bố cục bảng»); B và C
cắt ngang các ô có hiển thị chữ. Ô có nghĩa đã gom thành các Core dưới.

## Core

1. trang-có-dòng × bố cục × {768, 900, 1100, 1280} — cột kể rộng nhất (U1) → AC-1
2. hộp-quá-trần × lỗi sai chỗ × {vi, en} — vùng lỗi cả hộp, khoá Gửi kèm lý do, khoá theo ngày (U2, LT2 Ngoài-2) → AC-2
3. hộp-máy-chủ-lỗi × lỗi sai chỗ — vùng lỗi chung, bấm lại được (U2) → AC-2
4. trang-có-dòng × định dạng × {vi, en} — giờ theo ngôn ngữ, giờ Việt Nam (U3) → AC-3
5. trang-có-dòng / hỏi-xoá × nhận diện — mã trên dòng, hộp xoá nêu điều đã kể (U4) → AC-4
6. xoá-xong × tiêu điểm — tiêu điểm tới dòng kế, đọc «đã xoá» (U5) → AC-5
7. xoá-hỏng × lỗi sai chỗ — dòng còn, nói vì sao (LT2 Ngoài-5) → AC-5
8. trang-có-dòng × cỡ chạm × 375 — ⋮ ≥ 36px (U5) → AC-6
9. hộp-soạn-trống × lỗi sai chỗ — Gửi khoá có lý do (U5) → AC-6
10. biên-nhận × hỏi lại sai — đóng ngay; đối chứng dương soạn có chữ vẫn hỏi (U6) → AC-7
11. hộp-soạn / trang × nhận diện × {vi, en} — tên màn thay đường dẫn (U7) → AC-8
12. trang × chữ trạng thái × vi — không từ nội bộ, không lặp ý (U8) → AC-9
13. dòng-đã-lấy-về × lỗi sai chỗ — xoá khoá kèm lý do (U8) → AC-9
14. mọi mặt × {375, 768, 1280} × {vi, en} trên bản chạy — không cuộn ngang, không cắt chữ, ảnh (câu giao) → AC-10

## Later

- [NGÀNH: Apple HIG / Material] đích chạm 44pt/48dp cho nút ⋮ — cần cỡ nút mới ở `packages/ui`, ngoài luật tệp chung đợt r2.
- Báo quá trần ngay khi mở hộp lần đầu trong ngày — cần API trả số đã gửi.
- Nền tối × lớp phủ hộp thoại (U9) — bộ giao diện chung, chân trời TH7.

## Never

- Đổi đường dẫn đã cất thành tên màn — dữ liệu và tệp kéo về giữ nguyên; tên suy lúc hiện là đủ và đảo được.
- Đổi câu trạng thái kit viết — thuộc kit.
- Ô «đang gửi» × bất kỳ lỗi nào trong tám — trạng thái này không có lỗi được báo (spinner, ô khoá đã đo ở LT2).

## Cross-cutting áp mọi ô Core

- Chữ người gõ và mã tín hiệu mang `translate="no"`.
- Không đổi API, khuôn dữ liệu, gói kiểm khuôn, bộ giao diện chung (AC-11).
- Điều đã ký của LT2 ngoài bốn ô bị thay vẫn đúng (AC-11).
