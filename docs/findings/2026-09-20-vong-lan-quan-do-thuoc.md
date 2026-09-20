# Handoff — 2026-09-20, nhánh `claude/busy-chatterjee-fc04e2`

## Phần I — Chẩn đoán: vì sao lẩn quẩn

Anh hỏi đúng chỗ. Vòng lặp này **không phải vì việc làm dở**. Bằng chứng ngược lại:
0/24 đột biến lọt ở vòng `thuoc-`, 20/21 ở vòng `ho-so-`, hội đồng đề xuất PASS ở
mọi lượt, mọi phát hiện đều là lỗi thật. Bộ đo hoạt động **quá tốt** — đó mới là
vấn đề, theo nghĩa sau.

### Gốc: hệ thống không tách được **vật được đo** khỏi **bộ máy đang đo**

Cả hai sống trong cùng một cây git, dưới cùng một mốc `verified_commit`, chịu cùng
những cổng. Bốn hệ quả, và cả bốn đều đã xảy ra hôm nay:

**1. Sửa thước ⇒ đổi cây ⇒ bằng chứng hoá cũ ⇒ chấm lại ⇒ trần nổ.**
Bộ đếm `thuoc-vat` ghi 44 nhát cho `ho-so-khai-dung-tieng`. 44 nhát ấy **là sản
phẩm của một vòng đã qua Cổng 1, Cổng 2 và chữ ký**. Công việc được duyệt bị
chính bộ đếm coi là trôi.

**2. Người chấm ở trong hệ thống nó chấm, và có quyền ghi.**
Hôm nay: agent chấm `ui-check` của E9 tự viết `_e9-verify-capture.mjs` vào
`rang/`. E10 — một ô đo khác, chạy song song — khẳng định "cây không đổi", thấy
tệp lạ, và báo **"phép phá rò rỉ ra khỏi bản sao"**. Thông điệp nói sai hoàn toàn
về nguyên nhân. Người quan sát làm nhiễu vật, rồi người quan sát khác đo cái nhiễu
ấy như khuyết tật của vật. Đây không phải lỗi của chân đo nào — đây là lỗi phạm trù.

**3. Hợp đồng ghim CƠ CHẾ thay vì ghim TÍNH CHẤT.**
AC-11 viết: *"chân đo NGUYÊN TRẠNG … vẫn xanh"*. Nó ghim **byte của một tệp** làm
tiêu chí nghiệm thu. Điều nó thật sự muốn bảo vệ là *"phép đo cũ vẫn cho cùng kết
luận"*. Vì viết theo cơ chế, nên **cải thiện** thước = **vi phạm** hợp đồng đã
duyệt. Bản vá `networkidle0 → load` làm E1/E10 của vòng đã ký xanh thật, và đồng
thời phá AC-11 của vòng bên cạnh. Hai lời hứa cãi nhau, không lời nào sai.

**4. Mọi lối thoát đều nằm trong hệ thống.**
Bằng chứng sắc nhất của phiên này: khi trần nổ cho `ho-so-khai-dung-tieng`,
`s4-args` in ra ba lối, và lối 3 là *"mở vòng có chủ ngữ là thước"* — **chính là
vòng vừa đóng**. Máy chỉ đường quay lại đúng cái vòng nó đang cố thoát.

### Đệ quy không có ca dừng

