---
schema_version: 1
slug: agent-builder-noi-tieng-viet
verdict: PENDING-JUDGMENT
verified_commit: 846d88e00097ae7db0f12826f6d40f9a0eab8ce0
run_id: r-20260906T035904Z
verified_at: 2026-09-06T03:59:41Z
rounds: 1
failed_evals: []
uncertain_evals: [E18]
human_signoff: ""
---

# Bằng chứng — agent-builder-noi-tieng-viet

Vòng chấm chạy **tuần tự từng lệnh** (điều khoản CLASSIFIER-FALLBACK, sau hai lần
fan-out bị hỏng ở các vòng trước). Mọi con số dưới đây đọc từ đầu ra thật của
lệnh, không thuật lại.

## Kết quả

| Eval | Tiêu chí | Lệnh | Mã thoát |
|---|---|---|---|
| E1 | AC-1 | `ab_hai_tieng` | 0 |
| E2 | AC-1b | `ab_chu_cung_jsx` | 0 |
| E3 | AC-2 | `ab_toast` | 0 |
| E4 | AC-3 | `ab_tieu_de` | 0 |
| E5 | AC-4 | `ab_thuoc_tinh` | 0 |
| E6 | AC-5 | `ab_trang_thai` | 0 |
| E7 | AC-6 | `ab_khong_dich` | 0 |
| E8 | AC-6b | `ab_du_lieu_nguoi_nhap` | 0 |
| E9 | AC-7 | `ab_dot_bien` | 0 |
| E10 | AC-8 | `ab_khai_sinh` | 0 |
| E11 | AC-8 | `ab_dan_so_tu_dia` | 0 |
| E12 | AC-9 | `ab_be_rong` | 0 |
| E13 | AC-9 | `ab_be_rong_do` | **2 — chưa đo được** |
| E14 | AC-10 | `ab_moi_chuoi` | 0 |
| E15 | AC-11 | `ab_mot_bo_thuoc` | 0 |
| E16 | AC-12 | `rang3_khoa_chet` | 0 |
| E17 | AC-12 | `ab_tu_dien` | 0 |
| E18 | AC-13 | phán xét của người | **chờ người** |

Bốn lệnh chứng của kho, tất cả mã 0: `bun run db:test && bun run test` ·
`bun run check-types` · `bun run lint` (về đúng ba cảnh báo có sẵn) ·
`bun run lint:slop`.

## Verdict: PENDING-JUDGMENT

Không eval nào ĐỎ. Hai ô không phải màu xanh, và cả hai đều cần người:

- **E13 thoát mã 2 — thiếu tiền đề, không phải đạt.** Chân đo bề rộng đếm các hộp
  chặt cứng trên hai màn dựng được: 4 hộp, **0 hộp mang chữ của lát này**. Không
  có tiền đề thì không cắm vết, và kết quả rỗng KHÔNG được đọc là "bản dịch vừa".
- **E18 là phán xét.** Bản dịch có đọc như tiếng Việt của người làm nghề không —
  chỉ người trả lời được.

## Số đo

- **237 → 0** chuỗi tiếng Anh trên 20 file quét; ba con số file (26 trên đĩa · 20
  quét · 6 hoãn) khớp nhau ở ba nguồn độc lập.
- **22 cặp** đối chiếu hai lượt tiếng trên 2/4 route; 2 route còn lại nằm dưới
  giới hạn đã khai và đã được chứng là **thật sự** không dựng được.
- **Bộ đột biến 7/7**: mỗi hình dạng một vết, mỗi vết bị đúng chân chuyên trách
  bắt, cây trả nguyên trạng. Vết mới của vòng này — gỡ chữ trạng thái khỏi màn —
  **chỉ** chân trạng thái bắt được, chứng rằng nó đo MÀN chứ không đo KHO CHUỖI.
- **9 ô trạng thái**: 2 đo được trên màn thật, 7 gọi tên kèm lý do.
- **3 ô dữ liệu người nhập** đều mang `translate="no"`, đọc ở mức cây cú pháp.
- **8 vị trí** đối chiếu giá trị không-được-dịch giữa hai lượt tiếng.

## Bốn phép đo giả bị bắt trong chính vòng này

Đáng ghi hơn mọi màu xanh:

1. **AC-5 không có chân nào.** Ổ cắm trỏ vào một chân chưa ai viết.
2. **Chân dữ liệu người nhập chỉ đọc bảng của chính nó** rồi báo lại — không kiểm
   một dòng mã nào.
3. **Chân không-dịch so chuỗi với chính nó**, nên nhánh đỏ là mã chết.
4. **E11 chưa từng được chạy**, và nó đỏ vì cãi nhau với AC-8.

Cả bốn đã vá, và mỗi phép đo mới đều có cặp hai chiều đã chạy thật.

## Giới hạn mang sang cổng ký

Bốn giới hạn ở `## Notes → Known limits` của hợp đồng, cộng ba phát hiện ngoài
hợp đồng ở `review-findings.md` — trong đó có một cái đụng **ba** hồ sơ: gốc gom
chữ của bộ thước màn không chứa thanh bên.
