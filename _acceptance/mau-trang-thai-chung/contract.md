---
schema_version: 1
feature: "Cùng một nghĩa — xong, chờ, hỏng, nháp, đang chạy — mang cùng một màu ở OKR, Kara, lịch họp và Tài liệu"
slug: mau-trang-thai-chung
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui]
status: signed-off
approved_by: Phan Le Manh
approved_at: 2026-10-15T21:34:55Z
design_doc: docs/superpowers/specs/2026-10-16-mau-trang-thai-chung-design.md
---

# Acceptance Contract: mau-trang-thai-chung

## Context

Hàng NM3 của `docs/plan/lo-trinh-okr.json`, dãy P4 của đợt r2; Cổng Đáng ký build 12/10. LT1 đã đặt bảng nghĩa → màu
(`packages/ui/src/lib/status-tone.ts`, mục «Màu trạng thái» của `docs/design.md`); vòng này dời mọi khu còn tự khai
màu trạng thái về bảng đó. Hạng T2: chạm `packages/ui` và `apps/app`, không chạm API, cơ sở dữ liệu hay đường T3.

Source input: hàng NM3 (`cau_giao`, `ghi_chu`) · `opportunity.md` · `docs/design.md` mục «Màu trạng thái» · design doc.

## Criteria

- AC-1: Given bảng nghĩa → màu của `packages/ui`, When đọc bảng, Then có đúng sáu nghĩa — xong, chờ, hỏng, nháp, đang
  chạy, đã kết thúc — và «đã kết thúc» mang `neutral`; And mục «Màu trạng thái» của `docs/design.md` có đúng sáu dòng
  khớp từng nghĩa và màu.
- AC-2: Given mã nguồn `apps/app` và `packages/ui/src` (trừ bản mẫu `/proto`, bài kiểm, `status-tone.ts` và
  `status-indicator.tsx`), When quét cây cú pháp mọi tệp `.ts`/`.tsx` có dùng `StatusIndicator` hay `IndicatorDot`, Then
  không chuỗi màu trạng thái nào (`success`, `warning`, `error`, `neutral`, `info`, `primary`) đứng ở giá trị đối tượng,
  `return`, nhánh `case` hay `Map` — dạng bảng hay hàm ánh xạ trạng thái sang màu; When một tệp như vậy được thêm, ở bất
  kỳ dạng nào trong bốn dạng, Then bài quét đỏ và gọi tên tệp.
- AC-3: Given 13 khu ở bảng «Hiện trạng» của design doc, When đọc bảng nghĩa mà mỗi khu khai, Then mọi trạng thái của
  khu mang đúng nghĩa ở bảng ánh xạ của design doc, và màu hiển thị bằng `toneTheoNghia(nghĩa)`; And trong 13 tệp khu
  không chỗ nào truyền màu trạng thái bằng chuỗi, kể cả ở thuộc tính JSX `tone`.
- AC-4: Given các thành phần vẽ chấm trạng thái — độ tự tin và nhịp OKR, các bước của Kara, danh sách người dự họp,
  bảng nguồn của Tài liệu — When dựng mỗi thành phần với từng trạng thái của nó, Then chấm trên trang mang `data-tone`
  bằng màu của nghĩa ở bảng ánh xạ.
- AC-6: Given bản dựng thật của cây chạy trong phiên đo, có ba chu kỳ OKR ở ba pha — lập kế hoạch, đang chạy, đã đóng —
  dựng qua service, When mở Cài đặt OKR › chu kỳ ở 1280, Then chấm của mỗi pha mang `data-tone` bằng màu của nghĩa ở
  bảng ánh xạ (nháp → `neutral`, đang chạy → `info`, đã kết thúc → `neutral`), và người xem thấy pha đang chạy màu xanh
  dương như mọi «đang chạy» khác.
- AC-5: Given mục «Màu trạng thái» của `docs/design.md`, When đọc mục, Then không còn câu «Năm khu cũ còn tự khai» và có
  câu nói bài quét ở AC-2 giữ luật một bảng.

## Coverage

Quét theo khuôn test-matrix của `morphological-scan`.

- Trục khu: 13 khu ở bảng «Hiện trạng» [thước CE: `git grep` các mẫu `Record<…, StatusTone>` và `tone: "<màu>"` trên
  f46c0bbda, trừ `/proto` và bài kiểm]
- Trục nghĩa: xong | chờ | hỏng | nháp | đang chạy | đã kết thúc [thước CE: mục «Màu trạng thái» của `docs/design.md`
  cộng nghĩa mới của Hỏi-2]
- Trục lớp đo: bảng nghĩa của khu (AC-3) | chấm trên DOM (AC-4) | màn thật (AC-6) | luật một bảng trên mã nguồn
  (AC-2) | luật trên tài liệu (AC-1, AC-5)
- Core: mọi trạng thái × 13 khu (AC-3); năm thành phần vẽ chấm × mọi trạng thái của nó (AC-4); quét mã nguồn bốn
  dạng (AC-2); ba pha chu kỳ trên màn thật (AC-6).
- Trạng thái chóng qua (hàng đợi, đang soạn) chỉ đo ở DOM — tác nhân tạo chúng và chúng không đứng yên để chụp.
- Later: màu chọn tại chỗ trong JSX theo điều kiện; biến thể `Badge` của nhãn trạng thái.

## Out of scope

- Bản mẫu dưới `/proto` — vật thiết kế, không lên màn thật.
- Màu chọn tại chỗ trong JSX theo một điều kiện, ngoài 13 tệp khu (`dong-buoc.tsx`, `hop-tuan.tsx`, `cham-diem.tsx`…)
  — theo Hỏi-4.
- Biến thể `Badge` của nhãn trạng thái (`BIEN_THE_TRANG_THAI` ở `tien-do-kr.tsx`) — theo Hỏi-4.

## Đường đo

- bỏ đường-đo — ô cơ hội không khai ngưỡng (hàng dựng); xem sổ quyết định.

## Notes

- Nhánh `feat/mau-trang-thai-chung`, cắt từ onehub f46c0bbda.
- Known limits — chọn ở Cổng Bằng chứng 2026-10-16:
  - Ngoài-2: Màu trạng thái viết tay đi qua một thành phần bọc trung gian vẫn lọt bài quét, nên một khu có thể lệch màu mà kiểm tra vẫn xanh.
  - Ngoài-4: Tài liệu thiết kế hứa bài quét bắt mọi bảng màu riêng, nhưng luật thường chỉ đọc những tệp có dùng chấm trạng thái.
  - Ngoài-5: Mục mang sang từ round 1 về khu làm giàu dữ liệu không được quét; đã sửa ở S4-r1, ghi lại để giữ vết.
  - Ngoài-6: Ở bảy khu, bài kiểm xác nhận bảng nghĩa khai đúng chứ không xác nhận chấm vẽ ra đúng màu.
  - Ngoài-7: Bài kiểm không tự khoá đúng sáu nghĩa và màu xám của nghĩa đã kết thúc; đổi cả bảng lẫn tài liệu cùng lúc thì không ai bị báo.
  - Ngoài-9: Luật thường của bài quét có thể báo đỏ nhầm một nhãn hay thuộc tính trạng thái không phải màu.
  - Ngoài-10: Trùng Ngoài-6 — bài kiểm so bảng khai chứ không nhìn màu thật sự hiện ra.
  - Ngoài-11: Trùng Ngoài-7 — đổi màu nghĩa đã kết thúc hay thêm bớt một nghĩa cùng tài liệu thì bài kiểm vẫn xanh.
