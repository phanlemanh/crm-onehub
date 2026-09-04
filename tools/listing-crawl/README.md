# Bộ cào môi giới từ sàn — `tools/listing-crawl`

Đứng ngoài CRM. Đọc sơ đồ site của nhatot, tải trang hồ sơ môi giới, bóc bằng
khuôn CSS/JSON cố định, xếp mức sản lượng, rồi phát ra một lô JSON đúng lược đồ
`schemas/listing-ingest.schema.json`. Lô đó đi vào cổng
`POST /internal/listings/ingest` của API, hoặc ra tệp khi chạy `--dry-run`.

## Dựng

```bash
cd tools/listing-crawl
python3.13 -m venv .venv
./.venv/bin/pip install "crawl4ai==0.9.2" "lxml" "cssselect" "jsonschema" \
  "transformers<5" "sentence-transformers<6" "huggingface-hub<1"
./.venv/bin/python -c "from crawl4ai.__version__ import __version__; print(__version__)"
```

In ra `0.9.2` là xong. Máy này không có `python3.12`; `python3.13` đạt yêu cầu
tối thiểu (cần `tomllib`, có từ 3.11) và nằm trong dải `crawl4ai` khai báo hỗ trợ.

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
| `--dry-run` | ghi lô ra tệp thay vì gửi lên cổng |
| `--out PATH` | đường dẫn tệp lô |
| `--log PATH` | ghi nhật ký lượt chạy ra tệp |

Nhật ký ghi: số gieo, số lấy được, số bị chặn, số có số điện thoại, tứ phân vị
tin mới 30 ngày.

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

## Mẫu trong `tests/fixtures/`

**Cắt từ trang thật**, tải một lần ngày 2026-09-04 qua trình duyệt: trang danh bạ
`/chuyen-trang-moi-gioi-bat-dong-san-tp-ho-chi-minh` và một trang hồ sơ
`/moi-gioi-*`. Lớp CSS, thứ tự nút, và hình dạng `__NEXT_DATA__` giữ nguyên vì đó
là thứ khuôn bóc đọc.

Đã bỏ dữ liệu cá nhân thật: tên người là `Nguyễn Văn Mẫu`, số điện thoại
`0900000000`, địa chỉ trang `https://nhatot.com/moi-gioi-mau-1`, tên chuyên trang
`Chuyên trang mẫu`, số giấy phép `HCM-0000000`.

Hai con số đặt theo bài kiểm chứ không theo bản chụp, và nói ra ở đây để không ai
đọc mẫu như số liệu thị trường:

- thẻ đầu của danh bạ ghi `436` tin; trang thật hôm chụp ghi `435`.
- `company_ad` để `false`; hồ sơ thật hôm chụp là `true`. Mẫu là môi giới cá
  nhân, khớp với phía «cá nhân» của bộ đo.

`totalAdsCount` của mẫu là `436` để tổng tin tách khỏi tin mới 30 ngày (`164`) —
trên hồ sơ thật hai số đó trùng nhau và làm bài kiểm không phân biệt được.

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

Lộ số điện thoại chỉ chạy cho hồ sơ mức Cao và có trần `phone_reveal_cap`, vì đó
là bước đắt nhất và nhạy nhất — không lộ số của người không định gọi.

## Bài kiểm

```bash
cd tools/listing-crawl
./.venv/bin/python -m unittest discover -s tests -t . -v
```
