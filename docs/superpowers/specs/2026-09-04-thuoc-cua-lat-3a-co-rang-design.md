# Thước của lát ③a có răng — thiết kế

Ngày 2026-09-04 · slug `thuoc-cua-lat-3a-co-rang` · T2 · không chạm giao diện.

## Vì sao mở vòng riêng thay vì vá tiếp trong ③a

S4 vòng 8 của `nhan-ung-dung-noi-tieng-viet` trả về 16 phát hiện đã xác nhận và
**không cái nào trong-hợp-đồng**. Chín cái nói về CÁI THƯỚC chứ không về sản
phẩm. Chúng tái xuất suốt vòng 5 → 8 vì một hợp đồng dịch thuật không có tiêu
chí nào phủ chính bộ đồ đo của nó: `contract.md` của ③a nói về chữ trên màn, nên
scope-triage xếp mọi lỗi của giàn đo ra ngoài hợp đồng, vòng nào cũng vậy.

Đây không phải đường vòng khỏi ③a. **Đây là thứ mở khoá Cổng 2 của ③a**: chín
trong mười sáu phát hiện chặn đường là các thước này, và vòng 8 sập trước khi có
verdict. Sửa thước xong thì ③a chạy vòng 9 trên một giàn đo nói được sự thật.

## Chín khiếm khuyết — đã đọc mã, không đọc báo cáo

| # | Vật | Dòng | Chuyện gì |
| --- | --- | --- | --- |
| 1 | `rang/khai-tieng.mjs` | 106–114 | `GIAI_DOAN` là hằng bảy chuỗi gõ tay. `MA_GIAI_DOAN` rút từ `deals.list` chỉ để in một dòng đếm. Chân kiểm `GIAI_DOAN.length !== 7` — một hằng đúng. |
| 2 | `rang/khai-tieng.mjs` | 150, 169 | `if (cho.length === 0) continue` — giá trị không hiện thì bỏ qua. Không hàng dữ liệu nào ⇒ `hong=0` ⇒ xanh. |
| 3 | `rang/may-chu-ve.sh` | 38 | `ANH=("Companies" "Contacts" "Deals")` khai rồi không dùng dòng nào. `grep -qF` là có-mặt; lời hứa là quan hệ. |
| 4 | `rang/no-vong-1.mjs` | 172–176 | Vắng ở CẢ HAI thứ tiếng ⇒ không tính hỏng. Và `NO[]` không ghim chuỗi Việt thay thế. |
| 5 | `rang/ban-ve.mjs` | 1027–1035 | `createElement("time")` rồi tự set `data-local-date-kind`, đúng khuôn bên đọc mong đợi. Không đi qua component viết. |
| 6 | `rang/ban-ve.mjs` | 639–641 | `khai = BE_MAT[man].length` — mẫu số là độ dài một mảng sửa được. Gỡ một bề mặt khỏi mảng thì `lech` vẫn 0, không ai biết. |
| 7 | `rang/du-lieu-bien.mjs` | cả file | Chỉ `fetch` tRPC đếm hàng. Không dòng nào mở trình duyệt. Chiều đỏ khai là chữ thời gian tương đối TRÊN MÀN. |
| 8 | `rang/dot-bien.mjs` | 100, 106, 216 | Chụp năm file lúc khởi động, `finally` ghi đè lại. Nuốt sửa đổi song song. Giữ năm file mã sản phẩm ở bản tiếng Anh ~10 phút mỗi lượt. |
| 9 | `apps/app/test/messages-guard.spec.ts` | 322–330 | `song()` khớp lá và cha RIÊNG RẼ trên chuỗi nối toàn bộ `.ts`/`.tsx` của `apps/app`. `coTen("person")` khớp `.person` ở bất kỳ đâu ⇒ `deal.person` sống. Bài tự kiểm dùng `khongAiGoiKhoaNay` — không bao giờ chạm đường đụng-tên. |

## Một sửa lại của đề bài

Đề bài nói cả chín cùng một hình: xanh được mà không đỏ được. **Tám cái đúng
vậy. Cái thứ tám — `dot-bien.mjs` — thì không.** Nó đỏ được, và đã đỏ thật.
Bệnh của nó là **bán kính nổ**: nó ăn mất bản sửa chưa commit, và nó giữ năm file
mã sản phẩm ở bản tiếng Anh trong mười phút mỗi lượt, cửa sổ mà bốn cổng máy vẫn
xanh vì bản tiếng Anh đúng kiểu.

Khác bệnh thì khác thuốc. Bảy cái kia chữa bằng cặp hai-chiều. Cái này chữa bằng
cách khoanh vùng: nó không được chạm file nào ngoài bản sao của chính nó. Nhập
nó vào cùng khuôn là kê nhầm thuốc.

## Trục và cách quét

