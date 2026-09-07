# Review findings — o-cam-chay-duoc-that

## Trong hợp đồng — máy đã sửa

- **AC-6 hứa sai** — "cả 16 lệnh phải mã 0". Chạy thật mới thấy hai ổ cắm trả mã khác 0 vì lý do ngoài vòng: `rang_suite_thu_tu` là một chân **chiều đỏ** vốn phải đỏ, và `tt_crawl_to_ingest` cần một venv Python không có trên máy. Đã đổi sang đo **quan hệ hai cây**: mã thoát phải khớp ý định tác giả tại SHA ghim. Bản mới mạnh hơn bản cũ.
- **Neo đếm sai** — tôi ghi tám ổ cắm thêm, thật ra chín. Chân E4 bắt được, không phải tôi tự thấy.
- **Chặng kiểm file của E1 cho hai dương tính giả** — khuôn đọc cắt `.json` thành `.js`, và tưởng đường sau `${CLAUDE_PLUGIN_ROOT}` là của kho. Và ý ban đầu sai: `--out foo.json` là **đầu ra**, không cần tồn tại trước. Đã thu hẹp: chỉ kiểm file được **trình thông dịch chạy**.
- **Mẫu của E9 sai thụt lề** — `resolveConfigKey` đi từ mức 0, mẫu của tôi bắt đầu ở mức 2 nên trả `null` cả bốn.

## Ngoài hợp đồng — người quyết ở Gate 2

- **`resolveConfigKey` bóc một ngoặc mà không hiểu thoát — đó là lỗ của BỘ KIT**
  Người dùng thấy gì: bất kỳ kho nào dùng bộ kit này đều có thể viết một giá trị ổ cắm hợp lệ YAML mà bộ kit đọc ra một chuỗi khác, rồi chạy một lệnh cụt. Kho này vừa mất 16 ổ cắm vì đúng điều đó, và không cổng nào thấy vì lệnh cụt vẫn "chạy" — nó chỉ đổ ngay ở dòng đầu.
  file: `lib/evidence-core.cjs`
  severity: P1
  Đề xuất: new-contract — `CLAUDE.md` bắt lỗi bộ kit đi chip riêng sang `~/dev/acceptance-gate-kit`; vòng này chỉ sửa dữ liệu ở kho cho vừa trình đọc đang có

- **Kho nay phải viết config theo một luật hẹp hơn YAML, và luật ấy chỉ sống trong một chân đo**
  Người dùng thấy gì: ai thêm một ổ cắm mới với giá trị chứa cả `"` lẫn `'` sẽ lại tạo ra một lệnh cụt. Chân E3 bắt được — nhưng chỉ khi có người chạy nó, mà nó không nằm trong năm lệnh chứng.
  file: `_acceptance/config.yaml`
  severity: P1
  Đề xuất: known-limits — đưa E3 vào một móc chạy mỗi lượt là việc của bộ kit hoặc của một vòng riêng; ghi lại để người thêm ổ cắm biết luật

- **16 ổ cắm ấy chưa bao giờ chạy được, mà các hồ sơ sở hữu chúng vẫn đã ký**
  Người dùng thấy gì: năm hồ sơ — trong đó có hồ sơ đã ký — mang những phép đo mà lệnh của chúng đổ ngay ở dòng đầu nếu giải qua `config:`. Vòng này làm chúng chạy được, nhưng không trả lời được câu "vậy lúc ký chúng đã đo bằng gì".
  file: `_acceptance/config.yaml`
  severity: P1
  Đề xuất: new-contract — truy lại xem các vòng ấy chạy phép đo bằng đường nào là một cuộc điều tra riêng, không phải việc của vòng sửa cú pháp

- **`api_khong_cache` vẫn là một ref hỏng**
  Người dùng thấy gì: `lenh-chung-khong-an-cache-doi/evals.yaml` trỏ tới một ổ cắm không tồn tại. Có trước vòng này, đã kiểm bằng bản backup. Thuộc lớp khác — khoá không tồn tại, không phải giá trị đọc lệch — nên vòng này khai ngoài phạm vi.
  file: `_acceptance/lenh-chung-khong-an-cache-doi/evals.yaml`
  severity: P2
  Đề xuất: known-limits — một dòng sửa, nhưng nó thuộc hồ sơ khác và cần biết ổ cắm đúng là cái nào
