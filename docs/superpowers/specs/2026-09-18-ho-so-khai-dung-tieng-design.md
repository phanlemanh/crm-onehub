# Hồ sơ khai đúng tiếng — thiết kế

Ngày 2026-09-18 · slug `ho-so-khai-dung-tieng` · T2 · surface `ui`

## Việc này giải gì

Trên tấm hồ sơ (record sheet) của một trang khai `lang="vi"`, các giá trị tiếng
Anh **do máy ghi** đang nằm trong phần tử không khai tiếng của mình. Trình đọc
màn hình đặt tiếng Việt vì thế đọc cả đoạn tiếng Anh bằng bộ phát âm tiếng Việt —
người nghe không ra chữ nào.

Lỗ quan sát trên bản chạy thật ngày 18/09 tại `ff3fb8bf`: đoạn giới thiệu công ty
nằm trong `<p>` không có `lang`, tổ tiên gần nhất khai `lang="vi"`.

Đây là loại lỗi **vô hình với mắt**. Nhìn màn hình một trăm lần cũng không thấy.

## Vì sao lỗ này sống sót qua một vòng đã ký

Hồ sơ `nhan-ung-dung-noi-tieng-viet` đã hứa đúng điều này ở AC-7 và AC-14, đã
chạy phép đo, và đã đóng xanh. Chân đo của nó là
`_acceptance/nhan-ung-dung-noi-tieng-viet/rang/khai-tieng.mjs`, và nó mở đúng hai
màn:

```
const thay = await xem("companies", NGANH, …)
const thay = await xem("deals", GIAI_DOAN, …)
```

Hai màn danh sách. **Tấm hồ sơ chưa bao giờ được mở.** Phép đo không sai — nó đo
đúng thứ nó mở. Nó chỉ chưa đi tới đó.

Hệ quả cho vòng này: chân đo mới phải **mở tấm hồ sơ thật**, và phải chứng minh
được chiều đỏ trên chính tấm hồ sơ đó. Một chân đo xanh chưa từng đỏ ở chỗ mới
thì không phân biệt được "đã khai đủ" với "lại chưa đi tới".

## Chuẩn ngành, nguyên văn

WCAG 2.2 SC 3.1.2 *Language of Parts*, Mức AA (lấy từ kho nguồn của W3C, không từ
trí nhớ):

> The human language of each passage or phrase in the content can be
> programmatically determined except for proper names, technical terms, words of
> indeterminate language, and words or phrases that have become part of the
> vernacular of the immediately surrounding text.

Bản liệt kê ngoại lệ đó **chia đúng bài toán này thành hai nhóm**, và là căn cứ
cho mọi chỗ loại trừ dưới đây — không phải suy đoán.

Đáng ghi: cả chuẩn nội của kho (`.agents/skills/better-accessibility/`) lẫn chuẩn
ngoại mà `feature_loop.ui_standards_skill` trỏ tới (Vercel Web Interface
Guidelines) đều **không có một dòng nào** về `lang`. Bộ hướng dẫn ngoại có luật
`translate="no"`, và kho đã theo nó ở khoảng 60 chỗ. Không lưới nào đỡ đúng chỗ
này — đó là lý do cơ chế trôi mà không ai thấy.

## Cái gì được khai, cái gì không

| Nguồn giá trị | Ví dụ | Khai `lang="en"`? | Căn cứ |
| --- | --- | --- | --- |
| Văn xuôi máy sinh | `company.description`, `brief.narrative` | **Có** | cả đoạn, không rơi vào ngoại lệ nào |
| Tập enum tiếng Anh cố định | bảy giai đoạn thoả thuận | **Có** | AC-14 vòng trước đã chốt |
| Phân loại ngoài | `company.industry` | **Có** | AC-7 vòng trước gọi đích danh |
| Danh từ riêng máy ghi | `company.name`, `location` | **Không** | ngoại lệ *proper names* |
| Người nhập | `contact.title` | **Không** | ngoại lệ *words of indeterminate language* |

Hai hàng cuối đáng nói rõ, vì chúng là chỗ dễ làm quá tay: khai cứng `lang="en"`
lên một ô nhân viên gõ được là **khai sai** — ai đó gõ "Giám đốc kinh doanh" thì
trình đọc màn hình sẽ đọc tiếng Việt bằng bộ phát âm tiếng Anh. Đúng cái lỗi đang
vá, chỉ ngược chiều. Ô người nhập đã có `translate="no"`, và đó là thứ nó cần.

