---
schema_version: 1
slug: vao-bang-email-va-mat-khau
feature: Vào được CRM từ mạng đang chặn Google — đăng nhập bằng email và mật khẩu
owner: phanlemanh@gmail.com
stage: decided
decision: build
decided_by: Phan Le Manh
decided_at: 2026-09-18T17:09:59Z
prototype:
  base_commit:
  disposition: archive
---

## Vấn đề & ai gặp

Hôm nay CRM chỉ có ba cửa vào, và cả ba đều đòi người dùng đã có tài khoản ở
một nhà cung cấp khác: Google, Microsoft (chỉ khi đã khai khoá), và SSO của
công ty. Ai không có tài khoản đó — hoặc có mà từ chỗ đang đứng không với tới
được nhà cung cấp — thì không có cách nào vào, kể cả khi tên họ đã nằm trong
danh sách được vào.

Owner nêu ý ngày 2026-09-18: mở thêm luồng đăng nhập bằng email và mật khẩu.

**Hai lần đọc sai trước khi tới lý do thật — giữ lại làm sử liệu, đừng đọc như
kết luận.** Bản ghi đầu (18/09) hiểu câu "mấy bạn sale không dùng Google" thành
"họ không có tài khoản Google", rồi khép giả định 1 là có người bị chặn vì thiếu
tài khoản. Bản thứ hai (18/09) sửa quá tay sang "không ai bị chặn, đây chỉ là
cửa thứ hai", vì mọi người đều có Gmail thật. Cả hai đều trượt cùng một chỗ: hỏi
*ai có gì* thay vì *đứng ở đâu*. Lý do thật ở ngay dưới.

**Lý do thật, owner khai 2026-09-19: mạng chặn, không phải tài khoản thiếu.**
Nhân viên kinh doanh dùng Gmail cá nhân. Ở một số mạng nội bộ và mạng doanh
nghiệp khách hàng, Gmail và các dịch vụ Google không vào được. Đứng trong mạng
đó, cửa Google là cửa khoá: tài khoản có đủ, mà cú chuyển hướng đăng nhập không
đi tới đâu.

Nên **có người bị chặn thật** — chặn bởi mạng, không bởi thiếu tài khoản. Đây là
chỗ đau có thật, đo được, và không lối nào rẻ hơn gỡ được nó: cửa Microsoft cũng
là dịch vụ ngoài và cũng chết trong mạng chặn; Zalo cũng vậy. Chỉ cửa mật khẩu
là **không gọi ra ngoài một lần nào** — nó đi thẳng vào máy chủ của chính mình.

Máy kiểm chỗ này vì nếu sai thì tính năng dựng xong vẫn vô dụng: **ứng dụng
không nạp tài nguyên nào của Google lúc chạy.** Phông chữ khai qua
`next/font/google` (`apps/app/app/layout.tsx`) được tải về lúc dựng bản và phục
vụ từ máy chủ của mình; không tag manager, không analytics, không script ngoài.
Thứ duy nhất chạm Google lúc chạy đúng là cú chuyển hướng đăng nhập. Ghi chú:
đây là ràng buộc **lúc dựng bản**, nên máy dựng vẫn cần ra được Google — máy
dựng không nằm trong mạng bị chặn.

Một lối tắt cần loại ngay để khỏi bàn lại: **cái đau của người viết code đã
được giải rồi.** Lệnh `bun run dev:session <email>` tạo phiên đăng nhập tại
chỗ, không cần OAuth (`CLAUDE.md`, mục cách chứng minh nó chạy). Nên nếu lý do
mở cửa này là "đăng nhập lúc phát triển phiền quá", thì ô này chết ngay ở đây
và đó là kết quả tốt — tiết kiệm một vòng T3.

### Máy quét kho, ba phát hiện đổi hình bài toán

**① Bật là một dòng.** `packages/auth/src/auth.ts:81` đang ghi
`emailAndPassword: { enabled: false }`. Thư viện xác thực trong kho hỗ trợ sẵn
email + mật khẩu; hãng cố ý tắt. Phần "cho phép" gần như không tốn gì.

**② Cái cổng đã có sẵn, và nó đúng chỗ.** Luật chặn người lạ nằm ở
`databaseHooks.user.create.before` (`packages/auth/src/auth.ts:263`) — tức ở
lúc **tạo người dùng**, không nằm trong từng nhà cung cấp. Nghĩa là cửa mật
khẩu thừa hưởng nguyên danh sách được vào mà không phải viết lại luật nào. Đây
là tin tốt hiếm: thường mở cửa mới là mở luôn một lỗ.

