# Bộ cào môi giới từ sàn — `tools/listing-crawl`

Đứng ngoài CRM. Đọc sơ đồ site của nhatot, tải trang hồ sơ môi giới, bóc bằng
khuôn CSS/JSON cố định, xếp mức sản lượng, rồi phát ra một lô JSON đúng lược đồ
`schemas/listing-ingest.schema.json`. Lô đó đi vào cổng
`POST /internal/listings/ingest` của API. Lô luôn ra tệp trước khi gửi; với
`--dry-run` thì dừng ở tệp.

## Dựng

```bash
cd tools/listing-crawl
python3 -m venv .venv
./.venv/bin/pip install "crawl4ai==0.9.2" "lxml" "cssselect" "jsonschema" \
  "transformers<5" "sentence-transformers<6" "huggingface-hub<1"
./.venv/bin/python -c "from crawl4ai.__version__ import __version__; print(__version__)"
```

In ra `0.9.2` là xong. `python3` của máy cần từ 3.12 trở lên (`pyproject.toml`;
`tomllib` có từ 3.11); máy hiện chạy 3.14.

Bộ kiểm và lượt chạy trên mẫu (`--fixtures`) chỉ cần `lxml`, `cssselect`,
`jsonschema`. `scripts/dung-venv.sh` dựng `.venv` với đúng ba gói đó khi cây chưa
có, và hai phép đo E17, E22 của hồ sơ `tiep-thi-tuyen-doi-tac` gọi nó trước. Lượt
cào thật vẫn cần đủ các gói ở trên.

## Chạy

```bash
cd tools/listing-crawl
./.venv/bin/python -m listing_crawl --fixtures --dry-run --out /tmp/probe-batch.json
./.venv/bin/python -m listing_crawl --limit 50 --dry-run --out /tmp/that-batch.json
./.venv/bin/python -m listing_crawl --limit 200 --log /tmp/crawl.log
```

| Cờ | Việc |
|---|---|
| `--limit N` | trần số địa chỉ gieo. `--limit 0` thoát mã 2. |
| `--fixtures` | chạy trên mẫu đã lưu trong `tests/fixtures/`, không ra mạng |
| `--dry-run` | ghi lô ra đĩa rồi dừng, không gửi lên cổng |
| `--out PATH` | đường dẫn gốc của tệp lô. Nhiều lô thì thành `PATH-001`, `PATH-002`… |
| `--log PATH` | ghi nhật ký lượt chạy ra tệp |
| `--redact` | che danh tính trước khi ghi lô và nhật ký; chỉ đi cùng `--dry-run` |

## Chia lô, và lô nằm trên đĩa trước khi gửi

Một lượt cào không gửi trọn kết quả trong một yêu cầu. `[ingest] batch_size`
trong `config.toml` là số mục mỗi lô; bộ cào hạ nó xuống trần của lược đồ
(500 mục) khi nó lớn hơn, rồi cắt tiếp bất kỳ lô nào vượt
`[ingest] body_limit_bytes` — trần thân yêu cầu thật của cổng
`/internal/listings`, 2 MiB. Hai con số phải khớp với
`LISTING_INGEST.bodyLimitBytes` ở `apps/api/src/listings/listings-config.ts`.

Mỗi lô ghi ra đĩa **trước** khi gửi. Lô gửi hỏng — 413, 403, 500, hay đứt mạng —
không kéo các lô khác xuống: bộ cào ghi rõ lô nào gửi xong, lô nào còn trên đĩa,
rồi thoát mã 1. Gửi lại chỉ cần các tệp đó, không cào lại.

Không có `--dry-run` thì lô vẫn ghi ra đĩa; `--out` chỉ đổi chỗ ghi, mặc định là
`batch.json` ở thư mục đang đứng.

## Bằng chứng luôn che danh tính

Mọi tệp lô và nhật ký đưa vào `_acceptance/**/evidence/` đều đã che danh tính.
Tên người, tên chuyên trang, số điện thoại và địa chỉ hồ sơ là dữ liệu cá nhân
của người ngoài đời; nó theo mọi bản sao của kho và lên máy chủ chung.

Chạy có cờ `--redact` thì bộ cào che ngay lúc ghi, cả lô lẫn nhật ký:

```bash
./.venv/bin/python -m listing_crawl --limit 50 --dry-run --redact \
  --out ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json \
  --log ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-run.log
```

