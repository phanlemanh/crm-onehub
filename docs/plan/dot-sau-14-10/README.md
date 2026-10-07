# Đợt sau-14-10 — gói chuẩn bị mở đợt

Soạn 07/10/2026, sau khi gộp `dieu-phoi-hai-tang` (#288). Đây là phần khảo sát chỉ đọc của bước «Mở đợt»
(spec `acceptance-gate-kit` `docs/superpowers/specs/2026-10-05-orchestrator-workers-hai-tang-design.md` §4.11,
giai đoạn 1) làm trước, để phiên giám sát không phải dựng lại từ đầu. Chưa có gì được bật: chưa chạy
`dieu-phoi.mjs mo`, chưa có symlink `dieu-phoi-hien-tai`, hook vẫn im.

Nghi thức chạy: `scripts/dieu-phoi/README.md`. Tệp trong thư mục này là **bản nháp để chép vào thư mục đợt** sau
lệnh `mo`, không phải cấu hình đang chạy.

**Một máy.** Chủ kho chốt 07/10: đợt này chạy trên một máy, một phiên giám sát, bốn phiên thợ. Chia nhiều máy là
giai đoạn sau; số đo cho giai đoạn đó (khoá gộp trên GitHub, bảo vệ nhánh, phút Actions) đã ghi trong trí nhớ của
phiên máy, mục «Điều phối: một máy trước». Đợt này không cần khoá gộp ngoài máy hay bảo vệ nhánh: khoá `merge` của
bộ phát lịch đã xếp các lần gộp lần lượt.

**Bổ sung 07/10 chiều**, sau khi gộp lượt 1 của chuẩn vòng đời (#290): ba hàng mới (V2, F13, V2L), phạm vi E3 và E5
thêm phần vòng đời, K6a chờ thêm E5 và V2. Chi tiết ở mục 2.

## 1. Điều kiện trước khi mở

| Việc | Trạng thái 07/10 | Ai |
|---|---|---|
| Gộp `dieu-phoi-hai-tang` (tầng máy 1a) | Xong — #288, 07/10 | — |
| Gộp `dieu-phoi-va-bien` (hook nhận bản chép S4, kiểm hình dạng cấu hình, test vào cổng, giữ nhịp, gia hạn) | Xong — #291, 07/10 | — |
| Hợp đồng nối tiếp lần hai: tệp `tra-loi` gia hạn hỏng làm đứng cả nhịp; lệnh bọc hỏng khi lệnh gốc có `TZ=…` đứng trước; `pre-push` dùng hook của chính cây | Xong — #298 (`dieu-phoi-truoc-mo-dot`), 07/10. #296 làm trùng hai mục đầu, đã đóng | — |
| Duyệt thẻ đóng đợt `dieu-phoi-1410` (`.acceptance-runs/dieu-phoi-1410/the-dong-dot.md`) | Xong — đóng 07/10; không còn symlink `dieu-phoi-hien-tai` | — |
| Tắt «Auto-archive sessions when their pull request closes» | Đã tắt | — |
| Claude Code trong app desktop ≥ 2.1.288 (lệnh nền không bị giới hạn thời gian) | Đạt — app 2.26454.0 chạy Claude Code 2.1.289 cho mọi phiên (kiểm 07/10, app tự nâng lúc 05:04); CLI 2.1.289 | — |
| Docker và Postgres chạy (`lsof -nP -iTCP:5432 -sTCP:LISTEN`) | 07/10 đầu phiên Docker tắt, cả bốn suite đỏ giả; đã mở lại | Phiên giám sát kiểm mỗi lần thức |
| Chế độ quyền của phiên giám sát (mặc định của máy: auto) | Anh chọn giữ hay đổi | Anh |
| Cổng Đáng F9–F12 (vệ sinh thước) | Chưa ký — ba hàng có `opportunity.md` ở `stage: discovery` | Anh, nếu muốn chúng vào đợt |
| Thư mục chính `~/dev/crm` về `onehub` mới nhất (`git pull --ff-only origin onehub`) | Đã kéo 07/10 sau #297; kiểm lại ngay trước lệnh `mo` | Phiên giám sát |
| Bản vá ba lỗ của bộ kit nghiệm thu: vòng sửa S4 làm rơi mục ngoài hợp đồng của vòng trước, rơi khung ảnh ui-check mang sang, bộ đếm vật/thước tính cả phần gộp từ onehub | Còn ở nhánh `fix/luot-sua-giu-du-dem-dung` của kit, chưa có PR; bản đang cài 2.24.0 khớp `main` của kit (kiểm 07/10) | Gộp và cài cùng phiên bản trước khi mở đợt; chưa có thì áp luật 13 của `LUAT-rieng.md` |
| Ngân sách mô hình cho các hàng Kara (K2, K3, K4, K6b) | Ngân sách team chạm trần 07/10 (lỗi 402); anh đang nạp 07/10 | Anh nạp; chưa nạp thì phép đo gọi mô hình thật đỏ giả |
| Bài «số người gõ» của Trợ lý OKR chập chờn | Có chip riêng; chip gộp trước khi mở đợt thì bỏ hàng F13 | Anh bấm chip, hoặc để F13 làm |
| Bài «người dùng huỷ» của cửa soạn OKR lắc theo tốc độ máy (`nguoi-huy-khong-lac`) | Đã ký Cổng 2; #294 đã gộp `onehub` mới, CI đang chạy lại | Anh gộp khi CI xanh |
| Bài `chen-lien-ket` › «Esc đóng hộp và trả focus về trình soạn» của `packages/ui` chập chờn trên CI — có mặt trong 9 trên 12 lượt CI đỏ gần nhất (30/09–07/10), mọi lần trên nhánh không chạm `packages/ui`; tại chỗ xanh 8/8 | Đã xếp vào P4 thành hàng F14 `chen-lien-ket-khong-lac` (anh chốt 07/10) | Thợ P4 |

## 2. Dãy và hàng

Bốn phiên thợ (spec: tối đa 3–4 phiên local). Mỗi dãy làm tuần tự theo `uu_tien`; `sau` là hàng phải **gộp**
trước. Ranh giới tệp lấy từ ba lượt khảo sát chỉ đọc 07/10, đã bung ngoặc nhọn vì `glob.mjs` không hiểu `{a,b}`.

| Dãy | Hàng theo thứ tự | Vì sao gom như vậy |
|---|---|---|
| **P1 · Kara OKR** | K2 `soan-okr-trang-rieng` → K3 `kara-gop-y-luot-2` → K6a `kara-mot-ten` | K2 và K6a cùng nặng ở `okr-soan.ts`; K6a là câu chữ, làm cuối (chủ kho chốt 04/10: tính năng trước, chữ sau) và chờ K4, K6b, E5, V2 gộp — cả bốn đều thêm chữ vào tệp chữ mà K6a đổi |
| **P2 · Kara bản ghi** | K4 `khung-ban-ghi-kara` → K6b `kara-trang-thai-toan-crm` → V2 `vong-doi-mot-cach-cat` | K4, K6b cùng `contact-sheet`, `company-sheet`, `contact-plans`, `crm.ts`; V2 chạm chính các ngăn bản ghi, `record-actions`, `bulk-actions` và `ArchivedList` của hai hàng đó nên đứng sau chúng, và chờ E7 vì cùng màn thoả thuận |
| **P3 · Deal và CRM chung** | E7 `datatable-loc-ro` → E3 `danh-sach-keo-chung` → E1 `deal-va` → E4 `giai-doan-mac-dinh` (T3) → E6 `dieu-phoi-va` → E5 `tac-nhan-va` | E7 trước vì `data-table.tsx` là chỗ chồng lớn nhất với Kara; E4 sửa schema nên đứng một mình giữa dãy |
| **P4 · Sửa nóng** | Lỗi do người dùng thật báo (ưu tiên cao nhất, phiên giám sát thêm hàng khi có) → F13 `so-moi-khong-chap-chon` → F14 `chen-lien-ket-khong-lac` → V2L `luat-kho-vong-doi` → F8 `neo-thuoc-het-han` | F13, F14, V2L, F8 chỉ chạm bài kiểm, thước và công cụ, không chồng tệp với dãy nào; làm lúc khoá `s4` rảnh |

**Phần vòng đời trong đợt** (chuẩn `docs/vong-doi.md`, lượt 2 của mục «Đợt»). Mọi hàng có nút xoá, lưu trữ hay trạng
thái kết thúc trả lời ba câu của mục «Tính năng mới phải trả lời ba câu ở Cổng Phạm vi» trong hợp đồng của mình.

| Hàng | Thêm gì | Vì sao đứng đó |
|---|---|---|
| E3 | Giai đoạn thoả thuận ghi «Xoá» mà thật ra chỉ cất: đổi thành «Lưu trữ», chỗ «Đã lưu trữ (n)» bằng `ArchivedList`. Thêm `hop-thoai-giai-doan.tsx` vào ranh giới | E3 đã giữ `giai-doan-settings.tsx`; máy chủ giai đoạn đã lưu trữ đúng, chỉ chữ và màn lệch |
| E5 | Tác nhân không xoá được khi đang chạy; có lịch sử chạy thì lưu trữ thay vì xoá. Thêm `agent-definitions.service.ts` và một bài kiểm API vào ranh giới | E5 đã giữ toàn bộ màn tác nhân |
| V2 | Bộ chữ thống nhất trên màn thoả thuận, cá nhân, công ty; toast «Hoàn tác» khi lưu trữ ở mọi nơi; dải «Đã lưu trữ ngày … · Khôi phục» khi mở bản đã cất; nút «Đã lưu trữ» trên Kanban thoả thuận; danh sách liên quan trong ngăn bản ghi chỉ hiện bản đang dùng kèm «+n đã lưu trữ» | Xem dòng P2 ở bảng trên |
| V2L | Luật thứ bảy «vòng đời» của `scripts/luat-kho` (nút xoá trên bản ghi có lịch sử, danh sách mặc định lẫn bản đã cất, hai cách cất song song) và chạy thước đó trong `acceptance.yml` | Chỉ chạm công cụ và CI; làm sau E3, E5, V2 thì thước gặp ít ca cũ hơn, nhưng không phải chờ |
| F13 | Bài `nop-ban-nhap` › «số người gõ…» đỏ một lần trên CI của #290 (số thử 41 tình cờ có trong gói gửi mô hình); làm bài tất định mà không nới phép kiểm sản phẩm | Ca CI đỏ không do mã đang xét làm tốn một lượt chạy lại mỗi lần |
| F14 | Bài `chen-lien-ket` › «Esc đóng hộp và trả focus về trình soạn» của `packages/ui` đỏ ở 9 trên 12 lượt CI hỏng gần nhất (30/09–07/10), mọi lần trên nhánh không chạm `packages/ui`, kèm `TypeError … commandManager` của tiptap; tại chỗ xanh 8/8. Tìm gốc (trình soạn huỷ trước khi trả focus, hay chờ một nhịp chưa đủ trên máy CI chậm), sửa cho tất định bằng chờ có điều kiện, không nới phép kiểm | Ca CI đỏ không do mã đang xét làm tốn một lượt chạy lại mỗi lần — đo trên đúng các PR 07/10 |

Không vào đợt: K5 `chat-deal-mot-khung` (lộ trình ghi sau 07/12; chồng nặng với K4 và E5), 7n (hạn 14/12, chưa có
hồ sơ cơ hội), F9–F12 (chờ Cổng Đáng; ký xong thì giám sát xếp vào P4, F9 trước). Vòng đời lượt 3 (chiến dịch «Đang
chạy | Đã kết thúc», xoá kế hoạch 30 ngày tạo nhầm, khôi phục lựa chọn của trường, ghi rõ phạm vi dọn tự động) để đợt
sau: kế hoạch 30 ngày nằm trong ranh giới K6b. Lưu trữ trang Tài liệu (lượt 3b của `docs/plan/lo-trinh-kho-tai-lieu.md`)
cũng để sau: nó sửa schema, mà schema đã có E4 trong đợt này.

**Rủi ro khảo sát đã thấy**
- E4 sửa `schema.prisma` và thêm migration — hai thứ nằm trong `bao_ve`. Gỡ `@default` ở cột giai đoạn làm gãy
  khoảng 31 chỗ `deal.create`, gồm test của Kara. Đồng bộ `onehub` ngay trước khi mở E4; tên migration lấy giờ UTC thật.
- E7 sửa `data-table.tsx` mà màn OKR (`loc-okr`, `theo-don-vi`) đang dùng: giữ chữ ký prop cũ, chỉ thêm prop tuỳ chọn.
- E1 và E6 chỉ được **thêm dòng** vào `agent-transcript.ts`, `agent-tasks.ts` (Kara cũng thêm kind ở đó).
- K2 phải gỡ hai mục miễn trừ trong `_acceptance/nen-chat-ai-elements/rang/mo-coi.mjs` (Ngoài-4 của `bo-xuong-kara`).
- Hai tệp chữ (`okr-toan-canh.ts`, `record-sheet.ts`) thuộc ranh giới cả P1 (K6a) lẫn P2 (K4, K6b); thứ tự được
  giữ bằng `sau` của K6a.
- V2 cần đổi `deals-table.tsx` (thuộc E7, dãy P3) để có nút «Đã lưu trữ» ở dạng bảng: gửi yêu cầu `cham-tep` cho phiên
  giám sát sau khi E7 gộp, không thêm tệp đó vào ranh giới V2.
- V2 thêm chữ vào bốn tệp chữ `deals`, `contacts`, `companies`, `crm` (khai ở `chung_chi_them`); đổi chữ lệch ở tệp
  khác thì để K6a làm, vì K6a chạy sau và giữ mọi tệp chữ.
- Đo chồng tệp lại sau bổ sung 07/10: không hàng nào của hai dãy khác nhau chồng tệp ngoài `bao_ve`; V2 chồng K4 và
  K6b ở 6 tệp, cùng dãy P2 và đứng sau cả hai.

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
| `hang-viec.json` | 4 dãy, 16 hàng, 191 glob (bổ sung 07/10 chiều: V2, F13, V2L; E3, E5 thêm ranh giới; 07/10 tối: F14, không chồng tệp với hàng nào); đã qua `kiemHangViec` và `kiemCauHinh` của cả `onehub` sau #288 lẫn nhánh `feat/dieu-phoi-va-bien` |
| `LUAT-rieng.md` | Luật riêng crm cho Nhật ký đợt: 12 luật rút từ Nhật ký 04–06/10, ba luật (13–15) từ lượt `don-okr-nhap-sai` 07/10 |