`translate="no"` và `lang="en"` **không thay được nhau**: một cái nói với máy
dịch "đừng đụng", cái kia nói với trình đọc màn hình "đọc bằng giọng nào". Một số
chỗ cần cả hai. Lẫn hai cơ chế là một lớp lỗi thật, nên bảng trên phân theo
*nguồn giá trị*, không theo *cảm giác chỗ này có vẻ tiếng Anh*.

## Đường đã chọn: một component, không phải một chỗ vá

Hôm nay cơ chế là **năm lần gõ tay `<span lang="en">` tại chỗ gọi**, không có
component dùng chung nào:

| Chỗ | Cái gì |
| --- | --- |
| `apps/app/app/(app)/[slug]/companies/companies-table.tsx:90` | ngành, bảng danh sách |
| `apps/app/app/(app)/[slug]/sales-dashboard.tsx:202` | nhãn giai đoạn ở biểu đồ |
| `apps/app/app/(app)/[slug]/deals/create-deal-sheet.tsx:198` | giai đoạn |
| `apps/app/components/crm/stage-stepper.tsx:65` | giai đoạn |
| `apps/app/components/crm/deal-stage.tsx:14` | giai đoạn |

Lối viết tay ấy **đã trôi ở ba chỗ** — `MetaLine`, `DetailSheetProse`,
`timeline-entry`. Đó không phải suy đoán về tương lai, đó là số đã xảy ra. Và
`docs/design.md` nói giao diện dùng chung sống ở `/packages/ui`.

Nên: một component nguyên thuỷ ở `packages/ui/src/components/foreign-text.tsx`.

```tsx
export function ForeignText({
  lang,
  className,
  children,
}: {
  lang: Locale;
  className?: string;
  children: ReactNode;
}) {
  return <span lang={lang} className={className}>{children}</span>;
}
```

Không thêm knob nào khác. `className` có mặt vì ba chỗ gọi hiện tại cần lớp bố
cục (`truncate`, `min-w-0 flex-1`) và mọi nguyên thuỷ khác trong `packages/ui`
đều nhận `className` — đây là lớp bố cục tại chỗ gọi, không phải đè kiểu dáng của
component, nên không nghịch `docs/design.md`.

`lang` là tham số bắt buộc kiểu `Locale` chứ không đóng cứng `"en"`: component
mà tự đóng cứng một giá trị thì tên nó nói dối, và `LOCALES` của kho vốn đã có
hai phần tử.

### Hai chỗ không có phần tử nào để khai

Đây là phần khó của việc này, và là lý do nó không phải "thêm `attribute` vào bốn
thẻ".

**`MetaLine`** nhận `parts: (string | null | undefined)[]` rồi vẽ mọi phần tử vào
`<span>` giống hệt nhau (`record-parts.tsx:151`). Chỗ gọi ở hồ sơ công ty truyền
`[location, company.industry]` — một danh từ riêng và một phân loại, **hai tiếng
khác nhau trong cùng một mảng**. Không khai theo dòng được. `parts` phải mang
được ngôn ngữ theo từng phần:

```ts
type MetaPart = { text: string; lang: Locale };
parts: (string | MetaPart | null | undefined)[]
```

Chuỗi trần giữ nguyên nghĩa cũ (không khai gì) nên chỗ gọi ở hồ sơ cá nhân —
`[contact.title, contact.company?.name]`, cả hai đều thuộc ngoại lệ — **không
phải sửa một chữ nào**. Khử trùng lặp vẫn chạy trên `text`.

**`timeline-entry.tsx:82`** ghép hai nhãn giai đoạn bằng template literal:

```ts
const headline = change
  ? `${dealStageLabel(change.from)} → ${dealStageLabel(change.to)}`
  : entry.subject;
```

Một chuỗi không có thẻ nào để mang `attribute`. `headline` đổi sang `ReactNode`;
bốn chỗ dùng nó (dòng 116, 124, 133, 140) chỉ kiểm tính thật-giả nên vẫn chạy.

