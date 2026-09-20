# Retro — hạng mục «khai đúng tiếng», 19–20/09/2026

Viết để cải thiện **kho** và **acceptance-gate kit**. Mọi con số dưới đây đo từ
git và từ `run-log.jsonl`, không ước lượng.

## 1. Hạng mục thật ra là gì

Đánh dấu các đoạn chữ tiếng Anh trên màn hồ sơ bằng `lang="en"`, để trình đọc màn
hình và trình dịch không đọc sai. Sản phẩm cuối cùng:

```
+81 / −25 dòng, 13 tệp
```

Tệp lớn nhất là `packages/ui/src/components/foreign-text.tsx` (+18). Còn lại là
các chỗ gọi: `record-parts.tsx`, `timeline-entry.tsx`, `contact-sheet.tsx`,
`company-sheet.tsx`, `deal-stage.tsx`…

## 2. Đã trải qua gì

| | |
|---|---|
| Khoảng thời gian | 19/09 00:14 → 20/09 20:10 — **44 giờ liên tục** |
| Commit trên nhánh | **96** (72 ngày 19, 24 ngày 20) |
| Hồ sơ dính líu | 3 (`nhan-ung-dung-noi-tieng-viet` → `ho-so-khai-dung-tieng` → `thuoc-khai-dung-tieng`) |
| Vòng chấm S4 | **12 lượt** (ho-so 3 · thuoc 9) |
| Verdict | ho-so: REJECT · REJECT · REJECT · thuoc: BLOCKED ×3, REJECT ×3, BLOCKED, PENDING-JUDGMENT, PASS |
| Kết cục | **chưa xong** — `ho-so-khai-dung-tieng` vẫn REJECT, PR #65 không merge được |

Đường đi: hồ sơ đầu (`nhan-ung-dung`) bỏ dở ở BLOCKED. Hồ sơ hai
(`ho-so-khai-dung-tieng`) REJECT vì **bộ đo của nó hỏng**, không phải vì sản phẩm
sai. Sửa bộ đo chạm trần → mở hồ sơ ba (`thuoc-khai-dung-tieng`) có chủ ngữ là
chính bộ đo ấy. Hồ sơ ba ký PASS. Chấm lại hồ sơ hai → **REJECT tiếp**, và bản vá
làm hồ sơ ba xanh lại **vi phạm AC-11 của hồ sơ hai**.

## 3. Tiêu tốn bao nhiêu

### Dòng mã, theo vùng

| vùng | thêm/bớt | tệp | tỉ lệ so sản phẩm |
|---|---|---|---|
| **Sản phẩm** | +81 / −25 | 13 | 1× |
| **Bộ đo** (rang/, test/, gate-shape) | +4 622 / −189 | 34 | **57×** |
| **Hồ sơ giấy tờ** (contract, evals, evidence, sổ) | +2 490 / −1 | 14 | 31× |
| **Tài liệu** | +2 208 | 5 | 27× |
| **Tổng không-phải-sản-phẩm** | **+9 320** | 53 | **115×** |

### Máy

Chỉ đo được hai lượt của phiên cuối; các lượt trước **không có
`usage-report.md`** (hồ sơ `ho-so-khai-dung-tieng` không có tệp này lần nào).

| lượt | agent | token phụ | công cụ | thời gian |
|---|---|---|---|---|
| thuoc — vòng 1 (song song) | 32 | 3 166 264 | 232 | 28 phút → **BLOCKED vì hạ tầng** |
| thuoc — lượt tuần tự | — | — | 21 lệnh | **2 giờ 19 phút** |
| ho-so — vòng 4 | 26 | 3 472 179 | 600 | 44 phút → REJECT |

**Đã đo được ≥ 6,6 triệu token phụ và ≥ 58 agent cho ba lượt.** Chín lượt còn lại
không có số — đó là một phát hiện riêng (xem §4.3).

### Người

5 lần trần thước nổ, 5 lần được miễn. 41 dòng sổ quyết định. 2 chữ ký. Ít nhất 8
điểm dừng hỏi người trong riêng phiên cuối.

## 4. Rơi vào điều gì

### 4.1 — Bộ đo nuốt hạng mục (57 : 1)

Không ai quyết điều này. Nó là kết quả cộng dồn của một luật đúng — *"phép đo chưa
từng đỏ thì không chứng minh gì"* — áp lên một sản phẩm 81 dòng. Mỗi phép đo cần
một cặp hai chiều; mỗi cặp cần một bản sao cây, một máy chủ, một vật thử; mỗi thứ
ấy lại cần phép đo của nó. **Không có bậc nào trong chuỗi đó được khai là đủ.**

