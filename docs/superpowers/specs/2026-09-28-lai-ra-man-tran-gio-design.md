# Trần giờ và cô lập cho thước lai-ra-man — design

Ngày 2026-09-28 · hồ sơ `_acceptance/lai-ra-man-tran-gio/` · T2 · chủ kho duyệt thiết kế trong phiên.

## Vấn đề

`packages/ui/test/lai-ra-man.spec.tsx` là thước của hồ sơ đã ký
`chan-lai-component-ra-man`. Ca «lai tung component ra man, doc chu ban ve that su ve»
mount từng component có giá trị mặc định là chữ, ở hai trạng thái đóng/mở, rồi bấm mọi nút.
Ca này chạy trên trần mặc định 5000 ms của bun.

Số đo 33 lượt CI gần nhất (`rang/bang-do-ci.json`, rút từ log `gh run view --log`):

| | ms |
| --- | --- |
| tại chỗ, Mac mini | ~1135 |
| CI xanh, nhanh nhất | 2812 |
| CI xanh, chậm nhất | 4996 |
| CI đỏ | 5000 · 5004 · ≥ 7469 |

3/33 lượt đỏ vì quá trần. Máy GitHub chậm hơn Mac 2,5–4,5 lần và chia hai cụm (~3 s và
~4,5–5 s). Ca «chuoi da va» cùng tệp chạy tới 2089 ms.

## Vì sao một ca quá hạn kéo đỏ ~22 ca khác

Đo trên bun 1.3.12 bằng một spec thử (scratchpad, không vào kho):

1. Test quá hạn **không bị huỷ**. Bun đánh dấu nó đỏ rồi chạy ca kế, nhưng promise của
   ca cũ vẫn chạy tiếp: vòng thử đủ 10/10 nhịp dù ca đã bị cắt ở nhịp 2.
2. `afterEach` vẫn chạy sau một ca quá hạn.
3. Vòng đã chết mà `throw` thì bun không báo thêm lỗi nào.

`ve()` mở đầu mỗi lần vẽ bằng `document.body.innerHTML = ""`. Vòng lái đã chết vì thế vẫn
xoá body giữa lúc các ca sau đang vẽ. Hệ quả: «chuoi da va den man» đỏ sau 203 ms, và 20 ca
render-diff đỏ với «bản vẽ không có chữ nào» hay «bấm rồi mà bản vẽ không lớn thêm» (run
36371259813 lượt 1). Root React không được `unmount` khi vẽ lỗi cũng là một chỗ rò, nhưng
không phải nguyên nhân chính.

Tái hiện tại chỗ: `bun test --timeout 400` trên spec → ca lái đỏ, «chuoi da va» đỏ sau
49 ms. Thứ tự tệp ở Mac đưa render-diff lên trước lai-ra-man, nên phần đổ sang tệp khác
chỉ thấy được trên CI.

## Thiết kế

1. **Trần tường minh.** Đặt `const TRAN_LAI_MS = 30_000` ở đầu spec, theo quy ước
   `TRAN_*_MS` của kho (`okr-chup-hieu-nang.integration.spec.ts`), và dùng làm tham số
   thứ ba cho cả ba `test(...)` (cả ba đều gọi `laiMotFile`). Trần này không phải ngân sách
   hiệu năng mà là cái chặn treo: 6 lần lượt xanh chậm nhất và 4 lần lượt đỏ chậm nhất đã
   thấy, chừa chỗ cho component được thêm dần. Luật máy kiểm: trần ≥ 4 × lượt xanh chậm
   nhất trong bảng đo.
2. **Tín hiệu dừng theo ca.**
   ```ts
   let luot = new AbortController();
   beforeEach(() => { luot.abort(); luot = new AbortController(); });
   afterEach(() => { luot.abort(); });
   ```
   Mỗi ca lấy `const tin = luot.signal` ở dòng đầu và truyền xuống `laiMotFile(…, tin)` →
   `ve(…, tin)` → `laiMoRa(tin)`. Hàm `conLuot(tin)` ném `Error` có tên (vòng lái đã hết
   lượt) trước khi xoá body, sau mỗi `await act(…)`, và trước mỗi cú bấm. Lỗi của `ve()` bắt
   được mà `tin.aborted` thì ném tiếp, nên vòng cũ thoát hẳn khỏi `for` và không đi tới
   `ghi(…)`.
3. **Root trong `finally`.** `unmount` vẫn nằm ở cuối đường thành công như cũ. Nếu đường đó
   chưa chạy tới thì `finally` tháo root, rồi mới trả lại `console.error`. Một component
   `unmount` lỗi vẫn ra đúng `loi` như trước, nên bản vẽ không đổi.

### Phương án đã loại

- **Tách vòng lái thành một test cho mỗi tệp component.** Mỗi ca sẽ nhỏ, nhưng thước của
  hồ sơ đã ký đổi hình dạng nhiều hơn: `ve-that.json` sẽ gom qua nhiều ca, tên ca đổi và có
  thêm ca. Nhu cầu dừng vòng khi một ca quá hạn vẫn còn nguyên, nên phương án này tốn công
  mà không bớt được việc nào.
- **Trần theo `process.env.CI`.** Kiểu `CI ? X : 5000`, như `tai-lieu-diff.spec.ts`. Cách
  này thêm một nhánh mà không thêm tín hiệu nào: trần chỉ để chặn treo, nên một số là đủ.
- **Chỉ nâng trần.** Lần CI chậm kế tiếp vẫn đổ dây chuyền sang 20 ca không liên quan.

## Đo

- Máy, lặp lại được, bản sao đặt cạnh spec rồi gọi đích danh (bun chạy tệp không mang đuôi
  `.spec` khi được gọi đích danh; bộ chạy `.dom.tsx` và glob mặc định đều không nhặt nó):
  - bản sao ép trần ca lái 300 ms → chỉ ca lái đỏ, hai ca sau xanh;
  - cùng bản sao, bỏ hai lời gọi `luot.abort()` → «chuoi da va» đỏ, thông điệp ghim.
- Bản vẽ không đổi: chạy spec ở `c895e5bf` (bản trước vòng này, lấy bằng `git show`) và spec
  mới trên CÙNG cây. `ve-that.json` và `mo-nguyen-ban.json` phải trùng từng byte; hai lượt
  liền nhau đã đo được là trùng. Chiều đỏ: bản sao bỏ `"button"` khỏi `NUT_LAI` → lệch.
- CI trước/sau: bảng 33 lượt là «trước». «Sau» gồm lượt CI của PR thật, cộng hai PR nháp
  «đo-thử — không merge» cùng ép trần ca lái 500 ms: một nhánh có bản vá (kỳ vọng chỉ ca lái
  đỏ), một nhánh là `onehub` chưa vá (kỳ vọng đổ dây chuyền). Sau khi đọc số thì đóng và xoá
  cả hai. Người chấm phần này.

## Ghim lại

Vòng này chạm thước của `chan-lai-component-ra-man`, nên ghim lại hồ sơ đó bằng làn eval ở
đỉnh nhánh, đi cuối cùng. Chạy `pre-merge-check.sh` không kèm `--slug` để thấy mọi hồ sơ hoá
cũ theo.