Tệp đã có thì che sau bằng chính bộ luật đó — truyền nhiều tệp một lần để nhãn
ăn khớp giữa các tệp:

```bash
./.venv/bin/python -m listing_crawl.redact \
  ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-batch.json \
  ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-antibot-probe.log \
  ../../_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-run.log
```

`listing_crawl/redact.py` thay tên người bằng `Môi giới 01`, tên chuyên trang
bằng `Chuyên trang 01`, số điện thoại bằng `09xxxxxxxx`, địa chỉ hồ sơ bằng
`https://nhatot.com/moi-gioi-mau-01`. Nhãn khoá theo địa chỉ hồ sơ nên một môi
giới mang cùng một số ở mọi tệp, và chạy lại lần hai không đổi nhãn.

**Giữ nguyên mọi thứ đo được**: con số tin đăng, tin mới 30 ngày, địa bàn, tỉnh
thành, mức sản lượng, cờ chứng chỉ, cờ hình thái, và mọi dòng tổng kết của nhật
ký. Lô sau khi che vẫn hợp lược đồ. `tests/test_redact.py` ghim cả hai vế.

Nhật ký ghi **mọi lần thử của lượt chạy**, không chỉ lần cuối: `lan_thu` (tổng
lượt tải), `lan_thu_hong`, và tách theo việc — `lan_thu_so_do`, `lan_thu_danh_ba`,
`lan_thu_ho_so`, `lan_thu_lo_so`. Cạnh đó: `gieo`, `lay_duoc`, `bi_chan`,
`co_so_dien_thoai`, `tong_bang_tin_moi`, `tong_khac_tin_moi`, và tứ phân vị của
cả `tin_dang` lẫn `tin_moi_30_ngay`.

Sức khoẻ của mẫu cũng nằm trên dòng đó, để người đọc số biết mẫu có trải hết dải
hay không: `trang_danh_ba_doc` (số trang đọc được thẻ), `trang_danh_ba_rong`
(tải được mà không thẻ nào), `trang_danh_ba_hong` (không tải được, hoặc có thẻ mà
không đọc nổi), `bi_tran_cat` (chạm trần khi danh bạ còn người), và
`phan_bo_tang` — bảng đếm hồ sơ theo bốn mức Sản lượng.

Gieo địa chỉ: đọc sơ đồ site trước; rỗng thì lật trang danh bạ theo `?page=N`.
Vòng đọc dừng khi gặp `directory_stop_after_empty` trang LIÊN TIẾP không ra người
mới, hoặc khi chạm `directory_max_pages` — trần là lan can, không phải chính
sách. Trang không tải được KHÔNG tính vào phép đếm dừng, vì trang bị chặn cũng
«không ra người mới» và gộp hai thứ đó sẽ cắt cụt lượt cào giữa danh bạ mà không
cờ nào bật. Rồi rải mẫu đều theo bước cố định qua `listing_crawl/seed.py`.

Danh bạ nhatot xếp sản lượng giảm dần, nên dừng khi đủ trần đồng nghĩa lấy trọn
phần đầu bảng và bỏ hẳn mức Thấp với Ngủ. Đo ngày 08/09: 11 thẻ mỗi trang, danh
bạ sâu **ít nhất 93 trang** và đáy chưa chạm tới; tin hiện có giảm từ 458 xuống
1. Ở vùng trang sâu cứ bốn trang có một trang không tải được.

## Lược đồ là một chiều, không có bản chép tay

`schemas/listing-ingest.schema.json` **sinh** từ `packages/validation/src/listing-ingest.ts`:

```bash
cd packages/validation && bun run schema:listing-ingest ../../tools/listing-crawl/schemas/listing-ingest.schema.json
```

Đừng sửa tay tệp JSON đó. `tests/test_schema_ratchet.py` sinh lại từ nguồn và so
với bản đã commit; lệch là đỏ.

## Bốn cái bẫy đã cắn thật ở xưởng `~/dev/crawl`

Chép sang đây vì cả bốn đều áp cho bộ cào này.