**③ Kho KHÔNG gửi được thư ra ngoài — một dòng nào cũng không.** Quét toàn bộ
`apps/` và `packages/`: không có `nodemailer`, không `resend`, không SMTP,
không một biến môi trường nào về thư trong `.env.example`. Lời mời hôm nay
không đi bằng thư — nó là một hàng trong bảng danh sách được vào, rồi người đó
tự bấm nút Google.

Phát hiện ③ mới là bài toán thật. Mật khẩu không phải một tính năng, nó là
**hai đường đi của một bí mật**: mật khẩu đầu tiên tới tay người dùng bằng
đường nào, và người quên mật khẩu lấy lại bằng đường nào. Cả hai, theo lệ
thường, đi bằng thư. Kho này chưa gửi được thư. Bật cờ ở ① mà bỏ qua ③ là dựng
một cửa vào không có chìa dự phòng: người đầu tiên quên mật khẩu sẽ phải nhờ
người có quyền mở cơ sở dữ liệu ra sửa tay.

Nên ô này **không phải "bật đăng nhập mật khẩu"**. Nó là: *chọn đường đi cho
mật khẩu, trong một sản phẩm chưa gửi được thư.*

## Giả định chốt sinh tử

| # | Giả định | Nếu sai thì | Phép thử rẻ nhất | Trạng thái |
|---|---|---|---|---|
| 1 | Có người thật, kể được tên, đang không vào được CRM vì không có hoặc không dùng được tài khoản Google | Ô này là tiện nghi chứ không phải cửa; hạ ưu tiên, khỏi tốn một vòng T3 | Owner kể một người và ngày họ bị chặn. Không cần dựng gì | **Đã khép 2026-09-18 — giả định SAI**: mọi người đều có Gmail, không ai bị chặn |
| 2 | Trao mật khẩu đầu tiên bằng tay (người quản trị đặt, đưa tận nơi hoặc qua Zalo) là chấp nhận được với đội | Phải dựng năng lực gửi thư TRƯỚC; ô này thành ô con của ô đó, không làm được một mình | Hỏi owner một câu: đội chấp nhận admin đọc mật khẩu tạm cho người dùng không? | Chưa thử |
| 3 | Quên mật khẩu là ca sẽ xảy ra và cần đường tự phục vụ | Phạm vi nhỏ hơn hẳn: admin đặt lại tay là đủ, không cần thư, không cần trang quên-mật-khẩu | Đếm đầu người sẽ dùng cửa này. Dưới mười người thì đặt lại tay là đủ | Chưa thử |
| 4 | Danh sách được vào chặn đúng cả cửa mới | Mở cửa này là mở lỗ cho người ngoài tự đăng ký | Bật cờ ở máy tại chỗ, thử đăng ký bằng một địa chỉ ngoài danh sách, phải bị từ chối | Chưa thử — căn cứ đã mạnh (phát hiện ②), phép thử chỉ để xác nhận |
| 5 | Mở mật khẩu không kéo theo rủi ro dò mật khẩu hàng loạt vượt mức chịu được | Cần thêm chặn tần suất, khoá tài khoản, hoặc xác thực hai bước — phạm vi phình | Thư viện đã bật giới hạn tần suất lưu ở cơ sở dữ liệu (`auth.ts`, mục `rateLimit`); đọc lại ngưỡng mặc định, đo một lượt thử sai liên tiếp | Chưa thử |
| 6 | Người đã vào bằng Google, nay đặt thêm mật khẩu cùng địa chỉ, vẫn là MỘT người | Sinh hai tài khoản cùng email, thoả thuận và khách hàng chia đôi | Kho đang cho nối tài khoản với Google và Microsoft (`accountLinking.trustedProviders`); thử tại chỗ một địa chỉ đi cả hai cửa | Chưa thử |
| 7 | Mấy bạn sale cũng KHÔNG có tài khoản Microsoft nào — kể cả Outlook, Hotmail, Live cá nhân | Ô này chết trước khi dựng, và đó là kết quả tốt nhất có thể: cửa Microsoft đã nằm sẵn trong kho, bật bằng hai khoá trong `.env`, không code, không vòng T3, không bí mật nào phải trao tay | Hỏi một bạn sale đúng một câu: có bao giờ đăng nhập Outlook hay Hotmail chưa | **Đã khép 2026-09-18 — không còn liên quan**: cửa Google đã chạy được cho tất cả |
| 8 | Có người thật sẽ CHỌN cửa mật khẩu trong khi cửa Google vẫn mở ngay bên cạnh | Dựng một cửa không ai đi | **Đã khép 2026-09-19** — owner: trong mạng chặn Google thì cửa kia không mở, người không có lựa chọn nào khác | Đã khép |
| 9 | Mạng doanh nghiệp đó chặn Google nhưng KHÔNG chặn chính CRM | Cửa mật khẩu cũng vô dụng: người không mở nổi trang đăng nhập thì cửa nào cũng thế. Ô này chết, và việc thật là bài toán đường mạng chứ không phải đăng nhập | Đứng trong đúng mạng đó, mở trang đăng nhập của CRM. Trang hiện ra = ứng dụng tới được, chỉ nút Google chết. Trang không hiện = chặn cả CRM | Chưa thử — **rẻ nhất, không cần dựng gì, phải đi TRƯỚC** |

