---
schema_version: 1
feature: Người dùng bàn phím hay trình đọc màn bấm «Giữ lại» hoặc gặp lỗi khi xoá tín hiệu vẫn đứng đúng dòng mình vừa thao tác, không phải dò lại từ đầu trang
slug: tieu-diem-sau-hop-xoa-tin-hieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: approved
approved_by: Manh Phan
approved_at: 2026-10-24T07:26:02Z
design_doc: docs/superpowers/specs/2026-10-24-tieu-diem-sau-hop-xoa-tin-hieu-design.md
---

# Acceptance Contract: tieu-diem-sau-hop-xoa-tin-hieu

## Context

Trên trang «Tín hiệu đã gửi», hộp hỏi lại trước khi xoá luôn chặn việc trả tiêu điểm (cách TH6 dùng để dời tiêu điểm sau khi
xoá xong). Hệ quả: bấm «Giữ lại», bấm Esc hay gặp lỗi khi xoá đều làm tiêu điểm rơi về đầu trang, và người dùng bàn phím
hay trình đọc màn phải dò lại tới dòng mình vừa đứng. Vòng này trả tiêu điểm về nút ⋮ của đúng dòng ấy ở mọi đường đóng
hộp, giữ nguyên cách đã ký khi xoá xong. Chỉ trong ứng dụng web: không đổi API, dữ liệu hay bộ giao diện chung.

Source input: `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/opportunity.md` (Cổng Đáng `build` 2026-10-19, hàng TH6b của
`docs/plan/lo-trinh-okr.json`; gốc là Ngoài-6 ở Cổng Bằng chứng của `_acceptance/sua-giao-dien-tin-hieu/`).

## Criteria

- AC-1: Given trang «Tín hiệu đã gửi» có dòng và hộp hỏi xoá đang mở từ nút ⋮ của một dòng (dòng đầu, giữa, cuối hay dòng duy nhất), When người gửi bấm «Giữ lại» hay phím Esc, Then hộp đóng, tiêu điểm ở đúng nút ⋮ của dòng đó — bản đang hiện ở khổ hiện tại (bảng từ 768px, thẻ dưới 768px) — dòng còn nguyên và không lệnh xoá nào được gửi.
- AC-2: Given hộp hỏi xoá đang mở từ một dòng, When người gửi xác nhận xoá mà máy chủ từ chối vì đội sản phẩm vừa lấy tín hiệu ấy về, Then dòng còn, câu «chưa xoá được vì đội sản phẩm vừa mở» theo ngôn ngữ đang chọn hiện trong vùng trình đọc màn tự đọc, tiêu điểm ở nút ⋮ của dòng đó sau khi danh sách làm mới, và mở menu ⋮ của dòng thì mục «Xoá» khoá kèm dòng nói vì sao.
- AC-3: Given hộp hỏi xoá đang mở từ một dòng, When người gửi xác nhận xoá mà mất mạng hay máy chủ lỗi, Then dòng còn, câu «chưa xoá được» theo ngôn ngữ đang chọn hiện trong vùng trình đọc màn tự đọc, tiêu điểm ở nút ⋮ của dòng đó; When họ mở lại menu từ chỗ đó và xoá lại khi mạng đã có, Then lệnh xoá gửi đúng tín hiệu ấy và dòng biến mất.
- AC-4: Given người gửi vừa xác nhận xoá, When máy chủ chưa trả lời, Then tiêu điểm đứng ở nút ⋮ của dòng đang xoá, không ở đầu trang; When trong lúc chờ họ tự dời tiêu điểm tới chỗ khác trên trang rồi lệnh xoá hỏng, Then tiêu điểm ở yên chỗ họ đã dời tới; When họ tự dời đi rồi lệnh xoá xong, Then tiêu điểm vẫn tới nút ⋮ của dòng kế như AC-5 (hành vi TH6 đã ký).
- AC-5: Given người gửi vừa xác nhận xoá một dòng, When xoá xong và danh sách làm mới, Then mọi điều hồ sơ «sửa giao diện tín hiệu» đã ký vẫn đúng — tiêu điểm tới nút ⋮ của dòng ngay dưới (dòng cuối thì dòng ngay trên; dòng đó không xoá được thì chính dòng đó; hết dòng thì nút «Gửi tín hiệu» của trang rỗng) và trình đọc màn đọc «Đã xoá tín hiệu crm-N».
- AC-6: Given trang chạy thật với người gửi có tín hiệu, When người đo chỉ dùng bàn phím ở bề ngang 375 và 1280px để mở hộp xoá rồi bấm «Giữ lại», bấm Esc, xác nhận khi quản trị vừa lấy tín hiệu về, xác nhận khi mạng mất, và xác nhận xoá xong, Then sau mỗi lần phần tử đang có tiêu điểm là nút ⋮ của đúng dòng (xoá xong: dòng kế), vòng sáng tiêu điểm hiện, trang không cuộn ngang, và mỗi tổ hợp có một ảnh.
- AC-7: Given vòng này chỉ sửa ứng dụng web, When so mã của vòng với nhánh chính, Then không tệp nào dưới `apps/api`, `packages/ui`, `packages/db` hay `packages/validation` đổi, và các tệp giao diện tín hiệu không có lỗi nặng ở bộ kiểm thiết kế tĩnh.

