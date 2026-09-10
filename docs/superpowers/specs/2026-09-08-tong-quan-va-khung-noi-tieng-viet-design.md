# Màn Tổng quan và khung điều hướng nói tiếng Việt — thiết kế (lát ③c-1)

Ngày 2026-09-08. Lát đầu của vòng ③c ("trang khác", 319 chuỗi / 59 file theo kiểm
kê 02/09) trong năm vòng của `_acceptance/tieng-viet-cho-crm/opportunity.md`.

## Vấn đề

Sau tám vòng Việt hoá đã ký, **màn đầu tiên nhân viên thấy sau khi đăng nhập vẫn
là tiếng Anh**: `/` (Tổng quan) mang bốn thẻ số, hai biểu đồ, ba bảng — toàn
tiếng Anh, và còn ghim `"en"` vào `formatCount` ở ba chỗ. Khung bao quanh mọi màn
cũng vậy: thanh bên (icon rail) có sáu nhãn tiếng Anh cạnh một nhãn *Chiến dịch*
tiếng Việt viết cứng — lẫn tiếng ngay trong một cột; thanh đầu có *Open
navigation* · *Homepage* · *Account menu* · *Sign out* · *Could not sign out.*;
hộp tìm nhanh ⌘K và hàng đợi làm giàu ở góc phải thanh đầu cũng tiếng Anh.

Vì sao tám vòng không thấy: bảng nợ `_acceptance/NO-CAN-TRA.md` ghi ở mục nặng
nhất — **bộ thước màn chỉ gom chữ từ phần tử cha của `main`**, nên thanh bên và
thanh đầu nằm ngoài tầm mọi phép đo của ba hồ sơ dùng chung bộ thước. Chủ kho đã
định đoạt "mở hợp đồng mới" cho nó ở Cổng 2 của `agent-builder-noi-tieng-viet`.
Lát này là hợp đồng đó, gộp với chữ của màn Tổng quan vì hai thứ hiện cùng lúc
trên cùng một khung hình.

Đếm sơ bộ bằng `dem-pham-vi.mjs` (máy đếm thô, chưa trừ className): 106 chuỗi
ứng viên trên 9 file có chữ. Dân số thật chốt bằng thước ở S3, như mọi vòng
trước.

## Quét không gian tiêu chí (morphological-scan, preset test-matrix)

### Ngữ cảnh

Sản phẩm: CRM nội bộ của OneHub. **Chân sản phẩm** — `CLAUDE.md`, `CONTEXT.md`
(từ điển và luật viết nhãn), tám hồ sơ Việt hoá đã ký và bảng nợ
`[SUY-TỪ-REPO: _acceptance/NO-CAN-TRA.md]`, `[SUY-TỪ-REPO: _acceptance/cai-dat-con-lai-noi-tieng-viet/contract.md]`.
**Chân ngành** — cùng ba chuẩn có tên mà bốn vòng trước dùng: thuộc tính
`translate` của WHATWG HTML `[NGÀNH: WHATWG HTML — translate]`, W3C i18n Best
Practices `[NGÀNH: W3C i18n]`, pseudo-localization `[NGÀNH: pseudo-localization]`.
Thêm một chuẩn cho khung điều hướng: **WAI-ARIA Authoring Practices — landmark
`navigation` phải có nhãn phân biệt được khi trang có nhiều hơn một `nav`**
`[NGÀNH: WAI-ARIA APG — landmarks]` — vì lát này có ba `nav aria-label="Primary"`
(rail, hai biến thể ngăn kéo di động) và nhãn ấy cũng là chữ phải dịch.

### Trục

