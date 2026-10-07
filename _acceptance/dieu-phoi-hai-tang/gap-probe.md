---
slug: dieu-phoi-hai-tang
at: 2026-10-06T22:31:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

# Gap-probe — dieu-phoi-hai-tang

Phản biện context sạch, một lượt, đọc đúng năm tệp: design doc, contract, evals, decisions, claims.

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | AC-9 hứa ở mức nhịp rằng nhánh của chính phiên xin không tính là vướng, trong khi bộ phát lịch truyền `nhanhCua: () => null` (Out of scope, d-8) — AC và Out of scope mâu thuẫn | Owner tin phiên P1 chạm tệp mà nhánh P1 đang sửa sẽ được máy duyệt; E13/E32 xanh vì chỉ chạy hàm thuần; trong đợt thật yêu cầu thành `can_phan` gọi tên nhánh của chính người xin | Tách AC-9 thành (a) hàm định tuyến và (b) nhịp thật lệch an toàn; một ca đo vế (b) ở nhịp thật, chiều đỏ là đột biến `nhanhCua` trả nhánh thật | fixed: AC-9 tách (a)/(b); thêm E36 (dph_nhip_that, ca `nhanh-cua-minh`, đột biến M14) |
| P1 | evals | Chiều đỏ của các eval phat-lich trỏ đột biến chỉ chạy tệp test khác; luật «đỏ ở ca khác ca ghim → exit 1» mâu thuẫn với M2 làm đỏ hai ca [man-okr-truoc-r1#F1] | M2 làm đỏ cả hai ca lich nên E25/E26 thoát 1 trên mã đúng; hoặc sáu eval phat-lich ký với dòng «Chiều đỏ» không lượt nào chạy | Luật «ca ghim ∈ tập đỏ», in mọi ca đỏ; ghim theo cặp (đột biến, tệp, ca); thêm đột biến nhắm phat-lich.test.mjs | fixed: luật đổi thành «ca ghim ∈ tập đỏ»; thêm M1b, M2b, M4b, M8b, M10b nhắm đúng ca phat-lich; E16 khai thẳng phần suy trạng thái đo ở E37 |
| P1 | contract | Vế suy trạng thái hàng từ `status` của `contract.md` (AC-10) không có thước tích hợp | Hàm suy đọc sai nhánh hay luôn trả «chưa»: E15 xanh vì hàm thuần, E16 xanh vì `a` vốn là hàng đầu; trong đợt thợ được giao lại hàng đã gộp | Ca nhịp thật: a đã gộp trên nhánh chính, b đang làm ở worktree, c chờ phụ thuộc A; kỳ vọng tiep/P1 = b, tiep/P2 = c; chiều đỏ M13 | fixed: AC-10 thêm vế «không bao giờ giao lại hàng đã gộp»; thêm E37 (dph_nhip_that, ca `tiep-theo-trang-thai`, đột biến M13) |
| P1 | evals | E22 (judgment) đo chỉ dẫn, không đo đầu ra: lệnh Monitor là đường đánh thức duy nhất mà không ai chạy thật; design mục 4 còn viết «…» thay đường dẫn | README ghi sai đường dẫn hay sai khuôn sự kiện, judge vẫn PASS; mở đợt thật Monitor không nhả dòng nào, owner lại làm nhịp tim | Trích nguyên văn lệnh Monitor từ README, chạy trên đợt sống, gieo đơn hỏng, đòi ≥ 1 dòng trong 15″; chiều đỏ đổi tên tệp → `DO: monitor-cam` | fixed: AC-14 thêm vế máy; thêm E39 (dph_thu_kho); design mục 4 ghi đủ lệnh `tail -n0 -F <thư mục đợt>/su-kien.jsonl …` |
| P2 | contract | `permission_prompt` có trong matcher Notification (AC-7) nhưng không AC nào nói nó vào hộp quyết định | Thợ kẹt ở hộp xin quyền mà bảng không báo; E12 vẫn xanh vì «loại khác bỏ qua» | Thêm vế tường minh cho `permission_prompt` vào AC-8, ghim một ca, chiều đỏ là đột biến | fixed: AC-8 nêu cả `idle_prompt` và `permission_prompt`; thêm E38 (dph_nhip_that, ca `permission-prompt`, đột biến M15) |

## Ghi chú ngoài bảng của người phản biện

- E17 thiếu đối chứng dương cho `href` `claude://` — rejected: ca đầu của bang.test.mjs đã khẳng định `href="claude://claude.ai/epitaxy/local_x"`; E17 nay nêu rõ.
- E10 không đo đầu vào không phải JSON và «không có stderr» — rejected: ca «chiều im» đã gọi `chayHook('khong-phai-json')` → 0, và `chayHook` không trả `loi` ở chiều im; E11 đo stderr rỗng ở hook thật.
- E23 chỉ quét `.mjs` và `.json` trong khi AC-15 nói cả cây — fixed: AC-15 viết lại thành «mọi tệp `.mjs` và `.json` … ngoài `test/`».
- Bộ đo rang không nói gốc kho suy từ vị trí script — fixed: expected của E11, E21, E23, E25–E39 nói rõ.
