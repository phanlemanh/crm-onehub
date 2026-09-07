# Ổ cắm phải giải ra một lệnh chạy được

> Hồ sơ nghiệm thu: `_acceptance/o-cam-chay-duoc-that/`
> Hạng **T2** — chạm `_acceptance/config.yaml` và thêm chân đo.

## Lỗi, nói gọn

`_acceptance/config.yaml` có **hai trình đọc**, và chúng không đồng ý với nhau.

Bộ kit đọc bằng `resolveConfigKey` trong `lib/evidence-core.cjs` — **theo dòng, cố
ý không dùng thư viện YAML**, đúng như chú thích trong đó viết. Luật của nó gọn
đến mức nguy hiểm:

```js
m[2].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '')
```

Nó cắt mọi thứ sau ` #`, và **bóc đúng MỘT ngoặc ở mỗi đầu**.

Nên một giá trị viết thế này:

```yaml
go_khoa_api: bun run test -- "cd apps/api && bun test test/campaigns.spec.ts"
```

bị bóc mất dấu `"` cuối, và bộ kit giải ra:

```
bun run test -- "cd apps/api && bun test test/campaigns.spec.ts
```

Chạy nó lên: `bash: unexpected EOF while looking for matching '"'`.

## Đã đo, không suy

Gọi **chính hàm của bộ kit** trên 227 ổ cắm, rồi đưa từng lệnh qua `bash -n`:

| Số đo | Giá trị |
| --- | --- |
| ổ cắm giải được | 227 |
| giải ra lệnh **không hợp lệ cú pháp bash** | **16** |
| trong 16: giá trị không chứa dấu nháy đơn | 11 |
| trong 16: giá trị CÓ chứa dấu nháy đơn | 5 |
| dòng làm cả file không parse được bằng YAML thật | 2 |

Chứng bằng cặp hai chiều trên cùng một vật: lệnh bộ kit giải ra → lỗi cú pháp;
cùng lệnh ấy có đủ ngoặc cuối → chạy và xanh.

Hai dòng làm gãy YAML là `apr_lech_noi_dung` và `apr_lech_noi_dung_do`: giá trị
không đặt trong ngoặc mà chứa `: ` (trong `if: github.repository`), nên trình đọc
YAML coi đó là một cặp khoá mới. Hậu quả đã đo: hai chân đo của hồ sơ **đã ký**
`lenh-dung-do-khong-ai-thay` dùng `Bun.YAML.parse` và nay **crash**.

## Cách sửa — hai hình dạng, chọn theo nội dung giá trị

**Hình dạng A — bọc nháy đơn (11 ổ cắm).** Giá trị không chứa nháy đơn nào bên
trong, nên bọc cả giá trị trong `'…'` là đủ cho **cả hai** trình đọc:

- YAML đọc scalar nháy đơn → trả đúng chuỗi bên trong.
- Bộ kit bóc một `'` đầu và một `'` cuối → trả đúng chuỗi ấy.

**Hình dạng B — đưa lệnh vào file script (5 ổ cắm).** Giá trị chứa cả `"` lẫn `'`
nên không bọc được: bọc nháy đơn thì phải nhân đôi `'` bên trong, bọc nháy kép thì
phải thoát `"` bên trong — và bộ kit chỉ bóc **một** ngoặc chứ không hiểu thoát
nào cả. Đường duy nhất là làm giá trị **không còn ngoặc và không còn `: `**, tức
đưa thân lệnh vào một file `.sh` cạnh hồ sơ sở hữu nó, đúng khuôn mọi ổ cắm khác
của kho.

**Khoá ổ cắm KHÔNG đổi.** Mười sáu khoá ấy đang bị các `evidence-report.md` đã ký
trích ở dòng `verifier:`; đổi khoá là làm `recheck-evidence` của hồ sơ đã ký đỏ.
Chỉ giá trị đổi.

## Cái giá, nói thẳng

Vòng này sửa giá trị ổ cắm thuộc **năm hồ sơ khác**, trong đó có hồ sơ đã ký. Đó
là điều bình thường với một file cấu hình dùng chung, nhưng phải nói ra: sau vòng
này, chạy lại phép đo của các hồ sơ ấy sẽ chạy một chuỗi lệnh **khác chuỗi đã
chạy lúc ký** — khác ở chỗ nó chạy được, thay vì đổ ở dòng đầu.

## Sẽ KHÔNG làm

- **Không đổi khoá ổ cắm nào** — chữ ký đã trích chúng.
- **Không sửa `resolveConfigKey` của bộ kit.** Lỗi của bộ kit đi chip riêng sang
  `~/dev/acceptance-gate-kit` theo `CLAUDE.md`; vòng này sửa dữ liệu ở kho này cho
  vừa trình đọc đang có.
- **Không đổi ý nghĩa lệnh nào** — chỉ đổi cách nó được viết ra.
- **Không đụng bảy ổ cắm chết** đã gỡ ở lượt dọn trước.

## Gửi ngược lên hãng

Không có gì gửi hãng: đây là file của bản rẽ. Nhưng `resolveConfigKey` bóc một
ngoặc mà không hiểu thoát là một lỗ của **bộ kit** — mở chip riêng sang kho kit.
