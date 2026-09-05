# Việt hoá lát agent-builder — đợt một

## Bối cảnh

Lát thứ tư của chuỗi Việt hoá. Ba lát trước: cửa vào · nhãn ứng dụng · hai đợt
Cài đặt (vòng vừa ký, PR #4). Lát này là cụm dựng tác nhân.

Dân số **đo bằng máy**, không ước lượng: `moi-chuoi.mjs` trên thư mục
`components/agent-builder` cộng các route dưới `(agent-builder)` ra **529 chuỗi
người có thể đọc, 517 còn tiếng Anh**, trên 22 file. Con số 236 mang sang từ
vòng trước là ước lượng cũ và sai.

Chủ kho chốt **cắt đôi**. Đợt này lấy 226 chuỗi trên 16 file; cửa sổ trò chuyện
(291 chuỗi, 6 file) để đợt sau.

### Vì sao cắt ở đó

Cửa sổ trò chuyện là chỗ chữ đổi nhiều nhất khi cụm còn đang phát triển; dịch
sau thì ít phải dịch lại. Ba cụm còn lại đứng yên hơn và là chỗ người quản trị
thật sự đọc: danh sách tác nhân của đội, trang chi tiết, hộp tạo mới.

### Hệ quả phải khai: một màn lẫn hai thứ tiếng

`agent-builder-shell` và `agent-builder-sidebar` bọc **cả** `/agents` lẫn
`/chat`. Dịch khung mà chưa dịch cửa sổ trò chuyện thì màn `/chat` có khung
tiếng Việt quanh nội dung tiếng Anh. Không có cách cắt nào tránh được: hoãn
khung thì `/agents` lẫn ngược lại.

Chọn để `/chat` lẫn, vì phần lớn nội dung cửa sổ đó là lời của người dùng và
của tác nhân — khung tiếng Việt quanh nó vẫn là bước tiến.

**Điều này khác hẳn ca `channel-picker` của vòng trước.** Ở đó màn lẫn tiếng vì
file nằm ngoài dân số quét nên không thước nào thấy — màu xanh là lỗ phủ. Ở đây
sự lẫn là **có chủ ý, khai bằng tên file**, và dân số quét phải chứng được rằng
sáu file hoãn là sáu file đã khai, không phải sáu file bị bỏ quên.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
### 1. Luồng

- Suôn sẻ: thanh bên → **Tác nhân của đội** → chọn một tác nhân → trang chi tiết
  (chỉ dẫn · việc làm được · lượt chạy) → sửa → **Lưu** → dải lưu báo đã ra bản mới
- Biên: chưa có tác nhân nào (danh sách rỗng) · tác nhân chưa từng chạy (không có
  lượt chạy) · Slack chưa cắm nên không chọn được kênh
- Lỗi & quay lại: tắt hết việc làm được rồi Lưu → dải lưu chặn kèm câu vì sao,
  người bật lại một việc; tạo kênh trùng tên → hộp báo lỗi ngay trong hộp thoại

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Tác nhân của đội (`/agents`) | Cho thấy đội đang có tác nhân nào | thanh bên / trang chi tiết |
| Chi tiết tác nhân (`/agents/[id]`) | Sửa một tác nhân rồi ra bản mới | danh sách / danh sách |
| Khung + thanh bên | Đưa người tới đúng hội thoại hoặc tác nhân | mọi màn của lát |
| Bảng mã sinh ra | Cho xem tác nhân được dựng thành mã gì | trang chi tiết / đóng lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-doi-rong | Tác nhân của đội | Câu rỗng: đội chưa có tác nhân nào | Mở một hội thoại dựng |
| ST-doi-dang-tai | Tác nhân của đội | Khung xương danh sách | Chờ |
| ST-chitiet-chua-chay | Chi tiết tác nhân | Câu rỗng ở ngăn lượt chạy | Chạy thử |
| ST-chitiet-dang-luu | Chi tiết tác nhân | Dải lưu ở trạng thái đang gửi | Chờ |
| ST-chitiet-da-luu | Chi tiết tác nhân | Dải lưu báo đã ra bản mới | Đóng |
| ST-chitiet-chan-luu | Chi tiết tác nhân | Câu chặn: tắt hết việc thì không lưu được | Bật lại một việc |
| ST-kenh-chua-cam | Việc làm được | Không chọn được kênh vì Slack chưa cắm | Cắm Slack ở Cài đặt |
| ST-ma-dang-ghi | Bảng mã | Câu "đang ghi mã tác nhân" | Chờ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nhãn dài ra khi dịch: cột và nút của trang chi tiết phải chịu được bản tiếng
  Việt ở bề rộng 360px mà không cắt chữ.
- Dữ liệu người nhập (tên tác nhân, tiêu đề hội thoại, tên kênh) đánh dấu để
  trình duyệt không tự dịch.
<!-- UX-SPEC-TEMPLATE>>> -->

## Quét không gian tiêu chí (morphological scan)

**Chân sản phẩm:** `CLAUDE.md` + `CONTEXT.md` + mã đang chạy
[SUY-TỪ-REPO: apps/app/components/agent-builder].
**Chân ngành:** thuộc tính `translate` của chuẩn HTML (WHATWG) cho lớp
không-dịch [NGÀNH: WHATWG HTML]; và **lịch sử lỗi thật của chính kho này** —
bốn vòng Việt hoá đã ký, mỗi vòng để lại một lớp lỗi có tên. Đó là thước CE
mạnh hơn mọi chuẩn ngoài, vì nó đo đúng sản phẩm này.

### Trục

- **A — Chữ nấp ở đâu (hình dạng cú pháp):** văn bản JSX | thuộc tính JSX |
  toast | tiêu đề tài liệu | khoá object & mảng lựa chọn | hàm ghép câu |
  chuỗi trong component dùng chung ngoài thư mục lát
  [thước CE: mỗi giá trị là một chỗ đã sót thật — toast và tiêu đề ở ③a,
  thuộc tính ở ③b vòng 1, component dùng chung ở ③b vòng 5]
- **B — Điều kiện hiện ra:** mặc định | rỗng | đang tải/đang ghi | lỗi hoặc bị
  chặn | nhất thời (đang lưu / đã lưu)
  [thước CE: ③b có AC riêng cho trạng thái rỗng và đo được 3/6]
- **C — Thứ KHÔNG được dịch:** tên thương hiệu | định danh kỹ thuật | dữ liệu
  người nhập | đoạn mã người chép
  [thước CE: ③b AC-6, AC-6b, AC-12 — cả ba đều tìm ra lỗi sản phẩm thật]

Đo trên lát này: 226 chuỗi, trong đó **176 là văn bản, 50 nằm trong thuộc tính**
trải 9 tên thuộc tính (`title`, `aria-label`, `placeholder`, `summary`,
`options`, `description`, `aria-pressed`, `trigger`, `slug`).

### Core

1. **A-văn bản × B-mặc định** — thân của lát, 176 chuỗi.
2. **A-thuộc tính × mọi B** — 50 chuỗi, chín tên thuộc tính; ③b sót đúng lớp này.
3. **A-toast × B-lỗi và B-nhất thời** — bảng đóng ghim `(file, khoá)`.
4. **A-tiêu đề tài liệu** — bốn `export const metadata` phải thành `generateMetadata`.
5. **A-component dùng chung** — `channel-picker` gọi từ `agent-capabilities`;
   chữ quanh nó (`Lives in`, `Create a channel`) còn tiếng Anh.
6. **C-định danh kỹ thuật × A-khoá object** — `pierre-dark-soft`, `unified`,
   `wrap`, `added`: miễn trừ phải khai và mỗi dòng phải có đối tượng thật.
7. **C-dữ liệu người nhập × B-có dữ liệu** — tên tác nhân, tiêu đề hội thoại.

### Later

- B-rỗng cho ô cần gieo dữ liệu thật (đội chưa có tác nhân) — đo được tới đâu khai tới đó.
- Hàm ghép số nhiều — lát này có ít, gom vào bộ canh kho chuỗi.
- Bề rộng 360px — dùng lại chân của vòng trước qua ổ cắm, không dựng mới.

### Never

- Dịch cửa sổ trò chuyện — đợt sau, đã khai bằng tên sáu file.
- Dịch định danh kỹ thuật và tên chủ đề trình bày mã — chúng là khoá, không phải chữ.
- Dựng luồng OAuth thật để mở trạng thái Slack đã cắm — ngoài phạm vi, như ba vòng trước.

### Cross-cutting áp mọi ô Core

- Dân số **sinh từ đĩa**, không gõ tay; mỗi miễn trừ phải có đối tượng thật.
- Mỗi phép đo mới có **cặp hai chiều** trên cùng một vật.
- **Không chép** thước của hai vòng trước — dùng lại qua `--lat` và ổ cắm.
- Sáu file hoãn phải nằm trong bản khai với lý do, không được biến mất lặng lẽ.

## Cách làm

Ba kho chuỗi mới dưới `apps/app/lib/messages/`, một kho một cụm — theo đúng khuôn
`en` / `type` / `vi satisfies` / `BANG` / `xMessages(locale)` của ba vòng trước:

| Kho | Cụm | Chuỗi |
|---|---|---|
| `agent-builder-khung.ts` | khung, thanh bên, trang chủ lát, danh sách đội | 36 |
| `agent-builder-tac-nhan.ts` | chi tiết, việc làm được, tạo mới, tạo kênh, lượt chạy | 122 |
| `agent-builder-ket-qua.ts` | bảng mã, kết quả, danh sách thoả thuận | 68 |

Ba kho thay vì một, vì một kho 226 chuỗi là file 600 dòng không ai soi được; và
vì đợt hai sẽ thêm kho của cửa sổ trò chuyện vào cùng thư mục.

**Từ vựng.** `CONTEXT.md` chưa có mục nào cho *tác nhân*, trong khi đó là danh từ
trung tâm của cả lát. Vòng này thêm mục — đúng điều `CLAUDE.md` đòi. Chữ dùng
theo tiền lệ đã ship, không đúc mới: **tác nhân** (12 chuỗi đã dùng),
**hội thoại** (`settings.ts`), **lượt chạy** (`CLAUDE.md`). *Manifest* giữ nguyên
tên thật. "Capability" hoá ra chỉ là khoá kỹ thuật — chữ người đọc là *việc làm được*.

**Bản khai lát** `_acceptance/agent-builder-noi-tieng-viet/rang/lat-agent-builder.json`:
mười thư mục/file, sáu file hoãn khai trong `khong_quet` kèm lý do, `them` cho
component dùng chung, và bốn con số neo lấy từ kiểm kê độc lập với luật quét.

**Thước:** không viết thước mới. Dùng `chu-cung-lat.mjs`, `moi-chuoi.mjs`,
`chu-ngoai-jsx.mjs`, `khai-sinh.mjs`, `man-that.mjs`, `dot-bien.mjs` của hai vòng
trước qua `--lat` và các ổ cắm `ab_*` mới trong `config.yaml`. Chân
`mot-bo-thuoc.mjs` của vòng trước canh việc chép — nếu vòng này chép một thân
hàm, nó đỏ.

## Giới hạn nhận trước

- Màn `/chat` lẫn hai thứ tiếng cho tới đợt hai. Khai bằng tên sáu file.
- Trạng thái cần Slack đã cắm hoặc cần đội có tác nhân thật sẽ không dựng được
  trên máy đo; đo tới đâu khai tới đó, không hạ xuống đọc mã rồi ghi đạt.
- `channel-picker` vẫn đọc kho chuỗi của khu vực Cài đặt. Vòng này dịch chữ
  **quanh** nó ở `agent-capabilities`, không tách kho — tách là việc riêng.
