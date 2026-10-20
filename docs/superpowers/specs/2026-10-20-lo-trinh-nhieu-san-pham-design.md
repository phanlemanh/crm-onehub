# Lộ trình nhiều sản phẩm — thiết kế (LT3)

Hồ sơ: `_acceptance/lo-trinh-nhieu-san-pham/` · hàng LT3 `docs/plan/lo-trinh-okr.json` (phủ L2–L5 của
`docs/plan/pham-vi-vong-tin-hieu-1410.md`) · đợt `lo-trinh-tin-hieu`, dãy L1 · Cổng Đáng: build, Phan Le Manh 19/10.

## Vấn đề

OneHub Center là nơi vận hành, đọc lộ trình của mọi kho sản phẩm cùng kiến trúc kit (chủ kho chốt 14/10). Hôm nay
trang Lộ trình chỉ đọc được CRM: bảng `BanChupLoTrinh` đã khoá theo `nguon` nhưng chỉ có hàng `crm`, khuôn bản chụp
ghim `nguon: z.literal("crm")`, và đường duy nhất đưa lộ trình vào CRM là GitHub Actions của chính kho CRM đẩy lên
bằng khoá «Đẩy lộ trình» — khoá thuộc về một người. Thiếu bốn thứ: danh bạ sản phẩm, quyền đọc kho, bộ chọn sản phẩm,
quyền xem theo sản phẩm. Khuôn dữ liệu đã chung: khối `lo-trinh-du-lieu` của `LO-TRINH.html` trong kho kit
(`phanlemanh/acceptance-gate-kit`) qua khuôn của trang CRM nguyên vẹn (đo 20/10: `phanTichLoTrinh` trả `ok`, bản 2).

Ngưỡng ở Cổng Đáng: kho thứ hai (OneHub Platform hoặc kho kit) hiện đủ trên trang trong ngày cài, và người không có
quyền với sản phẩm đó không thấy nó.

## Cách làm (đã chọn)

### 1. Danh bạ sản phẩm — bảng mới, CRM khai trong mã

- `SanPhamLoTrinh` (Prisma): `ma` (khoá, slug sinh từ tên lúc tạo, không đổi sau), `ten`, `kho` (`owner/repo`),
  `nhanh`, `duongTep` (mặc định `LO-TRINH.html`), trạng thái lấy (`trangThaiLay`, `chiTietLay`, `kiemLuc`, `layDauLuc`,
  `caiLuc` — giờ ứng dụng được cài vào kho, đọc từ GitHub), `phienBanKhuon`, `taoBoiId`, `taoLuc`, `doiLuc`, và cột vòng
  đời theo câu trả lời Hỏi-2. `SanPhamNguoiXem (sanPhamMa, userId)` theo câu trả lời Hỏi-1.
- Bản chụp của sản phẩm nằm ở chính `BanChupLoTrinh` với `nguon = ma` — cùng bảng, cùng hàm ghi một chiều
  `ghiBanChupLoTrinh` (không bao giờ lùi). Không khoá ngoại: hàng `crm` không có sản phẩm.
- **CRM là mục cố định khai trong mã** (`LO_TRINH.nguonCrm`), luôn đứng đầu, không sửa, không xoá, đọc như hôm nay
  (bản chụp Actions đẩy hoặc tệp đóng gói). Mã `crm` bị cấm cho sản phẩm khai động.
- **Sửa nguồn (Hỏi-3, khuyến nghị).** Đổi `kho`, `nhanh` hay `duongTep` đặt `nguonDoiLuc` và trạng thái «chưa lấy»; bản
  chụp cũ vẫn hiện, kèm dòng «nguồn vừa đổi — trang đang hiện lộ trình của nguồn cũ tới khi nguồn mới lấy được». Lần lấy thành công đầu tiên sau
  `nguonDoiLuc` thay hẳn bản cũ, bỏ kiểm một chiều đúng một lần (commit của kho mới có thể cũ hơn commit của kho cũ); từ
  đó ghi một chiều như thường. Lối khác: xoá bản chụp ngay khi sửa — trang trống tới nhịp sau, trống mãi nếu nguồn mới sai.
