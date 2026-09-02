---
schema_version: 2
feature_slug: tieng-viet-cho-crm
verdict: REJECT
failed_evals: [E6, E9, E12]
reason: Chín tiêu chí máy có bằng chứng hai chiều. E6 còn bốn chuỗi tiếng Anh, tất cả khoá cứng tại chỗ gọi trong apps/app, tức vòng ③. E9 trượt theo CÂU CHỮ và đạt theo CHẤT, vì AC-7 của vòng ② nay quy định đúng điều AC-9 cấm. E12 chia sau hai vòng hội đồng và tôi dừng sửa chữ thay vì vá lượt thứ ba. Ba chỗ đều cần người chọn.
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a9cb0201118f8f703ed5f8f855e2f25dd73df5aa
human_signoff:
---

# Báo cáo bằng chứng — vòng ①, vòng chấm 2

Ngày 2026-09-02, sau khi vòng ② ký Cổng 2. Cây ghim: `a9cb0201`, cộng các thay
đổi chưa commit liệt kê ở mục "Cây đo được là cây nào".

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E6 | AC-6 | ui-check | FAIL |
| E9 | AC-9 | ui-check | UNCERTAIN |
| E12 | AC-11 | judgment | UNCERTAIN |
| E1 | AC-1 | ui-check | PASS |
| E2 | AC-2 | ui-check | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-12 | ui-check | PASS |

Đổi so với vòng chấm 1: E6 từ 11 chuỗi tiếng Anh xuống **4**. E9 từ 2 tiêu đề bị
chém trần xuống **0**, nhưng câu chữ tiêu chí nay nghịch với tiêu chí vòng ② mà
người đã ký. E8 lộ ra vòng chấm 1 đã chấm **ĐẠT NHẦM**. E4 lộ ra ràng đã gãy từ
vòng ② và không ai chạy lại. E12 chấm lại sau khi năm nhãn đổi, hội đồng vẫn chia.

## Cây đo được là cây nào — và bốn lượt đo đầu đo nhầm cây

Máy chủ dev đang chạy ở `:3000` và `:3001` **chạy từ kho gốc
`/Users/manhphan/dev/crm`, không phải từ cây làm việc này.** Bốn lượt đo đầu của
phiên vì thế đo mã của một cây khác. Hai cây tình cờ cùng commit `a9cb0201` và
đều sạch, nên con số không sai — nhưng **đột biến thì không thể đo được**: kịch
bản sửa file ở cây này trong khi máy chủ đọc file ở cây kia, và mọi khoá đều báo
"lọt lưới".

Đã dựng máy chủ riêng từ cây này ở cổng `3100` và đo lại từ đầu. Mọi số trong
báo cáo này lấy từ cổng `3100`.

Đây đúng cái bẫy `handoff.md` đã cảnh báo, ở một hình dạng khác: không phải hai
phiên chấm ghi cùng một cây, mà một phiên chấm đọc nhầm cây.

**Thay đổi chưa commit trong cây lúc đo:**

- `apps/app/lib/messages/companies.ts` — năm nhãn cột
- `apps/app/components/local-date-time.tsx` — vùng cho định dạng ngày
- `CONTEXT.md` · `_acceptance/tieng-viet-cho-crm/{contract.md,decisions.jsonl}`
- `_acceptance/tieng-viet-cho-crm/rang-ngon-ngu.sh` — thêm một chiều đo
- `_acceptance/tieng-viet-cho-crm/rang/**` — giàn đo mới, không phải mã sản phẩm

## Phép đo AC-6: dựng màn thật hai lần, rồi trừ

Không dùng máy quét mã. Dùng lại giàn **chấm bản vẽ** của vòng ②, áp lên màn
hình thật: dựng `/crm/companies` hai lần — một lần `lang=vi`, một lần `lang=en`
— đọc mọi chữ người đọc thấy (nút chữ, chữ trong ô, `placeholder`, `title`,
`aria-label`, `aria-roledescription`, `alt`), rồi lấy phần **giống hệt nhau ở cả
hai thứ tiếng** và trừ đi dữ liệu.

Hai luật của vòng ② được thừa kế nguyên:

1. **Danh sách trung tính sinh ra, không viết tay.** 128 giá trị, lấy từ máy chủ:
   tên/tên miền/ngành/người phụ trách/tên không gian làm việc qua tRPC; chữ viết
   tắt trên avatar sinh bằng **chính hàm `initialsFromName` của sản phẩm**; ngày
   sinh bằng **chính `Intl.DateTimeFormat` với đúng bộ tuỳ chọn sản phẩm dùng**.
   Không một dòng nào gõ tay.
