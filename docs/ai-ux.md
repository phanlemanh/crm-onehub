# Kara — luật giao diện cho mọi chỗ AI

Chốt 2026-10-01 (Manh Phan). Gốc: khảo sát
`docs/plan/ux-ai-thong-nhat-2026-10-01.md` — 12 bề mặt AI, bảy tên, bốn dấu nhận
diện, bốn cách duyệt khác nhau.

Tệp này giữ **mọi chỗ AI xuất hiện**. `docs/chat-ui.md` vẫn giữ riêng phần hội
thoại (bong bóng, ô soạn, cuộn); chỗ nào hai tệp cùng nói thì tệp này nói về
danh tính, hành vi và chữ, còn `chat-ui.md` nói về thành phần của hội thoại.
`docs/design.md` đứng trên cả hai.

Đọc tệp này trước khi làm bất cứ màn nào có AI nói, đề xuất, tóm tắt hay ghi.

## 1. Một tên: Kara

AI của OneHub Center chỉ có một tên trên màn: **Kara**. Không «Agent», «trợ lý
AI», «Trợ lý OKR», «máy», «máy soạn», «bot». Mục từ ở `CONTEXT.md`.

- Ở chỗ cần phân biệt phần chạy — cài đặt, sổ chi phí — ghi theo phạm vi:
  «Kara · OKR», «Kara · hồ sơ», «Kara · Tài liệu».
- **Tác nhân** là vật đội dựng ra; Kara chạy nó. «Tác nhân» không bao giờ là tên
  của người đang nói.
- Bot Zalo là cửa vào; người hỏi qua Zalo thì Kara trả lời.

## 2. Một dấu: tia sáng

Dấu AI là icon `AiGenerate` của Carbon (tia sáng), qua thành phần dấu AI trong
`packages/ui`. Không tự import icon ở chỗ gọi.

- Dấu đi kèm chữ «Kara», màu chữ phụ (`text-muted-foreground`). Không màu riêng,
  không tô xanh thương hiệu: xanh trong kho nghĩa là «hành động chính».
- `Bot`, `MagicWand`, logo hãng làm ảnh đại diện của AI — gỡ dần.
- Một nút gọi Kara chính mỗi màn. Nút đó mang dấu tia sáng; các nút trong vùng đã
  là của Kara thì không mang thêm.

## 3. Nhãn nguồn: gắn một lần mỗi nhóm

Mọi nội dung Kara viết mang nhãn **Kara**, gắn **một lần ở đầu nhóm** («Kara ·
2 góp ý»), không lặp trên từng dòng. Bấm nhãn mở ô «vì sao»: Kara dựa trên gì, đọc
lúc nào. Nhãn không bao giờ là nút gọi Kara làm lại.

Giá trị đã nhận từ đề xuất của Kara giữ một dấu nhỏ tại chỗ (như gạch chân chấm
của thông tin liên hệ hôm nay) tới khi một người sửa nó.

## 4. Ba mức hành động, theo hậu quả

| Kara làm gì | Mức | Trên màn |
| --- | --- | --- |
| Đọc, tìm, tóm tắt, trả lời | Chạy luôn | Không hỏi |
| Ghi vào một bản ghi trong CRM | **Đề xuất** | Người nhận từng đề xuất (mục 5) |
| Gửi ra ngoài CRM, hay việc không hoàn tác được | **Xác nhận** | `ConfirmDialog` nói rõ hậu quả trước khi chạy |

Không có mức thứ tư: Kara không ghi thẳng vào bản ghi. Công cụ ghi của tab bản ghi
(`record_fact`, `set_field_value`, `set_contact_socials`) đang ghi thẳng — lệch
luật này, sửa ở lượt `tac-tu-xin-duyet`.

## 5. Đề xuất: một thành phần, hai độ dày

Mọi đề xuất của Kara dùng `ProposedChange` trong `packages/ui`.

- **`inline`** — mặc định. Không viền, đặt **ngay dưới thứ nó sửa**: dưới dòng KR
  trong bảng, dưới ô nhập, dưới trường của liên hệ. Thân là `Item` mặc định, không
  `Alert`, không `Card`. Trong bảng thì là một dòng con, không thêm khung.
- **`card`** — chỉ khi không có chỗ để neo: trong hội thoại, trong một cột riêng.

Thân đề xuất viết lại là diff tại chỗ: chữ cũ gạch, chữ mới tô nền chèn. Lý do một
dòng chữ phụ.