- **Trục A — chữ nấp ở đâu:** văn bản JSX | thuộc tính JSX (`aria-label`,
  `placeholder`, `title` của hộp thoại) | toast | tiêu đề tài liệu | khoá object
  và mảng lựa chọn (`ITEMS`, `LABELS`, `GROUP_LABEL`, `TREND_CONFIG`,
  `*_COLUMNS`) | hàm ghép câu (`formatCount`, `${wins} won · ${losses} lost`,
  `${n}-day average cycle`) | **chuỗi vừa là nhãn vừa là khoá điều khiển**
  (`item.title === "Chat"` quyết định ngăn kéo di động mở biến thể nào).
  [thước CE: sáu giá trị đầu là chỗ đã sót thật ở ③a/③b/agent-builder; giá trị
  thứ bảy mới, đo được: `app-icon-rail.tsx` so sánh `title` ở hai chỗ — dịch
  nhãn mà không tách khoá là gãy điều hướng di động trong khi mọi thước chữ đều
  xanh]
- **Trục B — bề mặt hiện ra khi nào:** luôn hiện (rail ≥768px, thanh đầu, màn
  `/`) | **sau một cú bấm** (menu tài khoản · hộp ⌘K · ngăn kéo di động ở 360px ·
  bảng hàng đợi làm giàu) | rỗng (0 thoả thuận mở · 0 việc quá hạn · 0 hoạt động
  · ⌘K không khớp) | đang tải (fallback của rail, thanh đầu, lời chào) | cần dữ
  liệu thật (bảng có dòng, biểu đồ có điểm).
  [thước CE: bảng nợ mục "Bốn màn trong bản khai không phủ được các component
  chỉ hiện sau khi bấm" — đúng lớp lỗi; và `chan-lai-component-ra-man` đã ký là
  thước cho lớp đó ở mức component]
- **Trục C — hạng của chữ:** nhãn của mình | dữ liệu người nhập (tên thoả thuận,
  tên công ty, chủ đề việc, tên người ghi, tên workspace, email người dùng, kết
  quả ⌘K) | định danh giữ nguyên (mã tiền tệ `USD`/`VND`, nhãn giai đoạn thoả
  thuận mang `lang="en"`) | thương hiệu (`OneHub`).
  [thước CE: `CONTEXT.md` — "Dữ liệu người nhập không dịch, và đánh dấu để trình
  duyệt không tự dịch"; sổ bàn giao ghi rõ *tên thoả thuận và tên cá nhân chưa
  mang `translate="no"`* — chính là bảng Tổng quan]
- **Trục D — gốc của thước:** gốc cũ (cha của `main`) | gốc toàn màn (`body`) |
  mũi gọi cũ của năm hồ sơ đã ký.
  [thước CE: đo 06/09 trong bảng nợ — "OneHub CRM" và câu rỗng của thanh bên đều
  NGOÀI gốc; nới gốc kéo vùng của hồ sơ khác vào phép đo của ba hồ sơ]

Trục D độc lập với A–C: đổi gốc thước không ép đổi chỗ chữ nấp hay hạng chữ.

Không gian 7 × 5 × 4 × 3 = 420 ô — vượt ngưỡng 50, quét **pairwise** như preset.

### Core

1. **A × B=luôn-hiện trên màn thật** — `/` hai lượt tiếng, gốc toàn màn: số
   chuỗi bằng nhau, từng vị trí khác nhau trừ bảng không-dịch, lượt `vi` có dấu.
2. **A × B=sau-một-cú-bấm** — ba bề mặt: menu tài khoản, hộp ⌘K, ngăn kéo di
   động 360px. Không lái chúng ra thì lớp lỗi của bảng nợ lặp lại nguyên xi.
3. **A=khoá-điều-khiển** — tách `title` khỏi khoá của mục rail; thước là một bài
   kiểm đơn vị trên module thuần: mục *Hội thoại* vẫn được nhận ra ở lượt `vi`.
4. **A toàn trục ở mức mã** — dân số sinh từ đĩa, 0 chuỗi tiếng Anh, bảng đóng
   toast và ô tiêu đề (màn `/` chưa có `generateMetadata` — thêm một ô).