2. **Mọi giá trị tiếng Việt phải mang dấu tiếng Việt** — chặn lối "dịch một khoá
   thành một chuỗi tiếng Anh KHÁC" mà vòng chấm 2 của vòng ② đã tìm ra.

**Một lỗ mới của chính cái thước, tìm ra và đã bịt.** Bản đầu đếm theo **tập hợp
chuỗi phân biệt**. Trả `headers.archived` về `"Archived"` thì chuỗi đó trùng nút
`Archived` đã có sẵn trên màn, tập hợp không đổi, và phép đo báo XANH. Đã đổi
sang **đếm số lần xuất hiện**; đột biến ấy nay đỏ ngay.

### E6 — bốn chuỗi còn lại, tất cả ở chỗ gọi trong `apps/app`

Màn công ty, trạng thái mặc định, khổ 1440px:

```
-- chuoi nhin thay: vi=85 en=85 (165/165 lan)
-- CON LAI: giong het o ca hai thu tieng, khong phai du lieu (4 chuoi / 4 lan)
   * "Archived"
   * "New company"
   * "Search companies by name or domain…"
   * "Views"
-- KHONG MANG DAU TIENG VIET (0 chuoi / 0 lan)
```

Mở đủ chín cột (`?hide=nothing`) thì thêm một chuỗi nữa, **15 lần**:

```
   * "Not researched" x15
```

Năm chuỗi này nằm ở bốn chỗ, tất cả trong `apps/app`, tất cả là chuỗi khoá cứng
**tại chỗ gọi**:

| Chuỗi | Ở đâu |
| --- | --- |
| `Search companies by name or domain…` | `companies-table.tsx:264` |
| `Archived` | `companies-table.tsx` — nhãn nút chuyển màn lưu trữ |
| `Views` | `saved-views-menu.tsx` |
| `New company` | `create-company-sheet.tsx` |
| `Not researched` | `lib/enrichment-status.ts:10`, cùng bốn nhãn trạng thái kia |

So với vòng chấm 1: **11 chuỗi → 4**. Bảy chuỗi đóng được là nhờ vòng ② (`Filters`
· `Sort` · `Columns` · dòng đếm chân bảng) và nhờ bản dịch vỏ màn của vòng ①
(`Companies` · câu mô tả).

### Bốn trạng thái trước đây không phép đo nào chạm tới

Vòng chấm 1 chỉ đo màn ở trạng thái mặc định, và ghi một giới hạn rằng menu lọc
không mở được trong Chrome không giao diện. Giới hạn đó **nay đã rút**:

| Trạng thái | Cách tới | Chuỗi còn lại |
| --- | --- | --- |
| Mặc định | — | 4 |
| Đủ chín cột | `?hide=nothing` | 5 |
| Màn lưu trữ | `?archived=true` | 4 |
| Bảng rỗng | `?q=zzzzkhongkhop` | 4 |
| Mọi menu mở, kể cả menu con | bấm + rê thật | 8 |

Trạng thái "mọi menu mở" chạm sang ngoài phạm vi hợp đồng — nó bắt cả menu tài
khoản (`Light mode` · `Sign out` · `English`) và `Save current view…`. Bốn chuỗi
đó **không tính vào E6** vì AC-6 hứa về màn công ty, còn menu tài khoản thuộc
thanh đầu trang. Ghi lại vì người chốt cần biết chúng có thật.

`English` bị luật "phải mang dấu tiếng Việt" bắt, và đây là **ngoại lệ cố ý**:
dòng ấy gọi tên thứ tiếng sẽ chuyển sang, nên nó phải viết bằng thứ tiếng đó.

### Cái thước có đo được không: 20 trên 22 khoá

Trả TỪNG khoá tiếng Việt về đúng chuỗi tiếng Anh của nó, một khoá một lượt, trên
máy chủ thật, rồi xem số dư có tăng không. Mỗi đột biến còn phải qua **phép kiểm
đột biến thật sự đổi file**: đúng 1 dòng khác so với bản gốc, không hơn không kém.

| Trạng thái đo | Bắt |
| --- | --- |
| Mặc định | 9 |
| Đủ chín cột | 4 |
| Màn lưu trữ | 3 |
| Bảng rỗng | 1 |
| Menu mở | 3 |
| **Hợp lại** | **20 / 22** |