**Nút gọi đúng hậu quả.** «Đổi tên KR», «Thay câu», «Thêm vào hồ sơ», «Thêm KR đối
trọng» — không «Nhận» trần. Một nút tô màu mỗi đề xuất; «Sửa» viền; «Bỏ qua» chữ.
Khi nhận sẽ ghi đè chữ một người đã viết tay, nói điều đó ngay trên nút hay dòng lý
do.

Câu hỏi của Kara luôn có một lối đi tiếp làm được ngay (mở thứ cần sửa, thêm thứ
còn thiếu), cạnh «Bỏ qua». Một câu hỏi mà chỉ bỏ qua được là một câu hỏi thừa.

Một cảnh báo cố định của máy và một đề xuất của Kara nói cùng một điều thì giữ một.

## 6. Nhận xong là biên nhận, luôn hoàn tác được

Bấm nhận thì đề xuất **thu thành một dòng biên nhận tại chỗ**: «Đã đổi tên theo
Kara · Hoàn tác». Dòng này là chỗ hoàn tác chính; toast chỉ là phụ, có thể bỏ.

- Mọi đề xuất nhận được đều hoàn tác được — viết lại, căn chỉnh, thông tin liên hệ.
  Không có loại «nhận mà không lùi được».
- Mọi lần ghi theo đề xuất để lại vết «theo đề xuất của Kara» ở tab Vết của bản ghi.
- Bỏ qua hay bác thì cũng thu thành dòng («Đã bỏ qua»), mờ, không biến mất ngay.
- Số «N góp ý chờ» luôn đếm từ các đề xuất còn chờ, không lưu riêng.

## 7. Một bộ trạng thái

| Trạng thái | Thành phần | Chữ |
| --- | --- | --- |
| Đang làm | `ThinkingIndicator` | «Kara đang <động từ> <thứ>…» — «Kara đang đọc Mục tiêu này…» |
| Dưới 1 giây | không hiện gì | — |
| Không có gì để nói | `Empty` | «Kara không thấy chỗ nào cần sửa» + một câu vì sao |
| Lỗi | `Empty` hoặc dòng lỗi | «Kara chưa <làm gì> được» + «Thử lại»; không gợi ý dành cho lập trình viên |
| Tắt hay hết lượt | nút khoá + `FieldDescription` | nói khi nào mở lại |

Không dùng `Spinner` trần, `Shimmer` trần hay `Alert` đứng yên cho lúc Kara làm.

## 8. Trích dẫn và phản hồi

- Mọi chỗ Kara dẫn nguồn dùng `InlineCitation`: tóm tắt tuần, bản quản trị, tab
  bản ghi, Tài liệu.
- Mọi đầu ra dạng văn của Kara có phản hồi «Hữu ích / Không hữu ích» bằng một thành
  phần chung (lấy từ tóm tắt tuần), và lời cảm ơn nói điều gì sẽ xảy ra.

## 9. Giọng

- Tiếng Việt, mọi chữ qua `lib/messages`. Không chữ cứng trong tệp giao diện AI.
- Trong hội thoại Kara nói ngôi thứ nhất, câu trả lời trước, không «Tuyệt vời!».
- Ngoài hội thoại, câu tả việc: «Kara thấy KR này chưa có đích», không «Tôi thấy».

## 10. Ai giữ luật nào

| Luật | Thành phần trong `packages/ui` | Có chưa |
| --- | --- | --- |
| 2, 3 | dấu AI + nhãn Kara có ô «vì sao»: `KaraMark`, `KaraLabel` (`kara.tsx`) | có — lượt `nen-kara`; nút «Vì sao?» tự chặn nổi bọt khi nằm trong hàng bấm được |
| 5 | `ProposedChange` với `density`: `inline` (mặc định, thân `Item`) và `card` (thân `Confirmation`) | có — lượt `nen-kara` |
| 6 | dòng biên nhận có Hoàn tác: `ProposedChangeReceipt`, `ProposedChange` tự dùng khi `decided` có `onUndo` | có — lượt `nen-kara` |
| 7 | `ThinkingIndicator`; `KaraState` (năm trạng thái) và `KaraRetry` — nút «Thử lại» duy nhất, `outline` cỡ `sm`, không icon | có — `ThinkingIndicator` từ trước; `KaraState`, `KaraRetry` lượt `bo-xuong-kara` |
| 8 | `InlineCitation`; thành phần phản hồi `AiFeedback` (`ai-feedback.tsx`) | có; tóm tắt tuần đã dùng `AiFeedback` |
| 3, 5, 6, 7 | sáu khối dựng màn Kara (`kara/`): `KaraTranscript`, `KaraComposer`, `KaraSteps`, `KaraState`, `KaraProposal` (cùng `KaraProposalGroup` — nhãn một lần mỗi nhóm, nhận cả nhóm), `KaraArtifact`; `KaraBusy` là nguồn duy nhất của «Kara đang soạn» — khi bận đề xuất chưa quyết và «Hoàn tác» tự khoá | có — lượt `bo-xuong-kara`; chưa màn nào dùng trước 14/10 |