5. **C=dữ liệu người nhập** — bảng đóng `(file, biểu thức)` phải bọc
   `translate="no"`, đo mã và đo màn trên vật sẵn có (workspace, người đăng nhập,
   thoả thuận trong DB thử).
6. **C=định danh** — nhãn giai đoạn thoả thuận giữ tiếng Anh có chủ ý
   (`CONTEXT.md`: chưa chốt nghĩa), so theo vị trí DOM hai lượt phải y hệt.
7. **D toàn trục** — cặp hai chiều trên cùng một trang: gốc cũ KHÔNG thấy nhãn
   rail, gốc mới THẤY; và mũi gọi cũ không tham số vẫn ra gốc cũ.
8. **Cross-cutting bề rộng** — nhãn `vi` dài hơn ở 360px, rail và thẻ số.

Tám ô trên 420 ≈ 2% — dưới trần 20%.

### Later

- Nới gốc thước thành **mặc định** cho năm hồ sơ đã ký và re-pin chúng — sự
  kiện re-pin riêng, sau khi lát này chứng gốc mới sạch.
- Bảng hàng đợi làm giàu ở trạng thái *đang làm giàu* (cần một lượt làm giàu
  thật đang chạy) — đo ở mức mã trong vòng này.
- Hộp ⌘K có kết quả (cần dữ liệu thử khớp và API tìm kiếm) — đo trạng thái rỗng
  và tiêu đề/placeholder trên màn; kết quả đo ở mức mã.

### Never

- **Dịch bảy nhãn giai đoạn thoả thuận** — `CONTEXT.md` khoá: chưa chốt nghĩa,
  dịch là in cái sai ra màn.
- **Dịch câu lỗi từ máy chủ** (`error.message` chuyển tiếp trong toast) — vòng ④.
- **Dịch trang landing `/` của hãng** và sửa "Comp AI" ở Slack — việc riêng đã
  đề xuất trong lượt audit 08/09, không phải chữ nhân viên thấy sau đăng nhập.

### Cross-cutting áp mọi ô Core

Dân số sinh từ đĩa · mỗi phép đo mới có cặp hai chiều đã chạy thật · mọi dòng
miễn trừ có đối tượng thật · không chép thước (dùng lại qua `--lat`) · tập rỗng
thoát mã 2, không xanh.

## Đường đã chọn: hai kho chuỗi mới, một tham số cho thước

**Chọn:** hai kho chuỗi mới trong `apps/app/lib/messages/` — `tong-quan.ts` cho
màn `/` và `khung-ung-dung.ts` cho rail, thanh đầu, ⌘K, hàng đợi làm giàu, nút
đăng xuất. Mọi file của lát đọc kho qua `useLocale()` (client) hoặc `getLocale()`
(server, cho `generateMetadata`). Bộ thước dùng lại nguyên bốn mũi AST của
③b qua `--lat`, viết mới đúng một `man-that.mjs` cho ba bề mặt sau-bấm và cặp
gốc thước.

**Loại:** (a) nhét chữ Tổng quan vào `crm.ts` — file đã 635 dòng, vượt ngưỡng
kho và làm hai lát sau (③c-2 tác nhân, ③c-3 còn lại) phải chen vào cùng file;
(b) đổi gốc mặc định của `GOM`/`DO_RONG` ngay trong lát này — đổi số đo của năm
hồ sơ đã ký mà không re-pin là làm bằng chứng của họ nói dối; tham số với mặc
định cũ giữ họ nguyên vẹn, nới mặc định là việc `Later` có tên.

## Kiến trúc