**Hai khoá không bắt được, và lý do do máy kiểm chứ không do tôi khai:**

- `facets.unassigned` (`Chưa giao`) — chỉ hiện khi có công ty **không có người
  phụ trách**. Máy chủ trả: 0 trên 15 dòng.
- `facets.activity` (`Hoạt động`) — chỉ hiện khi có công ty **có hoạt động**.
  Máy chủ trả: 0 trên 15 dòng.

Dữ liệu thử không sinh ra được hai trạng thái ấy. Đây là giới hạn của **dữ liệu**,
không phải của thước.

**Bản đầu của kịch bản đột biến có một lỗi và nó tự khai ra.** Nó so số dòng đổi
bằng `git diff` so với commit, nên khi cây đã mang bản sửa nhãn chưa commit thì
mọi đột biến báo "lệch 12 dòng, chờ 2" và cả 22 lượt **từ chối chạy**. Nó báo
CÙN chứ không báo XANH — đúng cách một cái thước nên hỏng. Đã sửa: so với chính
bản trước đột biến. Nó cũng từng khôi phục bằng `git checkout`, thứ đã **xoá mất
bản sửa nhãn chưa commit** của phiên; nay khôi phục bằng nội dung đã chụp.

## E8 — trước đây ĐẠT NHẦM, và đây là lỗi nặng nhất vòng này tìm ra

Vòng chấm 1 chấm E8 ĐẠT. Màn công ty khi ấy in ngày bằng **tiếng Anh** cho người
đọc tiếng Việt: `Jul 9`, `Jun 17`, `Sep 13`.

`apps/app/components/local-date-time.tsx` dựng bảy bộ định dạng với **`undefined`
làm vùng** — bốn cái trong kịch bản chạy ở trình duyệt viết `void 0`. Không vùng
nào được khai, nên `Intl` lấy vùng **của máy**, không phải vùng người đọc chọn.

Chân đo cũ chỉ grep `Intl.*("en-US"`, tức chỉ thấy vùng **khai cứng**. Một vùng
**vắng mặt** thì nó mù. Đây đúng vết mù đã gây ra lỗi AC-8 của vòng ② —
`new Intl.NumberFormat()` với ngoặc rỗng — và nó tái diễn ở vòng này.

Cột `Ngày tạo` mang `defaultHidden: true` và cột `Hoạt động cuối` toàn rỗng trong
dữ liệu thử, nên **không ảnh chụp nào của vòng chấm 1 có một ngày nào trong đó.**

**Đã sửa** — vùng đi vào cả lượt máy chủ vẽ lẫn kịch bản trình duyệt vẽ lại, và
kịch bản đọc vùng từ `<html lang>` nên hai lượt luôn nói cùng thứ tiếng.

**Chân đo đã mọc thêm một chiều** (`chieu duong C`): đếm mọi chỗ dựng `Intl.*`
mà **không truyền vùng nào** — `undefined`, `void 0`, ngoặc rỗng, hay một chuỗi
ghim. Chiều đỏ của nó: bỏ vùng khỏi một chỗ dùng thật, phép đếm phải thấy ngay.

Bằng chứng, lấy từ lượt vẽ đầu của máy chủ bằng `curl` (không JavaScript nào chạy):

```
vi -> 13 thg 2 · 13 thg 9 · 15 thg 11 · 17 thg 6 · 19 thg 5 · 26 thg 7 · 28 thg 11
      28 thg 7 · 29 thg 3 · 4 thg 3 · 6 thg 3 · 7 thg 12 · 7 thg 5 · 8 thg 2 · 9 thg 7
en -> Dec 7 · Feb 13 · Feb 8 · Jul 26 · Jul 28 · Jul 9 · Jun 17 · Mar 29 · Mar 4
      Mar 6 · May 19 · May 7 · Nov 15 · Nov 28 · Sep 13
so thang tieng Anh lot vao ban vi: 0
```

**Chưa sửa, và khai ra:** ba chữ của thời gian tương đối — `just now`, `in …`,
`… ago` — vẫn tiếng Anh, cùng ba hậu tố `m` · `h` · `d`. Chúng là **chuỗi**, không
phải định dạng, nên nằm ở vế AC-6 chứ không phải AC-8. Dữ liệu thử không có công
ty nào hoạt động trong 30 ngày nên không phép đo nào trên màn này chạm tới chúng.