### 4.2 — Một cổng luôn được miễn không còn là cổng

`TRAN_NHAT = 3`. Trong hạng mục này nó nổ **5 lần** và được miễn **5 lần**
(`thuoc-` 4 lần, `ho-so-` 1 lần). Lần cuối bộ đếm ghi **44 nhát** — và 44 nhát ấy
chính là sản phẩm của một vòng đã qua Cổng 1, Cổng 2 và chữ ký.

Vị từ của trần — *"commit chạm thước mà không chạm vật"* — là proxy sai cho
*"đang trôi"*. Với một vòng sửa thước **đã được duyệt**, proxy ấy luôn báo động.

### 4.3 — Sổ vòng chỉ ghi khi thắng

12 lượt chấm, nhưng `run-log.jsonl` chỉ có **6 dòng `round-tally`** (ho-so 3,
thuoc 3). Bộ đếm vòng của `s4-args` đọc `## Iterations` trong `evidence-report.md`
— tệp chỉ sinh ra khi một vòng **thành công**. Nên 6 lượt BLOCKED/REJECT của
`thuoc-` đi dưới nhãn `round: 1`, carry-forward chưa lần nào chạy, và lịch sử máy
tự thấy về chính nó là **không đầy đủ**.

Hệ quả thật: câu *"không phát hiện nào tái phát qua các vòng"* là **tôi đếm**, máy
không đếm được.

### 4.4 — Hợp đồng ghim cơ chế thay vì ghim tính chất

AC-11 của `ho-so-khai-dung-tieng` viết: *"chân đo **NGUYÊN TRẠNG** … vẫn xanh"* —
ghim **byte của một tệp** làm tiêu chí nghiệm thu. Điều nó muốn bảo vệ là *"phép
đo cũ vẫn cho cùng kết luận"*.

Vì viết theo cơ chế, **cải thiện thước = vi phạm hợp đồng**. Bản vá một chữ
(`networkidle0` → `load`) làm E1/E10 của vòng đã ký xanh thật, đồng thời phá AC-11
của vòng bên cạnh. Hai lời hứa cãi nhau, **không lời nào sai**.

### 4.5 — Người chấm ở trong hệ nó chấm, và có quyền ghi

Vòng 4: agent chấm `ui-check` của E9 tự viết `_e9-verify-capture.mjs` vào `rang/`.
E10 — chạy song song, khẳng định *"cây không đổi"* — thấy tệp lạ và báo **"phép
phá rò rỉ ra khỏi bản sao"**. Thông điệp sai hoàn toàn về nguyên nhân.

Cùng lớp với `[cay-bi-cham]` của E3 ở vòng trước, khác ở chỗ thủ phạm lần này là
**người chấm** chứ không phải chân đo. Kit có luật tạo phẩm phải ra
`.acceptance-runs/`; luật ấy **không được cưỡng chế lên agent**.

### 4.6 — Mọi lối thoát nằm trong hệ thống

Khi trần nổ cho `ho-so-khai-dung-tieng`, `s4-args` in ba lối, và lối 3 là *"mở
vòng có chủ ngữ là thước"* — **chính là vòng vừa đóng**. Máy chỉ đường quay lại
đúng cái vòng nó đang cố thoát.

## 5. Cái gì đã đi ĐÚNG — đừng bỏ

Retro này không kết luận «bỏ cổng». Những thứ sau đã trả công rõ ràng:

- **Mọi phát hiện đều thật.** 67 phát hiện qua 12 lượt, không cái nào là báo động
  giả mà tôi biết. 8 trong số đó nằm trong hợp đồng và đều là lỗi đo thật.
- **Đột biến bắt được vật.** 0/24 lọt ở `thuoc-`, 20/21 ở `ho-so-`. Cái duy nhất
  lọt (E9) là một khuyết tật thật, bị chính bộ khai sinh chỉ mặt.
- **Chốt cuối giữ.** `recheck-evidence` chặn đúng một nỗ lực ký PASS trên hai ô
  đỏ (`L1 CONSISTENCY`). Không lời khai Known limits nào mở được nó. Đó là lúc hệ
  thống làm đúng nhất việc của nó.
- **Người chấm tươi bắt người viết.** Phiên chấm độc lập đối chiếu mục Known
  limits **vừa viết xong** với bản ghi và bắt **ba câu sai**. Nguyên tắc
  doer ≠ grader trả công ngay trong cùng phiên.