- Khuôn khai, trạng thái lấy và hằng số sống ở `packages/validation/src/san-pham-lo-trinh.ts`
  (`LO_TRINH_SAN_PHAM`: nhịp kiểm 5 phút, tối đa sản phẩm mỗi nhịp, trần tệp 2 MB = trần bản chụp, trần thời gian một
  nhịp). Đọc ghi ở `packages/db/src/san-pham-lo-trinh.ts`. Một hàm quyền duy nhất `sanPhamXemDuoc(db, {userId, vai})`
  được cả trang, thủ tục tRPC lẫn lệnh đo gọi.

### 2. Ứng dụng GitHub chỉ đọc — sống trong tác nhân, chạy trên nhịp điều phối

- Lời gọi GitHub sống ở `apps/agent/agent/lib/lo-trinh-github.ts`, không ở API (`docs/api.md`: «About to add a vendor
  client to `apps/api`? You want `apps/agent/agent/lib`.»). Đây là **mã**, không phải model (luật 1 của `docs/agent.md`):
  không phiên eve, không `AgentTask`, như `chupSoOkr` đọc Google Sheets.
- `lenLichLayLoTrinh` (`apps/agent/agent/lib/lo-trinh-san-pham.ts`) chạy trong `schedules/dispatch.ts` cạnh
  `chupSoOkr`, mỗi nhịp lấy tối đa N sản phẩm chưa lưu trữ có `kiemLuc` cũ hơn nhịp kiểm. Mỗi sản phẩm:
  1. JWT của ứng dụng (RS256, `iss = GITHUB_APP_ID`, sống 9 phút) ký bằng `GITHUB_APP_PRIVATE_KEY`.
  2. `GET /repos/{kho}/installation` → 404 = «chưa cài vào kho»; đọc `created_at` làm `caiLuc`.
  3. `POST /app/installations/{id}/access_tokens` với `repositories: [<tên kho>]` và
     `permissions: {contents: "read", metadata: "read"}` — token chỉ đọc, chỉ cho đúng một kho, sống tối đa một giờ, không
     lưu.
  4. `GET /repos/{kho}/branches/{nhanh}` → sha và giờ commit. Cùng sha với bản chụp đang lưu → chỉ cập nhật `kiemLuc`,
     không tải tệp.
  5. `GET /repos/{kho}/contents/{duongTep}?ref={sha}` với `Accept: application/vnd.github.raw` → HTML, quá 2 MB thì dừng.
  6. `docDuLieu` (bộ đọc khối dùng chung với `day.ts`, dời vào `packages/validation`) → `phanTichLoTrinh` → ghi bản chụp
     bằng `ghiBanChupLoTrinh` → cập nhật trạng thái sản phẩm.
- **Thiếu biến thì tắt, không ném** (`docs/agent.md` «Optional by default»): `cauHinhGithubApp()` trả `null` khi thiếu
  `GITHUB_APP_ID` hay `GITHUB_APP_PRIVATE_KEY`; nhịp đặt mọi sản phẩm sang «máy chủ chưa có ứng dụng GitHub» một lần và
  đi tiếp. `GITHUB_API_URL` chỉ được ghi đè ngoài production (khuôn `ghiDe` của `okr-sheets.ts`) — để GitHub giả chạy.
- Lỗi của một sản phẩm không dừng sản phẩm khác; mỗi lỗi thành đúng một trạng thái máy đọc:
  `chua-cau-hinh` · `chua-cai` · `khong-thay-kho` (kho hoặc nhánh 404) · `khong-thay-tep` · `khoi-hong` (không có khối,
  khối không qua khuôn, `khuon` lạ — kèm đường khoá hỏng) · `qua-tran` · `loi-github` (5xx, hết hạn mức, mạng) ·
  `da-lay` · `chua-lay`. Bản chụp đang lưu không đổi ở mọi ca hỏng.
- Khoá riêng chỉ sống trong biến môi trường của tác nhân: không vào nhật ký, không vào bảng nào, không vào bản chụp. Không
  đường nào dùng khoá cá nhân (PAT).
