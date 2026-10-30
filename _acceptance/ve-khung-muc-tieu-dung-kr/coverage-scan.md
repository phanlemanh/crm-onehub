# Quét độ phủ — ve-khung-muc-tieu-dung-kr (HT6)

Preset `test-matrix`. Bài toán: sau ‹ › theo thứ tự bảng Họp tuần, tầng ngay dưới KR trong ngăn xếp bản ghi phải là mục
tiêu của KR đang xem, để mọi lối về mở đúng mục tiêu.

## Ngữ cảnh

- Sản phẩm: OneHub CRM, khu Mục tiêu — chân sản phẩm: đào repo (`apps/app/components/crm/record-sheet/record-stack.ts`,
  `kr-sheet.tsx`, `thu-tu-hop-tuan.ts`, hợp đồng HT2 `_acceptance/hop-tuan-tren-bang/contract.md`) · chân ngành: Tability
  (đi check-in qua mọi KR của plan, về plan từ KR — ảnh chụp 22/10 ở `docs/findings/2026-10-22-hop-tuan/README.md`).

## Trục

- Trục A — hướng đi: › | ‹ | nhiều bước liên tiếp [thước CE: hai nút `kr-ke`, `kr-truoc` của `DauNganHanhDong`
  — SUY-TỪ-REPO: `apps/app/components/crm/record-sheet/kr-sheet.tsx`]
- Trục B — mục tiêu của KR đích so với KR đang xem: khác | cùng [thước CE: thứ tự bảng trộn KR nhiều mục tiêu —
  SUY-TỪ-REPO: `apps/app/components/crm/record-sheet/thu-tu-hop-tuan.ts`]
- Trục C — tầng dưới trước khi đi: mục tiêu của KR đang xem | mục tiêu khác (chép tay) | thứ khác không phải mục tiêu | không có [thước CE: `lotDuoi` lót mục tiêu,
  đường dẫn chép tay giữ nguyên — SUY-TỪ-REPO: `record-stack.ts`]
- Trục D — nguồn thứ tự: bảng Họp tuần | trong một mục tiêu [thước CE: `useThuTuHopTuan` trả bảng hay `null` —
  SUY-TỪ-REPO: `thu-tu-hop-tuan.ts`; sổ HT2 `d-20261027T131457Z-5`]
- Cắt ngang — lối về: nút quay lại đầu ngăn | liên kết tên mục tiêu ở phụ đề | nút «Về khung mục tiêu» khi KR không tải
  được [thước CE: ba lối gọi `close`/`LienKetMucTieu` trong `kr-sheet.tsx`]

## Không gian

3 × 2 × 4 × 2 = 48 ô; gạch: (B=khác, D=trong một mục tiêu) — vô nghĩa (trong một mục tiêu thì KR đích luôn cùng mục
tiêu); (C=không có) — vô nghĩa sau khi ngăn mở (`lotDuoi` lót ngay khi KR nằm một mình). Còn 24 ô có nghĩa.

## Core (6 ô → 6 tiêu chí, 25% — giữ vì mỗi ô là một nhánh mã riêng)

1. › · khác · mục tiêu của KR · bảng → AC-1 — lỗi chính.
2. ‹ và nhiều bước · khác · mục tiêu của KR · bảng → AC-2 — tầng dưới đi theo cả hai chiều, nhiều lần.
3. lối về liên kết tên mục tiêu, và nút «Về khung mục tiêu» khi KR đích không tải được → AC-3 — hai lối về còn lại.
4. › · cùng · mục tiêu của KR · bảng → AC-4 — đối chứng: không đổi khi không cần.
5. › · khác/cùng · mục tiêu khác (chép tay) · bảng; và › · cùng · mục tiêu của KR · trong một mục tiêu → AC-5 — luật theo KR đích, và ngoài bảng không đổi.
6. Không hồi quy các bài sẵn có → AC-6.

## Later

- Tầng dưới là thứ khác không phải mục tiêu (kế hoạch, deal) khi đi theo bảng: Họp tuần không mở ngăn như vậy; cùng luật,
  cùng nhánh mã với AC-5, không ca riêng.

## Never

- Nhiều tầng mục tiêu dưới KR (cha → con → KR): bảng Họp tuần không mở ngăn như vậy; chỉ tầng ngay dưới đi theo.
- Số lần ghi đường dẫn / nút Back của trình duyệt: ‹ › thay mục lịch sử từ HT2, vòng này không đổi; đo cần sửa khung thử
  dùng chung ngoài vùng của dãy.

## Cross-cutting áp mọi ô Core

- `thuTuKr` giữ nguyên sau mỗi lần ‹ › (đếm «n/tổng · theo thứ tự bảng» không gãy).