## E9 — hai cách đọc, và chúng nghịch nhau

AC-9 viết: *"không TIÊU ĐỀ CỘT nào bị cắt cụt; ô dữ liệu dài vẫn được phép cắt
kèm dấu ba chấm."* AC-7 của vòng ② — người đã ký ngày 2026-09-01 — viết:
*"chữ bị cắt mang dấu ba chấm, và tiêu đề đầy đủ nằm trong một thuộc tính trình
đọc màn hình đọc được."*

Một cái cấm tiêu đề bị cắt. Cái kia quy định tiêu đề bị cắt thì phải cắt thế nào.
**Hợp đồng KHÔNG viết lại AC-9 cho vừa kết quả.** Đo cả hai, người chọn.

Đo ở năm bề rộng, hai thứ tiếng, khung trình duyệt đưa lên trước:

| Bề rộng | Cắt TRẦN (vi) | Cắt kèm ba chấm (vi) | Cắt kèm ba chấm (en) |
| ---: | ---: | ---: | ---: |
| 768 | **0** | 4 | 2 |
| 1024 | **0** | 4 | 1 |
| 1280 | **0** | 4 | 0 |
| 1440 | **0** | 3 | 0 |
| 1920 | **0** | 3 | 0 |

- **Theo CHẤT: ĐẠT.** Không tiêu đề nào bị chém trần ở bất kỳ bề rộng nào, ở cả
  hai thứ tiếng. Mỗi chỗ cắt đều mang dấu ba chấm, mang `title`, và chữ đầy đủ
  vẫn tới được trình đọc màn hình. Lỗi vòng chấm 1 tìm ra — *"chữ bị cắt trần,
  người đọc không có tín hiệu nào rằng còn chữ phía sau"* — đã đóng.
- **Theo CÂU CHỮ: KHÔNG ĐẠT.** Ở 768px có bốn tiêu đề bị cắt.

Chữ thật hiện ra ở 768px, đo bằng cách dựng từng tiền tố rồi so bề rộng ô:

```
Số thoả thuận đang mở   -> "Số thoả th…"     o= 64,02px  chu=128,23px
Ngày tạo                -> "Ngày t…"         o= 46,41px  chu= 49,89px
Hoạt động gần nhất      -> "Hoạt độn…"       o= 64,02px  chu=109,50px
Bổ sung dữ liệu         -> "Bổ sung…"        o= 42,44px  chu= 95,72px
```

Tiếng Anh cùng khổ cũng cắt hai cột (`Last activi…`, `Enrich…`), nên **cắt là
chuyện bề rộng cột, không phải chuyện độ dài tiếng Việt** — đúng điều vòng ② đã
kết luận.

**Giá tôi làm nó đắt thêm.** Nhãn mới dài hơn nhãn cũ, nên số cột bị cắt ở 1024px
đi từ 0 lên 4. Đây là hệ quả của bản sửa nhãn trong chính vòng chấm này, và người
có thể bác nó ở Cổng 2 để lấy lại nhãn ngắn — đổi lại là nhận lại lỗi khó đọc mà
hai người lạ đã nêu.

**Một lời chấm nặng đã bị bác bằng phép đo.** Một người chấm khai `Hoạt động cuối`
cắt ra thành một cụm tục ở khổ hẹp. Đo lại chữ thật hiện ra: `Hoạt động …`, không
phải cụm kia. Lời chấm sai, và nó không vào hồ sơ như một lỗi.

## E12 / AC-11 — hai vòng hội đồng, và vì sao tôi dừng sửa chữ

**Vòng chấm chữ 1** — ba người chấm ngữ cảnh sạch, độc lập, trên bộ nhãn cũ. Cả
ba nói **KHÔNG ĐẠT**. Chỗ hai người trở lên cùng chỉ:

| Nhãn cũ | Vấn đề hội đồng nêu | Nhãn mới |
| --- | --- | --- |
| `Cá nhân` | danh từ chỉ người đứng trên cột toàn số | `Số lượng cá nhân` |
| `Thoả thuận mở` | `X mở` đọc thành *một loại X*, không phải trạng thái | `Số thoả thuận đang mở` |
| `Hoạt động cuối` | `cuối` = *đã hết*; nghĩa cần là *gần nhất* | `Hoạt động gần nhất` |
| `Lưu trữ` | động từ đứng trên cột chứa một ngày | `Ngày lưu trữ` |
| `Bổ sung` | hai người lạ phải đi hỏi mới hiểu | `Bổ sung dữ liệu` |

