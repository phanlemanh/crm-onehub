# Review findings: don-ho-so-cu (round 1)

## Trong hợp đồng

- **E2 (dhc_lo) fails at HEAD: lo.json still lists slugs that xu-ly.json now marks as waiting on their owner's lane**
  file: `_acceptance/don-ho-so-cu/lo.json:1`
  severity: high
  AC: AC-2
  source: conventions
  detail: I ran `bun _acceptance/don-ho-so-cu/rang/kiem-lo.mjs` at HEAD. It exits 1 with: «KET LUAN: do — thua: ba-ho-so-do-san; thua: tat-preview-agent-okr». tapGhim (lo.mjs:6-12) leaves out every slug that has a `cho-lan-chu` row. xu-ly.json has those rows for both slugs: tat-preview-agent-okr E5/E6/E8/E10 and ba-ho-so-do-san E2/E3/... (decision d-20261020T233002Z-14). lo.json was never regenerated after those rows went in, so lot 1 still holds ba-ho-so-do-san and lot 2 still holds tat-preview-agent-okr. AC-2 says the set equals «... minus slugs with a cho-lan-chu row». So E2 cannot pass at Cổng Bằng chứng until lo.json, or the AC, is brought back into line.

- **E2 (kiem-lo) is red at HEAD: lo.json still lists two profiles that the ledger has since moved to «chờ làn chủ»**
  file: `_acceptance/don-ho-so-cu/lo.json:1`
  severity: high
  AC: AC-2
  source: bugs
  detail: I ran `bun _acceptance/don-ho-so-cu/rang/kiem-lo.mjs` at HEAD. It exits 1 with: `KET LUAN: do — thua: ba-ho-so-do-san; thua: tat-preview-agent-okr`. Cause: `tapGhim` (rang/lo.mjs:7-11) removes every slug that has a `cho-lan-chu` row in xu-ly.json. Commits 57def8a43 and 54b721357 added `cho-lan-chu` rows for tat-preview-agent-okr (E5/E6/E8/E10) and ba-ho-so-do-san (E2/E3/E7). Nobody regenerated lo.json afterwards, so lot 2 still contains tat-preview-agent-okr and lot 1 still contains ba-ho-so-do-san. Result: the AC-2 eval for this round cannot pass on the current tree, so any evidence or card that reports E2 green does not match HEAD. There are two possible fixes, and choosing between them is a judgment call: (1) regenerate lo.json with `rang/lo.mjs`, which changes the recorded lots after those lots have already run; (2) change the rule in `tapGhim`/AC-2 so that slugs which were in a lot when it ran are not counted as «thừa».

