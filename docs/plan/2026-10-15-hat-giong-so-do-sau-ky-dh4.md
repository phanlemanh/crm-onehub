# Hạt giống — Sơ đồ đơn vị (DH4): bốn chỗ sửa sau chữ ký Cổng Bằng chứng

Gốc: `_acceptance/so-do-can-chinh-don-vi/` (DH4), ký Cổng Bằng chứng 15/10/2026. Hai mục «mở hợp đồng mới» do chủ kho
chọn (Ngoài-8, Ngoài-14 trong `review-findings.md`, sổ `decisions.jsonl` stage gate2). Hai phát hiện trong hợp đồng
(t2 AC-10, t3 AC-3) mà S4 lượt 3 nêu nhưng vẫn ĐẠT; vòng đã chạm trần 3 lượt nên chúng không được sửa trong vòng.
Hạt giống là SỔ, không phải ô: mở thành hàng khi DH4 đã lên production và phiên nghiệm thu DH4 (chậm nhất 04/11) đã chạy.

## Lỗ

1. **Lệnh nạp mẫu không chặn production (Ngoài-8, ưu tiên cao nhất).** `apps/api/scripts/okr-mau/ca-so-do.ts --nap`
   ghi vào CSDL mà không qua `kiemDuocNap`. Nếu ai chạy tay lệnh này khi máy trỏ vào hệ thống thật, dữ liệu mẫu sẽ vào
   dữ liệu thật của công ty.
2. **Mục tiêu giới hạn không nối được vẫn bị gắn cờ (Ngoài-14) — và mặt kia của nó (t3, AC-3).** Bộ lọc
   `(!vao.gioiHan.has(m.id) || coDichThay(m))` ở `apps/api/src/okr/so-do-don-vi.ts` bỏ mọi mục tiêu giới hạn không có
   đích, áp cho mọi cấp kể cả `onehub`. Vì vậy thẻ Công ty thiếu các mục tiêu công ty giới hạn mà cây căn chỉnh vẫn
   giữ ở gốc. Ở các cấp dưới, cờ «chưa góp vào đâu»/«chưa nối lên» lại có thể bật vì mục tiêu mà không ai được phép
   nối. Hai ca phải cùng một luật: mục tiêu giới hạn được đếm vào nút, nhưng không bật cờ nối.
3. **Trạng thái «kỳ chưa có mục tiêu công bố» của Sơ đồ không bao giờ hiện (t2, AC-10).** `toan-canh.tsx` dựng Empty
   «tuần đầu» khi `hang.every(h => h.soMucTieu === 0)`, nên `<SoDoDonVi>` không được dựng và nhánh rỗng của nó là mã
   chết. Hướng sửa: bỏ nhánh rỗng của sơ đồ, hoặc cho ViewSwitch đứng ngoài nhánh `tuanDau`. Phải có bài DOM đi qua
   `toan-canh.tsx` thật, không gọi thẳng `SoDoDonVi`.

## Vì sao chưa làm ở DH4

S4 lượt 3 đã ĐẠT mọi tiêu chí và vòng đã chạm trần 3 lượt. Không mục nào làm sai mục đích của sơ đồ là chỉ ra đơn vị
chưa nối. Mục 2 và 3 sai theo chiều an toàn: hiện thiếu chứ không lộ dữ liệu. Mục 1 chỉ chạy khi có người gõ tay lệnh.

## Hướng

Một hàng T2 riêng: (1) gọi `kiemDuocNap` trước `napCaSoDo`; (2) một luật cho mục tiêu giới hạn, có ca ở
`okr-so-do-don-vi.spec.ts` cho quản trị và cho người xem hẹp quyền, so tập mục tiêu nút `goc` bằng nhau với gốc của cây
căn chỉnh; (3) bài DOM đi qua `toan-canh.tsx`.
