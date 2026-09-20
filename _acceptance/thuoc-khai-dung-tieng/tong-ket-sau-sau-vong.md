# Tổng kết vòng `thuoc-khai-dung-tieng`

Vòng có **chủ ngữ là thước**: sản phẩm của nó là bộ đo của `ho-so-khai-dung-tieng`.
Đóng ngày 2026-09-20 với `verdict: PASS`, chữ ký `Phan Le Manh 2026-09-20`,
PR [#65](https://github.com/phanlemanh/crm-onehub/pull/65).

## Đường đi của các lượt chấm

| lượt | cách chạy | verdict | trong hợp đồng |
|---|---|---|---|
| 1–6 | (trước phiên này) | BLOCKED ×3 · REJECT ×3 | 7 → 4 → 4 → 0 → 4 → 2 |
| 7 | làn song song | **BLOCKED** | 1 |
| 8 | **tuần tự**, 2h19m | PENDING-JUDGMENT | 0 |
| 9 | sau khi vá `networkidle0` | **PASS** | 0 |

Máy chưa bao giờ đánh số các vòng này: bộ đếm đọc `## Iterations` trong
`evidence-report.md`, mà tệp đó chỉ sinh ra khi một vòng thành công. Sáu lượt đầu
đều đi dưới nhãn `round: 1`, và carry-forward chưa lần nào chạy.

## Ba điều vòng này học được, xếp theo giá trị

**1. Đỏ của làn chấm không phải lúc nào cũng là đỏ của vật.** Lượt 7 BLOCKED vì
hạ tầng: E3 đỏ do chân đo *khác* ghi vào cây giữa lúc nó so `git status` trước/sau;
E10 và E12a đỏ do tranh tài nguyên; một lệnh bị công cụ giết ở 600 giây khi còn
đang dựng 27 CSDL thử. Cả ba xanh khi chạy riêng cùng ngày. Kit **biết** lớp bệnh
này — chú thích ở `acceptance-verify.js:459` tả đúng nó — nhưng hàng đợi tuần tự
chỉ nhận **lệnh suite** (dòng 465), nên hồ sơ có *ô đo* nặng không khai được.
Số đo cho chip kit: E12a mất **1625 giây**, E12b **3583 giây** — gấp 3 đến 6 lần
trần 600 giây, tức không lọt làn dù chạy kiểu gì.

**2. Đổi môi trường là một phép đo.** Dời bàn đo khỏi `localhost:3000` (máy chủ ấm
của chủ kho) sang cổng riêng làm lộ **bốn** khuyết tật mà sáu lượt chấm đối kháng
không thấy: cookie đóng cứng `domain: "localhost"` trong khi `APP_URL` cấu hình
được · chờ bằng `networkidle0` trên máy chủ dev có HMR (đo được 0/2/0 ba lượt) ·
ngủ 1500ms và 2500ms cố định thay vì chờ điều kiện · và một thông điệp hỏng
**khẳng định điều nó không biết** («màn danh sách vẫn về»), che nguyên nhân thật
(`/onboarding/research`) suốt sáu vòng. Thêm đúng một dòng in URL cuối là ra ngay.

**3. Một chữ đổi được hai ô đỏ.** E1 và E10 đỏ vì chạy lại thước của
`nhan-ung-dung-noi-tieng-viet`, hồ sơ chủ kho cấm mở lại. Lối không-chạm (dựng bàn
đo bằng bản sản phẩm) đã thử và **hỏng**: `next start` chụp ảnh `apps/app/public`
lúc build, nên `canh-cay.mjs` — của một hồ sơ đã ký **thứ hai** — luôn thoát 2.
Chủ kho gỡ chính ràng buộc của mình sau khi máy kiểm được hồ sơ kia mang
`status: approved` + `verdict: BLOCKED` + `human_signoff` RỖNG, tức chưa bao giờ
hoàn tất. Bản vá: `networkidle0` → `load`, đúng một chữ; chỗ chờ `waitForSelector`
ngay sau đó vốn đã có. `hoi-quy-nam-cho` từ 60 giây (hoặc treo 120 giây) xuống
**4–6 giây, 3/3 lượt**; E1 mã 0 sau 780 giây; E10 **9/9** chân con.

## Bốn chốt của kit đã bắn đúng trong phiên này

- `ghim()` của chính bộ khai sinh bắt số ô đo máy lệch (16 khai / 17 thật).
- `recheck-evidence` chặn `PASS` khi báo cáo còn ô đỏ (`L1 CONSISTENCY`) — chặn
  đúng một nỗ lực ký PASS trên hai ô đỏ có Known limits.
- `pre-merge` từ chối merge khi verdict khác `PASS`.
- `repin-lane --skip-unchanged` bỏ qua đúng ca nó sinh ra để bỏ qua.

Không chốt nào mở được bằng chữ: `bypass_ack` chỉ miễn luật `bypass_used`.

## Phiên chấm tươi bắt ba câu sai của chính máy

Người chấm là một phiên tươi (người viết mã không tự chấm). Nó đối chiếu mục
Known limits *vừa viết* với bản ghi và bắt ba chỗ mô tả sai — đã sửa cả ba:
«AC-1 và AC-9 không có lượt đo máy đáng tin» (nói quá với AC-9: vế (b) xanh trọn) ·
«chập chờn» cho cả hai ô (E10 đỏ **2/2** lượt, cố định) · «năm trong sáu là giới hạn
chi phí» (thật ra **bốn**; D là **thiếu vật thử**, chỗ rẻ nhất để thu hẹp).
Nó cũng bắt 21 `run_id` không dòng sổ nào chống lưng, và bốn ô đọc hợp đồng phải
chạy lại sau khi sửa Known limits.

## Còn mở

- **PR #65 chưa merge được**, hai vi phạm **có sẵn trên nhánh**:
  `ho-so-khai-dung-tieng` verdict REJECT (chờ vòng chấm lại của chính nó) và
  `nhan-ung-dung-noi-tieng-viet` `status: approved` + evidence BLOCKED (tàng hình
  với cổng). Cả hai là quyết định của chủ kho, không phải việc của vòng này.
- **Hai mục `UNCERTAIN`** không chặn merge: E4 (vế (c) không có dấu vết trong đầu
  ra) và E15 (hai chốt `expected` đòi không được gọi tên).
- **Chiều đỏ của bản vá nhánh glob chưa chạy** — đòi ba lượt × 10 phút, đã dừng
  giữa chừng và gỡ đột biến. Khai tên trong Known limits.
- **Mười một mục ngoài hợp đồng** đã định đoạt: một → Known limits, mười → hợp đồng
  mới. Hai mục `high` đáng ưu tiên.
- **Hai chip sang kho kit**: hàng đợi tuần tự cho ô đo nặng · pin phải nói ra ô nó
  không đo.
- **Bẫy `Invalid origin`** trong `.claude/launch.json` còn nguyên trên `onehub`
  (mục `api-cay-nay` không khai `APP_URL`); bản vá chỉ sống trong worktree này.