- **The «doi-loi-ac» guard only compares the first line of each AC, so edits to the rest of an AC go undetected**
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs:20`
  severity: medium
  AC: AC-5
  source: bugs
  detail: `dongAc` keeps only lines that match `/^- AC-\d+:/`. In this repo an AC's wording is wrapped across several indented continuation lines. Examples: AC-1 in _acceptance/khong-do-them-chay-gh/contract.md spans lines 34-37, and AC-2 and AC-5 in don-ho-so-cu/contract.md span 4 lines each. AC-5 promises that «lời mọi AC-n trong contract.md … không đổi so với gốc vòng» (the full wording of every AC stays unchanged). The check only proves the first line is unchanged. A `sua-thuoc` commit could rewrite the Then clause on a continuation line and `kiemSuaThuoc` would still pass. The self-test case (`docGia` edits `- AC-1: ` on the first line) does not catch this, because it only changes the first line. The comparison should cover each AC's full block (from the `- AC-n:` line up to the next `- AC-` line or section).

- **Hình dạng 3 (quan hệ giữa các giá trị bị đo lệch thời điểm): E2 đỏ trên cây hiện tại, vì tập mong đợi tính từ sổ xử lý viết SAU khi chia lô**
  file: `_acceptance/don-ho-so-cu/rang/kiem-lo.mjs:13`
  severity: high
  AC: AC-2
  source: measurement
  detail: Dòng 13 gọi `tapGhim(loGoc, chanTinhLai, xuLy)` với `xuLy` là xu-ly.json ở HEAD (dòng 30). tapGhim (lo.mjs:7,11) bỏ mọi slug có dòng `cho-lan-chu`. Nhưng lo.json được chia lô ở 9059a31a1 (20/10), còn các dòng cho-lan-chu chỉ được thêm vào sổ SAU khi làn của chính lô đó chạy đỏ (57def8a43, 54b721357, 21/10). Lời hứa của AC-2 là một quan hệ: lo.json = tập ghim tính từ dữ liệu có lúc chia lô. Thước lại so lo.json (đã đóng băng) với dữ liệu viết sau. Đã chạy `bun rang/kiem-lo.mjs` trên cây đang xét: thoát mã 1, in «KET LUAN: do — thua: ba-ho-so-do-san; thua: tat-preview-agent-okr». Cứ hồ sơ nào trong lô chạy đỏ rồi được xếp cho-lan-chu thì E2 tự đỏ, nên thước này không bao giờ xanh được khi vòng làm đúng nhiệm vụ của nó.

- **Hình dạng 3 (đo có mặt thay cho quan hệ): doiChieu chỉ xét dòng sổ CUỐI của mỗi slug**
  file: `_acceptance/don-ho-so-cu/rang/doi-chieu.mjs:7`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Dòng 7 viết `new Map(dong.map((d) => [d.slug, d]))`, nên với mỗi slug chỉ giữ dòng sau cùng. Sổ có nhiều dòng cho một slug là chuyện bình thường, vì mỗi dòng ứng với một eval: tat-preview-agent-okr có 4 dòng, ba-ho-so-do-san có 3. AC-3 hứa hai quan hệ: «đúng một dòng» với cách xử khác sua-thuoc, và hồ sơ có dòng sua-thuoc thì phải có pin đi sau commit_sua. Nếu một slug có dòng sua-thuoc mà sau nó là một dòng cách khác, mốc so pin rơi về `base` (dòng 14) và nhánh «sua-thuoc chua ghim» không bao giờ chạy. Số dòng mỗi slug cũng không được đếm. Ca tiêm «sua-thuoc-chua-ghim» (dòng 42) cố ý lọc bỏ mọi dòng khác của slug trước khi thêm, nên không phủ đúng tình huống này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Paths filter for E2 misses xu-ly.json and config.yaml, which kiem-lo actually reads, so evidence will not go stale when they change**
  Người dùng thấy gì: Khi sổ xử lý hoặc cấu hình đổi, bằng chứng của vòng dọn hồ sơ cũ không tự bị đánh dấu cũ, nên người đọc có thể tin một kết quả đã lệch với dữ liệu hiện tại.
  Căn cứ: Hậu quả chỉ là một kết quả xanh có thể đã lỗi thời mà không ai thấy, không mất dữ liệu, và gặp lại khi chạy đo lại thì tự lộ ra.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **kiem-lo.mjs and lo.mjs read xu-ly.json raw instead of going through the schema module next to them**
  Người dùng thấy gì: Nếu một dòng trong sổ xử lý sai hình dạng, một số bài kiểm âm thầm tính ra kết quả sai thay vì báo lỗi rõ ràng.
  Căn cứ: Sổ xử lý do người trong nhóm sửa và các bài kiểm khác đã bắt lỗi hình dạng, nên rủi ro thấp và lộ ra khi chạy lại.
  file: `_acceptance/don-ho-so-cu/rang/kiem-lo.mjs`
  severity: medium
  Đề xuất: known-limits

- **The constant NHANH_VONG is declared twice, and the hồ sơ slug is hardcoded outside chung.mjs**
  Người dùng thấy gì: Tên nhánh của vòng dọn hồ sơ được viết ở nhiều chỗ, nên sau này đổi tên nhánh phải sửa đủ các chỗ hoặc sẽ lệch.
  Căn cứ: Người dùng không thấy gì, bộ công cụ này chỉ sống trong vòng dọn một lần, nên sửa không đáng công.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (chỉ có ca âm, không đối chứng dương): E5 chưa lần nào thấy một dòng sua-thuoc hợp lệ qua được kiemSuaThuoc**
  Người dùng thấy gì: Bài kiểm sửa thước mới chỉ thử các ca phải bị từ chối, nên có thể nó từ chối cả những bản sửa đúng mà vẫn báo xanh.
  Căn cứ: Hiện chưa có bản sửa thước nào trong sổ, nên chưa ai bị chặn oan, và gặp ca đầu tiên là lộ ngay.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): duong_tinh.ma và tiem_do.ma lấy từ chính sổ xử lý, không đọc từ nhật ký**
  Người dùng thấy gì: Kết quả lượt đối chứng của một bản sửa thước có thể do người ghi tay mà vẫn được chấp nhận, không được đối chiếu với nhật ký thật.
  Căn cứ: Chỉ chủ kho và nhóm tin cậy ghi sổ này, và người ký Cổng Bằng chứng còn xem lại, nên rủi ro cố ý lách thấp.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): ảnh chụp vong_ky_cho_gop không được dựng lại hay đối chiếu**
  Người dùng thấy gì: Danh sách các vòng đã ký đang chờ gộp được tin theo lời khai trong sổ, có thể ghi rỗng để bỏ qua bước hỏi làn chủ.
  Căn cứ: Hậu quả tối đa là một câu hỏi đáng ra phải gửi không được gửi, và làn chủ vẫn thấy khi PR của mình bị đụng.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì lệnh thật): lenhCi grep workflow rồi chạy một lệnh chép tay**
  Người dùng thấy gì: Bài kiểm cổng gộp chạy một lệnh viết sẵn, nên nếu cách CI chạy đổi trong tương lai thì bài kiểm vẫn báo như thể giống CI.
  Căn cứ: Hiện lệnh vẫn giống nhau, và nếu CI đổi thì lệch lộ ra ở lần gộp PR thật mà không mất dữ liệu.
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (ca âm không ghim thông điệp): năm ca tiêm của E4 nhận BẤT KỲ lỗi nào**
  Người dùng thấy gì: Bài kiểm sổ xử lý coi một ca là bị bắt khi có lỗi bất kỳ, nên có thể ca bị bắt vì lý do khác với điều tên ca nói.
  Căn cứ: Không ảnh hưởng người dùng và lỗi chỉ làm bài kiểm kém chặt, sổ vẫn bị kiểm bằng dòng mẫu đúng.
  file: `_acceptance/don-ho-so-cu/rang/so-xu-ly.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