Preset `test-matrix` có trục hình dạng sản phẩm (surface, role, trạng thái dữ
liệu, mạng). Chủ ngữ ở đây là **giàn đo**, nên trục dựng lại từ đầu; giữ lại
đúng một điều của preset: **thước CE là lịch sử lỗi** — mỗi lỗi vòng trước bỏ
sót là một giá trị trục đã bị sót, đưa ngược vào trục. Ở đây lịch sử lỗi là
chính bốn vòng 5 → 8.

**Trục A — vì sao nó xanh được** (MECE trên câu hỏi "cái gì làm nó xanh"):
hằng-đúng (tập quan sát rỗng hoặc tự cấp) · nửa-quan-hệ (chỉ kiểm một vế) ·
fixture-nặn-sẵn (vật đo do bên đọc nặn) · sai-vật-đo (đo vật khác vật đã hứa) ·
bán-kính-nổ (đỏ được, nhưng làm hỏng cây làm việc).

**Trục B — véc-tơ phá vật**: lật ngôn ngữ (phục vụ cùng trang ở `lang=en`) ·
sửa kho chuỗi trong bản sao · rút hàng dữ liệu để dựng tập rỗng · đổi enum máy
chủ · **không phá được** (⇒ ứng viên xoá).

**Trục C — nơi cặp hai chiều sống**: trong bài kiểm `bun test` (rẻ, không cần
máy chủ) · trong chính chân đo (`--chan pha-thu`) · cần máy chủ sống + Chrome ·
cần cây sao riêng.

Trục B là quyết định kỹ thuật gánh nặng nhất. Bốn thước hứa "màn tiếng Việt";
với chúng, cú phá rẻ nhất mà vẫn thật là **phục vụ đúng trang đó ở `lang=en`** —
cùng máy chủ, cùng tuyến, đổi đúng một biến đang đo. Không cần cây sao, không
cần sửa file nào. Thước nào không đỏ trước cú đó thì nó chưa từng đo gì.

## Kiến trúc: một sổ khai sinh, một chân canh sổ

Luật khai sinh cấm lời khai tĩnh: cặp hai chiều phải **tự chạy lại được mỗi
CI**. Ghi "đã phá thử rồi, nó đỏ" vào `evidence-report.md` là đúng thứ luật gọi
là mục nát và điền-cho-có.

Nên vật giao của vòng này không phải bảy bản vá rời, mà là:

- `rang/khai-sinh.json` — **sổ khai sinh**. Mỗi thước một mục: tên chân, véc-tơ
  phá, thông điệp ghim mong đợi ở nhánh đỏ, và mã thoát mong đợi.
- `rang/khai-sinh.mjs` — **chân canh sổ**. Với từng mục: chạy chân ở chiều
  lành (phải xanh), áp véc-tơ phá, chạy lại (phải đỏ VÀ in đúng thông điệp
  ghim), rồi trả vật về nguyên trạng. Đỏ nếu bất kỳ chiều nào không lật.
- **Bánh cóc hai chiều trên chính sổ**: một chân bị `evals.yaml` của ③a trỏ tới
  mà vắng mục trong sổ ⇒ đỏ, gọi tên chân. Một mục trong sổ trỏ tới chân không
  còn tồn tại ⇒ đỏ, gọi tên mục. Thiếu chiều thứ hai thì sổ là cửa sau: thêm một
  dòng là tắt được một phép đo, vĩnh viễn, không ai biết.

Chân canh sổ tự nó cũng cần khai sinh, và nó có: gỡ nhánh đỏ của một chân bất kỳ
thì `khai-sinh.mjs` phải đỏ và gọi tên chân đó.

## Bảy bản vá, mỗi cái một câu

1. **`khai-tieng.mjs` — enum thật.** Bảy giá trị giai đoạn rút từ `deals.list`
   của máy chủ. Máy chủ có giá trị mà danh sách không có ⇒ đỏ, gọi tên giá trị.
   Danh sách gõ tay biến mất.
2. **`khai-tieng.mjs` — tập rỗng là từ chối.** Giá trị không hiện ra không còn
   là `continue`. Không quan sát được gì ⇒ **exit 2** kèm tên tập rỗng, không
   phải exit 0.
3. **`may-chu-ve.sh` — quan hệ hai vế.** `ANH[]` thôi nằm không: tiếng Việt có
   mặt **VÀ** chuỗi tiếng Anh vắng mặt trong lượt về đầu. Thấy tiếng Anh ⇒ đỏ,
   in ra chuỗi tìm thấy.
4. **`no-vong-1.mjs` — ghim bản dịch.** Mỗi mục trong `NO[]` mang chuỗi Việt
   thay thế. Vắng ở cả hai thứ tiếng thôi được tính là đã dịch: nó là **không
   đo được**, không phải đạt.
5. **`ban-ve.mjs` — `<time>` của sản phẩm.** Đọc phần tử `<time>` mà trang thật
   vẽ ra, không dựng bằng `createElement`. Trang không vẽ ra cái nào ⇒ exit 2.