- `apps/app/lib/messages/tong-quan.ts` — `tongQuanMessages(locale)`: lời chào
  và mô tả theo phạm vi (`me`/`everyone`), nhãn nút phạm vi, bốn thẻ số (nhãn ·
  mô tả · delta), hai biểu đồ (tiêu đề · mô tả · chú giải · câu rỗng · nhãn tâm
  donut), ba bảng (tiêu đề · mô tả · nút · cột · câu rỗng · nhãn `sr-only`), câu
  tiền tệ chưa quy đổi, tiêu đề tab. Hàm ghép câu nhận số và trả câu Việt không
  chia số.
- `apps/app/lib/messages/khung-ung-dung.ts` — `khungUngDungMessages(locale)`:
  bảy nhãn rail theo `CONTEXT.md` (Tổng quan · Hội thoại · Công ty · Cá nhân ·
  Thoả thuận · Chiến dịch · Cài đặt), ba nhãn `nav`, tiêu đề hai ngăn kéo, nút
  đóng, thanh đầu (mở điều hướng · trang chủ · menu tài khoản · sáng/tối · đổi
  tiếng · đăng xuất · lỗi đăng xuất · đang tải thanh đầu), hộp ⌘K (tiêu đề · mô
  tả · placeholder · hai câu rỗng · ba nhóm), hàng đợi làm giàu (đang làm giàu ·
  ẩn/hiện · câu đặt lịch).
- `apps/app/lib/khung-dieu-huong.ts` — module thuần: `MUC_RAIL` với `key`
  (`overview` · `chat` · `companies` · …) và `href`/`icon`/`match`; `laMucHoiThoai(item)`
  so bằng `key`. `app-icon-rail.tsx` lấy nhãn bằng `m.rail[item.key]`. Đây là
  chỗ duy nhất đổi logic, và nó có bài kiểm đơn vị riêng.
- `apps/app/lib/sign-out.ts` — `signOutAndRedirect(loiMacDinh: string)`: câu
  lỗi do chỗ gọi truyền vào từ kho; đóng luôn mục nợ "signOutAndRedirect nuốt lỗi
  nên câu đã dịch chết".
- `_acceptance/man-cai-dat-noi-tieng-viet/rang/man-that-lib.mjs` — `GOM` và
  `DO_RONG` nhận tham số `toanMan` (mặc định `false` = gốc cũ; `true` = `body`).
  Mọi mũi gọi hiện có gọi không tham số nên không đổi một số đo nào.
- `app/(app)/[slug]/page.tsx` — thêm `generateMetadata` đọc `tong-quan.ts`.
- `dashboard-summary.tsx` — tên thoả thuận, tên công ty, chủ đề việc, chủ đề hoạt
  động, tên người ghi bọc `translate="no"`; `app-header.tsx` — tên workspace và
  email; `quick-switcher.tsx` — tên kết quả.

Không đổi bố cục, component nền, luồng. Nếu nhãn Việt tràn ở 360px thì nới trong
thang có sẵn và khai ở Known limits.

## Từ vựng — chỗ máy đề xuất, người chốt ở Cổng Phạm vi

Bảy nhãn rail theo đúng từ điển. Riêng **màn Tổng quan nói bằng ngôn ngữ phễu
bán hàng của kho gốc** — *Closed won* · *Win rate* · *Open pipeline* · *Average
deal* — trong khi `CONTEXT.md` khoá thoả thuận là **quan hệ hợp tác**, và giai
đoạn thoả thuận **chưa chốt nghĩa**. Máy đề xuất dịch theo giọng đối tác, dùng
từ `chốt` mà từ điển đã dùng cho *Hạn chốt*:

| Gốc | Đề xuất | Vì sao |
|---|---|---|
| Closed won this month | **Chốt được tháng này** | *chốt* đã có trong từ điển; không nói "thắng" |
| Open pipeline | **Đang mở** | màn là thoả thuận, chữ "pipeline" là ẩn dụ bán hàng |
| Win rate (90d) | **Tỷ lệ chốt (90 ngày)** | cùng gốc từ |
| Average deal (90d) | **Trung bình mỗi thoả thuận (90 ngày)** | |
| X won · Y lost | **X chốt được · Y không thành** | không "thắng/thua" |
| Closed won vs. new pipeline | **Đã chốt so với mới mở** | |
| Deals in progress | **Thoả thuận đang mở** | |
| Overdue tasks | **Việc quá hạn** | |
| Recent activity | **Hoạt động gần đây** | |
| Welcome back | **Chào bạn** | nhãn màn, không phải câu chào lễ nghi |