- **Trần thước đã làm đúng việc một lần.** Nó buộc mở vòng `thuoc-`, và vòng ấy
  tìm ra hàng loạt khuyết tật thật. Vấn đề không phải nó tồn tại, mà là nó không
  biết phân biệt «vá được duyệt» với «trôi».

## 6. Đề xuất — cho KIT

| # | việc | vì sao | giá |
|---|---|---|---|
| K1 | **Tách `instrument_sha` khỏi `verified_commit`** | sửa thước thôi làm hoá cũ bằng chứng của vật; trần đếm đúng thứ nó định đếm | vừa |
| K2 | **Đếm vòng từ `run-log.jsonl`, không từ `evidence-report.md`** | §4.3 — sổ chỉ ghi khi thắng là sổ ghi mỗi ngày đẹp trời | nhỏ |
| K3 | **Lint Cổng 1 chặn AC ghim tệp/byte** | §4.4 — AC-11 lẽ ra bị chặn lúc duyệt, không phải lúc chấm lần bốn | nhỏ |
| K4 | **Cưỡng chế người chấm CHỈ ĐỌC trên cây được đo** | §4.5 — ghi ngoài `.acceptance-runs/` là **lỗi làn**, không phải phát hiện về vật | vừa |
| K5 | **Đổi vị từ của trần** | đếm commit-chạm-thước là proxy sai; đếm *vòng chưa duyệt*, hoặc miễn trừ commit thuộc một vòng đã ký | vừa |
| K6 | **Cho ô đo khai `tuan_tu`** | hàng đợi tuần tự hiện chỉ nhận lệnh suite; E12b mất 3 583 giây, gấp 6 lần trần 600s (chip đã mở) | vừa |
| K7 | **Pin nói ra ô nó không đo** | eval `ui-check` vắng khỏi làn ghim lại, im lặng qua 6 hồ sơ (chip đã mở, đã xong ở kho kit) | — |
| K8 | **Khai ca dừng của đệ quy ở đúng bậc** | §4.1 — nói tên bậc nào là *tiên đề*, và coi đó là giới hạn có tên chứ không phải vi phạm trần | thiết kế |

**K8 quan trọng hơn bảy mục kia cộng lại.** Không có ca dừng thì mọi cải thiện
khác chỉ làm vòng lặp chạy mượt hơn, không làm nó dừng.

## 7. Đề xuất — cho KHO

| # | việc | vì sao |
|---|---|---|
| R1 | **Đặt ngân sách thước theo cỡ vật, khai ở Cổng Đáng** | 57:1 không ai quyết — nó cộng dồn. Một dòng «vật ~80 dòng, trần thước ~400 dòng» ở Cổng Đáng sẽ buộc dừng sớm hơn nhiều |
| R2 | **Hợp đồng nói tính chất, cấm nói tên tệp** | quy ước viết AC, đi kèm K3 |
| R3 | **Công thức dựng bàn đo vào `docs/setup.md`** | 5 bước, thiếu bước nào cũng vấp; hôm nay mất ~2 giờ tìm lại (đã ghi vào sổ ghi chú cá nhân, nên đưa vào kho) |
| R4 | **Vá bẫy `Invalid origin` ở `.claude/launch.json` trên `onehub`** | mục `api-cay-nay` không khai `APP_URL`; một phiên đã mất một ván vì nó; bản vá hiện chỉ sống trong worktree này |
| R5 | **Quyết dứt điểm `nhan-ung-dung-noi-tieng-viet`** | `status: approved` + `verdict: BLOCKED` + chữ ký rỗng = «tàng hình với cổng», và nó chặn PR của nhánh này |
| R6 | **Đừng để một nhánh gánh ba hồ sơ** | 96 commit, 3 hồ sơ, 2 trong số đó chưa xong → PR không merge được vì lý do không liên quan đến nhau |

## 8. Cái chưa đo được

Trung thực về giới hạn của chính retro này:

- **Chi phí 9 lượt chấm đầu** — `ho-so-khai-dung-tieng` không có `usage-report.md`
  lần nào; `thuoc-` chỉ có từ lượt cuối. Con số 6,6 triệu token là **sàn**, không
  phải tổng.
- **Giờ người** — không có bản ghi. Kit cố ý không đo phút người.
- **Bao nhiêu phát hiện sẽ tái phát** — 6/12 lượt không để lại dòng `round-tally`,
  nên máy không tự đối chiếu được (§4.3).
- **Liệu `ho-so-` có xanh sau khi vá E9 không** — chưa chạy.