- **GitHub giả theo đúng hợp đồng REST thật** (`scripts/lo-trinh-san-pham/github-gia.ts`, `Bun.serve`): đúng năm đường
  trên, đúng hình JSON và mã lỗi của GitHub, kiểm chữ ký JWT bằng khoá công khai của cặp khoá thử, phục vụ
  `LO-TRINH.html` thật của kho kit. Bài kiểm của tác nhân, phép đo màn và bản demo local đều chạy trên nó
  (`CLAUDE.md`: «Dịch vụ ngoài giả theo đúng hợp đồng thật của nó, không theo cái dễ giả»). Ứng dụng GitHub thật do
  chủ kho tạo và cài sau khi gộp — mục «Ra khỏi kho» của PR.

### 3. Trang Lộ trình đọc theo sản phẩm

- `page.tsx` đọc `sanPhamXemDuoc` cho người xem → danh sách `[CRM, …sản phẩm thấy được]`. Tham số `?san-pham=<ma>`
  (nuqs) chọn sản phẩm; vắng, sai hay không có quyền thì là CRM — không lộ tên, không màn lỗi.
- CRM đọc đúng đường hôm nay. Sản phẩm khác đọc bản chụp `nguon = ma` (không có tệp đóng gói để rơi về): có bản chụp →
  cùng `NoiDungLoTrinh`, cùng `choVaiXem` (số liệu chủ kho vẫn chỉ chủ thấy), cùng ngăn hồ sơ; chưa có → khung trống nói
  lý do theo trạng thái lấy, quản trị thấy thêm đường tới Cài đặt › Sản phẩm.
- **Bộ chọn** là `Select` trong `PageShellActions`, chỉ hiện khi người xem thấy từ hai sản phẩm. Dòng giờ lấy nói thêm
  nguồn: «Lấy từ `<kho>` · `<nhánh>` lúc …». Liên kết «tìm PR» của số liệu chủ kho thêm `repo:<kho>`. Tên sản phẩm và mọi
  dữ liệu lộ trình mang `translate="no"`.
- **Nhiều phiên bản khuôn** (L5): bộ đọc hôm nay đã đọc bản 1, bản 2 thiếu mô hình hiển thị, và bản mới hơn (đọc phần
  biết). Trang thêm một dòng ngay dưới dòng giờ lấy khi khối của sản phẩm không phải bản hiện hành hoặc thiếu mô hình:
  «`<tên>` đang ở khuôn lộ trình bản n — vài phần hiện theo luật cũ» / «… bản n mới hơn trang — vài phần chưa hiện».
  Cài đặt hiện bản khuôn của từng sản phẩm.

### 4. Cài đặt › Sản phẩm

- Mục mới «Sản phẩm» trong nhóm «Kết nối và dữ liệu» (`docs/settings.md`), `PageShell width="page"`, nút chính duy
  nhất «Thêm sản phẩm».
- Một `Card` liệt `Item`: CRM đứng đầu với nhãn «khai trong mã» và không menu; mỗi sản phẩm khác: tên, `kho · nhánh ·
  tệp`, `StatusIndicator` theo nghĩa trạng thái lấy, giờ lấy, bản khuôn, menu «…» (Sửa · Người xem · cách dọn của Hỏi-2).
- Thêm và sửa: `Sheet` bốn ô (tên, kho, nhánh, đường tệp), kiểm ở cả trình duyệt lẫn máy chủ. Người xem: `Sheet` liệt
  thành viên với ô chọn; chủ và quản trị hiện khoá «luôn thấy».
- Chỉ chủ và quản trị khai, sửa, cấp quyền (cùng luật «owner or admin decision» của `docs/connections.md`). Thành viên
  mở trang thấy danh sách và trạng thái, điều khiển khoá, một dòng dưới tiêu đề nói vì sao.

### 5. Đường đo

`bun run lo-trinh:do-san-pham` đọc danh bạ: mỗi sản phẩm một dòng — giờ khai, giờ cài ứng dụng, giờ bản chụp đầu, độ trễ
tính từ mốc muộn hơn của khai và cài, cờ «quá một ngày»; và một dòng kết luận theo ngưỡng Cổng Đáng. Vế «người không
quyền không thấy» đo bằng AC-4 trước gộp và bằng phiên nghiệm thu sau khi cài (đăng nhập bằng một thành viên chưa cấp).

Bỏ:
- (a) **Webhook đẩy khi nhánh đổi** thay nhịp kiểm — cần một điểm nhận công khai ở API (một cửa nữa phải chặn), API là
  hàm serverless nên việc tải tệp sau trả lời không chắc chạy, và tác nhân vẫn phải tải tệp. Nhịp 5 phút thoả «trong ngày
  cài» với dư lớn. Mở lại khi cần độ trễ dưới một phút.