Ghi lại vì nó là bài học rút được: **hai lớp lỗi này không tìm thấy bằng cách đọc
mã tìm chữ `lang=`**. Chúng vô hình với mọi máy quét chuỗi, vì chỗ hỏng là chỗ
*không có gì*. Chỉ chân đo mở màn thật và đọc DOM mới thấy.

### Năm chỗ cũ có đi theo không

**Có, và đây là chỗ thiết kế này vượt ra ngoài tấm hồ sơ.** Năm chỗ viết tay ở
trên chuyển sang dùng `ForeignText`. Lý do: câu "component dùng chung là con
đường duy nhất" chỉ đo được khi nó đúng; một component phủ bốn trên chín chỗ thì
không chặn được lần trôi kế tiếp, mà chặn trôi chính là điều đã chọn cơ chế này.

Đổi lại: diff chạm 5 file ngoài phạm vi tấm hồ sơ. Việc chuyển là cơ học —
`<span lang="en" className={x}>` thành `<ForeignText lang="en" className={x}>`,
không đổi DOM sinh ra. Người duyệt thấy dòng này trên thẻ Cổng 1 và cắt được nếu
muốn.

## Đo thế nào

Ba lớp, vì một lớp không đủ:

1. **Lớp component** — bài kiểm vẽ ra DOM thật trong `packages/ui/test/`
   (`--preload ./test/setup-dom.ts` đã có sẵn, `lai-ra-man.spec.tsx` là tiền lệ).
   Đo `ForeignText` và `MetaLine` sinh đúng `attribute`, và **đo cả chiều ngược**:
   phần tử `parts` kiểu chuỗi trần KHÔNG được sinh `lang`.
2. **Lớp nhìn thấy** — chân đo trình duyệt mở **tấm hồ sơ thật**, đọc giá trị từ
   máy chủ trong chính lượt chạy đó rồi khẳng định từng giá trị nằm trong
   `closest('[lang="en"]')`. Đây là chỗ chân đo cũ chưa đi tới, nên đây là chỗ
   vòng này bắt buộc phải đi. Mô hình theo `rang/khai-tieng.mjs` của vòng trước,
   đổi `xem("companies")` thành mở tấm hồ sơ.
3. **Lớp chống khai thừa** — cùng chân đo, chiều ngược: tên công ty, địa danh, và
   giá trị ô người nhập **không được** nằm trong `[lang="en"]`. Không có lớp này
   thì "khai tất cả mọi thứ" cũng qua được lớp 2.

Mỗi phép đo mới khai cặp hai chiều trên cùng một vật: vật lành thì xanh, phá vật
thật trong bản sao thì đỏ **kèm thông điệp ghim gọi tên chỗ hỏng**.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: danh sách công ty → mở một công ty → tấm hồ sơ, tab Tổng quan → đọc
  giới thiệu, ngành, dòng thời gian (điểm ra: đóng tấm hồ sơ, về danh sách)
- Biên: công ty chưa enrichment xong (không có giới thiệu, không có ngành —
  khối không vẽ) · cá nhân chưa có tóm tắt tác nhân · dòng thời gian chưa có
  lần đổi giai đoạn nào
- Lỗi & quay lại: không có đường lỗi mới. Việc này không thêm thao tác nào,
  không thêm lời gọi máy chủ nào, không đổi một pixel nào.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ công ty, tab Tổng quan | cho người đọc hiểu công ty này là ai | từ danh sách công ty / đóng về danh sách |
| Hồ sơ cá nhân, phần Bối cảnh | cho người đọc hiểu người này là ai | từ danh sách cá nhân hoặc hồ sơ công ty / đóng về chỗ vào |
| Dòng thời gian trong hồ sơ | cho người đọc thấy chuyện gì đã xảy ra | cuộn trong hồ sơ / không ra đâu |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ho-so-cong-ty-co-gioi-thieu | Hồ sơ công ty | khối "Giới thiệu" với văn xuôi tiếng Anh, tự khai `lang="en"` | đọc |
| ST-ho-so-cong-ty-chua-enrichment | Hồ sơ công ty | khối "Giới thiệu" KHÔNG vẽ; không sinh phần tử rỗng khai tiếng | chờ enrichment |
| ST-ho-so-cong-ty-co-nganh | Hồ sơ công ty | dòng meta: địa danh không khai tiếng · ngành khai `lang="en"` | đọc |
| ST-ho-so-ca-nhan-co-tom-tat | Hồ sơ cá nhân | khối Bối cảnh với văn xuôi tác nhân sinh, tự khai `lang="en"` | đọc |
| ST-ho-so-ca-nhan-chuc-danh | Hồ sơ cá nhân | dòng meta: chức danh KHÔNG khai tiếng (ô người nhập) | sửa tại chỗ |
| ST-dong-thoi-gian-doi-giai-doan | Dòng thời gian | tiêu đề "A → B", hai nhãn giai đoạn đều khai `lang="en"` | đọc |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- **Không có thay đổi thị giác nào.** `<span lang="en">` không vẽ ra pixel nào;
  `ForeignText` sinh đúng cây DOM mà năm chỗ viết tay đang sinh. Bố cục, khoảng
  cách, màu, breakpoint giữ nguyên tuyệt đối. Đây là thay đổi chỉ trình đọc màn
  hình nghe thấy.