**Vòng chấm chữ 2** — ba người chấm mới, ngữ cảnh sạch, trên bộ nhãn mới:
một **ĐẠT**, hai **KHÔNG ĐẠT**.

Hai người độc lập chỉ đúng **một** chỗ giống nhau: `Số thoả thuận đang mở` nên
thành `Số lượng thoả thuận đang mở`, vì cột kề đã dùng `Số lượng` và vì
`số + danh từ` trần đọc ra *mã định danh* — mà thoả thuận thì thật sự có số hiệu.

**Tôi KHÔNG sửa tiếp, và đây là lý do có số đỡ.** Người chấm thứ ba đòi hướng
**ngược lại**: bỏ hẳn `Số` khỏi cả hai cột, vì hai nhãn cùng mở đầu `Số` và cùng
bị cắt thì lẫn vào nhau. Phép đo đứng về phía người thứ ba ở điểm này:

| Ở 1024px | Chữ hiện ra |
| --- | --- |
| `Số lượng cá nhân` | `Số lượn…` |
| `Số thoả thuận đang mở` | `Số thoả thu…` — khác nhau từ ký tự thứ 4 |
| `Số lượng thoả thuận đang mở` (đề xuất) | `Số lượng th…` — khác nhau từ ký tự thứ 10 |

Nên bản sửa hai người đề xuất **làm hai nhãn khó phân biệt hơn ở khổ hẹp**, đúng
thứ người thứ ba phàn nàn. Hai vòng hội đồng không hội tụ, và mỗi hướng sửa đều
có một cái giá đo được. Đây là chỗ **người chọn**, không phải chỗ máy chọn tiếp.
Vá thêm một lượt nữa là lượt sửa nhãn thứ ba trong cùng một vòng chấm.

### Ba lời chấm nặng, cả ba SAI, cả ba bị phép đo bác

Người chấm đọc ảnh và **đọc nhầm chữ bị cắt**, hai vòng liên tiếp:

| Lời chấm | Chữ thật hiện ra ở 768px |
| --- | --- |
| `Hoạt động cuối` cắt thành một cụm tục | `Hoạt động …` |
| `Phụ trách` cắt thành `Phụ…`, nghĩa "hạng phụ" | `Phụ trách` — **không cắt** |
| `Ngày tạo` cắt thành `N..`, mất hẳn nhãn | `Ngày t…` |

Cả ba nghe rất nặng và rất dễ tin. Chữ bị cắt bằng CSS thì **không nằm trong
DOM**, nên chỉ đo được bằng cách dựng từng tiền tố rồi so bề rộng ô — thứ hồ sơ
này làm. Không lời nào trong ba lời trên vào hồ sơ như một lỗi.

### Điều hội đồng nói mà phép đo máy không nói được

- Cột `Bổ sung dữ liệu` có **nhãn tiếng Việt và ô tiếng Anh** (`Not researched`),
  và hai chữ ấy còn không cùng nghĩa. Người chấm gọi đây là chỗ tệ nhất màn.
- `Hoạt động gần nhất` không nói **hoạt động của ai** — công ty chạm vào ta, hay
  ta chạm vào công ty. Với người giữ quan hệ, hai câu đó dẫn tới hai việc ngược
  nhau. Không nhãn nào trên màn trả lời được.
- `Ngày tạo` có thể bị đọc thành **ngày thành lập công ty** thay vì ngày hồ sơ
  vào CRM.
- `Bổ sung dữ liệu` gọi tên một năng lực sản phẩm mà `CONTEXT.md` **chưa có mục
  từ**. Luật của kho đòi thêm mục trước.

Bốn điều này chưa ai nhận, và không thuộc phạm vi vòng ①.

## E10 — vòng tiêu điểm đo bằng điểm ảnh, không bằng CSS

Bản đầu của phép đo đọc `box-shadow` của phần tử đang có tiêu điểm và báo "có
vòng". Giá trị nó đọc được **trong suốt hoàn toàn** — thước cùn: nó xanh với một
vòng không ai nhìn thấy.

AC-10 đòi *"nhìn thấy được trong ảnh chụp"*, nên phép đo nay chụp đúng ô nút hai
lần — khi có tiêu điểm và khi không — rồi so ảnh:

```
Tab lần 3 dừng ở: <button> nhãn="Account menu"
ảnh nút khi CÓ tiêu điểm khác ảnh khi KHÔNG tiêu điểm: có
menu sau khi Enter: ["Light mode","English","Sign out"]
```

Hai ảnh ở `evidence/E10-step1.png` và `evidence/E10-step0-khong-tieu-diem.png`.

**Lệch câu chữ của vòng chấm 1 vẫn còn nguyên.** AC-10 viết như thể nút đổi tiếng
là một nút riêng; thực tế nó là một dòng trong menu tài khoản, và người dùng bàn
phím phải nhấn thêm một lần nữa trong menu. Ba điều AC-10 đòi đều đúng. Người
chốt xem có cần viết lại câu chữ cho vòng sau không.

## E4 — ràng đã gãy từ vòng ② và không ai chạy lại

Chân `--chan la` không chạy được: nó chép `resolve.ts` và `locale.ts` sang thư
mục tạm, mà `locale.ts` nay tái xuất từ `@crm/ui/lib/locale` — đường nhập không
giải được ngoài kho gọi. Vòng ② dời gốc kiểu `Locale` sang `packages/ui` (AC-4
của vòng đó) và ràng này gãy theo, im lặng, suốt từ đó.

Đã sửa: bản sao viết lại đường nhập thành đường tuyệt đối, và có một phép kiểm
rằng bản sao không còn đường nhập nào không giải được.

Sau khi sửa, cả hai chiều đúng: giá trị rác rơi về `en`; bản sao bỏ bước kiểm hợp
lệ thì `"zz-ZZ-nonsense"` lọt qua nguyên vẹn.

## Bằng chứng năm ca phân giải ngôn ngữ

Lấy bằng `curl` từ lượt trả về ĐẦU TIÊN của máy chủ, không JavaScript:

| Eval | Cookie | Accept-Language | `<html lang>` |
| --- | --- | --- | --- |
| E1 | không | `vi-VN,vi;q=0.9` | `vi` |
| E2 | không | `en-US,en;q=0.9` | `en` |
| E3 | `lang=vi` | `en-US,en;q=0.9` | `vi` |
| E11 | `lang=en` | `vi-VN,vi;q=0.9` | `en` |
| E4 | `lang=zz-ZZ-nonsense` | `vi-VN,vi;q=0.9` | `en` |

Và lượt vẽ đầu ấy đã mang chữ tiếng Việt, không phải chờ một lượt vẽ lại: file
`evidence/E3-step1.html` chứa `Công ty` ×3, `Mọi công ty trong mạng lưới` ×2,
`Số lượng cá nhân`, `Số thoả thuận đang mở`, `Hoạt động gần nhất`.

## Định tuyến ở Cổng 2

Ngày 2026-09-02, Manh Phan chọn: **bốn chuỗi còn lại chuyển sang vòng ③, vòng ①
ký với giới hạn đã khai.** Căn cứ: cả năm chuỗi là chuỗi khoá cứng tại chỗ gọi,
nằm đúng trong 177 file nhãn ứng dụng mà vòng ③ phải quét; đóng chúng ở đây là
làm hai lần.

**E6 GIỮ NGUYÊN verdict FAIL trong hồ sơ này.** Quyết định của người là định
tuyến phần việc còn lại, không phải tuyên bố tiêu chí đã đạt. Hợp đồng nhận thêm
một dòng ngoài phạm vi, viết dưới dạng LUẬT chứ không phải danh sách, và **phép
đo không bị tắt** — nó vẫn đếm và vẫn báo năm chuỗi đó ở mọi lượt chạy sau.

Cổng 2 của vòng ③ phải đo lại đúng năm chuỗi này và thấy chúng biến mất.

Chữ ký và các mục người phủ quyết chưa ghi vào file này — chúng do lệnh ký của
người ghi, không do phiên máy ghi.

## Evidence

- eval: E6
  run_id: tieng-viet-cho-crm-r2-E6
  exit_code: 1
  baseline: red
  verifier: /Users/manhphan/dev/crm/.claude/worktrees/exciting-tharp-571c02/_acceptance/tieng-viet-cho-crm/rang/ban-ve-man-cong-ty.mjs
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E6-man-vi-1440.png
  reason: Bốn chuỗi tiếng Anh còn nhìn thấy trên màn công ty ở trạng thái mặc định, năm chuỗi khi mở đủ chín cột. Tất cả là chuỗi khoá cứng tại chỗ gọi trong apps/app.

