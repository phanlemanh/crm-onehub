## Trong hợp đồng

- **Cổng gộp miễn MỌI vi phạm của don-ho-so-cu, rộng hơn quyết định d-23 và trái AC-9 «lưới sạch»**
  AC: AC-9
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs:20`
  severity: medium
  source: conventions
  detail: Quyết định d-20261022T001939Z-23 chỉ cần miễn một vi phạm tự sinh: «status=implemented but no evidence-report.md» trước khi lượt chấm ghi báo cáo. Nhưng `chayCi` coi lượt chạy là sạch hễ mọi dòng `VIOLATION [` đều mang `[don-ho-so-cu]` (`chiCuaVong`), bất kể nội dung. Cụ thể, các vi phạm thật của chính hồ sơ cũng được miễn: «committed evidence fails re-check» (recheck: strict), «evidence is stale», hay lỗi frontmatter/chữ ký. Từ lượt 2, evidence-report.md đã nằm trong cây ở HEAD, nên miễn trừ này không còn che vi phạm «thiếu báo cáo» mà lại che đúng loại vi phạm bằng chứng cũ hay hỏng. Ngoài ra `chayCi` dùng chung cho các nhánh lô, nên miễn trừ cũng áp vào nhánh lô, trong khi evals.yaml E9 vẫn ghi «dat khi clean» cho nhánh lô. AC-9 đã ký nói «Then lưới sạch». Nên siết điều kiện vào đúng thông điệp `no evidence-report.md`, hoặc chỉ áp khi HEAD chưa có evidence-report.md, và không áp cho nhánh lô.
  rationale: AC-9 đòi lưới sạch trên HEAD và mọi nhánh lô khi chạy như CI; thước coi là sạch cả khi lưới thật chặn gộp, nên làm AC-9 không được đo đúng.

- **Đối chiếu nhận nhiều dòng sổ cho một hồ sơ, trong khi AC-3 đã ký ghi «có đúng một dòng»**
  AC: AC-3
  file: `_acceptance/don-ho-so-cu/rang/doi-chieu.mjs:20`
  severity: low
  source: conventions
  detail: Lượt này đổi `doiChieu` và E3 sang «một slug có thể nhiều dòng»: chỉ cần ít nhất một dòng khác `sua-thuoc` là tính `trongSo++`. Nhưng AC-3 trong contract.md (dòng 51–54) vẫn ghi hồ sơ phải «có đúng một dòng trong sổ xử lý với cách xử khác `sua-thuoc`». Sổ thật đã có bốn dòng `cho-lan-chu` cho `tat-preview-agent-okr` (một dòng mỗi eval), nên eval và hợp đồng đang nói hai điều khác nhau mà không có dòng quyết định nào ghi lại chỗ lệch này. Quyết định d-22 chỉ nói về việc dòng `sua-thuoc` bị đè. Cần chọn một trong hai: sửa lời AC-3 theo đường sửa hợp đồng, hoặc thước phải bắt số dòng.
  rationale: AC-3 ghi rõ «đúng một dòng trong sổ xử lý», còn thước và sổ thật chấp nhận nhiều dòng cho một hồ sơ, nên thước lệch lời AC.

- **cong-gop.mjs: the self-dossier bypass hides every violation for don-ho-so-cu. The latest HEAD run masks verdict=REJECT, not a missing report**
  AC: AC-9
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs:20`
  severity: low
  source: bugs
  detail: chayCi now returns clean:true whenever every VIOLATION line belongs to SLUG (lines 20-22). It does not check what the violation says. Decision d-...-23 and the E9 text in evals.yaml justify the bypass with one case: the dossier has no evidence-report.md yet while S4 runs. That case no longer holds. Commit 3abd81660 committed evidence-report.md with verdict REJECT. The current .acceptance-runs/don-ho-so-cu/cong-gop/head.log (07:38, after that commit) has exactly one VIOLATION: `VIOLATION [don-ho-so-cu]: verdict=REJECT (must be PASS to merge)`, and the run ends with `pre-merge-check: 1 violation(s) — merge blocked`. Run on that output, chayCi returns clean:true, so E9 goes green with the suffix «(chi ho so dang cham don-ho-so-cu)», but the same command in CI blocks the merge. pre-merge-check.sh also hits `continue` after the first violation of a slug. Its later checks on this dossier never run: Gate 1 approval, signoff, staleness and recheck. So for its own dossier E9 measures nothing, not just one known missing-report case. AC-9 says «lưới sạch», but the gate passes on output that ends in «merge blocked». To limit the bypass to the stated case, match the exact text `VIOLATION [don-ho-so-cu]: status=implemented but no evidence-report.md` instead of the `VIOLATION [${SLUG}]` prefix.
  rationale: Cùng lỗi miễn trừ quá rộng: HEAD thật in «merge blocked» mà thước báo sạch, nên AC-9 «lưới sạch» không được chứng minh.

- **Hình dạng 3 (đo có mặt thay cho quan hệ): cổng gộp E9 coi HEAD là «clean» khi mọi lỗi đều thuộc hồ sơ don-ho-so-cu, kể cả lỗi verdict=REJECT**
  AC: AC-9
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs:21`
  severity: high
  source: measurement
  detail: AC-9 hứa một quan hệ: trên HEAD và đầu mỗi nhánh lô, kết luận của lưới khi chạy như CI phải là sạch. Từ vòng này, dòng 20-22 không còn so kết luận đó. Thước chỉ tìm xem có dòng `VIOLATION [` nào của hồ sơ khác không: `chiCuaVong = cuoi !== "pre-merge-check: clean" && viPham.length === 0 && text.includes("VIOLATION [don-ho-so-cu]")`, rồi trả `clean: true`. Lời lý giải trong evals.yaml (E9) là «hồ sơ đang chấm chưa có báo cáo bằng chứng lúc S4 chạy». Nhưng bộ lọc miễn MỌI loại vi phạm của slug này, không chỉ dòng `status=... but no evidence-report.md` (pre-merge-check.sh:1250). Nó miễn cả `verdict=REJECT`, `approved_by is empty`, `evidence is stale` và thiếu gap-probe. Tôi đã chạy `bash scripts/pre-merge-check.sh . --base origin/onehub` trên HEAD 3abd81660: exit 1, với `VIOLATION [don-ho-so-cu]: verdict=REJECT (must be PASS to merge)` và `pre-merge-check: 1 violation(s) — merge blocked`. evidence-report.md đã có, nên tiền đề «chưa có báo cáo» không còn đúng. Dù vậy chayCi vẫn trả clean, và cong-gop in «HEAD: pre-merge-check: 1 violation(s) — merge blocked (chi ho so dang cham don-ho-so-cu)», trong khi CI chặn gộp. Cùng bộ miễn trừ này cũng áp cho từng nhánh lô (dòng 36). Ca đo duy nhất (`cham-ho-so-cu`) dùng một hồ sơ khác slug này, nên không có ca nào chứng được rằng một vi phạm của chính don-ho-so-cu, ngoài lỗi thiếu báo cáo, vẫn làm thước đỏ.
  rationale: AC-9 hứa kết luận của lưới là sạch trên HEAD và nhánh lô; thước chỉ kiểm có dòng vi phạm của hồ sơ khác hay không, nên AC-9 thất bại về quan hệ được hứa.

- **Hình dạng 3 (đo có mặt thay cho quan hệ): doi-chieu đếm «lượt ghim xanh» theo việc có một dòng repin, không đọc evals_exit/suites_exit**
  AC: AC-3
  file: `_acceptance/don-ho-so-cu/rang/doi-chieu.mjs:19`
  severity: medium
  source: measurement
  detail: AC-3 hứa: dòng repin trên onehub có sha là hậu duệ của gốc vòng VÀ «mọi eval máy đạt». Dòng 17 (`sua.every(... pins.some((p) => laHauDue(d.commit_sua, p.sha)))`) và dòng 19 (`pins.some((p) => laHauDue(base, p.sha))`), cả hai sửa ở vòng này, chỉ xét quan hệ tổ tiên của sha. pinTren (chung.mjs:96-107) chỉ giữ {run_id, sha} và bỏ `evals_exit` cùng `suites_exit` mà dòng repin có ghi. Dòng 31 in ra «<x> co luot ghim xanh» nhưng không kiểm màu xanh nào. Đây không phải ca giả định: tôi đếm trên origin/onehub có 20/961 dòng repin mang eval hay suite exit khác 0, ví dụ `repin-20261015T155515Z-64170` có `E24: 1`. Các dòng repin trong vòng của các hồ sơ trong lo.json hiện đều xanh, nên kết quả hôm nay chưa sai. Nhưng một lượt ghim đỏ đè lên sau gốc vòng vẫn sẽ được tính là «ghim xanh». Ba ca đo (bo-pin, sua-thuoc-chua-ghim, sua-thuoc-sau-dong-khac) không ca nào tiêm một dòng repin có evals_exit đỏ, nên chỗ hở này không được ca đo nào phủ.
  rationale: AC-3 đòi dòng repin có «mọi eval máy đạt», nhưng thước chỉ xét quan hệ tổ tiên của sha và không đọc kết quả eval.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Paths filter for E2 misses xu-ly.json and config.yaml, which kiem-lo actually reads, so evidence will not go stale when they change (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi sổ xử lý hoặc cấu hình đổi, bằng chứng của vòng dọn hồ sơ cũ không tự bị đánh dấu cũ, nên người đọc có thể tin một kết quả đã lệch với dữ liệu hiện tại.
  Căn cứ: Hậu quả chỉ là một kết quả xanh có thể đã lỗi thời mà không ai thấy, không mất dữ liệu, và gặp lại khi chạy đo lại thì tự lộ ra.
  file: `_acceptance/don-ho-so-cu/evals.yaml`
  severity: high
  Đề xuất: known-limits

- **kiem-lo.mjs and lo.mjs read xu-ly.json raw instead of going through the schema module next to them (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu một dòng trong sổ xử lý sai hình dạng, một số bài kiểm âm thầm tính ra kết quả sai thay vì báo lỗi rõ ràng.
  Căn cứ: Sổ xử lý do người trong nhóm sửa và các bài kiểm khác đã bắt lỗi hình dạng, nên rủi ro thấp và lộ ra khi chạy lại.
  file: `_acceptance/don-ho-so-cu/rang/kiem-lo.mjs`
  severity: medium
  Đề xuất: known-limits

- **The constant NHANH_VONG is declared twice, and the hồ sơ slug is hardcoded outside chung.mjs (r1 · tệp đã đổi)**
  Người dùng thấy gì: Tên nhánh của vòng dọn hồ sơ được viết ở nhiều chỗ, nên sau này đổi tên nhánh phải sửa đủ các chỗ hoặc sẽ lệch.
  Căn cứ: Người dùng không thấy gì, bộ công cụ này chỉ sống trong vòng dọn một lần, nên sửa không đáng công.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (chỉ có ca âm, không đối chứng dương): E5 chưa lần nào thấy một dòng sua-thuoc hợp lệ qua được kiemSuaThuoc (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm sửa thước mới chỉ thử các ca phải bị từ chối, nên có thể nó từ chối cả những bản sửa đúng mà vẫn báo xanh.
  Căn cứ: Hiện chưa có bản sửa thước nào trong sổ, nên chưa ai bị chặn oan, và gặp ca đầu tiên là lộ ngay.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): duong_tinh.ma và tiem_do.ma lấy từ chính sổ xử lý, không đọc từ nhật ký (r1 · tệp đã đổi)**
  Người dùng thấy gì: Kết quả lượt đối chứng của một bản sửa thước có thể do người ghi tay mà vẫn được chấp nhận, không được đối chiếu với nhật ký thật.
  Căn cứ: Chỉ chủ kho và nhóm tin cậy ghi sổ này, và người ký Cổng Bằng chứng còn xem lại, nên rủi ro cố ý lách thấp.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 (đo lời khai thay vì đầu ra): ảnh chụp vong_ky_cho_gop không được dựng lại hay đối chiếu (r1 · tệp đã đổi)**
  Người dùng thấy gì: Danh sách các vòng đã ký đang chờ gộp được tin theo lời khai trong sổ, có thể ghi rỗng để bỏ qua bước hỏi làn chủ.
  Căn cứ: Hậu quả tối đa là một câu hỏi đáng ra phải gửi không được gửi, và làn chủ vẫn thấy khi PR của mình bị đụng.
  file: `_acceptance/don-ho-so-cu/rang/sua-thuoc.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì lệnh thật): lenhCi grep workflow rồi chạy một lệnh chép tay (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm cổng gộp chạy một lệnh viết sẵn, nên nếu cách CI chạy đổi trong tương lai thì bài kiểm vẫn báo như thể giống CI.
  Căn cứ: Hiện lệnh vẫn giống nhau, và nếu CI đổi thì lệch lộ ra ở lần gộp PR thật mà không mất dữ liệu.
  file: `_acceptance/don-ho-so-cu/rang/cong-gop.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (ca âm không ghim thông điệp): năm ca tiêm của E4 nhận BẤT KỲ lỗi nào (r1)**
  Người dùng thấy gì: Bài kiểm sổ xử lý coi một ca là bị bắt khi có lỗi bất kỳ, nên có thể ca bị bắt vì lý do khác với điều tên ca nói.
  Căn cứ: Không ảnh hưởng người dùng và lỗi chỉ làm bài kiểm kém chặt, sổ vẫn bị kiểm bằng dòng mẫu đúng.
  file: `_acceptance/don-ho-so-cu/rang/so-xu-ly.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