- Trường rỗng giữ nguyên nếp cũ: khối không vẽ, không sinh phần tử rỗng.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `ForeignText` | **tạo** — `packages/ui/src/components/foreign-text.tsx` | chưa có nguyên thuỷ nào cho ngôn ngữ của phần; năm lần viết tay đã trôi ba chỗ |
| `MetaLine` | **mở rộng** — `parts` mang được ngôn ngữ theo từng phần | một mảng đang trộn danh từ riêng với phân loại, không khai theo dòng được |
| `DetailSheetProse` | **dùng** — không đổi, chỗ gọi bọc `ForeignText` bên trong | khối văn xuôi là generic; tiếng thuộc về giá trị, không thuộc về khối |
| `StatusIndicator` | **dùng** — không đổi | `DealStageIndicator` đã bọc đúng rồi |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: không tra mẫu — khuôn đã có sẵn và việc này không đụng vào nó. Tấm hồ sơ
là lớp phủ trên bảng danh sách, đúng khuôn danh-sách-chi-tiết đang chạy; vòng này
không thêm màn, không đổi điều hướng, không đổi bố cục. Chỉ một khuôn khả dĩ nên
theo thang 2 nấc là ghi thẳng lý do.
<!-- UX-SPEC-TEMPLATE>>> -->

## Ngoài phạm vi

- **Bề mặt ẩn của hồ sơ** — tab Agent, menu hành động, hộp thoại xác nhận. Vòng
  này quét bề mặt thấy được khi mở hồ sơ và cuộn. Bề mặt ẩn là một lát riêng.
- **Hồ sơ thoả thuận** — giai đoạn ở đó đi qua `stage-stepper` và
  `DealStageIndicator`, cả hai đã khai đúng; mô tả thoả thuận là ô người nhập.
- **Màn danh sách và bảng điều khiển** — năm chỗ đang khai đúng. Chúng chuyển
  sang `ForeignText` (đổi cơ chế, không đổi lời hứa), nhưng không mở rộng tập
  giá trị được khai ở đó.
- **Không dịch giá trị từ cơ sở dữ liệu sang tiếng Việt.** `CONTEXT.md` khai bảy
  giai đoạn thoả thuận là CHƯA CHỐT NGHĨA. Khai đúng tiếng của chúng là việc
  khác hẳn với dịch chúng.
- **Không thêm thư viện đa ngôn ngữ.**
- **Không mở lại hồ sơ `nhan-ung-dung-noi-tieng-viet`.** Hồ sơ đó đã đóng theo
  quan sát ngày 18/09 và lỗ này đã ghi vào sổ quyết định của nó. Đây là việc
  riêng, có hợp đồng riêng.

## Đã đọc trước khi viết

`AGENTS.md` (bảng chỉ mục: mục "UI in `apps/app` or `packages/ui`") ·
`CLAUDE.md` · `docs/design.md` · `.agents/skills/better-accessibility/SKILL.md` ·
`.agents/skills/web-design-guidelines/SKILL.md` cùng bản luật ngoại nó trỏ tới ·
`_acceptance/nhan-ung-dung-noi-tieng-viet/contract.md` và `rang/khai-tieng.mjs` ·
`packages/ui/test/lai-ra-man.spec.tsx` · `apps/app/test/messages-guard.spec.ts` ·
WCAG 2.2 SC 3.1.2 nguyên văn từ kho nguồn W3C.