Giả định 1, 7, 8 đã khép. Giả định 9 nay là giả định duy nhất còn giết được ô
này mà không tốn ngày công nào — mở một trang từ đúng mạng đó là xong. Giả định
2 quyết hình dạng vòng, và nó không phải câu hỏi kỹ thuật.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: Đứng trong mạng doanh nghiệp đang chặn Google, người trong danh sách có vào được CRM và làm được việc không — và có vào lại được sau khi quên mật khẩu không?
- Kết quả nào là SỐNG: Thử từ ÍT NHẤT MỘT mạng thật đang chặn Google: nhân viên kinh doanh đăng nhập bằng mật khẩu vào được, mở được thoả thuận và danh bạ, hết phiên vào lại được. VÀ bốn tuần sau khi bật, không ai phải nhờ mở cơ sở dữ liệu để vào lại.
- Kết quả nào là CHẾT: Từ mạng đó vẫn không vào được vì một lý do khác Google chặn (giả định 9) — khi đó việc thật nằm ở đường mạng, không ở đăng nhập; HOẶC có người bị khoá ngoài phải nhờ mở cơ sở dữ liệu mới vào lại; HOẶC một địa chỉ ngoài danh sách lọt qua cửa mới, dù chỉ một lần.
- Timebox: Hai ngày công cho lối trao tay (lối A dưới đây). Quá hai ngày nghĩa là đang dựng năng lực gửi thư — mà đó là ô riêng, không phải ô này.

Căn cứ: ngưỡng SỐNG đo **ở đúng nơi chỗ đau xảy ra** — trong mạng chặn Google —
chứ không đo bằng số người dùng cửa mới. Đếm người là thước sai ở đây: ngoài
mạng chặn thì ai bấm Google cũng được, con số đó không nói gì về việc ô này có
gỡ được chỗ tắc hay không.

Vế "mở được thoả thuận và danh bạ" nằm trong ngưỡng SỐNG có chủ ý: vào được màn
đăng nhập rồi kẹt ở màn sau vẫn là không vào được, và đó là ca dễ bỏ sót nhất
khi đo bằng tay.

Bản ngưỡng trước (đếm người chọn cửa mới, mốc một nửa và một phần tư) viết khi
chưa biết lý do thật, đã bỏ ngày 2026-09-19.

Ngưỡng CHẾT giữ vế "lọt một lần" vì đây là T3 chạm xác thực: một lần lọt là một
lần quá nhiều, không có mức chấp nhận được.

## Kết quả prototype

Chưa dựng gì.

## Nguồn ngoài & phạm vi kế thừa

| Món vật liệu | Nguồn | Phân loại | Kế thừa? | Người ký |
|---|---|---|---|---|
| Luồng email + mật khẩu (băm mật khẩu, phiên, đặt lại) | thư viện xác thực đã có trong kho, đang tắt ở `packages/auth/src/auth.ts:81` | triết-lý/logic | có — không tự viết lại phần băm mật khẩu | — |
| Quyết định của hãng: để `emailAndPassword` ở trạng thái tắt | kho hãng `trycompai/crm` | triết-lý/logic | **không** — bật lên là một chỗ rẽ khỏi hãng, phải ghi vào phí bản rẽ | cần ký ở Cổng Đáng |
| Màn đăng nhập hiện có | `apps/app/app/(landing)/sign-in/` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng, ô mật khẩu ghép vào màn đang có | — |
| Luật giao diện của kho | `docs/design.md` | ngôn-ngữ-thiết-kế/hình-thái | có — chuẩn của kho thắng | — |