Đây là quyết định danh từ, không phải phép dịch. Nếu người chốt bảy giai đoạn
thoả thuận sau này, các nhãn trên xét lại cùng lượt (entry `revisit` trong sổ).

## Phép đo

Mười bảy tiêu chí, hai mươi mốt phép đo. Tám mũi AST dùng lại nguyên của ③b qua
`--lat`; phần mới nằm trong đúng ba file: `man-that.mjs` của lát (màn `/` gốc
toàn màn · ba bề mặt sau-bấm · trạng thái rỗng · không-dịch có điều kiện dữ liệu ·
cặp gốc thước · chạy lại một phép đo màn của hồ sơ đã ký), `dot-bien.mjs` (bảng
bảy hình dạng), và hai bài kiểm đơn vị (`khung-dieu-huong.spec.ts`,
`sign-out.spec.ts`). Mỗi phép đo mới khai chiều đỏ trong `evals.yaml`.

Phản biện context sạch (gap-probe 08/09) ra 4 P1 + 1 P2, đã sửa vào hợp đồng
trước Cổng 1: trạng thái rỗng có tiêu chí riêng (AC-3); bảng không-dịch khai điều
kiện dữ liệu; câu lỗi đăng xuất đo bằng quan hệ và có đối chứng dương; bằng chứng
đã ký tái lập bằng chính phép đo MÀN của nó; ngăn kéo `/chat` chỉ gom rail.

Phép đo màn thật cần máy chủ dev `apps/app` + `apps/api` và một phiên
`dev:session`. Máy đang viết thiết kế này **chưa có `bun`, `.env`, Postgres** —
S3/S4 chạy ở máy có môi trường, không phải ở đây.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: đăng nhập → `/onehub` (Tổng quan) đọc trọn tiếng Việt → bấm một mục
  rail → màn đích (điểm ra: bốn màn đã dịch hoặc Cài đặt)
- Biên: workspace mới, 0 thoả thuận / 0 việc / 0 hoạt động → ba câu rỗng tiếng
  Việt, hai biểu đồ rỗng có câu; ⌘K gõ <2 ký tự → câu nhắc; 360px → rail ẩn, nút
  mở ngăn kéo ở thanh đầu