- (b) **Đọc kho sản phẩm bằng Actions đẩy như CRM** — mỗi kho phải giữ một khoá CRM của một người làm bí mật; hàng LT3
  ghi rõ «Ứng dụng GitHub chỉ đọc, cài vào từng kho, không dùng khoá cá nhân».
- (c) **Chuyển CRM sang ứng dụng GitHub** trong vòng này (Hỏi-4, khuyến nghị hoãn) — đường đẩy của CRM đã ký và đang
  trong cửa đo 14 ngày của LT1d (đọc 30/10); đổi bây giờ làm phép đo đó mất nghĩa. Hàng LT3 ghi «không dùng khoá cá nhân»,
  nên CRM vẫn còn lệ thuộc khoá của một người tới hàng chuyển sau 30/10.
- (d) **Tín hiệu nhiều sản phẩm (L6)** — hàng riêng.

## Không gian tiêu chí (quét hình thái)

- Ngữ cảnh: chân sản phẩm [SUY-TỪ-REPO: packages/validation/src/vai-workspace.ts] [SUY-TỪ-REPO:
  apps/app/lib/lo-trinh/doc-trang.ts] [SUY-TỪ-REPO: docs/plan/pham-vi-vong-tin-hieu-1410.md] · chân ngành [NGÀNH:
  Backstage software catalog — thực thể đăng ký bằng đường tới một tệp trong kho, đọc qua ứng dụng GitHub, vòng làm mới
  định kỳ, lỗi xử lý hiện trên từng thực thể] [NGÀNH: GitHub Apps — quyền `contents: read`, token cài đặt sống một giờ,
  thu hẹp theo kho].
- Trục A — vòng đời mục danh bạ: khai | sửa thông tin | sửa nguồn | cấp quyền xem | dọn (Hỏi-2) | CRM cố định [thước
  CE: `docs/vong-doi.md`, Backstage register/unregister].
- Trục B — người × việc: chủ | quản trị | thành viên được cấp | thành viên không cấp | chỉ OKR | khoá máy, chưa đăng nhập
  × xem trang | khai-sửa | cấp quyền [thước CE: `WORKSPACE_ROLES`].
- Trục C — trạng thái nguồn: chưa cấu hình máy chủ | chưa cài vào kho | kho/nhánh không có | tệp không có | khối hỏng |
  khuôn cũ | khuôn mới hơn | quá trần | GitHub hỏng | nhánh đứng yên | nhánh đổi | nhánh lùi (force-push) [thước CE:
  mã lỗi REST của GitHub; AC-3..6 của LT1c].
- Trục D — mặt đọc: trang Lộ trình | Cài đặt › Sản phẩm | lệnh đo × 375/1280 × vi/en × sáng/tối.
- Core: lấy lần đầu và đọc đủ (AC-1) · nhịp và không tải lại (AC-2) · ca hỏng (AC-3) · quyền xem (AC-4) · danh bạ chỉ
  quản trị, sửa nguồn (AC-5) · dọn (AC-6) · nhiều khuôn (AC-7) · màn (AC-8) · khoá chỉ đọc (AC-9) · đường đo (AC-10).
- Later: webhook · nút «Lấy lại ngay» · CRM qua ứng dụng GitHub · cấp quyền theo phòng ban hay nhóm · lịch sử bản chụp ·
  nhánh lùi (force-push: hàm ghi một chiều giữ bản mới hơn — cùng giới hạn đã khai của LT1c) · tín hiệu nhiều sản phẩm.
- Never: ghi gì vào kho sản phẩm · khoá cá nhân · đọc thân hồ sơ đầy đủ từ kho (trang chỉ đọc tóm tắt trong khối).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: quản trị mở Cài đặt › Sản phẩm → «Thêm sản phẩm» → điền tên, kho, nhánh, tệp → Lưu → hàng mới «Đang chờ lấy»
  → (ứng dụng đã cài) trong một nhịp hàng thành «Đã lấy» → mở Lộ trình, chọn sản phẩm ở bộ chọn → đọc như CRM (điểm ra:
  ngăn hồ sơ của một việc).