## Coverage

Quét bằng `morphological-scan` (preset test-matrix), chi tiết ở `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/coverage-scan.md`.

- Trục A — đường đóng hộp × kết cục: «Giữ lại» | Esc | xoá xong | đã lấy về (409) | mất mạng | máy chủ lỗi khác [thước CE: ba nút/phím của `ConfirmDialog` ở `packages/ui/src/components/confirm-dialog.tsx`; nhánh `onSuccess`/`onError` của `apps/app/app/(app)/[slug]/tin-hieu/danh-sach-tin-hieu-trang.tsx`]
- Trục B — khổ: 375 | 1280 [thước CE: hai bản nút ⋮ `md:hidden` / `hidden md:block` của `danh-sach-tin-hieu.tsx`; ngưỡng `bat_khi` của hàng TH6b]
- Trục C — vị trí dòng: đầu | giữa | cuối | duy nhất [thước CE: năm ô `sgt-tieu-diem` của TH6]
- Trục D — ngôn ngữ: vi | en [thước CE: `apps/app/lib/messages/tin-hieu.ts`]
- Chân ngành: [NGÀNH: WAI-ARIA Authoring Practices — Dialog (Modal) Pattern] trả tiêu điểm về phần tử đã mở hộp; [NGÀNH: WCAG 2.2] 2.4.3, 2.4.7, 4.1.3.
- Không gắn (cross-layer): vòng không đổi đường máy chủ nào; đường xoá và lời từ chối 409 đã ký ở `_acceptance/gui-tin-hieu-trong-crm/`, và phép đo AC-6 chạy trên máy chủ thật (quản trị lấy về qua `tinHieu.keoVe`).

## Đường đo

- Thước: tổ hợp đạt trên production — {«Giữ lại», xoá hỏng} × {375, 1280} bằng bàn phím, tiêu điểm về đúng nút ⋮ của dòng · số từ: phiên nghiệm thu chạy tay trên production theo đúng ma trận ô của AC-6 (kịch bản trong `_acceptance/tieu-diem-sau-hop-xoa-tin-hieu/rang/do-ban-phim.mjs`; bản tự động chạy trên kho đo riêng, không chạy trên production) · bảo đảm bởi: AC-6

## Out of scope

- Mất mạng kéo dài làm lượt làm mới danh sách cũng hỏng, trang chuyển sang vùng lỗi tải và danh sách biến mất — đường sẵn có của trang, cần quyết riêng có giữ danh sách cũ khi làm mới hỏng.
- Giữ hộp hỏi xoá mở trong lúc chờ máy chủ, hay đưa câu xoá hỏng vào trong hộp — đổi hành vi đã ký ở TH6.
- Sửa `ConfirmDialog` của bộ giao diện chung để tự trả tiêu điểm cho mọi chỗ gọi.
- Đổi đích tiêu điểm khi xoá xong (đã ký ở TH6) và đổi cách tiêu điểm hiện (vòng sáng của bộ giao diện chung).

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl` (xem skill feature-loop — repo chưa dùng feature-loop thì bỏ qua).

## Notes

- Vòng đời (`docs/vong-doi.md`): vòng không thêm loại bản ghi hay trạng thái kết thúc; ba câu giữ nguyên câu trả lời của `_acceptance/gui-tin-hieu-trong-crm/`.
- Vùng: `apps/app/components/tin-hieu`, `apps/app/app/(app)/[slug]/tin-hieu`, `apps/app/lib/tin-hieu` thuộc làn MacBook Pro (luật 19 của đợt `lo-trinh-tin-hieu`).
- Hồ sơ đã ký `sua-giao-dien-tin-hieu` có eval khai `paths` chạm các tệp này (E5, E12…): ghim lại hồ sơ đó sau khi vòng này gộp.