**1. Ghim `transformers<5`, nâng mù là hỏng.** `crawl4ai[all]` không ghim trần
nên pip kéo về transformers 5.x, làm `model_loader.py` chết ở
`TypeError: BertModel.__init__() got an unexpected keyword argument 'resume_download'`.
Hỏng `CosineStrategy` và `crawl4ai-download-models`. Ba cái ghim đi cùng nhau:
`transformers<5`, `sentence-transformers<6`, `huggingface-hub<1`. Chạy
`pip install -U` mù sẽ làm hỏng lại. Kiểm bằng `./.venv/bin/pip check`.

**2. Chạy script từ trong `tools/listing-crawl`, không từ gốc kho.** Ở xưởng
`~/dev/crawl` có thư mục `crawl4ai/` không `__init__.py`, Python coi là namespace
package và che mất gói đã cài:
`ImportError: cannot import name 'AsyncWebCrawler' from 'crawl4ai' (unknown location)`.
Cùng một cái bẫy ở đây: `python -m listing_crawl` phải chạy với cwd là
`tools/listing-crawl`, vì `listing_crawl/` và `config.toml` tìm nhau theo đường
tương đối của gói.

**3. `r.success` nói dối với PDF.** Trong 0.9.2, `PDFCrawlerStrategy` trả
placeholder HTML 33 byte; `is_blocked()` thấy HTTP 200 + nội dung gần rỗng nên
kết luận bị chặn, `success=False` dù `r.markdown` đã đủ dữ liệu. Với PDF phải
đọc `r.markdown` chứ đừng tin `r.success`. Bộ cào này chỉ đọc HTML nên chưa
chạm bẫy, nhưng bất kỳ ai thêm đường PDF phải biết.

**4. Id mô hình đổi, và `success: true` + kết quả rỗng là chuyện có thật.** Máy
chủ mô hình ở xưởng do phiên khác quản; nó restart và đổi id mô hình giữa buổi,
litellm nuốt lỗi thành kết quả rỗng mà không báo. Bộ cào này **không gọi mô hình
ngôn ngữ ở vòng chạy** — chính vì lý do đó, cộng với chi phí. Bóc bằng khuôn
CSS/JSON cố định trong `listing_crawl/parse.py`; khuôn chỉ sửa khi sàn đổi giao
diện, và bài kiểm mẫu bắt lúc nó đổi.

## `.venv` không vào turborepo

Workspace của kho là `apps/*` và `packages/*`. `tools/` nằm ngoài, cố ý: không có
`package.json`, không task turbo, không cache. `.venv/` và `__pycache__/` đã vào
`.gitignore` ở gốc kho — đừng commit thư viện.

## Mẫu trong `tests/fixtures/` — rút bằng máy từ bản chụp, không viết tay

Ba mẫu (`directory.html`, `profile.html`, `profile-b.html`) do
`scripts/make_fixtures.py` **cắt ra từ bản chụp trang thật**. Script giữ nguyên
cây thẻ và khoá JSON của bản chụp; nó chỉ bỏ ảnh, `svg`, thuộc tính trình bày, và
thay dữ liệu cá nhân bằng giá trị giả. Không dòng cấu trúc nào gõ tay, nên mẫu
không thể vừa khít bộ chọn của bên đọc một cách giả tạo.

Chụp lại rồi rút lại:

```bash
cd tools/listing-crawl
./.venv/bin/python - <<'EOF'
import asyncio, sys
from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig
async def go(urls, out):
    run = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, check_robots_txt=True,
                           page_timeout=60000, delay_before_return_html=4.0)
    async with AsyncWebCrawler(config=BrowserConfig(headless=True, enable_stealth=True)) as c:
        for name, url in urls:
            r = await c.arun(url=url, config=run)
            open(f"{out}/{name}", "w").write(r.html)
            await asyncio.sleep(1.5)
asyncio.run(go([
    ("directory.html", "https://www.nhatot.com/chuyen-trang-moi-gioi-bat-dong-san-tp-ho-chi-minh"),
    ("profile-a.html", "https://nhatot.com/moi-gioi-<slug thứ nhất>"),
    ("profile-b.html", "https://nhatot.com/moi-gioi-<slug thứ ba>"),
], "/tmp/nhatot-capture"))
EOF
./.venv/bin/python scripts/make_fixtures.py --capture /tmp/nhatot-capture \
  --profiles profile-a.html profile-b.html --cards 0 2
```