6. **`ban-ve.mjs` — bánh cóc bề mặt.** Mẫu số thôi là `BE_MAT[man].length`. Đếm
   bề mặt trang **mời ra** (nút mang `aria-haspopup`), so với bản khai; trang
   mời một bề mặt mà bản khai không có ⇒ đỏ, gọi tên. Đây là luật "liệt cái
   được phép + bánh cóc hai chiều" của mục 4 luật khai sinh.
7. **`du-lieu-bien.mjs` — đọc màn.** Ba trạng thái biên đọc chữ trên màn. Phần
   đếm hàng cơ sở dữ liệu ở lại nhưng đổi vai: **tiền đề, exit 2**, không phải
   một phép đo đạt. Đây cũng là chỗ bịt lỗ mà `handoff.md` gọi tên — cơ sở dữ
   liệu rỗng giữa vòng 7 và 8 mà không phép đo nào thấy.
8. **`messages-guard.spec.ts` — đường đầy đủ.** Một khoá sống khi đường đầy đủ
   có mặt tại một chỗ gọi, không phải khi tên lá trùng một từ phổ thông ở đâu
   đó. Bài tự kiểm chạy đúng đường đụng-tên: một khoá có lá trùng từ thật trong
   mã phải bị gọi là chết.
9. **`dot-bien.mjs` — khoanh vùng.** Không chạm file nào ngoài bản sao của
   chính nó. Bản sửa chưa commit làm giữa lượt chạy phải sống sót.

## Bản khai miễn trừ — chỗ không ai canh

Quét tìm ra một ô không nằm trong chín cái: **ba bản khai miễn trừ trong giàn
đo, không cái nào có bánh cóc.**

- `messages-guard.spec.ts` — `KHONG_DAU`, **29** dòng khoá được miễn dấu tiếng Việt.
- `rang/dot-bien-sot.txt` — **289** dòng khoá, trong khi dòng đầu file tự khai
  `275/531`. Bản khai và nội dung của nó đã lệch nhau 14 dòng.
- `rang/khong-may-quet.sh` — hai khối `case`, **9 tên** được miễn kiểm.

**Một trong chín tên đó đã chết sẵn hôm nay:** `viet-tat.ts` được miễn trong
`khong-may-quet.sh` của ③a, nhưng file đó sống ở `_acceptance/tieng-viet-cho-crm/rang/`
— thư mục của vòng khác — và vòng lặp của chân chỉ duyệt `*.mjs` và `*.sh`, nên
dòng miễn trừ ấy chưa từng có một hit nào. Nó nằm trong chính cái chân vừa được
sửa ở `dc70600`.

Đó là chiều đỏ của AC-9, có sẵn, không cần dựng: chạy bánh cóc lần đầu là nó đỏ.

Thêm một dòng vào bất kỳ bản khai nào là tắt một phần phép đo, vĩnh viễn, không
dấu vết. Luật khai sinh mục 4 đòi bánh cóc hai chiều: **dòng miễn trừ không còn
hit thật cũng phải ĐỎ.** Vòng này áp nó cho cả ba.

## Ngoài phạm vi

- **Không đổi chuỗi sản phẩm.** Bản dịch đã xong và đang xanh. Nếu một thước sau
  khi có răng phát hiện chuỗi thật còn thiếu, nó đi vòng ③a vòng 9, không đi đây.
- **Không đụng `khong-may-quet.sh` lần nữa** ngoài việc thêm bánh cóc cho khối
  `case`. Nhánh đỏ của nó đã chứng minh ở `dc70600`; mở lại là lật một quyết
  định đã chốt.
- **Không thay giàn đo bằng khung đột biến có sẵn** (Stryker, PIT, mutmut).
  Chúng đột biến MÃ rồi chạy bài kiểm đơn vị. Giàn này đo một ứng dụng đang
  chạy, hai thứ tiếng, qua trình duyệt. Sai công cụ. Cắt ở đây để khỏi bàn lại.
- **Không mở rộng sang giàn đo của vòng ① và ②** (`tieng-viet-cho-crm/rang-*`,
  `bo-dung-chung-nhan-chuoi/rang-goc-*`). Cùng bệnh là chuyện gần như chắc,
  nhưng lát này khoanh đúng chín cái vòng 8 gọi tên.

## Hệ quả phải nói trước

Vòng này sửa `apps/app/test/messages-guard.spec.ts` — một file NGOÀI
`_acceptance/`. Lưới kiểm hiệu lực sẽ gọi bằng chứng của ③a là STALE và ③a phải
chạy vòng 9. Cái giá đó gần bằng không: vòng 8 của ③a sập trước khi có verdict,
nên không có bằng chứng nào để mất.

Và một cái giá thật: **một chân có răng thì nó cắn.** Nhiều khả năng vòng 9 của
③a sẽ đỏ ở chỗ vòng 8 xanh. Đó là điều vòng này tồn tại để làm.
