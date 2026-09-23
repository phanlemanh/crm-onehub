---
schema_version: 1
feature: Tiêu đề cột đọc trọn ở các trang danh sách dựng trên DataTable chung
slug: tieu-de-cot-doc-tron
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: implemented
design_doc: docs/superpowers/specs/2026-09-22-tieu-de-cot-doc-tron-design.md
approved_by: Phan Le Manh
approved_at: 2026-09-23
---

# Acceptance Contract: tieu-de-cot-doc-tron

## Context

Các trang danh sách dựng trên `packages/ui/src/components/data-table.tsx` cắt tiêu
đề cột có nút sắp xếp ở một số khổ. Đo trên Chrome thật, 5 trang × 5 khổ × 2 tiếng:
30/50 ô hỏng, 67 tiêu đề bị cắt, khớp từng ô người dùng đo trên deals ngày
2026-09-22. Nguyên nhân là phần trăm cố định trong bảng `table-fixed` cộng với cột
ẩn theo khổ. Sửa ở DataTable chung (bố cục auto, nhãn tối đa hai dòng, mũi tên
cùng dòng chữ), kèm ba chỉnh ưu tiên cột ở campaigns, companies, members.

Source input: prompt (phiên 2026-09-22, số đo người dùng trên /crm/deals)

## Criteria

Ma trận chung: 5 trang [deals, companies, contacts, campaigns, members] × 5 khổ
[320, 375, 768, 1024, 1440] × 2 tiếng [vi, en] = 50 ô, Chrome thật, máy chủ dev của
cây đang xét, dữ liệu dev có hàng.

- AC-1: Given một ô của ma trận, When trang tải xong, Then tập tiêu đề cột đang hiện đúng bằng tập viết trước cho (trang, khổ) — tập của cây chưa sửa, trừ đúng ba cột ở AC-5 — và mọi tiêu đề trong đó đọc trọn: nhãn không bị cắt ngang hay dọc, không quá hai dòng, mũi tên sắp nằm trong ô tiêu đề; hàng tiêu đề cao 44px (±1).
- AC-2: Given một ô của ma trận, When trang tải xong, Then trang không tràn ngang và thẻ bảng không cuộn ngang; và ở deals@320 (vi, en) có ít nhất một ô thân mà phần tử cắt «…» (`text-overflow: ellipsis`) đang cắt chữ và nằm gọn trong ô.
- AC-3: Given một cột có nút sắp xếp đang hiện, When trang tải xong, Then mép chữ tiêu đề thẳng hàng với mép nội dung ô thân đầu tiên của cột trong 1,5px — mép trái với cột căn trái, mép phải với cột căn phải — và mũi tên cách chữ không quá 6px.
- AC-4: Given trang có ô chọn [deals, companies, contacts] ở khổ 768, 1024, 1440, When trang tải xong, Then cột ô chọn rộng 40px (±1).
- AC-5: Given ba chỉnh ưu tiên cột, When trang tải xong, Then campaigns ở 320/375 không hiện «Đã gọi» và hiện «Trả lời»; companies ở 320/375 không hiện «Số thoả thuận đang mở»; members ở 768 không hiện «Ngày vào» và ở 1024 hiện nó.
- AC-6: Given deals ở 375 và 1024 (vi), When bấm tiêu đề «Công ty» (cột không đang sắp) rồi bấm lần nữa, Then sau lần một ô tiêu đề đó mang `aria-sort` theo chiều sắp mặc định của trang (deals khai `defaultDir: "desc"` → `descending`) và URL mang `sort=company`, sau lần hai mang chiều ngược lại; và mũi tên của tiêu đề đó khác nhau ở ba lúc — trước bấm, sau lần một, sau lần hai.
- AC-7: Given một ô của ma trận, When trang tải xong, Then phần chữ tên nhìn thấy trong ô đầu của hàng đầu rộng ít nhất 40px. (Sàn chống hồi quy: bản sửa đo nhỏ nhất 43px ở contacts@768, bằng cây chưa sửa.)
- AC-8: Given cây này đã rebase lên `onehub` có merge của hồ sơ `onboarding-giong-deals` (607fe361), When chạy thước `ogd_man_danh_muc` của hồ sơ đó trên cây này, Then nó xanh — bảng Kế hoạch 30 ngày không hồi quy vì đổi DataTable chung. [Chờ hồ sơ đó ghim lại bộ chọn nhãn — xem Notes.]
- AC-9: Given ảnh chụp deals, companies, campaigns ở 320 và 1024, vi và en, When người xem, Then đọc được tên mọi cột, mũi tên đứng sát nhãn của nó, và cột đầu còn đủ chỗ để nhận ra bản ghi. (judgment)

## Coverage

Quét một lượt bằng morphological-scan (preset test-matrix). Chân sản phẩm: đào repo.
Chân ngành: WCAG 2.2 SC 1.4.10 Reflow (320 CSS px; bảng dữ liệu được miễn cuộn hai
chiều — hồ sơ này vẫn đặt mức chặt hơn: không cuộn), và mẫu Data Table của shadcn/ui
(nút ghost + mũi tên trong tiêu đề — nguồn của mẫu hiện tại).