`--cards 0 2` chọn đúng hai thẻ danh bạ ứng với hai hồ sơ đã chụp, để thẻ và hồ
sơ trong mẫu nói về cùng hai chuyên trang. Bài kiểm
`test_the_danh_ba_va_trang_ho_so_bao_cung_mot_tong_tin` đo đúng chỗ ghép đó.

Dữ liệu cá nhân đã thay, hình dạng giữ nguyên: tên người `Nguyễn Văn Mẫu` /
`Trần Thị Mẫu`, số điện thoại `0900000000` / `0900000001`, chuyên trang
`Chuyên trang mẫu` / `Chuyên trang mẫu hai`, đường dẫn
`https://nhatot.com/moi-gioi-mau-1` / `-mau-2`, số giấy phép `HCM-0000000`,
`alias` `aaaaaaaaaaaaaaa` / `bbbbbbbbbbbbbbb`.

**Mọi con số giữ nguyên như bản chụp** — 436 và 164 tin, `totalAdsCount` 436 và
164. Bản trước đây đặt `totalAdsCount` là `436` cạnh tin-mới-30-ngày `164` cho
«đẹp bài kiểm»; đó là mẫu tự dựng và nó che mất chuyện dưới đây.

`alias` cố ý khác `urls[0].url` trong mẫu, vì đó là hai trường khác nhau trên
trang thật: `alias` là chuỗi mờ (`pF1fW3hQ2EFvKyA`), `urls[0].url` là đường dẫn
người bấm được (`locnhapho`). Bản cũ dựng địa chỉ hồ sơ từ `alias` nên mọi địa
chỉ trong lô đều 404.

## Sàn chỉ công bố MỘT con số — tổng tin và tin mới 30 ngày trùng nhau

Đo ngày 2026-09-05 trên trang hồ sơ thật: sáu chuyên trang soi tay, rồi một lượt
chạy thật gieo 50 hồ sơ lấy được 49. **49/49 hồ sơ có tổng tin bằng tin mới 30
ngày** (`tong_khac_tin_moi: 0`, `_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-run.log`).
Bốn chỗ dưới đây **luôn bằng nhau** trên cùng một hồ sơ.

| Chỗ | Ví dụ |
|---|---|
| Thẻ danh bạ, «Xem N tin đăng» | 164 |
| Trang hồ sơ, ô «Tin hiện có · N tin» | 164 |
| Trang hồ sơ, ô đầu trang «N tin mới · Trong 30 ngày» | 164 |
| `__NEXT_DATA__` → `ads.totalAdsCount` và `ads.lastestAdInfo.paging.total` | 164 |

Nghĩa là **nhatot không có con số «tin mới 30 ngày» riêng**. Ô mang nhãn «Trong
30 ngày» hiện đúng số tin đang đăng. Bộ cào vì thế phát `listingsTotal` và
`listingsNew30d` bằng nhau, và `tier_of()` thật ra xếp bậc theo **tổng tin đang
đăng**, không theo độ tươi 30 ngày. Ngưỡng 60/20/1 phải đọc theo nghĩa đó.

Chỗ này **không được im**. Ba việc giữ nó nói ra:

- `parse.py` đọc hai số ở hai chỗ khác nhau (`_shown_total` đọc ô «Tin hiện có»,
  `_new_30d` đọc ô «Trong 30 ngày») và đối chiếu `listingsTotal` với
  `ads.totalAdsCount`; lệch là ném lỗi gọi tên trường.
- Bản tổng kết mỗi lượt chạy in `tong_bang_tin_moi` và `tong_khac_tin_moi`, và
  ghi một dòng cảnh báo khi có hồ sơ bằng nhau.
- `test_nhatot_chi_cong_bo_mot_con_so_cho_ca_hai_truong` ghim đúng lời khai này.
  Ngày sàn tách hai số ra, bài đó đỏ và người phải đọc lại mục này.

Lệnh tái lập: `./.venv/bin/python -m listing_crawl --limit 50 --dry-run --out /tmp/that.json`
rồi đếm `listingsTotal != listingsNew30d` trong tệp lô — hoặc đọc thẳng
`tong_khac_tin_moi` ở dòng tổng kết.

**Điều này phải lên bàn người quyết.** Lược đồ tiếp nhận có hai trường số, sàn
chỉ có một. Hoặc bỏ `tin_moi_30_ngay` và đổi tên ngưỡng theo tổng tin, hoặc tìm
nguồn khác cho độ tươi. Bộ cào không tự chế ra con số thứ hai.