- eval: E9
  run_id: tieng-viet-cho-crm-r2-E9
  exit_code: 0
  baseline: red
  verifier: /Users/manhphan/dev/crm/.claude/worktrees/exciting-tharp-571c02/_acceptance/tieng-viet-cho-crm/rang/ban-ve-man-cong-ty.mjs
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E9-768-vi-768.png
  verdict: UNCERTAIN
  rationale: Không tiêu đề nào bị chém trần ở bất kỳ bề rộng nào, ở cả hai thứ tiếng — lỗi vòng chấm 1 tìm ra đã đóng. Nhưng ở 768px có bốn tiêu đề bị cắt kèm dấu ba chấm, và câu chữ AC-9 cấm tiêu đề bị cắt, trong khi AC-7 của vòng ② mà người đã ký lại quy định tiêu đề bị cắt phải cắt thế nào. Hai tiêu chí nghịch nhau; máy không tự chọn được cái nào thắng.

- eval: E12
  judged_by: ba người chấm ngữ cảnh sạch, hai vòng
  verdict: UNCERTAIN
  rationale: Vòng chấm chữ 1 — ba người, cả ba KHÔNG ĐẠT, năm nhãn đổi theo chỗ hai người trở lên cùng chỉ. Vòng chấm chữ 2 trên nhãn mới — một ĐẠT, hai KHÔNG ĐẠT. Hai người đề xuất một sửa duy nhất giống nhau, người thứ ba đòi hướng ngược lại, và phép đo đứng về phía người thứ ba: bản sửa hai người đề xuất làm hai nhãn kề nhau chỉ khác nhau từ ký tự thứ 10 thay vì thứ 4 khi bị cắt ở 1024px. Mỗi hướng đều có một cái giá đo được.
  human_override:

- eval: E1
  run_id: tieng-viet-cho-crm-r2-E1
  exit_code: 0
  baseline: n-a
  verifier: curl
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E1-step1.html

- eval: E2
  run_id: tieng-viet-cho-crm-r2-E2
  exit_code: 0
  baseline: n-a
  verifier: curl
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E2-step1.html

- eval: E3
  run_id: tieng-viet-cho-crm-r2-E3
  exit_code: 0
  baseline: n-a
  verifier: curl
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E3-step1.html

- eval: E4
  run_id: tieng-viet-cho-crm-r2-E4
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_ngon_ngu_la
  verified_at: 2026-09-02T02:41:54Z

- eval: E5
  run_id: tieng-viet-cho-crm-r2-E5
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_cookie
  verified_at: 2026-09-02T02:41:54Z

- eval: E7
  run_id: tieng-viet-cho-crm-r2-E7
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_du_lieu_khong_dich
  verified_at: 2026-09-02T02:41:54Z

- eval: E8
  run_id: tieng-viet-cho-crm-r2-E8
  exit_code: 0
  baseline: red
  verifier: config:executors.script.rang_dinh_dang
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E8-ngay-vi.html

- eval: E10
  run_id: tieng-viet-cho-crm-r2-E10
  exit_code: 0
  baseline: n-a
  verifier: /Users/manhphan/dev/crm/.claude/worktrees/exciting-tharp-571c02/_acceptance/tieng-viet-cho-crm/rang/ban-ve-man-cong-ty.mjs
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E10-step1.png

- eval: E11
  run_id: tieng-viet-cho-crm-r2-E11
  exit_code: 0
  baseline: n-a
  verifier: curl
  verified_at: 2026-09-02T02:41:54Z
  screenshot: evidence/E11-step1.html

## Lệnh suite

Chạy từ gốc kho, ép không cache:

| Lệnh | Kết quả |
| --- | --- |
| `bun run db:test && bunx turbo run test --force --concurrency=1` | 11/11 tác vụ, 0 fail |
| `bunx turbo run check-types --force` | 13/13 |
| `bunx turbo run lint --force` | 9/9 |
| `bun run lint:slop` | sạch |

## Ngoài hợp đồng

