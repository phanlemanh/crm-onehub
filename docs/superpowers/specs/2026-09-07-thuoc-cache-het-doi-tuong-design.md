# Thước cache hết đối tượng — gỡ đúng, giữ đúng

> Hồ sơ nghiệm thu: `_acceptance/thuoc-cache-het-doi-tuong/`
> Vòng SỬA cho `lenh-chung-khong-an-cache-doi`, ký 07/09 rồi hỏng ngay khi hợp nhất.

## Chuyện đã xảy ra

Ngày 06/09 lúc **15:38**, chủ kho vá lỗ cache bằng một dòng:

```
6f581bb  fix(test): tắt đệm turbo cho task test — bài kiểm chạm DB
         theo lượt không được phát lại từ đệm
```

Lúc **~19:00** cùng ngày, tôi mở hồ sơ `lenh-chung-khong-an-cache-doi` **trên một
nhánh rẽ ra trước commit ấy**, đo cây dưới chân mình, thấy cache dối, và dựng cả một
vòng nghiệm thu cho một bài toán đã được giải — giải thẳng hơn: tắt hẳn đệm cho task
`test` thay vì ép `--force` ở ô cắm cổng.

Hợp nhất xong, hai chân cốt lõi của hồ sơ ấy **đỏ và không thể xanh lại**:

```
E3 cache-noi-that   moi 1/2 · khong doi 1/2 · da cham 1/2
                    DO: chieu duong sai — khong doi gi ma cache KHONG trung
E4 do-hanh-vi       DO: cap so KHONG doi khi trang thai cache doi
```

Chiều dương của AC-3 đòi *«không đổi gì thì cache phải trúng»*, mà `tasks.test.cache =
false` nghĩa là task ấy **không bao giờ trúng**. Tiền đề của tiêu chí đã biến mất.

## Đo trước khi thiết kế: có chỗ nào để nhắm lại không?

Ý đầu tiên là dời phép đo sang một task còn đệm. Đo thì không:

| task của `@crm/ui` | còn đệm | có đọc file ngoài gói |
| --- | --- | --- |
| `test` | **không** (`cache: false`) | có — nhưng không đệm thì không dối được |
| `check-types` | có | **không** — `tsconfig` chỉ `include: ["src"]` |
| `lint` · `build` | có | không |

Chạm `apps/app/components/agent-builder/chat-chips.tsx` rồi chạy
`turbo run check-types --filter=@crm/ui`: **2 cached, 2 total** — cache giữ nguyên, và
đó là **đúng**, vì task ấy thật sự không đọc file đó.

Kết luận đo được: **không còn task nào vừa đệm vừa đọc file ngoài gói.** AC-3 và AC-4
không có chỗ nhắm lại; chúng hết đối tượng.

Và hệ quả kèm theo: bản khai `inputs` tôi thêm vào `packages/ui/turbo.json` khai cho
task `test` — task không đệm — nên **nó không góp vào khoá nào cả**. Đồ chết.

## Thay hai tiêu chí hết đối tượng bằng MỘT bất biến mạnh hơn

Hai cách vá — `cache: false` của chủ kho và `--force` của tôi — là hai lời giải cho
cùng một câu. Vòng này viết câu ấy ra thành một bất biến, và đo nó:

> Mọi task mà một lệnh chứng của cổng chạy phải **hoặc** khai `cache: false`, **hoặc**
> được ép `--force`. Không có đường thứ ba.

Bất biến này sống sót cả hai cách vá, và nó chặn đúng ca đã xảy ra: ai đó bật lại đệm
cho `test` mà quên `--force`, hoặc thêm một suite mới quên cả hai.

## Lớp lỗi thứ hai, tổng quát hơn: bản khai vô tác dụng

`inputs` khai cho một task `cache: false` là một **bản khai không làm gì**. Nó trông
như một bảo đảm, đọc như một bảo đảm, và không bảo đảm gì. Cùng họ với những lớp lỗi
sáu vòng trước đã trả giá: thước xanh vì chưa bao giờ chạy.

Vòng này dựng một chân bắt lớp ấy: **mọi khai `inputs` trong bất kỳ `turbo.json` nào
phải nằm trên một task thật sự đệm.**

## Việc của vòng

1. Gỡ bản khai `inputs` chết khỏi `packages/ui/turbo.json`.
2. Gỡ AC-3 và AC-4 khỏi hồ sơ `lenh-chung-khong-an-cache-doi`, với tiền đề **đo được**
   chứ không khai suông, và ghi vào Known limits của hồ sơ ấy vì sao.
3. Dựng hai chân mới cho hai bất biến ở trên, mỗi chân một cặp hai chiều.
4. Chứng rằng sau vòng này, **mọi eval còn lại của hồ sơ ấy chạy lại xanh** trên cây
   hôm nay.

## Sẽ KHÔNG làm

- **Không vá lỗ re-pin của bộ kit.** Nghi thức re-pin chỉ chạy bốn lệnh chứng chứ không
  chạy lại eval của hồ sơ — chính vì thế mà bằng chứng hỏng lọt qua CI. Đó là lỗi của
  bộ kit; theo `CLAUDE.md` nó đi chip riêng sang `~/dev/acceptance-gate-kit`, không sửa
  tại chỗ.
- **Không bật lại đệm cho task `test`.** Cách vá của chủ kho đúng và triệt để hơn cách
  của tôi.
- **Không mở lại hợp đồng đã ký để viết lại tiêu chí.** Gỡ một tiêu chí hết đối tượng
  và khai lý do là đủ; viết lại lịch sử thì không.