- Lỗi & quay lại: đăng xuất hỏng → toast tiếng Việt, ở lại màn; số liệu chưa về →
  spinner, không chữ

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tổng quan `/` | Cho nhân viên thấy tháng này chốt được gì, còn gì mở, việc gì quá hạn | từ đăng nhập, từ logo / tới Thoả thuận, Công ty, Cài đặt tiền tệ |
| Rail + thanh đầu | Đi tới sáu khu vực, đổi tiếng, đổi sáng tối, đăng xuất | mọi màn / mọi màn |
| Ngăn kéo di động | Cùng việc của rail ở <768px, cộng danh sách hội thoại khi đang ở Hội thoại | nút ☰ / đóng lại |
| Hộp ⌘K | Nhảy tới một công ty, cá nhân, thoả thuận | ⌘K từ mọi màn / mở bản ghi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-tong-quan-dang-tai | Tổng quan | tiêu đề + mô tả mặc định, spinner phần số | chờ |
| ST-tong-quan-rong | Tổng quan | "Chưa có thoả thuận nào mở." · "Không có việc quá hạn." · "Chưa có hoạt động nào." · hai biểu đồ rỗng có câu | mở Thoả thuận |
| ST-tong-quan-co-du-lieu | Tổng quan | bốn thẻ số, donut, đường xu hướng, ba bảng | bấm dòng mở bản ghi |
| ST-tong-quan-tien-te-thieu | Tổng quan | câu "N thoả thuận bằng X không được tính…" + liên kết Cài đặt tiền tệ | đặt tỷ giá |
| ST-rail-dang-tai | Rail | bảy nút mờ, `aria-busy` | chờ |
| ST-thanh-dau-dang-tai | Thanh đầu | skeleton tên workspace, câu `sr-only` đang tải | chờ |
| ST-ngan-keo-mo | Ngăn kéo di động | tiêu đề "Điều hướng", bảy mục có chữ | chọn mục |
| ST-ngan-keo-mo-hoi-thoai | Ngăn kéo di động | rail hẹp + thanh bên hội thoại | chọn hội thoại |
| ST-ck-trong | Hộp ⌘K | "Gõ ít nhất hai ký tự." | gõ |
| ST-ck-khong-khop | Hộp ⌘K | "Không có gì khớp." | gõ lại |
| ST-menu-tai-khoan | Menu tài khoản | email, sáng/tối, English, Đăng xuất | chọn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Không đổi phím tắt (⌘K), không đổi breakpoint (768px rail, 360px ngăn kéo).
- Nhãn rail đọc bằng tooltip và `sr-only`; ở ngăn kéo di động hiện chữ đầy đủ.
- Dữ liệu người nhập mang `translate="no"`; nhãn giai đoạn thoả thuận giữ
  `lang="en"`.

### 5. Xuất xứ component

| Component | Nấc | Vì sao |
|---|---|---|
| StatCard, DashboardRow, SimpleTable, Card* (`@crm/ui`) | dùng | đã nhận chuỗi từ ngoài theo khuôn vòng ② |
| Tooltip, Sheet, CommandDialog | dùng | chữ mặc định đã đo ở `chu-mac-dinh-thu-vien-ngoai` |
| `khung-dieu-huong.ts` | tạo | tách khoá khỏi nhãn — module thuần, không UI |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: bảng-điều-khiển (dashboard-first) cho `/`, trung-tâm-toả-nhánh cho rail.
Căn cứ: luồng có sẵn trong kho, vòng này chỉ đổi chữ — không tra mẫu, ghi thẳng
lý do.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- **Bảy nhãn giai đoạn thoả thuận** — `CONTEXT.md` chưa chốt nghĩa. Giữ
  `lang="en"`, khai trong bảng không-dịch.
- **Câu lỗi máy chủ** chuyển tiếp qua `toast.error(error.message)` — vòng ④.
- **Lớp tác nhân trong hồ sơ** (`lib/agent-*.ts`, agent-panel, agent-conversations,
  trạng thái tác nhân) — lát ③c-2.
- **Trang landing `/` của hãng, "Comp AI" ở Slack, năm chỗ ghim `"en"` ngoài lát**
  — đợt việc nhỏ riêng.
- **Nới gốc thước thành mặc định + re-pin năm hồ sơ** — Later có tên.
- Đổi bố cục, component nền, luồng.

## Đã đọc trước khi viết

`CLAUDE.md` · `AGENTS.md` · `CONTEXT.md` · `_acceptance/NO-CAN-TRA.md` ·
`_acceptance/handoff.md` · `_acceptance/cai-dat-con-lai-noi-tieng-viet/{contract.md,evals.yaml,rang/}` ·
`_acceptance/agent-builder-noi-tieng-viet/{contract.md,evals.yaml,rang/man-that.mjs}` ·
`_acceptance/man-cai-dat-noi-tieng-viet/rang/{man-that-lib.mjs,lat.mjs,khai-sinh.mjs}` ·
`docs/superpowers/specs/2026-09-06-cua-so-tro-chuyen-noi-tieng-viet-design.md` ·
chín file nguồn của lát.
