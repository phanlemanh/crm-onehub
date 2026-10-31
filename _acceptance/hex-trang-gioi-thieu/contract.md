---
schema_version: 1
feature: Khách xem trang giới thiệu thấy đúng màu của bộ giao diện ở cả nền sáng và tối, vì trang không còn mã màu hex nào ngoài tệp token
slug: hex-trang-gioi-thieu
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: machine-cleared
design_doc: docs/superpowers/specs/2026-10-31-hex-trang-gioi-thieu-design.md
approved_by: Phan Le Manh
approved_at: 2026-10-31
---

# Acceptance Contract: hex-trang-gioi-thieu

## Context

Trang giới thiệu (`/`) còn 11 mã màu hex đặt ở chỗ gọi trong 6 tệp `apps/app/components/landing/*` — nợ hex thật duy
nhất của phần màn trong app (nghiên cứu sàn thiết kế 31/10, mục 3.4). Vòng này thay chúng bằng token ngữ nghĩa có sẵn
của `packages/ui`, để khách thấy đúng màu của bộ giao diện và để bật M1 sau này không chặn oan vòng chạm trang giới
thiệu. Bước thiết kế còn thấy trang không giữ nền tối khi máy khách đặt nền sáng (token ngữ nghĩa chỉ giải ở
`:root`); vòng này sửa luôn ở `globals.css`, vì câu giao hứa «đúng màu ở cả nền sáng và tối».

Source input: hàng SN2 của `docs/plan/lo-trinh-okr.json`; ô cơ hội `_acceptance/hex-trang-gioi-thieu/opportunity.md`.

## Criteria

- AC-1: Given cây mã của vòng, When quét `apps/app/components/landing` bằng mẫu `RE_HEX` của kit (`design-floor-s4.mjs`), Then không còn chỗ nào khớp; và cùng thước ấy chạy trên bản sao có tiêm một mã hex thì báo đúng tệp và dòng bị tiêm.
- AC-2: Given trang giới thiệu đang chạy ở khổ 1280, When đọc màu tính được của 11 chỗ đã khai ở bảng «Hiện trạng» của design doc, Then mỗi chỗ có đúng màu của token đã khai, đọc từ chính trang (không chép giá trị tay).
- AC-3: Given trang giới thiệu đang chạy, When đo tương phản của các chỗ chữ đã đổi (nhãn BUILT WITH, SUGGESTED, nhãn mono, hạn việc, chữ gợi ý trong ô hỏi, lệnh «/Create agent») với nền thật phía sau, Then mỗi chỗ đạt ít nhất 4.5:1.
- AC-4: Given trang giới thiệu ở khổ 1280 và 375, When máy khách đặt nền sáng rồi nền tối, Then hai ảnh của cùng khổ trùng từng điểm (trang luôn vẽ nền tối).
- AC-6: Given ảnh nền tối của trang chụp trước vòng (onehub 6ca59691a) ở khổ 1280 và 375, When chụp lại sau vòng, Then hai ảnh chỉ khác nhau trong hộp bao của 11 chỗ đã khai.
- AC-5: Given ô hỏi đang hiện chữ gợi ý, When khách bấm một câu gợi ý, Then chữ trong ô đổi từ màu `muted-foreground` sang màu `foreground`.

## Coverage

- Trục chỗ màu: 11 chỗ của bảng «Hiện trạng» (chữ · nền · viền · nét SVG) [thước CE: nghiên cứu sàn thiết kế mục 3.4 đếm 6 tệp · 11 chỗ; AC-1 quét lại cả thư mục]
- Trục khổ: 1280 · 375 [thước CE: nếp chụp hai khổ của `docs/design.md` mục «Nếp màn trong app»]
- Trục nền máy khách: sáng · tối [thước CE: câu giao của hàng SN2; ảnh cây gốc 31/10 cho thấy nền sáng hỏng]
- Trục trạng thái ô hỏi: chưa hỏi · đã hỏi [thước CE: hai nhánh của `asked` trong `ask-card.tsx`]
- Trục tương phản: chữ đã đổi × nền thật [thước CE: WCAG 2.1 AA 4.5:1 cho chữ thường]

## Đường đo

- Thước: số chỗ hex trong `apps/app/components/landing` · số từ: thước quét của E1 · bảo đảm bởi: AC-1
- Thước: ảnh hai khổ ở hai nền không đổi màu ngoài chỗ đã khai · số từ: ảnh của thước màn E4, E6 · bảo đảm bởi: AC-4, AC-6

## Out of scope

- `text-white` ở trang giới thiệu (tên màu Tailwind, không phải hex) — đổi sang `foreground` là việc khác, không thuộc nợ hex.
- Hex trong `packages/ui/src/components/brand-logos/*` (màu nhận diện của hãng khác) và bộ chọn `chart.tsx` — nghiên cứu xếp là đúng chỗ hoặc bắt nhầm.
- Bật M1 (`design.surface_globs`, `executors.design.floor`) — chờ kit sửa hai lỗi chặn theo nghiên cứu sàn thiết kế.
- Thêm token mới vào `globals.css` — chỉ làm nếu chủ kho chọn lối ấy ở Hỏi-1.
- Ép theme tối cho đường `/` qua `next-themes` ở layout gốc — ngoài ranh giới của hàng; sửa ở `globals.css` đủ cho câu giao.

## Notes

- Trang bọc `div.dark` nên luôn vẽ bằng token nền tối; «hai nền» của câu giao là cài đặt của máy khách, AC-4 chứng
  rằng nó không đổi gì.
- Ô cơ hội: `_acceptance/hex-trang-gioi-thieu/opportunity.md` (Cổng Đáng ký 31/10, Phan Le Manh).
