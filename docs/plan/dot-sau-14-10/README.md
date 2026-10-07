# Đợt sau-14-10 — gói chuẩn bị mở đợt

Soạn 07/10/2026, sau khi gộp `dieu-phoi-hai-tang` (#288). Đây là phần khảo sát chỉ đọc của bước «Mở đợt»
(spec `acceptance-gate-kit` `docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md` §4.11,
giai đoạn 1) làm trước, để phiên giám sát không phải dựng lại từ đầu. Chưa có gì được bật: chưa chạy
`dieu-phoi.mjs mo`, chưa có symlink `dieu-phoi-hien-tai`, hook vẫn im.

Nghi thức chạy: `scripts/dieu-phoi/README.md`. Tệp trong thư mục này là **bản nháp để chép vào thư mục đợt** sau
lệnh `mo`, không phải cấu hình đang chạy.

## 1. Điều kiện trước khi mở

| Việc | Trạng thái 07/10 | Ai |
|---|---|---|
| Gộp `dieu-phoi-hai-tang` (tầng máy 1a) | Xong — #288, 07/10 | — |
| Gộp `dieu-phoi-va-bien` (hook nhận bản chép S4, kiểm hình dạng cấu hình, test vào cổng, giữ nhịp, gia hạn) | Đã ký Cổng 2 07/10; PR chưa mở | Phiên vá biên mở PR, anh gộp |
| Hợp đồng nối tiếp lần hai: tệp `tra-loi` gia hạn hỏng làm đứng cả nhịp; lệnh bọc hỏng khi lệnh gốc có `TZ=…` đứng trước | Anh chọn «mở hợp đồng mới» ở Cổng 2 của `dieu-phoi-va-bien` | Khuyến nghị gộp trước khi mở đợt — lỗi đầu làm bộ phát lịch đứng, đúng thước §6 số 2 |
| Duyệt thẻ đóng đợt `dieu-phoi-1410` (`.acceptance-runs/dieu-phoi-1410/the-dong-dot.md`) | Chờ anh — một chạm «đóng đợt» | Anh |
| Tắt «Auto-archive sessions when their pull request closes» | Đã tắt | — |
| Claude Code trong app desktop ≥ 2.1.288 (lệnh nền không bị giới hạn thời gian) | Đạt — app 2.26454.0 chạy Claude Code 2.1.289 cho mọi phiên (kiểm 07/10, app tự nâng lúc 05:04); CLI 2.1.289 | — |
| Docker và Postgres chạy (`lsof -nP -iTCP:5432 -sTCP:LISTEN`) | 07/10 đầu phiên Docker tắt, cả bốn suite đỏ giả; đã mở lại | Phiên giám sát kiểm mỗi lần thức |
| Chế độ quyền của phiên giám sát (mặc định của máy: auto) | Anh chọn giữ hay đổi | Anh |
| Cổng Đáng F9–F12 (vệ sinh thước) | Chưa ký — ba hàng có `opportunity.md` ở `stage: discovery` | Anh, nếu muốn chúng vào đợt |

## 2. Dãy và hàng

Bốn phiên thợ (spec: tối đa 3–4 phiên local). Mỗi dãy làm tuần tự theo `uu_tien`; `sau` là hàng phải **gộp**
trước. Ranh giới tệp lấy từ ba lượt khảo sát chỉ đọc 07/10, đã bung ngoặc nhọn vì `glob.mjs` không hiểu `{a,b}`.

| Dãy | Hàng theo thứ tự | Vì sao gom như vậy |
|---|---|---|
| **P1 · Kara OKR** | K2 `soan-okr-trang-rieng` → K3 `kara-gop-y-luot-2` → K6a `kara-mot-ten` | K2 và K6a cùng nặng ở `okr-soan.ts`; K6a là câu chữ, làm cuối (chủ kho chốt 04/10: tính năng trước, chữ sau) và chờ K4, K6b gộp |
| **P2 · Kara bản ghi** | K4 `khung-ban-ghi-kara` → K6b `kara-trang-thai-toan-crm` | Cùng `contact-sheet`, `company-sheet`, `contact-plans`, `crm.ts` |
| **P3 · Deal và CRM chung** | E7 `datatable-loc-ro` → E3 `danh-sach-keo-chung` → E1 `deal-va` → E4 `giai-doan-mac-dinh` (T3) → E6 `dieu-phoi-va` → E5 `tac-nhan-va` | E7 trước vì `data-table.tsx` là chỗ chồng lớn nhất với Kara; E4 sửa schema nên đứng một mình giữa dãy |
| **P4 · Sửa nóng** | Lỗi do người dùng thật báo (ưu tiên cao nhất, phiên giám sát thêm hàng khi có); lúc rảnh làm F8 `neo-thuoc-het-han` | F8 là làn veto, chỉ chạm thước của hồ sơ đã ký |

Không vào đợt: K5 `chat-deal-mot-khung` (lộ trình ghi sau 07/12; chồng nặng với K4 và E5), 7n (hạn 14/12, chưa có
hồ sơ cơ hội), F9–F12 (chờ Cổng Đáng; ký xong thì giám sát xếp vào P4, F9 trước).

**Rủi ro khảo sát đã thấy**
- E4 sửa `schema.prisma` và thêm migration — hai thứ nằm trong `bao_ve`. Gỡ `@default` ở cột giai đoạn làm gãy
  khoảng 31 chỗ `deal.create`, gồm test của Kara. Đồng bộ `onehub` ngay trước khi mở E4; tên migration lấy giờ UTC thật.
- E7 sửa `data-table.tsx` mà màn OKR (`loc-okr`, `theo-don-vi`) đang dùng: giữ chữ ký prop cũ, chỉ thêm prop tuỳ chọn.
- E1 và E6 chỉ được **thêm dòng** vào `agent-transcript.ts`, `agent-tasks.ts` (Kara cũng thêm kind ở đó).
- K2 phải gỡ hai mục miễn trừ trong `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` (Ngoài-4 của `bo-xuong-kara`).
- Hai tệp chữ (`okr-toan-canh.ts`, `record-sheet.ts`) thuộc ranh giới cả P1 (K6a) lẫn P2 (K4, K6b); thứ tự được
  giữ bằng `sau` của K6a.

## 3. Ba quyết định cho thẻ khởi tạo

| Quyết định | Khuyến nghị | Vì sao |
|---|---|---|
| **Ưu tiên khi tranh chấp khoá S4** | Hàng sửa nóng mang `moc` là ngày báo lỗi, nên luôn được cấp trước; Kara và Deal không mang mốc, cấp theo giờ xin | Bộ phát lịch xếp đơn theo `moc` rồi giờ xin (luật 13:40 ngày 04/10); `uu_tien` chỉ chọn hàng kế trong một dãy |
| **Làn veto** (máy tự duyệt phạm vi, không chờ Cổng 1) | K6a và F8, như anh chốt 04/10; mọi hàng khác qua Cổng 1 bình thường | Hai hàng không đổi giao diện; E4 là T3 nên không bao giờ vào veto |
| **Quyền tự merge** | Phiên giám sát gộp hàng đã ký Cổng 2 khi đủ bốn điều kiện §4.4 (ký trên đỉnh · check xanh trên đỉnh · CI chạy sau lần gộp gần nhất · `--merge --match-head-commit`), không bao giờ `--auto`; anh giữ quyền chặn bằng một câu | Giai đoạn 1a chưa có hàng merge tự động; đây đúng là cách 04/10, thêm điều kiện 3 |

## 4. Mở đợt — dán vào một phiên mới (phiên này thành phiên giám sát)

```
Mở đợt sau-14-10. Đọc docs/plan/dot-sau-14-10/README.md và scripts/dieu-phoi/README.md trước. Hỏi tôi đúng
một câu về các việc tay ở mục 1 còn thiếu, rồi trình thẻ khởi tạo với ba quyết định mục 3.
```

Sau khi anh duyệt thẻ, phiên giám sát:
1. `node scripts/dieu-phoi/dieu-phoi.mjs mo sau-14-10`.
2. Chép `dieu-phoi.config.json` của thư mục này đè lên bản trong thư mục đợt, **giữ khoá `goc_kho`** lệnh `mo` vừa ghi.
3. Chép `hang-viec.json`; điền `day[].worktree` (đường tuyệt đối đã `realpath`) và `day[].link` khi từng chip được
   bấm — chỗ giữ `/CHUA-CO-WORKTREE/P<n>` hiện tại không trỏ tới thư mục nào.
4. Nối `LUAT-rieng.md` vào `LUAT.md` của đợt.
5. `dieu-phoi.mjs chay`, giăng Monitor, tạo task lịch 30′, nhóm thanh bên, mở bốn chip — đúng `scripts/dieu-phoi/README.md`.

## 5. Tệp trong thư mục này

| Tệp | Nội dung |
|---|---|
| `dieu-phoi.config.json` | `nhanh_chinh: onehub`, ngưỡng giữ như mẫu, `bao_ve` 12 mục (schema, migrations, bản đồ, lộ trình, `bun.lock`, các tệp chữ dùng chung) |
| `hang-viec.json` | 4 dãy, 12 hàng, 162 glob; đã qua `kiemHangViec` và `kiemCauHinh` của `dieu-phoi-va-bien` |
| `LUAT-rieng.md` | Luật riêng crm cho Nhật ký đợt, rút từ Nhật ký 04–06/10 |