Luật nền của kho — *"một phép đo chưa từng đỏ thì không chứng minh gì"* — đúng, và
nó sinh ra đệ quy: đo cái đo. Kho **có** khai ca dừng (AC-11 của `thuoc-`: *"thước
của thước không được miễn luật của thước"*, tự đo bằng `khai-sinh-phu-vong-nay`).
Nhưng ca dừng ấy đặt sâu hơn một bậc so với chỗ cần, và **mỗi vòng lại phát hiện
bậc dưới nó chưa đủ** — nên đệ quy cứ bung xuống thay vì dừng.

Số đo: vòng `thuoc-` chạy 9 lượt chấm, phát hiện trong hợp đồng 7→4→4→0→4→2→1.
Chính tổng kết của nó viết: *"bộ đo đủ lớn thì mỗi lượt soi đối kháng đều còn gì
đó để tìm."* Đó không phải lời than — đó là mô tả một hệ không hội tụ.

### Bốn lối ra, theo thứ tự rẻ

1. **Tách mốc thước khỏi mốc vật.** Bằng chứng ghi `instrument_sha` riêng với
   `verified_commit`. Sửa thước thôi làm hoá cũ bằng chứng của vật; trần đếm được
   đúng thứ nó định đếm.
2. **Hợp đồng cấm ghim tệp.** Tiêu chí phải nói *tính chất* ("phép đo cũ vẫn cho
   cùng kết luận trên cùng vật thử"), không nói *byte*. Một lint ở Cổng 1 bắt được
   mẫu này — AC-11 lẽ ra đã bị chặn lúc duyệt.
3. **Người chấm CHỈ ĐỌC trên cây được đo.** Mọi ghi ngoài `.acceptance-runs/`
   trong một lượt chấm là **lỗi làn**, không phải phát hiện về vật. Kit đã có luật
   nơi-ghi-tạo-phẩm; nó chưa được cưỡng chế lên agent chấm.
4. **Khai ca dừng ở đúng bậc và dừng thật.** Nói tên bậc nào là tiên đề chứ không
   phải điều được chứng, và coi đó là giới hạn có tên — không phải một vi phạm
   trần.

Ba mục đầu là việc của kit (hai chip đã mở, mục 1–3 nên thành chip thứ ba). Mục 4
là quyết định của chủ kho.

---

## Phần II — Trạng thái bàn giao

### Hồ sơ

| hồ sơ | status | verdict | chữ ký |
|---|---|---|---|
| `thuoc-khai-dung-tieng` | **signed-off** | **PASS** | Phan Le Manh 2026-09-20 |
| `ho-so-khai-dung-tieng` | implemented | REJECT | (trống) |
| `nhan-ung-dung-noi-tieng-viet` | approved | BLOCKED | (trống) — bỏ dở 18/09 |
| `nen-chat-ai-elements` | signed-off | PASS | Mạnh 10/09 |

### Git · PR

- HEAD `daef25e5`, **35 tệp chưa commit** (gói bằng chứng vòng chấm 4 vừa ghi:
  `evidence-report.md`, `review-findings.md`, `run-log.jsonl`, và ~20 khung hình /
  bản ghi mạng do agent `ui-check` sinh).
- **PR #65 mở, `mergeable=CONFLICTING`** — xung đột đúng một tệp `PRODUCT-MAP.md`
  (máy vẽ, dễ giải bằng cách hoà `onehub` rồi vẽ lại).
- `pre-merge` toàn kho: **2 vi phạm** — `ho-so-khai-dung-tieng` REJECT, và
  `nhan-ung-dung-noi-tieng-viet` "chưa arm cổng". Luật thứ hai **theo diff**, nên
  nó là việc của nhánh này chứ không chặn `onehub`.
- Cả `thuoc-` lẫn `ho-so-` **chưa từng lên `onehub`**. Merge PR #65 sẽ mang một hồ
  sơ REJECT lên nhánh chính, và luật REJECT quét mọi hồ sơ bất kể diff → **mọi PR
  sau của bất kỳ ai đều đỏ**. Đã đo, không phải suy đoán.

### Việc dở dang, theo thứ tự phụ thuộc

1. **Va chạm AC-11** (chờ anh quyết): tu chính AC-11 + E12 `expected` +
   `thuoc-/evidence-report.md:438` cho khớp cây — hay hoàn nguyên bản vá
   `networkidle0` và chấp nhận E1/E10 của vòng đã ký đỏ lại. Tôi khuyên tu chính.
2. **E9 không bắt được đột biến của nó** — khuyết tật thật, trong hợp đồng
   (`bang-dot-bien.mjs:170`, «bọc ForeignText quanh cả khối Giới thiệu»; chân
   `hskt_tieng_trang` thoát 0 khi đột biến đã áp).
3. **Agent chấm ghi vào cây** — đã chuyển `_e9-verify-capture.mjs` sang
   `.acceptance-runs/ho-so-khai-dung-tieng/`; hai chân kiểm `rang/` xanh lại.
   Nguyên nhân gốc chưa vá (thuộc kit).
4. Sau ba mục trên: chấm lại `ho-so-` → Cổng 2 của nó (10 mục ngoài hợp đồng) →
   gỡ chốt `nhan-ung-dung` → hoà `onehub` → vẽ lại bản đồ → merge.

### Hạ tầng ĐANG MƯỢN — phải trả

- Máy chủ **3300 / 3301** đang chạy (`app-cay-nay` · `api-cay-nay`).
- CSDL **`crm_rang_thuoc_test`** còn sống.
- `.env` của worktree là **tệp thật**, không phải symlink. Đích đã lưu:
  `/Users/manh-macmini/dev/crm/.env`. Trả bằng `rm .env && ln -s <đích> .env`.
- Cổng **3000 / 3001** của chủ kho **chưa hề bị đụng** suốt phiên (pid 59628 /
  59625, cwd `/Users/manh-macmini/dev/crm`).

### Công thức dựng bàn đo (đã ghi vào sổ, chép lại cho tiện)

`db:test` → `db:seed` → **`cd apps/api && bun run dev:session <email>`** (thứ DUY
NHẤT tạo `organization`) → `db:seed` lần hai → ghi khoá vào
`appSetting.contextDevApiKey` → `preview_start` cặp `*-cay-nay`.
Kiểm bốn tiền đề trước khi tin: Origin A/B · `canh-cay` · `lang=vi` · một chân ui.

### Hai chip kit đã mở

- *Cho hồ sơ khai ô đo nào phải chạy tuần tự* (số đo: E12a 1625s, E12b 3583s).
- *Nói ra eval ui-check bị làn ghim lại bỏ qua* — phiên ấy đã xong, S4 PASS,
  nhánh `claude/admiring-keller-2b1192` ở kho kit, chưa PR.