## Sơ đồ site không có địa chỉ hồ sơ

Đo ngày 2026-09-04: `sitemap-index.xml` liệt kê 12 tệp con, không tệp nào chứa
địa chỉ `/moi-gioi-`. Địa chỉ hồ sơ chỉ xuất hiện trên trang danh bạ
`/chuyen-trang-moi-gioi-bat-dong-san-<tỉnh>` và trên trang tin đăng. Nên lượt gieo
đọc sơ đồ site trước; rỗng thì ghi cảnh báo và gieo từ `crawl.directory`.
`robots.txt` cho `Allow: /` và không cấm hai lớp đường dẫn này.

## Cloudflare chặn từ lượt tải THỨ HAI, không phải lượt đầu

Lượt chạy thật ngày 2026-09-04 trả 100% «Blocked by anti-bot protection:
Cloudflare JS challenge». Đo lại thì hình dạng lỗi rất riêng: **lượt tải đầu
trong một trình duyệt mới luôn qua**, mọi lượt sau trả 307 rồi 403 với trang
28 KB — trang đố JS của Cloudflare — kể cả khi giãn 1,5 giây giữa hai lượt. Nên
đây không phải chặn theo nhịp gọi; Cloudflare chấm dấu vết trình duyệt sau khi
đã thấy nó một lần.

Chữa bằng `enable_stealth = true` (khoá `[crawl].stealth` trong `config.toml`),
tức `BrowserConfig(enable_stealth=True)` — crawl4ai vá dấu vết bằng
`playwright-stealth` trên từng trang. Ba nhánh đo trên cùng 4 hồ sơ, cùng nhịp
1,5 giây, bằng chứng ở
`_acceptance/tiep-thi-tuyen-doi-tac/evidence/live-antibot-probe.log`:

| Nhánh | Lấy được | Bị chặn |
|---|---|---|
| A — như cũ, không tàng hình | 1/4 | 3/4 |
| B — `enable_stealth=True` | **4/4** | 0/4 |
| C — B cộng `simulate_user` + `override_navigator` + `magic` | 1/4 | 3/4 |

**Nhánh C làm hỏng lại nhánh B.** `override_navigator` ghi đè `navigator` bằng
đoạn vá thô của crawl4ai, đè lên bản vá tinh của `playwright-stealth` và để lại
dấu vết Cloudflare bắt được. Đừng bật ba cờ đó chung với tàng hình. Hồ sơ trình
duyệt thật (`user_data_dir`) và proxy chưa cần thử — nhánh B đã đủ.

## Tuân thủ

`check_robots_txt=True` bật cho mọi lượt tải.

`request_delay_seconds` giãn nhịp bằng `asyncio.sleep` thật trong `paced_fetch`.
Trước đây nó truyền vào `CrawlerRunConfig(mean_delay=...)`, mà `mean_delay`
**chỉ có tác dụng với `arun_many`** — vòng lặp `arun` tuần tự của bộ cào này bỏ
qua nó hoàn toàn, và thực đo là ~0,2 giây một lượt. Cấu hình khai 1,5 giây mà
máy chạy 0,2 giây là sai lời khai; nay đã đúng.

Lộ số điện thoại chạy cho những mức khai ở `phone_reveal_tiers`, và có trần
`phone_reveal_cap`. Cấu hình đang ship khai **đủ bốn mức** (`cao`, `vua`, `thap`,
`ngu`), vì đội tiếp thị cần gọi tuyển cả môi giới sản lượng thấp — nên một lượt
cào lộ tới `phone_reveal_cap` = 200 số điện thoại trải khắp bốn mức, không phải
chỉ mức Cao như trước 08/09. Đây là bước đắt nhất và nhạy nhất của lượt cào, và
trần là chỗ chặn chi phí DUY NHẤT.

Khi số hồ sơ đủ điều kiện vượt trần, tập được lộ số RẢI KHẮP lô chứ không lấy
phần đầu — lô xếp theo trang danh bạ mà sản lượng giảm dần, nên lấy phần đầu là
lộ số cho đúng nhóm đội tiếp thị đã có.

## Bài kiểm

```bash
cd tools/listing-crawl
./.venv/bin/python -m unittest discover -s tests -t . -v
```