- Trục A — trang dùng DataTable: deals | companies | contacts | campaigns | members | api-keys | sso | chi-tiết-chiến-dịch | onboarding [thước CE: SUY-TỪ-REPO grep `components/data-table"` trong apps/app, 9 nơi dùng + field-columns]
- Trục B — khổ × tiếng: 320 | 375 | 768 | 1024 | 1440 × vi | en [thước CE: SUY-TỪ-REPO ~/.claude/rules/web/testing.md mốc khổ; apps/app/lib/messages]
- Trục C — loại tiêu đề: sắp được căn trái | sắp được căn phải | sắp được căn giữa | không sắp | chỉ sr-only [thước CE: SUY-TỪ-REPO packages/ui/src/components/data-table.tsx `DataTableColumn`]
- Trục D — trạng thái & cột đi kèm: đang sắp | không sắp | ô chọn 40px | nội dung ô dài | cột trường tuỳ biến (từ 1024) [thước CE: SUY-TỪ-REPO data-table.tsx, components/crm/fields/field-columns.tsx]
- Core: A{deals, companies, contacts, campaigns, members} × B đủ × C{trái, phải} × D{đang sắp, không sắp, ô chọn, ô dài} → AC-1…AC-7; cột trường tuỳ biến có mặt sẵn trong các trang đo từ 1024.
- Later: api-keys, sso (CSDL dev không có dòng nào — sửa có hiệu lực theo cấu trúc, không đo bằng dữ liệu thật); chi-tiết-chiến-dịch (không có tiêu đề sắp được).
- Never: căn giữa (không trang nào dùng); sửa onboarding (hồ sơ `onboarding-giong-deals` giữ). Đối chứng onboarding sau rebase: AC-8.
- [GIẢ ĐỊNH] Ở điện thoại, «Trả lời» của campaigns quan trọng hơn «Đã gọi», và companies chỉ cần cột Tên; ở 768, members bỏ «Ngày vào» được (AC-5).
- [GIẢ ĐỊNH] Tiêu đề dài xuống hai dòng (27/50 ô) dễ đọc hơn tiêu đề một dòng bị cắt (AC-1, AC-9).
- [GIẢ ĐỊNH] Chữ tên hẹp hơn cây cũ ở 12/50 ô, sâu nhất campaigns@320 95→72px, members@320/vi 62→44px, vẫn đủ nhận ra bản ghi (AC-7 sàn máy, AC-9 mắt người).

## Out of scope

- Không sửa tệp nào của trang onboarding (`apps/app/app/(app)/[slug]/onboarding/**`) — bảng của nó vẫn đổi bố cục vì dùng DataTable chung; thước `ogd_man_danh_muc` chạy lại làm đối chứng sau rebase.
- Không đo api-keys, sso, chi tiết chiến dịch.
- Không thêm tooltip mới (giữ `title` sẵn có); tiêu đề không quá hai dòng.
- Không đổi ưu tiên cột của trang nào ngoài ba chỉnh ở AC-5.
- Nút «Phát chia» của members@320 bị xén mép phải — có sẵn trước bản sửa (`evidence/cong1-truoc/members-320-vi.png`).
- Không rút gọn nhãn «Số thoả thuận đang mở» (`CONTEXT.md` đã chốt giữ, 2026-09-03).
- Không đổi màu, cỡ chữ hay biến thể Button.

## Notes

- Bàn đo: api 3501 + app 3500 của cây này (`.claude/launch.json`: `ban-do-cot-api`, `ban-do-cot-app`), dùng CSDL dev `crm`. Cổng 3000/3001 là của phiên onboarding — không đo trên đó.
- Mọi lượt đo chạy `scripts/lan-do/tien-de.mjs`, thứ ghi rồi dọn trên CSDL dev — chạy tuần tự với phiên onboarding, không chồng.
- Known limits (Ngoài-1, ký Cổng 2 ngày 2026-09-23): `rang/chup.mjs` không gọi chốt đúng-cây `canhCay()` trước khi chụp, nên ảnh minh chứng của E9 có thể lấy từ máy chủ của cây khác nếu cổng 3500/3501 bị cây khác giữ; bước kiểm cổng của E9 chỉ là chữ.
- Known limits (Ngoài-2): `rang/chup.mjs` nuốt lỗi hết giờ chờ bảng và vẫn lưu ảnh, nên trang trống hoặc bị chuyển hướng vẫn ra ảnh như lượt chụp thành công.
- Known limits (Ngoài-3): cùng gốc với Ngoài-2 — `rang/chup.mjs` không kiểm đường dẫn cuối sau khi mở trang, nên ảnh của màn bị chuyển hướng vẫn được coi là bằng chứng.
- Known limits (Ngoài-5): khoá `tdc_tieu_de_cot` không đặt `DUOI_CONG=1`, nên `CHI_MAN` sót trong môi trường làm răng chỉ đo một phần ma trận mà vẫn thoát 0.
- Known limits (Ngoài-6): nhánh cắt dọc (`scrollHeight`) mới thêm vào thước của hồ sơ Kế hoạch 30 ngày chưa có chiều đỏ riêng ghim đúng nhánh đó; chiều đỏ đã chạy (`evidence/E8-chieu-do.txt`) chỉ chứng thước bắt được nhãn bị cắt nói chung.
- Known limits (Ngoài-7): E10 (rà thiết kế tĩnh) chỉ quét hai tệp giao diện trong khi lượt giao sửa bốn tệp giao diện; `companies-table.tsx` và `members-table.tsx` không qua rà tĩnh ở vòng này.
- AC-8 đỏ tại 607fe361 (`evidence/ogd-sau-rebase-607fe361.txt`): 48 dòng `khong doc duoc nhan`, không dòng cắt/tràn/nút nào — thước onboarding tìm nhãn bằng `span.truncate, span.block`, bản sửa đổi nhãn thành `[data-slot="table-head-label"]`. Đã báo phiên của hồ sơ đó (trước 15:29Z) đề xuất thêm bộ chọn và điều kiện cắt dọc; ghim lại là việc của hồ sơ đó. Không bọc thêm `span.block` để khớp bộ chọn.