## Cổng 0

- **decision = build** (owner Phan Le Manh, 2026-09-19). Căn cứ: có người bị
  chặn thật — nhân viên kinh doanh đứng trong mạng nội bộ hoặc mạng doanh nghiệp
  khách hàng, nơi Google không vào được. Mọi cửa dựa vào dịch vụ ngoài đều chết
  trong mạng đó; chỉ cửa mật khẩu không gọi ra ngoài lần nào.
- **disposition = archive.** Căn cứ: không có prototype nào được dựng, nên
  `keep` là bất khả. Đây là dữ kiện, không phải lựa chọn.
- **Ngưỡng UAT chốt cùng lúc ký:** bốn dòng ở mục Ngưỡng, **owner chốt
  2026-09-19** — bản viết lại sau khi biết lý do thật (mạng chặn, không phải
  tài khoản thiếu). Bản đếm-người-dùng-cửa-mới đã bỏ cùng ngày.

**Câu phải quyết cùng lúc ký — mật khẩu đi đường nào:**

- **Lối 0 — không dựng gì.** Cửa Google đang chạy được cho tất cả, nên giữ
  nguyên là một lối thật và là lối rẻ nhất. **Owner đã bỏ lối này**, nêu lại ý
  muốn hai lần ngày 2026-09-18. Ghi ở đây để lần đọc sau biết nó đã được cân
  nhắc và bị loại có chủ ý, không phải bị bỏ sót.
- **Lối A — trao tay, không cần thư.** Người quản trị tạo tài khoản kèm mật
  khẩu tạm, đưa tận nơi; người dùng đổi ở lần đăng nhập đầu. Quên mật khẩu thì
  admin đặt lại. Rẻ, hợp đội nhỏ nội bộ, không thêm phụ thuộc nào. Giá phải
  trả: admin thành điểm nghẽn, và admin nhìn thấy mật khẩu tạm.
- **Lối B — dựng năng lực gửi thư trước.** Thư mời, thư đặt lại mật khẩu, tự
  phục vụ hoàn toàn. Giá phải trả: thêm một nhà cung cấp thư, thêm biến môi
  trường, thêm tên miền và bản ghi DNS, thêm bài toán thư vào hòm rác — **đây
  là một ô cơ hội riêng, không phải một phần của ô này.**

Lối B nuốt lối A; mở ô này bằng lối B là mở hai ô cùng lúc và mất timebox.

## Thước đo thành công → ứng viên criterion

- Số ca "không vào được" phải nhờ người mở cơ sở dữ liệu — mục tiêu 0; đếm tay
  được ngay, không cần nguồn sinh mới.
- Số lần "không vào được vì mạng chặn Google" sau khi bật — mục tiêu 0; đếm tay
  từ lời báo của đội, không cần nguồn sinh mới.
- Số người đã đặt mật khẩu, và số lượt vào bằng cửa mật khẩu trong 30 ngày —
  đếm thẳng trên bảng `account` (`providerId`, `password`); **không cần thêm sự
  kiện đo nào**. Thước phụ: nó nói cửa có được dùng thật không, nhưng không nói
  chỗ tắc đã gỡ chưa.
- Khoảng cách từ lúc được mời tới lần đăng nhập đầu tiên — đo được từ bảng danh
  sách được vào và bảng phiên.

## Out of scope từ khám phá

- **Gửi thư ra ngoài** — thư mời, thư đặt lại mật khẩu. Kho chưa có một dòng
  nào; nếu đội cần thì mở ô riêng, không nhét vào đây.
- **Tự đăng ký cho người ngoài danh sách.** Cửa vẫn là danh sách được vào; ô
  này chỉ thêm một cách gõ cửa, không đổi luật ai được vào.
- **Xác thực hai bước.** Chưa bàn ở vòng này; nếu giả định 5 đỏ thì mở ô riêng.
- **Đổi cách đăng nhập của người đang dùng Google.** Họ giữ nguyên cửa cũ, không
  ai bị buộc đặt mật khẩu; cửa Google KHÔNG bị gỡ.
- **Đăng nhập bằng Zalo.** Mọi người đều dùng Zalo, nên đây là lối đáng cân nhắc
  riêng — nhưng nó là dựng thêm một nhà cung cấp ngoài, đắt hơn hẳn việc bật một
  cờ đã có, và nó không gỡ được chỗ đau "treo vào nhà cung cấp ngoài". Ô riêng.