- **Đọc cookie ở layout gốc làm MỌI tuyến mất khả năng dựng sẵn.** Máy chủ dev
  in một lỗi cho mỗi lượt tải `/[slug]/companies`, trỏ đúng `app/layout.tsx:47`
  — dòng của vòng ① đọc `cookies()` và `headers()` để phân giải ngôn ngữ. Hợp
  đồng đã khai một giá: *"trang đăng nhập chuyển từ vẽ tĩnh sang vẽ động"*. Giá
  thật lớn hơn khai: layout gốc bọc **toàn bộ ứng dụng**, nên mọi trang mất
  prerender, không riêng trang đăng nhập.
- **Cột `Ngành` đổ giá trị tiếng Anh** (Software · Banking · Financial Services).
  Vòng chấm 1 để ngỏ câu hỏi đây là dữ liệu hay danh mục khai cứng. Đã kiểm: máy
  chủ trả chúng trong trường `industry` của từng dòng, nên là **dữ liệu**, và
  hợp đồng cấm dịch dữ liệu người nhập.
- **`bun run test` chạy song song có lượt đỏ ở `api#test`.** Chạy lại riêng
  `api` thì 381/381 xanh; chạy cả suite tuần tự (`--concurrency=1`) thì 11/11
  xanh. Nhiều gói dùng chung một cơ sở dữ liệu thử, và ở cây này còn có hai máy
  chủ dev cùng nối vào nó. Không phải lỗi của mã vòng này.
- **Giàn đo dời khỏi gói giao diện.** Bản đầu đặt một file phụ ở
  `packages/ui/test/`. Nay cả giàn sống ở `_acceptance/tieng-viet-cho-crm/rang/`.
- **`lint:slop` từng đỏ vì chính giàn đo.** Ba chỗ dùng `typeof` để lọc dữ liệu
  từ máy chủ. Không nới miễn trừ của `.oxlintrc.json` — đã phân tích dữ liệu ở
  biên bằng `zod`, đúng luật `AGENTS.md`.

## Known limits

- **Chưa đo trình đọc màn hình thật** (NVDA/JAWS/VoiceOver). Chỉ đọc thuộc tính
  `title` và cây trợ năng của trình duyệt.
- **Ba chữ thời gian tương đối chưa dịch** — `just now`, `in …`, `… ago`. Dữ
  liệu thử không sinh ra chúng, nên **không phép đo nào che chúng**.
- **Hai khoá bảng dịch không có phép đo** — `facets.unassigned`, `facets.activity`.
  Lý do máy kiểm được: 0 trên 15 dòng thiếu người phụ trách, 0 trên 15 dòng có
  hoạt động.
- **Tên pháp nhân thật 40–60 ký tự chưa thử.** Dữ liệu thử dài nhất là `Pennylane`.
- **Năm chỗ gọi `DataTable` ngoài màn công ty chưa đo.** Hợp đồng chỉ hứa màn
  công ty; bản sửa `local-date-time.tsx` thì chạm cả hai mươi màn.
- **Đường chuẩn A/B chỉ có cho bốn phép đo máy.** Bốn ràng script đều có chiều
  đỏ chạy được. Bảy phép đo qua trình duyệt không có cây gốc để đối chiếu.

## Analyst

Mỗi phép đo trong báo cáo này đều có một chiều đỏ đã chạy. Ba cái thước hỏng bị
bắt **trong chính vòng chấm này**, và cả ba đều thuộc một họ: một phép đo chỉ
xanh được mà chưa từng chứng minh nó đỏ được.

1. Đếm theo tập hợp không thấy chuỗi trùng chuỗi đã có → đổi sang đếm số lần.
2. `box-shadow` trong suốt được tính là vòng tiêu điểm → đổi sang so điểm ảnh.
3. Chân `dinh-dang` chỉ thấy vùng khai cứng, mù với vùng vắng mặt → thêm một
   chiều đếm.

Cái thứ ba là cái đắt nhất: nó để một tiêu chí được chấm ĐẠT trong khi màn hình
in ngày tiếng Anh suốt một vòng.

## Variance

không — không phép đo nào chạy nhiều lượt để so phương sai.

## Iterations

Vòng chấm 2 (2026-09-02): E6 còn 4 chuỗi, tất cả là chuỗi khoá cứng tại chỗ gọi
trong `apps/app` — vòng ③. E9 trượt theo câu chữ, đạt theo chất, và hai cách đọc
nghịch nhau vì AC-7 của vòng ② nay quy định điều AC-9 cấm. E8 lộ ra đã ĐẠT NHẦM
ở vòng chấm 1 và đã sửa. Năm nhãn cột đổi theo vòng người lạ lái thử và hội đồng.