- Biên: người xem chỉ thấy CRM → không có bộ chọn, trang như hôm nay; đường dẫn mang `?san-pham=` của sản phẩm không
  được thấy → trang CRM; thành viên mở Cài đặt › Sản phẩm → chỉ đọc.
- Lỗi & quay lại: chưa cài ứng dụng, sai kho, sai tệp, khối hỏng → hàng ở Cài đặt mang trạng thái đỏ hoặc vàng với một câu
  nói đúng chỗ hỏng → quản trị sửa nguồn (Sheet) hoặc cài ứng dụng → nhịp sau tự lấy lại; trên trang Lộ trình sản phẩm chưa
  có bản chụp hiện khung trống cùng câu ấy.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Lộ trình | Đọc lộ trình của một sản phẩm | thanh điều hướng / ngăn hồ sơ |
| Cài đặt › Sản phẩm | Khai và theo dõi nguồn lộ trình của từng sản phẩm | thanh bên Cài đặt / Sheet thêm-sửa, Sheet người xem |
| Sheet thêm/sửa sản phẩm | Nhập nguồn của một sản phẩm | nút «Thêm sản phẩm», menu «Sửa» / về danh sách |
| Sheet người xem | Chọn ai thấy sản phẩm | menu «Người xem» / về danh sách |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lotrinh-mot | Lộ trình | Như hôm nay, không bộ chọn | đọc |
| ST-lotrinh-chon | Lộ trình | Bộ chọn «Sản phẩm» ở đầu trang, CRM chọn sẵn | chọn sản phẩm |
| ST-lotrinh-dang-tai | Lộ trình | Khung xương của trang, tiêu đề giữ | chờ |
| ST-lotrinh-sp | Lộ trình | Lộ trình của sản phẩm, dòng «Lấy từ kho · nhánh lúc …» | đọc, mở hồ sơ |
| ST-lotrinh-sp-chua-co | Lộ trình | Khung trống «Chưa có lộ trình của <tên>» + câu lý do; quản trị thêm liên kết tới Cài đặt › Sản phẩm | chờ / sang Cài đặt |
| ST-lotrinh-sp-khuon-cu | Lộ trình | Dòng «<tên> đang ở khuôn lộ trình bản n — vài phần hiện theo luật cũ» | đọc |
| ST-lotrinh-sp-lay-hong | Lộ trình | Bản chụp cũ, dòng giờ lấy của nó, và dòng «Lần lấy gần nhất hỏng: <lý do>. Trang đang hiện bản lấy trước đó.» | đọc |
| ST-lotrinh-sp-nguon-doi | Lộ trình | Bản chụp của nguồn cũ + dòng «Nguồn vừa đổi — trang đang hiện lộ trình của nguồn cũ tới khi nguồn mới lấy được.» (Hỏi-3) | đọc |
| ST-sanpham-danh-sach | Cài đặt › Sản phẩm | CRM «khai trong mã» + các sản phẩm, trạng thái, giờ lấy, bản khuôn | thêm, sửa, cấp quyền |
| ST-sanpham-rong | Cài đặt › Sản phẩm | Hàng CRM + `Empty` «Chưa có sản phẩm nào khác» | Thêm sản phẩm |
| ST-sanpham-dang-tai | Cài đặt › Sản phẩm | Khung xương cùng hình danh sách | chờ |
| ST-sanpham-loi-tai | Cài đặt › Sản phẩm | `VungTaiLoi` + Thử lại | thử lại |
| ST-sanpham-khong-quyen | Cài đặt › Sản phẩm | Danh sách chỉ đọc, nút khoá, dòng «Chỉ chủ và quản trị khai được sản phẩm» | đọc |
| ST-sanpham-chua-cau-hinh | Cài đặt › Sản phẩm | Mọi hàng vàng «Máy chủ chưa có ứng dụng GitHub» | báo người cài |
| ST-sanpham-hong | Cài đặt › Sản phẩm | Hàng đỏ với câu chỗ hỏng (chưa cài, không thấy tệp, khối hỏng…) | sửa nguồn |
| ST-sanpham-them | Sheet thêm | Bốn ô, Lưu tắt tới khi hợp lệ, lỗi dưới ô | lưu / huỷ |
| ST-sanpham-nguoi-xem | Sheet người xem | Danh sách thành viên, chủ và quản trị khoá «luôn thấy» | lưu / huỷ |
| ST-sanpham-da-luu-tru | Cài đặt › Sản phẩm | Mục gập «Đã lưu trữ (n)» cuối trang (theo Hỏi-2) | khôi phục / xoá vĩnh viễn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Kho: đúng dạng `owner/repo` (chữ, số, `-`, `_`, `.`); nhánh: tên nhánh git hợp lệ, không khoảng trắng; tệp: đường tương
  đối, không `..`, không bắt đầu bằng `/`, tối đa 200 ký tự; tên: 1–60 ký tự. Lỗi hiện dưới ô, Lưu tắt tới khi hợp lệ.