## 11. Kara ở đâu

Khi Kara và thứ Kara đang làm cùng hiện trên màn, Kara ở **cột phải**, còn vật phẩm (bản nháp, canvas, bản ghi) **mở
thêm về bên trái**. Cột Kara cố định bề ngang `--container-assist-rail`; vật phẩm rộng tối đa `--container-assist`.
Không thanh kéo đổi cỡ. Kara ở mép phải mọi màn để tay quen tìm tới; vật phẩm bên trái vì nó là thứ người quyết.

Hai ô là **một bề mặt**: chia bằng đúng một đường kẻ dọc, không thẻ có viền lồng bên trong khung, mỗi ô một dòng đầu
mảnh thẳng hàng (khuôn «dock» của ReUI `ai-chat-2`). Khung chưa có vật phẩm thì chỉ có cột Kara; vật phẩm tới thì
khung mở rộng sang trái mà Kara không dời. Dưới 1024 px hai ô thành hai tab; dưới 768 px khung phủ toàn màn.

Đang áp: Soạn OKR (khung bản ghi `?record=soan:<cuộc>`, lượt `soan-okr-trong-khung`). Khung deal chuyển tab Agent
thành cột Kara bên phải ở K5 `chat-deal-mot-khung`. Thành phần: `KaraDock` (`kara/dock.tsx`), `KaraArtifact
variant="docked"`, cỡ sheet `kara`.

## Lộ trình áp luật

| Lượt | Cỡ | Làm gì |
| --- | --- | --- |
| `nen-kara` | T2 | Dựng các thành phần còn thiếu ở mục 10 |
| `muc-tieu-va-kr` | T2 | Khung Mục tiêu–KR: một bảng `BangMucTieu` thay khối thẻ, chừa sáu điểm cắm cho Kara; đi trước `gop-y-dung-cho` |
| `gop-y-dung-cho` | T2 | Đã làm. Khu OKR: chip «Kara · N góp ý» trên hàng Mục tiêu (Của tôi, Theo đơn vị) và mặt lọc «Góp ý của Kara»; khung chi tiết có vùng Kara (nhãn, «Vì sao?», nhờ đọc), góp ý neo dưới KR qua điểm cắm `duoiKr`/`sauTenKr` của `okr/diem-cam.ts`, biên nhận có Hoàn tác, dấu «đổi theo Kara» sau tên KR; hai hộp Sửa bỏ cột góp ý, chỉ còn dòng dẫn sang khung |
| `tu-vung-tac-tu` | T2 | Phần `packages/ui` đã gộp vào `bo-xuong-kara`; phần màn (tên Kara và tiếng Việt trên tab bản ghi, Soạn OKR, Tài liệu, thông tin liên hệ có nhãn và hoàn tác) chuyển sang K4 `khung-ban-ghi-kara` và K6a `kara-mot-ten` |
| `bo-xuong-kara` | T2 | Sáu khối trong `packages/ui/src/components/kara/` và một nút «Thử lại»; ba điểm cắm cho Soạn OKR trang riêng (co giãn trong thanh kéo, khoá khi Kara đang soạn, nhận theo nhóm); chưa nối màn nào trước 14/10 |
| `soan-okr-trang-rieng` | T2 | K2 — Soạn OKR thành trang riêng `/okr/soan/<cuộc>`: hội thoại `KaraTranscript` + `KaraComposer` cạnh bản nháp `KaraArtifact` (hai ô co giãn từ 1024 px, hai tab dưới đó); dòng đề xuất inline với Thêm · Sửa · Bỏ qua · Hỏi Kara, nhận cả nhóm, biên nhận có Hoàn tác về lần nộp mới nhất; khoá khi Kara đang soạn; mốc mỗi lần nộp nối hai chiều với dòng đổi; dòng hệ thống báo quyết sẽ gửi kèm. Màn đầu tiên dùng cả sáu khối |
| `tac-tu-xin-duyet` | T3 | Tab bản ghi: công cụ ghi thành đề xuất |

Bản mẫu: `/proto/gop-y-dung-cho`.