- Bộ chọn ghi `?san-pham=` lên đường dẫn bằng nuqs; đổi sản phẩm giữ các tham số khác của trang chỉ khi chúng còn nghĩa
  (về trang đầu, bỏ bộ lọc mốc).
- Từ 375 px: bộ chọn nằm dưới tiêu đề, rộng hết cột; danh sách Cài đặt xếp trạng thái xuống dòng thứ hai.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `PageShell`, `PageShellActions` | dùng | khung trang chuẩn |
| `Select` | dùng | bộ chọn sản phẩm — một giá trị trong danh sách ngắn |
| `Item`, `Card`, `Empty`, `StatusIndicator` | dùng | danh sách đối tượng có hành động ở Cài đặt |
| `Sheet`, `Field`, `Input`, `Checkbox` | dùng | bốn ô → Sheet (`docs/settings.md`) |
| `ArchivedList`, `ConfirmDialog` | dùng | dọn theo `docs/vong-doi.md` |
| `AreaSidebarItem` | dùng | mục «Sản phẩm» ở thanh bên Cài đặt |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: Cài đặt › Sản phẩm là danh sách đối tượng có trạng thái, chi tiết mở trong Sheet — cùng hình Kết nối và Khoá API
của kho; trang Lộ trình giữ nguyên khuôn, chỉ thêm một bộ chọn — luồng hiển nhiên, không tra thêm.
<!-- UX-SPEC-TEMPLATE>>> -->

## Câu chỉ người trả lời (lên thẻ Cổng Phạm vi)

- **Hỏi-1 — ai thấy một sản phẩm.** Máy khuyên: chủ và quản trị luôn thấy; sản phẩm mới chỉ chủ và quản trị thấy; quản
  trị cấp thêm từng người. Lối khác: ngưỡng theo vai cho từng sản phẩm («chỉ quản trị» / «mọi thành viên») — rẻ hơn,
  không có danh sách người, nhưng không cho được một người riêng xem mà không mở cho mọi thành viên.
- **Hỏi-2 — dọn một sản phẩm (ba câu của `docs/vong-doi.md`).** Máy khuyên: (1) Xoá khi chưa có lịch sử, Lưu trữ →
  Khôi phục → Xoá vĩnh viễn khi đã có; (2) «lịch sử» = đã từng lấy được một bản chụp (người đã có thể đọc lộ trình ấy);
  (3) danh sách mặc định hiện sản phẩm đang dùng, mục gập «Đã lưu trữ (n)» cuối trang Cài đặt; sản phẩm đã lưu trữ biến
  khỏi bộ chọn và thôi được lấy, Xoá vĩnh viễn mất cả bản chụp và danh sách người xem. Lối khác: chỉ Xoá (mất bản chụp
  ngay, không hoàn tác) — rẻ hơn một bảng trạng thái nhưng lệch chuẩn vòng đời.
- **Hỏi-3 — sửa nguồn của một sản phẩm.** Máy khuyên: giữ bản chụp cũ hiển thị kèm dòng «nguồn vừa đổi» tới khi nguồn
  mới lấy được, rồi thay hẳn. Lối khác: xoá bản chụp ngay khi sửa — một lỗi gõ ở ô nhánh làm trang đang có người đọc
  thành trống tới khi có người sửa.
- **Hỏi-4 — CRM có chuyển sang ứng dụng GitHub trong vòng này.** Máy khuyên: chưa — hoãn tới khi cửa đo 14 ngày của LT1d
  đọc xong 30/10, mở hàng riêng. Lối khác: chuyển ngay — thêm việc cho vòng này và phép đo LT1d đếm lại từ đầu.
